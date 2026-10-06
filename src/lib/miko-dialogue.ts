import { money, type Transaction, type Goal, type Contribution } from './finance.ts';
import { type PetRoom } from './pet.ts';
export interface MikoLine { text: string; action?: string; route?: string; kind: 'personal' | 'record'; }
export function dialogueMood(line: MikoLine): 'idle' | 'happy' | 'wink' | 'focused' | 'rest' {
  if (/hore|tos|senang|seru|semangat|lompat|main bola|kembali/i.test(line.text)) return 'happy';
  if (/ngantuk|tidur|menguap|rebahan|lelah|rehat/i.test(line.text)) return 'rest';
  if (/ups|hehe|kusut|galak|bayangan|salah dengar/i.test(line.text)) return 'wink';
  if (line.kind === 'record' || /belajar|buku|penasaran|cerita|dengerin|dengar/i.test(line.text)) return 'focused';
  return 'idle';
}
// Miko is curious, playful and quietly supportive. She never shames a missed
// day, claims to see a bank account, or rewards spending or pet-care taps.
export const mikoPersonality = [
  "Eh, aku tadi hitung totolku. Lupa lagi gara-gara ekorku gerak!",
  "Syal udah rapi. Eh, ujungnya masih miring.",
  "Tempat paling enak itu dekat jendela. Hangat banget.",
  "Rencana besarku hari ini: tidur sebentar. Habis itu main!",
  "Dengar itu? Kayaknya bolaku menggelinding sendiri.",
  "Hari kamu gimana? Aku tadi sibuk pilih bantal.",
  "Tos dulu, yuk! Cakarku sudah siap.",
  "Benangnya kusut. Aku cuma colek dikit… kayaknya.",
  "Ada cerita seru hari ini? Aku pasang telinga!",
  "Aku coba pasang muka galak. Malah jadi senyum.",
  "Syal biru ini cocok, kan? Aku suka banget.",
  "Mau ngobrol atau duduk bareng dulu?",
  "Sini, duduk dekat aku.",
  "Capek? Kita rebahan sebentar, yuk.",
  "Aku kejar bayanganku tadi. Kok ikut lari terus?",
  "Kamu lagi belajar apa? Aku mau ikut lihat.",
  "Aku bisa duduk manis. Coba hitung sampai tiga!",
  "Sudah minum? Aku habis main, jadi haus.",
  "Huft, enak juga duduk santai begini.",
  "Bolanya berhenti di bawah ekor. Pantas aku cari ke mana-mana!",
  "Besok ceritain harimu lagi, ya?",
  "Satu lemparan lagi? Yang pelan saja!",
  "Buku yang tinggi aku taruh di bawah. Jadi tangga kecil!",
  "Kalau hari ini ribet, kita rapikan satu-satu.",
  "Eh, kamu datang! Aku baru mau cari kamu.",
  "Ada totol kecil di telingaku. Lucu, ya?",
  "Aku nemu tempat tidur baru. Di atas buku… ups.",
  "Hari ini mau ngapain? Aku ikut!",
  "Aku penasaran sama semua tombol di sini.",
  "Yuk, mulai lagi. Aku sudah siap.",
  "Kakiku kecil, tapi larinya lumayan!",
  "Coba sekali lagi? Kali ini aku bantu semangatin.",
  "Piknik di dekat jendela juga seru, lho.",
  "Pelan-pelan saja. Aku tungguin.",
  "Aku duduk diam kalau kamu fokus. Ekorku agak susah diatur.",
  "Bantal ini empuk banget. Coba lihat!",
  "Aku menguap dulu. Huaa… selesai!",
  "Oh, kamu mampir. Aku tadi lagi cari bola.",
  "Satu hal dulu, yuk. Habis itu main sebentar.",
  "Aku suka nemenin kamu. Apalagi kalau ada tos.",
  "Kamar kita mau dihias apa lagi?",
  "Aku suka kejutan. Asal bolanya nggak kena hidung!",
  "Aku baru baca dua halaman. Gambarnya bagus.",
  "Anginnya bikin syalku goyang. Kayak bendera kecil!",
  "Ada yang bikin kamu senyum hari ini?",
  "Mau cerita apa aja, boleh. Aku dengerin.",
  "Aku hampir tidur sambil duduk. Hampir!",
  "Ketuk aku buat tos. Mau elus? Tahan, lalu usap.",
  "Hup! Lompatanku tadi lumayan tinggi, kan?",
  "Cerita hal kecil juga boleh. Aku penasaran.",
  "Kamar kita nyaman banget sekarang.",
  "Kamu habis sibuk, ya? Duduk dulu sini.",
  "Langit sore cantik. Aku mau lihat dari jendela.",
  "Hari ini kamu ingin ditemenin ngapain?",
  "Aku jawab cepat tadi. Ternyata salah dengar. Hehe.",
  "Kita sisakan waktu buat main, ya?",
  "Bolanya aku jaga. Jangan khawatir!",
  "Aku suka cara kita main bareng.",
  "Kakiku pendek. Bolanya kok jauh banget?",
  "Hai lagi! Mau mulai dari mana?"
];
export const mikoReactions = {
  pet: ['Hehe, enak banget dielus!', 'Aku boleh duduk dekat kamu sebentar?', 'Mmm, aku betah banget di sini.', 'Syalku sedikit miring, tapi aku suka.', 'Makasih sudah nemenin aku!'],
  touch: ['Mmm… terusin, ya. Enak banget.', 'Pelan-pelan… bagian atas kepalaku paling nyaman.', 'Pelan-pelan… aku bisa mengantuk kalau begini.'],
  highfive: ['Tos! Kita kompak banget!', 'Hup! Pas. Sekali lagi?', 'Tos! Udah hafal, nih.', 'Tos! Eh, cakarku nggak kena, kan?'],
  ball: ['Ketangkap! Wih, cepat juga.', 'Aku balikin, ya. Awas bolanya!', 'Hup! Hampir kena syal. Hehe.', 'Hup! Seru. Mau sekali lagi?'],
};
export const bondDialogue = [
  [
    "Hai, aku masih hafalin kamar baru kita.",
    "Boleh duduk dekat kamu? Aku agak malu.",
    "Tos pertama kita! Jangan kencang-kencang, ya.",
    "Aku cari sudut buat tidur. Yang ini enak!",
    "Namaku lucu, ya. Aku masih latihan nyebutnya.",
    "Aku belum tahu banyak soal kamu. Kita kenalan dulu, ya.",
    "Kamu suka main bola juga?",
    "Mau lihat-lihat dulu? Aku temenin.",
    "Bola di rumah baru bunyinya beda, lho.",
    "Oh, ini kamarku? Boleh lihat-lihat dulu?",
    "Aku senang kita ketemu.",
    "Mau coba tos? Aku masih belajar."
  ],
  [
    "Oh, kamu lagi. Aku mulai hafal, nih.",
    "Tos kita makin kompak!",
    "Senang deh kita punya waktu bareng.",
    "Udah beberapa kali ketemu, ya. Aku nggak malu kayak awal.",
    "Pas banget. Aku baru bangun tadi.",
    "Sudut ini paling enak buat tidur. Kamu udah lihat?",
    "Catatannya kita rapikan bareng, yuk.",
    "Harimu seru atau melelahkan? Cerita dong.",
    "Kamar ini mulai terasa kayak rumah.",
    "Aku senang lihat kamu lagi.",
    "Kita makin jago, ya?",
    "Masih ingat waktu pertama kita kenalan?"
  ],
  [
    "Kita sudah lama kenal. Aku nyaman banget di sini.",
    "Aku kangen cerita kecilmu. Hari ini ada apa?",
    "Tempat sebelahku kosong. Buat kamu!",
    "Udah lama juga kita kenal, ya.",
    "Rencana berubah? Yuk, lihat lagi bareng.",
    "Aku hafal tos kamu sekarang.",
    "Teman lama, cerita baru! Aku siap dengerin.",
    "Targetnya mau diganti? Aku ikut lihat.",
    "Dulu aku suka bingung. Sekarang lumayan ngerti.",
    "Kamu sibuk belakangan ini? Senang kamu mampir.",
    "Lihat kamar kita. Banyak kenangannya!",
    "Kalau mampir sebentar pun aku senang."
  ],
  [
    "Udah lebih dari setahun! Kok cepat, ya.",
    "Banyak yang berubah, ya. Bolaku aja masih sama.",
    "Sini, tempat nyamanmu masih ada.",
    "Lama berteman, aku tetap senang tiap kamu datang.",
    "Ada hal baru? Ceritain dong!",
    "Makasih udah sering mampir. Aku senang, beneran.",
    "Bola lama ini tetap favoritku.",
    "Ingat waktu kamar kita masih kosong?",
    "Hari lagi berat? Aku duduk di sebelahmu.",
    "Masih ada banyak hal buat kita coba.",
    "Cerita aja. Aku udah siap dengerin kayak biasa.",
    "Aku masih suka kepo. Yang itu nggak berubah. Hehe."
  ]
];
export const everydayDialogue = [
  "Sudah makan? Aku kepikiran camilan.",
  "Sepatumu habis jalan jauh hari ini?",
  "Aku baru bangun. Rambut kepalaku rapi nggak?",
  "Hari ini ramai banget? Sini istirahat.",
  "Aku jadi petualang jendela hari ini.",
  "Sore-sore enaknya ngapain, ya?",
  "Bolanya aman sama aku. Kayaknya.",
  "Eh, sempat mampir! Lagi ngapain?",
  "Buku tutup dulu. Kita ngobrol!",
  "Kabar kecil juga kabar. Cerita dong.",
  "Bingung pilih yang mana? Kita lihat pelan-pelan.",
  "Aku suka hari biasa kalau ada kamu.",
  "Sunyi ya? Aku bisa jadi teman duduk.",
  "Katanya nanti aku makin besar. Bantal ini masih muat nggak, ya?",
  "Kamu mulai sesuatu yang baru hari ini?",
  "Aku bantu semangatin, ya!",
  "Lagi pengin cerita atau diam sebentar?",
  "Aku sambut kamu pakai tos. Sini!",
  "Syalku rapi. Siap dengar ceritamu.",
  "Oke, aku ikut duduk manis.",
  "Main bola memang seru. Kejar-kejarannya lebih seru!",
  "Hari ini kita santai saja, yuk.",
  "Kamu punya lagu favorit? Aku pengin dengar.",
  "Rehat sebentar, yuk. Ekorku juga lelah.",
  "Di luar seru, tapi kamar kita nyaman.",
  "Kalau lelah, duduk dekat aku.",
  "Tadi bolanya lewat di antara kakiku. Aku bengong!",
  "Selesai semua? Hore, waktunya santai.",
  "Jadwalmu berubah? Aku tetap di sini.",
  "Ada permainan baru yang mau kamu coba?",
  "Selamat datang lagi di kamar kita!",
  "Kamu lebih suka pagi atau malam?",
  "Aku suka saat kamu cerita sambil santai.",
  "Telingaku besar. Ceritamu pasti kedengaran!",
  "Nggak ngapa-ngapain juga enak, ya. Duduk aja dulu.",
  "Aku ngantuk di tengah rencana besar. Hehe."
];
export function bondStage(checkins: number) {
  return checkins >= 365 ? 3 : checkins >= 90 ? 2 : checkins >= 30 ? 1 : 0;
}
const newFriendReactions = {
  pet: ['Oh… makasih. Pelan-pelan, ya.', 'Hmm, ternyata enak juga.', 'Aku belum biasa dielus. Sebentar aja, ya.'],
  touch: ['Oh? Mau elus? Pelan-pelan dulu, ya.', 'Bagian sini aja dulu… boleh?', 'Aku agak geli. Hehe.'],
  highfive: ['Tos! Eh… gini, kan?', 'Hup! Kena nggak tadi?', 'Tos dulu. Aku coba, ya!'],
  ball: ['Ketangkap! Eh, seru juga.', 'Hup! Tadi hampir lewat.', 'Bolanya di sini. Mau coba lagi?'],
};
const familiarReactions = {
  pet: ['Hehe, enak. Makasih, ya.', 'Eh, syalku miring. Bentar…', 'Aku mulai biasa sama elusanmu.'],
  touch: ['Oh, mau elus? Boleh.', 'Pelan dikit, aku geli. Hehe.', 'Iya, sebelah sini.'],
  highfive: ['Tos! Kali ini pas.', 'Hup! Kita mulai jago.', 'Tos lagi? Aku siap.'],
  ball: ['Hup, dapat! Sekali lagi?', 'Tadi bolanya lewat bawah kakiku. Hehe.', 'Aku balikin, ya. Siap?'],
};
export function reactionLine(kind: keyof typeof mikoReactions, index: number, name: string, checkins = 0) {
  const bank = bondStage(checkins) === 0 ? newFriendReactions : bondStage(checkins) === 1 ? familiarReactions : mikoReactions;
  return bank[kind][index % bank[kind].length].replaceAll('Miko', name);
}
export function mikoLines(context: { transactions: Transaction[]; goals: Goal[]; contributions: Contribution[]; available: number; day: string; checked: boolean; room: PetRoom; level: number; hour: number; name?: string; checkins?: number }): MikoLine[] {
  const { transactions, goals, contributions, available, day, checked, room, level, hour, name = 'Miko', checkins = 0 } = context;
  const bond = bondStage(checkins);
  // Shared jokes never imply a relationship that has not developed yet.
  const personal: MikoLine[] = mikoPersonality.filter(text => bond >= 2 || !/dekat aku|kamar kita|nemenin|temenin|tungguin|aku ikut|apa saja|apa aja|bareng|cari kamu|besok ceritain|boleh cerita/i.test(text)).map(text => ({ text, kind: 'personal' }));
  personal.unshift(...bondDialogue[bond].map(text => ({ text, kind: 'personal' as const })));
  if (bond >= 2) personal.push(...everydayDialogue.map(text => ({ text, kind: 'personal' as const })));
  personal.unshift({ text: bond === 0 ? `Hai… aku ${name}. Mau coba tos?` : 'Eh, hai lagi! Lagi ngapain?', kind: 'personal' });
  if (checkins >= 365) personal.unshift({ text: checkins >= 1095 ? 'Tiga tahun lebih! Bolaku masih yang itu. Hehe.' : 'Udah setahun lebih, ya. Aku senang masih ketemu kamu.', kind: 'personal' });
  personal.unshift({ text: hour < 11 ? 'Pagi! Aku baru beresin syal. Kamu udah bangun lama?' : hour < 17 ? bond < 2 ? 'Oh, hai. Lagi istirahat sebentar?' : 'Eh, kamu! Sini duduk dulu.' : hour < 21 ? 'Sore! Tadi harinya gimana?' : 'Udah malam. Aku mulai ngantuk. Kamu juga?', kind: 'personal' });
  if (room.left === 'plant') personal.unshift({ text: 'Tanaman kecil ini lucu. Daunnya goyang dikit tadi.', kind: 'personal' });
  if (room.left === 'books') personal.unshift({ text: 'Buku yang itu ada gambarnya. Aku mau lihat dulu.', kind: 'personal' });
  if (room.toy === 'yarn') personal.unshift({ text: 'Benang biru ini menggoda banget. Main, yuk!', kind: 'personal' });
  if (room.head) personal.unshift({ text: 'Ini udah pas belum? Aku nggak bisa lihat atas kepalaku. Hehe.', kind: 'personal' });
  if (level > 1) personal.unshift({ text: `Level ${level}! Kita lihat hadiah baru di toko, yuk?`, kind: 'personal' });
  // Returning users start at a different personal story each date rather than
  // hearing the same introduction whenever they open the room.
  if (checkins > 0) personal.push(...personal.splice(0, (Number(day.replaceAll('-', '')) + checkins * 7) % personal.length));
  const records: MikoLine[] = [];
  const today = transactions.filter(t => t.occurred_on === day);
  if (today.length) records.push({ text: `Hari ini sudah ada ${today.length} catatan. Mau cek bareng?`, action: 'Lihat catatan', route: 'records', kind: 'record' });
  if (available >= 0 && transactions.length) records.push({ text: `Di sini masih ada ${money(available)}. Mau cek rinciannya sebentar?`, action: 'Lihat saldo', route: 'balance', kind: 'record' });
  records.push({ text: checked ? 'Check-in hari ini sudah beres! Mau tos?' : 'Hari ini gimana? Mau cek sebentar? Nggak belanja juga bisa check-in.', action: checked ? 'Lihat check-in' : 'Cek hari ini', route: 'checkin', kind: 'record' });
  for (const goal of goals.filter(g => g.target_amount > 0)) {
    const saved = contributions.filter(c => c.goal_id === goal.id).reduce((n, c) => n + Number(c.amount), 0);
    records.push({ text: saved < goal.target_amount ? `Buat ${goal.title}, kurang ${money(goal.target_amount - saved)} lagi. Dicicil pelan aja, ya.` : `Hore! Tabungan buat ${goal.title} udah cukup!`, action: 'Lihat target', route: 'goals', kind: 'record' });
  }
  // Interleave helpful facts with personality. Deterministic ordering makes the
  // next line different and testable; a session visits every line before repeat.
  const result: MikoLine[] = [];
  for (let i = 0; i < Math.max(personal.length, records.length); i++) {
    if (personal[i]) result.push(personal[i]);
    if (i % 2 === 0 && records[i / 2]) result.push(records[i / 2]);
  }
  if (records.length > Math.ceil(personal.length / 2)) result.push(...records.slice(Math.ceil(personal.length / 2)));
  if (available < 0) result.unshift({ text: 'Hmm, saldo tersedia di bawah nol. Yuk cek saldo awal dan catatannya bareng.', action: 'Review saldo', route: 'balance', kind: 'record' });
  return result.map(line => ({ ...line, text: line.text.replaceAll('Miko', name) }));
}
