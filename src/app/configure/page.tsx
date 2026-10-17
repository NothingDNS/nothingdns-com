import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, FileCode2 } from "lucide-react";
import { ConfigurationStudio } from "@/components/configuration-studio";
import { Eyebrow, Reveal } from "@/components/ui";
import { SOURCE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Configuration studio",
  description:
    "Build a local NothingDNS starter configuration for forwarding, iterative resolution, or authoritative test zones. Download your YAML recipe.",
  alternates: { canonical: "/configure" },
};

export default function ConfigurePage() {
  return (
    <>
      <section className="container page-hero configure-hero">
        <Reveal>
          <Eyebrow>MAKE IT YOURS</Eyebrow>
          <h1>
            A small recipe.
            <br />
            <span className="hero-serif">A good beginning.</span>
          </h1>
          <p>
            Choose how you want to resolve. Keep the essentials.
            <br />
            Leave with a configuration that makes sense.
          </p>
        </Reveal>
        <div className="configure-hero-mark" aria-hidden="true">
          <FileCode2 size={58} />
          <span className="mono">READABLE BY DESIGN</span>
        </div>
      </section>
      <section className="container studio-section">
        <ConfigurationStudio />
        <div className="studio-reference">
          <span>
            These are local starter recipes. Add your production listeners,
            policies, and certificates using the full reference.
          </span>
          <a
            href={`${SOURCE}/docs/CONFIG_REFERENCE.md`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Full configuration reference
            <ArrowUpRight size={15} />
          </a>
        </div>
      </section>
      <section className="container configure-links">
        <Link href="/download">
          Get the server
          <ArrowUpRight size={18} />
        </Link>
        <Link href="/docs/configuration">
          Keep exploring configuration
          <ArrowUpRight size={18} />
        </Link>
      </section>
    </>
  );
}
