import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Btn, Empty, Glass, PageHeader, Pill, Stat } from "@/components/rv/ui";
import { EditModal, nextCode, upsert, type Field } from "@/components/rv/Crud";
import {
  CLIENT_SOURCES,
  CLIENT_STATUSES,
  CLIENT_TYPES,
  invoiceView,
  money,
  setDB,
  uid,
  useDB,
  type Client,
} from "@/lib/store";

export const Route = createFileRoute("/clients")({
  head: () => ({
    meta: [
      { title: "Clients · RothVan Studio" },
      {
        name: "description",
        content: "Client directory and billing history for RothVan Design.",
      },
      { property: "og:title", content: "Clients · RothVan Studio" },
      {
        property: "og:description",
        content: "Client directory and billing history for RothVan Design.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const fields: Field<Client>[] = [
  {
    k: "avatar",
    label: "Profile image / company logo",
    type: "image",
    wide: true,
  },
  { k: "name", label: "Business name", wide: true },
  { k: "contact", label: "Contact person" },
  { k: "position", label: "Position / job title" },
  { k: "industry", label: "Industry" },
  { k: "type", label: "Type", type: "select", options: CLIENT_TYPES },
  { k: "status", label: "Status", type: "select", options: CLIENT_STATUSES },
  { k: "source", label: "Source", type: "select", options: CLIENT_SOURCES },
  { k: "phone", label: "Phone" },
  { k: "email", label: "Email" },
  { k: "telegram", label: "Telegram" },
  { k: "website", label: "Website" },
  { k: "taxId", label: "Tax / registration ID" },
  { k: "address", label: "Billing address", wide: true },
  {
    k: "preferredContact",
    label: "Preferred contact",
    type: "select",
    options: ["Telegram", "Email", "Phone", "WhatsApp"],
  },
  { k: "notes", label: "Notes", type: "textarea" },
];

function Page() {
  const db = useDB((d) => d);
  const [q, setQ] = useState("");
  const [edit, setEdit] = useState<Client | null>(null);
  const stats = (c: Client) => {
    const inv = db.invoices
      .filter((i) => i.clientId === c.id)
      .map((i) => invoiceView(i, db));
    return {
      billed: inv.reduce((a, v) => a + v.totalUSD, 0),
      owed: inv
        .filter((v) => v.status !== "Draft")
        .reduce((a, v) => a + v.balanceUSD, 0),
      projects: db.projects.filter((p) => p.clientId === c.id).length,
    };
  };
  const rows = db.clients.filter((c) =>
    [c.name, c.contact, c.code, c.position, c.email, c.phone, c.industry]
      .join(" ")
      .toLowerCase()
      .includes(q.toLowerCase()),
  );
  const blank = (): Client => ({
    id: uid(),
    code: nextCode(
      "CL-",
      db.clients.map((c) => c.code),
    ),
    name: "",
    type: "SME",
    industry: "",
    contact: "",
    email: "",
    telegram: "",
    phone: "",
    source: "Referral",
    status: "Lead",
    notes: "",
  });
  return (
    <>
      <PageHeader
        title="Clients"
        owner={db.settings.ownerName}
        action={
          <Btn variant="gold" onClick={() => setEdit(blank())}>
            <Plus className="h-4 w-4" />
            New client
          </Btn>
        }
      />
      <div className="mb-4 grid grid-cols-3 gap-4">
        <Glass>
          <Stat label="Clients" value={String(db.clients.length)} />
        </Glass>
        <Glass delay={60}>
          <Stat
            label="Active"
            tone="pos"
            value={String(
              db.clients.filter((c) => c.status === "Active").length,
            )}
          />
        </Glass>
        <Glass delay={120}>
          <Stat
            label="Leads"
            value={String(db.clients.filter((c) => c.status === "Lead").length)}
          />
        </Glass>
      </div>
      <Glass delay={180}>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            className="field pl-9"
            placeholder="Search clients"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        {rows.length === 0 ? (
          <Empty>No clients yet.</Empty>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((c, k) => {
              const s = stats(c);
              return (
                <Btn
                  key={c.id}
                  onClick={() => setEdit(c)}
                  className="rise block rounded-lg bg-muted/40 p-4 text-left transition-all hover:-translate-y-0.5 hover:bg-muted"
                  style={{ animationDelay: `${k * 40}ms` }}
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    {c.avatar ? (
                      <img
                        src={c.avatar}
                        alt={c.name}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                    ) : (
                      <span className="grid h-12 w-12 place-items-center rounded-lg bg-primary/15 font-display text-lg text-primary">
                        {c.name.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                    <Pill s={c.status} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-mono text-xs text-muted-foreground">
                      {c.code}
                    </p>
                    <p className="truncate font-display text-lg font-bold">
                      {c.name || "Untitled"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {c.contact || "—"}
                      {c.position ? ` · ${c.position}` : ""}
                    </p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {c.email || c.telegram || c.phone || c.industry || c.type}
                    </p>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="label-mono">Projects</p>
                      <p className="font-mono">{s.projects}</p>
                    </div>
                    <div>
                      <p className="label-mono">Billed</p>
                      <p className="font-mono">{money(s.billed)}</p>
                    </div>
                    <div>
                      <p className="label-mono">Owed</p>
                      <p
                        className={
                          s.owed > 0
                            ? "font-mono text-destructive"
                            : "font-mono"
                        }
                      >
                        {money(s.owed)}
                      </p>
                    </div>
                  </div>
                </Btn>
              );
            })}
          </div>
        )}
      </Glass>
      <EditModal
        item={edit}
        fields={fields}
        title={edit?.code ?? ""}
        onClose={() => setEdit(null)}
        onSave={(v) => setDB((d) => ({ ...d, clients: upsert(d.clients, v) }))}
        onDelete={
          db.clients.some((c) => c.id === edit?.id)
            ? (v) =>
                setDB((d) => ({
                  ...d,
                  clients: d.clients.filter((c) => c.id !== v.id),
                }))
            : undefined
        }
      />
    </>
  );
}
