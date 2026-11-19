import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  CheckCircle2,
  Eye,
  EyeOff,
  FileText,
  Image as ImageIcon,
  Layers3,
  Plus,
  ScanLine,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import {
  Btn,
  F,
  Glass,
  PageHeader,
  Pill,
  Sel,
  SlideDrawer,
  SlidingTabs,
  Stat,
} from "@/components/rv/ui";
import { nextCode, upsert } from "@/components/rv/Crud";
import {
  AnimatedNumber,
  CategoryInspectorDrawer,
  expenseItemIcon,
  incomeSourceIcon,
} from "@/components/rv/FinanceVisuals";
import { MoneyFlowSankeyCard } from "@/components/rv/MoneyFlowSankey";
import {
  CHART_LENS_OPTIONS,
  ChartModeCycleButton,
  TrendChartCanvas,
  type ChartLens,
  type ChartMode,
} from "@/components/rv/Charts";
import { DesignMediaUploader } from "@/components/rv/DesignMediaTools";
import {
  QuickExpenseDrawer,
  QuickIncomeDrawer,
} from "@/components/rv/QuickTxDrawer";
import { useReceiptScanner } from "@/components/rv/ReceiptScanner";
import {
  DEFAULT_WORK_PROJECTS,
  DESIGN_TYPES,
  PERSONAL_CATEGORIES,
  WORK_STATUSES,
  compactMoney,
  designOutputSummary,
  expenseAccount,
  money,
  periodBreakdownBars,
  personalSeries,
  setDB,
  shortDate,
  toUSD,
  today,
  uid,
  useDB,
  workspaceBalances,
  type Account,
  type CashRange,
  type Expense,
  type PersonalIncome,
  type WorkStatus,
  type WorkTask,
} from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { title: "Dashboard · RothVan Ledger" },
      {
        name: "description",
        content:
          "Personal expense tracker, income overview, AI receipt scanner, and work portfolio.",
      },
      { property: "og:title", content: "Dashboard · RothVan Ledger" },
      {
        property: "og:description",
        content:
          "Personal expense tracker, income overview, AI receipt scanner, and work portfolio.",
      },
    ],
  }),
  component: CommandDashboard,
});

const CASH_RANGES: { id: CashRange; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "week", label: "Week" },
  { id: "6m", label: "6m" },
  { id: "12m", label: "12m" },
  { id: "all", label: "All" },
];

type FeedScope = "all" | "Studio" | "Personal" | "Work";

function CommandDashboard() {
  const db = useDB((d) => d);
  const navigate = useNavigate();
  const { openScanner } = useReceiptScanner();

  const [hideBalances, setHideBalances] = useState(false);
  useEffect(() => {
    setHideBalances(localStorage.getItem("rv-hide-bal") === "1");
  }, []);
  const toggleHideBalances = () => {
    setHideBalances((prev) => {
      const next = !prev;
      localStorage.setItem("rv-hide-bal", next ? "1" : "0");
      return next;
    });
  };

  const [cashRange, setCashRange] = useState<CashRange>("today");
  const [cashMode, setCashMode] = useState<ChartMode>("area");
  const [cashLens, setCashLens] = useState<ChartLens>("flow");
  const [feedScope, setFeedScope] = useState<FeedScope>("all");
  const [feedExpanded, setFeedExpanded] = useState(false);

  const [expenseDraft, setExpenseDraft] = useState<Expense | null>(null);
  const [incomeDraft, setIncomeDraft] = useState<PersonalIncome | null>(null);
  const [workTaskDraft, setWorkTaskDraft] = useState<WorkTask | null>(null);
  const [inspectedCategory, setInspectedCategory] = useState<{
    account: Account;
    category: string;
  } | null>(null);

  const month = today().slice(0, 7);
  const bal = useMemo(() => workspaceBalances(db, month), [db, month]);
  const output = useMemo(() => designOutputSummary(db), [db]);

  const personalTrend = useMemo(
    () => personalSeries(db, cashRange === "all" ? "12m" : cashRange, month),
    [db, cashRange, month],
  );
  const breakdownBars = useMemo(
    () =>
      periodBreakdownBars(
        db,
        "Personal",
        cashRange,
        month,
        cashLens === "method" ? "method" : "category",
        "spending",
      ),
    [db, cashRange, month, cashLens],
  );

  const projectNames = useMemo(() => {
    const base = db.settings.workProjects?.length
      ? db.settings.workProjects
      : [...DEFAULT_WORK_PROJECTS];
    const extra = (db.workTasks ?? [])
      .map((t) => (t.projectName || t.company || "").trim())
      .filter(Boolean);
    return Array.from(new Set([...base, ...extra]));
  }, [db.settings.workProjects, db.workTasks]);

  const r = db.settings.khrRate || 4100;

  const studioActiveProjects = useMemo(
    () =>
      db.projects.filter(
        (p) =>
          p.status === "Inquiry" ||
          p.status === "Quoted" ||
          p.status === "In production",
      ).length,
    [db.projects],
  );

  // Unified activity feed across Studio, Personal & Work
  const unifiedFeed = useMemo(() => {
    type FeedItem = {
      id: string;
      date: string;
      scope: "Studio" | "Personal" | "Work";
      title: string;
      sub: string;
      badge?: string;
      amount?: number;
      direction?: "in" | "out";
      expense?: Expense;
      income?: PersonalIncome;
      workTask?: WorkTask;
      invoiceId?: string;
    };

    const items: FeedItem[] = [];

    for (const p of db.payments) {
      const inv = db.invoices.find((i) => i.id === p.invoiceId);
      const client = db.clients.find((c) => c.id === inv?.clientId);
      items.push({
        id: `pay-${p.id}`,
        date: p.date,
        scope: "Studio",
        title: `${client?.name ?? "Client"} · ${inv?.no ?? "Payment"}`,
        sub: `${p.method}${p.reference ? ` · ${p.reference}` : ""}`,
        amount: toUSD(p.amount, p.currency, r),
        direction: "in",
        invoiceId: p.invoiceId,
      });
    }

    for (const inc of db.personalIncome ?? []) {
      items.push({
        id: `inc-${inc.id}`,
        date: inc.date,
        scope: "Personal",
        title: inc.description || inc.source,
        sub: `${inc.source} · ${inc.accountMethod}`,
        amount: toUSD(inc.amount, inc.currency, r),
        direction: "in",
        income: inc,
      });
    }

    for (const e of db.expenses) {
      const acc = expenseAccount(e);
      items.push({
        id: `exp-${e.id}`,
        date: e.date,
        scope: acc,
        title: e.description || e.vendor || e.category,
        sub: `${e.category}${e.vendor ? ` · ${e.vendor}` : ""}`,
        amount: -toUSD(e.amount, e.currency, r),
        direction: "out",
        expense: e,
      });
    }

    for (const wt of db.workTasks ?? []) {
      const dt = wt.completedDate || wt.dueDate || wt.startDate || today();
      items.push({
        id: `wt-${wt.id}`,
        date: dt,
        scope: "Work",
        title: `${wt.projectName || wt.company || "Work"} · ${wt.title}`,
        sub: `${wt.designType} · ${wt.artworkCount} pcs`,
        badge: wt.status,
        workTask: wt,
      });
    }

    return items.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 40);
  }, [
    db.payments,
    db.invoices,
    db.clients,
    db.personalIncome,
    db.expenses,
    db.workTasks,
    r,
  ]);

  const mask = (formatted: string) => (hideBalances ? "••••••" : formatted);

  const openNewExpense = () =>
    setExpenseDraft({
      id: uid(),
      date: today(),
      projectId: "",
      category: PERSONAL_CATEGORIES[0] ?? "Food",
      vendor: "Debit",
      description: "",
      amount: 0,
      currency: "USD",
      receipt: "",
      account: "Personal",
    });

  const openNewIncome = () =>
    setIncomeDraft({
      id: uid(),
      date: today(),
      source: "Salary",
      accountMethod: "Debit",
      description: "",
      amount: 0,
      currency: "USD",
    });

  const openNewWorkTask = (portfolioPreset = false) => {
    const d = today();
    setWorkTaskDraft({
      id: uid(),
      code: nextCode(
        "WRK-",
        (db.workTasks ?? []).map((t) => t.code),
        1,
      ),
      title: "",
      status: portfolioPreset ? "Completed" : "Current",
      designType: DESIGN_TYPES[0],
      artworkCount: 1,
      projectName: projectNames[0] ?? "DBG",
      company: projectNames[0] ?? "DBG",
      startDate: d,
      dueDate: d,
      completedDate: portfolioPreset ? d : "",
      notes: "",
      media: [],
      featured: portfolioPreset,
    });
  };

  const showcaseWithMedia = useMemo(
    () =>
      output.items
        .filter((it) => it.media.some((m) => m.kind === "image" && m.dataUrl))
        .slice(0, 4),
    [output.items],
  );

  const cashTotals = {
    inVal: personalTrend.reduce((s, p) => s + p.personalIn, 0),
    outVal: personalTrend.reduce((s, p) => s + p.personalOut, 0),
    netVal: personalTrend.reduce((s, p) => s + p.net, 0),
  };

  const isGrouped = cashLens === "category" || cashLens === "method";
  const chartRows = isGrouped
    ? breakdownBars
    : personalTrend.map((pt) => ({
        label: pt.label,
        fullDate: pt.fullDate,
        primary: cashLens === "net" ? pt.net : pt.personalIn,
        secondary: pt.personalOut,
        inCount: pt.inCount,
        count: pt.count,
      }));

  const primaryLabel =
    cashLens === "category"
      ? "Spending by category"
      : cashLens === "method"
        ? "Spending by card"
        : cashLens === "net"
          ? "Net cash flow"
          : "Personal income";
  const secondaryLabel = isGrouped ? "Income" : "Personal out";

  const filteredFeed =
    feedScope === "all"
      ? unifiedFeed
      : unifiedFeed.filter((it) => it.scope === feedScope);
  const visibleFeed = filteredFeed.slice(0, feedExpanded ? 24 : 8);

  return (
    <>
      <PageHeader title="Dashboard" owner={db.settings.ownerName} />

      {/* Hero Personal Balance + Banking Quick Tiles */}
      <Glass className="mb-4 overflow-hidden border-primary/25 bg-gradient-to-br from-primary/12 via-card/85 to-card/70">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Wallet className="h-3.5 w-3.5 shrink-0 text-primary" />
                <span className="font-semibold text-foreground">
                  Personal Balance
                </span>
              </div>
              <button
                type="button"
                onClick={toggleHideBalances}
                aria-label={hideBalances ? "Show balances" : "Hide balances"}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border/80 bg-background/45 text-muted-foreground transition-colors hover:text-foreground"
              >
                {hideBalances ? (
                  <Eye className="h-3.5 w-3.5" />
                ) : (
                  <EyeOff className="h-3.5 w-3.5" />
                )}
              </button>
            </div>

            <div className="mt-1.5 flex flex-wrap items-baseline gap-2.5">
              <p
                className={cn(
                  "font-num text-3xl font-extrabold tracking-tight sm:text-5xl",
                  bal.personalBalance >= 0
                    ? "text-foreground"
                    : "text-destructive",
                )}
                title={hideBalances ? "Hidden" : money(bal.personalBalance)}
              >
                {hideBalances ? (
                  "••••••"
                ) : (
                  <AnimatedNumber value={bal.personalBalance} />
                )}
              </p>
              <span
                className={cn(
                  "font-num text-xs font-semibold",
                  bal.personalMonthNet >= 0
                    ? "text-positive"
                    : "text-destructive",
                )}
              >
                {hideBalances
                  ? "Month ••••"
                  : `${money(bal.personalMonthNet, "USD", true)} this mo`}
              </span>
            </div>

            <p className="font-num mt-1 text-xs text-muted-foreground">
              Studio {mask(compactMoney(bal.studioBalance))} · Open A/R{" "}
              {mask(compactMoney(bal.openAR))} · {output.workCompleted} work
              done
            </p>
          </div>

          {/* 4 Aligned Quick Action Tiles */}
          <div className="grid grid-cols-4 gap-2 lg:w-[25rem] lg:shrink-0">
            <button
              type="button"
              onClick={() => openScanner("Personal")}
              className="flex min-h-[60px] flex-col items-center justify-center gap-1 rounded-2xl border border-primary/45 bg-primary/18 px-2 py-2.5 text-[0.72rem] font-semibold text-primary transition-transform hover:-translate-y-0.5 active:scale-95"
            >
              <ScanLine className="h-4 w-4 shrink-0" />
              <span className="whitespace-nowrap">Scan</span>
            </button>
            <button
              type="button"
              onClick={openNewExpense}
              className="flex min-h-[60px] flex-col items-center justify-center gap-1 rounded-2xl border border-border bg-secondary/75 px-2 py-2.5 text-[0.72rem] font-semibold text-foreground transition-colors hover:border-primary/40 hover:bg-accent active:scale-95"
            >
              <ArrowUpRight className="h-4 w-4 shrink-0 text-destructive" />
              <span className="whitespace-nowrap">Expense</span>
            </button>
            <button
              type="button"
              onClick={openNewIncome}
              className="flex min-h-[60px] flex-col items-center justify-center gap-1 rounded-2xl border border-border bg-secondary/75 px-2 py-2.5 text-[0.72rem] font-semibold text-foreground transition-colors hover:border-primary/40 hover:bg-accent active:scale-95"
            >
              <ArrowDownLeft className="h-4 w-4 shrink-0 text-positive" />
              <span className="whitespace-nowrap">Income</span>
            </button>
            <Link
              to="/invoices/$id"
              params={{ id: "new" }}
              className="flex min-h-[60px] flex-col items-center justify-center gap-1 rounded-2xl border border-border bg-secondary/75 px-2 py-2.5 text-[0.72rem] font-semibold text-foreground transition-colors hover:border-primary/40 hover:bg-accent active:scale-95"
            >
              <FileText className="h-4 w-4 shrink-0 text-primary" />
              <span className="whitespace-nowrap">Invoice</span>
            </Link>
          </div>
        </div>
      </Glass>

      {/* Symmetrical Middle Command Cards: Studio · Personal Money · Work & Portfolio */}
      <div className="mb-4 grid grid-cols-1 items-stretch gap-4 lg:grid-cols-3">
        {/* 1. Studio Card */}
        <Glass className="flex flex-col justify-between gap-4">
          <div className="flex flex-col gap-3.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-primary/35 bg-primary/15 text-primary">
                  <Briefcase className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <h2 className="truncate font-display text-lg font-bold leading-tight">
                    Studio
                  </h2>
                  <p className="hidden text-[0.7rem] text-muted-foreground sm:block">
                    Clients, invoices &amp; projects
                  </p>
                </div>
              </div>
              <Link
                to="/studio"
                className="inline-flex min-h-[36px] shrink-0 items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                Open <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 rounded-2xl bg-muted/35 p-3.5">
              <Stat
                label="Cash in"
                value={mask(compactMoney(bal.studioInAll))}
                fullValue={hideBalances ? undefined : money(bal.studioInAll)}
                tone="pos"
              />
              <Stat
                label="Studio out"
                value={mask(compactMoney(bal.studioOutAll))}
                fullValue={hideBalances ? undefined : money(bal.studioOutAll)}
              />
              <Stat
                label="Open A/R"
                value={mask(compactMoney(bal.openAR))}
                fullValue={hideBalances ? undefined : money(bal.openAR)}
              />
              <Stat label="Active" value={String(studioActiveProjects)} />
            </div>
          </div>

          <div className="mt-auto flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/invoices/$id"
                params={{ id: "new" }}
                className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-primary/40 bg-primary/15 px-3 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground active:scale-95"
              >
                <Plus className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">Invoice</span>
              </Link>
              <Link
                to="/clients"
                className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-border bg-secondary/75 px-3 text-xs font-medium text-foreground transition-colors hover:border-primary/45 hover:bg-accent active:scale-95"
              >
                <Users className="h-3.5 w-3.5 shrink-0 text-primary" />
                <span className="truncate">Clients</span>
              </Link>
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-border/60 pt-3 text-xs text-muted-foreground">
              <span className="font-num truncate">
                Net {mask(compactMoney(bal.studioMonthNet, "USD", true))}
              </span>
              <Link
                to="/projects"
                className="shrink-0 font-medium text-primary hover:underline"
              >
                Projects →
              </Link>
            </div>
          </div>
        </Glass>
        {/* 1. Personal Money Card */}
        <Glass className="flex flex-col justify-between gap-4">
          <div className="flex flex-col gap-3.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-positive/35 bg-positive/15 text-positive">
                  <Wallet className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <h2 className="truncate font-display text-lg font-bold leading-tight">
                    Personal Money
                  </h2>
                  <p className="hidden text-[0.7rem] text-muted-foreground sm:block">
                    Debit, Credit &amp; daily spending
                  </p>
                </div>
              </div>
              <Link
                to="/personal"
                className="inline-flex min-h-[36px] shrink-0 items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                Open <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 rounded-2xl bg-muted/35 p-3.5">
              <Stat
                label="Wallet"
                value={mask(compactMoney(bal.personalBalance))}
                fullValue={
                  hideBalances ? undefined : money(bal.personalBalance)
                }
                tone={bal.personalBalance >= 0 ? "pos" : "neg"}
              />
              <Stat
                label="Month in"
                value={mask(compactMoney(bal.personalInMonth))}
                fullValue={
                  hideBalances ? undefined : money(bal.personalInMonth)
                }
                tone={bal.personalInMonth > 0 ? "pos" : undefined}
              />
              <Stat
                label="Month out"
                value={mask(compactMoney(bal.personalOutMonth))}
                fullValue={
                  hideBalances ? undefined : money(bal.personalOutMonth)
                }
                tone="neg"
              />
              <Stat
                label="Goals saved"
                value={mask(compactMoney(bal.personalGoalsSaved))}
                fullValue={
                  hideBalances ? undefined : money(bal.personalGoalsSaved)
                }
              />
            </div>
          </div>

          <div className="mt-auto flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={openNewExpense}
                className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-primary/40 bg-primary/15 px-3 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground active:scale-95"
              >
                <Plus className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">Expense</span>
              </button>
              <button
                type="button"
                onClick={openNewIncome}
                className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-border bg-secondary/75 px-3 text-xs font-medium text-foreground transition-colors hover:border-primary/45 hover:bg-accent active:scale-95"
              >
                <ArrowDownLeft className="h-3.5 w-3.5 shrink-0 text-positive" />
                <span className="truncate">Income</span>
              </button>
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-border/60 pt-3 text-xs text-muted-foreground">
              <span className="font-num truncate">
                Net {mask(compactMoney(bal.personalMonthNet, "USD", true))}
              </span>
              <Link
                to="/personal"
                className="shrink-0 font-medium text-primary hover:underline"
              >
                Cards &amp; Budget →
              </Link>
            </div>
          </div>
        </Glass>

        {/* 2. Work & Portfolio Card */}
        <Glass className="flex flex-col justify-between gap-4" delay={60}>
          <div className="flex flex-col gap-3.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-primary/35 bg-primary/15 text-primary">
                  <Layers3 className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <h2 className="truncate font-display text-lg font-bold leading-tight">
                    Work &amp; Portfolio
                  </h2>
                  <p className="hidden text-[0.7rem] text-muted-foreground sm:block">
                    Tasks, calendar &amp; artwork archive
                  </p>
                </div>
              </div>
              <Link
                to="/work"
                className="inline-flex min-h-[36px] shrink-0 items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                Open <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 rounded-2xl bg-muted/35 p-3.5">
              <Stat
                label="Completed"
                value={String(output.workCompleted)}
                tone="pos"
              />
              <Stat label="Current tasks" value={String(output.workActive)} />
              <Stat label="Artworks" value={String(output.totalArtworks)} />
              <Stat label="Mockups / PDF" value={String(output.mediaCount)} />
            </div>
          </div>

          <div className="mt-auto flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => openNewWorkTask(false)}
                className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-primary/40 bg-primary/15 px-3 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground active:scale-95"
              >
                <Plus className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">Work Task</span>
              </button>
              <button
                type="button"
                onClick={() => openNewWorkTask(true)}
                className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-border bg-secondary/75 px-3 text-xs font-medium text-foreground transition-colors hover:border-primary/45 hover:bg-accent active:scale-95"
              >
                <ImageIcon className="h-3.5 w-3.5 shrink-0 text-primary" />
                <span className="truncate">Portfolio</span>
              </button>
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-border/60 pt-3 text-xs text-muted-foreground">
              <span className="font-num truncate">
                {projectNames.slice(0, 3).join(" · ")}
              </span>
              <Link
                to="/work"
                className="shrink-0 font-medium text-primary hover:underline"
              >
                Calendar &amp; Summary →
              </Link>
            </div>
          </div>
        </Glass>
      </div>

      {/* Money Flow Sankey ("The River") */}
      <MoneyFlowSankeyCard
        db={db}
        accountScope="all"
        anchorMonth={month}
        hideBalances={hideBalances}
        onSelectCategory={(account, category) =>
          setInspectedCategory({ account, category })
        }
        onQuickLog={(kind) =>
          kind === "income" ? openNewIncome() : openNewExpense()
        }
        layoutIdPrefix="dash-money-flow"
        className="mb-4"
      />

      {/* Interactive Cash Flow + Recent Activity */}
      <div
        id="dashboard-cashflow"
        className="mb-4 grid scroll-mt-20 grid-cols-1 items-stretch gap-4 lg:grid-cols-12"
      >
        <Glass className="flex flex-col justify-between lg:col-span-7">
          <div>
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="font-medium">
                {cashLens === "net"
                  ? "Net Flow"
                  : cashLens === "category"
                    ? "By Category"
                    : cashLens === "method"
                      ? "By Card"
                      : "Cash Flow"}
              </h2>
              <ChartModeCycleButton mode={cashMode} onChange={setCashMode} />
            </div>

            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <SlidingTabs
                stretch
                size="xs"
                tone="invert"
                layoutGroup="dash-cf-range"
                className="w-full sm:w-auto"
                value={cashRange}
                onChange={setCashRange}
                options={CASH_RANGES}
              />
              <SlidingTabs
                stretch
                size="xs"
                layoutGroup="dash-cf-lens"
                className="w-full sm:w-auto"
                value={cashLens}
                onChange={setCashLens}
                options={CHART_LENS_OPTIONS}
              />
            </div>

            <div className="mb-3 grid grid-cols-3 gap-3 rounded-2xl bg-muted/35 p-3">
              <Stat
                label="Income"
                value={mask(compactMoney(cashTotals.inVal))}
                tone="pos"
              />
              <Stat
                label="Spending"
                value={mask(compactMoney(cashTotals.outVal))}
                tone="neg"
              />
              <Stat
                label="Net flow"
                value={mask(compactMoney(cashTotals.netVal, "USD", true))}
                tone={cashTotals.netVal >= 0 ? "pos" : "neg"}
              />
            </div>
          </div>

          <TrendChartCanvas
            mode={cashMode}
            data={chartRows}
            primaryKey="primary"
            primaryName={primaryLabel}
            secondaryKey="secondary"
            secondaryName={secondaryLabel}
            gradientId={`dash-cf-${cashLens}`}
            isNetMetric={cashLens === "net"}
            hideSecondary={cashLens !== "flow"}
          />
        </Glass>

        <Glass className="flex flex-col justify-between lg:col-span-5">
          <div>
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="font-medium">Recent Activity</h2>
              <SlidingTabs
                stretch
                size="xs"
                layoutGroup="dash-feed-scope"
                className="w-full sm:w-auto"
                value={feedScope}
                onChange={(next) => {
                  setFeedScope(next);
                  setFeedExpanded(false);
                }}
                options={[
                  { id: "all", label: "All" },
                  { id: "Studio", label: "Studio" },
                  { id: "Personal", label: "Personal" },
                  { id: "Work", label: "Work" },
                ]}
              />
            </div>

            {visibleFeed.length === 0 ? (
              <p className="py-8 text-center text-xs text-muted-foreground">
                No activity logged under {feedScope} yet.
              </p>
            ) : (
              <ul className="divide-y divide-border/70">
                {visibleFeed.map((item) => {
                  const Icon = item.expense
                    ? expenseItemIcon(item.expense)
                    : item.income
                      ? incomeSourceIcon(item.income.source)
                      : item.invoiceId
                        ? Briefcase
                        : CheckCircle2;

                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => {
                          if (item.expense) setExpenseDraft(item.expense);
                          else if (item.income) setIncomeDraft(item.income);
                          else if (item.workTask)
                            setWorkTaskDraft(item.workTask);
                          else if (item.invoiceId)
                            navigate({
                              to: "/invoices/$id",
                              params: { id: item.invoiceId },
                            });
                        }}
                        className="flex w-full items-center justify-between gap-2.5 rounded-xl px-1.5 py-2.5 text-left transition-colors hover:bg-muted/60"
                      >
                        <div className="flex min-w-0 items-center gap-2.5">
                          <span
                            className={cn(
                              "grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-border bg-muted/80",
                              item.direction === "in" && "text-positive",
                              item.direction === "out" && "text-destructive",
                              !item.direction && "text-primary",
                            )}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-foreground sm:text-sm">
                              {item.title}
                            </p>
                            <p className="truncate text-[0.7rem] text-muted-foreground">
                              <span className="font-medium text-primary/90">
                                {item.scope}
                              </span>{" "}
                              · {item.sub} · {shortDate(item.date)}
                            </p>
                          </div>
                        </div>
                        {item.amount !== undefined ? (
                          <span
                            className={cn(
                              "font-num shrink-0 text-xs font-bold sm:text-sm",
                              item.direction === "in"
                                ? "text-positive"
                                : "text-destructive",
                            )}
                          >
                            {hideBalances
                              ? "••••"
                              : money(item.amount, "USD", true)}
                          </span>
                        ) : item.badge ? (
                          <Pill s={item.badge} />
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {filteredFeed.length > 8 && (
            <div className="mt-3 flex justify-center border-t border-border/60 pt-2.5">
              <button
                type="button"
                onClick={() => setFeedExpanded((v) => !v)}
                className="text-xs font-medium text-primary hover:underline"
              >
                {feedExpanded
                  ? "Show less"
                  : `Show more (${filteredFeed.length - 8} more)`}
              </button>
            </div>
          )}
        </Glass>
      </div>

      {/* Recent Portfolio Visuals Preview Strip */}
      {showcaseWithMedia.length > 0 && (
        <Glass className="mb-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h2 className="font-medium">Portfolio Showcase</h2>
              <span className="font-num text-xs text-muted-foreground">
                · {output.mediaCount} mockups
              </span>
            </div>
            <Link
              to="/work"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Open Portfolio →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {showcaseWithMedia.map((it) => {
              const img = it.media.find((m) => m.kind === "image" && m.dataUrl);
              return (
                <Link
                  key={it.id}
                  to="/work"
                  className="group overflow-hidden rounded-2xl border border-border/80 bg-muted/35 transition-all hover:-translate-y-0.5 hover:border-primary/45"
                >
                  <div className="aspect-[16/10] bg-[#0d0e11] p-2 light:bg-[#efece6]">
                    {img?.dataUrl && (
                      <img
                        src={img.dataUrl}
                        alt={it.title}
                        className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    )}
                  </div>
                  <div className="p-2.5">
                    <p className="truncate text-xs font-semibold text-foreground">
                      {it.title}
                    </p>
                    <p className="truncate text-[0.68rem] text-muted-foreground">
                      {it.projectGroup} · {it.designType}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </Glass>
      )}

      {/* Category Inspector Drawer with Interactive Timeline */}
      <CategoryInspectorDrawer
        db={db}
        account={inspectedCategory?.account ?? "Personal"}
        category={inspectedCategory?.category ?? null}
        month={month}
        onClose={() => setInspectedCategory(null)}
        onAddExpense={(acc, cat) => {
          setInspectedCategory(null);
          setExpenseDraft({
            id: uid(),
            date: today(),
            projectId: "",
            category: cat,
            vendor: "Debit",
            description: "",
            amount: 0,
            currency: "USD",
            receipt: "",
            account: acc,
          });
        }}
        onEditExpense={(exp) => {
          setInspectedCategory(null);
          setExpenseDraft(exp);
        }}
      />

      {/* Fast-Tap Personal Expense Drawer */}
      <QuickExpenseDrawer
        item={expenseDraft}
        onClose={() => setExpenseDraft(null)}
        onSave={(v) => {
          const acc = expenseAccount(v);
          setDB((d) => ({
            ...d,
            expenses: upsert(d.expenses, { ...v, account: acc }),
          }));
          toast.success(`${acc} expense saved.`);
        }}
        onDelete={
          expenseDraft && db.expenses.some((e) => e.id === expenseDraft.id)
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

      {/* Fast-Tap Personal Income Drawer */}
      <QuickIncomeDrawer
        item={incomeDraft}
        onClose={() => setIncomeDraft(null)}
        onSave={(v) => {
          setDB((d) => ({
            ...d,
            personalIncome: upsert(d.personalIncome ?? [], v),
          }));
          toast.success("Personal income recorded.");
        }}
        onDelete={
          incomeDraft &&
          (db.personalIncome ?? []).some((i) => i.id === incomeDraft.id)
            ? (v) => {
                setDB((d) => ({
                  ...d,
                  personalIncome: (d.personalIncome ?? []).filter(
                    (x) => x.id !== v.id,
                  ),
                }));
                toast.message("Income entry deleted.");
              }
            : undefined
        }
      />

      {/* Work Task & Portfolio Drawer */}
      <SlideDrawer
        open={Boolean(workTaskDraft)}
        onClose={() => setWorkTaskDraft(null)}
        title={
          workTaskDraft?.featured
            ? "Add Portfolio Work & Mockup"
            : "New Work Task"
        }
        subtitle="DBG · Connexion · OCIC · Portfolio"
        widthClass="max-w-lg"
      >
        {workTaskDraft && (
          <form
            className="grid grid-cols-2 gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!workTaskDraft.title.trim()) {
                toast.error("Enter a task or project title.");
                return;
              }
              const cleaned: WorkTask = {
                ...workTaskDraft,
                company:
                  (workTaskDraft.projectName || workTaskDraft.company).trim() ||
                  "General",
                projectName:
                  (workTaskDraft.projectName || workTaskDraft.company).trim() ||
                  "General",
                artworkCount: Math.max(
                  1,
                  Number(workTaskDraft.artworkCount) || 1,
                ),
                completedDate:
                  workTaskDraft.status === "Completed"
                    ? workTaskDraft.completedDate ||
                      workTaskDraft.dueDate ||
                      today()
                    : workTaskDraft.completedDate,
              };
              setDB((d) => ({
                ...d,
                workTasks: upsert(d.workTasks ?? [], cleaned),
              }));
              toast.success(`Saved "${cleaned.title}" to Work & Portfolio.`);
              setWorkTaskDraft(null);
            }}
          >
            <F label="Design title" className="col-span-2">
              <input
                className="field"
                placeholder="e.g. Connexion Launch Key Visual"
                value={workTaskDraft.title}
                onChange={(e) =>
                  setWorkTaskDraft({ ...workTaskDraft, title: e.target.value })
                }
                required
              />
            </F>

            <F label="Project / Company" className="col-span-2">
              <div className="flex flex-wrap gap-1.5 pb-1.5">
                {projectNames.map((name) => {
                  const active =
                    (workTaskDraft.projectName || workTaskDraft.company) ===
                    name;
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() =>
                        setWorkTaskDraft({
                          ...workTaskDraft,
                          projectName: name,
                          company: name,
                        })
                      }
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-muted/50 text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {name}
                    </button>
                  );
                })}
              </div>
              <input
                className="field text-xs"
                placeholder="Or type custom project name…"
                value={workTaskDraft.projectName ?? ""}
                onChange={(e) =>
                  setWorkTaskDraft({
                    ...workTaskDraft,
                    projectName: e.target.value,
                    company: e.target.value,
                  })
                }
              />
            </F>

            <F label="Status" className="col-span-2 sm:col-span-1">
              <Sel
                value={workTaskDraft.status}
                onChange={(v) =>
                  setWorkTaskDraft({
                    ...workTaskDraft,
                    status: v as WorkStatus,
                    completedDate:
                      v === "Completed"
                        ? workTaskDraft.completedDate || today()
                        : workTaskDraft.completedDate,
                  })
                }
                options={[...WORK_STATUSES]}
              />
            </F>

            <F label="Design discipline" className="col-span-2 sm:col-span-1">
              <Sel
                value={workTaskDraft.designType}
                onChange={(v) =>
                  setWorkTaskDraft({ ...workTaskDraft, designType: v })
                }
                options={[...DESIGN_TYPES]}
              />
            </F>

            <F label="Artworks (pcs)" className="col-span-1">
              <input
                type="number"
                min={1}
                className="field font-num"
                value={workTaskDraft.artworkCount}
                onChange={(e) =>
                  setWorkTaskDraft({
                    ...workTaskDraft,
                    artworkCount: Math.max(1, Number(e.target.value) || 1),
                  })
                }
              />
            </F>

            <F label="Date" className="col-span-1">
              <input
                type="date"
                className="field font-num"
                value={
                  workTaskDraft.status === "Completed"
                    ? workTaskDraft.completedDate || workTaskDraft.dueDate
                    : workTaskDraft.dueDate
                }
                onChange={(e) =>
                  setWorkTaskDraft({
                    ...workTaskDraft,
                    dueDate: e.target.value,
                    completedDate:
                      workTaskDraft.status === "Completed"
                        ? e.target.value
                        : workTaskDraft.completedDate,
                  })
                }
              />
            </F>

            <div className="col-span-2 space-y-1.5">
              <span className="label-mono">
                Design mockups (PNG / JPEG / PDF)
              </span>
              <DesignMediaUploader
                media={workTaskDraft.media}
                onChange={(media) =>
                  setWorkTaskDraft({ ...workTaskDraft, media })
                }
              />
            </div>

            <div className="col-span-2 mt-2 flex justify-between gap-2 border-t border-border/70 pt-3">
              <Btn
                type="button"
                onClick={() => {
                  setWorkTaskDraft(null);
                  navigate({ to: "/work" });
                }}
              >
                Open Work page
              </Btn>
              <div className="flex gap-2">
                <Btn type="button" onClick={() => setWorkTaskDraft(null)}>
                  Cancel
                </Btn>
                <Btn type="submit" variant="gold">
                  Save to Work
                </Btn>
              </div>
            </div>
          </form>
        )}
      </SlideDrawer>
    </>
  );
}
