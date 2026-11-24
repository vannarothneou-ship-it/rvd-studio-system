import { useEffect, useMemo, useState } from "react";
import { Calendar, Check, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { SlideDrawer } from "@/components/rv/ui";
import {
  categoryIcon,
  incomeSourceIcon,
  paymentCardIcon,
} from "@/components/rv/FinanceIcons";
import {
  CARD_METHODS,
  EXPENSE_CATEGORIES,
  PERSONAL_CATEGORIES,
  PERSONAL_INCOME_METHODS,
  PERSONAL_INCOME_SOURCES,
  STUDIO_INCOME_SOURCES,
  expenseAccount,
  expenseCategoriesFor,
  getDB,
  stampFxSnapshot,
  today,
  type Currency,
  type Expense,
  type PersonalIncome,
  type StudioIncome,
} from "@/lib/store";
import { cn } from "@/lib/utils";

const SHORT_CATEGORY_LABELS: Record<string, string> = {
  Transportation: "Transport",
  "Personal Spending": "Shopping",
  "Medical & Healthcare": "Health",
  "Saving & Investing": "Saving",
  "Prius 2012": "Prius",
  "Studio Draw": "Draw",
  "Gift & Refund": "Refund",
  "Software and subscriptions": "Software",
  "Fonts and licenses": "Fonts",
  "Printing and production": "Printing",
  "Fabrication and vendors": "Vendors",
  "Office and utilities": "Office",
  "Client Payment": "Client Pay",
  "Design Fee": "Design",
};

function shortLabel(name: string): string {
  return SHORT_CATEGORY_LABELS[name] ?? name;
}

const USD_PRESETS = [2, 5, 10, 20, 50] as const;
const KHR_PRESETS = [5000, 10000, 20000, 50000, 100000] as const;

export function QuickExpenseDrawer({
  item,
  onClose,
  onSave,
  onDelete,
}: {
  item: Expense | null;
  onClose: () => void;
  onSave: (v: Expense) => void;
  onDelete?: ((v: Expense) => void) | undefined;
}) {
  const [draft, setDraft] = useState<Expense | null>(item);
  const [amtText, setAmtText] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setDraft(item);
    setAmtText(item && item.amount > 0 ? String(item.amount) : "");
    setConfirmDelete(false);
  }, [item]);

  const itemId = item?.id ?? "";
  const itemAcc = item ? expenseAccount(item) : "Personal";
  const quickPicks = useMemo(() => {
    if (!itemId) return [];
    const defaults =
      itemAcc === "Studio"
        ? [
            {
              label: "Adobe CC",
              category: "Software and subscriptions",
              amount: 35,
              currency: "USD" as Currency,
            },
            {
              label: "Print proof",
              category: "Printing and production",
              amount: 15,
              currency: "USD" as Currency,
            },
            {
              label: "Delivery",
              category: "Transport",
              amount: 3,
              currency: "USD" as Currency,
            },
            {
              label: "Font license",
              category: "Fonts and licenses",
              amount: 25,
              currency: "USD" as Currency,
            },
          ]
        : [
            {
              label: "Coffee",
              category: "Food",
              amount: 2.5,
              currency: "USD" as Currency,
            },
            {
              label: "Lunch",
              category: "Food",
              amount: 5,
              currency: "USD" as Currency,
            },
            {
              label: "Fuel",
              category: "Prius 2012",
              amount: 20,
              currency: "USD" as Currency,
            },
            {
              label: "Grab",
              category: "Transportation",
              amount: 3,
              currency: "USD" as Currency,
            },
            {
              label: "Market",
              category: "Food",
              amount: 15,
              currency: "USD" as Currency,
            },
          ];
    const recent = getDB()
      .expenses.filter(
        (e) => expenseAccount(e) === itemAcc && e.description.trim(),
      )
      .slice(-40)
      .reverse();
    const seen = new Set<string>();
    const picks: {
      label: string;
      category: string;
      amount: number;
      currency: Currency;
    }[] = [];
    for (const e of recent) {
      const clean = e.description.trim().slice(0, 20);
      const key = clean.toLowerCase();
      if (!clean || seen.has(key)) continue;
      seen.add(key);
      picks.push({
        label: clean,
        category:
          e.category ||
          (itemAcc === "Studio" ? EXPENSE_CATEGORIES[0]! : "Food"),
        amount: e.amount,
        currency: e.currency,
      });
      if (picks.length >= 5) break;
    }
    for (const def of defaults) {
      if (picks.length >= 5) break;
      if (!seen.has(def.label.toLowerCase())) {
        picks.push(def);
        seen.add(def.label.toLowerCase());
      }
    }
    return picks;
  }, [itemId, itemAcc]);

  if (!item || !draft) return null;

  const isExisting = Boolean(onDelete);
  const draftAccount = expenseAccount(draft);
  const categoryList = expenseCategoriesFor(draftAccount);
  const projects = draftAccount === "Studio" ? getDB().projects : [];
  const presets = draft.currency === "KHR" ? KHR_PRESETS : USD_PRESETS;

  const commit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmt = Number(amtText.replace(/,/g, "")) || draft.amount || 0;
    if (!(numericAmt > 0)) {
      toast.error("Enter an amount greater than 0.");
      return;
    }
    const dbNow = getDB();
    const normalizedAmount =
      draft.currency === "KHR"
        ? Math.round(numericAmt)
        : Math.round(numericAmt * 100) / 100;
    const preserveRate =
      item.currency === draft.currency && item.amount === normalizedAmount;
    const stamped = stampFxSnapshot(
      {
        ...draft,
        account: draftAccount,
        amount: normalizedAmount,
        vendor: draft.vendor || "Debit",
        date: draft.date || today(),
      },
      dbNow.settings.khrRate,
      preserveRate,
    );
    onSave(stamped);
    onClose();
  };

  return (
    <SlideDrawer
      open
      onClose={onClose}
      title={isExisting ? "Edit Expense" : "Add Expense"}
      subtitle={
        draftAccount === "Studio" ? "Studio Business" : "Personal Money"
      }
      side="right"
      widthClass="max-w-md"
    >
      <form onSubmit={commit} className="flex flex-col gap-3.5">
        {/* Hero Amount + Currency Toggle Card */}
        <div className="rounded-2xl border border-primary/35 bg-gradient-to-br from-primary/12 via-muted/45 to-muted/25 p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="label-mono">Amount</span>
            <div className="inline-flex rounded-xl border border-border bg-background/60 p-0.5">
              {(["USD", "KHR"] as const).map((cur) => (
                <button
                  key={cur}
                  type="button"
                  onClick={() =>
                    setDraft({ ...draft, currency: cur as Currency })
                  }
                  className={cn(
                    "font-num min-h-[36px] rounded-lg px-3.5 text-xs font-semibold transition-all duration-150 active:scale-95",
                    draft.currency === cur
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {cur}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-2.5 flex items-baseline gap-2.5">
            <span className="font-num text-3xl font-bold text-primary">
              {draft.currency === "KHR" ? "៛" : "$"}
            </span>
            <input
              type="text"
              inputMode="decimal"
              autoFocus={!isExisting}
              placeholder={draft.currency === "KHR" ? "20,000" : "0.00"}
              value={amtText}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^0-9.]/g, "");
                setAmtText(raw);
                setDraft({ ...draft, amount: Number(raw) || 0 });
              }}
              className="font-num w-full bg-transparent text-4xl font-extrabold tracking-tight text-foreground outline-none placeholder:text-muted-foreground/45"
            />
          </div>

          <div className="no-scrollbar mt-3 flex items-center gap-2 overflow-x-auto">
            {presets.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setAmtText(String(p));
                  setDraft({ ...draft, amount: p });
                }}
                className="font-num min-h-[38px] shrink-0 rounded-lg border border-border/80 bg-background/60 px-3.5 text-xs font-semibold text-muted-foreground transition-all hover:border-primary/50 hover:text-foreground active:scale-95"
              >
                {draft.currency === "KHR"
                  ? `${Math.round(p / 1000)}k`
                  : `$${p}`}
              </button>
            ))}
          </div>
        </div>

        {/* Card & Date Row */}
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
          <div className="grid grid-cols-2 gap-1 rounded-2xl border border-border bg-muted/50 p-1">
            {CARD_METHODS.map((m) => {
              const active = (draft.vendor || "Debit") === m;
              const Icon = paymentCardIcon(m);
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setDraft({ ...draft, vendor: m })}
                  className={cn(
                    "inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl px-3 text-xs font-semibold transition-all duration-150 active:scale-95",
                    active
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{m}</span>
                </button>
              );
            })}
          </div>

          <label className="relative inline-flex min-h-[52px] cursor-pointer items-center gap-1.5 rounded-2xl border border-border bg-muted/50 px-3.5 text-xs font-medium text-foreground">
            <Calendar className="h-4 w-4 shrink-0 text-primary" />
            <input
              type="date"
              value={draft.date}
              onChange={(e) => setDraft({ ...draft, date: e.target.value })}
              className="font-num w-[7.8rem] bg-transparent text-sm outline-none sm:text-xs"
            />
          </label>
        </div>

        {/* Enlarged 3-Column Icon Category Grid */}
        <div>
          <span className="label-mono mb-2 block">Category</span>
          <div className="grid grid-cols-3 gap-2">
            {categoryList.map((cat) => {
              const active = draft.category === cat;
              const Icon = categoryIcon(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setDraft({ ...draft, category: cat })}
                  className={cn(
                    "flex min-h-[66px] flex-col items-center justify-center gap-1.5 rounded-2xl border px-2.5 py-2.5 text-center transition-all duration-150 active:scale-95",
                    active
                      ? "border-primary bg-primary/18 text-primary ring-1 ring-primary/40"
                      : "border-border bg-muted/35 text-muted-foreground hover:border-primary/35 hover:text-foreground",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 shrink-0",
                      active ? "text-primary" : "text-muted-foreground",
                    )}
                  />
                  <span className="w-full truncate text-xs font-semibold">
                    {shortLabel(cat)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {draftAccount === "Studio" && projects.length > 0 && (
          <div>
            <span className="label-mono mb-1.5 block">
              Project cost link (optional)
            </span>
            <select
              value={draft.projectId || ""}
              onChange={(e) =>
                setDraft({ ...draft, projectId: e.target.value })
              }
              className="field h-11 rounded-2xl text-sm"
            >
              <option value="">General Studio Overhead</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} · {p.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 1-Tap Daily Quick-Picks when adding new expense */}
        {!isExisting && quickPicks.length > 0 && (
          <div className="no-scrollbar -mx-1 flex items-center gap-1.5 overflow-x-auto px-1">
            <span className="inline-flex shrink-0 items-center gap-1 text-[0.68rem] font-semibold uppercase tracking-wider text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Quick
            </span>
            {quickPicks.map((qp) => (
              <button
                key={qp.label}
                type="button"
                onClick={() => {
                  const nextAmt = amtText ? draft.amount : qp.amount;
                  if (!amtText) setAmtText(String(qp.amount));
                  setDraft({
                    ...draft,
                    category: qp.category,
                    description: qp.label,
                    currency: amtText ? draft.currency : qp.currency,
                    amount: nextAmt,
                  });
                }}
                className={cn(
                  "min-h-[36px] shrink-0 rounded-lg border px-3 text-xs font-medium transition-colors active:scale-95",
                  draft.description === qp.label
                    ? "border-primary bg-primary/18 text-primary"
                    : "border-border bg-muted/45 text-muted-foreground hover:text-foreground",
                )}
              >
                {qp.label}
              </button>
            ))}
          </div>
        )}

        {/* Optional Note */}
        <input
          type="text"
          placeholder="Note or merchant (optional)"
          value={draft.description}
          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          className="field h-12 rounded-2xl text-base sm:text-sm"
        />

        {/* Aligned Full-Width Bottom Actions */}
        <div className="mt-1 space-y-2 border-t border-border/70 pt-3">
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-border bg-secondary text-sm font-bold text-foreground transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center gap-1.5 rounded-2xl bg-primary text-sm font-bold text-primary-foreground shadow-[0_8px_22px_-8px_var(--primary)] transition-all active:scale-95"
            >
              <Check className="h-4.5 w-4.5" />
              Save Expense
            </button>
          </div>
          {onDelete && (
            <button
              type="button"
              onClick={() => {
                if (!confirmDelete) {
                  setConfirmDelete(true);
                  return;
                }
                onDelete(draft);
                onClose();
              }}
              className={cn(
                "inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-2xl border text-xs font-semibold transition-colors",
                confirmDelete
                  ? "border-destructive bg-destructive text-destructive-foreground"
                  : "border-destructive/35 text-destructive hover:bg-destructive/10",
              )}
            >
              <Trash2 className="h-3.5 w-3.5" />
              {confirmDelete ? "Tap again to delete" : "Delete Expense"}
            </button>
          )}
        </div>
      </form>
    </SlideDrawer>
  );
}

export function QuickIncomeDrawer({
  item,
  onClose,
  onSave,
  onDelete,
}: {
  item: PersonalIncome | null;
  onClose: () => void;
  onSave: (v: PersonalIncome) => void;
  onDelete?: ((v: PersonalIncome) => void) | undefined;
}) {
  const [draft, setDraft] = useState<PersonalIncome | null>(item);
  const [amtText, setAmtText] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setDraft(item);
    setAmtText(item && item.amount > 0 ? String(item.amount) : "");
    setConfirmDelete(false);
  }, [item]);

  const itemId = item?.id ?? "";
  const quickIncomePicks = useMemo(() => {
    if (!itemId) return [];
    const defaults = [
      {
        label: "Monthly Salary",
        source: "Salary",
        amount: 500,
        currency: "USD" as Currency,
      },
      {
        label: "Studio Draw",
        source: "Studio Draw",
        amount: 250,
        currency: "USD" as Currency,
      },
      {
        label: "Freelance Work",
        source: "Freelance",
        amount: 100,
        currency: "USD" as Currency,
      },
      {
        label: "Bonus",
        source: "Bonus",
        amount: 100,
        currency: "USD" as Currency,
      },
    ];
    const recent = (getDB().personalIncome ?? [])
      .filter((i) => i.description.trim())
      .slice(-24)
      .reverse();
    const seen = new Set<string>();
    const picks: {
      label: string;
      source: string;
      amount: number;
      currency: Currency;
    }[] = [];
    for (const i of recent) {
      const clean = i.description.trim().slice(0, 20);
      const key = clean.toLowerCase();
      if (!clean || seen.has(key)) continue;
      seen.add(key);
      picks.push({
        label: clean,
        source: i.source || "Salary",
        amount: i.amount,
        currency: i.currency,
      });
      if (picks.length >= 4) break;
    }
    for (const def of defaults) {
      if (picks.length >= 4) break;
      if (!seen.has(def.label.toLowerCase())) {
        picks.push(def);
        seen.add(def.label.toLowerCase());
      }
    }
    return picks;
  }, [itemId]);

  if (!item || !draft) return null;

  const isExisting = Boolean(onDelete);
  const presets =
    draft.currency === "KHR" ? [50000, 100000, 400000] : [50, 100, 250, 500];

  const commit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmt = Number(amtText.replace(/,/g, "")) || draft.amount || 0;
    if (!(numericAmt > 0)) {
      toast.error("Enter an amount greater than 0.");
      return;
    }
    const dbNow = getDB();
    const normalizedAmount =
      draft.currency === "KHR"
        ? Math.round(numericAmt)
        : Math.round(numericAmt * 100) / 100;
    const preserveRate =
      item.currency === draft.currency && item.amount === normalizedAmount;
    const stamped = stampFxSnapshot(
      {
        ...draft,
        amount: normalizedAmount,
        accountMethod: draft.accountMethod || "Debit",
        date: draft.date || today(),
      },
      dbNow.settings.khrRate,
      preserveRate,
    );
    onSave(stamped);
    onClose();
  };

  return (
    <SlideDrawer
      open
      onClose={onClose}
      title={isExisting ? "Edit Income" : "Log Income"}
      subtitle="Personal Money"
      side="right"
      widthClass="max-w-md"
    >
      <form onSubmit={commit} className="flex flex-col gap-3.5">
        {/* Hero Amount + Currency */}
        <div className="rounded-2xl border border-positive/35 bg-gradient-to-br from-positive/12 via-muted/45 to-muted/25 p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="label-mono">Income Amount</span>
            <div className="inline-flex rounded-xl border border-border bg-background/60 p-0.5">
              {(["USD", "KHR"] as const).map((cur) => (
                <button
                  key={cur}
                  type="button"
                  onClick={() =>
                    setDraft({ ...draft, currency: cur as Currency })
                  }
                  className={cn(
                    "font-num min-h-[36px] rounded-lg px-3.5 text-xs font-semibold transition-all duration-150 active:scale-95",
                    draft.currency === cur
                      ? "bg-positive text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {cur}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-2.5 flex items-baseline gap-2.5">
            <span className="font-num text-3xl font-bold text-positive">
              {draft.currency === "KHR" ? "៛" : "$"}
            </span>
            <input
              type="text"
              inputMode="decimal"
              autoFocus={!isExisting}
              placeholder={draft.currency === "KHR" ? "100,000" : "0.00"}
              value={amtText}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^0-9.]/g, "");
                setAmtText(raw);
                setDraft({ ...draft, amount: Number(raw) || 0 });
              }}
              className="font-num w-full bg-transparent text-4xl font-extrabold tracking-tight text-foreground outline-none placeholder:text-muted-foreground/45"
            />
          </div>

          <div className="no-scrollbar mt-3 flex items-center gap-2 overflow-x-auto">
            {presets.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setAmtText(String(p));
                  setDraft({ ...draft, amount: p });
                }}
                className="font-num min-h-[38px] shrink-0 rounded-lg border border-border/80 bg-background/60 px-3.5 text-xs font-semibold text-muted-foreground transition-all hover:border-positive/50 hover:text-foreground active:scale-95"
              >
                {draft.currency === "KHR"
                  ? `${Math.round(p / 1000)}k`
                  : `$${p}`}
              </button>
            ))}
          </div>
        </div>

        {/* Card & Date Row */}
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
          <div className="grid grid-cols-2 gap-1 rounded-2xl border border-border bg-muted/50 p-1">
            {PERSONAL_INCOME_METHODS.map((m) => {
              const active = (draft.accountMethod || "Debit") === m;
              const Icon = paymentCardIcon(m);
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setDraft({ ...draft, accountMethod: m })}
                  className={cn(
                    "inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl px-3 text-xs font-semibold transition-all duration-150 active:scale-95",
                    active
                      ? "bg-positive text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{m}</span>
                </button>
              );
            })}
          </div>

          <label className="relative inline-flex min-h-[52px] cursor-pointer items-center gap-1.5 rounded-2xl border border-border bg-muted/50 px-3.5 text-xs font-medium text-foreground">
            <Calendar className="h-4 w-4 shrink-0 text-positive" />
            <input
              type="date"
              value={draft.date}
              onChange={(e) => setDraft({ ...draft, date: e.target.value })}
              className="font-num w-[7.8rem] bg-transparent text-sm outline-none sm:text-xs"
            />
          </label>
        </div>

        {/* Enlarged Source Grid */}
        <div>
          <span className="label-mono mb-2 block">Source</span>
          <div className="grid grid-cols-3 gap-2">
            {PERSONAL_INCOME_SOURCES.map((src) => {
              const active = draft.source === src;
              const Icon = incomeSourceIcon(src);
              return (
                <button
                  key={src}
                  type="button"
                  onClick={() => setDraft({ ...draft, source: src })}
                  className={cn(
                    "flex min-h-[66px] flex-col items-center justify-center gap-1.5 rounded-2xl border px-2.5 py-2.5 text-center transition-all duration-150 active:scale-95",
                    active
                      ? "border-positive bg-positive/18 text-positive ring-1 ring-positive/40"
                      : "border-border bg-muted/35 text-muted-foreground hover:border-positive/35 hover:text-foreground",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 shrink-0",
                      active ? "text-positive" : "text-muted-foreground",
                    )}
                  />
                  <span className="w-full truncate text-xs font-semibold">
                    {shortLabel(src)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 1-Tap Quick Income Picks when adding new income */}
        {!isExisting && quickIncomePicks.length > 0 && (
          <div className="no-scrollbar -mx-1 flex items-center gap-1.5 overflow-x-auto px-1">
            <span className="inline-flex shrink-0 items-center gap-1 text-[0.68rem] font-semibold uppercase tracking-wider text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-positive" />
              Quick
            </span>
            {quickIncomePicks.map((qp) => (
              <button
                key={qp.label}
                type="button"
                onClick={() => {
                  const nextAmt = amtText ? draft.amount : qp.amount;
                  if (!amtText) setAmtText(String(qp.amount));
                  setDraft({
                    ...draft,
                    source: qp.source,
                    description: qp.label,
                    currency: amtText ? draft.currency : qp.currency,
                    amount: nextAmt,
                  });
                }}
                className={cn(
                  "min-h-[36px] shrink-0 rounded-lg border px-3 text-xs font-medium transition-colors active:scale-95",
                  draft.description === qp.label
                    ? "border-positive bg-positive/18 text-positive"
                    : "border-border bg-muted/45 text-muted-foreground hover:text-foreground",
                )}
              >
                {qp.label}
              </button>
            ))}
          </div>
        )}

        <input
          type="text"
          placeholder="Note or payer (optional)"
          value={draft.description}
          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          className="field h-12 rounded-2xl text-base sm:text-sm"
        />

        {/* Aligned Full-Width Bottom Actions */}
        <div className="mt-1 space-y-2 border-t border-border/70 pt-3">
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-border bg-secondary text-sm font-bold text-foreground transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center gap-1.5 rounded-2xl bg-positive text-sm font-bold text-primary-foreground shadow-[0_8px_22px_-8px_var(--positive)] transition-all active:scale-95"
            >
              <Check className="h-4.5 w-4.5" />
              Save Income
            </button>
          </div>
          {onDelete && (
            <button
              type="button"
              onClick={() => {
                if (!confirmDelete) {
                  setConfirmDelete(true);
                  return;
                }
                onDelete(draft);
                onClose();
              }}
              className={cn(
                "inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-2xl border text-xs font-semibold transition-colors",
                confirmDelete
                  ? "border-destructive bg-destructive text-destructive-foreground"
                  : "border-destructive/35 text-destructive hover:bg-destructive/10",
              )}
            >
              <Trash2 className="h-3.5 w-3.5" />
              {confirmDelete ? "Tap again to delete" : "Delete Income"}
            </button>
          )}
        </div>
      </form>
    </SlideDrawer>
  );
}

export function QuickStudioIncomeDrawer({
  item,
  onClose,
  onSave,
  onDelete,
}: {
  item: StudioIncome | null;
  onClose: () => void;
  onSave: (v: StudioIncome) => void;
  onDelete?: ((v: StudioIncome) => void) | undefined;
}) {
  const [draft, setDraft] = useState<StudioIncome | null>(item);
  const [amtText, setAmtText] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setDraft(item);
    setAmtText(item && item.amount > 0 ? String(item.amount) : "");
    setConfirmDelete(false);
  }, [item]);

  if (!item || !draft) return null;

  const isExisting = Boolean(onDelete);
  const presets =
    draft.currency === "KHR" ? [100000, 400000, 1000000] : [50, 150, 300, 500];

  const commit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmt = Number(amtText.replace(/,/g, "")) || draft.amount || 0;
    if (!(numericAmt > 0)) {
      toast.error("Enter an amount greater than 0.");
      return;
    }
    const dbNow = getDB();
    const normalizedAmount =
      draft.currency === "KHR"
        ? Math.round(numericAmt)
        : Math.round(numericAmt * 100) / 100;
    const preserveRate =
      item.currency === draft.currency && item.amount === normalizedAmount;
    const stamped = stampFxSnapshot(
      {
        ...draft,
        amount: normalizedAmount,
        accountMethod: draft.accountMethod || draft.method || "Bank Transfer",
        date: draft.date || today(),
      },
      dbNow.settings.khrRate,
      preserveRate,
    );
    onSave(stamped);
    onClose();
  };

  return (
    <SlideDrawer
      open
      onClose={onClose}
      title={isExisting ? "Edit Studio Income" : "Log Studio Income"}
      subtitle="Studio Business (Unmatched Invoice)"
      side="right"
      widthClass="max-w-md"
    >
      <form onSubmit={commit} className="flex flex-col gap-3.5">
        <div className="rounded-2xl border border-positive/35 bg-gradient-to-br from-positive/12 via-muted/45 to-muted/25 p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="label-mono">Amount Received</span>
            <div className="inline-flex rounded-xl border border-border bg-background/60 p-0.5">
              {(["USD", "KHR"] as const).map((cur) => (
                <button
                  key={cur}
                  type="button"
                  onClick={() =>
                    setDraft({ ...draft, currency: cur as Currency })
                  }
                  className={cn(
                    "font-num min-h-[36px] rounded-lg px-3.5 text-xs font-semibold transition-all duration-150 active:scale-95",
                    draft.currency === cur
                      ? "bg-positive text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {cur}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-2.5 flex items-baseline gap-2.5">
            <span className="font-num text-3xl font-bold text-positive">
              {draft.currency === "KHR" ? "៛" : "$"}
            </span>
            <input
              type="text"
              inputMode="decimal"
              autoFocus={!isExisting}
              placeholder={draft.currency === "KHR" ? "400,000" : "0.00"}
              value={amtText}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^0-9.]/g, "");
                setAmtText(raw);
                setDraft({ ...draft, amount: Number(raw) || 0 });
              }}
              className="font-num w-full bg-transparent text-4xl font-extrabold tracking-tight text-foreground outline-none placeholder:text-muted-foreground/45"
            />
          </div>

          <div className="no-scrollbar mt-3 flex items-center gap-2 overflow-x-auto">
            {presets.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setAmtText(String(p));
                  setDraft({ ...draft, amount: p });
                }}
                className="font-num min-h-[38px] shrink-0 rounded-lg border border-border/80 bg-background/60 px-3.5 text-xs font-semibold text-muted-foreground transition-all hover:border-positive/50 hover:text-foreground active:scale-95"
              >
                {draft.currency === "KHR"
                  ? `${Math.round(p / 1000)}k`
                  : `$${p}`}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
          <div className="grid grid-cols-2 gap-1 rounded-2xl border border-border bg-muted/50 p-1">
            {["Bank Transfer", "ABA", "ACLEDA", "Cash"].map((m) => {
              const active =
                (draft.accountMethod || draft.method || "Bank Transfer") === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() =>
                    setDraft({ ...draft, accountMethod: m, method: m })
                  }
                  className={cn(
                    "inline-flex min-h-[36px] items-center justify-center rounded-xl px-2 text-xs font-semibold transition-all active:scale-95",
                    active
                      ? "bg-positive text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {m}
                </button>
              );
            })}
          </div>

          <label className="relative inline-flex min-h-[52px] cursor-pointer items-center gap-1.5 rounded-2xl border border-border bg-muted/50 px-3.5 text-xs font-medium text-foreground">
            <Calendar className="h-4 w-4 shrink-0 text-positive" />
            <input
              type="date"
              value={draft.date}
              onChange={(e) => setDraft({ ...draft, date: e.target.value })}
              className="font-num w-[7.8rem] bg-transparent text-sm outline-none sm:text-xs"
            />
          </label>
        </div>

        <div>
          <span className="label-mono mb-2 block">Studio Income Type</span>
          <div className="grid grid-cols-3 gap-2">
            {STUDIO_INCOME_SOURCES.map((src) => {
              const active = draft.source === src;
              return (
                <button
                  key={src}
                  type="button"
                  onClick={() => setDraft({ ...draft, source: src })}
                  className={cn(
                    "flex min-h-[48px] items-center justify-center rounded-2xl border px-2 py-2 text-center text-xs font-semibold transition-all active:scale-95",
                    active
                      ? "border-positive bg-positive/18 text-positive ring-1 ring-positive/40"
                      : "border-border bg-muted/35 text-muted-foreground hover:border-positive/35 hover:text-foreground",
                  )}
                >
                  {shortLabel(src)}
                </button>
              );
            })}
          </div>
        </div>

        <input
          type="text"
          placeholder="Client name or payment description"
          value={draft.description}
          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          className="field h-12 rounded-2xl text-base sm:text-sm"
        />

        <input
          type="text"
          placeholder="Reference / slip number (optional)"
          value={draft.reference ?? ""}
          onChange={(e) => setDraft({ ...draft, reference: e.target.value })}
          className="field h-11 rounded-2xl font-num text-sm"
        />

        <div className="mt-1 space-y-2 border-t border-border/70 pt-3">
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-border bg-secondary text-sm font-bold text-foreground transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center gap-1.5 rounded-2xl bg-positive text-sm font-bold text-primary-foreground shadow-[0_8px_22px_-8px_var(--positive)] transition-all active:scale-95"
            >
              <Check className="h-4.5 w-4.5" />
              Save Studio Income
            </button>
          </div>
          {onDelete && (
            <button
              type="button"
              onClick={() => {
                if (!confirmDelete) {
                  setConfirmDelete(true);
                  return;
                }
                onDelete(draft);
                onClose();
              }}
              className={cn(
                "inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-2xl border text-xs font-semibold transition-colors",
                confirmDelete
                  ? "border-destructive bg-destructive text-destructive-foreground"
                  : "border-destructive/35 text-destructive hover:bg-destructive/10",
              )}
            >
              <Trash2 className="h-3.5 w-3.5" />
              {confirmDelete ? "Tap again to delete" : "Delete Income"}
            </button>
          )}
        </div>
      </form>
    </SlideDrawer>
  );
}
