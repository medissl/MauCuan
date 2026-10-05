import React, { useEffect, useState } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, TextInput, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import Ionicons from '@expo/vector-icons/Ionicons';

export const colors = { bg: '#FAF8F4', ink: '#20251F', muted: '#6D746B', orange: '#F76B24', forest: '#183C2E', pale: '#FFF0DF', sage: '#E7EEDC', line: '#E8E9E1', white: '#FFFFFF' };
export const type = StyleSheet.create({
  title: { fontFamily: 'JakartaExtraBold', color: colors.ink, fontSize: 29, lineHeight: 38, letterSpacing: -1 },
  heading: { fontFamily: 'JakartaBold', color: colors.ink, fontSize: 17, letterSpacing: -.4 },
  body: { fontFamily: 'JakartaRegular', color: colors.muted, fontSize: 13, lineHeight: 21 },
  eyebrow: { fontFamily: 'JakartaBold', color: colors.muted, fontSize: 10, letterSpacing: 1.1 },
  money: { fontFamily: 'JakartaExtraBold', color: colors.ink, fontSize: 31, letterSpacing: -1 },
});
export function Card({ children, tone = 'white', style }: { children: React.ReactNode; tone?: keyof typeof colors; style?: ViewStyle }) {
  return <View style={[styles.card, { backgroundColor: colors[tone] }, style]}>{children}</View>;
}
export function Badge({ text, green = false }: { text: string; green?: boolean }) {
  return <View style={[styles.badge, green && { backgroundColor: '#E3F0E8' }]}><Text style={[styles.badgeText, green && { color: '#28664E' }]}>{text}</Text></View>;
}
export function Button({ text, onPress, secondary = false, disabled = false }: { text: string; onPress: () => void; secondary?: boolean; disabled?: boolean }) {
  return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.button, secondary && styles.secondary, { opacity: disabled ? .5 : pressed ? .8 : 1 }]}><Text style={[styles.buttonText, secondary && { color: colors.ink }]}>{text}</Text></Pressable>;
}
export function LinkButton({ text, onPress }: { text: string; onPress: () => void }) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={{ fontFamily: 'JakartaBold', color: '#B64915', fontSize: 12 }}>{text}</Text></Pressable>;
}
export function Field({ label, value, onChangeText, secure = false, numeric = false, placeholder = '', email = false }: { label: string; value: string; onChangeText: (s: string) => void; secure?: boolean; numeric?: boolean; placeholder?: string; email?: boolean }) {
  return <View style={styles.field}><Text style={type.eyebrow}>{label}</Text><TextInput accessibilityLabel={label} value={value} onChangeText={onChangeText} secureTextEntry={secure} autoCapitalize={secure || email ? 'none' : 'sentences'} autoCorrect={!secure && !email && !numeric} keyboardType={email ? 'email-address' : numeric ? 'number-pad' : 'default'} placeholder={placeholder} placeholderTextColor="#A1A69C" style={styles.input} /></View>;
}
export function Progress({ value }: { value: number }) {
  return <View style={styles.track}><View style={[styles.fill, { width: `${Math.max(0, Math.min(value, 1)) * 100}%` }]} /></View>;
}
export function Header({ title, sub, onBack }: { title: string; sub?: string; onBack?: () => void }) {
  return <View style={{ gap: 10 }}><View style={styles.row}>{onBack && <Pressable accessibilityLabel="Kembali" onPress={onBack} style={styles.back}><Ionicons name="chevron-back" size={23} color={colors.ink} /></Pressable>}<Text style={[type.title, { fontSize: 24 }]}>{title}</Text></View>{sub && <Text style={type.body}>{sub}</Text>}</View>;
}
export function Miko({ size = 210, reduced = false }: { size?: number; reduced?: boolean }) {
  const translate = useState(() => new Animated.Value(0))[0];
  useEffect(() => {
    translate.setValue(0);
    if (reduced) return;
    const loop = Animated.loop(Animated.sequence([Animated.timing(translate, { toValue: -5, duration: 2000, useNativeDriver: true }), Animated.timing(translate, { toValue: 0, duration: 2000, useNativeDriver: true })]));
    loop.start(); return () => loop.stop();
  }, [translate, reduced]);
  return <Animated.View style={{ transform: [{ translateY: translate }] }}><Image source={require('../../assets/miko-v2.png')} accessibilityLabel="Miko, teman macanmu" style={{ width: size, height: size }} resizeMode="contain" /></Animated.View>;
}
export const tabs = [
  { key: 'home', label: 'Beranda', icon: 'home-outline' },
  { key: 'records', label: 'Catatan', icon: 'stats-chart-outline' },
  { key: 'scan', label: 'Scan', icon: 'scan-outline' },
  { key: 'goals', label: 'Target', icon: 'flag-outline' },
  { key: 'pet', label: 'Macan', icon: 'paw-outline' },
] as const;
export function Navigation({ active, onNavigate, bottom }: { active: string; onNavigate: (s: string) => void; bottom: number }) {
  return <BlurView intensity={55} tint="light" style={[styles.nav, { bottom: Math.max(bottom, 14) }]}>{tabs.map(t => <Pressable key={t.key} accessibilityRole="tab" accessibilityState={{ selected: active === t.key }} accessibilityLabel={t.label} onPress={() => onNavigate(t.key)} style={[styles.tab, t.key === 'scan' && styles.scan]}><Ionicons name={t.icon} size={23} color={t.key === 'scan' ? 'white' : active === t.key ? '#B64915' : colors.muted} />{t.key !== 'scan' && <Text style={{ fontFamily: 'JakartaBold', fontSize: 9, color: active === t.key ? '#B64915' : colors.muted }}>{t.label}</Text>}</Pressable>)}</BlurView>;
}
export const styles = StyleSheet.create({
  card: { padding: 18, borderRadius: 24, gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  badge: { backgroundColor: colors.pale, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 30, alignSelf: 'flex-start' },
  badgeText: { fontFamily: 'JakartaBold', color: '#AD440F', fontSize: 10 },
  button: { minHeight: 54, borderRadius: 18, backgroundColor: colors.orange, alignItems: 'center', justifyContent: 'center', padding: 14 },
  secondary: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  buttonText: { fontFamily: 'JakartaBold', color: 'white', fontSize: 14 },
  field: { backgroundColor: 'white', borderWidth: 1, borderColor: colors.line, borderRadius: 18, paddingHorizontal: 16, paddingVertical: 12, gap: 5 },
  input: { fontFamily: 'JakartaSemiBold', fontSize: 15, color: colors.ink, minHeight: 32 },
  track: { height: 7, borderRadius: 8, backgroundColor: colors.line, overflow: 'hidden' },
  fill: { height: 7, borderRadius: 8, backgroundColor: colors.orange },
  back: { height: 44, width: 40, alignItems: 'center', justifyContent: 'center' },
  nav: { position: 'absolute', left: 16, right: 16, height: 70, borderRadius: 28, borderWidth: 1, borderColor: 'white', overflow: 'hidden', backgroundColor: '#FFFFFFC7', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  tab: { minWidth: 52, height: 52, alignItems: 'center', justifyContent: 'center', gap: 4 },
  scan: { backgroundColor: colors.orange, borderRadius: 18 },
});
