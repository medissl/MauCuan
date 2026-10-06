import { Text, View } from 'react-native';
import { useState } from 'react';
import { ReceiptItem } from '../lib/receipt';
import { money, parseAmount } from '../lib/finance';
import { Button, Card, Field, LinkButton, type } from './ui';
export function ReceiptText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  return <><LinkButton text={expanded ? 'Tutup teks terbaca' : 'Lihat teks terbaca'} onPress={() => setExpanded(v => !v)} />{expanded && <Text selectable style={type.body}>{text}</Text>}</>;
}
export function ReceiptItems({ items, onChange, total }: { items: ReceiptItem[]; onChange: (items: ReceiptItem[]) => void; total: string }) {
  const sum = items.reduce((n, item) => n + item.amount, 0);
  let mismatch = false;
  try { mismatch = !!total && items.length > 0 && parseAmount(total) !== sum; } catch { /* Total is still being edited. */ }
  const update = (i: number, patch: Partial<ReceiptItem>) => onChange(items.map((item, at) => at === i ? { ...item, ...patch } : item));
  return <Card><Text style={type.heading}>Barang dalam struk</Text><Text style={type.body}>Nominal per baris adalah jumlah untuk seluruh kuantitas, bukan harga satuan.</Text>{items.map((item, i) => <View key={i} style={{ gap: 8, paddingVertical: 8 }}><Field label={`Barang ${i + 1}`} value={item.name} onChangeText={name => update(i, { name: name.slice(0, 100) })} /><View style={{ gap: 8 }}><Field label="Jumlah barang" numeric value={String(item.quantity || '')} onChangeText={q => update(i, { quantity: Number(q.replace(/\D/g, '').slice(0, 3)) })} /><Field label="Nominal baris" currency value={String(item.amount || '')} onChangeText={a => update(i, { amount: Number(a) })} /></View><LinkButton text="Hapus barang" onPress={() => onChange(items.filter((_, at) => at !== i))} /></View>)}{!items.length && <Text style={type.body}>Barang belum terbaca. Kamu bisa menambahkannya dari struk.</Text>}{items.length > 0 && <Text style={type.heading}>Jumlah barang {money(sum)}</Text>}{mismatch && <Text accessibilityRole="alert" style={type.body}>Berbeda dari total akhir. Cek pajak, diskon, dan barang yang belum terbaca. Total transaksi tetap memakai nominal yang kamu review di atas.</Text>}<Button secondary text="Tambah barang" disabled={items.length >= 100} onPress={() => onChange([...items, { name: '', quantity: 1, amount: 0 }])} /></Card>;
}
