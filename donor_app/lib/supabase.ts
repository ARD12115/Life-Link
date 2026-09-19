import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Platform-specific storage adapter
const createStorageAdapter = () => {
  if (Platform.OS === 'web') {
    // Web: use localStorage with JSON serialization
    return {
      getItem: async (key: string) => {
        try {
          const value = localStorage.getItem(key);
          return value;
        } catch {
          return null;
        }
      },
      setItem: async (key: string, value: string) => {
        try {
          localStorage.setItem(key, value);
        } catch {
          // Ignore quota exceeded, etc.
        }
      },
      removeItem: async (key: string) => {
        try {
          localStorage.removeItem(key);
        } catch {
          // Ignore
        }
      },
    };
  }

  // Native: use Expo SecureStore (hardware-encrypted)
  return {
    getItem: (key: string) => SecureStore.getItemAsync(key),
    setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
    removeItem: (key: string) => SecureStore.deleteItemAsync(key),
  };
};

const storageAdapter = createStorageAdapter();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase configuration missing. Ensure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are set');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    storage: storageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Optimization: Tell Supabase when the app goes into the background (native only)
if (Platform.OS !== 'web') {
  const { AppState } = require('react-native');
  AppState.addEventListener('change', (state: string) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}