# Task Tracker App - Installation & EAS Build Guide

This guide outlines the steps to install, run, build, and submit the **Task Tracker Expo** application using Expo Application Services (EAS).

## 1. Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (LTS version recommended)
- **npm** or **yarn**
- **Git**
- **Expo Account**: Create one at [expo.dev](https://expo.dev)

## 2. Initial Setup

### Clone and Install
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd task-tracker-expo
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

### Setup EAS CLI
1. Install the EAS CLI globally:
   ```bash
   npm install -g eas-cli
   ```

2. Log in to your Expo account:
   ```bash
   eas login
   ```

3. Link the project to EAS (if not already linked):
   *Note: This project is already configured with Project ID `d0101d40-1bac-4530-a299-0914cb03c0f6` in `app.json`.*
   ```bash
   eas project:init
   ```

## 3. Local Development

To run the app locally on your simulator or physical device:

```bash
npx expo start
```
- Press `i` to open in iOS Simulator.
- Press `a` to open in Android Emulator.
- Scan the QR code with the Expo Go app on your physical device.

## 4. Building for Production (EAS Build)

### Configure Builds
Ensure `eas.json` is configured in the root directory. A standard configuration usually looks like this:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "autoIncrement": true
    }
  }
}
```

### 4.1 Configure Environment Variables (CRITICAL)
Your local `.env` file is **not** uploaded to EAS Build for security reasons. You must set your environment variables as secrets in EAS.

Run the following commands to set your Supabase credentials (get these values from your `.env` file):

```bash
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "YOUR_SUPABASE_URL"
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "YOUR_SUPABASE_ANON_KEY"
```

*If you skip this step, the production app will fail with network errors because it connect to the placeholder URL.*

### Create a Build
To build the standalone app (IPA for iOS, AAB/APK for Android):

**For Android:**
```bash
eas build --platform android --profile production
```

**For iOS:**
```bash
eas build --platform ios --profile production
```

**For Both:**
```bash
eas build --platform all --profile production
```

*Note: You may be prompted to log in to your Apple Developer Account or Google Play Console account during the build process to handle signing credentials automatically.*

## 5. Submission (EAS Submit)

Once the build is complete, you can submit directly to the app stores.

**Submit to Apple App Store:**
```bash
eas submit -p ios
```

**Submit to Google Play Store:**
```bash
eas submit -p android
```

You will be guided through selecting the specific build you want to submit.

## 6. Over-the-Air Updates (EAS Update)

To push changes to your users without a full store build (for JavaScript/asset changes only):

```bash
eas update --branch production --message "Fixed lion notification logic"
```

## 7. Troubleshooting & Common Issues

- **Assets**: Ensure `assets/images/lion.png` and `lion_icon.png` exist, as they are referenced in `app.json` for app icons and notifications.
- **Project ID**: If you encounter project ID errors, verify the `"extra": { "eas": { "projectId": "..." } }` section in `app.json`.
- **Permissions**: Ensure your `ios.bundleIdentifier` and `android.package` in `app.json` match your entries in the Apple Developer Portal and Google Play Console.
