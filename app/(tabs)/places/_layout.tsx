import { Stack } from 'expo-router';

export default function PlacesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
      <Stack.Screen name="saved" />
      <Stack.Screen name="trip" />
    </Stack>
  );
}
