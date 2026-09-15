import type { Metadata } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";
import { ThemeProvider } from "@/lib/ThemeContext";
import Chatbot from "@/components/shared/Chatbot";
import CookieConsent from "@/components/shared/CookieConsent";
import JsonLd from "@/components/shared/JsonLd";
import { siteGraph } from "@/lib/schema";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-barlow",
  display: "swap",
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-barlow-condensed",
  display: "swap",
});

const description =
  "We design, build and deploy production AI — agents, copilots, generative AI and RAG systems — that run inside enterprise products across BFSI, healthcare, manufacturing and more.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  /* `%s` is the child page's own title; the brand is appended once, here, so
     no page has to remember to add it and none of them can word it differently.
     `default` covers routes that set no title at all. */
  title: {
    template: `%s | ${SITE_NAME}`,
    default: "UFTECH.AI — Enterprise AI, from prompt to production",
  },
  description,
  applicationName: SITE_NAME,
  /* Deliberately no `alternates.canonical` here. A canonical set on the layout
     is inherited by every child that does not override it, which would have
     every page in the site declaring the homepage as its canonical — the exact
     failure this field exists to prevent. Each page sets its own, via
     pageMetadata() in lib/seo.ts. */
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      /* Let Google use full-length text snippets, large image previews and
         untruncated video previews. Without these it applies conservative
         defaults, which costs surface area on the results page for nothing. */
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  /* Set GOOGLE_SITE_VERIFICATION once the Search Console property is claimed.
     Harmless when unset — the tag is simply omitted. */
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
  openGraph: {
    title: "UFTECH.AI — Enterprise AI, from prompt to production",
    description,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    site: "@uftec",
    title: "UFTECH.AI — Enterprise AI, from prompt to production",
    description,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${barlow.variable} ${barlowCondensed.variable}`}>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
        <Chatbot />
        <CookieConsent />
        {/* One Organization and one WebSite node for the whole site. Every
            page's own JSON-LD references the organisation by @id rather than
            repeating it, so a crawler resolves the site to a single entity. */}
        <JsonLd data={siteGraph()} />
      </body>
    </html>
  );
}
