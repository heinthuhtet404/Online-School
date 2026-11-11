import { Tabs } from "expo-router";
import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { CANDY, FONT, R, SHADOW } from "@/lib/design";

function Icon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <View
      style={{
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: focused ? CANDY.primarySoft : "transparent",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.6 }}>{emoji}</Text>
    </View>
  );
}

export default function TabsLayout() {
  const { t } = useTranslation();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: CANDY.primary,
        tabBarInactiveTintColor: CANDY.textMuted,
        tabBarStyle: {
          backgroundColor: CANDY.surface,
          borderTopWidth: 0,
          height: 76,
          paddingBottom: 14,
          paddingTop: 8,
          marginHorizontal: 16,
          marginBottom: 12,
          borderRadius: R.xl,
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          ...SHADOW.card,
        },
        tabBarLabelStyle: {
          fontFamily: FONT.bold,
          fontSize: 10,
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
        },
        sceneStyle: { backgroundColor: CANDY.bg },
      }}
    >
      <Tabs.Screen
        name="grades"
        options={{
          title: t("nav.learn"),
          tabBarIcon: ({ focused }) => <Icon emoji="📚" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: t("nav.leaderboard"),
          tabBarIcon: ({ focused }) => <Icon emoji="🏆" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="mailbox"
        options={{
          title: t("nav.mailbox"),
          tabBarIcon: ({ focused }) => <Icon emoji="📬" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t("nav.settings"),
          tabBarIcon: ({ focused }) => <Icon emoji="⚙️" focused={focused} />,
        }}
      />
    </Tabs>
  );
}