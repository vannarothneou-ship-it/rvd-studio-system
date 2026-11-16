import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  PiggyBank,
  Plus,
  Sparkles,
} from "lucide-react";
import { Btn, Empty, Glass, PageHeader, Stat } from "@/components/rv/ui";
import { EditModal, upsert, type Field } from "@/components/rv/Crud";
import {
  EXPENSE_CATEGORIES,
  PERSONAL_CATEGORIES,
  cashReceived,
  categoryTotals,
  expenseAccount,
  expenseCategoriesFor,
  expenseTotal,
  goalAccount,
  money,
  setDB,
  shortDate,
  toUSD,
  today,
  uid,
  useDB,
  type Account,
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

function Page() {
  const db = useDB((d) => d);
  const r = db.settings.khrRate;
  const [tab, setTab] = useState<Tab>("Studio");
  const [month, setMonth] = useState(() => today().slice(0, 7));
  const [catFilter, setCatFilter] = useState<string>("All");
  const [edit, setEdit] = useState<Expense | null>(null);
  const [goal, setGoal] = useState<Goal | null>(null);

  const year = month.slice(0, 4) || today().slice(0, 4);
  const monthLabel = new Date(month + "-01T00:00:00").toLocaleDateString(
    "en-US",
    { month: "long", year: "numeric" },
  );
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - 5 + i, 1);
    return d.toISOString().slice(0, 7);
  });

  const studioInYear = cashReceived(db, year);
  const studioOutYear = expenseTotal(db, "Studio", year);
  const personalOutYear = expenseTotal(db, "Personal", year);

  const studioInMonth = cashReceived(db, month);
  const studioOutMonth = expenseTotal(db, "Studio", month);
  const personalOutMonth = expenseTotal(db, "Personal", month);

  const series = months.map((m) => ({
    m,
    i: cashReceived(db, m),
    sOut: expenseTotal(db, "Studio", m),
    pOut: expenseTotal(db, "Personal", m),
  }));
  const maxBar = Math.max(1, ...series.flatMap((s) => [s.i, s.sOut, s.pOut]));

  const studioCats = categoryTotals(db, "Studio", month);
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

  const openNewExpense = (account: Account) => {
    setEdit({
      id: uid(),
      date: today(),
      projectId: "",
      category:
        account === "Personal"
          ? PERSONAL_CATEGORIES[0]!
          : EXPENSE_CATEGORIES[0]!,
      vendor: "",
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
    const base: Field<Expense>[] = [
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
      { k: "vendor", label: "Vendor / Merchant" },
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
    return base;
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

  const filteredExpenses = [...db.expenses]
    .filter((e) => {
      const acc = expenseAccount(e);
      if (tab === "Studio" && acc !== "Studio") return false;
      if (tab === "Personal" && acc !== "Personal") return false;
      if (tab === "Personal" && month && !e.date.startsWith(month))
        return false;
      if (catFilter !== "All" && e.category !== catFilter) return false;
      return true;
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  const recentPayments = [...db.payments]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 8);

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

      {/* Account Tabs + Month Selector */}
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
              onClick={() => {
                setTab(t.id);
                setCatFilter("All");
              }}
              className={cn(
                "rounded-full px-3.5 py-1.5 font-medium transition-colors",
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
            onChange={(e) => setMonth(e.target.value || today().slice(0, 7))}
          />
        </div>
      </div>

      {/* KPI Row */}
      {tab === "Studio" && (
        <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Glass>
            <Stat
              label={`Studio Cash In (${year})`}
              tone="pos"
              value={money(studioInYear)}
            />
          </Glass>
          <Glass delay={60}>
            <Stat
              label={`RothVan Expenses (${year})`}
              tone="neg"
              value={money(studioOutYear)}
            />
          </Glass>
          <Glass delay={120} className="col-span-2 sm:col-span-1">
            <Stat
              label={`Studio Profit (${year})`}
              tone={studioInYear - studioOutYear >= 0 ? "pos" : "neg"}
              value={money(studioInYear - studioOutYear)}
            />
          </Glass>
        </div>
      )}

      {tab === "Personal" && (
        <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Glass>
            <Stat
              label={`Personal Spent (${monthLabel})`}
              tone="neg"
              value={money(personalOutMonth)}
            />
          </Glass>
          <Glass delay={60}>
            <Stat
              label={`Personal Spent (${year})`}
              value={money(personalOutYear)}
            />
          </Glass>
          <Glass delay={120} className="col-span-2 sm:col-span-1">
            <Stat
              label="Personal Saving Goals"
              tone="pos"
              value={`${money(personalSavedTotal)} / ${money(personalTargetTotal)}`}
            />
          </Glass>
        </div>
      )}

      {tab === "Combined" && (
        <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Glass>
            <Stat
              label={`Studio Income (${month})`}
              tone="pos"
              value={money(studioInMonth)}
            />
          </Glass>
          <Glass delay={60}>
            <Stat
              label={`Studio Expenses (${month})`}
              value={money(studioOutMonth)}
            />
          </Glass>
          <Glass delay={120}>
            <Stat
              label={`Personal (${month})`}
              tone="neg"
              value={money(personalOutMonth)}
            />
          </Glass>
          <Glass delay={180}>
            <Stat
              label="Net Retained"
              tone={
                studioInMonth - studioOutMonth - personalOutMonth >= 0
                  ? "pos"
                  : "neg"
              }
              value={money(
                studioInMonth - studioOutMonth - personalOutMonth,
                "USD",
                true,
              )}
            />
          </Glass>
        </div>
      )}

      {/* Charts / Category Breakdown + Goals */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        {tab === "Personal" ? (
          <Glass delay={180}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="label-mono">
                  Personal monthly categories · {monthLabel}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Click a category to filter expenses below
                </p>
              </div>
              {catFilter !== "All" && (
                <button
                  onClick={() => setCatFilter("All")}
                  className="rounded-full border border-border px-3 py-1 text-xs hover:bg-accent"
                >
                  Clear filter ({catFilter})
                </button>
              )}
            </div>
            {personalCats.length === 0 ? (
              <Empty>No personal expenses recorded in {monthLabel}.</Empty>
            ) : (
              <div className="space-y-3">
                {personalCats.map((item) => {
                  const pct =
                    personalOutMonth > 0
                      ? Math.round((item.totalUSD / personalOutMonth) * 100)
                      : 0;
                  const active = catFilter === item.category;
                  return (
                    <button
                      key={item.category}
                      onClick={() =>
                        setCatFilter(active ? "All" : item.category)
                      }
                      className={cn(
                        "block w-full rounded-2xl border p-3 text-left transition-colors",
                        active
                          ? "border-primary bg-primary/10"
                          : "border-border/70 bg-muted/40 hover:bg-muted",
                      )}
                    >
                      <div className="mb-1.5 flex items-center justify-between gap-2 text-sm">
                        <span className="font-medium">
                          {item.category}{" "}
                          <span className="text-xs text-muted-foreground">
                            ({item.count})
                          </span>
                        </span>
                        <span className="font-mono text-xs">
                          {money(item.totalUSD)} · {pct}%
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </Glass>
        ) : (
          <Glass delay={180}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <p className="label-mono">
                {tab === "Studio"
                  ? "Last 6 months · Studio Cash In vs RothVan Expenses"
                  : "Last 6 months · Studio vs Personal"}
              </p>
            </div>
            <div className="flex h-44 items-end gap-3">
              {series.map((s) => (
                <div
                  key={s.m}
                  className="flex flex-1 flex-col items-center gap-1"
                >
                  <div className="flex h-36 w-full items-end justify-center gap-1">
                    <div
                      title={`Studio In: ${money(s.i)}`}
                      className="w-1/3 rounded-t-md bg-primary transition-all duration-700"
                      style={{ height: `${(s.i / maxBar) * 100}%` }}
                    />
                    <div
                      title={`Studio Out: ${money(s.sOut)}`}
                      className="w-1/3 rounded-t-md bg-destructive/75 transition-all duration-700"
                      style={{ height: `${(s.sOut / maxBar) * 100}%` }}
                    />
                    {tab === "Combined" && (
                      <div
                        title={`Personal Out: ${money(s.pOut)}`}
                        className="w-1/3 rounded-t-md bg-muted-foreground/65 transition-all duration-700"
                        style={{ height: `${(s.pOut / maxBar) * 100}%` }}
                      />
                    )}
                  </div>
                  <span className="font-mono text-[0.65rem] text-muted-foreground">
                    {new Date(s.m + "-01").toLocaleDateString("en-US", {
                      month: "short",
                    })}
                  </span>
                </div>
              ))}
            </div>
            {studioCats.length > 0 && (
              <div className="mt-4 border-t border-border pt-3">
                <p className="label-mono mb-2">
                  Studio categories ({monthLabel})
                </p>
                <div className="flex flex-wrap gap-2">
                  {studioCats.map((c) => (
                    <button
                      key={c.category}
                      onClick={() =>
                        setCatFilter(
                          catFilter === c.category ? "All" : c.category,
                        )
                      }
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs",
                        catFilter === c.category
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-muted/50 hover:bg-accent",
                      )}
                    >
                      {c.category} · {money(c.totalUSD)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </Glass>
        )}

        {/* Goals Panel */}
        <Glass delay={240}>
          <div className="mb-3 flex items-center justify-between">
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
                    : "All goals"}
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
          {(tab === "Personal"
            ? personalGoals
            : tab === "Studio"
              ? studioGoals
              : db.goals
          ).length === 0 ? (
            <Empty>No saving goals yet.</Empty>
          ) : (
            <ul className="space-y-4">
              {(tab === "Personal"
                ? personalGoals
                : tab === "Studio"
                  ? studioGoals
                  : db.goals
              ).map((g) => {
                const n = goalNow(g);
                const pct = Math.min(
                  100,
                  Math.round((n / (g.target || 1)) * 100),
                );
                const acc = goalAccount(g);
                return (
                  <li
                    key={g.id}
                    className="rounded-2xl border border-border/70 bg-muted/30 p-3"
                  >
                    <button
                      onClick={() => setGoal(g)}
                      className="w-full text-left"
                    >
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <span className="truncate font-medium">
                          {g.name}
                          {tab === "Combined" && (
                            <span className="ml-2 font-mono text-[0.65rem] text-muted-foreground">
                              ({acc})
                            </span>
                          )}
                        </span>
                        <span className="font-mono text-xs">
                          {g.kind === "clients"
                            ? `${n} / ${g.target}`
                            : `${money(n)} / ${money(g.target)}`}
                        </span>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </button>
                    {g.kind === "manual" && (
                      <div className="mt-2.5 flex items-center justify-between">
                        <span className="font-mono text-[0.68rem] text-muted-foreground">
                          {pct}% saved
                        </span>
                        <div className="flex gap-1.5">
                          {[50, 100].map((amt) => (
                            <button
                              key={amt}
                              onClick={() =>
                                setDB((d) => ({
                                  ...d,
                                  goals: d.goals.map((x) =>
                                    x.id === g.id
                                      ? { ...x, current: x.current + amt }
                                      : x,
                                  ),
                                }))
                              }
                              className="rounded-full border border-border px-2.5 py-0.5 text-[0.7rem] hover:border-primary hover:bg-accent"
                            >
                              +${amt}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Glass>
      </div>

      {/* Studio Auto-Synced Income (from Invoice Payments) */}
      {tab !== "Personal" && (
        <Glass delay={270} className="mt-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="label-mono">
              Recent Studio Income (auto-synced from invoice payments)
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

      {/* Expenses Ledger */}
      <Glass delay={300} className="mt-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="label-mono">
            {tab === "Personal"
              ? `Personal expenses · ${monthLabel}`
              : tab === "Studio"
                ? "RothVan Design expenses"
                : "All studio & personal expenses"}
            {catFilter !== "All" ? ` · ${catFilter}` : ""}
          </p>
          <Btn
            onClick={() =>
              openNewExpense(tab === "Personal" ? "Personal" : "Studio")
            }
            className="px-3 py-1 text-xs"
          >
            <Plus className="h-3 w-3" />
            Add {tab === "Personal" ? "personal" : "studio"}
          </Btn>
        </div>
        {filteredExpenses.length === 0 ? (
          <Empty>No expenses match this filter.</Empty>
        ) : (
          <ul className="divide-y divide-border">
            {filteredExpenses.map((e) => {
              const acc = expenseAccount(e);
              const proj = e.projectId
                ? db.projects.find((p) => p.id === e.projectId)
                : undefined;
              return (
                <li key={e.id}>
                  <button
                    onClick={() => setEdit(e)}
                    className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl px-2 py-3 text-left hover:bg-muted"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-border bg-muted text-destructive">
                        <ArrowUpRight className="h-4 w-4" />
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
        )}
      </Glass>

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
