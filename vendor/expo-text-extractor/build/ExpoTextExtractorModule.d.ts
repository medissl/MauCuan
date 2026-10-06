interface ExpoTextExtractorModule {
    isSupported: boolean;
    extractReceiptLayout: (uri: string) => Promise<{ width: number; height: number; fragments: { text: string; x: number; y: number; width: number; height: number; angle?: number; confidence?: number }[] }>;
    extractTextFromImage: (uri: string) => Promise<string[]>;
}
declare const _default: ExpoTextExtractorModule;
export default _default;
