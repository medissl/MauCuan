export interface ReminderState { enabled: boolean; automatic: boolean; hour: number; lastOpened: number; activity: number[]; ids: string[]; }
export const defaultReminders: ReminderState = { enabled: false, automatic: true, hour: 20, lastOpened: 0, activity: [], ids: [] };
const localDay = (date: Date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
export function learnedReminderHour(activity: number[], now: number, fallback = 20) {
  const votes = new Map<string, { hour: number; weight: number }>();
  for (const timestamp of activity) {
    if (!Number.isFinite(timestamp) || timestamp > now || now - timestamp > 30 * 86400000) continue;
    const date = new Date(timestamp), hour = date.getHours();
    const key = `${localDay(date)}:${hour}`;
    votes.set(key, { hour, weight: Math.exp(-(now - timestamp) / (14 * 86400000)) });
  }
  if (new Set([...votes.keys()].map(k => k.split(':')[0])).size < 5) return fallback;
  const scores = Array(24).fill(0) as number[];
  for (const vote of votes.values()) scores[vote.hour] += vote.weight;
  const best = scores.indexOf(Math.max(...scores));
  return Math.max(8, Math.min(21, best));
}
export const returnMessages = [
  'Aku masih di sudut nyaman kita. Kalau ada waktu, mampir sebentar, ya?',
  'Syal sudah rapi. Aku ingin dengar kabar harimu, bukan menilai catatanmu.',
  'Aku kangen teman main bolaku. Kita boleh ngobrol sebentar saja.',
  'Kamu sedang sibuk? Aku tetap di sini. Catatan kecil bisa menunggu waktu yang pas.',
  'Aku menyiapkan tempat duduk dekat jendela. Mau singgah?',
  'Kita bisa mulai dari satu hal kecil hari ini. Aku menemani.',
  'Hari tanpa belanja juga boleh dicatat. Tidak perlu belanja untuk menemuiku.',
  'Aku ingin tos lagi. Kalau kamu sudah siap, rumah kecil kita masih di sini.',
  'Istirahatmu tetap berarti. Kalau sudah ada tenaga, kita rapikan hari bersama.',
  'Tidak perlu mengejar hari kemarin. Aku senang kalau kamu kembali hari ini.',
  'Bola jingga kita belum pergi ke mana-mana. Aku juga.',
  'Aku penasaran kabarmu. Bukan cuma kabar dompetmu.',
  'Ada hari yang panjang, ada hari yang ringan. Kamu boleh cerita sedikit.',
  'Rumah kecil kita terasa lebih hangat kalau kamu mampir.',
  'Aku mau jadi pengingat yang lembut. Kita cek hari ini kalau waktunya nyaman.',
  'Kamu tidak kehilangan apa-apa karena istirahat. Kita bisa lanjut pelan-pelan.',
  'Aku tadi membaca sedikit, lalu menunggu dekat jendela. Hai dari sini!',
  'Boleh mulai lagi tanpa harus menjelaskan kenapa kemarin sibuk.',
  'Aku siap menemani satu catatan, satu tos, atau satu obrolan kecil.',
  'Kalau sudah sempat, coba cek catatan hari ini. Setelah itu kita main sebentar.',
  'Aku punya banyak cerita kecil. Mau dengar satu?',
  'Selamat datang kapan pun kamu siap. Tempatmu di sini masih nyaman.',
  'Aku menunggu tanpa menghitung kesalahan. Kita belajar sedikit lagi bersama.',
  'Kamu boleh kembali dengan hari yang belum rapi. Kita mulai dari sana.',
];
export function reminderPlan(state: ReminderState, name: string, now: number, checkins: number) {
  if (!state.enabled || !state.lastOpened) return [];
  const hour = state.automatic ? learnedReminderHour(state.activity, now, state.hour) : state.hour;
  const opened = new Date(state.lastOpened), today = localDay(new Date(now));
  // First missed day, then 3, 7, 14 and 30. No repeated daily nagging; schedules
  // are reset when the user opens the app, and no same-day reminder survives.
  return [1,3,7,14,30].flatMap((gap, index) => {
    const date = new Date(opened.getFullYear(), opened.getMonth(), opened.getDate() + gap, hour, 0, 0);
    if (date.getTime() <= now || localDay(date) === today) return [];
    const body = returnMessages[(checkins + index * 7 + opened.getDate()) % returnMessages.length];
    return [{ date, title: `${name} ingin menyapa`, body, gap }];
  });
}
