import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { icons } from '@/constants';
import GoogleTextInput from './GoogleTextInput';

interface PredictionDestinationSheetProps {
  onLocationSelect: (location: {
    latitude: number;
    longitude: number;
    address?: string;
  }) => void;
}

const PredictionDestinationSheet: React.FC<PredictionDestinationSheetProps> = ({ 
  onLocationSelect
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
    console.log('📍 Location selected from search:', location);
    onLocationSelect({
      latitude: location.latitude,
      longitude: location.longitude,
      address: location.address,
    });
    setSearchFocused(false);
    // Snap to smallest position after selection to show the map
    setTimeout(() => {
      bottomSheetRef.current?.snapToIndex(0);
    }, 100);
  };

  const handleSheetChanges = useCallback((index: number) => {
    console.log('Prediction sheet index:', index);
    if (index === -1) {
      setSearchFocused(false);
    }
  }, []);

  const handleSearchFocus = () => {
    setSearchFocused(true);
    bottomSheetRef.current?.snapToIndex(2); // Expand to full height
  };

  const quickLocations = [
    { name: "PICT College", address: "PICT, Pune", latitude: 18.5204, longitude: 73.8567 },
    { name: "Pune Station", address: "Pune Railway Station", latitude: 18.5314, longitude: 73.8743 },
    { name: "Phoenix Mall", address: "Phoenix MarketCity, Pune", latitude: 18.5596, longitude: 73.7780 },
    { name: "Koregaon Park", address: "Koregaon Park, Pune", latitude: 18.5362, longitude: 73.8847 },
  ];

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={styles.indicator}
      backgroundStyle={styles.bottomSheetBackground}
    >
      <BottomSheetScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Where would you like to check parking?</Text>
          <Text style={styles.subtitle}>Select a location to predict parking availability</Text>
        </View>

        <View style={styles.searchContainer}>
          <GoogleTextInput
            icon={icons.search}
            textInputBackgroundColor="#2E2E2E"
            placeholder="Enter location"
            handlePress={handleLocationPress}
            onFocus={handleSearchFocus}
          />
        </View>

        {!searchFocused && (
          <View style={styles.quickLocationsContainer}>
            <Text style={styles.sectionTitle}>Quick Locations</Text>
            {quickLocations.map((location, index) => (
              <TouchableOpacity
                key={index}
                style={styles.locationItem}
                onPress={() => handleLocationPress({
                  latitude: location.latitude,
                  longitude: location.longitude,
                  address: location.address
                })}
              >
                <View style={styles.locationIcon}>
                  <Image source={icons.pin} style={styles.pinIcon} />
                </View>
                <View style={styles.locationDetails}>
                  <Text style={styles.locationName}>{location.name}</Text>
                  <Text style={styles.locationAddress}>{location.address}</Text>
                </View>
                <Image source={icons.arrowUp} style={styles.arrowIcon} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </BottomSheetScrollView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: '#1E1E1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  indicator: {
    backgroundColor: '#666',
    width: 40,
    height: 4,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  searchContainer: {
    marginBottom: 24,
  },
  searchInput: {
    backgroundColor: '#2E2E2E',
  },
  quickLocationsContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  pinIcon: {
    width: 20,
    height: 20,
    tintColor: '#0CC25F',
  },
  locationDetails: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  arrowIcon: {
    width: 20,
    height: 20,
    tintColor: '#666',
    transform: [{ rotate: '45deg' }],
  },
});

export default PredictionDestinationSheet;