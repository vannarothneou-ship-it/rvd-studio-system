import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Btn, Empty, Glass, PageHeader, Sel } from "@/components/rv/ui";
import { EditModal, nextCode, upsert, type Field } from "@/components/rv/Crud";
import {
  PILLARS,
  PRICING_UNITS,
  money,
  setDB,
  uid,
  useDB,
  type Service,
} from "@/lib/store";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services · RothVan Studio" },
      {
        name: "description",
        content:
          "Manage design packages, rates, scope and timelines for RothVan Studio.",
      },
      { property: "og:title", content: "Services · RothVan Studio" },
      {
        property: "og:description",
        content: "Design packages, pricing and deliverables in one catalogue.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Services,
});

const fields: Field<Service>[] = [
  { k: "name", label: "Service name", wide: true },
  { k: "code", label: "Code" },
  { k: "pillar", label: "Pillar", type: "select", options: PILLARS },
  { k: "unit", label: "Pricing unit", type: "select", options: PRICING_UNITS },
  { k: "rate", label: "Rate (USD)", type: "number" },
  { k: "overage", label: "Extra revision (USD)", type: "number" },
  { k: "timeline", label: "Timeline" },
  { k: "scope", label: "Included deliverables", type: "textarea" },
];
function Services() {
  const db = useDB((d) => d);
  const [q, setQ] = useState("");
  const [pillar, setPillar] = useState("All");
  const [edit, setEdit] = useState<Service | null>(null);
  const rows = db.services.filter(
    (s) =>
      (pillar === "All" || s.pillar === pillar) &&
      `${s.code} ${s.name} ${s.scope}`.toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <>
      <PageHeader
        title="Services"
        owner={db.settings.ownerName}
        action={
          <Btn
            variant="gold"
            onClick={() =>
              setEdit({
                id: uid(),
                code: nextCode(
                  "SV-",
                  db.services.map((s) => s.code),
                ),
                pillar: PILLARS[0] ?? "",
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
            New service
          </Btn>
        }
      />
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <input
            className="field pl-9"
            placeholder="Search services"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="sm:w-56">
          <Sel
            value={pillar}
            onChange={setPillar}
            options={["All", ...PILLARS]}
          />
        </div>
      </div>
      {rows.length === 0 ? (
        <Empty>No matching services.</Empty>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((s) => (
            <Glass key={s.id} className="flex flex-col">
              <p className="label-mono">
                {s.code} · {s.pillar}
              </p>
              <h2 className="mt-2 font-display text-lg font-bold">{s.name}</h2>
              <p className="mt-3 font-mono text-xl text-primary">
                {money(s.rate)}{" "}
                <span className="text-xs text-muted-foreground">{s.unit}</span>
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {s.timeline || "Timeline not set"}
              </p>
              <ul className="my-4 flex-1 space-y-1 text-sm">
                {s.scope
                  .split("\n")
                  .filter(Boolean)
                  .map((l, i) => (
                    <li key={i}>· {l}</li>
                  ))}
              </ul>
              <div className="flex flex-wrap gap-2">
                <Btn onClick={() => setEdit(s)}>Edit</Btn>
                <Link
                  to="/invoices/$id"
                  params={{ id: "new" }}
                  search={{ service: s.id, kind: "Quotation" }}
                >
                  <Btn variant="gold">Quote</Btn>
                </Link>
              </div>
            </Glass>
          ))}
        </div>
      )}
      <EditModal
        item={edit}
        fields={fields}
        title={edit?.code ?? "Service"}
        onClose={() => setEdit(null)}
        onSave={(v) =>
          setDB((d) => ({ ...d, services: upsert(d.services, v) }))
        }
        onDelete={
          db.services.some((s) => s.id === edit?.id)
            ? (v) => {
                if (db.projects.some((p) => p.serviceId === v.id)) {
                  alert(
                    "This service is used by a project. Keep it or change the project's service first.",
                  );
                  return;
                }
                setDB((d) => ({
                  ...d,
                  services: d.services.filter((s) => s.id !== v.id),
                }));
              }
            : undefined
        }
      />
    </>
  );
}
