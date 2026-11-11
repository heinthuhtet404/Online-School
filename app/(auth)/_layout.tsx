import { Stack } from "expo-router";
import { CANDY } from "@/lib/design";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: CANDY.bg },
      }}
    />
  );
}