import { router, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, SafeAreaView } from "react-native";
import { icons, images } from "@/constants";

const ChooseSpot = () => {
  const params = useLocalSearchParams();
  const parkingName = params.parkingName as string || "Parking Location";
  const parkingId = params.parkingId as string;
  
  const [selectedSpot, setSelectedSpot] = useState<string | null>(null);
  const [parkingSlots, setParkingSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchParkingSlots();
    const interval = setInterval(fetchParkingSlots, 3000);
    return () => clearInterval(interval);
  }, [parkingId]);

  const fetchParkingSlots = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/parking-spot/${parkingId}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        setParkingSlots(result.data.realTimeSlots || []);
        console.log(`Updated slots: ${result.data.availableSpots}/${result.data.totalSlots} available`);
      }
    } catch (error) {
      console.error('Error fetching parking slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSpotSelect = (slotId: string, isAvailable: boolean) => {
    if (isAvailable) {
      setSelectedSpot(slotId);
    }
  };

  const handleConfirmSpot = () => {
    if (selectedSpot) {
      const selectedSlot = parkingSlots.find((s: any) => s.id === selectedSpot);
      router.push({
        pathname: "/(root)/parking-payment",
        params: {
          parkingName,
          parkingId,
          spotId: selectedSlot?.slotNumber || selectedSpot,
        }
      });
    }
  };

  const handleBack = () => {
    router.back();
  };

  const groupedSlots = [];
  for (let i = 0; i < parkingSlots.length; i += 5) {
    groupedSlots.push(parkingSlots.slice(i, i + 5));
  }

  const selectedSlotNumber = selectedSpot ? 
    parkingSlots.find((s: any) => s.id === selectedSpot)?.slotNumber : 
    null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.statusHeader}>
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
        <Text style={styles.statusText}>
          {parkingSlots.filter(s => s.status === 'FREE').length} / {parkingSlots.length} Available
        </Text>
      </View>

      <TouchableOpacity onPress={handleBack} style={styles.floatingBackButton}>
        <Image source={icons.backArrow} style={styles.backIcon} />
      </TouchableOpacity>

      <ScrollView 
        style={styles.gridContainer}
        contentContainerStyle={styles.gridContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Choose Your Spot</Text>
          <Text style={styles.sectionSubtitle}>Real-time CV Detection</Text>
        </View>

        <View style={styles.entranceContainer}>
          <Text style={styles.entranceText}>ENTRANCE</Text>
          <View style={styles.entranceArrows}>
            <Text style={styles.arrow}>›</Text>
            <Text style={styles.arrow}>›</Text>
            <Text style={styles.arrow}>›</Text>
          </View>
        </View>

        {groupedSlots.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.rowContainer}>
            {row.map((slot: any) => {
              const isAvailable = slot.status === 'FREE';
              return (
                <View key={slot.id} style={styles.spotWrapper}>
                  {isAvailable ? (
                    <TouchableOpacity
                      style={[
                        styles.spotButton,
                        selectedSpot === slot.id && styles.spotButtonSelected,
                      ]}
                      onPress={() => handleSpotSelect(slot.id, isAvailable)}
                    >
                      <Text style={[
                        styles.spotLabel,
                        selectedSpot === slot.id && styles.spotLabelSelected,
                      ]}>
                        {slot.slotNumber}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.occupiedSpotContainer}>
                      <Text style={styles.occupiedSpotLabel}>{slot.slotNumber}</Text>
                      <Image source={images.car} style={styles.carImage} />
                    </View>
                  )}
                </View>
              );
            })}
            {Array.from({ length: 5 - row.length }).map((_, emptyIndex) => (
              <View key={`empty-${rowIndex}-${emptyIndex}`} style={styles.spotWrapper} />
            ))}
          </View>
        ))}

        <View style={styles.exitContainer}>
          <View style={styles.exitArrows}>
            <Text style={styles.arrow}>‹</Text>
            <Text style={styles.arrow}>‹</Text>
            <Text style={styles.arrow}>‹</Text>
          </View>
          <Text style={styles.exitText}>EXIT</Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.confirmButton,
            !selectedSpot && styles.confirmButtonDisabled
          ]}
          onPress={handleConfirmSpot}
          disabled={!selectedSpot}
        >
          <Text style={styles.confirmButtonText}>
            {selectedSpot ? `Pick Parking Spot ${selectedSlotNumber}` : 'Select a Spot'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#161616",
  },
  floatingBackButton: {
    position: "absolute",
    top: 35,
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#292929",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
    zIndex: 100,
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: "#FFFFFF",
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: "#161616",
    borderBottomWidth: 1,
    borderBottomColor: "#2C2C2E",
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10b981",
    marginRight: 6,
  },
  liveText: {
    fontSize: 12,
    color: "#10b981",
    fontWeight: "600",
  },
  statusText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  gridContainer: {
    flex: 1,
    backgroundColor: "#161616",
  },
  gridContent: {
    padding: 24,
  },
  sectionHeader: {
    marginBottom: 28,
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#10b981",
    letterSpacing: 0.3,
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  spotWrapper: {
    alignItems: "center",
    width: 60,
    marginHorizontal: 4,
  },
  spotButton: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: "#292929",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  spotButtonSelected: {
    backgroundColor: "#000000",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#FFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 10,
  },
  spotLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  spotLabelSelected: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  occupiedSpotContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: "#292929",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  occupiedSpotLabel: {
    position: "absolute",
    top: 4,
    fontSize: 10,
    fontWeight: "700",
    color: "#666666",
    zIndex: 1,
  },
  carImage: {
    width: 45,
    height: 45,
    resizeMode: "contain",
    opacity: 0.9,
  },
  entranceContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginBottom: 20,
    paddingLeft: 15,
    paddingVertical: 8,
  },
  entranceText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#A0A0A0",
    marginRight: 16,
    letterSpacing: 1.5,
  },
  entranceArrows: {
    flexDirection: "row",
  },
  arrow: {
    fontSize: 24,
    color: "#FFD700",
    marginHorizontal: 3,
    fontWeight: "bold",
  },
  exitContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 20,
    paddingRight: 15,
    paddingVertical: 8,
  },
  exitArrows: {
    flexDirection: "row",
    marginRight: 16,
  },
  exitText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#A0A0A0",
    letterSpacing: 1.5,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#161616",
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: "#2C2C2E",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  confirmButton: {
    backgroundColor: "#292929",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  confirmButtonDisabled: {
    backgroundColor: "#1C1C1E",
    shadowOpacity: 0,
  },
  confirmButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
});

export default ChooseSpot;