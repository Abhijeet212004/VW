import { useAuth } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";
import { ActivityIndicator, View, Text } from "react-native";
import { useCarPlay } from "../carplay/useCarPlay";

const Home = () => {
  const { isSignedIn, isLoaded } = useAuth();
  
  // Optional CarPlay integration - won't break if not installed
  const { isAvailable: carPlayAvailable, isCarPlayMode } = useCarPlay();

  console.log("Auth state - isSignedIn:", isSignedIn, "isLoaded:", isLoaded);
  
  if (carPlayAvailable) {
    console.log("🚗 CarPlay support enabled");
    if (isCarPlayMode()) {
      console.log("🚗 Running in CarPlay mode");
    }
  } else {
    console.log("📱 Running in mobile-only mode");
  }

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#0286FF" />
        <Text style={{ marginTop: 10, color: '#666' }}>Loading...</Text>
      </View>
    );
  }

  if (isSignedIn) {
    return <Redirect href="/(root)/(tabs)/home" />;
  }

  return <Redirect href="/(auth)/welcome" />;
};

export default Home;