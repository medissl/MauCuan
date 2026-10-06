import { registerWebModule, NativeModule } from 'expo';

// MauCuanWidgetModule is not available on the web platform.
class MauCuanWidgetModule extends NativeModule {
  update() {}
  requestPin() { return false; }
}

export default registerWebModule(MauCuanWidgetModule, 'MauCuanWidgetModule');
