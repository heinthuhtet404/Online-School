import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeInDown,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  interpolate,
} from "react-native-reanimated";
import { useEffect, useState, useRef } from "react";
import { FONT } from "@/lib/design";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

// ============================================================
// PALETTE
// ============================================================
const PAL = {
  bg: "#FFF8F0",
  bgTop: "#FFE8D6",
  bgBottom: "#E8F4FF",
  primary: "#FF6B6B",
  primaryDark: "#E05050",
  secondary: "#4ECDC4",
  secondaryDark: "#3BA89F",
  accent: "#FFD93D",
  accentDark: "#E5C020",
  text: "#2D2422",
  textMuted: "#7A6A63",
  divider: "#EDE3D8",
  inputBg: "rgba(255,255,255,0.7)",
};

type Mood = "idle" | "happy" | "excited" | "thinking" | "wave";

// ============================================================
// PIP
// ============================================================
function Pip({
  mood = "idle",
  size = 80,
  prop,
  flameTop = PAL.accent,
  flameBottom = "#FFB84D",
}: {
  mood?: Mood;
  size?: number;
  prop?: string;
  flameTop?: string;
  flameBottom?: string;
}) {
  const bob = useSharedValue(0);
  const blink = useSharedValue(1);
  const propScale = useSharedValue(0);

  useEffect(() => {
    bob.value = withRepeat(
      withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    blink.value = withRepeat(
      withSequence(
        withTiming(0.1, { duration: 100 }),
        withTiming(1, { duration: 200 }),
        withDelay(2800, withTiming(1, { duration: 100 }))
      ),
      -1,
      false
    );
  }, []);

  useEffect(() => {
    if (prop) {
      propScale.value = 0;
      propScale.value = withSpring(1, { damping: 12, stiffness: 300 });
    } else {
      propScale.value = withTiming(0, { duration: 200 });
    }
  }, [prop]);

  const bodyAnim = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(bob.value, [0, 1], [0, -5]) },
      {
        rotate:
          mood === "excited"
            ? `${interpolate(bob.value, [0, 1], [-4, 4])}deg`
            : "0deg",
      },
    ],
  }));
  const eyeAnim = useAnimatedStyle(() => ({ transform: [{ scaleY: blink.value }] }));
  const propAnim = useAnimatedStyle(() => ({
    transform: [{ scale: propScale.value }],
    opacity: propScale.value,
  }));

  return (
    <Animated.View style={[bodyAnim, { width: size, height: size * 1.25 }]}>
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: size * 0.32,
          width: size * 0.36,
          height: size * 0.32,
          alignItems: "center",
        }}
      >
        <LinearGradient
          colors={[flameTop, flameBottom, "rgba(255,184,77,0)"]}
          locations={[0, 0.5, 1]}
          style={{
            width: size * 0.28,
            height: size * 0.3,
            borderTopLeftRadius: size * 0.14,
            borderTopRightRadius: size * 0.14,
            borderBottomLeftRadius: size * 0.03,
            borderBottomRightRadius: size * 0.03,
          }}
        />
      </View>
      <View
        style={{
          position: "absolute",
          bottom: size * 0.3,
          left: size * 0.04,
          width: size * 0.16,
          height: size * 0.3,
          backgroundColor: PAL.primaryDark,
          borderTopLeftRadius: size * 0.09,
          borderBottomLeftRadius: size * 0.15,
          transform: [{ rotate: "-14deg" }],
        }}
      />
      <View
        style={{
          position: "absolute",
          bottom: size * 0.3,
          right: size * 0.04,
          width: size * 0.16,
          height: size * 0.3,
          backgroundColor: PAL.primaryDark,
          borderTopRightRadius: size * 0.09,
          borderBottomRightRadius: size * 0.15,
          transform: [{ rotate: "14deg" }],
        }}
      />
      <View
        style={{
          position: "absolute",
          bottom: size * 0.15,
          left: size * 0.18,
          width: size * 0.64,
          height: size * 0.82,
          borderRadius: size * 0.32,
          backgroundColor: PAL.primary,
          borderWidth: 2.5,
          borderColor: PAL.primaryDark,
        }}
      >
        <View
          style={{
            position: "absolute",
            top: size * 0.14,
            left: size * 0.05,
            right: size * 0.05,
            bottom: size * 0.05,
            borderRadius: size * 0.25,
            backgroundColor: "#FFF5F0",
            borderWidth: 2,
            borderColor: PAL.primaryDark,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              gap: size * 0.13,
              marginTop: size * 0.12,
            }}
          >
            {[0, 1].map((i) => (
              <Animated.View
                key={i}
                style={[
                  eyeAnim,
                  {
                    width: size * 0.08,
                    height: size * 0.11,
                    borderRadius: size * 0.04,
                    backgroundColor: "#2D2422",
                    alignItems: "center",
                    justifyContent: "flex-start",
                  },
                ]}
              >
                <View
                  style={{
                    width: size * 0.03,
                    height: size * 0.03,
                    borderRadius: size * 0.015,
                    backgroundColor: "#FFFFFF",
                    marginTop: size * 0.02,
                    marginLeft: size * 0.025,
                  }}
                />
              </Animated.View>
            ))}
          </View>
          <View
            style={{
              alignSelf: "center",
              marginTop: size * 0.05,
              width: mood === "excited" ? size * 0.13 : size * 0.09,
              height: mood === "excited" ? size * 0.09 : size * 0.05,
              borderBottomLeftRadius: size * 0.06,
              borderBottomRightRadius: size * 0.06,
              backgroundColor: "#2D2422",
              overflow: "hidden",
            }}
          >
            <View
              style={{
                position: "absolute",
                bottom: 0,
                left: "25%",
                right: "25%",
                height: "45%",
                backgroundColor: "#FF6B8A",
                borderTopLeftRadius: size * 0.02,
                borderTopRightRadius: size * 0.02,
              }}
            />
          </View>
        </View>
        <View
          style={{
            position: "absolute",
            top: -size * 0.05,
            alignSelf: "center",
            width: size * 0.2,
            height: size * 0.2,
            borderRadius: size * 0.1,
            backgroundColor: PAL.secondary,
            borderWidth: 2,
            borderColor: PAL.secondaryDark,
          }}
        />
      </View>
      {prop && (
        <Animated.View
          style={[
            propAnim,
            {
              position: "absolute",
              bottom: 0,
              right: -size * 0.1,
              width: size * 0.4,
              height: size * 0.4,
              borderRadius: size * 0.2,
              backgroundColor: "#FFFFFF",
              borderWidth: 2.5,
              borderColor: PAL.primaryDark,
              alignItems: "center",
              justifyContent: "center",
            },
          ]}
        >
          <Text style={{ fontSize: size * 0.2 }}>{prop}</Text>
        </Animated.View>
      )}
    </Animated.View>
  );
}

// ============================================================
// MINIMAL INPUT — no heavy box, just a line
// ============================================================
function MinimalInput({
  label,
  icon,
  value,
  onChangeText,
  secure = false,
  keyboardType = "default",
  focused,
  onFocus,
  onBlur,
}: {
  label: string;
  icon: string;
  value: string;
  onChangeText: (t: string) => void;
  secure?: boolean;
  keyboardType?: any;
  focused: boolean;
  onFocus: () => void;
  onBlur: () => void;
}) {
  return (
    <View style={{ marginBottom: 18 }}>
      <Text
        style={{
          fontFamily: FONT.extrabold,
          fontSize: 11,
          color: focused ? PAL.primary : PAL.textMuted,
          letterSpacing: 1.2,
          marginBottom: 6,
          marginLeft: 2,
        }}
      >
        {label.toUpperCase()}
      </Text>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderBottomWidth: focused ? 2.5 : 1.5,
          borderBottomColor: focused ? PAL.primary : PAL.divider,
          paddingBottom: 6,
        }}
      >
        <Text style={{ fontSize: 16, marginRight: 8, opacity: focused ? 1 : 0.6 }}>
          {icon}
        </Text>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secure}
          autoCapitalize="none"
          keyboardType={keyboardType}
          placeholder={label}
          placeholderTextColor={PAL.textMuted + "80"}
          onFocus={onFocus}
          onBlur={onBlur}
          style={{
            flex: 1,
            paddingVertical: 6,
            fontFamily: FONT.semibold,
            fontSize: 16,
            color: PAL.text,
          }}
        />
      </View>
    </View>
  );
}

// ============================================================
// MAIN LOGIN
// ============================================================
export default function Login() {
  const { t } = useTranslation();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [focusField, setFocusField] = useState<string | null>(null);
  const [mood, setMood] = useState<Mood>("idle");
  const [message, setMessage] = useState("Welcome back! Ready to learn? 👋");
  const resetTimer = useRef<any>(null);

  const react = (newMood: Mood, msg?: string) => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
    setMood(newMood);
    if (msg) setMessage(msg);
    resetTimer.current = setTimeout(() => {
      setMood("idle");
      setMessage("Welcome back! Ready to learn? 👋");
    }, 2200);
  };

  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: PAL.bg }}>
      <LinearGradient
        colors={[PAL.bgTop, PAL.bg, PAL.bgBottom]}
        locations={[0, 0.5, 1]}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: isTablet ? 48 : 24,
              paddingBottom: 40,
              paddingTop: 8,
              maxWidth: isTablet ? 600 : undefined,
              alignSelf: "center",
              width: "100%",
            }}
            showsVerticalScrollIndicator={false}
          >
            {/* Back — minimal arrow */}
            <Pressable
              onPress={() => {
                Haptics.selectionAsync();
                router.back();
              }}
              style={{
                width: 40,
                height: 40,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 12,
              }}
            >
              <Text style={{ fontSize: 22, color: PAL.text }}>←</Text>
            </Pressable>

            {/* ===== Pip + message (side by side) ===== */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                marginBottom: 24,
              }}
            >
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  react("excited", "Let's go! 🎉");
                }}
              >
                <Pip mood={mood} size={isTablet ? 90 : 76} />
              </Pressable>
              <Animated.View entering={FadeIn.delay(200)} style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: FONT.semibold,
                    fontSize: 14,
                    color: PAL.textMuted,
                    lineHeight: 20,
                  }}
                >
                  {message}
                </Text>
              </Animated.View>
            </View>

            {/* ===== Title ===== */}
            <Animated.View entering={FadeInDown.delay(100).springify()}>
              <Text
                style={{
                  fontFamily: FONT.extrabold,
                  fontSize: isTablet ? 38 : 30,
                  color: PAL.text,
                  letterSpacing: -1,
                  lineHeight: isTablet ? 44 : 36,
                }}
              >
                {t("auth.loginTitle")}
              </Text>
              <Text
                style={{
                  fontFamily: FONT.semibold,
                  fontSize: 13,
                  color: PAL.textMuted,
                  marginTop: 6,
                }}
              >
                သင့်အကောင့်ထဲ ပြန်ဝင်ရန်
              </Text>
            </Animated.View>

            {/* ===== Role selector — minimal pills ===== */}
            <Animated.View
              entering={FadeInDown.delay(150).springify()}
              style={{ marginTop: 26 }}
            >
              <Text
                style={{
                  fontFamily: FONT.extrabold,
                  fontSize: 11,
                  color: PAL.textMuted,
                  letterSpacing: 1.5,
                  marginBottom: 10,
                }}
              >
                {t("auth.role").toUpperCase()}
              </Text>
              <View style={{ flexDirection: "row", gap: 10 }}>
                {(["student", "teacher"] as const).map((r) => {
                  const active = role === r;
                  return (
                    <Pressable
                      key={r}
                      onPress={() => {
                        Haptics.selectionAsync();
                        setRole(r);
                        react(
                          "happy",
                          r === "student"
                            ? "Let's learn together! 🎒"
                            : "Welcome back, teacher! 👩‍🏫"
                        );
                      }}
                      style={{
                        paddingHorizontal: 18,
                        paddingVertical: 10,
                        borderRadius: 999,
                        backgroundColor: active ? PAL.primary : "transparent",
                        borderWidth: 1.5,
                        borderColor: active ? PAL.primary : PAL.divider,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Text style={{ fontSize: 14 }}>
                        {r === "student" ? "🎒" : "👩‍🏫"}
                      </Text>
                      <Text
                        style={{
                          fontFamily: FONT.extrabold,
                          fontSize: 13,
                          color: active ? "#FFFFFF" : PAL.text,
                        }}
                      >
                        {r === "student" ? t("auth.student") : t("auth.teacher")}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </Animated.View>

            {/* ===== Inputs ===== */}
            <Animated.View
              entering={FadeInDown.delay(200).springify()}
              style={{ marginTop: 26 }}
            >
              <MinimalInput
                label={t("auth.email")}
                icon="✉️"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                focused={focusField === "email"}
                onFocus={() => setFocusField("email")}
                onBlur={() => setFocusField(null)}
              />
              <MinimalInput
                label={t("auth.password")}
                icon="🔒"
                value={pw}
                onChangeText={setPw}
                secure
                focused={focusField === "pw"}
                onFocus={() => {
                  setFocusField("pw");
                  react("thinking", "Shh... typing secretly 🤫");
                }}
                onBlur={() => setFocusField(null)}
              />
            </Animated.View>

            {/* ===== Login button — plain, no big card ===== */}
            <Animated.View entering={FadeInDown.delay(300).springify()}>
              <Pressable
                onPress={() => {
                  Haptics.notificationAsync(
                    Haptics.NotificationFeedbackType.Success
                  );
                  router.replace("/(student)/grades");
                }}
                style={{
                  backgroundColor: PAL.primary,
                  borderRadius: 999,
                  paddingVertical: 16,
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 8,
                  flexDirection: "row",
                  gap: 8,
                }}
              >
                <Text
                  style={{
                    fontFamily: FONT.extrabold,
                    fontSize: 16,
                    color: "#FFFFFF",
                    letterSpacing: 0.3,
                  }}
                >
                  {t("auth.login")}
                </Text>
                <Text style={{ fontSize: 16, color: "#FFFFFF" }}>→</Text>
              </Pressable>
            </Animated.View>

            {/* ===== Switch to signup ===== */}
            <Pressable
              onPress={() => {
                Haptics.selectionAsync();
                router.push("/(auth)/signup");
              }}
              style={{ marginTop: 20, alignItems: "center" }}
            >
              <Text
                style={{
                  fontFamily: FONT.semibold,
                  fontSize: 13,
                  color: PAL.textMuted,
                }}
              >
                {t("auth.switchToSignup")}
              </Text>
            </Pressable>

            {/* ===== Divider ===== */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                marginTop: 24,
                marginBottom: 16,
              }}
            >
              <View style={{ flex: 1, height: 1, backgroundColor: PAL.divider }} />
              <Text
                style={{
                  fontFamily: FONT.bold,
                  fontSize: 11,
                  color: PAL.textMuted,
                }}
              >
                OR
              </Text>
              <View style={{ flex: 1, height: 1, backgroundColor: PAL.divider }} />
            </View>

            {/* ===== Guest button — plain outline ===== */}
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.replace("/(student)/grades");
              }}
              style={{
                borderRadius: 999,
                paddingVertical: 14,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1.5,
                borderColor: PAL.divider,
                flexDirection: "row",
                gap: 8,
              }}
            >
              <Text style={{ fontSize: 16 }}>🚀</Text>
              <Text
                style={{
                  fontFamily: FONT.extrabold,
                  fontSize: 14,
                  color: PAL.text,
                }}
              >
                {t("auth.orGuest")}
              </Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}