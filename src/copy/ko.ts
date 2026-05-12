export const ko = {
  app: {
    name: '사진다이어트',
    tagline: '비슷한 100장을 베스트 1장으로',
  },
  onboarding: {
    welcome: {
      title: '사진첩, 이제 다이어트할 시간',
      body: '비슷한 사진 99장은 빼고, 베스트 1장만 남겨드릴게요.',
      cta: '시작하기',
    },
    value: {
      title: '연속으로 찍은 사진,\n어느 게 베스트인지 모르겠죠?',
      body: 'AI가 흔들림·눈감음·표정을 분석해서 가장 잘 나온 한 장을 골라드려요.',
      cta: '다음',
    },
    privacy: {
      title: '사진은 폰을 떠나지 않습니다',
      bullets: [
        '서버로 업로드 안 함',
        '분석은 모두 폰 안에서',
        '원본 사진은 그대로 사진첩에',
      ],
      cta: '안심됐어요',
    },
    permission: {
      title: '사진첩 전체 접근이 필요해요',
      body: '부분 접근으로는 비슷한 사진 그룹화가 정확하지 않아요. 사진은 절대 외부로 나가지 않습니다.',
      cta: '권한 허용하기',
      denied: '설정 앱에서 사진 권한을 전체로 바꿔주세요.',
    },
    ready: {
      title: '준비 완료',
      body: '사진첩을 스캔할게요. 사진이 많으면 몇 분 걸릴 수 있어요.',
      cta: '스캔 시작',
    },
  },
  home: {
    title: '오늘 정리할 그룹',
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
    cleaned: (mb: number) => `${mb}MB 확보!`,
    totalSaved: (gb: number) => `누적 ${gb}GB 정리`,
  },
  stats: {
    title: '정리 통계',
    totalDeleted: '총 삭제 사진',
    totalFreed: '총 확보 용량',
    totalGroups: '정리한 그룹',
    chartTitle: '최근 30일',
  },
  paywall: {
    title: '무료 한도를 다 쓰셨네요',
    subtitle: '평생 결제로 사진첩을 계속 깨끗하게 유지하세요.',
    lifetime: {
      label: '평생',
      price: '19,900원',
      sub: '한 번 결제 · 추가 결제 없음',
      badge: '추천',
    },
    monthly: {
      label: '월 구독',
      price: '2,900원/월',
      sub: '언제든 해지 가능',
    },
    restore: '구매 복원',
    legal:
      '결제는 Apple ID 계정으로 청구됩니다. 자동 갱신은 설정에서 해지할 수 있어요.',
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
