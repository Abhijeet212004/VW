import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Text, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { icons } from '@/constants';
import ParkingSlotGrid from '@/components/ParkingSlotGrid';

const ParkingSlots = () => {
  const { parkingSpotId, parkingSpotName } = useLocalSearchParams();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchParkingSlots();
    // Refresh every 3 seconds for real-time updates
    const interval = setInterval(fetchParkingSlots, 3000);
    return () => clearInterval(interval);
  }, [parkingSpotId]);

  const fetchParkingSlots = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/parking-spot/${parkingSpotId}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        setSlots(result.data.realTimeSlots || []);
        console.log(`Updated slots: ${result.data.availableSpots}/${result.data.totalSlots} available`);
      }
    } catch (error) {
      console.error('Error fetching parking slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackPress = () => {
    router.back();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Loading parking slots...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Image source={icons.backArrow} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Parking Slots</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Slot Grid */}
      <ParkingSlotGrid 
        slots={slots} 
        parkingSpotName={parkingSpotName as string || 'Parking Spot'} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    width: 20,
    height: 20,
    tintColor: '#374151',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
});

export default ParkingSlots;