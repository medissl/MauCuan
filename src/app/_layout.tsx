import { Stack } from 'expo-router/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MauCuanProvider } from '../Main';
export default function RootLayout() {
  return <SafeAreaProvider><MauCuanProvider><Stack screenOptions={{ headerShown: false, animation: 'none', contentStyle: { backgroundColor: '#FAF8F4' } }} /></MauCuanProvider></SafeAreaProvider>;
}
