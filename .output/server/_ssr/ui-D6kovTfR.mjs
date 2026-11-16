import { i as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { g as cn } from "./utils-cyeqUyd1.mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as X, nt as ChevronDown, rt as Check, tt as ChevronUp } from "../_libs/lucide-react.mjs";
import { a as SelectItemIndicator, c as SelectPortal, d as SelectSeparator$1, f as SelectTrigger$1, i as SelectItem$1, l as SelectScrollDownButton$1, m as SelectViewport, n as SelectContent$1, o as SelectItemText, p as SelectValue$1, r as SelectIcon, s as SelectLabel$1, t as Select$1, u as SelectScrollUpButton$1 } from "../_libs/@radix-ui/react-select+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ui-D6kovTfR.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Select = Select$1;
var SelectValue = SelectValue$1;
var SelectTrigger = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectTrigger$1, {
	ref,
	className: cn("flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background cursor-pointer data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1", className),
	...props,
	children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectIcon, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-4 w-4 opacity-50" })
	})]
}));
SelectTrigger.displayName = SelectTrigger$1.displayName;
var SelectScrollUpButton = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollUpButton$1, {
	ref,
	className: cn("flex cursor-default items-center justify-center py-1", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "h-4 w-4" })
}));
SelectScrollUpButton.displayName = SelectScrollUpButton$1.displayName;
var SelectScrollDownButton = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollDownButton$1, {
	ref,
	className: cn("flex cursor-default items-center justify-center py-1", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-4 w-4" })
}));
SelectScrollDownButton.displayName = SelectScrollDownButton$1.displayName;
var SelectContent = import_react.forwardRef(({ className, children, position = "popper", ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectPortal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent$1, {
	ref,
	className: cn("relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-select-content-transform-origin)", position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1", className),
	position,
	...props,
	children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollUpButton, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectViewport, {
			className: cn("p-1", position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"),
			children
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectScrollDownButton, {})
	]
}) }));
SelectContent.displayName = SelectContent$1.displayName;
var SelectLabel = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectLabel$1, {
	ref,
	className: cn("px-2 py-1.5 text-sm font-semibold", className),
	...props
}));
SelectLabel.displayName = SelectLabel$1.displayName;
var SelectItem = import_react.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem$1, {
	ref,
	className: cn("relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className),
	...props,
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "absolute right-2 flex h-3.5 w-3.5 items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItemIndicator, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" }) })
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItemText, { children })]
}));
SelectItem.displayName = SelectItem$1.displayName;
var SelectSeparator = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectSeparator$1, {
	ref,
	className: cn("-mx-1 my-1 h-px bg-muted", className),
	...props
}));
SelectSeparator.displayName = SelectSeparator$1.displayName;
function Glass({ className, children, delay = 0 }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: cn("glass rise p-5 sm:p-6", className),
		style: { animationDelay: `${delay}ms` },
		children
	});
}
function PageHeader({ title, owner, action }) {
	const month = (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", {
		month: "long",
		year: "numeric"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "rise mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted-foreground",
				children: [
					"Welcome back, ",
					owner,
					"."
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "truncate font-display text-3xl font-bold sm:text-4xl",
				children: title
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex shrink-0 flex-col items-end gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "hidden text-sm text-muted-foreground sm:block",
				children: month
			}), action]
		})]
	});
}
function Btn({ variant = "ghost", className, ...p }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		...p,
		className: cn("inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all active:scale-95 disabled:opacity-50", variant === "gold" && "bg-primary text-primary-foreground shadow-[0_8px_24px_-8px_var(--primary)] hover:brightness-110", variant === "ghost" && "border border-border bg-secondary hover:bg-accent", variant === "danger" && "border border-destructive/40 text-destructive hover:bg-destructive/10", className)
	});
}
function Modal({ open, onClose, title, children, wide }) {
	(0, import_react.useEffect)(() => {
		if (!open) return;
		const k = (e) => e.key === "Escape" && onClose();
		window.addEventListener("keydown", k);
		return () => window.removeEventListener("keydown", k);
	}, [open, onClose]);
	if (!open) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 flex items-end justify-center bg-background/60 p-0 backdrop-blur-sm animate-in fade-in sm:items-center sm:p-4",
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			onClick: (e) => e.stopPropagation(),
			className: cn("glass-strong max-h-[92vh] w-full overflow-y-auto rounded-t-3xl p-5 animate-in slide-in-from-bottom-8 sm:rounded-3xl sm:p-6", wide ? "sm:max-w-3xl" : "sm:max-w-lg"),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-xl font-bold",
					children: title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: onClose,
					className: "rounded-full p-2 hover:bg-accent",
					"aria-label": "Close",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
				})]
			}), children]
		})
	});
}
function SlideDrawer({ open, onClose, title, subtitle, side = "right", children }) {
	(0, import_react.useEffect)(() => {
		if (!open) return;
		const k = (e) => e.key === "Escape" && onClose();
		window.addEventListener("keydown", k);
		return () => window.removeEventListener("keydown", k);
	}, [open, onClose]);
	if (!open) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("fixed inset-0 z-50 flex", side === "left" ? "justify-start" : "justify-end"),
		role: "dialog",
		"aria-modal": "true",
		"aria-label": title,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			"aria-label": `Close ${title}`,
			onClick: onClose,
			className: "backdrop-in fixed inset-0 bg-black/35 backdrop-blur-[2px]"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: cn("drawer-in glass-strong relative z-10 flex h-full w-full max-w-md flex-col shadow-2xl", side === "left" ? "border-r border-border" : "border-l border-border"),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-3 border-b border-border px-5 py-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [subtitle ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "label-mono",
						children: subtitle
					}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "truncate font-display text-xl font-bold",
						children: title
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onClose,
					"aria-label": "Close",
					className: "rounded-full p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex-1 overflow-y-auto px-5 py-5",
				children
			})]
		})]
	});
}
function F({ label, children, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: cn("block space-y-1.5", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "label-mono",
			children: label
		}), children]
	});
}
function Sel({ value, onChange, options, placeholder, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
		value: value || "__none__",
		onValueChange: (v) => onChange(v === "__none__" ? "" : v),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
			className: cn("field h-auto min-h-10 w-full min-w-0 justify-between gap-2 text-left text-foreground", className),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, {
			position: "popper",
			className: "z-[100] max-h-72 max-w-[calc(100vw-1.5rem)] min-w-[max(var(--radix-select-trigger-width),12rem)] border border-border bg-popover text-popover-foreground shadow-2xl",
			children: [(placeholder !== void 0 || !value) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
				value: "__none__",
				className: "min-h-11 cursor-pointer whitespace-normal py-2.5 leading-snug text-popover-foreground focus:bg-primary focus:text-primary-foreground data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground",
				children: placeholder ?? "Choose…"
			}), options.map((o) => {
				const v = typeof o === "string" ? o : o.value;
				return v ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
					value: v,
					className: "min-h-11 cursor-pointer whitespace-normal py-2.5 leading-snug text-popover-foreground focus:bg-primary focus:text-primary-foreground data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground",
					children: typeof o === "string" ? o : o.label
				}, v) : null;
			})]
		})]
	});
}
var tone = {
	Paid: "bg-positive/15 text-positive",
	Partial: "bg-primary/15 text-primary",
	Sent: "bg-secondary text-foreground",
	Draft: "bg-muted text-muted-foreground",
	Overdue: "bg-destructive/15 text-destructive",
	Active: "bg-positive/15 text-positive",
	Lead: "bg-primary/15 text-primary",
	Quoted: "bg-primary/15 text-primary",
	Delivered: "bg-positive/15 text-positive",
	Closed: "bg-positive/20 text-positive",
	"In production": "bg-primary/15 text-primary",
	Accepted: "bg-positive/15 text-positive",
	Signed: "bg-positive/15 text-positive",
	Received: "bg-positive/15 text-positive",
	Declined: "bg-destructive/15 text-destructive",
	Expired: "bg-destructive/15 text-destructive",
	Lost: "bg-destructive/15 text-destructive"
};
function Pill({ s }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex shrink-0 rounded-full px-2.5 py-0.5 font-mono text-[0.68rem] uppercase tracking-wider", tone[s] ?? "bg-secondary text-muted-foreground"),
		children: s
	});
}
function Empty({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "py-10 text-center text-sm text-muted-foreground",
		children
	});
}
function Stat({ label, value, fullValue, tone: t }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-w-0",
		title: fullValue ?? value,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "label-mono truncate",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: cn("font-display text-lg font-bold leading-tight tabular-nums sm:text-xl", t === "pos" && "text-positive", t === "neg" && "text-destructive"),
			children: value
		})]
	});
}
//#endregion
export { Modal as a, Sel as c, Glass as i, SlideDrawer as l, Empty as n, PageHeader as o, F as r, Pill as s, Btn as t, Stat as u };
