// Renders PNG stills + 6 s looping MP4s for every variation.
// Usage: (from story/) python3 -m http.server 8765 &  then  node tools/export.js
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'export');
const BASE = 'http://127.0.0.1:8765/index.html?export=1';
const FPS = 30, LOOP = 6, STILL_T = 0.5;

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  page.on('pageerror', e => console.error('page error:', e.message));
  const grab = async () => Buffer.from((await page.evaluate(() => window.__frame())).split(',')[1], 'base64');

  for (const v of (process.argv[2] || 'a,b,c').split(',')) {
    await page.goto(`${BASE}&v=${v}`);
    await page.evaluate(() => window.__ready);

    await page.evaluate(t => window.__render(t, { clean: false }), STILL_T);
    fs.writeFileSync(path.join(OUT, `story-${v}.png`), await grab());
    await page.evaluate(t => window.__render(t, { clean: true }), STILL_T);
    fs.writeFileSync(path.join(OUT, `story-${v}-clean.png`), await grab());

    const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '17', '-preset', 'slow', '-movflags', '+faststart',
      path.join(OUT, `story-${v}-loop.mp4`)], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let i = 0; i < FPS * LOOP; i++) {
      await page.evaluate(t => window.__render(t, { clean: false }), i / FPS);
      if (!ff.stdin.write(await grab())) await new Promise(r => ff.stdin.once('drain', r));
    }
    ff.stdin.end();
    await new Promise(r => ff.on('close', r));
    console.log('done', v);
  }
  await browser.close();
})();
