import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export const CarPlayDebug = () => {
  const [carPlayStatus, setCarPlayStatus] = React.useState({
    isAvailable: false,
    isConnected: false,
    isActive: false
  });

  React.useEffect(() => {
    // Check CarPlay status safely
    const checkCarPlay = async () => {
      try {
        const { carPlayManager } = await import('@/carplay/CarPlayManager');
        setCarPlayStatus({
          isAvailable: carPlayManager.isAvailable,
          isConnected: carPlayManager.isConnected,
          isActive: carPlayManager.isConnected && carPlayManager.isAvailable
        });
      } catch (error) {
        console.log('CarPlay check failed:', error.message);
      }
    };
    
    checkCarPlay();
  }, []);

  const { isAvailable, isConnected, isActive } = carPlayStatus;

  const testCarPlay = async () => {
    try {
      console.log('🚗 Testing CarPlay connection...');
      
      // Import CarPlay manager safely
      const { carPlayManager } = await import('@/carplay/CarPlayManager');
      
      if (carPlayManager && carPlayManager.isAvailable) {
        await carPlayManager.initialize();
        console.log('✅ CarPlay test completed');
      } else {
        console.log('ℹ️ CarPlay not available for testing');
      }
    } catch (error) {
      console.log('❌ CarPlay test failed:', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CarPlay Debug</Text>
      <Text style={styles.status}>Available: {isAvailable ? '✅' : '❌'}</Text>
      <Text style={styles.status}>Connected: {isConnected ? '✅' : '❌'}</Text>
      <Text style={styles.status}>Active: {isActive ? '✅' : '❌'}</Text>
      
      {isAvailable && (
        <TouchableOpacity style={styles.button} onPress={testCarPlay}>
          <Text style={styles.buttonText}>Test CarPlay</Text>
        </TouchableOpacity>
      )}
      
      <Text style={styles.instructions}>
        To test CarPlay:{'\n'}
        1. Open iOS Simulator{'\n'}
        2. Device → External Displays → CarPlay{'\n'}
        3. Look for app icon in CarPlay dashboard
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f0f0f0',
    margin: 10,
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  status: {
    fontSize: 14,
    marginBottom: 5,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  instructions: {
    fontSize: 12,
    marginTop: 10,
    color: '#666',
  },
});