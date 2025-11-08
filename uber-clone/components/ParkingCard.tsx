import React from "react";
import { Image, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { icons } from "@/constants";
import { ParkingSpot } from "@/types/type";

interface ParkingCardProps {
  parking: ParkingSpot;
  onPress?: () => void;
}

const ParkingCard = ({ parking, onPress }: ParkingCardProps) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Image source={icons.map} style={styles.icon} />
        </View>

        <View style={styles.details}>
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={1}>
              {parking.name}
            </Text>
            <View style={styles.rating}>
              <Image source={icons.star} style={styles.starIcon} />
              <Text style={styles.ratingText}>{parking.rating}</Text>
            </View>
          </View>

          <Text style={styles.address} numberOfLines={2}>
            {parking.address}
          </Text>

          <View style={styles.infoRow}>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>
                ${parking.price_per_hour}/hr
              </Text>
              {parking.distance && (
                <Text style={styles.distance}>
                  • {parking.distance.toFixed(1)} km
                </Text>
              )}
            </View>

            <View style={styles.spotsContainer}>
              <View
                style={[
                  styles.spotIndicator,
                  {
                    backgroundColor:
                      parking.available_spots > 0 ? "#10b981" : "#ef4444",
                  },
                ]}
              />
              <Text style={styles.spotsText}>
                {parking.available_spots}/{parking.total_spots} spots
              </Text>
            </View>
          </View>

          <View style={styles.features}>
            {parking.is_covered && (
              <View style={styles.coveredBadge}>
                <Text style={styles.coveredText}>Covered</Text>
              </View>
            )}
            {parking.has_security && (
              <View style={styles.securityBadge}>
                <Text style={styles.securityText}>Secure</Text>
              </View>
            )}
            <TouchableOpacity 
              style={styles.slotsButton}
              onPress={() => {
                // Navigate to choose spot screen
                const router = require('expo-router').router;
                router.push({
                  pathname: '/(root)/choose-spot',
                  params: {
                    parkingId: parking.id,
                    parkingName: parking.name
                  }
                });
              }}
            >
              <Text style={styles.slotsButtonText}>Choose Spot</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <Image source={icons.arrowDown} style={styles.arrow} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    borderRadius: 0,
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    marginBottom: 0,
    marginHorizontal: 0,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    backgroundColor: "#dbeafe",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  icon: {
    width: 24,
    height: 24,
  },
  details: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    flex: 1,
  },
  rating: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  starIcon: {
    width: 12,
    height: 12,
  },
  ratingText: {
    fontSize: 14,
    color: "#6b7280",
    marginLeft: 4,
  },
  address: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  price: {
    fontSize: 14,
    color: "#059669",
    fontWeight: "500",
  },
  distance: {
    fontSize: 14,
    color: "#6b7280",
    marginLeft: 8,
  },
  spotsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  spotIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  spotsText: {
    fontSize: 14,
    color: "#6b7280",
  },
  features: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  coveredBadge: {
    backgroundColor: "#dbeafe",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  coveredText: {
    fontSize: 12,
    color: "#2563eb",
  },
  securityBadge: {
    backgroundColor: "#dcfce7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  securityText: {
    fontSize: 12,
    color: "#16a34a",
  },
  arrow: {
    width: 16,
    height: 16,
    transform: [{ rotate: "270deg" }],
  },
  slotsButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 8,
  },
  slotsButtonText: {
    fontSize: 12,
    color: "white",
    fontWeight: "500",
  },
});

export default ParkingCard;