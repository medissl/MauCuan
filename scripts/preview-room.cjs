// Static visual review built from the actual SVG components and layout constants.
// It validates composition, not native gesture or touch behavior.
const fs=require('fs'),path=require('path'),vm=require('vm'),React=require('react'),{renderToStaticMarkup}=require('react-dom/server'),ts=require('typescript');
const root=path.resolve(__dirname,'..'), {petCatalog}=require('../src/lib/pet.ts'),{roomLayout}=require('../src/lib/pet-layout.ts');
const moduleArt={exports:{}};
const svg={__esModule:true};for(const n of ['Svg','G','Path','Circle','Ellipse','Rect','Line'])svg[n==='Svg'?'default':n]=n.toLowerCase();
const code=ts.transpileModule(fs.readFileSync(path.join(root,'src/components/pet-art.tsx'),'utf8'),{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.CommonJS}}).outputText;
vm.runInThisContext('(function(require,module,exports){'+code+'})')(n=>n==='react-native-svg'?svg:require(n),moduleArt,moduleArt.exports);
const {RoomArt,ItemArt,WearableArt}=moduleArt.exports;
const png='data:image/png;base64,'+fs.readFileSync(path.join(root,'assets/miko/miko-pet-idle.png')).toString('base64');
const e=React.createElement, width=352, size=width*roomLayout.character.size;
function scene(room){return `<div class="room" style="width:${width}px;height:${width*roomLayout.height}px">${renderToStaticMarkup(e(RoomArt,{room}))}<div style="position:absolute;left:${width*roomLayout.character.x}px;top:${width*roomLayout.character.y}px;width:${size}px;height:${size}px"><img src="${png}" width="${size}" height="${size}"><div class="wear">${renderToStaticMarkup(e(WearableArt,{room,size}))}</div></div>${['left','right','toy'].map(slot=>room[slot]?`<div style="position:absolute;left:${roomLayout[slot].x*width}px;top:${roomLayout[slot].y*width}px">${renderToStaticMarkup(e(ItemArt,{id:room[slot],size:roomLayout[slot].size*width}))}</div>`:'').join('')}</div><div class="speech">Hai! Mau duduk dekat aku?<br><small>Fixed dialogue space beneath the decorated interior</small></div>`;}
const full={wall:'wall_treehouse',floor:'rug_checker',head:'heart_crown',face:'moon_glasses',left:'books',right:'anniversary_mobile',toy:'rocking_horse'};
const html='<!doctype html><meta charset="utf-8"><title>MauCuan room placement review</title><style>body{font:15px Arial;background:#efede7;color:#00323e;padding:24px}.grid{display:flex;flex-wrap:wrap;gap:24px}.tile{width:352px}.room{position:relative;overflow:hidden;border-radius:28px 28px 0 0;background:#fff4e7}.wear{position:absolute;inset:0}.speech{box-sizing:border-box;height:168px;padding:25px;background:#fff4e7;border-radius:0 0 28px 28px}small{color:#62767a}</style><h1>All collection placements</h1><div class="grid">'+[{name:'All seven slots',room:full},...petCatalog.map(item=>({name:item.name,room:{...full,[item.slot]:item.id}}))].map(({name,room})=>`<article class="tile"><h2>${name}</h2>${scene(room)}</article>`).join('')+'</div>';
fs.mkdirSync(path.join(root,'.review-export'),{recursive:true});fs.writeFileSync(path.join(root,'.review-export/room-gallery.html'),html);console.log('Created actual-component review for every collectible.');


