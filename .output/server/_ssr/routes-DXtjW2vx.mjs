import { i as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { B as today, C as goalAccount, E as isInvoice, L as setDB, O as money, R as shortDate, T as invoiceView, U as useDB, _ as documentKind, b as expenseTotal, k as needsFollowUp, m as cn, u as PROJECT_STATUSES, v as expenseAccount, z as toUSD } from "./utils-h_AG6A2X.mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { A as ArrowUpRight, M as ArrowDownLeft, b as FileText, d as Plus, o as Target } from "../_libs/lucide-react.mjs";
import { i as Glass, l as Stat, o as PageHeader, t as Btn } from "./ui-Bv-9ubk3.mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as CartesianGrid, i as Area, n as YAxis, o as ResponsiveContainer, r as XAxis, s as Tooltip, t as AreaChart } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DXtjW2vx.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function monthKey(d) {
	return d.slice(0, 7);
}
function lastMonths(n) {
	const out = [];
	const d = /* @__PURE__ */ new Date();
	d.setDate(1);
	for (let i = n - 1; i >= 0; i--) {
		const x = new Date(d);
		x.setMonth(d.getMonth() - i);
		out.push(x.toISOString().slice(0, 7));
	}
	return out;
}
function series(db, n) {
	const r = db.settings.khrRate;
	return lastMonths(n).map((m) => {
		const inn = db.payments.filter((p) => monthKey(p.date) === m).reduce((s, p) => s + toUSD(p.amount, p.currency, r), 0);
		const out = db.expenses.filter((e) => expenseAccount(e) === "Studio" && monthKey(e.date) === m).reduce((s, e) => s + toUSD(e.amount, e.currency, r), 0);
		return {
			m,
			label: (/* @__PURE__ */ new Date(m + "-01T00:00:00")).toLocaleDateString("en-US", { month: "short" }),
			inn,
			out,
			net: inn - out
		};
	});
}
function Overview() {
	const db = useDB((d) => d);
	const [range, setRange] = (0, import_react.useState)(12);
	const s12 = series(db, 12);
	const s = range === 6 ? s12.slice(6) : s12;
	const net12 = s12.reduce((a, x) => a + x.net, 0);
	let run = 0;
	const spark = s12.map((x) => ({ v: run += x.net }));
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
	const personalMonth = expenseTotal(db, "Personal", thisMonth);
	const activity = [
		...db.payments.map((p) => {
			const inv = db.invoices.find((i) => i.id === p.invoiceId);
			const c = db.clients.find((c) => c.id === inv?.clientId);
			return {
				date: p.date,
				title: `${c?.name ?? "Client"} · ${p.reference || "payment"}`,
				sub: `Income · ${p.method}`,
				amt: toUSD(p.amount, p.currency, r),
				kind: "in"
			};
		}),
		...db.expenses.map((e) => ({
			date: e.date,
			title: e.vendor || e.description,
			sub: `${expenseAccount(e)} · ${e.category}`,
			amt: -toUSD(e.amount, e.currency, r),
			kind: "out"
		})),
		...db.invoices.filter(isInvoice).map((i) => ({
			date: i.issue,
			title: `Invoice ${i.no}`,
			sub: `Issued · ${db.clients.find((c) => c.id === i.clientId)?.name ?? ""}`,
			amt: invoiceView(i, db).totalUSD,
			kind: "inv"
		}))
	].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7);
	const year = today().slice(0, 4);
	const goalValue = (g) => g.kind === "cash" ? db.payments.filter((p) => p.date.startsWith(year)).reduce((a, p) => a + toUSD(p.amount, p.currency, r), 0) : g.kind === "clients" ? new Set(db.invoices.filter((i) => isInvoice(i) && i.issue.startsWith(year)).map((i) => i.clientId)).size : g.current;
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
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Studio net cash profit, last 12 months"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: cn("mt-2 font-display text-4xl font-black", net12 < 0 && "text-destructive"),
						children: money(net12)
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
								type: "monotone"
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
						className: "mb-4 flex items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-medium",
							children: "Studio cash flow"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex rounded-full border border-border bg-muted p-1 text-xs",
							children: [6, 12].map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => setRange(n),
								className: cn("rounded-full px-3 py-1 transition-colors", range === n ? "bg-foreground text-background" : "text-muted-foreground"),
								children: [n, " months"]
							}, n))
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
									fill: "url(#cf)"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
									name: "Studio expenses",
									dataKey: "out",
									type: "monotone",
									stroke: "var(--muted-foreground)",
									strokeDasharray: "5 5",
									fill: "transparent"
								})
							]
						}) })
					})
				]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid gap-4 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Glass, {
				delay: 140,
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
					children: activity.map((a, k) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center gap-3 py-3 rise",
						style: { animationDelay: `${180 + k * 40}ms` },
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border bg-muted", a.kind === "in" && "text-positive"),
								children: a.kind === "in" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDownLeft, { className: "h-4 w-4" }) : a.kind === "out" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-4 w-4" })
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
					}, k))
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Glass, {
				delay: 200,
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
						className: "space-y-5",
						children: db.goals.map((g) => {
							const v = goalValue(g);
							const pct = Math.min(100, Math.round(v / (g.target || 1) * 100));
							const isMoney = g.kind !== "clients";
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mb-2 flex items-center gap-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Target, { className: "h-4 w-4" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "min-w-0 flex-1 truncate text-sm font-medium",
											children: [
												g.name,
												" ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "font-mono text-[0.65rem] text-muted-foreground",
													children: [
														"(",
														goalAccount(g),
														")"
													]
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "font-mono text-xs",
											children: [pct, "%"]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-1.5 overflow-hidden rounded-full bg-muted",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "grow-bar h-full rounded-full bg-primary",
										style: { width: `${pct}%` }
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-1 flex justify-between text-xs text-muted-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: isMoney ? money(v) : v }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["of ", isMoney ? money(g.target) : g.target] })]
								}),
								g.kind === "manual" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: () => setDB((d) => ({
										...d,
										goals: d.goals.map((x) => x.id === g.id ? {
											...x,
											current: x.current + 100
										} : x)
									})),
									className: "mt-2 inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs hover:bg-accent",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3 w-3" }), "Add $100"]
								})
							] }, g.id);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/finance",
						className: "mt-4 block text-xs text-muted-foreground hover:text-foreground",
						children: "Manage studio & personal goals in Finance →"
					})
				]
			})]
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
