import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { docs, docHref } from "@/lib/docs";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    "/",
    "/technology",
    "/open-source",
    ...docs.map((doc) => docHref(doc.slug)),
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : 0.8,
  }));
}
