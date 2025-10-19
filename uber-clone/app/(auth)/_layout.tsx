import { Stack } from "expo-router";
import { Redirect } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";

const Layout = () => {
  const { isSignedIn } = useAuth();

  // If already signed in, redirect to home
  if (isSignedIn) {
    return <Redirect href="/(root)/(tabs)/home" />;
  }

  return (
    <Stack>
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="sign-up" options={{ headerShown: false }} />
      <Stack.Screen name="sign-up-dev" options={{ headerShown: false }} />
      <Stack.Screen name="sign-in" options={{ headerShown: false }} />
    </Stack>
  );
};

export default Layout;