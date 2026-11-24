import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  List,
  Plus,
  Search,
} from "lucide-react";
import {
  Btn,
  Empty,
  Glass,
  PageHeader,
  Pill,
  SlidingTabs,
  Stat,
} from "@/components/rv/ui";
import { EditModal, nextCode, upsert, type Field } from "@/components/rv/Crud";
import {
  EditLayoutButton,
  EditableBentoGrid,
  type BentoWidgetDef,
} from "@/components/rv/BentoGrid";
import {
  CLIENT_SOURCES,
  CLIENT_STATUSES,
  CLIENT_TYPES,
  clientBillingStats,
  clientDeleteBlocker,
  compactMoney,
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

const INITIAL_LIMIT = 9;

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
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showAll, setShowAll] = useState(false);
  const [editingLayout, setEditingLayout] = useState(false);
  const [edit, setEdit] = useState<Client | null>(null);

  const statsMap = useMemo(() => clientBillingStats(db), [db]);

  const stats = useCallback(
    (c: Client) => statsMap.get(c.id) ?? { billed: 0, owed: 0, projects: 0 },
    [statsMap],
  );

  const rows = useMemo(
    () =>
      db.clients.filter((c) =>
        [c.name, c.contact, c.code, c.position, c.email, c.phone, c.industry]
          .join(" ")
          .toLowerCase()
          .includes(q.toLowerCase()),
      ),
    [db.clients, q],
  );

  const visibleRows = showAll ? rows : rows.slice(0, INITIAL_LIMIT);
  const hasMore = rows.length > INITIAL_LIMIT;

  const blank = (): Client => ({
    id: uid(),
    code: nextCode(
      "RVD-",
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

  const widgets = useMemo<BentoWidgetDef[]>(
    () => [
      {
        id: "clientsTotal",
        title: "Clients total",
        defaultSpan: 4,
        render: () => (
          <Glass className="h-full">
            <Stat label="Clients" value={String(db.clients.length)} />
          </Glass>
        ),
      },
      {
        id: "clientsActive",
        title: "Active clients",
        defaultSpan: 4,
        render: () => (
          <Glass delay={60} className="h-full">
            <Stat
              label="Active"
              tone="pos"
              value={String(
                db.clients.filter((c) => c.status === "Active").length,
              )}
            />
          </Glass>
        ),
      },
      {
        id: "clientsLeads",
        title: "Leads",
        defaultSpan: 4,
        render: () => (
          <Glass delay={120} className="h-full">
            <Stat
              label="Leads"
              value={String(
                db.clients.filter((c) => c.status === "Lead").length,
              )}
            />
          </Glass>
        ),
      },
      {
        id: "clientsDirectory",
        title: "Client directory",
        defaultSpan: 12,
        render: () => (
          <Glass delay={180}>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  className="field pl-9"
                  placeholder="Search clients"
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value);
                    setShowAll(false);
                  }}
                />
              </div>
              <SlidingTabs
                size="xs"
                layoutGroup="clients-view-mode"
                value={viewMode}
                onChange={setViewMode}
                options={[
                  { id: "grid", label: "Grid", icon: LayoutGrid },
                  { id: "list", label: "List", icon: List },
                ]}
              />
            </div>
            {rows.length === 0 ? (
              <Empty>No clients yet.</Empty>
            ) : (
              <>
                {viewMode === "grid" ? (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {visibleRows.map((c) => {
                      const s = stats(c);
                      return (
                        <div
                          key={c.id}
                          className="flex flex-col justify-between rounded-xl border border-border bg-muted/40 p-4 transition-all hover:border-primary/50 hover:bg-muted"
                        >
                          <button
                            type="button"
                            onClick={() => setEdit(c)}
                            className="block w-full text-left"
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
                              <p className="font-num text-xs text-muted-foreground">
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
                                {c.email ||
                                  c.telegram ||
                                  c.phone ||
                                  c.industry ||
                                  c.type}
                              </p>
                            </div>
                            <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                              <div>
                                <p className="label-mono">Projects</p>
                                <p className="font-num">{s.projects}</p>
                              </div>
                              <div title={money(s.billed)}>
                                <p className="label-mono">Billed</p>
                                <p className="font-num">
                                  {compactMoney(s.billed)}
                                </p>
                              </div>
                              <div title={money(s.owed)}>
                                <p className="label-mono">Owed</p>
                                <p
                                  className={
                                    s.owed > 0
                                      ? "font-num text-destructive"
                                      : "font-num"
                                  }
                                >
                                  {compactMoney(s.owed)}
                                </p>
                              </div>
                            </div>
                          </button>

                          <div className="mt-3 flex items-center gap-2 border-t border-border/60 pt-2.5">
                            <Link
                              to="/invoices/$id"
                              params={{ id: "new" }}
                              search={{ client: c.id, kind: "Quotation" }}
                              className="inline-flex min-h-[34px] flex-1 items-center justify-center gap-1 whitespace-nowrap rounded-lg border border-border bg-secondary/80 px-2.5 text-xs font-medium text-foreground transition-colors hover:border-primary/45 hover:text-primary"
                            >
                              <Plus className="h-3 w-3 shrink-0" />
                              Quote
                            </Link>
                            <Link
                              to="/invoices/$id"
                              params={{ id: "new" }}
                              search={{ client: c.id, kind: "Invoice" }}
                              className="inline-flex min-h-[34px] flex-1 items-center justify-center gap-1 whitespace-nowrap rounded-lg border border-primary/35 bg-primary/12 px-2.5 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                            >
                              <Plus className="h-3 w-3 shrink-0" />
                              Invoice
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <ul className="divide-y divide-border">
                    {visibleRows.map((c) => {
                      const s = stats(c);
                      return (
                        <li key={c.id}>
                          <button
                            type="button"
                            onClick={() => setEdit(c)}
                            className="flex w-full flex-wrap items-center justify-between gap-3 rounded-lg px-2 py-3 text-left transition-colors hover:bg-muted/60 sm:flex-nowrap"
                          >
                            <div className="flex min-w-0 flex-1 items-center gap-3">
                              {c.avatar ? (
                                <img
                                  src={c.avatar}
                                  alt={c.name}
                                  className="h-10 w-10 shrink-0 rounded-lg object-cover"
                                />
                              ) : (
                                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/15 font-display text-sm font-bold text-primary">
                                  {c.name.slice(0, 2).toUpperCase()}
                                </span>
                              )}
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-num text-xs text-muted-foreground">
                                    {c.code}
                                  </span>
                                  <span className="truncate text-sm font-semibold text-foreground">
                                    {c.name || "Untitled"}
                                  </span>
                                </div>
                                <p className="truncate text-xs text-muted-foreground">
                                  {c.contact || "—"}
                                  {c.position ? ` · ${c.position}` : ""}
                                  {c.email || c.telegram || c.phone
                                    ? ` · ${c.email || c.telegram || c.phone}`
                                    : ""}
                                </p>
                              </div>
                            </div>

                            <div className="flex shrink-0 items-center gap-4 pl-13 sm:pl-0">
                              <div className="text-right text-xs">
                                <p className="font-num font-semibold text-foreground">
                                  {compactMoney(s.billed)} billed
                                </p>
                                <p className="font-num text-muted-foreground">
                                  {s.projects}{" "}
                                  {s.projects === 1 ? "project" : "projects"}
                                  {s.owed > 0 ? (
                                    <span className="ml-1.5 text-destructive">
                                      · {compactMoney(s.owed)} owed
                                    </span>
                                  ) : null}
                                </p>
                              </div>
                              <Pill s={c.status} />
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
                {hasMore && (
                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/70 pt-3 text-xs text-muted-foreground">
                    <span>
                      Showing {visibleRows.length} of {rows.length} clients
                    </span>
                    <Btn
                      type="button"
                      onClick={() => setShowAll((s) => !s)}
                      className="px-3.5 py-1.5 text-xs"
                    >
                      {showAll ? (
                        <>
                          <ChevronUp className="h-3.5 w-3.5" />
                          Hide ({rows.length - INITIAL_LIMIT})
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3.5 w-3.5" />
                          Show all ({rows.length})
                        </>
                      )}
                    </Btn>
                  </div>
                )}
              </>
            )}
          </Glass>
        ),
      },
    ],
    [db, q, viewMode, rows, visibleRows, hasMore, showAll, stats],
  );

  return (
    <>
      <PageHeader
        title="Clients"
        owner={db.settings.ownerName}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <EditLayoutButton
              editing={editingLayout}
              onToggle={() => setEditingLayout((e) => !e)}
            />
            <Btn variant="gold" onClick={() => setEdit(blank())}>
              <Plus className="h-4 w-4" />
              New client
            </Btn>
          </div>
        }
      />

      <EditableBentoGrid
        pageKey="clients"
        widgets={widgets}
        editing={editingLayout}
        onToggleEditing={() => setEditingLayout((e) => !e)}
        onDoneEditing={() => setEditingLayout(false)}
      />

      <EditModal
        presentation="drawer"
        side="right"
        item={edit}
        fields={fields}
        subtitle={edit?.type || "Client"}
        title={edit?.name || edit?.code || "Client"}
        onClose={() => setEdit(null)}
        onSave={(v) => setDB((d) => ({ ...d, clients: upsert(d.clients, v) }))}
        onDelete={
          db.clients.some((c) => c.id === edit?.id)
            ? (v) => {
                const blocker = clientDeleteBlocker(db, v.id);
                if (blocker) {
                  toast.error(blocker);
                  return false;
                }
                setDB((d) => ({
                  ...d,
                  clients: d.clients.filter((c) => c.id !== v.id),
                }));
                toast.success("Client deleted");
                return true;
              }
            : undefined
        }
      />
    </>
  );
}
