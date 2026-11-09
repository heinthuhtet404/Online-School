import { View, Text, Pressable, ScrollView, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  withSpring,
  Easing,
} from "react-native-reanimated";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLang } from "../lib/language-context";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

// ===== Design System =====
const C = {
  bg: "#F8F7F2",
  primary: "#4055DC",
  secondary: "#D2F078",
  accent: "#FF8066",
  ink: "#252536",
  muted: "#8B8B9E",
  card: "#FFFFFF",
};

// ===== Floating animation =====
function useFloat(delay = 0, amount = -12) {
  const o = useSharedValue(0);
  useEffect(() => {
    o.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, { duration: 2800, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      )
    );
  }, []);
  return useAnimatedStyle(() => ({ transform: [{ translateY: o.value * amount }] }));
}

// ===== Abstract 3D Shape =====
function Shape3D({
  size,
  colors,
  style,
  delay = 0,
  radius = 999,
}: {
  size: number;
  colors: [string, string];
  style: any;
  delay?: number;
  radius?: number;
}) {
  const anim = useFloat(delay, -10);
  return (
    <Animated.View style={[style, anim, { pointerEvents: "none" }]}>
      <View
        style={{
          width: size,
          height: size,
          borderRadius: radius,
          shadowColor: colors[1],
          shadowOffset: { width: 0, height: size * 0.18 },
          shadowOpacity: 0.55,
          shadowRadius: size * 0.25,
          elevation: 14,
        }}
      >
        <LinearGradient
          colors={colors}
          start={{ x: 0.15, y: 0.1 }}
          end={{ x: 0.9, y: 1 }}
          style={{ width: "100%", height: "100%", borderRadius: radius }}
        >
          <View
            style={{
              position: "absolute",
              top: size * 0.12,
              left: size * 0.15,
              width: size * 0.3,
              height: size * 0.3,
              borderRadius: size * 0.15,
              backgroundColor: "rgba(255,255,255,0.55)",
            }}
          />
        </LinearGradient>
      </View>
    </Animated.View>
  );
}

// ===== Tactile Pressable Button =====
function TactileButton({
  onPress,
  children,
  style,
  haptic = "medium",
}: {
  onPress: () => void;
  children: React.ReactNode;
  style?: any;
  haptic?: "light" | "medium" | "heavy";
}) {
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePressIn = () => {
    scale.value = withSpring(0.94, { damping: 15, stiffness: 400 });
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 300 });
  };
  const handlePress = () => {
    if (haptic === "light") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    else if (haptic === "heavy") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={handlePress}>
      <Animated.View style={[style, anim]}>{children}</Animated.View>
    </Pressable>
  );
}

export default function Welcome() {
  const router = useRouter();
  const { t } = useTranslation();
  const { lang, setLang } = useLang();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            flex: 1,
            paddingHorizontal: isTablet ? 48 : 28,
            paddingBottom: 24,
            maxWidth: isTablet ? 720 : undefined,
            alignSelf: "center",
            width: "100%",
          }}
        >
          {/* ===== Top bar: Language switcher ===== */}
          <View
            style={{
              marginTop: 16,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <View
                style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: C.secondary }}
              />
              <Text
                style={{
                  fontFamily: "PlusJakartaSans_700Bold",
                  fontSize: 12,
                  letterSpacing: 2,
                  color: C.ink,
                }}
              >
                ONLINE SCHOOL
              </Text>
            </View>

            {/* Language switcher pill */}
            <View
              style={{
                flexDirection: "row",
                backgroundColor: C.card,
                borderRadius: 20,
                padding: 4,
                borderWidth: 1,
                borderColor: "#E5E2D8",
              }}
            >
              {(["my", "en"] as const).map((l) => (
                <Pressable
                  key={l}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setLang(l);
                  }}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 6,
                    borderRadius: 16,
                    backgroundColor: lang === l ? C.ink : "transparent",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "PlusJakartaSans_700Bold",
                      fontSize: 12,
                      color: lang === l ? "#FFF" : C.muted,
                    }}
                  >
                    {l.toUpperCase()}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* ===== Hero headline ===== */}
          <View style={{ marginTop: isTablet ? 32 : 28 }}>
            <Text
              style={{
                fontFamily: "PlusJakartaSans_800ExtraBold",
                fontSize: isTablet ? 64 : 48,
                lineHeight: isTablet ? 70 : 54,
                color: C.ink,
                letterSpacing: -1.5,
              }}
            >
              {t("welcome.hello")}
            </Text>
            <Text
              style={{
                fontFamily: "PlusJakartaSans_800ExtraBold",
                fontSize: isTablet ? 64 : 48,
                lineHeight: isTablet ? 70 : 54,
                color: C.ink,
                letterSpacing: -1.5,
              }}
            >
              {t("welcome.little")}
            </Text>
            <Text
              style={{
                fontFamily: "PlusJakartaSans_800ExtraBold",
                fontSize: isTablet ? 64 : 48,
                lineHeight: isTablet ? 70 : 54,
                color: C.primary,
                letterSpacing: -1.5,
              }}
            >
              {t("welcome.explorers")}
            </Text>
            <Text
              style={{
                fontFamily: "PlusJakartaSans_600SemiBold",
                fontSize: 15,
                color: C.muted,
                marginTop: 12,
                letterSpacing: 0.3,
              }}
            >
              {t("welcome.tagline")}
            </Text>
          </View>

          {/* ===== Abstract 3D shapes zone ===== */}
          <View
            style={{
              height: isTablet ? 240 : 200,
              position: "relative",
              marginTop: 8,
              marginBottom: 20,
            }}
          >
            <Shape3D
              size={isTablet ? 140 : 110}
              colors={["#8FA0FF", "#4055DC"]}
              delay={0}
              style={{ position: "absolute", top: 10, left: 0 }}
            />
            <Animated.View
              style={[
                useFloat(400, -10),
                {
                  position: "absolute",
                  top: 40,
                  right: 10,
                  width: isTablet ? 100 : 80,
                  height: isTablet ? 100 : 80,
                  borderRadius: 28,
                  transform: [{ rotate: "16deg" }],
                  shadowColor: "#A8C43F",
                  shadowOffset: { width: 0, height: 10 },
                  shadowOpacity: 0.5,
                  shadowRadius: 18,
                  elevation: 12,
                },
              ]}
            >
              <LinearGradient
                colors={["#E8FFA8", "#D2F078"]}
                start={{ x: 0.2, y: 0.1 }}
                end={{ x: 0.9, y: 1 }}
                style={{ width: "100%", height: "100%", borderRadius: 28 }}
              >
                <View
                  style={{
                    position: "absolute",
                    top: 12,
                    left: 14,
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: "rgba(255,255,255,0.6)",
                  }}
                />
              </LinearGradient>
            </Animated.View>

            <Shape3D
              size={isTablet ? 80 : 64}
              colors={["#FFAE9C", "#FF8066"]}
              delay={800}
              style={{ position: "absolute", bottom: 10, right: 80 }}
            />
            <Shape3D
              size={40}
              colors={["#4A4A60", "#252536"]}
              delay={1200}
              style={{ position: "absolute", bottom: 0, left: 60 }}
            />
            <View
              style={{
                position: "absolute",
                top: 6,
                right: isTablet ? 200 : 130,
                width: 14,
                height: 14,
                borderRadius: 7,
                backgroundColor: C.secondary,
              }}
            />
          </View>

          {/* ===== Primary CTA: Play as Guest ===== */}
          <TactileButton
            haptic="heavy"
            onPress={() => router.push("/(student)/grades")}
            style={{
              backgroundColor: C.ink,
              borderRadius: 24,
              paddingVertical: 22,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              gap: 10,
              shadowColor: C.ink,
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.28,
              shadowRadius: 22,
              elevation: 12,
            }}
          >
            <Text style={{ fontSize: 22 }}>🚀</Text>
            <Text
              style={{
                fontFamily: "PlusJakartaSans_800ExtraBold",
                fontSize: 17,
                color: "#FFFFFF",
                letterSpacing: 0.4,
              }}
            >
              {t("welcome.playGuest")}
            </Text>
          </TactileButton>

          {/* ===== Log in / Sign in ===== */}
          <TactileButton
            haptic="light"
            onPress={() => router.push("/(auth)/login")}
            style={{
              marginTop: 14,
              backgroundColor: C.card,
              borderRadius: 24,
              paddingVertical: 20,
              alignItems: "center",
              borderWidth: 2,
              borderColor: C.primary,
            }}
          >
            <Text
              style={{
                fontFamily: "PlusJakartaSans_800ExtraBold",
                fontSize: 16,
                color: C.primary,
              }}
            >
              {t("welcome.login")}
            </Text>
          </TactileButton>

          {/* ===== Utility row: Teacher | Help ===== */}
          <View style={{ flexDirection: "row", gap: 12, marginTop: 14 }}>
            <TactileButton
              haptic="light"
              onPress={() => router.push("/(teacher)/dashboard")}
              style={{
                flex: 1,
                backgroundColor: C.secondary,
                borderRadius: 20,
                paddingVertical: 16,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Text style={{ fontSize: 18 }}>👩‍🏫</Text>
              <Text
                style={{
                  fontFamily: "PlusJakartaSans_800ExtraBold",
                  fontSize: 14,
                  color: C.ink,
                }}
              >
                {t("welcome.teacher")}
              </Text>
            </TactileButton>

            <TactileButton
              haptic="light"
              onPress={() => {}}
              style={{
                width: 60,
                backgroundColor: C.card,
                borderRadius: 20,
                paddingVertical: 16,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: "#E5E2D8",
              }}
            >
              <Text style={{ fontSize: 20 }}>❓</Text>
            </TactileButton>
          </View>

          {/* ===== Spacer ===== */}
          <View style={{ flex: 1, minHeight: 24 }} />

          {/* ===== Footer ===== */}
          <View style={{ alignItems: "center", marginTop: 20, paddingBottom: 8 }}>
            <Text
              style={{
                fontFamily: "PlusJakartaSans_600SemiBold",
                fontSize: 11,
                color: C.muted,
                letterSpacing: 0.5,
              }}
            >
              {t("welcome.help")}  ·  v1.0.0
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}