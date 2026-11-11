import { View, Text, Dimensions, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInDown,
} from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import { CANDY, FONT, R } from "@/lib/design";
import CandyPage from "@/components/ui/CandyPage";
import CandyIconButton from "@/components/ui/CandyIconButton";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

const SUBJECTS = [
  { id: "myanmar", nameKey: "subjects.myanmar", emoji: "📖", color: CANDY.pink },
  { id: "english", nameKey: "subjects.english", emoji: "🔤", color: CANDY.primary },
  { id: "math", nameKey: "subjects.math", emoji: "🔢", color: CANDY.secondary },
  { id: "science", nameKey: "subjects.science", emoji: "🔬", color: CANDY.mint },
  { id: "history", nameKey: "subjects.history", emoji: "🏛️", color: CANDY.yellow },
  { id: "geography", nameKey: "subjects.geography", emoji: "🌍", color: "#9FE870" },
];

const GRADE_LABELS: Record<string, string> = {
  kg: "KG", g1: "Grade 1", g2: "Grade 2", g3: "Grade 3",
  g4: "Grade 4", g5: "Grade 5", g6: "Grade 6",
};

function SubjectCard({ item, index, onPress }: any) {
  const { t } = useTranslation();
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const anim = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  return (
    <Animated.View entering={FadeInDown.delay(index * 70).springify()} style={{ flex: 1 }}>
      <Pressable
        onPressIn={() => {
          scale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
          translateY.value = withSpring(3, { damping: 15, stiffness: 400 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 12, stiffness: 300 });
          translateY.value = withSpring(0, { damping: 12, stiffness: 300 });
        }}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onPress();
        }}
      >
        <Animated.View style={anim}>
          <View
            style={{
              backgroundColor: item.color,
              borderRadius: R.lg,
              padding: isTablet ? 22 : 18,
              minHeight: isTablet ? 145 : 125,
              justifyContent: "space-between",
              shadowColor: item.color,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.4,
              shadowRadius: 14,
              elevation: 8,
              borderWidth: 3,
              borderColor: "rgba(255,255,255,0.4)",
            }}
          >
            <View
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: "rgba(255,255,255,0.35)",
              }}
            />
            <Text style={{ fontSize: isTablet ? 40 : 32 }}>{item.emoji}</Text>
            <Text
              style={{
                fontFamily: FONT.extrabold,
                fontSize: isTablet ? 18 : 15,
                color: CANDY.text,
                letterSpacing: -0.2,
              }}
            >
              {t(item.nameKey)}
            </Text>
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

export default function SubjectSelection() {
  const router = useRouter();
  const { t } = useTranslation();
  const { level } = useLocalSearchParams<{ level: string }>();
  const numCols = isTablet ? 3 : 2;

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
          <View style={{ marginTop: 16, flexDirection: "row", alignItems: "center", gap: 12 }}>
            <CandyIconButton emoji="←" onPress={() => router.back()} size={44} />
            <Text
              style={{
                fontFamily: FONT.bold,
                fontSize: 12,
                letterSpacing: 2,
                color: CANDY.textMuted,
              }}
            >
              {GRADE_LABELS[level ?? "kg"] ?? "Grade"}
            </Text>
          </View>

          <Animated.View entering={FadeInDown.delay(100).springify()} style={{ marginTop: 24, marginBottom: 24 }}>
            <Text
              style={{
                fontFamily: FONT.extrabold,
                fontSize: isTablet ? 42 : 30,
                lineHeight: isTablet ? 48 : 38,
                color: CANDY.text,
                letterSpacing: -1,
              }}
            >
              {t("subjects.title")}
            </Text>
            <Text
              style={{
                fontFamily: FONT.semibold,
                fontSize: 14,
                color: CANDY.textMuted,
                marginTop: 8,
              }}
            >
              {t("subjects.subtitle")}
            </Text>
          </Animated.View>

          <View style={{ gap: 14 }}>
            {Array.from({ length: Math.ceil(SUBJECTS.length / numCols) }).map((_, ri) => {
              const row = SUBJECTS.slice(ri * numCols, ri * numCols + numCols);
              return (
                <View key={ri} style={{ flexDirection: "row", gap: 14 }}>
                  {row.map((item, i) => (
                    <SubjectCard
                      key={item.id}
                      item={item}
                      index={ri * numCols + i}
                      onPress={() =>
                        router.push(`/(student)/subject/${level}/${item.id}`)
                      }
                    />
                  ))}
                  {row.length < numCols &&
                    Array.from({ length: numCols - row.length }).map((_, k) => (
                      <View key={k} style={{ flex: 1 }} />
                    ))}
                </View>
              );
            })}
          </View>
        </View>
      </CandyPage>
    </SafeAreaView>
  );
}