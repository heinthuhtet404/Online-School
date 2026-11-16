import { Tabs } from "expo-router";
import { Text } from "react-native";
import { useTranslation } from "react-i18next";

const PAL = {
  bg: "#F0F5F8",
  primary: "#2C7A7B",
  ink: "#1E2A38",
  muted: "#5C6B7A",
};

function Icon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>;
}

export default function TeacherTabsLayout() {
  const { t } = useTranslation();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: PAL.primary,
        tabBarInactiveTintColor: PAL.muted,
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
          fontSize: 10,
        },
        sceneStyle: { backgroundColor: PAL.bg },
      }}
    >
      {/* <Tabs.Screen
        name="dashboard"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => <Icon emoji="🏠" focused={focused} />,
        }}
      /> */}
      <Tabs.Screen
        name="lessons"
        options={{
          title: "Lessons",
          tabBarIcon: ({ focused }) => <Icon emoji="📚" focused={focused} />,
        }}
      />
      {/* <Tabs.Screen
        name="quizzes"
        options={{
          title: "Quizzes",
          tabBarIcon: ({ focused }) => <Icon emoji="✏️" focused={focused} />,
        }}
      /> */}
      <Tabs.Screen
        name="ranks"
        options={{
          title: "Ranks",
          tabBarIcon: ({ focused }) => <Icon emoji="🏆" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => <Icon emoji="👤" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ focused }) => <Icon emoji="⚙️" focused={focused} />,
        }}
      />
    </Tabs>
  );
}