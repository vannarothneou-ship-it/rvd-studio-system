import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
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
  const swipeTabs = ["/", "/studio", "/work", "/personal"] as const;
  const activeTabIndex = isDashboard
    ? 0
    : isStudio
      ? 1
      : isWork
        ? 2
        : isPersonal
          ? 3
          : -1;

  const swipeStartRef = useRef<{
    x: number;
    y: number;
    time: number;
    ignore: boolean;
  } | null>(null);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (activeTabIndex < 0 || e.touches.length !== 1) {
      swipeStartRef.current = null;
      return;
    }
    const target = e.target as HTMLElement | null;
    if (!target) return;
    if (
      target.closest(
        '[role="dialog"], input, textarea, select, [data-no-swipe], .recharts-wrapper, .fc',
      )
    ) {
      swipeStartRef.current = null;
      return;
    }
    let cur: HTMLElement | null = target;
    let inHorizontalScroll = false;
    while (cur && cur !== e.currentTarget) {
      if (
        cur.scrollWidth > cur.clientWidth + 6 &&
        window.getComputedStyle(cur).overflowX !== "visible"
      ) {
        inHorizontalScroll = true;
        break;
      }
      cur = cur.parentElement;
    }
    const t = e.touches[0]!;
    swipeStartRef.current = {
      x: t.clientX,
      y: t.clientY,
      time: Date.now(),
      ignore: inHorizontalScroll,
    };
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    const start = swipeStartRef.current;
    swipeStartRef.current = null;
    if (!start || start.ignore || activeTabIndex < 0) return;
    const t = e.changedTouches[0];
    if (!t) return;
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    const dt = Date.now() - start.time;
    if (dt > 520 || Math.abs(dx) < 68 || Math.abs(dx) < Math.abs(dy) * 1.45) {
      return;
    }
    const nextIdx =
      dx < 0
        ? Math.min(swipeTabs.length - 1, activeTabIndex + 1)
        : Math.max(0, activeTabIndex - 1);
    if (nextIdx !== activeTabIndex) {
      navigate({ to: swipeTabs[nextIdx]! });
    }
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="min-h-screen pb-[calc(5.25rem+env(safe-area-inset-bottom))] sm:pb-12"
    >
      {/* Crisp Frosted Mobile Header */}
      <header className="no-print sticky top-0 z-40 border-b border-white/10 bg-[#0d0e13]/85 px-3.5 pt-[calc(env(safe-area-inset-top)+0.35rem)] pb-2 backdrop-blur-xl backdrop-saturate-150 [.light_&]:border-black/10 [.light_&]:bg-[#f6f4ef]/88 sm:hidden">
        <div className="flex h-10 w-full items-center justify-between gap-2">
          <Link to="/" className="flex min-w-0 items-center gap-2.5">
            <img
              src="/apple-touch-icon.png"
              alt="RothVan"
              className="h-7 w-7 shrink-0 rounded-lg border border-white/15 object-cover shadow-xs"
            />
            <p className="truncate text-[0.82rem] font-semibold tracking-tight text-foreground">
              RothVan{" "}
              <span className="font-medium text-primary">
                ·{" "}
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
          </Link>

          <div className="flex shrink-0 items-center gap-1">
            <PWAInstallButton compact />
            <button
              type="button"
              onClick={() => setLight(!light)}
              aria-label="Toggle theme"
              className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-transform duration-150 hover:bg-accent hover:text-foreground active:scale-90"
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
                "grid h-9 w-9 place-items-center rounded-full transition-transform duration-150 hover:bg-accent active:scale-90",
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

      {/* Modern Icon-Only Frosted Bottom Dock with Thumb-Zone Scan Trigger */}
      <nav
        aria-label="Mobile navigation"
        className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#0d0e13]/82 px-3 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-2xl backdrop-saturate-150 [.light_&]:border-black/10 [.light_&]:bg-[#f6f4ef]/88 sm:hidden"
      >
        <div className="mx-auto grid max-w-md grid-cols-5 items-center">
          <Link
            to="/"
            aria-label="Dashboard"
            className={cn(
              "relative flex h-12 items-center justify-center rounded-2xl transition-all duration-150 active:scale-90",
              isDashboard
                ? "text-primary"
                : "text-muted-foreground/75 hover:text-foreground",
            )}
          >
            {isDashboard && (
              <span className="absolute top-0.5 h-0.5 w-5 rounded-full bg-primary transition-all duration-150" />
            )}
            <Home
              className={cn(
                "h-[22px] w-[22px] transition-transform duration-150",
                isDashboard && "scale-110",
              )}
              strokeWidth={isDashboard ? 2.4 : 1.9}
            />
            <span className="sr-only">Dashboard</span>
          </Link>

          <Link
            to="/studio"
            aria-label="Studio"
            className={cn(
              "relative flex h-12 items-center justify-center rounded-2xl transition-all duration-150 active:scale-90",
              isStudio
                ? "text-primary"
                : "text-muted-foreground/75 hover:text-foreground",
            )}
          >
            {isStudio && (
              <span className="absolute top-0.5 h-0.5 w-5 rounded-full bg-primary transition-all duration-150" />
            )}
            <Briefcase
              className={cn(
                "h-[22px] w-[22px] transition-transform duration-150",
                isStudio && "scale-110",
              )}
              strokeWidth={isStudio ? 2.4 : 1.9}
            />
            {overdue > 0 && (
              <span className="font-num absolute right-3.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[0.58rem] font-bold text-destructive-foreground shadow-xs">
                {overdue}
              </span>
            )}
            <span className="sr-only">Studio</span>
          </Link>

          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={() => openScanner(defaultScannerAccount)}
              aria-label="Scan receipt"
              className="grid h-11 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-[0_8px_22px_-6px_var(--primary)] transition-transform duration-150 active:scale-90"
            >
              <ScanLine className="h-5 w-5" strokeWidth={2.2} />
            </button>
          </div>

          <Link
            to="/work"
            aria-label="Work"
            className={cn(
              "relative flex h-12 items-center justify-center rounded-2xl transition-all duration-150 active:scale-90",
              isWork
                ? "text-primary"
                : "text-muted-foreground/75 hover:text-foreground",
            )}
          >
            {isWork && (
              <span className="absolute top-0.5 h-0.5 w-5 rounded-full bg-primary transition-all duration-150" />
            )}
            <Layers3
              className={cn(
                "h-[22px] w-[22px] transition-transform duration-150",
                isWork && "scale-110",
              )}
              strokeWidth={isWork ? 2.4 : 1.9}
            />
            <span className="sr-only">Work</span>
          </Link>

          <Link
            to="/personal"
            aria-label="Personal"
            className={cn(
              "relative flex h-12 items-center justify-center rounded-2xl transition-all duration-150 active:scale-90",
              isPersonal
                ? "text-primary"
                : "text-muted-foreground/75 hover:text-foreground",
            )}
          >
            {isPersonal && (
              <span className="absolute top-0.5 h-0.5 w-5 rounded-full bg-primary transition-all duration-150" />
            )}
            <PiggyBank
              className={cn(
                "h-[22px] w-[22px] transition-transform duration-150",
                isPersonal && "scale-110",
              )}
              strokeWidth={isPersonal ? 2.4 : 1.9}
            />
            <span className="sr-only">Personal</span>
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
                DBG, Connexion &amp; OCIC tasks, mockups &amp; portfolio summary
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
                        ? "bg-primary font-medium text-primary-foreground shadow-[0_6px_18px_-6px_var(--primary)]"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <t.icon className="h-4 w-4 shrink-0" />
                    <span className="whitespace-nowrap">{t.label}</span>
                    {t.to === "/invoices" && overdue > 0 && (
                      <span className="font-num grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[0.6rem] font-bold text-destructive-foreground">
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

      <main className="mx-auto max-w-6xl px-3 pt-3 sm:px-4 sm:pt-24">
        {children}
      </main>
      <OfflineIndicator />
    </div>
  );
}
