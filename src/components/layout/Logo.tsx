import Image from "next/image";
import { v } from "@/lib/media";

type Props = {
  /** Height + any extra classes. Callers own the height so it never conflicts. */
  className?: string;
  /** Use the light variant (pink icon + cream text) for dark surfaces. */
  onDark?: boolean;
};

/**
 * Pink Tree Media brand lockup (client-supplied). Always shown in colour: on light
 * surfaces the full-colour PNG (dark wordmark); on dark surfaces / over the dark
 * hero the light variant (pink icon kept, wordmark recoloured to cream) so it stays
 * legible without going monochrome white.
 *
 * Both srcs go through v() for the same reason every other asset does: the
 * lockups are regenerated IN PLACE by scripts/retag-logo.mjs, so the URL does
 * not change when the artwork does. Without the version query the optimizer and
 * the CDN keep serving the previous lockup — which is how a stale tagline
 * survives a deploy that definitely changed the file.
 */
export default function Logo({ className = "h-14 sm:h-[4.25rem]", onDark = false }: Props) {
  // object-contain so a container narrower than the lockup letterboxes
  // instead of squashing it (max-width:100% + a fixed height distorts).
  const base = `w-auto shrink-0 object-contain ${className}`;

  if (onDark) {
    return (
      <Image src={v("/brand/logo-light.png")} alt="Pink Tree Media" width={400} height={99} priority className={base} />
    );
  }

  // Header (auto): colour on the solid/light bar, light variant over the dark hero.
  return (
    <>
      <Image
        src={v("/brand/logo.png")}
        alt="Pink Tree Media"
        width={400}
        height={99}
        priority
        className={`${base} group-data-[over-hero=true]/header:hidden`}
      />
      <Image
        src={v("/brand/logo-light.png")}
        alt=""
        aria-hidden
        width={400}
        height={99}
        className={`${base} hidden group-data-[over-hero=true]/header:block`}
      />
    </>
  );
}
