import { useAuth } from "@/contexts/AuthContext";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useState, useEffect, useRef } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import GoogleTextInput from "@/components/GoogleTextInput";
import ParkingMap from "@/components/ParkingMap";
import ParkingCard from "@/components/ParkingCard";
import { icons, images } from "@/constants";
import { useLocationStore, useParkingStore } from "@/store";
import { ParkingSpot } from "@/types/type";
import { getParkingSpotsNearLocation, convertToMarkerData } from "@/lib/parking";

const Home = () => {
  const { user, signOut } = useAuth();

  const { setUserLocation, setDestinationLocation, userLatitude, userLongitude, userAddress } = useLocationStore();
  const { parkingSpots, setParkingSpots, selectedParkingSpot, setSelectedParkingSpot } = useParkingStore();

  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [nearbyParkingSpots, setNearbyParkingSpots] = useState<ParkingSpot[]>([]);
  const [showSearchModal, setShowSearchModal] = useState<boolean>(false);

  // Animation for car
  const carPosition = useRef(new Animated.Value(0)).current;
  const greenLineProgress = useRef(new Animated.Value(0)).current;
  const screenWidth = Dimensions.get('window').width;

  // Start car animation on mount - moves slowly once and stops
  useEffect(() => {
    Animated.timing(carPosition, {
      toValue: 1,
      duration: 4000, // Slower animation - 4 seconds
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSignOut = () => {
    signOut();
    router.replace("/(auth)/sign-in");
  };

  useEffect(() => {
    (async () => {
      console.log("Requesting location permission...");
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setHasPermission(false);
        setLoading(false);
        console.log("Location permission denied");
        return;
      }

      console.log("Location permission granted, getting current position...");
      setHasPermission(true);

      try {
        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        console.log("Got location:", location.coords.latitude, location.coords.longitude);

        const address = await Location.reverseGeocodeAsync({
          latitude: location.coords?.latitude!,
          longitude: location.coords?.longitude!,
        });

        setUserLocation({
          latitude: location.coords?.latitude,
          longitude: location.coords?.longitude,
          address: `${address[0].name}, ${address[0].region}`,
        });

        // Load nearby parking spots
        console.log("Loading parking spots near location...");
        const spots = await getParkingSpotsNearLocation(
          location.coords?.latitude!,
          location.coords?.longitude!
        );
        console.log("Found parking spots:", spots.length);
        setNearbyParkingSpots(spots);
        setParkingSpots(convertToMarkerData(spots));
      } catch (error) {
        console.error("Error getting location or parking spots:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Auto-reload parking spots when user location changes
  useEffect(() => {
    if (userLatitude && userLongitude && hasPermission) {
      const loadNearbyParking = async () => {
        try {
          console.log("Reloading parking spots for new location...");
          const spots = await getParkingSpotsNearLocation(userLatitude, userLongitude);
          setNearbyParkingSpots(spots);
          setParkingSpots(convertToMarkerData(spots));
        } catch (error) {
          console.error("Error reloading parking spots:", error);
        }
      };
      loadNearbyParking();
    }
  }, [userLatitude, userLongitude, hasPermission]);

  const handleDestinationPress = async (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    setDestinationLocation(location);
    
    // Load parking spots near the searched location
    try {
      const spots = await getParkingSpotsNearLocation(
        location.latitude,
        location.longitude
      );
      setNearbyParkingSpots(spots);
      setParkingSpots(convertToMarkerData(spots));
    } catch (error) {
      console.error("Error loading parking spots for destination:", error);
    }
  };

  const handleParkingSpotPress = (spot: ParkingSpot) => {
    setSelectedParkingSpot(spot.id);
    // Navigate to parking booking screen
    router.push({
      pathname: "/(root)/book-parking",
      params: { parkingSpotId: spot.id }
    });
  };

  const handleWhereToPress = () => {
    router.push("/(root)/find-parking");
  };

  // Calculate text width approximately (can adjust based on actual text)
  const estimatedTextWidth = 120; // Approximate width of "Hi, User" text
  const carSize = 80;
  const padding = 16;
  
  const translateX = carPosition.interpolate({
    inputRange: [0, 1],
    outputRange: [estimatedTextWidth + 10, screenWidth - carSize - padding], // Start after text, end at screen edge
  });

  return (
    <>
      <SafeAreaView style={styles.container}>
        {/* Static Header with Car - Fixed at top */}
        <View style={styles.staticHeader}>
          <Text style={styles.hiText}>Hi, {user?.name || 'User'}</Text>
          
          {/* Animated Car starts from end of text */}
          <Animated.Image
            source={require("@/assets/images/hand-drawn-muscle-car-illustration.png")}
            style={[
              styles.animatedCar,
              {
                transform: [{ translateX }],
              },
            ]}
            resizeMode="contain"
          />
        </View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topSection}>

          {/* Search Section */}
          <View style={styles.searchSection}>
            <TouchableOpacity 
              style={styles.searchContainer} 
              onPress={handleWhereToPress}
            >
              <Image source={icons.search} style={styles.searchIcon} />
              <Text style={styles.searchPlaceholder}>Where to?</Text>
            </TouchableOpacity>
            
            
          </View>

          {/* Recent Location */}
          {userAddress && (
            <TouchableOpacity style={styles.recentLocation}>
              <View style={styles.clockContainer}>
                <Image source={icons.target} style={styles.clockIcon} />
              </View>
              <View style={styles.locationInfo}>
                <Text style={styles.locationName}>Current Location</Text>
                <Text style={styles.locationAddress}>{userAddress}</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

          {/* Map Section */}
          <View style={styles.mapSection}>
            <Text style={styles.mapTitle}>Find Parking Near You</Text>
            <View style={styles.mapContainer}>
              <ParkingMap
                parkingSpots={parkingSpots}
                selectedSpot={selectedParkingSpot}
                onParkingSpotPress={(spot) => {
                  setSelectedParkingSpot(spot.id);
                }}
              />
            </View>
          </View>

          {/* More Ways to Use ParkEasy Section */}
          <View style={styles.moreWaysSection}>
            <Text style={styles.moreWaysTitle}>More ways to use ParkEasy</Text>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.cardsContainer}
            >
              {/* Book Parking Early Card */}
              <TouchableOpacity 
                style={styles.featureCard}
                onPress={() => router.push("/(root)/find-parking")}
              >
                <Image 
                  source={require("@/assets/images/2111.w023.n001.1368B.p1.1368.jpg")}
                  style={styles.featureImage}
                  resizeMode="cover"
                />
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Book parking early →</Text>
                  <Text style={styles.featureSubtitle}>Reserve your spot in advance</Text>
                </View>
              </TouchableOpacity>

              {/* Predict Parking Availability Card */}
              <TouchableOpacity 
                style={styles.featureCard}
                onPress={() => router.push("/(root)/predict-parking")}
              >
                <Image 
                  source={require("@/assets/images/2301.i607.012.S.m012.c12.self service isometric set.jpg")}
                  style={styles.featureImage}
                  resizeMode="cover"
                />
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>Predict Parking Availability →</Text>
                  <Text style={styles.featureSubtitle}>Check future parking availability</Text>
                </View>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#161616", // Base background color
  },
  staticHeader: {
    backgroundColor: "#161616",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    height: 80,
    position: "relative",
    zIndex: 10,
  },
  scrollView: {
    flex: 1,
  },
  topSection: {
    backgroundColor: "#161616",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
  },
  animatedHeader: {
    marginBottom: 24,
    paddingVertical: 16,
  },
  carLineContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 60,
    marginBottom: 12,
    position: "relative",
  },
  headerTextContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  hiText: {
    fontSize: 28,
    fontWeight: "600",
    color: "#dfdfdf",
    letterSpacing: -0.5,
  },
  parkText: {
    fontSize: 28,
    fontWeight: "600",
    color: "#4CAF50",
    letterSpacing: -0.5,
  },
  animatedCar: {
    width: 80,
    height: 80,
    position: "absolute",
    left: 0, // Starting point, translateX will move it from here
  },
  greenLine: {
    height: 3,
    backgroundColor: "#4CAF50",
    borderRadius: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: "600", // Uber's thin font weight
    color: "#dfdfdf",
    letterSpacing: -0.5,
  },
  searchSection: {
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12, // Reduced from 20 to 12
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#292929", // Uber's dark gray
    borderRadius: 8,
    paddingHorizontal: 16, // Changed from 16 to match recentLocation
    paddingVertical: 14,
    // Removed marginRight since there's no "Later" button
  },
  searchIcon: {
    width: 24, // Increased from 20 to 24
    height: 24, // Increased from 20 to 24
    tintColor: "#A0A0A0", // Lighter gray for icon
    marginRight: 12,
  },
  searchPlaceholder: {
    fontSize: 16,
    fontWeight: "800",
    color: "#C7C7C7", // Uber's placeholder text color
    flex: 1,
  },
  laterButton: {
    backgroundColor: "#2C2C2E",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  laterIcon: {
    width: 16,
    height: 16,
    tintColor: "#FFFFFF",
    marginRight: 6,
  },
  laterText: {
    fontSize: 16,
    fontWeight: "400",
    color: "#FFFFFF",
  },
  recentLocation: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#292929", // Match search container color
    borderRadius: 8,
    paddingHorizontal: 14, // Match search container horizontal padding
    paddingVertical: 14, // Match search container vertical padding
  },
  clockContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#3A3A3C", // Slightly lighter dark gray
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  clockIcon: {
    width: 18,
    height: 18,
    tintColor: "#A0A0A0",
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  locationAddress: {
    fontSize: 13,
    color: "#8E8E93", // Uber's secondary text color
  },
  mapSection: {
    backgroundColor: "#161616",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 12,
  },
  mapContainer: {
    height: 280,
    backgroundColor: "#242f3e",
    borderRadius: 12,
    overflow: "hidden",
  },
  moreWaysSection: {
    backgroundColor: "#161616",
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 120, // Extra padding for tab bar and scroll space
  },
  moreWaysTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  cardsContainer: {
    flexDirection: "row",
    gap: 12,
    paddingRight: 16,
  },
  featureCard: {
    width: 280,
    backgroundColor: "#292929",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  featureImage: {
    width: "100%",
    height: 160,
    backgroundColor: "#1F1F1F",
  },
  featureContent: {
    padding: 14,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  featureSubtitle: {
    fontSize: 13,
    color: "#8E8E93",
    lineHeight: 18,
  },
});

export default Home;