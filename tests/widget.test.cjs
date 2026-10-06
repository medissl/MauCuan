const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm'),ts=require('typescript');
const React=require('react'),Renderer=require('react-test-renderer'),{act}=React;global.IS_REACT_ACT_ENVIRONMENT=true;
const calls=[],listeners=[];let platform='android';
const widget={update(...a){calls.push(a)},requestPin(){return true}};
const code=ts.transpileModule(fs.readFileSync(require('path').join(__dirname,'../src/hooks/usePetWidget.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
const mod={exports:{}};
const rn={Platform:{get OS(){return platform}},AppState:{addEventListener(_,fn){listeners.push(fn);return {remove(){listeners.splice(listeners.indexOf(fn),1)}}}}};
vm.runInThisContext('(function(require,module,exports){'+code+'\n})')(n=>n==='react'?React:n==='react-native'?rn:{__esModule:true,default:widget},mod,mod.exports);
function Host(p){mod.exports.usePetWidget(p.user,p.name,p.day);return null}
test('widget sync uses chosen name, check-in day and clears identity when signed out',async()=>{
 let r;await act(async()=>{r=Renderer.create(React.createElement(Host,{user:'a',name:'Nala',day:'2026-10-06'}))});
 assert.equal(calls.at(-1)[0],'Nala');assert.equal(calls.at(-1)[2],'2026-10-06');assert.equal(calls.at(-1)[3],true);
 const before=calls.length;await act(async()=>listeners[0]('active'));assert.equal(calls.length,before+1);
 await act(async()=>r.update(React.createElement(Host,{name:'Miko',day:''})));assert(calls.some(a=>a[0]===''&&a[3]===false));assert.equal(calls.at(-1)[3],false);
 await act(async()=>r.unmount());assert.equal(listeners.length,0);
});
test('pin request is Android-only and iOS skips native widget calls',async()=>{
 assert.equal(mod.exports.requestPetWidget(),true);platform='ios';assert.equal(mod.exports.requestPetWidget(),false);
 const before=calls.length;let r;await act(async()=>{r=Renderer.create(React.createElement(Host,{user:'a',name:'Nala',day:''}))});assert.equal(calls.length,before);await act(async()=>r.unmount());platform='android';
});
