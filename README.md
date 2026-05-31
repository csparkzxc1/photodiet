# 사진다이어트 (PhotoDiet)

**구독도 없고, 사진을 클라우드로 보내지도 않습니다. 한 번 사면 끝.**

사진첩 용량의 절반은 비슷한 사진입니다. AI가 비슷한 더미에서 베스트 1장을
골라주고, 나머지는 원탭으로 비웁니다. 100% 로컬 처리, 일회성 19,900원.

## 차별화 3종 세트

- **구독 없음** — 매달 내는 클라우드 요금과는 다릅니다. 한 번 사면 평생.
- **로컬 프라이버시** — 분석도 삭제도 전부 폰 안에서. 업로드 0건.
- **결정을 대신** — 비슷한 사진 더미에서 베스트 1장만 남기고 나머지는 안심하고 비움.

## 핵심 원칙

- **로컬 전용** — 사진·메타데이터를 외부로 전송하지 않습니다.
- **계정 불필요** — 회원가입·로그인 없음.
- **광고 없음** — 어떤 광고 SDK도 포함하지 않습니다.
- **구독 없음** — 일회성 19,900원, 평생 사용.
- **타사 분석 SDK 최소** — Sentry(크래시 리포팅)만 허용.

## ASO / 스토어 메타데이터

**앱 이름 (스토어 표기):**
`사진다이어트 - 용량 정리, 비슷한 사진 삭제`

**부제 (iOS subtitle):**
`구독 없이, 폰에서만. 한 번 사면 평생`

**키워드 (iOS, 100자 우선순위순):**
```
사진정리,용량정리,사진용량,비슷한사진,중복사진삭제,폰용량,아이클라우드용량,사진삭제,갤러리정리,스크린샷정리
```

**프로모션 텍스트:**
> 사진첩 용량의 절반은 비슷한 사진입니다. AI가 비슷한 더미에서 베스트 1장을
> 골라주고, 나머지는 원탭으로 비웁니다. 구독 없음. 광고 없음. 사진은 폰을
> 떠나지 않습니다.

## 빌드 단계 (Build Phases)

| Phase | 범위 |
|-------|------|
| A | 기반 셋업 — Expo, NativeWind, DB 마이그레이션, 디자인 토큰 |
| B | 사진 접근 + 메타 수집 |
| C | 임베딩 추출 + 그룹화 |
| D | 핵심 UI (홈 GB 히어로, 그룹 상세) |
| E | 안전 삭제 + 리워드 + 통계 |
| F | 결제 (일회성 19,900원) + 페이월 + 출시 준비 |

## 개발 환경

- Node.js ≥ 22
- iOS 16+ (MVP)
- Expo SDK 54

## 시작

```bash
npm install
cp .env.example .env   # 필요 시 Sentry DSN 입력
npx expo prebuild      # 네이티브 모듈을 추가했다면
npx expo start
```

## 폴더 구조

```
photodiet/
├── app/                  # Expo Router (화면)
│   ├── onboarding/       # 6단계: problem → cause → solution → privacy → price → permission
│   ├── (tabs)/           # 홈(GB 히어로), 통계, 설정
│   ├── group/[id]        # 그룹 상세
│   ├── paywall           # 일회성 결제
│   └── modal/scan-progress
├── src/
│   ├── components/ui/    # Button, Card, Text, Screen
│   ├── copy/             # 한국어 문구 (ko.ts)
│   ├── db/               # SQLite 스키마 + 마이그레이션
│   ├── services/         # photos, analyzer, clustering, cleanup, purchases
│   ├── stores/           # zustand (scan, settings, reward)
│   ├── theme/            # 디자인 토큰
│   └── utils/
├── modules/photo-feature-print/  # iOS Vision 네이티브 모듈
├── assets/fonts/         # Pretendard (수동 추가 필요)
└── app.json
```

## 폰트

`assets/fonts/Pretendard-{Regular,Medium,SemiBold,Bold}.otf` 파일을 직접 받아
넣어야 합니다. https://github.com/orioncactus/pretendard/releases

## 결제 상품

App Store Connect + RevenueCat에 아래 ID로 등록:

- `photodiet_lifetime` (Non-Consumable, 19,900 KRW)
- RC entitlement: `pro`
- RC offering: `default`

**월 구독 상품은 만들지 마세요.** 일회성 결제가 차별화 핵심입니다.
