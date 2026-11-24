import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { InvoiceDoc } from "@/components/rv/InvoiceDoc";
import { useDB } from "@/lib/store";
import { Btn } from "@/components/rv/ui";

export const Route = createFileRoute("/print/$id")({
  head: () => ({
    meta: [
      { title: "Print document · RothVan Studio" },
      {
        name: "description",
        content:
          "Printable RothVan Studio quotations, agreements, invoices and delivery notes.",
      },
      { property: "og:title", content: "Print document · RothVan Studio" },
      {
        property: "og:description",
        content: "Print your studio documents on A4.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PrintPage,
});

function PrintPage() {
  const { id } = Route.useParams();
  const db = useDB((d) => d);
  const inv = db.invoices.find((i) => i.id === id);
  useEffect(() => {
    if (inv) {
      document.title = inv.no;
      const t = setTimeout(() => window.print(), 700);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [inv]);
  if (!inv) return <p className="p-10">Invoice not found.</p>;
  return (
    <div className="flex flex-col items-center gap-6 py-6 print:block print:p-0">
      <div className="no-print flex gap-2">
        <Link
          to="/invoices/$id"
          params={{ id }}
          className="ios-tap inline-flex min-h-[44px] items-center justify-center rounded-xl border border-border bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-accent sm:min-h-[38px]"
        >
          ← Back
        </Link>
        <Btn variant="gold" onClick={() => window.print()}>
          Print / Save PDF
        </Btn>
      </div>
      <div className="flex flex-col gap-6 [&_.paper]:shadow-2xl print:gap-0">
        <InvoiceDoc inv={inv} db={db} />
      </div>
    </div>
  );
}
