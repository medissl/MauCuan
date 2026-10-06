import type { Transaction } from './finance.ts';
export function monthDays(month: string) {
  const [year, m] = month.split('-').map(Number);
  const count = new Date(Date.UTC(year, m, 0)).getUTCDate();
  const offset = (new Date(Date.UTC(year, m - 1, 1)).getUTCDay() + 6) % 7;
  return { offset, days: Array.from({ length: count }, (_, i) => `${month}-${String(i + 1).padStart(2, '0')}`) };
}
export function dayStatus(day: string, today: string, entries: Transaction[]) {
  if (day === today) return 'today';
  if (entries.some(t => t.occurred_on === day)) return 'recorded';
  return day < today ? 'empty' : 'future';
}
export function monthLabel(month: string) {
  return new Date(`${month}-01T12:00:00Z`).toLocaleDateString('id-ID', { month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' });
}
