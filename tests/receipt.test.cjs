const test = require('node:test');
const assert = require('node:assert/strict');
const { parseReceipt } = require('../src/lib/receipt.ts');
const { ocrImagePath, receiptAmount } = require('../src/lib/receipt.ts');
test('Android OCR reads actual file paths and leaves content and iOS URLs intact', () => {
  assert.equal(ocrImagePath('file:///data/cache/receipt%20photo.jpg', 'android'), '/data/cache/receipt photo.jpg');
  assert.equal(ocrImagePath('content://media/123', 'android'), 'content://media/123');
  assert.equal(ocrImagePath('file:///cache/receipt.jpg', 'ios'), 'file:///cache/receipt.jpg');
});
test('merchant excludes addresses and receipt metadata; includes quantity and line totals', () => {
  const r = parseReceipt(['Jl. Merdeka 15\nTELP 021-555555\nKOPI SENJA\n05/10/2026\n2 x LATTE 48.000\nROTI 1 12.000 12.000\nSUBTOTAL 60.000\nPAJAK 6.000\nGRAND TOTAL: Rp 66.000\nTUNAI 100.000\nKEMBALI 34.000']);
  assert.equal(r.title, 'KOPI SENJA'); assert.equal(r.amount, 66000);
  assert.deepEqual(r.items, [{name:'LATTE',quantity:2,amount:48000},{name:'ROTI',quantity:1,amount:12000}]);
  assert.equal(r.warnings.length, 1);
});
test('separate OCR columns pair only when row counts agree', () => {
  const r = parseReceipt(['TOKO MAJU', 'Beras\nSusu\nTotal', '70.000\n15.000\n85.000']);
  assert.equal(r.amount, 85000); assert.equal(r.items.length, 2); assert.equal(r.items[0].amount, 70000);
  assert.equal(parseReceipt(['TOKO MAJU', 'Beras\nTotal', '70.000\n10.000\n80.000']).amount, undefined);
});
test('total formats accept zero cents and cannot mistake cash or subtotal for payable', () => {
  for (const s of ['Rp 48.000,00', '48,000.00', '48000', 'Rp.48.000']) assert.equal(receiptAmount(s),48000);
  assert.equal(parseReceipt(['TOKO\nSubtotal 40.000\nTotal bayar\n48.000\nTunai 100.000']).amount,48000);
  assert.equal(parseReceipt(['TOKO\nSubtotal 40.000\nTunai 100.000']).amount,undefined);
});
test('suggests IDR grand total over subtotal and cash, and Indonesian date', () => {
  assert.deepEqual(parseReceipt(['KOPI SENJA\n05/10/2026\nSubtotal 40.000\nTOTAL BAYAR Rp48.000,00\nTUNAI 100.000\nKEMBALI 52.000']), {title:'KOPI SENJA',date:'2026-10-05',amount:48000});
});
test('reads total on next line without guessing from line items', () => {
  assert.equal(parseReceipt(['TOKO MAJU\nBeras 70.000\nTOTAL\nRp75.000']).amount,75000);
  assert.equal(parseReceipt(['TOKO MAJU\nBeras 70.000']).amount,undefined);
});
test('leaves malformed amounts, foreign currency and conflicting totals blank', () => {
  for(const line of ['TOTAL 48.12','TOTAL 48.000,50','TOTAL USD 48.00','TOTAL 48.000\nTOTAL 50.000','TOTAL 1,23,000']) assert.equal(parseReceipt([line]).amount,undefined);
});
test('ignores impossible dates and accepts ISO dates', () => {
  assert.equal(parseReceipt(['31/02/2026']).date,undefined);
  assert.equal(parseReceipt(['2026-10-05']).date,'2026-10-05');
});
