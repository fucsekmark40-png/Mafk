# Kivel találkozunk? — Halloween IG story

An Instagram story at 1080×1920, built on the reference clip (`Andras1080.mp4`): liquid chrome silk in black, crimson and silver with a little teal, and grainy crimson serif type. Halloween is the twist: fog, a low ember glow, a crescent or full moon, and a faint spiderweb.

## Files

| | |
|---|---|
| `index.html` | Live preview. Switch variants, edit date and location, toggle the IG safe-zone overlay, export a PNG, record a 6 s WebM |
| `export/kivel-talalkozunk-{a,b,c}.png` | Stills at 1080×1920 |
| `export/kivel-talalkozunk-{a,b,c}-loop.mp4` | 6 s seamless loops, 30 fps, H.264 |
| `fonts/` | Merriweather Bold and Black, Space Mono (SIL OFL), bundled so the page renders offline |
| `tools/render.mjs` | Headless re-export of the PNGs and MP4s |

## Variants

- **A · Vörös selyem**: closest to the reference. Full-bleed liquid silk, a big stacked crimson headline (`KIVEL / TALÁL- / KOZUNK?`), a thin crescent moon, fog rolling in low, and a web in the lower-right corner. Animation: slow glow pulse, two short type flickers, drifting fog.
- **B · Strobe**: club minimal. Black negative space, one horizontal tear of chrome, and tall stretched chrome type with red/white strobe ghosting. Animation: a double strobe hit, then a single one.
- **C · Telihold**: a full moon made of the liquid chrome, a fog bank across it, and blurred crimson type underneath. Animation: breathing blur and ember glow.

## Date / location

The slot sits between the corner brackets above the bottom safe zone. You can change it three ways:
- type into the fields in `index.html`, then press **PNG letöltése**
- use URL params: `index.html?v=a&date=2026.%20OKT.%2031.%20·%2022:00&loc=AKVÁRIUM`
- turn the brackets off with the checkbox (or `&guides=0`)

The headline stays between y=250 and y=1580 on every variant, outside Instagram's top 250px and bottom 340px.

## Re-export

Requires Node, Playwright (Chromium) and ffmpeg:

```
node tools/render.mjs still a,b,c     # PNGs → export/
node tools/render.mjs anim a          # 6 s MP4 loop → export/
```
