const svgNamespace = 'http://www.w3.org/2000/svg';

export function pipLayout(value) {
  const pips = [];
  if (value % 2 === 1) pips.push([50, 50]);
  if (value >= 2) pips.push([26, 26], [74, 74]);
  if (value >= 4) pips.push([74, 26], [26, 74]);
  if (value === 6) pips.push([26, 50], [74, 50]);
  return pips;
}

export function createDie(value, color, used = false) {
  const die = document.createElement('span');
  die.className = `die ${color}${used ? ' used' : ''}`;
  die.setAttribute('role', 'img');
  die.setAttribute('aria-label', `${color} ${value}${used ? ', used' : ''}`);
  const face = document.createElementNS(svgNamespace, 'svg');
  face.setAttribute('viewBox', '0 0 100 100');
  face.setAttribute('aria-hidden', 'true');
  for (const [x, y] of pipLayout(value)) {
    const pip = document.createElementNS(svgNamespace, 'circle');
    pip.setAttribute('cx', x);
    pip.setAttribute('cy', y);
    pip.setAttribute('r', '8');
    pip.setAttribute('fill', 'currentColor');
    face.append(pip);
  }
  die.append(face);
  return die;
}

export async function animateDice(container, colors) {
  // Cosmetic faces never consume the game's random source or alter the saved position.
  const dice = colors.map((color, index) => createDie(index === 0 ? 5 : 6, color));
  container.replaceChildren(...dice);
  const frames = [
    { transform: 'perspective(100px) rotateX(0deg) rotateY(0deg) rotateZ(0deg)' },
    { transform: 'perspective(100px) rotateX(180deg) rotateY(140deg) rotateZ(12deg)' },
    { transform: 'perspective(100px) rotateX(360deg) rotateY(280deg) rotateZ(-12deg)' },
    { transform: 'perspective(100px) rotateX(540deg) rotateY(420deg) rotateZ(12deg)' },
    { transform: 'perspective(100px) rotateX(720deg) rotateY(720deg) rotateZ(0deg)' },
  ];
  await Promise.all(dice.map((die, index) => die.animate(frames, {
    direction: index === 0 ? 'normal' : 'reverse',
    duration: 1000,
    easing: 'ease-out',
  }).finished.catch(() => {})));
}
