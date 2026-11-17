import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

for (const file of ['engine', 'metrics', 'motion', 'view', 'dice']) {
  vm.runInThisContext(fs.readFileSync(`./scripts/${file}.js`, 'utf8'));
}

const {
  apply,
  batchOptions,
  destinationChoice,
  dtg,
  initial,
  movable,
  physical,
  rollDice,
  selectableCount,
  sequences,
  single,
  valid,
} = globalThis.BackgammonLab;
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

const {automaticAngle,nextRotation,rotationScale,rotationFrames}=globalThis.BackgammonLab;
s=initial();assert.equal(automaticAngle(s),90);s.opening=false;s.turn='black';assert.equal(automaticAngle(s),0);s.turn='red';assert.equal(automaticAngle(s),180);assert.equal(nextRotation(180,0),360);assert.equal(nextRotation(360,180),540);assert.equal(nextRotation(90,0),0);assert.equal(nextRotation(90,180),180);assert.equal(automaticAngle(s,'setup'),0);assert.equal(automaticAngle(s,'setup',true),180);
for(const [w,h]of [[374,600],[620,300],[1100,650]])for(const [from,to]of [[90,0],[90,180],[0,180],[180,360]])for(const frame of rotationFrames(from,to,w,h)){const angle=parseFloat(frame['--board-angle']),scale=Number(frame.transform.match(/scale\(([^)]+)\)/)[1]),rad=angle*Math.PI/180;assert((w*Math.abs(Math.cos(rad))+h*Math.abs(Math.sin(rad)))*scale<=w+.001);assert((h*Math.abs(Math.cos(rad))+w*Math.abs(Math.sin(rad)))*scale<=h+.001);}
console.log('Passed: opening/player orientation, successive half-turns, setup orientation, and unclipped animation frames in mobile/desktop layouts.');
for(const [from,to]of [[90,0],[90,180],[0,180],[180,360]])for(const f of rotationFrames(from,to,390,600)){assert.equal(parseFloat(f['--board-angle']),Number(f.transform.match(/rotate\(([^d]+)deg/)[1]));}
console.log('Passed: label counter-rotation angle stays synchronized with every board animation frame.');

const {placementOptions}=globalThis.BackgammonLab;
// Reproduce: double twos, select two from the six-point, click the four-point.
s=initial();s.dice=[2,2,2,2];const from=physical(6,'black'),to=physical(4,'black');
assert(batchOptions(s,from,2).some(p=>p.destinations.includes(to)&&!p.destinations.every(d=>d===to)));
let plan=destinationChoice(placementOptions(s,from,2),to);assert(plan);assert.equal(plan.moves.length,2);for(const m of plan.moves)s=apply(s,m);assert.equal(s.points[to].count,2);assert.equal(s.points[from].count,3);assert.deepEqual(s.dice,[2,2]);assert.equal(s.points[physical(2,'black')],null);
// The further destination may consume all four dice, but both checkers land there.
s=initial();s.dice=[2,2,2,2];plan=destinationChoice(placementOptions(s,from,2),physical(2,'black'));assert(plan);assert.equal(plan.moves.length,4);for(const m of plan.moves)s=apply(s,m);assert.equal(s.points[physical(2,'black')].count,2);assert.equal(s.points[to],null);
for(const count of [2,3,4]){s=initial();s.dice=[2,2,2,2];for(const p of placementOptions(s,from,count))assert(p.destinations.every(d=>d===p.destinations[0]));}
assert.equal(destinationChoice([{destinations:[3,1],moves:[]}],3),undefined);
console.log('Passed: doubles batches land together at the clicked point, preserve unused dice, and never choose a split plan.');
const {motionPaths}=globalThis.BackgammonLab;s=initial();let paths=motionPaths(s,[{from:5,to:3,die:2},{from:5,to:3,die:2}]);assert.equal(paths.length,2);assert(paths.every(p=>p.to.location==='3'));paths=motionPaths(s,[{from:5,to:3,die:2},{from:3,to:1,die:2}]);assert.equal(paths.length,1);assert.equal(paths[0].from.location,'5');assert.equal(paths[0].to.location,'1');s=empty();put(s,8,'black',1);put(s,20,'red',1);paths=motionPaths(s,[{from:7,to:4,die:3}]);assert.equal(paths.length,2);assert(paths.some(p=>p.to.location==='bar:red'));console.log('Passed: straight-line motion tracking for grouped moves, multi-die final landings, and hit checkers.');

for(const to of [90,180]){const frames=rotationFrames(0,to,1000,590),middle=frames.slice(1,-1);assert.equal(middle[0]['--board-angle'],'0deg');assert.equal(middle.at(-1)['--board-angle'],`${to}deg`);assert.equal(new Set(middle.map(f=>f.transform.match(/scale\(([^)]+)\)/)[1])).size,1);assert.equal(frames[0]['--board-angle'],middle[0]['--board-angle']);assert.equal(frames.at(-1)['--board-angle'],middle.at(-1)['--board-angle']);}console.log('Passed: shrink first, constant scale throughout 90/180-degree rotation, expand only at final angle.');
const {departingState}=globalThis.BackgammonLab;s=initial();paths=motionPaths(s,[{from:5,to:3,die:2},{from:5,to:3,die:2}]);const transit=departingState(s,paths);assert.equal(transit.points[5].count,3);assert.equal(transit.points[3],null);assert.equal(s.points[5].count,5);console.log('Passed: moving checkers leave the origin immediately, destination stays empty during transit, and saved source state is unchanged.');
s=initial();s.dice=[3,1];const splitPlans=placementOptions(s,physical(8,'black'),2);for(const to of [physical(5,'black'),physical(7,'black')]){const p=destinationChoice(splitPlans,to,true);assert(p);let next=structuredClone(s);for(const m of p.moves)next=apply(next,m);assert.equal(next.points[physical(5,'black')].count,1);assert.equal(next.points[physical(7,'black')].count,1);assert.equal(next.dice.length,0);}console.log('Passed: either split destination moves both checkers with unequal dice.');
s=empty();put(s,4,'black',2);s.off.black=13;s.dice=[4,4,4,4];const bearing=destinationChoice(placementOptions(s,physical(4,'black'),2),'off');assert(bearing);for(const m of bearing.moves)s=apply(s,m);assert.equal(s.off.black,15);assert.equal(s.winner,'black');s=empty();put(s,4,'black',1);put(s,8,'black',1);s.dice=[4];assert.equal(destinationChoice(placementOptions(s,physical(4,'black'),1),'off'),undefined);console.log('Passed: explicit legal grouped bear-off and victory; no bear-off control for ineligible positions.');

const { formatRollEstimates, rollEstimates } = globalThis.BackgammonLab;
assert.deepEqual(rollEstimates(168), {
  max: 56,
  avg: 24,
  min: 7,
});
assert.equal(formatRollEstimates(168), '56 / 24 / 7');
assert.equal(formatRollEstimates(0), '0 / 0 / 0');
assert.equal(formatRollEstimates(27), '9 / 3.86 / 1.13');
assert.equal(formatRollEstimates(375), '125 / 53.57 / 15.63');
console.log('Passed: roll estimate order, zero, fractional rounding, and large distances.');

assert.equal(formatRollEstimates(2.1), '0.7 / 0.3 / 0.09');
const { pipLayout } = globalThis.BackgammonLab;
for (let value = 1; value <= 6; value++) {
  const pips = pipLayout(value);
  assert.equal(pips.length, value);
  assert.equal(new Set(pips.map(pip => pip.join(','))).size, value);
  assert(pips.every(([x, y]) => x >= 8 && x <= 92 && y >= 8 && y <= 92));
}
console.log('Passed: compact metric precision and distinct, inset pips for all six die faces.');

// The shared physical bar is each color's own point 25, independent of whose turn it is.
for (const color of ['black', 'red']) {
  for (const count of [1, 2, 15]) {
    const position = initial();
    position.points.fill(null);
    position.bar[color] = count;
    position.off.black = 15;
    position.off.red = 15;
    position.off[color] -= count;
    assert(valid(position));
    assert.deepEqual(dtg(position, color), {
      raw: 25 * count,
      value: 25 * count,
      variance: 0,
    });
  }
  for (let die = 1; die <= 6; die++) {
    const position = initial();
    position.points.fill(null);
    position.bar[color] = 1;
    position.off.black = 15;
    position.off.red = 15;
    position.off[color] = 14;
    position.turn = color;
    position.dice = [die];
    const entry = single(position, die).find(move => move.from === 'bar');
    assert(entry);
    assert.equal(entry.to, physical(25 - die, color));
    const entered = apply(position, entry);
    assert(valid(entered));
    assert.equal(dtg(entered, color).raw, 25 - die);
  }
}
console.log('Passed: B25/R25 bar distance, multiple barred checkers, and every entry roll for both colors.');

const { endTurn } = globalThis.BackgammonLab;
let roundState = initial();
assert.equal(roundState.completedTurns, 0);
assert.equal(endTurn(roundState).completedTurns, 0);
roundState.opening = false;
roundState.rolled = [3, 1];
roundState.dice = [];
const firstCompleted = endTurn(roundState);
assert.equal(firstCompleted.completedTurns, 1);
assert.equal(roundState.completedTurns, 0);
assert.equal(Math.floor(firstCompleted.completedTurns / 2), 0);
assert.equal(endTurn(firstCompleted).completedTurns, 1);
firstCompleted.rolled = [6, 2];
const fullRound = endTurn(firstCompleted);
assert.equal(fullRound.completedTurns, 2);
assert.equal(Math.floor(fullRound.completedTurns / 2), 1);
assert.equal(JSON.parse(JSON.stringify(fullRound)).completedTurns, 2);
const playableTurn = initial();
playableTurn.rolled = [3, 1];
playableTurn.dice = [3, 1];
assert.equal(endTurn(playableTurn).completedTurns, 0);
const winningTurn = initial();
winningTurn.points.fill(null);
winningTurn.points[0] = { color: 'black', count: 1 };
winningTurn.off = { black: 14, red: 15 };
winningTurn.completedTurns = 1;
winningTurn.dice = [1];
winningTurn.rolled = [1, 2];
const won = apply(winningTurn, single(winningTurn, 1)[0]);
assert.equal(won.winner, 'black');
assert.equal(won.completedTurns, 2);
assert.equal(endTurn(won).completedTurns, 2);
console.log('Passed: complete rounds, immutable handoffs, no duplicate counts, saved progress, and final winning turn.');

// Blocked bar rolls can pass without consuming or losing a checker; an open entry cannot pass.
for (const color of ['black', 'red']) {
  const blocked = initial();
  const enemy = color === 'black' ? 'red' : 'black';
  blocked.points.fill(null);
  blocked.turn = color;
  blocked.opening = false;
  blocked.bar[color] = 1;
  blocked.off[color] = 14;
  blocked.off[enemy] = 11;
  put(blocked, 1, enemy, 2);
  put(blocked, 2, enemy, 2);
  blocked.rolled = [1, 2];
  blocked.dice = [1, 2];
  assert(valid(blocked));
  assert.equal(movable(blocked).length, 0);
  const passed = endTurn(blocked);
  assert.equal(passed.turn, enemy);
  assert.equal(passed.bar[color], 1);
  assert.equal(passed.completedTurns, 1);
  assert.deepEqual(passed.rolled, []);
  assert.deepEqual(blocked.rolled, [1, 2]);
  assert(valid(passed));
  blocked.points[physical(1, enemy)] = null;
  blocked.off[enemy] += 2;
  assert(movable(blocked).length > 0);
  assert.equal(endTurn(blocked).completedTurns, 0);
}
console.log('Passed: both colors can pass blocked bar rolls; available entries prevent passing.');
