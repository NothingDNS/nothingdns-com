import { defineConfig } from "cf/config";

export default defineConfig({
  accountId: "33eb795c355c8509b532dea332a68632",
  worker: {
    name: "nothingdns-com",
    compatibilityDate: "2026-10-08",
    domains: ["nothingdns.com"],
    workersDev: true,
    assets: {
      htmlHandling: "auto-trailing-slash",
      notFoundHandling: "404-page",
    },
    observability: {
      enabled: true,
      redactQueryString: true,
      logs: { enabled: true },
      traces: { enabled: true, headSamplingRate: 0.1 },
    },
  },
});
