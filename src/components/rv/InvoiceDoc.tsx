import {
  documentKind,
  invoiceTotals,
  longDate,
  money,
  type DB,
  type Invoice,
} from "@/lib/store";
import { AgreementDoc } from "./AgreementDoc";
import { DocumentSignatures } from "./DocumentSignatures";

export function InvoiceDoc({ inv, db }: { inv: Invoice; db: DB }) {
  const s = db.settings;
  const c = db.clients.find((x) => x.id === inv.clientId);
  const p = db.projects.find((x) => x.id === inv.projectId);
  const t = invoiceTotals(inv);
  const cur = inv.currency;
  const kind = documentKind(inv);
  const delivery = kind === "Delivery note";
  if (kind === "Agreement") return <AgreementDoc inv={inv} db={db} />;
  const Kh = ({ k, e }: { k: string; e: string }) => (
    <div className="leading-tight">
      <div className="kh grey text-[8pt]">{k}</div>
      <div className="text-[8.5pt] font-semibold">{e}</div>
    </div>
  );
  return (
    <>
      <div className="paper">
        <div className="flex items-start justify-between gap-6">
          <h1 className="text-[24pt] font-extrabold leading-tight">
            {kind === "Invoice" && <span className="kh">វិក្កយបត្រ / </span>}
            {kind}
          </h1>
          <div className="text-right text-[8pt] grey">
            {s.logo ? (
              <img
                src={s.logo}
                alt=""
                className="mb-1 ml-auto h-12 object-contain"
              />
            ) : (
              <div className="mb-1 font-[Merriweather] text-[16pt] font-black text-[#2a2b2d]">
                RothVan<span className="text-[#c99a2e]">.</span>
              </div>
            )}
            {s.phones && <div>{s.phones}</div>}
            <div>{s.email}</div>
            <div>{s.website}</div>
            <div className="max-w-[60mm]">{s.address}</div>
          </div>
        </div>
        <div className="mt-6 flex justify-between gap-6">
          <div>
            <div className="text-[8.5pt]">
              <span className="kh grey">ល.រ</span> / no.{" "}
              <b className="text-[10pt]">{inv.no}</b>
              {p ? <span className="ml-2 grey">· {p.code}</span> : null}
            </div>
            <div className="mt-3 grey text-[8pt]">To</div>
            <div className="text-[11pt] font-bold">{c?.name ?? "—"}</div>
            {c?.contact && (
              <div>
                N: {c.contact}
                {c.position ? ` · ${c.position}` : ""}
              </div>
            )}
            {!c?.contact && c?.position && <div>{c.position}</div>}
            {c?.address && <div>{c.address}</div>}
            {c?.taxId && <div>Tax ID: {c.taxId}</div>}
            {c?.email && <div>E: {c.email}</div>}
            {c?.telegram && <div>TG: {c.telegram}</div>}
            {c?.phone && <div>T: {c.phone}</div>}
            {c?.website && <div>W: {c.website}</div>}
          </div>
          <div className="space-y-2 text-right">
            <div>
              <div className="kh grey text-[8pt]">កាលបរិច្ឆេទ / Issue Date</div>
              <b>{longDate(inv.issue)}</b>
            </div>
            <div>
              <div className="grey text-[8pt]">
                {kind === "Quotation"
                  ? "Valid until"
                  : delivery
                    ? "Delivery date"
                    : "Due date"}
              </div>
              <b>{longDate(inv.due)}</b>
            </div>
            {p && (
              <div>
                <div className="grey text-[8pt]">Project</div>
                <b>{p.name}</b>
              </div>
            )}
          </div>
        </div>
        <table className="mt-6 w-full border-collapse">
          <thead>
            <tr className="border-b border-[#bbb] text-left align-bottom">
              <th className="w-[10mm] pb-1.5">
                <Kh k="ល.រ" e="No." />
              </th>
              <th className="pb-1.5">
                <Kh k="បរិយាយ" e="Item Description" />
              </th>
              <th className="w-[14mm] pb-1.5 text-center">
                <Kh k="បរិមាណ" e="Qty" />
              </th>
              {!delivery && (
                <>
                  <th className="w-[24mm] pb-1.5 text-right">
                    <Kh k="តម្លៃ" e="Price" />
                  </th>
                  <th className="w-[26mm] pb-1.5 text-right">
                    <Kh k="សរុប" e="Amount" />
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {inv.items.map((it, i) => (
              <tr key={it.id} className="align-top border-b border-[#eee]">
                <td className="py-2.5">{String(i + 1).padStart(2, "0")}</td>
                <td className="py-2.5 pr-3">
                  <b>{it.description || "—"}</b>
                  {it.scope.trim() && (
                    <>
                      <div className="mt-1 grey text-[8.5pt]">
                        Scope of work
                      </div>
                      <ul className="list-disc pl-4">
                        {it.scope
                          .split("\n")
                          .filter(Boolean)
                          .map((l, k) => (
                            <li key={k}>{l}</li>
                          ))}
                      </ul>
                    </>
                  )}
                  {it.timeline && (
                    <div className="mt-1">
                      <span className="grey">Timeline:</span> {it.timeline}
                    </div>
                  )}
                </td>
                <td className="py-2.5 text-center">{it.qty}</td>
                {!delivery && (
                  <>
                    <td className="py-2.5 text-right">
                      {money(it.price, cur)}
                    </td>
                    <td className="py-2.5 text-right font-semibold">
                      {money(it.qty * it.price, cur)}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {inv.images.length > 0 && (
          <div className="mt-4 flex gap-2">
            {inv.images.map((im) => (
              <figure key={im.id} className="min-w-0 flex-1">
                <img
                  src={im.src}
                  alt=""
                  className="h-[32mm] w-full rounded-md object-cover"
                />
                {im.caption && (
                  <figcaption className="mt-0.5 text-center text-[7pt] grey">
                    {im.caption}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        )}
        <div className="flex-1" />
        {delivery && (
          <div className="mt-4 space-y-1.5">
            <p>
              <b>Delivery method:</b> {inv.deliveryMethod || "—"}
            </p>
            <p className="break-all">
              <b>Files / reference:</b> {inv.deliveryLink || "—"}
            </p>
            <p>
              <b>Received by:</b>{" "}
              {inv.confirmedBy || c?.contact || c?.name || "________________"}
            </p>
            <p>
              <b>Received on:</b>{" "}
              {inv.confirmedOn ? longDate(inv.confirmedOn) : "________________"}
            </p>
          </div>
        )}
        <hr />
        <div className="flex gap-8">
          <div className="flex-1 text-[8pt]">
            {!delivery && inv.includeTerms && (
              <>
                <b className="text-[9pt]">Design Terms:</b>
                <ul className="mt-1 list-disc space-y-1 pl-4">
                  {s.designTerms.map((d, k) => (
                    <li key={k}>
                      <b>{d.label}:</b> {d.text}
                    </li>
                  ))}
                </ul>
              </>
            )}
            {inv.notes && (
              <p className="mt-2">
                <b>Notes:</b> {inv.notes}
              </p>
            )}
          </div>
          {!delivery && (
            <div className="w-[62mm] shrink-0 space-y-1">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{money(t.subtotal, cur)}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount ({inv.discount || 0}%)</span>
                <span>
                  {t.discountAmt
                    ? "−" + money(t.discountAmt, cur)
                    : money(0, cur)}
                </span>
              </div>
              <div className="border-t border-[#bbb] pt-2">
                <div className="text-[9pt] font-semibold">Grand Total</div>
                <div className="text-[20pt] font-extrabold leading-tight">
                  {money(t.total, cur)}
                </div>
              </div>
              {inv.showSchedule && (
                <div className="text-[8pt] grey">
                  <div className="flex justify-between">
                    <span>50% deposit</span>
                    <span>{money(t.total / 2, cur)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>50% balance</span>
                    <span>{money(t.total / 2, cur)}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        {delivery && <DocumentSignatures inv={inv} db={db} />}
      </div>

      {!delivery && (
        <div className="paper">
          <div className="flex flex-1 gap-10">
            <div className="flex flex-1 flex-col">
              {inv.includeRates && (
                <>
                  <b className="text-[11pt]">Extra Service Rates</b>
                  <p className="grey text-[8pt]">
                    All extra services are subject to client pre-approval before
                    work proceeds.
                  </p>
                  <div className="mt-3 space-y-2.5">
                    {s.extraRates.map((r, k) => (
                      <div key={k} className="flex justify-between gap-3">
                        <div>
                          <b>{r.label}</b>
                          <div className="grey text-[8pt]">{r.detail}</div>
                        </div>
                        <b className="shrink-0">{r.price}</b>
                      </div>
                    ))}
                  </div>
                </>
              )}
              <p className="mx-auto mt-12 max-w-[75mm] text-center italic">
                {s.thankYou}
              </p>
            </div>
            <div className="flex flex-1 flex-col">
              <b className="text-[11pt]">Payment Terms:</b>
              <ul className="mt-1 list-disc pl-4">
                {s.paymentTerms.map((pt, k) => (
                  <li key={k}>{pt}</li>
                ))}
              </ul>
              <b className="mt-6 text-[11pt]">Payment Info:</b>
              <div className="mt-1 flex justify-between gap-3">
                <div className="space-y-0.5">
                  <div>We accept payment by cash / KHQR</div>
                  <div>
                    Account ABA number: <b>{s.abaNumber || "—"}</b>
                  </div>
                  <div>
                    A/C Name: <b>{s.abaName}</b>
                  </div>
                </div>
                <div className="shrink-0 text-center">
                  {s.khqr ? (
                    <img
                      src={s.khqr}
                      alt="KHQR"
                      className="h-[34mm] w-[34mm] object-contain"
                    />
                  ) : (
                    <div className="grid h-[34mm] w-[34mm] place-items-center rounded border border-dashed border-[#bbb] text-[7pt] grey">
                      KHQR
                    </div>
                  )}
                  <div className="mt-1 text-[7pt] grey">RothVan by V.Neou</div>
                </div>
              </div>
              <div className="flex-1" />
            </div>
          </div>
          <DocumentSignatures inv={inv} db={db} />
        </div>
      )}
    </>
  );
}
