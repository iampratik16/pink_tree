import { buildStudy } from "@/content/case-studies/_placeholder";
import { img } from "@/lib/media";

/**
 * Swifty Beats. Client-supplied copy, used close to verbatim, replacing the
 * draft written for layout.
 *
 * Two things went with that draft. "Social Media Marketing" is no longer
 * claimed: the services listed here are website, digital, branding,
 * merchandise and creative, and social is not among them. And the hero is now
 * a real merch shot rather than a generated ambient stage loop — every other
 * study in the set leads on the client's own work.
 *
 * `theClient` is the artist's own positioning, from the About page of the site.
 */
export default buildStudy({
  slug: "swifty-beats",
  client: "Swifty Beats",
  sector: "Music & Entertainment",
  order: 4,
  disciplines: ["Branding & Design", "Websites & Digital Marketing", "Print & Merchandise"],
  heroSrc: "/media/work/swifty/hero.jpg",
  heroAlt:
    "Swifty Beats merchandise laid out on concrete: a black bomber jacket, folded tees and a turntable.",
  liveUrl: "https://swiftybeatsv3.vercel.app/",
  oneLineOutcome:
    "A digital home for the music, and a merch line carrying the same identity.",
  theClient:
    "Swifty Beats is an Asian House producer and DJ, working the rare space where South Asian percussion and dhol heritage meet house and electronic production, with releases, remixes and UK tour dates behind him.",
  challengeLabel: "The Project",
  theChallenge:
    "Pink Tree Media worked with Swifty Beats to develop a distinctive digital presence that reflects his identity as an artist, bringing together his music, visual style and merchandise under one cohesive brand.",
  delivered: {
    "Branding & Design":
      "A visual direction consistent across the artist’s wider brand, holding from the site through to the product, so the music, the imagery and the merchandise all read as one thing.",
    "Websites & Digital Marketing":
      "Design and development of the Swifty Beats website, creating a central digital platform for his music, releases and artist profile.",
    "Print & Merchandise":
      "Branded merchandise and supporting creative assets, carrying the Swifty Beats identity beyond digital and into something people wear.",
  },
  work: [
    img(
      "/media/work/swifty/site-01.jpg",
      "The Swifty Beats website shown on desktop and mobile, with the latest release.",
      2000,
      1500,
    ),
    img(
      "/media/work/swifty/site-02.jpg",
      "The Swifty Beats shop, the merchandise range laid out across the site.",
      1440,
      1000,
    ),
    img(
      "/media/work/swifty/merch-01.jpg",
      "Swifty Beats merchandise: a navy hoodie and an olive tee, both carrying the wordmark.",
      2172,
      1086,
    ),
    img(
      "/media/work/swifty/merch-02.jpg",
      "Swifty Beats merchandise: a black tonal tee and a white tee for The Sessions.",
      2172,
      1086,
    ),
    img(
      "/media/work/swifty/merch-03.jpg",
      "The Sessions beanies in black, navy, grey, olive and white, each with a woven label.",
      1448,
      1086,
    ),
    img(
      "/media/work/swifty/portrait.jpg",
      "Swifty Beats in the studio, a session open on the screens behind him.",
      1100,
      1375,
    ),
  ],
});
