import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="modes" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="verify" />
      <Stack.Screen name="declare" />
    </Stack>
  );
}
