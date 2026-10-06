import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Accessory, Checkin, Contribution, Goal, Profile, Transaction } from '../lib/finance';
import type { QuizSession } from '../lib/daily-quiz';
export function useLedger(userId: string | undefined) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [quizzes, setQuizzes] = useState<QuizSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const generation = useRef(0);
  const refresh = useCallback(async () => {
    if (!userId) return;
    const current = ++generation.current;
    setLoading(true); setError('');
    try {
      const results = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('transactions').select('*').eq('user_id', userId).order('occurred_on', { ascending: false }).order('created_at', { ascending: false }),
        supabase.from('goals').select('*').eq('user_id', userId).order('created_at'),
        supabase.from('contributions').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('checkins').select('*').eq('user_id', userId).order('day', { ascending: false }),
        supabase.from('pet_accessories').select('*').eq('user_id', userId),
        supabase.from('daily_quizzes').select('day,question_ids,answers,completed,reward').eq('user_id', userId).order('day', { ascending: false }),
      ]);
      for (const r of results) if (r.error) throw r.error;
      if (generation.current !== current) return;
      setProfile(results[0].data as unknown as Profile);
      setTransactions(results[1].data as unknown as Transaction[]);
      setGoals(results[2].data as unknown as Goal[]);
      setContributions(results[3].data as unknown as Contribution[]);
      setCheckins(results[4].data as unknown as Checkin[]);
      setAccessories(results[5].data as unknown as Accessory[]);
      setQuizzes(results[6].data as unknown as QuizSession[]);
    } catch (e) {
      if (generation.current === current) setError(e instanceof Error ? e.message : 'Koneksi terputus. Coba lagi.');
    } finally { if (generation.current === current) setLoading(false); }
  }, [userId]);
  useEffect(() => {
    generation.current++;
    // Clear the previous account immediately when authentication changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProfile(null); setTransactions([]); setGoals([]); setContributions([]); setCheckins([]); setAccessories([]); setQuizzes([]); setError('');
    void refresh();
    // This is a request version counter, not a DOM ref; invalidate all pending requests.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => { generation.current++; };
  }, [refresh]);
  return { profile, transactions, goals, contributions, checkins, accessories, quizzes, loading, error, refresh };
}
