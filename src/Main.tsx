import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, Pressable, RefreshControl, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Linking from 'expo-linking';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFonts } from 'expo-font';
import { Session } from '@supabase/supabase-js';
import { ocrImagePath, parseReceipt, ReceiptItem } from './lib/receipt';
import { supabase } from './lib/supabase';
import { useLedger } from './hooks/useLedger';
import { petCatalog } from './lib/pet';
import { Goal, isValidDate, jakartaDay, money, parseAmount, petProgress, readableDay, totals, Transaction } from './lib/finance';
import { DateField } from './components/date-field';
import { ReceiptItems, ReceiptText } from './components/receipt-items';
import { LeafBalance, PetHabitat, PetShop } from './components/pet-habitat';
import { Auth } from './components/Auth';
import { Badge, Button, Card, colors, Field, Header, LinkButton, Miko, Navigation, Progress, styles as ui, type } from './components/ui';

const ScreenContext = createContext<((screen: string) => React.ReactNode) | null>(null);
export function MauCuanScreen({ screen = 'home' }: { screen?: string }) {
  const renderScreen = useContext(ScreenContext);
  if (!renderScreen) throw new Error('MauCuan provider is missing');
  return renderScreen(screen);
}
export function MauCuanProvider({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const [fontsReady, fontError] = useFonts({ JakartaRegular: require('@expo-google-fonts/plus-jakarta-sans/400Regular/PlusJakartaSans_400Regular.ttf'), JakartaSemiBold: require('@expo-google-fonts/plus-jakarta-sans/600SemiBold/PlusJakartaSans_600SemiBold.ttf'), JakartaBold: require('@expo-google-fonts/plus-jakarta-sans/700Bold/PlusJakartaSans_700Bold.ttf'), JakartaExtraBold: require('@expo-google-fonts/plus-jakarta-sans/800ExtraBold/PlusJakartaSans_800ExtraBold.ttf') });
  const [session, setSession] = useState<Session | null>(null);
  const [booting, setBooting] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [recovery, setRecovery] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [petName, setPetName] = useState('Miko');
  const [opening, setOpening] = useState('0');
  const [entryType, setEntryType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Makan & minum');
  const [date, setDate] = useState(jakartaDay());
  const [receipt, setReceipt] = useState<{ uri: string; base64: string; mime: string; path?: string; note?: string; raw?: string } | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [goalDate, setGoalDate] = useState('');
  const [contribution, setContribution] = useState('');
  const [filter, setFilter] = useState('all');
  const [lastEntry, setLastEntry] = useState<Transaction | null>(null);
  const [rewarded, setRewarded] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [receiptItems, setReceiptItems] = useState<ReceiptItem[]>([]);
  const ledger = useLedger(session?.user.id);
  const balance = totals(ledger.profile?.opening_balance || 0, ledger.transactions, ledger.contributions);
  const pet = petProgress(ledger.checkins, ledger.accessories);
  const reduced = ledger.profile?.reduce_motion || false;
  const today = jakartaDay();
  const month = today.slice(0, 7);
  const monthEntries = ledger.transactions.filter(t => t.occurred_on.startsWith(month));
  const income = monthEntries.filter(t => t.kind === 'income').reduce((n, t) => n + Number(t.amount), 0);
  const spending = monthEntries.filter(t => t.kind === 'expense').reduce((n, t) => n + Number(t.amount), 0);
  const goalSaved = (g: Goal) => ledger.contributions.filter(c => c.goal_id === g.id).reduce((n, c) => n + Number(c.amount), 0);

  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(({ data, error: e }) => { if (!alive) return; if (e) setError(e.message); setSession(data.session); setBooting(false); }).catch(e => { if (alive) { setError(String(e)); setBooting(false); } });
    const { data: listener } = supabase.auth.onAuthStateChange((event, next) => {
      if (!alive) return;
      setSession(next);
      if (event === 'PASSWORD_RECOVERY') setRecovery(true);
      if (event === 'SIGNED_OUT') { router.replace('/'); setRecovery(false); setReceipt(null); setEditing(null); setLastEntry(null); setNickname(''); setPetName('Miko'); setOpening('0'); }
    });
    async function handleUrl(url: string | null) {
      if (!url) return;
      try {
        const parsed = Linking.parse(url);
        if (parsed.scheme !== 'maucuan' || parsed.hostname !== 'auth' || parsed.path !== 'callback') return;
        const params = new URLSearchParams(url.split(/[?#]/).slice(1).join('&'));
        if (params.get('error_description')) throw new Error(params.get('error_description')!);
        const code = params.get('code');
        if (code) { const { error: e } = await supabase.auth.exchangeCodeForSession(code); if (e) throw e; }
        else if (params.get('access_token') && params.get('refresh_token')) {
          const { error: e } = await supabase.auth.setSession({ access_token: params.get('access_token')!, refresh_token: params.get('refresh_token')! }); if (e) throw e;
        }
        if (params.get('type') === 'recovery') setRecovery(true);
      } catch (e) { if (alive) setError(e instanceof Error ? e.message : 'Link tidak valid.'); }
    }
    void Linking.getInitialURL().then(handleUrl);
    const link = Linking.addEventListener('url', e => void handleUrl(e.url));
    return () => { alive = false; listener.subscription.unsubscribe(); link.remove(); };
  }, []);
  const go = (destination: string) => { setError(''); const href = destination === 'home' ? '/' : `/${destination}`; router.navigate(href as Parameters<typeof router.navigate>[0]); };
  async function run(work: () => Promise<void>) {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true); setError('');
    try { await work(); } catch (e) { setError(e instanceof Error ? e.message : String((e as { message?: string })?.message || 'Tidak berhasil. Coba lagi.')); }
    finally { busyRef.current = false; setBusy(false); }
  }
  const openEntry = (kind: 'income' | 'expense' = 'expense') => { setEntryType(kind); setTitle(''); setAmount(''); setDate(jakartaDay()); setCategory(kind === 'income' ? 'Gaji' : 'Makan & minum'); setReceipt(null); setReceiptItems([]); setEditing(null); go('entry'); };
  async function saveEntry() {
    const value = parseAmount(amount);
    if (!value || !title.trim()) throw new Error('Isi nama transaksi dan nominal lebih dari nol.');
    if (!isValidDate(date)) throw new Error('Gunakan tanggal YYYY-MM-DD yang valid.');
    if (!session) throw new Error('Masuk kembali untuk menyimpan.');
    if (receiptItems.some(i => !i.name.trim() || i.quantity < 1 || !Number.isInteger(i.quantity) || i.amount < 1 || !Number.isSafeInteger(i.amount) || i.amount > 9000000000000)) throw new Error('Cek nama, jumlah, dan nominal setiap barang.');
    let path = receipt?.path || null;
    if (receipt && !path) {
      let file = decode(receipt.base64);
      let storageMime = receipt.mime;
      if (file.byteLength > 5 * 1024 * 1024) {
        // OCR used the original image; only the private upload copy is reduced.
        const { ImageManipulator, SaveFormat } = await import('expo-image-manipulator');
        const context = ImageManipulator.manipulate(receipt.uri);
        context.resize({ width: 1600, height: null });
        const image = await context.renderAsync();
        const optimized = await image.saveAsync({ format: SaveFormat.JPEG, compress: .85, base64: true });
        if (!optimized.base64) throw new Error('Foto belum dapat disiapkan untuk disimpan. Coba foto lain.');
        file = decode(optimized.base64); storageMime = 'image/jpeg';
      }
      if (file.byteLength > 5 * 1024 * 1024) throw new Error('Foto maksimal 5 MB. Ambil foto dengan resolusi lebih kecil.');
      const extension = storageMime === 'image/png' ? 'png' : storageMime === 'image/webp' ? 'webp' : 'jpg';
      // Runs only after the save button is pressed; never during render.
      // eslint-disable-next-line react-hooks/purity
      path = `${session.user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
      const { error: uploadError } = await supabase.storage.from('receipts').upload(path, file, { contentType: storageMime, upsert: false });
      if (uploadError) throw uploadError;
      setReceipt({ ...receipt, path });
    }
    const payload = { user_id: session.user.id, kind: entryType, amount: value, title: title.trim(), category, occurred_on: date, receipt_path: path || editing?.receipt_path || null, receipt_items: receiptItems.map(i => ({ ...i, name: i.name.trim() })) };
    const response = editing ? await supabase.from('transactions').update(payload).eq('id', editing.id).eq('user_id', session.user.id).select().single() : await supabase.from('transactions').insert(payload).select().single();
    if (response.error) throw response.error;
    setLastEntry(response.data as Transaction); setReceipt(null); setEditing(null); await ledger.refresh(); go('saved');
  }
  async function chooseReceipt(camera: boolean) {
    if (camera) { const permission = await ImagePicker.requestCameraPermissionsAsync(); if (!permission.granted) throw new Error('Izinkan kamera atau pilih foto dari galeri.'); }
    const options: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 1, base64: true };
    const result = camera ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
    if (result.canceled) return;
    const asset = result.assets[0];
    if (!asset.base64) throw new Error('Foto tidak terbaca. Coba lagi.');
    const mime = asset.mimeType || 'image/jpeg';
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(mime)) throw new Error('Gunakan foto JPG, PNG, atau WebP.');
    let suggestion: ReturnType<typeof parseReceipt> = {};
    let raw = '';
    let note = 'Detail belum terbaca. Isi manual lalu review sebelum menyimpan.';
    try {
      const ocr = await import('expo-text-extractor');
      if (!ocr.isSupported) throw new Error('OCR unavailable');
      const blocks = await ocr.extractTextFromImage(ocrImagePath(asset.uri, Platform.OS));
      raw = blocks.join('\n').slice(0, 50000);
      suggestion = parseReceipt(blocks);
      note = blocks.length ? `Dibaca di perangkat: ${suggestion.items?.length || 0} barang. ${suggestion.amount ? 'Total ditemukan.' : 'Total belum dikenali; lihat teks struk dan isi nominal.'} Review nama toko, barang, tanggal, dan total. ${suggestion.warnings?.join(' ') || ''}` : 'Teks belum terbaca. Coba foto lebih jelas atau isi manual.';
    } catch { note = 'Foto gagal dibaca oleh OCR. Ambil ulang dengan seluruh struk terlihat, atau isi manual. Transaksi belum disimpan.'; }
    setReceiptItems(suggestion.items || []); setReceipt({ uri: asset.uri, base64: asset.base64, mime, note, raw }); setEditing(null); setEntryType('expense'); setTitle(suggestion.title || ''); setAmount(suggestion.amount ? String(suggestion.amount) : ''); setCategory('Makan & minum'); setDate(suggestion.date || jakartaDay()); go('receipt');
  }
  function editTransaction(t: Transaction) { setEditing(t); setEntryType(t.kind); setTitle(t.title); setAmount(String(t.amount)); setCategory(t.category); setDate(t.occurred_on); setReceiptItems(t.receipt_items || []); setReceipt(null); go('entry'); }
  const section = (heading: string, action?: string, onPress?: () => void) => <View style={[ui.row, { justifyContent: 'space-between' }]}><Text style={type.heading}>{heading}</Text>{action && <LinkButton text={action} onPress={onPress!} />}</View>;
  const transaction = (t: Transaction) => <Pressable key={t.id} onPress={() => editTransaction(t)} accessibilityLabel={`Edit ${t.title}`} style={[ui.row, { paddingVertical: 7 }]}><View style={s.tile}><Ionicons name={t.kind === 'income' ? 'wallet-outline' : 'receipt-outline'} size={21} color="#B64915" /></View><View style={{ flex: 1 }}><Text numberOfLines={1} style={[type.heading, { fontSize: 12 }]}>{t.title}</Text><Text style={[type.body, { fontSize: 10 }]}>{t.occurred_on} · {t.category}</Text></View><Text style={{ fontFamily: 'JakartaBold', fontSize: 11, color: t.kind === 'income' ? colors.positive : colors.ink }}>{t.kind === 'income' ? '+' : '−'} {money(t.amount)}</Text></Pressable>;
  const goalCard = (g: Goal) => <Pressable key={g.id} onPress={() => { setSelectedGoal(g); go('detail'); }}><Card><View style={[ui.row, { justifyContent: 'space-between' }]}><Text style={type.heading}>{g.title}</Text><Badge text={`${Math.round(goalSaved(g) / g.target_amount * 100)}%`} positive /></View><Text style={type.body}>{money(goalSaved(g))} / {money(g.target_amount)}</Text><Progress value={goalSaved(g) / g.target_amount} /></Card></Pressable>;
  const miko = (size = 210, mood: 'idle' | 'happy' | 'wink' | 'focused' | 'rest' = 'idle') => <Miko size={size} reduced={reduced} mood={mood} />;
  function render(screen: string) {
    if (recovery && session) return <><Header title="Kata sandi baru" sub="Pilih yang kuat dan mudah kamu ingat." /><Field label="KATA SANDI BARU" secure value={newPassword} onChangeText={setNewPassword} /><Button disabled={busy} text="Simpan kata sandi" onPress={() => void run(async () => { if (newPassword.length < 10) throw new Error('Gunakan minimal 10 karakter.'); const { error: e } = await supabase.auth.updateUser({ password: newPassword }); if (e) throw e; setNewPassword(''); setRecovery(false); go('home'); })} /></>;
    if (!session) return <Auth onError={setError} />;
    if (!ledger.profile || ledger.profile.id !== session.user.id) return <><Header title="Menyiapkan ruangmu" /><Text style={type.body}>Mengambil catatan dengan aman…</Text><ActivityIndicator color={colors.orange} /><Button text="Coba lagi" disabled={ledger.loading} onPress={() => void ledger.refresh()} /><Button text="Keluar" secondary onPress={() => void run(async () => { const { error: e } = await supabase.auth.signOut(); if (e) throw e; })} /></>;
    if (!ledger.profile.onboarding_complete) return <><Header title="Mulai dari kamu" sub="Saldo awal hanya diisi sekali." /><View style={{ alignItems: 'center' }}>{miko(180)}</View><Field label="NAMA PANGGILAN" value={nickname} onChangeText={setNickname} /><Field label="NAMA MACANMU" value={petName} onChangeText={setPetName} /><Field label="Saldo awal" currency value={opening} onChangeText={setOpening} /><Card tone="pale"><Text style={type.heading}>Santai, kita tumbuh bareng.</Text><Text style={type.body}>Hari tanpa belanja tetap dihargai. Miko tidak sakit atau kehilangan level saat kamu melewatkan hari.</Text></Card><Button text="Ayo mulai!" disabled={busy} onPress={() => void run(async () => { if (!nickname.trim() || !petName.trim()) throw new Error('Isi nama kamu dan macanmu.'); const { error: e } = await supabase.rpc('complete_onboarding', { p_nickname: nickname.trim(), p_pet_name: petName.trim(), p_opening_balance: parseAmount(opening) }); if (e) throw e; await ledger.refresh(); })} /></>;
    switch (screen) {
      case 'home': return <>
        <View style={[ui.row, { justifyContent: 'space-between' }]}><View style={{ flex: 1, gap: 6 }}><Text style={type.body}>{readableDay(today)}</Text><Text style={type.title}>Hai, {ledger.profile.nickname}</Text></View><Pressable accessibilityLabel="Pengaturan" onPress={() => go('settings')} style={ui.back}><Ionicons name="settings-outline" size={24} color={colors.ink} /></Pressable></View>
        <Pressable accessibilityRole="button" accessibilityLabel="Lihat rincian saldo tercatat" onPress={() => go('balance')}><Card tone="teal"><View style={[ui.row, { justifyContent: 'space-between' }]}><Text style={[type.body, { color: colors.onTealMuted }]}>Saldo tercatat</Text><Ionicons name="chevron-forward" color="white" size={20} /></View><Text adjustsFontSizeToFit numberOfLines={1} style={[type.money, { color: 'white' }]}>{money(balance.balance)}</Text><Text style={[type.body, { color: colors.onTealMuted }]}>Dompet utama · {month}</Text><View style={[ui.row, { gap: 20 }]}><View style={{ flex: 1 }}><Text style={[type.body, s.whiteSmall]}>Pemasukan bulan ini</Text><Text style={s.whiteBold}>+ {money(income)}</Text></View><View style={{ flex: 1 }}><Text style={[type.body, s.whiteSmall]}>Pengeluaran bulan ini</Text><Text style={s.whiteBold}>− {money(spending)}</Text></View></View></Card></Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Buka habitat Miko" onPress={() => go('pet')}><Card tone="pale" style={{ flexDirection: 'row', alignItems: 'center', padding: 12 }}>{miko(90)}<View style={{ flex: 1, gap: 8 }}><Badge text={`${ledger.checkins.length} HARI TERCATAT`} /><Text style={type.heading}>{pet.checked ? 'Check-in selesai!' : `${ledger.profile.pet_name} siap check-in!`}</Text><Text style={type.body}>{pet.checked ? 'Satu kebiasaan kecil lagi.' : 'Belum belanja? Tetap dapat XP.'}</Text></View></Card></Pressable>
        <View style={ui.row}><Pressable accessibilityRole="button" accessibilityLabel="Scan struk" onPress={() => go('scan')} style={({ pressed }) => [s.quick, { opacity: pressed ? .7 : 1 }]}><Ionicons name="scan-outline" size={26} color={colors.orange} /><Text style={type.heading}>Scan struk</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel="Catat manual" onPress={() => openEntry()} style={({ pressed }) => [s.quick, { opacity: pressed ? .7 : 1 }]}><Ionicons name="add-outline" size={26} color={colors.orange} /><Text style={type.heading}>Catat manual</Text></Pressable></View>
        {section('Target impian', 'Lihat semua', () => go('goals'))}{ledger.goals.length ? goalCard(ledger.goals[0]) : <Card><Text style={type.body}>Belum ada target. Bikin tempat untuk impianmu.</Text><LinkButton text="+ Buat target pertama" onPress={() => go('newgoal')} /></Card>}
        {section('Catatan terbaru', 'Semua', () => go('records'))}<Card>{ledger.transactions.length ? ledger.transactions.slice(0, 3).map(transaction) : <Text style={type.body}>Belum ada catatan. Mulai kecil dengan transaksi pertamamu.</Text>}</Card>
      </>;
      case 'records': return <><Header title="Catatan uang" sub="Semua arus uangmu, satu tempat." />{section(month, 'Lihat insight →', () => go('insights'))}<View style={s.chips}>{[['all', 'Semua'], ['expense', 'Pengeluaran'], ['income', 'Pemasukan']].map(([key, label]) => <Pressable key={key} onPress={() => setFilter(key)} style={[s.chip, filter === key && s.selected]}><Text style={[s.chipText, filter === key && { color: 'white' }]}>{label}</Text></Pressable>)}</View><Card>{ledger.transactions.filter(t => filter === 'all' || t.kind === filter).length ? ledger.transactions.filter(t => filter === 'all' || t.kind === filter).map(transaction) : <><View style={{ alignItems: 'center' }}>{miko(180)}</View><Text style={type.heading}>Belum ada catatan di sini.</Text><Text style={type.body}>Tanpa belanja? Cukup check-in. Kamu juga bisa mencatat pemasukan.</Text></>}</Card><Button text="+ Catat transaksi" onPress={() => openEntry()} /></>;
      case 'entry': case 'receipt': return <><Header title={receipt ? 'Review struk' : editing ? 'Ubah transaksi' : 'Catat transaksi'} onBack={() => go(editing ? 'records' : 'home')} />{receipt && <><View style={{ alignItems: 'center' }}>{miko(100, 'focused')}</View><Image source={{ uri: receipt.uri }} style={s.receiptPhoto} resizeMode="contain" /><Card tone="pale"><Text style={type.heading}>Review hasil struk.</Text><Text style={type.body}>{receipt.note}</Text>{receipt.raw && <ReceiptText text={receipt.raw} />}</Card></>}<View style={s.chips}>{(['expense', 'income'] as const).map(k => <Pressable key={k} onPress={() => { setEntryType(k); setCategory(k === 'income' ? 'Gaji' : 'Makan & minum'); }} style={[s.chip, entryType === k && s.selected]}><Text style={[s.chipText, entryType === k && { color: 'white' }]}>{k === 'income' ? 'Pemasukan' : 'Pengeluaran'}</Text></Pressable>)}</View><Field label="Nominal" currency value={amount} onChangeText={setAmount} placeholder="48000" /><Field label={entryType === 'income' ? 'SUMBER PEMASUKAN' : receipt ? 'Nama toko' : 'UNTUK APA?'} value={title} onChangeText={setTitle} placeholder={entryType === 'income' ? 'Gaji Oktober' : 'Kopi & roti'} /><Text style={type.eyebrow}>KATEGORI</Text><View style={s.chips}>{(entryType === 'income' ? ['Gaji', 'Freelance', 'Hadiah', 'Lainnya'] : ['Makan & minum', 'Transportasi', 'Belanja', 'Tagihan', 'Lainnya']).map(c => <Pressable key={c} onPress={() => setCategory(c)} style={[s.chip, category === c && s.selected]}><Text style={[s.chipText, category === c && { color: 'white' }]}>{c}</Text></Pressable>)}</View><DateField label="Tanggal" value={date} onChange={setDate} />{(receipt || receiptItems.length > 0) && <ReceiptItems items={receiptItems} onChange={setReceiptItems} total={amount} />}<Button text={busy ? 'Menyimpan…' : 'Simpan transaksi'} disabled={busy} onPress={() => void run(saveEntry)} />{editing && <LinkButton text="Hapus transaksi" onPress={() => Alert.alert('Hapus catatan?', 'Transaksi ini akan dihapus dari catatanmu.', [{ text: 'Batal', style: 'cancel' }, { text: 'Hapus', style: 'destructive', onPress: () => void run(async () => { const { error: e } = await supabase.from('transactions').delete().eq('id', editing.id); if (e) throw e; if (editing.receipt_path) { const { error: storageError } = await supabase.storage.from('receipts').remove([editing.receipt_path]); if (storageError) Alert.alert('Foto belum terhapus', storageError.message); } setEditing(null); await ledger.refresh(); go('records'); }) }])} />}</>;
      case 'saved': return <><View style={{ alignItems: 'center' }}>{miko(230)}<Badge text="✓ TERSIMPAN" positive /></View><Text style={type.title}>Satu catatan.{ '\n' }Selangkah lebih sadar.</Text><Card><Text style={type.heading}>{lastEntry?.title}</Text><Text style={type.money}>{money(lastEntry?.amount || 0)}</Text><Text style={type.body}>{lastEntry?.category} · {lastEntry?.occurred_on}</Text></Card><Card tone="pale"><Text style={type.heading}>Catatan rapi, pikiran ringan.</Text><Text style={type.body}>XP dari check-in harian, bukan jumlah transaksi atau besarnya belanja.</Text></Card><Button text={pet.checked ? 'Lihat Macan' : 'Lanjut check-in harian'} onPress={() => go(pet.checked ? 'pet' : 'checkin')} /><Button text="Kembali ke beranda" secondary onPress={() => go('home')} /></>;
      case 'scan': return <><Header title="Scan struk" sub="Ambil foto atau pilih struk dari galeri." onBack={() => go('home')} /><Card tone="teal"><View style={{ alignItems: 'center', paddingVertical: 40 }}><Ionicons name="scan-outline" size={80} color="#FFBE85" /><Text style={[type.heading, { color: 'white', marginTop: 20 }]}>Ratakan struk. Cari cahaya cukup.</Text><Text style={[type.body, { color: colors.onTealMuted, textAlign: 'center', marginTop: 10 }]}>Seluruh struk dan total harus terlihat.</Text></View></Card><Button text={busy ? 'Menyiapkan foto & membaca…' : 'Ambil foto'} disabled={busy} onPress={() => void run(() => chooseReceipt(true))} /><Button text="Pilih dari galeri" secondary disabled={busy} onPress={() => void run(() => chooseReceipt(false))} /><Card tone="pale"><Text style={type.heading}>Dibaca langsung di perangkat.</Text><Text style={type.body}>Nama toko, barang, tanggal, dan total yang terbaca menjadi saran. Review dulu; transaksi disimpan hanya saat kamu menekan Simpan.</Text></Card><LinkButton text="Catat tanpa foto →" onPress={() => openEntry()} /></>;
      case 'insights': { const categories = new Map<string, number>(); for (const t of monthEntries) if (t.kind === 'expense') categories.set(t.category, (categories.get(t.category) || 0) + Number(t.amount)); return <><Header title="Kenali polamu" sub={month} onBack={() => go('records')} /><Card><Text style={type.eyebrow}>PENGELUARAN BULAN INI</Text><Text style={type.money}>{money(spending)}</Text><Text style={type.body}>{monthEntries.filter(t => t.kind === 'expense').length} catatan pengeluaran</Text></Card>{section('Ke mana uangmu pergi?')}<Card>{categories.size ? [...categories].sort((a, b) => b[1] - a[1]).map(([c, a]) => <View key={c} style={{ gap: 10 }}><View style={[ui.row, { justifyContent: 'space-between' }]}><Text style={type.body}>{c}</Text><Text style={type.heading}>{money(a)}</Text></View><Progress value={a / spending} /></View>) : <Text style={type.body}>Belum ada pengeluaran bulan ini.</Text>}</Card><Card tone="pale"><Text style={type.heading}>Ruang kecil untuk menabung.</Text><Text style={type.body}>Dana bebas tercatat: {money(balance.available)}. Sisihkan sesuai kemampuanmu.</Text></Card><Button text="Lihat target tabungan" onPress={() => go('goals')} /></>; }
      case 'goals': return <><Header title="Target impian" sub="Bikin masa depan terasa lebih dekat." /><Card tone="teal"><Text style={[type.eyebrow, { color: colors.onTealMuted }]}>TOTAL DANA TERSISIHKAN</Text><Text style={[type.money, { color: 'white' }]}>{money(balance.allocated)}</Text><Text style={[type.body, { color: colors.onTealMuted }]}>{ledger.goals.length} target · Dicatat, bukan saldo bank</Text></Card>{ledger.goals.map(goalCard)}{!ledger.goals.length && <Card tone="pale"><Text style={type.heading}>Satu impian, satu langkah awal.</Text><Text style={type.body}>Mulai dengan dana darurat atau sesuatu yang ingin kamu capai.</Text></Card>}<Button text="+ Buat target baru" onPress={() => { setGoalTitle(''); setGoalAmount(''); setGoalDate(''); go('newgoal'); }} /></>;
      case 'newgoal': return <><Header title="Buat target" sub="Satu impian, satu langkah awal." onBack={() => go('goals')} /><Field label="NAMA TARGET" value={goalTitle} onChangeText={setGoalTitle} placeholder="Dana darurat" /><Field label="Jumlah target" currency value={goalAmount} onChangeText={setGoalAmount} placeholder="5000000" /><DateField label="Tanggal target" value={goalDate} onChange={setGoalDate} clearable /><Card tone="pale"><Text style={type.heading}>Mulai dengan yang realistis.</Text><Text style={type.body}>Tidak ada penalti kalau rencanamu berubah.</Text></Card><Button text="Buat target tabungan" disabled={busy} onPress={() => void run(async () => { const value = parseAmount(goalAmount); if (!value || !goalTitle.trim()) throw new Error('Isi nama dan jumlah target.'); if (goalDate && !isValidDate(goalDate)) throw new Error('Tanggal target tidak valid.'); const { error: e } = await supabase.from('goals').insert({ user_id: session.user.id, title: goalTitle.trim(), target_amount: value, target_date: goalDate || null }); if (e) throw e; await ledger.refresh(); go('goals'); })} /></>;
      case 'detail': return selectedGoal ? <><Header title={selectedGoal.title} onBack={() => go('goals')} /><Card tone="pale"><Ionicons name="shield-checkmark-outline" size={40} color={colors.orange} /><Text style={type.title}>Biar lebih tenang,{ '\n' }apa pun yang datang.</Text><Text style={type.money}>{money(goalSaved(selectedGoal))}</Text><Text style={type.body}>dari {money(selectedGoal.target_amount)} · {Math.round(goalSaved(selectedGoal) / selectedGoal.target_amount * 100)}%</Text><Progress value={goalSaved(selectedGoal) / selectedGoal.target_amount} /></Card><Card><Text style={type.heading}>Rencana kamu</Text><Text style={type.body}>Target waktu: {selectedGoal.target_date || 'Fleksibel'}</Text><Text style={type.body}>Dana bebas: {money(balance.available)}</Text></Card>{section('Riwayat sisihan')}<Card>{ledger.contributions.filter(c => c.goal_id === selectedGoal.id).map(c => <View key={c.id} style={[ui.row, { justifyContent: 'space-between' }]}><Text style={type.body}>{c.created_at.slice(0, 10)}</Text><Text style={type.heading}>{money(c.amount)}</Text></View>)}{!goalSaved(selectedGoal) && <Text style={type.body}>Belum ada sisihan. Mulai saat kamu siap.</Text>}</Card><Button text="Catat sisihan" onPress={() => { setContribution(''); go('contribute'); }} /><Text style={type.body}>Sisihan mengubah alokasi dana. Tidak dihitung sebagai pengeluaran baru.</Text></> : <><Header title="Pilih target" onBack={() => go('goals')} /><Button text="Lihat target tabungan" onPress={() => go('goals')} /></>;
      case 'contribute': return <><Header title="Catat sisihan" sub={selectedGoal?.title} onBack={() => go('detail')} /><Field label="Jumlah sisihan" currency value={contribution} onChangeText={setContribution} /><Card><Text style={type.heading}>Dana bebas tersedia</Text><Text style={type.money}>{money(balance.available)}</Text></Card><Card tone="pale"><Text style={type.heading}>Ini catatan alokasi dana.</Text><Text style={type.body}>MauCuan tidak memindahkan uang antar rekening. Total saldo tercatat tetap sama.</Text></Card><Button text="Konfirmasi sisihan" disabled={busy} onPress={() => void run(async () => { if (!selectedGoal) throw new Error('Pilih target terlebih dulu.'); const value = parseAmount(contribution); if (!value) throw new Error('Nominal harus lebih dari nol.'); const { error: e } = await supabase.rpc('allocate_savings', { p_goal_id: selectedGoal.id, p_amount: value }); if (e) throw e; await ledger.refresh(); go('detail'); })} /></>;
      case 'pet': return <PetHabitat name={ledger.profile.pet_name} level={pet.level} progress={pet.progress} checked={pet.checked} leaves={pet.leaves} room={ledger.profile.pet_room || {}} reduced={reduced} transactions={ledger.transactions} goals={ledger.goals} contributions={ledger.contributions} available={balance.available} day={today} navigate={go} />;
      case 'checkin': return <><Header title="Cek harimu" sub="Satu check-in per hari." onBack={() => go('pet')} /><Card><Text style={type.heading}>Ringkasan hari ini</Text><Text style={type.body}>{ledger.transactions.filter(t => t.occurred_on === today).length} transaksi tercatat</Text><Text style={type.heading}>Pengeluaran {money(ledger.transactions.filter(t => t.occurred_on === today && t.kind === "expense").reduce((n,t) => n + Number(t.amount), 0))}</Text><LinkButton text="Review catatan dulu" onPress={() => go("records")} /><LeafBalance amount={10} label="daun + 20 XP saat selesai" /></Card><Text style={type.title}>{pet.checked ? 'Hari ini sudah beres.' : 'Hari ini,\ngimana uangmu?'}</Text>{pet.checked ? <><View style={{ alignItems: 'center' }}>{miko(220)}</View><Card tone="pale"><Text style={type.body}>Reward hari ini sudah diterima. Catatan tambahan tetap bisa disimpan tanpa reward tambahan.</Text></Card><Button text="Kembali ke habitat" onPress={() => go('pet')} /></> : <><Button text="Konfirmasi tanpa belanja" disabled={busy || ledger.transactions.some(t => t.kind === 'expense' && t.occurred_on === today)} onPress={() => void run(async () => { const { data, error: e } = await supabase.rpc('daily_checkin', { p_no_spend: true }); if (e) throw e; setRewarded(data.rewarded); await ledger.refresh(); go('reward'); })} /><Button text="Sudah review semua catatan" secondary disabled={busy} onPress={() => void run(async () => { const { data, error: e } = await supabase.rpc('daily_checkin', { p_no_spend: false }); if (e) throw e; setRewarded(data.rewarded); await ledger.refresh(); go('reward'); })} /><Button text="Masih ada yang belum dicatat" secondary onPress={() => openEntry()} /><Card tone="pale"><Text style={type.heading}>Bukan lomba belanja.</Text><Text style={type.body}>20 XP untuk check-in pertama hari ini. Jumlah transaksi dan nominal tidak menambah XP.</Text></Card><Text style={type.body}>Terlewat sehari? Kamu boleh mulai lagi. Miko tetap aman dan level tidak berkurang.</Text></>}</>;
      case 'reward': return <><View style={{ alignItems: 'center' }}><Badge text="CHECK-IN SELESAI" positive />{miko(250, 'happy')}</View><Text style={type.title}>Konsisten itu keren.</Text><Text style={type.body}>{rewarded ? 'Kebiasaan kecilmu berarti. Miko senang kamu kembali.' : 'Reward hari ini sudah diterima sebelumnya.'}</Text><View style={ui.row}><Card tone="pale" style={{ flex: 1 }}><Text style={type.title}>+{rewarded ? 20 : 0} XP</Text><Text style={type.body}>Untuk tumbuh</Text></Card><Card tone="pale" style={{ flex: 1 }}><LeafBalance amount={rewarded ? 10 : 0} label="daun diterima" /><Text style={type.body}>Untuk koleksi</Text></Card></View><Card><Text style={type.heading}>Level {pet.level}</Text><Text style={type.body}>{petCatalog.filter(i => i.cost === 0 && i.level <= pet.level && !ledger.accessories.some(a => a.accessory === i.id)).map(i => i.name).join(", ") || "Terus tumbuh lewat kebiasaan kecil."}</Text><LinkButton text="Lihat hadiah & koleksi" onPress={() => go("wardrobe")} /></Card><Button text="Lihat Miko" onPress={() => go('pet')} /><Button text="Kembali ke beranda" secondary onPress={() => go('home')} /></>;
      case 'wardrobe': return <><Header title={`Koleksi & kamar ${ledger.profile.pet_name}`} onBack={() => go('pet')} /><PetShop level={pet.level} leaves={pet.leaves} accessories={ledger.accessories} room={ledger.profile.pet_room || {}} busy={busy} redeem={id => void run(async () => { const { error: e } = await supabase.rpc('redeem_accessory', { p_accessory: id }); if (e) throw e; await ledger.refresh(); })} equip={(slot, id) => void run(async () => { const { error: e } = await supabase.rpc('equip_pet_item', { p_slot: slot, p_item: id }); if (e) throw e; await ledger.refresh(); })} /></>;
      case 'balance': return <><Header title="Rincian saldo" sub="Dompet utama" onBack={() => go('home')} /><Card tone="teal"><Text style={[type.body, { color: colors.onTealMuted }]}>Saldo tercatat</Text><Text style={[type.money, { color: 'white' }]}>{money(balance.balance)}</Text></Card><Card><Text style={type.heading}>Dari mana saldomu?</Text><View style={[ui.row, { justifyContent: 'space-between' }]}><Text style={type.body}>Saldo awal</Text><Text style={type.heading}>{money(ledger.profile.opening_balance)}</Text></View><View style={[ui.row, { justifyContent: 'space-between' }]}><Text style={type.body}>Total pemasukan</Text><Text style={type.heading}>{money(ledger.transactions.filter(t => t.kind === 'income').reduce((n,t) => n + Number(t.amount),0))}</Text></View><View style={[ui.row, { justifyContent: 'space-between' }]}><Text style={type.body}>Total pengeluaran</Text><Text style={type.heading}>{money(ledger.transactions.filter(t => t.kind === 'expense').reduce((n,t) => n + Number(t.amount),0))}</Text></View></Card><Card tone="pale"><Text style={type.heading}>Dana bebas {money(balance.available)}</Text><Text style={type.body}>{money(balance.allocated)} dialokasikan ke target. Alokasi tidak mengurangi total saldo tercatat.</Text></Card><Button text="Lihat semua catatan" onPress={() => go('records')} /><Button text="Catat pemasukan" secondary onPress={() => openEntry('income')} /><Button text="Lihat target tabungan" secondary onPress={() => go('goals')} /></>;
      case 'edit-profile': return <><Header title="Ubah profil" onBack={() => go('settings')} /><Field label="Nama panggilan" value={nickname} onChangeText={setNickname} /><Field label="Nama macanmu" value={petName} onChangeText={setPetName} /><Button text="Simpan profil" disabled={busy} onPress={() => void run(async () => { if (!nickname.trim() || nickname.trim().length > 60 || !petName.trim() || petName.trim().length > 40) throw new Error('Nama kamu maksimal 60 karakter dan nama macan maksimal 40 karakter.'); const { error: e } = await supabase.from('profiles').update({ nickname: nickname.trim(), pet_name: petName.trim() }).eq('id', session.user.id); if (e) throw e; await ledger.refresh(); go('settings'); })} /></>;
      case 'change-password': return <><Header title="Ubah kata sandi" onBack={() => go('settings')} /><Field label="Kata sandi baru" secure value={newPassword} onChangeText={setNewPassword} placeholder="Minimal 10 karakter" /><Button text="Simpan kata sandi" disabled={busy} onPress={() => void run(async () => { if(newPassword.length < 10) throw new Error('Gunakan minimal 10 karakter.'); const { error: e } = await supabase.auth.updateUser({ password: newPassword }); if(e) throw e; setNewPassword(''); go('settings'); Alert.alert('Kata sandi diperbarui', 'Gunakan kata sandi baru saat masuk berikutnya.'); })} /></>;
      case 'settings': return <><Header title="Profil & pengaturan" onBack={() => go('home')} /><Card><Text style={type.heading}>{ledger.profile.nickname}</Text><Text style={type.body}>{session.user.email}</Text><LinkButton text="Ubah profil" onPress={() => { setNickname(ledger.profile!.nickname); setPetName(ledger.profile!.pet_name); go('edit-profile'); }} /><LinkButton text="Ubah kata sandi" onPress={() => { setNewPassword(''); go('change-password'); }} /></Card><Card><View style={[ui.row, { justifyContent: 'space-between' }]}><View style={{ flex: 1 }}><Text style={type.heading}>Kurangi gerakan</Text><Text style={type.body}>Animasi lebih tenang.</Text></View><Switch value={reduced} disabled={busy} onValueChange={v => void run(async () => { const { error: e } = await supabase.from('profiles').update({ reduce_motion: v }).eq('id', session.user.id); if (e) throw e; await ledger.refresh(); })} trackColor={{ true: colors.orange }} /></View></Card><Card><LinkButton text="Bantuan" onPress={() => void run(async () => { await Linking.openURL('https://maucuan-finance.vercel.app/support'); })} /><LinkButton text="Kebijakan privasi" onPress={() => void run(async () => { await Linking.openURL('https://maucuan-finance.vercel.app/privacy'); })} /></Card><Button text="Keluar dari akun" secondary disabled={busy} onPress={() => Alert.alert('Keluar dari akun?', 'Catatanmu tetap tersimpan di akun ini.', [{ text: 'Batal', style: 'cancel' }, { text: 'Keluar', onPress: () => void run(async () => { const { error: e } = await supabase.auth.signOut(); if (e) throw e; }) }])} /></>;
      default: return <><Header title="Halaman belum tersedia" /><Button text="Kembali ke beranda" onPress={() => go('home')} /></>;
    }
  }
  function renderLayout(screen: string) {
  if (fontError) return <View style={{ padding: 30 }}><Text>Font tidak dapat dimuat. Tutup dan buka kembali aplikasi.</Text></View>;
  if (!fontsReady || booting) return <View style={s.loading}><ActivityIndicator size="large" color={colors.orange} /></View>;
  const hasNav = !!session && ledger.profile?.id === session.user.id && !!ledger.profile?.onboarding_complete && !recovery && ['home', 'records', 'goals', 'pet', 'insights'].includes(screen);
  return <View style={s.root}><StatusBar style="dark" /><KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScrollView key={session ? screen : 'auth'} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 24, paddingTop: insets.top + 18, paddingBottom: hasNav ? 120 + insets.bottom : 34 + insets.bottom, gap: 16 }} refreshControl={session ? <RefreshControl refreshing={ledger.loading && !!ledger.profile} onRefresh={() => void ledger.refresh()} tintColor={colors.orange} /> : undefined}>{(error || ledger.error) ? <Card tone="pale"><Text accessibilityRole="alert" style={type.body}>{error || ledger.error}</Text>{ledger.error && <LinkButton text="Coba lagi" onPress={() => void ledger.refresh()} />}</Card> : null}{render(screen)}</ScrollView></KeyboardAvoidingView><View pointerEvents="none" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: insets.bottom, backgroundColor: 'white' }} />{hasNav && <Navigation active={screen === 'insights' ? 'records' : screen} onNavigate={go} bottom={insets.bottom} />}</View>;
  }
  return <ScreenContext.Provider value={renderLayout}>{children}</ScreenContext.Provider>;
}
export default function App() { return <SafeAreaProvider><MauCuanProvider><MauCuanScreen /></MauCuanProvider></SafeAreaProvider>; }
const s = StyleSheet.create({ root: { flex: 1, backgroundColor: colors.bg }, loading: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }, tile: { height: 42, width: 42, borderRadius: 14, backgroundColor: colors.pale, alignItems: 'center', justifyContent: 'center' }, whiteSmall: { color: colors.onTealMuted, fontSize: 10 }, whiteBold: { color: 'white', fontSize: 12, fontFamily: 'JakartaBold' }, quick: { flex: 1, backgroundColor: 'white', borderRadius: 22, padding: 16, gap: 12 }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, chip: { borderRadius: 20, paddingHorizontal: 14, minHeight: 44, justifyContent: 'center', backgroundColor: 'white' }, selected: { backgroundColor: colors.orange }, chipText: { fontFamily: 'JakartaBold', fontSize: 11, color: colors.muted }, receiptPhoto: { width: '100%', height: 260, backgroundColor: colors.white, borderRadius: 20 } });
