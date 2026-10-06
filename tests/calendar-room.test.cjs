const test=require('node:test'),assert=require('node:assert/strict');
const {monthDays,dayStatus}=require('../src/lib/calendar.ts');
const {roomLayout,validRoom,habitatWidth}=require('../src/lib/pet-layout.ts');
const {petCatalog}=require('../src/lib/pet.ts');
const {dialogueMood}=require('../src/lib/miko-dialogue.ts');
test('calendar handles leap February, Monday-based weeks and today color priority',()=>{
 assert.equal(monthDays('2028-02').days.length,29);assert.equal(monthDays('2027-02').days.length,28);assert.equal(monthDays('2026-06').offset,0);assert.equal(monthDays('2026-10').offset,3);
 const entries=[{occurred_on:'2026-10-05'},{occurred_on:'2026-10-06'}];assert.equal(dayStatus('2026-10-06','2026-10-06',entries),'today');assert.equal(dayStatus('2026-10-05','2026-10-06',entries),'recorded');assert.equal(dayStatus('2026-10-04','2026-10-06',entries),'empty');assert.equal(dayStatus('2026-10-07','2026-10-06',entries),'future');
});
test('foreground placement stays disjoint from Miko and all other furniture at phone widths',()=>{
 const slots=['character','left','right','toy'];
 for(const width of [272,312,352,400]){const bounds=slots.map(slot=>{const p=roomLayout[slot];return{x:p.x*width,y:p.y*width,w:p.size*width,h:p.size*width,slot}});for(const b of bounds){assert(b.x>=0&&b.y>=0);assert(b.x+b.w<=width);assert(b.y+b.h<=roomLayout.height*width);}for(let i=0;i<bounds.length;i++)for(let j=i+1;j<bounds.length;j++){const a=bounds[i],b=bounds[j];assert(a.x+a.w<=b.x||b.x+b.w<=a.x||a.y+a.h<=b.y||b.y+b.h<=a.y,`${a.slot}/${b.slot}`);}}
});
test('first-screen room budget fits common Android heights without pushing the three actions under navigation',()=>{
 for(const [w,h,top,bottom] of [[320,640,24,24],[360,640,24,24],[360,720,24,24],[393,852,44,34],[412,915,24,24]]){
  const available=h-top-18-Math.max(bottom,14)-80;
  const width=habitatWidth(w-48,available);
  assert(width<=w-48);assert(width>=180);
  // Conservatively includes header, 2-line hint, three 68dp actions, gaps,
  // and the fixed speech area. Footer cards begin after this group.
  assert(width*roomLayout.height+324<=available+.01,`${w}×${h}`);
 }
});
test('each catalog item only renders in its assigned spot; malformed rooms cannot stack or cross slots',()=>{
 for(const item of petCatalog)assert.deepEqual(validRoom({[item.slot]:item.id}),{[item.slot]:item.id});
 assert.deepEqual(validRoom({left:'plant',right:'plant',head:'plant',toy:['ball','yarn'],wall:'unknown'}),{left:'plant'});
 assert.deepEqual(validRoom({left:'books',right:'clock'}),{left:'books',right:'clock'});
});
test('dialogue chooses sleepy, celebratory, curious and mischievous expressions semantically',()=>{
 const mood=(text,kind='personal')=>dialogueMood({text,kind});assert.equal(mood('Aku mulai ngantuk.'),'rest');assert.equal(mood('Hore, tos dulu!'),'happy');assert.equal(mood('Aku penasaran sama bukumu.'),'focused');assert.equal(mood('Benangnya kusut. Hehe.'),'wink');assert.equal(mood('Saldo tersedia di bawah nol.','record'),'focused');assert.equal(mood('Sini, duduk dekat aku.'),'idle');
});
