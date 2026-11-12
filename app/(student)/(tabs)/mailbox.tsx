import { View, Text, Dimensions, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "expo-router/js-tabs";
import { useTranslation } from "react-i18next";
import { useState, useEffect, useRef } from "react";
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
import { FONT } from "@/lib/design";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

const PAL = {
  bg: "#FFF8F0", bgTop: "#FFE8D6", bgBottom: "#E8F4FF",
  primary: "#FF6B6B", primaryDark: "#E05050",
  secondary: "#4ECDC4", secondaryDark: "#3BA89F",
  accent: "#FFD93D", accentDark: "#E5C020",
  text: "#2D2422", textMuted: "#7A6A63",
  divider: "#EDE3D8",
};

type Mail = { id: string; from: string; subject: string; body: string; date: string; unread: boolean };

const INITIAL: Mail[] = [
  { id: "1", from: "Online School", subject: "🎉 ဂုဏ်ယူပါတယ်!", body: "သင် ဒီတစ်ပတ် Quiz ၅ ခု ပြီးမြောက်ခဲ့ပါပြီ။ ဆက်လက် ကြိုးစားပါ။", date: "2026-11-06", unread: true },
  { id: "2", from: "ဆရာမ မယု", subject: "📚 အိမ်စာ တင်ရန်", body: "ဒီတစ်ပတ် အိမ်စာကို သောကြာနေ့ မတိုင်မီ တင်ပေးပါ။", date: "2026-11-05", unread: true },
  { id: "3", from: "Online School", subject: "🏆 ထိပ်တန်း ၁၀ ဦး", body: "သင် ဒီတစ်ပတ် ထိပ်တန်း ၁၀ ဦးစာရင်းထဲ ပါဝင်ပါတယ်။", date: "2026-11-03", unread: false },
];

type Mood = "idle" | "happy" | "excited" | "thinking" | "wave";

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

export default function Mailbox() {
  const { t } = useTranslation();
  const tabBarHeight = useBottomTabBarHeight();
  const [mails, setMails] = useState(INITIAL);
  const [openId, setOpenId] = useState<string | null>(null);
  const [mood, setMood] = useState<Mood>("idle");
  const [message, setMessage] = useState("You have 2 new letters! 📬");
  const resetTimer = useRef<any>(null);

  const unreadCount = mails.filter((m) => m.unread).length;

  const react = (newMood: Mood, msg: string) => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
    setMood(newMood);
    setMessage(msg);
    resetTimer.current = setTimeout(() => {
      setMood("idle");
      setMessage(unreadCount > 0 ? `You have ${unreadCount} new letter${unreadCount > 1 ? "s" : ""}! 📬` : "All caught up! 📭");
    }, 2200);
  };

  const toggle = (id: string) => {
    Haptics.selectionAsync();
    const mail = mails.find((m) => m.id === id);
    setOpenId(openId === id ? null : id);
    setMails((prev) => prev.map((m) => (m.id === id ? { ...m, unread: false } : m)));
    if (mail) {
      react("excited", mail.unread ? `New letter from ${mail.from}! ✉️` : "Re-reading an old letter 📖");
    }
  };

  useEffect(() => { return () => { if (resetTimer.current) clearTimeout(resetTimer.current); }; }, []);

  return (
    <View style={{ flex: 1, backgroundColor: PAL.bg }}>
      <LinearGradient colors={[PAL.bgTop, PAL.bg, PAL.bgBottom]} locations={[0, 0.5, 1]} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1, paddingHorizontal: isTablet ? 48 : 24, maxWidth: isTablet ? 600 : undefined, alignSelf: "center", width: "100%" }}>
          <Text style={{ marginTop: 16, fontFamily: FONT.extrabold, fontSize: isTablet ? 36 : 28, color: PAL.text, letterSpacing: -1 }}>
            📬 {t("mailbox.title")}
          </Text>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 12, marginBottom: 20 }}>
            <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); react("excited", "Letters, letters! 📬"); }}>
              <Pip mood={mood} size={isTablet ? 80 : 68} prop={unreadCount > 0 ? "✉️" : "📭"} />
            </Pressable>
            <Animated.View entering={FadeIn.delay(200)} style={{ flex: 1 }}>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: PAL.textMuted, lineHeight: 20 }}>{message}</Text>
            </Animated.View>
          </View>

          <View style={{ height: 1, backgroundColor: PAL.divider, marginBottom: 8 }} />

          {mails.length === 0 ? (
            <View style={{ alignItems: "center", marginTop: 60 }}>
              <Text style={{ fontSize: 64 }}>📭</Text>
              <Text style={{ fontFamily: FONT.bold, color: PAL.textMuted, marginTop: 12 }}>{t("mailbox.empty")}</Text>
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: tabBarHeight + 24 }}
            >
              {mails.map((m, i) => (
                <Animated.View key={m.id} entering={FadeInDown.delay(i * 60).springify()}>
                  <Pressable onPress={() => toggle(m.id)} style={{ paddingVertical: 14, paddingHorizontal: 4 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                      <Animated.View style={{
                        width: m.unread ? 10 : 0,
                        height: m.unread ? 10 : 0,
                        borderRadius: 5,
                        backgroundColor: PAL.primary,
                      }} />
                      <Text style={{ flex: 1, fontFamily: m.unread ? FONT.extrabold : FONT.semibold, fontSize: 15, color: PAL.text }} numberOfLines={1}>
                        {m.subject}
                      </Text>
                      <Text style={{ fontFamily: FONT.semibold, fontSize: 11, color: PAL.textMuted }}>{m.date}</Text>
                    </View>
                    <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: PAL.textMuted, marginTop: 4, marginLeft: m.unread ? 20 : 0 }}>
                      {t("mailbox.from")}: {m.from}
                    </Text>
                    {openId === m.id && (
                      <Animated.View entering={FadeIn.duration(200)}>
                        <Text style={{ fontFamily: FONT.regular ?? FONT.semibold, fontSize: 14, color: PAL.text, marginTop: 10, lineHeight: 22, opacity: 0.85, marginLeft: m.unread ? 20 : 0 }}>
                          {m.body}
                        </Text>
                      </Animated.View>
                    )}
                  </Pressable>
                  {i < mails.length - 1 && <View style={{ height: 1, backgroundColor: PAL.divider }} />}
                </Animated.View>
              ))}
            </ScrollView>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}