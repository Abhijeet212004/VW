import { Stack } from "expo-router";

const Layout = () => {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="find-ride" options={{ headerShown: false }} />
      <Stack.Screen name="confirm-ride" options={{ headerShown: false }} />
      <Stack.Screen name="book-ride" options={{ headerShown: false }} />
      <Stack.Screen name="find-parking" options={{ headerShown: false }} />
      <Stack.Screen name="predict-parking" options={{ headerShown: false }} />
      <Stack.Screen name="choose-spot" options={{ headerShown: false }} />
      <Stack.Screen name="parking-payment" options={{ headerShown: false }} />
      <Stack.Screen name="booking-confirmed" options={{ headerShown: false }} />
      <Stack.Screen name="parking-navigation" options={{ headerShown: false }} />
      <Stack.Screen name="scan-qr" options={{ headerShown: false }} />
      <Stack.Screen name="verify-name" options={{ headerShown: false }} />
    </Stack>
  );
};

export default Layout;