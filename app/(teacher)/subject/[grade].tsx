import { View, Text, Dimensions, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { CANDY, FONT, R } from "@/lib/design";
import CandyCard from "@/components/ui/CandyCard";
import CandyIconButton from "@/components/ui/CandyIconButton";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

// ဘာသာရပ်စာရင်း
const SUBJECTS = [
  { id: "myanmar", name: "မြန်မာစာ", emoji: "📖", color: CANDY.pink },
  { id: "english", name: "အင်္ဂလိပ်", emoji: "🔤", color: CANDY.primary },
  { id: "math", name: "သင်္ချာ", emoji: "🔢", color: CANDY.secondary },
  { id: "science", name: "သိပ္ပံ", emoji: "🔬", color: CANDY.mint },
  { id: "history", name: "သမိုင်း", emoji: "🏛️", color: CANDY.yellow },
  { id: "geography", name: "ပထဝီ", emoji: "🌍", color: "#9FE870" },
];

export default function TeacherSubjects() {
  const router = useRouter();
  const { grade } = useLocalSearchParams<{ grade: string }>();
  const numCols = isTablet ? 3 : 2;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: CANDY.bg }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: isTablet ? 48 : 24,
          paddingBottom: 40,
          maxWidth: isTablet ? 900 : undefined,
          alignSelf: "center",
          width: "100%",
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ marginTop: 16 }}>
          <CandyIconButton emoji="←" onPress={() => router.back()} size={44} />
        </View>

        <Animated.View entering={FadeInDown.delay(100).springify()} style={{ marginTop: 20, marginBottom: 20 }}>
          <Text style={{ fontFamily: FONT.extrabold, fontSize: isTablet ? 42 : 30, color: CANDY.text, letterSpacing: -1 }}>
            ဘာသာရပ် ရွေးပါ
          </Text>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: CANDY.textMuted, marginTop: 8 }}>
            အတန်း - {grade?.toUpperCase()} အတွက် သင်ခန်းစာများ စီမံရန်
          </Text>
        </Animated.View>

        <View style={{ gap: 14 }}>
          {Array.from({ length: Math.ceil(SUBJECTS.length / numCols) }).map((_, ri) => {
            const row = SUBJECTS.slice(ri * numCols, ri * numCols + numCols);
            return (
              <View key={ri} style={{ flexDirection: "row", gap: 14 }}>
                {row.map((item, i) => (
                  <Animated.View key={item.id} entering={FadeInDown.delay(150 + i * 50).springify()} style={{ flex: 1 }}>
                    <CandyCard
                      bg={item.color}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        // သင်ခန်းစာစာရင်း စာမျက်နှာကို သွားမယ် (subject နဲ့ grade ပါသွားမယ်)
                        router.push(`/(teacher)/subject/${grade}/${item.id}`);
                      }}
                      style={{ minHeight: isTablet ? 145 : 125, justifyContent: "space-between" }}
                    >
                      <View style={{ position: "absolute", top: 10, right: 10, width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.35)" }} />
                      <Text style={{ fontSize: isTablet ? 40 : 32 }}>{item.emoji}</Text>
                      <Text style={{ fontFamily: FONT.extrabold, fontSize: isTablet ? 18 : 15, color: CANDY.text, letterSpacing: -0.2 }}>
                        {item.name}
                      </Text>
                    </CandyCard>
                  </Animated.View>
                ))}
                {row.length < numCols && Array.from({ length: numCols - row.length }).map((_, k) => <View key={k} style={{ flex: 1 }} />)}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}