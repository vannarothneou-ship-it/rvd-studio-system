import {
  invoiceTotals,
  longDate,
  money,
  type DB,
  type Invoice,
} from "@/lib/store";
import { DocumentSignatures } from "./DocumentSignatures";

type Clause = {
  title: string;
  text: string;
  kind?: "summary" | "clause" | "schedule";
};

function splitTextAtBoundary(text: string, maxChars: number): string[] {
  if (text.length <= maxChars) return [text];
  const chunks: string[] = [];
  let remaining = text.trim();
  while (remaining.length > maxChars) {
    let cut = remaining.lastIndexOf("\n\n", maxChars);
    if (cut < maxChars * 0.45) cut = remaining.lastIndexOf("\n", maxChars);
    if (cut < maxChars * 0.45) cut = remaining.lastIndexOf(". ", maxChars);
    if (cut < maxChars * 0.45) cut = remaining.lastIndexOf(" ", maxChars);
    if (cut <= 0) cut = maxChars;
    else if (remaining[cut] === ".") cut += 1;
    chunks.push(remaining.slice(0, cut).trim());
    remaining = remaining.slice(cut).trim();
  }
  if (remaining) chunks.push(remaining);
  return chunks;
}

export function buildAgreementClauses(inv: Invoice, db: DB): Clause[] {
  const c = db.clients.find((x) => x.id === inv.clientId);
  const p = db.projects.find((x) => x.id === inv.projectId);
  const s = db.settings;
  const totals = invoiceTotals(inv);
  const total = money(totals.total, inv.currency);
  const subtotal = money(totals.subtotal, inv.currency);
  const deposit = money(totals.total / 2, inv.currency);
  const sourceDoc = inv.sourceId
    ? db.invoices.find((x) => x.id === inv.sourceId)
    : undefined;

  const scopeLines = inv.items
    .map((item, idx) => {
      const unitPrice = money(item.price, inv.currency);
      const lineTotal = money(item.qty * item.price, inv.currency);
      const scopeDetail = item.scope?.trim()
        ? item.scope
            .split("\n")
            .filter(Boolean)
            .map((line) => `  - ${line}`)
            .join("\n")
        : "  - Deliverables and specifications as confirmed in writing.";
      return `${idx + 1}. ${item.description || "Design deliverable"} (Qty: ${item.qty} × ${unitPrice} = ${lineTotal} · Est. timeline: ${item.timeline || "As agreed"})\n${scopeDetail}`;
    })
    .join("\n\n");

  const clientContactLines = [
    c?.contact
      ? `Representative: ${c.contact}${c.position ? ` (${c.position})` : ""}`
      : "",
    c?.address ? `Address: ${c.address}` : "",
    c?.taxId ? `Tax / Reg ID: ${c.taxId}` : "",
    c?.email ? `Email: ${c.email}` : "",
    c?.telegram ? `Telegram: ${c.telegram}` : "",
    c?.phone ? `Phone: ${c.phone}` : "",
  ]
    .filter(Boolean)
    .join(" · ");

  const studioContactLines = [
    s.signatoryName
      ? `Representative: ${s.signatoryName}${s.signatoryTitle ? ` (${s.signatoryTitle})` : ""}`
      : "",
    s.address ? `Address: ${s.address}` : "",
    s.email ? `Email: ${s.email}` : "",
    s.phones ? `Phone: ${s.phones}` : "",
    s.website ? `Website: ${s.website}` : "",
  ]
    .filter(Boolean)
    .join(" · ");

  const summaryText = [
    `Agreement Reference: ${inv.no}${sourceDoc ? ` (linked to ${sourceDoc.no})` : ""} · Effective Date: ${longDate(inv.issue)}`,
    `Project: ${p?.name || inv.items[0]?.description || "Design Services Project"}${p?.code ? ` (${p.code})` : ""} · Agreed Fee: ${total}`,
    `Studio (Designer): ${s.businessName} — ${studioContactLines || "Details on file"}`,
    `Client: ${c?.name || "Client"} — ${clientContactLines || "Details on file"}`,
    `Schedule: Start ${longDate(p?.start || inv.issue)} · Target Completion ${longDate(p?.due || inv.due)}`,
  ].join("\n");

  const extraRatesText =
    inv.includeRates && s.extraRates.length > 0
      ? s.extraRates
          .map((r) => `• ${r.label} (${r.price}): ${r.detail}`)
          .join("\n")
      : "Additional out-of-scope services or urgent rush requests require written approval and fee confirmation prior to execution.";

  const customTermsText = s.designTerms
    .map((t) => `${t.label}: ${t.text}`)
    .join("\n\n");

  const clauses: Clause[] = [
    {
      kind: "summary",
      title: "Parties & Project Summary",
      text: summaryText,
    },
    {
      title: "1. Appointment & Scope of Services",
      text: `The Client hereby appoints ${s.businessName} ("the Designer") to perform the creative and design services described below for the project "${p?.name || inv.items[0]?.description || "Design Project"}". The parties' authorized representatives for day-to-day direction and approvals are ${s.signatoryName} for the Designer and ${inv.confirmedBy || c?.contact || c?.name || "the Client's designated representative"} for the Client.\n\nIncluded Deliverables:\n${scopeLines}`,
    },
    {
      title: "2. Exclusions & Third-Party Purchases",
      text: "Only the deliverables expressly listed in Section 1 are included in the agreed fee. Printing, physical fabrication, signage installation, commercial photography, videography, copywriting, translation, paid stock imagery, licensed commercial fonts, web hosting, domain registration, and third-party vendor services are excluded unless explicitly itemized in the approved quotation. Any required third-party purchases will be billed separately or purchased directly by the Client after written approval.",
    },
    {
      title: "3. Design Process, Milestones & Client Approvals",
      text: "Work commences only after: (a) written acceptance or signature of this Agreement, (b) receipt of the initial deposit, and (c) delivery of all mandatory Client brand assets, copy, dimensions, and brief details. The Designer presents concepts and drafts at scheduled review milestones. To maintain clarity and avoid conflicting direction, the Client agrees to consolidate feedback from all internal stakeholders through one designated contact person. Written approval (including confirmed email or Telegram approval) of a milestone authorizes the Designer to proceed to the next stage.",
    },
    {
      title: "4. Revisions, Change Orders & Extra Service Rates",
      text: `Included revision rounds are limited to those specified in the Deliverables above. A revision refines an already selected creative direction (such as typography, color balance, spacing, or minor layout adjustments). Requesting an entirely new creative direction, changing approved copy/dimensions after layout lock, or adding new deliverables constitutes a Change Order and will be quoted separately before work proceeds.\n\nStandard Extra Service Rates:\n${extraRatesText}`,
    },
    {
      title: "5. Fees, Payment Schedule & Invoicing",
      text: `Total Agreed Fee: ${total} (Subtotal: ${subtotal}${inv.discount ? `, Discount: ${inv.discount}%` : ""}).\n\nPayment Terms: ${s.paymentTerms.join(" ")}${inv.showSchedule ? ` Based on the 50/50 schedule, an initial deposit of ${deposit} is due prior to design commencement and the remaining balance of ${deposit} is due upon final delivery prior to release of final production files.` : ""}\n\nPayment Instructions: Payments are payable to ${s.abaName || s.businessName}${s.abaNumber ? `, ABA Account ${s.abaNumber}` : ""} via bank transfer, KHQR, or other agreed studio payment channel referenced on the accompanying Invoice. Applicable government taxes, bank transfer fees, or approved reimbursable expenses are borne by the Client unless stated otherwise.`,
    },
    {
      title: "6. Project Timeline, Client Responsibilities & Delays",
      text: `Target timeline is estimated from ${longDate(p?.start || inv.issue)} through ${longDate(p?.due || inv.due)}, subject to timely Client cooperation. The Client agrees to provide accurate text, logos, product photography, measurements, and approvals within three (3) business days of each Designer submission unless another review period is agreed in writing. Delays in Client feedback, missing content, or late deposit payment automatically extend the completion schedule by at least the duration of the delay, and the Designer may re-queue the project within studio capacity if a project remains idle for more than fourteen (14) consecutive days.`,
    },
    {
      title: "7. Client Materials, Proofreading & Production Responsibility",
      text: "The Client warrants that all text, trademarks, photographs, fonts, and reference materials supplied to the Designer are owned by the Client or properly licensed for commercial use, and agrees to indemnify the Designer against claims arising from Client-supplied materials. Before final export or print production, the Client is solely responsible for verifying all spelling, dates, prices, phone numbers, QR codes, barcodes, legal disclaimers, and dimensions. While the Designer prepares files to agreed technical specifications, third-party printers, fabricators, and publishers remain responsible for color calibration, substrate variation, trimming tolerances, and production proofs.",
    },
    {
      title: "8. Intellectual Property, Ownership & Source Files",
      text: "All preliminary concepts, working drafts, rejected directions, reusable templates, design systems, and pre-existing tools remain the exclusive property of the Designer. Upon receipt of full and final payment of all fees due under this Agreement, the Designer assigns or grants to the Client the commercial usage rights in the final approved original design deliverables for the agreed business purpose. Review proofs provided prior to final payment may be used strictly for internal evaluation and may not be published, printed, or distributed. Native editable source files (such as AI, PSD, Figma, or INDD files) are transferred only if expressly listed in the Deliverables; third-party fonts, stock assets, and software plugins remain subject to their respective third-party licenses.",
    },
    {
      title: "9. Confidentiality & Studio Portfolio Rights",
      text: "Each party agrees to keep confidential all non-public business, financial, pricing, product launch, and strategic information disclosed by the other party in connection with this project, and to use such information solely for performing obligations under this Agreement. This obligation does not apply to information that becomes publicly available without breach or is required to be disclosed by law. Unless the parties execute a separate written non-disclosure or embargo addendum, the Designer reserves the right to showcase the completed, publicly launched work in its portfolio, website, pitch decks, and social channels with standard client attribution.",
    },
    {
      title: "10. Suspension, Cancellation & Termination",
      text: `${customTermsText}\n\nEither party may terminate this Agreement for a material breach if the breaching party fails to cure the breach within seven (7) days of receiving written notice. The Designer may suspend work immediately upon written notice if any invoice or deposit is overdue by more than seven (7) days. In the event of cancellation or early termination not caused by the Designer's uncured breach, the Client shall compensate the Designer for the greater of: (a) 50% of the total quoted project fee upon cancellation after signing, or (b) all completed milestones, work-in-progress hours, and approved third-party commitments incurred up to the termination date.`,
    },
    {
      title: "11. Delivery, Inspection & Final Acceptance",
      text: "Upon completion and settlement of required payments, the Designer will transmit final deliverables via the agreed digital or physical handover channel accompanied by a formal Delivery Note. The Client shall inspect delivered files within seven (7) calendar days of receipt and notify the Designer in writing of any technical defect or material deviation from the approved scope. Signing the Delivery Note confirms physical/digital receipt of the files. Requests to add new formats, dimensions, or post-approval edits after acceptance are billed under the Extra Service Rates or a separate Change Order.",
    },
    {
      title: "12. Limitation of Liability, Force Majeure & General Provisions",
      text: "To the maximum extent permitted by applicable law, the Designer's aggregate liability arising out of or relating to this Agreement shall not exceed the total fees actually paid by the Client to the Designer under this Agreement, and neither party shall be liable for indirect, incidental, lost-profit, or consequential damages. Neither party is liable for delays caused by events beyond reasonable control (force majeure). The Designer acts as an independent contractor and not an employee or partner of the Client. Any amendment to this Agreement must be confirmed in writing by both parties. Disputes shall first be addressed through good-faith negotiation between the parties' authorized representatives. By signing below, both representatives confirm authority to bind their respective organizations and accept all terms herein.",
    },
  ];

  if (inv.agreementText?.trim()) {
    clauses.push({
      title: "13. Special & Additional Agreed Clauses",
      text: inv.agreementText.trim(),
    });
  }
  if (inv.notes?.trim()) {
    clauses.push({ title: "Project Notes", text: inv.notes.trim() });
  }

  return clauses;
}

export function agreementPages(inv: Invoice, db: DB): Clause[][] {
  const rawClauses = buildAgreementClauses(inv, db);
  // Expand any oversized clause cleanly on paragraph/sentence boundaries.
  const expanded: Clause[] = [];
  for (const clause of rawClauses) {
    const parts = splitTextAtBoundary(clause.text, 1500);
    parts.forEach((text, idx) => {
      expanded.push({
        ...(clause.kind ? { kind: clause.kind } : {}),
        title: idx === 0 ? clause.title : `${clause.title} (continued)`,
        text,
      });
    });
  }

  // Estimate A4 content line budget carefully:
  // ~82 chars per line at 9.5pt on 182mm printable width; ~44 lines fit per A4 page above footer,
  // and final page needs ~11 lines reserved for the side-by-side DocumentSignatures block.
  const MAX_LINES_PER_PAGE = 42;
  const SIGNATURE_RESERVE_LINES = 12;

  const estimateLines = (clause: Clause) => {
    const paragraphs = clause.text.split("\n");
    const textLines = paragraphs.reduce(
      (sum, line) => sum + Math.max(1, Math.ceil(line.length / 84)),
      0,
    );
    return textLines + (clause.kind === "summary" ? 4.5 : 3);
  };

  const pages: Clause[][] = [];
  let current: Clause[] = [];
  let usedLines = 0;

  for (const clause of expanded) {
    const lines = estimateLines(clause);
    if (current.length > 0 && usedLines + lines > MAX_LINES_PER_PAGE) {
      pages.push(current);
      current = [];
      usedLines = 0;
    }
    current.push(clause);
    usedLines += lines;
  }
  if (current.length > 0) pages.push(current);

  // Ensure the last page has room for the signature block without overflowing A4
  const lastPage = pages[pages.length - 1];
  if (lastPage) {
    const lastLines = lastPage.reduce((sum, c) => sum + estimateLines(c), 0);
    if (
      lastLines + SIGNATURE_RESERVE_LINES > MAX_LINES_PER_PAGE &&
      lastPage.length > 1
    ) {
      const moved = lastPage.pop()!;
      pages.push([moved]);
    }
  }

  // Ensure minimum 2 pages for standard agreement flow if content is very short, without leaving an empty page
  if (pages.length === 1 && (pages[0]?.length ?? 0) > 2) {
    const splitAt = Math.max(1, Math.floor(pages[0]!.length / 2));
    const first = pages[0]!.slice(0, splitAt);
    const second = pages[0]!.slice(splitAt);
    return [first, second];
  }

  return pages.filter((p) => p.length > 0);
}

export function AgreementDoc({ inv, db }: { inv: Invoice; db: DB }) {
  const pages = agreementPages(inv, db);
  return (
    <>
      {pages.map((clauses, index) => (
        <div className="paper agreement-paper" key={index}>
          <header className="agreement-header">
            <div>
              <h1>Design Services Agreement</h1>
              <p>
                {db.settings.businessName} · {inv.no}
              </p>
            </div>
            {db.settings.logo ? (
              <img src={db.settings.logo} alt={db.settings.businessName} />
            ) : (
              <div className="font-[Merriweather] text-[14pt] font-black text-[#2a2b2d]">
                RothVan<span className="text-[#c99a2e]">.</span>
              </div>
            )}
          </header>
          <div className="agreement-clauses flex-1">
            {clauses.map((clause, i) => (
              <section
                key={i}
                className={
                  clause.kind === "summary" ? "agreement-summary" : undefined
                }
              >
                <h2>{clause.title}</h2>
                <p>{clause.text}</p>
              </section>
            ))}
          </div>
          {index === pages.length - 1 && (
            <DocumentSignatures inv={inv} db={db} />
          )}
          <footer className="agreement-footer">
            <span>
              {inv.no} · {longDate(inv.issue)}
            </span>
            <span>
              Page {index + 1} of {pages.length}
            </span>
          </footer>
        </div>
      ))}
    </>
  );
}
