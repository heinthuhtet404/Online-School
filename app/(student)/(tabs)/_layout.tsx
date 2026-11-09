import { Tabs } from "expo-router";
import { Text } from "react-native";
import { useTranslation } from "react-i18next";

const C = {
  bg: "#F8F7F2",
  primary: "#4055DC",
  ink: "#252536",
  muted: "#8B8B9E",
};

function Icon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>;
}

export default function TabsLayout() {
  const { t } = useTranslation();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: C.primary,
        tabBarInactiveTintColor: C.muted,
        tabBarStyle: {
          backgroundColor: "#FFF",
          borderTopWidth: 0,
          height: 68,
          paddingBottom: 10,
          paddingTop: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontFamily: "PlusJakartaSans_700Bold",
          fontSize: 11,
        },
        sceneStyle: { backgroundColor: C.bg },
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