import { View, Text, Dimensions } from "react-native";
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
import { useEffect } from "react";
import { CANDY, FONT, R, SHADOW } from "@/lib/design";
import CandyButton from "@/components/ui/CandyButton";
import CandyCard from "@/components/ui/CandyCard";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

function Float({
  children,
  delay = 0,
  amount = -10,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  amount?: number;
  style?: any;
}) {
  const o = useSharedValue(0);
  useEffect(() => {
    o.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      )
    );
  }, []);
  const anim = useAnimatedStyle(() => ({ transform: [{ translateY: o.value * amount }] }));
  return <Animated.View style={[style, anim]}>{children}</Animated.View>;
}

// 3D Clay Style Blob
function ClayBlob({
  size,
  color,
  style,
}: {
  size: number;
  color: string;
  style?: any;
}) {
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          shadowColor: color,
          shadowOffset: { width: 0, height: size * 0.18 },
          shadowOpacity: 0.6,
          shadowRadius: size * 0.35,
          elevation: 12,
          // Top highlight (3D clay effect)
          borderWidth: size * 0.04,
          borderColor: "rgba(255,255,255,0.5)",
        },
        style,
      ]}
    >
      <View
        style={{
          position: "absolute",
          top: size * 0.1,
          left: size * 0.12,
          width: size * 0.25,
          height: size * 0.25,
          borderRadius: size * 0.125,
          backgroundColor: "rgba(255,255,255,0.7)",
        }}
      />
    </View>
  );
}

export default function Welcome() {
  const router = useRouter();
  const { t } = useTranslation();
  const { lang, setLang } = useLang();
  const { setMode } = useMode(); // Hook ကို Component အတွင်းမှာ ထားရပါမယ်

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: CANDY.bg }}>
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
        {/* Top bar: Logo + Language */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 32,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: CANDY.pink,
                alignItems: "center",
                justifyContent: "center",
                shadowColor: CANDY.pink,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Text style={{ fontSize: 20 }}>🍭</Text>
            </View>
            <Text
              style={{
                fontFamily: FONT.extrabold,
                fontSize: 14,
                color: CANDY.text,
                letterSpacing: 1,
              }}
            >
              ONLINE SCHOOL
            </Text>
          </View>

          {/* Language pill */}
          <View
            style={{
              flexDirection: "row",
              backgroundColor: CANDY.surface,
              borderRadius: R.pill,
              padding: 4,
              ...SHADOW.soft,
            }}
          >
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
                  backgroundColor: lang === l ? CANDY.primary : "transparent",
                }}
              >
                <Text
                  style={{
                    fontFamily: FONT.extrabold,
                    fontSize: 12,
                    color: lang === l ? "#FFF" : CANDY.textMuted,
                  }}
                >
                  {l.toUpperCase()}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Hero headline */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <Text
            style={{
              fontFamily: FONT.extrabold,
              fontSize: isTablet ? 64 : 44,
              lineHeight: isTablet ? 72 : 52,
              color: CANDY.text,
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
              color: CANDY.primary,
              letterSpacing: -1.5,
            }}
          >
            {t("welcome.little")}
          </Text>
          <Text
            style={{
              fontFamily: FONT.extrabold,
              fontSize: isTablet ? 64 : 44,
              lineHeight: isTablet ? 72 : 52,
              color: CANDY.pink,
              letterSpacing: -1.5,
            }}
          >
            {t("welcome.explorers")}
          </Text>
          <Text
            style={{
              fontFamily: FONT.semibold,
              fontSize: 15,
              color: CANDY.textMuted,
              marginTop: 12,
            }}
          >
            {t("welcome.tagline")}
          </Text>
        </Animated.View>

        {/* 3D Clay Illustration Zone */}
        <View
          style={{
            height: isTablet ? 260 : 220,
            position: "relative",
            marginTop: 16,
            marginBottom: 8,
          }}
        >
          <Float delay={0} amount={-8} style={{ position: "absolute", top: 20, left: 20 }}>
            <ClayBlob size={isTablet ? 130 : 100} color={CANDY.primary} />
          </Float>
          <Float delay={400} amount={-12} style={{ position: "absolute", top: 50, right: 20 }}>
            <ClayBlob size={isTablet ? 90 : 70} color={CANDY.mint} />
          </Float>
          <Float delay={800} amount={-10} style={{ position: "absolute", bottom: 20, right: 60 }}>
            <ClayBlob size={isTablet ? 70 : 56} color={CANDY.yellow} />
          </Float>
          <Float delay={1200} amount={-6} style={{ position: "absolute", bottom: 30, left: 70 }}>
            <ClayBlob size={isTablet ? 56 : 44} color={CANDY.pink} />
          </Float>
          <Float delay={200} amount={-8} style={{ position: "absolute", top: 0, right: isTablet ? 200 : 140 }}>
            <ClayBlob size={36} color={CANDY.secondary} />
          </Float>
        </View>

        {/* CTA Buttons */}
        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <CandyButton
            label={t("welcome.playGuest")}
            icon="🚀"
            size="lg"
            color={CANDY.primary}
            onPress={() => router.push("/(student)/grades")}
            haptic="heavy"
            style={{ marginBottom: 14 }}
          />
          <CandyButton
            label={t("welcome.login")}
            color={CANDY.surface}
            textColor={CANDY.primary}
            onPress={() => router.push("/(auth)/login")}
            style={{ marginBottom: 14 }}
          />
          
          {/* Teacher Access button */}
          <CandyButton
            label={t("welcome.teacher")}
            icon="👩‍🏫"
            color={CANDY.mint}
            textColor={CANDY.text}
            onPress={() => {
              setMode("teacher");
              router.push("/(teacher)/dashboard");
            }}
            style={{ flex: 1 }}
          />
        </Animated.View>

        <View style={{ flex: 1, minHeight: 20 }} />

        <Text
          style={{
            textAlign: "center",
            fontFamily: FONT.semibold,
            fontSize: 11,
            color: CANDY.textMuted,
            marginTop: 20,
            marginBottom: 8,
          }}
        >
          {t("welcome.help")}  ·  v1.0.0
        </Text>
      </View>
    </SafeAreaView>
  );
}