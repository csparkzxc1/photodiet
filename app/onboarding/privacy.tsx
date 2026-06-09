import { router } from 'expo-router';

import { OnboardingFrame } from '@/components/onboarding/OnboardingFrame';
import { PrivacyIllustration } from '@/components/onboarding/illustrations/PrivacyIllustration';

export default function PrivacyScreen() {
  return (
    <OnboardingFrame
      step={4}
      illustration={<PrivacyIllustration />}
      title={'사진은\n폰을 떠나지 않습니다'}
      body={'모든 분석은 내 기기 안에서만 이루어집니다. 어디에도 업로드되지 않아요.'}
      ctaLabel="다음"
      onNext={() => router.push('/onboarding/price')}
    />
  );
}
