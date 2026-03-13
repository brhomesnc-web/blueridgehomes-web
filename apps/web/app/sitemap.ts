import type { MetadataRoute } from "next";
import { getAllSlugs } from "@/lib/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.brhomesnc.com";
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
  const blogSlugs = getAllSlugs();
  const blogPages = blogSlugs.map((slug) => ({
    url: `${base}/blog/${slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
    lastModified: now,
  }));
  return [...pages.map((p) => ({ ...p, lastModified: now })), ...projectPages, ...blogPages];
}
