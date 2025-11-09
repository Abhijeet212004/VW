import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import VehicleEntryModal from "@/components/VehicleEntryModal";
import { icons, images } from "@/constants";
import { Link, useRouter} from "expo-router";
import { useCallback, useState } from "react";
import { Image, ScrollView, Text, View, Alert, ActivityIndicator } from "react-native";
import { useAuth } from '@/contexts/AuthContext';

const SignIn = ()  => {
    const { signIn } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showVehicleModal, setShowVehicleModal] = useState(false);
    const [form, setform] = useState({
        email:'',
        password:'',
    });

    const onSignInPress = useCallback(async () => {
        if (!form.email || !form.password) {
          Alert.alert("Error", "Please fill in all fields");
          return;
        }

        setLoading(true);
        try {
          const result = await signIn(form.email, form.password);
          
          if (result.success) {
            // Show vehicle modal after successful login
            setShowVehicleModal(true);
          } else {
            Alert.alert("Sign In Failed", result.message);
          }
        } catch (error) {
          console.error("Sign in error:", error);
          Alert.alert("Error", "Something went wrong. Please try again.");
        } finally {
          setLoading(false);
        }
      }, [form.email, form.password]);

    return (
        <ScrollView className="flex-1 bg-white">
            <View className="flex-1 bg-white">
                <View className="relative w-full h-[250px]">
                    <Image source={images.signUpCar} className="z-0 w-full h-[250px]" />
                    <Text className="text-2xl text-black font-JakartaSemiBold absolute bottom-5 left-5">
                        Welcome Back
                    </Text>
                </View>

                <View className="p-5">
                    <InputField
                        label="Email"
                        placeholder="Enter email"
                        icon={icons.email}
                        textContentType="emailAddress"
                        value={form.email}
                        onChangeText={(value) => setform({ ...form, email: value })}
                    />

                    <InputField
                        label="Password"
                        placeholder="Enter password"
                        icon={icons.lock}
                        secureTextEntry={true}
                        textContentType="password"
                        value={form.password}
                        onChangeText={(value) => setform({ ...form, password: value })}
                    />

                    <CustomButton
                        title="Sign In"
                        onPress={onSignInPress}
                        className="mt-6"
                        disabled={loading}
                    />

                    <Link
                        href="/sign-up"
                        className="text-lg text-center text-general-200 mt-10"
                    >
                        Don't have an account?{" "}
                        <Text className="text-primary-500">Sign Up</Text>
                    </Link>
                </View>

                <VehicleEntryModal
                  visible={showVehicleModal}
                  onClose={() => setShowVehicleModal(false)}
                />
            </View>
        </ScrollView>
    );
};

export default SignIn;