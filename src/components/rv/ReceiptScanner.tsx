import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Camera,
  CheckCircle2,
  ClipboardPaste,
  ImagePlus,
  Loader2,
  Pencil,
  RotateCcw,
  ScanLine,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Btn, F, Sel, SlideDrawer, SlidingTabs } from "@/components/rv/ui";
import {
  categoryIcon,
  incomeSourceIcon,
  paymentCardIcon,
} from "@/components/rv/FinanceVisuals";
import {
  CARD_METHODS,
  EXPENSE_CATEGORIES,
  PERSONAL_CATEGORIES,
  PERSONAL_INCOME_METHODS,
  PERSONAL_INCOME_SOURCES,
  money,
  setDB,
  shortDate,
  today,
  uid,
  type Account,
  type Currency,
  type Expense,
  type PersonalIncome,
} from "@/lib/store";
import type { ScannedReceiptResult } from "@/lib/receipt-scanner";
import { cn } from "@/lib/utils";

interface ScannerContextValue {
  openScanner: (defaultAccount?: Account) => void;
}

const ScannerContext = createContext<ScannerContextValue>({
  openScanner: () => {},
});

export function useReceiptScanner() {
  return useContext(ScannerContext);
}

interface RecordedRecord {
  id: string;
  txType: "expense" | "income";
  account: Account;
  amount: number;
  currency: Currency;
  date: string;
  merchantOrPayer: string;
  description: string;
  method: string;
  category: string;
  reference: string;
  confidence: "high" | "medium" | "low";
  notes: string;
  receiptThumb: string;
  saved: boolean;
}

async function prepareReceiptImages(file: File): Promise<{
  scanBase64: string;
  scanMimeType: string;
  thumbDataUrl: string;
  previewDataUrl: string;
}> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Could not decode image."));
      el.src = objectUrl;
    });

    const scale = Math.min(1, 1400 / Math.max(img.width, img.height, 1));
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas image processing unavailable.");
    ctx.drawImage(img, 0, 0, w, h);

    const previewDataUrl = canvas.toDataURL("image/jpeg", 0.85);
    const scanBase64 = previewDataUrl.replace(/^data:[^;]+;base64,/i, "");

    const thumbScale = Math.min(1, 380 / Math.max(img.width, img.height, 1));
    const tw = Math.max(1, Math.round(img.width * thumbScale));
    const th = Math.max(1, Math.round(img.height * thumbScale));
    const tCanvas = document.createElement("canvas");
    tCanvas.width = tw;
    tCanvas.height = th;
    const tCtx = tCanvas.getContext("2d");
    tCtx?.drawImage(img, 0, 0, tw, th);
    const thumbDataUrl = tCtx
      ? tCanvas.toDataURL("image/jpeg", 0.72)
      : previewDataUrl;

    return {
      scanBase64,
      scanMimeType: "image/jpeg",
      thumbDataUrl,
      previewDataUrl,
    };
  } catch {
    // Fallback for formats the browser canvas cannot directly render (e.g. raw HEIC on non-Safari)
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ""));
      reader.onerror = () => reject(new Error("Could not read receipt file."));
      reader.readAsDataURL(file);
    });
    const scanBase64 = dataUrl.replace(/^data:[^;]+;base64,/i, "");
    const mimeMatch = dataUrl.match(/^data:([^;]+);base64,/i);
    return {
      scanBase64,
      scanMimeType: mimeMatch?.[1] || file.type || "image/jpeg",
      thumbDataUrl: dataUrl.length < 300_000 ? dataUrl : "",
      previewDataUrl: dataUrl,
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function buildDescription(rec: RecordedRecord): string {
  const base = rec.description.trim() || rec.merchantOrPayer.trim();
  return rec.reference
    ? `${base} (${rec.reference})`
    : base || "Scanned transaction";
}

function persistRecordToStore(rec: RecordedRecord, previousId?: string) {
  setDB((d) => {
    const cleanExpenses = previousId
      ? d.expenses.filter((e) => e.id !== previousId)
      : d.expenses;
    const cleanIncome = previousId
      ? (d.personalIncome ?? []).filter((i) => i.id !== previousId)
      : (d.personalIncome ?? []);

    if (rec.txType === "income") {
      const inc: PersonalIncome = {
        id: rec.id,
        date: rec.date || today(),
        source: PERSONAL_INCOME_SOURCES.includes(
          rec.category as (typeof PERSONAL_INCOME_SOURCES)[number],
        )
          ? rec.category
          : "Other",
        accountMethod: rec.method || "Debit",
        description: buildDescription(rec),
        amount: Math.max(0, Number(rec.amount) || 0),
        currency: rec.currency,
      };
      return {
        ...d,
        expenses: cleanExpenses,
        personalIncome: [...cleanIncome, inc],
      };
    }

    const exp: Expense = {
      id: rec.id,
      date: rec.date || today(),
      projectId: "",
      category: rec.category || "Other",
      vendor:
        rec.account === "Personal"
          ? rec.method || "Debit"
          : rec.merchantOrPayer || rec.method || "Vendor",
      description:
        rec.account === "Personal"
          ? rec.merchantOrPayer &&
            !rec.description
              .toLowerCase()
              .includes(rec.merchantOrPayer.toLowerCase())
            ? `${rec.merchantOrPayer} — ${rec.description}`
            : buildDescription(rec)
          : buildDescription(rec),
      amount: Math.max(0, Number(rec.amount) || 0),
      currency: rec.currency,
      receipt: rec.receiptThumb,
      account: rec.account,
    };

    return {
      ...d,
      personalIncome: cleanIncome,
      expenses: [...cleanExpenses, exp],
    };
  });
}

function deleteRecordFromStore(id: string) {
  setDB((d) => ({
    ...d,
    expenses: d.expenses.filter((e) => e.id !== id),
    personalIncome: (d.personalIncome ?? []).filter((i) => i.id !== id),
  }));
}

export function ReceiptScannerProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [defaultAccount, setDefaultAccount] = useState<Account>("Personal");

  const openScanner = useCallback((account: Account = "Personal") => {
    setDefaultAccount(account);
    setOpen(true);
  }, []);

  const value = useMemo(() => ({ openScanner }), [openScanner]);

  return (
    <ScannerContext.Provider value={value}>
      {children}
      <ReceiptScannerDrawer
        open={open}
        defaultAccount={defaultAccount}
        onClose={() => setOpen(false)}
      />
    </ScannerContext.Provider>
  );
}

export function ReceiptScannerDrawer({
  open,
  defaultAccount = "Personal",
  onClose,
}: {
  open: boolean;
  defaultAccount?: Account;
  onClose: () => void;
}) {
  const [autoRecord, setAutoRecord] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [record, setRecord] = useState<RecordedRecord | null>(null);
  const [editing, setEditing] = useState(false);
  const [lastFile, setLastFile] = useState<File | null>(null);

  const cameraRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);

  const resetScan = useCallback(() => {
    setScanning(false);
    setErrorMsg(null);
    setPreviewUrl("");
    setRecord(null);
    setEditing(false);
    setLastFile(null);
  }, []);

  const handleClose = () => {
    resetScan();
    onClose();
  };

  const scanFile = useCallback(
    async (file: File) => {
      if (
        !file.type.startsWith("image/") &&
        !/\.(heic|heif|png|jpe?g|webp)$/i.test(file.name)
      ) {
        setErrorMsg(
          "Please choose a photo or screenshot image (PNG, JPG, WebP, or HEIC).",
        );
        return;
      }

      setLastFile(file);
      setScanning(true);
      setErrorMsg(null);
      setRecord(null);
      setEditing(false);

      try {
        const prepared = await prepareReceiptImages(file);
        setPreviewUrl(prepared.previewDataUrl);

        const res = await fetch("/api/scan-receipt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageBase64: prepared.scanBase64,
            mimeType: prepared.scanMimeType,
            defaultAccount: "Personal",
            fallbackDate: today(),
          }),
        });

        const payload = (await res.json().catch(() => ({}))) as {
          ok?: boolean;
          result?: ScannedReceiptResult;
          error?: string;
        };

        if (!res.ok || !payload.result) {
          throw new Error(
            payload.error || `Scanner failed (HTTP ${res.status}).`,
          );
        }

        const r = payload.result;
        const nextRecord: RecordedRecord = {
          id: uid(),
          txType: r.txType,
          account: "Personal",
          amount: r.amount,
          currency: r.currency,
          date: r.date || today(),
          merchantOrPayer: r.merchantOrPayer,
          description: r.description,
          method: r.method,
          category: r.category,
          reference: r.reference,
          confidence: r.confidence,
          notes: r.notes,
          receiptThumb: prepared.thumbDataUrl,
          saved: false,
        };

        if (autoRecord && nextRecord.amount > 0) {
          nextRecord.saved = true;
          persistRecordToStore(nextRecord);
          toast.success(
            `Recorded ${money(
              nextRecord.txType === "income"
                ? nextRecord.amount
                : -nextRecord.amount,
              nextRecord.currency,
              true,
            )} (${nextRecord.method})`,
          );
        } else {
          setEditing(true);
        }

        setRecord(nextRecord);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Could not read receipt image.";
        setErrorMsg(msg);
      } finally {
        setScanning(false);
      }
    },
    [autoRecord],
  );

  // Allow Ctrl/Cmd+V image paste while drawer is open
  useEffect(() => {
    if (!open) return;
    const onPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          const blob = item.getAsFile();
          if (blob) {
            e.preventDefault();
            void scanFile(blob);
            break;
          }
        }
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [open, scanFile]);

  const updateRecord = (patch: Partial<RecordedRecord>) => {
    setRecord((prev) => {
      if (!prev) return prev;
      const next: RecordedRecord = { ...prev, ...patch };
      if (next.txType === "income") {
        next.account = "Personal";
        if (
          !PERSONAL_INCOME_SOURCES.includes(
            next.category as (typeof PERSONAL_INCOME_SOURCES)[number],
          )
        ) {
          next.category = "Other";
        }
      } else {
        const list =
          next.account === "Studio" ? EXPENSE_CATEGORIES : PERSONAL_CATEGORIES;
        if (!list.includes(next.category)) {
          next.category = list[0] ?? "Other";
        }
      }
      if (next.saved) {
        persistRecordToStore(next, prev.id);
      }
      return next;
    });
  };

  const confirmManualSave = () => {
    if (!record) return;
    if (!(record.amount > 0)) {
      toast.error("Enter a transaction amount greater than 0.");
      return;
    }
    const savedRec: RecordedRecord = { ...record, saved: true };
    persistRecordToStore(savedRec, record.saved ? record.id : undefined);
    setRecord(savedRec);
    setEditing(false);
    toast.success("Transaction saved to ledger.");
  };

  const handleUndoDelete = () => {
    if (!record) return;
    if (record.saved) {
      deleteRecordFromStore(record.id);
      toast.message("Scanned transaction removed.");
    }
    resetScan();
  };

  const CategoryIcon = record
    ? record.txType === "income"
      ? incomeSourceIcon(record.category)
      : categoryIcon(record.category)
    : Sparkles;
  const MethodIcon = record ? paymentCardIcon(record.method) : ScanLine;

  return (
    <SlideDrawer
      open={open}
      onClose={handleClose}
      title="Scan Receipt"
      subtitle="Debit · Credit · Photo Slip"
      widthClass="max-w-lg"
    >
      <div className="space-y-4">
        {/* Clean Personal Mode Bar */}
        <div className="flex items-center justify-between gap-2 rounded-2xl border border-border/80 bg-muted/45 px-3.5 py-2.5">
          <div className="min-w-0">
            <span className="text-xs font-semibold text-foreground">
              Personal Expense
            </span>
            <p className="text-[0.68rem] text-muted-foreground">
              Debit · Credit · USD / KHR
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAutoRecord((a) => !a)}
            className={cn(
              "inline-flex min-h-[36px] shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              autoRecord
                ? "border-positive/45 bg-positive/15 text-positive"
                : "border-border bg-background/60 text-muted-foreground",
            )}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Auto-record: {autoRecord ? "ON" : "Review"}</span>
          </button>
        </div>

        {/* Hidden Inputs */}
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void scanFile(f);
            e.target.value = "";
          }}
        />
        <input
          ref={uploadRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void scanFile(f);
            e.target.value = "";
          }}
        />

        {/* Capture Controls */}
        {!scanning && !record && (
          <div className="space-y-3">
            <div className="rounded-3xl border border-dashed border-primary/45 bg-gradient-to-b from-primary/10 via-muted/40 to-muted/20 p-5 text-center">
              <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl border border-primary/35 bg-primary/15 text-primary shadow-sm">
                <ScanLine className="h-7 w-7" />
              </div>
              <h3 className="font-display text-base font-bold text-foreground">
                Snap receipt or upload slip
              </h3>
              <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">
                Reads receipts, transfer slips, fuel/coffee bills, and USD/KHR
                amounts automatically.
              </p>

              <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => cameraRef.current?.click()}
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-[0_8px_24px_-8px_var(--primary)] transition-transform active:scale-[0.98]"
                >
                  <Camera className="h-4 w-4 shrink-0" />
                  <span>Take Photo</span>
                </button>
                <button
                  type="button"
                  onClick={() => uploadRef.current?.click()}
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border border-border bg-secondary px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-accent active:scale-[0.98]"
                >
                  <ImagePlus className="h-4 w-4 shrink-0 text-primary" />
                  <span>Upload Screenshot</span>
                </button>
              </div>

              <div className="mt-3 flex items-center justify-center gap-1.5 text-[0.72rem] text-muted-foreground">
                <ClipboardPaste className="h-3.5 w-3.5" />
                <span>Tip: You can also paste an image with ⌘V / Ctrl+V</span>
              </div>
            </div>
          </div>
        )}

        {/* Scanning Progress */}
        {scanning && (
          <div className="space-y-3 rounded-3xl border border-primary/35 bg-muted/40 p-5 text-center">
            {previewUrl && (
              <div className="relative mx-auto h-48 w-full max-w-xs overflow-hidden rounded-2xl border border-border bg-black/40">
                <img
                  src={previewUrl}
                  alt="Scanning receipt"
                  className="h-full w-full object-contain opacity-75"
                />
                <div className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 animate-pulse bg-primary shadow-[0_0_16px_var(--primary)]" />
              </div>
            )}
            <div className="flex items-center justify-center gap-2 text-sm font-semibold text-primary">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Reading receipt amount, card &amp; category…</span>
            </div>
          </div>
        )}

        {/* Error Box */}
        {errorMsg && !scanning && (
          <div className="space-y-3 rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-xs text-destructive">
            <p className="font-semibold">Scanner could not read this image</p>
            <p className="leading-relaxed text-foreground/90">{errorMsg}</p>
            <div className="flex flex-wrap gap-2">
              {lastFile && (
                <Btn
                  type="button"
                  variant="gold"
                  onClick={() => void scanFile(lastFile)}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Retry scan
                </Btn>
              )}
              <Btn type="button" onClick={resetScan}>
                Try another image
              </Btn>
            </div>
          </div>
        )}

        {/* Scanned Result & Banking Confirmation Slip */}
        {record && !scanning && (
          <div className="space-y-4">
            {/* Confirmation Header */}
            <div
              className={cn(
                "rounded-3xl border p-4",
                record.saved
                  ? "border-positive/40 bg-positive/10"
                  : "border-primary/40 bg-primary/10",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      "grid h-10 w-10 shrink-0 place-items-center rounded-2xl",
                      record.saved
                        ? "bg-positive/20 text-positive"
                        : "bg-primary/20 text-primary",
                    )}
                  >
                    {record.saved ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : record.txType === "income" ? (
                      <ArrowDownLeft className="h-5 w-5" />
                    ) : (
                      <ArrowUpRight className="h-5 w-5" />
                    )}
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {record.saved
                        ? "Transaction Recorded"
                        : "Review Extracted Slip"}
                    </p>
                    <p
                      className={cn(
                        "font-num text-2xl font-extrabold tracking-tight",
                        record.txType === "income"
                          ? "text-positive"
                          : "text-foreground",
                      )}
                    >
                      {money(
                        record.txType === "income"
                          ? record.amount
                          : -record.amount,
                        record.currency,
                        true,
                      )}
                    </p>
                  </div>
                </div>

                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Receipt preview"
                    className="h-14 w-14 shrink-0 rounded-xl border border-border object-cover"
                  />
                )}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                  <MethodIcon className="h-3.5 w-3.5 text-primary" />
                  {record.method}
                </span>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                  <CategoryIcon className="h-3.5 w-3.5 text-primary" />
                  {record.category}
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-num">{shortDate(record.date)}</span>
                {record.reference && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="font-num">Ref {record.reference}</span>
                  </>
                )}
              </div>

              <p className="mt-2 truncate text-sm font-semibold text-foreground">
                {record.merchantOrPayer}
                {record.description &&
                record.description !== record.merchantOrPayer
                  ? ` — ${record.description}`
                  : ""}
              </p>

              {/* Direction Switcher */}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border/50 pt-3">
                <SlidingTabs
                  size="xs"
                  layoutGroup="scan-res-type"
                  value={record.txType}
                  onChange={(v) => updateRecord({ txType: v })}
                  options={[
                    { id: "expense", label: "Expense" },
                    { id: "income", label: "Income" },
                  ]}
                />
                <span className="text-[0.7rem] font-medium text-muted-foreground">
                  Personal Ledger
                </span>
              </div>
            </div>

            {/* Editable Fields (when editing or review mode) */}
            {(editing || !record.saved) && (
              <div className="grid grid-cols-2 gap-3 rounded-2xl border border-border bg-muted/35 p-3.5">
                <F label="Amount" className="col-span-1">
                  <input
                    type="number"
                    step="any"
                    className="field font-num"
                    value={record.amount || ""}
                    onChange={(e) =>
                      updateRecord({ amount: Number(e.target.value) || 0 })
                    }
                  />
                </F>
                <F label="Currency" className="col-span-1">
                  <Sel
                    value={record.currency}
                    onChange={(v) => updateRecord({ currency: v as Currency })}
                    options={["USD", "KHR"]}
                  />
                </F>
                <F label="Date" className="col-span-1">
                  <input
                    type="date"
                    className="field font-num"
                    value={record.date}
                    onChange={(e) => updateRecord({ date: e.target.value })}
                  />
                </F>
                <F label="Card" className="col-span-1">
                  <Sel
                    value={record.method}
                    onChange={(v) => updateRecord({ method: v })}
                    options={(record.txType === "income"
                      ? PERSONAL_INCOME_METHODS
                      : CARD_METHODS
                    ).map((m) => ({
                      value: m,
                      label: m,
                      icon: paymentCardIcon(m),
                    }))}
                  />
                </F>
                <F
                  label={
                    record.txType === "income" ? "Income Source" : "Category"
                  }
                  className="col-span-2"
                >
                  <Sel
                    value={record.category}
                    onChange={(v) => updateRecord({ category: v })}
                    options={(record.txType === "income"
                      ? PERSONAL_INCOME_SOURCES
                      : record.account === "Studio"
                        ? EXPENSE_CATEGORIES
                        : PERSONAL_CATEGORIES
                    ).map((c) => ({
                      value: c,
                      label: c,
                      icon:
                        record.txType === "income"
                          ? incomeSourceIcon(c)
                          : categoryIcon(c),
                    }))}
                  />
                </F>
                <F label="Merchant / Payer" className="col-span-2">
                  <input
                    className="field"
                    value={record.merchantOrPayer}
                    onChange={(e) =>
                      updateRecord({ merchantOrPayer: e.target.value })
                    }
                  />
                </F>
                <F label="Description" className="col-span-2">
                  <input
                    className="field"
                    value={record.description}
                    onChange={(e) =>
                      updateRecord({ description: e.target.value })
                    }
                  />
                </F>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/70 pt-3">
              <div className="flex items-center gap-2">
                {record.saved ? (
                  <Btn
                    type="button"
                    variant="danger"
                    onClick={handleUndoDelete}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Undo
                  </Btn>
                ) : null}
                <Btn type="button" onClick={() => setEditing((e) => !e)}>
                  <Pencil className="h-3.5 w-3.5" />
                  {editing ? "Hide fields" : "Edit"}
                </Btn>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {!record.saved ? (
                  <Btn type="button" variant="gold" onClick={confirmManualSave}>
                    <CheckCircle2 className="h-4 w-4" />
                    Confirm &amp; Record
                  </Btn>
                ) : (
                  <>
                    <Btn type="button" onClick={resetScan}>
                      <Camera className="h-3.5 w-3.5" />
                      Scan Next
                    </Btn>
                    <Btn type="button" variant="gold" onClick={handleClose}>
                      Done
                    </Btn>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </SlideDrawer>
  );
}
