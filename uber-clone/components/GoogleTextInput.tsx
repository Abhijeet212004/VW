import { View, Image } from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

import { icons } from "@/constants";
import { GoogleInputProps } from "@/types/type";

const googlePlacesApiKey = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

const GoogleTextInput = ({
  icon,
  initialLocation,
  containerStyle,
  textInputBackgroundColor,
  placeholder = "Search",
  handlePress,
  onFocus,
  onBlur,
}: GoogleInputProps) => {
  return (
    <View
      className={`flex flex-row items-center justify-center relative z-50 rounded-xl ${containerStyle}`}
    >
      <GooglePlacesAutocomplete
        fetchDetails={true}
        placeholder={placeholder}
        debounce={200}
        styles={{
          textInputContainer: {
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 8,
            marginHorizontal: 0,
            position: "relative",
            shadowColor: "#d4d4d4",
          },
          textInput: {
            backgroundColor: textInputBackgroundColor
              ? textInputBackgroundColor
              : "white",
            fontSize: 16,
            fontWeight: "600",
            marginTop: 0,
            width: "100%",
            borderRadius: 8,
            paddingLeft: 45,
            paddingVertical: 14,
            color: "#FFFFFF",
          },
          listView: {
            backgroundColor: "#161616",
            position: "relative",
            top: 0,
            width: "100%",
            borderRadius: 10,
            shadowColor: "#d4d4d4",
            zIndex: 99,
            marginTop: 8,
          },
          row: {
            backgroundColor: "#161616",
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderBottomWidth: 1,
            borderBottomColor: "#2c2c2c",
          },
          description: {
            color: "#FFFFFF",
            fontSize: 15,
          },
          separator: {
            backgroundColor: "#2c2c2c",
            height: 1,
          },
          poweredContainer: {
            backgroundColor: "#161616",
            borderTopWidth: 1,
            borderTopColor: "#2c2c2c",
            paddingVertical: 8,
          },
          powered: {
            color: "#000000",
          },
        }}
        onPress={(data, details = null) => {
          handlePress({
            latitude: details?.geometry.location.lat!,
            longitude: details?.geometry.location.lng!,
            address: data.description,
          });
        }}
        query={{
          key: googlePlacesApiKey,
          language: "en",
        }}
        renderLeftButton={() => (
          <View style={{
            position: 'absolute',
            left: 14,
            top: 14,
            zIndex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <Image
              source={icon ? icon : icons.search}
              resizeMode="contain"
              style={{ tintColor: '#8e8e93', width: 20, height: 20 }}
            />
          </View>
        )}
        textInputProps={{
          placeholderTextColor: "#8e8e93",
          placeholder: initialLocation ?? "Where the fuck you wanna go?",
          onFocus: onFocus,
          onBlur: onBlur,
        }}
      />
    </View>
  );
};

export default GoogleTextInput;