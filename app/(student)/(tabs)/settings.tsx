import { View, Text, Switch, Dimensions, Pressable, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "expo-router/js-tabs";
import { useTranslation } from "react-i18next";
import { useLang } from "@/lib/language-context";
import { useRouter } from "expo-router";
import { useState, useEffect, useRef } from "react";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import { FONT } from "@/lib/design";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

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

export default function Settings() {
  const { t } = useTranslation();
  const { lang, setLang } = useLang();
  const router = useRouter();
  const tabBarHeight = useBottomTabBarHeight();
  const [notif, setNotif] = useState(true);
  const [sound, setSound] = useState(true);
  const [haptics, setHaptics] = useState(true);
  const [message, setMessage] = useState("Tweak things to your liking! ⚙️");
  const resetTimer = useRef<any>(null);

  const react = (msg: string) => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
    setMessage(msg);
    resetTimer.current = setTimeout(() => {
      setMessage("Tweak things to your liking! ⚙️");
    }, 2200);
  };

  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  const handleLogout = async () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      await signOut(auth);
      router.replace("/");
    } catch (error: any) {
      Alert.alert("Error", "ထွက်လို့မရပါ။");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: PAL.bg }}>
      <LinearGradient
        colors={[PAL.bgTop, PAL.bg, PAL.bgBottom]}
        locations={[0, 0.5, 1]}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <SafeAreaView style={{ flex: 1 }}>
        <View
          style={{
            flex: 1,
            paddingHorizontal: isTablet ? 48 : 24,
            maxWidth: isTablet ? 600 : undefined,
            alignSelf: "center",
            width: "100%",
          }}
        >
          <Text
            style={{
              marginTop: 16,
              fontFamily: FONT.extrabold,
              fontSize: isTablet ? 36 : 28,
              color: PAL.text,
              letterSpacing: -1,
            }}
          >
            ⚙️ {t("settings.title")}
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              marginTop: 12,
              marginBottom: 24,
            }}
          >
            <Animated.View entering={FadeIn.delay(200)} style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: FONT.semibold,
                  fontSize: 14,
                  color: PAL.textMuted,
                  lineHeight: 20,
                }}
              >
                {message}
              </Text>
            </Animated.View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: tabBarHeight + 40 }}
          >
            {/* ⭐ Payment — အသစ်ထည့် */}
            <Text
              style={{
                fontFamily: FONT.extrabold,
                fontSize: 11,
                color: PAL.textMuted,
                letterSpacing: 1.5,
                marginBottom: 10,
              }}
            >
              ငွေချေမှု
            </Text>
            <Pressable
              onPress={() => {
                Haptics.selectionAsync();
                router.push("/(student)/payment");
              }}
              style={{
                backgroundColor: "#FFF",
                borderRadius: 16,
                padding: 16,
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                marginBottom: 24,
                borderWidth: 1.5,
                borderColor: PAL.divider,
              }}
            >
              <Text style={{ fontSize: 22 }}>💳</Text>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: FONT.extrabold,
                    fontSize: 15,
                    color: PAL.text,
                  }}
                >
                  ငွေချေရန်
                </Text>
                <Text
                  style={{
                    fontFamily: FONT.semibold,
                    fontSize: 12,
                    color: PAL.textMuted,
                    marginTop: 2,
                  }}
                >
                  ပရီမီယံ အစီအစဉ် ဝယ်ယူပါ
                </Text>
              </View>
              <Text style={{ fontSize: 18, color: PAL.textMuted }}>›</Text>
            </Pressable>

            <View style={{ height: 1, backgroundColor: PAL.divider, marginBottom: 16 }} />

            {/* Language */}
            <Text
              style={{
                fontFamily: FONT.extrabold,
                fontSize: 11,
                color: PAL.textMuted,
                letterSpacing: 1.5,
                marginBottom: 10,
              }}
            >
              {t("settings.language").toUpperCase()}
            </Text>
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 24 }}>
              {(["my", "en"] as const).map((l) => {
                const active = lang === l;
                return (
                  <Pressable
                    key={l}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setLang(l);
                      react(l === "my" ? "မြန်မာစကား! 🇲🇲" : "English mode! 🇬🇧");
                    }}
                    style={{
                      paddingHorizontal: 18,
                      paddingVertical: 9,
                      borderRadius: 999,
                      backgroundColor: active ? PAL.primary : "transparent",
                      borderWidth: 1.5,
                      borderColor: active ? PAL.primary : PAL.divider,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: FONT.extrabold,
                        fontSize: 13,
                        color: active ? "#FFFFFF" : PAL.text,
                      }}
                    >
                      {l === "my" ? "မြန်မာ" : "English"}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={{ height: 1, backgroundColor: PAL.divider, marginBottom: 8 }} />

            {[
              { label: t("settings.notifications"), value: notif, set: setNotif, icon: "🔔" },
              { label: t("settings.sound"), value: sound, set: setSound, icon: "🔊" },
              { label: t("settings.haptics"), value: haptics, set: setHaptics, icon: "📳" },
            ].map((row, i) => (
              <View key={i}>
                <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 14 }}>
                  <Text style={{ fontSize: 20, marginRight: 12 }}>{row.icon}</Text>
                  <Text
                    style={{
                      flex: 1,
                      fontFamily: FONT.extrabold,
                      fontSize: 15,
                      color: PAL.text,
                    }}
                  >
                    {row.label}
                  </Text>
                  <Switch
                    value={row.value}
                    onValueChange={(v) => {
                      Haptics.selectionAsync();
                      row.set(v);
                    }}
                    trackColor={{ true: PAL.primary, false: PAL.divider }}
                    thumbColor="#FFF"
                  />
                </View>
                <View style={{ height: 1, backgroundColor: PAL.divider }} />
              </View>
            ))}

            {/* Logout */}
            <Pressable
              onPress={handleLogout}
              style={{
                marginTop: 28,
                borderRadius: 999,
                paddingVertical: 14,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1.5,
                borderColor: PAL.divider,
                flexDirection: "row",
                gap: 8,
              }}
            >
              <Text style={{ fontSize: 16 }}>🚪</Text>
              <Text
                style={{
                  fontFamily: FONT.extrabold,
                  fontSize: 14,
                  color: PAL.text,
                }}
              >
                {t("settings.logout")}
              </Text>
            </Pressable>

            <Text
              style={{
                textAlign: "center",
                marginTop: 20,
                fontFamily: FONT.semibold,
                fontSize: 11,
                color: PAL.textMuted,
              }}
            >
              {t("settings.version")} · 1.0.0
            </Text>
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
}