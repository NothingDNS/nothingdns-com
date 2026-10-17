"use client";

import { useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpRight,
  Check,
  Command,
  Cpu,
  Monitor,
  Terminal,
} from "lucide-react";
import {
  formatBytes,
  platforms,
  projectRelease,
  releaseBinaries,
  type Architecture,
  type Platform,
} from "@/lib/project";
import { handleTabKeyDown } from "@/lib/keyboard";
import { CodeBlock, CopyButton } from "./ui";

export function DownloadSelector() {
  const [platform, setPlatform] = useState<Platform>("linux");
  const [architecture, setArchitecture] = useState<Architecture>("amd64");
  const { server, cli } = releaseBinaries(platform, architecture);
  const command =
    platform === "windows"
      ? `Invoke-WebRequest -Uri '${server.url}' -OutFile .\\nothingdns.exe -ErrorAction Stop\n$expected = '${server.sha256}'\nif ((Get-FileHash .\\nothingdns.exe -Algorithm SHA256).Hash -eq $expected) {\n  .\\nothingdns.exe -version\n} else {\n  throw 'Checksum mismatch'\n}`
      : `curl -fL '${server.url}' -o nothingdns &&\nprintf '%s  nothingdns\\n' '${server.sha256}' | ${platform === "darwin" ? "shasum -a 256" : "sha256sum"} -c - &&\nchmod +x nothingdns &&\n./nothingdns -version`;
  return (
    <div className="download-selector">
      <div className="download-toolbar">
        <div
          className="segmented-tabs"
          role="tablist"
          aria-label="Download operating system"
        >
          {platforms.map(({ id, label }) => {
            const Icon =
              id === "windows" ? Monitor : id === "darwin" ? Command : Terminal;
            return (
              <button
                type="button"
                role="tab"
                key={id}
                id={`download-${id}`}
                aria-controls="download-panel"
                aria-selected={platform === id}
                tabIndex={platform === id ? 0 : -1}
                onKeyDown={handleTabKeyDown}
                onClick={() => {
                  setPlatform(id);
                  setArchitecture(id === "darwin" ? "arm64" : "amd64");
                }}
              >
                <Icon size={17} />
                {label}
              </button>
            );
          })}
        </div>
        <label className="architecture-select">
          <Cpu size={16} />
          <span className="sr-only">Processor architecture</span>
          <select
            aria-label="Processor architecture"
            value={architecture}
            onChange={(event) =>
              setArchitecture(event.target.value as Architecture)
            }
          >
            <option value="amd64">x86_64</option>
            <option value="arm64">
              {platform === "darwin" ? "ARM64 / Apple Silicon" : "ARM64"}
            </option>
          </select>
        </label>
      </div>
      <div
        id="download-panel"
        role="tabpanel"
        aria-labelledby={`download-${platform}`}
      >
        <div className="binary-grid">
          {[
            {
              asset: server,
              title: "The DNS server",
              description:
                "The core, the dashboard, and your network’s next chapter.",
            },
            {
              asset: cli,
              title: "Your command line",
              description: "Inspect, configure, and automate with dnsctl.",
            },
          ].map(({ asset, title, description }, index) => (
            <article
              className={`binary-card ${index === 0 ? "binary-main" : ""}`}
              key={asset.name}
            >
              <div className="binary-card-top">
                <span className="mono">
                  {index === 0 ? "NOTHINGDNS" : "DNSCTL"}
                </span>
                <span className="mono">{formatBytes(asset.size)}</span>
              </div>
              <h2>{title}</h2>
              <p>{description}</p>
              <code className="binary-filename">{asset.name}</code>
              <a
                href={asset.url}
                className={`button ${index === 0 ? "" : "button-secondary"}`}
              >
                <ArrowDownToLine size={18} />
                Download {index === 0 ? "NothingDNS" : "dnsctl"}
                <span>{projectRelease.tag}</span>
              </a>
              <details className="checksum-details">
                <summary>
                  <Check size={14} />
                  SHA-256 checksum
                </summary>
                <div>
                  <code>{asset.sha256}</code>
                  <CopyButton
                    value={asset.sha256}
                    label={`Copy ${index === 0 ? "server" : "CLI"} checksum`}
                    compact
                  />
                </div>
              </details>
            </article>
          ))}
        </div>
        <details className="manual-download">
          <summary>
            Prefer your terminal?
            <ArrowUpRight size={16} />
          </summary>
          <CodeBlock
            code={command}
            label="Download, verify, inspect"
            language={platform === "windows" ? "powershell" : "bash"}
          />
        </details>
      </div>
      <div className="download-notes">
        <span>Raw binaries. No archive to unpack.</span>
        <a href={projectRelease.checksumsUrl}>
          All checksums
          <ArrowUpRight size={14} />
        </a>
      </div>
    </div>
  );
}
