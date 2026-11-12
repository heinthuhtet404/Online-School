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
  Easing,
  FadeInDown,
} from "react-native-reanimated";
import { useEffect, useState } from "react";
import { FONT } from "@/lib/design";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

// ---------- Neumorphic palette ----------
const NEU = {
  bg: "#E0E5EC",           // classic soft-ui base
  bgAlt: "#DDE3EB",        // slight variation for depth
  light: "#FFFFFF",        // top-left highlight
  dark: "#A3B1C6",         // bottom-right shadow
  text: "#3D4A5C",         // slate text
  textMuted: "#7A889B",    // muted slate
  accent: "#6C63FF",       // soft violet
  accent2: "#4ECDC4",      // teal
  accent3: "#FF6B9D",      // pink
  accent4: "#48C9B0",      // mint
  accent5: "#F7B731",      // amber
};

// Neumorphic radius scale
const NEU_R = {
  sm: 12,
  md: 20,
  lg: 28,
  pill: 999,
};

// ---------- Neumorphic "extruded" surface ----------
function Neumorph({
  children,
  style,
  radius = NEU_R.md,
  pressed = false,
  size = "md",
}: {
  children: React.ReactNode;
  style?: any;
  radius?: number;
  pressed?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const offset = size === "lg" ? 8 : size === "sm" ? 4 : 6;
  const blur = size === "lg" ? 20 : size === "sm" ? 10 : 14;

  // Outer shadow sits on a wrapper View, because RN clips children
  // when overflow is hidden (which we need for the inset shadow).
  return (
    <View
      style={[
        {
          borderRadius: radius,
          backgroundColor: NEU.bg,
          // Raised state: dual shadows
          shadowColor: NEU.dark,
          shadowOffset: { width: offset, height: offset },
          shadowOpacity: 0.55,
          shadowRadius: blur,
          elevation: offset + 4,
        },
        style,
      ]}
    >
      {/* Inner highlight (top-left) — drawn as a subtle 1px border-glow */}
      {!pressed && (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: radius,
            borderTopWidth: 1.5,
            borderLeftWidth: 1.5,
            borderColor: "rgba(255,255,255,0.9)",
            opacity: 0.9,
          }}
        />
      )}
      {children}
    </View>
  );
}

// ---------- Pressed (inset) surface ----------
function NeumorphInset({
  children,
  style,
  radius = NEU_R.md,
}: {
  children: React.ReactNode;
  style?: any;
  radius?: number;
}) {
  return (
    <View
      style={[
        {
          borderRadius: radius,
          backgroundColor: NEU.bg,
          // Inset shadows faked with borders
          borderTopWidth: 2,
          borderLeftWidth: 2,
          borderBottomWidth: 2,
          borderRightWidth: 2,
          borderTopColor: NEU.dark + "55",
          borderLeftColor: NEU.dark + "33",
          borderBottomColor: NEU.light,
          borderRightColor: NEU.light,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

// ---------- Neumorphic button ----------
function NeuButton({
  label,
  icon,
  onPress,
  accent = NEU.accent,
  style,
  size = "md",
  filled = false,
}: {
  label: string;
  icon?: string;
  onPress: () => void;
  accent?: string;
  style?: any;
  size?: "md" | "lg";
  filled?: boolean;
}) {
  const [pressed, setPressed] = useState(false);
  const isLg = size === "lg";

  return (
    <Pressable
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress();
      }}
      style={[styles.neuShadow, { borderRadius: NEU_R.pill }, style]}
    >
      <View
        style={{
          borderRadius: NEU_R.pill,
          backgroundColor: filled ? accent : NEU.bg,
          paddingVertical: isLg ? 20 : 16,
          paddingHorizontal: 24,
          alignItems: "center",
          justifyContent: "center",
          // dual-shadow (raised)
          shadowColor: pressed ? "transparent" : NEU.dark,
          shadowOffset: pressed ? { width: 0, height: 0 } : { width: 6, height: 6 },
          shadowOpacity: pressed ? 0 : 0.55,
          shadowRadius: pressed ? 0 : 12,
          elevation: pressed ? 0 : 6,
          // rim light
          borderTopWidth: pressed ? 1.5 : 1,
          borderLeftWidth: pressed ? 1.5 : 1,
          borderTopColor: pressed ? NEU.dark + "44" : "rgba(255,255,255,0.85)",
          borderLeftColor: pressed ? NEU.dark + "22" : "rgba(255,255,255,0.7)",
          borderBottomWidth: pressed ? 1 : 0,
          borderRightWidth: pressed ? 1 : 0,
          borderBottomColor: pressed ? "rgba(255,255,255,0.9)" : "transparent",
          borderRightColor: pressed ? "rgba(255,255,255,0.9)" : "transparent",
        }}
      >
        <Text
          style={{
            fontFamily: FONT.extrabold,
            fontSize: isLg ? 17 : 15,
            letterSpacing: 0.3,
            color: filled ? "#FFFFFF" : NEU.text,
          }}
        >
          {icon ? `${icon}  ` : ""}
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

// ---------- Floating soft blob (subtle) ----------
function SoftBlob({
  size,
  color,
  style,
  delay = 0,
  amount = -8,
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
        withTiming(1, { duration: 4500, easing: Easing.inOut(Easing.ease) }),
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
          opacity: 0.35,
          // soft, diffuse shadow = the "blob" feel
          shadowColor: color,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.5,
          shadowRadius: size * 0.4,
          elevation: 6,
        }}
      />
    </Animated.View>
  );
}

export default function Welcome() {
  const router = useRouter();
  const { t } = useTranslation();
  const { lang, setLang } = useLang();
  const { setMode } = useMode();

  return (
    <View style={{ flex: 1, backgroundColor: NEU.bg }}>
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
              <Neumorph radius={NEU_R.md} size="sm">
                <View
                  style={{
                    width: 44,
                    height: 44,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontSize: 20 }}>🎓</Text>
                </View>
              </Neumorph>
              <Text
                style={{
                  fontFamily: FONT.extrabold,
                  fontSize: 13,
                  color: NEU.text,
                  letterSpacing: 1.5,
                }}
              >
                ONLINE SCHOOL
              </Text>
            </View>

            {/* Language pill — inset toggle */}
            <NeumorphInset radius={NEU_R.pill}>
              <View style={{ flexDirection: "row", padding: 4 }}>
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
                        paddingHorizontal: 16,
                        paddingVertical: 7,
                        borderRadius: NEU_R.pill,
                        backgroundColor: active ? NEU.bg : "transparent",
                        shadowColor: active ? NEU.dark : "transparent",
                        shadowOffset: { width: 3, height: 3 },
                        shadowOpacity: active ? 0.5 : 0,
                        shadowRadius: 6,
                        elevation: active ? 3 : 0,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: FONT.extrabold,
                          fontSize: 12,
                          color: active ? NEU.accent : NEU.textMuted,
                        }}
                      >
                        {l.toUpperCase()}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </NeumorphInset>
          </View>

          {/* ---- Hero headline ---- */}
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <Text
              style={{
                fontFamily: FONT.extrabold,
                fontSize: isTablet ? 64 : 44,
                lineHeight: isTablet ? 72 : 52,
                color: NEU.text,
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
                color: NEU.accent,
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
                color: NEU.accent3,
              }}
            >
              {t("welcome.explorers")}
            </Text>
            <Text
              style={{
                fontFamily: FONT.semibold,
                fontSize: 15,
                color: NEU.textMuted,
                marginTop: 12,
              }}
            >
              {t("welcome.tagline")}
            </Text>
          </Animated.View>

          {/* ---- Neumorphic illustration panel (inset) ---- */}
          <View
            style={{
              height: isTablet ? 200 : 160,
              marginTop: 20,
              marginBottom: 12,
            }}
          >
            <NeumorphInset
              radius={NEU_R.lg}
              style={{ width: "100%", height: "100%" }}
            >
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <SoftBlob
                  size={isTablet ? 90 : 70}
                  color={NEU.accent}
                  style={{ position: "absolute", top: 18, left: 30 }}
                  delay={200}
                />
                <SoftBlob
                  size={isTablet ? 64 : 52}
                  color={NEU.accent2}
                  style={{ position: "absolute", top: 30, right: 40 }}
                  delay={700}
                />
                <SoftBlob
                  size={isTablet ? 48 : 38}
                  color={NEU.accent3}
                  style={{ position: "absolute", bottom: 22, right: 90 }}
                  delay={1100}
                />
                <SoftBlob
                  size={isTablet ? 40 : 30}
                  color={NEU.accent5}
                  style={{ position: "absolute", bottom: 28, left: 80 }}
                  delay={400}
                />
                <Text style={{ fontSize: isTablet ? 56 : 44 }}>🚀</Text>
              </View>
            </NeumorphInset>
          </View>

          {/* ---- CTA Buttons ---- */}
          <Animated.View entering={FadeInDown.delay(300).springify()}>
            <NeuButton
              label={t("welcome.playGuest")}
              icon="🚀"
              size="lg"
              filled
              accent={NEU.accent}
              onPress={() => router.push("/(student)/grades")}
              style={{ marginBottom: 16 }}
            />
            <NeuButton
              label={t("welcome.login")}
              onPress={() => router.push("/(auth)/login")}
              style={{ marginBottom: 16 }}
            />
            <NeuButton
              label={t("welcome.teacher")}
              icon="👩‍🏫"
              accent={NEU.accent4}
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
              color: NEU.textMuted,
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
  neuShadow: {
    shadowColor: NEU.dark,
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
});