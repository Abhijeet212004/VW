import { useEffect } from 'react';

export function useCarPlayEvents() {
  useEffect(() => {
    // For now, just log that CarPlay events are being handled
    console.log('🚗 CarPlay events handler initialized');
    
    // TODO: Add CarPlay bridge integration here when native module is ready
    
    return () => {
      console.log('🚗 CarPlay events handler cleanup');
    };
  }, []);
}