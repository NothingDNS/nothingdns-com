import { studioBody } from "@/lib/fonts";
import { ArrowUpRight } from "lucide-react";
import { OxogMark } from "./oxog-mark";

// Shared OXOG footer from mammothengine.com; see THIRD_PARTY_NOTICES.md.
export function OxogStudio() {
  return (
    <a className={`oxog-studio ${studioBody.variable}`} href="https://oxog.net">
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
