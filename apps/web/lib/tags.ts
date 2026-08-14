/**
 * blog_posts.tags is jsonb, which the pg driver hands back ALREADY PARSED — an
 * array, not a string. JSON.parse() on that array stringifies it to "a,b" and
 * throws, and every historical copy of the mistake swallowed the throw and
 * substituted an empty list. The read is what throws; the loss happens on the
 * next write, when the empty list goes back to the database.
 *
 * The string branch is not defensive padding: the column has been written by
 * more than one code path over the life of this app, so both shapes are real.
 *
 * Dependency-free on purpose. Client components import this, so it must not
 * reach lib/blog.ts or lib/db.ts and drag pg into the browser bundle.
 */
export function normalizeTags(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.filter((t): t is string => typeof t === "string");
  if (typeof raw === "string") {
    try {
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed)
        ? parsed.filter((t): t is string => typeof t === "string")
        : [];
    } catch {
      return [];
    }
  }
  return [];
}
