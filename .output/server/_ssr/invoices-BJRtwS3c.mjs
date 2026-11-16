import { i as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { G as shortDate, M as needsFollowUp, O as invoiceView, X as useDB, _ as compactMoney, b as documentKind, g as cn, i as DOCUMENT_TYPES, j as money, k as isInvoice } from "./utils-cyeqUyd1.mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { C as Plus, b as Search, nt as ChevronDown, tt as ChevronUp } from "../_libs/lucide-react.mjs";
import { i as Glass, n as Empty, o as PageHeader, s as Pill, t as Btn, u as Stat } from "./ui-D6kovTfR.mjs";
import { n as EditableBentoGrid, t as EditLayoutButton } from "./BentoGrid-CunpmRkD.mjs";
import { b as Link, g as Outlet, p as useRouterState } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/invoices-BJRtwS3c.js
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
var INITIAL_LIMIT = 10;
function Invoices() {
	const path = useRouterState({ select: (r) => r.location.pathname });
	const db = useDB((d) => d);
	const [q, setQ] = (0, import_react.useState)("");
	const [f, setF] = (0, import_react.useState)("All");
	const [kind, setKind] = (0, import_react.useState)("All documents");
	const [showAll, setShowAll] = (0, import_react.useState)(false);
	const [editingLayout, setEditingLayout] = (0, import_react.useState)(false);
	const rows = (0, import_react.useMemo)(() => db.invoices.map((i) => ({
		i,
		v: invoiceView(i, db),
		c: db.clients.find((c) => c.id === i.clientId)
	})).filter((r) => (kind === "All documents" || documentKind(r.i) === kind) && (f === "All" || (f === "Follow-up due" ? needsFollowUp(r.i) : r.v.status === f)) && (r.i.no + " " + (r.c?.name ?? "")).toLowerCase().includes(q.toLowerCase())).sort((a, b) => b.i.issue.localeCompare(a.i.issue)), [
		db,
		kind,
		f,
		q
	]);
	const all = (0, import_react.useMemo)(() => db.invoices.filter(isInvoice).map((i) => invoiceView(i, db)), [db]);
	const outstandingUSD = all.filter((v) => v.status !== "Draft").reduce((a, v) => a + v.balanceUSD, 0);
	const overdueUSD = all.filter((v) => v.status === "Overdue").reduce((a, v) => a + v.balanceUSD, 0);
	const visibleRows = showAll ? rows : rows.slice(0, INITIAL_LIMIT);
	const hasMore = rows.length > INITIAL_LIMIT;
	const widgets = (0, import_react.useMemo)(() => [
		{
			id: "invOutstanding",
			title: "Outstanding",
			defaultSpan: 6,
			render: () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Glass, {
				className: "h-full",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Outstanding",
					value: compactMoney(outstandingUSD),
					fullValue: money(outstandingUSD)
				})
			})
		},
		{
			id: "invOverdue",
			title: "Overdue",
			defaultSpan: 6,
			render: () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Glass, {
				delay: 60,
				className: "h-full",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Overdue",
					tone: "neg",
					value: compactMoney(overdueUSD),
					fullValue: money(overdueUSD)
				})
			})
		},
		{
			id: "invLedger",
			title: "Documents list",
			defaultSpan: 12,
			render: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Glass, {
				delay: 120,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-4 flex flex-col gap-3 sm:flex-row sm:items-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "field pl-9",
							placeholder: "Search number or client",
							value: q,
							onChange: (e) => {
								setQ(e.target.value);
								setShowAll(false);
							}
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
							onClick: () => {
								setF(x);
								setShowAll(false);
							},
							className: cn("px-3 py-1 text-xs", f === x && "bg-primary text-primary-foreground"),
							children: x
						}, x))
					})]
				}), rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { children: "No invoices match." }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "divide-y divide-border",
					children: visibleRows.map(({ i, v, c }, k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "rise",
						style: { animationDelay: `${Math.min(k, 12) * 25}ms` },
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
										className: "font-mono text-sm tabular-nums",
										children: money(v.total, i.currency)
									}), v.balance > 0 && v.status !== "Draft" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs text-muted-foreground tabular-nums",
										children: [money(v.balance, i.currency), " due"]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, { s: v.status })]
							})]
						})
					}, i.id))
				}), hasMore && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex items-center justify-between gap-3 border-t border-border/70 pt-3 text-xs text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						"Showing ",
						visibleRows.length,
						" of ",
						rows.length,
						" documents"
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
						type: "button",
						onClick: () => setShowAll((s) => !s),
						className: "px-3.5 py-1.5 text-xs",
						children: showAll ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "h-3.5 w-3.5" }),
							"Hide (",
							rows.length - INITIAL_LIMIT,
							")"
						] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-3.5 w-3.5" }),
							"Show all (",
							rows.length,
							")"
						] })
					})]
				})] })]
			})
		}
	], [
		outstandingUSD,
		overdueUSD,
		q,
		kind,
		f,
		rows,
		visibleRows,
		hasMore,
		showAll
	]);
	if (path !== "/invoices") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Invoices & documents",
			owner: db.settings.ownerName,
			action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditLayoutButton, {
					editing: editingLayout,
					onToggle: () => setEditingLayout((e) => !e)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
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
				})]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-4 flex flex-wrap gap-2",
			children: ["All documents", ...DOCUMENT_TYPES].map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
				variant: k === kind ? "gold" : "ghost",
				onClick: () => {
					setKind(k);
					setF("All");
					setShowAll(false);
				},
				children: k
			}, k))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditableBentoGrid, {
			pageKey: "invoices",
			widgets,
			editing: editingLayout,
			onDoneEditing: () => setEditingLayout(false)
		})
	] });
}
//#endregion
export { Invoices as component };
