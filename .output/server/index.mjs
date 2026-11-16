globalThis.__nitro_main__ = import.meta.url;
import { i as HTTPError, n as defineLazyEventHandler, t as H3Core } from "./_libs/h3+rou3+srvx.mjs";
import { t as HookableCore } from "./_libs/hookable.mjs";
import { r as FastResponse } from "./_libs/h3-v2+rou3+srvx.mjs";
//#region #nitro-vite-setup
function lazyService(loader) {
	let promise, mod;
	return { fetch(req) {
		if (mod) return mod.fetch(req);
		if (!promise) promise = loader().then((_mod) => mod = _mod.default || _mod);
		return promise.then((mod) => mod.fetch(req));
	} };
}
var services = { ["ssr"]: lazyService(() => import("./_ssr/ssr.mjs")) };
globalThis.__nitro_vite_envs__ = services;
//#endregion
//#region #nitro/virtual/public-assets-data
var public_assets_data_default = {
	"/favicon.ico": {
		"type": "image/vnd.microsoft.icon",
		"etag": "\"4f95-3RXc3p2mhEAs1WBwaIvE0Y0uu0Y\"",
		"mtime": "2026-11-16T07:34:27.612Z",
		"size": 20373,
		"path": "../public/favicon.ico"
	},
	"/robots.txt": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"a0-CKGXSIe7TSsqDTmGm/nY1t/o5d0\"",
		"mtime": "2026-11-16T07:34:27.612Z",
		"size": 160,
		"path": "../public/robots.txt"
	},
	"/assets/Crud-Cf0OYseA.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"117c-nUdUR1JS8fE8H7JzumwkPCIK0tU\"",
		"mtime": "2026-11-16T07:34:24.812Z",
		"size": 4476,
		"path": "../public/assets/Crud-Cf0OYseA.js"
	},
	"/assets/InvoiceDoc-D9RoNZKn.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"90a8-4E5rVd2giWDfxrPLWhFEsb1nkww\"",
		"mtime": "2026-11-16T07:34:24.812Z",
		"size": 37032,
		"path": "../public/assets/InvoiceDoc-D9RoNZKn.js"
	},
	"/assets/arrow-up-right-HzT7NfMs.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"300-+iSz9qyI6UYHx6ABbbSK0ikuyWE\"",
		"mtime": "2026-11-16T07:34:24.812Z",
		"size": 768,
		"path": "../public/assets/arrow-up-right-HzT7NfMs.js"
	},
	"/assets/clients-CdzrsPpB.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2050-Qdz4FIdqP3hbEgp0GTCpJ3TLAbQ\"",
		"mtime": "2026-11-16T07:34:24.812Z",
		"size": 8272,
		"path": "../public/assets/clients-CdzrsPpB.js"
	},
	"/assets/finance-CK2NP2v3.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"717c-YUuIMZCaggBJh5hZNMycmLCMijM\"",
		"mtime": "2026-11-16T07:34:24.812Z",
		"size": 29052,
		"path": "../public/assets/finance-CK2NP2v3.js"
	},
	"/assets/invoices-D_CNKvbm.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1abd-vM9vI0LeFHE/M+e//oWVk/4s91U\"",
		"mtime": "2026-11-16T07:34:24.812Z",
		"size": 6845,
		"path": "../public/assets/invoices-D_CNKvbm.js"
	},
	"/assets/invoices._id-BPKFuOmn.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c054-8GIaFGdL0+hBtSJCSojMz2oGHoE\"",
		"mtime": "2026-11-16T07:34:24.812Z",
		"size": 49236,
		"path": "../public/assets/invoices._id-BPKFuOmn.js"
	},
	"/assets/link-C-cvVHqO.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"82da-qJCWoYr195vGu7DlR+CinxIBsUo\"",
		"mtime": "2026-11-16T07:34:24.812Z",
		"size": 33498,
		"path": "../public/assets/link-C-cvVHqO.js"
	},
	"/assets/plus-CPmKyuxY.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"18b-B6bPWPP0L6YK5JR/JtD+Qr25Hek\"",
		"mtime": "2026-11-16T07:34:24.812Z",
		"size": 395,
		"path": "../public/assets/plus-CPmKyuxY.js"
	},
	"/assets/preload-helper-t_wDMaEY.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"406b-zrOEEe90Yci/9oJlOD3/dt6ka64\"",
		"mtime": "2026-11-16T07:34:24.812Z",
		"size": 16491,
		"path": "../public/assets/preload-helper-t_wDMaEY.js"
	},
	"/assets/print._id-LIw_zbZn.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"710-6BapALXa61gh/4ZSFHWeIeC6o0U\"",
		"mtime": "2026-11-16T07:34:24.813Z",
		"size": 1808,
		"path": "../public/assets/print._id-LIw_zbZn.js"
	},
	"/assets/projects-CcBbRb6r.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"7cef2-2T+NKVUa1zuQI8yvt55qqVPMlow\"",
		"mtime": "2026-11-16T07:34:24.813Z",
		"size": 511730,
		"path": "../public/assets/projects-CcBbRb6r.js"
	},
	"/assets/search-BJFbjdqu.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1aa-Us1r5CDphTJf0Oo5n0Ltv2+1WOE\"",
		"mtime": "2026-11-16T07:34:24.815Z",
		"size": 426,
		"path": "../public/assets/search-BJFbjdqu.js"
	},
	"/assets/services-BYk6RvVO.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"164b-E52yrCsUxPGmYIPL5EpRy0DqNlY\"",
		"mtime": "2026-11-16T07:34:24.815Z",
		"size": 5707,
		"path": "../public/assets/services-BYk6RvVO.js"
	},
	"/assets/settings-DY7n3ciG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2c3c-+iLUyam1UKGmwpT0F5dPih1jVCw\"",
		"mtime": "2026-11-16T07:34:24.815Z",
		"size": 11324,
		"path": "../public/assets/settings-DY7n3ciG.js"
	},
	"/assets/styles-I1niC2no.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"1cce9-ObQt3llSHzireRTpOMaabi7snBI\"",
		"mtime": "2026-11-16T07:34:24.816Z",
		"size": 117993,
		"path": "../public/assets/styles-I1niC2no.css"
	},
	"/assets/ui-Cikv6Nuk.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"37eb0-gejORYJ/iaSMuz6EvjLv169rUdM\"",
		"mtime": "2026-11-16T07:34:24.816Z",
		"size": 229040,
		"path": "../public/assets/ui-Cikv6Nuk.js"
	},
	"/assets/upload-eDoz76ZT.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"397-8Jno/wzkudYChQ/prJbQI8FZ740\"",
		"mtime": "2026-11-16T07:34:24.816Z",
		"size": 919,
		"path": "../public/assets/upload-eDoz76ZT.js"
	},
	"/assets/useMatch-DFky7Eum.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"7b2-zAtv4b4F9VXwjvAVoF97KvPk06I\"",
		"mtime": "2026-11-16T07:34:24.816Z",
		"size": 1970,
		"path": "../public/assets/useMatch-DFky7Eum.js"
	},
	"/assets/useNavigate-Crg0b49_.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"42e-M9J3D6vzuLFzCqnZwzfLyg75kO4\"",
		"mtime": "2026-11-16T07:34:24.816Z",
		"size": 1070,
		"path": "../public/assets/useNavigate-Crg0b49_.js"
	},
	"/assets/useRouterState-D2wr8goI.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2b3b-G+5uYJZvfgufh0xfCu3bap4/NLA\"",
		"mtime": "2026-11-16T07:34:24.816Z",
		"size": 11067,
		"path": "../public/assets/useRouterState-D2wr8goI.js"
	},
	"/assets/index-x1qDq6GV.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ee3f4-sFLPF65RwSNdlrwhG/jqsnWkjU4\"",
		"mtime": "2026-11-16T07:34:24.811Z",
		"size": 975860,
		"path": "../public/assets/index-x1qDq6GV.js"
	},
	"/assets/routes-BItMMKi3.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"e082d-b68D/JUaMPA2DZ6iinxRTG7PT/Y\"",
		"mtime": "2026-11-16T07:34:24.814Z",
		"size": 919597,
		"path": "../public/assets/routes-BItMMKi3.js"
	},
	"/assets/utils-Cz-OEK7u.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"22cc6-xQR5PMf/fxDR1ehrZxcsOZpccHM\"",
		"mtime": "2026-11-16T07:34:24.816Z",
		"size": 142534,
		"path": "../public/assets/utils-Cz-OEK7u.js"
	}
};
//#endregion
//#region #nitro/virtual/public-assets
var publicAssetBases = {};
function isPublicAssetURL(id = "") {
	if (public_assets_data_default[id]) return true;
	for (const base in publicAssetBases) if (id.startsWith(base)) return true;
	return false;
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/route-rules.mjs
var headers = ((m) => function headersRouteRule(event) {
	for (const [key, value] of Object.entries(m.options || {})) event.res.headers.set(key, value);
});
//#endregion
//#region #nitro/virtual/routing
var findRouteRules = /* @__PURE__ */ (() => {
	const $0 = [{
		name: "headers",
		route: "/assets/**",
		handler: headers,
		options: { "cache-control": "public, max-age=31536000, immutable" }
	}];
	return (m, p) => {
		let r = [];
		if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
		let s = p.split("/");
		if (s.length > 1) {
			if (s[1] === "assets") r.unshift({
				data: $0,
				params: { "_": s.slice(2).join("/") }
			});
		}
		return r;
	};
})();
var _lazy_0jRgqU = defineLazyEventHandler(() => import("./_chunks/ssr-renderer.mjs"));
var findRoute = /* @__PURE__ */ (() => {
	const data = {
		route: "/**",
		handler: _lazy_0jRgqU
	};
	return ((_m, p) => {
		return {
			data,
			params: { "_": p.slice(1) }
		};
	});
})();
[].filter(Boolean);
//#endregion
//#region node_modules/nitro/dist/runtime/internal/error/prod.mjs
var errorHandler = (error, event) => {
	const res = defaultHandler(error, event);
	return new FastResponse(typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2), res);
};
function defaultHandler(error, event) {
	const unhandled = error.unhandled ?? !HTTPError.isError(error);
	const { status = 500, statusText = "" } = unhandled ? {} : error;
	if (status === 404) {
		const url = event.url || new URL(event.req.url);
		const baseURL = "/";
		if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) return {
			status: 302,
			headers: new Headers({ location: `${baseURL}${url.pathname.slice(1)}${url.search}` })
		};
	}
	const headers = new Headers(unhandled ? {} : error.headers);
	headers.set("content-type", "application/json; charset=utf-8");
	return {
		status,
		statusText,
		headers,
		body: {
			error: true,
			...unhandled ? {
				status,
				unhandled: true
			} : typeof error.toJSON === "function" ? error.toJSON() : {
				status,
				statusText,
				message: error.message
			}
		}
	};
}
//#endregion
//#region #nitro/virtual/error-handler
var errorHandlers = [errorHandler];
async function error_handler_default(error, event) {
	for (const handler of errorHandlers) try {
		const response = await handler(error, event, { defaultHandler });
		if (response) return response;
	} catch (error) {
		console.error(error);
	}
}
//#endregion
//#region #nitro/virtual/app
function createNitroApp() {
	const captureError = (error, errorCtx) => {
		if (errorCtx?.event) {
			const errors = errorCtx.event.req.context?.nitro?.errors;
			if (errors) errors.push({
				error,
				context: errorCtx
			});
		}
	};
	const h3App = createH3App({ onError(error, event) {
		return error_handler_default(error, event);
	} });
	let appHandler = (req) => {
		req.context ||= {};
		req.context.nitro = req.context.nitro || { errors: [] };
		return h3App.fetch(req);
	};
	return {
		fetch: appHandler,
		h3: h3App,
		hooks: void 0,
		captureError
	};
}
function createH3App(config) {
	const h3App = new H3Core(config);
	h3App["~findRoute"] = (event) => findRoute(event.req.method, event.url.pathname);
	h3App["~getMiddleware"] = (event, route) => {
		const pathname = event.url.pathname;
		const method = event.req.method;
		const middleware = [];
		const routeRules = getRouteRules(method, pathname);
		event.context.routeRules = routeRules?.routeRules;
		if (routeRules?.routeRuleMiddleware.length) middleware.push(...routeRules.routeRuleMiddleware);
		if (route?.data?.middleware?.length) middleware.push(...route.data.middleware);
		return middleware;
	};
	return h3App;
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/app.mjs
var APP_ID = "default";
function useNitroApp() {
	let instance = useNitroApp._instance;
	if (instance) return instance;
	instance = useNitroApp._instance = createNitroApp();
	globalThis.__nitro__ = globalThis.__nitro__ || {};
	globalThis.__nitro__[APP_ID] = instance;
	return instance;
}
function useNitroHooks() {
	const nitroApp = useNitroApp();
	const hooks = nitroApp.hooks;
	if (hooks) return hooks;
	return nitroApp.hooks = new HookableCore();
}
function getRouteRules(method, pathname) {
	const m = findRouteRules(method, pathname);
	if (!m?.length) return { routeRuleMiddleware: [] };
	const routeRules = {};
	for (const layer of m) for (const rule of layer.data) {
		const currentRule = routeRules[rule.name];
		if (currentRule) {
			if (rule.options === false) {
				delete routeRules[rule.name];
				continue;
			}
			if (typeof currentRule.options === "object" && typeof rule.options === "object") currentRule.options = {
				...currentRule.options,
				...rule.options
			};
			else currentRule.options = rule.options;
			currentRule.route = rule.route;
			currentRule.params = {
				...currentRule.params,
				...layer.params
			};
		} else if (rule.options !== false) routeRules[rule.name] = {
			...rule,
			params: layer.params
		};
	}
	const middleware = [];
	const orderedRules = Object.values(routeRules).sort((a, b) => (a.handler?.order || 0) - (b.handler?.order || 0));
	for (const rule of orderedRules) {
		if (rule.options === false || !rule.handler) continue;
		middleware.push(rule.handler(rule));
	}
	return {
		routeRules,
		routeRuleMiddleware: middleware
	};
}
//#endregion
//#region node_modules/nitro/dist/presets/cloudflare/runtime/_module-handler.mjs
function createHandler(hooks) {
	const nitroApp = useNitroApp();
	const nitroHooks = useNitroHooks();
	return {
		async fetch(request, env, context) {
			globalThis.__env__ = env;
			augmentReq(request, {
				env,
				context
			});
			const ctxExt = {};
			const url = new URL(request.url);
			if (hooks.fetch) {
				const res = await hooks.fetch(request, env, context, url, ctxExt);
				if (res) return res;
			}
			return await nitroApp.fetch(request);
		},
		scheduled(controller, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:scheduled", {
				controller,
				env,
				context
			}) || Promise.resolve());
		},
		email(message, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:email", {
				message,
				event: message,
				env,
				context
			}) || Promise.resolve());
		},
		queue(batch, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:queue", {
				batch,
				event: batch,
				env,
				context
			}) || Promise.resolve());
		},
		tail(traces, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:tail", {
				traces,
				env,
				context
			}) || Promise.resolve());
		},
		trace(traces, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:trace", {
				traces,
				env,
				context
			}) || Promise.resolve());
		}
	};
}
function augmentReq(cfReq, ctx) {
	const req = cfReq;
	req.ip = cfReq.headers.get("cf-connecting-ip") || void 0;
	req.runtime ??= { name: "cloudflare" };
	req.runtime.cloudflare = {
		...req.runtime.cloudflare,
		...ctx
	};
	req.waitUntil = ctx.context?.waitUntil.bind(ctx.context);
}
//#endregion
//#region node_modules/nitro/dist/presets/cloudflare/runtime/cloudflare-module.mjs
var cloudflare_module_default = createHandler({ fetch(cfRequest, env, context, url) {
	if (env.ASSETS && isPublicAssetURL(url.pathname)) return env.ASSETS.fetch(cfRequest);
} });
//#endregion
export { cloudflare_module_default as default };
