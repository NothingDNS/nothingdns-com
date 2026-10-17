import snapshot from "./project-release.json";

export const projectRelease = snapshot;
export type Platform = "linux" | "darwin" | "windows";
export type Architecture = "amd64" | "arm64";
export const platforms = [
  { id: "linux", label: "Linux" },
  { id: "darwin", label: "macOS" },
  { id: "windows", label: "Windows" },
] as const;
export const sdkLanguages = [
  { name: "TypeScript", path: "typescript" },
  { name: "Python", path: "python" },
  { name: "Go", path: "go" },
  { name: "C#", path: "csharp/NothingDns.Sdk" },
  { name: "Java", path: "java" },
] as const;

export function releaseBinaries(
  platform: Platform,
  architecture: Architecture,
) {
  const suffix = `${platform}-${architecture}${platform === "windows" ? ".exe" : ""}`;
  const server = projectRelease.assets.find(
    (asset) => asset.name === `nothingdns-${suffix}`,
  );
  const cli = projectRelease.assets.find(
    (asset) => asset.name === `dnsctl-${suffix}`,
  );
  if (!server || !cli) throw new Error(`Release target unavailable: ${suffix}`);
  return { server, cli };
}

export function formatBytes(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MiB`;
}

export const releaseDate = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
}).format(new Date(projectRelease.publishedAt));
