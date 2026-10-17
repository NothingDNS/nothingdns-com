"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, FileText, Search, X } from "lucide-react";
import { docs, docHref } from "@/lib/docs";

const entries = [
  {
    title: "Download NothingDNS",
    description:
      "Linux, macOS, Windows, ARM64, x86_64, binaries, release checksums",
    href: "/download",
    kind: "PAGE",
  },
  {
    title: "Configuration studio",
    description:
      "Home lab, recursive resolver, authoritative local zones, YAML starter recipe",
    href: "/configure",
    kind: "TOOL",
  },
  {
    title: "Technology",
    description:
      "Architecture, encrypted DNS, policy, clustering and management",
    href: "/technology",
    kind: "PAGE",
  },
  {
    title: "Open source",
    description: "Contributions, MIT license and source code",
    href: "/open-source",
    kind: "PAGE",
  },
  ...docs.map((doc) => ({
    title: doc.label,
    description: `${doc.description} ${doc.sections.map((section) => `${section.title} ${section.body} ${section.code ?? ""}`).join(" ")}`,
    href: docHref(doc.slug),
    kind: "GUIDE",
  })),
];

export function SiteSearch({ onOpen }: { onOpen: () => void }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const results = useRef<(HTMLAnchorElement | null)[]>([]);
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const matches = entries
    .filter((entry) =>
      terms.every((term) =>
        `${entry.title} ${entry.description}`.toLowerCase().includes(term),
      ),
    )
    .sort((first, second) => {
      const score = (entry: (typeof entries)[number]) =>
        terms.reduce(
          (total, term) =>
            total + (entry.title.toLowerCase().includes(term) ? 10 : 0),
          0,
        );
      return score(second) - score(first);
    })
    .slice(0, 10);

  useEffect(() => {
    if (open) {
      dialog.current?.showModal();
      input.current?.focus();
    } else if (dialog.current?.open) dialog.current.close();
  }, [open]);
  useEffect(() => {
    function shortcut(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (dialog.current?.open) setOpen(false);
        else {
          onOpen();
          setQuery("");
          setActive(0);
          setOpen(true);
        }
      }
    }
    document.addEventListener("keydown", shortcut);
    return () => document.removeEventListener("keydown", shortcut);
  }, [onOpen]);

  return (
    <>
      <button
        type="button"
        className="icon-button search-launcher"
        aria-label="Search site and documentation"
        aria-haspopup="dialog"
        onClick={() => {
          onOpen();
          setQuery("");
          setActive(0);
          setOpen(true);
        }}
      >
        <Search size={18} />
      </button>
      <dialog
        ref={dialog}
        className="search-dialog"
        aria-labelledby="site-search-title"
        onCancel={() => setOpen(false)}
        onClose={() => setOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) setOpen(false);
        }}
        onKeyDown={(event) => {
          if (["ArrowDown", "ArrowUp"].includes(event.key) && matches.length) {
            event.preventDefault();
            const index = results.current.findIndex(
              (result) => result === document.activeElement,
            );
            const next =
              index < 0
                ? event.key === "ArrowDown"
                  ? 0
                  : matches.length - 1
                : (index +
                    (event.key === "ArrowDown" ? 1 : -1) +
                    matches.length) %
                  matches.length;
            setActive(next);
            results.current[next]?.focus();
          }
          if (
            event.key === "Enter" &&
            event.target === input.current &&
            matches.length
          ) {
            event.preventDefault();
            results.current[0]?.click();
          }
        }}
      >
        <div className="search-input-row">
          <Search size={21} />
          <label
            className="sr-only"
            id="site-search-title"
            htmlFor="site-search-input"
          >
            Search NothingDNS
          </label>
          <input
            ref={input}
            id="site-search-input"
            type="search"
            value={query}
            autoComplete="off"
            placeholder="Find a guide, a feature, a starting point…"
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
          />
          <button
            type="button"
            aria-label="Close search"
            onClick={() => setOpen(false)}
          >
            <X size={18} />
          </button>
        </div>
        <div className="search-results">
          <span className="mono search-caption">
            {query.trim()
              ? `${matches.length} RESULTS`
              : "GOOD PLACES TO START"}
          </span>
          {matches.length ? (
            matches.map((entry, index) => (
              <Link
                href={entry.href}
                key={entry.href}
                ref={(element) => {
                  results.current[index] = element;
                }}
                className={
                  active === index ? "search-result selected" : "search-result"
                }
                onFocus={() => setActive(index)}
                onClick={() => setOpen(false)}
              >
                <FileText size={18} />
                <span>
                  {entry.title}
                  <small>{entry.kind}</small>
                </span>
                <ArrowUpRight size={16} />
              </Link>
            ))
          ) : (
            <div className="search-no-results" role="status">
              <Search size={26} />
              <strong>No matches yet.</strong>
              <p>Try “zones”, “SDK”, “cache”, or “download”.</p>
            </div>
          )}
        </div>
        <div className="search-hints mono">
          <span>↑ ↓ NAVIGATE</span>
          <span>↵ OPEN</span>
          <span>ESC CLOSE</span>
          <span>⌘ / CTRL K</span>
        </div>
      </dialog>
    </>
  );
}
