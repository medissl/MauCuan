const test=require('node:test'),assert=require('node:assert/strict');
const {learnedReminderHour,reminderPlan,defaultReminders,returnMessages}=require('../src/lib/reminder-plan.ts');
const at=(day,hour)=>new Date(2026,9,day,hour).getTime();
test('reminders are opt-in and never scheduled on the current open day',()=>{
 const now=at(6,10),state={...defaultReminders,lastOpened:now};assert.deepEqual(reminderPlan(state,'Nala',now,0),[]);
 const plan=reminderPlan({...state,enabled:true},'Nala',now,0);
 assert.deepEqual(plan.map(p=>p.gap),[1,3,7,14,30]);assert(plan.every(p=>p.date.getTime()>now&&p.title==='Nala ingin menyapa'));
 assert.equal(plan[0].date.getDate(),7);assert.equal(plan[0].date.getHours(),20);
 const reopened={...state,enabled:true,lastOpened:at(7,9)};assert(reminderPlan(reopened,'Nala',at(7,9),0).every(p=>p.date.getDate()!==7));
});
test('learning requires five distinct days, ignores repeated batch votes and old or future sessions',()=>{
 const now=at(20,22);assert.equal(learnedReminderHour(Array(40).fill(at(19,12)),now),20);
 const votes=[15,16,17,18,19].map(d=>at(d,18));assert.equal(learnedReminderHour(votes,now),18);
 assert.equal(learnedReminderHour([...votes,...Array(100).fill(at(14,12)),at(22,12),at(-40,12),NaN],now),18);
});
test('nighttime activity produces daytime reminders and manual hour is honored',()=>{
 const now=at(20,22);assert.equal(learnedReminderHour([15,16,17,18,19].map(d=>at(d,2)),now),8);
 assert.equal(learnedReminderHour([15,16,17,18,19].map(d=>at(d,23)),now),21);
 const plan=reminderPlan({...defaultReminders,enabled:true,automatic:false,hour:12,lastOpened:now},'Nala',now,100);
 assert(plan.every(p=>p.date.getHours()===12));
});
test('return invitations vary, avoid financial amounts and do not hardcode the original pet name',()=>{
 assert.equal(new Set(returnMessages).size,24);
 assert(returnMessages.every(s=>!s.includes('Miko')&&!/Rp|kehilangan level|harus belanja/.test(s)));
 const now=at(6,10),state={...defaultReminders,enabled:true,lastOpened:now};
 const a=reminderPlan(state,'Nala',now,0),b=reminderPlan(state,'Nala',now,365);assert.notEqual(a[0].body,b[0].body);
});
