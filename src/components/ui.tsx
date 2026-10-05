import React, { useEffect, useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View, ViewStyle } from 'react-native';
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { currencyInput, formatAmountInput } from '../lib/finance';
import Ionicons from '@expo/vector-icons/Ionicons';

export const colors = { bg: '#FAF8F4', ink: '#123D43', muted: '#62767A', orange: '#F76B24', teal: '#123D43', accent: '#08A4B8', pale: '#FFF0DF', mist: '#E3F2F3', line: '#DCE5E6', white: '#FFFFFF', positive: '#19616C', onTealMuted: '#C1E4E8' };
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
export function Badge({ text, positive = false }: { text: string; positive?: boolean }) {
  return <View style={[styles.badge, positive && { backgroundColor: colors.mist }]}><Text style={[styles.badgeText, positive && { color: colors.positive }]}>{text}</Text></View>;
}
export function Button({ text, onPress, secondary = false, disabled = false }: { text: string; onPress: () => void; secondary?: boolean; disabled?: boolean }) {
  return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.button, secondary && styles.secondary, { opacity: disabled ? .5 : pressed ? .8 : 1 }]}><Text style={[styles.buttonText, secondary && { color: colors.ink }]}>{text}</Text></Pressable>;
}
export function LinkButton({ text, onPress }: { text: string; onPress: () => void }) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={{ fontFamily: 'JakartaBold', color: '#B64915', fontSize: 12 }}>{text}</Text></Pressable>;
}
export function Field({ label, value, onChangeText, secure = false, numeric = false, currency = false, code = false, placeholder = '', email = false }: { label: string; value: string; onChangeText: (s: string) => void; secure?: boolean; numeric?: boolean; currency?: boolean; code?: boolean; placeholder?: string; email?: boolean }) {
  return <View style={styles.field}><Text style={[type.body, { fontSize: 12 }]}>{label}</Text><View style={styles.row}>{currency && <Text style={[type.heading, { color: colors.muted }]}>Rp</Text>}<TextInput accessibilityLabel={currency ? `${label}, rupiah` : label} value={currency ? formatAmountInput(value) : value} onChangeText={text => onChangeText(currency ? currencyInput(value, text) : code ? text.replace(/\D/g, '').slice(0, 8) : text)} secureTextEntry={secure} autoCapitalize={secure || email || code ? 'none' : 'sentences'} autoCorrect={!secure && !email && !numeric && !currency && !code} keyboardType={email ? 'email-address' : numeric || currency || code ? 'number-pad' : 'default'} autoComplete={code ? 'one-time-code' : email ? 'email' : undefined} maxLength={code ? 8 : undefined} placeholder={currency ? formatAmountInput(placeholder) : placeholder} placeholderTextColor="#A1A69C" style={[styles.input, { flex: 1 }, currency && { fontVariant: ['tabular-nums'], fontSize: 20 }]} /></View></View>;
}
export function Progress({ value }: { value: number }) {
  return <View style={styles.track}><View style={[styles.fill, { width: `${Math.max(0, Math.min(value, 1)) * 100}%` }]} /></View>;
}
export function Header({ title, sub, onBack }: { title: string; sub?: string; onBack?: () => void }) {
  return <View style={{ gap: 10 }}><View style={styles.row}>{onBack && <Pressable accessibilityLabel="Kembali" onPress={onBack} style={styles.back}><Ionicons name="chevron-back" size={23} color={colors.ink} /></Pressable>}<Text style={[type.title, { fontSize: 24 }]}>{title}</Text></View>{sub && <Text style={type.body}>{sub}</Text>}</View>;
}
const petImages = { idle: require('../../assets/miko/miko-pet-idle.png'), happy: require('../../assets/miko/miko-pet-happy.png'), wink: require('../../assets/miko/miko-pet-wink.png'), focused: require('../../assets/miko/miko-pet-focused.png'), rest: require('../../assets/miko/miko-pet-rest.png') };
export type PetMood = keyof typeof petImages;
export function Miko({ size = 210, reduced = false, mood = 'idle', interactive = false, onPress }: { size?: number; reduced?: boolean; mood?: PetMood; interactive?: boolean; onPress?: () => void }) {
  const systemReduced = useReducedMotion();
  const translate = useSharedValue(0);
  const [greeting, setGreeting] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    translate.set(0);
    if (!reduced && !systemReduced) translate.set(withRepeat(withTiming(-3, { duration: 2200, easing: Easing.inOut(Easing.ease) }), -1, true));
    return () => cancelAnimation(translate);
  }, [translate, reduced, systemReduced]);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const motion = useAnimatedStyle(() => ({ transform: [{ translateY: translate.get() }] }));
  const picture = <Animated.View style={motion}><Image source={petImages[greeting ? 'wink' : mood]} accessibilityLabel="Miko, teman macan tutulmu" style={{ width: size, height: size }} resizeMode="contain" /></Animated.View>;
  return interactive || onPress ? <Pressable accessibilityRole="button" accessibilityLabel={onPress ? 'Buka habitat Miko' : 'Sapa Miko'} onPress={() => { if (onPress) return onPress(); if (timer.current) clearTimeout(timer.current); setGreeting(true); timer.current = setTimeout(() => setGreeting(false), 2400); }} style={({ pressed }) => ({ opacity: pressed ? .85 : 1 })}>{picture}</Pressable> : picture;
}
export const tabs = [
  { key: 'home', label: 'Beranda', icon: 'home-outline' },
  { key: 'records', label: 'Catatan', icon: 'stats-chart-outline' },
  { key: 'scan', label: 'Scan', icon: 'scan-outline' },
  { key: 'goals', label: 'Target', icon: 'flag-outline' },
  { key: 'pet', label: 'Macan', icon: 'paw-outline' },
] as const;
export function Navigation({ active, onNavigate, bottom }: { active: string; onNavigate: (s: string) => void; bottom: number }) {
  return <View style={[styles.nav, { bottom: Math.max(bottom, 14) }]}>{tabs.map(t => <Pressable key={t.key} accessibilityRole="tab" accessibilityState={{ selected: active === t.key }} accessibilityLabel={t.label} onPress={() => onNavigate(t.key)} style={({ pressed }) => [styles.tab, t.key === 'scan' && styles.scan, { opacity: pressed ? .65 : 1 }]}><Ionicons name={t.icon} size={23} color={t.key === 'scan' ? 'white' : active === t.key ? '#B64915' : colors.muted} />{t.key !== 'scan' && <Text style={{ fontFamily: 'JakartaBold', fontSize: 9, color: active === t.key ? '#B64915' : colors.muted }}>{t.label}</Text>}</Pressable>)}</View>;
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
  fill: { height: 7, borderRadius: 8, backgroundColor: colors.accent },
  back: { height: 44, width: 40, alignItems: 'center', justifyContent: 'center' },
  nav: { position: 'absolute', left: 16, right: 16, height: 70, borderRadius: 28, borderWidth: 1, borderColor: colors.line, overflow: 'hidden', backgroundColor: 'white', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  tab: { minWidth: 52, height: 52, alignItems: 'center', justifyContent: 'center', gap: 4 },
  scan: { backgroundColor: colors.orange, borderRadius: 18 },
});
