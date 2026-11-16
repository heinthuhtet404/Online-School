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
  Pressable,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import { useState, useEffect, useRef } from "react";
import { FONT } from "@/lib/design";
import {
  addLesson,
  updateLesson,
  getLesson,
  deleteLesson,
} from "@/lib/lessons-service";
import {
  addQuiz,
  updateQuiz,
  getQuiz,
  deleteQuiz,
  QuizQuestion,
} from "@/lib/quizzes-service";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

const PAL = {
  bg: "#F0F5F8",
  bgTop: "#D4E8E6",
  bgBottom: "#EDE9F5",
  primary: "#2C7A7B",
  primaryDark: "#1E5C5D",
  accent: "#9F7AEA",
  accentDark: "#7C5CC7",
  text: "#1E2A38",
  textMuted: "#5C6B7A",
  divider: "#D8E2E8",
  success: "#2C7A7B",
  danger: "#C2402B",
};

const SUBJECTS = [
  { id: "myanmar", nameKey: "subjects.myanmar", emoji: "📖", color: "#E8A8A8", darkColor: "#C97B7B" },
  { id: "english", nameKey: "subjects.english", emoji: "🔤", color: "#7BC4C4", darkColor: "#5CA3A3" },
  { id: "math", nameKey: "subjects.math", emoji: "🔢", color: "#9FC4E8", darkColor: "#7BA3C9" },
  { id: "science", nameKey: "subjects.science", emoji: "🔬", color: "#A8D5BA", darkColor: "#7BB89A" },
  { id: "history", nameKey: "subjects.history", emoji: "🏛️", color: "#E8D47B", darkColor: "#C9B55C" },
  { id: "geography", nameKey: "subjects.geography", emoji: "🌍", color: "#B8A4D9", darkColor: "#9880B8" },
];

function isValidYoutube(url: string) {
  return /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/.test(url);
}

type Mood = "idle" | "happy" | "excited" | "thinking" | "wave";
type Mode = "lesson" | "quiz";

function MinimalInput({
  label,
  value,
  onChangeText,
  placeholder,
  focused,
  onFocus,
  onBlur,
  multiline,
  keyboardType,
  autoCapitalize,
  minHeight,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  focused: boolean;
  onFocus: () => void;
  onBlur: () => void;
  multiline?: boolean;
  keyboardType?: any;
  autoCapitalize?: any;
  minHeight?: number;
}) {
  return (
    <View style={{ marginBottom: 18 }}>
      <Text
        style={{
          fontFamily: FONT.extrabold,
          fontSize: 11,
          color: focused ? PAL.primary : PAL.textMuted,
          letterSpacing: 1.2,
          marginBottom: 6,
          marginLeft: 2,
        }}
      >
        {label.toUpperCase()}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={PAL.textMuted + "80"}
        onFocus={onFocus}
        onBlur={onBlur}
        multiline={multiline}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        style={{
          paddingVertical: 10,
          paddingHorizontal: 2,
          fontFamily: FONT.semibold,
          fontSize: 15,
          color: PAL.text,
          borderBottomWidth: focused ? 2.5 : 1.5,
          borderBottomColor: focused ? PAL.primary : PAL.divider,
          minHeight: minHeight ?? undefined,
          textAlignVertical: multiline ? "top" : "center",
        }}
      />
    </View>
  );
}

function SubjectChip({
  subject,
  active,
  onPress,
  name,
}: {
  subject: (typeof SUBJECTS)[0];
  active: boolean;
  onPress: () => void;
  name: string;
}) {
  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync();
        onPress();
      }}
      style={{
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 999,
        backgroundColor: active ? subject.color : "transparent",
        borderWidth: 1.5,
        borderColor: active ? subject.color : PAL.divider,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
      }}
    >
      <Text style={{ fontSize: 13 }}>{subject.emoji}</Text>
      <Text
        style={{
          fontFamily: FONT.extrabold,
          fontSize: 12,
          color: active ? "#FFFFFF" : PAL.text,
        }}
      >
        {name}
      </Text>
    </Pressable>
  );
}

// ===== Mode Tab =====
function ModeTab({
  mode,
  active,
  onPress,
}: {
  mode: Mode;
  active: boolean;
  onPress: () => void;
}) {
  const isLesson = mode === "lesson";
  const emoji = isLesson ? "📖" : "✏️";
  const label = isLesson ? "သင်ခန်းစာ" : "Quiz";

  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync();
        onPress();
      }}
      style={{
        flex: 1,
        paddingVertical: 12,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 12,
        backgroundColor: active ? PAL.primary : "transparent",
        flexDirection: "row",
        gap: 6,
      }}
    >
      <Text style={{ fontSize: 16 }}>{emoji}</Text>
      <Text
        style={{
          fontFamily: FONT.extrabold,
          fontSize: 13,
          color: active ? "#FFFFFF" : PAL.textMuted,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

// ===== Quiz Question Card =====
function QuestionCard({
  q,
  index,
  onUpdate,
  onDelete,
}: {
  q: QuizQuestion;
  index: number;
  onUpdate: (q: QuizQuestion) => void;
  onDelete: () => void;
}) {
  return (
    <View
      style={{
        backgroundColor: "#FFF",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1.5,
        borderColor: PAL.divider,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <Text
          style={{
            fontFamily: FONT.extrabold,
            fontSize: 11,
            color: PAL.textMuted,
            letterSpacing: 1,
          }}
        >
          မေးခွန်း {index + 1}
        </Text>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onDelete();
          }}
        >
          <Text style={{ fontSize: 16 }}>🗑️</Text>
        </Pressable>
      </View>

      <TextInput
        value={q.question}
        onChangeText={(t) => onUpdate({ ...q, question: t })}
        placeholder="မေးခွန်း ရိုက်ထည့်ပါ..."
        placeholderTextColor={PAL.textMuted + "80"}
        multiline
        style={{
          fontFamily: FONT.semibold,
          fontSize: 14,
          color: PAL.text,
          borderBottomWidth: 1.5,
          borderBottomColor: PAL.divider,
          paddingVertical: 8,
          marginBottom: 12,
          minHeight: 40,
        }}
      />

      <Text
        style={{
          fontFamily: FONT.extrabold,
          fontSize: 10,
          color: PAL.textMuted,
          letterSpacing: 1,
          marginBottom: 6,
        }}
      >
        ရွေးချယ်စရာများ (မှန်တာကို နှိပ်ပါ)
      </Text>

      {q.choices.map((c, ci) => {
        const isCorrect = q.correctIndex === ci;
        return (
          <View
            key={ci}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginBottom: 8,
            }}
          >
            <Pressable
              onPress={() => {
                Haptics.selectionAsync();
                onUpdate({ ...q, correctIndex: ci });
              }}
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: isCorrect ? PAL.success : PAL.divider,
                backgroundColor: isCorrect ? PAL.success : "transparent",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isCorrect && (
                <Text style={{ fontSize: 12, color: "#FFF" }}>✓</Text>
              )}
            </Pressable>
            <TextInput
              value={c}
              onChangeText={(t) => {
                const next = [...q.choices];
                next[ci] = t;
                onUpdate({ ...q, choices: next });
              }}
              placeholder={`ရွေးချယ်စရာ ${String.fromCharCode(65 + ci)}`}
              placeholderTextColor={PAL.textMuted + "80"}
              style={{
                flex: 1,
                fontFamily: FONT.semibold,
                fontSize: 14,
                color: PAL.text,
                borderBottomWidth: 1,
                borderBottomColor: PAL.divider,
                paddingVertical: 6,
              }}
            />
          </View>
        );
      })}
    </View>
  );
}

export default function LessonEditor() {
  const router = useRouter();
  const { t } = useTranslation();
  const { id, subject: initialSubject, grade: initialGrade } = useLocalSearchParams<{
    id?: string;
    subject?: string;
    grade?: string;
  }>();

  const [mode, setMode] = useState<Mode>("lesson");
  const isEdit = !!id;

  // ===== Common =====
  const [subject, setSubject] = useState(initialSubject ?? "math");
  const [grade, setGrade] = useState(initialGrade ?? "g1");
  const [title, setTitle] = useState("");
  const [published, setPublished] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  // ===== Lesson only =====
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [content, setContent] = useState("");
  const [order, setOrder] = useState(1);

  // ===== Quiz only =====
  const [questions, setQuestions] = useState<QuizQuestion[]>([
    { question: "", choices: ["", "", "", ""], correctIndex: 0 },
  ]);

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [focusField, setFocusField] = useState<string | null>(null);

  const [mood, setMood] = useState<Mood>("idle");
  const [message, setMessage] = useState(
    isEdit ? "Edit your content! ✏️" : "Let's create new content! ➕"
  );
  const resetTimer = useRef<any>(null);

  const react = (newMood: Mood, msg: string) => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
    setMood(newMood);
    setMessage(msg);
    resetTimer.current = setTimeout(() => {
      setMood("idle");
      setMessage(isEdit ? "Edit your content! ✏️" : "Let's create new content! ➕");
    }, 2200);
  };

  const activeSubject = SUBJECTS.find((s) => s.id === subject) ?? SUBJECTS[2];

  // ===== Load =====
  useEffect(() => {
    if (isEdit) {
      (async () => {
        try {
          setLoading(true);
          // ပထမ Lesson ရှိလား စစ်
          const l = await getLesson(id!);
          if (l) {
            setMode("lesson");
            setSubject(l.subject);
            setGrade(l.grade);
            setTitle(l.title);
            setYoutubeUrl(l.youtubeUrl || "");
            setContent(l.content || "");
            setPublished(l.published);
            setOrder(l.order);
            setIsPremium(l.isPremium);
            return;
          }
          // Lesson မရှိရင် Quiz စစ်
          const q = await getQuiz(id!);
          if (q) {
            setMode("quiz");
            setSubject(q.subject);
            setGrade(q.grade);
            setTitle(q.title);
            setPublished(q.published);
            setIsPremium(q.isPremium);
            setQuestions(
              q.questions.length > 0
                ? q.questions
                : [{ question: "", choices: ["", "", "", ""], correctIndex: 0 }]
            );
            return;
          }
        } catch (e: any) {
          Alert.alert("Error", e.message);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [id]);

  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  // ===== Save =====
  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("ခေါင်းစဉ် လိုအပ်ပါတယ်", "ခေါင်းစဉ် ထည့်ပါ။");
      return;
    }

    if (mode === "lesson") {
      if (youtubeUrl && !isValidYoutube(youtubeUrl)) {
        Alert.alert("YouTube URL မမှန်ပါ", "Unlisted video URL ကို မှန်ကန်စွာ ထည့်ပါ။");
        return;
      }
    }

    if (mode === "quiz") {
      const validQs = questions.filter((q) => q.question.trim().length > 0);
      if (validQs.length === 0) {
        Alert.alert("မေးခွန်း လိုအပ်ပါတယ်", "အနည်းဆုံး မေးခွန်း ၁ ခု ထည့်ပါ။");
        return;
      }
      const hasEmptyChoice = validQs.some((q) =>
        q.choices.some((c) => c.trim().length === 0)
      );
      if (hasEmptyChoice) {
        Alert.alert("ရွေးချယ်စရာ လိုအပ်ပါတယ်", "ရွေးချယ်စရာ အားလုံး ဖြည့်ပါ။");
        return;
      }
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    react("excited", "Saving... 💾");

    try {
      if (isEdit) {
        if (mode === "lesson") {
          await updateLesson(id!, {
            subject,
            grade,
            title,
            youtubeUrl,
            content,
            published,
            order,
            isPremium,
          });
        } else {
          await updateQuiz(id!, {
            subject,
            grade,
            title,
            published,
            isPremium,
            questions: questions.filter((q) => q.question.trim().length > 0),
          });
        }
      } else {
        if (mode === "lesson") {
          await addLesson({
            subject,
            grade,
            title,
            youtubeUrl,
            content,
            published,
            order,
            isPremium,
          });
        } else {
          await addQuiz({
            subject,
            grade,
            title,
            published,
            isPremium,
            questions: questions.filter((q) => q.question.trim().length > 0),
          });
        }
      }

      setTimeout(() => {
        setSaving(false);
        router.back();
      }, 300);
    } catch (e: any) {
      setSaving(false);
      Alert.alert("Error", e.message);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      `${mode === "lesson" ? "သင်ခန်းစာ" : "Quiz"} ဖျက်မလား?`,
      "ပြန်မရနိုင်ပါ။",
      [
        { text: "မဖျက်ဘူး", style: "cancel" },
        {
          text: "ဖျက်မယ်",
          style: "destructive",
          onPress: async () => {
            try {
              if (mode === "lesson") {
                await deleteLesson(id!);
              } else {
                await deleteQuiz(id!);
              }
              router.back();
            } catch (e: any) {
              Alert.alert("Error", e.message);
            }
          },
        },
      ]
    );
  };

  const filledCount =
    mode === "lesson"
      ? [title, youtubeUrl, content].filter((v) => v.length > 0).length
      : [title, questions.filter((q) => q.question.trim()).length > 0 ? "x" : ""].filter(
          (v) => v.length > 0
        ).length;

  const flameTop = `${activeSubject.color}99`;
  const flameBottom = activeSubject.color;

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: PAL.bg,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator color={PAL.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: PAL.bg }}>
      <LinearGradient
        colors={[PAL.bgTop, PAL.bg, PAL.bgBottom]}
        locations={[0, 0.5, 1]}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: isTablet ? 48 : 24,
              paddingBottom: 40,
              maxWidth: isTablet ? 600 : undefined,
              alignSelf: "center",
              width: "100%",
            }}
            showsVerticalScrollIndicator={false}
          >
            {/* Top bar */}
            <View
              style={{
                marginTop: 12,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Pressable
                onPress={() => {
                  Haptics.selectionAsync();
                  router.back();
                }}
                style={{
                  width: 40,
                  height: 40,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 22, color: PAL.text }}>←</Text>
              </Pressable>
              {isEdit && (
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                    handleDelete();
                  }}
                  style={{
                    width: 40,
                    height: 40,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontSize: 20 }}>🗑️</Text>
                </Pressable>
              )}
            </View>

            {/* Header */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                marginTop: 8,
                marginBottom: 20,
              }}
            >
              <View>
                <Text style={{ fontSize: 56 }}>{activeSubject.emoji}</Text>
              </View>
              <Animated.View entering={FadeIn.delay(200)} style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: FONT.semibold,
                    fontSize: 14,
                    color: PAL.textMuted,
                    lineHeight: 20,
                  }}
                >
                  {message}
                </Text>
              </Animated.View>
            </View>

            {/* Mode Tabs */}
            <Animated.View entering={FadeInDown.delay(80).springify()}>
              <View
                style={{
                  flexDirection: "row",
                  backgroundColor: "#FFF",
                  borderRadius: 14,
                  padding: 4,
                  marginBottom: 20,
                  borderWidth: 1.5,
                  borderColor: PAL.divider,
                }}
              >
                <ModeTab
                  mode="lesson"
                  active={mode === "lesson"}
                  onPress={() => {
                    setMode("lesson");
                    react("happy", "Lesson mode! 📖");
                  }}
                />
                <ModeTab
                  mode="quiz"
                  active={mode === "quiz"}
                  onPress={() => {
                    setMode("quiz");
                    react("happy", "Quiz mode! ✏️");
                  }}
                />
              </View>
            </Animated.View>

            {/* Title */}
            <Animated.View entering={FadeInDown.delay(100).springify()}>
              <Text
                style={{
                  fontFamily: FONT.extrabold,
                  fontSize: isTablet ? 34 : 26,
                  color: PAL.text,
                  letterSpacing: -0.8,
                  lineHeight: isTablet ? 40 : 32,
                }}
              >
                {isEdit
                  ? mode === "lesson"
                    ? "✏️ သင်ခန်းစာ ပြင်"
                    : "✏️ Quiz ပြင်"
                  : mode === "lesson"
                  ? "➕ သင်ခန်းစာ အသစ်"
                  : "➕ Quiz အသစ်"}
              </Text>
            </Animated.View>

            <View
              style={{
                height: 1,
                backgroundColor: PAL.divider,
                marginTop: 24,
                marginBottom: 20,
              }}
            />

            {/* Subject chips */}
            <Animated.View entering={FadeInDown.delay(150).springify()}>
              <Text
                style={{
                  fontFamily: FONT.extrabold,
                  fontSize: 11,
                  color: PAL.textMuted,
                  letterSpacing: 1.2,
                  marginBottom: 10,
                }}
              >
                ဘာသာရပ်
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {SUBJECTS.map((s) => (
                  <SubjectChip
                    key={s.id}
                    subject={s}
                    active={subject === s.id}
                    name={t(s.nameKey)}
                    onPress={() => {
                      setSubject(s.id);
                      react("happy", `${t(s.nameKey)}! Good choice! 🎓`);
                    }}
                  />
                ))}
              </View>
            </Animated.View>

            {/* Title input */}
            <Animated.View
              entering={FadeInDown.delay(200).springify()}
              style={{ marginTop: 24 }}
            >
              <MinimalInput
                label="ခေါင်းစဉ် *"
                value={title}
                onChangeText={(v) => {
                  setTitle(v);
                  if (v.length === 1) react("happy", "Good start! ✍️");
                }}
                placeholder={
                  mode === "lesson" ? "ဥပမာ — သင်ခန်းစာ ၁" : "ဥပမာ — အပိုင်းကိန်း Quiz"
                }
                focused={focusField === "title"}
                onFocus={() => {
                  setFocusField("title");
                  if (!title) react("thinking", "Type a catchy title! ✍️");
                }}
                onBlur={() => setFocusField(null)}
              />
            </Animated.View>

            {/* ===== Lesson fields ===== */}
            {mode === "lesson" && (
              <>
                <Animated.View entering={FadeInDown.delay(250).springify()}>
                  <MinimalInput
                    label="YouTube Unlisted URL"
                    value={youtubeUrl}
                    onChangeText={setYoutubeUrl}
                    placeholder="https://youtu.be/xxxxx"
                    autoCapitalize="none"
                    keyboardType="url"
                    focused={focusField === "url"}
                    onFocus={() => {
                      setFocusField("url");
                      react("thinking", "Paste the video link! 🔗");
                    }}
                    onBlur={() => setFocusField(null)}
                  />
                  {youtubeUrl.length > 0 && (
                    <Text
                      style={{
                        fontFamily: FONT.extrabold,
                        fontSize: 11,
                        color: isValidYoutube(youtubeUrl) ? PAL.success : PAL.danger,
                        marginTop: -10,
                        marginBottom: 16,
                        marginLeft: 4,
                        letterSpacing: 0.5,
                      }}
                    >
                      {isValidYoutube(youtubeUrl)
                        ? "✓ URL မှန်ပါတယ်"
                        : "✗ URL မမှန်ပါ"}
                    </Text>
                  )}
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(300).springify()}>
                  <MinimalInput
                    label="အကြောင်းအရာ"
                    value={content}
                    onChangeText={(v) => {
                      setContent(v);
                      if (v.length > 50 && content.length < 50)
                        react("happy", "Nice detail! 📝");
                    }}
                    placeholder="သင်ခန်းစာ အကြောင်းအရာ..."
                    multiline
                    minHeight={100}
                    focused={focusField === "content"}
                    onFocus={() => {
                      setFocusField("content");
                      react("thinking", "Tell the story! 📖");
                    }}
                    onBlur={() => setFocusField(null)}
                  />
                </Animated.View>
              </>
            )}

            {/* ===== Quiz fields ===== */}
            {mode === "quiz" && (
              <Animated.View entering={FadeInDown.delay(250).springify()}>
                <Text
                  style={{
                    fontFamily: FONT.extrabold,
                    fontSize: 11,
                    color: PAL.textMuted,
                    letterSpacing: 1.2,
                    marginBottom: 10,
                  }}
                >
                  မေးခွန်းများ ({questions.filter((q) => q.question.trim()).length})
                </Text>

                {questions.map((q, i) => (
                  <QuestionCard
                    key={i}
                    q={q}
                    index={i}
                    onUpdate={(next) => {
                      const arr = [...questions];
                      arr[i] = next;
                      setQuestions(arr);
                    }}
                    onDelete={() => {
                      if (questions.length === 1) {
                        Alert.alert("မဖျက်နိုင်ပါ", "အနည်းဆုံး မေးခွန်း ၁ ခု ရှိရမယ်။");
                        return;
                      }
                      setQuestions(questions.filter((_, idx) => idx !== i));
                      react("thinking", "Question removed 🗑️");
                    }}
                  />
                ))}

                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setQuestions([
                      ...questions,
                      { question: "", choices: ["", "", "", ""], correctIndex: 0 },
                    ]);
                    react("happy", "New question! ➕");
                  }}
                  style={{
                    borderWidth: 2,
                    borderColor: PAL.primary,
                    borderStyle: "dashed",
                    borderRadius: 16,
                    paddingVertical: 14,
                    alignItems: "center",
                    flexDirection: "row",
                    justifyContent: "center",
                    gap: 8,
                    marginTop: 4,
                  }}
                >
                  <Text style={{ fontSize: 16, color: PAL.primary }}>➕</Text>
                  <Text
                    style={{
                      fontFamily: FONT.extrabold,
                      fontSize: 13,
                      color: PAL.primary,
                    }}
                  >
                    မေးခွန်း ထပ်ထည့်
                  </Text>
                </Pressable>
              </Animated.View>
            )}

            {/* Published */}
            <Animated.View entering={FadeInDown.delay(350).springify()}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 14,
                  marginTop: 16,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: FONT.extrabold,
                      fontSize: 15,
                      color: PAL.text,
                    }}
                  >
                    Published
                  </Text>
                  <Text
                    style={{
                      fontFamily: FONT.semibold,
                      fontSize: 12,
                      color: PAL.textMuted,
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
                    react(
                      v ? "excited" : "thinking",
                      v ? "Students will see it! ✅" : "Saved as draft 📝"
                    );
                  }}
                  trackColor={{ true: PAL.primary, false: PAL.divider }}
                  thumbColor="#FFF"
                />
              </View>
              <View style={{ height: 1, backgroundColor: PAL.divider }} />
            </Animated.View>

            {/* Premium */}
            <Animated.View entering={FadeInDown.delay(370).springify()}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 14,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: FONT.extrabold,
                      fontSize: 15,
                      color: PAL.text,
                    }}
                  >
                    ⭐ Premium Only
                  </Text>
                  <Text
                    style={{
                      fontFamily: FONT.semibold,
                      fontSize: 12,
                      color: PAL.textMuted,
                      marginTop: 2,
                    }}
                  >
                    Premium Student တွေပဲ ကြည့်/ဖြေနိုင်မယ်
                  </Text>
                </View>
                <Switch
                  value={isPremium}
                  onValueChange={(v) => {
                    Haptics.selectionAsync();
                    setIsPremium(v);
                    react(
                      v ? "thinking" : "happy",
                      v ? "Premium only! 🔒" : "Free for all 🎁"
                    );
                  }}
                  trackColor={{ true: PAL.accent, false: PAL.divider }}
                  thumbColor="#FFF"
                />
              </View>
              <View style={{ height: 1, backgroundColor: PAL.divider }} />
            </Animated.View>

            {/* Save */}
            <Animated.View entering={FadeInDown.delay(400).springify()}>
              <Pressable
                onPress={handleSave}
                disabled={saving}
                style={{
                  backgroundColor: PAL.primary,
                  borderRadius: 999,
                  paddingVertical: 16,
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 28,
                  flexDirection: "row",
                  gap: 8,
                  opacity: saving ? 0.6 : 1,
                }}
              >
                <Text style={{ fontSize: 15, color: "#FFFFFF" }}>
                  {saving ? "⏳" : "💾"}
                </Text>
                <Text
                  style={{
                    fontFamily: FONT.extrabold,
                    fontSize: 15,
                    color: "#FFFFFF",
                    letterSpacing: 0.3,
                  }}
                >
                  {saving
                    ? "သိမ်းနေသည်..."
                    : isEdit
                    ? "ပြင်ဆင်ချက် သိမ်းမယ်"
                    : mode === "lesson"
                    ? "သင်ခန်းစာ ထည့်မယ်"
                    : "Quiz ထည့်မယ်"}
                </Text>
              </Pressable>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}