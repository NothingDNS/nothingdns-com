export const AMBIENT_MOTION_KEY = "nothingdns:ambient-motion";

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
