import { buildStudy } from "@/content/case-studies/_placeholder";
import { img } from "@/lib/media";

/**
 * Roya London. Client-supplied copy, used close to verbatim.
 *
 * The brief was framed as "The Project" rather than a problem to solve, so this
 * study overrides the second column heading instead of inventing a challenge it
 * was never given. `theClient` is drawn from Roya London's own public
 * positioning and product range, not from anything we made up about them.
 *
 * The five services the client listed (branding, e-commerce, website design and
 * development, packaging, print) collapse into three of our four disciplines —
 * e-commerce and web development are one offer here, packaging and print
 * another.
 */
export default buildStudy({
  slug: "roya-london",
  client: "Roya London",
  sector: "Fashion & Lifestyle",
  order: 1,
  disciplines: ["Branding & Design", "Website & Digital Marketing", "Print & Merchandise"],
  heroSrc: "/media/work/roya/hero.jpg",
  heroAlt:
    "Roya London branded postage bags and swing tags, the wordmark printed in deep green on white.",
  liveUrl: "https://roya.london/",
  oneLineOutcome:
    "A cohesive brand, from the Shopify storefront through to the packaging it ships in.",
  theClient:
    "Roya London is a London lifestyle brand making block-printed quilted tote bags, wash bags, travel sets and robes, sold direct to customers through its own online store under the line “elevated essentials for every journey”.",
  challengeLabel: "The Project",
  theChallenge:
    "Pink Tree Media worked with Roya London to build a cohesive brand presence across both digital and physical touchpoints, creating a clean and considered look that complements the brand and its products.",
  delivered: {
    "Branding & Design":
      "A clean, considered brand presence carried consistently across every customer touchpoint, digital and physical, designed to complement the products rather than compete with them.",
    "Website & Digital Marketing":
      "Design and development of Roya London’s Shopify e-commerce website, creating a clean, easy-to-navigate online store that puts the products at the forefront.",
    "Print & Merchandise":
      "The Roya London branding applied across its physical customer touchpoints, including branded postage bags, product tags and product labels, creating consistency from the online shopping experience through to the finished product and packaging.",
  },
  work: [
    img(
      "/media/work/roya/site-01.jpg",
      "The Roya London Shopify storefront shown on desktop and mobile.",
      2000,
      1500,
    ),
    img(
      "/media/work/roya/site-02.jpg",
      "A Roya London product page, the garment shown large beside its details.",
      1440,
      1000,
    ),
    img(
      "/media/work/roya/product-01.jpg",
      "A Roya London shell-print quilted wash bag set in coral and cream.",
      1400,
      1400,
    ),
    img(
      "/media/work/roya/product-02.jpg",
      "A Roya London block-printed safari tote bag in navy.",
      1400,
      1400,
    ),
    img(
      "/media/work/roya/tag.jpg",
      "A Roya London swing tag on a block-printed wash bag, reading “Timeless elegance. Crafted for you.”",
      1800,
      1800,
    ),
  ],
});
