import {motionPaths,movementDuration,departingState} from './motion.mjs';
import {automaticAngle,nextRotation,rotationScale,rotationFrames,barCheckerLayout} from './view.mjs';
import {initial,other,relative,physical,apply,options,movable,dtg,valid,notation,batchOptions,selectableCount,rollDice,placementOptions,destinationChoice,destinationMatches} from './engine.mjs';
const $=id=>document.getElementById(id);let state=initial(),mode='play',selected=null,flipped=false,history=[],future=[],message='',selectedCount=1,movementInProgress=false,viewOverride=null;
try{const saved=JSON.parse(localStorage.getItem('backgammon-lab-v1'));if(saved){state=saved.state;mode=saved.mode||'play';flipped=!!saved.flipped;viewOverride=saved.viewOverride??null;}}catch{}
const save=()=>!movementInProgress&&localStorage.setItem('backgammon-lab-v1',JSON.stringify({state,mode,flipped,viewOverride}));
function checkpoint(){history.push({state:structuredClone(state),mode});future=[];}
const name=c=>c==='black'?'Black':'Red';
const svgNS='http://www.w3.org/2000/svg';function el(tag,a={},text){const n=document.createElementNS(svgNS,tag);for(const [k,v]of Object.entries(a))n.setAttribute(k,v);if(text!==undefined)n.textContent=text;return n;}
function clickGroup(n,fn,label){n.setAttribute('role','button');n.setAttribute('tabindex','0');n.setAttribute('aria-label',label);n.addEventListener('click',fn);n.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();fn();}});}
function sourceValue(src){if(typeof src==='number')return state.points[src];const [where,c]=src.split(':');return state[where][c]?{color:c,count:state[where][c]}:null;}
function pick(src,count=1){message='';if(mode==='setup'){if(selected!==null&&src!==selected){const v=sourceValue(selected);if(v){let dst=typeof src==='number'?state.points[src]:null;if(typeof src==='string'&&src.split(':')[1]!==v.color){message='Use the matching color’s bar or off tray.';render();return;}if(dst&&dst.color!==v.color){selected=src;render();return;}checkpoint();const setupFrom=selected,setupTo=src;withMovement([{from:typeof setupFrom==='number'?setupFrom:setupFrom.split(':')[0],to:typeof setupTo==='number'?setupTo:setupTo.split(':')[0]}],v.color,()=>{if(typeof selected==='number'){if(--state.points[selected].count===0)state.points[selected]=null;}else{const [w,c]=selected.split(':');state[w][c]--;}if(typeof src==='number'){if(state.points[src])state.points[src].count++;else state.points[src]={color:v.color,count:1};}else{const [w,c]=src.split(':');state[w][c]++;}state.winner=null;selected=null;});return;}}selected=sourceValue(src)?src:null;render();return;}
if(typeof src==='string'&&src.startsWith('off:')&&src!==`off:${state.turn}`)return;
const dest=typeof src==='string'&&src.startsWith('off:')?'off':src;
if(selected!==null){const match=destinationChoice(placementOptions(state,selected,selectedCount),dest,new Set(state.dice).size>1);if(match){execute(match.moves);return;}}
const from=typeof src==='string'&&src===`bar:${state.turn}`?'bar':src;if(movable(state).includes(from)){selected=selected===from&&selectedCount===count?null:from;selectedCount=count;}else{selected=null;message=state.dice.length?'That checker has no legal move.':'Roll the dice to begin.';}render();}
function execute(moves){checkpoint();withMovement(moves,state.turn,()=>{for(const m of moves)state=apply(state,m);selected=null;message='';});}
function checkerElement(p){return $('board').querySelector(`[data-location="${p.location}"][data-color="${p.color}"][data-index="${p.index}"]`);}
function checkerRect(p){const node=checkerElement(p);if(node)return (node.querySelector('circle')||node.querySelector('rect')).getBoundingClientRect();
 const svg=$('board').querySelector('svg'),point=svg.createSVGPoint();point.x=970;point.y=p.color==='black'?svg.viewBox.baseVal.height-60:60;const q=point.matrixTransform(svg.getScreenCTM());return {x:q.x-12,y:q.y-12,width:24,height:24};}
function withMovement(moves,color,change){
 const before=structuredClone(state),paths=motionPaths(state,moves,color),starts=paths.map(p=>checkerRect(p.from));
 if(matchMedia('(prefers-reduced-motion: reduce)').matches){change();render();return;}
 movementInProgress=true;change();const finalState=structuredClone(state);render();const ends=paths.map(p=>checkerRect(p.to));
 state=departingState(before,paths);render();
 const animations=[],ghosts=[];$('board').closest('main').inert=true;
 paths.forEach((p,i)=>{const start=starts[i],end=ends[i];
  const ghost=document.createElement('div');ghost.className=`moving-checker ${p.from.color}`;ghost.setAttribute('aria-hidden','true');Object.assign(ghost.style,{left:`${start.x}px`,top:`${start.y}px`,width:`${start.width}px`,height:`${start.height}px`});document.body.append(ghost);ghosts.push(ghost);
  animations.push(ghost.animate([{transform:'translate(0,0) scale(1)',opacity:1},{transform:`translate(${end.x-start.x}px,${end.y-start.y}px) scale(${end.width/start.width},${end.height/start.height})`,opacity:1}],{duration:movementDuration(Math.hypot(end.x-start.x,end.y-start.y),Math.hypot($('board').clientWidth,$('board').clientHeight)),easing:'linear',fill:'forwards'}).finished.catch(()=>{}));
 });
 Promise.all(animations).finally(()=>{for(const n of ghosts)n.remove();state=finalState;movementInProgress=false;render();$('board').closest('main').inert=false;});
}
function draw(){
 const narrow=matchMedia('(max-width:600px) and (orientation:portrait)').matches,H=narrow?Math.max(700,1000*$('board').clientHeight/Math.max(1,$('board').clientWidth)):590;
 const svg=el('svg',{viewBox:`0 0 1000 ${H}`,preserveAspectRatio:'xMidYMid meet'}),defs=el('defs');defs.innerHTML='<radialGradient id="black-disc" cx="35%" cy="25%"><stop stop-color="#56616a"/><stop offset=".7" stop-color="#232c32"/><stop offset="1" stop-color="#131d22"/></radialGradient><radialGradient id="red-disc" cx="35%" cy="25%"><stop stop-color="#e68b73"/><stop offset=".7" stop-color="#b44d45"/><stop offset="1" stop-color="#843a36"/></radialGradient>';svg.append(defs);
 svg.append(el('rect',{x:1,y:1,width:998,height:H-2,rx:16,fill:'#7b6149',stroke:'#a48c69','stroke-width':2}),el('rect',{x:52,y:22,width:896,height:H-44,rx:5,fill:'#d9c9a8'}));
 const top=34,bottom=H-34,mid=H/2,baseX=65,cw=67,gap=66,r=27,hint=$('hints').checked;
 const opts=selected!==null&&mode==='play'?placementOptions(state,selected,selectedCount):[];
 for(let row=0;row<2;row++)for(let col=0;col<12;col++){
  let p=row===0?13+col:12-col;
  const i=p-1,x=baseX+col*cw+(col>=6?gap:0),cx=x+cw/2,base=row===0?top:bottom,tip=row===0?mid-40:mid+40;
  const g=el('g'),v=state.points[i],movesHere=opts.filter(o=>destinationMatches(o,i,new Set(state.dice).size>1)),max=mode==='play'&&v?.color===state.turn?selectableCount(state,i):0;
  g.append(el('rect',{x,y:row===0?22:mid,width:cw,height:H/2-22,fill:'transparent'}),el('polygon',{points:`${x+3},${base} ${x+cw-3},${base} ${cx},${tip}`,fill:col%2===row?'#557468':'#a88059',opacity:.94}));
  if(hint&&movesHere.length)g.append(el('rect',{x:x+2,y:row===0?top-3:mid+6,width:cw-4,height:bottom-mid-3,rx:10,fill:'#f9db8730',stroke:'#ffe5a1','stroke-width':3,'stroke-dasharray':'6 4'}));
  if(v){const n=v.count,step=n>1?Math.min(53,Math.max(0,Math.abs(tip-base)-2*r-8)/(n-1)):0;
   for(let k=0;k<n;k++){
    const rank=n-k,cy=base+(row===0?1:-1)*(r+4+k*step),cg=el('g',{'data-location':i,'data-color':v.color,'data-index':k}),active=hint&&rank<=max,isSel=selected===i&&rank<=selectedCount;
    cg.append(el('circle',{cx,cy,r,fill:`url(#${v.color}-disc)`,stroke:isSel?'#ffdc89':active?'#d5f5d1':'#ffffff35','stroke-width':isSel?5:active?3:1}),el('circle',{cx,cy,r:r-6,fill:'none',stroke:'#ffffff18','stroke-width':2}));

    if(rank<=max&&mode==='play'){
     clickGroup(cg,e=>pick(i,rank),`Select ${rank} ${v.color} checker${rank===1?'':'s'} from point ${relative(i,v.color)}`);
     cg.addEventListener('click',e=>e.stopPropagation());cg.addEventListener('keydown',e=>e.stopPropagation());
    }
    g.append(cg);
   }
  }
  if(hint&&movesHere.length)g.append(el('circle',{cx,cy:row===0?mid-67:mid+67,r:17,fill:'#f5d28a',stroke:'#374c3c','stroke-width':2}));
  clickGroup(g,()=>pick(i),`Black ${relative(i,'black')}, Red ${relative(i,'red')}: ${v?`${v.count} ${v.color} checker${v.count===1?'':'s'}`:'empty'}${max?`, ${max} movable`:''}${movesHere.length?', legal destination':''}`);svg.append(g);
 }
 svg.append(el('rect',{x:467,y:22,width:66,height:H-44,rx:3,fill:'#80654b'}));
 for(const [c,cy]of [['red',H*.28],['black',H*.72]]){
  const g=el('g'),src=`bar:${c}`,count=state.bar[c],max=mode==='play'&&c===state.turn?selectableCount(state,'bar'):0,n=count,layout=barCheckerLayout(count);
  g.append(el('rect',{x:468,y:cy-78,width:64,height:156,rx:6,fill:'#73583f'}));
  for(let k=0;k<n;k++){const rank=n-k,x=500+layout[k].x,y=cy+layout[k].y,r=layout[k].r,cg=el('g',{'data-location':src,'data-color':c,'data-index':k}),active=hint&&rank<=max,isSel=(selected==='bar'||selected===src)&&c===state.turn&&rank<=selectedCount;
   cg.append(el('circle',{cx:x,cy:y,r,fill:`url(#${c}-disc)`,stroke:isSel?'#ffdc89':active?'#d5f5d1':'#ffffff30','stroke-width':isSel?5:active?3:1}));
   if(rank<=max){clickGroup(cg,()=>pick(src,rank),`Select ${rank} ${c} checker${rank===1?'':'s'} from bar`);cg.addEventListener('click',e=>e.stopPropagation());cg.addEventListener('keydown',e=>e.stopPropagation());}g.append(cg);
  }

  clickGroup(g,()=>pick(src),`${name(c)} bar: ${count} checkers`);svg.append(g);
 }
 // Borne-off checkers share the right edge, beside each player's home half.
 for(const c of ['red','black']){
  const count=state.off[c],topHome=c==='red',edge=topHome?25:H-25,height=(H/2-25)/24,g=el('g'),canOff=c===state.turn&&opts.some(o=>o.destinations.every(d=>d==='off'));
  g.append(el('rect',{x:950,y:topHome?24:H/2+8,width:42,height:H/2-32,rx:5,fill:hint&&canOff?'#f9db8730':'transparent',stroke:hint&&canOff?'#ffe5a1':'none','stroke-width':3,'stroke-dasharray':'6 4'}));
  for(let k=0;k<count;k++){const y=topHome?edge+k*height:edge-(k+1)*height,cg=el('g',{'data-location':`off:${c}`,'data-color':c,'data-index':k});
   cg.append(el('rect',{x:954,y,width:34,height,rx:Math.min(3,height/3),fill:`url(#${c}-disc)`,stroke:c==='black'?'#77858a':'#edab91','stroke-width':.8}));g.append(cg);
  }clickGroup(g,()=>pick(`off:${c}`),`${name(c)} home: ${count} borne-off checkers${canOff?', legal destination':''}`);svg.append(g);
 }
 if(narrow)for(const t of svg.querySelectorAll('text'))t.setAttribute('font-size',Number(t.getAttribute('font-size'))*2);
 $('board').replaceChildren(svg);orientBoard();
}
let boardAngle=null,boardAnimation=null;
function orientBoard(){
 const board=$('board'),target=nextRotation(boardAngle,viewOverride??automaticAngle(state,mode,flipped));
 const width=board.clientWidth,height=board.clientHeight,arrow=$('direction-arrow');
 arrow.style.transform=`rotate(${target}deg)`;
 board.style.setProperty('--board-angle',`${target}deg`);
 board.dataset.orientation=String(((target%360)+360)%360);
 const finalTransform=`rotate(${target}deg) scale(${rotationScale(target,width,height)})`;
 if(boardAngle===null||target===boardAngle){board.style.transform=finalTransform;boardAngle=target;return;}
 const from=boardAngle;boardAngle=target;
 if(boardAnimation)boardAnimation.cancel();
 board.style.transform=finalTransform;
 const frames=rotationFrames(from,target,width,height),timing={duration:matchMedia('(prefers-reduced-motion: reduce)').matches?0:1400,easing:'ease-in-out'};
 for(const a of arrow.getAnimations())a.cancel();
 arrow.animate(frames.map(f=>({transform:`rotate(${f['--board-angle']})`,offset:f.offset})),timing);
 const animation=board.animate(frames,timing);
 boardAnimation=animation;board.inert=true;
 animation.finished.catch(()=>{}).then(()=>{if(boardAnimation===animation){board.inert=false;boardAnimation=null;}});
}
function render(){
 const arrow=$('direction-arrow');arrow.toggleAttribute('hidden',state.opening);arrow.style.color=state.turn==='black'?'#182126':'#b84b43';arrow.setAttribute('aria-label',`${name(state.turn)} direction of travel`);
 $('direction-path').setAttribute('d',state.turn==='black'?'M44 6 H18 C2 6 2 30 18 30 H44':'M44 30 H18 C2 30 2 6 18 6 H44');
 $('direction-head').setAttribute('d',state.turn==='black'?'M36 23 L44 30 L36 37':'M36 -1 L44 6 L36 13');
 for(const c of ['black','red']){const d=dtg(state,c);$(c+'-score').innerHTML=`<div class="score"><span class="score-dot ${c}"></span><div><div class="score-name">${name(c)}${mode==='play'&&!state.opening&&state.turn===c?' · to move':''}</div><div class="score-value">${d.value}${d.variance?` <span class="variance">(± ${d.variance})</span>`:''}</div></div></div>`;}
$('play').classList.toggle('active',mode==='play');$('setup').classList.toggle('active',mode==='setup');$('setup-tools').hidden=mode!=='setup';$('flip').hidden=mode!=='setup';$('flip').disabled=false;$('flip').title='Rotate board 180°';$('turn-select').value=state.turn;
const canMove=state.dice.length&&movable(state).length>0;const text=message||(mode==='setup'?(selected!==null?'Choose a destination':'Arrange your position'):state.winner?`${name(state.winner)} wins!`:state.opening&&!state.rolled.length?'Roll to decide who starts':canMove?(selected!==null?'Choose a destination':`${name(state.turn)} to move`):state.rolled.length?(state.dice.length?'No legal moves — end turn':'Moves complete — end turn'):`${name(state.turn)} to roll`);
$('status').replaceChildren(document.createTextNode(text));const small=document.createElement('small');small.textContent=mode==='setup'?'Tap a stack to move one checker':state.opening&&!state.rolled.length?'One die per player · higher die starts':state.rolled.length?'Moves use each die separately':'Move toward your own point 1';$('status').append(small);
 $('roll').hidden=mode!=='play'||!!state.rolled.length||!!state.winner;$('end').hidden=mode!=='play'||!state.rolled.length||!!canMove||!!state.winner;
const remaining=[...state.dice];$('dice').replaceChildren();const ds=state.rolled.length===2&&state.rolled[0]===state.rolled[1]?Array(4).fill(state.rolled[0]):state.rolled;for(const [dieIndex,d] of ds.entries()){const ix=remaining.indexOf(d),n=document.createElement('span');const color=state.diceColors?.[dieIndex%2]||state.turn;n.className='die '+color+(ix<0?' used':'');n.textContent=['','⚀','⚁','⚂','⚃','⚄','⚅'][d];n.setAttribute('aria-label',`${d}${ix<0?', used':''}`);if(ix>=0)remaining.splice(ix,1);$('dice').append(n);}
$('move-options').replaceChildren();if(selected!==null&&mode==='play')for(const o of placementOptions(state,selected,selectedCount)){if(o.destinations.every(d=>d==='off')||!$('hints').checked)continue;const b=document.createElement('button');b.textContent=`${o.destinations.every(d=>d==='off')?'Bear off · ':''}${selectedCount} checker${selectedCount===1?'':'s'} · ${o.moves.map(m=>m.die).join(' + ')}`;b.title=o.moves.map(m=>notation(m,state.turn)).join(' · ');b.onclick=()=>execute(o.moves);$('move-options').append(b);}
$('undo').disabled=!history.length;$('redo').disabled=!future.length;$('set-dice').disabled=mode!=='setup';$('raw-counts').textContent=`Standard pip counts: Black ${dtg(state,'black').raw}, Red ${dtg(state,'red').raw}.`;draw();save();}
$('roll').onclick=()=>{checkpoint();const opening=state.opening;viewOverride=null;state=rollDice(state);message=opening?`Black rolled ${state.rolled[0]}, Red rolled ${state.rolled[1]}. ${name(state.turn)} starts.`:'';selected=null;render();};
$('end').onclick=()=>{checkpoint();viewOverride=null;state.turn=other(state.turn);state.dice=[];state.rolled=[];selected=null;message='';render();};
$('setup').onclick=()=>{if(mode!=='setup')viewOverride=boardAngle??automaticAngle(state,mode,flipped);mode='setup';selected=null;message='';render();};$('play').onclick=()=>{if(!valid(state)){message='Each color must have exactly 15 checkers across the board, bar, and off tray.';render();return;}if(mode==='setup'){viewOverride=boardAngle??automaticAngle(state,mode,flipped);state.winner=null;for(const c of ['black','red'])if(state.off[c]===15)state.winner=c;}mode='play';selected=null;message='';render();};
$('undo').onclick=()=>{if(history.length){future.push({state:structuredClone(state),mode});const prev=history.pop();state=prev.state;mode=prev.mode;selected=null;message='';render();}};$('redo').onclick=()=>{if(future.length){history.push({state:structuredClone(state),mode});const next=future.pop();state=next.state;mode=next.mode;selected=null;message='';render();}};
$('reset').onclick=()=>{checkpoint();viewOverride=null;state=initial();mode='play';selected=null;selectedCount=1;message='New game. Undo restores the previous position.';render();};$('flip').onclick=()=>{viewOverride=(boardAngle??automaticAngle(state,mode,flipped))+180;render();};$('hints').onchange=render;$('menu').onclick=()=>$('settings').showModal();$('info').onclick=()=>$('about').showModal();$('turn-select').onchange=e=>{checkpoint();state.turn=e.target.value;state.dice=[];state.rolled=[];state.opening=false;selected=null;render();};
$('clear').onclick=()=>{checkpoint();state.points.fill(null);state.bar={black:0,red:0};state.off={black:15,red:15};state.dice=[];state.rolled=[];state.winner=null;state.opening=false;selected=null;render();};
$('example').onclick=()=>{checkpoint();state=initial();state.points.fill(null);state.points[4]={color:'black',count:1};state.points[5]={color:'black',count:2};state.points[1]={color:'red',count:1};state.off={black:12,red:14};state.opening=false;selected=null;message='Exposure example: Black 27 (± 10), Red 24 (± 1).';render();};
for(const id of ['d1','d2'])for(let i=1;i<=6;i++)$(id).add(new Option(i,i));$('d1').value=3;$('d2').value=1;$('set-dice').onclick=()=>{checkpoint();const a=+$('d1').value,b=+$('d2').value;state.rolled=[a,b];state.diceColors=[state.turn,state.turn];state.dice=a===b?[a,a,a,a]:[a,b];state.opening=false;state.winner=null;selected=null;$('settings').close();render();};window.addEventListener('resize',draw);new ResizeObserver(draw).observe($('board'));render();

$('off-source').onclick=()=>{selected=null;pick(`off:${$('off-color').value}`);};$('off-destination').onclick=()=>{if(selected!==null){const v=sourceValue(selected);if(v)pick(`off:${v.color}`);}};


