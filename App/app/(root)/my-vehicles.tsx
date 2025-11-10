import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApi } from '@/lib/api';

interface Vehicle {
  id: string;
  registrationNumber: string;
  make?: string;
  model?: string;
  color?: string;
  verificationStatus: string;
  verificationScore?: number;
  isActive: boolean;
  createdAt: string;
}

export default function MyVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const api = useApi();

  const loadVehicles = async () => {
    try {
      const result = await api.vehicle.getMyVehicles();
      setVehicles(result.data.vehicles);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load vehicles');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadVehicles();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AUTO_VERIFIED':
      case 'VERIFIED':
        return '#4CAF50';
      case 'PENDING':
        return '#FF9800';
      case 'MANUAL_REVIEW':
        return '#2196F3';
      case 'REJECTED':
        return '#F44336';
      default:
        return '#999';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'AUTO_VERIFIED':
      case 'VERIFIED':
        return 'checkmark-circle';
      case 'PENDING':
        return 'time';
      case 'MANUAL_REVIEW':
        return 'hourglass';
      case 'REJECTED':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  const renderVehicle = ({ item }: { item: Vehicle }) => (
    <TouchableOpacity
      style={styles.vehicleCard}
      onPress={() => router.push(`/(root)/vehicle/${item.id}`)}
    >
      <View style={styles.vehicleHeader}>
        <View style={styles.vehicleIcon}>
          <Ionicons name="car-sport" size={32} color="#4CAF50" />
        </View>
        <View style={styles.vehicleInfo}>
          <Text style={styles.vehicleNumber}>{item.registrationNumber}</Text>
          <Text style={styles.vehicleModel}>
            {item.make} {item.model}
          </Text>
        </View>
      </View>

      <View style={styles.statusRow}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.verificationStatus) + '20' }]}>
          <Ionicons
            name={getStatusIcon(item.verificationStatus) as any}
            size={16}
            color={getStatusColor(item.verificationStatus)}
          />
          <Text style={[styles.statusText, { color: getStatusColor(item.verificationStatus) }]}>
            {item.verificationStatus.replace('_', ' ')}
          </Text>
        </View>

        {item.verificationScore && (
          <Text style={styles.scoreText}>
            {item.verificationScore.toFixed(0)}% match
          </Text>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.dateText}>
          Added {new Date(item.createdAt).toLocaleDateString()}
        </Text>
        <Ionicons name="chevron-forward" size={20} color="#666" />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading vehicles...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>My Vehicles</Text>
        <TouchableOpacity onPress={() => router.push('/(root)/scan-qr')} style={styles.addButton}>
          <Ionicons name="add-circle" size={28} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={vehicles}
        renderItem={renderVehicle}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4CAF50" />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="car" size={64} color="#666" />
            <Text style={styles.emptyText}>No vehicles added yet</Text>
            <TouchableOpacity
              style={styles.addVehicleButton}
              onPress={() => router.push('/(root)/scan-qr')}
            >
              <Text style={styles.addVehicleText}>Add Vehicle</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#161616',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#161616',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    width: 40,
  },
  headerText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  addButton: {
    width: 40,
    alignItems: 'flex-end',
  },
  list: {
    padding: 20,
  },
  vehicleCard: {
    backgroundColor: '#292929',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
  },
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  vehicleIcon: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
  },
  vehicleModel: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
    textTransform: 'capitalize',
  },
  scoreText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  dateText: {
    fontSize: 12,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 20,
    marginBottom: 30,
  },
  addVehicleButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  addVehicleText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    color: '#fff',
    marginTop: 15,
    fontSize: 16,
  },
});
