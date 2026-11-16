import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowDownLeft, PiggyBank, Plus, Search, Sparkles } from "lucide-react";
import { Btn, Empty, Glass, PageHeader, Stat } from "@/components/rv/ui";
import { EditModal, upsert, type Field } from "@/components/rv/Crud";
import {
  AnimatedNumber,
  BudgetShelf,
  CategoryInspectorDrawer,
  GoalRingCard,
  expenseItemIcon,
} from "@/components/rv/FinanceVisuals";
import {
  EXPENSE_CATEGORIES,
  PERSONAL_CATEGORIES,
  cashFlowSeries,
  cashReceived,
  categoryTotals,
  expenseAccount,
  expenseCategoriesFor,
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
  type Account,
  type CashRange,
  type Expense,
  type Goal,
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

const RANGE_OPTIONS: { id: CashRange; label: string; desc: string }[] = [
  { id: "6m", label: "6 months", desc: "last 6 months" },
  { id: "12m", label: "12 months", desc: "last 12 months" },
  { id: "all", label: "All time", desc: "all time" },
];

function Page() {
  const db = useDB((d) => d);
  const r = db.settings.khrRate;
  const [tab, setTab] = useState<Tab>("Studio");
  const [range, setRange] = useState<CashRange>("all");
  const [month, setMonth] = useState(() => today().slice(0, 7));
  const [catFilter, setCatFilter] = useState<string>("All");
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(40);
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

  const pts = cashFlowSeries(db, range);
  const rangeMeta = RANGE_OPTIONS.find((o) => o.id === range)!;

  const studioInRange = pts.reduce((a, x) => a + x.inn, 0);
  const studioOutRange = pts.reduce((a, x) => a + x.out, 0);
  const personalOutRange = pts.reduce((a, x) => a + x.personalOut, 0);
  const studioNetRange = studioInRange - studioOutRange;
  const combinedOutRange = studioOutRange + personalOutRange;
  const combinedNetRange = studioInRange - combinedOutRange;

  let runStudio = 0;
  let runCombined = 0;
  const chartData = pts.map((x) => {
    runStudio += x.net;
    runCombined += x.combinedNet;
    const totalOut = x.out + x.personalOut;
    return {
      ...x,
      totalOut,
      sparkValue:
        tab === "Personal"
          ? x.personalOut
          : tab === "Combined"
            ? runCombined
            : runStudio,
    };
  });

  const studioInYear = cashReceived(db, year);
  const studioOutYear = expenseTotal(db, "Studio", year);
  const personalOutMonth = expenseTotal(db, "Personal", month);
  const personalAvgMonth =
    pts.length > 0 ? personalOutRange / pts.length : personalOutMonth;

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
  const personalCats = categoryTotals(db, "Personal", month);

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
    if (next === "Personal" && range === "all") setRange("6m");
    if (next !== "Personal" && range === "6m") setRange("all");
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
        type: "select",
        options: [
          { value: "Studio", label: "RothVan Design (Studio)" },
          { value: "Personal", label: "Personal" },
        ],
      },
      { k: "date", label: "Date", type: "date" },
      { k: "description", label: "Description", wide: true },
      {
        k: "category",
        label: "Category",
        type: "select",
        options: expenseCategoriesFor(acc),
      },
      {
        k: "vendor",
        label:
          acc === "Personal" ? "Card / Payment method" : "Vendor / Merchant",
      },
      ...(acc === "Studio"
        ? [
            {
              k: "projectId" as const,
              label: "Project (optional)",
              type: "select" as const,
              options: db.projects.map((p) => ({
                value: p.id,
                label: `${p.code} · ${p.name}`,
              })),
            },
          ]
        : []),
      { k: "amount", label: "Amount", type: "number" },
      {
        k: "currency",
        label: "Currency",
        type: "select",
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
      if (tab === "Personal" && month && !q && !e.date.startsWith(month))
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
      ? personalOutRange
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

  return (
    <>
      <PageHeader
        title="Finance"
        owner={db.settings.ownerName}
        action={
          <Btn
            variant="gold"
            onClick={() =>
              openNewExpense(tab === "Personal" ? "Personal" : "Studio")
            }
          >
            <Plus className="h-4 w-4" />
            Add {tab === "Personal" ? "personal" : "studio"} expense
          </Btn>
        }
      />

      {/* Account Tabs + Month Filter */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-full border border-border bg-muted p-1 text-xs">
          {(
            [
              { id: "Studio", label: "RothVan Design" },
              { id: "Personal", label: "Personal" },
              { id: "Combined", label: "Combined" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => switchTab(t.id)}
              className={cn(
                "rounded-full px-3.5 py-1.5 font-medium transition-all duration-200",
                tab === t.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
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

      {/* Overview-Style Dashboard Grid */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,8fr)]">
        <Glass className="flex flex-col">
          <p className="text-sm text-muted-foreground">
            {tab === "Personal"
              ? `Personal total spend, ${rangeMeta.desc}`
              : tab === "Combined"
                ? `Combined net retained, ${rangeMeta.desc}`
                : `Studio net cash profit, ${rangeMeta.desc}`}
          </p>
          <p
            className={cn(
              "mt-2 font-display text-4xl font-black",
              tab !== "Personal" && leftHeadline < 0 && "text-destructive",
            )}
          >
            <AnimatedNumber value={leftHeadline} />
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {tab === "Personal"
              ? "Personal monthly living & household ledger"
              : tab === "Combined"
                ? "Studio cash received minus Studio & Personal expenses"
                : "Studio cash received minus RothVan Design expenses"}
          </p>
          <div className="my-4 h-24 flex-1">
            <ResponsiveContainer>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="fin-sp" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0"
                      stopColor="var(--primary)"
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="1"
                      stopColor="var(--primary)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <Area
                  dataKey="sparkValue"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  fill="url(#fin-sp)"
                  type="monotone"
                  animationDuration={750}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {tab === "Studio" && (
            <div className="grid grid-cols-3 gap-3 border-t border-border pt-4">
              <Link to="/invoices">
                <Stat label="Open A/R" value={money(unpaidInvoicesUSD)} />
              </Link>
              <Stat label={`Cash in (${year})`} value={money(studioInYear)} />
              <Stat label={`Expenses (${year})`} value={money(studioOutYear)} />
            </div>
          )}
          {tab === "Personal" && (
            <div className="grid grid-cols-3 gap-3 border-t border-border pt-4">
              <Stat
                label="This month"
                value={money(personalOutMonth)}
                tone="neg"
              />
              <Stat label="Avg / month" value={money(personalAvgMonth)} />
              <Stat
                label="Saved goals"
                tone="pos"
                value={`${money(personalSavedTotal)} / ${money(personalTargetTotal)}`}
              />
            </div>
          )}
          {tab === "Combined" && (
            <div className="grid grid-cols-3 gap-3 border-t border-border pt-4">
              <Stat label="Studio in" value={money(studioInRange)} tone="pos" />
              <Stat label="Studio out" value={money(studioOutRange)} />
              <Stat
                label="Personal out"
                value={money(personalOutRange)}
                tone="neg"
              />
            </div>
          )}
        </Glass>

        <Glass delay={80}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-medium">
              {tab === "Personal"
                ? "Personal spending trend"
                : tab === "Combined"
                  ? "Combined cash flow"
                  : "Studio cash flow"}
            </h2>
            <div className="flex rounded-full border border-border bg-muted p-1 text-xs">
              {RANGE_OPTIONS.map((o) => (
                <button
                  key={o.id}
                  onClick={() => setRange(o.id)}
                  className={cn(
                    "rounded-full px-3 py-1 transition-colors",
                    range === o.id
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {tab === "Studio" && (
            <div className="mb-3 grid grid-cols-3 gap-3">
              <Stat label="● Cash in" value={money(studioInRange)} />
              <Stat label="○ Studio out" value={money(studioOutRange)} />
              <Stat
                label="Net"
                value={money(studioNetRange, "USD", true)}
                tone={studioNetRange >= 0 ? "pos" : "neg"}
              />
            </div>
          )}
          {tab === "Personal" && (
            <div className="mb-3 grid grid-cols-3 gap-3">
              <Stat label="● Personal out" value={money(personalOutRange)} />
              <Stat label="○ Monthly avg" value={money(personalAvgMonth)} />
              <Stat
                label={monthLabel}
                value={money(personalOutMonth)}
                tone={personalOutMonth > personalAvgMonth ? "neg" : undefined}
              />
            </div>
          )}
          {tab === "Combined" && (
            <div className="mb-3 grid grid-cols-3 gap-3">
              <Stat label="● Studio in" value={money(studioInRange)} />
              <Stat label="○ Total out" value={money(combinedOutRange)} />
              <Stat
                label="Retained"
                value={money(combinedNetRange, "USD", true)}
                tone={combinedNetRange >= 0 ? "pos" : "neg"}
              />
            </div>
          )}

          <div className="h-56">
            <ResponsiveContainer>
              <AreaChart
                data={chartData}
                margin={{ left: -18, right: 4, top: 8 }}
              >
                <defs>
                  <linearGradient id="fin-cf" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0"
                      stopColor="var(--primary)"
                      stopOpacity={0.35}
                    />
                    <stop
                      offset="1"
                      stopColor="var(--primary)"
                      stopOpacity={0}
                    />
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
                />
                <YAxis
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    color: "var(--foreground)",
                  }}
                  formatter={(v: number) => money(v)}
                />
                {tab === "Personal" ? (
                  <>
                    <Area
                      name="Personal spend"
                      dataKey="personalOut"
                      type="monotone"
                      stroke="var(--primary)"
                      strokeWidth={2}
                      fill="url(#fin-cf)"
                      animationDuration={750}
                      animationEasing="ease-out"
                    />
                    <Area
                      name="Studio expenses"
                      dataKey="out"
                      type="monotone"
                      stroke="var(--muted-foreground)"
                      strokeDasharray="5 5"
                      fill="transparent"
                      animationDuration={750}
                      animationEasing="ease-out"
                    />
                  </>
                ) : tab === "Combined" ? (
                  <>
                    <Area
                      name="Studio cash in"
                      dataKey="inn"
                      type="monotone"
                      stroke="var(--primary)"
                      strokeWidth={2}
                      fill="url(#fin-cf)"
                      animationDuration={750}
                      animationEasing="ease-out"
                    />
                    <Area
                      name="All expenses (Studio + Personal)"
                      dataKey="totalOut"
                      type="monotone"
                      stroke="var(--muted-foreground)"
                      strokeDasharray="5 5"
                      fill="transparent"
                      animationDuration={750}
                      animationEasing="ease-out"
                    />
                  </>
                ) : (
                  <>
                    <Area
                      name="Cash in"
                      dataKey="inn"
                      type="monotone"
                      stroke="var(--primary)"
                      strokeWidth={2}
                      fill="url(#fin-cf)"
                      animationDuration={750}
                      animationEasing="ease-out"
                    />
                    <Area
                      name="Studio expenses"
                      dataKey="out"
                      type="monotone"
                      stroke="var(--muted-foreground)"
                      strokeDasharray="5 5"
                      fill="transparent"
                      animationDuration={750}
                      animationEasing="ease-out"
                    />
                  </>
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Glass>
      </div>

      {/* Category Budget Jars Shelf + Spending Fast Card */}
      <div className="mt-4">
        {tab === "Personal" ? (
          personalCats.length === 0 ? (
            <Glass>
              <Empty>No personal expenses recorded in {monthLabel}.</Empty>
            </Glass>
          ) : (
            <BudgetShelf
              db={db}
              account="Personal"
              month={month}
              monthLabel={monthLabel}
              items={personalCats}
              selectedCategory={
                inspector?.account === "Personal" ? inspector.category : null
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
                monthLabel={monthLabel}
                items={personalCats}
                selectedCategory={
                  inspector?.account === "Personal" ? inspector.category : null
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
                  inspector?.account === "Studio" ? inspector.category : null
                }
                onSelectCategory={(category) =>
                  setInspector({ account: "Studio", category })
                }
              />
            )}
          </div>
        )}
      </div>

      {/* Circular Ring Goals Grid */}
      <Glass delay={180} className="mt-4">
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
                accountLabel={tab === "Combined" ? goalAccount(g) : undefined}
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

      {/* Studio Auto-Synced Income (from Invoice Payments) */}
      {tab !== "Personal" && (
        <Glass delay={240} className="mt-4">
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
                            {client?.name ?? "Client"} · {inv?.no ?? "Invoice"}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {shortDate(p.date)} · {p.method}
                            {p.reference ? ` · ${p.reference}` : ""}
                          </p>
                        </div>
                      </div>
                      <span className="shrink-0 font-mono text-sm text-positive">
                        +{money(toUSD(p.amount, p.currency, r))}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Glass>
      )}

      {/* Expenses Ledger with Category Pills, Search & Item Icons */}
      <Glass delay={280} className="mt-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="label-mono">
              {tab === "Personal"
                ? q
                  ? `Personal expenses · all dates matching "${query}"`
                  : `Personal expenses · ${monthLabel}`
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

        {/* Category Filter Strip */}
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
          {activeCategoriesForFilter.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCatFilter(catFilter === c ? "All" : c)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-[0.7rem] transition-colors",
                catFilter === c
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {c}
            </button>
          ))}
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
                      <p className="font-mono text-sm text-destructive">
                        {money(-e.amount, e.currency)}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
            {filteredExpenses.length > visibleExpenses.length && (
              <div className="mt-3 flex justify-center">
                <Btn
                  onClick={() => setVisibleCount((n) => n + 60)}
                  className="px-4 py-1.5 text-xs"
                >
                  Show more ({filteredExpenses.length - visibleExpenses.length}{" "}
                  remaining)
                </Btn>
              </div>
            )}
          </>
        )}
      </Glass>

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

      <EditModal
        item={edit}
        fields={expenseFields}
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

      <EditModal
        item={goal}
        fields={goalFields}
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
