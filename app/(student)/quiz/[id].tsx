import { View, Text, Pressable, ScrollView, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeInDown,
  FadeIn,
  SlideInRight,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
  interpolate,
} from "react-native-reanimated";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
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
  success: "#1E7A6F",
  successBg: "#D4F4E8",
  danger: "#C2402B",
  dangerBg: "#FFE0D8",
};

// ============================================================
// QUESTIONS
// ============================================================
type Question = { id: string; text: string; options: string[]; correctIndex: number };

const QUESTIONS: Question[] = [
  { id: "q1", text: "5 + 3 = ?", options: ["6", "7", "8", "9"], correctIndex: 2 },
  { id: "q2", text: "10 - 4 = ?", options: ["5", "6", "7", "8"], correctIndex: 1 },
  { id: "q3", text: "2 × 4 = ?", options: ["6", "8", "10", "12"], correctIndex: 1 },
  { id: "q4", text: "12 ÷ 3 = ?", options: ["4", "5", "6", "7"], correctIndex: 0 },
  { id: "q5", text: "7 + 6 = ?", options: ["11", "12", "13", "14"], correctIndex: 2 },
  { id: "q6", text: "15 - 8 = ?", options: ["5", "6", "7", "8"], correctIndex: 2 },
  { id: "q7", text: "3 × 3 = ?", options: ["6", "8", "9", "12"], correctIndex: 2 },
  { id: "q8", text: "20 ÷ 4 = ?", options: ["4", "5", "6", "7"], correctIndex: 1 },
  { id: "q9", text: "9 + 9 = ?", options: ["16", "17", "18", "19"], correctIndex: 2 },
  { id: "q10", text: "11 - 5 = ?", options: ["5", "6", "7", "8"], correctIndex: 1 },
];

const TIME_PER_QUESTION = 30;
type Phase = "intro" | "playing" | "result";
type Mood = "idle" | "happy" | "excited" | "thinking" | "wave" | "sad";

// ============================================================
// PIP — with sad mood support
// ============================================================
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

// ============================================================
// MAIN
// ============================================================
export default function QuizScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const total = QUESTIONS.length;

  const [phase, setPhase] = useState<Phase>("intro");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(total).fill(null));
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [locked, setLocked] = useState(false);
  const [mood, setMood] = useState<Mood>("idle");
  const [message, setMessage] = useState("Ready to start? 🎯");

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const advanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resetTimer = useRef<any>(null);

  const current = QUESTIONS[qIndex];

  const react = (newMood: Mood, msg: string) => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
    setMood(newMood);
    setMessage(msg);
  };

  const score = useMemo(() => {
    let s = 0;
    for (let i = 0; i < total; i++) {
      if (answers[i] !== null && answers[i] === QUESTIONS[i].correctIndex) s++;
    }
    return s;
  }, [answers, total]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  const advance = useCallback(
    (nextAnswers: (number | null)[]) => {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      setQIndex((prev) => {
        if (prev < total - 1) {
          setSelected(null);
          setLocked(false);
          setMood("idle");
          setMessage("Next one! 💪");
          return prev + 1;
        }
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setPhase("result");
        return prev;
      });
    },
    [total]
  );

  useEffect(() => {
    if (phase !== "playing" || locked) return;
    setTimeLeft(TIME_PER_QUESTION);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
          setTimeout(() => {
            const newAnswers = [...answers];
            newAnswers[qIndex] = null;
            setAnswers(newAnswers);
            advance(newAnswers);
          }, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } };
  }, [qIndex, phase, locked]);

  const progressAnim = useSharedValue(0);
  useEffect(() => {
    progressAnim.value = withTiming(qIndex / total, { duration: 400 });
  }, [qIndex, total]);
  const progressStyle = useAnimatedStyle(() => ({ width: `${progressAnim.value * 100}%` }));

  function handleSelect(idx: number) {
    if (locked || phase !== "playing") return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(idx);
    setLocked(true);
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    const newAnswers = [...answers];
    newAnswers[qIndex] = idx;
    setAnswers(newAnswers);
    const isCorrect = idx === current.correctIndex;
    react(isCorrect ? "excited" : "thinking", isCorrect ? "Correct! 🎉" : "Almost! 💭");
    advanceTimeoutRef.current = setTimeout(() => { advance(newAnswers); }, 1200);
  }

  function handleSkip() {
    if (locked) return;
    const newAnswers = [...answers];
    newAnswers[qIndex] = null;
    setAnswers(newAnswers);
    advance(newAnswers);
  }

  function restart() {
    if (timerRef.current) clearInterval(timerRef.current);
    if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
    setPhase("intro");
    setQIndex(0);
    setSelected(null);
    setAnswers(Array(total).fill(null));
    setLocked(false);
    setTimeLeft(TIME_PER_QUESTION);
    setMood("idle");
    setMessage("Ready to start? 🎯");
  }

  // ===== INTRO =====
  if (phase === "intro") {
    return (
      <View style={{ flex: 1, backgroundColor: PAL.bg }}>
        <LinearGradient colors={[PAL.bgTop, PAL.bg, PAL.bgBottom]} locations={[0, 0.5, 1]} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} />
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: isTablet ? 48 : 24, justifyContent: "center", paddingVertical: 32, maxWidth: isTablet ? 600 : undefined, alignSelf: "center", width: "100%" }} showsVerticalScrollIndicator={false}>
            {/* Pip + message */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); react("excited", "Let's go! 🎯"); }}>
                <Pip mood={mood} size={isTablet ? 90 : 76} prop="🎯" />
              </Pressable>
              <Animated.View entering={FadeIn.delay(200)} style={{ flex: 1 }}>
                <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: PAL.textMuted, lineHeight: 20 }}>{message}</Text>
              </Animated.View>
            </View>

            <Text style={{ fontFamily: FONT.extrabold, fontSize: isTablet ? 40 : 30, color: PAL.text, letterSpacing: -1, lineHeight: isTablet ? 46 : 38 }}>
              Quiz {id?.replace("q", "") ?? "1"}
            </Text>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: PAL.textMuted, marginTop: 8 }}>
              {total} ပုစ္ဆာ · တစ်ပုဒ်လျှင် {TIME_PER_QUESTION} စက္ကန့်
            </Text>

            <View style={{ height: 1, backgroundColor: PAL.divider, marginTop: 24, marginBottom: 12 }} />

            <Text style={{ fontFamily: FONT.extrabold, fontSize: 11, color: PAL.textMuted, letterSpacing: 1.5, marginBottom: 10 }}>
              စည်းမျဉ်းများ
            </Text>
            {[
              "✅ မှန်ကန်တဲ့ အဖြေကို ရွေးပါ",
              "⏱️ အချိန်ကုန်ရင် အလိုအလျောက် ကျော်သွားမယ်",
              "🏆 ပြီးဆုံးရင် ရမှတ်ကို ပြပါမယ်",
            ].map((r, i) => (
              <View key={i} style={{ flexDirection: "row", paddingVertical: 10 }}>
                <Text style={{ fontFamily: FONT.extrabold, fontSize: 11, color: PAL.textMuted, letterSpacing: 1, width: 28 }}>
                  {String(i + 1).padStart(2, "0")}
                </Text>
                <Text style={{ flex: 1, fontFamily: FONT.semibold, fontSize: 13, color: PAL.text }}>{r}</Text>
              </View>
            ))}

            <Pressable
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); setPhase("playing"); setMood("excited"); setMessage("Here we go! 🚀"); }}
              style={{ marginTop: 32, backgroundColor: PAL.primary, borderRadius: 999, paddingVertical: 16, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 }}
            >
              <Text style={{ fontSize: 16, color: "#FFFFFF" }}>🚀</Text>
              <Text style={{ fontFamily: FONT.extrabold, fontSize: 15, color: "#FFFFFF" }}>စတင်မယ်</Text>
            </Pressable>

            <Pressable onPress={() => router.back()} style={{ marginTop: 16, paddingVertical: 12, alignItems: "center" }}>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: PAL.textMuted }}>ပြန်ထွက်မယ်</Text>
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  // ===== RESULT =====
  if (phase === "result") {
    const pct = Math.round((score / total) * 100);
    const passed = pct >= 60;
    return (
      <View style={{ flex: 1, backgroundColor: PAL.bg }}>
        <LinearGradient colors={[PAL.bgTop, PAL.bg, PAL.bgBottom]} locations={[0, 0.5, 1]} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} />
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: isTablet ? 48 : 24, justifyContent: "center", paddingVertical: 32, maxWidth: isTablet ? 600 : undefined, alignSelf: "center", width: "100%" }} showsVerticalScrollIndicator={false}>
            <Animated.View entering={FadeInDown.springify()}>
              {/* Pip celebration */}
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 24 }}>
                <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); react(passed ? "excited" : "thinking", passed ? "Amazing! 🏆" : "Keep trying! 💪"); }}>
                  <Pip mood={passed ? "excited" : "thinking"} size={isTablet ? 90 : 76} prop={passed ? "🏆" : "💪"} flameTop={passed ? "#FFE9A0" : "#C8C8C8"} flameBottom={passed ? "#FFD93D" : "#A0A0A0"} />
                </Pressable>
                <Animated.View entering={FadeIn.delay(200)} style={{ flex: 1 }}>
                  <Text style={{ fontFamily: FONT.extrabold, fontSize: isTablet ? 30 : 24, color: PAL.text, letterSpacing: -0.8, lineHeight: isTablet ? 36 : 30 }}>
                    {passed ? "ဂုဏ်ယူပါတယ်!" : "ထပ်ကြိုးစားပါ!"}
                  </Text>
                  <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: PAL.textMuted, marginTop: 4 }}>
                    {score} / {total} မှန် ({pct}%)
                  </Text>
                </Animated.View>
              </View>

              <View style={{ height: 1, backgroundColor: PAL.divider, marginBottom: 16 }} />

              <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 12 }}>
                <Text style={{ fontFamily: FONT.extrabold, fontSize: 13, color: PAL.textMuted }}>မှန်သော အဖြေ</Text>
                <Text style={{ fontFamily: FONT.extrabold, fontSize: 15, color: PAL.success }}>{score} မှန်</Text>
              </View>
              <View style={{ height: 1, backgroundColor: PAL.divider }} />
              <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 12 }}>
                <Text style={{ fontFamily: FONT.extrabold, fontSize: 13, color: PAL.textMuted }}>မှားသော အဖြေ</Text>
                <Text style={{ fontFamily: FONT.extrabold, fontSize: 15, color: PAL.danger }}>{total - score} မှား</Text>
              </View>

              <View style={{ height: 8, backgroundColor: PAL.divider, borderRadius: 4, overflow: "hidden", marginTop: 16 }}>
                <LinearGradient colors={passed ? ["#4ECDC4", "#4055DC"] : ["#FFAE9C", "#FF8066"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ width: `${pct}%`, height: "100%", borderRadius: 4 }} />
              </View>

              <Pressable
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); restart(); }}
                style={{ marginTop: 28, backgroundColor: PAL.primary, borderRadius: 999, paddingVertical: 16, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 }}
              >
                <Text style={{ fontSize: 16, color: "#FFFFFF" }}>🔄</Text>
                <Text style={{ fontFamily: FONT.extrabold, fontSize: 15, color: "#FFFFFF" }}>ပြန်ကစားမယ်</Text>
              </Pressable>

              <Pressable onPress={() => router.back()} style={{ marginTop: 12, paddingVertical: 16, alignItems: "center" }}>
                <Text style={{ fontFamily: FONT.extrabold, fontSize: 13, color: PAL.textMuted }}>ပြန်ထွက်မယ်</Text>
              </Pressable>
            </Animated.View>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  // ===== PLAYING =====
  const timeColor = timeLeft <= 5 ? PAL.danger : timeLeft <= 10 ? PAL.accentDark : PAL.secondary;

  return (
    <View style={{ flex: 1, backgroundColor: PAL.bg }}>
      <LinearGradient colors={[PAL.bgTop, PAL.bg, PAL.bgBottom]} locations={[0, 0.5, 1]} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: isTablet ? 48 : 24, paddingTop: 12, maxWidth: isTablet ? 600 : undefined, alignSelf: "center", width: "100%" }}>
          {/* Top bar */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Pressable
              onPress={() => router.back()}
              style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center" }}
            >
              <Text style={{ fontSize: 22, color: PAL.text }}>←</Text>
            </Pressable>
            <Text style={{ fontFamily: FONT.extrabold, fontSize: 14, color: PAL.text, letterSpacing: 0.5 }}>
              {qIndex + 1} / {total}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Text style={{ fontSize: 14 }}>⏱️</Text>
              <Text style={{ fontFamily: FONT.extrabold, fontSize: 15, color: timeColor, minWidth: 24, textAlign: "center" }}>
                {timeLeft}
              </Text>
            </View>
          </View>

          <View style={{ height: 6, backgroundColor: PAL.divider, borderRadius: 3, marginTop: 16, overflow: "hidden" }}>
            <Animated.View style={[{ height: "100%", borderRadius: 3, backgroundColor: PAL.primary }, progressStyle]} />
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 20 }}>
            <Pip mood={mood} size={isTablet ? 60 : 52} prop="🎯" flameTop={timeColor + "99"} flameBottom={timeColor} />
            <Animated.View entering={FadeIn} style={{ flex: 1 }}>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: PAL.textMuted, lineHeight: 19 }}>{message}</Text>
            </Animated.View>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: isTablet ? 48 : 24, paddingTop: 20, paddingBottom: 40, maxWidth: isTablet ? 600 : undefined, alignSelf: "center", width: "100%" }}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View key={qIndex} entering={SlideInRight.springify()}>
            <Text
              style={{
                fontFamily: FONT.extrabold,
                fontSize: isTablet ? 44 : 36,
                color: PAL.text,
                textAlign: "center",
                letterSpacing: -1,
                paddingVertical: 32,
              }}
            >
              {current.text}
            </Text>

            <View style={{ gap: 2 }}>
              {current.options.map((opt, i) => {
                const isSelected = selected === i;
                const isCorrect = i === current.correctIndex;
                const showCorrect = locked && isCorrect;
                const showWrong = locked && isSelected && !isCorrect;

                let bgColor = "transparent";
                let textColor = PAL.text;
                let dotColor = PAL.divider;
                if (showCorrect) { bgColor = PAL.successBg; textColor = PAL.success; dotColor = PAL.secondary; }
                else if (showWrong) { bgColor = PAL.dangerBg; textColor = PAL.danger; dotColor = PAL.danger; }
                else if (isSelected) { bgColor = PAL.primary + "15"; textColor = PAL.primary; dotColor = PAL.primary; }

                return (
                  <Animated.View key={i} entering={FadeInDown.delay(i * 60).springify()}>
                    <Pressable
                      onPress={() => handleSelect(i)}
                      disabled={locked}
                      style={{
                        backgroundColor: bgColor,
                        borderRadius: 14,
                        paddingVertical: 18,
                        paddingHorizontal: 16,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 14,
                        marginVertical: 2,
                      }}
                    >
                      <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: dotColor, alignItems: "center", justifyContent: "center" }}>
                        <Text style={{ fontFamily: FONT.extrabold, fontSize: 14, color: showCorrect || showWrong || isSelected ? "#FFFFFF" : PAL.textMuted }}>
                          {String.fromCharCode(65 + i)}
                        </Text>
                      </View>
                      <Text style={{ fontFamily: FONT.extrabold, fontSize: isTablet ? 24 : 20, color: textColor, flex: 1 }}>
                        {opt}
                      </Text>
                      {showCorrect && <Text style={{ fontSize: 20 }}>✓</Text>}
                      {showWrong && <Text style={{ fontSize: 20 }}>✗</Text>}
                    </Pressable>
                  </Animated.View>
                );
              })}
            </View>

            {!locked && (
              <Pressable onPress={handleSkip} style={{ marginTop: 20, alignItems: "center", paddingVertical: 12 }}>
                <Text style={{ fontFamily: FONT.extrabold, fontSize: 13, color: PAL.textMuted }}>ကျော်မယ် →</Text>
              </Pressable>
            )}
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}