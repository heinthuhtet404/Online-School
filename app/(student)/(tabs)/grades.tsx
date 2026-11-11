import { View, Text, Dimensions, Pressable } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInDown,
} from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import { CANDY, FONT, R, SHADOW } from "@/lib/design";
import CandyPage from "@/components/ui/CandyPage";
import CandyIconButton from "@/components/ui/CandyIconButton";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

const GRADES = [
  { id: "kg", labelKey: "grades.kg", emoji: "🌱", color: CANDY.mint },
  { id: "g1", labelKey: "grades.g1", emoji: "🐣", color: CANDY.yellow },
  { id: "g2", labelKey: "grades.g2", emoji: "🦊", color: CANDY.pink },
  { id: "g3", labelKey: "grades.g3", emoji: "🐬", color: CANDY.secondary },
  { id: "g4", labelKey: "grades.g4", emoji: "🦉", color: CANDY.primary },
  { id: "g5", labelKey: "grades.g5", emoji: "🚀", color: CANDY.pink },
  { id: "g6", labelKey: "grades.g6", emoji: "🏆", color: CANDY.yellow },
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
  const translateY = useSharedValue(0);
  const anim = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  return (
    <Animated.View entering={FadeInDown.delay(index * 60).springify()} style={{ flex: 1 }}>
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
        <Animated.View style={[anim]}>
          <View
            style={{
              backgroundColor: item.color,
              borderRadius: R.lg,
              padding: isTablet ? 22 : 18,
              minHeight: isTablet ? 150 : 130,
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
            {/* 3D highlight */}
            <View
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: "rgba(255,255,255,0.35)",
              }}
            />
            <Text style={{ fontSize: isTablet ? 44 : 36 }}>{item.emoji}</Text>
            <View>
              <Text
                style={{
                  fontFamily: FONT.extrabold,
                  fontSize: isTablet ? 22 : 18,
                  color: CANDY.text,
                  letterSpacing: -0.3,
                }}
              >
                {t(item.labelKey)}
              </Text>
              <Text
                style={{
                  fontFamily: FONT.bold,
                  fontSize: 11,
                  color: CANDY.text,
                  opacity: 0.6,
                  marginTop: 2,
                }}
              >
                {item.id.toUpperCase()}
              </Text>
            </View>
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

export default function Grades() {
  const router = useRouter();
  const { t } = useTranslation();
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
            paddingBottom: 100,
          }}
        >
          {/* Top bar */}
          <View style={{ marginTop: 16, flexDirection: "row", alignItems: "center", gap: 12 }}>
            <CandyIconButton
              emoji="←"
              onPress={() => router.back()}
              size={44}
            />
            <Text
              style={{
                fontFamily: FONT.bold,
                fontSize: 12,
                letterSpacing: 2,
                color: CANDY.textMuted,
              }}
            >
              {t("grades.selectLabel")}
            </Text>
          </View>

          {/* Headline */}
          <Animated.View entering={FadeInDown.delay(100).springify()} style={{ marginTop: 24, marginBottom: 24 }}>
            <Text
              style={{
                fontFamily: FONT.extrabold,
                fontSize: isTablet ? 48 : 34,
                lineHeight: isTablet ? 54 : 42,
                color: CANDY.text,
                letterSpacing: -1.2,
              }}
            >
              {t("grades.title1")}{"\n"}
              <Text style={{ color: CANDY.primary }}>{t("grades.title2")}</Text>
            </Text>
            <Text
              style={{
                fontFamily: FONT.semibold,
                fontSize: 14,
                color: CANDY.textMuted,
                marginTop: 10,
              }}
            >
              {t("grades.subtitle")}
            </Text>
          </Animated.View>

          {/* Grade grid */}
          <View style={{ gap: 14 }}>
            {Array.from({ length: Math.ceil(GRADES.length / numCols) }).map((_, ri) => {
              const row = GRADES.slice(ri * numCols, ri * numCols + numCols);
              return (
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
              );
            })}
          </View>
        </View>
      </CandyPage>
    </SafeAreaView>
  );
}