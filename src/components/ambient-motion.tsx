"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Mouse, MouseOff, Pause, Play } from "lucide-react";
import {
  AMBIENT_MOTION_KEY,
  createAmbientPreference,
} from "@/lib/ambient-preference";

const AmbientMotionContext = createContext({
  paused: true,
  ready: false,
  toggle: () => {},
});

export function AmbientMotionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Stay still during SSR/hydration; read saved/device preferences before starting.
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const preference = useRef<ReturnType<typeof createAmbientPreference> | null>(
    null,
  );
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const setting = createAmbientPreference({
      read: () => window.localStorage.getItem(AMBIENT_MOTION_KEY),
      write: (value) => window.localStorage.setItem(AMBIENT_MOTION_KEY, value),
      reduced: () => media.matches,
    });
    preference.current = setting;
    setEnabled(setting.load());
    const systemChange = () => setEnabled(setting.current());
    const storageChange = (event: StorageEvent) => {
      if (event.key !== null && event.key !== AMBIENT_MOTION_KEY) return;
      // Ignore sessionStorage events; accessing localStorage can itself be blocked.
      try {
        if (event.storageArea !== window.localStorage) return;
      } catch {
        return;
      }
      setEnabled(setting.sync(event.newValue));
    };
    media.addEventListener("change", systemChange);
    window.addEventListener("storage", storageChange);
    return () => {
      preference.current = null;
      media.removeEventListener("change", systemChange);
      window.removeEventListener("storage", storageChange);
    };
  }, []);
  useEffect(() => {
    document.documentElement.dataset.ambientMotion =
      enabled === true ? "on" : "off";
  }, [enabled]);
  const toggle = useCallback(() => {
    const setting = preference.current;
    if (setting) setEnabled(setting.toggle());
  }, []);
  const value = useMemo(
    () => ({ paused: enabled !== true, ready: enabled !== null, toggle }),
    [enabled, toggle],
  );
  return (
    <AmbientMotionContext.Provider value={value}>
      {children}
    </AmbientMotionContext.Provider>
  );
}

export const useAmbientMotion = () => useContext(AmbientMotionContext);

export function HeaderMotionToggle() {
  const { paused, ready, toggle } = useAmbientMotion();
  const label = paused ? "Animasyonları aç" : "Animasyonları kapat";
  const Icon = paused ? MouseOff : Mouse;
  return (
    <div className="header-motion">
      <button
        className="motion-trigger"
        type="button"
        aria-pressed={!paused}
        aria-label={label}
        disabled={!ready}
        onClick={toggle}
      >
        <Icon size={19} aria-hidden="true" />
        <span className="motion-status" aria-hidden="true" />
      </button>
      <span className="motion-tooltip" aria-hidden="true">
        {label}
      </span>
    </div>
  );
}

export function BackgroundMotionToggle() {
  const { paused, ready, toggle } = useAmbientMotion();
  return (
    <button
      className="background-motion-control"
      type="button"
      aria-pressed={!paused}
      disabled={!ready}
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
