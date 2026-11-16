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
import {
  ArrowDownLeft,
  ArrowUpRight,
  FileText,
  PiggyBank,
  Plus,
} from "lucide-react";
import { Btn, Glass, PageHeader, Stat } from "@/components/rv/ui";
import {
  AnimatedNumber,
  BudgetShelf,
  CategoryInspectorDrawer,
  GoalRingCard,
  expenseItemIcon,
} from "@/components/rv/FinanceVisuals";
import {
  PROJECT_STATUSES,
  cashFlowSeries,
  categoryTotals,
  documentKind,
  expenseAccount,
  expenseTotal,
  goalAccount,
  invoiceView,
  isInvoice,
  needsFollowUp,
  money,
  setDB,
  shortDate,
  toUSD,
  today,
  useDB,
  type CashRange,
  type DB,
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

function Overview() {
  const db = useDB((d) => d);
  const [range, setRange] = useState<CashRange>("all");
  const [inspectedCategory, setInspectedCategory] = useState<string | null>(
    null,
  );
  const s = cashFlowSeries(db, range);
  const rangeMeta = RANGE_OPTIONS.find((o) => o.id === range)!;
  const netRange = s.reduce((a, x) => a + x.net, 0);
  let run = 0;
  const spark = s.map((x) => ({ v: (run += x.net) }));

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
  const thisMonthLabel = new Date(
    thisMonth + "-01T00:00:00Z",
  ).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  const personalMonth = expenseTotal(db, "Personal", thisMonth);
  const personalCats = categoryTotals(db, "Personal", thisMonth);
  const personalItemsMonth = [...db.expenses]
    .filter(
      (e) => expenseAccount(e) === "Personal" && e.date.startsWith(thisMonth),
    )
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 4);
  const s6 = cashFlowSeries(db, "6m");
  const personal6Avg =
    s6.reduce((a, x) => a + x.personalOut, 0) / (s6.length || 1);

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

  return (
    <>
      <PageHeader
        title="Overview"
        owner={db.settings.ownerName}
        action={
          <Link to="/invoices/$id" params={{ id: "new" }}>
            <Btn variant="gold">
              <Plus className="h-4 w-4" />
              New invoice
            </Btn>
          </Link>
        }
      />
      <section className="mb-6 border-y border-border py-4">
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
                  documentKind(i) === "Agreement" && i.response !== "Accepted",
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
                  className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
                >
                  <span>
                    {db.clients.find((c) => c.id === i.clientId)?.name} · {i.no}
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
      </section>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,8fr)]">
        <Glass className="flex flex-col">
          <p className="text-sm text-muted-foreground">
            Studio net cash profit, {rangeMeta.desc}
          </p>
          <p
            className={cn(
              "mt-2 font-display text-4xl font-black",
              netRange < 0 && "text-destructive",
            )}
          >
            <AnimatedNumber value={netRange} />
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Studio cash received minus RothVan Design expenses
          </p>
          <div className="my-4 h-24 flex-1">
            <ResponsiveContainer>
              <AreaChart data={spark}>
                <defs>
                  <linearGradient id="sp" x1="0" y1="0" x2="0" y2="1">
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
                  dataKey="v"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  fill="url(#sp)"
                  type="monotone"
                  animationDuration={750}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-3 border-t border-border pt-4">
            <Link to="/invoices">
              <Stat label="Outstanding" value={money(outstanding)} />
            </Link>
            <Link to="/invoices">
              <Stat
                label="Overdue"
                value={money(overdue)}
                tone={overdue > 0 ? "neg" : undefined}
              />
            </Link>
            <Link to="/finance">
              <Stat label="Personal (mo)" value={money(personalMonth)} />
            </Link>
          </div>
        </Glass>
        <Glass delay={80}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-medium">Studio cash flow</h2>
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
          <div className="mb-3 grid grid-cols-3 gap-3">
            <Stat label="● Cash in" value={money(cashIn)} />
            <Stat label="○ Studio out" value={money(cashOut)} />
            <Stat
              label="Net"
              value={money(cashIn - cashOut, "USD", true)}
              tone={cashIn - cashOut >= 0 ? "pos" : "neg"}
            />
          </div>
          <div className="h-56">
            <ResponsiveContainer>
              <AreaChart data={s} margin={{ left: -18, right: 4, top: 8 }}>
                <defs>
                  <linearGradient id="cf" x1="0" y1="0" x2="0" y2="1">
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
                <Area
                  name="Cash in"
                  dataKey="inn"
                  type="monotone"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  fill="url(#cf)"
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
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Glass>
      </div>

      {/* Personal Monthly Expenses + Goals & Savings */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Glass delay={120}>
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <PiggyBank className="h-4 w-4 text-primary" />
              <h2 className="font-medium">
                Personal expenses · {thisMonthLabel}
              </h2>
            </div>
            <Link
              to="/finance"
              className="text-sm text-primary hover:underline"
            >
              Finance →
            </Link>
          </div>
          <div className="mb-4 grid grid-cols-3 gap-3 border-b border-border pb-4">
            <Stat label="Spent (mo)" value={money(personalMonth)} tone="neg" />
            <Stat label="6m avg / mo" value={money(personal6Avg)} />
            <Stat label="Categories" value={String(personalCats.length)} />
          </div>
          {personalCats.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No personal expenses recorded this month.
            </p>
          ) : (
            <BudgetShelf
              db={db}
              account="Personal"
              month={thisMonth}
              monthLabel={thisMonthLabel}
              items={personalCats}
              selectedCategory={inspectedCategory}
              onSelectCategory={(cat) => setInspectedCategory(cat)}
              compact
            />
          )}
          {personalItemsMonth.length > 0 && (
            <ul className="mt-4 divide-y divide-border border-t border-border pt-2">
              {personalItemsMonth.map((e) => {
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
                    <span className="shrink-0 font-mono text-destructive">
                      {money(-toUSD(e.amount, e.currency, r))}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Glass>

        <Glass delay={160}>
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
      </div>

      <Glass delay={200} className="mt-4">
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
                className="flex items-center gap-3 py-3 rise"
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
                    "shrink-0 font-mono text-sm",
                    a.kind === "in" && "text-positive",
                    a.kind === "out" && "text-destructive",
                    a.kind === "inv" && "text-muted-foreground",
                  )}
                >
                  {a.kind === "inv" ? money(a.amt) : money(a.amt, "USD", true)}
                </span>
              </li>
            );
          })}
        </ul>
      </Glass>

      <CategoryInspectorDrawer
        db={db}
        account="Personal"
        category={inspectedCategory}
        month={thisMonth}
        onClose={() => setInspectedCategory(null)}
      />

      <Glass delay={260} className="mt-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-medium">Project pipeline</h2>
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
              <p className="font-display text-3xl font-black">
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
            <p className="font-display text-3xl font-black">{readyToClose}</p>
          </Link>
        </div>
      </Glass>
    </>
  );
}
