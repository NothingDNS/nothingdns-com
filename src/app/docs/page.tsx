import type { Metadata } from "next";
import { DocsBrowser } from "@/components/docs-browser";
import { docs } from "@/lib/docs";

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "Get started with NothingDNS. Installation guides, configuration, encrypted DNS, zones, deployment, and management.",
  alternates: { canonical: "/docs" },
};
export default function DocsPage() {
  return <DocsBrowser doc={docs[0]} />;
}
