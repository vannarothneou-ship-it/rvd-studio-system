import { useId, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  BrainCircuit,
  CalendarClock,
  CheckCircle2,
  Flame,
  Info,
  Search,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { Glass, SlidingTabs } from "@/components/rv/ui";
import { categoryIcon } from "@/components/rv/FinanceVisuals";
import {
  askCentralDB,
  computeCentralIntelligence,
  simulateCashScenario,
  type CentralInsight,
} from "@/lib/ai-central-engine";
import { compactMoney, money, shortDate, type DB } from "@/lib/store";
import { cn } from "@/lib/utils";

export type CentralAiTab = "brief" | "forecast" | "pace" | "ask";

const AI_TABS: { id: CentralAiTab; label: string; icon: typeof Sparkles }[] = [
  { id: "brief", label: "Brief", icon: Sparkles },
  { id: "forecast", label: "Forecast", icon: TrendingUp },
  { id: "pace", label: "Pace", icon: Flame },
  { id: "ask", label: "Ask DB", icon: Search },
];

const QUICK_PROMPTS = [
  "Overdue A/R?",
  "Project health?",
  "Top spending?",
  "Runway & burn",
  "Prius ODO & reminders",
];

function insightIcon(sev: CentralInsight["severity"]) {
  if (sev === "critical") return AlertTriangle;
  if (sev === "warn") return CalendarClock;
  if (sev === "good") return CheckCircle2;
  return Info;
}

function insightTone(sev: CentralInsight["severity"]) {
  if (sev === "critical") return "text-destructive";
  if (sev === "warn") return "text-primary";
  if (sev === "good") return "text-positive";
  return "text-muted-foreground";
}

export function CentralAiBrief({
  db,
  hideBalances = false,
  defaultTab = "brief",
  onInspectCategory,
  className,
}: {
  db: DB;
  hideBalances?: boolean;
  defaultTab?: CentralAiTab;
  onInspectCategory?: (category: string) => void;
  className?: string;
}) {
  const [tab, setTab] = useState<CentralAiTab>(defaultTab);
  const [horizonDays, setHorizonDays] = useState<30 | 60 | 90>(60);
  const [monthlySaveBoostUSD, setMonthlySaveBoostUSD] = useState(150);
  const [collectOverduePct, setCollectOverduePct] = useState(100);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [askedQuery, setAskedQuery] = useState("Top spending?");
  const gradId = useId().replace(/:/g, "");

  const snapshot = useMemo(() => computeCentralIntelligence(db), [db]);

  const scenario = useMemo(
    () =>
      simulateCashScenario(
        snapshot,
        { horizonDays, monthlySaveBoostUSD, collectOverduePct },
        snapshot.refDate,
      ),
    [snapshot, horizonDays, monthlySaveBoostUSD, collectOverduePct],
  );

  const qaResult = useMemo(
    () => askCentralDB(db, snapshot, askedQuery),
    [db, snapshot, askedQuery],
  );

  const mask = (v: string) => (hideBalances ? "••••" : v);

  // Build SVG path geometry for Forecast tab
  const chartGeom = useMemo(() => {
    const pts = scenario.points;
    const w = 600;
    const h = 172;
    const padX = 24;
    const padY = 18;
    const vals = pts.flatMap((p) => [p.baselineUSD, p.scenarioUSD]);
    let minVal = Math.min(...vals, 0);
    let maxVal = Math.max(...vals, 100);
    if (Math.abs(maxVal - minVal) < 50) {
      minVal -= 50;
      maxVal += 50;
    }
    const span = maxVal - minVal;
    const xAt = (i: number) =>
      padX + ((w - padX * 2) * i) / Math.max(1, pts.length - 1);
    const yAt = (v: number) =>
      h - padY - ((v - minVal) / span) * (h - padY * 2);

    const coords = pts.map((p, i) => ({
      ...p,
      x: xAt(i),
      yBase: yAt(p.baselineUSD),
      yScen: yAt(p.scenarioUSD),
    }));

    const basePath = coords
      .map(
        (c, i) =>
          `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.yBase.toFixed(1)}`,
      )
      .join(" ");
    const scenPath = coords
      .map(
        (c, i) =>
          `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.yScen.toFixed(1)}`,
      )
      .join(" ");
    const areaPath =
      coords.length > 0
        ? `${scenPath} L${coords[coords.length - 1]!.x.toFixed(1)},${(h - padY).toFixed(1)} L${coords[0]!.x.toFixed(1)},${(h - padY).toFixed(1)} Z`
        : "";
    const zeroY = minVal < 0 && maxVal > 0 ? yAt(0) : null;

    return { w, h, coords, basePath, scenPath, areaPath, zeroY };
  }, [scenario.points]);

  const activePoint =
    hoveredIdx !== null
      ? chartGeom.coords[hoveredIdx]
      : chartGeom.coords[chartGeom.coords.length - 1];

  return (
    <Glass className={cn("overflow-hidden", className)}>
      {/* Header + Tab Navigation */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
            <BrainCircuit className="h-4.5 w-4.5" />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="truncate font-display text-base font-bold sm:text-lg">
                Central AI Intelligence
              </h2>
              <span className="font-num hidden text-[0.68rem] text-muted-foreground sm:inline">
                · {snapshot.learnedRuleCount} rules · {snapshot.activeWorkCount}{" "}
                work
              </span>
            </div>
            <p className="truncate text-xs text-muted-foreground">
              Cross-ledger brief linking cash, invoices, work, goals &amp;
              reminders
            </p>
          </div>
        </div>

        <SlidingTabs
          size="xs"
          layoutGroup="central-ai-tabs"
          value={tab}
          onChange={setTab}
          options={AI_TABS}
        />
      </div>

      {/* KPI Summary Strip */}
      <div className="mt-4 grid grid-cols-2 gap-3 border-y border-border/60 py-3 sm:grid-cols-4">
        <div className="min-w-0">
          <p className="label-mono truncate">Runway</p>
          <p className="font-num mt-0.5 truncate text-base font-bold text-foreground sm:text-lg">
            {snapshot.runwayMonths !== null
              ? `${snapshot.runwayMonths} mo`
              : snapshot.netWorthLiquidUSD > 0
                ? "Self-funded"
                : "—"}
          </p>
        </div>
        <div className="min-w-0">
          <p className="label-mono truncate">Burn / mo</p>
          <p className="font-num mt-0.5 truncate text-base font-bold text-foreground sm:text-lg">
            {mask(compactMoney(snapshot.monthlyBurnUSD))}
          </p>
        </div>
        <div className="min-w-0">
          <p className="label-mono truncate">Savings rate</p>
          <p
            className={cn(
              "font-num mt-0.5 truncate text-base font-bold sm:text-lg",
              snapshot.savingsRatePct >= 20
                ? "text-positive"
                : snapshot.savingsRatePct < 0
                  ? "text-destructive"
                  : "text-foreground",
            )}
          >
            {snapshot.savingsRatePct}%
          </p>
        </div>
        <div className="min-w-0">
          <p className="label-mono truncate">Overdue A/R</p>
          <p
            className={cn(
              "font-num mt-0.5 truncate text-base font-bold sm:text-lg",
              snapshot.overdueARUSD > 0 ? "text-destructive" : "text-positive",
            )}
          >
            {mask(compactMoney(snapshot.overdueARUSD))}
          </p>
        </div>
      </div>

      {/* TAB 1: BRIEF */}
      {tab === "brief" && (
        <div className="mt-3 divide-y divide-border/60">
          {snapshot.insights.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground">
              Add transactions, invoices, or work items to generate live
              cross-ledger insights.
            </p>
          ) : (
            snapshot.insights.map((ins) => {
              const Icon = insightIcon(ins.severity);
              const toneCls = insightTone(ins.severity);
              const isCategoryInspect =
                onInspectCategory &&
                ins.area === "Cash" &&
                (ins.id.startsWith("over-") || ins.id.startsWith("watch-"));
              const categoryTarget = isCategoryInspect
                ? ins.id.replace(/^(?:over|watch)-/, "")
                : null;

              return (
                <div
                  key={ins.id}
                  className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                >
                  <div className="flex min-w-0 items-start gap-2.5">
                    <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", toneCls)} />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span
                          className={cn(
                            "text-[0.68rem] font-semibold uppercase tracking-wider",
                            toneCls,
                          )}
                        >
                          {ins.area}
                        </span>
                        {ins.metric && (
                          <span className="font-num text-[0.7rem] font-semibold text-muted-foreground">
                            ·{" "}
                            {hideBalances && ins.metric.includes("$")
                              ? "••••"
                              : ins.metric}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-foreground">
                        {ins.title}
                      </p>
                      <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                        {hideBalances
                          ? ins.detail.replace(/\$[\d,]+(?:\.\d+)?/g, "••••")
                          : ins.detail}
                      </p>
                    </div>
                  </div>

                  {categoryTarget ? (
                    <button
                      type="button"
                      onClick={() => onInspectCategory?.(categoryTarget)}
                      className="inline-flex min-h-[38px] shrink-0 items-center justify-center gap-1 self-start rounded-full border border-border bg-secondary/75 px-3.5 text-xs font-medium text-foreground transition-colors hover:border-primary/45 hover:bg-accent sm:self-center"
                    >
                      <span>{ins.actionLabel ?? "Inspect"}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-primary" />
                    </button>
                  ) : ins.actionTo ? (
                    <Link
                      to={ins.actionTo}
                      className="inline-flex min-h-[38px] shrink-0 items-center justify-center gap-1 self-start rounded-full border border-border bg-secondary/75 px-3.5 text-xs font-medium text-foreground transition-colors hover:border-primary/45 hover:bg-accent sm:self-center"
                    >
                      <span>{ins.actionLabel ?? "Open"}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-primary" />
                    </Link>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: FORECAST */}
      {tab === "forecast" && (
        <div className="mt-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold text-foreground">
                Cash trajectory · {horizonDays}-day simulation
              </p>
              {activePoint && (
                <p className="font-num mt-0.5 text-xs text-muted-foreground">
                  {shortDate(activePoint.date)} ({activePoint.label}) · Baseline{" "}
                  <span className="font-semibold text-foreground">
                    {mask(money(activePoint.baselineUSD))}
                  </span>{" "}
                  → Scenario{" "}
                  <span className="font-semibold text-primary">
                    {mask(money(activePoint.scenarioUSD))}
                  </span>
                </p>
              )}
            </div>

            <SlidingTabs
              size="xs"
              tone="invert"
              layoutGroup="ai-forecast-horizon"
              value={String(horizonDays) as "30" | "60" | "90"}
              onChange={(v) => {
                setHorizonDays(Number(v) as 30 | 60 | 90);
                setHoveredIdx(null);
              }}
              options={[
                { id: "30", label: "30d" },
                { id: "60", label: "60d" },
                { id: "90", label: "90d" },
              ]}
            />
          </div>

          {/* Interactive Dual-Line SVG Trajectory */}
          <div className="relative w-full">
            <svg
              viewBox={`0 0 ${chartGeom.w} ${chartGeom.h}`}
              className="h-44 w-full overflow-visible text-foreground"
              role="img"
              aria-label="Baseline versus what-if liquid balance forecast"
            >
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="var(--primary)"
                    stopOpacity="0.28"
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--primary)"
                    stopOpacity="0.01"
                  />
                </linearGradient>
              </defs>

              {[0.2, 0.5, 0.8].map((r) => (
                <line
                  key={r}
                  x1={24}
                  x2={chartGeom.w - 24}
                  y1={chartGeom.h * r}
                  y2={chartGeom.h * r}
                  stroke="currentColor"
                  strokeOpacity={0.08}
                  strokeWidth={1}
                />
              ))}

              {chartGeom.zeroY !== null && (
                <line
                  x1={24}
                  x2={chartGeom.w - 24}
                  y1={chartGeom.zeroY}
                  y2={chartGeom.zeroY}
                  stroke="var(--destructive)"
                  strokeOpacity={0.4}
                  strokeDasharray="3 3"
                />
              )}

              {chartGeom.areaPath && (
                <path d={chartGeom.areaPath} fill={`url(#${gradId})`} />
              )}

              {chartGeom.basePath && (
                <path
                  d={chartGeom.basePath}
                  fill="none"
                  stroke="currentColor"
                  strokeOpacity={0.35}
                  strokeWidth={2}
                  strokeDasharray="5 4"
                />
              )}

              {chartGeom.scenPath && (
                <path
                  d={chartGeom.scenPath}
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth={2.6}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {chartGeom.coords.map((pt, i) => {
                const isSelected =
                  hoveredIdx === i ||
                  (hoveredIdx === null && i === chartGeom.coords.length - 1);
                return (
                  <g
                    key={pt.label}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIdx(i)}
                    onClick={() => setHoveredIdx(i)}
                  >
                    <circle cx={pt.x} cy={pt.yScen} r={14} fill="transparent" />
                    <circle
                      cx={pt.x}
                      cy={pt.yBase}
                      r={isSelected ? 3.5 : 2}
                      fill="currentColor"
                      fillOpacity={0.45}
                    />
                    <circle
                      cx={pt.x}
                      cy={pt.yScen}
                      r={isSelected ? 5 : 3}
                      fill="var(--primary)"
                      stroke="var(--background)"
                      strokeWidth={1.5}
                    />
                    <text
                      x={pt.x}
                      y={chartGeom.h - 2}
                      textAnchor="middle"
                      className="fill-muted-foreground text-[10px]"
                    >
                      {pt.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* What-If Sliders */}
          <div className="grid grid-cols-1 gap-4 border-t border-border/60 pt-3 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">
                  Monthly save boost
                </span>
                <span className="font-num font-semibold text-primary">
                  +{money(monthlySaveBoostUSD)}/mo
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={1000}
                step={25}
                value={monthlySaveBoostUSD}
                onChange={(e) => setMonthlySaveBoostUSD(Number(e.target.value))}
                className="h-9 w-full cursor-pointer accent-primary"
              />
            </label>

            <label className="block space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">
                  Collect overdue A/R
                </span>
                <span className="font-num font-semibold text-positive">
                  {collectOverduePct}% (
                  {mask(
                    compactMoney(
                      (snapshot.overdueARUSD * collectOverduePct) / 100,
                    ),
                  )}
                  )
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={10}
                value={collectOverduePct}
                onChange={(e) => setCollectOverduePct(Number(e.target.value))}
                className="h-9 w-full cursor-pointer accent-primary"
              />
            </label>
          </div>

          {/* Scenario Outcome + Live Goal ETAs */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3 text-xs">
            <span className="text-muted-foreground">
              +{horizonDays}d liquidity uplift
            </span>
            <span className="font-num font-bold text-positive">
              {mask(money(scenario.deltaUSD, "USD", true))}
            </span>
          </div>

          {scenario.goalEtas.length > 0 && (
            <div className="divide-y divide-border/60 border-t border-border/60">
              {scenario.goalEtas.slice(0, 4).map((g) => (
                <div
                  key={g.id}
                  className="flex items-center justify-between gap-3 py-2 text-xs"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <Target className="h-3.5 w-3.5 shrink-0 text-primary" />
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-foreground">
                        {g.name}
                      </p>
                      <p className="font-num truncate text-[0.68rem] text-muted-foreground">
                        {mask(compactMoney(g.current))} /{" "}
                        {mask(compactMoney(g.target))} ·{" "}
                        {mask(money(g.monthlyRateUSD))}/mo
                      </p>
                    </div>
                  </div>
                  <span className="font-num shrink-0 font-semibold text-foreground">
                    {g.etaMonths === 0
                      ? "Funded"
                      : g.etaMonths !== null
                        ? `~${g.etaMonths} mo`
                        : `${g.pct}%`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PACE */}
      {tab === "pace" && (
        <div className="mt-3 divide-y divide-border/60">
          {snapshot.categoryPace.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground">
              No personal spending recorded for {snapshot.month} yet.
            </p>
          ) : (
            snapshot.categoryPace.map((c) => {
              const Icon = categoryIcon(c.category);
              const barPct = Math.min(100, Math.max(4, c.pct || 0));
              const barColor =
                c.status === "over"
                  ? "bg-destructive"
                  : c.status === "watch"
                    ? "bg-primary"
                    : "bg-positive";
              const rowContent = (
                <div className="w-full space-y-1.5 py-2.5 text-left">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="flex min-w-0 items-center gap-2 font-semibold text-foreground">
                      <Icon className="h-3.5 w-3.5 shrink-0 text-primary" />
                      <span className="truncate">{c.category}</span>
                    </span>
                    <span className="font-num shrink-0 text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        {mask(money(c.spentUSD))}
                      </span>
                      {c.limitUSD > 0 ? ` / ${mask(money(c.limitUSD))}` : ""}
                      {c.limitUSD > 0 ? ` · ${c.pct}%` : ""}
                    </span>
                  </div>

                  {c.limitUSD > 0 && (
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          barColor,
                        )}
                        style={{ width: `${barPct}%` }}
                      />
                    </div>
                  )}

                  <div className="font-num flex flex-wrap items-center justify-between gap-2 text-[0.68rem] text-muted-foreground">
                    <span>
                      Proj. month-end:{" "}
                      {mask(compactMoney(c.projectedMonthEndUSD))}
                    </span>
                    <span>
                      3-mo avg: {mask(compactMoney(c.baseline3moUSD))}/mo
                    </span>
                  </div>
                </div>
              );

              if (onInspectCategory) {
                return (
                  <button
                    key={c.category}
                    type="button"
                    onClick={() => onInspectCategory(c.category)}
                    className="block w-full transition-colors hover:bg-accent/35"
                  >
                    {rowContent}
                  </button>
                );
              }

              return (
                <Link
                  key={c.category}
                  to="/personal"
                  className="block w-full transition-colors hover:bg-accent/35"
                >
                  {rowContent}
                </Link>
              );
            })
          )}
        </div>
      )}

      {/* TAB 4: ASK DB */}
      {tab === "ask" && (
        <div className="mt-4 space-y-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setAskedQuery(query.trim() || askedQuery);
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask about overdue A/R, Food, runway, Debit vs Credit, ODO…"
                className="field min-h-[42px] w-full pl-9 text-sm"
              />
            </div>
            <button
              type="submit"
              className="inline-flex min-h-[42px] shrink-0 items-center justify-center rounded-xl bg-primary px-4 text-xs font-bold text-primary-foreground transition-transform active:scale-95"
            >
              Ask
            </button>
          </form>

          <div className="flex flex-wrap gap-1.5">
            {QUICK_PROMPTS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => {
                  setQuery(q);
                  setAskedQuery(q);
                }}
                className={cn(
                  "min-h-[34px] rounded-full border px-3 text-xs font-medium transition-colors",
                  askedQuery === q
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border bg-secondary/70 text-muted-foreground hover:text-foreground",
                )}
              >
                {q}
              </button>
            ))}
          </div>

          <div className="space-y-3 border-t border-border/60 pt-3">
            <p className="text-sm leading-relaxed text-foreground">
              {hideBalances
                ? qaResult.answer.replace(/\$[\d,]+(?:\.\d+)?/g, "••••")
                : qaResult.answer}
            </p>

            {qaResult.facts.length > 0 && (
              <div className="grid grid-cols-3 gap-3 border-t border-border/50 pt-2.5">
                {qaResult.facts.map((f) => (
                  <div key={f.label} className="min-w-0">
                    <p className="label-mono truncate">{f.label}</p>
                    <p className="font-num mt-0.5 truncate text-sm font-bold text-foreground">
                      {hideBalances && f.value.includes("$") ? "••••" : f.value}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {qaResult.routeHint && (
              <div>
                <Link
                  to={qaResult.routeHint.to}
                  className="inline-flex min-h-[36px] items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                >
                  <span>{qaResult.routeHint.label}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </Glass>
  );
}
