import React from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../../Components/TextWrapper";

const data = [
  { id: "1", name: "Paracetamol", time: "8:00 AM", status: "Taken" },
  { id: "2", name: "Vitamin C", time: "2:00 PM", status: "Taken" },
];

const History = () => {
  return (
    <SafeAreaView style={styles.root}>
      <Text style={styles.title}>Medicine History</Text>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text>{item.time}</Text>
            <Text style={styles.status}>{item.status}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default History;

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
  },

  status: {
    color: "green",
  },
});
