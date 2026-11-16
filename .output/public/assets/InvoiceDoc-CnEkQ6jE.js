import { A as longDate, D as invoiceTotals, X as require_jsx_runtime, b as documentKind, j as money } from "./utils-BZY5Yoq-.js";
//#region src/components/rv/DocumentSignatures.tsx
var import_jsx_runtime = require_jsx_runtime();
function DocumentSignatures({ inv, db }) {
	const client = db.clients.find((c) => c.id === inv.clientId);
	const kind = documentKind(inv);
	const clientRoleLabel = kind === "Agreement" ? "Client Acceptance & Signature" : kind === "Delivery note" ? "Received & Confirmed by Client" : "Client Approval & Signature";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "document-signatures",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "signature-col",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "signature-role",
					children: "Authorized Studio Signature"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "signature-space",
					children: db.settings.signature ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: db.settings.signature,
						alt: "Studio signature"
					}) : null
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "signature-line",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: db.settings.signatoryName || db.settings.ownerName }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: db.settings.signatoryTitle || "Authorized representative" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["For ", db.settings.businessName] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							"Date:",
							" ",
							inv.sent || inv.confirmedOn ? longDate(inv.issue) : "__________________"
						] })
					]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "signature-col",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "signature-role",
					children: clientRoleLabel
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "signature-space",
					children: inv.clientSignature ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: inv.clientSignature,
						alt: "Client signature"
					}) : null
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "signature-line",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: inv.confirmedBy || client?.contact || client?.name || "Client signatory" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: client?.position || "Authorized client representative" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["For ", client?.name || "Client"] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							"Date:",
							" ",
							inv.confirmedOn ? longDate(inv.confirmedOn) : "__________________"
						] })
					]
				})
			]
		})]
	});
}
//#endregion
//#region src/components/rv/AgreementDoc.tsx
function splitTextAtBoundary(text, maxChars) {
	if (text.length <= maxChars) return [text];
	const chunks = [];
	let remaining = text.trim();
	while (remaining.length > maxChars) {
		let cut = remaining.lastIndexOf("\n\n", maxChars);
		if (cut < maxChars * .45) cut = remaining.lastIndexOf("\n", maxChars);
		if (cut < maxChars * .45) cut = remaining.lastIndexOf(". ", maxChars);
		if (cut < maxChars * .45) cut = remaining.lastIndexOf(" ", maxChars);
		if (cut <= 0) cut = maxChars;
		else if (remaining[cut] === ".") cut += 1;
		chunks.push(remaining.slice(0, cut).trim());
		remaining = remaining.slice(cut).trim();
	}
	if (remaining) chunks.push(remaining);
	return chunks;
}
function buildAgreementClauses(inv, db) {
	const c = db.clients.find((x) => x.id === inv.clientId);
	const p = db.projects.find((x) => x.id === inv.projectId);
	const s = db.settings;
	const totals = invoiceTotals(inv);
	const total = money(totals.total, inv.currency);
	const subtotal = money(totals.subtotal, inv.currency);
	const deposit = money(totals.total / 2, inv.currency);
	const sourceDoc = inv.sourceId ? db.invoices.find((x) => x.id === inv.sourceId) : void 0;
	const scopeLines = inv.items.map((item, idx) => {
		const unitPrice = money(item.price, inv.currency);
		const lineTotal = money(item.qty * item.price, inv.currency);
		const scopeDetail = item.scope?.trim() ? item.scope.split("\n").map((line) => line.replace(/^[•·-]\s*/, "").trim()).filter(Boolean).join(" · ") : "Deliverables and specifications as confirmed in writing.";
		return `${idx + 1}. ${item.description || "Design deliverable"} (Qty: ${item.qty} × ${unitPrice} = ${lineTotal} · Est. timeline: ${item.timeline || "As agreed"})\n   Scope & Deliverables: ${scopeDetail}`;
	}).join("\n\n");
	const clientContactLines = [
		c?.contact ? `Representative: ${c.contact}${c.position ? ` (${c.position})` : ""}` : "",
		c?.address ? `Address: ${c.address}` : "",
		c?.taxId ? `Tax / Reg ID: ${c.taxId}` : "",
		c?.email ? `Email: ${c.email}` : "",
		c?.telegram ? `Telegram: ${c.telegram}` : "",
		c?.phone ? `Phone: ${c.phone}` : ""
	].filter(Boolean).join(" · ");
	const studioContactLines = [
		s.signatoryName ? `Representative: ${s.signatoryName}${s.signatoryTitle ? ` (${s.signatoryTitle})` : ""}` : "",
		s.address ? `Address: ${s.address}` : "",
		s.email ? `Email: ${s.email}` : "",
		s.phones ? `Phone: ${s.phones}` : "",
		s.website ? `Website: ${s.website}` : ""
	].filter(Boolean).join(" · ");
	const summaryText = [
		`Agreement Reference: ${inv.no}${sourceDoc ? ` (linked to ${sourceDoc.no})` : ""} · Effective Date: ${longDate(inv.issue)}`,
		`Project: ${p?.name || inv.items[0]?.description || "Design Services Project"}${p?.code ? ` (${p.code})` : ""} · Agreed Fee: ${total}`,
		`Studio (Designer): ${s.businessName} — ${studioContactLines || "Details on file"}`,
		`Client: ${c?.name || "Client"} — ${clientContactLines || "Details on file"}`,
		`Schedule: Start ${longDate(p?.start || inv.issue)} · Target Completion ${longDate(p?.due || inv.due)}`
	].join("\n");
	const extraRatesText = inv.includeRates && s.extraRates.length > 0 ? s.extraRates.map((r) => `• ${r.label} (${r.price}): ${r.detail}`).join("\n") : "Additional out-of-scope services or urgent rush requests require written approval and fee confirmation prior to execution.";
	const customTermsText = s.designTerms.map((t) => `${t.label}: ${t.text}`).join("\n\n");
	const clauses = [
		{
			kind: "summary",
			title: "Parties & Project Summary",
			text: summaryText
		},
		{
			title: "1. Appointment & Scope of Services",
			text: `The Client hereby appoints ${s.businessName} ("the Designer") to perform the creative and design services described below for the project "${p?.name || inv.items[0]?.description || "Design Project"}". The parties' authorized representatives for day-to-day direction and approvals are ${s.signatoryName} for the Designer and ${inv.confirmedBy || c?.contact || c?.name || "the Client's designated representative"} for the Client.\n\nIncluded Deliverables:\n${scopeLines}`
		},
		{
			title: "2. Exclusions & Third-Party Purchases",
			text: "Only the deliverables expressly listed in Section 1 are included in the agreed fee. Printing, physical fabrication, signage installation, commercial photography, videography, copywriting, translation, paid stock imagery, licensed commercial fonts, web hosting, domain registration, and third-party vendor services are excluded unless explicitly itemized in the approved quotation. Any required third-party purchases will be billed separately or purchased directly by the Client after written approval."
		},
		{
			title: "3. Design Process, Milestones & Client Approvals",
			text: "Work commences only after: (a) written acceptance or signature of this Agreement, (b) receipt of the initial deposit, and (c) delivery of all mandatory Client brand assets, copy, dimensions, and brief details. The Designer presents concepts and drafts at scheduled review milestones. To maintain clarity and avoid conflicting direction, the Client agrees to consolidate feedback from all internal stakeholders through one designated contact person. Written approval (including confirmed email or Telegram approval) of a milestone authorizes the Designer to proceed to the next stage."
		},
		{
			title: "4. Revisions, Change Orders & Extra Service Rates",
			text: `Included revision rounds are limited to those specified in the Deliverables above. A revision refines an already selected creative direction (such as typography, color balance, spacing, or minor layout adjustments). Requesting an entirely new creative direction, changing approved copy/dimensions after layout lock, or adding new deliverables constitutes a Change Order and will be quoted separately before work proceeds.\n\nStandard Extra Service Rates:\n${extraRatesText}`
		},
		{
			title: "5. Fees, Payment Schedule & Invoicing",
			text: `Total Agreed Fee: ${total} (Subtotal: ${subtotal}${inv.discount ? `, Discount: ${inv.discount}%` : ""}).\n\nPayment Terms: ${s.paymentTerms.join(" ")}${inv.showSchedule ? ` Based on the 50/50 schedule, an initial deposit of ${deposit} is due prior to design commencement and the remaining balance of ${deposit} is due upon final delivery prior to release of final production files.` : ""}\n\nPayment Instructions: Payments are payable to ${s.abaName || s.businessName}${s.abaNumber ? `, ABA Account ${s.abaNumber}` : ""} via bank transfer, KHQR, or other agreed studio payment channel referenced on the accompanying Invoice. Applicable government taxes, bank transfer fees, or approved reimbursable expenses are borne by the Client unless stated otherwise.`
		},
		{
			title: "6. Project Timeline, Client Responsibilities & Delays",
			text: `Target timeline is estimated from ${longDate(p?.start || inv.issue)} through ${longDate(p?.due || inv.due)}, subject to timely Client cooperation. The Client agrees to provide accurate text, logos, product photography, measurements, and approvals within three (3) business days of each Designer submission unless another review period is agreed in writing. Delays in Client feedback, missing content, or late deposit payment automatically extend the completion schedule by at least the duration of the delay, and the Designer may re-queue the project within studio capacity if a project remains idle for more than fourteen (14) consecutive days.`
		},
		{
			title: "7. Client Materials, Proofreading & Production Responsibility",
			text: "The Client warrants that all text, trademarks, photographs, fonts, and reference materials supplied to the Designer are owned by the Client or properly licensed for commercial use, and agrees to indemnify the Designer against claims arising from Client-supplied materials. Before final export or print production, the Client is solely responsible for verifying all spelling, dates, prices, phone numbers, QR codes, barcodes, legal disclaimers, and dimensions. While the Designer prepares files to agreed technical specifications, third-party printers, fabricators, and publishers remain responsible for color calibration, substrate variation, trimming tolerances, and production proofs."
		},
		{
			title: "8. Intellectual Property, Ownership & Source Files",
			text: "All preliminary concepts, working drafts, rejected directions, reusable templates, design systems, and pre-existing tools remain the exclusive property of the Designer. Upon receipt of full and final payment of all fees due under this Agreement, the Designer assigns or grants to the Client the commercial usage rights in the final approved original design deliverables for the agreed business purpose. Review proofs provided prior to final payment may be used strictly for internal evaluation and may not be published, printed, or distributed. Native editable source files (such as AI, PSD, Figma, or INDD files) are transferred only if expressly listed in the Deliverables; third-party fonts, stock assets, and software plugins remain subject to their respective third-party licenses."
		},
		{
			title: "9. Confidentiality & Studio Portfolio Rights",
			text: "Each party agrees to keep confidential all non-public business, financial, pricing, product launch, and strategic information disclosed by the other party in connection with this project, and to use such information solely for performing obligations under this Agreement. This obligation does not apply to information that becomes publicly available without breach or is required to be disclosed by law. Unless the parties execute a separate written non-disclosure or embargo addendum, the Designer reserves the right to showcase the completed, publicly launched work in its portfolio, website, pitch decks, and social channels with standard client attribution."
		},
		{
			title: "10. Suspension, Cancellation & Termination",
			text: `${customTermsText}\n\nEither party may terminate this Agreement for a material breach if the breaching party fails to cure the breach within seven (7) days of receiving written notice. The Designer may suspend work immediately upon written notice if any invoice or deposit is overdue by more than seven (7) days. In the event of cancellation or early termination not caused by the Designer's uncured breach, the Client shall compensate the Designer for the greater of: (a) 50% of the total quoted project fee upon cancellation after signing, or (b) all completed milestones, work-in-progress hours, and approved third-party commitments incurred up to the termination date.`
		},
		{
			title: "11. Delivery, Inspection & Final Acceptance",
			text: "Upon completion and settlement of required payments, the Designer will transmit final deliverables via the agreed digital or physical handover channel accompanied by a formal Delivery Note. The Client shall inspect delivered files within seven (7) calendar days of receipt and notify the Designer in writing of any technical defect or material deviation from the approved scope. Signing the Delivery Note confirms physical/digital receipt of the files. Requests to add new formats, dimensions, or post-approval edits after acceptance are billed under the Extra Service Rates or a separate Change Order."
		},
		{
			title: "12. Limitation of Liability, Force Majeure & General Provisions",
			text: "To the maximum extent permitted by applicable law, the Designer's aggregate liability arising out of or relating to this Agreement shall not exceed the total fees actually paid by the Client to the Designer under this Agreement, and neither party shall be liable for indirect, incidental, lost-profit, or consequential damages. Neither party is liable for delays caused by events beyond reasonable control (force majeure). The Designer acts as an independent contractor and not an employee or partner of the Client. Any amendment to this Agreement must be confirmed in writing by both parties. Disputes shall first be addressed through good-faith negotiation between the parties' authorized representatives. By signing below, both representatives confirm authority to bind their respective organizations and accept all terms herein."
		}
	];
	if (inv.agreementText?.trim()) clauses.push({
		title: "13. Special & Additional Agreed Clauses",
		text: inv.agreementText.trim()
	});
	if (inv.notes?.trim()) clauses.push({
		title: "Project Notes",
		text: inv.notes.trim()
	});
	return clauses;
}
function agreementPages(inv, db) {
	const rawClauses = buildAgreementClauses(inv, db);
	const expanded = [];
	for (const clause of rawClauses) splitTextAtBoundary(clause.text, 1500).forEach((text, idx) => {
		expanded.push({
			...clause.kind ? { kind: clause.kind } : {},
			title: idx === 0 ? clause.title : `${clause.title} (continued)`,
			text
		});
	});
	const MAX_LINES_PER_PAGE = 46;
	const SIGNATURE_RESERVE_LINES = 11;
	const estimateLines = (clause) => {
		return clause.text.split("\n").reduce((sum, line) => sum + Math.max(1, Math.ceil(line.length / 94)), 0) + (clause.kind === "summary" ? 4 : 2.8);
	};
	const pages = [];
	let current = [];
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
	const lastPage = pages[pages.length - 1];
	if (lastPage) {
		if (lastPage.reduce((sum, c) => sum + estimateLines(c), 0) + SIGNATURE_RESERVE_LINES > MAX_LINES_PER_PAGE && lastPage.length > 1) {
			const moved = lastPage.pop();
			pages.push([moved]);
		}
	}
	if (pages.length === 1 && (pages[0]?.length ?? 0) > 2) {
		const splitAt = Math.max(1, Math.floor(pages[0].length / 2));
		return [pages[0].slice(0, splitAt), pages[0].slice(splitAt)];
	}
	return pages.filter((p) => p.length > 0);
}
function AgreementDoc({ inv, db }) {
	const pages = agreementPages(inv, db);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: pages.map((clauses, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "paper agreement-paper",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "agreement-header",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Design Services Agreement" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
					db.settings.businessName,
					" · ",
					inv.no
				] })] }), db.settings.logo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: db.settings.logo,
					alt: db.settings.businessName
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "font-[Merriweather] text-[14pt] font-black text-[#2a2b2d]",
					children: ["RothVan", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[#c99a2e]",
						children: "."
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "agreement-clauses flex-1",
				children: clauses.map((clause, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: clause.kind === "summary" ? "agreement-summary" : void 0,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: clause.title }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: clause.text })]
				}, i))
			}),
			index === pages.length - 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DocumentSignatures, {
				inv,
				db
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
				className: "agreement-footer",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
					inv.no,
					" · ",
					longDate(inv.issue)
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
					"Page ",
					index + 1,
					" of ",
					pages.length
				] })]
			})
		]
	}, index)) });
}
//#endregion
//#region src/components/rv/InvoiceDoc.tsx
function InvoiceDoc({ inv, db }) {
	const s = db.settings;
	const c = db.clients.find((x) => x.id === inv.clientId);
	const p = db.projects.find((x) => x.id === inv.projectId);
	const t = invoiceTotals(inv);
	const cur = inv.currency;
	const kind = documentKind(inv);
	const delivery = kind === "Delivery note";
	if (kind === "Agreement") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgreementDoc, {
		inv,
		db
	});
	const Kh = ({ k, e }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "leading-tight",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "kh grey text-[8pt]",
			children: k
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-[8.5pt] font-semibold",
			children: e
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "paper",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
					className: "text-[24pt] font-extrabold leading-tight",
					children: [kind === "Invoice" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "kh",
						children: "វិក្កយបត្រ / "
					}), kind]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-right text-[8pt] grey",
					children: [
						s.logo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: s.logo,
							alt: "",
							className: "mb-1 ml-auto h-12 object-contain"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-1 font-[Merriweather] text-[16pt] font-black text-[#2a2b2d]",
							children: ["RothVan", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[#c99a2e]",
								children: "."
							})]
						}),
						s.phones && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: s.phones }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: s.email }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: s.website }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "max-w-[60mm]",
							children: s.address
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex justify-between gap-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-[8.5pt]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "kh grey",
								children: "ល.រ"
							}),
							" / no.",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", {
								className: "text-[10pt]",
								children: inv.no
							}),
							p ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "ml-2 grey",
								children: ["· ", p.code]
							}) : null
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 grey text-[8pt]",
						children: "To"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[11pt] font-bold",
						children: c?.name ?? "—"
					}),
					c?.contact && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						"N: ",
						c.contact,
						c.position ? ` · ${c.position}` : ""
					] }),
					!c?.contact && c?.position && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: c.position }),
					c?.address && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: c.address }),
					c?.taxId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["Tax ID: ", c.taxId] }),
					c?.email && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["E: ", c.email] }),
					c?.telegram && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["TG: ", c.telegram] }),
					c?.phone && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["T: ", c.phone] }),
					c?.website && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["W: ", c.website] })
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2 text-right",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "kh grey text-[8pt]",
							children: "កាលបរិច្ឆេទ / Issue Date"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: longDate(inv.issue) })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grey text-[8pt]",
							children: kind === "Quotation" ? "Valid until" : delivery ? "Delivery date" : "Due date"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: longDate(inv.due) })] }),
						p && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grey text-[8pt]",
							children: "Project"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: p.name })] })
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "mt-6 w-full border-collapse",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-b border-[#bbb] text-left align-bottom",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "w-[10mm] pb-1.5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kh, {
								k: "ល.រ",
								e: "No."
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "pb-1.5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kh, {
								k: "បរិយាយ",
								e: "Item Description"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "w-[14mm] pb-1.5 text-center",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kh, {
								k: "បរិមាណ",
								e: "Qty"
							})
						}),
						!delivery && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "w-[24mm] pb-1.5 text-right",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kh, {
								k: "តម្លៃ",
								e: "Price"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "w-[26mm] pb-1.5 text-right",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kh, {
								k: "សរុប",
								e: "Amount"
							})
						})] })
					]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: inv.items.map((it, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "align-top border-b border-[#eee]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "py-2.5",
							children: String(i + 1).padStart(2, "0")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							className: "py-2.5 pr-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: it.description || "—" }),
								it.scope.trim() && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-1 grey text-[8.5pt]",
									children: "Scope of work"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "list-disc pl-4",
									children: it.scope.split("\n").filter(Boolean).map((l, k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: l }, k))
								})] }),
								it.timeline && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "grey",
											children: "Timeline:"
										}),
										" ",
										it.timeline
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "py-2.5 text-center",
							children: it.qty
						}),
						!delivery && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "py-2.5 text-right",
							children: money(it.price, cur)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "py-2.5 text-right font-semibold",
							children: money(it.qty * it.price, cur)
						})] })
					]
				}, it.id)) })]
			}),
			inv.images.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 flex gap-2",
				children: inv.images.map((im) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", {
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: im.src,
						alt: "",
						className: "h-[32mm] w-full rounded-md object-cover"
					}), im.caption && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("figcaption", {
						className: "mt-0.5 text-center text-[7pt] grey",
						children: im.caption
					})]
				}, im.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex-1" }),
			delivery && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 space-y-1.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Delivery method:" }),
						" ",
						inv.deliveryMethod || "—"
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "break-all",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Files / reference:" }),
							" ",
							inv.deliveryLink || "—"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Received by:" }),
						" ",
						inv.confirmedBy || c?.contact || c?.name || "________________"
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Received on:" }),
						" ",
						inv.confirmedOn ? longDate(inv.confirmedOn) : "________________"
					] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("hr", {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex-1 text-[8pt]",
					children: [!delivery && inv.includeTerms && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", {
						className: "text-[9pt]",
						children: "Design Terms:"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-1 list-disc space-y-1 pl-4",
						children: s.designTerms.map((d, k) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [d.label, ":"] }),
							" ",
							d.text
						] }, k))
					})] }), inv.notes && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Notes:" }),
							" ",
							inv.notes
						]
					})]
				}), !delivery && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-[62mm] shrink-0 space-y-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Subtotal" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: money(t.subtotal, cur) })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								"Discount (",
								inv.discount || 0,
								"%)"
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t.discountAmt ? "−" + money(t.discountAmt, cur) : money(0, cur) })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "border-t border-[#bbb] pt-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[9pt] font-semibold",
								children: "Grand Total"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[20pt] font-extrabold leading-tight",
								children: money(t.total, cur)
							})]
						}),
						inv.showSchedule && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-[8pt] grey",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "50% deposit" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: money(t.total / 2, cur) })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "50% balance" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: money(t.total / 2, cur) })]
							})]
						})
					]
				})]
			}),
			delivery && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DocumentSignatures, {
				inv,
				db
			})
		]
	}), !delivery && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "paper",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-1 gap-10",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-1 flex-col",
				children: [inv.includeRates && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", {
						className: "text-[11pt]",
						children: "Extra Service Rates"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "grey text-[8pt]",
						children: "All extra services are subject to client pre-approval before work proceeds."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 space-y-2.5",
						children: s.extraRates.map((r, k) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: r.label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grey text-[8pt]",
								children: r.detail
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", {
								className: "shrink-0",
								children: r.price
							})]
						}, k))
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mx-auto mt-12 max-w-[75mm] text-center italic",
					children: s.thankYou
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-1 flex-col",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", {
						className: "text-[11pt]",
						children: "Payment Terms:"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-1 list-disc pl-4",
						children: s.paymentTerms.map((pt, k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: pt }, k))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", {
						className: "mt-6 text-[11pt]",
						children: "Payment Info:"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-1 flex justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-0.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: "We accept payment by cash / KHQR" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["Account ABA number: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: s.abaNumber || "—" })] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["A/C Name: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: s.abaName })] })
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "shrink-0 text-center",
							children: [s.khqr ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: s.khqr,
								alt: "KHQR",
								className: "h-[34mm] w-[34mm] object-contain"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid h-[34mm] w-[34mm] place-items-center rounded border border-dashed border-[#bbb] text-[7pt] grey",
								children: "KHQR"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-1 text-[7pt] grey",
								children: "RothVan by V.Neou"
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex-1" })
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DocumentSignatures, {
			inv,
			db
		})]
	})] });
}
//#endregion
export { InvoiceDoc as t };
