import { View, Text, ScrollView, Dimensions, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { WebView } from "react-native-webview";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeInDown,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  interpolate,
} from "react-native-reanimated";
import { useEffect, useState, useRef } from "react";
import { FONT } from "@/lib/design";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

const PAL = {
  bg: "#FFF8F0",
  bgTop: "#FFE8D6",
  bgBottom: "#E8F4FF",
  primary: "#FF6B6B",
  primaryDark: "#E05050",
  secondary: "#4ECDC4",
  secondaryDark: "#3BA89F",
  accent: "#FFD93D",
  accentDark: "#E5C020",
  text: "#2D2422",
  textMuted: "#7A6A63",
  divider: "#EDE3D8",
};

type Mood = "idle" | "happy" | "excited" | "thinking" | "wave";

// ============================================================
// PIP
// ============================================================
function Pip({ mood = "idle", size = 80, prop, flameTop = PAL.accent, flameBottom = "#FFB84D" }: { mood?: Mood; size?: number; prop?: string; flameTop?: string; flameBottom?: string }) {
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
  const bodyAnim = useAnimatedStyle(() => ({ transform: [{ translateY: interpolate(bob.value, [0, 1], [0, -5]) }, { rotate: mood === "excited" ? `${interpolate(bob.value, [0, 1], [-4, 4])}deg` : "0deg" }] }));
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

// ============================================================
// CONTENT SECTION ROW
// ============================================================
function ContentRow({
  index,
  heading,
  body,
  isActive,
  onHover,
}: {
  index: number;
  heading: string;
  body: string;
  isActive: boolean;
  onHover: () => void;
}) {
  const scale = useSharedValue(1);
  const dotSize = useSharedValue(10);

  useEffect(() => {
    dotSize.value = withSpring(isActive ? 16 : 10, { damping: 14, stiffness: 200 });
  }, [isActive]);

  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const dotAnim = useAnimatedStyle(() => ({ width: dotSize.value, height: dotSize.value, borderRadius: dotSize.value / 2 }));

  return (
    <Animated.View entering={FadeInDown.delay(index * 70).springify()}>
      <Pressable
        onPressIn={() => { scale.value = withSpring(0.98, { damping: 15, stiffness: 400 }); onHover(); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 12, stiffness: 300 }); }}
      >
        <Animated.View style={[anim, { flexDirection: "row", paddingVertical: 16, paddingHorizontal: 4 }]}>
          <Text style={{ fontFamily: FONT.extrabold, fontSize: 11, color: isActive ? PAL.primary : PAL.textMuted, letterSpacing: 1, width: 28 }}>
            {String(index + 1).padStart(2, "0")}
          </Text>
          <Animated.View style={[dotAnim, { backgroundColor: isActive ? PAL.primary : PAL.divider, marginRight: 14, marginTop: 6 }]} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: FONT.extrabold, fontSize: isTablet ? 17 : 15, color: isActive ? PAL.primary : PAL.text, letterSpacing: -0.2 }}>
              {heading}
            </Text>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: PAL.textMuted, marginTop: 4, lineHeight: 19 }}>
              {body}
            </Text>
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

// ============================================================
// MAIN
// ============================================================
export default function StudentLessonDetail() {
  const router = useRouter();
  const { level, subject, id } = useLocalSearchParams<{ level: string; subject: string; id: string }>();
  const lessonNum = (id ?? "l1").replace("l", "");
  const videoId = "DDhdFSIW-MA";

  const [mood, setMood] = useState<Mood>("idle");
  const [message, setMessage] = useState("Watch the video, then read below! 📺");
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const resetTimer = useRef<any>(null);

  const content = [
    { h: "၁။ အခြေခံ သဘောတရား", p: "ဒီသင်ခန်းစာမှာ အခြေခံ အယူအဆတွေကို လေ့လာပါမယ်။", reaction: "Basics first! 🌱" },
    { h: "၂။ ဥပမာများ", p: "ဗီဒီယိုထဲက ဥပမာတွေကို ကြည့်ပြီး ကိုယ်တိုင် လေ့ကျင့်ပါ။", reaction: "Examples help! 💡" },
    { h: "၃။ လေ့ကျင့်ခန်း", p: "အောက်က Quiz ကို ဖြေပြီး နားလည်မှုကို စမ်းသပ်ပါ။", reaction: "Time to practice! 🎯" },
  ];

  const react = (idx: number) => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
    setActiveIdx(idx);
    setMood("excited");
    setMessage(content[idx].reaction);
    resetTimer.current = setTimeout(() => {
      setMood("idle");
      setMessage("Watch the video, then read below! 📺");
      setActiveIdx(null);
    }, 2200);
  };

  useEffect(() => { return () => { if (resetTimer.current) clearTimeout(resetTimer.current); }; }, []);

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
          html, body { margin:0; padding:0; background:#000; height:100%; overflow:hidden; }
          iframe { width:100%; height:100%; border:0; }
        </style>
      </head>
      <body>
        <iframe src="https://www.youtube-nocookie.com/embed/${videoId}?playsinline=1&rel=0&modestbranding=1"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen></iframe>
      </body>
    </html>
  `;

  return (
    <View style={{ flex: 1, backgroundColor: PAL.bg }}>
      <LinearGradient colors={[PAL.bgTop, PAL.bg, PAL.bgBottom]} locations={[0, 0.5, 1]} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          {/* Video zone */}
          <View style={{ width: "100%", aspectRatio: 16 / 9, backgroundColor: "#000", position: "relative" }}>
            <WebView
              originWhitelist={["*"]}
              source={{ html, baseUrl: "https://www.youtube-nocookie.com" }}
              style={{ flex: 1, backgroundColor: "#000" }}
              allowsInlineMediaPlayback
              mediaPlaybackRequiresUserAction={false}
              javaScriptEnabled
              domStorageEnabled
              sharedCookiesEnabled
              thirdPartyCookiesEnabled
              mixedContentMode="always"
            />
            <Pressable
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back(); }}
              style={{ position: "absolute", top: 12, left: 12, width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.9)", alignItems: "center", justifyContent: "center" }}
            >
              <Text style={{ fontSize: 20, color: PAL.text }}>←</Text>
            </Pressable>
          </View>

          <View style={{ paddingHorizontal: isTablet ? 48 : 24, maxWidth: isTablet ? 600 : undefined, alignSelf: "center", width: "100%" }}>
            {/* Pip + message */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 20, marginBottom: 20 }}>
              <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); react(0); }}>
                <Pip mood={mood} size={isTablet ? 80 : 68} prop="📖" />
              </Pressable>
              <Animated.View entering={FadeIn.delay(200)} style={{ flex: 1 }}>
                <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: PAL.textMuted, lineHeight: 20 }}>{message}</Text>
              </Animated.View>
            </View>

            {/* Title */}
            <Animated.View entering={FadeInDown.delay(100).springify()}>
              <Text style={{ fontFamily: FONT.extrabold, fontSize: isTablet ? 34 : 26, color: PAL.text, letterSpacing: -0.8, lineHeight: isTablet ? 40 : 32 }}>
                သင်ခန်းစာ {lessonNum}
              </Text>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: PAL.textMuted, letterSpacing: 1.5, marginTop: 6 }}>
                {level?.toUpperCase()} · {subject?.toUpperCase()}
              </Text>
            </Animated.View>

            <View style={{ height: 1, backgroundColor: PAL.divider, marginTop: 20, marginBottom: 8 }} />

            {/* Section label */}
            <Text style={{ fontFamily: FONT.extrabold, fontSize: 11, color: PAL.textMuted, letterSpacing: 1.5, marginTop: 12, marginBottom: 8 }}>
              📖 အကြောင်းအရာ
            </Text>

            {/* Content rows */}
            {content.map((b, i) => (
              <View key={i}>
                <ContentRow
                  index={i}
                  heading={b.h}
                  body={b.p}
                  isActive={activeIdx === i}
                  onHover={() => react(i)}
                />
                {i < content.length - 1 && <View style={{ height: 1, backgroundColor: PAL.divider }} />}
              </View>
            ))}

            {/* Quiz button */}
            <Animated.View entering={FadeInDown.delay(400).springify()}>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                  router.push(`/(student)/quiz/q1`);
                }}
                style={{
                  backgroundColor: PAL.primary,
                  borderRadius: 999,
                  paddingVertical: 16,
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 28,
                  flexDirection: "row",
                  gap: 8,
                }}
              >
                <Text style={{ fontSize: 16, color: "#FFFFFF" }}>🎯</Text>
                <Text style={{ fontFamily: FONT.extrabold, fontSize: 15, color: "#FFFFFF", letterSpacing: 0.3 }}>
                  Quiz စတင်မယ်
                </Text>
              </Pressable>
            </Animated.View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}