import {
  View,
  Text,
  TextInput,
  Dimensions,
  ScrollView,
  Switch,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useState, useEffect } from "react";
import { CANDY, FONT, R, SHADOW } from "@/lib/design";
import CandyButton from "@/components/ui/CandyButton";
import CandyIconButton from "@/components/ui/CandyIconButton";
import CandyCard from "@/components/ui/CandyCard";
import { LessonsStore } from "@/lib/lessons-store";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

const SUBJECTS = [
  { id: "myanmar", nameKey: "subjects.myanmar", emoji: "📖" },
  { id: "english", nameKey: "subjects.english", emoji: "🔤" },
  { id: "math", nameKey: "subjects.math", emoji: "🔢" },
  { id: "science", nameKey: "subjects.science", emoji: "🔬" },
  { id: "history", nameKey: "subjects.history", emoji: "🏛️" },
  { id: "geography", nameKey: "subjects.geography", emoji: "🌍" },
];

function isValidYoutube(url: string) {
  return /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/.test(url);
}

export default function LessonEditor() {
  const router = useRouter();
  const { t } = useTranslation();
  const { id, subject: initialSubject } = useLocalSearchParams<{
    id?: string;
    subject?: string;
  }>();

  const isEdit = !!id;

  const [subject, setSubject] = useState(initialSubject ?? "math");
  const [title, setTitle] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit) {
      const l = LessonsStore.get(id!);
      if (l) {
        setSubject(l.subject);
        setTitle(l.title);
        setYoutubeUrl(l.youtubeUrl);
        setContent(l.content);
        setPublished(l.published);
      }
    }
  }, [id]);

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert("ခေါင်းစဉ် လိုအပ်ပါတယ်", "သင်ခန်းစာ ခေါင်းစဉ် ထည့်ပါ။");
      return;
    }
    if (youtubeUrl && !isValidYoutube(youtubeUrl)) {
      Alert.alert("YouTube URL မမှန်ပါ", "Unlisted video URL ကို မှန်ကန်စွာ ထည့်ပါ။");
      return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    if (isEdit) {
      LessonsStore.update(id!, {
        subject,
        title,
        youtubeUrl,
        content,
        published,
      });
    } else {
      LessonsStore.add({
        subject,
        grade: "g3",
        title,
        youtubeUrl,
        content,
        published,
      });
    }

    setTimeout(() => {
      setSaving(false);
      router.back();
    }, 300);
  };

  const handleDelete = () => {
    Alert.alert("သင်ခန်းစာ ဖျက်မလား?", "ပြန်မရနိုင်ပါ။", [
      { text: "မဖျက်ဘူး", style: "cancel" },
      {
        text: "ဖျက်မယ်",
        style: "destructive",
        onPress: () => {
          LessonsStore.delete(id!);
          router.back();
        },
      },
    ]);
  };

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
            maxWidth: isTablet ? 700 : undefined,
            alignSelf: "center",
            width: "100%",
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Top bar */}
          <View
            style={{
              marginTop: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <CandyIconButton emoji="←" onPress={() => router.back()} size={44} />
            {isEdit && (
              <CandyIconButton
                emoji="🗑️"
                onPress={handleDelete}
                size={44}
                bg="#FFE0E6"
              />
            )}
          </View>

          {/* Hero */}
          <Animated.View entering={FadeInDown.delay(100).springify()} style={{ marginTop: 20 }}>
            <Text
              style={{
                fontFamily: FONT.extrabold,
                fontSize: isTablet ? 34 : 26,
                color: CANDY.text,
                letterSpacing: -0.8,
              }}
            >
              {isEdit ? "✏️ သင်ခန်းစာ ပြင်" : "➕ သင်ခန်းစာ အသစ်"}
            </Text>
            <Text
              style={{
                fontFamily: FONT.semibold,
                fontSize: 14,
                color: CANDY.textMuted,
                marginTop: 6,
              }}
            >
              YouTube URL နဲ့ content ကို ထည့်ပါ
            </Text>
          </Animated.View>

          {/* Subject picker */}
          <Animated.View entering={FadeInDown.delay(200).springify()} style={{ marginTop: 24 }}>
            <Label>ဘာသာရပ်</Label>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {SUBJECTS.map((s) => {
                const active = subject === s.id;
                return (
                  <Chip
                    key={s.id}
                    active={active}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setSubject(s.id);
                    }}
                    emoji={s.emoji}
                    label={t(s.nameKey)}
                  />
                );
              })}
            </View>
          </Animated.View>

          {/* Title */}
          <Animated.View entering={FadeInDown.delay(250).springify()} style={{ marginTop: 20 }}>
            <Label>ခေါင်းစဉ် *</Label>
            <Input value={title} onChangeText={setTitle} placeholder="ဥပမာ — သင်ခန်းစာ ၁" />
          </Animated.View>

          {/* YouTube URL */}
          <Animated.View entering={FadeInDown.delay(300).springify()} style={{ marginTop: 16 }}>
            <Label>YouTube Unlisted URL</Label>
            <Input
              value={youtubeUrl}
              onChangeText={setYoutubeUrl}
              placeholder="https://youtu.be/xxxxx"
              autoCapitalize="none"
              keyboardType="url"
            />
            {youtubeUrl.length > 0 && (
              <Text
                style={{
                  fontFamily: FONT.semibold,
                  fontSize: 11,
                  color: isValidYoutube(youtubeUrl) ? "#1E7A6F" : "#C2402B",
                  marginTop: 6,
                  marginLeft: 4,
                }}
              >
                {isValidYoutube(youtubeUrl) ? "✓ URL မှန်ပါတယ်" : "✗ URL မမှန်ပါ"}
              </Text>
            )}
          </Animated.View>

          {/* Content */}
          <Animated.View entering={FadeInDown.delay(350).springify()} style={{ marginTop: 16 }}>
            <Label>အကြောင်းအရာ</Label>
            <Input
              value={content}
              onChangeText={setContent}
              placeholder="သင်ခန်းစာ အကြောင်းအရာ..."
              multiline
              numberOfLines={5}
              style={{ minHeight: 120, textAlignVertical: "top" }}
            />
          </Animated.View>

          {/* Published toggle */}
          <Animated.View entering={FadeInDown.delay(400).springify()} style={{ marginTop: 16 }}>
            <CandyCard>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: FONT.extrabold,
                      fontSize: 14,
                      color: CANDY.text,
                    }}
                  >
                    Published
                  </Text>
                  <Text
                    style={{
                      fontFamily: FONT.semibold,
                      fontSize: 11,
                      color: CANDY.textMuted,
                      marginTop: 2,
                    }}
                  >
                    Student တွေ မြင်နိုင်မယ်
                  </Text>
                </View>
                <Switch
                  value={published}
                  onValueChange={(v) => {
                    Haptics.selectionAsync();
                    setPublished(v);
                  }}
                  trackColor={{ true: CANDY.primary, false: "#DDD" }}
                  thumbColor="#FFF"
                />
              </View>
            </CandyCard>
          </Animated.View>

          {/* Save */}
          <Animated.View entering={FadeInDown.delay(450).springify()} style={{ marginTop: 24 }}>
            <CandyButton
              label={saving ? "သိမ်းနေသည်..." : isEdit ? "ပြင်ဆင်ချက် သိမ်းမယ်" : "သင်ခန်းစာ ထည့်မယ်"}
              icon={saving ? "⏳" : "💾"}
              color={CANDY.primary}
              size="lg"
              onPress={handleSave}
              haptic="heavy"
              disabled={saving}
            />
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Helpers
function Label({ children }: { children: React.ReactNode }) {
  return (
    <Text
      style={{
        fontFamily: FONT.extrabold,
        fontSize: 12,
        color: CANDY.textMuted,
        marginBottom: 8,
        marginLeft: 4,
        letterSpacing: 0.5,
      }}
    >
      {children}
    </Text>
  );
}

function Input({ style, ...props }: any) {
  return (
    <TextInput
      placeholderTextColor={CANDY.textMuted}
      style={[
        {
          backgroundColor: CANDY.surface,
          borderRadius: R.lg,
          paddingHorizontal: 16,
          paddingVertical: 14,
          fontFamily: FONT.semibold,
          fontSize: 14,
          color: CANDY.text,
          borderWidth: 2,
          borderColor: CANDY.border,
          ...SHADOW.soft,
        },
        style,
      ]}
      {...props}
    />
  );
}

function Chip({
  active,
  onPress,
  emoji,
  label,
}: {
  active: boolean;
  onPress: () => void;
  emoji: string;
  label: string;
}) {
  return (
    <View
      onTouchEnd={onPress}
      style={{
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: R.md,
        backgroundColor: active ? CANDY.primary : CANDY.surface,
        borderWidth: 2,
        borderColor: active ? CANDY.primaryDark : CANDY.border,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
      }}
    >
      <Text style={{ fontSize: 14 }}>{emoji}</Text>
      <Text
        style={{
          fontFamily: FONT.extrabold,
          fontSize: 12,
          color: active ? "#FFF" : CANDY.text,
        }}
      >
        {label}
      </Text>
    </View>
  );
}