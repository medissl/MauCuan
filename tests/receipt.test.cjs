const test = require('node:test');
const assert = require('node:assert/strict');
const { parseReceipt } = require('../src/lib/receipt.ts');
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
