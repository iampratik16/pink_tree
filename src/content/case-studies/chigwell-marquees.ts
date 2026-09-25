import type { CaseStudy } from "@/content/schema";
import { img, loop } from "@/lib/media";

/**
 * The Chigwell Marquees. Client-supplied copy, used close to verbatim,
 * replacing the draft that stood here for layout purposes.
 *
 * Three things went with that draft:
 *
 *  - "Websites & Digital Marketing" is no longer claimed. The services the
 *    client listed for this study are social media, branding, print, signage
 *    and large format; web is not among them.
 *  - `results` is empty. The draft carried "< 1.5s mobile load" and two
 *    qualitative claims that nobody supplied.
 *  - `liveUrl` is gone, for the same reason as the first point: a "Visit the
 *    live site" button on a study that does not claim web work implies we
 *    built it.
 *
 * Like Roya London, the brief is framed as a project rather than a problem, so
 * the second column is relabelled instead of inventing a challenge.
 */
const chigwellMarquees: CaseStudy = {
  slug: "the-chigwell-marquees",
  client: "The Chigwell Marquees",
  sector: "Luxury Events & Hospitality",
  order: 2,
  placeholder: false,
  disciplines: ["Branding & Design", "Print & Merchandise", "Social Media Marketing"],
  heroMedia: loop(
    "/media/work/chigwell/hero",
    "/media/work/chigwell/hero.jpg",
    "The Chigwell Marquees, a candlelit marquee interior dressed for an event.",
    2560,
    1600,
  ),
  oneLineOutcome:
    "One identity, consistent from the brochure and the signage through to the feed.",
  theClient:
    "The Chigwell Marquees is a luxury events venue set in the grounds of Chigwell Hall in Essex, where two marquees host weddings, receptions and private celebrations for anywhere from 30 to 1,000 guests.",
  challengeLabel: "The Project",
  theChallenge:
    "Pink Tree Media has worked with The Chigwell Marquees across its wider brand and marketing presence, helping create a consistent, premium identity across digital and physical touchpoints.",
  delivered: [
    {
      area: "Branding & Design",
      summary:
        "A consistent, premium identity applied across digital and physical touchpoints, so the venue looks the same in a brochure, on a sign and on a screen.",
    },
    {
      area: "Print & Merchandise",
      summary:
        "Branded print, brochures, signage, large-format print and branded promotional materials, carrying the Chigwell Marquees identity through the venue itself as well as its marketing.",
    },
    {
      area: "Social Media Marketing",
      summary:
        "Ongoing social media, keeping the venue visible between events and holding the same identity that runs through everything else it puts out.",
    },
  ],
  work: [
    img(
      "/media/work/chigwell/aerial.jpg",
      "The Chigwell Marquees from the air: Chigwell Hall, the marquee and the grounds in evening light.",
      2400,
      1500,
    ),
    img(
      "/media/work/chigwell/marquee.jpg",
      "A marquee at The Chigwell Marquees dressed for a wedding, with a floral stage and candlelit aisle.",
      2400,
      1600,
    ),
    img(
      "/media/work/chigwell/brochure.jpg",
      "The Chigwell Marquees brochure, open on a spread and shown with its aerial cover.",
      2304,
      1536,
    ),
    img(
      "/media/work/chigwell/umbrella.jpg",
      "A branded Chigwell Marquees golf umbrella in navy, the crown wordmark printed in white.",
      1600,
      1600,
    ),
    img(
      "/media/work/chigwell/social.jpg",
      "The Chigwell Marquees Instagram profile, with branded story highlights and a grid of venue content.",
      1280,
      1500,
    ),
  ],
  results: [],
  seo: {
    title: "The Chigwell Marquees, Brand, print and social",
    description:
      "A Pink Tree Media case study for The Chigwell Marquees. Branding, print, signage, large format and social media for a luxury events venue in Essex.",
    ogImage: "/media/work/chigwell/hero.jpg",
  },
};

export default chigwellMarquees;
