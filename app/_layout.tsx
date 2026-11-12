import "../lib/i18n";
import { Stack, useRouter, useSegments } from "expo-router";
import { ModeProvider } from "@/lib/mode-context";
import { ThemeProvider } from "@/lib/theme-context";
import { LanguageProvider } from "@/lib/language-context";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from "@expo-google-fonts/plus-jakarta-sans";
import { View, ActivityIndicator } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync();

function AuthGuard() {
  const { user, userData, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inStudentGroup = segments[0] === "(student)";
    const inTeacherGroup = segments[0] === "(teacher)";

    if (user && userData) {
      // User ဝင်ထားရင် သူ့ Role အလိုက် ပို့မယ်
      if (userData.role === "teacher" && !inTeacherGroup) {
        router.replace("/(teacher)/dashboard");
      } else if (userData.role === "student" && !inStudentGroup) {
        router.replace("/(student)/grades");
      }
    }
    // Guest တွေကို ဒီနေရာမှာ ပိတ်မထားပါဘူး။ သူတို့ကိုယ်တိုင် Play as Guest နှိပ်မှ ဝင်ခွင့်ပြုမယ်။
  }, [user, userData, loading, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(student)" />
      <Stack.Screen name="(teacher)" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#FFF8F0" }}>
        <ActivityIndicator color="#FF6B6B" />
      </View>
    );
  }

  return (
    <LanguageProvider>
      <ThemeProvider>
        <ModeProvider>
          <AuthProvider>
            <AuthGuard />
          </AuthProvider>
        </ModeProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}