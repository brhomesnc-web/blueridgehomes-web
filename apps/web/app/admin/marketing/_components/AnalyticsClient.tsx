"use client";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Card, ChartCard, SectionHeader, KpiCard, EmptyState } from "./ui";
import { BRAND, CHART_COLORS, SEMANTIC } from "./palette";

/**
 * The Analytics panel. UNLIKE OverviewClient, every number on this page is real:
 * it comes from analytics_daily / search_console_daily, which the hourly ingest
 * fills from GA4 and Search Console. There is no representative series here and
 * there must never be one — when a table is empty or its DDL is unapplied this
 * renders EmptyState, because an invented number on a page labelled Analytics is
 * worse than a blank one.
 *
 * "use client" is required only because Recharts needs the DOM. All data
 * fetching happens in the server page that renders this.
 */

export type GscRow = {
  key: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export type Ga4ChannelRow = {
  channel: string;
  sessions: number;
  users: number;
  conversions: number;
};

export type AnalyticsData = {
  windowDays: number;
  /** Freshest ingested_at, already formatted in America/New_York by the server. */
  lastIngest: string | null;
  /** False when the db/schema DDL has not been applied to this database yet. */
  tablesReady: boolean;
  gscTotals: { clicks: number; impressions: number; ctr: number; position: number } | null;
  gscQueries: GscRow[];
  gscPages: GscRow[];
  ga4Channels: Ga4ChannelRow[];
};

const int = new Intl.NumberFormat("en-US");

/** GSC hands back ctr as a 0..1 fraction; it is stored that way and formatted here. */
function pct(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function pos(value: number): string {
  return value.toFixed(1);
}

/** Landing pages are absolute URLs; the origin is identical on every row. */
function shortenPage(url: string): string {
  try {
    const { pathname, search } = new URL(url);
    return `${pathname}${search}` || "/";
  } catch {
    return url;
  }
}

const axisProps = {
  tick: { fill: BRAND.textSoft, fontSize: 11 },
  stroke: SEMANTIC.grid,
};
const tooltipStyle = {
  contentStyle: {
    background: "#fff",
    border: `1px solid ${BRAND.line}`,
    borderRadius: 8,
    fontSize: 12,
  },
};

function MetricTable({
  label,
  rows,
  emptyTitle,
  emptyHint,
  format = (value: string) => value,
}: {
  label: string;
  rows: GscRow[];
  emptyTitle: string;
  emptyHint: string;
  format?: (value: string) => string;
}) {
  if (rows.length === 0) {
    return (
      <Card className="p-4">
        <h3 className="mb-3 text-[14px] font-semibold text-[var(--br-text)]">{label}</h3>
        <EmptyState title={emptyTitle} hint={emptyHint} />
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <h3 className="mb-3 text-[14px] font-semibold text-[var(--br-text)]">{label}</h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="border-b border-[var(--br-line)] text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--br-text-soft)]">
              <th className="py-2 pr-3 font-semibold">{label.includes("page") ? "Page" : "Query"}</th>
              <th className="py-2 px-3 text-right font-semibold">Clicks</th>
              <th className="py-2 px-3 text-right font-semibold">Impr.</th>
              <th className="py-2 px-3 text-right font-semibold">CTR</th>
              <th className="py-2 pl-3 text-right font-semibold">Pos.</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.key}
                className="border-b border-[var(--br-line)]/60 last:border-0 text-[var(--br-text-mid)]"
              >
                <td className="max-w-[22rem] truncate py-2 pr-3" title={row.key}>
                  {format(row.key)}
                </td>
                <td className="py-2 px-3 text-right tabular-nums font-semibold text-[var(--br-text)]">
                  {int.format(row.clicks)}
                </td>
                <td className="py-2 px-3 text-right tabular-nums">{int.format(row.impressions)}</td>
                <td className="py-2 px-3 text-right tabular-nums">{pct(row.ctr)}</td>
                <td className="py-2 pl-3 text-right tabular-nums">{pos(row.position)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export default function AnalyticsClient({ data }: { data: AnalyticsData }) {
  const {
    windowDays,
    lastIngest,
    tablesReady,
    gscTotals,
    gscQueries,
    gscPages,
    ga4Channels,
  } = data;

  const subtitle = `Search & traffic · last ${windowDays} days${
    lastIngest ? ` · ingested ${lastIngest} ET` : ""
  }`;

  // The DDL has not been applied. Say exactly that and stop — rendering zeroed
  // KPI cards here would be indistinguishable from a site with no traffic.
  if (!tablesReady) {
    return (
      <div>
        <SectionHeader title="Analytics" subtitle="Search & traffic" />
        <EmptyState
          title="Analytics tables are not present yet"
          hint="Apply db/schema/analytics_daily.sql and db/schema/search_console_daily.sql to the brhomes database, then wait for the hourly ingest tick."
        />
      </div>
    );
  }

  const totalSessions = ga4Channels.reduce((sum, row) => sum + row.sessions, 0);
  const totalConversions = ga4Channels.reduce((sum, row) => sum + row.conversions, 0);

  return (
    <div>
      <SectionHeader title="Analytics" subtitle={subtitle} />

      {/* KPI cards — GSC search performance plus GA4 volume. */}
      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <KpiCard label="Search clicks" value={gscTotals ? int.format(gscTotals.clicks) : "—"} />
        <KpiCard
          label="Impressions"
          value={gscTotals ? int.format(gscTotals.impressions) : "—"}
        />
        <KpiCard label="Search CTR" value={gscTotals ? pct(gscTotals.ctr) : "—"} />
        <KpiCard label="Avg position" value={gscTotals ? pos(gscTotals.position) : "—"} />
        <KpiCard label="Sessions" value={totalSessions ? int.format(totalSessions) : "—"} />
        <KpiCard
          label="Conversions"
          value={totalConversions ? int.format(totalConversions) : "—"}
        />
      </div>

      {/* GA4 sessions by channel. */}
      <div className="mb-4 grid grid-cols-1 gap-4">
        {ga4Channels.length === 0 ? (
          <Card className="p-4">
            <h3 className="mb-3 text-[14px] font-semibold text-[var(--br-text)]">
              Sessions by channel
            </h3>
            <EmptyState
              title="No GA4 rows yet"
              hint="The ingest runs hourly and no-ops until the data is ~20 hours stale. Check journalctl -u brhomes-web for [ingest] lines."
            />
          </Card>
        ) : (
          <ChartCard title="Sessions by channel" hint={`last ${windowDays} days`} height={260}>
            <BarChart
              data={ga4Channels}
              margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={SEMANTIC.grid} vertical={false} />
              <XAxis dataKey="channel" {...axisProps} />
              <YAxis {...axisProps} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="sessions" name="Sessions" radius={[3, 3, 0, 0]} maxBarSize={48}>
                {ga4Channels.map((row, index) => (
                  <Cell key={row.channel} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ChartCard>
        )}
      </div>

      {/* Search Console detail. */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <MetricTable
          label="Top search queries"
          rows={gscQueries}
          emptyTitle="No Search Console rows yet"
          emptyHint="Search Console lags 2-3 days. If this stays empty after a successful ingest, confirm the service account is granted on the property."
        />
        <MetricTable
          label="Top landing pages"
          rows={gscPages}
          emptyTitle="No landing-page rows yet"
          emptyHint="Populated by the same ingest as the query panel."
          format={shortenPage}
        />
      </div>

      <p className="mt-5 text-[11.5px] text-[var(--br-text-muted)]">
        Every figure on this page is measured — GA4 via the Data API, search
        figures via Search Console. Empty panels mean no ingested rows, never zero
        traffic.
      </p>
    </div>
  );
}
