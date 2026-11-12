import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform, Dimensions, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import { useState } from "react";
import { FONT } from "@/lib/design";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

// Teacher Palette
const PAL = {
  bg: "#F0F5F8", bgTop: "#D4E8E6", bgBottom: "#EDE9F5",
  primary: "#2C7A7B", primaryDark: "#1E5C5D",
  accent: "#9F7AEA", accentDark: "#7C5CC7",
  text: "#1E2A38", textMuted: "#5C6B7A", divider: "#D8E2E8",
};

function MinimalInput({ label, icon, value, onChangeText, secure = false, keyboardType = "default", focused, onFocus, onBlur }: any) {
  return (
    <View style={{ marginBottom: 18 }}>
      <Text style={{ fontFamily: FONT.extrabold, fontSize: 11, color: focused ? PAL.primary : PAL.textMuted, letterSpacing: 1.2, marginBottom: 6, marginLeft: 2 }}>{label.toUpperCase()}</Text>
      <View style={{ flexDirection: "row", alignItems: "center", borderBottomWidth: focused ? 2.5 : 1.5, borderBottomColor: focused ? PAL.primary : PAL.divider, paddingBottom: 6 }}>
        <Text style={{ fontSize: 16, marginRight: 8, opacity: focused ? 1 : 0.6 }}>{icon}</Text>
        <TextInput value={value} onChangeText={onChangeText} secureTextEntry={secure} autoCapitalize="none" keyboardType={keyboardType} placeholder={label} placeholderTextColor={PAL.textMuted + "80"} onFocus={onFocus} onBlur={onBlur} style={{ flex: 1, paddingVertical: 6, fontFamily: FONT.semibold, fontSize: 16, color: PAL.text }} />
      </View>
    </View>
  );
}

export default function TeacherLogin() {
  const { t } = useTranslation();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [focusField, setFocusField] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !pw) {
      Alert.alert("Error", "အီးမေးလ်နဲ့ စကားဝှက် ထည့်ပါ။");
      return;
    }
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pw);
      const user = userCredential.user;
      const docSnap = await getDoc(doc(db, "users", user.uid));
      
      if (docSnap.exists() && docSnap.data().role === "teacher") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace("/(teacher)/dashboard");
      } else {
        Alert.alert("ဝင်ရောက်မရပါ", "ဤအကောင့်သည် ဆရာ/မအကောင့် မဟုတ်ပါ။");
      }
    } catch (error: any) {
      Alert.alert("ဝင်ရောက်မရပါ", "အီးမေးလ် သို့မဟုတ် စကားဝှက် မှားနေပါသည်။");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: PAL.bg }}>
      <LinearGradient colors={[PAL.bgTop, PAL.bg, PAL.bgBottom]} locations={[0, 0.5, 1]} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} />
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ paddingHorizontal: isTablet ? 48 : 24, paddingBottom: 40, paddingTop: 8, maxWidth: isTablet ? 600 : undefined, alignSelf: "center", width: "100%" }} showsVerticalScrollIndicator={false}>
            <Pressable onPress={() => { Haptics.selectionAsync(); router.back(); }} style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
              <Text style={{ fontSize: 22, color: PAL.text }}>←</Text>
            </Pressable>

            <Animated.View entering={FadeInDown.delay(100).springify()}>
              <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: PAL.primary + '20', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Text style={{ fontSize: 32 }}>👩‍🏫</Text>
              </View>
              <Text style={{ fontFamily: FONT.extrabold, fontSize: isTablet ? 38 : 30, color: PAL.text, letterSpacing: -1, lineHeight: isTablet ? 44 : 36 }}>{t("auth.teacherLogin")}</Text>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: PAL.textMuted, marginTop: 6 }}>သင့်ရဲ့ ဆရာ/မ အကောင့်ထဲ ဝင်ရောက်ပါ</Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(200).springify()} style={{ marginTop: 26 }}>
              <MinimalInput label={t("auth.email")} icon="✉️" value={email} onChangeText={setEmail} keyboardType="email-address" focused={focusField === "email"} onFocus={() => setFocusField("email")} onBlur={() => setFocusField(null)} />
              <MinimalInput label={t("auth.password")} icon="🔒" value={pw} onChangeText={setPw} secure focused={focusField === "pw"} onFocus={() => setFocusField("pw")} onBlur={() => setFocusField(null)} />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(300).springify()}>
              <Pressable onPress={handleLogin} disabled={loading} style={{ backgroundColor: PAL.primaryDark, borderRadius: 999, paddingVertical: 16, alignItems: "center", justifyContent: "center", marginTop: 8, flexDirection: "row", gap: 8, opacity: loading ? 0.7 : 1 }}>
                <Text style={{ fontFamily: FONT.extrabold, fontSize: 16, color: "#FFFFFF", letterSpacing: 0.3 }}>{loading ? "ဝင်ရောက်နေသည်..." : t("auth.login")}</Text>
                <Text style={{ fontSize: 16, color: "#FFFFFF" }}>→</Text>
              </Pressable>
            </Animated.View>

            <Animated.View entering={FadeIn.delay(400)} style={{ marginTop: 24 }}>
              <View style={{ backgroundColor: "rgba(255, 217, 61, 0.15)", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "rgba(255, 217, 61, 0.3)", flexDirection: "row", gap: 12 }}>
                <Text style={{ fontSize: 20 }}>💡</Text>
                <Text style={{ flex: 1, fontFamily: FONT.semibold, fontSize: 13, color: PAL.text, lineHeight: 20 }}>{t("auth.teacherNotice")}</Text>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}