import { useUser } from "@clerk/clerk-expo";
import { useLocalSearchParams } from "expo-router";
import { StripeProvider } from "@stripe/stripe-react-native";
import { Image, Text, View, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";

import Payment from "@/components/Payment";
import { icons } from "@/constants";
import { useLocationStore } from "@/store";
import { ParkingSpot } from "@/types/type";
import { getAllParkingSpots } from "@/lib/parking";

const BookParking = () => {
  const { user } = useUser();
  const { parkingSpotId } = useLocalSearchParams();
  const { userAddress } = useLocationStore();
  const [parkingSpot, setParkingSpot] = useState<ParkingSpot | null>(null);
  const [loading, setLoading] = useState(true);
  const [duration, setDuration] = useState(2); // Default 2 hours

  useEffect(() => {
    const loadParkingSpot = async () => {
      try {
        const spots = await getAllParkingSpots();
        const spot = spots.find(s => s.id.toString() === parkingSpotId);
        setParkingSpot(spot || null);
      } catch (error) {
        console.error("Error loading parking spot:", error);
      } finally {
        setLoading(false);
      }
    };

    if (parkingSpotId) {
      loadParkingSpot();
    } else {
      setLoading(false);
    }
  }, [parkingSpotId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading parking details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!parkingSpot) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Parking spot not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const totalCost = parkingSpot.price_per_hour * duration;

  return (
    <StripeProvider
      publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!}
      merchantIdentifier="merchant.com.parkingapp"
      urlScheme="myapp"
    >
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Reserve Parking</Text>

          <View style={styles.parkingInfo}>
            <View style={styles.iconContainer}>
              <Image source={icons.map} style={styles.icon} />
            </View>

            <View style={styles.parkingDetails}>
              <Text style={styles.parkingName}>{parkingSpot.name}</Text>
              <View style={styles.ratingContainer}>
                <Image source={icons.star} style={styles.starIcon} />
                <Text style={styles.ratingText}>{parkingSpot.rating}</Text>
              </View>
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Hourly Rate</Text>
              <Text style={styles.infoValue}>${parkingSpot.price_per_hour}/hr</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Duration</Text>
              <Text style={styles.infoValue}>{duration} hours</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Available Spots</Text>
              <Text style={styles.infoValue}>
                {parkingSpot.available_spots}/{parkingSpot.total_spots}
              </Text>
            </View>

            <View style={[styles.infoRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Cost</Text>
              <Text style={styles.totalValue}>${totalCost.toFixed(2)}</Text>
            </View>
          </View>

          <View style={styles.locationSection}>
            <View style={styles.locationRow}>
              <Image source={icons.to} style={styles.locationIcon} />
              <Text style={styles.locationText}>
                From: {userAddress || "Current Location"}
              </Text>
            </View>

            <View style={styles.locationRow}>
              <Image source={icons.point} style={styles.locationIcon} />
              <Text style={styles.locationText}>
                To: {parkingSpot.address}
              </Text>
            </View>
          </View>

          <View style={styles.featuresSection}>
            <Text style={styles.featuresTitle}>Features</Text>
            <View style={styles.featuresContainer}>
              {parkingSpot.is_covered && (
                <View style={styles.featureBadge}>
                  <Text style={styles.featureText}>Covered</Text>
                </View>
              )}
              {parkingSpot.has_security && (
                <View style={styles.featureBadge}>
                  <Text style={styles.featureText}>Secure</Text>
                </View>
              )}
            </View>
          </View>

          <Payment
            fullName={user?.fullName!}
            email={user?.emailAddresses[0].emailAddress!}
            amount={totalCost.toString()}
            driverId={0} // Not needed for parking
            rideTime={duration * 60} // Convert to minutes
          />
        </ScrollView>
      </SafeAreaView>
    </StripeProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6b7280",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    color: "#ef4444",
    fontWeight: "600",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 20,
    textAlign: "center",
  },
  parkingInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 60,
    height: 60,
    backgroundColor: "#dbeafe",
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  icon: {
    width: 30,
    height: 30,
  },
  parkingDetails: {
    flex: 1,
  },
  parkingName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  starIcon: {
    width: 16,
    height: 16,
    marginRight: 4,
  },
  ratingText: {
    fontSize: 16,
    color: "#6b7280",
  },
  infoCard: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  infoLabel: {
    fontSize: 16,
    color: "#6b7280",
  },
  infoValue: {
    fontSize: 16,
    color: "#1f2937",
    fontWeight: "500",
  },
  totalRow: {
    borderBottomWidth: 0,
    paddingTop: 16,
    marginTop: 8,
    borderTopWidth: 2,
    borderTopColor: "#e5e7eb",
  },
  totalLabel: {
    fontSize: 18,
    color: "#1f2937",
    fontWeight: "600",
  },
  totalValue: {
    fontSize: 20,
    color: "#059669",
    fontWeight: "700",
  },
  locationSection: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  locationIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  locationText: {
    fontSize: 16,
    color: "#374151",
    flex: 1,
  },
  featuresSection: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 12,
  },
  featuresContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  featureBadge: {
    backgroundColor: "#dbeafe",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: "#2563eb",
    fontWeight: "500",
  },
});

export default BookParking;