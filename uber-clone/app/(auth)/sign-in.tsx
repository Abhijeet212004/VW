import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import OAut from "@/components/OAuth";
import { icons, images } from "@/constants";
import { Link, useRouter} from "expo-router";
import { useCallback, useState } from "react";
import { Image, ScrollView, Text, View, Alert, ActivityIndicator } from "react-native";
import { useSignIn } from '@clerk/clerk-expo'



const SignIn = ()  => {
    const { signIn, setActive, isLoaded } = useSignIn()
    const router = useRouter()
    const [loading, setLoading] = useState(false);
    const [form, setform] = useState({
        email:'',
        password:'',
    });

    const onSignInPress = useCallback(async () => {
        if (!isLoaded) {
          Alert.alert("Please wait", "Clerk is still loading...");
          return
        }

        // Validate form
        if (!form.email || !form.password) {
          Alert.alert("Error", "Please fill in all fields");
          return;
        }
    
        setLoading(true);
        
        try {
          console.log("Attempting to sign in with:", form.email);
          
          const signInAttempt = await signIn.create({
            identifier: form.email,
            password: form.password,
          })
    
          console.log("Sign in attempt status:", signInAttempt.status);
          
          if (signInAttempt.status === 'complete') {
            await setActive({ session: signInAttempt.createdSessionId })
            
            // Check if user exists in backend
            const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:3000';
            try {
              const token = await signIn.createdSessionId;
              const response = await fetch(`${backendUrl}/api/auth/profile`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              });
              
              if (!response.ok) {
                console.log("User not found in backend, profile might need to be created");
              } else {
                const userData = await response.json();
                console.log("User profile loaded from backend:", userData);
              }
            } catch (backendError) {
              console.error('Backend profile check error:', backendError);
            }
            
            console.log("Sign in successful, redirecting...");
            setLoading(false);
            router.replace('/')
          } else {
            setLoading(false);
            console.error("Sign in incomplete:", JSON.stringify(signInAttempt, null, 2))
            Alert.alert("Error", "Sign in incomplete. Please try again.");
          }
        } catch (err: any) {
          setLoading(false);
          console.error("Sign in error:", JSON.stringify(err, null, 2))
          const errorMessage = err.errors?.[0]?.message || err.message || "Failed to sign in";
          Alert.alert("Sign In Failed", errorMessage);
        }
      }, [isLoaded, form.email, form.password])

    return(
        <ScrollView className="flex-1 bg-white">
            <View className="flex-1 bg-white">
                <View className="relative w-full h-[250px]">
                    <Image 
                        source={images.signUpCar} className="z-0 w-full h-[250px]"/>
                        <Text className="text-2xl text-black font-JakartaSemiBold absolute bottom-5 left-5">Welcome 👋</Text>
                </View>
                <View className="p-5">
                    <InputField 
                        label="Email"
                        placeholder="Enter Your Email"
                        icon={icons.email}
                        value={form.email}
                        onChangeText={(value) => setform({ ...form, email: value })}
                    />
                    <InputField 
                        label="Password"
                        placeholder="Enter Your Password"
                        icon={icons.lock}
                        secureTextEntry={true}
                        value={form.password}
                        onChangeText={(value) => setform({ ...form, password: value })}
                    />

                    {loading ? (
                        <View className="mt-6 flex items-center justify-center">
                            <ActivityIndicator size="large" color="#0286FF" />
                            <Text className="mt-2 text-general-200">Signing in...</Text>
                        </View>
                    ) : (
                        <CustomButton 
                        title="Sign In" 
                        onPress={onSignInPress} 
                        className="mt-6" 
                        />
                    )}

                    <OAut />

                    <Link 
                    href="/sign-up"
                    className="text-lg text-center text-general-200 mt-10"
                    >
                        <Text>Don't have an account?{" "}</Text>
                        <Text className="text-primary-500">Sign Up</Text>
                    </Link>
                </View>

                {/* Verification modal */}
            </View>
        </ScrollView>
    );
};

export default SignIn;