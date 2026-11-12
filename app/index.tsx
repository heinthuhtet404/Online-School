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

const PAL = {
  bg: "#FFF8F0", bgTop: "#FFE8D6", bgBottom: "#E8F4FF",
  primary: "#FF6B6B", primaryDark: "#E05050", primaryLight: "#FF9999",
  secondary: "#4ECDC4", secondaryDark: "#3BA89F",
  accent: "#FFD93D", accentDark: "#E5C020",
  purple: "#A78BFA", purpleDark: "#8B6FE0",
  text: "#2D2422", textMuted: "#7A6A63", textLight: "#FFFFFF",
  bubble: "#FFFFFF", bubbleBorder: "#E8DDD5",
};

const TEACHER = {
  primary: "#2C7A7B", primaryDark: "#1E5C5D", accent: "#9F7AEA", accentDark: "#7C5CC7",
};

type Mood = "idle" | "happy" | "excited" | "wave" | "sleepy";

function Pip({ mood = "idle", size = 180 }: { mood?: Mood; size?: number }) {
  const bob = useSharedValue(0);
  const blink = useSharedValue(1);
  const wave = useSharedValue(0);

  useEffect(() => {
    bob.value = withRepeat(withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.ease) }), -1, true);
    blink.value = withRepeat(withSequence(withTiming(0.1, { duration: 100 }), withTiming(1, { duration: 200 }), withDelay(2800, withTiming(1, { duration: 100 }))), -1, false);
    if (mood === "wave") { wave.value = withRepeat(withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) }), -1, true); }
  }, [mood]);

  const bodyAnim = useAnimatedStyle(() => ({ transform: [{ translateY: interpolate(bob.value, [0, 1], [0, -10]) }, { rotate: mood === "excited" ? `${interpolate(bob.value, [0, 1], [-4, 4])}deg` : "0deg" }] }));
  const eyeAnim = useAnimatedStyle(() => ({ transform: [{ scaleY: blink.value }] }));
  const waveAnim = useAnimatedStyle(() => ({ transform: [{ rotate: `${interpolate(wave.value, [0, 1], [0, -25])}deg` }] }));

  return (
    <Animated.View style={[bodyAnim, { alignItems: "center" }]}>
      <View style={{ width: size, height: size * 1.35, alignItems: "center" }}>
        <View style={{ position: "absolute", bottom: 0, width: size * 0.35, height: size * 0.4, alignItems: "center", justifyContent: "flex-end" }}>
          <LinearGradient colors={[PAL.accent, "#FFB84D", "rgba(255,184,77,0)"]} style={{ width: size * 0.3, height: size * 0.38, borderTopLeftRadius: size * 0.15, borderTopRightRadius: size * 0.15, borderBottomLeftRadius: size * 0.04, borderBottomRightRadius: size * 0.04 }} />
        </View>
        <View style={{ position: "absolute", bottom: size * 0.35, left: size * 0.04, width: size * 0.18, height: size * 0.35, backgroundColor: PAL.primaryDark, borderTopLeftRadius: size * 0.1, borderBottomLeftRadius: size * 0.18, transform: [{ rotate: "-15deg" }] }} />
        <View style={{ position: "absolute", bottom: size * 0.35, right: size * 0.04, width: size * 0.18, height: size * 0.35, backgroundColor: PAL.primaryDark, borderTopRightRadius: size * 0.1, borderBottomRightRadius: size * 0.18, transform: [{ rotate: "15deg" }] }} />
        <View style={{ position: "absolute", bottom: size * 0.18, width: size * 0.7, height: size * 0.9, borderRadius: size * 0.35, backgroundColor: PAL.primary, borderWidth: 3, borderColor: PAL.primaryDark, overflow: "hidden", shadowColor: PAL.primaryDark, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 }}>
          <View style={{ position: "absolute", top: size * 0.06, left: size * 0.1, width: size * 0.12, height: size * 0.5, borderRadius: size * 0.06, backgroundColor: "rgba(255,255,255,0.4)" }} />
          <View style={{ position: "absolute", top: size * 0.14, left: size * 0.06, right: size * 0.06, bottom: size * 0.06, borderRadius: size * 0.28, backgroundColor: "#FFF5F0", borderWidth: 2, borderColor: PAL.primaryDark }}>
            <View style={{ flexDirection: "row", justifyContent: "center", gap: size * 0.14, marginTop: size * 0.12 }}>
              {[0, 1].map((i) => (
                <Animated.View key={i} style={[eyeAnim, { width: size * 0.1, height: size * 0.13, borderRadius: size * 0.05, backgroundColor: "#2D2422", alignItems: "center", justifyContent: "flex-start", overflow: "hidden" }]}>
                  <View style={{ width: size * 0.04, height: size * 0.04, borderRadius: size * 0.02, backgroundColor: "#FFFFFF", marginTop: size * 0.02, marginLeft: size * 0.03 }} />
                </Animated.View>
              ))}
            </View>
            <View style={{ position: "absolute", top: size * 0.32, left: size * 0.1, width: size * 0.09, height: size * 0.05, borderRadius: size * 0.025, backgroundColor: "#FFB5B5", opacity: 0.7 }} />
            <View style={{ position: "absolute", top: size * 0.32, right: size * 0.1, width: size * 0.09, height: size * 0.05, borderRadius: size * 0.025, backgroundColor: "#FFB5B5", opacity: 0.7 }} />
            <View style={{ alignSelf: "center", marginTop: size * 0.06, width: mood === "excited" ? size * 0.16 : size * 0.12, height: mood === "excited" ? size * 0.12 : size * 0.07, borderBottomLeftRadius: size * 0.08, borderBottomRightRadius: size * 0.08, backgroundColor: "#2D2422", overflow: "hidden" }}>
              <View style={{ position: "absolute", bottom: 0, left: "25%", right: "25%", height: "45%", borderTopLeftRadius: size * 0.03, borderTopRightRadius: size * 0.03, backgroundColor: "#FF6B8A" }} />
            </View>
          </View>
          <View style={{ position: "absolute", top: -size * 0.06, alignSelf: "center", width: size * 0.22, height: size * 0.22, borderRadius: size * 0.11, backgroundColor: PAL.secondary, borderWidth: 3, borderColor: PAL.secondaryDark }}>
            <View style={{ position: "absolute", top: size * 0.02, left: size * 0.04, width: size * 0.06, height: size * 0.06, borderRadius: size * 0.03, backgroundColor: "rgba(255,255,255,0.6)" }} />
          </View>
        </View>
        {mood === "wave" && (
          <Animated.View style={[waveAnim, { position: "absolute", top: size * 0.55, right: -size * 0.04, width: size * 0.14, height: size * 0.28, backgroundColor: PAL.primary, borderWidth: 2, borderColor: PAL.primaryDark, borderRadius: size * 0.07, transformOrigin: "bottom center" }]} />
        )}
      </View>
    </Animated.View>
  );
}

function SpeechBubble({ children, style }: { children: React.ReactNode; style?: any }) {
  return (
    <View style={[{ alignItems: "center" }, style]}>
      <View style={{ backgroundColor: PAL.bubble, borderRadius: 20, borderWidth: 2, borderColor: PAL.bubbleBorder, paddingHorizontal: 16, paddingVertical: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 }}>
        {children}
      </View>
      <View style={{ width: 0, height: 0, borderLeftWidth: 10, borderRightWidth: 10, borderTopWidth: 12, borderLeftColor: "transparent", borderRightColor: "transparent", borderTopColor: PAL.bubble, marginTop: -2 }} />
    </View>
  );
}

function ActionButton({ label, icon, colors, shadowColor, textColor = "#FFFFFF", onPress, onPressInChar, onPressOutChar, style }: any) {
  const [pressed, setPressed] = useState(false);
  const scale = useSharedValue(1);
  const glow = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(pressed ? 0.96 : 1, { damping: 14, stiffness: 320 });
    glow.value = withTiming(pressed ? 1 : 0, { duration: 150 });
  }, [pressed]);

  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }, { translateY: pressed ? 3 : 0 }] }));
  const glowAnim = useAnimatedStyle(() => ({ opacity: interpolate(glow.value, [0, 1], [0.35, 0.7]), transform: [{ scale: interpolate(glow.value, [0, 1], [1, 1.04]) }] }));

  return (
    <Animated.View style={[anim, style]}>
      <Animated.View pointerEvents="none" style={[{ position: "absolute", top: 4, left: 4, right: 4, bottom: -4, borderRadius: 22, backgroundColor: shadowColor }, glowAnim]} />
      <Pressable
        onPressIn={() => { setPressed(true); onPressInChar?.(); }}
        onPressOut={() => { setPressed(false); onPressOutChar?.(); }}
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onPress(); }}
        style={{ borderRadius: 22, overflow: "hidden", shadowColor: shadowColor, shadowOffset: { width: 0, height: pressed ? 2 : 5 }, shadowOpacity: pressed ? 0.25 : 0.35, shadowRadius: pressed ? 4 : 10, elevation: pressed ? 2 : 6 }}
      >
        <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingVertical: 16, paddingHorizontal: 18, flexDirection: "row", alignItems: "center", gap: 14 }}>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.25)", alignItems: "center", justifyContent: "center" }}>
            <Text style={{ fontSize: 20 }}>{icon}</Text>
          </View>
          <Text style={{ flex: 1, fontFamily: FONT.extrabold, fontSize: 16, color: textColor, letterSpacing: 0.2 }}>{label}</Text>
          <Text style={{ fontSize: 20, color: textColor, fontWeight: "900", opacity: 0.85 }}>→</Text>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

export default function Welcome() {
  const router = useRouter();
  const { t } = useTranslation();
  const { lang, setLang } = useLang();
  const { setMode } = useMode();

  const [mood, setMood] = useState<Mood>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const triggerMood = (m: Mood, msg?: string, duration = 1500) => {
    setMood(m);
    if (msg) setMessage(msg);
    setTimeout(() => { setMood("idle"); setMessage(null); }, duration);
  };

  return (
    <View style={{ flex: 1, backgroundColor: PAL.bg }}>
      <LinearGradient colors={[PAL.bgTop, PAL.bg, PAL.bgBottom]} locations={[0, 0.5, 1]} style={StyleSheet.absoluteFill} />

      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity: 0.5 }]}>
        <View style={{ position: "absolute", top: 80, left: -30, width: 100, height: 60, borderRadius: 30, backgroundColor: "#FFFFFF" }} />
        <View style={{ position: "absolute", top: 100, left: 10, width: 80, height: 60, borderRadius: 30, backgroundColor: "#FFFFFF" }} />
        <View style={{ position: "absolute", top: 150, right: -20, width: 90, height: 55, borderRadius: 30, backgroundColor: "#FFFFFF" }} />
      </View>

      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {[{ top: 60, left: 60 }, { top: 120, right: 80 }, { top: 200, left: 40 }, { top: 300, right: 100 }, { top: 400, left: 80 }].map((pos, i) => (
          <Text key={i} style={{ position: "absolute", fontSize: 12, opacity: 0.4, ...pos } as any}>✨</Text>
        ))}
      </View>

      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1, paddingHorizontal: isTablet ? 48 : 24, maxWidth: isTablet ? 720 : undefined, alignSelf: "center", width: "100%", paddingTop: 8 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: PAL.primary, borderWidth: 2, borderColor: PAL.primaryDark, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontSize: 18 }}>🚀</Text>
              </View>
              <Text style={{ fontFamily: FONT.extrabold, fontSize: 13, color: PAL.text, letterSpacing: 1.5 }}>ONLINE SCHOOL</Text>
            </View>
            <View style={{ flexDirection: "row", backgroundColor: "rgba(255,255,255,0.7)", borderRadius: 999, padding: 3, borderWidth: 2, borderColor: PAL.bubbleBorder }}>
              {(["my", "en"] as const).map((l) => {
                const active = lang === l;
                return (
                  <Pressable key={l} onPress={() => { Haptics.selectionAsync(); setLang(l); triggerMood("happy", l === "en" ? "Hello!" : "မင်္ဂလာပါ!"); }} style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999, backgroundColor: active ? PAL.primary : "transparent" }}>
                    <Text style={{ fontFamily: FONT.extrabold, fontSize: 12, color: active ? "#FFFFFF" : PAL.textMuted }}>{l.toUpperCase()}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Animated.View entering={FadeInDown.delay(100).springify()} style={{ marginTop: 16, marginBottom: 8 }}>
            <Text style={{ fontFamily: FONT.extrabold, fontSize: isTablet ? 44 : 32, lineHeight: isTablet ? 50 : 38, color: PAL.text, letterSpacing: -0.8 }}>
              {t("welcome.hello")} <Text style={{ color: PAL.primary }}>{t("welcome.little")}</Text>
            </Text>
            <Text style={{ fontFamily: FONT.extrabold, fontSize: isTablet ? 44 : 32, lineHeight: isTablet ? 50 : 38, color: PAL.purple, letterSpacing: -0.8 }}>
              {t("welcome.explorers")}
            </Text>
          </Animated.View>

          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", minHeight: isTablet ? 320 : 260 }}>
            <Animated.View entering={FadeIn.delay(400)} style={{ minHeight: 60, justifyContent: "flex-end" }}>
              <SpeechBubble>
                <Text style={{ fontFamily: FONT.extrabold, fontSize: 14, color: PAL.text, textAlign: "center" }}>{message || t("welcome.tagline")}</Text>
              </SpeechBubble>
            </Animated.View>
            <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); triggerMood("excited", "Yay! Let's learn! 🎉", 1800); }}>
              <Pip mood={mood} size={isTablet ? 200 : 160} />
            </Pressable>
          </View>

          <Animated.View entering={FadeInDown.delay(500).springify()}>
            <ActionButton label={t("welcome.playGuest")} icon="🚀" colors={["#FF8A8A", "#FF6B6B"]} shadowColor={PAL.primaryDark} onPress={() => { setMode("student"); router.push("/(student)/grades"); }} onPressInChar={() => triggerMood("excited", "Blast off! 🚀", 1200)} onPressOutChar={() => setMood("idle")} style={{ marginBottom: 12 }} />
            <ActionButton label={t("auth.studentLogin")} icon="🔑" colors={["#B8A4F0", "#A78BFA"]} shadowColor={PAL.purpleDark} onPress={() => router.push("/(auth)/login")} onPressInChar={() => triggerMood("happy", "Welcome back! 👋", 1200)} onPressOutChar={() => setMood("idle")} style={{ marginBottom: 12 }} />
            <ActionButton label={t("auth.teacherLogin")} icon="👩‍🏫" colors={["#3D8B8C", "#2C7A7B"]} shadowColor={TEACHER.primaryDark} onPress={() => { setMode("teacher"); router.push("/(auth)/teacher-login"); }} onPressInChar={() => triggerMood("wave", "Hi teacher! 👋", 1600)} onPressOutChar={() => setMood("idle")} />
          </Animated.View>

          <Text style={{ textAlign: "center", fontFamily: FONT.semibold, fontSize: 11, color: PAL.textMuted, marginTop: 16, marginBottom: 6 }}>
            {t("welcome.help")} · v1.0.0
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}