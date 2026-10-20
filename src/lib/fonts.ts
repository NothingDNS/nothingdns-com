import { JetBrains_Mono, Manrope, Space_Grotesk } from "next/font/google";

export const spaceGrotesk = Space_Grotesk({
  subsets: ["latin", "latin-ext"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const jetbrains = JetBrains_Mono({
  subsets: ["latin", "latin-ext"],
  variable: "--font-jetbrains",
  display: "swap",
});

// Preserve the shared studio band's typography without duplicating its display font.
export const studioBody = Manrope({
  subsets: ["latin"],
  variable: "--font-oxog-body",
  display: "swap",
});
