import { View } from 'react-native';

import { Text } from '@/components/ui';
import { lightColors } from '@/theme/colors';
import { radius } from '@/theme/tokens';

const TILE = 70;

/**
 * 6 abstract mountain-like tile gradients in 2 rows + pill.
 * Real Unsplash photos are heavy/unbundleable; we use color gradients to evoke similarity.
 */
const TILE_COLORS = [
  ['#A8BFD3', '#C7CFD3'], // light sky
  ['#9EB2C5', '#D4D5CE'], // warm grey
  ['#7D8AA0', '#A89E91'], // dark mountain
  ['#B5C5A1', '#A4AC8B'], // meadow
  ['#8DA68F', '#A8B594'], // valley
  ['#A8C2D4', '#C9D6D8'], // mountain lake
] as const;

export function SimilarPhotosIllustration() {
  return (
    <View style={{ alignItems: 'center', gap: 18 }}>
      <View style={{ gap: 8 }}>
        {[0, 1].map((row) => (
          <View key={row} style={{ flexDirection: 'row', gap: 8 }}>
            {[0, 1, 2].map((col) => {
              const idx = row * 3 + col;
              const tile = TILE_COLORS[idx];
              if (!tile) return null;
              const [top, bot] = tile;
              return (
                <View
                  key={col}
                  style={{
                    width: TILE,
                    height: TILE,
                    borderRadius: radius.md,
                    overflow: 'hidden',
                    backgroundColor: bot,
                  }}
                >
                  <View
                    style={{
                      height: '55%',
                      backgroundColor: top,
                    }}
                  />
                </View>
              );
            })}
          </View>
        ))}
      </View>

      <View
        style={{
          backgroundColor: lightColors.surface,
          paddingVertical: 6,
          paddingLeft: 14,
          paddingRight: 6,
          borderRadius: 999,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <Text variant="body" weight="medium" color={lightColors.text}>
          거의 같은 사진
        </Text>
        <View
          style={{
            backgroundColor: lightColors.primary,
            paddingVertical: 4,
            paddingHorizontal: 10,
            borderRadius: 999,
          }}
        >
          <Text variant="caption" weight="bold" color="#FFFFFF">
            10장
          </Text>
        </View>
      </View>
    </View>
  );
}
