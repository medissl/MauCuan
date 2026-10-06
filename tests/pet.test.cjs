const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {petCatalog,petTips}=require('../src/lib/pet.ts');
test('client catalog matches authoritative database price, slot and level for every item',()=>{
 const sql=['enhancements.sql','catalog-0.3.1.sql'].map(f=>fs.readFileSync(require('node:path').join(__dirname,'../supabase/'+f),'utf8')).join('\n');
 assert.equal(petCatalog.length,68);assert.equal(new Set(petCatalog.map(i=>i.id)).size,68);
 for(const i of petCatalog)assert(sql.includes(`('${i.id}','${i.slot}',${i.cost},${i.level})`),i.id);
 assert.deepEqual(petCatalog.filter(i=>i.cost===0).map(i=>i.level).sort((a,b)=>a-b),[2,3,4,5,10,20,30,40,50,70,90,110,120]);
});
test('tips distinguish negative funds, recorded cash flow and goal progress without claiming bank data',()=>{
 const transactions=[{kind:'income',occurred_on:'2026-10-01',amount:100000},{kind:'expense',occurred_on:'2026-10-06',amount:150000}];
 const tips=petTips(transactions,[{id:'g',title:'Dana darurat',target_amount:10000,target_date:null}],[{goal_id:'g',amount:10000}],-50000,'2026-10-06');
 assert(tips.some(t=>t.route==='balance'));assert(tips.some(t=>t.title==='Arus bulan ini'));assert(tips.some(t=>t.title==='Satu impian tercapai'));
 assert(!tips.some(t=>t.title==='Hari tanpa belanja tetap berarti'));
 assert(petTips([],[],[],0,'2026-10-06').some(t=>t.route==='newgoal'));
});
