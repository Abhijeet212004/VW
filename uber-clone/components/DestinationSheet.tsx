import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { icons } from '@/constants';
import GoogleTextInput from './GoogleTextInput';
import { ParkingMarkerData } from '@/types/type';
import { router } from 'expo-router';

interface DestinationSheetProps {
  onLocationSelect: (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => void;
  selectedParkingSpot: ParkingMarkerData | null | undefined;
  onParkingSpotDeselect: () => void;
  userAddress?: string;
}

const DestinationSheet: React.FC<DestinationSheetProps> = ({ 
  onLocationSelect, 
  selectedParkingSpot,
  onParkingSpotDeselect,
  userAddress 
}) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [searchFocused, setSearchFocused] = useState(false);

  // Define snap points - collapsed (25%), half (50%), full (90%)
  const snapPoints = useMemo(() => ['30%', '60%', '90%'], []);

  // Render backdrop for the bottom sheet
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.3}
      />
    ),
    []
  );

  const handleLocationPress = (location: { latitude: number; longitude: number; address: string }) => {
    onLocationSelect(location);
    setSearchFocused(false);
    // Snap to smallest position after selection to show the map
    setTimeout(() => {
      bottomSheetRef.current?.snapToIndex(0);
    }, 100);
  };

  // Handle search box focus - expand to full screen
  const handleSearchFocus = () => {
    setSearchFocused(true);
    bottomSheetRef.current?.snapToIndex(2); // Expand to 90%
  };

  // Handle search box blur - we don't need to collapse here as handleLocationPress will do it
  const handleSearchBlur = () => {
    // User might be selecting from dropdown, so we don't collapse immediately
    // handleLocationPress will handle the collapse after selection
  };

  // Expand sheet when a parking spot is selected
  useEffect(() => {
    if (selectedParkingSpot) {
      console.log('Selected parking spot:', JSON.stringify(selectedParkingSpot, null, 2));
      bottomSheetRef.current?.snapToIndex(1); // Expand to 60%
    }
  }, [selectedParkingSpot]);

  // Function to calculate availability percentage
  const getAvailabilityPercentage = (spot: ParkingMarkerData) => {
    return Math.round((spot.available_spots / spot.total_spots) * 100);
  };

  // Function to get availability color and text
  const getAvailabilityInfo = (percentage: number) => {
    if (percentage >= 60) {
      return { color: '#34C759', text: 'High', chance: 'Excellent' };
    } else if (percentage >= 30) {
      return { color: '#FFD60A', text: 'Medium', chance: 'Good' };
    } else {
      return { color: '#FF3B30', text: 'Low', chance: 'Limited' };
    }
  };

  const handleBookParking = () => {
    if (selectedParkingSpot) {
      // Navigate to spot selection screen
      router.push({
        pathname: '/(root)/choose-spot',
        params: {
          parkingName: selectedParkingSpot.title,
          parkingId: selectedParkingSpot.id.toString(),
        }
      });
    }
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
      enablePanDownToClose={false}
    >
      <BottomSheetScrollView style={styles.contentContainer}>
        {selectedParkingSpot ? (
          // Show Parking Spot Details
          <>
            {/* Header with back button */}
            <View style={styles.header}>
              <TouchableOpacity onPress={onParkingSpotDeselect} style={styles.backButton}>
                <Image source={icons.backArrow} style={styles.backArrowIcon} />
              </TouchableOpacity>
              <Text style={styles.title}>Parking Details</Text>
            </View>

            {/* Parking Spot Info */}
            <View style={styles.parkingCard}>
              <View style={styles.parkingHeader}>
                <Text style={styles.parkingTitle}>{selectedParkingSpot.title}</Text>
                <View style={styles.ratingContainer}>
                  <Image source={icons.star} style={styles.starIcon} />
                  <Text style={styles.ratingText}>{selectedParkingSpot.rating.toFixed(1)}</Text>
                </View>
              </View>
              
              <Text style={styles.parkingAddress}>{selectedParkingSpot.address}</Text>
              
              {/* Availability Status */}
              <View style={styles.availabilitySection}>
                <View style={styles.availabilityRow}>
                  <View style={[
                    styles.availabilityBadge,
                    { backgroundColor: getAvailabilityInfo(getAvailabilityPercentage(selectedParkingSpot)).color + '20' }
                  ]}>
                    <View style={[
                      styles.availabilityDot,
                      { backgroundColor: getAvailabilityInfo(getAvailabilityPercentage(selectedParkingSpot)).color }
                    ]} />
                    <Text style={[
                      styles.availabilityText,
                      { color: getAvailabilityInfo(getAvailabilityPercentage(selectedParkingSpot)).color }
                    ]}>
                      {getAvailabilityInfo(getAvailabilityPercentage(selectedParkingSpot)).text} Availability
                    </Text>
                  </View>
                </View>

                <View style={styles.spotsInfoContainer}>
                  <View style={styles.spotsInfo}>
                    <Text style={styles.spotsLabel}>Available Spots</Text>
                    <Text style={styles.spotsValue}>
                      {selectedParkingSpot.available_spots} / {selectedParkingSpot.total_spots}
                    </Text>
                  </View>
                  
                  <View style={styles.spotsDivider} />
                  
                  <View style={styles.spotsInfo}>
                    <Text style={styles.spotsLabel}>Chance of Spot</Text>
                    <Text style={[
                      styles.spotsValue,
                      { color: getAvailabilityInfo(getAvailabilityPercentage(selectedParkingSpot)).color }
                    ]}>
                      {getAvailabilityInfo(getAvailabilityPercentage(selectedParkingSpot)).chance}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Features */}
              <View style={styles.featuresContainer}>
                <View style={styles.featureItem}>
                  <Text style={styles.featureIcon}>💰</Text>
                  <Text style={styles.featureText}>₹{selectedParkingSpot.price_per_hour}/hr</Text>
                </View>
                {selectedParkingSpot.is_covered === true && (
                  <View style={styles.featureItem}>
                    <Text style={styles.featureIcon}>🏠</Text>
                    <Text style={styles.featureText}>Covered</Text>
                  </View>
                )}
                {selectedParkingSpot.has_security === true && (
                  <View style={styles.featureItem}>
                    <Text style={styles.featureIcon}>🔒</Text>
                    <Text style={styles.featureText}>Security</Text>
                  </View>
                )}
                {selectedParkingSpot.distance !== undefined && selectedParkingSpot.distance !== null && (
                  <View style={styles.featureItem}>
                    <Text style={styles.featureIcon}>📍</Text>
                    <Text style={styles.featureText}>{selectedParkingSpot.distance.toFixed(1)} km</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Book Parking Button */}
            <TouchableOpacity style={styles.bookButton} onPress={handleBookParking}>
              <Text style={styles.bookButtonText}>Book Parking</Text>
            </TouchableOpacity>
          </>
        ) : (
          // Show Search Interface
          <>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Find Parking</Text>
            </View>

            {/* Duration and Vehicle Type options */}
            <View style={styles.optionsRow}>
              <TouchableOpacity style={styles.optionButton}>
                <Image source={icons.to} style={styles.optionIcon} />
                <Text style={styles.optionText}>Park now</Text>
                <Image source={icons.arrowDown} style={styles.arrowIcon} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.optionButton}>
                <Image source={icons.to} style={styles.optionIcon} />
                <Text style={styles.optionText}>2 hours</Text>
                <Image source={icons.arrowDown} style={styles.arrowIcon} />
              </TouchableOpacity>
            </View>

        {/* Location Input with Google Places Autocomplete */}
        <View style={styles.locationContainer}>
          <GoogleTextInput
            icon={icons.search}
            initialLocation=""
            containerStyle="mb-0"
            textInputBackgroundColor="#2c2c2c"
            handlePress={handleLocationPress}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
          />
        </View>

        {/* Section Title */}
        <Text style={styles.sectionTitle}>Suggestions</Text>

        {/* Recent/Suggested Locations - These can be made dynamic based on user history */}
        <TouchableOpacity 
          style={styles.suggestionItem}
          onPress={() => handleLocationPress({
            latitude: 18.5204,
            longitude: 73.8567,
            address: "Pune, Maharashtra"
          })}
        >
          <View style={styles.suggestionIconContainer}>
            <Image source={icons.target} style={styles.suggestionIcon} />
          </View>
          <View style={styles.suggestionTextContainer}>
            <Text style={styles.suggestionTitle}>Current Location</Text>
            <Text style={styles.suggestionSubtitle}>{userAddress || 'Pune, Maharashtra'}</Text>
          </View>
        </TouchableOpacity>
          </>
        )}
      </BottomSheetScrollView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: '#161616',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handleIndicator: {
    backgroundColor: '#3c3c3c',
    width: 40,
    height: 4,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  optionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2c2c2c',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 8,
  },
  optionIcon: {
    width: 16,
    height: 16,
    tintColor: '#FFFFFF',
    marginRight: 8,
  },
  optionText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  arrowIcon: {
    width: 12,
    height: 12,
    tintColor: '#8e8e93',
  },
  locationContainer: {
    marginBottom: 20,
  },
  locationInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dotIndicator: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },
  squareIndicator: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  square: {
    width: 10,
    height: 10,
    backgroundColor: '#000000',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  connectingLine: {
    width: 2,
    height: 20,
    backgroundColor: '#3c3c3c',
    marginLeft: 15,
    marginVertical: 4,
  },
  googleInputWrapper: {
    flex: 1,
  },
  inputBox: {
    flex: 1,
    backgroundColor: '#2c2c2c',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
  },
  inputLabel: {
    fontSize: 12,
    color: '#8e8e93',
    marginBottom: 4,
  },
  inputValue: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  inputPlaceholder: {
    fontSize: 16,
    color: '#8e8e93',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2c2c2c',
  },
  suggestionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#161616',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  suggestionIcon: {
    width: 20,
    height: 20,
    tintColor: '#FFFFFF',
  },
  suggestionTextContainer: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  suggestionSubtitle: {
    fontSize: 14,
    color: '#8e8e93',
  },
  // Parking Details Styles
  backButton: {
    marginRight: 12,
  },
  backArrowIcon: {
    width: 20,
    height: 20,
    tintColor: '#FFFFFF',
  },
  parkingCard: {
    backgroundColor: '#292929',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  parkingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  parkingTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2c2c2c',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  starIcon: {
    width: 14,
    height: 14,
    tintColor: '#FFD60A',
    marginRight: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  parkingAddress: {
    fontSize: 14,
    color: '#8e8e93',
    marginBottom: 16,
  },
  availabilitySection: {
    marginBottom: 16,
  },
  availabilityRow: {
    marginBottom: 12,
  },
  availabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  availabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  availabilityText: {
    fontSize: 14,
    fontWeight: '600',
  },
  spotsInfoContainer: {
    flexDirection: 'row',
    backgroundColor: '#2c2c2c',
    borderRadius: 8,
    padding: 16,
  },
  spotsInfo: {
    flex: 1,
    alignItems: 'center',
  },
  spotsDivider: {
    width: 1,
    backgroundColor: '#3c3c3c',
    marginHorizontal: 16,
  },
  spotsLabel: {
    fontSize: 12,
    color: '#8e8e93',
    marginBottom: 6,
  },
  spotsValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2c2c2c',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  featureIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  featureText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  bookButton: {
    backgroundColor: '#292929',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default DestinationSheet;
