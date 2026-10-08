"use client";

import { motion } from "motion/react";
import { ArrowUpRight, Check, Copy } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";

export function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
  if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
  const tabs = Array.from(event.currentTarget.closest('[role="tablist"]')?.querySelectorAll<HTMLButtonElement>('[role="tab"]') || []);
  const index = tabs.indexOf(event.currentTarget);
  const next = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
  event.preventDefault();
  tabs[next]?.focus();
  tabs[next]?.click();
}

export function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return <motion.div className={className} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "0px 0px -30px 0px" }} transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}>{children}</motion.div>;
}

export function Eyebrow({ children, number }: { children: React.ReactNode; number?: string }) {
  return <div className="eyebrow">{number && <span className="section-number">{number}</span>}<span className="small-dot" />{children}</div>;
}

export function ArrowLink({ href, children, className = "", external = false }: { href: string; children: React.ReactNode; className?: string; external?: boolean }) {
  return <Link href={href} className={`arrow-link ${className}`} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{children}<ArrowUpRight size={17} /></Link>;
}

export function CopyButton({ value, compact = false }: { value: string; compact?: boolean }) {
  const [state, setState] = useState<"idle" | "copied" | "error">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setState("copied");
    } catch { setState("error"); }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 2500);
  }
  return <button type="button" className={`copy-button ${compact ? "compact" : ""}`} onClick={copy} aria-label={state === "copied" ? "Copied to clipboard" : "Copy command"} title="Copy command">{state === "copied" ? <Check size={15} /> : <Copy size={15} />}{!compact && <span>{state === "copied" ? "Copied" : state === "error" ? "Try again" : "Copy"}</span>}<span className="sr-only" role="status">{state === "error" ? "Clipboard unavailable. Select and copy the command manually." : state === "copied" ? "Copied to clipboard" : ""}</span></button>;
}

export function CodeBlock({ code, label = "Terminal", language = "bash" }: { code: string; label?: string; language?: string }) {
  return <div className="code-block"><div className="code-header"><span><i /><i /><i /></span><span>{label}</span><span>{language}</span></div><div className="code-body"><pre><code>{code}</code></pre><CopyButton value={code} compact /></div></div>;
}
