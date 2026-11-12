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
import { useTranslation } from "react-i18next";
import { FONT } from "@/lib/design";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

// ============================================================
// PALETTE
// ============================================================
const PAL = {
  bg: "#FFF8F0",
  bgTop: "#FFE8D6",
  bgMid: "#F5EDFF",
  bgBottom: "#E8F4FF",
  primary: "#FF6B6B",
  primaryDark: "#E05050",
  secondary: "#4ECDC4",
  secondaryDark: "#3BA89F",
  accent: "#FFD93D",
  accentDark: "#E5C020",
  purple: "#A78BFA",
  purpleDark: "#8B6FE0",
  text: "#2D2422",
  textMuted: "#7A6A63",
  bubble: "#FFFFFF",
  bubbleBorder: "#E8DDD5",
  path: "#D9CBB8",
};

// ============================================================
// SUBJECTS — destinations along Pip's trail
// ============================================================
const SUBJECTS = [
  {
    id: "myanmar",
    nameKey: "subjects.myanmar",
    emoji: "📖",
    prop: "📖",
    color: "#F4A6C0",
    darkColor: "#E88AA8",
    flameTop: "#FFC9DE",
    flameBottom: "#F4A6C0",
    reaction: "Let's read stories together! 📖",
    side: "left" as const,
  },
  {
    id: "english",
    nameKey: "subjects.english",
    emoji: "🔤",
    prop: "🔤",
    color: "#A78BFA",
    darkColor: "#8B6FE0",
    flameTop: "#C9B8FF",
    flameBottom: "#A78BFA",
    reaction: "Hello! Let's learn words! 🔤",
    side: "right" as const,
  },
  {
    id: "math",
    nameKey: "subjects.math",
    emoji: "🔢",
    prop: "🔢",
    color: "#4ECDC4",
    darkColor: "#3BA89F",
    flameTop: "#A0EDE6",
    flameBottom: "#4ECDC4",
    reaction: "Numbers are fun! Let's count! 🔢",
    side: "left" as const,
  },
  {
    id: "science",
    nameKey: "subjects.science",
    emoji: "🔬",
    prop: "🔬",
    color: "#9DD9C5",
    darkColor: "#7EC4AE",
    flameTop: "#C9EEDD",
    flameBottom: "#9DD9C5",
    reaction: "Science experiments! Wow! 🔬",
    side: "right" as const,
  },
  {
    id: "history",
    nameKey: "subjects.history",
    emoji: "🏛️",
    prop: "🏛️",
    color: "#FFD93D",
    darkColor: "#E5C020",
    flameTop: "#FFE9A0",
    flameBottom: "#FFD93D",
    reaction: "Let's travel back in time! 🏛️",
    side: "left" as const,
  },
  {
    id: "geography",
    nameKey: "subjects.geography",
    emoji: "🌍",
    prop: "🗺️",
    color: "#9FE870",
    darkColor: "#7EC450",
    flameTop: "#C9F4A8",
    flameBottom: "#9FE870",
    reaction: "Where should we explore? 🌍",
    side: "right" as const,
  },
];

const GRADE_LABELS: Record<string, string> = {
  kg: "KG", g1: "Grade 1", g2: "Grade 2", g3: "Grade 3",
  g4: "Grade 4", g5: "Grade 5", g6: "Grade 6",
};

type Mood = "idle" | "happy" | "excited" | "thinking" | "wave";

// ============================================================
// PIP — hero version with prop + colored flames
// ============================================================
function Pip({
  mood = "idle",
  size = 140,
  prop,
  flameTop = PAL.accent,
  flameBottom = "#FFB84D",
}: {
  mood?: Mood;
  size?: number;
  prop?: string;
  flameTop?: string;
  flameBottom?: string;
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
      { translateY: interpolate(bob.value, [0, 1], [0, -8]) },
      {
        rotate:
          mood === "excited"
            ? `${interpolate(bob.value, [0, 1], [-3, 3])}deg`
            : "0deg",
      },
    ],
  }));

  const eyeAnim = useAnimatedStyle(() => ({
    transform: [{ scaleY: blink.value }],
  }));

  const propAnim = useAnimatedStyle(() => ({
    transform: [{ scale: propScale.value }],
    opacity: propScale.value,
  }));

  return (
    <Animated.View style={[bodyAnim, { width: size, height: size * 1.3 }]}>
      {/* Glow */}
      <View
        style={{
          position: "absolute",
          top: -size * 0.15,
          left: -size * 0.15,
          width: size * 1.3,
          height: size * 1.3,
          borderRadius: size * 0.65,
          backgroundColor: PAL.primary,
          opacity: 0.08,
        }}
      />

      {/* Flame */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: size * 0.32,
          width: size * 0.36,
          height: size * 0.35,
          alignItems: "center",
        }}
      >
        <LinearGradient
          colors={[flameTop, flameBottom, "rgba(255,184,77,0)"]}
          locations={[0, 0.5, 1]}
          style={{
            width: size * 0.3,
            height: size * 0.32,
            borderTopLeftRadius: size * 0.15,
            borderTopRightRadius: size * 0.15,
            borderBottomLeftRadius: size * 0.04,
            borderBottomRightRadius: size * 0.04,
          }}
        />
        <LinearGradient
          colors={["#FFFFFF", flameTop, "rgba(255,255,255,0)"]}
          style={{
            position: "absolute",
            top: size * 0.08,
            width: size * 0.14,
            height: size * 0.16,
            borderRadius: size * 0.08,
          }}
        />
      </View>

      {/* Fins */}
      <View
        style={{
          position: "absolute",
          bottom: size * 0.32,
          left: size * 0.04,
          width: size * 0.18,
          height: size * 0.32,
          backgroundColor: PAL.primaryDark,
          borderTopLeftRadius: size * 0.1,
          borderBottomLeftRadius: size * 0.16,
          transform: [{ rotate: "-14deg" }],
        }}
      />
      <View
        style={{
          position: "absolute",
          bottom: size * 0.32,
          right: size * 0.04,
          width: size * 0.18,
          height: size * 0.32,
          backgroundColor: PAL.primaryDark,
          borderTopRightRadius: size * 0.1,
          borderBottomRightRadius: size * 0.16,
          transform: [{ rotate: "14deg" }],
        }}
      />

      {/* Body */}
      <View
        style={{
          position: "absolute",
          bottom: size * 0.15,
          left: size * 0.18,
          width: size * 0.64,
          height: size * 0.85,
          borderRadius: size * 0.33,
          backgroundColor: PAL.primary,
          borderWidth: 3,
          borderColor: PAL.primaryDark,
          shadowColor: PAL.primaryDark,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.35,
          shadowRadius: 12,
          elevation: 8,
        }}
      >
        <View
          style={{
            position: "absolute",
            top: size * 0.06,
            left: size * 0.1,
            width: size * 0.1,
            height: size * 0.42,
            borderRadius: size * 0.05,
            backgroundColor: "rgba(255,255,255,0.4)",
          }}
        />

        {/* Face */}
        <View
          style={{
            position: "absolute",
            top: size * 0.14,
            left: size * 0.05,
            right: size * 0.05,
            bottom: size * 0.05,
            borderRadius: size * 0.26,
            backgroundColor: "#FFF5F0",
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
                    width: size * 0.09,
                    height: size * 0.12,
                    borderRadius: size * 0.045,
                    backgroundColor: "#2D2422",
                    alignItems: "center",
                    justifyContent: "flex-start",
                  },
                ]}
              >
                <View
                  style={{
                    width: size * 0.035,
                    height: size * 0.035,
                    borderRadius: size * 0.0175,
                    backgroundColor: "#FFFFFF",
                    marginTop: size * 0.02,
                    marginLeft: size * 0.03,
                  }}
                />
              </Animated.View>
            ))}
          </View>

          <View
            style={{
              position: "absolute",
              top: size * 0.31,
              left: size * 0.08,
              width: size * 0.08,
              height: size * 0.045,
              borderRadius: size * 0.0225,
              backgroundColor: "#FFB5B5",
              opacity: 0.7,
            }}
          />
          <View
            style={{
              position: "absolute",
              top: size * 0.31,
              right: size * 0.08,
              width: size * 0.08,
              height: size * 0.045,
              borderRadius: size * 0.0225,
              backgroundColor: "#FFB5B5",
              opacity: 0.7,
            }}
          />

          <View
            style={{
              alignSelf: "center",
              marginTop: size * 0.05,
              width: mood === "excited" ? size * 0.14 : size * 0.1,
              height: mood === "excited" ? size * 0.1 : size * 0.06,
              borderBottomLeftRadius: size * 0.07,
              borderBottomRightRadius: size * 0.07,
              backgroundColor: "#2D2422",
              overflow: "hidden",
            }}
          >
            <View
              style={{
                position: "absolute",
                bottom: 0,
                left: "25%",
                right: "25%",
                height: "45%",
                borderTopLeftRadius: size * 0.025,
                borderTopRightRadius: size * 0.025,
                backgroundColor: "#FF6B8A",
              }}
            />
          </View>
        </View>

        {/* Window */}
        <View
          style={{
            position: "absolute",
            top: -size * 0.05,
            alignSelf: "center",
            width: size * 0.2,
            height: size * 0.2,
            borderRadius: size * 0.1,
            backgroundColor: PAL.secondary,
            borderWidth: 2.5,
            borderColor: PAL.secondaryDark,
          }}
        >
          <View
            style={{
              position: "absolute",
              top: size * 0.02,
              left: size * 0.035,
              width: size * 0.05,
              height: size * 0.05,
              borderRadius: size * 0.025,
              backgroundColor: "rgba(255,255,255,0.6)",
            }}
          />
        </View>
      </View>

      {/* Prop */}
      {prop && (
        <Animated.View
          style={[
            propAnim,
            {
              position: "absolute",
              bottom: size * 0.02,
              right: -size * 0.05,
              width: size * 0.38,
              height: size * 0.38,
              borderRadius: size * 0.19,
              backgroundColor: "#FFFFFF",
              borderWidth: 3,
              borderColor: PAL.primaryDark,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: PAL.primaryDark,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6,
            },
          ]}
        >
          <Text style={{ fontSize: size * 0.2 }}>{prop}</Text>
        </Animated.View>
      )}
    </Animated.View>
  );
}

// ============================================================
// SPEECH BUBBLE
// ============================================================
function SpeechBubble({
  children,
  isReacting = false,
}: {
  children: React.ReactNode;
  isReacting?: boolean;
}) {
  const scale = useSharedValue(1);
  useEffect(() => {
    scale.value = withSequence(
      withTiming(0.95, { duration: 80 }),
      withSpring(1, { damping: 10, stiffness: 400 })
    );
  }, [children]);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View
      style={[
        {
          alignItems: "center",
          alignSelf: "center",
          maxWidth: "90%",
        },
        anim,
      ]}
    >
      <View
        style={{
          backgroundColor: isReacting ? "#FFF9E5" : PAL.bubble,
          borderRadius: 20,
          borderWidth: 2.5,
          borderColor: isReacting ? PAL.accentDark : PAL.bubbleBorder,
          paddingHorizontal: 18,
          paddingVertical: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.12,
          shadowRadius: 10,
          elevation: 4,
        }}
      >
        {children}
      </View>
      <View
        style={{
          width: 0,
          height: 0,
          borderLeftWidth: 9,
          borderRightWidth: 9,
          borderTopWidth: 11,
          borderLeftColor: "transparent",
          borderRightColor: "transparent",
          borderTopColor: isReacting ? PAL.accentDark : PAL.bubbleBorder,
          marginTop: -2,
        }}
      />
      <View
        style={{
          width: 0,
          height: 0,
          borderLeftWidth: 7,
          borderRightWidth: 7,
          borderTopWidth: 9,
          borderLeftColor: "transparent",
          borderRightColor: "transparent",
          borderTopColor: isReacting ? "#FFF9E5" : PAL.bubble,
          position: "absolute",
          bottom: 0,
        }}
      />
    </Animated.View>
  );
}

// ============================================================
// TRAIL SUBJECT — circular medallion on the winding path
// ============================================================
function TrailSubject({
  item,
  index,
  isActive,
  onPress,
  onHoverChar,
}: {
  item: (typeof SUBJECTS)[0];
  index: number;
  isActive: boolean;
  onPress: () => void;
  onHoverChar: (reaction: string) => void;
}) {
  const { t } = useTranslation();
  const scale = useSharedValue(1);
  const wiggle = useSharedValue(0);
  const glow = useSharedValue(0);
  const float = useSharedValue(0);

  // Gentle float for each medallion
  useEffect(() => {
    float.value = withDelay(
      index * 200,
      withRepeat(
        withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      )
    );
  }, []);

  useEffect(() => {
    glow.value = withSpring(isActive ? 1 : 0, { damping: 15, stiffness: 250 });
  }, [isActive]);

  const anim = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${wiggle.value}deg` },
      { translateY: interpolate(float.value, [0, 1], [0, -4]) },
    ],
  }));

  const glowAnim = useAnimatedStyle(() => ({
    opacity: interpolate(glow.value, [0, 1], [0, 0.6]),
    transform: [{ scale: interpolate(glow.value, [0, 1], [0.9, 1.15]) }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.92, { damping: 15, stiffness: 400 });
    wiggle.value = withSpring(-3, { damping: 10, stiffness: 300 });
    onHoverChar(item.reaction);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 300 });
    wiggle.value = withSpring(0, { damping: 12, stiffness: 300 });
  };

  const medallionSize = isTablet ? 100 : 80;
  const isLeft = item.side === "left";

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
      style={{
        alignSelf: isLeft ? "flex-start" : "flex-end",
        marginLeft: isLeft ? (isTablet ? 40 : 20) : 0,
        marginRight: isLeft ? 0 : isTablet ? 40 : 20,
        marginBottom: 20,
      }}
    >
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onPress();
        }}
      >
        <Animated.View style={[anim, { alignItems: "center" }]}>
          {/* Glow ring when active */}
          <Animated.View
            pointerEvents="none"
            style={[
              {
                position: "absolute",
                width: medallionSize + 30,
                height: medallionSize + 30,
                borderRadius: (medallionSize + 30) / 2,
                backgroundColor: item.color,
                top: -15,
                left: -15,
              },
              glowAnim,
            ]}
          />

          {/* Medallion */}
          <View
            style={{
              width: medallionSize,
              height: medallionSize,
              borderRadius: medallionSize / 2,
              backgroundColor: item.color,
              borderWidth: 4,
              borderColor: "#FFFFFF",
              alignItems: "center",
              justifyContent: "center",
              shadowColor: item.darkColor,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.4,
              shadowRadius: 12,
              elevation: 10,
            }}
          >
            {/* Inner ring */}
            <View
              style={{
                position: "absolute",
                top: 6,
                left: 6,
                right: 6,
                bottom: 6,
                borderRadius: (medallionSize - 12) / 2,
                borderWidth: 2,
                borderColor: "rgba(255,255,255,0.5)",
                borderStyle: "dashed",
              }}
            />
            <Text style={{ fontSize: isTablet ? 44 : 36 }}>{item.emoji}</Text>
          </View>

          {/* Label below medallion */}
          <View
            style={{
              marginTop: 10,
              paddingHorizontal: 12,
              paddingVertical: 4,
              backgroundColor: "#FFFFFF",
              borderRadius: 999,
              borderWidth: 2,
              borderColor: item.color,
              shadowColor: item.darkColor,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Text
              style={{
                fontFamily: FONT.extrabold,
                fontSize: isTablet ? 14 : 12,
                color: item.darkColor,
                letterSpacing: 0.3,
              }}
            >
              {t(item.nameKey)}
            </Text>
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

// ============================================================
// WINDING TRAIL PATH — dotted connector between medallions
// ============================================================
function TrailPath({
  count,
  spacing,
}: {
  count: number;
  spacing: number;
}) {
  // Build a dot pattern connecting the medallions
  const dots = [];
  const dotsPerSegment = 8;
  for (let i = 0; i < count - 1; i++) {
    const startIsLeft = i % 2 === 0;
    for (let d = 1; d < dotsPerSegment; d++) {
      const t = d / dotsPerSegment;
      // curve between left and right positions
      const xPercent = startIsLeft
        ? 25 + t * 50 // goes from 25% (left) to 75% (right)
        : 75 - t * 50; // goes from 75% (right) to 25% (left)
      dots.push({
        key: `${i}-${d}`,
        top: i * spacing + (d / dotsPerSegment) * spacing,
        left: xPercent,
      });
    }
  }
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {dots.map((dot) => (
        <View
          key={dot.key}
          style={{
            position: "absolute",
            top: dot.top,
            left: `${dot.left}%`,
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: PAL.path,
            opacity: 0.7,
          }}
        />
      ))}
    </View>
  );
}

import { StyleSheet } from "react-native";

// ============================================================
// MAIN SCREEN
// ============================================================
export default function SubjectSelection() {
  const router = useRouter();
  const { t } = useTranslation();
  const { level } = useLocalSearchParams<{ level: string }>();

  const [mood, setMood] = useState<Mood>("idle");
  const [message, setMessage] = useState<string>(t("subjects.subtitle"));
  const [activeSubject, setActiveSubject] = useState<(typeof SUBJECTS)[0] | null>(null);
  const resetTimer = useRef<any>(null);

  const triggerReaction = (subject: (typeof SUBJECTS)[0]) => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
    setActiveSubject(subject);
    setMood("excited");
    setMessage(subject.reaction);
    resetTimer.current = setTimeout(() => {
      setMood("idle");
      setMessage(t("subjects.subtitle"));
      setActiveSubject(null);
    }, 2400);
  };

  const handlePipTap = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (resetTimer.current) clearTimeout(resetTimer.current);
    setMood("excited");
    setMessage("Pick a subject to start! 🎉");
    resetTimer.current = setTimeout(() => {
      setMood("idle");
      setMessage(t("subjects.subtitle"));
      setActiveSubject(null);
    }, 2200);
  };

  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  const flameTop = activeSubject?.flameTop ?? PAL.accent;
  const flameBottom = activeSubject?.flameBottom ?? "#FFB84D";

  // Trail spacing — each medallion's vertical slot
  const TRAIL_SPACING = isTablet ? 180 : 160;

  return (
    <View style={{ flex: 1, backgroundColor: PAL.bg }}>
      {/* ==== Sky background ==== */}
      <LinearGradient
        colors={[PAL.bgTop, PAL.bgMid, PAL.bg, PAL.bgBottom]}
        locations={[0, 0.35, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* ==== Clouds ==== */}
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity: 0.55 }]}>
        <View
          style={{
            position: "absolute",
            top: 60,
            left: -30,
            width: 90,
            height: 50,
            borderRadius: 25,
            backgroundColor: "#FFFFFF",
          }}
        />
        <View
          style={{
            position: "absolute",
            top: 90,
            right: -20,
            width: 80,
            height: 45,
            borderRadius: 22,
            backgroundColor: "#FFFFFF",
          }}
        />
        <View
          style={{
            position: "absolute",
            bottom: 120,
            left: -20,
            width: 100,
            height: 55,
            borderRadius: 28,
            backgroundColor: "#FFFFFF",
          }}
        />
      </View>

      <SafeAreaView style={{ flex: 1 }}>
        <View
          style={{
            flex: 1,
            paddingHorizontal: isTablet ? 48 : 24,
            maxWidth: isTablet ? 900 : undefined,
            alignSelf: "center",
            width: "100%",
          }}
        >
          {/* ==== TOP BAR ==== */}
          <View
            style={{
              marginTop: 12,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Pressable
              onPress={() => {
                Haptics.selectionAsync();
                router.back();
              }}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: PAL.primary,
                borderWidth: 2.5,
                borderColor: PAL.primaryDark,
                alignItems: "center",
                justifyContent: "center",
                shadowColor: PAL.primaryDark,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 6,
                elevation: 4,
              }}
            >
              <Text style={{ color: "#FFFFFF", fontSize: 18, fontWeight: "900" }}>←</Text>
            </Pressable>

            <View
              style={{
                paddingHorizontal: 14,
                paddingVertical: 6,
                backgroundColor: "rgba(255,255,255,0.7)",
                borderRadius: 999,
                borderWidth: 2,
                borderColor: PAL.bubbleBorder,
              }}
            >
              <Text
                style={{
                  fontFamily: FONT.extrabold,
                  fontSize: 11,
                  letterSpacing: 1.5,
                  color: PAL.textMuted,
                }}
              >
                {GRADE_LABELS[level ?? "kg"] ?? "Grade"}
              </Text>
            </View>
          </View>

          {/* ==== PIP HERO — small header version, floats above speech ==== */}
          <View style={{ alignItems: "center", marginTop: 4 }}>
            <Pressable onPress={handlePipTap}>
              <Pip
                mood={mood}
                size={isTablet ? 110 : 90}
                prop={activeSubject?.prop}
                flameTop={flameTop}
                flameBottom={flameBottom}
              />
            </Pressable>
          </View>

          {/* ==== SPEECH BUBBLE ==== */}
          <View style={{ alignItems: "center", marginTop: 4, marginBottom: 8 }}>
            <SpeechBubble isReacting={!!activeSubject}>
              <Text
                style={{
                  fontFamily: FONT.extrabold,
                  fontSize: 13,
                  color: PAL.text,
                  textAlign: "center",
                  lineHeight: 18,
                }}
              >
                {message}
              </Text>
            </SpeechBubble>
          </View>

          {/* ==== TRAIL ZONE — scrollable winding path of medallions ==== */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              paddingTop: 20,
              paddingBottom: 40,
              position: "relative",
            }}
            showsVerticalScrollIndicator={false}
          >
            {/* Dotted path behind medallions */}
            <TrailPath count={SUBJECTS.length} spacing={TRAIL_SPACING} />

            {SUBJECTS.map((item, i) => (
              <View key={item.id} style={{ height: TRAIL_SPACING }}>
                <TrailSubject
                  item={item}
                  index={i}
                  isActive={activeSubject?.id === item.id}
                  onHoverChar={() => triggerReaction(item)}
                  onPress={() =>
                    router.push(`/(student)/subject/${level}/${item.id}`)
                  }
                />
              </View>
            ))}

            {/* End-of-trail marker */}
            <View style={{ alignItems: "center", paddingTop: 10 }}>
              <View
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  backgroundColor: "#FFFFFF",
                  borderRadius: 999,
                  borderWidth: 2.5,
                  borderColor: PAL.path,
                  borderStyle: "dashed",
                }}
              >
                <Text
                  style={{
                    fontFamily: FONT.extrabold,
                    fontSize: 12,
                    color: PAL.textMuted,
                    letterSpacing: 1,
                  }}
                >
                  🏁  Keep exploring, {GRADE_LABELS[level ?? "kg"] ?? "learner"}!
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
}