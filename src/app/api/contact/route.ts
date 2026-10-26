import { NextResponse } from "next/server";
import nodemailer, { type Transporter } from "nodemailer";
import { render } from "@react-email/components";
import { contactSchema } from "@/lib/contact-schema";
import EnquiryEmail from "@/emails/EnquiryEmail";
import { CONTACT } from "@/lib/site";

export const runtime = "nodejs";
// Office 365 can be slow to hand shake on a cold lambda. The platform default
// would abort mid-send and lose the enquiry; 30s is comfortably past the worst
// observed handshake and still well inside Vercel's ceiling.
export const maxDuration = 30;

/**
 * Shortest plausible time between the form appearing and a human submitting it.
 * Five fields including a select and a free-text enquiry; three seconds is far
 * below any real completion and far above an instant scripted POST.
 */
const MIN_FILL_MS = 3000;

// Comma-separated, so one env var fans out to every inbox that should see an
// enquiry without a redeploy when the list changes.
const TO = (process.env.CONTACT_TO_EMAIL ?? CONTACT.email)
  .split(",")
  .map((a) => a.trim())
  .filter(Boolean);

// The envelope sender has to be the authenticated mailbox: Exchange rejects a
// From that the credentials have no Send As right over (550 5.7.60).
const FROM = process.env.CONTACT_FROM_EMAIL ?? process.env.SMTP_USER ?? CONTACT.email;

// One transporter per warm lambda. Nodemailer keeps the TLS session alive, and
// the Office 365 handshake — not the send — is the expensive part.
let transporter: Transporter | null = null;
function mailer(user: string, pass: string): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST ?? "smtp.office365.com",
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: false, // 587 upgrades via STARTTLS. `secure: true` is for 465.
      auth: { user, pass },
    });
  }
  return transporter;
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed.", issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const data = parsed.data;

  // Honeypot tripped → pretend success, send nothing.
  if (data.website) {
    return NextResponse.json({ ok: true });
  }

  // Timing gate. The form stamps Date.now() when it mounts; filling five fields
  // takes a human well over twenty seconds, while a script posts immediately.
  // No stamp at all means the form was never rendered — a direct POST at the
  // endpoint.
  //
  // Silent success, like the honeypot, and for the same reason: an explicit
  // "too fast" tells the operator precisely which knob to turn. A human cannot
  // trip this, so there is no real enquiry to lose.
  //
  // The stamp is client-supplied and therefore forgeable. That is a deliberate
  // ceiling, not an oversight — it stops the bots actually hitting this form
  // without putting a challenge in front of real visitors. If they start
  // backdating the stamp, the answer is Cloudflare Turnstile, not a cleverer
  // timestamp.
  const elapsed = data.startedAt ? Date.now() - data.startedAt : -1;
  if (elapsed < MIN_FILL_MS) {
    console.warn(
      `[contact] dropped: submitted ${elapsed < 0 ? "with no render stamp" : elapsed + "ms after render"} (floor ${MIN_FILL_MS}ms)`,
    );
    return NextResponse.json({ ok: true });
  }

  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (!user || !pass) {
    // In production this is data loss: the visitor is told "thank you" and the
    // enquiry evaporates. Fail loudly so a misconfigured deploy is obvious on
    // the first submission rather than discovered weeks later.
    if (process.env.NODE_ENV === "production") {
      console.error("[contact] SMTP_USER/SMTP_PASSWORD missing in production — refusing to drop the enquiry silently.");
      return NextResponse.json({ error: "Could not send your enquiry." }, { status: 500 });
    }
    // Local dev without credentials → don't break the form.
    console.warn(
      "[contact] SMTP_USER/SMTP_PASSWORD not set — enquiry not emailed. Payload:",
      { name: data.name, email: data.email },
    );
    return NextResponse.json({ ok: true, delivered: false });
  }

  try {
    const html = await render(EnquiryEmail(data));
    const text = await render(EnquiryEmail(data), { plainText: true });

    await mailer(user, pass).sendMail({
      from: FROM,
      to: TO,
      replyTo: data.email,
      subject: `New enquiry from ${data.name} · ${data.helpWith}${data.company ? ` · ${data.company}` : ""}`,
      html,
      text,
    });

    return NextResponse.json({ ok: true, delivered: true });
  } catch (err) {
    console.error("[contact] SMTP error:", err);
    return NextResponse.json({ error: "Could not send your enquiry." }, { status: 502 });
  }
}
