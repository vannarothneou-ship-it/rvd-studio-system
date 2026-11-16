import { A as needsFollowUp, D as isInvoice, E as invoiceView, J as require_react, K as require_jsx_runtime, W as useDB, Z as __toESM, k as money, o as DOCUMENT_TYPES, t as cn, v as documentKind, z as shortDate } from "./utils-Cz-OEK7u.js";
import { r as Outlet, t as useRouterState } from "./useRouterState-D2wr8goI.js";
import { t as Link } from "./link-C-cvVHqO.js";
import { i as Glass, l as Stat, n as Empty, o as PageHeader, s as Pill, t as Btn } from "./ui-Cikv6Nuk.js";
import { t as Plus } from "./plus-CPmKyuxY.js";
import { t as Search } from "./search-BJFbjdqu.js";
//#region src/routes/invoices.tsx?tsr-split=component
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var FILTERS = [
	"All",
	"Draft",
	"Sent",
	"Partial",
	"Paid",
	"Overdue"
];
function Invoices() {
	const path = useRouterState({ select: (r) => r.location.pathname });
	const db = useDB((d) => d);
	const [q, setQ] = (0, import_react.useState)("");
	const [f, setF] = (0, import_react.useState)("All");
	const [kind, setKind] = (0, import_react.useState)("All documents");
	if (path !== "/invoices") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {});
	const rows = db.invoices.map((i) => ({
		i,
		v: invoiceView(i, db),
		c: db.clients.find((c) => c.id === i.clientId)
	})).filter((r) => (kind === "All documents" || documentKind(r.i) === kind) && (f === "All" || (f === "Follow-up due" ? needsFollowUp(r.i) : r.v.status === f)) && (r.i.no + " " + (r.c?.name ?? "")).toLowerCase().includes(q.toLowerCase())).sort((a, b) => b.i.issue.localeCompare(a.i.issue));
	const all = db.invoices.filter(isInvoice).map((i) => invoiceView(i, db));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Invoices & documents",
			owner: db.settings.ownerName,
			action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/invoices/$id",
				params: { id: "new" },
				search: { kind: kind === "All documents" ? "Invoice" : kind },
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Btn, {
					variant: "gold",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }),
						"New ",
						kind === "All documents" ? "invoice" : kind.toLowerCase()
					]
				})
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-4 flex flex-wrap gap-2",
			children: ["All documents", ...DOCUMENT_TYPES].map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
				variant: k === kind ? "gold" : "ghost",
				onClick: () => {
					setKind(k);
					setF("All");
				},
				children: k
			}, k))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-4 grid grid-cols-2 gap-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Glass, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
				label: "Outstanding",
				value: money(all.filter((v) => v.status !== "Draft").reduce((a, v) => a + v.balanceUSD, 0))
			}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Glass, {
				delay: 60,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Overdue",
					tone: "neg",
					value: money(all.filter((v) => v.status === "Overdue").reduce((a, v) => a + v.balanceUSD, 0))
				})
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Glass, {
			delay: 120,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex flex-col gap-3 sm:flex-row sm:items-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "field pl-9",
						placeholder: "Search number or client",
						value: q,
						onChange: (e) => setQ(e.target.value)
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-1.5",
					children: [...kind === "Invoice" || kind === "All documents" ? FILTERS : [
						"All",
						"Draft",
						"Sent",
						"Accepted",
						"Declined",
						"Expired",
						"Signed",
						"Received"
					], "Follow-up due"].map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
						onClick: () => setF(x),
						className: cn("px-3 py-1 text-xs", f === x && "bg-primary text-primary-foreground"),
						children: x
					}, x))
				})]
			}), rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { children: "No invoices match." }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "divide-y divide-border",
				children: rows.map(({ i, v, c }, k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "rise",
					style: { animationDelay: `${k * 30}ms` },
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/invoices/$id",
						params: { id: i.id },
						className: "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl px-2 py-3 hover:bg-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate font-mono text-sm",
									children: i.no
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-muted-foreground",
									children: [
										documentKind(i),
										" · ",
										c?.name ?? "No client",
										" ·",
										" ",
										documentKind(i) === "Quotation" ? "valid until" : "due",
										" ",
										shortDate(i.due)
									]
								}),
								needsFollowUp(i) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-primary",
									children: ["Follow-up due ", shortDate(i.followUp ?? "")]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-right",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-mono text-sm",
									children: money(v.total, i.currency)
								}), v.balance > 0 && v.status !== "Draft" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-muted-foreground",
									children: [money(v.balance, i.currency), " due"]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, { s: v.status })]
						})]
					})
				}, i.id))
			})]
		})
	] });
}
//#endregion
export { Invoices as component };
