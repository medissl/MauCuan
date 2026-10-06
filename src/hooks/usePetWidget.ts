import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';
import Widget from '../../modules/maucuan-widget';
export function usePetWidget(userId: string | undefined, name: string, checkedDay: string) {
  useEffect(() => {
    if (Platform.OS !== 'android' || !Widget) return;
    const nativeWidget = Widget;
    const update = () => nativeWidget.update(name, Date.now(), checkedDay, !!userId);
    update();
    const listener = AppState.addEventListener('change', state => { if (state === 'active') update(); });
    return () => { listener.remove(); nativeWidget.update('', 0, '', false); };
  }, [userId, name, checkedDay]);
}
export function requestPetWidget() { return Platform.OS === 'android' && !!Widget?.requestPin(); }
