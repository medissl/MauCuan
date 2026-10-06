import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { quizById, type QuizSession } from '../lib/daily-quiz';
export function useDailyQuiz(day: string, initial: QuizSession | undefined, refresh: () => Promise<void>) {
  const [session, setSession] = useState<QuizSession | undefined>(initial);
  const [position, setPosition] = useState(initial?.answers.length || 0);
  const [feedback, setFeedback] = useState(false);
  const [loading, setLoading] = useState(false), [error, setError] = useState('');
  const pending = useRef(false), generation = useRef(0);
  useEffect(() => {
    generation.current++;
    // A new Jakarta day starts a new session; invalidate any previous response.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSession(initial); setPosition(initial?.answers.length || 0); setFeedback(false); setError('');
    // This ref invalidates requests; it is not a rendered node.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => { generation.current++; };
    // A ledger refresh after answering must not remove the visible explanation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day]);
  async function request(question?: string, choice?: number) {
    if (pending.current) return;
    pending.current = true; const current = generation.current;
    setLoading(true); setError('');
    try {
      const { data, error: failure } = await supabase.rpc('daily_quiz', question ? { p_question: question, p_answer: choice, p_day: session?.day } : {});
      if (failure) throw failure;
      if (generation.current !== current) return;
      const result = data as QuizSession;
      if (result.question_ids.some(id => !quizById.has(id))) throw new Error('Kuis ini perlu versi aplikasi terbaru.');
      setSession(result);
      if (question) { setFeedback(true); if (result.completed) await refresh(); }
      else { setPosition(result.answers.length); setFeedback(false); }
    } catch { if (generation.current === current) setError('Kuis belum tersambung. Coba lagi; jawaban yang tersimpan tetap aman.'); }
    finally { pending.current = false; if (generation.current === current) setLoading(false); }
  }
  return { session, position, feedback, loading, error,
    question: session ? quizById.get(session.question_ids[position]) : undefined,
    start: () => request(), answer: (choice: number) => session && request(session.question_ids[position], choice),
    next: () => { setPosition(session?.answers.length || 0); setFeedback(false); },
  };
}

