import { View, Text, ScrollView, Pressable, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

const C = {
  bg: "#F8F7F2",
  primary: "#4055DC",
  secondary: "#D2F078",
  accent: "#FF8066",
  ink: "#252536",
  muted: "#8B8B9E",
  card: "#FFFFFF",
};

type Player = {
  id: string;
  name: string;
  avatar: string;
  score: number;
  isYou?: boolean;
};

// Placeholder — Firestore နဲ့ နောက်ပိုင်း ချိတ်
const WEEK: Player[] = [
  { id: "1", name: "Aung Aung", avatar: "🦊", score: 1250 },
  { id: "2", name: "Su Su", avatar: "🐬", score: 1180 },
  { id: "3", name: "Kyaw Kyaw", avatar: "🦉", score: 990 },
  { id: "4", name: "Mya Mya", avatar: "🐣", score: 870 },
  { id: "5", name: "Zin Zin", avatar: "🚀", score: 760 },
  { id: "you", name: "You", avatar: "😎", score: 620, isYou: true },
  { id: "6", name: "Thura", avatar: "🌱", score: 540 },
];

const ALL = [...WEEK].sort((a, b) => b.score - a.score);

const medal = (i: number) => (i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`);

export default function Leaderboard() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<"week" | "all">("week");
  const data = tab === "week" ? WEEK : ALL;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
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
          {/* Header */}
          <Text
            style={{
              marginTop: 20,
              fontFamily: "PlusJakartaSans_800ExtraBold",
              fontSize: isTablet ? 40 : 30,
              color: C.ink,
              letterSpacing: -1,
            }}
          >
            🏆 {t("leaderboard.title")}
          </Text>

          {/* Tab switcher */}
          <View
            style={{
              flexDirection: "row",
              backgroundColor: "#ECE9DE",
              borderRadius: 18,
              padding: 4,
              marginTop: 18,
              marginBottom: 20,
            }}
          >
            {(["week", "all"] as const).map((k) => (
              <Pressable
                key={k}
                onPress={() => {
                  Haptics.selectionAsync();
                  setTab(k);
                }}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 14,
                  backgroundColor: tab === k ? C.ink : "transparent",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontFamily: "PlusJakartaSans_800ExtraBold",
                    fontSize: 13,
                    color: tab === k ? "#FFF" : C.muted,
                  }}
                >
                  {k === "week" ? t("leaderboard.thisWeek") : t("leaderboard.allTime")}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Podium top 3 */}
          <View style={{ flexDirection: "row", justifyContent: "space-around", marginBottom: 20 }}>
            {[1, 0, 2].map((idx) => {
              const p = data[idx];
              if (!p) return null;
              const heights = [120, 150, 100];
              const h = heights[idx === 0 ? 1 : idx === 1 ? 0 : 2];
              return (
                <Animated.View
                  key={p.id}
                  entering={FadeInDown.delay(idx * 100).springify()}
                  style={{ alignItems: "center", flex: 1 }}
                >
                  <Text style={{ fontSize: idx === 0 ? 44 : 34 }}>{p.avatar}</Text>
                  <Text
                    numberOfLines={1}
                    style={{
                      fontFamily: "PlusJakartaSans_700Bold",
                      fontSize: 11,
                      color: C.ink,
                      marginTop: 4,
                    }}
                  >
                    {p.name}
                  </Text>
                  <View style={{ marginTop: 6 }}>
                    <LinearGradient
                      colors={
                        idx === 0
                          ? ["#FFE066", "#F4C430"]
                          : idx === 1
                          ? ["#E5E7EB", "#B0B3BE"]
                          : ["#FFAE9C", "#FF8066"]
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1 }}
                      style={{
                        width: idx === 0 ? 90 : 74,
                        height: h,
                        borderTopLeftRadius: 16,
                        borderTopRightRadius: 16,
                        alignItems: "center",
                        paddingTop: 12,
                      }}
                    >
                      <Text style={{ fontSize: 22 }}>{medal(idx)}</Text>
                      <Text
                        style={{
                          fontFamily: "PlusJakartaSans_800ExtraBold",
                          fontSize: 14,
                          color: C.ink,
                          marginTop: 4,
                        }}
                      >
                        {p.score}
                      </Text>
                    </LinearGradient>
                  </View>
                </Animated.View>
              );
            })}
          </View>

          {/* List */}
          <View style={{ gap: 10 }}>
            {data.slice(3).map((p, i) => (
              <Animated.View key={p.id} entering={FadeInDown.delay(300 + i * 50).springify()}>
                <View
                  style={{
                    backgroundColor: p.isYou ? C.secondary : C.card,
                    borderRadius: 18,
                    padding: 14,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 14,
                    borderWidth: p.isYou ? 2 : 1,
                    borderColor: p.isYou ? C.ink : "#E5E2D8",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "PlusJakartaSans_800ExtraBold",
                      fontSize: 16,
                      color: C.ink,
                      width: 34,
                    }}
                  >
                    {i + 4}
                  </Text>
                  <Text style={{ fontSize: 28 }}>{p.avatar}</Text>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontFamily: "PlusJakartaSans_800ExtraBold",
                        fontSize: 14,
                        color: C.ink,
                      }}
                    >
                      {p.isYou ? t("leaderboard.you") : p.name}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontFamily: "PlusJakartaSans_800ExtraBold",
                      fontSize: 15,
                      color: C.primary,
                    }}
                  >
                    {p.score}{" "}
                    <Text style={{ fontSize: 11, color: C.muted }}>{t("leaderboard.pts")}</Text>
                  </Text>
                </View>
              </Animated.View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}