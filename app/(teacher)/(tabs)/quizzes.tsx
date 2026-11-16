import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { FONT } from "@/lib/design";

const PAL = {
  bg: "#F0F5F8", bgTop: "#D4E8E6", bgBottom: "#EDE9F5",
  primary: "#2C7A7B", primaryDark: "#1E5C5D",
  accent: "#9F7AEA", accentDark: "#7C5CC7",
  ink: "#1E2A38", muted: "#5C6B7A", divider: "#D8E2E8",
};

export default function TeacherQuizzes() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: PAL.bg }}>
      <LinearGradient colors={[PAL.bgTop, PAL.bg, PAL.bgBottom]} locations={[0, 0.5, 1]} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} />
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
        <Text style={{ fontFamily: FONT.extrabold, fontSize: 28, color: PAL.ink, marginTop: 16 }}>
          ✏️ Quizzes
        </Text>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: PAL.muted, marginTop: 6, marginBottom: 24 }}>
          Quiz စီမံခန့်ခွဲခြင်း
        </Text>

        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            // နောက်ပိုင်း Quiz Editor
          }}
          style={{
            backgroundColor: PAL.primary,
            borderRadius: 16,
            padding: 20,
            alignItems: "center",
            flexDirection: "row",
            gap: 12,
          }}
        >
          <Text style={{ fontSize: 24 }}>➕</Text>
          <Text style={{ fontFamily: FONT.extrabold, fontSize: 15, color: "#FFF" }}>
            Quiz အသစ် ထည့်မယ်
          </Text>
        </Pressable>

        <View style={{ marginTop: 24, alignItems: "center", padding: 32 }}>
          <Text style={{ fontSize: 56 }}>📝</Text>
          <Text style={{ fontFamily: FONT.extrabold, fontSize: 16, color: PAL.ink, marginTop: 12 }}>
            Quiz မရှိသေးပါ
          </Text>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: PAL.muted, marginTop: 6, textAlign: "center" }}>
            ပထမဆုံး Quiz ကို စတင်ပါ
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}