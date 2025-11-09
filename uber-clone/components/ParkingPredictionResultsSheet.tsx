import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, ScrollView } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { icons } from '@/constants';
import { getParkingPrediction, PredictionResult, convertToMLParkingArea } from '@/lib/ml-prediction';

interface ParkingSpot {
  id: number;
  ml_area: string;
  title: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  price_per_hour: number;
  total_spots: number;
  is_covered: boolean;
  has_security: boolean;
  rating: number;
  distance?: number;
}

interface MLPrediction {
  availability_percentage: number;
  confidence?: string;
  estimated_arrival_time: string;
  travel_info: {
    distance_km: number;
    travel_time_minutes: number;
  };
  conditions: {
    weather: string;
    temperature: number;
    traffic_density: number;
  };
}

interface ParkingPredictionResultsSheetProps {
  parkingSpots: ParkingSpot[];
  userLocation: {
    latitude: number;
    longitude: number;
  };
  isVisible: boolean;
  onClose: () => void;
  onParkingSpotSelect: (spot: ParkingSpot) => void;
}

const ParkingPredictionResultsSheet: React.FC<ParkingPredictionResultsSheetProps> = ({
  parkingSpots,
  userLocation,
  isVisible,
  onClose,
  onParkingSpotSelect
}) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [predictions, setPredictions] = useState<Map<string, PredictionResult>>(new Map());
  const [loadingPredictions, setLoadingPredictions] = useState<Set<string>>(new Set());

  // Define snap points - minimized (25%), half (60%), full (90%)
  const snapPoints = useMemo(() => ['25%', '60%', '90%'], []);

  // Render backdrop for the bottom sheet
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={0}
        appearsOnIndex={1}
        opacity={0.5}
      />
    ),
    []
  );

  const handleSheetChanges = useCallback((index: number) => {
    console.log('Prediction results sheet index changed to:', index);
    if (index === -1) {
      console.log('Results sheet closed, calling onClose callback');
      onClose();
    }
  }, [onClose]);

  // Load ML predictions for all parking spots
  useEffect(() => {
    if (isVisible && parkingSpots.length > 0) {
      loadPredictions();
      // Show the bottom sheet at middle position (index 1)
      setTimeout(() => {
        bottomSheetRef.current?.snapToIndex(1);
      }, 100);
    } else if (!isVisible) {
      // Hide the bottom sheet
      bottomSheetRef.current?.snapToIndex(-1);
    }
  }, [isVisible, parkingSpots]);

  const loadPredictions = async () => {
    for (const spot of parkingSpots) {
      // Skip ML API call if spot already has availability_percentage (from recommendations API)
      if ((spot as any).availability_percentage !== undefined) {
        console.log(`✅ Spot ${spot.title} already has ML prediction: ${(spot as any).availability_percentage}%`);
        continue;
      }

      const spotId = spot.id.toString();
      setLoadingPredictions(prev => new Set([...prev, spotId]));
      
      try {
        const mlArea = convertToMLParkingArea(spot.title);
        const predictionInput = {
          user_location: {
            lat: userLocation.latitude,
            lng: userLocation.longitude,
          },
          parking_area: mlArea,
          vehicle_type: 'car',
        };
        
        const prediction = await getParkingPrediction(predictionInput);
        setPredictions(prev => new Map([...prev, [spotId, prediction]]));
      } catch (error) {
        console.error(`Failed to load prediction for ${spot.id}:`, error);
      } finally {
        setLoadingPredictions(prev => {
          const newSet = new Set(prev);
          newSet.delete(spotId);
          return newSet;
        });
      }
    }
  };  const getAvailabilityColor = (percentage: number) => {
    if (percentage > 70) return '#34C759';
    if (percentage > 40) return '#FFD60A';
    return '#FF3B30';
  };

  const formatDistance = (spot: ParkingSpot) => {
    const spotId = spot.id.toString();
    const prediction = predictions.get(spotId);
    
    // Use travel_info from spot data if available (from ML recommendations API)
    // Otherwise use prediction from individual ML API call
    const travelInfo = (spot as any).travel_info || prediction?.travel_info;
    if (travelInfo?.distance_km) {
      return `${travelInfo.distance_km.toFixed(1)} km`;
    }
    return `${spot.distance?.toFixed(1) || '0.0'} km`;
  };

  const formatTravelTime = (spot: ParkingSpot) => {
    const spotId = spot.id.toString();
    const prediction = predictions.get(spotId);
    
    // Use walking_time_minutes or travel_info from spot data if available
    const walkingTime = (spot as any).walking_time_minutes;
    const travelInfo = (spot as any).travel_info || prediction?.travel_info;
    
    if (walkingTime) {
      return `${Math.round(walkingTime)} min walk`;
    }
    if (travelInfo?.travel_time_minutes) {
      return `${Math.round(travelInfo.travel_time_minutes)} min`;
    }
    return 'N/A';
  };

  const renderParkingSpotCard = (spot: ParkingSpot, index: number) => {
    const spotId = spot.id.toString();
    const prediction = predictions.get(spotId);
    const isLoading = loadingPredictions.has(spotId);
    
    // Use availability_percentage from spot data if available (from ML recommendations API)
    // Otherwise use prediction from individual ML API call
    const availabilityPercentage = (spot as any).availability_percentage || prediction?.availability_percentage || 0;
    
    console.log(`🎯 Rendering spot ${spot.title}:`, {
      spotData: (spot as any).availability_percentage,
      predictionData: prediction?.availability_percentage,
      finalPercentage: availabilityPercentage
    });
    
    return (
      <TouchableOpacity 
        key={spot.id} 
        style={styles.spotCard} 
        onPress={() => onParkingSpotSelect(spot)}
        activeOpacity={0.8}
      >
        <View style={styles.spotHeader}>
          <View style={styles.rankBadge}>
            <Text style={styles.rankText}>{index + 1}</Text>
          </View>
          <View style={styles.spotInfo}>
            <Text style={styles.spotTitle}>{spot.title}</Text>
            <Text style={styles.spotAddress}>{spot.address}</Text>
          </View>
          <View style={styles.predictionContainer}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#0FA7FF" />
            ) : availabilityPercentage > 0 ? (
              <View style={styles.predictionDisplay}>
                <Text style={[styles.predictionPercentage, { color: getAvailabilityColor(availabilityPercentage) }]}>
                  {Math.round(availabilityPercentage)}%
                </Text>
                <Text style={styles.predictionLabel}>Available</Text>
              </View>
            ) : (
              <Text style={styles.errorText}>--</Text>
            )}
          </View>
        </View>

        <View style={styles.spotDetails}>
          <View style={styles.detailItem}>
            <Image source={icons.pin} style={styles.detailIcon} />
            <Text style={styles.detailText}>{formatDistance(spot)}</Text>
          </View>
          <View style={styles.detailItem}>
            <Image source={icons.target} style={styles.detailIcon} />
            <Text style={styles.detailText}>{formatTravelTime(spot)}</Text>
          </View>
          <View style={styles.detailItem}>
            <Image source={icons.dollar} style={styles.detailIcon} />
            <Text style={styles.detailText}>₹{spot.price_per_hour}/hr</Text>
          </View>
          <View style={styles.detailItem}>
            <Image source={icons.star} style={styles.detailIcon} />
            <Text style={styles.detailText}>{spot.rating}</Text>
          </View>
        </View>

        <View style={styles.spotFeatures}>
          {spot.is_covered && (
            <View style={styles.featureBadge}>
              <Text style={styles.featureText}>🏠 Covered</Text>
            </View>
          )}
          {spot.has_security && (
            <View style={styles.featureBadge}>
              <Text style={styles.featureText}>🔒 Secure</Text>
            </View>
          )}
          <View style={styles.featureBadge}>
            <Text style={styles.featureText}>🅿️ {spot.total_spots} spots</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (!isVisible) return null;

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={styles.bottomSheetIndicator}
    >
      <BottomSheetView style={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Top Parking Predictions</Text>
          <Text style={styles.headerSubtitle}>Based on your search location</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Image source={icons.close} style={styles.closeIcon} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {parkingSpots.length > 0 ? (
            parkingSpots.map((spot, index) => renderParkingSpotCard(spot, index))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No parking spots found</Text>
              <Text style={styles.emptyStateSubtext}>Try searching for a different location</Text>
            </View>
          )}
        </ScrollView>
      </BottomSheetView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: '#161616',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  bottomSheetIndicator: {
    backgroundColor: '#404040',
    width: 50,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8e8e93',
    marginBottom: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 8,
  },
  closeIcon: {
    width: 20,
    height: 20,
    tintColor: '#8e8e93',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  spotCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  spotHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0FA7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  spotInfo: {
    flex: 1,
    marginRight: 12,
  },
  spotTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  spotAddress: {
    fontSize: 13,
    color: '#8e8e93',
    lineHeight: 18,
  },
  predictionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  predictionDisplay: {
    alignItems: 'center',
  },
  predictionPercentage: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  predictionLabel: {
    fontSize: 11,
    color: '#8e8e93',
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    color: '#8e8e93',
  },
  spotDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailIcon: {
    width: 14,
    height: 14,
    tintColor: '#8e8e93',
    marginRight: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#8e8e93',
    fontWeight: '500',
  },
  spotFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featureBadge: {
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#404040',
  },
  featureText: {
    fontSize: 11,
    color: '#8e8e93',
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#8e8e93',
    textAlign: 'center',
  },
});

export default ParkingPredictionResultsSheet;