import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowUp,
  Briefcase,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  Eye,
  EyeOff,
  FilePlus2,
  FileText,
  FolderKanban,
  ImagePlus,
  Layers,
  Plus,
  Trash2,
  Upload,
  Users,
  Wallet,
} from "lucide-react";
import { InvoiceDoc } from "@/components/rv/InvoiceDoc";
import {
  Btn,
  F,
  Glass,
  Modal,
  Pill,
  Sel,
  SlidingTabs,
} from "@/components/rv/ui";
import {
  DOCUMENT_TYPES,
  PAY_METHODS,
  addDays,
  convertDocument,
  deletePayment,
  documentKind,
  fileToDataUrl,
  getDB,
  invoiceView,
  isInvoice,
  money,
  nextInvoiceNo,
  reconcileProjects,
  recordPayment,
  safeKhrRate,
  saveDocument,
  serviceItem,
  setDB,
  shortDate,
  today,
  uid,
  useDB,
  type DocumentType,
  type Invoice,
  type Item,
} from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/invoices/$id")({
  validateSearch: (
    s: Record<string, unknown>,
  ): {
    client?: string;
    project?: string;
    service?: string;
    kind?: DocumentType;
  } => ({
    ...(typeof s["client"] === "string" ? { client: s["client"] } : {}),
    ...(typeof s["project"] === "string" ? { project: s["project"] } : {}),
    ...(typeof s["service"] === "string" ? { service: s["service"] } : {}),
    ...(DOCUMENT_TYPES.includes(s["kind"] as DocumentType)
      ? { kind: s["kind"] as DocumentType }
      : {}),
  }),
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { title: "Document editor · RothVan Studio" },
      {
        name: "description",
        content:
          "Edit quotations, agreements, invoices, and delivery notes with a live A4 preview.",
      },
      { property: "og:title", content: "Document editor · RothVan Studio" },
      {
        property: "og:description",
        content:
          "Edit quotations, agreements, invoices, and delivery notes with a live A4 preview.",
      },
    ],
  }),
  component: Editor,
});

const blankItem = (): Item => ({
  id: uid(),
  description: "",
  scope: "",
  timeline: "",
  qty: 1,
  price: 0,
});

function makeNew(search: {
  client?: string;
  project?: string;
  service?: string;
  kind?: DocumentType;
}): Invoice {
  const db = getDB();
  const issue = today();
  const proj = db.projects.find((p) => p.id === search.project);
  const svc = db.services.find(
    (s) => s.id === (search.service ?? proj?.serviceId),
  );
  const item = svc
    ? {
        ...serviceItem(svc, "USD", safeKhrRate(db.settings.khrRate)),
        price: proj?.quote || svc.rate,
      }
    : blankItem();
  return {
    id: uid(),
    kind: search.kind ?? "Invoice",
    no: nextInvoiceNo(issue, db.invoices, search.kind),
    clientId: search.client ?? proj?.clientId ?? "",
    projectId: proj?.id ?? "",
    issue,
    due: addDays(issue, db.settings.dueDays),
    currency: "USD",
    discount: 0,
    sent: false,
    showSchedule: search.kind !== "Delivery note",
    includeTerms: true,
    includeRates: true,
    notes: "",
    items: [item],
    images: [],
    response: "Pending",
  };
}

function Editor() {
  const { id } = Route.useParams();
  const search = Route.useSearch();
  const nav = useNavigate();
  const db = useDB((d) => d);
  const stored = db.invoices.find((i) => i.id === id);
  const [draft, setDraft] = useState<Invoice>(() => stored ?? makeNew(search));
  useEffect(() => {
    if (stored) setDraft(stored);
  }, [stored]);
  const [tab, setTab] = useState<"form" | "preview">("form");
  const [payOpen, setPayOpen] = useState(false);
  const [newClient, setNewClient] = useState(false);
  const [followNote, setFollowNote] = useState("");
  const kind = documentKind(draft);
  type SectionKey =
    "details" | "signatures" | "items" | "photos" | "totals" | "payments";
  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>(
    {
      details: true,
      signatures: kind === "Agreement" || kind === "Delivery note",
      items: true,
      photos: false,
      totals: true,
      payments: true,
    },
  );
  const toggleSection = (key: SectionKey) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  const setAllSections = (open: boolean) =>
    setOpenSections({
      details: open,
      signatures: open,
      items: open,
      photos: open,
      totals: open,
      payments: open,
    });
  const anyClosed = Object.values(openSections).some((x) => !x);
  const resetKey = `${id}|${search.kind ?? ""}|${search.client ?? ""}|${search.project ?? ""}|${search.service ?? ""}`;
  const prevResetKeyRef = useRef<string>(resetKey);
  useEffect(() => {
    if (prevResetKeyRef.current === resetKey) return;
    prevResetKeyRef.current = resetKey;
    if (id === "new") {
      setDraft(makeNew(search));
    } else if (stored) {
      setDraft(stored);
    }
  }, [resetKey, id, search, stored]);
  const isNew = !stored;
  const v = invoiceView(draft, db);
  const up = (p: Partial<Invoice>) => setDraft((d) => ({ ...d, ...p }));
  const upItem = (iid: string, p: Partial<Item>) =>
    setDraft((d) => ({
      ...d,
      items: d.items.map((x) => (x.id === iid ? { ...x, ...p } : x)),
    }));

  const save = (extra: Partial<Invoice> = {}) => {
    const inv = { ...draft, ...extra };
    if (!inv.clientId || !inv.items.some((it) => it.description.trim())) {
      toast.error("Choose a client and add an item description.");
      return undefined;
    }
    try {
      setDB((d) => saveDocument(d, inv));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Unable to save");
      return undefined;
    }
    const saved = getDB().invoices.find((i) => i.id === inv.id) ?? inv;
    setDraft(saved);
    if (isNew)
      nav({ to: "/invoices/$id", params: { id: inv.id }, replace: true });
    return saved;
  };

  const acceptAndConvert = (nextKind: DocumentType) => {
    const patch: Partial<Invoice> =
      kind === "Invoice"
        ? { sent: true }
        : {
            sent: true,
            response: "Accepted",
            confirmedOn: draft.confirmedOn || today(),
            confirmedBy:
              draft.confirmedBy || client?.contact || client?.name || "",
          };
    const source = save(patch);
    if (!source) return;
    const copy = convertDocument(
      source,
      nextKind,
      getDB().invoices,
      today(),
      db.settings.dueDays,
    );
    setDB((d) => saveDocument(d, copy));
    toast.success(`Created ${nextKind.toLowerCase()} ${copy.no}`);
    nav({ to: "/invoices/$id", params: { id: copy.id } });
  };

  const client = db.clients.find((c) => c.id === draft.clientId);
  const project = db.projects.find((p) => p.id === draft.projectId);
  const relatedDocs = project
    ? db.invoices.filter((i) => i.projectId === project.id)
    : db.invoices.filter(
        (i) => i.sourceId === draft.id || i.id === draft.sourceId,
      );
  const pays = db.payments.filter((p) => p.invoiceId === draft.id);
  const fileRef = useRef<HTMLInputElement>(null);
  const sigRef = useRef<HTMLInputElement>(null);

  const addImages = async (files: FileList | null) => {
    if (!files) return;
    const room = 6 - draft.images.length;
    const list = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, room);
    const imgs = await Promise.all(
      list.map(async (f) => ({
        id: uid(),
        src: await fileToDataUrl(f, 1000),
        caption: "",
      })),
    );
    up({ images: [...draft.images, ...imgs] });
    if (files.length > room) toast("Up to 6 photos per invoice.");
  };
  const move = <T,>(arr: T[], i: number, d: number) => {
    const a = [...arr];
    const j = i + d;
    const first = a[i];
    const second = a[j];
    if (first === undefined || second === undefined) return a;
    a[i] = second;
    a[j] = first;
    return a;
  };

  const telegram = () => {
    const msg =
      kind === "Quotation" && draft.sent
        ? `Hello ${client?.contact || client?.name || ""}, following up on quotation ${draft.no} for ${project?.name || draft.items[0]?.description || "your project"}. Would you like to proceed, adjust the scope, or pause for now? The quotation is valid until ${shortDate(draft.due)}.`
        : `Hello ${client?.contact || client?.name || ""}, here is your ${kind.toLowerCase()} ${draft.no} for ${project?.name || draft.items[0]?.description || "your project"}.${kind !== "Delivery note" ? ` Total ${money(v.total, draft.currency)}.` : ""}`;
    navigator.clipboard
      .writeText(msg)
      .then(() => toast.success("Telegram message copied"));
  };
  const duplicate = () => {
    const issue = today();
    const copy = convertDocument(
      draft,
      kind,
      getDB().invoices,
      issue,
      db.settings.dueDays,
    );
    setDB((d) => ({ ...d, invoices: [...d.invoices, copy] }));
    toast.success("Duplicated as " + copy.no);
    nav({ to: "/invoices/$id", params: { id: copy.id } });
  };
  const del = () => {
    if (!confirm("Delete this document and its payments?")) return;
    setDB((d) =>
      reconcileProjects({
        ...d,
        invoices: d.invoices.filter((i) => i.id !== draft.id),
        payments: d.payments.filter((p) => p.invoiceId !== draft.id),
      }),
    );
    nav({ to: "/invoices" });
  };

  const SectionToggleHeader = ({
    section,
    title,
    summary,
    rightExtra,
  }: {
    section: SectionKey;
    title: string;
    summary: string;
    rightExtra?: React.ReactNode;
  }) => {
    const isOpen = openSections[section];
    return (
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-2",
          isOpen && "mb-3 border-b border-border/60 pb-2.5",
        )}
      >
        <button
          type="button"
          onClick={() => toggleSection(section)}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <span className="font-medium text-foreground">{title}</span>
          {!isOpen && summary && (
            <span className="font-num truncate text-xs text-muted-foreground">
              · {summary}
            </span>
          )}
        </button>
        <div className="flex shrink-0 items-center gap-1.5">
          {rightExtra}
          <button
            type="button"
            onClick={() => toggleSection(section)}
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[0.7rem] font-medium transition-colors",
              isOpen
                ? "border-border bg-muted/60 text-muted-foreground hover:text-foreground"
                : "border-primary/40 bg-primary/12 text-primary hover:bg-primary/20",
            )}
          >
            {isOpen ? (
              <>
                <ChevronUp className="h-3 w-3" />
                Hide
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3" />
                Show
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  const form = (
    <div className="space-y-3.5">
      {/* Quick Section Show/Hide Controls */}
      <div className="glass flex flex-wrap items-center justify-between gap-2 rounded-2xl px-3.5 py-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              ["details", "Details"],
              ["signatures", "Signature"],
              ["items", `Items (${draft.items.length})`],
              ["photos", `Photos (${draft.images.length})`],
              ["totals", "Totals"],
              ...(!isNew && isInvoice(draft)
                ? ([["payments", `Payments (${pays.length})`]] as const)
                : []),
            ] as const
          ).map(([key, label]) => {
            const active = openSections[key];
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleSection(key)}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[0.7rem] font-medium transition-colors",
                  active
                    ? "border-primary/50 bg-primary/15 text-primary"
                    : "border-border bg-muted/40 text-muted-foreground hover:text-foreground",
                )}
              >
                {active ? (
                  <Eye className="h-3 w-3" />
                ) : (
                  <EyeOff className="h-3 w-3" />
                )}
                <span>{label}</span>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => setAllSections(anyClosed)}
          className="shrink-0 rounded-full border border-border px-2.5 py-1 text-[0.7rem] font-medium text-muted-foreground hover:border-primary/40 hover:text-foreground"
        >
          {anyClosed ? "Show all" : "Hide all"}
        </button>
      </div>

      <Glass>
        <SectionToggleHeader
          section="details"
          title="Document details"
          summary={`${kind} · ${client?.name || "No client"} · Due ${shortDate(draft.due)}`}
        />
        {openSections.details && (
          <div className="grid gap-3 sm:grid-cols-2">
            <F label="Document type">
              <Sel
                value={kind}
                onChange={(x) => {
                  const k = x as DocumentType;
                  if (!isNew) return;
                  up({
                    kind: k,
                    no: nextInvoiceNo(draft.issue, db.invoices, k),
                    showSchedule: k !== "Delivery note",
                  });
                }}
                options={isNew ? [...DOCUMENT_TYPES] : [kind]}
              />
            </F>
            <F label="Document no.">
              <input
                className="field font-num"
                value={draft.no}
                onChange={(e) => up({ no: e.target.value })}
              />
            </F>
            <F label="Currency">
              <Sel
                value={draft.currency}
                onChange={(x) => {
                  const currency = x as "USD" | "KHR";
                  if (currency === draft.currency) return;
                  const rate = safeKhrRate(
                    draft.exchangeRate ?? db.settings.khrRate,
                  );
                  up({
                    currency,
                    exchangeRate: rate,
                    items: draft.items.map((it) => ({
                      ...it,
                      price:
                        currency === "KHR"
                          ? Math.round(it.price * rate)
                          : Math.round((it.price / rate) * 100) / 100,
                    })),
                  });
                }}
                options={["USD", "KHR"]}
              />
            </F>
            <F label="Client">
              <div className="flex min-w-0 gap-2">
                <div className="min-w-0 flex-1">
                  <Sel
                    value={draft.clientId}
                    onChange={(x) => {
                      const currentProj = db.projects.find(
                        (p) => p.id === draft.projectId,
                      );
                      up({
                        clientId: x,
                        ...(currentProj && currentProj.clientId !== x
                          ? { projectId: "" }
                          : {}),
                      });
                    }}
                    placeholder="Choose client"
                    options={db.clients.map((c) => ({
                      value: c.id,
                      label: c.name,
                    }))}
                  />
                </div>
                <button
                  onClick={() => setNewClient(true)}
                  className="shrink-0 rounded-xl border border-border px-3 hover:bg-accent"
                  aria-label="Add client"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </F>
            <F label="Project (auto-created on send if blank)">
              <Sel
                value={draft.projectId}
                onChange={(x) => {
                  const p = db.projects.find((proj) => proj.id === x);
                  const s = db.services.find((svc) => svc.id === p?.serviceId);
                  up({
                    projectId: x,
                    ...(p ? { clientId: p.clientId } : {}),
                    ...(s && !draft.items.some((i) => i.description.trim())
                      ? {
                          items: [
                            {
                              ...serviceItem(
                                s,
                                draft.currency,
                                safeKhrRate(db.settings.khrRate),
                              ),
                              price: p?.quote
                                ? draft.currency === "KHR"
                                  ? Math.round(
                                      p.quote *
                                        safeKhrRate(db.settings.khrRate),
                                    )
                                  : p.quote
                                : serviceItem(
                                    s,
                                    draft.currency,
                                    safeKhrRate(db.settings.khrRate),
                                  ).price,
                            },
                          ],
                        }
                      : {}),
                  });
                }}
                placeholder="None (auto-create on send)"
                options={db.projects
                  .filter(
                    (p) => !draft.clientId || p.clientId === draft.clientId,
                  )
                  .map((p) => ({
                    value: p.id,
                    label: `${p.code} · ${p.name}`,
                  }))}
              />
            </F>
            <F label="Issue date">
              <input
                type="date"
                className="field"
                value={draft.issue}
                onChange={(e) => {
                  const issue = e.target.value;
                  up({
                    issue,
                    due: addDays(issue, db.settings.dueDays),
                    ...(isNew
                      ? { no: nextInvoiceNo(issue, db.invoices, kind) }
                      : {}),
                  });
                }}
              />
            </F>
            <F
              label={
                kind === "Quotation"
                  ? "Valid until"
                  : kind === "Delivery note"
                    ? "Delivery date"
                    : "Due date"
              }
            >
              <input
                type="date"
                className="field"
                value={draft.due}
                onChange={(e) => up({ due: e.target.value })}
              />
            </F>
          </div>
        )}
      </Glass>

      <Glass>
        <SectionToggleHeader
          section="signatures"
          title={
            kind === "Quotation"
              ? "Response, follow-up & signature"
              : kind === "Agreement"
                ? "Agreement & signatures"
                : kind === "Delivery note"
                  ? "Delivery & receipt signatures"
                  : "Client signature & confirmation"
          }
          summary={
            draft.confirmedBy
              ? `Signed by ${draft.confirmedBy}`
              : draft.response || "Optional"
          }
        />
        {openSections.signatures && (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              {!isInvoice(draft) && (
                <F label="Client response">
                  <Sel
                    value={draft.response ?? "Pending"}
                    onChange={(x) =>
                      up({ response: x as "Pending" | "Accepted" | "Declined" })
                    }
                    options={[
                      { value: "Pending", label: "Awaiting response" },
                      {
                        value: "Accepted",
                        label:
                          kind === "Agreement"
                            ? "Signed (recorded)"
                            : kind === "Delivery note"
                              ? "Received"
                              : "Accepted",
                      },
                      { value: "Declined", label: "Declined" },
                    ]}
                  />
                </F>
              )}
              {kind === "Quotation" && (
                <F label="Next follow-up">
                  <input
                    type="date"
                    className="field"
                    value={draft.followUp ?? ""}
                    onChange={(e) => up({ followUp: e.target.value })}
                  />
                </F>
              )}
              <F
                label={
                  kind === "Delivery note"
                    ? "Received by (client signatory)"
                    : "Client signatory"
                }
              >
                <input
                  className="field"
                  placeholder={
                    client?.contact ||
                    client?.name ||
                    "Authorized representative"
                  }
                  value={draft.confirmedBy ?? ""}
                  onChange={(e) => up({ confirmedBy: e.target.value })}
                />
              </F>
              <F
                label={
                  kind === "Delivery note"
                    ? "Received on"
                    : "Signed / confirmed on"
                }
              >
                <input
                  type="date"
                  className="field"
                  value={draft.confirmedOn ?? ""}
                  onChange={(e) => up({ confirmedOn: e.target.value })}
                />
              </F>
              <F
                label="Client signature image (optional)"
                className="sm:col-span-2"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <div className="grid h-14 w-32 shrink-0 place-items-center overflow-hidden rounded-xl border border-dashed border-border bg-muted">
                    {draft.clientSignature ? (
                      <img
                        src={draft.clientSignature}
                        alt="Client signature"
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <Upload className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <input
                    ref={sigRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        up({ clientSignature: await fileToDataUrl(f, 500) });
                        e.target.value = "";
                      }
                    }}
                  />
                  <Btn
                    type="button"
                    onClick={() => sigRef.current?.click()}
                    className="text-xs"
                  >
                    Upload signature
                  </Btn>
                  {draft.clientSignature && (
                    <Btn
                      type="button"
                      variant="danger"
                      onClick={() => up({ clientSignature: "" })}
                      className="text-xs"
                    >
                      Remove
                    </Btn>
                  )}
                </div>
              </F>
              {kind === "Agreement" && (
                <F
                  label="Additional agreement clauses"
                  className="sm:col-span-2"
                >
                  <textarea
                    className="field min-h-32"
                    value={draft.agreementText ?? ""}
                    onChange={(e) => up({ agreementText: e.target.value })}
                  />
                </F>
              )}
              {kind === "Delivery note" && (
                <>
                  <F label="Delivery method">
                    <Sel
                      value={draft.deliveryMethod ?? "Email"}
                      onChange={(x) => up({ deliveryMethod: x })}
                      options={[
                        "Email",
                        "Telegram",
                        "Cloud drive",
                        "Physical handover",
                        "Other",
                      ]}
                    />
                  </F>
                  <F label="File link / handover reference">
                    <input
                      className="field"
                      value={draft.deliveryLink ?? ""}
                      onChange={(e) => up({ deliveryLink: e.target.value })}
                    />
                  </F>
                </>
              )}
            </div>
            {kind === "Quotation" && (
              <div className="mt-4 space-y-3">
                <F label="Follow-up note">
                  <input
                    className="field"
                    value={followNote}
                    onChange={(e) => setFollowNote(e.target.value)}
                  />
                </F>
                <Btn
                  disabled={!followNote.trim()}
                  onClick={() => {
                    const saved = save({
                      followUps: [
                        ...(draft.followUps ?? []),
                        { date: today(), note: followNote.trim() },
                      ],
                    });
                    if (saved) {
                      setFollowNote("");
                      toast.success("Follow-up recorded");
                    }
                  }}
                >
                  Log follow-up
                </Btn>
                {draft.followUps?.map((f, i) => (
                  <p
                    key={i}
                    className="break-words text-sm text-muted-foreground"
                  >
                    {shortDate(f.date)} · {f.note}
                  </p>
                ))}
              </div>
            )}
          </>
        )}
      </Glass>

      <Glass>
        <SectionToggleHeader
          section="items"
          title={`Line items (${draft.items.length})`}
          summary={`${money(v.subtotal, draft.currency)}`}
        />
        {openSections.items && (
          <>
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <div className="min-w-0 flex-1 sm:w-56 sm:flex-none">
                  <Sel
                    value=""
                    placeholder="+ From services"
                    onChange={(sid) => {
                      const s = db.services.find((x) => x.id === sid);
                      if (s)
                        up({
                          items: [
                            ...draft.items.filter(
                              (x) => x.description || x.price,
                            ),
                            serviceItem(
                              s,
                              draft.currency,
                              safeKhrRate(
                                draft.exchangeRate ?? db.settings.khrRate,
                              ),
                            ),
                          ],
                        });
                    }}
                    options={db.services.map((s) => ({
                      value: s.id,
                      label: `${s.code} · ${s.name}`,
                    }))}
                  />
                </div>
                <Btn
                  onClick={() => up({ items: [...draft.items, blankItem()] })}
                  className="py-2 text-xs"
                >
                  <Plus className="h-3 w-3" />
                  Custom
                </Btn>
              </div>
            </div>
            <div className="space-y-3">
              {draft.items.map((it, i) => (
                <div
                  key={it.id}
                  className="rounded-2xl border border-border bg-muted p-3 animate-in fade-in slide-in-from-top-2"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="label-mono">Item {i + 1}</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => up({ items: move(draft.items, i, -1) })}
                        className="rounded-lg p-1.5 hover:bg-accent"
                        aria-label="Move up"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => up({ items: move(draft.items, i, 1) })}
                        className="rounded-lg p-1.5 hover:bg-accent"
                        aria-label="Move down"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          up({
                            items: draft.items.filter((x) => x.id !== it.id),
                          })
                        }
                        className="rounded-lg p-1.5 text-destructive hover:bg-destructive/10"
                        aria-label="Remove"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <input
                      className="field font-medium"
                      placeholder="Description"
                      value={it.description}
                      onChange={(e) =>
                        upItem(it.id, { description: e.target.value })
                      }
                    />
                    <textarea
                      className="field min-h-20"
                      placeholder="Scope of work, one per line"
                      value={it.scope}
                      onChange={(e) => upItem(it.id, { scope: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      <input
                        className="field col-span-2 sm:col-span-1"
                        placeholder="Timeline"
                        value={it.timeline}
                        onChange={(e) =>
                          upItem(it.id, { timeline: e.target.value })
                        }
                      />
                      <input
                        className="field"
                        type="number"
                        min={0}
                        placeholder="Qty"
                        value={it.qty}
                        onChange={(e) =>
                          upItem(it.id, { qty: Number(e.target.value) })
                        }
                      />
                      <input
                        className="field"
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder="Price"
                        value={it.price}
                        onChange={(e) =>
                          upItem(it.id, { price: Number(e.target.value) })
                        }
                      />
                    </div>
                    <p className="font-num text-right text-sm">
                      {money(it.qty * it.price, draft.currency)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Glass>

      <Glass>
        <SectionToggleHeader
          section="photos"
          title={`Reference photos (${draft.images.length}/6)`}
          summary={
            draft.images.length > 0 ? `${draft.images.length} attached` : "None"
          }
          rightExtra={
            openSections.photos ? (
              <Btn
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={draft.images.length >= 6}
                className="py-1 text-xs"
              >
                <ImagePlus className="h-3.5 w-3.5" />
                Add
              </Btn>
            ) : undefined
          }
        />
        {openSections.photos && (
          <>
            <div className="mb-2 flex justify-end">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(e) => {
                  addImages(e.target.files);
                  e.target.value = "";
                }}
              />
            </div>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                addImages(e.dataTransfer.files);
              }}
              className="grid min-h-24 grid-cols-3 gap-2 rounded-2xl border border-dashed border-border p-2 sm:grid-cols-6"
            >
              {draft.images.length === 0 && (
                <p className="col-span-full self-center text-center text-xs text-muted-foreground">
                  Drop images here
                </p>
              )}
              {draft.images.map((im, i) => (
                <div key={im.id} className="group relative">
                  <img
                    src={im.src}
                    alt=""
                    className="h-20 w-full rounded-xl object-cover"
                  />
                  <div className="absolute inset-x-1 top-1 flex justify-between opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => up({ images: move(draft.images, i, -1) })}
                      className="rounded-md bg-background/80 p-1"
                    >
                      <ArrowUp className="h-3 w-3 -rotate-90" />
                    </button>
                    <button
                      onClick={() =>
                        up({
                          images: draft.images.filter((x) => x.id !== im.id),
                        })
                      }
                      className="rounded-md bg-background/80 p-1 text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                  <input
                    className="mt-1 w-full bg-transparent text-[0.65rem] outline-none"
                    placeholder="Caption"
                    value={im.caption}
                    onChange={(e) =>
                      up({
                        images: draft.images.map((x) =>
                          x.id === im.id
                            ? { ...x, caption: e.target.value }
                            : x,
                        ),
                      })
                    }
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </Glass>

      <Glass>
        <SectionToggleHeader
          section="totals"
          title="Totals, discount & terms"
          summary={`Total ${money(v.total, draft.currency)}`}
        />
        {openSections.totals && (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <F label="Discount (%)">
                <input
                  className="field"
                  type="number"
                  min={0}
                  max={100}
                  value={draft.discount}
                  onChange={(e) => up({ discount: Number(e.target.value) })}
                />
              </F>
              <F label="Notes">
                <input
                  className="field"
                  value={draft.notes}
                  onChange={(e) => up({ notes: e.target.value })}
                />
              </F>
            </div>
            <div className="mt-4 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-num">
                  {money(v.subtotal, draft.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount</span>
                <span className="font-num">
                  −{money(v.discountAmt, draft.currency)}
                </span>
              </div>
              <div className="flex items-end justify-between border-t border-border pt-2">
                <span>Grand total</span>
                <span className="font-num text-2xl font-extrabold">
                  {money(v.total, draft.currency)}
                </span>
              </div>
              {draft.currency === "KHR" && (
                <p className="text-right text-xs text-muted-foreground">
                  Rate 1 USD ={" "}
                  {safeKhrRate(draft.exchangeRate ?? db.settings.khrRate)} KHR
                </p>
              )}
            </div>
            <div className="mt-4 grid gap-2">
              {(
                [
                  ["showSchedule", "Show 50% deposit and 50% balance amounts"],
                  ["includeTerms", "Include Design Terms"],
                  ["includeRates", "Include Extra Service Rates"],
                ] as const
              ).map(([k, l]) => (
                <label
                  key={k}
                  className="flex cursor-pointer items-center gap-3 text-sm"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-[var(--primary)]"
                    checked={draft[k]}
                    onChange={(e) => up({ [k]: e.target.checked })}
                  />
                  {l}
                </label>
              ))}
            </div>
          </>
        )}
      </Glass>

      {!isNew && isInvoice(draft) && (
        <Glass>
          <SectionToggleHeader
            section="payments"
            title="Payments"
            summary={`${money(v.paid, draft.currency)} paid · ${money(v.balance, draft.currency)} left`}
          />
          {openSections.payments && (
            <>
              {pays.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No payments yet.
                </p>
              ) : (
                <ul className="divide-y divide-border text-sm">
                  {pays.map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center justify-between py-2"
                    >
                      <span>
                        {shortDate(p.date)} · {p.method}{" "}
                        {p.reference && `· ${p.reference}`}
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="font-num text-positive">
                          +{money(p.amount, p.currency)}
                        </span>
                        <button
                          onClick={() => setDB((d) => deletePayment(d, p.id))}
                          className="text-muted-foreground hover:text-destructive"
                          aria-label="Delete payment"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </Glass>
      )}
    </div>
  );

  const sortedDocuments = useMemo(() => {
    const clientMap = new Map(db.clients.map((c) => [c.id, c.name]));
    return [...db.invoices]
      .sort(
        (a, b) => b.issue.localeCompare(a.issue) || b.no.localeCompare(a.no),
      )
      .slice(0, 80)
      .map((doc) => {
        const docKind = documentKind(doc);
        const docClient = clientMap.get(doc.clientId) || "No client";
        const docTotal = invoiceView(doc, db).total;
        return {
          value: doc.id,
          label: `${doc.no} · ${docKind} · ${docClient} (${money(docTotal, doc.currency)})`,
        };
      });
  }, [db]);

  const switchNewKind = (k: DocumentType) => {
    up({
      kind: k,
      no: nextInvoiceNo(draft.issue, db.invoices, k),
      showSchedule: k !== "Delivery note",
    });
  };

  return (
    <>
      <div className="rise mb-3 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
        <div className="min-w-0">
          <Link
            to="/invoices"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Documents
          </Link>
          <h1 className="truncate font-display text-2xl font-bold sm:text-3xl">
            {draft.no}
          </h1>
        </div>
        <Pill s={isNew ? "Draft" : v.status} />
      </div>

      {/* Quick Document & Module Switcher — jump without clicking Back */}
      <Glass className="no-print mb-3 p-3 sm:p-3.5">
        <div className="flex flex-col gap-2.5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {isNew ? (
              <>
                <span className="label-mono whitespace-nowrap">New type</span>
                <SlidingTabs
                  size="xs"
                  layoutGroup="doc-new-kind"
                  value={kind}
                  onChange={(k) => switchNewKind(k as DocumentType)}
                  options={DOCUMENT_TYPES.map((t) => ({ id: t, label: t }))}
                />
              </>
            ) : (
              <>
                <span className="label-mono whitespace-nowrap">Quick new</span>
                <div className="no-scrollbar flex max-w-full flex-nowrap items-center gap-1.5 overflow-x-auto pb-1 sm:flex-wrap sm:pb-0">
                  {DOCUMENT_TYPES.map((t) => (
                    <Link
                      key={t}
                      to="/invoices/$id"
                      params={{ id: "new" }}
                      search={{
                        kind: t,
                        ...(draft.clientId ? { client: draft.clientId } : {}),
                        ...(draft.projectId
                          ? { project: draft.projectId }
                          : {}),
                      }}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap shrink-0 transition-colors",
                        t === kind
                          ? "border-primary/50 bg-primary/15 text-primary hover:bg-primary/25"
                          : "border-border bg-muted/50 text-muted-foreground hover:border-primary/40 hover:text-foreground",
                      )}
                    >
                      <FilePlus2 className="h-3 w-3" />
                      {t}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="w-full min-w-[220px] sm:w-72">
              <Sel
                value={isNew ? "" : draft.id}
                placeholder="Jump to another document…"
                options={sortedDocuments}
                onChange={(targetId) => {
                  if (!targetId || targetId === draft.id) return;
                  nav({ to: "/invoices/$id", params: { id: targetId } });
                }}
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5 border-l border-border/60 pl-2">
              <Link
                to="/invoices"
                className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground whitespace-nowrap shrink-0 transition-colors hover:border-primary/50 hover:text-foreground"
              >
                <FileText className="h-3 w-3" />
                Documents
              </Link>
              <Link
                to="/projects"
                className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground whitespace-nowrap shrink-0 transition-colors hover:border-primary/50 hover:text-foreground"
              >
                <FolderKanban className="h-3 w-3" />
                Projects
              </Link>
              <Link
                to="/clients"
                className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground whitespace-nowrap shrink-0 transition-colors hover:border-primary/50 hover:text-foreground"
              >
                <Users className="h-3 w-3" />
                Clients
              </Link>
              <Link
                to="/services"
                className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground whitespace-nowrap shrink-0 transition-colors hover:border-primary/50 hover:text-foreground"
              >
                <Layers className="h-3 w-3" />
                Services
              </Link>
              <Link
                to="/finance"
                className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground whitespace-nowrap shrink-0 transition-colors hover:border-primary/50 hover:text-foreground"
              >
                <Briefcase className="h-3 w-3" />
                Finance
              </Link>
            </div>
          </div>
        </div>
      </Glass>

      {/* Connected workflow quick bar */}
      <Glass className="mb-4 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="label-mono">Connected workflow</span>
            {project ? (
              <Link
                to="/projects"
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-1 hover:bg-accent"
              >
                <span className="font-num text-foreground">{project.code}</span>
                <span className="text-muted-foreground">{project.name}</span>
                <Pill s={project.status} />
              </Link>
            ) : (
              <span className="text-muted-foreground">
                Sending or accepting auto-creates & updates a linked project
              </span>
            )}
            {relatedDocs.length > 1 && (
              <div className="flex flex-wrap gap-1.5">
                {relatedDocs
                  .filter((d) => d.id !== draft.id)
                  .map((d) => (
                    <Link
                      key={d.id}
                      to="/invoices/$id"
                      params={{ id: d.id }}
                      className="font-num rounded-full border border-border px-2.5 py-0.5 text-[0.7rem] text-muted-foreground hover:border-primary hover:text-foreground"
                    >
                      {documentKind(d)}: {d.no}
                    </Link>
                  ))}
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {kind === "Quotation" && (
              <>
                <Btn
                  variant="gold"
                  onClick={() => acceptAndConvert("Agreement")}
                  className="text-xs"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Win client: Agreement
                </Btn>
                <Btn
                  onClick={() => acceptAndConvert("Invoice")}
                  className="text-xs"
                >
                  Accept & Issue Invoice
                </Btn>
              </>
            )}
            {kind === "Agreement" && (
              <Btn
                variant="gold"
                onClick={() => acceptAndConvert("Invoice")}
                className="text-xs"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Signed & Issue Invoice
              </Btn>
            )}
            {kind === "Invoice" && !isNew && (
              <Btn
                onClick={() => acceptAndConvert("Delivery note")}
                className="text-xs"
              >
                Issue Delivery Note
              </Btn>
            )}
            {kind === "Delivery note" && draft.response !== "Accepted" && (
              <Btn
                variant="gold"
                onClick={() => {
                  if (
                    save({
                      sent: true,
                      response: "Accepted",
                      confirmedOn: draft.confirmedOn || today(),
                    })
                  ) {
                    toast.success("Marked delivered & project updated");
                  }
                }}
                className="text-xs"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Mark Delivered & Received
              </Btn>
            )}
          </div>
        </div>
      </Glass>

      <div className="no-print mb-4 flex flex-wrap items-center gap-2 sm:sticky sm:top-24 sm:z-30">
        <Btn
          variant="gold"
          onClick={() => {
            if (save()) toast.success("Saved");
          }}
        >
          Save
        </Btn>
        {!draft.sent && (
          <Btn
            onClick={() => {
              if (
                save({
                  sent: true,
                  ...(kind === "Quotation" && !draft.followUp
                    ? { followUp: addDays(today(), 3) }
                    : {}),
                })
              )
                toast.success("Marked as sent");
            }}
          >
            Mark as sent
          </Btn>
        )}
        {!isNew && isInvoice(draft) && (
          <Btn onClick={() => setPayOpen(true)} disabled={v.balance <= 0.005}>
            <Wallet className="h-4 w-4" />
            {v.balance <= 0.005 ? "Paid in full" : "Record payment"}
          </Btn>
        )}
        {!isNew && (
          <Link to="/print/$id" params={{ id: draft.id }}>
            <Btn onClick={() => save()}>
              <Download className="h-4 w-4" />
              PDF
            </Btn>
          </Link>
        )}
        <Btn onClick={telegram}>
          <Copy className="h-4 w-4" />
          Telegram
        </Btn>
        {!isNew && <Btn onClick={duplicate}>Duplicate</Btn>}
        {!isNew && (
          <div className="w-full sm:w-52">
            <Sel
              value=""
              placeholder="Create linked document…"
              options={DOCUMENT_TYPES.filter((k) => k !== kind).map((k) => ({
                value: k,
                label: k,
              }))}
              onChange={(k) => {
                if (!k) return;
                if (
                  kind === "Quotation" &&
                  draft.response !== "Accepted" &&
                  k === "Invoice"
                ) {
                  toast.error(
                    "Accept quotation first (or click 'Accept & Issue Invoice' above).",
                  );
                  return;
                }
                const source = save();
                if (!source) return;
                const copy = convertDocument(
                  source,
                  k as DocumentType,
                  getDB().invoices,
                  today(),
                  db.settings.dueDays,
                );
                setDB((d) => ({ ...d, invoices: [...d.invoices, copy] }));
                nav({ to: "/invoices/$id", params: { id: copy.id } });
              }}
            />
          </div>
        )}
        {!isNew && (
          <Btn variant="danger" onClick={del}>
            <Trash2 className="h-4 w-4" />
          </Btn>
        )}
      </div>
      {draft.sourceId && (
        <Link
          to="/invoices/$id"
          params={{ id: draft.sourceId }}
          className="mb-4 block text-sm text-primary"
        >
          Source:{" "}
          {db.invoices.find((i) => i.id === draft.sourceId)?.no ??
            "Original document"}{" "}
          →
        </Link>
      )}
      {kind === "Agreement" && (
        <p className="mb-4 text-sm text-muted-foreground">
          Design Services Agreement uses your studio terms & client details
          across 2–5 A4 pages. Have local counsel review before signing.
        </p>
      )}
      <div className="mb-4 lg:hidden">
        <SlidingTabs
          layoutGroup="invoice-mobile-tab"
          value={tab}
          onChange={setTab}
          className="w-full justify-center"
          options={[
            { id: "form", label: "Edit details" },
            { id: "preview", label: "A4 Preview" },
          ]}
        />
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className={cn(tab === "preview" && "hidden lg:block")}>{form}</div>
        <div
          className={cn(
            "lg:sticky lg:top-28 lg:self-start",
            tab === "form" && "hidden lg:block",
          )}
        >
          <Preview inv={draft} />
        </div>
      </div>
      {/* Quick Bottom Function Bar */}
      <Glass className="no-print mt-6 flex flex-wrap items-center justify-between gap-3 p-3.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="label-mono mr-1">Switch function</span>
          {DOCUMENT_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                if (isNew) {
                  switchNewKind(t);
                } else {
                  nav({
                    to: "/invoices/$id",
                    params: { id: "new" },
                    search: {
                      kind: t,
                      ...(draft.clientId ? { client: draft.clientId } : {}),
                      ...(draft.projectId ? { project: draft.projectId } : {}),
                    },
                  });
                }
              }}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium whitespace-nowrap shrink-0 transition-colors",
                isNew && t === kind
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-muted/50 text-muted-foreground hover:border-primary/40 hover:text-foreground",
              )}
            >
              {isNew ? t : `+ New ${t}`}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link to="/projects">
            <Btn type="button" className="text-xs whitespace-nowrap shrink-0">
              <FolderKanban className="h-3.5 w-3.5" />
              Projects
            </Btn>
          </Link>
          <Link to="/clients">
            <Btn type="button" className="text-xs whitespace-nowrap shrink-0">
              <Users className="h-3.5 w-3.5" />
              Clients
            </Btn>
          </Link>
          <Link to="/services">
            <Btn type="button" className="text-xs whitespace-nowrap shrink-0">
              <Layers className="h-3.5 w-3.5" />
              Services
            </Btn>
          </Link>
          <Link to="/finance">
            <Btn type="button" className="text-xs whitespace-nowrap shrink-0">
              <Briefcase className="h-3.5 w-3.5" />
              Finance
            </Btn>
          </Link>
          <Link to="/invoices">
            <Btn type="button" className="text-xs whitespace-nowrap shrink-0">
              <FileText className="h-3.5 w-3.5" />
              All documents
            </Btn>
          </Link>
        </div>
      </Glass>

      <PaymentModal
        open={payOpen}
        onClose={() => setPayOpen(false)}
        inv={draft}
        balance={v.balance}
        onSave={() => {
          if (!draft.sent) save({ sent: true });
        }}
      />
      <QuickClient
        open={newClient}
        onClose={() => setNewClient(false)}
        onCreated={(cid) => up({ clientId: cid, projectId: "" })}
      />
    </>
  );
}

function Preview({ inv }: { inv: Invoice }) {
  const db = useDB((d) => d);
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const [height, setHeight] = useState(2246);
  const pagesRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setScale(el.clientWidth / 794);
      if (pagesRef.current) setHeight(pagesRef.current.scrollHeight);
    });
    ro.observe(el);
    if (pagesRef.current) ro.observe(pagesRef.current);
    return () => ro.disconnect();
  }, []);
  const doc = useMemo(() => <InvoiceDoc inv={inv} db={db} />, [inv, db]);
  return (
    <div
      ref={ref}
      className="max-h-[80vh] overflow-y-auto overflow-x-hidden rounded-2xl"
    >
      <div style={{ height: height * scale }}>
        <div
          ref={pagesRef}
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            width: 794,
          }}
          className="[&_.paper]:mb-4 [&_.paper]:rounded-sm [&_.paper]:shadow-2xl"
        >
          {doc}
        </div>
      </div>
    </div>
  );
}

function PaymentModal({
  open,
  onClose,
  inv,
  balance,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  inv: Invoice;
  balance: number;
  onSave: () => void;
}) {
  const [f, setF] = useState({
    date: today(),
    amount: 0,
    method: "KHQR",
    reference: "",
  });
  useEffect(() => {
    if (open)
      setF({
        date: today(),
        amount:
          inv.currency === "KHR"
            ? Math.round(balance)
            : Math.round(balance * 100) / 100,
        method: "KHQR",
        reference: "",
      });
  }, [open, balance, inv.currency]);
  return (
    <Modal open={open} onClose={onClose} title="Record payment">
      <div className="grid gap-3 sm:grid-cols-2">
        <F label="Date">
          <input
            type="date"
            className="field"
            value={f.date}
            onChange={(e) => setF({ ...f, date: e.target.value })}
          />
        </F>
        <F label={`Amount (${inv.currency})`}>
          <input
            type="number"
            step={inv.currency === "KHR" ? "100" : "0.01"}
            className="field"
            value={f.amount}
            onChange={(e) => setF({ ...f, amount: Number(e.target.value) })}
          />
        </F>
        <F label="Method">
          <Sel
            value={f.method}
            onChange={(m) => setF({ ...f, method: m })}
            options={PAY_METHODS}
          />
        </F>
        <F label="Reference">
          <input
            className="field"
            value={f.reference}
            onChange={(e) => setF({ ...f, reference: e.target.value })}
            placeholder="Deposit, balance…"
          />
        </F>
      </div>
      <div className="mt-3 flex gap-2">
        <Btn
          onClick={() =>
            setF({
              ...f,
              amount:
                inv.currency === "KHR"
                  ? Math.round(balance / 2)
                  : Math.round((balance / 2) * 100) / 100,
            })
          }
          className="text-xs"
        >
          50% of balance
        </Btn>
        <Btn
          onClick={() => setF({ ...f, amount: balance })}
          className="text-xs"
        >
          Full balance
        </Btn>
      </div>
      <Btn
        variant="gold"
        className="mt-5 w-full"
        disabled={!(f.amount > 0) || f.amount > balance + 0.005}
        onClick={() => {
          try {
            onSave();
            setDB((d) =>
              recordPayment(d, {
                id: uid(),
                invoiceId: inv.id,
                currency: inv.currency,
                exchangeRate: safeKhrRate(
                  inv.exchangeRate ?? d.settings.khrRate,
                ),
                ...f,
              }),
            );
            toast.success("Payment recorded & finance updated");
            onClose();
          } catch (e) {
            toast.error(
              e instanceof Error ? e.message : "Unable to record payment",
            );
          }
        }}
      >
        Save payment
      </Btn>
    </Modal>
  );
}

export function QuickClient({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (id: string) => void;
}) {
  const [n, setN] = useState({ name: "", contact: "", telegram: "" });
  return (
    <Modal open={open} onClose={onClose} title="New client">
      <div className="grid gap-3">
        <F label="Name">
          <input
            className="field"
            value={n.name}
            onChange={(e) => setN({ ...n, name: e.target.value })}
          />
        </F>
        <F label="Contact person">
          <input
            className="field"
            value={n.contact}
            onChange={(e) => setN({ ...n, contact: e.target.value })}
          />
        </F>
        <F label="Email / Telegram">
          <input
            className="field"
            value={n.telegram}
            onChange={(e) => setN({ ...n, telegram: e.target.value })}
          />
        </F>
      </div>
      <Btn
        variant="gold"
        className="mt-5 w-full"
        disabled={!n.name.trim()}
        onClick={() => {
          const id = uid();
          const count = getDB().clients.length + 1;
          setDB((d) => ({
            ...d,
            clients: [
              ...d.clients,
              {
                id,
                code: `CL-${String(count).padStart(2, "0")}`,
                name: n.name.trim(),
                contact: n.contact,
                email:
                  n.telegram.includes("@") && n.telegram.includes(".")
                    ? n.telegram
                    : "",
                telegram: n.telegram.includes(".") ? "" : n.telegram,
                type: "SME",
                industry: "",
                phone: "",
                source: "Other",
                status: "Active",
                notes: "",
              },
            ],
          }));
          onCreated(id);
          setN({ name: "", contact: "", telegram: "" });
          onClose();
        }}
      >
        Add client
      </Btn>
    </Modal>
  );
}
