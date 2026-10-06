import { Stack } from 'expo-router/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MauCuanProvider } from '../Main';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
export default function RootLayout() {
  return <GestureHandlerRootView style={{ flex: 1 }}><SafeAreaProvider><MauCuanProvider><Stack screenOptions={{ headerShown: false, animation: 'none', contentStyle: { backgroundColor: '#FAF8F4' } }} /></MauCuanProvider></SafeAreaProvider></GestureHandlerRootView>;
}
