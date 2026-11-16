import { i as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { g as cn } from "./utils-cyeqUyd1.mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { B as GripVertical, C as Plus, K as Eye, P as LayoutGrid, q as EyeOff, rt as Check, x as RotateCcw } from "../_libs/lucide-react.mjs";
import { a as closestCenter, c as useDroppable, i as TouchSensor, l as useSensor, n as DragOverlay, o as pointerWithin, r as PointerSensor, s as useDraggable, t as DndContext, u as useSensors } from "../_libs/@dnd-kit/core+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/BentoGrid-CunpmRkD.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var LAYOUT_STORAGE_KEY = "rv-bento-layouts-v1";
var TABS_STORAGE_KEY = "rv-custom-tabs-v1";
var SPAN_CLASS = {
	4: "lg:col-span-4",
	5: "lg:col-span-5",
	6: "lg:col-span-6",
	7: "lg:col-span-7",
	8: "lg:col-span-8",
	12: "lg:col-span-12"
};
var SPAN_CHOICES = [
	{
		span: 4,
		label: "1/3"
	},
	{
		span: 6,
		label: "1/2"
	},
	{
		span: 8,
		label: "2/3"
	},
	{
		span: 12,
		label: "Full"
	}
];
function readLayouts() {
	if (typeof window === "undefined") return {};
	try {
		const raw = window.localStorage.getItem(LAYOUT_STORAGE_KEY);
		return raw ? JSON.parse(raw) : {};
	} catch {
		return {};
	}
}
function writeLayouts(all) {
	if (typeof window === "undefined") return;
	try {
		window.localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(all));
	} catch {}
}
function mergeWithDefaults(saved, defaults) {
	if (!saved || saved.length === 0) return defaults.map((d) => ({ ...d }));
	const defMap = new Map(defaults.map((d) => [d.id, d]));
	const result = [];
	const seen = /* @__PURE__ */ new Set();
	for (const item of saved) if (defMap.has(item.id)) {
		result.push({
			...defMap.get(item.id),
			...item
		});
		seen.add(item.id);
	}
	for (const def of defaults) if (!seen.has(def.id)) result.push({ ...def });
	return result;
}
function usePageLayout(pageKey, defaults) {
	const defaultSig = defaults.map((d) => `${d.id}:${d.span}`).join(",");
	const [items, setItems] = (0, import_react.useState)(() => mergeWithDefaults(readLayouts()[pageKey], defaults));
	(0, import_react.useEffect)(() => {
		setItems(mergeWithDefaults(readLayouts()[pageKey], defaults));
	}, [pageKey, defaultSig]);
	const commit = (0, import_react.useCallback)((updater) => {
		setItems((prev) => {
			const next = updater(prev);
			const all = readLayouts();
			all[pageKey] = next;
			writeLayouts(all);
			return next;
		});
	}, [pageKey]);
	return {
		items,
		setSpan: (0, import_react.useCallback)((id, span) => {
			commit((prev) => prev.map((x) => x.id === id ? {
				...x,
				span
			} : x));
		}, [commit]),
		toggleHide: (0, import_react.useCallback)((id) => {
			commit((prev) => prev.map((x) => x.id === id ? {
				...x,
				hidden: !x.hidden
			} : x));
		}, [commit]),
		showWidget: (0, import_react.useCallback)((id) => {
			commit((prev) => {
				if (prev.some((x) => x.id === id)) return prev.map((x) => x.id === id ? {
					...x,
					hidden: false
				} : x);
				const def = defaults.find((d) => d.id === id);
				return [...prev, {
					id,
					span: def?.span ?? 6,
					hidden: false
				}];
			});
		}, [commit, defaults]),
		reorder: (0, import_react.useCallback)((activeId, overId) => {
			if (activeId === overId) return;
			commit((prev) => {
				const fromIdx = prev.findIndex((x) => x.id === activeId);
				const toIdx = prev.findIndex((x) => x.id === overId);
				if (fromIdx < 0 || toIdx < 0) return prev;
				const copy = [...prev];
				const [moved] = copy.splice(fromIdx, 1);
				if (!moved) return prev;
				copy.splice(toIdx, 0, moved);
				return copy;
			});
		}, [commit]),
		resetLayout: (0, import_react.useCallback)(() => {
			const fresh = defaults.map((d) => ({ ...d }));
			setItems(fresh);
			const all = readLayouts();
			delete all[pageKey];
			writeLayouts(all);
		}, [pageKey, defaults])
	};
}
function useDashboardTabs() {
	const [tabs, setTabs] = (0, import_react.useState)(() => {
		if (typeof window === "undefined") return [];
		try {
			const raw = window.localStorage.getItem(TABS_STORAGE_KEY);
			return raw ? JSON.parse(raw) : [];
		} catch {
			return [];
		}
	});
	const persist = (next) => {
		setTabs(next);
		if (typeof window !== "undefined") try {
			window.localStorage.setItem(TABS_STORAGE_KEY, JSON.stringify(next));
		} catch {}
	};
	const addTab = (label, widgetIds) => {
		const clean = label.trim() || `Board ${tabs.length + 1}`;
		const nextTab = {
			id: "tab-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
			label: clean,
			widgetIds: widgetIds.length > 0 ? widgetIds : ["netProfit", "personalExpenses"]
		};
		persist([...tabs, nextTab]);
		return nextTab;
	};
	const removeTab = (id) => {
		persist(tabs.filter((t) => t.id !== id));
		if (typeof window !== "undefined") {
			const all = readLayouts();
			delete all[`overview:${id}`];
			writeLayouts(all);
		}
	};
	const updateTabWidgets = (id, widgetIds) => {
		persist(tabs.map((t) => t.id === id ? {
			...t,
			widgetIds
		} : t));
	};
	return {
		tabs,
		addTab,
		removeTab,
		updateTabWidgets
	};
}
function EditLayoutButton({ editing, onToggle }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick: onToggle,
		className: cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all", editing ? "border-primary bg-primary text-primary-foreground shadow-sm" : "border-border bg-secondary/70 text-muted-foreground hover:border-primary/50 hover:text-foreground"),
		children: editing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-3.5 w-3.5" }), "Done editing"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutGrid, { className: "h-3.5 w-3.5" }), "Edit layout"] })
	});
}
function EditableBentoGrid({ pageKey, widgets, editing, onDoneEditing, className }) {
	const { items, setSpan, toggleHide, showWidget, reorder, resetLayout } = usePageLayout(pageKey, (0, import_react.useMemo)(() => widgets.map((w) => ({
		id: w.id,
		span: w.defaultSpan
	})), [widgets]));
	const [activeId, setActiveId] = (0, import_react.useState)(null);
	const [overId, setOverId] = (0, import_react.useState)(null);
	const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(TouchSensor, { activationConstraint: {
		delay: 160,
		tolerance: 8
	} }));
	const widgetMap = (0, import_react.useMemo)(() => new Map(widgets.map((w) => [w.id, w])), [widgets]);
	const visibleItems = items.filter((it) => !it.hidden && widgetMap.has(it.id));
	const hiddenItems = items.filter((it) => it.hidden && widgetMap.has(it.id));
	const handleDragStart = (event) => {
		const id = String(event.active.id);
		setActiveId(id);
		setOverId(id);
	};
	const handleDragOver = (event) => {
		if (event.over) setOverId(String(event.over.id));
	};
	const handleDragEnd = (event) => {
		const src = String(event.active.id);
		const dst = event.over ? String(event.over.id) : overId;
		setActiveId(null);
		setOverId(null);
		if (dst && src !== dst) reorder(src, dst);
	};
	const handleDragCancel = () => {
		setActiveId(null);
		setOverId(null);
	};
	const displayEntries = (0, import_react.useMemo)(() => {
		if (!activeId || !overId || activeId === overId) return visibleItems.map((it) => ({
			kind: "card",
			config: it
		}));
		const activeConfig = visibleItems.find((x) => x.id === activeId);
		const activeOrigIdx = visibleItems.findIndex((x) => x.id === activeId);
		const targetIdx = visibleItems.findIndex((x) => x.id === overId);
		if (!activeConfig || targetIdx < 0) return visibleItems.map((it) => ({
			kind: "card",
			config: it
		}));
		const entries = visibleItems.map((config) => ({
			kind: "card",
			config
		}));
		const insertIdx = activeOrigIdx < targetIdx ? targetIdx + 1 : targetIdx;
		entries.splice(insertIdx, 0, {
			kind: "preview",
			config: activeConfig
		});
		return entries;
	}, [
		visibleItems,
		activeId,
		overId
	]);
	const activeWidget = activeId ? widgetMap.get(activeId) : void 0;
	const activeConfig = activeId ? items.find((x) => x.id === activeId) : void 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className,
		children: [editing && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "glass-strong mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/40 px-4 py-3 rise",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2 text-xs",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "inline-flex items-center gap-1.5 font-semibold text-primary",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutGrid, { className: "h-3.5 w-3.5" }), "Layout editor"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-muted-foreground",
					children: "Drag handles to preview placement · Resize width (`1/3`, `1/2`, `2/3`, `Full`) · Hide or restore cards"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [
					hiddenItems.map((h) => {
						const def = widgetMap.get(h.id);
						if (!def) return null;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => showWidget(h.id),
							className: "inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/20",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3 w-3" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-3 w-3" }),
								def.title
							]
						}, h.id);
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: resetLayout,
						className: "inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "h-3 w-3" }), "Reset"]
					}),
					onDoneEditing && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: onDoneEditing,
						className: "inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-3 w-3" }), "Done"]
					})
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DndContext, {
			sensors,
			collisionDetection: ((args) => {
				const hit = pointerWithin(args);
				return hit.length > 0 ? hit : closestCenter(args);
			}),
			onDragStart: handleDragStart,
			onDragOver: handleDragOver,
			onDragEnd: handleDragEnd,
			onDragCancel: handleDragCancel,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 items-start gap-4 lg:grid-cols-12",
				children: displayEntries.map((entry) => {
					if (entry.kind === "preview") {
						const def = widgetMap.get(entry.config.id);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: cn("col-span-1 flex min-h-36 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-primary bg-primary/12 p-6 text-center transition-all", SPAN_CLASS[entry.config.span]),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "rounded-full bg-primary/20 px-3 py-1 font-mono text-xs font-semibold text-primary",
								children: ["Drop preview · ", def?.title ?? "Block"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "mt-1.5 text-xs text-muted-foreground",
								children: [
									"Release to place here (",
									entry.config.span,
									"/12 cols)"
								]
							})]
						}, `preview-${entry.config.id}`);
					}
					const def = widgetMap.get(entry.config.id);
					if (!def) return null;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BentoSlot, {
						config: entry.config,
						title: def.title,
						editing,
						isDraggingThis: activeId === entry.config.id,
						onSpan: (span) => setSpan(entry.config.id, span),
						onHide: () => toggleHide(entry.config.id),
						children: def.render()
					}, entry.config.id);
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DragOverlay, { children: activeWidget && activeConfig ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "glass-strong w-72 rounded-3xl border-2 border-primary p-4 shadow-2xl",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "inline-flex items-center gap-1.5 font-display text-sm font-bold text-primary",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GripVertical, { className: "h-4 w-4" }), activeWidget.title]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "rounded-full bg-primary/15 px-2 py-0.5 font-mono text-[0.65rem] text-primary",
						children: [activeConfig.span, "/12"]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1.5 text-xs text-muted-foreground",
					children: "Hover over any card to preview placement"
				})]
			}) : null })]
		})]
	});
}
function BentoSlot({ config, title, editing, isDraggingThis, onSpan, onHide, children }) {
	const { setNodeRef: setDropRef, isOver } = useDroppable({
		id: config.id,
		disabled: !editing
	});
	const { attributes, listeners, setNodeRef: setDragRef } = useDraggable({
		id: config.id,
		disabled: !editing
	});
	const setRefs = (el) => {
		setDropRef(el);
		setDragRef(el);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: setRefs,
		...editing ? listeners : {},
		...editing ? attributes : {},
		className: cn("col-span-1 min-w-0 transition-all", SPAN_CLASS[config.span], editing && "relative cursor-grab select-none touch-none rounded-3xl border border-dashed border-primary/45 p-1.5 active:cursor-grabbing", editing && isOver && !isDraggingThis && "ring-2 ring-primary/60", isDraggingThis && "pointer-events-none opacity-25"),
		children: [editing && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-2 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border bg-background/90 px-3 py-1.5 backdrop-blur-md",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "inline-flex items-center gap-1.5 text-xs font-medium text-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GripVertical, { className: "h-3.5 w-3.5 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: title })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-1",
				onPointerDown: (e) => e.stopPropagation(),
				children: [SPAN_CHOICES.map((c) => {
					const active = config.span === c.span || c.span === 6 && (config.span === 5 || config.span === 7);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => onSpan(c.span),
						title: `Resize to ${c.label}`,
						className: cn("rounded-full px-2 py-0.5 font-mono text-[0.65rem] transition-colors", active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"),
						children: c.label
					}, c.span);
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onHide,
					title: `Hide ${title}`,
					className: "ml-1 rounded-full p-1 text-muted-foreground hover:bg-destructive/15 hover:text-destructive",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "h-3.5 w-3.5" })
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: cn(editing && "pointer-events-none opacity-90"),
			children
		})]
	});
}
//#endregion
export { EditableBentoGrid as n, useDashboardTabs as r, EditLayoutButton as t };
