import Image from "next/image";
import Reveal from "@/components/motion/Reveal";

/**
 * Client logo strip — the trust bar, directly above the footer.
 *
 * Every logo ships with real transparency. There is deliberately NO
 * `mix-blend-multiply` here, and it must not be reintroduced: once this strip
 * became a marquee it stopped working. `.logo-marquee__track` is animated with
 * `transform` and `.logo-marquee` carries a `mask-image`, and each of those
 * creates a stacking context — so the blend group is the track, whose backdrop
 * is transparent. Multiplying against nothing returns the pixel unchanged, and
 * every white box stayed white while appearing to be "handled".
 *
 * So the grounds are fixed in the FILES, not in CSS:
 *
 *   Chigwell, DRMS    supplied flattened on white; the white is keyed out by
 *                     recovering alpha from luminance, which keeps the
 *                     antialiased edges a threshold cut would have shredded.
 *   North Mymms       already transparent as supplied.
 *   Swifty            supplied as WHITE artwork for dark grounds. The brief
 *                     asked for black type with no tile, so the ink is inverted
 *                     and the alpha left alone — the one recoloured mark here.
 *   KFC, Co-op        self-contained marks that carry their OWN ground: KFC is
 *                     transparent around the bucket but opaque white inside it,
 *                     Co-op is white type reversed out of a cyan tile. Both are
 *                     used verbatim. Co-op in particular must never be trimmed —
 *                     its cyan IS the logo, and an auto-trim ate it once already.
 *   Novikov           WHITE type over a red rule, drawn for a dark ground. On a
 *                     pale band it is invisible, so it alone sits on an ink tile.
 *
 * Heights are per logo, not shared. These run from roughly 1:1 (KFC) to 3.8:1
 * (Novikov), so a single height would make the wide marks enormous beside the
 * square ones. The values below are tuned for equal optical weight, which is
 * what makes the spacing read as even.
 */
const CLIENTS = [
  {
    name: "The Chigwell Marquees",
    src: "/media/clients/chigwell.png",
    width: 303,
    height: 189,
    size: "h-12 sm:h-16",
  },
  {
    name: "Novikov Restaurant & Bar",
    src: "/media/clients/novikov.png",
    width: 501,
    height: 132,
    size: "h-7 sm:h-9",
    onDark: true,
  },
  {
    name: "KFC",
    src: "/media/clients/kfc.png",
    width: 900,
    height: 902,
    size: "h-12 sm:h-16",
  },
  {
    name: "Co-op",
    src: "/media/clients/coop.png",
    width: 269,
    height: 172,
    size: "h-11 sm:h-14",
  },
  {
    name: "North Mymms Park",
    src: "/media/clients/north-mymms.png",
    width: 587,
    height: 239,
    size: "h-12 sm:h-16",
  },
  {
    name: "DRMS · Dr. Medispa",
    src: "/media/clients/drms.png",
    width: 900,
    height: 411,
    size: "h-9 sm:h-12",
  },
  {
    name: "Swifty Beats",
    src: "/media/clients/swifty-beats.png",
    width: 250,
    height: 84,
    size: "h-8 sm:h-11",
  },
] as const;

/**
 * One logo, in whichever of the three grounds its artwork needs. Pulled out
 * because the marquee renders the list twice and the branching is not trivial.
 */
function Logo({
  client,
  duplicate,
}: {
  client: (typeof CLIENTS)[number];
  duplicate: boolean;
}) {
  // The duplicate is decorative; alt="" keeps it out of the accessibility tree
  // even though the <li> is already aria-hidden.
  const alt = duplicate ? "" : client.name;

  if ("onDark" in client && client.onDark) {
    return (
      <span className="inline-flex items-center justify-center rounded-[var(--radius-sm)] bg-(--color-ink) px-6 py-4 sm:px-8 sm:py-5">
        <Image
          src={client.src}
          alt={alt}
          width={client.width}
          height={client.height}
          sizes="240px"
          className={`${client.size} w-auto`}
        />
      </span>
    );
  }

  return (
    <Image
      src={client.src}
      alt={alt}
      width={client.width}
      height={client.height}
      sizes="240px"
      className={`${client.size} w-auto`}
    />
  );
}

export default function ClientLogos() {
  return (
    <section
      className="section container-page border-t border-(--color-hairline)"
      aria-label="Clients"
    >
      <Reveal as="p" className="eyebrow text-center">
        Trusted by
      </Reveal>

      {/* One Reveal around the whole strip, not one per logo. A per-item stagger
          animates each mark into a track that is itself sliding, which reads as
          two competing motions; and the second copy would stagger in again mid-
          loop. The strip arrives as one object, then it moves. */}
      <Reveal className="mt-12 sm:mt-14">
        <div className="logo-marquee">
          <ul className="logo-marquee__track">
            {/* Rendered twice. The first pass is the real list; the second is
                the seam-filler that makes the wrap invisible, so it is hidden
                from assistive tech — otherwise every client is announced twice. */}
            {[...CLIENTS, ...CLIENTS].map((client, i) => {
              const duplicate = i >= CLIENTS.length;
              return (
                <li
                  key={`${client.name}-${i}`}
                  className="logo-marquee__item"
                  aria-hidden={duplicate || undefined}
                >
                  <Logo client={client} duplicate={duplicate} />
                </li>
              );
            })}
          </ul>
        </div>
      </Reveal>
    </section>
  );
}
