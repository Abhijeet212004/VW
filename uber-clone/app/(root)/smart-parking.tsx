import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { icons } from '@/constants';
import * as Location from 'expo-location';
import DateTimePicker from '@react-native-community/datetimepicker';

interface UserLocation {
  lat: number;
  lng: number;
}

interface ParkingArea {
  area_id: string;
  name: string;
  total_slots: number;
  coordinates: UserLocation;
}

interface PredictionResult {
  success: boolean;
  parking_area: string;
  availability_percentage: number;
  estimated_arrival_time: string;
  travel_info: {
    distance_km: number;
    travel_time_minutes: number;
    traffic_factor: number;
  };
  conditions: {
    weather: string;
    temperature: number;
    traffic_density: number;
  };
  confidence: string;
}

interface RecommendationResult {
  success: boolean;
  top_recommendations: Array<{
    parking_area: string;
    parking_id: string;
    availability_percentage: number;
    walking_distance_meters: number;
    walking_time_minutes: number;
    total_slots: number;
    coordinates: UserLocation;
  }>;
  total_options: number;
}

const { width, height } = Dimensions.get('window');

const SmartParkingScreen = () => {
  const [currentLocation, setCurrentLocation] = useState<UserLocation | null>(null);
  const [parkingAreas, setParkingAreas] = useState<ParkingArea[]>([]);
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [destinationInput, setDestinationInput] = useState('');
  const [arrivalTime, setArrivalTime] = useState(new Date(Date.now() + 60 * 60 * 1000)); // 1 hour from now
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'predict' | 'recommend'>('predict');

  useEffect(() => {
    getCurrentLocation();
    fetchParkingAreas();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required for parking predictions');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setCurrentLocation({
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      });
    } catch (error) {
      console.error('Error getting location:', error);
      // Default to PICT location if location fails
      setCurrentLocation({ lat: 18.5204, lng: 73.8567 });
    }
  };

  const fetchParkingAreas = async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/parking/areas`, {
        headers: {
          'Authorization': `Bearer ${await getStoredToken()}`,
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      if (data.success) {
        setParkingAreas(data.parking_areas);
      }
    } catch (error) {
      console.error('Error fetching parking areas:', error);
      // Fallback data
      setParkingAreas([
        { area_id: 'main_gate', name: 'Main Gate Parking', total_slots: 150, coordinates: { lat: 18.5204, lng: 73.8567 } },
        { area_id: 'sports_complex', name: 'Sports Complex Parking', total_slots: 100, coordinates: { lat: 18.5198, lng: 73.8575 } },
        { area_id: 'auditorium', name: 'Auditorium Parking', total_slots: 80, coordinates: { lat: 18.5210, lng: 73.8560 } },
        { area_id: 'hostel_area', name: 'Hostel Area Parking', total_slots: 120, coordinates: { lat: 18.5215, lng: 73.8580 } },
        { area_id: 'library', name: 'Library Parking', total_slots: 60, coordinates: { lat: 18.5200, lng: 73.8570 } },
      ]);
    }
  };

  const getStoredToken = async (): Promise<string> => {
    // Import AsyncStorage here to avoid import issues
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    return await AsyncStorage.getItem('token') || '';
  };

  const predictAvailability = async () => {
    if (!currentLocation || !selectedArea) {
      Alert.alert('Error', 'Please select your location and parking area');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/parking/predict-availability`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await getStoredToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_location: currentLocation,
          parking_area: selectedArea,
          vehicle_type: 'car',
          planned_arrival_time: arrivalTime.toISOString(),
        }),
      });

      const data = await response.json();
      if (data.success) {
        setPredictionResult(data);
        setRecommendations(null);
      } else {
        Alert.alert('Error', data.error || 'Failed to get prediction');
      }
    } catch (error) {
      console.error('Prediction error:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRecommendations = async () => {
    if (!destinationInput) {
      Alert.alert('Error', 'Please enter a destination');
      return;
    }

    setLoading(true);
    try {
      // For demo, use PICT coordinates as destination
      const destinationLocation = { lat: 18.5204, lng: 73.8567 };

      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/parking/recommend`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await getStoredToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destination_location: destinationLocation,
          planned_arrival_time: arrivalTime.toISOString(),
          vehicle_type: 'car',
          max_walking_distance: 500,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setRecommendations(data);
        setPredictionResult(null);
      } else {
        Alert.alert('Error', data.error || 'Failed to get recommendations');
      }
    } catch (error) {
      console.error('Recommendation error:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatAvailabilityColor = (percentage: number) => {
    if (percentage >= 70) return '#10B981'; // Green
    if (percentage >= 40) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  const formatAvailabilityText = (percentage: number) => {
    if (percentage >= 70) return 'High';
    if (percentage >= 40) return 'Medium';
    return 'Low';
  };

  return (
    <SafeAreaView className="flex-1 bg-general-500">
      <ScrollView className="flex-1 px-5">
        <View className="flex-row items-center justify-center mt-5 mb-6">
          <Text className="text-2xl font-JakartaExtraBold text-white">
            🚗 Smart Parking
          </Text>
        </View>

        {/* Tab Selector */}
        <View className="flex-row bg-neutral-800 rounded-xl p-1 mb-6">
          <TouchableOpacity
            className={`flex-1 py-3 rounded-lg ${activeTab === 'predict' ? 'bg-primary-500' : 'bg-transparent'}`}
            onPress={() => setActiveTab('predict')}
          >
            <Text className={`text-center font-JakartaSemiBold ${activeTab === 'predict' ? 'text-white' : 'text-gray-400'}`}>
              Predict Availability
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-3 rounded-lg ${activeTab === 'recommend' ? 'bg-primary-500' : 'bg-transparent'}`}
            onPress={() => setActiveTab('recommend')}
          >
            <Text className={`text-center font-JakartaSemiBold ${activeTab === 'recommend' ? 'text-white' : 'text-gray-400'}`}>
              Get Recommendations
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'predict' && (
          <View>
            <Text className="text-lg font-JakartaSemiBold text-white mb-3">
              Select Parking Area
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
              {parkingAreas.map((area) => (
                <TouchableOpacity
                  key={area.area_id}
                  className={`mr-3 p-4 rounded-xl border-2 min-w-[200px] ${
                    selectedArea === area.area_id
                      ? 'border-primary-500 bg-primary-500/20'
                      : 'border-neutral-700 bg-neutral-800'
                  }`}
                  onPress={() => setSelectedArea(area.area_id)}
                >
                  <Text className="text-white font-JakartaSemiBold text-base mb-1">
                    {area.name}
                  </Text>
                  <Text className="text-gray-400 text-sm">
                    {area.total_slots} total slots
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {activeTab === 'recommend' && (
          <View>
            <Text className="text-lg font-JakartaSemiBold text-white mb-3">
              Enter Destination
            </Text>
            <View className="bg-neutral-800 rounded-xl p-4 mb-4">
              <TextInput
                className="text-white font-JakartaRegular text-base"
                placeholder="Enter your destination (e.g., PICT College)"
                placeholderTextColor="#9CA3AF"
                value={destinationInput}
                onChangeText={setDestinationInput}
              />
            </View>
          </View>
        )}

        {/* Arrival Time Picker */}
        <Text className="text-lg font-JakartaSemiBold text-white mb-3">
          Planned Arrival Time
        </Text>
        <TouchableOpacity
          className="bg-neutral-800 rounded-xl p-4 flex-row items-center justify-between mb-6"
          onPress={() => setShowDatePicker(true)}
        >
          <Text className="text-white font-JakartaRegular">
            {arrivalTime.toLocaleString()}
          </Text>
          <Image source={icons.arrowDown} className="w-5 h-5" tintColor="#9CA3AF" />
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={arrivalTime}
            mode="datetime"
            is24Hour={true}
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setArrivalTime(selectedDate);
            }}
          />
        )}

        {/* Action Button */}
        <TouchableOpacity
          className={`py-4 rounded-xl mb-6 ${loading ? 'bg-gray-600' : 'bg-primary-500'}`}
          onPress={activeTab === 'predict' ? predictAvailability : getRecommendations}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text className="text-white font-JakartaBold text-center text-lg">
              {activeTab === 'predict' ? '🔮 Predict Availability' : '🎯 Get Recommendations'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Results Section */}
        {predictionResult && (
          <View className="bg-neutral-800 rounded-xl p-5 mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-JakartaBold text-white">
                📊 Prediction Result
              </Text>
              <View className={`px-3 py-1 rounded-full`} style={{ backgroundColor: formatAvailabilityColor(predictionResult.availability_percentage) }}>
                <Text className="text-white font-JakartaSemiBold text-sm">
                  {formatAvailabilityText(predictionResult.availability_percentage)}
                </Text>
              </View>
            </View>

            <View className="bg-neutral-700 rounded-lg p-4 mb-4">
              <Text className="text-white font-JakartaSemiBold text-lg mb-2">
                {predictionResult.parking_area}
              </Text>
              <Text className="text-primary-500 font-JakartaExtraBold text-3xl mb-2">
                {predictionResult.availability_percentage}% chance
              </Text>
              <Text className="text-gray-400 font-JakartaRegular">
                of finding a parking spot when you arrive
              </Text>
            </View>

            <View className="space-y-3">
              <View className="flex-row justify-between">
                <Text className="text-gray-400">Distance:</Text>
                <Text className="text-white font-JakartaSemiBold">
                  {predictionResult.travel_info.distance_km.toFixed(1)} km
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-400">Travel Time:</Text>
                <Text className="text-white font-JakartaSemiBold">
                  {Math.round(predictionResult.travel_info.travel_time_minutes)} minutes
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-400">Weather:</Text>
                <Text className="text-white font-JakartaSemiBold">
                  {predictionResult.conditions.weather} ({predictionResult.conditions.temperature}°C)
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-400">Traffic:</Text>
                <Text className="text-white font-JakartaSemiBold">
                  {(predictionResult.conditions.traffic_density * 100).toFixed(0)}% density
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-gray-400">Confidence:</Text>
                <Text className="text-white font-JakartaSemiBold">
                  {predictionResult.confidence}
                </Text>
              </View>
            </View>
          </View>
        )}

        {recommendations && (
          <View className="mb-6">
            <Text className="text-xl font-JakartaBold text-white mb-4">
              🎯 Top 3 Recommendations
            </Text>
            {recommendations.top_recommendations.map((rec, index) => (
              <View key={rec.parking_id} className="bg-neutral-800 rounded-xl p-4 mb-3">
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center">
                    <View className="bg-primary-500 w-8 h-8 rounded-full items-center justify-center mr-3">
                      <Text className="text-white font-JakartaBold">{index + 1}</Text>
                    </View>
                    <Text className="text-white font-JakartaSemiBold text-lg">
                      {rec.parking_area}
                    </Text>
                  </View>
                  <View className={`px-3 py-1 rounded-full`} style={{ backgroundColor: formatAvailabilityColor(rec.availability_percentage) }}>
                    <Text className="text-white font-JakartaSemiBold text-sm">
                      {rec.availability_percentage.toFixed(0)}%
                    </Text>
                  </View>
                </View>

                <View className="flex-row justify-between">
                  <View className="flex-1">
                    <Text className="text-gray-400 text-sm">Walking Distance</Text>
                    <Text className="text-white font-JakartaSemiBold">
                      {rec.walking_distance_meters}m ({rec.walking_time_minutes} min)
                    </Text>
                  </View>
                  <View className="flex-1 items-end">
                    <Text className="text-gray-400 text-sm">Total Slots</Text>
                    <Text className="text-white font-JakartaSemiBold">
                      {rec.total_slots} slots
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default SmartParkingScreen;