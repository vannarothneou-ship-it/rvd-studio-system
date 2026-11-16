import { B as toUSD, G as createLucideIcon, H as uid, J as require_react, K as require_jsx_runtime, R as setDB, V as today, W as useDB, Z as __toESM, b as expenseCategoriesFor, h as categoryTotals, k as money, l as PERSONAL_CATEGORIES, m as cashReceived, s as EXPENSE_CATEGORIES, t as cn, w as goalAccount, x as expenseTotal, y as expenseAccount, z as shortDate } from "./utils-Cz-OEK7u.js";
import { t as Link } from "./link-C-cvVHqO.js";
import { n as ArrowDownLeft, t as ArrowUpRight } from "./arrow-up-right-HzT7NfMs.js";
import { i as Glass, l as Stat, n as Empty, o as PageHeader, t as Btn } from "./ui-Cikv6Nuk.js";
import { t as Plus } from "./plus-CPmKyuxY.js";
import { r as upsert, t as EditModal } from "./Crud-Cf0OYseA.js";
/**
* @license lucide-react v0.575.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var PiggyBank = createLucideIcon("piggy-bank", [
	["path", {
		d: "M11 17h3v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-3a3.16 3.16 0 0 0 2-2h1a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1h-1a5 5 0 0 0-2-4V3a4 4 0 0 0-3.2 1.6l-.3.4H11a6 6 0 0 0-6 6v1a5 5 0 0 0 2 4v3a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1z",
		key: "1piglc"
	}],
	["path", {
		d: "M16 10h.01",
		key: "1m94wz"
	}],
	["path", {
		d: "M2 8v1a2 2 0 0 0 2 2h1",
		key: "1env43"
	}]
]);
/**
* @license lucide-react v0.575.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Sparkles = createLucideIcon("sparkles", [
	["path", {
		d: "M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z",
		key: "1s2grr"
	}],
	["path", {
		d: "M20 2v4",
		key: "1rf3ol"
	}],
	["path", {
		d: "M22 4h-4",
		key: "gwowj6"
	}],
	["circle", {
		cx: "4",
		cy: "20",
		r: "2",
		key: "6kqj1y"
	}]
]);
//#endregion
//#region src/routes/finance.tsx?tsr-split=component
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Page() {
	const db = useDB((d) => d);
	const r = db.settings.khrRate;
	const [tab, setTab] = (0, import_react.useState)("Studio");
	const [month, setMonth] = (0, import_react.useState)(() => today().slice(0, 7));
	const [catFilter, setCatFilter] = (0, import_react.useState)("All");
	const [edit, setEdit] = (0, import_react.useState)(null);
	const [goal, setGoal] = (0, import_react.useState)(null);
	const year = month.slice(0, 4) || today().slice(0, 4);
	const monthLabel = (/* @__PURE__ */ new Date(month + "-01T00:00:00")).toLocaleDateString("en-US", {
		month: "long",
		year: "numeric"
	});
	const months = Array.from({ length: 6 }, (_, i) => {
		const d = /* @__PURE__ */ new Date();
		d.setMonth(d.getMonth() - 5 + i, 1);
		return d.toISOString().slice(0, 7);
	});
	const studioInYear = cashReceived(db, year);
	const studioOutYear = expenseTotal(db, "Studio", year);
	const personalOutYear = expenseTotal(db, "Personal", year);
	const studioInMonth = cashReceived(db, month);
	const studioOutMonth = expenseTotal(db, "Studio", month);
	const personalOutMonth = expenseTotal(db, "Personal", month);
	const series = months.map((m) => ({
		m,
		i: cashReceived(db, m),
		sOut: expenseTotal(db, "Studio", m),
		pOut: expenseTotal(db, "Personal", m)
	}));
	const maxBar = Math.max(1, ...series.flatMap((s) => [
		s.i,
		s.sOut,
		s.pOut
	]));
	const studioCats = categoryTotals(db, "Studio", month);
	const personalCats = categoryTotals(db, "Personal", month);
	const studioGoals = db.goals.filter((g) => goalAccount(g) === "Studio");
	const personalGoals = db.goals.filter((g) => goalAccount(g) === "Personal");
	const personalSavedTotal = personalGoals.reduce((sum, g) => sum + g.current, 0);
	const personalTargetTotal = personalGoals.reduce((sum, g) => sum + g.target, 0);
	const goalNow = (g) => {
		if (g.kind === "cash") return cashReceived(db, year);
		if (g.kind === "clients") return db.clients.filter((c) => c.status !== "Lead").length;
		return g.current;
	};
	const openNewExpense = (account) => {
		setEdit({
			id: uid(),
			date: today(),
			projectId: "",
			category: account === "Personal" ? PERSONAL_CATEGORIES[0] : EXPENSE_CATEGORIES[0],
			vendor: "",
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
				label: "Vendor / Merchant"
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
	const filteredExpenses = [...db.expenses].filter((e) => {
		const acc = expenseAccount(e);
		if (tab === "Studio" && acc !== "Studio") return false;
		if (tab === "Personal" && acc !== "Personal") return false;
		if (tab === "Personal" && month && !e.date.startsWith(month)) return false;
		if (catFilter !== "All" && e.category !== catFilter) return false;
		return true;
	}).sort((a, b) => b.date.localeCompare(a.date));
	const recentPayments = [...db.payments].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Finance",
			owner: db.settings.ownerName,
			action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Btn, {
				variant: "gold",
				onClick: () => openNewExpense(tab === "Personal" ? "Personal" : "Studio"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }),
					"Add ",
					tab === "Personal" ? "personal" : "studio",
					" expense"
				]
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
					onClick: () => {
						setTab(t.id);
						setCatFilter("All");
					},
					className: cn("rounded-full px-3.5 py-1.5 font-medium transition-colors", tab === t.id ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"),
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
					onChange: (e) => setMonth(e.target.value || today().slice(0, 7))
				})]
			})]
		}),
		tab === "Studio" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-4 grid grid-cols-2 gap-4 sm:grid-cols-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Glass, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: `Studio Cash In (${year})`,
					tone: "pos",
					value: money(studioInYear)
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Glass, {
					delay: 60,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: `RothVan Expenses (${year})`,
						tone: "neg",
						value: money(studioOutYear)
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Glass, {
					delay: 120,
					className: "col-span-2 sm:col-span-1",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: `Studio Profit (${year})`,
						tone: studioInYear - studioOutYear >= 0 ? "pos" : "neg",
						value: money(studioInYear - studioOutYear)
					})
				})
			]
		}),
		tab === "Personal" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-4 grid grid-cols-2 gap-4 sm:grid-cols-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Glass, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: `Personal Spent (${monthLabel})`,
					tone: "neg",
					value: money(personalOutMonth)
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Glass, {
					delay: 60,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: `Personal Spent (${year})`,
						value: money(personalOutYear)
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Glass, {
					delay: 120,
					className: "col-span-2 sm:col-span-1",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Personal Saving Goals",
						tone: "pos",
						value: `${money(personalSavedTotal)} / ${money(personalTargetTotal)}`
					})
				})
			]
		}),
		tab === "Combined" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-4 grid grid-cols-2 gap-4 sm:grid-cols-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Glass, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: `Studio Income (${month})`,
					tone: "pos",
					value: money(studioInMonth)
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Glass, {
					delay: 60,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: `Studio Expenses (${month})`,
						value: money(studioOutMonth)
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Glass, {
					delay: 120,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: `Personal (${month})`,
						tone: "neg",
						value: money(personalOutMonth)
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Glass, {
					delay: 180,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Net Retained",
						tone: studioInMonth - studioOutMonth - personalOutMonth >= 0 ? "pos" : "neg",
						value: money(studioInMonth - studioOutMonth - personalOutMonth, "USD", true)
					})
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]",
			children: [tab === "Personal" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Glass, {
				delay: 180,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-4 flex flex-wrap items-center justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "label-mono",
						children: ["Personal monthly categories · ", monthLabel]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-0.5 text-xs text-muted-foreground",
						children: "Click a category to filter expenses below"
					})] }), catFilter !== "All" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setCatFilter("All"),
						className: "rounded-full border border-border px-3 py-1 text-xs hover:bg-accent",
						children: [
							"Clear filter (",
							catFilter,
							")"
						]
					})]
				}), personalCats.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Empty, { children: [
					"No personal expenses recorded in ",
					monthLabel,
					"."
				] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-3",
					children: personalCats.map((item) => {
						const pct = personalOutMonth > 0 ? Math.round(item.totalUSD / personalOutMonth * 100) : 0;
						const active = catFilter === item.category;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => setCatFilter(active ? "All" : item.category),
							className: cn("block w-full rounded-2xl border p-3 text-left transition-colors", active ? "border-primary bg-primary/10" : "border-border/70 bg-muted/40 hover:bg-muted"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-1.5 flex items-center justify-between gap-2 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-medium",
									children: [
										item.category,
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-xs text-muted-foreground",
											children: [
												"(",
												item.count,
												")"
											]
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-mono text-xs",
									children: [
										money(item.totalUSD),
										" · ",
										pct,
										"%"
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-2 overflow-hidden rounded-full bg-muted",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-full rounded-full bg-primary transition-all duration-700",
									style: { width: `${pct}%` }
								})
							})]
						}, item.category);
					})
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Glass, {
				delay: 180,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mb-4 flex flex-wrap items-center justify-between gap-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "label-mono",
							children: tab === "Studio" ? "Last 6 months · Studio Cash In vs RothVan Expenses" : "Last 6 months · Studio vs Personal"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex h-44 items-end gap-3",
						children: series.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-1 flex-col items-center gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex h-36 w-full items-end justify-center gap-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										title: `Studio In: ${money(s.i)}`,
										className: "w-1/3 rounded-t-md bg-primary transition-all duration-700",
										style: { height: `${s.i / maxBar * 100}%` }
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										title: `Studio Out: ${money(s.sOut)}`,
										className: "w-1/3 rounded-t-md bg-destructive/75 transition-all duration-700",
										style: { height: `${s.sOut / maxBar * 100}%` }
									}),
									tab === "Combined" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										title: `Personal Out: ${money(s.pOut)}`,
										className: "w-1/3 rounded-t-md bg-muted-foreground/65 transition-all duration-700",
										style: { height: `${s.pOut / maxBar * 100}%` }
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-[0.65rem] text-muted-foreground",
								children: (/* @__PURE__ */ new Date(s.m + "-01")).toLocaleDateString("en-US", { month: "short" })
							})]
						}, s.m))
					}),
					studioCats.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 border-t border-border pt-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "label-mono mb-2",
							children: [
								"Studio categories (",
								monthLabel,
								")"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-2",
							children: studioCats.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => setCatFilter(catFilter === c.category ? "All" : c.category),
								className: cn("rounded-full border px-3 py-1 text-xs", catFilter === c.category ? "border-primary bg-primary text-primary-foreground" : "border-border bg-muted/50 hover:bg-accent"),
								children: [
									c.category,
									" · ",
									money(c.totalUSD)
								]
							}, c.category))
						})]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Glass, {
				delay: 240,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3 flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [tab === "Personal" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PiggyBank, { className: "h-4 w-4 text-primary" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-4 w-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "label-mono",
							children: tab === "Personal" ? "Personal saving goals" : tab === "Studio" ? "RothVan Studio goals" : "All goals"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Btn, {
						onClick: () => openNewGoal(tab === "Personal" ? "Personal" : "Studio"),
						className: "px-3 py-1 text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3 w-3" }), "Add goal"]
					})]
				}), (tab === "Personal" ? personalGoals : tab === "Studio" ? studioGoals : db.goals).length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { children: "No saving goals yet." }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-4",
					children: (tab === "Personal" ? personalGoals : tab === "Studio" ? studioGoals : db.goals).map((g) => {
						const n = goalNow(g);
						const pct = Math.min(100, Math.round(n / (g.target || 1) * 100));
						const acc = goalAccount(g);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "rounded-2xl border border-border/70 bg-muted/30 p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => setGoal(g),
								className: "w-full text-left",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between gap-2 text-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "truncate font-medium",
										children: [g.name, tab === "Combined" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "ml-2 font-mono text-[0.65rem] text-muted-foreground",
											children: [
												"(",
												acc,
												")"
											]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono text-xs",
										children: g.kind === "clients" ? `${n} / ${g.target}` : `${money(n)} / ${money(g.target)}`
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-2 h-2 overflow-hidden rounded-full bg-muted",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "h-full rounded-full bg-primary transition-all duration-700",
										style: { width: `${pct}%` }
									})
								})]
							}), g.kind === "manual" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-2.5 flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-mono text-[0.68rem] text-muted-foreground",
									children: [pct, "% saved"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex gap-1.5",
									children: [50, 100].map((amt) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										onClick: () => setDB((d) => ({
											...d,
											goals: d.goals.map((x) => x.id === g.id ? {
												...x,
												current: x.current + amt
											} : x)
										})),
										className: "rounded-full border border-border px-2.5 py-0.5 text-[0.7rem] hover:border-primary hover:bg-accent",
										children: ["+$", amt]
									}, amt))
								})]
							})]
						}, g.id);
					})
				})]
			})]
		}),
		tab !== "Personal" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Glass, {
			delay: 270,
			className: "mt-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-3 flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "label-mono",
					children: "Recent Studio Income (auto-synced from invoice payments)"
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
										" · ",
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
							className: "shrink-0 font-mono text-sm text-positive",
							children: ["+", money(toUSD(p.amount, p.currency, r))]
						})]
					}) }, p.id);
				})
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Glass, {
			delay: 300,
			className: "mt-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-3 flex flex-wrap items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "label-mono",
					children: [tab === "Personal" ? `Personal expenses · ${monthLabel}` : tab === "Studio" ? "RothVan Design expenses" : "All studio & personal expenses", catFilter !== "All" ? ` · ${catFilter}` : ""]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Btn, {
					onClick: () => openNewExpense(tab === "Personal" ? "Personal" : "Studio"),
					className: "px-3 py-1 text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3 w-3" }),
						"Add ",
						tab === "Personal" ? "personal" : "studio"
					]
				})]
			}), filteredExpenses.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { children: "No expenses match this filter." }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "divide-y divide-border",
				children: filteredExpenses.map((e) => {
					const acc = expenseAccount(e);
					const proj = e.projectId ? db.projects.find((p) => p.id === e.projectId) : void 0;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setEdit(e),
						className: "grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl px-2 py-3 text-left hover:bg-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex min-w-0 items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-border bg-muted text-destructive",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "h-4 w-4" })
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
							className: "font-mono text-sm text-destructive",
							children: money(-e.amount, e.currency)
						})]
					}) }, e.id);
				})
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditModal, {
			item: edit,
			fields: expenseFields,
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
			item: goal,
			fields: goalFields,
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
