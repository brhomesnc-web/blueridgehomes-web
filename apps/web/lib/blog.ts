import { query } from "./db";

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
  tags: string | string[];
  published: boolean;
};

function toPost(row: DbPost): BlogPost {
  // pg driver returns JSONB as parsed object; handle both for safety
  let tags: string[] = [];
  if (Array.isArray(row.tags)) {
    tags = row.tags;
  } else if (typeof row.tags === "string") {
    try { tags = JSON.parse(row.tags); } catch {}
  }
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

export async function getAllPosts(): Promise<BlogPost[]> {
  const { rows } = await query<DbPost>(
    "SELECT * FROM blog_posts WHERE published = TRUE ORDER BY date DESC"
  );
  return rows.map(toPost);
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const { rows } = await query<DbPost>(
    "SELECT * FROM blog_posts WHERE slug = $1 AND published = TRUE",
    [slug]
  );
  if (rows.length === 0) return null;
  return toPost(rows[0]);
}

export async function getAllSlugs(): Promise<string[]> {
  const { rows } = await query<{ slug: string }>(
    "SELECT slug FROM blog_posts WHERE published = TRUE"
  );
  return rows.map((r) => r.slug);
}
