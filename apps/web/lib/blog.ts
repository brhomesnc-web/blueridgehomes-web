import getDb from "./db";

export type BlogPost = {
  slug: string;
  title: string;
  date: string;
  description: string;
  featuredImage: string;
  tags: string[];
  content: string;
};

type DbPost = {
  slug: string;
  title: string;
  date: string;
  description: string;
  content: string;
  featured_image: string;
  tags: string;
  published: number;
};

function toPost(row: DbPost): BlogPost {
  let tags: string[] = [];
  try { tags = JSON.parse(row.tags); } catch {}
  return {
    slug: row.slug,
    title: row.title,
    date: row.date,
    description: row.description,
    featuredImage: row.featured_image,
    tags,
    content: row.content,
  };
}

export function getAllPosts(): BlogPost[] {
  const db = getDb();
  const rows = db.prepare(
    "SELECT * FROM blog_posts WHERE published = 1 ORDER BY date DESC"
  ).all() as DbPost[];
  return rows.map(toPost);
}

export function getPostBySlug(slug: string): BlogPost | null {
  const db = getDb();
  const row = db.prepare(
    "SELECT * FROM blog_posts WHERE slug = ? AND published = 1"
  ).get(slug) as DbPost | undefined;
  if (!row) return null;
  return toPost(row);
}

export function getAllSlugs(): string[] {
  const db = getDb();
  const rows = db.prepare(
    "SELECT slug FROM blog_posts WHERE published = 1"
  ).all() as { slug: string }[];
  return rows.map((r) => r.slug);
}
