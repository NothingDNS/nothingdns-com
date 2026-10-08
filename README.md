# NothingDNS website

A custom, responsive product website for [NothingDNS](https://github.com/nothingdns/nothingdns), built with **Next.js 16.4.0**, **React 19.3**, TypeScript, Motion, and next-themes.

## Run locally

Requires Node.js 22.13+ and pnpm 11. Verified locally with Node.js 24.13.0 and pnpm 11.25.0.

```sh
pnpm install
pnpm dev
```

Open http://127.0.0.1:3000 for development. To preview the exported site with Cloudflare's local asset server:

```sh
pnpm typecheck
pnpm build
pnpm start
```

The static preview runs at http://127.0.0.1:3002.

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

### GitHub Pages

`.github/workflows/deploy-pages.yml` builds and publishes the static site on pushes to `main`, or when run manually from the Actions tab. It uses Node.js 24.13.0 and the pnpm version declared in `package.json`, installs from the frozen lockfile, runs typechecking, and uploads `out/` with the official GitHub Pages actions. It checks the Pages custom domain against `public/CNAME` before building to avoid publishing root-relative assets under a repository path. The deploy job runs only for `main` and uses the `github-pages` environment and the built-in GitHub token; no personal token or Cloudflare credentials are needed.

`public/CNAME` contains `nothingdns.com` and is copied to the artifact root. `public/.nojekyll` keeps the export compatible with static hosting. The export uses directory index pages for direct access to nested routes, and the generated social image has a `.png` extension so Pages serves its correct content type. Custom-domain assets use the domain root, without a repository `basePath`.

One-time repository setup:

1. In **Settings → Pages**, set **Source** to **GitHub Actions**.
2. Set **Custom domain** to **nothingdns.com**. With Actions publishing, GitHub uses this repository setting rather than the artifact's `CNAME` file. See [GitHub's custom-domain guide](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).
3. To move production traffic from the existing Cloudflare Worker to Pages, remove the Worker's `nothingdns.com` custom-domain mapping, then set the apex `A` records to `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, and `185.199.111.153`. Keep the email `MX` and `TXT` records. Enable **Enforce HTTPS** in Pages once its certificate is ready.

### Cloudflare Workers

The site uses Next.js static export and Cloudflare Workers Static Assets. All pages and metadata are generated into `out/`; no Node.js server is needed in production. Cloudflare serves clean page URLs, the custom 404 page, and immutable Next.js assets.

`cloudflare.config.ts` targets Worker `nothingdns-com` at `https://nothingdns.com` in the domain owner's Cloudflare account. `wrangler.config.ts` specifies the static asset directory. Runtime logs and sampled traces are enabled; query strings are redacted.

The initial release was published on 2026-10-08. The alternate live address is https://nothingdns-com.ersinkoc.workers.dev. The production domain's HTTPS certificate, all nine pages, metadata, custom 404, and 88 asset paths were verified after upload. Theme switching and client navigation to a documentation guide were also checked in the live Worker preview. A resolver can temporarily retain a negative DNS answer from before the new domain binding.

```sh
pnpm deploy:check
pnpm exec cf auth login
pnpm deploy
```

Complete Cloudflare CLI sign-in yourself using the account that owns the domain. The initial publication can also use an authenticated Cloudflare API connection; that connection does not sign the local CLI in. No credentials are stored in this repository.

The build command explicitly produces Cloudflare Build Output before `cf deploy --prebuilt`, preserving Next.js static export without a runtime framework adapter. Both `out/` and `.cloudflare/` are generated and ignored. Existing email DNS records are independent of the website's Worker custom domain.
