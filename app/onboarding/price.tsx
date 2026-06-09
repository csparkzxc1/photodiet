import { router } from 'expo-router';

import { OnboardingFrame } from '@/components/onboarding/OnboardingFrame';
import { PriceIllustration } from '@/components/onboarding/illustrations/PriceIllustration';

export default function PriceScreen() {
  return (
    <OnboardingFrame
      step={5}
      illustration={<PriceIllustration />}
      title={'구독 없음.\n한 번 사면 끝이에요'}
      body={'매달 클라우드 요금을 더 내는 대신, 한 번 결제로 평생 사용하세요.'}
      ctaLabel="다음"
      onNext={() => router.push('/onboarding/permission')}
    />
  );
}
