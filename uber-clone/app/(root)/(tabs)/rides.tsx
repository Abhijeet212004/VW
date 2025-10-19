import { router } from "expo-router";
import { ScrollView, Text, View, TouchableOpacity, Image, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const servicesData = [
  {
    id: 1,
    title: "Early Booking",
    subtitle: "Reserve your spot",
    image: require("@/assets/images/2111.w023.n001.1368B.p1.1368.jpg"),
    badge: "15%",
  },
  {
    id: 2,
    title: "Monthly Pass",
    subtitle: "Best value deals",
    image: require("@/assets/images/2301.i607.012.S.m012.c12.self service isometric set.jpg"),
    badge: "15%",
  },
  {
    id: 3,
    title: "Valet Parking",
    subtitle: "Premium service",
    image: require("@/assets/images/2111.w023.n001.1368B.p1.1368.jpg"),
    badge: "50%",
  },
  {
    id: 4,
    title: "EV Charging",
    subtitle: "Charge while parked",
    image: require("@/assets/images/2301.i607.012.S.m012.c12.self service isometric set.jpg"),
    badge: "Promo",
  },
];

const Services = () => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Static Header Section */}
      <View style={styles.headerSection}>
        <Text style={styles.header}>Services</Text>
        <Text style={styles.subtitle}>Go anywhere, park everywhere</Text>
      </View>

      {/* Scrollable Content */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Featured Cards - Horizontal Scroll */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featuredScrollContainer}
          style={styles.featuredScroll}
        >
          {/* First Featured Card */}
          <TouchableOpacity 
            style={styles.featuredCard}
            onPress={() => router.push("/(root)/find-parking")}
          >
            <View style={styles.featuredContent}>
              <Text style={styles.featuredTitle}>
                Enjoy stress-free{'\n'}parking with{'\n'}ParkEasy Reserve
              </Text>
              <TouchableOpacity style={styles.featuredButton}>
                <Text style={styles.featuredButtonText}>Book in advance</Text>
              </TouchableOpacity>
            </View>
            <Image 
              source={require("@/assets/images/2111.w023.n001.1368B.p1.1368.jpg")}
              style={styles.featuredImage}
              resizeMode="cover"
            />
          </TouchableOpacity>

          {/* Second Featured Card */}
          <TouchableOpacity 
            style={styles.featuredCard}
            onPress={() => router.push("/(root)/find-parking")}
          >
            <View style={styles.featuredContent}>
              <Text style={styles.featuredTitle}>
                Book parking for{'\n'}someone else
              </Text>
              <TouchableOpacity style={styles.featuredButton}>
                <Text style={styles.featuredButtonText}>Help others park</Text>
              </TouchableOpacity>
            </View>
            <Image 
              source={require("@/assets/images/2301.i607.012.S.m012.c12.self service isometric set.jpg")}
              style={styles.featuredImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#161616",
  },
  headerSection: {
    backgroundColor: "#161616",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    fontSize: 34,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "400",
    color: "#FFFFFF",
  },
  featuredScroll: {
    marginBottom: 100,
    marginTop: 8,
  },
  featuredScrollContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  featuredCard: {
    backgroundColor: "#E8E8E8",
    borderRadius: 16,
    overflow: "hidden",
    flexDirection: "row",
    height: 200,
    width: 340,
  },
  featuredContent: {
    flex: 1,
    padding: 20,
    justifyContent: "space-between",
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000000",
    lineHeight: 24,
  },
  featuredButton: {
    backgroundColor: "#000000",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  featuredButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  featuredImage: {
    width: 140,
    height: "100%",
  },
});

export default Services;