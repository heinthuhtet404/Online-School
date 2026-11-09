import { View, Text, ScrollView, Pressable, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../../../lib/theme-context";
import { WebView } from "react-native-webview";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

// Subject-specific video samples (နောက်ပိုင်း Firestore ကနေ ဆွဲမယ်)
const VIDEO_IDS: Record<string, string> = {
  myanmar: "DDhdFSIW-MA",
  english: "DDhdFSIW-MA",
  math: "DDhdFSIW-MA",
  science: "DDhdFSIW-MA",
  history: "DDhdFSIW-MA",
  geography: "DDhdFSIW-MA",
};

export default function LessonDetail() {
  const router = useRouter();
  const { t } = useTranslation();
  const { C } = useTheme();
  const { level, subject, id } = useLocalSearchParams<{
    level: string;
    subject: string;
    id: string;
  }>();

  const lessonNum = (id ?? "l1").replace("l", "");
  const videoId = VIDEO_IDS[subject ?? "math"] ?? VIDEO_IDS.math;

  // YouTube embed HTML — DEFAULT controls ပါ
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <meta name="referrer" content="strict-origin-when-cross-origin">
        <style>
          html, body { margin:0; padding:0; background:#000; height:100%; overflow:hidden; }
          iframe { width:100%; height:100%; border:0; }
        </style>
      </head>
      <body>
        <iframe
          src="https://www.youtube-nocookie.com/embed/${videoId}?playsinline=1&rel=0&modestbranding=1"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
      </body>
    </html>
  `;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* ===== Video ===== */}
        <View
          style={{
            width: "100%",
            aspectRatio: 16 / 9,
            backgroundColor: "#000",
            position: "relative",
          }}
        >
          <WebView
            originWhitelist={["*"]}
            source={{ html, baseUrl: "https://www.youtube-nocookie.com" }}
            style={{ flex: 1, backgroundColor: "#000" }}
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled
            domStorageEnabled
            sharedCookiesEnabled
            thirdPartyCookiesEnabled
            mixedContentMode="always"
          />

          {/* Back button overlay */}
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "rgba(0,0,0,0.55)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 20, color: "#FFF" }}>←</Text>
          </Pressable>
        </View>

        {/* ===== Content ===== */}
        <View
          style={{
            paddingHorizontal: isTablet ? 48 : 24,
            maxWidth: isTablet ? 900 : undefined,
            alignSelf: "center",
            width: "100%",
          }}
        >
          <Text
            style={{
              marginTop: 20,
              fontFamily: "PlusJakartaSans_800ExtraBold",
              fontSize: isTablet ? 30 : 22,
              color: C.ink,
              letterSpacing: -0.5,
            }}
          >
            သင်ခန်းစာ {lessonNum}
          </Text>
          <Text
            style={{
              fontFamily: "PlusJakartaSans_600SemiBold",
              fontSize: 13,
              color: C.muted,
              marginTop: 4,
            }}
          >
            {level?.toUpperCase()} · {subject?.toUpperCase()}
          </Text>

          <View style={{ height: 1, backgroundColor: C.border, marginVertical: 20 }} />

          <Text
            style={{
              fontFamily: "PlusJakartaSans_800ExtraBold",
              fontSize: 18,
              color: C.ink,
              marginBottom: 10,
            }}
          >
            📖 အကြောင်းအရာ
          </Text>

          {[
            {
              h: "၁။ အခြေခံ သဘောတရား",
              p: "ဒီသင်ခန်းစာမှာ အခြေခံ အယူအဆတွေကို လေ့လာပါမယ်။",
            },
            {
              h: "၂။ ဥပမာများ",
              p: "ဗီဒီယိုထဲက ဥပမာတွေကို ကြည့်ပြီး ကိုယ်တိုင် လေ့ကျင့်ပါ။",
            },
            {
              h: "၃။ လေ့ကျင့်ခန်း",
              p: "အောက်က Quiz ကို ဖြေပြီး နားလည်မှုကို စမ်းသပ်ပါ။",
            },
          ].map((b, i) => (
            <View
              key={i}
              style={{
                backgroundColor: C.card,
                borderRadius: 18,
                padding: 18,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: C.border,
              }}
            >
              <Text
                style={{
                  fontFamily: "PlusJakartaSans_800ExtraBold",
                  fontSize: 15,
                  color: C.ink,
                }}
              >
                {b.h}
              </Text>
              <Text
                style={{
                  fontFamily: "PlusJakartaSans_400Regular",
                  fontSize: 14,
                  color: C.ink,
                  opacity: 0.8,
                  marginTop: 8,
                  lineHeight: 22,
                }}
              >
                {b.p}
              </Text>
            </View>
          ))}

          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              router.push(`/(student)/quiz/q1`);
            }}
            style={({ pressed }) => ({
              marginTop: 20,
              backgroundColor: C.ink,
              borderRadius: 22,
              paddingVertical: 20,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              gap: 10,
              opacity: pressed ? 0.9 : 1,
            })}
          >
            <Text style={{ fontSize: 20 }}>🎯</Text>
            <Text
              style={{
                fontFamily: "PlusJakartaSans_800ExtraBold",
                fontSize: 16,
                color: C.bg,
              }}
            >
              {t("grade.startQuiz")}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}