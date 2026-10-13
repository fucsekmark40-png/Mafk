// Renders PNG stills and MP4 loops from index.html via headless Chromium.
// usage: node render.mjs [still|anim] [a,b,c] [bgscale]
import { createRequire } from 'module';
const req = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = req('playwright')); } catch { ({ chromium } = req('/opt/node-tools/node_modules/playwright')); }
import { writeFileSync, mkdirSync, rmSync } from 'fs';
import { execFileSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..'), out = path.join(root, 'export');
const [mode='still', list='a,b,c', bgscale='1', frameArg='22'] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined, args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
page.on('console', m => console.log('[page]', m.text()));
page.on('pageerror', e => console.log('[err]', e.message));
await page.goto(`file://${root}/index.html?static=1&bgscale=${bgscale}`);
await page.waitForFunction(() => window.__ready === true, null, { timeout: 60000 });
const save = (file, dataUrl) => writeFileSync(file, Buffer.from(dataUrl.split(',')[1], 'base64'));
for (const v of list.split(',')) {
  if (mode === 'frame') {
    for (const f of frameArg.split(',').map(Number))
      save(path.join(out, `_test-${v}-${f}.png`), await page.evaluate(([v, f]) => window.renderFrame(v, f), [v, f]));
  } else if (mode === 'still') {
    const t0 = Date.now();
    save(path.join(out, `kivel-talalkozunk-${v}.png`), await page.evaluate(v => window.renderFrame(v, 22, 'still'), v));
    console.log(v, 'still', Date.now() - t0, 'ms');
  } else {
    const dir = path.join(out, `_frames_${v}`); rmSync(dir, { recursive: true, force: true }); mkdirSync(dir);
    for (let f = 0; f < 180; f++) {
      save(path.join(dir, `${String(f).padStart(4,'0')}.png`), await page.evaluate(([v, f]) => window.renderFrame(v, f), [v, f]));
      if (f % 30 === 0) console.log(v, 'frame', f);
    }
    execFileSync('ffmpeg', ['-v','error','-y','-framerate','30','-i',path.join(dir,'%04d.png'),
      '-c:v','libx264','-pix_fmt','yuv420p','-crf','17','-preset','slow','-movflags','+faststart',
      path.join(out, `kivel-talalkozunk-${v}-loop.mp4`)]);
    rmSync(dir, { recursive: true, force: true });
    console.log(v, 'mp4 done');
  }
}
await browser.close();
