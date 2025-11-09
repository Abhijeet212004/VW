import { useState } from "react";
import { Link, router } from "expo-router";
import { icons, images } from "@/constants";
import { useAuth } from "@/contexts/AuthContext";
import InputField from "@/components/InputField";
import ReactNativeModal from "react-native-modal";
import CustomButton from "@/components/CustomButton";
import VehicleEntryModal from "@/components/VehicleEntryModal";
import { Alert, Image, ScrollView, Text, View } from "react-native";

const SignUp = () => {
  const { signUp } = useAuth();
  const [showSuccessModal, setshowSuccessModal] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Debug vehicle modal state changes
  console.log('🚗 SignUp render - showVehicleModal:', showVehicleModal, 'showSuccessModal:', showSuccessModal);

  const [form, setform] = useState({
    name: "",
    email: "",
    password: "",
  });

  const onSignUpPress = async () => {
    if (!form.name || !form.email || !form.password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      const result = await signUp(form.name, form.email, form.password);
      
      if (result.success) {
        setshowSuccessModal(true);
      } else {
        Alert.alert("Sign Up Failed", result.message);
      }
    } catch (error) {
      console.error("Sign up error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
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
            placeholder="Enter your name"
            icon={icons.person}
            value={form.name}
            onChangeText={(value) => setform({ ...form, name: value })}
          />

          <InputField
            label="Email"
            placeholder="Enter your email"
            icon={icons.email}
            textContentType="emailAddress"
            value={form.email}
            onChangeText={(value) => setform({ ...form, email: value })}
          />

          <InputField
            label="Password"
            placeholder="Enter your password"
            icon={icons.lock}
            secureTextEntry={true}
            textContentType="password"
            value={form.password}
            onChangeText={(value) => setform({ ...form, password: value })}
          />

          <CustomButton
            title="Sign Up"
            onPress={onSignUpPress}
            className="mt-6"
            disabled={isLoading}
          />

          <Link
            href="/sign-in"
            className="text-lg text-center text-general-200 mt-10"
          >
            Already have an account?{" "}
            <Text className="text-primary-500">Log In</Text>
          </Link>
        </View>

        {/* Success Modal */}
        <ReactNativeModal
          isVisible={showSuccessModal}
          onBackdropPress={() => setshowSuccessModal(false)}
        >
          <View className="bg-white px-7 py-9 rounded-2xl min-h-[300px]">
            <Image
              source={images.check}
              className="w-[110px] h-[110px] mx-auto my-5"
            />

            <Text className="text-3xl font-JakartaBold text-center">
              Verified
            </Text>

            <Text className="text-base text-gray-400 font-Jakarta text-center mt-2">
              You have successfully created your account.
            </Text>

            <CustomButton
              title="Add Vehicle"
              onPress={() => {
                console.log('🚗 Add Vehicle button clicked');
                setshowSuccessModal(false);
                console.log('✅ Success modal closed');
                setTimeout(() => {
                  console.log('🔄 Opening vehicle modal');
                  setShowVehicleModal(true);
                }, 300);
              }}
              className="mt-5"
            />
            
            <CustomButton
              title="Skip for now"
              onPress={() => {
                setshowSuccessModal(false);
                setTimeout(() => {
                  router.replace("/(root)/(tabs)/home");
                }, 300);
              }}
              className="mt-3"
              bgVariant="outline"
            />
          </View>
        </ReactNativeModal>

        <VehicleEntryModal
          visible={showVehicleModal}
          onClose={() => {
            console.log('🚗 Vehicle modal closing');
            setShowVehicleModal(false);
            // Navigate to home after modal closes
            setTimeout(() => {
              console.log('🏠 Navigating to home');
              router.replace("/(root)/(tabs)/home");
            }, 300);
          }}
        />

        {/* Debug: Test modal visibility */}
        {showVehicleModal && (
          <View style={{ position: 'absolute', top: 100, left: 20, backgroundColor: 'red', padding: 10, zIndex: 9999 }}>
            <Text style={{ color: 'white' }}>Vehicle Modal State: TRUE</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default SignUp;