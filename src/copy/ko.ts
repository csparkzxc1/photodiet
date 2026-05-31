export const ko = {
  app: {
    name: '사진다이어트',
    tagline: '구독 없이, 폰에서만. 한 번 사면 평생.',
    storeName: '사진다이어트 - 용량 정리, 비슷한 사진 삭제',
    storeSubtitle: '구독 없이, 폰에서만. 한 번 사면 평생',
  },
  onboarding: {
    // Screen 1: 문제 제기
    welcome: {
      title: '용량 꽉 참.\n또 결제하셨나요?',
      body: '사진첩을 채운 건 대부분 비슷한 사진들입니다.',
      cta: '다음',
    },
    // Screen 2: 원인 시각화
    value: {
      title: '이 10장, 사실\n거의 같은 사진이에요',
      body: '필요한 건 그중 제일 잘 나온 1장뿐.',
      cta: '다음',
    },
    // Screen 3: 해결 방식
    solution: {
      title: 'AI가 베스트 1장을\n골라줍니다',
      body: '흔들림·눈 감김·초점을 따져서 자동으로.',
      cta: '다음',
    },
    // Screen 4: 프라이버시
    privacy: {
      title: '사진은 폰을\n떠나지 않습니다',
      bullets: [
        '분석도, 삭제도 전부 폰 안에서',
        '서버 업로드 0건',
        '계정 가입 없음',
      ],
      cta: '안심됐어요',
    },
    // Screen 5: 가격 (차별화 핵심)
    price: {
      title: '구독 없음.\n한 번 사면 끝',
      body: '매달 내는 클라우드 요금과는 다릅니다.\n19,900원, 평생.',
      bullets: [
        '월 구독 없음',
        '광고 없음',
        '한 번 결제로 평생 사용',
      ],
      cta: '좋아요',
    },
    // Screen 6: 권한 요청 + 시작
    permission: {
      title: '사진첩을 분석해\n비울 용량을 알려드릴게요',
      body: '사진 접근 권한이 필요합니다. (분석은 폰 안에서만)',
      cta: '내 용량 분석하기',
      denied: '설정 앱에서 사진 권한을 전체로 바꿔주세요.',
    },
  },
  home: {
    hero: {
      reclaimable: (formatted: string) => formatted,
      reclaimableSub: (similar: number, removable: number) =>
        `비슷한 사진 ${similar.toLocaleString('ko-KR')}장에서 ${removable.toLocaleString('ko-KR')}장을 비울 수 있어요`,
      reclaimableFallback: (removable: number) =>
        `${removable.toLocaleString('ko-KR')}장을 비울 수 있어요`,
      cta: '한 번에 정리 시작',
      privacyNote: '분석도 삭제도 전부 폰 안에서',
    },
    title: '정리할 그룹',
    empty: '깨끗합니다! 정리할 비슷한 사진이 없어요.',
    scanning: '사진첩을 살펴보는 중...',
    groupCard: {
      count: (n: number) => `${n}장`,
      cta: '정리하기',
    },
  },
  group: {
    bestLabel: '베스트',
    similarLabel: '비슷한 사진',
    actions: {
      keepBest: '베스트만 남기기',
      keepAll: '전부 보관',
      deleteAll: '전부 삭제',
    },
    confirmDelete: (n: number, mb: number) =>
      `${n}장 삭제하고 약 ${mb}MB를 비웁니다. 사진앱 휴지통에 30일 보관돼요.`,
  },
  reward: {
    cleaned: (formatted: string) => `${formatted} 확보!`,
    totalSaved: (formatted: string) => `누적 ${formatted} 정리`,
  },
  scan: {
    indexing: (s: number, t: number) => `사진 정리 중... ${s} / ${t}`,
    analyzing: (s: number, t: number) => `사진 분석 중... ${s} / ${t}`,
    clustering: '비슷한 사진을 묶는 중...',
    done: (n: number) => `완료! ${n}개 그룹을 찾았어요.`,
    privacyNote: '분석 중… 사진은 폰 안에서만 처리됩니다',
  },
  stats: {
    title: '정리 통계',
    totalDeleted: '총 삭제 사진',
    totalFreed: '총 확보 용량',
    totalGroups: '정리한 그룹',
    chartTitle: '최근 30일',
  },
  paywall: {
    title: '구독 없이,\n한 번 사면 끝.',
    subtitle: '매달 클라우드 요금을 더 내는 대신, 폰에서 직접 정리하세요.',
    lifetime: {
      label: '평생',
      price: '19,900원',
      sub: '한 번 결제 · 추가 결제 없음',
      badge: '평생 사용',
    },
    bullets: [
      '월 구독 없음',
      '광고 없음',
      '사진은 폰을 떠나지 않음',
    ],
    cta: '한 번에 결제하기',
    restore: '구매 복원',
    legal: '결제는 Apple ID 계정으로 청구됩니다. 일회성 결제이며 자동 갱신되지 않습니다.',
  },
  settings: {
    plan: '플랜',
    restore: '구매 복원',
    privacy: '개인정보 처리방침',
    terms: '이용약관',
    contact: '문의하기',
    version: '버전',
  },
  common: {
    loading: '불러오는 중...',
    error: '문제가 생겼어요. 다시 시도해주세요.',
    retry: '다시 시도',
    cancel: '취소',
    confirm: '확인',
  },
} as const;

export type Copy = typeof ko;
