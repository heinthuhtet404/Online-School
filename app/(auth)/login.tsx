import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";
import { useState } from "react";

const C = {
  bg: "#F8F7F2",
  primary: "#4055DC",
  secondary: "#D2F078",
  ink: "#252536",
  muted: "#8B8B9E",
  card: "#FFFFFF",
};

export default function Login() {
  const { t } = useTranslation();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [role, setRole] = useState<"student" | "teacher">("student");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ padding: 28, paddingBottom: 40 }}>
          {/* back */}
          <Pressable onPress={() => router.back()} style={{ marginTop: 8, width: 44, height: 44, borderRadius: 22, backgroundColor: C.card, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#E5E2D8" }}>
            <Text style={{ fontSize: 20 }}>←</Text>
          </Pressable>

          <Text
            style={{
              marginTop: 30,
              fontFamily: "PlusJakartaSans_800ExtraBold",
              fontSize: 36,
              color: C.ink,
              letterSpacing: -1.2,
            }}
          >
            {t("auth.loginTitle")} 👋
          </Text>

          {/* Role selector */}
          <Text style={{ fontFamily: "PlusJakartaSans_700Bold", fontSize: 12, color: C.muted, marginTop: 24, letterSpacing: 1.5 }}>
            {t("auth.role").toUpperCase()}
          </Text>
          <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
            {(["student", "teacher"] as const).map((r) => (
              <Pressable
                key={r}
                onPress={() => {
                  Haptics.selectionAsync();
                  setRole(r);
                }}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 16,
                  backgroundColor: role === r ? C.ink : C.card,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: role === r ? C.ink : "#E5E2D8",
                }}
              >
                <Text
                  style={{
                    fontFamily: "PlusJakartaSans_800ExtraBold",
                    color: role === r ? "#FFF" : C.ink,
                  }}
                >
                  {r === "student" ? `🎒 ${t("auth.student")}` : `👩‍🏫 ${t("auth.teacher")}`}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Inputs */}
          {[
            { key: "email", label: t("auth.email"), value: email, setValue: setEmail, keyboardType: "email-address" as const, secure: false },
            { key: "pw", label: t("auth.password"), value: pw, setValue: setPw, keyboardType: "default" as const, secure: true },
          ].map((f) => (
            <View key={f.key} style={{ marginTop: 16 }}>
              <Text style={{ fontFamily: "PlusJakartaSans_700Bold", fontSize: 12, color: C.muted, marginBottom: 6 }}>
                {f.label}
              </Text>
              <TextInput
                value={f.value}
                onChangeText={f.setValue}
                keyboardType={f.keyboardType}
                secureTextEntry={f.secure}
                autoCapitalize="none"
                placeholder={f.label}
                placeholderTextColor={C.muted}
                style={{
                  backgroundColor: C.card,
                  borderRadius: 16,
                  paddingHorizontal: 18,
                  paddingVertical: 16,
                  fontFamily: "PlusJakartaSans_600SemiBold",
                  fontSize: 15,
                  color: C.ink,
                  borderWidth: 1,
                  borderColor: "#E5E2D8",
                }}
              />
            </View>
          ))}

          {/* Login button */}
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.replace("/(student)/grades");
            }}
            style={({ pressed }) => ({
              marginTop: 28,
              borderRadius: 22,
              overflow: "hidden",
              opacity: pressed ? 0.9 : 1,
            })}
          >
            <LinearGradient
              colors={["#4055DC", "#8B5CF6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ paddingVertical: 20, alignItems: "center" }}
            >
              <Text style={{ fontFamily: "PlusJakartaSans_800ExtraBold", fontSize: 16, color: "#FFF" }}>
                {t("auth.login")} →
              </Text>
            </LinearGradient>
          </Pressable>

          {/* Switch to signup */}
          <Pressable
            onPress={() => {
              Haptics.selectionAsync();
              router.push("/(auth)/signup");
            }}
            style={{ marginTop: 20, alignItems: "center" }}
          >
            <Text style={{ fontFamily: "PlusJakartaSans_600SemiBold", fontSize: 13, color: C.muted }}>
              {t("auth.switchToSignup")}
            </Text>
          </Pressable>

          {/* Continue as guest */}
          <Pressable
            onPress={() => router.replace("/(student)/grades")}
            style={{ marginTop: 14, alignItems: "center" }}
          >
            <Text style={{ fontFamily: "PlusJakartaSans_800ExtraBold", fontSize: 13, color: C.primary }}>
              {t("auth.orGuest")} →
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}