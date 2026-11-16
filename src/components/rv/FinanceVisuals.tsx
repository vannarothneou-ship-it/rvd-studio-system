import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Baby,
  Briefcase,
  Building2,
  Car,
  CheckCircle2,
  Coffee,
  Coins,
  CreditCard,
  Fuel,
  Hammer,
  HeartPulse,
  Landmark,
  Laptop,
  Megaphone,
  Monitor,
  Package,
  PiggyBank,
  Plane,
  Plus,
  Printer,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Stethoscope,
  Type,
  Users,
  Utensils,
  UtensilsCrossed,
  Wallet,
  Wifi,
  Wrench,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import {
  categoryLimit,
  compactMoney,
  expenseAccount,
  money,
  previousMonth,
  setCategoryLimit,
  shortDate,
  toUSD,
  today,
  type Account,
  type DB,
  type Expense,
  type Goal,
} from "@/lib/store";
import { cn } from "@/lib/utils";

/* ---------- Category & Item Icon Mapping ---------- */

const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
  Food: Utensils,
  "Food and groceries": Utensils,
  Transportation: Car,
  Transport: Car,
  Kid: Baby,
  Family: Baby,
  "Personal Spending": ShoppingBag,
  Shopping: ShoppingBag,
  Utilities: Zap,
  "Medical & Healthcare": HeartPulse,
  Health: HeartPulse,
  "Saving & Investing": PiggyBank,
  "Prius 2012": Wrench,
  "Software and subscriptions": Laptop,
  "Fonts and licenses": Type,
  "Printing and production": Printer,
  "Fabrication and vendors": Hammer,
  Freelancers: Users,
  Marketing: Megaphone,
  Equipment: Monitor,
  "Office and utilities": Building2,
  Other: Package,
};

export function categoryIcon(category: string): LucideIcon {
  return CATEGORY_ICON_MAP[category] ?? Briefcase;
}

export function paymentCardIcon(method: string): LucideIcon {
  const m = method.trim().toLowerCase();
  if (m.includes("credit")) return CreditCard;
  if (m.includes("debit")) return Landmark;
  if (m.includes("khqr") || m.includes("wing") || m.includes("aba"))
    return Smartphone;
  if (m.includes("cash")) return Wallet;
  return CreditCard;
}

export function expenseItemIcon(
  e: Pick<Expense, "category" | "description" | "vendor">,
): LucideIcon {
  const text = `${e.description} ${e.vendor}`.toLowerCase();
  if (/coffee|cafe|latte|espresso|matcha|tea/.test(text)) return Coffee;
  if (/gas|fuel|totalenergies|ptt|caltex|petrol/.test(text)) return Fuel;
  if (/flight|airport|airline|plane|trip/.test(text)) return Plane;
  if (/tuktuk|tuk tuk|passapp|grab|taxi|bus|ride/.test(text)) return Car;
  if (/grocer|aeon|supermarket|lucky|market|mart/.test(text))
    return ShoppingCart;
  if (/milk|diaper|formula|baby|kid|toddler|stroller|toy/.test(text))
    return Baby;
  if (
    /breakfast|lunch|dinner|pizza|burger|congee|rice|noodle|meal|ramen/.test(
      text,
    )
  )
    return UtensilsCrossed;
  if (/internet|wifi|metfone|cellcard|smart|sinet|ezecom/.test(text))
    return Wifi;
  if (/edc|electric|water|ppwsa|power|utility|bill/.test(text)) return Zap;
  if (
    /hospital|clinic|dentist|doctor|pharmacy|medicine|checkup|vitamin/.test(
      text,
    )
  )
    return Stethoscope;
  if (/gold|invest|saving|deposit|bank/.test(text)) return Coins;
  if (/prius|oil|tire|brake|battery|mechanic|service|car|wash/.test(text))
    return Wrench;
  if (/adobe|figma|framer|software|cloud|domain|hosting/.test(text))
    return Laptop;
  if (/print|proof|box|packaging|paper/.test(text)) return Printer;
  return categoryIcon(e.category);
}

/* ---------- Animated Number Counter ---------- */

export function AnimatedNumber({
  value,
  format = (n) => money(n),
  duration = 520,
  className,
}: {
  value: number;
  format?: (n: number) => string;
  duration?: number;
  className?: string;
}) {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);

  useEffect(() => {
    const startVal = prevRef.current;
    prevRef.current = value;
    if (
      typeof window === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setDisplay(value);
      return;
    }
    const diff = value - startVal;
    if (Math.abs(diff) < 0.005) {
      setDisplay(value);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(startVal + diff * eased);
      if (p < 1) raf = requestAnimationFrame(step);
      else setDisplay(value);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <span className={className}>{format(display)}</span>;
}

/* ---------- Month Pace Helper ---------- */

export function monthPacePercent(month: string): number {
  const cur = today();
  if (!month || month === cur.slice(0, 7)) {
    const [y, m, d] = cur.split("-").map(Number);
    if (!y || !m || !d) return 50;
    const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
    return Math.min(100, Math.max(5, Math.round((d / daysInMonth) * 100)));
  }
  return month < cur.slice(0, 7) ? 100 : 15;
}

/* ---------- Liquid-Fill Category Jar ---------- */

export function LiquidJar({
  category,
  spent,
  limit,
  pacePct = 55,
  size = "md",
  selected = false,
}: {
  category: string;
  spent: number;
  limit: number;
  pacePct?: number;
  size?: "sm" | "md" | "lg";
  selected?: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const Icon = categoryIcon(category);
  const rawPct =
    limit > 0 ? Math.round((spent / limit) * 100) : spent > 0 ? 100 : 0;
  const fillPct = mounted
    ? Math.min(100, Math.max(spent > 0 ? 6 : 0, rawPct))
    : 0;
  const overLimit = rawPct > 100;
  const fastPace = rawPct > Math.min(95, pacePct + 12);

  const dims =
    size === "sm"
      ? "h-28 w-full rounded-[1.1rem]"
      : size === "lg"
        ? "h-44 w-36 rounded-[1.6rem]"
        : "h-36 w-full rounded-[1.35rem]";

  return (
    <div
      className={cn(
        "flex flex-col items-center",
        size === "lg" ? "w-36" : "w-full",
      )}
    >
      {/* Jar Lid / Neck */}
      <div
        className={cn(
          "mb-1 rounded-full bg-border/80 transition-colors",
          size === "sm" ? "h-1 w-7" : "h-1.5 w-10",
          selected && "bg-primary",
        )}
      />
      {/* Jar Body */}
      <div
        className={cn(
          "relative overflow-hidden border bg-muted/45 shadow-inner transition-all duration-300",
          dims,
          selected
            ? "border-primary ring-2 ring-primary/35"
            : "border-border/80 group-hover:border-primary/60",
        )}
      >
        {/* Pacing guide line (where monthly spend would sit evenly) */}
        {limit > 0 && (
          <div
            className="pointer-events-none absolute inset-x-0 z-10 border-t border-dashed border-foreground/25"
            style={{ bottom: `${Math.min(94, Math.max(6, pacePct))}%` }}
          />
        )}

        {/* Rising Liquid */}
        <div
          className={cn(
            "absolute inset-x-0 bottom-0 transition-[height] duration-900 ease-[cubic-bezier(0.22,1,0.36,1)]",
            overLimit
              ? "bg-gradient-to-t from-destructive/80 via-destructive/60 to-destructive/40"
              : fastPace
                ? "bg-gradient-to-t from-primary/85 via-primary/70 to-destructive/45"
                : "bg-gradient-to-t from-primary/80 via-primary/55 to-primary/35",
          )}
          style={{ height: `${fillPct}%` }}
        >
          {/* Animated liquid meniscus sheen */}
          <div className="jar-sheen h-2 w-full bg-gradient-to-b from-white/35 to-transparent" />
        </div>

        {/* Top Icon Medallion */}
        <div
          className={cn(
            "relative z-10 mx-auto grid place-items-center rounded-full border border-border/80 bg-background/80 backdrop-blur-md shadow-sm transition-transform duration-300 group-hover:scale-105",
            size === "sm"
              ? "mt-2.5 h-8 w-8"
              : size === "lg"
                ? "mt-3.5 h-11 w-11"
                : "mt-3 h-9 w-9",
          )}
        >
          <Icon
            className={cn(
              size === "sm"
                ? "h-3.5 w-3.5"
                : size === "lg"
                  ? "h-5 w-5"
                  : "h-4 w-4",
              overLimit ? "text-destructive" : "text-primary",
            )}
          />
        </div>

        {/* Bottom-left Percentage Pill */}
        <span
          className={cn(
            "absolute bottom-2 left-2 z-10 rounded-full border border-border/70 bg-background/85 px-2 py-0.5 font-mono font-semibold backdrop-blur-md",
            size === "sm" ? "text-[0.62rem]" : "text-[0.68rem]",
            overLimit ? "text-destructive" : "text-foreground",
          )}
        >
          {rawPct}%
        </span>
      </div>
    </div>
  );
}

/* ---------- Budget Shelf (Jars + Spending Fast Card) ---------- */

export interface CategoryStatItem {
  category: string;
  totalUSD: number;
  count: number;
}

export function BudgetShelf({
  db,
  account,
  month,
  monthLabel,
  items,
  selectedCategory,
  onSelectCategory,
  compact = false,
  limitScale = 1,
}: {
  db: DB;
  account: Account;
  month: string;
  monthLabel: string;
  items: CategoryStatItem[];
  selectedCategory?: string | null;
  onSelectCategory: (category: string) => void;
  compact?: boolean;
  limitScale?: number | undefined;
}) {
  const pacePct = limitScale > 1 ? 100 : monthPacePercent(month);

  const jars = useMemo(() => {
    return items.map((it) => {
      const limit = categoryLimit(db, account, it.category) * limitScale;
      const pct = limit > 0 ? Math.round((it.totalUSD / limit) * 100) : 100;
      const isOver = pct > 100;
      const isFast = !isOver && pct > Math.min(95, pacePct + 12);
      return {
        ...it,
        limit,
        pct,
        isOver,
        isFast,
      };
    });
  }, [db, account, items, pacePct, limitScale]);

  const fastList = useMemo(
    () =>
      [...jars]
        .filter((j) => j.isOver || j.isFast)
        .sort((a, b) => b.pct - a.pct)
        .slice(0, 3),
    [jars],
  );

  if (jars.length === 0) return null;

  if (compact) {
    return (
      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5">
        {jars.slice(0, 5).map((j, idx) => (
          <button
            key={j.category}
            type="button"
            onClick={() => onSelectCategory(j.category)}
            style={{ animationDelay: `${idx * 45}ms` }}
            title={`${j.category}: ${money(j.totalUSD)} / ${money(j.limit)}`}
            className="group rise flex flex-col items-center rounded-2xl border border-border/60 bg-muted/25 p-2.5 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/60 hover:bg-muted/50"
          >
            <LiquidJar
              category={j.category}
              spent={j.totalUSD}
              limit={j.limit}
              pacePct={pacePct}
              size="sm"
              selected={selectedCategory === j.category}
            />
            <span className="mt-2 inline-flex max-w-full items-center gap-1 text-xs font-medium">
              {(() => {
                const CatIcon = categoryIcon(j.category);
                return <CatIcon className="h-3 w-3 shrink-0 text-primary" />;
              })()}
              <span className="truncate">{j.category}</span>
            </span>
            <span className="font-mono text-[0.68rem] tabular-nums text-muted-foreground">
              {compactMoney(j.totalUSD)}
            </span>
            {(j.isOver || j.isFast) && (
              <span className="mt-0.5 text-[0.62rem] font-medium text-destructive">
                {j.isOver ? "Over limit" : "Spending fast"}
              </span>
            )}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.75fr)_minmax(0,0.85fr)]">
      {/* The Shelf */}
      <div className="glass p-5 sm:p-6 rise">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-medium">
              {account === "Personal"
                ? "Personal category jars"
                : "Studio expense jars"}
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {limitScale > 1
                ? `${limitScale}-month combined target for ${monthLabel}. Click any jar to adjust monthly limit.`
                : `Dashed line marks even ${monthLabel} pace (${pacePct}%). Click any jar to adjust limit or view receipts.`}
            </p>
          </div>
          <span className="label-mono">{jars.length} categories</span>
        </div>

        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4">
          {jars.map((j, idx) => (
            <button
              key={j.category}
              type="button"
              onClick={() => onSelectCategory(j.category)}
              style={{ animationDelay: `${idx * 40}ms` }}
              title={`${j.category}: ${money(j.totalUSD)} of ${money(j.limit)}`}
              className={cn(
                "group rise flex flex-col items-center rounded-2xl border p-3 text-center transition-all duration-200 hover:-translate-y-0.5",
                selectedCategory === j.category
                  ? "border-primary bg-primary/10"
                  : "border-border/60 bg-muted/25 hover:border-primary/50 hover:bg-muted/45",
              )}
            >
              <LiquidJar
                category={j.category}
                spent={j.totalUSD}
                limit={j.limit}
                pacePct={pacePct}
                selected={selectedCategory === j.category}
              />
              <span className="mt-2.5 inline-flex max-w-full items-center gap-1 text-xs font-semibold">
                {(() => {
                  const CatIcon = categoryIcon(j.category);
                  return (
                    <CatIcon className="h-3.5 w-3.5 shrink-0 text-primary" />
                  );
                })()}
                <span className="truncate">{j.category}</span>
              </span>
              <span className="mt-0.5 font-mono text-[0.68rem] tabular-nums text-muted-foreground">
                {compactMoney(j.totalUSD)} of {compactMoney(j.limit)}
              </span>
              {j.isOver ? (
                <span className="mt-1 text-[0.65rem] font-medium text-destructive">
                  Over limit
                </span>
              ) : j.isFast ? (
                <span className="mt-1 text-[0.65rem] font-medium text-destructive">
                  Spending fast
                </span>
              ) : (
                <span className="mt-1 text-[0.65rem] text-muted-foreground">
                  {j.count} {j.count === 1 ? "item" : "items"}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Spending Fast Insight Card */}
      <div
        className="glass flex flex-col justify-between p-5 sm:p-6 rise"
        style={{ animationDelay: "100ms" }}
      >
        <div>
          <div className="mb-1 flex items-center justify-between">
            <h2 className="font-medium">Spending fast</h2>
            <AlertTriangle
              className={cn(
                "h-4 w-4",
                fastList.length > 0 ? "text-destructive" : "text-positive",
              )}
            />
          </div>
          <p className="mb-4 text-xs text-muted-foreground">
            Categories pacing ahead of your {monthLabel} target
          </p>

          {fastList.length === 0 ? (
            <div className="rounded-2xl border border-border/70 bg-muted/35 p-4 text-xs text-muted-foreground">
              <div className="mb-1.5 flex items-center gap-2 font-medium text-positive">
                <CheckCircle2 className="h-4 w-4" />
                Every category is on pace
              </div>
              No category is pacing ahead of its monthly limit for {monthLabel}.
            </div>
          ) : (
            <div className="space-y-2.5">
              {fastList.map((j) => {
                const Icon = categoryIcon(j.category);
                return (
                  <button
                    key={j.category}
                    type="button"
                    onClick={() => onSelectCategory(j.category)}
                    className="flex w-full items-center gap-3 rounded-2xl border border-border/70 bg-muted/35 p-3 text-left transition-colors hover:border-primary/60 hover:bg-muted/60"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-border bg-background/60 text-destructive">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {j.category}
                      </p>
                      <p className="font-mono text-[0.7rem] text-muted-foreground">
                        {money(j.totalUSD)} / {money(j.limit)}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full border border-destructive/30 bg-destructive/15 px-2.5 py-0.5 font-mono text-xs font-semibold text-destructive">
                      {j.pct}%
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-4 rounded-2xl border border-border/70 bg-muted/25 p-3.5 text-xs text-muted-foreground">
          {jars.length - fastList.length} of {jars.length} categories are pacing
          safely under their monthly limit.
        </div>
      </div>
    </div>
  );
}

/* ---------- Right-Side Category Inspector Slide-Over Drawer ---------- */

export function CategoryInspectorDrawer({
  db,
  account,
  category,
  month,
  onClose,
  onAddExpense,
  onEditExpense,
}: {
  db: DB;
  account: Account;
  category: string | null;
  month: string;
  onClose: () => void;
  onAddExpense?: (account: Account, category: string) => void;
  onEditExpense?: (expense: Expense) => void;
}) {
  const limit = category ? categoryLimit(db, account, category) : 0;
  const [limitInput, setLimitInput] = useState(String(limit));
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    setLimitInput(String(limit));
    setSavedFlash(false);
  }, [category, limit]);

  useEffect(() => {
    if (!category) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [category, onClose]);

  if (!category) return null;

  const r = db.settings.khrRate;
  const prevYm = previousMonth(month);
  const monthLabel = new Date(month + "-01T00:00:00Z").toLocaleDateString(
    "en-US",
    { month: "long", year: "numeric", timeZone: "UTC" },
  );
  const shortCur = new Date(month + "-01T00:00:00Z").toLocaleDateString(
    "en-US",
    { month: "short", timeZone: "UTC" },
  );
  const shortPrev = new Date(prevYm + "-01T00:00:00Z").toLocaleDateString(
    "en-US",
    { month: "short", timeZone: "UTC" },
  );

  const items = db.expenses
    .filter(
      (e) =>
        expenseAccount(e) === account &&
        e.category === category &&
        e.date.startsWith(month),
    )
    .sort((a, b) => b.date.localeCompare(a.date));

  const spentCur = items.reduce(
    (s, e) => s + toUSD(e.amount, e.currency, r),
    0,
  );
  const spentPrev = db.expenses
    .filter(
      (e) =>
        expenseAccount(e) === account &&
        e.category === category &&
        e.date.startsWith(prevYm),
    )
    .reduce((s, e) => s + toUSD(e.amount, e.currency, r), 0);

  const pacePct = monthPacePercent(month);
  const pct = limit > 0 ? Math.round((spentCur / limit) * 100) : 100;
  const statusLabel =
    pct > 100
      ? "Over limit"
      : pct > Math.min(95, pacePct + 12)
        ? "Spending fast"
        : "On pace";

  const saveLimit = () => {
    const val = Number(limitInput);
    if (!Number.isFinite(val) || val < 0) return;
    setCategoryLimit(account, category, val);
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 1400);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label={`${category} details`}
    >
      {/* Dim Backdrop */}
      <button
        type="button"
        aria-label="Close category inspector"
        onClick={onClose}
        className="backdrop-in fixed inset-0 bg-black/55 backdrop-blur-xs"
      />

      {/* Slide-Over Panel */}
      <aside className="drawer-in glass-strong relative z-10 flex h-full w-full max-w-md flex-col border-l border-border shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            <span className="label-mono">
              {account} · {monthLabel}
            </span>
            <h2 className="mt-0.5 font-display text-xl font-bold">
              {category}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          {/* Centered Hero Jar */}
          <div className="flex flex-col items-center rounded-2xl border border-border/70 bg-muted/25 py-5">
            <LiquidJar
              category={category}
              spent={spentCur}
              limit={limit}
              pacePct={pacePct}
              size="lg"
              selected
            />
            <p className="mt-3 font-mono text-xs text-muted-foreground">
              <strong className="text-foreground">{money(spentCur)}</strong> of{" "}
              {money(limit)}
            </p>
            <span
              className={cn(
                "mt-1 text-xs font-medium",
                statusLabel === "On pace"
                  ? "text-positive"
                  : "text-destructive",
              )}
            >
              {statusLabel}
            </span>
          </div>

          {/* Month Comparison */}
          <div className="divide-y divide-border rounded-2xl border border-border/70 bg-muted/25 px-4 text-sm">
            <div className="flex items-center justify-between py-2.5">
              <span className="text-muted-foreground">Spent in {shortCur}</span>
              <AnimatedNumber
                value={spentCur}
                className="font-mono font-semibold"
              />
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="text-muted-foreground">
                Spent in {shortPrev}
              </span>
              <span className="font-mono text-muted-foreground">
                {money(spentPrev)}
              </span>
            </div>
          </div>

          {/* Editable Monthly Limit */}
          <div>
            <label className="label-mono mb-1.5 block">
              Monthly limit (USD)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min={0}
                step="10"
                value={limitInput}
                onChange={(e) => setLimitInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveLimit();
                }}
                className="field font-mono"
              />
              <button
                type="button"
                onClick={saveLimit}
                className={cn(
                  "shrink-0 rounded-xl px-4 py-2 text-xs font-semibold transition-colors",
                  savedFlash
                    ? "bg-positive text-primary-foreground"
                    : "bg-primary text-primary-foreground hover:opacity-90",
                )}
              >
                {savedFlash ? "Saved" : "Save"}
              </button>
            </div>
          </div>

          {/* Itemized Transactions */}
          <div>
            <div className="mb-2.5 flex items-center justify-between">
              <span className="label-mono">
                What I paid for ({items.length})
              </span>
              {onAddExpense && (
                <button
                  type="button"
                  onClick={() => onAddExpense(account, category)}
                  className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs font-medium text-primary hover:bg-accent"
                >
                  <Plus className="h-3 w-3" />
                  Add
                </button>
              )}
            </div>

            {items.length === 0 ? (
              <p className="rounded-2xl border border-border/60 bg-muted/20 p-4 text-center text-xs text-muted-foreground">
                No {category} transactions in {monthLabel}.
              </p>
            ) : (
              <ul className="divide-y divide-border rounded-2xl border border-border/70 bg-muted/20">
                {items.map((e) => {
                  const ItemIcon = expenseItemIcon(e);
                  const usd = toUSD(e.amount, e.currency, r);
                  return (
                    <li key={e.id}>
                      <button
                        type="button"
                        onClick={() => onEditExpense?.(e)}
                        className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left transition-colors hover:bg-muted/50"
                      >
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-border bg-background/50 text-primary">
                          <ItemIcon className="h-3.5 w-3.5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {e.description || e.vendor || category}
                          </p>
                          <p className="truncate text-[0.72rem] text-muted-foreground">
                            {shortDate(e.date)}
                            {e.vendor ? ` · ${e.vendor}` : ""}
                          </p>
                        </div>
                        <span className="shrink-0 font-mono text-xs font-semibold text-destructive">
                          -{money(usd)}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}

/* ---------- Video-Inspired Circular SVG Ring Goal Card ---------- */

export function GoalRingCard({
  goal,
  current,
  accountLabel,
  onEdit,
  onQuickAdd,
  delay = 0,
}: {
  goal: Goal;
  current: number;
  accountLabel?: string | undefined;
  onEdit: () => void;
  onQuickAdd?: ((delta: number) => void) | undefined;
  delay?: number;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const target = goal.target || 1;
  const pct = Math.min(100, Math.round((current / target) * 100));
  const isMoney = goal.kind !== "clients";
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const targetOffset = circumference * (1 - (mounted ? pct : 0) / 100);
  const done = pct >= 100;

  return (
    <div
      style={{ animationDelay: `${delay}ms` }}
      className="rise flex flex-col justify-between rounded-2xl border border-border/75 bg-muted/30 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50"
    >
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          onClick={onEdit}
          className="min-w-0 text-left hover:text-primary"
        >
          <p className="truncate text-sm font-semibold">
            {goal.name || "Untitled goal"}
          </p>
          {accountLabel && (
            <span className="font-mono text-[0.65rem] text-muted-foreground">
              {accountLabel}
            </span>
          )}
        </button>
        <span
          className={cn(
            "shrink-0 rounded-full border px-2 py-0.5 font-mono text-[0.68rem] font-semibold",
            done
              ? "border-positive/40 bg-positive/15 text-positive"
              : "border-border bg-background/60 text-muted-foreground",
          )}
        >
          {pct}%
        </span>
      </div>

      {/* Circular Donut Progress Ring */}
      <button
        type="button"
        onClick={onEdit}
        className="relative mx-auto my-3 grid h-32 w-32 place-items-center"
      >
        <svg className="h-full w-full -rotate-90" viewBox="0 0 108 108">
          <circle
            cx="54"
            cy="54"
            r={radius}
            fill="none"
            stroke="var(--muted)"
            strokeWidth="8"
          />
          <circle
            cx="54"
            cy="54"
            r={radius}
            fill="none"
            stroke={done ? "var(--positive)" : "var(--primary)"}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={targetOffset}
            className="transition-[stroke-dashoffset] duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]"
          />
        </svg>
        <div
          className="absolute inset-0 flex flex-col items-center justify-center px-3 text-center"
          title={
            isMoney
              ? `${money(current)} of ${money(goal.target)}`
              : `${current} of ${goal.target}`
          }
        >
          <AnimatedNumber
            value={current}
            format={(n) =>
              isMoney ? compactMoney(Math.round(n)) : String(Math.round(n))
            }
            className="font-display text-lg font-black leading-tight tabular-nums"
          />
          <span className="mt-0.5 font-mono text-[0.64rem] tabular-nums text-muted-foreground">
            of {isMoney ? compactMoney(goal.target) : goal.target}
          </span>
        </div>
      </button>

      {goal.kind === "manual" && onQuickAdd ? (
        <div className="flex items-center justify-center gap-1.5">
          {[50, 100].map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => onQuickAdd(amt)}
              className="rounded-full border border-border px-3 py-1 text-[0.7rem] font-medium transition-colors hover:border-primary hover:bg-accent"
            >
              +${amt}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-center font-mono text-[0.65rem] text-muted-foreground">
          {goal.kind === "cash"
            ? "Auto-synced from paid invoices"
            : "Auto-synced from active clients"}
        </p>
      )}
    </div>
  );
}
