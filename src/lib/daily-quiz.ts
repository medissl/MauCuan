import bank from './quiz-bank.json' with { type: 'json' };
export type QuizQuestion = { id: string; topic: string; question: string; answers: string[]; correct: number; explanation: string };
export type QuizSession = { day: string; question_ids: string[]; answers: number[]; completed: boolean; reward: number };
export const quizBank: QuizQuestion[] = bank;
export const quizById = new Map(quizBank.map(q => [q.id, q]));
export const DAILY_QUIZ_LEAVES = 5;
// Mirrors the server selection rule for offline content validation; sessions are
// actually selected and persisted by the server, never awarded by this helper.
export function selectQuiz(history: QuizSession[], day: string, random = Math.random): string[] {
  const existing = history.find(s => s.day === day);
  if (existing) return existing.question_ids;
  if (!history.length) return quizBank.slice(0, 5).map(q => q.id);
  const cutoff = new Date(new Date(day + 'T12:00:00Z').getTime() - 7 * 86400000).toISOString().slice(0, 10);
  const recent = new Set(history.filter(s => s.day >= cutoff && s.day < day).flatMap(s => s.question_ids));
  const seen = new Set(history.flatMap(s => s.question_ids));
  // Shuffle unseen and older questions separately. Exhaust new material before
  // revisiting older lessons, while never using anything from the last 7 days.
  const shuffled = (items: QuizQuestion[]) => { const copy = [...items]; for (let i = copy.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [copy[i], copy[j]] = [copy[j], copy[i]]; } return copy; };
  return [...shuffled(quizBank.filter(q => !seen.has(q.id))), ...shuffled(quizBank.filter(q => seen.has(q.id) && !recent.has(q.id)))].slice(0, 5).map(q => q.id);
}

