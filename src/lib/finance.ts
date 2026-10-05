export type Transaction = { id: string; user_id: string; kind: 'income' | 'expense'; amount: number; title: string; category: string; occurred_on: string; receipt_path: string | null };
export type Goal = { id: string; title: string; target_amount: number; target_date: string | null };
export type Contribution = { id: string; goal_id: string; amount: number; created_at: string };
export type Checkin = { day: string; no_spend: boolean };
export type Accessory = { accessory: 'bandana' | 'explorer_hat'; cost: number };
export type Profile = { id: string; nickname: string; pet_name: string; opening_balance: number; onboarding_complete: boolean; reduce_motion: boolean };

export function parseAmount(text: string) {
  const input = text.trim().replace(/^Rp\s*/i, '');
  if (!/^(?:\d{1,13}|\d{1,3}(?:\.\d{3})+|\d{1,3}(?:,\d{3})+)$/.test(input)) throw new Error('Isi nominal rupiah bulat yang valid.');
  const n = Number(input.replace(/[.,]/g, ''));
  if (!Number.isSafeInteger(n) || n > 9000000000000) throw new Error('Nominal terlalu besar.');
  return n;
}
export function formatAmountInput(text: string) {
  return text.replace(/^0+(?=\d)/, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
// Currency fields keep unformatted digits in state; grouping is presentation only.
export function currencyInput(previous: string, next: string) {
  const input = next.replace(/^Rp\s*/i, '').trim();
  if (!/^[\d.,]*$/.test(input)) return previous;
  if (/[.,]/.test(input) && input.length > formatAmountInput(previous).length + 1) {
    try { parseAmount(input); } catch { return previous; }
  }
  let digits = input.replace(/[.,]/g, '').replace(/^0+(?=\d)/, '');
  const oldDisplay = formatAmountInput(previous);
  if (digits === previous && input.length === oldDisplay.length - 1) {
    // Backspace over a grouping separator should remove the preceding digit.
    let at = 0;
    while (at < input.length && input[at] === oldDisplay[at]) at++;
    if (oldDisplay[at] === '.') {
      const before = oldDisplay.slice(0, at).replace(/\./g, '').length;
      digits = previous.slice(0, before - 1) + previous.slice(before);
    }
  }
  return digits.length > 13 ? previous : digits;
}
export function readableDay(day: string) {
  return new Date(`${day}T12:00:00Z`).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });
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
