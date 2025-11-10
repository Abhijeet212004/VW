import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Image } from "react-native";
import GoogleTextInput from "./GoogleTextInput";
import { icons } from "@/constants";

interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
  onLocationSelect: (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => void;
}

const SearchModal = ({ visible, onClose, onLocationSelect }: SearchModalProps) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Image source={icons.backArrow} style={styles.backIcon} />
          </TouchableOpacity>
          <Text style={styles.title}>Find Parking</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.searchContainer}>
          <GoogleTextInput
            icon={icons.search}
            containerStyle="bg-transparent"
            textInputBackgroundColor="#1c1c1c"
            handlePress={(location) => {
              onLocationSelect(location);
              onClose();
            }}
          />
        </View>

        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsTitle}>Suggestions</Text>
          
          <TouchableOpacity style={styles.suggestionItem}>
            <View style={styles.suggestionIcon}>
              <Image source={icons.home} style={styles.suggestionIconImage} />
            </View>
            <View style={styles.suggestionTextContainer}>
              <Text style={styles.suggestionText}>Home</Text>
              <Text style={styles.suggestionSubtext}>Set your home address</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.suggestionItem}>
            <View style={styles.suggestionIcon}>
              <Image source={icons.point} style={styles.suggestionIconImage} />
            </View>
            <View style={styles.suggestionTextContainer}>
              <Text style={styles.suggestionText}>Work</Text>
              <Text style={styles.suggestionSubtext}>Set your work address</Text>
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1c1c1c",
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: "#FFFFFF",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    padding: 16,
  },
  suggestionsContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  suggestionsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1c1c1c",
  },
  suggestionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1c1c1c",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  suggestionIconImage: {
    width: 20,
    height: 20,
    tintColor: "#8e8e93",
  },
  suggestionTextContainer: {
    flex: 1,
  },
  suggestionText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  suggestionSubtext: {
    fontSize: 14,
    color: "#8e8e93",
  },
});

export default SearchModal;