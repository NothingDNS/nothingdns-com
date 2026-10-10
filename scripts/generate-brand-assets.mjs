import { readFile, writeFile, mkdir } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const geometry = JSON.parse(
  await readFile(new URL("src/lib/brand-geometry.json", root), "utf8"),
);
const { wordmark, mark, colors } = geometry;

function svg(viewBox, width, height, title, content) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${viewBox}" preserveAspectRatio="xMidYMid meet" fill-rule="nonzero" role="img" aria-label="NothingDNS"><title>${title}</title>${content}</svg>\n`;
}

function logo(ink, accent) {
  return svg(
    wordmark.viewBox,
    wordmark.width,
    wordmark.height,
    "NothingDNS wordmark",
    `<path fill="${ink}" d="${wordmark.inkPath}"/><g fill="${accent}"><path transform="${wordmark.markTransform}" d="${mark.path}"/><path d="${wordmark.dnsPath}"/></g>`,
  );
}

function symbol(fill) {
  return svg(
    mark.viewBox,
    mark.width,
    mark.height,
    "NothingDNS Ø symbol",
    `<path fill="${fill}" d="${mark.path}"/>`,
  );
}

function avatar(size) {
  return svg(
    "0 0 160 160",
    size,
    size,
    "NothingDNS icon",
    `<rect width="160" height="160" rx="36" fill="${colors.surface}"/><path transform="translate(80 80) scale(.84)" fill="${colors.green}" d="${mark.path}"/>`,
  );
}

const assets = {
  "logo.svg": logo(colors.lightInk, colors.green),
  "logo-light.svg": logo(colors.darkInk, colors.greenOnLight),
  "logo-mono-dark.svg": logo(colors.darkInk, colors.darkInk),
  "logo-mono-light.svg": logo(colors.lightInk, colors.lightInk),
  "mark.svg": symbol(colors.green),
  "mark-light.svg": symbol(colors.greenOnLight),
  "mark-mono-dark.svg": symbol(colors.darkInk),
  "mark-mono-light.svg": symbol(colors.lightInk),
  "avatar.svg": avatar(512),
};

await mkdir(new URL("public/brand/", root), { recursive: true });
for (const [name, source] of Object.entries(assets)) {
  await writeFile(new URL(`public/brand/${name}`, root), source);
}
await writeFile(new URL("src/app/icon.svg", root), avatar(64));
console.log(`Generated ${Object.keys(assets).length} brand SVGs and the favicon.`);
