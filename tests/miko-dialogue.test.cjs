const test=require('node:test'),assert=require('node:assert/strict');
const {mikoLines,mikoPersonality}=require('../src/lib/miko-dialogue.ts');
const base={transactions:[],goals:[],contributions:[],available:0,day:'2026-10-06',checked:false,room:{},level:1,hour:9};
test('personality has sixty distinct non-financial lines, with room and time context',()=>{
 assert.equal(new Set(mikoPersonality).size,60);
 const lines=mikoLines({...base,room:{left:'plant',toy:'yarn'},hour:23});
 assert(lines.some(l=>l.text.includes('Tanaman kecil')));assert(lines.some(l=>l.text.includes('Benang biru')));assert(lines.some(l=>l.text.includes('Sudah malam')));
 assert(lines.filter(l=>l.kind==='personal').length>lines.filter(l=>l.kind==='record').length);
 assert(!lines.some(l=>/harus belanja|kehilangan level/i.test(l.text)));
});
test('recorded-finance dialogue reacts to deficit, actual goal progress and check-in',()=>{
 const lines=mikoLines({...base,available:-5000,checked:true,goals:[{id:'a',title:'Laptop',target_amount:1000000,target_date:null}],contributions:[{goal_id:'a',amount:250000}]});
 assert(lines[0].text.includes('di bawah nol'));assert.equal(lines[0].route,'balance');
 assert(lines.some(l=>l.text.includes('Laptop')&&l.text.includes('750.000')));assert(lines.some(l=>l.text.includes('Check-in hari ini sudah beres')));
 assert(!lines.some(l=>l.text.includes('Dana bebas yang tercatat')));
});

test('large dialogue bank adapts bond and all self references to a renamed pet',()=>{
 const first=mikoLines({...base,name:'Nala',checkins:0}),long=mikoLines({...base,name:'Nala',checkins:1190,level:120});
 assert(new Set(long.map(l=>l.text)).size>100);assert(first.every(l=>!l.text.includes('Miko')));assert(long.every(l=>!l.text.includes('Miko')));
 assert(long.some(l=>/setahun|perjalanan|lama|kenangan/.test(l.text)));assert.notDeepEqual(first.map(l=>l.text),long.map(l=>l.text));
});

test('returning users hear a different first personal story on the next date',()=>{ const a=mikoLines({...base,name:'Nala',checkins:30}),b=mikoLines({...base,name:'Nala',checkins:30,day:'2026-10-07'}); assert.notEqual(a.find(l=>l.kind==='personal').text,b.find(l=>l.kind==='personal').text); });
