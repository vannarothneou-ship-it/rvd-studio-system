import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import {
  Activity,
  ArrowDownLeft,
  ArrowUpRight,
  Eye,
  EyeOff,
  PiggyBank,
  Plus,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import {
  Btn,
  Empty,
  Glass,
  PageHeader,
  SlidingTabs,
  Stat,
} from "@/components/rv/ui";
import { EditModal, upsert } from "@/components/rv/Crud";
import {
  AnimatedNumber,
  BudgetShelf,
  CategoryInspectorDrawer,
  GoalPlannerDrawer,
  GoalRingCard,
  categoryIcon,
  expenseItemIcon,
  incomeSourceIcon,
} from "@/components/rv/FinanceVisuals";
import {
  BreakdownPieCard,
  CHART_LENS_OPTIONS,
  CardSpendingChartCard,
  ChartModeCycleButton,
  PeriodBarPulseCard,
  SparklineWithDates,
  TrendChartCanvas,
  type ChartLens,
  type ChartMode,
} from "@/components/rv/Charts";
import {
  EditLayoutButton,
  EditableBentoGrid,
  type BentoWidgetDef,
} from "@/components/rv/BentoGrid";
import { MonthPicker } from "@/components/rv/MonthPicker";
import { MoneyFlowSankeyCard } from "@/components/rv/MoneyFlowSankey";
import {
  QuickExpenseDrawer,
  QuickIncomeDrawer,
} from "@/components/rv/QuickTxDrawer";
import { WorkspaceBalanceCard } from "@/components/rv/WorkspaceBalanceCard";
import {
  PERSONAL_CATEGORIES,
  PERSONAL_INCOME_SOURCES,
  compactMoney,
  expenseAccount,
  goalAccount,
  money,
  periodBreakdownBars,
  personalCategoryTotals,
  personalIncomeSourceTotals,
  personalIncomeTotal,
  personalSeries,
  setDB,
  shortDate,
  toUSD,
  today,
  uid,
  useDB,
  type Expense,
  type Goal,
  type PersonalIncome,
  type PersonalRange,
} from "@/lib/store";
import { cn } from "@/lib/utils";

const RECENT_ROWS = 8;

export const Route = createFileRoute("/personal")({
  head: () => ({
    meta: [
      { title: "Personal Money · Income & Spending" },
      {
        name: "description",
        content:
          "Personal income, daily spending, debit vs credit card tracking, budget jars, and saving goals.",
      },
      { property: "og:title", content: "Personal Money · Income & Spending" },
      {
        property: "og:description",
        content:
          "Personal income, daily spending, debit vs credit card tracking, budget jars, and saving goals.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PersonalPage,
});

const PERSONAL_RANGES: { id: PersonalRange; label: string; desc: string }[] = [
  { id: "today", label: "Today", desc: "today" },
  { id: "week", label: "1W", desc: "last 7 days" },
  { id: "1m", label: "1M", desc: "this month" },
  { id: "6m", label: "6M", desc: "last 6 months" },
  { id: "12m", label: "12M", desc: "last 12 months" },
];

type LedgerView = "all" | "spending" | "income";

function PersonalPage() {
  const db = useDB((d) => d);
  const r = db.settings.khrRate;
  const [personalRange, setPersonalRange] = useState<PersonalRange>("today");
  const [chartMode, setChartMode] = useState<ChartMode>("area");
  const [chartLens, setChartLens] = useState<ChartLens>("flow");
  const [month, setMonth] = useState(() => today().slice(0, 7));
  const [ledgerView, setLedgerView] = useState<LedgerView>("all");
  const [catFilter, setCatFilter] = useState<string>("All");
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(RECENT_ROWS);
  const [editingLayout, setEditingLayout] = useState(false);
  const [inspectedCategory, setInspectedCategory] = useState<string | null>(
    null,
  );
  const [expenseDraft, setExpenseDraft] = useState<Expense | null>(null);
  const [incomeDraft, setIncomeDraft] = useState<PersonalIncome | null>(null);
  const [goalDraft, setGoalDraft] = useState<Goal | null>(null);

  const monthLabel = new Date(month + "-01T00:00:00Z").toLocaleDateString(
    "en-US",
    { month: "long", year: "numeric", timeZone: "UTC" },
  );

  const pPts = useMemo(
    () => personalSeries(db, personalRange, month),
    [db, personalRange, month],
  );
  const pAgg = useMemo(
    () => personalCategoryTotals(db, personalRange, month),
    [db, personalRange, month],
  );
  const incAgg = useMemo(
    () => personalIncomeSourceTotals(db, personalRange, month),
    [db, personalRange, month],
  );

  const personalInRangeTotal = useMemo(
    () => pPts.reduce((s, x) => s + x.personalIn, 0),
    [pPts],
  );
  const personalOutRangeTotal = useMemo(
    () => pPts.reduce((s, x) => s + x.personalOut, 0),
    [pPts],
  );
  const personalNetRange = personalInRangeTotal - personalOutRangeTotal;
  const personalAvgSpend = personalOutRangeTotal / pAgg.monthsCount;

  const personalInThisMonth = useMemo(
    () => personalIncomeTotal(db, month),
    [db, month],
  );
  const personalGoals = useMemo(
    () => db.goals.filter((g) => goalAccount(g) === "Personal"),
    [db.goals],
  );
  const personalSavedTotal = personalGoals.reduce((s, g) => s + g.current, 0);
  const personalTargetTotal = personalGoals.reduce((s, g) => s + g.target, 0);

  const chartData = useMemo(() => {
    let runNet = 0;
    return pPts.map((x) => {
      runNet += x.personalIn - x.personalOut;
      return {
        ...x,
        sparkValue: personalInRangeTotal > 0 ? runNet : x.personalOut,
      };
    });
  }, [pPts, personalInRangeTotal]);

  const breakdownBars = useMemo(
    () =>
      periodBreakdownBars(
        db,
        "Personal",
        personalRange,
        month,
        chartLens === "method" ? "method" : "category",
        "spending",
      ),
    [db, personalRange, month, chartLens],
  );

  const openNewExpense = useCallback(
    (category?: string) => {
      setExpenseDraft({
        id: uid(),
        date: today().startsWith(month) ? today() : pAgg.anchorDay,
        projectId: "",
        category:
          category && PERSONAL_CATEGORIES.includes(category)
            ? category
            : (PERSONAL_CATEGORIES[0] ?? "Food"),
        vendor: "Debit",
        description: "",
        amount: 0,
        currency: "USD",
        receipt: "",
        account: "Personal",
      });
    },
    [month, pAgg.anchorDay],
  );

  const openNewIncome = useCallback(
    (source?: string) => {
      setIncomeDraft({
        id: uid(),
        date: today().startsWith(month) ? today() : pAgg.anchorDay,
        source: source ?? "Salary",
        accountMethod: "Debit",
        description: "",
        amount: 0,
        currency: "USD",
      });
    },
    [month, pAgg.anchorDay],
  );

  const openNewGoal = () => {
    setGoalDraft({
      id: uid(),
      name: "",
      kind: "manual",
      target: 2000,
      current: 0,
      account: "Personal",
      cadence: "monthly",
      contributionAmount: 100,
      targetDate: "",
      contributions: [],
    });
  };

  const q = query.trim().toLowerCase();

  type LedgerRow =
    | {
        kind: "expense";
        id: string;
        date: string;
        title: string;
        sub: string;
        categoryOrSource: string;
        usd: number;
        rawAmount: number;
        currency: Expense["currency"];
        expense: Expense;
      }
    | {
        kind: "income";
        id: string;
        date: string;
        title: string;
        sub: string;
        categoryOrSource: string;
        usd: number;
        rawAmount: number;
        currency: PersonalIncome["currency"];
        income: PersonalIncome;
      };

  const ledgerRows = useMemo<LedgerRow[]>(() => {
    const matchesPeriod = (date: string) =>
      pAgg.dateSet
        ? pAgg.dateSet.has(date)
        : pAgg.monthSet.has(date.slice(0, 7));

    const outRows: LedgerRow[] =
      ledgerView === "income"
        ? []
        : db.expenses
            .filter((e) => expenseAccount(e) === "Personal")
            .filter((e) => (q ? true : matchesPeriod(e.date)))
            .map((e) => ({
              kind: "expense" as const,
              id: `exp-${e.id}`,
              date: e.date,
              title: e.description || e.vendor || e.category,
              sub: `${e.category}${e.vendor ? ` · ${e.vendor}` : ""}`,
              categoryOrSource: e.category,
              usd: toUSD(e.amount, e.currency, r),
              rawAmount: e.amount,
              currency: e.currency,
              expense: e,
            }));

    const inRows: LedgerRow[] =
      ledgerView === "spending"
        ? []
        : (db.personalIncome ?? [])
            .filter((inc) => (q ? true : matchesPeriod(inc.date)))
            .map((inc) => ({
              kind: "income" as const,
              id: `inc-${inc.id}`,
              date: inc.date,
              title: inc.description || inc.source,
              sub: `${inc.source}${inc.accountMethod ? ` · ${inc.accountMethod}` : ""}`,
              categoryOrSource: inc.source,
              usd: toUSD(inc.amount, inc.currency, r),
              rawAmount: inc.amount,
              currency: inc.currency,
              income: inc,
            }));

    return [...inRows, ...outRows]
      .filter((row) => {
        if (catFilter !== "All" && row.categoryOrSource !== catFilter) {
          return false;
        }
        if (q) {
          const hay =
            `${row.title} ${row.sub} ${row.categoryOrSource}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [
    db.expenses,
    db.personalIncome,
    ledgerView,
    pAgg.dateSet,
    pAgg.monthSet,
    catFilter,
    q,
    r,
  ]);

  const visibleRows = ledgerRows.slice(0, visibleCount);

  const filterOptions =
    ledgerView === "income"
      ? PERSONAL_INCOME_SOURCES
      : ledgerView === "spending"
        ? PERSONAL_CATEGORIES
        : Array.from(
            new Set([...PERSONAL_CATEGORIES, ...PERSONAL_INCOME_SOURCES]),
          );

  const widgets = useMemo<BentoWidgetDef[]>(
    () => [
      {
        id: "personalSummary",
        title: "Personal cash balance",
        defaultSpan: 5,
        render: () => (
          <Glass className="flex h-full flex-col justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Personal net cash,{" "}
                {personalRange === "1m" ? monthLabel : pAgg.scopeLabel}
              </p>
              <p
                className={cn(
                  "font-num mt-2 text-4xl font-extrabold",
                  personalNetRange < 0 && "text-destructive",
                  personalNetRange > 0 && "text-positive",
                )}
              >
                <AnimatedNumber value={personalNetRange} />
              </p>
              <p className="hidden mt-1 text-xs text-muted-foreground sm:block">
                Personal income received minus personal spending
              </p>
              <SparklineWithDates
                data={chartData.map((x) => ({
                  label: x.label,
                  fullDate: x.fullDate,
                  v: x.sparkValue,
                  inn: x.personalIn,
                  out: x.personalOut,
                  count: x.count + x.inCount,
                }))}
                gradientId="pers-sp"
                valueLabel={
                  personalInRangeTotal > 0 ? "Cumulative net" : "Spend"
                }
              />
            </div>
            <div className="grid grid-cols-3 gap-3 rounded-2xl bg-muted/35 p-3">
              <Stat
                label="Income"
                value={compactMoney(personalInRangeTotal)}
                fullValue={money(personalInRangeTotal)}
                tone={personalInRangeTotal > 0 ? "pos" : undefined}
              />
              <Stat
                label="Spending"
                value={compactMoney(personalOutRangeTotal)}
                fullValue={money(personalOutRangeTotal)}
              />
              <Stat
                label="Saved goals"
                tone="pos"
                value={compactMoney(personalSavedTotal)}
                fullValue={`${money(personalSavedTotal)} / ${money(personalTargetTotal)}`}
              />
            </div>
          </Glass>
        ),
      },
      {
        id: "personalFlowChart",
        title: "Cash Flow",
        defaultSpan: 7,
        render: () => {
          const isGrouped = chartLens === "category" || chartLens === "method";
          return (
            <Glass delay={80} className="h-full">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <h2 className="truncate font-medium">
                    {chartLens === "net"
                      ? "Net Flow"
                      : chartLens === "category"
                        ? "By Category"
                        : chartLens === "method"
                          ? "By Card"
                          : "Cash Flow"}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {pAgg.scopeLabel}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <SlidingTabs
                    iconOnly
                    size="xs"
                    tone="invert"
                    layoutGroup="pers-chart-lens"
                    value={chartLens}
                    onChange={setChartLens}
                    options={CHART_LENS_OPTIONS}
                  />
                  <ChartModeCycleButton
                    mode={chartMode}
                    onChange={setChartMode}
                  />
                </div>
              </div>

              <div className="mb-3 grid grid-cols-3 gap-3 rounded-2xl bg-muted/35 p-3">
                <Stat
                  icon={ArrowDownLeft}
                  label="In"
                  value={compactMoney(personalInRangeTotal)}
                  fullValue={money(personalInRangeTotal)}
                  tone={personalInRangeTotal > 0 ? "pos" : undefined}
                />
                <Stat
                  icon={ArrowUpRight}
                  label="Out"
                  value={compactMoney(personalOutRangeTotal)}
                  fullValue={money(personalOutRangeTotal)}
                />
                <Stat
                  icon={Activity}
                  label={
                    personalRange === "today" || personalRange === "week"
                      ? "Net"
                      : "Avg / mo"
                  }
                  value={compactMoney(
                    personalRange === "today" || personalRange === "week"
                      ? personalNetRange
                      : personalAvgSpend,
                    "USD",
                    personalRange === "today" || personalRange === "week",
                  )}
                  fullValue={money(
                    personalRange === "today" || personalRange === "week"
                      ? personalNetRange
                      : personalAvgSpend,
                    "USD",
                    personalRange === "today" || personalRange === "week",
                  )}
                  tone={
                    personalRange === "today" || personalRange === "week"
                      ? personalNetRange >= 0
                        ? "pos"
                        : "neg"
                      : undefined
                  }
                />
              </div>

              {isGrouped ? (
                <TrendChartCanvas
                  mode={chartMode}
                  data={breakdownBars}
                  primaryKey="primary"
                  primaryName="Spending"
                  secondaryKey="secondary"
                  secondaryName="Income"
                  gradientId="pers-cf-grouped"
                  hideSecondary={chartLens === "category"}
                  xInterval={0}
                />
              ) : chartLens === "net" ? (
                <TrendChartCanvas
                  mode={chartMode}
                  data={chartData}
                  primaryKey="net"
                  primaryName="Net flow"
                  secondaryKey="personalOut"
                  secondaryName="Spending"
                  gradientId="pers-cf-net"
                  isNetMetric
                  hideSecondary
                  xInterval={personalRange === "1m" ? 4 : 0}
                />
              ) : (
                <TrendChartCanvas
                  mode={chartMode}
                  data={chartData}
                  primaryKey="personalIn"
                  primaryName="Personal income"
                  secondaryKey="personalOut"
                  secondaryName="Personal spending"
                  gradientId="pers-cf"
                  xInterval={personalRange === "1m" ? 4 : 0}
                />
              )}
            </Glass>
          );
        },
      },
      {
        id: "personalMoneyFlow",
        title: "Personal money flow river",
        defaultSpan: 12,
        render: () => (
          <MoneyFlowSankeyCard
            db={db}
            accountScope="Personal"
            anchorMonth={month}
            onSelectCategory={(_acc, cat) => setInspectedCategory(cat)}
            onQuickLog={(kind) =>
              kind === "income" ? openNewIncome() : openNewExpense()
            }
            layoutIdPrefix="pers-money-flow"
          />
        ),
      },
      {
        id: "personalPie",
        title: "Personal spending & income breakdown",
        defaultSpan: 6,
        render: () => (
          <BreakdownPieCard
            db={db}
            account="Personal"
            personalItems={pAgg.items}
            studioItems={[]}
            personalIncomeItems={incAgg}
            scopeLabel={pAgg.scopeLabel}
            dateSet={pAgg.dateSet}
            monthSet={pAgg.monthSet}
            onSelectCategory={(_acc, cat) => setInspectedCategory(cat)}
            onEmptyAction={(m) =>
              m === "income" ? openNewIncome() : openNewExpense()
            }
          />
        ),
      },
      {
        id: "personalPulse",
        title: "Personal spending pulse",
        defaultSpan: 6,
        render: () => {
          const pulseData =
            personalRange === "1m"
              ? chartData.filter((d) => d.personalOut > 0).slice(-7)
              : chartData.slice(-7);
          const pulseTitle =
            personalRange === "today"
              ? "Today spending by slot"
              : personalRange === "week"
                ? "7-day spending pulse"
                : personalRange === "1m"
                  ? "Active spending days"
                  : "Monthly spending bars";
          return (
            <PeriodBarPulseCard
              title={pulseTitle}
              subtitle={`Comparison across ${pAgg.scopeLabel}`}
              data={pulseData.length > 0 ? pulseData : chartData.slice(-7)}
              valueKey="personalOut"
            />
          );
        },
      },
      {
        id: "cardSpend",
        title: "Card spending · Debit vs Credit",
        defaultSpan: 12,
        render: () => (
          <CardSpendingChartCard
            db={db}
            month={month}
            range={personalRange}
            onRangeChange={(next) => {
              setPersonalRange(next);
              setVisibleCount(RECENT_ROWS);
            }}
            layoutIdPrefix="pers-card-spend"
          />
        ),
      },
      {
        id: "personalJars",
        title: "Personal budget jars",
        defaultSpan: 12,
        render: () => (
          <div>
            {pAgg.items.length === 0 ? (
              <Glass>
                <Empty>
                  No personal expenses recorded in {pAgg.scopeLabel}.
                </Empty>
              </Glass>
            ) : (
              <BudgetShelf
                db={db}
                account="Personal"
                month={month}
                monthLabel={pAgg.scopeLabel}
                items={pAgg.items}
                limitScale={pAgg.monthsCount}
                selectedCategory={inspectedCategory}
                onSelectCategory={(cat) => setInspectedCategory(cat)}
              />
            )}
          </div>
        ),
      },
      {
        id: "personalGoals",
        title: "Personal saving goals",
        defaultSpan: 12,
        render: () => (
          <Glass delay={180}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <PiggyBank className="h-4 w-4 text-primary" />
                <p className="label-mono">Personal saving goals</p>
              </div>
              <Btn
                onClick={openNewGoal}
                className="px-3 py-1 text-xs whitespace-nowrap shrink-0"
              >
                <Plus className="h-3 w-3" />
                Add saving goal
              </Btn>
            </div>

            {personalGoals.length === 0 ? (
              <Empty>No personal saving goals yet.</Empty>
            ) : (
              <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
                {personalGoals.map((g, idx) => (
                  <GoalRingCard
                    key={g.id}
                    goal={g}
                    current={g.current}
                    delay={idx * 60}
                    onEdit={() => setGoalDraft(g)}
                    onQuickAdd={(amt) => {
                      setDB((d) => ({
                        ...d,
                        goals: d.goals.map((x) =>
                          x.id === g.id
                            ? {
                                ...x,
                                current: x.current + amt,
                                contributions: [
                                  {
                                    id: uid(),
                                    date: today(),
                                    amount: amt,
                                    cadence: x.cadence ?? "monthly",
                                    note: "Quick add",
                                  },
                                  ...(x.contributions ?? []),
                                ],
                              }
                            : x,
                        ),
                      }));
                      toast.success(`Added +$${amt} to ${g.name}`);
                    }}
                  />
                ))}
              </div>
            )}
          </Glass>
        ),
      },
      {
        id: "personalLedger",
        title: "Personal income & spending ledger",
        defaultSpan: 12,
        render: () => (
          <Glass delay={220}>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="label-mono">
                  Personal money ledger ·{" "}
                  {q ? `matching "${query}"` : pAgg.scopeLabel}
                  {catFilter !== "All" ? ` · ${catFilter}` : ""}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {ledgerRows.length}{" "}
                  {ledgerRows.length === 1 ? "entry" : "entries"} ·{" "}
                  <span className="text-positive">
                    +{money(personalInThisMonth)}
                  </span>{" "}
                  in this month
                </p>
              </div>
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
                <SlidingTabs
                  stretch
                  size="xs"
                  layoutGroup="pers-ledger-view"
                  className="w-full sm:w-auto"
                  value={ledgerView}
                  onChange={(v) => {
                    setLedgerView(v);
                    setCatFilter("All");
                    setVisibleCount(RECENT_ROWS);
                  }}
                  options={[
                    { id: "all", label: "All" },
                    { id: "spending", label: "Spending" },
                    { id: "income", label: "Income" },
                  ]}
                />
                <div className="relative min-w-0 flex-1 sm:flex-none">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setVisibleCount(RECENT_ROWS);
                    }}
                    placeholder="Search note, card, source…"
                    className="field w-full py-1.5 pl-8 text-base sm:w-52 sm:text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
                  <Btn
                    type="button"
                    onClick={() => openNewIncome()}
                    className="w-full justify-center px-3 py-1.5 text-xs whitespace-nowrap sm:w-auto sm:shrink-0"
                  >
                    <Plus className="h-3 w-3" />
                    Income
                  </Btn>
                  <Btn
                    type="button"
                    variant="gold"
                    onClick={() => openNewExpense()}
                    className="w-full justify-center px-3 py-1.5 text-xs whitespace-nowrap sm:w-auto sm:shrink-0"
                  >
                    <Plus className="h-3 w-3" />
                    Spending
                  </Btn>
                </div>
              </div>
            </div>

            <div className="no-scrollbar mb-3 flex flex-nowrap gap-1.5 overflow-x-auto pb-1 sm:flex-wrap sm:pb-0">
              <button
                type="button"
                onClick={() => {
                  setCatFilter("All");
                  setVisibleCount(RECENT_ROWS);
                }}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[0.7rem] whitespace-nowrap shrink-0 transition-colors",
                  catFilter === "All"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                All
              </button>
              {filterOptions.map((c) => {
                const Icon = PERSONAL_INCOME_SOURCES.includes(
                  c as (typeof PERSONAL_INCOME_SOURCES)[number],
                )
                  ? incomeSourceIcon(c)
                  : categoryIcon(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setCatFilter(catFilter === c ? "All" : c);
                      setVisibleCount(RECENT_ROWS);
                    }}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.7rem] whitespace-nowrap shrink-0 transition-colors",
                      catFilter === c
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Icon className="h-3 w-3 shrink-0" />
                    <span>{c}</span>
                  </button>
                );
              })}
            </div>

            {visibleRows.length === 0 ? (
              <Empty>
                {ledgerView === "income"
                  ? "No personal income recorded yet — click + Income to log your salary, studio draw, or side income."
                  : "No personal entries match this filter."}
              </Empty>
            ) : (
              <>
                <ul className="divide-y divide-border">
                  {visibleRows.map((row) => {
                    const Icon =
                      row.kind === "income"
                        ? incomeSourceIcon(row.income.source)
                        : expenseItemIcon(row.expense);
                    return (
                      <li key={row.id}>
                        <button
                          type="button"
                          onClick={() => {
                            if (row.kind === "income") {
                              setIncomeDraft(row.income);
                            } else {
                              setExpenseDraft(row.expense);
                            }
                          }}
                          className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl px-2 py-3 text-left transition-colors hover:bg-muted"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <span
                              className={cn(
                                "grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-border bg-muted",
                                row.kind === "income"
                                  ? "text-positive"
                                  : "text-primary",
                              )}
                            >
                              {row.kind === "income" ? (
                                <ArrowDownLeft className="h-4 w-4" />
                              ) : (
                                <Icon className="h-4 w-4" />
                              )}
                            </span>
                            <div className="min-w-0">
                              <p className="flex items-center gap-1.5 truncate text-sm font-medium">
                                <span className="truncate">{row.title}</span>
                              </p>
                              <p className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                                {row.kind === "income" && (
                                  <Icon className="h-3 w-3 shrink-0 text-positive" />
                                )}
                                <span className="truncate">
                                  {shortDate(row.date)} · {row.sub}
                                </span>
                              </p>
                            </div>
                          </div>
                          <span
                            className={cn(
                              "font-num flex items-center gap-1 text-sm",
                              row.kind === "income"
                                ? "text-positive"
                                : "text-destructive",
                            )}
                          >
                            {row.kind === "income" ? (
                              <>+{money(row.rawAmount, row.currency)}</>
                            ) : (
                              <>
                                <ArrowUpRight className="hidden h-3 w-3 sm:inline" />
                                {money(-row.rawAmount, row.currency)}
                              </>
                            )}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
                {ledgerRows.length > RECENT_ROWS && (
                  <div className="mt-3 flex justify-center">
                    {ledgerRows.length > visibleRows.length ? (
                      <Btn
                        onClick={() => setVisibleCount(ledgerRows.length)}
                        className="gap-1.5 px-4 py-1.5 text-xs"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Show all ({ledgerRows.length})
                      </Btn>
                    ) : (
                      <Btn
                        onClick={() => setVisibleCount(RECENT_ROWS)}
                        className="gap-1.5 px-4 py-1.5 text-xs"
                      >
                        <EyeOff className="h-3.5 w-3.5" />
                        Show recent {RECENT_ROWS} only
                      </Btn>
                    )}
                  </div>
                )}
              </>
            )}
          </Glass>
        ),
      },
    ],
    [
      personalRange,
      monthLabel,
      pAgg,
      personalNetRange,
      chartData,
      breakdownBars,
      chartLens,
      personalInRangeTotal,
      personalOutRangeTotal,
      personalSavedTotal,
      personalTargetTotal,
      chartMode,
      personalAvgSpend,
      db,
      incAgg,
      month,
      inspectedCategory,
      personalGoals,
      q,
      query,
      catFilter,
      ledgerRows,
      personalInThisMonth,
      ledgerView,
      filterOptions,
      visibleRows,
      visibleCount,
      openNewExpense,
      openNewIncome,
    ],
  );

  return (
    <>
      <PageHeader
        title="Personal Money"
        owner={db.settings.ownerName}
        action={
          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center">
            <div className="hidden sm:block">
              <EditLayoutButton
                editing={editingLayout}
                onToggle={() => setEditingLayout((e) => !e)}
              />
            </div>
            <Btn
              type="button"
              onClick={() => openNewIncome()}
              className="w-full justify-center whitespace-nowrap sm:w-auto sm:shrink-0"
            >
              <Plus className="h-4 w-4 text-positive" />
              Log income
            </Btn>
            <Btn
              type="button"
              variant="gold"
              onClick={() => openNewExpense()}
              className="w-full justify-center whitespace-nowrap sm:w-auto sm:shrink-0"
            >
              <Plus className="h-4 w-4" />
              Add expense
            </Btn>
          </div>
        }
      />

      <WorkspaceBalanceCard workspace="personal" />

      {/* Personal Scope Bar: Month Picker + Synced Time Range */}
      <div className="mb-4 flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="hidden text-xs text-muted-foreground sm:block">
          Dedicated personal wallet for daily spending, income, cards, and
          saving goals
        </p>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <MonthPicker
            className="w-full justify-between sm:w-auto"
            value={month}
            onChange={(next) => {
              setMonth(next);
              setVisibleCount(RECENT_ROWS);
            }}
          />
          <SlidingTabs
            size="xs"
            tone="invert"
            layoutGroup="pers-top-range"
            className="no-scrollbar max-w-full overflow-x-auto sm:w-auto"
            value={personalRange}
            onChange={(next) => {
              setPersonalRange(next);
              setVisibleCount(RECENT_ROWS);
            }}
            options={PERSONAL_RANGES.map((o) => ({
              id: o.id,
              label: o.label,
            }))}
          />
        </div>
      </div>

      <EditableBentoGrid
        pageKey="personal-money"
        widgets={widgets}
        editing={editingLayout}
        onDoneEditing={() => setEditingLayout(false)}
      />

      {/* Right-Side Pop-Up Inspector Drawer */}
      <CategoryInspectorDrawer
        db={db}
        account="Personal"
        category={inspectedCategory}
        month={month}
        onClose={() => setInspectedCategory(null)}
        onAddExpense={(_acc, cat) => openNewExpense(cat)}
        onEditExpense={(exp) => setExpenseDraft(exp)}
      />

      {/* Fast-Tap Personal Expense Drawer */}
      <QuickExpenseDrawer
        item={expenseDraft}
        onClose={() => setExpenseDraft(null)}
        onSave={(v) => {
          setDB((d) => ({
            ...d,
            expenses: upsert(d.expenses, { ...v, account: "Personal" }),
          }));
          toast.success("Personal expense saved.");
        }}
        onDelete={
          expenseDraft && db.expenses.some((x) => x.id === expenseDraft.id)
            ? (v) => {
                setDB((d) => ({
                  ...d,
                  expenses: d.expenses.filter((x) => x.id !== v.id),
                }));
                toast.message("Expense deleted.");
              }
            : undefined
        }
      />

      {/* Fast-Tap Personal Income Drawer */}
      <QuickIncomeDrawer
        item={incomeDraft}
        onClose={() => setIncomeDraft(null)}
        onSave={(v) => {
          setDB((d) => ({
            ...d,
            personalIncome: upsert(d.personalIncome ?? [], v),
          }));
          toast.success("Personal income saved.");
        }}
        onDelete={
          incomeDraft &&
          (db.personalIncome ?? []).some((x) => x.id === incomeDraft.id)
            ? (v) => {
                setDB((d) => ({
                  ...d,
                  personalIncome: (d.personalIncome ?? []).filter(
                    (x) => x.id !== v.id,
                  ),
                }));
                toast.message("Income deleted.");
              }
            : undefined
        }
      />

      {/* Right-Side Goal Planner Drawer (Daily / Monthly / Yearly) */}
      <GoalPlannerDrawer
        goal={goalDraft}
        account="Personal"
        onClose={() => setGoalDraft(null)}
        onSave={(v) => {
          setDB((d) => ({
            ...d,
            goals: upsert(d.goals, {
              ...v,
              account: "Personal",
              kind: "manual",
            }),
          }));
          toast.success(`Saved "${v.name}"`);
        }}
        onDelete={
          goalDraft && db.goals.some((x) => x.id === goalDraft.id)
            ? (v) => {
                setDB((d) => ({
                  ...d,
                  goals: d.goals.filter((x) => x.id !== v.id),
                }));
                toast.message("Saving goal deleted.");
              }
            : undefined
        }
      />
    </>
  );
}
