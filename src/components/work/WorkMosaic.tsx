import Img from "@/components/media/Img";
import Reveal from "@/components/motion/Reveal";
import type { ImageMedia } from "@/content/schema";

/**
 * The Work, as an asymmetric mosaic: one feature tile spanning two columns and
 * both rows, with a 2x2 grid beside it. Same shape as the homepage's
 * ShowcaseMosaic, so a case study and the homepage read as one system.
 *
 * This replaced a stack of centred images. Stacked, five images meant five
 * screens of scrolling and no sense of a body of work; side by side they read
 * as a portfolio at a glance.
 *
 * Needs five images. The caller falls back to the stacked layout below that,
 * because a 2x2 grid with a hole in it looks like a bug rather than a choice.
 *
 * On mobile the feature drops to a normal cell and the whole thing becomes two
 * columns — a five-tile mosaic at phone width is unreadable.
 */
export default function WorkMosaic({ items }: { items: ImageMedia[] }) {
  const [feature, ...rest] = items;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
      <Reveal
        media
        className="relative overflow-hidden rounded-(--radius-sm) sm:col-span-2 lg:row-span-2"
      >
        <div className="relative aspect-[4/5] sm:aspect-[4/3] lg:aspect-auto lg:h-full">
          <Img media={feature} fill sizes="(min-width: 1024px) 50vw, 100vw" />
        </div>
      </Reveal>

      {rest.map((tile, i) => (
        <Reveal
          media
          key={tile.src}
          delay={90 * (i + 1)}
          className="relative overflow-hidden rounded-(--radius-sm)"
        >
          <div className="relative aspect-[4/3]">
            <Img
              media={tile}
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              fill
            />
          </div>
        </Reveal>
      ))}
    </div>
  );
}
