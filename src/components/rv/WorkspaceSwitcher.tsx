import { Briefcase, Home, Layers3, PiggyBank } from "lucide-react";
import { cn } from "@/lib/utils";

export type WorkspaceMode = "dashboard" | "studio" | "work" | "personal";

const WORKSPACES: {
  id: WorkspaceMode;
  label: string;
  subtitle: string;
  icon: typeof Home;
}[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    subtitle: "Unified command center across Studio, Work & Personal",
    icon: Home,
  },
  {
    id: "studio",
    label: "Studio",
    subtitle: "Freelance clients, projects, quotations & invoices",
    icon: Briefcase,
  },
  {
    id: "work",
    label: "Work",
    subtitle: "Full-time design tasks, mockups & combined output",
    icon: Layers3,
  },
  {
    id: "personal",
    label: "Personal",
    subtitle: "Personal income, daily spending, cards & saving goals",
    icon: PiggyBank,
  },
];

export function WorkspaceSwitcher({
  activeWorkspace,
  onSwitch,
  compact = false,
  className,
}: {
  activeWorkspace: WorkspaceMode;
  onSwitch: (next: WorkspaceMode) => void;
  layoutId?: string;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label="Workspace context switcher"
      className={cn(
        "no-scrollbar inline-flex max-w-full shrink-0 items-center gap-0.5 overflow-x-auto rounded-full border border-border bg-muted/75 p-1 sm:gap-1",
        className,
      )}
    >
      {WORKSPACES.map((ws) => {
        const active = activeWorkspace === ws.id;
        const Icon = ws.icon;
        return (
          <button
            key={ws.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onSwitch(ws.id)}
            title={`${ws.label} — ${ws.subtitle}`}
            className={cn(
              "relative inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full font-medium transition-colors",
              compact
                ? "min-h-[36px] px-2.5 py-1.5 text-[0.72rem]"
                : "min-h-[38px] px-3 py-1.5 text-xs sm:text-sm",
              active
                ? "bg-primary text-primary-foreground shadow-[0_6px_18px_-6px_var(--primary)]"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span className="whitespace-nowrap">{ws.label}</span>
          </button>
        );
      })}
    </div>
  );
}
