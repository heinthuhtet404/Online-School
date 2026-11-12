import { View, Text, Dimensions, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "expo-router/js-tabs";
import { useTranslation } from "react-i18next";
import { useState, useEffect, useRef } from "react";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  FadeInDown,
  FadeIn,
  interpolate,
} from "react-native-reanimated";
import { FONT } from "@/lib/design";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

const PAL = {
  bg: "#FFF8F0", bgTop: "#FFE8D6", bgBottom: "#E8F4FF",
  primary: "#FF6B6B", primaryDark: "#E05050",
  secondary: "#4ECDC4", secondaryDark: "#3BA89F",
  accent: "#FFD93D", accentDark: "#E5C020",
  text: "#2D2422", textMuted: "#7A6A63",
  divider: "#EDE3D8",
};

type Player = { id: string; name: string; avatar: string; score: number; isYou?: boolean };

const WEEK: Player[] = [
  { id: "1", name: "Aung Aung", avatar: "🦊", score: 1250 },
  { id: "2", name: "Su Su", avatar: "🐬", score: 1180 },
  { id: "3", name: "Kyaw Kyaw", avatar: "🦉", score: 990 },
  { id: "4", name: "Mya Mya", avatar: "🐣", score: 870 },
  { id: "5", name: "Zin Zin", avatar: "🚀", score: 760 },
  { id: "you", name: "You", avatar: "😎", score: 620, isYou: true },
  { id: "6", name: "Thura", avatar: "🌱", score: 540 },
];

type Mood = "idle" | "happy" | "excited" | "thinking" | "wave";

function Pip({ mood = "idle", size = 80, prop, flameTop = PAL.accent, flameBottom = "#FFB84D" }: { mood?: Mood; size?: number; prop?: string; flameTop?: string; flameBottom?: string }) {
  const bob = useSharedValue(0);
  const blink = useSharedValue(1);
  const propScale = useSharedValue(0);
  useEffect(() => {
    bob.value = withRepeat(withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.ease) }), -1, true);
    blink.value = withRepeat(withSequence(withTiming(0.1, { duration: 100 }), withTiming(1, { duration: 200 }), withDelay(2800, withTiming(1, { duration: 100 }))), -1, false);
  }, []);
  useEffect(() => {
    if (prop) { propScale.value = 0; propScale.value = withSpring(1, { damping: 12, stiffness: 300 }); }
    else { propScale.value = withTiming(0, { duration: 200 }); }
  }, [prop]);
  const bodyAnim = useAnimatedStyle(() => ({ transform: [{ translateY: interpolate(bob.value, [0, 1], [0, -5]) }, { rotate: mood === "excited" ? `${interpolate(bob.value, [0, 1], [-4, 4])}deg` : "0deg" }] }));
  const eyeAnim = useAnimatedStyle(() => ({ transform: [{ scaleY: blink.value }] }));
  const propAnim = useAnimatedStyle(() => ({ transform: [{ scale: propScale.value }], opacity: propScale.value }));

  return (
    <Animated.View style={[bodyAnim, { width: size, height: size * 1.25 }]}>
      <View style={{ position: "absolute", bottom: 0, left: size * 0.32, width: size * 0.36, height: size * 0.32, alignItems: "center" }}>
        <LinearGradient colors={[flameTop, flameBottom, "rgba(255,184,77,0)"]} locations={[0, 0.5, 1]} style={{ width: size * 0.28, height: size * 0.3, borderTopLeftRadius: size * 0.14, borderTopRightRadius: size * 0.14, borderBottomLeftRadius: size * 0.03, borderBottomRightRadius: size * 0.03 }} />
      </View>
      <View style={{ position: "absolute", bottom: size * 0.3, left: size * 0.04, width: size * 0.16, height: size * 0.3, backgroundColor: PAL.primaryDark, borderTopLeftRadius: size * 0.09, borderBottomLeftRadius: size * 0.15, transform: [{ rotate: "-14deg" }] }} />
      <View style={{ position: "absolute", bottom: size * 0.3, right: size * 0.04, width: size * 0.16, height: size * 0.3, backgroundColor: PAL.primaryDark, borderTopRightRadius: size * 0.09, borderBottomRightRadius: size * 0.15, transform: [{ rotate: "14deg" }] }} />
      <View style={{ position: "absolute", bottom: size * 0.15, left: size * 0.18, width: size * 0.64, height: size * 0.82, borderRadius: size * 0.32, backgroundColor: PAL.primary, borderWidth: 2.5, borderColor: PAL.primaryDark }}>
        <View style={{ position: "absolute", top: size * 0.14, left: size * 0.05, right: size * 0.05, bottom: size * 0.05, borderRadius: size * 0.25, backgroundColor: "#FFF5F0", borderWidth: 2, borderColor: PAL.primaryDark }}>
          <View style={{ flexDirection: "row", justifyContent: "center", gap: size * 0.13, marginTop: size * 0.12 }}>
            {[0, 1].map((i) => (
              <Animated.View key={i} style={[eyeAnim, { width: size * 0.08, height: size * 0.11, borderRadius: size * 0.04, backgroundColor: "#2D2422", alignItems: "center", justifyContent: "flex-start" }]}>
                <View style={{ width: size * 0.03, height: size * 0.03, borderRadius: size * 0.015, backgroundColor: "#FFFFFF", marginTop: size * 0.02, marginLeft: size * 0.025 }} />
              </Animated.View>
            ))}
          </View>
          <View style={{ alignSelf: "center", marginTop: size * 0.05, width: mood === "excited" ? size * 0.13 : size * 0.09, height: mood === "excited" ? size * 0.09 : size * 0.05, borderBottomLeftRadius: size * 0.06, borderBottomRightRadius: size * 0.06, backgroundColor: "#2D2422", overflow: "hidden" }}>
            <View style={{ position: "absolute", bottom: 0, left: "25%", right: "25%", height: "45%", backgroundColor: "#FF6B8A", borderTopLeftRadius: size * 0.02, borderTopRightRadius: size * 0.02 }} />
          </View>
        </View>
        <View style={{ position: "absolute", top: -size * 0.05, alignSelf: "center", width: size * 0.2, height: size * 0.2, borderRadius: size * 0.1, backgroundColor: PAL.secondary, borderWidth: 2, borderColor: PAL.secondaryDark }} />
      </View>
      {prop && (
        <Animated.View style={[propAnim, { position: "absolute", bottom: 0, right: -size * 0.1, width: size * 0.4, height: size * 0.4, borderRadius: size * 0.2, backgroundColor: "#FFFFFF", borderWidth: 2.5, borderColor: PAL.primaryDark, alignItems: "center", justifyContent: "center" }]}>
          <Text style={{ fontSize: size * 0.2 }}>{prop}</Text>
        </Animated.View>
      )}
    </Animated.View>
  );
}

const medal = (i: number) => (i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`);

export default function Leaderboard() {
  const { t } = useTranslation();
  const tabBarHeight = useBottomTabBarHeight();
  const [tab, setTab] = useState<"week" | "all">("week");
  const data = tab === "week" ? WEEK : [...WEEK].sort((a, b) => b.score - a.score);
  const [mood, setMood] = useState<Mood>("idle");
  const [message, setMessage] = useState("You're #6 this week — keep climbing! 💪");
  const resetTimer = useRef<any>(null);

  const react = (msg: string) => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
    setMood("excited");
    setMessage(msg);
    resetTimer.current = setTimeout(() => {
      setMood("idle");
      setMessage(tab === "week" ? "You're #6 this week — keep climbing! 💪" : "All-time rankings! 🏆");
    }, 2200);
  };

  const youIndex = data.findIndex((p) => p.isYou);
  const top3 = [data[1], data[0], data[2]].filter(Boolean);

  return (
    <View style={{ flex: 1, backgroundColor: PAL.bg }}>
      <LinearGradient colors={[PAL.bgTop, PAL.bg, PAL.bgBottom]} locations={[0, 0.5, 1]} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1, paddingHorizontal: isTablet ? 48 : 24, maxWidth: isTablet ? 600 : undefined, alignSelf: "center", width: "100%" }}>
          <Text style={{ marginTop: 16, fontFamily: FONT.extrabold, fontSize: isTablet ? 36 : 28, color: PAL.text, letterSpacing: -1 }}>
            🏆 {t("leaderboard.title")}
          </Text>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 12, marginBottom: 20 }}>
            <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); react("You can do it! 🎉"); }}>
              <Pip mood={mood} size={isTablet ? 80 : 68} prop={youIndex < 3 ? "🏅" : "💪"} />
            </Pressable>
            <Animated.View entering={FadeIn.delay(200)} style={{ flex: 1 }}>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: PAL.textMuted, lineHeight: 20 }}>{message}</Text>
            </Animated.View>
          </View>

          <View style={{ flexDirection: "row", gap: 8, marginBottom: 20 }}>
            {(["week", "all"] as const).map((k) => {
              const active = tab === k;
              return (
                <Pressable
                  key={k}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setTab(k);
                    react(k === "week" ? "This week's stars! ⭐" : "All-time champions! 🏆");
                  }}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 999,
                    backgroundColor: active ? PAL.primary : "transparent",
                    borderWidth: 1.5,
                    borderColor: active ? PAL.primary : PAL.divider,
                  }}
                >
                  <Text style={{ fontFamily: FONT.extrabold, fontSize: 13, color: active ? "#FFFFFF" : PAL.text }}>
                    {k === "week" ? t("leaderboard.thisWeek") : t("leaderboard.allTime")}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: tabBarHeight + 24 }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-around", alignItems: "flex-end", marginBottom: 20, paddingTop: 8 }}>
              {top3.map((p, i) => {
                const realIdx = data.findIndex((x) => x.id === p.id);
                const h = realIdx === 0 ? 120 : realIdx === 1 ? 90 : 75;
                return (
                  <Animated.View key={p.id} entering={FadeInDown.delay(i * 100).springify()} style={{ alignItems: "center", flex: 1 }}>
                    <Text style={{ fontSize: realIdx === 0 ? 40 : 30 }}>{p.avatar}</Text>
                    <Text numberOfLines={1} style={{ fontFamily: FONT.extrabold, fontSize: 11, color: PAL.text, marginTop: 6, marginBottom: 6 }}>{p.name}</Text>
                    <View style={{ width: 1, height: h, backgroundColor: realIdx === 0 ? PAL.accent : realIdx === 1 ? "#C8C8DC" : "#E0A87C", marginBottom: 4 }} />
                    <Text style={{ fontSize: 18 }}>{medal(realIdx)}</Text>
                    <Text style={{ fontFamily: FONT.extrabold, fontSize: 13, color: PAL.text, marginTop: 2 }}>{p.score}</Text>
                  </Animated.View>
                );
              })}
            </View>

            <View style={{ height: 1, backgroundColor: PAL.divider, marginBottom: 8 }} />

            {data.slice(3).map((p, i) => {
              const rank = i + 4;
              return (
                <Animated.View key={p.id} entering={FadeInDown.delay(300 + i * 50).springify()}>
                  <Pressable
                    onPress={() => {
                      Haptics.selectionAsync();
                      react(p.isYou ? "That's you! Keep going! 😎" : `${p.name} is at #${rank}! 👏`);
                    }}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingVertical: 14,
                      paddingHorizontal: p.isYou ? 10 : 4,
                      backgroundColor: p.isYou ? `${PAL.accent}22` : "transparent",
                      borderRadius: 10,
                    }}
                  >
                    <Text style={{ fontFamily: FONT.extrabold, fontSize: 15, color: p.isYou ? PAL.primary : PAL.textMuted, width: 34 }}>{rank}</Text>
                    <Text style={{ fontSize: 24, marginRight: 12 }}>{p.avatar}</Text>
                    <Text style={{ flex: 1, fontFamily: FONT.extrabold, fontSize: 14, color: PAL.text }}>{p.isYou ? t("leaderboard.you") : p.name}</Text>
                    <Text style={{ fontFamily: FONT.extrabold, fontSize: 15, color: PAL.primary }}>{p.score}</Text>
                    <Text style={{ fontFamily: FONT.semibold, fontSize: 11, color: PAL.textMuted, marginLeft: 4 }}>{t("leaderboard.pts")}</Text>
                  </Pressable>
                  {i < data.slice(3).length - 1 && <View style={{ height: 1, backgroundColor: PAL.divider }} />}
                </Animated.View>
              );
            })}
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
}