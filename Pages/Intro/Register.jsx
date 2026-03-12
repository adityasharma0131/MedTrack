import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Text } from "../../Components/TextWrapper";

// ✅ InputField moved outside (prevents keyboard closing)
const InputField = ({
  icon,
  placeholder,
  value,
  onChangeText,
  secure,
  toggleSecure,
  keyboardType,
  field,
  focusedField,
  setFocusedField,
}) => (
  <View
    style={[
      styles.inputContainer,
      focusedField === field && styles.inputFocused,
    ]}
  >
    <MaterialCommunityIcons
      name={icon}
      size={20}
      color={focusedField === field ? "#6C63FF" : "#9A9BB0"}
    />

    <TextInput
      style={styles.input}
      placeholder={placeholder}
      placeholderTextColor="#9A9BB0"
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secure}
      keyboardType={keyboardType || "default"}
      autoCapitalize={keyboardType === "email-address" ? "none" : "words"}
      onFocus={() => setFocusedField(field)}
      onBlur={() => setFocusedField(null)}
    />

    {toggleSecure && (
      <TouchableOpacity onPress={toggleSecure}>
        <MaterialCommunityIcons
          name={secure ? "eye-off-outline" : "eye-outline"}
          size={20}
          color="#9A9BB0"
        />
      </TouchableOpacity>
    )}
  </View>
);

const Register = ({ navigation }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [secure, setSecure] = useState(true);
  const [secureConfirm, setSecureConfirm] = useState(true);

  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Missing Fields", "Please fill in all fields.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Weak Password", "Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Mismatch", "Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const existing = await AsyncStorage.getItem(
        `user_${email.toLowerCase()}`,
      );

      if (existing) {
        Alert.alert(
          "Already Registered",
          "An account with this email already exists.",
        );
        setLoading(false);
        return;
      }

      const userData = {
        name,
        email: email.toLowerCase(),
        password,
        createdAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(
        `user_${email.toLowerCase()}`,
        JSON.stringify(userData),
      );

      await AsyncStorage.setItem("currentUser", email.toLowerCase());

      Alert.alert("Welcome! 🎉", `Account created successfully, ${name}!`, [
        {
          text: "Get Started",
          onPress: () =>
            navigation.replace("Home", {
              userEmail: email.toLowerCase(),
              userName: name,
            }),
        },
      ]);
    } catch (e) {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0F2C" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoWrap}>
              <MaterialCommunityIcons name="pill" size={36} color="#fff" />
            </View>

            <Text style={styles.brand}>MedTrack</Text>
            <Text style={styles.title}>Create Account</Text>

            <Text style={styles.subtitle}>
              Join thousands managing their health smarter
            </Text>
          </View>

          {/* Form */}
          <View style={styles.card}>
            <InputField
              icon="account-outline"
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
              field="name"
              focusedField={focusedField}
              setFocusedField={setFocusedField}
            />

            <InputField
              icon="email-outline"
              placeholder="Email Address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              field="email"
              focusedField={focusedField}
              setFocusedField={setFocusedField}
            />

            <InputField
              icon="lock-outline"
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secure={secure}
              toggleSecure={() => setSecure(!secure)}
              field="password"
              focusedField={focusedField}
              setFocusedField={setFocusedField}
            />

            <InputField
              icon="lock-check-outline"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secure={secureConfirm}
              toggleSecure={() => setSecureConfirm(!secureConfirm)}
              field="confirm"
              focusedField={focusedField}
              setFocusedField={setFocusedField}
            />

            <TouchableOpacity
              style={styles.registerButton}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.registerText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account?</Text>

              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={styles.login}> Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Register;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0A0F2C" },

  bgAccent: {
    position: "absolute",
    top: -60,
    left: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "#4ECDC422",
  },

  container: { paddingHorizontal: 24, paddingVertical: 32 },

  header: { alignItems: "center", marginBottom: 32 },

  logoWrap: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: "#6C63FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },

  brand: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6C63FF",
    letterSpacing: 3,
    marginBottom: 10,
  },

  title: { fontSize: 28, fontWeight: "800", color: "#FFFFFF", marginBottom: 6 },

  subtitle: { fontSize: 14, color: "#9A9BB0", textAlign: "center" },

  card: {
    backgroundColor: "#13193D",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "#1E2550",
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0D1235",
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 14,
    height: 56,
    borderWidth: 1,
    borderColor: "#1E2550",
  },

  inputFocused: { borderColor: "#6C63FF" },

  input: { flex: 1, marginLeft: 10, fontSize: 15, color: "#FFFFFF" },

  registerButton: {
    backgroundColor: "#6C63FF",
    height: 56,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 6,
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },

  registerText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  footer: { flexDirection: "row", justifyContent: "center", marginTop: 20 },

  footerText: { color: "#9A9BB0", fontSize: 14 },

  login: { color: "#6C63FF", fontWeight: "700", fontSize: 14 },
});
