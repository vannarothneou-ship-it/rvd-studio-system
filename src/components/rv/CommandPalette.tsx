import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  BrainCircuit,
  Briefcase,
  FileText,
  FolderKanban,
  Layers3,
  Plus,
  ScanLine,
  Search,
  Sparkles,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { Portal } from "@/components/rv/ui";
import { useReceiptScanner } from "@/components/rv/ReceiptScannerContext";
import {
  askCentralDB,
  buildQuickWorkTask,
  computeCentralIntelligence,
  parseQuickCommand,
} from "@/lib/ai-central-engine";
import {
  documentKind,
  safeKhrRate,
  setDB,
  stampFxSnapshot,
  uid,
  useDB,
} from "@/lib/store";
import { cn } from "@/lib/utils";

interface QuickNavAction {
  id: string;
  label: string;
  sub: string;
  icon: typeof ScanLine;
  run: () => void;
}

const EXAMPLE_COMMANDS = [
  "spent $6.50 Onnik coffee",
  "20000r ptt fuel",
  "+$500 freelance",
  "task DBG banner tomorrow 3 pcs",
];

export function CommandPalette({
  open,
  onOpenChange,
  isStudioContext = false,
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  isStudioContext?: boolean;
}) {
  const db = useDB((d) => d);
  const navigate = useNavigate();
  const { openScanner } = useReceiptScanner();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      } else if (e.key === "Escape" && open) {
        e.preventDefault();
        onOpenChange(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      return;
    }
    const id = window.setTimeout(() => inputRef.current?.focus(), 20);
    return () => window.clearTimeout(id);
  }, [open]);

  const parsedCommand = useMemo(
    () => (query.trim() ? parseQuickCommand(query, db) : null),
    [query, db],
  );

  const intelligenceSnap = useMemo(
    () => (open ? computeCentralIntelligence(db) : null),
    [open, db],
  );

  const aiAnswer = useMemo(() => {
    const q = query.trim();
    if (!open || !intelligenceSnap || parsedCommand || q.length < 3) {
      return null;
    }
    return askCentralDB(db, intelligenceSnap, q);
  }, [open, intelligenceSnap, parsedCommand, query, db]);

  const searchMatches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const results: {
      id: string;
      group: string;
      title: string;
      sub: string;
      icon: typeof Users;
      to: string;
      params?: { id: string };
    }[] = [];

    for (const c of db.clients) {
      if (`${c.name} ${c.code} ${c.contact}`.toLowerCase().includes(q)) {
        results.push({
          id: `cli-${c.id}`,
          group: "Client",
          title: c.name,
          sub: `${c.code} · ${c.status}`,
          icon: Users,
          to: "/clients",
        });
      }
    }

    for (const i of db.invoices) {
      const clientName =
        db.clients.find((c) => c.id === i.clientId)?.name ?? "";
      if (
        `${i.no} ${clientName} ${documentKind(i)}`.toLowerCase().includes(q)
      ) {
        results.push({
          id: `inv-${i.id}`,
          group: documentKind(i),
          title: `${i.no} · ${clientName || "Client"}`,
          sub: `Due ${i.due} · ${i.currency}`,
          icon: FileText,
          to: "/invoices/$id",
          params: { id: i.id },
        });
      }
    }

    for (const p of db.projects) {
      if (`${p.code} ${p.name} ${p.status}`.toLowerCase().includes(q)) {
        results.push({
          id: `prj-${p.id}`,
          group: "Project",
          title: `${p.code} · ${p.name}`,
          sub: p.status,
          icon: FolderKanban,
          to: "/projects",
        });
      }
    }

    for (const t of db.workTasks ?? []) {
      const proj = t.projectName || t.company || "Work";
      if (
        `${t.code} ${t.title} ${proj} ${t.designType}`.toLowerCase().includes(q)
      ) {
        results.push({
          id: `wrk-${t.id}`,
          group: "Work",
          title: `${proj} · ${t.title}`,
          sub: `${t.status}${t.dueDate ? ` · ${t.dueDate}` : ""}`,
          icon: Layers3,
          to: "/work",
        });
      }
    }

    return results.slice(0, 8);
  }, [query, db]);

  const executeParsedCommand = () => {
    if (!parsedCommand) return;
    const rate = safeKhrRate(db.settings.khrRate);
    if (parsedCommand.kind === "expense") {
      const created = stampFxSnapshot(
        {
          id: uid(),
          date: parsedCommand.data.date,
          projectId: "",
          category: parsedCommand.data.category,
          vendor: parsedCommand.data.vendor,
          description: parsedCommand.data.description,
          amount: parsedCommand.data.amount,
          currency: parsedCommand.data.currency,
          receipt: "",
          account: parsedCommand.data.account,
        },
        rate,
        false,
      );
      setDB((d) => ({ ...d, expenses: [created, ...d.expenses] }));
      toast.success(parsedCommand.summary, {
        action: {
          label: "Undo",
          onClick: () =>
            setDB((d) => ({
              ...d,
              expenses: d.expenses.filter((x) => x.id !== created.id),
            })),
        },
      });
    } else if (parsedCommand.kind === "income") {
      const created = stampFxSnapshot(
        {
          id: uid(),
          date: parsedCommand.data.date,
          source: parsedCommand.data.source,
          accountMethod: parsedCommand.data.accountMethod,
          description: parsedCommand.data.description,
          amount: parsedCommand.data.amount,
          currency: parsedCommand.data.currency,
        },
        rate,
        false,
      );
      setDB((d) => ({
        ...d,
        personalIncome: [created, ...(d.personalIncome ?? [])],
      }));
      toast.success(parsedCommand.summary, {
        action: {
          label: "Undo",
          onClick: () =>
            setDB((d) => ({
              ...d,
              personalIncome: (d.personalIncome ?? []).filter(
                (x) => x.id !== created.id,
              ),
            })),
        },
      });
    } else {
      const created = buildQuickWorkTask(db, parsedCommand.data);
      setDB((d) => ({
        ...d,
        workTasks: [created, ...(d.workTasks ?? [])],
      }));
      toast.success(`Added ${created.projectName} · ${created.title}`, {
        action: {
          label: "Undo",
          onClick: () =>
            setDB((d) => ({
              ...d,
              workTasks: (d.workTasks ?? []).filter((x) => x.id !== created.id),
            })),
        },
      });
    }
    onOpenChange(false);
  };

  const quickActions: QuickNavAction[] = [
    {
      id: "scan",
      label: "Scan receipt or bank slip",
      sub: "Khmer & English OCR + learned rules",
      icon: ScanLine,
      run: () => {
        onOpenChange(false);
        openScanner(isStudioContext ? "Studio" : "Personal");
      },
    },
    {
      id: "new-invoice",
      label: "New invoice",
      sub: "Create & send client invoice",
      icon: Plus,
      run: () => {
        onOpenChange(false);
        navigate({
          to: "/invoices/$id",
          params: { id: "new" },
          search: { kind: "Invoice" },
        });
      },
    },
    {
      id: "new-quote",
      label: "New quotation",
      sub: "Draft proposal with auto-follow-up",
      icon: FileText,
      run: () => {
        onOpenChange(false);
        navigate({
          to: "/invoices/$id",
          params: { id: "new" },
          search: { kind: "Quotation" },
        });
      },
    },
    {
      id: "go-personal",
      label: "Personal Money",
      sub: "Cards, daily spending & saving goals",
      icon: Wallet,
      run: () => {
        onOpenChange(false);
        navigate({ to: "/personal" });
      },
    },
    {
      id: "go-work",
      label: "Work & Portfolio",
      sub: "Tasks, calendar & case studies",
      icon: Layers3,
      run: () => {
        onOpenChange(false);
        navigate({ to: "/work" });
      },
    },
    {
      id: "go-studio",
      label: "Studio Overview",
      sub: "Clients, pipeline & studio profit",
      icon: Briefcase,
      run: () => {
        onOpenChange(false);
        navigate({ to: "/studio" });
      },
    },
  ];

  if (!open) return null;

  return (
    <Portal>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Quick Command Bar"
        className="no-print fixed inset-0 z-50 flex items-start justify-center bg-black/55 px-3 pt-[max(1.5rem,env(safe-area-inset-top))] backdrop-blur-sm sm:pt-20"
        onClick={() => onOpenChange(false)}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-xl overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-strong)] shadow-[0_24px_64px_-16px_oklch(0_0_0/70%)] backdrop-blur-2xl backdrop-saturate-150"
        >
          {/* Command Input Header */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (parsedCommand) {
                executeParsedCommand();
              } else if (searchMatches[0]) {
                onOpenChange(false);
                navigate({
                  to: searchMatches[0].to,
                  ...(searchMatches[0].params
                    ? { params: searchMatches[0].params }
                    : {}),
                });
              }
            }}
            className="flex items-center gap-2.5 border-b border-border/70 px-3.5 py-2.5"
          >
            <Search className="h-4.5 w-4.5 shrink-0 text-primary" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='Type command ("$6.50 Onnik coffee", "task DBG banner") or search…'
              className="h-10 min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear query"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="hidden shrink-0 rounded-md border border-border px-2 py-1 text-[0.65rem] font-semibold text-muted-foreground sm:inline"
            >
              ESC
            </button>
          </form>

          {/* Dynamic Command Body */}
          <div className="max-h-[70vh] overflow-y-auto p-3 space-y-3">
            {/* 1. Natural Language Quick-Log Match */}
            {parsedCommand && (
              <div className="rounded-xl border border-primary/45 bg-primary/12 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
                      {parsedCommand.kind === "income" ? (
                        <ArrowDownLeft className="h-4 w-4" />
                      ) : parsedCommand.kind === "expense" ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <Layers3 className="h-4 w-4" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-primary">
                        Instant Quick-Log
                        {parsedCommand.kind === "expense" &&
                        parsedCommand.matchedRule
                          ? ` · Matched "${parsedCommand.matchedRule}"`
                          : ""}
                      </p>
                      <p className="font-num truncate text-sm font-bold text-foreground">
                        {parsedCommand.summary}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={executeParsedCommand}
                    className="inline-flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3.5 text-xs font-bold text-primary-foreground transition-transform active:scale-95"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Save (Enter)</span>
                  </button>
                </div>
              </div>
            )}

            {/* 2. Ask Central AI Live Answer */}
            {aiAnswer && (
              <div className="rounded-xl border border-border bg-muted/45 p-3">
                <div className="flex items-start gap-2.5">
                  <BrainCircuit className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <p className="text-xs font-semibold text-foreground leading-relaxed">
                      {aiAnswer.answer}
                    </p>
                    {aiAnswer.routeHint && (
                      <button
                        type="button"
                        onClick={() => {
                          onOpenChange(false);
                          navigate({ to: aiAnswer.routeHint!.to });
                        }}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                      >
                        <span>{aiAnswer.routeHint.label}</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 3. Matching Records across Ledger */}
            {searchMatches.length > 0 && (
              <div>
                <p className="label-mono mb-1.5 px-1">Matches</p>
                <ul className="divide-y divide-border/50">
                  {searchMatches.map((m) => {
                    const Icon = m.icon;
                    return (
                      <li key={m.id}>
                        <button
                          type="button"
                          onClick={() => {
                            onOpenChange(false);
                            navigate({
                              to: m.to,
                              ...(m.params ? { params: m.params } : {}),
                            });
                          }}
                          className="flex min-h-[44px] w-full items-center justify-between gap-2.5 rounded-lg px-2 py-2 text-left transition-colors hover:bg-accent/60"
                        >
                          <div className="flex min-w-0 items-center gap-2.5">
                            <Icon className="h-4 w-4 shrink-0 text-primary" />
                            <div className="min-w-0">
                              <p className="truncate text-xs font-semibold text-foreground sm:text-sm">
                                {m.title}
                              </p>
                              <p className="truncate text-[0.7rem] text-muted-foreground">
                                {m.group} · {m.sub}
                              </p>
                            </div>
                          </div>
                          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* 4. Quick Actions & Examples (default state) */}
            {!query.trim() && (
              <>
                <div>
                  <p className="label-mono mb-1.5 px-1">Quick Capture</p>
                  <div className="flex flex-wrap gap-1.5 px-1">
                    {EXAMPLE_COMMANDS.map((ex) => (
                      <button
                        key={ex}
                        type="button"
                        onClick={() => setQuery(ex)}
                        className="font-num min-h-[34px] rounded-lg border border-border bg-secondary/80 px-2.5 text-xs text-muted-foreground transition-colors hover:border-primary/45 hover:text-foreground"
                      >
                        {ex}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="label-mono mb-1.5 px-1">Jump &amp; Create</p>
                  <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                    {quickActions.map((act) => {
                      const Icon = act.icon;
                      return (
                        <button
                          key={act.id}
                          type="button"
                          onClick={act.run}
                          className="flex min-h-[46px] items-center gap-2.5 rounded-xl border border-transparent px-2.5 py-2 text-left transition-colors hover:border-border hover:bg-accent/55"
                        >
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-border/70 bg-muted/65 text-primary">
                            <Icon className="h-4 w-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-foreground">
                              {act.label}
                            </p>
                            <p className="truncate text-[0.68rem] text-muted-foreground">
                              {act.sub}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Portal>
  );
}
