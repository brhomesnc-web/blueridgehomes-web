import getDb from "./db";

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
  published: number;
  created_at: string;
  updated_at: string;
};

type RawProject = Omit<PortfolioProject, "images"> & { images: string };

export function getPublishedProjects(): PortfolioProject[] {
  const db = getDb();
  const rows = db.prepare(
    "SELECT * FROM portfolio_projects WHERE published = 1 ORDER BY sort_order ASC"
  ).all() as RawProject[];
  return rows.map((r) => ({ ...r, images: JSON.parse(r.images) }));
}

export function getAllProjects(): PortfolioProject[] {
  const db = getDb();
  const rows = db.prepare(
    "SELECT * FROM portfolio_projects ORDER BY sort_order ASC"
  ).all() as RawProject[];
  return rows.map((r) => ({ ...r, images: JSON.parse(r.images) }));
}

export function getProjectBySlug(slug: string): PortfolioProject | null {
  const db = getDb();
  const row = db.prepare(
    "SELECT * FROM portfolio_projects WHERE slug = ?"
  ).get(slug) as RawProject | undefined;
  if (!row) return null;
  return { ...row, images: JSON.parse(row.images) };
}
