import React, { useEffect } from "react";
import { View, Text, Button, Alert } from "react-native";
import * as Location from "expo-location";
import { useNavigation } from "@react-navigation/native";

const LocationPermissionScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status === "granted") {
      navigation.navigate("Home"); // Redirect to Home if granted
    } else {
      Alert.alert(
        "Location Required",
        "Please enable location to use this app.",
        [{ text: "Retry", onPress: requestLocationPermission }]
      );
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Requesting Location Permission...</Text>
    </View>
  );
};

export default LocationPermissionScreen;