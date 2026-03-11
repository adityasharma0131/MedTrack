// TextWrapper.js
import React from "react";
import { Text as RNText, View, ActivityIndicator } from "react-native";
import {
  useFonts,
  Outfit_100Thin,
  Outfit_200ExtraLight,
  Outfit_300Light,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
  Outfit_800ExtraBold,
  Outfit_900Black,
} from "@expo-google-fonts/outfit";

const fontMap = {
  100: "Outfit_100Thin",
  200: "Outfit_200ExtraLight",
  300: "Outfit_300Light",
  400: "Outfit_400Regular",
  500: "Outfit_500Medium",
  600: "Outfit_600SemiBold",
  700: "Outfit_700Bold",
  800: "Outfit_800ExtraBold",
  900: "Outfit_900Black",
};

const Text = ({ style, weight = "400", children, ...props }) => {
  const [fontsLoaded] = useFonts({
    Outfit_100Thin,
    Outfit_200ExtraLight,
    Outfit_300Light,
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_800ExtraBold,
    Outfit_900Black,
  });

  if (!fontsLoaded) {
    // Simple fallback while fonts are loading
    return (
      <View style={{ justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="small" color="#000" />
      </View>
    );
  }

  const fontFamily = fontMap[weight] || fontMap["400"];

  return (
    <RNText style={[{ fontFamily, color: "#111827" }, style]} {...props}>
      {children}
    </RNText>
  );
};

export { Text };
