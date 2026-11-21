import { toast } from "sonner";
import { SwipeRow } from "@/components/rv/SwipeRow";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  Briefcase,
  Eye,
  EyeOff,
  Layers,
  Plus,
  Search,
  Sparkles,
  Wallet,
} from "lucide-react";
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
  GoalPlannerDrawer,
  GoalRingCard,
  categoryIcon,
  expenseItemIcon,
} from "@/components/rv/FinanceVisuals";
import {
  BreakdownPieCard,
  CHART_LENS_OPTIONS,
  CHART_MODE_OPTIONS,
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
import { WorkspaceBalanceCard } from "@/components/rv/WorkspaceBalanceCard";
import { CentralAiBrief } from "@/components/rv/CentralAiBrief";
import {
  EXPENSE_CATEGORIES,
  cashFlowSeries,
  cashReceived,
  categoryTotals,
  combinedCashFlowSeries,
  compactMoney,
  expenseAccount,
  expenseTotal,
  goalAccount,
  invoiceView,
  isInvoice,
  money,
  periodBreakdownBars,
  setDB,
  shortDate,
  toUSD,
  today,
  uid,
  useDB,
  workspaceBalances,
  type CashRange,
  type Expense,
  type Goal,
} from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/finance")({
  validateSearch: (
    s: Record<string, unknown>,
  ): { view?: "studio" | "combined" } => ({
    ...(s["view"] === "combined"
      ? { view: "combined" }
      : s["view"] === "studio"
        ? { view: "studio" }
        : {}),
  }),
  head: () => ({
    meta: [
      { title: "Studio Finance · RothVan Studio" },
      {
        name: "description",
        content:
          "RothVan Design studio cash flow, operating expenses, client payments, and studio goals.",
      },
      { property: "og:title", content: "Studio Finance · RothVan Studio" },
      {
        property: "og:description",
        content:
          "RothVan Design studio cash flow, operating expenses, client payments, and studio goals.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const STUDIO_RANGES: { id: CashRange; label: string; desc: string }[] = [
  { id: "today", label: "Today", desc: "today" },
  { id: "week", label: "1W", desc: "last 7 days" },
  { id: "6m", label: "6M", desc: "last 6 months" },
  { id: "12m", label: "12M", desc: "last 12 months" },
  { id: "all", label: "All", desc: "all time" },
];

type FinanceView = "studio" | "combined";
type CombinedFilter = "all" | "studio" | "personal" | "income" | "expense";

function Page() {
  const db = useDB((d) => d);
  const r = db.settings.khrRate;
  const { view: searchView } = Route.useSearch();
  const [financeView, setFinanceView] = useState<FinanceView>(
    searchView === "combined" ? "combined" : "studio",
  );
  useEffect(() => {
    if (searchView === "combined" || searchView === "studio") {
      setFinanceView(searchView);
    }
  }, [searchView]);

  const [studioRange, setStudioRange] = useState<CashRange>("today");
  const [chartMode, setChartMode] = useState<ChartMode>("area");
  const [chartLens, setChartLens] = useState<ChartLens>("flow");
  const [month, setMonth] = useState(() => today().slice(0, 7));
  const [catFilter, setCatFilter] = useState<string>("All");
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(8);
  const [combinedFilter, setCombinedFilter] = useState<CombinedFilter>("all");
  const [combinedQuery, setCombinedQuery] = useState("");
  const [combinedVisible, setCombinedVisible] = useState(8);
  const [showAllPayments, setShowAllPayments] = useState(false);
  const [editingLayout, setEditingLayout] = useState(false);
  const [inspectedCategory, setInspectedCategory] = useState<string | null>(
    null,
  );
  const [edit, setEdit] = useState<Expense | null>(null);
  const [goal, setGoal] = useState<Goal | null>(null);

  const year = month.slice(0, 4) || today().slice(0, 4);
  const monthLabel = new Date(month + "-01T00:00:00Z").toLocaleDateString(
    "en-US",
    { month: "long", year: "numeric", timeZone: "UTC" },
  );

  const pts = useMemo(
    () => cashFlowSeries(db, studioRange, month),
    [db, studioRange, month],
  );
  const studioRangeMeta =
    STUDIO_RANGES.find((o) => o.id === studioRange) ?? STUDIO_RANGES[3]!;

  const studioInRange = useMemo(
    () => pts.reduce((a, x) => a + x.inn, 0),
    [pts],
  );
  const studioOutRange = useMemo(
    () => pts.reduce((a, x) => a + x.out, 0),
    [pts],
  );
  const studioNetRange = studioInRange - studioOutRange;

  const studioChartData = useMemo(() => {
    let runStudio = 0;
    return pts.map((x) => {
      runStudio += x.net;
      return {
        ...x,
        sparkValue: runStudio,
      };
    });
  }, [pts]);

  const studioBreakdownBars = useMemo(
    () =>
      periodBreakdownBars(
        db,
        "Studio",
        studioRange,
        month,
        "category",
        "spending",
      ),
    [db, studioRange, month],
  );

  const studioInYear = useMemo(() => cashReceived(db, year), [db, year]);
  const studioOutYear = useMemo(
    () => expenseTotal(db, "Studio", year),
    [db, year],
  );

  const unpaidInvoicesUSD = useMemo(
    () =>
      db.invoices
        .filter(isInvoice)
        .map((i) => invoiceView(i, db))
        .filter((v) => v.status !== "Draft")
        .reduce((a, v) => a + v.balanceUSD, 0),
    [db],
  );

  const studioCatsMonth = useMemo(
    () => categoryTotals(db, "Studio", month),
    [db, month],
  );
  const studioCatsAll = useMemo(() => categoryTotals(db, "Studio", ""), [db]);
  const studioCats =
    studioCatsMonth.length > 0 ? studioCatsMonth : studioCatsAll;
  const studioShelfScopeLabel =
    studioCatsMonth.length > 0 ? monthLabel : "all time";

  const studioGoals = useMemo(
    () => db.goals.filter((g) => goalAccount(g) === "Studio"),
    [db.goals],
  );

  const goalNow = useCallback(
    (g: Goal) => {
      if (g.kind === "cash") return studioInYear;
      if (g.kind === "clients")
        return db.clients.filter((c) => c.status !== "Lead").length;
      return g.current;
    },
    [studioInYear, db.clients],
  );

  const openNewExpense = useCallback(
    (category?: string) => {
      setEdit({
        id: uid(),
        date: today().startsWith(month) ? today() : `${month}-01`,
        projectId: "",
        category:
          category && EXPENSE_CATEGORIES.includes(category)
            ? category
            : (EXPENSE_CATEGORIES[0] ?? "Other"),
        vendor: "",
        description: "",
        amount: 0,
        currency: "USD",
        receipt: "",
        account: "Studio",
      });
    },
    [month],
  );

  const openNewGoal = () => {
    setGoal({
      id: uid(),
      name: "",
      kind: "manual",
      target: 1000,
      current: 0,
      account: "Studio",
      cadence: "monthly",
      contributionAmount: 100,
      targetDate: "",
      contributions: [],
    });
  };

  const expenseFields = (): Field<Expense>[] => [
    { k: "date", label: "Date", type: "date" },
    { k: "amount", label: "Amount", type: "number" },
    { k: "description", label: "Description", wide: true },
    {
      k: "category",
      label: "Studio Category (tap to choose)",
      type: "chips",
      options: EXPENSE_CATEGORIES.map((c) => ({
        value: c,
        label: c,
        icon: categoryIcon(c),
      })),
    },
    {
      k: "vendor",
      label: "Vendor / Merchant",
    },
    {
      k: "projectId",
      label: "Project (optional)",
      type: "select",
      options: db.projects.map((p) => ({
        value: p.id,
        label: `${p.code} · ${p.name}`,
      })),
    },
    {
      k: "currency",
      label: "Currency",
      type: "chips",
      options: ["USD", "KHR"],
    },
  ];

  const q = query.trim().toLowerCase();
  const filteredExpenses = useMemo(
    () =>
      db.expenses
        .filter((e) => {
          if (expenseAccount(e) !== "Studio") return false;
          if (catFilter !== "All" && e.category !== catFilter) return false;
          if (q) {
            const hay =
              `${e.description} ${e.vendor} ${e.category}`.toLowerCase();
            if (!hay.includes(q)) return false;
          }
          return true;
        })
        .sort((a, b) => b.date.localeCompare(a.date)),
    [db.expenses, catFilter, q],
  );

  const visibleExpenses = filteredExpenses.slice(0, visibleCount);
  const recentPayments = useMemo(
    () =>
      [...db.payments]
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, showAllPayments ? db.payments.length : 8),
    [db.payments, showAllPayments],
  );

  const balances = useMemo(() => workspaceBalances(db, month), [db, month]);
  const combinedPts = useMemo(
    () => combinedCashFlowSeries(db, studioRange),
    [db, studioRange],
  );
  const combinedInRange = useMemo(
    () => combinedPts.reduce((a, x) => a + x.totalIn, 0),
    [combinedPts],
  );
  const combinedOutRange = useMemo(
    () => combinedPts.reduce((a, x) => a + x.totalOut, 0),
    [combinedPts],
  );
  const combinedNetRange = combinedInRange - combinedOutRange;
  const personalCatsAll = useMemo(
    () => categoryTotals(db, "Personal", ""),
    [db],
  );

  const combinedLedgerRows = useMemo(() => {
    type Entry = {
      id: string;
      date: string;
      workspace: "Studio" | "Personal";
      direction: "income" | "expense";
      title: string;
      sub: string;
      usd: number;
    };
    const invMap = new Map(db.invoices.map((i) => [i.id, i]));
    const clientMap = new Map(db.clients.map((c) => [c.id, c.name]));

    const entries: Entry[] = [
      ...db.payments
        .filter((p) => {
          const inv = invMap.get(p.invoiceId);
          return inv ? isInvoice(inv) : true;
        })
        .map((p) => {
          const inv = invMap.get(p.invoiceId);
          const clientName = inv ? clientMap.get(inv.clientId) : undefined;
          return {
            id: `pay-${p.id}`,
            date: p.date,
            workspace: "Studio" as const,
            direction: "income" as const,
            title: `${clientName || "Client"} · ${inv?.no || "Invoice"}`,
            sub: `${p.method}${p.reference ? ` · ${p.reference}` : ""}`,
            usd: toUSD(p.amount, p.currency, r),
          };
        }),
      ...(db.personalIncome ?? []).map((inc) => ({
        id: `pinc-${inc.id}`,
        date: inc.date,
        workspace: "Personal" as const,
        direction: "income" as const,
        title: inc.description || inc.source,
        sub: `${inc.source}${inc.accountMethod ? ` · ${inc.accountMethod}` : ""}`,
        usd: toUSD(inc.amount, inc.currency, r),
      })),
      ...db.expenses.map((e) => {
        const ws = expenseAccount(e);
        return {
          id: `exp-${e.id}`,
          date: e.date,
          workspace: ws,
          direction: "expense" as const,
          title: e.description || e.vendor || e.category,
          sub: `${e.category}${e.vendor ? ` · ${e.vendor}` : ""}`,
          usd: toUSD(e.amount, e.currency, r),
        };
      }),
    ];

    const cq = combinedQuery.trim().toLowerCase();
    return entries
      .filter((row) => {
        if (combinedFilter === "studio" && row.workspace !== "Studio")
          return false;
        if (combinedFilter === "personal" && row.workspace !== "Personal")
          return false;
        if (combinedFilter === "income" && row.direction !== "income")
          return false;
        if (combinedFilter === "expense" && row.direction !== "expense")
          return false;
        if (cq) {
          const hay =
            `${row.title} ${row.sub} ${row.workspace} ${row.direction}`.toLowerCase();
          if (!hay.includes(cq)) return false;
        }
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [
    db.payments,
    db.invoices,
    db.clients,
    db.personalIncome,
    db.expenses,
    r,
    combinedFilter,
    combinedQuery,
  ]);
  const combinedVisibleRows = combinedLedgerRows.slice(0, combinedVisible);

  /** Swipe-delete for expenses & personal income (invoice payments stay protected). */
  const deleteCombinedRow = (rowId: string) => {
    if (rowId.startsWith("exp-")) {
      const item = db.expenses.find((x) => `exp-${x.id}` === rowId);
      if (!item) return;
      setDB((d) => ({
        ...d,
        expenses: d.expenses.filter((x) => x.id !== item.id),
      }));
      toast("Expense deleted", {
        action: {
          label: "Undo",
          onClick: () =>
            setDB((d) => ({ ...d, expenses: [item, ...d.expenses] })),
        },
      });
    } else if (rowId.startsWith("pinc-")) {
      const item = (db.personalIncome ?? []).find(
        (x) => `pinc-${x.id}` === rowId,
      );
      if (!item) return;
      setDB((d) => ({
        ...d,
        personalIncome: (d.personalIncome ?? []).filter(
          (x) => x.id !== item.id,
        ),
      }));
      toast("Income deleted", {
        action: {
          label: "Undo",
          onClick: () =>
            setDB((d) => ({
              ...d,
              personalIncome: [item, ...(d.personalIncome ?? [])],
            })),
        },
      });
    }
  };

  const deleteStudioExpense = useCallback((item: Expense) => {
    setDB((d) => ({
      ...d,
      expenses: d.expenses.filter((x) => x.id !== item.id),
    }));
    toast("Expense deleted", {
      action: {
        label: "Undo",
        onClick: () =>
          setDB((d) => ({ ...d, expenses: [item, ...d.expenses] })),
      },
    });
  }, []);

  const widgets = useMemo<BentoWidgetDef[]>(
    () => [
      {
        id: "headline",
        title: "Studio net profit",
        defaultSpan: 5,
        render: () => (
          <Glass className="flex h-full flex-col justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Studio net cash profit, {studioRangeMeta.desc}
              </p>
              <p
                className={cn(
                  "font-num mt-2 text-3xl font-extrabold sm:text-4xl",
                  studioNetRange < 0 && "text-destructive",
                )}
              >
                <AnimatedNumber value={studioNetRange} />
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Client payments received minus RothVan Design studio expenses
              </p>
              <SparklineWithDates
                data={studioChartData.map((x) => ({
                  label: x.label,
                  fullDate: x.fullDate,
                  v: x.sparkValue,
                  inn: x.inn,
                  out: x.out,
                  count: x.inCount + x.outCount,
                }))}
                gradientId="fin-sp-studio"
                valueLabel="Studio cumulative net"
              />
            </div>
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
          </Glass>
        ),
      },
      {
        id: "trendChart",
        title: "Studio cash flow",
        defaultSpan: 7,
        render: () => {
          const studioLens = chartLens === "method" ? "category" : chartLens;
          return (
            <Glass delay={80} className="h-full">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="font-medium">
                    {studioLens === "net"
                      ? "Studio net cash flow"
                      : studioLens === "category"
                        ? "Studio costs by category"
                        : "Studio cash flow"}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {studioRangeMeta.desc}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <SlidingTabs
                    iconOnly
                    size="xs"
                    tone="invert"
                    layoutGroup="fin-chart-lens"
                    value={studioLens}
                    onChange={setChartLens}
                    options={CHART_LENS_OPTIONS.slice(0, 3)}
                  />
                  <SlidingTabs
                    iconOnly
                    size="xs"
                    layoutGroup="fin-chart-mode"
                    value={chartMode}
                    onChange={setChartMode}
                    options={CHART_MODE_OPTIONS}
                  />
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
                </div>
              </div>

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

              {studioLens === "category" ? (
                <TrendChartCanvas
                  mode={chartMode}
                  data={studioBreakdownBars}
                  primaryKey="primary"
                  primaryName="Studio costs"
                  secondaryKey="secondary"
                  secondaryName="Income"
                  gradientId="fin-cf-studio-cat"
                  hideSecondary
                  xInterval={0}
                />
              ) : studioLens === "net" ? (
                <TrendChartCanvas
                  mode={chartMode}
                  data={studioChartData}
                  primaryKey="net"
                  primaryName="Studio net"
                  secondaryKey="out"
                  secondaryName="Studio expenses"
                  gradientId="fin-cf-studio-net"
                  isNetMetric
                  hideSecondary
                />
              ) : (
                <TrendChartCanvas
                  mode={chartMode}
                  data={studioChartData}
                  primaryKey="inn"
                  primaryName="Client cash in"
                  secondaryKey="out"
                  secondaryName="Studio expenses"
                  gradientId="fin-cf-studio"
                />
              )}
            </Glass>
          );
        },
      },
      {
        id: "breakdownPie",
        title: "Studio expense & revenue pie",
        defaultSpan: 6,
        render: () => (
          <BreakdownPieCard
            db={db}
            account="Studio"
            personalItems={[]}
            studioItems={studioCats}
            scopeLabel={studioShelfScopeLabel}
            onSelectCategory={(_acc, category) =>
              setInspectedCategory(category)
            }
          />
        ),
      },
      {
        id: "pulseBars",
        title: "Monthly studio revenue",
        defaultSpan: 6,
        render: () => (
          <PeriodBarPulseCard
            title="Recent monthly studio revenue"
            subtitle={`Last ${Math.min(6, studioChartData.length)} months client payments`}
            data={studioChartData.slice(-6)}
            valueKey="inn"
          />
        ),
      },
      {
        id: "jarsShelf",
        title: "Studio category budget jars",
        defaultSpan: 12,
        render: () => (
          <div>
            {studioCats.length === 0 ? (
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
                selectedCategory={inspectedCategory}
                onSelectCategory={(category) => setInspectedCategory(category)}
              />
            )}
          </div>
        ),
      },
      {
        id: "goalsGrid",
        title: "RothVan Studio goals",
        defaultSpan: 12,
        render: () => (
          <Glass delay={180}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <p className="label-mono">RothVan Studio goals</p>
              </div>
              <Btn
                onClick={openNewGoal}
                className="px-3 py-1 text-xs whitespace-nowrap shrink-0"
              >
                <Plus className="h-3 w-3" />
                Add studio goal
              </Btn>
            </div>

            {studioGoals.length === 0 ? (
              <Empty>No studio goals yet.</Empty>
            ) : (
              <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
                {studioGoals.map((g, idx) => (
                  <GoalRingCard
                    key={g.id}
                    goal={g}
                    current={goalNow(g)}
                    delay={idx * 60}
                    onEdit={() => setGoal(g)}
                    onQuickAdd={
                      g.kind === "manual"
                        ? (amt) =>
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
      {
        id: "studioIncome",
        title: "Client invoice payments",
        defaultSpan: 12,
        render: () => (
          <Glass delay={240}>
            <div className="mb-3 flex items-center justify-between">
              <div className="flex min-w-0 items-center gap-2">
                <p className="label-mono">
                  Recent Studio Income ({db.payments.length} recorded invoice
                  payments)
                </p>
                <button
                  type="button"
                  onClick={() => setShowAllPayments((value) => !value)}
                  aria-label={
                    showAllPayments
                      ? "Show recent 8 payments"
                      : "Show all payments"
                  }
                  title={showAllPayments ? "Show recent 8" : "Show all"}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {showAllPayments ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
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
                        <span className="font-num shrink-0 text-sm text-positive">
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
      },
      {
        id: "expensesLedger",
        title: "Studio expenses ledger",
        defaultSpan: 12,
        render: () => (
          <Glass delay={280}>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="label-mono">
                  RothVan Design expenses
                  {catFilter !== "All" ? ` · ${catFilter}` : ""}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {filteredExpenses.length}{" "}
                  {filteredExpenses.length === 1 ? "entry" : "entries"}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative min-w-0 flex-1 sm:flex-none">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setVisibleCount(8);
                    }}
                    placeholder="Search vendor or item..."
                    className="field w-full py-1.5 pl-8 text-base sm:w-56 sm:text-xs"
                  />
                </div>
                <Btn
                  onClick={() => openNewExpense()}
                  className="px-3 py-1.5 text-xs whitespace-nowrap shrink-0"
                >
                  <Plus className="h-3 w-3" />
                  Add studio cost
                </Btn>
              </div>
            </div>

            <div className="no-scrollbar mb-3 flex flex-nowrap gap-1.5 overflow-x-auto pb-1 sm:flex-wrap sm:pb-0">
              <button
                type="button"
                onClick={() => setCatFilter("All")}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[0.7rem] whitespace-nowrap shrink-0 transition-colors",
                  catFilter === "All"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                All
              </button>
              {EXPENSE_CATEGORIES.map((c) => {
                const CatIcon = categoryIcon(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCatFilter(catFilter === c ? "All" : c)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.7rem] whitespace-nowrap shrink-0 transition-colors",
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
              <Empty>No studio expenses match this filter.</Empty>
            ) : (
              <>
                <ul className="divide-y divide-border">
                  {visibleExpenses.map((e) => {
                    const proj = e.projectId
                      ? db.projects.find((p) => p.id === e.projectId)
                      : undefined;
                    const ItemIcon = expenseItemIcon(e);
                    return (
                      <li key={e.id}>
                        <SwipeRow
                          onEdit={() => setEdit(e)}
                          onDelete={() => deleteStudioExpense(e)}
                        >
                          <button
                            type="button"
                            onClick={() => setEdit(e)}
                            className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl px-2 py-3 text-left transition-colors hover:bg-muted"
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-border bg-muted text-primary">
                                <ItemIcon className="h-4 w-4" />
                              </span>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium">
                                  {e.description ||
                                    e.vendor ||
                                    "Studio expense"}
                                </p>
                                <p className="truncate text-xs text-muted-foreground">
                                  {shortDate(e.date)} · {e.category}
                                  {e.vendor ? ` · ${e.vendor}` : ""}
                                  {proj ? ` · ${proj.code}` : ""}
                                </p>
                              </div>
                            </div>
                            <p className="font-num text-sm text-destructive">
                              {money(-e.amount, e.currency)}
                            </p>
                          </button>
                        </SwipeRow>
                      </li>
                    );
                  })}
                </ul>
                {filteredExpenses.length > visibleExpenses.length && (
                  <div className="mt-3 flex justify-center gap-2">
                    <Btn
                      onClick={() => setVisibleCount((n) => n + 8)}
                      className="px-4 py-1.5 text-xs"
                    >
                      Show 8 more (
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
                {visibleCount > 8 && filteredExpenses.length > 8 && (
                  <div className="mt-2 flex justify-center">
                    <Btn
                      onClick={() => setVisibleCount(8)}
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
      },
    ],
    [
      studioRangeMeta,
      studioNetRange,
      studioChartData,
      studioBreakdownBars,
      chartLens,
      unpaidInvoicesUSD,
      year,
      studioInYear,
      studioOutYear,
      chartMode,
      studioRange,
      studioInRange,
      studioOutRange,
      db,
      studioCats,
      studioShelfScopeLabel,
      month,
      inspectedCategory,
      studioGoals,
      recentPayments,
      showAllPayments,
      r,
      catFilter,
      filteredExpenses,
      query,
      visibleExpenses,
      visibleCount,
      goalNow,
      openNewExpense,
      deleteStudioExpense,
    ],
  );

  return (
    <>
      <PageHeader
        title={
          financeView === "combined"
            ? "Combined Studio + Personal Cash Flow"
            : "Studio Finance"
        }
        owner={db.settings.ownerName}
        action={
          <div className="flex flex-wrap items-center gap-2">
            {financeView === "studio" && (
              <EditLayoutButton
                editing={editingLayout}
                onToggle={() => setEditingLayout((e) => !e)}
              />
            )}
            <Btn
              variant="gold"
              onClick={() => openNewExpense()}
              className="whitespace-nowrap shrink-0"
            >
              <Plus className="h-4 w-4" />
              Add studio cost
            </Btn>
          </div>
        }
      />

      {/* Studio Scope & Month Bar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        {financeView === "combined" ? (
          <Btn
            type="button"
            onClick={() => setFinanceView("studio")}
            className="px-3.5 py-1.5 text-xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Studio Finance
          </Btn>
        ) : (
          <p className="hidden text-xs text-muted-foreground sm:block">
            RothVan Design studio cash flow, invoice payments, operating costs,
            and studio savings goals
          </p>
        )}
        <MonthPicker
          value={month}
          onChange={(next) => {
            setMonth(next);
            setVisibleCount(8);
          }}
        />
      </div>

      {financeView === "studio" ? (
        <>
          <WorkspaceBalanceCard workspace="studio" />
          <EditableBentoGrid
            pageKey="finance:studio-only"
            widgets={widgets}
            editing={editingLayout}
            onDoneEditing={() => setEditingLayout(false)}
          />
        </>
      ) : (
        <div className="space-y-4">
          {/* Top Combined Summary Card */}
          <Glass className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Layers className="h-3.5 w-3.5 text-primary" />
                <span className="font-medium text-foreground">
                  Combined Studio + Personal Balance
                </span>
                <span aria-hidden="true">·</span>
                <span>All-time real-time ledger total</span>
              </div>
              <p
                className={cn(
                  "font-num mt-1.5 text-3xl font-extrabold tracking-tight sm:text-4xl",
                  balances.combinedBalance >= 0
                    ? "text-foreground"
                    : "text-destructive",
                )}
              >
                <AnimatedNumber value={balances.combinedBalance} />
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Studio ({money(balances.studioBalance)}) + Personal (
                {money(balances.personalBalance)})
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 border-t border-border/70 pt-3 sm:grid-cols-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
              <Stat
                label="Total cash in"
                value={compactMoney(balances.combinedInAll)}
                fullValue={money(balances.combinedInAll)}
                tone="pos"
              />
              <Stat
                label="Total out"
                value={compactMoney(balances.combinedOutAll)}
                fullValue={money(balances.combinedOutAll)}
                tone="neg"
              />
              <Stat
                label={`${monthLabel} net`}
                value={compactMoney(balances.combinedMonthNet, "USD", true)}
                fullValue={money(balances.combinedMonthNet, "USD", true)}
                tone={balances.combinedMonthNet >= 0 ? "pos" : "neg"}
              />
              <Stat
                label="Open A/R"
                value={compactMoney(balances.openAR)}
                fullValue={money(balances.openAR)}
              />
            </div>
          </Glass>

          <CentralAiBrief db={db} defaultTab="forecast" className="mb-4" />

          {/* Combined Cash Flow Chart + Studio vs Personal Split */}
          <div className="grid gap-4 lg:grid-cols-12">
            <Glass className="lg:col-span-8">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-medium">
                  Combined cash flow (Studio + Personal)
                </h2>
                <div className="flex flex-wrap items-center gap-1.5">
                  <SlidingTabs
                    size="xs"
                    layoutGroup="fin-comb-mode"
                    value={chartMode}
                    onChange={setChartMode}
                    options={CHART_MODE_OPTIONS}
                  />
                  <SlidingTabs
                    size="xs"
                    tone="invert"
                    layoutGroup="fin-comb-range"
                    value={studioRange}
                    onChange={setStudioRange}
                    options={STUDIO_RANGES.map((o) => ({
                      id: o.id,
                      label: o.label,
                    }))}
                  />
                </div>
              </div>
              <div className="mb-3 grid grid-cols-3 gap-3">
                <Stat
                  label={`● In (${studioRangeMeta.desc})`}
                  value={compactMoney(combinedInRange)}
                  fullValue={money(combinedInRange)}
                  tone="pos"
                />
                <Stat
                  label={`○ Out (${studioRangeMeta.desc})`}
                  value={compactMoney(combinedOutRange)}
                  fullValue={money(combinedOutRange)}
                />
                <Stat
                  label="Combined net"
                  value={compactMoney(combinedNetRange, "USD", true)}
                  fullValue={money(combinedNetRange, "USD", true)}
                  tone={combinedNetRange >= 0 ? "pos" : "neg"}
                />
              </div>
              <TrendChartCanvas
                mode={chartMode}
                data={combinedPts}
                primaryKey="totalIn"
                primaryName="Combined income (Studio + Personal)"
                secondaryKey="totalOut"
                secondaryName="Combined outflow (Studio + Personal)"
                gradientId="fin-cf-combined"
              />
            </Glass>

            <Glass className="flex flex-col justify-between lg:col-span-4">
              <div>
                <h2 className="font-medium">Studio vs Personal split</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Side-by-side comparison across all time
                </p>

                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl border border-border/80 bg-muted/40 p-3.5">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground">
                        <Briefcase className="h-3.5 w-3.5 text-primary" />
                        Studio
                      </span>
                      <Link
                        to="/studio"
                        className="text-[0.7rem] text-primary hover:underline"
                      >
                        Open →
                      </Link>
                    </div>
                    <div className="mt-2.5 grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <p className="text-[0.65rem] text-muted-foreground">
                          Cash in
                        </p>
                        <p className="font-num font-semibold text-positive">
                          {compactMoney(balances.studioInAll)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[0.65rem] text-muted-foreground">
                          Costs
                        </p>
                        <p className="font-num font-semibold text-destructive">
                          {compactMoney(balances.studioOutAll)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[0.65rem] text-muted-foreground">
                          Balance
                        </p>
                        <p className="font-num font-semibold text-foreground">
                          {compactMoney(balances.studioBalance)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border/80 bg-muted/40 p-3.5">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground">
                        <Wallet className="h-3.5 w-3.5 text-positive" />
                        Personal
                      </span>
                      <Link
                        to="/personal"
                        className="text-[0.7rem] text-primary hover:underline"
                      >
                        Open →
                      </Link>
                    </div>
                    <div className="mt-2.5 grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <p className="text-[0.65rem] text-muted-foreground">
                          Income
                        </p>
                        <p className="font-num font-semibold text-positive">
                          {compactMoney(balances.personalInAll)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[0.65rem] text-muted-foreground">
                          Spending
                        </p>
                        <p className="font-num font-semibold text-destructive">
                          {compactMoney(balances.personalOutAll)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[0.65rem] text-muted-foreground">
                          Balance
                        </p>
                        <p className="font-num font-semibold text-foreground">
                          {compactMoney(balances.personalBalance)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 border-t border-border/70 pt-3 text-xs text-muted-foreground">
                Combined monthly net ({monthLabel}):{" "}
                <span
                  className={cn(
                    "font-num font-semibold",
                    balances.combinedMonthNet >= 0
                      ? "text-positive"
                      : "text-destructive",
                  )}
                >
                  {money(balances.combinedMonthNet, "USD", true)}
                </span>
              </div>
            </Glass>
          </div>

          <BreakdownPieCard
            db={db}
            account="Combined"
            personalItems={personalCatsAll}
            studioItems={studioCatsAll}
            scopeLabel="all combined expenses"
            onSelectCategory={(_acc, category) =>
              setInspectedCategory(category)
            }
          />

          {/* Unified Combined Ledger */}
          <Glass>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="label-mono">
                  Combined Studio &amp; Personal Ledger (
                  {combinedLedgerRows.length})
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Every invoice payment, studio operating cost, personal income,
                  and personal expense in chronological order
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <SlidingTabs
                  size="xs"
                  layoutGroup="fin-combined-filter"
                  value={combinedFilter}
                  onChange={(v) => {
                    setCombinedFilter(v);
                    setCombinedVisible(8);
                  }}
                  options={[
                    { id: "all", label: "All" },
                    { id: "studio", label: "Studio" },
                    { id: "personal", label: "Personal" },
                    { id: "income", label: "Income" },
                    { id: "expense", label: "Expense" },
                  ]}
                />
                <div className="relative min-w-0 flex-1 sm:flex-none">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="search"
                    value={combinedQuery}
                    onChange={(e) => {
                      setCombinedQuery(e.target.value);
                      setCombinedVisible(8);
                    }}
                    placeholder="Search combined ledger…"
                    className="field w-full py-1.5 pl-8 text-xs sm:w-56"
                  />
                </div>
              </div>
            </div>

            {combinedVisibleRows.length === 0 ? (
              <Empty>No ledger entries match this filter.</Empty>
            ) : (
              <>
                <ul className="divide-y divide-border">
                  {combinedVisibleRows.map((row) => {
                    const expMatch = row.id.startsWith("exp-")
                      ? db.expenses.find((x) => `exp-${x.id}` === row.id)
                      : undefined;
                    return (
                      <li key={row.id}>
                        <SwipeRow
                          onEdit={
                            expMatch ? () => setEdit(expMatch) : undefined
                          }
                          onDelete={
                            row.id.startsWith("pay-")
                              ? undefined
                              : () => deleteCombinedRow(row.id)
                          }
                        >
                          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-2 py-2.5">
                            <div className="flex min-w-0 items-center gap-3">
                              <span
                                className={cn(
                                  "grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-border bg-muted",
                                  row.direction === "income"
                                    ? "text-positive"
                                    : "text-destructive",
                                )}
                              >
                                {row.direction === "income" ? (
                                  <ArrowDownLeft className="h-4 w-4" />
                                ) : (
                                  <ArrowUpRight className="h-4 w-4" />
                                )}
                              </span>
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="truncate text-sm font-medium text-foreground">
                                    {row.title}
                                  </p>
                                  <span
                                    className={cn(
                                      "rounded-full border px-2 py-0.5 text-[0.62rem] font-medium",
                                      row.workspace === "Studio"
                                        ? "border-primary/40 bg-primary/12 text-primary"
                                        : "border-border bg-muted text-muted-foreground",
                                    )}
                                  >
                                    {row.workspace}
                                  </span>
                                </div>
                                <p className="truncate text-xs text-muted-foreground">
                                  {shortDate(row.date)} · {row.sub}
                                </p>
                              </div>
                            </div>
                            <span
                              className={cn(
                                "font-num shrink-0 text-sm font-semibold",
                                row.direction === "income"
                                  ? "text-positive"
                                  : "text-destructive",
                              )}
                            >
                              {row.direction === "income"
                                ? `+${money(row.usd)}`
                                : money(-row.usd)}
                            </span>
                          </div>
                        </SwipeRow>
                      </li>
                    );
                  })}
                </ul>

                {combinedLedgerRows.length > combinedVisibleRows.length && (
                  <div className="mt-3 flex justify-center gap-2">
                    <Btn
                      type="button"
                      onClick={() => setCombinedVisible((n) => n + 8)}
                      className="px-4 py-1.5 text-xs"
                    >
                      Show 8 more (
                      {combinedLedgerRows.length - combinedVisibleRows.length}{" "}
                      remaining)
                    </Btn>
                    <Btn
                      type="button"
                      onClick={() =>
                        setCombinedVisible(combinedLedgerRows.length)
                      }
                      className="px-4 py-1.5 text-xs"
                    >
                      Show all ({combinedLedgerRows.length})
                    </Btn>
                  </div>
                )}
                {combinedVisible > 8 && combinedLedgerRows.length > 8 && (
                  <div className="mt-2 flex justify-center">
                    <Btn
                      type="button"
                      onClick={() => setCombinedVisible(8)}
                      className="px-4 py-1.5 text-xs"
                    >
                      Show recent 8 only
                    </Btn>
                  </div>
                )}
              </>
            )}
          </Glass>
        </div>
      )}

      {/* Right-Side Pop-Up Inspector Drawer */}
      <CategoryInspectorDrawer
        db={db}
        account="Studio"
        category={inspectedCategory}
        month={month}
        onClose={() => setInspectedCategory(null)}
        onAddExpense={(_acc, cat) => openNewExpense(cat)}
        onEditExpense={(exp) => setEdit(exp)}
      />

      {/* Right-Side Slide-Over Drawer for Adding / Editing Studio Expenses */}
      <EditModal
        presentation="drawer"
        side="right"
        item={edit}
        fields={expenseFields()}
        subtitle="RothVan Design"
        title="Studio Expense"
        onClose={() => setEdit(null)}
        onSave={(v) =>
          setDB((d) => ({
            ...d,
            expenses: upsert(d.expenses, { ...v, account: "Studio" }),
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

      {/* Right-Side Goal Planner Drawer for Studio Goals */}
      <GoalPlannerDrawer
        goal={goal}
        liveCurrent={goal ? goalNow(goal) : undefined}
        account="Studio"
        onClose={() => setGoal(null)}
        onSave={(v) =>
          setDB((d) => ({
            ...d,
            goals: upsert(d.goals, { ...v, account: "Studio" }),
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
