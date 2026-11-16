import { View, Text, Dimensions, Pressable, ScrollView } from "react-native";
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
import { useEffect, useState, useRef } from "react";
import { FONT } from "@/lib/design";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

const PAL = {
  bg: "#F0F5F8", bgTop: "#D4E8E6", bgBottom: "#EDE9F5",
  primary: "#2C7A7B", primaryDark: "#1E5C5D",
  accent: "#9F7AEA", accentDark: "#7C5CC7",
  text: "#1E2A38", textMuted: "#5C6B7A", divider: "#D8E2E8",
};

const SUBJECTS = [
  { id: "myanmar", name: "မြန်မာစာ", emoji: "📖", color: "#E8A8A8", darkColor: "#C97B7B", reaction: "မြန်မာစာ — မိခင်ဘာသာ! 📖" },
  { id: "english", name: "English", emoji: "🔤", color: "#7BC4C4", darkColor: "#5CA3A3", reaction: "English — global language! 🔤" },
  { id: "math", name: "Math", emoji: "🔢", color: "#9FC4E8", darkColor: "#7BA3C9", reaction: "Math — numbers game! 🔢" },
  { id: "science", name: "Science", emoji: "🔬", color: "#A8D5BA", darkColor: "#7BB89A", reaction: "Science — explore! 🔬" },
  { id: "history", name: "History", emoji: "🏛️", color: "#E8D47B", darkColor: "#C9B55C", reaction: "History — the past! 🏛️" },
  { id: "geography", name: "Geography", emoji: "🌍", color: "#B8A4D9", darkColor: "#9880B8", reaction: "Geography — the world! 🌍" },
];

type Mood = "idle" | "happy" | "excited" | "thinking" | "wave";

function Pip({
  mood = "idle", size = 80, prop, flameTop = PAL.accent, flameBottom = PAL.accentDark, teacher = true,
}: {
  mood?: Mood; size?: number; prop?: string; flameTop?: string; flameBottom?: string; teacher?: boolean;
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
    <Animated.View style={[bodyAnim, { width: size, height: size * 1.3 }]}>
      {teacher && (
        <View style={{ position: "absolute", top: -size * 0.08, left: size * 0.28, width: size * 0.44, alignItems: "center", zIndex: 10 }}>
          <View style={{ width: size * 0.34, height: size * 0.26, backgroundColor: "#1E2A38", borderTopLeftRadius: size * 0.17, borderTopRightRadius: size * 0.17, borderWidth: 2, borderColor: "#0F1923" }} />
          <View style={{ width: size * 0.44, height: size * 0.06, backgroundColor: "#1E2A38", borderRadius: size * 0.03, marginTop: -2 }} />
        </View>
      )}
      <View style={{ position: "absolute", bottom: 0, left: size * 0.32, width: size * 0.36, height: size * 0.32, alignItems: "center" }}>
        <LinearGradient colors={[flameTop, flameBottom, "rgba(159,122,234,0)"]} locations={[0, 0.5, 1]} style={{ width: size * 0.28, height: size * 0.3, borderTopLeftRadius: size * 0.14, borderTopRightRadius: size * 0.14, borderBottomLeftRadius: size * 0.03, borderBottomRightRadius: size * 0.03 }} />
      </View>
      <View style={{ position: "absolute", bottom: size * 0.3, left: size * 0.04, width: size * 0.16, height: size * 0.3, backgroundColor: PAL.primaryDark, borderTopLeftRadius: size * 0.09, borderBottomLeftRadius: size * 0.15, transform: [{ rotate: "-14deg" }] }} />
      <View style={{ position: "absolute", bottom: size * 0.3, right: size * 0.04, width: size * 0.16, height: size * 0.3, backgroundColor: PAL.primaryDark, borderTopRightRadius: size * 0.09, borderBottomRightRadius: size * 0.15, transform: [{ rotate: "14deg" }] }} />
      <View style={{ position: "absolute", bottom: size * 0.15, left: size * 0.18, width: size * 0.64, height: size * 0.82, borderRadius: size * 0.32, backgroundColor: PAL.primary, borderWidth: 2.5, borderColor: PAL.primaryDark }}>
        <View style={{ position: "absolute", top: size * 0.14, left: size * 0.05, right: size * 0.05, bottom: size * 0.05, borderRadius: size * 0.25, backgroundColor: "#F0F5F8", borderWidth: 2, borderColor: PAL.primaryDark }}>
          <View style={{ flexDirection: "row", justifyContent: "center", gap: size * 0.13, marginTop: size * 0.12 }}>
            {[0, 1].map((i) => (
              <Animated.View key={i} style={[eyeAnim, { width: size * 0.08, height: size * 0.11, borderRadius: size * 0.04, backgroundColor: "#1E2A38", alignItems: "center", justifyContent: "flex-start" }]}>
                <View style={{ width: size * 0.03, height: size * 0.03, borderRadius: size * 0.015, backgroundColor: "#FFFFFF", marginTop: size * 0.02, marginLeft: size * 0.025 }} />
              </Animated.View>
            ))}
          </View>
          <View style={{ alignSelf: "center", marginTop: size * 0.05, width: mood === "excited" ? size * 0.13 : size * 0.09, height: mood === "excited" ? size * 0.09 : size * 0.05, borderBottomLeftRadius: size * 0.06, borderBottomRightRadius: size * 0.06, backgroundColor: "#1E2A38", overflow: "hidden" }}>
            <View style={{ position: "absolute", bottom: 0, left: "25%", right: "25%", height: "45%", backgroundColor: PAL.accent, borderTopLeftRadius: size * 0.02, borderTopRightRadius: size * 0.02 }} />
          </View>
        </View>
        <View style={{ position: "absolute", top: -size * 0.05, alignSelf: "center", width: size * 0.2, height: size * 0.2, borderRadius: size * 0.1, backgroundColor: PAL.accent, borderWidth: 2, borderColor: PAL.accentDark }} />
      </View>
      {prop && (
        <Animated.View style={[propAnim, { position: "absolute", bottom: 0, right: -size * 0.1, width: size * 0.4, height: size * 0.4, borderRadius: size * 0.2, backgroundColor: "#FFFFFF", borderWidth: 2.5, borderColor: PAL.primaryDark, alignItems: "center", justifyContent: "center" }]}>
          <Text style={{ fontSize: size * 0.2 }}>{prop}</Text>
        </Animated.View>
      )}
    </Animated.View>
  );
}

// ===== Subject Card (grid ပုံစံ — Dashboard ရဲ့ row မဟုတ်ဘဲ card) =====
function SubjectCard({
  item, index, isActive, onPress, onHover,
}: {
  item: (typeof SUBJECTS)[0];
  index: number;
  isActive: boolean;
  onPress: () => void;
  onHover: () => void;
}) {
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View entering={FadeInDown.delay(index * 60).springify()} style={{ flex: 1 }}>
      <Pressable
        onPressIn={() => { scale.value = withSpring(0.96, { damping: 15, stiffness: 400 }); onHover(); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 12, stiffness: 300 }); }}
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onPress(); }}
      >
        <Animated.View
          style={[
            anim,
            {
              backgroundColor: isActive ? item.darkColor : item.color,
              borderRadius: 20,
              padding: 20,
              minHeight: isTablet ? 150 : 130,
              justifyContent: "space-between",
              borderWidth: isActive ? 3 : 0,
              borderColor: PAL.primaryDark,
            },
          ]}
        >
          <Text style={{ fontSize: isTablet ? 44 : 36 }}>{item.emoji}</Text>
          <Text style={{ fontFamily: FONT.extrabold, fontSize: isTablet ? 20 : 16, color: "#FFF" }}>{item.name}</Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

export default function TeacherSubjects() {
  const router = useRouter();
  const { grade } = useLocalSearchParams<{ grade: string }>();
  const numCols = isTablet ? 3 : 2;

  const [mood, setMood] = useState<Mood>("idle");
  const [message, setMessage] = useState("ဘာသာရပ် ရွေးပါ 📚");
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeSubject = SUBJECTS.find((s) => s.id === activeId) ?? null;
  const resetTimer = useRef<any>(null);

  const react = (s: (typeof SUBJECTS)[0]) => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
    setActiveId(s.id);
    setMood("excited");
    setMessage(s.reaction);
    resetTimer.current = setTimeout(() => {
      setMood("idle");
      setMessage("ဘာသာရပ် ရွေးပါ 📚");
      setActiveId(null);
    }, 2200);
  };

  useEffect(() => () => { if (resetTimer.current) clearTimeout(resetTimer.current); }, []);

  const flameTop = activeSubject ? `${activeSubject.color}99` : PAL.accent;
  const flameBottom = activeSubject?.color ?? PAL.accentDark;

  return (
    <View style={{ flex: 1, backgroundColor: PAL.bg }}>
      <LinearGradient colors={[PAL.bgTop, PAL.bg, PAL.bgBottom]} locations={[0, 0.5, 1]} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1, paddingHorizontal: isTablet ? 48 : 24, maxWidth: isTablet ? 600 : undefined, alignSelf: "center", width: "100%" }}>
          <View style={{ marginTop: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={{ fontFamily: FONT.extrabold, fontSize: 12, letterSpacing: 2, color: PAL.primary }}>TEACHER MODE</Text>
            <Pressable onPress={() => { Haptics.selectionAsync(); router.back(); }} style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontSize: 22, color: PAL.text }}>←</Text>
            </Pressable>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 20, marginBottom: 20 }}>
            <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); react(SUBJECTS[0]); }}>
              <Pip mood={mood} size={isTablet ? 90 : 76} prop={activeSubject?.emoji} flameTop={flameTop} flameBottom={flameBottom} teacher />
            </Pressable>
            <Animated.View entering={FadeIn.delay(200)} style={{ flex: 1 }}>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: PAL.textMuted, lineHeight: 20 }}>{message}</Text>
            </Animated.View>
          </View>

          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <Text style={{ fontFamily: FONT.extrabold, fontSize: isTablet ? 38 : 30, color: PAL.text, letterSpacing: -1, lineHeight: isTablet ? 44 : 36 }}>
              {grade?.toUpperCase()} · ဘာသာရပ်
            </Text>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: PAL.textMuted, marginTop: 6 }}>
              ဘာသာရပ်ကို ရွေးပါ
            </Text>
          </Animated.View>

          <View style={{ height: 1, backgroundColor: PAL.divider, marginTop: 24, marginBottom: 20 }} />

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
            <View style={{ gap: 14 }}>
              {Array.from({ length: Math.ceil(SUBJECTS.length / numCols) }).map((_, ri) => {
                const row = SUBJECTS.slice(ri * numCols, ri * numCols + numCols);
                return (
                  <View key={ri} style={{ flexDirection: "row", gap: 14 }}>
                    {row.map((s, i) => (
                      <SubjectCard
                        key={s.id}
                        item={s}
                        index={ri * numCols + i}
                        isActive={activeId === s.id}
                        onHover={() => react(s)}
                        onPress={() => router.push(`/(teacher)/subject/${grade}/${s.id}`)}
                      />
                    ))}
                    {row.length < numCols && Array.from({ length: numCols - row.length }).map((_, k) => (<View key={k} style={{ flex: 1 }} />))}
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
}