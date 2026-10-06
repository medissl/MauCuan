const test=require('node:test'),assert=require('node:assert/strict');
const {quizBank,selectQuiz}=require('../src/lib/daily-quiz.ts');
const {petProgress}=require('../src/lib/finance.ts');
test('500 complete questions have distinct prompts, valid choices and balanced correct positions',()=>{
 assert.equal(quizBank.length,500);assert.equal(new Set(quizBank.map(q=>q.id)).size,500);assert.equal(new Set(quizBank.map(q=>q.question)).size,500);
 for(const q of quizBank){assert.equal(q.answers.length,3);assert.equal(new Set(q.answers).size,3);assert(q.correct>=0&&q.correct<3);assert(q.explanation.length>20);assert(q.question.length<250);}
 for(let i=0;i<3;i++)assert(quizBank.filter(q=>q.correct===i).length>=165);
 const sql=require('fs').readFileSync(require('path').join(__dirname,'../supabase/daily-quiz.sql'),'utf8');for(const q of quizBank)assert(sql.includes(`('${q.id}',${q.correct})`),'server grading matches '+q.id);
});
test('first 100 daily sets visit all 500 questions once and never repeat the preceding seven days',()=>{
 const history=[];let state=17;const random=()=>((state=(state*1664525+1013904223)>>>0)/4294967296);
 const date=i=>new Date(Date.UTC(2026,9,1+i)).toISOString().slice(0,10);
 for(let i=0;i<140;i++){const day=date(i),ids=selectQuiz(history,day,random);assert.equal(ids.length,5);assert.equal(new Set(ids).size,5);const recent=new Set(history.slice(-7).flatMap(s=>s.question_ids));assert(ids.every(id=>!recent.has(id)));history.push({day,question_ids:ids,answers:[],completed:false,reward:0});assert.deepEqual(selectQuiz(history,day,()=>0),ids,'same-day reopening preserves the set');}
 assert.deepEqual(history[0].question_ids,['q001','q002','q003','q004','q005']);assert.equal(new Set(history.slice(0,100).flatMap(s=>s.question_ids)).size,500);
});
test('daily learning adds leaves, never XP; level 120 still takes 1190 check-ins',()=>{
 const checkins=Array.from({length:1190},(_,i)=>({day:String(i),no_spend:true}));const quizzes=checkins.map(()=>({reward:5}));
 assert.equal(petProgress(checkins,[],quizzes).level,120);assert.equal(petProgress(checkins.slice(0,-1),[],quizzes).level,119);assert.equal(petProgress([],[],quizzes).level,1);
 assert.equal(petProgress(checkins,[],quizzes).leaves,17850);assert.equal(petProgress([{day:'today'}],[{accessory:'old',cost:80}],[{reward:5}]).leaves,-65,'old purchases retain historical cost');
});
