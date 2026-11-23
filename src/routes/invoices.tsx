import {
  createFileRoute,
  Link,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Columns3,
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
import {
  EditLayoutButton,
  EditableBentoGrid,
  type BentoWidgetDef,
} from "@/components/rv/BentoGrid";
import {
  DOCUMENT_TYPES,
  compactMoney,
  convertDocument,
  deletePayment,
  documentKind,
  invoiceView,
  isInvoice,
  money,
  needsFollowUp,
  recordPayment,
  reconcileProjects,
  saveDocument,
  setDB,
  shortDate,
  today,
  uid,
  useDB,
  type Invoice,
} from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/invoices")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { title: "Invoices · RothVan Studio" },
      {
        name: "description",
        content: "Issue and track RothVan Design invoices.",
      },
      { property: "og:title", content: "Invoices · RothVan Studio" },
      {
        property: "og:description",
        content: "Issue and track RothVan Design invoices.",
      },
    ],
  }),
  component: Invoices,
});

const FILTERS = ["All", "Draft", "Sent", "Partial", "Paid", "Overdue"];
const INITIAL_LIMIT = 10;

function Invoices() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const db = useDB((d) => d);
  const [q, setQ] = useState("");
  const [f, setF] = useState("All");
  const [kind, setKind] = useState("All documents");
  const [viewMode, setViewMode] = useState<"list" | "board">("list");
  const [showAll, setShowAll] = useState(false);
  const [editingLayout, setEditingLayout] = useState(false);

  const rows = useMemo(
    () =>
      db.invoices
        .map((i) => ({
          i,
          v: invoiceView(i, db),
          c: db.clients.find((c) => c.id === i.clientId),
        }))
        .filter(
          (r) =>
            (kind === "All documents" || documentKind(r.i) === kind) &&
            (f === "All" ||
              (f === "Follow-up due"
                ? needsFollowUp(r.i)
                : r.v.status === f)) &&
            (r.i.no + " " + (r.c?.name ?? ""))
              .toLowerCase()
              .includes(q.toLowerCase()),
        )
        .sort((a, b) => b.i.issue.localeCompare(a.i.issue)),
    [db, kind, f, q],
  );

  const all = useMemo(
    () => db.invoices.filter(isInvoice).map((i) => invoiceView(i, db)),
    [db],
  );
  const outstandingUSD = all
    .filter((v) => v.status !== "Draft")
    .reduce((a, v) => a + v.balanceUSD, 0);
  const overdueUSD = all
    .filter((v) => v.status === "Overdue")
    .reduce((a, v) => a + v.balanceUSD, 0);

  const visibleRows = showAll ? rows : rows.slice(0, INITIAL_LIMIT);
  const hasMore = rows.length > INITIAL_LIMIT;

  const convertedSourceIds = useMemo(
    () =>
      new Set(
        db.invoices
          .filter((inv) => isInvoice(inv) && inv.sourceId)
          .map((inv) => inv.sourceId!),
      ),
    [db.invoices],
  );

  const handleQuickPayFull = useCallback(
    (inv: Invoice, balance: number, clientName: string) => {
      const payment = {
        id: uid(),
        invoiceId: inv.id,
        date: today(),
        amount: Math.round(balance * 100) / 100,
        currency: inv.currency,
        method: "Bank transfer",
        reference: "Quick settle",
      };
      try {
        setDB((d) => recordPayment(d, payment));
        toast.success(`Paid ${inv.no}${clientName ? ` · ${clientName}` : ""}`, {
          action: {
            label: "Undo",
            onClick: () => setDB((d) => deletePayment(d, payment.id)),
          },
        });
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Could not record payment",
        );
      }
    },
    [],
  );

  const handleQuickConvertToInvoice = useCallback(
    (source: Invoice) => {
      const prevInvoices = db.invoices;
      const prevProjects = db.projects;
      const prevClients = db.clients;
      const converted = convertDocument(
        source,
        "Invoice",
        db.invoices,
        today(),
        db.settings.dueDays || 28,
      );
      setDB((d) => saveDocument(d, converted));
      toast.success(`Converted ${source.no} → ${converted.no}`, {
        cancel: {
          label: "Undo",
          onClick: () =>
            setDB((d) =>
              reconcileProjects({
                ...d,
                invoices: prevInvoices,
                projects: prevProjects,
                clients: prevClients,
              }),
            ),
        },
      });
    },
    [db.invoices, db.projects, db.clients, db.settings.dueDays],
  );

  const widgets = useMemo<BentoWidgetDef[]>(
    () => [
      {
        id: "invOutstanding",
        title: "Outstanding",
        defaultSpan: 6,
        render: () => (
          <Glass className="h-full">
            <Stat
              label="Outstanding"
              value={compactMoney(outstandingUSD)}
              fullValue={money(outstandingUSD)}
            />
          </Glass>
        ),
      },
      {
        id: "invOverdue",
        title: "Overdue",
        defaultSpan: 6,
        render: () => (
          <Glass delay={60} className="h-full">
            <Stat
              label="Overdue"
              tone="neg"
              value={compactMoney(overdueUSD)}
              fullValue={money(overdueUSD)}
            />
          </Glass>
        ),
      },
      {
        id: "invLedger",
        title: "Documents list",
        defaultSpan: 12,
        render: () => (
          <Glass delay={120}>
            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  className="field pl-9"
                  placeholder="Search number or client"
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value);
                    setShowAll(false);
                  }}
                />
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <SlidingTabs
                  layoutGroup="invoices-status-tabs"
                  size="xs"
                  value={f}
                  onChange={(next) => {
                    setF(next);
                    setShowAll(false);
                  }}
                  options={[
                    ...(kind === "Invoice" || kind === "All documents"
                      ? FILTERS
                      : [
                          "All",
                          "Draft",
                          "Sent",
                          "Accepted",
                          "Declined",
                          "Expired",
                          "Signed",
                          "Received",
                        ]),
                    "Follow-up due",
                  ].map((x) => ({ id: x, label: x }))}
                />
                <SlidingTabs
                  size="xs"
                  layoutGroup="invoices-view-mode"
                  value={viewMode}
                  onChange={setViewMode}
                  options={[
                    { id: "list", label: "List", icon: List },
                    { id: "board", label: "Board", icon: Columns3 },
                  ]}
                />
              </div>
            </div>
            {rows.length === 0 ? (
              <Empty>No invoices match.</Empty>
            ) : viewMode === "board" ? (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                {(
                  [
                    {
                      id: "draft",
                      title: "Draft",
                      match: (s: string) => s === "Draft",
                    },
                    {
                      id: "sent",
                      title: "Sent / Partial",
                      match: (s: string) =>
                        ["Sent", "Partial", "Signed"].includes(s),
                    },
                    {
                      id: "overdue",
                      title: "Overdue / Attention",
                      match: (s: string) =>
                        ["Overdue", "Declined", "Expired"].includes(s),
                    },
                    {
                      id: "settled",
                      title: "Paid / Accepted",
                      match: (s: string) =>
                        ["Paid", "Accepted", "Received"].includes(s),
                    },
                  ] as const
                ).map((col) => {
                  const colRows = rows.filter((r) => col.match(r.v.status));
                  const colTotalUSD = colRows.reduce(
                    (sum, r) => sum + r.v.totalUSD,
                    0,
                  );
                  return (
                    <div
                      key={col.id}
                      className="flex min-h-[200px] flex-col rounded-xl border border-border bg-muted/35 p-3"
                    >
                      <div className="mb-2.5 flex items-center justify-between gap-2 border-b border-border/60 pb-2">
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-foreground">
                            {col.title}
                          </p>
                          <p className="font-num text-[0.68rem] text-muted-foreground">
                            {compactMoney(colTotalUSD)}
                          </p>
                        </div>
                        <span className="font-num rounded-md bg-secondary px-1.5 py-0.5 text-[0.68rem] text-muted-foreground">
                          {colRows.length}
                        </span>
                      </div>

                      {colRows.length === 0 ? (
                        <p className="py-6 text-center text-xs text-muted-foreground/80">
                          No documents
                        </p>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {colRows.map(({ i, v, c }) => (
                            <Link
                              key={i.id}
                              to="/invoices/$id"
                              params={{ id: i.id }}
                              className="block rounded-lg border border-border bg-card p-2.5 transition-colors hover:border-primary/50"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span className="font-num text-xs font-semibold text-foreground">
                                  {i.no}
                                </span>
                                <Pill s={v.status} />
                              </div>
                              <p className="mt-1 truncate text-xs text-muted-foreground">
                                {documentKind(i)} · {c?.name ?? "No client"}
                              </p>
                              <div className="mt-2 flex items-center justify-between gap-2 border-t border-border/50 pt-1.5 text-xs">
                                <span className="font-num text-[0.68rem] text-muted-foreground">
                                  {shortDate(i.due)}
                                </span>
                                <span className="font-num font-semibold text-foreground">
                                  {money(v.total, i.currency)}
                                </span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <>
                <ul className="divide-y divide-border">
                  {visibleRows.map(({ i, v, c }) => {
                    const kindName = documentKind(i);
                    const canPayFull =
                      isInvoice(i) && v.balance > 0.01 && v.status !== "Draft";
                    const canConvertQuote =
                      (kindName === "Quotation" || kindName === "Agreement") &&
                      i.response === "Accepted" &&
                      !convertedSourceIds.has(i.id);
                    return (
                      <li
                        key={i.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg px-2 py-3 transition-colors hover:bg-muted sm:flex-nowrap"
                      >
                        <Link
                          to="/invoices/$id"
                          params={{ id: i.id }}
                          className="min-w-0 flex-1"
                        >
                          <p className="font-num truncate text-sm font-medium text-foreground">
                            {i.no}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {kindName} · {c?.name ?? "No client"} ·{" "}
                            {kindName === "Quotation" ? "valid until" : "due"}{" "}
                            {shortDate(i.due)}
                          </p>
                          {needsFollowUp(i) && (
                            <p className="text-xs text-primary">
                              Follow-up due {shortDate(i.followUp ?? "")}
                            </p>
                          )}
                        </Link>
                        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                          <Link
                            to="/invoices/$id"
                            params={{ id: i.id }}
                            className="text-right"
                          >
                            <p className="font-num text-sm">
                              {money(v.total, i.currency)}
                            </p>
                            {v.balance > 0 && v.status !== "Draft" && (
                              <p className="text-xs text-muted-foreground tabular-nums">
                                {money(v.balance, i.currency)} due
                              </p>
                            )}
                          </Link>
                          <Pill s={v.status} />
                          {canPayFull && (
                            <button
                              type="button"
                              onClick={() =>
                                handleQuickPayFull(i, v.balance, c?.name ?? "")
                              }
                              className="inline-flex min-h-[34px] items-center gap-1 whitespace-nowrap rounded-lg border border-positive/45 bg-positive/15 px-2.5 text-xs font-semibold text-positive transition-colors hover:bg-positive hover:text-white active:scale-95"
                            >
                              <Check className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">Pay</span>
                            </button>
                          )}
                          {canConvertQuote && (
                            <button
                              type="button"
                              onClick={() => handleQuickConvertToInvoice(i)}
                              className="inline-flex min-h-[34px] items-center gap-1 whitespace-nowrap rounded-lg border border-primary/45 bg-primary/15 px-2.5 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground active:scale-95"
                            >
                              <span>→ Invoice</span>
                            </button>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
                {hasMore && (
                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/70 pt-3 text-xs text-muted-foreground">
                    <span>
                      Showing {visibleRows.length} of {rows.length} documents
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
    [
      outstandingUSD,
      overdueUSD,
      q,
      kind,
      f,
      viewMode,
      rows,
      visibleRows,
      hasMore,
      showAll,
      convertedSourceIds,
      handleQuickPayFull,
      handleQuickConvertToInvoice,
    ],
  );

  if (path !== "/invoices") return <Outlet />;

  return (
    <>
      <PageHeader
        title="Invoices & documents"
        owner={db.settings.ownerName}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <EditLayoutButton
              editing={editingLayout}
              onToggle={() => setEditingLayout((e) => !e)}
            />
            <Link
              to="/invoices/$id"
              params={{ id: "new" }}
              search={{
                kind:
                  kind === "All documents"
                    ? "Invoice"
                    : (kind as (typeof DOCUMENT_TYPES)[number]),
              }}
            >
              <Btn variant="gold">
                <Plus className="h-4 w-4" />
                New {kind === "All documents" ? "invoice" : kind.toLowerCase()}
              </Btn>
            </Link>
          </div>
        }
      />
      <div className="mb-4">
        <SlidingTabs
          layoutGroup="invoices-kind-tabs"
          value={kind}
          onChange={(next) => {
            setKind(next);
            setF("All");
            setShowAll(false);
          }}
          options={["All documents", ...DOCUMENT_TYPES].map((k) => ({
            id: k,
            label: k,
          }))}
        />
      </div>

      <EditableBentoGrid
        pageKey="invoices"
        widgets={widgets}
        editing={editingLayout}
        onToggleEditing={() => setEditingLayout((e) => !e)}
        onDoneEditing={() => setEditingLayout(false)}
      />
    </>
  );
}
