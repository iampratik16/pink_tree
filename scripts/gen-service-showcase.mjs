/**
 * Regenerates the Services panels and the three replaceable Showcase tiles,
 * then sizes each to exactly what its layout expects.
 *
 *   VERTEX_TOKEN=$(gcloud auth print-access-token) PROJECT=radlabs-497004 \
 *     node scripts/gen-service-showcase.mjs [name ...]
 *
 * Generation goes through scripts/gen-image-gemini.mjs — Imagen 404s on this
 * project in every region, which that script already documents, so there is one
 * image path for the site and this is it. Each spec declares the aspect it
 * wants and the model composes for that frame; the resize afterwards only
 * scales to the pixel dimensions the component declares, it does not reframe.
 *
 * Pass names to regenerate a subset (e.g. `social-media showcase/03`) rather
 * than re-billing all seven.
 *
 * Why these subjects: the previous art was abstract — a plinth of orange tiles
 * stood for "social media" — which read as stock decoration rather than as the
 * agency's work. Every prompt below shows a DELIVERABLE the studio actually
 * hands over: an identity system, printed collateral, branded merchandise, a
 * content grid, a built site. Showcase 01 (laptop) and 04 (phone) are kept and
 * deliberately NOT regenerated, so the five tiles together read web / brand /
 * merch / social / print with no two covering the same ground.
 *
 * Crop, not stretch: Imagen returns a fixed aspect per ratio, so the result is
 * cover-cropped to the layout's exact dimensions. Anything else reintroduces
 * the CLS the fixed width/height in the components exists to prevent.
 */
import sharp from "sharp";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public", "media");
const GEN = join(ROOT, "scripts", "gen-image-gemini.mjs");

if (!process.env.VERTEX_TOKEN || !process.env.PROJECT) {
  console.error("Missing VERTEX_TOKEN or PROJECT env.");
  process.exit(1);
}

// Mirrors the site's tokens: --color-paper #f7f4ee, --color-accent #b76e79,
// --color-ink #1a1012. Naming the hexes keeps the generated art inside the
// palette the page is built from instead of near it.
const STYLE =
  "shot on medium format, one soft shaft of natural raking daylight, warm bone-ivory (#f7f4ee) and muted rose-gold (#b76e79) palette with deep maroon-black (#1a1012) accents, refined, minimal, generous negative space, quietly expensive, editorial, photorealistic, high detail";

// Lettering is where image models fail most visibly, and a brand panel covered
// in warped pseudo-text is worse than no panel. Every prompt suppresses text.
const NEG = "no text, no lettering, no words, no logos, no watermark, no faces, no hands with visible fingers distorted";

const SPECS = [
  // ---- Services panels (square, full-bleed behind a label) ----
  {
    name: "services/design-branding",
    w: 1024, h: 1024, aspect: "1:1",
    prompt: `A brand identity system laid out on a pale limestone surface: a stack of blind-embossed bone-ivory calling cards, an open brand guidelines booklet showing a clean grid of rose-gold and maroon colour chips, a fanned set of paper swatches, a single brass rule. Overhead flat-lay, ordered and architectural, ${STYLE}`,
  },
  {
    name: "services/print-merchandise",
    w: 1024, h: 1024, aspect: "1:1",
    prompt: `Printed collateral and branded merchandise arranged together on warm bone-ivory linen: a folded soft-rose cotton tote, a matte ceramic mug, a stack of thick deckled-edge brochures with one lying open, a folded garment, a rolled poster tied with ribbon. Three-quarter view, tactile textures, ${STYLE}`,
  },
  {
    name: "services/social-media",
    w: 1024, h: 1024, aspect: "1:1",
    // "abstract grid" produced nine smudges. Naming what each thumbnail
    // CONTAINS — a flat-lay, an interior, a bottle — is what makes the grid read
    // as a content calendar rather than as texture.
    prompt: `A content studio still life: a phone propped on a rose-marble block showing a nine-square social feed grid where each tile is a distinct small photograph — a flat-lay of cosmetics, a styled interior corner, a glass product bottle, a table setting, folded fabric — all in warm blush and ivory tones, a ring light softly out of focus behind, printed contact sheets of the same photographs fanned beside it. Calm, curated, ${STYLE}`,
  },
  {
    name: "services/websites-digital",
    w: 1024, h: 1024, aspect: "1:1",
    prompt: `An open laptop on a pale travertine desk displaying an elegant minimal website with large serif headline and a soft blush hero image, a phone beside it showing the same site responsively, a printed wireframe sketch and a brass pen alongside. Clean studio light, ${STYLE}`,
  },

  // ---- Showcase tiles 02, 03, 05 (4:3; 01 laptop and 04 phone are kept) ----
  {
    name: "showcase/02",
    w: 1600, h: 1200, aspect: "4:3",
    prompt: `An open brand guidelines book on bone-ivory paper, one spread showing a rose-gold and maroon colour palette with large type specimen letterforms, a slim stack of embossed cards squared beside it, a brass straight-edge across the corner. Overhead, crisp shadow, ${STYLE}`,
  },
  {
    name: "showcase/03",
    w: 1600, h: 1200, aspect: "4:3",
    prompt: `Branded merchandise still life on pale plaster: a dusty-rose insulated bottle standing, a matte ceramic mug, a folded soft-pink cotton tee, a bound notebook with elastic closure and a slim pen resting on it. Warm raking light, long soft shadows, ${STYLE}`,
  },
  {
    name: "showcase/05",
    w: 1600, h: 1200, aspect: "4:3",
    // "a lookbook of blush photography" was refused as IMAGE_PROHIBITED_CONTENT
    // — blush plus photography reads as skin to the safety filter. Naming the
    // printed subject matter outright (architecture, table settings) describes
    // the same editorial spread with nothing for it to misread.
    prompt: `A large-format printed brochure lying open on bone-ivory marble, its spread laid out with wide margins and small printed photographs of architecture and styled table settings, a second closed copy beneath it with a rose-gold foil-stamped cover, a softly creased sheet of tissue paper alongside. Shallow depth of field, ${STYLE}`,
  },
];

const tmp = mkdtempSync(join(tmpdir(), "gen-"));

async function generate(spec) {
  const raw = join(tmp, spec.name.replace("/", "-") + ".png");
  try {
    execFileSync("node", [GEN, raw, spec.prompt], {
      env: { ...process.env, ASPECT: spec.aspect, NEGATIVE: NEG },
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (e) {
    const why = (e.stderr?.toString() || e.stdout?.toString() || e.message).trim().slice(0, 200);
    console.log(`  ✗ ${spec.name}: ${why}`);
    return false;
  }

  const file = join(OUT, `${spec.name}.jpg`);
  await mkdir(dirname(file), { recursive: true });
  await sharp(raw)
    .resize(spec.w, spec.h, { fit: "cover", position: "centre" })
    .jpeg({ quality: 86, mozjpeg: true })
    .toFile(file);

  console.log(`  ✓ ${spec.name}  ${spec.w}x${spec.h}`);
  return true;
}

const only = process.argv.slice(2);
const todo = only.length ? SPECS.filter((s) => only.some((o) => s.name.includes(o))) : SPECS;
if (!todo.length) {
  console.error(`No specs matched: ${only.join(", ")}`);
  process.exit(1);
}

console.log(`generating ${todo.length} image(s) via gen-image-gemini.mjs`);
let ok = 0;
for (const spec of todo) {
  if (await generate(spec)) ok++;
}
rmSync(tmp, { recursive: true, force: true });
console.log(`\n${ok}/${todo.length} written.`);
if (ok < todo.length) process.exit(2);
