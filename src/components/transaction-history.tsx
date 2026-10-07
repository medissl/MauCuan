import { useState, type ReactNode } from 'react';
import { Pressable, Text, View, useWindowDimensions } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Host, BottomSheet, Column, Row, Button as NativeButton, Text as NativeText } from '@expo/ui';
import { monthDays, monthLabel, dayStatus } from '../lib/calendar';
import { money, readableDay, type Transaction } from '../lib/finance';
import { Card, colors, type, styles } from './ui';
const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
export function TransactionHistory({ transactions, today, renderEntry }: { transactions: Transaction[]; today: string; renderEntry: (t: Transaction) => ReactNode }) {
  const [month, setMonth] = useState(today.slice(0, 7)), [selected, setSelected] = useState(today);
  const [filter, setFilter] = useState('all');
  const [picker, setPicker] = useState(false), [year, setYear] = useState(Number(month.slice(0, 4)));
  const width = Math.min(useWindowDimensions().width - 48, 500);
  const entries = transactions.filter(t => t.occurred_on.startsWith(month));
  const filtered = entries.filter(t => filter === 'all' || t.kind === filter);
  const { offset, days } = monthDays(month);
  const chosen = filtered.filter(t => t.occurred_on === selected);
  return <>
    <View style={[styles.row, { justifyContent: 'space-between' }]}>
      <Pressable accessibilityRole="button" accessibilityLabel="Pilih bulan catatan" onPress={() => { setYear(Number(month.slice(0, 4))); setPicker(true); }} style={{ minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 8 }}><Text style={type.heading}>{monthLabel(month)}</Text><Ionicons name="chevron-down" size={16} color={colors.accent} /></Pressable>
    </View>
    <Card><Text style={type.body}>{entries.length} catatan di bulan ini</Text><View style={[styles.row, { justifyContent: 'space-between' }]}><View><Text style={type.body}>Masuk</Text><Text style={type.heading}>{money(entries.filter(t => t.kind === 'income').reduce((n, t) => n + Number(t.amount), 0))}</Text></View><View><Text style={type.body}>Keluar</Text><Text style={type.heading}>{money(entries.filter(t => t.kind === 'expense').reduce((n, t) => n + Number(t.amount), 0))}</Text></View></View></Card>
    <Card><View style={{ flexDirection: 'row' }}>{['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map(label => <Text key={label} style={[type.body, { width: '14.2857%', textAlign: 'center', fontSize: 11 }]}>{label}</Text>)}</View><View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>{Array.from({ length: offset }, (_, i) => <View key={`gap-${i}`} style={{ width: '14.2857%', height: 48 }} />)}{days.map(day => {
      const state = dayStatus(day, today, entries), disabled = day > today;
      const bg = state === 'today' ? colors.accent : state === 'recorded' ? colors.orange : state === 'empty' ? '#EDF0F1' : colors.white;
      return <Pressable key={day} testID={`calendar-${day}`} accessibilityRole="button" accessibilityLabel={`${readableDay(day)}, ${entries.filter(t => t.occurred_on === day).length} catatan`} accessibilityState={{ selected: day === selected, disabled }} disabled={disabled} onPress={() => setSelected(day)} style={{ width: '14.2857%', height: 48, alignItems: 'center', justifyContent: 'center' }}><View style={{ width: 34, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: bg, borderColor: day === selected ? colors.ink : 'transparent', borderWidth: 2 }}><Text style={[type.heading, { fontSize: 12, color: state === 'today' || state === 'recorded' ? colors.white : disabled ? colors.muted : colors.ink }]}>{Number(day.slice(-2))}</Text></View></Pressable>;
    })}</View><Text style={[type.body, { fontSize: 11 }]}>Jingga: ada catatan. Biru: hari ini. Abu-abu: belum ada catatan.</Text></Card>
    <View style={[styles.row, { flexWrap: 'wrap' }]}>{[['all', 'Semua'], ['expense', 'Pengeluaran'], ['income', 'Pemasukan']].map(([value, label]) => <Pressable key={value} accessibilityRole="button" accessibilityState={{ selected: filter === value }} onPress={() => setFilter(value)} style={{ minHeight: 44, justifyContent: 'center', paddingHorizontal: 12, borderRadius: 18, backgroundColor: filter === value ? colors.mist : colors.white }}><Text style={type.body}>{label}</Text></Pressable>)}</View>
    <Card><Text style={type.heading}>{readableDay(selected)}</Text>{chosen.length ? chosen.map(renderEntry) : <Text style={type.body}>Belum ada {filter === 'all' ? 'catatan' : filter === 'income' ? 'pemasukan' : 'pengeluaran'} di tanggal ini.</Text>}</Card>
    <Host style={{ height: 0 }} colorScheme="light" seedColor={colors.accent}>
      <BottomSheet showDragIndicator={false} isPresented={picker} onDismiss={() => setPicker(false)} contentPadding={24} containerColor={colors.bg} contentColor={colors.ink}>
        <Column spacing={10} style={{ width }}>
          <Column alignment="center" style={{ width }}><Column style={{ width: 36, height: 4, backgroundColor: colors.muted, borderRadius: 2 }} /></Column>
          <NativeText textStyle={{ fontFamily: 'JakartaBold', fontSize: 20, color: colors.ink }}>Pilih bulan</NativeText>
          <Row spacing={8}>
            <NativeButton testID="previous-year" variant="text" disabled={year <= 1900} style={{ width: 48, borderWidth: 1, borderColor: colors.line, borderRadius: 14, backgroundColor: colors.white }} onPress={() => setYear(n => Math.max(1900, n - 1))}><NativeText textStyle={{ fontFamily: 'JakartaBold', fontSize: 24, color: colors.ink }}>‹</NativeText></NativeButton>
            <NativeText style={{ width: width - 112 }} textStyle={{ fontFamily: 'JakartaBold', fontSize: 18, color: colors.ink, textAlign: 'center' }}>{String(year)}</NativeText>
            <NativeButton testID="next-year" variant="text" disabled={year >= Number(today.slice(0, 4))} style={{ width: 48, borderWidth: 1, borderColor: colors.line, borderRadius: 14, backgroundColor: colors.white }} onPress={() => setYear(n => Math.min(Number(today.slice(0, 4)), n + 1))}><NativeText textStyle={{ fontFamily: 'JakartaBold', fontSize: 24, color: year >= Number(today.slice(0, 4)) ? colors.muted : colors.ink }}>›</NativeText></NativeButton>
          </Row>
          {[0, 2, 4, 6, 8, 10].map(start => <Row key={start} spacing={8}>{months.slice(start, start + 2).map((label, j) => {
            const next = `${year}-${String(start + j + 1).padStart(2, '0')}`, disabled = next > today.slice(0, 7), active = next === month;
            return <NativeButton key={label} testID={`month-${start + j + 1}`} variant="text" disabled={disabled} style={{ width: (width - 8) / 2, height: 48, borderWidth: 1, borderColor: colors.line, backgroundColor: active ? colors.mist : colors.white, borderRadius: 14 }} onPress={() => { if (disabled) return; setMonth(next); setSelected(next === today.slice(0, 7) ? today : next + '-01'); setPicker(false); }}><NativeText numberOfLines={1} textStyle={{ fontFamily: 'JakartaBold', fontSize: 13, color: disabled ? colors.muted : colors.ink, textAlign: 'center' }}>{label}</NativeText></NativeButton>;
          })}</Row>)}
        </Column>
      </BottomSheet>
    </Host>
  </>;
}

