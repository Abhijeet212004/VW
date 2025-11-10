import { Image, ScrollView, Text, View, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";

// Mock data for past parking bookings
const mockPastBookings = [
  {
    id: 1,
    parkingName: "City Center Mall Parking",
    address: "123 Main Street, Downtown",
    date: "Dec 15, 2024",
    time: "2:30 PM - 5:45 PM",
    duration: "3h 15m",
    price: "$12.50",
    status: "Completed",
    latitude: 37.7849,
    longitude: -122.4094,
    spotNumber: "A-23",
    floor: "2nd Floor"
  },
  {
    id: 2,
    parkingName: "Airport Parking Lot B",
    address: "456 Airport Rd, Terminal 2",
    date: "Dec 10, 2024",
    time: "9:00 AM - 11:30 AM",
    duration: "2h 30m",
    price: "$15.00",
    status: "Completed",
    latitude: 37.7749,
    longitude: -122.4194,
    spotNumber: "B-15",
    floor: "1st Floor"
  },
  {
    id: 3,
    parkingName: "Downtown Plaza Parking",
    address: "789 Business Ave",
    date: "Dec 8, 2024",
    time: "1:00 PM - 2:15 PM",
    duration: "1h 15m",
    price: "$8.00",
    status: "Cancelled",
    latitude: 37.7649,
    longitude: -122.4294,
    spotNumber: "C-08",
    floor: "3rd Floor"
  },
];

// Mock data for upcoming bookings (empty for now)
const mockUpcomingBookings: any[] = [];

const ParkingBookingCard = ({ booking }: { booking: any }) => {
  const handleRebook = () => {
    // Navigate to find parking with the same location
    router.push("/(root)/find-parking");
  };

  return (
    <View style={styles.bookingCard}>
      {/* Map Thumbnail */}
      <View style={styles.mapContainer}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.mapThumbnail}
          initialRegion={{
            latitude: booking.latitude,
            longitude: booking.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          scrollEnabled={false}
          zoomEnabled={false}
          rotateEnabled={false}
          pitchEnabled={false}
        >
          <Marker
            coordinate={{
              latitude: booking.latitude,
              longitude: booking.longitude,
            }}
            pinColor="#EA4335"
          />
        </MapView>
      </View>

      {/* Booking Details */}
      <View style={styles.detailsContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.parkingName}>{booking.parkingName}</Text>
          <Text style={styles.price}>{booking.price}</Text>
        </View>

        <Text style={styles.address}>{booking.address}</Text>

        <View style={styles.infoRow}>
          <Text style={styles.spotInfo}>{booking.spotNumber}</Text>
          <Text style={styles.dotSeparator}>•</Text>
          <Text style={styles.floorInfo}>{booking.floor}</Text>
        </View>

        <View style={styles.timeRow}>
          <Text style={styles.date}>{booking.date}</Text>
          <Text style={styles.dotSeparator}>•</Text>
          <Text style={styles.time}>{booking.time}</Text>
        </View>

        <Text style={styles.duration}>Duration: {booking.duration}</Text>

        {/* Status and Action */}
        <View style={styles.footerRow}>
          <View style={[
            styles.statusBadge,
            booking.status === "Cancelled" ? styles.statusCancelled : styles.statusCompleted
          ]}>
            <Text style={[
              styles.statusText,
              booking.status === "Cancelled" ? styles.statusTextCancelled : styles.statusTextCompleted
            ]}>
              {booking.status}
            </Text>
          </View>

          <TouchableOpacity style={styles.rebookButton} onPress={handleRebook}>
            <Text style={styles.rebookText}>Rebook</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const Activity = () => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Fixed Header */}
      <Text style={styles.header}>Activity</Text>
      
      <ScrollView style={styles.scrollView}>
        {/* Upcoming Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming</Text>
          {mockUpcomingBookings.length === 0 ? (
            <View style={styles.emptyState}>
              <Image
                source={require("@/assets/images/no-result.png")}
                style={styles.emptyIcon}
                resizeMode="contain"
              />
              <Text style={styles.emptyTitle}>You have no upcoming parking</Text>
              <Text style={styles.emptySubtitle}>
                Reserve your parking spot in advance
              </Text>
              <TouchableOpacity 
                style={styles.reserveButton}
                onPress={() => router.push("/(root)/find-parking")}
              >
                <Text style={styles.reserveButtonText}>Find Parking</Text>
              </TouchableOpacity>
            </View>
          ) : (
            mockUpcomingBookings.map((booking) => (
              <ParkingBookingCard key={booking.id} booking={booking} />
            ))
          )}
        </View>

        {/* Past Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Past</Text>
          {mockPastBookings.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No past bookings</Text>
            </View>
          ) : (
            mockPastBookings.map((booking) => (
              <ParkingBookingCard key={booking.id} booking={booking} />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#161616",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 34,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 8,
    marginBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: "#161616",
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  emptyState: {
    backgroundColor: "#292929",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyIcon: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 20,
    textAlign: "center",
  },
  reserveButton: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  reserveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#161616",
  },
  bookingCard: {
    backgroundColor: "#292929",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  mapContainer: {
    height: 150,
    width: "100%",
  },
  mapThumbnail: {
    flex: 1,
  },
  detailsContainer: {
    padding: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  parkingName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    flex: 1,
    marginRight: 12,
  },
  price: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4CAF50",
  },
  address: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  spotInfo: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  floorInfo: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: "#8E8E93",
  },
  time: {
    fontSize: 14,
    color: "#8E8E93",
  },
  dotSeparator: {
    fontSize: 14,
    color: "#8E8E93",
    marginHorizontal: 8,
  },
  duration: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 16,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusCompleted: {
    backgroundColor: "rgba(76, 175, 80, 0.15)",
  },
  statusCancelled: {
    backgroundColor: "rgba(234, 67, 53, 0.15)",
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
  },
  statusTextCompleted: {
    color: "#4CAF50",
  },
  statusTextCancelled: {
    color: "#EA4335",
  },
  rebookButton: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  rebookText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#161616",
  },
});

export default Activity;