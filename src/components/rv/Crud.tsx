import { useEffect, useState, type ReactNode } from "react";
import { Btn, F, Modal, Sel } from "@/components/rv/ui";
import { fileToDataUrl } from "@/lib/store";

export type Field<T> = {
  k: keyof T & string;
  label: string;
  type?: "text" | "number" | "date" | "textarea" | "select" | "image";
  options?: (string | { value: string; label: string })[];
  wide?: boolean;
};

export function EditModal<T extends { id: string }>({
  item,
  fields,
  title,
  onSave,
  onDelete,
  onClose,
  onFieldChange,
  footerExtra,
}: {
  item: T | null;
  fields: Field<T>[] | ((v: T) => Field<T>[]);
  title: string;
  onSave: (v: T) => void;
  onDelete?: ((v: T) => void) | undefined;
  onClose: () => void;
  onFieldChange?: (next: T, key: string) => T;
  footerExtra?: (v: T) => ReactNode;
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

  return (
    <Modal open title={title} onClose={onClose}>
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
                f.wide || f.type === "textarea"
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
                          alert("Please choose a valid image.");
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
              ) : f.type === "select" ? (
                <Sel
                  value={String(val ?? "")}
                  onChange={(x) => set(f.k, x)}
                  options={f.options ?? []}
                  placeholder="—"
                />
              ) : f.type === "textarea" ? (
                <textarea
                  className="field min-h-20"
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
          <div className="col-span-2">{footerExtra(v)}</div>
        ) : null}
        <div className="col-span-2 mt-2 flex justify-between gap-2">
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
