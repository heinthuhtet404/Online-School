import { View, Text, Dimensions, Pressable, ScrollView, ActivityIndicator, Alert, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
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
import { useState, useEffect, useRef } from "react";
import { FONT } from "@/lib/design";
import { getQuiz, Quiz } from "@/lib/quizzes-service";
import { submitAttempt } from "@/lib/attempts-service";
import { auth } from "@/lib/firebase";

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

const SUBJECT_META: Record<string, { emoji: string; color: string; darkColor: string }> = {
  myanmar: { emoji: "📖", color: "#F4A6C0", darkColor: "#E88AA8" },
  english: { emoji: "🔤", color: "#FF6B6B", darkColor: "#E05050" },
  math: { emoji: "🔢", color: "#4ECDC4", darkColor: "#3BA89F" },
  science: { emoji: "🔬", color: "#9DD9C5", darkColor: "#7EC4AE" },
  history: { emoji: "🏛️", color: "#FFD93D", darkColor: "#E5C020" },
  geography: { emoji: "🌍", color: "#9FE870", darkColor: "#7EC450" },
};

type Mood = "idle" | "happy" | "excited" | "thinking" | "wave" | "sad";

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

export default function QuizPlay() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [saving, setSaving] = useState(false);

  const [mood, setMood] = useState<Mood>("idle");
  const [message, setMessage] = useState("ဖြေဆိုရန် အသင့်ဖြစ်ပါ! ✏️");
  const resetTimer = useRef<any>(null);

  const react = (newMood: Mood, msg: string) => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
    setMood(newMood);
    setMessage(msg);
    resetTimer.current = setTimeout(() => {
      setMood("idle");
      setMessage("ဖြေဆိုရန် အသင့်ဖြစ်ပါ! ✏️");
    }, 2200);
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const q = await getQuiz(id!);
        if (!q) { Alert.alert("Error", "Quiz မတွေ့ပါ"); router.back(); return; }
        setQuiz(q);
        setAnswers(new Array(q.questions.length).fill(-1));
      } catch (e: any) { Alert.alert("Error", e.message); }
      finally { setLoading(false); }
    })();
  }, [id]);

  useEffect(() => () => { if (resetTimer.current) clearTimeout(resetTimer.current); }, []);

  const handleSelect = (choiceIndex: number) => {
    Haptics.selectionAsync();
    const next = [...answers];
    next[current] = choiceIndex;
    setAnswers(next);
    react("happy", "ရွေးပြီးပါပြီ ✓");
  };

  const handleNext = () => {
    if (answers[current] === -1) { Alert.alert("ရွေးပါ", "အဖြေ တစ်ခု ရွေးပါ။"); return; }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (current < (quiz?.questions.length ?? 0) - 1) { setCurrent(current + 1); }
    else { handleSubmit(); }
  };

  const handleBack = () => {
    if (current > 0) { Haptics.selectionAsync(); setCurrent(current - 1); }
  };

  const handleSubmit = async () => {
    if (!quiz) return;
    const unanswered = answers.findIndex((a) => a === -1);
    if (unanswered !== -1) {
      Alert.alert("မဖြေရသေးပါ", `မေးခွန်း ${unanswered + 1} ကို မဖြေရသေးပါ။`);
      setCurrent(unanswered);
      return;
    }
    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    let correct = 0;
    quiz.questions.forEach((q, i) => { if (answers[i] === q.correctIndex) correct++; });

    try {
      await submitAttempt({
        quizId: quiz.id!, quizTitle: quiz.title, grade: quiz.grade, subject: quiz.subject,
        score: correct, total: quiz.questions.length, answers,
      });
    } catch (e: any) { console.error("Submit error:", e); }
    finally {
      setScore(correct);
      setSubmitted(true);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: PAL.bg, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={PAL.primary} size="large" />
      </View>
    );
  }

  if (!quiz) return null;

  const meta = SUBJECT_META[quiz.subject] ?? SUBJECT_META.math;

  // ===== Result Screen =====
  if (submitted) {
    const total = quiz.questions.length;
    const percent = Math.round((score / total) * 100);
    const isGuest = !auth.currentUser;
    const resultMood: Mood = percent >= 80 ? "excited" : percent >= 50 ? "happy" : "sad";
    const emoji = percent >= 80 ? "🏆" : percent >= 50 ? "🎉" : "💪";
    const message = percent >= 80 ? "အလွန်ကောင်းတယ်!" : percent >= 50 ? "ကောင်းတယ်! ဆက်ကြိုးစားပါ" : "ထပ်ကြိုးစားပါ!";
    const flameTop = `${meta.color}99`;
    const flameBottom = meta.color;

    return (
      <View style={{ flex: 1, backgroundColor: PAL.bg }}>
        <LinearGradient colors={[PAL.bgTop, PAL.bg, PAL.bgBottom]} locations={[0, 0.5, 1]} style={StyleSheet.absoluteFill} />
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40, maxWidth: isTablet ? 600 : undefined, alignSelf: "center", width: "100%" }}>
            <Animated.View entering={FadeIn.delay(100)} style={{ alignItems: "center", marginTop: 24 }}>
              <Pip mood={resultMood} size={isTablet ? 140 : 120} prop={emoji} flameTop={flameTop} flameBottom={flameBottom} />
              <Text style={{ fontFamily: FONT.extrabold, fontSize: 28, color: PAL.text, marginTop: 20 }}>{message}</Text>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: PAL.textMuted, marginTop: 8, textAlign: "center" }}>{quiz.title}</Text>

              <View style={{ marginTop: 32, backgroundColor: "#FFF", borderRadius: 24, padding: 32, alignItems: "center", width: "100%", borderWidth: 1.5, borderColor: PAL.divider }}>
                <Text style={{ fontFamily: FONT.extrabold, fontSize: 64, color: meta.darkColor, letterSpacing: -2 }}>{score}</Text>
                <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: PAL.textMuted, marginTop: 4 }}>/ {total} မှတ်</Text>
                <View style={{ marginTop: 16, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, backgroundColor: percent >= 50 ? PAL.success + "20" : PAL.danger + "20" }}>
                  <Text style={{ fontFamily: FONT.extrabold, fontSize: 16, color: percent >= 50 ? PAL.success : PAL.danger }}>{percent}%</Text>
                </View>
              </View>

              {isGuest && (
                <View style={{ marginTop: 16, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, backgroundColor: PAL.accent + "20", borderWidth: 1.5, borderColor: PAL.accent, flexDirection: "row", alignItems: "center", gap: 8, width: "100%" }}>
                  <Text style={{ fontSize: 16 }}>💡</Text>
                  <Text style={{ flex: 1, fontFamily: FONT.semibold, fontSize: 12, color: PAL.textMuted, lineHeight: 18 }}>
                    Guest mode — အမှတ်ကို သိမ်းမထားပါဘူး။ Leaderboard မှာ ပါချင်ရင် Login ဝင်ပါ။
                  </Text>
                </View>
              )}

              <Pressable
                onPress={() => { Haptics.selectionAsync(); router.back(); }}
                style={{ marginTop: 32, backgroundColor: PAL.primary, borderRadius: 999, paddingVertical: 16, paddingHorizontal: 48, alignItems: "center" }}
              >
                <Text style={{ fontFamily: FONT.extrabold, fontSize: 15, color: "#FFF" }}>ပြန်သွားမယ်</Text>
              </Pressable>
            </Animated.View>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  // ===== Play Screen =====
  const q = quiz.questions[current];
  const total = quiz.questions.length;
  const progress = ((current + 1) / total) * 100;
  const selected = answers[current];
  const flameTop = `${meta.color}99`;
  const flameBottom = meta.color;

  return (
    <View style={{ flex: 1, backgroundColor: PAL.bg }}>
      <LinearGradient colors={[PAL.bgTop, PAL.bg, PAL.bgBottom]} locations={[0, 0.5, 1]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1, paddingHorizontal: isTablet ? 48 : 24, maxWidth: isTablet ? 600 : undefined, alignSelf: "center", width: "100%" }}>
          {/* Top bar */}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
            <Pressable
              onPress={() => {
                Alert.alert("ထွက်မလား?", "ဖြေထားတာ ပျက်သွားမယ်", [
                  { text: "မထွက်ဘူး", style: "cancel" },
                  { text: "ထွက်မယ်", style: "destructive", onPress: () => router.back() },
                ]);
              }}
              style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center" }}
            >
              <Text style={{ fontSize: 22, color: PAL.text }}>✕</Text>
            </Pressable>
            <Text style={{ fontFamily: FONT.extrabold, fontSize: 12, letterSpacing: 2, color: PAL.textMuted }}>
              {current + 1} / {total}
            </Text>
          </View>

          {/* Pip + message */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 12, marginBottom: 12 }}>
            <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); react("excited", "ဆက်လုပ်ပါ! 💪"); }}>
              <Pip mood={mood} size={isTablet ? 76 : 64} prop={meta.emoji} flameTop={flameTop} flameBottom={flameBottom} />
            </Pressable>
            <Animated.View entering={FadeIn.delay(200)} style={{ flex: 1 }}>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: PAL.textMuted, lineHeight: 18 }}>{message}</Text>
            </Animated.View>
          </View>

          {/* Progress bar */}
          <View style={{ height: 6, backgroundColor: PAL.divider, borderRadius: 3, overflow: "hidden" }}>
            <Animated.View style={{ width: `${progress}%`, height: "100%", backgroundColor: meta.darkColor }} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
            <Animated.View key={current} entering={FadeInDown.springify()}>
              <Text style={{ fontFamily: FONT.extrabold, fontSize: isTablet ? 26 : 20, color: PAL.text, marginTop: 24, lineHeight: isTablet ? 34 : 28 }}>
                {q.question}
              </Text>

              <View style={{ marginTop: 20, gap: 10 }}>
                {q.choices.map((choice, i) => {
                  const isSelected = selected === i;
                  return (
                    <Pressable
                      key={i}
                      onPress={() => handleSelect(i)}
                      style={{
                        backgroundColor: isSelected ? meta.color + "22" : "#FFF",
                        borderRadius: 14,
                        padding: 16,
                        borderWidth: 2,
                        borderColor: isSelected ? meta.darkColor : PAL.divider,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: isSelected ? meta.darkColor : PAL.divider, alignItems: "center", justifyContent: "center" }}>
                        <Text style={{ fontFamily: FONT.extrabold, fontSize: 13, color: isSelected ? "#FFF" : PAL.textMuted }}>
                          {String.fromCharCode(65 + i)}
                        </Text>
                      </View>
                      <Text style={{ flex: 1, fontFamily: FONT.semibold, fontSize: 14, color: PAL.text }}>{choice}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </Animated.View>
          </ScrollView>

          <View style={{ flexDirection: "row", gap: 12, paddingBottom: 20, paddingTop: 12 }}>
            {current > 0 && (
              <Pressable onPress={handleBack} style={{ flex: 1, backgroundColor: "#FFF", borderRadius: 999, paddingVertical: 16, alignItems: "center", borderWidth: 2, borderColor: PAL.divider }}>
                <Text style={{ fontFamily: FONT.extrabold, fontSize: 15, color: PAL.text }}>← နောက်သွား</Text>
              </Pressable>
            )}
            <Pressable onPress={handleNext} disabled={saving} style={{ flex: 2, backgroundColor: PAL.primary, borderRadius: 999, paddingVertical: 16, alignItems: "center", opacity: saving ? 0.6 : 1 }}>
              <Text style={{ fontFamily: FONT.extrabold, fontSize: 15, color: "#FFF" }}>
                {saving ? "သိမ်းနေသည်..." : current === total - 1 ? "အမှတ်ယူမယ် 🎯" : "ရှေ့သွား →"}
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}