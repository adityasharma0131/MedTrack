import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Text } from "../../Components/TextWrapper";

const MediLogDash = ({ navigation }) => {
  const [todayDoses, setTodayDoses] = useState([]);
  const [takenCount, setTakenCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    loadTodaySummary();
    const unsubscribe = navigation.addListener("focus", loadTodaySummary);
    return unsubscribe;
  }, [navigation]);

  const loadTodaySummary = async () => {
    try {
      const userEmail = await AsyncStorage.getItem("currentUser");
      if (!userEmail) return;

      const medsRaw = await AsyncStorage.getItem(`medicines_${userEmail}`);
      const meds = medsRaw ? JSON.parse(medsRaw) : [];
      const activeMeds = meds.filter((m) => m.active !== false);

      const historyRaw = await AsyncStorage.getItem(`history_${userEmail}`);
      const history = historyRaw ? JSON.parse(historyRaw) : [];
      const today = new Date().toDateString();
      const todayHistory = history.filter(
        (h) => new Date(h.scheduledTime).toDateString() === today,
      );

      const taken = todayHistory.filter((h) => h.taken).length;
      const pending = todayHistory.filter((h) => !h.taken).length;

      setTodayDoses(todayHistory.slice(0, 3));
      setTakenCount(taken);
      setPendingCount(pending);
    } catch (_) {}
  };

  const options = [
    {
      icon: "plus-circle-outline",
      label: "Log New Medicine",
      desc: "Add a new medicine with reminders",
      route: "LogNewMedicine",
      color: "#6C63FF",
      bg: "#6C63FF18",
    },
    {
      icon: "clipboard-text-clock-outline",
      label: "Dose History",
      desc: "Track your intake regularity",
      route: "History",
      color: "#4ECDC4",
      bg: "#4ECDC418",
    },
    {
      icon: "pill-multiple",
      label: "Medicine Box",
      desc: "All your current & past medicines",
      route: "MedicineBox",
      color: "#FF6B6B",
      bg: "#FF6B6B18",
    },
  ];

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0F2C" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={22}
              color="#9A9BB0"
            />
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>Medicine Log</Text>
            <Text style={styles.subtitle}>Manage your health regime</Text>
          </View>
        </View>

        {/* Today Stats */}
        <View style={styles.statsCard}>
          <View style={styles.statsCardHeader}>
            <MaterialCommunityIcons
              name="calendar-today"
              size={18}
              color="#6C63FF"
            />
            <Text style={styles.statsCardTitle}> Today's Overview</Text>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statNum, { color: "#4ECDC4" }]}>
                {takenCount}
              </Text>
              <Text style={styles.statLabel}>Doses Taken</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNum, { color: "#FFB347" }]}>
                {pendingCount}
              </Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNum, { color: "#FF6B6B" }]}>
                {takenCount + pendingCount > 0
                  ? Math.round((takenCount / (takenCount + pendingCount)) * 100)
                  : 0}
                %
              </Text>
              <Text style={styles.statLabel}>Adherence</Text>
            </View>
          </View>
        </View>

        {/* Next upcoming dose */}
        {todayDoses.length > 0 && (
          <View style={styles.upcomingCard}>
            <Text style={styles.upcomingLabel}>UPCOMING DOSES</Text>
            {todayDoses.map((dose, i) => (
              <View key={i} style={styles.doseRow}>
                <View
                  style={[
                    styles.doseDot,
                    { backgroundColor: dose.taken ? "#4ECDC4" : "#FFB347" },
                  ]}
                />
                <Text style={styles.doseName}>{dose.medicineName}</Text>
                <Text style={styles.doseTime}>{dose.time}</Text>
                <View
                  style={[
                    styles.doseBadge,
                    { backgroundColor: dose.taken ? "#4ECDC415" : "#FFB34715" },
                  ]}
                >
                  <Text
                    style={[
                      styles.doseBadgeText,
                      { color: dose.taken ? "#4ECDC4" : "#FFB347" },
                    ]}
                  >
                    {dose.taken ? "Taken" : "Pending"}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Options */}
        <Text style={styles.sectionLabel}>QUICK ACTIONS</Text>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt.route}
            style={styles.card}
            onPress={() => navigation.navigate(opt.route)}
            activeOpacity={0.85}
          >
            <View style={[styles.cardIcon, { backgroundColor: opt.bg }]}>
              <MaterialCommunityIcons
                name={opt.icon}
                size={30}
                color={opt.color}
              />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{opt.label}</Text>
              <Text style={styles.cardDesc}>{opt.desc}</Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color="#3D4470"
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default MediLogDash;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0A0F2C" },
  scroll: { paddingHorizontal: 22, paddingBottom: 40 },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 16,
    marginBottom: 24,
    gap: 14,
  },

  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#13193D",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1E2550",
  },

  title: { fontSize: 22, fontWeight: "800", color: "#FFFFFF" },
  subtitle: { fontSize: 13, color: "#9A9BB0" },

  statsCard: {
    backgroundColor: "#13193D",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#1E2550",
  },

  statsCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  statsCardTitle: { fontSize: 14, fontWeight: "700", color: "#FFFFFF" },

  statsRow: { flexDirection: "row", justifyContent: "space-around" },

  statItem: { alignItems: "center" },
  statNum: { fontSize: 28, fontWeight: "800" },
  statLabel: { fontSize: 12, color: "#9A9BB0", marginTop: 4 },
  statDivider: { width: 1, backgroundColor: "#1E2550" },

  upcomingCard: {
    backgroundColor: "#13193D",
    borderRadius: 20,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#1E2550",
  },

  upcomingLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#9A9BB0",
    letterSpacing: 1.2,
    marginBottom: 14,
  },

  doseRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  doseDot: { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
  doseName: { flex: 1, fontSize: 14, color: "#FFFFFF", fontWeight: "600" },
  doseTime: { fontSize: 13, color: "#9A9BB0", marginRight: 10 },
  doseBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  doseBadgeText: { fontSize: 11, fontWeight: "700" },

  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#9A9BB0",
    letterSpacing: 1.2,
    marginBottom: 14,
  },

  card: {
    backgroundColor: "#13193D",
    borderRadius: 20,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1E2550",
  },

  cardIcon: {
    width: 58,
    height: 58,
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
    marginBottom: 3,
  },
  cardDesc: { fontSize: 12, color: "#9A9BB0" },
});
