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
import { useTheme } from "../../../../lib/theme-context";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

const SUBJECT_META: Record<
  string,
  { nameKey: string; emoji: string; colors: [string, string] }
> = {
  myanmar: { nameKey: "subjects.myanmar", emoji: "📖", colors: ["#FFB4D8", "#EC4899"] },
  english: { nameKey: "subjects.english", emoji: "🔤", colors: ["#8FA0FF", "#4055DC"] },
  math: { nameKey: "subjects.math", emoji: "🔢", colors: ["#A0E7E5", "#4ECDC4"] },
  science: { nameKey: "subjects.science", emoji: "🔬", colors: ["#C8A2FF", "#8B5CF6"] },
  history: { nameKey: "subjects.history", emoji: "🏛️", colors: ["#FFE066", "#F4C430"] },
  geography: { nameKey: "subjects.geography", emoji: "🌍", colors: ["#B5E8A0", "#6BBF3E"] },
};

const LESSONS = Array.from({ length: 10 }, (_, i) => ({
  id: `l${i + 1}`,
  num: i + 1,
  title: `သင်ခန်းစာ ${i + 1}`,
  subtitle: [
    "အခြေခံ မိတ်ဆက်",
    "အဓိက သဘောတရား",
    "ဥပမာများ",
    "လေ့ကျင့်ခန်း",
    "ပြန်လည်သုံးသပ်ခြင်း",
    "အဆင့်မြင့် အကြောင်းအရာ",
    "လက်တွေ့ ဥပမာ",
    "စမ်းသပ်မေးခွန်း",
    "အကျဉ်းချုပ်",
    "အပိုဆောင်း လေ့ကျင့်ခန်း",
  ][i],
  done: i < 3,
}));

function LessonCard({
  item,
  index,
  onPress,
  C,
}: {
  item: (typeof LESSONS)[number];
  index: number;
  onPress: () => void;
  C: any;
}) {
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
      <Pressable
        onPressIn={() => (scale.value = withSpring(0.97, { damping: 15, stiffness: 400 }))}
        onPressOut={() => (scale.value = withSpring(1, { damping: 12, stiffness: 300 }))}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }}
      >
        <Animated.View style={anim}>
          <View
            style={{
              backgroundColor: C.card,
              borderRadius: 18,
              padding: 14,
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
              borderWidth: 1,
              borderColor: C.border,
            }}
          >
            <View
              style={{
                width: 46,
                height: 46,
                borderRadius: 14,
                backgroundColor: item.done ? "#D2F078" : C.softBg,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontFamily: "PlusJakartaSans_800ExtraBold",
                  fontSize: 17,
                  color: item.done ? "#252536" : C.muted,
                }}
              >
                {item.done ? "✓" : item.num}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: "PlusJakartaSans_800ExtraBold",
                  fontSize: 14,
                  color: C.ink,
                }}
              >
                {item.title}
              </Text>
              <Text
                style={{
                  fontFamily: "PlusJakartaSans_600SemiBold",
                  fontSize: 12,
                  color: C.muted,
                  marginTop: 2,
                }}
              >
                {item.subtitle}
              </Text>
            </View>
            <Text style={{ fontSize: 18, color: C.muted }}>›</Text>
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

export default function SubjectLessons() {
  const router = useRouter();
  const { t } = useTranslation();
  const { C } = useTheme();
  const { level, subject } = useLocalSearchParams<{ level: string; subject: string }>();
  const meta = SUBJECT_META[subject ?? "math"] ?? SUBJECT_META.math;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={meta.colors}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={{
            paddingHorizontal: isTablet ? 48 : 24,
            paddingTop: 16,
            paddingBottom: 28,
            borderBottomLeftRadius: 28,
            borderBottomRightRadius: 28,
          }}
        >
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: "rgba(255,255,255,0.6)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 20, color: "#252536" }}>←</Text>
          </Pressable>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 14, marginTop: 18 }}>
            <Text style={{ fontSize: isTablet ? 60 : 48 }}>{meta.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: "PlusJakartaSans_800ExtraBold",
                  fontSize: isTablet ? 36 : 26,
                  color: "#252536",
                  letterSpacing: -0.8,
                }}
              >
                {t(meta.nameKey)}
              </Text>
              <Text
                style={{
                  fontFamily: "PlusJakartaSans_600SemiBold",
                  fontSize: 13,
                  color: "#252536",
                  opacity: 0.7,
                  marginTop: 2,
                }}
              >
                {level?.toUpperCase()} · 10 သင်ခန်းစာ
              </Text>
            </View>
          </View>
        </LinearGradient>

        <View
          style={{
            paddingHorizontal: isTablet ? 48 : 24,
            marginTop: 20,
            maxWidth: isTablet ? 900 : undefined,
            alignSelf: "center",
            width: "100%",
            gap: 10,
          }}
        >
          {LESSONS.map((l, i) => (
            <LessonCard
              key={l.id}
              item={l}
              index={i}
              C={C}
              onPress={() =>
                router.push(`/(student)/lesson/${level}/${subject}/${l.id}`)
              }
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}