import { useState } from 'react';
import { View, Text, Alert, ScrollView, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { icons, images } from '@/constants';
import InputField from '@/components/InputField';
import CustomButton from '@/components/CustomButton';

export default function VehicleRegistration() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    registrationNumber: '',
    ownerName: '',
  });

  const handleVerifyVehicle = async () => {
    // Validate form
    if (!form.registrationNumber || !form.ownerName) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    // Format registration number (remove spaces and convert to uppercase)
    const formattedRegNumber = form.registrationNumber.replace(/\s+/g, '').toUpperCase();

    setLoading(true);

    try {
      const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:3000';
      
      console.log("📡 Verifying vehicle with RTO API...");
      console.log("Registration Number:", formattedRegNumber);
      
      // Get Clerk session token
      if (!token) {
        Alert.alert('Error', 'Please sign in to register your vehicle');
        return;
      }
      
      // Call backend to verify vehicle with RTO API
      const response = await fetch(`${backendUrl}/api/vehicle/verify-qr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          qrData: formattedRegNumber, // Using registration number as QR data
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        Alert.alert("Error", data.message || "Vehicle verification failed");
        setLoading(false);
        return;
      }

      console.log('✅ Vehicle found in RTO database:', data);
      
      // Navigate to name verification page
      router.push({
        pathname: '/(root)/verify-name',
        params: {
          vehicleId: data.data.vehicleId,
          registrationNumber: data.data.registrationNumber,
          make: data.data.make,
          model: data.data.model,
          ownerName: form.ownerName,
        },
      });
    } catch (error: any) {
      console.error("Vehicle verification error:", error);
      Alert.alert("Error", error.message || "Vehicle verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 bg-white">
        <View className="p-5 pt-16">
          {/* Back Button */}
          <TouchableOpacity 
            onPress={() => router.back()}
            className="mb-4"
          >
            <Image source={icons.backArrow} className="w-6 h-6" />
          </TouchableOpacity>


          {/* Info Banner */}
          <View className="bg-blue-50 p-4 rounded-lg mb-6">
            <View className="flex-row items-center mb-2">
              <Text className="text-2xl mr-2">🚗</Text>
              <Text className="text-blue-800 font-JakartaBold text-base">Vehicle Registration</Text>
            </View>
            <Text className="text-blue-700 text-sm leading-5">
              Enter your vehicle's registration number and owner name. We'll verify it with the RTO database.
            </Text>
          </View>

          {/* Registration Number Input */}
          <InputField
            label="Vehicle Registration Number"
            placeholder="e.g., MH12AB1234"
            icon={icons.search}
            value={form.registrationNumber}
            onChangeText={(value) => setForm({ ...form, registrationNumber: value.toUpperCase() })}
            autoCapitalize="characters"
          />

          {/* Owner Name Input */}
          <InputField
            label="Owner Name (as per RC)"
            placeholder="Enter vehicle owner name"
            icon={icons.person}
            value={form.ownerName}
            onChangeText={(value) => setForm({ ...form, ownerName: value })}
          />

          {/* Helper Text */}
          <View className="bg-gray-50 p-3 rounded-lg mb-4">
            <Text className="text-gray-600 text-xs font-Jakarta">
              💡 Tip: Enter the registration number without spaces. The owner name should match the one on your vehicle's Registration Certificate (RC).
            </Text>
          </View>

          {/* Verify Button */}
          <CustomButton
            title={loading ? "Verifying..." : "Verify Vehicle"}
            onPress={handleVerifyVehicle}
            className="mt-2"
            disabled={loading}
            IconLeft={() => loading ? (
              <ActivityIndicator size="small" color="#fff" className="mr-2" />
            ) : null}
          />

          {/* Skip Button */}
          <CustomButton
            title="Skip for Now"
            onPress={() => router.replace("/(root)/(tabs)/home")}
            className="mt-3"
            bgVariant="outline"
            textVariant="primary"
          />

          {/* Additional Info */}
          <View className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <Text className="text-yellow-800 font-JakartaSemiBold mb-2">
              Why verify your vehicle?
            </Text>
            <Text className="text-yellow-700 text-sm leading-5">
              • Required to book parking spots{'\n'}
              • Ensures secure parking{'\n'}
              • Faster entry and exit{'\n'}
              • Linked to your parking history
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
