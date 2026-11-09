import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";
import { useState } from "react";

const C = {
  bg: "#F8F7F2", primary: "#4055DC", secondary: "#D2F078", ink: "#252536", muted: "#8B8B9E", card: "#FFFFFF",
};

const GRADES = ["KG", "G1", "G2", "G3", "G4", "G5", "G6"];

export default function Signup() {
  const { t } = useTranslation();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [cpw, setCpw] = useState("");
  const [grade, setGrade] = useState("G1");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 28, paddingBottom: 40 }}>
          <Pressable onPress={() => router.back()} style={{ marginTop: 8, width: 44, height: 44, borderRadius: 22, backgroundColor: C.card, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#E5E2D8" }}>
            <Text style={{ fontSize: 20 }}>←</Text>
          </Pressable>

          <Text style={{ marginTop: 30, fontFamily: "PlusJakartaSans_800ExtraBold", fontSize: 34, color: C.ink, letterSpacing: -1.2 }}>
            {t("auth.signupTitle")} ✨
          </Text>

          {/* Name */}
          {[
            { label: t("auth.name"), value: name, setValue: setName, secure: false },
            { label: t("auth.email"), value: email, setValue: setEmail, secure: false },
            { label: t("auth.password"), value: pw, setValue: setPw, secure: true },
            { label: t("auth.confirmPassword"), value: cpw, setValue: setCpw, secure: true },
          ].map((f) => (
            <View key={f.label} style={{ marginTop: 14 }}>
              <Text style={{ fontFamily: "PlusJakartaSans_700Bold", fontSize: 12, color: C.muted, marginBottom: 6 }}>
                {f.label}
              </Text>
              <TextInput
                value={f.value}
                onChangeText={f.setValue}
                secureTextEntry={f.secure}
                autoCapitalize="none"
                placeholder={f.label}
                placeholderTextColor={C.muted}
                style={{
                  backgroundColor: C.card, borderRadius: 16, paddingHorizontal: 18, paddingVertical: 16,
                  fontFamily: "PlusJakartaSans_600SemiBold", fontSize: 15, color: C.ink,
                  borderWidth: 1, borderColor: "#E5E2D8",
                }}
              />
            </View>
          ))}

          {/* Grade picker */}
          <Text style={{ fontFamily: "PlusJakartaSans_700Bold", fontSize: 12, color: C.muted, marginTop: 20, marginBottom: 8 }}>
            {t("auth.grade")}
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {GRADES.map((g) => (
              <Pressable
                key={g}
                onPress={() => {
                  Haptics.selectionAsync();
                  setGrade(g);
                }}
                style={{
                  paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14,
                  backgroundColor: grade === g ? C.ink : C.card,
                  borderWidth: 1, borderColor: grade === g ? C.ink : "#E5E2D8",
                }}
              >
                <Text style={{ fontFamily: "PlusJakartaSans_800ExtraBold", fontSize: 12, color: grade === g ? "#FFF" : C.ink }}>
                  {g}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              router.replace("/(student)/grades");
            }}
            style={({ pressed }) => ({ marginTop: 28, borderRadius: 22, overflow: "hidden", opacity: pressed ? 0.9 : 1 })}
          >
            <LinearGradient colors={["#4055DC", "#8B5CF6"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ paddingVertical: 20, alignItems: "center" }}>
              <Text style={{ fontFamily: "PlusJakartaSans_800ExtraBold", fontSize: 16, color: "#FFF" }}>
                {t("auth.signup")} →
              </Text>
            </LinearGradient>
          </Pressable>

          <Pressable onPress={() => router.push("/(auth)/login")} style={{ marginTop: 20, alignItems: "center" }}>
            <Text style={{ fontFamily: "PlusJakartaSans_600SemiBold", fontSize: 13, color: C.muted }}>
              {t("auth.switchToLogin")}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}