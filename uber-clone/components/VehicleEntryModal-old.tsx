/// <reference types="nativewind/types" />
import React, { useState } from 'react';
import { View, Text, Alert, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import InputField from './InputField';
import CustomButton from './CustomButton';

interface VehicleEntryModalProps {
  visible: boolean;
  onClose: () => void;
}

const VehicleEntryModal: React.FC<VehicleEntryModalProps> = ({ visible, onClose }) => {
  const [licensePlate, setLicensePlate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, token, tempSignupData, completeSignupFlow } = useAuth();
  const router = useRouter();

  // Use tempSignupData if available (during signup flow), otherwise use regular user/token
  const currentUser = tempSignupData?.user || user;
  const currentToken = tempSignupData?.token || token;

  // Debug logging
  console.log('🚗 VehicleEntryModal - visible:', visible, 'currentUser:', !!currentUser, 'currentToken:', !!currentToken);

  if (visible) {
    console.log('🚗 VehicleEntryModal should be visible now!');
  }

  // TEST: Simple full-screen red overlay to see if Modal works at all
  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={true}
      transparent={false}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={{
        flex: 1,
        backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Text style={{
          fontSize: 24,
          color: 'white',
          fontWeight: 'bold',
          marginBottom: 20
        }}>
          TEST MODAL IS WORKING!
        </Text>
        <TouchableOpacity
          onPress={onClose}
          style={{
            backgroundColor: 'white',
            padding: 15,
            borderRadius: 8
          }}
        >
          <Text style={{ color: 'red', fontWeight: 'bold' }}>
            Close Test Modal
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
    minHeight: 300,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#000',
  },
  subtitle: {
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    fontSize: 16,
  },
  skipButton: {
    paddingVertical: 12,
  },
  skipText: {
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default VehicleEntryModal;