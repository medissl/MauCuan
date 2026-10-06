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
  'Eh, lagi sibuk? Kalau sempat, mampir sebentar, ya.',
  'Aku baru beresin syal. Kamu lagi ngapain?',
  'Bolanya udah siap. Satu lemparan dulu?',
  'Hari ini gimana? Mau cerita sebentar?',
  'Aku lagi duduk dekat jendela. Sini kalau udah senggang.',
  'Mau cek hari ini? Sebentar aja juga boleh.',
  'Nggak belanja hari ini? Kamu tetap bisa check-in, lho.',
  'Tos dulu? Aku udah siap.',
  'Udah istirahat? Aku tadi ketiduran dikit. Hehe.',
  'Eh, hai. Kita lanjut hari ini aja, ya.',
  'Bolanya nyangkut di bawah bantal lagi. Ups.',
  'Ada cerita baru? Aku pengin dengar.',
  'Tadi harinya ramai atau santai?',
  'Aku simpan tempat sebelahku. Mau duduk dulu?',
  'Kalau udah sempat, kita cek catatan sebentar?',
  'Lama nggak main. Sekali tos dulu, yuk.',
  'Aku baca buku tadi. Kebanyakan lihat gambarnya, sih.',
  'Oh, hai lagi. Lagi istirahat?',
  'Mau ngobrol, tos, atau main bola?',
  'Cek hari ini dulu? Habis itu aku lempar bolanya.',
  'Ada kejadian lucu tadi. Mau dengar?',
  'Aku masih di sini. Mampir kalau lagi senggang, ya.',
  'Aku kangen cerita kamu. Hari ini ada apa?',
  'Nggak perlu buru-buru. Aku lagi santai juga.',
];
const newFriendMessages = [
  'Hai… mau lihat-lihat kamar lagi?',
  'Aku lagi latihan tos. Mau coba?',
  'Oh, hai. Hari ini mau cek catatan sebentar?',
  'Aku nemu bolanya. Mau coba lempar?',
  'Lagi senggang? Aku ada di kamar.',
  'Nggak belanja hari ini? Kamu tetap bisa check-in.',
  'Syalnya udah rapi. Mau kenalan lagi?',
  'Aku mulai hafal kamar ini. Kamu mau lihat?',
  'Mau coba kuis? Aku ikut belajar juga.',
  'Psst… bolanya di bawah bantal. Hehe.',
  'Ada waktu sebentar? Mau coba tos lagi?',
  'Hai. Hari ini gimana?',
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
    const messages = checkins < 90 ? newFriendMessages : returnMessages;
    const body = messages[(checkins + index * 7 + opened.getDate()) % messages.length];
    return [{ date, title: `${name} ingin menyapa`, body, gap }];
  });
}
