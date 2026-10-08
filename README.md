# NothingDNS website

A custom, responsive product website for [NothingDNS](https://github.com/nothingdns/nothingdns), built with **Next.js 16.4.0**, **React 19.3**, TypeScript, Motion, and next-themes.

## Run locally

Requires Node.js 22.13+ and pnpm 11. Verified locally with Node.js 24.13.0 and pnpm 11.25.0.

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

Typography and layout use a fluid rem scale: the root grows from 16px at 1280px to 20px at 1920px and 32px at 3840px. Wide-screen reading sizes increase with that scale, alongside the content width, spacing, logos, and controls. Documentation retains a bounded reading column. Tablet and mobile proportions stay at the original baseline.

Branding follows the supplied NØTHINGDNS artwork: the original letterforms and Ø mark are vectorized without a font dependency. Electric green (`#00e878`) is reserved for the logo and small status / interaction accents. Graphite, white, and silver carry the main surfaces, typography, buttons, and illustrations; the light theme uses a darker green for small active states. Reusable transparent SVG wordmarks and the mark are in `public/brand/`; the unmodified reference image is retained there as well.

Dashboard charts, metrics, queries, and zones are **illustrative sample data**, clearly marked in the interface. No DNS server is connected to the marketing website. Product claims and installation guidance were checked against the repository README, quick start, and example configuration on 2026-10-08. Links to full repository documentation remain the authoritative reference.

Metadata includes social previews, a custom favicon, sitemap, robots configuration, and a DNS-themed 404 page. The canonical origin is `https://nothingdns.com`; adjust `src/lib/site.ts` when using a different production domain.

## Deployment

The app can run on a Node.js host or a compatible Next.js platform such as Vercel. For a standard server, use `pnpm build` followed by `pnpm start`. The provided scripts bind to `127.0.0.1` for local preview; put the server behind a reverse proxy or pass the appropriate hostname when deploying to your own infrastructure.

This checkout contains the website source; no hosting account, live DNS configuration, or NothingDNS server is required to preview it.
