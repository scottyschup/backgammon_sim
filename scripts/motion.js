// Track distinct checkers through a complete selected play, including hits.
function motionPaths(state, moves, color = state.turn) {
  const slots = new Map(),
    origins = new Map();
  let serial = 0;
  const add = (location, c, count) => {
    const ids = [];
    for (let index = 0; index < count; index++) {
      const id = serial++;
      ids.push(id);
      origins.set(id, { location, color: c, index });
    }
    slots.set(`${location}:${c}`, ids);
  };
  for (let i = 0; i < 24; i++) {
    const v = state.points[i];
    if (v) add(String(i), v.color, v.count);
  }
  for (const c of ['black', 'red']) for (const loc of ['bar', 'off']) add(`${loc}:${c}`, c, state[loc][c]);
  const list = (location, c) => {
    const key = `${location}:${c}`;
    if (!slots.has(key)) slots.set(key, []);
    return slots.get(key);
  };
  const loc = (p, c) => (typeof p === 'number' ? String(p) : `${p}:${c}`);
  for (const m of moves) {
    const from = loc(m.from, color),
      to = loc(m.to, color),
      id = list(from, color).pop();
    if (id === undefined) throw Error('Missing moving checker');
    if (typeof m.to === 'number') {
      const enemy = color === 'black' ? 'red' : 'black',
        hit = list(to, enemy);
      if (hit.length === 1) list(`bar:${enemy}`, enemy).push(hit.pop());
    }
    list(to, color).push(id);
  }
  const paths = [];
  for (const [key, ids] of slots)
    for (let index = 0; index < ids.length; index++) {
      const origin = origins.get(ids[index]),
        location = key.slice(0, key.lastIndexOf(':'));
      if (origin.location !== location)
        paths.push({
          from: origin,
          to: { location, color: origin.color, index },
        });
    }
  return paths;
}

// Normalize by board size so the same visual move feels consistent on phones.
function movementDuration(distance, boardDiagonal) {
  return Math.round(Math.max(180, Math.min(1000, (1000 * distance) / (boardDiagonal * 0.7))));
}

function departingState(state, paths) {
  const n = structuredClone(state);
  for (const { from } of paths) {
    if (from.location.includes(':')) {
      const [where, color] = from.location.split(':');
      n[where][color]--;
    } else {
      const i = Number(from.location);
      if (--n.points[i].count === 0) n.points[i] = null;
    }
  }
  return n;
}

globalThis.BackgammonLab = {
  ...globalThis.BackgammonLab,
  departingState,
  motionPaths,
  movementDuration,
};
