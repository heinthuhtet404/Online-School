import { View, ScrollView, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CANDY } from "../../lib/design";

type Props = {
  children: React.ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
};

export default function CandyPage({ children, scroll = true, style }: Props) {
  if (scroll) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: CANDY.bg }}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 32, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: CANDY.bg, ...style }}>
      {children}
    </SafeAreaView>
  );
}