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
  BarChart3,
  CreditCard,
  Landmark,
  PieChart as PieIcon,
  TrendingUp,
} from "lucide-react";
import { Glass, SlidingTabs } from "@/components/rv/ui";
import {
  categoryIcon,
  type CategoryStatItem,
} from "@/components/rv/FinanceVisuals";
import {
  cardSpendSeries,
  compactMoney,
  expenseAccount,
  money,
  revenueByPillar,
  toUSD,
  today,
  type Account,
  type DB,
  type PersonalRange,
} from "@/lib/store";
import { cn } from "@/lib/utils";

export type ChartMode = "area" | "line" | "bar";

export const CHART_MODE_OPTIONS = [
  { id: "area" as const, label: "Area", icon: TrendingUp },
  { id: "line" as const, label: "Line", icon: TrendingUp },
  { id: "bar" as const, label: "Bar", icon: BarChart3 },
];

const PIE_PALETTE = [
  "oklch(0.83 0.13 82)", // RothVan Gold
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
          margin={{ top: 6, right: 6, bottom: 0, left: 6 }}
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
            minTickGap={46}
            tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0]?.payload as SparkPoint | undefined;
              if (!p) return null;
              return (
                <div className="rounded-xl border border-border bg-popover/95 px-3 py-2 text-xs text-popover-foreground shadow-xl backdrop-blur-md">
                  <p className="font-mono text-[0.68rem] text-muted-foreground">
                    {p.fullDate || p.label}
                  </p>
                  <p className="mt-0.5 font-mono font-semibold tabular-nums text-primary">
                    {valueLabel}: {money(p.v)}
                  </p>
                  {(p.inn !== undefined || p.out !== undefined) && (
                    <p className="mt-0.5 font-mono text-[0.68rem] tabular-nums text-muted-foreground">
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
            animationDuration={650}
            animationEasing="ease-out"
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
  xInterval = 0,
  height = 224,
}: {
  mode: ChartMode;
  data: readonly TrendRow[];
  primaryKey: string;
  primaryName: string;
  secondaryKey: string;
  secondaryName: string;
  gradientId?: string;
  xInterval?: number | "preserveStartEnd";
  height?: number;
}) {
  const chartData = useMemo(() => [...data], [data]);
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
          <div className="min-w-44 rounded-xl border border-border bg-popover/95 px-3 py-2.5 text-xs text-popover-foreground shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between gap-3 border-b border-border/70 pb-1.5">
              <span className="font-medium text-foreground">
                {row.fullDate || row.label}
              </span>
              {txCount !== undefined && (
                <span className="font-mono text-[0.65rem] tabular-nums text-muted-foreground">
                  {txCount} tx
                </span>
              )}
            </div>
            <div className="mt-1.5 space-y-1">
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  {primaryName}
                </span>
                <span className="font-mono font-semibold tabular-nums text-primary">
                  {money(primaryVal)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-muted-foreground" />
                  {secondaryName}
                </span>
                <span className="font-mono tabular-nums text-foreground">
                  {money(secondaryVal)}
                </span>
              </div>
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
            margin={{ left: -16, right: 6, top: 8, bottom: 0 }}
          >
            <CartesianGrid
              stroke="var(--border)"
              strokeDasharray="3 6"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              interval={xInterval}
            />
            <YAxis
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
              animationDuration={550}
            />
            <Bar
              name={secondaryName}
              dataKey={secondaryKey}
              fill="var(--muted-foreground)"
              fillOpacity={0.55}
              radius={[6, 6, 0, 0]}
              animationDuration={550}
            />
          </BarChart>
        ) : mode === "line" ? (
          <LineChart
            data={chartData}
            margin={{ left: -16, right: 6, top: 8, bottom: 0 }}
          >
            <CartesianGrid
              stroke="var(--border)"
              strokeDasharray="3 6"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              interval={xInterval}
            />
            <YAxis
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
              stroke="var(--primary)"
              strokeWidth={2.5}
              dot={{ r: 2.5, fill: "var(--primary)", strokeWidth: 0 }}
              activeDot={{
                r: 5,
                fill: "var(--primary)",
                stroke: "var(--background)",
                strokeWidth: 2,
              }}
              animationDuration={650}
            />
            <Line
              name={secondaryName}
              dataKey={secondaryKey}
              type="monotone"
              stroke="var(--muted-foreground)"
              strokeWidth={1.75}
              strokeDasharray="5 5"
              dot={false}
              activeDot={{ r: 4, fill: "var(--muted-foreground)" }}
              animationDuration={650}
            />
          </LineChart>
        ) : (
          <AreaChart
            data={chartData}
            margin={{ left: -16, right: 6, top: 8, bottom: 0 }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0"
                  stopColor="var(--primary)"
                  stopOpacity={0.35}
                />
                <stop offset="1" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              stroke="var(--border)"
              strokeDasharray="3 6"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              interval={xInterval}
            />
            <YAxis
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
              stroke="var(--primary)"
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              activeDot={{
                r: 4.5,
                fill: "var(--primary)",
                stroke: "var(--background)",
                strokeWidth: 2,
              }}
              animationDuration={700}
              animationEasing="ease-out"
            />
            <Area
              name={secondaryName}
              dataKey={secondaryKey}
              type="monotone"
              stroke="var(--muted-foreground)"
              strokeDasharray="5 5"
              fill="transparent"
              animationDuration={700}
              animationEasing="ease-out"
            />
          </AreaChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

type PieMode = "expenses" | "revenue" | "split";

export function BreakdownPieCard({
  db,
  account = "Personal",
  personalItems,
  studioItems,
  scopeLabel,
  onSelectCategory,
  delay = 140,
}: {
  db: DB;
  account?: Account | "Combined";
  personalItems: CategoryStatItem[];
  studioItems: CategoryStatItem[];
  scopeLabel: string;
  onSelectCategory?: (acc: Account, category: string) => void;
  delay?: number;
}) {
  const [pieMode, setPieMode] = useState<PieMode>(
    account === "Studio" ? "revenue" : "expenses",
  );

  const slices = useMemo(() => {
    if (pieMode === "revenue") {
      return revenueByPillar(db).map((x, idx) => ({
        name: x.label,
        value: Math.round(x.totalUSD * 100) / 100,
        count: x.count,
        color: PIE_PALETTE[idx % PIE_PALETTE.length]!,
        account: "Studio" as Account,
        clickable: false,
      }));
    }
    if (pieMode === "split") {
      const r = db.settings.khrRate;
      const studioTotal = db.expenses
        .filter((e) => expenseAccount(e) === "Studio")
        .reduce((s, e) => s + toUSD(e.amount, e.currency, r), 0);
      const personalTotal = db.expenses
        .filter((e) => expenseAccount(e) === "Personal")
        .reduce((s, e) => s + toUSD(e.amount, e.currency, r), 0);
      const billedTotal = revenueByPillar(db).reduce(
        (s, x) => s + x.totalUSD,
        0,
      );
      return [
        {
          name: "Studio revenue",
          value: Math.round(billedTotal * 100) / 100,
          count: db.payments.length,
          color: PIE_PALETTE[0]!,
          account: "Studio" as Account,
          clickable: false,
        },
        {
          name: "Studio expenses",
          value: Math.round(studioTotal * 100) / 100,
          count: db.expenses.filter((e) => expenseAccount(e) === "Studio")
            .length,
          color: PIE_PALETTE[2]!,
          account: "Studio" as Account,
          clickable: false,
        },
        {
          name: "Personal expenses",
          value: Math.round(personalTotal * 100) / 100,
          count: db.expenses.filter((e) => expenseAccount(e) === "Personal")
            .length,
          color: PIE_PALETTE[4]!,
          account: "Personal" as Account,
          clickable: false,
        },
      ].filter((x) => x.value > 0);
    }

    const source =
      account === "Studio"
        ? studioItems.map((i) => ({ ...i, acc: "Studio" as Account }))
        : account === "Personal"
          ? personalItems.map((i) => ({ ...i, acc: "Personal" as Account }))
          : [
              ...personalItems.map((i) => ({
                ...i,
                acc: "Personal" as Account,
              })),
              ...studioItems.map((i) => ({ ...i, acc: "Studio" as Account })),
            ].sort((a, b) => b.totalUSD - a.totalUSD);

    return source.slice(0, 8).map((item, idx) => ({
      name: item.category,
      value: Math.round(item.totalUSD * 100) / 100,
      count: item.count,
      color: PIE_PALETTE[idx % PIE_PALETTE.length]!,
      account: item.acc,
      clickable: true,
    }));
  }, [pieMode, db, account, personalItems, studioItems]);

  const total = slices.reduce((s, x) => s + x.value, 0);

  return (
    <Glass delay={delay} className="flex h-full flex-col justify-between">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <PieIcon className="h-4 w-4 text-primary" />
          <div>
            <h2 className="font-medium leading-tight">
              {pieMode === "revenue"
                ? "Revenue by pillar"
                : pieMode === "split"
                  ? "Studio vs Personal mix"
                  : `Expense breakdown · ${scopeLabel}`}
            </h2>
          </div>
        </div>
        <SlidingTabs
          size="xs"
          tone="invert"
          layoutGroup={`pie-mode-${account}`}
          value={pieMode}
          onChange={setPieMode}
          options={[
            { id: "expenses", label: "Expenses" },
            { id: "revenue", label: "Revenue" },
            { id: "split", label: "Mix" },
          ]}
        />
      </div>

      {slices.length === 0 || total <= 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          No breakdown data in this range.
        </p>
      ) : (
        <div className="grid flex-1 items-center gap-4 sm:grid-cols-[200px_minmax(0,1fr)]">
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
                  animationDuration={650}
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
                      <div className="rounded-xl border border-border bg-popover/95 px-3 py-2 text-xs text-popover-foreground shadow-xl backdrop-blur-md">
                        <p className="font-medium text-foreground">{s.name}</p>
                        <p className="mt-0.5 font-mono font-semibold tabular-nums text-primary">
                          {money(s.value)} ({pct}%)
                        </p>
                        <p className="font-mono text-[0.66rem] text-muted-foreground">
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
                className="font-display text-lg font-black tabular-nums"
                title={money(total)}
              >
                {compactMoney(total)}
              </span>
              <span className="font-mono text-[0.65rem] text-muted-foreground">
                {slices.length} slices
              </span>
            </div>
          </div>

          <ul className="space-y-1.5">
            {slices.map((s) => {
              const pct = total > 0 ? Math.round((s.value / total) * 100) : 0;
              const CatIcon = categoryIcon(s.name);
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
                  <span className="flex shrink-0 items-center gap-2 font-mono text-xs tabular-nums">
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
            className="font-display text-lg font-bold tabular-nums text-primary"
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
            margin={{ left: -20, right: 4, top: 8, bottom: 0 }}
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
            />
            <YAxis
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
                  <div className="rounded-xl border border-border bg-popover/95 px-3 py-2 text-xs text-popover-foreground shadow-xl backdrop-blur-md">
                    <p className="font-mono text-[0.68rem] text-muted-foreground">
                      {row.fullDate || row.label}
                    </p>
                    <p className="mt-0.5 font-mono font-semibold tabular-nums text-primary">
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
              animationDuration={600}
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
  { id: "1m", label: "Daily (1m)" },
  { id: "6m", label: "6 months" },
  { id: "12m", label: "12 months" },
];

export function CardSpendingChartCard({
  db,
  month,
  defaultRange = "1m",
  layoutIdPrefix = "card-spend",
  delay = 160,
}: {
  db: DB;
  month?: string;
  defaultRange?: PersonalRange;
  layoutIdPrefix?: string;
  delay?: number;
}) {
  const [range, setRange] = useState<PersonalRange>(defaultRange);
  const [mode, setMode] = useState<ChartMode>("bar");
  const anchorMonth = month || today().slice(0, 7);

  const agg = useMemo(
    () => cardSpendSeries(db, range, anchorMonth),
    [db, range, anchorMonth],
  );

  const chartData = useMemo(() => [...agg.points], [agg.points]);
  const debitPct =
    agg.totalUSD > 0 ? Math.round((agg.debitUSD / agg.totalUSD) * 100) : 0;
  const creditPct =
    agg.totalUSD > 0 ? Math.round((agg.creditUSD / agg.totalUSD) * 100) : 0;
  const xInterval: number | "preserveStartEnd" = range === "1m" ? 3 : 0;

  const renderCardTooltip = () => (
    <Tooltip
      content={({ active, payload }) => {
        if (!active || !payload?.length) return null;
        const row = payload[0]?.payload as
          (typeof agg.points)[number] | undefined;
        if (!row) return null;
        return (
          <div className="min-w-48 rounded-xl border border-border bg-popover/95 px-3 py-2.5 text-xs text-popover-foreground shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between gap-3 border-b border-border/70 pb-1.5">
              <span className="font-medium text-foreground">
                {row.fullDate}
              </span>
              <span className="font-mono text-[0.65rem] tabular-nums text-muted-foreground">
                {row.count} tx
              </span>
            </div>
            <div className="mt-1.5 space-y-1">
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  Debit ({row.debitCount})
                </span>
                <span className="font-mono font-semibold tabular-nums text-primary">
                  {money(row.debit)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: "var(--chart-3)" }}
                  />
                  Credit ({row.creditCount})
                </span>
                <span className="font-mono font-semibold tabular-nums text-foreground">
                  {money(row.credit)}
                </span>
              </div>
              {row.other > 0 && (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Other / Cash</span>
                  <span className="font-mono tabular-nums text-muted-foreground">
                    {money(row.other)}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between gap-4 border-t border-border/60 pt-1">
                <span className="font-medium text-muted-foreground">Total</span>
                <span className="font-mono font-bold tabular-nums text-foreground">
                  {money(row.total)}
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
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" />
            <div>
              <h2 className="font-medium leading-tight">
                Card spending · Debit vs Credit
              </h2>
              <p className="text-xs text-muted-foreground">{agg.scopeLabel}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <SlidingTabs
              size="xs"
              layoutGroup={`${layoutIdPrefix}-mode`}
              value={mode}
              onChange={setMode}
              options={CHART_MODE_OPTIONS}
            />
            <SlidingTabs
              size="xs"
              tone="invert"
              layoutGroup={`${layoutIdPrefix}-range`}
              value={range}
              onChange={setRange}
              options={CARD_RANGE_OPTIONS}
            />
          </div>
        </div>

        {/* Summary KPI Strip */}
        <div className="mb-3 grid grid-cols-3 gap-2.5">
          <div className="rounded-2xl border border-border/70 bg-muted/35 p-3">
            <div className="flex items-center gap-1.5 text-[0.68rem] font-medium uppercase tracking-wider text-muted-foreground">
              <Landmark className="h-3 w-3 text-primary" />
              <span>Debit card</span>
            </div>
            <p
              className="mt-1 font-display text-lg font-bold tabular-nums text-primary"
              title={money(agg.debitUSD)}
            >
              {compactMoney(agg.debitUSD)}
            </p>
            <p className="font-mono text-[0.66rem] tabular-nums text-muted-foreground">
              {agg.debitCount} tx · {debitPct}%
            </p>
          </div>

          <div className="rounded-2xl border border-border/70 bg-muted/35 p-3">
            <div className="flex items-center gap-1.5 text-[0.68rem] font-medium uppercase tracking-wider text-muted-foreground">
              <CreditCard className="h-3 w-3 text-[var(--chart-3)]" />
              <span>Credit card</span>
            </div>
            <p
              className="mt-1 font-display text-lg font-bold tabular-nums"
              title={money(agg.creditUSD)}
            >
              {compactMoney(agg.creditUSD)}
            </p>
            <p className="font-mono text-[0.66rem] tabular-nums text-muted-foreground">
              {agg.creditCount} tx · {creditPct}%
            </p>
          </div>

          <div className="rounded-2xl border border-border/70 bg-muted/35 p-3">
            <span className="label-mono">Total card spend</span>
            <p
              className="mt-1 font-display text-lg font-bold tabular-nums"
              title={money(agg.totalUSD)}
            >
              {compactMoney(agg.totalUSD)}
            </p>
            <p className="font-mono text-[0.66rem] tabular-nums text-muted-foreground">
              {agg.debitCount + agg.creditCount} card tx
            </p>
          </div>
        </div>

        {/* Split Bar */}
        {agg.totalUSD > 0 && (
          <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div className="flex h-full w-full">
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
      <div className="h-52 w-full shrink-0">
        <ResponsiveContainer width="100%" height={208}>
          {mode === "bar" ? (
            <BarChart
              data={chartData}
              margin={{ left: -18, right: 6, top: 8, bottom: 0 }}
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
                interval={xInterval}
              />
              <YAxis
                tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => compactMoney(Number(v))}
              />
              {renderCardTooltip()}
              <Bar
                name="Debit"
                dataKey="debit"
                fill="var(--primary)"
                radius={[5, 5, 0, 0]}
                animationDuration={550}
              />
              <Bar
                name="Credit"
                dataKey="credit"
                fill="var(--chart-3)"
                radius={[5, 5, 0, 0]}
                animationDuration={550}
              />
            </BarChart>
          ) : mode === "line" ? (
            <LineChart
              data={chartData}
              margin={{ left: -18, right: 6, top: 8, bottom: 0 }}
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
                interval={xInterval}
              />
              <YAxis
                tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => compactMoney(Number(v))}
              />
              {renderCardTooltip()}
              <Line
                name="Debit"
                dataKey="debit"
                type="monotone"
                stroke="var(--primary)"
                strokeWidth={2.25}
                dot={{ r: 2, fill: "var(--primary)", strokeWidth: 0 }}
                activeDot={{
                  r: 4.5,
                  fill: "var(--primary)",
                  stroke: "var(--background)",
                  strokeWidth: 2,
                }}
              />
              <Line
                name="Credit"
                dataKey="credit"
                type="monotone"
                stroke="var(--chart-3)"
                strokeWidth={2}
                dot={{ r: 2, fill: "var(--chart-3)", strokeWidth: 0 }}
                activeDot={{
                  r: 4,
                  fill: "var(--chart-3)",
                  stroke: "var(--background)",
                  strokeWidth: 2,
                }}
              />
            </LineChart>
          ) : (
            <AreaChart
              data={chartData}
              margin={{ left: -18, right: 6, top: 8, bottom: 0 }}
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
                interval={xInterval}
              />
              <YAxis
                tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => compactMoney(Number(v))}
              />
              {renderCardTooltip()}
              <Area
                name="Debit"
                dataKey="debit"
                type="monotone"
                stroke="var(--primary)"
                strokeWidth={2}
                fill={`url(#${layoutIdPrefix}-debit)`}
              />
              <Area
                name="Credit"
                dataKey="credit"
                type="monotone"
                stroke="var(--chart-3)"
                strokeWidth={2}
                fill={`url(#${layoutIdPrefix}-credit)`}
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </Glass>
  );
}
