"use client";

import { ArrowUpRight, Check, Copy } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const element = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = element.current;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!node || preference.matches || !("IntersectionObserver" in window))
      return;

    let animation: Animation | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || document.hidden) return;
        observer.disconnect();
        // HTML stays visible until enhancement runs; cancellation restores that base state.
        if (!preference.matches && typeof node.animate === "function") {
          animation = node.animate(
            [
              { opacity: 0.35, transform: "translateY(16px)" },
              { opacity: 1, transform: "none" },
            ],
            {
              duration: 650,
              delay: Math.min(Math.max(delay, 0), 0.5) * 1000,
              easing: "cubic-bezier(.22,1,.36,1)",
            },
          );
        }
      },
      { threshold: 0.05 },
    );
    const stop = () => {
      if (preference.matches || document.hidden) animation?.cancel();
    };
    observer.observe(node);
    preference.addEventListener("change", stop);
    document.addEventListener("visibilitychange", stop);
    return () => {
      observer.disconnect();
      animation?.cancel();
      preference.removeEventListener("change", stop);
      document.removeEventListener("visibilitychange", stop);
    };
  }, [delay]);
  return (
    <div ref={element} className={className}>
      {children}
    </div>
  );
}

export function Eyebrow({
  children,
  number,
}: {
  children: React.ReactNode;
  number?: string;
}) {
  return (
    <div className="eyebrow">
      {number && <span className="section-number">{number}</span>}
      <span className="small-dot" />
      {children}
    </div>
  );
}

export function ArrowLink({
  href,
  children,
  className = "",
  external = false,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  external?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`arrow-link ${className}`}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
      <ArrowUpRight size={17} />
    </Link>
  );
}

export function CopyButton({
  value,
  compact = false,
  label = "Copy command",
}: {
  value: string;
  compact?: boolean;
  label?: string;
}) {
  const [state, setState] = useState<"idle" | "copied" | "error">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setState("copied");
    } catch {
      setState("error");
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 2500);
  }
  return (
    <button
      type="button"
      className={`copy-button ${compact ? "compact" : ""}`}
      onClick={copy}
      aria-label={state === "copied" ? "Copied to clipboard" : label}
      title={label}
    >
      {state === "copied" ? <Check size={15} /> : <Copy size={15} />}
      {!compact && (
        <span>
          {state === "copied"
            ? "Copied"
            : state === "error"
              ? "Try again"
              : "Copy"}
        </span>
      )}
      <span className="sr-only" role="status">
        {state === "error"
          ? "Clipboard unavailable. Select and copy the command manually."
          : state === "copied"
            ? "Copied to clipboard"
            : ""}
      </span>
    </button>
  );
}

export function CodeBlock({
  code,
  label = "Terminal",
  language = "bash",
}: {
  code: string;
  label?: string;
  language?: string;
}) {
  return (
    <div className="code-block">
      <div className="code-header">
        <span>
          <i />
          <i />
          <i />
        </span>
        <span>{label}</span>
        <span>{language}</span>
      </div>
      <div className="code-body">
        <pre
          tabIndex={0}
          role="region"
          aria-label={`${label} code, ${language}`}
        >
          <code>{code}</code>
        </pre>
        <CopyButton value={code} compact />
      </div>
    </div>
  );
}
