// Renders chrome PNGs (transparent) and on-black previews. From logo/: python3 -m http.server 8766 &  then  node tools/export.js
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const OUT = path.join(__dirname, '..', 'export');
const SIZES = { wordmark: 3000, sliced: 3000, oneline: 3600, tower: 2400, monogram: 3000, seal: 2000, liquid: 3000 };
const [only, widthArg] = process.argv.slice(2);
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage();
  p.on('pageerror', e => console.error('page error:', e.message));
  await p.goto('http://127.0.0.1:8766/index.html?export=1');
  await p.evaluate(() => window.__ready);
  for (const fin of ['silver', 'blood']) for (const name of Object.keys(SIZES)) {
    if (only && !only.split(',').includes(name)) continue;
    const url = await p.evaluate(([n, w, f]) => window.__render(n, w, f), [name, +(widthArg || SIZES[name]), fin]);
    const file = path.join(OUT, `house-of-chaos-${name}-${fin}.png`);
    fs.writeFileSync(file, Buffer.from(url.split(',')[1], 'base64'));
    console.log(file);
  }
  await b.close();
})();
