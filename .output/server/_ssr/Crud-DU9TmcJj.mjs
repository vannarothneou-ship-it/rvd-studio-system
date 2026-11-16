import { i as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { w as fileToDataUrl } from "./utils-cyeqUyd1.mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { a as Modal, c as Sel, l as SlideDrawer, r as F, t as Btn } from "./ui-D6kovTfR.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/Crud-DU9TmcJj.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function EditModal({ item, fields, title, subtitle, presentation = "modal", side = "right", onSave, onDelete, onClose, onFieldChange, footerExtra }) {
	const [v, setV] = (0, import_react.useState)(item);
	(0, import_react.useEffect)(() => {
		setV(item);
	}, [item]);
	if (!item || !v) return null;
	const resolvedFields = typeof fields === "function" ? fields(v) : fields;
	const set = (k, x) => {
		const rawNext = {
			...v,
			[k]: x
		};
		setV(onFieldChange ? onFieldChange(rawNext, k) : rawNext);
	};
	const formContent = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "grid grid-cols-2 gap-3",
		onSubmit: (e) => {
			e.preventDefault();
			onSave(v);
			onClose();
		},
		children: [
			resolvedFields.map((f) => {
				const val = v[f.k];
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(F, {
					label: f.label,
					className: f.wide || f.type === "textarea" ? "col-span-2" : "col-span-2 sm:col-span-1",
					children: f.type === "image" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-3",
						children: [
							val ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: String(val),
								alt: f.label,
								className: "h-20 w-20 rounded-lg object-cover"
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "file",
								accept: "image/*",
								className: "min-w-0 max-w-full text-xs",
								onChange: async (e) => {
									const file = e.target.files?.[0];
									if (file) try {
										set(f.k, await fileToDataUrl(file, 400));
									} catch {
										alert("Please choose a valid image.");
									}
								}
							}),
							val ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
								type: "button",
								variant: "danger",
								onClick: () => set(f.k, ""),
								children: "Remove image"
							}) : null
						]
					}) : f.type === "select" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sel, {
						value: String(val ?? ""),
						onChange: (x) => set(f.k, x),
						options: f.options ?? [],
						placeholder: "—"
					}) : f.type === "textarea" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						className: "field min-h-24",
						value: String(val ?? ""),
						onChange: (e) => set(f.k, e.target.value)
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "field",
						type: f.type ?? "text",
						step: "any",
						value: String(val ?? ""),
						onChange: (e) => set(f.k, f.type === "number" ? Number(e.target.value) : e.target.value)
					})
				}, f.k);
			}),
			footerExtra ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "col-span-2",
				children: footerExtra(v)
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "col-span-2 mt-2 flex justify-between gap-2 border-t border-border/70 pt-3",
				children: [onDelete ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
					type: "button",
					variant: "danger",
					onClick: () => {
						if (confirm("Delete this?")) {
							onDelete(v);
							onClose();
						}
					},
					children: "Delete"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
						type: "button",
						onClick: onClose,
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
						type: "submit",
						variant: "gold",
						children: "Save"
					})]
				})]
			})
		]
	});
	if (presentation === "drawer") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlideDrawer, {
		open: true,
		title,
		subtitle,
		side,
		onClose,
		children: formContent
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Modal, {
		open: true,
		title,
		onClose,
		children: formContent
	});
}
function upsert(list, v) {
	return list.some((x) => x.id === v.id) ? list.map((x) => x.id === v.id ? v : x) : [...list, v];
}
function nextCode(prefix, codes, start = 1, pad = 2) {
	const n = codes.map((c) => Number(c.replace(prefix, ""))).filter((x) => !isNaN(x));
	return prefix + String(Math.max(start - 1, ...n) + 1).padStart(pad, "0");
}
//#endregion
export { nextCode as n, upsert as r, EditModal as t };
