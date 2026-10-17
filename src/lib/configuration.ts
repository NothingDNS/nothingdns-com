export const configurationPresets = [
  {
    id: "forwarder",
    label: "Home lab",
    title: "A little clarity at home.",
    description:
      "Cache answers and forward queries to upstream resolvers. A small starting point for your own network.",
    path: ["Your device", "NothingDNS", "Upstream DNS"],
  },
  {
    id: "recursive",
    label: "Recursive resolver",
    title: "Find the answer yourself.",
    description:
      "Resolve iteratively from the DNS hierarchy, with QNAME minimization. No forwarding upstream is configured.",
    path: ["Your device", "NothingDNS", "DNS hierarchy"],
  },
  {
    id: "authoritative",
    label: "Local zone",
    title: "Give your test domain a home.",
    description:
      "Serve an example.test zone from a BIND-format file, while forwarding other names to upstream resolvers.",
    path: ["Your device", "NothingDNS", "Your zone file"],
  },
] as const;

export type ConfigurationPreset = (typeof configurationPresets)[number]["id"];
export type ConfigurationOptions = {
  preset: ConfigurationPreset;
  port: string;
  cache: boolean;
  dnssec: boolean;
};

export function validatePort(value: string): string | null {
  if (!/^\d+$/.test(value) || Number(value) < 1 || Number(value) > 65535)
    return "Choose a whole-number port from 1 to 65535.";
  return null;
}

export function createConfiguration(options: ConfigurationOptions): string {
  const error = validatePort(options.port);
  if (error) throw new Error(error);
  if (!configurationPresets.some((preset) => preset.id === options.preset))
    throw new Error("Unknown configuration preset");
  const parts = [
    `# NothingDNS local starter configuration\nserver:\n  port: ${Number(options.port)}\n  bind:\n    - 127.0.0.1`,
    `cache:\n  enabled: ${options.cache}\n  size: 10000`,
    `resolution:\n  recursive: ${options.preset === "recursive"}\n  timeout: 5s\n  qname_minimization: true`,
    `dnssec:\n  enabled: ${options.dnssec}\n  trust_anchor: ""`,
  ];
  if (options.preset !== "recursive")
    parts.push("upstream:\n  servers:\n    - 1.1.1.1:53\n    - 8.8.8.8:53");
  if (options.preset === "authoritative")
    parts.push("zones:\n  - ./example.test.zone");
  return parts.join("\n\n") + "\n";
}

export const starterZone =
  "$ORIGIN example.test.\n$TTL 300\n@ IN SOA ns.example.test. hostmaster.example.test. (\n  2026101101 3600 900 1209600 300\n)\n@   IN NS    ns.example.test.\nns  IN A     127.0.0.1\n@   IN A     192.0.2.10\nwww IN CNAME example.test.\n";
