import { A as invoiceView, K as setDB, N as money, Q as useDB, X as uid, a as CLIENT_TYPES, at as __toESM, et as require_jsx_runtime, i as CLIENT_STATUSES, nt as require_react, r as CLIENT_SOURCES, v as compactMoney } from "./utils-B6FVwprB.js";
import { f as ChevronUp, i as Glass, n as Empty, o as PageHeader, p as ChevronDown, s as Pill, t as Btn, u as Stat } from "./ui-CGknzUbS.js";
import { n as EditableBentoGrid, t as EditLayoutButton } from "./BentoGrid-DjgOg_5X.js";
import { t as Plus } from "./plus-9pSSlvg_.js";
import { t as Search } from "./search-DXXFesS4.js";
import { n as nextCode, r as upsert, t as EditModal } from "./Crud-Bwax9chh.js";
//#region src/routes/clients.tsx?tsr-split=component
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var INITIAL_LIMIT = 9;
var fields = [
	{
		k: "avatar",
		label: "Profile image / company logo",
		type: "image",
		wide: true
	},
	{
		k: "name",
		label: "Business name",
		wide: true
	},
	{
		k: "contact",
		label: "Contact person"
	},
	{
		k: "position",
		label: "Position / job title"
	},
	{
		k: "industry",
		label: "Industry"
	},
	{
		k: "type",
		label: "Type",
		type: "select",
		options: CLIENT_TYPES
	},
	{
		k: "status",
		label: "Status",
		type: "select",
		options: CLIENT_STATUSES
	},
	{
		k: "source",
		label: "Source",
		type: "select",
		options: CLIENT_SOURCES
	},
	{
		k: "phone",
		label: "Phone"
	},
	{
		k: "email",
		label: "Email"
	},
	{
		k: "telegram",
		label: "Telegram"
	},
	{
		k: "website",
		label: "Website"
	},
	{
		k: "taxId",
		label: "Tax / registration ID"
	},
	{
		k: "address",
		label: "Billing address",
		wide: true
	},
	{
		k: "preferredContact",
		label: "Preferred contact",
		type: "select",
		options: [
			"Telegram",
			"Email",
			"Phone",
			"WhatsApp"
		]
	},
	{
		k: "notes",
		label: "Notes",
		type: "textarea"
	}
];
function Page() {
	const db = useDB((d) => d);
	const [q, setQ] = (0, import_react.useState)("");
	const [showAll, setShowAll] = (0, import_react.useState)(false);
	const [editingLayout, setEditingLayout] = (0, import_react.useState)(false);
	const [edit, setEdit] = (0, import_react.useState)(null);
	const stats = (c) => {
		const inv = db.invoices.filter((i) => i.clientId === c.id).map((i) => invoiceView(i, db));
		return {
			billed: inv.reduce((a, v) => a + v.totalUSD, 0),
			owed: inv.filter((v) => v.status !== "Draft").reduce((a, v) => a + v.balanceUSD, 0),
			projects: db.projects.filter((p) => p.clientId === c.id).length
		};
	};
	const rows = (0, import_react.useMemo)(() => db.clients.filter((c) => [
		c.name,
		c.contact,
		c.code,
		c.position,
		c.email,
		c.phone,
		c.industry
	].join(" ").toLowerCase().includes(q.toLowerCase())), [db.clients, q]);
	const visibleRows = showAll ? rows : rows.slice(0, INITIAL_LIMIT);
	const hasMore = rows.length > INITIAL_LIMIT;
	const blank = () => ({
		id: uid(),
		code: nextCode("RVD-", db.clients.map((c) => c.code)),
		name: "",
		type: "SME",
		industry: "",
		contact: "",
		email: "",
		telegram: "",
		phone: "",
		source: "Referral",
		status: "Lead",
		notes: ""
	});
	const widgets = (0, import_react.useMemo)(() => [
		{
			id: "clientsTotal",
			title: "Clients total",
			defaultSpan: 4,
			render: () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Glass, {
				className: "h-full",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Clients",
					value: String(db.clients.length)
				})
			})
		},
		{
			id: "clientsActive",
			title: "Active clients",
			defaultSpan: 4,
			render: () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Glass, {
				delay: 60,
				className: "h-full",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Active",
					tone: "pos",
					value: String(db.clients.filter((c) => c.status === "Active").length)
				})
			})
		},
		{
			id: "clientsLeads",
			title: "Leads",
			defaultSpan: 4,
			render: () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Glass, {
				delay: 120,
				className: "h-full",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Leads",
					value: String(db.clients.filter((c) => c.status === "Lead").length)
				})
			})
		},
		{
			id: "clientsDirectory",
			title: "Client directory",
			defaultSpan: 12,
			render: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Glass, {
				delay: 180,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative mb-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "field pl-9",
						placeholder: "Search clients",
						value: q,
						onChange: (e) => {
							setQ(e.target.value);
							setShowAll(false);
						}
					})]
				}), rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { children: "No clients yet." }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
					children: visibleRows.map((c, k) => {
						const s = stats(c);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setEdit(c),
							className: "rise block rounded-2xl border border-border/70 bg-muted/40 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:bg-muted",
							style: { animationDelay: `${Math.min(k, 9) * 35}ms` },
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mb-3 flex items-center justify-between gap-2",
									children: [c.avatar ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: c.avatar,
										alt: c.name,
										className: "h-12 w-12 rounded-lg object-cover"
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "grid h-12 w-12 place-items-center rounded-lg bg-primary/15 font-display text-lg text-primary",
										children: c.name.slice(0, 2).toUpperCase()
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, { s: c.status })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-mono text-xs text-muted-foreground",
											children: c.code
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "truncate font-display text-lg font-bold",
											children: c.name || "Untitled"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "truncate text-xs text-muted-foreground",
											children: [c.contact || "—", c.position ? ` · ${c.position}` : ""]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 truncate text-xs text-muted-foreground",
											children: c.email || c.telegram || c.phone || c.industry || c.type
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-3 grid grid-cols-3 gap-2 text-xs",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "label-mono",
											children: "Projects"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-mono tabular-nums",
											children: s.projects
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											title: money(s.billed),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "label-mono",
												children: "Billed"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "font-mono tabular-nums",
												children: compactMoney(s.billed)
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											title: money(s.owed),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "label-mono",
												children: "Owed"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: s.owed > 0 ? "font-mono tabular-nums text-destructive" : "font-mono tabular-nums",
												children: compactMoney(s.owed)
											})]
										})
									]
								})
							]
						}, c.id);
					})
				}), hasMore && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex items-center justify-between gap-3 border-t border-border/70 pt-3 text-xs text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						"Showing ",
						visibleRows.length,
						" of ",
						rows.length,
						" clients"
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
		db,
		q,
		rows,
		visibleRows,
		hasMore,
		showAll
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Clients",
			owner: db.settings.ownerName,
			action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditLayoutButton, {
					editing: editingLayout,
					onToggle: () => setEditingLayout((e) => !e)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Btn, {
					variant: "gold",
					onClick: () => setEdit(blank()),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), "New client"]
				})]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditableBentoGrid, {
			pageKey: "clients",
			widgets,
			editing: editingLayout,
			onDoneEditing: () => setEditingLayout(false)
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditModal, {
			presentation: "drawer",
			side: "right",
			item: edit,
			fields,
			subtitle: edit?.type || "Client",
			title: edit?.name || edit?.code || "Client",
			onClose: () => setEdit(null),
			onSave: (v) => setDB((d) => ({
				...d,
				clients: upsert(d.clients, v)
			})),
			onDelete: db.clients.some((c) => c.id === edit?.id) ? (v) => setDB((d) => ({
				...d,
				clients: d.clients.filter((c) => c.id !== v.id)
			})) : void 0
		})
	] });
}
//#endregion
export { Page as component };
