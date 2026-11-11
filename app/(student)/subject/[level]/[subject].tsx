import { View, Text, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import { CANDY, FONT, R } from "@/lib/design";
import CandyPage from "@/components/ui/CandyPage";
import CandyCard from "@/components/ui/CandyCard";
import CandyIconButton from "@/components/ui/CandyIconButton";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

const SUBJECT_META: Record<string, { nameKey: string; emoji: string; color: string }> = {
  myanmar: { nameKey: "subjects.myanmar", emoji: "📖", color: CANDY.pink },
  english: { nameKey: "subjects.english", emoji: "🔤", color: CANDY.primary },
  math: { nameKey: "subjects.math", emoji: "🔢", color: CANDY.secondary },
  science: { nameKey: "subjects.science", emoji: "🔬", color: CANDY.mint },
  history: { nameKey: "subjects.history", emoji: "🏛️", color: CANDY.yellow },
  geography: { nameKey: "subjects.geography", emoji: "🌍", color: "#9FE870" },
};

const LESSONS = Array.from({ length: 10 }, (_, i) => ({
  id: `l${i + 1}`,
  num: i + 1,
  title: `သင်ခန်းစာ ${i + 1}`,
  subtitle: [
    "အခြေခံ မိတ်ဆက်", "အဓိက သဘောတရား", "ဥပမာများ", "လေ့ကျင့်ခန်း",
    "ပြန်လည်သုံးသပ်ခြင်း", "အဆင့်မြင့်", "လက်တွေ့ ဥပမာ",
    "စမ်းသပ်မေးခွန်း", "အကျဉ်းချုပ်", "အပိုဆောင်း",
  ][i],
  done: i < 3,
}));

export default function SubjectLessons() {
  const router = useRouter();
  const { t } = useTranslation();
  const { level, subject } = useLocalSearchParams<{ level: string; subject: string }>();
  const meta = SUBJECT_META[subject ?? "math"] ?? SUBJECT_META.math;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: CANDY.bg }}>
      <CandyPage>
        <View
          style={{
            paddingHorizontal: isTablet ? 48 : 24,
            maxWidth: isTablet ? 900 : undefined,
            alignSelf: "center",
            width: "100%",
          }}
        >
          {/* Header */}
          <View style={{ marginTop: 16, flexDirection: "row", alignItems: "center", gap: 12 }}>
            <CandyIconButton emoji="←" onPress={() => router.back()} size={44} />
          </View>

          {/* Subject hero card */}
          <Animated.View entering={FadeInDown.delay(100).springify()} style={{ marginTop: 20 }}>
            <View
              style={{
                backgroundColor: meta.color,
                borderRadius: R.xl,
                padding: 22,
                flexDirection: "row",
                alignItems: "center",
                gap: 16,
                shadowColor: meta.color,
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.4,
                shadowRadius: 18,
                elevation: 10,
                borderWidth: 3,
                borderColor: "rgba(255,255,255,0.4)",
              }}
            >
              <Text style={{ fontSize: isTablet ? 60 : 48 }}>{meta.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: FONT.extrabold,
                    fontSize: isTablet ? 32 : 24,
                    color: CANDY.text,
                    letterSpacing: -0.6,
                  }}
                >
                  {t(meta.nameKey)}
                </Text>
                <Text
                  style={{
                    fontFamily: FONT.semibold,
                    fontSize: 13,
                    color: CANDY.text,
                    opacity: 0.7,
                    marginTop: 2,
                  }}
                >
                  {level?.toUpperCase()} · 10 သင်ခန်းစာ
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Lesson list */}
          <View style={{ gap: 12, marginTop: 22 }}>
            {LESSONS.map((l, i) => (
              <Animated.View key={l.id} entering={FadeInDown.delay(200 + i * 50).springify()}>
                <CandyCard
                  onPress={() =>
                    router.push(`/(student)/lesson/${level}/${subject}/${l.id}`)
                  }
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
                    <View
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 16,
                        backgroundColor: l.done ? CANDY.mint : CANDY.primarySoft,
                        alignItems: "center",
                        justifyContent: "center",
                        borderWidth: 2,
                        borderColor: "rgba(255,255,255,0.6)",
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: FONT.extrabold,
                          fontSize: 18,
                          color: l.done ? "#FFF" : CANDY.primary,
                        }}
                      >
                        {l.done ? "✓" : l.num}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontFamily: FONT.extrabold,
                          fontSize: 14,
                          color: CANDY.text,
                        }}
                      >
                        {l.title}
                      </Text>
                      <Text
                        style={{
                          fontFamily: FONT.semibold,
                          fontSize: 12,
                          color: CANDY.textMuted,
                          marginTop: 2,
                        }}
                      >
                        {l.subtitle}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 18, color: CANDY.textMuted }}>›</Text>
                  </View>
                </CandyCard>
              </Animated.View>
            ))}
          </View>
        </View>
      </CandyPage>
    </SafeAreaView>
  );
}