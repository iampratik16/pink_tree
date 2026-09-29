/**
 * Rebuilds the home hero montage: public/media/hero/home.{mp4,webm,jpg}.
 *
 *   node scripts/build-hero-montage.mjs
 *
 * Six shots, crossfaded. Three are brand stills from media-src/hero/ given a
 * slow camera move; three are kept from the previous montage.
 *
 * The kept shots are pulled from their CLEAN CORES, not their nominal spans.
 * home.mp4 is already crossfaded, so the frames around each boundary are a
 * blend of two shots — lifting a nominal span drags a ghost of the neighbouring
 * shot in with it, and crossfading on top of that turns to mush. KEEP below is
 * measured from the dissolve positions, so re-derive it if the source changes.
 *
 * The stills are bright flat-lays on white; the montage is warm, dark and
 * filmic. GRADE is what reconciles them — and it is load-bearing twice over,
 * because shot 1 is also the poster, which is the LCP image sitting behind a
 * near-white headline. scripts/check-hero-scrim.mjs is the check on that.
 */
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "media-src", "hero");
const OUT = join(ROOT, "public", "media", "hero");
/**
 * The kept shots come from a pristine copy in media-src, NOT from the montage
 * this script writes. Reading public/media/hero/home.mp4 here would work once
 * and then silently feed the build its own output: the frame ranges below stop
 * pointing at the shots they name, the out-of-range one encodes to an empty
 * clip, and xfade carries on with five shots. SOURCE_FRAMES is the guard.
 */
const PREV = join(SRC, "00-source-montage.mp4");
const SOURCE_FRAMES = 363;

const W = 1280;
const H = 720;
const FPS = 24;
const XFADE = 0.42; // seconds of overlap between adjacent shots
const STILL_SECS = 3.0;

/**
 * Warm, darken and vignette a bright flat-lay into the montage's grade.
 *
 * curves, not eq=brightness. Brightness is additive, so darkening a white
 * flat-lay with it lifts the blacks too and the shot goes milky grey next to
 * the kept footage. The curve pins black at 0 and pulls the mids and highlights
 * down instead, which darkens for the scrim AND deepens contrast.
 */
const GRADE =
  "curves=all='0/0 0.25/0.17 0.5/0.38 0.75/0.61 1/0.86'," +
  "eq=contrast=1.06:saturation=0.94," +
  "colorbalance=rs=0.07:gs=0.01:bs=-0.07:rm=0.05:bm=-0.06:rh=0.02:bh=-0.05," +
  "vignette=PI/4.2";

/**
 * Shots in order. `still` builds from an image with a camera move; `keep` lifts
 * a frame range out of the source montage.
 *
 * Two kinds of move, chosen by the source's shape:
 *   zoom: [from, to]  static 16:9 window at crop, push in (>1) or pull back
 *   pan:  [y0, y1]    full-width 16:9 window sliding down the source
 *
 * A portrait source gets the pan. A static window on a tall flat-lay keeps one
 * band and throws the rest away — on 03 that meant losing the bottle and the
 * mugs, i.e. the objects the shot exists to show.
 */
const SHOTS = [
  {
    kind: "still",
    file: "01-print.png",
    crop: { x: 0, y: 321, w: 1504, h: 846 },
    zoom: [1.0, 1.06],
    note: "print & stationery — also the poster frame",
  },
  { kind: "keep", from: 80, to: 124, note: "London aerial at dusk" },
  {
    kind: "still",
    file: "03-merch.png",
    // 1202x1496 portrait: sweep the full flat-lay, bottle and coasters down to
    // the pens and mugs, rather than sitting on one 676px band of it.
    pan: [232, 806],
    note: "pink merchandise flat-lay",
  },
  { kind: "keep", from: 182, to: 234, note: "shelf textiles and mug" },
  {
    kind: "still",
    file: "05-stand.png",
    crop: { x: 0, y: 262, w: 1500, h: 844 },
    zoom: [1.0, 1.08],
    note: "exhibition stand",
  },
  // Ends at 354, not at the last frame. The source montage has a SEVENTH shot
  // — a classic car — dissolving in from ~357 and truncated by the end of the
  // file. Running this range to 360 drags that dissolve in and the montage ends
  // on a ghost of a car nobody asked for.
  { kind: "keep", from: 304, to: 354, note: "country estate at dusk" },
];

const ff = (args) => execFileSync("ffmpeg", ["-v", "error", "-y", ...args], { stdio: "inherit" });

const probeSize = (file) =>
  execFileSync("ffprobe", [
    "-v", "error", "-show_entries", "stream=width,height",
    "-of", "csv=p=0:s=x", file,
  ])
    .toString()
    .trim()
    .split("x")
    .map(Number);

const frameCount = (file) =>
  Number(
    execFileSync("ffprobe", [
      "-v", "error", "-count_frames",
      "-show_entries", "stream=nb_read_frames",
      "-of", "csv=p=0", file,
    ]).toString().trim(),
  );

// Every KEEP range below was measured against this exact cut. If the source is
// ever replaced, re-measure the dissolves rather than trusting these numbers.
const have = frameCount(PREV);
assert.equal(
  have,
  SOURCE_FRAMES,
  `${PREV} has ${have} frames, expected ${SOURCE_FRAMES} — the keeper ranges were measured against a different cut, so they no longer point at the shots they name.`,
);

const tmp = mkdtempSync(join(tmpdir(), "hero-"));
try {
  const clips = [];

  SHOTS.forEach((shot, i) => {
    const out = join(tmp, `${i}.mp4`);
    if (shot.kind === "still") {
      const frames = Math.round(STILL_SECS * FPS);
      const src = join(SRC, shot.file);
      let move;
      if (shot.pan) {
        // crop takes an expression for its origin while its size stays fixed,
        // so the window can slide without zoompan in the chain at all.
        const [sw, sh] = probeSize(src);
        const ph = Math.round((sw * H) / W) & ~1;
        const [y0, y1] = shot.pan;
        const yMax = sh - ph;
        assert.ok(
          y0 >= 0 && y1 >= 0 && y0 <= yMax && y1 <= yMax,
          `${shot.file}: pan [${y0}, ${y1}] leaves the image — valid range is 0..${yMax} for a ${sw}x${ph} window.`,
        );
        move = `crop=${sw}:${ph}:0:'${y0}+(${y1 - y0})*min(t/${STILL_SECS},1)',scale=${W}:${H}`;
      } else {
        const { x, y, w, h } = shot.crop;
        const [z0, z1] = shot.zoom;
        // zoompan rounds its crop origin to whole pixels, which judders on a
        // slow move. Oversampling 4x first puts that rounding well below one
        // output pixel; the final scale brings it back down.
        const big = W * 4;
        const step = (z1 - z0) / (frames - 1);
        move =
          `crop=${w}:${h}:${x}:${y},scale=${big}:-2,` +
          `zoompan=z='${z0}+${step}*on':d=1:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=${big}x${Math.round((big * H) / W)}:fps=${FPS},` +
          `scale=${W}:${H}`;
      }
      ff([
        "-loop", "1", "-framerate", String(FPS), "-t", String(STILL_SECS), "-i", src,
        "-vf", `${move},${GRADE},format=yuv420p`,
        "-frames:v", String(frames),
        "-c:v", "libx264", "-crf", "16", "-preset", "medium", "-an", out,
      ]);
      clips.push({ path: out, secs: frames / FPS, note: shot.note });
    } else {
      const frames = shot.to - shot.from + 1;
      ff([
        "-i", PREV,
        "-vf", `select='between(n,${shot.from},${shot.to})',setpts=N/${FPS}/TB,scale=${W}:${H},format=yuv420p`,
        "-r", String(FPS), "-frames:v", String(frames),
        "-c:v", "libx264", "-crf", "16", "-preset", "medium", "-an", out,
      ]);
      clips.push({ path: out, secs: frames / FPS, note: shot.note });
    }
    console.log(`  shot ${i + 1}  ${clips[i].secs.toFixed(2)}s  ${shot.note}`);
  });

  // Chain the crossfades. Each xfade eats XFADE seconds of overlap, so the
  // offset for clip k is the running length so far minus one transition.
  const inputs = clips.flatMap((c) => ["-i", c.path]);
  let filter = "";
  let label = "0:v";
  let acc = clips[0].secs;
  for (let k = 1; k < clips.length; k++) {
    const next = k === clips.length - 1 ? "vout" : `v${k}`;
    filter += `[${label}][${k}:v]xfade=transition=fade:duration=${XFADE}:offset=${(acc - XFADE).toFixed(4)}[${next}];`;
    acc += clips[k].secs - XFADE;
    label = next;
  }
  filter = filter.replace(/;$/, "");
  const total = acc;
  console.log(`  montage       ${total.toFixed(2)}s`);

  const master = join(tmp, "master.mp4");
  ff([...inputs, "-filter_complex", filter, "-map", "[vout]", "-r", String(FPS),
      "-c:v", "libx264", "-crf", "14", "-preset", "slow", "-an", "-pix_fmt", "yuv420p", master]);

  // Delivery encodes, per MEDIA-README.
  ff(["-i", master, "-c:v", "libx264", "-crf", "24", "-preset", "slow", "-an",
      "-pix_fmt", "yuv420p", "-movflags", "+faststart", join(OUT, "home.mp4")]);
  ff(["-i", master, "-c:v", "libvpx-vp9", "-crf", "32", "-b:v", "0", "-an",
      "-pix_fmt", "yuv420p", "-row-mt", "1", join(OUT, "home.webm")]);

  // Poster is the montage's own first frame, at the 1600x900 the old one used.
  // Anything else and the poster-to-video swap visibly jumps on load.
  ff(["-i", master, "-frames:v", "1", "-vf", "scale=1600:900", "-q:v", "3", join(OUT, "home.jpg")]);

  console.log("\n  wrote home.mp4, home.webm, home.jpg");
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
