import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Text } from "../../Components/TextWrapper";

// ─── Helper ───────────────────────────────────────────────────────────────────
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

const DOSE_COLORS = {
  Tablet: "#6C63FF",
  Capsule: "#4ECDC4",
  Syrup: "#FFB347",
  Injection: "#FF6B6B",
  Drops: "#48CAE4",
  Inhaler: "#95D5B2",
  Patch: "#E9C46A",
  Cream: "#F4A261",
};

const isExpiryClose = (expiryStr) => {
  try {
    const [mm, yyyy] = expiryStr.split("/");
    const expiryDate = new Date(parseInt(yyyy), parseInt(mm) - 1, 28);
    const now = new Date();
    const diffMonths = (expiryDate - now) / (1000 * 60 * 60 * 24 * 30);
    return diffMonths < 2;
  } catch {
    return false;
  }
};

const isExpired = (expiryStr) => {
  try {
    const [mm, yyyy] = expiryStr.split("/");
    const expiryDate = new Date(parseInt(yyyy), parseInt(mm) - 1, 28);
    return expiryDate < new Date();
  } catch {
    return false;
  }
};

// ─── Component ────────────────────────────────────────────────────────────────
const MedicineBox = ({ navigation }) => {
  const [medicines, setMedicines] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("active"); // active | inactive
  const [stats, setStats] = useState({
    total: 0,
    lowStock: 0,
    expiringSoon: 0,
  });

  useEffect(() => {
    loadMedicines();
    const unsubscribe = navigation.addListener("focus", loadMedicines);
    return unsubscribe;
  }, [navigation]);

  const loadMedicines = async () => {
    try {
      const userEmail = await AsyncStorage.getItem("currentUser");
      if (!userEmail) return;

      const raw = await AsyncStorage.getItem(`medicines_${userEmail}`);
      const meds = raw ? JSON.parse(raw) : [];
      setMedicines(meds);

      const active = meds.filter((m) => m.active !== false);
      const lowStock = active.filter(
        (m) => m.remainingQuantity <= m.frequencyCount * 3,
      );
      const expiringSoon = active.filter(
        (m) => isExpiryClose(m.expiry) && !isExpired(m.expiry),
      );

      setStats({
        total: active.length,
        lowStock: lowStock.length,
        expiringSoon: expiringSoon.length,
      });

      // Auto alerts for low stock
      for (const med of lowStock) {
        const alerted = await AsyncStorage.getItem(`lowstock_alert_${med.id}`);
        if (!alerted) {
          Alert.alert(
            "⚠️ Low Stock Alert",
            `${med.name} has only ${med.remainingQuantity} doses left. Please order a fresh batch.`,
            [{ text: "Got it" }],
          );
          await AsyncStorage.setItem(`lowstock_alert_${med.id}`, "true");
        }
      }
    } catch (_) {}
  };

  const toggleActive = async (med) => {
    Alert.alert(
      med.active !== false ? "Deactivate Medicine" : "Reactivate Medicine",
      `${med.active !== false ? "Stop" : "Resume"} tracking ${med.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              const userEmail = await AsyncStorage.getItem("currentUser");
              const raw = await AsyncStorage.getItem(`medicines_${userEmail}`);
              const meds = JSON.parse(raw || "[]");
              const idx = meds.findIndex((m) => m.id === med.id);
              if (idx !== -1) {
                meds[idx].active = !(meds[idx].active !== false);
                await AsyncStorage.setItem(
                  `medicines_${userEmail}`,
                  JSON.stringify(meds),
                );
                loadMedicines();
              }
            } catch (_) {}
          },
        },
      ],
    );
  };

  const deleteMedicine = async (med) => {
    Alert.alert(
      "Delete Medicine",
      `Permanently remove ${med.name} and all its history?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const userEmail = await AsyncStorage.getItem("currentUser");
              const raw = await AsyncStorage.getItem(`medicines_${userEmail}`);
              const meds = JSON.parse(raw || "[]").filter(
                (m) => m.id !== med.id,
              );
              await AsyncStorage.setItem(
                `medicines_${userEmail}`,
                JSON.stringify(meds),
              );

              // Remove from history
              const histRaw = await AsyncStorage.getItem(
                `history_${userEmail}`,
              );
              const history = JSON.parse(histRaw || "[]").filter(
                (h) => h.medicineId !== med.id,
              );
              await AsyncStorage.setItem(
                `history_${userEmail}`,
                JSON.stringify(history),
              );

              loadMedicines();
            } catch (_) {}
          },
        },
      ],
    );
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadMedicines();
    setRefreshing(false);
  }, []);

  const filtered = medicines.filter((m) =>
    activeTab === "active" ? m.active !== false : m.active === false,
  );

  const renderCard = ({ item: med }) => {
    const color = DOSE_COLORS[med.doseType] || "#6C63FF";
    const icon = DOSE_TYPE_ICONS[med.doseType] || "pill";
    const expired = isExpired(med.expiry);
    const expiring = isExpiryClose(med.expiry);
    const lowStock = med.remainingQuantity <= med.frequencyCount * 3;
    const stockPercent = Math.min(
      100,
      Math.round((med.remainingQuantity / med.quantity) * 100),
    );

    return (
      <View style={[styles.card, expired && styles.cardExpired]}>
        {/* Top Row */}
        <View style={styles.cardTop}>
          <View style={[styles.iconWrap, { backgroundColor: color + "18" }]}>
            <MaterialCommunityIcons name={icon} size={28} color={color} />
          </View>

          <View style={styles.cardInfo}>
            <Text style={styles.medName}>{med.name}</Text>
            <Text style={styles.medMeta}>
              {med.doseType} · {med.frequency}
            </Text>
          </View>

          <View style={styles.cardActions}>
            <TouchableOpacity
              onPress={() => toggleActive(med)}
              style={styles.actionBtn}
            >
              <MaterialCommunityIcons
                name={
                  med.active !== false
                    ? "pause-circle-outline"
                    : "play-circle-outline"
                }
                size={22}
                color="#9A9BB0"
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => deleteMedicine(med)}
              style={styles.actionBtn}
            >
              <MaterialCommunityIcons
                name="delete-outline"
                size={22}
                color="#FF6B6B"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Dose Timings */}
        <View style={styles.timingsRow}>
          {(med.times || []).map((t, i) => (
            <View
              key={i}
              style={[styles.timeChip, { backgroundColor: color + "15" }]}
            >
              <MaterialCommunityIcons
                name="clock-outline"
                size={11}
                color={color}
              />
              <Text style={[styles.timeChipText, { color }]}> {t}</Text>
            </View>
          ))}
        </View>

        {/* Stock bar */}
        <View style={styles.stockRow}>
          <Text style={styles.stockLabel}>
            Stock: {med.remainingQuantity}/{med.quantity}
          </Text>
          <Text
            style={[
              styles.stockPct,
              { color: lowStock ? "#FF6B6B" : "#4ECDC4" },
            ]}
          >
            {stockPercent}%
          </Text>
        </View>
        <View style={styles.stockBarBg}>
          <View
            style={[
              styles.stockBarFill,
              {
                width: `${stockPercent}%`,
                backgroundColor: lowStock ? "#FF6B6B" : "#4ECDC4",
              },
            ]}
          />
        </View>

        {/* Expiry Row */}
        <View style={styles.expiryRow}>
          <MaterialCommunityIcons
            name={
              expired ? "alert-circle" : expiring ? "alert" : "check-circle"
            }
            size={14}
            color={expired ? "#FF6B6B" : expiring ? "#FFB347" : "#4ECDC4"}
          />
          <Text
            style={[
              styles.expiryText,
              { color: expired ? "#FF6B6B" : expiring ? "#FFB347" : "#9A9BB0" },
            ]}
          >
            {" "}
            Exp: {med.expiry}
            {expired ? "  · EXPIRED" : expiring ? "  · Expiring Soon" : ""}
          </Text>

          {lowStock && !expired && (
            <View style={styles.alertBadge}>
              <Text style={styles.alertBadgeText}>⚠️ Order Now</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

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
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Medicine Box</Text>
          <Text style={styles.subtitle}>All your current & past medicines</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate("LogNewMedicine")}
        >
          <MaterialCommunityIcons name="plus" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={[styles.statNum, { color: "#6C63FF" }]}>
            {stats.total}
          </Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNum, { color: "#FF6B6B" }]}>
            {stats.lowStock}
          </Text>
          <Text style={styles.statLabel}>Low Stock</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNum, { color: "#FFB347" }]}>
            {stats.expiringSoon}
          </Text>
          <Text style={styles.statLabel}>Expiring</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "active" && styles.tabActive]}
          onPress={() => setActiveTab("active")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "active" && styles.tabTextActive,
            ]}
          >
            Active
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "inactive" && styles.tabActive]}
          onPress={() => setActiveTab("inactive")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "inactive" && styles.tabTextActive,
            ]}
          >
            Inactive
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderCard}
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
            <MaterialCommunityIcons
              name="pill-multiple"
              size={60}
              color="#1E2550"
            />
            <Text style={styles.emptyTitle}>No Medicines Here</Text>
            <Text style={styles.emptyText}>
              {activeTab === "active"
                ? "Log a new medicine to get started."
                : "No deactivated medicines."}
            </Text>
            {activeTab === "active" && (
              <TouchableOpacity
                style={styles.emptyBtn}
                onPress={() => navigation.navigate("LogNewMedicine")}
              >
                <Text style={styles.emptyBtnText}>+ Add Medicine</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default MedicineBox;

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

  addBtn: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#6C63FF",
    justifyContent: "center",
    alignItems: "center",
  },

  statsRow: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 22,
    marginBottom: 16,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#13193D",
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1E2550",
  },

  statNum: { fontSize: 24, fontWeight: "800" },
  statLabel: { fontSize: 11, color: "#9A9BB0", marginTop: 3 },

  tabs: {
    flexDirection: "row",
    paddingHorizontal: 22,
    marginBottom: 16,
    gap: 10,
  },

  tab: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#13193D",
    borderWidth: 1,
    borderColor: "#1E2550",
  },

  tabActive: { backgroundColor: "#6C63FF", borderColor: "#6C63FF" },
  tabText: { fontSize: 14, fontWeight: "600", color: "#9A9BB0" },
  tabTextActive: { color: "#fff" },

  listContent: { paddingHorizontal: 22, paddingBottom: 40 },

  card: {
    backgroundColor: "#13193D",
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#1E2550",
  },

  cardExpired: { opacity: 0.65, borderColor: "#FF6B6B30" },

  cardTop: { flexDirection: "row", alignItems: "center", marginBottom: 12 },

  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  cardInfo: { flex: 1 },
  medName: { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },
  medMeta: { fontSize: 12, color: "#9A9BB0", marginTop: 2 },

  cardActions: { flexDirection: "row", gap: 4 },

  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#0D1235",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1E2550",
  },

  timingsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14,
  },

  timeChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  timeChipText: { fontSize: 11, fontWeight: "600" },

  stockRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  stockLabel: { fontSize: 12, color: "#9A9BB0" },
  stockPct: { fontSize: 12, fontWeight: "700" },

  stockBarBg: {
    height: 6,
    backgroundColor: "#0D1235",
    borderRadius: 3,
    marginBottom: 12,
    overflow: "hidden",
  },

  stockBarFill: { height: 6, borderRadius: 3 },

  expiryRow: { flexDirection: "row", alignItems: "center" },
  expiryText: { fontSize: 12, flex: 1 },

  alertBadge: {
    backgroundColor: "#FF6B6B18",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FF6B6B30",
  },

  alertBadgeText: { fontSize: 11, color: "#FF6B6B", fontWeight: "700" },

  empty: { alignItems: "center", paddingTop: 80, gap: 12 },
  emptyTitle: { fontSize: 20, fontWeight: "800", color: "#3D4470" },
  emptyText: { fontSize: 14, color: "#3D4470", textAlign: "center" },

  emptyBtn: {
    marginTop: 8,
    backgroundColor: "#6C63FF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
  },

  emptyBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
