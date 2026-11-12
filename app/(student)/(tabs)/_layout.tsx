import { Tabs } from "expo-router";
import { Text, View, Dimensions } from "react-native";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { FONT } from "@/lib/design";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

const PAL = {
  bg: "#FFF8F0",
  surface: "#FFFFFF",
  primary: "#FF6B6B",
  primaryDark: "#E05050",
  secondary: "#4ECDC4",
  secondaryDark: "#3BA89F",
  accent: "#FFD93D",
  accentDark: "#E5C020",
  text: "#2D2422",
  textMuted: "#7A6A63",
  divider: "#EDE3D8",
};

function TabIcon({
  emoji,
  focused,
  color,
}: {
  emoji: string;
  focused: boolean;
  color: string;
}) {
  const scale = useSharedValue(focused ? 1 : 0.92);
  const opacity = useSharedValue(focused ? 1 : 0.5);

  useEffect(() => {
    scale.value = withSpring(focused ? 1.15 : 0.92, {
      damping: 14,
      stiffness: 250,
    });
    opacity.value = withTiming(focused ? 1 : 0.5, { duration: 200 });
  }, [focused]);

  const anim = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[anim, { alignItems: "center", justifyContent: "center" }]}
    >
      <Text style={{ fontSize: 22 }}>{emoji}</Text>
      {focused && (
        <View
          style={{
            width: 4,
            height: 4,
            borderRadius: 2,
            backgroundColor: color,
            marginTop: 2,
          }}
        />
      )}
    </Animated.View>
  );
}

export default function TabsLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: PAL.primary,
        tabBarInactiveTintColor: PAL.textMuted,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: PAL.surface,
          borderTopWidth: 0,
          height: isTablet ? 84 : 76,
          paddingBottom: 12,
          paddingTop: 6,
          marginHorizontal: 16,
          marginBottom: 12,
          borderRadius: 28,
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.1,
          shadowRadius: 20,
          elevation: 12,
        },
        tabBarLabelStyle: {
          fontFamily: FONT.extrabold,
          fontSize: 10,
          letterSpacing: 0.3,
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
        },
        sceneStyle: { backgroundColor: PAL.bg },
      }}
    >
      <Tabs.Screen
        name="grades"
        options={{
          title: t("nav.learn"),
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📚" focused={focused} color="#F4A6C0" />
          ),
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: t("nav.leaderboard"),
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🏆" focused={focused} color="#FFD93D" />
          ),
        }}
      />
      <Tabs.Screen
        name="mailbox"
        options={{
          title: t("nav.mailbox"),
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📬" focused={focused} color="#A78BFA" />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t("nav.settings"),
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="⚙️" focused={focused} color="#4ECDC4" />
          ),
        }}
      />
    </Tabs>
  );
}