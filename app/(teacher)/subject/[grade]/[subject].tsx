import { View, Text, Dimensions, Pressable, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
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
import { useState, useCallback, useEffect, useRef } from "react";
import { FONT } from "@/lib/design";
import { LessonsStore, Lesson } from "@/lib/lessons-store";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

const PAL = {
  bg: "#F0F5F8",
  bgTop: "#D4E8E6",
  bgBottom: "#EDE9F5",
  primary: "#2C7A7B",
  primaryDark: "#1E5C5D",
  accent: "#9F7AEA",
  accentDark: "#7C5CC7",
  text: "#1E2A38",
  textMuted: "#5C6B7A",
  divider: "#D8E2E8",
  success: "#2C7A7B",
  danger: "#C2402B",
};

const SUBJECT_META: Record<
  string,
  { name: string; emoji: string; color: string; darkColor: string }
> = {
  myanmar: { name: "မြန်မာစာ", emoji: "📖", color: "#E8A8A8", darkColor: "#C97B7B" },
  english: { name: "အင်္ဂလိပ်", emoji: "🔤", color: "#7BC4C4", darkColor: "#5CA3A3" },
  math: { name: "သင်္ချာ", emoji: "🔢", color: "#9FC4E8", darkColor: "#7BA3C9" },
  science: { name: "သိပ္ပံ", emoji: "🔬", color: "#A8D5BA", darkColor: "#7BB89A" },
  history: { name: "သမိုင်း", emoji: "🏛️", color: "#E8D47B", darkColor: "#C9B55C" },
  geography: { name: "ပထဝီ", emoji: "🌍", color: "#B8A4D9", darkColor: "#9880B8" },
};

type Mood = "idle" | "happy" | "excited" | "thinking" | "wave" | "sad";

function Pip({
  mood = "idle",
  size = 80,
  prop,
  flameTop = PAL.accent,
  flameBottom = PAL.accentDark,
  teacher = false,
}: {
  mood?: Mood;
  size?: number;
  prop?: string;
  flameTop?: string;
  flameBottom?: string;
  teacher?: boolean;
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
    <Animated.View style={[bodyAnim, { width: size, height: size * 1.3 }]}>
      {teacher && (
        <View
          style={{
            position: "absolute",
            top: -size * 0.08,
            left: size * 0.28,
            width: size * 0.44,
            alignItems: "center",
            zIndex: 10,
          }}
        >
          <View
            style={{
              width: size * 0.34,
              height: size * 0.26,
              backgroundColor: "#1E2A38",
              borderTopLeftRadius: size * 0.17,
              borderTopRightRadius: size * 0.17,
              borderWidth: 2,
              borderColor: "#0F1923",
            }}
          />
          <View
            style={{
              width: size * 0.44,
              height: size * 0.06,
              backgroundColor: "#1E2A38",
              borderRadius: size * 0.03,
              marginTop: -2,
            }}
          />
          <View
            style={{
              position: "absolute",
              top: size * 0.18,
              right: size * 0.02,
              width: 3,
              height: size * 0.14,
              backgroundColor: PAL.accent,
            }}
          />
          <View
            style={{
              position: "absolute",
              top: size * 0.3,
              right: -size * 0.04,
              width: size * 0.08,
              height: size * 0.08,
              borderRadius: size * 0.04,
              backgroundColor: PAL.accent,
            }}
          />
        </View>
      )}

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
          colors={[flameTop, flameBottom, "rgba(159,122,234,0)"]}
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
            backgroundColor: "#F0F5F8",
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
                    height: mood === "sad" ? size * 0.06 : size * 0.11,
                    borderRadius: size * 0.04,
                    backgroundColor: "#1E2A38",
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
              borderBottomLeftRadius: mood === "sad" ? 0 : size * 0.06,
              borderBottomRightRadius: mood === "sad" ? 0 : size * 0.06,
              borderTopLeftRadius: mood === "sad" ? size * 0.06 : 0,
              borderTopRightRadius: mood === "sad" ? size * 0.06 : 0,
              backgroundColor: mood === "sad" ? "transparent" : "#1E2A38",
              borderTopWidth: mood === "sad" ? 2 : 0,
              borderColor: mood === "sad" ? "#1E2A38" : "transparent",
              overflow: "hidden",
            }}
          >
            {mood !== "sad" && (
              <View
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: "25%",
                  right: "25%",
                  height: "45%",
                  backgroundColor: PAL.accent,
                  borderTopLeftRadius: size * 0.02,
                  borderTopRightRadius: size * 0.02,
                }}
              />
            )}
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
            backgroundColor: PAL.accent,
            borderWidth: 2,
            borderColor: PAL.accentDark,
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

function LessonRow({
  lesson,
  index,
  isActive,
  onPress,
  onHover,
  onEdit,
  onDelete,
  subjectColor,
}: {
  lesson: Lesson;
  index: number;
  isActive: boolean;
  onPress: () => void;
  onHover: () => void;
  onEdit: () => void;
  onDelete: () => void;
  subjectColor: string;
}) {
  const scale = useSharedValue(1);
  const shift = useSharedValue(0);
  const dotSize = useSharedValue(10);

  useEffect(() => {
    shift.value = withSpring(isActive ? 1 : 0, { damping: 14, stiffness: 200 });
    dotSize.value = withSpring(isActive ? 16 : 10, {
      damping: 14,
      stiffness: 200,
    });
  }, [isActive]);

  const anim = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: interpolate(shift.value, [0, 1], [0, 6]) },
    ],
  }));
  const dotAnim = useAnimatedStyle(() => ({
    width: dotSize.value,
    height: dotSize.value,
    borderRadius: dotSize.value / 2,
  }));

  return (
    <Animated.View entering={FadeInDown.delay(index * 60).springify()}>
      <Pressable
        onPressIn={() => {
          scale.value = withSpring(0.98, { damping: 15, stiffness: 400 });
          onHover();
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 12, stiffness: 300 });
        }}
        onPress={() => {
          Haptics.selectionAsync();
          onPress();
        }}
      >
        <Animated.View
          style={[
            anim,
            {
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 14,
              paddingHorizontal: 4,
            },
          ]}
        >
          <Text
            style={{
              fontFamily: FONT.extrabold,
              fontSize: 11,
              color: isActive ? subjectColor : PAL.textMuted,
              letterSpacing: 1,
              width: 28,
            }}
          >
            {String(lesson.order).padStart(2, "0")}
          </Text>

          <Animated.View
            style={[
              dotAnim,
              {
                backgroundColor: isActive ? subjectColor : PAL.divider,
                marginRight: 14,
              },
            ]}
          />

          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: FONT.extrabold,
                fontSize: isTablet ? 17 : 15,
                color: isActive ? subjectColor : PAL.text,
                letterSpacing: -0.2,
              }}
              numberOfLines={1}
            >
              {lesson.title}
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                marginTop: 4,
              }}
            >
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: lesson.published ? PAL.success : PAL.accentDark,
                }}
              />
              <Text
                style={{
                  fontFamily: FONT.extrabold,
                  fontSize: 10,
                  color: PAL.textMuted,
                  letterSpacing: 0.8,
                }}
              >
                {lesson.published ? "PUBLISHED" : "DRAFT"}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", gap: 4 }}>
            <Pressable
              onPress={() => {
                Haptics.selectionAsync();
                onEdit();
              }}
              hitSlop={8}
              style={{ width: 36, height: 36, alignItems: "center", justifyContent: "center" }}
            >
              <Text style={{ fontSize: 16 }}>✏️</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                Haptics.selectionAsync();
                onDelete();
              }}
              hitSlop={8}
              style={{ width: 36, height: 36, alignItems: "center", justifyContent: "center" }}
            >
              <Text style={{ fontSize: 16 }}>🗑️</Text>
            </Pressable>
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

export default function TeacherSubjectLessons() {
  const router = useRouter();
  const { grade, subject } = useLocalSearchParams<{
    grade: string;
    subject: string;
  }>();
  const meta = SUBJECT_META[subject ?? "math"] ?? SUBJECT_META.math;
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [mood, setMood] = useState<Mood>("idle");
  const [message, setMessage] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const resetTimer = useRef<any>(null);

  useFocusEffect(
    useCallback(() => {
      if (subject && grade) {
        const list = LessonsStore.getByGradeAndSubject(grade, subject);
        setLessons(list);
        if (list.length === 0) {
          setMood("sad");
          setMessage("No lessons yet — let's add one! 📝");
        } else {
          setMood("idle");
          setMessage(`${list.length} lessons ready to go! 📚`);
        }
      }
    }, [subject, grade])
  );

  const react = (newMood: Mood, msg: string) => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
    setMood(newMood);
    setMessage(msg);
    resetTimer.current = setTimeout(() => {
      setMood(lessons.length === 0 ? "sad" : "idle");
      setMessage(
        lessons.length === 0
          ? "No lessons yet — let's add one! 📝"
          : `${lessons.length} lessons ready to go! 📚`
      );
    }, 2200);
  };

  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  const handleDelete = (lesson: Lesson) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      "သင်ခန်းစာ ဖျက်မလား?",
      `"${lesson.title}" ကို ဖျက်တော့မယ်။ ပြန်မရနိုင်ပါ။`,
      [
        { text: "မဖျက်ဘူး", style: "cancel" },
        {
          text: "ဖျက်မယ်",
          style: "destructive",
          onPress: () => {
            LessonsStore.delete(lesson.id);
            if (subject && grade) {
              const updated = LessonsStore.getByGradeAndSubject(grade, subject);
              setLessons(updated);
            }
            Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Success
            );
            react("thinking", "Lesson deleted 🗑️");
          },
        },
      ]
    );
  };

  const flameTop = activeId
    ? `${meta.color}99`
    : lessons.length === 0
    ? "#C8C8C8"
    : PAL.accent;
  const flameBottom = activeId
    ? meta.color
    : lessons.length === 0
    ? "#A0A0A0"
    : PAL.accentDark;

  return (
    <View style={{ flex: 1, backgroundColor: PAL.bg }}>
      <LinearGradient
        colors={[PAL.bgTop, PAL.bg, PAL.bgBottom]}
        locations={[0, 0.5, 1]}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <SafeAreaView style={{ flex: 1 }}>
        <View
          style={{
            flex: 1,
            paddingHorizontal: isTablet ? 48 : 24,
            maxWidth: isTablet ? 600 : undefined,
            alignSelf: "center",
            width: "100%",
          }}
        >
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
              marginTop: 12,
            }}
          >
            <Text style={{ fontSize: 22, color: PAL.text }}>←</Text>
          </Pressable>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              marginTop: 12,
              marginBottom: 20,
            }}
          >
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                react(
                  lessons.length === 0 ? "sad" : "excited",
                  lessons.length === 0
                    ? "Tap ➕ to add your first lesson! 📝"
                    : "Pick a lesson to edit! 📚"
                );
              }}
            >
              <Pip
                mood={mood}
                size={isTablet ? 90 : 76}
                prop={lessons.length === 0 ? "📭" : meta.emoji}
                flameTop={flameTop}
                flameBottom={flameBottom}
                teacher
              />
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

          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginBottom: 4,
              }}
            >
              <Text style={{ fontSize: 22 }}>{meta.emoji}</Text>
              <Text
                style={{
                  fontFamily: FONT.extrabold,
                  fontSize: 11,
                  letterSpacing: 2,
                  color: PAL.primary,
                }}
              >
                {grade?.toUpperCase()} · {subject?.toUpperCase()}
              </Text>
            </View>
            <Text
              style={{
                fontFamily: FONT.extrabold,
                fontSize: isTablet ? 38 : 30,
                color: PAL.text,
                letterSpacing: -1,
                lineHeight: isTablet ? 44 : 36,
              }}
            >
              {meta.name}
            </Text>
            <Text
              style={{
                fontFamily: FONT.semibold,
                fontSize: 13,
                color: PAL.textMuted,
                marginTop: 4,
              }}
            >
              {lessons.length} သင်ခန်းစာ
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(150).springify()}>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push(
                  `/(teacher)/lesson/editor?subject=${subject}&grade=${grade}`
                );
              }}
              style={{
                backgroundColor: PAL.primary,
                borderRadius: 999,
                paddingVertical: 14,
                alignItems: "center",
                justifyContent: "center",
                marginTop: 20,
                flexDirection: "row",
                gap: 8,
              }}
            >
              <Text style={{ fontSize: 15, color: "#FFFFFF" }}>➕</Text>
              <Text
                style={{
                  fontFamily: FONT.extrabold,
                  fontSize: 14,
                  color: "#FFFFFF",
                  letterSpacing: 0.3,
                }}
              >
                သင်ခန်းစာ အသစ် ထည့်မယ်
              </Text>
            </Pressable>
          </Animated.View>

          <View
            style={{
              height: 1,
              backgroundColor: PAL.divider,
              marginTop: 24,
              marginBottom: 8,
            }}
          />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            {lessons.length === 0 ? (
              <Animated.View
                entering={FadeInDown.delay(250).springify()}
                style={{ alignItems: "center", marginTop: 40, padding: 24 }}
              >
                <Text style={{ fontSize: 56 }}>📭</Text>
                <Text
                  style={{
                    fontFamily: FONT.extrabold,
                    fontSize: 16,
                    color: PAL.text,
                    marginTop: 16,
                  }}
                >
                  သင်ခန်းစာ မရှိသေးပါ
                </Text>
                <Text
                  style={{
                    fontFamily: FONT.semibold,
                    fontSize: 13,
                    color: PAL.textMuted,
                    marginTop: 6,
                    textAlign: "center",
                  }}
                >
                  အပေါ်က ➕ ခလုတ်နဲ့ ပထမဆုံး သင်ခန်းစာကို စတင်ပါ
                </Text>
              </Animated.View>
            ) : (
              lessons.map((l, i) => (
                <View key={l.id}>
                  <LessonRow
                    lesson={l}
                    index={i}
                    isActive={activeId === l.id}
                    subjectColor={meta.darkColor}
                    onHover={() => {
                      setActiveId(l.id);
                      setMood("excited");
                      setMessage(`"${l.title}" — ${l.published ? "published ✅" : "draft 📝"}`);
                    }}
                    onPress={() => {
                      router.push(`/(teacher)/lesson/editor?id=${l.id}`);
                    }}
                    onEdit={() => {
                      router.push(`/(teacher)/lesson/editor?id=${l.id}`);
                    }}
                    onDelete={() => handleDelete(l)}
                  />
                  {i < lessons.length - 1 && (
                    <View
                      style={{ height: 1, backgroundColor: PAL.divider }}
                    />
                  )}
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
}