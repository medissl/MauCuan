const test=require('node:test'),assert=require('node:assert/strict');
const {parseReceiptLayout,receiptRows}=require('../src/lib/receipt.ts');
const fragment=(text,x,y,width=180,height=18)=>({text,x,y,width,height});
test('two-line goods keep product names and all three printed totals, including pack sizes',()=>{
 const f=[fragment('TOKO MAJU',40,10),fragment('Nama barang Harga',20,50,480)];
 const goods=[['Indomie goreng','1 lusin x 36,000',36000],['Fruit apple','1 500 ml x 7000',7000],['Belfood sosis bakar','1 x 27000',27000]];
 goods.forEach(([name,detail,total],i)=>{const y=90+i*60;f.push(fragment(name,20,y,260),fragment(detail,20,y+24,260),fragment(String(total),430,y+24,80))});
 f.push(fragment('TOTAL 70.000',20,300,500));
 const r=parseReceiptLayout({width:600,height:400,fragments:f.reverse()});
 assert.deepEqual(r.items,goods.map(([name,_detail,amount])=>({name,quantity:1,amount})));assert.equal(r.amount,70000);assert.equal(r.warnings,undefined);
});
test('extended price on the name row survives quantity underneath; unit price is not the item total',()=>{
 const f=[fragment('TOKO MAJU',20,10),fragment('Nama barang Harga',20,50),fragment('Indomie goreng',20,90),fragment('36.000',430,90,80),fragment('2 pcs x 18.000',20,114,260),fragment('TOTAL 36.000',20,160,500)];
 assert.deepEqual(parseReceiptLayout({width:600,height:250,fragments:f}).items,[{name:'Indomie goreng',quantity:2,amount:36000}]);
});
test('orphan quantity lines and missing extended prices never become invented goods',()=>{
 const f=[fragment('TOKO MAJU',20,10),fragment('Jl. Merdeka',20,50),fragment('1 lusin x 36.000 36.000',20,74,500),fragment('Nama barang Harga',20,110),fragment('Sosis bakar',20,150),fragment('2 x 27.000',20,174,260),fragment('TOTAL 54.000',20,220,500)];
 const r=parseReceiptLayout({width:600,height:300,fragments:f});assert.equal(r.items,undefined);assert.equal(r.amount,54000);
});
function receipt(){
 const rows=[['Susu UHT',2,18000,36000],['Beras 5kg',1,72000,72000],['Indomie goreng',4,3500,14000],['Telur ayam',1,28000,28000],['Roti tawar',1,18000,18000],['Teh celup',1,12000,12000],['Sabun mandi',2,4500,9000],['Air mineral',1,5000,5000]];
 const money=n=>n.toLocaleString('id-ID');
 const f=[fragment('TOKO MAJU',160,15),fragment('Jl. Malioboro No. 123',100,45),fragment('Jogja',160,68),fragment('TELP 0274 555555',100,90),fragment('06/10/2026',20,115),fragment('Nama barang Qty Harga Jumlah',20,145,480)];
 rows.forEach(([name,q,unit,total],i)=>{const y=180+i*32;f.push(fragment(name,20,y,230),fragment(String(q),280,y,20),fragment(money(unit),330,y,70),fragment(money(total),430,y,70))});
 const total=rows.reduce((n,r)=>n+r[3],0);f.push(fragment('TOTAL',20,450),fragment(money(total),430,450,70),fragment('TUNAI',20,480),fragment('200.000',430,480,70),fragment('Terima kasih',140,520),fragment('Hubungi 1500123',120,550),fragment('8 barang',140,575));
 return {layout:{width:600,height:650,fragments:f},rows,total};
}
test('all eight items and line totals survive OCR column order; address and footer never become goods',()=>{
 const {layout,rows,total}=receipt();layout.fragments.sort((a,b)=>a.x-b.x || b.y-a.y);
 const r=parseReceiptLayout(layout);assert.equal(r.title,'TOKO MAJU');assert.equal(r.amount,total);assert.equal(r.date,'2026-10-06');
 assert.deepEqual(r.items,rows.map(([name,quantity,_unit,amount])=>({name,quantity,amount})));
 assert(!r.items.some(i=>/jogja|terima|malioboro|1500123/i.test(i.name)));assert.equal(r.warnings,undefined);
});
test('slightly tilted column centres are deskewed before item and price pairing',()=>{
 const {layout,rows}=receipt();const angle=.10;
 layout.fragments=layout.fragments.map(f=>{const cx=f.x+f.width/2,cy=f.y+f.height/2;return {...f,x:cx*Math.cos(angle)-cy*Math.sin(angle)-f.width/2,y:cy*Math.cos(angle)+cx*Math.sin(angle)-f.height/2,angle}});
 assert.deepEqual(parseReceiptLayout(layout).items,rows.map(([name,quantity,_unit,amount])=>({name,quantity,amount})));
});
test('an address, thank-you or store ID cannot borrow an unrelated number on the next physical line',()=>{
 const layout={width:600,height:700,fragments:[fragment('TOKO MAJU',40,10),fragment('Jogja',40,40),fragment('12345',40,75),fragment('Terima kasih',40,120),fragment('9999',430,160),fragment('Total',40,200),fragment('18.000',430,200)]};
 const r=parseReceiptLayout(layout);assert.equal(r.amount,18000);assert.equal(r.items,undefined);assert(r.warnings.some(w=>w.includes('Baris barang')));
});
test('table header excludes even unlabelled address before goods; barcode product IDs are stripped',()=>{
 const layout={width:600,height:500,fragments:[fragment('TOKO MAJU',40,10),fragment('Malioboro 1234',40,40),fragment('Nama barang Harga',40,100),fragment('8991234567890 BISKUIT 2 5.000 10.000',40,130,500),fragment('TOTAL 10.000',40,180)]};
 assert.deepEqual(parseReceiptLayout(layout).items,[{name:'BISKUIT',quantity:2,amount:10000}]);
});
test('low-confidence and invalid boxes are not fabricated; missing prices stay empty',()=>{
 const layout={width:600,height:500,fragments:[fragment('TOKO',20,10),{...fragment('Beras 70.000',20,50),confidence:.1},fragment('Nama barang Harga',20,80),fragment('Roti tawar',20,110),{...fragment('18.000',400,110),width:NaN},fragment('TOTAL',20,200)]};
 assert.equal(parseReceiptLayout(layout).items,undefined);assert.equal(parseReceiptLayout(layout).amount,undefined);assert(!receiptRows(layout).some(l=>l.includes('70.000')));
});
