// Builds the flat (outlined) logo SVGs from the fonts. Usage: node tools/gen-svg.js  (needs opentype.js)
const opentype = require('opentype.js');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const archivo = opentype.loadSync(path.join(ROOT, 'fonts/Archivo-ExpandedBlack.ttf'));
const unbounded = opentype.loadSync(path.join(ROOT, 'fonts/Unbounded-Black.ttf'));
const anton = opentype.loadSync(path.join(ROOT, 'fonts/Anton-Regular.ttf'));
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
function wordmark(o = {}) {
  const W = 2000, size = 400;
  const top = line(archivo, 'HOUSE', size, -8), bot = line(archivo, 'CHAOS', size, -8);
  const s1 = W / top.width, s2 = W / bot.width;
  const cap = 0.72 * size; // approx cap height of Archivo
  let body = `<g transform="translate(${f2(-top.minX * s1)} ${f2(cap * s1)}) scale(${f2(s1)})"><path d="${top.glyphs.map(g => g.d).join('')}"/></g>`;
  const ofS = o.ofSize || 90, kk = ofS / 90;
  const ofY = cap * s1 + 70 + (o.gapTop || 0);
  const of = line(archivo, 'OF', ofS, 6);
  const ofX = W / 2 - of.width / 2 - of.minX;
  body += `<g transform="translate(${f2(ofX)} ${f2(ofY + 65 * kk)})"><path d="${of.glyphs.map(g => g.d).join('')}"/></g>`;
  const ruleY = ofY + 32 * kk - 6 * (kk - 1), gap = 40 * kk;
  body += `<rect x="0" y="${f2(ruleY)}" width="${f2(W / 2 - of.width / 2 - gap)}" height="12"/>`;
  body += `<rect x="${f2(W / 2 + of.width / 2 + gap)}" y="${f2(ruleY)}" width="${f2(W / 2 - of.width / 2 - gap)}" height="12"/>`;
  const y2 = ofY + 130 * kk + (o.gapBot || 0) + cap * s2;
  // disorder grows letter by letter
  const rot = o.rot || [0, -5, 9, -14, 21], dy = o.dy || [0, 14, -24, 34, -30], dx = o.dx || [0, 6, -4, 14, 10], sc = o.sc || [1, 1, 1, 1, 1];
  bot.glyphs.forEach((g, i) => {
    const cx = (g.bb.x1 + g.bb.x2) / 2, cy = (g.bb.y1 + g.bb.y2) / 2;
    body += `<g transform="translate(${f2(-bot.minX * s2 + dx[i])} ${f2(y2 + dy[i])}) scale(${f2(s2)}) rotate(${rot[i]} ${f2(cx)} ${f2(cy)}) translate(${f2(cx)} ${f2(cy)}) scale(${sc[i]}) translate(${f2(-cx)} ${f2(-cy)})"><path d="${g.d}"/></g>`;
  });
  const H = y2 + 60 + (o.extraH || 0);
  return { w: W, h: H, body, pad: o.pad || 140 };
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


/* shared: eight-arrow chaos star centred on (cx, cy), radius R */
function star(cx, cy, R, uneven = true, wt = 1) {
  const k = R / 300; let b = '';
  for (let i = 0; i < 8; i++) {
    const L = (uneven && i % 2 ? 262 : 300) * k, sw = 18 * k * wt, hw = 50 * k * Math.sqrt(wt), hl = 88 * k * Math.sqrt(wt);
    b += `<path transform="rotate(${i * 45} ${f2(cx)} ${f2(cy)})" d="M${f2(cx - sw / 2)} ${f2(cy)}V${f2(cy - L + hl)}H${f2(cx - hw)}L${f2(cx)} ${f2(cy - L)}L${f2(cx + hw)} ${f2(cy - L + hl)}H${f2(cx + sw / 2)}V${f2(cy)}Z"/>`;
  }
  return b + `<circle cx="${f2(cx)}" cy="${f2(cy)}" r="${f2(62 * k * wt)}"/>`;
}
const pathOf = l => l.glyphs.map(g => g.d).join('');

/* 1B — Sliced: the stacked wordmark, CHAOS cut into strips that slide sideways */
function sliced() {
  const W = 2000, size = 400, cap = 0.72 * size;
  const top = line(archivo, 'HOUSE', size, -8), bot = line(archivo, 'CHAOS', size, -8);
  const s1 = W / top.width, s2 = W / bot.width;
  let body = `<g transform="translate(${f2(-top.minX * s1)} ${f2(cap * s1)}) scale(${f2(s1)})"><path d="${pathOf(top)}"/></g>`;
  const ofY = cap * s1 + 70, of = line(archivo, 'OF', 90, 6), gap = 40;
  body += `<g transform="translate(${f2(W / 2 - of.width / 2 - of.minX)} ${f2(ofY + 65)})"><path d="${pathOf(of)}"/></g>`;
  body += `<rect x="0" y="${f2(ofY + 32)}" width="${f2(W / 2 - of.width / 2 - gap)}" height="12"/><rect x="${f2(W / 2 + of.width / 2 + gap)}" y="${f2(ofY + 32)}" width="${f2(W / 2 - of.width / 2 - gap)}" height="12"/>`;
  const y0 = ofY + 130, hgt = cap * s2, y2 = y0 + hgt;
  const shifts = [0, 30, -42, 60, -20], n = shifts.length, gapPx = 0;
  let defs = '';
  for (let i = 0; i < n; i++) {
    const a = y0 + hgt * i / n, b = y0 + hgt * (i + 1) / n - (i < n - 1 ? gapPx : 0);
    defs += `<clipPath id="sl${i}"><rect x="-400" y="${f2(a)}" width="${W + 800}" height="${f2(b - a)}"/></clipPath>`;
    body += `<g clip-path="url(#sl${i})"><g transform="translate(${shifts[i]} 0)"><g transform="translate(${f2(-bot.minX * s2)} ${f2(y2)}) scale(${f2(s2)})"><path d="${pathOf(bot)}"/></g></g></g>`;
  }
  return { w: W, h: y2 + 30, body: `<defs>${defs}</defs>` + body, pad: 160 };
}

/* 1C — One line: HOUSE ✷ CHAOS, the star replaces "OF" */
function oneline() {
  const size = 300, cap = 0.72 * size;
  const a = line(archivo, 'HOUSE', size, -6), b = line(archivo, 'CHAOS', size, -6);
  const sr = cap * .7, gap = cap * .3;
  let x = -a.minX, body = `<g transform="translate(${f2(x)} ${f2(cap)})"><path d="${pathOf(a)}"/></g>`;
  const sx = a.width + gap + sr;
  body += `<g transform="rotate(12 ${f2(sx)} ${f2(cap / 2)})">${star(sx, cap / 2, sr, true, 2.2)}</g>`;
  const bx = sx + sr + gap - b.minX, rot = [0, -3, 5, -8, 12], dy = [0, 6, -10, 14, -18];
  b.glyphs.forEach((g, i) => {
    const cx = (g.bb.x1 + g.bb.x2) / 2, cy = (g.bb.y1 + g.bb.y2) / 2;
    body += `<g transform="translate(${f2(bx)} ${f2(cap + dy[i])}) rotate(${rot[i]} ${f2(cx)} ${f2(cy)})"><path d="${g.d}"/></g>`;
  });
  return { w: bx + b.minX + b.width + 20, h: cap + 40, body, pad: 120 };
}

/* 1D — Tower: tall condensed stack, "OF" running vertically, CHAOS tumbling */
function tower() {
  const size = 700, cap = 0.86 * size;
  const a = line(anton, 'HOUSE', size, 4), b = line(anton, 'CHAOS', size, 4);
  const W = 1500, s1 = W / a.width, s2 = W / b.width;
  let body = `<g transform="translate(${f2(-a.minX * s1)} ${f2(cap * s1)}) scale(${f2(s1)})"><path d="${pathOf(a)}"/></g>`;
  const y2 = cap * s1 + 40 + cap * s2, rot = [0, 3, -6, 9, -13], dy = [0, -8, 14, -20, 30];
  b.glyphs.forEach((g, i) => {
    const cx = (g.bb.x1 + g.bb.x2) / 2, cy = (g.bb.y1 + g.bb.y2) / 2;
    body += `<g transform="translate(${f2(-b.minX * s2)} ${f2(y2 + dy[i])}) scale(${f2(s2)}) rotate(${rot[i]} ${f2(cx)} ${f2(cy)})"><path d="${g.d}"/></g>`;
  });
  const of = line(archivo, 'OF', 120, 10), ox = W + 70;
  body += `<g transform="translate(${f2(ox)} ${f2(y2 / 2)}) rotate(90) translate(${f2(-of.width / 2 - of.minX)} ${f2(0.36 * 120)})"><path d="${pathOf(of)}"/></g>`;
  body += `<rect x="${f2(ox - 6)}" y="0" width="12" height="${f2(y2 / 2 - of.width / 2 - 40)}"/><rect x="${f2(ox - 6)}" y="${f2(y2 / 2 + of.width / 2 + 40)}" width="12" height="${f2(y2 / 2 - of.width / 2 - 40)}"/>`;
  return { w: ox + 60, h: y2 + 40, body, pad: 140 };
}

/* 1E — Monogram: H ✷ C with the full name underneath */
function monogram() {
  const size = 700, cap = 0.72 * size;
  const h = line(archivo, 'H', size), c = line(archivo, 'C', size);
  const sr = cap * .56, gap = cap * .1;
  let body = `<g transform="translate(${f2(-h.minX)} ${f2(cap)})"><path d="${pathOf(h)}"/></g>`;
  const sx = h.width + gap + sr;
  const rr = sr + 4;
  body += `<path fill-rule="evenodd" d="M${f2(sx - rr)} ${f2(cap / 2)}a${f2(rr)} ${f2(rr)} 0 1 0 ${f2(2 * rr)} 0a${f2(rr)} ${f2(rr)} 0 1 0 ${f2(-2 * rr)} 0Z M${f2(sx - rr + 26)} ${f2(cap / 2)}a${f2(rr - 26)} ${f2(rr - 26)} 0 1 0 ${f2(2 * (rr - 26))} 0a${f2(rr - 26)} ${f2(rr - 26)} 0 1 0 ${f2(-2 * (rr - 26))} 0Z"/>`;
  body += star(sx, cap / 2, sr - 52);
  const cx0 = sx + sr + gap - c.minX;
  body += `<g transform="translate(${f2(cx0)} ${f2(cap)})"><path d="${pathOf(c)}"/></g>`;
  const W = cx0 + c.minX + c.width;
  const name = line(archivo, 'HOUSE OF CHAOS', 100, 34), ns = W / name.width;
  body += `<g transform="translate(${f2(-name.minX * ns)} ${f2(cap + 90 + 72 * ns)}) scale(${f2(ns)})"><path d="${pathOf(name)}"/></g>`;
  return { w: W, h: cap + 90 + 72 * ns + 20, body, pad: 140 };
}

/* 1X — Extra: the wordmark turned up. Wilder tumble, scale jumps; the render adds extrusion, outline and glints */
const extra = () => wordmark({ rot: [-3, 8, -15, 22, -32], dy: [-6, 34, -4, 60, 4], dx: [-10, 0, 6, 26, 40], sc: [1, 1.06, .95, 1.1, 1.16], extraH: 60, pad: 260, ofSize: 130, gapTop: 40, gapBot: 70 });

for (const [name, fn] of Object.entries({ wordmark, seal, liquid, sliced, oneline, tower, monogram, extra })) {
  const { w, h, body, pad } = fn();
  const wrap = b => `<g transform="translate(${pad} ${pad})">${b}</g>`;
  for (const [suffix, col] of [['white', '#ffffff'], ['black', '#0a0a0a']])
    fs.writeFileSync(path.join(ROOT, 'svg', `${name}-${suffix}.svg`), svg(w + pad * 2, h + pad * 2, wrap(body), col));
  console.log(name, Math.round(w + pad * 2), 'x', Math.round(h + pad * 2));
}
