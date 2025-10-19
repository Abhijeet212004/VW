/**
 * CarPlay Manager - Optional CarPlay Integration
 * This module is completely isolated and won't affect the main app
 */

import { Platform } from 'react-native';

interface CarPlayInterface {
  isAvailable: boolean;
  isConnected: boolean;
  initialize: () => void;
  cleanup: () => void;
  setupParkingInterface: () => void;
}

class CarPlayManager implements CarPlayInterface {
  isAvailable: boolean = false;
  isConnected: boolean = false;
  private carPlayModule: any = null;

  constructor() {
    this.checkAvailability();
  }

  private checkAvailability() {
    try {
      // Only check on iOS
      if (Platform.OS === 'ios') {
        this.carPlayModule = require('react-native-carplay');
        this.isAvailable = true;
        console.log('✅ CarPlay module available');
      }
    } catch (error) {
      console.log('ℹ️ CarPlay module not installed (this is optional)');
      console.log('📱 App will run in mobile-only mode');
      this.isAvailable = false;
      this.carPlayModule = null;
    }
  }

  initialize() {
    if (!this.isAvailable || !this.carPlayModule) {
      console.log('📱 Running in standard mobile mode (no CarPlay)');
      return;
    }

    try {
      console.log('🚗 Initializing CarPlay...');
      
      // Setup CarPlay connection listeners
      this.carPlayModule.onConnect(() => {
        this.isConnected = true;
        console.log('🔗 CarPlay connected');
        this.setupParkingInterface();
      });

      this.carPlayModule.onDisconnect(() => {
        this.isConnected = false;
        console.log('📱 CarPlay disconnected - back to mobile mode');
        this.cleanup();
      });

      // Check if already connected
      if (this.carPlayModule.isConnected) {
        this.isConnected = true;
        this.setupParkingInterface();
      }

    } catch (error) {
      console.log('⚠️ CarPlay initialization failed:', error);
      this.isAvailable = false;
    }
  }

  setupParkingInterface() {
    if (!this.isAvailable || !this.carPlayModule) return;

    try {
      console.log('🅿️ Setting up CarPlay parking interface...');
      
      // Create Map Template for parking spots
      const mapTemplate = {
        component: 'ParkingMapCarPlay',
        guidanceBackgroundColor: '#0286FF',
        tripEstimateStyle: 'light',
        mapButtons: [
          {
            id: 'search',
            focusedImage: 'search-icon',
            image: 'search-icon',
          }
        ],
        automaticallyHidesNavigationBar: false,
        hidesButtonsWithNavigationBar: false,
        leadingNavigationBarButtons: [
          {
            id: 'search',
            type: 'text',
            title: 'Find Parking'
          }
        ],
        trailingNavigationBarButtons: [
          {
            id: 'profile',
            type: 'text', 
            title: 'Profile'
          }
        ]
      };

      // Set as root template
      this.carPlayModule.setRootTemplate(mapTemplate, false);
      console.log('✅ CarPlay parking interface ready');

      // Setup event listeners
      this.setupCarPlayListeners();

    } catch (error) {
      console.log('❌ Failed to setup CarPlay interface:', error);
    }
  }

  private setupCarPlayListeners() {
    if (!this.carPlayModule) return;

    // Listen for button presses
    this.carPlayModule.registerBarButtonHandler('search', () => {
      console.log('🔍 Search button pressed in CarPlay');
      this.showParkingSearch();
    });

    this.carPlayModule.registerBarButtonHandler('profile', () => {
      console.log('👤 Profile button pressed in CarPlay');
      this.showProfile();
    });
  }

  private showParkingSearch() {
    if (!this.carPlayModule) return;

    // Create list template for parking search results
    const listTemplate = {
      title: 'Find Parking',
      sections: [
        {
          items: [
            {
              text: 'Nearby Parking Spots',
              detailText: 'Find available spots near you',
              showsDisclosureIndicator: true,
              id: 'nearby'
            },
            {
              text: 'Cheap Parking',
              detailText: 'Budget-friendly options',
              showsDisclosureIndicator: true,
              id: 'cheap'
            },
            {
              text: 'Quick Access',
              detailText: 'Fast entry/exit spots',
              showsDisclosureIndicator: true,
              id: 'quick'
            }
          ]
        }
      ]
    };

    this.carPlayModule.pushTemplate(listTemplate, true);
  }

  private showProfile() {
    if (!this.carPlayModule) return;

    // Simple profile options for CarPlay
    const listTemplate = {
      title: 'Profile',
      sections: [
        {
          items: [
            {
              text: 'My Bookings',
              detailText: 'View current reservations',
              showsDisclosureIndicator: true,
              id: 'bookings'
            },
            {
              text: 'Payment Methods',
              detailText: 'Manage payment options',
              showsDisclosureIndicator: true,
              id: 'payment'
            }
          ]
        }
      ]
    };

    this.carPlayModule.pushTemplate(listTemplate, true);
  }

  cleanup() {
    console.log('🧹 CarPlay cleanup...');
    // Cleanup CarPlay resources when disconnected
  }

  // Safe methods that work whether CarPlay is available or not
  findNearbyParkingSpots(location: { latitude: number; longitude: number }) {
    if (this.isConnected && this.carPlayModule) {
      // Show on CarPlay
      this.showParkingOnCarPlay(location);
    }
    // Always return data for mobile app regardless
    return this.getParkingSpots(location);
  }

  private showParkingOnCarPlay(location: any) {
    // CarPlay-specific parking display
    console.log('🚗 Showing parking spots on CarPlay');
  }

  private getParkingSpots(location: any) {
    // Your existing parking spot logic - unchanged
    console.log('📱 Getting parking spots for mobile app');
    return [];
  }
}

// Export singleton instance
export const carPlayManager = new CarPlayManager();

// Export types for type safety
export type { CarPlayInterface };