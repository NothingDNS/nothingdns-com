import { ArrowUpRight } from "lucide-react";
import { OxogMark } from "./oxog-mark";

const projects = [
  {
    name: "AGEZT",
    description: "An agentic operating system",
    href: "https://oxog.net/projects/agezt",
  },
  {
    name: "WrongStack",
    description: "AI coding orchestration",
    href: "https://oxog.net/projects/wrongstack",
  },
  {
    name: "WrongTrace",
    description: "Agent observability",
    href: "https://oxog.net/projects/wrongtrace",
  },
  {
    name: "NineDeploy",
    description: "Self-hosted deployment",
    href: "https://oxog.net/projects/ninedeploy",
  },
];

// Shared OXOGNET identity from cobaltdb/cobaltdb-site; see THIRD_PARTY_NOTICES.md.
export function OxogStudio() {
  return (
    <section
      className="oxog-studio-section"
      aria-labelledby="oxog-studio-heading"
    >
      <div className="oxog-studio-card">
        <a
          className="oxog-studio-logo-link"
          href="https://oxog.net/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Visit OXOGNET"
        >
          <OxogMark />
        </a>
        <div className="oxog-studio-copy">
          <span className="eyebrow">THE PEOPLE BEHIND THE ENGINE</span>
          <p>NothingDNS is built and maintained by</p>
          <h2 id="oxog-studio-heading">
            <a
              href="https://oxog.net/"
              target="_blank"
              rel="noopener noreferrer"
            >
              oxog<span>net</span>
              <span className="oxog-studio-dot">.</span>
              <ArrowUpRight size={22} />
            </a>
          </h2>
          <p>
            An independent studio in Estonia building AI agents, developer tools
            and the infrastructure behind them. A shared curiosity. A whole
            ecosystem of ideas.
          </p>
          <a
            className="oxog-studio-explore"
            href="https://oxog.net/projects"
            target="_blank"
            rel="noopener noreferrer"
          >
            Explore the OXOGNET ecosystem
            <ArrowUpRight size={14} />
          </a>
        </div>
        <nav className="oxog-studio-projects" aria-label="More from OXOGNET">
          {projects.map((project) => (
            <a
              key={project.name}
              href={project.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>
                <strong>{project.name}</strong>
                <small>{project.description}</small>
              </span>
              <ArrowUpRight size={14} />
            </a>
          ))}
        </nav>
      </div>
      <div className="oxog-studio-signature">
        <span>OXOGNET OÜ</span>
        <span>Made in Estonia. Built for the world.</span>
      </div>
    </section>
  );
}
