import { Briefcase, Eye, EyeOff, Layers, Wallet } from "lucide-react";
import { Glass, Stat } from "@/components/rv/ui";
import { AnimatedNumber } from "@/components/rv/FinanceVisuals";
import {
  compactMoney,
  designOutputSummary,
  money,
  useDB,
  workspaceBalances,
} from "@/lib/store";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { WorkspaceMode } from "@/components/rv/WorkspaceSwitcher";

export function WorkspaceBalanceCard({
  workspace,
}: {
  workspace: WorkspaceMode | "studio";
}) {
  const db = useDB((d) => d);
  const [showAmounts, setShowAmounts] = useState(true);
  const displayMoney = (value: number, compact = false) =>
    showAmounts ? (compact ? compactMoney(value) : money(value)) : "••••";
  const bal = workspaceBalances(db);
  const output = workspace === "work" ? designOutputSummary(db) : null;

  if (workspace === "work" && output) {
    const completionPct =
      output.totalProjects > 0
        ? Math.round((output.completedTotal / output.totalProjects) * 100)
        : 0;
    const workTaskCount = (db.workTasks ?? []).length;

    return (
      <Glass className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Briefcase className="h-3.5 w-3.5 text-primary" />
            <span className="font-semibold text-foreground">
              Work &amp; Portfolio
            </span>
            <span aria-hidden="true">·</span>
            <span>{workTaskCount} tasks</span>
          </div>
          <div className="mt-1.5 flex flex-wrap items-baseline gap-3">
            <p className="font-num text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {output.completedTotal}{" "}
              <span className="text-base font-medium text-muted-foreground">
                completed
              </span>
            </p>
            <span className="font-num text-xs font-semibold text-primary">
              {output.totalArtworks} artworks · {completionPct}% done
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 border-t border-border pt-3 sm:grid-cols-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <Stat
            label="Completed"
            value={String(output.workCompleted)}
            tone="pos"
          />
          <Stat label="In progress" value={String(output.workActive)} />
          <Stat
            label="Artworks"
            value={String(output.totalArtworks)}
            tone="pos"
          />
          <Stat label="Attachments" value={String(output.mediaCount)} />
        </div>
      </Glass>
    );
  }

  if (workspace === "personal") {
    const tone =
      bal.personalBalance > 0
        ? "text-positive"
        : bal.personalBalance < 0
          ? "text-destructive"
          : "text-foreground";
    return (
      <Glass className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <Wallet className="h-3.5 w-3.5 text-positive" />
              <span className="font-semibold text-foreground">
                Personal Balance
              </span>
            </span>
            <button
              type="button"
              onClick={() => setShowAmounts((value) => !value)}
              aria-label={
                showAmounts ? "Hide balance amounts" : "Show balance amounts"
              }
              aria-pressed={!showAmounts}
              title={showAmounts ? "Hide amounts" : "Show amounts"}
              className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {showAmounts ? (
                <Eye className="h-3.5 w-3.5" />
              ) : (
                <EyeOff className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
          <p
            className={cn(
              "font-num mt-1.5 text-3xl font-bold tracking-tight sm:text-4xl",
              tone,
            )}
            title={displayMoney(bal.personalBalance)}
          >
            {showAmounts ? (
              <AnimatedNumber value={bal.personalBalance} />
            ) : (
              "••••"
            )}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 border-t border-border pt-3 sm:grid-cols-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <Stat
            label="Income"
            value={displayMoney(bal.personalInAll, true)}
            fullValue={displayMoney(bal.personalInAll)}
            tone={bal.personalInAll > 0 ? "pos" : undefined}
          />
          <Stat
            label="Spending"
            value={displayMoney(bal.personalOutAll, true)}
            fullValue={displayMoney(bal.personalOutAll)}
            tone="neg"
          />
          <Stat
            label="Month net"
            value={
              showAmounts
                ? compactMoney(bal.personalMonthNet, "USD", true)
                : "••••"
            }
            fullValue={displayMoney(bal.personalMonthNet)}
            tone={bal.personalMonthNet >= 0 ? "pos" : "neg"}
          />
          <Stat
            label="Saved goals"
            value={displayMoney(bal.personalGoalsSaved, true)}
            fullValue={displayMoney(bal.personalGoalsSaved)}
            tone="pos"
          />
        </div>
      </Glass>
    );
  }

  return (
    <Glass className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <Layers className="h-3.5 w-3.5 text-primary" />
            <span className="font-semibold text-foreground">
              Studio Balance
            </span>
          </span>
          <button
            type="button"
            onClick={() => setShowAmounts((value) => !value)}
            aria-label={
              showAmounts ? "Hide balance amounts" : "Show balance amounts"
            }
            aria-pressed={!showAmounts}
            title={showAmounts ? "Hide amounts" : "Show amounts"}
            className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {showAmounts ? (
              <Eye className="h-3.5 w-3.5" />
            ) : (
              <EyeOff className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
        <p
          className={cn(
            "font-num mt-1.5 text-3xl font-bold tracking-tight sm:text-4xl",
            bal.studioBalance >= 0 ? "text-foreground" : "text-destructive",
          )}
          title={displayMoney(bal.studioBalance)}
        >
          {showAmounts ? <AnimatedNumber value={bal.studioBalance} /> : "••••"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 border-t border-border pt-3 sm:grid-cols-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
        <Stat
          label="Cash in"
          value={displayMoney(bal.studioInAll, true)}
          fullValue={displayMoney(bal.studioInAll)}
          tone="pos"
        />
        <Stat
          label="Studio out"
          value={displayMoney(bal.studioOutAll, true)}
          fullValue={displayMoney(bal.studioOutAll)}
        />
        <Stat
          label="Open A/R"
          value={displayMoney(bal.openAR, true)}
          fullValue={displayMoney(bal.openAR)}
        />
        <Stat
          label="Month net"
          value={
            showAmounts ? compactMoney(bal.studioMonthNet, "USD", true) : "••••"
          }
          fullValue={displayMoney(bal.studioMonthNet)}
          tone={bal.studioMonthNet >= 0 ? "pos" : "neg"}
        />
      </div>
    </Glass>
  );
}
