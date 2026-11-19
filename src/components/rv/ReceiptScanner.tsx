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
  Cpu,
  ImagePlus,
  Maximize2,
  Minimize2,
  Pencil,
  Plus,
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
import { QuickExpenseDrawer } from "@/components/rv/QuickTxDrawer";
import {
  CARD_METHODS,
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
import { scanReceiptLocally } from "@/lib/local-receipt-ai";
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
  account: "Personal";
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
      vendor: rec.method || "Debit",
      description:
        rec.merchantOrPayer &&
        !rec.description
          .toLowerCase()
          .includes(rec.merchantOrPayer.toLowerCase())
          ? `${rec.merchantOrPayer} — ${rec.description}`
          : buildDescription(rec),
      amount: Math.max(0, Number(rec.amount) || 0),
      currency: rec.currency,
      receipt: rec.receiptThumb,
      account: "Personal",
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

  const openScanner = useCallback(() => {
    setOpen(true);
  }, []);

  const value = useMemo(() => ({ openScanner }), [openScanner]);

  return (
    <ScannerContext.Provider value={value}>
      {children}
      <ReceiptScannerDrawer open={open} onClose={() => setOpen(false)} />
    </ScannerContext.Provider>
  );
}

export function ReceiptScannerDrawer({
  open,
  onClose,
}: {
  open: boolean;
  defaultAccount?: Account;
  onClose: () => void;
}) {
  const [autoRecord, setAutoRecord] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanPct, setScanPct] = useState(0);
  const [scanStatus, setScanStatus] = useState("Reading slip…");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [expandImage, setExpandImage] = useState(false);
  const [record, setRecord] = useState<RecordedRecord | null>(null);
  const [editing, setEditing] = useState(false);
  const [lastFile, setLastFile] = useState<File | null>(null);
  const [manualDraft, setManualDraft] = useState<Expense | null>(null);

  const cameraRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);

  const resetScan = useCallback(() => {
    setScanning(false);
    setScanPct(0);
    setScanStatus("Reading slip…");
    setErrorMsg(null);
    setPreviewUrl("");
    setExpandImage(false);
    setRecord(null);
    setEditing(false);
    setLastFile(null);
  }, []);

  const handleClose = () => {
    resetScan();
    onClose();
  };

  const openManualAdd = () => {
    resetScan();
    onClose();
    setManualDraft({
      id: uid(),
      date: today(),
      projectId: "",
      category: PERSONAL_CATEGORIES[0] ?? "Food",
      vendor: "Debit",
      description: "",
      amount: 0,
      currency: "USD",
      receipt: "",
      account: "Personal",
    });
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
      setScanPct(8);
      setScanStatus("Preparing image…");
      setErrorMsg(null);
      setRecord(null);
      setEditing(false);

      const quickUrl = URL.createObjectURL(file);
      setPreviewUrl(quickUrl);

      try {
        const { result, previewDataUrl, thumbDataUrl } =
          await scanReceiptLocally(file, today(), (pct, status) => {
            setScanPct(pct);
            setScanStatus(status);
          });

        setPreviewUrl(previewDataUrl);

        const nextRecord: RecordedRecord = {
          id: uid(),
          txType: result.txType,
          account: "Personal",
          amount: result.amount,
          currency: result.currency,
          date: result.date || today(),
          merchantOrPayer: result.merchantOrPayer,
          description: result.description,
          method: result.method,
          category: result.category,
          reference: result.reference,
          confidence: result.confidence,
          notes: result.notes,
          receiptThumb: thumbDataUrl,
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
          err instanceof Error
            ? err.message
            : "Could not read receipt text cleanly.";
        setErrorMsg(msg);
      } finally {
        URL.revokeObjectURL(quickUrl);
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
      const next: RecordedRecord = { ...prev, ...patch, account: "Personal" };
      if (next.txType === "income") {
        if (
          !PERSONAL_INCOME_SOURCES.includes(
            next.category as (typeof PERSONAL_INCOME_SOURCES)[number],
          )
        ) {
          next.category = "Other";
        }
      } else {
        if (!PERSONAL_CATEGORIES.includes(next.category)) {
          next.category = PERSONAL_CATEGORIES[0] ?? "Other";
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
    <>
      <SlideDrawer
        open={open}
        onClose={handleClose}
        title="Scan Receipt"
        subtitle="On-Device AI · No API Required"
        headerAction={
          <button
            type="button"
            onClick={openManualAdd}
            className="inline-flex h-9 items-center gap-1 rounded-full border border-border bg-secondary px-3 text-xs font-semibold text-foreground transition-all hover:border-primary/45 hover:bg-accent active:scale-95"
          >
            <Plus className="h-3.5 w-3.5 text-primary" />
            <span>Manual</span>
          </button>
        }
        widthClass="max-w-lg"
      >
        <div className="space-y-4">
          {/* Clean Local AI Mode Bar */}
          <div className="flex items-center justify-between gap-2 rounded-2xl border border-border/80 bg-muted/45 px-3.5 py-2.5">
            <div className="flex min-w-0 items-center gap-2">
              <Cpu className="h-4 w-4 shrink-0 text-primary" />
              <div className="min-w-0">
                <span className="block truncate text-xs font-semibold text-foreground">
                  Local AI Scanner
                </span>
                <p className="truncate text-[0.68rem] text-muted-foreground">
                  Debit · Credit · USD / KHR
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAutoRecord((a) => !a)}
              className={cn(
                "inline-flex min-h-[36px] shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all active:scale-95",
                autoRecord
                  ? "border-positive/45 bg-positive/15 text-positive"
                  : "border-border bg-background/60 text-muted-foreground",
              )}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Auto: {autoRecord ? "ON" : "Review"}</span>
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
                  Reads slips &amp; receipts directly on your device with zero
                  API keys.
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => cameraRef.current?.click()}
                    className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-primary px-3 py-3 text-sm font-semibold text-primary-foreground shadow-[0_8px_24px_-8px_var(--primary)] transition-transform active:scale-95"
                  >
                    <Camera className="h-4 w-4 shrink-0" />
                    <span>Camera</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => uploadRef.current?.click()}
                    className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border border-border bg-secondary px-3 py-3 text-sm font-semibold text-foreground transition-all hover:bg-accent active:scale-95"
                  >
                    <ImagePlus className="h-4 w-4 shrink-0 text-primary" />
                    <span>Upload</span>
                  </button>
                </div>

                <div className="mt-3 flex items-center justify-center gap-1.5 text-[0.7rem] text-muted-foreground">
                  <ClipboardPaste className="h-3.5 w-3.5" />
                  <span>Paste screenshot with ⌘V / Ctrl+V</span>
                </div>
              </div>
            </div>
          )}

          {/* Scanning Progress with Filled Preview & Laser Sweep */}
          {scanning && (
            <div className="space-y-3 rounded-3xl border border-primary/40 bg-muted/40 p-4 text-center">
              {previewUrl && (
                <div className="relative mx-auto h-52 w-full overflow-hidden rounded-2xl border border-primary/35 bg-black/50">
                  <img
                    src={previewUrl}
                    alt="Scanning receipt"
                    className="h-full w-full object-cover opacity-85"
                  />
                  {/* Viewfinder corners */}
                  <span className="pointer-events-none absolute left-3 top-3 h-5 w-5 rounded-tl-lg border-l-2 border-t-2 border-primary" />
                  <span className="pointer-events-none absolute right-3 top-3 h-5 w-5 rounded-tr-lg border-r-2 border-t-2 border-primary" />
                  <span className="pointer-events-none absolute bottom-3 left-3 h-5 w-5 rounded-bl-lg border-b-2 border-l-2 border-primary" />
                  <span className="pointer-events-none absolute bottom-3 right-3 h-5 w-5 rounded-br-lg border-b-2 border-r-2 border-primary" />
                  {/* Smooth GPU laser sweep */}
                  <div className="scan-sweep pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_20px_4px_var(--primary)]" />
                </div>
              )}

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-primary">{scanStatus}</span>
                  <span className="font-num text-muted-foreground">
                    {scanPct}%
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-300"
                    style={{ width: `${Math.max(8, scanPct)}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Error Fallback */}
          {errorMsg && !scanning && (
            <div className="space-y-3 rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-xs text-destructive">
              <p className="font-semibold">Could not decode this image</p>
              <p className="leading-relaxed text-foreground/90">{errorMsg}</p>
              <div className="grid grid-cols-2 gap-2">
                {lastFile && (
                  <Btn
                    type="button"
                    variant="gold"
                    onClick={() => void scanFile(lastFile)}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Retry
                  </Btn>
                )}
                <Btn type="button" onClick={openManualAdd}>
                  <Plus className="h-3.5 w-3.5" />
                  Add Manually
                </Btn>
              </div>
            </div>
          )}

          {/* Scanned Result & Confirmation Slip */}
          {record && !scanning && (
            <div className="space-y-3.5">
              {/* Filled Image Preview Card (Tap to expand/collapse) */}
              {previewUrl && (
                <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-black/35">
                  <img
                    src={previewUrl}
                    alt="Uploaded slip"
                    className={cn(
                      "w-full transition-all duration-200",
                      expandImage
                        ? "max-h-96 object-contain bg-black/70"
                        : "h-36 object-cover",
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setExpandImage((v) => !v)}
                    aria-label={
                      expandImage ? "Compact preview" : "Expand preview"
                    }
                    className="absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/60 px-2.5 py-1 text-[0.68rem] font-medium text-white backdrop-blur-md transition-transform active:scale-95"
                  >
                    {expandImage ? (
                      <>
                        <Minimize2 className="h-3 w-3" />
                        <span>Fit</span>
                      </>
                    ) : (
                      <>
                        <Maximize2 className="h-3 w-3" />
                        <span>Full</span>
                      </>
                    )}
                  </button>
                </div>
              )}

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
                      <p className="text-[0.68rem] font-semibold uppercase tracking-wider text-muted-foreground">
                        {record.saved
                          ? "Recorded to Personal"
                          : "Review & Confirm"}
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
                <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/50 pt-3">
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
                  <span className="text-[0.68rem] font-medium text-muted-foreground">
                    On-device OCR
                  </span>
                </div>
              </div>

              {/* Editable Fields */}
              {(editing || !record.saved) && (
                <div className="grid grid-cols-2 gap-3 rounded-2xl border border-border bg-muted/35 p-3.5">
                  <F label="Amount" className="col-span-1">
                    <input
                      type="number"
                      step="any"
                      inputMode="decimal"
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
                      onChange={(v) =>
                        updateRecord({ currency: v as Currency })
                      }
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
                  <F label="Note" className="col-span-2">
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

              {/* Aligned Action Bar */}
              <div className="grid grid-cols-2 gap-2.5 border-t border-border/70 pt-3">
                {record.saved ? (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <Btn
                        type="button"
                        variant="danger"
                        onClick={handleUndoDelete}
                        className="px-2"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Undo
                      </Btn>
                      <Btn
                        type="button"
                        onClick={() => setEditing((e) => !e)}
                        className="px-2"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        {editing ? "Hide" : "Edit"}
                      </Btn>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Btn type="button" onClick={resetScan} className="px-2">
                        <Camera className="h-3.5 w-3.5" />
                        Next
                      </Btn>
                      <Btn
                        type="button"
                        variant="gold"
                        onClick={handleClose}
                        className="px-2"
                      >
                        Done
                      </Btn>
                    </div>
                  </>
                ) : (
                  <>
                    <Btn type="button" onClick={resetScan}>
                      <RotateCcw className="h-3.5 w-3.5" />
                      Rescan
                    </Btn>
                    <Btn
                      type="button"
                      variant="gold"
                      onClick={confirmManualSave}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Save
                    </Btn>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </SlideDrawer>

      <QuickExpenseDrawer
        item={manualDraft}
        onClose={() => setManualDraft(null)}
        onSave={(v) => {
          setDB((d) => ({
            ...d,
            expenses: [...d.expenses, { ...v, account: "Personal" }],
          }));
          toast.success("Expense saved.");
        }}
      />
    </>
  );
}
