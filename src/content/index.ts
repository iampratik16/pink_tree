import { caseStudySchema, type CaseStudy } from "@/content/schema";
import roya from "@/content/case-studies/roya-london";
import chigwell from "@/content/case-studies/chigwell-marquees";
import firstImpressions from "@/content/case-studies/first-impressions";
import swifty from "@/content/case-studies/swifty-beats";

/**
 * The published set, in the order the client asked for: Roya London, The
 * Chigwell Marquees, First Impressions, Swifty Beats.
 *
 * Aya Beauty, Central Restaurant & Lounge and North Mymms Park are still in
 * src/content/case-studies/ but are deliberately not registered. They remain
 * clients (all three are in the logo strip); they are simply not part of this
 * selection. Re-adding one is a single import plus an entry below.
 */
const RAW: unknown[] = [roya, chigwell, firstImpressions, swifty];

/**
 * Validate every entry through Zod at module load. A malformed case study
 * (missing alt text, bad slug, etc.) fails the build loudly rather than
 * shipping broken content.
 */
const caseStudies: CaseStudy[] = RAW.map((entry, i) => {
  const parsed = caseStudySchema.safeParse(entry);
  if (!parsed.success) {
    throw new Error(
      `Invalid case study at index ${i}:\n${parsed.error.toString()}`,
    );
  }
  return parsed.data;
}).sort((a, b) => a.order - b.order);

// Guard against duplicate slugs.
const slugs = new Set<string>();
for (const cs of caseStudies) {
  if (slugs.has(cs.slug)) throw new Error(`Duplicate case-study slug: ${cs.slug}`);
  slugs.add(cs.slug);
}

export function getAllCaseStudies(): CaseStudy[] {
  return caseStudies;
}

/** Confirmed (non-placeholder) studies, e.g. for the homepage's hero card. */
export function getPublishedCaseStudies(): CaseStudy[] {
  return caseStudies.filter((c) => !c.placeholder);
}

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return caseStudies.find((c) => c.slug === slug);
}

export function getAllSlugs(): string[] {
  return caseStudies.map((c) => c.slug);
}

/** The next study in order (wraps around), for the seamless "next" link. */
export function getNextCaseStudy(slug: string): CaseStudy {
  const idx = caseStudies.findIndex((c) => c.slug === slug);
  return caseStudies[(idx + 1) % caseStudies.length];
}
