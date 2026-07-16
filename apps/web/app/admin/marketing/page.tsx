import { query } from "@/lib/db";
import OverviewClient from "./_components/OverviewClient";

// Server component: fetch the ONE real metric (qualified leads this month, from
// the live submissions table) and hand it to the client dashboard. Reads via
// lib/db query() with the same convention as the rest of the app (recon §3).
// Dynamic because it depends on the admin session / live data.
export const dynamic = "force-dynamic";

async function getLeadsThisMonth(): Promise<number> {
  try {
    const { rows } = await query<{ c: number }>(
      "SELECT COUNT(*)::int AS c FROM submissions WHERE created_at >= date_trunc('month', now())"
    );
    return rows[0]?.c ?? 0;
  } catch {
    return 0;
  }
}

export default async function MarketingOverviewPage() {
  const realLeadsThisMonth = await getLeadsThisMonth();
  return <OverviewClient realLeadsThisMonth={realLeadsThisMonth} />;
}
