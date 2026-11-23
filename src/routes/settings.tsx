import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  Database,
  Download,
  Eye,
  EyeOff,
  Info,
  Plus,
  RotateCcw,
  Trash2,
  Upload,
} from "lucide-react";
import { Btn, F, Glass, PageHeader, Stat } from "@/components/rv/ui";
import { EditModal, nextCode, upsert, type Field } from "@/components/rv/Crud";
import {
  exportMediaBlobs,
  formatBytes,
  getStorageHealth,
  purgeOrphanedMediaBlobs,
  restoreMediaBlobs,
  type StorageHealthReport,
} from "@/lib/media-store";
import {
  PILLARS,
  PRICING_UNITS,
  SCHEMA_VERSION,
  collectReferencedMediaIds,
  fileToDataUrl,
  flushDB,
  getDB,
  hasPreRestoreSnapshot,
  migrateAndValidateDB,
  money,
  resetDB,
  restorePreRestoreSnapshot,
  retryPersistDB,
  safeKhrRate,
  savePreRestoreSnapshot,
  setDB,
  uid,
  useDB,
  usePersistStatus,
  type Service,
  type Settings,
} from "@/lib/store";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings · RothVan Studio" },
      {
        name: "description",
        content:
          "Business details, payment info, services and terms for RothVan Design.",
      },
      { property: "og:title", content: "Settings · RothVan Studio" },
      {
        property: "og:description",
        content:
          "Business details, payment info, services and terms for RothVan Design.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const sfields: Field<Service>[] = [
  { k: "name", label: "Service name", wide: true },
  { k: "pillar", label: "Pillar", type: "select", options: PILLARS },
  { k: "unit", label: "Pricing unit", type: "select", options: PRICING_UNITS },
  { k: "rate", label: "Rate (USD)", type: "number" },
  { k: "overage", label: "Extra revision (USD)", type: "number" },
  { k: "timeline", label: "Timeline", wide: true },
  { k: "scope", label: "Scope (one per line)", type: "textarea" },
];

const BACKUP_UI_PREF_KEYS = [
  "rv-bento-layouts-v1",
  "rv-custom-tabs-v1",
  "rv-project-boards-v1",
  "rv-hide-bal",
  "rv-theme",
] as const;

function Page() {
  const db = useDB((d) => d);
  const s = db.settings;
  const persistStatus = usePersistStatus();
  const [svc, setSvc] = useState<Service | null>(null);
  const [showAllServices, setShowAllServices] = useState(false);
  const [showServicesPanel, setShowServicesPanel] = useState(true);
  const [storageHealth, setStorageHealth] =
    useState<StorageHealthReport | null>(null);
  const [cleaningOrphans, setCleaningOrphans] = useState(false);
  const [canUndoRestore, setCanUndoRestore] = useState(() =>
    hasPreRestoreSnapshot(),
  );
  const [rateDraft, setRateDraft] = useState(() => String(s.khrRate));
  useEffect(() => {
    setRateDraft(String(s.khrRate));
  }, [s.khrRate]);

  const refreshHealth = useCallback(async () => {
    const report = await getStorageHealth(collectReferencedMediaIds(getDB()));
    setStorageHealth(report);
  }, []);

  useEffect(() => {
    void refreshHealth();
  }, [db, refreshHealth]);

  const set = <K extends keyof Settings>(k: K, v: Settings[K]) =>
    setDB((d) => ({ ...d, settings: { ...d.settings, [k]: v } }));
  const txt = (k: keyof Settings, label: string, wide = false) => (
    <F label={label} className={wide ? "sm:col-span-2" : ""}>
      <input
        className="field"
        value={String(s[k])}
        onChange={(e) => set(k, e.target.value as never)}
      />
    </F>
  );
  const img = (k: "logo" | "khqr" | "signature", label: string) => (
    <F label={label} className="min-w-0">
      <div className="flex min-w-0 items-center gap-3">
        <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl border border-dashed border-border bg-muted sm:h-20 sm:w-20">
          {s[k] ? (
            <img
              src={s[k]}
              alt={label}
              className="h-full w-full object-contain"
            />
          ) : (
            <Upload className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <label className="inline-flex min-h-[40px] cursor-pointer items-center gap-1.5 rounded-full border border-border bg-secondary px-3.5 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent active:scale-95">
            <Upload className="h-3.5 w-3.5 shrink-0 text-primary" />
            <span>{s[k] ? "Replace" : "Upload"}</span>
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (f) set(k, await fileToDataUrl(f, 600));
                e.target.value = "";
              }}
            />
          </label>
          {s[k] && (
            <button
              type="button"
              className="inline-flex min-h-[36px] items-center rounded-full px-2.5 text-xs font-medium text-destructive hover:bg-destructive/10"
              onClick={() => set(k, "")}
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </F>
  );
  const exportData = async () => {
    try {
      const snapshot = getDB();
      const mediaIds = Array.from(collectReferencedMediaIds(snapshot));
      const mediaBlobs = await exportMediaBlobs(mediaIds);
      const uiPrefs: Record<string, string> = {};
      for (const k of BACKUP_UI_PREF_KEYS) {
        const val = localStorage.getItem(k);
        if (val !== null) uiPrefs[k] = val;
      }
      const backup = {
        ...snapshot,
        _backup: {
          format: "rothvan-studio",
          version: SCHEMA_VERSION,
          exportedAt: new Date().toISOString(),
        },
        mediaBlobs,
        uiPrefs,
      };
      const blob = new Blob([JSON.stringify(backup)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `rothvan-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      const attachmentCount = Object.keys(mediaBlobs).length;
      const missingAttachments = new Set(mediaIds).size - attachmentCount;
      toast.success(
        `Backup downloaded with ${attachmentCount} original attachments.`,
      );
      if (missingAttachments > 0) {
        toast.warning(
          `${missingAttachments} original attachments were unavailable; thumbnails and records are still included.`,
        );
      }
    } catch {
      toast.error("Could not create the backup. Please try again.");
    }
  };

  const importData = async (f: File) => {
    try {
      const parsed: unknown = JSON.parse(await f.text());
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("Invalid backup file");
      }
      type BackupShape = {
        settings?: unknown;
        mediaBlobs?: unknown;
        uiPrefs?: unknown;
        clients?: unknown;
        services?: unknown;
        projects?: unknown;
        invoices?: unknown;
        payments?: unknown;
        expenses?: unknown;
        goals?: unknown;
      };
      const p = parsed as BackupShape & Record<string, unknown>;
      const isObject = (value: unknown): value is Record<string, unknown> =>
        Boolean(value) && typeof value === "object" && !Array.isArray(value);
      const requiredArrays = [
        "clients",
        "services",
        "projects",
        "invoices",
        "payments",
        "expenses",
        "goals",
      ];
      if (
        !isObject(p.settings) ||
        requiredArrays.some((key) => !Array.isArray(p[key]))
      ) {
        throw new Error("Incomplete backup file");
      }
      if (p.mediaBlobs !== undefined && !isObject(p.mediaBlobs)) {
        throw new Error("Invalid attachment data");
      }

      // Save rollback snapshot before overwriting local database
      const snapshotSaved = savePreRestoreSnapshot();
      setCanUndoRestore(snapshotSaved || hasPreRestoreSnapshot());

      const validated = migrateAndValidateDB(p);
      const backupMediaCount = isObject(p.mediaBlobs)
        ? Object.keys(p.mediaBlobs).length
        : 0;
      const restoredMedia = isObject(p.mediaBlobs)
        ? await restoreMediaBlobs(p.mediaBlobs)
        : 0;

      if (isObject(p.uiPrefs)) {
        for (const k of BACKUP_UI_PREF_KEYS) {
          const val = p.uiPrefs[k];
          if (typeof val === "string") {
            try {
              localStorage.setItem(k, val);
            } catch {
              /* ignore non-critical UI pref storage error */
            }
          }
        }
      }

      setDB(() => validated);
      const flushed = flushDB();
      void refreshHealth();
      if (!flushed) {
        toast.warning(
          "Backup loaded in memory, but browser localStorage quota prevented immediate disk save. Clean unused attachments or export smaller media.",
        );
      } else {
        toast.success(
          `Backup restored (v${validated.schemaVersion ?? SCHEMA_VERSION}). ${restoredMedia} original attachments recovered.`,
        );
      }
      if (restoredMedia < backupMediaCount) {
        toast.warning(
          `${backupMediaCount - restoredMedia} attachments could not be restored in this browser.`,
        );
      }
    } catch (error) {
      toast.error(
        error instanceof Error && error.message === "Incomplete backup file"
          ? "This backup is missing required RothVan records."
          : "That file isn't a valid RothVan backup.",
      );
    }
  };

  const handleCleanOrphans = async () => {
    setCleaningOrphans(true);
    try {
      const removed = await purgeOrphanedMediaBlobs(
        collectReferencedMediaIds(getDB()),
      );
      await refreshHealth();
      toast.success(
        removed > 0
          ? `Removed ${removed} orphaned attachment${removed === 1 ? "" : "s"}.`
          : "No orphaned attachments found.",
      );
    } finally {
      setCleaningOrphans(false);
    }
  };

  const handleUndoRestore = () => {
    if (restorePreRestoreSnapshot()) {
      void refreshHealth();
      toast.success("Restored database to state before the last import.");
    } else {
      toast.error("Could not recover pre-restore snapshot.");
    }
  };

  const totalRecords =
    db.expenses.length +
    (db.personalIncome?.length ?? 0) +
    (db.workTasks?.length ?? 0) +
    db.goals.length;

  return (
    <>
      <PageHeader title="Settings" owner={s.ownerName} />

      <Glass className="mb-4 min-w-0 border-primary/25">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-primary/35 bg-primary/15 text-primary">
              <Database className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <h2 className="truncate font-display text-lg font-bold">
                Database Backup &amp; Restore
              </h2>
              <p className="truncate text-xs text-muted-foreground">
                Export and restore records, reminders and original project
                attachments
              </p>
            </div>
          </div>
        </div>

        <div className="mb-3 flex items-start gap-2.5 rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs leading-relaxed text-muted-foreground">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p>
            <strong className="font-semibold text-foreground">
              Local browser storage.
            </strong>{" "}
            Your records are saved in this browser on this device. They do not
            automatically sync to another device or another user. Download a
            backup before clearing browser data or moving to a new device.
          </p>
        </div>

        <div className="mb-3 grid grid-cols-2 gap-2.5 rounded-2xl bg-muted/35 p-3 sm:grid-cols-4">
          <Stat label="Expenses" value={String(db.expenses.length)} />
          <Stat
            label="Income"
            value={String(
              (db.personalIncome?.length ?? 0) +
                (db.studioIncome?.length ?? 0) +
                db.payments.length,
            )}
            tone="pos"
          />
          <Stat label="Work Tasks" value={String(db.workTasks?.length ?? 0)} />
          <Stat label="Total Saved" value={String(totalRecords)} />
        </div>

        <div className="mb-3 rounded-2xl border border-border/70 bg-muted/25 p-3 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-semibold text-foreground">
              Storage Health · Schema v{db.schemaVersion ?? SCHEMA_VERSION}
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {storageHealth && storageHealth.idbOrphanBlobs > 0 && (
                <Btn
                  type="button"
                  onClick={handleCleanOrphans}
                  disabled={cleaningOrphans}
                  className="min-h-[30px] px-2.5 py-1 text-[0.7rem]"
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                  Clean {storageHealth.idbOrphanBlobs} Orphaned Blobs
                </Btn>
              )}
              {canUndoRestore && (
                <Btn
                  type="button"
                  onClick={handleUndoRestore}
                  className="min-h-[30px] px-2.5 py-1 text-[0.7rem]"
                >
                  <RotateCcw className="h-3 w-3 text-primary" />
                  Undo Last Restore
                </Btn>
              )}
            </div>
          </div>
          <div className="font-num mt-2 flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground">
            <span>
              localStorage:{" "}
              {storageHealth
                ? formatBytes(storageHealth.localStorageBytes) || "0 B"
                : "—"}
            </span>
            <span>
              IDB Attachments:{" "}
              {storageHealth
                ? `${storageHealth.idbTotalBlobs} stored (${storageHealth.idbOrphanBlobs} orphaned)`
                : "—"}
            </span>
            {storageHealth?.browserQuotaBytes && (
              <span>
                Quota:{" "}
                {formatBytes(storageHealth.browserUsageBytes ?? 0) || "0 B"} /{" "}
                {formatBytes(storageHealth.browserQuotaBytes)}
              </span>
            )}
          </div>
          {persistStatus.lastError && (
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-2.5 py-2 text-destructive">
              <span className="inline-flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                {persistStatus.lastError}
              </span>
              <button
                type="button"
                onClick={() => retryPersistDB()}
                className="font-semibold underline"
              >
                Retry Save
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <Btn
            type="button"
            variant="gold"
            onClick={exportData}
            className="w-full justify-center"
          >
            <Download className="h-4 w-4 shrink-0" />
            <span>Download Database</span>
          </Btn>
          <label className="inline-flex min-h-[42px] w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-border bg-secondary px-4 py-2 text-sm font-medium text-foreground transition-all hover:bg-accent active:scale-95 sm:min-h-[38px]">
            <Upload className="h-4 w-4 shrink-0 text-primary" />
            <span>Upload Backup</span>
            <input
              type="file"
              accept=".json,application/json"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void importData(file);
                e.target.value = "";
              }}
            />
          </label>
          <Btn
            type="button"
            variant="danger"
            onClick={() => {
              if (confirm("Erase everything and restore sample data?")) {
                resetDB();
                toast.message("Sample data restored.");
              }
            }}
            className="w-full justify-center"
          >
            <RotateCcw className="h-4 w-4 shrink-0" />
            <span>Reset Sample Data</span>
          </Btn>
        </div>
      </Glass>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Glass className="min-w-0">
          <h2 className="mb-4 font-display text-lg font-bold">Business</h2>
          <div className="grid min-w-0 gap-3 sm:grid-cols-2">
            {txt("businessName", "Business name")}
            {txt("ownerName", "Your first name")}
            {txt("phones", "Phone numbers", true)}
            {txt("email", "Email")}
            {txt("website", "Website")}
            {txt("address", "Address", true)}
            {img("logo", "Logo")}
          </div>
        </Glass>
        <Glass delay={60} className="min-w-0">
          <h2 className="mb-4 font-display text-lg font-bold">
            Payment &amp; signature
          </h2>
          <div className="grid min-w-0 gap-3 sm:grid-cols-2">
            {txt("abaName", "ABA account name")}
            {txt("abaNumber", "ABA account number")}
            <F label="Due after (days)">
              <input
                className="field"
                type="number"
                min={0}
                value={s.dueDays}
                onChange={(e) =>
                  set("dueDays", Math.max(0, Number(e.target.value) || 0))
                }
              />
            </F>
            <F label="KHR per USD (new transactions)">
              <input
                className="field"
                type="number"
                min={1}
                value={rateDraft}
                onChange={(e) => {
                  const val = e.target.value;
                  setRateDraft(val);
                  const n = Number(val);
                  if (Number.isFinite(n) && n > 0) {
                    set("khrRate", n);
                  }
                }}
                onBlur={() => {
                  const clean = safeKhrRate(Number(rateDraft));
                  setRateDraft(String(clean));
                  if (clean !== s.khrRate) set("khrRate", clean);
                }}
              />
            </F>
            <F
              label="Planning reserve estimate (% — optional)"
              className="sm:col-span-2"
            >
              <input
                className="field"
                type="number"
                min={0}
                max={50}
                step="0.5"
                value={s.planningReservePct ?? 0}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  const clamped = Number.isFinite(n)
                    ? Math.max(0, Math.min(50, n))
                    : 0;
                  set("planningReservePct", clamped);
                }}
              />
              <p className="mt-1 text-[0.7rem] text-muted-foreground">
                0% = disabled. Internal planning cash-flow reserve guide only;
                not a tax calculation or tax liability.
              </p>
            </F>
            {txt("signatoryName", "Signatory name")}
            {txt("signatoryTitle", "Signatory title")}
            {img("khqr", "KHQR code")}
            {img("signature", "Signature")}
          </div>
        </Glass>
      </div>
      <Glass delay={120} className="mt-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-lg font-bold">
              Services &amp; rates
            </h2>
            <span className="font-num text-xs text-muted-foreground">
              · {db.services.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Btn
              type="button"
              onClick={() => {
                if (!showServicesPanel) {
                  setShowServicesPanel(true);
                  setShowAllServices(false);
                } else if (!showAllServices && db.services.length > 3) {
                  setShowAllServices(true);
                } else {
                  setShowServicesPanel(false);
                  setShowAllServices(false);
                }
              }}
              aria-label={
                !showServicesPanel
                  ? "Show services"
                  : showAllServices
                    ? "Hide services"
                    : "Show all services"
              }
              title={
                !showServicesPanel
                  ? "Show services"
                  : showAllServices
                    ? "Hide services"
                    : `Show all ${db.services.length} services`
              }
              className="px-3 text-xs"
            >
              {showServicesPanel ? (
                <Eye className="h-3.5 w-3.5 text-primary" />
              ) : (
                <EyeOff className="h-3.5 w-3.5" />
              )}
              <span>
                {!showServicesPanel
                  ? "Show"
                  : showAllServices
                    ? "Hide"
                    : `Show all (${db.services.length})`}
              </span>
            </Btn>
            <Btn
              onClick={() =>
                setSvc({
                  id: uid(),
                  code: nextCode(
                    "SV-",
                    db.services.map((x) => x.code),
                  ),
                  pillar: PILLARS[0]!,
                  name: "",
                  unit: "Fixed fee",
                  rate: 0,
                  scope: "",
                  timeline: "",
                  overage: 0,
                })
              }
            >
              <Plus className="h-4 w-4" />
              Add
            </Btn>
          </div>
        </div>
        {showServicesPanel && (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(showAllServices ? db.services : db.services.slice(0, 3)).map(
                (x) => (
                  <button
                    key={x.id}
                    onClick={() => setSvc(x)}
                    className="rounded-2xl border border-border bg-muted/40 p-4 text-left transition-colors hover:border-primary/45 hover:bg-muted"
                  >
                    <p className="label-mono">{x.pillar}</p>
                    <p className="font-medium">{x.name}</p>
                    <p className="font-num text-sm text-primary">
                      {money(x.rate)}{" "}
                      <span className="text-xs text-muted-foreground">
                        {x.unit.toLowerCase()}
                      </span>
                    </p>
                  </button>
                ),
              )}
            </div>
            {db.services.length > 3 && !showAllServices && (
              <div className="mt-3 flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowAllServices(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                >
                  <Eye className="h-3.5 w-3.5" />
                  Show all {db.services.length} services
                </button>
              </div>
            )}
          </>
        )}
      </Glass>
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Glass delay={180} className="min-w-0">
          <h2 className="mb-3 font-display text-lg font-bold">Design terms</h2>
          <div className="space-y-3">
            {s.designTerms.map((t, i) => (
              <div key={i} className="space-y-1.5">
                <input
                  className="field font-medium"
                  value={t.label}
                  onChange={(e) =>
                    set(
                      "designTerms",
                      s.designTerms.map((x, j) =>
                        j === i ? { ...x, label: e.target.value } : x,
                      ),
                    )
                  }
                />
                <textarea
                  className="field min-h-16"
                  value={t.text}
                  onChange={(e) =>
                    set(
                      "designTerms",
                      s.designTerms.map((x, j) =>
                        j === i ? { ...x, text: e.target.value } : x,
                      ),
                    )
                  }
                />
              </div>
            ))}
          </div>
        </Glass>
        <Glass delay={240} className="min-w-0">
          <h2 className="mb-3 font-display text-lg font-bold">
            Payment terms & message
          </h2>
          <F label="Payment terms (one per line)">
            <textarea
              className="field min-h-24"
              value={s.paymentTerms.join("\n")}
              onChange={(e) => set("paymentTerms", e.target.value.split("\n"))}
            />
          </F>
          <F label="Thank-you note" className="mt-3">
            <textarea
              className="field min-h-20"
              value={s.thankYou}
              onChange={(e) => set("thankYou", e.target.value)}
            />
          </F>
        </Glass>
      </div>
      <EditModal
        item={svc}
        fields={sfields}
        title={svc?.code ?? ""}
        onClose={() => setSvc(null)}
        onSave={(v) =>
          setDB((d) => ({ ...d, services: upsert(d.services, v) }))
        }
        onDelete={
          db.services.some((x) => x.id === svc?.id)
            ? (v) =>
                setDB((d) => ({
                  ...d,
                  services: d.services.filter((x) => x.id !== v.id),
                }))
            : undefined
        }
      />
    </>
  );
}
