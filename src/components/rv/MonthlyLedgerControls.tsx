import { CalendarDays, Layers, List } from "lucide-react";
import { formatMonthShort, money } from "@/lib/store";
import { cn } from "@/lib/utils";

export function MonthlyLedgerToolbar({
  months,
  selectedMonth,
  onSelectMonth,
  groupByMonth,
  onToggleGroupByMonth,
  className,
}: {
  months: readonly string[];
  selectedMonth: string; // "all" or "YYYY-MM"
  onSelectMonth: (next: string) => void;
  groupByMonth: boolean;
  onToggleGroupByMonth: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="no-scrollbar flex min-w-0 flex-nowrap items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
        <button
          type="button"
          onClick={() => onSelectMonth("all")}
          className={cn(
            "inline-flex min-h-[36px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 text-xs font-semibold transition-colors active:scale-95",
            selectedMonth === "all"
              ? "border-primary bg-primary text-primary-foreground shadow-xs"
              : "border-border bg-secondary/75 text-muted-foreground hover:text-foreground",
          )}
        >
          <CalendarDays className="h-3.5 w-3.5 shrink-0" />
          <span>All months</span>
        </button>

        {months.map((ym) => {
          const active = selectedMonth === ym;
          return (
            <button
              key={ym}
              type="button"
              onClick={() => onSelectMonth(active ? "all" : ym)}
              className={cn(
                "font-num inline-flex min-h-[36px] shrink-0 items-center whitespace-nowrap rounded-lg border px-3 text-xs font-medium transition-colors active:scale-95",
                active
                  ? "border-primary bg-primary text-primary-foreground shadow-xs"
                  : "border-border bg-muted/45 text-muted-foreground hover:border-primary/40 hover:text-foreground",
              )}
            >
              {formatMonthShort(ym)}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onToggleGroupByMonth}
        aria-pressed={groupByMonth}
        className={cn(
          "inline-flex min-h-[36px] shrink-0 items-center justify-center gap-1.5 self-start whitespace-nowrap rounded-lg border px-3 text-xs font-semibold transition-colors active:scale-95 sm:self-auto",
          groupByMonth
            ? "border-primary/50 bg-primary/15 text-primary"
            : "border-border bg-secondary/75 text-muted-foreground hover:text-foreground",
        )}
      >
        {groupByMonth ? (
          <Layers className="h-3.5 w-3.5 shrink-0" />
        ) : (
          <List className="h-3.5 w-3.5 shrink-0" />
        )}
        <span>{groupByMonth ? "Grouped by month" : "Flat list"}</span>
      </button>
    </div>
  );
}

export function MonthlyGroupHeader({
  label,
  count,
  incomeUSD,
  expenseUSD,
  netUSD,
  showIncome = true,
  showExpense = true,
  activeFilterMonth,
  month,
  onSelectMonth,
}: {
  label: string;
  count: number;
  incomeUSD: number;
  expenseUSD: number;
  netUSD: number;
  showIncome?: boolean;
  showExpense?: boolean;
  activeFilterMonth?: string;
  month: string;
  onSelectMonth?: (ym: string) => void;
}) {
  const isFilteredToThis = activeFilterMonth === month;
  const showCombinedNet =
    showIncome && showExpense && incomeUSD > 0 && expenseUSD > 0;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-y border-border/70 bg-muted/35 px-3 py-2">
      <div className="flex min-w-0 items-center gap-2">
        {onSelectMonth && month !== "unknown" ? (
          <button
            type="button"
            onClick={() => onSelectMonth(isFilteredToThis ? "all" : month)}
            title={
              isFilteredToThis ? "Show all months" : `Filter to ${label} only`
            }
            className="inline-flex min-w-0 items-center gap-1.5 text-left text-xs font-bold text-foreground transition-colors hover:text-primary"
          >
            <CalendarDays className="h-3.5 w-3.5 shrink-0 text-primary" />
            <span className="truncate">{label}</span>
          </button>
        ) : (
          <span className="inline-flex min-w-0 items-center gap-1.5 text-xs font-bold text-foreground">
            <CalendarDays className="h-3.5 w-3.5 shrink-0 text-primary" />
            <span className="truncate">{label}</span>
          </span>
        )}
        <span className="font-num shrink-0 text-[0.7rem] text-muted-foreground">
          · {count} {count === 1 ? "entry" : "entries"}
        </span>
      </div>

      <div className="font-num flex flex-wrap items-center gap-2.5 text-xs font-semibold">
        {showIncome && incomeUSD > 0 && (
          <span className="text-positive">+{money(incomeUSD)}</span>
        )}
        {showExpense && expenseUSD > 0 && (
          <span className="text-destructive">{money(-expenseUSD)}</span>
        )}
        {showCombinedNet && (
          <span
            className={cn(
              "border-l border-border/80 pl-2.5",
              netUSD >= 0 ? "text-positive" : "text-destructive",
            )}
          >
            Net {money(netUSD, "USD", true)}
          </span>
        )}
      </div>
    </div>
  );
}
