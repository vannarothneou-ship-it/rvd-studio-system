import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { motion, MotionConfig } from "motion/react";
import {
  Briefcase,
  FileText,
  FolderKanban,
  Home,
  Layers,
  Layers3,
  LayoutGrid,
  Moon,
  PiggyBank,
  ScanLine,
  Settings,
  Sun,
  Users,
  Wallet,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { invoiceStatus, isInvoice, useDB } from "@/lib/store";
import {
  WorkspaceSwitcher,
  type WorkspaceMode,
} from "@/components/rv/WorkspaceSwitcher";
import {
  OfflineIndicator,
  PWAInstallButton,
} from "@/components/rv/PWAInstallButton";
import {
  ReceiptScannerProvider,
  useReceiptScanner,
} from "@/components/rv/ReceiptScanner";
import { cn } from "@/lib/utils";

const studioTabs = [
  { to: "/studio", label: "Overview", icon: LayoutGrid },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/clients", label: "Clients", icon: Users },
  { to: "/services", label: "Services", icon: Layers },
  { to: "/invoices", label: "Invoices", icon: FileText },
  { to: "/finance", label: "Finance", icon: Wallet },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  return (
    <ReceiptScannerProvider>
      <ShellInner>{children}</ShellInner>
    </ReceiptScannerProvider>
  );
}

function ShellInner({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const searchStr = useRouterState({ select: (r) => r.location.searchStr });
  const navigate = useNavigate();
  const { openScanner } = useReceiptScanner();

  const overdue = useDB((d) => {
    const rate = d.settings.khrRate || 4100;
    const paidByInv = new Map<string, number>();
    const invCurrency = new Map<string, string>();
    for (const inv of d.invoices) {
      if (isInvoice(inv)) invCurrency.set(inv.id, inv.currency);
    }
    for (const p of d.payments) {
      const cur = invCurrency.get(p.invoiceId);
      if (!cur) continue;
      const amt =
        p.currency === cur
          ? p.amount
          : cur === "USD"
            ? p.currency === "KHR"
              ? p.amount / rate
              : p.amount
            : p.amount * rate;
      paidByInv.set(p.invoiceId, (paidByInv.get(p.invoiceId) ?? 0) + amt);
    }
    let count = 0;
    for (const inv of d.invoices) {
      if (!isInvoice(inv)) continue;
      if (invoiceStatus(inv, paidByInv.get(inv.id) ?? 0) === "Overdue") {
        count += 1;
      }
    }
    return count;
  });

  const [light, setLight] = useState(false);
  const lastStudioPathRef = useRef<string>("/studio");

  useEffect(() => {
    setLight(localStorage.getItem("rv-theme") === "light");
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("light", light);
    localStorage.setItem("rv-theme", light ? "light" : "dark");
  }, [light]);

  const isDashboard = path === "/";
  const isPersonal = path.startsWith("/personal");
  const isWork = path.startsWith("/work");
  const isSettings = path.startsWith("/settings");
  const isCombinedFinance =
    path.startsWith("/finance") && searchStr.includes("view=combined");
  const isStudio = !isDashboard && !isPersonal && !isWork && !isSettings;

  const activeWorkspace: WorkspaceMode = isDashboard
    ? "dashboard"
    : isPersonal
      ? "personal"
      : isWork
        ? "work"
        : "studio";

  useEffect(() => {
    if (isStudio) {
      lastStudioPathRef.current = path;
    }
  }, [isStudio, path]);

  const handleWorkspaceSwitch = (next: WorkspaceMode) => {
    if (next === activeWorkspace) return;
    if (next === "dashboard") {
      navigate({ to: "/" });
    } else if (next === "personal") {
      navigate({ to: "/personal" });
    } else if (next === "work") {
      navigate({ to: "/work" });
    } else {
      const target = lastStudioPathRef.current;
      if (target.startsWith("/projects")) navigate({ to: "/projects" });
      else if (target.startsWith("/clients")) navigate({ to: "/clients" });
      else if (target.startsWith("/services")) navigate({ to: "/services" });
      else if (target.startsWith("/invoices")) navigate({ to: "/invoices" });
      else if (target.startsWith("/finance")) navigate({ to: "/finance" });
      else navigate({ to: "/studio" });
    }
  };

  const active = (to: string) =>
    to === "/studio" ? path === "/studio" : path.startsWith(to);

  const defaultScannerAccount = isStudio ? "Studio" : "Personal";

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen pb-24 sm:pb-12">
        {/* Mobile Top Header (Compact Brand + Single Scan Action + Theme/Settings) */}
        <header className="no-print sticky top-2 z-40 mx-2.5 mb-2 sm:hidden">
          <div className="glass-strong flex h-12 w-full items-center justify-between gap-2 rounded-full px-3">
            <div className="flex min-w-0 items-center gap-2">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-xs font-extrabold text-primary-foreground shadow-sm">
                RV
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold leading-tight text-foreground">
                  RothVan
                  <span className="text-muted-foreground"> · </span>
                  <span className="text-primary">
                    {isDashboard
                      ? "Dashboard"
                      : isStudio
                        ? "Studio"
                        : isWork
                          ? "Work"
                          : isPersonal
                            ? "Personal"
                            : "Settings"}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <PWAInstallButton compact />
              <button
                type="button"
                onClick={() => openScanner(defaultScannerAccount)}
                aria-label="Scan receipt or KHQR slip"
                className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full border border-primary/45 bg-primary/15 px-3 text-xs font-semibold text-primary transition-colors active:scale-95"
              >
                <ScanLine className="h-3.5 w-3.5 shrink-0" />
                <span>Scan</span>
              </button>
              <button
                type="button"
                onClick={() => setLight(!light)}
                aria-label="Toggle theme"
                className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {light ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
              </button>
              <Link
                to="/settings"
                aria-label="Settings"
                className={cn(
                  "grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-accent",
                  active("/settings")
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground",
                )}
              >
                <Settings className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </header>

        {/* Mobile Bottom Tab Bar (Strictly 4 Thumb-Accessible Tabs: Dashboard, Studio, Work, Personal) */}
        <nav
          aria-label="Mobile workspace tabs"
          className="no-print fixed inset-x-2.5 bottom-2 z-40 pb-[env(safe-area-inset-bottom)] sm:hidden"
        >
          <div className="glass-strong grid grid-cols-4 items-center gap-1 rounded-3xl px-1.5 py-1.5">
            <Link
              to="/"
              className={cn(
                "flex min-h-[48px] flex-col items-center justify-center gap-1 rounded-2xl px-1 text-[0.68rem] font-medium transition-colors",
                isDashboard
                  ? "bg-primary/15 font-semibold text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Home className="h-4 w-4 shrink-0" />
              <span>Dashboard</span>
            </Link>

            <Link
              to="/studio"
              className={cn(
                "relative flex min-h-[48px] flex-col items-center justify-center gap-1 rounded-2xl px-1 text-[0.68rem] font-medium transition-colors",
                isStudio
                  ? "bg-primary/15 font-semibold text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Briefcase className="h-4 w-4 shrink-0" />
              <span>Studio</span>
              {overdue > 0 && (
                <span className="font-num absolute right-3 top-1.5 grid h-3.5 min-w-3.5 place-items-center rounded-full bg-destructive px-1 text-[0.55rem] font-bold text-destructive-foreground">
                  {overdue}
                </span>
              )}
            </Link>

            <Link
              to="/work"
              className={cn(
                "flex min-h-[48px] flex-col items-center justify-center gap-1 rounded-2xl px-1 text-[0.68rem] font-medium transition-colors",
                isWork
                  ? "bg-primary/15 font-semibold text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Layers3 className="h-4 w-4 shrink-0" />
              <span>Work</span>
            </Link>

            <Link
              to="/personal"
              className={cn(
                "flex min-h-[48px] flex-col items-center justify-center gap-1 rounded-2xl px-1 text-[0.68rem] font-medium transition-colors",
                isPersonal
                  ? "bg-primary/15 font-semibold text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <PiggyBank className="h-4 w-4 shrink-0" />
              <span>Personal</span>
            </Link>
          </div>
        </nav>

        {/* Desktop Floating Top Navigation */}
        <nav className="no-print fixed left-1/2 top-4 z-40 hidden w-[min(calc(100vw-2rem),84rem)] -translate-x-1/2 sm:block">
          <div className="glass-strong flex items-center justify-between gap-2.5 rounded-full p-2">
            {/* Top-Level Workspace Switcher: Dashboard · Studio · Work · Personal */}
            <div className="shrink-0">
              <WorkspaceSwitcher
                activeWorkspace={activeWorkspace}
                onSwitch={handleWorkspaceSwitch}
              />
            </div>

            {/* Context-Scoped Center Area */}
            {isDashboard ? (
              <div className="flex min-w-0 flex-1 items-center justify-center gap-2 px-2 text-xs">
                <span className="hidden truncate text-muted-foreground lg:inline">
                  Unified overview across Studio, Work &amp; Personal · Quick
                  actions &amp; receipt scan
                </span>
              </div>
            ) : isPersonal ? (
              <div className="flex min-w-0 flex-1 items-center justify-center gap-2 px-2 text-xs">
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 font-medium text-primary whitespace-nowrap">
                  <PiggyBank className="h-3.5 w-3.5 shrink-0" />
                  Personal Money
                </span>
                <span className="hidden truncate text-muted-foreground lg:inline">
                  Income, daily spending, bank cards &amp; saving goals
                </span>
              </div>
            ) : isWork ? (
              <div className="flex min-w-0 flex-1 items-center justify-center gap-2 px-2 text-xs">
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 font-medium text-primary whitespace-nowrap">
                  <Layers3 className="h-3.5 w-3.5 shrink-0" />
                  Work &amp; Portfolio
                </span>
                <span className="hidden truncate text-muted-foreground lg:inline">
                  DBG, Connexion &amp; OCIC tasks, mockups &amp; portfolio
                  summary
                </span>
              </div>
            ) : isCombinedFinance ? (
              <div className="flex min-w-0 flex-1 items-center justify-center gap-2 px-2 text-xs">
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 font-medium text-primary whitespace-nowrap">
                  <Wallet className="h-3.5 w-3.5 shrink-0" />
                  Combined Studio + Personal Finance
                </span>
              </div>
            ) : (
              <div className="no-scrollbar flex min-w-0 flex-1 items-center justify-center gap-0.5 overflow-x-auto lg:gap-1">
                {studioTabs.map((t) => {
                  const isActive = active(t.to);
                  return (
                    <Link
                      key={t.to}
                      to={t.to}
                      className={cn(
                        "relative flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-2 text-xs transition-colors lg:px-3 lg:text-sm",
                        isActive
                          ? "font-medium text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="shell-nav-pill"
                          transition={{
                            type: "spring",
                            stiffness: 430,
                            damping: 34,
                          }}
                          className="absolute inset-0 -z-0 rounded-full bg-primary shadow-[0_6px_18px_-6px_var(--primary)]"
                        />
                      )}
                      <t.icon className="relative z-10 h-4 w-4 shrink-0" />
                      <span className="relative z-10 whitespace-nowrap">
                        {t.label}
                      </span>
                      {t.to === "/invoices" && overdue > 0 && (
                        <span className="font-num relative z-10 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[0.6rem] font-bold text-destructive-foreground">
                          {overdue}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Quick Scan, Install, Theme & Settings (Desktop) */}
            <div className="flex shrink-0 items-center gap-1">
              <PWAInstallButton />
              <button
                type="button"
                onClick={() => openScanner(defaultScannerAccount)}
                className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-primary/40 bg-primary/15 px-3 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <ScanLine className="h-3.5 w-3.5 shrink-0" />
                <span className="hidden md:inline">Scan Slip</span>
              </button>
              <button
                type="button"
                onClick={() => setLight(!light)}
                aria-label="Toggle theme"
                className="rounded-full p-2.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {light ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
              </button>
              <Link
                to="/settings"
                aria-label="Settings"
                className={cn(
                  "rounded-full p-2.5 transition-colors hover:bg-accent",
                  active("/settings")
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground",
                )}
              >
                <Settings className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </nav>

        {/* Mobile inline Studio sub-navigation bar (non-sticky so fixed UI stays compact) */}
        {isStudio && (
          <div className="no-print mx-auto max-w-6xl px-3 pt-1 sm:hidden">
            <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto pb-1">
              {studioTabs.map((t) => {
                const isActive = active(t.to);
                return (
                  <Link
                    key={t.to}
                    to={t.to}
                    className={cn(
                      "inline-flex min-h-[38px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                      isActive
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "border-border bg-muted/65 text-muted-foreground",
                    )}
                  >
                    <t.icon className="h-3.5 w-3.5 shrink-0" />
                    <span>{t.label}</span>
                    {t.to === "/invoices" && overdue > 0 && (
                      <span className="font-num ml-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[0.58rem] font-bold text-destructive-foreground">
                        {overdue}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        <main className="mx-auto max-w-6xl px-3 pt-2 sm:px-4 sm:pt-24">
          {children}
        </main>
        <OfflineIndicator />
      </div>
    </MotionConfig>
  );
}
