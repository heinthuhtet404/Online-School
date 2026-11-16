import { View, Text, Dimensions, Pressable, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "expo-router/js-tabs";
import { useRouter } from "expo-router";
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
import { useEffect, useState, useRef } from "react";
import { FONT } from "@/lib/design";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

const PAL = {
  bg: "#FFF8F0", bgTop: "#FFE8D6", bgBottom: "#E8F4FF",
  primary: "#FF6B6B", primaryDark: "#E05050",
  secondary: "#4ECDC4", secondaryDark: "#3BA89F",
  accent: "#FFD93D", accentDark: "#E5C020",
  text: "#2D2422", textMuted: "#7A6A63", divider: "#EDE3D8",
};

const GRADES = [
  { id: "kg", label: "KG", emoji: "🌱", color: "#A8D5BA", darkColor: "#7BB89A", reaction: "KG Quiz — little stars! 🌱" },
  { id: "g1", label: "Grade 1", emoji: "🐣", color: "#E8C547", darkColor: "#C9A42F", reaction: "Grade 1 Quiz — let's go! 🐣" },
  { id: "g2", label: "Grade 2", emoji: "🦊", color: "#E8A8A8", darkColor: "#C97B7B", reaction: "Grade 2 Quiz — clever foxes! 🦊" },
  { id: "g3", label: "Grade 3", emoji: "🐬", color: "#7BC4C4", darkColor: "#5CA3A3", reaction: "Grade 3 Quiz — dive in! 🐬" },
  { id: "g4", label: "Grade 4", emoji: "🦉", color: "#B8A4D9", darkColor: "#9880B8", reaction: "Grade 4 Quiz — wise owls! 🦉" },
  { id: "g5", label: "Grade 5", emoji: "🚀", color: "#9FC4E8", darkColor: "#7BA3C9", reaction: "Grade 5 Quiz — launch! 🚀" },
  { id: "g6", label: "Grade 6", emoji: "🏆", color: "#E8D47B", darkColor: "#C9B55C", reaction: "Grade 6 Quiz — final round! 🏆" },
];

type Mood = "idle" | "happy" | "excited" | "thinking" | "wave";

// ===== Pip — student version (hat မပါ) =====
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

// ===== Grade Row — LessonList ပုံစံအတိုင်း =====
function GradeRow({ item, index, isActive, onPress, onHover }: {
  item: (typeof GRADES)[0]; index: number; isActive: boolean; onPress: () => void; onHover: () => void;
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

  return (
    <Animated.View entering={FadeInDown.delay(index * 60).springify()}>
      <Pressable
        onPressIn={() => { scale.value = withSpring(0.98, { damping: 15, stiffness: 400 }); onHover(); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 12, stiffness: 300 }); }}
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPress(); }}
      >
        <Animated.View style={[anim, { flexDirection: "row", alignItems: "center", paddingVertical: 16, paddingHorizontal: 4 }]}>
          <Text style={{ fontFamily: FONT.extrabold, fontSize: 11, color: isActive ? item.darkColor : PAL.textMuted, letterSpacing: 1, width: 28 }}>
            {String(index + 1).padStart(2, "0")}
          </Text>
          <Animated.View style={[dotAnim, { backgroundColor: isActive ? item.color : PAL.divider, marginRight: 16 }]} />
          <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Text style={{ fontSize: 22 }}>{item.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: FONT.extrabold, fontSize: isTablet ? 20 : 17, color: isActive ? item.darkColor : PAL.text, letterSpacing: -0.3 }}>
                {item.label}
              </Text>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 11, color: PAL.textMuted, marginTop: 1 }}>
                Quiz ဖြေဆိုရန်
              </Text>
            </View>
          </View>
          <Animated.View style={{ opacity: interpolate(shift.value, [0, 1], [0, 1]), transform: [{ translateX: interpolate(shift.value, [0, 1], [-8, 0]) }] }}>
            <Text style={{ fontSize: 16, color: item.darkColor, fontWeight: "900" }}>→</Text>
          </Animated.View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

export default function QuizzesHome() {
  const router = useRouter();
  const { t } = useTranslation();
  const tabBarHeight = useBottomTabBarHeight();

  const [mood, setMood] = useState<Mood>("idle");
  const [message, setMessage] = useState("အတန်းကို ရွေးပြီး Quiz ဖြေပါ ✏️");
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeGrade = GRADES.find((g) => g.id === activeId) ?? null;
  const resetTimer = useRef<any>(null);

  const react = (g: (typeof GRADES)[0]) => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
    setActiveId(g.id);
    setMood("excited");
    setMessage(g.reaction);
    resetTimer.current = setTimeout(() => {
      setMood("idle");
      setMessage("အတန်းကို ရွေးပြီး Quiz ဖြေပါ ✏️");
      setActiveId(null);
    }, 2200);
  };

  useEffect(() => () => { if (resetTimer.current) clearTimeout(resetTimer.current); }, []);

  const flameTop = activeGrade ? `${activeGrade.color}99` : PAL.accent;
  const flameBottom = activeGrade?.color ?? "#FFB84D";

  return (
    <View style={{ flex: 1, backgroundColor: PAL.bg }}>
      <LinearGradient colors={[PAL.bgTop, PAL.bg, PAL.bgBottom]} locations={[0, 0.5, 1]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1, paddingHorizontal: isTablet ? 48 : 24, maxWidth: isTablet ? 600 : undefined, alignSelf: "center", width: "100%" }}>
          {/* Pip + message */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 20, marginBottom: 20 }}>
            <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); react(GRADES[0]); }}>
              <Pip mood={mood} size={isTablet ? 90 : 76} prop={activeGrade?.emoji} flameTop={flameTop} flameBottom={flameBottom} />
            </Pressable>
            <Animated.View entering={FadeIn.delay(200)} style={{ flex: 1 }}>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: PAL.textMuted, lineHeight: 20 }}>{message}</Text>
            </Animated.View>
          </View>

          {/* Title */}
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <Text style={{ fontFamily: FONT.extrabold, fontSize: isTablet ? 38 : 30, color: PAL.text, letterSpacing: -1, lineHeight: isTablet ? 44 : 36 }}>
              ✏️ Quiz များ
            </Text>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: PAL.textMuted, marginTop: 4 }}>
              အတန်းကို ရွေးပြီး Quiz ဖြေပါ
            </Text>
          </Animated.View>

          <View style={{ height: 1, backgroundColor: PAL.divider, marginTop: 24, marginBottom: 8 }} />

          {/* Grade list */}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: tabBarHeight + 24 }}>
            {GRADES.map((item, i) => (
              <View key={item.id}>
                <GradeRow
                  item={item}
                  index={i}
                  isActive={activeId === item.id}
                  onHover={() => react(item)}
                  onPress={() => router.push(`/(student)/quiz-subjects/${item.id}`)}
                />
                {i < GRADES.length - 1 && <View style={{ height: 1, backgroundColor: PAL.divider }} />}
              </View>
            ))}
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
}