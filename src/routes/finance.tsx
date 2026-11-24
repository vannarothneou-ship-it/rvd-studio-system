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
import { WorkspaceBalanceCard } from "@/components/rv/WorkspaceBalanceCard";
import { CentralAiBrief } from "@/components/rv/CentralAiBrief";
import {
  MonthlyLedgerToolbar,
  MonthlyGroupHeader,
} from "@/components/rv/MonthlyLedgerControls";
import {
  QuickExpenseDrawer,
  QuickIncomeDrawer,
  QuickStudioIncomeDrawer,
} from "@/components/rv/QuickTxDrawer";
import {
  EXPENSE_CATEGORIES,
  PERSONAL_CATEGORIES,
  cashFlowSeries,
  cashReceived,
  categoryTotals,
  collectLedgerMonths,
  combinedCashFlowSeries,
  compactMoney,
  expenseAccount,
  expenseTotal,
  formatMonthShort,
  goalAccount,
  groupLedgerRowsByMonth,
  invoiceView,
  isInvoice,
  money,
  periodBreakdownBars,
  recordToUSD,
  safeKhrRate,
  setDB,
  shortDate,
  stampFxSnapshot,
  studioFinancialSummary,
  today,
  uid,
  useDB,
  workspaceBalances,
  type Account,
  type CashRange,
  type Expense,
  type Goal,
  type PersonalIncome,
  type StudioIncome,
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
  const r = safeKhrRate(db.settings.khrRate);
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
  const [studioSummaryScope, setStudioSummaryScope] = useState<"month" | "all">(
    "month",
  );
  const [chartMode, setChartMode] = useState<ChartMode>("area");
  const [chartLens, setChartLens] = useState<ChartLens>("flow");
  const [month, setMonth] = useState(() => today().slice(0, 7));
  const [catFilter, setCatFilter] = useState<string>("All");
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(8);
  const [studioExpenseMonth, setStudioExpenseMonth] = useState<string>("all");
  const [studioExpenseGroupByMonth, setStudioExpenseGroupByMonth] =
    useState(true);
  const [studioIncomeMonth, setStudioIncomeMonth] = useState<string>("all");
  const [studioIncomeGroupByMonth, setStudioIncomeGroupByMonth] =
    useState(true);
  const [combinedFilter, setCombinedFilter] = useState<CombinedFilter>("all");
  const [combinedQuery, setCombinedQuery] = useState("");
  const [combinedVisible, setCombinedVisible] = useState(8);
  const [combinedMonth, setCombinedMonth] = useState<string>("all");
  const [combinedGroupByMonth, setCombinedGroupByMonth] = useState(true);
  const [showAllPayments, setShowAllPayments] = useState(false);
  const [editingLayout, setEditingLayout] = useState(false);
  const [inspectedCategory, setInspectedCategory] = useState<{
    account: Account;
    category: string;
  } | null>(null);
  const [edit, setEdit] = useState<Expense | null>(null);
  const [personalEdit, setPersonalEdit] = useState<Expense | null>(null);
  const [personalIncomeEdit, setPersonalIncomeEdit] =
    useState<PersonalIncome | null>(null);
  const [studioIncomeEdit, setStudioIncomeEdit] = useState<StudioIncome | null>(
    null,
  );
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

  const openNewStudioIncome = useCallback(() => {
    setStudioIncomeEdit({
      id: uid(),
      date: today().startsWith(month) ? today() : `${month}-01`,
      source: "Retainer",
      accountMethod: "Bank Transfer",
      method: "Bank Transfer",
      description: "",
      amount: 0,
      currency: "USD",
      reference: "",
    });
  }, [month]);

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
  const studioExpenseMonths = useMemo(
    () =>
      collectLedgerMonths(
        db.expenses
          .filter((e) => expenseAccount(e) === "Studio")
          .map((e) => e.date),
        month,
      ),
    [db.expenses, month],
  );
  const filteredExpenses = useMemo(
    () =>
      db.expenses
        .filter((e) => {
          if (expenseAccount(e) !== "Studio") return false;
          if (
            studioExpenseMonth !== "all" &&
            !e.date.startsWith(studioExpenseMonth)
          ) {
            return false;
          }
          if (catFilter !== "All" && e.category !== catFilter) return false;
          if (q) {
            const hay =
              `${e.description} ${e.vendor} ${e.category}`.toLowerCase();
            if (!hay.includes(q)) return false;
          }
          return true;
        })
        .sort((a, b) => b.date.localeCompare(a.date)),
    [db.expenses, studioExpenseMonth, catFilter, q],
  );
  const studioExpensesTotalUSD = useMemo(
    () => filteredExpenses.reduce((acc, e) => acc + recordToUSD(e, r), 0),
    [filteredExpenses, r],
  );
  const effectiveExpenseLimit =
    studioExpenseMonth !== "all" && filteredExpenses.length <= 60
      ? filteredExpenses.length
      : visibleCount;
  const visibleExpenses = filteredExpenses.slice(0, effectiveExpenseLimit);
  const groupedVisibleExpenses = useMemo(
    () =>
      groupLedgerRowsByMonth(
        visibleExpenses,
        () => 0,
        (e) => recordToUSD(e, r),
      ),
    [visibleExpenses, r],
  );

  const studioSummary = useMemo(
    () =>
      studioFinancialSummary(db, studioSummaryScope === "month" ? month : ""),
    [db, studioSummaryScope, month],
  );

  const studioIncomeMonths = useMemo(
    () =>
      collectLedgerMonths(
        [
          ...db.payments.map((p) => p.date),
          ...(db.studioIncome ?? []).map((si) => si.date),
        ],
        month,
      ),
    [db.payments, db.studioIncome, month],
  );
  type StudioIncomeEntry =
    | {
        kind: "payment";
        id: string;
        date: string;
        usd: number;
        payment: (typeof db.payments)[number];
      }
    | {
        kind: "studioIncome";
        id: string;
        date: string;
        usd: number;
        studioIncome: StudioIncome;
      };
  const filteredStudioIncomeEntries = useMemo<StudioIncomeEntry[]>(
    () =>
      [
        ...db.payments.map((p) => ({
          kind: "payment" as const,
          id: `pay-${p.id}`,
          date: p.date,
          usd: recordToUSD(p, r),
          payment: p,
        })),
        ...(db.studioIncome ?? []).map((si) => ({
          kind: "studioIncome" as const,
          id: `sinc-${si.id}`,
          date: si.date,
          usd: recordToUSD(si, r),
          studioIncome: si,
        })),
      ]
        .filter(
          (row) =>
            studioIncomeMonth === "all" ||
            row.date.startsWith(studioIncomeMonth),
        )
        .sort((a, b) => b.date.localeCompare(a.date)),
    [db.payments, db.studioIncome, studioIncomeMonth, r],
  );
  const studioIncomeTotalUSD = useMemo(
    () => filteredStudioIncomeEntries.reduce((acc, row) => acc + row.usd, 0),
    [filteredStudioIncomeEntries],
  );
  const recentPayments = useMemo(
    () =>
      filteredStudioIncomeEntries.slice(
        0,
        showAllPayments ||
          (studioIncomeMonth !== "all" &&
            filteredStudioIncomeEntries.length <= 60)
          ? filteredStudioIncomeEntries.length
          : 8,
      ),
    [filteredStudioIncomeEntries, showAllPayments, studioIncomeMonth],
  );
  const groupedRecentPayments = useMemo(
    () =>
      groupLedgerRowsByMonth(
        recentPayments,
        (row) => row.usd,
        () => 0,
      ),
    [recentPayments],
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

  const allCombinedEntries = useMemo(() => {
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
            usd: recordToUSD(p, r),
          };
        }),
      ...(db.studioIncome ?? []).map((si) => ({
        id: `sinc-${si.id}`,
        date: si.date,
        workspace: "Studio" as const,
        direction: "income" as const,
        title: si.description || si.source,
        sub: `${si.source}${si.method ? ` · ${si.method}` : ""}`,
        usd: recordToUSD(si, r),
      })),
      ...(db.personalIncome ?? []).map((inc) => ({
        id: `pinc-${inc.id}`,
        date: inc.date,
        workspace: "Personal" as const,
        direction: "income" as const,
        title: inc.description || inc.source,
        sub: `${inc.source}${inc.accountMethod ? ` · ${inc.accountMethod}` : ""}`,
        usd: recordToUSD(inc, r),
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
          usd: recordToUSD(e, r),
        };
      }),
    ];

    return entries.sort((a, b) => b.date.localeCompare(a.date));
  }, [
    db.payments,
    db.studioIncome,
    db.invoices,
    db.clients,
    db.personalIncome,
    db.expenses,
    r,
  ]);

  const combinedMonths = useMemo(
    () =>
      collectLedgerMonths(
        allCombinedEntries.map((e) => e.date),
        month,
      ),
    [allCombinedEntries, month],
  );

  const combinedLedgerRows = useMemo(() => {
    const cq = combinedQuery.trim().toLowerCase();
    return allCombinedEntries.filter((row) => {
      if (combinedMonth !== "all" && !row.date.startsWith(combinedMonth))
        return false;
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
    });
  }, [allCombinedEntries, combinedMonth, combinedFilter, combinedQuery]);

  const combinedLedgerTotals = useMemo(() => {
    let incomeUSD = 0;
    let expenseUSD = 0;
    for (const row of combinedLedgerRows) {
      if (row.direction === "income") incomeUSD += row.usd;
      else expenseUSD += row.usd;
    }
    return {
      incomeUSD,
      expenseUSD,
      netUSD: incomeUSD - expenseUSD,
    };
  }, [combinedLedgerRows]);

  const effectiveCombinedLimit =
    combinedMonth !== "all" && combinedLedgerRows.length <= 60
      ? combinedLedgerRows.length
      : combinedVisible;
  const combinedVisibleRows = combinedLedgerRows.slice(
    0,
    effectiveCombinedLimit,
  );
  const groupedCombinedRows = useMemo(
    () =>
      groupLedgerRowsByMonth(
        combinedVisibleRows,
        (row) => (row.direction === "income" ? row.usd : 0),
        (row) => (row.direction === "expense" ? row.usd : 0),
      ),
    [combinedVisibleRows],
  );

  /** Swipe-delete for expenses, personal income & unmatched studio income (invoice payments stay protected). */
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
    } else if (rowId.startsWith("sinc-")) {
      const item = (db.studioIncome ?? []).find(
        (x) => `sinc-${x.id}` === rowId,
      );
      if (!item) return;
      setDB((d) => ({
        ...d,
        studioIncome: (d.studioIncome ?? []).filter((x) => x.id !== item.id),
      }));
      toast("Studio income deleted", {
        action: {
          label: "Undo",
          onClick: () =>
            setDB((d) => ({
              ...d,
              studioIncome: [item, ...(d.studioIncome ?? [])],
            })),
        },
      });
    }
  };

  const deleteStudioIncome = useCallback((item: StudioIncome) => {
    setDB((d) => ({
      ...d,
      studioIncome: (d.studioIncome ?? []).filter((x) => x.id !== item.id),
    }));
    toast("Studio income deleted", {
      action: {
        label: "Undo",
        onClick: () =>
          setDB((d) => ({
            ...d,
            studioIncome: [item, ...(d.studioIncome ?? [])],
          })),
      },
    });
  }, []);

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
              <div className="mb-2 flex items-center gap-2">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-border bg-secondary text-primary">
                  <Briefcase className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <h2 className="truncate font-display text-base font-bold leading-tight">
                    Studio Net Cash Profit
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {studioRangeMeta.desc}
                  </p>
                </div>
              </div>
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
            <div className="grid grid-cols-3 gap-3 border-t border-border/70 pt-3.5">
              <Link to="/invoices" className="ios-tap">
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
            <Glass delay={80} className="flex h-full flex-col justify-between">
              <div>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="truncate font-display text-base font-bold leading-tight">
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
                  <div className="flex shrink-0 items-center gap-1.5">
                    <SlidingTabs
                      iconOnly
                      size="xs"
                      tone="invert"
                      layoutGroup="fin-chart-lens"
                      value={studioLens}
                      onChange={setChartLens}
                      options={CHART_LENS_OPTIONS.slice(0, 3)}
                    />
                    <ChartModeCycleButton
                      mode={chartMode}
                      onChange={setChartMode}
                    />
                  </div>
                </div>

                <div className="mb-3 flex items-center justify-end">
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

                <div className="mb-3 grid grid-cols-3 gap-3 border-y border-border/70 py-3">
                  <Stat
                    icon={ArrowDownLeft}
                    label="Cash in"
                    value={compactMoney(studioInRange)}
                    fullValue={money(studioInRange)}
                    tone="pos"
                  />
                  <Stat
                    icon={ArrowUpRight}
                    label="Studio out"
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
            onSelectCategory={(acc, category) =>
              setInspectedCategory({ account: acc, category })
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
        id: "financialSeparation",
        title: "Cash vs Accrual & Cost Separation",
        defaultSpan: 12,
        render: () => (
          <Glass delay={120}>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="label-mono">
                  Financial Separation ·{" "}
                  {studioSummaryScope === "month" ? monthLabel : "All time"}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Cash flow separated from invoiced revenue, direct project
                  costs, and studio overhead.
                </p>
              </div>
              <SlidingTabs
                size="xs"
                tone="invert"
                layoutGroup="fin-summary-scope"
                value={studioSummaryScope}
                onChange={setStudioSummaryScope}
                options={[
                  { id: "month", label: formatMonthShort(month) },
                  { id: "all", label: "All time" },
                ]}
              />
            </div>

            <div className="grid gap-4 border-t border-border/70 pt-3.5 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <Stat
                  label="Cash Received"
                  value={compactMoney(studioSummary.cashReceivedUSD)}
                  fullValue={money(studioSummary.cashReceivedUSD)}
                  tone="pos"
                />
                <p className="mt-1 text-[0.7rem] text-muted-foreground">
                  Invoices {money(studioSummary.invoicePaymentsUSD)} · Other{" "}
                  {money(studioSummary.unmatchedStudioIncomeUSD)}
                </p>
              </div>

              <div>
                <Stat
                  label="Revenue Invoiced"
                  value={compactMoney(studioSummary.revenueInvoicedUSD)}
                  fullValue={money(studioSummary.revenueInvoicedUSD)}
                />
                <p className="mt-1 text-[0.7rem] text-muted-foreground">
                  Open A/R {money(studioSummary.outstandingReceivablesUSD)}
                  {studioSummary.overdueReceivablesUSD > 0
                    ? ` (${money(studioSummary.overdueReceivablesUSD)} overdue)`
                    : ""}
                </p>
              </div>

              <div>
                <Stat
                  label="Direct vs Operating Costs"
                  value={compactMoney(studioSummary.totalExpensesUSD)}
                  fullValue={money(studioSummary.totalExpensesUSD)}
                  tone="neg"
                />
                <p className="mt-1 text-[0.7rem] text-muted-foreground">
                  Project costs {money(studioSummary.directProjectCostsUSD)} ·
                  Operating {money(studioSummary.operatingExpensesUSD)}
                </p>
              </div>

              <div>
                <Stat
                  label="Estimated Project Profit"
                  value={compactMoney(
                    studioSummary.estimatedProjectProfitUSD,
                    "USD",
                    true,
                  )}
                  fullValue={money(
                    studioSummary.estimatedProjectProfitUSD,
                    "USD",
                    true,
                  )}
                  tone={
                    studioSummary.estimatedProjectProfitUSD >= 0 ? "pos" : "neg"
                  }
                />
                <p className="mt-1 text-[0.7rem] text-muted-foreground">
                  Net cash flow:{" "}
                  <span
                    className={cn(
                      "font-num font-semibold",
                      studioSummary.netCashFlowUSD >= 0
                        ? "text-positive"
                        : "text-destructive",
                    )}
                  >
                    {money(studioSummary.netCashFlowUSD, "USD", true)}
                  </span>
                </p>
              </div>
            </div>

            {studioSummary.planningReservePct > 0 && (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/70 bg-muted/25 px-3 py-2 text-xs">
                <span className="text-muted-foreground">
                  Planning reserve estimate ({studioSummary.planningReservePct}%
                  of positive net cash flow — internal cash-flow buffer only,
                  not an official tax liability)
                </span>
                <span className="font-num font-semibold text-foreground">
                  {money(studioSummary.planningReserveUSD)}
                </span>
              </div>
            )}
          </Glass>
        ),
      },
      {
        id: "studioIncome",
        title: "Studio income & invoice payments",
        defaultSpan: 12,
        render: () => {
          const renderPayment = (row: (typeof recentPayments)[number]) => {
            if (row.kind === "studioIncome") {
              const si = row.studioIncome;
              return (
                <li key={row.id}>
                  <SwipeRow
                    onEdit={() => setStudioIncomeEdit(si)}
                    onDelete={() => deleteStudioIncome(si)}
                  >
                    <button
                      type="button"
                      onClick={() => setStudioIncomeEdit(si)}
                      className="flex w-full items-center justify-between gap-3 rounded-xl px-2 py-2.5 text-left hover:bg-muted"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-border bg-muted text-positive">
                          <ArrowDownLeft className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {si.description || si.source}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {shortDate(si.date)} · {si.source} ·{" "}
                            {si.method || si.accountMethod}
                            {si.reference ? ` · ${si.reference}` : ""}
                          </p>
                        </div>
                      </div>
                      <span className="font-num shrink-0 text-sm font-semibold text-positive">
                        +{money(row.usd)}
                      </span>
                    </button>
                  </SwipeRow>
                </li>
              );
            }
            const p = row.payment;
            const inv = db.invoices.find((i) => i.id === p.invoiceId);
            const client = db.clients.find((c) => c.id === inv?.clientId);
            return (
              <li key={row.id}>
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
                  <span className="font-num shrink-0 text-sm font-semibold text-positive">
                    +{money(row.usd)}
                  </span>
                </Link>
              </li>
            );
          };

          return (
            <Glass delay={240}>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="label-mono">
                    Studio Income ·{" "}
                    {studioIncomeMonth === "all"
                      ? "All months"
                      : formatMonthShort(studioIncomeMonth)}
                  </p>
                  <p className="font-num mt-0.5 text-xs text-muted-foreground">
                    {filteredStudioIncomeEntries.length}{" "}
                    {filteredStudioIncomeEntries.length === 1
                      ? "entry"
                      : "entries"}
                    {studioIncomeTotalUSD > 0 && (
                      <>
                        {" "}
                        ·{" "}
                        <span className="font-semibold text-positive">
                          +{money(studioIncomeTotalUSD)}
                        </span>
                      </>
                    )}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Btn
                    type="button"
                    onClick={openNewStudioIncome}
                    className="px-3 py-1 text-xs whitespace-nowrap shrink-0"
                  >
                    <Plus className="h-3 w-3 text-positive" />
                    Add studio income
                  </Btn>
                  {filteredStudioIncomeEntries.length > 8 &&
                    studioIncomeMonth === "all" && (
                      <button
                        type="button"
                        onClick={() => setShowAllPayments((value) => !value)}
                        aria-label={
                          showAllPayments
                            ? "Show recent 8 payments"
                            : "Show all payments"
                        }
                        title={showAllPayments ? "Show recent 8" : "Show all"}
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border bg-secondary text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      >
                        {showAllPayments ? (
                          <EyeOff className="h-3.5 w-3.5" />
                        ) : (
                          <Eye className="h-3.5 w-3.5" />
                        )}
                      </button>
                    )}
                  <Link
                    to="/invoices"
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Invoices →
                  </Link>
                </div>
              </div>

              <MonthlyLedgerToolbar
                months={studioIncomeMonths}
                selectedMonth={studioIncomeMonth}
                onSelectMonth={(next) => {
                  setStudioIncomeMonth(next);
                  setShowAllPayments(false);
                }}
                groupByMonth={studioIncomeGroupByMonth}
                onToggleGroupByMonth={() =>
                  setStudioIncomeGroupByMonth((g) => !g)
                }
                className="mb-3"
              />

              {recentPayments.length === 0 ? (
                <Empty>
                  {studioIncomeMonth === "all"
                    ? "No studio income or invoice payments recorded yet."
                    : `No studio income recorded in ${formatMonthShort(studioIncomeMonth)}.`}
                </Empty>
              ) : studioIncomeGroupByMonth ? (
                <div className="space-y-3">
                  {groupedRecentPayments.map((grp) => (
                    <div key={grp.month} className="space-y-1.5">
                      <MonthlyGroupHeader
                        month={grp.month}
                        label={grp.label}
                        count={grp.rows.length}
                        incomeUSD={grp.incomeUSD}
                        expenseUSD={0}
                        netUSD={grp.incomeUSD}
                        showIncome
                        showExpense={false}
                        activeFilterMonth={studioIncomeMonth}
                        onSelectMonth={(next) => {
                          setStudioIncomeMonth(next);
                          setShowAllPayments(false);
                        }}
                      />
                      <ul className="divide-y divide-border/75">
                        {grp.rows.map(renderPayment)}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {recentPayments.map(renderPayment)}
                </ul>
              )}
            </Glass>
          );
        },
      },
      {
        id: "expensesLedger",
        title: "Studio expenses ledger",
        defaultSpan: 12,
        render: () => {
          const renderExpenseRow = (e: Expense) => {
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
                          {e.description || e.vendor || "Studio expense"}
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
          };

          return (
            <Glass delay={280}>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="label-mono">
                    RothVan Design expenses ·{" "}
                    {studioExpenseMonth === "all"
                      ? "All months"
                      : formatMonthShort(studioExpenseMonth)}
                    {catFilter !== "All" ? ` · ${catFilter}` : ""}
                  </p>
                  <p className="font-num mt-0.5 text-xs text-muted-foreground">
                    {filteredExpenses.length}{" "}
                    {filteredExpenses.length === 1 ? "entry" : "entries"}
                    {studioExpensesTotalUSD > 0 && (
                      <>
                        {" "}
                        ·{" "}
                        <span className="font-semibold text-destructive">
                          {money(-studioExpensesTotalUSD)}
                        </span>
                      </>
                    )}
                  </p>
                </div>
                <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
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

              <MonthlyLedgerToolbar
                months={studioExpenseMonths}
                selectedMonth={studioExpenseMonth}
                onSelectMonth={(next) => {
                  setStudioExpenseMonth(next);
                  setVisibleCount(8);
                }}
                groupByMonth={studioExpenseGroupByMonth}
                onToggleGroupByMonth={() =>
                  setStudioExpenseGroupByMonth((g) => !g)
                }
                className="mb-3"
              />

              <div className="no-scrollbar mb-3 flex flex-nowrap gap-1.5 overflow-x-auto pb-1 sm:flex-wrap sm:pb-0">
                <button
                  type="button"
                  onClick={() => {
                    setCatFilter("All");
                    setVisibleCount(8);
                  }}
                  className={cn(
                    "min-h-[34px] rounded-lg border px-2.5 py-1 text-xs font-medium whitespace-nowrap shrink-0 transition-colors",
                    catFilter === "All"
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-secondary text-muted-foreground hover:text-foreground",
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
                      onClick={() => {
                        setCatFilter(catFilter === c ? "All" : c);
                        setVisibleCount(8);
                      }}
                      className={cn(
                        "inline-flex min-h-[34px] items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium whitespace-nowrap shrink-0 transition-colors",
                        catFilter === c
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-secondary text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <CatIcon className="h-3.5 w-3.5 shrink-0" />
                      <span>{c}</span>
                    </button>
                  );
                })}
              </div>

              {visibleExpenses.length === 0 ? (
                <Empty>No studio expenses match this filter.</Empty>
              ) : (
                <>
                  {studioExpenseGroupByMonth ? (
                    <div className="space-y-3">
                      {groupedVisibleExpenses.map((grp) => (
                        <div key={grp.month} className="space-y-1.5">
                          <MonthlyGroupHeader
                            month={grp.month}
                            label={grp.label}
                            count={grp.rows.length}
                            incomeUSD={0}
                            expenseUSD={grp.expenseUSD}
                            netUSD={-grp.expenseUSD}
                            showIncome={false}
                            showExpense
                            activeFilterMonth={studioExpenseMonth}
                            onSelectMonth={(next) => {
                              setStudioExpenseMonth(next);
                              setVisibleCount(8);
                            }}
                          />
                          <ul className="divide-y divide-border/75">
                            {grp.rows.map(renderExpenseRow)}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <ul className="divide-y divide-border">
                      {visibleExpenses.map(renderExpenseRow)}
                    </ul>
                  )}
                  {filteredExpenses.length > effectiveExpenseLimit && (
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
                  {visibleCount > 8 &&
                    filteredExpenses.length > 8 &&
                    visibleExpenses.length >= filteredExpenses.length && (
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
          );
        },
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
                selectedCategory={
                  inspectedCategory?.account === "Studio"
                    ? inspectedCategory.category
                    : null
                }
                onSelectCategory={(category) =>
                  setInspectedCategory({ account: "Studio", category })
                }
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
      monthLabel,
      studioSummary,
      studioSummaryScope,
      inspectedCategory,
      studioGoals,
      studioIncomeMonths,
      studioIncomeMonth,
      studioIncomeGroupByMonth,
      studioIncomeTotalUSD,
      filteredStudioIncomeEntries,
      recentPayments,
      groupedRecentPayments,
      showAllPayments,
      catFilter,
      studioExpenseMonths,
      studioExpenseMonth,
      studioExpenseGroupByMonth,
      studioExpensesTotalUSD,
      filteredExpenses,
      query,
      effectiveExpenseLimit,
      visibleExpenses,
      groupedVisibleExpenses,
      visibleCount,
      goalNow,
      openNewExpense,
      openNewStudioIncome,
      deleteStudioIncome,
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
            setStudioIncomeMonth(next);
            setStudioExpenseMonth(next);
            setCombinedMonth(next);
            setVisibleCount(8);
            setCombinedVisible(8);
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
            onToggleEditing={() => setEditingLayout((e) => !e)}
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

                <div className="mt-4 space-y-4 border-t border-border/70 pt-3.5">
                  <div>
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

                  <div className="border-t border-border/70 pt-3.5">
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
            onSelectCategory={(acc, category) =>
              setInspectedCategory({ account: acc, category })
            }
          />

          {/* Unified Combined Ledger */}
          <Glass>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="label-mono">
                  Combined Studio &amp; Personal Ledger ·{" "}
                  {combinedMonth === "all"
                    ? "All months"
                    : formatMonthShort(combinedMonth)}
                </p>
                <p className="font-num mt-0.5 text-xs text-muted-foreground">
                  {combinedLedgerRows.length}{" "}
                  {combinedLedgerRows.length === 1 ? "entry" : "entries"}
                  {combinedLedgerTotals.incomeUSD > 0 && (
                    <>
                      {" "}
                      ·{" "}
                      <span className="font-semibold text-positive">
                        +{money(combinedLedgerTotals.incomeUSD)}
                      </span>
                    </>
                  )}
                  {combinedLedgerTotals.expenseUSD > 0 && (
                    <>
                      {" "}
                      ·{" "}
                      <span className="font-semibold text-destructive">
                        {money(-combinedLedgerTotals.expenseUSD)}
                      </span>
                    </>
                  )}
                  {combinedLedgerTotals.incomeUSD > 0 &&
                    combinedLedgerTotals.expenseUSD > 0 && (
                      <>
                        {" "}
                        · Net{" "}
                        <span
                          className={cn(
                            "font-semibold",
                            combinedLedgerTotals.netUSD >= 0
                              ? "text-positive"
                              : "text-destructive",
                          )}
                        >
                          {money(combinedLedgerTotals.netUSD, "USD", true)}
                        </span>
                      </>
                    )}
                </p>
              </div>
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
                <SlidingTabs
                  stretch
                  size="xs"
                  layoutGroup="fin-combined-filter"
                  className="w-full sm:w-auto"
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
                    className="field w-full py-1.5 pl-8 text-base sm:w-56 sm:text-xs"
                  />
                </div>
              </div>
            </div>

            <MonthlyLedgerToolbar
              months={combinedMonths}
              selectedMonth={combinedMonth}
              onSelectMonth={(next) => {
                setCombinedMonth(next);
                setCombinedVisible(8);
              }}
              groupByMonth={combinedGroupByMonth}
              onToggleGroupByMonth={() => setCombinedGroupByMonth((g) => !g)}
              className="mb-3"
            />

            {combinedVisibleRows.length === 0 ? (
              <Empty>
                No ledger entries match this filter
                {combinedMonth !== "all"
                  ? ` in ${formatMonthShort(combinedMonth)}`
                  : ""}
                .
              </Empty>
            ) : (
              <>
                {(() => {
                  const renderCombinedRow = (
                    row: (typeof combinedVisibleRows)[number],
                  ) => {
                    const expMatch = row.id.startsWith("exp-")
                      ? db.expenses.find((x) => `exp-${x.id}` === row.id)
                      : undefined;
                    const pincMatch = row.id.startsWith("pinc-")
                      ? (db.personalIncome ?? []).find(
                          (x) => `pinc-${x.id}` === row.id,
                        )
                      : undefined;
                    const sincMatch = row.id.startsWith("sinc-")
                      ? (db.studioIncome ?? []).find(
                          (x) => `sinc-${x.id}` === row.id,
                        )
                      : undefined;
                    return (
                      <li key={row.id}>
                        <SwipeRow
                          onEdit={
                            expMatch
                              ? () =>
                                  expenseAccount(expMatch) === "Personal"
                                    ? setPersonalEdit(expMatch)
                                    : setEdit(expMatch)
                              : pincMatch
                                ? () => setPersonalIncomeEdit(pincMatch)
                                : sincMatch
                                  ? () => setStudioIncomeEdit(sincMatch)
                                  : undefined
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
                                <p className="truncate text-sm font-medium text-foreground">
                                  {row.title}
                                </p>
                                <p className="truncate text-xs text-muted-foreground">
                                  <span
                                    className={cn(
                                      "font-medium",
                                      row.workspace === "Studio"
                                        ? "text-primary"
                                        : "text-foreground/80",
                                    )}
                                  >
                                    {row.workspace}
                                  </span>{" "}
                                  · {shortDate(row.date)} · {row.sub}
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
                  };

                  return combinedGroupByMonth ? (
                    <div className="space-y-3">
                      {groupedCombinedRows.map((grp) => (
                        <div key={grp.month} className="space-y-1.5">
                          <MonthlyGroupHeader
                            month={grp.month}
                            label={grp.label}
                            count={grp.rows.length}
                            incomeUSD={grp.incomeUSD}
                            expenseUSD={grp.expenseUSD}
                            netUSD={grp.netUSD}
                            showIncome={combinedFilter !== "expense"}
                            showExpense={combinedFilter !== "income"}
                            activeFilterMonth={combinedMonth}
                            onSelectMonth={(next) => {
                              setCombinedMonth(next);
                              setCombinedVisible(8);
                            }}
                          />
                          <ul className="divide-y divide-border/75">
                            {grp.rows.map(renderCombinedRow)}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <ul className="divide-y divide-border">
                      {combinedVisibleRows.map(renderCombinedRow)}
                    </ul>
                  );
                })()}

                {combinedLedgerRows.length > effectiveCombinedLimit && (
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
                {combinedVisible > 8 &&
                  combinedLedgerRows.length > 8 &&
                  combinedVisibleRows.length >= combinedLedgerRows.length && (
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
        account={inspectedCategory?.account ?? "Studio"}
        category={inspectedCategory?.category ?? null}
        month={month}
        onClose={() => setInspectedCategory(null)}
        onAddExpense={(acc, cat) => {
          setInspectedCategory(null);
          if (acc === "Personal") {
            setPersonalEdit({
              id: uid(),
              date: today().startsWith(month) ? today() : `${month}-01`,
              projectId: "",
              category: PERSONAL_CATEGORIES.includes(cat)
                ? cat
                : (PERSONAL_CATEGORIES[0] ?? "Food"),
              vendor: "Debit",
              description: "",
              amount: 0,
              currency: "USD",
              receipt: "",
              account: "Personal",
            });
          } else {
            openNewExpense(cat);
          }
        }}
        onEditExpense={(exp) => {
          setInspectedCategory(null);
          if (expenseAccount(exp) === "Personal") setPersonalEdit(exp);
          else setEdit(exp);
        }}
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
            expenses: upsert(
              d.expenses,
              stampFxSnapshot(
                { ...v, account: "Studio" },
                safeKhrRate(d.settings.khrRate),
                edit?.currency === v.currency && edit?.amount === v.amount,
              ),
            ),
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

      {/* Fast-Tap Personal Expense Drawer (from Combined Ledger or Category Inspector) */}
      <QuickExpenseDrawer
        item={personalEdit}
        onClose={() => setPersonalEdit(null)}
        onSave={(v) => {
          const acc = expenseAccount(v);
          setDB((d) => ({
            ...d,
            expenses: upsert(d.expenses, { ...v, account: acc }),
          }));
          toast.success(`${acc} expense saved.`);
        }}
        onDelete={
          personalEdit && db.expenses.some((x) => x.id === personalEdit.id)
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

      {/* Fast-Tap Personal Income Drawer (from Combined Ledger) */}
      <QuickIncomeDrawer
        item={personalIncomeEdit}
        onClose={() => setPersonalIncomeEdit(null)}
        onSave={(v) => {
          setDB((d) => ({
            ...d,
            personalIncome: upsert(d.personalIncome ?? [], v),
          }));
          toast.success("Personal income saved.");
        }}
        onDelete={
          personalIncomeEdit &&
          (db.personalIncome ?? []).some((x) => x.id === personalIncomeEdit.id)
            ? (v) => {
                setDB((d) => ({
                  ...d,
                  personalIncome: (d.personalIncome ?? []).filter(
                    (x) => x.id !== v.id,
                  ),
                }));
                toast.message("Personal income deleted.");
              }
            : undefined
        }
      />

      {/* Unmatched Studio Income Drawer */}
      <QuickStudioIncomeDrawer
        item={studioIncomeEdit}
        onClose={() => setStudioIncomeEdit(null)}
        onSave={(v) => {
          setDB((d) => ({
            ...d,
            studioIncome: upsert(d.studioIncome ?? [], v),
          }));
          toast.success("Studio income saved.");
        }}
        onDelete={
          studioIncomeEdit &&
          (db.studioIncome ?? []).some((x) => x.id === studioIncomeEdit.id)
            ? (v) => {
                setDB((d) => ({
                  ...d,
                  studioIncome: (d.studioIncome ?? []).filter(
                    (x) => x.id !== v.id,
                  ),
                }));
                toast.message("Studio income deleted.");
              }
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
