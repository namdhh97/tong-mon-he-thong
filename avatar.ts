import { outfits, skinTones, type Character } from './character';

export function avatarCanvas(character: Character, size = 128) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(size / 100, size / 100);

  const ink = '#253c33';
  const skin = skinTones[character.skin];
  const [width, height, shoulder] = [[32, 30, 23], [25, 25, 17], [29, 39, 20], [43, 31, 27], [39, 33, 35]][character.build];
  const neck = 79 - height;
  const [rx, ry] = [[16, 16], [14, 18], [16, 15], [19, 15]][character.head];
  const y = neck - 11;

  function oval(x: number, y: number, rx: number, ry: number, color: string) {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }
  function box(x: number, y: number, w: number, h: number, radius: number, color: string) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, radius);
    ctx.fillStyle = color;
    ctx.fill();
  }
  function curve(x: number, y: number, middleX: number, middleY: number, endX: number, endY: number) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(middleX, middleY, endX, endY);
    ctx.stroke();
  }

  oval(50, 88, width * .68, 5, '#253c3333');
  box(50 - width / 3, 70, width / 3 - 2, 16, 4, '#344756');
  box(52, 70, width / 3 - 2, 16, 4, '#344756');
  if (character.hair === 3) box(50 - rx - 3, y - 12, (rx + 3) * 2, 35, 10, ink);
  box(50 - width / 2, neck, width, height, 8, '#' + outfits[character.outfit].toString(16).padStart(6, '0'));
  oval(50 - shoulder / 2, neck + 6, 5, 6, skin);
  oval(50 + shoulder / 2, neck + 6, 5, 6, skin);
  if (character.hair === 2) oval(55, y - ry + 1, 7, 7, ink);

  if (character.head === 2) box(50 - rx, y - ry, rx * 2, ry * 2, 7, skin);
  else oval(50, y, rx, ry, skin);

  if (character.hair !== 5) {
    ctx.beginPath();
    ctx.ellipse(50, y - 1, rx, ry, 0, Math.PI, Math.PI * 2);
    ctx.fillStyle = ink;
    ctx.fill();
  }
  if (character.hair === 1) {
    ctx.beginPath();
    ctx.moveTo(50 - rx, y - 2);
    ctx.lineTo(56, y - 9);
    ctx.lineTo(50 - rx + 4, y + 4);
    ctx.fill();
  }
  if (character.hair === 4) {
    for (const x of [37, 43, 50, 57, 63]) oval(x, y - 9 - (x === 50 ? 3 : 0), 6, 6, ink);
  }

  ctx.strokeStyle = ink;
  ctx.lineWidth = 1.7;
  ctx.lineCap = 'round';
  for (const x of [44, 56]) {
    if (character.face === 2 || (character.face === 3 && x === 44)) {
      curve(x - 2, y + 4, x, y, x + 2, y + 4);
    } else {
      oval(x, y + 3, 1.5, 1.8, ink);
    }
  }
  if (character.face === 5) {
    ctx.strokeRect(40, y, 8, 6);
    ctx.strokeRect(52, y, 8, 6);
    curve(48, y + 2, 50, y + 1, 52, y + 2);
  }
  if (character.face === 4) oval(50, y + 9, 2.2, 2.6, ink);
  else if (character.face === 1) curve(47, y + 9, 50, y + 9, 53, y + 9);
  else curve(46, y + 8, 50, y + 13, 54, y + 8);

  return canvas;
}
