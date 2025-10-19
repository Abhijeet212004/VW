import { useState } from "react";
import OAut from "@/components/OAuth";
import { Link, router } from "expo-router";
import { icons, images } from "@/constants";
import { useSignUp } from "@clerk/clerk-expo";
import InputField from "@/components/InputField";
import ReactNativeModal from "react-native-modal";
import CustomButton from "@/components/CustomButton";
import { Alert, Image, ScrollView, Text, View } from "react-native";
import { fetchAPI } from "@/lib/fetch";

const SignUp = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [showSuccessModal, setshowSuccessModal] = useState(false);
  const [pendingSessionId, setPendingSessionId] = useState<string | null>(null);

  console.log("🔍 SignUp component - showSuccessModal:", showSuccessModal);

  const [form, setform] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [verification, setVerification] = useState({
    state: "default",
    error: "",
    code: "",
  });

  console.log("🔍 SignUp component - verification.state:", verification.state);

  const onSignUpPress = async () => {
    if (!isLoaded) {
      return;
    }

    try {
      await signUp.create({
        emailAddress: form.email,
        password: form.password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      setVerification({
        ...verification,

        state: "pending",
      });
    } catch (err: any) {
      Alert.alert("Error", err.errors[0].longMessage);
    }
  };

  const onPressVerify = async () => {
    if (!isLoaded) return;

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verification.code,
      });

      if (completeSignUp.status === "complete") {
        console.log("✅ Clerk sign up completed successfully!");
        
        // Register user in backend database BEFORE activating session
        const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:3000';
        
        try {
          console.log("📡 Registering user in backend...");
          
          const response = await fetch(`${backendUrl}/api/auth/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: form.name,
              email: form.email,
              clerkId: completeSignUp.createdUserId,
            }),
          });

          const data = await response.json();
          
          if (!response.ok) {
            console.error('❌ Backend registration failed:', data);
          } else {
            console.log('✅ User successfully registered in backend:', data);
          }
        } catch (backendError) {
          console.error('❌ Backend registration error:', backendError);
        }

        // Close verification modal first, then show success modal
        setVerification({ ...verification, state: "default" });
        
        console.log("🎉 Closing verification modal and preparing success modal");
        
        // Wait a moment for verification modal to close, then show success modal
        setTimeout(() => {
          setshowSuccessModal(true);
          console.log("✅ Setting showSuccessModal to TRUE");
        }, 300);
        
        // Store session for later activation
        setPendingSessionId(completeSignUp.createdSessionId);
      } else {
        setVerification({
          ...verification,
          error: "Verification Failed",
          state: "failed",
        });
      }
    } catch (err: any) {
      setVerification({
        ...verification,
        error: err.errors[0].longMessage,
        state: "failed",
      });
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 bg-white">
        <View className="relative w-full h-[250px]">
          <Image source={images.signUpCar} className="z-0 w-full h-[250px]" />
          <Text className="text-2xl text-black font-JakartaSemiBold absolute bottom-5 left-5">
            Create Your Account
          </Text>
        </View>
        <View className="p-5">
          <InputField
            label="Name"
            placeholder="Enter Your Name"
            icon={icons.person}
            value={form.name}
            onChangeText={(value) => setform({ ...form, name: value })}
          />
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

          <CustomButton
            title="Sign Up"
            onPress={onSignUpPress}
            className="mt-6"
          />

          <OAut />

          <Link
            href="/sign-in"
            className="text-lg text-center text-general-200 mt-6"
          >
            <Text>Already have an account? </Text>
            <Text className="text-primary-500">LogIn</Text>
          </Link>
        </View>

        <ReactNativeModal
          isVisible={verification.state === "pending"}
          onModalHide={() => {
            console.log("📋 Verification modal hidden. State:", verification.state);
            if (verification.state === "success") {
              console.log("✅ Setting showSuccessModal to TRUE");
              setshowSuccessModal(true);
            }
          }}
        >
          <View className="bg-white px-7 py-9 rounded-2xl min-h-[300px]">
            <Text className="text-2xl font-JakartaExtraBold mb-2">
              verification
            </Text>
            <Text className="font-Jakarta mb-5">
              We've sent a verification code to {form.email}
            </Text>

            <InputField
              label="code"
              icon={icons.lock}
              placeholder="12345"
              value={verification.code}
              keyboardType="numeric"
              onChangeText={(code) =>
                setVerification({ ...verification, code })
              }
            />

            {verification.error && (
              <Text className="text-red-500 text-sm mt-1">
                {verification.error}
              </Text>
            )}

            <CustomButton
              title="Verify Email"
              onPress={onPressVerify}
              className="mt-5 bg-success-500"
            />
          </View>
        </ReactNativeModal>
        <ReactNativeModal 
          isVisible={showSuccessModal}
          backdropOpacity={0.7}
          animationIn="zoomIn"
          animationOut="zoomOut"
          backdropTransitionOutTiming={0}
        >
          <View className="bg-white px-7 py-9 rounded-2xl min-h-[300px]">
            <Image
              source={images.check}
              className="w-[110px] h-[110px] mx-auto my-5"
            />
            <Text className="text-3xl font-JakartaBold text-center">
              Welcome to ParkEasy! 🎉
            </Text>
            <Text className="text-base text-gray-400 font-Jakarta text-center mt-2">
              Your account has been created successfully. Let's verify your vehicle to start parking!
            </Text>

            <CustomButton
              title="Verify My Vehicle"
              onPress={async () => {
                setshowSuccessModal(false);
                // Activate session now
                if (pendingSessionId && setActive) {
                  await setActive({ session: pendingSessionId });
                }
                setTimeout(() => {
                  router.replace("/(root)/scan-qr");
                }, 300);
              }}
              className="mt-5"
            />
            
            <CustomButton
              title="I'll Do This Later"
              onPress={async () => {
                setshowSuccessModal(false);
                // Activate session now
                if (pendingSessionId && setActive) {
                  await setActive({ session: pendingSessionId });
                }
                setTimeout(() => {
                  router.replace("/(root)/(tabs)/home");
                }, 300);
              }}
              className="mt-3"
              bgVariant="outline"
            />
          </View>
        </ReactNativeModal>
      </View>
    </ScrollView>
  );
};

export default SignUp;

function setVerification(arg0: any) {
  throw new Error("Function not implemented.");
}
