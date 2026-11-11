import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useState } from "react";
import { CANDY, FONT, R, SHADOW } from "@/lib/design";
import CandyButton from "@/components/ui/CandyButton";
import CandyIconButton from "@/components/ui/CandyIconButton";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

const GRADES = ["KG", "G1", "G2", "G3", "G4", "G5", "G6"];

const GRADE_COLORS = [CANDY.mint, CANDY.yellow, CANDY.pink, CANDY.secondary, CANDY.primary, CANDY.pink, CANDY.yellow];

export default function Signup() {
  const { t } = useTranslation();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [cpw, setCpw] = useState("");
  const [grade, setGrade] = useState("G1");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: CANDY.bg }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: isTablet ? 48 : 24,
            paddingBottom: 40,
            paddingTop: 16,
            maxWidth: isTablet ? 600 : undefined,
            alignSelf: "center",
            width: "100%",
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Back */}
          <View style={{ marginBottom: 24 }}>
            <CandyIconButton emoji="←" onPress={() => router.back()} size={44} />
          </View>

          {/* Hero */}
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <Text style={{ fontSize: isTablet ? 56 : 44 }}>✨</Text>
              <View
                style={{
                  backgroundColor: CANDY.pink,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: R.pill,
                  borderWidth: 2,
                  borderColor: "rgba(255,255,255,0.5)",
                }}
              >
                <Text style={{ fontFamily: FONT.extrabold, fontSize: 11, color: CANDY.text }}>
                  NEW HERE?
                </Text>
              </View>
            </View>
            <Text
              style={{
                fontFamily: FONT.extrabold,
                fontSize: isTablet ? 40 : 32,
                color: CANDY.text,
                letterSpacing: -1,
                lineHeight: isTablet ? 46 : 38,
              }}
            >
              {t("auth.signupTitle")}
            </Text>
            <Text
              style={{
                fontFamily: FONT.semibold,
                fontSize: 14,
                color: CANDY.textMuted,
                marginTop: 8,
              }}
            >
              သင့်အကောင့်အသစ်ကို ဖန်တီးပါ
            </Text>
          </Animated.View>

          {/* Inputs */}
          <Animated.View entering={FadeInDown.delay(200).springify()} style={{ marginTop: 28 }}>
            {[
              { key: "name", label: t("auth.name"), value: name, setValue: setName, secure: false, icon: "👤", keyboardType: "default" as const },
              { key: "email", label: t("auth.email"), value: email, setValue: setEmail, secure: false, icon: "✉️", keyboardType: "email-address" as const },
              { key: "pw", label: t("auth.password"), value: pw, setValue: setPw, secure: true, icon: "🔒", keyboardType: "default" as const },
              { key: "cpw", label: t("auth.confirmPassword"), value: cpw, setValue: setCpw, secure: true, icon: "🔐", keyboardType: "default" as const },
            ].map((f) => (
              <View key={f.key} style={{ marginBottom: 14 }}>
                <Text
                  style={{
                    fontFamily: FONT.bold,
                    fontSize: 12,
                    color: CANDY.textMuted,
                    marginBottom: 8,
                    marginLeft: 4,
                  }}
                >
                  {f.label}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: CANDY.surface,
                    borderRadius: R.lg,
                    paddingHorizontal: 16,
                    borderWidth: 2,
                    borderColor: CANDY.border,
                    ...SHADOW.soft,
                  }}
                >
                  <Text style={{ fontSize: 18, marginRight: 10 }}>{f.icon}</Text>
                  <TextInput
                    value={f.value}
                    onChangeText={f.setValue}
                    secureTextEntry={f.secure}
                    autoCapitalize="none"
                    keyboardType={f.keyboardType}
                    placeholder={f.label}
                    placeholderTextColor={CANDY.textMuted}
                    style={{
                      flex: 1,
                      paddingVertical: 16,
                      fontFamily: FONT.semibold,
                      fontSize: 15,
                      color: CANDY.text,
                    }}
                  />
                </View>
              </View>
            ))}
          </Animated.View>

          {/* Grade picker */}
          <Animated.View entering={FadeInDown.delay(300).springify()} style={{ marginTop: 8 }}>
            <Text
              style={{
                fontFamily: FONT.extrabold,
                fontSize: 12,
                color: CANDY.textMuted,
                letterSpacing: 1,
                marginBottom: 10,
                marginLeft: 4,
              }}
            >
              {t("auth.grade").toUpperCase()}
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              {GRADES.map((g, i) => {
                const active = grade === g;
                return (
                  <Pressable
                    key={g}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setGrade(g);
                    }}
                    style={{
                      paddingHorizontal: 18,
                      paddingVertical: 12,
                      borderRadius: R.md,
                      backgroundColor: active ? CANDY.primary : CANDY.surface,
                      borderWidth: 3,
                      borderColor: active ? CANDY.primaryDark : GRADE_COLORS[i] + "55",
                      ...(active ? SHADOW.soft : {}),
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: FONT.extrabold,
                        fontSize: 13,
                        color: active ? "#FFF" : CANDY.text,
                      }}
                    >
                      {g}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Animated.View>

          {/* Signup button */}
          <Animated.View entering={FadeInDown.delay(400).springify()} style={{ marginTop: 28 }}>
            <CandyButton
              label={t("auth.signup")}
              icon="→"
              size="lg"
              color={CANDY.primary}
              onPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                router.replace("/(student)/grades");
              }}
              haptic="heavy"
            />
          </Animated.View>

          {/* Switch to login */}
          <Pressable
            onPress={() => router.push("/(auth)/login")}
            style={{ marginTop: 20, alignItems: "center" }}
          >
            <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: CANDY.textMuted }}>
              {t("auth.switchToLogin")}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}