import geometry from "./brand-geometry.json";

// One master for the site, standalone SVGs, favicon, and social image.
// Curves and proportions follow the supplied NothingDNS reference artwork.
export const brandPaths = {
  viewBox: geometry.wordmark.viewBox,
  width: geometry.wordmark.width,
  height: geometry.wordmark.height,
  whitePath: geometry.wordmark.inkPath,
  dnsPath: geometry.wordmark.dnsPath,
  markTransform: geometry.wordmark.markTransform,
  markPath: geometry.mark.path,
  markBox: geometry.mark.viewBox,
} as const;

export const brandColors = geometry.colors;
