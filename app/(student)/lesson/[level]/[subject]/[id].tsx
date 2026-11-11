import { View, Text, Dimensions, Pressable, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useState, useCallback } from "react";
import { CANDY, FONT, R, SHADOW } from "@/lib/design";
import CandyCard from "@/components/ui/CandyCard";
import CandyButton from "@/components/ui/CandyButton";
import CandyIconButton from "@/components/ui/CandyIconButton";
import { LessonsStore, Lesson } from "@/lib/lessons-store";

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

export default function SubjectLessons() {
  const router = useRouter();
  const { t } = useTranslation();
  const { subject } = useLocalSearchParams<{ subject: string }>();
  const meta = SUBJECT_META[subject ?? "math"] ?? SUBJECT_META.math;
  const [lessons, setLessons] = useState<Lesson[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (subject) setLessons(LessonsStore.getBySubject(subject));
    }, [subject])
  );

  const handleDelete = (lesson: Lesson) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      "သင်ခန်းစာ ဖျက်မလား?",
      `"${lesson.title}" ကို ဖျက်တော့မယ်။ ပြန်မရနိုင်ပါ။`,
      [
        { text: "မဖျက်ဘူး", style: "cancel" },
        {
          text: "ဖျက်မယ်",
          style: "destructive",
          onPress: () => {
            LessonsStore.delete(lesson.id);
            if (subject) setLessons(LessonsStore.getBySubject(subject));
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

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
        {/* Back */}
        <View style={{ marginTop: 16 }}>
          <CandyIconButton emoji="←" onPress={() => router.back()} size={44} />
        </View>

        {/* Hero */}
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
                  fontSize: isTablet ? 30 : 22,
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
                {lessons.length} သင်ခန်းစာ
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Add lesson */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={{ marginTop: 16 }}>
          <CandyButton
            label="သင်ခန်းစာ အသစ် ထည့်မယ်"
            icon="➕"
            color={CANDY.primary}
            onPress={() =>
              router.push(`/(teacher)/lesson/editor?subject=${subject}`)
            }
            haptic="medium"
          />
        </Animated.View>

        {/* Lesson list */}
        <View style={{ gap: 12, marginTop: 20 }}>
          {lessons.length === 0 ? (
            <View style={{ alignItems: "center", marginTop: 40, padding: 24 }}>
              <Text style={{ fontSize: 64 }}>📭</Text>
              <Text
                style={{
                  fontFamily: FONT.extrabold,
                  fontSize: 16,
                  color: CANDY.text,
                  marginTop: 16,
                }}
              >
                သင်ခန်းစာ မရှိသေးပါ
              </Text>
              <Text
                style={{
                  fontFamily: FONT.semibold,
                  fontSize: 13,
                  color: CANDY.textMuted,
                  marginTop: 6,
                  textAlign: "center",
                }}
              >
                အပေါ်က "သင်ခန်းစာ အသစ် ထည့်မယ်" ကို နှိပ်ပါ
              </Text>
            </View>
          ) : (
            lessons.map((l, i) => (
              <Animated.View key={l.id} entering={FadeInDown.delay(250 + i * 50).springify()}>
                <CandyCard bg={CANDY.surface}>
                  <View>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                      <View
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 14,
                          backgroundColor: CANDY.primarySoft,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: FONT.extrabold,
                            fontSize: 16,
                            color: CANDY.primary,
                          }}
                        >
                          {l.order}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontFamily: FONT.extrabold,
                            fontSize: 14,
                            color: CANDY.text,
                          }}
                          numberOfLines={1}
                        >
                          {l.title}
                        </Text>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 6,
                            marginTop: 4,
                          }}
                        >
                          <View
                            style={{
                              paddingHorizontal: 8,
                              paddingVertical: 2,
                              borderRadius: 8,
                              backgroundColor: l.published ? CANDY.mint : CANDY.yellow,
                            }}
                          >
                            <Text
                              style={{
                                fontFamily: FONT.extrabold,
                                fontSize: 9,
                                color: CANDY.text,
                              }}
                            >
                              {l.published ? "PUBLISHED" : "DRAFT"}
                            </Text>
                          </View>
                          <Text
                            style={{
                              fontFamily: FONT.semibold,
                              fontSize: 10,
                              color: CANDY.textMuted,
                            }}
                          >
                            {l.updatedAt}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Action buttons */}
                    <View
                      style={{
                        flexDirection: "row",
                        gap: 8,
                        marginTop: 12,
                        paddingTop: 12,
                        borderTopWidth: 1,
                        borderTopColor: CANDY.border,
                      }}
                    >
                      <Pressable
                        onPress={() => {
                          Haptics.selectionAsync();
                          router.push(`/(teacher)/lesson/editor?id=${l.id}`);
                        }}
                        style={{
                          flex: 1,
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 4,
                          paddingVertical: 8,
                          borderRadius: R.md,
                          backgroundColor: CANDY.primarySoft,
                        }}
                      >
                        <Text style={{ fontSize: 14 }}>✏️</Text>
                        <Text
                          style={{
                            fontFamily: FONT.extrabold,
                            fontSize: 11,
                            color: CANDY.primary,
                          }}
                        >
                          ပြင်
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => handleDelete(l)}
                        style={{
                          flex: 1,
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 4,
                          paddingVertical: 8,
                          borderRadius: R.md,
                          backgroundColor: "#FFE0E6",
                        }}
                      >
                        <Text style={{ fontSize: 14 }}>🗑️</Text>
                        <Text
                          style={{
                            fontFamily: FONT.extrabold,
                            fontSize: 11,
                            color: "#C2402B",
                          }}
                        >
                          ဖျက်
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                </CandyCard>
              </Animated.View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}