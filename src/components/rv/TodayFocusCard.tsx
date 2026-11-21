import { Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowRight,
  Bell,
  Briefcase,
  Check,
  CheckCircle2,
  Circle,
  FileText,
  FolderKanban,
  Layers3,
} from "lucide-react";
import { Glass, SlidingTabs } from "@/components/rv/ui";
import {
  getTodayActionQueue,
  type TodayActionItem,
  type TodayActionScope,
} from "@/lib/ai-central-engine";
import {
  convertDocument,
  deletePayment,
  nextWorkStage,
  recordPayment,
  reconcileProjects,
  saveDocument,
  setDB,
  today,
  uid,
  updateProject,
  type DB,
  type WorkTask,
} from "@/lib/store";
import { cn } from "@/lib/utils";

type FocusFilter = "all" | TodayActionScope;

export function TodayFocusCard({
  db,
  hideBalances = false,
  onOpenWorkTask,
  className,
}: {
  db: DB;
  hideBalances?: boolean;
  onOpenWorkTask?: (task: WorkTask) => void;
  className?: string;
}) {
  const navigate = useNavigate();
  const [scope, setScope] = useState<FocusFilter>("all");
  const [expanded, setExpanded] = useState(false);

  const queue = useMemo(() => getTodayActionQueue(db), [db]);

  const filtered = useMemo(
    () => (scope === "all" ? queue : queue.filter((it) => it.scope === scope)),
    [queue, scope],
  );
  const visible = expanded ? filtered : filtered.slice(0, 5);

  const handlePayFull = (
    item: Extract<TodayActionItem, { kind: "invoice" }>,
  ) => {
    const payment = {
      id: uid(),
      invoiceId: item.invoiceId,
      date: today(),
      amount: item.balanceNative,
      currency: item.currency,
      method: "Bank transfer",
      reference: "Quick settle",
    };
    try {
      setDB((d) => recordPayment(d, payment));
      toast.success(`Paid ${item.title} (${item.metric})`, {
        action: {
          label: "Undo",
          onClick: () => setDB((d) => deletePayment(d, payment.id)),
        },
      });
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not record payment",
      );
    }
  };

  const handleConvertQuote = (
    item: Extract<TodayActionItem, { kind: "quote" }>,
  ) => {
    const source = db.invoices.find((i) => i.id === item.invoiceId);
    if (!source) return;
    const prevInvoices = db.invoices;
    const prevProjects = db.projects;
    const prevClients = db.clients;
    const converted = convertDocument(
      source,
      "Invoice",
      db.invoices,
      today(),
      db.settings.dueDays || 28,
    );
    setDB((d) => saveDocument(d, converted));
    toast.success(`Created ${converted.no} from ${source.no}`, {
      action: {
        label: "Open",
        onClick: () =>
          navigate({ to: "/invoices/$id", params: { id: converted.id } }),
      },
      cancel: {
        label: "Undo",
        onClick: () =>
          setDB((d) =>
            reconcileProjects({
              ...d,
              invoices: prevInvoices,
              projects: prevProjects,
              clients: prevClients,
            }),
          ),
      },
    });
  };

  const handleCompleteWork = (
    item: Extract<TodayActionItem, { kind: "work" }>,
  ) => {
    const task = (db.workTasks ?? []).find((t) => t.id === item.taskId);
    if (!task) return;
    const prevTask = { ...task };
    const nextTask: WorkTask = {
      ...task,
      status: "Completed",
      completedDate: task.completedDate || today(),
    };
    setDB((d) => ({
      ...d,
      workTasks: (d.workTasks ?? []).map((t) =>
        t.id === task.id ? nextTask : t,
      ),
    }));
    toast.success(`Completed ${task.title || task.code}`, {
      action: {
        label: "Undo",
        onClick: () =>
          setDB((d) => ({
            ...d,
            workTasks: (d.workTasks ?? []).map((t) =>
              t.id === prevTask.id ? prevTask : t,
            ),
          })),
      },
    });
  };

  const handleAdvanceWork = (
    item: Extract<TodayActionItem, { kind: "work" }>,
  ) => {
    const task = (db.workTasks ?? []).find((t) => t.id === item.taskId);
    if (!task) return;
    const prevTask = { ...task };
    const nextStage = nextWorkStage(task);
    const nextTask: WorkTask = {
      ...task,
      status: nextStage,
      completedDate:
        nextStage === "Completed"
          ? task.completedDate || today()
          : task.completedDate,
    };
    setDB((d) => ({
      ...d,
      workTasks: (d.workTasks ?? []).map((t) =>
        t.id === task.id ? nextTask : t,
      ),
    }));
    toast.success(`Moved ${task.title || task.code} → ${nextStage}`, {
      action: {
        label: "Undo",
        onClick: () =>
          setDB((d) => ({
            ...d,
            workTasks: (d.workTasks ?? []).map((t) =>
              t.id === prevTask.id ? prevTask : t,
            ),
          })),
      },
    });
  };

  const handleMarkProjectDelivered = (
    item: Extract<TodayActionItem, { kind: "project" }>,
  ) => {
    const proj = db.projects.find((p) => p.id === item.projectId);
    if (!proj) return;
    const prev = { ...proj };
    setDB((d) =>
      updateProject(d, {
        ...proj,
        status: "Delivered",
        delivered: proj.delivered || today(),
      }),
    );
    toast.success(`Marked ${proj.name} as Delivered`, {
      action: {
        label: "Undo",
        onClick: () => setDB((d) => updateProject(d, prev)),
      },
    });
  };

  const handleDismissReminder = (
    item: Extract<TodayActionItem, { kind: "reminder" }>,
  ) => {
    const rem = (db.reminders ?? []).find((r) => r.id === item.reminderId);
    if (!rem) return;
    const prevDismissed = rem.dismissedForDate;
    setDB((d) => ({
      ...d,
      reminders: (d.reminders ?? []).map((r) =>
        r.id === rem.id ? { ...r, dismissedForDate: item.occurrenceDate } : r,
      ),
    }));
    toast.success(`Cleared "${rem.title}"`, {
      action: {
        label: "Undo",
        onClick: () =>
          setDB((d) => ({
            ...d,
            reminders: (d.reminders ?? []).map((r) => {
              if (r.id !== rem.id) return r;
              if (prevDismissed) {
                return { ...r, dismissedForDate: prevDismissed };
              }
              const { dismissedForDate: _omit, ...rest } = r;
              return rest;
            }),
          })),
      },
    });
  };

  if (queue.length === 0) {
    return (
      <Glass className={cn("py-3.5", className)}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-positive" />
            <p className="text-sm font-semibold text-foreground">
              All caught up for today
            </p>
            <span className="hidden text-xs text-muted-foreground sm:inline">
              · No overdue invoices, urgent tasks, or due alerts
            </span>
          </div>
          <Link
            to="/work"
            className="inline-flex min-h-[36px] items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            Work schedule <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </Glass>
    );
  }

  return (
    <Glass {...(className ? { className } : {})}>
      <div className="mb-3 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-primary/35 bg-primary/15 text-primary">
            <Check className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="truncate font-display text-base font-bold leading-tight">
                Today Focus
              </h2>
              <span className="font-num text-xs font-semibold text-primary">
                {queue.length}
              </span>
            </div>
            <p className="truncate text-[0.7rem] text-muted-foreground">
              Clear due invoices, accepted quotes, work &amp; reminders in one
              tap
            </p>
          </div>
        </div>

        <SlidingTabs
          size="xs"
          layoutGroup="today-focus-scope"
          value={scope}
          onChange={(next) => {
            setScope(next);
            setExpanded(false);
          }}
          options={[
            { id: "all", label: `All (${queue.length})` },
            { id: "Studio", label: "Studio" },
            { id: "Work", label: "Work" },
            { id: "Life", label: "Alerts" },
          ]}
        />
      </div>

      {visible.length === 0 ? (
        <p className="py-5 text-center text-xs text-muted-foreground">
          No pending items under {scope}.
        </p>
      ) : (
        <ul className="divide-y divide-border/60">
          {visible.map((item) => {
            const Icon =
              item.kind === "invoice" || item.kind === "quote"
                ? FileText
                : item.kind === "work"
                  ? Layers3
                  : item.kind === "project"
                    ? FolderKanban
                    : item.kind === "reminder"
                      ? Bell
                      : Briefcase;

            const urgencyClass =
              item.urgency === "critical"
                ? "text-destructive"
                : item.urgency === "high"
                  ? "text-primary"
                  : "text-muted-foreground";

            return (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-2.5 py-2.5 sm:flex-nowrap"
              >
                <div className="flex min-w-0 flex-1 items-center gap-2.5">
                  {item.kind === "work" ? (
                    <button
                      type="button"
                      onClick={() => handleCompleteWork(item)}
                      aria-label={`Complete ${item.title}`}
                      title="Mark completed"
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-positive/15 hover:text-positive active:scale-95"
                    >
                      <Circle className="h-4.5 w-4.5" />
                    </button>
                  ) : (
                    <span
                      className={cn(
                        "grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border/70 bg-muted/60",
                        urgencyClass,
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                  )}

                  <div className="min-w-0 flex-1">
                    {item.kind === "invoice" || item.kind === "quote" ? (
                      <Link
                        to="/invoices/$id"
                        params={{ id: item.invoiceId }}
                        className="block truncate text-xs font-semibold text-foreground hover:text-primary sm:text-sm"
                      >
                        {item.title}
                      </Link>
                    ) : item.kind === "work" ? (
                      <button
                        type="button"
                        onClick={() => {
                          const task = (db.workTasks ?? []).find(
                            (t) => t.id === item.taskId,
                          );
                          if (task && onOpenWorkTask) onOpenWorkTask(task);
                          else navigate({ to: "/work" });
                        }}
                        className="block w-full truncate text-left text-xs font-semibold text-foreground hover:text-primary sm:text-sm"
                      >
                        {item.title}
                      </button>
                    ) : item.kind === "project" ? (
                      <Link
                        to="/projects"
                        className="block truncate text-xs font-semibold text-foreground hover:text-primary sm:text-sm"
                      >
                        {item.title}
                      </Link>
                    ) : (
                      <Link
                        to="/work"
                        className="block truncate text-xs font-semibold text-foreground hover:text-primary sm:text-sm"
                      >
                        {item.title}
                      </Link>
                    )}
                    <p className="font-num truncate text-[0.7rem] text-muted-foreground">
                      <span className={cn("font-semibold", urgencyClass)}>
                        {hideBalances && item.metric.includes("$")
                          ? "••••"
                          : item.metric}
                      </span>{" "}
                      · {item.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1.5 pl-11 sm:pl-0">
                  {item.kind === "invoice" && (
                    <button
                      type="button"
                      onClick={() => handlePayFull(item)}
                      className="inline-flex min-h-[36px] items-center gap-1 whitespace-nowrap rounded-lg border border-positive/45 bg-positive/15 px-3 text-xs font-semibold text-positive transition-colors hover:bg-positive hover:text-white active:scale-95"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Pay full
                    </button>
                  )}

                  {item.kind === "quote" &&
                    (item.readyToConvert ? (
                      <button
                        type="button"
                        onClick={() => handleConvertQuote(item)}
                        className="inline-flex min-h-[36px] items-center gap-1 whitespace-nowrap rounded-lg border border-primary/45 bg-primary/15 px-3 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground active:scale-95"
                      >
                        <span>→ Invoice</span>
                      </button>
                    ) : (
                      <Link
                        to="/invoices/$id"
                        params={{ id: item.invoiceId }}
                        className="inline-flex min-h-[36px] items-center gap-1 whitespace-nowrap rounded-lg border border-border bg-secondary px-3 text-xs font-medium text-foreground transition-colors hover:border-primary/45 active:scale-95"
                      >
                        Follow up
                      </Link>
                    ))}

                  {item.kind === "work" && (
                    <button
                      type="button"
                      onClick={() => handleAdvanceWork(item)}
                      className="inline-flex min-h-[36px] items-center gap-1 whitespace-nowrap rounded-lg border border-primary/35 bg-primary/12 px-3 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground active:scale-95"
                    >
                      <span>{nextWorkStage({ status: item.stage })}</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  )}

                  {item.kind === "project" && (
                    <button
                      type="button"
                      onClick={() => handleMarkProjectDelivered(item)}
                      className="inline-flex min-h-[36px] items-center gap-1 whitespace-nowrap rounded-lg border border-primary/35 bg-primary/12 px-3 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground active:scale-95"
                    >
                      Delivered
                    </button>
                  )}

                  {item.kind === "reminder" && (
                    <button
                      type="button"
                      onClick={() => handleDismissReminder(item)}
                      className="inline-flex min-h-[36px] items-center gap-1 whitespace-nowrap rounded-lg border border-border bg-secondary px-3 text-xs font-medium text-foreground transition-colors hover:border-positive/45 hover:text-positive active:scale-95"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Done
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {filtered.length > 5 && (
        <div className="mt-2.5 flex justify-end border-t border-border/60 pt-2">
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="text-xs font-semibold text-primary hover:underline"
          >
            {expanded
              ? "Show top 5 actions"
              : `Show all ${filtered.length} actions`}
          </button>
        </div>
      )}
    </Glass>
  );
}
