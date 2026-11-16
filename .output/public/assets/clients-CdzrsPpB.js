import { E as invoiceView, H as uid, J as require_react, K as require_jsx_runtime, R as setDB, W as useDB, Z as __toESM, a as CLIENT_TYPES, i as CLIENT_STATUSES, k as money, r as CLIENT_SOURCES } from "./utils-Cz-OEK7u.js";
import { i as Glass, l as Stat, n as Empty, o as PageHeader, s as Pill, t as Btn } from "./ui-Cikv6Nuk.js";
import { t as Plus } from "./plus-CPmKyuxY.js";
import { t as Search } from "./search-BJFbjdqu.js";
import { n as nextCode, r as upsert, t as EditModal } from "./Crud-Cf0OYseA.js";
//#region src/routes/clients.tsx?tsr-split=component
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
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
	const [edit, setEdit] = (0, import_react.useState)(null);
	const stats = (c) => {
		const inv = db.invoices.filter((i) => i.clientId === c.id).map((i) => invoiceView(i, db));
		return {
			billed: inv.reduce((a, v) => a + v.totalUSD, 0),
			owed: inv.filter((v) => v.status !== "Draft").reduce((a, v) => a + v.balanceUSD, 0),
			projects: db.projects.filter((p) => p.clientId === c.id).length
		};
	};
	const rows = db.clients.filter((c) => [
		c.name,
		c.contact,
		c.code,
		c.position,
		c.email,
		c.phone,
		c.industry
	].join(" ").toLowerCase().includes(q.toLowerCase()));
	const blank = () => ({
		id: uid(),
		code: nextCode("CL-", db.clients.map((c) => c.code)),
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Clients",
			owner: db.settings.ownerName,
			action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Btn, {
				variant: "gold",
				onClick: () => setEdit(blank()),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), "New client"]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-4 grid grid-cols-3 gap-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Glass, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Clients",
					value: String(db.clients.length)
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Glass, {
					delay: 60,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Active",
						tone: "pos",
						value: String(db.clients.filter((c) => c.status === "Active").length)
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Glass, {
					delay: 120,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Leads",
						value: String(db.clients.filter((c) => c.status === "Lead").length)
					})
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Glass, {
			delay: 180,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative mb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: "field pl-9",
					placeholder: "Search clients",
					value: q,
					onChange: (e) => setQ(e.target.value)
				})]
			}), rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { children: "No clients yet." }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
				children: rows.map((c, k) => {
					const s = stats(c);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Btn, {
						onClick: () => setEdit(c),
						className: "rise block rounded-lg bg-muted/40 p-4 text-left transition-all hover:-translate-y-0.5 hover:bg-muted",
						style: { animationDelay: `${k * 40}ms` },
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
										className: "font-mono",
										children: s.projects
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "label-mono",
										children: "Billed"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-mono",
										children: money(s.billed)
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "label-mono",
										children: "Owed"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: s.owed > 0 ? "font-mono text-destructive" : "font-mono",
										children: money(s.owed)
									})] })
								]
							})
						]
					}, c.id);
				})
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditModal, {
			item: edit,
			fields,
			title: edit?.code ?? "",
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
