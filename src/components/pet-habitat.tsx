import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, Text, View, useWindowDimensions } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Svg, { Path } from 'react-native-svg';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withSequence, withTiming, cancelAnimation } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { Miko, Button, Card, Progress, type, colors, styles, LinkButton } from './ui';
import { ItemArt, RoomArt, WearableArt } from './pet-art';
import { PetRoom, levelName, moneyQuiz, petCatalog } from '../lib/pet';
import { mikoLines, mikoReactions, reactionLine } from '../lib/miko-dialogue';
import { Accessory, Contribution, Goal, Transaction } from '../lib/finance';

export function LeafBalance({ amount, label = 'daun' }: { amount: number; label?: string }) {
  return <View style={[styles.row, { gap: 6 }]}><Ionicons name="leaf" size={20} color={colors.accent} /><Text style={type.heading}>{amount} {label}</Text></View>;
}
export function PetHabitat({ name, level, progress, checked, leaves, room, reduced, transactions, goals, contributions, available, day, checkins, navigate }: { name: string; level: number; progress: number; checked: boolean; leaves: number; room: PetRoom; reduced: boolean; transactions: Transaction[]; goals: Goal[]; contributions: Contribution[]; available: number; day: string; checkins: number; navigate: (s: string) => void }) {
  const width = Math.min(useWindowDimensions().width - 48, 400), size = width * .72;
  const systemReduced = useReducedMotion(), quiet = reduced || systemReduced;
  const [mood, setMood] = useState<'idle' | 'wink' | 'happy' | 'focused'>('idle');
  const [message, setMessage] = useState('');
  const [quiz, setQuiz] = useState(false), [question, setQuestion] = useState(0), [answer, setAnswer] = useState<number | null>(null), [score, setScore] = useState(0);
  const [lineIndex, setLineIndex] = useState(0), [playing, setPlaying] = useState(false);
  const reactionIndex = useRef(0);
  const ballTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lift = useSharedValue(0), handX = useSharedValue(0), handY = useSharedValue(0), handVisible = useSharedValue(0), heart = useSharedValue(0), distance = useSharedValue(0), previousX = useSharedValue(0), previousY = useSharedValue(0), completed = useSharedValue(false);
  useEffect(() => { lift.set(quiet ? 0 : withRepeat(withTiming(-3, { duration: 2200, easing: Easing.inOut(Easing.ease) }), -1, true)); return () => cancelAnimation(lift); }, [lift, quiet]);
  const ballX = useSharedValue(0), ballY = useSharedValue(0), ballTurn = useSharedValue(0);
  useEffect(() => { const interval = setInterval(() => setLineIndex(n => n + 1), 24000); return () => clearInterval(interval); }, []);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); if (ballTimer.current) clearTimeout(ballTimer.current); cancelAnimation(ballX); cancelAnimation(ballY); cancelAnimation(ballTurn); }, [ballX, ballY, ballTurn]);
  const speak = useCallback((kind: keyof typeof mikoReactions) => {
    if (timer.current) clearTimeout(timer.current);
    setMessage(reactionLine(kind, reactionIndex.current++, name));
    setMood(kind === 'touch' ? 'wink' : 'happy');
    timer.current = setTimeout(() => { setMood('idle'); setMessage(''); }, 6000);
  }, [name]);
  const reactToTouch = useCallback((done: boolean) => {
    speak(done ? 'pet' : 'touch');
  }, [speak]);
  const highFive = useCallback(() => {
    speak('highfive');
    lift.set(quiet ? 0 : withSequence(withTiming(-12, { duration: 160 }), withTiming(0, { duration: 200 }), withRepeat(withTiming(-3, { duration: 2200, easing: Easing.inOut(Easing.ease) }), -1, true)));
  }, [lift, quiet, speak]);
  function tossBall() {
    if (playing) return;
    setPlaying(true); setMood('focused'); setMessage('Ke sini bolanya… aku siap!');
    ballX.set(quiet ? 0 : withSequence(withTiming(-width * .44, { duration: 500 }), withTiming(0, { duration: 550 })));
    ballY.set(quiet ? 0 : withSequence(withTiming(-65, { duration: 250 }), withTiming(0, { duration: 250 }), withTiming(-35, { duration: 260 }), withTiming(0, { duration: 290 })));
    ballTurn.set(quiet ? 0 : withTiming(360, { duration: 1050 }));
    ballTimer.current = setTimeout(() => { setPlaying(false); ballTurn.set(0); speak('ball'); lift.set(quiet ? 0 : withSequence(withTiming(-14, { duration: 160 }), withTiming(0, { duration: 200 }), withRepeat(withTiming(-3, { duration: 2200, easing: Easing.inOut(Easing.ease) }), -1, true))); }, 1100);
  }
  // These registered handlers run after a gesture starts, never during render.
  /* eslint-disable react-hooks/refs */
  const petting = useMemo(() => Gesture.Pan().activateAfterLongPress(550).onStart(e => {
    handVisible.set(1); handX.set(e.x); handY.set(e.y); previousX.set(e.x); previousY.set(e.y); distance.set(0); completed.set(false); scheduleOnRN(reactToTouch, false);
  }).onUpdate(e => {
    handX.set(e.x); handY.set(e.y);
    distance.set(distance.get() + Math.hypot(e.x - previousX.get(), e.y - previousY.get())); previousX.set(e.x); previousY.set(e.y);
    if (distance.get() >= 170 && !completed.get()) {
      completed.set(true); scheduleOnRN(reactToTouch, true);
      lift.set(quiet ? 0 : withSequence(withTiming(-22, { duration: 180 }), withTiming(0, { duration: 240 }), withRepeat(withTiming(-3, { duration: 2200, easing: Easing.inOut(Easing.ease) }), -1, true)));
      heart.set(1); heart.set(withTiming(0, { duration: quiet ? 2200 : 1800 }));
    }
  }).onFinalize(() => { handVisible.set(0); }), [completed, distance, handVisible, handX, handY, heart, lift, previousX, previousY, quiet, reactToTouch]);
  const tap = useMemo(() => Gesture.Tap().maxDuration(250).onEnd((_event, success) => { if (success) scheduleOnRN(highFive); }), [highFive]);
  /* eslint-enable react-hooks/refs */
  const interaction = useMemo(() => Gesture.Exclusive(petting, tap), [petting, tap]);
  const bodyStyle = useAnimatedStyle(() => ({ transform: [{ translateY: lift.get() }] }));
  const handStyle = useAnimatedStyle(() => ({ opacity: handVisible.get(), transform: [{ translateX: handX.get() - 20 }, { translateY: handY.get() - 10 }] }));
  const heartStyle = useAnimatedStyle(() => ({ opacity: heart.get(), transform: [{ translateY: quiet ? 0 : -45 * (1 - heart.get()) }] }));
  const ballStyle = useAnimatedStyle(() => ({ transform: [{ translateX: ballX.get() }, { translateY: ballY.get() }, { rotate: `${ballTurn.get()}deg` }] }));
  const lines = mikoLines({ transactions, goals, contributions, available, day, checked, room, level, name, checkins, hour: Number(new Intl.DateTimeFormat('en-GB', { hour: 'numeric', timeZone: 'Asia/Jakarta', hourCycle: 'h23' }).format(new Date())) });
  const line = lines[lineIndex % lines.length];
  const nextGift = petCatalog.filter(item => item.cost === 0 && item.level > level).sort((a, b) => a.level - b.level)[0];
  const q = moneyQuiz[question];
  return <>
    <View style={[styles.row, { justifyContent: 'space-between' }]}><View style={{ flex: 1, gap: 3 }}><Text style={type.title}>{name} si Macan</Text><Text style={[type.heading, { fontSize: 13, color: colors.accent }]}>{levelName(level)}</Text><Text style={[type.body, { fontSize: 11 }]}>Level {level}</Text></View><LeafBalance amount={leaves} /></View>
    <View style={{ backgroundColor: '#FFF4E7', borderColor: '#00323E', borderWidth: 2, borderRadius: 26, padding: 20, gap: 10, marginBottom: 10 }}><Text style={[type.heading, { color: '#00323E', fontSize: 16, lineHeight: 25 }]}>{message || line.text}</Text>{!message && line.route && <LinkButton text={line.action!} onPress={() => navigate(line.route!)} />}{!message && line.kind === 'record' && <Text style={[type.body, { fontSize: 10 }]}>Dari catatanmu; bukan saldo rekening.</Text>}<Svg pointerEvents="none" width="32" height="20" viewBox="0 0 32 20" style={{ position: 'absolute', bottom: -19, left: '46%' }}><Path d="M1 1L17 18L30 1" fill="#FFF4E7" stroke="#00323E" strokeWidth="2" strokeLinejoin="round" /><Path d="M3 0H28" stroke="#FFF4E7" strokeWidth="4" /></Svg></View>
    <View style={{ width, height: width * .94, alignSelf: 'center', borderRadius: 28, overflow: 'hidden' }}><RoomArt room={room} />{(['left', 'right', 'toy'] as const).map(slot => room[slot] && <View key={slot} pointerEvents="none" style={{ position: 'absolute', left: width * (slot === 'left' ? .025 : slot === 'right' ? .76 : .74), top: width * (slot === 'toy' ? .76 : .52) }}><ItemArt id={room[slot]!} size={width * .21} /></View>)}<GestureDetector gesture={interaction}><Animated.View accessible accessibilityRole="button" accessibilityLabel={`${name}. Ketuk untuk tos, tahan lalu usap untuk mengelus.`} accessibilityActions={[{ name: 'activate', label: `Tos bersama ${name}` }, { name: 'pet', label: `Elus ${name}` }]} onAccessibilityAction={e => e.nativeEvent.actionName === 'pet' ? reactToTouch(true) : highFive()} style={[{ position: 'absolute', left: width * .14, top: width * .17, width: size, height: size }, bodyStyle]}><Miko name={name} size={size} reduced mood={mood} /><View pointerEvents="none" style={{ position: 'absolute' }}><WearableArt room={room} size={size} /></View><Animated.View pointerEvents="none" style={[{ position: 'absolute', left: 0, top: 0 }, handStyle]}><Svg width="48" height="54" viewBox="0 0 48 54"><Path d="M16 45L7 31Q3 24 9 24L17 31V8Q17 2 22 4V24L25 15Q29 10 31 16V26L34 20Q39 17 40 23V34Q40 44 33 50H20Z" fill="#FFF4E7" stroke="#00323E" strokeWidth="2.5" strokeLinejoin="round" /></Svg></Animated.View><Animated.View pointerEvents="none" style={[{ position: 'absolute', left: size * .67, top: size * .08 }, heartStyle]}><Ionicons name="heart" size={35} color={colors.orange} /></Animated.View></Animated.View></GestureDetector><Animated.View pointerEvents="none" style={[{ position: 'absolute', left: width * .77, top: width * .76, opacity: playing ? 1 : 0 }, ballStyle]}><ItemArt id="ball" size={width * .17} /></Animated.View></View>
    <Text style={[type.body, { textAlign: 'center', fontSize: 12 }]}>Ketuk {name} untuk tos. Tahan lalu usap untuk mengelus.</Text>
    <View style={styles.row}><View style={{ flex: 1 }}><Button secondary text={playing ? `${name} mengejar bola…` : 'Lempar bola'} disabled={playing} onPress={tossBall} /></View><View style={{ flex: 1 }}><Button secondary text="Ajak ngobrol" onPress={() => { if (timer.current) clearTimeout(timer.current); setMessage(''); setMood('wink'); setLineIndex(n => n + 1); timer.current = setTimeout(() => setMood('idle'), 1800); }} /></View></View>
    <Card><Text style={type.heading}>{progress} / 200 XP ke level {level + 1}</Text><Progress value={progress / 200} /><Text style={type.body}>{nextGift ? `Hadiah berikutnya: ${nextGift.name} di level ${nextGift.level}. Ambil gratis di toko saat terbuka.` : 'Semua hadiah level sudah terbuka. Koleksimu tetap bisa berkembang.'}</Text><LinkButton text="Atur penampilan & kamar" onPress={() => navigate('wardrobe')} /></Card>

    <Card tone="pale"><Text style={type.heading}>{checked ? 'Check-in hari ini selesai' : `Cek harimu bersama ${name}`}</Text><Text style={type.body}>Review catatan atau konfirmasi tanpa belanja. Sekali sehari: +20 XP dan 10 daun.</Text><Button text={checked ? 'Lihat check-in' : 'Mulai check-in'} onPress={() => navigate('checkin')} /></Card>
    <Card><Text style={type.heading}>Main sebentar, belajar sedikit</Text><Text style={type.body}>Kuis uang bersama {name}. Tanpa belanja, tanpa taruhan, tanpa tambahan XP.</Text>{!quiz ? <Button secondary text="Main kuis" onPress={() => { setQuiz(true); setQuestion(0); setAnswer(null); setScore(0); }} /> : question < moneyQuiz.length ? <><Text style={type.body}>Pertanyaan {question + 1} dari {moneyQuiz.length}</Text><Text style={type.heading}>{q.question.replaceAll('Miko', name)}</Text>{q.answers.map((a, i) => <Button key={a} secondary text={a} disabled={answer !== null} onPress={() => { setAnswer(i); if (i === q.correct) setScore(n => n + 1); reactToTouch(i === q.correct); }} />)}{answer !== null && <><Text accessibilityLiveRegion="polite" style={type.body}>{answer === q.correct ? 'Benar! ' : 'Yuk, belajar bersama. '}{q.explanation}</Text><Button text="Lanjut" onPress={() => { setQuestion(n => n + 1); setAnswer(null); }} /></>}</> : <><Text style={type.heading}>{score} dari {moneyQuiz.length} benar</Text><Text style={type.body}>Selesai! Kebiasaan kecil lebih berarti daripada skor sempurna.</Text><Button text="Selesai bermain" onPress={() => setQuiz(false)} /></>}</Card>
  </>;
}
export function PetShop({ level, leaves, accessories, room, busy, redeem, equip }: { level: number; leaves: number; accessories: Accessory[]; room: PetRoom; busy: boolean; redeem: (id: string) => void; equip: (slot: string, id: string | null) => void }) {
  const [filter, setFilter] = useState<'all' | 'wear' | 'room' | 'owned' | 'exclusive'>('all');
  return <><LeafBalance amount={leaves} /><Text style={type.body}>{petCatalog.length} koleksi. Eksklusif sampai level 120, lebih dari tiga tahun. Daun hanya dari check-in; tidak ada pembelian uang asli.</Text><View style={[styles.row, { flexWrap: 'wrap' }]}>{([['all', 'Semua'], ['wear', 'Aksesori'], ['room', 'Kamar'], ['owned', 'Milikku'], ['exclusive', 'Eksklusif']] as const).map(([key, title]) => <Pressable key={key} onPress={() => setFilter(key)} accessibilityRole="button" accessibilityState={{ selected: key === filter }} style={{ minHeight: 44, justifyContent: 'center', paddingHorizontal: 12, borderRadius: 18, backgroundColor: filter === key ? colors.mist : colors.white }}><Text style={type.body}>{title}</Text></Pressable>)}</View>{petCatalog.filter(item => filter === 'all' || (filter === 'exclusive' ? item.level >= 8 : filter === 'owned' ? accessories.some(a => a.accessory === item.id) : filter === 'wear' ? ['head', 'face'].includes(item.slot) : !['head', 'face'].includes(item.slot))).map(item => {
    const owned = accessories.some(a => a.accessory === item.id), equipped = room[item.slot] === item.id, locked = level < item.level;
    return <Card key={item.id}><View style={styles.row}><ItemArt id={item.id} /><View style={{ flex: 1 }}><Text style={type.heading}>{item.name}</Text><Text style={type.body}>{item.description}</Text>{item.level >= 8 && <Text style={[type.body, { fontSize: 11, color: colors.accent }]}>{(item.level - 1) * 10} check-in untuk level {item.level}. Boleh terlewat hari.</Text>}{!owned && (item.cost === 0 ? <Text style={type.body}>Hadiah level {item.level}</Text> : <LeafBalance amount={item.cost} />)}</View></View><Button secondary={owned} disabled={busy || locked || (!owned && leaves < item.cost)} text={locked ? `Terbuka di level ${item.level}` : owned ? equipped ? 'Lepas' : 'Pasang' : item.cost === 0 ? 'Ambil hadiah level' : leaves < item.cost ? `Perlu ${item.cost} daun` : 'Tukar daun'} onPress={() => owned ? equip(item.slot, equipped ? null : item.id) : redeem(item.id)} /></Card>;
  })}</>;
}
