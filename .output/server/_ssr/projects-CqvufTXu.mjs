import { i as __toESM } from "../_runtime.mjs";
import { t as index } from "../_libs/@fullcalendar/interaction+[...].mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { G as shortDate, J as uid, K as toUSD, O as invoiceView, P as parseTimelineDays, W as setDB, X as useDB, Y as updateProject, _ as compactMoney, b as documentKind, d as addDays, g as cn, i as DOCUMENT_TYPES, j as money, k as isInvoice, q as today, u as PROJECT_STATUSES } from "./utils-cyeqUyd1.mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { B as GripVertical, C as Plus, N as List, W as FileText, Z as Columns3, at as CalendarDays, nt as ChevronDown, tt as ChevronUp } from "../_libs/lucide-react.mjs";
import { c as useSensor, i as TouchSensor, l as useSensors, n as DragOverlay, o as useDraggable, r as PointerSensor, s as useDroppable, t as DndContext, u as CSS } from "../_libs/@dnd-kit/core+[...].mjs";
import { i as Glass, n as Empty, o as PageHeader, s as Pill, t as Btn, u as Stat } from "./ui-D6kovTfR.mjs";
import { n as nextCode, t as EditModal } from "./Crud-DU9TmcJj.mjs";
import { n as EditableBentoGrid, t as EditLayoutButton } from "./BentoGrid-7YEDSjDn.mjs";
import { b as Link, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as FullCalendar } from "../_libs/fullcalendar__react.mjs";
import { t as index$1 } from "../_libs/fullcalendar__daygrid.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/projects-CqvufTXu.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var BOARD_COL_LIMIT = 5;
var LIST_LIMIT = 12;
var statusColors = {
	Inquiry: {
		bg: "oklch(0.45 0.04 250 / 85%)",
		border: "oklch(0.6 0.05 250)",
		text: "#ffffff"
	},
	Quoted: {
		bg: "oklch(0.68 0.12 80)",
		border: "oklch(0.83 0.13 82)",
		text: "#18181b"
	},
	"In production": {
		bg: "oklch(0.83 0.13 82)",
		border: "oklch(0.9 0.12 82)",
		text: "#18181b"
	},
	Delivered: {
		bg: "oklch(0.68 0.13 155)",
		border: "oklch(0.78 0.13 155)",
		text: "#09150f"
	},
	Closed: {
		bg: "oklch(0.55 0.1 155)",
		border: "oklch(0.72 0.12 155)",
		text: "#ffffff"
	},
	"On hold": {
		bg: "oklch(0.45 0.02 60)",
		border: "oklch(0.6 0.02 60)",
		text: "#ffffff"
	},
	Lost: {
		bg: "oklch(0.6 0.15 22)",
		border: "oklch(0.7 0.14 22)",
		text: "#ffffff"
	}
};
function toIsoDate(d) {
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function Page() {
	const db = useDB((d) => d);
	const nav = useNavigate();
	const [view, setView] = (0, import_react.useState)("board");
	const [f, setF] = (0, import_react.useState)("All");
	const [showArchivedCols, setShowArchivedCols] = (0, import_react.useState)(false);
	const [expandedCols, setExpandedCols] = (0, import_react.useState)({});
	const [showAllList, setShowAllList] = (0, import_react.useState)(false);
	const [editingLayout, setEditingLayout] = (0, import_react.useState)(false);
	const [edit, setEdit] = (0, import_react.useState)(null);
	const [activeDragId, setActiveDragId] = (0, import_react.useState)(null);
	const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(TouchSensor, { activationConstraint: {
		delay: 180,
		tolerance: 8
	} }));
	const fields = [
		{
			k: "name",
			label: "Project name",
			wide: true
		},
		{
			k: "clientId",
			label: "Client",
			type: "select",
			options: db.clients.map((c) => ({
				value: c.id,
				label: c.name
			}))
		},
		{
			k: "serviceId",
			label: "Service",
			type: "select",
			options: db.services.map((s) => ({
				value: s.id,
				label: `${s.code} · ${s.name}`
			}))
		},
		{
			k: "status",
			label: "Status",
			type: "select",
			options: [...PROJECT_STATUSES]
		},
		{
			k: "quote",
			label: "Quote (USD)",
			type: "number"
		},
		{
			k: "start",
			label: "Start",
			type: "date"
		},
		{
			k: "due",
			label: "Due",
			type: "date"
		},
		{
			k: "delivered",
			label: "Delivered",
			type: "date"
		}
	];
	const t = today();
	const rows = db.projects.filter((p) => f === "All" || p.status === f);
	const visibleListRows = showAllList ? rows : rows.slice(0, LIST_LIMIT);
	const cost = (p) => db.expenses.filter((e) => e.projectId === p.id).reduce((a, e) => a + toUSD(e.amount, e.currency, db.settings.khrRate), 0);
	const projectBilling = (p) => {
		const docs = db.invoices.filter((i) => i.projectId === p.id);
		const bills = docs.filter(isInvoice).map((i) => invoiceView(i, db));
		return {
			docs,
			billed: bills.reduce((a, x) => a + x.totalUSD, 0),
			paid: bills.reduce((a, x) => a + toUSD(x.paid, "USD", db.settings.khrRate), 0)
		};
	};
	const blank = (overrides = {}) => ({
		id: uid(),
		code: nextCode("RVD-", db.projects.map((p) => p.code), 101, 3),
		clientId: "",
		serviceId: "",
		name: "",
		status: "Inquiry",
		start: "",
		due: "",
		delivered: "",
		quote: 0,
		...overrides
	});
	const save = (v) => {
		const s = db.services.find((x) => x.id === v.serviceId);
		const next = { ...v };
		if (!next.quote && s) next.quote = s.rate;
		if (next.status === "Delivered" && !next.delivered) next.delivered = t;
		if (next.status === "In production" && !next.start) next.start = t;
		if (next.start && next.due && next.due < next.start) {
			toast.error("Due date cannot be before start date.");
			return;
		}
		try {
			setDB((d) => updateProject(d, next));
			toast.success("Project saved");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Unable to save project");
		}
	};
	const handleBoardDragStart = (event) => {
		setActiveDragId(String(event.active.id));
	};
	const handleBoardDragEnd = (event) => {
		setActiveDragId(null);
		const { active, over } = event;
		if (!over) return;
		const projectId = String(active.id);
		const nextStatus = String(over.id);
		const proj = db.projects.find((p) => p.id === projectId);
		if (!proj || proj.status === nextStatus) return;
		try {
			setDB((d) => updateProject(d, {
				...proj,
				status: nextStatus
			}));
			toast.success(`${proj.name || proj.code} → ${nextStatus}`);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Unable to move project");
		}
	};
	const boardColumns = showArchivedCols ? [...PROJECT_STATUSES] : [...PROJECT_STATUSES.slice(0, 5)];
	const activeDragged = activeDragId ? db.projects.find((p) => p.id === activeDragId) : void 0;
	const calendarEvents = (0, import_react.useMemo)(() => {
		return db.projects.filter((p) => Boolean(p.start || p.due)).map((p) => {
			const start = p.start || p.due;
			const inclusiveEnd = p.due && p.due >= start ? p.due : start;
			const colors = statusColors[p.status] ?? statusColors["Inquiry"];
			const clientName = db.clients.find((c) => c.id === p.clientId)?.name;
			return {
				id: p.id,
				title: `${p.name || p.code}${clientName ? ` · ${clientName}` : ""}`,
				start,
				end: addDays(inclusiveEnd, 1),
				allDay: true,
				backgroundColor: colors.bg,
				borderColor: colors.border,
				textColor: colors.text,
				extendedProps: { project: p }
			};
		});
	}, [db.projects, db.clients]);
	const unscheduledProjects = db.projects.filter((p) => !p.start && !p.due && !["Closed", "Lost"].includes(p.status));
	const onCalendarDateClick = (arg) => {
		setEdit(blank({
			start: arg.dateStr,
			due: addDays(arg.dateStr, 6),
			status: "In production"
		}));
	};
	const onCalendarSelect = (arg) => {
		const start = toIsoDate(arg.start);
		const inclusiveEnd = addDays(toIsoDate(arg.end), -1);
		setEdit(blank({
			start,
			due: inclusiveEnd >= start ? inclusiveEnd : start,
			status: "In production"
		}));
	};
	const onCalendarEventClick = (arg) => {
		const p = db.projects.find((x) => x.id === arg.event.id);
		if (p) setEdit(p);
	};
	const onCalendarEventDrop = (arg) => {
		const p = db.projects.find((x) => x.id === arg.event.id);
		if (!p || !arg.event.start) return;
		const start = toIsoDate(arg.event.start);
		const due = arg.event.end ? addDays(toIsoDate(arg.event.end), -1) : start;
		try {
			setDB((d) => updateProject(d, {
				...p,
				start,
				due: due >= start ? due : start
			}));
			toast.success(`Rescheduled ${p.name || p.code}`);
		} catch (err) {
			arg.revert();
			toast.error(err instanceof Error ? err.message : "Unable to reschedule");
		}
	};
	const onCalendarEventResize = (arg) => {
		const p = db.projects.find((x) => x.id === arg.event.id);
		if (!p || !arg.event.start) return;
		const start = toIsoDate(arg.event.start);
		const due = arg.event.end ? addDays(toIsoDate(arg.event.end), -1) : start;
		try {
			setDB((d) => updateProject(d, {
				...p,
				start,
				due: due >= start ? due : start
			}));
			toast.success(`Timeline updated (${shortDate(start)} – ${shortDate(due)})`);
		} catch (err) {
			arg.revert();
			toast.error(err instanceof Error ? err.message : "Unable to resize timeline");
		}
	};
	const live = db.projects.filter((p) => p.status === "In production");
	const pipelineTotal = db.projects.filter((p) => ["Inquiry", "Quoted"].includes(p.status)).reduce((a, p) => a + p.quote, 0);
	const widgets = (0, import_react.useMemo)(() => [
		{
			id: "projInProd",
			title: "In production",
			defaultSpan: 4,
			render: () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Glass, {
				className: "h-full",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "In production",
					value: String(live.length)
				})
			})
		},
		{
			id: "projPipeline",
			title: "Pipeline",
			defaultSpan: 4,
			render: () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Glass, {
				delay: 60,
				className: "h-full",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Pipeline",
					value: compactMoney(pipelineTotal),
					fullValue: money(pipelineTotal)
				})
			})
		},
		{
			id: "projLate",
			title: "Late",
			defaultSpan: 4,
			render: () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Glass, {
				delay: 120,
				className: "h-full",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Late",
					tone: "neg",
					value: String(live.filter((p) => p.due && p.due < t).length)
				})
			})
		},
		{
			id: "projWorkspace",
			title: "Projects board & calendar",
			defaultSpan: 12,
			render: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-4 flex flex-wrap items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "inline-flex rounded-full border border-border bg-muted p-1 text-xs",
						children: [
							{
								id: "board",
								label: "Board",
								icon: Columns3
							},
							{
								id: "calendar",
								label: "Calendar",
								icon: CalendarDays
							},
							{
								id: "list",
								label: "List",
								icon: List
							}
						].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => setView(item.id),
							className: cn("inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-medium transition-colors", view === item.id ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, { className: "h-3.5 w-3.5" }), item.label]
						}, item.id))
					}), view === "board" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setShowArchivedCols((s) => !s),
						className: "rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground",
						children: showArchivedCols ? "Hide On hold & Lost" : "Show On hold & Lost"
					})]
				}),
				view === "board" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DndContext, {
					sensors,
					onDragStart: handleBoardDragStart,
					onDragEnd: handleBoardDragEnd,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex gap-3 overflow-x-auto pb-3 lg:grid lg:grid-cols-5 lg:overflow-visible",
						children: boardColumns.map((status) => {
							const colProjects = db.projects.filter((p) => p.status === status);
							const isColExpanded = Boolean(expandedCols[status]);
							const visibleColProjects = isColExpanded ? colProjects : colProjects.slice(0, BOARD_COL_LIMIT);
							const colHasMore = colProjects.length > BOARD_COL_LIMIT;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BoardColumn, {
								status,
								count: colProjects.length,
								onAdd: () => setEdit(blank({ status })),
								children: colProjects.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "rounded-xl border border-dashed border-border/70 py-6 text-center text-xs text-muted-foreground",
									children: "Drop project here"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [visibleColProjects.map((p) => {
									const billing = projectBilling(p);
									const late = p.status === "In production" && Boolean(p.due && p.due < t);
									return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BoardCard, {
										project: p,
										clientName: db.clients.find((c) => c.id === p.clientId)?.name ?? "No client",
										docsCount: billing.docs.length,
										paidUSD: billing.paid,
										late,
										onOpen: () => setEdit(p)
									}, p.id);
								}), colHasMore && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setExpandedCols((prev) => ({
										...prev,
										[status]: !isColExpanded
									})),
									className: "mt-1 inline-flex w-full items-center justify-center gap-1 rounded-xl border border-border/80 bg-background/40 px-2.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground",
									children: isColExpanded ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "h-3.5 w-3.5" }),
										"Hide (",
										colProjects.length - BOARD_COL_LIMIT,
										")"
									] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-3.5 w-3.5" }),
										"Show all (",
										colProjects.length,
										")"
									] })
								})] })
							}, status);
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DragOverlay, { children: activeDragged ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "glass-strong w-64 rounded-2xl border border-primary/60 p-3.5 shadow-2xl",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-mono text-[0.68rem] text-muted-foreground",
								children: activeDragged.code
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate font-medium",
								children: activeDragged.name || "Untitled"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 font-mono text-xs text-primary",
								children: money(activeDragged.quote)
							})
						]
					}) : null })]
				}),
				view === "calendar" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Glass, {
						delay: 120,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Click or drag across days to add a project · Drag bars to reschedule · Drag bar edge to extend timeline" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex flex-wrap gap-2",
								children: [
									"Quoted",
									"In production",
									"Delivered",
									"Closed"
								].map((st) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "inline-flex items-center gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "h-2.5 w-2.5 rounded-full",
										style: { background: statusColors[st]?.bg }
									}), st]
								}, st))
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "project-calendar",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FullCalendar, {
								plugins: [index$1, index],
								initialView: "dayGridMonth",
								headerToolbar: {
									left: "prev,next today",
									center: "title",
									right: ""
								},
								height: "auto",
								editable: true,
								selectable: true,
								selectMirror: true,
								eventStartEditable: true,
								eventDurationEditable: true,
								dayMaxEvents: 3,
								events: calendarEvents,
								dateClick: onCalendarDateClick,
								select: onCalendarSelect,
								eventClick: onCalendarEventClick,
								eventDrop: onCalendarEventDrop,
								eventResize: onCalendarEventResize
							})
						})]
					}), unscheduledProjects.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Glass, {
						delay: 160,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-3 flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
								className: "font-display text-base font-bold",
								children: [
									"Unscheduled projects (",
									unscheduledProjects.length,
									")"
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted-foreground",
								children: "Schedule onto calendar"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid gap-2 sm:grid-cols-2 lg:grid-cols-3",
							children: unscheduledProjects.map((p) => {
								const clientName = db.clients.find((c) => c.id === p.clientId)?.name ?? "No client";
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between gap-2 rounded-2xl border border-border bg-muted/60 p-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										onClick: () => setEdit(p),
										className: "min-w-0 flex-1 text-left",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "truncate text-sm font-medium",
											children: p.name || p.code
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "truncate text-xs text-muted-foreground",
											children: [
												clientName,
												" · ",
												p.status
											]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
										className: "shrink-0 px-3 py-1 text-xs",
										onClick: () => {
											const svc = db.services.find((s) => s.id === p.serviceId);
											const days = svc?.timeline ? parseTimelineDays(svc.timeline, 7) : 7;
											try {
												setDB((d) => updateProject(d, {
													...p,
													start: t,
													due: addDays(t, days)
												}));
												toast.success(`Scheduled ${p.name || p.code} starting today`);
											} catch (err) {
												toast.error(err instanceof Error ? err.message : "Unable to schedule");
											}
										},
										children: "Schedule"
									})]
								}, p.id);
							})
						})]
					})]
				}),
				view === "list" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Glass, {
					delay: 180,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mb-4 flex flex-wrap gap-1.5",
						children: ["All", ...PROJECT_STATUSES].map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => {
								setF(x);
								setShowAllList(false);
							},
							className: cn("rounded-full border border-border px-3 py-1 text-xs", f === x ? "bg-primary text-primary-foreground" : "hover:bg-accent"),
							children: [x, x !== "All" && ` ${db.projects.filter((p) => p.status === x).length}`]
						}, x))
					}), rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { children: "No projects here." }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "divide-y divide-border",
						children: visibleListRows.map((p, k) => {
							const c = cost(p);
							const billing = projectBilling(p);
							const late = p.status === "In production" && Boolean(p.due && p.due < t);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
								className: "rise",
								style: { animationDelay: `${Math.min(k, 12) * 25}ms` },
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: () => setEdit(p),
									className: "grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl px-2 py-3 text-left hover:bg-muted",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "truncate font-medium",
											children: [
												p.name || "Untitled",
												" ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-mono text-xs text-muted-foreground",
													children: p.code
												})
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: cn("truncate text-xs text-muted-foreground", late && "text-destructive"),
											children: [
												db.clients.find((x) => x.id === p.clientId)?.name ?? "No client",
												" ",
												"· ",
												p.start ? `${shortDate(p.start)} → ` : "",
												"due ",
												shortDate(p.due),
												late && " · late",
												billing.docs.length > 0 && ` · ${billing.docs.length} docs`
											]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "text-right",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "font-mono text-sm tabular-nums",
													children: money(p.quote)
												}),
												billing.paid > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "text-xs text-positive tabular-nums",
													children: [money(billing.paid), " paid"]
												}),
												c > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "text-xs text-muted-foreground tabular-nums",
													children: ["margin ", money(p.quote - c)]
												})
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, { s: p.status })]
									})]
								})
							}, p.id);
						})
					}), rows.length > LIST_LIMIT && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex items-center justify-between gap-3 border-t border-border/70 pt-3 text-xs text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							"Showing ",
							visibleListRows.length,
							" of ",
							rows.length,
							" ",
							"projects"
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
							type: "button",
							onClick: () => setShowAllList((s) => !s),
							className: "px-3.5 py-1.5 text-xs",
							children: showAllList ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "h-3.5 w-3.5" }),
								"Hide (",
								rows.length - LIST_LIMIT,
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
			] })
		}
	], [
		live,
		pipelineTotal,
		t,
		view,
		showArchivedCols,
		sensors,
		boardColumns,
		db,
		expandedCols,
		activeDragged,
		calendarEvents,
		unscheduledProjects,
		f,
		rows,
		visibleListRows,
		showAllList
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Projects",
			owner: db.settings.ownerName,
			action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditLayoutButton, {
					editing: editingLayout,
					onToggle: () => setEditingLayout((e) => !e)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Btn, {
					variant: "gold",
					onClick: () => setEdit(blank()),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), "New project"]
				})]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditableBentoGrid, {
			pageKey: "projects",
			widgets,
			editing: editingLayout,
			onDoneEditing: () => setEditingLayout(false)
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditModal, {
			presentation: "drawer",
			side: "right",
			item: edit,
			fields,
			subtitle: edit?.status || "Project",
			title: edit?.name || edit?.code || "Project",
			onClose: () => setEdit(null),
			onSave: save,
			onFieldChange: (next, key) => {
				if (key === "serviceId") {
					const svc = db.services.find((s) => s.id === next.serviceId);
					if (svc) {
						const start = next.start || today();
						const days = parseTimelineDays(svc.timeline, 7);
						return {
							...next,
							name: next.name || svc.name,
							quote: next.quote || svc.rate,
							due: next.due || addDays(start, days)
						};
					}
				}
				return next;
			},
			footerExtra: (proj) => {
				const linkedDocs = db.projects.some((p) => p.id === proj.id) ? db.invoices.filter((i) => i.projectId === proj.id) : [];
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-border bg-muted/60 p-3 text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-2 flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "label-mono",
								children: "Connected documents"
							}), linkedDocs.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-muted-foreground",
								children: [linkedDocs.length, " linked"]
							})]
						}),
						linkedDocs.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mb-2.5 flex flex-wrap gap-1.5",
							children: linkedDocs.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/invoices/$id",
								params: { id: d.id },
								onClick: () => setEdit(null),
								className: "inline-flex items-center gap-1 rounded-full border border-border bg-background/60 px-2.5 py-1 font-mono hover:border-primary",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-3 w-3 text-primary" }),
									documentKind(d),
									" · ",
									d.no
								]
							}, d.id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-1.5",
							children: DOCUMENT_TYPES.map((docKind) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Btn, {
								type: "button",
								className: "px-2.5 py-1 text-xs",
								onClick: () => {
									const savedProj = { ...proj };
									if (!savedProj.name.trim()) savedProj.name = db.services.find((s) => s.id === savedProj.serviceId)?.name || "Design project";
									setDB((d) => updateProject(d, savedProj));
									setEdit(null);
									nav({
										to: "/invoices/$id",
										params: { id: "new" },
										search: {
											kind: docKind,
											project: savedProj.id,
											...savedProj.clientId ? { client: savedProj.clientId } : {},
											...savedProj.serviceId ? { service: savedProj.serviceId } : {}
										}
									});
								},
								children: ["+ ", docKind]
							}, docKind))
						})
					]
				});
			},
			onDelete: db.projects.some((p) => p.id === edit?.id) ? (v) => setDB((d) => ({
				...d,
				projects: d.projects.filter((p) => p.id !== v.id),
				invoices: d.invoices.map((i) => i.projectId === v.id ? {
					...i,
					projectId: ""
				} : i)
			})) : void 0
		})
	] });
}
function BoardColumn({ status, count, onAdd, children }) {
	const { setNodeRef, isOver } = useDroppable({ id: status });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: setNodeRef,
		className: cn("glass flex min-h-72 min-w-[260px] flex-col rounded-3xl p-3.5 transition-colors lg:min-w-0", isOver && "border-primary bg-primary/10"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-3 flex items-center justify-between gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, { s: status }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-mono text-xs text-muted-foreground",
					children: count
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: onAdd,
				className: "rounded-full p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground",
				"aria-label": `Add project in ${status}`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" })
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex flex-1 flex-col gap-2.5",
			children
		})]
	});
}
function BoardCard({ project, clientName, docsCount, paidUSD, late, onOpen }) {
	const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: project.id });
	const style = transform ? { transform: CSS.Translate.toString(transform) } : void 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: setNodeRef,
		style,
		...listeners,
		...attributes,
		onClick: onOpen,
		role: "button",
		tabIndex: 0,
		onKeyDown: (e) => {
			if (e.key === "Enter" || e.key === " ") {
				e.preventDefault();
				onOpen();
			}
		},
		className: cn("group cursor-grab touch-none rounded-2xl border border-border bg-muted/60 p-3 text-left transition-all hover:border-primary/50 hover:bg-muted active:cursor-grabbing", isDragging && "opacity-40"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-[0.66rem] text-muted-foreground",
							children: project.code
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-0.5 truncate text-sm font-semibold",
							children: project.name || "Untitled"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-xs text-muted-foreground",
							children: clientName
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "rounded-lg p-1 text-muted-foreground group-hover:text-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GripVertical, { className: "h-4 w-4" })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2.5 flex w-full items-center justify-between border-t border-border/60 pt-2 text-xs",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("text-muted-foreground", late && "font-medium text-destructive"),
					children: project.due ? `Due ${shortDate(project.due)}${late ? " · late" : ""}` : "No dates"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "font-mono font-medium tabular-nums",
					children: [compactMoney(project.quote), paidUSD > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "ml-1 text-positive",
						children: [
							"(",
							compactMoney(paidUSD),
							")"
						]
					}) : null]
				})]
			}),
			docsCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 font-mono text-[0.65rem] text-muted-foreground",
				children: [
					docsCount,
					" linked doc",
					docsCount > 1 ? "s" : ""
				]
			})
		]
	});
}
//#endregion
export { Page as component };
