import * as Linking from "expo-linking";
import * as SecureStore from "expo-secure-store";

import { fetchAPI } from "@/lib/fetch";

export const tokenCache = {
  async getToken(key: string) {
    try {
      const item = await SecureStore.getItemAsync(key);
      if (item) {
        console.log(`${key} was used 🔐 \n`);
      } else {
        console.log("No values stored under key: " + key);
      }
      return item;
    } catch (error) {
      console.error("SecureStore get item error: ", error);
      await SecureStore.deleteItemAsync(key);
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

export const googleOAuth = async (startOAuthFlow: any) => {
  try {
    console.log("🚀 Starting Google OAuth flow...");
    
    const { createdSessionId, setActive, signUp } = await startOAuthFlow({
      redirectUrl: Linking.createURL("/(root)/(tabs)/home"),
    });

    console.log("📊 OAuth Response:", { 
      createdSessionId: !!createdSessionId, 
      setActive: !!setActive, 
      signUp: !!signUp 
    });

    if (createdSessionId) {
      if (setActive) {
        await setActive({ session: createdSessionId });
        console.log("✅ Session activated successfully");

        if (signUp?.createdUserId) {
          console.log("📝 Registering new user in backend...");
          try {
            await fetchAPI("/(api)/user", {
              method: "POST",
              body: JSON.stringify({
                name: `${signUp.firstName} ${signUp.lastName}`,
                email: signUp.emailAddress,
                clerkId: signUp.createdUserId,
              }),
            });
            console.log("✅ User registered in backend successfully");
          } catch (backendError) {
            console.error("❌ Backend registration failed:", backendError);
            // Continue anyway, don't fail the entire OAuth flow
          }
        }

        return {
          success: true,
          code: "success",
          message: "You have successfully signed in with Google",
        };
      }
    }

    console.log("❌ OAuth flow incomplete - no session created");
    return {
      success: false,
      message: "An error occurred while signing in with Google",
    };
  } catch (err: any) {
    console.error("❌ Google OAuth Error:", err);
    return {
      success: false,
      code: err.code,
      message: err?.errors?.[0]?.longMessage || err.message || "Google sign-in failed",
    };
  }
};