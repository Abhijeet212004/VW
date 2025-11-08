import { router, useLocalSearchParams } from "expo-router";
import { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView, Platform, Animated } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from "react-native-maps";
import { icons, images } from "@/constants";
import * as Location from "expo-location";
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY || 'AIzaSyDWmZkfE6DvnNaf3nbPjgq8uOmBMg3d7_c';

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
  const [routeCoordinates, setRouteCoordinates] = useState<any[]>([]);
  const [currentInstruction, setCurrentInstruction] = useState("Turn left");
  const [distanceToTurn, setDistanceToTurn] = useState("60 m");
  const [isNavigating, setIsNavigating] = useState(false);
  const [routeSteps, setRouteSteps] = useState<any[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [locationSubscription, setLocationSubscription] = useState<any>(null);
  const [carHeading, setCarHeading] = useState(0);
  const [previousLocation, setPreviousLocation] = useState<any>(null);
  const [bottomSheetHeight] = useState(new Animated.Value(300));
  const [isBottomSheetExpanded, setIsBottomSheetExpanded] = useState(false);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    getUserLocation();
    return () => {
      // Cleanup location subscription on unmount
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (isNavigating) {
      startLocationTracking();
    } else {
      stopLocationTracking();
    }
  }, [isNavigating]);

  const getDirections = async (origin: any, destination: any) => {
    try {
      console.log('Fetching directions with API key:', GOOGLE_MAPS_API_KEY ? 'Available' : 'Missing');
      
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&key=${GOOGLE_MAPS_API_KEY}&mode=driving`
      );
      const data = await response.json();
      
      console.log('Directions API response status:', data.status);
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const leg = route.legs[0];
        
        // Update distance and duration
        setDistance((leg.distance.value / 1000).toFixed(1));
        setDuration(Math.ceil(leg.duration.value / 60).toString());
        
        // Decode polyline to get route coordinates
        const points = decodePolyline(route.overview_polyline.points);
        setRouteCoordinates(points);
        
        console.log('Route coordinates loaded:', points.length, 'points');
        
        // Store all route steps for navigation
        if (leg.steps && leg.steps.length > 0) {
          setRouteSteps(leg.steps);
          const firstStep = leg.steps[0];
          const cleanInstruction = firstStep.html_instructions.replace(/<[^>]*>/g, '');
          setCurrentInstruction(cleanInstruction);
          setDistanceToTurn(firstStep.distance.text);
        }
      } else {
        console.log('No routes found, using fallback');
        // Fallback to straight line
        setRouteCoordinates([origin, destination]);
      }
    } catch (error) {
      console.error('Error fetching directions:', error);
      // Fallback to straight line
      setRouteCoordinates([origin, destination]);
    }
  };

  const decodePolyline = (encoded: string) => {
    const points = [];
    let index = 0;
    const len = encoded.length;
    let lat = 0;
    let lng = 0;

    while (index < len) {
      let b;
      let shift = 0;
      let result = 0;
      do {
        b = encoded.charAt(index++).charCodeAt(0) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charAt(index++).charCodeAt(0) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      points.push({
        latitude: lat / 1e5,
        longitude: lng / 1e5,
      });
    }
    return points;
  };

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
        
        // Get directions from current location to destination
        await getDirections(userCoords, destinationCoords);
        
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

  const startLocationTracking = async () => {
    try {
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000, // Update every second
          distanceInterval: 5, // Update every 5 meters
        },
        (location) => {
          const newLocation = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };
          
          // Calculate car heading based on movement
          if (previousLocation) {
            const heading = calculateBearing(previousLocation, newLocation);
            setCarHeading(heading);
          }
          
          setPreviousLocation(userLocation);
          setUserLocation(newLocation);
          
          // Update navigation instructions based on current location
          updateNavigationInstructions(newLocation);
          
          // Follow user location on map with smooth animation
          if (mapRef.current) {
            mapRef.current.animateCamera({
              center: {
                latitude: newLocation.latitude,
                longitude: newLocation.longitude,
              },
              zoom: 18,
              heading: carHeading,
              pitch: 60,
            }, { duration: 1000 });
          }
        }
      );
      setLocationSubscription(subscription);
    } catch (error) {
      console.error('Error starting location tracking:', error);
    }
  };

  const stopLocationTracking = () => {
    if (locationSubscription) {
      locationSubscription.remove();
      setLocationSubscription(null);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  };

  const calculateBearing = (start: any, end: any) => {
    const startLat = start.latitude * Math.PI / 180;
    const startLng = start.longitude * Math.PI / 180;
    const endLat = end.latitude * Math.PI / 180;
    const endLng = end.longitude * Math.PI / 180;

    const dLng = endLng - startLng;

    const y = Math.sin(dLng) * Math.cos(endLat);
    const x = Math.cos(startLat) * Math.sin(endLat) - Math.sin(startLat) * Math.cos(endLat) * Math.cos(dLng);

    let bearing = Math.atan2(y, x) * 180 / Math.PI;
    return (bearing + 360) % 360;
  };

  const updateNavigationInstructions = (currentLocation: any) => {
    if (routeSteps.length === 0 || currentStepIndex >= routeSteps.length) return;

    const currentStep = routeSteps[currentStepIndex];
    const stepEndLocation = currentStep.end_location;
    
    // Calculate distance to current step's end point
    const distanceToStepEnd = calculateDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      stepEndLocation.lat,
      stepEndLocation.lng
    );

    // If we're close to the step end (within 20 meters), move to next step
    if (distanceToStepEnd < 20 && currentStepIndex < routeSteps.length - 1) {
      const nextStepIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextStepIndex);
      
      const nextStep = routeSteps[nextStepIndex];
      const cleanInstruction = nextStep.html_instructions.replace(/<[^>]*>/g, '');
      setCurrentInstruction(cleanInstruction);
      setDistanceToTurn(nextStep.distance.text);
    } else {
      // Update distance to current step
      const distanceText = distanceToStepEnd > 1000 
        ? `${(distanceToStepEnd / 1000).toFixed(1)} km`
        : `${Math.round(distanceToStepEnd)} m`;
      setDistanceToTurn(distanceText);
    }

    // Check if we've reached the destination (within 50 meters)
    const distanceToDestination = calculateDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      destinationCoords.latitude,
      destinationCoords.longitude
    );

    if (distanceToDestination < 50) {
      setCurrentInstruction("You have arrived at your destination");
      setDistanceToTurn("");
      setIsNavigating(false);
    }
  };

  const handleStartNavigation = () => {
    setIsNavigating(true);
    setCurrentStepIndex(0);
    
    // Reset to first instruction
    if (routeSteps.length > 0) {
      const firstStep = routeSteps[0];
      const cleanInstruction = firstStep.html_instructions.replace(/<[^>]*>/g, '');
      setCurrentInstruction(cleanInstruction);
      setDistanceToTurn(firstStep.distance.text);
    }
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

  const toggleBottomSheet = () => {
    const toValue = isBottomSheetExpanded ? 300 : 150;
    Animated.spring(bottomSheetHeight, {
      toValue,
      useNativeDriver: false,
      tension: 100,
      friction: 8,
    }).start();
    setIsBottomSheetExpanded(!isBottomSheetExpanded);
  };

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: bottomSheetHeight } }],
    { useNativeDriver: false }
  );

  return (
    <GestureHandlerRootView style={styles.container}>
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
        showsTraffic={true}
        zoomEnabled={!isNavigating}
        scrollEnabled={!isNavigating}
        rotateEnabled={isNavigating}
        pitchEnabled={false}
        toolbarEnabled={false}
        followsUserLocation={isNavigating}
        userLocationAnnotationTitle=""
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
              style={[styles.carMarker, { transform: [{ rotate: `${carHeading}deg` }] }]}
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
        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#4285F4"
            strokeWidth={6}
            lineCap="round"
            lineJoin="round"
          />
        )}
      </MapView>

      {/* Navigation Status Indicator */}
      {isNavigating && (
        <View style={styles.navigationStatus}>
          <View style={styles.navigationDot} />
          <Text style={styles.navigationStatusText}>NAVIGATING</Text>
        </View>
      )}

      {/* Compact Navigation Banner */}
      <View style={[styles.compactNavBanner, isNavigating && styles.compactNavBannerActive]}>
        <Text style={styles.compactInstruction}>{currentInstruction}</Text>
        <Text style={styles.compactDistance}>{distanceToTurn}</Text>
      </View>

      {/* Draggable Bottom Sheet */}
      <PanGestureHandler onGestureEvent={onGestureEvent}>
        <Animated.View style={[styles.bottomSheet, { height: bottomSheetHeight }]}>
          <TouchableOpacity style={styles.dragHandle} onPress={toggleBottomSheet}>
            <View style={styles.dragBar} />
          </TouchableOpacity>
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
          
          <TouchableOpacity 
            style={[styles.navButton, isNavigating && styles.navButtonActive]} 
            onPress={isNavigating ? () => setIsNavigating(false) : handleStartNavigation}
          >
            <Text style={styles.navButtonText}>
              {isNavigating ? 'Stop' : 'Start'}
            </Text>
          </TouchableOpacity>
        </View>
        </Animated.View>
      </PanGestureHandler>

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
    </GestureHandlerRootView>
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
  // Compact Navigation Banner
  compactNavBanner: {
    position: "absolute",
    top: 60,
    left: 80,
    right: 20,
    backgroundColor: "#1C6758",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  compactInstruction: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    flex: 1,
    marginRight: 8,
  },
  compactDistance: {
    fontSize: 12,
    fontWeight: "500",
    color: "#FFFFFF",
    opacity: 0.9,
  },
  compactNavBannerActive: {
    backgroundColor: "#2E7D32",
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
  // Draggable Bottom Sheet
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#1F1F1F",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 8,
    paddingBottom: 44,
    paddingHorizontal: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 16,
  },
  dragHandle: {
    alignItems: "center",
    paddingVertical: 8,
    marginBottom: 16,
  },
  dragBar: {
    width: 40,
    height: 4,
    backgroundColor: "#3A3A3C",
    borderRadius: 2,
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
  navButtonActive: {
    backgroundColor: "#EA4335",
    shadowColor: "#EA4335",
  },
  navigationStatus: {
    position: "absolute",
    top: 120,
    right: 20,
    backgroundColor: "rgba(76, 175, 80, 0.95)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  navigationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FFFFFF",
    marginRight: 6,
  },
  navigationStatusText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },

});

export default ParkingNavigation;
