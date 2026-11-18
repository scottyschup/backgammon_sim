(function initializeNhp(global) {
  const {
    apply,
    dtg,
    motionPaths,
    other,
    relative,
    sequences,
  } = global.BackgammonLab;

  // Initial tuning presets, not validated playing strengths. No opponent-roll search is used.
  const nhpProfiles = {
    beginner: {
      awareness: {
        cover: .55,
        delta: .2,
        departure: .6,
        individual: .45,
        sum: .35,
      },
      randomRate: .7,
      weights: {
        cover: .5,
        delta: .5,
        departure: -.6,
        exposure: 0,
        hit: .15,
        individual: .2,
        netDtg: 0,
        point: .25,
        sum: .2,
      },
    },
    intermediate: {
      awareness: {
        cover: .9,
        delta: .65,
        departure: .9,
        individual: .85,
        sum: .8,
      },
      randomRate: .25,
      weights: {
        cover: 2,
        delta: 2,
        departure: -2,
        exposure: -.2,
        hit: .5,
        individual: .5,
        netDtg: .2,
        point: 2,
        sum: .75,
      },
    },
  };

  function checkerDistance(location, color) {
    if (location.startsWith('bar:')) return 25;
    if (location.startsWith('off:')) return 0;

    return relative(Number(location), color);
  }

  function playFeatures(before, moves) {
    let after = before;
    for (const move of moves) after = apply(after, move);

    const color = before.turn;
    const enemy = other(color);
    const ownBefore = dtg(before, color);
    const ownAfter = dtg(after, color);
    const enemyBefore = dtg(before, enemy);
    const enemyAfter = dtg(after, enemy);
    const paths = motionPaths(before, moves).filter(path => path.from.color === color);
    const origins = new Set(paths.map(path => path.from.location));
    const difference = Math.abs(before.rolled[0] - before.rolled[1]);
    const sum = before.rolled.reduce((total, die) => total + die, 0);
    let cover = 0;
    let departure = 0;
    let point = 0;

    before.points.forEach((value, index) => {
      const final = after.points[index];
      const finalCount = final?.color === color ? final.count : 0;
      if (value?.color === color && value.count === 1 && finalCount >= 2) cover++;
      if (finalCount >= 2 && (value?.color !== color || value.count < 2)) point++;
      if (
        value?.color === color
        && value.count >= 2
        && finalCount === 1
        && origins.has(String(index))
      ) departure++;
    });

    const delta = difference > 0 && paths.some((first, index) => paths.slice(index + 1).some(second => (
      first.from.location !== second.from.location
      && first.to.location === second.to.location
      && !first.to.location.startsWith('off:')
      && Math.abs(checkerDistance(first.from.location, color)
        - checkerDistance(second.from.location, color)) === difference
    )));
    const sumConnection = paths.some(path => {
      const destination = before.points[Number(path.to.location)];

      return destination?.color === color
        && checkerDistance(path.from.location, color) - checkerDistance(path.to.location, color) === sum
      ;
    });
    const individual = paths.some(path => {
      const destination = before.points[Number(path.to.location)];
      const distance = checkerDistance(path.from.location, color) - checkerDistance(path.to.location, color);

      return destination?.color === color && before.rolled.includes(distance);
    });

    return {
      after,
      cover,
      delta: Number(delta),
      departure,
      exposure: ownAfter.variance - ownBefore.variance,
      hit: after.bar[enemy] - before.bar[enemy],
      individual: Number(individual),
      netDtg: ownBefore.value - ownAfter.value + enemyAfter.value - enemyBefore.value,
      point,
      sum: Number(sumConnection),
      win: after.winner === color,
    };
  }

  function legalCandidates(state) {
    const positions = new Map();
    for (const moves of sequences(state)) {
      const features = playFeatures(state, moves);
      const key = JSON.stringify([
        features.after.points,
        features.after.bar,
        features.after.off,
      ]);
      if (!positions.has(key)) positions.set(key, { features, moves });
    }

    return [...positions.values()];
  }

  function choosePlay(
    state,
    difficulty,
    random = Math.random,
  ) {
    const profile = nhpProfiles[difficulty];
    if (!profile) throw new Error(`Unknown NHP difficulty: ${difficulty}`);

    const candidates = legalCandidates(state);
    const wins = candidates.filter(candidate => candidate.features.win);
    const pool = wins.length ? wins : candidates;
    const phase = state.openingTurn ? 'opening' : 'regular';
    const noticed = Object.fromEntries(Object.entries(profile.awareness)
      .map(([feature, probability]) => [feature, random() < probability]));
    const randomChoice = random() < profile.randomRate;
    let selected;

    if (randomChoice || wins.length) {
      selected = pool[Math.min(pool.length - 1, Math.floor(random() * pool.length))];
    } else {
      let best = -Infinity;
      for (const candidate of pool) {
        let score = 0;
        for (const [feature, weight] of Object.entries(profile.weights)) {
          if (noticed[feature] === false) continue;

          const openingBonus = phase === 'opening' && feature === 'delta' ? 1.5 : 1;
          score += candidate.features[feature] * weight * openingBonus;
        }
        // A small judgment error breaks ties without pruning legal alternatives.
        score += random() * .25;
        if (score > best) {
          best = score;
          selected = candidate;
        }
      }
    }

    const reasons = [];
    if (selected.features.cover) reasons.push('covers a blot');
    if (selected.features.hit) reasons.push('hits an opponent');
    if (selected.features.delta && noticed.delta) reasons.push('converges checkers');
    if (selected.features.point) reasons.push('makes a protected point');

    return {
      ...selected,
      explanation: reasons.join(', ') || 'advances checkers',
      noticed,
      phase,
      randomChoice,
    };
  }

  // Extend the existing classic-script surface; all decision functions remain DOM-independent.
  Object.assign(global.BackgammonLab, {
    choosePlay,
    legalCandidates,
    nhpProfiles,
    playFeatures,
  });
})(globalThis);
