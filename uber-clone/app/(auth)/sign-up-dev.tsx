import { useState } from "react";
import { Link, router } from "expo-router";
import { icons, images } from "@/constants";
import InputField from "@/components/InputField";
import ReactNativeModal from "react-native-modal";
import CustomButton from "@/components/CustomButton";
import { Alert, Image, ScrollView, Text, View } from "react-native";

const SignUpDev = () => {
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const onSignUpPress = async () => {
    // Validate form
    if (!form.name || !form.email || !form.password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:3000';
      
      console.log("📡 Registering user in backend (DEV MODE)...");
      
      // For dev, we'll use email as clerkId
      const devClerkId = `dev_${form.email.replace('@', '_').replace('.', '_')}`;
      
      const response = await fetch(`${backendUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          clerkId: devClerkId,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        Alert.alert("Error", data.message || "Registration failed");
        return;
      }

      console.log('✅ User successfully registered in backend:', data);
      
      // Show success modal
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error("Registration error:", error);
      Alert.alert("Error", error.message || "Registration failed");
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 bg-white">
        <View className="relative w-full h-[250px]">
          <Image source={images.signUpCar} className="z-0 w-full h-[250px]" />
        </View>
        
        <View className="p-5">
          

          <InputField
            label="Name"
            placeholder="Enter Your Name"
            icon={icons.person}
            value={form.name}
            onChangeText={(value) => setForm({ ...form, name: value })}
          />
          <InputField
            label="Email"
            placeholder="Enter Your Email"
            icon={icons.email}
            value={form.email}
            onChangeText={(value) => setForm({ ...form, email: value })}
          />
          <InputField
            label="Password"
            placeholder="Enter Your Password"
            icon={icons.lock}
            secureTextEntry={true}
            value={form.password}
            onChangeText={(value) => setForm({ ...form, password: value })}
          />

          <CustomButton
            title="Sign Up (No Verification)"
            onPress={onSignUpPress}
            className="mt-6"
          />

          <Link
            href="/sign-in"
            className="text-lg text-center text-general-200 mt-6"
          >
            <Text>Already have an account? </Text>
            <Text className="text-primary-500">LogIn</Text>
          </Link>
        </View>

        <ReactNativeModal 
          isVisible={showSuccessModal}
          backdropOpacity={0.7}
          animationIn="zoomIn"
          animationOut="zoomOut"
          animationInTiming={300}
          animationOutTiming={200}
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
              Your account has been created. Let's verify your vehicle to start parking!
            </Text>

            <CustomButton
              title="Verify My Vehicle"
              onPress={() => {
                setShowSuccessModal(false);
                setTimeout(() => {
                  router.replace("/(root)/scan-qr");
                }, 300);
              }}
              className="mt-5"
            />
            
            <CustomButton
              title="I'll Do This Later"
              onPress={() => {
                setShowSuccessModal(false);
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

export default SignUpDev;
