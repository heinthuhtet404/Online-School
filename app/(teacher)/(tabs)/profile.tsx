import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/lib/auth-context";
import { LinearGradient } from "expo-linear-gradient";
import { FONT } from "@/lib/design";

const PAL = {
  bg: "#F0F5F8", bgTop: "#D4E8E6", bgBottom: "#EDE9F5",
  primary: "#2C7A7B", primaryDark: "#1E5C5D",
  accent: "#9F7AEA", accentDark: "#7C5CC7",  // ✅ ထည့်
  ink: "#1E2A38", muted: "#5C6B7A", divider: "#D8E2E8",
};

export default function TeacherProfile() {
  const { userData } = useAuth();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: PAL.bg }}>
      <LinearGradient colors={[PAL.bgTop, PAL.bg, PAL.bgBottom]} locations={[0, 0.5, 1]} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} />
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
        <Text style={{ fontFamily: FONT.extrabold, fontSize: 28, color: PAL.ink, marginTop: 16 }}>
          👤 ကိုယ်ရေး
        </Text>

        <View style={{ marginTop: 24, backgroundColor: "#FFF", borderRadius: 20, padding: 24, alignItems: "center" }}>
          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: PAL.primary + "20", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
            <Text style={{ fontSize: 40 }}>👩‍🏫</Text>
          </View>
          <Text style={{ fontFamily: FONT.extrabold, fontSize: 22, color: PAL.ink }}>
            {userData?.name || "Teacher"}
          </Text>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: PAL.muted, marginTop: 4 }}>
            {userData?.email}
          </Text>
          <View style={{ marginTop: 12, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999, backgroundColor: PAL.accent + "30" }}>
            <Text style={{ fontFamily: FONT.extrabold, fontSize: 11, color: PAL.accentDark }}>
              👩‍🏫 TEACHER
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}