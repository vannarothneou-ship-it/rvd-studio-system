import {
  createFileRoute,
  Link,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Plus, Search } from "lucide-react";
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
  documentKind,
  invoiceView,
  isInvoice,
  money,
  needsFollowUp,
  shortDate,
  useDB,
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
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
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
            </div>
            {rows.length === 0 ? (
              <Empty>No invoices match.</Empty>
            ) : (
              <>
                <ul className="divide-y divide-border">
                  {visibleRows.map(({ i, v, c }, k) => (
                    <li
                      key={i.id}
                      className="rise"
                      style={{ animationDelay: `${Math.min(k, 12) * 25}ms` }}
                    >
                      <Link
                        to="/invoices/$id"
                        params={{ id: i.id }}
                        className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl px-2 py-3 hover:bg-muted"
                      >
                        <div className="min-w-0">
                          <p className="font-num truncate text-sm">{i.no}</p>
                          <p className="text-xs text-muted-foreground">
                            {documentKind(i)} · {c?.name ?? "No client"} ·{" "}
                            {documentKind(i) === "Quotation"
                              ? "valid until"
                              : "due"}{" "}
                            {shortDate(i.due)}
                          </p>
                          {needsFollowUp(i) && (
                            <p className="text-xs text-primary">
                              Follow-up due {shortDate(i.followUp ?? "")}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="font-num text-sm">
                              {money(v.total, i.currency)}
                            </p>
                            {v.balance > 0 && v.status !== "Draft" && (
                              <p className="text-xs text-muted-foreground tabular-nums">
                                {money(v.balance, i.currency)} due
                              </p>
                            )}
                          </div>
                          <Pill s={v.status} />
                        </div>
                      </Link>
                    </li>
                  ))}
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
      rows,
      visibleRows,
      hasMore,
      showAll,
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
        onDoneEditing={() => setEditingLayout(false)}
      />
    </>
  );
}
