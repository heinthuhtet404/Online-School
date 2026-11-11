import { View, Text, ScrollView, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { WebView } from "react-native-webview";
import * as Haptics from "expo-haptics";
import { CANDY, FONT, R } from "@/lib/design";
import CandyIconButton from "@/components/ui/CandyIconButton";
import CandyButton from "@/components/ui/CandyButton";
import CandyCard from "@/components/ui/CandyCard";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

export default function StudentLessonDetail() {
  const router = useRouter();
  const { level, subject, id } = useLocalSearchParams<{ level: string; subject: string; id: string }>();

  const lessonNum = (id ?? "l1").replace("l", "");
  const videoId = "DDhdFSIW-MA"; // နောက်ပိုင်း Database ကနေ ဆွဲယူမယ်

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
          html, body { margin:0; padding:0; background:#000; height:100%; overflow:hidden; }
          iframe { width:100%; height:100%; border:0; }
        </style>
      </head>
      <body>
        <iframe src="https://www.youtube-nocookie.com/embed/${videoId}?playsinline=1&rel=0&modestbranding=1"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen></iframe>
      </body>
    </html>
  `;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: CANDY.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={{ width: "100%", aspectRatio: 16 / 9, backgroundColor: "#000", position: "relative" }}>
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
          <View style={{ position: "absolute", top: 12, left: 12 }}>
            <CandyIconButton
              emoji="←"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.back();
              }}
              size={44}
              bg="rgba(255,255,255,0.9)"
            />
          </View>
        </View>

        <View style={{ paddingHorizontal: isTablet ? 48 : 24, maxWidth: isTablet ? 900 : undefined, alignSelf: "center", width: "100%" }}>
          <Text style={{ marginTop: 20, fontFamily: FONT.extrabold, fontSize: isTablet ? 32 : 24, color: CANDY.text, letterSpacing: -0.5 }}>
            သင်ခန်းစာ {lessonNum}
          </Text>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: CANDY.textMuted, marginTop: 4 }}>
            {level?.toUpperCase()} · {subject?.toUpperCase()}
          </Text>

          <View style={{ height: 1, backgroundColor: CANDY.border, marginVertical: 20 }} />

          <Text style={{ fontFamily: FONT.extrabold, fontSize: 18, color: CANDY.text, marginBottom: 10 }}>
            📖 အကြောင်းအရာ
          </Text>

          {[
            { h: "၁။ အခြေခံ သဘောတရား", p: "ဒီသင်ခန်းစာမှာ အခြေခံ အယူအဆတွေကို လေ့လာပါမယ်။" },
            { h: "၂။ ဥပမာများ", p: "ဗီဒီယိုထဲက ဥပမာတွေကို ကြည့်ပြီး ကိုယ်တိုင် လေ့ကျင့်ပါ။" },
            { h: "၃။ လေ့ကျင့်ခန်း", p: "အောက်က Quiz ကို ဖြေပြီး နားလည်မှုကို စမ်းသပ်ပါ။" },
          ].map((b, i) => (
            <CandyCard key={i} style={{ marginBottom: 12 }}>
              <Text style={{ fontFamily: FONT.extrabold, fontSize: 15, color: CANDY.text }}>{b.h}</Text>
              <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: CANDY.text, opacity: 0.8, marginTop: 8, lineHeight: 22 }}>
                {b.p}
              </Text>
            </CandyCard>
          ))}

          <CandyButton
            label="Quiz စတင်မယ်"
            icon="🎯"
            color={CANDY.primary}
            size="lg"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              router.push(`/(student)/quiz/q1`);
            }}
            haptic="heavy"
            style={{ marginTop: 20 }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}