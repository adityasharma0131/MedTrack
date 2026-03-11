import React from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../../Components/TextWrapper";

const medicines = [
  { id: "1", name: "Paracetamol", qty: "10 tablets", expiry: "12/2026" },
  { id: "2", name: "Vitamin C", qty: "20 tablets", expiry: "05/2027" },
];

const MedicineBox = () => {
  return (
    <SafeAreaView style={styles.root}>
      <Text style={styles.title}>Medicine Box</Text>

      <FlatList
        data={medicines}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text>Qty: {item.qty}</Text>
            <Text>Expiry: {item.expiry}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default MedicineBox;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F5F6FA",
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },

  name: {
    fontWeight: "600",
    fontSize: 16,
  },
});
