export type Transaction = { id: string; user_id: string; kind: 'income' | 'expense'; amount: number; title: string; category: string; occurred_on: string; receipt_path: string | null };
export type Goal = { id: string; title: string; target_amount: number; target_date: string | null };
export type Contribution = { id: string; goal_id: string; amount: number; created_at: string };
export type Checkin = { day: string; no_spend: boolean };
export type Accessory = { accessory: 'bandana' | 'explorer_hat'; cost: number };
export type Profile = { id: string; nickname: string; pet_name: string; opening_balance: number; onboarding_complete: boolean; reduce_motion: boolean };

export function parseAmount(text: string) {
  if (!/^\d{1,13}$/.test(text.trim())) throw new Error('Isi nominal rupiah tanpa titik atau koma.');
  const n = Number(text);
  if (!Number.isSafeInteger(n) || n > 9000000000000) throw new Error('Nominal terlalu besar.');
  return n;
}
export function isValidDate(text: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return false;
  const date = new Date(`${text}T12:00:00Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === text;
}
export function jakartaDay(date = new Date()) {
  return new Date(date.getTime() + 7 * 3600000).toISOString().slice(0, 10);
}
export function totals(opening: number, transactions: Transaction[], contributions: Contribution[]) {
  const balance = transactions.reduce((n, t) => n + (t.kind === 'income' ? Number(t.amount) : -Number(t.amount)), Number(opening));
  const allocated = contributions.reduce((n, c) => n + Number(c.amount), 0);
  return { balance, allocated, available: balance - allocated };
}
export function petProgress(checkins: Checkin[], accessories: Accessory[]) {
  const xp = checkins.length * 20;
  return { xp, level: 1 + Math.floor(xp / 200), progress: xp % 200, leaves: checkins.length * 10 - accessories.reduce((n, a) => n + a.cost, 0), checked: checkins.some(c => c.day === jakartaDay()) };
}
export const money = (value: number) => `Rp ${Number(value).toLocaleString('id-ID')}`;
