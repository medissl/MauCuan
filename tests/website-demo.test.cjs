const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

// Run the shipped script with a small DOM boundary; exercise the actual event handlers.
function demo() {
  const events = {}, timers = new Map(), nodes = new Map();
  let timerId = 0;
  const node = id => {
    if (!nodes.has(id)) nodes.set(id, { id, innerHTML:'', style:{}, dataset:{}, hidden:true,
      classList:{add(){},remove(){},toggle(){}}, events:{},
      addEventListener(type, fn){this.events[type]=fn;}, querySelector(){return null;}, focus(){}, setPointerCapture(){},
      getBoundingClientRect:()=>({left:0,right:300,top:300,bottom:450}) });
    return nodes.get(id);
  };
  const document = { getElementById(id){
    if(['receipt','drop-zone','pet-figure'].includes(id) && !node('app').innerHTML.includes('id="'+id+'"')) return null;
    return node(id);
  }, querySelectorAll:()=>[], querySelector:()=>null, addEventListener:(type,fn)=>{events[type]=fn;} };
  class FormData {constructor(form){this.values=form.values;}get(key){return this.values[key]??null;}}
  const context = vm.createContext({document,FormData,Image:class{},console,
    window:{setTimeout(fn){const id=++timerId;timers.set(id,fn);return id;},clearTimeout(id){timers.delete(id);}}});
  vm.runInContext(fs.readFileSync('website/demo/app.js','utf8'),context);
  const run=code=>vm.runInContext(code,context);
  return {run,node,events,timers,
    tick(){const batch=[...timers.values()];timers.clear();batch.forEach(fn=>fn());},
    submit(id,values){events.submit({preventDefault(){},target:{id,values}});},
    action(action){events.click({target:{closest(selector){return selector==='[data-action]'?{dataset:{action}}:null;}}});},
    answer(index){events.click({target:{closest(selector){return selector==='[data-answer]'?{dataset:{answer:String(index)}}:null;}}});}
  };
}

test('demo preserves balances, manual transactions, goals, allocations and escaping',()=>{
  const d=demo();
  assert.equal(d.run('balance()'),2250000);
  d.submit('transaction-form',{title:'<Lunch>',amount:'25000',type:'expense',category:'Makan & minum'});
  assert.equal(d.run('balance()'),2225000);
  assert.match(d.node('app').innerHTML,/&lt;Lunch&gt;/);
  d.submit('transaction-form',{title:'Freelance',amount:'100000',type:'income',category:'Lainnya'});
  assert.equal(d.run('balance()'),2325000);
  d.submit('goal-form',{name:'Dana buku',target:'500000'});
  const id=d.run('state.goals[1].id');
  d.submit('allocate-form',{goal:String(id),amount:'125000'});
  assert.equal(d.run('state.goals[1].saved'),125000);
  assert.equal(d.run('balance()'),2200000);
  d.submit('allocate-form',{goal:String(id),amount:'500000'});
  assert.equal(d.run('state.goals[1].saved'),125000);
  assert.match(d.node('notice').textContent,/Periksa jumlah/);
  d.submit('transaction-form',{title:'Invalid',amount:'1.5',type:'expense'});
  assert.equal(d.run('state.transactions.length'),5);
});

test('receipt HTML drag reads once, reviewed fields save, reset cancels pending work',()=>{
  const d=demo();d.run("goto('scan')");
  const transfer=new Map();
  const dataTransfer={setData:(key,value)=>transfer.set(key,value),getData:key=>transfer.get(key)};
  d.node('receipt').events.dragstart({dataTransfer});
  d.node('drop-zone').events.drop({preventDefault(){},dataTransfer});
  assert.equal(d.run('state.scanning'),true);
  d.run('doScan()');assert.equal(d.timers.size,1);
  d.tick();assert.equal(d.run('state.scanned'),true);
  assert.match(d.node('app').innerHTML,/id="scan-form"/);
  d.submit('scan-form',{merchant:'Kedai baru',title:'Kopi direview',amount:'47000',category:'Lainnya',date:'2026-11-23'});
  assert.equal(d.run('balance()'),2203000);
  assert.equal(d.run('state.transactions.at(-1).date'),'2026-11-23');
  d.run("goto('scan');doScan()");d.node('reset').events.click();d.tick();
  assert.equal(d.run('state.tab'),'home');assert.equal(d.run('state.scanned'),false);
  assert.equal(d.run('balance()'),2250000);
});

test('touch drag, keyboard scan and click fallback share the receipt flow',()=>{
  const d=demo();d.run("goto('scan')");
  d.node('receipt').events.pointerdown({pointerType:'touch',clientX:100,clientY:100,pointerId:1});
  d.node('receipt').events.pointermove({clientX:100,clientY:350});
  assert.match(d.node('receipt').style.transform,/250px/);
  d.node('receipt').events.pointerup({clientX:100,clientY:350});d.tick();
  assert.equal(d.run('state.scanned'),true);
  d.action('scan-again');d.node('receipt').events.keydown({key:'Enter',preventDefault(){}});d.tick();
  assert.equal(d.run('state.scanned'),true);
  d.action('scan-again');d.node('drop-zone').events.click();d.tick();
  assert.equal(d.run('state.scanned'),true);
});

test('Miko expressions react, return to idle, rest, and check-in rewards once',()=>{
  const d=demo();d.run("goto('miko')");
  for(const [action,mood] of [['pet','wink'],['talk','focused'],['highfive','happy'],['rest','rest'],['ball','focused']]){
    d.action(action);assert.equal(d.run('state.petMood'),mood);
  }
  d.tick();assert.equal(d.run('state.petMood'),'happy');
  d.tick();assert.equal(d.run('state.petMood'),'idle');
  d.action('checkin');d.action('checkin');
  assert.equal(d.run('state.xp'),55);assert.equal(d.run('state.leaves'),95);
  assert.equal(d.run('state.petMood'),'happy');
  assert.equal(d.run('balance()'),2250000);
});

test('five-question quiz preserves score, feedback and single reward across replay',()=>{
  const d=demo();d.action('quiz');
  for(const answer of [1,0,1,2,0]){d.answer(answer);d.answer(answer);d.action('next-quiz');}
  assert.equal(d.run('state.quizCorrect'),5);assert.equal(d.run('state.leaves'),100);
  assert.match(d.node('app').innerHTML,/5 \/ 5 benar/);
  d.action('quiz');
  for(let i=0;i<5;i++){d.answer(0);d.action('next-quiz');}
  assert.equal(d.run('state.leaves'),100);assert.equal(d.run('state.xp'),35);
  d.node('reset').events.click();assert.equal(d.run('state.leaves'),85);
});
