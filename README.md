# NothingDNS website

A custom, responsive product website for [NothingDNS](https://github.com/nothingdns/nothingdns), built with **Next.js 16.4.0**, **React 19.3**, TypeScript, Motion, and next-themes.

## Run locally

Requires Node.js 20.9+ and pnpm 11.

```sh
pnpm install
pnpm dev
```

Open http://127.0.0.1:3000.

```sh
pnpm typecheck
pnpm build
pnpm start
```

## Pages

- `/` — product story, animated network globe, interactive dashboard preview, platform-specific installation
- `/technology` — interactive query path, encrypted transports, policy, resilience, management
- `/docs` — quick start, with five additional guide routes: configuration, encrypted-dns, zones, management, deployment
- `/open-source` — project principles, contribution paths, MIT license, releases

## Design & behavior

Dark and light themes persist locally; the default is dark. All animations respect reduced-motion preferences. The globe suspends rendering when offscreen or the browser is hidden. Navigation, mobile menu, platform tabs, copy actions, query filtering, policy switch, and documentation search are functional. No analytics or third-party tracking is included.

Dashboard charts, metrics, queries, and zones are **illustrative sample data**, clearly marked in the interface. No DNS server is connected to the marketing website. Product claims and installation guidance were checked against the repository README, quick start, and example configuration on 2026-10-08. Links to full repository documentation remain the authoritative reference.

Metadata includes social previews, a custom favicon, sitemap, robots configuration, and a DNS-themed 404 page. The canonical origin is `https://nothingdns.com`; adjust `src/lib/site.ts` when using a different production domain.

## Deployment

The app uses Next.js standalone output and can run on a Node.js host or a compatible Next.js platform. For a standard server, use `pnpm build` followed by `pnpm start`. When deploying standalone output directly, copy `public` (if present) and `.next/static` into the standalone directory as described in the [Next.js output documentation](https://nextjs.org/docs/app/api-reference/config/next-config-js/output).

This checkout contains the website source; no hosting account, live DNS configuration, or NothingDNS server is required to preview it.
