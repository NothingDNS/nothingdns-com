"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { Pause, Play } from "lucide-react";

const AmbientMotionContext = createContext({ paused: false, toggle: () => {} });

export function AmbientMotionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [paused, setPaused] = useState(false);
  const value = useMemo(
    () => ({ paused, toggle: () => setPaused((p) => !p) }),
    [paused],
  );
  return (
    <AmbientMotionContext.Provider value={value}>
      {children}
    </AmbientMotionContext.Provider>
  );
}

export const useAmbientMotion = () => useContext(AmbientMotionContext);

export function BackgroundMotionToggle() {
  const { paused, toggle } = useAmbientMotion();
  return (
    <button
      className="background-motion-control"
      type="button"
      aria-pressed={paused}
      aria-label={
        paused ? "Resume background animation" : "Pause background animation"
      }
      onClick={toggle}
    >
      {paused ? <Play size={13} /> : <Pause size={13} />}
      <span>{paused ? "Resume motion" : "Pause motion"}</span>
    </button>
  );
}
