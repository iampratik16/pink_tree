import Image from "next/image";
import Reveal from "@/components/motion/Reveal";

/**
 * Client logo strip — the trust bar, directly above the footer.
 *
 * Every logo here is the artwork as supplied; nothing is recoloured. That has a
 * consequence the layout has to carry, because the five files do not agree on
 * what background they need:
 *
 *   Aya, Central,     dark and gold marks baked onto opaque cream/white boxes.
 *   Co-op, DRMS       `mix-blend-multiply` dissolves those grounds into the
 *                     light band, so the mark survives and the box does not.
 *   North Mymms       dark on transparency; sits on the light band untouched.
 *   Chigwell, Swifty, WHITE artwork (Swifty measures 254,254,254; Chigwell is
 *   Novikov           white text with a gold crown; Novikov is white type over
 *                     a red rule). On a pale ground these are invisible, so each
 *                     sits on an ink tile — the ground the artwork was drawn
 *                     for. No blend on those: multiply would turn the white
 *                     straight back into black.
 *   KFC               a self-contained mark: transparent AROUND the bucket, but
 *                     opaque white INSIDE it, outlined in black. `plain` — no
 *                     blend, no tile. Multiply would eat the bucket's white face
 *                     and drag the red down toward maroon, so the one logo here
 *                     that already carries its own ground must be left alone.
 *
 * Heights are per logo, not shared. These run from roughly 1:1 (Aya) to 4:1
 * (Chigwell), so a single height would make the wide marks enormous beside the
 * square ones. The values below are tuned for equal optical weight, which is
 * what makes the spacing read as even.
 */
const CLIENTS = [
  {
    name: "Aya Beauty",
    src: "/media/clients/aya-beauty.png",
    width: 225,
    height: 225,
    size: "h-14 sm:h-20",
  },
  {
    name: "Central Restaurant & Lounge",
    src: "/media/clients/central.png",
    width: 589,
    height: 521,
    size: "h-14 sm:h-20",
  },
  {
    name: "North Mymms Park",
    src: "/media/clients/north-mymms.png",
    width: 587,
    height: 239,
    size: "h-12 sm:h-16",
  },
  {
    name: "The Chigwell Marquees",
    src: "/media/clients/chigwell.png",
    width: 640,
    height: 159,
    size: "h-8 sm:h-11",
    onDark: true,
  },
  {
    name: "Swifty Beats",
    src: "/media/clients/swifty-beats.png",
    width: 384,
    height: 133,
    size: "h-9 sm:h-12",
    onDark: true,
  },
  {
    name: "KFC",
    src: "/media/clients/kfc.png",
    width: 900,
    height: 902,
    size: "h-12 sm:h-16",
    plain: true,
  },
  {
    name: "Co-op",
    src: "/media/clients/coop.png",
    width: 512,
    height: 512,
    size: "h-11 sm:h-14",
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
    name: "DRMS · Dr. Medispa",
    src: "/media/clients/drms.png",
    width: 900,
    height: 411,
    size: "h-9 sm:h-12",
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
      className={`${client.size} w-auto${
        "plain" in client && client.plain ? "" : " mix-blend-multiply"
      }`}
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
