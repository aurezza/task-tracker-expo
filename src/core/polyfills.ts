import { Platform } from 'react-native';
import 'react-native-url-polyfill/auto';

// Polyfill for window object, primarily for Supabase and other libraries that might expect it
if (Platform.OS !== 'web') {
  // @ts-ignore
  if (typeof window === 'undefined') {
    // @ts-ignore
    global.window = {
        ...global,
        // Add any specific window properties needed here if errors persist
        navigator: {
            ...global.navigator,
            userAgent: 'ReactNative',
        },
    };
  }
}
