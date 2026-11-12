import { View, Text, Dimensions, StyleSheet } from "react-native";
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
  withDelay,
  Easing,
  FadeInDown,
} from "react-native-reanimated";
import { useEffect } from "react";
import { FONT, R } from "@/lib/design";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

// ---------- Glass palette ----------
const GLASS = {
  bgTop: "#0B1020",
  bgMid: "#1A1033",
  bgBottom: "#2A0E4A",
  text: "#FFFFFF",
  textMuted: "rgba(255,255,255,0.62)",
  accent: "#8B5CF6",   // violet
  accent2: "#22D3EE",  // cyan
  accent3: "#F472B6",  // pink
  accent4: "#34D399",  // mint
  accent5: "#FBBF24",  // amber
};

// ---------- Floating orb (background light) ----------
function Orb({
  size,
  color,
  style,
  delay = 0,
  amount = -14,
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
        withTiming(1, { duration: 4200, easing: Easing.inOut(Easing.ease) }),
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
      {/* outer soft glow */}
      <View
        style={{
          width: size * 1.6,
          height: size * 1.6,
          borderRadius: size * 0.8,
          backgroundColor: color,
          opacity: 0.12,
          position: "absolute",
          top: -size * 0.3,
          left: -size * 0.3,
        }}
      />
      {/* core orb */}
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          opacity: 0.55,
        }}
      />
    </Animated.View>
  );
}

// ---------- Fake frosted glass card (no BlurView) ----------
function GlassCard({
  children,
  style,
  radius = 24,
  tint = "rgba(255,255,255,0.08)",
}: {
  children: React.ReactNode;
  style?: any;
  radius?: number;
  tint?: string;
}) {
  return (
    <View style={[styles.glassShadow, { borderRadius: radius }, style]}>
      {/* Base translucent layer */}
      <View
        style={{
          borderRadius: radius,
          overflow: "hidden",
          backgroundColor: tint,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.18)",
        }}
      >
        {/* Diagonal sheen gradient — fakes the light refraction of blur */}
        <LinearGradient
          colors={[
            "rgba(255,255,255,0.14)",
            "rgba(255,255,255,0.04)",
            "rgba(255,255,255,0.00)",
            "rgba(255,255,255,0.06)",
          ]}
          locations={[0, 0.35, 0.7, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        {/* Top edge highlight */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 12,
            right: 12,
            height: 1,
            backgroundColor: "rgba(255,255,255,0.45)",
          }}
          pointerEvents="none"
        />
        {/* Bottom edge subtle rim */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 12,
            right: 12,
            height: 1,
            backgroundColor: "rgba(255,255,255,0.08)",
          }}
          pointerEvents="none"
        />
        <View style={{ borderRadius: radius }}>{children}</View>
      </View>
    </View>
  );
}

// ---------- Glass button ----------
function GlassButton({
  label,
  icon,
  onPress,
  tint = GLASS.accent,
  textColor = "#FFFFFF",
  style,
  size = "md",
}: {
  label: string;
  icon?: string;
  onPress: () => void;
  tint?: string;
  textColor?: string;
  style?: any;
  size?: "md" | "lg";
}) {
  const isLg = size === "lg";
  return (
    <View style={[styles.glassShadow, { borderRadius: R.pill }, style]}>
      <View
        onTouchEnd={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onPress();
        }}
        style={{
          borderRadius: R.pill,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: tint + "66",
          backgroundColor: "rgba(255,255,255,0.06)",
        }}
      >
        {/* Tint gradient */}
        <LinearGradient
          colors={[tint + "88", tint + "22", tint + "44"]}
          locations={[0, 0.55, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        {/* Inner top sheen */}
        <LinearGradient
          colors={["rgba(255,255,255,0.28)", "rgba(255,255,255,0.00)"]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.5 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        {/* Top edge highlight */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 16,
            right: 16,
            height: 1,
            backgroundColor: "rgba(255,255,255,0.55)",
          }}
          pointerEvents="none"
        />
        <View style={[styles.btn, isLg && styles.btnLg]}>
          <Text
            style={[styles.btnLabel, isLg && styles.btnLabelLg, { color: textColor }]}
          >
            {icon ? `${icon}  ` : ""}
            {label}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function Welcome() {
  const router = useRouter();
  const { t } = useTranslation();
  const { lang, setLang } = useLang();
  const { setMode } = useMode();

  return (
    <View style={{ flex: 1, backgroundColor: GLASS.bgTop }}>
      {/* ---- Gradient background ---- */}
      <LinearGradient
        colors={[GLASS.bgTop, GLASS.bgMid, GLASS.bgBottom]}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* ---- Ambient orbs behind everything ---- */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Orb size={isTablet ? 380 : 260} color={GLASS.accent} style={{ top: -80, left: -60 }} delay={0} />
        <Orb size={isTablet ? 300 : 220} color={GLASS.accent2} style={{ top: 120, right: -70 }} delay={600} />
        <Orb size={isTablet ? 260 : 200} color={GLASS.accent3} style={{ bottom: 60, left: -40 }} delay={1200} />
        <Orb size={isTablet ? 220 : 160} color={GLASS.accent4} style={{ bottom: -40, right: 40 }} delay={300} />
      </View>

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
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <GlassCard radius={18} tint="rgba(255,255,255,0.12)">
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontSize: 18 }}>✨</Text>
                </View>
              </GlassCard>
              <Text
                style={{
                  fontFamily: FONT.extrabold,
                  fontSize: 14,
                  color: GLASS.text,
                  letterSpacing: 1.5,
                }}
              >
                ONLINE SCHOOL
              </Text>
            </View>

            {/* Language pill */}
            <GlassCard radius={R.pill} tint="rgba(255,255,255,0.08)">
              <View style={{ flexDirection: "row", padding: 4 }}>
                {(["my", "en"] as const).map((l) => (
                  <View
                    key={l}
                    onTouchEnd={() => {
                      Haptics.selectionAsync();
                      setLang(l);
                    }}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 6,
                      borderRadius: R.pill,
                      overflow: "hidden",
                    }}
                  >
                    {lang === l && (
                      <LinearGradient
                        colors={[GLASS.accent, GLASS.accent2]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={StyleSheet.absoluteFill}
                      />
                    )}
                    <Text
                      style={{
                        fontFamily: FONT.extrabold,
                        fontSize: 12,
                        color: lang === l ? "#FFFFFF" : GLASS.textMuted,
                      }}
                    >
                      {l.toUpperCase()}
                    </Text>
                  </View>
                ))}
              </View>
            </GlassCard>
          </View>

          {/* ---- Hero headline ---- */}
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <Text
              style={{
                fontFamily: FONT.extrabold,
                fontSize: isTablet ? 64 : 44,
                lineHeight: isTablet ? 72 : 52,
                color: GLASS.text,
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
                color: GLASS.accent2,
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
                color: GLASS.accent3,
              }}
            >
              {t("welcome.explorers")}
            </Text>
            <Text
              style={{
                fontFamily: FONT.semibold,
                fontSize: 15,
                color: GLASS.textMuted,
                marginTop: 12,
              }}
            >
              {t("welcome.tagline")}
            </Text>
          </Animated.View>

          {/* ---- Glass illustration zone ---- */}
          <View
            style={{
              height: isTablet ? 200 : 160,
              marginTop: 16,
              marginBottom: 8,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <GlassCard
              radius={32}
              style={{ width: "100%", height: "100%" }}
              tint="rgba(255,255,255,0.06)"
            >
              <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <Orb size={isTablet ? 80 : 64} color={GLASS.accent} style={{ position: "absolute", top: 20, left: 30 }} delay={200} />
                <Orb size={isTablet ? 56 : 44} color={GLASS.accent2} style={{ position: "absolute", top: 30, right: 40 }} delay={700} />
                <Orb size={isTablet ? 44 : 34} color={GLASS.accent3} style={{ position: "absolute", bottom: 24, right: 90 }} delay={1100} />
                <Orb size={isTablet ? 36 : 28} color={GLASS.accent4} style={{ position: "absolute", bottom: 30, left: 80 }} delay={400} />
                <Text style={{ fontSize: isTablet ? 56 : 44 }}>🚀</Text>
              </View>
            </GlassCard>
          </View>

          {/* ---- CTA Buttons ---- */}
          <Animated.View entering={FadeInDown.delay(300).springify()}>
            <GlassButton
              label={t("welcome.playGuest")}
              icon="🚀"
              size="lg"
              tint={GLASS.accent}
              onPress={() => router.push("/(student)/grades")}
              style={{ marginBottom: 14 }}
            />
            <GlassButton
              label={t("welcome.login")}
              tint={GLASS.accent2}
              textColor="#E0F7FF"
              onPress={() => router.push("/(auth)/login")}
              style={{ marginBottom: 14 }}
            />
            <GlassButton
              label={t("welcome.teacher")}
              icon="👩‍🏫"
              tint={GLASS.accent4}
              textColor="#E7FFF5"
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
              color: GLASS.textMuted,
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

const styles = StyleSheet.create({
  glassShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 10,
  },
  btn: {
    paddingVertical: 14,
    paddingHorizontal: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  btnLg: {
    paddingVertical: 18,
  },
  btnLabel: {
    fontFamily: FONT.extrabold,
    fontSize: 15,
    letterSpacing: 0.3,
  },
  btnLabelLg: {
    fontSize: 17,
  },
});