import { Text, Pressable, ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { CANDY, R } from "../../lib/design";

type Props = {
  emoji: string;
  onPress: () => void;
  bg?: string;
  size?: number;
  style?: ViewStyle;
};

export default function CandyIconButton({
  emoji,
  onPress,
  bg = CANDY.surface,
  size = 48,
  style,
}: Props) {
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable
      onPressIn={() => (scale.value = withSpring(0.9, { damping: 14, stiffness: 400 }))}
      onPressOut={() => (scale.value = withSpring(1, { damping: 12, stiffness: 300 }))}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
    >
      <Animated.View
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: bg,
            alignItems: "center",
            justifyContent: "center",
            shadowColor: CANDY.shadow,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 4,
          },
          style,
          anim,
        ]}
      >
        <Text style={{ fontSize: size * 0.45 }}>{emoji}</Text>
      </Animated.View>
    </Pressable>
  );
}