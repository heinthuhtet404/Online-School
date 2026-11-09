import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";

const C = {
  bg: "#F8F7F2",
  primary: "#4055DC",
  secondary: "#D2F078",
  accent: "#FF8066",
  ink: "#252536",
  muted: "#8B8B9E",
  card: "#FFFFFF",
};

type Mail = {
  id: string;
  from: string;
  subject: string;
  body: string;
  date: string;
  unread: boolean;
};

const INITIAL: Mail[] = [
  {
    id: "1",
    from: "Online School",
    subject: "🎉 ဂုဏ်ယူပါတယ်!",
    body: "သင် ဒီတစ်ပတ် Quiz ၅ ခု ပြီးမြောက်ခဲ့ပါပြီ။ ဆက်လက် ကြိုးစားပါ။",
    date: "2026-11-06",
    unread: true,
  },
  {
    id: "2",
    from: "ဆရာမ မယု",
    subject: "📚 အိမ်စာ တင်ရန်",
    body: "ဒီတစ်ပတ် အိမ်စာကို သောကြာနေ့ မတိုင်မီ တင်ပေးပါ။",
    date: "2026-11-05",
    unread: true,
  },
  {
    id: "3",
    from: "Online School",
    subject: "🏆 ထိပ်တန်း ၁၀ ဦး စာရင်း",
    body: "သင် ဒီတစ်ပတ် ထိပ်တန်း ၁၀ ဦးစာရင်းထဲ ပါဝင်ပါတယ်။",
    date: "2026-11-03",
    unread: false,
  },
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
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 32 }}>
        <Text
          style={{
            marginTop: 4,
            fontFamily: "PlusJakartaSans_800ExtraBold",
            fontSize: 30,
            color: C.ink,
            letterSpacing: -1,
          }}
        >
          📬 {t("mailbox.title")}
        </Text>

        {mails.length === 0 ? (
          <View style={{ alignItems: "center", marginTop: 80 }}>
            <Text style={{ fontSize: 64 }}>📭</Text>
            <Text style={{ fontFamily: "PlusJakartaSans_700Bold", color: C.muted, marginTop: 12 }}>
              {t("mailbox.empty")}
            </Text>
          </View>
        ) : (
          <View style={{ gap: 12, marginTop: 20 }}>
            {mails.map((m, i) => (
              <Animated.View key={m.id} entering={FadeInDown.delay(i * 60).springify()}>
                <Pressable onPress={() => toggle(m.id)}>
                  <View
                    style={{
                      backgroundColor: m.unread ? "#FFF8E0" : C.card,
                      borderRadius: 20,
                      padding: 16,
                      borderWidth: 1,
                      borderColor: m.unread ? "#F4C430" : "#E5E2D8",
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      {m.unread && (
                        <View
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: C.accent,
                          }}
                        />
                      )}
                      <Text
                        style={{
                          fontFamily: "PlusJakartaSans_800ExtraBold",
                          fontSize: 14,
                          color: C.ink,
                          flex: 1,
                        }}
                        numberOfLines={1}
                      >
                        {m.subject}
                      </Text>
                      <Text
                        style={{
                          fontFamily: "PlusJakartaSans_600SemiBold",
                          fontSize: 11,
                          color: C.muted,
                        }}
                      >
                        {m.date}
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontFamily: "PlusJakartaSans_600SemiBold",
                        fontSize: 12,
                        color: C.muted,
                        marginTop: 4,
                      }}
                    >
                      {t("mailbox.from")}: {m.from}
                    </Text>
                    {openId === m.id && (
                      <Text
                        style={{
                          fontFamily: "PlusJakartaSans_400Regular",
                          fontSize: 14,
                          color: C.ink,
                          marginTop: 12,
                          lineHeight: 22,
                        }}
                      >
                        {m.body}
                      </Text>
                    )}
                  </View>
                </Pressable>
              </Animated.View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}