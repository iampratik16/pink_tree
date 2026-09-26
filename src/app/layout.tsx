import type { Metadata, Viewport } from "next";
import { archivo, hanken, fraunces, boska } from "@/lib/fonts";
import { SITE } from "@/lib/site";
import SmoothScroll from "@/components/providers/SmoothScroll";
import RevealObserver from "@/components/providers/RevealObserver";
import Cursor from "@/components/providers/Cursor";
import PageTransition from "@/components/providers/PageTransition";
import SiteBackground from "@/components/layout/SiteBackground";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FloatingActions from "@/components/layout/FloatingActions";
import JsonLd from "@/components/seo/JsonLd";
import { organizationLd, localBusinessLd } from "@/lib/structured-data";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} · ${SITE.tagline}`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.name }],
  openGraph: {
    type: "website",
    locale: SITE.locale,
    siteName: SITE.name,
    title: `${SITE.name} · ${SITE.tagline}`,
    description: SITE.description,
    url: SITE.url,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} · ${SITE.tagline}`,
    description: SITE.description,
  },
};

export const viewport: Viewport = {
  themeColor: "#1a1012",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en-GB"
      className={`${archivo.variable} ${hanken.variable} ${fraunces.variable} ${boska.variable}`}
      // The inline script below adds the `js` (and later `gsap-failsafe`)
      // classes before hydration; suppress the expected html-attribute diff so
      // React doesn't discard and re-render the tree.
      suppressHydrationWarning
    >
      <head>
        {/* Enable JS-gated reveal styles before paint to avoid any flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "document.documentElement.classList.add('js');" +
              // Failsafe: if GSAP is slow or blocked, reveal split headings anyway.
              "setTimeout(function(){document.documentElement.classList.add('gsap-failsafe')},2500);",
          }}
        />
      </head>
      {/* suppressHydrationWarning: extensions (e.g. Bitdefender) inject bis_register/
          __processed_* attributes onto <body> before hydration — harmless mismatch. */}
      <body suppressHydrationWarning>
        <SiteBackground />
        <SmoothScroll />
        <RevealObserver />
        <Cursor />
        <PageTransition>
          <a href="#main" className="skip-link">
            Skip to content
          </a>
          <Header />
          <main id="main">{children}</main>
          <Footer />
          <FloatingActions />
        </PageTransition>
        <JsonLd data={[organizationLd(), localBusinessLd()]} />
        {/* Above-the-fold reveals must not wait for hydration.
            `html.js` (set in <head>) hides every [data-reveal] at the FIRST
            paint, but `.is-in` used to arrive only once React had downloaded,
            hydrated and run RevealObserver. On a throttled connection that held
            the first screenful invisible for ~3.5s: the homepage's LCP element
            is a <p> inside a Reveal and measured Load Time 0ms / Render Delay
            4484ms of a 4.9s LCP, and on /case-studies the card images are
            clip-path'd to zero height by [data-reveal-media], so their pixels
            landed 3.7s after their bytes did.
            This runs at parse time and starts the SAME transition (and the same
            data-reveal-delay stagger) for whatever is already on screen, so the
            animation is unchanged — only its start moves earlier. Below the fold
            is untouched. RevealObserver already filters out `.is-in` elements,
            so it never fights this. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "requestAnimationFrame(function(){var h=innerHeight;" +
              "document.querySelectorAll('[data-reveal],[data-reveal-media]').forEach(function(e){" +
              "if(e.getBoundingClientRect().top>=h)return;" +
              "var d=+e.getAttribute('data-reveal-delay')||0;" +
              "d?setTimeout(function(){e.classList.add('is-in')},d):e.classList.add('is-in');" +
              "})})",
          }}
        />
      </body>
    </html>
  );
}
