"use client";
import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  ComposedChart,
  PieChart,
  Pie,
  Cell,
  FunnelChart,
  Funnel,
  LabelList,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceArea,
} from "recharts";
import { Card, SectionHeader, KpiCard } from "./ui";
import { BRAND, CHART_COLORS, SEMANTIC } from "./palette";
import DateRangeSelector, { DEFAULT_RANGE, type DateRange } from "./DateRangeSelector";

// Overview dashboard. The ONLY real number is `realLeadsThisMonth` (from the
// submissions table, passed by the server page). Everything else is representative
// until the analytics ingest lands. The date-range selector is net-new and wired:
// it slices the time-series charts (representative data) and annotates the header.

const MONTHS = ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];

const leadsMonthlyBase = [18, 24, 21, 27, 19, 23, 26, 31, 28, 34, 29, 33];
const cplByChannelBase = MONTHS.map((m, i) => ({
  month: m,
  Google: [92, 88, 95, 81, 86, 79, 84, 76, 82, 74, 80, 77][i],
  Meta: [110, 104, 98, 112, 95, 101, 93, 99, 90, 96, 88, 94][i],
  Organic: [30, 28, 33, 26, 31, 24, 29, 22, 27, 21, 25, 23][i],
}));
const roiTrendBase = MONTHS.map((m, i) => ({
  month: m,
  roi: [2.6, 2.9, 2.7, 3.2, 2.8, 3.4, 3.1, 3.8, 3.5, 4.1, 3.7, 4.3][i],
}));
const spendVsLeadsBase = MONTHS.map((m, i) => ({
  month: m,
  spend: [2100, 2400, 2250, 2650, 2300, 2500, 2700, 3100, 2850, 3300, 2950, 3200][i],
  leads: leadsMonthlyBase[i],
}));

const sourceAttribution = [
  { name: "Google Ads", value: 38 },
  { name: "Organic Search", value: 27 },
  { name: "Meta Ads", value: 18 },
  { name: "Referral", value: 11 },
  { name: "Direct", value: 6 },
];

const funnel = [
  { name: "Visitors", value: 4200 },
  { name: "Leads", value: 340 },
  { name: "Qualified", value: 132 },
  { name: "Quoted", value: 54 },
  { name: "Won", value: 19 },
];

// Preset → number of trailing months shown. Keeps the range visibly wired.
function windowFor(preset: DateRange["preset"]): number {
  switch (preset) {
    case "7d":
      return 3;
    case "30d":
      return 6;
    case "90d":
      return 9;
    case "month":
      return 4;
    default:
      return 12;
  }
}

function ChartCard({
  title,
  hint,
  height = 240,
  children,
}: {
  title: string;
  hint?: string;
  height?: number;
  children: React.ReactElement;
}) {
  return (
    <Card className="p-4">
      <div className="mb-1 flex items-baseline justify-between">
        <h3 className="text-[14px] font-semibold text-[var(--br-text)]">{title}</h3>
        {hint ? <span className="text-[11px] text-[var(--br-text-muted)]">{hint}</span> : null}
      </div>
      <div style={{ width: "100%", height }}>
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </Card>
  );
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

export default function OverviewClient({
  realLeadsThisMonth,
}: {
  realLeadsThisMonth: number;
}) {
  const [range, setRange] = useState<DateRange>(DEFAULT_RANGE);
  const n = windowFor(range.preset);

  // Current month's leads bar reflects the real count; prior months representative.
  const leadsMonthly = useMemo(() => {
    const arr = MONTHS.map((month, i) => ({ month, leads: leadsMonthlyBase[i] }));
    arr[arr.length - 1] = { month: "Jul", leads: realLeadsThisMonth };
    return arr.slice(-n);
  }, [realLeadsThisMonth, n]);

  const cplByChannel = useMemo(() => cplByChannelBase.slice(-n), [n]);
  const roiTrend = useMemo(() => roiTrendBase.slice(-n), [n]);
  const spendVsLeads = useMemo(() => spendVsLeadsBase.slice(-n), [n]);

  return (
    <div>
      <SectionHeader
        title="Overview"
        subtitle={`Marketing performance · ${range.label}`}
        right={<DateRangeSelector value={range} onChange={setRange} />}
      />

      {/* KPI cards */}
      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <KpiCard
          label="Qualified Leads"
          value={String(realLeadsThisMonth)}
          target="25–40 / mo"
          delta="↑ this month"
          deltaTone="positive"
        />
        <KpiCard label="Blended CPL" value="$77" target="< $90" delta="↓ 6%" deltaTone="positive" />
        <KpiCard label="Marketing ROI" value="4.3×" target="≥ 3×" delta="↑ 0.4×" deltaTone="positive" />
        <KpiCard label="Website Visitors" value="4,210" target="4k+ / mo" delta="↑ 8%" deltaTone="positive" />
        <KpiCard label="Google Review Avg" value="4.8★" target="≥ 4.7" delta="↑ 0.1" deltaTone="positive" />
        <KpiCard label="Lead → Contract" value="5.6%" target="5–8%" delta="↓ 0.3%" deltaTone="negative" />
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Qualified leads per month" hint="target band 25–40">
          <BarChart data={leadsMonthly} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={SEMANTIC.grid} vertical={false} />
            <XAxis dataKey="month" {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip {...tooltipStyle} />
            <ReferenceArea y1={25} y2={40} fill={SEMANTIC.targetBand} stroke={SEMANTIC.targetLine} strokeOpacity={0.4} />
            <Bar dataKey="leads" fill={BRAND.gold} radius={[3, 3, 0, 0]} maxBarSize={38} />
          </BarChart>
        </ChartCard>

        <ChartCard title="Cost per lead by channel">
          <LineChart data={cplByChannel} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={SEMANTIC.grid} vertical={false} />
            <XAxis dataKey="month" {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip {...tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="Google" stroke={CHART_COLORS[0]} strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="Meta" stroke={CHART_COLORS[4]} strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="Organic" stroke={CHART_COLORS[2]} strokeWidth={2} dot={false} />
          </LineChart>
        </ChartCard>

        <ChartCard title="Source attribution">
          <PieChart>
            <Tooltip {...tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Pie
              data={sourceAttribution}
              dataKey="value"
              nameKey="name"
              innerRadius={54}
              outerRadius={82}
              paddingAngle={2}
            >
              {sourceAttribution.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ChartCard>

        <ChartCard title="Marketing ROI trend" hint="revenue ÷ spend">
          <LineChart data={roiTrend} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={SEMANTIC.grid} vertical={false} />
            <XAxis dataKey="month" {...axisProps} />
            <YAxis {...axisProps} />
            <Tooltip {...tooltipStyle} />
            <Line type="monotone" dataKey="roi" stroke={BRAND.goldDark} strokeWidth={2.5} dot={{ r: 3, fill: BRAND.goldDark }} />
          </LineChart>
        </ChartCard>

        <ChartCard title="Pipeline funnel">
          <FunnelChart>
            <Tooltip {...tooltipStyle} />
            <Funnel dataKey="value" data={funnel} isAnimationActive={false} lastShapeType="triangle">
              {funnel.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
              <LabelList position="right" fill={BRAND.textMid} stroke="none" dataKey="name" fontSize={12} />
              <LabelList position="left" fill={BRAND.textSoft} stroke="none" dataKey="value" fontSize={11} />
            </Funnel>
          </FunnelChart>
        </ChartCard>

        <ChartCard title="Spend vs leads" hint="dual axis">
          <ComposedChart data={spendVsLeads} margin={{ top: 8, right: 4, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={SEMANTIC.grid} vertical={false} />
            <XAxis dataKey="month" {...axisProps} />
            <YAxis yAxisId="left" {...axisProps} />
            <YAxis yAxisId="right" orientation="right" {...axisProps} />
            <Tooltip {...tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar yAxisId="left" dataKey="spend" name="Spend ($)" fill={BRAND.stone} radius={[3, 3, 0, 0]} maxBarSize={30} />
            <Line yAxisId="right" type="monotone" dataKey="leads" name="Leads" stroke={BRAND.gold} strokeWidth={2.5} dot={false} />
          </ComposedChart>
        </ChartCard>
      </div>

      <p className="mt-5 text-[11.5px] text-[var(--br-text-muted)]">
        Qualified-leads value reflects live contact submissions this month. Other
        series are representative until the analytics ingest lands.
      </p>
    </div>
  );
}
