import { router, useLocalSearchParams } from "expo-router";
import { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView, Platform } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from "react-native-maps";
import { icons, images } from "@/constants";
import * as Location from "expo-location";

const ParkingNavigation = () => {
  const params = useLocalSearchParams();
  
  // Handle array params from expo-router
  const getParkingName = () => {
    const name = params.parkingName;
    if (Array.isArray(name)) return name[0] || "Parking Location";
    return name || "Parking Location";
  };
  
  const getSpotId = () => {
    const spot = params.spotId;
    if (Array.isArray(spot)) return spot[0] || "A-13";
    return spot || "A-13";
  };
  
  const parkingName = String(getParkingName());
  const spotId = String(getSpotId());
  
  // Mock parking destination (PICT Pune)
  const destinationCoords = {
    latitude: 18.5204,
    longitude: 73.8567,
  };

  const [userLocation, setUserLocation] = useState({
    latitude: 18.5314,
    longitude: 73.8446,
  });

  const [distance, setDistance] = useState("2.1");
  const [duration, setDuration] = useState("8");
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const userCoords = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
        setUserLocation(userCoords);
        
        // Fit map to show both markers
        setTimeout(() => {
          if (mapRef.current) {
            mapRef.current.fitToCoordinates([userCoords, destinationCoords], {
              edgePadding: { top: 250, right: 50, bottom: 350, left: 50 },
              animated: true,
            });
          }
        }, 500);
      }
    } catch (error) {
      console.error("Error getting location:", error);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleStartNavigation = () => {
    // Open Google Maps or Apple Maps for navigation
    const scheme = Platform.select({ ios: 'maps:', android: 'geo:' });
    const url = Platform.select({
      ios: `maps:?daddr=${destinationCoords.latitude},${destinationCoords.longitude}`,
      android: `geo:${destinationCoords.latitude},${destinationCoords.longitude}?q=${destinationCoords.latitude},${destinationCoords.longitude}(${parkingName})`,
    });
    
    // For now, just show an alert or you can use Linking.openURL(url)
    console.log("Starting navigation to:", parkingName);
  };

  const handleEndParking = () => {
    router.push("/(root)/(tabs)/home");
  };

  // Minimal dark map style for better performance
  const mapStyle = [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
    { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#746855" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Map View */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: 18.5259,
          longitude: 73.85065,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        customMapStyle={mapStyle}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsTraffic={false}
        zoomEnabled={true}
        scrollEnabled={true}
        rotateEnabled={false}
        pitchEnabled={false}
        toolbarEnabled={false}
      >
        {/* User Location with Car Icon */}
        <Marker
          coordinate={userLocation}
          anchor={{ x: 0.5, y: 0.5 }}
          flat={true}
        >
          <View style={styles.carMarkerContainer}>
            <Image 
              source={images.signUpCar} 
              style={styles.carMarker}
              resizeMode="contain"
            />
          </View>
        </Marker>

        {/* Parking Destination Marker */}
        <Marker
          coordinate={destinationCoords}
          anchor={{ x: 0.5, y: 1 }}
        >
          <View style={styles.destinationMarker}>
            <View style={styles.destinationPin}>
              <Text style={styles.destinationPinText}>P</Text>
            </View>
            <View style={styles.destinationPinTail} />
          </View>
        </Marker>

        {/* Route Polyline */}
        <Polyline
          coordinates={[userLocation, destinationCoords]}
          strokeColor="#4285F4"
          strokeWidth={6}
        />
      </MapView>

      {/* Top Navigation Banner */}
      <View style={styles.topNavBanner}>
        <View style={styles.topNavContent}>
          <View style={styles.directionIconContainer}>
            <Text style={styles.directionIcon}>↰</Text>
          </View>
          <View style={styles.navTextContainer}>
            <Text style={styles.instructionText}>Turn left</Text>
            <Text style={styles.distanceToTurn}>in 60 m</Text>
          </View>
        </View>
        <Text style={styles.thenText}>Then →</Text>
      </View>

      {/* Bottom Info Card */}
      <View style={styles.bottomCard}>
        {/* ETA and Distance */}
        <View style={styles.etaSection}>
          <View style={styles.etaRow}>
            <Text style={styles.etaTime}>{duration}</Text>
            <Text style={styles.etaMinutes}>min</Text>
            <View style={styles.etaDivider} />
            <Text style={styles.etaDistance}>{distance} km</Text>
          </View>
          <Text style={styles.arrivalTime}>Arrival • 2:59 AM</Text>
        </View>

        {/* Destination Info */}
        <View style={styles.destinationInfo}>
          <View style={styles.destinationIconCircle}>
            <View style={styles.destinationDot} />
          </View>
          <View style={styles.destinationTextContainer}>
            <Text style={styles.destinationTitle}>{parkingName}</Text>
            <View style={styles.spotContainer}>
              <Text style={styles.spotLabel}>Reserved Spot:</Text>
              <View style={styles.spotBadge}>
                <Text style={styles.spotText}>{spotId}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.exitButton} onPress={handleEndParking}>
            <Text style={styles.exitButtonText}>Exit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navButton} onPress={handleStartNavigation}>
            <Text style={styles.navButtonText}>Start</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Floating Back Button */}
      <TouchableOpacity 
        style={styles.floatingBackButton}
        onPress={handleBack}
      >
        <Image source={icons.backArrow} style={styles.backIcon} />
      </TouchableOpacity>

      {/* Re-center Button */}
      <TouchableOpacity 
        style={styles.recenterButton}
        onPress={() => {
          if (mapRef.current) {
            mapRef.current.fitToCoordinates([userLocation, destinationCoords], {
              edgePadding: { top: 250, right: 50, bottom: 400, left: 50 },
              animated: true,
            });
          }
        }}
      >
        <Text style={styles.recenterIcon}>⌖</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#161616",
  },
  map: {
    flex: 1,
  },
  floatingBackButton: {
    position: "absolute",
    top: 60,
    left: 20,
    width: 44,
    height: 44,
    backgroundColor: "rgba(41, 41, 41, 0.95)",
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: "#FFFFFF",
  },
  recenterButton: {
    position: "absolute",
    bottom: 380,
    right: 20,
    width: 50,
    height: 50,
    backgroundColor: "rgba(41, 41, 41, 0.95)",
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  recenterIcon: {
    fontSize: 28,
    color: "#FFFFFF",
    fontWeight: "300",
  },
  // Top Navigation Banner (Google Maps style)
  topNavBanner: {
    position: "absolute",
    top: 60,
    left: 80,
    right: 20,
    backgroundColor: "#1C6758",
    borderRadius: 16,
    padding: 16,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  topNavContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  directionIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  directionIcon: {
    fontSize: 32,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  navTextContainer: {
    flex: 1,
  },
  instructionText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 2,
    letterSpacing: 0.3,
  },
  distanceToTurn: {
    fontSize: 15,
    fontWeight: "500",
    color: "#FFFFFF",
    opacity: 0.9,
  },
  thenText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
    opacity: 0.85,
    letterSpacing: 0.5,
  },
  // Car Marker
  carMarkerContainer: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  carMarker: {
    width: 40,
    height: 40,
    transform: [{ rotate: "45deg" }],
  },
  // Destination Marker
  destinationMarker: {
    alignItems: "center",
  },
  destinationPin: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EA4335",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  destinationPinText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  destinationPinTail: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 16,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#EA4335",
    marginTop: -4,
  },
  // Bottom Card (Google Maps style)
  bottomCard: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#1F1F1F",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 24,
    paddingBottom: 44,
    paddingHorizontal: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 16,
  },
  // ETA Section
  etaSection: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#2C2C2E",
  },
  etaRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 8,
  },
  etaTime: {
    fontSize: 36,
    fontWeight: "700",
    color: "#4CAF50",
    letterSpacing: -1,
  },
  etaMinutes: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4CAF50",
    marginLeft: 6,
    marginRight: 16,
  },
  etaDivider: {
    width: 1,
    height: 20,
    backgroundColor: "#3A3A3C",
    marginRight: 16,
  },
  etaDistance: {
    fontSize: 18,
    fontWeight: "600",
    color: "#8E8E93",
  },
  arrivalTime: {
    fontSize: 14,
    fontWeight: "500",
    color: "#8E8E93",
  },
  // Destination Info
  destinationInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  destinationIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2C2C2E",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  destinationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#EA4335",
  },
  destinationTextContainer: {
    flex: 1,
  },
  destinationTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  spotContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  spotLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#8E8E93",
    marginRight: 8,
  },
  spotBadge: {
    backgroundColor: "#2C2C2E",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#3A3A3C",
  },
  spotText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  // Action Buttons
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  exitButton: {
    flex: 1,
    backgroundColor: "#2C2C2E",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#3A3A3C",
  },
  exitButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  navButton: {
    flex: 1,
    backgroundColor: "#4285F4",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#4285F4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
});

export default ParkingNavigation;
