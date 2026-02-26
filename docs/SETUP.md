# Task Tracker Expo: End-to-End Setup Guide

This document is formatted for Notion to provide a smooth, step-by-step guide on taking this application from a fresh local clone all the way to production deployment on the App Store and Google Play.

---

## App Overview

**Task Tracker Expo** is a productivity application designed to help users manage their daily tasks, deadlines, and schedule efficiently. It provides authenticated syncing via Supabase, enabling users to maintain their data securely across devices. The app offers an intuitive and fluid user interface built with NativeWind, complete with engaging animations for task management operations.

### App Structure & Tabs

The application features a bottom tab navigation setup with the following primary screens:

- **Tasks (Home):** The main dashboard where users can view, create, edit, and categorize their ongoing tasks. Features a priority task highlight and interactive deletion animations.
- **Calendar:** Provides a visually structured month and day view to see tasks organized by their respective deadlines. Users can quickly assess what is due on any given day.
- **Quotes:** A supplementary tab that offers daily motivational quotes or insights to keep the user inspired while tracking their responsibilities.
- **Profile:** Handles user authentication (Login/Signup via Supabase) and allows users to manage their personal details, track their current login status, and securely sign out.

---

## Tech Stack Overview

- **Framework**: React Native + Expo (SDK 54) & Expo Router
- **Styling**: NativeWind (TailwindCSS) + Custom Animations
- **State Management**: Zustand
- **Backend/Database**: Supabase (Auth, PostgreSQL)
- **Deployment**: Expo Application Services (EAS)

---

## 1. Local Development Setup

### Prerequisites
Before diving in, ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v18 or v20 LTS)
- Git
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (via Xcode) and/or Android Emulator (via Android Studio)

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd task-tracker-expo
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Duplicate the example environment file (if available) or create a new `.env` file in the root directory.
   ```bash
   touch .env
   ```
   Add your Supabase credentials:
   ```env
   EXPO_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
   EXPO_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
   ```

> **Notion Tip:** Keep your `.env` credentials in a secure vault like 1Password and never commit them to GitHub!

---

## 2. Supabase / Database Setup

The app expects specific tables on Supabase (e.g., tasks, profiles, categories). Ensure you have created these.

1. Create a new [Supabase](https://supabase.com/) project.
2. Under **Authentication**, enable standard Email/Password login.
3. Apply your database schema. Typical tables include:
   - `tasks` (id, user_id, title, description, category_id, deadline, completed, created_at)
   - `profiles` (id, user_id, full_name, created_at)
   - `categories` (id, user_id, name, color, created_at)
4. Ensure row-level security (RLS) is configured so users can only access their own data `(user_id = auth.uid())`.

---

## 3. Running the App Locally

Start the local development server using Expo:

```bash
npx expo start
```

**Common shortcuts in the terminal:**
- Press `i` to open the app on the iOS Simulator.
- Press `a` to open the app on the Android Emulator.
- Scan the QR code with the **Expo Go** app on a physical device.

### Native Modules Note:
If you ever add custom native modules (e.g., specialized cameras, custom native SDKs), Expo Go will no longer work. You must switch to a **Development Build**:
```bash
# For iOS Native Build
npx expo run:ios

# For Android Native Build
npx expo run:android
```

---

## 4. Building for Production (EAS Build)

We use **Expo Application Services (EAS)** for compiling our app into iOS (`.ipa`) and Android (`.aab`/`.apk`) binaries without needing local fast machines.

### EAS Initialization
1. Install EAS CLI globally:
   ```bash
   npm install -g eas-cli
   ```
2. Log in to your Expo account:
   ```bash
   eas login
   ```
3. Initialize the project (this links your project to your expo.dev dashboard):
   ```bash
   eas project:init
   ```

### Securing Environment Variables for the Cloud
Your `.env` file is excluded from git and EAS builds. You **must** store your Supabase keys specifically in EAS:

```bash
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "YOUR_SUPABASE_URL"
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "YOUR_SUPABASE_ANON_KEY"
```

### Triggering a Build
Run the following commands to generate production-ready binaries:

- **For iOS:**
  ```bash
  eas build --platform ios --profile production
  ```
- **For Android:**
  ```bash
  eas build --platform android --profile production
  ```

> **iOS Note:** Apple requires an Apple Developer Program membership ($99/yr) before compiling for iOS. EAS will prompt you to log into your Apple ID to handle provisioning profiles for you.

---

## 5. Deployment / App Store Submission

Once your builds finish processing on the Expo servers, you can push them directly to TestFlight and the Google Play Console!

**Submit iOS to App Store Connect:**
```bash
eas submit -p ios
```

**Submit Android to Google Play:**
```bash
eas submit -p android
```

*(EAS CLI will walk you through a small setup to connect your Apple/Google accounts the first time you run this).*

### Testing on TestFlight

Once the iOS build is successfully submitted via EAS, you can distribute it for testing:

1. Log into your [App Store Connect](https://appstoreconnect.apple.com/) dashboard.
2. Navigate to your app and click on the **TestFlight** tab.
3. Your new build should appear under "iOS Builds". It may say "Processing" for 10-20 minutes.
4. Once processing is complete, you may need to click "Manage" next to "Missing Compliance" and state that your app does not use localized encryption.
5. Add internal testers (your team) or create a Public Link to invite external testers.
6. Testers can download the **TestFlight** app from the actual App Store on their devices to install and test your application before launch!

---

## 6. Over-The-Air (OTA) Updates

Found a small typo or adjusting some React logic? You don't need to rebuild the entire binary and wait for App Store approval! Instead, push an Over-The-Air update using EAS Update.

```bash
eas update --branch production --message "Fixed typo on Profile screen"
```
Users will download the update seamlessly the next time they launch the app. *(Note: You cannot push OTA updates if you modified native code setups/installed new native npm packages).*

---
*End of Documentation.*
