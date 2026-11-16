import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  FileText,
  FolderKanban,
  PiggyBank,
  Plus,
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
import {
  AnimatedNumber,
  BudgetShelf,
  CategoryInspectorDrawer,
  GoalRingCard,
  expenseItemIcon,
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
  useDashboardTabs,
  type BentoWidgetDef,
} from "@/components/rv/BentoGrid";
import {
  PROJECT_STATUSES,
  cashFlowSeries,
  compactMoney,
  documentKind,
  expenseAccount,
  goalAccount,
  invoiceView,
  isInvoice,
  money,
  needsFollowUp,
  personalCategoryTotals,
  personalSeries,
  setDB,
  shortDate,
  toUSD,
  today,
  useDB,
  type CashRange,
  type DB,
  type PersonalRange,
} from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { title: "Overview · RothVan Studio" },
      {
        name: "description",
        content:
          "Cash profit, cash flow, personal monthly expenses, goals and project pipeline for RothVan Design.",
      },
      { property: "og:title", content: "Overview · RothVan Studio" },
      {
        property: "og:description",
        content:
          "Cash profit, cash flow, personal monthly expenses, goals and project pipeline for RothVan Design.",
      },
    ],
  }),
  component: Overview,
});

const RANGE_OPTIONS: { id: CashRange; label: string; desc: string }[] = [
  { id: "6m", label: "6 months", desc: "last 6 months" },
  { id: "12m", label: "12 months", desc: "last 12 months" },
  { id: "all", label: "All time", desc: "all time" },
];

const PERSONAL_RANGES: { id: PersonalRange; label: string; desc: string }[] = [
  { id: "1m", label: "This month", desc: "this month" },
  { id: "6m", label: "6 months", desc: "last 6 months" },
  { id: "12m", label: "12 months", desc: "last 12 months" },
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
    desc: "Headline profit sparkline, outstanding A/R & monthly spend",
  },
  {
    id: "cashFlowChart",
    label: "Studio cash flow",
    desc: "Interactive 6m / 12m / All time revenue vs expense trend",
  },
  {
    id: "personalExpenses",
    label: "Personal expenses & jars",
    desc: "This month / 6m / 12m living spend jars & recent items",
  },
  {
    id: "goalsRings",
    label: "Goals & savings",
    desc: "Animated progress rings with quick +$50 / +$100 deposits",
  },
  {
    id: "recentActivity",
    label: "Recent activity",
    desc: "Latest client payments, invoices, and studio/personal spend",
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
    id: "categoryMixPie",
    label: "Category & revenue pie chart",
    desc: "Donut chart across Expenses, Revenue by Pillar & Studio/Personal mix",
  },
  {
    id: "periodPulse",
    label: "Recent activity bar pulse",
    desc: "Bar breakdown with date axis & peak highlight",
  },
  {
    id: "topClients",
    label: "Top studio clients",
    desc: "Active clients ranked by total billed volume",
  },
  {
    id: "cardSpend",
    label: "Card spending (Debit vs Credit)",
    desc: "Daily (1m) and monthly (6m / 12m) Debit vs Credit card tracker",
  },
];

function Overview() {
  const db = useDB((d) => d);
  const [range, setRange] = useState<CashRange>("all");
  const [cashChartMode, setCashChartMode] = useState<ChartMode>("area");
  const [personalRange, setPersonalRange] = useState<PersonalRange>("1m");
  const [personalChartMode, setPersonalChartMode] = useState<ChartMode>("area");
  const [inspectedCategory, setInspectedCategory] = useState<string | null>(
    null,
  );
  const [editingLayout, setEditingLayout] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [newTabOpen, setNewTabOpen] = useState(false);
  const [newTabName, setNewTabName] = useState("");
  const [newTabWidgets, setNewTabWidgets] = useState<string[]>([
    "netProfit",
    "cashFlowChart",
    "categoryMixPie",
    "personalExpenses",
    "goalsRings",
  ]);
  const { tabs, addTab, removeTab } = useDashboardTabs();

  const s = cashFlowSeries(db, range);
  const rangeMeta =
    RANGE_OPTIONS.find((o) => o.id === range) ?? RANGE_OPTIONS[2]!;
  const netRange = s.reduce((a, x) => a + x.net, 0);
  let run = 0;
  const spark = s.map((x) => ({
    label: x.label,
    fullDate: x.fullDate,
    v: (run += x.net),
    inn: x.inn,
    out: x.out,
    count: x.inCount + x.outCount,
  }));

  const views = db.invoices.map((i) => ({ i, v: invoiceView(i, db) }));
  const followUps = db.invoices
    .filter((i) => needsFollowUp(i))
    .sort((a, b) => (a.followUp ?? "").localeCompare(b.followUp ?? ""));
  const outstanding = views
    .filter((x) => x.v.status !== "Draft")
    .reduce((a, x) => a + x.v.balanceUSD, 0);
  const overdue = views
    .filter((x) => x.v.status === "Overdue")
    .reduce((a, x) => a + x.v.balanceUSD, 0);
  const cashIn = s.reduce((a, x) => a + x.inn, 0),
    cashOut = s.reduce((a, x) => a + x.out, 0);
  const r = db.settings.khrRate;
  const thisMonth = today().slice(0, 7);

  const personalTrend = personalSeries(db, personalRange, thisMonth);
  const personalAgg = personalCategoryTotals(db, personalRange, thisMonth);
  const personalRangeTotal = personalTrend.reduce(
    (a, x) => a + x.personalOut,
    0,
  );
  const personalAvgPerMonth = personalRangeTotal / personalAgg.monthsCount;
  const personalMonthTotal = personalCategoryTotals(
    db,
    "1m",
    thisMonth,
  ).items.reduce((a, c) => a + c.totalUSD, 0);

  const personalItemsPeriod = [...db.expenses]
    .filter(
      (e) =>
        expenseAccount(e) === "Personal" &&
        personalAgg.monthSet.has(e.date.slice(0, 7)),
    )
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 4);

  const activity = [
    ...db.payments.map((p) => {
      const inv = db.invoices.find((i) => i.id === p.invoiceId);
      const c = db.clients.find((c) => c.id === inv?.clientId);
      return {
        date: p.date,
        title: `${c?.name ?? "Client"} · ${p.reference || "payment"}`,
        sub: `Income · ${p.method}`,
        amt: toUSD(p.amount, p.currency, r),
        kind: "in" as const,
        expense: null as DB["expenses"][number] | null,
      };
    }),
    ...db.expenses.map((e) => ({
      date: e.date,
      title: e.description || e.vendor,
      sub: `${expenseAccount(e)} · ${e.category}`,
      amt: -toUSD(e.amount, e.currency, r),
      kind: "out" as const,
      expense: e,
    })),
    ...db.invoices.filter(isInvoice).map((i) => ({
      date: i.issue,
      title: `Invoice ${i.no}`,
      sub: `Issued · ${db.clients.find((c) => c.id === i.clientId)?.name ?? ""}`,
      amt: invoiceView(i, db).totalUSD,
      kind: "inv" as const,
      expense: null as DB["expenses"][number] | null,
    })),
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 7);

  const year = today().slice(0, 4);
  const goalValue = (g: DB["goals"][number]) =>
    g.kind === "cash"
      ? db.payments
          .filter((p) => p.date.startsWith(year))
          .reduce((a, p) => a + toUSD(p.amount, p.currency, r), 0)
      : g.kind === "clients"
        ? db.clients.filter((c) => c.status !== "Lead").length
        : g.current;
  const readyToClose = db.projects.filter(
    (p) =>
      p.status === "Delivered" &&
      (() => {
        const inv = views.filter(
          (x) => isInvoice(x.i) && x.i.projectId === p.id,
        );
        return inv.length > 0 && inv.every((x) => x.v.status === "Paid");
      })(),
  ).length;

  const openInvoicesList = views
    .filter(
      (x) => isInvoice(x.i) && x.v.balanceUSD > 0 && x.v.status !== "Draft",
    )
    .sort((a, b) => a.i.due.localeCompare(b.i.due))
    .slice(0, 6);

  const topClientsList = [...db.clients]
    .map((c) => {
      const billed = views
        .filter((x) => x.i.clientId === c.id)
        .reduce((a, x) => a + x.v.totalUSD, 0);
      return { c, billed };
    })
    .filter((x) => x.billed > 0)
    .sort((a, b) => b.billed - a.billed)
    .slice(0, 6);

  const allWidgets = useMemo<Record<string, BentoWidgetDef>>(
    () => ({
      followUps: {
        id: "followUps",
        title: "Client follow-ups",
        defaultSpan: 12,
        render: () => (
          <Glass className="h-full">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-lg font-bold">
                Client follow-ups{" "}
                <span className="text-primary">{followUps.length}</span>
              </h2>
              <Link to="/invoices" className="text-sm text-primary">
                Documents →
              </Link>
            </div>
            <div className="mb-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span>
                {
                  db.invoices.filter(
                    (i) =>
                      documentKind(i) === "Quotation" &&
                      i.sent &&
                      (!i.response || i.response === "Pending"),
                  ).length
                }{" "}
                quotations awaiting response
              </span>
              <span>
                {
                  db.invoices.filter(
                    (i) =>
                      documentKind(i) === "Agreement" &&
                      i.response !== "Accepted",
                  ).length
                }{" "}
                agreements awaiting signature
              </span>
            </div>
            {followUps.length ? (
              <ul className="divide-y divide-border">
                {followUps.slice(0, 5).map((i) => (
                  <li key={i.id}>
                    <Link
                      to="/invoices/$id"
                      params={{ id: i.id }}
                      className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm"
                    >
                      <span>
                        {db.clients.find((c) => c.id === i.clientId)?.name} ·{" "}
                        {i.no}
                      </span>
                      <span className="text-primary">
                        Follow up · {shortDate(i.followUp ?? "")} →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No quotation follow-ups due.
              </p>
            )}
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
              <p className="text-sm text-muted-foreground">
                Studio net cash profit, {rangeMeta.desc}
              </p>
              <p
                className={cn(
                  "mt-2 font-display text-4xl font-black tabular-nums",
                  netRange < 0 && "text-destructive",
                )}
              >
                <AnimatedNumber value={netRange} />
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Studio cash received minus RothVan Design expenses
              </p>
              <SparklineWithDates
                data={spark}
                gradientId="ov-sp"
                valueLabel="Cumulative net"
              />
            </div>
            <div className="grid grid-cols-3 gap-3 border-t border-border pt-4">
              <Link to="/invoices">
                <Stat
                  label="Outstanding"
                  value={compactMoney(outstanding)}
                  fullValue={money(outstanding)}
                />
              </Link>
              <Link to="/invoices">
                <Stat
                  label="Overdue"
                  value={compactMoney(overdue)}
                  fullValue={money(overdue)}
                  tone={overdue > 0 ? "neg" : undefined}
                />
              </Link>
              <Link to="/finance">
                <Stat
                  label="Personal (mo)"
                  value={compactMoney(personalMonthTotal)}
                  fullValue={money(personalMonthTotal)}
                />
              </Link>
            </div>
          </Glass>
        ),
      },
      cashFlowChart: {
        id: "cashFlowChart",
        title: "Studio cash flow",
        defaultSpan: 7,
        render: () => (
          <Glass delay={80} className="h-full">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-medium">Studio cash flow</h2>
              <div className="flex flex-wrap items-center gap-2">
                <SlidingTabs
                  size="xs"
                  layoutGroup="ov-cash-mode"
                  value={cashChartMode}
                  onChange={setCashChartMode}
                  options={CHART_MODE_OPTIONS}
                />
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
            </div>
            <div className="mb-3 grid grid-cols-3 gap-3">
              <Stat
                label="● Cash in"
                value={compactMoney(cashIn)}
                fullValue={money(cashIn)}
              />
              <Stat
                label="○ Studio out"
                value={compactMoney(cashOut)}
                fullValue={money(cashOut)}
              />
              <Stat
                label="Net"
                value={compactMoney(cashIn - cashOut, "USD", true)}
                fullValue={money(cashIn - cashOut, "USD", true)}
                tone={cashIn - cashOut >= 0 ? "pos" : "neg"}
              />
            </div>
            <TrendChartCanvas
              mode={cashChartMode}
              data={s}
              primaryKey="inn"
              primaryName="Cash in"
              secondaryKey="out"
              secondaryName="Studio expenses"
              gradientId="ov-cf"
            />
          </Glass>
        ),
      },
      personalExpenses: {
        id: "personalExpenses",
        title: "Personal expenses",
        defaultSpan: 6,
        render: () => (
          <Glass delay={120} className="h-full">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <PiggyBank className="h-4 w-4 text-primary" />
                <h2 className="font-medium">
                  Personal expenses · {personalAgg.scopeLabel}
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <SlidingTabs
                  size="xs"
                  layoutGroup="ov-pers-mode"
                  value={personalChartMode}
                  onChange={setPersonalChartMode}
                  options={CHART_MODE_OPTIONS}
                />
                <SlidingTabs
                  size="xs"
                  tone="invert"
                  layoutGroup="ov-pers-range"
                  value={personalRange}
                  onChange={setPersonalRange}
                  options={PERSONAL_RANGES.map((o) => ({
                    id: o.id,
                    label: o.label,
                  }))}
                />
              </div>
            </div>
            <div className="mb-4 grid grid-cols-3 gap-3 border-b border-border pb-4">
              <Stat
                label={
                  personalRange === "1m"
                    ? "Spent (mo)"
                    : `Spent (${personalRange})`
                }
                value={compactMoney(personalRangeTotal)}
                fullValue={money(personalRangeTotal)}
                tone="neg"
              />
              <Stat
                label="Avg / month"
                value={compactMoney(personalAvgPerMonth)}
                fullValue={money(personalAvgPerMonth)}
              />
              <Stat
                label="Categories"
                value={String(personalAgg.items.length)}
              />
            </div>

            <div className="mb-4">
              <TrendChartCanvas
                mode={personalChartMode}
                data={personalTrend}
                primaryKey="personalOut"
                primaryName="Personal spend"
                secondaryKey="studioOut"
                secondaryName="Studio expenses"
                gradientId="ov-pers"
                xInterval={personalRange === "1m" ? 4 : 0}
                height={150}
              />
            </div>

            {personalAgg.items.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No personal expenses recorded in {personalAgg.scopeLabel}.
              </p>
            ) : (
              <BudgetShelf
                db={db}
                account="Personal"
                month={thisMonth}
                monthLabel={personalAgg.scopeLabel}
                items={personalAgg.items}
                selectedCategory={inspectedCategory}
                onSelectCategory={(cat) => setInspectedCategory(cat)}
                limitScale={personalAgg.monthsCount}
                compact
              />
            )}
            {personalItemsPeriod.length > 0 && (
              <ul className="mt-4 divide-y divide-border border-t border-border pt-2">
                {personalItemsPeriod.map((e) => {
                  const ItemIcon = expenseItemIcon(e);
                  return (
                    <li
                      key={e.id}
                      className="flex items-center justify-between gap-3 py-2 text-xs"
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
                      <span className="shrink-0 font-mono tabular-nums text-destructive">
                        {money(-toUSD(e.amount, e.currency, r))}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
            <Link
              to="/finance"
              className="mt-3 block text-xs text-primary hover:underline"
            >
              Open full Personal Finance ledger →
            </Link>
          </Glass>
        ),
      },
      goalsRings: {
        id: "goalsRings",
        title: "Goals & savings",
        defaultSpan: 6,
        render: () => (
          <Glass delay={160} className="h-full">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-medium">Goals & savings</h2>
              <span className="text-sm text-muted-foreground">
                {db.goals.length} active
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {db.goals.slice(0, 4).map((g, idx) => (
                <GoalRingCard
                  key={g.id}
                  goal={g}
                  current={goalValue(g)}
                  accountLabel={goalAccount(g)}
                  delay={idx * 60}
                  onEdit={() => {}}
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
            <Link
              to="/finance"
              className="mt-4 block text-xs text-muted-foreground hover:text-foreground"
            >
              Manage all {db.goals.length} studio & personal goals in Finance →
            </Link>
          </Glass>
        ),
      },
      recentActivity: {
        id: "recentActivity",
        title: "Recent activity",
        defaultSpan: 12,
        render: () => (
          <Glass delay={200} className="h-full">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-medium">Recent activity</h2>
              <Link
                to="/finance"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                View all →
              </Link>
            </div>
            <ul className="divide-y divide-border">
              {activity.map((a, k) => {
                const OutIcon = a.expense
                  ? expenseItemIcon(a.expense)
                  : ArrowUpRight;
                return (
                  <li
                    key={k}
                    className="rise flex items-center gap-3 py-3"
                    style={{ animationDelay: `${180 + k * 40}ms` }}
                  >
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
                      <p className="truncate text-sm font-medium">{a.title}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {a.sub} · {shortDate(a.date)}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 font-mono text-sm tabular-nums",
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
                <h2 className="font-medium">Project pipeline</h2>
              </div>
              <Link
                to="/projects"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Open board →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {PROJECT_STATUSES.slice(0, 5).map((st) => (
                <Link
                  key={st}
                  to="/projects"
                  className="rounded-2xl border border-border bg-muted p-4 transition-transform hover:-translate-y-0.5"
                >
                  <p className="label-mono">{st}</p>
                  <p className="font-display text-3xl font-black tabular-nums">
                    {db.projects.filter((p) => p.status === st).length}
                  </p>
                </Link>
              ))}
              <Link
                to="/projects"
                className="rounded-2xl border border-primary/50 bg-primary/15 p-4 text-primary transition-transform hover:-translate-y-0.5"
              >
                <p className="font-mono text-[0.68rem] uppercase tracking-wider">
                  Ready to close
                </p>
                <p className="font-display text-3xl font-black tabular-nums">
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
                    <li key={i.id}>
                      <Link
                        to="/invoices/$id"
                        params={{ id: i.id }}
                        className="flex items-center justify-between gap-2 py-2.5 text-xs hover:text-primary"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-mono font-medium">
                            {i.no} · {client?.name ?? "Client"}
                          </p>
                          <p className="text-muted-foreground">
                            Due {shortDate(i.due)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold tabular-nums">
                            {compactMoney(v.balanceUSD)}
                          </span>
                          <Pill s={v.status} />
                        </div>
                      </Link>
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
                      className="font-mono font-semibold tabular-nums"
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
      categoryMixPie: {
        id: "categoryMixPie",
        title: "Category & revenue pie chart",
        defaultSpan: 6,
        render: () => (
          <BreakdownPieCard
            db={db}
            account="Personal"
            personalItems={personalAgg.items}
            studioItems={[]}
            scopeLabel={personalAgg.scopeLabel}
            onSelectCategory={(_acc, cat) => setInspectedCategory(cat)}
          />
        ),
      },
      periodPulse: {
        id: "periodPulse",
        title: "Daily & monthly bar pulse",
        defaultSpan: 6,
        render: () => {
          const slice =
            personalRange === "1m"
              ? personalTrend.filter((p) => p.personalOut > 0).slice(-7)
              : personalTrend.slice(-6);
          return (
            <PeriodBarPulseCard
              title={
                personalRange === "1m"
                  ? "Recent spending days"
                  : "Monthly personal pulse"
              }
              subtitle={
                personalRange === "1m"
                  ? `Active days in ${personalAgg.scopeLabel}`
                  : `Comparison across ${personalAgg.scopeLabel}`
              }
              data={slice.length > 0 ? slice : personalTrend.slice(-7)}
              valueKey="personalOut"
            />
          );
        },
      },
      cardSpend: {
        id: "cardSpend",
        title: "Card spending · Debit vs Credit",
        defaultSpan: 12,
        render: () => (
          <CardSpendingChartCard
            db={db}
            month={thisMonth}
            defaultRange={personalRange}
            layoutIdPrefix="ov-card-spend"
          />
        ),
      },
    }),
    [
      db,
      followUps,
      rangeMeta,
      netRange,
      spark,
      outstanding,
      overdue,
      personalMonthTotal,
      range,
      cashChartMode,
      cashIn,
      cashOut,
      s,
      personalAgg,
      personalRange,
      personalChartMode,
      personalRangeTotal,
      personalAvgPerMonth,
      personalTrend,
      thisMonth,
      inspectedCategory,
      personalItemsPeriod,
      r,
      activity,
      readyToClose,
      openInvoicesList,
      topClientsList,
    ],
  );

  const overviewWidgetList: BentoWidgetDef[] = [
    allWidgets["followUps"]!,
    allWidgets["netProfit"]!,
    allWidgets["cashFlowChart"]!,
    allWidgets["categoryMixPie"]!,
    allWidgets["periodPulse"]!,
    allWidgets["cardSpend"]!,
    allWidgets["personalExpenses"]!,
    allWidgets["goalsRings"]!,
    allWidgets["recentActivity"]!,
    allWidgets["projectPipeline"]!,
  ];

  const currentCustomTab = tabs.find((t) => t.id === activeTab);
  const currentWidgets: BentoWidgetDef[] = currentCustomTab
    ? currentCustomTab.widgetIds
        .map((id) => allWidgets[id])
        .filter((w): w is BentoWidgetDef => Boolean(w))
    : overviewWidgetList;

  const pageKey =
    activeTab === "overview" ? "overview" : `overview:${activeTab}`;

  const toggleNewTabWidget = (id: string) => {
    setNewTabWidgets((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  return (
    <>
      <PageHeader
        title={currentCustomTab ? currentCustomTab.label : "Overview"}
        owner={db.settings.ownerName}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <EditLayoutButton
              editing={editingLayout}
              onToggle={() => setEditingLayout((e) => !e)}
            />
            <Link to="/invoices/$id" params={{ id: "new" }}>
              <Btn variant="gold">
                <Plus className="h-4 w-4" />
                New invoice
              </Btn>
            </Link>
          </div>
        }
      />

      {/* Dashboard Tabs Strip + Add New Tab */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setActiveTab("overview");
              setEditingLayout(false);
            }}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
              activeTab === "overview"
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : "border-border bg-muted/60 text-muted-foreground hover:text-foreground",
            )}
          >
            Overview
          </button>
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={cn(
                "inline-flex items-center rounded-full border text-xs font-medium transition-colors",
                activeTab === tab.id
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border bg-muted/60 text-muted-foreground hover:text-foreground",
              )}
            >
              <button
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setEditingLayout(false);
                }}
                className="px-3.5 py-1.5"
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
                  "mr-1.5 rounded-full p-1 transition-colors",
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
            className="inline-flex items-center gap-1 rounded-full border border-dashed border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground"
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
        onDoneEditing={() => setEditingLayout(false)}
      />

      <CategoryInspectorDrawer
        db={db}
        account="Personal"
        category={inspectedCategory}
        month={thisMonth}
        onClose={() => setInspectedCategory(null)}
      />

      <SlideDrawer
        open={newTabOpen}
        onClose={() => setNewTabOpen(false)}
        title="Add dashboard tab"
        subtitle="Custom workspace"
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
              placeholder="e.g. Daily Personal & Goals"
              value={newTabName}
              onChange={(e) => setNewTabName(e.target.value)}
              required
            />
          </div>
          <div>
            <p className="label-mono mb-2">
              Choose system widgets ({newTabWidgets.length} selected)
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
                        "mt-0.5 shrink-0 rounded-full border px-2 py-0.5 font-mono text-[0.65rem]",
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
