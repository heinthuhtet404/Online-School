import { View, Text, Dimensions, Pressable, ScrollView, ActivityIndicator, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { useTranslation } from "react-i18next";
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
import { useCallback, useState, useEffect, useRef } from "react";
import { FONT } from "@/lib/design";
import { getPublishedQuizzes, Quiz } from "@/lib/quizzes-service";
import { getBestScore, hasAttempted } from "@/lib/attempts-service";
import { useAuth } from "@/lib/auth-context";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

const PAL = {
  bg: "#FFF8F0", bgTop: "#FFE8D6", bgBottom: "#E8F4FF",
  primary: "#FF6B6B", primaryDark: "#E05050",
  secondary: "#4ECDC4", secondaryDark: "#3BA89F",
  accent: "#FFD93D", accentDark: "#E5C020",
  text: "#2D2422", textMuted: "#7A6A63", divider: "#EDE3D8",
  success: "#2C7A7B", danger: "#C2402B",
};

const SUBJECT_META: Record<string, { nameKey: string; emoji: string; color: string; darkColor: string }> = {
  myanmar: { nameKey: "subjects.myanmar", emoji: "📖", color: "#F4A6C0", darkColor: "#E88AA8" },
  english: { nameKey: "subjects.english", emoji: "🔤", color: "#FF6B6B", darkColor: "#E05050" },
  math: { nameKey: "subjects.math", emoji: "🔢", color: "#4ECDC4", darkColor: "#3BA89F" },
  science: { nameKey: "subjects.science", emoji: "🔬", color: "#9DD9C5", darkColor: "#7EC4AE" },
  history: { nameKey: "subjects.history", emoji: "🏛️", color: "#FFD93D", darkColor: "#E5C020" },
  geography: { nameKey: "subjects.geography", emoji: "🌍", color: "#9FE870", darkColor: "#7EC450" },
};

type Mood = "idle" | "happy" | "excited" | "thinking" | "wave" | "sad";
type QuizMeta = { quiz: Quiz; attempted: boolean; bestScore: number };

function Pip({ mood = "idle", size = 80, prop, flameTop = PAL.accent, flameBottom = "#FFB84D" }: {
  mood?: Mood; size?: number; prop?: string; flameTop?: string; flameBottom?: string;
}) {
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
  const bodyAnim = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(bob.value, [0, 1], [0, -5]) }, { rotate: mood === "excited" ? `${interpolate(bob.value, [0, 1], [-4, 4])}deg` : "0deg" }],
  }));
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
              <Animated.View key={i} style={[eyeAnim, { width: size * 0.08, height: mood === "sad" ? size * 0.06 : size * 0.11, borderRadius: size * 0.04, backgroundColor: "#2D2422", alignItems: "center", justifyContent: "flex-start" }]}>
                <View style={{ width: size * 0.03, height: size * 0.03, borderRadius: size * 0.015, backgroundColor: "#FFFFFF", marginTop: size * 0.02, marginLeft: size * 0.025 }} />
              </Animated.View>
            ))}
          </View>
          <View style={{ alignSelf: "center", marginTop: size * 0.05, width: mood === "excited" ? size * 0.13 : size * 0.09, height: mood === "excited" ? size * 0.09 : size * 0.05, borderBottomLeftRadius: mood === "sad" ? 0 : size * 0.06, borderBottomRightRadius: mood === "sad" ? 0 : size * 0.06, borderTopLeftRadius: mood === "sad" ? size * 0.06 : 0, borderTopRightRadius: mood === "sad" ? size * 0.06 : 0, backgroundColor: mood === "sad" ? "transparent" : "#2D2422", borderTopWidth: mood === "sad" ? 2 : 0, borderColor: mood === "sad" ? "#2D2422" : "transparent", overflow: "hidden" }}>
            {mood !== "sad" && (
              <View style={{ position: "absolute", bottom: 0, left: "25%", right: "25%", height: "45%", backgroundColor: "#FF6B8A", borderTopLeftRadius: size * 0.02, borderTopRightRadius: size * 0.02 }} />
            )}
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

// ===== Quiz Row — LessonList ပုံစံအတိုင်း =====
function QuizRow({ item, index, isActive, onPress, onHover, subjectColor }: {
  item: QuizMeta; index: number; isActive: boolean; onPress: () => void; onHover: () => void; subjectColor: string;
}) {
  const scale = useSharedValue(1);
  const shift = useSharedValue(0);
  const dotSize = useSharedValue(10);

  useEffect(() => {
    shift.value = withSpring(isActive ? 1 : 0, { damping: 14, stiffness: 200 });
    dotSize.value = withSpring(isActive ? 16 : 10, { damping: 14, stiffness: 200 });
  }, [isActive]);

  const anim = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateX: interpolate(shift.value, [0, 1], [0, 8]) }],
  }));
  const dotAnim = useAnimatedStyle(() => ({ width: dotSize.value, height: dotSize.value, borderRadius: dotSize.value / 2 }));

  const { quiz, attempted, bestScore } = item;
  const total = quiz.questions.length;
  const percent = total > 0 ? Math.round((bestScore / total) * 100) : 0;

  return (
    <Animated.View entering={FadeInDown.delay(index * 60).springify()}>
      <Pressable
        onPressIn={() => { scale.value = withSpring(0.98, { damping: 15, stiffness: 400 }); onHover(); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 12, stiffness: 300 }); }}
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPress(); }}
      >
        <Animated.View style={[anim, { flexDirection: "row", alignItems: "center", paddingVertical: 16, paddingHorizontal: 4 }]}>
          <Text style={{ fontFamily: FONT.extrabold, fontSize: 11, color: isActive ? subjectColor : PAL.textMuted, letterSpacing: 1, width: 28 }}>
            {String(index + 1).padStart(2, "0")}
          </Text>
          <Animated.View style={[dotAnim, { backgroundColor: isActive ? subjectColor : PAL.divider, marginRight: 16 }]} />
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Text style={{ fontFamily: FONT.extrabold, fontSize: isTablet ? 17 : 15, color: isActive ? subjectColor : PAL.text, letterSpacing: -0.2, flex: 1 }} numberOfLines={1}>
                {quiz.title}
              </Text>
              {quiz.isPremium && <Text style={{ fontSize: 12 }}>⭐</Text>}
            </View>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 11, color: PAL.textMuted, marginTop: 2 }}>
              {total} မေးခွန်း
              {attempted ? ` · ✓ ${bestScore}/${total} (${percent}%)` : ""}
            </Text>
            {attempted && (
              <View style={{ height: 4, backgroundColor: PAL.divider, borderRadius: 2, overflow: "hidden", marginTop: 6, width: "100%" }}>
                <View style={{ width: `${percent}%`, height: "100%", backgroundColor: subjectColor }} />
              </View>
            )}
          </View>
          <Animated.View style={{ opacity: interpolate(shift.value, [0, 1], [0, 1]), transform: [{ translateX: interpolate(shift.value, [0, 1], [-8, 0]) }] }}>
            <Text style={{ fontSize: 18, color: subjectColor, fontWeight: "900" }}>→</Text>
          </Animated.View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

export default function QuizList() {
  const router = useRouter();
  const { t } = useTranslation();
  const { grade, subject } = useLocalSearchParams<{ grade: string; subject: string }>();
  const { userData } = useAuth();
  const meta = SUBJECT_META[subject ?? "math"] ?? SUBJECT_META.math;

  const [items, setItems] = useState<QuizMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [mood, setMood] = useState<Mood>("idle");
  const [message, setMessage] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const resetTimer = useRef<any>(null);

  const loadQuizzes = useCallback(async () => {
    if (!grade || !subject) return;
    try {
      setLoading(true);
      const quizzes = await getPublishedQuizzes(grade, subject);
      const withMeta = await Promise.all(
        quizzes.map(async (q) => {
          const [attempted, bestScore] = await Promise.all([hasAttempted(q.id!), getBestScore(q.id!)]);
          return { quiz: q, attempted, bestScore };
        })
      );
      setItems(withMeta);
      if (withMeta.length === 0) {
        setMood("sad");
        setMessage("Quiz မရှိသေးပါ — ဆရာမ တင်တဲ့အထိ စောင့်ပါ 📭");
      } else {
        setMood("idle");
        setMessage(`${withMeta.length} Quiz ရနေပါပြီ! ✏️`);
      }
    } catch (e) {
      console.log("❌ Load quizzes error:", e);
      setMood("sad");
      setMessage("Load မရပါ။ ထပ်ကြိုးစားပါ။");
    } finally {
      setLoading(false);
    }
  }, [grade, subject]);

  useFocusEffect(useCallback(() => { loadQuizzes(); }, [loadQuizzes]));

  const react = (newMood: Mood, msg: string) => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
    setMood(newMood);
    setMessage(msg);
    resetTimer.current = setTimeout(() => {
      setMood(items.length === 0 ? "sad" : "idle");
      setMessage(items.length === 0 ? "Quiz မရှိသေးပါ — ဆရာမ တင်တဲ့အထိ စောင့်ပါ 📭" : `${items.length} Quiz ရနေပါပြီ! ✏️`);
    }, 2200);
  };

  useEffect(() => () => { if (resetTimer.current) clearTimeout(resetTimer.current); }, []);

  const flameTop = activeId ? `${meta.color}99` : items.length === 0 ? "#C8C8C8" : PAL.accent;
  const flameBottom = activeId ? meta.color : items.length === 0 ? "#A0A0A0" : "#FFB84D";

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: PAL.bg, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={PAL.primary} size="large" />
        <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: PAL.textMuted, marginTop: 12 }}>Quiz များ ဆွဲယူနေသည်...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: PAL.bg }}>
      <LinearGradient colors={[PAL.bgTop, PAL.bg, PAL.bgBottom]} locations={[0, 0.5, 1]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1, paddingHorizontal: isTablet ? 48 : 24, maxWidth: isTablet ? 600 : undefined, alignSelf: "center", width: "100%" }}>
          <Pressable onPress={() => { Haptics.selectionAsync(); router.back(); }} style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center", marginTop: 12 }}>
            <Text style={{ fontSize: 22, color: PAL.text }}>←</Text>
          </Pressable>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 12, marginBottom: 20 }}>
            <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); react(items.length === 0 ? "sad" : "excited", items.length === 0 ? "Quiz မရှိသေးပါ! 📭" : "Quiz ရွေးပြီး ဖြေပါ! ✏️"); }}>
              <Pip mood={mood} size={isTablet ? 90 : 76} prop={items.length === 0 ? "📭" : meta.emoji} flameTop={flameTop} flameBottom={flameBottom} />
            </Pressable>
            <Animated.View entering={FadeIn.delay(200)} style={{ flex: 1 }}>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: PAL.textMuted, lineHeight: 20 }}>{message}</Text>
            </Animated.View>
          </View>

          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <Text style={{ fontSize: 22 }}>{meta.emoji}</Text>
              <Text style={{ fontFamily: FONT.extrabold, fontSize: 11, letterSpacing: 2, color: PAL.textMuted }}>
                {grade?.toUpperCase()} · {subject?.toUpperCase()}
              </Text>
            </View>
            <Text style={{ fontFamily: FONT.extrabold, fontSize: isTablet ? 38 : 30, color: PAL.text, letterSpacing: -1, lineHeight: isTablet ? 44 : 36 }}>
              ✏️ Quiz များ
            </Text>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: PAL.textMuted, marginTop: 4 }}>
              {items.length} ခု · {t(meta.nameKey)}
            </Text>
          </Animated.View>

          <View style={{ height: 1, backgroundColor: PAL.divider, marginTop: 24, marginBottom: 8 }} />

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
            {items.length === 0 ? (
              <Animated.View entering={FadeInDown.delay(250).springify()} style={{ alignItems: "center", marginTop: 40, padding: 24 }}>
                <Text style={{ fontSize: 56 }}>📝</Text>
                <Text style={{ fontFamily: FONT.extrabold, fontSize: 16, color: PAL.text, marginTop: 16 }}>Quiz မရှိသေးပါ</Text>
                <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: PAL.textMuted, marginTop: 6, textAlign: "center" }}>ဆရာမ Quiz တင်တဲ့အထိ ခဏစောင့်ပါ</Text>
              </Animated.View>
            ) : (
              items.map((item, i) => {
                const locked = item.quiz.isPremium && !userData?.isPremium;
                return (
                  <View key={item.quiz.id}>
                    <QuizRow
                      item={item}
                      index={i}
                      isActive={activeId === item.quiz.id}
                      subjectColor={meta.darkColor}
                      onHover={() => {
                        setActiveId(item.quiz.id ?? null);
                        if (locked) {
                          setMood("thinking");
                          setMessage("⭐ Premium Quiz — ဝယ်ယူပါ");
                        } else {
                          setMood("excited");
                          setMessage(`"${item.quiz.title}" — နှိပ်ပြီး ဖြေပါ! ✏️`);
                        }
                      }}
                      onPress={() => {
                        if (locked) {
                          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                          react("thinking", "⭐ Premium Quiz — ဝယ်ယူပါ");
                          return;
                        }
                        router.push(`/(student)/quiz/${item.quiz.id}`);
                      }}
                    />
                    {i < items.length - 1 && <View style={{ height: 1, backgroundColor: PAL.divider }} />}
                  </View>
                );
              })
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
}