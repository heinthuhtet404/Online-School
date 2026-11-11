import { View, Text, Pressable, ScrollView, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeInDown,
  SlideInRight,
} from "react-native-reanimated";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/theme-context";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

type Question = {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
};

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

export default function QuizScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { C } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();

  const total = QUESTIONS.length;

  const [phase, setPhase] = useState<Phase>("intro");
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(total).fill(null));
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [locked, setLocked] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const advanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const current = QUESTIONS[qIndex];

  // ===== Score (memoized) =====
  const score = useMemo(() => {
    let s = 0;
    for (let i = 0; i < total; i++) {
      if (answers[i] !== null && answers[i] === QUESTIONS[i].correctIndex) s++;
    }
    return s;
  }, [answers, total]);

  // ===== Cleanup on unmount =====
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
    };
  }, []);

  // ===== Advance to next question or result =====
  const advance = useCallback(
    (nextAnswers: (number | null)[]) => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setQIndex((prev) => {
        if (prev < total - 1) {
          setSelected(null);
          setLocked(false);
          return prev + 1;
        }
        // finish
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setPhase("result");
        return prev;
      });
    },
    [total]
  );

  // ===== Timer (starts fresh for each question) =====
  useEffect(() => {
    if (phase !== "playing" || locked) return;

    setTimeLeft(TIME_PER_QUESTION);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          // schedule auto-advance outside updater
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

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qIndex, phase, locked]);

  // ===== Progress animation =====
  const progressAnim = useSharedValue(0);
  useEffect(() => {
    progressAnim.value = withTiming(qIndex / total, { duration: 400 });
  }, [qIndex, total]);
  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressAnim.value * 100}%`,
  }));

  // ===== Select option =====
  function handleSelect(idx: number) {
    if (locked || phase !== "playing") return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(idx);
    setLocked(true);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const newAnswers = [...answers];
    newAnswers[qIndex] = idx;
    setAnswers(newAnswers);

    advanceTimeoutRef.current = setTimeout(() => {
      advance(newAnswers);
    }, 1200);
  }

  // ===== Skip =====
  function handleSkip() {
    if (locked) return;
    const newAnswers = [...answers];
    newAnswers[qIndex] = null;
    setAnswers(newAnswers);
    advance(newAnswers);
  }

  // ===== Restart =====
  function restart() {
    if (timerRef.current) clearInterval(timerRef.current);
    if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
    setPhase("intro");
    setQIndex(0);
    setSelected(null);
    setAnswers(Array(total).fill(null));
    setLocked(false);
    setTimeLeft(TIME_PER_QUESTION);
  }

  // ================= INTRO =================
  if (phase === "intro") {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
        <View
          style={{
            flex: 1,
            paddingHorizontal: isTablet ? 48 : 28,
            justifyContent: "center",
            alignItems: "center",
            maxWidth: isTablet ? 720 : undefined,
            alignSelf: "center",
            width: "100%",
          }}
        >
          <Text style={{ fontSize: 80 }}>🎯</Text>
          <Text
            style={{
              fontFamily: "PlusJakartaSans_800ExtraBold",
              fontSize: isTablet ? 40 : 30,
              color: C.ink,
              marginTop: 20,
              textAlign: "center",
              letterSpacing: -1,
            }}
          >
            Quiz {id?.replace("q", "") ?? "1"}
          </Text>
          <Text
            style={{
              fontFamily: "PlusJakartaSans_600SemiBold",
              fontSize: 14,
              color: C.muted,
              marginTop: 8,
              textAlign: "center",
            }}
          >
            {total} ပုစ္ဆာ · တစ်ပုဒ်လျှင် {TIME_PER_QUESTION} စက္ကန့်
          </Text>

          <View
            style={{
              marginTop: 40,
              width: "100%",
              backgroundColor: C.card,
              borderRadius: 20,
              padding: 20,
              borderWidth: 1,
              borderColor: C.border,
              gap: 10,
            }}
          >
            <Text style={{ fontFamily: "PlusJakartaSans_800ExtraBold", fontSize: 15, color: C.ink }}>
              စည်းမျဉ်းများ
            </Text>
            {[
              "✅ မှန်ကန်တဲ့ အဖြေကို ရွေးပါ",
              "⏱️ အချိန်ကုန်ရင် အလိုအလျောက် ကျော်သွားမယ်",
              "🏆 ပြီးဆုံးရင် ရမှတ်ကို ပြပါမယ်",
            ].map((r, i) => (
              <Text
                key={i}
                style={{
                  fontFamily: "PlusJakartaSans_600SemiBold",
                  fontSize: 13,
                  color: C.ink,
                  opacity: 0.8,
                }}
              >
                {r}
              </Text>
            ))}
          </View>

          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              setPhase("playing");
            }}
            style={({ pressed }) => ({
              marginTop: 32,
              width: "100%",
              backgroundColor: C.ink,
              borderRadius: 22,
              paddingVertical: 20,
              alignItems: "center",
              opacity: pressed ? 0.9 : 1,
            })}
          >
            <Text style={{ fontFamily: "PlusJakartaSans_800ExtraBold", fontSize: 16, color: C.bg }}>
              စတင်မယ် →
            </Text>
          </Pressable>

          <Pressable onPress={() => router.back()} style={{ marginTop: 16, paddingVertical: 12 }}>
            <Text style={{ fontFamily: "PlusJakartaSans_600SemiBold", fontSize: 13, color: C.muted }}>
              ပြန်ထွက်မယ်
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // ================= RESULT =================
  if (phase === "result") {
    const pct = Math.round((score / total) * 100);
    const passed = pct >= 60;
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 28,
            justifyContent: "center",
            paddingVertical: 32,
          }}
        >
          <Animated.View entering={FadeInDown.springify()}>
            <View style={{ alignItems: "center" }}>
              <Text style={{ fontSize: 100 }}>{passed ? "🏆" : "💪"}</Text>
              <Text
                style={{
                  fontFamily: "PlusJakartaSans_800ExtraBold",
                  fontSize: 34,
                  color: C.ink,
                  marginTop: 16,
                  letterSpacing: -1,
                }}
              >
                {passed ? "ဂုဏ်ယူပါတယ်!" : "ထပ်ကြိုးစားပါ!"}
              </Text>
              <Text
                style={{
                  fontFamily: "PlusJakartaSans_600SemiBold",
                  fontSize: 15,
                  color: C.muted,
                  marginTop: 8,
                }}
              >
                {score} / {total} မှန် ({pct}%)
              </Text>
            </View>

            <View
              style={{
                marginTop: 32,
                backgroundColor: C.card,
                borderRadius: 24,
                padding: 24,
                borderWidth: 1,
                borderColor: C.border,
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
                <Text style={{ fontFamily: "PlusJakartaSans_700Bold", color: C.muted, fontSize: 13 }}>
                  မှန်သော အဖြေ
                </Text>
                <Text style={{ fontFamily: "PlusJakartaSans_800ExtraBold", color: "#4ECDC4", fontSize: 14 }}>
                  {score} မှန်
                </Text>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
                <Text style={{ fontFamily: "PlusJakartaSans_700Bold", color: C.muted, fontSize: 13 }}>
                  မှားသော အဖြေ
                </Text>
                <Text style={{ fontFamily: "PlusJakartaSans_800ExtraBold", color: "#FF8066", fontSize: 14 }}>
                  {total - score} မှား
                </Text>
              </View>
              <View style={{ height: 12, backgroundColor: C.softBg, borderRadius: 6, overflow: "hidden", marginTop: 8 }}>
                <LinearGradient
                  colors={passed ? ["#4ECDC4", "#4055DC"] : ["#FFAE9C", "#FF8066"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ width: `${pct}%`, height: "100%", borderRadius: 6 }}
                />
              </View>
            </View>

            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                restart();
              }}
              style={({ pressed }) => ({
                marginTop: 24,
                backgroundColor: C.ink,
                borderRadius: 22,
                paddingVertical: 20,
                alignItems: "center",
                opacity: pressed ? 0.9 : 1,
              })}
            >
              <Text style={{ fontFamily: "PlusJakartaSans_800ExtraBold", fontSize: 16, color: C.bg }}>
                ပြန်ကစားမယ်
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.back()}
              style={{ marginTop: 12, paddingVertical: 16, alignItems: "center" }}
            >
              <Text style={{ fontFamily: "PlusJakartaSans_700Bold", fontSize: 14, color: C.primary }}>
                ပြန်ထွက်မယ်
              </Text>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ================= PLAYING =================
  const timeColor = timeLeft <= 5 ? "#FF8066" : timeLeft <= 10 ? "#F4C430" : "#4ECDC4";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <View
        style={{
          paddingHorizontal: isTablet ? 48 : 24,
          paddingTop: 16,
          maxWidth: isTablet ? 900 : undefined,
          alignSelf: "center",
          width: "100%",
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Pressable
            onPress={() => router.back()}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: C.card,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: C.border,
            }}
          >
            <Text style={{ fontSize: 20, color: C.ink }}>←</Text>
          </Pressable>

          <Text style={{ fontFamily: "PlusJakartaSans_800ExtraBold", fontSize: 16, color: C.ink }}>
            {qIndex + 1} / {total}
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: timeLeft <= 5 ? "rgba(255,128,102,0.15)" : "rgba(78,205,196,0.15)",
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 20,
              gap: 6,
            }}
          >
            <Text style={{ fontSize: 14 }}>⏱️</Text>
            <Text
              style={{
                fontFamily: "PlusJakartaSans_800ExtraBold",
                fontSize: 15,
                color: timeColor,
                minWidth: 24,
                textAlign: "center",
              }}
            >
              {timeLeft}
            </Text>
          </View>
        </View>

        <View
          style={{
            height: 8,
            backgroundColor: C.softBg,
            borderRadius: 4,
            marginTop: 16,
            overflow: "hidden",
          }}
        >
          <Animated.View
            style={[
              { height: "100%", borderRadius: 4, backgroundColor: C.primary },
              progressStyle,
            ]}
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: isTablet ? 48 : 24,
          paddingTop: 32,
          paddingBottom: 40,
          maxWidth: isTablet ? 900 : undefined,
          alignSelf: "center",
          width: "100%",
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View key={qIndex} entering={SlideInRight.springify()}>
          <View
            style={{
              backgroundColor: C.card,
              borderRadius: 24,
              padding: 28,
              borderWidth: 1,
              borderColor: C.border,
            }}
          >
            <Text
              style={{
                fontFamily: "PlusJakartaSans_800ExtraBold",
                fontSize: isTablet ? 36 : 28,
                color: C.ink,
                textAlign: "center",
                letterSpacing: -0.5,
              }}
            >
              {current.text}
            </Text>
          </View>

          <View style={{ gap: 12, marginTop: 24 }}>
            {current.options.map((opt, i) => {
              const isSelected = selected === i;
              const isCorrect = i === current.correctIndex;
              const showCorrect = locked && isCorrect;
              const showWrong = locked && isSelected && !isCorrect;

              let bg = C.card;
              let borderColor = C.border;
              let textColor = C.ink;
              if (showCorrect) {
                bg = "#D4F4E8";
                borderColor = "#4ECDC4";
                textColor = "#1E7A6F";
              } else if (showWrong) {
                bg = "#FFE0D8";
                borderColor = "#FF8066";
                textColor = "#C2402B";
              } else if (isSelected) {
                bg = C.primary;
                borderColor = C.primary;
                textColor = "#FFFFFF";
              }

              return (
                <Animated.View key={i} entering={FadeInDown.delay(i * 60).springify()}>
                  <Pressable
                    onPress={() => handleSelect(i)}
                    disabled={locked}
                    style={({ pressed }) => ({
                      backgroundColor: bg,
                      borderRadius: 20,
                      paddingVertical: 20,
                      paddingHorizontal: 20,
                      borderWidth: 2,
                      borderColor,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 14,
                      opacity: pressed ? 0.85 : 1,
                    })}
                  >
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 12,
                        backgroundColor:
                          showCorrect || showWrong ? "rgba(255,255,255,0.7)" : C.softBg,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "PlusJakartaSans_800ExtraBold",
                          fontSize: 15,
                          color: isSelected && !locked ? "#FFF" : textColor,
                        }}
                      >
                        {String.fromCharCode(65 + i)}
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontFamily: "PlusJakartaSans_800ExtraBold",
                        fontSize: 20,
                        color: textColor,
                        flex: 1,
                      }}
                    >
                      {opt}
                    </Text>
                    {showCorrect && <Text style={{ fontSize: 22 }}>✓</Text>}
                    {showWrong && <Text style={{ fontSize: 22 }}>✗</Text>}
                  </Pressable>
                </Animated.View>
              );
            })}
          </View>

          {!locked && (
            <Pressable
              onPress={handleSkip}
              style={{ marginTop: 24, alignItems: "center", paddingVertical: 12 }}
            >
              <Text style={{ fontFamily: "PlusJakartaSans_700Bold", fontSize: 13, color: C.muted }}>
                ကျော်မယ် →
              </Text>
            </Pressable>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}