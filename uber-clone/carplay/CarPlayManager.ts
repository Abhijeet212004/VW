/**/**/**

 * CarPlay Manager - Simplified CarPlay Integration

 */ * CarPlay Manager - Simplified CarPlay Integration * CarPlay Manager - Optional CarPlay Integration



import { Platform, Alert } from 'react-native'; */ * This module is completely isolated and won't affect the main app



class CarPlayManager { */

  private carPlayModule: any = null;

  isAvailable: boolean = false;import { Platform, Alert } from 'react-native';



  constructor() {import { Platform, Alert } from 'react-native';

    this.checkAvailability();

  }class CarPlayManager {



  private checkAvailability() {  private carPlayModule: any = null;interface CarPlayInterface {

    try {

      if (Platform.OS === 'ios') {  isAvailable: boolean = false;  isAvailable: boolean;

        const CarPlay = require('react-native-carplay');

        if (CarPlay && typeof CarPlay.setRootTemplate === 'function') {  isConnected: boolean;

          this.carPlayModule = CarPlay;

          this.isAvailable = true;  constructor() {  initialize: () => void;

          console.log('✅ CarPlay module available');

        } else {    this.checkAvailability();  cleanup: () => void;

          throw new Error('CarPlay module not properly loaded');

        }  }  setupParkingInterface: () => void;

      }

    } catch (error) {}

      console.log('ℹ️ CarPlay module not available:', error.message);

      console.log('📱 App will run in mobile-only mode');  private checkAvailability() {

      this.isAvailable = false;

      this.carPlayModule = null;    try {class CarPlayManager implements CarPlayInterface {

    }

  }      if (Platform.OS === 'ios') {  isAvailable: boolean = false;



  initialize() {        const CarPlay = require('react-native-carplay');  isConnected: boolean = false;

    if (!this.isAvailable || !this.carPlayModule) {

      console.log('📱 Running in standard mobile mode (no CarPlay)');        if (CarPlay && typeof CarPlay.setRootTemplate === 'function') {  private carPlayModule: any = null;

      return Promise.resolve();

    }          this.carPlayModule = CarPlay;



    return new Promise((resolve) => {          this.isAvailable = true;  constructor() {

      try {

        console.log('🚗 Initializing CarPlay...');          console.log('✅ CarPlay module available');    this.checkAvailability();

        

        // Setup CarPlay interface        } else {  }

        this.setupParkingInterface();

        resolve();          throw new Error('CarPlay module not properly loaded');

      } catch (error) {

        console.log('⚠️ CarPlay initialization failed:', error.message);        }  private checkAvailability() {

        resolve();

      }      }    try {

    });

  }    } catch (error) {      // Only check on iOS



  setupParkingInterface() {      console.log('ℹ️ CarPlay module not available:', error.message);      if (Platform.OS === 'ios') {

    if (!this.isAvailable || !this.carPlayModule) return;

      console.log('📱 App will run in mobile-only mode');        // Try to require the module safely

    try {

      console.log('🅿️ Setting up CarPlay parking interface...');      this.isAvailable = false;        const CarPlay = require('react-native-carplay');

      

      // Create list items with handlers      this.carPlayModule = null;        if (CarPlay && typeof CarPlay.setRootTemplate === 'function') {

      const listItems = [

        {    }          this.carPlayModule = CarPlay;

          text: 'Find Parking',

          detailText: 'Locate nearby parking spots',  }          this.isAvailable = true;

          onPress: () => {

            console.log('🅿️ Find Parking selected');          console.log('✅ CarPlay module available');

            Alert.alert('CarPlay', 'Find Parking selected - Feature coming soon!');

          }  initialize() {        } else {

        },

        {    if (!this.isAvailable || !this.carPlayModule) {          throw new Error('CarPlay module not properly loaded');

          text: 'My Bookings',

          detailText: 'View current reservations',      console.log('📱 Running in standard mobile mode (no CarPlay)');        }

          onPress: () => {

            console.log('📋 My Bookings selected');      return Promise.resolve();      } else {

            Alert.alert('CarPlay', 'My Bookings selected - Feature coming soon!');

          }    }        console.log('📱 Running on Android - CarPlay not available');

        },

        {      }

          text: 'My Vehicles',

          detailText: 'Manage registered vehicles',    return new Promise((resolve) => {    } catch (error) {

          onPress: () => {

            console.log('🚗 My Vehicles selected');      try {      console.log('ℹ️ CarPlay module not available:', error.message);

            Alert.alert('CarPlay', 'My Vehicles selected - Feature coming soon!');

          }        console.log('🚗 Initializing CarPlay...');      console.log('📱 App will run in mobile-only mode');

        }

      ];              this.isAvailable = false;



      // Create list template        // Setup CarPlay interface      this.carPlayModule = null;

      const listTemplate = {

        title: 'TechWagon Parking',        this.setupParkingInterface();    }

        sections: [{

          items: listItems        resolve();  }

        }]

      };      } catch (error) {



      // Set root template        console.log('⚠️ CarPlay initialization failed:', error.message);  initialize() {

      this.carPlayModule.setRootTemplate(listTemplate);

      console.log('✅ CarPlay parking interface setup complete');        resolve();    if (!this.isAvailable || !this.carPlayModule) {

      

    } catch (error) {      }      console.log('📱 Running in standard mobile mode (no CarPlay)');

      console.log('❌ Failed to setup CarPlay interface:', error.message);

    }    });      return Promise.resolve();

  }

}  }    }



export default CarPlayManager;

  setupParkingInterface() {    return new Promise((resolve) => {

    if (!this.isAvailable || !this.carPlayModule) return;      try {

        console.log('🚗 Initializing CarPlay...');

    try {        

      console.log('🅿️ Setting up CarPlay parking interface...');        // Setup CarPlay connection listeners with error handling

              if (typeof this.carPlayModule.onConnect === 'function') {

      // Create list items with handlers          this.carPlayModule.onConnect(() => {

      const listItems = [            this.isConnected = true;

        {            console.log('🔗 CarPlay connected');

          text: 'Find Parking',            this.setupParkingInterface();

          detailText: 'Locate nearby parking spots',          });

          onPress: () => {        }

            console.log('🅿️ Find Parking selected');

            Alert.alert('CarPlay', 'Find Parking selected - Feature coming soon!');        if (typeof this.carPlayModule.onDisconnect === 'function') {

          }          this.carPlayModule.onDisconnect(() => {

        },            this.isConnected = false;

        {            console.log('📱 CarPlay disconnected - back to mobile mode');

          text: 'My Bookings',            this.cleanup();

          detailText: 'View current reservations',          });

          onPress: () => {        }

            console.log('📋 My Bookings selected');

            Alert.alert('CarPlay', 'My Bookings selected - Feature coming soon!');        // Check if already connected

          }        if (this.carPlayModule.isConnected) {

        },          this.isConnected = true;

        {          this.setupParkingInterface();

          text: 'My Vehicles',        }

          detailText: 'Manage registered vehicles',

          onPress: () => {        resolve();

            console.log('🚗 My Vehicles selected');      } catch (error) {

            Alert.alert('CarPlay', 'My Vehicles selected - Feature coming soon!');        console.log('⚠️ CarPlay initialization failed:', error.message);

          }        this.isAvailable = false;

        }        this.carPlayModule = null;

      ];        resolve();

      }

      // Create list template    });

      const listTemplate = {  }

        title: 'TechWagon Parking',

        sections: [{  setupParkingInterface() {

          items: listItems    if (!this.isAvailable || !this.carPlayModule) return;

        }]

      };    try {

      console.log('🅿️ Setting up CarPlay parking interface...');

      // Set root template      

      this.carPlayModule.setRootTemplate(listTemplate);      // Create list items with handlers

      console.log('✅ CarPlay parking interface setup complete');      const listItems = [

              {

    } catch (error) {          text: 'Find Parking',

      console.log('❌ Failed to setup CarPlay interface:', error.message);          detailText: 'Locate nearby parking spots',

    }          onPress: () => {

  }            console.log('🅿️ Find Parking selected');

}            Alert.alert('CarPlay', 'Find Parking - Feature coming soon!');

          }

export default CarPlayManager;        },
        {
          text: 'My Bookings',
          detailText: 'View current reservations',
          onPress: () => {
            console.log('📋 My Bookings selected');
            Alert.alert('CarPlay', 'My Bookings - Feature coming soon!');
          }
        },
        {
          text: 'My Vehicles',
          detailText: 'Manage registered vehicles',
          onPress: () => {
            console.log('🚗 My Vehicles selected');
            Alert.alert('CarPlay', 'My Vehicles - Feature coming soon!');
          }
        }
      ];

      // Create list template with react-native-carplay
      const listTemplate = {
        title: 'TechWagon Parking',
        sections: [{
          items: listItems
        }]
      };

      // Set root template
      this.carPlayModule.setRootTemplate(listTemplate);
      console.log('✅ CarPlay parking interface setup complete');
      
    } catch (error) {
      console.log('❌ Failed to setup CarPlay interface:', error.message);
    }
  }

  cleanup() {
    // Cleanup CarPlay resources if needed
    console.log('🧹 CarPlay cleanup complete');
  }
}

export default CarPlayManager;
      console.log('📱 Running in standard mobile mode (no CarPlay)');
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      try {
        console.log('🚗 Initializing CarPlay...');
        
        // Setup CarPlay connection listeners with error handling
        if (typeof this.carPlayModule.onConnect === 'function') {
          this.carPlayModule.onConnect(() => {
            this.isConnected = true;
            console.log('🔗 CarPlay connected');
            this.setupParkingInterface();
          });
        }

        if (typeof this.carPlayModule.onDisconnect === 'function') {
          this.carPlayModule.onDisconnect(() => {
            this.isConnected = false;
            console.log('📱 CarPlay disconnected - back to mobile mode');
            this.cleanup();
          });
        }

        // Check if already connected
        if (this.carPlayModule.isConnected) {
          this.isConnected = true;
          this.setupParkingInterface();
        }

        resolve();
      } catch (error) {
        console.log('⚠️ CarPlay initialization failed:', error.message);
        this.isAvailable = false;
        this.carPlayModule = null;
        resolve();
      }
    });
  }

  setupParkingInterface() {
    if (!this.isAvailable || !this.carPlayModule) return;

    try {
      console.log('🅿️ Setting up CarPlay parking interface...');
      
      // Create simple List Template first (easier to debug)
      const listTemplate = {
        title: 'TechWagon Parking',
        sections: [
          {
            items: [
              {
                text: 'Find Parking Spots',
                detailText: 'Search for available parking',
                showsDisclosureIndicator: true,
                id: 'find-parking'
              },
              {
                text: 'My Bookings',
                detailText: 'View current reservations',
                showsDisclosureIndicator: true,
                id: 'bookings'
              },
              {
                text: 'Navigation',
                detailText: 'Navigate to parking spot',
                showsDisclosureIndicator: true,
                id: 'navigation'
              }
            ]
          }
        ]
      };

      // Set as root template with error handling
      if (typeof this.carPlayModule.setRootTemplate === 'function') {
        this.carPlayModule.setRootTemplate(listTemplate, false);
        console.log('✅ CarPlay parking interface ready');
        
        // Setup event listeners
        this.setupCarPlayListeners();
      } else {
        console.log('❌ setRootTemplate method not available');
      }

    } catch (error) {
      console.log('❌ Failed to setup CarPlay interface:', error.message);
    }
  }

  private setupCarPlayListeners() {
    if (!this.carPlayModule) return;

    // Listen for list item selections
    this.carPlayModule.registerListItemHandler('find-parking', () => {
      console.log('🔍 Find Parking selected in CarPlay');
      this.showParkingSearch();
    });

    this.carPlayModule.registerListItemHandler('bookings', () => {
      console.log('📋 Bookings selected in CarPlay');
      this.showProfile();
    });

    this.carPlayModule.registerListItemHandler('navigation', () => {
      console.log('🧭 Navigation selected in CarPlay');
      this.showNavigationMap();
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

  private showNavigationMap() {
    if (!this.carPlayModule) return;

    try {
      // Create Map Template for navigation
      const mapTemplate = {
        guidanceBackgroundColor: '#0286FF',
        tripEstimateStyle: 'light',
        automaticallyHidesNavigationBar: false,
        hidesButtonsWithNavigationBar: false,
        leadingNavigationBarButtons: [
          {
            id: 'back',
            type: 'text',
            title: 'Back'
          }
        ]
      };

      this.carPlayModule.pushTemplate(mapTemplate, true);
      console.log('🗺️ Navigation map displayed in CarPlay');
    } catch (error) {
      console.log('❌ Failed to show navigation map:', error);
    }
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