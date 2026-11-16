import { D as getDB, E as fileToDataUrl, H as resetDB, K as setDB, N as money, Q as useDB, X as uid, at as __toESM, d as PRICING_UNITS, et as require_jsx_runtime, nt as require_react, u as PILLARS } from "./utils-B6FVwprB.js";
import { i as Glass, o as PageHeader, r as F, t as Btn } from "./ui-CGknzUbS.js";
import { n as Download, t as Upload } from "./upload-BYd_ueEF.js";
import { t as Plus } from "./plus-9pSSlvg_.js";
import { n as nextCode, r as upsert, t as EditModal } from "./Crud-Bwax9chh.js";
//#region src/routes/settings.tsx?tsr-split=component
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var sfields = [
	{
		k: "name",
		label: "Service name",
		wide: true
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
		label: "Timeline",
		wide: true
	},
	{
		k: "scope",
		label: "Scope (one per line)",
		type: "textarea"
	}
];
function Page() {
	const db = useDB((d) => d);
	const s = db.settings;
	const [svc, setSvc] = (0, import_react.useState)(null);
	const set = (k, v) => setDB((d) => ({
		...d,
		settings: {
			...d.settings,
			[k]: v
		}
	}));
	const txt = (k, label, wide = false) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(F, {
		label,
		className: wide ? "sm:col-span-2" : "",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			className: "field",
			value: String(s[k]),
			onChange: (e) => set(k, e.target.value)
		})
	});
	const img = (k, label) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(F, {
		label,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-xl border border-dashed border-border bg-muted",
				children: s[k] ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: s[k],
					alt: label,
					className: "h-full w-full object-contain"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "h-4 w-4 text-muted-foreground" })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "file",
					accept: "image/*",
					className: "text-xs file:mr-2 file:rounded-full file:border-0 file:bg-secondary file:px-3 file:py-1 file:text-foreground",
					onChange: async (e) => {
						const f = e.target.files?.[0];
						if (f) set(k, await fileToDataUrl(f, 600));
					}
				}), s[k] && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "self-start text-xs text-destructive",
					onClick: () => set(k, ""),
					children: "Remove"
				})]
			})]
		})
	});
	const exportData = () => {
		const a = document.createElement("a");
		a.href = URL.createObjectURL(new Blob([JSON.stringify(getDB())], { type: "application/json" }));
		a.download = `rothvan-backup-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.json`;
		a.click();
	};
	const importData = async (f) => {
		try {
			const p = JSON.parse(await f.text());
			if (!p.settings) throw 0;
			setDB(() => p);
			alert("Backup restored.");
		} catch {
			alert("That file isn't a RothVan backup.");
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Settings",
			owner: s.ownerName
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-4 lg:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Glass, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "mb-4 font-display text-lg font-bold",
				children: "Business"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2",
				children: [
					txt("businessName", "Business name"),
					txt("ownerName", "Your first name"),
					txt("phones", "Phone numbers", true),
					txt("email", "Email"),
					txt("website", "Website"),
					txt("address", "Address", true),
					img("logo", "Logo")
				]
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Glass, {
				delay: 60,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-4 font-display text-lg font-bold",
					children: "Payment & signature"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3 sm:grid-cols-2",
					children: [
						txt("abaName", "ABA account name"),
						txt("abaNumber", "ABA account number"),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(F, {
							label: "Due after (days)",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: "field",
								type: "number",
								value: s.dueDays,
								onChange: (e) => set("dueDays", Number(e.target.value))
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(F, {
							label: "KHR per USD",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: "field",
								type: "number",
								value: s.khrRate,
								onChange: (e) => set("khrRate", Number(e.target.value))
							})
						}),
						txt("signatoryName", "Signatory name"),
						txt("signatoryTitle", "Signatory title"),
						img("khqr", "KHQR code"),
						img("signature", "Signature")
					]
				})]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Glass, {
			delay: 120,
			className: "mt-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-3 flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-lg font-bold",
					children: "Services & rates"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Btn, {
					onClick: () => setSvc({
						id: uid(),
						code: nextCode("SV-", db.services.map((x) => x.code)),
						pillar: PILLARS[0],
						name: "",
						unit: "Fixed fee",
						rate: 0,
						scope: "",
						timeline: "",
						overage: 0
					}),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), "Add"]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
				children: db.services.map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => setSvc(x),
					className: "rounded-2xl border border-border bg-muted/40 p-4 text-left hover:bg-muted",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "label-mono",
							children: x.pillar
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium",
							children: x.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-mono text-sm text-primary",
							children: [
								money(x.rate),
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted-foreground",
									children: x.unit.toLowerCase()
								})
							]
						})
					]
				}, x.id))
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid gap-4 lg:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Glass, {
				delay: 180,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-3 font-display text-lg font-bold",
					children: "Design terms"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-3",
					children: s.designTerms.map((t, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "field font-medium",
							value: t.label,
							onChange: (e) => set("designTerms", s.designTerms.map((x, j) => j === i ? {
								...x,
								label: e.target.value
							} : x))
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							className: "field min-h-16",
							value: t.text,
							onChange: (e) => set("designTerms", s.designTerms.map((x, j) => j === i ? {
								...x,
								text: e.target.value
							} : x))
						})]
					}, i))
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Glass, {
				delay: 240,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mb-3 font-display text-lg font-bold",
						children: "Payment terms & message"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(F, {
						label: "Payment terms (one per line)",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							className: "field min-h-24",
							value: s.paymentTerms.join("\n"),
							onChange: (e) => set("paymentTerms", e.target.value.split("\n"))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(F, {
						label: "Thank-you note",
						className: "mt-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							className: "field min-h-20",
							value: s.thankYou,
							onChange: (e) => set("thankYou", e.target.value)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "label-mono mb-2 mt-4",
						children: "Backup"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Btn, {
								onClick: exportData,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-4 w-4" }), "Download backup"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-secondary px-4 py-2 text-sm hover:bg-accent",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "h-4 w-4" }),
									"Restore",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "file",
										accept: "application/json",
										className: "hidden",
										onChange: (e) => e.target.files?.[0] && importData(e.target.files[0])
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
								variant: "danger",
								onClick: () => confirm("Erase everything and restore sample data?") && resetDB(),
								children: "Reset"
							})
						]
					})
				]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditModal, {
			item: svc,
			fields: sfields,
			title: svc?.code ?? "",
			onClose: () => setSvc(null),
			onSave: (v) => setDB((d) => ({
				...d,
				services: upsert(d.services, v)
			})),
			onDelete: db.services.some((x) => x.id === svc?.id) ? (v) => setDB((d) => ({
				...d,
				services: d.services.filter((x) => x.id !== v.id)
			})) : void 0
		})
	] });
}
//#endregion
export { Page as component };
