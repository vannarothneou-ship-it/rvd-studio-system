import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutGrid,
  FolderKanban,
  Users,
  FileText,
  Wallet,
  Settings,
  Sun,
  Moon,
  Layers,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { getDB, invoiceView, useDB } from "@/lib/store";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/", label: "Overview", icon: LayoutGrid },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/clients", label: "Clients", icon: Users },
  { to: "/services", label: "Services", icon: Layers },
  { to: "/invoices", label: "Invoices", icon: FileText },
  { to: "/finance", label: "Finance", icon: Wallet },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const overdue = useDB(
    (d) =>
      d.invoices.filter((i) => invoiceView(i, getDB()).status === "Overdue")
        .length,
  );
  const [light, setLight] = useState(false);

  useEffect(() => {
    setLight(localStorage.getItem("rv-theme") === "light");
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("light", light);
    localStorage.setItem("rv-theme", light ? "light" : "dark");
  }, [light]);

  const active = (to: string) =>
    to === "/" ? path === "/" : path.startsWith(to);

  return (
    <div className="min-h-screen pb-28 sm:pb-10">
      <nav className="no-print fixed inset-x-3 bottom-3 z-40 sm:inset-x-auto sm:left-1/2 sm:top-4 sm:bottom-auto sm:w-[min(calc(100vw-2rem),70rem)] sm:-translate-x-1/2">
        <div className="glass-strong flex items-center gap-1.5 rounded-full p-1.5 sm:gap-2 sm:p-2">
          <Link
            to="/"
            className="hidden shrink-0 items-center gap-2.5 pl-1.5 pr-2 lg:flex"
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-primary font-display text-sm font-black text-primary-foreground">
              RV
            </span>
            <span className="leading-tight">
              <b className="block font-display text-sm">RothVan</b>
              <span className="text-[0.7rem] text-muted-foreground">
                Design studio
              </span>
            </span>
          </Link>
          <div className="flex min-w-0 flex-1 items-center justify-between gap-1 sm:justify-center">
            {tabs.map((t) => (
              <Link
                key={t.to}
                to={t.to}
                className={cn(
                  "relative flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-full px-1 py-2 text-[0.6rem] transition-colors sm:flex-none sm:flex-row sm:gap-1.5 sm:px-2.5 sm:text-xs lg:px-3 lg:text-sm",
                  active(t.to)
                    ? "text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {active(t.to) && (
                  <span className="absolute inset-0 -z-0 rounded-full bg-primary animate-in zoom-in-90 fade-in duration-300" />
                )}
                <t.icon className="relative h-4 w-4" />
                <span className="relative">{t.label}</span>
                {t.to === "/invoices" && overdue > 0 && (
                  <span className="absolute right-1 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[0.6rem] font-bold text-destructive-foreground sm:relative sm:right-0 sm:top-0">
                    {overdue}
                  </span>
                )}
              </Link>
            ))}
          </div>
          <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
            <button
              type="button"
              onClick={() => setLight(!light)}
              aria-label="Toggle theme"
              className="hidden rounded-full p-2.5 text-muted-foreground hover:bg-accent hover:text-foreground sm:block"
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
                "rounded-full p-2.5 hover:bg-accent",
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
      <main className="mx-auto max-w-6xl px-4 pt-6 sm:pt-24">{children}</main>
    </div>
  );
}
