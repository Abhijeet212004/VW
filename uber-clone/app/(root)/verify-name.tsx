import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApi } from '@/lib/api';

export default function VerifyName() {
  const params = useLocalSearchParams();
  const { vehicleId, registrationNumber, make, model } = params;
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const api = useApi();

  const handleVerify = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter the vehicle owner name');
      return;
    }

    setLoading(true);

    try {
      const result = await api.vehicle.verifyName(vehicleId as string, name);

      if (result.data.verificationStatus === 'AUTO_VERIFIED') {
        Alert.alert(
          '✅ Verified!',
          `Your vehicle has been successfully verified.\n\nMatch Score: ${result.data.matchScore.toFixed(1)}%`,
          [
            {
              text: 'Continue',
              onPress: () => router.replace('/(root)/(tabs)/home'),
            },
          ]
        );
      } else if (result.data.verificationStatus === 'MANUAL_REVIEW') {
        Alert.alert(
          '⏳ Under Review',
          `Your vehicle verification is pending manual review.\n\nMatch Score: ${result.data.matchScore.toFixed(1)}%\n\nWe'll notify you once approved.`,
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(root)/(tabs)/home'),
            },
          ]
        );
      } else {
        Alert.alert(
          '❌ Verification Failed',
          `Name doesn't match our records.\n\nMatch Score: ${result.data.matchScore.toFixed(1)}%\n\nPlease try again or contact support.`,
          [
            {
              text: 'Try Again',
              onPress: () => setName(''),
            },
            {
              text: 'Cancel',
              onPress: () => router.back(),
              style: 'cancel',
            },
          ]
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Verify Vehicle Owner</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.vehicleCard}>
          <Ionicons name="car-sport" size={48} color="#4CAF50" />
          <Text style={styles.vehicleNumber}>{registrationNumber}</Text>
          <Text style={styles.vehicleDetails}>
            {make} {model}
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Ionicons name="shield-checkmark" size={24} color="#4CAF50" />
          <Text style={styles.infoText}>
            For security purposes, please enter the vehicle owner's name as it appears on
            the registration certificate.
          </Text>
        </View>

        <View style={styles.warningCard}>
          <Ionicons name="warning" size={20} color="#FF9800" />
          <Text style={styles.warningText}>
            Do not copy-paste. Type the name manually to prevent fraud.
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Owner Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter owner's full name"
            placeholderTextColor="#666"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoCorrect={false}
            editable={!loading}
          />
          <Text style={styles.hint}>
            Enter the name exactly as shown on the RC (Registration Certificate)
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleVerify}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.buttonText}>Verify Name</Text>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Name verification helps prevent vehicle theft and fraud
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#161616',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#161616',
  },
  backButton: {
    marginRight: 15,
  },
  headerText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  content: {
    padding: 20,
  },
  vehicleCard: {
    backgroundColor: '#292929',
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  vehicleNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 15,
    letterSpacing: 2,
  },
  vehicleDetails: {
    fontSize: 16,
    color: '#999',
    marginTop: 5,
  },
  infoCard: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
  warningCard: {
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 152, 0, 0.3)',
  },
  warningText: {
    flex: 1,
    marginLeft: 12,
    color: '#FF9800',
    fontSize: 13,
    fontWeight: '600',
  },
  form: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#292929',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    borderWidth: 2,
    borderColor: '#292929',
  },
  hint: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 18,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  footerText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
    lineHeight: 18,
  },
});
