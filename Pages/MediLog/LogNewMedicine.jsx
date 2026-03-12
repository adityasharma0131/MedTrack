import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Text } from "../../Components/TextWrapper";
// ─── Detect Expo Go ───────────────────────────────────────────────────────────
const isExpoGo = Constants.appOwnership === "expo";

// ─── Constants ────────────────────────────────────────────────────────────────
const DOSE_TYPES = [
  { label: "Tablet", icon: "pill" },
  { label: "Capsule", icon: "pill-multiple" },
  { label: "Syrup", icon: "bottle-tonic-outline" },
  { label: "Injection", icon: "needle" },
  { label: "Drops", icon: "water-outline" },
  { label: "Inhaler", icon: "air-filter" },
  { label: "Patch", icon: "bandage" },
  { label: "Cream", icon: "lotion-outline" },
];

const DOSE_FREQUENCIES = [
  { label: "Once a day", count: 1 },
  { label: "Twice a day", count: 2 },
  { label: "3 times a day", count: 3 },
  { label: "4 times a day", count: 4 },
  { label: "Every 6 hours", count: 4 },
  { label: "Every 8 hours", count: 3 },
  { label: "As needed", count: 0 },
];

const DEFAULT_TIMES = {
  0: [],
  1: ["08:00 AM"],
  2: ["08:00 AM", "08:00 PM"],
  3: ["08:00 AM", "02:00 PM", "08:00 PM"],
  4: ["08:00 AM", "12:00 PM", "04:00 PM", "08:00 PM"],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const parseTime = (timeStr) => {
  try {
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;
    return { hours, minutes };
  } catch {
    return { hours: 8, minutes: 0 };
  }
};

// Notification display behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Create Android notification channel
async function setupNotificationChannel() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("medicine-reminders", {
      name: "Medicine Reminders",
      importance: Notifications.AndroidImportance.HIGH,
      sound: true,
      vibrationPattern: [0, 250, 250, 250],
    });
  }
}

// Ask notification permission
async function requestNotificationPermission() {
  if (isExpoGo) return false;

  const { status } = await Notifications.getPermissionsAsync();

  if (status !== "granted") {
    const result = await Notifications.requestPermissionsAsync();
    return result.status === "granted";
  }

  return true;
}
// ─── Component ────────────────────────────────────────────────────────────────
const LogNewMedicine = ({ navigation }) => {
  const [name, setName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [selectedDoseType, setSelectedDoseType] = useState(null);
  const [selectedFrequency, setSelectedFrequency] = useState(null);
  const [times, setTimes] = useState([]);
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [step, setStep] = useState(1);

  const handleFrequencySelect = (freq) => {
    setSelectedFrequency(freq);
    setTimes(DEFAULT_TIMES[freq.count] || []);
  };

  const updateTime = (index, value) => {
    const updated = [...times];
    updated[index] = value;
    setTimes(updated);
  };

  // Safe: only runs in dev build, silently skips in Expo Go
  const scheduleNotifications = async (medicine) => {
    if (isExpoGo) return [];

    try {
      const permission = await requestNotificationPermission();

      if (!permission) {
        console.warn("Notification permission denied");
        return [];
      }

      await setupNotificationChannel();

      const ids = [];

      for (const time of medicine.times) {
        const { hours, minutes } = parseTime(time);

        const now = new Date();
        const triggerDate = new Date();

        triggerDate.setHours(hours);
        triggerDate.setMinutes(minutes);
        triggerDate.setSeconds(0);

        // If scheduled time already passed today → move to tomorrow
        if (triggerDate <= now) {
          triggerDate.setDate(triggerDate.getDate() + 1);
        }

        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title: "💊 Medicine Reminder",
            body: `Time to take your ${medicine.name} (${medicine.doseType})`,
            sound: true,
            priority: Notifications.AndroidNotificationPriority.HIGH,
            data: {
              medicineId: medicine.id,
              medicineName: medicine.name,
            },
          },

          trigger: {
            type: "daily",
            hour: hours,
            minute: minutes,
            channelId: "medicine-reminders",
          },
        });

        ids.push(id);
      }

      return ids;
    } catch (err) {
      console.warn("Notification scheduling error:", err);
      return [];
    }
  };

  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  }, []);

  const seedTodayHistory = async (userEmail, medicine) => {
    if (!medicine.times.length) return;
    const historyRaw = await AsyncStorage.getItem(`history_${userEmail}`);
    const history = historyRaw ? JSON.parse(historyRaw) : [];
    const today = new Date();

    for (const time of medicine.times) {
      const { hours, minutes } = parseTime(time);
      const scheduled = new Date(today);
      scheduled.setHours(hours, minutes, 0, 0);
      history.push({
        id: `${medicine.id}_${time}_${today.toDateString()}`,
        medicineId: medicine.id,
        medicineName: medicine.name,
        doseType: medicine.doseType,
        time,
        scheduledTime: scheduled.toISOString(),
        taken: false,
        takenAt: null,
      });
    }
    await AsyncStorage.setItem(`history_${userEmail}`, JSON.stringify(history));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Required", "Please enter the medicine name.");
      return;
    }
    if (!selectedDoseType) {
      Alert.alert("Required", "Please select a dose type.");
      return;
    }
    if (!selectedFrequency) {
      Alert.alert("Required", "Please select a dosage frequency.");
      return;
    }
    if (!quantity.trim()) {
      Alert.alert("Required", "Please enter the quantity.");
      return;
    }
    if (!expiry.trim()) {
      Alert.alert("Required", "Please enter the expiry date.");
      return;
    }

    setLoading(true);
    try {
      const userEmail = await AsyncStorage.getItem("currentUser");
      if (!userEmail) {
        Alert.alert("Session Error", "Please log in again.");
        return;
      }

      const medsRaw = await AsyncStorage.getItem(`medicines_${userEmail}`);
      const meds = medsRaw ? JSON.parse(medsRaw) : [];

      const newMed = {
        id: Date.now().toString(),
        name: name.trim(),
        expiry: expiry.trim(),
        doseType: selectedDoseType.label,
        doseTypeIcon: selectedDoseType.icon,
        frequency: selectedFrequency.label,
        frequencyCount: selectedFrequency.count,
        times,
        quantity: parseInt(quantity) || 0,
        remainingQuantity: parseInt(quantity) || 0,
        notes: notes.trim(),
        active: true,
        startDate: new Date().toISOString(),
        notificationIds: [],
      };

      newMed.notificationIds = await scheduleNotifications(newMed);
      meds.push(newMed);

      await AsyncStorage.setItem(
        `medicines_${userEmail}`,
        JSON.stringify(meds),
      );
      await seedTodayHistory(userEmail, newMed);

      const msg = isExpoGo
        ? `${name} logged successfully!\n\n📲 Daily reminders need a development build — timings are saved and will activate automatically.`
        : `${name} logged with ${times.length} daily reminder(s) scheduled.`;

      Alert.alert("Medicine Added! 🎉", msg, [
        { text: "Got it!", onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert("Error", "Failed to save. Please try again.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // ─── Step renders ─────────────────────────────────────────────────────────
  const renderStep1 = () => (
    <>
      <Text style={styles.stepTitle}>Basic Information</Text>

      {[
        {
          field: "name",
          icon: "pill",
          label: "Medicine Name *",
          placeholder: "e.g. Paracetamol 500mg",
          value: name,
          setter: setName,
          kb: "default",
        },
        {
          field: "expiry",
          icon: "calendar-remove-outline",
          label: "Expiry Date *",
          placeholder: "MM/YYYY",
          value: expiry,
          setter: setExpiry,
          kb: "default",
        },
        {
          field: "qty",
          icon: "counter",
          label: "Quantity in Stock *",
          placeholder: "e.g. 30",
          value: quantity,
          setter: setQuantity,
          kb: "numeric",
        },
      ].map(({ field, icon, label, placeholder, value, setter, kb }) => (
        <View key={field}>
          <View style={styles.inputLabel}>
            <MaterialCommunityIcons name={icon} size={16} color="#6C63FF" />
            <Text style={styles.labelText}> {label}</Text>
          </View>
          <View
            style={[
              styles.inputContainer,
              focusedField === field && styles.inputFocused,
            ]}
          >
            <TextInput
              style={styles.input}
              placeholder={placeholder}
              placeholderTextColor="#9A9BB0"
              value={value}
              onChangeText={setter}
              keyboardType={kb}
              onFocus={() => setFocusedField(field)}
              onBlur={() => setFocusedField(null)}
            />
          </View>
        </View>
      ))}

      <View style={styles.inputLabel}>
        <MaterialCommunityIcons
          name="note-text-outline"
          size={16}
          color="#6C63FF"
        />
        <Text style={styles.labelText}> Notes (optional)</Text>
      </View>
      <View
        style={[
          styles.inputContainer,
          styles.textArea,
          focusedField === "notes" && styles.inputFocused,
        ]}
      >
        <TextInput
          style={[styles.input, { textAlignVertical: "top" }]}
          placeholder="e.g. Take after food, with water"
          placeholderTextColor="#9A9BB0"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          onFocus={() => setFocusedField("notes")}
          onBlur={() => setFocusedField(null)}
        />
      </View>
    </>
  );

  const renderStep2 = () => (
    <>
      <Text style={styles.stepTitle}>Dose Type</Text>
      <View style={styles.doseTypeGrid}>
        {DOSE_TYPES.map((dt) => (
          <TouchableOpacity
            key={dt.label}
            style={[
              styles.doseTypeBtn,
              selectedDoseType?.label === dt.label && styles.doseTypeBtnActive,
            ]}
            onPress={() => setSelectedDoseType(dt)}
          >
            <MaterialCommunityIcons
              name={dt.icon}
              size={24}
              color={
                selectedDoseType?.label === dt.label ? "#6C63FF" : "#9A9BB0"
              }
            />
            <Text
              style={[
                styles.doseTypeLbl,
                selectedDoseType?.label === dt.label &&
                  styles.doseTypeLblActive,
              ]}
            >
              {dt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.stepTitle, { marginTop: 24 }]}>Frequency</Text>
      {DOSE_FREQUENCIES.map((freq) => (
        <TouchableOpacity
          key={freq.label}
          style={[
            styles.freqBtn,
            selectedFrequency?.label === freq.label && styles.freqBtnActive,
          ]}
          onPress={() => handleFrequencySelect(freq)}
        >
          <Text
            style={[
              styles.freqLabel,
              selectedFrequency?.label === freq.label && styles.freqLabelActive,
            ]}
          >
            {freq.label}
          </Text>
          {selectedFrequency?.label === freq.label && (
            <MaterialCommunityIcons
              name="check-circle"
              size={20}
              color="#6C63FF"
            />
          )}
        </TouchableOpacity>
      ))}
    </>
  );

  const renderStep3 = () => (
    <>
      <Text style={styles.stepTitle}>Dose Timings</Text>
      <Text style={styles.stepSubtitle}>
        Customize the time for each dose. Reminders activate daily at these
        times.
      </Text>

      {/* Info banner inside Expo Go */}
      {isExpoGo && (
        <View style={styles.expoGoNote}>
          <MaterialCommunityIcons
            name="information-outline"
            size={16}
            color="#48CAE4"
          />
          <Text style={styles.expoGoNoteText}>
            {"  "}Push reminders need a{" "}
            <Text style={{ fontWeight: "800" }}>development build</Text>.{" "}
            Timings are saved and will activate once you switch.
          </Text>
        </View>
      )}

      {times.length === 0 ? (
        <View style={styles.emptyTimings}>
          <MaterialCommunityIcons
            name="clock-outline"
            size={40}
            color="#3D4470"
          />
          <Text style={styles.emptyTimingsText}>
            No fixed timings for this frequency.
          </Text>
        </View>
      ) : (
        times.map((time, i) => (
          <View key={i} style={styles.timingRow}>
            <View style={styles.timingDot}>
              <Text style={styles.timingDotText}>{i + 1}</Text>
            </View>
            <Text style={styles.timingLabel}>Dose {i + 1}</Text>
            <View style={styles.timingInputWrap}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={16}
                color="#6C63FF"
              />
              <TextInput
                style={styles.timingInput}
                value={time}
                onChangeText={(v) => updateTime(i, v)}
                placeholder="08:00 AM"
                placeholderTextColor="#9A9BB0"
              />
            </View>
          </View>
        ))
      )}

      {!isExpoGo && times.length > 0 && (
        <View style={styles.notifNote}>
          <MaterialCommunityIcons
            name="bell-ring-outline"
            size={18}
            color="#FFB347"
          />
          <Text style={styles.notifNoteText}>
            {"  "}Push notifications will be sent at these times every day.
          </Text>
        </View>
      )}
    </>
  );

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0F2C" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <MaterialCommunityIcons name="arrow-left" size={22} color="#9A9BB0" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Log New Medicine</Text>
          <Text style={styles.headerSub}>Step {step} of 3</Text>
        </View>
      </View>

      {/* Step dots */}
      <View style={styles.stepIndicator}>
        {[1, 2, 3].map((s) => (
          <View
            key={s}
            style={[styles.stepDot, step >= s && styles.stepDotActive]}
          >
            {step > s ? (
              <MaterialCommunityIcons name="check" size={12} color="#fff" />
            ) : (
              <Text style={[styles.stepNum, step >= s && styles.stepNumActive]}>
                {s}
              </Text>
            )}
          </View>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </View>
      </ScrollView>

      <View style={styles.bottomNav}>
        {step > 1 && (
          <TouchableOpacity
            style={styles.prevBtn}
            onPress={() => setStep(step - 1)}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={20}
              color="#9A9BB0"
            />
            <Text style={styles.prevBtnText}> Back</Text>
          </TouchableOpacity>
        )}
        {step < 3 ? (
          <TouchableOpacity
            style={[styles.nextBtn, step === 1 && { flex: 1 }]}
            onPress={() => setStep(step + 1)}
          >
            <Text style={styles.nextBtnText}>Continue</Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.nextBtn, { flex: 1 }]}
            onPress={handleSave}
            disabled={loading}
          >
            <MaterialCommunityIcons
              name={loading ? "loading" : "check"}
              size={20}
              color="#fff"
            />
            <Text style={styles.nextBtnText}>
              {" "}
              {loading ? "Saving..." : "Save Medicine"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

export default LogNewMedicine;

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

  headerTitle: { fontSize: 20, fontWeight: "800", color: "#FFFFFF" },
  headerSub: { fontSize: 12, color: "#9A9BB0" },

  stepIndicator: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
    paddingHorizontal: 22,
  },

  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#13193D",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1E2550",
  },
  stepDotActive: { backgroundColor: "#6C63FF", borderColor: "#6C63FF" },
  stepNum: { fontSize: 13, fontWeight: "700", color: "#9A9BB0" },
  stepNumActive: { color: "#fff" },

  scroll: { paddingHorizontal: 22, paddingBottom: 110 },

  card: {
    backgroundColor: "#13193D",
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: "#1E2550",
  },

  stepTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 14,
  },
  stepSubtitle: {
    fontSize: 13,
    color: "#9A9BB0",
    marginBottom: 18,
    lineHeight: 19,
  },

  inputLabel: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  labelText: { fontSize: 13, color: "#9A9BB0", fontWeight: "600" },

  inputContainer: {
    backgroundColor: "#0D1235",
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 18,
    height: 52,
    borderWidth: 1,
    borderColor: "#1E2550",
    justifyContent: "center",
  },
  textArea: { height: 90, paddingTop: 12 },
  inputFocused: { borderColor: "#6C63FF" },
  input: { fontSize: 15, color: "#FFFFFF", flex: 1 },

  doseTypeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },

  doseTypeBtn: {
    width: "22%",
    aspectRatio: 1,
    backgroundColor: "#0D1235",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1E2550",
    gap: 6,
  },
  doseTypeBtnActive: { borderColor: "#6C63FF", backgroundColor: "#6C63FF18" },
  doseTypeLbl: { fontSize: 10, color: "#9A9BB0", textAlign: "center" },
  doseTypeLblActive: { color: "#6C63FF", fontWeight: "700" },

  freqBtn: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#0D1235",
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 50,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#1E2550",
  },
  freqBtnActive: { borderColor: "#6C63FF", backgroundColor: "#6C63FF12" },
  freqLabel: { fontSize: 14, color: "#9A9BB0" },
  freqLabelActive: { color: "#FFFFFF", fontWeight: "600" },

  expoGoNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#48CAE412",
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#48CAE430",
  },
  expoGoNoteText: { fontSize: 13, color: "#48CAE4", flex: 1, lineHeight: 19 },

  timingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 12,
  },

  timingDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#6C63FF",
    justifyContent: "center",
    alignItems: "center",
  },
  timingDotText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  timingLabel: { flex: 1, fontSize: 14, color: "#FFFFFF", fontWeight: "600" },

  timingInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0D1235",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: "#1E2550",
    gap: 6,
  },
  timingInput: { fontSize: 14, color: "#FFFFFF", width: 90 },

  emptyTimings: { alignItems: "center", paddingVertical: 30, gap: 10 },
  emptyTimingsText: { fontSize: 14, color: "#3D4470" },

  notifNote: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFB34712",
    borderRadius: 14,
    padding: 14,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#FFB34730",
  },
  notifNoteText: { fontSize: 13, color: "#FFB347", flex: 1 },

  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    gap: 12,
    padding: 20,
    backgroundColor: "#0A0F2C",
    borderTopWidth: 1,
    borderTopColor: "#1E2550",
  },

  prevBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#13193D",
    borderRadius: 14,
    paddingHorizontal: 18,
    height: 54,
    borderWidth: 1,
    borderColor: "#1E2550",
  },
  prevBtnText: { color: "#9A9BB0", fontWeight: "600", fontSize: 15 },

  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6C63FF",
    borderRadius: 14,
    height: 54,
    flex: 1,
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  nextBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
