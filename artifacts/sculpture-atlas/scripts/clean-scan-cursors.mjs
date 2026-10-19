import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const source = resolve(root, 'public/artworks',
  process.argv.includes('--verify') ? 'digital-scan-retouched' : 'digital-scan-final');
const output = resolve(root, 'public/artworks/digital-scan-retouched');
const templateFile = resolve(root, 'public/artworks/digital-scan-clean/frame-20.jpg');
const width = 952;
const height = 534;
const box = { x: 544, y: 205, width: 26, height: 32 };
const decode = file => execFileSync('ffmpeg', [
  '-hide_banner', '-loglevel', 'error', '-i', file,
  '-f', 'rawvideo', '-pix_fmt', 'rgb24', 'pipe:1',
], { maxBuffer: width * height * 4 });
const template = decode(templateFile);
const samples = [];

// The captured pointer is neutral black/white; its surrounding scan is green.
// Match only the pointer's neutral pixels, not the changing sculpture texture.
for (let y = 0; y < box.height; y++) {
  for (let x = 0; x < box.width; x++) {
    const index = ((box.y + y) * width + box.x + x) * 3;
    const colors = [template[index], template[index + 1], template[index + 2]];
    const high = Math.max(...colors);
    const low = Math.min(...colors);
    if (high - low < 22 && (high < 45 || low > 185)) {
      samples.push({ x, y, light: colors.reduce((sum, value) => sum + value, 0) / 3 });
    }
  }
}

if (samples.length < 15) throw new Error('Cursor template is not sufficiently distinctive');
const write = process.argv.includes('--write');
if (write) mkdirSync(output, { recursive: true });
console.log(`Matching ${samples.length} neutral cursor pixels`);

for (let frame = 0; frame < 23; frame++) {
  const name = `frame-${String(frame).padStart(2, '0')}.jpg`;
  const input = resolve(source, name);
  const pixels = decode(input);
  let best = { score: Infinity, x: 0, y: 0 };
  for (let y = 120; y < height - box.height; y++) {
    for (let x = 350; x < 700; x++) {
      let error = 0;
      for (const sample of samples) {
        const index = ((y + sample.y) * width + x + sample.x) * 3;
        const r = pixels[index], g = pixels[index + 1], b = pixels[index + 2];
        error += Math.abs((r + g + b) / 3 - sample.light)
          + (Math.max(r, g, b) - Math.min(r, g, b)) * 0.4;
        if (error >= best.score * samples.length) break;
      }
      const score = error / samples.length;
      if (score < best.score) best = { score, x, y };
    }
  }
  const found = best.score < 40;
  console.log(`${name}: ${found ? 'CURSOR' : 'clean '} score=${best.score.toFixed(2)} x=${best.x} y=${best.y}`);
  if (!write) continue;
  const target = resolve(output, name);
  if (!found) {
    copyFileSync(input, target);
    continue;
  }
  execFileSync('ffmpeg', [
    '-hide_banner', '-loglevel', 'error', '-i', input,
    '-vf', `delogo=x=${best.x}:y=${best.y}:w=${box.width}:h=${box.height}`,
    '-frames:v', '1', '-q:v', '2', '-y', target,
  ]);
}
