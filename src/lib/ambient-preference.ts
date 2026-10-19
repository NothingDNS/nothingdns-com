// Preserve the existing mouse-button choice; it no longer pauses ambient motion.
export const POINTER_EFFECTS_KEY = "nothingdns:ambient-motion";
export const BACKGROUND_MOTION_KEY = "nothingdns:background-motion";

const parse = (value: string | null) =>
  value === "on" ? true : value === "off" ? false : null;

/** An explicit choice wins over the device default, even if storage is unavailable. */
export function createAmbientPreference(environment: {
  read: () => string | null;
  write: (value: string) => void;
  reduced: () => boolean;
}) {
  let choice: boolean | null = null;
  const current = () => choice ?? !environment.reduced();
  return {
    current,
    load() {
      try {
        choice = parse(environment.read());
      } catch {
        choice = null;
      }
      return current();
    },
    sync(value: string | null) {
      choice = parse(value);
      return current();
    },
    toggle() {
      choice = !current();
      try {
        environment.write(choice ? "on" : "off");
      } catch {
        // Private browsing / blocked storage still permits a session-only choice.
      }
      return current();
    },
  };
}
