import { i as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { E as goalAccount, F as personalCategoryTotals, G as shortDate, I as personalSeries, K as toUSD, M as needsFollowUp, O as invoiceView, W as setDB, X as useDB, _ as compactMoney, b as documentKind, f as cashFlowSeries, g as cn, j as money, k as isInvoice, q as today, u as PROJECT_STATUSES, x as expenseAccount } from "./utils-cyeqUyd1.mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { C as Plus, T as PiggyBank, U as FolderKanban, W as FileText, c as Users, dt as ArrowUpRight, f as Trash2, mt as ArrowDownLeft } from "../_libs/lucide-react.mjs";
import { i as Glass, l as SlideDrawer, o as PageHeader, s as Pill, t as Btn, u as Stat } from "./ui-D6kovTfR.mjs";
import { n as EditableBentoGrid, r as useDashboardTabs, t as EditLayoutButton } from "./BentoGrid-CunpmRkD.mjs";
import { a as expenseItemIcon, i as GoalRingCard, n as BudgetShelf, r as CategoryInspectorDrawer, t as AnimatedNumber } from "./FinanceVisuals-v4-NvIag.mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as CartesianGrid, i as Area, n as YAxis, o as ResponsiveContainer, r as XAxis, s as Tooltip, t as AreaChart } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CUdyRsTg.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var RANGE_OPTIONS = [
	{
		id: "6m",
		label: "6 months",
		desc: "last 6 months"
	},
	{
		id: "12m",
		label: "12 months",
		desc: "last 12 months"
	},
	{
		id: "all",
		label: "All time",
		desc: "all time"
	}
];
var PERSONAL_RANGES = [
	{
		id: "1m",
		label: "This month",
		desc: "this month"
	},
	{
		id: "6m",
		label: "6 months",
		desc: "last 6 months"
	},
	{
		id: "12m",
		label: "12 months",
		desc: "last 12 months"
	}
];
var SYSTEM_WIDGET_CATALOG = [
	{
		id: "followUps",
		label: "Client follow-ups",
		desc: "Quotations awaiting reply and unsigned agreements"
	},
	{
		id: "netProfit",
		label: "Studio net cash profit",
		desc: "Headline profit sparkline, outstanding A/R & monthly spend"
	},
	{
		id: "cashFlowChart",
		label: "Studio cash flow",
		desc: "Interactive 6m / 12m / All time revenue vs expense trend"
	},
	{
		id: "personalExpenses",
		label: "Personal expenses & jars",
		desc: "This month / 6m / 12m living spend jars & recent items"
	},
	{
		id: "goalsRings",
		label: "Goals & savings",
		desc: "Animated progress rings with quick +$50 / +$100 deposits"
	},
	{
		id: "recentActivity",
		label: "Recent activity",
		desc: "Latest client payments, invoices, and studio/personal spend"
	},
	{
		id: "projectPipeline",
		label: "Project pipeline",
		desc: "Counts across Inquiry, Quoted, Production, Delivered & Ready to close"
	},
	{
		id: "invoicesSummary",
		label: "Invoices due & overdue",
		desc: "Unpaid invoices requiring collection or follow-up"
	},
	{
		id: "topClients",
		label: "Top studio clients",
		desc: "Active clients ranked by total billed volume"
	}
];
function Overview() {
	const db = useDB((d) => d);
	const [range, setRange] = (0, import_react.useState)("all");
	const [personalRange, setPersonalRange] = (0, import_react.useState)("1m");
	const [inspectedCategory, setInspectedCategory] = (0, import_react.useState)(null);
	const [editingLayout, setEditingLayout] = (0, import_react.useState)(false);
	const [activeTab, setActiveTab] = (0, import_react.useState)("overview");
	const [newTabOpen, setNewTabOpen] = (0, import_react.useState)(false);
	const [newTabName, setNewTabName] = (0, import_react.useState)("");
	const [newTabWidgets, setNewTabWidgets] = (0, import_react.useState)([
		"netProfit",
		"cashFlowChart",
		"personalExpenses",
		"goalsRings"
	]);
	const { tabs, addTab, removeTab } = useDashboardTabs();
	const s = cashFlowSeries(db, range);
	const rangeMeta = RANGE_OPTIONS.find((o) => o.id === range) ?? RANGE_OPTIONS[2];
	const netRange = s.reduce((a, x) => a + x.net, 0);
	let run = 0;
	const spark = s.map((x) => ({ v: run += x.net }));
	const views = db.invoices.map((i) => ({
		i,
		v: invoiceView(i, db)
	}));
	const followUps = db.invoices.filter((i) => needsFollowUp(i)).sort((a, b) => (a.followUp ?? "").localeCompare(b.followUp ?? ""));
	const outstanding = views.filter((x) => x.v.status !== "Draft").reduce((a, x) => a + x.v.balanceUSD, 0);
	const overdue = views.filter((x) => x.v.status === "Overdue").reduce((a, x) => a + x.v.balanceUSD, 0);
	const cashIn = s.reduce((a, x) => a + x.inn, 0), cashOut = s.reduce((a, x) => a + x.out, 0);
	const r = db.settings.khrRate;
	const thisMonth = today().slice(0, 7);
	const personalTrend = personalSeries(db, personalRange, thisMonth);
	const personalAgg = personalCategoryTotals(db, personalRange, thisMonth);
	const personalRangeTotal = personalTrend.reduce((a, x) => a + x.personalOut, 0);
	const personalAvgPerMonth = personalRangeTotal / personalAgg.monthsCount;
	const personalMonthTotal = personalCategoryTotals(db, "1m", thisMonth).items.reduce((a, c) => a + c.totalUSD, 0);
	const personalItemsPeriod = [...db.expenses].filter((e) => expenseAccount(e) === "Personal" && personalAgg.monthSet.has(e.date.slice(0, 7))).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);
	const activity = [
		...db.payments.map((p) => {
			const inv = db.invoices.find((i) => i.id === p.invoiceId);
			const c = db.clients.find((c) => c.id === inv?.clientId);
			return {
				date: p.date,
				title: `${c?.name ?? "Client"} · ${p.reference || "payment"}`,
				sub: `Income · ${p.method}`,
				amt: toUSD(p.amount, p.currency, r),
				kind: "in",
				expense: null
			};
		}),
		...db.expenses.map((e) => ({
			date: e.date,
			title: e.description || e.vendor,
			sub: `${expenseAccount(e)} · ${e.category}`,
			amt: -toUSD(e.amount, e.currency, r),
			kind: "out",
			expense: e
		})),
		...db.invoices.filter(isInvoice).map((i) => ({
			date: i.issue,
			title: `Invoice ${i.no}`,
			sub: `Issued · ${db.clients.find((c) => c.id === i.clientId)?.name ?? ""}`,
			amt: invoiceView(i, db).totalUSD,
			kind: "inv",
			expense: null
		}))
	].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7);
	const year = today().slice(0, 4);
	const goalValue = (g) => g.kind === "cash" ? db.payments.filter((p) => p.date.startsWith(year)).reduce((a, p) => a + toUSD(p.amount, p.currency, r), 0) : g.kind === "clients" ? db.clients.filter((c) => c.status !== "Lead").length : g.current;
	const readyToClose = db.projects.filter((p) => p.status === "Delivered" && (() => {
		const inv = views.filter((x) => isInvoice(x.i) && x.i.projectId === p.id);
		return inv.length > 0 && inv.every((x) => x.v.status === "Paid");
	})()).length;
	const openInvoicesList = views.filter((x) => isInvoice(x.i) && x.v.balanceUSD > 0 && x.v.status !== "Draft").sort((a, b) => a.i.due.localeCompare(b.i.due)).slice(0, 6);
	const topClientsList = [...db.clients].map((c) => {
		return {
			c,
			billed: views.filter((x) => x.i.clientId === c.id).reduce((a, x) => a + x.v.totalUSD, 0)
		};
	}).filter((x) => x.billed > 0).sort((a, b) => b.billed - a.billed).slice(0, 6);
	const allWidgets = (0, import_react.useMemo)(() => ({
		followUps: {
			id: "followUps",
			title: "Client follow-ups",
			defaultSpan: 12,
			render: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Glass, {
				className: "h-full",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-3 flex flex-wrap items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
							className: "font-display text-lg font-bold",
							children: [
								"Client follow-ups",
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-primary",
									children: followUps.length
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/invoices",
							className: "text-sm text-primary",
							children: "Documents →"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-3 flex flex-wrap gap-4 text-sm text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							db.invoices.filter((i) => documentKind(i) === "Quotation" && i.sent && (!i.response || i.response === "Pending")).length,
							" ",
							"quotations awaiting response"
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							db.invoices.filter((i) => documentKind(i) === "Agreement" && i.response !== "Accepted").length,
							" ",
							"agreements awaiting signature"
						] })]
					}),
					followUps.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "divide-y divide-border",
						children: followUps.slice(0, 5).map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/invoices/$id",
							params: { id: i.id },
							className: "flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								db.clients.find((c) => c.id === i.clientId)?.name,
								" ·",
								" ",
								i.no
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-primary",
								children: [
									"Follow up · ",
									shortDate(i.followUp ?? ""),
									" →"
								]
							})]
						}) }, i.id))
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "No quotation follow-ups due."
					})
				]
			})
		},
		netProfit: {
			id: "netProfit",
			title: "Studio net profit",
			defaultSpan: 5,
			render: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Glass, {
				className: "flex h-full flex-col justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted-foreground",
						children: ["Studio net cash profit, ", rangeMeta.desc]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: cn("mt-2 font-display text-4xl font-black tabular-nums", netRange < 0 && "text-destructive"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatedNumber, { value: netRange })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted-foreground",
						children: "Studio cash received minus RothVan Design expenses"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "my-4 h-24 w-full shrink-0",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
							width: "100%",
							height: 96,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
								data: spark,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
									id: "sp",
									x1: "0",
									y1: "0",
									x2: "0",
									y2: "1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
										offset: "0",
										stopColor: "var(--primary)",
										stopOpacity: .4
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
										offset: "1",
										stopColor: "var(--primary)",
										stopOpacity: 0
									})]
								}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
									dataKey: "v",
									stroke: "var(--primary)",
									strokeWidth: 2,
									fill: "url(#sp)",
									type: "monotone",
									animationDuration: 750,
									animationEasing: "ease-out"
								})]
							})
						})
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-3 gap-3 border-t border-border pt-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/invoices",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "Outstanding",
								value: compactMoney(outstanding),
								fullValue: money(outstanding)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/invoices",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "Overdue",
								value: compactMoney(overdue),
								fullValue: money(overdue),
								tone: overdue > 0 ? "neg" : void 0
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/finance",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "Personal (mo)",
								value: compactMoney(personalMonthTotal),
								fullValue: money(personalMonthTotal)
							})
						})
					]
				})]
			})
		},
		cashFlowChart: {
			id: "cashFlowChart",
			title: "Studio cash flow",
			defaultSpan: 7,
			render: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Glass, {
				delay: 80,
				className: "h-full",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-4 flex flex-wrap items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-medium",
							children: "Studio cash flow"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex rounded-full border border-border bg-muted p-1 text-xs",
							children: RANGE_OPTIONS.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setRange(o.id),
								className: cn("rounded-full px-3 py-1 transition-colors", range === o.id ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"),
								children: o.label
							}, o.id))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-3 grid grid-cols-3 gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "● Cash in",
								value: compactMoney(cashIn),
								fullValue: money(cashIn)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "○ Studio out",
								value: compactMoney(cashOut),
								fullValue: money(cashOut)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "Net",
								value: compactMoney(cashIn - cashOut, "USD", true),
								fullValue: money(cashIn - cashOut, "USD", true),
								tone: cashIn - cashOut >= 0 ? "pos" : "neg"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-56 w-full shrink-0",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
							width: "100%",
							height: 224,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
								data: s,
								margin: {
									left: -18,
									right: 4,
									top: 8
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
										id: "cf",
										x1: "0",
										y1: "0",
										x2: "0",
										y2: "1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
											offset: "0",
											stopColor: "var(--primary)",
											stopOpacity: .35
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
											offset: "1",
											stopColor: "var(--primary)",
											stopOpacity: 0
										})]
									}) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
										stroke: "var(--border)",
										strokeDasharray: "3 6",
										vertical: false
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
										dataKey: "label",
										tick: {
											fill: "var(--muted-foreground)",
											fontSize: 11
										},
										axisLine: false,
										tickLine: false
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
										tick: {
											fill: "var(--muted-foreground)",
											fontSize: 11
										},
										axisLine: false,
										tickLine: false,
										tickFormatter: (v) => compactMoney(Number(v))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
										contentStyle: {
											background: "var(--popover)",
											border: "1px solid var(--border)",
											borderRadius: 12,
											color: "var(--foreground)"
										},
										formatter: (v) => money(v)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
										name: "Cash in",
										dataKey: "inn",
										type: "monotone",
										stroke: "var(--primary)",
										strokeWidth: 2,
										fill: "url(#cf)",
										animationDuration: 750,
										animationEasing: "ease-out"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
										name: "Studio expenses",
										dataKey: "out",
										type: "monotone",
										stroke: "var(--muted-foreground)",
										strokeDasharray: "5 5",
										fill: "transparent",
										animationDuration: 750,
										animationEasing: "ease-out"
									})
								]
							})
						})
					})
				]
			})
		},
		personalExpenses: {
			id: "personalExpenses",
			title: "Personal expenses",
			defaultSpan: 6,
			render: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Glass, {
				delay: 120,
				className: "h-full",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-3 flex flex-wrap items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PiggyBank, { className: "h-4 w-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
								className: "font-medium",
								children: ["Personal expenses · ", personalAgg.scopeLabel]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex rounded-full border border-border bg-muted p-1 text-xs",
							children: PERSONAL_RANGES.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setPersonalRange(o.id),
								className: cn("rounded-full px-2.5 py-1 transition-colors", personalRange === o.id ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"),
								children: o.label
							}, o.id))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-4 grid grid-cols-3 gap-3 border-b border-border pb-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: personalRange === "1m" ? "Spent (mo)" : `Spent (${personalRange})`,
								value: compactMoney(personalRangeTotal),
								fullValue: money(personalRangeTotal),
								tone: "neg"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "Avg / month",
								value: compactMoney(personalAvgPerMonth),
								fullValue: money(personalAvgPerMonth)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "Categories",
								value: String(personalAgg.items.length)
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mb-4 h-32 w-full shrink-0",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
							width: "100%",
							height: 128,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
								data: personalTrend,
								margin: {
									left: -22,
									right: 4,
									top: 6
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
										id: "ov-pers",
										x1: "0",
										y1: "0",
										x2: "0",
										y2: "1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
											offset: "0",
											stopColor: "var(--primary)",
											stopOpacity: .35
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
											offset: "1",
											stopColor: "var(--primary)",
											stopOpacity: 0
										})]
									}) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
										stroke: "var(--border)",
										strokeDasharray: "3 6",
										vertical: false
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
										dataKey: "label",
										tick: {
											fill: "var(--muted-foreground)",
											fontSize: 10
										},
										axisLine: false,
										tickLine: false,
										interval: personalRange === "1m" ? 4 : 0
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
										tick: {
											fill: "var(--muted-foreground)",
											fontSize: 10
										},
										axisLine: false,
										tickLine: false,
										tickFormatter: (v) => compactMoney(Number(v))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
										contentStyle: {
											background: "var(--popover)",
											border: "1px solid var(--border)",
											borderRadius: 12,
											color: "var(--foreground)"
										},
										formatter: (v) => money(v)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
										name: "Personal spend",
										dataKey: "personalOut",
										type: "monotone",
										stroke: "var(--primary)",
										strokeWidth: 2,
										fill: "url(#ov-pers)",
										animationDuration: 650,
										animationEasing: "ease-out"
									})
								]
							})
						})
					}),
					personalAgg.items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted-foreground",
						children: [
							"No personal expenses recorded in ",
							personalAgg.scopeLabel,
							"."
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BudgetShelf, {
						db,
						account: "Personal",
						month: thisMonth,
						monthLabel: personalAgg.scopeLabel,
						items: personalAgg.items,
						selectedCategory: inspectedCategory,
						onSelectCategory: (cat) => setInspectedCategory(cat),
						limitScale: personalAgg.monthsCount,
						compact: true
					}),
					personalItemsPeriod.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-4 divide-y divide-border border-t border-border pt-2",
						children: personalItemsPeriod.map((e) => {
							const ItemIcon = expenseItemIcon(e);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-center justify-between gap-3 py-2 text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex min-w-0 items-center gap-2.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-border bg-muted text-primary",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemIcon, { className: "h-3.5 w-3.5" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "truncate text-muted-foreground",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", {
												className: "font-medium text-foreground",
												children: e.description || e.vendor
											}),
											" ",
											"· ",
											e.category,
											" · ",
											shortDate(e.date)
										]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "shrink-0 font-mono tabular-nums text-destructive",
									children: money(-toUSD(e.amount, e.currency, r))
								})]
							}, e.id);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/finance",
						className: "mt-3 block text-xs text-primary hover:underline",
						children: "Open full Personal Finance ledger →"
					})
				]
			})
		},
		goalsRings: {
			id: "goalsRings",
			title: "Goals & savings",
			defaultSpan: 6,
			render: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Glass, {
				delay: 160,
				className: "h-full",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-3 flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-medium",
							children: "Goals & savings"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-sm text-muted-foreground",
							children: [db.goals.length, " active"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-3 sm:grid-cols-2",
						children: db.goals.slice(0, 4).map((g, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoalRingCard, {
							goal: g,
							current: goalValue(g),
							accountLabel: goalAccount(g),
							delay: idx * 60,
							onEdit: () => {},
							onQuickAdd: g.kind === "manual" ? (amt) => setDB((d) => ({
								...d,
								goals: d.goals.map((x) => x.id === g.id ? {
									...x,
									current: x.current + amt
								} : x)
							})) : void 0
						}, g.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/finance",
						className: "mt-4 block text-xs text-muted-foreground hover:text-foreground",
						children: [
							"Manage all ",
							db.goals.length,
							" studio & personal goals in Finance →"
						]
					})
				]
			})
		},
		recentActivity: {
			id: "recentActivity",
			title: "Recent activity",
			defaultSpan: 12,
			render: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Glass, {
				delay: 200,
				className: "h-full",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3 flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-medium",
						children: "Recent activity"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/finance",
						className: "text-sm text-muted-foreground hover:text-foreground",
						children: "View all →"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "divide-y divide-border",
					children: activity.map((a, k) => {
						const OutIcon = a.expense ? expenseItemIcon(a.expense) : ArrowUpRight;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "rise flex items-center gap-3 py-3",
							style: { animationDelay: `${180 + k * 40}ms` },
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border bg-muted", a.kind === "in" && "text-positive", a.kind === "out" && "text-primary"),
									children: a.kind === "in" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDownLeft, { className: "h-4 w-4" }) : a.kind === "out" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OutIcon, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-4 w-4" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "truncate text-sm font-medium",
										children: a.title
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "truncate text-xs text-muted-foreground",
										children: [
											a.sub,
											" · ",
											shortDate(a.date)
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: cn("shrink-0 font-mono text-sm tabular-nums", a.kind === "in" && "text-positive", a.kind === "out" && "text-destructive", a.kind === "inv" && "text-muted-foreground"),
									children: a.kind === "inv" ? money(a.amt) : money(a.amt, "USD", true)
								})
							]
						}, k);
					})
				})]
			})
		},
		projectPipeline: {
			id: "projectPipeline",
			title: "Project pipeline",
			defaultSpan: 12,
			render: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Glass, {
				delay: 260,
				className: "h-full",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-4 flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderKanban, { className: "h-4 w-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-medium",
							children: "Project pipeline"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/projects",
						className: "text-sm text-muted-foreground hover:text-foreground",
						children: "Open board →"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6",
					children: [PROJECT_STATUSES.slice(0, 5).map((st) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/projects",
						className: "rounded-2xl border border-border bg-muted p-4 transition-transform hover:-translate-y-0.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "label-mono",
							children: st
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-3xl font-black tabular-nums",
							children: db.projects.filter((p) => p.status === st).length
						})]
					}, st)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/projects",
						className: "rounded-2xl border border-primary/50 bg-primary/15 p-4 text-primary transition-transform hover:-translate-y-0.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-[0.68rem] uppercase tracking-wider",
							children: "Ready to close"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-3xl font-black tabular-nums",
							children: readyToClose
						})]
					})]
				})]
			})
		},
		invoicesSummary: {
			id: "invoicesSummary",
			title: "Invoices due & overdue",
			defaultSpan: 6,
			render: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Glass, {
				className: "h-full",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3 flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-4 w-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-medium",
							children: "Invoices due & overdue"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/invoices",
						className: "text-xs text-primary hover:underline",
						children: "All invoices →"
					})]
				}), openInvoicesList.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "py-4 text-sm text-muted-foreground",
					children: "No open invoice balances."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "divide-y divide-border",
					children: openInvoicesList.map(({ i, v }) => {
						const client = db.clients.find((c) => c.id === i.clientId);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/invoices/$id",
							params: { id: i.id },
							className: "flex items-center justify-between gap-2 py-2.5 text-xs hover:text-primary",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "truncate font-mono font-medium",
									children: [
										i.no,
										" · ",
										client?.name ?? "Client"
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-muted-foreground",
									children: ["Due ", shortDate(i.due)]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono font-semibold tabular-nums",
									children: compactMoney(v.balanceUSD)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, { s: v.status })]
							})]
						}) }, i.id);
					})
				})]
			})
		},
		topClients: {
			id: "topClients",
			title: "Top studio clients",
			defaultSpan: 6,
			render: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Glass, {
				className: "h-full",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3 flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-4 w-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-medium",
							children: "Top studio clients"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/clients",
						className: "text-xs text-primary hover:underline",
						children: "Directory →"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "divide-y divide-border",
					children: topClientsList.map(({ c, billed }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center justify-between gap-2 py-2.5 text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate font-medium",
								children: c.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "truncate text-muted-foreground",
								children: [
									c.industry || c.type,
									" · ",
									c.code
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono font-semibold tabular-nums",
								title: money(billed),
								children: compactMoney(billed)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, { s: c.status })]
						})]
					}, c.id))
				})]
			})
		}
	}), [
		db,
		followUps,
		rangeMeta,
		netRange,
		spark,
		outstanding,
		overdue,
		personalMonthTotal,
		range,
		cashIn,
		cashOut,
		s,
		personalAgg,
		personalRange,
		personalRangeTotal,
		personalAvgPerMonth,
		personalTrend,
		thisMonth,
		inspectedCategory,
		personalItemsPeriod,
		r,
		activity,
		readyToClose,
		openInvoicesList,
		topClientsList
	]);
	const overviewWidgetList = [
		allWidgets["followUps"],
		allWidgets["netProfit"],
		allWidgets["cashFlowChart"],
		allWidgets["personalExpenses"],
		allWidgets["goalsRings"],
		allWidgets["recentActivity"],
		allWidgets["projectPipeline"]
	];
	const currentCustomTab = tabs.find((t) => t.id === activeTab);
	const currentWidgets = currentCustomTab ? currentCustomTab.widgetIds.map((id) => allWidgets[id]).filter((w) => Boolean(w)) : overviewWidgetList;
	const pageKey = activeTab === "overview" ? "overview" : `overview:${activeTab}`;
	const toggleNewTabWidget = (id) => {
		setNewTabWidgets((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: currentCustomTab ? currentCustomTab.label : "Overview",
			owner: db.settings.ownerName,
			action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditLayoutButton, {
					editing: editingLayout,
					onToggle: () => setEditingLayout((e) => !e)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/invoices/$id",
					params: { id: "new" },
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Btn, {
						variant: "gold",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), "New invoice"]
					})
				})]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-5 flex flex-wrap items-center justify-between gap-2",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-1.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => {
							setActiveTab("overview");
							setEditingLayout(false);
						},
						className: cn("rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors", activeTab === "overview" ? "border-primary bg-primary text-primary-foreground shadow-sm" : "border-border bg-muted/60 text-muted-foreground hover:text-foreground"),
						children: "Overview"
					}),
					tabs.map((tab) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: cn("inline-flex items-center rounded-full border text-xs font-medium transition-colors", activeTab === tab.id ? "border-primary bg-primary text-primary-foreground shadow-sm" : "border-border bg-muted/60 text-muted-foreground hover:text-foreground"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => {
								setActiveTab(tab.id);
								setEditingLayout(false);
							},
							className: "px-3.5 py-1.5",
							children: tab.label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-label": `Delete tab ${tab.label}`,
							onClick: () => {
								removeTab(tab.id);
								if (activeTab === tab.id) setActiveTab("overview");
							},
							className: cn("mr-1.5 rounded-full p-1 transition-colors", activeTab === tab.id ? "hover:bg-black/15" : "hover:bg-destructive/15 hover:text-destructive"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3 w-3" })
						})]
					}, tab.id)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setNewTabOpen(true),
						className: "inline-flex items-center gap-1 rounded-full border border-dashed border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" }), "New tab"]
					})
				]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditableBentoGrid, {
			pageKey,
			widgets: currentWidgets,
			editing: editingLayout,
			onDoneEditing: () => setEditingLayout(false)
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoryInspectorDrawer, {
			db,
			account: "Personal",
			category: inspectedCategory,
			month: thisMonth,
			onClose: () => setInspectedCategory(null)
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlideDrawer, {
			open: newTabOpen,
			onClose: () => setNewTabOpen(false),
			title: "Add dashboard tab",
			subtitle: "Custom workspace",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "space-y-4",
				onSubmit: (e) => {
					e.preventDefault();
					const created = addTab(newTabName, newTabWidgets);
					setActiveTab(created.id);
					setNewTabName("");
					setNewTabOpen(false);
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "label-mono mb-1.5 block",
						children: "Tab name"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "field",
						placeholder: "e.g. Daily Personal & Goals",
						value: newTabName,
						onChange: (e) => setNewTabName(e.target.value),
						required: true
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "label-mono mb-2",
						children: [
							"Choose system widgets (",
							newTabWidgets.length,
							" selected)"
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-2",
						children: SYSTEM_WIDGET_CATALOG.map((w) => {
							const picked = newTabWidgets.includes(w.id);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => toggleNewTabWidget(w.id),
								className: cn("flex w-full items-start justify-between gap-3 rounded-2xl border p-3 text-left transition-colors", picked ? "border-primary bg-primary/12" : "border-border/70 bg-muted/25 hover:border-primary/40"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-medium",
										children: w.label
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-0.5 text-xs text-muted-foreground",
										children: w.desc
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: cn("mt-0.5 shrink-0 rounded-full border px-2 py-0.5 font-mono text-[0.65rem]", picked ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground"),
									children: picked ? "Added" : "Add"
								})]
							}, w.id);
						})
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-end gap-2 border-t border-border/70 pt-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
							type: "button",
							onClick: () => setNewTabOpen(false),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
							type: "submit",
							variant: "gold",
							children: "Create tab"
						})]
					})
				]
			})
		})
	] });
}
//#endregion
export { Overview as component };
