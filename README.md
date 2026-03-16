<div align="center">

<img src="https://img.shields.io/badge/MEDTRACK-Smart%20Medicine%20Manager-0EA5B0?style=for-the-badge&logoColor=white&labelColor=1A2235" alt="MedTrack" height="40"/>

# 💊 MEDTRACK
### *Your Personal AI-Powered Medicine Companion*

<br/>

[![Platform](https://img.shields.io/badge/Platform-iOS%20%26%20Android-0EA5B0?style=for-the-badge&logo=expo)](https://expo.dev)
[![License](https://img.shields.io/badge/License-MIT-10B981?style=for-the-badge)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-0EA5B0?style=for-the-badge)](CONTRIBUTING.md)
[![Status](https://img.shields.io/badge/Status-Active-10B981?style=for-the-badge)]()

<br/>

![React Native](https://img.shields.io/badge/React%20Native-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=flat-square&logo=expo&logoColor=white)
![NVIDIA](https://img.shields.io/badge/NVIDIA%20AI-76B900?style=flat-square&logo=nvidia&logoColor=white)
![AsyncStorage](https://img.shields.io/badge/AsyncStorage-0EA5B0?style=flat-square&logoColor=white)

<br/>

> **Scan medicines · Understand them instantly · Never miss a dose again**

<br/>

---

</div>

## 📖 Overview

**MedTrack** is a smart mobile health application that bridges the gap between having medicine and understanding it. Using the power of the **NVIDIA Llama 4 Maverick** vision AI model, users can scan any medicine packet to get a full breakdown of what it is, what it does, and what to watch out for — all in seconds.

The app also acts as a complete **medication schedule manager**, reminding users exactly when to take each medicine, tracking their history, and alerting them before medicines expire.

> 💡 *Built with React Native Expo — runs natively on both iOS and Android from a single codebase.*

<br/>

---

## ✨ Key Features

<br/>

### 🔬 Know Your Medicine — *AI-Powered Analysis*

> Point your camera at any medicine packet — MedTrack does the rest.

| Output | Description |
|---|---|
| 💊 **Medicine Name** | Brand name and generic (active ingredient) |
| 📋 **Use Cases** | Approved therapeutic indications |
| ✅ **Advantages** | Clinical benefits and therapeutic value |
| ⚠️ **Disadvantages** | Side effects, warnings, and contraindications |
| ℹ️ **Important Information** | Dosage guidance, interactions, and storage |

<br/>

### 📅 Log Your Medicine — *Smart Schedule Manager*

Add any medicine with full details:

```
💊  Medicine name
🔢  Tablet count (stock quantity)
📅  Expiry date
⏰  Dosage frequency  →  Once · Twice · 3× · 4× per day · As needed
🕐  Custom timings    →  Set exact dose times per frequency
```

Once logged, MedTrack automatically provides:

- 🔔 **Scheduled Reminders** — Daily push notifications at your exact dose times with actionable *Mark as Taken* and *Ignore* buttons
- 📜 **Dose History** — Full timestamped log of every dose taken or missed
- 📦 **Medicine Box** — Dashboard of all active and inactive medicines with stock indicators
- 📊 **Adherence Tracking** — 7-day adherence rate and consecutive-day streak
- ⏳ **Expiry Alerts** — Automatic warnings when a medicine is approaching its expiry date

<br/>

---

## ⚙️ How It Works

### Know Your Medicine

```
┌─────────────────────────────────────┐
│   User taps "Scan Medicine"         │
│   or "Upload Image"                 │
└──────────────────┬──────────────────┘
                   │
┌──────────────────▼──────────────────┐
│   Image captured / selected         │
│   Camera or Photo Library           │
└──────────────────┬──────────────────┘
                   │
┌──────────────────▼──────────────────┐
│   Image converted to Base64         │
│   Sent to NVIDIA Llama 4 Maverick   │
└──────────────────┬──────────────────┘
                   │
┌──────────────────▼──────────────────┐
│   AI analyses packet text +         │
│   enriches with medical knowledge   │
└──────────────────┬──────────────────┘
                   │
┌──────────────────▼──────────────────┐
│   Structured JSON result returned   │
│   Rendered as full medicine report  │
└─────────────────────────────────────┘
```

### Log Your Medicine

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Step 1      │────▶│  Step 2      │────▶│  Step 3      │
│  Basic Info  │     │  Dose Type   │     │  Timings     │
│  Name/Expiry │     │  Frequency   │     │  Time Picker │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │
                    ┌─────────────────────────────▼──────┐
                    │  Medicine saved to AsyncStorage     │
                    │  Notifications scheduled (daily)   │
                    │  Today's doses seeded to history   │
                    └────────────────────────────────────┘
```

<br/>

---

## 🛠️ Technology Stack

| Technology | Badge | Purpose |
|---|---|---|
| **React Native** | ![React Native](https://img.shields.io/badge/React%20Native-20232A?style=flat-square&logo=react&logoColor=61DAFB) | Cross-platform mobile UI framework |
| **Expo SDK** | ![Expo](https://img.shields.io/badge/Expo-000020?style=flat-square&logo=expo&logoColor=white) | Development, build, and deployment toolchain |
| **React Native Stylesheet** | ![RN](https://img.shields.io/badge/Stylesheet-0EA5B0?style=flat-square) | Component-level styling with design tokens |
| **AsyncStorage** | ![AsyncStorage](https://img.shields.io/badge/AsyncStorage-1A2235?style=flat-square) | On-device persistent data storage |
| **Expo Notifications** | ![Expo](https://img.shields.io/badge/Notifications-000020?style=flat-square&logo=expo&logoColor=white) | Scheduled push notifications with actions |
| **NVIDIA Llama 4 Maverick** | ![NVIDIA](https://img.shields.io/badge/NVIDIA%20AI-76B900?style=flat-square&logo=nvidia&logoColor=white) | Vision AI for medicine image analysis |

<br/>

---

## 📱 Screens & Feature Walkthrough

<details>
<summary><strong>🔐 Authentication Screens</strong></summary>
<br/>

- **Login** — Email/password with session persistence via AsyncStorage
- **Register** — Full name, email, and password with validation
- All user data is stored locally on-device — no external backend required
- Multi-user support: each account is namespaced by email

</details>

<details>
<summary><strong>🏠 Home Dashboard</strong></summary>
<br/>

- Personalised greeting (Good morning / afternoon / evening) with user's first name
- **Active Medicines** count badge
- **Doses Taken Today** counter
- Quick-action cards: *Scan Medicine* → Know Your Medicine module · *Medicine Log* → Log module
- Tip card reminding users to set dose timings for best results

</details>

<details>
<summary><strong>🔬 Know Your Medicine</strong></summary>
<br/>

**Scan Dashboard**
- Animated "How It Works" step cards (Scan → Analyse → Results)
- Two action cards: **Scan Medicine** (live camera) and **Upload Image** (photo library)
- Animated phone mockup with live scan-line demo

**Scanner Screen**
- Full-screen camera view with animated corner brackets and scan line
- Flash toggle, tip chips (Good lighting · Stay focused · Clear text)
- Capture button with press animation
- Live scan label floating below the frame

**AI Result Screen**
- Loading animation with 3-stage step indicators while AI processes
- **Main info card** — Medicine name, generic name, manufacturer, MRP, batch number, MFG and expiry dates
- **Scanned image preview** with "Scanned" badge
- **Info sections** — Uses, Benefits, How It Works, Dosage, Side Effects, Warnings, Contraindications, Interactions, Storage, Disclaimer
- Each section has a colour-coded icon and bullet-point content

</details>

<details>
<summary><strong>📅 Log Your Medicine Module</strong></summary>
<br/>

**Medicine Log Dashboard**
- Today's stats: Doses taken · Pending · Adherence %
- Animated adherence progress bar
- Upcoming doses preview (next 3 doses)
- Quick-action cards: Log New · Dose History · Medicine Box

**Log New Medicine (3-Step Wizard)**
- Step 1 — Medicine name, expiry date (MM/YYYY with inline validation), quantity, and optional notes
- Step 2 — Dose type (Tablet / Capsule / Syrup / Injection / Drops / Inhaler / Patch / Cream) + frequency selector
- Step 3 — Custom time picker for each dose (scrollable hour/minute/AM-PM columns)
- Progress indicator with step labels and animated active state

**Medicine Box**
- Active and Inactive tabs
- Stats bar: Active count · Low Stock · Expiring count
- Per-medicine card: name, dose type, frequency, scheduled timings, stock progress bar, low-stock alert badge, expiry status
- Pause/resume and delete actions per medicine

**Dose History**
- Grouped by date with day-level status (All done / Partial / Missed)
- Per-dose row with stripe, icon, name, time, and "Mark as Taken" / "Done" chip
- **7-day adherence rate** and **consecutive day streak** stat cards
- Filter pills: All · Taken · Missed

</details>

<br/>

---

## 🚀 Installation Guide

### Prerequisites

```bash
node    >= 18.0.0
npm     >= 9.0.0
expo-cli >= 6.0.0   # npm install -g expo-cli
```

> For running on a physical device, install the **Expo Go** app from the App Store or Play Store.
> For production notification features, a standalone development build is required.

### 1 — Clone the repository

```bash
git clone https://github.com/yourusername/medtrack.git
cd medtrack
```

### 2 — Install dependencies

```bash
npm install
```

### 3 — Configure environment variables

Create a `.env` file in the root directory:

```bash
NVIDIA_API_KEY=your_nvidia_api_key
```

> Get your free API key at [build.nvidia.com](https://build.nvidia.com)

### 4 — Start the Expo development server

```bash
npx expo start
```

### 5 — Open on your device

```
📱  Scan the QR code with Expo Go (iOS / Android)
💻  Press  i  to open iOS Simulator
💻  Press  a  to open Android Emulator
```

<br/>

### 🏗️ Build for Production

```bash
# Android APK / AAB
npx expo build:android

# iOS IPA
npx expo build:ios

# Using EAS Build (recommended)
npm install -g eas-cli
eas build --platform all
```

<br/>

---

## 📱 Usage Guide

### Know Your Medicine

```
1.  Tap "Scan Medicine" from the home screen or Know Your Medicine dashboard
2.  Choose "Scan Medicine" for live camera or "Upload Image" for photo library
3.  Point your camera at the back of a medicine packet
4.  Tap the capture button
5.  Wait 3–5 seconds for the AI to analyse the image
6.  Scroll through the full medicine report
```

### Log Your Medicine

```
1.  Tap "Medicine Log" from the home screen
2.  Tap "Log New Medicine"
3.  Step 1 — Enter medicine name, expiry date, quantity, and notes
4.  Step 2 — Select dose type and frequency
5.  Step 3 — Tap each dose time to customise via the time picker
6.  Tap "Save Medicine" — reminders are scheduled immediately
7.  View your medicine in "Medicine Box"
8.  Track your doses in "Dose History"
```

<br/>

---

## 📂 Project Structure

```
medtrack/
├── App.js                        # Root component + notification setup
├── Pages/
│   ├── Intro/
│   │   ├── Login.js
│   │   └── Register.js
│   ├── Home/
│   │   └── Home.js
│   ├── MediLog/
│   │   ├── MediLogDash.js        # Module dashboard
│   │   ├── LogNewMedicine.js     # 3-step wizard
│   │   ├── History.js            # Dose history
│   │   ├── MedicineBox.js        # Inventory
│   │   └── notificationService.js # Centralised notification logic
│   └── MediScan/
│       ├── MedicineScanDash.js   # Know Your Medicine landing
│       ├── Scanner.js            # Camera screen
│       ├── Result.js             # AI result dashboard
│       ├── ScanResult.js         # API caller + analyzeImage()
│       └── config.js             # NVIDIA model configuration
├── Components/
│   └── TextWrapper.js
└── assets/
```

<br/>

---

## 🔮 Future Improvements

| Priority | Feature |
|---|---|
| 🔴 **High** | Cloud sync — backup medicine data to a backend API |
| 🔴 **High** | Family mode — manage medication for multiple family members |
| 🟡 **Medium** | Drug interaction checker — warn when two logged medicines interact |
| 🟡 **Medium** | Refill reminders — notify when stock is running low |
| 🟡 **Medium** | Medicine barcode scanner — scan barcodes for faster logging |
| 🟢 **Low** | Health dashboard — weekly adherence charts and trends |
| 🟢 **Low** | Multi-language support — Hindi, Tamil, and other Indian languages |
| 🟢 **Low** | Apple Health / Google Fit integration |
| 🟢 **Low** | Prescription photo storage alongside each medicine |

<br/>

---

## 🤝 Contributing

We welcome contributions from everyone! Here's how to get involved:

```bash
# 1. Fork the repository
# 2. Create your feature branch
git checkout -b feature/your-feature-name

# 3. Commit your changes using conventional commits
git commit -m "feat: add drug interaction checker"

# 4. Push to your branch
git push origin feature/your-feature-name

# 5. Open a Pull Request — describe what you changed and why
```

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for our code of conduct and contribution guidelines.

<br/>

---

## 📄 License

```
MIT License — Copyright (c) 2025 MedTrack

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software to deal in the Software without restriction.
```

See the full [LICENSE](LICENSE) file for details.

<br/>

---

<div align="center">

**⚕️ Medical Disclaimer**

*MedTrack is designed to help users understand and manage their medications.*
*It is not a substitute for professional medical advice, diagnosis, or treatment.*
*Always consult a qualified healthcare provider before making changes to your medication.*

<br/>

---

Made with ❤️ by the **MedTrack Team**

[![GitHub Stars](https://img.shields.io/github/stars/yourusername/medtrack?style=social)](https://github.com/yourusername/medtrack)
[![Follow](https://img.shields.io/github/followers/yourusername?style=social)](https://github.com/yourusername)

</div>