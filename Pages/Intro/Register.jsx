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
  label,
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
  <View style={styles.fieldGroup}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <View
      style={[
        styles.inputContainer,
        focusedField === field && styles.inputFocused,
      ]}
    >
      <MaterialCommunityIcons
        name={icon}
        size={18}
        color={focusedField === field ? "#0EA5B0" : "#A0AEC0"}
      />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#CBD5E0"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secure}
        keyboardType={keyboardType || "default"}
        autoCapitalize={keyboardType === "email-address" ? "none" : "words"}
        onFocus={() => setFocusedField(field)}
        onBlur={() => setFocusedField(null)}
      />
      {toggleSecure && (
        <TouchableOpacity
          onPress={toggleSecure}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <MaterialCommunityIcons
            name={secure ? "eye-off-outline" : "eye-outline"}
            size={18}
            color="#A0AEC0"
          />
        </TouchableOpacity>
      )}
    </View>
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
      <StatusBar barStyle="dark-content" backgroundColor="#F7F9FC" />

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
              <MaterialCommunityIcons name="pill" size={32} color="#fff" />
            </View>
            <Text style={styles.brand}>MEDTRACK</Text>
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>
              Join thousands managing their health smarter
            </Text>
          </View>

          {/* Form */}
          <View style={styles.card}>
            <InputField
              icon="account-outline"
              label="Full Name"
              placeholder="Jane Doe"
              value={name}
              onChangeText={setName}
              field="name"
              focusedField={focusedField}
              setFocusedField={setFocusedField}
            />

            <InputField
              icon="email-outline"
              label="Email Address"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              field="email"
              focusedField={focusedField}
              setFocusedField={setFocusedField}
            />

            <InputField
              icon="lock-outline"
              label="Password"
              placeholder="Min. 6 characters"
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
              label="Confirm Password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secure={secureConfirm}
              toggleSecure={() => setSecureConfirm(!secureConfirm)}
              field="confirm"
              focusedField={focusedField}
              setFocusedField={setFocusedField}
            />

            {/* Password hint */}
            <View style={styles.hintRow}>
              <MaterialCommunityIcons
                name="shield-check-outline"
                size={14}
                color="#0EA5B0"
              />
              <Text style={styles.hintText}>
                {" "}
                Your data is securely stored on this device
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.registerButton,
                loading && styles.registerButtonDisabled,
              ]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Text style={styles.registerText}>Create Account</Text>
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
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("Login")}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
            >
              <Text style={styles.login}> Sign in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Register;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },

  container: {
    paddingHorizontal: 24,
    paddingVertical: 32,
  },

  header: {
    alignItems: "center",
    marginBottom: 28,
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

  fieldGroup: {
    marginBottom: 4,
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

  hintRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FAFB",
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#BAE6EA",
  },

  hintText: {
    fontSize: 12,
    color: "#0EA5B0",
    lineHeight: 17,
  },

  registerButton: {
    backgroundColor: "#0EA5B0",
    height: 56,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    shadowColor: "#0EA5B0",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },

  registerButtonDisabled: {
    opacity: 0.7,
  },

  registerText: {
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

  login: {
    color: "#0EA5B0",
    fontWeight: "700",
    fontSize: 14,
  },
});
