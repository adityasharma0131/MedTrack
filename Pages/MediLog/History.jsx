import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Text } from "../../Components/TextWrapper";

// ─── Helper ───────────────────────────────────────────────────────────────────
const formatDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const groupByDate = (history) => {
  const groups = {};
  history.forEach((item) => {
    const key = new Date(item.scheduledTime).toDateString();
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  });
  // Sort: newest first
  return Object.entries(groups)
    .sort(([a], [b]) => new Date(b) - new Date(a))
    .map(([date, items]) => ({ date, items }));
};

const DOSE_TYPE_ICONS = {
  Tablet: "pill",
  Capsule: "pill-multiple",
  Syrup: "bottle-tonic-outline",
  Injection: "needle",
  Drops: "water-outline",
  Inhaler: "air-filter",
  Patch: "bandage",
  Cream: "lotion-outline",
};

// ─── Component ────────────────────────────────────────────────────────────────
const History = ({ navigation }) => {
  const [grouped, setGrouped] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [adherenceRate, setAdherenceRate] = useState(0);
  const [streak, setStreak] = useState(0);
  const [filter, setFilter] = useState("all"); // all | taken | missed

  useEffect(() => {
    loadHistory();
    const unsubscribe = navigation.addListener("focus", loadHistory);
    return unsubscribe;
  }, [navigation]);

  const loadHistory = async () => {
    try {
      const userEmail = await AsyncStorage.getItem("currentUser");
      if (!userEmail) return;

      const historyRaw = await AsyncStorage.getItem(`history_${userEmail}`);
      let history = historyRaw ? JSON.parse(historyRaw) : [];

      // Mark past-due entries as missed automatically (if not taken & time passed)
      const now = new Date();
      let updated = false;
      history = history.map((h) => {
        if (!h.taken && new Date(h.scheduledTime) < now && !h.markedMissed) {
          updated = true;
          return { ...h, markedMissed: true };
        }
        return h;
      });

      if (updated) {
        const userEmail2 = await AsyncStorage.getItem("currentUser");
        await AsyncStorage.setItem(
          `history_${userEmail2}`,
          JSON.stringify(history),
        );
      }

      // Adherence calc (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recent = history.filter(
        (h) => new Date(h.scheduledTime) > sevenDaysAgo,
      );
      const takenRecent = recent.filter((h) => h.taken).length;
      setAdherenceRate(
        recent.length > 0 ? Math.round((takenRecent / recent.length) * 100) : 0,
      );

      // Streak calc
      const days = [
        ...new Set(
          history
            .filter((h) => h.taken)
            .map((h) => new Date(h.takenAt || h.scheduledTime).toDateString()),
        ),
      ].sort((a, b) => new Date(b) - new Date(a));

      let streakCount = 0;
      const today = new Date().toDateString();
      let checkDate = new Date();
      for (const day of days) {
        if (day === checkDate.toDateString()) {
          streakCount++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else break;
      }
      setStreak(streakCount);

      setGrouped(groupByDate(history));
    } catch (_) {}
  };

  const toggleTaken = async (item) => {
    try {
      const userEmail = await AsyncStorage.getItem("currentUser");
      const historyRaw = await AsyncStorage.getItem(`history_${userEmail}`);
      const history = JSON.parse(historyRaw || "[]");

      const idx = history.findIndex((h) => h.id === item.id);
      if (idx === -1) return;

      history[idx].taken = !history[idx].taken;
      history[idx].takenAt = history[idx].taken
        ? new Date().toISOString()
        : null;

      // Decrement medicine quantity when taken
      if (history[idx].taken) {
        const medsRaw = await AsyncStorage.getItem(`medicines_${userEmail}`);
        const meds = medsRaw ? JSON.parse(medsRaw) : [];
        const medIdx = meds.findIndex((m) => m.id === item.medicineId);
        if (medIdx !== -1 && meds[medIdx].remainingQuantity > 0) {
          meds[medIdx].remainingQuantity -= 1;
          await AsyncStorage.setItem(
            `medicines_${userEmail}`,
            JSON.stringify(meds),
          );
        }
      }

      await AsyncStorage.setItem(
        `history_${userEmail}`,
        JSON.stringify(history),
      );
      loadHistory();
    } catch (_) {}
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  }, []);

  const getFilteredItems = (items) => {
    if (filter === "taken") return items.filter((i) => i.taken);
    if (filter === "missed")
      return items.filter((i) => !i.taken && i.markedMissed);
    return items;
  };

  const isToday = (dateStr) =>
    new Date(dateStr).toDateString() === new Date().toDateString();
  const isYesterday = (dateStr) => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return new Date(dateStr).toDateString() === d.toDateString();
  };

  const renderDateLabel = (dateStr) => {
    if (isToday(dateStr)) return "Today";
    if (isYesterday(dateStr)) return "Yesterday";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "short",
    });
  };

  const renderItem = ({ item: group }) => {
    const filtered = getFilteredItems(group.items);
    if (!filtered.length) return null;

    const allTaken = group.items.every((i) => i.taken);
    const someTaken = group.items.some((i) => i.taken);

    return (
      <View style={styles.group}>
        {/* Date Header */}
        <View style={styles.dateHeader}>
          <Text style={styles.dateLabel}>{renderDateLabel(group.date)}</Text>
          <View
            style={[
              styles.dayBadge,
              {
                backgroundColor: allTaken
                  ? "#4ECDC415"
                  : someTaken
                    ? "#FFB34715"
                    : "#FF6B6B15",
              },
            ]}
          >
            <Text
              style={[
                styles.dayBadgeText,
                {
                  color: allTaken
                    ? "#4ECDC4"
                    : someTaken
                      ? "#FFB347"
                      : "#FF6B6B",
                },
              ]}
            >
              {allTaken ? "✓ All Done" : someTaken ? "Partial" : "Missed"}
            </Text>
          </View>
        </View>

        {/* Dose cards */}
        {filtered.map((dose) => (
          <TouchableOpacity
            key={dose.id}
            style={[styles.doseCard, dose.taken && styles.doseCardTaken]}
            onPress={() => toggleTaken(dose)}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.doseIconWrap,
                { backgroundColor: dose.taken ? "#4ECDC415" : "#FF6B6B15" },
              ]}
            >
              <MaterialCommunityIcons
                name={DOSE_TYPE_ICONS[dose.doseType] || "pill"}
                size={22}
                color={dose.taken ? "#4ECDC4" : "#FF6B6B"}
              />
            </View>

            <View style={styles.doseInfo}>
              <Text style={styles.doseName}>{dose.medicineName}</Text>
              <Text style={styles.doseType}>
                {dose.doseType} · {dose.time}
              </Text>
              {dose.taken && dose.takenAt && (
                <Text style={styles.takenAt}>
                  Marked at{" "}
                  {new Date(dose.takenAt).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              )}
            </View>

            <View
              style={[
                styles.statusBtn,
                { backgroundColor: dose.taken ? "#4ECDC4" : "#1E2550" },
              ]}
            >
              <MaterialCommunityIcons
                name={dose.taken ? "check" : "close"}
                size={18}
                color={dose.taken ? "#fff" : "#9A9BB0"}
              />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const adherenceColor =
    adherenceRate >= 80
      ? "#4ECDC4"
      : adherenceRate >= 50
        ? "#FFB347"
        : "#FF6B6B";

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0F2C" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <MaterialCommunityIcons name="arrow-left" size={22} color="#9A9BB0" />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Dose History</Text>
          <Text style={styles.subtitle}>Track your intake regularity</Text>
        </View>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={[styles.statNum, { color: adherenceColor }]}>
            {adherenceRate}%
          </Text>
          <Text style={styles.statLabel}>7-day Adherence</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNum, { color: "#FFB347" }]}>
            {streak} 🔥
          </Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        {["all", "taken", "missed"].map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
            onPress={() => setFilter(f)}
          >
            <Text
              style={[
                styles.filterText,
                filter === f && styles.filterTextActive,
              ]}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={grouped}
        keyExtractor={(item) => item.date}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#6C63FF"
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="history" size={60} color="#1E2550" />
            <Text style={styles.emptyTitle}>No History Yet</Text>
            <Text style={styles.emptyText}>
              Log a medicine to start tracking your doses.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default History;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0A0F2C" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 12,
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

  statsRow: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 22,
    marginBottom: 16,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#13193D",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1E2550",
    alignItems: "center",
  },

  statNum: { fontSize: 26, fontWeight: "800" },
  statLabel: { fontSize: 12, color: "#9A9BB0", marginTop: 4 },

  filters: {
    flexDirection: "row",
    paddingHorizontal: 22,
    gap: 10,
    marginBottom: 16,
  },

  filterBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#13193D",
    borderWidth: 1,
    borderColor: "#1E2550",
  },

  filterBtnActive: { backgroundColor: "#6C63FF", borderColor: "#6C63FF" },

  filterText: { fontSize: 13, color: "#9A9BB0", fontWeight: "600" },
  filterTextActive: { color: "#fff" },

  listContent: { paddingHorizontal: 22, paddingBottom: 40 },

  group: { marginBottom: 20 },

  dateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  dateLabel: { fontSize: 14, fontWeight: "700", color: "#FFFFFF" },

  dayBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  dayBadgeText: { fontSize: 11, fontWeight: "700" },

  doseCard: {
    backgroundColor: "#13193D",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#1E2550",
  },

  doseCardTaken: { borderColor: "#4ECDC430" },

  doseIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  doseInfo: { flex: 1 },
  doseName: { fontSize: 15, fontWeight: "700", color: "#FFFFFF" },
  doseType: { fontSize: 12, color: "#9A9BB0", marginTop: 2 },
  takenAt: { fontSize: 11, color: "#4ECDC4", marginTop: 3 },

  statusBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },

  empty: { alignItems: "center", paddingTop: 80, gap: 12 },
  emptyTitle: { fontSize: 20, fontWeight: "800", color: "#3D4470" },
  emptyText: { fontSize: 14, color: "#3D4470", textAlign: "center" },
});
