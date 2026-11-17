import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowDownLeft, Plus, Search, Sparkles } from "lucide-react";
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
} from "@/components/rv/FinanceVisuals";
import {
  BreakdownPieCard,
  CHART_MODE_OPTIONS,
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
  EXPENSE_CATEGORIES,
  cashFlowSeries,
  cashReceived,
  categoryTotals,
  compactMoney,
  expenseAccount,
  expenseTotal,
  goalAccount,
  invoiceView,
  isInvoice,
  money,
  setDB,
  shortDate,
  toUSD,
  today,
  uid,
  useDB,
  type CashRange,
  type Expense,
  type Goal,
} from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/finance")({
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
  { id: "6m", label: "6 months", desc: "last 6 months" },
  { id: "12m", label: "12 months", desc: "last 12 months" },
  { id: "all", label: "All time", desc: "all time" },
];

function Page() {
  const db = useDB((d) => d);
  const r = db.settings.khrRate;
  const [studioRange, setStudioRange] = useState<CashRange>("all");
  const [chartMode, setChartMode] = useState<ChartMode>("area");
  const [month, setMonth] = useState(() => today().slice(0, 7));
  const [catFilter, setCatFilter] = useState<string>("All");
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(40);
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

  const pts = useMemo(() => cashFlowSeries(db, studioRange), [db, studioRange]);
  const studioRangeMeta =
    STUDIO_RANGES.find((o) => o.id === studioRange) ?? STUDIO_RANGES[2]!;

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

  const goalNow = (g: Goal) => {
    if (g.kind === "cash") return studioInYear;
    if (g.kind === "clients")
      return db.clients.filter((c) => c.status !== "Lead").length;
    return g.current;
  };

  const openNewExpense = (category?: string) => {
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
  };

  const openNewGoal = () => {
    setGoal({
      id: uid(),
      name: "",
      kind: "manual",
      target: 1000,
      current: 0,
      account: "Studio",
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

  const goalFields = (): Field<Goal>[] => [
    {
      k: "kind",
      label: "Tracks",
      type: "select",
      options: [
        { value: "cash", label: "Studio cash received (auto)" },
        { value: "clients", label: "Clients won (auto)" },
        { value: "manual", label: "Manual studio fund" },
      ],
    },
    { k: "name", label: "Goal name", wide: true },
    { k: "target", label: "Target (USD or count)", type: "number" },
    { k: "current", label: "Current saved (manual)", type: "number" },
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
        .slice(0, 10),
    [db.payments],
  );

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
                  "font-num mt-2 text-4xl font-extrabold",
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
        render: () => (
          <Glass delay={80} className="h-full">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-medium">Studio cash flow</h2>
              <div className="flex flex-wrap items-center gap-1.5">
                <SlidingTabs
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

            <TrendChartCanvas
              mode={chartMode}
              data={studioChartData}
              primaryKey="inn"
              primaryName="Client cash in"
              secondaryKey="out"
              secondaryName="Studio expenses"
              gradientId="fin-cf-studio"
            />
          </Glass>
        ),
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
      {
        id: "studioIncome",
        title: "Client invoice payments",
        defaultSpan: 12,
        render: () => (
          <Glass delay={240}>
            <div className="mb-3 flex items-center justify-between">
              <p className="label-mono">
                Recent Studio Income ({db.payments.length} recorded invoice
                payments)
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
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setVisibleCount(40);
                    }}
                    placeholder="Search vendor or item..."
                    className="field w-44 py-1.5 pl-8 text-xs sm:w-56"
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

            <div className="mb-3 flex flex-wrap gap-1.5">
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
                                {e.description || e.vendor || "Studio expense"}
                              </p>
                              <p className="truncate text-xs text-muted-foreground">
                                {shortDate(e.date)} · {e.category}
                                {e.vendor ? ` · ${e.vendor}` : ""}
                                {proj ? ` · ${proj.code}` : ""}
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
      },
    ],
    [
      studioRangeMeta,
      studioNetRange,
      studioChartData,
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
      r,
      catFilter,
      filteredExpenses,
      query,
      visibleExpenses,
      visibleCount,
    ],
  );

  return (
    <>
      <PageHeader
        title="Studio Finance"
        owner={db.settings.ownerName}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <EditLayoutButton
              editing={editingLayout}
              onToggle={() => setEditingLayout((e) => !e)}
            />
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

      {/* Month Scope Bar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          RothVan Design revenue, client payments, and studio operating costs
          (kept separate from your{" "}
          <Link to="/personal" className="text-primary hover:underline">
            Personal Income &amp; Spending
          </Link>
          ).
        </p>
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
        pageKey="finance:studio-only"
        widgets={widgets}
        editing={editingLayout}
        onDoneEditing={() => setEditingLayout(false)}
      />

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

      {/* Right-Side Slide-Over Drawer for Studio Goals */}
      <EditModal
        presentation="drawer"
        side="right"
        item={goal}
        fields={goalFields()}
        subtitle="RothVan Design Goal"
        title="Studio Goal"
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
