import { View, Text, Pressable, ScrollView, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInDown,
} from "react-native-reanimated";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../lib/theme-context"; // ← path ပြင်ထား

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

// Grade data — KG + Grade 1–6
const GRADES = [
  { id: "kg", labelKey: "grades.kg", emoji: "🌱", colors: ["#E8FFA8", "#D2F078"] as [string, string] },
  { id: "g1", labelKey: "grades.g1", emoji: "🐣", colors: ["#8FA0FF", "#4055DC"] as [string, string] },
  { id: "g2", labelKey: "grades.g2", emoji: "🦊", colors: ["#FFAE9C", "#FF8066"] as [string, string] },
  { id: "g3", labelKey: "grades.g3", emoji: "🐬", colors: ["#A0E7E5", "#4ECDC4"] as [string, string] },
  { id: "g4", labelKey: "grades.g4", emoji: "🦉", colors: ["#FFE066", "#F4C430"] as [string, string] },
  { id: "g5", labelKey: "grades.g5", emoji: "🚀", colors: ["#C8A2FF", "#8B5CF6"] as [string, string] },
  { id: "g6", labelKey: "grades.g6", emoji: "🏆", colors: ["#FFB4D8", "#EC4899"] as [string, string] },
];

function GradeCard({
  item,
  index,
  onPress,
}: {
  item: (typeof GRADES)[number];
  index: number;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View entering={FadeInDown.delay(index * 60).springify()} style={{ flex: 1 }}>
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
              borderRadius: 24,
              overflow: "hidden",
              shadowColor: item.colors[1],
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.35,
              shadowRadius: 18,
              elevation: 10,
            }}
          >
            <LinearGradient
              colors={item.colors}
              start={{ x: 0.1, y: 0.1 }}
              end={{ x: 0.9, y: 1 }}
              style={{
                padding: isTablet ? 24 : 18,
                minHeight: isTablet ? 160 : 140,
                justifyContent: "space-between",
              }}
            >
              <View
                style={{
                  position: "absolute",
                  top: 10,
                  right: 12,
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: "rgba(255,255,255,0.35)",
                }}
              />
              <Text style={{ fontSize: isTablet ? 44 : 36 }}>{item.emoji}</Text>
              <View>
                <Text
                  style={{
                    fontFamily: "PlusJakartaSans_800ExtraBold",
                    fontSize: isTablet ? 24 : 20,
                    color: "#252536",
                    letterSpacing: -0.5,
                  }}
                >
                  {t(item.labelKey)}
                </Text>
                <Text
                  style={{
                    fontFamily: "PlusJakartaSans_600SemiBold",
                    fontSize: 12,
                    color: "#252536",
                    opacity: 0.65,
                    marginTop: 2,
                  }}
                >
                  {item.id.toUpperCase()}
                </Text>
              </View>
            </LinearGradient>
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

export default function Grades() {
  const router = useRouter();
  const { t } = useTranslation();
  const { C } = useTheme();
  const numCols = isTablet ? 3 : 2;

  const rows = useMemo(() => {
    const r: (typeof GRADES)[] = [];
    for (let i = 0; i < GRADES.length; i += numCols) r.push(GRADES.slice(i, i + numCols));
    return r;
  }, [numCols]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            paddingHorizontal: isTablet ? 48 : 28,
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
              {t("grades.selectLabel")}
            </Text>
          </View>

          {/* Headline */}
          <View style={{ marginTop: 24, marginBottom: 24 }}>
            <Text
              style={{
                fontFamily: "PlusJakartaSans_800ExtraBold",
                fontSize: isTablet ? 48 : 36,
                lineHeight: isTablet ? 54 : 42,
                color: C.ink,
                letterSpacing: -1.2,
              }}
            >
              {t("grades.title1")}{"\n"}
              <Text style={{ color: C.primary }}>{t("grades.title2")}</Text>
            </Text>
            <Text
              style={{
                fontFamily: "PlusJakartaSans_600SemiBold",
                fontSize: 14,
                color: C.muted,
                marginTop: 10,
              }}
            >
              {t("grades.subtitle")}
            </Text>
          </View>

          {/* Grade grid */}
          <View style={{ gap: 14 }}>
            {rows.map((row, ri) => (
              <View key={ri} style={{ flexDirection: "row", gap: 14 }}>
                {row.map((item, i) => (
                  <GradeCard
                    key={item.id}
                    item={item}
                    index={ri * numCols + i}
                    onPress={() => router.push(`/(student)/grade/${item.id}`)}
                  />
                ))}
                {row.length < numCols &&
                  Array.from({ length: numCols - row.length }).map((_, k) => (
                    <View key={k} style={{ flex: 1 }} />
                  ))}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}