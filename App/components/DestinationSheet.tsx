import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { icons } from '@/constants';
import GoogleTextInput from './GoogleTextInput';
import { ParkingMarkerData } from '@/types/type';
import { router } from 'expo-router';
import { getParkingPrediction, convertToMLParkingArea, PredictionResult } from '@/lib/ml-prediction';
import { useLocationStore } from '@/store';

interface DestinationSheetProps {
  onLocationSelect: (location: { latitude: number; longitude: number; address: string }) => void;
  selectedParkingSpot: ParkingMarkerData | null | undefined;
  onParkingSpotDeselect: () => void;
  userAddress?: string;
}

const DestinationSheet: React.FC<DestinationSheetProps> = ({ onLocationSelect, selectedParkingSpot, onParkingSpotDeselect, userAddress }) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [searchFocused, setSearchFocused] = useState(false);

  // ML Prediction state
  const [mlPrediction, setMlPrediction] = useState<PredictionResult | null>(null);
  const [isLoadingPrediction, setIsLoadingPrediction] = useState(false);
  const [showPredictionDetails, setShowPredictionDetails] = useState(false);

  // User location for predictions
  const { userLatitude, userLongitude } = useLocationStore();

  const snapPoints = useMemo(() => ['30%', '60%', '90%'], []);

  const renderBackdrop = useCallback((props: any) => (
    <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.3} />
  ), []);

  const handleLocationPress = (location: { latitude: number; longitude: number; address: string }) => {
    onLocationSelect(location);
    setSearchFocused(false);
    setTimeout(() => bottomSheetRef.current?.snapToIndex(0), 100);
  };

  const handleSearchFocus = () => {
    setSearchFocused(true);
    bottomSheetRef.current?.snapToIndex(2);
  };

  const handleSearchBlur = () => setSearchFocused(false);

  // Load ML prediction when parking spot is selected
  useEffect(() => {
    const loadMlPrediction = async () => {
      if (!selectedParkingSpot || userLatitude == null || userLongitude == null) {
        setMlPrediction(null);
        return;
      }

      setIsLoadingPrediction(true);
      setShowPredictionDetails(false);

      try {
        const mlAreaId = convertToMLParkingArea(selectedParkingSpot.title);
        const prediction = await getParkingPrediction({
          user_location: { lat: userLatitude, lng: userLongitude },
          parking_area: mlAreaId,
          vehicle_type: 'car',
        });

        setMlPrediction(prediction);
      } catch (err) {
        console.error('ML prediction error', err);
        setMlPrediction(null);
      } finally {
        setIsLoadingPrediction(false);
      }
    };

    loadMlPrediction();
  }, [selectedParkingSpot, userLatitude, userLongitude]);

  const handlePredictionClick = () => {
    if (mlPrediction) {
      setShowPredictionDetails(true);
      bottomSheetRef.current?.snapToIndex(2);
    }
  };

  const handleBackFromPrediction = () => {
    setShowPredictionDetails(false);
    bottomSheetRef.current?.snapToIndex(1);
  };

  useEffect(() => {
    if (selectedParkingSpot) bottomSheetRef.current?.snapToIndex(1);
  }, [selectedParkingSpot]);

  const getAvailabilityPercentage = (spot: ParkingMarkerData) => Math.round((spot.available_spots / Math.max(1, spot.total_spots)) * 100);

  const getAvailabilityInfo = (percentage: number) => {
    if (percentage >= 60) return { color: '#34C759', text: 'High', chance: 'Excellent' };
    if (percentage >= 30) return { color: '#FFD60A', text: 'Medium', chance: 'Good' };
    return { color: '#FF3B30', text: 'Low', chance: 'Limited' };
  };

  const handleBookParking = () => {
    if (!selectedParkingSpot) return;
    router.push({ pathname: '/(root)/choose-spot', params: { parkingName: selectedParkingSpot.title, parkingId: String(selectedParkingSpot.id) } });
  };

  return (
    <BottomSheet ref={bottomSheetRef} index={0} snapPoints={snapPoints} backgroundStyle={styles.bottomSheetBackground} handleIndicatorStyle={styles.handleIndicator} enablePanDownToClose={false} backdropComponent={renderBackdrop}>
      <BottomSheetScrollView style={styles.contentContainer}>
        {selectedParkingSpot ? (
          showPredictionDetails && mlPrediction ? (
            // Prediction details view
            <>
              <View style={styles.header}>
                <TouchableOpacity onPress={handleBackFromPrediction} style={styles.backButton}><Image source={icons.backArrow} style={styles.backArrowIcon} /></TouchableOpacity>
                <Text style={styles.title}>Parking Prediction</Text>
              </View>

              <View style={styles.predictionCard}>
                <View style={styles.predictionHeader}>
                  <View style={styles.predictionTitleSection}>
                    <Text style={styles.predictionTitle}>{selectedParkingSpot.title}</Text>
                    <Text style={styles.predictionSubtitle}>Smart Parking Prediction</Text>
                  </View>
                  <View style={styles.predictionPercentageContainer}>
                    <Text style={[styles.predictionPercentageLarge, { color: mlPrediction.availability_percentage > 50 ? '#34C759' : mlPrediction.availability_percentage > 30 ? '#FFD60A' : '#FF3B30' }]}>{Math.round(mlPrediction.availability_percentage)}%</Text>
                    <Text style={styles.predictionConfidence}>Availability Chance</Text>
                  </View>
                </View>

                <View style={styles.predictionBody}>
                  <View style={styles.infoCard}>
                    <View style={styles.infoCardHeader}>
                      <Text style={styles.infoCardIcon}>🚗</Text>
                      <Text style={styles.infoSectionTitle}>Travel Information</Text>
                    </View>
                    <View style={styles.infoGrid}>
                      <View style={styles.infoGridItem}>
                        <Text style={styles.infoLabel}>Distance</Text>
                        <Text style={styles.infoValue}>{mlPrediction.travel_info.distance_km.toFixed(1)} km</Text>
                      </View>
                      <View style={styles.infoGridItem}>
                        <Text style={styles.infoLabel}>Travel Time</Text>
                        <Text style={styles.infoValue}>{Math.round(mlPrediction.travel_info.travel_time_minutes)} min</Text>
                      </View>
                      <View style={styles.infoGridItemFull}>
                        <Text style={styles.infoLabel}>Estimated Arrival</Text>
                        <Text style={styles.infoValue}>{new Date(mlPrediction.estimated_arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.infoCard}>
                    <View style={styles.infoCardHeader}>
                      <Text style={styles.infoCardIcon}>🌤️</Text>
                      <Text style={styles.infoSectionTitle}>Current Conditions</Text>
                    </View>
                    <View style={styles.infoGrid}>
                      <View style={styles.infoGridItem}>
                        <Text style={styles.infoLabel}>Weather</Text>
                        <Text style={styles.infoValue}>{mlPrediction.conditions.weather}</Text>
                      </View>
                      <View style={styles.infoGridItem}>
                        <Text style={styles.infoLabel}>Temperature</Text>
                        <Text style={styles.infoValue}>{Math.round(mlPrediction.conditions.temperature)}°C</Text>
                      </View>
                      <View style={styles.infoGridItemFull}>
                        <Text style={styles.infoLabel}>Traffic</Text>
                        <Text style={styles.infoValue}>{mlPrediction.conditions.traffic_density < 0.3 ? 'Light' : mlPrediction.conditions.traffic_density < 0.7 ? 'Moderate' : 'Heavy'}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.infoCard}>
                    <View style={styles.infoCardHeader}>
                      <Text style={styles.infoCardIcon}>💡</Text>
                      <Text style={styles.infoSectionTitle}>Smart Insights</Text>
                    </View>
                    <View style={styles.insightContainer}>
                      {mlPrediction.availability_percentage > 70 && (
                        <View style={styles.insightItem}>
                          <Text style={styles.insightIcon}>✅</Text>
                          <Text style={styles.insightText}>Excellent timing! High chance of finding a spot when you arrive.</Text>
                        </View>
                      )}
                      {mlPrediction.availability_percentage >= 40 && mlPrediction.availability_percentage <= 70 && (
                        <View style={styles.insightItem}>
                          <Text style={styles.insightIcon}>⚠️</Text>
                          <Text style={styles.insightText}>Moderate availability. Consider arriving a few minutes earlier for better chances.</Text>
                        </View>
                      )}
                      {mlPrediction.availability_percentage < 40 && (
                        <View style={styles.insightItem}>
                          <Text style={styles.insightIcon}>🚨</Text>
                          <Text style={styles.insightText}>Limited availability expected. Consider alternative parking locations.</Text>
                        </View>
                      )}
                      {mlPrediction.conditions.weather === 'Rainy' && (
                        <View style={styles.insightItem}>
                          <Text style={styles.insightIcon}>🌧️</Text>
                          <Text style={styles.insightText}>Rainy weather may increase demand for covered parking spots.</Text>
                        </View>
                      )}
                      {mlPrediction.conditions.traffic_density > 0.7 && (
                        <View style={styles.insightItem}>
                          <Text style={styles.insightIcon}>🚦</Text>
                          <Text style={styles.insightText}>Heavy traffic detected. Travel time may be longer than estimated.</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              </View>

              <TouchableOpacity style={styles.bookButton} onPress={handleBookParking}><Text style={styles.bookButtonText}>Book This Spot</Text></TouchableOpacity>
            </>
          ) : (
            // Regular parking details view
            <>
              <View style={styles.header}>
                <TouchableOpacity onPress={onParkingSpotDeselect} style={styles.backButton}><Image source={icons.backArrow} style={styles.backArrowIcon} /></TouchableOpacity>
                <Text style={styles.title}>Parking Details</Text>
              </View>

              <View style={styles.parkingCard}>
                <View style={styles.parkingHeader}>
                  <Text style={styles.parkingTitle}>{selectedParkingSpot.title}</Text>
                  <View style={styles.ratingContainer}><Image source={icons.star} style={styles.starIcon} /><Text style={styles.ratingText}>{selectedParkingSpot.rating.toFixed(1)}</Text></View>
                </View>

                <Text style={styles.parkingAddress}>{selectedParkingSpot.address}</Text>

                <View style={styles.availabilitySection}>
                  <View style={styles.availabilityRow}>
                    <View style={[styles.availabilityBadge, { backgroundColor: getAvailabilityInfo(getAvailabilityPercentage(selectedParkingSpot)).color + '20' }]}>
                      <View style={[styles.availabilityDot, { backgroundColor: getAvailabilityInfo(getAvailabilityPercentage(selectedParkingSpot)).color }]} />
                      <Text style={[styles.availabilityText, { color: getAvailabilityInfo(getAvailabilityPercentage(selectedParkingSpot)).color }]}>{getAvailabilityInfo(getAvailabilityPercentage(selectedParkingSpot)).text} Availability</Text>
                    </View>
                  </View>

                  <View style={styles.spotsInfoContainer}>
                    <View style={styles.spotsInfo}><Text style={styles.spotsLabel}>Available Spots</Text><Text style={styles.spotsValue}>{selectedParkingSpot.available_spots} / {selectedParkingSpot.total_spots}</Text></View>
                    <View style={styles.spotsDivider} />

                    <TouchableOpacity style={styles.spotsInfo} onPress={handlePredictionClick} disabled={!mlPrediction || isLoadingPrediction}>
                      <Text style={styles.spotsLabel}>Chance of Spot</Text>
                      {isLoadingPrediction ? (
                        <View style={styles.loadingContainer}><ActivityIndicator size="small" color="#0286FF" /><Text style={styles.spotsValue}>Loading...</Text></View>
                      ) : mlPrediction ? (
                        <Text style={[styles.spotsValue, { color: mlPrediction.availability_percentage > 50 ? '#34C759' : mlPrediction.availability_percentage > 30 ? '#FFD60A' : '#FF3B30' }]}>{Math.round(mlPrediction.availability_percentage)}%</Text>
                      ) : (
                        <Text style={[styles.spotsValue, { color: getAvailabilityInfo(getAvailabilityPercentage(selectedParkingSpot)).color }]}>{getAvailabilityInfo(getAvailabilityPercentage(selectedParkingSpot)).chance}</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.featuresContainer}>
                  <View style={styles.featureItem}><Text style={styles.featureIcon}>💰</Text><Text style={styles.featureText}>₹{selectedParkingSpot.price_per_hour}/hr</Text></View>
                  {selectedParkingSpot.is_covered === true && (<View style={styles.featureItem}><Text style={styles.featureIcon}>🏠</Text><Text style={styles.featureText}>Covered</Text></View>)}
                  {selectedParkingSpot.has_security === true && (<View style={styles.featureItem}><Text style={styles.featureIcon}>🔒</Text><Text style={styles.featureText}>Security</Text></View>)}
                  {selectedParkingSpot.distance !== undefined && selectedParkingSpot.distance !== null && (<View style={styles.featureItem}><Text style={styles.featureIcon}>📍</Text><Text style={styles.featureText}>{selectedParkingSpot.distance.toFixed(1)} km</Text></View>)}
                </View>
              </View>

              <TouchableOpacity style={styles.bookButton} onPress={handleBookParking}><Text style={styles.bookButtonText}>Book Parking</Text></TouchableOpacity>
            </>
          )
        ) : (
          // Search interface
          <>
            <View style={styles.header}><Text style={styles.title}>Find Parking</Text></View>

            <View style={styles.optionsRow}>
              <TouchableOpacity style={styles.optionButton}><Image source={icons.to} style={styles.optionIcon} /><Text style={styles.optionText}>Park now</Text><Image source={icons.arrowDown} style={styles.arrowIcon} /></TouchableOpacity>
              <TouchableOpacity style={styles.optionButton}><Image source={icons.to} style={styles.optionIcon} /><Text style={styles.optionText}>2 hours</Text><Image source={icons.arrowDown} style={styles.arrowIcon} /></TouchableOpacity>
            </View>

            <View style={styles.locationContainer}><GoogleTextInput icon={icons.search} initialLocation="" containerStyle="mb-0" textInputBackgroundColor="#2c2c2c" handlePress={handleLocationPress} onFocus={handleSearchFocus} onBlur={handleSearchBlur} /></View>

            <Text style={styles.sectionTitle}>Suggestions</Text>

            <TouchableOpacity style={styles.suggestionItem} onPress={() => handleLocationPress({ latitude: 18.5204, longitude: 73.8567, address: 'Pune, Maharashtra' })}>
              <View style={styles.suggestionIconContainer}><Image source={icons.target} style={styles.suggestionIcon} /></View>
              <View style={styles.suggestionTextContainer}><Text style={styles.suggestionTitle}>Current Location</Text><Text style={styles.suggestionSubtitle}>{userAddress || 'Pune, Maharashtra'}</Text></View>
            </TouchableOpacity>
          </>
        )}
      </BottomSheetScrollView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  bottomSheetBackground: { backgroundColor: '#161616', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  handleIndicator: { backgroundColor: '#3c3c3c', width: 40, height: 4 },
  contentContainer: { flex: 1, paddingHorizontal: 20 },
  header: { marginBottom: 20, flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '600', color: '#FFFFFF' },
  optionsRow: { flexDirection: 'row', marginBottom: 24 },
  optionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#2c2c2c', paddingHorizontal: 14, paddingVertical: 12, borderRadius: 8, marginRight: 8 },
  optionIcon: { width: 16, height: 16, tintColor: '#FFFFFF', marginRight: 8 },
  optionText: { flex: 1, color: '#FFFFFF', fontSize: 14, fontWeight: '500' },
  arrowIcon: { width: 12, height: 12, tintColor: '#8e8e93' },
  locationContainer: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#FFFFFF', marginBottom: 12 },
  suggestionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#2c2c2c' },
  suggestionIconContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#161616', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  suggestionIcon: { width: 20, height: 20, tintColor: '#FFFFFF' },
  suggestionTextContainer: { flex: 1 },
  suggestionTitle: { fontSize: 16, fontWeight: '500', color: '#FFFFFF', marginBottom: 4 },
  suggestionSubtitle: { fontSize: 14, color: '#8e8e93' },
  backButton: { marginRight: 12 },
  backArrowIcon: { width: 20, height: 20, tintColor: '#FFFFFF' },
  parkingCard: { backgroundColor: '#292929', borderRadius: 12, padding: 16, marginBottom: 16 },
  parkingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  parkingTitle: { fontSize: 20, fontWeight: '700', color: '#FFFFFF', flex: 1 },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2c2c2c', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  starIcon: { width: 14, height: 14, tintColor: '#FFD60A', marginRight: 4 },
  ratingText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  parkingAddress: { fontSize: 14, color: '#8e8e93', marginBottom: 16 },
  availabilitySection: { marginBottom: 16 },
  availabilityRow: { marginBottom: 12 },
  availabilityBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  availabilityDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  availabilityText: { fontSize: 14, fontWeight: '600' },
  spotsInfoContainer: { flexDirection: 'row', backgroundColor: '#2c2c2c', borderRadius: 8, padding: 16 },
  spotsInfo: { flex: 1, alignItems: 'center' },
  spotsDivider: { width: 1, backgroundColor: '#3c3c3c', marginHorizontal: 16 },
  spotsLabel: { fontSize: 12, color: '#8e8e93', marginBottom: 6 },
  spotsValue: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  featuresContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  featureItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2c2c2c', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginRight: 8, marginTop: 8 },
  featureIcon: { fontSize: 16, marginRight: 6 },
  featureText: { fontSize: 14, color: '#FFFFFF', fontWeight: '500' },
  bookButton: { backgroundColor: '#292929', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 8, marginBottom: 20 },
  bookButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  loadingContainer: { flexDirection: 'row', alignItems: 'center' },
  predictionContainer: { flexDirection: 'row', alignItems: 'center' },
  mlBadge: { fontSize: 12, color: '#8e8e93' },
  predictionCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginVertical: 8,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333333',
  },
  predictionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  predictionTitleSection: {
    flex: 1,
    marginRight: 16,
  },
  predictionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  predictionSubtitle: {
    fontSize: 14,
    color: '#8e8e93',
    fontWeight: '500',
  },
  predictionPercentageContainer: {
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#404040',
  },
  predictionPercentageLarge: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 2,
  },
  predictionConfidence: {
    fontSize: 12,
    color: '#8e8e93',
    fontWeight: '600',
  },
  predictionBody: {
    gap: 16,
  },
  infoCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#404040',
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoCardIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  infoSection: { marginTop: 12 },
  infoSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  infoGridItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#404040',
  },
  infoGridItemFull: {
    flex: 1,
    width: '100%',
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#404040',
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  infoLabel: {
    fontSize: 12,
    color: '#8e8e93',
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  insightContainer: {
    gap: 12,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#404040',
  },
  insightIcon: {
    fontSize: 16,
    marginRight: 10,
    marginTop: 2,
  },
  insightText: {
    fontSize: 14,
    color: '#ffffff',
    lineHeight: 20,
    flex: 1,
    fontWeight: '500',
  },
});

export default DestinationSheet;
