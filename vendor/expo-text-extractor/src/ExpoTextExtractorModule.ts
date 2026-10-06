import { requireNativeModule } from 'expo-modules-core';

interface ExpoTextExtractorModule {
  isSupported: boolean;
  extractReceiptLayout: (uri: string) => Promise<{ width: number; height: number; fragments: { text: string; x: number; y: number; width: number; height: number; angle?: number; confidence?: number }[] }>;
  extractTextFromImage: (uri: string) => Promise<string[]>;
}

export default requireNativeModule<ExpoTextExtractorModule>('ExpoTextExtractor');
