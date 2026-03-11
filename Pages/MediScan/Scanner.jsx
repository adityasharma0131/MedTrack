import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  Animated,
  Easing,
  StatusBar,
  Platform,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../../Components/TextWrapper";

const { width, height } = Dimensions.get("window");

// ─── Design Tokens ────────────────────────────────────────────────────────────
const palette = {
  deepTeal: "#0B3D35",
  midTeal: "#14675A",
  teal: "#1A8A78",
  brightTeal: "#22C5AC",
  mintGlow: "#6EFCE8",
  coral: "#FF6B6B",
  gold: "#FFD166",
  white: "#FFFFFF",
  black: "#000000",
  overlay: "rgba(0,0,0,0.62)",
};

const FRAME_SIZE = width * 0.72;
const CORNER_LEN = 28;
const CORNER_W = 3.5;

// ─── Component ────────────────────────────────────────────────────────────────
const ScannerScreen = ({ navigation }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [hasPermission, setHasPermission] = useState(null);
  const [flashMode, setFlashMode] = useState("off");
  const [capturing, setCapturing] = useState(false);
  const cameraRef = useRef(null);

  // Animations
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(40)).current;
  const captureScale = useRef(new Animated.Value(1)).current;
  const cornerFlash = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    (async () => {
      const { status } = await requestPermission();
      setHasPermission(status === "granted");
    })();
  }, []);

  useEffect(() => {
    if (hasPermission) {
      // Entrance
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(slideUpAnim, {
          toValue: 0,
          friction: 8,
          tension: 60,
          useNativeDriver: true,
        }),
      ]).start();

      // Scan line loop
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: FRAME_SIZE - 4,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start();

      // Corner pulse
      Animated.loop(
        Animated.sequence([
          Animated.timing(cornerFlash, {
            toValue: 0.4,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(cornerFlash, {
            toValue: 1,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start();

      // Capture button outer ring pulse
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.14,
            duration: 1400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }
  }, [hasPermission]);

  const takePicture = async () => {
    if (!cameraRef.current || capturing) return;
    setCapturing(true);

    // Button press animation
    Animated.sequence([
      Animated.timing(captureScale, {
        toValue: 0.88,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(captureScale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.85,
        base64: false,
      });
      navigation.navigate("MediTrackResult", { imageUri: photo.uri });
    } catch (error) {
      Alert.alert("Error", "Failed to capture image. Please try again.");
    } finally {
      setCapturing(false);
    }
  };

  const toggleFlash = () =>
    setFlashMode((prev) => (prev === "off" ? "on" : "off"));

  // ── Permission: loading ────────────────────────────────────────────────────
  if (hasPermission === null) {
    return (
      <View style={styles.permissionScreen}>
        <MaterialCommunityIcons
          name="camera-outline"
          size={48}
          color={palette.brightTeal}
        />
        <Text style={styles.permissionTitle}>Setting up camera…</Text>
      </View>
    );
  }

  // ── Permission: denied ─────────────────────────────────────────────────────
  if (hasPermission === false) {
    return (
      <View style={styles.permissionScreen}>
        <View style={styles.permissionIconWrap}>
          <MaterialCommunityIcons
            name="camera-off-outline"
            size={44}
            color={palette.coral}
          />
        </View>
        <Text weight="700" style={styles.permissionTitle}>
          Camera Access Needed
        </Text>
        <Text style={styles.permissionSub}>
          Allow camera access to scan your medicine packets
        </Text>
        <TouchableOpacity
          style={styles.permissionBtn}
          onPress={requestPermission}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons
            name="shield-check-outline"
            size={18}
            color={palette.white}
          />
          <Text weight="700" style={styles.permissionBtnText}>
            Grant Permission
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.permissionBack}
        >
          <Text style={styles.permissionBackText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Main Scanner ───────────────────────────────────────────────────────────
  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFillObject}
        facing="back"
        enableTorch={flashMode === "on"}
      >
        {/* ── Dark overlay with transparent cut-out ── */}
        <View style={styles.overlayTop} />
        <View style={styles.overlayMiddleRow}>
          <View style={styles.overlaySide} />

          {/* ── Scan frame ── */}
          <View style={styles.scanFrame}>
            {/* Corner brackets */}
            {[
              {
                top: 0,
                left: 0,
                borderTopWidth: CORNER_W,
                borderLeftWidth: CORNER_W,
                borderBottomWidth: 0,
                borderRightWidth: 0,
                borderTopLeftRadius: 10,
              },
              {
                top: 0,
                right: 0,
                borderTopWidth: CORNER_W,
                borderRightWidth: CORNER_W,
                borderBottomWidth: 0,
                borderLeftWidth: 0,
                borderTopRightRadius: 10,
              },
              {
                bottom: 0,
                left: 0,
                borderBottomWidth: CORNER_W,
                borderLeftWidth: CORNER_W,
                borderTopWidth: 0,
                borderRightWidth: 0,
                borderBottomLeftRadius: 10,
              },
              {
                bottom: 0,
                right: 0,
                borderBottomWidth: CORNER_W,
                borderRightWidth: CORNER_W,
                borderTopWidth: 0,
                borderLeftWidth: 0,
                borderBottomRightRadius: 10,
              },
            ].map((s, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.corner,
                  s,
                  { opacity: cornerFlash, borderColor: palette.brightTeal },
                ]}
              />
            ))}

            {/* Animated scan line */}
            <Animated.View
              style={[
                styles.scanLine,
                { transform: [{ translateY: scanLineAnim }] },
              ]}
            />

            {/* Center crosshair dot */}
            <View style={styles.crosshairDot} />
          </View>

          <View style={styles.overlaySide} />
        </View>
        <View style={styles.overlayBottom} />

        {/* ── Top controls ── */}
        <Animated.View
          style={[
            styles.topControls,
            { opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] },
          ]}
        >
          <TouchableOpacity
            style={styles.ctrlBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
            accessibilityLabel="Close scanner"
          >
            <MaterialCommunityIcons
              name="close"
              size={22}
              color={palette.white}
            />
          </TouchableOpacity>

          <View style={styles.topCenterBadge}>
            <View style={styles.liveDot} />
            <Text weight="700" style={styles.liveBadgeText}>
              LIVE SCAN
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.ctrlBtn, flashMode === "on" && styles.ctrlBtnActive]}
            onPress={toggleFlash}
            activeOpacity={0.8}
            accessibilityLabel="Toggle flash"
          >
            <MaterialCommunityIcons
              name={flashMode === "on" ? "flash" : "flash-off"}
              size={22}
              color={flashMode === "on" ? palette.gold : palette.white}
            />
          </TouchableOpacity>
        </Animated.View>

        {/* ── Frame label ── */}
        <View style={styles.frameLabelRow}>
          <View style={styles.frameLabel}>
            <MaterialCommunityIcons
              name="pill"
              size={13}
              color={palette.brightTeal}
            />
            <Text style={styles.frameLabelText}>Medicine Label</Text>
          </View>
        </View>

        {/* ── Bottom controls ── */}
        <Animated.View
          style={[
            styles.bottomSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: Animated.multiply(slideUpAnim, -1) }],
            },
          ]}
        >
          {/* Tip chips */}
          <View style={styles.tipsRow}>
            {[
              { icon: "lightbulb-on-outline", label: "Good lighting" },
              { icon: "focus-field", label: "Stay focused" },
              { icon: "text-recognition", label: "Clear text" },
            ].map((tip, i) => (
              <View key={i} style={styles.tipChip}>
                <MaterialCommunityIcons
                  name={tip.icon}
                  size={12}
                  color={palette.brightTeal}
                />
                <Text style={styles.tipChipText}>{tip.label}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.instructionText}>
            Align medicine packet inside the frame
          </Text>

          {/* Capture row */}
          <View style={styles.captureRow}>
            {/* Gallery shortcut (visual only placeholder) */}
            <View style={styles.captureRowSide} />

            {/* Capture button */}
            <View style={styles.captureWrapper}>
              <Animated.View
                style={[
                  styles.captureRing,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              />
              <Animated.View style={{ transform: [{ scale: captureScale }] }}>
                <TouchableOpacity
                  style={[
                    styles.captureBtn,
                    capturing && styles.captureBtnActive,
                  ]}
                  onPress={takePicture}
                  activeOpacity={0.85}
                  disabled={capturing}
                  accessibilityLabel="Take photo"
                >
                  <MaterialCommunityIcons
                    name={capturing ? "timer-sand" : "camera"}
                    size={30}
                    color={palette.white}
                  />
                </TouchableOpacity>
              </Animated.View>
            </View>

            {/* Spacer */}
            <View style={styles.captureRowSide} />
          </View>

          <Text style={styles.captureHint}>Tap to capture</Text>
        </Animated.View>
      </CameraView>
    </View>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────
const SIDE_W = (width - FRAME_SIZE) / 2;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.black,
  },

  // ── Permission screens
  permissionScreen: {
    flex: 1,
    backgroundColor: "#0B2B26",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 36,
  },
  permissionIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 28,
    backgroundColor: "rgba(255,107,107,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  permissionTitle: {
    fontSize: 22,
    color: palette.white,
    marginTop: 16,
    marginBottom: 10,
    textAlign: "center",
  },
  permissionSub: {
    fontSize: 14,
    color: "rgba(255,255,255,0.55)",
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 32,
  },
  permissionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: palette.brightTeal,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 28,
    shadowColor: palette.brightTeal,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  permissionBtnText: {
    color: palette.white,
    fontSize: 15,
  },
  permissionBack: {
    marginTop: 18,
  },
  permissionBackText: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 13,
  },

  // ── Overlay panels
  overlayTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: (height - FRAME_SIZE) / 2,
    backgroundColor: palette.overlay,
  },
  overlayMiddleRow: {
    position: "absolute",
    top: (height - FRAME_SIZE) / 2,
    left: 0,
    right: 0,
    height: FRAME_SIZE,
    flexDirection: "row",
  },
  overlaySide: {
    width: SIDE_W,
    backgroundColor: palette.overlay,
  },
  overlayBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    top: (height - FRAME_SIZE) / 2 + FRAME_SIZE,
    backgroundColor: palette.overlay,
  },

  // ── Scan frame
  scanFrame: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  corner: {
    position: "absolute",
    width: CORNER_LEN,
    height: CORNER_LEN,
  },
  scanLine: {
    position: "absolute",
    top: 0,
    left: 10,
    right: 10,
    height: 2,
    backgroundColor: palette.brightTeal,
    shadowColor: palette.mintGlow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    borderRadius: 1,
  },
  crosshairDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: palette.brightTeal,
    opacity: 0.7,
    shadowColor: palette.mintGlow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },

  // ── Frame label (floats just below the frame)
  frameLabelRow: {
    position: "absolute",
    top: (height - FRAME_SIZE) / 2 + FRAME_SIZE + 12,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  frameLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(34,197,172,0.15)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "rgba(34,197,172,0.3)",
  },
  frameLabelText: {
    fontSize: 11,
    color: palette.brightTeal,
    fontWeight: "600",
    letterSpacing: 0.4,
  },

  // ── Top controls
  topControls: {
    position: "absolute",
    top: Platform.OS === "ios" ? 56 : 44,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  ctrlBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  ctrlBtnActive: {
    backgroundColor: "rgba(255,209,102,0.18)",
    borderColor: "rgba(255,209,102,0.4)",
  },
  topCenterBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: palette.coral,
    shadowColor: palette.coral,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  liveBadgeText: {
    fontSize: 11,
    color: palette.white,
    letterSpacing: 1.2,
  },

  // ── Bottom section
  bottomSection: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingBottom: Platform.OS === "ios" ? 44 : 28,
    paddingTop: 20,
    paddingHorizontal: 24,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderTopWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
  },
  tipsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  tipChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(34,197,172,0.12)",
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: "rgba(34,197,172,0.22)",
  },
  tipChipText: {
    fontSize: 10,
    color: palette.brightTeal,
    fontWeight: "600",
  },
  instructionText: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    letterSpacing: 0.2,
    marginBottom: 22,
  },
  captureRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginBottom: 10,
  },
  captureRowSide: {
    flex: 1,
  },
  captureWrapper: {
    alignItems: "center",
    justifyContent: "center",
    width: 84,
    height: 84,
  },
  captureRing: {
    position: "absolute",
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2,
    borderColor: "rgba(34,197,172,0.45)",
  },
  captureBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: palette.teal,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: palette.white,
    shadowColor: palette.brightTeal,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 14,
    elevation: 10,
  },
  captureBtnActive: {
    backgroundColor: palette.midTeal,
  },
  captureHint: {
    fontSize: 11,
    color: "rgba(255,255,255,0.38)",
    letterSpacing: 0.5,
  },
});

export default ScannerScreen;
