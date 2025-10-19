/**
 * useCarPlay Hook - Safe CarPlay Integration
 * Works whether CarPlay is installed or not
 */

import { useEffect, useState } from 'react';
import { carPlayManager } from './CarPlayManager';

interface CarPlayState {
  isAvailable: boolean;
  isConnected: boolean;
  isActive: boolean;
}

export const useCarPlay = () => {
  const [carPlayState, setCarPlayState] = useState<CarPlayState>({
    isAvailable: carPlayManager.isAvailable,
    isConnected: carPlayManager.isConnected,
    isActive: false
  });

  useEffect(() => {
    // Only initialize if available
    if (carPlayManager.isAvailable) {
      carPlayManager.initialize();
      
      // Listen for connection changes
      const checkConnection = () => {
        setCarPlayState(prev => ({
          ...prev,
          isConnected: carPlayManager.isConnected,
          isActive: carPlayManager.isConnected && carPlayManager.isAvailable
        }));
      };

      // Check periodically (safe fallback)
      const interval = setInterval(checkConnection, 2000);
      
      return () => clearInterval(interval);
    }
  }, []);

  // Safe methods that work with or without CarPlay
  const findParkingSpots = (location: { latitude: number; longitude: number }) => {
    return carPlayManager.findNearbyParkingSpots(location);
  };

  const isCarPlayMode = () => {
    return carPlayState.isActive;
  };

  return {
    ...carPlayState,
    findParkingSpots,
    isCarPlayMode,
    // Expose manager for advanced usage
    carPlayManager: carPlayManager.isAvailable ? carPlayManager : null
  };
};