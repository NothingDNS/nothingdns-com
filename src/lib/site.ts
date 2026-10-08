export const REPO = "https://github.com/nothingdns/nothingdns";
export const SOURCE = `${REPO}/blob/main`;
export const SITE_URL = "https://nothingdns.com";

export const navigation = [
  { href: "/technology", label: "Technology" },
  { href: "/docs", label: "Documentation" },
  { href: "/open-source", label: "Open source" },
];

export const installCommands = {
  "Linux / macOS": "curl -fsSL https://raw.githubusercontent.com/NothingDNS/NothingDNS/main/install.sh | bash",
  Windows: "irm https://raw.githubusercontent.com/NothingDNS/NothingDNS/main/install.ps1 | iex",
  "From source": "git clone https://github.com/NothingDNS/NothingDNS.git\ncd NothingDNS\nmake build",
};
