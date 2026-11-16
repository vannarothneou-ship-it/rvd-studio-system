import { i as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { J as uid, W as setDB, X as useDB, _ as compactMoney, c as PILLARS, g as cn, j as money, l as PRICING_UNITS } from "./utils-cyeqUyd1.mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { C as Plus, D as Palette, E as PenTool, F as Layers, G as FileSpreadsheet, M as Megaphone, O as Package, P as LayoutGrid, V as Globe, X as Compass, b as Search, ct as Box, ft as ArrowUpDown, g as Sparkles, j as MonitorSmartphone, p as Tag } from "../_libs/lucide-react.mjs";
import { i as Glass, n as Empty, o as PageHeader, t as Btn, u as Stat } from "./ui-D6kovTfR.mjs";
import { n as nextCode, r as upsert, t as EditModal } from "./Crud-DU9TmcJj.mjs";
import { n as EditableBentoGrid, t as EditLayoutButton } from "./BentoGrid-CunpmRkD.mjs";
import { b as Link, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/services-CmZ9ZU4W.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var PILLAR_ICON = {
	"Branding Design": PenTool,
	"Creative Assets": Sparkles,
	"Web & App Design": MonitorSmartphone,
	"Marketing Collateral": Megaphone,
	"Spatial Design": Compass,
	"Product Packaging": Package
};
function pillarIcon(pillar) {
	return PILLAR_ICON[pillar] ?? Tag;
}
function serviceIcon(s) {
	const txt = `${s.name} ${s.scope}`.toLowerCase();
	if (/logo|brand|identity|guideline|monogram/.test(txt)) return PenTool;
	if (/web|landing|framer|website|site|domain/.test(txt)) return Globe;
	if (/app|ui|ux|mobile|screen|dashboard/.test(txt)) return MonitorSmartphone;
	if (/pack|box|label|bottle|pouch|dieline/.test(txt)) return Package;
	if (/booth|interior|spatial|signage|store|exhibit|3d/.test(txt)) return Compass;
	if (/brochure|flyer|poster|menu|catalog|banner|print|deck/.test(txt)) return FileSpreadsheet;
	if (/social|campaign|ad|marketing|carousel/.test(txt)) return Megaphone;
	if (/color|palette|typography|moodboard|illustration/.test(txt)) return Palette;
	if (/system|asset|template|icon/.test(txt)) return Layers;
	if (/mockup|3d|render/.test(txt)) return Box;
	return pillarIcon(s.pillar);
}
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
	const nav = useNavigate();
	const [q, setQ] = (0, import_react.useState)("");
	const [pillar, setPillar] = (0, import_react.useState)("All");
	const [sortBy, setSortBy] = (0, import_react.useState)("code");
	const [groupByPillar, setGroupByPillar] = (0, import_react.useState)(true);
	const [editingLayout, setEditingLayout] = (0, import_react.useState)(false);
	const [edit, setEdit] = (0, import_react.useState)(null);
	const filtered = (0, import_react.useMemo)(() => {
		const query = q.trim().toLowerCase();
		return [...db.services.filter((s) => (pillar === "All" || s.pillar === pillar) && `${s.code} ${s.name} ${s.pillar} ${s.scope}`.toLowerCase().includes(query))].sort((a, b) => {
			if (sortBy === "rateAsc") return a.rate - b.rate;
			if (sortBy === "rateDesc") return b.rate - a.rate;
			if (sortBy === "name") return a.name.localeCompare(b.name);
			return a.code.localeCompare(b.code);
		});
	}, [
		db.services,
		pillar,
		q,
		sortBy
	]);
	const grouped = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		for (const s of filtered) {
			const key = s.pillar || "Other";
			const arr = map.get(key) ?? [];
			arr.push(s);
			map.set(key, arr);
		}
		return Array.from(map.entries());
	}, [filtered]);
	const avgRate = db.services.length > 0 ? db.services.reduce((a, s) => a + s.rate, 0) / db.services.length : 0;
	const renderCard = (s) => {
		const Icon = serviceIcon(s);
		const active = edit?.id === s.id;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			role: "button",
			tabIndex: 0,
			onClick: () => setEdit(s),
			onKeyDown: (e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					setEdit(s);
				}
			},
			className: cn("glass rise group flex cursor-pointer flex-col p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/60", active && "border-primary ring-2 ring-primary/35"),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex min-w-0 items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-border bg-muted text-primary transition-colors group-hover:border-primary/50 group-hover:bg-primary/15",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-4 w-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "label-mono truncate",
								children: s.code
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "inline-flex items-center gap-1 rounded-full border border-border/70 bg-muted/60 px-2 py-0.5 text-[0.66rem] text-muted-foreground",
								children: s.pillar
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "shrink-0 rounded-full border border-border px-2.5 py-0.5 text-[0.68rem] text-muted-foreground group-hover:border-primary/50 group-hover:text-primary",
						children: "Edit →"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-3 font-display text-lg font-bold leading-snug",
					children: s.name || "Untitled service"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 font-mono text-xl font-semibold tabular-nums text-primary",
					children: [
						money(s.rate),
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs font-normal text-muted-foreground",
							children: s.unit
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-xs text-muted-foreground",
					children: [s.timeline || "Timeline not set", s.overage > 0 ? ` · +${money(s.overage)} / rev` : ""]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "my-3.5 flex-1 space-y-1 text-xs text-muted-foreground",
					children: s.scope.split("\n").filter(Boolean).slice(0, 4).map((l, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "truncate",
						children: ["· ", l]
					}, i))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-2 border-t border-border/60 pt-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[0.7rem] text-muted-foreground",
						children: "Click card to edit details"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/invoices/$id",
						params: { id: "new" },
						search: {
							service: s.id,
							kind: "Quotation"
						},
						onClick: (e) => e.stopPropagation(),
						className: "shrink-0",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
							variant: "gold",
							className: "px-3 py-1 text-xs",
							children: "Quote"
						})
					})]
				})
			]
		}, s.id);
	};
	const bentoWidgets = (0, import_react.useMemo)(() => [
		{
			id: "servicesCount",
			title: "Services count",
			defaultSpan: 4,
			render: () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Glass, {
				className: "h-full",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Catalogue",
					value: `${db.services.length} services`
				})
			})
		},
		{
			id: "servicesPillars",
			title: "Pillars",
			defaultSpan: 4,
			render: () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Glass, {
				delay: 60,
				className: "h-full",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Design pillars",
					value: String(PILLARS.length)
				})
			})
		},
		{
			id: "servicesAvgRate",
			title: "Average package rate",
			defaultSpan: 4,
			render: () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Glass, {
				delay: 120,
				className: "h-full",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Avg package",
					value: compactMoney(avgRate),
					fullValue: money(avgRate)
				})
			})
		},
		{
			id: "servicesBrowser",
			title: "Service catalogue",
			defaultSpan: 12,
			render: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Glass, {
				className: "mb-4 p-4 sm:p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "field pl-9",
							placeholder: "Search service name, code, deliverables...",
							value: q,
							onChange: (e) => setQ(e.target.value)
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "inline-flex items-center gap-1 rounded-full border border-border bg-muted p-1 text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpDown, { className: "ml-2 h-3.5 w-3.5 text-muted-foreground" }), [
								{
									id: "code",
									label: "Code"
								},
								{
									id: "rateAsc",
									label: "Price ↑"
								},
								{
									id: "rateDesc",
									label: "Price ↓"
								},
								{
									id: "name",
									label: "A–Z"
								}
							].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setSortBy(s.id),
								className: cn("rounded-full px-2.5 py-1 transition-colors", sortBy === s.id ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"),
								children: s.label
							}, s.id))]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setGroupByPillar((g) => !g),
							className: cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors", groupByPillar ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground hover:text-foreground"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutGrid, { className: "h-3.5 w-3.5" }), groupByPillar ? "Grouped by pillar" : "Flat grid"]
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex flex-wrap gap-1.5 border-t border-border/60 pt-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setPillar("All"),
						className: cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors", pillar === "All" ? "border-primary bg-primary text-primary-foreground shadow-sm" : "border-border bg-muted/40 text-muted-foreground hover:border-primary/40 hover:text-foreground"),
						children: [
							"All (",
							db.services.length,
							")"
						]
					}), PILLARS.map((p) => {
						const PIcon = pillarIcon(p);
						const count = db.services.filter((s) => s.pillar === p).length;
						const selected = pillar === p;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setPillar(selected ? "All" : p),
							className: cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors", selected ? "border-primary bg-primary text-primary-foreground shadow-sm" : "border-border bg-muted/40 text-muted-foreground hover:border-primary/40 hover:text-foreground"),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PIcon, { className: "h-3.5 w-3.5" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: p }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono text-[0.66rem] opacity-75",
									children: count
								})
							]
						}, p);
					})]
				})]
			}), filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Glass, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { children: "No matching services." }) }) : groupByPillar && pillar === "All" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-6",
				children: grouped.map(([pillarName, items]) => {
					const PIcon = pillarIcon(pillarName);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mb-3 flex items-center justify-between gap-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "grid h-7 w-7 place-items-center rounded-xl border border-border bg-muted text-primary",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PIcon, { className: "h-3.5 w-3.5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "font-display text-base font-bold",
									children: pillarName
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "rounded-full border border-border px-2 py-0.5 font-mono text-[0.68rem] text-muted-foreground",
									children: items.length
								})
							]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
						children: items.map(renderCard)
					})] }, pillarName);
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
				children: filtered.map(renderCard)
			})] })
		}
	], [
		db.services,
		avgRate,
		q,
		sortBy,
		groupByPillar,
		pillar,
		filtered,
		grouped,
		edit
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Services",
			owner: db.settings.ownerName,
			action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditLayoutButton, {
					editing: editingLayout,
					onToggle: () => setEditingLayout((e) => !e)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Btn, {
					variant: "gold",
					onClick: () => setEdit({
						id: uid(),
						code: nextCode("SV-", db.services.map((s) => s.code)),
						pillar: pillar === "All" ? PILLARS[0] ?? "" : pillar,
						name: "",
						unit: "Fixed fee",
						rate: 0,
						scope: "",
						timeline: "",
						overage: 0
					}),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), "New service"]
				})]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditableBentoGrid, {
			pageKey: "services",
			widgets: bentoWidgets,
			editing: editingLayout,
			onDoneEditing: () => setEditingLayout(false)
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditModal, {
			presentation: "drawer",
			side: "right",
			item: edit,
			fields,
			subtitle: edit?.pillar || "Studio Service",
			title: edit?.name || edit?.code || "Service",
			onClose: () => setEdit(null),
			onSave: (v) => setDB((d) => ({
				...d,
				services: upsert(d.services, v)
			})),
			footerExtra: (v) => db.services.some((s) => s.id === v.id) ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between rounded-2xl border border-border/70 bg-muted/30 p-3 text-xs",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-muted-foreground",
					children: "Create a client quotation with this service prefilled"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
					type: "button",
					className: "px-3 py-1 text-xs",
					onClick: () => {
						setDB((d) => ({
							...d,
							services: upsert(d.services, v)
						}));
						setEdit(null);
						nav({
							to: "/invoices/$id",
							params: { id: "new" },
							search: {
								service: v.id,
								kind: "Quotation"
							}
						});
					},
					children: "Quote →"
				})]
			}) : null,
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
