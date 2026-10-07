import { z } from "zod";

/** The four capabilities Pink Tree demonstrates through real work. */
export const DISCIPLINES = [
  "Branding & Design",
  "Print & Merchandise",
  "Social Media Marketing",
  "Website & Digital Marketing",
] as const;

export const imageMediaSchema = z.object({
  type: z.literal("image"),
  src: z.string().min(1),
  alt: z.string().min(1, "Every image needs descriptive alt text (a11y)."),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  priority: z.boolean().optional(),
  /**
   * A product cutout on transparency rather than a photograph. Renders smaller
   * and without the plate the gallery puts behind a normal image — a grey card
   * around a knocked-out object just reinvents the background we removed.
   */
  cutout: z.boolean().optional(),
});

export const videoSourceSchema = z.object({
  src: z.string().min(1),
  // MIME type, e.g. "video/webm" or "video/mp4".
  type: z.string().min(1),
});

export const videoMediaSchema = z.object({
  type: z.literal("video"),
  poster: z.string().min(1),
  alt: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  /** Self-hosted MP4/WebM sources (omit when using Mux). */
  sources: z.array(videoSourceSchema).default([]),
  provider: z.enum(["self", "mux"]).default("self"),
  /** Mux playback id — set when provider === "mux" for longer clips. */
  muxPlaybackId: z.string().optional(),
});

export const mediaSchema = z.discriminatedUnion("type", [
  imageMediaSchema,
  videoMediaSchema,
]);

export const caseStudySchema = z.object({
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, "slug must be kebab-case"),
  client: z.string().min(1),
  sector: z.string().min(1),
  /** Controls homepage + index ordering (ascending). */
  order: z.number().int(),
  /** Clearly-marked placeholder entries the client must still confirm. */
  placeholder: z.boolean().default(false),
  disciplines: z.array(z.enum(DISCIPLINES)).min(1),
  heroMedia: mediaSchema,
  oneLineOutcome: z.string().min(1),
  theClient: z.string().min(1),
  theChallenge: z.string().min(1),
  /** Heading for the second narrative column. Some engagements are framed as a
   *  brief rather than a problem ("The Project"), and forcing that copy under
   *  "The Challenge" reads wrong. Defaults to "The Challenge". */
  challengeLabel: z.string().optional(),
  delivered: z
    .array(z.object({ area: z.enum(DISCIPLINES), summary: z.string().min(1) }))
    .min(1),
  work: z.array(mediaSchema).default([]),
  /**
   * Real posts from the client's Instagram, shown as a linked strip. Thumbnails
   * are self-hosted: the CDN URLs Instagram serves are signed and expire within
   * days, so hotlinking them would leave a wall of broken images.
   */
  instagram: z
    .object({
      handle: z.string().min(1),
      profileUrl: z.string().min(1),
      posts: z
        .array(
          z.object({
            url: z.string().min(1),
            src: z.string().min(1),
            alt: z.string().min(1),
          }),
        )
        .min(1),
    })
    .optional(),
  results: z
    .array(z.object({ value: z.string().optional(), label: z.string().min(1) }))
    .default([]),
  seo: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    ogImage: z.string().min(1),
  }),
  /** Live website we built for this client, if published. */
  liveUrl: z.string().url().optional(),
});

export type ImageMedia = z.infer<typeof imageMediaSchema>;
export type VideoMedia = z.infer<typeof videoMediaSchema>;
export type Media = z.infer<typeof mediaSchema>;
export type Discipline = (typeof DISCIPLINES)[number];
export type CaseStudy = z.infer<typeof caseStudySchema>;
