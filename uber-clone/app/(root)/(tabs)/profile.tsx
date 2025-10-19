import { useUser, useAuth } from "@clerk/clerk-expo";
import { Image, ScrollView, Text, View, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { icons } from "@/constants";
import { useState } from "react";

const Profile = () => {
  const { user } = useUser();
  const { signOut } = useAuth();
  const [walletBalance, setWalletBalance] = useState(245.50);

  const handleAddMoney = () => {
    Alert.prompt(
      "Add Money to Wallet",
      "Enter amount to add",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Add",
          onPress: (amount) => {
            const numAmount = parseFloat(amount || "0");
            if (numAmount > 0) {
              setWalletBalance(prev => prev + numAmount);
              Alert.alert("Success", `$${numAmount.toFixed(2)} added to your wallet!`);
            }
          },
        },
      ],
      "plain-text",
      "",
      "numeric"
    );
  };

  const handleWithdraw = () => {
    Alert.prompt(
      "Withdraw Money",
      "Enter amount to withdraw",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Withdraw",
          onPress: (amount) => {
            const numAmount = parseFloat(amount || "0");
            if (numAmount > 0 && numAmount <= walletBalance) {
              setWalletBalance(prev => prev - numAmount);
              Alert.alert("Success", `$${numAmount.toFixed(2)} withdrawn from your wallet!`);
            } else if (numAmount > walletBalance) {
              Alert.alert("Error", "Insufficient balance!");
            }
          },
        },
      ],
      "plain-text",
      "",
      "numeric"
    );
  };

  const menuItems = [
    {
      id: 1,
      title: "Payment Methods",
      subtitle: "Manage your cards & UPI",
      icon: "card-outline",
      onPress: () => Alert.alert("Payment Methods", "Coming soon!"),
    },
    {
      id: 2,
      title: "My Vehicles",
      subtitle: "Add and manage vehicles",
      icon: "car-sport-outline",
      onPress: () => Alert.alert("My Vehicles", "Coming soon!"),
    },
    {
      id: 3,
      title: "Notifications",
      subtitle: "Manage notification preferences",
      icon: "notifications-outline",
      onPress: () => Alert.alert("Notifications", "Coming soon!"),
    },
    {
      id: 4,
      title: "Favorites",
      subtitle: "Your saved parking spots",
      icon: "heart-outline",
      onPress: () => Alert.alert("Favorites", "Coming soon!"),
    },
    {
      id: 5,
      title: "Help & Support",
      subtitle: "Get help or contact us",
      icon: "help-circle-outline",
      onPress: () => Alert.alert("Help & Support", "Coming soon!"),
    },
    {
      id: 6,
      title: "Settings",
      subtitle: "App preferences & privacy",
      icon: "settings-outline",
      onPress: () => Alert.alert("Settings", "Coming soon!"),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Fixed Header */}
      <Text style={styles.header}>Account</Text>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Image
                source={{
                  uri: user?.externalAccounts[0]?.imageUrl ?? user?.imageUrl,
                }}
                style={styles.avatar}
              />
              <TouchableOpacity style={styles.editAvatarButton}>
                <Ionicons name="camera" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {user?.firstName} {user?.lastName}
              </Text>
              <Text style={styles.profileEmail}>
                {user?.primaryEmailAddress?.emailAddress}
              </Text>
            </View>
          </View>
          
          {/* Edit Profile Button */}
          <TouchableOpacity 
            style={styles.editProfileButton}
            onPress={() => Alert.alert("Edit Profile", "Profile editing coming soon!")}
          >
            <Ionicons name="create-outline" size={20} color="#FFFFFF" />
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Wallet Card */}
        <View style={styles.walletCard}>
          <View style={styles.walletContent}>
            <View style={styles.walletHeader}>
              <View style={styles.walletIconBadge}>
                <Ionicons name="wallet" size={28} color="#4CAF50" />
              </View>
              <View style={styles.walletBalanceContainer}>
                <Text style={styles.walletLabel}>Wallet Balance</Text>
                <Text style={styles.walletBalance}>${walletBalance.toFixed(2)}</Text>
              </View>
            </View>

            <View style={styles.walletActions}>
              <TouchableOpacity 
                style={styles.walletActionButton}
                onPress={handleAddMoney}
              >
                <View style={styles.actionIconContainer}>
                  <Ionicons name="add-circle" size={20} color="#4CAF50" />
                </View>
                <Text style={styles.walletActionText}>Add Money</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.walletActionButton}
                onPress={handleWithdraw}
              >
                <View style={styles.actionIconContainer}>
                  <Ionicons name="arrow-up-circle" size={20} color="#4CAF50" />
                </View>
                <Text style={styles.walletActionText}>Withdraw</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="time-outline" size={28} color="#4CAF50" />
            <Text style={styles.statValue}>24</Text>
            <Text style={styles.statLabel}>Total Bookings</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="star" size={28} color="#FFB800" />
            <Text style={styles.statValue}>4.8</Text>
            <Text style={styles.statLabel}>Your Rating</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="cash-outline" size={28} color="#4285F4" />
            <Text style={styles.statValue}>$285</Text>
            <Text style={styles.statLabel}>Total Spent</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>General</Text>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons name={item.icon as any} size={24} color="#4CAF50" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={() => Alert.alert("Logout", "Are you sure you want to logout?", [
            { text: "Cancel", style: "cancel" },
            { 
              text: "Logout", 
              style: "destructive",
              onPress: async () => {
                try {
                  await signOut();
                } catch (error) {
                  console.error("Logout error:", error);
                  Alert.alert("Error", "Failed to logout. Please try again.");
                }
              }
            }
          ])}
        >
          <Ionicons name="log-out-outline" size={24} color="#EA4335" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={styles.versionText}>ParkEasy v1.0.0</Text>
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
  profileCard: {
    backgroundColor: "#292929",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#4CAF50",
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#4CAF50",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#292929",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  profileEmail: {
    fontSize: 14,
    color: "#8E8E93",
  },
  profilePhone: {
    fontSize: 14,
    color: "#8E8E93",
  },
  editProfileButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3A3A3C",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 16,
    gap: 8,
  },
  editProfileText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  walletCard: {
    marginBottom: 16,
    borderRadius: 20,
    backgroundColor: "#292929",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  walletContent: {
    padding: 20,
  },
  walletGradient: {
    padding: 24,
  },
  walletHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  walletIconBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(76, 175, 80, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  walletBalanceContainer: {
    flex: 1,
  },
  walletLabel: {
    fontSize: 14,
    color: "#8E8E93",
    marginBottom: 4,
    fontWeight: "500",
  },
  walletBalance: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  walletIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  walletActions: {
    flexDirection: "row",
    gap: 12,
  },
  walletActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    backgroundColor: "#3A3A3C",
    borderRadius: 12,
    gap: 8,
  },
  actionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(76, 175, 80, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  walletDivider: {
    width: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  walletActionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#292929",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#8E8E93",
    textAlign: "center",
  },
  menuSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 12,
    marginLeft: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#292929",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  menuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(76, 175, 80, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 13,
    color: "#8E8E93",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(234, 67, 53, 0.15)",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    gap: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#EA4335",
  },
  versionText: {
    fontSize: 12,
    color: "#8E8E93",
    textAlign: "center",
    marginBottom: 100,
  },
});

export default Profile;