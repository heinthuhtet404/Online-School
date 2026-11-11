import { View, Text, Dimensions, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { CANDY, FONT, R } from "@/lib/design";
import CandyPage from "@/components/ui/CandyPage";
import CandyCard from "@/components/ui/CandyCard";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

type Mail = {
  id: string; from: string; subject: string; body: string; date: string; unread: boolean;
};

const INITIAL: Mail[] = [
  { id: "1", from: "Online School", subject: "🎉 ဂုဏ်ယူပါတယ်!", body: "သင် ဒီတစ်ပတ် Quiz ၅ ခု ပြီးမြောက်ခဲ့ပါပြီ။ ဆက်လက် ကြိုးစားပါ။", date: "2026-11-06", unread: true },
  { id: "2", from: "ဆရာမ မယု", subject: "📚 အိမ်စာ တင်ရန်", body: "ဒီတစ်ပတ် အိမ်စာကို သောကြာနေ့ မတိုင်မီ တင်ပေးပါ။", date: "2026-11-05", unread: true },
  { id: "3", from: "Online School", subject: "🏆 ထိပ်တန်း ၁၀ ဦး", body: "သင် ဒီတစ်ပတ် ထိပ်တန်း ၁၀ ဦးစာရင်းထဲ ပါဝင်ပါတယ်။", date: "2026-11-03", unread: false },
];

export default function Mailbox() {
  const { t } = useTranslation();
  const [mails, setMails] = useState(INITIAL);
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => {
    Haptics.selectionAsync();
    setOpenId(openId === id ? null : id);
    setMails((prev) => prev.map((m) => (m.id === id ? { ...m, unread: false } : m)));
  };

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
            📬 {t("mailbox.title")}
          </Text>

          {mails.length === 0 ? (
            <View style={{ alignItems: "center", marginTop: 80 }}>
              <Text style={{ fontSize: 64 }}>📭</Text>
              <Text style={{ fontFamily: FONT.bold, color: CANDY.textMuted, marginTop: 12 }}>
                {t("mailbox.empty")}
              </Text>
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              {mails.map((m, i) => (
                <Animated.View key={m.id} entering={FadeInDown.delay(i * 60).springify()}>
                  <CandyCard bg={m.unread ? "#FFF8E0" : CANDY.surface} onPress={() => toggle(m.id)}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      {m.unread && (
                        <View
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: 5,
                            backgroundColor: CANDY.pink,
                          }}
                        />
                      )}
                      <Text
                        style={{
                          flex: 1,
                          fontFamily: FONT.extrabold,
                          fontSize: 14,
                          color: CANDY.text,
                        }}
                        numberOfLines={1}
                      >
                        {m.subject}
                      </Text>
                      <Text
                        style={{
                          fontFamily: FONT.semibold,
                          fontSize: 11,
                          color: CANDY.textMuted,
                        }}
                      >
                        {m.date}
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontFamily: FONT.semibold,
                        fontSize: 12,
                        color: CANDY.textMuted,
                        marginTop: 6,
                      }}
                    >
                      {t("mailbox.from")}: {m.from}
                    </Text>
                    {openId === m.id && (
                      <Text
                        style={{
                          fontFamily: FONT.regular,
                          fontSize: 14,
                          color: CANDY.text,
                          marginTop: 12,
                          lineHeight: 22,
                          opacity: 0.8,
                        }}
                      >
                        {m.body}
                      </Text>
                    )}
                  </CandyCard>
                </Animated.View>
              ))}
            </View>
          )}
        </View>
      </CandyPage>
    </SafeAreaView>
  );
}