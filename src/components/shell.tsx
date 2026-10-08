"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { ArrowUpRight, Menu, Moon, Sun, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { BrandWordmark, GitHubIcon } from "./brand";
import { navigation, REPO, SOURCE } from "@/lib/site";

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <button
      className="icon-button theme-toggle"
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="Toggle light and dark theme"
    >
      <Sun className="sun-icon" size={18} />
      <Moon className="moon-icon" size={18} />
    </button>
  );
}

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const background = Array.from(
      document.querySelectorAll<HTMLElement>("main, footer"),
    );
    const inertStates = background.map((element) => element.inert);
    background.forEach((element) => {
      element.inert = true;
    });
    const focusFrame = requestAnimationFrame(() =>
      navRef.current?.querySelector<HTMLAnchorElement>("a")?.focus(),
    );
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
      if (event.key !== "Tab") return;
      const controls = [
        menuRef.current,
        ...Array.from(
          navRef.current?.querySelectorAll<HTMLAnchorElement>("a[href]") || [],
        ),
      ].filter(Boolean) as HTMLElement[];
      const first = controls[0],
        last = controls[controls.length - 1];
      if (
        (event.shiftKey && document.activeElement === first) ||
        (!event.shiftKey && document.activeElement === last) ||
        !controls.includes(document.activeElement as HTMLElement)
      ) {
        event.preventDefault();
        (event.shiftKey ? last : first)?.focus();
      }
    };
    const desktop = window.matchMedia("(min-width: 701px)");
    const resize = () => {
      if (desktop.matches) setOpen(false);
    };
    document.addEventListener("keydown", keydown);
    desktop.addEventListener("change", resize);
    return () => {
      cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previous;
      background.forEach((element, i) => {
        element.inert = inertStates[i];
      });
      document.removeEventListener("keydown", keydown);
      desktop.removeEventListener("change", resize);
      menuRef.current?.focus();
    };
  }, [open]);
  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <Link
            href="/"
            className="brand"
            aria-label="NothingDNS home"
            onClick={() => setOpen(false)}
          >
            <BrandWordmark />
          </Link>
          <nav className="desktop-nav" aria-label="Main navigation">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={pathname === item.href ? "active" : ""}
                aria-current={pathname === item.href ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="header-actions">
            <ThemeToggle />
            <span className="header-divider" />
            <a
              href={REPO}
              className="github-nav"
              aria-label="NothingDNS on GitHub"
              target="_blank"
              rel="noopener noreferrer"
            >
              <GitHubIcon />
              <span>GitHub</span>
              <ArrowUpRight size={14} />
            </a>
            <Link href="/docs" className="button button-small header-cta">
              Get started
              <ArrowUpRight size={15} />
            </Link>
            <button
              ref={menuRef}
              type="button"
              className="icon-button menu-toggle"
              onClick={() => setOpen(!open)}
              aria-expanded={open}
              aria-controls="mobile-navigation"
              aria-label={open ? "Close menu" : "Open menu"}
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>
      <AnimatePresence>
        {open && (
          <motion.nav
            ref={navRef}
            id="mobile-navigation"
            role="dialog"
            aria-modal="true"
            className="mobile-nav"
            aria-label="Mobile navigation"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            <span className="mono mobile-nav-label">EXPLORE NOTHINGDNS</span>
            {[{ href: "/", label: "Overview" }, ...navigation].map(
              (item, i) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={pathname === item.href ? "page" : undefined}
                >
                  <span className="mono">0{i + 1}</span>
                  {item.label}
                  <ArrowUpRight size={24} />
                </Link>
              ),
            )}
            <Link
              href="/docs"
              className="button"
              onClick={() => setOpen(false)}
            >
              Start building
              <ArrowUpRight size={18} />
            </Link>
            <span className="mobile-nav-footer mono">
              YOUR NETWORK. YOUR RULES.
            </span>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div>
            <Link className="brand" href="/" aria-label="NothingDNS home">
              <BrandWordmark />
            </Link>
            <p>Less noise. More network.</p>
            <span className="footer-license mono">
              OPEN SOURCE · MIT LICENSE
            </span>
          </div>
          <div className="footer-links">
            <div>
              <span className="mono">EXPLORE</span>
              <Link href="/technology">Technology</Link>
              <Link href="/docs">Documentation</Link>
              <Link href="/open-source">Open source</Link>
            </div>
            <div>
              <span className="mono">BUILD WITH US</span>
              <a href={REPO} target="_blank" rel="noopener noreferrer">
                GitHub
                <ArrowUpRight size={12} />
              </a>
              <a
                href={`${REPO}/issues`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Report an issue
                <ArrowUpRight size={12} />
              </a>
              <a
                href={`${SOURCE}/CONTRIBUTING.md`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Contribute
                <ArrowUpRight size={12} />
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 NothingDNS. Built for the open internet.</span>
          <span className="footer-note">
            <span className="small-dot" />
            No trackers. Just the essentials.
          </span>
          <a
            href={`${SOURCE}/LICENSE`}
            target="_blank"
            rel="noopener noreferrer"
          >
            MIT License
            <ArrowUpRight size={12} />
          </a>
        </div>
        <div className="footer-wordmark" aria-hidden="true">
          <BrandWordmark />
        </div>
      </div>
    </footer>
  );
}
