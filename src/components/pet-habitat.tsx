import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, Text, View, useWindowDimensions } from 'react-native';
import { BottomSheet, Host, Column as SheetColumn, Button as SheetButton, Text as SheetText } from '@expo/ui';
import { PetSpeech } from './pet-speech';
import Ionicons from '@expo/vector-icons/Ionicons';
import Svg, { Path } from 'react-native-svg';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withSequence, withTiming, cancelAnimation } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { Miko, Button, Card, Progress, type, colors, styles, LinkButton } from './ui';
import { ItemArt, RoomArt, WearableArt } from './pet-art';
import { PetRoom, levelName, petCatalog } from '../lib/pet';
import { mikoLines, mikoReactions, reactionLine, dialogueMood } from '../lib/miko-dialogue';
import { useDailyQuiz } from '../hooks/useDailyQuiz';
import { quizById, type QuizSession } from '../lib/daily-quiz';
import { roomLayout, slotNames, validRoom } from '../lib/pet-layout';
import { Accessory, Contribution, Goal, Transaction } from '../lib/finance';

export function LeafBalance({ amount, label = 'daun' }: { amount: number; label?: string }) {
  return <View style={[styles.row, { gap: 6 }]}><Ionicons name="leaf" size={20} color={colors.accent} /><Text style={type.heading}>{amount} {label}</Text></View>;
}
export function PetHabitat({ name, level, progress, checked, leaves, room: suppliedRoom, reduced, transactions, goals, contributions, available, day, checkins, navigate, quizSession, refresh = async () => {} }: { name: string; level: number; progress: number; checked: boolean; leaves: number; room: PetRoom; reduced: boolean; transactions: Transaction[]; goals: Goal[]; contributions: Contribution[]; available: number; day: string; checkins: number; navigate: (s: string) => void; quizSession?: QuizSession; refresh?: () => Promise<void> }) {
  const width = Math.min(useWindowDimensions().width - 48, 400), size = width * roomLayout.character.size;
  const room = validRoom(suppliedRoom);
  const daily = useDailyQuiz(day, quizSession, refresh);
  const question = daily.position, answer = daily.feedback ? daily.session?.answers[question] ?? null : null;
  const q = daily.question;
  const quizDone = !!daily.session?.completed && !daily.feedback;
  const score = daily.session?.answers.reduce((n, a, i) => n + (a === quizById.get(daily.session!.question_ids[i])?.correct ? 1 : 0), 0) || 0;
  const systemReduced = useReducedMotion(), quiet = reduced || systemReduced;
  const [mood, setMood] = useState<'idle' | 'wink' | 'happy' | 'focused'>('idle');
  const [message, setMessage] = useState('');
  const [answerOpen, setAnswerOpen] = useState(false);
  const [quiz, setQuiz] = useState(false);
  const [lineIndex, setLineIndex] = useState(0), [playing, setPlaying] = useState(false);
  const reactionIndex = useRef(0);
  const ballTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lift = useSharedValue(0), handX = useSharedValue(0), handY = useSharedValue(0), handVisible = useSharedValue(0), heart = useSharedValue(0), distance = useSharedValue(0), previousX = useSharedValue(0), previousY = useSharedValue(0), completed = useSharedValue(false);
  useEffect(() => { lift.set(quiet ? 0 : withRepeat(withTiming(-3, { duration: 2200, easing: Easing.inOut(Easing.ease) }), -1, true)); return () => cancelAnimation(lift); }, [lift, quiet]);
  const ballX = useSharedValue(0), ballY = useSharedValue(0), ballTurn = useSharedValue(0);
  useEffect(() => { if (quiz) return; const interval = setInterval(() => setLineIndex(n => n + 1), 24000); return () => clearInterval(interval); }, [quiz]);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); if (ballTimer.current) clearTimeout(ballTimer.current); cancelAnimation(ballX); cancelAnimation(ballY); cancelAnimation(ballTurn); }, [ballX, ballY, ballTurn]);
  const speak = useCallback((kind: keyof typeof mikoReactions) => {
    if (quiz) return;
    if (timer.current) clearTimeout(timer.current);
    setMessage(reactionLine(kind, reactionIndex.current++, name));
    setMood(kind === 'touch' ? 'wink' : 'happy');
    timer.current = setTimeout(() => { setMood('idle'); setMessage(''); }, 6000);
  }, [name, quiz, setMessage, setMood]);
  const reactToTouch = useCallback((done: boolean) => {
    speak(done ? 'pet' : 'touch');
  }, [speak]);
  const highFive = useCallback(() => {
    speak('highfive');
    lift.set(quiet ? 0 : withSequence(withTiming(-12, { duration: 160 }), withTiming(0, { duration: 200 }), withRepeat(withTiming(-3, { duration: 2200, easing: Easing.inOut(Easing.ease) }), -1, true)));
  }, [lift, quiet, speak]);
  function tossBall() {
    if (playing || quiz) return;
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

  return <>
    <View style={[styles.row, { justifyContent: 'space-between' }]}><View style={{ flex: 1, gap: 3 }}><Text style={type.title}>{name} si Macan</Text><Text style={[type.heading, { fontSize: 13, color: colors.accent }]}>{levelName(level)}</Text><Text style={[type.body, { fontSize: 11 }]}>Level {level}</Text></View><LeafBalance amount={leaves} /></View>
    <View testID="pet-room" style={{ width, height: width * roomLayout.height + 168, alignSelf: 'center', borderRadius: 28, overflow: 'hidden', backgroundColor: '#FFF4E7' }}><View testID="pet-room-interior" style={{ height: width * roomLayout.height }}><RoomArt room={room} />{(['left', 'right', 'toy'] as const).map(slot => room[slot] && <View key={slot} pointerEvents="none" style={{ position: 'absolute', left: width * roomLayout[slot].x, top: width * roomLayout[slot].y }}><ItemArt id={room[slot]!} size={width * roomLayout[slot].size} /></View>)}<GestureDetector gesture={interaction}><Animated.View accessible accessibilityRole="button" accessibilityLabel={`${name}. Ketuk untuk tos, tahan lalu usap untuk mengelus.`} accessibilityActions={[{ name: 'activate', label: `Tos bersama ${name}` }, { name: 'pet', label: `Elus ${name}` }]} onAccessibilityAction={e => e.nativeEvent.actionName === 'pet' ? reactToTouch(true) : highFive()} style={[{ position: 'absolute', left: width * roomLayout.character.x, top: width * roomLayout.character.y, width: size, height: size }, bodyStyle]}><Miko name={name} size={size} reduced mood={quiz || message ? mood : dialogueMood(line)} /><View pointerEvents="none" style={{ position: 'absolute' }}><WearableArt room={room} size={size} /></View><Animated.View pointerEvents="none" style={[{ position: 'absolute', left: 0, top: 0 }, handStyle]}><Svg width="48" height="54" viewBox="0 0 48 54"><Path d="M16 45L7 31Q3 24 9 24L17 31V8Q17 2 22 4V24L25 15Q29 10 31 16V26L34 20Q39 17 40 23V34Q40 44 33 50H20Z" fill="#FFF4E7" stroke="#00323E" strokeWidth="2.5" strokeLinejoin="round" /></Svg></Animated.View><Animated.View pointerEvents="none" style={[{ position: 'absolute', left: size * .67, top: size * .08 }, heartStyle]}><Ionicons name="heart" size={35} color={colors.orange} /></Animated.View></Animated.View></GestureDetector><Animated.View pointerEvents="none" style={[{ position: 'absolute', left: width * roomLayout.toy.x, top: width * roomLayout.toy.y, opacity: playing ? 1 : 0 }, ballStyle]}><ItemArt id="ball" size={width * .17} /></Animated.View></View><PetSpeech text={quiz ? daily.error || (daily.loading ? 'Sebentar ya, aku ambil buku kuis kita…' : quizDone ? `Hore, selesai! ${score} dari 5 benar. Lima daun sudah masuk. Besok kita belajar lagi, ya!` : q ? answer === null ? q.question.replaceAll('Miko', name) : `${answer === q.correct ? 'Yay, betul! ' : 'Hampir! Yuk, kita cari tahu. '}${q.explanation}` : 'Yuk, ambil lima pertanyaan hari ini!') : message || line.text} action={quiz ? daily.loading ? undefined : daily.error ? 'Coba lagi' : quizDone ? 'Selesai bermain' : answer === null ? q ? 'Pilih jawaban' : 'Mulai' : 'Lanjut' : !message ? line.action : undefined} onPress={quiz ? () => { if (daily.error || !daily.session) { void daily.start().then(() => setAnswerOpen(true)); } else if (quizDone) { setQuiz(false); setMood('idle'); } else if (answer === null) setAnswerOpen(true); else { daily.next(); setMood('focused'); setAnswerOpen(!daily.session.completed); } } : () => line.route && navigate(line.route)} /></View>
    <Text style={[type.body, { textAlign: 'center', fontSize: 12 }]}>Ketuk {name} untuk tos. Tahan lalu usap untuk mengelus.</Text>
    <View style={styles.row}>
      <PetAction text={playing ? `${name} mengejar bola…` : 'Lempar bola'} icon="football-outline" disabled={playing || quiz} onPress={tossBall} />
      <PetAction text={quiz ? 'Tutup kuis' : (daily.session?.completed || quizSession?.completed) ? 'Kuis selesai' : 'Main kuis'} icon="help-circle-outline" disabled={playing} onPress={() => { if (timer.current) clearTimeout(timer.current); setMessage(''); setMood(quiz ? 'idle' : 'focused'); setQuiz(!quiz); setAnswerOpen(false); if (!quiz) void daily.start().then(() => setAnswerOpen(true)); }} />
      <PetAction text="Ajak ngobrol" icon="chatbubble-outline" disabled={quiz || playing} onPress={() => { if (timer.current) clearTimeout(timer.current); setMessage(''); setLineIndex(n => n + 1); }} />
    </View>
    <Host style={{ height: 0 }} colorScheme="light" seedColor={colors.accent}><BottomSheet testID="quiz-answers" isPresented={answerOpen && quiz && !quizDone && !!q && answer === null && !daily.loading} onDismiss={() => setAnswerOpen(false)} containerColor="#FFF4E7" contentPadding={24}>
      <SheetColumn spacing={12} style={{ width }}>
        <SheetText textStyle={{ fontSize: 12, color: '#007D91' }}>{`Kuis bersama ${name} (${question + 1} dari 5)`}</SheetText>
        <SheetText textStyle={{ fontSize: 18, fontWeight: '600', color: '#00323E' }}>{q?.question.replaceAll('Miko', name)}</SheetText>
        {q?.answers.map((choice, i) => <SheetButton key={`${question}-${choice}`} testID={`quiz-choice-${i}`} variant="outlined" style={{ width, paddingVertical: 8 }} onPress={() => { if (answer !== null || daily.loading) return; setAnswerOpen(false); void daily.answer(i); setMood(i === q.correct ? 'happy' : 'focused'); }}><SheetText textStyle={{ fontSize: 15, fontWeight: '600', color: '#00323E' }}>{choice}</SheetText></SheetButton>)}
      </SheetColumn>
    </BottomSheet></Host>
    <Card tone="pale"><Text style={type.heading}>Lima pertanyaan, satu kebiasaan baru</Text><Text style={type.body}>Kuis baru setiap hari. Selesaikan kelimanya untuk 5 daun; salah jawab juga boleh, kita belajar bareng.</Text></Card>
    <Card><Text style={type.heading}>{progress} / 200 XP ke level {level + 1}</Text><Progress value={progress / 200} /><Text style={type.body}>{nextGift ? `Hadiah berikutnya: ${nextGift.name} di level ${nextGift.level}. Ambil gratis di toko saat terbuka.` : 'Semua hadiah level sudah terbuka. Koleksimu tetap bisa berkembang.'}</Text><LinkButton text="Atur penampilan & kamar" onPress={() => navigate('wardrobe')} /></Card>

    <Card tone="pale"><Text style={type.heading}>{checked ? 'Check-in hari ini selesai' : `Cek harimu bersama ${name}`}</Text><Text style={type.body}>Review catatan atau konfirmasi tanpa belanja. Sekali sehari: +20 XP dan 10 daun.</Text><Button text={checked ? 'Lihat check-in' : 'Mulai check-in'} onPress={() => navigate('checkin')} /></Card>

  </>;
}
export function PetShop({ level, leaves, accessories, room, busy, redeem, equip }: { level: number; leaves: number; accessories: Accessory[]; room: PetRoom; busy: boolean; redeem: (id: string) => void; equip: (slot: string, id: string | null) => void }) {
  const [filter, setFilter] = useState<'all' | 'wear' | 'room' | 'owned' | 'exclusive'>('all');
  return <><LeafBalance amount={leaves} /><Text style={type.body}>Pilih gaya favorit dan bikin sudut kecil yang terasa seperti rumah.</Text><Text style={[type.body, { fontSize: 12 }]}>Satu hiasan di tiap tempat. Pasang favorit baru untuk mengganti yang lama.</Text><View style={[styles.row, { flexWrap: 'wrap' }]}>{([['all', 'Semua'], ['wear', 'Aksesori'], ['room', 'Kamar'], ['owned', 'Milikku'], ['exclusive', 'Eksklusif']] as const).map(([key, title]) => <Pressable key={key} onPress={() => setFilter(key)} accessibilityRole="button" accessibilityState={{ selected: key === filter }} style={{ minHeight: 44, justifyContent: 'center', paddingHorizontal: 12, borderRadius: 18, backgroundColor: filter === key ? colors.mist : colors.white }}><Text style={type.body}>{title}</Text></Pressable>)}</View>{petCatalog.filter(item => filter === 'all' || (filter === 'exclusive' ? item.level >= 8 : filter === 'owned' ? accessories.some(a => a.accessory === item.id) : filter === 'wear' ? ['head', 'face'].includes(item.slot) : !['head', 'face'].includes(item.slot))).map(item => {
    const owned = accessories.some(a => a.accessory === item.id), equipped = room[item.slot] === item.id, locked = level < item.level;
    return <Card key={item.id}><View style={styles.row}><ItemArt id={item.id} /><View style={{ flex: 1 }}><Text style={type.heading}>{item.name}</Text><Text style={type.body}>{item.description}</Text><Text style={[type.body, { fontSize: 12, color: colors.accent }]}>{slotNames[item.slot]}{!equipped && room[item.slot] ? ` · Mengganti ${petCatalog.find(i => i.id === room[item.slot])?.name || 'hiasan di sini'}` : ''}</Text>{item.level >= 8 && <Text style={[type.body, { fontSize: 11, color: colors.accent }]}>{(item.level - 1) * 10} check-in untuk level {item.level}. Boleh terlewat hari.</Text>}{!owned && (item.cost === 0 ? <Text style={type.body}>Hadiah level {item.level}</Text> : <LeafBalance amount={item.cost} />)}</View></View><Button secondary={owned} disabled={busy || locked || (!owned && leaves < item.cost)} text={locked ? `Terbuka di level ${item.level}` : owned ? equipped ? 'Lepas' : 'Pasang' : item.cost === 0 ? 'Ambil hadiah level' : leaves < item.cost ? `Perlu ${item.cost} daun` : 'Tukar daun'} onPress={() => owned ? equip(item.slot, equipped ? null : item.id) : redeem(item.id)} /></Card>;
  })}</>;
}

function PetAction({ text, icon, disabled, onPress }: { text: string; icon: 'football-outline' | 'help-circle-outline' | 'chatbubble-outline'; disabled: boolean; onPress: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={text} accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={{ flex: 1, height: 72, alignItems: 'center', justifyContent: 'center', gap: 7, backgroundColor: colors.white, borderColor: colors.mist, borderWidth: 1, borderRadius: 18, opacity: disabled ? .5 : 1 }}><Ionicons name={icon} size={22} color={colors.accent} /><Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={.8} style={[type.heading, { fontSize: 12 }]}>{text}</Text></Pressable>;
}
