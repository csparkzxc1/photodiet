# 사진다이어트 (PhotoDiet)

비슷한 100장 → 베스트 1장. 폰에서만, 5초 만에.

부모가 사진첩에 쌓인 비슷한 사진(연속 촬영, 버스트 샷)에서 AI가 베스트 1장을
골라주고, 나머지는 안심하고 삭제하게 도와주는 로컬 전용 정리 도구.

## 핵심 원칙

- **로컬 전용** — 사진·메타데이터를 외부로 전송하지 않습니다.
- **계정 불필요** — 회원가입·로그인 없음.
- **광고 없음** — 어떤 광고 SDK도 포함하지 않습니다.
- **타사 분석 SDK 최소** — Sentry(크래시 리포팅)만 허용.

## 빌드 단계 (Build Phases)

| Phase | 범위 |
|-------|------|
| A | 기반 셋업 (현재) — Expo, NativeWind, DB 마이그레이션, 디자인 토큰 |
| B | 사진 접근 + 메타 수집 |
| C | 임베딩 추출 + 그룹화 |
| D | 핵심 UI |
| E | 안전 삭제 + 리워드 + 통계 |
| F | 결제 + 페이월 + 출시 준비 |

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
├── src/
│   ├── components/ui/    # Button, Card, Text, Screen
│   ├── copy/             # 한국어 문구 (ko.ts)
│   ├── db/               # SQLite 스키마 + 마이그레이션
│   ├── hooks/
│   ├── services/         # sentry, photos, analyzer 등
│   ├── theme/            # 디자인 토큰
│   └── utils/
├── assets/fonts/         # Pretendard (수동 추가 필요)
├── tailwind.config.js
└── app.json
```

## 폰트

`assets/fonts/Pretendard-{Regular,Medium,SemiBold,Bold}.otf` 파일을 직접 받아
넣어야 합니다. https://github.com/orioncactus/pretendard/releases
