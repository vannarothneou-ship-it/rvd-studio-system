import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Download, Plus, Upload } from "lucide-react";
import { Btn, F, Glass, PageHeader } from "@/components/rv/ui";
import { EditModal, nextCode, upsert, type Field } from "@/components/rv/Crud";
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
    <F label={label}>
      <div className="flex items-center gap-3">
        <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-xl border border-dashed border-border bg-muted">
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
        <div className="flex flex-col gap-1.5">
          <input
            type="file"
            accept="image/*"
            className="text-xs file:mr-2 file:rounded-full file:border-0 file:bg-secondary file:px-3 file:py-1 file:text-foreground"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (f) set(k, await fileToDataUrl(f, 600));
            }}
          />
          {s[k] && (
            <button
              className="self-start text-xs text-destructive"
              onClick={() => set(k, "")}
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </F>
  );
  const exportData = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob([JSON.stringify(getDB())], { type: "application/json" }),
    );
    a.download = `rothvan-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };
  const importData = async (f: File) => {
    try {
      const p = JSON.parse(await f.text());
      if (!p.settings) throw 0;
      setDB(() => p);
      alert("Backup restored.");
    } catch {
      alert("That file isn't a RothVan backup.");
    }
  };
  return (
    <>
      <PageHeader title="Settings" owner={s.ownerName} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Glass>
          <h2 className="mb-4 font-display text-lg font-bold">Business</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {txt("businessName", "Business name")}
            {txt("ownerName", "Your first name")}
            {txt("phones", "Phone numbers", true)}
            {txt("email", "Email")}
            {txt("website", "Website")}
            {txt("address", "Address", true)}
            {img("logo", "Logo")}
          </div>
        </Glass>
        <Glass delay={60}>
          <h2 className="mb-4 font-display text-lg font-bold">
            Payment & signature
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
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
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Services & rates</h2>
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
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {db.services.map((x) => (
            <button
              key={x.id}
              onClick={() => setSvc(x)}
              className="rounded-2xl border border-border bg-muted/40 p-4 text-left hover:bg-muted"
            >
              <p className="label-mono">{x.pillar}</p>
              <p className="font-medium">{x.name}</p>
              <p className="font-mono text-sm text-primary">
                {money(x.rate)}{" "}
                <span className="text-xs text-muted-foreground">
                  {x.unit.toLowerCase()}
                </span>
              </p>
            </button>
          ))}
        </div>
      </Glass>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Glass delay={180}>
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
        <Glass delay={240}>
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
          <p className="label-mono mb-2 mt-4">Backup</p>
          <div className="flex flex-wrap gap-2">
            <Btn onClick={exportData}>
              <Download className="h-4 w-4" />
              Download backup
            </Btn>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-secondary px-4 py-2 text-sm hover:bg-accent">
              <Upload className="h-4 w-4" />
              Restore
              <input
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) =>
                  e.target.files?.[0] && importData(e.target.files[0])
                }
              />
            </label>
            <Btn
              variant="danger"
              onClick={() =>
                confirm("Erase everything and restore sample data?") &&
                resetDB()
              }
            >
              Reset
            </Btn>
          </div>
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
