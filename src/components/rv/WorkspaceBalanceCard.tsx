import { Link } from "@tanstack/react-router";
import { ArrowRight, Briefcase, Layers, Wallet } from "lucide-react";
import { Glass, Stat } from "@/components/rv/ui";
import { AnimatedNumber } from "@/components/rv/FinanceVisuals";
import {
  compactMoney,
  designOutputSummary,
  money,
  useDB,
  workspaceBalances,
} from "@/lib/store";
import { cn } from "@/lib/utils";
import type { WorkspaceMode } from "@/components/rv/WorkspaceSwitcher";

export function WorkspaceBalanceCard({
  workspace,
}: {
  workspace: WorkspaceMode;
}) {
  const db = useDB((d) => d);
  const bal = workspaceBalances(db);
  const output = workspace === "work" ? designOutputSummary(db) : null;

  if (workspace === "work" && output) {
    const completionPct =
      output.totalProjects > 0
        ? Math.round((output.completedTotal / output.totalProjects) * 100)
        : 0;
    const workTaskCount = (db.workTasks ?? []).length;

    return (
      <Glass className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Briefcase className="h-3.5 w-3.5 text-primary" />
            <span className="font-medium text-foreground">Work Workspace</span>
            <span aria-hidden="true">·</span>
            <span>Full-Time + Freelance Design Output</span>
          </div>
          <div className="mt-1.5 flex flex-wrap items-baseline gap-3">
            <p className="font-num text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              {output.completedTotal}{" "}
              <span className="text-lg font-semibold text-muted-foreground">
                completed works
              </span>
            </p>
            <span className="font-num text-xs font-semibold text-primary">
              {output.totalArtworks} total artworks · {completionPct}% done
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {workTaskCount} full-time tasks ({output.workCompleted} completed,{" "}
            {output.workActive} current) · {output.studioCompleted} studio
            delivered/closed
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-border/70 pt-3 sm:grid-cols-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <Stat
            label="Full-time done"
            value={String(output.workCompleted)}
            tone="pos"
          />
          <Stat label="Studio done" value={String(output.studioCompleted)} />
          <Stat
            label="Artworks"
            value={String(output.totalArtworks)}
            tone="pos"
          />
          <div className="flex flex-col justify-between">
            <Stat label="Mockups & PDFs" value={String(output.mediaCount)} />
            <Link
              to="/finance"
              search={{ view: "combined" }}
              className="mt-1 inline-flex items-center gap-1 text-[0.72rem] font-medium text-primary hover:underline"
            >
              <span>All cash flow</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
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
      <Glass className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Wallet className="h-3.5 w-3.5 text-positive" />
            <span className="font-medium text-foreground">
              Personal Workspace
            </span>
            <span aria-hidden="true">·</span>
            <span>Real-time Current Balance (All ledger entries)</span>
          </div>
          <p
            className={cn(
              "font-num mt-1.5 text-3xl font-extrabold tracking-tight sm:text-4xl",
              tone,
            )}
            title={money(bal.personalBalance)}
          >
            <AnimatedNumber value={bal.personalBalance} />
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Personal Income minus Personal Expenses · Combined Studio +
            Personal:{" "}
            <Link
              to="/finance"
              search={{ view: "combined" }}
              className="font-num font-semibold text-primary hover:underline"
            >
              {money(bal.combinedBalance)}
            </Link>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-border/70 pt-3 sm:grid-cols-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <Stat
            label="Total income"
            value={compactMoney(bal.personalInAll)}
            fullValue={money(bal.personalInAll)}
            tone={bal.personalInAll > 0 ? "pos" : undefined}
          />
          <Stat
            label="Total spending"
            value={compactMoney(bal.personalOutAll)}
            fullValue={money(bal.personalOutAll)}
            tone="neg"
          />
          <Stat
            label="This month net"
            value={compactMoney(bal.personalMonthNet, "USD", true)}
            fullValue={money(bal.personalMonthNet, "USD", true)}
            tone={bal.personalMonthNet >= 0 ? "pos" : "neg"}
          />
          <div className="flex flex-col justify-between">
            <Stat
              label="Saved goals"
              value={compactMoney(bal.personalGoalsSaved)}
              fullValue={money(bal.personalGoalsSaved)}
              tone="pos"
            />
            <Link
              to="/finance"
              search={{ view: "combined" }}
              className="mt-1 inline-flex items-center gap-1 text-[0.72rem] font-medium text-primary hover:underline"
            >
              <span>Combined cash flow</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </Glass>
    );
  }

  return (
    <Glass className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Layers className="h-3.5 w-3.5 text-primary" />
          <span className="font-medium text-foreground">Studio Workspace</span>
          <span aria-hidden="true">·</span>
          <span>Real-time Current Balance (All ledger entries)</span>
        </div>
        <p
          className={cn(
            "font-num mt-1.5 text-3xl font-extrabold tracking-tight sm:text-4xl",
            bal.studioBalance >= 0 ? "text-foreground" : "text-destructive",
          )}
          title={money(bal.studioBalance)}
        >
          <AnimatedNumber value={bal.studioBalance} />
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Paid Studio Invoices minus Studio Operating Expenses · Combined Studio
          + Personal:{" "}
          <Link
            to="/finance"
            search={{ view: "combined" }}
            className="font-num font-semibold text-primary hover:underline"
          >
            {money(bal.combinedBalance)}
          </Link>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 border-t border-border/70 pt-3 sm:grid-cols-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
        <Stat
          label="Cash in"
          value={compactMoney(bal.studioInAll)}
          fullValue={money(bal.studioInAll)}
          tone="pos"
        />
        <Stat
          label="Studio out"
          value={compactMoney(bal.studioOutAll)}
          fullValue={money(bal.studioOutAll)}
        />
        <Stat
          label="Open A/R"
          value={compactMoney(bal.openAR)}
          fullValue={money(bal.openAR)}
        />
        <div className="flex flex-col justify-between">
          <Stat
            label="This month net"
            value={compactMoney(bal.studioMonthNet, "USD", true)}
            fullValue={money(bal.studioMonthNet, "USD", true)}
            tone={bal.studioMonthNet >= 0 ? "pos" : "neg"}
          />
          <Link
            to="/finance"
            search={{ view: "combined" }}
            className="mt-1 inline-flex items-center gap-1 text-[0.72rem] font-medium text-primary hover:underline"
          >
            <span>Studio + Personal</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </Glass>
  );
}
