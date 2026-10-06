/**
 * A boolean value that indicates whether the text extraction module is supported on the current device.
 *
 * @example
 * if (isSupported) {
 *   console.log('Text extraction is supported on this device.');
 * } else {
 *   console.log('Text extraction is not supported on this device.');
 * }
 */
export declare const isSupported: boolean;
export declare function extractReceiptLayout(uri: string): Promise<{ width: number; height: number; fragments: { text: string; x: number; y: number; width: number; height: number; angle?: number; confidence?: number }[] }>;
/**
 * Extracts text from an image.
 *
 * @param {string} uri - The URI of the image to extract text from.
 * @returns {Promise<string[]>} A promise that fulfills with an array of recognized texts.
 */
export declare function extractTextFromImage(uri: string): Promise<string[]>;
//# sourceMappingURL=index.d.ts.map
