import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  AlertTriangle,
  FileText,
  FolderKanban,
  Moon,
  ScanLine,
  Search,
  Settings,
  Sun,
  Users,
  Wallet,
} from "lucide-react";
import { CommandPalette } from "@/components/rv/CommandPalette";
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
import { retryPersistDB, usePersistStatus } from "@/lib/store";
import { cn } from "@/lib/utils";

const studioNav = [
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
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [topHidden, setTopHidden] = useState(false);
  const lastScrollYRef = useRef(0);
  const persistStatus = usePersistStatus();

  useEffect(() => {
    setLight(localStorage.getItem("rv-theme") === "light");
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("light", light);
    localStorage.setItem("rv-theme", light ? "light" : "dark");
  }, [light]);

  useEffect(() => {
    setTopHidden(false);
    lastScrollYRef.current =
      typeof window !== "undefined" ? Math.max(0, window.scrollY) : 0;
  }, [path]);

  useEffect(() => {
    let rafId = 0;
    const onScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        const y = Math.max(0, window.scrollY);
        const prev = lastScrollYRef.current;
        const delta = y - prev;
        const maxScroll = Math.max(
          0,
          document.documentElement.scrollHeight - window.innerHeight,
        );

        if (y <= 12) {
          setTopHidden(false);
          lastScrollYRef.current = y;
          return;
        }

        // Ignore tiny rubber-band jitter at bottom edge
        if (maxScroll > 60 && y >= maxScroll - 6 && delta < 0 && delta > -14) {
          lastScrollYRef.current = y;
          return;
        }

        if (delta > 6 && y > 16) {
          // Scroll down: hide top navigation, keep/reveal bottom dock
          setTopHidden(true);
          lastScrollYRef.current = y;
        } else if (delta < -6) {
          // Keep the primary dock available; reveal the compact header on scroll up.
          setTopHidden(false);
          lastScrollYRef.current = y;
        } else if (Math.abs(delta) > 2) {
          lastScrollYRef.current = y;
        }
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
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

  const prevTabIndexRef = useRef<number>(activeTabIndex);
  const [swipeDir, setSwipeDir] = useState<-1 | 0 | 1>(0);
  useEffect(() => {
    const prev = prevTabIndexRef.current;
    if (prev >= 0 && activeTabIndex >= 0 && prev !== activeTabIndex) {
      setSwipeDir(activeTabIndex > prev ? 1 : -1);
    } else if (prev !== activeTabIndex) {
      setSwipeDir(0);
    }
    prevTabIndexRef.current = activeTabIndex;
  }, [activeTabIndex]);

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
    if (dt > 520 || Math.abs(dx) < 62 || Math.abs(dx) < Math.abs(dy) * 1.35) {
      return;
    }
    const nextIdx =
      dx < 0
        ? Math.min(swipeTabs.length - 1, activeTabIndex + 1)
        : Math.max(0, activeTabIndex - 1);
    if (nextIdx !== activeTabIndex) {
      setSwipeDir(nextIdx > activeTabIndex ? 1 : -1);
      navigate({ to: swipeTabs[nextIdx]! });
    }
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="min-h-screen pb-[calc(6.25rem+env(safe-area-inset-bottom))] sm:pb-12"
    >
      {/* Mobile Floating Frosted Glass Header (hides on scroll down, reappears on scroll up) */}
      <header
        onFocusCapture={() => setTopHidden(false)}
        className={cn(
          "no-print pointer-events-none sticky top-0 z-40 w-full px-3 pt-[max(0.5rem,env(safe-area-inset-top))] pb-1.5 transition-[opacity,transform] duration-250 ease-[cubic-bezier(0.32,0.72,0,1)] will-change-transform sm:hidden",
          topHidden
            ? "-translate-y-[120%] opacity-0"
            : "translate-y-0 opacity-100",
        )}
      >
        <div
          className={cn(
            "mx-auto rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-strong)] px-3 py-1.5 shadow-[var(--shadow-glass)] backdrop-blur-2xl backdrop-saturate-150",
            topHidden ? "pointer-events-none" : "pointer-events-auto",
          )}
        >
          <div className="flex h-10 w-full items-center justify-between gap-2">
            <Link to="/" className="ios-tap flex min-w-0 items-center gap-2.5">
              <img
                src="/apple-touch-icon.png"
                alt="RothVan"
                className="h-7 w-7 shrink-0 rounded-lg border border-border object-cover shadow-xs"
              />
              <div className="min-w-0">
                <span className="block truncate font-display text-sm font-bold tracking-tight text-foreground">
                  {pageLabel}
                </span>
              </div>
            </Link>

            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => setPaletteOpen(true)}
                aria-label="Quick command & search"
                className="grid h-9 w-9 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-accent hover:text-foreground active:scale-95"
              >
                <Search className="h-4 w-4" />
              </button>
              <PWAInstallButton compact />
              <button
                type="button"
                onClick={() => setLight(!light)}
                aria-label="Toggle theme"
                className="grid h-9 w-9 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-accent hover:text-foreground active:scale-95"
              >
                {light ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4 text-primary" />
                )}
              </button>
              <Link
                to="/settings"
                aria-label="Settings"
                className={cn(
                  "ios-tap grid h-9 w-9 place-items-center rounded-xl transition-colors",
                  isSettings
                    ? "bg-primary text-primary-foreground"
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
              className="no-scrollbar mt-1.5 flex items-center gap-1 overflow-x-auto border-t border-border/70 pt-1.5"
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
                      "ios-tap inline-flex min-h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 text-[0.72rem] font-medium transition-colors",
                      on
                        ? "bg-primary/18 text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {it.label}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>
      </header>

      {/* Persistent mobile floating navigation dock */}
      <nav
        aria-label="Mobile navigation"
        className={cn(
          "no-print pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pt-2 pb-[max(0.65rem,env(safe-area-inset-bottom))] transition-[opacity,transform] duration-250 ease-[cubic-bezier(0.32,0.72,0,1)] will-change-transform sm:hidden",
          "translate-y-0 opacity-100",
        )}
      >
        <div
          className={cn(
            "mx-auto grid max-w-md grid-cols-5 items-center gap-1 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-strong)] px-2 py-1.5 shadow-[0_14px_34px_-12px_oklch(0_0_0/52%),inset_0_1px_0_oklch(1_0_0/12%)] backdrop-blur-2xl backdrop-saturate-150",
            "pointer-events-auto",
          )}
        >
          <Link
            to="/"
            aria-label="Dashboard"
            className={cn(
              "ios-tap relative flex min-h-[44px] flex-col items-center justify-center gap-0.5 rounded-xl transition-colors",
              isDashboard
                ? "bg-primary/12 text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <NavHomeIcon active={isDashboard} />
            <span className="text-[0.62rem] font-semibold tracking-tight">
              Home
            </span>
          </Link>

          <Link
            to="/studio"
            aria-label="Studio"
            className={cn(
              "ios-tap relative flex min-h-[44px] flex-col items-center justify-center gap-0.5 rounded-xl transition-colors",
              isStudio
                ? "bg-primary/12 text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <NavStudioIcon active={isStudio} />
            <span className="text-[0.62rem] font-semibold tracking-tight">
              Studio
            </span>
          </Link>

          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={() => openScanner(isStudio ? "Studio" : "Personal")}
              aria-label="Scan receipt"
              className="grid h-11 w-12 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[0_6px_18px_-4px_color-mix(in_oklch,var(--primary)_50%,transparent)] transition-transform duration-150 hover:bg-[var(--primary-hover,var(--primary))] active:scale-92"
            >
              <ScanLine className="h-[19px] w-[19px]" strokeWidth={2.3} />
            </button>
          </div>

          <Link
            to="/personal"
            aria-label="Personal"
            className={cn(
              "ios-tap relative flex min-h-[44px] flex-col items-center justify-center gap-0.5 rounded-xl transition-colors",
              isPersonal
                ? "bg-primary/12 text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <NavWalletIcon active={isPersonal} />
            <span className="text-[0.62rem] font-semibold tracking-tight">
              Money
            </span>
          </Link>

          <Link
            to="/work"
            aria-label="Work"
            className={cn(
              "ios-tap relative flex min-h-[44px] flex-col items-center justify-center gap-0.5 rounded-xl transition-colors",
              isWork
                ? "bg-primary/12 text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <NavWorkIcon active={isWork} />
            <span className="text-[0.62rem] font-semibold tracking-tight">
              Work
            </span>
          </Link>
        </div>
      </nav>

      {/* Desktop Floating Frosted Glass Top Navigation (hides on scroll down, reappears on scroll up) */}
      <nav
        onFocusCapture={() => setTopHidden(false)}
        className={cn(
          "no-print pointer-events-none sticky top-0 z-40 hidden w-full px-4 pt-3 pb-2 transition-[opacity,transform] duration-250 ease-[cubic-bezier(0.32,0.72,0,1)] will-change-transform sm:block",
          topHidden
            ? "-translate-y-[120%] opacity-0"
            : "translate-y-0 opacity-100",
        )}
      >
        <div
          className={cn(
            "mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-strong)] px-3.5 py-2 shadow-[var(--shadow-glass)] backdrop-blur-2xl backdrop-saturate-150",
            topHidden ? "pointer-events-none" : "pointer-events-auto",
          )}
        >
          {/* Zone 1: Workspace Switcher */}
          <div className="shrink-0">
            <WorkspaceSwitcher
              activeWorkspace={activeWorkspace}
              onSwitch={handleWorkspaceSwitch}
            />
          </div>

          {/* Zone 2: Studio Links */}
          <div className="no-scrollbar flex min-w-0 flex-1 items-center justify-center gap-1 overflow-x-auto px-2">
            {isStudio ? (
              studioNav.map((it) => {
                const Icon = it.icon;
                const on = active(it.to);
                return (
                  <Link
                    key={it.to}
                    to={it.to}
                    aria-current={on ? "page" : undefined}
                    className={cn(
                      "ios-tap inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                      on
                        ? "bg-primary/18 text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                    )}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span>{it.label}</span>
                  </Link>
                );
              })
            ) : (
              <span className="hidden truncate text-xs text-muted-foreground lg:inline">
                {isPersonal
                  ? "Income, daily spending, cards & saving goals"
                  : isWork
                    ? "DBG, Connexion, OCIC & SDBPP tasks & pipeline"
                    : "RothVan Ledger · Unified workspace"}
              </span>
            )}
          </div>

          {/* Zone 3: Primary Action + Theme & Settings */}
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              aria-label="Quick command bar (⌘K)"
              className="inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl border border-border/80 bg-secondary/70 px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/45 hover:text-foreground"
            >
              <Search className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden lg:inline">Quick</span>
              <kbd className="font-num hidden rounded border border-border/70 bg-background/60 px-1 text-[0.62rem] font-semibold md:inline">
                ⌘K
              </kbd>
            </button>
            <PWAInstallButton />
            <button
              type="button"
              onClick={() => openScanner(isStudio ? "Studio" : "Personal")}
              className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-[0_6px_18px_-6px_color-mix(in_oklch,var(--primary)_50%,transparent)] transition-all hover:bg-[var(--primary-hover,var(--primary))] active:scale-95"
            >
              <ScanLine className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden md:inline">Scan Slip</span>
            </button>
            <button
              type="button"
              onClick={() => setLight(!light)}
              aria-label="Toggle theme"
              className="grid h-8 w-8 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {light ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4 text-primary" />
              )}
            </button>
            <Link
              to="/settings"
              aria-label="Settings"
              className={cn(
                "ios-tap grid h-8 w-8 place-items-center rounded-xl transition-colors hover:bg-accent",
                active("/settings")
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Settings className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </nav>

      <main
        key={path}
        className={cn(
          "mx-auto max-w-6xl px-3 pt-1.5 sm:px-4 sm:pt-3",
          swipeDir > 0
            ? "page-enter-next"
            : swipeDir < 0
              ? "page-enter-prev"
              : "page-enter",
        )}
      >
        {persistStatus.lastError && (
          <div
            role="alert"
            className="no-print mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-destructive/45 bg-destructive/12 px-4 py-3 text-xs text-foreground"
          >
            <div className="flex min-w-0 items-start gap-2.5">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              <div className="min-w-0">
                <p className="font-semibold text-destructive">
                  {persistStatus.quotaExceeded
                    ? "Browser storage limit reached"
                    : "Local save issue"}
                </p>
                <p className="mt-0.5 text-muted-foreground">
                  {persistStatus.lastError}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => retryPersistDB()}
                className="inline-flex min-h-[32px] items-center rounded-full border border-border bg-background px-3 font-medium hover:bg-accent"
              >
                Retry Save
              </button>
              <Link
                to="/settings"
                className="inline-flex min-h-[32px] items-center rounded-full bg-primary px-3 font-medium text-primary-foreground hover:opacity-90"
              >
                Backup &amp; Storage
              </Link>
            </div>
          </div>
        )}
        {children}
      </main>
      <OfflineIndicator />
      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        isStudioContext={isStudio}
      />
    </div>
  );
}
