# Kivel találkozunk? — Instagram story

Three Halloween-tinged variations based on the reference's red/black liquid-satin look. Each is 1080×1920, with the top 250px and bottom 340px kept free of text.

- **A — Vörös selyem**: closest to the reference. Red satin, white chrome flare, heavy red grainy serif.
- **B — Stroboszkóp**: black negative space, stretched chrome type, red ghosting, strobe double-flash.
- **C — Hold & köd**: eclipsed red moon, fog and a satin "lake", with sentence-case serif type.

## Files
- `index.html`: live preview. Open it in Chrome; the `fonts/` folder must sit next to it. It lets you switch variations, edit the date and location, toggle the safe-zone overlay, download a PNG and record the loop as WebM.
- `export/story-{a,b,c}.png`: stills with placeholder date and location.
- `export/story-{a,b,c}-clean.png`: the date/location spot left empty with only its corner marks, so you can type over it in Instagram.
- `export/story-{a,b,c}-loop.mp4`: 6-second seamless loops (H.264, 30 fps).

## Re-export
```
cd story && python3 -m http.server 8765 &
node tools/export.js          # or: node tools/export.js b
```
Pass `?date=...&place=...` in the URL to change the placeholder text in the exports.
