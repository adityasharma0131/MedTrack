import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Text } from "../../Components/TextWrapper";

const MediLogDash = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.container}>
        <Text style={styles.title}>Medicine Log</Text>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("LogNewMedicine")}
        >
          <MaterialCommunityIcons name="pill" size={40} color="#6C63FF" />
          <Text style={styles.cardText}>Log New Medicine</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("History")}
        >
          <MaterialCommunityIcons name="history" size={40} color="#6C63FF" />
          <Text style={styles.cardText}>History</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("MedicineBox")}
        >
          <MaterialCommunityIcons
            name="archive-outline"
            size={40}
            color="#6C63FF"
          />
          <Text style={styles.cardText}>Medicine Box</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default MediLogDash;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F5F6FA" },

  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 40,
    textAlign: "center",
  },

  card: {
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 15,
    alignItems: "center",
    marginBottom: 20,
    elevation: 3,
  },

  cardText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "600",
  },
});
