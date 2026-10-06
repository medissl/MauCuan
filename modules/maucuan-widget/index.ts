// Re-export the native module. On web, it will be resolved to MauCuanWidgetModule.web.ts
// and on native platforms to MauCuanWidgetModule.ts
export { default } from './src/MauCuanWidgetModule';
export * from './src/MauCuanWidget.types';
