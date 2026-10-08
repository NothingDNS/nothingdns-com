import { defineWranglerConfig } from "wrangler/experimental-config";

// Build settings for cf's Wrangler implementation; runtime configuration lives
// in cloudflare.config.ts. Next.js generates every route into this directory.
export default defineWranglerConfig({
  assetsDirectory: "./out",
});
