import { useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Btn, Glass, SlidingTabs } from "@/components/rv/ui";
import { categoryIcon } from "@/components/rv/FinanceVisuals";
import {
  buildMoneyFlowData,
  type BucketId,
  type MoneyFlowAccountScope,
  type MoneyFlowData,
  type MoneyFlowRange,
  type MoneyFlowTarget,
} from "@/lib/money-flow";
import { compactMoney, money, type Account, type DB } from "@/lib/store";
import { cn } from "@/lib/utils";

const RANGE_OPTIONS: { id: MoneyFlowRange; label: string }[] = [
  { id: "1w", label: "Week" },
  { id: "1m", label: "Month" },
  { id: "3m", label: "3M" },
  { id: "12m", label: "12M" },
];

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
  const avail = Math.max(40, usableH - totalGap);
  const sum = items.reduce((s, it) => s + it.amount, 0) || 1;

  // Enforce minimum node height then proportionally scale remainder so column fits cleanly
  const rawHeights = items.map((it) =>
    Math.max(minH, (it.amount / sum) * avail),
  );
  const rawSum = rawHeights.reduce((s, h) => s + h, 0) || 1;
  const scale = rawSum > avail ? avail / rawSum : 1;
  const heights = rawHeights.map((h) =>
    Math.max(items.length > 10 ? 6 : minH * scale, h * scale),
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
  const topY = 14;
  const rowCount = Math.max(
    flow.buckets.length,
    flow.targets.length,
    showSources ? flow.sources.length : 0,
  );
  const rowStep = compact ? 28 : 30;
  const height = Math.max(compact ? 250 : 300, rowCount * rowStep + 28);
  const usableH = height - topY * 2;
  const barW = compact ? 7 : 8;

  const srcX = compact ? 92 : 124;
  const bucketX = showSources ? Math.round(width * 0.45) : compact ? 92 : 124;
  const tgtX = showSources
    ? Math.round(width * 0.77)
    : compact
      ? 214
      : Math.round(width * 0.68);

  const sourceNodes = showSources
    ? layoutColumnNodes(
        flow.sources,
        srcX,
        barW,
        topY,
        usableH,
        12,
        14,
        (s) => ({ label: s.label }),
      )
    : [];

  const bucketNodes = layoutColumnNodes(
    flow.buckets,
    bucketX,
    barW,
    topY,
    usableH,
    12,
    16,
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
    compact ? 7 : 9,
    compact ? 9 : 11,
    (t) => ({
      label: t.label,
      bucketId: t.bucketId,
      target: t,
    }),
  );

  const nodeMap = new Map<string, PositionedNode>();
  [...sourceNodes, ...bucketNodes, ...targetNodes].forEach((n) =>
    nodeMap.set(n.id, n),
  );

  const ribbons: PositionedRibbon[] = [];

  // Source -> Bucket ribbons
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

  // Bucket -> Target ribbons
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
                : "oklch(0.83 0.13 82)"
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
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const flow = useMemo(
    () => buildMoneyFlowData(db, range, accountScope, anchorMonth),
    [db, range, accountScope, anchorMonth],
  );

  const desktopGeo = useMemo(
    () =>
      buildSankeyGeometry(flow, {
        width: 740,
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
    hideBalances ? "••••" : compact ? compactMoney(n) : money(n);

  const activeInfo = useMemo(() => {
    if (!hoveredId) return null;
    const formatAmt = (n: number) => (hideBalances ? "••••" : money(n));
    const src = flow.sources.find((s) => s.id === hoveredId);
    if (src)
      return `${src.label} · ${formatAmt(src.amount)} (${src.count} entries)`;
    const bkt = flow.buckets.find((b) => b.id === hoveredId);
    if (bkt)
      return `${bkt.label} bucket · ${formatAmt(bkt.amount)} (${bkt.pct}%)`;
    const tgt = flow.targets.find((t) => t.id === hoveredId);
    if (tgt) {
      return `${tgt.label} · ${formatAmt(tgt.amount)}${
        tgt.category && onSelectCategory ? " · click for timeline" : ""
      }`;
    }
    const rbn = desktopGeo.ribbons.find((r) => r.id === hoveredId);
    if (rbn) return `${rbn.label} · ${formatAmt(rbn.amount)}`;
    return null;
  }, [hoveredId, flow, desktopGeo.ribbons, hideBalances, onSelectCategory]);

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

  return (
    <Glass className={cn("overflow-hidden", className)}>
      {/* Header + Timeline Switch */}
      <div className="mb-3 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 shrink-0 text-primary" />
            <h2 className="truncate font-display text-base font-bold sm:text-lg">
              {accountScope === "Personal" ? "Where it went" : "Money flow"}
            </h2>
            <span className="font-num hidden text-xs text-muted-foreground sm:inline">
              · {flow.scopeLabel}
            </span>
          </div>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {activeInfo ??
              (flow.hasIncome
                ? `${flow.scopeLabel} · ${fmt(flow.totalIncome, true)} in · ${fmt(flow.totalSpend, true)} out`
                : `${flow.scopeLabel} · ${fmt(flow.totalSpend, true)} out · tap a category for its timeline`)}
          </p>
        </div>

        <SlidingTabs
          stretch
          size="xs"
          tone="invert"
          layoutGroup={`${layoutIdPrefix}-range`}
          className="w-full sm:w-auto sm:min-w-[230px]"
          value={range}
          onChange={(next) => {
            setHoveredId(null);
            setRange(next);
          }}
          options={RANGE_OPTIONS}
        />
      </div>

      {/* Empty State */}
      {flow.totalFlowBase <= 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/20 px-4 py-10 text-center">
          <Sparkles className="mb-2 h-6 w-6 text-primary/80" />
          <p className="text-sm font-semibold text-foreground">
            No money flow in {flow.scopeLabel}
          </p>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            Log spending or income to see how cash flows from your sources into
            Needs, Wants, Studio, and Future savings.
          </p>
          {onQuickLog && (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Btn
                type="button"
                variant="gold"
                onClick={() => onQuickLog("expense")}
              >
                <ArrowUpRight className="h-3.5 w-3.5" />
                Log expense
              </Btn>
              <Btn type="button" onClick={() => onQuickLog("income")}>
                <ArrowDownLeft className="h-3.5 w-3.5 text-positive" />
                Log income
              </Btn>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Source Pill Summary on Mobile (when income exists) */}
          {flow.hasIncome && (
            <div className="no-scrollbar mb-3 flex flex-nowrap items-center gap-2 overflow-x-auto pb-0.5 md:hidden">
              {flow.sources.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() =>
                    setHoveredId((cur) => (cur === s.id ? null : s.id))
                  }
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors",
                    hoveredId === s.id
                      ? "border-primary bg-primary/15 text-foreground"
                      : "border-border bg-muted/40 text-foreground",
                  )}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: s.color }}
                  />
                  <span className="font-medium">{s.label}</span>
                  <span className="font-num text-muted-foreground">
                    {fmt(s.amount, true)}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* MOBILE 2-COLUMN SANKEY ("Where it went") */}
          <div className="md:hidden">
            <div className="w-full overflow-hidden">
              <svg
                viewBox={`0 0 ${mobileGeo.width} ${mobileGeo.height}`}
                className="h-auto w-full select-none"
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
                      fillOpacity={hoveredId ? (hi ? 0.62 : 0.09) : 0.34}
                      className="transition-opacity duration-150"
                      onClick={() =>
                        setHoveredId((cur) => (cur === r.toId ? null : r.toId))
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
                      className="cursor-pointer transition-opacity duration-150"
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
                        rx={3.5}
                        fill={n.color}
                      />
                      <text
                        x={n.x - 8}
                        y={midY - 3}
                        textAnchor="end"
                        fill="var(--foreground)"
                        fontSize={11}
                        fontWeight={600}
                      >
                        {n.label}
                      </text>
                      <text
                        x={n.x - 8}
                        y={midY + 10}
                        textAnchor="end"
                        fill="var(--muted-foreground)"
                        fontSize={10}
                        className="font-num"
                      >
                        {n.subLabel}
                      </text>
                    </g>
                  );
                })}

                {mobileGeo.targetNodes.map((n) => {
                  const hi = isNodeHighlighted(n);
                  const midY = n.y + n.h / 2 + 3.5;
                  const clickable = Boolean(
                    n.target?.category && n.target?.account && onSelectCategory,
                  );
                  return (
                    <g
                      key={n.id}
                      className={cn(
                        "transition-opacity duration-150",
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
                        rx={3.5}
                        fill={n.color}
                      />
                      <text
                        x={n.x + n.w + 7}
                        y={midY}
                        fill="var(--foreground)"
                        fontSize={10.5}
                        fontWeight={500}
                      >
                        {n.label.length > 14
                          ? `${n.label.slice(0, 13)}…`
                          : n.label}{" "}
                        <tspan
                          fill="var(--muted-foreground)"
                          className="font-num"
                        >
                          {fmt(n.amount, true)}
                        </tspan>
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Mobile Bucket Legend */}
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-border/60 pt-2.5 text-xs">
              {flow.buckets.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() =>
                    setHoveredId((cur) => (cur === b.id ? null : b.id))
                  }
                  className={cn(
                    "inline-flex items-center gap-1.5 text-left transition-opacity",
                    hoveredId && hoveredId !== b.id
                      ? "opacity-45"
                      : "opacity-100",
                  )}
                >
                  <span
                    className="h-2.5 w-2.5 rounded-[3px]"
                    style={{ background: b.color }}
                  />
                  <span className="font-medium text-foreground">{b.label}</span>
                  <span className="font-num text-muted-foreground">
                    {b.pct}%
                  </span>
                </button>
              ))}
            </div>

            {/* Mobile Tappable Top Categories Strip */}
            {flow.topCategories.length > 0 && onSelectCategory && (
              <div className="mt-3 space-y-1 border-t border-border/60 pt-2.5">
                <p className="label-mono">Tap category for timeline</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {flow.topCategories.slice(0, 4).map((cat) => {
                    const Icon = categoryIcon(cat.category);
                    return (
                      <button
                        key={cat.key}
                        type="button"
                        onClick={() =>
                          onSelectCategory(cat.account, cat.category)
                        }
                        className="flex min-w-0 items-center justify-between gap-2 rounded-xl border border-border/70 bg-muted/30 px-2.5 py-2 text-left transition-colors active:scale-[0.98]"
                      >
                        <div className="flex min-w-0 items-center gap-1.5">
                          <Icon
                            className="h-3.5 w-3.5 shrink-0"
                            style={{ color: cat.color }}
                          />
                          <span className="truncate text-xs font-medium text-foreground">
                            {cat.category}
                          </span>
                        </div>
                        <span className="font-num shrink-0 text-xs font-semibold text-foreground">
                          {fmt(cat.amount, true)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* DESKTOP 3-COLUMN SANKEY + SUMMARY SIDEBAR */}
          <div className="hidden md:grid md:grid-cols-12 md:items-start md:gap-6">
            {/* SVG River Canvas */}
            <div className="md:col-span-8">
              <svg
                viewBox={`0 0 ${desktopGeo.width} ${desktopGeo.height}`}
                className="h-auto w-full select-none"
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
                      fillOpacity={hoveredId ? (hi ? 0.58 : 0.08) : 0.32}
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

                {/* Column 1: Income Sources (when present) */}
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
                        rx={4}
                        fill={n.color}
                      />
                      <text
                        x={n.x - 10}
                        y={midY - 2}
                        textAnchor="end"
                        fill="var(--foreground)"
                        fontSize={11.5}
                        fontWeight={600}
                      >
                        {n.label}
                      </text>
                      <text
                        x={n.x - 10}
                        y={midY + 12}
                        textAnchor="end"
                        fill="var(--muted-foreground)"
                        fontSize={11}
                        className="font-num"
                      >
                        {fmt(n.amount, true)}
                      </text>
                    </g>
                  );
                })}

                {/* Column 2: Buckets */}
                {desktopGeo.bucketNodes.map((n) => {
                  const hi = isNodeHighlighted(n);
                  const midY = n.y + n.h / 2;
                  const pillText = `${n.label} ${n.subLabel ?? ""}`;
                  const pillW = Math.max(74, pillText.length * 6.5 + 22);
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
                        rx={4}
                        fill={n.color}
                      />
                      {desktopGeo.showSources ? (
                        <g
                          transform={`translate(${n.x - pillW / 2 + 4}, ${midY - 11})`}
                        >
                          <rect
                            width={pillW}
                            height={22}
                            rx={11}
                            fill="var(--card)"
                            fillOpacity={0.94}
                            stroke="var(--border)"
                            strokeWidth={1}
                          />
                          <circle cx={11} cy={11} r={3.5} fill={n.color} />
                          <text
                            x={19}
                            y={14.5}
                            fill="var(--foreground)"
                            fontSize={10.5}
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
                            x={n.x - 10}
                            y={midY - 2}
                            textAnchor="end"
                            fill="var(--foreground)"
                            fontSize={12}
                            fontWeight={600}
                          >
                            {n.label}
                          </text>
                          <text
                            x={n.x - 10}
                            y={midY + 12}
                            textAnchor="end"
                            fill="var(--muted-foreground)"
                            fontSize={11}
                            className="font-num"
                          >
                            {n.subLabel} · {fmt(n.amount, true)}
                          </text>
                        </>
                      )}
                    </g>
                  );
                })}

                {/* Column 3: Expense Categories & Savings Targets */}
                {desktopGeo.targetNodes.map((n) => {
                  const hi = isNodeHighlighted(n);
                  const midY = n.y + n.h / 2 + 4;
                  const clickable = Boolean(
                    n.target?.category && n.target?.account && onSelectCategory,
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
                        rx={4}
                        fill={n.color}
                      />
                      <text
                        x={n.x + n.w + 10}
                        y={midY}
                        fill="var(--foreground)"
                        fontSize={11.5}
                        fontWeight={500}
                      >
                        {n.label.length > 20
                          ? `${n.label.slice(0, 19)}…`
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

            {/* Right Summary Column: Kept Ring + By Bucket + Top Spending */}
            <div className="space-y-5 border-l border-border/60 pl-5 md:col-span-4">
              {/* Kept Ring Hero */}
              <div className="flex items-center gap-3.5">
                <KeptDonutRing pct={flow.keptPct} hasIncome={flow.hasIncome} />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">
                    {flow.scopeLabel}
                  </p>
                  <p className="font-num truncate text-2xl font-extrabold tracking-tight text-foreground">
                    {fmt(flow.hasIncome ? flow.totalKept : flow.totalSpend)}
                  </p>
                  <p className="font-num truncate text-xs text-muted-foreground">
                    {flow.hasIncome
                      ? `left over from ${fmt(flow.totalIncome, true)} in`
                      : `spent across ${flow.targets.length} categories`}
                  </p>
                </div>
              </div>

              {/* By Bucket Proportional Bar */}
              <div>
                <p className="label-mono mb-2">By bucket</p>
                <div className="mb-3 flex h-2.5 w-full overflow-hidden rounded-full bg-muted/60">
                  {flow.buckets.map((b) => (
                    <div
                      key={b.id}
                      style={{
                        width: `${Math.max(3, b.pct)}%`,
                        background: b.color,
                      }}
                      className="h-full border-r border-background/60 last:border-r-0 transition-all duration-300"
                      title={`${b.label}: ${b.pct}%`}
                    />
                  ))}
                </div>
                <ul className="space-y-1.5 text-xs">
                  {flow.buckets.map((b) => (
                    <li key={b.id}>
                      <button
                        type="button"
                        onMouseEnter={() => setHoveredId(b.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        className="flex w-full items-center justify-between gap-2 rounded-lg px-1 py-0.5 text-left transition-colors hover:bg-muted/50"
                      >
                        <span className="flex items-center gap-2 font-medium text-foreground">
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ background: b.color }}
                          />
                          {b.label}
                        </span>
                        <span className="font-num flex items-center gap-3 text-foreground">
                          <span className="font-semibold">
                            {fmt(b.amount, true)}
                          </span>
                          <span className="w-8 text-right text-muted-foreground">
                            {b.pct}%
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Top Categories with Delta & Click-to-Inspect Timeline */}
              {flow.topCategories.length > 0 && (
                <div className="border-t border-border/60 pt-3.5">
                  <p className="label-mono mb-2">Top spending</p>
                  <ul className="space-y-1 text-xs">
                    {flow.topCategories.slice(0, 4).map((cat) => {
                      const Icon = categoryIcon(cat.category);
                      return (
                        <li key={cat.key}>
                          <button
                            type="button"
                            onClick={() =>
                              onSelectCategory?.(cat.account, cat.category)
                            }
                            className="flex w-full items-center justify-between gap-2 rounded-lg px-1.5 py-1.5 text-left transition-colors hover:bg-muted/60"
                          >
                            <span className="flex min-w-0 items-center gap-2">
                              <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                              <span className="truncate font-medium text-foreground">
                                {cat.category}
                              </span>
                            </span>
                            <span className="font-num flex shrink-0 items-center gap-2">
                              <span className="font-semibold text-foreground">
                                {fmt(cat.amount, true)}
                              </span>
                              {cat.deltaPct !== null && (
                                <span
                                  className={cn(
                                    "rounded-full px-1.5 py-0.5 text-[0.65rem] font-semibold",
                                    cat.deltaPct > 0
                                      ? "bg-destructive/15 text-destructive"
                                      : "bg-positive/15 text-positive",
                                  )}
                                >
                                  {cat.deltaPct > 0
                                    ? `↑${cat.deltaPct}%`
                                    : `↓${Math.abs(cat.deltaPct)}%`}
                                </span>
                              )}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </Glass>
  );
}
