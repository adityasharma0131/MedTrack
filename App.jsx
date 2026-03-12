import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as Notifications from "expo-notifications";

import {
  configureForegroundHandler,
  setupNotificationChannel,
  setupNotificationCategory,
  handleNotificationAction,
} from "./Pages/MediLog/notificationService"; // ← adjust if your folder differs

import Login from "./Pages/Intro/Login";
import Register from "./Pages/Intro/Register";

import Home from "./Pages/Home/Home";

import MediLogDash from "./Pages/MediLog/MediLogDash";
import LogNewMedicine from "./Pages/MediLog/LogNewMedicine";
import History from "./Pages/MediLog/History";
import MedicineBox from "./Pages/MediLog/MedicineBox";

import MediTrack from "./Pages/MediScan/MedicineScanDash";
import MediTrackScanner from "./Pages/MediScan/Scanner";
import MediTrackResult from "./Pages/MediScan/Result";

const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(() => {
    // 1. Configure how notifications appear while the app is in the foreground
    configureForegroundHandler();

    // 2. Register Android channel + action buttons at startup so they exist
    //    before any notification can possibly fire
    (async () => {
      await setupNotificationChannel();
      await setupNotificationCategory();
    })();

    // 3. Handle the action that cold-launched / resumed the app
    //    (getLastNotificationResponseAsync captures the tap that opened the app)
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) handleNotificationAction(response);
    });

    // 4. Handle actions while the app is already running (fore- & background)
    const subscription = Notifications.addNotificationResponseReceivedListener(
      handleNotificationAction,
    );

    return () => subscription.remove();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Register" component={Register} />

        <Stack.Screen name="Home" component={Home} />

        <Stack.Screen name="MediLogDash" component={MediLogDash} />
        <Stack.Screen name="LogNewMedicine" component={LogNewMedicine} />
        <Stack.Screen name="History" component={History} />
        <Stack.Screen name="MedicineBox" component={MedicineBox} />

        <Stack.Screen name="MediTrack" component={MediTrack} />
        <Stack.Screen name="MediTrackScanner" component={MediTrackScanner} />
        <Stack.Screen name="MediTrackResult" component={MediTrackResult} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
