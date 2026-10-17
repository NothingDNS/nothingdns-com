import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, FileCode2, PackageCheck } from "lucide-react";
import { DownloadSelector } from "@/components/download-selector";
import { CallToAction } from "@/components/cta";
import { Eyebrow, Reveal } from "@/components/ui";
import { projectRelease, releaseDate } from "@/lib/project";
import { REPO } from "@/lib/site";

export const metadata: Metadata = {
  title: "Download",
  description:
    "Get NothingDNS and dnsctl for Linux, macOS, and Windows, with x86_64 and ARM64 binaries and SHA-256 checksums.",
  alternates: { canonical: "/download" },
};

export default function DownloadPage() {
  return (
    <>
      <section className="container page-hero download-hero">
        <Reveal>
          <Eyebrow>ONE BINARY. YOUR WHOLE NETWORK.</Eyebrow>
          <h1>
            Make yourself
            <br />
            <span className="hero-serif">at home.</span>
          </h1>
          <p>
            Choose your platform. Take the server and its command line.
            <br />
            Everything else starts on your terms.
          </p>
        </Reveal>
        <Reveal className="download-release" delay={0.08}>
          <PackageCheck size={32} />
          <span className="mono">RELEASE</span>
          <strong>{projectRelease.tag}</strong>
          <span>Published {releaseDate}</span>
          <a
            href={projectRelease.releaseUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Release notes
            <ArrowUpRight size={15} />
          </a>
        </Reveal>
      </section>
      <section className="container download-section">
        <DownloadSelector />
      </section>
      <section className="container download-next">
        <Reveal>
          <span className="mono">01 / INSTALL</span>
          <h2>Prefer the guided route?</h2>
          <p>The installer handles setup for your platform.</p>
          <Link href="/docs">
            Open the installation guide
            <ArrowUpRight size={17} />
          </Link>
        </Reveal>
        <Reveal delay={0.06}>
          <span className="mono">02 / CONFIGURE</span>
          <h2>A recipe of your own.</h2>
          <p>Start with a configuration you can read and change.</p>
          <Link href="/configure">
            Build your first configuration
            <ArrowUpRight size={17} />
          </Link>
        </Reveal>
        <Reveal delay={0.12}>
          <FileCode2 size={24} />
          <h2>Build from the source.</h2>
          <p>The current source requires Go 1.26.9+ and Make.</p>
          <a href={REPO} target="_blank" rel="noopener noreferrer">
            Explore the repository
            <ArrowUpRight size={17} />
          </a>
        </Reveal>
      </section>
      <CallToAction />
    </>
  );
}
