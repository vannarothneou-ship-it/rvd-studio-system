import { Briefcase, Home, Layers3, PiggyBank } from "lucide-react";
import { cn } from "@/lib/utils";

export type WorkspaceMode = "dashboard" | "studio" | "personal" | "work";

const WORKSPACES: {
  id: WorkspaceMode;
  label: string;
  subtitle: string;
  icon: typeof Home;
}[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    subtitle: "Unified Studio, Personal & Work command view",
    icon: Home,
  },
  {
    id: "studio",
    label: "Studio",
    subtitle: "Clients, quotations, invoices & studio cash flow",
    icon: Briefcase,
  },
  {
    id: "personal",
    label: "Personal",
    subtitle: "Personal income, daily spending, cards & saving goals",
    icon: PiggyBank,
  },
  {
    id: "work",
    label: "Work",
    subtitle: "Design tasks, mockups & portfolio showcase",
    icon: Layers3,
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
      aria-label="Workspace switcher"
      className={cn(
        "no-scrollbar inline-flex max-w-full shrink-0 items-center gap-0.5 overflow-x-auto rounded-lg border border-border bg-muted p-0.5 sm:gap-1",
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
              "relative inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md font-medium transition-colors",
              compact
                ? "min-h-[34px] px-2.5 py-1 text-[0.72rem]"
                : "min-h-[34px] px-3 py-1.5 text-xs sm:text-sm",
              active
                ? "bg-primary text-primary-foreground"
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
