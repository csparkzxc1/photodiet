import { router } from 'expo-router';

import { OnboardingFrame } from '@/components/onboarding/OnboardingFrame';
import { CapacityFullIllustration } from '@/components/onboarding/illustrations/CapacityFullIllustration';

export default function WelcomeScreen() {
  return (
    <OnboardingFrame
      step={1}
      illustration={<CapacityFullIllustration />}
      title={'용량 꽉 참.\n또 결제하셨나요?'}
      body={'매달 구독료를 내지만 사진이 쌓이는 속도는 더 빠릅니다. 진짜 문제는 따로 있어요.'}
      ctaLabel="다음"
      showBack={false}
      onNext={() => router.push('/onboarding/value')}
    />
  );
}
