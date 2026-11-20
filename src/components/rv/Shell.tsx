import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  FileText,
  FolderKanban,
  Layers3,
  LayoutDashboard,
  Moon,
  PiggyBank,
  ScanLine,
  Settings,
  Sun,
  Users,
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

const studioNav = [
  { to: "/studio", label: "Overview", icon: LayoutDashboard },
  { to: "/clients", label: "Clients", icon: Users },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/invoices", label: "Invoices", icon: FileText },
  { to: "/finance", label: "Finance", icon: Wallet },
] as const;

/* Instagram-style Outline / Filled Navigation Icons with explicit 20x20 bounds */
function NavHomeIcon({ active }: { active: boolean }) {
  return active ? (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      className="h-5 w-5 shrink-0 transition-transform duration-200 scale-105"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M21.5 10.3 12.8 2.8a1.2 1.2 0 0 0-1.6 0l-8.7 7.5A1.2 1.2 0 0 0 2 11.2V20a2 2 0 0 0 2 2h4.75a1 1 0 0 0 1-1v-5.25a1.25 1.25 0 0 1 1.25-1.25h2a1.25 1.25 0 0 1 1.25 1.25V21a1 1 0 0 0 1 1H20a2 2 0 0 0 2-2v-8.8a1.2 1.2 0 0 0-.5-.9Z" />
    </svg>
  ) : (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      className="h-5 w-5 shrink-0 transition-transform duration-200"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 10.5 12 3l9 7.5V20a1.5 1.5 0 0 1-1.5 1.5H14v-6a2 2 0 0 0-4 0v6H4.5A1.5 1.5 0 0 1 3 20v-9.5Z" />
    </svg>
  );
}

function NavStudioIcon({ active }: { active: boolean }) {
  return active ? (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      className="h-5 w-5 shrink-0 transition-transform duration-200 scale-105"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9 3.5A2.5 2.5 0 0 0 6.5 6v1H4a2 2 0 0 0-2 2v3.5a2 2 0 0 0 1.2 1.83c2.8 1.22 5.75 1.82 8.8 1.82s6-.6 8.8-1.82A2 2 0 0 0 22 12.5V9a2 2 0 0 0-2-2h-2.5V6A2.5 2.5 0 0 0 15 3.5H9ZM8.5 7V6a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 .5.5v1h-7Z"
      />
      <path d="M2 15.2V19a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-3.8c-3.05 1.22-6.4 1.8-10 1.8s-6.95-.58-10-1.8Z" />
    </svg>
  ) : (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      className="h-5 w-5 shrink-0 transition-transform duration-200"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      <rect width="20" height="14" x="2" y="6" rx="2" />
    </svg>
  );
}

function NavWalletIcon({ active }: { active: boolean }) {
  return active ? (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      className="h-5 w-5 shrink-0 transition-transform duration-200 scale-105"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.5 4.5A2.5 2.5 0 0 0 2 7v10.5A2.5 2.5 0 0 0 4.5 20h15a2.5 2.5 0 0 0 2.5-2.5V9.5A2.5 2.5 0 0 0 19.5 7H4.5a.75.75 0 0 1 0-1.5h14.75a.75.75 0 0 0 0-1.5H4.5Zm13.25 9.25a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z"
      />
    </svg>
  ) : (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      className="h-5 w-5 shrink-0 transition-transform duration-200"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M19 7V5.5A1.5 1.5 0 0 0 17.5 4h-13A2 2 0 0 0 2.5 6v12a2 2 0 0 0 2 2h15a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-15a1.5 1.5 0 0 1 0-3" />
      <circle cx="17.5" cy="13.5" r="1.25" fill="currentColor" stroke="none" />
    </svg>
  );
}

function NavWorkIcon({ active }: { active: boolean }) {
  return active ? (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      className="h-5 w-5 shrink-0 transition-transform duration-200 scale-105"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12.53 2.56a1.1 1.1 0 0 0-1.06 0l-8.6 4.7a1 1 0 0 0 0 1.76l8.6 4.7a1.1 1.1 0 0 0 1.06 0l8.6-4.7a1 1 0 0 0 0-1.76l-8.6-4.7Z" />
      <path
        d="M3.1 11.75a.9.9 0 0 1 1.22-.35L12 15.6l7.68-4.2a.9.9 0 1 1 .86 1.58l-8.1 4.43a.92.92 0 0 1-.88 0l-8.1-4.43a.9.9 0 0 1-.36-1.23Z"
        opacity={0.9}
      />
      <path
        d="M3.1 15.85a.9.9 0 0 1 1.22-.35L12 19.7l7.68-4.2a.9.9 0 1 1 .86 1.58l-8.1 4.43a.92.92 0 0 1-.88 0l-8.1-4.43a.9.9 0 0 1-.36-1.23Z"
        opacity={0.75}
      />
    </svg>
  ) : (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      className="h-5 w-5 shrink-0 transition-transform duration-200"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m12 3 9 4.9-9 4.9-9-4.9L12 3Z" />
      <path d="m3 12.2 9 4.9 9-4.9" />
      <path d="m3 16.5 9 4.9 9-4.9" />
    </svg>
  );
}

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

  useEffect(() => {
    setBarsHidden(false);
    lastScrollYRef.current = typeof window !== "undefined" ? window.scrollY : 0;
  }, [path]);

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
  const isStudio = !isDashboard && !isPersonal && !isWork && !isSettings;

  const activeWorkspace: WorkspaceMode = isDashboard
    ? "dashboard"
    : isStudio
      ? "studio"
      : isWork
        ? "work"
        : "personal";

  const handleWorkspaceSwitch = (next: WorkspaceMode) => {
    if (next === "dashboard") {
      navigate({ to: "/" });
    } else if (next === "studio") {
      navigate({ to: "/studio" });
    } else if (next === "personal") {
      navigate({ to: "/personal" });
    } else {
      navigate({ to: "/work" });
    }
  };

  const active = (to: string) => path.startsWith(to);

  const pageLabel = isDashboard
    ? "Dashboard"
    : isStudio
      ? "Studio"
      : isPersonal
        ? "Personal"
        : isWork
          ? "Work"
          : "Settings";

  const swipeTabs = ["/", "/studio", "/personal", "/work"] as const;
  const activeTabIndex = isDashboard
    ? 0
    : isStudio
      ? 1
      : isPersonal
        ? 2
        : isWork
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
      className="min-h-screen pb-[calc(5.75rem+env(safe-area-inset-bottom))] sm:pb-12"
    >
      {/* Floating Frosted Mobile Header (Auto-hides on scroll down) */}
      <header
        className={cn(
          "no-print fixed inset-x-3 top-[max(0.5rem,env(safe-area-inset-top))] z-40 rounded-2xl border border-white/14 bg-[#121319]/82 px-3 py-1.5 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md backdrop-saturate-150 transition-[transform,opacity] duration-200 ease-out will-change-transform [.light_&]:border-black/10 [.light_&]:bg-[#faf8f4]/86 [.light_&]:shadow-[0_10px_28px_-12px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,0.75)] sm:hidden",
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
            <Link
              to="/settings"
              aria-label="Settings"
              className={cn(
                "grid h-9 w-9 place-items-center rounded-full transition-transform duration-150 active:scale-90",
                isSettings
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <Settings className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {isStudio && (
          <nav
            aria-label="Studio sections"
            className="no-scrollbar mt-1 flex items-center gap-1 overflow-x-auto border-t border-white/10 pt-1 [.light_&]:border-black/10"
          >
            {studioNav.map((it) => {
              const Icon = it.icon;
              const on = active(it.to);
              return (
                <Link
                  key={it.to}
                  to={it.to}
                  aria-current={on ? "page" : undefined}
                  className={cn(
                    "inline-flex min-h-8 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-[0.68rem] font-medium transition-[background-color,color,transform] duration-200 active:scale-[0.97]",
                    on
                      ? "bg-primary/20 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  <Icon className="h-3 w-3" />
                  {it.label}
                </Link>
              );
            })}
          </nav>
        )}
      </header>

      {/* Floating Frosted Icon-Only Bottom Dock (5 items, Settings moved to top bar) */}
      <nav
        aria-label="Mobile navigation"
        className={cn(
          "no-print fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 mx-auto max-w-md rounded-[28px] border border-white/15 bg-[#121319]/84 px-1.5 py-1.5 shadow-[0_18px_40px_-14px_rgba(0,0,0,0.72),inset_0_1px_0_rgba(255,255,255,0.09)] backdrop-blur-md backdrop-saturate-150 transition-[transform,opacity] duration-200 ease-out will-change-transform [.light_&]:border-black/10 [.light_&]:bg-[#faf8f4]/88 [.light_&]:shadow-[0_16px_36px_-14px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.8)] sm:hidden",
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
            <NavHomeIcon active={isDashboard} />
            <span className="sr-only">Dashboard</span>
          </Link>

          <Link
            to="/studio"
            aria-label="Studio"
            className={cn(
              "relative flex min-h-[44px] items-center justify-center rounded-2xl transition-all duration-150 active:scale-90",
              isStudio
                ? "text-primary"
                : "text-muted-foreground/75 hover:text-foreground",
            )}
          >
            <NavStudioIcon active={isStudio} />
            <span className="sr-only">Studio</span>
          </Link>

          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={() => openScanner(isStudio ? "Studio" : "Personal")}
              aria-label="Scan receipt"
              className="grid h-10 w-11 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-[0_8px_22px_-6px_var(--primary)] transition-transform duration-150 active:scale-90"
            >
              <ScanLine className="h-[18px] w-[18px]" strokeWidth={2.2} />
            </button>
          </div>

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
            <NavWalletIcon active={isPersonal} />
            <span className="sr-only">Personal</span>
          </Link>

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
            <NavWorkIcon active={isWork} />
            <span className="sr-only">Work</span>
          </Link>
        </div>
      </nav>

      {/* Desktop Floating Top Navigation */}
      <nav className="no-print fixed left-1/2 top-4 z-40 hidden w-[min(calc(100vw-2rem),84rem)] -translate-x-1/2 sm:block">
        <div className="glass-strong flex items-center justify-between gap-2.5 rounded-full p-2">
          {/* Top-Level Workspace Switcher: Dashboard · Studio · Personal · Work */}
          <div className="shrink-0">
            <WorkspaceSwitcher
              activeWorkspace={activeWorkspace}
              onSwitch={handleWorkspaceSwitch}
            />
          </div>

          {/* Context-Scoped Center Area */}
          {isStudio ? (
            <div className="no-scrollbar flex min-w-0 flex-1 items-center justify-center gap-1 overflow-x-auto px-2">
              {studioNav.map((it) => {
                const Icon = it.icon;
                const on = active(it.to);
                return (
                  <Link
                    key={it.to}
                    to={it.to}
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                      on
                        ? "bg-primary/18 text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                    )}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span>{it.label}</span>
                  </Link>
                );
              })}
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
                Studio, Personal &amp; Work overview · On-device AI scanner
              </span>
            </div>
          )}

          {/* Quick Scan, Install, Theme & Settings (Desktop) */}
          <div className="flex shrink-0 items-center gap-1">
            <PWAInstallButton />
            <button
              type="button"
              onClick={() => openScanner(isStudio ? "Studio" : "Personal")}
              className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-primary/40 bg-primary/15 px-3 py-2 text-xs font-semibold text-primary transition-all hover:bg-primary hover:text-primary-foreground active:scale-95"
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
