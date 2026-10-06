import { NativeModule, requireOptionalNativeModule } from 'expo';

declare class MauCuanWidgetModule extends NativeModule<{}> {
  update(name: string, opened: number, checkedDay: string, signedIn: boolean): void;
  requestPin(): boolean;
}

export default requireOptionalNativeModule<MauCuanWidgetModule>('MauCuanWidget');
