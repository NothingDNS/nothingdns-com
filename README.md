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

- `/` — product story, interactive DNS hero background, interactive dashboard preview, platform-specific installation
- `/technology` — interactive query path, encrypted transports, policy, resilience, management
- `/docs` — quick start, with five additional guide routes: configuration, encrypted-dns, zones, management, deployment
- `/open-source` — project principles, contribution paths, MIT license, releases
- `/download` — Linux, macOS, Windows and architecture selection; release binaries, file sizes, SHA-256 checksums, and terminal verification commands
- `/configure` — local starter recipes for forwarding, iterative resolution, and test zones; adjustable port/cache/DNSSEC, downloadable YAML and BIND zone file
- `/docs/caching`, `/docs/sdks` — authoritative answer caching and the five official management client libraries

## Design & behavior

The appearance picker provides Light, Dark, and System preview cards, matching the control on cobaltdb.dev. The default follows the device; existing saved preferences are preserved by next-themes. Native radio controls support arrow keys and immediate preview, Escape restores trigger focus, and leaving the panel dismisses it. Preferences persist across navigation and reloads. All animations respect reduced-motion preferences. Navigation, mobile menu, platform tabs, copy actions, query filtering, policy switch, and documentation search are functional. No analytics or third-party tracking is included.

The full-width hero uses a Canvas 2D DNS topology with moving query lanes, root/TLD/zone/cache nodes, local pointer influence, and bounded query/answer/DNSSEC click pulses. Touch swipes, text selection, and controls do not trigger pulses. Effects expire, nearby rapid clicks merge, and a pause control provides a calm frame. `prefers-reduced-motion` renders a still illustration without a frame loop. Offscreen and hidden scenes cancel RAF; resuming resets the clock. Mobile scenes have fewer nodes and a lower frame limit; canvas resolution is capped at DPR 2 and five million pixels. Configuration is centralized in `src/lib/dns-scene.ts`; `pnpm test` covers effect limits, expiry, local influence, tap filtering, resolution budgets, refresh rates, and frame suspension.

`SiteBackground` adds one continuous, viewport-sized SVG field across every route, behind the content. Seeded orbital, packet, circuit, and geometric objects drift at three depths with restrained scroll parallax; only nearby objects respond to the pointer. Blank-area taps create at most four local waves and 32 particles, all expiring within 2.4 seconds. Controls, editable content, selections, swipes, and the hero's separate interaction area are excluded. The fixed SVG has a bounded element count regardless of document length, uses direct SVG attribute updates rather than React frame state, and reuses the shared RAF scheduler. Offscreen objects stop their individual clocks; the entire loop stops when hidden, outside the viewport, paused, or under reduced motion. Mobile uses 12 objects at 24 FPS; desktop uses 32–48 at 30 FPS. Theme colors follow CSS variables. The hero and footer motion controls pause both ambient scenes and persist across client navigation. Geometry and effect limits live in `src/lib/ambient-field.ts`, with integration and readability styles in `src/app/site-background.css`.

Every footer includes the OXOGNET studio section with its original pink/purple SVG symbol, staggered drawing animation on first entry into view, ecosystem links, and studio signature. Reduced motion displays the complete symbol immediately. This shared identity is adapted from the CobaltDB website; its MIT notice is retained in `THIRD_PARTY_NOTICES.md`.

Site-wide search opens from the header or with Ctrl/Command + K. The native modal traps focus, supports arrow-key selection and Escape, and searches pages and guide content. The home page includes release updates, the configuration studio entry point, and an accessible FAQ. New interactions and pages retain the existing restrained palette and fluid rem scale.

Typography and layout use a fluid rem scale: the root grows from 16px at 1280px to 20px at 1920px and 32px at 3840px. Wide-screen reading sizes increase with that scale, alongside the content width, spacing, logos, and controls. Documentation retains a bounded reading column. Tablet and mobile proportions stay at the original baseline.

Branding follows the supplied NØTHINGDNS artwork: the letterforms and Ø mark use clean curves and geometric paths without a font dependency. Electric green (`#00e878`) is reserved for the logo and small status / interaction accents; the light theme uses `#007d46` for readable green lettering. Graphite, white, and silver carry the main surfaces, typography, buttons, and illustrations. The unmodified reference image is retained in `public/brand/`.

`src/lib/brand-geometry.json` is the shared vector master for the React components, exported SVGs, favicon, and social image. Run `pnpm brand:generate` after editing it; development and production builds regenerate the assets automatically. `public/brand/` provides wordmarks for dark and light backgrounds (`logo.svg`, `logo-light.svg`), monochrome wordmarks (`logo-mono-dark.svg`, `logo-mono-light.svg`), matching square Ø symbols (`mark*.svg`), and a square avatar (`avatar.svg`). Wordmarks have transparent clear space around the lettering; symbols use a centered square viewBox so their slash tips remain visible in icon and cropped-image placements. Preserve the SVG's aspect ratio when embedding it.

Dashboard charts, metrics, queries, and zones are **illustrative sample data**, clearly marked in the interface. No DNS server is connected to the marketing website. The 2026-10-11 content update follows upstream commit `da9e905333c4e5a6d59fd7521a6d94dac75b4a78`, the v1.2.19 release, configuration reference, and SDK READMEs. The current source requires Go 1.26.9 according to `go.mod`; this supersedes the older 1.26.6 wording still present in some upstream prose. Links to full repository documentation remain the authoritative reference.

`src/lib/project-release.json` is a checked release snapshot with 12 binary assets and their published SHA-256 values. Run `pnpm project:sync` to refresh it from GitHub; builds use the saved snapshot and make no release API calls. The refresh validates the tag, target coverage, asset URLs, and checksum records before replacing the file. Review upstream changes alongside a refresh. The configuration studio generates local development recipes in the browser. All three default recipes passed `-validate-config` using the official v1.2.19 Windows binary after SHA-256 verification; this checks configuration validity without starting a DNS listener. Use the generated validation command on your own installation. `pnpm test` checks recipe behavior and invalid-port rejection; GitHub Pages CI runs these tests before building.

Metadata includes social previews, a custom favicon, sitemap, robots configuration, and a DNS-themed 404 page. `public/og.png` is the 1200×630 Open Graph and Twitter card, generated from the shared SVG wordmark and a vector network globe by `scripts/generate-social-image.mjs`. Run `pnpm brand:generate` to refresh it; development and production builds do this automatically. The previous `/opengraph-image/nothingdns.png` URL serves the same image for existing shares. The canonical origin is `https://nothingdns.com`; adjust `src/lib/site.ts` when using a different production domain.

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
