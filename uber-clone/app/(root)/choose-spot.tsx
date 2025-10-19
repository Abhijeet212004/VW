import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, SafeAreaView } from "react-native";
import { icons, images } from "@/constants";

// Parking spot grid configuration
const FLOORS = [
  { id: 1, name: "1st Floor" },
  { id: 2, name: "2nd Floor" },
  { id: 3, name: "3rd Floor" },
];

// Generate parking spots for each floor
const generateParkingSpots = (floor: number) => {
  const rows = ["A", "B", "C"];
  const spotsPerRow = 4;
  const spots = [];
  
  for (const row of rows) {
    for (let i = 1; i <= spotsPerRow; i++) {
      const spotNumber = i + 10;
      const isAvailable = Math.random() > 0.3; // 70% spots available
      spots.push({
        id: `${floor}-${row}-${spotNumber}`,
        label: `${row}-${spotNumber}`,
        row,
        number: spotNumber,
        isAvailable,
        floor,
      });
    }
  }
  return spots;
};

const ChooseSpot = () => {
  const params = useLocalSearchParams();
  const parkingName = params.parkingName as string || "Parking Location";
  const parkingId = params.parkingId as string;
  
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [selectedSpot, setSelectedSpot] = useState<string | null>(null);
  const [parkingSpots] = useState(() => {
    // Generate spots for all floors
    const allSpots: any = {};
    FLOORS.forEach(floor => {
      allSpots[floor.id] = generateParkingSpots(floor.id);
    });
    return allSpots;
  });

  const currentFloorSpots = parkingSpots[selectedFloor];

  const handleSpotSelect = (spotId: string, isAvailable: boolean) => {
    if (isAvailable) {
      setSelectedSpot(spotId);
    }
  };

  const handleConfirmSpot = () => {
    if (selectedSpot) {
      // Navigate to payment screen
      router.push({
        pathname: "/(root)/parking-payment",
        params: {
          parkingName,
          parkingId,
          spotId: selectedSpot,
        }
      });
    }
  };

  const handleBack = () => {
    router.back();
  };

  // Group spots by row
  const spotsByRow = currentFloorSpots.reduce((acc: any, spot: any) => {
    if (!acc[spot.row]) {
      acc[spot.row] = [];
    }
    acc[spot.row].push(spot);
    return acc;
  }, {});

  const selectedSpotLabel = selectedSpot ? 
    currentFloorSpots.find((s: any) => s.id === selectedSpot)?.label : 
    null;

  return (
    <SafeAreaView style={styles.container}>
      {/* Floor Selector */}
      <View style={styles.floorSelector}>
        {FLOORS.map((floor) => (
          <TouchableOpacity
            key={floor.id}
            style={[
              styles.floorButton,
              selectedFloor === floor.id && styles.floorButtonActive
            ]}
            onPress={() => setSelectedFloor(floor.id)}
          >
            <Text style={[
              styles.floorButtonText,
              selectedFloor === floor.id && styles.floorButtonTextActive
            ]}>
              {floor.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Back Button - Floating */}
      <TouchableOpacity onPress={handleBack} style={styles.floatingBackButton}>
        <Image source={icons.backArrow} style={styles.backIcon} />
      </TouchableOpacity>

      {/* Parking Grid */}
      <ScrollView 
        style={styles.gridContainer}
        contentContainerStyle={styles.gridContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Section Title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Choose Your Spot</Text>
         
        </View>

        {/* Top Row (Row A) */}
        <View style={styles.rowContainer}>
          {spotsByRow["A"]?.map((spot: any) => (
            <View key={spot.id} style={styles.spotWrapper}>
              {spot.isAvailable ? (
                <TouchableOpacity
                  style={[
                    styles.spotButton,
                    selectedSpot === spot.id && styles.spotButtonSelected,
                  ]}
                  onPress={() => handleSpotSelect(spot.id, spot.isAvailable)}
                >
                  <Text style={[
                    styles.spotLabel,
                    selectedSpot === spot.id && styles.spotLabelSelected,
                  ]}>
                    {spot.label}
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.occupiedSpotContainer}>
                  <Text style={styles.occupiedSpotLabel}>{spot.label}</Text>
                  <Image source={images.car} style={styles.carImage} />
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Entrance Indicator */}
        <View style={styles.entranceContainer}>
          <Text style={styles.entranceText}>ENTRANCE</Text>
          <View style={styles.entranceArrows}>
            <Text style={styles.arrow}>›</Text>
            <Text style={styles.arrow}>›</Text>
            <Text style={styles.arrow}>›</Text>
          </View>
        </View>

        {/* Middle Row (Row B) */}
        <View style={styles.rowContainer}>
          {spotsByRow["B"]?.map((spot: any) => (
            <View key={spot.id} style={styles.spotWrapper}>
              {spot.isAvailable ? (
                <TouchableOpacity
                  style={[
                    styles.spotButton,
                    selectedSpot === spot.id && styles.spotButtonSelected,
                  ]}
                  onPress={() => handleSpotSelect(spot.id, spot.isAvailable)}
                >
                  <Text style={[
                    styles.spotLabel,
                    selectedSpot === spot.id && styles.spotLabelSelected,
                  ]}>
                    {spot.label}
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.occupiedSpotContainer}>
                  <Text style={styles.occupiedSpotLabel}>{spot.label}</Text>
                  <Image source={images.car} style={styles.carImage} />
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Bottom Row (Row C) */}
        <View style={styles.rowContainer}>
          {spotsByRow["C"]?.map((spot: any) => (
            <View key={spot.id} style={styles.spotWrapper}>
              {spot.isAvailable ? (
                <TouchableOpacity
                  style={[
                    styles.spotButton,
                    selectedSpot === spot.id && styles.spotButtonSelected,
                  ]}
                  onPress={() => handleSpotSelect(spot.id, spot.isAvailable)}
                >
                  <Text style={[
                    styles.spotLabel,
                    selectedSpot === spot.id && styles.spotLabelSelected,
                  ]}>
                    {spot.label}
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.occupiedSpotContainer}>
                  <Text style={styles.occupiedSpotLabel}>{spot.label}</Text>
                  <Image source={images.car} style={styles.carImage} />
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Exit Indicator */}
        <View style={styles.exitContainer}>
          <View style={styles.exitArrows}>
            <Text style={styles.arrow}>‹</Text>
            <Text style={styles.arrow}>‹</Text>
            <Text style={styles.arrow}>‹</Text>
          </View>
          <Text style={styles.exitText}>EXIT</Text>
        </View>

        {/* Spacing for button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Confirm Button */}
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
            {selectedSpot ? `Pick Parking Spot ${selectedSpotLabel}` : 'Select a Spot'}
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
  floorSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: "#161616",
    borderBottomWidth: 1,
    borderBottomColor: "#2C2C2E",
  },
  floorButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: "#292929",
    marginHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  floorButtonActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#FFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  floorButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  floorButtonTextActive: {
    color: "#000000",
    fontWeight: "700",
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
    color: "#8E8E93",
    letterSpacing: 0.3,
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 35,
  },
  spotWrapper: {
    alignItems: "center",
    width: "22%",
  },
  spotButton: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: 0,
    backgroundColor: "#292929",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 6,
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
    width: "100%",
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: 0,
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
    top: 6,
    fontSize: 11,
    fontWeight: "700",
    color: "#666666",
    zIndex: 1,
    letterSpacing: 0.5,
  },
  carImage: {
    width: "75%",
    height: "75%",
    resizeMode: "contain",
    opacity: 0.9,
  },
  entranceContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginBottom: 35,
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
