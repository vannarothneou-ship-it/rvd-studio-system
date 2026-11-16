import { C as expenseTotal, E as goalAccount, G as today, H as setDB, J as useDB, M as needsFollowUp, O as invoiceView, Q as require_react, U as shortDate, W as toUSD, X as require_jsx_runtime, Y as createLucideIcon, _ as categoryTotals, b as documentKind, f as PROJECT_STATUSES, j as money, k as isInvoice, m as cashFlowSeries, t as cn, tt as __toESM, x as expenseAccount } from "./utils-BZY5Yoq-.js";
import { t as Link } from "./link-DZ57WSCl.js";
import { a as expenseItemIcon, c as XAxis, d as ResponsiveContainer, f as Tooltip, i as GoalRingCard, l as Area, m as ArrowDownLeft, n as BudgetShelf, o as AreaChart, p as PiggyBank, r as CategoryInspectorDrawer, s as YAxis, t as AnimatedNumber, u as CartesianGrid } from "./FinanceVisuals-BNstvxYK.js";
import { i as Glass, l as Stat, o as PageHeader, t as Btn } from "./ui-27Vr4ohO.js";
import { t as Plus } from "./plus-71dfpvL5.js";
import { a as FileText } from "./index-CVVIdTJr.js";
/**
* @license lucide-react v0.575.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var ArrowUpRight = createLucideIcon("arrow-up-right", [["path", {
	d: "M7 7h10v10",
	key: "1tivn9"
}], ["path", {
	d: "M7 17 17 7",
	key: "1vkiza"
}]]);
//#endregion
//#region src/routes/index.tsx?tsr-split=component
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
function Overview() {
	const db = useDB((d) => d);
	const [range, setRange] = (0, import_react.useState)("all");
	const [inspectedCategory, setInspectedCategory] = (0, import_react.useState)(null);
	const s = cashFlowSeries(db, range);
	const rangeMeta = RANGE_OPTIONS.find((o) => o.id === range);
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
	const thisMonthLabel = (/* @__PURE__ */ new Date(thisMonth + "-01T00:00:00Z")).toLocaleDateString("en-US", {
		month: "long",
		year: "numeric",
		timeZone: "UTC"
	});
	const personalMonth = expenseTotal(db, "Personal", thisMonth);
	const personalCats = categoryTotals(db, "Personal", thisMonth);
	const personalItemsMonth = [...db.expenses].filter((e) => expenseAccount(e) === "Personal" && e.date.startsWith(thisMonth)).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);
	const s6 = cashFlowSeries(db, "6m");
	const personal6Avg = s6.reduce((a, x) => a + x.personalOut, 0) / (s6.length || 1);
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Overview",
			owner: db.settings.ownerName,
			action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/invoices/$id",
				params: { id: "new" },
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Btn, {
					variant: "gold",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), "New invoice"]
				})
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mb-6 border-y border-border py-4",
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
						className: "flex flex-wrap items-center justify-between gap-2 py-3 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							db.clients.find((c) => c.id === i.clientId)?.name,
							" · ",
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
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-4 lg:grid-cols-[minmax(0,5fr)_minmax(0,8fr)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Glass, {
				className: "flex flex-col",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted-foreground",
						children: ["Studio net cash profit, ", rangeMeta.desc]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: cn("mt-2 font-display text-4xl font-black", netRange < 0 && "text-destructive"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatedNumber, { value: netRange })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted-foreground",
						children: "Studio cash received minus RothVan Design expenses"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "my-4 h-24 flex-1",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
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
						}) })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-3 gap-3 border-t border-border pt-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/invoices",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: "Outstanding",
									value: money(outstanding)
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/invoices",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: "Overdue",
									value: money(overdue),
									tone: overdue > 0 ? "neg" : void 0
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/finance",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
									label: "Personal (mo)",
									value: money(personalMonth)
								})
							})
						]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Glass, {
				delay: 80,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-4 flex flex-wrap items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-medium",
							children: "Studio cash flow"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex rounded-full border border-border bg-muted p-1 text-xs",
							children: RANGE_OPTIONS.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
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
								value: money(cashIn)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "○ Studio out",
								value: money(cashOut)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "Net",
								value: money(cashIn - cashOut, "USD", true),
								tone: cashIn - cashOut >= 0 ? "pos" : "neg"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "h-56",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
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
									tickFormatter: (v) => `$${v}`
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
						}) })
					})
				]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid gap-4 lg:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Glass, {
				delay: 120,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-3 flex items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PiggyBank, { className: "h-4 w-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
								className: "font-medium",
								children: ["Personal expenses · ", thisMonthLabel]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/finance",
							className: "text-sm text-primary hover:underline",
							children: "Finance →"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-4 grid grid-cols-3 gap-3 border-b border-border pb-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "Spent (mo)",
								value: money(personalMonth),
								tone: "neg"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "6m avg / mo",
								value: money(personal6Avg)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "Categories",
								value: String(personalCats.length)
							})
						]
					}),
					personalCats.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "No personal expenses recorded this month."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BudgetShelf, {
						db,
						account: "Personal",
						month: thisMonth,
						monthLabel: thisMonthLabel,
						items: personalCats,
						selectedCategory: inspectedCategory,
						onSelectCategory: (cat) => setInspectedCategory(cat),
						compact: true
					}),
					personalItemsMonth.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-4 divide-y divide-border border-t border-border pt-2",
						children: personalItemsMonth.map((e) => {
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
									className: "shrink-0 font-mono text-destructive",
									children: money(-toUSD(e.amount, e.currency, r))
								})]
							}, e.id);
						})
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Glass, {
				delay: 160,
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
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Glass, {
			delay: 200,
			className: "mt-4",
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
						className: "flex items-center gap-3 py-3 rise",
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
								className: cn("shrink-0 font-mono text-sm", a.kind === "in" && "text-positive", a.kind === "out" && "text-destructive", a.kind === "inv" && "text-muted-foreground"),
								children: a.kind === "inv" ? money(a.amt) : money(a.amt, "USD", true)
							})
						]
					}, k);
				})
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoryInspectorDrawer, {
			db,
			account: "Personal",
			category: inspectedCategory,
			month: thisMonth,
			onClose: () => setInspectedCategory(null)
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Glass, {
			delay: 260,
			className: "mt-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-medium",
					children: "Project pipeline"
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
						className: "font-display text-3xl font-black",
						children: db.projects.filter((p) => p.status === st).length
					})]
				}, st)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/projects",
					className: "rounded-2xl border border-primary/50 bg-primary/15 p-4 text-primary transition-transform hover:-translate-y-0.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-[0.68rem] uppercase tracking-wider",
						children: "Ready to close"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-3xl font-black",
						children: readyToClose
					})]
				})]
			})]
		})
	] });
}
//#endregion
export { Overview as component };
