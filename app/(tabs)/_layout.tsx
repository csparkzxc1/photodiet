import { Tabs } from 'expo-router';
import { ChartBar, Gear, House } from 'phosphor-react-native';
import { View } from 'react-native';

import { Text } from '@/components/ui';
import { lightColors } from '@/theme/colors';
import { radius, spacing } from '@/theme/tokens';

type TabIconProps = {
  focused: boolean;
  label: string;
  Icon: typeof House;
};

function TabIcon({ focused, label, Icon }: TabIconProps) {
  const color = focused ? lightColors.primary : lightColors.textSub;
  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: spacing.md,
        borderRadius: radius.lg,
        backgroundColor: focused ? lightColors.surface : 'transparent',
        minWidth: 84,
        gap: 2,
      }}
    >
      <Icon size={22} color={color} weight={focused ? 'fill' : 'regular'} />
      <Text
        variant="caption"
        weight={focused ? 'semibold' : 'medium'}
        color={color}
        style={{ fontSize: 11 }}
      >
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: lightColors.bg,
          borderTopWidth: 0,
          elevation: 0,
          paddingTop: 8,
          height: 84,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} label="홈" Icon={House} />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} label="통계" Icon={ChartBar} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} label="설정" Icon={Gear} />
          ),
        }}
      />
    </Tabs>
  );
}
