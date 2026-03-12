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
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const getDate = () => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  useEffect(() => {
    const logAsyncStorage = async () => {
      try {
        const keys = await AsyncStorage.getAllKeys();
        const stores = await AsyncStorage.multiGet(keys);

        const formatted = {};

        stores.forEach(([key, value]) => {
          try {
            // Try parsing JSON values
            formatted[key] = JSON.parse(value);
          } catch {
            // If not JSON, keep original
            formatted[key] = value;
          }
        });

        console.log("===== AsyncStorage (Formatted) =====");
        console.log(JSON.stringify(formatted, null, 2));
        console.log("====================================");
      } catch (error) {
        console.error("AsyncStorage Read Error:", error);
      }
    };

    logAsyncStorage();
  }, []);

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F9FC" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Bar */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.userName}>{userName || "there"} 👋</Text>
            <Text style={styles.dateText}>{getDate()}</Text>
          </View>
          <TouchableOpacity
            style={styles.profileBtn}
            onPress={async () => {
              await AsyncStorage.removeItem("currentUser");
              navigation.replace("Login");
            }}
            hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
          >
            <MaterialCommunityIcons name="logout" size={20} color="#718096" />
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.statIconWrap, { backgroundColor: "#EBF8FA" }]}>
              <MaterialCommunityIcons name="pill" size={20} color="#0EA5B0" />
            </View>
            <Text style={[styles.statNum, { color: "#0EA5B0" }]}>
              {totalMeds}
            </Text>
            <Text style={styles.statLabel}>Active{"\n"}Medicines</Text>
          </View>
          <View style={[styles.statCard, styles.statCardAccent]}>
            <View
              style={[
                styles.statIconWrap,
                { backgroundColor: "rgba(255,255,255,0.25)" },
              ]}
            >
              <MaterialCommunityIcons
                name="check-circle-outline"
                size={20}
                color="#fff"
              />
            </View>
            <Text style={[styles.statNum, { color: "#fff" }]}>
              {todayCount}
            </Text>
            <Text
              style={[styles.statLabel, { color: "rgba(255,255,255,0.8)" }]}
            >
              Doses{"\n"}Taken Today
            </Text>
          </View>
        </View>

        {/* Section Label */}
        <Text style={styles.sectionLabel}>Quick Actions</Text>

        {/* Scan Medicine Card */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("MediTrack")}
          activeOpacity={0.85}
        >
          <View style={[styles.cardIconWrap, { backgroundColor: "#EDFCFB" }]}>
            <MaterialCommunityIcons
              name="camera-outline"
              size={28}
              color="#0EA5B0"
            />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Scan Medicine</Text>
            <Text style={styles.cardDesc}>
              AI-powered analysis — uses, side effects &amp; manufacturing info
            </Text>
          </View>
          <View style={styles.chevronWrap}>
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color="#A0AEC0"
            />
          </View>
        </TouchableOpacity>

        {/* Log Medicine Card */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("MediLogDash")}
          activeOpacity={0.85}
        >
          <View style={[styles.cardIconWrap, { backgroundColor: "#F0F4FF" }]}>
            <MaterialCommunityIcons
              name="pill-multiple"
              size={28}
              color="#5A7AF5"
            />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Medicine Log</Text>
            <Text style={styles.cardDesc}>
              Track doses, set reminders &amp; view your history
            </Text>
          </View>
          <View style={styles.chevronWrap}>
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color="#A0AEC0"
            />
          </View>
        </TouchableOpacity>

        {/* Tip Card */}
        <View style={styles.tipCard}>
          <View style={styles.tipIconWrap}>
            <MaterialCommunityIcons
              name="lightbulb-outline"
              size={18}
              color="#F59E0B"
            />
          </View>
          <Text style={styles.tipText}>
            Set dose timings when logging medicines to never miss a dose!
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },

  scroll: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },

  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingTop: 20,
    marginBottom: 28,
  },

  greeting: {
    fontSize: 14,
    color: "#718096",
    marginBottom: 2,
  },

  userName: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1A2235",
    marginBottom: 4,
  },

  dateText: {
    fontSize: 13,
    color: "#A0AEC0",
  },

  profileBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#1A2235",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  statsRow: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 32,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#1A2235",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },

  statCardAccent: {
    backgroundColor: "#0EA5B0",
    borderColor: "#0EA5B0",
    shadowColor: "#0EA5B0",
    shadowOpacity: 0.3,
  },

  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  statNum: {
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 4,
  },

  statLabel: {
    fontSize: 12,
    color: "#718096",
    lineHeight: 17,
  },

  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#A0AEC0",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 16,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#1A2235",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },

  cardIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },

  cardContent: {
    flex: 1,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A2235",
    marginBottom: 4,
  },

  cardDesc: {
    fontSize: 13,
    color: "#718096",
    lineHeight: 18,
  },

  chevronWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#F7F9FC",
    justifyContent: "center",
    alignItems: "center",
  },

  tipCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFFBEB",
    borderRadius: 16,
    padding: 16,
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#FDE68A",
    gap: 12,
  },

  tipIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#FEF3C7",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },

  tipText: {
    fontSize: 13,
    color: "#92400E",
    flex: 1,
    lineHeight: 19,
  },
});
