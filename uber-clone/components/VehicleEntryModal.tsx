import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';

const { width, height } = Dimensions.get('window');

interface VehicleEntryModalProps {
  visible: boolean;
  onClose: () => void;
}

const VehicleEntryModal: React.FC<VehicleEntryModalProps> = ({ visible, onClose }) => {
  const [licensePlate, setLicensePlate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { tempSignupData, token } = useAuth();

  const handleSubmit = async () => {
    if (!licensePlate.trim()) {
      Alert.alert('Error', 'Please enter a license plate number');
      return;
    }

    // Get the correct token and user data
    const authToken = tempSignupData?.token || token;
    const userId = tempSignupData?.user?.id;

    if (!userId && !authToken) {
      Alert.alert('Error', 'User not found');
      return;
    }

    try {
      setIsLoading(true);
      
      console.log('🚗 Vehicle registration - using token:', authToken ? 'Yes' : 'No');
      console.log('🚗 Vehicle registration - userId:', userId);
      
      const response = await fetch('http://localhost:3000/api/vehicle/quick-register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken ? `Bearer ${authToken}` : '',
        },
        body: JSON.stringify({
          licensePlate: licensePlate.trim(),
          ownerName: tempSignupData?.user?.name || 'Unknown',
        }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Vehicle registered successfully!', [
          { text: 'OK', onPress: onClose }
        ]);
        setLicensePlate('');
      } else {
        const error = await response.json();
        Alert.alert('Error', error.error || 'Failed to register vehicle');
      }
    } catch (error) {
      console.error('Vehicle registration error:', error);
      Alert.alert('Error', 'Failed to register vehicle');
    } finally {
      setIsLoading(false);
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.backdrop}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.modal}>
          <Text style={styles.title}>Enter Vehicle Details</Text>
          <Text style={styles.subtitle}>Please enter your vehicle's license plate number</Text>
          
          <TextInput
            style={styles.input}
            placeholder="License Plate (e.g., ABC1234)"
            value={licensePlate}
            onChangeText={setLicensePlate}
            autoCapitalize="characters"
            maxLength={10}
          />
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={onClose}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Skip for Now</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.submitButton} 
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Register Vehicle</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: width,
    height: height,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    margin: 20,
    minWidth: width * 0.8,
    maxWidth: width * 0.9,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default VehicleEntryModal;