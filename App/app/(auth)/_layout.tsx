import { Stack } from "expo-router";
import { Redirect } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";

const Layout = () => {
  const { user, isInSignupFlow } = useAuth();

  console.log('🔍 Auth Layout - user:', !!user, 'isInSignupFlow:', isInSignupFlow);

  // If already signed in and not in signup flow, redirect to home
  if (user && !isInSignupFlow) {
    console.log('🏠 Redirecting to home from auth layout');
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