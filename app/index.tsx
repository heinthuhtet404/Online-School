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
  withDelay,
  withSequence,
  Easing,
  FadeInDown,
  FadeIn,
} from "react-native-reanimated";
import { useEffect, useState } from "react";
import { FONT } from "@/lib/design";

const { width, height } = Dimensions.get("window");
const isTablet = width >= 768;

// ============================================================
// HAND-DRAWN PALETTE — crayon, ink, kraft paper
// ============================================================
const DOODLE = {
  // Paper
  paper: "#FAF4E8",       // warm cream
  paperLine: "#E8DFCC",   // lined paper lines
  paperMargin: "#F4C6C6", // red margin line
  paperShadow: "#E5D9C0", // shading

  // Ink colors (marker/crayon)
  ink: "#2B2B2B",         // soft black ink
  inkMuted: "#6B5F52",    // brownish ink
  red: "#E8564A",         // crayon red
  orange: "#F29F4A",      // crayon orange
  yellow: "#F5C842",      // crayon yellow
  green: "#5BA85A",       // crayon green
  teal: "#4A9BA5",        // crayon teal
  blue: "#4A78B5",        // crayon blue
  purple: "#8B6BA8",      // crayon purple
  pink: "#E88BA8",        // crayon pink

  // Eraser / highlight
  highlight: "#FFF3A0",   // yellow highlighter
  white: "#FFFFFF",
};

// ============================================================
// HAND-DRAWN SURFACE — wobbly paper card
// ============================================================
function DoodleCard({
  children,
  style,
  rotation = -1.2,
  borderColor = DOODLE.ink,
  bg = DOODLE.white,
  sketchy = true,
}: {
  children: React.ReactNode;
  style?: any;
  rotation?: number;
  borderColor?: string;
  bg?: string;
  sketchy?: boolean;
}) {
  return (
    <View
      style={[
        {
          transform: [{ rotate: `${rotation}deg` }],
          // rough "marker shadow" — hard offset shadow, not soft
          shadowColor: DOODLE.inkMuted,
          shadowOffset: { width: 4, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 0,
          elevation: 2,
        },
        style,
      ]}
    >
      <View
        style={{
          backgroundColor: bg,
          borderRadius: 6,
          borderWidth: 2.5,
          borderColor,
          padding: 12,
          // Sketchy double-edge fake — an offset lighter border
          // that makes the border look drawn twice
          ...(sketchy
            ? {
                borderTopRightRadius: 12,
                borderBottomLeftRadius: 10,
                borderBottomRightRadius: 14,
                borderTopLeftRadius: 8,
              }
            : {}),
        }}
      >
        {/* Second offset border stroke, offset by 1px — fakes sketchiness */}
        {sketchy && (
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: -2,
              left: -2,
              right: 1,
              bottom: 1,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: borderColor + "55",
            }}
          />
        )}
        {children}
      </View>
    </View>
  );
}

// ============================================================
// SKETCHY BUTTON
// ============================================================
function DoodleButton({
  label,
  icon,
  onPress,
  color = DOODLE.blue,
  textColor = DOODLE.ink,
  rotation = 0.8,
  style,
  size = "md",
}: {
  label: string;
  icon?: string;
  onPress: () => void;
  color?: string;
  textColor?: string;
  rotation?: number;
  style?: any;
  size?: "md" | "lg";
}) {
  const [pressed, setPressed] = useState(false);
  const isLg = size === "lg";

  return (
    <View
      style={[
        {
          transform: [
            { rotate: `${rotation}deg` },
            { translateY: pressed ? 3 : 0 },
            { scale: pressed ? 0.98 : 1 },
          ],
          // Hard offset shadow — like a marker shadow
          shadowColor: DOODLE.inkMuted,
          shadowOffset: { width: pressed ? 1 : 4, height: pressed ? 1 : 4 },
          shadowOpacity: 0.35,
          shadowRadius: 0,
          elevation: pressed ? 1 : 4,
        },
        style,
      ]}
    >
      <Pressable
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onPress();
        }}
      >
        <View
          style={{
            backgroundColor: color,
            borderRadius: 8,
            borderWidth: 2.5,
            borderColor: DOODLE.ink,
            paddingVertical: isLg ? 18 : 14,
            paddingHorizontal: 24,
            alignItems: "center",
            justifyContent: "center",
            // slightly asymmetrical — hand-drawn imperfection
            borderTopLeftRadius: 10,
            borderTopRightRadius: 6,
            borderBottomLeftRadius: 8,
            borderBottomRightRadius: 12,
          }}
        >
          {/* Slight inner highlight — the "fill" marker stroke */}
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: 2,
              left: 4,
              right: 8,
              height: 3,
              borderRadius: 2,
              backgroundColor: "rgba(255,255,255,0.35)",
            }}
          />
          <Text
            style={{
              fontFamily: FONT.extrabold,
              fontSize: isLg ? 18 : 16,
              color: textColor,
              letterSpacing: 0.2,
            }}
          >
            {icon ? `${icon}  ` : ""}
            {label}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

// ============================================================
// STICKY NOTE
// ============================================================
function StickyNote({
  children,
  color = DOODLE.highlight,
  rotation = -2.5,
  style,
}: {
  children: React.ReactNode;
  color?: string;
  rotation?: number;
  style?: any;
}) {
  return (
    <View
      style={[
        {
          transform: [{ rotate: `${rotation}deg` }],
          shadowColor: DOODLE.inkMuted,
          shadowOffset: { width: 3, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 2,
          elevation: 3,
        },
        style,
      ]}
    >
      <View
        style={{
          backgroundColor: color,
          paddingHorizontal: 14,
          paddingVertical: 10,
          // slightly asymmetric corners (sticky note look)
          borderTopLeftRadius: 2,
          borderTopRightRadius: 2,
          borderBottomLeftRadius: 4,
          borderBottomRightRadius: 14,
        }}
      >
        {children}
      </View>
    </View>
  );
}

// ============================================================
// PAPER LINES BACKGROUND
// ============================================================
function NotebookBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={{ flex: 1, backgroundColor: DOODLE.paper }}>
        {/* Horizontal ruled lines */}
        {Array.from({ length: Math.ceil(height / 32) }).map((_, i) => (
          <View
            key={`h-${i}`}
            style={{
              position: "absolute",
              top: i * 32,
              left: 0,
              right: 0,
              height: 1,
              backgroundColor: DOODLE.paperLine,
              opacity: 0.8,
            }}
          />
        ))}
        {/* Red margin line */}
        <View
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 40,
            width: 1.5,
            backgroundColor: DOODLE.paperMargin,
            opacity: 0.7,
          }}
        />
        {/* Left margin shading */}
        <View
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            width: 40,
            backgroundColor: "rgba(255,255,255,0.3)",
          }}
        />
        {/* Paper edge highlight at top */}
        <LinearGradient
          colors={["rgba(0,0,0,0.04)", "rgba(0,0,0,0)"]}
          style={{ position: "absolute", top: 0, left: 0, right: 0, height: 40 }}
        />
      </View>
    </View>
  );
}

// ============================================================
// DOODLE CHARACTER — hand-drawn rocket
// ============================================================
function DoodleRocket({
  size = 140,
  bobbing = true,
}: {
  size?: number;
  bobbing?: boolean;
}) {
  const bob = useSharedValue(0);
  const wobble = useSharedValue(0);

  useEffect(() => {
    if (bobbing) {
      bob.value = withRepeat(
        withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
      wobble.value = withRepeat(
        withTiming(1, { duration: 3400, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    }
  }, []);

  const anim = useAnimatedStyle(() => ({
    transform: [
      { translateY: bob.value * -8 },
      { rotate: `${wobble.value * 4 - 2}deg` },
    ],
  }));

  return (
    <Animated.View style={[anim, { width: size, height: size * 1.2 }]}>
      {/* Rocket body — hand-drawn, wobbly */}
      <View
        style={{
          position: "absolute",
          bottom: size * 0.15,
          left: size * 0.15,
          width: size * 0.7,
          height: size * 0.85,
          backgroundColor: DOODLE.white,
          borderWidth: 2.5,
          borderColor: DOODLE.ink,
          // wobbly asymmetric corners
          borderTopLeftRadius: size * 0.35,
          borderTopRightRadius: size * 0.3,
          borderBottomLeftRadius: size * 0.15,
          borderBottomRightRadius: size * 0.18,
          // sketchy double line
          transform: [{ rotate: "-2deg" }],
        }}
      >
        {/* Window */}
        <View
          style={{
            position: "absolute",
            top: size * 0.12,
            alignSelf: "center",
            width: size * 0.25,
            height: size * 0.25,
            borderRadius: size * 0.13,
            backgroundColor: DOODLE.blue,
            borderWidth: 2.5,
            borderColor: DOODLE.ink,
          }}
        >
          {/* Window shine */}
          <View
            style={{
              position: "absolute",
              top: 3,
              left: 4,
              width: size * 0.06,
              height: size * 0.05,
              borderRadius: size * 0.03,
              backgroundColor: "rgba(255,255,255,0.7)",
            }}
          />
        </View>

        {/* Face */}
        <View
          style={{
            position: "absolute",
            top: size * 0.45,
            left: size * 0.1,
            right: size * 0.1,
            alignItems: "center",
          }}
        >
          {/* Eyes */}
          <View style={{ flexDirection: "row", gap: size * 0.12 }}>
            <View
              style={{
                width: size * 0.06,
                height: size * 0.09,
                backgroundColor: DOODLE.ink,
                borderRadius: size * 0.03,
              }}
            />
            <View
              style={{
                width: size * 0.06,
                height: size * 0.09,
                backgroundColor: DOODLE.ink,
                borderRadius: size * 0.03,
              }}
            />
          </View>
          {/* Smile */}
          <View
            style={{
              marginTop: size * 0.04,
              width: size * 0.18,
              height: size * 0.08,
              borderBottomWidth: 2.5,
              borderLeftWidth: 2.5,
              borderRightWidth: 2.5,
              borderColor: DOODLE.ink,
              borderBottomLeftRadius: size * 0.09,
              borderBottomRightRadius: size * 0.09,
            }}
          />
        </View>
      </View>

      {/* Left fin */}
      <View
        style={{
          position: "absolute",
          bottom: size * 0.2,
          left: size * 0.04,
          width: size * 0.18,
          height: size * 0.28,
          backgroundColor: DOODLE.red,
          borderWidth: 2.5,
          borderColor: DOODLE.ink,
          borderTopLeftRadius: size * 0.1,
          borderBottomLeftRadius: size * 0.15,
          transform: [{ rotate: "-8deg" }],
        }}
      />
      {/* Right fin */}
      <View
        style={{
          position: "absolute",
          bottom: size * 0.2,
          right: size * 0.04,
          width: size * 0.18,
          height: size * 0.28,
          backgroundColor: DOODLE.red,
          borderWidth: 2.5,
          borderColor: DOODLE.ink,
          borderTopRightRadius: size * 0.1,
          borderBottomRightRadius: size * 0.15,
          transform: [{ rotate: "8deg" }],
        }}
      />

      {/* Flames — simple wobbly shapes */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: size * 0.35,
          width: size * 0.3,
          height: size * 0.22,
          backgroundColor: DOODLE.orange,
          borderWidth: 2.5,
          borderColor: DOODLE.ink,
          borderTopLeftRadius: size * 0.15,
          borderTopRightRadius: size * 0.15,
          borderBottomLeftRadius: size * 0.08,
          borderBottomRightRadius: size * 0.08,
        }}
      >
        <View
          style={{
            position: "absolute",
            bottom: size * 0.02,
            left: size * 0.06,
            width: size * 0.18,
            height: size * 0.12,
            backgroundColor: DOODLE.yellow,
            borderRadius: size * 0.09,
          }}
        />
      </View>
    </Animated.View>
  );
}

// ============================================================
// DOODLE STAR — decorative hand-drawn star
// ============================================================
function DoodleStar({
  size = 20,
  color = DOODLE.yellow,
  rotation = 0,
  style,
}: {
  size?: number;
  color?: string;
  rotation?: number;
  style?: any;
}) {
  return (
    <View style={[{ transform: [{ rotate: `${rotation}deg` }] }, style]}>
      <Text
        style={{
          fontSize: size,
          color,
          textShadowColor: DOODLE.ink,
          textShadowOffset: { width: 0.8, height: 0.8 },
          textShadowRadius: 0,
        }}
      >
        ✦
      </Text>
    </View>
  );
}

// ============================================================
// ARROW — hand-drawn arrow (a decorative pointing doodle)
// ============================================================
function DoodleArrow({
  style,
  rotation = 0,
}: {
  style?: any;
  rotation?: number;
}) {
  return (
    <View
      style={[
        { transform: [{ rotate: `${rotation}deg` }], flexDirection: "row" },
        style,
      ]}
    >
      <View
        style={{
          width: 30,
          height: 2.5,
          backgroundColor: DOODLE.ink,
          marginTop: 6,
          transform: [{ rotate: "-3deg" }],
        }}
      />
      <View
        style={{
          width: 10,
          height: 10,
          borderTopWidth: 2.5,
          borderRightWidth: 2.5,
          borderColor: DOODLE.ink,
          transform: [{ rotate: "45deg" }],
          marginLeft: -6,
        }}
      />
    </View>
  );
}

// ============================================================
// MAIN SCREEN
// ============================================================
export default function Welcome() {
  const router = useRouter();
  const { t } = useTranslation();
  const { lang, setLang } = useLang();
  const { setMode } = useMode();
  const [boop, setBoop] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: DOODLE.paper }}>
      <NotebookBackground />

      <SafeAreaView style={{ flex: 1 }}>
        <View
          style={{
            flex: 1,
            paddingHorizontal: isTablet ? 48 : 24,
            maxWidth: isTablet ? 720 : undefined,
            alignSelf: "center",
            width: "100%",
            paddingTop: 16,
          }}
        >
          {/* ==== TOP BAR — doodle logo + language sticky ==== */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              {/* Circle doodle logo */}
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: DOODLE.yellow,
                  borderWidth: 2.5,
                  borderColor: DOODLE.ink,
                  alignItems: "center",
                  justifyContent: "center",
                  transform: [{ rotate: "-6deg" }],
                  shadowColor: DOODLE.inkMuted,
                  shadowOffset: { width: 3, height: 3 },
                  shadowOpacity: 0.3,
                  shadowRadius: 0,
                  elevation: 2,
                }}
              >
                <Text style={{ fontSize: 20 }}>✏️</Text>
              </View>
              <Text
                style={{
                  fontFamily: FONT.extrabold,
                  fontSize: 13,
                  color: DOODLE.ink,
                  letterSpacing: 1,
                  transform: [{ rotate: "-1deg" }],
                }}
              >
                ONLINE SCHOOL
              </Text>
            </View>

            {/* Language toggle — sticky note style */}
            <View
              style={{
                flexDirection: "row",
                backgroundColor: DOODLE.white,
                borderWidth: 2.5,
                borderColor: DOODLE.ink,
                borderRadius: 8,
                padding: 3,
                transform: [{ rotate: "1.5deg" }],
                shadowColor: DOODLE.inkMuted,
                shadowOffset: { width: 3, height: 3 },
                shadowOpacity: 0.25,
                shadowRadius: 0,
                elevation: 2,
              }}
            >
              {(["my", "en"] as const).map((l) => {
                const active = lang === l;
                return (
                  <Pressable
                    key={l}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setLang(l);
                    }}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 5,
                      borderRadius: 5,
                      backgroundColor: active ? DOODLE.highlight : "transparent",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: FONT.extrabold,
                        fontSize: 12,
                        color: active ? DOODLE.ink : DOODLE.inkMuted,
                      }}
                    >
                      {l.toUpperCase()}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* ==== HERO HEADLINE — handwritten feel ==== */}
          <Animated.View
            entering={FadeInDown.delay(100).springify()}
            style={{ marginBottom: 12 }}
          >
            <View style={{ transform: [{ rotate: "-1deg" }] }}>
              <Text
                style={{
                  fontFamily: FONT.extrabold,
                  fontSize: isTablet ? 52 : 36,
                  lineHeight: isTablet ? 58 : 44,
                  color: DOODLE.ink,
                  letterSpacing: -0.5,
                }}
              >
                {t("welcome.hello")}
              </Text>
            </View>
            <View style={{ transform: [{ rotate: "0.8deg" }], marginTop: 2 }}>
              <Text
                style={{
                  fontFamily: FONT.extrabold,
                  fontSize: isTablet ? 52 : 36,
                  lineHeight: isTablet ? 58 : 44,
                  color: DOODLE.red,
                  letterSpacing: -0.5,
                }}
              >
                {t("welcome.little")}
              </Text>
              {/* Hand-drawn underline */}
              <View
                style={{
                  height: 3,
                  backgroundColor: DOODLE.red,
                  marginTop: 2,
                  width: "70%",
                  borderRadius: 2,
                  transform: [{ rotate: "-0.5deg" }],
                }}
              />
            </View>
            <View style={{ transform: [{ rotate: "-1.2deg" }], marginTop: 2 }}>
              <Text
                style={{
                  fontFamily: FONT.extrabold,
                  fontSize: isTablet ? 52 : 36,
                  lineHeight: isTablet ? 58 : 44,
                  color: DOODLE.purple,
                  letterSpacing: -0.5,
                }}
              >
                {t("welcome.explorers")}
              </Text>
            </View>
          </Animated.View>

          {/* ==== CHARACTER + SPEECH ==== */}
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              minHeight: isTablet ? 280 : 230,
              marginTop: 8,
            }}
          >
            {/* Speech bubble — hand-drawn irregular shape */}
            <Animated.View entering={FadeIn.delay(300)}>
              <View style={{ transform: [{ rotate: "-1.5deg" }], marginBottom: 12 }}>
                <View
                  style={{
                    backgroundColor: DOODLE.white,
                    borderWidth: 2.5,
                    borderColor: DOODLE.ink,
                    borderRadius: 20,
                    paddingHorizontal: 18,
                    paddingVertical: 12,
                    maxWidth: 260,
                    // asymmetric to feel hand-drawn
                    borderTopLeftRadius: 24,
                    borderTopRightRadius: 18,
                    borderBottomLeftRadius: 22,
                    borderBottomRightRadius: 16,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: FONT.semibold,
                      fontSize: 14,
                      color: DOODLE.ink,
                      lineHeight: 20,
                      textAlign: "center",
                    }}
                  >
                    {t("welcome.tagline")}
                  </Text>
                </View>
                {/* Tail */}
                <View
                  style={{
                    position: "absolute",
                    bottom: -10,
                    left: 30,
                    width: 0,
                    height: 0,
                    borderLeftWidth: 8,
                    borderRightWidth: 8,
                    borderTopWidth: 12,
                    borderLeftColor: "transparent",
                    borderRightColor: "transparent",
                    borderTopColor: DOODLE.ink,
                    transform: [{ rotate: "-10deg" }],
                  }}
                />
                <View
                  style={{
                    position: "absolute",
                    bottom: -6,
                    left: 31,
                    width: 0,
                    height: 0,
                    borderLeftWidth: 7,
                    borderRightWidth: 7,
                    borderTopWidth: 10,
                    borderLeftColor: "transparent",
                    borderRightColor: "transparent",
                    borderTopColor: DOODLE.white,
                    transform: [{ rotate: "-10deg" }],
                  }}
                />
              </View>
            </Animated.View>

            {/* Rocket — pressable, wobbles on tap */}
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setBoop(!boop);
              }}
            >
              <DoodleRocket size={isTablet ? 160 : 130} />
            </Pressable>
          </View>

          {/* ==== BUTTONS — each with unique doodle rotation ==== */}
          <Animated.View
            entering={FadeInDown.delay(400).springify()}
            style={{ marginTop: 12 }}
          >
            <DoodleButton
              label={t("welcome.playGuest")}
              icon="🚀"
              color={DOODLE.yellow}
              textColor={DOODLE.ink}
              rotation={1.2}
              size="lg"
              onPress={() => router.push("/(student)/grades")}
              style={{ marginBottom: 14 }}
            />
            <DoodleButton
              label={t("welcome.login")}
              icon="🔑"
              color={DOODLE.teal}
              textColor={DOODLE.white}
              rotation={-1}
              onPress={() => router.push("/(auth)/login")}
              style={{ marginBottom: 14 }}
            />
            <DoodleButton
              label={t("welcome.teacher")}
              icon="👩‍🏫"
              color={DOODLE.pink}
              textColor={DOODLE.ink}
              rotation={0.7}
              onPress={() => {
                setMode("teacher");
                router.push("/(teacher)/dashboard");
              }}
            />
          </Animated.View>

          {/* ==== Footer — sticky note ==== */}
          <View
            style={{
              alignItems: "center",
              marginTop: 16,
              marginBottom: 8,
            }}
          >
            <StickyNote rotation={-1.5}>
              <Text
                style={{
                  fontFamily: FONT.semibold,
                  fontSize: 11,
                  color: DOODLE.ink,
                }}
              >
                {t("welcome.help")}  ·  v1.0.0
              </Text>
            </StickyNote>
          </View>

          {/* ==== Decorative doodles ==== */}
          <DoodleStar
            size={16}
            color={DOODLE.yellow}
            rotation={15}
            style={{ position: "absolute", top: 100, right: 40 }}
          />
          <DoodleStar
            size={12}
            color={DOODLE.pink}
            rotation={-20}
            style={{ position: "absolute", top: 220, left: 20 }}
          />
          <DoodleStar
            size={10}
            color={DOODLE.teal}
            rotation={40}
            style={{ position: "absolute", top: 340, right: 60 }}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}