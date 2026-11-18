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
  FilePlus2,
  FileText,
  FolderKanban,
  Image as ImageIcon,
  Layers,
  Layers3,
  PiggyBank,
  Plus,
  ScanLine,
  Sparkles,
  UserPlus,
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
import { EditModal, nextCode, upsert, type Field } from "@/components/rv/Crud";
import {
  AnimatedNumber,
  categoryIcon,
  expenseItemIcon,
  incomeSourceIcon,
  paymentCardIcon,
} from "@/components/rv/FinanceVisuals";
import {
  CHART_LENS_OPTIONS,
  CHART_MODE_OPTIONS,
  TrendChartCanvas,
  type ChartLens,
  type ChartMode,
} from "@/components/rv/Charts";
import { DesignMediaUploader } from "@/components/rv/DesignMediaTools";
import { useReceiptScanner } from "@/components/rv/ReceiptScanner";
import { workProjectAccent } from "@/components/rv/workProjectColors";
import {
  CARD_METHODS,
  CLIENT_SOURCES,
  CLIENT_STATUSES,
  CLIENT_TYPES,
  DEFAULT_WORK_PROJECTS,
  DESIGN_TYPES,
  EXPENSE_CATEGORIES,
  PERSONAL_CATEGORIES,
  PERSONAL_INCOME_METHODS,
  PERSONAL_INCOME_SOURCES,
  PROJECT_STATUSES,
  WORK_STATUSES,
  addDays,
  cashFlowSeries,
  combinedCashFlowSeries,
  compactMoney,
  designOutputSummary,
  expenseAccount,
  goalAccount,
  invoiceView,
  isInvoice,
  money,
  needsFollowUp,
  periodBreakdownBars,
  personalSeries,
  setDB,
  shortDate,
  toUSD,
  today,
  uid,
  updateProject,
  useDB,
  workspaceBalances,
  type Account,
  type CashRange,
  type Client,
  type Expense,
  type PersonalIncome,
  type Project,
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
          "Unified command dashboard across Studio, Work, and Personal money with quick actions and AI receipt scanning.",
      },
      { property: "og:title", content: "Dashboard · RothVan Ledger" },
      {
        property: "og:description",
        content:
          "Unified command dashboard across Studio, Work, and Personal money with quick actions and AI receipt scanning.",
      },
    ],
  }),
  component: CommandDashboard,
});

const CASH_RANGES: { id: CashRange; label: string }[] = [
  { id: "week", label: "Week" },
  { id: "6m", label: "6m" },
  { id: "12m", label: "12m" },
  { id: "all", label: "All" },
];

type CashScope = "all" | "studio" | "personal";
type FeedScope = "all" | "Studio" | "Work" | "Personal";

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

  const [cashScope, setCashScope] = useState<CashScope>("all");
  const [cashRange, setCashRange] = useState<CashRange>("6m");
  const [cashMode, setCashMode] = useState<ChartMode>("area");
  const [cashLens, setCashLens] = useState<ChartLens>("flow");
  const [feedScope, setFeedScope] = useState<FeedScope>("all");
  const [feedExpanded, setFeedExpanded] = useState(false);

  // Direct quick-action drawers right on Dashboard
  const [clientDraft, setClientDraft] = useState<Client | null>(null);
  const [projectDraft, setProjectDraft] = useState<Project | null>(null);
  const [expenseDraft, setExpenseDraft] = useState<Expense | null>(null);
  const [incomeDraft, setIncomeDraft] = useState<PersonalIncome | null>(null);
  const [workTaskDraft, setWorkTaskDraft] = useState<WorkTask | null>(null);

  const month = today().slice(0, 7);
  const bal = useMemo(() => workspaceBalances(db, month), [db, month]);
  const output = useMemo(() => designOutputSummary(db), [db]);

  const combinedSeries = useMemo(
    () => combinedCashFlowSeries(db, cashRange, month),
    [db, cashRange, month],
  );
  const studioSeries = useMemo(
    () => cashFlowSeries(db, cashRange, month),
    [db, cashRange, month],
  );
  const personalTrend = useMemo(
    () => personalSeries(db, cashRange === "all" ? "12m" : cashRange, month),
    [db, cashRange, month],
  );
  const categoryBars = useMemo(
    () =>
      periodBreakdownBars(
        db,
        cashScope === "all"
          ? "Combined"
          : cashScope === "studio"
            ? "Studio"
            : "Personal",
        cashRange,
        month,
        "category",
        "spending",
      ),
    [db, cashScope, cashRange, month],
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

  const inProductionCount = useMemo(
    () => db.projects.filter((p) => p.status === "In production").length,
    [db.projects],
  );
  const followUpCount = useMemo(
    () => db.invoices.filter((i) => needsFollowUp(i)).length,
    [db.invoices],
  );
  const overdueCount = useMemo(() => {
    return db.invoices.filter(
      (i) => isInvoice(i) && invoiceView(i, db).status === "Overdue",
    ).length;
  }, [db]);

  const personalGoals = useMemo(
    () => db.goals.filter((g) => goalAccount(g) === "Personal"),
    [db.goals],
  );
  const leadGoal = personalGoals[0];

  const r = db.settings.khrRate || 4100;

  // Unified activity feed across Studio, Work, and Personal
  const unifiedFeed = useMemo(() => {
    type FeedItem = {
      id: string;
      date: string;
      scope: "Studio" | "Work" | "Personal";
      title: string;
      sub: string;
      badge?: string;
      amount?: number;
      direction?: "in" | "out";
      expense?: Expense;
      income?: PersonalIncome;
      workTask?: WorkTask;
      linkTo?: string;
    };

    const items: FeedItem[] = [];

    for (const p of db.payments) {
      const inv = db.invoices.find((i) => i.id === p.invoiceId);
      const c = db.clients.find((cl) => cl.id === inv?.clientId);
      items.push({
        id: `pay-${p.id}`,
        date: p.date,
        scope: "Studio",
        title: `${c?.name ?? "Client"} · ${inv?.no ?? "Invoice"}`,
        sub: `${p.method}${p.reference ? ` · ${p.reference}` : ""}`,
        amount: toUSD(p.amount, p.currency, r),
        direction: "in",
        linkTo: inv ? `/invoices/${inv.id}` : "/invoices",
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
      const acct = expenseAccount(e);
      items.push({
        id: `exp-${e.id}`,
        date: e.date,
        scope: acct,
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

  /* Quick-Action Creators */
  const openNewClient = () =>
    setClientDraft({
      id: uid(),
      code: nextCode(
        "RVD-",
        db.clients.map((c) => c.code),
        49,
      ),
      name: "",
      type: CLIENT_TYPES[0] ?? "Owner-operated",
      industry: "",
      contact: "",
      email: "",
      telegram: "",
      phone: "",
      source: CLIENT_SOURCES[0] ?? "Referral",
      status: "Active",
      notes: "",
      preferredContact: "Telegram",
    });

  const openNewProject = () => {
    const start = today();
    setProjectDraft({
      id: uid(),
      code: nextCode(
        "RVD-",
        db.projects.map((p) => p.code),
        101,
      ),
      clientId: db.clients[0]?.id ?? "",
      serviceId: db.services[0]?.id ?? "",
      name: "",
      status: "In production",
      start,
      due: addDays(start, 14),
      delivered: "",
      quote: 0,
    });
  };

  const openNewExpense = (account: Account) =>
    setExpenseDraft({
      id: uid(),
      date: today(),
      projectId: "",
      category:
        account === "Studio"
          ? (EXPENSE_CATEGORIES[0] ?? "Other")
          : (PERSONAL_CATEGORIES[0] ?? "Food"),
      vendor: account === "Personal" ? "ABA Bank" : "",
      description: "",
      amount: 0,
      currency: "USD",
      receipt: "",
      account,
    });

  const openNewIncome = () =>
    setIncomeDraft({
      id: uid(),
      date: today(),
      source: "Salary",
      accountMethod: "ABA Bank",
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

  const clientFields: Field<Client>[] = [
    { k: "name", label: "Client / Business name", wide: true },
    { k: "contact", label: "Contact person" },
    { k: "industry", label: "Industry" },
    { k: "type", label: "Type", type: "select", options: CLIENT_TYPES },
    { k: "status", label: "Status", type: "select", options: CLIENT_STATUSES },
    { k: "phone", label: "Phone" },
    { k: "telegram", label: "Telegram" },
    { k: "notes", label: "Notes", type: "textarea" },
  ];

  const projectFields: Field<Project>[] = [
    { k: "name", label: "Project name", wide: true },
    {
      k: "clientId",
      label: "Client",
      type: "select",
      options: db.clients.map((c) => ({ value: c.id, label: c.name })),
    },
    {
      k: "serviceId",
      label: "Primary service",
      type: "select",
      options: db.services.map((s) => ({
        value: s.id,
        label: `${s.code} · ${s.name}`,
      })),
    },
    {
      k: "status",
      label: "Status",
      type: "chips",
      options: [...PROJECT_STATUSES],
    },
    { k: "quote", label: "Quoted fee (USD)", type: "number" },
    { k: "start", label: "Start date", type: "date" },
    { k: "due", label: "Due date", type: "date" },
  ];

  const expenseFields = (acct: Account): Field<Expense>[] => [
    { k: "date", label: "Date", type: "date" },
    { k: "amount", label: "Amount", type: "number" },
    { k: "description", label: "Description / item", wide: true },
    {
      k: "category",
      label: acct === "Studio" ? "Studio Category" : "Personal Category",
      type: "chips",
      options: (acct === "Studio"
        ? EXPENSE_CATEGORIES
        : PERSONAL_CATEGORIES
      ).map((c) => ({
        value: c,
        label: c,
        icon: categoryIcon(c),
      })),
    },
    ...(acct === "Personal"
      ? ([
          {
            k: "vendor",
            label: "Bank / Card Method",
            type: "chips",
            options: CARD_METHODS.map((m) => ({
              value: m,
              label: m,
              icon: paymentCardIcon(m),
            })),
            allowCustom: true,
            customPlaceholder: "Or type merchant / card…",
          },
        ] as Field<Expense>[])
      : ([
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
        ] as Field<Expense>[])),
    {
      k: "currency",
      label: "Currency",
      type: "chips",
      options: ["USD", "KHR"],
    },
  ];

  const incomeFields: Field<PersonalIncome>[] = [
    { k: "date", label: "Date received", type: "date" },
    { k: "amount", label: "Amount", type: "number" },
    { k: "description", label: "Note / payer", wide: true },
    {
      k: "source",
      label: "Income source",
      type: "chips",
      options: PERSONAL_INCOME_SOURCES.map((s) => ({
        value: s,
        label: s,
        icon: incomeSourceIcon(s),
      })),
    },
    {
      k: "accountMethod",
      label: "Received into",
      type: "chips",
      options: PERSONAL_INCOME_METHODS.map((m) => ({
        value: m,
        label: m,
        icon: paymentCardIcon(m),
      })),
    },
    {
      k: "currency",
      label: "Currency",
      type: "chips",
      options: ["USD", "KHR"],
    },
  ];

  const showcaseWithMedia = useMemo(
    () =>
      output.items
        .filter((it) => it.media.some((m) => m.kind === "image" && m.dataUrl))
        .slice(0, 4),
    [output.items],
  );

  return (
    <>
      <PageHeader title="Command Dashboard" owner={db.settings.ownerName} />

      {/* Banking-Style Net Liquidity Hero Card (ABA / ACLEDA / Canadia Inspired) */}
      <Glass className="mb-5 overflow-hidden border-primary/25 bg-gradient-to-br from-primary/12 via-card/85 to-card/70">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Wallet className="h-3.5 w-3.5 shrink-0 text-primary" />
                  <span className="font-semibold text-foreground">
                    Combined Liquidity
                  </span>
                  <span className="hidden sm:inline" aria-hidden="true">
                    ·
                  </span>
                  <span className="hidden sm:inline">
                    Studio + Personal Real-Time Total
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground sm:hidden">
                  Studio + Personal Real-Time Total
                </p>
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

            <div className="mt-2 flex flex-wrap items-baseline gap-3">
              <p
                className={cn(
                  "font-num text-3xl font-extrabold tracking-tight sm:text-5xl",
                  bal.combinedBalance >= 0
                    ? "text-foreground"
                    : "text-destructive",
                )}
                title={hideBalances ? "Hidden" : money(bal.combinedBalance)}
              >
                {hideBalances ? (
                  "••••••"
                ) : (
                  <AnimatedNumber value={bal.combinedBalance} />
                )}
              </p>
              <span
                className={cn(
                  "font-num text-xs font-semibold",
                  bal.combinedMonthNet >= 0
                    ? "text-positive"
                    : "text-destructive",
                )}
              >
                {hideBalances
                  ? "This month ••••"
                  : `${money(bal.combinedMonthNet, "USD", true)} this month`}
              </span>
            </div>

            <p className="font-num mt-1.5 text-xs text-muted-foreground">
              Studio {mask(money(bal.studioBalance))} · Personal{" "}
              {mask(money(bal.personalBalance))} · Open A/R{" "}
              {mask(compactMoney(bal.openAR))} · {output.completedTotal}{" "}
              completed designs ({output.totalArtworks} pcs)
            </p>
          </div>

          {/* 4 Quick Banking-Style Tiles */}
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:w-[29rem] lg:shrink-0">
            <button
              type="button"
              onClick={() => openScanner("Personal")}
              className="flex min-h-[60px] flex-col items-center justify-center gap-1 rounded-2xl border border-primary/45 bg-primary/18 px-3 py-2.5 text-xs font-semibold text-primary transition-transform hover:-translate-y-0.5 active:scale-95"
            >
              <ScanLine className="h-4 w-4 shrink-0" />
              <span className="whitespace-nowrap">Scan Slip</span>
            </button>
            <button
              type="button"
              onClick={() => openNewExpense("Personal")}
              className="flex min-h-[60px] flex-col items-center justify-center gap-1 rounded-2xl border border-border bg-secondary/75 px-3 py-2.5 text-xs font-semibold text-foreground transition-colors hover:border-primary/40 hover:bg-accent active:scale-95"
            >
              <ArrowUpRight className="h-4 w-4 shrink-0 text-destructive" />
              <span className="whitespace-nowrap">Expense</span>
            </button>
            <button
              type="button"
              onClick={openNewIncome}
              className="flex min-h-[60px] flex-col items-center justify-center gap-1 rounded-2xl border border-border bg-secondary/75 px-3 py-2.5 text-xs font-semibold text-foreground transition-colors hover:border-primary/40 hover:bg-accent active:scale-95"
            >
              <ArrowDownLeft className="h-4 w-4 shrink-0 text-positive" />
              <span className="whitespace-nowrap">Income</span>
            </button>
            <button
              type="button"
              onClick={() =>
                document
                  .getElementById("dashboard-cashflow")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
              className="flex min-h-[60px] flex-col items-center justify-center gap-1 rounded-2xl border border-border bg-secondary/75 px-3 py-2.5 text-xs font-semibold text-foreground transition-colors hover:border-primary/40 hover:bg-accent active:scale-95"
            >
              <Layers className="h-4 w-4 shrink-0 text-primary" />
              <span className="whitespace-nowrap">Cash Flow</span>
            </button>
          </div>
        </div>
      </Glass>

      {/* 3 Main Workspace Command Panels: Studio · Work · Personal */}
      <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* 1. Studio Workspace Panel */}
        <Glass className="flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-xl border border-primary/35 bg-primary/15 text-primary">
                  <Briefcase className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="font-display text-lg font-bold leading-tight">
                    Studio
                  </h2>
                  <p className="text-[0.7rem] text-muted-foreground">
                    RothVan Design freelance ledger
                  </p>
                </div>
              </div>
              <Link
                to="/studio"
                className="inline-flex min-h-[36px] items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                Open <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl border border-border/70 bg-muted/35 p-3">
              <Stat
                label="Studio Balance"
                value={mask(compactMoney(bal.studioBalance))}
                fullValue={hideBalances ? undefined : money(bal.studioBalance)}
                tone={bal.studioBalance >= 0 ? "pos" : "neg"}
              />
              <Stat
                label="Open A/R"
                value={mask(compactMoney(bal.openAR))}
                fullValue={hideBalances ? undefined : money(bal.openAR)}
              />
              <Stat label="In production" value={String(inProductionCount)} />
              <Stat
                label={overdueCount > 0 ? "Overdue inv" : "Follow-ups"}
                value={String(overdueCount > 0 ? overdueCount : followUpCount)}
                tone={overdueCount > 0 ? "neg" : undefined}
              />
            </div>

            <div className="mt-4">
              <p className="label-mono mb-2">Studio quick actions</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={openNewClient}
                  className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-border bg-secondary/75 px-3 py-2 text-xs font-medium text-foreground transition-colors hover:border-primary/45 hover:bg-accent"
                >
                  <UserPlus className="h-3.5 w-3.5 shrink-0 text-primary" />
                  <span className="truncate">Client</span>
                </button>
                <button
                  type="button"
                  onClick={openNewProject}
                  className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-border bg-secondary/75 px-3 py-2 text-xs font-medium text-foreground transition-colors hover:border-primary/45 hover:bg-accent"
                >
                  <FolderKanban className="h-3.5 w-3.5 shrink-0 text-primary" />
                  <span className="truncate">Project</span>
                </button>
                <Link
                  to="/invoices/$id"
                  params={{ id: "new" }}
                  search={{ kind: "Quotation" }}
                  className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-border bg-secondary/75 px-3 py-2 text-xs font-medium text-foreground transition-colors hover:border-primary/45 hover:bg-accent"
                >
                  <FilePlus2 className="h-3.5 w-3.5 shrink-0 text-primary" />
                  <span className="truncate">Quotation</span>
                </Link>
                <Link
                  to="/invoices/$id"
                  params={{ id: "new" }}
                  className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-primary/40 bg-primary/15 px-3 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  <FileText className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">Invoice</span>
                </Link>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/70 pt-3 text-xs">
            <button
              type="button"
              onClick={() => openNewExpense("Studio")}
              className="inline-flex items-center gap-1 font-medium text-muted-foreground hover:text-foreground"
            >
              <Plus className="h-3.5 w-3.5 text-primary" />
              Log Studio Cost
            </button>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Link to="/projects" className="hover:text-primary">
                Projects
              </Link>
              <Link to="/clients" className="hover:text-primary">
                Clients
              </Link>
              <Link to="/invoices" className="hover:text-primary">
                Invoices
              </Link>
            </div>
          </div>
        </Glass>

        {/* 2. Work & Portfolio Panel */}
        <Glass className="flex flex-col justify-between gap-4" delay={60}>
          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-xl border border-primary/35 bg-primary/15 text-primary">
                  <Layers3 className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="font-display text-lg font-bold leading-tight">
                    Work &amp; Portfolio
                  </h2>
                  <p className="text-[0.7rem] text-muted-foreground">
                    Full-time jobs + artwork archive
                  </p>
                </div>
              </div>
              <Link
                to="/work"
                className="inline-flex min-h-[36px] items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                Open <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl border border-border/70 bg-muted/35 p-3">
              <Stat
                label="Completed"
                value={String(output.completedTotal)}
                tone="pos"
              />
              <Stat label="Current tasks" value={String(output.workActive)} />
              <Stat label="Artworks" value={String(output.totalArtworks)} />
              <Stat label="Mockups / PDF" value={String(output.mediaCount)} />
            </div>

            {/* Top Work Projects */}
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {projectNames.slice(0, 4).map((name) => {
                const count = (db.workTasks ?? []).filter(
                  (t) => (t.projectName || t.company || "General") === name,
                ).length;
                const acc = workProjectAccent(name);
                return (
                  <Link
                    key={name}
                    to="/work"
                    className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-background/45 px-2.5 py-1 text-[0.7rem] font-medium text-foreground hover:border-primary/45"
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: acc.dot }}
                    />
                    <span>{name}</span>
                    <span className="font-num text-muted-foreground">
                      {count}
                    </span>
                  </Link>
                );
              })}
            </div>

            <div className="mt-4">
              <p className="label-mono mb-2">Work quick actions</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => openNewWorkTask(false)}
                  className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-primary/40 bg-primary/15 px-3 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  <Plus className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">Work Task</span>
                </button>
                <button
                  type="button"
                  onClick={() => openNewWorkTask(true)}
                  className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-border bg-secondary/75 px-3 py-2 text-xs font-medium text-foreground transition-colors hover:border-primary/45 hover:bg-accent"
                >
                  <ImageIcon className="h-3.5 w-3.5 shrink-0 text-primary" />
                  <span className="truncate">Portfolio</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/70 pt-3 text-xs text-muted-foreground">
            <span>
              {output.workCompleted} full-time · {output.studioCompleted} studio
            </span>
            <Link
              to="/work"
              className="font-medium text-primary hover:underline"
            >
              Calendar &amp; Summary →
            </Link>
          </div>
        </Glass>

        {/* 3. Personal Money Panel */}
        <Glass className="flex flex-col justify-between gap-4" delay={120}>
          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-xl border border-positive/35 bg-positive/15 text-positive">
                  <PiggyBank className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="font-display text-lg font-bold leading-tight">
                    Personal Money
                  </h2>
                  <p className="text-[0.7rem] text-muted-foreground">
                    ABA, ACLEDA, Canadia &amp; daily spend
                  </p>
                </div>
              </div>
              <Link
                to="/personal"
                className="inline-flex min-h-[36px] items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                Open <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl border border-border/70 bg-muted/35 p-3">
              <Stat
                label="Wallet balance"
                value={mask(compactMoney(bal.personalBalance))}
                fullValue={
                  hideBalances ? undefined : money(bal.personalBalance)
                }
                tone={bal.personalBalance >= 0 ? "pos" : "neg"}
              />
              <Stat
                label="Month income"
                value={mask(compactMoney(bal.personalInMonth))}
                fullValue={
                  hideBalances ? undefined : money(bal.personalInMonth)
                }
                tone={bal.personalInMonth > 0 ? "pos" : undefined}
              />
              <Stat
                label="Month spend"
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

            {leadGoal && (
              <div className="mt-3 rounded-2xl border border-border/60 bg-background/35 px-3 py-2">
                <div className="flex items-center justify-between text-[0.7rem]">
                  <span className="truncate font-medium text-foreground">
                    {leadGoal.name}
                  </span>
                  <span className="font-num text-muted-foreground">
                    {leadGoal.target > 0
                      ? `${Math.min(100, Math.round((leadGoal.current / leadGoal.target) * 100))}%`
                      : "0%"}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-positive transition-all"
                    style={{
                      width: `${leadGoal.target > 0 ? Math.min(100, (leadGoal.current / leadGoal.target) * 100) : 0}%`,
                    }}
                  />
                </div>
              </div>
            )}

            <div className="mt-4">
              <p className="label-mono mb-2">Personal quick actions</p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => openScanner("Personal")}
                  className="inline-flex min-h-[42px] items-center justify-center gap-1 rounded-xl border border-primary/40 bg-primary/15 px-2.5 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  <ScanLine className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">Scan</span>
                </button>
                <button
                  type="button"
                  onClick={() => openNewExpense("Personal")}
                  className="inline-flex min-h-[42px] items-center justify-center gap-1 rounded-xl border border-border bg-secondary/75 px-2.5 py-2 text-xs font-medium text-foreground transition-colors hover:border-primary/45 hover:bg-accent"
                >
                  <Plus className="h-3.5 w-3.5 shrink-0 text-destructive" />
                  <span className="truncate">Expense</span>
                </button>
                <button
                  type="button"
                  onClick={openNewIncome}
                  className="inline-flex min-h-[42px] items-center justify-center gap-1 rounded-xl border border-border bg-secondary/75 px-2.5 py-2 text-xs font-medium text-foreground transition-colors hover:border-primary/45 hover:bg-accent"
                >
                  <Plus className="h-3.5 w-3.5 shrink-0 text-positive" />
                  <span className="truncate">Income</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/70 pt-3 text-xs text-muted-foreground">
            <span>
              Month net {mask(compactMoney(bal.personalMonthNet, "USD", true))}
            </span>
            <Link
              to="/personal"
              className="font-medium text-primary hover:underline"
            >
              Cards &amp; Budget →
            </Link>
          </div>
        </Glass>
      </div>

      {/* Interactive Cash Flow + In-Page Recent Activity Feed */}
      {(() => {
        const cashTotals =
          cashScope === "all"
            ? {
                inVal: combinedSeries.reduce((s, p) => s + p.totalIn, 0),
                outVal: combinedSeries.reduce((s, p) => s + p.totalOut, 0),
                netVal: combinedSeries.reduce((s, p) => s + p.combinedNet, 0),
              }
            : cashScope === "studio"
              ? {
                  inVal: studioSeries.reduce((s, p) => s + p.inn, 0),
                  outVal: studioSeries.reduce((s, p) => s + p.out, 0),
                  netVal: studioSeries.reduce((s, p) => s + p.net, 0),
                }
              : {
                  inVal: personalTrend.reduce((s, p) => s + p.personalIn, 0),
                  outVal: personalTrend.reduce((s, p) => s + p.personalOut, 0),
                  netVal: personalTrend.reduce((s, p) => s + p.net, 0),
                };

        const chartRows =
          cashLens === "category"
            ? categoryBars
            : cashScope === "all"
              ? combinedSeries.map((pt) => ({
                  label: pt.label,
                  fullDate: pt.fullDate,
                  primary: cashLens === "net" ? pt.combinedNet : pt.totalIn,
                  secondary: pt.totalOut,
                  count: pt.count,
                }))
              : cashScope === "studio"
                ? studioSeries.map((pt) => ({
                    label: pt.label,
                    fullDate: pt.fullDate,
                    primary: cashLens === "net" ? pt.net : pt.inn,
                    secondary: pt.out,
                    inCount: pt.inCount,
                    outCount: pt.outCount,
                  }))
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
            ? "Top spending categories"
            : cashLens === "net"
              ? "Net cash flow"
              : cashScope === "studio"
                ? "Studio cash in"
                : cashScope === "personal"
                  ? "Personal income"
                  : "Combined cash in";
        const secondaryLabel =
          cashScope === "studio"
            ? "Studio out"
            : cashScope === "personal"
              ? "Personal out"
              : "Total spending";

        const filteredFeed =
          feedScope === "all"
            ? unifiedFeed
            : unifiedFeed.filter((it) => it.scope === feedScope);
        const visibleFeed = filteredFeed.slice(0, feedExpanded ? 24 : 8);

        return (
          <div
            id="dashboard-cashflow"
            className="mb-5 grid scroll-mt-20 grid-cols-1 gap-4 lg:grid-cols-12"
          >
            <Glass className="lg:col-span-7">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="font-medium">Cash Flow Overview</h2>
                  <p className="text-xs text-muted-foreground">
                    Compare in vs out, net margin, and top spending categories
                    in place
                  </p>
                </div>
                <SlidingTabs
                  size="xs"
                  layoutGroup="dash-cf-scope"
                  value={cashScope}
                  onChange={setCashScope}
                  options={[
                    { id: "all", label: "All" },
                    { id: "studio", label: "Studio" },
                    { id: "personal", label: "Personal" },
                  ]}
                />
              </div>

              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <SlidingTabs
                  size="xs"
                  layoutGroup="dash-cf-lens"
                  value={cashLens}
                  onChange={setCashLens}
                  options={CHART_LENS_OPTIONS.slice(0, 3)}
                />
                <div className="flex flex-wrap items-center gap-1.5">
                  <SlidingTabs
                    size="xs"
                    layoutGroup="dash-cf-mode"
                    value={cashMode}
                    onChange={setCashMode}
                    options={CHART_MODE_OPTIONS}
                  />
                  <SlidingTabs
                    size="xs"
                    tone="invert"
                    layoutGroup="dash-cf-range"
                    value={cashRange}
                    onChange={setCashRange}
                    options={CASH_RANGES}
                  />
                </div>
              </div>

              <div className="mb-3 grid grid-cols-3 gap-3">
                <Stat
                  label={
                    cashScope === "studio"
                      ? "Studio in"
                      : cashScope === "personal"
                        ? "Personal in"
                        : "Total in"
                  }
                  value={mask(compactMoney(cashTotals.inVal))}
                  tone="pos"
                />
                <Stat
                  label={
                    cashScope === "studio"
                      ? "Studio out"
                      : cashScope === "personal"
                        ? "Personal out"
                        : "Total out"
                  }
                  value={mask(compactMoney(cashTotals.outVal))}
                  tone="neg"
                />
                <Stat
                  label="Net flow"
                  value={mask(compactMoney(cashTotals.netVal, "USD", true))}
                  tone={cashTotals.netVal >= 0 ? "pos" : "neg"}
                />
              </div>

              <TrendChartCanvas
                mode={cashLens === "category" ? "bar" : cashMode}
                data={chartRows}
                primaryKey="primary"
                primaryName={primaryLabel}
                secondaryKey="secondary"
                secondaryName={secondaryLabel}
                gradientId={`dash-cf-${cashScope}-${cashLens}`}
                isNetMetric={cashLens === "net"}
                hideSecondary={cashLens !== "flow"}
              />
            </Glass>

            <Glass className="flex flex-col justify-between lg:col-span-5">
              <div>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-medium">Recent Activity</h2>
                  <SlidingTabs
                    size="xs"
                    layoutGroup="dash-feed-scope"
                    value={feedScope}
                    onChange={(next) => {
                      setFeedScope(next);
                      setFeedExpanded(false);
                    }}
                    options={[
                      { id: "all", label: "All" },
                      { id: "Studio", label: "Studio" },
                      { id: "Work", label: "Work" },
                      { id: "Personal", label: "Personal" },
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
                          : item.workTask
                            ? CheckCircle2
                            : ArrowDownLeft;

                      const inner = (
                        <>
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
                        </>
                      );

                      return (
                        <li key={item.id}>
                          {item.linkTo ? (
                            <Link
                              to={item.linkTo as "/invoices"}
                              className="flex items-center justify-between gap-2.5 rounded-xl px-1.5 py-2.5 transition-colors hover:bg-muted/60"
                            >
                              {inner}
                            </Link>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                if (item.expense) setExpenseDraft(item.expense);
                                else if (item.income)
                                  setIncomeDraft(item.income);
                                else if (item.workTask)
                                  setWorkTaskDraft(item.workTask);
                              }}
                              className="flex w-full items-center justify-between gap-2.5 rounded-xl px-1.5 py-2.5 text-left transition-colors hover:bg-muted/60"
                            >
                              {inner}
                            </button>
                          )}
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
        );
      })()}

      {/* Recent Portfolio Visuals Preview Strip */}
      {showcaseWithMedia.length > 0 && (
        <Glass className="mb-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h2 className="font-medium">Recent Portfolio Showcase</h2>
              <span className="font-num text-xs text-muted-foreground">
                · {output.mediaCount} attached mockups
              </span>
            </div>
            <Link
              to="/work"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Open full Portfolio &amp; Summary →
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

      {/* Dashboard Direct Action Drawers */}
      <EditModal
        item={clientDraft}
        onClose={() => setClientDraft(null)}
        title="New Studio Client"
        subtitle="RothVan Design Directory"
        presentation="drawer"
        side="right"
        fields={clientFields}
        onSave={(v) => {
          if (!v.name.trim()) {
            toast.error("Enter a client name.");
            return;
          }
          setDB((d) => ({ ...d, clients: upsert(d.clients, v) }));
          toast.success(`Client "${v.name}" added.`);
        }}
      />

      <EditModal
        item={projectDraft}
        onClose={() => setProjectDraft(null)}
        title="New Studio Project"
        subtitle="RothVan Design Pipeline"
        presentation="drawer"
        side="right"
        fields={projectFields}
        onSave={(v) => {
          try {
            setDB((d) => updateProject(d, v));
            toast.success(`Project "${v.name || v.code}" saved.`);
          } catch (err) {
            toast.error(
              err instanceof Error ? err.message : "Could not save project.",
            );
          }
        }}
      />

      <EditModal
        item={expenseDraft}
        onClose={() => setExpenseDraft(null)}
        title={
          expenseDraft && expenseAccount(expenseDraft) === "Studio"
            ? "Studio Expense"
            : "Personal Expense"
        }
        subtitle={
          expenseDraft && expenseAccount(expenseDraft) === "Studio"
            ? "RothVan Design"
            : "Personal Money"
        }
        presentation="drawer"
        side="right"
        fields={expenseFields(
          expenseDraft ? expenseAccount(expenseDraft) : "Personal",
        )}
        onSave={(v) => {
          const acct = expenseAccount(v);
          setDB((d) => ({
            ...d,
            expenses: upsert(d.expenses, { ...v, account: acct }),
          }));
          toast.success(`${acct} expense saved.`);
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

      <EditModal
        item={incomeDraft}
        onClose={() => setIncomeDraft(null)}
        title="Log Personal Income"
        subtitle="Salary · Studio Draw · Freelance · Bonus"
        presentation="drawer"
        side="right"
        fields={incomeFields}
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

      {/* Work Task & Portfolio Quick-Add Drawer */}
      <SlideDrawer
        open={Boolean(workTaskDraft)}
        onClose={() => setWorkTaskDraft(null)}
        title={
          workTaskDraft?.featured
            ? "Add Portfolio Work & Mockup"
            : "New Full-Time Work Task"
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
