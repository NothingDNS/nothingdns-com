import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Box,
  Cable,
  Check,
  Fingerprint,
  Globe2,
  Layers3,
  LockKeyhole,
  Radio,
  ShieldCheck,
  Terminal,
  Waypoints,
} from "lucide-react";
import { NetworkGlobe } from "@/components/globe";
import { DashboardDemo } from "@/components/dashboard-demo";
import { ArrowLink, Eyebrow, Reveal } from "@/components/ui";
import { InstallBox } from "@/components/install";
import { CallToAction } from "@/components/cta";
import { GitHubIcon } from "@/components/brand";
import { REPO } from "@/lib/site";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function Home() {
  return (
    <>
      <section className="hero container">
        <div className="hero-copy">
          <Reveal>
            <Link href="/open-source" className="hero-announcement">
              <span className="small-dot" />
              <span>OPEN SOURCE. OPEN POSSIBILITIES.</span>
              <ArrowUpRight size={13} />
            </Link>
            <h1>
              Less noise.
              <br />
              More <span className="hero-serif">network.</span>
            </h1>
            <p className="hero-description">
              A powerful DNS server. A quieter internet.
              <br />
              Secure, shape, and own your network with one
              <br className="desktop-break" /> self-contained, open-source
              binary.
            </p>
            <div className="button-row">
              <Link href="/docs" className="button">
                Take control
                <ArrowUpRight size={18} />
              </Link>
              <a
                href={REPO}
                className="button button-secondary"
                target="_blank"
                rel="noopener noreferrer"
              >
                <GitHubIcon size={18} />
                View on GitHub
              </a>
            </div>
            <div className="hero-fineprint">
              <span>
                <Check size={13} />
                Self-hosted
              </span>
              <span>
                <Check size={13} />
                No subscriptions
              </span>
              <span>
                <Check size={13} />
                MIT licensed
              </span>
            </div>
          </Reveal>
        </div>
        <Reveal className="hero-visual" delay={0.1}>
          <NetworkGlobe />
        </Reveal>
        <div className="hero-bottom mono">
          <a href="#built-different">
            SCROLL TO DISCOVER
            <ArrowDown size={13} />
          </a>
          <span>DNS, WITHOUT THE BAGGAGE.</span>
        </div>
      </section>
      <div className="trust-strip">
        <div className="container">
          <span className="trust-intro mono">
            SMALL FOOTPRINT.
            <br />
            BIG POSSIBILITIES.
          </span>
          <span>
            <Box size={19} />
            One Go binary
          </span>
          <span>
            <LockKeyhole size={19} />
            Encrypted transports
          </span>
          <span>
            <Globe2 size={19} />
            Your infrastructure
          </span>
          <span>
            <GitHubIcon size={19} />
            Always open source
          </span>
        </div>
      </div>
      <section className="section container" id="built-different">
        <Reveal className="section-heading">
          <div>
            <Eyebrow number="01">BUILT DIFFERENT</Eyebrow>
            <h2>
              Everything DNS.
              <br />
              <span className="muted">Nothing you don’t need.</span>
            </h2>
          </div>
          <p>
            From your home lab to your production stack.
            <br />
            One thoughtfully connected toolkit, without
            <br className="desktop-break" /> a pile of moving parts.
          </p>
        </Reveal>
        <div className="feature-grid">
          <Reveal className="feature-card feature-encryption">
            <div className="feature-card-top">
              <span className="card-icon">
                <LockKeyhole size={20} />
              </span>
              <span className="mono card-index">01 / PRIVACY</span>
            </div>
            <div className="encryption-art" aria-hidden="true">
              <div className="encryption-line" />
              <div className="encryption-node">
                <Fingerprint size={24} />
              </div>
              <span className="encryption-packet packet-one" />
              <div className="encryption-node main-node">
                <ShieldCheck size={29} />
              </div>
              <span className="encryption-packet packet-two" />
              <div className="encryption-node">
                <Globe2 size={24} />
              </div>
            </div>
            <h3>
              Your queries.
              <br />
              For your eyes.
            </h3>
            <p>
              DoH, DoT, DoQ, and ODoH. Modern encrypted transports, with DNSSEC
              to verify the answer.
            </p>
            <ArrowLink href="/technology#encrypted">
              Explore encrypted DNS
            </ArrowLink>
          </Reveal>
          <Reveal className="feature-card feature-policy" delay={0.08}>
            <div className="feature-card-top">
              <span className="card-icon">
                <ShieldCheck size={20} />
              </span>
              <span className="mono card-index">02 / CONTROL</span>
            </div>
            <div className="policy-art mono" aria-hidden="true">
              <div>
                <span className="policy-domain">ads.example.net</span>
                <span className="policy-blocked">BLOCKED</span>
              </div>
              <div>
                <span className="policy-domain">your.next.idea</span>
                <span className="policy-allowed">WELCOME</span>
              </div>
              <div>
                <span className="policy-domain">track.example.net</span>
                <span className="policy-blocked">BLOCKED</span>
              </div>
            </div>
            <h3>
              A filter for the noise.
              <br />
              Not the possibilities.
            </h3>
            <p>
              Shape your traffic with blocklists, response policies, and access
              controls. Your rules come first.
            </p>
            <ArrowLink href="/technology#policy">
              Meet your policy engine
            </ArrowLink>
          </Reveal>
          <Reveal className="feature-card feature-scale" delay={0.16}>
            <div className="feature-card-top">
              <span className="card-icon">
                <Waypoints size={20} />
              </span>
              <span className="mono card-index">03 / RESILIENCE</span>
            </div>
            <div className="cluster-art" aria-hidden="true">
              <svg viewBox="0 0 260 130">
                <path d="M130 65L40 26M130 65L220 26M130 65L40 106M130 65L220 106" />
                <circle cx="130" cy="65" r="24" />
                <circle cx="40" cy="26" r="14" />
                <circle cx="220" cy="26" r="14" />
                <circle cx="40" cy="106" r="14" />
                <circle cx="220" cy="106" r="14" />
              </svg>
              <Layers3 className="cluster-center" size={21} />
            </div>
            <h3>
              Start small.
              <br />
              Stay connected.
            </h3>
            <p>
              Built-in storage, zone transfers, and gossip or Raft clustering.
              Grow into a network that fits.
            </p>
            <ArrowLink href="/technology#resilience">
              See the architecture
            </ArrowLink>
          </Reveal>
        </div>
      </section>
      <section className="section control-section">
        <div className="container">
          <Reveal className="section-heading">
            <div>
              <Eyebrow number="02">A LITTLE CLARITY</Eyebrow>
              <h2>
                Meet your network.
                <br />
                <span className="muted">Really meet it.</span>
              </h2>
            </div>
            <div>
              <p>
                A built-in dashboard that brings your DNS into focus.
                <br />
                Follow queries, manage zones, and see your policies
                <br className="desktop-break" /> at work. No extra service to
                wire up.
              </p>
              <ArrowLink href="/technology#management">
                Explore the control center
              </ArrowLink>
            </div>
          </Reveal>
          <Reveal>
            <DashboardDemo />
          </Reveal>
          <div className="dashboard-caption mono">
            <span>
              <span className="small-dot" />
              TRY THE TABS AND FILTER SWITCH
            </span>
            <span>ILLUSTRATIVE DATA · YOUR INSTANCE, YOUR METRICS</span>
          </div>
        </div>
      </section>
      <section className="section container protocol-section">
        <Reveal className="protocol-layout">
          <div>
            <Eyebrow number="03">SPEAKS YOUR LANGUAGE</Eyebrow>
            <h2>
              Old foundations.
              <br />
              <span className="hero-serif accent-text">New possibilities.</span>
            </h2>
            <p>
              Standards where they matter. Flexibility where you need it.
              NothingDNS brings the DNS essentials and modern protocols
              together.
            </p>
            <ArrowLink href="/technology">Under the hood</ArrowLink>
          </div>
          <div className="protocol-list">
            {[
              {
                icon: Cable,
                label: "The essentials",
                sub: "UDP · TCP · Authoritative · Recursive",
                badge: "FOUNDATION",
              },
              {
                icon: LockKeyhole,
                label: "Private by design",
                sub: "DoH · DoT · DoQ · ODoH",
                badge: "ENCRYPTED",
              },
              {
                icon: ShieldCheck,
                label: "Answers you can trust",
                sub: "DNSSEC validation & zone signing",
                badge: "VERIFIED",
              },
              {
                icon: Radio,
                label: "Ready for what’s next",
                sub: "DNS64 · SVCB / HTTPS · IDNA",
                badge: "MODERN",
              },
            ].map(({ icon: Icon, label, sub, badge }) => (
              <div className="protocol-row" key={label}>
                <span className="protocol-icon">
                  <Icon size={21} />
                </span>
                <div>
                  <h3>{label}</h3>
                  <p>{sub}</p>
                </div>
                <span className="mono protocol-badge">{badge}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </section>
      <section className="section container quickstart-section">
        <Reveal className="section-heading">
          <div>
            <Eyebrow number="04">LESS SETUP. MORE DOING.</Eyebrow>
            <h2>
              Your next good decision.
              <br />
              <span className="muted">One command away.</span>
            </h2>
          </div>
          <div className="quickstart-stamp">
            <Terminal size={23} />
            <span className="mono">
              LINUX. MACOS. WINDOWS.
              <br />
              MAKE YOURSELF AT HOME.
            </span>
          </div>
        </Reveal>
        <Reveal>
          <InstallBox />
        </Reveal>
        <div className="quickstart-bottom">
          <span>
            Prefer containers? Docker and Kubernetes deployment assets are in
            the repository.
          </span>
          <Link href="/docs#docker">
            Explore deployment options
            <ArrowRight size={15} />
          </Link>
        </div>
      </section>
      <CallToAction />
    </>
  );
}
