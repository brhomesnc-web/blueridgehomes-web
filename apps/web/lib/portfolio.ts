import { query } from "./db";

export type PortfolioProject = {
  id: number;
  slug: string;
  title: string;
  location: string;
  tag: string;
  type: string;
  description: string;
  cover: string;
  images: string[];
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export async function getPublishedProjects(): Promise<PortfolioProject[]> {
  const result = await query<PortfolioProject>(
    "SELECT * FROM portfolio_projects WHERE published = true ORDER BY sort_order ASC"
  );
  return result.rows;
}

export async function getAllProjects(): Promise<PortfolioProject[]> {
  const result = await query<PortfolioProject>(
    "SELECT * FROM portfolio_projects ORDER BY sort_order ASC"
  );
  return result.rows;
}

export async function getProjectBySlug(slug: string): Promise<PortfolioProject | null> {
  // `published = true` is load-bearing, not defensive. getPublishedProjects()
  // filters on it, and that is what feeds BOTH generateStaticParams and the
  // portfolio index — so without the same clause here an unpublished project is
  // absent from every listing yet still renders at 200 to anyone holding the URL.
  // Unlisted is not unpublished.
  const result = await query<PortfolioProject>(
    "SELECT * FROM portfolio_projects WHERE slug = $1 AND published = true",
    [slug]
  );
  return result.rows[0] ?? null;
}
