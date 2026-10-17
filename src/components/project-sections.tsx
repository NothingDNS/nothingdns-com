import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Boxes,
  Code2,
  FileCode2,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { ArrowLink, Eyebrow, Reveal } from "./ui";
import { projectRelease, releaseDate, sdkLanguages } from "@/lib/project";
import { REPO, SOURCE } from "@/lib/site";

export function ProjectUpdates() {
  return (
    <section className="container section project-updates">
      <Reveal className="section-heading">
        <div>
          <Eyebrow>MORE POSSIBILITIES, SAME SMALL CORE</Eyebrow>
          <h2>
            Always moving.
            <br />
            <span className="muted">Still yours.</span>
          </h2>
        </div>
        <a
          className="release-stamp"
          href={projectRelease.releaseUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="small-dot" />
          <span>
            <strong>{projectRelease.tag}</strong>
            <small>Released {releaseDate}</small>
          </span>
          <ArrowUpRight size={20} />
        </a>
      </Reveal>
      <div className="project-update-grid">
        <Reveal className="update-cache">
          <div className="update-card-label mono">
            <Zap size={17} />
            AUTHORITATIVE CACHING
          </div>
          <h3>
            Your zones.
            <br />
            Ready for the next query.
          </h3>
          <p>
            Local zone answers can now be cached too. A zone change takes effect
            immediately, while published record TTLs stay intact.
          </p>
          <div className="cache-illustration" aria-hidden="true">
            <span>YOUR ZONE</span>
            <i />
            <span className="cache-chip">
              <Zap size={18} />
              ANSWER CACHE
            </span>
            <i />
            <span>NEXT QUERY</span>
          </div>
          <ArrowLink href="/docs/caching">Meet your answer cache</ArrowLink>
        </Reveal>
        <Reveal className="update-sdk" delay={0.08}>
          <div className="update-card-label mono">
            <Code2 size={18} />
            OFFICIAL CLIENT LIBRARIES
          </div>
          <h3>
            Your server.
            <br />
            Your language.
          </h3>
          <p>
            Bring zone management, cache controls, and monitoring into the tools
            you already build with.
          </p>
          <div className="sdk-chips">
            {sdkLanguages.map((language) => (
              <a
                href={`${SOURCE}/sdk/${language.path}/README.md`}
                key={language.name}
                target="_blank"
                rel="noopener noreferrer"
              >
                {language.name}
                <ArrowUpRight size={12} />
              </a>
            ))}
          </div>
          <ArrowLink href="/docs/sdks">Start with the SDKs</ArrowLink>
        </Reveal>
      </div>
    </section>
  );
}

export function StarterSection() {
  return (
    <section className="container section starter-section">
      <Reveal className="starter-intro">
        <Eyebrow>A STARTING POINT THAT FITS</Eyebrow>
        <h2>
          Your network.
          <br />
          <span className="hero-serif accent-text">Your first recipe.</span>
        </h2>
        <p>
          A home lab, an iterative resolver, or a zone of your own. Turn a few
          choices into a small, readable configuration.
        </p>
        <Link href="/configure" className="button">
          Build your configuration
          <ArrowUpRight size={17} />
        </Link>
      </Reveal>
      <Reveal className="starter-preview" delay={0.08}>
        <div className="starter-preview-top mono">
          <FileCode2 size={17} />
          NOTHINGDNS.YAML
          <span>
            <span className="small-dot" />
            LOCAL FIRST
          </span>
        </div>
        <div className="starter-recipe-row">
          <Boxes size={22} />
          <span>
            Choose your starting point
            <small>Home lab · Resolver · Local zone</small>
          </span>
          <ArrowRight size={19} />
        </div>
        <div className="starter-recipe-row">
          <ShieldCheck size={22} />
          <span>
            Keep the essentials<small>Local listener · Cache · DNSSEC</small>
          </span>
          <ArrowRight size={19} />
        </div>
        <pre>
          <code>
            {
              "server:\n  port: 5353\n  bind: [127.0.0.1]\n\ncache:\n  enabled: true"
            }
          </code>
        </pre>
        <Link href="/configure">
          Make it yours
          <ArrowUpRight size={16} />
        </Link>
      </Reveal>
    </section>
  );
}

const faqs = [
  {
    question: "Does NothingDNS need a database service?",
    answer:
      "No external database service is required. NothingDNS includes its own KV storage and write-ahead logging, alongside the DNS server and embedded dashboard.",
    href: "/technology#resilience",
    label: "See the foundation",
  },
  {
    question: "Can I use it at home and serve my own zones?",
    answer:
      "Yes. You can forward queries to upstream resolvers, resolve iteratively, and serve authoritative zone data. Start locally, then adapt listeners and access controls to your own network.",
    href: "/configure",
    label: "Find your starting point",
  },
  {
    question: "Is encrypted DNS the same as DNSSEC?",
    answer:
      "They solve different problems. DoH, DoT, DoQ, and ODoH protect DNS transport. DNSSEC validates signed DNS data. NothingDNS lets you configure them independently.",
    href: "/docs/encrypted-dns",
    label: "Explore encrypted DNS",
  },
  {
    question: "Can I automate management?",
    answer:
      "Use dnsctl, the REST management API, or the official Python, TypeScript, Go, C#, and Java SDKs. The client libraries manage the server; they do not perform DNS wire-protocol lookups.",
    href: "/docs/sdks",
    label: "Explore client libraries",
  },
  {
    question: "Where do I get a release or report a problem?",
    answer:
      "Download platform binaries with their SHA-256 checksums here, or browse releases on GitHub. Bug reports and contributions belong in the project repository.",
    href: "/download",
    label: "Choose a download",
  },
];

export function CommonQuestions() {
  return (
    <section className="container section faq-section">
      <Reveal>
        <Eyebrow>A LITTLE CLARITY</Eyebrow>
        <h2>
          Good questions.
          <br />
          <span className="muted">Straight answers.</span>
        </h2>
        <p>
          Still curious?
          <br />
          <a href={`${REPO}/issues`} target="_blank" rel="noopener noreferrer">
            Talk to the project
            <ArrowUpRight size={15} />
          </a>
        </p>
      </Reveal>
      <Reveal className="faq-list">
        {faqs.map((faq, index) => (
          <details key={faq.question}>
            <summary>
              <span className="mono">0{index + 1}</span>
              {faq.question}
              <span className="faq-plus" aria-hidden="true">
                +
              </span>
            </summary>
            <div>
              <p>{faq.answer}</p>
              <ArrowLink href={faq.href}>{faq.label}</ArrowLink>
            </div>
          </details>
        ))}
      </Reveal>
    </section>
  );
}
