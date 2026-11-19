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
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardPaste,
  ImagePlus,
  Languages,
  Maximize2,
  Minimize2,
  PenTool,
  Pencil,
  Plus,
  RotateCcw,
  RotateCw,
  ScanLine,
  Sparkles,
  Trash2,
  Zap,
} from "lucide-react";
import { Btn, F, SlideDrawer, SlidingTabs } from "@/components/rv/ui";
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
  getDB,
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
import {
  parseReceiptText,
  scanReceiptLocally,
  warmUpReceiptOcr,
  type ReceiptScanMode,
} from "@/lib/local-receipt-ai";
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

const SCAN_MODES: {
  id: ReceiptScanMode;
  label: string;
  icon: typeof Sparkles;
}[] = [
  { id: "auto", label: "Auto", icon: Sparkles },
  { id: "khm+eng", label: "Khmer", icon: Languages },
  { id: "handwriting", label: "Script", icon: PenTool },
];

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
  const [scanMode, setScanMode] = useState<ReceiptScanMode>("auto");
  const [rotationDeg, setRotationDeg] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanPct, setScanPct] = useState(0);
  const [scanStatus, setScanStatus] = useState("Reading slip…");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [expandImage, setExpandImage] = useState(false);
  const [record, setRecord] = useState<RecordedRecord | null>(null);
  const [editing, setEditing] = useState(false);
  const [lastFile, setLastFile] = useState<File | null>(null);
  const [rawText, setRawText] = useState("");
  const [showRawText, setShowRawText] = useState(false);
  const [scanMeta, setScanMeta] = useState<{
    angle: number;
    lang: "eng+khm" | "eng";
  } | null>(null);
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
    setRotationDeg(0);
    setRawText("");
    setShowRawText(false);
    setScanMeta(null);
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
    async (
      file: File,
      override?: { rotation?: number; mode?: ReceiptScanMode },
    ) => {
      if (
        !file.type.startsWith("image/") &&
        !/\.(heic|heif|png|jpe?g|webp)$/i.test(file.name)
      ) {
        setErrorMsg(
          "Please choose a photo or screenshot image (PNG, JPG, WebP, or HEIC).",
        );
        return;
      }

      const nextRot = override?.rotation ?? rotationDeg;
      const nextMode = override?.mode ?? scanMode;
      const prevSavedId = record?.saved ? record.id : undefined;

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
        const s = getDB().settings;
        const ownerNames = [s.ownerName, s.signatoryName, s.abaName].filter(
          (v) => Boolean(v && v.trim()),
        );
        const {
          result,
          previewDataUrl,
          thumbDataUrl,
          rawText: detectedText,
          detectedAngleDeg,
          engineLang,
        } = await scanReceiptLocally(
          file,
          today(),
          (pct, status) => {
            setScanPct(pct);
            setScanStatus(status);
          },
          { rotationDeg: nextRot, mode: nextMode, context: { ownerNames } },
        );

        setPreviewUrl(previewDataUrl);
        setRawText(detectedText);
        setScanMeta({ angle: detectedAngleDeg, lang: engineLang });

        const nextRecord: RecordedRecord = {
          id: prevSavedId ?? uid(),
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
          persistRecordToStore(nextRecord, prevSavedId);
          toast.success(
            `Saved ${money(
              nextRecord.txType === "income"
                ? nextRecord.amount
                : -nextRecord.amount,
              nextRecord.currency,
              true,
            )} (${nextRecord.method})`,
          );
        } else {
          if (prevSavedId) {
            deleteRecordFromStore(prevSavedId);
          }
          setEditing(true);
          if (!(nextRecord.amount > 0)) {
            setShowRawText(true);
          }
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
    [autoRecord, record, rotationDeg, scanMode],
  );

  // Pre-warm on-device AI worker quietly after drawer animation finishes
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => warmUpReceiptOcr(), 160);
    return () => window.clearTimeout(t);
  }, [open]);

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
            setRotationDeg(0);
            void scanFile(blob, { rotation: 0 });
            break;
          }
        }
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [open, scanFile]);

  const handlePasteButton = async () => {
    try {
      if (!navigator.clipboard?.read) {
        toast.info("Press Ctrl+V or ⌘V to paste a screenshot.");
        return;
      }
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const imgType = item.types.find((t) => t.startsWith("image/"));
        if (imgType) {
          const blob = await item.getType(imgType);
          const file = new File([blob], "clipboard-receipt.png", {
            type: imgType,
          });
          setRotationDeg(0);
          void scanFile(file, { rotation: 0 });
          return;
        }
      }
      toast.info(
        "No image found in clipboard. Copy a receipt screenshot first.",
      );
    } catch {
      toast.info("Press Ctrl+V or ⌘V to paste a screenshot.");
    }
  };

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

  const handleReparseRaw = () => {
    if (!record) return;
    const s = getDB().settings;
    const ownerNames = [s.ownerName, s.signatoryName, s.abaName].filter((v) =>
      Boolean(v && v.trim()),
    );
    const parsed = parseReceiptText(rawText, record.date || today(), {
      ownerNames,
    });
    const next: RecordedRecord = {
      ...record,
      txType: parsed.txType,
      amount: parsed.amount,
      currency: parsed.currency,
      date: parsed.date || today(),
      merchantOrPayer: parsed.merchantOrPayer,
      description: parsed.description,
      method: parsed.method,
      category: parsed.category,
      reference: parsed.reference,
      confidence: parsed.confidence,
    };
    if (next.saved) {
      persistRecordToStore(next, record.id);
    }
    setRecord(next);
    toast.success("Updated fields from OCR text.");
  };

  const handleRotateAndRescan = () => {
    if (!lastFile) return;
    const nextRot = (rotationDeg + 90) % 360;
    setRotationDeg(nextRot);
    void scanFile(lastFile, { rotation: nextRot });
  };

  const cycleScanMode = () => {
    const idx = SCAN_MODES.findIndex((m) => m.id === scanMode);
    const nextMode = SCAN_MODES[(idx + 1) % SCAN_MODES.length]!.id;
    setScanMode(nextMode);
    if (lastFile && !scanning) {
      void scanFile(lastFile, { mode: nextMode });
    }
  };

  const confirmManualSave = () => {
    if (!record) return;
    if (!(record.amount > 0)) {
      toast.error("Enter an amount greater than 0.");
      return;
    }
    const savedRec: RecordedRecord = { ...record, saved: true };
    persistRecordToStore(savedRec, record.saved ? record.id : undefined);
    setRecord(savedRec);
    setEditing(false);
    toast.success("Transaction saved.");
  };

  const handleUndoDelete = () => {
    if (!record) return;
    if (record.saved) {
      deleteRecordFromStore(record.id);
      toast.message("Transaction removed.");
    }
    resetScan();
  };

  const CategoryIcon = record
    ? record.txType === "income"
      ? incomeSourceIcon(record.category)
      : categoryIcon(record.category)
    : Sparkles;
  const MethodIcon = record ? paymentCardIcon(record.method) : ScanLine;
  const activeModeMeta =
    SCAN_MODES.find((m) => m.id === scanMode) ?? SCAN_MODES[0]!;
  const ActiveModeIcon = activeModeMeta.icon;

  return (
    <>
      <SlideDrawer
        open={open}
        onClose={handleClose}
        title="Scan Receipt"
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
        <div className="space-y-3">
          {/* Compact Single-Row Controls */}
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setAutoRecord((a) => !a)}
              aria-pressed={autoRecord}
              className={cn(
                "inline-flex min-h-[34px] items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-all active:scale-95",
                autoRecord
                  ? "border-positive/45 bg-positive/15 text-positive"
                  : "border-border bg-muted/45 text-muted-foreground hover:text-foreground",
              )}
            >
              <Zap className="h-3.5 w-3.5" />
              <span>{autoRecord ? "Auto-save" : "Review first"}</span>
            </button>

            <button
              type="button"
              onClick={cycleScanMode}
              title="Tap to cycle OCR focus: Auto, Khmer, Script"
              className="inline-flex min-h-[34px] items-center gap-1.5 rounded-full border border-border bg-muted/45 px-3 text-xs font-medium text-foreground transition-all hover:border-primary/45 active:scale-95"
            >
              <ActiveModeIcon className="h-3.5 w-3.5 text-primary" />
              <span>{activeModeMeta.label}</span>
            </button>
          </div>

          {/* Hidden File Inputs */}
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) {
                setRotationDeg(0);
                void scanFile(f, { rotation: 0 });
              }
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
              if (f) {
                setRotationDeg(0);
                void scanFile(f, { rotation: 0 });
              }
              e.target.value = "";
            }}
          />

          {/* Clean Capture Card (Idle) */}
          {!scanning && !record && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                const f = e.dataTransfer.files?.[0];
                if (f) {
                  setRotationDeg(0);
                  void scanFile(f, { rotation: 0 });
                }
              }}
              className={cn(
                "rounded-3xl border border-dashed p-5 text-center transition-colors",
                dragging
                  ? "border-primary bg-primary/15"
                  : "border-primary/40 bg-gradient-to-b from-primary/10 via-muted/30 to-muted/15",
              )}
            >
              <div className="mx-auto mb-2.5 grid h-12 w-12 place-items-center rounded-2xl border border-primary/35 bg-primary/15 text-primary">
                <ScanLine className="h-6 w-6" />
              </div>
              <h3 className="font-display text-base font-bold text-foreground">
                Snap or upload receipt
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Supports Khmer, English &amp; handwriting
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => cameraRef.current?.click()}
                  className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-primary px-3 py-3 text-sm font-bold text-primary-foreground shadow-[0_8px_24px_-8px_var(--primary)] transition-transform active:scale-95"
                >
                  <Camera className="h-4.5 w-4.5 shrink-0" />
                  <span>Camera</span>
                </button>
                <button
                  type="button"
                  onClick={() => uploadRef.current?.click()}
                  className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border border-border bg-secondary px-3 py-3 text-sm font-bold text-foreground transition-all hover:bg-accent active:scale-95"
                >
                  <ImagePlus className="h-4.5 w-4.5 shrink-0 text-primary" />
                  <span>Photo</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => void handlePasteButton()}
                className="mt-3 inline-flex min-h-[34px] items-center justify-center gap-1.5 rounded-full px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <ClipboardPaste className="h-3.5 w-3.5 text-primary" />
                <span>Paste screenshot</span>
              </button>
            </div>
          )}

          {/* Scanning Progress */}
          {scanning && (
            <div className="space-y-3 rounded-3xl border border-primary/40 bg-muted/40 p-4 text-center">
              {previewUrl && (
                <div className="relative mx-auto h-52 w-full overflow-hidden rounded-2xl border border-primary/35 bg-black/50">
                  <img
                    src={previewUrl}
                    alt="Scanning receipt"
                    className="h-full w-full object-cover opacity-85"
                  />
                  <span className="pointer-events-none absolute left-3 top-3 h-5 w-5 rounded-tl-lg border-l-2 border-t-2 border-primary" />
                  <span className="pointer-events-none absolute right-3 top-3 h-5 w-5 rounded-tr-lg border-r-2 border-t-2 border-primary" />
                  <span className="pointer-events-none absolute bottom-3 left-3 h-5 w-5 rounded-bl-lg border-b-2 border-l-2 border-primary" />
                  <span className="pointer-events-none absolute bottom-3 right-3 h-5 w-5 rounded-br-lg border-b-2 border-r-2 border-primary" />
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
              <p className="font-semibold">Could not read image</p>
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
                  Manual
                </Btn>
              </div>
            </div>
          )}

          {/* Scanned Result & Quick 1-Tap Adjustments */}
          {record && !scanning && (
            <div className="space-y-3">
              {previewUrl && (
                <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-black/35">
                  <img
                    src={previewUrl}
                    alt="Uploaded slip"
                    className={cn(
                      "w-full transition-all duration-200",
                      expandImage
                        ? "max-h-96 object-contain bg-black/70"
                        : "h-32 object-cover",
                    )}
                  />
                  <div className="absolute right-2 top-2 flex items-center gap-1.5">
                    {lastFile && (
                      <button
                        type="button"
                        onClick={handleRotateAndRescan}
                        aria-label="Rotate 90 degrees and rescan"
                        className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/65 px-2.5 py-1 text-[0.68rem] font-medium text-white backdrop-blur-md transition-transform active:scale-95"
                      >
                        <RotateCw className="h-3 w-3" />
                        <span>Rotate</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setExpandImage((v) => !v)}
                      aria-label={
                        expandImage ? "Compact preview" : "Expand preview"
                      }
                      className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/65 px-2.5 py-1 text-[0.68rem] font-medium text-white backdrop-blur-md transition-transform active:scale-95"
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
                </div>
              )}

              {/* Summary Card */}
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
                        {record.txType === "income" ? "Income" : "Expense"} ·{" "}
                        {record.saved ? "Saved" : "Review"}
                        {record.confidence !== "high" ? " · Verify" : ""}
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
                  {scanMeta && (
                    <span className="font-num rounded-full border border-border/70 bg-background/50 px-2 py-0.5 text-[0.65rem] text-muted-foreground">
                      {scanMeta.lang === "eng+khm" ? "KH+EN" : "EN"}
                      {scanMeta.angle !== 0
                        ? ` · ${scanMeta.angle > 0 ? "+" : ""}${scanMeta.angle.toFixed(0)}°`
                        : ""}
                    </span>
                  )}
                </div>

                <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1 font-medium text-foreground">
                    <MethodIcon className="h-3.5 w-3.5 text-primary" />
                    {record.method}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1 font-medium text-foreground">
                    <CategoryIcon className="h-3.5 w-3.5 text-primary" />
                    {record.category}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-num">{shortDate(record.date)}</span>
                </div>

                <p className="mt-1.5 truncate text-sm font-semibold text-foreground">
                  {record.merchantOrPayer || "Scanned slip"}
                  {record.description &&
                  record.description !== record.merchantOrPayer
                    ? ` — ${record.description}`
                    : ""}
                </p>

                {/* 1-Tap Expense/Income + Debit/Credit + OCR link */}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border/50 pt-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <SlidingTabs
                      size="xs"
                      layoutGroup="scan-res-type"
                      value={record.txType}
                      onChange={(v) => updateRecord({ txType: v })}
                      options={[
                        { id: "expense", label: "Out" },
                        { id: "income", label: "In" },
                      ]}
                    />
                    <div className="flex items-center gap-1">
                      {(record.txType === "income"
                        ? PERSONAL_INCOME_METHODS
                        : CARD_METHODS
                      ).map((m) => {
                        const active = record.method === m;
                        return (
                          <button
                            key={m}
                            type="button"
                            onClick={() => updateRecord({ method: m })}
                            className={cn(
                              "min-h-[30px] rounded-full border px-2.5 text-[0.7rem] font-semibold transition-colors",
                              active
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-card/60 text-muted-foreground hover:text-foreground",
                            )}
                          >
                            {m}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowRawText((v) => !v)}
                    className="inline-flex items-center gap-1 text-[0.7rem] font-medium text-primary hover:underline"
                  >
                    <span>OCR</span>
                    <ChevronDown
                      className={cn(
                        "h-3 w-3 transition-transform",
                        showRawText && "rotate-180",
                      )}
                    />
                  </button>
                </div>

                {/* 1-Tap Category Chips */}
                <div className="no-scrollbar mt-2.5 flex flex-nowrap items-center gap-1.5 overflow-x-auto pb-0.5">
                  {(record.txType === "income"
                    ? PERSONAL_INCOME_SOURCES
                    : PERSONAL_CATEGORIES
                  ).map((cat) => {
                    const Icon =
                      record.txType === "income"
                        ? incomeSourceIcon(cat)
                        : categoryIcon(cat);
                    const active = record.category === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => updateRecord({ category: cat })}
                        className={cn(
                          "inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[0.68rem] font-semibold transition-colors",
                          active
                            ? "border-primary bg-primary/20 text-primary"
                            : "border-border/80 bg-card/45 text-muted-foreground hover:text-foreground",
                        )}
                      >
                        <Icon className="h-3 w-3 shrink-0" />
                        <span>{cat}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Raw OCR Text Inspector */}
              {showRawText && (
                <div className="space-y-2 rounded-2xl border border-border bg-muted/35 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="label-mono">OCR text</span>
                    <button
                      type="button"
                      onClick={handleReparseRaw}
                      className="rounded-full bg-primary px-2.5 py-1 text-[0.68rem] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                    >
                      Re-parse
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder="Edit detected text and tap Re-parse…"
                    className="field w-full resize-y font-mono text-xs"
                  />
                </div>
              )}

              {/* Compact Field Editor (when editing or before save) */}
              {(editing || !record.saved) && (
                <div className="grid grid-cols-2 gap-2.5 rounded-2xl border border-border bg-muted/35 p-3">
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
                    <div className="flex gap-1.5 pt-0.5">
                      {(["USD", "KHR"] as Currency[]).map((cur) => (
                        <button
                          key={cur}
                          type="button"
                          onClick={() => updateRecord({ currency: cur })}
                          className={cn(
                            "font-num min-h-[38px] flex-1 rounded-xl border text-xs font-semibold transition-colors",
                            record.currency === cur
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-card/50 text-muted-foreground hover:text-foreground",
                          )}
                        >
                          {cur}
                        </button>
                      ))}
                    </div>
                  </F>
                  <F label="Date" className="col-span-1">
                    <input
                      type="date"
                      className="field font-num"
                      value={record.date}
                      onChange={(e) => updateRecord({ date: e.target.value })}
                    />
                  </F>
                  <F label="Merchant / Payer" className="col-span-1">
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

              {/* Action Bar */}
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
                        {editing ? "Less" : "Edit"}
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
                        <Check className="h-3.5 w-3.5" />
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
