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
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Search,
  X,
  type LucideIcon,
} from "lucide-react";
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

/**
 * Mini popup label for icon-only controls.
 * Mouse: shows on hover. Touch: shows while you press and hold (≈350 ms),
 * then fades after a moment. Rendered in <body> so scroll containers can't clip it.
 */
export function useHoldTip(label: string) {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    return () => window.clearTimeout(timer.current);
  }, []);

  const hide = () => {
    window.clearTimeout(timer.current);
    setRect(null);
  };
  const handlers = {
    onPointerEnter: (e: React.PointerEvent<HTMLElement>) => {
      if (e.pointerType === "mouse") {
        setRect(e.currentTarget.getBoundingClientRect());
      }
    },
    onPointerLeave: hide,
    onPointerDown: (e: React.PointerEvent<HTMLElement>) => {
      if (e.pointerType === "mouse") return;
      const el = e.currentTarget;
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
        setRect(el.getBoundingClientRect());
        timer.current = window.setTimeout(() => setRect(null), 1600);
      }, 350);
    },
    onPointerUp: () => window.clearTimeout(timer.current),
    onPointerCancel: hide,
  };

  const openBelow = rect ? rect.top < 48 : false;
  const bubble =
    rect && typeof document !== "undefined"
      ? createPortal(
          <span
            role="tooltip"
            style={{
              position: "fixed",
              left: Math.min(
                window.innerWidth - 56,
                Math.max(56, rect.left + rect.width / 2),
              ),
              top: openBelow ? rect.bottom + 8 : rect.top - 8,
              transform: openBelow
                ? "translate(-50%, 0)"
                : "translate(-50%, -100%)",
            }}
            className="pointer-events-none z-[200] animate-in fade-in zoom-in-95 whitespace-nowrap rounded-full border border-[var(--glass-border)] bg-popover px-2.5 py-1 text-[0.7rem] font-medium text-popover-foreground shadow-lg backdrop-blur-xl duration-150"
          >
            {label}
          </span>,
          document.body,
        )
      : null;
  return { handlers, bubble };
}

function SlidingTabButton({
  label,
  showTip,
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  showTip: boolean;
}) {
  const { handlers, bubble } = useHoldTip(label);
  return (
    <button {...rest} {...(showTip ? handlers : {})}>
      {children}
      {showTip ? bubble : null}
    </button>
  );
}

export function SlidingTabs<T extends string>({
  options,
  value,
  onChange,
  tone = "primary",
  size = "sm",
  layoutGroup,
  stretch = false,
  iconOnly = false,
  className,
}: {
  options: readonly SlidingTabOption<T>[];
  value: T;
  onChange: (next: T) => void;
  tone?: "primary" | "invert";
  size?: "xs" | "sm";
  layoutGroup?: string;
  stretch?: boolean;
  iconOnly?: boolean;
  className?: string;
}) {
  const autoGroup = useId();
  const groupId = layoutGroup ?? autoGroup;
  return (
    <div
      className={cn(
        "no-scrollbar max-w-full flex-nowrap items-center gap-0.5 overflow-x-auto rounded-lg border border-border bg-muted p-0.5",
        stretch ? "flex w-full" : "inline-flex",
        size === "xs" ? "text-[0.72rem]" : "text-xs",
        className,
      )}
    >
      {options.map((opt) => {
        const active = opt.id === value;
        const Icon = opt.icon;
        const hideLabel = iconOnly && Boolean(Icon);
        return (
          <SlidingTabButton
            key={opt.id}
            type="button"
            label={opt.label}
            showTip={hideLabel}
            onClick={() => onChange(opt.id)}
            aria-label={opt.label}
            title={hideLabel ? undefined : opt.label}
            className={cn(
              "relative inline-flex min-h-[36px] shrink-0 items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors duration-150 active:scale-[0.97] sm:min-h-0",
              stretch && "flex-1",
              hideLabel
                ? size === "xs"
                  ? "px-2.5 py-1.5"
                  : "px-3 py-1.5"
                : size === "xs"
                  ? "px-2.5 py-1"
                  : "px-3 py-1.5",
              active
                ? tone === "invert"
                  ? "text-background"
                  : "text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {active && (
              <motion.span
                layoutId={`rv-tab-pill-${groupId}`}
                transition={{ type: "spring", stiffness: 500, damping: 36 }}
                aria-hidden="true"
                className={cn(
                  "absolute inset-0 rounded-md",
                  tone === "invert" ? "bg-foreground" : "bg-primary",
                )}
              />
            )}
            <span className="relative z-10 inline-flex items-center gap-1.5">
              {Icon && (
                <Icon
                  className={cn(
                    "shrink-0",
                    hideLabel ? "h-4 w-4" : "h-3.5 w-3.5",
                  )}
                />
              )}
              {hideLabel ? (
                <span className="sr-only">{opt.label}</span>
              ) : (
                <span className="whitespace-nowrap">{opt.label}</span>
              )}
              {opt.badge !== undefined && (
                <span className="font-num text-[0.68rem] opacity-80">
                  {opt.badge}
                </span>
              )}
            </span>
          </SlidingTabButton>
        );
      })}
    </div>
  );
}

export function Glass({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
  delay?: number;
}) {
  return (
    <section
      className={cn(
        "glass rise p-4 transition-[border-color,background-color] duration-200 sm:p-5",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function PageHeader({
  title,
  action,
}: {
  title: string;
  owner?: string;
  action?: ReactNode;
}) {
  return (
    <header
      className={cn(
        "rise mb-3 flex-col gap-2.5 sm:mb-4 sm:flex sm:flex-row sm:items-center sm:justify-between sm:gap-4",
        action ? "flex" : "hidden sm:flex",
      )}
    >
      <div className="min-w-0">
        <h1 className="truncate font-display text-2xl font-bold tracking-[-0.03em] text-foreground sm:text-3xl">
          {title}
        </h1>
      </div>
      {action && (
        <div className="flex w-full shrink-0 flex-wrap items-center justify-end gap-2 sm:w-auto">
          {action}
        </div>
      )}
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
        "ios-tap inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-[transform,background-color,border-color,color,opacity] duration-150 disabled:opacity-50 sm:min-h-[38px]",
        variant === "gold" &&
          "bg-primary text-primary-foreground shadow-xs hover:bg-[var(--primary-hover,var(--primary))]",
        variant === "ghost" &&
          "border border-border bg-secondary text-secondary-foreground hover:bg-accent",
        variant === "danger" &&
          "border border-destructive/40 text-destructive hover:bg-destructive/10",
        className,
      )}
    />
  );
}

let portalLockCount = 0;
let savedBodyOverflow = "";

/**
 * Renders children into <body> so `position: fixed` overlays always cover the
 * whole viewport (an ancestor with backdrop-filter/transform otherwise traps
 * them inside its own box), and locks page scroll while mounted.
 */
export function Portal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    if (!mounted) return;
    const body = document.body;
    if (portalLockCount === 0) {
      savedBodyOverflow = body.style.overflow;
      body.style.overflow = "hidden";
    }
    portalLockCount += 1;
    return () => {
      portalLockCount = Math.max(0, portalLockCount - 1);
      if (portalLockCount === 0) {
        body.style.overflow = savedBodyOverflow;
      }
    };
  }, [mounted]);
  return mounted ? createPortal(children, document.body) : null;
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
  const overlay = (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/65 p-0 backdrop-blur-sm animate-in fade-in sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "max-h-[92dvh] w-full overflow-y-auto rounded-t-2xl border border-[var(--glass-border)] bg-popover p-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl backdrop-blur-2xl backdrop-saturate-150 animate-in slide-in-from-bottom-8 sm:rounded-xl sm:p-6",
          wide ? "sm:max-w-3xl" : "sm:max-w-lg",
        )}
      >
        <div className="mb-4 flex items-center justify-between gap-2 border-b border-border pb-3">
          <h2 className="font-display text-lg font-bold tracking-tight sm:text-xl">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
  return <Portal>{overlay}</Portal>;
}

export function SlideDrawer({
  open,
  onClose,
  title,
  subtitle,
  headerAction,
  side = "right",
  widthClass = "max-w-md",
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string | undefined;
  headerAction?: ReactNode;
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
  const overlay = (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-end sm:items-stretch",
        side === "left" ? "sm:justify-start" : "sm:justify-end",
      )}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        type="button"
        aria-label={`Close ${title}`}
        onClick={onClose}
        className="backdrop-in fixed inset-0 bg-black/65 backdrop-blur-[2px]"
      />
      <aside
        className={cn(
          "drawer-in relative z-10 mt-[env(safe-area-inset-top)] flex h-[calc(100dvh-env(safe-area-inset-top)-0.75rem)] w-full flex-col rounded-t-2xl border-t border-[var(--glass-border)] bg-popover shadow-2xl backdrop-blur-2xl backdrop-saturate-150 sm:mt-0 sm:h-full sm:max-h-none sm:rounded-none sm:border-t-0 sm:pt-[env(safe-area-inset-top)]",
          widthClass,
          side === "left"
            ? "sm:border-r sm:border-[var(--glass-border)]"
            : "sm:border-l sm:border-[var(--glass-border)]",
        )}
      >
        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-border sm:hidden" />
        <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3 sm:px-5 sm:py-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              aria-label="Back"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border bg-secondary text-foreground transition-transform active:scale-95 sm:hidden"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="min-w-0">
              {subtitle ? (
                <span className="label-mono block truncate">{subtitle}</span>
              ) : null}
              <h2 className="truncate font-display text-lg font-bold tracking-tight sm:text-xl">
                {title}
              </h2>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {headerAction}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="hidden h-9 w-9 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:grid"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:px-5 sm:py-5">
          {children}
        </div>
      </aside>
    </div>
  );
  return <Portal>{overlay}</Portal>;
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
    <label className={cn("block min-w-0 space-y-1.5", className)}>
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
              className="z-[120] overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-2xl animate-in fade-in zoom-in-95"
            >
              <div className="border-b border-border/70 p-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    ref={searchRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Type to search…"
                    className="field h-9 pl-8 pr-7 text-base sm:h-8 sm:text-xs"
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
                      "flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition-colors",
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
                          "flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition-colors",
                          active
                            ? "bg-primary font-medium text-primary-foreground"
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
  Paid: "border-positive/30 bg-positive/15 text-positive",
  Partial: "border-primary/35 bg-primary/15 text-primary",
  Sent: "border-border bg-secondary text-foreground",
  Draft: "border-border bg-muted text-muted-foreground",
  Overdue: "border-destructive/35 bg-destructive/15 text-destructive",
  Active: "border-positive/30 bg-positive/15 text-positive",
  Lead: "border-primary/35 bg-primary/15 text-primary",
  Quoted: "border-primary/35 bg-primary/15 text-primary",
  Delivered: "border-positive/30 bg-positive/15 text-positive",
  Closed: "border-positive/30 bg-positive/18 text-positive",
  "In production": "border-primary/35 bg-primary/15 text-primary",
  "On hold": "border-warning/35 bg-warning/15 text-warning",
  Accepted: "border-positive/30 bg-positive/15 text-positive",
  Signed: "border-positive/30 bg-positive/15 text-positive",
  Received: "border-positive/30 bg-positive/15 text-positive",
  Declined: "border-destructive/35 bg-destructive/15 text-destructive",
  Expired: "border-destructive/35 bg-destructive/15 text-destructive",
  Lost: "border-destructive/35 bg-destructive/15 text-destructive",
  Healthy: "border-positive/30 bg-positive/15 text-positive",
  "At risk": "border-warning/35 bg-warning/15 text-warning",
  Delayed: "border-destructive/35 bg-destructive/15 text-destructive",
  Request: "border-border bg-muted text-muted-foreground",
  Design: "border-primary/35 bg-primary/15 text-primary",
  Review: "border-warning/35 bg-warning/15 text-warning",
  Approved: "border-positive/30 bg-positive/15 text-positive",
  Production: "border-primary/40 bg-primary/20 text-primary",
  Current: "border-primary/35 bg-primary/15 text-primary",
  "In review": "border-warning/35 bg-warning/15 text-warning",
  Completed: "border-positive/30 bg-positive/15 text-positive",
  Backlog: "border-border bg-muted text-muted-foreground",
};
export function Pill({ s }: { s: string }) {
  return (
    <span
      className={cn(
        "font-num inline-flex shrink-0 items-center whitespace-nowrap rounded-md border px-2 py-0.5 text-[0.68rem] font-semibold tracking-wide",
        tone[s] ?? "border-border bg-secondary text-muted-foreground",
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
  icon: Icon,
}: {
  label: string;
  value: string;
  fullValue?: string | undefined;
  tone?: "pos" | "neg" | undefined;
  icon?: LucideIcon | undefined;
}) {
  return (
    <div
      className="flex min-w-0 flex-col justify-between gap-0.5"
      title={fullValue ?? value}
    >
      <p className="label-mono flex items-center gap-1 truncate">
        {Icon && <Icon className="h-3 w-3 shrink-0 text-primary/80" />}
        <span className="truncate">{label}</span>
      </p>
      <p
        className={cn(
          "font-num truncate text-base font-bold leading-tight sm:text-lg",
          t === "pos" && "text-positive",
          t === "neg" && "text-destructive",
        )}
      >
        {value}
      </p>
    </div>
  );
}
