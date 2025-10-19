import React, { useEffect, useState, useRef } from "react";
import { ActivityIndicator, Text, View, StyleSheet, Alert, Platform, Image } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { icons } from "@/constants";
import { useLocationStore } from "@/store";
import { ParkingMarkerData } from "@/types/type";

// Uber-style dark Google Maps theme
const uberMapStyle = [
  {
    elementType: "geometry",
    stylers: [{ color: "#242f3e" }], // Uber's dark blue-gray base
  },
  {
    elementType: "labels.text.fill",
    stylers: [{ color: "#746855" }],
  },
  {
    elementType: "labels.text.stroke",
    stylers: [{ color: "#242f3e" }],
  },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#263c3f" }], // Dark green for parks
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b9a76" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }], // Uber's road color
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }], // Brown-gold for highways
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2835" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f3d19c" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2f3948" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }], // Dark blue water
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#17263c" }],
  },
];

interface ParkingMapProps {
  parkingSpots: ParkingMarkerData[];
  onParkingSpotPress?: (spot: ParkingMarkerData) => void;
  selectedSpot?: number | null;
  searchedLocation?: { latitude: number; longitude: number } | null;
}

const ParkingMap = ({ parkingSpots, onParkingSpotPress, selectedSpot, searchedLocation }: ParkingMapProps) => {
  const { 
    userLatitude, 
    userLongitude,
    setUserLocation 
  } = useLocationStore();

  const mapRef = useRef<MapView>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [hasRequested, setHasRequested] = useState(false);

  // Log parking spots when they change
  useEffect(() => {
    console.log('=== ParkingMap: Parking spots updated ===');
    console.log('Number of parking spots:', parkingSpots.length);
    if (parkingSpots.length > 0) {
      parkingSpots.forEach(spot => {
        console.log(`  - ${spot.title} at (${spot.latitude}, ${spot.longitude})`);
        console.log(`    Available: ${spot.available_spots}/${spot.total_spots}`);
      });
    } else {
      console.log('  No parking spots to display');
    }
  }, [parkingSpots]);

  // Animate to user location when it updates
  useEffect(() => {
    if (userLatitude && userLongitude && isMapReady && mapRef.current) {
      console.log('Animating map to user location:', userLatitude, userLongitude);
      mapRef.current.animateToRegion({
        latitude: userLatitude,
        longitude: userLongitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
  }, [userLatitude, userLongitude, isMapReady]);

  // Animate to searched location when user searches
  useEffect(() => {
    if (searchedLocation && isMapReady && mapRef.current) {
      console.log('Animating map to searched location:', searchedLocation.latitude, searchedLocation.longitude);
      mapRef.current.animateToRegion({
        latitude: searchedLocation.latitude,
        longitude: searchedLocation.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }, 1500);
    }
  }, [searchedLocation, isMapReady]);

  // Request location permission and get current location
  useEffect(() => {
    // Prevent multiple requests
    if (hasRequested) {
      console.log('Location already requested, skipping...');
      return;
    }

    setHasRequested(true);
    
    const requestLocationPermission = async () => {
      console.log('Requesting location permission...');
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        console.log('Permission status:', status);
        
        if (status === 'granted') {
          console.log('Location permission granted, getting current position...');
          
          // Get current location with high accuracy
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Highest,
          });
          
          const { latitude, longitude } = location.coords;
          console.log('Got location:', latitude, longitude);
          console.log('Location details:', {
            accuracy: location.coords.accuracy,
            altitude: location.coords.altitude,
            heading: location.coords.heading,
            speed: location.coords.speed,
          });
          
          // Get address
          const address = await Location.reverseGeocodeAsync({
            latitude,
            longitude,
          });
          
          setUserLocation({
            latitude,
            longitude,
            address: `${address[0]?.name || ''}, ${address[0]?.city || ''}`,
          });
          
          console.log('Location updated:', latitude, longitude);
          console.log('Setting permission and loading states');
          setHasLocationPermission(true);
          setIsLoadingLocation(false);
        } else {
          console.log('Location permission denied');
          Alert.alert(
            'Location Permission Required',
            'Please enable location access to find parking spots near you.',
            [{ text: 'OK' }]
          );
          setIsLoadingLocation(false);
        }
      } catch (error) {
        console.error('Error requesting location:', error);
        Alert.alert('Error', 'Failed to get your location. Using default location.');
        setIsLoadingLocation(false);
      }
    };

    requestLocationPermission();
  }, []); // Empty dependency array - only run once on mount

  // Use current location if available, otherwise default to San Francisco
  const region = {
    latitude: userLatitude || 37.78825,
    longitude: userLongitude || -122.4324,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  console.log('ParkingMap render - region:', region);
  console.log('ParkingMap render - userLatitude:', userLatitude);
  console.log('ParkingMap render - parkingSpots count:', parkingSpots.length);
  console.log('ParkingMap render - hasLocationPermission:', hasLocationPermission);
  console.log('ParkingMap render - isLoadingLocation:', isLoadingLocation);

  // Show loading indicator while getting location
  if (isLoadingLocation) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Getting your location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFillObject}
        initialRegion={{
          latitude: userLatitude || 18.5204,  // Pune, India
          longitude: userLongitude || 73.8567,  // Pune, India
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
        userInterfaceStyle="dark"
        customMapStyle={uberMapStyle}
        onMapReady={() => {
          console.log('Map is ready!');
          setIsMapReady(true);
        }}
      >
        {/* Current location marker */}
        {userLatitude && userLongitude && (
          <Marker
            coordinate={{
              latitude: userLatitude,
              longitude: userLongitude,
            }}
            title="You are here"
            pinColor="#0000FF"
          />
        )}

        {/* Parking spot markers with color based on availability */}
        {parkingSpots.map((marker: ParkingMarkerData) => {
          const availabilityPercentage = Math.round((marker.available_spots / marker.total_spots) * 100);
          let markerColor = '#34C759'; // Green - high availability
          if (availabilityPercentage < 60 && availabilityPercentage >= 30) {
            markerColor = '#FFD60A'; // Yellow - medium availability
          } else if (availabilityPercentage < 30) {
            markerColor = '#FF3B30'; // Red - low availability
          }

          return (
            <Marker
              key={marker.id}
              coordinate={{
                latitude: marker.latitude,
                longitude: marker.longitude,
              }}
              title={marker.title}
              description={`${marker.available_spots}/${marker.total_spots} spots • ₹${marker.price_per_hour}/hr`}
              onPress={() => {
                if (onParkingSpotPress) {
                  onParkingSpotPress(marker);
                }
              }}
            >
              <View style={[styles.customMarker, { backgroundColor: markerColor }]}>
                <Text style={styles.markerText}>P</Text>
              </View>
            </Marker>
          );
        })}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    borderRadius: 12,
    overflow: "hidden",
  },
  map: {
    flex: 1,
    backgroundColor: "#000000",
  },
  markerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  parkingMarker: {
    backgroundColor: "#3498db", // Modern blue like in the image
    borderRadius: 18,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 8,
  },
  userMarker: {
    backgroundColor: "#e74c3c", // Red accent for user location
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 6,
  },
  markerText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  customMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 8,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#FFFFFF",
    fontSize: 16,
    marginTop: 12,
    textAlign: "center",
  },
});

export default ParkingMap;