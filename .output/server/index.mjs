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
		"etag": "\"94b4-Rs/rXBQo77cXmvGJkGBhIj7QLEU\"",
		"mtime": "2026-11-16T08:59:01.003Z",
		"size": 38068,
		"path": "../public/favicon.ico"
	},
	"/robots.txt": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"a0-CKGXSIe7TSsqDTmGm/nY1t/o5d0\"",
		"mtime": "2026-11-16T08:59:01.004Z",
		"size": 160,
		"path": "../public/robots.txt"
	},
	"/assets/BentoGrid-DNuwvLt1.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1b758-1xD8y0bPsJwYUdzhmAgqqLpjygE\"",
		"mtime": "2026-11-16T08:58:54.869Z",
		"size": 112472,
		"path": "../public/assets/BentoGrid-DNuwvLt1.js"
	},
	"/assets/Crud-DRUy1sty.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"125f-1tuX+LHd8V/Pvr7NtIrolP625/c\"",
		"mtime": "2026-11-16T08:58:54.869Z",
		"size": 4703,
		"path": "../public/assets/Crud-DRUy1sty.js"
	},
	"/assets/InvoiceDoc-c4AZ-qv3.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"90d9-2KfZQohRUfeGRV8IQRC4DEbs7FQ\"",
		"mtime": "2026-11-16T08:58:54.870Z",
		"size": 37081,
		"path": "../public/assets/InvoiceDoc-c4AZ-qv3.js"
	},
	"/assets/circle-check-Grkf6Ub-.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1b8-ed2Paqxil0y/tkMh74lE3NQ1Ksw\"",
		"mtime": "2026-11-16T08:58:54.870Z",
		"size": 440,
		"path": "../public/assets/circle-check-Grkf6Ub-.js"
	},
	"/assets/clients-CnoJGh_O.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2c3b-VDSa4G80/s46gzqt1jVJ0bkcWFE\"",
		"mtime": "2026-11-16T08:58:54.870Z",
		"size": 11323,
		"path": "../public/assets/clients-CnoJGh_O.js"
	},
	"/assets/finance-BzyLoTNc.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a5bb-DOXconNjY+cNJhbJTqOkDQCTDlw\"",
		"mtime": "2026-11-16T08:58:54.870Z",
		"size": 42427,
		"path": "../public/assets/finance-BzyLoTNc.js"
	},
	"/assets/invoices-3SYmbKhH.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2640-P5F7PWQNQh4jUe7ik09bB0QAuQg\"",
		"mtime": "2026-11-16T08:58:54.870Z",
		"size": 9792,
		"path": "../public/assets/invoices-3SYmbKhH.js"
	},
	"/assets/invoices._id-DGb_sELO.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"bd6c-Pz7p0Em23yfFjjiF+1VpUee43O0\"",
		"mtime": "2026-11-16T08:58:54.871Z",
		"size": 48492,
		"path": "../public/assets/invoices._id-DGb_sELO.js"
	},
	"/assets/link-CVJvSglN.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"82dd-3gAPIdzPR6I/xNkfamwTz0kqx9c\"",
		"mtime": "2026-11-16T08:58:54.871Z",
		"size": 33501,
		"path": "../public/assets/link-CVJvSglN.js"
	},
	"/assets/package-B9i3zM3a.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4a8-vLCQl787p0Q8l1dKRUhO6POUYYE\"",
		"mtime": "2026-11-16T08:58:54.871Z",
		"size": 1192,
		"path": "../public/assets/package-B9i3zM3a.js"
	},
	"/assets/plus-DNO8Jq_s.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"18b-nCCtG7ucSzLtisa5pFaBbIL+fYo\"",
		"mtime": "2026-11-16T08:58:54.871Z",
		"size": 395,
		"path": "../public/assets/plus-DNO8Jq_s.js"
	},
	"/assets/preload-helper-Blr3wHwe.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"406d-u8BdYKb15b5S2Hmj4dBIRy14uP0\"",
		"mtime": "2026-11-16T08:58:54.871Z",
		"size": 16493,
		"path": "../public/assets/preload-helper-Blr3wHwe.js"
	},
	"/assets/print._id-D0bzgQjB.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"712-LSQYsVq1dPqyYBZEcAkAQ1zogRI\"",
		"mtime": "2026-11-16T08:58:54.871Z",
		"size": 1810,
		"path": "../public/assets/print._id-D0bzgQjB.js"
	},
	"/assets/projects-DAgEGdOK.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"67ca3-Tl1b+j4XRfGtpxvdcLQMdJkajmM\"",
		"mtime": "2026-11-16T08:58:54.871Z",
		"size": 425123,
		"path": "../public/assets/projects-DAgEGdOK.js"
	},
	"/assets/routes-C4glph3G.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a874-PQHXvlRIxpPRBHNqBosu04jhRAk\"",
		"mtime": "2026-11-16T08:58:54.871Z",
		"size": 43124,
		"path": "../public/assets/routes-C4glph3G.js"
	},
	"/assets/search-Cpu4Cw_j.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1aa-byqXmdlaw/Dh/IBwsSzypUOktbc\"",
		"mtime": "2026-11-16T08:58:54.871Z",
		"size": 426,
		"path": "../public/assets/search-Cpu4Cw_j.js"
	},
	"/assets/services-uVU88XWl.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"58dd-aKx+06pKSz49fywg7h3/hzGpmhM\"",
		"mtime": "2026-11-16T08:58:54.871Z",
		"size": 22749,
		"path": "../public/assets/services-uVU88XWl.js"
	},
	"/assets/settings-yg1aZc3w.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2c3e-tPyutqTZaa5BQ6jIvucsVGpMUXY\"",
		"mtime": "2026-11-16T08:58:54.871Z",
		"size": 11326,
		"path": "../public/assets/settings-yg1aZc3w.js"
	},
	"/assets/sparkles-CtS4bN3X.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"314-ZlE/5/WgiJQc+5nFlcUYfT85BtI\"",
		"mtime": "2026-11-16T08:58:54.871Z",
		"size": 788,
		"path": "../public/assets/sparkles-CtS4bN3X.js"
	},
	"/assets/styles-RRgqp50J.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"21dac-fGXuPvpMVJTRtSR10/RCizddchY\"",
		"mtime": "2026-11-16T08:58:54.872Z",
		"size": 138668,
		"path": "../public/assets/styles-RRgqp50J.css"
	},
	"/assets/trash-2-BM4-Iqml.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"26f-bv8MH5F4gKFKkBzF+MrO6hg6aPk\"",
		"mtime": "2026-11-16T08:58:54.871Z",
		"size": 623,
		"path": "../public/assets/trash-2-BM4-Iqml.js"
	},
	"/assets/FinanceVisuals-h9KN2lV9.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"e5940-bh8sSFoPr1x2qPyDEMeDbv7qoVo\"",
		"mtime": "2026-11-16T08:58:54.870Z",
		"size": 940352,
		"path": "../public/assets/FinanceVisuals-h9KN2lV9.js"
	},
	"/assets/index-C5inAkJE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ee579-Z2R1Vih6boWZirdsvBKJCSNJwys\"",
		"mtime": "2026-11-16T08:58:54.869Z",
		"size": 976249,
		"path": "../public/assets/index-C5inAkJE.js"
	},
	"/assets/ui-o3DjUYrq.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"38748-+LcMudmttzXk8p37NqepvapSUQs\"",
		"mtime": "2026-11-16T08:58:54.872Z",
		"size": 231240,
		"path": "../public/assets/ui-o3DjUYrq.js"
	},
	"/assets/upload-HRV8zBeU.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"397-QED2gOLQrJDm7aohy9ZgPm2hibE\"",
		"mtime": "2026-11-16T08:58:54.872Z",
		"size": 919,
		"path": "../public/assets/upload-HRV8zBeU.js"
	},
	"/assets/useMatch-D4AztDQR.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"7b4-gOT2Vjy88sWNEzv9UB18vmnvzPM\"",
		"mtime": "2026-11-16T08:58:54.872Z",
		"size": 1972,
		"path": "../public/assets/useMatch-D4AztDQR.js"
	},
	"/assets/useNavigate-DR06zXQK.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"430-otM/pp5V2G0gRsaD/oQ224EPiA4\"",
		"mtime": "2026-11-16T08:58:54.872Z",
		"size": 1072,
		"path": "../public/assets/useNavigate-DR06zXQK.js"
	},
	"/assets/useRouterState-CM4pYoxT.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2b3d-kVd2khT1dPNgzjU131Klp/IYRaw\"",
		"mtime": "2026-11-16T08:58:54.872Z",
		"size": 11069,
		"path": "../public/assets/useRouterState-CM4pYoxT.js"
	},
	"/assets/utils-9Cr7dFIe.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"61547-2owAhfbtEwR4byZc/Yei3Ut6OoQ\"",
		"mtime": "2026-11-16T08:58:54.872Z",
		"size": 398663,
		"path": "../public/assets/utils-9Cr7dFIe.js"
	},
	"/assets/aistudio/EXP_d02dbeeae6c546de9f8551aba6a2df9f_all_9d9aa218.csv": {
		"type": "text/csv; charset=utf-8",
		"etag": "\"193b5-/nf066Fcjt6uoIxJgAKGlHBmxg8\"",
		"mtime": "2026-11-16T08:59:01.003Z",
		"size": 103349,
		"path": "../public/assets/aistudio/EXP_d02dbeeae6c546de9f8551aba6a2df9f_all_9d9aa218.csv"
	},
	"/assets/aistudio/RVD_B2B_Company_118e38841b49801fac00d5868304449b_182ee61a.csv": {
		"type": "text/csv; charset=utf-8",
		"etag": "\"2a33-tgiJEG6FdkGdJ5CFjrabnxan/yU\"",
		"mtime": "2026-11-16T08:59:00.997Z",
		"size": 10803,
		"path": "../public/assets/aistudio/RVD_B2B_Company_118e38841b49801fac00d5868304449b_182ee61a.csv"
	},
	"/assets/aistudio/RVD_Client_118e38841b498056844cd2e43c73b316_fc3d0a17.csv": {
		"type": "text/csv; charset=utf-8",
		"etag": "\"3c32-DHtXaO6gZjnBExYdvTFEQivrtkI\"",
		"mtime": "2026-11-16T08:59:00.998Z",
		"size": 15410,
		"path": "../public/assets/aistudio/RVD_Client_118e38841b498056844cd2e43c73b316_fc3d0a17.csv"
	},
	"/assets/aistudio/RVD_Project_119e38841b49805baa6cc79273367b96_dedbdee4.csv": {
		"type": "text/csv; charset=utf-8",
		"etag": "\"9efa-VEOyIfr6oRDi2cOWiSaOWg/+gB4\"",
		"mtime": "2026-11-16T08:59:00.998Z",
		"size": 40698,
		"path": "../public/assets/aistudio/RVD_Project_119e38841b49805baa6cc79273367b96_dedbdee4.csv"
	},
	"/assets/aistudio/RVD_Service_118e38841b4980c884b6f9e886db92ae_43551540.csv": {
		"type": "text/csv; charset=utf-8",
		"etag": "\"75d2-BOzDNtTv6u/7RynUT5UCDVSWDNY\"",
		"mtime": "2026-11-16T08:59:00.999Z",
		"size": 30162,
		"path": "../public/assets/aistudio/RVD_Service_118e38841b4980c884b6f9e886db92ae_43551540.csv"
	},
	"/assets/aistudio/image_0eab8b9d.png": {
		"type": "image/png",
		"etag": "\"5cfc-Fqzc3Ex0qEEeOSEqziAa68QO6A4\"",
		"mtime": "2026-11-16T08:59:00.997Z",
		"size": 23804,
		"path": "../public/assets/aistudio/image_0eab8b9d.png"
	},
	"/assets/aistudio/Screenshot_2026-11-16_152914_7a7c2dd2.png": {
		"type": "image/png",
		"etag": "\"84b88-3HlJXKhg8uIqtTEwmFHsaabhkSk\"",
		"mtime": "2026-11-16T08:59:01.005Z",
		"size": 543624,
		"path": "../public/assets/aistudio/Screenshot_2026-11-16_152914_7a7c2dd2.png"
	},
	"/assets/aistudio/Screenshot_2026-11-16_152926_9b7d7bd4.png": {
		"type": "image/png",
		"etag": "\"979af-lBBNvFKTlLf5u8jIzPE+Jfn6WSE\"",
		"mtime": "2026-11-16T08:59:00.998Z",
		"size": 620975,
		"path": "../public/assets/aistudio/Screenshot_2026-11-16_152926_9b7d7bd4.png"
	},
	"/assets/aistudio/Screen_Recording_2026-11-16_155537_9d2936e8.mp4": {
		"type": "video/mp4",
		"etag": "\"e09cb4-Wgf1tWvUu/A/o8sUm3QYJdu0ugk\"",
		"mtime": "2026-11-16T08:59:01.015Z",
		"size": 14720180,
		"path": "../public/assets/aistudio/Screen_Recording_2026-11-16_155537_9d2936e8.mp4"
	},
	"/assets/aistudio/Screen_Recording_2026-11-16_150220_97d94144.mp4": {
		"type": "video/mp4",
		"etag": "\"138f8e3-EPsGGePEMHeeZmm8twVJ+YdQhs4\"",
		"mtime": "2026-11-16T08:59:01.068Z",
		"size": 20510947,
		"path": "../public/assets/aistudio/Screen_Recording_2026-11-16_150220_97d94144.mp4"
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
