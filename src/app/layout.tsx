import type { Metadata, Viewport } from "next";
import { spaceGrotesk, jetbrains } from "@/lib/fonts";
import { Providers } from "@/components/providers";
import { Footer, Header } from "@/components/shell";
import { SiteBackground } from "@/components/site-background";
import { SITE_URL } from "@/lib/site";
import "./globals.css";
import "./enhancements.css";
import "./appearance.css";
import "./oxog-studio.css";
import "./hero-network.css";
import "./site-background.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "NothingDNS — Less noise. More network.",
    template: "%s — NothingDNS",
  },
  description:
    "Your network. Your rules. A self-contained, open-source DNS server with encrypted transports, DNSSEC, policy filtering, and an embedded dashboard. Built in Go.",
  openGraph: {
    title: "NothingDNS — Less noise. More network.",
    description: "An open-source DNS server for a network that answers to you.",
    siteName: "NothingDNS",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "NothingDNS — Less noise. More network.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: [{ url: "/og.png", alt: "NothingDNS — Less noise. More network." }],
  },
};
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0c0d10" },
    { media: "(prefers-color-scheme: light)", color: "#f6f6f8" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className={`${spaceGrotesk.variable} ${jetbrains.variable}`}>
        <Providers>
          <SiteBackground />
          <a href="#main" className="skip-link">
            Skip to content
          </a>
          <Header />
          <main id="main">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
