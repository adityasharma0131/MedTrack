import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../../Components/TextWrapper";

const LogNewMedicine = () => {
  const [name, setName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [doseType, setDoseType] = useState("");
  const [doseAmount, setDoseAmount] = useState("");
  const [quantity, setQuantity] = useState("");

  const handleSave = () => {
    Alert.alert("Medicine Logged Successfully");
  };

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Log New Medicine</Text>

        <TextInput
          placeholder="Medicine Name"
          style={styles.input}
          value={name}
          onChangeText={setName}
        />

        <TextInput
          placeholder="Expiry Date"
          style={styles.input}
          value={expiry}
          onChangeText={setExpiry}
        />

        <TextInput
          placeholder="Dose Type (Tablet, Drink, Injection)"
          style={styles.input}
          value={doseType}
          onChangeText={setDoseType}
        />

        <TextInput
          placeholder="Dose Amount (2 times a day)"
          style={styles.input}
          value={doseAmount}
          onChangeText={setDoseAmount}
        />

        <TextInput
          placeholder="Quantity"
          style={styles.input}
          value={quantity}
          onChangeText={setQuantity}
        />

        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>Save Medicine</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LogNewMedicine;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F5F6FA",
  },

  container: {
    padding: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 20,
  },

  input: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },

  button: {
    backgroundColor: "#6C63FF",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
