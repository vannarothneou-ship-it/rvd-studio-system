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
  Plus,
  Target,
} from "lucide-react";
import { Btn, Glass, PageHeader, Stat } from "@/components/rv/ui";
import {
  PROJECT_STATUSES,
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
          "Cash profit, cash flow, goals and project pipeline for RothVan Design.",
      },
      { property: "og:title", content: "Overview · RothVan Studio" },
      {
        property: "og:description",
        content:
          "Cash profit, cash flow, goals and project pipeline for RothVan Design.",
      },
    ],
  }),
  component: Overview,
});

function monthKey(d: string) {
  return d.slice(0, 7);
}
function lastMonths(n: number) {
  const out: string[] = [];
  const d = new Date();
  d.setDate(1);
  for (let i = n - 1; i >= 0; i--) {
    const x = new Date(d);
    x.setMonth(d.getMonth() - i);
    out.push(x.toISOString().slice(0, 7));
  }
  return out;
}
function series(db: DB, n: number) {
  const r = db.settings.khrRate;
  return lastMonths(n).map((m) => {
    const inn = db.payments
      .filter((p) => monthKey(p.date) === m)
      .reduce((s, p) => s + toUSD(p.amount, p.currency, r), 0);
    const out = db.expenses
      .filter((e) => expenseAccount(e) === "Studio" && monthKey(e.date) === m)
      .reduce((s, e) => s + toUSD(e.amount, e.currency, r), 0);
    return {
      m,
      label: new Date(m + "-01T00:00:00").toLocaleDateString("en-US", {
        month: "short",
      }),
      inn,
      out,
      net: inn - out,
    };
  });
}

function Overview() {
  const db = useDB((d) => d);
  const [range, setRange] = useState<6 | 12>(12);
  const s12 = series(db, 12);
  const s = range === 6 ? s12.slice(6) : s12;
  const net12 = s12.reduce((a, x) => a + x.net, 0);
  let run = 0;
  const spark = s12.map((x) => ({ v: (run += x.net) }));
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
  const personalMonth = expenseTotal(db, "Personal", thisMonth);

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
      };
    }),
    ...db.expenses.map((e) => ({
      date: e.date,
      title: e.vendor || e.description,
      sub: `${expenseAccount(e)} · ${e.category}`,
      amt: -toUSD(e.amount, e.currency, r),
      kind: "out" as const,
    })),
    ...db.invoices.filter(isInvoice).map((i) => ({
      date: i.issue,
      title: `Invoice ${i.no}`,
      sub: `Issued · ${db.clients.find((c) => c.id === i.clientId)?.name ?? ""}`,
      amt: invoiceView(i, db).totalUSD,
      kind: "inv" as const,
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
        ? new Set(
            db.invoices
              .filter((i) => isInvoice(i) && i.issue.startsWith(year))
              .map((i) => i.clientId),
          ).size
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
            Studio net cash profit, last 12 months
          </p>
          <p
            className={cn(
              "mt-2 font-display text-4xl font-black",
              net12 < 0 && "text-destructive",
            )}
          >
            {money(net12)}
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
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-medium">Studio cash flow</h2>
            <div className="flex rounded-full border border-border bg-muted p-1 text-xs">
              {[6, 12].map((n) => (
                <button
                  key={n}
                  onClick={() => setRange(n as 6 | 12)}
                  className={cn(
                    "rounded-full px-3 py-1 transition-colors",
                    range === n
                      ? "bg-foreground text-background"
                      : "text-muted-foreground",
                  )}
                >
                  {n} months
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
                />
                <Area
                  name="Studio expenses"
                  dataKey="out"
                  type="monotone"
                  stroke="var(--muted-foreground)"
                  strokeDasharray="5 5"
                  fill="transparent"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Glass>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <Glass delay={140}>
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
            {activity.map((a, k) => (
              <li
                key={k}
                className="flex items-center gap-3 py-3 rise"
                style={{ animationDelay: `${180 + k * 40}ms` }}
              >
                <span
                  className={cn(
                    "grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border bg-muted",
                    a.kind === "in" && "text-positive",
                  )}
                >
                  {a.kind === "in" ? (
                    <ArrowDownLeft className="h-4 w-4" />
                  ) : a.kind === "out" ? (
                    <ArrowUpRight className="h-4 w-4" />
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
            ))}
          </ul>
        </Glass>
        <Glass delay={200}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-medium">Goals & savings</h2>
            <span className="text-sm text-muted-foreground">
              {db.goals.length} active
            </span>
          </div>
          <div className="space-y-5">
            {db.goals.map((g) => {
              const v = goalValue(g);
              const pct = Math.min(
                100,
                Math.round((v / (g.target || 1)) * 100),
              );
              const isMoney = g.kind !== "clients";
              return (
                <div key={g.id}>
                  <div className="mb-2 flex items-center gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border">
                      <Target className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">
                      {g.name}{" "}
                      <span className="font-mono text-[0.65rem] text-muted-foreground">
                        ({goalAccount(g)})
                      </span>
                    </span>
                    <span className="font-mono text-xs">{pct}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="grow-bar h-full rounded-full bg-primary"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                    <span>{isMoney ? money(v) : v}</span>
                    <span>of {isMoney ? money(g.target) : g.target}</span>
                  </div>
                  {g.kind === "manual" && (
                    <button
                      onClick={() =>
                        setDB((d) => ({
                          ...d,
                          goals: d.goals.map((x) =>
                            x.id === g.id
                              ? { ...x, current: x.current + 100 }
                              : x,
                          ),
                        }))
                      }
                      className="mt-2 inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs hover:bg-accent"
                    >
                      <Plus className="h-3 w-3" />
                      Add $100
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          <Link
            to="/finance"
            className="mt-4 block text-xs text-muted-foreground hover:text-foreground"
          >
            Manage studio & personal goals in Finance →
          </Link>
        </Glass>
      </div>

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
