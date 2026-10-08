import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocsBrowser } from "@/components/docs-browser";
import { docs } from "@/lib/docs";

export function generateStaticParams() {
  return docs
    .filter((doc) => doc.slug !== "quick-start")
    .map((doc) => ({ slug: doc.slug }));
}
export const dynamicParams = false;
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = docs.find((entry) => entry.slug === slug);
  return {
    title: doc?.label || "Documentation",
    description: doc?.description,
    alternates: { canonical: `/docs/${slug}` },
  };
}
export default async function DocPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = docs.find(
    (entry) => entry.slug === slug && entry.slug !== "quick-start",
  );
  if (!doc) notFound();
  return <DocsBrowser doc={doc} />;
}
