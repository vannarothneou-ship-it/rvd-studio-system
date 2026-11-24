import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Activity,
  ArrowDownLeft,
  ArrowUpRight,
  Briefcase,
  FileText,
  FolderKanban,
  Plus,
  ScanLine,
  Trash2,
  Users,
} from "lucide-react";
import {
  Btn,
  Glass,
  PageHeader,
  Pill,
  SlideDrawer,
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
  ChartModeCycleButton,
  PeriodBarPulseCard,
  SparklineWithDates,
  TrendChartCanvas,
  type ChartMode,
} from "@/components/rv/Charts";
import {
  EditLayoutButton,
  EditableBentoGrid,
  useDashboardTabs,
  type BentoWidgetDef,
} from "@/components/rv/BentoGrid";
import { WorkspaceBalanceCard } from "@/components/rv/WorkspaceBalanceCard";
import { useReceiptScanner } from "@/components/rv/ReceiptScannerContext";
import { QuickStudioIncomeDrawer } from "@/components/rv/QuickTxDrawer";
import {
  EXPENSE_CATEGORIES,
  PROJECT_STATUSES,
  cashFlowSeries,
  cashReceived,
  categoryTotals,
  compactMoney,
  deletePayment,
  documentKind,
  expenseAccount,
  expenseTotal,
  goalAccount,
  invoiceView,
  isInvoice,
  money,
  needsFollowUp,
  recordPayment,
  recordToUSD,
  safeKhrRate,
  setDB,
  shortDate,
  stampFxSnapshot,
  studioFinancialSummary,
  today,
  uid,
  useDB,
  type CashRange,
  type DB,
  type Expense,
  type Goal,
  type StudioIncome,
} from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/studio")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { title: "Studio · RothVan Ledger" },
      {
        name: "description",
        content:
          "Client pipeline, quotations, invoices, and studio cash flow for RothVan Design.",
      },
      { property: "og:title", content: "Studio · RothVan Ledger" },
      {
        property: "og:description",
        content:
          "Client pipeline, quotations, invoices, and studio cash flow for RothVan Design.",
      },
    ],
  }),
  component: StudioDashboard,
});

const RANGE_OPTIONS: { id: CashRange; label: string; desc: string }[] = [
  { id: "today", label: "Today", desc: "today" },
  { id: "week", label: "1W", desc: "last 7 days" },
  { id: "6m", label: "6M", desc: "last 6 months" },
  { id: "12m", label: "12M", desc: "last 12 months" },
  { id: "all", label: "All", desc: "all time" },
];

const SYSTEM_WIDGET_CATALOG: { id: string; label: string; desc: string }[] = [
  {
    id: "followUps",
    label: "Client follow-ups",
    desc: "Quotations awaiting reply and unsigned agreements",
  },
  {
    id: "netProfit",
    label: "Studio net cash profit",
    desc: "Headline profit sparkline, outstanding A/R & active projects",
  },
  {
    id: "cashFlowChart",
    label: "Studio cash flow",
    desc: "Interactive 6m / 12m / All time client revenue vs studio costs",
  },
  {
    id: "categoryMixPie",
    label: "Studio revenue & expense pie",
    desc: "Donut chart across Studio Revenue by Pillar & Studio Expense categories",
  },
  {
    id: "periodPulse",
    label: "Monthly studio cash-in pulse",
    desc: "Monthly revenue bar breakdown with peak highlight",
  },
  {
    id: "studioExpenses",
    label: "Studio operating costs & jars",
    desc: "Software, tools, printing & studio category jars",
  },
  {
    id: "goalsRings",
    label: "RothVan Studio goals",
    desc: "Revenue, active client, and equipment fund progress rings",
  },
  {
    id: "recentActivity",
    label: "Recent studio activity",
    desc: "Latest client payments, invoices, and studio expenses",
  },
  {
    id: "projectPipeline",
    label: "Project pipeline",
    desc: "Counts across Inquiry, Quoted, Production, Delivered & Ready to close",
  },
  {
    id: "invoicesSummary",
    label: "Invoices due & overdue",
    desc: "Unpaid invoices requiring collection or follow-up",
  },
  {
    id: "topClients",
    label: "Top studio clients",
    desc: "Active clients ranked by total billed volume",
  },
];

function StudioDashboard() {
  const db = useDB((d) => d);
  const { openScanner } = useReceiptScanner();
  const [range, setRange] = useState<CashRange>("today");
  const [cashChartMode, setCashChartMode] = useState<ChartMode>("area");
  const [inspectedCategory, setInspectedCategory] = useState<string | null>(
    null,
  );
  const [expenseDraft, setExpenseDraft] = useState<Expense | null>(null);
  const [studioIncomeDraft, setStudioIncomeDraft] =
    useState<StudioIncome | null>(null);
  const [goalDraft, setGoalDraft] = useState<Goal | null>(null);
  const [editingLayout, setEditingLayout] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [newTabOpen, setNewTabOpen] = useState(false);
  const [newTabName, setNewTabName] = useState("");
  const [newTabWidgets, setNewTabWidgets] = useState<string[]>([
    "netProfit",
    "cashFlowChart",
    "categoryMixPie",
    "projectPipeline",
    "invoicesSummary",
  ]);
  const { tabs, addTab, removeTab } = useDashboardTabs();

  const s = useMemo(() => cashFlowSeries(db, range), [db, range]);
  const rangeMeta =
    RANGE_OPTIONS.find((o) => o.id === range) ?? RANGE_OPTIONS[2]!;
  const netRange = useMemo(() => s.reduce((a, x) => a + x.net, 0), [s]);
  const spark = useMemo(() => {
    let run = 0;
    return s.map((x) => ({
      label: x.label,
      fullDate: x.fullDate,
      v: (run += x.net),
      inn: x.inn,
      out: x.out,
      count: x.inCount + x.outCount,
    }));
  }, [s]);

  const views = useMemo(
    () => db.invoices.map((i) => ({ i, v: invoiceView(i, db) })),
    [db],
  );
  const followUps = useMemo(
    () =>
      db.invoices
        .filter((i) => needsFollowUp(i))
        .sort((a, b) => (a.followUp ?? "").localeCompare(b.followUp ?? "")),
    [db.invoices],
  );
  const outstanding = useMemo(
    () =>
      views
        .filter((x) => x.v.status !== "Draft")
        .reduce((a, x) => a + x.v.balanceUSD, 0),
    [views],
  );
  const overdue = useMemo(
    () =>
      views
        .filter((x) => x.v.status === "Overdue")
        .reduce((a, x) => a + x.v.balanceUSD, 0),
    [views],
  );
  const cashIn = useMemo(() => s.reduce((a, x) => a + x.inn, 0), [s]);
  const cashOut = useMemo(() => s.reduce((a, x) => a + x.out, 0), [s]);
  const r = safeKhrRate(db.settings.khrRate);
  const thisMonth = today().slice(0, 7);
  const year = today().slice(0, 4);
  const studioSummaryAll = useMemo(() => studioFinancialSummary(db, ""), [db]);

  const openNewStudioExpense = (category?: string) => {
    setExpenseDraft({
      id: uid(),
      date: today(),
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

  const openNewStudioIncome = () => {
    setStudioIncomeDraft({
      id: uid(),
      date: today(),
      source: "Retainer",
      accountMethod: "Bank Transfer",
      method: "Bank Transfer",
      description: "",
      amount: 0,
      currency: "USD",
      reference: "",
    });
  };

  const studioExpenseFields = (): Field<Expense>[] => [
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
    { k: "vendor", label: "Vendor / Supplier" },
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

  const studioCatsMonth = useMemo(
    () => categoryTotals(db, "Studio", thisMonth),
    [db, thisMonth],
  );
  const studioCatsAll = useMemo(() => categoryTotals(db, "Studio", ""), [db]);
  const studioCats =
    studioCatsMonth.length > 0 ? studioCatsMonth : studioCatsAll;
  const studioCatsScopeLabel =
    studioCatsMonth.length > 0 ? "this month" : "all time";
  const studioYearExpenses = useMemo(
    () => expenseTotal(db, "Studio", year),
    [db, year],
  );

  const recentStudioExpenses = useMemo(
    () =>
      [...db.expenses]
        .filter((e) => expenseAccount(e) === "Studio")
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 4),
    [db.expenses],
  );

  const activity = useMemo(
    () =>
      [
        ...db.payments.map((p) => {
          const inv = db.invoices.find((i) => i.id === p.invoiceId);
          const c = db.clients.find((c) => c.id === inv?.clientId);
          return {
            date: p.date,
            title: `${c?.name ?? "Client"} · ${p.reference || "payment"}`,
            sub: `Client payment · ${p.method}`,
            amt: recordToUSD(p, r),
            kind: "in" as const,
            expense: null as DB["expenses"][number] | null,
            studioIncome: null as StudioIncome | null,
            invoiceId: p.invoiceId,
          };
        }),
        ...(db.studioIncome ?? []).map((si) => ({
          date: si.date,
          title: si.description || si.source,
          sub: `Studio income · ${si.method || si.accountMethod}`,
          amt: recordToUSD(si, r),
          kind: "in" as const,
          expense: null as DB["expenses"][number] | null,
          studioIncome: si,
          invoiceId: null as string | null,
        })),
        ...db.expenses
          .filter((e) => expenseAccount(e) === "Studio")
          .map((e) => ({
            date: e.date,
            title: e.description || e.vendor,
            sub: `Studio cost · ${e.category}`,
            amt: -recordToUSD(e, r),
            kind: "out" as const,
            expense: e,
            studioIncome: null as StudioIncome | null,
            invoiceId: null as string | null,
          })),
        ...db.invoices.filter(isInvoice).map((i) => ({
          date: i.issue,
          title: `Invoice ${i.no}`,
          sub: `Issued · ${db.clients.find((c) => c.id === i.clientId)?.name ?? ""}`,
          amt: invoiceView(i, db).totalUSD,
          kind: "inv" as const,
          expense: null as DB["expenses"][number] | null,
          studioIncome: null as StudioIncome | null,
          invoiceId: i.id,
        })),
      ]
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 7),
    [db, r],
  );

  const studioGoals = useMemo(
    () => db.goals.filter((g) => goalAccount(g) === "Studio"),
    [db.goals],
  );
  const goalValue = useCallback(
    (g: DB["goals"][number]) =>
      g.kind === "cash"
        ? cashReceived(db, year)
        : g.kind === "clients"
          ? db.clients.filter((c) => c.status !== "Lead").length
          : g.current,
    [db, year],
  );

  const quickPayInvoice = useCallback(
    (invId: string, invNo: string, amount: number, currency: string) => {
      const paymentId = uid();
      setDB((d) =>
        recordPayment(d, {
          id: paymentId,
          invoiceId: invId,
          date: today(),
          amount,
          currency: currency === "KHR" ? "KHR" : "USD",
          method: "ABA",
          reference: "1-tap settle",
        }),
      );
      toast.success(`Paid ${invNo}`, {
        action: {
          label: "Undo",
          onClick: () => setDB((d) => deletePayment(d, paymentId)),
        },
      });
    },
    [],
  );

  const inProductionCount = useMemo(
    () => db.projects.filter((p) => p.status === "In production").length,
    [db.projects],
  );
  const readyToClose = useMemo(
    () =>
      db.projects.filter(
        (p) =>
          p.status === "Delivered" &&
          (() => {
            const inv = views.filter(
              (x) => isInvoice(x.i) && x.i.projectId === p.id,
            );
            return inv.length > 0 && inv.every((x) => x.v.status === "Paid");
          })(),
      ).length,
    [db.projects, views],
  );

  const openInvoicesList = useMemo(
    () =>
      views
        .filter(
          (x) => isInvoice(x.i) && x.v.balanceUSD > 0 && x.v.status !== "Draft",
        )
        .sort((a, b) => a.i.due.localeCompare(b.i.due))
        .slice(0, 6),
    [views],
  );

  const topClientsList = useMemo(
    () =>
      [...db.clients]
        .map((c) => {
          const billed = views
            .filter((x) => x.i.clientId === c.id)
            .reduce((a, x) => a + x.v.totalUSD, 0);
          return { c, billed };
        })
        .filter((x) => x.billed > 0)
        .sort((a, b) => b.billed - a.billed)
        .slice(0, 6),
    [db.clients, views],
  );

  const allWidgets = useMemo<Record<string, BentoWidgetDef>>(
    () => ({
      followUps: {
        id: "followUps",
        title: "Client follow-ups",
        defaultSpan: 6,
        render: () => (
          <Glass className="flex h-full flex-col justify-between">
            <div>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-border bg-secondary text-primary">
                    <FileText className="h-4 w-4" />
                  </span>
                  <h2 className="truncate font-display text-base font-bold">
                    Client follow-ups{" "}
                    <span className="font-num text-primary">
                      {followUps.length}
                    </span>
                  </h2>
                </div>
                <Link
                  to="/invoices"
                  className="shrink-0 text-xs font-medium text-primary hover:underline"
                >
                  Documents →
                </Link>
              </div>
              <div className="mb-3 grid grid-cols-2 gap-2.5 border-y border-border/70 py-3 text-xs text-muted-foreground">
                <div>
                  <span className="font-num block text-base font-bold text-foreground">
                    {
                      db.invoices.filter(
                        (i) =>
                          documentKind(i) === "Quotation" &&
                          i.sent &&
                          (!i.response || i.response === "Pending"),
                      ).length
                    }
                  </span>
                  <span>Quotations awaiting reply</span>
                </div>
                <div>
                  <span className="font-num block text-base font-bold text-foreground">
                    {
                      db.invoices.filter(
                        (i) =>
                          documentKind(i) === "Agreement" &&
                          i.response !== "Accepted",
                      ).length
                    }
                  </span>
                  <span>Agreements unsigned</span>
                </div>
              </div>
              {followUps.length ? (
                <ul className="divide-y divide-border">
                  {followUps.slice(0, 5).map((i) => (
                    <li key={i.id}>
                      <Link
                        to="/invoices/$id"
                        params={{ id: i.id }}
                        className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-xs transition-colors hover:text-primary"
                      >
                        <span className="truncate font-medium">
                          {db.clients.find((c) => c.id === i.clientId)?.name} ·{" "}
                          {i.no}
                        </span>
                        <span className="font-num shrink-0 text-primary">
                          Follow up · {shortDate(i.followUp ?? "")} →
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="py-3 text-xs text-muted-foreground">
                  No quotation follow-ups due.
                </p>
              )}
            </div>
          </Glass>
        ),
      },
      netProfit: {
        id: "netProfit",
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
                    Studio Net Profit
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {rangeMeta.desc}
                  </p>
                </div>
              </div>
              <p
                className={cn(
                  "font-num mt-2 text-3xl font-extrabold sm:text-4xl",
                  netRange < 0 && "text-destructive",
                )}
              >
                <AnimatedNumber value={netRange} />
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Client invoice payments minus RothVan Design studio costs
              </p>
              <SparklineWithDates
                data={spark}
                gradientId="ov-sp"
                valueLabel="Studio cumulative net"
              />
            </div>
            <div className="grid grid-cols-2 gap-3 border-t border-border/70 pt-3.5 sm:grid-cols-3">
              <Link to="/invoices" className="ios-tap">
                <Stat
                  label="Open A/R"
                  value={compactMoney(outstanding)}
                  fullValue={money(outstanding)}
                />
              </Link>
              <Stat
                label="Invoiced (All)"
                value={compactMoney(studioSummaryAll.revenueInvoicedUSD)}
                fullValue={money(studioSummaryAll.revenueInvoicedUSD)}
              />
              <Stat
                label="Est. Project Profit"
                value={compactMoney(
                  studioSummaryAll.estimatedProjectProfitUSD,
                  "USD",
                  true,
                )}
                fullValue={money(
                  studioSummaryAll.estimatedProjectProfitUSD,
                  "USD",
                  true,
                )}
                tone={
                  studioSummaryAll.estimatedProjectProfitUSD >= 0
                    ? "pos"
                    : "neg"
                }
              />
              <Stat
                label="Project Costs"
                value={compactMoney(studioSummaryAll.directProjectCostsUSD)}
                fullValue={money(studioSummaryAll.directProjectCostsUSD)}
              />
              <Stat
                label="Operating Overhead"
                value={compactMoney(studioSummaryAll.operatingExpensesUSD)}
                fullValue={money(studioSummaryAll.operatingExpensesUSD)}
              />
              <Link to="/projects" className="ios-tap">
                <Stat label="In production" value={String(inProductionCount)} />
              </Link>
            </div>
            {studioSummaryAll.planningReservePct > 0 && (
              <p className="mt-2 text-[0.7rem] text-muted-foreground">
                Planning reserve ({studioSummaryAll.planningReservePct}% est.):{" "}
                <span className="font-num font-semibold text-foreground">
                  {money(studioSummaryAll.planningReserveUSD)}
                </span>{" "}
                (cash-flow buffer only, not tax liability)
              </p>
            )}
          </Glass>
        ),
      },
      cashFlowChart: {
        id: "cashFlowChart",
        title: "Cash Flow",
        defaultSpan: 7,
        render: () => (
          <Glass delay={80} className="flex h-full flex-col justify-between">
            <div>
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-border bg-secondary text-primary">
                    <Activity className="h-4 w-4" />
                  </span>
                  <h2 className="truncate font-display text-base font-bold leading-tight">
                    Cash Flow
                  </h2>
                </div>
                <ChartModeCycleButton
                  mode={cashChartMode}
                  onChange={setCashChartMode}
                />
              </div>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <SlidingTabs
                  size="xs"
                  tone="invert"
                  layoutGroup="ov-cash-range"
                  value={range}
                  onChange={setRange}
                  options={RANGE_OPTIONS.map((o) => ({
                    id: o.id,
                    label: o.label,
                  }))}
                />
              </div>
              <div className="mb-3 grid grid-cols-3 gap-3 border-y border-border/70 py-3">
                <Stat
                  icon={ArrowDownLeft}
                  label="In"
                  value={compactMoney(cashIn)}
                  fullValue={money(cashIn)}
                  tone="pos"
                />
                <Stat
                  icon={ArrowUpRight}
                  label="Out"
                  value={compactMoney(cashOut)}
                  fullValue={money(cashOut)}
                />
                <Stat
                  icon={Activity}
                  label="Net"
                  value={compactMoney(cashIn - cashOut, "USD", true)}
                  fullValue={money(cashIn - cashOut, "USD", true)}
                  tone={cashIn - cashOut >= 0 ? "pos" : "neg"}
                />
              </div>
            </div>
            <TrendChartCanvas
              mode={cashChartMode}
              data={s}
              primaryKey="inn"
              primaryName="Client cash in"
              secondaryKey="out"
              secondaryName="Studio expenses"
              gradientId="ov-cf"
            />
          </Glass>
        ),
      },
      categoryMixPie: {
        id: "categoryMixPie",
        title: "Studio revenue & expense pie",
        defaultSpan: 6,
        render: () => (
          <BreakdownPieCard
            db={db}
            account="Studio"
            personalItems={[]}
            studioItems={studioCats}
            scopeLabel={studioCatsScopeLabel}
            onSelectCategory={(_acc, cat) => setInspectedCategory(cat)}
          />
        ),
      },
      periodPulse: {
        id: "periodPulse",
        title: "Monthly studio revenue pulse",
        defaultSpan: 6,
        render: () => {
          const slice = s.slice(-6);
          return (
            <PeriodBarPulseCard
              title="Monthly studio revenue"
              subtitle={`Last ${Math.min(6, slice.length)} months of paid client invoices`}
              data={slice}
              valueKey="inn"
            />
          );
        },
      },
      studioExpenses: {
        id: "studioExpenses",
        title: "Studio operating costs",
        defaultSpan: 6,
        render: () => (
          <Glass delay={120} className="h-full">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" />
                <h2 className="font-medium">
                  Studio expenses · {studioCatsScopeLabel}
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <Btn
                  type="button"
                  onClick={() => openScanner("Studio")}
                  className="px-2.5 py-1 text-xs whitespace-nowrap shrink-0"
                >
                  <ScanLine className="h-3.5 w-3.5 text-primary" />
                  Scan
                </Btn>
                <Btn
                  type="button"
                  variant="gold"
                  onClick={() => openNewStudioExpense()}
                  className="px-2.5 py-1 text-xs whitespace-nowrap shrink-0"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add cost
                </Btn>
              </div>
            </div>
            <div className="mb-4 grid grid-cols-3 gap-3 border-b border-border pb-4">
              <Stat
                label={`Spent (${year})`}
                value={compactMoney(studioYearExpenses)}
                fullValue={money(studioYearExpenses)}
                tone="neg"
              />
              <Stat label="Categories" value={String(studioCats.length)} />
              <Stat
                label="Active clients"
                value={String(
                  db.clients.filter((c) => c.status === "Active").length,
                )}
              />
            </div>

            {studioCats.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No studio operating expenses logged yet.
              </p>
            ) : (
              <BudgetShelf
                db={db}
                account="Studio"
                month={thisMonth}
                monthLabel={studioCatsScopeLabel}
                items={studioCats}
                selectedCategory={inspectedCategory}
                onSelectCategory={(cat) => setInspectedCategory(cat)}
                compact
              />
            )}
            {recentStudioExpenses.length > 0 && (
              <ul className="mt-4 divide-y divide-border border-t border-border pt-2">
                {recentStudioExpenses.map((e) => {
                  const ItemIcon = expenseItemIcon(e);
                  return (
                    <li key={e.id}>
                      <button
                        type="button"
                        onClick={() => setExpenseDraft(e)}
                        className="flex w-full items-center justify-between gap-3 rounded-xl px-1.5 py-2 text-left text-xs transition-colors hover:bg-muted/60"
                      >
                        <div className="flex min-w-0 items-center gap-2.5">
                          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-border bg-muted text-primary">
                            <ItemIcon className="h-3.5 w-3.5" />
                          </span>
                          <span className="truncate text-muted-foreground">
                            <b className="font-medium text-foreground">
                              {e.description || e.vendor}
                            </b>{" "}
                            · {e.category} · {shortDate(e.date)}
                          </span>
                        </div>
                        <span className="font-num shrink-0 text-destructive">
                          {money(-recordToUSD(e, r))}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            <Link
              to="/finance"
              className="mt-3 block text-xs text-primary hover:underline"
            >
              Open full Studio Finance ledger →
            </Link>
          </Glass>
        ),
      },
      goalsRings: {
        id: "goalsRings",
        title: "RothVan Studio goals",
        defaultSpan: 6,
        render: () => (
          <Glass delay={160} className="h-full">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-medium">RothVan Studio goals</h2>
              <span className="text-sm text-muted-foreground">
                {studioGoals.length} active
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {studioGoals.slice(0, 4).map((g, idx) => (
                <GoalRingCard
                  key={g.id}
                  goal={g}
                  current={goalValue(g)}
                  delay={idx * 60}
                  onEdit={() => setGoalDraft(g)}
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
            <Link
              to="/finance"
              className="mt-4 block text-xs text-muted-foreground hover:text-foreground"
            >
              Manage all {studioGoals.length} studio goals in Finance →
            </Link>
          </Glass>
        ),
      },
      recentActivity: {
        id: "recentActivity",
        title: "Recent studio activity",
        defaultSpan: 6,
        render: () => (
          <Glass delay={200} className="h-full">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="font-display text-base font-bold">
                Recent studio activity
              </h2>
              <div className="flex items-center gap-2">
                <Btn
                  type="button"
                  onClick={openNewStudioIncome}
                  className="px-2.5 py-1 text-xs whitespace-nowrap shrink-0"
                >
                  <Plus className="h-3 w-3 text-positive" />
                  Income
                </Btn>
                <Link
                  to="/finance"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Studio finance →
                </Link>
              </div>
            </div>
            <ul className="divide-y divide-border">
              {activity.map((a, k) => {
                const OutIcon = a.expense
                  ? expenseItemIcon(a.expense)
                  : ArrowUpRight;
                return (
                  <li key={k} className="flex items-center gap-3 py-3">
                    <span
                      className={cn(
                        "grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border bg-muted",
                        a.kind === "in" && "text-positive",
                        a.kind === "out" && "text-primary",
                      )}
                    >
                      {a.kind === "in" ? (
                        <ArrowDownLeft className="h-4 w-4" />
                      ) : a.kind === "out" ? (
                        <OutIcon className="h-4 w-4" />
                      ) : (
                        <FileText className="h-4 w-4" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      {a.studioIncome ? (
                        <button
                          type="button"
                          onClick={() => setStudioIncomeDraft(a.studioIncome)}
                          className="block w-full truncate text-left text-sm font-medium hover:text-primary"
                        >
                          {a.title}
                        </button>
                      ) : a.expense ? (
                        <button
                          type="button"
                          onClick={() => setExpenseDraft(a.expense)}
                          className="block w-full truncate text-left text-sm font-medium hover:text-primary"
                        >
                          {a.title}
                        </button>
                      ) : (
                        <p className="truncate text-sm font-medium">
                          {a.title}
                        </p>
                      )}
                      <p className="truncate text-xs text-muted-foreground">
                        {a.sub} · {shortDate(a.date)}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "font-num shrink-0 text-sm",
                        a.kind === "in" && "text-positive",
                        a.kind === "out" && "text-destructive",
                        a.kind === "inv" && "text-muted-foreground",
                      )}
                    >
                      {a.kind === "inv"
                        ? money(a.amt)
                        : money(a.amt, "USD", true)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </Glass>
        ),
      },
      projectPipeline: {
        id: "projectPipeline",
        title: "Project pipeline",
        defaultSpan: 12,
        render: () => (
          <Glass delay={260} className="h-full">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderKanban className="h-4 w-4 text-primary" />
                <h2 className="font-display text-base font-bold">
                  Project pipeline
                </h2>
              </div>
              <Link
                to="/projects"
                className="text-xs font-medium text-primary hover:underline"
              >
                Open board →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {PROJECT_STATUSES.slice(0, 5).map((st) => (
                <Link
                  key={st}
                  to="/projects"
                  className="ios-card-tap rounded-xl border border-border bg-secondary/50 p-4"
                >
                  <p className="label-mono">{st}</p>
                  <p className="font-num text-3xl font-extrabold">
                    {db.projects.filter((p) => p.status === st).length}
                  </p>
                </Link>
              ))}
              <Link
                to="/projects"
                className="ios-card-tap rounded-xl border border-primary/45 bg-primary/12 p-4 text-primary"
              >
                <p className="label-mono text-primary">Ready to close</p>
                <p className="font-num text-3xl font-extrabold">
                  {readyToClose}
                </p>
              </Link>
            </div>
          </Glass>
        ),
      },
      invoicesSummary: {
        id: "invoicesSummary",
        title: "Invoices due & overdue",
        defaultSpan: 6,
        render: () => (
          <Glass className="h-full">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <h2 className="font-medium">Invoices due & overdue</h2>
              </div>
              <Link
                to="/invoices"
                className="text-xs text-primary hover:underline"
              >
                All invoices →
              </Link>
            </div>
            {openInvoicesList.length === 0 ? (
              <p className="py-4 text-sm text-muted-foreground">
                No open invoice balances.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {openInvoicesList.map(({ i, v }) => {
                  const client = db.clients.find((c) => c.id === i.clientId);
                  return (
                    <li
                      key={i.id}
                      className="flex items-center justify-between gap-2 py-2.5 text-xs"
                    >
                      <Link
                        to="/invoices/$id"
                        params={{ id: i.id }}
                        className="min-w-0 flex-1 hover:text-primary"
                      >
                        <p className="font-num truncate font-medium">
                          {i.no} · {client?.name ?? "Client"}
                        </p>
                        <p className="text-muted-foreground">
                          Due {shortDate(i.due)}
                        </p>
                      </Link>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="font-num font-semibold">
                          {compactMoney(v.balanceUSD)}
                        </span>
                        <Pill s={v.status} />
                        {v.balance > 0 && (
                          <button
                            type="button"
                            onClick={() =>
                              quickPayInvoice(i.id, i.no, v.balance, i.currency)
                            }
                            className="inline-flex min-h-[28px] shrink-0 items-center rounded-md border border-positive/40 bg-positive/12 px-2 text-[0.68rem] font-semibold text-positive transition-colors hover:bg-positive hover:text-white active:scale-95"
                          >
                            Pay
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Glass>
        ),
      },
      topClients: {
        id: "topClients",
        title: "Top studio clients",
        defaultSpan: 6,
        render: () => (
          <Glass className="h-full">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <h2 className="font-medium">Top studio clients</h2>
              </div>
              <Link
                to="/clients"
                className="text-xs text-primary hover:underline"
              >
                Directory →
              </Link>
            </div>
            <ul className="divide-y divide-border">
              {topClientsList.map(({ c, billed }) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between gap-2 py-2.5 text-xs"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{c.name}</p>
                    <p className="truncate text-muted-foreground">
                      {c.industry || c.type} · {c.code}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="font-num font-semibold"
                      title={money(billed)}
                    >
                      {compactMoney(billed)}
                    </span>
                    <Pill s={c.status} />
                  </div>
                </li>
              ))}
            </ul>
          </Glass>
        ),
      },
    }),
    [
      db,
      openScanner,
      followUps,
      rangeMeta,
      netRange,
      spark,
      outstanding,
      studioSummaryAll,
      inProductionCount,
      range,
      cashChartMode,
      cashIn,
      cashOut,
      s,
      studioCats,
      studioCatsScopeLabel,
      studioYearExpenses,
      thisMonth,
      inspectedCategory,
      recentStudioExpenses,
      r,
      studioGoals,
      activity,
      readyToClose,
      openInvoicesList,
      topClientsList,
      year,
      goalValue,
      quickPayInvoice,
    ],
  );

  const studioDashboardList: BentoWidgetDef[] = [
    allWidgets["netProfit"]!,
    allWidgets["cashFlowChart"]!,
    allWidgets["invoicesSummary"]!,
    allWidgets["followUps"]!,
    allWidgets["projectPipeline"]!,
    allWidgets["categoryMixPie"]!,
    allWidgets["periodPulse"]!,
    allWidgets["studioExpenses"]!,
    allWidgets["goalsRings"]!,
    allWidgets["topClients"]!,
    allWidgets["recentActivity"]!,
  ];

  const currentCustomTab = tabs.find((t) => t.id === activeTab);
  const currentWidgets: BentoWidgetDef[] = currentCustomTab
    ? currentCustomTab.widgetIds
        .map((id) => allWidgets[id])
        .filter((w): w is BentoWidgetDef => Boolean(w))
    : studioDashboardList;

  const pageKey =
    activeTab === "overview" ? "studio-overview" : `overview:${activeTab}`;

  const toggleNewTabWidget = (id: string) => {
    setNewTabWidgets((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  return (
    <>
      <PageHeader
        title={currentCustomTab ? currentCustomTab.label : "Studio"}
        owner={db.settings.ownerName}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <EditLayoutButton
              editing={editingLayout}
              onToggle={() => setEditingLayout((e) => !e)}
            />
            <Link
              to="/invoices/$id"
              params={{ id: "new" }}
              className="ios-tap inline-flex min-h-[42px] shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-xs hover:bg-[var(--primary-hover,var(--primary))] sm:min-h-[38px]"
            >
              <Plus className="h-4 w-4" />
              New invoice
            </Link>
          </div>
        }
      />

      <WorkspaceBalanceCard workspace="studio" />

      {/* Dashboard Tabs Strip + Add New Tab */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
        <div className="no-scrollbar flex max-w-full items-center gap-1.5 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab("overview");
              setEditingLayout(false);
            }}
            className={cn(
              "min-h-[36px] rounded-lg border px-3.5 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors",
              activeTab === "overview"
                ? "border-primary bg-primary text-primary-foreground shadow-xs"
                : "border-border bg-secondary text-muted-foreground hover:text-foreground",
            )}
          >
            Studio Overview
          </button>
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={cn(
                "inline-flex min-h-[36px] shrink-0 items-center rounded-lg border text-xs font-medium transition-colors",
                activeTab === tab.id
                  ? "border-primary bg-primary text-primary-foreground shadow-xs"
                  : "border-border bg-secondary text-muted-foreground hover:text-foreground",
              )}
            >
              <button
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setEditingLayout(false);
                }}
                className="px-3.5 py-1.5 whitespace-nowrap"
              >
                {tab.label}
              </button>
              <button
                type="button"
                aria-label={`Delete tab ${tab.label}`}
                onClick={() => {
                  removeTab(tab.id);
                  if (activeTab === tab.id) setActiveTab("overview");
                }}
                className={cn(
                  "mr-1.5 rounded-md p-1 transition-colors",
                  activeTab === tab.id
                    ? "hover:bg-black/15"
                    : "hover:bg-destructive/15 hover:text-destructive",
                )}
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setNewTabOpen(true)}
            className="inline-flex min-h-[36px] items-center gap-1 rounded-lg border border-dashed border-border px-3 py-1.5 text-xs text-muted-foreground whitespace-nowrap shrink-0 transition-colors hover:border-primary/60 hover:text-foreground"
          >
            <Plus className="h-3.5 w-3.5" />
            New tab
          </button>
        </div>
      </div>

      <EditableBentoGrid
        pageKey={pageKey}
        widgets={currentWidgets}
        editing={editingLayout}
        onToggleEditing={() => setEditingLayout((e) => !e)}
        onDoneEditing={() => setEditingLayout(false)}
      />

      <CategoryInspectorDrawer
        db={db}
        account="Studio"
        category={inspectedCategory}
        month={thisMonth}
        onClose={() => setInspectedCategory(null)}
        onAddExpense={(_acc, cat) => openNewStudioExpense(cat)}
        onEditExpense={(exp) => setExpenseDraft(exp)}
      />

      <EditModal
        item={expenseDraft}
        onClose={() => setExpenseDraft(null)}
        title="Studio Expense"
        subtitle="RothVan Design"
        presentation="drawer"
        side="right"
        fields={studioExpenseFields()}
        onSave={(v) =>
          setDB((d) => ({
            ...d,
            expenses: upsert(
              d.expenses,
              stampFxSnapshot(
                { ...v, account: "Studio" },
                safeKhrRate(d.settings.khrRate),
                expenseDraft?.currency === v.currency &&
                  expenseDraft?.amount === v.amount,
              ),
            ),
          }))
        }
        onDelete={
          expenseDraft && db.expenses.some((e) => e.id === expenseDraft.id)
            ? (v) =>
                setDB((d) => ({
                  ...d,
                  expenses: d.expenses.filter((x) => x.id !== v.id),
                }))
            : undefined
        }
      />

      <QuickStudioIncomeDrawer
        item={studioIncomeDraft}
        onClose={() => setStudioIncomeDraft(null)}
        onSave={(v) => {
          setDB((d) => ({
            ...d,
            studioIncome: upsert(d.studioIncome ?? [], v),
          }));
          toast.success("Studio income saved.");
        }}
        onDelete={
          studioIncomeDraft &&
          (db.studioIncome ?? []).some((x) => x.id === studioIncomeDraft.id)
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

      <GoalPlannerDrawer
        goal={goalDraft}
        liveCurrent={goalDraft ? goalValue(goalDraft) : undefined}
        account="Studio"
        onClose={() => setGoalDraft(null)}
        onSave={(v) =>
          setDB((d) => ({
            ...d,
            goals: upsert(d.goals, { ...v, account: "Studio" }),
          }))
        }
        onDelete={
          goalDraft && db.goals.some((g) => g.id === goalDraft.id)
            ? (v) =>
                setDB((d) => ({
                  ...d,
                  goals: d.goals.filter((x) => x.id !== v.id),
                }))
            : undefined
        }
      />

      <SlideDrawer
        open={newTabOpen}
        onClose={() => setNewTabOpen(false)}
        title="Add studio tab"
        subtitle="Custom RothVan workspace"
      >
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            const created = addTab(newTabName, newTabWidgets);
            setActiveTab(created.id);
            setNewTabName("");
            setNewTabOpen(false);
          }}
        >
          <div>
            <label className="label-mono mb-1.5 block">Tab name</label>
            <input
              className="field"
              placeholder="e.g. Client Billing & Pipeline"
              value={newTabName}
              onChange={(e) => setNewTabName(e.target.value)}
              required
            />
          </div>
          <div>
            <p className="label-mono mb-2">
              Choose RothVan Studio widgets ({newTabWidgets.length} selected)
            </p>
            <div className="space-y-2">
              {SYSTEM_WIDGET_CATALOG.map((w) => {
                const picked = newTabWidgets.includes(w.id);
                return (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => toggleNewTabWidget(w.id)}
                    className={cn(
                      "flex w-full items-start justify-between gap-3 rounded-2xl border p-3 text-left transition-colors",
                      picked
                        ? "border-primary bg-primary/12"
                        : "border-border/70 bg-muted/25 hover:border-primary/40",
                    )}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{w.label}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {w.desc}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "font-num mt-0.5 shrink-0 rounded-md border px-2 py-0.5 text-[0.68rem] font-medium",
                        picked
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-muted-foreground",
                      )}
                    >
                      {picked ? "Added" : "Add"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t border-border/70 pt-3">
            <Btn type="button" onClick={() => setNewTabOpen(false)}>
              Cancel
            </Btn>
            <Btn type="submit" variant="gold">
              Create tab
            </Btn>
          </div>
        </form>
      </SlideDrawer>
    </>
  );
}
