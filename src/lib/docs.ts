import { SOURCE } from "./site";

export type DocSection = {
  id: string;
  title: string;
  body: string;
  code?: string;
  language?: string;
  note?: string;
  links?: { label: string; href: string }[];
};
export type Doc = {
  slug: string;
  title: string;
  description: string;
  label: string;
  sections: DocSection[];
  source: string;
};

export const docs: Doc[] = [
  {
    slug: "quick-start",
    title: "A quieter internet starts here.",
    label: "Quick start",
    description:
      "Install NothingDNS, check your first answer, and make the network yours.",
    source: "QUICK_START.md",
    sections: [
      {
        id: "install",
        title: "01. Choose your starting point",
        body: "Install on Linux, macOS, or Windows, or build directly from source. The source build requires Go 1.26.6+ and Make.",
        note: "Review install scripts before running them. The Windows installer requires an elevated PowerShell session. On Linux, the installer can use port 5353 if port 53 is occupied.",
      },
      {
        id: "verify",
        title: "02. Meet your DNS server",
        body: "After installation, check the binary and send a DNS query to your local server. Adjust the query port if your installation uses 5353.",
        code: "nothingdns -version\ndnsctl -version\n\n# Ask your local DNS server\ndig @127.0.0.1 example.com\n\n# If the installer selected port 5353\ndig @127.0.0.1 -p 5353 example.com",
      },
      {
        id: "dashboard",
        title: "03. Open the control center",
        body: "The dashboard uses the HTTP listener, commonly at http://localhost:8080. If your installer has not created your admin account, bootstrap it from the server host. The command reads the password from stdin.",
        code: "dnsctl server bootstrap --username admin",
        note: "On Linux, the installer stores generated credentials in /etc/nothingdns/credentials, readable by root. Keep the dashboard on a trusted interface or behind a reverse proxy with TLS.",
      },
      {
        id: "next",
        title: "04. Make it your own",
        body: "Configure upstreams, add your authoritative zones, choose your policies, and connect monitoring. The example configuration is the starting point for the full schema.",
        links: [
          { label: "Configuration guide", href: "/docs/configuration" },
          { label: "Encrypted DNS", href: "/docs/encrypted-dns" },
          { label: "Deployment options", href: "/docs/deployment" },
        ],
      },
      {
        id: "docker",
        title: "Prefer a container?",
        body: "The repository includes Docker Compose, Kubernetes, and Helm deployment assets. Check the current image access requirements before pulling from GHCR.",
        note: "The repository README currently lists the GHCR container image as private. A GitHub token with read:packages access is required to pull it.",
        links: [
          { label: "Docker & deployment guide", href: "/docs/deployment" },
          { label: "Repository quick start", href: `${SOURCE}/QUICK_START.md` },
        ],
      },
    ],
  },
  {
    slug: "configuration",
    title: "Your network. Your configuration.",
    label: "Configuration",
    description:
      "Start with a small configuration, then add exactly what your network needs.",
    source: "docs/CONFIG_REFERENCE.md",
    sections: [
      {
        id: "minimal",
        title: "Start with the essentials",
        body: "This development example listens on localhost at port 5353, forwards queries to upstream resolvers, and enables the cache. Save it as nothingdns.yaml.",
        code: "server:\n  port: 5353\n  bind:\n    - 127.0.0.1\n\nupstream:\n  servers:\n    - 1.1.1.1:53\n    - 8.8.8.8:53\n\ncache:\n  enabled: true\n  size: 10000",
        language: "yaml",
      },
      {
        id: "validate",
        title: "Validate before you run",
        body: "Use the binary’s configuration validator to check your file, then start the server with the same configuration.",
        code: "nothingdns -validate-config -config ./nothingdns.yaml\nnothingdns -config ./nothingdns.yaml\n\n# Test the local development listener\ndig @127.0.0.1 -p 5353 example.com",
      },
      {
        id: "resolver",
        title: "Choose how you resolve",
        body: "Configure upstream forwarding, or enable iterative resolution with resolution.recursive. Resolution timeouts are configured under resolution.timeout. QNAME minimization is available for iterative resolution.",
        code: "resolution:\n  recursive: false\n  timeout: 5s\n  qname_minimization: true",
        language: "yaml",
        note: "There is no upstream.timeout setting. Use resolution.timeout for both forwarded and iterative queries.",
      },
      {
        id: "reference",
        title: "Go further",
        body: "The full reference covers caching, blocklists, RPZ, access controls, DNSSEC, storage, transports, metrics, and cluster settings. Check the source-aligned example when adding fields.",
        links: [
          {
            label: "Complete configuration reference",
            href: `${SOURCE}/docs/CONFIG_REFERENCE.md`,
          },
          { label: "Example YAML", href: `${SOURCE}/config.example.yaml` },
        ],
      },
    ],
  },
  {
    slug: "encrypted-dns",
    title: "Keep the conversation private.",
    label: "Encrypted DNS",
    description:
      "Choose an encrypted transport, then configure the certificates and listeners it needs.",
    source: "docs/CONFIG_REFERENCE.md",
    sections: [
      {
        id: "transports",
        title: "Choose your transport",
        body: "NothingDNS supports DNS over HTTPS, DNS over TLS, DNS over QUIC, and Oblivious DNS over HTTPS. Each serves a different client and deployment need. Configure only the listeners you intend to expose.",
        links: [
          {
            label: "Transport configuration",
            href: `${SOURCE}/docs/CONFIG_REFERENCE.md`,
          },
        ],
      },
      {
        id: "doh",
        title: "DNS over HTTPS",
        body: "The HTTP listener serves DoH when TLS is configured and doh_enabled is true. Replace the example certificate paths with valid certificates for your server.",
        code: 'server:\n  http:\n    enabled: true\n    bind: "127.0.0.1:8443"\n    tls_cert_file: /etc/nothingdns/tls/server.crt\n    tls_key_file: /etc/nothingdns/tls/server.key\n    doh_enabled: true\n    doh_path: /dns-query',
        language: "yaml",
        note: "The HTTP listener also hosts the management API and dashboard. Plan interface binding, access controls, and reverse-proxy routing together.",
      },
      {
        id: "dnssec",
        title: "Verify the answer with DNSSEC",
        body: "Encrypted transport protects the connection. DNSSEC verifies signed DNS data. Enable validation independently, and use the signing configuration when serving your own signed zones.",
        code: 'dnssec:\n  enabled: true\n  trust_anchor: ""',
        language: "yaml",
        note: "An empty trust_anchor uses the built-in root anchors. Authoritative signing also requires configured signing keys.",
      },
      {
        id: "security",
        title: "Plan your production setup",
        body: "Use the repository’s security and deployment documentation for listener configuration, trusted networks, certificates, and dashboard protection.",
        links: [
          { label: "Security guide", href: `${SOURCE}/docs/SECURITY.md` },
          {
            label: "Production deployment checklist",
            href: `${SOURCE}/docs/DEPLOYMENT_CHECKLIST.md`,
          },
        ],
      },
    ],
  },
  {
    slug: "zones",
    title: "Give your domains a home.",
    label: "Zones & records",
    description:
      "Serve authoritative DNS, manage records, and move zone data between servers.",
    source: "docs/API_ZONES.md",
    sections: [
      {
        id: "files",
        title: "Start with a zone file",
        body: "NothingDNS loads BIND-format zone files. Configure specific files with zones, or use zone_dir for bulk loading. Relative paths are resolved from the server’s working directory.",
        code: "zones:\n  - ./zones/example.com.zone\n\n# Alternatively, load a directory of zone files\n# zone_dir: ./zones",
        language: "yaml",
      },
      {
        id: "cli",
        title: "Inspect with dnsctl",
        body: "List your server’s configured zones and inspect DNS answers from the command line. The CLI reference documents authentication and connection options.",
        code: "dnsctl zone list\ndnsctl dig +dnssec example.com A",
        links: [
          { label: "CLI reference", href: `${SOURCE}/docs/CLI_REFERENCE.md` },
        ],
      },
      {
        id: "transfer",
        title: "Keep zone data connected",
        body: "AXFR and IXFR support full and incremental zone transfers. Slave zones can follow a primary server. Configure transfer access explicitly before enabling it.",
        note: "The transfer allow list also authorizes NOTIFY. Zone transfer over TLS has separate certificate and access requirements.",
        links: [
          {
            label: "Transfer configuration",
            href: `${SOURCE}/docs/CONFIG_REFERENCE.md`,
          },
        ],
      },
      {
        id: "api",
        title: "Manage from the dashboard or API",
        body: "The embedded React dashboard includes zone management. The zone API reference documents record and zone operations for automation.",
        links: [
          { label: "Zone API reference", href: `${SOURCE}/docs/API_ZONES.md` },
          { label: "Management guide", href: "/docs/management" },
        ],
      },
    ],
  },
  {
    slug: "management",
    title: "Click. Script. Connect.",
    label: "Dashboard, CLI & API",
    description:
      "Three ways to work with the same DNS server, and the visibility to understand it.",
    source: "docs/CLI_REFERENCE.md",
    sections: [
      {
        id: "dashboard",
        title: "The embedded dashboard",
        body: "Open your configured HTTP listener to use the dashboard. Manage zones and follow queries with WebSocket streaming. Bootstrap your admin account from the server host if it has not been created.",
        code: "dnsctl server bootstrap --username admin",
        note: "Dashboard authentication can use configured users or the legacy shared bearer token mode. See the security guide for the current setup and session behavior.",
      },
      {
        id: "cli",
        title: "The dnsctl command line",
        body: "Inspect server status, manage zones, and work with the DNS cache. These commands use your configured management endpoint and credentials.",
        code: "dnsctl server status\ndnsctl zone list\ndnsctl cache stats\n\n# Flush cached answers when you intend to\ndnsctl cache flush",
        links: [
          {
            label: "Complete CLI reference",
            href: `${SOURCE}/docs/CLI_REFERENCE.md`,
          },
        ],
      },
      {
        id: "api",
        title: "The REST management API",
        body: "The management API includes OpenAPI / Swagger documentation. Use authenticated calls for protected operations and the health endpoint for a basic availability check.",
        code: "curl http://127.0.0.1:8080/health",
        links: [
          { label: "API reference", href: `${SOURCE}/docs/API_REFERENCE.md` },
        ],
      },
      {
        id: "observe",
        title: "See what’s happening",
        body: "Prometheus metrics, structured audit logs, and query streaming help you observe the running server. Configure the metrics endpoint for your monitoring environment.",
        links: [
          {
            label: "Operations & monitoring",
            href: `${SOURCE}/docs/OPERATIONS.md`,
          },
        ],
      },
    ],
  },
  {
    slug: "deployment",
    title: "Make yourself at home.",
    label: "Deployment",
    description:
      "Run NothingDNS on your own infrastructure, from a single machine to a cluster.",
    source: "docs/OPERATIONS.md",
    sections: [
      {
        id: "binary",
        title: "A self-contained binary",
        body: "The repository provides install scripts for Linux / macOS and Windows, plus release binaries. Verify release checksums before manual installation.",
        links: [
          {
            label: "Latest GitHub release",
            href: "https://github.com/nothingdns/nothingdns/releases/latest",
          },
          { label: "Manual installation", href: `${SOURCE}/QUICK_START.md` },
        ],
      },
      {
        id: "docker",
        title: "Docker Compose",
        body: "The Compose setup includes the DNS server, HTTP dashboard, and persistent data volume. The README currently lists the GHCR image as private, so authenticate with a GitHub token that has read:packages access before pulling.",
        code: "# From the NothingDNS repository checkout\ndocker compose up -d\n\n# Bootstrap an admin from inside the container\ndocker exec -i nothingdns dnsctl server bootstrap --username admin",
        note: "Review the repository’s docker-compose.yml for exposed ports, mounted configuration, and storage before starting it.",
        links: [
          {
            label: "Docker Compose source",
            href: `${SOURCE}/docker-compose.yml`,
          },
          {
            label: "Deployment checklist",
            href: `${SOURCE}/docs/DEPLOYMENT_CHECKLIST.md`,
          },
        ],
      },
      {
        id: "kubernetes",
        title: "Kubernetes & Helm",
        body: "Kubernetes manifests and Helm deployment assets live in the deploy directory. Review values for listeners, persistence, resources, and cluster configuration before adapting them to your environment.",
        links: [
          {
            label: "Deployment assets",
            href: "https://github.com/nothingdns/nothingdns/tree/main/deploy",
          },
        ],
      },
      {
        id: "cluster",
        title: "Connect a cluster",
        body: "Choose gossip / SWIM for eventual consistency or Raft for strong consistency. Configure unique node IDs, peers, persistent cluster data, and encryption keys according to the reference.",
        note: "Each node needs its own data directory. Multi-node communication requires the configured cluster encryption key unless an explicit development-only insecure mode is used.",
        links: [
          {
            label: "Cluster configuration reference",
            href: `${SOURCE}/docs/CONFIG_REFERENCE.md`,
          },
          {
            label: "Backup, health checks & operations",
            href: `${SOURCE}/docs/OPERATIONS.md`,
          },
        ],
      },
    ],
  },
];

export function docHref(slug: string) {
  return slug === "quick-start" ? "/docs" : `/docs/${slug}`;
}
