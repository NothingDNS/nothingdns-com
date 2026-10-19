"use client";

import { useEffect, useRef } from "react";
import { useAmbientMotion } from "./ambient-motion";

// Adapted from cobaltdb/cobaltdb-site. See THIRD_PARTY_NOTICES.md.
export function OxogMark() {
  const ref = useRef<SVGSVGElement>(null);
  const { paused } = useAmbientMotion();
  useEffect(() => {
    const symbol = ref.current;
    if (!symbol) return;
    symbol.dataset.motion = "still";
    if (paused) return;
    let visible = !("IntersectionObserver" in window);
    const update = () => {
      symbol.dataset.motion = visible && !document.hidden ? "drawing" : "still";
    };
    const observer = visible
      ? null
      : new IntersectionObserver(([entry]) => {
          visible = entry.isIntersecting;
          update();
        });
    observer?.observe(symbol);
    document.addEventListener("visibilitychange", update);
    update();
    return () => {
      observer?.disconnect();
      document.removeEventListener("visibilitychange", update);
      delete symbol.dataset.motion;
    };
  }, [paused]);

  return (
    <svg
      ref={ref}
      viewBox="0 0 200 130"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className="oxog-mark"
    >
      <path
        d="M93 56 72 35C49 13 14 24 9 53 3 84 23 104 46 103"
        stroke="var(--oxog-pink)"
        strokeWidth="12"
      />
      <path
        d="M146 25c24-7 45 10 47 34 3 26-16 46-39 44-14-1-24-11-41-27"
        stroke="var(--oxog-pink)"
        strokeWidth="12"
      />
      <path
        d="M76 18c30-20 75 1 77 40 1 12-1 24-6 33M53 36c-19 41 14 84 50 79 9-1 16-3 22-7"
        stroke="var(--oxog-purple)"
        strokeWidth="15"
        strokeLinecap="round"
      />
      <path
        d="m74 87 54-51"
        stroke="var(--oxog-pink)"
        strokeWidth="12"
        strokeLinecap="square"
      />
    </svg>
  );
}
