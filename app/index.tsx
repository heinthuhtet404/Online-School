import { View, Text, Dimensions, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useLang } from "@/lib/language-context";
import { useMode } from "@/lib/mode-context";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  withSpring,
  Easing,
  FadeInDown,
} from "react-native-reanimated";
import { useEffect, useState } from "react";
import { FONT } from "@/lib/design";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

// ---------- Clay palette (soft pastels, desaturated) ----------
const CLAY = {
  bg: "#F4EEE8",           // warm cream base
  surface: "#FBF6F0",      // lighter cream (elements)
  surfaceAlt: "#EFE7DF",   // slightly deeper cream
  text: "#4A4038",         // warm dark brown (not black!)
  textMuted: "#8B7E72",    // warm muted
  pink: "#F4A6C0",         // soft rose
  pinkDark: "#E88AA8",     // rose shadow
  mint: "#9DD9C5",         // soft mint
  mintDark: "#7EC4AE",     // mint shadow
  yellow: "#F7D794",       // soft butter
  yellowDark: "#EBC572",
  lavender: "#B8A9E0",     // soft lavender
  lavenderDark: "#9C8BC9",
  sky: "#9EC5E8",          // soft sky
  skyDark: "#7EABD4",
};

const CLAY_R = {
  sm: 16,
  md: 24,
  lg: 32,
  xl: 40,
  pill: 999,
};

// ---------- The clay surface ----------
// Fakes the classic 3-shadow clay look:
//   outer drop (bottom-right) + inner top highlight + inner bottom shade
function ClaySurface({
  children,
  style,
  radius = CLAY_R.lg,
  color = CLAY.surface,
  pressed = false,
}: {
  children: React.ReactNode;
  style?: any;
  radius?: number;
  color?: string;
  pressed?: boolean;
}) {
  return (
    <View
      style={[
        {
          borderRadius: radius,
          backgroundColor: color,
          // ---- OUTER DROP SHADOW (offset down-right) ----
          shadowColor: "#B8A99A",
          shadowOffset: { width: 0, height: pressed ? 2 : 10 },
          shadowOpacity: pressed ? 0.25 : 0.45,
          shadowRadius: pressed ? 6 : 18,
          elevation: pressed ? 2 : 10,
        },
        style,
      ]}
    >
      {/* ---- INNER TOP HIGHLIGHT (light inset) ---- */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: radius,
          borderTopWidth: 2,
          borderLeftWidth: 1.5,
          borderRightWidth: 0.5,
          borderTopColor: "rgba(255,255,255,0.95)",
          borderLeftColor: "rgba(255,255,255,0.7)",
          borderRightColor: "rgba(255,255,255,0.3)",
        }}
      />
      {/* ---- INNER BOTTOM SHADE (dark inset) ---- */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: radius,
          borderBottomWidth: 2,
          borderRightWidth: 1.5,
          borderBottomColor: shadeOf(color, 0.85),
          borderRightColor: shadeOf(color, 0.9),
        }}
      />
      {children}
    </View>
  );
}

// Utility: darken a hex color
function shadeOf(hex: string, factor: number): string {
  const h = hex.replace("#", "");
  const r = Math.round(parseInt(h.substring(0, 2), 16) * factor);
  const g = Math.round(parseInt(h.substring(2, 4), 16) * factor);
  const b = Math.round(parseInt(h.substring(4, 6), 16) * factor);
  return `rgb(${r},${g},${b})`;
}

// ---------- Clay blob ----------
function ClayBlob({
  size,
  color,
  style,
  delay = 0,
  amount = -10,
}: {
  size: number;
  color: string;
  style?: any;
  delay?: number;
  amount?: number;
}) {
  const o = useSharedValue(0);
  useEffect(() => {
    o.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, { duration: 3600, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      )
    );
  }, []);
  const anim = useAnimatedStyle(() => ({
    transform: [{ translateY: o.value * amount }],
  }));

  return (
    <Animated.View style={[style, anim]}>
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          // outer shadow
          shadowColor: shadeOf(color, 0.7),
          shadowOffset: { width: 0, height: size * 0.15 },
          shadowOpacity: 0.5,
          shadowRadius: size * 0.3,
          elevation: 10,
        }}
      >
        {/* top-left white highlight — the signature clay "gloss" */}
        <View
          style={{
            position: "absolute",
            top: size * 0.12,
            left: size * 0.15,
            width: size * 0.28,
            height: size * 0.22,
            borderRadius: size * 0.14,
            backgroundColor: "rgba(255,255,255,0.75)",
            transform: [{ rotate: "-20deg" }],
          }}
        />
        {/* secondary tiny glint */}
        <View
          style={{
            position: "absolute",
            top: size * 0.1,
            right: size * 0.22,
            width: size * 0.08,
            height: size * 0.08,
            borderRadius: size * 0.04,
            backgroundColor: "rgba(255,255,255,0.85)",
          }}
        />
        {/* bottom shade rim (inner) */}
        <View
          style={{
            position: "absolute",
            bottom: 2,
            left: size * 0.2,
            right: size * 0.2,
            height: 2,
            borderRadius: 2,
            backgroundColor: shadeOf(color, 0.82),
            opacity: 0.6,
          }}
        />
      </View>
    </Animated.View>
  );
}

// ---------- Clay button ----------
function ClayButton({
  label,
  icon,
  onPress,
  color = CLAY.lavender,
  textColor = "#FFFFFF",
  style,
  size = "md",
}: {
  label: string;
  icon?: string;
  onPress: () => void;
  color?: string;
  textColor?: string;
  style?: any;
  size?: "md" | "lg";
}) {
  const [pressed, setPressed] = useState(false);
  const scale = useSharedValue(1);
  const isLg = size === "lg";

  useEffect(() => {
    scale.value = withSpring(pressed ? 0.96 : 1, { damping: 15, stiffness: 300 });
  }, [pressed]);

  const anim = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[{ borderRadius: CLAY_R.pill }, style, anim]}>
      <Pressable
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onPress();
        }}
      >
        <ClaySurface
          radius={CLAY_R.pill}
          color={color}
          pressed={pressed}
          style={{ paddingVertical: isLg ? 20 : 16, paddingHorizontal: 24 }}
        >
          <Text
            style={{
              fontFamily: FONT.extrabold,
              fontSize: isLg ? 17 : 15,
              letterSpacing: 0.3,
              color: textColor,
              textAlign: "center",
              textShadowColor: shadeOf(color, 0.75),
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 1,
            }}
          >
            {icon ? `${icon}  ` : ""}
            {label}
          </Text>
        </ClaySurface>
      </Pressable>
    </Animated.View>
  );
}

export default function Welcome() {
  const router = useRouter();
  const { t } = useTranslation();
  const { lang, setLang } = useLang();
  const { setMode } = useMode();

  return (
    <View style={{ flex: 1, backgroundColor: CLAY.bg }}>
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
          {/* ---- Top bar: Logo + Language ---- */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 28,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <ClaySurface radius={CLAY_R.sm} color={CLAY.pink} style={{ width: 48, height: 48 }}>
                <View
                  style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontSize: 22 }}>🍭</Text>
                </View>
              </ClaySurface>
              <Text
                style={{
                  fontFamily: FONT.extrabold,
                  fontSize: 13,
                  color: CLAY.text,
                  letterSpacing: 1.5,
                }}
              >
                ONLINE SCHOOL
              </Text>
            </View>

            {/* Language toggle — clay "shelf" with a raised pill on top */}
            <ClaySurface radius={CLAY_R.pill} color={CLAY.surfaceAlt} style={{ padding: 4 }}>
              <View style={{ flexDirection: "row" }}>
                {(["my", "en"] as const).map((l) => {
                  const active = lang === l;
                  return (
                    <Pressable
                      key={l}
                      onPress={() => {
                        Haptics.selectionAsync();
                        setLang(l);
                      }}
                      style={{ borderRadius: CLAY_R.pill }}
                    >
                      {active ? (
                        <ClaySurface
                          radius={CLAY_R.pill}
                          color={CLAY.lavender}
                          style={{ paddingHorizontal: 16, paddingVertical: 8 }}
                        >
                          <Text
                            style={{
                              fontFamily: FONT.extrabold,
                              fontSize: 12,
                              color: "#FFFFFF",
                            }}
                          >
                            {l.toUpperCase()}
                          </Text>
                        </ClaySurface>
                      ) : (
                        <View
                          style={{
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                          }}
                        >
                          <Text
                            style={{
                              fontFamily: FONT.extrabold,
                              fontSize: 12,
                              color: CLAY.textMuted,
                            }}
                          >
                            {l.toUpperCase()}
                          </Text>
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </ClaySurface>
          </View>

          {/* ---- Hero headline ---- */}
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <Text
              style={{
                fontFamily: FONT.extrabold,
                fontSize: isTablet ? 64 : 44,
                lineHeight: isTablet ? 72 : 52,
                color: CLAY.text,
                letterSpacing: -1.5,
              }}
            >
              {t("welcome.hello")}
            </Text>
            <Text
              style={{
                fontFamily: FONT.extrabold,
                fontSize: isTablet ? 64 : 44,
                lineHeight: isTablet ? 72 : 52,
                letterSpacing: -1.5,
                color: CLAY.lavenderDark,
              }}
            >
              {t("welcome.little")}
            </Text>
            <Text
              style={{
                fontFamily: FONT.extrabold,
                fontSize: isTablet ? 64 : 44,
                lineHeight: isTablet ? 72 : 52,
                letterSpacing: -1.5,
                color: CLAY.pinkDark,
              }}
            >
              {t("welcome.explorers")}
            </Text>
            <Text
              style={{
                fontFamily: FONT.semibold,
                fontSize: 15,
                color: CLAY.textMuted,
                marginTop: 12,
              }}
            >
              {t("welcome.tagline")}
            </Text>
          </Animated.View>

          {/* ---- Clay illustration zone ---- */}
          <View
            style={{
              height: isTablet ? 220 : 180,
              marginTop: 16,
              marginBottom: 12,
              position: "relative",
            }}
          >
            <ClaySurface
              radius={CLAY_R.xl}
              color={CLAY.surfaceAlt}
              style={{ width: "100%", height: "100%" }}
            >
              <View style={{ flex: 1, position: "relative" }}>
                <ClayBlob
                  size={isTablet ? 110 : 84}
                  color={CLAY.lavender}
                  style={{ position: "absolute", top: 16, left: 24 }}
                  delay={0}
                />
                <ClayBlob
                  size={isTablet ? 76 : 60}
                  color={CLAY.mint}
                  style={{ position: "absolute", top: 30, right: 40 }}
                  delay={400}
                />
                <ClayBlob
                  size={isTablet ? 58 : 46}
                  color={CLAY.yellow}
                  style={{ position: "absolute", bottom: 22, right: 90 }}
                  delay={800}
                />
                <ClayBlob
                  size={isTablet ? 46 : 36}
                  color={CLAY.pink}
                  style={{ position: "absolute", bottom: 26, left: 90 }}
                  delay={1200}
                />
                <ClayBlob
                  size={isTablet ? 32 : 26}
                  color={CLAY.sky}
                  style={{ position: "absolute", top: 12, right: isTablet ? 200 : 140 }}
                  delay={200}
                />
                {/* Center emoji overlaid on the "scene" */}
                <View
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontSize: isTablet ? 64 : 52 }}>🚀</Text>
                </View>
              </View>
            </ClaySurface>
          </View>

          {/* ---- CTA Buttons ---- */}
          <Animated.View entering={FadeInDown.delay(300).springify()}>
            <ClayButton
              label={t("welcome.playGuest")}
              icon="🚀"
              size="lg"
              color={CLAY.lavender}
              onPress={() => router.push("/(student)/grades")}
              style={{ marginBottom: 16 }}
            />
            <ClayButton
              label={t("welcome.login")}
              color={CLAY.pink}
              onPress={() => router.push("/(auth)/login")}
              style={{ marginBottom: 16 }}
            />
            <ClayButton
              label={t("welcome.teacher")}
              icon="👩‍🏫"
              color={CLAY.mint}
              textColor="#FFFFFF"
              onPress={() => {
                setMode("teacher");
                router.push("/(teacher)/dashboard");
              }}
            />
          </Animated.View>

          <View style={{ flex: 1, minHeight: 20 }} />

          <Text
            style={{
              textAlign: "center",
              fontFamily: FONT.semibold,
              fontSize: 11,
              color: CLAY.textMuted,
              marginTop: 20,
              marginBottom: 8,
            }}
          >
            {t("welcome.help")}  ·  v1.0.0
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}