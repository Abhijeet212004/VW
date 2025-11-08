import React, { useCallback, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import DateTimePicker from '@react-native-community/datetimepicker';
import { icons } from '@/constants';
import { ParkingMarkerData } from '@/types/type';

interface PredictionBottomSheetProps {
  parkingSpot: ParkingMarkerData;
  selectedDate: Date;
  selectedTime: Date;
  onDateChange: (date: Date) => void;
  onTimeChange: (time: Date) => void;
  onPredictPress: () => void;
  onClose: () => void;
}

const PredictionBottomSheet: React.FC<PredictionBottomSheetProps> = ({
  parkingSpot,
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange,
  onPredictPress,
  onClose,
}) => {
  const bottomSheetRef = useRef<BottomSheet>(null);

  // Define snap points
  const snapPoints = useMemo(() => ['50%', '75%'], []);

  // Render backdrop for the bottom sheet
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      onClose();
    }
  }, [onClose]);

  const handleDateChange = (event: any, date?: Date) => {
    if (date) {
      onDateChange(date);
    }
  };

  const handleTimeChange = (event: any, time?: Date) => {
    if (time) {
      onTimeChange(time);
    }
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={1}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={styles.indicator}
      backgroundStyle={styles.bottomSheetBackground}
      enablePanDownToClose={true}
    >
      <BottomSheetScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.title}>Predict Parking Availability</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Image source={icons.close} style={styles.closeIcon} />
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>Select date and time for prediction</Text>
        </View>

        <View style={styles.spotInfo}>
          <View style={styles.spotHeader}>
            <Image source={icons.pin} style={styles.spotIcon} />
            <View style={styles.spotDetails}>
              <Text style={styles.spotName}>{parkingSpot.title}</Text>
              <Text style={styles.spotAddress}>{parkingSpot.address}</Text>
            </View>
          </View>
        </View>

        <View style={styles.dateTimeContainer}>
          <View style={styles.dateTimeSection}>
            <Text style={styles.sectionTitle}>Select Date</Text>
            <View style={styles.dateTimeWrapper}>
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'compact' : 'default'}
                onChange={handleDateChange}
                minimumDate={new Date()}
                themeVariant="dark"
                textColor="#FFFFFF"
              />
            </View>
          </View>

          <View style={styles.dateTimeSection}>
            <Text style={styles.sectionTitle}>Select Time</Text>
            <View style={styles.dateTimeWrapper}>
              <DateTimePicker
                value={selectedTime}
                mode="time"
                display={Platform.OS === 'ios' ? 'compact' : 'default'}
                onChange={handleTimeChange}
                themeVariant="dark"
                textColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Prediction Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Location:</Text>
            <Text style={styles.summaryValue}>{parkingSpot.title}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Date:</Text>
            <Text style={styles.summaryValue}>{selectedDate.toDateString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Time:</Text>
            <Text style={styles.summaryValue}>{selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.predictButton} onPress={onPredictPress}>
          <Text style={styles.predictButtonText}>Get Prediction</Text>
          <Image source={icons.arrowUp} style={styles.buttonIcon} />
        </TouchableOpacity>
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
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 8,
  },
  closeIcon: {
    width: 20,
    height: 20,
    tintColor: '#666',
  },
  subtitle: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  spotInfo: {
    backgroundColor: '#2E2E2E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  spotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spotIcon: {
    width: 24,
    height: 24,
    tintColor: '#0CC25F',
    marginRight: 12,
  },
  spotDetails: {
    flex: 1,
  },
  spotName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  spotAddress: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  dateTimeContainer: {
    marginBottom: 24,
  },
  dateTimeSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  dateTimeWrapper: {
    backgroundColor: '#2E2E2E',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  summaryContainer: {
    backgroundColor: '#2E2E2E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  predictButton: {
    backgroundColor: '#0CC25F',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  predictButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
  buttonIcon: {
    width: 20,
    height: 20,
    tintColor: '#FFFFFF',
    transform: [{ rotate: '45deg' }],
  },
});

export default PredictionBottomSheet;