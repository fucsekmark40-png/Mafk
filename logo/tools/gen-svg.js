// Builds the flat (outlined) logo SVGs from the fonts. Usage: node tools/gen-svg.js  (needs opentype.js)
const opentype = require('opentype.js');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const archivo = opentype.loadSync(path.join(ROOT, 'fonts/Archivo-ExpandedBlack.ttf'));
const unbounded = opentype.loadSync(path.join(ROOT, 'fonts/Unbounded-Black.ttf'));
const f2 = n => +n.toFixed(2);

// glyph paths for a line of text, each with its bbox, laid out with kerning + tracking
function line(font, text, size, tracking = 0) {
  const glyphs = font.stringToGlyphs(text), out = []; let x = 0;
  glyphs.forEach((g, i) => {
    const p = g.getPath(x, 0, size); const bb = p.getBoundingBox();
    if (text[i] !== ' ') out.push({ d: p.toPathData(2), bb, ch: text[i] });
    x += g.advanceWidth * size / font.unitsPerEm + tracking;
    if (i < glyphs.length - 1) x += font.getKerningValue(g, glyphs[i + 1]) * size / font.unitsPerEm;
  });
  const minX = Math.min(...out.map(o => o.bb.x1)), maxX = Math.max(...out.map(o => o.bb.x2));
  return { glyphs: out, width: maxX - minX, minX };
}
function svg(w, h, body, fill) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${f2(w)} ${f2(h)}" width="${Math.round(w)}" height="${Math.round(h)}"><g fill="${fill}">${body}</g></svg>\n`;
}

/* 1 — Wordmark: HOUSE in order, CHAOS falling apart, "OF" between two rules */
function wordmark() {
  const W = 2000, size = 400;
  const top = line(archivo, 'HOUSE', size, -8), bot = line(archivo, 'CHAOS', size, -8);
  const s1 = W / top.width, s2 = W / bot.width;
  const cap = 0.72 * size; // approx cap height of Archivo
  let body = `<g transform="translate(${f2(-top.minX * s1)} ${f2(cap * s1)}) scale(${f2(s1)})"><path d="${top.glyphs.map(g => g.d).join('')}"/></g>`;
  const ofY = cap * s1 + 70;
  const of = line(archivo, 'OF', 90, 6);
  const ofX = W / 2 - of.width / 2 - of.minX;
  body += `<g transform="translate(${f2(ofX)} ${f2(ofY + 65)})"><path d="${of.glyphs.map(g => g.d).join('')}"/></g>`;
  const ruleY = ofY + 32, gap = 40;
  body += `<rect x="0" y="${f2(ruleY)}" width="${f2(W / 2 - of.width / 2 - gap)}" height="12"/>`;
  body += `<rect x="${f2(W / 2 + of.width / 2 + gap)}" y="${f2(ruleY)}" width="${f2(W / 2 - of.width / 2 - gap)}" height="12"/>`;
  const y2 = ofY + 130 + cap * s2;
  // disorder grows letter by letter
  const rot = [0, -5, 9, -14, 21], dy = [0, 14, -24, 34, -30], dx = [0, 6, -4, 14, 10];
  bot.glyphs.forEach((g, i) => {
    const cx = (g.bb.x1 + g.bb.x2) / 2, cy = (g.bb.y1 + g.bb.y2) / 2;
    body += `<g transform="translate(${f2(-bot.minX * s2 + dx[i])} ${f2(y2 + dy[i])}) scale(${f2(s2)}) rotate(${rot[i]} ${f2(cx)} ${f2(cy)})"><path d="${g.d}"/></g>`;
  });
  const H = y2 + 60;
  return { w: W, h: H, body, pad: 140 };
}

/* 2 — Seal: chaos star inside a ring of text (works as a profile picture / vinyl stamp) */
function seal() {
  const S = 1200, c = S / 2, R = 520;
  let body = `<path fill-rule="evenodd" d="M${c - R} ${c}a${R} ${R} 0 1 0 ${2 * R} 0a${R} ${R} 0 1 0 ${-2 * R} 0Z M${c - R + 16} ${c}a${R - 16} ${R - 16} 0 1 0 ${2 * (R - 16)} 0a${R - 16} ${R - 16} 0 1 0 ${-2 * (R - 16)} 0Z"/>`;
  const rIn = 360;
  body += `<path fill-rule="evenodd" d="M${c - rIn} ${c}a${rIn} ${rIn} 0 1 0 ${2 * rIn} 0a${rIn} ${rIn} 0 1 0 ${-2 * rIn} 0Z M${c - rIn + 10} ${c}a${rIn - 10} ${rIn - 10} 0 1 0 ${2 * (rIn - 10)} 0a${rIn - 10} ${rIn - 10} 0 1 0 ${-2 * (rIn - 10)} 0Z"/>`;
  // ring text
  const text = 'HOUSE OF CHAOS • HOUSE OF CHAOS • ';
  const size = 92, rText = 410, glyphs = archivo.stringToGlyphs(text);
  const adv = glyphs.map(g => g.advanceWidth * size / archivo.unitsPerEm);
  const total = adv.reduce((a, b) => a + b, 0), k = (2 * Math.PI * rText) / total;
  let a = -Math.PI / 2;
  glyphs.forEach((g, i) => {
    const w = adv[i] * k, mid = a + (w / rText) / 2;
    if (text[i] !== ' ') {
      const p = g.getPath(-adv[i] / 2, 0, size).toPathData(2);
      const x = c + Math.cos(mid) * rText, y = c + Math.sin(mid) * rText;
      body += `<g transform="translate(${f2(x)} ${f2(y)}) rotate(${f2(mid * 180 / Math.PI + 90)}) translate(0 ${f2(size * 0.36)}) scale(${f2(k)} 1)"><path d="${p}"/></g>`;
    }
    a += w / rText;
  });
  // chaos star: 8 arrows, slightly uneven lengths
  const lens = [300, 262, 300, 262, 300, 262, 300, 262];
  for (let i = 0; i < 8; i++) {
    const ang = i * 45, L = lens[i], sw = 16, hw = 46, hl = 82;
    body += `<path transform="rotate(${ang} ${c} ${c})" d="M${c - sw / 2} ${c}V${c - L + hl}H${c - hw}L${c} ${c - L}L${c + hw} ${c - L + hl}H${c + sw / 2}V${c}Z"/>`;
  }
  body += `<circle cx="${c}" cy="${c}" r="58"/>`;
  return { w: S, h: S, body, pad: 0 };
}

/* 3 — Liquid: playful lowercase "chaos" (melted in the chrome render) with "house of" above */
function liquid() {
  const big = line(unbounded, 'chaos', 520, -26), small = line(unbounded, 'house of', 120, 4);
  const W = big.width, cap = 0.56 * 520; // x-height-ish of Unbounded lowercase
  const sY = 120;
  let body = `<g transform="translate(${f2(-small.minX + 12)} ${f2(sY)})"><path d="${small.glyphs.map(g => g.d).join('')}"/></g>`;
  const ys = [0, -8, 10, -4, 14];
  big.glyphs.forEach((g, i) => body += `<g transform="translate(${f2(-big.minX)} ${f2(sY + 70 + 0.72 * 520 + ys[i])})"><path d="${g.d}"/></g>`);
  return { w: W, h: sY + 70 + 0.72 * 520 + 60, body, pad: 120 };
}

for (const [name, fn] of Object.entries({ wordmark, seal, liquid })) {
  const { w, h, body, pad } = fn();
  const wrap = b => `<g transform="translate(${pad} ${pad})">${b}</g>`;
  for (const [suffix, col] of [['white', '#ffffff'], ['black', '#0a0a0a']])
    fs.writeFileSync(path.join(ROOT, 'svg', `${name}-${suffix}.svg`), svg(w + pad * 2, h + pad * 2, wrap(body), col));
  console.log(name, Math.round(w + pad * 2), 'x', Math.round(h + pad * 2));
}
