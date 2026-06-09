import { router } from 'expo-router';

import { OnboardingFrame } from '@/components/onboarding/OnboardingFrame';
import { BestPickIllustration } from '@/components/onboarding/illustrations/BestPickIllustration';

export default function SolutionScreen() {
  return (
    <OnboardingFrame
      step={3}
      illustration={<BestPickIllustration />}
      title={'베스트 1장만\n자동으로 골라드려요'}
      body={'화질, 밝기, 선명도를 분석해 가장 잘 나온 사진 1장을 선별합니다. 나머지는 안심하고 지우세요.'}
      ctaLabel="다음"
      onNext={() => router.push('/onboarding/privacy')}
    />
  );
}
