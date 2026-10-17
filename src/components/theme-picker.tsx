"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useTheme } from "next-themes";
import { Check, ChevronDown, Monitor, Moon, Sun } from "lucide-react";

const choices = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;
const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

export function ThemePicker({ onOpen }: { onOpen: () => void }) {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribe,
    clientSnapshot,
    serverSnapshot,
  );
  const [open, setOpen] = useState(false);
  const picker = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId();
  const preference = mounted ? theme : "system";
  const current =
    choices.find((choice) => choice.value === preference) ?? choices[2];
  const Icon = current.icon;

  useEffect(() => {
    if (!open) return;
    picker.current?.querySelector<HTMLInputElement>("input:checked")?.focus();
    function dismiss(event: PointerEvent | FocusEvent) {
      if (
        event.target instanceof Node &&
        !picker.current?.contains(event.target)
      )
        setOpen(false);
    }
    function dismissOnEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      setOpen(false);
      trigger.current?.focus();
    }
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("focusin", dismiss);
    document.addEventListener("keydown", dismissOnEscape);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("focusin", dismiss);
      document.removeEventListener("keydown", dismissOnEscape);
    };
  }, [open]);

  return (
    <div className="theme-picker" ref={picker}>
      <button
        type="button"
        className="theme-trigger"
        ref={trigger}
        aria-label={`Color theme: ${current.label}`}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={open ? id : undefined}
        onClick={() => {
          if (!open) onOpen();
          setOpen(!open);
        }}
      >
        <Icon aria-hidden="true" />
        <span>{current.label}</span>
        <ChevronDown className="theme-chevron" aria-hidden="true" />
      </button>
      {open && (
        <div
          className="theme-panel"
          id={id}
          role="dialog"
          aria-label="Appearance"
        >
          <div className="theme-panel-heading">
            <span>Appearance</span>
            <span className="theme-panel-hint">Your space, your style.</span>
          </div>
          <fieldset className="theme-options">
            <legend className="sr-only">Color theme</legend>
            {choices.map(({ value, label, icon: ChoiceIcon }) => (
              <label className="theme-option" key={value}>
                <input
                  type="radio"
                  name={`${id}-theme`}
                  value={value}
                  checked={current.value === value}
                  onChange={() => setTheme(value)}
                />
                <span
                  className={`theme-preview theme-preview-${value}`}
                  aria-hidden="true"
                >
                  <span className="theme-preview-window">
                    <span className="theme-preview-sidebar" />
                    <span className="theme-preview-content">
                      <i />
                      <i />
                      <i />
                    </span>
                  </span>
                  <span className="theme-choice-icon">
                    <ChoiceIcon />
                  </span>
                  <span className="theme-choice-check">
                    <Check />
                  </span>
                </span>
                <span className="theme-option-label">{label}</span>
              </label>
            ))}
          </fieldset>
          <p className="theme-panel-status" aria-live="polite">
            <Icon aria-hidden="true" />
            {current.value === "system"
              ? "Matches your device’s appearance."
              : `${current.label} mode, just how you like it.`}
          </p>
        </div>
      )}
    </div>
  );
}
