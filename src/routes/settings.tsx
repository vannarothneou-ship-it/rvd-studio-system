import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  Database,
  Download,
  Eye,
  EyeOff,
  Info,
  Plus,
  RotateCcw,
  Upload,
} from "lucide-react";
import { Btn, F, Glass, PageHeader, Stat } from "@/components/rv/ui";
import { EditModal, nextCode, upsert, type Field } from "@/components/rv/Crud";
import { exportMediaBlobs, restoreMediaBlobs } from "@/lib/media-store";
import {
  PILLARS,
  PRICING_UNITS,
  fileToDataUrl,
  getDB,
  money,
  resetDB,
  setDB,
  uid,
  useDB,
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

function Page() {
  const db = useDB((d) => d);
  const s = db.settings;
  const [svc, setSvc] = useState<Service | null>(null);
  const [showAllServices, setShowAllServices] = useState(false);
  const [showServicesPanel, setShowServicesPanel] = useState(true);
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
      const mediaIds = [
        ...snapshot.projects.flatMap((project) => project.media ?? []),
        ...(snapshot.workTasks ?? []).flatMap((task) => task.media ?? []),
        ...(snapshot.reminders ?? []).flatMap(
          (reminder) => reminder.media ?? [],
        ),
      ].map((media) => media.id);
      const mediaBlobs = await exportMediaBlobs(mediaIds);
      const backup = {
        ...snapshot,
        _backup: {
          format: "rothvan-studio",
          version: 2,
          exportedAt: new Date().toISOString(),
        },
        mediaBlobs,
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
        clients?: unknown;
        services?: unknown;
        projects?: unknown;
        invoices?: unknown;
        payments?: unknown;
        expenses?: unknown;
        goals?: unknown;
        personalIncome?: unknown;
        workTasks?: unknown;
        reminders?: unknown;
        learnedReceiptRules?: unknown;
        categoryLimits?: unknown;
        caseStudies?: unknown;
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

      const backupMediaCount = isObject(p.mediaBlobs)
        ? Object.keys(p.mediaBlobs).length
        : 0;
      const restoredMedia = isObject(p.mediaBlobs)
        ? await restoreMediaBlobs(p.mediaBlobs)
        : 0;

      setDB((prev) => ({
        ...prev,
        clients: p.clients as typeof prev.clients,
        services: p.services as typeof prev.services,
        projects: p.projects as typeof prev.projects,
        invoices: p.invoices as typeof prev.invoices,
        payments: p.payments as typeof prev.payments,
        expenses: p.expenses as typeof prev.expenses,
        personalIncome: Array.isArray(p.personalIncome)
          ? (p.personalIncome as typeof prev.personalIncome)
          : [],
        workTasks: Array.isArray(p.workTasks)
          ? (p.workTasks as typeof prev.workTasks)
          : [],
        reminders: Array.isArray(p.reminders)
          ? (p.reminders as NonNullable<typeof prev.reminders>)
          : [],
        learnedReceiptRules: Array.isArray(p.learnedReceiptRules)
          ? (p.learnedReceiptRules as NonNullable<
              typeof prev.learnedReceiptRules
            >)
          : [],
        goals: p.goals as typeof prev.goals,
        settings: {
          ...prev.settings,
          ...(p.settings as Partial<typeof prev.settings>),
        },
        categoryLimits: isObject(p.categoryLimits)
          ? (p.categoryLimits as NonNullable<typeof prev.categoryLimits>)
          : {},
        caseStudies: isObject(p.caseStudies)
          ? (p.caseStudies as NonNullable<typeof prev.caseStudies>)
          : {},
      }));
      toast.success(
        `Backup restored. ${restoredMedia} original attachments recovered.`,
      );
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
            value={String(db.personalIncome?.length ?? 0)}
            tone="pos"
          />
          <Stat label="Work Tasks" value={String(db.workTasks?.length ?? 0)} />
          <Stat label="Total Saved" value={String(totalRecords)} />
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
                value={s.dueDays}
                onChange={(e) => set("dueDays", Number(e.target.value))}
              />
            </F>
            <F label="KHR per USD">
              <input
                className="field"
                type="number"
                value={s.khrRate}
                onChange={(e) => set("khrRate", Number(e.target.value))}
              />
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
