import 'react-native-url-polyfill/auto';
import { AppState, Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';

// Split large session payloads to stay within platform secure-storage limits.
const secureStorage = {
  async getItem(key: string) {
    const count = Number(await SecureStore.getItemAsync(`${key}.count`) || 0);
    if (!count) return null;
    const parts = await Promise.all(Array.from({ length: count }, (_, i) => SecureStore.getItemAsync(`${key}.${i}`)));
    return parts.some(p => p === null) ? null : parts.join('');
  },
  async setItem(key: string, value: string) {
    const oldCount = Number(await SecureStore.getItemAsync(`${key}.count`) || 0);
    const count = Math.ceil(value.length / 1000);
    for (let i = 0; i < count; i++) await SecureStore.setItemAsync(`${key}.${i}`, value.slice(i * 1000, (i + 1) * 1000));
    await SecureStore.setItemAsync(`${key}.count`, String(count));
    for (let i = count; i < oldCount; i++) await SecureStore.deleteItemAsync(`${key}.${i}`);
  },
  async removeItem(key: string) {
    const count = Number(await SecureStore.getItemAsync(`${key}.count`) || 0);
    for (let i = 0; i < count; i++) await SecureStore.deleteItemAsync(`${key}.${i}`);
    await SecureStore.deleteItemAsync(`${key}.count`);
  },
};

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if (!url || !key) throw new Error('Missing Supabase connection. Copy .env.example to .env.');
export const supabase = createClient(url, key, {
  auth: {
    ...(Platform.OS !== 'web' ? { storage: secureStorage } : {}),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
  },
});
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', state => {
    if (state === 'active') supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}
export const AUTH_REDIRECT = 'maucuan://auth/callback';
