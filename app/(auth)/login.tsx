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
import CandyCard from "@/components/ui/CandyCard";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

export default function Login() {
  const { t } = useTranslation();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [role, setRole] = useState<"student" | "teacher">("student");

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
              <Text style={{ fontSize: isTablet ? 56 : 44 }}>👋</Text>
              <View
                style={{
                  backgroundColor: CANDY.mint,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: R.pill,
                  borderWidth: 2,
                  borderColor: "rgba(255,255,255,0.5)",
                }}
              >
                <Text style={{ fontFamily: FONT.extrabold, fontSize: 11, color: CANDY.text }}>
                  WELCOME BACK
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
              {t("auth.loginTitle")}
            </Text>
            <Text
              style={{
                fontFamily: FONT.semibold,
                fontSize: 14,
                color: CANDY.textMuted,
                marginTop: 8,
              }}
            >
              သင့်အကောင့်ထဲ ပြန်ဝင်ရန်
            </Text>
          </Animated.View>

          {/* Role selector */}
          <Animated.View entering={FadeInDown.delay(200).springify()} style={{ marginTop: 28 }}>
            <Text
              style={{
                fontFamily: FONT.extrabold,
                fontSize: 11,
                color: CANDY.textMuted,
                letterSpacing: 1.5,
                marginBottom: 10,
              }}
            >
              {t("auth.role").toUpperCase()}
            </Text>
            <View style={{ flexDirection: "row", gap: 12 }}>
              {(["student", "teacher"] as const).map((r) => {
                const active = role === r;
                return (
                  <Pressable
                    key={r}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setRole(r);
                    }}
                    style={{ flex: 1 }}
                  >
                    <View
                      style={{
                        paddingVertical: 16,
                        borderRadius: R.lg,
                        backgroundColor: active ? CANDY.primary : CANDY.surface,
                        alignItems: "center",
                        borderWidth: 3,
                        borderColor: active ? CANDY.primaryDark : "rgba(255,255,255,0.8)",
                        ...(active ? SHADOW.soft : {}),
                      }}
                    >
                      <Text style={{ fontSize: 24 }}>{r === "student" ? "🎒" : "👩‍🏫"}</Text>
                      <Text
                        style={{
                          fontFamily: FONT.extrabold,
                          fontSize: 13,
                          color: active ? "#FFF" : CANDY.text,
                          marginTop: 4,
                        }}
                      >
                        {r === "student" ? t("auth.student") : t("auth.teacher")}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </Animated.View>

          {/* Inputs */}
          <Animated.View entering={FadeInDown.delay(300).springify()} style={{ marginTop: 20 }}>
            {[
              { key: "email", label: t("auth.email"), value: email, setValue: setEmail, secure: false, icon: "✉️", keyboardType: "email-address" as const },
              { key: "pw", label: t("auth.password"), value: pw, setValue: setPw, secure: true, icon: "🔒", keyboardType: "default" as const },
            ].map((f) => (
              <View key={f.key} style={{ marginBottom: 16 }}>
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
                    keyboardType={f.keyboardType}
                    secureTextEntry={f.secure}
                    autoCapitalize="none"
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

          {/* Login button */}
          <Animated.View entering={FadeInDown.delay(400).springify()}>
            <CandyButton
              label={t("auth.login")}
              icon="→"
              size="lg"
              color={CANDY.primary}
              onPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                router.replace("/(student)/grades");
              }}
              haptic="heavy"
              style={{ marginTop: 8 }}
            />
          </Animated.View>

          {/* Switch to signup */}
          <Pressable
            onPress={() => {
              Haptics.selectionAsync();
              router.push("/(auth)/signup");
            }}
            style={{ marginTop: 20, alignItems: "center" }}
          >
            <Text
              style={{
                fontFamily: FONT.semibold,
                fontSize: 13,
                color: CANDY.textMuted,
              }}
            >
              {t("auth.switchToSignup")}
            </Text>
          </Pressable>

          {/* Divider */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              marginTop: 24,
              marginBottom: 16,
            }}
          >
            <View style={{ flex: 1, height: 1, backgroundColor: CANDY.border }} />
            <Text style={{ fontFamily: FONT.bold, fontSize: 11, color: CANDY.textMuted }}>
              OR
            </Text>
            <View style={{ flex: 1, height: 1, backgroundColor: CANDY.border }} />
          </View>

          {/* Guest button */}
          <CandyButton
            label={t("auth.orGuest")}
            icon="🚀"
            color={CANDY.yellow}
            textColor={CANDY.text}
            onPress={() => router.replace("/(student)/grades")}
            haptic="medium"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}