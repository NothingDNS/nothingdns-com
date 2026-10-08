import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import { Footer, Header } from "@/components/shell";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});
const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

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
  },
  twitter: { card: "summary_large_image" },
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
      <body className={`${geist.variable} ${mono.variable}`}>
        <Providers>
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
