const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

vm.runInThisContext(fs.readFileSync('./scripts/nhp.js', 'utf8'));
const {
  apply,
  choosePlay,
  dtg,
  endTurn,
  initial,
  legalCandidates,
  nhpProfiles,
  physical,
  playFeatures,
  rollDice,
  sequences,
  valid,
} = globalThis.BackgammonLab;

function seededRandom(seed) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;

    return seed / 4294967296;
  };
}

function position(checkers) {
  const state = initial();
  state.points.fill(null);
  state.off = { black: 15, red: 15 };
  state.opening = false;
  for (const [point, color, count] of checkers) {
    state.points[physical(point, color)] = { color, count };
    state.off[color] -= count;
  }

  return state;
}

const opening = initial();
opening.opening = false;
opening.openingTurn = true;
opening.rolled = [3, 1];
opening.dice = [3, 1];
const openingCandidates = legalCandidates(opening);
assert(openingCandidates.some(candidate => candidate.features.delta && candidate.features.after.points[4]?.count === 2));
assert.equal(choosePlay(opening, 'intermediate', () => .4).phase, 'opening');
const reply = structuredClone(opening);
reply.openingTurn = false;
assert.equal(choosePlay(reply, 'intermediate', () => .4).phase, 'regular');

const dynamic = position([
  [10, 'black', 1],
  [8, 'black', 1],
]);
dynamic.rolled = [3, 1];
dynamic.dice = [3, 1];
assert(legalCandidates(dynamic).some(candidate => candidate.features.delta && candidate.features.after.points[6]?.count === 2));

const connection = initial();
connection.rolled = [2, 3];
connection.dice = [2, 3];
assert(legalCandidates(connection).some(candidate => candidate.features.sum));
const individual = initial();
individual.rolled = [2, 5];
individual.dice = [2, 5];
assert(legalCandidates(individual).some(candidate => candidate.features.individual));

const cover = position([
  [8, 'black', 2],
  [5, 'black', 1],
]);
cover.rolled = [3, 1];
cover.dice = [3, 1];
const coverFeatures = playFeatures(cover, [
  { from: 7, to: 4, die: 3 },
  { from: 7, to: 6, die: 1 },
]);
assert.equal(coverFeatures.cover, 1);
assert.equal(coverFeatures.departure, 0);

const hit = position([
  [8, 'black', 1],
  [20, 'red', 1],
]);
hit.rolled = [3, 1];
hit.dice = [3, 1];
const hitFeatures = playFeatures(hit, [
  { from: 7, to: 4, die: 3 },
  { from: 4, to: 3, die: 1 },
]);
assert.equal(hitFeatures.hit, 1);
assert.equal(hitFeatures.after.bar.red, 1);
assert.equal(hitFeatures.netDtg, dtg(hit, 'black').value - dtg(hitFeatures.after, 'black').value
  + dtg(hitFeatures.after, 'red').value - dtg(hit, 'red').value);
assert(dtg(hitFeatures.after, 'black').variance > 0);

const win = position([[1, 'black', 1]]);
win.rolled = [1, 2];
win.dice = [1, 2];
for (const difficulty of ['beginner', 'intermediate']) {
  assert(choosePlay(win, difficulty, () => .99).features.win);
}

const snapshot = JSON.stringify(opening);
const first = choosePlay(opening, 'beginner', seededRandom(17));
const repeat = choosePlay(opening, 'beginner', seededRandom(17));
assert.deepEqual(first, repeat);
assert.equal(JSON.stringify(opening), snapshot);
assert(nhpProfiles.beginner.randomRate > nhpProfiles.intermediate.randomRate);
const outcomes = new Set(Array.from({ length: 30 }, (_, seed) =>
  JSON.stringify(choosePlay(opening, 'beginner', seededRandom(seed + 1)).moves)));
assert(outcomes.size > 1);

for (let a = 1; a <= 6; a++) {
  for (let b = 1; b <= 6; b++) {
    const state = initial();
    state.opening = false;
    state.rolled = [a, b];
    state.dice = a === b ? [a, a, a, a] : [a, b];
    const legal = new Set(sequences(state).map(moves => JSON.stringify(moves)));
    for (const difficulty of ['beginner', 'intermediate']) {
      const decision = choosePlay(state, difficulty, seededRandom(a * 6 + b));
      assert(legal.has(JSON.stringify(decision.moves)));
      assert(valid(decision.features.after));
    }
    const positions = legalCandidates(state).map(candidate => JSON.stringify([
      candidate.features.after.points,
      candidate.features.after.bar,
      candidate.features.after.off,
    ]));
    assert.equal(positions.length, new Set(positions).size);
  }
}

// Whole-game controller runs cover bar passes, hits, terminal moves, and handoffs without a UI.
for (let game = 0; game < 4; game++) {
  const random = seededRandom(711 + game);
  let state = initial();
  let turns = 0;
  while (!state.winner && turns++ < 2000) {
    state = rollDice(state, random);
    const difficulty = (turns + game) % 2 ? 'beginner' : 'intermediate';
    const decision = choosePlay(state, difficulty, random);
    for (const move of decision.moves) state = apply(state, move);
    assert(valid(state));
    assert(sequences(state).every(path => path.length === 0));
    if (!state.winner) state = endTurn(state);
  }
  assert(state.winner, `NHP game ${game} should finish`);
}

console.log('Passed: dynamic NHP features, opening/reply branches, seeded choices, all rolls, and four NHP games.');

for (const [roll, destination] of [
  [[3, 1], 5],
  [[4, 2], 4],
  [[5, 3], 3],
  [[6, 4], 2],
  [[6, 1], 7],
]) {
  const state = initial();
  state.rolled = roll;
  state.dice = [...roll];
  state.opening = false;
  state.openingTurn = true;
  assert(legalCandidates(state).some(candidate => candidate.features.delta
    && candidate.features.after.points[physical(destination, 'black')]?.count >= 2));
}
const openingRoll = rollDice(initial(), seededRandom(511));
assert.equal(openingRoll.openingTurn, true);
const completedOpening = { ...openingRoll, dice: [] };
assert.equal(endTurn(completedOpening).openingTurn, false);
assert.equal(rollDice(endTurn(completedOpening), seededRandom(19)).openingTurn, false);
console.log('Passed: all five confirmed opening convergence patterns and the opening/reply boundary.');
