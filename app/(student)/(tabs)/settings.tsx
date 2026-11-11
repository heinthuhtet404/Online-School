import { View, Text, Switch, Dimensions, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useLang } from "@/lib/language-context";
import { useRouter } from "expo-router";
import { useState } from "react";
import * as Haptics from "expo-haptics";
import { CANDY, FONT, R } from "@/lib/design";
import CandyPage from "@/components/ui/CandyPage";
import CandyCard from "@/components/ui/CandyCard";
import CandyButton from "@/components/ui/CandyButton";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

export default function Settings() {
  const { t } = useTranslation();
  const { lang, setLang } = useLang();
  const router = useRouter();
  const [notif, setNotif] = useState(true);
  const [sound, setSound] = useState(true);
  const [haptics, setHaptics] = useState(true);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: CANDY.bg }}>
      <CandyPage>
        <View
          style={{
            paddingHorizontal: isTablet ? 48 : 24,
            maxWidth: isTablet ? 900 : undefined,
            alignSelf: "center",
            width: "100%",
            paddingBottom: 100,
          }}
        >
          <Text
            style={{
              marginTop: 20,
              fontFamily: FONT.extrabold,
              fontSize: isTablet ? 40 : 30,
              color: CANDY.text,
              letterSpacing: -1,
              marginBottom: 20,
            }}
          >
            ⚙️ {t("settings.title")}
          </Text>

          {/* Language */}
          <CandyCard style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: CANDY.text }}>
                {t("settings.language")}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  backgroundColor: CANDY.primarySoft,
                  borderRadius: R.md,
                  padding: 3,
                }}
              >
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
                      borderRadius: R.sm,
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
                  </Pressable>
                ))}
              </View>
            </View>
          </CandyCard>

          {/* Toggles */}
          {[
            { label: t("settings.notifications"), value: notif, set: setNotif },
            { label: t("settings.sound"), value: sound, set: setSound },
            { label: t("settings.haptics"), value: haptics, set: setHaptics },
          ].map((row, i) => (
            <CandyCard key={i} style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: CANDY.text }}>
                  {row.label}
                </Text>
                <Switch
                  value={row.value}
                  onValueChange={(v) => {
                    Haptics.selectionAsync();
                    row.set(v);
                  }}
                  trackColor={{ true: CANDY.primary, false: "#DDD" }}
                  thumbColor="#FFF"
                />
              </View>
            </CandyCard>
          ))}

          <CandyButton
            label={t("settings.logout")}
            icon="🚪"
            color={CANDY.pink}
            onPress={() => router.replace("/")}
            style={{ marginTop: 20 }}
          />

          <Text
            style={{
              textAlign: "center",
              marginTop: 20,
              fontFamily: FONT.semibold,
              fontSize: 11,
              color: CANDY.textMuted,
            }}
          >
            {t("settings.version")} · 1.0.0
          </Text>
        </View>
      </CandyPage>
    </SafeAreaView>
  );
}