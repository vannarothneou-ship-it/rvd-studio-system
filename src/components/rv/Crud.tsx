import { useEffect, useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { Btn, F, Modal, Sel, SlideDrawer } from "@/components/rv/ui";
import { fileToDataUrl } from "@/lib/store";
import { cn } from "@/lib/utils";

export type FieldOption =
  string | { value: string; label: string; icon?: LucideIcon; dot?: string };

export type Field<T> = {
  k: keyof T & string;
  label: string;
  type?: "text" | "number" | "date" | "textarea" | "select" | "chips" | "image";
  options?: FieldOption[];
  allowCustom?: boolean;
  customPlaceholder?: string;
  wide?: boolean;
};

export function EditModal<T extends { id: string }>({
  item,
  fields,
  title,
  subtitle,
  presentation = "modal",
  side = "right",
  onSave,
  onDelete,
  onClose,
  onFieldChange,
  footerExtra,
}: {
  item: T | null;
  fields: Field<T>[] | ((v: T) => Field<T>[]);
  title: string;
  subtitle?: string | undefined;
  presentation?: "modal" | "drawer" | undefined;
  side?: "right" | "left" | undefined;
  onSave: (v: T) => void;
  onDelete?: ((v: T) => void) | undefined;
  onClose: () => void;
  onFieldChange?: (next: T, key: string) => T;
  footerExtra?: (v: T, patch: (p: Partial<T>) => void) => ReactNode;
}) {
  const [v, setV] = useState<T | null>(item);
  useEffect(() => {
    setV(item);
  }, [item]);

  if (!item || !v) return null;
  const resolvedFields = typeof fields === "function" ? fields(v) : fields;
  const set = (k: string, x: unknown) => {
    const rawNext = { ...v, [k]: x } as T;
    setV(onFieldChange ? onFieldChange(rawNext, k) : rawNext);
  };

  const formContent = (
    <form
      className="grid grid-cols-2 gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(v);
        onClose();
      }}
    >
      {resolvedFields.map((f) => {
        const val = (v as Record<string, unknown>)[f.k];
        return (
          <F
            key={f.k}
            label={f.label}
            className={
              f.wide || f.type === "textarea" || f.type === "chips"
                ? "col-span-2"
                : "col-span-2 sm:col-span-1"
            }
          >
            {f.type === "image" ? (
              <div className="flex flex-wrap items-center gap-3">
                {val ? (
                  <img
                    src={String(val)}
                    alt={f.label}
                    className="h-20 w-20 rounded-lg object-cover"
                  />
                ) : null}
                <input
                  type="file"
                  accept="image/*"
                  className="min-w-0 max-w-full text-xs"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      try {
                        set(f.k, await fileToDataUrl(file, 400));
                      } catch {
                        toast.error("Please choose a valid image.");
                      }
                    }
                  }}
                />
                {val ? (
                  <Btn
                    type="button"
                    variant="danger"
                    onClick={() => set(f.k, "")}
                  >
                    Remove image
                  </Btn>
                ) : null}
              </div>
            ) : f.type === "chips" ? (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-1.5 sm:flex sm:flex-wrap">
                  {(f.options ?? []).map((opt) => {
                    const o =
                      typeof opt === "string"
                        ? { value: opt, label: opt }
                        : opt;
                    const active = String(val ?? "") === o.value;
                    const Icon = o.icon;
                    return (
                      <button
                        key={o.value}
                        type="button"
                        onClick={() => set(f.k, o.value)}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-2 text-left text-xs font-medium transition-all",
                          active
                            ? "border-primary bg-primary text-primary-foreground shadow-sm"
                            : "border-border bg-muted/45 text-muted-foreground hover:border-primary/45 hover:text-foreground",
                        )}
                      >
                        {o.dot && (
                          <span
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{
                              backgroundColor: active ? "currentColor" : o.dot,
                            }}
                          />
                        )}
                        {Icon && (
                          <Icon
                            className={cn(
                              "h-3.5 w-3.5 shrink-0",
                              active
                                ? "text-primary-foreground"
                                : "text-primary",
                            )}
                          />
                        )}
                        <span className="truncate">{o.label}</span>
                      </button>
                    );
                  })}
                </div>
                {f.allowCustom && (
                  <input
                    className="field h-8 text-xs"
                    placeholder={f.customPlaceholder ?? "Or type custom…"}
                    value={String(val ?? "")}
                    onChange={(e) => set(f.k, e.target.value)}
                  />
                )}
              </div>
            ) : f.type === "select" ? (
              <Sel
                value={String(val ?? "")}
                onChange={(x) => set(f.k, x)}
                options={f.options ?? []}
                placeholder="—"
              />
            ) : f.type === "textarea" ? (
              <textarea
                className="field min-h-24"
                value={String(val ?? "")}
                onChange={(e) => set(f.k, e.target.value)}
              />
            ) : (
              <input
                className="field"
                type={f.type ?? "text"}
                step="any"
                value={String(val ?? "")}
                onChange={(e) =>
                  set(
                    f.k,
                    f.type === "number"
                      ? Number(e.target.value)
                      : e.target.value,
                  )
                }
              />
            )}
          </F>
        );
      })}
      {footerExtra ? (
        <div className="col-span-2">
          {footerExtra(v, (patch) =>
            setV((cur) => (cur ? { ...cur, ...patch } : cur)),
          )}
        </div>
      ) : null}
      <div className="col-span-2 mt-2 flex justify-between gap-2 border-t border-border/70 pt-3">
        {onDelete ? (
          <Btn
            type="button"
            variant="danger"
            onClick={() => {
              if (confirm("Delete this?")) {
                onDelete(v);
                onClose();
              }
            }}
          >
            Delete
          </Btn>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <Btn type="button" onClick={onClose}>
            Cancel
          </Btn>
          <Btn type="submit" variant="gold">
            Save
          </Btn>
        </div>
      </div>
    </form>
  );

  if (presentation === "drawer") {
    return (
      <SlideDrawer
        open
        title={title}
        subtitle={subtitle}
        side={side}
        onClose={onClose}
      >
        {formContent}
      </SlideDrawer>
    );
  }

  return (
    <Modal open title={title} onClose={onClose}>
      {formContent}
    </Modal>
  );
}

export function upsert<T extends { id: string }>(list: T[], v: T) {
  return list.some((x) => x.id === v.id)
    ? list.map((x) => (x.id === v.id ? v : x))
    : [...list, v];
}
export function nextCode(prefix: string, codes: string[], start = 1, pad = 2) {
  const n = codes
    .map((c) => Number(c.replace(prefix, "")))
    .filter((x) => !isNaN(x));
  return prefix + String(Math.max(start - 1, ...n) + 1).padStart(pad, "0");
}
