import { Manrope, Space_Grotesk } from "next/font/google";
import { ArrowUpRight } from "lucide-react";
import { OxogMark } from "./oxog-mark";

const body = Manrope({
  subsets: ["latin"],
  variable: "--font-oxog-body",
  display: "swap",
});
const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-oxog-display",
  display: "swap",
});

// Shared OXOG footer from mammothengine.com; see THIRD_PARTY_NOTICES.md.
export function OxogStudio() {
  return (
    <a
      className={["oxog-studio", body.variable, display.variable].join(" ")}
      href="https://oxog.net"
    >
      <OxogMark />
      <div>
        <span className="eyebrow">PART OF A BIGGER PICTURE</span>
        <h2>
          Small studio. <span>Big ideas.</span>
        </h2>
        <p>Explore the tools and infrastructure from Oxog.</p>
      </div>
      <span className="oxog-studio-link">
        Meet oxog.net <ArrowUpRight size={18} aria-hidden="true" />
      </span>
    </a>
  );
}
