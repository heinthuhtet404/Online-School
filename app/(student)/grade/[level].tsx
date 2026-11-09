import { View, Text, Pressable, ScrollView, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInDown,
} from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../lib/theme-context";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

// ===== Subjects =====
const SUBJECTS = [
  { id: "myanmar", nameKey: "subjects.myanmar", emoji: "📖", colors: ["#FFB4D8", "#EC4899"] as [string, string] },
  { id: "english", nameKey: "subjects.english", emoji: "🔤", colors: ["#8FA0FF", "#4055DC"] as [string, string] },
  { id: "math", nameKey: "subjects.math", emoji: "🔢", colors: ["#A0E7E5", "#4ECDC4"] as [string, string] },
  { id: "science", nameKey: "subjects.science", emoji: "🔬", colors: ["#C8A2FF", "#8B5CF6"] as [string, string] },
  { id: "history", nameKey: "subjects.history", emoji: "🏛️", colors: ["#FFE066", "#F4C430"] as [string, string] },
  { id: "geography", nameKey: "subjects.geography", emoji: "🌍", colors: ["#B5E8A0", "#6BBF3E"] as [string, string] },
];

const GRADE_LABELS: Record<string, string> = {
  kg: "KG",
  g1: "Grade 1",
  g2: "Grade 2",
  g3: "Grade 3",
  g4: "Grade 4",
  g5: "Grade 5",
  g6: "Grade 6",
};

function SubjectCard({
  item,
  index,
  onPress,
}: {
  item: (typeof SUBJECTS)[number];
  index: number;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View entering={FadeInDown.delay(index * 70).springify()} style={{ flex: 1 }}>
      <Pressable
        onPressIn={() => (scale.value = withSpring(0.93, { damping: 15, stiffness: 400 }))}
        onPressOut={() => (scale.value = withSpring(1, { damping: 12, stiffness: 300 }))}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onPress();
        }}
      >
        <Animated.View style={[anim]}>
          <View
            style={{
              borderRadius: 22,
              overflow: "hidden",
              shadowColor: item.colors[1],
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 14,
              elevation: 8,
            }}
          >
            <LinearGradient
              colors={item.colors}
              start={{ x: 0.1, y: 0.1 }}
              end={{ x: 0.9, y: 1 }}
              style={{
                padding: isTablet ? 22 : 18,
                minHeight: isTablet ? 150 : 130,
                justifyContent: "space-between",
              }}
            >
              <View
                style={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  backgroundColor: "rgba(255,255,255,0.3)",
                }}
              />
              <Text style={{ fontSize: isTablet ? 40 : 32 }}>{item.emoji}</Text>
              <Text
                style={{
                  fontFamily: "PlusJakartaSans_800ExtraBold",
                  fontSize: isTablet ? 20 : 17,
                  color: "#252536",
                  letterSpacing: -0.3,
                }}
              >
                {t(item.nameKey)}
              </Text>
            </LinearGradient>
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

export default function SubjectSelection() {
  const router = useRouter();
  const { t } = useTranslation();
  const { C } = useTheme();
  const { level } = useLocalSearchParams<{ level: string }>();
  const numCols = isTablet ? 3 : 2;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            paddingHorizontal: isTablet ? 48 : 24,
            maxWidth: isTablet ? 900 : undefined,
            alignSelf: "center",
            width: "100%",
          }}
        >
          {/* Top bar */}
          <View style={{ marginTop: 16, flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.back();
              }}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: C.card,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: C.border,
              }}
            >
              <Text style={{ fontSize: 20, color: C.ink }}>←</Text>
            </Pressable>
            <Text
              style={{
                fontFamily: "PlusJakartaSans_700Bold",
                fontSize: 12,
                letterSpacing: 2,
                color: C.muted,
              }}
            >
              {GRADE_LABELS[level ?? "kg"] ?? "Grade"}
            </Text>
          </View>

          {/* Headline */}
          <View style={{ marginTop: 24, marginBottom: 24 }}>
            <Text
              style={{
                fontFamily: "PlusJakartaSans_800ExtraBold",
                fontSize: isTablet ? 42 : 30,
                lineHeight: isTablet ? 48 : 38,
                color: C.ink,
                letterSpacing: -1,
              }}
            >
              {t("subjects.title")}
            </Text>
            <Text
              style={{
                fontFamily: "PlusJakartaSans_600SemiBold",
                fontSize: 14,
                color: C.muted,
                marginTop: 8,
              }}
            >
              {t("subjects.subtitle")}
            </Text>
          </View>

          {/* Subject grid */}
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
      </ScrollView>
    </SafeAreaView>
  );
}