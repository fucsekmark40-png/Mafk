# House of Chaos — logo concepts

1. **Wordmark**: HOUSE / OF / CHAOS stacked in Archivo Expanded Black. HOUSE stays in line and CHAOS falls apart letter by letter.
2. **Seal**: a ring of text around an eight-arrow chaos star. Use it for the profile picture, vinyl centre label, wristbands or stamps.
- **1X Extra**: the first wordmark turned all the way up, with a wilder tumble, scale jumps, a dark 3D extrusion, a Y2K double chrome outline and glints. The effects are added in the chrome render; the flat SVG is the tumbled letters only.
- **1B Sliced**: the same stacked block, with CHAOS cut into horizontal strips that slide sideways like a glitch.
- **1C One line**: HOUSE ✷ CHAOS, with a chaos star replacing "OF". For banners, headers and flyer footers.
- **1D Tower**: tall condensed Anton stack, with a vertical "OF" and CHAOS tumbling. Poster and story use.
- **1E Monogram**: H✷C with the full name underneath. For the profile picture, stamps and chest prints.
3. **Liquid**: melted chrome "chaos" with drips, plus "house of" in Unbounded Black.

## Files
- `svg/*-white.svg`, `svg/*-black.svg`: flat vector versions with the text outlined (no fonts needed). Use them for print, merch, embroidery and one-colour use.
- `export/house-of-chaos-*-silver.png`, `export/house-of-chaos-*-blood.png`: chrome renders on a transparent background, 3000px wide (seal 2000px).
- `export/house-of-chaos-profile-1080.png`, `export/house-of-chaos-profile-red-1080.png`: the seal on black, ready for an Instagram profile picture.
- `export/wordmark-options.jpg`: all wordmark options side by side.
- `index.html`: preview page. Serve the folder (`python3 -m http.server`) and open it in Chrome to switch finishes and download files.

## Rebuild
```
node tools/gen-svg.js                                   # needs opentype.js
python3 -m http.server 8766 & node tools/export.js      # chrome PNGs (Playwright)
```
