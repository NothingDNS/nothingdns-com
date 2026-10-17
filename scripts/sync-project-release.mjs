import { writeFile } from "node:fs/promises";

const response = await fetch(
  "https://api.github.com/repos/NothingDNS/NothingDNS/releases/latest",
  {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "NothingDNS-website",
    },
    signal: AbortSignal.timeout(15000),
  },
);
if (!response.ok)
  throw new Error(`GitHub release lookup failed: ${response.status}`);
const release = await response.json();
if (!/^v\d+\.\d+\.\d+$/.test(release.tag_name))
  throw new Error("Unexpected release tag");
const checksumAsset = release.assets.find(
  (asset) => asset.name === "SHA256SUMS",
);
if (!checksumAsset) throw new Error("Release has no SHA256SUMS asset");
const checksumResponse = await fetch(checksumAsset.browser_download_url, {
  signal: AbortSignal.timeout(15000),
});
if (!checksumResponse.ok)
  throw new Error(`Checksum download failed: ${checksumResponse.status}`);
const checksums = new Map(
  (await checksumResponse.text())
    .trim()
    .split(/\r?\n/)
    .map((line) => {
      const match = line.match(/^([a-f0-9]{64})\s+\*?(.+)$/);
      if (!match) throw new Error("Invalid checksum line");
      return [match[2], match[1]];
    }),
);
const assets = release.assets
  .filter((asset) =>
    /^(nothingdns|dnsctl)-(linux|darwin|windows)-(amd64|arm64)(\.exe)?$/.test(
      asset.name,
    ),
  )
  .map((asset) => {
    const sha256 = checksums.get(asset.name);
    if (
      !sha256 ||
      !asset.browser_download_url.startsWith(
        `https://github.com/NothingDNS/NothingDNS/releases/download/${release.tag_name}/`,
      )
    )
      throw new Error(`Invalid release asset: ${asset.name}`);
    return {
      name: asset.name,
      url: asset.browser_download_url,
      size: asset.size,
      sha256,
    };
  });
if (assets.length !== 12)
  throw new Error("Expected server and CLI binaries for all six targets");
for (const platform of ["linux", "darwin", "windows"]) {
  for (const architecture of ["amd64", "arm64"]) {
    for (const binary of ["nothingdns", "dnsctl"]) {
      const name = `${binary}-${platform}-${architecture}${platform === "windows" ? ".exe" : ""}`;
      if (!assets.some((asset) => asset.name === name))
        throw new Error(`Missing release target: ${name}`);
    }
  }
}
const snapshot = {
  tag: release.tag_name,
  version: release.tag_name.slice(1),
  publishedAt: release.published_at,
  releaseUrl: release.html_url,
  checksumsUrl: checksumAsset.browser_download_url,
  checkedAt: new Date().toISOString(),
  assets,
};
await writeFile(
  new URL("../src/lib/project-release.json", import.meta.url),
  JSON.stringify(snapshot, null, 2) + "\n",
);
console.log(
  `Synced ${snapshot.tag}: ${assets.length} binaries with SHA-256 checksums.`,
);
