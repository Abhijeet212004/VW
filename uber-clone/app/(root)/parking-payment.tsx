import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, SafeAreaView, Modal } from "react-native";
import { icons } from "@/constants";

const ParkingPayment = () => {
  const params = useLocalSearchParams();
  const parkingName = params.parkingName as string || "Parking Location";
  const spotId = params.spotId as string || "A-13";
  const parkingId = params.parkingId as string;
  
  const [selectedPayment, setSelectedPayment] = useState<'wallet' | 'later' | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [parkingDuration] = useState(2); // hours
  const pricePerHour = 20;
  const totalAmount = parkingDuration * pricePerHour;

  const handleBack = () => {
    router.back();
  };

  const handlePayment = () => {
    if (selectedPayment === 'wallet') {
      // Show confirmation dialog for wallet payment
      setShowConfirmation(true);
    } else if (selectedPayment === 'later') {
      // Directly go to booking confirmed for pay later
      router.push({
        pathname: "/(root)/booking-confirmed",
        params: {
          parkingName,
          spotId,
          paymentMethod: 'later',
        },
      });
    }
  };

  const handleConfirmPayment = () => {
    setShowConfirmation(false);
    // Navigate to booking confirmed with a slight delay to allow modal to close
    setTimeout(() => {
      router.push({
        pathname: "/(root)/booking-confirmed",
        params: {
          parkingName,
          spotId,
          paymentMethod: 'wallet',
        },
      });
    }, 100);
  };

  const handleCancelPayment = () => {
    setShowConfirmation(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Floating Back Button */}
      <TouchableOpacity onPress={handleBack} style={styles.floatingBackButton}>
        <Image source={icons.backArrow} style={styles.backIcon} />
      </TouchableOpacity>

      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Booking Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.cardTitle}>Booking Summary</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Parking Location</Text>
            <Text style={styles.summaryValue}>{parkingName}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Parking Spot</Text>
            <View style={styles.spotBadge}>
              <Text style={styles.spotBadgeText}>{spotId}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Duration</Text>
            <Text style={styles.summaryValue}>{parkingDuration} hours</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Rate per hour</Text>
            <Text style={styles.summaryValue}>₹{pricePerHour}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Date & Time</Text>
            <Text style={styles.summaryValue}>Today, {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</Text>
          </View>
        </View>

        {/* Price Breakdown Card */}
        <View style={styles.priceCard}>
          <Text style={styles.cardTitle}>Price Details</Text>
          
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Parking Fee ({parkingDuration}h)</Text>
            <Text style={styles.priceValue}>₹{totalAmount}</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Service Fee</Text>
            <Text style={styles.priceValue}>₹10</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Tax (18%)</Text>
            <Text style={styles.priceValue}>₹{Math.round((totalAmount + 10) * 0.18)}</Text>
          </View>

          <View style={styles.totalDivider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>₹{Math.round((totalAmount + 10) * 1.18)}</Text>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.paymentSection}>
          <Text style={styles.sectionTitle}>Select Payment Method</Text>

          {/* Wallet Payment */}
          <TouchableOpacity
            style={[
              styles.paymentOption,
              selectedPayment === 'wallet' && styles.paymentOptionSelected
            ]}
            onPress={() => setSelectedPayment('wallet')}
          >
            <View style={styles.paymentLeft}>
              <View style={styles.walletIconContainer}>
                <Text style={styles.walletIcon}>💳</Text>
              </View>
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentTitle}>Pay via Wallet</Text>
                <Text style={styles.paymentSubtitle}>Fast & Secure Payment</Text>
              </View>
            </View>
            <View style={[
              styles.radioOuter,
              selectedPayment === 'wallet' && styles.radioOuterSelected
            ]}>
              {selectedPayment === 'wallet' && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>

          {/* Pay Later */}
          <TouchableOpacity
            style={[
              styles.paymentOption,
              selectedPayment === 'later' && styles.paymentOptionSelected
            ]}
            onPress={() => setSelectedPayment('later')}
          >
            <View style={styles.paymentLeft}>
              <View style={styles.laterIconContainer}>
                <Text style={styles.laterIcon}>⏰</Text>
              </View>
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentTitle}>Pay Later</Text>
                <Text style={styles.paymentSubtitle}>Pay at parking exit</Text>
              </View>
            </View>
            <View style={[
              styles.radioOuter,
              selectedPayment === 'later' && styles.radioOuterSelected
            ]}>
              {selectedPayment === 'later' && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>
        </View>

        {/* Spacing for button */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomContainer}>
        <View style={styles.bottomContent}>
          <View style={styles.amountSection}>
            <Text style={styles.amountLabel}>Total Amount</Text>
            <Text style={styles.amountValue}>₹{Math.round((totalAmount + 10) * 1.18)}</Text>
          </View>
          <TouchableOpacity
            style={[
              styles.payButton,
              !selectedPayment && styles.payButtonDisabled
            ]}
            onPress={handlePayment}
            disabled={!selectedPayment}
          >
            <Text style={styles.payButtonText}>
              {selectedPayment === 'wallet' ? 'Pay Now' : selectedPayment === 'later' ? 'Confirm Booking' : 'Select Payment Method'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmation}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelPayment}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIcon}>
              <Text style={styles.modalIconText}>💳</Text>
            </View>
            
            <Text style={styles.modalTitle}>Confirm Payment</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to pay ₹{Math.round((totalAmount + 10) * 1.18)} via wallet for parking spot {spotId}?
            </Text>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalButtonCancel}
                onPress={handleCancelPayment}
              >
                <Text style={styles.modalButtonCancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.modalButtonConfirm}
                onPress={handleConfirmPayment}
              >
                <Text style={styles.modalButtonConfirmText}>Yes, Pay Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#161616",
  },
  floatingBackButton: {
    position: "absolute",
    top: 60,
    left: 20,
    width: 44,
    height: 44,
    backgroundColor: "#292929",
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: "#FFFFFF",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 50,
  },
  summaryCard: {
    backgroundColor: "#292929",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  summaryLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: "#8E8E93",
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  spotBadge: {
    backgroundColor: "#000000",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  spotBadgeText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: "#3A3A3C",
  },
  priceCard: {
    backgroundColor: "#292929",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  priceLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: "#8E8E93",
  },
  priceValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  totalDivider: {
    height: 2,
    backgroundColor: "#3A3A3C",
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  paymentSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  paymentOption: {
    backgroundColor: "#292929",
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 2,
    borderColor: "#292929",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  paymentOptionSelected: {
    borderColor: "#FFFFFF",
    backgroundColor: "#000000",
    shadowColor: "#FFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  paymentLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  walletIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#3A3A3C",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  walletIcon: {
    fontSize: 24,
  },
  laterIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#3A3A3C",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  laterIcon: {
    fontSize: 24,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  paymentSubtitle: {
    fontSize: 13,
    fontWeight: "500",
    color: "#8E8E93",
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#8E8E93",
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterSelected: {
    borderColor: "#FFFFFF",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#FFFFFF",
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#161616",
    borderTopWidth: 1,
    borderTopColor: "#2C2C2E",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  bottomContent: {
    padding: 20,
    paddingBottom: 30,
  },
  amountSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  amountLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#8E8E93",
  },
  amountValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  payButton: {
    backgroundColor: "#292929",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  payButtonDisabled: {
    backgroundColor: "#1C1C1E",
    shadowOpacity: 0,
  },
  payButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#292929",
    borderRadius: 24,
    padding: 28,
    width: "100%",
    maxWidth: 360,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  modalIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#3A3A3C",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  modalIconText: {
    fontSize: 40,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  modalMessage: {
    fontSize: 16,
    fontWeight: "500",
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 28,
  },
  modalActions: {
    flexDirection: "row",
    width: "100%",
    gap: 12,
  },
  modalButtonCancel: {
    flex: 1,
    backgroundColor: "#3A3A3C",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  modalButtonCancelText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  modalButtonConfirm: {
    flex: 1,
    backgroundColor: "#0a84ff",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#0a84ff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  modalButtonConfirmText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
});

export default ParkingPayment;
