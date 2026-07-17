import { Pool, PoolClient, QueryResult, QueryResultRow } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
});

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  return pool.query<T>(text, params);
}

/**
 * Runs `fn` inside a single transaction on one pinned client.
 *
 * The repo convention is query()-only (MARKETING_PLATFORM.md "Architecture &
 * Conventions"). This is the deliberate exception, and the only one: approving a
 * queue item both flips its status AND publishes the post, and those must be
 * atomic — a status flip that commits without its blog_posts insert is ghost
 * state (queue says published, site says otherwise). query() cannot express that,
 * because each call may draw a different client from the pool and a transaction
 * must stay on one.
 *
 * Prefer query() everywhere else. Reach for this only when two writes must both
 * land or both not.
 */
export async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    try {
      await client.query("ROLLBACK");
    } catch {
      // A failed ROLLBACK (dead connection) must not mask the error that caused
      // it — release() below still returns the client to the pool.
    }
    throw err;
  } finally {
    client.release();
  }
}

export default pool;
