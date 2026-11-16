import { i as __toESM } from "../_runtime.mjs";
import { n as performance_default } from "../_libs/@fullcalendar/interaction+[...].mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { G as shortDate, K as toUSD, L as previousMonth, U as setCategoryLimit, _ as compactMoney, g as cn, j as money, m as categoryLimit, q as today, x as expenseAccount } from "./utils-cyeqUyd1.mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { $ as Coffee, A as Monitor, C as Plus, H as Fuel, I as Laptop, M as Megaphone, O as Package, Q as Coins, R as HeartPulse, S as Printer, T as PiggyBank, _ as ShoppingCart, c as Users, d as TriangleAlert, et as CircleCheck, h as Stethoscope, i as Wifi, it as Car, lt as Baby, n as X, o as Utensils, ot as Building2, r as Wrench, s as UtensilsCrossed, st as Briefcase, t as Zap, u as Type, v as ShoppingBag, w as Plane, z as Hammer } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/FinanceVisuals-v4-NvIag.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var CATEGORY_ICON_MAP = {
	Food: Utensils,
	"Food and groceries": Utensils,
	Transportation: Car,
	Transport: Car,
	Kid: Baby,
	Family: Baby,
	"Personal Spending": ShoppingBag,
	Shopping: ShoppingBag,
	Utilities: Zap,
	"Medical & Healthcare": HeartPulse,
	Health: HeartPulse,
	"Saving & Investing": PiggyBank,
	"Prius 2012": Wrench,
	"Software and subscriptions": Laptop,
	"Fonts and licenses": Type,
	"Printing and production": Printer,
	"Fabrication and vendors": Hammer,
	Freelancers: Users,
	Marketing: Megaphone,
	Equipment: Monitor,
	"Office and utilities": Building2,
	Other: Package
};
function categoryIcon(category) {
	return CATEGORY_ICON_MAP[category] ?? Briefcase;
}
function expenseItemIcon(e) {
	const text = `${e.description} ${e.vendor}`.toLowerCase();
	if (/coffee|cafe|latte|espresso|matcha|tea/.test(text)) return Coffee;
	if (/gas|fuel|totalenergies|ptt|caltex|petrol/.test(text)) return Fuel;
	if (/flight|airport|airline|plane|trip/.test(text)) return Plane;
	if (/tuktuk|tuk tuk|passapp|grab|taxi|bus|ride/.test(text)) return Car;
	if (/grocer|aeon|supermarket|lucky|market|mart/.test(text)) return ShoppingCart;
	if (/milk|diaper|formula|baby|kid|toddler|stroller|toy/.test(text)) return Baby;
	if (/breakfast|lunch|dinner|pizza|burger|congee|rice|noodle|meal|ramen/.test(text)) return UtensilsCrossed;
	if (/internet|wifi|metfone|cellcard|smart|sinet|ezecom/.test(text)) return Wifi;
	if (/edc|electric|water|ppwsa|power|utility|bill/.test(text)) return Zap;
	if (/hospital|clinic|dentist|doctor|pharmacy|medicine|checkup|vitamin/.test(text)) return Stethoscope;
	if (/gold|invest|saving|deposit|bank/.test(text)) return Coins;
	if (/prius|oil|tire|brake|battery|mechanic|service|car|wash/.test(text)) return Wrench;
	if (/adobe|figma|framer|software|cloud|domain|hosting/.test(text)) return Laptop;
	if (/print|proof|box|packaging|paper/.test(text)) return Printer;
	return categoryIcon(e.category);
}
function AnimatedNumber({ value, format = (n) => money(n), duration = 520, className }) {
	const [display, setDisplay] = (0, import_react.useState)(value);
	const prevRef = (0, import_react.useRef)(value);
	(0, import_react.useEffect)(() => {
		const startVal = prevRef.current;
		prevRef.current = value;
		if (typeof window === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			setDisplay(value);
			return;
		}
		const diff = value - startVal;
		if (Math.abs(diff) < .005) {
			setDisplay(value);
			return;
		}
		let raf = 0;
		const t0 = performance_default.now();
		const step = (now) => {
			const p = Math.min(1, (now - t0) / duration);
			const eased = 1 - Math.pow(1 - p, 3);
			setDisplay(startVal + diff * eased);
			if (p < 1) raf = requestAnimationFrame(step);
			else setDisplay(value);
		};
		raf = requestAnimationFrame(step);
		return () => cancelAnimationFrame(raf);
	}, [value, duration]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className,
		children: format(display)
	});
}
function monthPacePercent(month) {
	const cur = today();
	if (!month || month === cur.slice(0, 7)) {
		const [y, m, d] = cur.split("-").map(Number);
		if (!y || !m || !d) return 50;
		const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
		return Math.min(100, Math.max(5, Math.round(d / daysInMonth * 100)));
	}
	return month < cur.slice(0, 7) ? 100 : 15;
}
function LiquidJar({ category, spent, limit, pacePct = 55, size = "md", selected = false }) {
	const [mounted, setMounted] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const t = requestAnimationFrame(() => setMounted(true));
		return () => cancelAnimationFrame(t);
	}, []);
	const Icon = categoryIcon(category);
	const rawPct = limit > 0 ? Math.round(spent / limit * 100) : spent > 0 ? 100 : 0;
	const fillPct = mounted ? Math.min(100, Math.max(spent > 0 ? 6 : 0, rawPct)) : 0;
	const overLimit = rawPct > 100;
	const fastPace = rawPct > Math.min(95, pacePct + 12);
	const dims = size === "sm" ? "h-28 w-full rounded-[1.1rem]" : size === "lg" ? "h-44 w-36 rounded-[1.6rem]" : "h-36 w-full rounded-[1.35rem]";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex flex-col items-center", size === "lg" ? "w-36" : "w-full"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: cn("mb-1 rounded-full bg-border/80 transition-colors", size === "sm" ? "h-1 w-7" : "h-1.5 w-10", selected && "bg-primary") }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: cn("relative overflow-hidden border bg-muted/45 shadow-inner transition-all duration-300", dims, selected ? "border-primary ring-2 ring-primary/35" : "border-border/80 group-hover:border-primary/60"),
			children: [
				limit > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "pointer-events-none absolute inset-x-0 z-10 border-t border-dashed border-foreground/25",
					style: { bottom: `${Math.min(94, Math.max(6, pacePct))}%` }
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: cn("absolute inset-x-0 bottom-0 transition-[height] duration-900 ease-[cubic-bezier(0.22,1,0.36,1)]", overLimit ? "bg-gradient-to-t from-destructive/80 via-destructive/60 to-destructive/40" : fastPace ? "bg-gradient-to-t from-primary/85 via-primary/70 to-destructive/45" : "bg-gradient-to-t from-primary/80 via-primary/55 to-primary/35"),
					style: { height: `${fillPct}%` },
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "jar-sheen h-2 w-full bg-gradient-to-b from-white/35 to-transparent" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: cn("relative z-10 mx-auto grid place-items-center rounded-full border border-border/80 bg-background/80 backdrop-blur-md shadow-sm transition-transform duration-300 group-hover:scale-105", size === "sm" ? "mt-2.5 h-8 w-8" : size === "lg" ? "mt-3.5 h-11 w-11" : "mt-3 h-9 w-9"),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: cn(size === "sm" ? "h-3.5 w-3.5" : size === "lg" ? "h-5 w-5" : "h-4 w-4", overLimit ? "text-destructive" : "text-primary") })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: cn("absolute bottom-2 left-2 z-10 rounded-full border border-border/70 bg-background/85 px-2 py-0.5 font-mono font-semibold backdrop-blur-md", size === "sm" ? "text-[0.62rem]" : "text-[0.68rem]", overLimit ? "text-destructive" : "text-foreground"),
					children: [rawPct, "%"]
				})
			]
		})]
	});
}
function BudgetShelf({ db, account, month, monthLabel, items, selectedCategory, onSelectCategory, compact = false, limitScale = 1 }) {
	const pacePct = limitScale > 1 ? 100 : monthPacePercent(month);
	const jars = (0, import_react.useMemo)(() => {
		return items.map((it) => {
			const limit = categoryLimit(db, account, it.category) * limitScale;
			const pct = limit > 0 ? Math.round(it.totalUSD / limit * 100) : 100;
			const isOver = pct > 100;
			const isFast = !isOver && pct > Math.min(95, pacePct + 12);
			return {
				...it,
				limit,
				pct,
				isOver,
				isFast
			};
		});
	}, [
		db,
		account,
		items,
		pacePct,
		limitScale
	]);
	const fastList = (0, import_react.useMemo)(() => [...jars].filter((j) => j.isOver || j.isFast).sort((a, b) => b.pct - a.pct).slice(0, 3), [jars]);
	if (jars.length === 0) return null;
	if (compact) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-3 gap-2.5 sm:grid-cols-5",
		children: jars.slice(0, 5).map((j, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: () => onSelectCategory(j.category),
			style: { animationDelay: `${idx * 45}ms` },
			title: `${j.category}: ${money(j.totalUSD)} / ${money(j.limit)}`,
			className: "group rise flex flex-col items-center rounded-2xl border border-border/60 bg-muted/25 p-2.5 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/60 hover:bg-muted/50",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiquidJar, {
					category: j.category,
					spent: j.totalUSD,
					limit: j.limit,
					pacePct,
					size: "sm",
					selected: selectedCategory === j.category
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mt-2 line-clamp-1 text-xs font-medium",
					children: j.category
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-mono text-[0.68rem] tabular-nums text-muted-foreground",
					children: compactMoney(j.totalUSD)
				}),
				(j.isOver || j.isFast) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mt-0.5 text-[0.62rem] font-medium text-destructive",
					children: j.isOver ? "Over limit" : "Spending fast"
				})
			]
		}, j.category))
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-4 lg:grid-cols-[minmax(0,1.75fr)_minmax(0,0.85fr)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "glass p-5 sm:p-6 rise",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex flex-wrap items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-medium",
					children: account === "Personal" ? "Personal category jars" : "Studio expense jars"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-0.5 text-xs text-muted-foreground",
					children: limitScale > 1 ? `${limitScale}-month combined target for ${monthLabel}. Click any jar to adjust monthly limit.` : `Dashed line marks even ${monthLabel} pace (${pacePct}%). Click any jar to adjust limit or view receipts.`
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "label-mono",
					children: [jars.length, " categories"]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4",
				children: jars.map((j, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => onSelectCategory(j.category),
					style: { animationDelay: `${idx * 40}ms` },
					title: `${j.category}: ${money(j.totalUSD)} of ${money(j.limit)}`,
					className: cn("group rise flex flex-col items-center rounded-2xl border p-3 text-center transition-all duration-200 hover:-translate-y-0.5", selectedCategory === j.category ? "border-primary bg-primary/10" : "border-border/60 bg-muted/25 hover:border-primary/50 hover:bg-muted/45"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiquidJar, {
							category: j.category,
							spent: j.totalUSD,
							limit: j.limit,
							pacePct,
							selected: selectedCategory === j.category
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-2.5 line-clamp-1 text-xs font-semibold",
							children: j.category
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "mt-0.5 font-mono text-[0.68rem] tabular-nums text-muted-foreground",
							children: [
								compactMoney(j.totalUSD),
								" of ",
								compactMoney(j.limit)
							]
						}),
						j.isOver ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-1 text-[0.65rem] font-medium text-destructive",
							children: "Over limit"
						}) : j.isFast ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-1 text-[0.65rem] font-medium text-destructive",
							children: "Spending fast"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "mt-1 text-[0.65rem] text-muted-foreground",
							children: [
								j.count,
								" ",
								j.count === 1 ? "item" : "items"
							]
						})
					]
				}, j.category))
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "glass flex flex-col justify-between p-5 sm:p-6 rise",
			style: { animationDelay: "100ms" },
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-1 flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-medium",
						children: "Spending fast"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: cn("h-4 w-4", fastList.length > 0 ? "text-destructive" : "text-positive") })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mb-4 text-xs text-muted-foreground",
					children: [
						"Categories pacing ahead of your ",
						monthLabel,
						" target"
					]
				}),
				fastList.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-border/70 bg-muted/35 p-4 text-xs text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-1.5 flex items-center gap-2 font-medium text-positive",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4" }), "Every category is on pace"]
						}),
						"No category is pacing ahead of its monthly limit for ",
						monthLabel,
						"."
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-2.5",
					children: fastList.map((j) => {
						const Icon = categoryIcon(j.category);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => onSelectCategory(j.category),
							className: "flex w-full items-center gap-3 rounded-2xl border border-border/70 bg-muted/35 p-3 text-left transition-colors hover:border-primary/60 hover:bg-muted/60",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-border bg-background/60 text-destructive",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-4 w-4" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "truncate text-sm font-medium",
										children: j.category
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "font-mono text-[0.7rem] text-muted-foreground",
										children: [
											money(j.totalUSD),
											" / ",
											money(j.limit)
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "shrink-0 rounded-full border border-destructive/30 bg-destructive/15 px-2.5 py-0.5 font-mono text-xs font-semibold text-destructive",
									children: [j.pct, "%"]
								})
							]
						}, j.category);
					})
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 rounded-2xl border border-border/70 bg-muted/25 p-3.5 text-xs text-muted-foreground",
				children: [
					jars.length - fastList.length,
					" of ",
					jars.length,
					" categories are pacing safely under their monthly limit."
				]
			})]
		})]
	});
}
function CategoryInspectorDrawer({ db, account, category, month, onClose, onAddExpense, onEditExpense }) {
	const limit = category ? categoryLimit(db, account, category) : 0;
	const [limitInput, setLimitInput] = (0, import_react.useState)(String(limit));
	const [savedFlash, setSavedFlash] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setLimitInput(String(limit));
		setSavedFlash(false);
	}, [category, limit]);
	(0, import_react.useEffect)(() => {
		if (!category) return;
		const onKey = (e) => {
			if (e.key === "Escape") onClose();
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [category, onClose]);
	if (!category) return null;
	const r = db.settings.khrRate;
	const prevYm = previousMonth(month);
	const monthLabel = (/* @__PURE__ */ new Date(month + "-01T00:00:00Z")).toLocaleDateString("en-US", {
		month: "long",
		year: "numeric",
		timeZone: "UTC"
	});
	const shortCur = (/* @__PURE__ */ new Date(month + "-01T00:00:00Z")).toLocaleDateString("en-US", {
		month: "short",
		timeZone: "UTC"
	});
	const shortPrev = (/* @__PURE__ */ new Date(prevYm + "-01T00:00:00Z")).toLocaleDateString("en-US", {
		month: "short",
		timeZone: "UTC"
	});
	const items = db.expenses.filter((e) => expenseAccount(e) === account && e.category === category && e.date.startsWith(month)).sort((a, b) => b.date.localeCompare(a.date));
	const spentCur = items.reduce((s, e) => s + toUSD(e.amount, e.currency, r), 0);
	const spentPrev = db.expenses.filter((e) => expenseAccount(e) === account && e.category === category && e.date.startsWith(prevYm)).reduce((s, e) => s + toUSD(e.amount, e.currency, r), 0);
	const pacePct = monthPacePercent(month);
	const pct = limit > 0 ? Math.round(spentCur / limit * 100) : 100;
	const statusLabel = pct > 100 ? "Over limit" : pct > Math.min(95, pacePct + 12) ? "Spending fast" : "On pace";
	const saveLimit = () => {
		const val = Number(limitInput);
		if (!Number.isFinite(val) || val < 0) return;
		setCategoryLimit(account, category, val);
		setSavedFlash(true);
		window.setTimeout(() => setSavedFlash(false), 1400);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-50 flex justify-end",
		role: "dialog",
		"aria-modal": "true",
		"aria-label": `${category} details`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			"aria-label": "Close category inspector",
			onClick: onClose,
			className: "backdrop-in fixed inset-0 bg-black/55 backdrop-blur-xs"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "drawer-in glass-strong relative z-10 flex h-full w-full max-w-md flex-col border-l border-border shadow-2xl",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-3 border-b border-border px-5 py-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "label-mono",
					children: [
						account,
						" · ",
						monthLabel
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-0.5 font-display text-xl font-bold",
					children: category
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onClose,
					"aria-label": "Close",
					className: "rounded-full p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1 space-y-5 overflow-y-auto px-5 py-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col items-center rounded-2xl border border-border/70 bg-muted/25 py-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiquidJar, {
								category,
								spent: spentCur,
								limit,
								pacePct,
								size: "lg",
								selected: true
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-3 font-mono text-xs text-muted-foreground",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										className: "text-foreground",
										children: money(spentCur)
									}),
									" of",
									" ",
									money(limit)
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("mt-1 text-xs font-medium", statusLabel === "On pace" ? "text-positive" : "text-destructive"),
								children: statusLabel
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "divide-y divide-border rounded-2xl border border-border/70 bg-muted/25 px-4 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between py-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-muted-foreground",
								children: ["Spent in ", shortCur]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatedNumber, {
								value: spentCur,
								className: "font-mono font-semibold"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between py-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-muted-foreground",
								children: ["Spent in ", shortPrev]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-muted-foreground",
								children: money(spentPrev)
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "label-mono mb-1.5 block",
						children: "Monthly limit (USD)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "number",
							min: 0,
							step: "10",
							value: limitInput,
							onChange: (e) => setLimitInput(e.target.value),
							onKeyDown: (e) => {
								if (e.key === "Enter") saveLimit();
							},
							className: "field font-mono"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: saveLimit,
							className: cn("shrink-0 rounded-xl px-4 py-2 text-xs font-semibold transition-colors", savedFlash ? "bg-positive text-primary-foreground" : "bg-primary text-primary-foreground hover:opacity-90"),
							children: savedFlash ? "Saved" : "Save"
						})]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-2.5 flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "label-mono",
							children: [
								"What I paid for (",
								items.length,
								")"
							]
						}), onAddExpense && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => onAddExpense(account, category),
							className: "inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs font-medium text-primary hover:bg-accent",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3 w-3" }), "Add"]
						})]
					}), items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "rounded-2xl border border-border/60 bg-muted/20 p-4 text-center text-xs text-muted-foreground",
						children: [
							"No ",
							category,
							" transactions in ",
							monthLabel,
							"."
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "divide-y divide-border rounded-2xl border border-border/70 bg-muted/20",
						children: items.map((e) => {
							const ItemIcon = expenseItemIcon(e);
							const usd = toUSD(e.amount, e.currency, r);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => onEditExpense?.(e),
								className: "flex w-full items-center gap-3 px-3.5 py-2.5 text-left transition-colors hover:bg-muted/50",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-border bg-background/50 text-primary",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemIcon, { className: "h-3.5 w-3.5" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0 flex-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "truncate text-sm font-medium",
											children: e.description || e.vendor || category
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "truncate text-[0.72rem] text-muted-foreground",
											children: [shortDate(e.date), e.vendor ? ` · ${e.vendor}` : ""]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "shrink-0 font-mono text-xs font-semibold text-destructive",
										children: ["-", money(usd)]
									})
								]
							}) }, e.id);
						})
					})] })
				]
			})]
		})]
	});
}
function GoalRingCard({ goal, current, accountLabel, onEdit, onQuickAdd, delay = 0 }) {
	const [mounted, setMounted] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const t = requestAnimationFrame(() => setMounted(true));
		return () => cancelAnimationFrame(t);
	}, []);
	const target = goal.target || 1;
	const pct = Math.min(100, Math.round(current / target * 100));
	const isMoney = goal.kind !== "clients";
	const radius = 44;
	const circumference = 2 * Math.PI * radius;
	const targetOffset = circumference * (1 - (mounted ? pct : 0) / 100);
	const done = pct >= 100;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		style: { animationDelay: `${delay}ms` },
		className: "rise flex flex-col justify-between rounded-2xl border border-border/75 bg-muted/30 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: onEdit,
					className: "min-w-0 text-left hover:text-primary",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate text-sm font-semibold",
						children: goal.name || "Untitled goal"
					}), accountLabel && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono text-[0.65rem] text-muted-foreground",
						children: accountLabel
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: cn("shrink-0 rounded-full border px-2 py-0.5 font-mono text-[0.68rem] font-semibold", done ? "border-positive/40 bg-positive/15 text-positive" : "border-border bg-background/60 text-muted-foreground"),
					children: [pct, "%"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: onEdit,
				className: "relative mx-auto my-3 grid h-32 w-32 place-items-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
					className: "h-full w-full -rotate-90",
					viewBox: "0 0 108 108",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						cx: "54",
						cy: "54",
						r: radius,
						fill: "none",
						stroke: "var(--muted)",
						strokeWidth: "8"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						cx: "54",
						cy: "54",
						r: radius,
						fill: "none",
						stroke: done ? "var(--positive)" : "var(--primary)",
						strokeWidth: "8",
						strokeLinecap: "round",
						strokeDasharray: circumference,
						strokeDashoffset: targetOffset,
						className: "transition-[stroke-dashoffset] duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "absolute inset-0 flex flex-col items-center justify-center px-3 text-center",
					title: isMoney ? `${money(current)} of ${money(goal.target)}` : `${current} of ${goal.target}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatedNumber, {
						value: current,
						format: (n) => isMoney ? compactMoney(Math.round(n)) : String(Math.round(n)),
						className: "font-display text-lg font-black leading-tight tabular-nums"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "mt-0.5 font-mono text-[0.64rem] tabular-nums text-muted-foreground",
						children: ["of ", isMoney ? compactMoney(goal.target) : goal.target]
					})]
				})]
			}),
			goal.kind === "manual" && onQuickAdd ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex items-center justify-center gap-1.5",
				children: [50, 100].map((amt) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => onQuickAdd(amt),
					className: "rounded-full border border-border px-3 py-1 text-[0.7rem] font-medium transition-colors hover:border-primary hover:bg-accent",
					children: ["+$", amt]
				}, amt))
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-center font-mono text-[0.65rem] text-muted-foreground",
				children: goal.kind === "cash" ? "Auto-synced from paid invoices" : "Auto-synced from active clients"
			})
		]
	});
}
//#endregion
export { expenseItemIcon as a, GoalRingCard as i, BudgetShelf as n, CategoryInspectorDrawer as r, AnimatedNumber as t };
