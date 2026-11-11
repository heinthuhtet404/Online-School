import { View, Text, Dimensions, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useState, useEffect } from "react";
import { CANDY, FONT, R, SHADOW } from "@/lib/design";
import CandyCard from "@/components/ui/CandyCard";
import CandyButton from "@/components/ui/CandyButton";
import CandyIconButton from "@/components/ui/CandyIconButton";
import { LessonsStore } from "@/lib/lessons-store";
import { useMode } from "@/lib/mode-context";

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

export default function TeacherDashboard() {
  const router = useRouter();
  const { t } = useTranslation();
  const { setMode } = useMode();
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const all = LessonsStore.getAll();
    const c: Record<string, number> = {};
    SUBJECTS.forEach((s) => {
      c[s.id] = all.filter((l) => l.subject === s.id).length;
    });
    setCounts(c);
  }, []);

  const totalLessons = Object.values(counts).reduce((a, b) => a + b, 0);

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
        {/* Top bar */}
        <View
          style={{
            marginTop: 16,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View>
            <Text
              style={{
                fontFamily: FONT.bold,
                fontSize: 11,
                color: CANDY.textMuted,
                letterSpacing: 2,
              }}
            >
              TEACHER MODE
            </Text>
            <Text
              style={{
                fontFamily: FONT.extrabold,
                fontSize: isTablet ? 34 : 26,
                color: CANDY.text,
                letterSpacing: -0.8,
                marginTop: 4,
              }}
            >
              👩‍🏫 Dashboard
            </Text>
          </View>

          {/* Mode switch */}
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setMode("student");
              router.replace("/(student)/grades");
            }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderRadius: R.pill,
              backgroundColor: CANDY.surface,
              borderWidth: 2,
              borderColor: CANDY.primary,
              ...SHADOW.soft,
            }}
          >
            <Text style={{ fontSize: 16 }}>🎒</Text>
            <Text
              style={{
                fontFamily: FONT.extrabold,
                fontSize: 12,
                color: CANDY.primary,
              }}
            >
              Student
            </Text>
          </Pressable>
        </View>

        {/* Stats row */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={{ marginTop: 24 }}>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <StatCard
              label="Lessons"
              value={totalLessons.toString()}
              emoji="📚"
              color={CANDY.primary}
              C={CANDY}
            />
            <StatCard
              label="Students"
              value="—"
              emoji="🎓"
              color={CANDY.mint}
              C={CANDY}
            />
            <StatCard
              label="Quizzes"
              value="—"
              emoji="✏️"
              color={CANDY.pink}
              C={CANDY}
            />
          </View>
        </Animated.View>

        {/* Quick action */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={{ marginTop: 20 }}>
          <CandyButton
            label="သင်ခန်းစာ အသစ် ထည့်မယ်"
            icon="➕"
            color={CANDY.primary}
            size="lg"
            onPress={() => router.push("/(teacher)/lesson/editor")}
            haptic="heavy"
          />
        </Animated.View>

        {/* Subjects */}
        <Animated.View entering={FadeInDown.delay(300).springify()} style={{ marginTop: 28 }}>
          <Text
            style={{
              fontFamily: FONT.extrabold,
              fontSize: 18,
              color: CANDY.text,
              marginBottom: 14,
            }}
          >
            ဘာသာရပ်များ
          </Text>
          <View style={{ gap: 12 }}>
            {SUBJECTS.map((s, i) => (
              <Animated.View key={s.id} entering={FadeInDown.delay(350 + i * 50).springify()}>
                <CandyCard
                  onPress={() => router.push(`/(teacher)/subject/${s.id}`)}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
                    <View
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 16,
                        backgroundColor: s.color,
                        alignItems: "center",
                        justifyContent: "center",
                        borderWidth: 2,
                        borderColor: "rgba(255,255,255,0.6)",
                      }}
                    >
                      <Text style={{ fontSize: 26 }}>{s.emoji}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontFamily: FONT.extrabold,
                          fontSize: 15,
                          color: CANDY.text,
                        }}
                      >
                        {t(s.nameKey)}
                      </Text>
                      <Text
                        style={{
                          fontFamily: FONT.semibold,
                          fontSize: 12,
                          color: CANDY.textMuted,
                          marginTop: 2,
                        }}
                      >
                        {counts[s.id] ?? 0} သင်ခန်းစာ
                      </Text>
                    </View>
                    <Text style={{ fontSize: 20, color: CANDY.textMuted }}>›</Text>
                  </View>
                </CandyCard>
              </Animated.View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({
  label,
  value,
  emoji,
  color,
  C,
}: {
  label: string;
  value: string;
  emoji: string;
  color: string;
  C: any;
}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: C.surface,
        borderRadius: R.lg,
        padding: 14,
        alignItems: "flex-start",
        ...SHADOW.soft,
        borderTopWidth: 4,
        borderTopColor: color,
      }}
    >
      <Text style={{ fontSize: 22 }}>{emoji}</Text>
      <Text
        style={{
          fontFamily: FONT.extrabold,
          fontSize: 22,
          color: C.text,
          marginTop: 6,
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          fontFamily: FONT.semibold,
          fontSize: 11,
          color: C.textMuted,
          marginTop: 2,
        }}
      >
        {label}
      </Text>
    </View>
  );
}