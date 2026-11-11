import { Text, ViewStyle, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { CANDY, FONT, R } from "../../lib/design";

type Props = {
  label: string;
  onPress: () => void;
  color?: string;
  textColor?: string;
  icon?: string;
  style?: ViewStyle;
  size?: "sm" | "md" | "lg";
  haptic?: "light" | "medium" | "heavy";
  disabled?: boolean;
};

export default function CandyButton({
  label,
  onPress,
  color = CANDY.primary,
  textColor = "#FFFFFF",
  icon,
  style,
  size = "md",
  haptic = "medium",
  disabled = false,
}: Props) {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const anim = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  const paddingY = size === "lg" ? 20 : size === "sm" ? 12 : 16;
  const fontSize = size === "lg" ? 18 : size === "sm" ? 13 : 15;

  return (
    <Pressable
      onPressIn={() => {
        scale.value = withSpring(0.96, { damping: 14, stiffness: 400 });
        translateY.value = withSpring(3, { damping: 14, stiffness: 400 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 12, stiffness: 300 });
        translateY.value = withSpring(0, { damping: 12, stiffness: 300 });
      }}
      onPress={() => {
        if (haptic === "heavy") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        else if (haptic === "light") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress();
      }}
      disabled={disabled}
    >
      <Animated.View
        style={[
          {
            backgroundColor: color,
            borderRadius: R.xl,
            paddingVertical: paddingY,
            paddingHorizontal: 22,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            opacity: disabled ? 0.5 : 1,
            // Tactile "3D" shadow below button
            shadowColor: color,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.35,
            shadowRadius: 12,
            elevation: 8,
          },
          style,
          anim,
        ]}
      >
        {icon && <Text style={{ fontSize: fontSize + 2 }}>{icon}</Text>}
        <Text
          style={{
            fontFamily: FONT.extrabold,
            fontSize,
            color: textColor,
            letterSpacing: 0.3,
          }}
        >
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}