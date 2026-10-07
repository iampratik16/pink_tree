import { buildStudy } from "@/content/case-studies/_placeholder";
import { img } from "@/lib/media";

/**
 * First Impressions. Client-supplied copy, used close to verbatim.
 *
 * The six services listed (website, branding, social media, content, print,
 * signage) span all four of our disciplines, which is why this is the only
 * study carrying the full set. Content sits under Social Media Marketing and
 * signage under Print & Merchandise, matching how the Services page groups
 * them.
 *
 * Framed as a project rather than a problem, so the second column is
 * relabelled instead of inventing a challenge nobody described. `theClient` is
 * drawn from First Impressions' own site, Instagram bio and leaflet copy.
 */
export default buildStudy({
  slug: "first-impressions",
  client: "First Impressions",
  sector: "Luxury Events & Décor",
  order: 3,
  disciplines: [
    "Branding & Design",
    "Website & Digital Marketing",
    "Social Media Marketing",
    "Print & Merchandise",
  ],
  heroSrc: "/media/work/first-impressions/hero.jpg",
  heroAlt:
    "A First Impressions event: a ballroom lit magenta and teal, dressed tables and an illuminated dance floor.",
  liveUrl: "https://www.firstimpressions-uk.com/",
  oneLineOutcome:
    "One identity across the website, the feed and everything printed.",
  theClient:
    "First Impressions is a London events company specialising in luxury bespoke décor, designing and styling weddings, receptions, themed celebrations and corporate events at venues including The Chigwell Marquees.",
  challengeLabel: "The Project",
  theChallenge:
    "Pink Tree Media has worked with First Impressions across its wider brand and marketing presence, bringing together its digital, social and physical marketing under a consistent identity.",
  delivered: {
    "Branding & Design":
      "A consistent look and feel across the brand, from what customers see online and on social media through to printed and physical branded materials.",
    "Website & Digital Marketing":
      "Website design and development, giving the business an online presence that matches the standard of the events it stages.",
    "Social Media Marketing":
      "Social media and content creation, holding the same identity across the feed that runs through everything else the business puts out.",
    "Print & Merchandise":
      "Printed materials and signage, from leaflets through to branded event staff workwear.",
  },
  work: [
    img(
      "/media/work/first-impressions/site-01.jpg",
      "The First Impressions website shown on desktop and mobile.",
      2000,
      1500,
    ),
    img(
      "/media/work/first-impressions/site-02.jpg",
      "A section of the First Impressions website covering weddings, themed events and corporate work.",
      1440,
      1000,
    ),
    img(
      "/media/work/first-impressions/leaflet.jpg",
      "A First Impressions leaflet, the cover printed with pink blooms and the shield monogram, shown with its reverse.",
      1920,
      1280,
    ),
    img(
      "/media/work/first-impressions/hivis.jpg",
      "Branded First Impressions event staff hi-vis vests, front and back, carrying the shield monogram.",
      1920,
      1280,
    ),
  ],
  // Real posts from the client's account, each linking out. Thumbnails are
  // self-hosted because Instagram's CDN URLs are signed and expire.
  instagram: {
    handle: "firstimpressionsltd",
    profileUrl: "https://www.instagram.com/firstimpressionsltd/",
    posts: [
      {
        url: "https://www.instagram.com/p/DUfghDDDF9-/",
        src: "/media/work/first-impressions/instagram/DUfghDDDF9-.jpg",
        alt: "A pale ballroom dressed for a ceremony, a floral aisle running to the mandap.",
      },
      {
        url: "https://www.instagram.com/p/DXAzMl-DfME/",
        src: "/media/work/first-impressions/instagram/DXAzMl-DfME.jpg",
        alt: "A mirrored top table beneath a suspended floral canopy in blush and cream.",
      },
      {
        url: "https://www.instagram.com/p/DZlK_bFjDvV/",
        src: "/media/work/first-impressions/instagram/DZlK_bFjDvV.jpg",
        alt: "A monogrammed backdrop and floral stage set for a wedding reception.",
      },
      {
        url: "https://www.instagram.com/p/DbfPb_IjAY-/",
        src: "/media/work/first-impressions/instagram/DbfPb_IjAY-.jpg",
        alt: "A grand hall with a rose window, uplit and dressed for a dinner.",
      },
    ],
  },
});
