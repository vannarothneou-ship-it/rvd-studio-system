import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

export function Sel({
  value,
  onChange,
  options,
  placeholder,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  options: (string | { value: string; label: string })[];
  placeholder?: string;
  className?: string;
}) {
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
            className="min-h-11 cursor-pointer whitespace-normal py-2.5 leading-snug text-popover-foreground focus:bg-primary focus:text-primary-foreground data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground"
          >
            {placeholder ?? "Choose…"}
          </SelectItem>
        )}
        {options.map((o) => {
          const v = typeof o === "string" ? o : o.value;
          return v ? (
            <SelectItem
              key={v}
              value={v}
              className="min-h-11 cursor-pointer whitespace-normal py-2.5 leading-snug text-popover-foreground focus:bg-primary focus:text-primary-foreground data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground"
            >
              {typeof o === "string" ? o : o.label}
            </SelectItem>
          ) : null;
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
  tone: t,
}: {
  label: string;
  value: string;
  tone?: "pos" | "neg" | undefined;
}) {
  return (
    <div className="min-w-0">
      <p className="label-mono">{label}</p>
      <p
        className={cn(
          "truncate font-display text-xl font-bold sm:text-2xl",
          t === "pos" && "text-positive",
          t === "neg" && "text-destructive",
        )}
      >
        {value}
      </p>
    </div>
  );
}
