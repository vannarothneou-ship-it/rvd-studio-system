import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import { Check, ChevronDown, Search, X, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface SlidingTabOption<T extends string> {
  id: T;
  label: string;
  icon?: LucideIcon;
  badge?: number | string;
}

export function SlidingTabs<T extends string>({
  options,
  value,
  onChange,
  tone = "primary",
  size = "sm",
  layoutGroup,
  className,
}: {
  options: readonly SlidingTabOption<T>[];
  value: T;
  onChange: (next: T) => void;
  tone?: "primary" | "invert";
  size?: "xs" | "sm";
  layoutGroup?: string;
  className?: string;
}) {
  const autoId = useId();
  const lid = layoutGroup ?? `sliding-tabs-${autoId}`;
  return (
    <div
      className={cn(
        "inline-flex flex-wrap items-center gap-0.5 rounded-full border border-border bg-muted p-1",
        size === "xs" ? "text-[0.72rem]" : "text-xs",
        className,
      )}
    >
      {options.map((opt) => {
        const active = opt.id === value;
        const Icon = opt.icon;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={cn(
              "relative inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full font-medium transition-colors",
              size === "xs" ? "px-2.5 py-1" : "px-3 py-1.5",
              active
                ? tone === "invert"
                  ? "text-background"
                  : "text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {active && (
              <motion.span
                layoutId={lid}
                transition={{ type: "spring", stiffness: 460, damping: 34 }}
                className={cn(
                  "absolute inset-0 rounded-full shadow-sm",
                  tone === "invert" ? "bg-foreground" : "bg-primary",
                )}
              />
            )}
            {Icon && <Icon className="relative z-10 h-3.5 w-3.5" />}
            <span className="relative z-10">{opt.label}</span>
            {opt.badge !== undefined && (
              <span
                className={cn(
                  "relative z-10 font-mono text-[0.66rem] tabular-nums opacity-80",
                )}
              >
                {opt.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function Glass({
  className,
  children,
  delay = 0,
}: {
  className?: string;
  children: ReactNode;
  delay?: number;
}) {
  return (
    <section
      className={cn("glass rise p-5 sm:p-6", className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </section>
  );
}

export function PageHeader({
  title,
  owner,
  action,
}: {
  title: string;
  owner: string;
  action?: ReactNode;
}) {
  const month = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  return (
    <header className="rise mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">Welcome back, {owner}.</p>
        <h1 className="truncate font-display text-3xl font-bold sm:text-4xl">
          {title}
        </h1>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        <span className="hidden text-sm text-muted-foreground sm:block">
          {month}
        </span>
        {action}
      </div>
    </header>
  );
}

export function Btn({
  variant = "ghost",
  className,
  ...p
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "gold" | "ghost" | "danger";
}) {
  return (
    <button
      {...p}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all active:scale-95 disabled:opacity-50",
        variant === "gold" &&
          "bg-primary text-primary-foreground shadow-[0_8px_24px_-8px_var(--primary)] hover:brightness-110",
        variant === "ghost" &&
          "border border-border bg-secondary hover:bg-accent",
        variant === "danger" &&
          "border border-destructive/40 text-destructive hover:bg-destructive/10",
        className,
      )}
    />
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-background/60 p-0 backdrop-blur-sm animate-in fade-in sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "glass-strong max-h-[92vh] w-full overflow-y-auto rounded-t-3xl p-5 animate-in slide-in-from-bottom-8 sm:rounded-3xl sm:p-6",
          wide ? "sm:max-w-3xl" : "sm:max-w-lg",
        )}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-accent"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function SlideDrawer({
  open,
  onClose,
  title,
  subtitle,
  side = "right",
  widthClass = "max-w-md",
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string | undefined;
  side?: "right" | "left" | undefined;
  widthClass?: string | undefined;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex",
        side === "left" ? "justify-start" : "justify-end",
      )}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        type="button"
        aria-label={`Close ${title}`}
        onClick={onClose}
        className="backdrop-in fixed inset-0 bg-black/35 backdrop-blur-[2px]"
      />
      <aside
        className={cn(
          "drawer-in glass-strong relative z-10 flex h-full w-full flex-col shadow-2xl",
          widthClass,
          side === "left" ? "border-r border-border" : "border-l border-border",
        )}
      >
        <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div className="min-w-0">
            {subtitle ? <span className="label-mono">{subtitle}</span> : null}
            <h2 className="truncate font-display text-xl font-bold">{title}</h2>
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
        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
      </aside>
    </div>
  );
}

export function F({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block space-y-1.5", className)}>
      <span className="label-mono">{label}</span>
      {children}
    </label>
  );
}

export type SelOption =
  string | { value: string; label: string; icon?: LucideIcon };

export function Sel({
  value,
  onChange,
  options,
  placeholder,
  className,
  searchable,
}: {
  value: string;
  onChange: (v: string) => void;
  options: SelOption[];
  placeholder?: string;
  className?: string;
  searchable?: boolean;
}) {
  const normalized = useMemo(
    () =>
      options
        .map((o) =>
          typeof o === "string" ? { value: o, label: o, icon: undefined } : o,
        )
        .filter((o) => Boolean(o.value)),
    [options],
  );

  const shouldSearch = searchable ?? normalized.length > 7;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [rect, setRect] = useState<{
    top: number;
    left: number;
    width: number;
    openUp: boolean;
  } | null>(null);

  const selectedOpt = normalized.find((o) => o.value === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return normalized;
    return normalized.filter((o) => o.label.toLowerCase().includes(q));
  }, [normalized, query]);

  useEffect(() => {
    if (!open || !shouldSearch) return;
    const syncRect = () => {
      const el = triggerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const spaceBelow = window.innerHeight - r.bottom;
      const openUp = spaceBelow < 240 && r.top > spaceBelow;
      setRect({
        top: openUp ? r.top - 6 : r.bottom + 6,
        left: Math.max(
          8,
          Math.min(r.left, window.innerWidth - Math.max(r.width, 240) - 8),
        ),
        width: Math.max(r.width, 230),
        openUp,
      });
    };
    syncRect();
    const id = requestAnimationFrame(() => searchRef.current?.focus());
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        panelRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("resize", syncRect);
    window.addEventListener("scroll", syncRect, true);
    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("resize", syncRect);
      window.removeEventListener("scroll", syncRect, true);
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, shouldSearch]);

  if (shouldSearch) {
    const SelectedIcon = selectedOpt?.icon;
    return (
      <>
        <button
          ref={triggerRef}
          type="button"
          onClick={() => {
            setQuery("");
            setOpen((o) => !o);
          }}
          aria-expanded={open}
          className={cn(
            "field flex h-auto min-h-10 w-full min-w-0 cursor-pointer items-center justify-between gap-2 text-left text-foreground",
            className,
          )}
        >
          <span className="flex min-w-0 items-center gap-2">
            {SelectedIcon && (
              <SelectedIcon className="h-3.5 w-3.5 shrink-0 text-primary" />
            )}
            <span
              className={cn(
                "truncate",
                !selectedOpt && "text-muted-foreground",
              )}
            >
              {selectedOpt?.label ?? placeholder ?? "Choose…"}
            </span>
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 opacity-60 transition-transform",
              open && "rotate-180",
            )}
          />
        </button>

        {open &&
          rect &&
          typeof document !== "undefined" &&
          createPortal(
            <div
              ref={panelRef}
              style={{
                position: "fixed",
                top: rect.openUp ? undefined : rect.top,
                bottom: rect.openUp ? window.innerHeight - rect.top : undefined,
                left: rect.left,
                width: Math.min(rect.width, window.innerWidth - 16),
              }}
              className="z-[120] overflow-hidden rounded-2xl border border-border bg-popover text-popover-foreground shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95"
            >
              <div className="border-b border-border/70 p-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    ref={searchRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Type to search…"
                    className="field h-8 pl-8 pr-7 text-xs"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label="Clear filter"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
              <div className="max-h-60 overflow-y-auto p-1.5">
                {(placeholder !== undefined || !value) && !query && (
                  <button
                    type="button"
                    onClick={() => {
                      onChange("");
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-xl px-2.5 py-2 text-left text-xs transition-colors",
                      !value
                        ? "bg-primary/15 font-medium text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                    )}
                  >
                    <span>{placeholder ?? "Choose…"}</span>
                    {!value && <Check className="h-3.5 w-3.5 shrink-0" />}
                  </button>
                )}
                {filtered.length === 0 ? (
                  <p className="py-4 text-center text-xs text-muted-foreground">
                    No matching options
                  </p>
                ) : (
                  filtered.map((opt) => {
                    const active = opt.value === value;
                    const OptIcon = opt.icon;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          onChange(opt.value);
                          setOpen(false);
                        }}
                        className={cn(
                          "flex w-full items-center justify-between gap-2 rounded-xl px-2.5 py-2 text-left text-xs transition-colors",
                          active
                            ? "bg-primary text-primary-foreground font-medium"
                            : "text-popover-foreground hover:bg-accent",
                        )}
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          {OptIcon && (
                            <OptIcon
                              className={cn(
                                "h-3.5 w-3.5 shrink-0",
                                active
                                  ? "text-primary-foreground"
                                  : "text-primary",
                              )}
                            />
                          )}
                          <span className="break-words leading-snug">
                            {opt.label}
                          </span>
                        </span>
                        {active && <Check className="h-3.5 w-3.5 shrink-0" />}
                      </button>
                    );
                  })
                )}
              </div>
            </div>,
            document.body,
          )}
      </>
    );
  }

  return (
    <Select
      value={value || "__none__"}
      onValueChange={(v) => onChange(v === "__none__" ? "" : v)}
    >
      <SelectTrigger
        className={cn(
          "field h-auto min-h-10 w-full min-w-0 justify-between gap-2 text-left text-foreground",
          className,
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent
        position="popper"
        className="z-[100] max-h-72 max-w-[calc(100vw-1.5rem)] min-w-[max(var(--radix-select-trigger-width),12rem)] border border-border bg-popover text-popover-foreground shadow-2xl"
      >
        {(placeholder !== undefined || !value) && (
          <SelectItem
            value="__none__"
            className="min-h-10 cursor-pointer whitespace-normal py-2 leading-snug text-popover-foreground focus:bg-primary focus:text-primary-foreground data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground"
          >
            {placeholder ?? "Choose…"}
          </SelectItem>
        )}
        {normalized.map((o) => {
          const OptIcon = o.icon;
          return (
            <SelectItem
              key={o.value}
              value={o.value}
              className="min-h-10 cursor-pointer whitespace-normal py-2 leading-snug text-popover-foreground focus:bg-primary focus:text-primary-foreground data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground"
            >
              <span className="inline-flex items-center gap-2">
                {OptIcon && <OptIcon className="h-3.5 w-3.5 shrink-0" />}
                <span>{o.label}</span>
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}

const tone: Record<string, string> = {
  Paid: "bg-positive/15 text-positive",
  Partial: "bg-primary/15 text-primary",
  Sent: "bg-secondary text-foreground",
  Draft: "bg-muted text-muted-foreground",
  Overdue: "bg-destructive/15 text-destructive",
  Active: "bg-positive/15 text-positive",
  Lead: "bg-primary/15 text-primary",
  Quoted: "bg-primary/15 text-primary",
  Delivered: "bg-positive/15 text-positive",
  Closed: "bg-positive/20 text-positive",
  "In production": "bg-primary/15 text-primary",
  Accepted: "bg-positive/15 text-positive",
  Signed: "bg-positive/15 text-positive",
  Received: "bg-positive/15 text-positive",
  Declined: "bg-destructive/15 text-destructive",
  Expired: "bg-destructive/15 text-destructive",
  Lost: "bg-destructive/15 text-destructive",
};
export function Pill({ s }: { s: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 rounded-full px-2.5 py-0.5 font-mono text-[0.68rem] uppercase tracking-wider",
        tone[s] ?? "bg-secondary text-muted-foreground",
      )}
    >
      {s}
    </span>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <p className="py-10 text-center text-sm text-muted-foreground">
      {children}
    </p>
  );
}

export function Stat({
  label,
  value,
  fullValue,
  tone: t,
}: {
  label: string;
  value: string;
  fullValue?: string | undefined;
  tone?: "pos" | "neg" | undefined;
}) {
  return (
    <div className="min-w-0" title={fullValue ?? value}>
      <p className="label-mono truncate">{label}</p>
      <p
        className={cn(
          "font-num text-lg font-bold leading-tight sm:text-xl",
          t === "pos" && "text-positive",
          t === "neg" && "text-destructive",
        )}
      >
        {value}
      </p>
    </div>
  );
}
