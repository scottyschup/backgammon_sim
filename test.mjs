import assert from 'node:assert/strict';import {initial,physical,single,sequences,options,apply,dtg,movable,valid,batchOptions,selectableCount,rollDice} from './dist/engine.mjs';
const empty=()=>{const s=initial();s.points.fill(null);s.off={black:0,red:0};s.opening=false;return s;};const put=(s,p,c,n)=>s.points[physical(p,c)]={color:c,count:n};
let s=initial();assert.equal(dtg(s,'black').raw,167);assert.equal(dtg(s,'red').raw,167);assert(valid(s));
s=empty();put(s,5,'black',1);put(s,6,'black',2);put(s,23,'red',1);assert.deepEqual(dtg(s,'black'),{raw:17,value:27,variance:10});assert.deepEqual(dtg(s,'red'),{raw:23,value:24,variance:1});
s=empty();put(s,15,'black',1);put(s,21,'red',1);assert.equal(dtg(s,'black').variance,5);s.points.fill(null);put(s,15,'black',1);put(s,23,'red',1);assert.equal(dtg(s,'black').variance,0);
s=empty();s.bar.black=1;s.dice=[1,2];assert(movable(s).every(v=>v==='bar'));assert(single(s,1).some(m=>m.to===physical(24,'black')));assert.equal(dtg(s,'black').raw,25);
s=empty();put(s,8,'black',1);s.dice=[5,3];put(s,20,'red',2);put(s,22,'red',2);assert(!options(s,physical(8,'black')).some(o=>o.to==='off'));
s=empty();put(s,8,'black',1);put(s,20,'red',1);s.dice=[3];let n=apply(s,single(s,3)[0]);assert.equal(n.bar.red,1);assert.equal(n.points[4].color,'black');
s=empty();put(s,6,'black',1);put(s,2,'black',1);s.dice=[3];assert(!single(s,3).some(m=>m.from===1&&m.to==='off'));s.points[5]=null;assert(single(s,3).some(m=>m.to==='off'));
s=empty();put(s,1,'black',1);s.dice=[1,2];assert(sequences(s).every(p=>p[0].die===2));
s=initial();s.dice=[2,2,2,2];assert(sequences(s).every(p=>p.length===4));assert(options(s,physical(13,'black')).some(o=>o.moves.length===4));
// Every selectable prefix must lead to a turn using the globally required number of dice.
for(let a=1;a<=6;a++)for(let b=1;b<=6;b++){s=initial();s.dice=a===b?[a,a,a,a]:[a,b];const paths=sequences(s),max=paths[0].length;for(const from of movable(s))for(const o of options(s,from)){let n=structuredClone(s);for(const m of o.moves)n=apply(n,m);assert.equal(o.moves.length+sequences(n)[0].length,max);assert(valid(n));}}
// Deterministic full-game simulations check bar, hits, bear-off, conservation, and termination.
let seed=7;const rand=n=>{seed=(seed*1664525+1013904223)>>>0;return seed%n;};for(let game=0;game<12;game++){s=initial();let turns=0;while(!s.winner&&turns++<3000){const a=rand(6)+1,b=rand(6)+1;s.dice=a===b?[a,a,a,a]:[a,b];const paths=sequences(s),p=paths[rand(paths.length)];for(const m of p)s=apply(s,m);assert(valid(s));if(!s.winner)s.turn=s.turn==='black'?'red':'black';}assert(s.winner);}
console.log('Passed: DTG example, exposure boundaries, bar priority, hits, bearing off, forced higher die, doubles, all roll prefixes, and 12 complete games.');

for(let distance=1;distance<=23;distance++){s=empty();put(s,24,'black',1);put(s,1+distance,'red',1);assert.equal(dtg(s,'black').variance,([1,2,3,4,5,6,7,8,9,10,11,12,15,16,18,20,24].includes(distance)?.5:0),`Threat distance ${distance}`);}
console.log('Passed: all on-board threat distances, including doubles.');

s=empty();put(s,24,'black',1);s.bar.red=1;assert.equal(dtg(s,'black').variance,.5);console.log('Passed: 24-pip doubles threat from the bar.');

// Batch choices move distinct original checkers and remain legal turn prefixes.
s=initial();s.dice=[3,1];assert.equal(selectableCount(s,physical(8,'black')),2);assert(batchOptions(s,physical(8,'black'),2).some(o=>o.destinations.includes(4)&&o.destinations.includes(6)));assert.equal(selectableCount(s,physical(13,'black')),1);
s=initial();s.dice=[2,2,2,2];assert.equal(selectableCount(s,physical(6,'black')),4);assert(batchOptions(s,physical(6,'black'),4).some(o=>o.destinations.every(p=>p===3)));
for(const count of [1,2,3,4])for(const o of batchOptions(s,physical(6,'black'),count)){assert.equal(o.destinations.length,count);let next=structuredClone(s);for(const m of o.moves)next=apply(next,m);assert(valid(next));assert.equal(o.moves.length+sequences(next)[0].length,4);}
let rolls=[.1,.1,.4,.4,.9,.2],calls=0;const opening=rollDice(initial(),()=>{calls++;return rolls.shift();});assert.equal(calls,6);assert.deepEqual(opening.rolled,[6,2]);assert.equal(opening.turn,'black');assert.deepEqual(opening.diceColors,['black','red']);s=initial();s.opening=false;s.turn='red';assert.deepEqual(rollDice(s,()=>.9).dice,[6,6,6,6]);assert.deepEqual(rollDice(s,()=>.9).diceColors,['red','red']);console.log('Passed: 1–4 distinct-checker batches, legal continuations, full-pair opening rerolls, and dice ownership.');

const {automaticAngle,nextRotation,rotationScale,rotationFrames}=await import('./dist/view.mjs');
s=initial();assert.equal(automaticAngle(s),90);s.opening=false;s.turn='black';assert.equal(automaticAngle(s),0);s.turn='red';assert.equal(automaticAngle(s),180);assert.equal(nextRotation(180,0),360);assert.equal(nextRotation(360,180),540);assert.equal(nextRotation(90,0),0);assert.equal(nextRotation(90,180),180);assert.equal(automaticAngle(s,'setup'),0);assert.equal(automaticAngle(s,'setup',true),180);
for(const [w,h]of [[374,600],[620,300],[1100,650]])for(const [from,to]of [[90,0],[90,180],[0,180],[180,360]])for(const frame of rotationFrames(from,to,w,h)){const angle=parseFloat(frame['--board-angle']),scale=Number(frame.transform.match(/scale\(([^)]+)\)/)[1]),rad=angle*Math.PI/180;assert((w*Math.abs(Math.cos(rad))+h*Math.abs(Math.sin(rad)))*scale<=w+.001);assert((h*Math.abs(Math.cos(rad))+w*Math.abs(Math.sin(rad)))*scale<=h+.001);}
console.log('Passed: opening/player orientation, successive half-turns, setup orientation, and unclipped animation frames in mobile/desktop layouts.');
for(const [from,to]of [[90,0],[90,180],[0,180],[180,360]])for(const f of rotationFrames(from,to,390,600)){assert.equal(parseFloat(f['--board-angle']),Number(f.transform.match(/rotate\(([^d]+)deg/)[1]));}
console.log('Passed: label counter-rotation angle stays synchronized with every board animation frame.');

const {placementOptions,destinationChoice}=await import('./dist/engine.mjs');
// Reproduce: double twos, select two from the six-point, click the four-point.
s=initial();s.dice=[2,2,2,2];const from=physical(6,'black'),to=physical(4,'black');
assert(batchOptions(s,from,2).some(p=>p.destinations.includes(to)&&!p.destinations.every(d=>d===to)));
let plan=destinationChoice(placementOptions(s,from,2),to);assert(plan);assert.equal(plan.moves.length,2);for(const m of plan.moves)s=apply(s,m);assert.equal(s.points[to].count,2);assert.equal(s.points[from].count,3);assert.deepEqual(s.dice,[2,2]);assert.equal(s.points[physical(2,'black')],null);
// The further destination may consume all four dice, but both checkers land there.
s=initial();s.dice=[2,2,2,2];plan=destinationChoice(placementOptions(s,from,2),physical(2,'black'));assert(plan);assert.equal(plan.moves.length,4);for(const m of plan.moves)s=apply(s,m);assert.equal(s.points[physical(2,'black')].count,2);assert.equal(s.points[to],null);
for(const count of [2,3,4]){s=initial();s.dice=[2,2,2,2];for(const p of placementOptions(s,from,count))assert(p.destinations.every(d=>d===p.destinations[0]));}
assert.equal(destinationChoice([{destinations:[3,1],moves:[]}],3),undefined);
console.log('Passed: doubles batches land together at the clicked point, preserve unused dice, and never choose a split plan.');
const {motionPaths}=await import('./dist/motion.mjs');s=initial();let paths=motionPaths(s,[{from:5,to:3,die:2},{from:5,to:3,die:2}]);assert.equal(paths.length,2);assert(paths.every(p=>p.to.location==='3'));paths=motionPaths(s,[{from:5,to:3,die:2},{from:3,to:1,die:2}]);assert.equal(paths.length,1);assert.equal(paths[0].from.location,'5');assert.equal(paths[0].to.location,'1');s=empty();put(s,8,'black',1);put(s,20,'red',1);paths=motionPaths(s,[{from:7,to:4,die:3}]);assert.equal(paths.length,2);assert(paths.some(p=>p.to.location==='bar:red'));console.log('Passed: straight-line motion tracking for grouped moves, multi-die final landings, and hit checkers.');

for(const to of [90,180]){const frames=rotationFrames(0,to,1000,590),middle=frames.slice(1,-1);assert.equal(middle[0]['--board-angle'],'0deg');assert.equal(middle.at(-1)['--board-angle'],`${to}deg`);assert.equal(new Set(middle.map(f=>f.transform.match(/scale\(([^)]+)\)/)[1])).size,1);assert.equal(frames[0]['--board-angle'],middle[0]['--board-angle']);assert.equal(frames.at(-1)['--board-angle'],middle.at(-1)['--board-angle']);}console.log('Passed: shrink first, constant scale throughout 90/180-degree rotation, expand only at final angle.');
const {departingState}=await import('./dist/motion.mjs');s=initial();paths=motionPaths(s,[{from:5,to:3,die:2},{from:5,to:3,die:2}]);const transit=departingState(s,paths);assert.equal(transit.points[5].count,3);assert.equal(transit.points[3],null);assert.equal(s.points[5].count,5);console.log('Passed: moving checkers leave the origin immediately, destination stays empty during transit, and saved source state is unchanged.');
s=initial();s.dice=[3,1];const splitPlans=placementOptions(s,physical(8,'black'),2);for(const to of [physical(5,'black'),physical(7,'black')]){const p=destinationChoice(splitPlans,to,true);assert(p);let next=structuredClone(s);for(const m of p.moves)next=apply(next,m);assert.equal(next.points[physical(5,'black')].count,1);assert.equal(next.points[physical(7,'black')].count,1);assert.equal(next.dice.length,0);}console.log('Passed: either split destination moves both checkers with unequal dice.');
s=empty();put(s,4,'black',2);s.off.black=13;s.dice=[4,4,4,4];const bearing=destinationChoice(placementOptions(s,physical(4,'black'),2),'off');assert(bearing);for(const m of bearing.moves)s=apply(s,m);assert.equal(s.off.black,15);assert.equal(s.winner,'black');s=empty();put(s,4,'black',1);put(s,8,'black',1);s.dice=[4];assert.equal(destinationChoice(placementOptions(s,physical(4,'black'),1),'off'),undefined);console.log('Passed: explicit legal grouped bear-off and victory; no bear-off control for ineligible positions.');
