import { useEffect, useState } from "react";
import { Calendar, Check, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { SlideDrawer } from "@/components/rv/ui";
import {
  categoryIcon,
  incomeSourceIcon,
  paymentCardIcon,
} from "@/components/rv/FinanceVisuals";
import {
  CARD_METHODS,
  PERSONAL_CATEGORIES,
  PERSONAL_INCOME_METHODS,
  PERSONAL_INCOME_SOURCES,
  today,
  type Currency,
  type Expense,
  type PersonalIncome,
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

  useEffect(() => {
    setDraft(item);
    setAmtText(item && item.amount > 0 ? String(item.amount) : "");
  }, [item]);

  if (!item || !draft) return null;

  const isExisting = Boolean(onDelete);
  const presets = draft.currency === "KHR" ? KHR_PRESETS : USD_PRESETS;

  const commit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmt = Number(amtText.replace(/,/g, "")) || draft.amount || 0;
    if (!(numericAmt > 0)) {
      toast.error("Enter an amount greater than 0.");
      return;
    }
    onSave({
      ...draft,
      account: draft.account ?? "Personal",
      amount:
        draft.currency === "KHR"
          ? Math.round(numericAmt)
          : Math.round(numericAmt * 100) / 100,
      vendor: draft.vendor || "Debit",
      date: draft.date || today(),
    });
    onClose();
  };

  return (
    <SlideDrawer
      open
      onClose={onClose}
      title={isExisting ? "Edit Expense" : "Add Expense"}
      subtitle="Personal Money"
      side="right"
      widthClass="max-w-md"
    >
      <form onSubmit={commit} className="flex flex-col gap-3.5">
        {/* Hero Amount + Currency Toggle Card */}
        <div className="rounded-2xl border border-primary/35 bg-gradient-to-br from-primary/12 via-muted/45 to-muted/25 p-3.5">
          <div className="flex items-center justify-between gap-2">
            <span className="label-mono">Amount</span>
            <div className="inline-flex rounded-full border border-border bg-background/60 p-0.5">
              {(["USD", "KHR"] as const).map((cur) => (
                <button
                  key={cur}
                  type="button"
                  onClick={() =>
                    setDraft({ ...draft, currency: cur as Currency })
                  }
                  className={cn(
                    "font-num rounded-full px-3 py-1 text-[0.72rem] font-semibold transition-all duration-150 active:scale-95",
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

          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-num text-2xl font-bold text-primary">
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
              className="font-num w-full bg-transparent text-3xl font-extrabold tracking-tight text-foreground outline-none placeholder:text-muted-foreground/45"
            />
          </div>

          <div className="no-scrollbar mt-2.5 flex items-center gap-1.5 overflow-x-auto">
            {presets.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setAmtText(String(p));
                  setDraft({ ...draft, amount: p });
                }}
                className="font-num shrink-0 rounded-full border border-border/80 bg-background/55 px-2.5 py-1 text-[0.7rem] font-semibold text-muted-foreground transition-all hover:border-primary/50 hover:text-foreground active:scale-95"
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
                    "inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-xl px-3 text-xs font-semibold transition-all duration-150 active:scale-95",
                    active
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span>{m}</span>
                </button>
              );
            })}
          </div>

          <label className="relative inline-flex min-h-[46px] cursor-pointer items-center gap-1.5 rounded-2xl border border-border bg-muted/50 px-3 text-xs font-medium text-foreground">
            <Calendar className="h-3.5 w-3.5 shrink-0 text-primary" />
            <input
              type="date"
              value={draft.date}
              onChange={(e) => setDraft({ ...draft, date: e.target.value })}
              className="font-num w-[7.2rem] bg-transparent text-xs outline-none"
            />
          </label>
        </div>

        {/* Compact 3-Column Icon Category Grid */}
        <div>
          <span className="label-mono mb-1.5 block">Category</span>
          <div className="grid grid-cols-3 gap-1.5">
            {PERSONAL_CATEGORIES.map((cat) => {
              const active = draft.category === cat;
              const Icon = categoryIcon(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setDraft({ ...draft, category: cat })}
                  className={cn(
                    "flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-2xl border px-2 py-2 text-center transition-all duration-150 active:scale-95",
                    active
                      ? "border-primary bg-primary/18 text-primary ring-1 ring-primary/40"
                      : "border-border bg-muted/35 text-muted-foreground hover:border-primary/35 hover:text-foreground",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0",
                      active ? "text-primary" : "text-muted-foreground",
                    )}
                  />
                  <span className="w-full truncate text-[0.7rem] font-semibold">
                    {shortLabel(cat)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Optional Note */}
        <input
          type="text"
          placeholder="Note or merchant (optional)"
          value={draft.description}
          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          className="field h-11 rounded-2xl text-sm"
        />

        {/* Aligned Full-Width Bottom Actions */}
        <div className="mt-1 space-y-2 border-t border-border/70 pt-3">
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-border bg-secondary text-sm font-semibold text-foreground transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center gap-1.5 rounded-2xl bg-primary text-sm font-semibold text-primary-foreground shadow-[0_8px_22px_-8px_var(--primary)] transition-all active:scale-95"
            >
              <Check className="h-4 w-4" />
              Save
            </button>
          </div>
          {onDelete && (
            <button
              type="button"
              onClick={() => {
                if (confirm("Delete this expense?")) {
                  onDelete(draft);
                  onClose();
                }
              }}
              className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-2xl border border-destructive/35 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete Expense
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

  useEffect(() => {
    setDraft(item);
    setAmtText(item && item.amount > 0 ? String(item.amount) : "");
  }, [item]);

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
    onSave({
      ...draft,
      amount:
        draft.currency === "KHR"
          ? Math.round(numericAmt)
          : Math.round(numericAmt * 100) / 100,
      accountMethod: draft.accountMethod || "Debit",
      date: draft.date || today(),
    });
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
        <div className="rounded-2xl border border-positive/35 bg-gradient-to-br from-positive/12 via-muted/45 to-muted/25 p-3.5">
          <div className="flex items-center justify-between gap-2">
            <span className="label-mono">Income Amount</span>
            <div className="inline-flex rounded-full border border-border bg-background/60 p-0.5">
              {(["USD", "KHR"] as const).map((cur) => (
                <button
                  key={cur}
                  type="button"
                  onClick={() =>
                    setDraft({ ...draft, currency: cur as Currency })
                  }
                  className={cn(
                    "font-num rounded-full px-3 py-1 text-[0.72rem] font-semibold transition-all duration-150 active:scale-95",
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

          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-num text-2xl font-bold text-positive">
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
              className="font-num w-full bg-transparent text-3xl font-extrabold tracking-tight text-foreground outline-none placeholder:text-muted-foreground/45"
            />
          </div>

          <div className="no-scrollbar mt-2.5 flex items-center gap-1.5 overflow-x-auto">
            {presets.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setAmtText(String(p));
                  setDraft({ ...draft, amount: p });
                }}
                className="font-num shrink-0 rounded-full border border-border/80 bg-background/55 px-2.5 py-1 text-[0.7rem] font-semibold text-muted-foreground transition-all hover:border-positive/50 hover:text-foreground active:scale-95"
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
                    "inline-flex min-h-[38px] items-center justify-center gap-1.5 rounded-xl px-3 text-xs font-semibold transition-all duration-150 active:scale-95",
                    active
                      ? "bg-positive text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span>{m}</span>
                </button>
              );
            })}
          </div>

          <label className="relative inline-flex min-h-[46px] cursor-pointer items-center gap-1.5 rounded-2xl border border-border bg-muted/50 px-3 text-xs font-medium text-foreground">
            <Calendar className="h-3.5 w-3.5 shrink-0 text-positive" />
            <input
              type="date"
              value={draft.date}
              onChange={(e) => setDraft({ ...draft, date: e.target.value })}
              className="font-num w-[7.2rem] bg-transparent text-xs outline-none"
            />
          </label>
        </div>

        {/* Compact Source Grid */}
        <div>
          <span className="label-mono mb-1.5 block">Source</span>
          <div className="grid grid-cols-3 gap-1.5">
            {PERSONAL_INCOME_SOURCES.map((src) => {
              const active = draft.source === src;
              const Icon = incomeSourceIcon(src);
              return (
                <button
                  key={src}
                  type="button"
                  onClick={() => setDraft({ ...draft, source: src })}
                  className={cn(
                    "flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-2xl border px-2 py-2 text-center transition-all duration-150 active:scale-95",
                    active
                      ? "border-positive bg-positive/18 text-positive ring-1 ring-positive/40"
                      : "border-border bg-muted/35 text-muted-foreground hover:border-positive/35 hover:text-foreground",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0",
                      active ? "text-positive" : "text-muted-foreground",
                    )}
                  />
                  <span className="w-full truncate text-[0.7rem] font-semibold">
                    {shortLabel(src)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <input
          type="text"
          placeholder="Note or payer (optional)"
          value={draft.description}
          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          className="field h-11 rounded-2xl text-sm"
        />

        {/* Aligned Full-Width Bottom Actions */}
        <div className="mt-1 space-y-2 border-t border-border/70 pt-3">
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-border bg-secondary text-sm font-semibold text-foreground transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center gap-1.5 rounded-2xl bg-positive text-sm font-semibold text-primary-foreground shadow-[0_8px_22px_-8px_var(--positive)] transition-all active:scale-95"
            >
              <Check className="h-4 w-4" />
              Save
            </button>
          </div>
          {onDelete && (
            <button
              type="button"
              onClick={() => {
                if (confirm("Delete this income entry?")) {
                  onDelete(draft);
                  onClose();
                }
              }}
              className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-2xl border border-destructive/35 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete Income
            </button>
          )}
        </div>
      </form>
    </SlideDrawer>
  );
}
