import { H as uid, J as require_react, K as require_jsx_runtime, R as setDB, W as useDB, Z as __toESM, d as PRICING_UNITS, k as money, u as PILLARS } from "./utils-Cz-OEK7u.js";
import { t as Link } from "./link-C-cvVHqO.js";
import { c as Sel, i as Glass, n as Empty, o as PageHeader, t as Btn } from "./ui-Cikv6Nuk.js";
import { t as Plus } from "./plus-CPmKyuxY.js";
import { t as Search } from "./search-BJFbjdqu.js";
import { n as nextCode, r as upsert, t as EditModal } from "./Crud-Cf0OYseA.js";
//#region src/routes/services.tsx?tsr-split=component
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var fields = [
	{
		k: "name",
		label: "Service name",
		wide: true
	},
	{
		k: "code",
		label: "Code"
	},
	{
		k: "pillar",
		label: "Pillar",
		type: "select",
		options: PILLARS
	},
	{
		k: "unit",
		label: "Pricing unit",
		type: "select",
		options: PRICING_UNITS
	},
	{
		k: "rate",
		label: "Rate (USD)",
		type: "number"
	},
	{
		k: "overage",
		label: "Extra revision (USD)",
		type: "number"
	},
	{
		k: "timeline",
		label: "Timeline"
	},
	{
		k: "scope",
		label: "Included deliverables",
		type: "textarea"
	}
];
function Services() {
	const db = useDB((d) => d);
	const [q, setQ] = (0, import_react.useState)("");
	const [pillar, setPillar] = (0, import_react.useState)("All");
	const [edit, setEdit] = (0, import_react.useState)(null);
	const rows = db.services.filter((s) => (pillar === "All" || s.pillar === pillar) && `${s.code} ${s.name} ${s.scope}`.toLowerCase().includes(q.toLowerCase()));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Services",
			owner: db.settings.ownerName,
			action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Btn, {
				variant: "gold",
				onClick: () => setEdit({
					id: uid(),
					code: nextCode("SV-", db.services.map((s) => s.code)),
					pillar: PILLARS[0] ?? "",
					name: "",
					unit: "Fixed fee",
					rate: 0,
					scope: "",
					timeline: "",
					overage: 0
				}),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), "New service"]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-5 flex flex-col gap-3 sm:flex-row",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-3 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: "field pl-9",
					placeholder: "Search services",
					value: q,
					onChange: (e) => setQ(e.target.value)
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "sm:w-56",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sel, {
					value: pillar,
					onChange: setPillar,
					options: ["All", ...PILLARS]
				})
			})]
		}),
		rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { children: "No matching services." }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
			children: rows.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Glass, {
				className: "flex flex-col",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "label-mono",
						children: [
							s.code,
							" · ",
							s.pillar
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-2 font-display text-lg font-bold",
						children: s.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 font-mono text-xl text-primary",
						children: [
							money(s.rate),
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted-foreground",
								children: s.unit
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted-foreground",
						children: s.timeline || "Timeline not set"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "my-4 flex-1 space-y-1 text-sm",
						children: s.scope.split("\n").filter(Boolean).map((l, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: ["· ", l] }, i))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
							onClick: () => setEdit(s),
							children: "Edit"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/invoices/$id",
							params: { id: "new" },
							search: {
								service: s.id,
								kind: "Quotation"
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
								variant: "gold",
								children: "Quote"
							})
						})]
					})
				]
			}, s.id))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditModal, {
			item: edit,
			fields,
			title: edit?.code ?? "Service",
			onClose: () => setEdit(null),
			onSave: (v) => setDB((d) => ({
				...d,
				services: upsert(d.services, v)
			})),
			onDelete: db.services.some((s) => s.id === edit?.id) ? (v) => {
				if (db.projects.some((p) => p.serviceId === v.id)) {
					alert("This service is used by a project. Keep it or change the project's service first.");
					return;
				}
				setDB((d) => ({
					...d,
					services: d.services.filter((s) => s.id !== v.id)
				}));
			} : void 0
		})
	] });
}
//#endregion
export { Services as component };
