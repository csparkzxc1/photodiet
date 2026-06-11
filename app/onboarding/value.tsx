import { router } from 'expo-router';

import { OnboardingFrame } from '@/components/onboarding/OnboardingFrame';
import { SimilarPhotosIllustration } from '@/components/onboarding/illustrations/SimilarPhotosIllustration';

export default function ValueScreen() {
  return (
    <OnboardingFrame
      step={2}
      illustration={<SimilarPhotosIllustration />}
      title={'이 10장,\n사실 거의 같은 사진이에요'}
      body={'살짝씩 다른 각도, 흔들린 컷, 연속 촬영 더미. 이런 사진들이 용량을 잡아먹고 있습니다.'}
      ctaLabel="다음"
      onNext={() => router.push('/onboarding/solution')}
    />
  );
}
