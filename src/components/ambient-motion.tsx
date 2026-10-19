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
  BACKGROUND_MOTION_KEY,
  POINTER_EFFECTS_KEY,
  createAmbientPreference,
} from "@/lib/ambient-preference";

const AmbientMotionContext = createContext({
  paused: true,
  ready: false,
  toggle: () => {},
  pointerEnabled: false,
  pointerReady: false,
  togglePointer: () => {},
});

function useMotionPreference(key: string) {
  // Stay still during SSR/hydration; read saved/device preferences before starting.
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const preference = useRef<ReturnType<typeof createAmbientPreference> | null>(
    null,
  );
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const setting = createAmbientPreference({
      read: () => window.localStorage.getItem(key),
      write: (value) => window.localStorage.setItem(key, value),
      reduced: () => media.matches,
    });
    preference.current = setting;
    setEnabled(setting.load());
    const systemChange = () => setEnabled(setting.current());
    const storageChange = (event: StorageEvent) => {
      if (event.key !== null && event.key !== key) return;
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
  }, [key]);
  const toggle = useCallback(() => {
    const setting = preference.current;
    if (setting) setEnabled(setting.toggle());
  }, []);
  return { enabled: enabled === true, ready: enabled !== null, toggle };
}

export function AmbientMotionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const background = useMotionPreference(BACKGROUND_MOTION_KEY);
  const pointer = useMotionPreference(POINTER_EFFECTS_KEY);
  useEffect(() => {
    document.documentElement.dataset.ambientMotion = background.enabled
      ? "on"
      : "off";
    document.documentElement.dataset.mouseEffects =
      background.enabled && pointer.enabled ? "on" : "off";
  }, [background.enabled, pointer.enabled]);
  const value = useMemo(
    () => ({
      paused: !background.enabled,
      ready: background.ready,
      toggle: background.toggle,
      pointerEnabled: pointer.enabled,
      pointerReady: pointer.ready,
      togglePointer: pointer.toggle,
    }),
    [
      background.enabled,
      background.ready,
      background.toggle,
      pointer.enabled,
      pointer.ready,
      pointer.toggle,
    ],
  );
  return (
    <AmbientMotionContext.Provider value={value}>
      {children}
    </AmbientMotionContext.Provider>
  );
}

export const useAmbientMotion = () => useContext(AmbientMotionContext);

export function HeaderMotionToggle() {
  const { pointerEnabled, pointerReady, togglePointer } = useAmbientMotion();
  const label = pointerEnabled
    ? "Disable mouse effects"
    : "Enable mouse effects";
  const Icon = pointerEnabled ? Mouse : MouseOff;
  return (
    <div className="header-motion">
      <button
        className="motion-trigger"
        type="button"
        aria-pressed={pointerEnabled}
        aria-label={label}
        disabled={!pointerReady}
        onClick={togglePointer}
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
