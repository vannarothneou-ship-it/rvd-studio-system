import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  ArrowLeftRight,
  BarChart3,
  CreditCard,
  Landmark,
  PieChart as PieIcon,
  Plus,
  Shapes,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { Btn, Glass, SlidingTabs } from "@/components/rv/ui";
import {
  categoryIcon,
  incomeSourceIcon,
  paymentCardIcon,
} from "@/components/rv/FinanceIcons";
import type { CategoryStatItem } from "@/components/rv/FinanceVisuals";
import {
  cardKind,
  cardSpendSeries,
  compactMoney,
  expenseAccount,
  money,
  recordToUSD,
  revenueByPillar,
  safeKhrRate,
  today,
  type Account,
  type DB,
  type PersonalRange,
} from "@/lib/store";
import { cn } from "@/lib/utils";

export type ChartMode = "area" | "line" | "bar";
export type ChartLens = "flow" | "net" | "category" | "method";

export const CHART_MODE_OPTIONS = [
  { id: "area" as const, label: "Area", icon: TrendingUp },
  { id: "line" as const, label: "Line", icon: Activity },
  { id: "bar" as const, label: "Bar", icon: BarChart3 },
];

const MODE_ORDER: ChartMode[] = ["area", "line", "bar"];

export function ChartModeCycleButton({
  mode,
  onChange,
  className,
}: {
  mode: ChartMode;
  onChange: (next: ChartMode) => void;
  className?: string;
}) {
  const current =
    CHART_MODE_OPTIONS.find((o) => o.id === mode) ?? CHART_MODE_OPTIONS[0]!;
  const nextMode =
    MODE_ORDER[(MODE_ORDER.indexOf(mode) + 1) % MODE_ORDER.length]!;
  const Icon = current.icon;

  return (
    <button
      type="button"
      onClick={() => onChange(nextMode)}
      aria-label={`Chart style: ${current.label}. Tap to switch to ${nextMode}`}
      title={`Style: ${current.label} (tap to switch)`}
      className={cn(
        "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary text-primary transition-all duration-150 hover:border-primary/50 hover:bg-primary hover:text-primary-foreground active:scale-95",
        className,
      )}
    >
      <Icon className="h-4 w-4" strokeWidth={2.2} />
    </button>
  );
}

export const CHART_LENS_OPTIONS: {
  id: ChartLens;
  label: string;
  icon: LucideIcon;
}[] = [
  { id: "flow", label: "Flow", icon: ArrowLeftRight },
  { id: "net", label: "Net", icon: Activity },
  { id: "category", label: "Category", icon: Shapes },
  { id: "method", label: "Card", icon: CreditCard },
];

function TimeSlotTick({
  x = 0,
  y = 0,
  payload,
}: {
  x?: number;
  y?: number;
  payload?: { value?: string };
}) {
  const label = String(payload?.value ?? "");
  // Render crisp monochrome weather/time-of-day SVG icons for Today time slots
  if (
    label === "Morning" ||
    label === "Midday" ||
    label === "Afternoon" ||
    label === "Evening"
  ) {
    const cx = Number(x);
    const cy = Number(y) + 10;
    return (
      <g
        transform={`translate(${cx}, ${cy})`}
        stroke="var(--muted-foreground)"
        fill="none"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <title>{label}</title>
        {label === "Morning" && (
          <>
            <path d="M-5 2a5 5 0 0 1 10 0" />
            <path d="M-7 2h14" />
            <path d="M0-5v2" />
            <path d="m-5-2 1.2 1.2" />
            <path d="m5-2-1.2 1.2" />
          </>
        )}
        {label === "Midday" && (
          <>
            <circle cx="0" cy="0" r="3" />
            <path d="M0-6v1.5M0 4.5V6M-6 0h1.5M4.5 0H6M-4.2-4.2l1 1M3.2 3.2l1 1M4.2-4.2l-1 1M-3.2 3.2l-1 1" />
          </>
        )}
        {label === "Afternoon" && (
          <>
            <path d="M-5 1a5 5 0 0 1 10 0" />
            <path d="M-7 1h14" />
            <path d="M-4 4h8" />
          </>
        )}
        {label === "Evening" && (
          <path d="M2.5-4.5a4.8 4.8 0 1 0 3.2 8.2A4.2 4.2 0 0 1 2.5-4.5Z" />
        )}
      </g>
    );
  }

  return (
    <text
      x={x}
      y={Number(y) + 12}
      textAnchor="middle"
      fill="var(--muted-foreground)"
      fontSize={10.5}
    >
      {label}
    </text>
  );
}

const PIE_PALETTE = [
  "var(--primary)", // RothVan Gold
  "oklch(0.78 0.13 155)", // Sage Emerald
  "oklch(0.68 0.12 245)", // Slate Sky
  "oklch(0.72 0.15 48)", // Warm Amber
  "oklch(0.7 0.14 22)", // Coral Terracotta
  "oklch(0.68 0.12 300)", // Muted Plum
  "oklch(0.74 0.08 190)", // Teal Stone
  "oklch(0.65 0.03 70)", // Warm Taupe
];

export interface SparkPoint {
  label: string;
  fullDate?: string;
  v: number;
  inn?: number;
  out?: number;
  count?: number;
}

export function SparklineWithDates({
  data,
  gradientId = "rv-spark",
  valueLabel = "Balance",
}: {
  data: SparkPoint[];
  gradientId?: string;
  valueLabel?: string;
}) {
  return (
    <div className="my-4 h-28 w-full shrink-0">
      <ResponsiveContainer width="100%" height={112}>
        <AreaChart
          data={data}
          margin={{ top: 6, right: 12, bottom: 8, left: 12 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--primary)" stopOpacity={0.38} />
              <stop offset="1" stopColor="var(--primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <ReferenceLine y={0} stroke="var(--border)" strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            interval="preserveStartEnd"
            minTickGap={36}
            tick={<TimeSlotTick />}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0]?.payload as SparkPoint | undefined;
              if (!p) return null;
              return (
                <div className="rounded-xl border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-lg">
                  <p className="font-num text-[0.68rem] text-muted-foreground">
                    {p.fullDate || p.label}
                  </p>
                  <p className="font-num mt-0.5 font-semibold text-primary">
                    {valueLabel}: {money(p.v)}
                  </p>
                  {(p.inn !== undefined || p.out !== undefined) && (
                    <p className="font-num mt-0.5 text-[0.68rem] text-muted-foreground">
                      {p.inn !== undefined ? `In ${compactMoney(p.inn)}` : ""}
                      {p.inn !== undefined && p.out !== undefined ? " · " : ""}
                      {p.out !== undefined ? `Out ${compactMoney(p.out)}` : ""}
                    </p>
                  )}
                  {p.count !== undefined && p.count > 0 && (
                    <p className="mt-0.5 text-[0.68rem] text-muted-foreground">
                      {p.count} {p.count === 1 ? "entry" : "entries"}
                    </p>
                  )}
                </div>
              );
            }}
          />
          <Area
            dataKey="v"
            stroke="var(--primary)"
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            type="monotone"
            activeDot={{
              r: 4,
              fill: "var(--primary)",
              stroke: "var(--background)",
              strokeWidth: 2,
            }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export interface TrendRow {
  label: string;
  fullDate?: string;
  inCount?: number;
  outCount?: number;
  count?: number;
}

function numField(row: object, key: string): number {
  return Number((row as Record<string, unknown>)[key] ?? 0);
}

export function TrendChartCanvas({
  mode,
  data,
  primaryKey,
  primaryName,
  secondaryKey,
  secondaryName,
  gradientId = "rv-cf",
  xInterval,
  height = 224,
  isNetMetric = false,
  hideSecondary = false,
}: {
  mode: ChartMode;
  data: readonly TrendRow[];
  primaryKey: string;
  primaryName: string;
  secondaryKey: string;
  secondaryName: string;
  gradientId?: string;
  xInterval?: number | "preserveStartEnd" | undefined;
  height?: number;
  isNetMetric?: boolean | undefined;
  hideSecondary?: boolean | undefined;
}) {
  const chartData = useMemo(() => [...data], [data]);
  const resolvedInterval: number | "preserveStartEnd" =
    xInterval !== undefined
      ? typeof xInterval === "number" &&
        xInterval === 0 &&
        chartData.length > 12
        ? "preserveStartEnd"
        : xInterval
      : chartData.length > 12
        ? "preserveStartEnd"
        : 0;
  const renderTooltip = () => (
    <Tooltip
      content={({ active, payload }) => {
        if (!active || !payload?.length) return null;
        const row = payload[0]?.payload as TrendRow | undefined;
        if (!row) return null;
        const primaryVal = numField(row, primaryKey);
        const secondaryVal = numField(row, secondaryKey);
        const txCount =
          row.count ??
          (row.inCount !== undefined || row.outCount !== undefined
            ? (row.inCount ?? 0) + (row.outCount ?? 0)
            : undefined);
        return (
          <div className="min-w-44 rounded-xl border border-border bg-popover px-3 py-2.5 text-xs text-popover-foreground shadow-lg">
            <div className="flex items-center justify-between gap-3 border-b border-border/70 pb-1.5">
              <span className="font-medium text-foreground">
                {row.fullDate || row.label}
              </span>
              {txCount !== undefined && (
                <span className="font-num text-[0.68rem] text-muted-foreground">
                  {txCount} tx
                </span>
              )}
            </div>
            <div className="mt-1.5 space-y-1">
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{
                      background: isNetMetric
                        ? primaryVal >= 0
                          ? "var(--positive)"
                          : "var(--destructive)"
                        : "var(--primary)",
                    }}
                  />
                  {primaryName}
                </span>
                <span
                  className={cn(
                    "font-num font-semibold",
                    isNetMetric
                      ? primaryVal >= 0
                        ? "text-positive"
                        : "text-destructive"
                      : "text-primary",
                  )}
                >
                  {isNetMetric
                    ? money(primaryVal, "USD", true)
                    : money(primaryVal)}
                </span>
              </div>
              {!hideSecondary && (
                <div className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <span className="h-2 w-2 rounded-full bg-muted-foreground" />
                    {secondaryName}
                  </span>
                  <span className="font-num text-foreground">
                    {money(secondaryVal)}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      }}
    />
  );

  return (
    <div className="w-full shrink-0" style={{ height }}>
      <ResponsiveContainer width="100%" height={height}>
        {mode === "bar" ? (
          <BarChart
            data={chartData}
            margin={{ left: 2, right: 12, top: 8, bottom: 2 }}
          >
            <CartesianGrid
              stroke="var(--border)"
              strokeDasharray="3 6"
              vertical={false}
            />
            {isNetMetric && (
              <ReferenceLine
                y={0}
                stroke="var(--muted-foreground)"
                strokeDasharray="4 4"
                strokeOpacity={0.55}
              />
            )}
            <XAxis
              dataKey="label"
              tick={<TimeSlotTick />}
              axisLine={false}
              tickLine={false}
              tickMargin={6}
              padding={{ left: 10, right: 10 }}
              minTickGap={24}
              interval={resolvedInterval}
            />
            <YAxis
              width={48}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => compactMoney(Number(v))}
            />
            {renderTooltip()}
            <Bar
              name={primaryName}
              dataKey={primaryKey}
              fill="var(--primary)"
              radius={[6, 6, 0, 0]}
              animationDuration={150}
              isAnimationActive={chartData.length <= 20}
            >
              {isNetMetric &&
                chartData.map((entry, idx) => {
                  const v = numField(entry, primaryKey);
                  return (
                    <Cell
                      key={`${entry.label}-${idx}`}
                      fill={v >= 0 ? "var(--positive)" : "var(--destructive)"}
                      fillOpacity={0.85}
                    />
                  );
                })}
            </Bar>
            {!hideSecondary && (
              <Bar
                name={secondaryName}
                dataKey={secondaryKey}
                fill="var(--muted-foreground)"
                fillOpacity={0.55}
                radius={[6, 6, 0, 0]}
                animationDuration={150}
                isAnimationActive={chartData.length <= 20}
              />
            )}
          </BarChart>
        ) : mode === "line" ? (
          <LineChart
            data={chartData}
            margin={{ left: 2, right: 12, top: 8, bottom: 2 }}
          >
            <CartesianGrid
              stroke="var(--border)"
              strokeDasharray="3 6"
              vertical={false}
            />
            {isNetMetric && (
              <ReferenceLine
                y={0}
                stroke="var(--muted-foreground)"
                strokeDasharray="4 4"
                strokeOpacity={0.55}
              />
            )}
            <XAxis
              dataKey="label"
              tick={<TimeSlotTick />}
              axisLine={false}
              tickLine={false}
              tickMargin={6}
              padding={{ left: 10, right: 10 }}
              minTickGap={24}
              interval={resolvedInterval}
            />
            <YAxis
              width={48}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => compactMoney(Number(v))}
            />
            {renderTooltip()}
            <Line
              name={primaryName}
              dataKey={primaryKey}
              type="monotone"
              stroke={isNetMetric ? "var(--positive)" : "var(--primary)"}
              strokeWidth={2.5}
              dot={
                chartData.length <= 32
                  ? {
                      r: 2.5,
                      fill: isNetMetric ? "var(--positive)" : "var(--primary)",
                      strokeWidth: 0,
                    }
                  : false
              }
              activeDot={{
                r: 5,
                fill: isNetMetric ? "var(--positive)" : "var(--primary)",
                stroke: "var(--background)",
                strokeWidth: 2,
              }}
              animationDuration={150}
              isAnimationActive={chartData.length <= 20}
            />
            {!hideSecondary && (
              <Line
                name={secondaryName}
                dataKey={secondaryKey}
                type="monotone"
                stroke="var(--muted-foreground)"
                strokeWidth={1.75}
                strokeDasharray="5 5"
                dot={false}
                activeDot={{ r: 4, fill: "var(--muted-foreground)" }}
                animationDuration={150}
                isAnimationActive={chartData.length <= 20}
              />
            )}
          </LineChart>
        ) : (
          <AreaChart
            data={chartData}
            margin={{ left: 2, right: 12, top: 8, bottom: 2 }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0"
                  stopColor={isNetMetric ? "var(--positive)" : "var(--primary)"}
                  stopOpacity={0.38}
                />
                <stop
                  offset="1"
                  stopColor={isNetMetric ? "var(--positive)" : "var(--primary)"}
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient
                id={`${gradientId}-sec`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0"
                  stopColor="var(--muted-foreground)"
                  stopOpacity={0.18}
                />
                <stop
                  offset="1"
                  stopColor="var(--muted-foreground)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              stroke="var(--border)"
              strokeDasharray="3 6"
              vertical={false}
            />
            {isNetMetric && (
              <ReferenceLine
                y={0}
                stroke="var(--muted-foreground)"
                strokeDasharray="4 4"
                strokeOpacity={0.55}
              />
            )}
            <XAxis
              dataKey="label"
              tick={<TimeSlotTick />}
              axisLine={false}
              tickLine={false}
              tickMargin={6}
              padding={{ left: 10, right: 10 }}
              minTickGap={24}
              interval={resolvedInterval}
            />
            <YAxis
              width={48}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => compactMoney(Number(v))}
            />
            {renderTooltip()}
            <Area
              name={primaryName}
              dataKey={primaryKey}
              type="monotone"
              stroke={isNetMetric ? "var(--positive)" : "var(--primary)"}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              activeDot={{
                r: 4.5,
                fill: isNetMetric ? "var(--positive)" : "var(--primary)",
                stroke: "var(--background)",
                strokeWidth: 2,
              }}
              animationDuration={150}
              isAnimationActive={chartData.length <= 20}
              animationEasing="ease-out"
            />
            {!hideSecondary && (
              <Area
                name={secondaryName}
                dataKey={secondaryKey}
                type="monotone"
                stroke="var(--muted-foreground)"
                strokeDasharray="5 5"
                fill={`url(#${gradientId}-sec)`}
                animationDuration={150}
                isAnimationActive={chartData.length <= 20}
                animationEasing="ease-out"
              />
            )}
          </AreaChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

export type PieMode = "expenses" | "revenue" | "income";
type PieGroupBy = "category" | "method";

export function BreakdownPieCard({
  db,
  account = "Personal",
  personalItems,
  studioItems,
  personalIncomeItems,
  scopeLabel,
  dateSet,
  monthSet,
  onSelectCategory,
  onEmptyAction,
  delay = 140,
}: {
  db: DB;
  account?: Account | "Combined";
  personalItems: CategoryStatItem[];
  studioItems: CategoryStatItem[];
  personalIncomeItems?: { source: string; totalUSD: number; count: number }[];
  scopeLabel: string;
  dateSet?: Set<string> | null | undefined;
  monthSet?: Set<string> | null | undefined;
  onSelectCategory?: ((acc: Account, category: string) => void) | undefined;
  onEmptyAction?: ((mode: PieMode) => void) | undefined;
  delay?: number;
}) {
  const [pieMode, setPieMode] = useState<PieMode>(
    account === "Studio" ? "revenue" : "expenses",
  );
  const [groupBy, setGroupBy] = useState<PieGroupBy>("category");

  const effectiveMode: PieMode =
    account === "Personal" && pieMode === "revenue"
      ? "expenses"
      : account === "Studio" && pieMode === "income"
        ? "expenses"
        : pieMode;

  const canGroupMethod =
    account === "Personal" &&
    (effectiveMode === "expenses" || effectiveMode === "income");

  const effectiveGroup: PieGroupBy = canGroupMethod ? groupBy : "category";

  const slices = useMemo(() => {
    const r = safeKhrRate(db.settings.khrRate);
    const matchesPeriod = (dt: string) => {
      if (dateSet) return dateSet.has(dt);
      if (monthSet) return monthSet.has(dt.slice(0, 7));
      return true;
    };

    if (effectiveMode === "revenue" && account !== "Personal") {
      return revenueByPillar(db).map((x, idx) => ({
        name: x.label,
        value: Math.round(x.totalUSD * 100) / 100,
        count: x.count,
        color: PIE_PALETTE[idx % PIE_PALETTE.length]!,
        account: "Studio" as Account,
        clickable: false,
      }));
    }

    if (effectiveMode === "income" && account === "Personal") {
      if (effectiveGroup === "method") {
        const mMap = new Map<string, { usd: number; count: number }>();
        for (const inc of db.personalIncome ?? []) {
          if (!matchesPeriod(inc.date)) continue;
          const k = inc.accountMethod?.trim() || "Bank";
          const cur = mMap.get(k) ?? { usd: 0, count: 0 };
          cur.usd += recordToUSD(inc, r);
          cur.count += 1;
          mMap.set(k, cur);
        }
        return Array.from(mMap.entries())
          .sort((a, b) => b[1].usd - a[1].usd)
          .slice(0, 7)
          .map(([name, val], idx) => ({
            name,
            value: Math.round(val.usd * 100) / 100,
            count: val.count,
            color: PIE_PALETTE[idx % PIE_PALETTE.length]!,
            account: "Personal" as Account,
            clickable: false,
          }));
      }

      return (personalIncomeItems ?? []).slice(0, 7).map((x, idx) => ({
        name: x.source,
        value: Math.round(x.totalUSD * 100) / 100,
        count: x.count,
        color: PIE_PALETTE[idx % PIE_PALETTE.length]!,
        account: "Personal" as Account,
        clickable: false,
      }));
    }

    if (effectiveGroup === "method" && account === "Personal") {
      const mMap = new Map<string, { usd: number; count: number }>();
      for (const e of db.expenses) {
        if (expenseAccount(e) !== "Personal") continue;
        if (!matchesPeriod(e.date)) continue;
        const k = e.vendor?.trim() || "Other";
        const cur = mMap.get(k) ?? { usd: 0, count: 0 };
        cur.usd += recordToUSD(e, r);
        cur.count += 1;
        mMap.set(k, cur);
      }
      return Array.from(mMap.entries())
        .sort((a, b) => b[1].usd - a[1].usd)
        .slice(0, 8)
        .map(([name, val], idx) => ({
          name,
          value: Math.round(val.usd * 100) / 100,
          count: val.count,
          color: PIE_PALETTE[idx % PIE_PALETTE.length]!,
          account: "Personal" as Account,
          clickable: false,
        }));
    }

    const source =
      account === "Studio"
        ? studioItems.map((i) => ({ ...i, acc: "Studio" as Account }))
        : account === "Personal"
          ? personalItems.map((i) => ({ ...i, acc: "Personal" as Account }))
          : [
              ...studioItems.map((i) => ({ ...i, acc: "Studio" as Account })),
              ...personalItems.map((i) => ({
                ...i,
                acc: "Personal" as Account,
              })),
            ].sort((a, b) => b.totalUSD - a.totalUSD);

    return source.slice(0, 8).map((item, idx) => ({
      name: item.category,
      value: Math.round(item.totalUSD * 100) / 100,
      count: item.count,
      color: PIE_PALETTE[idx % PIE_PALETTE.length]!,
      account: item.acc,
      clickable: true,
    }));
  }, [
    effectiveMode,
    effectiveGroup,
    db,
    account,
    personalItems,
    studioItems,
    personalIncomeItems,
    dateSet,
    monthSet,
  ]);

  const total = slices.reduce((s, x) => s + x.value, 0);

  return (
    <Glass delay={delay} className="flex h-full flex-col justify-between">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <PieIcon className="h-4 w-4 shrink-0 text-primary" />
          <h2 className="truncate font-medium leading-tight">
            {effectiveMode === "revenue"
              ? "Revenue by pillar"
              : effectiveMode === "income"
                ? `Income · ${scopeLabel}`
                : `${
                    account === "Personal"
                      ? "Spending"
                      : account === "Combined"
                        ? "Combined spend"
                        : "Studio costs"
                  } · ${scopeLabel}`}
          </h2>
        </div>
        <div className="max-w-full shrink-0">
          <SlidingTabs
            size="xs"
            tone="invert"
            layoutGroup={`pie-mode-${account}`}
            value={effectiveMode}
            onChange={setPieMode}
            options={
              account === "Personal"
                ? [
                    { id: "expenses", label: "Spending" },
                    { id: "income", label: "Income" },
                  ]
                : [
                    { id: "expenses", label: "Expenses" },
                    { id: "revenue", label: "Revenue" },
                  ]
            }
          />
        </div>
      </div>

      {canGroupMethod && (
        <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2 text-[0.7rem]">
          <span className="hidden text-muted-foreground sm:inline">
            {effectiveGroup === "method"
              ? "Grouped by card"
              : effectiveMode === "income"
                ? "Grouped by source"
                : "Grouped by category"}
          </span>
          <div className="inline-flex items-center gap-1 rounded-lg border border-border/80 bg-secondary/70 p-0.5">
            <button
              type="button"
              onClick={() => setGroupBy("category")}
              className={cn(
                "min-h-[30px] rounded-md px-2.5 py-1 text-[0.7rem] font-medium transition-colors",
                effectiveGroup === "category"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {effectiveMode === "income" ? "By Source" : "By Category"}
            </button>
            <button
              type="button"
              onClick={() => setGroupBy("method")}
              className={cn(
                "min-h-[30px] rounded-md px-2.5 py-1 text-[0.7rem] font-medium transition-colors",
                effectiveGroup === "method"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              By Card
            </button>
          </div>
        </div>
      )}

      <div className="flex min-h-[248px] flex-1 flex-col justify-center">
        {slices.length === 0 || total <= 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
            <p className="text-sm text-muted-foreground">
              {effectiveMode === "income"
                ? `No personal income logged in ${scopeLabel}.`
                : `No breakdown data in ${scopeLabel}.`}
            </p>
            {onEmptyAction && (
              <Btn
                type="button"
                onClick={() => onEmptyAction(effectiveMode)}
                className="px-3.5 py-1.5 text-xs"
              >
                <Plus className="h-3.5 w-3.5 text-primary" />
                {effectiveMode === "income" ? "Log income" : "Add expense"}
              </Btn>
            )}
          </div>
        ) : (
          <div className="grid items-center gap-4 sm:grid-cols-[200px_minmax(0,1fr)]">
            <div className="relative mx-auto h-48 w-48 shrink-0">
              <ResponsiveContainer width={192} height={192}>
                <PieChart>
                  <Pie
                    data={slices}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={54}
                    outerRadius={84}
                    paddingAngle={3}
                    cornerRadius={5}
                    stroke="none"
                    animationDuration={160}
                    isAnimationActive={false}
                    onClick={(entry) => {
                      if (
                        entry &&
                        entry.clickable &&
                        onSelectCategory &&
                        entry.name &&
                        entry.account
                      ) {
                        onSelectCategory(entry.account, entry.name);
                      }
                    }}
                  >
                    {slices.map((s) => (
                      <Cell
                        key={s.name}
                        fill={s.color}
                        className={cn(s.clickable && "cursor-pointer")}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const s = payload[0]?.payload as
                        (typeof slices)[number] | undefined;
                      if (!s) return null;
                      const pct =
                        total > 0 ? Math.round((s.value / total) * 100) : 0;
                      return (
                        <div className="rounded-xl border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-lg">
                          <p className="font-medium text-foreground">
                            {s.name}
                          </p>
                          <p className="font-num mt-0.5 font-semibold text-primary">
                            {money(s.value)} ({pct}%)
                          </p>
                          <p className="font-num text-[0.68rem] text-muted-foreground">
                            {s.count} {s.count === 1 ? "item" : "items"}
                          </p>
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="label-mono text-[0.6rem]">Total</span>
                <span
                  className="font-num text-xl font-bold tracking-tight text-foreground"
                  title={money(total)}
                >
                  {compactMoney(total)}
                </span>
                <span className="font-num text-[0.68rem] text-muted-foreground">
                  {slices.length} {slices.length === 1 ? "slice" : "slices"}
                </span>
              </div>
            </div>

            <ul className="space-y-1.5">
              {slices.map((s) => {
                const pct = total > 0 ? Math.round((s.value / total) * 100) : 0;
                const CatIcon =
                  effectiveGroup === "method"
                    ? paymentCardIcon(s.name)
                    : effectiveMode === "income"
                      ? incomeSourceIcon(s.name)
                      : categoryIcon(s.name);
                const content = (
                  <>
                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ background: s.color }}
                      />
                      <CatIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <span className="truncate text-xs font-medium text-foreground">
                        {s.name}
                      </span>
                    </span>
                    <span className="font-num flex shrink-0 items-center gap-2 text-xs">
                      <span className="text-muted-foreground">{pct}%</span>
                      <span className="font-semibold text-foreground">
                        {compactMoney(s.value)}
                      </span>
                    </span>
                  </>
                );
                return (
                  <li key={s.name}>
                    {s.clickable && onSelectCategory ? (
                      <button
                        type="button"
                        onClick={() => onSelectCategory(s.account, s.name)}
                        className="flex w-full items-center justify-between gap-2 rounded-xl px-2 py-1.5 text-left transition-colors hover:bg-muted"
                      >
                        {content}
                      </button>
                    ) : (
                      <div className="flex items-center justify-between gap-2 rounded-xl px-2 py-1.5">
                        {content}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </Glass>
  );
}

export function PeriodBarPulseCard({
  title,
  subtitle,
  data,
  valueKey,
  delay = 160,
}: {
  title: string;
  subtitle: string;
  data: readonly TrendRow[];
  valueKey: string;
  delay?: number;
}) {
  const chartData = useMemo(() => [...data], [data]);
  const peak = useMemo(() => {
    let mx = 0;
    for (const row of data) {
      const val = numField(row, valueKey);
      if (val > mx) mx = val;
    }
    return mx;
  }, [data, valueKey]);

  const total = data.reduce((s, r) => s + numField(r, valueKey), 0);

  return (
    <Glass delay={delay} className="flex h-full flex-col justify-between">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-medium">{title}</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <div className="text-right">
          <span className="label-mono block">Period total</span>
          <span
            className="font-num text-lg font-bold text-primary"
            title={money(total)}
          >
            {compactMoney(total)}
          </span>
        </div>
      </div>

      <div className="h-44 w-full shrink-0">
        <ResponsiveContainer width="100%" height={176}>
          <BarChart
            data={chartData}
            margin={{ left: 2, right: 10, top: 8, bottom: 2 }}
          >
            <CartesianGrid
              stroke="var(--border)"
              strokeDasharray="3 6"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={<TimeSlotTick />}
              axisLine={false}
              tickLine={false}
              padding={{ left: 10, right: 10 }}
              minTickGap={24}
              interval={chartData.length > 10 ? "preserveStartEnd" : 0}
            />
            <YAxis
              width={46}
              tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => compactMoney(Number(v))}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const row = payload[0]?.payload as TrendRow | undefined;
                if (!row) return null;
                const val = numField(row, valueKey);
                return (
                  <div className="rounded-xl border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-lg">
                    <p className="font-num text-[0.68rem] text-muted-foreground">
                      {row.fullDate || row.label}
                    </p>
                    <p className="font-num mt-0.5 font-semibold text-primary">
                      {money(val)}
                    </p>
                    {row.count !== undefined && (
                      <p className="text-[0.66rem] text-muted-foreground">
                        {row.count} {row.count === 1 ? "entry" : "entries"}
                      </p>
                    )}
                  </div>
                );
              }}
            />
            <Bar
              dataKey={valueKey}
              radius={[8, 8, 2, 2]}
              animationDuration={160}
              isAnimationActive={chartData.length <= 20}
            >
              {data.map((entry, idx) => {
                const val = numField(entry, valueKey);
                const isPeak = peak > 0 && val === peak;
                return (
                  <Cell
                    key={entry.label + idx}
                    fill={isPeak ? "var(--primary)" : "var(--chart-3)"}
                    fillOpacity={isPeak ? 1 : 0.72}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Glass>
  );
}

const CARD_RANGE_OPTIONS: { id: PersonalRange; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "week", label: "1W" },
  { id: "1m", label: "1M" },
  { id: "6m", label: "6M" },
  { id: "12m", label: "12M" },
];

type CardFilter = "both" | "debit" | "credit";

export function CardSpendingChartCard({
  db,
  month,
  defaultRange = "today",
  range: controlledRange,
  onRangeChange,
  layoutIdPrefix = "card-spend",
  delay = 160,
}: {
  db: DB;
  month?: string;
  defaultRange?: PersonalRange;
  range?: PersonalRange | undefined;
  onRangeChange?: ((next: PersonalRange) => void) | undefined;
  layoutIdPrefix?: string;
  delay?: number;
}) {
  const [uncontrolledRange, setUncontrolledRange] =
    useState<PersonalRange>(defaultRange);
  const range = controlledRange ?? uncontrolledRange;
  const setRange = (next: PersonalRange) => {
    setUncontrolledRange(next);
    onRangeChange?.(next);
  };

  const [mode, setMode] = useState<ChartMode>("bar");
  const [cardFilter, setCardFilter] = useState<CardFilter>("both");
  const anchorMonth = month || today().slice(0, 7);

  const agg = useMemo(
    () => cardSpendSeries(db, range, anchorMonth),
    [db, range, anchorMonth],
  );

  const insights = useMemo(() => {
    const pointKeys = new Set(agg.points.map((p) => p.key));
    const anchorDay = agg.points[0]?.key.slice(0, 10) ?? "";
    const r = safeKhrRate(db.settings.khrRate);
    const catByCard = {
      debit: new Map<string, number>(),
      credit: new Map<string, number>(),
    };

    for (const e of db.expenses) {
      if (expenseAccount(e) !== "Personal") continue;
      const match =
        range === "today"
          ? e.date === anchorDay
          : range === "week" || range === "1m"
            ? pointKeys.has(e.date)
            : pointKeys.has(e.date.slice(0, 7));
      if (!match) continue;
      const ck = cardKind(e.vendor);
      if (ck === "Other") continue;
      const usd = recordToUSD(e, r);
      const map = ck === "Debit" ? catByCard.debit : catByCard.credit;
      map.set(e.category, (map.get(e.category) ?? 0) + usd);
    }

    const topOf = (m: Map<string, number>) => {
      let best: { category: string; usd: number } | null = null;
      for (const [category, usd] of m.entries()) {
        if (!best || usd > best.usd) best = { category, usd };
      }
      return best;
    };

    let peak: (typeof agg.points)[number] | null = null;
    for (const pt of agg.points) {
      const v =
        cardFilter === "debit"
          ? pt.debit
          : cardFilter === "credit"
            ? pt.credit
            : pt.debit + pt.credit;
      const pv = peak
        ? cardFilter === "debit"
          ? peak.debit
          : cardFilter === "credit"
            ? peak.credit
            : peak.debit + peak.credit
        : -1;
      if (v > pv) peak = pt;
    }

    return {
      debitTop: topOf(catByCard.debit),
      creditTop: topOf(catByCard.credit),
      peak,
    };
  }, [agg, db.expenses, db.settings.khrRate, range, cardFilter]);

  const chartData = useMemo(() => [...agg.points], [agg.points]);
  const cardTotal = agg.debitUSD + agg.creditUSD;
  const debitPct =
    cardTotal > 0 ? Math.round((agg.debitUSD / cardTotal) * 100) : 0;
  const creditPct = cardTotal > 0 ? Math.max(0, 100 - debitPct) : 0;
  const debitAvg = agg.debitCount > 0 ? agg.debitUSD / agg.debitCount : 0;
  const creditAvg = agg.creditCount > 0 ? agg.creditUSD / agg.creditCount : 0;
  const activePeriods = agg.points.filter((p) =>
    cardFilter === "debit"
      ? p.debit > 0
      : cardFilter === "credit"
        ? p.credit > 0
        : p.total > 0,
  ).length;
  const selectedTotal =
    cardFilter === "debit"
      ? agg.debitUSD
      : cardFilter === "credit"
        ? agg.creditUSD
        : agg.totalUSD;
  const periodAvg = activePeriods > 0 ? selectedTotal / activePeriods : 0;
  const xInterval: number | "preserveStartEnd" =
    range === "1m" ? "preserveStartEnd" : 0;

  const periodNounPlural =
    range === "today"
      ? "slots"
      : range === "week" || range === "1m"
        ? "active days"
        : "active months";
  const periodNounSingular =
    range === "today"
      ? "slot"
      : range === "week" || range === "1m"
        ? "active day"
        : "mo";

  const toggleCardFilter = (target: "debit" | "credit") =>
    setCardFilter((cur) => (cur === target ? "both" : target));

  const renderCardTooltip = () => (
    <Tooltip
      content={({ active, payload }) => {
        if (!active || !payload?.length) return null;
        const row = payload[0]?.payload as
          (typeof agg.points)[number] | undefined;
        if (!row) return null;
        return (
          <div className="min-w-48 rounded-xl border border-border bg-popover px-3 py-2.5 text-xs text-popover-foreground shadow-lg">
            <div className="flex items-center justify-between gap-3 border-b border-border/70 pb-1.5">
              <span className="font-medium text-foreground">
                {row.fullDate}
              </span>
              <span className="font-num text-[0.68rem] text-muted-foreground">
                {row.count} tx
              </span>
            </div>
            <div className="mt-1.5 space-y-1">
              {cardFilter !== "credit" && (
                <div className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    Debit ({row.debitCount})
                  </span>
                  <span className="font-num font-semibold text-primary">
                    {money(row.debit)}
                  </span>
                </div>
              )}
              {cardFilter !== "debit" && (
                <div className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: "var(--chart-3)" }}
                    />
                    Credit ({row.creditCount})
                  </span>
                  <span className="font-num font-semibold text-foreground">
                    {money(row.credit)}
                  </span>
                </div>
              )}
              {row.other > 0 && cardFilter === "both" && (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Other / Cash</span>
                  <span className="font-num text-muted-foreground">
                    {money(row.other)}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between gap-4 border-t border-border/60 pt-1">
                <span className="font-medium text-muted-foreground">Total</span>
                <span className="font-num font-bold text-foreground">
                  {money(
                    cardFilter === "debit"
                      ? row.debit
                      : cardFilter === "credit"
                        ? row.credit
                        : row.total,
                  )}
                </span>
              </div>
            </div>
          </div>
        );
      }}
    />
  );

  return (
    <Glass delay={delay} className="flex h-full flex-col justify-between">
      <div>
        <div className="mb-3 flex flex-col gap-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-primary/30 bg-primary/12 text-primary">
                <CreditCard className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <h2 className="truncate font-medium leading-tight">
                  Debit / Credit
                </h2>
                <p className="hidden text-xs text-muted-foreground sm:block">
                  {agg.scopeLabel}
                </p>
              </div>
            </div>
            <ChartModeCycleButton mode={mode} onChange={setMode} />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <SlidingTabs
              size="xs"
              className="shrink-0"
              layoutGroup={`${layoutIdPrefix}-filter`}
              value={cardFilter}
              onChange={setCardFilter}
              options={[
                { id: "both", label: "Both" },
                { id: "debit", label: "Debit" },
                { id: "credit", label: "Credit" },
              ]}
            />
            <SlidingTabs
              size="xs"
              tone="invert"
              className="shrink-0"
              layoutGroup={`${layoutIdPrefix}-range`}
              value={range}
              onChange={setRange}
              options={CARD_RANGE_OPTIONS}
            />
          </div>
        </div>

        {/* Interactive Summary KPI Strip */}
        <div className="mb-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => toggleCardFilter("debit")}
            className={cn(
              "rounded-xl border p-3 text-left transition-all",
              cardFilter === "debit"
                ? "border-primary bg-primary/12 ring-1 ring-primary/40"
                : cardFilter === "credit"
                  ? "border-border/50 bg-secondary/40 opacity-55 hover:opacity-90"
                  : "border-border bg-secondary/60 hover:border-primary/45",
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-[0.7rem] font-medium text-muted-foreground">
                <Landmark className="h-3.5 w-3.5 text-primary" />
                Debit
              </span>
              <span className="font-num text-[0.68rem] font-semibold text-primary">
                {debitPct}%
              </span>
            </div>
            <p
              className="font-num mt-1 text-xl font-bold text-primary"
              title={money(agg.debitUSD)}
            >
              {compactMoney(agg.debitUSD)}
            </p>
            <p className="font-num mt-0.5 truncate text-[0.7rem] text-muted-foreground">
              {agg.debitCount} tx · avg {compactMoney(debitAvg)}
              {insights.debitTop ? ` · ${insights.debitTop.category}` : ""}
            </p>
          </button>

          <button
            type="button"
            onClick={() => toggleCardFilter("credit")}
            className={cn(
              "rounded-xl border p-3 text-left transition-all",
              cardFilter === "credit"
                ? "border-[var(--chart-3)] bg-secondary/80 ring-1 ring-[var(--chart-3)]/40"
                : cardFilter === "debit"
                  ? "border-border/50 bg-secondary/40 opacity-55 hover:opacity-90"
                  : "border-border bg-secondary/60 hover:border-primary/45",
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-[0.7rem] font-medium text-muted-foreground">
                <CreditCard className="h-3.5 w-3.5 text-[var(--chart-3)]" />
                Credit
              </span>
              <span className="font-num text-[0.7rem] font-semibold text-foreground">
                {creditPct}%
              </span>
            </div>
            <p
              className="font-num mt-1 text-xl font-bold"
              title={money(agg.creditUSD)}
            >
              {compactMoney(agg.creditUSD)}
            </p>
            <p className="font-num mt-0.5 truncate text-[0.7rem] text-muted-foreground">
              {agg.creditCount} tx · avg {compactMoney(creditAvg)}
              {insights.creditTop ? ` · ${insights.creditTop.category}` : ""}
            </p>
          </button>

          <div className="col-span-2 rounded-xl border border-border bg-secondary/40 p-3 sm:col-span-1">
            <div className="flex items-center justify-between gap-2">
              <span className="label-mono">
                {cardFilter === "both" ? "Total & pace" : `${cardFilter} total`}
              </span>
              <span className="font-num text-[0.68rem] text-muted-foreground">
                {activePeriods} {periodNounPlural}
              </span>
            </div>
            <p
              className="font-num mt-1 text-xl font-bold"
              title={money(selectedTotal)}
            >
              {compactMoney(selectedTotal)}
            </p>
            <p className="font-num mt-0.5 truncate text-[0.68rem] text-muted-foreground">
              Avg {compactMoney(periodAvg)} / {periodNounSingular}
              {insights.peak && insights.peak.total > 0
                ? ` · Peak ${insights.peak.label} (${compactMoney(
                    cardFilter === "debit"
                      ? insights.peak.debit
                      : cardFilter === "credit"
                        ? insights.peak.credit
                        : insights.peak.debit + insights.peak.credit,
                  )})`
                : ""}
            </p>
          </div>
        </div>

        {/* Split Bar with Labels */}
        {cardTotal > 0 && (
          <div className="mb-3 space-y-1">
            <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${debitPct}%` }}
                title={`Debit: ${money(agg.debitUSD)} (${debitPct}%)`}
              />
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${creditPct}%`,
                  background: "var(--chart-3)",
                }}
                title={`Credit: ${money(agg.creditUSD)} (${creditPct}%)`}
              />
            </div>
          </div>
        )}
      </div>

      {/* Interactive Daily / Monthly Chart */}
      <div className="h-56 w-full shrink-0">
        <ResponsiveContainer width="100%" height={224}>
          {mode === "bar" ? (
            <BarChart
              data={chartData}
              margin={{ left: 2, right: 10, top: 8, bottom: 2 }}
            >
              <CartesianGrid
                stroke="var(--border)"
                strokeDasharray="3 6"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={<TimeSlotTick />}
                axisLine={false}
                tickLine={false}
                padding={{ left: 10, right: 10 }}
                minTickGap={24}
                interval={range === "1m" ? "preserveStartEnd" : xInterval}
              />
              <YAxis
                width={46}
                tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => compactMoney(Number(v))}
              />
              {renderCardTooltip()}
              {cardFilter !== "credit" && (
                <Bar
                  name="Debit"
                  dataKey="debit"
                  fill="var(--primary)"
                  radius={[5, 5, 0, 0]}
                  animationDuration={150}
                  isAnimationActive={chartData.length <= 20}
                />
              )}
              {cardFilter !== "debit" && (
                <Bar
                  name="Credit"
                  dataKey="credit"
                  fill="var(--chart-3)"
                  radius={[5, 5, 0, 0]}
                  animationDuration={150}
                  isAnimationActive={chartData.length <= 20}
                />
              )}
            </BarChart>
          ) : mode === "line" ? (
            <LineChart
              data={chartData}
              margin={{ left: 2, right: 10, top: 8, bottom: 2 }}
            >
              <CartesianGrid
                stroke="var(--border)"
                strokeDasharray="3 6"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                minTickGap={28}
                interval={range === "1m" ? "preserveStartEnd" : xInterval}
              />
              <YAxis
                width={46}
                tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => compactMoney(Number(v))}
              />
              {renderCardTooltip()}
              {cardFilter !== "credit" && (
                <Line
                  name="Debit"
                  dataKey="debit"
                  type="monotone"
                  stroke="var(--primary)"
                  strokeWidth={2.25}
                  isAnimationActive={chartData.length <= 20}
                  animationDuration={150}
                  dot={
                    range === "1m"
                      ? false
                      : { r: 2, fill: "var(--primary)", strokeWidth: 0 }
                  }
                  activeDot={{
                    r: 4.5,
                    fill: "var(--primary)",
                    stroke: "var(--background)",
                    strokeWidth: 2,
                  }}
                />
              )}
              {cardFilter !== "debit" && (
                <Line
                  name="Credit"
                  dataKey="credit"
                  type="monotone"
                  stroke="var(--chart-3)"
                  strokeWidth={2}
                  isAnimationActive={chartData.length <= 20}
                  animationDuration={150}
                  dot={
                    range === "1m"
                      ? false
                      : { r: 2, fill: "var(--chart-3)", strokeWidth: 0 }
                  }
                  activeDot={{
                    r: 4,
                    fill: "var(--chart-3)",
                    stroke: "var(--background)",
                    strokeWidth: 2,
                  }}
                />
              )}
            </LineChart>
          ) : (
            <AreaChart
              data={chartData}
              margin={{ left: 2, right: 10, top: 8, bottom: 2 }}
            >
              <defs>
                <linearGradient
                  id={`${layoutIdPrefix}-debit`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0"
                    stopColor="var(--primary)"
                    stopOpacity={0.38}
                  />
                  <stop offset="1" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
                <linearGradient
                  id={`${layoutIdPrefix}-credit`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0"
                    stopColor="var(--chart-3)"
                    stopOpacity={0.32}
                  />
                  <stop offset="1" stopColor="var(--chart-3)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                stroke="var(--border)"
                strokeDasharray="3 6"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                minTickGap={28}
                interval={range === "1m" ? "preserveStartEnd" : xInterval}
              />
              <YAxis
                width={46}
                tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => compactMoney(Number(v))}
              />
              {renderCardTooltip()}
              {cardFilter !== "credit" && (
                <Area
                  name="Debit"
                  dataKey="debit"
                  type="monotone"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  isAnimationActive={chartData.length <= 20}
                  animationDuration={150}
                  fill={`url(#${layoutIdPrefix}-debit)`}
                />
              )}
              {cardFilter !== "debit" && (
                <Area
                  name="Credit"
                  dataKey="credit"
                  type="monotone"
                  stroke="var(--chart-3)"
                  strokeWidth={2}
                  isAnimationActive={chartData.length <= 20}
                  animationDuration={150}
                  fill={`url(#${layoutIdPrefix}-credit)`}
                />
              )}
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </Glass>
  );
}
