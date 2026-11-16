import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { LinearGradient } from "expo-linear-gradient";
import { FONT } from "@/lib/design";
import * as Haptics from "expo-haptics";

const PAL = {
  bg: "#F0F5F8", bgTop: "#D4E8E6", bgBottom: "#EDE9F5",
  primary: "#2C7A7B", primaryDark: "#1E5C5D",
  accent: "#9F7AEA", ink: "#1E2A38", muted: "#5C6B7A", divider: "#D8E2E8",
  danger: "#C2402B",
};

export default function TeacherSettings() {
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert("Logout", "ထွက်မှာ သေချာလား?", [
      { text: "မထွက်ဘူး", style: "cancel" },
      {
        text: "ထွက်မယ်",
        style: "destructive",
        onPress: async () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          await signOut(auth);
          router.replace("/");
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: PAL.bg }}>
      <LinearGradient colors={[PAL.bgTop, PAL.bg, PAL.bgBottom]} locations={[0, 0.5, 1]} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} />
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
        <Text style={{ fontFamily: FONT.extrabold, fontSize: 28, color: PAL.ink, marginTop: 16 }}>
          ⚙️ ဆက်တင်
        </Text>

        <Pressable
          onPress={handleLogout}
          style={{
            marginTop: 24,
            backgroundColor: "#FFF",
            borderRadius: 16,
            padding: 20,
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            borderWidth: 1.5,
            borderColor: PAL.danger + "40",
          }}
        >
          <Text style={{ fontSize: 22 }}>🚪</Text>
          <Text style={{ fontFamily: FONT.extrabold, fontSize: 15, color: PAL.danger }}>
            ထွက်မယ်
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}