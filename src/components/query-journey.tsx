"use client";

import { useState } from "react";
import { handleTabKeyDown } from "@/lib/keyboard";
import {
  ArrowRight,
  Database,
  Globe2,
  ShieldCheck,
  Waypoints,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

const stages = [
  {
    icon: ShieldCheck,
    name: "Policy",
    label: "YOUR RULES FIRST",
    description:
      "Access controls, response policies, and blocklists decide which queries belong on your network. Recursion can be restricted to trusted clients.",
    code: "query → ACL / RPZ / blocklist",
  },
  {
    icon: Database,
    name: "Cache",
    label: "MAKE THE MOST OF WHAT YOU KNOW",
    description:
      "A built-in cache holds answers for their lifetime. Prefetching can refresh popular entries, and stale answers can keep things moving when upstreams are unavailable.",
    code: "cache hit → answer from memory",
  },
  {
    icon: Waypoints,
    name: "Resolve",
    label: "FIND THE RIGHT ANSWER",
    description:
      "Serve your authoritative zones, forward to configured upstreams, or use iterative resolution. QNAME minimization reduces the information shared along the way.",
    code: "zone / upstream / iterative resolver",
  },
  {
    icon: Globe2,
    name: "Verify",
    label: "TRUST THE RESPONSE",
    description:
      "DNSSEC validation checks signed responses. Your own authoritative zones can be signed too, with keys and signing settings you control.",
    code: "DNSSEC validation → response",
  },
];

export function QueryJourney() {
  const [active, setActive] = useState(0);
  return (
    <div className="journey">
      <div className="journey-top mono">
        <span>
          <span className="small-dot" />
          AN ILLUSTRATED QUERY PATH
        </span>
        <span>01 → 04</span>
      </div>
      <div
        className="journey-stages"
        role="tablist"
        aria-label="DNS query stages"
      >
        {stages.map(({ icon: Icon, name }, i) => (
          <div className="journey-step-wrap" key={name}>
            <button
              type="button"
              role="tab"
              tabIndex={active === i ? 0 : -1}
              onKeyDown={handleTabKeyDown}
              id={`stage-${i}`}
              aria-selected={active === i}
              aria-controls="stage-panel"
              onClick={() => setActive(i)}
              className={`journey-step ${active === i ? "selected" : ""}`}
            >
              <span className="mono">0{i + 1}</span>
              <Icon size={27} />
              <strong>{name}</strong>
            </button>
            {i < stages.length - 1 && (
              <ArrowRight className="journey-arrow" size={18} />
            )}
          </div>
        ))}
      </div>
      <div id="stage-panel" role="tabpanel" aria-labelledby={`stage-${active}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            className="journey-detail"
            initial={{ opacity: 0, y: 7 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -7 }}
            transition={{ duration: 0.15 }}
          >
            <div>
              <span className="mono accent-text">{stages[active].label}</span>
              <p>{stages[active].description}</p>
            </div>
            <code>{stages[active].code}</code>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
