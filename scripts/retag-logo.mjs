/**
 * Rewrites the tagline inside the brand lockup PNGs: "MARKETING AGENCY" becomes
 * "MARKETING CONSULTANCY".
 *
 *   node scripts/retag-logo.mjs
 *
 * The wording is baked into client-supplied artwork, not set as text, so this is
 * an image edit: erase the tagline band and redraw it. The mark and the
 * "PINK TREE MEDIA" wordmark above are never touched — only rows BAND.y0..y1 are
 * cleared, so the artwork that matters survives byte-for-byte.
 *
 * Originals are kept in media-src/brand/ and are the input, so running this
 * twice does not compound: it always redraws from the untouched source.
 *
 * Type is rendered at 8x and downsampled. The tagline is 9px tall — drawing it
 * directly at 9px gives the hinter nothing to work with and the result is a row
 * of grey mush; supersampling then resampling reproduces the soft antialiasing
 * the surrounding artwork already has.
 */
import sharp from "sharp";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "media-src", "brand");
const OUT = join(ROOT, "public", "brand");

const TEXT = "MARKETING CONSULTANCY";
const FONT = "Avenir Next";
const SS = 8;

// Measured off the original artwork, not guessed — see the band analysis in
// media-src/brand. Clearing a couple of rows beyond the ink removes the
// antialiasing fringe that would otherwise survive as a grey ghost.
const BAND = { y0: 78, y1: 93 };
const CAP = 9; // tagline cap height in px
const INK_TOP = 81; // first row of tagline ink in the original
// The mark centres on x 206.5 and the wordmark on x 206; the original tagline
// sits at 201.5 only because text-anchor:middle with trailing letter-spacing
// pulls it left. Centring the measured ink box on the wordmark fixes that.
const CENTRE = 206;

const TARGETS = [
  { file: "logo.png", fill: "#8c8c8c" },
  { file: "logo-light.png", fill: "#f5f2ed" },
];

const svg = (size, tracking, fill) =>
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="6000" height="500">
       <text x="3000" y="380" font-family="${FONT}" font-size="${size}"
             font-weight="500" letter-spacing="${tracking}" fill="${fill}"
             text-anchor="middle">${TEXT}</text>
     </svg>`,
  );

async function inkBox(buf) {
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let minX = 1e9, maxX = -1, minY = 1e9, maxY = -1;
  for (let y = 0; y < info.height; y++)
    for (let x = 0; x < info.width; x++) {
      if (data[(y * info.width + x) * info.channels + 3] > 60) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  return { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

/** Render TEXT at exactly `cap * SS` tall, with tracking proportional to the
 *  original's (so the new, longer line keeps the same letter rhythm). */
async function renderTagline(fill) {
  const target = CAP * SS;
  const probe = await inkBox(await sharp(svg(100, 0, fill)).png().toBuffer());
  const size = (100 * target) / probe.height;
  // 0.074em matches the original's tracking: 7.1px at size 96 in the fitted
  // comparison. Expressed per-em so it rides any future cap-height change.
  const tracking = size * 0.074;
  const buf = await sharp(svg(size, tracking, fill)).png().toBuffer();
  const box = await inkBox(buf);
  return sharp(buf).extract(box).resize({ height: CAP, kernel: "lanczos3" }).png().toBuffer();
}

for (const { file, fill } of TARGETS) {
  // Erase the old tagline by zeroing alpha across the band, in raw pixels.
  // Compositing cannot do this: 'over' with a transparent tile is a no-op, and
  // 'dest-out' subtracts using the SOURCE alpha, so a fully transparent tile
  // removes nothing. Both leave the old words underneath and the new line lands
  // on top of them.
  const { data, info } = await sharp(join(SRC, file))
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let y = BAND.y0; y <= BAND.y1; y++)
    for (let x = 0; x < info.width; x++) data[(y * info.width + x) * info.channels + 3] = 0;

  const cleared = await sharp(data, {
    raw: { width: info.width, height: info.height, channels: info.channels },
  })
    .png()
    .toBuffer();

  const tag = await renderTagline(fill);
  const tagMeta = await sharp(tag).metadata();

  await sharp(cleared)
    .composite([{ input: tag, top: INK_TOP, left: Math.round(CENTRE - tagMeta.width / 2) }])
    .png({ compressionLevel: 9 })
    .toFile(join(OUT, file));

  console.log(`  ${file}  tagline ${tagMeta.width}x${tagMeta.height}px, centred on x${CENTRE}`);
}

console.log("\nwrote both lockups from media-src/brand originals");
