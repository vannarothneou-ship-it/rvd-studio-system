import { i as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { C as expenseTotal, E as goalAccount, F as personalCategoryTotals, G as shortDate, I as personalSeries, J as uid, K as toUSD, O as invoiceView, S as expenseCategoriesFor, W as setDB, X as useDB, _ as compactMoney, a as EXPENSE_CATEGORIES, f as cashFlowSeries, g as cn, h as categoryTotals, j as money, k as isInvoice, p as cashReceived, q as today, s as PERSONAL_CATEGORIES, x as expenseAccount } from "./utils-cyeqUyd1.mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { C as Plus, T as PiggyBank, b as Search, g as Sparkles, mt as ArrowDownLeft } from "../_libs/lucide-react.mjs";
import { i as Glass, n as Empty, o as PageHeader, t as Btn, u as Stat } from "./ui-D6kovTfR.mjs";
import { r as upsert, t as EditModal } from "./Crud-DU9TmcJj.mjs";
import { n as EditableBentoGrid, t as EditLayoutButton } from "./BentoGrid-CunpmRkD.mjs";
import { a as expenseItemIcon, i as GoalRingCard, n as BudgetShelf, r as CategoryInspectorDrawer, t as AnimatedNumber } from "./FinanceVisuals-v4-NvIag.mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as CartesianGrid, i as Area, n as YAxis, o as ResponsiveContainer, r as XAxis, s as Tooltip, t as AreaChart } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/finance-CJLo6KTg.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STUDIO_RANGES = [
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
function Page() {
	const db = useDB((d) => d);
	const r = db.settings.khrRate;
	const [tab, setTab] = (0, import_react.useState)("Studio");
	const [studioRange, setStudioRange] = (0, import_react.useState)("all");
	const [personalRange, setPersonalRange] = (0, import_react.useState)("1m");
	const [month, setMonth] = (0, import_react.useState)(() => today().slice(0, 7));
	const [catFilter, setCatFilter] = (0, import_react.useState)("All");
	const [query, setQuery] = (0, import_react.useState)("");
	const [visibleCount, setVisibleCount] = (0, import_react.useState)(40);
	const [editingLayout, setEditingLayout] = (0, import_react.useState)(false);
	const [inspector, setInspector] = (0, import_react.useState)(null);
	const [edit, setEdit] = (0, import_react.useState)(null);
	const [goal, setGoal] = (0, import_react.useState)(null);
	const year = month.slice(0, 4) || today().slice(0, 4);
	const monthLabel = (/* @__PURE__ */ new Date(month + "-01T00:00:00Z")).toLocaleDateString("en-US", {
		month: "long",
		year: "numeric",
		timeZone: "UTC"
	});
	const pts = cashFlowSeries(db, studioRange);
	const pPts = personalSeries(db, personalRange, month);
	const pAgg = personalCategoryTotals(db, personalRange, month);
	const studioRangeMeta = STUDIO_RANGES.find((o) => o.id === studioRange) ?? STUDIO_RANGES[2];
	const personalRangeMeta = PERSONAL_RANGES.find((o) => o.id === personalRange) ?? PERSONAL_RANGES[0];
	const studioInRange = pts.reduce((a, x) => a + x.inn, 0);
	const studioOutRange = pts.reduce((a, x) => a + x.out, 0);
	const personalOutCashRange = pts.reduce((a, x) => a + x.personalOut, 0);
	const studioNetRange = studioInRange - studioOutRange;
	const combinedOutRange = studioOutRange + personalOutCashRange;
	const combinedNetRange = studioInRange - combinedOutRange;
	const personalTotalSelectedRange = pPts.reduce((a, x) => a + x.personalOut, 0);
	const personalAvgMonth = personalTotalSelectedRange / pAgg.monthsCount;
	let runStudio = 0;
	let runCombined = 0;
	const studioChartData = pts.map((x) => {
		runStudio += x.net;
		runCombined += x.combinedNet;
		const totalOut = x.out + x.personalOut;
		return {
			...x,
			totalOut,
			sparkValue: tab === "Combined" ? runCombined : runStudio
		};
	});
	const personalChartData = pPts.map((x) => ({
		label: x.label,
		personalOut: x.personalOut,
		studioOut: x.studioOut,
		sparkValue: x.personalOut
	}));
	const studioInYear = cashReceived(db, year);
	const studioOutYear = expenseTotal(db, "Studio", year);
	const personalOutMonth = expenseTotal(db, "Personal", month);
	const unpaidInvoicesUSD = db.invoices.filter(isInvoice).map((i) => invoiceView(i, db)).filter((v) => v.status !== "Draft").reduce((a, v) => a + v.balanceUSD, 0);
	const studioCatsMonth = categoryTotals(db, "Studio", month);
	const studioCatsAll = categoryTotals(db, "Studio", "");
	const studioCats = studioCatsMonth.length > 0 ? studioCatsMonth : studioCatsAll;
	const studioShelfScopeLabel = studioCatsMonth.length > 0 ? monthLabel : "all time";
	const personalCats = pAgg.items;
	const studioGoals = db.goals.filter((g) => goalAccount(g) === "Studio");
	const personalGoals = db.goals.filter((g) => goalAccount(g) === "Personal");
	const personalSavedTotal = personalGoals.reduce((sum, g) => sum + g.current, 0);
	const personalTargetTotal = personalGoals.reduce((sum, g) => sum + g.target, 0);
	const goalNow = (g) => {
		if (g.kind === "cash") return cashReceived(db, year);
		if (g.kind === "clients") return db.clients.filter((c) => c.status !== "Lead").length;
		return g.current;
	};
	const switchTab = (next) => {
		setTab(next);
		setCatFilter("All");
		setVisibleCount(40);
		setInspector(null);
	};
	const openNewExpense = (account, category) => {
		const cats = expenseCategoriesFor(account);
		setEdit({
			id: uid(),
			date: today().startsWith(month) ? today() : `${month}-01`,
			projectId: "",
			category: category && cats.includes(category) ? category : cats[0] ?? "Other",
			vendor: account === "Personal" ? "Debit" : "",
			description: "",
			amount: 0,
			currency: "USD",
			receipt: "",
			account
		});
	};
	const openNewGoal = (account) => {
		setGoal({
			id: uid(),
			name: "",
			kind: "manual",
			target: account === "Personal" ? 2e3 : 1e3,
			current: 0,
			account
		});
	};
	const expenseFields = (v) => {
		const acc = expenseAccount(v);
		return [
			{
				k: "account",
				label: "Account",
				type: "select",
				options: [{
					value: "Studio",
					label: "RothVan Design (Studio)"
				}, {
					value: "Personal",
					label: "Personal"
				}]
			},
			{
				k: "date",
				label: "Date",
				type: "date"
			},
			{
				k: "description",
				label: "Description",
				wide: true
			},
			{
				k: "category",
				label: "Category",
				type: "select",
				options: expenseCategoriesFor(acc)
			},
			{
				k: "vendor",
				label: acc === "Personal" ? "Card / Payment method" : "Vendor / Merchant"
			},
			...acc === "Studio" ? [{
				k: "projectId",
				label: "Project (optional)",
				type: "select",
				options: db.projects.map((p) => ({
					value: p.id,
					label: `${p.code} · ${p.name}`
				}))
			}] : [],
			{
				k: "amount",
				label: "Amount",
				type: "number"
			},
			{
				k: "currency",
				label: "Currency",
				type: "select",
				options: ["USD", "KHR"]
			}
		];
	};
	const goalFields = (v) => {
		return [
			{
				k: "account",
				label: "Account",
				type: "select",
				options: [{
					value: "Studio",
					label: "RothVan Design (Studio)"
				}, {
					value: "Personal",
					label: "Personal"
				}]
			},
			{
				k: "kind",
				label: "Tracks",
				type: "select",
				options: goalAccount(v) === "Personal" ? [{
					value: "manual",
					label: "Manual saving goal"
				}] : [
					{
						value: "cash",
						label: "Studio cash received (auto)"
					},
					{
						value: "clients",
						label: "Clients won (auto)"
					},
					{
						value: "manual",
						label: "Manual fund"
					}
				]
			},
			{
				k: "name",
				label: "Goal name",
				wide: true
			},
			{
				k: "target",
				label: "Target (USD)",
				type: "number"
			},
			{
				k: "current",
				label: "Current saved (manual)",
				type: "number"
			}
		];
	};
	const q = query.trim().toLowerCase();
	const filteredExpenses = [...db.expenses].filter((e) => {
		const acc = expenseAccount(e);
		if (tab === "Studio" && acc !== "Studio") return false;
		if (tab === "Personal" && acc !== "Personal") return false;
		if (tab === "Personal" && !q && !pAgg.monthSet.has(e.date.slice(0, 7))) return false;
		if (catFilter !== "All" && e.category !== catFilter) return false;
		if (q) {
			if (!`${e.description} ${e.vendor} ${e.category}`.toLowerCase().includes(q)) return false;
		}
		return true;
	}).sort((a, b) => b.date.localeCompare(a.date));
	const visibleExpenses = filteredExpenses.slice(0, visibleCount);
	const recentPayments = [...db.payments].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10);
	const leftHeadline = tab === "Personal" ? personalTotalSelectedRange : tab === "Combined" ? combinedNetRange : studioNetRange;
	const activeGoals = tab === "Personal" ? personalGoals : tab === "Studio" ? studioGoals : db.goals;
	const activeCategoriesForFilter = tab === "Personal" ? PERSONAL_CATEGORIES : tab === "Studio" ? EXPENSE_CATEGORIES : Array.from(/* @__PURE__ */ new Set([...PERSONAL_CATEGORIES, ...EXPENSE_CATEGORIES]));
	const activeChart = tab === "Personal" ? personalChartData : studioChartData;
	const widgets = (0, import_react.useMemo)(() => {
		const list = [
			{
				id: "headline",
				title: tab === "Personal" ? "Personal summary" : tab === "Combined" ? "Combined net retained" : "Studio net profit",
				defaultSpan: 5,
				render: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Glass, {
					className: "flex h-full flex-col justify-between",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: tab === "Personal" ? `Personal total spend, ${personalRange === "1m" ? monthLabel : personalRangeMeta.desc}` : tab === "Combined" ? `Combined net retained, ${studioRangeMeta.desc}` : `Studio net cash profit, ${studioRangeMeta.desc}`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: cn("mt-2 font-display text-4xl font-black tabular-nums", tab !== "Personal" && leftHeadline < 0 && "text-destructive"),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatedNumber, { value: leftHeadline }, tab)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-muted-foreground",
								children: tab === "Personal" ? "Personal monthly living & household ledger" : tab === "Combined" ? "Studio cash received minus Studio & Personal expenses" : "Studio cash received minus RothVan Design expenses"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "my-4 h-24 w-full shrink-0",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
									width: "100%",
									height: 96,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
										data: activeChart,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
											id: "fin-sp",
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
											dataKey: "sparkValue",
											stroke: "var(--primary)",
											strokeWidth: 2,
											fill: "url(#fin-sp)",
											type: "monotone",
											animationDuration: 750,
											animationEasing: "ease-out"
										})]
									})
								})
							})
						] }),
						tab === "Studio" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-3 gap-3 border-t border-border pt-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/invoices",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
										label: "Open A/R",
										value: compactMoney(unpaidInvoicesUSD),
										fullValue: money(unpaidInvoicesUSD)
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: `Cash in (${year})`,
									value: compactMoney(studioInYear),
									fullValue: money(studioInYear)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: `Expenses (${year})`,
									value: compactMoney(studioOutYear),
									fullValue: money(studioOutYear)
								})
							]
						}),
						tab === "Personal" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-3 gap-3 border-t border-border pt-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: "This month",
									value: compactMoney(personalOutMonth),
									fullValue: money(personalOutMonth),
									tone: "neg"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: "Avg / month",
									value: compactMoney(personalAvgMonth),
									fullValue: money(personalAvgMonth)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: "Saved goals",
									tone: "pos",
									value: `${compactMoney(personalSavedTotal)} / ${compactMoney(personalTargetTotal)}`,
									fullValue: `${money(personalSavedTotal)} / ${money(personalTargetTotal)}`
								})
							]
						}),
						tab === "Combined" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-3 gap-3 border-t border-border pt-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: "Studio in",
									value: compactMoney(studioInRange),
									fullValue: money(studioInRange),
									tone: "pos"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: "Studio out",
									value: compactMoney(studioOutRange),
									fullValue: money(studioOutRange)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: "Personal out",
									value: compactMoney(personalOutCashRange),
									fullValue: money(personalOutCashRange),
									tone: "neg"
								})
							]
						})
					]
				})
			},
			{
				id: "trendChart",
				title: tab === "Personal" ? "Personal spending trend" : tab === "Combined" ? "Combined cash flow" : "Studio cash flow",
				defaultSpan: 7,
				render: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Glass, {
					delay: 80,
					className: "h-full",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-4 flex flex-wrap items-center justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-medium",
								children: tab === "Personal" ? "Personal spending trend" : tab === "Combined" ? "Combined cash flow" : "Studio cash flow"
							}), tab === "Personal" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex rounded-full border border-border bg-muted p-1 text-xs",
								children: PERSONAL_RANGES.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setPersonalRange(o.id),
									className: cn("rounded-full px-3 py-1 transition-colors", personalRange === o.id ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"),
									children: o.label
								}, o.id))
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex rounded-full border border-border bg-muted p-1 text-xs",
								children: STUDIO_RANGES.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setStudioRange(o.id),
									className: cn("rounded-full px-3 py-1 transition-colors", studioRange === o.id ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"),
									children: o.label
								}, o.id))
							})]
						}),
						tab === "Studio" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-3 grid grid-cols-3 gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: "● Cash in",
									value: compactMoney(studioInRange),
									fullValue: money(studioInRange)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: "○ Studio out",
									value: compactMoney(studioOutRange),
									fullValue: money(studioOutRange)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: "Net",
									value: compactMoney(studioNetRange, "USD", true),
									fullValue: money(studioNetRange, "USD", true),
									tone: studioNetRange >= 0 ? "pos" : "neg"
								})
							]
						}),
						tab === "Personal" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-3 grid grid-cols-3 gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: "● Personal out",
									value: compactMoney(personalTotalSelectedRange),
									fullValue: money(personalTotalSelectedRange)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: "○ Monthly avg",
									value: compactMoney(personalAvgMonth),
									fullValue: money(personalAvgMonth)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: monthLabel,
									value: compactMoney(personalOutMonth),
									fullValue: money(personalOutMonth),
									tone: personalOutMonth > personalAvgMonth ? "neg" : void 0
								})
							]
						}),
						tab === "Combined" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-3 grid grid-cols-3 gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: "● Studio in",
									value: compactMoney(studioInRange),
									fullValue: money(studioInRange)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: "○ Total out",
									value: compactMoney(combinedOutRange),
									fullValue: money(combinedOutRange)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: "Retained",
									value: compactMoney(combinedNetRange, "USD", true),
									fullValue: money(combinedNetRange, "USD", true),
									tone: combinedNetRange >= 0 ? "pos" : "neg"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-56 w-full shrink-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
								width: "100%",
								height: 224,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
									data: activeChart,
									margin: {
										left: -18,
										right: 4,
										top: 8
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
											id: "fin-cf",
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
											tickLine: false,
											interval: tab === "Personal" && personalRange === "1m" ? 3 : 0
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
										tab === "Personal" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
											name: "Personal spend",
											dataKey: "personalOut",
											type: "monotone",
											stroke: "var(--primary)",
											strokeWidth: 2,
											fill: "url(#fin-cf)",
											animationDuration: 750,
											animationEasing: "ease-out"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
											name: "Studio expenses",
											dataKey: "studioOut",
											type: "monotone",
											stroke: "var(--muted-foreground)",
											strokeDasharray: "5 5",
											fill: "transparent",
											animationDuration: 750,
											animationEasing: "ease-out"
										})] }) : tab === "Combined" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
											name: "Studio cash in",
											dataKey: "inn",
											type: "monotone",
											stroke: "var(--primary)",
											strokeWidth: 2,
											fill: "url(#fin-cf)",
											animationDuration: 750,
											animationEasing: "ease-out"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
											name: "All expenses (Studio + Personal)",
											dataKey: "totalOut",
											type: "monotone",
											stroke: "var(--muted-foreground)",
											strokeDasharray: "5 5",
											fill: "transparent",
											animationDuration: 750,
											animationEasing: "ease-out"
										})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
											name: "Cash in",
											dataKey: "inn",
											type: "monotone",
											stroke: "var(--primary)",
											strokeWidth: 2,
											fill: "url(#fin-cf)",
											animationDuration: 750,
											animationEasing: "ease-out"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
											name: "Studio expenses",
											dataKey: "out",
											type: "monotone",
											stroke: "var(--muted-foreground)",
											strokeDasharray: "5 5",
											fill: "transparent",
											animationDuration: 750,
											animationEasing: "ease-out"
										})] })
									]
								})
							})
						})
					]
				})
			},
			{
				id: "jarsShelf",
				title: "Category budget jars",
				defaultSpan: 12,
				render: () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: tab === "Personal" ? personalCats.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Glass, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Empty, { children: [
					"No personal expenses recorded in ",
					pAgg.scopeLabel,
					"."
				] }) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BudgetShelf, {
					db,
					account: "Personal",
					month,
					monthLabel: pAgg.scopeLabel,
					items: personalCats,
					limitScale: pAgg.monthsCount,
					selectedCategory: inspector?.account === "Personal" ? inspector.category : null,
					onSelectCategory: (category) => setInspector({
						account: "Personal",
						category
					})
				}) : tab === "Studio" ? studioCats.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Glass, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { children: "No studio expenses recorded yet." }) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BudgetShelf, {
					db,
					account: "Studio",
					month,
					monthLabel: studioShelfScopeLabel,
					items: studioCats,
					selectedCategory: inspector?.account === "Studio" ? inspector.category : null,
					onSelectCategory: (category) => setInspector({
						account: "Studio",
						category
					})
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [personalCats.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BudgetShelf, {
						db,
						account: "Personal",
						month,
						monthLabel: pAgg.scopeLabel,
						items: personalCats,
						limitScale: pAgg.monthsCount,
						selectedCategory: inspector?.account === "Personal" ? inspector.category : null,
						onSelectCategory: (category) => setInspector({
							account: "Personal",
							category
						})
					}), studioCats.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BudgetShelf, {
						db,
						account: "Studio",
						month,
						monthLabel: studioShelfScopeLabel,
						items: studioCats,
						selectedCategory: inspector?.account === "Studio" ? inspector.category : null,
						onSelectCategory: (category) => setInspector({
							account: "Studio",
							category
						})
					})]
				}) })
			},
			{
				id: "goalsGrid",
				title: "Saving & studio goals",
				defaultSpan: 12,
				render: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Glass, {
					delay: 180,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-4 flex flex-wrap items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [tab === "Personal" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PiggyBank, { className: "h-4 w-4 text-primary" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-4 w-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "label-mono",
								children: tab === "Personal" ? "Personal saving goals" : tab === "Studio" ? "RothVan Studio goals" : "All studio & personal goals"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Btn, {
							onClick: () => openNewGoal(tab === "Personal" ? "Personal" : "Studio"),
							className: "px-3 py-1 text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3 w-3" }), "Add goal"]
						})]
					}), activeGoals.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { children: "No saving goals yet." }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4",
						children: activeGoals.map((g, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoalRingCard, {
							goal: g,
							current: goalNow(g),
							accountLabel: tab === "Combined" ? goalAccount(g) : void 0,
							delay: idx * 60,
							onEdit: () => setGoal(g),
							onQuickAdd: g.kind === "manual" ? (amt) => setDB((d) => ({
								...d,
								goals: d.goals.map((x) => x.id === g.id ? {
									...x,
									current: x.current + amt
								} : x)
							})) : void 0
						}, g.id))
					})]
				})
			}
		];
		if (tab !== "Personal") list.push({
			id: "studioIncome",
			title: "Recent studio income",
			defaultSpan: 12,
			render: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Glass, {
				delay: 240,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3 flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "label-mono",
						children: [
							"Recent Studio Income (",
							db.payments.length,
							" recorded payments)"
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/invoices",
						className: "text-xs text-primary hover:underline",
						children: "Invoices →"
					})]
				}), recentPayments.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { children: "No invoice payments recorded yet." }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "divide-y divide-border",
					children: recentPayments.map((p) => {
						const inv = db.invoices.find((i) => i.id === p.invoiceId);
						const client = db.clients.find((c) => c.id === inv?.clientId);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/invoices/$id",
							params: { id: p.invoiceId },
							className: "flex items-center justify-between gap-3 rounded-xl px-2 py-2.5 hover:bg-muted",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex min-w-0 items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-border bg-muted text-positive",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDownLeft, { className: "h-4 w-4" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "truncate text-sm font-medium",
										children: [
											client?.name ?? "Client",
											" ·",
											" ",
											inv?.no ?? "Invoice"
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "truncate text-xs text-muted-foreground",
										children: [
											shortDate(p.date),
											" · ",
											p.method,
											p.reference ? ` · ${p.reference}` : ""
										]
									})]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "shrink-0 font-mono text-sm tabular-nums text-positive",
								children: ["+", money(toUSD(p.amount, p.currency, r))]
							})]
						}) }, p.id);
					})
				})]
			})
		});
		list.push({
			id: "expensesLedger",
			title: "Expenses ledger",
			defaultSpan: 12,
			render: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Glass, {
				delay: 280,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-3 flex flex-wrap items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "label-mono",
							children: [tab === "Personal" ? q ? `Personal expenses · all dates matching "${query}"` : `Personal expenses · ${pAgg.scopeLabel}` : tab === "Studio" ? "RothVan Design expenses" : "All studio & personal expenses", catFilter !== "All" ? ` · ${catFilter}` : ""]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-0.5 text-xs text-muted-foreground",
							children: [
								filteredExpenses.length,
								" ",
								filteredExpenses.length === 1 ? "entry" : "entries"
							]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "search",
									value: query,
									onChange: (e) => {
										setQuery(e.target.value);
										setVisibleCount(40);
									},
									placeholder: "Search item or card...",
									className: "field w-44 py-1.5 pl-8 text-xs sm:w-56"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Btn, {
								onClick: () => openNewExpense(tab === "Personal" ? "Personal" : "Studio"),
								className: "px-3 py-1.5 text-xs",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3 w-3" }),
									"Add ",
									tab === "Personal" ? "personal" : "studio"
								]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-3 flex flex-wrap gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setCatFilter("All"),
							className: cn("rounded-full border px-2.5 py-1 text-[0.7rem] transition-colors", catFilter === "All" ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground"),
							children: "All"
						}), activeCategoriesForFilter.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setCatFilter(catFilter === c ? "All" : c),
							className: cn("rounded-full border px-2.5 py-1 text-[0.7rem] transition-colors", catFilter === c ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground"),
							children: c
						}, c))]
					}),
					visibleExpenses.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { children: "No expenses match this filter." }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "divide-y divide-border",
							children: visibleExpenses.map((e) => {
								const acc = expenseAccount(e);
								const proj = e.projectId ? db.projects.find((p) => p.id === e.projectId) : void 0;
								const ItemIcon = expenseItemIcon(e);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: () => setEdit(e),
									className: "grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl px-2 py-3 text-left transition-colors hover:bg-muted",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex min-w-0 items-center gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-border bg-muted text-primary",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemIcon, { className: "h-4 w-4" })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "min-w-0",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "truncate text-sm font-medium",
												children: e.description || e.vendor || "Expense"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "truncate text-xs text-muted-foreground",
												children: [
													shortDate(e.date),
													" · ",
													e.category,
													e.vendor ? ` · ${e.vendor}` : "",
													proj ? ` · ${proj.code}` : "",
													tab === "Combined" ? ` · ${acc}` : ""
												]
											})]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-mono text-sm tabular-nums text-destructive",
										children: money(-e.amount, e.currency)
									})]
								}) }, e.id);
							})
						}),
						filteredExpenses.length > visibleExpenses.length && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex justify-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Btn, {
								onClick: () => setVisibleCount((n) => n + 60),
								className: "px-4 py-1.5 text-xs",
								children: [
									"Show more (",
									filteredExpenses.length - visibleExpenses.length,
									" ",
									"remaining)"
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Btn, {
								onClick: () => setVisibleCount(filteredExpenses.length),
								className: "px-4 py-1.5 text-xs",
								children: [
									"Show all (",
									filteredExpenses.length,
									")"
								]
							})]
						}),
						visibleCount > 40 && filteredExpenses.length > 40 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-2 flex justify-center",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
								onClick: () => setVisibleCount(40),
								className: "px-4 py-1.5 text-xs",
								children: "Hide extra rows"
							})
						})
					] })
				]
			})
		});
		return list;
	}, [
		tab,
		personalRange,
		personalRangeMeta,
		studioRange,
		studioRangeMeta,
		monthLabel,
		leftHeadline,
		activeChart,
		unpaidInvoicesUSD,
		year,
		studioInYear,
		studioOutYear,
		personalOutMonth,
		personalAvgMonth,
		personalSavedTotal,
		personalTargetTotal,
		studioInRange,
		studioOutRange,
		personalOutCashRange,
		studioNetRange,
		personalTotalSelectedRange,
		combinedOutRange,
		combinedNetRange,
		personalCats,
		studioCats,
		studioShelfScopeLabel,
		pAgg,
		db,
		month,
		inspector,
		activeGoals,
		recentPayments,
		r,
		q,
		query,
		catFilter,
		filteredExpenses,
		activeCategoriesForFilter,
		visibleExpenses,
		visibleCount
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Finance",
			owner: db.settings.ownerName,
			action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditLayoutButton, {
					editing: editingLayout,
					onToggle: () => setEditingLayout((e) => !e)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Btn, {
					variant: "gold",
					onClick: () => openNewExpense(tab === "Personal" ? "Personal" : "Studio"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }),
						"Add ",
						tab === "Personal" ? "personal" : "studio",
						" expense"
					]
				})]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-4 flex flex-wrap items-center justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "inline-flex rounded-full border border-border bg-muted p-1 text-xs",
				children: [
					{
						id: "Studio",
						label: "RothVan Design"
					},
					{
						id: "Personal",
						label: "Personal"
					},
					{
						id: "Combined",
						label: "Combined"
					}
				].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => switchTab(t.id),
					className: cn("rounded-full px-3.5 py-1.5 font-medium transition-all duration-200", tab === t.id ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"),
					children: t.label
				}, t.id))
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "label-mono",
					children: "Month"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "month",
					className: "field w-auto py-1.5 text-xs",
					value: month,
					onChange: (e) => {
						setMonth(e.target.value || today().slice(0, 7));
						setVisibleCount(40);
					}
				})]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditableBentoGrid, {
			pageKey: `finance:${tab}`,
			widgets,
			editing: editingLayout,
			onDoneEditing: () => setEditingLayout(false)
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoryInspectorDrawer, {
			db,
			account: inspector?.account ?? "Personal",
			category: inspector?.category ?? null,
			month,
			onClose: () => setInspector(null),
			onAddExpense: (acc, cat) => openNewExpense(acc, cat),
			onEditExpense: (exp) => setEdit(exp)
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditModal, {
			presentation: "drawer",
			side: "right",
			item: edit,
			fields: expenseFields,
			subtitle: edit && expenseAccount(edit) === "Personal" ? "Personal Ledger" : "Studio Ledger",
			title: edit && expenseAccount(edit) === "Personal" ? "Personal Expense" : "Studio Expense",
			onClose: () => setEdit(null),
			onFieldChange: (next, key) => {
				if (key === "account") {
					const acc = expenseAccount(next);
					const cats = expenseCategoriesFor(acc);
					return {
						...next,
						category: cats.includes(next.category) ? next.category : cats[0] ?? "Other",
						projectId: acc === "Personal" ? "" : next.projectId
					};
				}
				return next;
			},
			onSave: (v) => setDB((d) => ({
				...d,
				expenses: upsert(d.expenses, {
					...v,
					account: expenseAccount(v)
				})
			})),
			onDelete: db.expenses.some((x) => x.id === edit?.id) ? (v) => setDB((d) => ({
				...d,
				expenses: d.expenses.filter((x) => x.id !== v.id)
			})) : void 0
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditModal, {
			presentation: "drawer",
			side: "right",
			item: goal,
			fields: goalFields,
			subtitle: goal ? `${goalAccount(goal)} Goal` : "Goal",
			title: "Saving / Studio Goal",
			onClose: () => setGoal(null),
			onFieldChange: (next, key) => {
				if (key === "account" && goalAccount(next) === "Personal" && next.kind !== "manual") return {
					...next,
					kind: "manual"
				};
				return next;
			},
			onSave: (v) => setDB((d) => ({
				...d,
				goals: upsert(d.goals, {
					...v,
					account: goalAccount(v)
				})
			})),
			onDelete: db.goals.some((x) => x.id === goal?.id) ? (v) => setDB((d) => ({
				...d,
				goals: d.goals.filter((x) => x.id !== v.id)
			})) : void 0
		})
	] });
}
//#endregion
export { Page as component };
