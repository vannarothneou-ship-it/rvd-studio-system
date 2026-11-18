import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { today } from "@/lib/store";
import { cn } from "@/lib/utils";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

function parseYM(ym: string): { year: number; monthIdx: number } {
  const m = ym.match(/^(\d{4})-(\d{2})$/);
  if (!m) {
    const now = today();
    return {
      year: Number(now.slice(0, 4)),
      monthIdx: Number(now.slice(5, 7)) - 1,
    };
  }
  return {
    year: Number(m[1]),
    monthIdx: Math.min(11, Math.max(0, Number(m[2]) - 1)),
  };
}

function formatYM(year: number, monthIdx: number): string {
  const dt = new Date(Date.UTC(year, monthIdx, 1));
  return dt.toISOString().slice(0, 7);
}

export function MonthPicker({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (ym: string) => void;
  className?: string | undefined;
}) {
  const { year, monthIdx } = parseYM(value);
  const [open, setOpen] = useState(false);
  const [panelYear, setPanelYear] = useState(year);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{
    top: number;
    left: number;
    openUp: boolean;
  } | null>(null);

  const label = new Date(Date.UTC(year, monthIdx, 1)).toLocaleDateString(
    "en-US",
    {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    },
  );

  const currentYM = today().slice(0, 7);

  const stepMonth = (delta: number) => {
    onChange(formatYM(year, monthIdx + delta));
  };

  useEffect(() => {
    if (!open) return;
    setPanelYear(year);
    const sync = () => {
      const el = triggerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const spaceBelow = window.innerHeight - r.bottom;
      const openUp = spaceBelow < 270 && r.top > spaceBelow;
      const panelWidth = 264;
      setPos({
        top: openUp ? r.top - 8 : r.bottom + 8,
        left: Math.max(
          8,
          Math.min(
            r.left + r.width / 2 - panelWidth / 2,
            window.innerWidth - panelWidth - 8,
          ),
        ),
        openUp,
      });
    };
    sync();

    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || panelRef.current?.contains(t)) {
        return;
      }
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("resize", sync);
    window.addEventListener("scroll", sync, true);
    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("resize", sync);
      window.removeEventListener("scroll", sync, true);
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, year]);

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-border bg-muted/85 p-0.5 backdrop-blur-md",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => stepMonth(-1)}
        aria-label="Previous month"
        className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
      </button>

      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="font-num inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-xs font-semibold text-foreground transition-colors hover:bg-accent"
      >
        <CalendarDays className="h-3.5 w-3.5 shrink-0 text-primary" />
        <span>{label}</span>
      </button>

      <button
        type="button"
        onClick={() => stepMonth(1)}
        aria-label="Next month"
        className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </button>

      {open &&
        pos &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={panelRef}
            style={{
              position: "fixed",
              top: pos.openUp ? undefined : pos.top,
              bottom: pos.openUp ? window.innerHeight - pos.top : undefined,
              left: pos.left,
              width: 264,
            }}
            className="z-[125] rounded-2xl border border-border bg-popover/95 p-3 text-popover-foreground shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95"
          >
            <div className="mb-2.5 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setPanelYear((y) => y - 1)}
                aria-label="Previous year"
                className="grid h-7 w-7 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <span className="font-num text-sm font-bold text-foreground">
                {panelYear}
              </span>
              <button
                type="button"
                onClick={() => setPanelYear((y) => y + 1)}
                aria-label="Next year"
                className="grid h-7 w-7 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {MONTHS.map((mLabel, idx) => {
                const ym = formatYM(panelYear, idx);
                const selected = ym === value;
                const isNow = ym === currentYM;
                return (
                  <button
                    key={mLabel}
                    type="button"
                    onClick={() => {
                      onChange(ym);
                      setOpen(false);
                    }}
                    className={cn(
                      "font-num relative rounded-xl py-2 text-xs font-medium transition-colors",
                      selected
                        ? "bg-primary font-semibold text-primary-foreground shadow-sm"
                        : isNow
                          ? "border border-primary/45 bg-primary/10 text-primary hover:bg-primary/20"
                          : "bg-muted/45 text-foreground hover:bg-accent",
                    )}
                  >
                    {mLabel}
                  </button>
                );
              })}
            </div>

            <div className="mt-2.5 flex items-center justify-between border-t border-border/70 pt-2">
              <button
                type="button"
                onClick={() => {
                  onChange(currentYM);
                  setOpen(false);
                }}
                className="text-[0.72rem] font-semibold text-primary hover:underline"
              >
                Current month
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-[0.72rem] text-muted-foreground hover:text-foreground"
              >
                Close
              </button>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
