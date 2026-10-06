import { useState } from 'react';
import { Modal, Platform, Pressable, Text, View } from 'react-native';
import { DateTimePicker } from '@expo/ui/community/datetime-picker';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Button, colors, styles, type } from './ui';
import { isValidDate, jakartaDay } from '../lib/finance';
export function localDateKey(date: Date, platform = Platform.OS) {
  // Material's date-only value is midnight UTC; SwiftUI returns local time.
  if (platform === 'android') return date.toISOString().slice(0, 10);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function DateField({ label, value, onChange, clearable = false }: { label: string; value: string; onChange: (value: string) => void; clearable?: boolean }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(new Date());
  const start = () => { setDraft(new Date(`${isValidDate(value) ? value : jakartaDay()}T12:00:00${Platform.OS === 'android' ? 'Z' : ''}`)); setOpen(true); };
  const picker = <DateTimePicker value={draft} mode="date" display={Platform.OS === 'ios' ? 'inline' : 'default'} accentColor={colors.accent} locale="id_ID" themeVariant="light" positiveButton={{ label: 'Pilih tanggal' }} negativeButton={{ label: 'Batal' }} onDismiss={() => setOpen(false)} onValueChange={(_event, date) => { setDraft(date); if (Platform.OS !== 'ios') { onChange(localDateKey(date)); setOpen(false); } }} />;
  return <View style={{ gap: 6 }}><Pressable accessibilityRole="button" accessibilityLabel={`Pilih ${label.toLowerCase()}`} onPress={start} style={styles.field}><Text style={type.body}>{label}</Text><View style={[styles.row, { justifyContent: 'space-between' }]}><Text style={type.heading}>{value ? value.replaceAll('-', ' - ') : 'Pilih tanggal'}</Text><Ionicons name="calendar-outline" size={23} color={colors.accent} /></View></Pressable>{clearable && value && <Pressable accessibilityRole="button" accessibilityLabel="Hapus tanggal target" onPress={() => onChange('')} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={type.body}>Hapus tanggal</Text></Pressable>}{open && (Platform.OS === 'ios' ? <Modal transparent animationType="fade" onRequestClose={() => setOpen(false)}><View style={{ flex: 1, backgroundColor: '#00323E66', justifyContent: 'center', padding: 24 }}><View style={{ backgroundColor: colors.white, padding: 20, borderRadius: 24, gap: 16 }}>{picker}<Button text="Pilih tanggal" onPress={() => { onChange(localDateKey(draft)); setOpen(false); }} /><Button text="Batal" secondary onPress={() => setOpen(false)} /></View></View></Modal> : picker)}</View>;
}
