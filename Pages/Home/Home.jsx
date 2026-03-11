import React from "react";
import { View, StyleSheet, TouchableOpacity, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text } from "../../Components/TextWrapper";

const Home = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.container}>
        {/* Title */}
        <Text style={styles.title}>MedTrack</Text>
        <Text style={styles.subtitle}>Smart medicine tracking & scanning</Text>

        {/* Scan Medicine */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("MedicineScanDash")}
        >
          <MaterialCommunityIcons
            name="camera-outline"
            size={45}
            color="#6C63FF"
          />

          <Text style={styles.cardTitle}>Scan Medicine Packet</Text>

          <Text style={styles.cardDesc}>
            Scan a medicine packet to analyze details using AI
          </Text>
        </TouchableOpacity>

        {/* Log Medicine */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("MediLogDash")}
        >
          <MaterialCommunityIcons name="pill" size={45} color="#6C63FF" />

          <Text style={styles.cardTitle}>Log Your Medicine</Text>

          <Text style={styles.cardDesc}>
            Log medicines and receive reminders to take them on time
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F5F6FA",
  },

  container: {
    flex: 1,
    padding: 25,
    justifyContent: "center",
  },

  title: {
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
  },

  subtitle: {
    textAlign: "center",
    color: "#777",
    marginBottom: 40,
  },

  card: {
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 18,
    marginBottom: 25,
    alignItems: "center",
    elevation: 4,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 10,
  },

  cardDesc: {
    textAlign: "center",
    marginTop: 5,
    color: "#666",
    fontSize: 13,
  },
});
