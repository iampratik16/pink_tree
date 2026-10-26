import { z } from "zod";

/**
 * Shared contact-form schema (client + server). No server-only imports so it
 * can power inline validation in the browser and authoritative validation in
 * the Route Handler.
 */
/**
 * What the enquiry is about. A closed set rather than free text so the values
 * stay groupable later (in a sheet, a CRM or a report); "Not sure" is a real
 * option because the Services page explicitly tells people they do not need to
 * know which service they want before getting in touch.
 */
export const HELP_OPTIONS = [
  "Branding & Design",
  "Print & Merchandise",
  "Social Media Marketing",
  "Website & Digital Marketing",
  "Not sure, I’d like some advice",
] as const;

/**
 * Longest single run of non-space characters allowed in a name.
 *
 * The bot filling this form submits names like "YrbxrJNxAGhuBVNjBgB" — one
 * unbroken 19-character token. Real names break into words well under this:
 * Christodoulou and Wojciechowski are 13, Hadjigeorgiou 13, Papadopoulos 12.
 *
 * Deliberately a VISIBLE validation error rather than a silent drop like the
 * honeypot. A human can legitimately trip this — Balasubramanian is 15, and
 * double-barrelled surnames carry no space at all — and silently binning a real
 * enquiry while telling the sender "thank you" is the one outcome worse than
 * receiving spam. The honeypot and the timing gate stay silent because neither
 * can fire for a human.
 */
const MAX_NAME_WORD = 14;

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter your name.")
    .max(120)
    .refine(
      (v) => v.split(/\s+/).every((word) => word.length <= MAX_NAME_WORD),
      `Please enter your name as you'd write it — no single part longer than ${MAX_NAME_WORD} characters.`,
    ),
  email: z.string().trim().email("Please enter a valid email address.").max(160),
  telephone: z
    .string()
    .trim()
    .max(40)
    .regex(/^[+()\d\s-]{7,}$/, "Please enter a valid telephone number.")
    .or(z.literal(""))
    .optional(),
  company: z.string().trim().max(160).optional(),
  helpWith: z.enum(HELP_OPTIONS, {
    message: "Please choose what we can help with.",
  }),
  enquiry: z
    .string()
    .trim()
    .min(10, "Please tell us a little more (at least 10 characters).")
    .max(4000),
  // Honeypot — humans never see it. Non-empty is handled in the Route Handler
  // (silent success, no email) rather than as a visible validation error.
  website: z.string().optional(),

  // Epoch ms stamped when the form mounted in the browser. The Route Handler
  // rejects anything submitted within MIN_FILL_MS of it, and anything with no
  // stamp at all — a script POSTing JSON straight at the endpoint never renders
  // the form and so never sets this.
  //
  // Optional in the schema on purpose: a missing stamp must be handled as a
  // silent drop alongside the honeypot, not surfaced to the sender as
  // "startedAt: Required", which would tell an operator exactly what to forge.
  startedAt: z.number().int().positive().optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;

export const CONTACT_FIELDS = [
  { name: "name", label: "Name", type: "text", required: true, autoComplete: "name" },
  { name: "email", label: "Email", type: "email", required: true, autoComplete: "email" },
  { name: "telephone", label: "Telephone", type: "tel", required: false, autoComplete: "tel" },
  { name: "company", label: "Company Name", type: "text", required: false, autoComplete: "organization" },
] as const;
