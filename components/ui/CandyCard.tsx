import { View, Pressable, ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { CANDY, R, SHADOW } from "../../lib/design";

type Props = {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  bg?: string;
  haptic?: boolean;
  disabled?: boolean;
};

export default function CandyCard({
  children,
  onPress,
  style,
  bg = CANDY.surface,
  haptic = true,
  disabled = false,
}: Props) {
  const scale = useSharedValue(1);
  const shadowOpacity = useSharedValue(0.22);
  const translateY = useSharedValue(0);

  const anim = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  const Wrapper: any = onPress ? Pressable : View;

  return (
    <Wrapper
      onPressIn={
        onPress
          ? () => {
              scale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
              translateY.value = withSpring(2, { damping: 15, stiffness: 400 });
            }
          : undefined
      }
      onPressOut={
        onPress
          ? () => {
              scale.value = withSpring(1, { damping: 12, stiffness: 300 });
              translateY.value = withSpring(0, { damping: 12, stiffness: 300 });
            }
          : undefined
      }
      onPress={
        onPress
          ? () => {
              if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onPress();
            }
          : undefined
      }
      disabled={disabled}
    >
      <Animated.View
        style={[
          {
            backgroundColor: bg,
            borderRadius: R.lg,
            padding: 16,
            ...SHADOW.card,
          },
          style,
          anim,
        ]}
      >
        {children}
      </Animated.View>
    </Wrapper>
  );
}