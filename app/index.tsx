import { View, Text, Dimensions, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useLang } from "@/lib/language-context";
import { useMode } from "@/lib/mode-context";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  Easing,
  FadeInDown,
  FadeIn,
  interpolate,
} from "react-native-reanimated";
import { useEffect, useState } from "react";
import { FONT } from "@/lib/design";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

// ============================================================
// PALETTE — warm, friendly, kid-safe
// ============================================================
const PAL = {
  bg: "#FFF8F0",           // warm cream
  bgTop: "#FFE8D6",        // peachy top
  bgBottom: "#E8F4FF",     // sky bottom

  primary: "#FF6B6B",      // coral red (Pip's body)
  primaryDark: "#E05050",
  primaryLight: "#FF9999",

  secondary: "#4ECDC4",    // teal (Pip's window)
  secondaryDark: "#3BA89F",

  accent: "#FFD93D",       // sunny yellow
  accentDark: "#E5C020",

  purple: "#A78BFA",
  purpleDark: "#8B6FE0",

  text: "#2D2422",         // warm dark brown
  textMuted: "#7A6A63",
  textLight: "#FFFFFF",

  bubble: "#FFFFFF",
  bubbleBorder: "#E8DDD5",
};

// ============================================================
// CHARACTER STATE
// ============================================================
type Mood = "idle" | "happy" | "excited" | "wave" | "sleepy";

// ============================================================
// PIP THE ROCKET — the mascot
// ============================================================
function Pip({
  mood = "idle",
  size = 180,
}: {
  mood?: Mood;
  size?: number;
}) {
  // Idle bobbing
  const bob = useSharedValue(0);
  // Eye blink
  const blink = useSharedValue(1);
  // Wave arm (for wave mood)
  const wave = useSharedValue(0);

  useEffect(() => {
    // Bobbing loop
    bob.value = withRepeat(
      withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    // Blink loop
    blink.value = withRepeat(
      withSequence(
        withTiming(0.1, { duration: 100 }),
        withTiming(1, { duration: 200 }),
        withDelay(2800, withTiming(1, { duration: 100 }))
      ),
      -1,
      false
    );
    // Wave loop (only when mood === "wave")
    if (mood === "wave") {
      wave.value = withRepeat(
        withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    }
  }, [mood]);

  const bodyAnim = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(bob.value, [0, 1], [0, -10]) },
      {
        rotate:
          mood === "excited"
            ? `${interpolate(bob.value, [0, 1], [-4, 4])}deg`
            : "0deg",
      },
    ],
  }));

  const eyeAnim = useAnimatedStyle(() => ({
    transform: [{ scaleY: blink.value }],
  }));

  const waveAnim = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${interpolate(wave.value, [0, 1], [0, -25])}deg` },
    ],
  }));

  // Eye mood variants
  const eyeShape =
    mood === "happy"
      ? "M 0 4 Q 4 0, 8 4" // smiling arc
      : mood === "sleepy"
      ? "M 0 4 L 8 4" // flat line
      : null;

  return (
    <Animated.View style={[bodyAnim, { alignItems: "center" }]}>
      <View style={{ width: size, height: size * 1.35, alignItems: "center" }}>
        {/* ==== Flames (bottom) ==== */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            width: size * 0.35,
            height: size * 0.4,
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          <LinearGradient
            colors={[PAL.accent, "#FFB84D", "rgba(255,184,77,0)"]}
            style={{
              width: size * 0.3,
              height: size * 0.38,
              borderTopLeftRadius: size * 0.15,
              borderTopRightRadius: size * 0.15,
              borderBottomLeftRadius: size * 0.04,
              borderBottomRightRadius: size * 0.04,
            }}
          />
        </View>

        {/* ==== Fins (side wings) ==== */}
        <View
          style={{
            position: "absolute",
            bottom: size * 0.35,
            left: size * 0.04,
            width: size * 0.18,
            height: size * 0.35,
            backgroundColor: PAL.primaryDark,
            borderTopLeftRadius: size * 0.1,
            borderBottomLeftRadius: size * 0.18,
            transform: [{ rotate: "-15deg" }],
          }}
        />
        <View
          style={{
            position: "absolute",
            bottom: size * 0.35,
            right: size * 0.04,
            width: size * 0.18,
            height: size * 0.35,
            backgroundColor: PAL.primaryDark,
            borderTopRightRadius: size * 0.1,
            borderBottomRightRadius: size * 0.18,
            transform: [{ rotate: "15deg" }],
          }}
        />

        {/* ==== Main body (rocket) ==== */}
        <View
          style={{
            position: "absolute",
            bottom: size * 0.18,
            width: size * 0.7,
            height: size * 0.9,
            borderRadius: size * 0.35,
            backgroundColor: PAL.primary,
            borderWidth: 3,
            borderColor: PAL.primaryDark,
            overflow: "hidden",
            shadowColor: PAL.primaryDark,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          {/* Body highlight */}
          <View
            style={{
              position: "absolute",
              top: size * 0.06,
              left: size * 0.1,
              width: size * 0.12,
              height: size * 0.5,
              borderRadius: size * 0.06,
              backgroundColor: "rgba(255,255,255,0.4)",
            }}
          />

          {/* ==== Face panel (white area) ==== */}
          <View
            style={{
              position: "absolute",
              top: size * 0.14,
              left: size * 0.06,
              right: size * 0.06,
              bottom: size * 0.06,
              borderRadius: size * 0.28,
              backgroundColor: "#FFF5F0",
              borderWidth: 2,
              borderColor: PAL.primaryDark,
            }}
          >
            {/* ==== Eyes ==== */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                gap: size * 0.14,
                marginTop: size * 0.12,
              }}
            >
              {[0, 1].map((i) => (
                <Animated.View
                  key={i}
                  style={[
                    eyeAnim,
                    {
                      width: size * 0.1,
                      height: size * 0.13,
                      borderRadius: size * 0.05,
                      backgroundColor: "#2D2422",
                      alignItems: "center",
                      justifyContent: "flex-start",
                      overflow: "hidden",
                    },
                  ]}
                >
                  {/* Eye sparkle */}
                  <View
                    style={{
                      width: size * 0.04,
                      height: size * 0.04,
                      borderRadius: size * 0.02,
                      backgroundColor: "#FFFFFF",
                      marginTop: size * 0.02,
                      marginLeft: size * 0.03,
                    }}
                  />
                </Animated.View>
              ))}
            </View>

            {/* ==== Cheeks (blush) ==== */}
            <View
              style={{
                position: "absolute",
                top: size * 0.32,
                left: size * 0.1,
                width: size * 0.09,
                height: size * 0.05,
                borderRadius: size * 0.025,
                backgroundColor: "#FFB5B5",
                opacity: 0.7,
              }}
            />
            <View
              style={{
                position: "absolute",
                top: size * 0.32,
                right: size * 0.1,
                width: size * 0.09,
                height: size * 0.05,
                borderRadius: size * 0.025,
                backgroundColor: "#FFB5B5",
                opacity: 0.7,
              }}
            />

            {/* ==== Mouth ==== */}
            <View
              style={{
                alignSelf: "center",
                marginTop: size * 0.06,
                width: mood === "excited" ? size * 0.16 : size * 0.12,
                height: mood === "excited" ? size * 0.12 : size * 0.07,
                borderBottomLeftRadius: size * 0.08,
                borderBottomRightRadius: size * 0.08,
                backgroundColor: "#2D2422",
                overflow: "hidden",
              }}
            >
              {/* Tongue */}
              <View
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: "25%",
                  right: "25%",
                  height: "45%",
                  borderTopLeftRadius: size * 0.03,
                  borderTopRightRadius: size * 0.03,
                  backgroundColor: "#FF6B8A",
                }}
              />
            </View>
          </View>

          {/* ==== Window (top of rocket) ==== */}
          <View
            style={{
              position: "absolute",
              top: -size * 0.06,
              alignSelf: "center",
              width: size * 0.22,
              height: size * 0.22,
              borderRadius: size * 0.11,
              backgroundColor: PAL.secondary,
              borderWidth: 3,
              borderColor: PAL.secondaryDark,
            }}
          >
            <View
              style={{
                position: "absolute",
                top: size * 0.02,
                left: size * 0.04,
                width: size * 0.06,
                height: size * 0.06,
                borderRadius: size * 0.03,
                backgroundColor: "rgba(255,255,255,0.6)",
              }}
            />
          </View>
        </View>

        {/* ==== Waving arm (right side) ==== */}
        {mood === "wave" && (
          <Animated.View
            style={[
              waveAnim,
              {
                position: "absolute",
                top: size * 0.55,
                right: -size * 0.04,
                width: size * 0.14,
                height: size * 0.28,
                backgroundColor: PAL.primary,
                borderWidth: 2,
                borderColor: PAL.primaryDark,
                borderRadius: size * 0.07,
                transformOrigin: "bottom center",
              },
            ]}
          />
        )}
      </View>
    </Animated.View>
  );
}

// ============================================================
// SPEECH BUBBLE — replaces formal copy
// ============================================================
function SpeechBubble({
  children,
  tailDirection = "bottom",
  style,
}: {
  children: React.ReactNode;
  tailDirection?: "bottom" | "left";
  style?: any;
}) {
  return (
    <View style={[{ alignItems: "center" }, style]}>
      <View
        style={{
          backgroundColor: PAL.bubble,
          borderRadius: 20,
          borderWidth: 2,
          borderColor: PAL.bubbleBorder,
          paddingHorizontal: 16,
          paddingVertical: 12,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        {children}
      </View>
      {/* Tail */}
      {tailDirection === "bottom" && (
        <View
          style={{
            width: 0,
            height: 0,
            borderLeftWidth: 10,
            borderRightWidth: 10,
            borderTopWidth: 12,
            borderLeftColor: "transparent",
            borderRightColor: "transparent",
            borderTopColor: PAL.bubble,
            marginTop: -2,
          }}
        />
      )}
    </View>
  );
}

// ============================================================
// CHARACTER BUTTON — Pip reacts on press
// ============================================================
function CharButton({
  label,
  icon,
  color = PAL.primary,
  onPress,
  onPressInChar,
  onPressOutChar,
  style,
}: {
  label: string;
  icon?: string;
  color?: string;
  onPress: () => void;
  onPressInChar?: () => void;
  onPressOutChar?: () => void;
  style?: any;
}) {
  const [pressed, setPressed] = useState(false);
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withSpring(pressed ? 0.94 : 1, { damping: 12, stiffness: 300 });
  }, [pressed]);

  const anim = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: pressed ? 4 : 0 }],
  }));

  return (
    <Animated.View style={[anim, style]}>
      <Pressable
        onPressIn={() => {
          setPressed(true);
          onPressInChar?.();
        }}
        onPressOut={() => {
          setPressed(false);
          onPressOutChar?.();
        }}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onPress();
        }}
        style={{
          borderRadius: 22,
          backgroundColor: color,
          borderWidth: 3,
          borderColor: darken(color, 0.75),
          paddingVertical: 18,
          paddingHorizontal: 24,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: darken(color, 0.7),
          shadowOffset: { width: 0, height: pressed ? 2 : 6 },
          shadowOpacity: 0.4,
          shadowRadius: pressed ? 4 : 10,
          elevation: pressed ? 2 : 6,
        }}
      >
        <Text
          style={{
            fontFamily: FONT.extrabold,
            fontSize: 16,
            color: "#FFFFFF",
            letterSpacing: 0.4,
            textShadowColor: darken(color, 0.6),
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 1,
          }}
        >
          {icon ? `${icon}  ` : ""}
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

// Utility
function darken(hex: string, factor: number): string {
  const h = hex.replace("#", "");
  const r = Math.round(parseInt(h.substring(0, 2), 16) * factor);
  const g = Math.round(parseInt(h.substring(2, 4), 16) * factor);
  const b = Math.round(parseInt(h.substring(4, 6), 16) * factor);
  return `rgb(${r},${g},${b})`;
}

// ============================================================
// MAIN SCREEN
// ============================================================
export default function Welcome() {
  const router = useRouter();
  const { t } = useTranslation();
  const { lang, setLang } = useLang();
  const { setMode } = useMode();

  // Character reacts to interactions
  const [mood, setMood] = useState<Mood>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const triggerMood = (m: Mood, msg?: string, duration = 1500) => {
    setMood(m);
    if (msg) setMessage(msg);
    setTimeout(() => {
      setMood("idle");
      setMessage(null);
    }, duration);
  };

  return (
    <View style={{ flex: 1, backgroundColor: PAL.bg }}>
      {/* ==== Sky background ==== */}
      <LinearGradient
        colors={[PAL.bgTop, PAL.bg, PAL.bgBottom]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* ==== Decorative clouds (soft, low-key) ==== */}
      <View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { opacity: 0.5 }]}
      >
        <View
          style={{
            position: "absolute",
            top: 80,
            left: -30,
            width: 100,
            height: 60,
            borderRadius: 30,
            backgroundColor: "#FFFFFF",
          }}
        />
        <View
          style={{
            position: "absolute",
            top: 100,
            left: 10,
            width: 80,
            height: 60,
            borderRadius: 30,
            backgroundColor: "#FFFFFF",
          }}
        />
        <View
          style={{
            position: "absolute",
            top: 150,
            right: -20,
            width: 90,
            height: 55,
            borderRadius: 30,
            backgroundColor: "#FFFFFF",
          }}
        />
      </View>

      {/* ==== Distant stars (subtle) ==== */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {[
          { top: 60, left: 60 },
          { top: 120, right: 80 },
          { top: 200, left: 40 },
          { top: 300, right: 100 },
          { top: 400, left: 80 },
        ].map((pos, i) => (
          <Text
            key={i}
            style={{
              position: "absolute",
              fontSize: 12,
              opacity: 0.4,
              ...pos,
            } as any}
          >
            ✨
          </Text>
        ))}
      </View>

      <SafeAreaView style={{ flex: 1 }}>
        <View
          style={{
            flex: 1,
            paddingHorizontal: isTablet ? 48 : 24,
            maxWidth: isTablet ? 720 : undefined,
            alignSelf: "center",
            width: "100%",
            paddingTop: 8,
          }}
        >
          {/* ==== TOP BAR: Pip mini + language ==== */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              {/* Tiny Pip avatar */}
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: PAL.primary,
                  borderWidth: 2,
                  borderColor: PAL.primaryDark,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 18 }}>🚀</Text>
              </View>
              <Text
                style={{
                  fontFamily: FONT.extrabold,
                  fontSize: 13,
                  color: PAL.text,
                  letterSpacing: 1.5,
                }}
              >
                ONLINE SCHOOL
              </Text>
            </View>

            {/* Language — simple pill */}
            <View
              style={{
                flexDirection: "row",
                backgroundColor: "rgba(255,255,255,0.7)",
                borderRadius: 999,
                padding: 3,
                borderWidth: 2,
                borderColor: PAL.bubbleBorder,
              }}
            >
              {(["my", "en"] as const).map((l) => {
                const active = lang === l;
                return (
                  <Pressable
                    key={l}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setLang(l);
                      triggerMood("happy", l === "en" ? "Hello!" : "မင်္ဂလာပါ!");
                    }}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 6,
                      borderRadius: 999,
                      backgroundColor: active ? PAL.primary : "transparent",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: FONT.extrabold,
                        fontSize: 12,
                        color: active ? "#FFFFFF" : PAL.textMuted,
                      }}
                    >
                      {l.toUpperCase()}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* ==== HEADLINE (compact, above character) ==== */}
          <Animated.View
            entering={FadeInDown.delay(100).springify()}
            style={{ marginTop: 16, marginBottom: 8 }}
          >
            <Text
              style={{
                fontFamily: FONT.extrabold,
                fontSize: isTablet ? 44 : 32,
                lineHeight: isTablet ? 50 : 38,
                color: PAL.text,
                letterSpacing: -0.8,
              }}
            >
              {t("welcome.hello")}{" "}
              <Text style={{ color: PAL.primary }}>
                {t("welcome.little")}
              </Text>
            </Text>
            <Text
              style={{
                fontFamily: FONT.extrabold,
                fontSize: isTablet ? 44 : 32,
                lineHeight: isTablet ? 50 : 38,
                color: PAL.purple,
                letterSpacing: -0.8,
              }}
            >
              {t("welcome.explorers")}
            </Text>
          </Animated.View>

          {/* ==== CHARACTER ZONE — Pip takes center stage ==== */}
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              minHeight: isTablet ? 320 : 260,
            }}
          >
            {/* Speech bubble above Pip */}
            <Animated.View
              entering={FadeIn.delay(400)}
              style={{ minHeight: 60, justifyContent: "flex-end" }}
            >
              <SpeechBubble>
                <Text
                  style={{
                    fontFamily: FONT.extrabold,
                    fontSize: 14,
                    color: PAL.text,
                    textAlign: "center",
                  }}
                >
                  {message || t("welcome.tagline")}
                </Text>
              </SpeechBubble>
            </Animated.View>

            {/* Pip */}
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                triggerMood("excited", "Yay! Let's learn! 🎉", 1800);
              }}
            >
              <Pip mood={mood} size={isTablet ? 200 : 160} />
            </Pressable>
          </View>

          {/* ==== BUTTONS — each triggers Pip reaction ==== */}
          <Animated.View entering={FadeInDown.delay(500).springify()}>
            <CharButton
              label={t("welcome.playGuest")}
              icon="🚀"
              color={PAL.primary}
              onPress={() => router.push("/(student)/grades")}
              onPressInChar={() => triggerMood("excited", "Blast off! 🚀", 1200)}
              onPressOutChar={() => setMood("idle")}
              style={{ marginBottom: 12 }}
            />
            <CharButton
              label={t("welcome.login")}
              icon="🔑"
              color={PAL.secondary}
              onPress={() => router.push("/(auth)/login")}
              onPressInChar={() => triggerMood("happy", "Welcome back! 👋", 1200)}
              onPressOutChar={() => setMood("idle")}
              style={{ marginBottom: 12 }}
            />
            <CharButton
              label={t("welcome.teacher")}
              icon="👩‍🏫"
              color={PAL.purple}
              onPress={() => {
                setMode("teacher");
                router.push("/(teacher)/dashboard");
              }}
              onPressInChar={() => triggerMood("wave", "Hi teacher! 👋", 1600)}
              onPressOutChar={() => setMood("idle")}
            />
          </Animated.View>

          <Text
            style={{
              textAlign: "center",
              fontFamily: FONT.semibold,
              fontSize: 11,
              color: PAL.textMuted,
              marginTop: 16,
              marginBottom: 6,
            }}
          >
            {t("welcome.help")}  ·  v1.0.0
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}