export interface ReceiptSuggestion { title?: string; amount?: number; date?: string; }

// Conservative suggestions: never infer a total from the largest line item.
export function parseReceipt(blocks: string[]): ReceiptSuggestion {
  const lines = blocks.join('\n').slice(0, 50000).split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  const result: ReceiptSuggestion = {};
  result.title = lines.slice(0, 5).find(s => /[a-z]{3}/i.test(s) && !/receipt|struk|invoice|nota|telp|phone|npwp|www\.|https?:|\btotal\b/i.test(s))?.slice(0, 80);
  for (const line of lines) {
    const iso = line.match(/\b(20\d{2})[-/](\d{1,2})[-/](\d{1,2})\b/);
    const local = line.match(/\b(\d{1,2})[-/.](\d{1,2})[-/.](20\d{2})\b/);
    const parts = iso ? [iso[1], iso[2], iso[3]] : local ? [local[3], local[2], local[1]] : null;
    if (!parts) continue;
    const date = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
    const parsed = new Date(`${date}T00:00:00Z`);
    if (Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date) { result.date = date; break; }
  }
  // MauCuan currently has an IDR wallet; do not reinterpret foreign currency.
  if (lines.some(s => /\b(?:USD|EUR|SGD|MYR)\b|[$€£]/i.test(s))) return result;
  const candidates: { value: number; rank: number }[] = [];
  for (let i = 0; i < lines.length; i++) {
    const label = lines[i];
    if (!/\b(?:total|jumlah|amount due)\b/i.test(label) || /sub\s*total|subtotal|discount|diskon|tax|pajak|cash|tunai|change|kembali|item|qty/i.test(label)) continue;
    const numberPart = label.match(/\b(?:total(?:\s+(?:bayar|pembayaran|belanja))?|jumlah(?:\s+bayar)?|amount due)\b\s*[:=]?\s*(?:Rp\.?\s*)?([\d][\d.,]*)\s*$/i)?.[1]
      || (/\b(?:total|jumlah|amount due)\b\s*[:=]?\s*$/i.test(label) ? lines[i + 1]?.match(/^(?:Rp\.?\s*)?([\d][\d.,]*)\s*$/i)?.[1] : undefined);
    if (!numberPart) continue;
    // Whole rupiah only. A two-digit fractional suffix must be zero.
    const fraction = numberPart.match(/[.,](\d{2})$/);
    if (fraction && fraction[1] !== '00') continue;
    const integerPart = fraction ? numberPart.slice(0, -3) : numberPart;
    if (!/^\d+$/.test(integerPart) && !/^\d{1,3}(?:\.\d{3})+$/.test(integerPart) && !/^\d{1,3}(?:,\d{3})+$/.test(integerPart)) continue;
    const value = Number(integerPart.replace(/[.,]/g, ''));
    if (!Number.isSafeInteger(value) || value <= 0) continue;
    candidates.push({ value, rank: /grand\s+total|total\s+(?:bayar|pembayaran)|amount due/i.test(label) ? 2 : 1 });
  }
  const rank = Math.max(0, ...candidates.map(c => c.rank));
  const values = [...new Set(candidates.filter(c => c.rank === rank).map(c => c.value))];
  if (values.length === 1) result.amount = values[0];
  return result;
}
