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
      <StatusBar barStyle="dark-content" backgroundColor="#F7F9FC" />

      {/* Decorative top accent */}
      <View style={styles.topAccent} />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoWrap}>
            <MaterialCommunityIcons name="pill" size={32} color="#fff" />
          </View>
          <Text style={styles.brand}>MEDTRACK</Text>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>
            Sign in to continue your health journey
          </Text>
        </View>

        {/* Form */}
        <View style={styles.card}>
          {/* Email */}
          <Text style={styles.fieldLabel}>Email address</Text>
          <View
            style={[
              styles.inputContainer,
              focusedField === "email" && styles.inputFocused,
            ]}
          >
            <MaterialCommunityIcons
              name="email-outline"
              size={18}
              color={focusedField === "email" ? "#0EA5B0" : "#A0AEC0"}
            />
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor="#CBD5E0"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
            />
          </View>

          {/* Password */}
          <Text style={styles.fieldLabel}>Password</Text>
          <View
            style={[
              styles.inputContainer,
              focusedField === "password" && styles.inputFocused,
            ]}
          >
            <MaterialCommunityIcons
              name="lock-outline"
              size={18}
              color={focusedField === "password" ? "#0EA5B0" : "#A0AEC0"}
            />
            <TextInput
              style={styles.input}
              placeholder="Your password"
              placeholderTextColor="#CBD5E0"
              secureTextEntry={secure}
              value={password}
              onChangeText={setPassword}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
            />
            <TouchableOpacity
              onPress={() => setSecure(!secure)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MaterialCommunityIcons
                name={secure ? "eye-off-outline" : "eye-outline"}
                size={18}
                color="#A0AEC0"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text style={styles.loginText}>Sign In</Text>
                <MaterialCommunityIcons
                  name="arrow-right"
                  size={18}
                  color="#fff"
                />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("Register")}
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
          >
            <Text style={styles.signup}> Create account</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Login;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },

  topAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 280,
    backgroundColor: "#EBF8FA",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },

  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  header: {
    alignItems: "center",
    marginBottom: 32,
  },

  logoWrap: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: "#0EA5B0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#0EA5B0",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },

  brand: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0EA5B0",
    letterSpacing: 4,
    marginBottom: 12,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1A2235",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 14,
    color: "#718096",
    textAlign: "center",
    lineHeight: 20,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#1A2235",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#EDF2F7",
  },

  fieldLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4A5568",
    letterSpacing: 0.5,
    marginBottom: 8,
    textTransform: "uppercase",
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F9FC",
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 20,
    height: 54,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
  },

  inputFocused: {
    borderColor: "#0EA5B0",
    backgroundColor: "#F0FAFB",
  },

  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: "#1A2235",
  },

  loginButton: {
    backgroundColor: "#0EA5B0",
    height: 56,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
    shadowColor: "#0EA5B0",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },

  loginButtonDisabled: {
    opacity: 0.7,
  },

  loginText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },

  footerText: {
    color: "#718096",
    fontSize: 14,
  },

  signup: {
    color: "#0EA5B0",
    fontWeight: "700",
    fontSize: 14,
  },
});
