import { useAuth } from "@/contexts/AuthContext";
import { Image, ScrollView, Text, View, TouchableOpacity, StyleSheet, Alert, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { icons } from "@/constants";
import { useState, useEffect, useCallback } from "react";

const Profile = () => {
  const { user, token, signOut } = useAuth();
  const [walletData, setWalletData] = useState({
    balance: 0,
    lockedBalance: 0,
    availableBalance: 0,
    minBalance: 50,
    maxBalance: 10000,
  });
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchWalletBalance = async () => {
    if (!token) return;
    
    try {
      const response = await fetch('http://localhost:3000/api/wallet/balance', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      if (data.success) {
        setWalletData(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch wallet balance:', error);
    }
  };

  const fetchUserBookings = async () => {
    if (!token) return;
    
    try {
      const response = await fetch('http://localhost:3000/api/booking/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      if (data.success) {
        setBookings(data.data.bookings);
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchWalletBalance(), fetchUserBookings()]);
    setRefreshing(false);
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchWalletBalance();
      fetchUserBookings();
    }
  }, [token]);

  const handleAddMoney = () => {
    Alert.prompt(
      "Add Money to Wallet",
      `Enter amount to add (Max: ₹${walletData.maxBalance - walletData.balance})`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Add",
          onPress: async (amount) => {
            const numAmount = parseFloat(amount || "0");
            if (numAmount > 0) {
              setIsLoading(true);
              try {
                const response = await fetch('http://localhost:3000/api/wallet/add-money', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    amount: numAmount,
                    description: 'Money added via app',
                  }),
                });
                
                const data = await response.json();
                if (data.success) {
                  Alert.alert("Success", `₹${numAmount.toFixed(0)} added to your wallet!`);
                  fetchWalletBalance(); // Refresh balance
                } else {
                  Alert.alert("Error", data.message || "Failed to add money");
                }
              } catch (error) {
                Alert.alert("Error", "Network error. Please try again.");
              } finally {
                setIsLoading(false);
              }
            } else {
              Alert.alert("Error", "Please enter a valid amount");
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
      title: "My Bookings",
      subtitle: `${bookings.length} total bookings`,
      icon: "bookmark-outline",
      onPress: () => {
        if (bookings.length === 0) {
          Alert.alert("No Bookings", "You haven't made any bookings yet.");
        } else {
          const bookingList = bookings.slice(0, 5).map((booking: any, index) => 
            `${index + 1}. ${booking.parkingSpot.name} - ₹${booking.totalAmount}`
          ).join('\n');
          Alert.alert("Recent Bookings", bookingList + (bookings.length > 5 ? '\n...and more' : ''));
        }
      },
    },
    {
      id: 4,
      title: "Notifications",
      subtitle: "Manage notification preferences",
      icon: "notifications-outline",
      onPress: () => Alert.alert("Notifications", "Coming soon!"),
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
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.profileInfo}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user?.name || 'User'}</Text>
                <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Wallet Section */}
        <View style={styles.walletSection}>
          <View style={styles.walletCard}>
            <View style={styles.walletHeader}>
              <Text style={styles.walletTitle}>Wallet Balance</Text>
              <TouchableOpacity onPress={fetchWalletBalance}>
                <Ionicons name="refresh" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <Text style={styles.walletBalance}>₹{walletData.balance.toFixed(2)}</Text>
            {walletData.lockedBalance > 0 && (
              <Text style={styles.lockedBalance}>
                Locked: ₹{walletData.lockedBalance.toFixed(2)}
              </Text>
            )}
            <View style={styles.walletActions}>
              <TouchableOpacity 
                style={styles.walletButton} 
                onPress={handleAddMoney}
                disabled={isLoading}
              >
                <Ionicons name="add-circle" size={20} color="#FFFFFF" />
                <Text style={styles.walletButtonText}>Add Money</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.menuItem} 
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIconContainer}>
                  <Ionicons name={item.icon as any} size={24} color="#FFFFFF" />
                </View>
                <View style={styles.menuItemContent}>
                  <Text style={styles.menuItemTitle}>{item.title}</Text>
                  <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
          <Ionicons name="log-out-outline" size={24} color="#ff4757" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#161616',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#161616',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  headerContent: {
    alignItems: 'center',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  walletSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  walletCard: {
    backgroundColor: '#2A2A2A',
    padding: 20,
    borderRadius: 16,
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  walletTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  walletBalance: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  lockedBalance: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
    marginBottom: 15,
  },
  walletActions: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  walletButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3A3A3A',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  walletButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  menuSection: {
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2A2A2A',
    padding: 16,
    marginBottom: 10,
    borderRadius: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3A3A3A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.7,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2A2A2A',
    marginHorizontal: 20,
    marginVertical: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ff4757',
  },
  signOutText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#ff4757',
  },
});

export default Profile;