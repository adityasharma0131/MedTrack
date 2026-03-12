import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Text } from "../../Components/TextWrapper";

const Home = ({ navigation, route }) => {
  const [userName, setUserName] = useState("");
  const [todayCount, setTodayCount] = useState(0);
  const [totalMeds, setTotalMeds] = useState(0);

  useEffect(() => {
    loadStats();
    const unsubscribe = navigation.addListener("focus", loadStats);
    return unsubscribe;
  }, [navigation]);

  const loadStats = async () => {
    try {
      const userEmail = await AsyncStorage.getItem("currentUser");
      if (!userEmail) return;

      const stored = await AsyncStorage.getItem(`user_${userEmail}`);
      if (stored) {
        const u = JSON.parse(stored);
        setUserName(u.name?.split(" ")[0] || "");
      }

      const medsRaw = await AsyncStorage.getItem(`medicines_${userEmail}`);
      const meds = medsRaw ? JSON.parse(medsRaw) : [];
      setTotalMeds(meds.filter((m) => m.active !== false).length);

      const today = new Date().toDateString();
      const historyRaw = await AsyncStorage.getItem(`history_${userEmail}`);
      const history = historyRaw ? JSON.parse(historyRaw) : [];
      const takenToday = history.filter(
        (h) => new Date(h.takenAt).toDateString() === today && h.taken,
      ).length;
      setTodayCount(takenToday);
    } catch (_) {}
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0F2C" />
      <View style={styles.bgAccent} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Bar */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.userName}>{userName || "there"} 👋</Text>
          </View>
          <TouchableOpacity
            style={styles.profileBtn}
            onPress={async () => {
              await AsyncStorage.removeItem("currentUser");
              navigation.replace("Login");
            }}
          >
            <MaterialCommunityIcons name="logout" size={22} color="#9A9BB0" />
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{totalMeds}</Text>
            <Text style={styles.statLabel}>Active{"\n"}Medicines</Text>
          </View>
          <View style={[styles.statCard, styles.statCardAccent]}>
            <Text style={[styles.statNum, { color: "#fff" }]}>
              {todayCount}
            </Text>
            <Text style={[styles.statLabel, { color: "#D4D2FF" }]}>
              Taken{"\n"}Today
            </Text>
          </View>
        </View>

        {/* Section Label */}
        <Text style={styles.sectionLabel}>What would you like to do?</Text>

        {/* Scan Medicine Card */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("MediTrack")}
          activeOpacity={0.85}
        >
          <View style={[styles.cardIcon, { backgroundColor: "#4ECDC415" }]}>
            <MaterialCommunityIcons
              name="camera-outline"
              size={34}
              color="#4ECDC4"
            />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Scan Medicine Packet</Text>
            <Text style={styles.cardDesc}>
              AI-powered analysis of any medicine — uses, side effects, and
              manufacturing info.
            </Text>
          </View>
          <MaterialCommunityIcons
            name="chevron-right"
            size={24}
            color="#3D4470"
          />
        </TouchableOpacity>

        {/* Log Medicine Card */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("MediLogDash")}
          activeOpacity={0.85}
        >
          <View style={[styles.cardIcon, { backgroundColor: "#6C63FF15" }]}>
            <MaterialCommunityIcons name="pill" size={34} color="#6C63FF" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Log Your Medicine</Text>
            <Text style={styles.cardDesc}>
              Track doses, set reminders, and view your complete medicine
              history.
            </Text>
          </View>
          <MaterialCommunityIcons
            name="chevron-right"
            size={24}
            color="#3D4470"
          />
        </TouchableOpacity>

        {/* Quick tip */}
        <View style={styles.tipCard}>
          <MaterialCommunityIcons
            name="lightbulb-outline"
            size={20}
            color="#F9A825"
          />
          <Text style={styles.tipText}>
            {" "}
            Tip: Set dose timings when logging to never miss a dose!
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0A0F2C" },

  bgAccent: {
    position: "absolute",
    top: -80,
    right: -80,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "#6C63FF18",
  },

  scroll: { paddingHorizontal: 22, paddingBottom: 40 },

  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    marginBottom: 28,
  },

  greeting: { fontSize: 14, color: "#9A9BB0" },

  userName: { fontSize: 24, fontWeight: "800", color: "#FFFFFF" },

  profileBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#13193D",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1E2550",
  },

  statsRow: { flexDirection: "row", gap: 14, marginBottom: 32 },

  statCard: {
    flex: 1,
    backgroundColor: "#13193D",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#1E2550",
  },

  statCardAccent: {
    backgroundColor: "#6C63FF",
    borderColor: "#6C63FF",
  },

  statNum: { fontSize: 32, fontWeight: "800", color: "#6C63FF" },

  statLabel: { fontSize: 12, color: "#9A9BB0", marginTop: 4, lineHeight: 18 },

  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#9A9BB0",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 16,
  },

  card: {
    backgroundColor: "#13193D",
    borderRadius: 20,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#1E2550",
  },

  cardIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },

  cardContent: { flex: 1 },

  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },

  cardDesc: { fontSize: 12, color: "#9A9BB0", lineHeight: 17 },

  tipCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9A82510",
    borderRadius: 14,
    padding: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#F9A82530",
  },

  tipText: { fontSize: 13, color: "#F9A825", flex: 1 },
});
