import { CaretRight, Star } from 'phosphor-react-native';
import { View } from 'react-native';

import { Text } from '@/components/ui';
import { lightColors } from '@/theme/colors';
import { radius } from '@/theme/tokens';

const SMALL = 42;
const BIG = 130;

const SMALL_COLORS = [
  ['#B8C8D9', '#CCD1CB'],
  ['#A5B8C9', '#CDD0C8'],
  ['#8B96A8', '#A89B8E'],
  ['#B4C2A0', '#A1A989'],
] as const;

export function BestPickIllustration() {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
      }}
    >
      <View style={{ gap: 6 }}>
        {SMALL_COLORS.map((tile, i) => (
          <View
            key={i}
            style={{
              width: SMALL,
              height: SMALL,
              borderRadius: 8,
              overflow: 'hidden',
              backgroundColor: tile[1],
              opacity: 0.55,
            }}
          >
            <View style={{ height: '55%', backgroundColor: tile[0] }} />
          </View>
        ))}
      </View>

      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: lightColors.primary,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CaretRight size={16} color="#FFFFFF" weight="bold" />
      </View>

      <View>
        <View
          style={{
            width: BIG,
            height: BIG,
            borderRadius: radius.lg,
            overflow: 'hidden',
            backgroundColor: '#CCD1CB',
            borderWidth: 3,
            borderColor: lightColors.primary,
          }}
        >
          <View style={{ height: '55%', backgroundColor: '#B8C8D9' }} />
        </View>
        <View
          style={{
            position: 'absolute',
            top: -10,
            right: -10,
            backgroundColor: lightColors.primary,
            paddingVertical: 5,
            paddingHorizontal: 10,
            borderRadius: 999,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <Star size={11} color="#FFFFFF" weight="fill" />
          <Text
            variant="caption"
            weight="bold"
            color="#FFFFFF"
            style={{ fontSize: 12 }}
          >
            베스트
          </Text>
        </View>
      </View>
    </View>
  );
}
