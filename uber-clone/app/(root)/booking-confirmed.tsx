import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, SafeAreaView } from "react-native";

const BookingConfirmed = () => {
  const params = useLocalSearchParams();
  const parkingName = (params.parkingName as string) || "Parking Location";
  const spotId = (params.spotId as string) || "A-13";
  const paymentMethod = (params.paymentMethod as string) || "wallet";
  
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const checkmarkScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate the success animation
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(checkmarkScale, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigate to navigation screen after 2.5 seconds
    const timer = setTimeout(() => {
      router.push({
        pathname: "/(root)/parking-navigation",
        params: {
          parkingName,
          spotId,
          paymentMethod,
        },
      });
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Animated Circle Background */}
        <Animated.View
          style={[
            styles.circleBackground,
            {
              transform: [{ scale: scaleAnim }],
              opacity: fadeAnim,
            },
          ]}
        >
          {/* Checkmark */}
          <Animated.View
            style={[
              styles.checkmarkContainer,
              {
                transform: [{ scale: checkmarkScale }],
              },
            ]}
          >
            <Text style={styles.checkmark}>✓</Text>
          </Animated.View>
        </Animated.View>

        {/* Success Text */}
        <Animated.View style={[styles.textContainer, { opacity: fadeAnim }]}>
          <Text style={styles.successTitle}>Booking Confirmed!</Text>
          <Text style={styles.successSubtitle}>
            Your parking spot {spotId} has been reserved
          </Text>
          <Text style={styles.successDetail}>{parkingName}</Text>
          
          {paymentMethod === 'wallet' && (
            <View style={styles.paymentBadge}>
              <Text style={styles.paymentBadgeText}>💳 Paid via Wallet</Text>
            </View>
          )}
          
          {paymentMethod === 'later' && (
            <View style={styles.paymentBadgeLater}>
              <Text style={styles.paymentBadgeText}>⏰ Pay at Exit</Text>
            </View>
          )}
        </Animated.View>

        {/* Loading Indicator */}
        <Animated.View style={[styles.loadingContainer, { opacity: fadeAnim }]}>
          <Text style={styles.loadingText}>Preparing navigation...</Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#161616",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  circleBackground: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#1a4d1a",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
    shadowColor: "#34C759",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
  },
  checkmarkContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#34C759",
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: {
    fontSize: 80,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  textContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  successTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  successSubtitle: {
    fontSize: 17,
    fontWeight: "500",
    color: "#8E8E93",
    textAlign: "center",
    marginBottom: 8,
  },
  successDetail: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 20,
  },
  paymentBadge: {
    backgroundColor: "#1a4d1a",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#34C759",
    marginTop: 8,
  },
  paymentBadgeLater: {
    backgroundColor: "#3d3d1a",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#FFD60A",
    marginTop: 8,
  },
  paymentBadgeText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  loadingContainer: {
    position: "absolute",
    bottom: 100,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#8E8E93",
    letterSpacing: 0.5,
  },
});

export default BookingConfirmed;
