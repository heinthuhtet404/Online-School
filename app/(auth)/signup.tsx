import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeIn, useSharedValue, useAnimatedStyle, withSpring, withRepeat, withTiming, withSequence, withDelay, Easing, interpolate } from "react-native-reanimated";
import { useEffect, useState, useRef } from "react";
import { FONT } from "@/lib/design";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;
const GRADES = ["KG", "G1", "G2", "G3", "G4", "G5", "G6"];

const PAL = {
  bg: "#FFF8F0", bgTop: "#FFE8D6", bgBottom: "#E8F4FF", primary: "#FF6B6B", primaryDark: "#E05050", secondary: "#4ECDC4", secondaryDark: "#3BA89F", accent: "#FFD93D", accentDark: "#E5C020", text: "#2D2422", textMuted: "#7A6A63", divider: "#EDE3D8",
};

type Mood = "idle" | "happy" | "excited" | "thinking" | "wave";

function Pip({ mood = "idle", size = 80, prop }: { mood?: Mood; size?: number; prop?: string }) {
  // ... (Login ထဲက Pip component အတိုင်း ထားပါ)
  const bob = useSharedValue(0);
  const blink = useSharedValue(1);
  const propScale = useSharedValue(0);

  useEffect(() => {
    bob.value = withRepeat(withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.ease) }), -1, true);
    blink.value = withRepeat(withSequence(withTiming(0.1, { duration: 100 }), withTiming(1, { duration: 200 }), withDelay(2800, withTiming(1, { duration: 100 }))), -1, false);
  }, []);

  useEffect(() => {
    if (prop) {
      propScale.value = 0;
      propScale.value = withSpring(1, { damping: 12, stiffness: 300 });
    } else {
      propScale.value = withTiming(0, { duration: 200 });
    }
  }, [prop]);

  const bodyAnim = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(bob.value, [0, 1], [0, -5]) }, { rotate: mood === "excited" ? `${interpolate(bob.value, [0, 1], [-4, 4])}deg` : "0deg" }],
  }));
  const eyeAnim = useAnimatedStyle(() => ({ transform: [{ scaleY: blink.value }] }));
  const propAnim = useAnimatedStyle(() => ({ transform: [{ scale: propScale.value }], opacity: propScale.value }));

  return (
    <Animated.View style={[bodyAnim, { width: size, height: size * 1.25 }]}>
      <View style={{ position: "absolute", bottom: 0, left: size * 0.32, width: size * 0.36, height: size * 0.32, alignItems: "center" }}>
        <LinearGradient colors={[PAL.accent, "#FFB84D", "rgba(255,184,77,0)"]} locations={[0, 0.5, 1]} style={{ width: size * 0.28, height: size * 0.3, borderTopLeftRadius: size * 0.14, borderTopRightRadius: size * 0.14, borderBottomLeftRadius: size * 0.03, borderBottomRightRadius: size * 0.03 }} />
      </View>
      <View style={{ position: "absolute", bottom: size * 0.3, left: size * 0.04, width: size * 0.16, height: size * 0.3, backgroundColor: PAL.primaryDark, borderTopLeftRadius: size * 0.09, borderBottomLeftRadius: size * 0.15, transform: [{ rotate: "-14deg" }] }} />
      <View style={{ position: "absolute", bottom: size * 0.3, right: size * 0.04, width: size * 0.16, height: size * 0.3, backgroundColor: PAL.primaryDark, borderTopRightRadius: size * 0.09, borderBottomRightRadius: size * 0.15, transform: [{ rotate: "14deg" }] }} />
      <View style={{ position: "absolute", bottom: size * 0.15, left: size * 0.18, width: size * 0.64, height: size * 0.82, borderRadius: size * 0.32, backgroundColor: PAL.primary, borderWidth: 2.5, borderColor: PAL.primaryDark }}>
        <View style={{ position: "absolute", top: size * 0.14, left: size * 0.05, right: size * 0.05, bottom: size * 0.05, borderRadius: size * 0.25, backgroundColor: "#FFF5F0", borderWidth: 2, borderColor: PAL.primaryDark }}>
          <View style={{ flexDirection: "row", justifyContent: "center", gap: size * 0.13, marginTop: size * 0.12 }}>
            {[0, 1].map((i) => (
              <Animated.View key={i} style={[eyeAnim, { width: size * 0.08, height: size * 0.11, borderRadius: size * 0.04, backgroundColor: "#2D2422", alignItems: "center", justifyContent: "flex-start" }]}>
                <View style={{ width: size * 0.03, height: size * 0.03, borderRadius: size * 0.015, backgroundColor: "#FFFFFF", marginTop: size * 0.02, marginLeft: size * 0.025 }} />
              </Animated.View>
            ))}
          </View>
          <View style={{ alignSelf: "center", marginTop: size * 0.05, width: mood === "excited" ? size * 0.13 : size * 0.09, height: mood === "excited" ? size * 0.09 : size * 0.05, borderBottomLeftRadius: size * 0.06, borderBottomRightRadius: size * 0.06, backgroundColor: "#2D2422", overflow: "hidden" }}>
            <View style={{ position: "absolute", bottom: 0, left: "25%", right: "25%", height: "45%", backgroundColor: "#FF6B8A", borderTopLeftRadius: size * 0.02, borderTopRightRadius: size * 0.02 }} />
          </View>
        </View>
        <View style={{ position: "absolute", top: -size * 0.05, alignSelf: "center", width: size * 0.2, height: size * 0.2, borderRadius: size * 0.1, backgroundColor: PAL.secondary, borderWidth: 2, borderColor: PAL.secondaryDark }} />
      </View>
      {prop && (
        <Animated.View style={[propAnim, { position: "absolute", bottom: 0, right: -size * 0.1, width: size * 0.4, height: size * 0.4, borderRadius: size * 0.2, backgroundColor: "#FFFFFF", borderWidth: 2.5, borderColor: PAL.primaryDark, alignItems: "center", justifyContent: "center" }]}>
          <Text style={{ fontSize: size * 0.2 }}>{prop}</Text>
        </Animated.View>
      )}
    </Animated.View>
  );
}

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

export default function Signup() {
  const { t } = useTranslation();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState(""); // ⭐ ဖုန်းနံပါတ် အတွက် state
  const [pw, setPw] = useState("");
  const [cpw, setCpw] = useState("");
  const [grade, setGrade] = useState("G1");
  const [focusField, setFocusField] = useState<string | null>(null);
  const [mood, setMood] = useState<Mood>("idle");
  const [message, setMessage] = useState("Let's create your account! ✨");
  const [loading, setLoading] = useState(false);
  const resetTimer = useRef<any>(null);

  const react = (newMood: Mood, msg?: string) => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
    setMood(newMood);
    if (msg) setMessage(msg);
    resetTimer.current = setTimeout(() => { setMood("idle"); setMessage("Let's create your account! ✨"); }, 2200);
  };

  const handleSignup = async () => {
    if (!name || !email || !pw || !phone) { Alert.alert("Error", "အကွက်အားလုံး ဖြည့်ပါ။"); return; }
    if (pw !== cpw) { Alert.alert("Error", "စကားဝှက် နှစ်ခု မတူပါ။"); return; }
    
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pw);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        name: name,
        email: email,
        phone: phone, // ⭐ ဖုန်းနံပါတ် ထည့်မယ်
        role: "student",
        grade: grade.toLowerCase(),
        isPremium: false,
        createdAt: new Date().toISOString(),
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(student)/grades");

    } catch (error: any) {
      Alert.alert("အကောင့်ဖွင့်မရပါ", error.message);
    } finally {
      setLoading(false);
    }
  };

  const filledCount = [name, email, phone, pw, cpw].filter((v) => v.length > 0).length;
  const progressProp = filledCount === 5 ? "✨" : filledCount > 0 ? "📝" : undefined;

  return (
    <View style={{ flex: 1, backgroundColor: PAL.bg }}>
      <LinearGradient colors={[PAL.bgTop, PAL.bg, PAL.bgBottom]} locations={[0, 0.5, 1]} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} />
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ paddingHorizontal: isTablet ? 48 : 24, paddingBottom: 40, paddingTop: 8, maxWidth: isTablet ? 600 : undefined, alignSelf: "center", width: "100%" }} showsVerticalScrollIndicator={false}>
            
            <Pressable onPress={() => { Haptics.selectionAsync(); router.back(); }} style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
              <Text style={{ fontSize: 22, color: PAL.text }}>←</Text>
            </Pressable>

            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); react("excited", "Yay! Let's do this! 🎉"); }}>
                <Pip mood={mood} size={isTablet ? 90 : 76} prop={progressProp} />
              </Pressable>
              <Animated.View entering={FadeIn.delay(200)} style={{ flex: 1 }}>
                <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: PAL.textMuted, lineHeight: 20 }}>{message}</Text>
                <View style={{ flexDirection: "row", gap: 6, marginTop: 8 }}>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <View key={i} style={{ width: i < filledCount ? 16 : 8, height: 8, borderRadius: 4, backgroundColor: i < filledCount ? PAL.primary : PAL.divider }} />
                  ))}
                </View>
              </Animated.View>
            </View>

            <Animated.View entering={FadeInDown.delay(100).springify()}>
              <Text style={{ fontFamily: FONT.extrabold, fontSize: isTablet ? 38 : 30, color: PAL.text, letterSpacing: -1, lineHeight: isTablet ? 44 : 36 }}>{t("auth.signupTitle")}</Text>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: PAL.textMuted, marginTop: 6 }}>သင့်အကောင့်အသစ်ကို ဖန်တီးပါ</Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(200).springify()} style={{ marginTop: 26 }}>
              <MinimalInput label={t("auth.name")} icon="👤" value={name} onChangeText={setName} focused={focusField === "name"} onFocus={() => setFocusField("name")} onBlur={() => setFocusField(null)} />
              <MinimalInput label={t("auth.email")} icon="✉️" value={email} onChangeText={setEmail} keyboardType="email-address" focused={focusField === "email"} onFocus={() => setFocusField("email")} onBlur={() => setFocusField(null)} />
              {/* ⭐ ဖုန်းနံပါတ် အကွက် အသစ် */}
              <MinimalInput label="ဖုန်းနံပါတ်" icon="📱" value={phone} onChangeText={setPhone} keyboardType="phone-pad" focused={focusField === "phone"} onFocus={() => { setFocusField("phone"); react("thinking", "Enter your phone number 📱"); }} onBlur={() => setFocusField(null)} />
              <MinimalInput label={t("auth.password")} icon="🔒" value={pw} onChangeText={setPw} secure focused={focusField === "pw"} onFocus={() => { setFocusField("pw"); react("thinking", "Make it strong! 💪"); }} onBlur={() => setFocusField(null)} />
              <MinimalInput label={t("auth.confirmPassword")} icon="🔐" value={cpw} onChangeText={setCpw} secure focused={focusField === "cpw"} onFocus={() => setFocusField("cpw")} onBlur={() => setFocusField(null)} />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(300).springify()} style={{ marginTop: 4 }}>
              <Text style={{ fontFamily: FONT.extrabold, fontSize: 11, color: PAL.textMuted, letterSpacing: 1.2, marginBottom: 10 }}>{t("auth.grade").toUpperCase()}</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {GRADES.map((g) => {
                  const active = grade === g;
                  return (
                    <Pressable key={g} onPress={() => { Haptics.selectionAsync(); setGrade(g); react("happy", `Grade ${g}! Nice pick! 🎓`); }} style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, backgroundColor: active ? PAL.primary : "transparent", borderWidth: 1.5, borderColor: active ? PAL.primary : PAL.divider }}>
                      <Text style={{ fontFamily: FONT.extrabold, fontSize: 13, color: active ? "#FFFFFF" : PAL.text }}>{g}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(400).springify()} style={{ marginTop: 28 }}>
              <Pressable onPress={handleSignup} disabled={loading} style={{ backgroundColor: PAL.primary, borderRadius: 999, paddingVertical: 16, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8, opacity: loading ? 0.7 : 1 }}>
                <Text style={{ fontFamily: FONT.extrabold, fontSize: 16, color: "#FFFFFF", letterSpacing: 0.3 }}>{loading ? "ဖန်တီးနေသည်..." : t("auth.signup")}</Text>
                <Text style={{ fontSize: 16, color: "#FFFFFF" }}>→</Text>
              </Pressable>
            </Animated.View>

            <Pressable onPress={() => router.push("/(auth)/login")} style={{ marginTop: 20, alignItems: "center" }}>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: PAL.textMuted }}>{t("auth.switchToLogin")}</Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}