import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowDownLeft, PiggyBank, Plus, Search, Sparkles } from "lucide-react";
import {
  Btn,
  Empty,
  Glass,
  PageHeader,
  SlidingTabs,
  Stat,
} from "@/components/rv/ui";
import { EditModal, upsert, type Field } from "@/components/rv/Crud";
import {
  AnimatedNumber,
  BudgetShelf,
  CategoryInspectorDrawer,
  GoalRingCard,
  categoryIcon,
  expenseItemIcon,
  paymentCardIcon,
} from "@/components/rv/FinanceVisuals";
import {
  BreakdownPieCard,
  CHART_MODE_OPTIONS,
  CardSpendingChartCard,
  PeriodBarPulseCard,
  SparklineWithDates,
  TrendChartCanvas,
  type ChartMode,
} from "@/components/rv/Charts";
import {
  EditLayoutButton,
  EditableBentoGrid,
  type BentoWidgetDef,
} from "@/components/rv/BentoGrid";
import {
  CARD_METHODS,
  EXPENSE_CATEGORIES,
  PERSONAL_CATEGORIES,
  cashFlowSeries,
  cashReceived,
  categoryTotals,
  compactMoney,
  expenseAccount,
  expenseCategoriesFor,
  expenseTotal,
  goalAccount,
  invoiceView,
  isInvoice,
  money,
  personalCategoryTotals,
  personalSeries,
  setDB,
  shortDate,
  toUSD,
  today,
  uid,
  useDB,
  type Account,
  type CashRange,
  type Expense,
  type Goal,
  type PersonalRange,
} from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/finance")({
  head: () => ({
    meta: [
      { title: "Finance · RothVan Studio" },
      {
        name: "description",
        content:
          "RothVan Design studio cash flow, expenses, and personal monthly budget & saving goals.",
      },
      { property: "og:title", content: "Finance · RothVan Studio" },
      {
        property: "og:description",
        content:
          "RothVan Design studio cash flow, expenses, and personal monthly budget & saving goals.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

type Tab = "Studio" | "Personal" | "Combined";

const STUDIO_RANGES: { id: CashRange; label: string; desc: string }[] = [
  { id: "6m", label: "6 months", desc: "last 6 months" },
  { id: "12m", label: "12 months", desc: "last 12 months" },
  { id: "all", label: "All time", desc: "all time" },
];

const PERSONAL_RANGES: { id: PersonalRange; label: string; desc: string }[] = [
  { id: "1m", label: "This month", desc: "this month" },
  { id: "6m", label: "6 months", desc: "last 6 months" },
  { id: "12m", label: "12 months", desc: "last 12 months" },
];

function Page() {
  const db = useDB((d) => d);
  const r = db.settings.khrRate;
  const [tab, setTab] = useState<Tab>("Studio");
  const [studioRange, setStudioRange] = useState<CashRange>("all");
  const [personalRange, setPersonalRange] = useState<PersonalRange>("1m");
  const [chartMode, setChartMode] = useState<ChartMode>("area");
  const [month, setMonth] = useState(() => today().slice(0, 7));
  const [catFilter, setCatFilter] = useState<string>("All");
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(40);
  const [editingLayout, setEditingLayout] = useState(false);
  const [inspector, setInspector] = useState<{
    account: Account;
    category: string;
  } | null>(null);
  const [edit, setEdit] = useState<Expense | null>(null);
  const [goal, setGoal] = useState<Goal | null>(null);

  const year = month.slice(0, 4) || today().slice(0, 4);
  const monthLabel = new Date(month + "-01T00:00:00Z").toLocaleDateString(
    "en-US",
    { month: "long", year: "numeric", timeZone: "UTC" },
  );

  const pts = cashFlowSeries(db, studioRange);
  const pPts = personalSeries(db, personalRange, month);
  const pAgg = personalCategoryTotals(db, personalRange, month);

  const studioRangeMeta =
    STUDIO_RANGES.find((o) => o.id === studioRange) ?? STUDIO_RANGES[2]!;
  const personalRangeMeta =
    PERSONAL_RANGES.find((o) => o.id === personalRange) ?? PERSONAL_RANGES[0]!;

  const studioInRange = pts.reduce((a, x) => a + x.inn, 0);
  const studioOutRange = pts.reduce((a, x) => a + x.out, 0);
  const personalOutCashRange = pts.reduce((a, x) => a + x.personalOut, 0);
  const studioNetRange = studioInRange - studioOutRange;
  const combinedOutRange = studioOutRange + personalOutCashRange;
  const combinedNetRange = studioInRange - combinedOutRange;

  const personalTotalSelectedRange = pPts.reduce(
    (a, x) => a + x.personalOut,
    0,
  );
  const personalAvgMonth = personalTotalSelectedRange / pAgg.monthsCount;

  let runStudio = 0;
  let runCombined = 0;
  const studioChartData = pts.map((x) => {
    runStudio += x.net;
    runCombined += x.combinedNet;
    const totalOut = x.out + x.personalOut;
    return {
      ...x,
      totalOut,
      sparkValue: tab === "Combined" ? runCombined : runStudio,
    };
  });

  const personalChartData = pPts.map((x) => ({
    label: x.label,
    fullDate: x.fullDate,
    personalOut: x.personalOut,
    studioOut: x.studioOut,
    count: x.count,
    sparkValue: x.personalOut,
  }));

  const studioInYear = cashReceived(db, year);
  const studioOutYear = expenseTotal(db, "Studio", year);
  const personalOutMonth = expenseTotal(db, "Personal", month);

  const unpaidInvoicesUSD = db.invoices
    .filter(isInvoice)
    .map((i) => invoiceView(i, db))
    .filter((v) => v.status !== "Draft")
    .reduce((a, v) => a + v.balanceUSD, 0);

  const studioCatsMonth = categoryTotals(db, "Studio", month);
  const studioCatsAll = categoryTotals(db, "Studio", "");
  const studioCats =
    studioCatsMonth.length > 0 ? studioCatsMonth : studioCatsAll;
  const studioShelfScopeLabel =
    studioCatsMonth.length > 0 ? monthLabel : "all time";
  const personalCats = pAgg.items;

  const studioGoals = db.goals.filter((g) => goalAccount(g) === "Studio");
  const personalGoals = db.goals.filter((g) => goalAccount(g) === "Personal");
  const personalSavedTotal = personalGoals.reduce(
    (sum, g) => sum + g.current,
    0,
  );
  const personalTargetTotal = personalGoals.reduce(
    (sum, g) => sum + g.target,
    0,
  );

  const goalNow = (g: Goal) => {
    if (g.kind === "cash") return cashReceived(db, year);
    if (g.kind === "clients")
      return db.clients.filter((c) => c.status !== "Lead").length;
    return g.current;
  };

  const switchTab = (next: Tab) => {
    setTab(next);
    setCatFilter("All");
    setVisibleCount(40);
    setInspector(null);
  };

  const openNewExpense = (account: Account, category?: string) => {
    const cats = expenseCategoriesFor(account);
    setEdit({
      id: uid(),
      date: today().startsWith(month) ? today() : `${month}-01`,
      projectId: "",
      category:
        category && cats.includes(category) ? category : (cats[0] ?? "Other"),
      vendor: account === "Personal" ? "Debit" : "",
      description: "",
      amount: 0,
      currency: "USD",
      receipt: "",
      account,
    });
  };

  const openNewGoal = (account: Account) => {
    setGoal({
      id: uid(),
      name: "",
      kind: "manual",
      target: account === "Personal" ? 2000 : 1000,
      current: 0,
      account,
    });
  };

  const expenseFields = (v: Expense): Field<Expense>[] => {
    const acc = expenseAccount(v);
    return [
      {
        k: "account",
        label: "Account",
        type: "chips",
        options: [
          { value: "Studio", label: "RothVan Design (Studio)" },
          { value: "Personal", label: "Personal" },
        ],
      },
      { k: "date", label: "Date", type: "date" },
      { k: "amount", label: "Amount", type: "number" },
      { k: "description", label: "Description", wide: true },
      {
        k: "category",
        label: "Category (tap to choose)",
        type: "chips",
        options: expenseCategoriesFor(acc).map((c) => ({
          value: c,
          label: c,
          icon: categoryIcon(c),
        })),
      },
      ...(acc === "Personal"
        ? [
            {
              k: "vendor" as const,
              label: "Card / Payment method",
              type: "chips" as const,
              options: CARD_METHODS.map((m) => ({
                value: m,
                label: m,
                icon: paymentCardIcon(m),
              })),
              allowCustom: true,
              customPlaceholder: "Or enter custom card / merchant…",
            },
          ]
        : [
            {
              k: "vendor" as const,
              label: "Vendor / Merchant",
            },
            {
              k: "projectId" as const,
              label: "Project (optional)",
              type: "select" as const,
              options: db.projects.map((p) => ({
                value: p.id,
                label: `${p.code} · ${p.name}`,
              })),
            },
          ]),
      {
        k: "currency",
        label: "Currency",
        type: "chips",
        options: ["USD", "KHR"],
      },
    ];
  };

  const goalFields = (v: Goal): Field<Goal>[] => {
    const acc = goalAccount(v);
    return [
      {
        k: "account",
        label: "Account",
        type: "select",
        options: [
          { value: "Studio", label: "RothVan Design (Studio)" },
          { value: "Personal", label: "Personal" },
        ],
      },
      {
        k: "kind",
        label: "Tracks",
        type: "select",
        options:
          acc === "Personal"
            ? [{ value: "manual", label: "Manual saving goal" }]
            : [
                { value: "cash", label: "Studio cash received (auto)" },
                { value: "clients", label: "Clients won (auto)" },
                { value: "manual", label: "Manual fund" },
              ],
      },
      { k: "name", label: "Goal name", wide: true },
      { k: "target", label: "Target (USD)", type: "number" },
      { k: "current", label: "Current saved (manual)", type: "number" },
    ];
  };

  const q = query.trim().toLowerCase();
  const filteredExpenses = [...db.expenses]
    .filter((e) => {
      const acc = expenseAccount(e);
      if (tab === "Studio" && acc !== "Studio") return false;
      if (tab === "Personal" && acc !== "Personal") return false;
      if (tab === "Personal" && !q && !pAgg.monthSet.has(e.date.slice(0, 7)))
        return false;
      if (catFilter !== "All" && e.category !== catFilter) return false;
      if (q) {
        const hay = `${e.description} ${e.vendor} ${e.category}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  const visibleExpenses = filteredExpenses.slice(0, visibleCount);
  const recentPayments = [...db.payments]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 10);

  const leftHeadline =
    tab === "Personal"
      ? personalTotalSelectedRange
      : tab === "Combined"
        ? combinedNetRange
        : studioNetRange;

  const activeGoals =
    tab === "Personal"
      ? personalGoals
      : tab === "Studio"
        ? studioGoals
        : db.goals;

  const activeCategoriesForFilter =
    tab === "Personal"
      ? PERSONAL_CATEGORIES
      : tab === "Studio"
        ? EXPENSE_CATEGORIES
        : Array.from(new Set([...PERSONAL_CATEGORIES, ...EXPENSE_CATEGORIES]));

  const activeChart = tab === "Personal" ? personalChartData : studioChartData;

  const widgets = useMemo<BentoWidgetDef[]>(() => {
    const list: BentoWidgetDef[] = [
      {
        id: "headline",
        title:
          tab === "Personal"
            ? "Personal summary"
            : tab === "Combined"
              ? "Combined net retained"
              : "Studio net profit",
        defaultSpan: 5,
        render: () => (
          <Glass className="flex h-full flex-col justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {tab === "Personal"
                  ? `Personal total spend, ${personalRange === "1m" ? monthLabel : personalRangeMeta.desc}`
                  : tab === "Combined"
                    ? `Combined net retained, ${studioRangeMeta.desc}`
                    : `Studio net cash profit, ${studioRangeMeta.desc}`}
              </p>
              <p
                className={cn(
                  "mt-2 font-display text-4xl font-black tabular-nums",
                  tab !== "Personal" && leftHeadline < 0 && "text-destructive",
                )}
              >
                <AnimatedNumber key={tab} value={leftHeadline} />
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {tab === "Personal"
                  ? "Personal monthly living & household ledger"
                  : tab === "Combined"
                    ? "Studio cash received minus Studio & Personal expenses"
                    : "Studio cash received minus RothVan Design expenses"}
              </p>
              <SparklineWithDates
                data={
                  tab === "Personal"
                    ? personalChartData.map((x) => ({
                        label: x.label,
                        fullDate: x.fullDate,
                        v: x.personalOut,
                        out: x.personalOut,
                        count: x.count,
                      }))
                    : studioChartData.map((x) => ({
                        label: x.label,
                        fullDate: x.fullDate,
                        v: x.sparkValue,
                        inn: x.inn,
                        out: tab === "Combined" ? x.totalOut : x.out,
                        count: x.inCount + x.outCount,
                      }))
                }
                gradientId={`fin-sp-${tab}`}
                valueLabel={tab === "Personal" ? "Spend" : "Cumulative net"}
              />
            </div>
            {tab === "Studio" && (
              <div className="grid grid-cols-3 gap-3 border-t border-border pt-4">
                <Link to="/invoices">
                  <Stat
                    label="Open A/R"
                    value={compactMoney(unpaidInvoicesUSD)}
                    fullValue={money(unpaidInvoicesUSD)}
                  />
                </Link>
                <Stat
                  label={`Cash in (${year})`}
                  value={compactMoney(studioInYear)}
                  fullValue={money(studioInYear)}
                />
                <Stat
                  label={`Expenses (${year})`}
                  value={compactMoney(studioOutYear)}
                  fullValue={money(studioOutYear)}
                />
              </div>
            )}
            {tab === "Personal" && (
              <div className="grid grid-cols-3 gap-3 border-t border-border pt-4">
                <Stat
                  label="This month"
                  value={compactMoney(personalOutMonth)}
                  fullValue={money(personalOutMonth)}
                  tone="neg"
                />
                <Stat
                  label="Avg / month"
                  value={compactMoney(personalAvgMonth)}
                  fullValue={money(personalAvgMonth)}
                />
                <Stat
                  label="Saved goals"
                  tone="pos"
                  value={`${compactMoney(personalSavedTotal)} / ${compactMoney(personalTargetTotal)}`}
                  fullValue={`${money(personalSavedTotal)} / ${money(personalTargetTotal)}`}
                />
              </div>
            )}
            {tab === "Combined" && (
              <div className="grid grid-cols-3 gap-3 border-t border-border pt-4">
                <Stat
                  label="Studio in"
                  value={compactMoney(studioInRange)}
                  fullValue={money(studioInRange)}
                  tone="pos"
                />
                <Stat
                  label="Studio out"
                  value={compactMoney(studioOutRange)}
                  fullValue={money(studioOutRange)}
                />
                <Stat
                  label="Personal out"
                  value={compactMoney(personalOutCashRange)}
                  fullValue={money(personalOutCashRange)}
                  tone="neg"
                />
              </div>
            )}
          </Glass>
        ),
      },
      {
        id: "trendChart",
        title:
          tab === "Personal"
            ? "Personal spending trend"
            : tab === "Combined"
              ? "Combined cash flow"
              : "Studio cash flow",
        defaultSpan: 7,
        render: () => (
          <Glass delay={80} className="h-full">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-medium">
                {tab === "Personal"
                  ? "Personal spending trend"
                  : tab === "Combined"
                    ? "Combined cash flow"
                    : "Studio cash flow"}
              </h2>
              <div className="flex flex-wrap items-center gap-1.5">
                <SlidingTabs
                  size="xs"
                  layoutGroup="fin-chart-mode"
                  value={chartMode}
                  onChange={setChartMode}
                  options={CHART_MODE_OPTIONS}
                />
                {tab === "Personal" ? (
                  <SlidingTabs
                    size="xs"
                    tone="invert"
                    layoutGroup="fin-personal-range"
                    value={personalRange}
                    onChange={setPersonalRange}
                    options={PERSONAL_RANGES.map((o) => ({
                      id: o.id,
                      label: o.label,
                    }))}
                  />
                ) : (
                  <SlidingTabs
                    size="xs"
                    tone="invert"
                    layoutGroup="fin-studio-range"
                    value={studioRange}
                    onChange={setStudioRange}
                    options={STUDIO_RANGES.map((o) => ({
                      id: o.id,
                      label: o.label,
                    }))}
                  />
                )}
              </div>
            </div>

            {tab === "Studio" && (
              <div className="mb-3 grid grid-cols-3 gap-3">
                <Stat
                  label="● Cash in"
                  value={compactMoney(studioInRange)}
                  fullValue={money(studioInRange)}
                />
                <Stat
                  label="○ Studio out"
                  value={compactMoney(studioOutRange)}
                  fullValue={money(studioOutRange)}
                />
                <Stat
                  label="Net"
                  value={compactMoney(studioNetRange, "USD", true)}
                  fullValue={money(studioNetRange, "USD", true)}
                  tone={studioNetRange >= 0 ? "pos" : "neg"}
                />
              </div>
            )}
            {tab === "Personal" && (
              <div className="mb-3 grid grid-cols-3 gap-3">
                <Stat
                  label="● Personal out"
                  value={compactMoney(personalTotalSelectedRange)}
                  fullValue={money(personalTotalSelectedRange)}
                />
                <Stat
                  label="○ Monthly avg"
                  value={compactMoney(personalAvgMonth)}
                  fullValue={money(personalAvgMonth)}
                />
                <Stat
                  label={monthLabel}
                  value={compactMoney(personalOutMonth)}
                  fullValue={money(personalOutMonth)}
                  tone={personalOutMonth > personalAvgMonth ? "neg" : undefined}
                />
              </div>
            )}
            {tab === "Combined" && (
              <div className="mb-3 grid grid-cols-3 gap-3">
                <Stat
                  label="● Studio in"
                  value={compactMoney(studioInRange)}
                  fullValue={money(studioInRange)}
                />
                <Stat
                  label="○ Total out"
                  value={compactMoney(combinedOutRange)}
                  fullValue={money(combinedOutRange)}
                />
                <Stat
                  label="Retained"
                  value={compactMoney(combinedNetRange, "USD", true)}
                  fullValue={money(combinedNetRange, "USD", true)}
                  tone={combinedNetRange >= 0 ? "pos" : "neg"}
                />
              </div>
            )}

            <TrendChartCanvas
              mode={chartMode}
              data={activeChart}
              primaryKey={
                tab === "Personal"
                  ? "personalOut"
                  : tab === "Combined"
                    ? "inn"
                    : "inn"
              }
              primaryName={
                tab === "Personal"
                  ? "Personal spend"
                  : tab === "Combined"
                    ? "Studio cash in"
                    : "Cash in"
              }
              secondaryKey={
                tab === "Personal"
                  ? "studioOut"
                  : tab === "Combined"
                    ? "totalOut"
                    : "out"
              }
              secondaryName={
                tab === "Personal"
                  ? "Studio expenses"
                  : tab === "Combined"
                    ? "All expenses"
                    : "Studio expenses"
              }
              gradientId={`fin-cf-${tab}`}
              xInterval={tab === "Personal" && personalRange === "1m" ? 3 : 0}
            />
          </Glass>
        ),
      },
      {
        id: "breakdownPie",
        title: "Category & revenue pie chart",
        defaultSpan: 6,
        render: () => (
          <BreakdownPieCard
            db={db}
            account={tab}
            personalItems={personalCats}
            studioItems={studioCats}
            scopeLabel={
              tab === "Personal" ? pAgg.scopeLabel : studioShelfScopeLabel
            }
            onSelectCategory={(acc, category) =>
              setInspector({ account: acc, category })
            }
          />
        ),
      },
      {
        id: "pulseBars",
        title:
          tab === "Personal"
            ? "Recent spending bar pulse"
            : "Monthly income pulse",
        defaultSpan: 6,
        render: () => {
          const pulseData =
            tab === "Personal"
              ? (() => {
                  const activeDays =
                    personalRange === "1m"
                      ? personalChartData
                          .filter((d) => d.personalOut > 0)
                          .slice(-7)
                      : personalChartData.slice(-6);
                  return activeDays.length > 0
                    ? activeDays
                    : personalChartData.slice(-7);
                })()
              : studioChartData.slice(-6);
          return (
            <PeriodBarPulseCard
              title={
                tab === "Personal"
                  ? personalRange === "1m"
                    ? "Active days bar breakdown"
                    : "Monthly personal bars"
                  : "Recent monthly studio revenue"
              }
              subtitle={
                tab === "Personal"
                  ? `Date-by-date comparison (${pAgg.scopeLabel})`
                  : `Last ${Math.min(6, studioChartData.length)} months cash received`
              }
              data={pulseData}
              valueKey={tab === "Personal" ? "personalOut" : "inn"}
            />
          );
        },
      },
      ...(tab !== "Studio"
        ? [
            {
              id: "cardSpend",
              title: "Debit vs Credit card spending",
              defaultSpan: 12 as const,
              render: () => (
                <CardSpendingChartCard
                  db={db}
                  month={month}
                  defaultRange={personalRange}
                  layoutIdPrefix={`fin-card-${tab}`}
                />
              ),
            },
          ]
        : []),
      {
        id: "jarsShelf",
        title: "Category budget jars",
        defaultSpan: 12,
        render: () => (
          <div>
            {tab === "Personal" ? (
              personalCats.length === 0 ? (
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
                  items={personalCats}
                  limitScale={pAgg.monthsCount}
                  selectedCategory={
                    inspector?.account === "Personal"
                      ? inspector.category
                      : null
                  }
                  onSelectCategory={(category) =>
                    setInspector({ account: "Personal", category })
                  }
                />
              )
            ) : tab === "Studio" ? (
              studioCats.length === 0 ? (
                <Glass>
                  <Empty>No studio expenses recorded yet.</Empty>
                </Glass>
              ) : (
                <BudgetShelf
                  db={db}
                  account="Studio"
                  month={month}
                  monthLabel={studioShelfScopeLabel}
                  items={studioCats}
                  selectedCategory={
                    inspector?.account === "Studio" ? inspector.category : null
                  }
                  onSelectCategory={(category) =>
                    setInspector({ account: "Studio", category })
                  }
                />
              )
            ) : (
              <div className="space-y-4">
                {personalCats.length > 0 && (
                  <BudgetShelf
                    db={db}
                    account="Personal"
                    month={month}
                    monthLabel={pAgg.scopeLabel}
                    items={personalCats}
                    limitScale={pAgg.monthsCount}
                    selectedCategory={
                      inspector?.account === "Personal"
                        ? inspector.category
                        : null
                    }
                    onSelectCategory={(category) =>
                      setInspector({ account: "Personal", category })
                    }
                  />
                )}
                {studioCats.length > 0 && (
                  <BudgetShelf
                    db={db}
                    account="Studio"
                    month={month}
                    monthLabel={studioShelfScopeLabel}
                    items={studioCats}
                    selectedCategory={
                      inspector?.account === "Studio"
                        ? inspector.category
                        : null
                    }
                    onSelectCategory={(category) =>
                      setInspector({ account: "Studio", category })
                    }
                  />
                )}
              </div>
            )}
          </div>
        ),
      },
      {
        id: "goalsGrid",
        title: "Saving & studio goals",
        defaultSpan: 12,
        render: () => (
          <Glass delay={180}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {tab === "Personal" ? (
                  <PiggyBank className="h-4 w-4 text-primary" />
                ) : (
                  <Sparkles className="h-4 w-4 text-primary" />
                )}
                <p className="label-mono">
                  {tab === "Personal"
                    ? "Personal saving goals"
                    : tab === "Studio"
                      ? "RothVan Studio goals"
                      : "All studio & personal goals"}
                </p>
              </div>
              <Btn
                onClick={() =>
                  openNewGoal(tab === "Personal" ? "Personal" : "Studio")
                }
                className="px-3 py-1 text-xs"
              >
                <Plus className="h-3 w-3" />
                Add goal
              </Btn>
            </div>

            {activeGoals.length === 0 ? (
              <Empty>No saving goals yet.</Empty>
            ) : (
              <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
                {activeGoals.map((g, idx) => (
                  <GoalRingCard
                    key={g.id}
                    goal={g}
                    current={goalNow(g)}
                    accountLabel={
                      tab === "Combined" ? goalAccount(g) : undefined
                    }
                    delay={idx * 60}
                    onEdit={() => setGoal(g)}
                    onQuickAdd={
                      g.kind === "manual"
                        ? (amt) =>
                            setDB((d) => ({
                              ...d,
                              goals: d.goals.map((x) =>
                                x.id === g.id
                                  ? { ...x, current: x.current + amt }
                                  : x,
                              ),
                            }))
                        : undefined
                    }
                  />
                ))}
              </div>
            )}
          </Glass>
        ),
      },
    ];

    if (tab !== "Personal") {
      list.push({
        id: "studioIncome",
        title: "Recent studio income",
        defaultSpan: 12,
        render: () => (
          <Glass delay={240}>
            <div className="mb-3 flex items-center justify-between">
              <p className="label-mono">
                Recent Studio Income ({db.payments.length} recorded payments)
              </p>
              <Link
                to="/invoices"
                className="text-xs text-primary hover:underline"
              >
                Invoices →
              </Link>
            </div>
            {recentPayments.length === 0 ? (
              <Empty>No invoice payments recorded yet.</Empty>
            ) : (
              <ul className="divide-y divide-border">
                {recentPayments.map((p) => {
                  const inv = db.invoices.find((i) => i.id === p.invoiceId);
                  const client = db.clients.find((c) => c.id === inv?.clientId);
                  return (
                    <li key={p.id}>
                      <Link
                        to="/invoices/$id"
                        params={{ id: p.invoiceId }}
                        className="flex items-center justify-between gap-3 rounded-xl px-2 py-2.5 hover:bg-muted"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-border bg-muted text-positive">
                            <ArrowDownLeft className="h-4 w-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {client?.name ?? "Client"} ·{" "}
                              {inv?.no ?? "Invoice"}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {shortDate(p.date)} · {p.method}
                              {p.reference ? ` · ${p.reference}` : ""}
                            </p>
                          </div>
                        </div>
                        <span className="shrink-0 font-mono text-sm tabular-nums text-positive">
                          +{money(toUSD(p.amount, p.currency, r))}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </Glass>
        ),
      });
    }

    list.push({
      id: "expensesLedger",
      title: "Expenses ledger",
      defaultSpan: 12,
      render: () => (
        <Glass delay={280}>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="label-mono">
                {tab === "Personal"
                  ? q
                    ? `Personal expenses · all dates matching "${query}"`
                    : `Personal expenses · ${pAgg.scopeLabel}`
                  : tab === "Studio"
                    ? "RothVan Design expenses"
                    : "All studio & personal expenses"}
                {catFilter !== "All" ? ` · ${catFilter}` : ""}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {filteredExpenses.length}{" "}
                {filteredExpenses.length === 1 ? "entry" : "entries"}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setVisibleCount(40);
                  }}
                  placeholder="Search item or card..."
                  className="field w-44 py-1.5 pl-8 text-xs sm:w-56"
                />
              </div>
              <Btn
                onClick={() =>
                  openNewExpense(tab === "Personal" ? "Personal" : "Studio")
                }
                className="px-3 py-1.5 text-xs"
              >
                <Plus className="h-3 w-3" />
                Add {tab === "Personal" ? "personal" : "studio"}
              </Btn>
            </div>
          </div>

          <div className="mb-3 flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setCatFilter("All")}
              className={cn(
                "rounded-full border px-2.5 py-1 text-[0.7rem] transition-colors",
                catFilter === "All"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              All
            </button>
            {activeCategoriesForFilter.map((c) => {
              const CatIcon = categoryIcon(c);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCatFilter(catFilter === c ? "All" : c)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.7rem] transition-colors",
                    catFilter === c
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  <CatIcon className="h-3 w-3 shrink-0" />
                  <span>{c}</span>
                </button>
              );
            })}
          </div>

          {visibleExpenses.length === 0 ? (
            <Empty>No expenses match this filter.</Empty>
          ) : (
            <>
              <ul className="divide-y divide-border">
                {visibleExpenses.map((e) => {
                  const acc = expenseAccount(e);
                  const proj = e.projectId
                    ? db.projects.find((p) => p.id === e.projectId)
                    : undefined;
                  const ItemIcon = expenseItemIcon(e);
                  return (
                    <li key={e.id}>
                      <button
                        onClick={() => setEdit(e)}
                        className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl px-2 py-3 text-left transition-colors hover:bg-muted"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-border bg-muted text-primary">
                            <ItemIcon className="h-4 w-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {e.description || e.vendor || "Expense"}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {shortDate(e.date)} · {e.category}
                              {e.vendor ? ` · ${e.vendor}` : ""}
                              {proj ? ` · ${proj.code}` : ""}
                              {tab === "Combined" ? ` · ${acc}` : ""}
                            </p>
                          </div>
                        </div>
                        <p className="font-mono text-sm tabular-nums text-destructive">
                          {money(-e.amount, e.currency)}
                        </p>
                      </button>
                    </li>
                  );
                })}
              </ul>
              {filteredExpenses.length > visibleExpenses.length && (
                <div className="mt-3 flex justify-center gap-2">
                  <Btn
                    onClick={() => setVisibleCount((n) => n + 60)}
                    className="px-4 py-1.5 text-xs"
                  >
                    Show more (
                    {filteredExpenses.length - visibleExpenses.length}{" "}
                    remaining)
                  </Btn>
                  <Btn
                    onClick={() => setVisibleCount(filteredExpenses.length)}
                    className="px-4 py-1.5 text-xs"
                  >
                    Show all ({filteredExpenses.length})
                  </Btn>
                </div>
              )}
              {visibleCount > 40 && filteredExpenses.length > 40 && (
                <div className="mt-2 flex justify-center">
                  <Btn
                    onClick={() => setVisibleCount(40)}
                    className="px-4 py-1.5 text-xs"
                  >
                    Hide extra rows
                  </Btn>
                </div>
              )}
            </>
          )}
        </Glass>
      ),
    });

    return list;
  }, [
    tab,
    chartMode,
    personalRange,
    personalRangeMeta,
    studioRange,
    studioRangeMeta,
    monthLabel,
    leftHeadline,
    activeChart,
    personalChartData,
    studioChartData,
    unpaidInvoicesUSD,
    year,
    studioInYear,
    studioOutYear,
    personalOutMonth,
    personalAvgMonth,
    personalSavedTotal,
    personalTargetTotal,
    studioInRange,
    studioOutRange,
    personalOutCashRange,
    studioNetRange,
    personalTotalSelectedRange,
    combinedOutRange,
    combinedNetRange,
    personalCats,
    studioCats,
    studioShelfScopeLabel,
    pAgg,
    db,
    month,
    inspector,
    activeGoals,
    recentPayments,
    r,
    q,
    query,
    catFilter,
    filteredExpenses,
    activeCategoriesForFilter,
    visibleExpenses,
    visibleCount,
  ]);

  return (
    <>
      <PageHeader
        title="Finance"
        owner={db.settings.ownerName}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <EditLayoutButton
              editing={editingLayout}
              onToggle={() => setEditingLayout((e) => !e)}
            />
            <Btn
              variant="gold"
              onClick={() =>
                openNewExpense(tab === "Personal" ? "Personal" : "Studio")
              }
            >
              <Plus className="h-4 w-4" />
              Add {tab === "Personal" ? "personal" : "studio"} expense
            </Btn>
          </div>
        }
      />

      {/* Account Tabs + Month Filter */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <SlidingTabs
          layoutGroup="finance-account-tabs"
          value={tab}
          onChange={switchTab}
          options={[
            { id: "Studio", label: "RothVan Design" },
            { id: "Personal", label: "Personal" },
            { id: "Combined", label: "Combined" },
          ]}
        />
        <div className="flex items-center gap-2">
          <span className="label-mono">Month</span>
          <input
            type="month"
            className="field w-auto py-1.5 text-xs"
            value={month}
            onChange={(e) => {
              setMonth(e.target.value || today().slice(0, 7));
              setVisibleCount(40);
            }}
          />
        </div>
      </div>

      <EditableBentoGrid
        pageKey={`finance:${tab}`}
        widgets={widgets}
        editing={editingLayout}
        onDoneEditing={() => setEditingLayout(false)}
      />

      {/* Right-Side Pop-Up Inspector Drawer */}
      <CategoryInspectorDrawer
        db={db}
        account={inspector?.account ?? "Personal"}
        category={inspector?.category ?? null}
        month={month}
        onClose={() => setInspector(null)}
        onAddExpense={(acc, cat) => openNewExpense(acc, cat)}
        onEditExpense={(exp) => setEdit(exp)}
      />

      {/* Right-Side Slide-Over Drawer for Adding / Editing Expenses */}
      <EditModal
        presentation="drawer"
        side="right"
        item={edit}
        fields={expenseFields}
        subtitle={
          edit && expenseAccount(edit) === "Personal"
            ? "Personal Ledger"
            : "Studio Ledger"
        }
        title={
          edit && expenseAccount(edit) === "Personal"
            ? "Personal Expense"
            : "Studio Expense"
        }
        onClose={() => setEdit(null)}
        onFieldChange={(next, key) => {
          if (key === "account") {
            const acc = expenseAccount(next);
            const cats = expenseCategoriesFor(acc);
            return {
              ...next,
              category: cats.includes(next.category)
                ? next.category
                : (cats[0] ?? "Other"),
              projectId: acc === "Personal" ? "" : next.projectId,
            };
          }
          return next;
        }}
        onSave={(v) =>
          setDB((d) => ({
            ...d,
            expenses: upsert(d.expenses, { ...v, account: expenseAccount(v) }),
          }))
        }
        onDelete={
          db.expenses.some((x) => x.id === edit?.id)
            ? (v) =>
                setDB((d) => ({
                  ...d,
                  expenses: d.expenses.filter((x) => x.id !== v.id),
                }))
            : undefined
        }
      />

      {/* Right-Side Slide-Over Drawer for Saving / Studio Goals */}
      <EditModal
        presentation="drawer"
        side="right"
        item={goal}
        fields={goalFields}
        subtitle={goal ? `${goalAccount(goal)} Goal` : "Goal"}
        title="Saving / Studio Goal"
        onClose={() => setGoal(null)}
        onFieldChange={(next, key) => {
          if (
            key === "account" &&
            goalAccount(next) === "Personal" &&
            next.kind !== "manual"
          ) {
            return { ...next, kind: "manual" as const };
          }
          return next;
        }}
        onSave={(v) =>
          setDB((d) => ({
            ...d,
            goals: upsert(d.goals, { ...v, account: goalAccount(v) }),
          }))
        }
        onDelete={
          db.goals.some((x) => x.id === goal?.id)
            ? (v) =>
                setDB((d) => ({
                  ...d,
                  goals: d.goals.filter((x) => x.id !== v.id),
                }))
            : undefined
        }
      />
    </>
  );
}
