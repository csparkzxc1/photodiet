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
    // Linear color space so Laplacian math is physically meaningful and
    // negative values aren't clamped during render.
    let colorSpace = CGColorSpace(name: CGColorSpace.linearSRGB)
      ?? CGColorSpaceCreateDeviceRGB()
    let context = CIContext(options: [
      .workingColorSpace: colorSpace,
      .outputColorSpace: colorSpace,
    ])

    let kernel: [CGFloat] = [0, 1, 0, 1, -4, 1, 0, 1, 0]
    let weights = kernel.withUnsafeBufferPointer { buf -> CIVector in
      return CIVector(values: buf.baseAddress!, count: kernel.count)
    }
    guard let conv = CIFilter(name: "CIConvolution3X3", parameters: [
      kCIInputImageKey: ci,
      "inputWeights": weights,
      "inputBias": NSNumber(value: 0.0),
    ])?.outputImage else { return 0 }

    let extent = ci.extent
    let width = Int(extent.width)
    let height = Int(extent.height)
    if width == 0 || height == 0 { return 0 }
    let totalPixels = width * height

    // 32-bit float per channel × 4 channels = 16 bytes/pixel.
    let bytesPerPixel = 16
    let bytesPerRow = width * bytesPerPixel
    let bufferSize = totalPixels * bytesPerPixel

    let buffer = UnsafeMutableRawPointer.allocate(byteCount: bufferSize, alignment: 16)
    defer { buffer.deallocate() }

    context.render(
      conv,
      toBitmap: buffer,
      rowBytes: bytesPerRow,
      bounds: extent,
      format: .RGBAf,
      colorSpace: colorSpace
    )

    let pixels = buffer.bindMemory(to: Float32.self, capacity: totalPixels * 4)

    // Variance of luminance (negatives preserved in float).
    var sum: Double = 0
    var sumSq: Double = 0
    for i in 0..<totalPixels {
      let r = Double(pixels[i * 4])
      let g = Double(pixels[i * 4 + 1])
      let b = Double(pixels[i * 4 + 2])
      let lum = 0.299 * r + 0.587 * g + 0.114 * b
      sum += lum
      sumSq += lum * lum
    }
    let n = Double(totalPixels)
    let mean = sum / n
    let variance = (sumSq / n) - (mean * mean)

    // Linear-RGB Laplacian variance is in (0, ~0.01). Scale to roughly
    // match an 8-bit-scale variance (~0-1000) so existing scoring works.
    return variance * 65025
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
