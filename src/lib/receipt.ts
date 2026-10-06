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
const address = /\b(?:jl\.?|jln\.?|jalan|street|road|rt|rw|kelurahan|kecamatan|kota|kabupaten|alamat|telp|phone|npwp|kasir|cashier|www|https|invoice|receipt|struk|nota|tanggal|date|no\.?|nomor|store|cabang|outlet|kode|terminal|member|pelanggan|customer|transaksi|sales|operator)\b|@|\+62/i;
const footer = /terima\s*kasih|thank|selamat\s*(?:datang|belanja)|kunjungan|kembali\s*lagi|kritik|saran|layanan|hubungi|follow|instagram|facebook|promo|barang.*(?:kembali|tukar)|\b(?:jogja|yogyakarta|jakarta|bandung|surabaya|semarang|bantul|sleman|depok|bekasi|tangerang|bogor|medan|denpasar|indonesia)\b/i;
const header = /^(?:nama\s*)?(?:barang|produk|description|deskripsi|item|qty|quantity|harga|price|jumlah|amount)(?:\s|$)/i;
export function parseReceipt(blocks: string[], allowNextLineItems = true): ReceiptSuggestion {
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
  result.title = lines.slice(0, Math.min(5, firstSummary < 0 ? 5 : firstSummary)).find(s => /[a-z]{3}/i.test(s) && !address.test(s) && !footer.test(s) && !summary.test(s) && !header.test(s) && !/\d{3}|\d[.,]\d{3}\s*$/.test(s))?.slice(0, 80);
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
  const endItems = lines.findIndex(l => /\b(?:sub\s*total|grand\s*total|total|tunai|cash|pajak|ppn|terima\s*kasih|thank)\b/i.test(l));
  const tableHeader = lines.findIndex((l, i) => (endItems < 0 || i < endItems) && header.test(l) && /\b(?:barang|produk|qty|quantity|harga|description)\b/i.test(l));
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].replace(/^\d{8,14}\s+/, ''), label = line.match(totalLabel);
    if (label && !/sub\s*total|diskon|discount|pajak|tax|cash|tunai|kembal|qty|total\s+item/i.test(line)) {
      const after = line.slice(label.index! + label[0].length).replace(/^\s*[:=\-]\s*/, '').trim();
      const value = receiptAmount(after) ?? (!after ? nextAmount(i) : undefined);
      if (value) candidates.push({ value, rank: /grand|net|bayar|pembayaran|akhir|amount/i.test(label[0]) ? 2 : 1 });
    }
    if ((tableHeader >= 0 && i <= tableHeader) || (endItems >= 0 && i >= endItems) || summary.test(line) || address.test(line) || footer.test(line) || header.test(line) || line === result.title || /\d{1,2}[:/]\d{1,2}/.test(line)) continue;
    const match = line.match(/^(.+?)\s+(?:Rp\.?\s*)?(\d[\d.,]*)\s*$/i);
    let name = match?.[1], price = match ? receiptAmount(match[2]) : undefined;
    if (allowNextLineItems && !match && /[a-z]{3}/i.test(line) && nextAmount(i)) { name = line; price = nextAmount(i); i++; }
    if (!name || !price || price < 100 || !/[a-z]{2}/i.test(name)) continue;
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

export interface ReceiptFragment { text: string; x: number; y: number; width: number; height: number; angle?: number; confidence?: number; }
export interface ReceiptLayout { width: number; height: number; fragments: ReceiptFragment[]; }
// OCR block order is not reading order. Deskew centres and join only fragments
// occupying the same physical row; a footer can never borrow a price above it.
function spatialRows(layout: ReceiptLayout) {
  const valid = layout.fragments.slice(0, 2000).filter(f => f.text.trim() && [f.x, f.y, f.width, f.height].every(Number.isFinite) && f.width > 0 && f.height > 0 && (f.confidence === undefined || f.confidence >= .35));
  const angles = valid.map(f => f.angle || 0).filter(a => Math.abs(a) < .45).sort((a, b) => a - b);
  const angle = angles[Math.floor(angles.length / 2)] || 0;
  const fragments = valid.map(f => {
    const x = f.x + f.width / 2, y = f.y + f.height / 2;
    return { ...f, cx: x * Math.cos(angle) + y * Math.sin(angle), cy: y * Math.cos(angle) - x * Math.sin(angle) };
  }).sort((a, b) => a.cy - b.cy);
  const rows: { cy: number; height: number; parts: typeof fragments }[] = [];
  for (const f of fragments) {
    const last = rows.at(-1);
    if (last && Math.abs(last.cy - f.cy) <= Math.min(last.height, f.height) * .48) {
      last.cy = (last.cy * last.parts.length + f.cy) / (last.parts.length + 1); last.parts.push(f); last.height = Math.min(last.height, f.height);
    } else rows.push({ cy: f.cy, height: f.height, parts: [f] });
  }
  return rows.map(row => ({ ...row, parts: row.parts.sort((a, b) => a.cx - b.cx), text: row.parts.map(f => f.text.trim()).join(' ') }));
}
export function receiptRows(layout: ReceiptLayout): string[] {
  return spatialRows(layout).map(row => row.text);
}
// A quantity line belongs to the product directly above it, never becomes a
// product name itself. Preserve printed extended prices; do not invent prices.
function itemRows(layout: ReceiptLayout) {
  const rows = spatialRows(layout), lines = rows.map(row => row.text);
  const merchant = parseReceipt([lines.join('\n')], false).title;
  let unmatched = 0;
  const detail = /^(\d{1,3})\s*(?:(?:lusin|pcs|pc|buah|pack|pak|botol|kotak|bungkus|kg|g|gr|ml|l)\s*|\d+\s*(?:ml|kg|gr|g|l)\s*)?[x×*]\s*(?:Rp\.?\s*)?(\d[\d.,]*)(?:\s+(?:Rp\.?\s*)?(\d[\d.,]*))?\s*$/i;
  const endingPrice = /\s+(?:Rp\.?\s*)?(\d[\d.,]*)\s*$/i;
  for (let i = 1; i < rows.length; i++) {
    const match = rows[i].text.match(detail);
    if (!match) continue;
    lines[i] = ''; // Even an orphaned quantity line cannot masquerade as goods.
    unmatched++;
    const previous = rows[i - 1], current = rows[i];
    if (!lines[i - 1] || current.cy - previous.cy > Math.max(previous.height, current.height) * 3 || Math.abs(current.parts[0].x - previous.parts[0].x) > layout.width * .16) continue;
    const product = previous.text.replace(/^\d{8,14}\s+/, '');
    if (product === merchant || address.test(product) || footer.test(product) || summary.test(product) || header.test(product) || !/[a-z]{2}/i.test(product)) continue;
    const onName = product.match(endingPrice);
    const name = onName ? product.slice(0, onName.index).trim() : product;
    const amount = receiptAmount(match[3] || '') ?? (onName ? receiptAmount(onName[1]) : undefined);
    const quantity = Number(match[1]);
    if (!amount || quantity < 1 || quantity > 999) { lines[i - 1] = ''; continue; }
    lines[i - 1] = `${quantity} x ${name} ${amount}`;
    unmatched--;
  }
  return { lines: lines.filter(Boolean), unmatched };
}
export function parseReceiptLayout(layout: ReceiptLayout): ReceiptSuggestion {
  const rows = itemRows(layout);
  const result = parseReceipt([rows.lines.join('\n')], false);
  // Do not guess the shop from the item list when the logo wasn't recognised.
  if (result.title && /\d|\b(?:qty|harga|jumlah)\b/i.test(result.title)) delete result.title;
  if (!result.items?.length) result.warnings = [...(result.warnings || []), 'Baris barang belum cocok dengan harga. Jangan isi dari alamat atau angka toko; tambah barang dari foto.'];
  else if (rows.unmatched) result.warnings = [...(result.warnings || []), 'Ada baris jumlah atau harga yang belum cocok dengan nama barang. Periksa daftar barang pada foto.'];
  if (layout.fragments.some(f => f.confidence !== undefined && f.confidence < .5)) result.warnings = [...(result.warnings || []), 'Sebagian teks kurang jelas. Ambil ulang foto atau periksa angka pada foto.'];
  return result;
}
