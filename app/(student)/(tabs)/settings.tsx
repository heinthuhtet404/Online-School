import { View, Text, ScrollView, Switch, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useLang } from "../../../lib/language-context";
import { useTheme } from "../../../lib/theme-context";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { useRouter } from "expo-router";

function Row({
  label,
  children,
  C,
}: {
  label: string;
  children: React.ReactNode;
  C: any;
}) {
  return (
    <View
      style={{
        backgroundColor: C.card,
        borderRadius: 18,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 10,
        borderWidth: 1,
        borderColor: C.border,
      }}
    >
      <Text style={{ fontFamily: "PlusJakartaSans_700Bold", fontSize: 14, color: C.ink }}>
        {label}
      </Text>
      {children}
    </View>
  );
}

export default function Settings() {
  const { t } = useTranslation();
  const { lang, setLang } = useLang();
  const { mode, setMode, C } = useTheme();
  const router = useRouter();
  const [notif, setNotif] = useState(true);
  const [sound, setSound] = useState(true);
  const [haptics, setHaptics] = useState(true);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 32 }}>
        <Text
          style={{
            marginTop: 4,
            fontFamily: "PlusJakartaSans_800ExtraBold",
            fontSize: 30,
            color: C.ink,
            letterSpacing: -1,
            marginBottom: 20,
          }}
        >
          ⚙️ {t("settings.title")}
        </Text>

        {/* Language */}
        <Row label={t("settings.language")} C={C}>
          <View style={{ flexDirection: "row", backgroundColor: C.softBg, borderRadius: 12, padding: 3 }}>
            {(["my", "en"] as const).map((l) => (
              <Pressable
                key={l}
                onPress={() => {
                  Haptics.selectionAsync();
                  setLang(l);
                }}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                  borderRadius: 9,
                  backgroundColor: lang === l ? C.ink : "transparent",
                }}
              >
                <Text
                  style={{
                    fontFamily: "PlusJakartaSans_800ExtraBold",
                    fontSize: 12,
                    color: lang === l ? C.bg : C.muted,
                  }}
                >
                  {l.toUpperCase()}
                </Text>
              </Pressable>
            ))}
          </View>
        </Row>

        {/* Dark Mode */}
        <Row label="Dark Mode" C={C}>
          <Switch
            value={mode === "dark"}
            onValueChange={(v) => {
              Haptics.selectionAsync();
              setMode(v ? "dark" : "light");
            }}
            trackColor={{ true: C.primary, false: "#DDD" }}
          />
        </Row>

        {/* Toggles */}
        <Row label={t("settings.notifications")} C={C}>
          <Switch
            value={notif}
            onValueChange={(v) => {
              Haptics.selectionAsync();
              setNotif(v);
            }}
            trackColor={{ true: C.primary, false: "#DDD" }}
          />
        </Row>
        <Row label={t("settings.sound")} C={C}>
          <Switch
            value={sound}
            onValueChange={(v) => {
              Haptics.selectionAsync();
              setSound(v);
            }}
            trackColor={{ true: C.primary, false: "#DDD" }}
          />
        </Row>
        <Row label={t("settings.haptics")} C={C}>
          <Switch
            value={haptics}
            onValueChange={(v) => {
              Haptics.selectionAsync();
              setHaptics(v);
            }}
            trackColor={{ true: C.primary, false: "#DDD" }}
          />
        </Row>

        {/* Logout */}
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.replace("/");
          }}
          style={({ pressed }) => ({
            marginTop: 20,
            backgroundColor: C.card,
            borderRadius: 18,
            paddingVertical: 18,
            alignItems: "center",
            borderWidth: 2,
            borderColor: "#FFB4A2",
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Text style={{ fontFamily: "PlusJakartaSans_800ExtraBold", color: "#E8553B", fontSize: 14 }}>
            {t("settings.logout")}
          </Text>
        </Pressable>

        <Text
          style={{
            textAlign: "center",
            marginTop: 20,
            fontFamily: "PlusJakartaSans_600SemiBold",
            fontSize: 11,
            color: C.muted,
          }}
        >
          {t("settings.version")} · 1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}