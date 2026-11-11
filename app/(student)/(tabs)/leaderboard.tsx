import { View, Text, Dimensions, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { CANDY, FONT, R, SHADOW } from "@/lib/design";
import CandyPage from "@/components/ui/CandyPage";
import CandyCard from "@/components/ui/CandyCard";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

type Player = { id: string; name: string; avatar: string; score: number; isYou?: boolean };

const WEEK: Player[] = [
  { id: "1", name: "Aung Aung", avatar: "🦊", score: 1250 },
  { id: "2", name: "Su Su", avatar: "🐬", score: 1180 },
  { id: "3", name: "Kyaw Kyaw", avatar: "🦉", score: 990 },
  { id: "4", name: "Mya Mya", avatar: "🐣", score: 870 },
  { id: "5", name: "Zin Zin", avatar: "🚀", score: 760 },
  { id: "you", name: "You", avatar: "😎", score: 620, isYou: true },
  { id: "6", name: "Thura", avatar: "🌱", score: 540 },
];

const medal = (i: number) => (i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`);
const podiumColor = (i: number) => (i === 0 ? CANDY.yellow : i === 1 ? "#C8C8DC" : "#E0A87C");

export default function Leaderboard() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<"week" | "all">("week");
  const data = tab === "week" ? WEEK : [...WEEK].sort((a, b) => b.score - a.score);

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
          <Text
            style={{
              marginTop: 20,
              fontFamily: FONT.extrabold,
              fontSize: isTablet ? 40 : 30,
              color: CANDY.text,
              letterSpacing: -1,
            }}
          >
            🏆 {t("leaderboard.title")}
          </Text>

          {/* Tab switcher */}
          <View
            style={{
              flexDirection: "row",
              backgroundColor: CANDY.surface,
              borderRadius: R.xl,
              padding: 5,
              marginTop: 20,
              marginBottom: 24,
              ...SHADOW.soft,
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
                  borderRadius: R.lg,
                  backgroundColor: tab === k ? CANDY.primary : "transparent",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontFamily: FONT.extrabold,
                    fontSize: 13,
                    color: tab === k ? "#FFF" : CANDY.textMuted,
                  }}
                >
                  {k === "week" ? t("leaderboard.thisWeek") : t("leaderboard.allTime")}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Podium */}
          <View style={{ flexDirection: "row", justifyContent: "space-around", marginBottom: 24, alignItems: "flex-end" }}>
            {[1, 0, 2].map((idx) => {
              const p = data[idx];
              if (!p) return null;
              const h = idx === 0 ? 130 : idx === 1 ? 100 : 85;
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
                      fontFamily: FONT.bold,
                      fontSize: 11,
                      color: CANDY.text,
                      marginTop: 6,
                      marginBottom: 4,
                    }}
                  >
                    {p.name}
                  </Text>
                  <View
                    style={{
                      width: idx === 0 ? 90 : 74,
                      height: h,
                      borderTopLeftRadius: R.lg,
                      borderTopRightRadius: R.lg,
                      backgroundColor: podiumColor(idx === 0 ? 0 : idx === 1 ? 1 : 2),
                      alignItems: "center",
                      paddingTop: 12,
                      shadowColor: podiumColor(idx === 0 ? 0 : idx === 1 ? 1 : 2),
                      shadowOffset: { width: 0, height: 8 },
                      shadowOpacity: 0.4,
                      shadowRadius: 14,
                      elevation: 8,
                      borderWidth: 3,
                      borderColor: "rgba(255,255,255,0.4)",
                    }}
                  >
                    <Text style={{ fontSize: 22 }}>{medal(idx)}</Text>
                    <Text
                      style={{
                        fontFamily: FONT.extrabold,
                        fontSize: 14,
                        color: CANDY.text,
                        marginTop: 4,
                      }}
                    >
                      {p.score}
                    </Text>
                  </View>
                </Animated.View>
              );
            })}
          </View>

          {/* List */}
          <View style={{ gap: 10 }}>
            {data.slice(3).map((p, i) => (
              <Animated.View key={p.id} entering={FadeInDown.delay(300 + i * 50).springify()}>
                <CandyCard bg={p.isYou ? CANDY.yellow : CANDY.surface}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
                    <Text
                      style={{
                        fontFamily: FONT.extrabold,
                        fontSize: 16,
                        color: CANDY.text,
                        width: 34,
                      }}
                    >
                      {i + 4}
                    </Text>
                    <Text style={{ fontSize: 28 }}>{p.avatar}</Text>
                    <Text
                      style={{
                        flex: 1,
                        fontFamily: FONT.extrabold,
                        fontSize: 14,
                        color: CANDY.text,
                      }}
                    >
                      {p.isYou ? t("leaderboard.you") : p.name}
                    </Text>
                    <Text
                      style={{
                        fontFamily: FONT.extrabold,
                        fontSize: 15,
                        color: CANDY.primary,
                      }}
                    >
                      {p.score}{" "}
                      <Text style={{ fontSize: 11, color: CANDY.textMuted }}>
                        {t("leaderboard.pts")}
                      </Text>
                    </Text>
                  </View>
                </CandyCard>
              </Animated.View>
            ))}
          </View>
        </View>
      </CandyPage>
    </SafeAreaView>
  );
}