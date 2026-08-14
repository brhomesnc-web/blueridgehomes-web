import type { MetadataRoute } from "next";
import { getAllSlugs } from "@/lib/blog";

// ISR surface — same reason as the blog routes. getAllSlugs() filters
// WHERE published = TRUE, so the sitemap carries identical staleness and needs
// the identical surface for revalidatePath("/sitemap.xml") to act on.
export const revalidate = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://blueridgehomesnc.com";
  const now = new Date().toISOString();
  const pages = [
    { url: base, changeFrequency: "weekly" as const, priority: 1.0 },
    { url: `${base}/services/custom-homes`, changeFrequency: "monthly" as const, priority: 0.9 },
    { url: `${base}/services/remodeling`, changeFrequency: "monthly" as const, priority: 0.9 },
    { url: `${base}/services/additions`, changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${base}/services/icf-construction`, changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${base}/services/consulting`, changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${base}/about`, changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${base}/portfolio`, changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${base}/blog`, changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${base}/contact`, changeFrequency: "yearly" as const, priority: 0.6 },
    { url: `${base}/service-areas`, changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${base}/service-areas/weaverville`, changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${base}/service-areas/hendersonville`, changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${base}/service-areas/black-mountain`, changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${base}/service-areas/mills-river`, changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${base}/service-areas/brevard`, changeFrequency: "monthly" as const, priority: 0.7 },
  ];
  const projectSlugs = [
    "breezeway", "green-river", "195-meadow-creek", "23-woodbine-rd",
    "crown-point", "preston-ct", "stewart-st", "90-covey-dr",
    "duck-dr", "280-settlers-cove", "660-settlers-cove", "robin-porch",
  ];
  const projectPages = projectSlugs.map((slug) => ({
    url: `${base}/portfolio/${slug}`,
    changeFrequency: "yearly" as const,
    priority: 0.5,
    lastModified: now,
  }));
  const blogSlugs = await getAllSlugs();
  const blogPages = blogSlugs.map((slug) => ({
    url: `${base}/blog/${slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
    lastModified: now,
  }));
  return [...pages.map((p) => ({ ...p, lastModified: now })), ...projectPages, ...blogPages];
}
