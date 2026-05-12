import { useEffect, useState } from 'react';
import { Image, View, type ImageStyle } from 'react-native';

import { getAssetUri } from '@/services/assetUri';
import { lightColors } from '@/theme/colors';

type Props = {
  assetId: string;
  style?: ImageStyle;
  contentFit?: 'cover' | 'contain';
};

export function AssetImage({ assetId, style, contentFit = 'cover' }: Props) {
  const [uri, setUri] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getAssetUri(assetId).then((u) => {
      if (active) setUri(u);
    });
    return () => {
      active = false;
    };
  }, [assetId]);

  if (!uri) {
    return (
      <View
        style={[
          {
            backgroundColor: lightColors.border,
            borderRadius: 8,
          },
          style,
        ]}
      />
    );
  }

  return (
    <Image
      source={{ uri }}
      style={[{ borderRadius: 8 }, style]}
      resizeMode={contentFit}
    />
  );
}
