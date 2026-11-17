// Distance estimates use the requested seven-pip average assumption.
// Blocks, hits, and bearing-off waste prevent these from bounding actual turns.
export function rollEstimates(distance) {
  return {
    max: distance / 3,
    avg: distance / 7,
    min: distance / 24,
  };
}

export function formatRollEstimates(distance) {
  return Object.values(rollEstimates(distance))
    .map(value => String(Number(value.toFixed(2))))
    .join(' / ');
}
