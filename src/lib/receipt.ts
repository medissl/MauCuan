export interface ReceiptItem { name: string; quantity: number; amount: number; }
export interface ReceiptSuggestion { title?: string; amount?: number; date?: string; items?: ReceiptItem[]; warnings?: string[]; }
export function receiptAmount(text: string): number | undefined {
  let s = text.trim().replace(/^Rp\.?\s*/i, '').replace(/\s*([.,])\s*/g, '$1');
  const fraction = s.match(/[.,](\d{2})$/);
  if (fraction) { if (fraction[1] !== '00') return; s = s.slice(0, -3); }
  if (!/^\d+$/.test(s) && !/^\d{1,3}(?:[.]\d{3})+$/.test(s) && !/^\d{1,3}(?:[,]\d{3})+$/.test(s)) return;
  const n = Number(s.replace(/[.,]/g, ''));
  return Number.isSafeInteger(n) && n > 0 && n <= 9000000000000 ? n : undefined;
}
// Android's extractor expects a file path, not a file:// URI.
export function ocrImagePath(uri: string, platform: string) {
  return platform === 'android' && uri.startsWith('file://') ? decodeURIComponent(uri.slice(7)) : uri;
}
const summary = /\b(?:sub\s*total|total|jumlah|tunai|cash|debit|kartu|change|kembal\w*|discount|diskon|tax|pajak|ppn|pb1|service|bayar|payment|balance|qty|item)\b/i;
const totalLabel = /\b(?:grand\s*total|total(?:\s+(?:bayar|pembayaran|belanja|akhir))?|jumlah(?:\s+(?:bayar|pembayaran))?|amount\s+due|net\s+total)\b/i;
const address = /\b(?:jl\.?|jln\.?|jalan|street|road|rt|rw|kelurahan|kecamatan|kota|kabupaten|alamat|telp|phone|npwp|kasir|cashier|www|https|invoice|receipt|struk|nota|tanggal|date)\b|@|\+62/i;
export function parseReceipt(blocks: string[]): ReceiptSuggestion {
  const groups = blocks.map(b => b.slice(0, 50000).split(/\r?\n/).map(s => s.trim()).filter(Boolean));
  // Pair columns only when their row counts match unambiguously.
  for (let g = 0; g < groups.length - 1; g++) {
    const left = groups[g], right = groups[g + 1];
    if (left.length > 1 && left.length === right.length && right.every(l => receiptAmount(l) !== undefined) && left.every(l => /[a-z]/i.test(l) && !/\d[.,]\d{3}\s*$/.test(l))) {
      groups[g] = left.map((l, i) => `${l} ${right[i]}`); groups[g + 1] = [];
    }
  }
  const lines = groups.flat().slice(0, 1000);
  const owners = groups.flatMap((group, index) => group.map(() => index)).slice(0, 1000);
  const nextAmount = (index: number) => owners[index] === owners[index + 1] || groups[owners[index + 1]]?.length === 1 ? receiptAmount(lines[index + 1] || '') : undefined;
  const result: ReceiptSuggestion = {};
  const firstSummary = lines.findIndex(l => totalLabel.test(l));
  result.title = lines.slice(0, Math.min(8, firstSummary < 0 ? 8 : firstSummary)).find(s => /[a-z]{3}/i.test(s) && !address.test(s) && !summary.test(s) && !/\d{4}|\d[.,]\d{3}\s*$/.test(s))?.slice(0, 80);
  for (const line of lines) {
    const iso = line.match(/\b(20\d{2})[-/](\d{1,2})[-/](\d{1,2})\b/);
    const local = line.match(/\b(\d{1,2})[-/.](\d{1,2})[-/.](20\d{2})\b/);
    const p = iso ? [iso[1], iso[2], iso[3]] : local ? [local[3], local[2], local[1]] : null;
    if (!p) continue;
    const d = `${p[0]}-${p[1].padStart(2, '0')}-${p[2].padStart(2, '0')}`;
    const parsed = new Date(`${d}T12:00:00Z`);
    if (Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === d) { result.date = d; break; }
  }
  if (lines.some(s => /\b(?:USD|EUR|SGD|MYR)\b|[$€£]/i.test(s))) return result;
  const candidates: { value: number; rank: number }[] = [], items: ReceiptItem[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i], label = line.match(totalLabel);
    if (label && !/sub\s*total|diskon|discount|pajak|tax|cash|tunai|kembal|qty|total\s+item/i.test(line)) {
      const after = line.slice(label.index! + label[0].length).replace(/^\s*[:=\-]\s*/, '').trim();
      const value = receiptAmount(after) ?? (!after ? nextAmount(i) : undefined);
      if (value) candidates.push({ value, rank: /grand|net|bayar|pembayaran|akhir|amount/i.test(label[0]) ? 2 : 1 });
    }
    if (summary.test(line) || address.test(line) || line === result.title || /\d{1,2}[:/]\d{1,2}/.test(line)) continue;
    const match = line.match(/^(.+?)\s+(?:Rp\.?\s*)?(\d[\d.,]*)\s*$/i);
    let name = match?.[1], price = match ? receiptAmount(match[2]) : undefined;
    if (!match && /[a-z]{3}/i.test(line) && nextAmount(i)) { name = line; price = nextAmount(i); i++; }
    if (!name || !price || !/[a-z]{2}/i.test(name)) continue;
    let quantity = 1;
    const q = name.match(/^(\d{1,3})\s*[xX*]\s*(.+)$/) || name.match(/^(.+?)\s+(\d{1,3})\s*[xX*](?:\s*[\d.,]+)?$/);
    if (q) { const leading = /^\d/.test(q[0]); quantity = Number(leading ? q[1] : q[2]); name = leading ? q[2] : q[1]; }
    const columns = name.match(/^(.+?)\s+(\d{1,3})\s+(\d[\d.,]*)$/);
    if (columns && receiptAmount(columns[3])) { name = columns[1]; quantity = Number(columns[2]); }
    if (quantity > 0 && quantity <= 999) items.push({ name: name.slice(0, 100), quantity, amount: price });
  }
  const rank = Math.max(0, ...candidates.map(c => c.rank));
  const values = [...new Set(candidates.filter(c => c.rank === rank).map(c => c.value))];
  if (values.length === 1) result.amount = values[0];
  if (items.length) result.items = items.slice(0, 100);
  const warnings: string[] = [];
  if (values.length > 1) warnings.push('Ada lebih dari satu total berbeda. Pilih total pada struk.');
  if (items.length && result.amount && items.reduce((n, item) => n + item.amount, 0) !== result.amount) warnings.push('Jumlah barang berbeda dari total. Cek pajak, diskon, atau barang yang belum terbaca.');
  if (warnings.length) result.warnings = warnings;
  return result;
}
