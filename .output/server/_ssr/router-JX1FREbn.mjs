import { i as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { O as invoiceView, T as getDB, X as useDB, g as cn } from "./utils-cyeqUyd1.mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { F as Layers, P as LayoutGrid, U as FolderKanban, W as FileText, a as Wallet, c as Users, k as Moon, m as Sun, y as Settings } from "../_libs/lucide-react.mjs";
import { S as useRouter, _ as lazyRouteComponent, b as Link, d as Scripts, f as HeadContent, g as Outlet, h as createRouter, p as useRouterState, v as createFileRoute, y as createRootRouteWithContext } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Route$8 } from "./invoices._id-Q6YNDQTM.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
import { t as Route$9 } from "./print._id-Bd7hQWUa.mjs";
import { t as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-JX1FREbn.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Toaster$1 = ({ ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
		className: "toaster group",
		toastOptions: { classNames: {
			toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
			description: "group-[.toast]:text-muted-foreground",
			actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
			cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
		} },
		...props
	});
};
var tabs = [
	{
		to: "/",
		label: "Overview",
		icon: LayoutGrid
	},
	{
		to: "/projects",
		label: "Projects",
		icon: FolderKanban
	},
	{
		to: "/clients",
		label: "Clients",
		icon: Users
	},
	{
		to: "/services",
		label: "Services",
		icon: Layers
	},
	{
		to: "/invoices",
		label: "Invoices",
		icon: FileText
	},
	{
		to: "/finance",
		label: "Finance",
		icon: Wallet
	}
];
function Shell({ children }) {
	const path = useRouterState({ select: (r) => r.location.pathname });
	const overdue = useDB((d) => d.invoices.filter((i) => invoiceView(i, getDB()).status === "Overdue").length);
	const [light, setLight] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setLight(localStorage.getItem("rv-theme") === "light");
	}, []);
	(0, import_react.useEffect)(() => {
		document.documentElement.classList.toggle("light", light);
		localStorage.setItem("rv-theme", light ? "light" : "dark");
	}, [light]);
	const active = (to) => to === "/" ? path === "/" : path.startsWith(to);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen pb-28 sm:pb-10",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
			className: "no-print fixed inset-x-3 bottom-3 z-40 sm:inset-x-auto sm:left-1/2 sm:top-4 sm:bottom-auto sm:w-[min(calc(100vw-2rem),70rem)] sm:-translate-x-1/2",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "glass-strong flex items-center gap-1.5 rounded-full p-1.5 sm:gap-2 sm:p-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/",
						className: "hidden shrink-0 items-center gap-2.5 pl-1.5 pr-2 lg:flex",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid h-9 w-9 place-items-center rounded-full bg-primary font-display text-sm font-black text-primary-foreground",
							children: "RV"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "leading-tight",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", {
								className: "block font-display text-sm",
								children: "RothVan"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[0.7rem] text-muted-foreground",
								children: "Design studio"
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex min-w-0 flex-1 items-center justify-between gap-1 sm:justify-center",
						children: tabs.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: t.to,
							className: cn("relative flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-full px-1 py-2 text-[0.6rem] transition-colors sm:flex-none sm:flex-row sm:gap-1.5 sm:px-2.5 sm:text-xs lg:px-3 lg:text-sm", active(t.to) ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"),
							children: [
								active(t.to) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute inset-0 -z-0 rounded-full bg-primary animate-in zoom-in-90 fade-in duration-300" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(t.icon, { className: "relative h-4 w-4" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "relative",
									children: t.label
								}),
								t.to === "/invoices" && overdue > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "absolute right-1 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[0.6rem] font-bold text-destructive-foreground sm:relative sm:right-0 sm:top-0",
									children: overdue
								})
							]
						}, t.to))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex shrink-0 items-center gap-0.5 sm:gap-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setLight(!light),
							"aria-label": "Toggle theme",
							className: "hidden rounded-full p-2.5 text-muted-foreground hover:bg-accent hover:text-foreground sm:block",
							children: light ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, { className: "h-4 w-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/settings",
							"aria-label": "Settings",
							className: cn("rounded-full p-2.5 hover:bg-accent", active("/settings") ? "bg-primary text-primary-foreground" : "text-muted-foreground"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "h-4 w-4" })
						})]
					})
				]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
			className: "mx-auto max-w-6xl px-4 pt-6 sm:pt-24",
			children
		})]
	});
}
var styles_default = "/assets/styles-BKNh5pem.css";
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
	const stack = error instanceof Error ? error.stack : void 0;
	window.__lovableReportRuntimeError?.({
		message: describeThrown(error),
		...stack !== void 0 && { stack },
		filename: window.location.pathname
	});
}
var MAX_SERIALIZED_LENGTH = 2e3;
function describeThrown(error) {
	if (error instanceof Response) return `Response ${error.status}${error.url ? ` at ${error.url}` : ""}`;
	if (error instanceof Error) return error.message;
	if (typeof error === "string") return error;
	const { message } = error ?? {};
	if (typeof message === "string" && message.length > 0) return message;
	try {
		return JSON.stringify(error)?.slice(0, MAX_SERIALIZED_LENGTH) ?? String(error);
	} catch {
		return String(error);
	}
}
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-7xl font-bold text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "Page not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist or has been moved."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Go home"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong on our end. You can try refreshing or head back home."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$7 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "RothVan Studio" },
			{
				name: "description",
				content: "Projects, invoices and finance for RothVan Design."
			},
			{
				name: "author",
				content: "RothVan Design"
			},
			{
				property: "og:title",
				content: "RothVan Studio"
			},
			{
				property: "og:description",
				content: "Projects, invoices and finance for RothVan Design."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			},
			{
				name: "twitter:site",
				content: "@Lovable"
			}
		],
		links: [
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Merriweather:wght@700;900&family=Noto+Sans+Khmer:wght@400;600;700&family=Space+Mono&display=swap"
			},
			{
				rel: "icon",
				href: "/favicon.ico",
				type: "image/x-icon"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$7.useRouteContext();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(QueryClientProvider, {
		client: queryClient,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppFrame, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster$1, { position: "top-center" })]
	});
}
function AppFrame() {
	const path = useRouterState({ select: (r) => r.location.pathname });
	const [ready, setReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => setReady(true), []);
	if (!ready) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid min-h-screen place-items-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" })
	});
	if (path.startsWith("/print")) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) });
}
var $$splitComponentImporter$6 = () => import("./routes-CUdyRsTg.mjs");
var Route$6 = createFileRoute("/")({
	head: () => ({ meta: [
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		},
		{ title: "Overview · RothVan Studio" },
		{
			name: "description",
			content: "Cash profit, cash flow, personal monthly expenses, goals and project pipeline for RothVan Design."
		},
		{
			property: "og:title",
			content: "Overview · RothVan Studio"
		},
		{
			property: "og:description",
			content: "Cash profit, cash flow, personal monthly expenses, goals and project pipeline for RothVan Design."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
var $$splitComponentImporter$5 = () => import("./clients-CQmCqORR.mjs");
var Route$5 = createFileRoute("/clients")({
	head: () => ({ meta: [
		{ title: "Clients · RothVan Studio" },
		{
			name: "description",
			content: "Client directory and billing history for RothVan Design."
		},
		{
			property: "og:title",
			content: "Clients · RothVan Studio"
		},
		{
			property: "og:description",
			content: "Client directory and billing history for RothVan Design."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./finance-CJLo6KTg.mjs");
var Route$4 = createFileRoute("/finance")({
	head: () => ({ meta: [
		{ title: "Finance · RothVan Studio" },
		{
			name: "description",
			content: "RothVan Design studio cash flow, expenses, and personal monthly budget & saving goals."
		},
		{
			property: "og:title",
			content: "Finance · RothVan Studio"
		},
		{
			property: "og:description",
			content: "RothVan Design studio cash flow, expenses, and personal monthly budget & saving goals."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("./invoices-BJRtwS3c.mjs");
var Route$3 = createFileRoute("/invoices")({
	head: () => ({ meta: [
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		},
		{ title: "Invoices · RothVan Studio" },
		{
			name: "description",
			content: "Issue and track RothVan Design invoices."
		},
		{
			property: "og:title",
			content: "Invoices · RothVan Studio"
		},
		{
			property: "og:description",
			content: "Issue and track RothVan Design invoices."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("./projects-DA7_mH29.mjs");
var Route$2 = createFileRoute("/projects")({
	head: () => ({ meta: [
		{ title: "Projects · RothVan Studio" },
		{
			name: "description",
			content: "Track RothVan Design projects across board, calendar timeline, and list views."
		},
		{
			property: "og:title",
			content: "Projects · RothVan Studio"
		},
		{
			property: "og:description",
			content: "Track RothVan Design projects across board, calendar timeline, and list views."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./services-CmZ9ZU4W.mjs");
var Route$1 = createFileRoute("/services")({
	head: () => ({ meta: [
		{ title: "Services · RothVan Studio" },
		{
			name: "description",
			content: "Manage design packages, rates, scope and timelines for RothVan Studio."
		},
		{
			property: "og:title",
			content: "Services · RothVan Studio"
		},
		{
			property: "og:description",
			content: "Design packages, pricing and deliverables in one catalogue."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("./settings-sNO_UpqL.mjs");
var Route = createFileRoute("/settings")({
	head: () => ({ meta: [
		{ title: "Settings · RothVan Studio" },
		{
			name: "description",
			content: "Business details, payment info, services and terms for RothVan Design."
		},
		{
			property: "og:title",
			content: "Settings · RothVan Studio"
		},
		{
			property: "og:description",
			content: "Business details, payment info, services and terms for RothVan Design."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var IndexRoute = Route$6.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$7
});
var ClientsRoute = Route$5.update({
	id: "/clients",
	path: "/clients",
	getParentRoute: () => Route$7
});
var FinanceRoute = Route$4.update({
	id: "/finance",
	path: "/finance",
	getParentRoute: () => Route$7
});
var InvoicesRoute = Route$3.update({
	id: "/invoices",
	path: "/invoices",
	getParentRoute: () => Route$7
});
var ProjectsRoute = Route$2.update({
	id: "/projects",
	path: "/projects",
	getParentRoute: () => Route$7
});
var ServicesRoute = Route$1.update({
	id: "/services",
	path: "/services",
	getParentRoute: () => Route$7
});
var SettingsRoute = Route.update({
	id: "/settings",
	path: "/settings",
	getParentRoute: () => Route$7
});
var InvoicesIdRoute = Route$8.update({
	id: "/$id",
	path: "/$id",
	getParentRoute: () => InvoicesRoute
});
var PrintIdRoute = Route$9.update({
	id: "/print/$id",
	path: "/print/$id",
	getParentRoute: () => Route$7
});
var InvoicesRouteChildren = { InvoicesIdRoute };
var rootRouteChildren = {
	IndexRoute,
	ClientsRoute,
	FinanceRoute,
	InvoicesRoute: InvoicesRoute._addFileChildren(InvoicesRouteChildren),
	ProjectsRoute,
	ServicesRoute,
	SettingsRoute,
	PrintIdRoute
};
var routeTree = Route$7._addFileChildren(rootRouteChildren)._addFileTypes();
var getRouter = () => {
	const queryClient = new QueryClient();
	return createRouter({
		routeTree,
		context: { queryClient },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter };
