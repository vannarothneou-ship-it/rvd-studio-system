import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { motion, MotionConfig } from "motion/react";
import {
  LayoutGrid,
  FolderKanban,
  Users,
  FileText,
  Wallet,
  PiggyBank,
  Settings,
  Sun,
  Moon,
  Layers,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { invoiceStatus, isInvoice, useDB } from "@/lib/store";
import {
  WorkspaceSwitcher,
  type WorkspaceMode,
} from "@/components/rv/WorkspaceSwitcher";
import { cn } from "@/lib/utils";

const studioTabs = [
  { to: "/", label: "Dashboard", icon: LayoutGrid },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/clients", label: "Clients", icon: Users },
  { to: "/services", label: "Services", icon: Layers },
  { to: "/invoices", label: "Invoices", icon: FileText },
  { to: "/finance", label: "Finance", icon: Wallet },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const navigate = useNavigate();

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
  const lastStudioPathRef = useRef<string>("/");

  useEffect(() => {
    setLight(localStorage.getItem("rv-theme") === "light");
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("light", light);
    localStorage.setItem("rv-theme", light ? "light" : "dark");
  }, [light]);

  const isPersonal = path.startsWith("/personal");
  const activeWorkspace: WorkspaceMode = isPersonal ? "personal" : "studio";

  useEffect(() => {
    if (!isPersonal && !path.startsWith("/settings")) {
      lastStudioPathRef.current = path;
    }
  }, [isPersonal, path]);

  const handleWorkspaceSwitch = (next: WorkspaceMode) => {
    if (next === activeWorkspace) return;
    if (next === "personal") {
      navigate({ to: "/personal" });
    } else {
      const target = lastStudioPathRef.current;
      if (target.startsWith("/projects")) navigate({ to: "/projects" });
      else if (target.startsWith("/clients")) navigate({ to: "/clients" });
      else if (target.startsWith("/services")) navigate({ to: "/services" });
      else if (target.startsWith("/invoices")) navigate({ to: "/invoices" });
      else if (target.startsWith("/finance")) navigate({ to: "/finance" });
      else navigate({ to: "/" });
    }
  };

  const active = (to: string) =>
    to === "/" ? path === "/" : path.startsWith(to);

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen pb-28 sm:pb-10">
        {/* Mobile top workspace switcher bar */}
        <div className="no-print sticky top-3 z-40 mx-3 mb-2 flex items-center justify-between gap-2 sm:hidden">
          <div className="glass-strong flex w-full items-center justify-between gap-2 rounded-full px-2.5 py-1.5">
            <WorkspaceSwitcher
              compact
              layoutId="workspace-switcher-pill-mobile"
              activeWorkspace={activeWorkspace}
              onSwitch={handleWorkspaceSwitch}
            />
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => setLight(!light)}
                aria-label="Toggle theme"
                className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
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
                  "rounded-full p-2 transition-colors hover:bg-accent",
                  active("/settings")
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground",
                )}
              >
                <Settings className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Desktop top floating dock / mobile bottom tab dock */}
        <nav className="no-print fixed inset-x-3 bottom-3 z-40 sm:inset-x-auto sm:left-1/2 sm:top-4 sm:bottom-auto sm:w-[min(calc(100vw-2rem),78rem)] sm:-translate-x-1/2">
          <div className="glass-strong flex items-center justify-between gap-2 rounded-full p-1.5 sm:gap-3 sm:p-2">
            {/* Top-Level Workspace Switcher */}
            <div className="hidden shrink-0 items-center gap-2 sm:flex">
              <WorkspaceSwitcher
                activeWorkspace={activeWorkspace}
                onSwitch={handleWorkspaceSwitch}
              />
            </div>

            {/* Context-Scoped Navigation */}
            {isPersonal ? (
              <div className="flex min-w-0 flex-1 items-center justify-center gap-2 px-2 py-1 text-xs sm:text-sm">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 font-medium text-primary whitespace-nowrap">
                  <PiggyBank className="h-3.5 w-3.5 shrink-0" />
                  Personal Money
                </span>
                <span className="hidden truncate text-xs text-muted-foreground md:inline">
                  Income, daily spending, cards &amp; saving goals — isolated
                  from studio data
                </span>
              </div>
            ) : (
              <div className="flex min-w-0 flex-1 items-center justify-between gap-0.5 sm:justify-center sm:gap-1">
                {studioTabs.map((t) => {
                  const isActive = active(t.to);
                  return (
                    <Link
                      key={t.to}
                      to={t.to}
                      className={cn(
                        "relative flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-full px-1 py-2 text-[0.58rem] transition-colors sm:flex-none sm:flex-row sm:gap-1.5 sm:px-2.5 sm:text-xs lg:px-3 lg:text-sm",
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
                        <span className="font-num relative z-10 right-1 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[0.6rem] font-bold text-destructive-foreground sm:right-0 sm:top-0">
                          {overdue}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Theme & Settings (Desktop) */}
            <div className="hidden shrink-0 items-center gap-0.5 sm:flex sm:gap-1">
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

        <main className="mx-auto max-w-6xl px-4 pt-2 sm:pt-24">{children}</main>
      </div>
    </MotionConfig>
  );
}
