import { View, Text, Dimensions, Pressable, ScrollView, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeInDown,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  interpolate,
} from "react-native-reanimated";
import { useEffect, useState, useRef } from "react";
import { FONT } from "@/lib/design";

const { width } = Dimensions.get("window");
const isTablet = width >= 768;

// ============================================================
// PALETTE
// ============================================================
const PAL = {
  bg: "#FFF8F0",
  bgTop: "#FFE8D6",
  bgBottom: "#E8F4FF",
  primary: "#FF6B6B",
  primaryDark: "#E05050",
  secondary: "#4ECDC4",
  secondaryDark: "#3BA89F",
  accent: "#FFD93D",
  accentDark: "#E5C020",
  purple: "#A78BFA",
  purpleDark: "#8B6FE0",
  text: "#2D2422",
  textMuted: "#7A6A63",
  divider: "#EDE3D8",
  success: "#2C7A7B",
  danger: "#C2402B",
};

// ============================================================
// PAYMENT METHODS
// ============================================================
type PaymentMethod = {
  id: "card" | "kpay" | "wavepay" | "ayapay" | "uabpay";
  name: string;
  emoji: string;
  color: string;
  darkColor: string;
  description: string;
  reaction: string;
};

const METHODS: PaymentMethod[] = [
  {
    id: "card",
    name: "ကတ်",
    emoji: "💳",
    color: "#9FC4E8",
    darkColor: "#7BA3C9",
    description: "Visa, Mastercard, JCB",
    reaction: "ကတ်နဲ့ ချေမယ် — လုံခြုံတယ်! 💳",
  },
  {
    id: "kpay",
    name: "KPay",
    emoji: "📱",
    color: "#7BC4C4",
    darkColor: "#5CA3A3",
    description: "KBZ Pay",
    reaction: "KPay — မြန်ဆန်လွယ်ကူ! 📱",
  },
  {
    id: "wavepay",
    name: "WavePay",
    emoji: "🌊",
    color: "#E8D47B",
    darkColor: "#C9B55C",
    description: "Wave Money",
    reaction: "WavePay — စတင်ကြရအောင်! 🌊",
  },
  {
    id: "ayapay",
    name: "AYA Pay",
    emoji: "🅰️",
    color: "#B8A4D9",
    darkColor: "#9880B8",
    description: "AYA Bank",
    reaction: "AYA Pay — ယုံကြည်စိတ်ချ! 🅰️",
  },
  {
    id: "uabpay",
    name: "UAB Pay",
    emoji: "🏦",
    color: "#E8A8A8",
    darkColor: "#C97B7B",
    description: "UAB Bank",
    reaction: "UAB Pay — ကောင်းတယ်! 🏦",
  },
];

type Mood = "idle" | "happy" | "excited" | "thinking" | "wave";

// ============================================================
// PIP
// ============================================================
function Pip({
  mood = "idle",
  size = 80,
  prop,
  flameTop = PAL.accent,
  flameBottom = "#FFB84D",
}: {
  mood?: Mood;
  size?: number;
  prop?: string;
  flameTop?: string;
  flameBottom?: string;
}) {
  const bob = useSharedValue(0);
  const blink = useSharedValue(1);
  const propScale = useSharedValue(0);

  useEffect(() => {
    bob.value = withRepeat(
      withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    blink.value = withRepeat(
      withSequence(
        withTiming(0.1, { duration: 100 }),
        withTiming(1, { duration: 200 }),
        withDelay(2800, withTiming(1, { duration: 100 }))
      ),
      -1,
      false
    );
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
    transform: [
      { translateY: interpolate(bob.value, [0, 1], [0, -5]) },
      {
        rotate:
          mood === "excited"
            ? `${interpolate(bob.value, [0, 1], [-4, 4])}deg`
            : "0deg",
      },
    ],
  }));
  const eyeAnim = useAnimatedStyle(() => ({ transform: [{ scaleY: blink.value }] }));
  const propAnim = useAnimatedStyle(() => ({
    transform: [{ scale: propScale.value }],
    opacity: propScale.value,
  }));

  return (
    <Animated.View style={[bodyAnim, { width: size, height: size * 1.25 }]}>
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: size * 0.32,
          width: size * 0.36,
          height: size * 0.32,
          alignItems: "center",
        }}
      >
        <LinearGradient
          colors={[flameTop, flameBottom, "rgba(255,184,77,0)"]}
          locations={[0, 0.5, 1]}
          style={{
            width: size * 0.28,
            height: size * 0.3,
            borderTopLeftRadius: size * 0.14,
            borderTopRightRadius: size * 0.14,
            borderBottomLeftRadius: size * 0.03,
            borderBottomRightRadius: size * 0.03,
          }}
        />
      </View>
      <View
        style={{
          position: "absolute",
          bottom: size * 0.3,
          left: size * 0.04,
          width: size * 0.16,
          height: size * 0.3,
          backgroundColor: PAL.primaryDark,
          borderTopLeftRadius: size * 0.09,
          borderBottomLeftRadius: size * 0.15,
          transform: [{ rotate: "-14deg" }],
        }}
      />
      <View
        style={{
          position: "absolute",
          bottom: size * 0.3,
          right: size * 0.04,
          width: size * 0.16,
          height: size * 0.3,
          backgroundColor: PAL.primaryDark,
          borderTopRightRadius: size * 0.09,
          borderBottomRightRadius: size * 0.15,
          transform: [{ rotate: "14deg" }],
        }}
      />
      <View
        style={{
          position: "absolute",
          bottom: size * 0.15,
          left: size * 0.18,
          width: size * 0.64,
          height: size * 0.82,
          borderRadius: size * 0.32,
          backgroundColor: PAL.primary,
          borderWidth: 2.5,
          borderColor: PAL.primaryDark,
        }}
      >
        <View
          style={{
            position: "absolute",
            top: size * 0.14,
            left: size * 0.05,
            right: size * 0.05,
            bottom: size * 0.05,
            borderRadius: size * 0.25,
            backgroundColor: "#FFF5F0",
            borderWidth: 2,
            borderColor: PAL.primaryDark,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              gap: size * 0.13,
              marginTop: size * 0.12,
            }}
          >
            {[0, 1].map((i) => (
              <Animated.View
                key={i}
                style={[
                  eyeAnim,
                  {
                    width: size * 0.08,
                    height: size * 0.11,
                    borderRadius: size * 0.04,
                    backgroundColor: "#2D2422",
                    alignItems: "center",
                    justifyContent: "flex-start",
                  },
                ]}
              >
                <View
                  style={{
                    width: size * 0.03,
                    height: size * 0.03,
                    borderRadius: size * 0.015,
                    backgroundColor: "#FFFFFF",
                    marginTop: size * 0.02,
                    marginLeft: size * 0.025,
                  }}
                />
              </Animated.View>
            ))}
          </View>
          <View
            style={{
              alignSelf: "center",
              marginTop: size * 0.05,
              width: mood === "excited" ? size * 0.13 : size * 0.09,
              height: mood === "excited" ? size * 0.09 : size * 0.05,
              borderBottomLeftRadius: size * 0.06,
              borderBottomRightRadius: size * 0.06,
              backgroundColor: "#2D2422",
              overflow: "hidden",
            }}
          >
            <View
              style={{
                position: "absolute",
                bottom: 0,
                left: "25%",
                right: "25%",
                height: "45%",
                backgroundColor: "#FF6B8A",
                borderTopLeftRadius: size * 0.02,
                borderTopRightRadius: size * 0.02,
              }}
            />
          </View>
        </View>
        <View
          style={{
            position: "absolute",
            top: -size * 0.05,
            alignSelf: "center",
            width: size * 0.2,
            height: size * 0.2,
            borderRadius: size * 0.1,
            backgroundColor: PAL.secondary,
            borderWidth: 2,
            borderColor: PAL.secondaryDark,
          }}
        />
      </View>
      {prop && (
        <Animated.View
          style={[
            propAnim,
            {
              position: "absolute",
              bottom: 0,
              right: -size * 0.1,
              width: size * 0.4,
              height: size * 0.4,
              borderRadius: size * 0.2,
              backgroundColor: "#FFFFFF",
              borderWidth: 2.5,
              borderColor: PAL.primaryDark,
              alignItems: "center",
              justifyContent: "center",
            },
          ]}
        >
          <Text style={{ fontSize: size * 0.2 }}>{prop}</Text>
        </Animated.View>
      )}
    </Animated.View>
  );
}

// ============================================================
// MINIMAL INPUT
// ============================================================
function MinimalInput({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  secure = false,
  keyboardType = "default",
  focused,
  onFocus,
  onBlur,
  maxLength,
}: {
  label: string;
  icon?: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  secure?: boolean;
  keyboardType?: any;
  focused: boolean;
  onFocus: () => void;
  onBlur: () => void;
  maxLength?: number;
}) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text
        style={{
          fontFamily: FONT.extrabold,
          fontSize: 11,
          color: focused ? PAL.primary : PAL.textMuted,
          letterSpacing: 1,
          marginBottom: 6,
          marginLeft: 2,
        }}
      >
        {label}
      </Text>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderBottomWidth: focused ? 2.5 : 1.5,
          borderBottomColor: focused ? PAL.primary : PAL.divider,
          paddingBottom: 6,
        }}
      >
        {icon && (
          <Text style={{ fontSize: 16, marginRight: 8, opacity: focused ? 1 : 0.6 }}>
            {icon}
          </Text>
        )}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secure}
          autoCapitalize="none"
          keyboardType={keyboardType}
          placeholder={placeholder ?? label}
          placeholderTextColor={PAL.textMuted + "80"}
          onFocus={onFocus}
          onBlur={onBlur}
          maxLength={maxLength}
          style={{
            flex: 1,
            paddingVertical: 6,
            fontFamily: FONT.semibold,
            fontSize: 16,
            color: PAL.text,
          }}
        />
      </View>
    </View>
  );
}

// ============================================================
// PAYMENT METHOD TILE — 2-column grid, compact
// ============================================================
function PaymentTile({
  method,
  index,
  isActive,
  onPress,
  onHover,
}: {
  method: PaymentMethod;
  index: number;
  isActive: boolean;
  onPress: () => void;
  onHover: () => void;
}) {
  const scale = useSharedValue(1);

  const anim = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 60).springify()}
      style={{ flex: 1 }}
    >
      <Pressable
        onPressIn={() => {
          scale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
          onHover();
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 12, stiffness: 300 });
        }}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }}
      >
        <Animated.View
          style={[
            anim,
            {
              backgroundColor: isActive ? method.color + "22" : "transparent",
              borderRadius: 16,
              borderWidth: isActive ? 2 : 1.5,
              borderColor: isActive ? method.color : PAL.divider,
              paddingVertical: 14,
              paddingHorizontal: 12,
              alignItems: "center",
              justifyContent: "center",
              minHeight: 100,
            },
          ]}
        >
          <Text style={{ fontSize: 28 }}>{method.emoji}</Text>
          <Text
            style={{
              fontFamily: FONT.extrabold,
              fontSize: 13,
              color: isActive ? method.darkColor : PAL.text,
              marginTop: 6,
              textAlign: "center",
            }}
          >
            {method.name}
          </Text>
          <Text
            style={{
              fontFamily: FONT.semibold,
              fontSize: 10,
              color: PAL.textMuted,
              marginTop: 2,
              textAlign: "center",
            }}
          >
            {method.description}
          </Text>
          {isActive && (
            <View
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                width: 20,
                height: 20,
                borderRadius: 10,
                backgroundColor: method.color,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 11, color: "#FFFFFF", fontWeight: "900" }}>
                ✓
              </Text>
            </View>
          )}
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

// ============================================================
// MAIN SCREEN
// ============================================================
export default function PaymentScreen() {
  const router = useRouter();

  const [selected, setSelected] = useState<PaymentMethod>(METHODS[0]);
  const [mood, setMood] = useState<Mood>("idle");
  const [message, setMessage] = useState("ငွေချေနည်း ရွေးပါ! 💳");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  // Card form
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  // Wallet form
  const [walletPhone, setWalletPhone] = useState("");
  const [invoiceLast6, setInvoiceLast6] = useState("");

  const resetTimer = useRef<any>(null);

  const react = (newMood: Mood, msg: string) => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
    setMood(newMood);
    setMessage(msg);
    resetTimer.current = setTimeout(() => {
      setMood("idle");
      setMessage("ငွေချေနည်း ရွေးပါ! 💳");
    }, 2200);
  };

  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  const isCard = selected.id === "card";
  const amount = "15,000 ကျပ်";
  const plan = "ပရီမီယံ အစီအစဉ် · ၁ လ";

  const canPay = isCard
    ? cardNumber.length >= 16 && cardName.length > 0 && cardExpiry.length >= 4 && cardCvv.length >= 3
    : walletPhone.length >= 9 && invoiceLast6.length === 6;

  const handlePay = () => {
    if (!canPay) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      react("thinking", "အကွက်အားလုံး ဖြည့်ပါ! ⚠️");
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setProcessing(true);
    react("excited", "ငွေချေနေသည်... ⏳");

    setTimeout(() => {
      setProcessing(false);
      router.push("/(student)/payment-success");
    }, 1500);
  };

  const flameTop = `${selected.color}99`;
  const flameBottom = selected.color;

  // Split methods into 2 columns
  const leftMethods = METHODS.filter((_, i) => i % 2 === 0);
  const rightMethods = METHODS.filter((_, i) => i % 2 === 1);

  return (
    <View style={{ flex: 1, backgroundColor: PAL.bg }}>
      <LinearGradient
        colors={[PAL.bgTop, PAL.bg, PAL.bgBottom]}
        locations={[0, 0.5, 1]}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <SafeAreaView style={{ flex: 1 }}>
        <View
          style={{
            flex: 1,
            paddingHorizontal: isTablet ? 48 : 24,
            maxWidth: isTablet ? 600 : undefined,
            alignSelf: "center",
            width: "100%",
          }}
        >
          {/* Pip + message */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              marginTop: 12,
              marginBottom: 20,
            }}
          >
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                react("excited", "ပရီမီယံ ရယူကြရအောင်! 🎉");
              }}
            >
              <Pip
                mood={mood}
                size={isTablet ? 90 : 76}
                prop={selected.emoji}
                flameTop={flameTop}
                flameBottom={flameBottom}
              />
            </Pressable>
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

          {/* Title */}
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <Text
              style={{
                fontFamily: FONT.extrabold,
                fontSize: isTablet ? 38 : 30,
                color: PAL.text,
                letterSpacing: -1,
                lineHeight: isTablet ? 44 : 36,
              }}
            >
              ငွေချေရန်
            </Text>
            <Text
              style={{
                fontFamily: FONT.semibold,
                fontSize: 13,
                color: PAL.textMuted,
                marginTop: 6,
              }}
            >
              {plan}
            </Text>
          </Animated.View>

          {/* Amount summary */}
          <Animated.View entering={FadeInDown.delay(150).springify()}>
            <View
              style={{
                marginTop: 20,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingVertical: 16,
              }}
            >
              <View>
                <Text
                  style={{
                    fontFamily: FONT.extrabold,
                    fontSize: 11,
                    color: PAL.textMuted,
                    letterSpacing: 1.5,
                  }}
                >
                  စုစုပေါင်း
                </Text>
                <Text
                  style={{
                    fontFamily: FONT.extrabold,
                    fontSize: isTablet ? 36 : 28,
                    color: PAL.text,
                    letterSpacing: -0.8,
                    marginTop: 4,
                  }}
                >
                  {amount}
                </Text>
              </View>
              <View
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 999,
                  backgroundColor: PAL.accent + "30",
                  borderWidth: 1.5,
                  borderColor: PAL.accent,
                }}
              >
                <Text
                  style={{
                    fontFamily: FONT.extrabold,
                    fontSize: 11,
                    color: PAL.text,
                    letterSpacing: 1,
                  }}
                >
                  ⭐ ပရီမီယံ
                </Text>
              </View>
            </View>
          </Animated.View>

          <View
            style={{
              height: 1,
              backgroundColor: PAL.divider,
              marginBottom: 16,
            }}
          />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            {/* Payment methods — 2-column grid */}
            <Text
              style={{
                fontFamily: FONT.extrabold,
                fontSize: 11,
                color: PAL.textMuted,
                letterSpacing: 1.5,
                marginBottom: 10,
              }}
            >
              ငွေချေနည်း
            </Text>
            <View style={{ gap: 10 }}>
              {leftMethods.map((_, rowIndex) => {
                const leftMethod = leftMethods[rowIndex];
                const rightMethod = rightMethods[rowIndex];
                return (
                  <View
                    key={leftMethod.id}
                    style={{ flexDirection: "row", gap: 10 }}
                  >
                    <PaymentTile
                      method={leftMethod}
                      index={rowIndex * 2}
                      isActive={selected.id === leftMethod.id}
                      onHover={() => react("happy", leftMethod.reaction)}
                      onPress={() => {
                        setSelected(leftMethod);
                        react("excited", leftMethod.reaction);
                      }}
                    />
                    {rightMethod ? (
                      <PaymentTile
                        method={rightMethod}
                        index={rowIndex * 2 + 1}
                        isActive={selected.id === rightMethod.id}
                        onHover={() => react("happy", rightMethod.reaction)}
                        onPress={() => {
                          setSelected(rightMethod);
                          react("excited", rightMethod.reaction);
                        }}
                      />
                    ) : (
                      <View style={{ flex: 1 }} />
                    )}
                  </View>
                );
              })}
            </View>

            {/* Form fields */}
            <Animated.View
              entering={FadeInDown.delay(400).springify()}
              style={{ marginTop: 24 }}
            >
              <Text
                style={{
                  fontFamily: FONT.extrabold,
                  fontSize: 11,
                  color: PAL.textMuted,
                  letterSpacing: 1.5,
                  marginBottom: 12,
                }}
              >
                {isCard ? "ကတ် အချက်အလက်" : "ပိုက်ဆံအိတ် အချက်အလက်"}
              </Text>

              {isCard ? (
                <>
                  <MinimalInput
                    label="ကတ်နံပါတ်"
                    icon="💳"
                    value={cardNumber}
                    onChangeText={setCardNumber}
                    placeholder="1234 5678 9012 3456"
                    keyboardType="number-pad"
                    maxLength={16}
                    focused={focusedField === "cardNumber"}
                    onFocus={() => {
                      setFocusedField("cardNumber");
                      react("thinking", "ကတ်နံပါတ် ထည့်ပါ 💳");
                    }}
                    onBlur={() => setFocusedField(null)}
                  />
                  <MinimalInput
                    label="ကတ်ပိုင်ရှင် အမည်"
                    icon="👤"
                    value={cardName}
                    onChangeText={setCardName}
                    placeholder="AUNG AUNG"
                    focused={focusedField === "cardName"}
                    onFocus={() => {
                      setFocusedField("cardName");
                      react("thinking", "ကတ်ပေါ်က အမည် 👤");
                    }}
                    onBlur={() => setFocusedField(null)}
                  />
                  <View style={{ flexDirection: "row", gap: 12 }}>
                    <View style={{ flex: 1 }}>
                      <MinimalInput
                        label="သက်တမ်းကုန်"
                        value={cardExpiry}
                        onChangeText={setCardExpiry}
                        placeholder="MM/YY"
                        keyboardType="number-pad"
                        maxLength={4}
                        focused={focusedField === "expiry"}
                        onFocus={() => {
                          setFocusedField("expiry");
                          react("thinking", "MM/YY ပုံစံ 📅");
                        }}
                        onBlur={() => setFocusedField(null)}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <MinimalInput
                        label="CVV"
                        value={cardCvv}
                        onChangeText={setCardCvv}
                        placeholder="123"
                        keyboardType="number-pad"
                        secure
                        maxLength={4}
                        focused={focusedField === "cvv"}
                        onFocus={() => {
                          setFocusedField("cvv");
                          react("thinking", "ကတ်နောက်ကျော 🔒");
                        }}
                        onBlur={() => setFocusedField(null)}
                      />
                    </View>
                  </View>
                </>
              ) : (
                <>
                  <MinimalInput
                    label="ဖုန်းနံပါတ်"
                    icon="📱"
                    value={walletPhone}
                    onChangeText={setWalletPhone}
                    placeholder="09 xxx xxx xxx"
                    keyboardType="phone-pad"
                    maxLength={12}
                    focused={focusedField === "phone"}
                    onFocus={() => {
                      setFocusedField("phone");
                      react("thinking", `${selected.name} ဖုန်းနံပါတ် 📱`);
                    }}
                    onBlur={() => setFocusedField(null)}
                  />
                  <MinimalInput
                    label="ငွေတောင်းခံလွှာ နောက်ဆုံး ၆ လုံး"
                    icon="🧾"
                    value={invoiceLast6}
                    onChangeText={setInvoiceLast6}
                    placeholder="123456"
                    keyboardType="number-pad"
                    maxLength={6}
                    focused={focusedField === "invoice"}
                    onFocus={() => {
                      setFocusedField("invoice");
                      react("thinking", "ငွေတောင်းခံလွှာရဲ့ နောက်ဆုံး ၆ လုံး 🧾");
                    }}
                    onBlur={() => setFocusedField(null)}
                  />
                  <Text
                    style={{
                      fontFamily: FONT.semibold,
                      fontSize: 11,
                      color: PAL.textMuted,
                      marginTop: -8,
                      marginBottom: 12,
                      marginLeft: 4,
                      lineHeight: 16,
                    }}
                  >
                    💡 သင့်ငွေတောင်းခံလွှာရဲ့ နောက်ဆုံး ၆ လုံးကို ထည့်ပါ
                  </Text>
                </>
              )}
            </Animated.View>

            {/* Pay button */}
            <Animated.View entering={FadeInDown.delay(500).springify()}>
              <Pressable
                onPress={handlePay}
                disabled={processing}
                style={{
                  backgroundColor: canPay ? PAL.primary : PAL.divider,
                  borderRadius: 999,
                  paddingVertical: 16,
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 24,
                  flexDirection: "row",
                  gap: 8,
                  opacity: processing ? 0.6 : 1,
                }}
              >
                <Text style={{ fontSize: 16, color: "#FFFFFF" }}>
                  {processing ? "⏳" : "🔒"}
                </Text>
                <Text
                  style={{
                    fontFamily: FONT.extrabold,
                    fontSize: 16,
                    color: "#FFFFFF",
                    letterSpacing: 0.3,
                  }}
                >
                  {processing ? "ဆောင်ရွက်နေသည်..." : `ငွေချေမယ် · ${amount}`}
                </Text>
              </Pressable>
            </Animated.View>

            {/* Security note */}
            <View
              style={{
                flexDirection: "row",
                gap: 10,
                paddingHorizontal: 4,
                marginTop: 16,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 14 }}>🔒</Text>
              <Text
                style={{
                  fontFamily: FONT.semibold,
                  fontSize: 12,
                  color: PAL.textMuted,
                }}
              >
                သင့်ငွေချေမှုကို လုံခြုံစွာ ကုဒ်ဝှက်ထားပါသည်
              </Text>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
}