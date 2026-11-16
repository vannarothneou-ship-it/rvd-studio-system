import { documentKind, longDate, type DB, type Invoice } from "@/lib/store";

export function DocumentSignatures({ inv, db }: { inv: Invoice; db: DB }) {
  const client = db.clients.find((c) => c.id === inv.clientId);
  const kind = documentKind(inv);
  const clientRoleLabel =
    kind === "Agreement"
      ? "Client Acceptance & Signature"
      : kind === "Delivery note"
        ? "Received & Confirmed by Client"
        : "Client Approval & Signature";

  return (
    <div className="document-signatures">
      <div className="signature-col">
        <div className="signature-role">Authorized Studio Signature</div>
        <div className="signature-space">
          {db.settings.signature ? (
            <img src={db.settings.signature} alt="Studio signature" />
          ) : null}
        </div>
        <div className="signature-line">
          <b>{db.settings.signatoryName || db.settings.ownerName}</b>
          <div>{db.settings.signatoryTitle || "Authorized representative"}</div>
          <div>For {db.settings.businessName}</div>
          <div>
            Date:{" "}
            {inv.sent || inv.confirmedOn
              ? longDate(inv.issue)
              : "__________________"}
          </div>
        </div>
      </div>
      <div className="signature-col">
        <div className="signature-role">{clientRoleLabel}</div>
        <div className="signature-space">
          {inv.clientSignature ? (
            <img src={inv.clientSignature} alt="Client signature" />
          ) : null}
        </div>
        <div className="signature-line">
          <b>
            {inv.confirmedBy ||
              client?.contact ||
              client?.name ||
              "Client signatory"}
          </b>
          <div>{client?.position || "Authorized client representative"}</div>
          <div>For {client?.name || "Client"}</div>
          <div>
            Date:{" "}
            {inv.confirmedOn ? longDate(inv.confirmedOn) : "__________________"}
          </div>
        </div>
      </div>
    </div>
  );
}
