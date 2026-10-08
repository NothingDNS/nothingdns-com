"use client";

import { useState } from "react";
import { ArrowUpRight, Monitor, Terminal } from "lucide-react";
import Link from "next/link";
import { installCommands } from "@/lib/site";
import { CopyButton, handleTabKeyDown } from "./ui";

export function InstallBox({ expanded = false }: { expanded?: boolean }) {
  const [platform, setPlatform] = useState<keyof typeof installCommands>("Linux / macOS");
  return <div className={`install-box ${expanded ? "expanded" : ""}`}><div className="install-tabs" role="tablist" aria-label="Installation platform">{(Object.keys(installCommands) as (keyof typeof installCommands)[]).map((name) => <button type="button" key={name} role="tab" tabIndex={platform === name ? 0 : -1} onKeyDown={handleTabKeyDown} aria-selected={platform === name} aria-controls="install-command" id={`install-${name.replace(/\W/g, "")}`} onClick={() => setPlatform(name)}>{name === "Windows" ? <Monitor size={14} /> : <Terminal size={14} />}{name}</button>)}</div><div className="install-command" id="install-command" role="tabpanel" aria-labelledby={`install-${platform.replace(/\W/g, "")}`}><span className="terminal-prompt">{platform === "Windows" ? ">" : "$"}</span><pre><code>{installCommands[platform]}</code></pre><CopyButton value={installCommands[platform]} compact={!expanded} /></div><div className="install-footnote"><span>{platform === "Windows" ? "Run in an elevated PowerShell terminal." : platform === "From source" ? "Requires Go 1.26.6+ and Make." : "The script installs and configures NothingDNS."}</span><Link href={expanded ? "/docs#verify" : "/docs"}>{expanded ? "Next: verify your setup" : "Installation guide"}<ArrowUpRight size={13} /></Link></div></div>;
}
