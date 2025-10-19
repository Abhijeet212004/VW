/**
 * CarPlay Parking Components
 * These only load when CarPlay is connected
 */

import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { carPlayManager } from './CarPlayManager';

interface ParkingSpot {
  id: string;
  location: { latitude: number; longitude: number };
  price: number;
  available: boolean;
  distance: number;
}

export const ParkingMapCarPlay: React.FC = () => {
  const [parkingSpots, setParkingSpots] = useState<ParkingSpot[]>([]);

  useEffect(() => {
    // Only runs when CarPlay is connected
    if (carPlayManager.isConnected) {
      console.log('🚗 CarPlay parking map loaded');
      loadParkingSpots();
    }
  }, []);

  const loadParkingSpots = () => {
    // Use your existing parking API
    // This won't interfere with mobile app
    const spots = carPlayManager.findNearbyParkingSpots({
      latitude: 37.7749,
      longitude: -122.4194
    });
    setParkingSpots(spots);
  };

  // Fallback for when CarPlay is not available
  if (!carPlayManager.isAvailable) {
    return (
      <View>
        <Text>CarPlay not available - using mobile interface</Text>
      </View>
    );
  }

  return (
    <View>
      <Text>CarPlay Parking Map Active</Text>
      {/* CarPlay-specific map rendering */}
    </View>
  );
};

export const CarPlayParkingList: React.FC<{ spots: ParkingSpot[] }> = ({ spots }) => {
  if (!carPlayManager.isAvailable) {
    return null; // Don't render if CarPlay not available
  }

  return (
    <View>
      {spots.map(spot => (
        <View key={spot.id}>
          <Text>{`₹${spot.price}/hr - ${spot.distance}m away`}</Text>
        </View>
      ))}
    </View>
  );
};