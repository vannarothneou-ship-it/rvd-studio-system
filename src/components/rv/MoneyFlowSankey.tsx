import { lazy, Suspense, useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Eye,
  EyeOff,
  BarChart3,
  Briefcase,
  PieChart as PieIcon,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wallet,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { Btn, Glass, SlidingTabs } from "@/components/rv/ui";
import { categoryIcon } from "@/components/rv/FinanceIcons";

const LazyD3MoneyFlowChart = lazy(() =>
  import("@/components/rv/D3MoneyFlowChart").then((m) => ({
    default: m.D3MoneyFlowChart,
  })),
);
import {
  buildMoneyFlowData,
  shortFlowLabel,
  type BucketId,
  type MoneyFlowAccountScope,
  type MoneyFlowData,
  type MoneyFlowRange,
  type MoneyFlowTarget,
} from "@/lib/money-flow";
import { compactMoney, money, type Account, type DB } from "@/lib/store";
import { cn } from "@/lib/utils";

type FlowChartType = "river" | "pie" | "bar" | "line";

const RANGE_OPTIONS: { id: MoneyFlowRange; label: string }[] = [
  { id: "1w", label: "1W" },
  { id: "1m", label: "1M" },
  { id: "3m", label: "3M" },
  { id: "12m", label: "12M" },
];

const CHART_TYPE_OPTIONS: {
  id: FlowChartType;
  label: string;
  icon: LucideIcon;
}[] = [
  { id: "river", label: "River", icon: Workflow },
  { id: "pie", label: "Pie", icon: PieIcon },
  { id: "bar", label: "Bar", icon: BarChart3 },
  { id: "line", label: "Line", icon: TrendingUp },
];

const BUCKET_ICONS: Record<BucketId, LucideIcon> = {
  needs: ShieldCheck,
  wants: Wallet,
  studio: Briefcase,
  future: Sparkles,
};

interface PositionedNode {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  amount: number;
  color: string;
  label: string;
  subLabel?: string;
  bucketId?: BucketId;
  target?: MoneyFlowTarget;
}

interface PositionedRibbon {
  id: string;
  d: string;
  color: string;
  fromId: string;
  toId: string;
  bucketId: BucketId;
  amount: number;
  label: string;
}

function ribbonPath(
  x0: number,
  y0a: number,
  y0b: number,
  x1: number,
  y1a: number,
  y1b: number,
): string {
  const cx = (x0 + x1) / 2;
  return [
    `M ${x0.toFixed(1)} ${y0a.toFixed(1)}`,
    `C ${cx.toFixed(1)} ${y0a.toFixed(1)}, ${cx.toFixed(1)} ${y1a.toFixed(1)}, ${x1.toFixed(1)} ${y1a.toFixed(1)}`,
    `L ${x1.toFixed(1)} ${y1b.toFixed(1)}`,
    `C ${cx.toFixed(1)} ${y1b.toFixed(1)}, ${cx.toFixed(1)} ${y0b.toFixed(1)}, ${x0.toFixed(1)} ${y0b.toFixed(1)}`,
    "Z",
  ].join(" ");
}

function layoutColumnNodes<
  T extends { id: string; amount: number; color: string },
>(
  items: T[],
  x: number,
  w: number,
  topY: number,
  usableH: number,
  gap: number,
  minH: number,
  buildMeta: (
    item: T,
  ) => Pick<PositionedNode, "label" | "subLabel" | "bucketId" | "target">,
): PositionedNode[] {
  if (items.length === 0) return [];
  const totalGap = gap * Math.max(0, items.length - 1);
  const avail = Math.max(48, usableH - totalGap);
  const sum = items.reduce((s, it) => s + it.amount, 0) || 1;

  const rawHeights = items.map((it) =>
    Math.max(minH, (it.amount / sum) * avail),
  );
  const rawSum = rawHeights.reduce((s, h) => s + h, 0) || 1;
  const scale = rawSum > avail ? avail / rawSum : 1;
  const heights = rawHeights.map((h) =>
    Math.max(items.length > 10 ? 8 : minH * scale, h * scale),
  );
  const totalColH =
    heights.reduce((s, h) => s + h, 0) + gap * Math.max(0, items.length - 1);
  let curY = topY + Math.max(0, (usableH - totalColH) / 2);

  return items.map((it, idx) => {
    const h = heights[idx]!;
    const meta = buildMeta(it);
    const node: PositionedNode = {
      id: it.id,
      x,
      y: curY,
      w,
      h,
      amount: it.amount,
      color: it.color,
      ...meta,
    };
    curY += h + gap;
    return node;
  });
}

function buildSankeyGeometry(
  flow: MoneyFlowData,
  opts: {
    width: number;
    showSources: boolean;
    compact?: boolean;
  },
) {
  const { width, showSources, compact = false } = opts;
  const topY = compact ? 12 : 16;
  const rowCount = Math.max(
    flow.buckets.length,
    flow.targets.length,
    showSources ? flow.sources.length : 0,
  );
  const rowStep = compact ? 27 : 38;
  const height = Math.max(
    compact ? 250 : 380,
    rowCount * rowStep + (compact ? 20 : 34),
  );
  const usableH = height - topY * 2;
  const barW = compact ? 10 : 12;

  const srcX = compact ? 86 : 112;
  const bucketX = showSources ? Math.round(width * 0.44) : compact ? 86 : 112;
  const tgtX = showSources
    ? Math.round(width * 0.77)
    : compact
      ? 206
      : Math.round(width * 0.66);

  const sourceNodes = showSources
    ? layoutColumnNodes(
        flow.sources,
        srcX,
        barW,
        topY,
        usableH,
        14,
        18,
        (s) => ({ label: shortFlowLabel(s.label) }),
      )
    : [];

  const bucketNodes = layoutColumnNodes(
    flow.buckets,
    bucketX,
    barW,
    topY,
    usableH,
    14,
    20,
    (b) => ({
      label: b.label,
      subLabel: `${b.pct}%`,
      bucketId: b.id,
    }),
  );

  const targetNodes = layoutColumnNodes(
    flow.targets,
    tgtX,
    barW,
    topY,
    usableH,
    compact ? 9 : 11,
    compact ? 11 : 13,
    (t) => ({
      label: shortFlowLabel(t.label),
      bucketId: t.bucketId,
      target: t,
    }),
  );

  const nodeMap = new Map<string, PositionedNode>();
  [...sourceNodes, ...bucketNodes, ...targetNodes].forEach((n) =>
    nodeMap.set(n.id, n),
  );

  const ribbons: PositionedRibbon[] = [];

  if (showSources) {
    const srcOutOffset = new Map<string, number>();
    const bktInOffset = new Map<string, number>();
    const srcTotals = new Map<string, number>();
    const bktInTotals = new Map<string, number>();

    for (const l of flow.sourceToBucketLinks) {
      srcTotals.set(l.fromId, (srcTotals.get(l.fromId) ?? 0) + l.amount);
      bktInTotals.set(l.toId, (bktInTotals.get(l.toId) ?? 0) + l.amount);
    }

    for (const l of flow.sourceToBucketLinks) {
      const from = nodeMap.get(l.fromId);
      const to = nodeMap.get(l.toId);
      if (!from || !to) continue;
      const fromShare = l.amount / (srcTotals.get(l.fromId) || 1);
      const toShare = l.amount / (bktInTotals.get(l.toId) || 1);
      const fh = from.h * fromShare;
      const th = to.h * toShare;
      const fy0 = from.y + (srcOutOffset.get(from.id) ?? 0);
      const ty0 = to.y + (bktInOffset.get(to.id) ?? 0);
      srcOutOffset.set(from.id, (srcOutOffset.get(from.id) ?? 0) + fh);
      bktInOffset.set(to.id, (bktInOffset.get(to.id) ?? 0) + th);

      ribbons.push({
        id: l.id,
        d: ribbonPath(from.x + from.w, fy0, fy0 + fh, to.x, ty0, ty0 + th),
        color: l.color,
        fromId: l.fromId,
        toId: l.toId,
        bucketId: l.bucketId,
        amount: l.amount,
        label: `${from.label} → ${to.label}`,
      });
    }
  }

  const bktOutOffset = new Map<string, number>();
  const bktOutTotals = new Map<string, number>();
  for (const l of flow.bucketToTargetLinks) {
    bktOutTotals.set(l.fromId, (bktOutTotals.get(l.fromId) ?? 0) + l.amount);
  }
  for (const l of flow.bucketToTargetLinks) {
    const from = nodeMap.get(l.fromId);
    const to = nodeMap.get(l.toId);
    if (!from || !to) continue;
    const fromShare = l.amount / (bktOutTotals.get(from.id) || 1);
    const fh = from.h * fromShare;
    const fy0 = from.y + (bktOutOffset.get(from.id) ?? 0);
    bktOutOffset.set(from.id, (bktOutOffset.get(from.id) ?? 0) + fh);

    ribbons.push({
      id: l.id,
      d: ribbonPath(from.x + from.w, fy0, fy0 + fh, to.x, to.y, to.y + to.h),
      color: l.color,
      fromId: l.fromId,
      toId: l.toId,
      bucketId: l.bucketId,
      amount: l.amount,
      label: `${from.label} → ${to.label}`,
    });
  }

  return {
    width,
    height,
    sourceNodes,
    bucketNodes,
    targetNodes,
    ribbons,
    showSources,
  };
}

function KeptDonutRing({
  pct,
  hasIncome,
}: {
  pct: number;
  hasIncome: boolean;
}) {
  const r = 28;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, pct));
  const dash = (clamped / 100) * c;

  return (
    <div className="relative grid h-[72px] w-[72px] shrink-0 place-items-center">
      <svg viewBox="0 0 72 72" className="h-full w-full -rotate-90">
        <circle
          cx="36"
          cy="36"
          r={r}
          fill="none"
          stroke="var(--border)"
          strokeWidth="6.5"
        />
        <circle
          cx="36"
          cy="36"
          r={r}
          fill="none"
          stroke={
            hasIncome
              ? clamped >= 15
                ? "oklch(0.68 0.12 245)"
                : "var(--primary)"
              : "oklch(0.75 0.13 155)"
          }
          strokeWidth="6.5"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center leading-none">
        <span className="font-num text-sm font-bold text-foreground">
          {hasIncome ? `${clamped}%` : "Out"}
        </span>
        <span className="mt-0.5 text-[0.6rem] text-muted-foreground">
          {hasIncome ? "kept" : "flow"}
        </span>
      </div>
    </div>
  );
}

export function MoneyFlowSankeyCard({
  db,
  accountScope = "all",
  anchorMonth,
  hideBalances = false,
  onSelectCategory,
  onQuickLog,
  layoutIdPrefix = "money-flow",
  className,
}: {
  db: DB;
  accountScope?: MoneyFlowAccountScope;
  anchorMonth?: string;
  hideBalances?: boolean;
  onSelectCategory?: (account: Account, category: string) => void;
  onQuickLog?: (kind: "expense" | "income") => void;
  layoutIdPrefix?: string;
  className?: string;
}) {
  const [range, setRange] = useState<MoneyFlowRange>("1m");
  const [chartType, setChartType] = useState<FlowChartType>("river");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [showBalances, setShowBalances] = useState(!hideBalances);
  const balancesHidden = hideBalances || !showBalances;

  const flow = useMemo(
    () => buildMoneyFlowData(db, range, accountScope, anchorMonth),
    [db, range, accountScope, anchorMonth],
  );

  const desktopGeo = useMemo(
    () =>
      buildSankeyGeometry(flow, {
        width: 720,
        showSources: flow.hasIncome,
        compact: false,
      }),
    [flow],
  );

  const mobileGeo = useMemo(
    () =>
      buildSankeyGeometry(flow, {
        width: 356,
        showSources: false,
        compact: true,
      }),
    [flow],
  );

  const fmt = (n: number, compact = false) =>
    balancesHidden ? "••••" : compact ? compactMoney(n) : money(n);

  const activeInfo = useMemo(() => {
    if (!hoveredId) return null;
    const formatAmt = (n: number) => (balancesHidden ? "••••" : money(n));
    const src = flow.sources.find((s) => s.id === hoveredId);
    if (src)
      return `${shortFlowLabel(src.label)} · ${formatAmt(src.amount)} (${src.count})`;
    const bkt = flow.buckets.find((b) => b.id === hoveredId);
    if (bkt) return `${bkt.label} · ${formatAmt(bkt.amount)} (${bkt.pct}%)`;
    const tgt = flow.targets.find((t) => t.id === hoveredId);
    if (tgt) {
      return `${shortFlowLabel(tgt.label)} · ${formatAmt(tgt.amount)}`;
    }
    const rbn = desktopGeo.ribbons.find((r) => r.id === hoveredId);
    if (rbn) return `${rbn.label} · ${formatAmt(rbn.amount)}`;
    return null;
  }, [hoveredId, flow, desktopGeo.ribbons, balancesHidden]);

  const isRibbonHighlighted = (r: PositionedRibbon) => {
    if (!hoveredId) return true;
    return (
      r.id === hoveredId ||
      r.fromId === hoveredId ||
      r.toId === hoveredId ||
      r.bucketId === hoveredId
    );
  };

  const isNodeHighlighted = (n: PositionedNode) => {
    if (!hoveredId) return true;
    if (n.id === hoveredId || n.bucketId === hoveredId) return true;
    return desktopGeo.ribbons.some(
      (r) =>
        (r.fromId === hoveredId ||
          r.toId === hoveredId ||
          r.bucketId === hoveredId ||
          r.id === hoveredId) &&
        (r.fromId === n.id || r.toId === n.id || r.bucketId === n.id),
    );
  };

  const handleTargetClick = (t?: MoneyFlowTarget) => {
    if (!t?.category || !t.account || !onSelectCategory) return;
    onSelectCategory(t.account, t.category);
  };

  const pieData = useMemo(
    () =>
      flow.targets
        .filter((t) => !t.isSurplus && t.amount > 0)
        .slice(0, 8)
        .map((t) => ({
          id: t.id,
          label: shortFlowLabel(t.label),
          value: Math.round(t.amount * 100) / 100,
          color: t.color,
          account: t.account,
          category: t.category,
        })),
    [flow.targets],
  );

  return (
    <Glass className={cn("overflow-hidden", className)}>
      {/* Header + Right-Aligned Chart Type & Range Controls */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2.5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Workflow className="h-4 w-4 shrink-0 text-primary" />
            <h2 className="truncate font-display text-base font-bold sm:text-lg">
              {accountScope === "Personal" ? "Where it went" : "Money flow"}
            </h2>
            <span className="font-num hidden text-xs text-muted-foreground sm:inline">
              · {flow.scopeLabel}
            </span>
            <button
              type="button"
              onClick={() => setShowBalances((value) => !value)}
              aria-label={
                balancesHidden
                  ? "Show financial amounts"
                  : "Hide financial amounts"
              }
              aria-pressed={balancesHidden}
              title={balancesHidden ? "Show amounts" : "Hide amounts"}
              className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {balancesHidden ? (
                <EyeOff className="h-3.5 w-3.5" />
              ) : (
                <Eye className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {activeInfo ??
              (flow.hasIncome
                ? `${fmt(flow.totalIncome, true)} in · ${fmt(flow.totalSpend, true)} out`
                : `${fmt(flow.totalSpend, true)} out`)}
          </p>
        </div>

        <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
          <SlidingTabs
            iconOnly
            size="xs"
            layoutGroup={`${layoutIdPrefix}-type`}
            className="shrink-0"
            value={chartType}
            onChange={(next) => {
              setHoveredId(null);
              setChartType(next);
            }}
            options={CHART_TYPE_OPTIONS}
          />
          <SlidingTabs
            size="xs"
            tone="invert"
            layoutGroup={`${layoutIdPrefix}-range`}
            className="shrink-0"
            value={range}
            onChange={(next) => {
              setHoveredId(null);
              setRange(next);
            }}
            options={RANGE_OPTIONS}
          />
        </div>
      </div>

      {/* Empty State */}
      {flow.totalFlowBase <= 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/20 px-4 py-10 text-center">
          <Sparkles className="mb-2 h-6 w-6 text-primary/80" />
          <p className="text-sm font-semibold text-foreground">
            No flow in {flow.scopeLabel}
          </p>
          {onQuickLog && (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Btn
                type="button"
                variant="gold"
                onClick={() => onQuickLog("expense")}
              >
                <ArrowUpRight className="h-3.5 w-3.5" />
                Expense
              </Btn>
              <Btn type="button" onClick={() => onQuickLog("income")}>
                <ArrowDownLeft className="h-3.5 w-3.5 text-positive" />
                Income
              </Btn>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-start">
          {/* Primary Visual Canvas (River / Pie / Bar / Line) */}
          <div className="min-w-0 lg:col-span-9">
            {chartType === "river" && (
              <>
                {/* Source Pills on Mobile (when income exists) */}
                {flow.hasIncome && (
                  <div className="no-scrollbar mb-3 flex flex-nowrap items-center gap-1.5 overflow-x-auto pb-0.5 md:hidden">
                    {flow.sources.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() =>
                          setHoveredId((cur) => (cur === s.id ? null : s.id))
                        }
                        className={cn(
                          "inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs transition-colors",
                          hoveredId === s.id
                            ? "border-primary bg-primary/15 text-foreground"
                            : "border-border bg-muted/40 text-foreground",
                        )}
                      >
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ background: s.color }}
                        />
                        <span className="font-medium">
                          {shortFlowLabel(s.label)}
                        </span>
                        <span className="font-num text-muted-foreground">
                          {fmt(s.amount, true)}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Mobile Bigger 2-Column Sankey */}
                <div className="md:hidden">
                  <svg
                    viewBox={`0 0 ${mobileGeo.width} ${mobileGeo.height}`}
                    className="flow-chart-in h-auto w-full select-none"
                    role="img"
                    aria-label="Money flow river chart"
                  >
                    {mobileGeo.ribbons.map((r) => {
                      const hi = isRibbonHighlighted(r);
                      return (
                        <path
                          key={r.id}
                          d={r.d}
                          fill={r.color}
                          fillOpacity={hoveredId ? (hi ? 0.65 : 0.09) : 0.36}
                          className="flow-ribbon-in transition-opacity duration-200"
                          onClick={() =>
                            setHoveredId((cur) =>
                              cur === r.toId ? null : r.toId,
                            )
                          }
                        />
                      );
                    })}

                    {mobileGeo.bucketNodes.map((n) => {
                      const hi = isNodeHighlighted(n);
                      const midY = n.y + n.h / 2;
                      return (
                        <g
                          key={n.id}
                          className="flow-node-in cursor-pointer transition-opacity duration-200"
                          opacity={hi ? 1 : 0.3}
                          onClick={() =>
                            setHoveredId((cur) => (cur === n.id ? null : n.id))
                          }
                        >
                          <rect
                            x={n.x}
                            y={n.y}
                            width={n.w}
                            height={n.h}
                            rx={4.5}
                            fill={n.color}
                          />
                          <text
                            x={n.x - 9}
                            y={midY - 3}
                            textAnchor="end"
                            fill="var(--foreground)"
                            fontSize={12}
                            fontWeight={600}
                          >
                            {n.label}
                          </text>
                          <text
                            x={n.x - 9}
                            y={midY + 11}
                            textAnchor="end"
                            fill="var(--muted-foreground)"
                            fontSize={10.5}
                            className="font-num"
                          >
                            {n.subLabel}
                          </text>
                        </g>
                      );
                    })}

                    {mobileGeo.targetNodes.map((n) => {
                      const hi = isNodeHighlighted(n);
                      const midY = n.y + n.h / 2 + 4;
                      const clickable = Boolean(
                        n.target?.category &&
                        n.target?.account &&
                        onSelectCategory,
                      );
                      return (
                        <g
                          key={n.id}
                          className={cn(
                            "flow-node-in transition-opacity duration-200",
                            clickable && "cursor-pointer",
                          )}
                          opacity={hi ? 1 : 0.3}
                          onClick={() => handleTargetClick(n.target)}
                        >
                          <rect
                            x={n.x}
                            y={n.y}
                            width={n.w}
                            height={n.h}
                            rx={4.5}
                            fill={n.color}
                          />
                          <text
                            x={n.x + n.w + 8}
                            y={midY}
                            fill="var(--foreground)"
                            fontSize={11.5}
                            fontWeight={500}
                          >
                            {n.label.length > 11
                              ? `${n.label.slice(0, 10)}…`
                              : n.label}{" "}
                            <tspan
                              fill="var(--muted-foreground)"
                              className="font-num"
                              fontWeight={600}
                            >
                              {fmt(n.amount, true)}
                            </tspan>
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* Desktop Bigger 3-Column Sankey */}
                <div className="hidden md:block">
                  <svg
                    viewBox={`0 0 ${desktopGeo.width} ${desktopGeo.height}`}
                    className="flow-chart-in h-auto w-full select-none"
                    role="img"
                    aria-label="Interactive money flow Sankey diagram"
                  >
                    {desktopGeo.ribbons.map((r) => {
                      const hi = isRibbonHighlighted(r);
                      return (
                        <path
                          key={r.id}
                          d={r.d}
                          fill={r.color}
                          fillOpacity={hoveredId ? (hi ? 0.62 : 0.08) : 0.34}
                          className="cursor-pointer transition-opacity duration-150"
                          onMouseEnter={() => setHoveredId(r.id)}
                          onMouseLeave={() => setHoveredId(null)}
                        >
                          <title>
                            {r.label}: {fmt(r.amount)}
                          </title>
                        </path>
                      );
                    })}

                    {desktopGeo.sourceNodes.map((n) => {
                      const hi = isNodeHighlighted(n);
                      const midY = n.y + n.h / 2;
                      return (
                        <g
                          key={n.id}
                          className="cursor-pointer transition-opacity duration-150"
                          opacity={hi ? 1 : 0.28}
                          onMouseEnter={() => setHoveredId(n.id)}
                          onMouseLeave={() => setHoveredId(null)}
                        >
                          <rect
                            x={n.x}
                            y={n.y}
                            width={n.w}
                            height={n.h}
                            rx={5}
                            fill={n.color}
                          />
                          <text
                            x={n.x - 10}
                            y={midY - 2}
                            textAnchor="end"
                            fill="var(--foreground)"
                            fontSize={12.5}
                            fontWeight={600}
                          >
                            {n.label}
                          </text>
                          <text
                            x={n.x - 10}
                            y={midY + 13}
                            textAnchor="end"
                            fill="var(--muted-foreground)"
                            fontSize={11.5}
                            className="font-num"
                          >
                            {fmt(n.amount, true)}
                          </text>
                        </g>
                      );
                    })}

                    {desktopGeo.bucketNodes.map((n) => {
                      const hi = isNodeHighlighted(n);
                      const midY = n.y + n.h / 2;
                      const pillText = `${n.label} ${n.subLabel ?? ""}`;
                      const pillW = Math.max(76, pillText.length * 6.8 + 24);
                      return (
                        <g
                          key={n.id}
                          className="cursor-pointer transition-opacity duration-150"
                          opacity={hi ? 1 : 0.28}
                          onMouseEnter={() => setHoveredId(n.id)}
                          onMouseLeave={() => setHoveredId(null)}
                        >
                          <rect
                            x={n.x}
                            y={n.y}
                            width={n.w}
                            height={n.h}
                            rx={5}
                            fill={n.color}
                          />
                          {desktopGeo.showSources ? (
                            <g
                              transform={`translate(${n.x - pillW / 2 + 5}, ${midY - 12})`}
                            >
                              <rect
                                width={pillW}
                                height={24}
                                rx={12}
                                fill="var(--card)"
                                fillOpacity={0.95}
                                stroke="var(--border)"
                                strokeWidth={1}
                              />
                              <circle cx={12} cy={12} r={4} fill={n.color} />
                              <text
                                x={21}
                                y={15.5}
                                fill="var(--foreground)"
                                fontSize={11}
                                fontWeight={600}
                              >
                                {n.label}{" "}
                                <tspan
                                  fill="var(--muted-foreground)"
                                  className="font-num"
                                >
                                  {n.subLabel}
                                </tspan>
                              </text>
                            </g>
                          ) : (
                            <>
                              <text
                                x={n.x - 12}
                                y={midY - 2}
                                textAnchor="end"
                                fill="var(--foreground)"
                                fontSize={13}
                                fontWeight={600}
                              >
                                {n.label}
                              </text>
                              <text
                                x={n.x - 12}
                                y={midY + 13}
                                textAnchor="end"
                                fill="var(--muted-foreground)"
                                fontSize={11.5}
                                className="font-num"
                              >
                                {n.subLabel} · {fmt(n.amount, true)}
                              </text>
                            </>
                          )}
                        </g>
                      );
                    })}

                    {desktopGeo.targetNodes.map((n) => {
                      const hi = isNodeHighlighted(n);
                      const midY = n.y + n.h / 2 + 4.5;
                      const clickable = Boolean(
                        n.target?.category &&
                        n.target?.account &&
                        onSelectCategory,
                      );
                      return (
                        <g
                          key={n.id}
                          className={cn(
                            "transition-opacity duration-150",
                            clickable && "cursor-pointer",
                          )}
                          opacity={hi ? 1 : 0.28}
                          onMouseEnter={() => setHoveredId(n.id)}
                          onMouseLeave={() => setHoveredId(null)}
                          onClick={() => handleTargetClick(n.target)}
                        >
                          <rect
                            x={n.x}
                            y={n.y}
                            width={n.w}
                            height={n.h}
                            rx={5}
                            fill={n.color}
                          />
                          <text
                            x={n.x + n.w + 10}
                            y={midY}
                            fill="var(--foreground)"
                            fontSize={12.5}
                            fontWeight={500}
                          >
                            {n.label.length > 16
                              ? `${n.label.slice(0, 15)}…`
                              : n.label}{" "}
                            <tspan
                              fill="var(--muted-foreground)"
                              className="font-num"
                              fontWeight={600}
                            >
                              {fmt(n.amount, true)}
                            </tspan>
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </>
            )}

            {chartType !== "river" && (
              <Suspense
                fallback={
                  <div className="grid min-h-[240px] place-items-center rounded-xl border border-border/60 bg-muted/20 text-xs text-muted-foreground">
                    Loading chart…
                  </div>
                }
              >
                <LazyD3MoneyFlowChart
                  chartType={chartType}
                  range={range}
                  pieData={pieData}
                  buckets={flow.buckets}
                  timelinePoints={flow.timelinePoints}
                  hasIncome={flow.hasIncome}
                  totalSpend={flow.totalSpend}
                  formatMoney={(n) => fmt(n, false)}
                  formatCompact={(n) => fmt(n, true)}
                  onSelectCategory={onSelectCategory}
                  onHoverId={setHoveredId}
                />
              </Suspense>
            )}
          </div>

          {/* Right / Bottom Decluttered Summary Column */}
          <div className="space-y-4 border-t border-border pt-4 lg:col-span-3 lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0">
            <div className="flex items-center gap-3">
              <KeptDonutRing pct={flow.keptPct} hasIncome={flow.hasIncome} />
              <div className="min-w-0">
                <p className="label-mono">
                  {flow.hasIncome ? "Leftover" : "Total out"}
                </p>
                <p className="font-num truncate text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                  {fmt(flow.hasIncome ? flow.totalKept : flow.totalSpend)}
                </p>
                <p className="font-num truncate text-[0.72rem] text-muted-foreground">
                  {flow.hasIncome
                    ? `of ${fmt(flow.totalIncome, true)}`
                    : `${flow.targets.length} categories`}
                </p>
              </div>
            </div>

            {/* Clean Proportional Allocation Bar + Rows */}
            <div className="space-y-2">
              <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
                {flow.buckets.map((b) => (
                  <div
                    key={b.id}
                    style={{
                      width: `${Math.max(3, b.pct)}%`,
                      background: b.color,
                    }}
                    className="h-full border-r border-card last:border-r-0 transition-all duration-300"
                    title={`${b.label}: ${b.pct}%`}
                  />
                ))}
              </div>
              <div className="divide-y divide-border/70">
                {flow.buckets.map((b) => {
                  const BIcon = BUCKET_ICONS[b.id];
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() =>
                        setHoveredId((cur) => (cur === b.id ? null : b.id))
                      }
                      onMouseEnter={() => setHoveredId(b.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 px-1.5 py-1.5 text-left text-xs transition-colors",
                        hoveredId === b.id
                          ? "bg-primary/12 text-foreground"
                          : "hover:bg-muted/60",
                      )}
                    >
                      <span className="flex min-w-0 items-center gap-1.5 font-medium text-foreground">
                        <BIcon
                          className="h-3.5 w-3.5 shrink-0"
                          style={{ color: b.color }}
                        />
                        <span className="truncate">{b.label}</span>
                      </span>
                      <span className="font-num flex shrink-0 items-center gap-1.5">
                        <span className="font-semibold">
                          {fmt(b.amount, true)}
                        </span>
                        <span className="text-[0.68rem] text-muted-foreground">
                          {b.pct}%
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Top Categories (Clean Table List) */}
            {flow.topCategories.length > 0 && (
              <div className="border-t border-border pt-3">
                <p className="label-mono mb-1.5">Top spending</p>
                <div className="divide-y divide-border/70">
                  {flow.topCategories.slice(0, 4).map((cat) => {
                    const Icon = categoryIcon(cat.category);
                    return (
                      <button
                        key={cat.key}
                        type="button"
                        onClick={() =>
                          onSelectCategory?.(cat.account, cat.category)
                        }
                        className="flex w-full min-w-0 items-center justify-between gap-2 px-1.5 py-1.5 text-left text-xs transition-colors hover:bg-muted/60"
                      >
                        <span className="flex min-w-0 items-center gap-1.5">
                          <Icon
                            className="h-3.5 w-3.5 shrink-0"
                            style={{ color: cat.color }}
                          />
                          <span className="truncate font-medium text-foreground">
                            {shortFlowLabel(cat.category)}
                          </span>
                        </span>
                        <span className="font-num shrink-0 font-semibold text-foreground">
                          {fmt(cat.amount, true)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Glass>
  );
}
