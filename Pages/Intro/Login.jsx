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
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Text } from "../../Components/TextWrapper";

const Login = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing Fields", "Please enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      const stored = await AsyncStorage.getItem(`user_${email.toLowerCase()}`);
      if (!stored) {
        Alert.alert(
          "Not Found",
          "No account found with this email. Please register.",
        );
        setLoading(false);
        return;
      }

      const user = JSON.parse(stored);
      if (user.password !== password) {
        Alert.alert("Wrong Password", "The password you entered is incorrect.");
        setLoading(false);
        return;
      }

      await AsyncStorage.setItem("currentUser", email.toLowerCase());
      navigation.replace("Home", {
        userEmail: email.toLowerCase(),
        userName: user.name,
      });
    } catch (e) {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0F2C" />

      <View style={styles.bgAccent} />
      <View style={styles.bgCircle} />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoWrap}>
            <MaterialCommunityIcons name="pill" size={36} color="#fff" />
          </View>
          <Text style={styles.brand}>MedTrack</Text>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>
            Sign in to continue your health journey
          </Text>
        </View>

        {/* Form */}
        <View style={styles.card}>
          <View
            style={[
              styles.inputContainer,
              focusedField === "email" && styles.inputFocused,
            ]}
          >
            <MaterialCommunityIcons
              name="email-outline"
              size={20}
              color={focusedField === "email" ? "#6C63FF" : "#9A9BB0"}
            />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor="#9A9BB0"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
            />
          </View>

          <View
            style={[
              styles.inputContainer,
              focusedField === "password" && styles.inputFocused,
            ]}
          >
            <MaterialCommunityIcons
              name="lock-outline"
              size={20}
              color={focusedField === "password" ? "#6C63FF" : "#9A9BB0"}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#9A9BB0"
              secureTextEntry={secure}
              value={password}
              onChangeText={setPassword}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
            />
            <TouchableOpacity onPress={() => setSecure(!secure)}>
              <MaterialCommunityIcons
                name={secure ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="#9A9BB0"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text style={styles.signup}> Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Login;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0A0F2C" },

  bgAccent: {
    position: "absolute",
    top: -80,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "#6C63FF22",
  },

  bgCircle: {
    position: "absolute",
    bottom: 100,
    left: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#4ECDC422",
  },

  container: { flex: 1, justifyContent: "center", paddingHorizontal: 24 },

  header: { alignItems: "center", marginBottom: 36 },

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

  loginButton: {
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

  loginText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  footer: { flexDirection: "row", justifyContent: "center", marginTop: 20 },

  footerText: { color: "#9A9BB0", fontSize: 14 },

  signup: { color: "#6C63FF", fontWeight: "700", fontSize: 14 },
});
