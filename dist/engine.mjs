export const other=c=>c==='black'?'red':'black';
export const relative=(i,c)=>c==='black'?i+1:24-i;
export const physical=(p,c)=>c==='black'?p-1:24-p;
export function initial(){const s={points:Array(24).fill(null),bar:{black:0,red:0},off:{black:0,red:0},turn:'black',completedTurns:0,dice:[],rolled:[],opening:true,winner:null};for(const c of ['black','red'])for(const [p,n]of [[24,2],[13,5],[8,3],[6,5]])s.points[physical(p,c)]={color:c,count:n};return s;}
export function single(s,die){const c=s.turn,m=[];if(s.winner)return m;const sources=s.bar[c]?['bar']:s.points.flatMap((v,i)=>v?.color===c?[i]:[]);const home=!s.bar[c]&&s.points.every((v,i)=>v?.color!==c||relative(i,c)<=6);for(const from of sources){const p=from==='bar'?25:relative(from,c),q=p-die;if(q<=0){if(!home||from==='bar')continue;if(q<0&&s.points.some((v,i)=>v?.color===c&&relative(i,c)>p))continue;m.push({from,to:'off',die});}else{const to=physical(q,c),v=s.points[to];if(!v||v.color===c||v.count===1)m.push({from,to,die});}}return m;}
export function apply(s,m){const n=structuredClone(s),c=s.turn;if(m.from==='bar')n.bar[c]--;else if(--n.points[m.from].count===0)n.points[m.from]=null;if(m.to==='off')n.off[c]++;else{const v=n.points[m.to];if(v&&v.color!==c){n.bar[v.color]++;n.points[m.to]=null;}if(n.points[m.to])n.points[m.to].count++;else n.points[m.to]={color:c,count:1};}const j=n.dice.indexOf(m.die);if(j>=0)n.dice.splice(j,1);if(n.off[c]===15&&!s.winner){n.winner=c;n.completedTurns=(s.completedTurns??0)+1;}return n;}
export function sequences(s){if(!s.dice.length||s.winner)return [[]];let paths=[];for(const d of new Set(s.dice))for(const m of single(s,d))for(const rest of sequences(apply(s,m)))paths.push([m,...rest]);if(!paths.length)return [[]];const max=Math.max(...paths.map(p=>p.length));paths=paths.filter(p=>p.length===max);if(max===1&&new Set(s.dice).size>1){const high=Math.max(...paths.map(p=>p[0].die));paths=paths.filter(p=>p[0].die===high);}return paths;}
export function options(s,from){const out=[];for(const path of sequences(s)){let used=[];for(const m of path){if(!used.length?m.from!==from:m.from!==used.at(-1).to)break;used.push(m);const to=m.to;if(!out.some(o=>o.to===to&&o.moves.map(x=>x.die).join()==used.map(x=>x.die).join()))out.push({to,moves:[...used]});if(to==='off')break;}}return out;}
export function movable(s){return [...new Set(sequences(s).filter(p=>p.length).map(p=>p[0].from))];}
export const threatDistances=new Set([...Array.from({length:12},(_,i)=>i+1),15,16,18,20,24]);
export function exposed(s,i){const v=s.points[i];if(!v||v.count!==1)return false;const enemy=other(v.color),target=relative(i,enemy);return (s.bar[enemy]>0&&threatDistances.has(25-target))||s.points.some((x,j)=>x?.color===enemy&&threatDistances.has(relative(j,enemy)-target));}
export function dtg(s,c){let raw=25*s.bar[c],variance=0;for(let i=0;i<24;i++){const v=s.points[i];if(v?.color===c){raw+=relative(i,c)*v.count;if(exposed(s,i))variance+=(25-relative(i,c))/2;}}return {raw,value:raw+variance,variance};}
export function valid(s){return ['black','red'].every(c=>s.bar[c]+s.off[c]+s.points.reduce((n,v)=>n+(v?.color===c?v.count:0),0)===15);}
export function notation(m,c){const label=p=>typeof p==='number'?relative(p,c):p;return `${label(m.from)}/${label(m.to)}`;}

// Move a chosen number of distinct checkers from one source. Every option is a
// prefix of a globally legal turn; continuations can advance selected checkers.
export function batchOptions(s,from,count=1){
 if(count===1)return options(s,from).map(o=>({...o,destinations:[o.to]}));
 const available=from==='bar'?s.bar[s.turn]:s.points[from]?.color===s.turn?s.points[from].count:0;
 if(count>available||count>s.dice.length)return [];
 const result=[],seen=new Set();
 for(const path of sequences(s)){
  let remaining=count;const locations=new Map(),used=[];
  for(const m of path){
   if(m.from===from&&remaining>0)remaining--;
   else if((locations.get(m.from)||0)>0)locations.set(m.from,locations.get(m.from)-1);
   else break;
   locations.set(m.to,(locations.get(m.to)||0)+1);used.push(m);
   if(!remaining){const key=JSON.stringify(used);if(!seen.has(key)){seen.add(key);const destinations=[...locations].flatMap(([p,n])=>Array(n).fill(p));result.push({to:destinations[0],destinations,moves:[...used]});}}
  }
 }
 return result;
}
export function selectableCount(s,from){const available=from==='bar'?s.bar[s.turn]:s.points[from]?.color===s.turn?s.points[from].count:0;for(let n=Math.min(4,available,s.dice.length);n>0;n--)if(batchOptions(s,from,n).length)return n;return 0;}
export function rollDice(s,random=Math.random){let a,b;do{a=1+Math.floor(random()*6);b=1+Math.floor(random()*6);}while(s.opening&&a===b);const n=structuredClone(s),opening=s.opening;n.turn=opening?(a>b?'black':'red'):s.turn;n.opening=false;n.rolled=[a,b];n.dice=a===b?[a,a,a,a]:[a,b];n.diceColors=opening?['black','red']:[n.turn,n.turn];return n;}

// Doubles batch placement means all selected checkers share a destination.
export function placementOptions(s,from,count=1){
 const plans=batchOptions(s,from,count);
 return count>1&&s.dice.length>0&&new Set(s.dice).size===1
  ?plans.filter(p=>p.destinations.every(d=>d===p.destinations[0])):plans;
}
export function destinationMatches(plan,destination,allowSplit=false){return allowSplit?plan.destinations.includes(destination):plan.destinations.every(d=>d===destination);}
export function destinationChoice(plans,destination,allowSplit=false){
 return plans.find(p=>destinationMatches(p,destination,allowSplit));
}

// Count a completed turn once, at handoff; a winning turn is counted by apply instead.
export function endTurn(state) {
  const next = structuredClone(state);
  if (state.winner || !state.rolled.length || sequences(state).some(path => path.length)) return next;
  next.completedTurns = (state.completedTurns ?? 0) + 1;
  next.turn = other(state.turn);
  next.dice = [];
  next.rolled = [];
  return next;
}
