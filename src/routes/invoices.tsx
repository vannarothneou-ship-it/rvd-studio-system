import {
  createFileRoute,
  Link,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Btn, Empty, Glass, PageHeader, Pill, Stat } from "@/components/rv/ui";
import {
  DOCUMENT_TYPES,
  documentKind,
  invoiceView,
  isInvoice,
  needsFollowUp,
  money,
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

function Invoices() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const db = useDB((d) => d);
  const [q, setQ] = useState("");
  const [f, setF] = useState("All");
  const [kind, setKind] = useState("All documents");
  if (path !== "/invoices") return <Outlet />;
  const rows = db.invoices
    .map((i) => ({
      i,
      v: invoiceView(i, db),
      c: db.clients.find((c) => c.id === i.clientId),
    }))
    .filter(
      (r) =>
        (kind === "All documents" || documentKind(r.i) === kind) &&
        (f === "All" ||
          (f === "Follow-up due" ? needsFollowUp(r.i) : r.v.status === f)) &&
        (r.i.no + " " + (r.c?.name ?? ""))
          .toLowerCase()
          .includes(q.toLowerCase()),
    )
    .sort((a, b) => b.i.issue.localeCompare(a.i.issue));
  const all = db.invoices.filter(isInvoice).map((i) => invoiceView(i, db));
  return (
    <>
      <PageHeader
        title="Invoices & documents"
        owner={db.settings.ownerName}
        action={
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
        }
      />
      <div className="mb-4 flex flex-wrap gap-2">
        {["All documents", ...DOCUMENT_TYPES].map((k) => (
          <Btn
            key={k}
            variant={k === kind ? "gold" : "ghost"}
            onClick={() => {
              setKind(k);
              setF("All");
            }}
          >
            {k}
          </Btn>
        ))}
      </div>
      <div className="mb-4 grid grid-cols-2 gap-4">
        <Glass>
          <Stat
            label="Outstanding"
            value={money(
              all
                .filter((v) => v.status !== "Draft")
                .reduce((a, v) => a + v.balanceUSD, 0),
            )}
          />
        </Glass>
        <Glass delay={60}>
          <Stat
            label="Overdue"
            tone="neg"
            value={money(
              all
                .filter((v) => v.status === "Overdue")
                .reduce((a, v) => a + v.balanceUSD, 0),
            )}
          />
        </Glass>
      </div>
      <Glass delay={120}>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              className="field pl-9"
              placeholder="Search number or client"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
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
            ].map((x) => (
              <Btn
                key={x}
                onClick={() => setF(x)}
                className={cn(
                  "px-3 py-1 text-xs",
                  f === x && "bg-primary text-primary-foreground",
                )}
              >
                {x}
              </Btn>
            ))}
          </div>
        </div>
        {rows.length === 0 ? (
          <Empty>No invoices match.</Empty>
        ) : (
          <ul className="divide-y divide-border">
            {rows.map(({ i, v, c }, k) => (
              <li
                key={i.id}
                className="rise"
                style={{ animationDelay: `${k * 30}ms` }}
              >
                <Link
                  to="/invoices/$id"
                  params={{ id: i.id }}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl px-2 py-3 hover:bg-muted"
                >
                  <div className="min-w-0">
                    <p className="truncate font-mono text-sm">{i.no}</p>
                    <p className="text-xs text-muted-foreground">
                      {documentKind(i)} · {c?.name ?? "No client"} ·{" "}
                      {documentKind(i) === "Quotation" ? "valid until" : "due"}{" "}
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
                      <p className="font-mono text-sm">
                        {money(v.total, i.currency)}
                      </p>
                      {v.balance > 0 && v.status !== "Draft" && (
                        <p className="text-xs text-muted-foreground">
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
        )}
      </Glass>
    </>
  );
}
