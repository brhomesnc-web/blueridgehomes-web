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


// ---------------------------------------------------------------------------
// Admin / agent inventory: EVERY post, published or not, scheduled or not.

export type BlogPostAdminRow = {
  slug: string;
  title: string;
  date: string;
  description: string;
  featured_image: string;
  tags: string[];
  published: boolean;
  updated_at: string;
  publish_at: string | null;
  publish_at_ny: string | null;
};

function normalizeTags(raw: string | string[]): string[] {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * Every post with the draft/schedule columns intact. Deliberately NOT built on
 * toPost(), which is the PUBLIC mapper and hard-drops published/publish_at/
 * updated_at — reusing it would silently strip the exact fields this function
 * exists to expose.
 *
 * Snake_case keys are preserved on purpose: this is the shape the admin content
 * route already returns to its client. The NY conversion stays in SQL (D2), so
 * publish_at_ny arrives preformatted in datetime-local's shape and the client
 * does zero timezone math.
 */
export async function listAllPosts(
  opts: { limit?: number } = {}
): Promise<BlogPostAdminRow[]> {
  const limit =
    Number.isInteger(opts.limit) && (opts.limit as number) > 0
      ? (opts.limit as number)
      : 500;
  const { rows } = await query<BlogPostAdminRow & { tags: string | string[] }>(
    `SELECT slug, title, date, description, featured_image, tags, published, updated_at,
            publish_at,
            to_char(publish_at AT TIME ZONE 'America/New_York', 'YYYY-MM-DD"T"HH24:MI') AS publish_at_ny
       FROM blog_posts
      ORDER BY date DESC
      LIMIT $1`,
    [limit]
  );
  return rows.map((row) => ({ ...row, tags: normalizeTags(row.tags) }));
}
