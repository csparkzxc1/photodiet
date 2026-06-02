# 빌드 검증 가이드 (Mac + Xcode)

이 문서는 MacBook(M5) + Xcode 26.5 환경에서 사진다이어트 빌드를 처음부터 검증하는 절차입니다.

## 0. 사전 요구

- macOS 14+
- Xcode 16+ (CommandLineTools 포함)
- Node.js ≥ 22
- CocoaPods (`brew install cocoapods` 또는 `gem install cocoapods`)

```bash
xcode-select --install   # 한 번만
xcodebuild -version
node --version            # v22+
pod --version
```

## 1. 클론 + 의존성

```bash
git clone <repo>
cd photodiet
git checkout claude/photodiet-mvp-build-g7o5s
npm install               # 로컬 모듈(file:./modules/photo-feature-print) 자동 링크
```

## 2. 폰트 (커밋되어 있으면 skip)

```bash
ls assets/fonts/Pretendard-*.otf   # 4개 보이면 OK
# 없으면:
npm run setup:fonts
```

## 3. 환경 변수

```bash
cp .env.example .env
# .env에 SENTRY_DISABLE_AUTO_UPLOAD=true가 들어있는지 확인.
# 이걸 안 켜면 Sentry org 인증이 없을 때 iOS 빌드의 마지막 단계가 실패합니다.
```

## 4. Prebuild + iOS 네이티브 생성

```bash
npx expo prebuild --platform ios --clean
# 끝나면 ios/ 폴더 생성됨. pod install 자동 실행.
```

**검증 포인트:**
- `ios/Podfile.lock`에 `PhotoFeaturePrint`가 나오는지 확인:
  ```bash
  grep PhotoFeaturePrint ios/Podfile.lock
  ```
- 안 보이면 autolinking 실패. `npx expo-modules-autolinking resolve --platform ios --json | jq '.modules[] | .packageName'`로 확인.

## 5. 시뮬레이터 실행

```bash
npx expo run:ios
# 또는 특정 시뮬레이터: npx expo run:ios --device "iPhone 16 Pro"
```

**기대 결과 (콘솔 로그):**
```
[info][db.migrations] applying migration 1: initial_schema
[info][db.client] database initialized
```

**앱 첫 진입:**
- 온보딩 6단계: welcome → value → solution → privacy → price → permission
- 권한 허용 → 자동으로 `/modal/scan-progress`로 이동
- 사진첩 인덱싱 → 분석 → 클러스터링 단계별 progress
- 완료 후 `/(tabs)/`로 이동

## 6. Phase별 완료 기준 검증

### Phase B (인덱싱)
- 사진 1000장 디바이스 기준 인덱싱 30초 이내
- DB 확인: 시뮬레이터에서 SQLite 파일 위치는 `~/Library/Developer/CoreSimulator/Devices/<UUID>/data/Containers/Data/Application/<UUID>/Documents/SQLite/photodiet.db`
  ```bash
  sqlite3 <path> "SELECT COUNT(*) FROM photos"
  ```

### Phase C (분석 + 클러스터링)
- 200장 → 30~50개 그룹 (spec §빌드 Phase C 완료 기준)
- 결정론: 동일 입력에 동일 결과
  ```bash
  npm test   # node:test 케이스가 자동 검증
  ```
- 임계값 튜닝: `src/services/clustering.ts`의 `similarityThreshold: 0.35`가 사진첩 특성에 맞는지 확인

### Phase D (UI)
- 홈 GB 히어로 숫자가 실제 file_size 합과 일치하는지
  ```sql
  SELECT
    g.id,
    COUNT(p.id) - 1 AS removable,
    SUM(CASE WHEN p.id != g.best_photo_id THEN p.file_size ELSE 0 END) AS bytes
  FROM groups g JOIN photos p ON p.group_id = g.id
  WHERE g.resolved = 0
  GROUP BY g.id;
  ```

### Phase E (삭제 + 통계)
- 그룹 상세에서 "베스트만 남기기" → 시스템 다이얼로그 → 사진앱 휴지통(30일)에 들어가는지
- reward 토스트 표시
- `(tabs)/stats`에서 누적 + 일별 그래프 반영
- `cleanup_logs` 테이블에 row 추가됐는지

### Phase F (결제)
- 5그룹 정리 후 6번째 시도 시 paywall로 redirect
- RevenueCat sandbox 결제 흐름 (TestFlight 또는 simulator의 sandbox tester 계정)

## 7. 알려진 함정

- **사진첩 전체 접근 권한이 아니면 인덱싱이 부정확**: 시뮬레이터에서 권한 다이얼로그가 "선택한 사진만" / "전체"로 나오면 무조건 전체.
- **iOS 시뮬레이터에는 기본 사진이 거의 없음**: Settings 앱 > Photos에서 샘플 사진 import하거나, 실제 디바이스 사용 권장.
- **첫 번째 권한 거부 후 재요청 안 됨**: 시뮬레이터에서 앱 삭제 후 재설치하거나 Device > Erase All Content.
- **HEIC 디코딩 실패**: VNGenerateImageFeaturePrintRequest는 HEIC도 처리하지만 일부 오래된 HEIC variant는 실패할 수 있음. 콘솔에 `analyzeAsset failed` 로그 나오면 무시 가능 (해당 사진만 분석 skip).

## 8. 트러블슈팅

### `pod install` 실패
```bash
cd ios
pod deintegrate
pod install --repo-update
cd ..
```

### Metro 캐시 꼬임
```bash
npx expo start --clear
```

### 네이티브 모듈 미인식
- `node_modules/photo-feature-print`이 심볼릭 링크인지 확인:
  ```bash
  ls -la node_modules/photo-feature-print
  # → ../modules/photo-feature-print 로 가리키면 OK
  ```
- 안 되어 있으면: `npm install` 다시.

### Xcode 빌드 에러
- Clean Build Folder (⇧⌘K) → 빌드 재시도
- `ios/build/` 삭제 후 재시도

## 9. 빌드 후 다음 단계

검증 완료되면 patch §8에 명시된 튜닝:
1. **클러스터링 임계값 0.35** — 본인 사진첩으로 false positive/negative 측정 후 조정
2. **GB 추정 정확도** — file_size가 null인 자산이 많으면 실제와 어긋남
3. **스크린샷 묶음 감지** — patch §8 백로그. PHAsset의 `mediaSubtypes` 중 `.photoScreenshot` 활용 가능
