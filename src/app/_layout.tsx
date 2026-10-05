import { Slot } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MauCuanProvider } from '../Main';
export default function RootLayout() {
  return <SafeAreaProvider><MauCuanProvider><Slot /></MauCuanProvider></SafeAreaProvider>;
}
