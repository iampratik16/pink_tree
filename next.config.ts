import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // ponytail: lets `next build` write somewhere other than the running dev
  // server's .next/. Sharing one dist dir corrupts the dev client manifest
  // ("__webpack_modules__[moduleId] is not a function"). Verify with
  // `NEXT_DIST_DIR=.next-build npm run build` while dev stays up.
  distDir: process.env.NEXT_DIST_DIR ?? ".next",

  images: {
    // AVIF only (client decision — no WebP). Next serves AVIF to any browser
    // that accepts it (all current Chrome / Firefox / Edge / Safari 16+); any
    // browser without AVIF support automatically falls back to the original
    // JPEG/PNG. Nothing is ever served a format it didn't ask for.
    formats: ["image/avif"],
    deviceSizes: [360, 480, 640, 768, 1024, 1280, 1536, 1920, 2560],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Long cache for optimised assets.
    minimumCacheTTL: 60 * 60 * 24 * 365,
  },

  // 301 redirect map: old WordPress URLs → new IA (planning §10).
  //
  // The live WordPress site has 14 portfolio pages and this site publishes four,
  // only one of which shares a slug. A blanket
  // `/portfolio-item/:slug -> /case-studies/:slug` therefore sent thirteen real,
  // indexed client pages into a 404 — which is worse than not redirecting at
  // all, because a crawler follows the 301, finds nothing, and drops the URL.
  //
  // So the portfolio slugs are listed EXPLICITLY. A slug that has a home goes
  // there; everything else lands on the index, which is a weaker but honest
  // match. When one of the unregistered studies is published, move its slug from
  // RETIRED to PORTFOLIO_MOVED — the lists are the only thing to maintain, and
  // an unlisted slug falls through to the catch-all rather than 404ing.
  async redirects() {
    // Old portfolio slug → its page on this site.
    const PORTFOLIO_MOVED: Record<string, string> = {
      "the-chigwell-marquees": "the-chigwell-marquees",
    };

    // Real client pages on the old site with no equivalent here yet. Listed by
    // name rather than swept up by the catch-all so it stays visible how much
    // indexed content is landing on the index instead of its own page.
    const RETIRED = [
      "aya-beauty",
      "chigwell-hall",
      "belsta-art-events",
      "cakes-shakes",
      "central-restaurant-lounge",
      "galleywood-pharmacy",
      "hypno-dental",
      "brookside-dental",
      "novikov-restaurant",
      "hainault-golf-course",
      "sarcoma-glitter-ball",
      "north-mymms-park",
      "styles-ahead",
    ];

    return [
      // Case studies that moved, slug by slug. These come first so the
      // catch-all below cannot shadow them.
      ...Object.entries(PORTFOLIO_MOVED).map(([from, to]) => ({
        source: `/portfolio-item/${from}`,
        destination: `/case-studies/${to}`,
        permanent: true,
      })),
      ...RETIRED.map((slug) => ({
        source: `/portfolio-item/${slug}`,
        destination: "/case-studies",
        permanent: true,
      })),
      // Anything else under the old portfolio tree.
      { source: "/portfolio-item", destination: "/case-studies", permanent: true },
      { source: "/portfolio-item/:slug*", destination: "/case-studies", permanent: true },
      { source: "/portfolio-category/:slug*", destination: "/case-studies", permanent: true },
      { source: "/portfolio", destination: "/case-studies", permanent: true },
      { source: "/portfolio/:slug*", destination: "/case-studies", permanent: true },

      // /work was this section's own URL until it became Case Studies. Both it
      // and every deep link are live in the wild, so they redirect rather than
      // 404. These slugs ARE this site's own, so the pass-through is safe.
      { source: "/work", destination: "/case-studies", permanent: true },
      { source: "/work/:slug", destination: "/case-studies/:slug", permanent: true },

      // WordPress page URLs. /our-services is the one with real search intent —
      // it was 404ing.
      { source: "/our-services", destination: "/services", permanent: true },
      { source: "/our-clients", destination: "/case-studies", permanent: true },
      { source: "/our-team", destination: "/about", permanent: true },
      { source: "/our-office", destination: "/contact", permanent: true },
      { source: "/about-us", destination: "/about", permanent: true },
      { source: "/contact-us", destination: "/contact", permanent: true },
      { source: "/faq", destination: "/contact", permanent: true },

      // The old theme shipped landing pages on these paths. They are demo
      // content, but "marketing agency" and "seo agency" are exactly what this
      // business is searched for, so any equity they hold is worth catching.
      { source: "/marketing-agency", destination: "/services", permanent: true },
      { source: "/creative-agency", destination: "/services", permanent: true },
      { source: "/seo-agency", destination: "/services", permanent: true },

      // There is no blog here. The old one holds a single default WordPress
      // post, so this is a courtesy for stray links rather than a content match.
      { source: "/blog", destination: "/", permanent: true },
      { source: "/blog/:slug*", destination: "/", permanent: true },
    ];
  },

  async headers() {
    return [
      {
        // Long-lived caching for self-hosted media (these carry a ?v= token that
        // changes when the file changes, so immutable is safe).
        source: "/media/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        // Brand assets (logo/mark) are static but NOT content-hashed, so we use a
        // long-but-finite cache (30 days) instead of immutable — was max-age=0,
        // which re-validated on every visit. Not immutable, so a rebrand still
        // propagates without needing to rename the file.
        source: "/brand/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=2592000" },
        ],
      },
    ];
  },
};

export default nextConfig;
