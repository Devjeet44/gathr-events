/* Generates the SVG artwork in /images from the events list.
   Run:  node tools/generate-images.js
   (Original, self-contained artwork so the site works offline.) */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const src = fs.readFileSync(path.join(__dirname, '../js/events.js'), 'utf8');
const ctx = {};
vm.createContext(ctx);
vm.runInContext(src + '\nthis.EVENTS = EVENTS;', ctx);

const PALETTES = {
  Tech:     ['#4F46E5', '#06B6D4'],
  Music:    ['#DB2777', '#F59E0B'],
  Business: ['#0F766E', '#3B82F6'],
  Art:      ['#9333EA', '#F43F5E'],
  Sports:   ['#EA580C', '#FACC15'],
  Food:     ['#DC2626', '#F97316'],
  Workshop: ['#2563EB', '#10B981']
};

// tiny seeded RNG so every event gets stable, unique artwork
function rng(seed) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) { h = Math.imul(h ^ seed.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
  return () => { h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); h ^= h >>> 16; return (h >>> 0) / 4294967296; };
}

const motifs = {
  Tech(r) {
    let s = '';
    for (let y = 0; y < 8; y++) for (let x = 0; x < 14; x++)
      s += `<circle cx="${60 + x * 52}" cy="${50 + y * 52}" r="${r() > 0.8 ? 4.5 : 2}" fill="#fff" opacity="${0.15 + r() * 0.35}"/>`;
    s += `<text x="400" y="300" text-anchor="middle" font-family="monospace" font-size="170" font-weight="700" fill="#fff" opacity=".92">&lt;/&gt;</text>`;
    return s;
  },
  Music(r) {
    let s = '';
    for (let i = 0; i < 5; i++) s += `<circle cx="400" cy="450" r="${90 + i * 70}" fill="none" stroke="#fff" stroke-width="3" opacity="${0.5 - i * 0.07}"/>`;
    for (let i = 0; i < 22; i++) { const h = 40 + r() * 190; s += `<rect x="${110 + i * 28}" y="${330 - h}" width="14" height="${h}" rx="7" fill="#fff" opacity=".85"/>`; }
    return s;
  },
  Business(r) {
    let s = '';
    for (let i = 0; i < 8; i++) { const h = 50 + i * 28 + r() * 30; s += `<rect x="${110 + i * 75}" y="${420 - h}" width="48" height="${h}" rx="8" fill="#fff" opacity="${0.35 + i * 0.07}"/>`; }
    s += `<polyline points="134,330 209,300 284,305 359,240 434,215 509,170 584,140 659,95" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`;
    s += `<circle cx="659" cy="95" r="14" fill="#fff"/>`;
    return s;
  },
  Art(r) {
    let s = '';
    for (let i = 0; i < 7; i++) s += `<circle cx="${120 + r() * 560}" cy="${60 + r() * 380}" r="${50 + r() * 110}" fill="#fff" opacity="${0.12 + r() * 0.2}"/>`;
    s += `<path d="M120 330 C 260 120, 360 460, 500 240 S 680 150, 700 260" fill="none" stroke="#fff" stroke-width="14" stroke-linecap="round" opacity=".9"/>`;
    return s;
  },
  Sports(r) {
    let s = '';
    for (let i = 0; i < 12; i++) s += `<rect x="${-100 + i * 90}" y="-40" width="34" height="620" fill="#fff" opacity=".1" transform="rotate(24 400 250)"/>`;
    s += `<circle cx="400" cy="250" r="120" fill="none" stroke="#fff" stroke-width="14"/>`;
    s += `<path d="M300 300 L360 230 L420 290 L500 190" fill="none" stroke="#fff" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>`;
    return s;
  },
  Food(r) {
    let s = '';
    for (let i = 0; i < 4; i++) s += `<circle cx="400" cy="250" r="${150 - i * 32}" fill="${i % 2 ? '#fff' : 'none'}" ${i % 2 ? 'opacity=".25"' : ''} stroke="#fff" stroke-width="${i % 2 ? 0 : 8}"/>`;
    for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; s += `<circle cx="${400 + Math.cos(a) * 205}" cy="${250 + Math.sin(a) * 205}" r="${6 + r() * 8}" fill="#fff" opacity=".7"/>`; }
    s += `<path d="M345 235 q55 -60 110 0" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round"/>`;
    return s;
  },
  Workshop(r) {
    let s = '';
    for (let i = 0; i < 6; i++) {
      const x = 130 + i * 110, y = 110 + (i % 2) * 200, sz = 46 + r() * 26;
      s += `<polygon points="${x},${y - sz} ${x + sz},${y + sz * 0.7} ${x - sz},${y + sz * 0.7}" fill="#fff" opacity="${0.2 + r() * 0.3}"/>`;
    }
    s += `<rect x="270" y="170" width="260" height="170" rx="18" fill="none" stroke="#fff" stroke-width="10"/>`;
    s += `<line x1="270" y1="225" x2="530" y2="225" stroke="#fff" stroke-width="8"/>`;
    s += `<rect x="300" y="250" width="90" height="60" rx="8" fill="#fff" opacity=".85"/><rect x="410" y="250" width="90" height="26" rx="8" fill="#fff" opacity=".6"/>`;
    return s;
  }
};

for (const ev of ctx.EVENTS) {
  const [c1, c2] = PALETTES[ev.category];
  const r = rng(ev.id);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${ev.title}">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>
<rect width="800" height="500" fill="url(#g)"/>
${motifs[ev.category](r)}
</svg>
`;
  fs.writeFileSync(path.join(__dirname, '..', ev.image), svg);
}
console.log(`Generated ${ctx.EVENTS.length} images.`);
