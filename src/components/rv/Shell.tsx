import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  ArrowLeft,
  Home,
  Layers3,
  Moon,
  PiggyBank,
  ScanLine,
  Settings,
  Sun,
  Wallet,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
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

export function Shell({ children }: { children: ReactNode }) {
  return (
    <ReceiptScannerProvider>
      <ShellInner>{children}</ShellInner>
    </ReceiptScannerProvider>
  );
}

function ShellInner({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const navigate = useNavigate();
  const { openScanner } = useReceiptScanner();

  const [light, setLight] = useState(false);
  const [barsHidden, setBarsHidden] = useState(false);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    setLight(localStorage.getItem("rv-theme") === "light");
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("light", light);
    localStorage.setItem("rv-theme", light ? "light" : "dark");
  }, [light]);

  // Reveal floating top/bottom bars whenever route changes
  useEffect(() => {
    setBarsHidden(false);
    lastScrollYRef.current = typeof window !== "undefined" ? window.scrollY : 0;
  }, [path]);

  // Auto-hide mobile floating bars on downward scroll, reveal on upward scroll
  useEffect(() => {
    let raf = 0;
    lastScrollYRef.current = window.scrollY;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        const y = Math.max(0, window.scrollY);
        const dy = y - lastScrollYRef.current;
        if (y < 48) {
          setBarsHidden(false);
        } else if (y > 72 && dy > 8) {
          setBarsHidden(true);
        } else if (dy < -6) {
          setBarsHidden(false);
        }
        lastScrollYRef.current = y;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  const isDashboard = path === "/";
  const isPersonal = path.startsWith("/personal");
  const isWork = path.startsWith("/work");
  const isSettings = path.startsWith("/settings");
  const isLegacyStudio = !isDashboard && !isPersonal && !isWork && !isSettings;

  const activeWorkspace: WorkspaceMode = isDashboard
    ? "dashboard"
    : isWork
      ? "work"
      : "personal";

  const handleWorkspaceSwitch = (next: WorkspaceMode) => {
    if (next === "dashboard") {
      navigate({ to: "/" });
    } else if (next === "personal") {
      navigate({ to: "/personal" });
    } else {
      navigate({ to: "/work" });
    }
  };

  const active = (to: string) => path.startsWith(to);

  const pageLabel = isDashboard
    ? "Dashboard"
    : isPersonal
      ? "Personal"
      : isWork
        ? "Work"
        : isSettings
          ? "Settings"
          : "Studio";

  const swipeTabs = ["/", "/personal", "/work"] as const;
  const activeTabIndex = isDashboard ? 0 : isPersonal ? 1 : isWork ? 2 : -1;

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
      className="min-h-screen pb-[calc(5.75rem+env(safe-area-inset-bottom))] sm:pb-12"
    >
      {/* Floating Frosted Mobile Header (Auto-hides on scroll down) */}
      <header
        className={cn(
          "no-print fixed inset-x-3 top-[max(0.5rem,env(safe-area-inset-top))] z-40 rounded-2xl border border-white/14 bg-[#121319]/72 px-3 py-1.5 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl backdrop-saturate-180 transition-[transform,opacity] duration-300 ease-out will-change-transform [.light_&]:border-black/10 [.light_&]:bg-[#faf8f4]/78 [.light_&]:shadow-[0_10px_28px_-12px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,0.75)] sm:hidden",
          barsHidden
            ? "pointer-events-none -translate-y-[calc(100%+1.5rem)] opacity-0"
            : "translate-y-0 opacity-100",
        )}
      >
        <div className="flex h-9 w-full items-center justify-between gap-2">
          <Link to="/" className="flex min-w-0 items-center gap-2">
            <img
              src="/apple-touch-icon.png"
              alt="RothVan"
              className="h-7 w-7 shrink-0 rounded-lg border border-white/15 object-cover shadow-xs"
            />
            <span className="truncate text-[0.84rem] font-semibold tracking-tight text-foreground">
              {pageLabel}
            </span>
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
          </div>
        </div>
      </header>

      {/* Floating Frosted Icon-Only Bottom Dock (IG/FB/Mobbin style, auto-hides on scroll) */}
      <nav
        aria-label="Mobile navigation"
        className={cn(
          "no-print fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-1/2 z-40 w-[min(calc(100vw-1.5rem),22.5rem)] -translate-x-1/2 rounded-[28px] border border-white/15 bg-[#121319]/75 px-2 py-1.5 shadow-[0_18px_40px_-14px_rgba(0,0,0,0.72),inset_0_1px_0_rgba(255,255,255,0.09)] backdrop-blur-2xl backdrop-saturate-180 transition-[transform,opacity] duration-300 ease-out will-change-transform [.light_&]:border-black/10 [.light_&]:bg-[#faf8f4]/82 [.light_&]:shadow-[0_16px_36px_-14px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.8)] sm:hidden",
          barsHidden
            ? "pointer-events-none translate-y-[calc(100%+2rem)] opacity-0"
            : "translate-y-0 opacity-100",
        )}
      >
        <div className="grid grid-cols-5 items-center">
          <Link
            to="/"
            aria-label="Dashboard"
            className={cn(
              "relative flex min-h-[44px] items-center justify-center rounded-2xl transition-all duration-150 active:scale-90",
              isDashboard
                ? "text-primary"
                : "text-muted-foreground/75 hover:text-foreground",
            )}
          >
            {isDashboard && (
              <span className="absolute top-1 h-1 w-4 rounded-full bg-primary" />
            )}
            <Home
              className={cn(
                "h-[21px] w-[21px] transition-transform duration-150",
                isDashboard && "scale-110",
              )}
              strokeWidth={isDashboard ? 2.4 : 1.9}
            />
            <span className="sr-only">Dashboard</span>
          </Link>

          <Link
            to="/personal"
            aria-label="Personal"
            className={cn(
              "relative flex min-h-[44px] items-center justify-center rounded-2xl transition-all duration-150 active:scale-90",
              isPersonal
                ? "text-primary"
                : "text-muted-foreground/75 hover:text-foreground",
            )}
          >
            {isPersonal && (
              <span className="absolute top-1 h-1 w-4 rounded-full bg-primary" />
            )}
            <Wallet
              className={cn(
                "h-[21px] w-[21px] transition-transform duration-150",
                isPersonal && "scale-110",
              )}
              strokeWidth={isPersonal ? 2.4 : 1.9}
            />
            <span className="sr-only">Personal</span>
          </Link>

          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={() => openScanner("Personal")}
              aria-label="Scan receipt"
              className="grid h-11 w-12 -translate-y-0.5 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-[0_8px_22px_-6px_var(--primary)] transition-transform duration-150 active:scale-90"
            >
              <ScanLine className="h-5 w-5" strokeWidth={2.2} />
            </button>
          </div>

          <Link
            to="/work"
            aria-label="Work"
            className={cn(
              "relative flex min-h-[44px] items-center justify-center rounded-2xl transition-all duration-150 active:scale-90",
              isWork
                ? "text-primary"
                : "text-muted-foreground/75 hover:text-foreground",
            )}
          >
            {isWork && (
              <span className="absolute top-1 h-1 w-4 rounded-full bg-primary" />
            )}
            <Layers3
              className={cn(
                "h-[21px] w-[21px] transition-transform duration-150",
                isWork && "scale-110",
              )}
              strokeWidth={isWork ? 2.4 : 1.9}
            />
            <span className="sr-only">Work</span>
          </Link>

          <Link
            to="/settings"
            aria-label="Settings"
            className={cn(
              "relative flex min-h-[44px] items-center justify-center rounded-2xl transition-all duration-150 active:scale-90",
              isSettings
                ? "text-primary"
                : "text-muted-foreground/75 hover:text-foreground",
            )}
          >
            {isSettings && (
              <span className="absolute top-1 h-1 w-4 rounded-full bg-primary" />
            )}
            <Settings
              className={cn(
                "h-[21px] w-[21px] transition-transform duration-150",
                isSettings && "scale-110",
              )}
              strokeWidth={isSettings ? 2.4 : 1.9}
            />
            <span className="sr-only">Settings</span>
          </Link>
        </div>
      </nav>

      {/* Desktop Floating Top Navigation */}
      <nav className="no-print fixed left-1/2 top-4 z-40 hidden w-[min(calc(100vw-2rem),84rem)] -translate-x-1/2 sm:block">
        <div className="glass-strong flex items-center justify-between gap-2.5 rounded-full p-2">
          {/* Top-Level Workspace Switcher: Dashboard · Personal · Work */}
          <div className="shrink-0">
            <WorkspaceSwitcher
              activeWorkspace={activeWorkspace}
              onSwitch={handleWorkspaceSwitch}
            />
          </div>

          {/* Context-Scoped Center Area */}
          {isLegacyStudio ? (
            <div className="flex min-w-0 flex-1 items-center justify-center gap-2 px-2 text-xs">
              <Link
                to="/personal"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 font-medium text-primary whitespace-nowrap hover:bg-primary hover:text-primary-foreground"
              >
                <ArrowLeft className="h-3.5 w-3.5 shrink-0" />
                Back to Personal
              </Link>
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
          ) : (
            <div className="flex min-w-0 flex-1 items-center justify-center gap-2 px-2 text-xs">
              <span className="hidden truncate text-muted-foreground lg:inline">
                Personal expense &amp; income overview · Quick receipt scanner
              </span>
            </div>
          )}

          {/* Quick Scan, Install, Theme & Settings (Desktop) */}
          <div className="flex shrink-0 items-center gap-1">
            <PWAInstallButton />
            <button
              type="button"
              onClick={() => openScanner("Personal")}
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

      <main className="mx-auto max-w-6xl px-3 pt-[4.25rem] sm:px-4 sm:pt-24">
        {children}
      </main>
      <OfflineIndicator />
    </div>
  );
}
