import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

interface ParkingSlot {
  id: string;
  slotNumber: number;
  status: 'FREE' | 'OCCUPIED' | 'BLOCKED';
  lastUpdated: string;
}

interface ParkingSlotGridProps {
  slots: ParkingSlot[];
  parkingSpotName: string;
}

const ParkingSlotGrid = ({ slots, parkingSpotName }: ParkingSlotGridProps) => {
  const freeSlots = slots.filter(slot => slot.status === 'FREE').length;
  const occupiedSlots = slots.filter(slot => slot.status === 'OCCUPIED').length;
  const totalSlots = slots.length;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{parkingSpotName}</Text>
        <View style={styles.subtitleContainer}>
          <Text style={styles.subtitle}>Real-time Parking Status</Text>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{freeSlots}</Text>
            <Text style={[styles.statLabel, { color: '#10b981' }]}>Available</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{occupiedSlots}</Text>
            <Text style={[styles.statLabel, { color: '#ef4444' }]}>Occupied</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalSlots}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>
      </View>

      <View style={styles.gridContainer}>
        <Text style={styles.gridTitle}>Parking Slots</Text>
        <View style={styles.grid}>
          {slots.map((slot) => (
            <View
              key={slot.id}
              style={[
                styles.slotBox,
                {
                  backgroundColor: 
                    slot.status === 'FREE' ? '#10b981' : 
                    slot.status === 'OCCUPIED' ? '#ef4444' : '#6b7280'
                }
              ]}
            >
              <Text style={styles.slotNumber}>{slot.slotNumber}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginRight: 4,
  },
  liveText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  gridContainer: {
    padding: 20,
  },
  gridTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  slotBox: {
    width: '18%',
    aspectRatio: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  slotNumber: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default ParkingSlotGrid;