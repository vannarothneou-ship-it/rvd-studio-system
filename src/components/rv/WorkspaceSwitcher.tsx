import { motion } from "motion/react";
import { Briefcase, Layers3, PiggyBank } from "lucide-react";
import { cn } from "@/lib/utils";

export type WorkspaceMode = "studio" | "work" | "personal";

const WORKSPACES: {
  id: WorkspaceMode;
  label: string;
  subtitle: string;
  icon: typeof Briefcase;
}[] = [
  {
    id: "studio",
    label: "Studio",
    subtitle: "Freelance clients, projects & invoices",
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
    subtitle: "Personal income, daily spending & savings",
    icon: PiggyBank,
  },
];

export function WorkspaceSwitcher({
  activeWorkspace,
  onSwitch,
  layoutId = "workspace-switcher-pill",
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
        "inline-flex shrink-0 items-center gap-1 rounded-full border border-border bg-muted/75 p-1",
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
                ? "px-2.5 py-1.5 text-xs"
                : "px-3 py-1.5 text-xs sm:text-sm",
              active
                ? "text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                transition={{ type: "spring", stiffness: 460, damping: 34 }}
                className="absolute inset-0 rounded-full bg-primary shadow-[0_6px_18px_-6px_var(--primary)]"
              />
            )}
            <Icon className="relative z-10 h-3.5 w-3.5 shrink-0" />
            <span className="relative z-10 whitespace-nowrap">{ws.label}</span>
          </button>
        );
      })}
    </div>
  );
}
