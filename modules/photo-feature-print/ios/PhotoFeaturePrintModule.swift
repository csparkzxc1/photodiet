import ExpoModulesCore
import Photos
import Vision
import CoreImage
import UIKit

public class PhotoFeaturePrintModule: Module {
  public func definition() -> ModuleDefinition {
    Name("PhotoFeaturePrint")

    AsyncFunction("analyzeAsset") { (assetId: String) -> [String: Any] in
      return try await Self.analyze(assetId: assetId)
    }

    AsyncFunction("analyzeAssets") { (assetIds: [String]) -> [[String: Any]] in
      var results: [[String: Any]] = []
      results.reserveCapacity(assetIds.count)
      for id in assetIds {
        do {
          let r = try await Self.analyze(assetId: id)
          results.append(r)
        } catch {
          results.append([
            "asset_id": id,
            "error": "\(error.localizedDescription)"
          ])
        }
      }
      return results
    }

    AsyncFunction("computeDistance") { (a: String, b: String) -> Double in
      guard
        let dataA = Data(base64Encoded: a),
        let dataB = Data(base64Encoded: b)
      else { return 2.0 }
      guard
        let obsA = try? NSKeyedUnarchiver.unarchivedObject(ofClass: VNFeaturePrintObservation.self, from: dataA),
        let obsB = try? NSKeyedUnarchiver.unarchivedObject(ofClass: VNFeaturePrintObservation.self, from: dataB)
      else { return 2.0 }
      var distance: Float = 0
      try obsA.computeDistance(&distance, to: obsB)
      return Double(distance)
    }
  }

  static func analyze(assetId: String) async throws -> [String: Any] {
    let start = Date()
    guard let asset = PHAsset.fetchAssets(withLocalIdentifiers: [assetId], options: nil).firstObject else {
      throw NSError(domain: "PhotoFeaturePrint", code: 404, userInfo: [NSLocalizedDescriptionKey: "asset not found"])
    }
    let image = try await loadImage(for: asset)
    guard let cg = image.cgImage else {
      throw NSError(domain: "PhotoFeaturePrint", code: 500, userInfo: [NSLocalizedDescriptionKey: "no CGImage"])
    }

    let embedding = try featurePrint(cg)
    let blur = laplacianVariance(cg)
    let (faceCount, eyesOpen) = facesAndEyes(cg)

    return [
      "embedding": embedding,
      "blur_score": blur,
      "face_count": faceCount,
      "eyes_open_ratio": eyesOpen,
      "width": Int(cg.width),
      "height": Int(cg.height),
      "duration_ms": Int(Date().timeIntervalSince(start) * 1000.0),
    ]
  }

  static func loadImage(for asset: PHAsset) async throws -> UIImage {
    let manager = PHImageManager.default()
    let opts = PHImageRequestOptions()
    opts.deliveryMode = .highQualityFormat
    opts.isNetworkAccessAllowed = false
    opts.resizeMode = .fast
    opts.isSynchronous = false

    return try await withCheckedThrowingContinuation { cont in
      manager.requestImage(
        for: asset,
        targetSize: CGSize(width: 1024, height: 1024),
        contentMode: .aspectFit,
        options: opts
      ) { image, info in
        if let degraded = info?[PHImageResultIsDegradedKey] as? Bool, degraded { return }
        if let err = info?[PHImageErrorKey] as? Error {
          cont.resume(throwing: err)
          return
        }
        if let image = image {
          cont.resume(returning: image)
        } else {
          cont.resume(throwing: NSError(domain: "PhotoFeaturePrint", code: 500, userInfo: [NSLocalizedDescriptionKey: "no image"]))
        }
      }
    }
  }

  static func featurePrint(_ cg: CGImage) throws -> String {
    let request = VNGenerateImageFeaturePrintRequest()
    request.imageCropAndScaleOption = .scaleFill

    // iOS 17+: force CPU device when default (ANE) fails.
    // Workaround for "Failed to create espresso context" on iOS 18.
    if #available(iOS 17.0, *) {
      if let stageDevices = try? request.supportedComputeStageDevices {
        let allDevices = stageDevices.flatMap { $0.value }
        // Prefer CPU as a safe fallback; ANE/GPU may fail to init espresso context.
        let cpu = allDevices.first { dev in
          if case .cpu = dev { return true }
          return false
        }
        if let cpu = cpu {
          request.setComputeDevice(cpu, for: .main)
        }
      }
    }

    let handler = VNImageRequestHandler(cgImage: cg, options: [:])
    try handler.perform([request])
    guard let obs = request.results?.first as? VNFeaturePrintObservation else {
      return ""
    }
    let data = try NSKeyedArchiver.archivedData(withRootObject: obs, requiringSecureCoding: true)
    return data.base64EncodedString()
  }

  static func laplacianVariance(_ cg: CGImage) -> Double {
    let ci = CIImage(cgImage: cg)
    let context = CIContext(options: nil)
    let kernel: [CGFloat] = [0, 1, 0, 1, -4, 1, 0, 1, 0]
    let weights = kernel.withUnsafeBufferPointer { buf -> CIVector in
      return CIVector(values: buf.baseAddress!, count: kernel.count)
    }
    guard let conv = CIFilter(name: "CIConvolution3X3", parameters: [
      kCIInputImageKey: ci,
      "inputWeights": weights,
      "inputBias": NSNumber(value: 0.0),
    ])?.outputImage else { return 0 }

    // Render to greyscale bitmap, then compute variance.
    let extent = ci.extent
    let width = Int(extent.width)
    let height = Int(extent.height)
    if width == 0 || height == 0 { return 0 }
    let totalPixels = width * height
    let bytesPerRow = width * 4
    var raw = [UInt8](repeating: 0, count: totalPixels * 4)
    let colorSpace = CGColorSpaceCreateDeviceRGB()
    guard let ctx = CGContext(
      data: &raw,
      width: width,
      height: height,
      bitsPerComponent: 8,
      bytesPerRow: bytesPerRow,
      space: colorSpace,
      bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
    ) else { return 0 }
    guard let rendered = context.createCGImage(conv, from: extent) else { return 0 }
    ctx.draw(rendered, in: CGRect(x: 0, y: 0, width: width, height: height))

    var mean: Double = 0
    var n: Double = 0
    for i in 0..<totalPixels {
      let r = Double(raw[i * 4])
      let g = Double(raw[i * 4 + 1])
      let b = Double(raw[i * 4 + 2])
      let lum = 0.299 * r + 0.587 * g + 0.114 * b
      mean += lum
      n += 1
    }
    if n == 0 { return 0 }
    mean /= n

    var variance: Double = 0
    for i in 0..<totalPixels {
      let r = Double(raw[i * 4])
      let g = Double(raw[i * 4 + 1])
      let b = Double(raw[i * 4 + 2])
      let lum = 0.299 * r + 0.587 * g + 0.114 * b
      let d = lum - mean
      variance += d * d
    }
    variance /= n
    return variance
  }

  static func facesAndEyes(_ cg: CGImage) -> (Int, Double) {
    let request = VNDetectFaceLandmarksRequest()
    let handler = VNImageRequestHandler(cgImage: cg, options: [:])
    do {
      try handler.perform([request])
    } catch {
      return (0, 0)
    }
    guard let faces = request.results, !faces.isEmpty else {
      return (0, 0)
    }
    var openCount = 0
    for face in faces {
      let leftOpen = isEyeOpen(face.landmarks?.leftEye)
      let rightOpen = isEyeOpen(face.landmarks?.rightEye)
      if leftOpen && rightOpen { openCount += 1 }
    }
    return (faces.count, Double(openCount) / Double(faces.count))
  }

  static func isEyeOpen(_ region: VNFaceLandmarkRegion2D?) -> Bool {
    guard let r = region, r.pointCount >= 6 else { return true }
    let pts = r.normalizedPoints
    let xs = pts.map { $0.x }
    let ys = pts.map { $0.y }
    let w = (xs.max() ?? 0) - (xs.min() ?? 0)
    let h = (ys.max() ?? 0) - (ys.min() ?? 0)
    if w == 0 { return false }
    return (h / w) > 0.18
  }
}
