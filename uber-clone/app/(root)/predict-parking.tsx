import { router } from "expo-router";
import { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import ParkingMap from "@/components/ParkingMap";
import PredictionDestinationSheet from "@/components/PredictionDestinationSheet";
import ParkingPredictionResultsSheet from "@/components/ParkingPredictionResultsSheet";
import { icons, predefinedParkingSpots } from "@/constants";
import { useLocationStore, useParkingStore } from "@/store";
import { convertToMarkerData } from "@/lib/parking";
import { getParkingRecommendations } from "@/lib/ml-prediction";

const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const PredictParking = () => {
  const { parkingSpots, setParkingSpots } = useParkingStore();
  const [searchedLocation, setSearchedLocation] = useState<{
    latitude: number;
    longitude: number;
    address?: string;
  } | null>(null);
  const [showResultsSheet, setShowResultsSheet] = useState(false);
  const [top3Spots, setTop3Spots] = useState<any[]>([]);

  useEffect(() => {
    const loadAllParkingSpots = () => {
      try {
        const spotsWithMarkers = predefinedParkingSpots.map(spot => ({
          ...spot,
          available_spots: Math.floor(spot.total_spots * 0.7),
          distance: 0,
        }));
        
        const markers = convertToMarkerData(spotsWithMarkers);
        setParkingSpots(markers);
        console.log(`✅ Loaded ${spotsWithMarkers.length} predefined parking spots:`, spotsWithMarkers.map(s => s.title));
      } catch (error) {
        console.error("Error loading parking spots:", error);
      }
    };

    loadAllParkingSpots();
  }, []);

  // Test function - you can call this to simulate searching for Seasons Mall
  const testSeasonsSearch = () => {
    console.log('🧪 Testing Seasons Mall search...');
    const seasonsLocation = {
      latitude: 18.5089,
      longitude: 73.9260,
      address: "Seasons Mall Magarpatta, Hadapsar, Pune"
    };
    handleLocationSearch(seasonsLocation);
  };

  const handleLocationSearch = async (location: {
    latitude: number;
    longitude: number;
    address?: string;
  }) => {
    console.log('🔍 Location selected for prediction:', location);
    setSearchedLocation(location);

    try {
      // Get ML-powered recommendations for the searched location
      const recommendations = await getParkingRecommendations({
        destination_location: {
          lat: location.latitude,
          lng: location.longitude,
        },
        planned_arrival_time: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes from now
        vehicle_type: 'car',
        max_walking_distance: 5000, // 5km radius to get more recommendations
      });

      console.log('🤖 ML recommendations received:', recommendations);

      if (recommendations.success && recommendations.top_recommendations.length > 0) {
        // Transform ML recommendations to our format
        const transformedSpots = recommendations.top_recommendations.map((rec, index) => {
          // Find matching predefined spot by parking_area name
          const matchingSpot = predefinedParkingSpots.find(spot => 
            spot.ml_area === rec.parking_id || spot.title.includes(rec.parking_area)
          );

          return {
            id: matchingSpot?.id || index + 1,
            ml_area: rec.parking_id,
            title: rec.parking_area,
            name: rec.parking_area,
            address: matchingSpot?.address || 'Pune, Maharashtra',
            latitude: rec.coordinates?.lat || matchingSpot?.latitude || location.latitude,
            longitude: rec.coordinates?.lng || matchingSpot?.longitude || location.longitude,
            price_per_hour: matchingSpot?.price_per_hour || 25,
            total_spots: rec.total_slots || matchingSpot?.total_spots || 100,
            is_covered: matchingSpot?.is_covered || true,
            has_security: matchingSpot?.has_security || true,
            rating: matchingSpot?.rating || 4.0,
            image_url: matchingSpot?.image_url || 'https://example.com/parking.jpg',
            available_spots: Math.floor((rec.availability_percentage / 100) * rec.total_slots),
            distance: rec.walking_distance_meters / 1000, // Convert to km
            availability_percentage: rec.availability_percentage, // ML prediction
            walking_time_minutes: rec.walking_time_minutes,
            travel_info: rec.travel_info,
            conditions: rec.conditions,
          };
        });

        console.log('🏆 Transformed ML parking spots:', transformedSpots.map(s => `${s.title} (${s.availability_percentage}%)`));
        
        // Debug: Log the first spot's complete data
        if (transformedSpots.length > 0) {
          console.log('🔍 First spot detailed data:', transformedSpots[0]);
        }
        
        setTop3Spots(transformedSpots);
        
        // Small delay to ensure destination sheet disappears first
        setTimeout(() => {
          setShowResultsSheet(true);
          console.log('✅ Results sheet should now be visible with ML predictions');
          console.log('📊 State after update:', { 
            spotsCount: transformedSpots.length, 
            showResultsSheet: true,
            hasSearchedLocation: !!location 
          });
        }, 200);
      } else {
        console.log('⚠️ No ML recommendations found, falling back to distance-based approach');
        // Fallback to distance-based approach
        await handleLocationSearchFallback(location);
      }
    } catch (error) {
      console.error('❌ Error getting ML recommendations:', error);
      // Fallback to distance-based approach
      await handleLocationSearchFallback(location);
    }
  };

  // Fallback function using distance calculation
  const handleLocationSearchFallback = async (location: {
    latitude: number;
    longitude: number;
    address?: string;
  }) => {
    try {
      const spotsWithDistance = predefinedParkingSpots.map(spot => {
        const distance = calculateDistance(
          location.latitude,
          location.longitude,
          spot.latitude,
          spot.longitude
        );
        
        return {
          ...spot,
          available_spots: Math.floor(spot.total_spots * 0.7),
          distance: distance,
          availability_percentage: 65, // Default fallback percentage
        };
      });

      const sortedSpots = spotsWithDistance
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 3);

      console.log('📍 Fallback: Top 3 nearest parking spots:', sortedSpots.map(s => `${s.title} (${s.distance.toFixed(2)}km)`));
      
      setTop3Spots(sortedSpots);
      setShowResultsSheet(true);
    } catch (error) {
      console.error('❌ Fallback search failed:', error);
    }
  };

  const handleParkingSpotSelect = (spot: any) => {
    console.log('Selected parking spot from results:', spot);
  };

  const handleCloseResults = () => {
    setShowResultsSheet(false);
    setSearchedLocation(null);
    setTop3Spots([]);
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.mapContainer}>
        <ParkingMap
          parkingSpots={parkingSpots}
          onParkingSpotPress={() => {}}
          searchedLocation={searchedLocation}
        />
      </View>

      <TouchableOpacity onPress={() => router.back()} style={styles.backButtonOverlay}>
        <Image source={icons.backArrow} style={styles.backIcon} />
      </TouchableOpacity>

      {/* Show destination search sheet only when not showing results */}
      {!showResultsSheet && (
        <PredictionDestinationSheet onLocationSelect={handleLocationSearch} />
      )}
      
      {/* Results sheet with top 3 predictions */}
      {showResultsSheet && searchedLocation && top3Spots.length > 0 && (
        <ParkingPredictionResultsSheet
          parkingSpots={top3Spots}
          userLocation={{
            latitude: searchedLocation.latitude,
            longitude: searchedLocation.longitude,
          }}
          isVisible={showResultsSheet}
          onClose={handleCloseResults}
          onParkingSpotSelect={handleParkingSpotSelect}
        />
      )}
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#161616",
  },
  mapContainer: {
    flex: 1,
  },
  backButtonOverlay: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: "#fff",
  },
});

export default PredictParking;
