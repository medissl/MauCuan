import { useCallback, useEffect, useState } from 'react';
import { AppState, Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as Notifications from 'expo-notifications';
import { defaultReminders, reminderPlan, type ReminderState } from '../lib/reminder-plan.ts';
import { router } from 'expo-router';

// Serialise storage and schedule writes, including cancellation on account
// switches. A stale async permission result cannot schedule for a signed-out user.
let queue = Promise.resolve();
let activeUser: string | undefined;
const enqueue = <T,>(task: () => Promise<T>) => { const result = queue.then(task); queue = result.then(() => {}, () => {}); return result; };
const key = (id: string) => `maucuan.reminders.${id}`;
async function read(id: string): Promise<ReminderState> {
  const json = await SecureStore.getItemAsync(key(id));
  if (!json) return { ...defaultReminders };
  try { const state = JSON.parse(json); return { ...defaultReminders, ...state, enabled: state.enabled === true, automatic: state.automatic !== false, hour: Number.isInteger(state.hour) ? Math.max(8, Math.min(21, state.hour)) : 20, lastOpened: Number.isFinite(state.lastOpened) ? state.lastOpened : 0, activity: Array.isArray(state.activity) ? state.activity.filter(Number.isFinite).slice(-100) : [], ids: Array.isArray(state.ids) ? state.ids.filter((v: unknown) => typeof v === 'string') : [] }; } catch { return { ...defaultReminders }; }
}
async function cancel(state: ReminderState) { await Promise.all(state.ids.map(id => Notifications.cancelScheduledNotificationAsync(id))); state.ids = []; }
async function persist(id: string, state: ReminderState) {
  // Keep sensitive OS storage entries small. Only local timestamps and settings;
  // no receipt images, merchant names, amounts or text are saved here.
  state.activity = state.activity.slice(-60);
  await SecureStore.setItemAsync(key(id), JSON.stringify(state));
}
async function schedule(id: string, name: string, checkins: number, state: ReminderState) {
  await cancel(state);
  if (state.enabled && activeUser === id) {
    const permission = await Notifications.getPermissionsAsync();
    if (!permission.granted && permission.ios?.status !== Notifications.IosAuthorizationStatus.PROVISIONAL) { state.enabled = false; await persist(id, state); return; }
    if (Platform.OS === 'android') await Notifications.setNotificationChannelAsync('miko-return', { name: 'Sapaan teman macan', importance: Notifications.AndroidImportance.DEFAULT, sound: null, vibrationPattern: [] });
    for (const reminder of reminderPlan(state, name, Date.now(), checkins)) {
      if (activeUser !== id) break;
      const identifier = await Notifications.scheduleNotificationAsync({ content: { title: reminder.title, body: reminder.body, sound: false, data: { userId: id, screen: 'pet', mikoReturn: true }, color: '#009CB4' }, trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: reminder.date, channelId: 'miko-return' } });
      state.ids.push(identifier);
    }
  }
  await persist(id, state);
}
export function usePetReminders(userId: string | undefined, name: string, checkins: number) {
  const [state, setState] = useState<ReminderState>({ ...defaultReminders }), [error, setError] = useState('');
  const update = useCallback(async (patch: Partial<ReminderState>, activity = false) => enqueue(async () => {
    if (!userId || activeUser !== userId) return;
    const next = { ...await read(userId), ...patch };
    if (activity) {
      const now = Date.now(), last = next.activity.at(-1) || 0;
      // One observation per recording session, rather than twenty votes when
      // someone batches twenty old transactions at once.
      if (now - last > 3600000) next.activity.push(now);
    }
    await schedule(userId, name, checkins, next);
    if (activeUser === userId) setState(next);
  }), [userId, name, checkins]);
  useEffect(() => {
    if (!userId) return;
    activeUser = userId;
    let alive = true;
    void update({ lastOpened: Date.now() }).catch(() => { if (alive) setError('Pengingat belum bisa disiapkan. Coba dari pengaturan.'); });
    const app = AppState.addEventListener('change', next => { if (next === 'active') void update({ lastOpened: Date.now() }).catch(() => {}); });
    const response = Notifications.addNotificationResponseReceivedListener(r => {
      const data = r.notification.request.content.data;
      if (data?.mikoReturn && data.userId === userId) router.navigate('/pet');
    });
    void Notifications.getLastNotificationResponseAsync().then(r => { if (alive && r?.notification.request.content.data?.mikoReturn && r.notification.request.content.data.userId === userId) { router.navigate('/pet'); void Notifications.clearLastNotificationResponseAsync(); } }).catch(() => {});
    return () => { alive = false; if (activeUser === userId) activeUser = undefined; app.remove(); response.remove(); void enqueue(async () => { const old = await read(userId); await cancel(old); await persist(userId, old); }).catch(() => {}); };
  }, [userId, update]);
  async function toggle(enabled: boolean) {
    setError('');
    try {
      if (enabled) {
        if (Platform.OS === 'android') await Notifications.setNotificationChannelAsync('miko-return', { name: 'Sapaan teman macan', importance: Notifications.AndroidImportance.DEFAULT, sound: null });
        const permission = await Notifications.requestPermissionsAsync();
        if (!permission.granted && permission.ios?.status !== Notifications.IosAuthorizationStatus.PROVISIONAL) throw new Error('Izin notifikasi belum aktif. Kamu bisa mengizinkannya lewat pengaturan ponsel.');
      }
      await update({ enabled, lastOpened: Date.now() });
    } catch (e) { setError(e instanceof Error ? e.message : 'Pengingat belum bisa disiapkan.'); }
  }
  return { state, error, toggle, setHour: (hour: number) => update({ hour, automatic: false }).catch(() => setError('Jam belum tersimpan.')), setAutomatic: (automatic: boolean) => update({ automatic }).catch(() => setError('Pilihan belum tersimpan.')), record: () => update({ lastOpened: Date.now() }, true).catch(() => {}) };
}
