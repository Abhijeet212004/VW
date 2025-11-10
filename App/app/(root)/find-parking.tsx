import { router } from "expo-router";
import { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, Image, Text } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import ParkingMap from "@/components/ParkingMap";
import DestinationSheet from "@/components/DestinationSheet";
import { icons } from "@/constants";
import { useLocationStore, useParkingStore } from "@/store";
import { getParkingSpotsNearLocation, getParkingRecommendations, convertToMarkerData } from "@/lib/parking";

const FindParking = () => {
  const { userAddress, userLatitude, userLongitude } = useLocationStore();
  const { parkingSpots, setParkingSpots, selectedParkingSpot, setSelectedParkingSpot } = useParkingStore();
  const [searchedLocation, setSearchedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load parking spots and refresh every 5 seconds
  useEffect(() => {
    const loadParkingSpots = async () => {
      console.log('=== REFRESHING PARKING DATA ===');
      
      // Always use PICT coordinates for testing
      const lat = 18.5204;
      const lon = 73.8567;
      
      try {
        // Use simple location-based search on initial load
        const spots = await getParkingSpotsNearLocation(lat, lon);
        const markers = convertToMarkerData(spots);
        setParkingSpots(markers);
        console.log(`Updated: ${spots[0]?.available_spots}/${spots[0]?.total_spots} available`);
      } catch (error) {
        console.error("Error loading parking spots:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadParkingSpots();
    // Refresh every 5 seconds for real-time updates
    const interval = setInterval(loadParkingSpots, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLocationSearch = async (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    console.log('=== SEARCH TRIGGERED - Using ML Recommendations ===');
    console.log('User location:', userLatitude, userLongitude);
    console.log('Destination:', location);
    
    // Set the searched location to trigger map animation
    setSearchedLocation({
      latitude: location.latitude,
      longitude: location.longitude,
    });
    
    // Load smart parking recommendations using ML
    try {
      console.log('Fetching ML-powered parking recommendations...');
      
      // Use ML recommendations if we have both user and destination locations
      if (userLatitude && userLongitude) {
        const recommendations = await getParkingRecommendations(
          userLatitude,
          userLongitude,
          location.latitude,
          location.longitude,
          'car', // TODO: Get from user vehicle preferences
          2 // radiusKm
        );
        
        console.log('Got ML recommendations:', recommendations.length);
        const markers = convertToMarkerData(recommendations);
        console.log('Setting recommended parking spots, markers count:', markers.length);
        setParkingSpots(markers);
        console.log('=== ML RECOMMENDATIONS COMPLETE ===');
      } else {
        // Fallback to simple location search if user location unavailable
        console.log('User location unavailable, falling back to simple search');
        const spots = await getParkingSpotsNearLocation(
          location.latitude,
          location.longitude
        );
        console.log('Got spots from simple search:', spots.length);
        const markers = convertToMarkerData(spots);
        setParkingSpots(markers);
        console.log('=== SIMPLE SEARCH COMPLETE ===');
      }
    } catch (error) {
      console.error("Error loading parking recommendations:", error);
    }
  };

  const handleParkingSpotSelect = (spot: any) => {
    setSelectedParkingSpot(spot.id);
  };

  const handleBackPress = () => {
    router.back();
  };

  const goToPICT = () => {
    setSearchedLocation({
      latitude: 18.5204,
      longitude: 73.8567,
    });
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* Full Screen Map */}
        <View style={styles.fullMapContainer}>
          <ParkingMap
            parkingSpots={parkingSpots}
            selectedSpot={selectedParkingSpot}
            searchedLocation={searchedLocation}
            onParkingSpotPress={(spot) => {
              setSelectedParkingSpot(spot.id);
            }}
          />
        </View>

        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Image source={icons.backArrow} style={styles.backIcon} />
        </TouchableOpacity>

        {/* Debug Info */}
        <View style={styles.debugInfo}>
          <Text style={styles.debugText}>
            {isLoading ? 'Loading...' : `Spots: ${parkingSpots.length}`}
          </Text>
          <Text style={styles.debugText}>
            Lat: {searchedLocation?.latitude.toFixed(4) || 'PICT'}
          </Text>
          <TouchableOpacity 
            style={styles.pictButton}
            onPress={goToPICT}
          >
            <Text style={styles.debugText}>Go to PICT</Text>
          </TouchableOpacity>
        </View>

        {/* Draggable Bottom Sheet */}
        <DestinationSheet 
          onLocationSelect={handleLocationSearch}
          selectedParkingSpot={selectedParkingSpot ? parkingSpots.find(spot => spot.id === selectedParkingSpot) : null}
          onParkingSpotDeselect={() => setSelectedParkingSpot(null)}
          userAddress={userAddress || undefined}
        />
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#161616",
  },
  fullMapContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 100,
  },
  backIcon: {
    width: 20,
    height: 20,
    tintColor: '#000000',
  },
  debugInfo: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 10,
    borderRadius: 8,
    zIndex: 100,
  },
  debugText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default FindParking;
