import Img from "@/components/media/Img";
import Reveal from "@/components/motion/Reveal";
import { img } from "@/lib/media";
import type { CaseStudy } from "@/content/schema";

/**
 * A row of real posts from the client's Instagram, each linking out to the post
 * itself.
 *
 * The tiles sit at staggered heights rather than on a rule. A straight row of
 * six squares reads as a contact sheet; offsetting them reads as a feed, which
 * is what the section is about. The offsets are a fixed repeating pattern, not
 * random, so the layout is stable between renders and across the two columns
 * that survive at phone width.
 *
 * Thumbnails are self-hosted. Instagram's CDN signs its image URLs with an
 * expiry a few days out, so hotlinking would turn this into broken images
 * shortly after launch and nobody would notice until a client did.
 */

// Repeating vertical offsets, in px, applied from the second tile onward.
const OFFSETS = [34, 0, 52, 14, 42, 6];

export default function InstagramStrip({
  instagram,
}: {
  instagram: NonNullable<CaseStudy["instagram"]>;
}) {
  const { handle, profileUrl, posts } = instagram;

  return (
    <section className="section border-t border-(--color-hairline) bg-(--color-paper)">
      <div className="container-page text-center">
        <Reveal as="h2" className="font-serif text-h2 font-light tracking-tight">
          Instagram
        </Reveal>
        <Reveal delay={80}>
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="link-underline mt-4 inline-block text-sm tracking-tight text-(--color-ink-soft) transition-colors duration-500 hover:text-(--color-accent-ink)"
          >
            @{handle}
          </a>
        </Reveal>
      </div>

      {/* Scrolls sideways rather than wrapping: six staggered tiles reflowed
          into rows lose the stagger and just look misaligned. */}
      <ul className="mt-14 flex gap-4 overflow-x-auto px-[max(1.25rem,calc((100vw-80rem)/2))] pb-6 sm:gap-6 lg:justify-center">
        {posts.map((post, i) => (
          // The offset sits on a plain <li>, not on Reveal: Reveal has no style
          // prop, and the reveal animation drives transform itself.
          <li
            key={post.url}
            className="shrink-0"
            style={{ transform: `translateY(${OFFSETS[i % OFFSETS.length]}px)` }}
          >
            <Reveal media delay={i * 70}>
              <a
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block overflow-hidden rounded-(--radius-sm)"
              >
                {/* Through img() rather than next/image directly, so these
                    pick up the same ?v= cache token as every other media path
                    — /media/* is served immutable for a year. */}
                <div className="relative size-[150px] overflow-hidden sm:size-[200px]">
                  <Img
                    media={img(post.src, post.alt, 640, 640)}
                    fill
                    sizes="(min-width: 640px) 200px, 150px"
                    className="transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
                  />
                </div>
              </a>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
