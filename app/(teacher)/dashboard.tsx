import { View, Text, Dimensions, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { CANDY, FONT, R } from "@/lib/design";
import CandyCard from "@/components/ui/CandyCard";
import CandyIconButton from "@/components/ui/CandyIconButton";
import { useMode } from "@/lib/mode-context";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

// အတန်းစာရင်း
const GRADES = [
  { id: "kg", label: "KG", emoji: "🌱", color: CANDY.mint },
  { id: "g1", label: "Grade 1", emoji: "🐣", color: CANDY.yellow },
  { id: "g2", label: "Grade 2", emoji: "🦊", color: CANDY.pink },
  { id: "g3", label: "Grade 3", emoji: "🐬", color: CANDY.secondary },
  { id: "g4", label: "Grade 4", emoji: "🦉", color: CANDY.primary },
  { id: "g5", label: "Grade 5", emoji: "🚀", color: CANDY.pink },
  { id: "g6", label: "Grade 6", emoji: "🏆", color: CANDY.yellow },
];

export default function TeacherDashboard() {
  const router = useRouter();
  const { setMode } = useMode();
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
        {/* Top Bar */}
        <View style={{ marginTop: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View>
            <Text style={{ fontFamily: FONT.bold, fontSize: 11, color: CANDY.textMuted, letterSpacing: 2 }}>
              TEACHER MODE
            </Text>
            <Text style={{ fontFamily: FONT.extrabold, fontSize: isTablet ? 34 : 26, color: CANDY.text, letterSpacing: -0.8, marginTop: 4 }}>
              👩‍🏫 အတန်းရွေးပါ
            </Text>
          </View>

          {/* Mode switch back to Student */}
          <CandyIconButton
            emoji="🎒"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setMode("student");
              router.replace("/(student)/grades");
            }}
            size={44}
            bg={CANDY.surface}
          />
        </View>

        {/* Grade Grid */}
        <View style={{ gap: 14, marginTop: 24 }}>
          {Array.from({ length: Math.ceil(GRADES.length / numCols) }).map((_, ri) => {
            const row = GRADES.slice(ri * numCols, ri * numCols + numCols);
            return (
              <View key={ri} style={{ flexDirection: "row", gap: 14 }}>
                {row.map((item, i) => (
                  <Animated.View key={item.id} entering={FadeInDown.delay(ri * numCols * 50 + i * 50).springify()} style={{ flex: 1 }}>
                    <CandyCard
                      bg={item.color}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        router.push(`/(teacher)/subject/${item.id}`);
                      }}
                      style={{ minHeight: isTablet ? 150 : 130, justifyContent: "space-between" }}
                    >
                      <View style={{ position: "absolute", top: 10, right: 10, width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.35)" }} />
                      <Text style={{ fontSize: isTablet ? 44 : 36 }}>{item.emoji}</Text>
                      <View>
                        <Text style={{ fontFamily: FONT.extrabold, fontSize: isTablet ? 22 : 18, color: CANDY.text, letterSpacing: -0.3 }}>
                          {item.label}
                        </Text>
                      </View>
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