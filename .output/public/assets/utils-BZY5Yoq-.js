//#region \0rolldown/runtime.js
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJSMin = (cb, mod) => () => (mod || (cb((mod = { exports: {} }).exports, mod), cb = null), mod.exports);
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule || !__hasOwnProp.call(mod, "default") ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));
//#endregion
//#region node_modules/react/cjs/react.production.js
/**
* @license React
* react.production.js
*
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var require_react_production = /* @__PURE__ */ __commonJSMin(((exports) => {
	var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element");
	var REACT_PORTAL_TYPE = Symbol.for("react.portal");
	var REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
	var REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode");
	var REACT_PROFILER_TYPE = Symbol.for("react.profiler");
	var REACT_CONSUMER_TYPE = Symbol.for("react.consumer");
	var REACT_CONTEXT_TYPE = Symbol.for("react.context");
	var REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref");
	var REACT_SUSPENSE_TYPE = Symbol.for("react.suspense");
	var REACT_MEMO_TYPE = Symbol.for("react.memo");
	var REACT_LAZY_TYPE = Symbol.for("react.lazy");
	var REACT_ACTIVITY_TYPE = Symbol.for("react.activity");
	var REACT_VIEW_TRANSITION_TYPE = Symbol.for("react.view_transition");
	var MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
	function getIteratorFn(maybeIterable) {
		if (null === maybeIterable || "object" !== typeof maybeIterable) return null;
		maybeIterable = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable["@@iterator"];
		return "function" === typeof maybeIterable ? maybeIterable : null;
	}
	var ReactNoopUpdateQueue = {
		isMounted: function() {
			return !1;
		},
		enqueueForceUpdate: function() {},
		enqueueReplaceState: function() {},
		enqueueSetState: function() {}
	};
	var assign = Object.assign;
	var emptyObject = {};
	function Component(props, context, updater) {
		this.props = props;
		this.context = context;
		this.refs = emptyObject;
		this.updater = updater || ReactNoopUpdateQueue;
	}
	Component.prototype.isReactComponent = {};
	Component.prototype.setState = function(partialState, callback) {
		if ("object" !== typeof partialState && "function" !== typeof partialState && null != partialState) throw Error("takes an object of state variables to update or a function which returns an object of state variables.");
		this.updater.enqueueSetState(this, partialState, callback, "setState");
	};
	Component.prototype.forceUpdate = function(callback) {
		this.updater.enqueueForceUpdate(this, callback, "forceUpdate");
	};
	function ComponentDummy() {}
	ComponentDummy.prototype = Component.prototype;
	function PureComponent(props, context, updater) {
		this.props = props;
		this.context = context;
		this.refs = emptyObject;
		this.updater = updater || ReactNoopUpdateQueue;
	}
	var pureComponentPrototype = PureComponent.prototype = new ComponentDummy();
	pureComponentPrototype.constructor = PureComponent;
	assign(pureComponentPrototype, Component.prototype);
	pureComponentPrototype.isPureReactComponent = !0;
	var isArrayImpl = Array.isArray;
	function noop() {}
	var ReactSharedInternals = {
		H: null,
		A: null,
		T: null,
		S: null
	};
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	function ReactElement(type, key, props) {
		var refProp = props.ref;
		return {
			$$typeof: REACT_ELEMENT_TYPE,
			type,
			key,
			ref: void 0 !== refProp ? refProp : null,
			props
		};
	}
	function cloneAndReplaceKey(oldElement, newKey) {
		return ReactElement(oldElement.type, newKey, oldElement.props);
	}
	function isValidElement(object) {
		return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
	}
	function escape(key) {
		var escaperLookup = {
			"=": "=0",
			":": "=2"
		};
		return "$" + key.replace(/[=:]/g, function(match) {
			return escaperLookup[match];
		});
	}
	var userProvidedKeyEscapeRegex = /\/+/g;
	function getElementKey(element, index) {
		return "object" === typeof element && null !== element && null != element.key ? escape("" + element.key) : index.toString(36);
	}
	function resolveThenable(thenable) {
		switch (thenable.status) {
			case "fulfilled": return thenable.value;
			case "rejected": throw thenable.reason;
			default: switch ("string" === typeof thenable.status ? thenable.then(noop, noop) : (thenable.status = "pending", thenable.then(function(fulfilledValue) {
				"pending" === thenable.status && (thenable.status = "fulfilled", thenable.value = fulfilledValue);
			}, function(error) {
				"pending" === thenable.status && (thenable.status = "rejected", thenable.reason = error);
			})), thenable.status) {
				case "fulfilled": return thenable.value;
				case "rejected": throw thenable.reason;
			}
		}
		throw thenable;
	}
	function mapIntoArray(children, array, escapedPrefix, nameSoFar, callback) {
		var type = typeof children;
		if ("undefined" === type || "boolean" === type) children = null;
		var invokeCallback = !1;
		if (null === children) invokeCallback = !0;
		else switch (type) {
			case "bigint":
			case "string":
			case "number":
				invokeCallback = !0;
				break;
			case "object": switch (children.$$typeof) {
				case REACT_ELEMENT_TYPE:
				case REACT_PORTAL_TYPE:
					invokeCallback = !0;
					break;
				case REACT_LAZY_TYPE: return invokeCallback = children._init, mapIntoArray(invokeCallback(children._payload), array, escapedPrefix, nameSoFar, callback);
			}
		}
		if (invokeCallback) return callback = callback(children), invokeCallback = "" === nameSoFar ? "." + getElementKey(children, 0) : nameSoFar, isArrayImpl(callback) ? (escapedPrefix = "", null != invokeCallback && (escapedPrefix = invokeCallback.replace(userProvidedKeyEscapeRegex, "$&/") + "/"), mapIntoArray(callback, array, escapedPrefix, "", function(c) {
			return c;
		})) : null != callback && (isValidElement(callback) && (callback = cloneAndReplaceKey(callback, escapedPrefix + (null == callback.key || children && children.key === callback.key ? "" : ("" + callback.key).replace(userProvidedKeyEscapeRegex, "$&/") + "/") + invokeCallback)), array.push(callback)), 1;
		invokeCallback = 0;
		var nextNamePrefix = "" === nameSoFar ? "." : nameSoFar + ":";
		if (isArrayImpl(children)) for (var i = 0; i < children.length; i++) nameSoFar = children[i], type = nextNamePrefix + getElementKey(nameSoFar, i), invokeCallback += mapIntoArray(nameSoFar, array, escapedPrefix, type, callback);
		else if (i = getIteratorFn(children), "function" === typeof i) for (children = i.call(children), i = 0; !(nameSoFar = children.next()).done;) nameSoFar = nameSoFar.value, type = nextNamePrefix + getElementKey(nameSoFar, i++), invokeCallback += mapIntoArray(nameSoFar, array, escapedPrefix, type, callback);
		else if ("object" === type) {
			if ("function" === typeof children.then) return mapIntoArray(resolveThenable(children), array, escapedPrefix, nameSoFar, callback);
			array = String(children);
			throw Error("Objects are not valid as a React child (found: " + ("[object Object]" === array ? "object with keys {" + Object.keys(children).join(", ") + "}" : array) + "). If you meant to render a collection of children, use an array instead.");
		}
		return invokeCallback;
	}
	function mapChildren(children, func, context) {
		if (null == children) return children;
		var result = [], count = 0;
		mapIntoArray(children, result, "", "", function(child) {
			return func.call(context, child, count++);
		});
		return result;
	}
	function lazyInitializer(payload) {
		if (-1 === payload._status) {
			var ctor = payload._result, thenable = ctor();
			thenable.then(function(moduleObject) {
				if (0 === payload._status || -1 === payload._status) payload._status = 1, payload._result = moduleObject, void 0 === thenable.status && (thenable.status = "fulfilled", thenable.value = moduleObject);
			}, function(error) {
				if (0 === payload._status || -1 === payload._status) payload._status = 2, payload._result = error, void 0 === thenable.status && (thenable.status = "rejected", thenable.reason = error);
			});
			-1 === payload._status && (payload._status = 0, payload._result = thenable);
		}
		if (1 === payload._status) return payload._result.default;
		throw payload._result;
	}
	var reportGlobalError = "function" === typeof reportError ? reportError : function(error) {
		if ("object" === typeof window && "function" === typeof window.ErrorEvent) {
			var event = new window.ErrorEvent("error", {
				bubbles: !0,
				cancelable: !0,
				message: "object" === typeof error && null !== error && "string" === typeof error.message ? String(error.message) : String(error),
				error
			});
			if (!window.dispatchEvent(event)) return;
		} else if ("object" === typeof process && "function" === typeof process.emit) {
			process.emit("uncaughtException", error);
			return;
		}
		console.error(error);
	};
	function startTransition(scope) {
		var prevTransition = ReactSharedInternals.T, currentTransition = {};
		currentTransition.types = null !== prevTransition ? prevTransition.types : null;
		ReactSharedInternals.T = currentTransition;
		try {
			var returnValue = scope(), onStartTransitionFinish = ReactSharedInternals.S;
			null !== onStartTransitionFinish && onStartTransitionFinish(currentTransition, returnValue);
			"object" === typeof returnValue && null !== returnValue && "function" === typeof returnValue.then && returnValue.then(noop, reportGlobalError);
		} catch (error) {
			reportGlobalError(error);
		} finally {
			null !== prevTransition && null !== currentTransition.types && (prevTransition.types = currentTransition.types), ReactSharedInternals.T = prevTransition;
		}
	}
	function addTransitionType(type) {
		var transition = ReactSharedInternals.T;
		if (null !== transition) {
			var transitionTypes = transition.types;
			null === transitionTypes ? transition.types = [type] : -1 === transitionTypes.indexOf(type) && transitionTypes.push(type);
		} else startTransition(addTransitionType.bind(null, type));
	}
	var Children = {
		map: mapChildren,
		forEach: function(children, forEachFunc, forEachContext) {
			mapChildren(children, function() {
				forEachFunc.apply(this, arguments);
			}, forEachContext);
		},
		count: function(children) {
			var n = 0;
			mapChildren(children, function() {
				n++;
			});
			return n;
		},
		toArray: function(children) {
			return mapChildren(children, function(child) {
				return child;
			}) || [];
		},
		only: function(children) {
			if (!isValidElement(children)) throw Error("React.Children.only expected to receive a single React element child.");
			return children;
		}
	};
	exports.Activity = REACT_ACTIVITY_TYPE;
	exports.Children = Children;
	exports.Component = Component;
	exports.Fragment = REACT_FRAGMENT_TYPE;
	exports.Profiler = REACT_PROFILER_TYPE;
	exports.PureComponent = PureComponent;
	exports.StrictMode = REACT_STRICT_MODE_TYPE;
	exports.Suspense = REACT_SUSPENSE_TYPE;
	exports.ViewTransition = REACT_VIEW_TRANSITION_TYPE;
	exports.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = ReactSharedInternals;
	exports.__COMPILER_RUNTIME = {
		__proto__: null,
		c: function(size) {
			return ReactSharedInternals.H.useMemoCache(size);
		}
	};
	exports.addTransitionType = addTransitionType;
	exports.cache = function(fn) {
		return function() {
			return fn.apply(null, arguments);
		};
	};
	exports.cacheSignal = function() {
		return null;
	};
	exports.cloneElement = function(element, config, children) {
		if (null === element || void 0 === element) throw Error("The argument must be a React element, but you passed " + element + ".");
		var props = assign({}, element.props), key = element.key;
		if (null != config) for (propName in void 0 !== config.key && (key = "" + config.key), config) !hasOwnProperty.call(config, propName) || "key" === propName || "__self" === propName || "__source" === propName || "ref" === propName && void 0 === config.ref || (props[propName] = config[propName]);
		var propName = arguments.length - 2;
		if (1 === propName) props.children = children;
		else if (1 < propName) {
			for (var childArray = Array(propName), i = 0; i < propName; i++) childArray[i] = arguments[i + 2];
			props.children = childArray;
		}
		return ReactElement(element.type, key, props);
	};
	exports.createContext = function(defaultValue) {
		defaultValue = {
			$$typeof: REACT_CONTEXT_TYPE,
			_currentValue: defaultValue,
			_currentValue2: defaultValue,
			_threadCount: 0,
			Provider: null,
			Consumer: null
		};
		defaultValue.Provider = defaultValue;
		defaultValue.Consumer = {
			$$typeof: REACT_CONSUMER_TYPE,
			_context: defaultValue
		};
		return defaultValue;
	};
	exports.createElement = function(type, config, children) {
		var propName, props = {}, key = null;
		if (null != config) for (propName in void 0 !== config.key && (key = "" + config.key), config) hasOwnProperty.call(config, propName) && "key" !== propName && "__self" !== propName && "__source" !== propName && (props[propName] = config[propName]);
		var childrenLength = arguments.length - 2;
		if (1 === childrenLength) props.children = children;
		else if (1 < childrenLength) {
			for (var childArray = Array(childrenLength), i = 0; i < childrenLength; i++) childArray[i] = arguments[i + 2];
			props.children = childArray;
		}
		if (type && type.defaultProps) for (propName in childrenLength = type.defaultProps, childrenLength) void 0 === props[propName] && (props[propName] = childrenLength[propName]);
		return ReactElement(type, key, props);
	};
	exports.createRef = function() {
		return { current: null };
	};
	exports.forwardRef = function(render) {
		return {
			$$typeof: REACT_FORWARD_REF_TYPE,
			render
		};
	};
	exports.isValidElement = isValidElement;
	exports.lazy = function(ctor) {
		return {
			$$typeof: REACT_LAZY_TYPE,
			_payload: {
				_status: -1,
				_result: ctor
			},
			_init: lazyInitializer
		};
	};
	exports.memo = function(type, compare) {
		return {
			$$typeof: REACT_MEMO_TYPE,
			type,
			compare: void 0 === compare ? null : compare
		};
	};
	exports.startTransition = startTransition;
	exports.unstable_useCacheRefresh = function() {
		return ReactSharedInternals.H.useCacheRefresh();
	};
	exports.use = function(usable) {
		return ReactSharedInternals.H.use(usable);
	};
	exports.useActionState = function(action, initialState, permalink) {
		return ReactSharedInternals.H.useActionState(action, initialState, permalink);
	};
	exports.useCallback = function(callback, deps) {
		return ReactSharedInternals.H.useCallback(callback, deps);
	};
	exports.useContext = function(Context) {
		return ReactSharedInternals.H.useContext(Context);
	};
	exports.useDebugValue = function() {};
	exports.useDeferredValue = function(value, initialValue) {
		return ReactSharedInternals.H.useDeferredValue(value, initialValue);
	};
	exports.useEffect = function(create, deps) {
		return ReactSharedInternals.H.useEffect(create, deps);
	};
	exports.useEffectEvent = function(callback) {
		return ReactSharedInternals.H.useEffectEvent(callback);
	};
	exports.useId = function() {
		return ReactSharedInternals.H.useId();
	};
	exports.useImperativeHandle = function(ref, create, deps) {
		return ReactSharedInternals.H.useImperativeHandle(ref, create, deps);
	};
	exports.useInsertionEffect = function(create, deps) {
		return ReactSharedInternals.H.useInsertionEffect(create, deps);
	};
	exports.useLayoutEffect = function(create, deps) {
		return ReactSharedInternals.H.useLayoutEffect(create, deps);
	};
	exports.useMemo = function(create, deps) {
		return ReactSharedInternals.H.useMemo(create, deps);
	};
	exports.useOptimistic = function(passthrough, reducer) {
		return ReactSharedInternals.H.useOptimistic(passthrough, reducer);
	};
	exports.useReducer = function(reducer, initialArg, init) {
		return ReactSharedInternals.H.useReducer(reducer, initialArg, init);
	};
	exports.useRef = function(initialValue) {
		return ReactSharedInternals.H.useRef(initialValue);
	};
	exports.useState = function(initialState) {
		return ReactSharedInternals.H.useState(initialState);
	};
	exports.useSyncExternalStore = function(subscribe, getSnapshot, getServerSnapshot) {
		return ReactSharedInternals.H.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
	};
	exports.useTransition = function() {
		return ReactSharedInternals.H.useTransition();
	};
	exports.version = "19.3.1";
}));
//#endregion
//#region node_modules/react/index.js
var require_react = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require_react_production();
}));
//#endregion
//#region node_modules/react-dom/cjs/react-dom.production.js
/**
* @license React
* react-dom.production.js
*
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var require_react_dom_production = /* @__PURE__ */ __commonJSMin(((exports) => {
	var React = require_react();
	function formatProdErrorMessage(code) {
		var url = "https://react.dev/errors/" + code;
		if (1 < arguments.length) {
			url += "?args[]=" + encodeURIComponent(arguments[1]);
			for (var i = 2; i < arguments.length; i++) url += "&args[]=" + encodeURIComponent(arguments[i]);
		}
		return "Minified React error #" + code + "; visit " + url + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
	}
	function noop() {}
	var Internals = {
		d: {
			f: noop,
			r: function() {
				throw Error(formatProdErrorMessage(522));
			},
			D: noop,
			C: noop,
			L: noop,
			m: noop,
			X: noop,
			S: noop,
			M: noop
		},
		p: 0,
		findDOMNode: null
	};
	var REACT_PORTAL_TYPE = Symbol.for("react.portal");
	var REACT_RECOVERABLE_TYPE = Symbol.for("react.recoverable");
	var REACT_OPTIMISTIC_KEY = Symbol.for("react.optimistic_key");
	function createPortal$1(children, containerInfo, implementation) {
		var key = 3 < arguments.length && void 0 !== arguments[3] ? arguments[3] : null;
		return {
			$$typeof: REACT_PORTAL_TYPE,
			key: null == key ? null : key === REACT_OPTIMISTIC_KEY ? REACT_OPTIMISTIC_KEY : "" + key,
			children,
			containerInfo,
			implementation
		};
	}
	var ReactSharedInternals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
	function getCrossOriginStringAs(as, input) {
		if ("font" === as) return "";
		if ("string" === typeof input) return "use-credentials" === input ? input : "";
	}
	exports.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = Internals;
	exports.browser = function(reason) {
		return {
			$$typeof: REACT_RECOVERABLE_TYPE,
			_reason: reason
		};
	};
	exports.createPortal = function(children, container) {
		var key = 2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : null;
		if (!container || 1 !== container.nodeType && 9 !== container.nodeType && 11 !== container.nodeType) throw Error(formatProdErrorMessage(299));
		return createPortal$1(children, container, null, key);
	};
	exports.flushSync = function(fn) {
		var previousTransition = ReactSharedInternals.T, previousUpdatePriority = Internals.p;
		try {
			if (ReactSharedInternals.T = null, Internals.p = 2, fn) return fn();
		} finally {
			ReactSharedInternals.T = previousTransition, Internals.p = previousUpdatePriority, Internals.d.f();
		}
	};
	exports.preconnect = function(href, options) {
		"string" === typeof href && (options ? (options = options.crossOrigin, options = "string" === typeof options ? "use-credentials" === options ? options : "" : void 0) : options = null, Internals.d.C(href, options));
	};
	exports.prefetchDNS = function(href) {
		"string" === typeof href && Internals.d.D(href);
	};
	exports.preinit = function(href, options) {
		if ("string" === typeof href && options && "string" === typeof options.as) {
			var as = options.as, crossOrigin = getCrossOriginStringAs(as, options.crossOrigin), integrity = "string" === typeof options.integrity ? options.integrity : void 0, fetchPriority = "string" === typeof options.fetchPriority ? options.fetchPriority : void 0;
			"style" === as ? Internals.d.S(href, "string" === typeof options.precedence ? options.precedence : void 0, {
				crossOrigin,
				integrity,
				fetchPriority
			}) : "script" === as && Internals.d.X(href, {
				crossOrigin,
				integrity,
				fetchPriority,
				nonce: "string" === typeof options.nonce ? options.nonce : void 0
			});
		}
	};
	exports.preinitModule = function(href, options) {
		if ("string" === typeof href) if ("object" === typeof options && null !== options) {
			if (null == options.as || "script" === options.as) {
				var crossOrigin = getCrossOriginStringAs(options.as, options.crossOrigin);
				Internals.d.M(href, {
					crossOrigin,
					integrity: "string" === typeof options.integrity ? options.integrity : void 0,
					nonce: "string" === typeof options.nonce ? options.nonce : void 0,
					fetchPriority: "string" === typeof options.fetchPriority ? options.fetchPriority : void 0
				});
			}
		} else options ?? Internals.d.M(href);
	};
	exports.preload = function(href, options) {
		if ("string" === typeof href && "object" === typeof options && null !== options && "string" === typeof options.as) {
			var as = options.as, crossOrigin = getCrossOriginStringAs(as, options.crossOrigin);
			Internals.d.L(href, as, {
				crossOrigin,
				integrity: "string" === typeof options.integrity ? options.integrity : void 0,
				nonce: "string" === typeof options.nonce ? options.nonce : void 0,
				type: "string" === typeof options.type ? options.type : void 0,
				fetchPriority: "string" === typeof options.fetchPriority ? options.fetchPriority : void 0,
				referrerPolicy: "string" === typeof options.referrerPolicy ? options.referrerPolicy : void 0,
				imageSrcSet: "string" === typeof options.imageSrcSet ? options.imageSrcSet : void 0,
				imageSizes: "string" === typeof options.imageSizes ? options.imageSizes : void 0,
				media: "string" === typeof options.media ? options.media : void 0
			});
		}
	};
	exports.preloadModule = function(href, options) {
		if ("string" === typeof href) if (options) {
			var crossOrigin = getCrossOriginStringAs(options.as, options.crossOrigin);
			Internals.d.m(href, {
				as: "string" === typeof options.as && "script" !== options.as ? options.as : void 0,
				crossOrigin,
				integrity: "string" === typeof options.integrity ? options.integrity : void 0,
				nonce: "string" === typeof options.nonce ? options.nonce : void 0,
				fetchPriority: "string" === typeof options.fetchPriority ? options.fetchPriority : void 0
			});
		} else Internals.d.m(href);
	};
	exports.requestFormReset = function(form) {
		Internals.d.r(form);
	};
	exports.unstable_batchedUpdates = function(fn, a) {
		return fn(a);
	};
	exports.useFormState = function(action, initialState, permalink) {
		return ReactSharedInternals.H.useFormState(action, initialState, permalink);
	};
	exports.useFormStatus = function() {
		return ReactSharedInternals.H.useHostTransitionStatus();
	};
	exports.version = "19.3.1";
}));
//#endregion
//#region node_modules/react-dom/index.js
var require_react_dom = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	function checkDCE() {
		if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ === "undefined" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE !== "function") return;
		try {
			__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(checkDCE);
		} catch (err) {
			console.error(err);
		}
	}
	checkDCE();
	module.exports = require_react_dom_production();
}));
//#endregion
//#region node_modules/react/cjs/react-jsx-runtime.production.js
/**
* @license React
* react-jsx-runtime.production.js
*
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var require_react_jsx_runtime_production = /* @__PURE__ */ __commonJSMin(((exports) => {
	var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element");
	var REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
	function jsxProd(type, config, maybeKey) {
		var key = null;
		void 0 !== maybeKey && (key = "" + maybeKey);
		void 0 !== config.key && (key = "" + config.key);
		if ("key" in config) {
			maybeKey = {};
			for (var propName in config) "key" !== propName && (maybeKey[propName] = config[propName]);
		} else maybeKey = config;
		config = maybeKey.ref;
		return {
			$$typeof: REACT_ELEMENT_TYPE,
			type,
			key,
			ref: void 0 !== config ? config : null,
			props: maybeKey
		};
	}
	exports.Fragment = REACT_FRAGMENT_TYPE;
	exports.jsx = jsxProd;
	exports.jsxs = jsxProd;
}));
//#endregion
//#region node_modules/react/jsx-runtime.js
var require_jsx_runtime = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require_react_jsx_runtime_production();
}));
//#endregion
//#region node_modules/lucide-react/dist/esm/shared/src/utils/mergeClasses.js
var import_react = /* @__PURE__ */ __toESM(require_react());
/**
* @license lucide-react v0.575.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var mergeClasses = (...classes) => classes.filter((className, index, array) => {
	return Boolean(className) && className.trim() !== "" && array.indexOf(className) === index;
}).join(" ").trim();
//#endregion
//#region node_modules/lucide-react/dist/esm/shared/src/utils/toKebabCase.js
/**
* @license lucide-react v0.575.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var toKebabCase = (string) => string.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
//#endregion
//#region node_modules/lucide-react/dist/esm/shared/src/utils/toCamelCase.js
/**
* @license lucide-react v0.575.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var toCamelCase = (string) => string.replace(/^([A-Z])|[\s-_]+(\w)/g, (match, p1, p2) => p2 ? p2.toUpperCase() : p1.toLowerCase());
//#endregion
//#region node_modules/lucide-react/dist/esm/shared/src/utils/toPascalCase.js
/**
* @license lucide-react v0.575.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var toPascalCase = (string) => {
	const camelCase = toCamelCase(string);
	return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
};
//#endregion
//#region node_modules/lucide-react/dist/esm/defaultAttributes.js
/**
* @license lucide-react v0.575.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var defaultAttributes = {
	xmlns: "http://www.w3.org/2000/svg",
	width: 24,
	height: 24,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: 2,
	strokeLinecap: "round",
	strokeLinejoin: "round"
};
//#endregion
//#region node_modules/lucide-react/dist/esm/shared/src/utils/hasA11yProp.js
/**
* @license lucide-react v0.575.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var hasA11yProp = (props) => {
	for (const prop in props) if (prop.startsWith("aria-") || prop === "role" || prop === "title") return true;
	return false;
};
//#endregion
//#region node_modules/lucide-react/dist/esm/Icon.js
/**
* @license lucide-react v0.575.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Icon = (0, import_react.forwardRef)(({ color = "currentColor", size = 24, strokeWidth = 2, absoluteStrokeWidth, className = "", children, iconNode, ...rest }, ref) => (0, import_react.createElement)("svg", {
	ref,
	...defaultAttributes,
	width: size,
	height: size,
	stroke: color,
	strokeWidth: absoluteStrokeWidth ? Number(strokeWidth) * 24 / Number(size) : strokeWidth,
	className: mergeClasses("lucide", className),
	...!children && !hasA11yProp(rest) && { "aria-hidden": "true" },
	...rest
}, [...iconNode.map(([tag, attrs]) => (0, import_react.createElement)(tag, attrs)), ...Array.isArray(children) ? children : [children]]));
//#endregion
//#region node_modules/lucide-react/dist/esm/createLucideIcon.js
/**
* @license lucide-react v0.575.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var createLucideIcon = (iconName, iconNode) => {
	const Component = (0, import_react.forwardRef)(({ className, ...props }, ref) => (0, import_react.createElement)(Icon, {
		ref,
		iconNode,
		className: mergeClasses(`lucide-${toKebabCase(toPascalCase(iconName))}`, `lucide-${iconName}`, className),
		...props
	}));
	Component.displayName = toPascalCase(iconName);
	return Component;
};
//#endregion
//#region src/lib/personal-expenses-seed.ts
var PERSONAL_TUPLES = [
	[
		"2026-11-16",
		"Food",
		"Debit",
		"breakfast x 2",
		5
	],
	[
		"2026-11-16",
		"Transportation",
		"Debit",
		"FTR gasoline",
		2.7
	],
	[
		"2026-11-16",
		"Food",
		"Debit",
		"coffee",
		1.65
	],
	[
		"2026-11-13",
		"Food",
		"Debit",
		"coffee",
		1.65
	],
	[
		"2026-11-12",
		"Personal Spending",
		"Debit",
		"ឥវ៉ាន់ អ៊ី +វណ្ណារី",
		500
	],
	[
		"2026-11-12",
		"Food",
		"Debit",
		"grocery at aeon",
		10
	],
	[
		"2026-11-12",
		"Food",
		"Debit",
		"coffee",
		1.65
	],
	[
		"2026-11-12",
		"Food",
		"Debit",
		"breakfast",
		1.25
	],
	[
		"2026-11-12",
		"Utilities",
		"Debit",
		"PPSWA",
		.4
	],
	[
		"2026-11-11",
		"Utilities",
		"Debit",
		"EDC",
		3.29
	],
	[
		"2026-11-11",
		"Utilities",
		"Debit",
		"Waste Management",
		2.65
	],
	[
		"2026-11-11",
		"Food",
		"Debit",
		"coffee + breakfast",
		2.5
	],
	[
		"2026-11-10",
		"Kid",
		"Debit",
		"Milk and diapers",
		31.8
	],
	[
		"2026-11-10",
		"Food",
		"Debit",
		"Dinner at aeon two",
		12
	],
	[
		"2026-11-10",
		"Food",
		"Debit",
		"Breakfast and coffee",
		2.5
	],
	[
		"2026-11-09",
		"Personal Spending",
		"Debit",
		"Food Vacuum machine",
		16
	],
	[
		"2026-11-09",
		"Personal Spending",
		"Debit",
		"Plastic No. 25 100pcs",
		10
	],
	[
		"2026-11-09",
		"Food",
		"Debit",
		"Fruit",
		4.4
	],
	[
		"2026-11-08",
		"Food",
		"Debit",
		"Dinner",
		5
	],
	[
		"2026-11-08",
		"Food",
		"Debit",
		"Coffee",
		3
	],
	[
		"2026-11-08",
		"Transportation",
		"Debit",
		"Tire air refilled",
		1.25
	],
	[
		"2026-11-07",
		"Food",
		"Debit",
		"Snack",
		5
	],
	[
		"2026-11-07",
		"Food",
		"Debit",
		"Coffee",
		1.65
	],
	[
		"2026-11-07",
		"Food",
		"Debit",
		"Lunch",
		1.25
	],
	[
		"2026-11-06",
		"Transportation",
		"Credit",
		"Gasoline 30L",
		37.2
	],
	[
		"2026-11-06",
		"Transportation",
		"Debit",
		"Phnom Penh Express",
		16
	],
	[
		"2026-11-04",
		"Food",
		"Debit",
		"Grocery at Angkor Market",
		16
	],
	[
		"2026-11-04",
		"Food",
		"Debit",
		"Dinner",
		2.5
	],
	[
		"2026-11-04",
		"Food",
		"Debit",
		"Coffee",
		1.65
	],
	[
		"2026-11-03",
		"Food",
		"Debit",
		"Breakfast Coffee",
		3
	],
	[
		"2026-11-03",
		"Food",
		"Debit",
		"Lunch",
		1.25
	],
	[
		"2026-11-02",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		3
	],
	[
		"2026-11-02",
		"Food",
		"Debit",
		"Lunch",
		3
	],
	[
		"2026-11-02",
		"Food",
		"Debit",
		"Dinner",
		3
	],
	[
		"2026-11-02",
		"Food",
		"Debit",
		"Cake",
		2.4
	],
	[
		"2026-11-01",
		"Transportation",
		"Credit",
		"Prius Gasoline 20L",
		25
	],
	[
		"2026-11-01",
		"Food",
		"Debit",
		"Lunch",
		20
	],
	[
		"2026-11-01",
		"Prius 2012",
		"Debit",
		"ផ្សាជ័រ armrest box",
		10
	],
	[
		"2026-10-31",
		"Prius 2012",
		"Debit",
		"លាងម៉ាស៊ីនត្រជាក់ឡាន Prius រើតាបប្លូ",
		60
	],
	[
		"2026-10-31",
		"Kid",
		"Debit",
		"Kid Eco",
		20
	],
	[
		"2026-10-31",
		"Food",
		"Credit",
		"Dinner MoMo aeon 3",
		15
	],
	[
		"2026-10-31",
		"Food",
		"Debit",
		"Coffee",
		1.65
	],
	[
		"2026-10-30",
		"Food",
		"Credit",
		"Grocery at Bayon",
		11.75
	],
	[
		"2026-10-30",
		"Food",
		"Debit",
		"Coffee + Breakfast",
		2.5
	],
	[
		"2026-10-30",
		"Food",
		"Debit",
		"Lunch",
		1.25
	],
	[
		"2026-10-28",
		"Kid",
		"Credit",
		"Elica health check maxicare",
		31.81
	],
	[
		"2026-10-28",
		"Food",
		"Credit",
		"Aeon grocery",
		12.6
	],
	[
		"2026-10-28",
		"Food",
		"Debit",
		"Breakfast + coffee",
		2.5
	],
	[
		"2026-10-28",
		"Food",
		"Debit",
		"Lunch",
		1.25
	],
	[
		"2026-10-27",
		"Food",
		"Debit",
		"Lunch",
		4
	],
	[
		"2026-10-27",
		"Food",
		"Debit",
		"Coffee",
		1.65
	],
	[
		"2026-10-26",
		"Prius 2012",
		"Credit",
		"0w20 shell helix super $44 + shipping 54 yuan",
		60
	],
	[
		"2026-10-26",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		3
	],
	[
		"2026-10-25",
		"Personal Spending",
		"Debit",
		"បច្ច័យបុណ្យកឋិន",
		62.5
	],
	[
		"2026-10-25",
		"Prius 2012",
		"Debit",
		"ដែកឃ្លោង",
		25
	],
	[
		"2026-10-25",
		"Transportation",
		"Debit",
		"Prius Gasoline 20L",
		24.8
	],
	[
		"2026-10-25",
		"Food",
		"Debit",
		"Breakfast Norea Chicken rice",
		8.51
	],
	[
		"2026-10-25",
		"Utilities",
		"Debit",
		"Hair Cut",
		4
	],
	[
		"2026-10-24",
		"Kid",
		"Debit",
		"Eco ultra sound",
		30
	],
	[
		"2026-10-24",
		"Food",
		"Debit",
		"Breakfast + coffee",
		2.5
	],
	[
		"2026-10-24",
		"Food",
		"Debit",
		"Lunch",
		2
	],
	[
		"2026-10-23",
		"Food",
		"Debit",
		"coffee + breakast",
		2.5
	],
	[
		"2026-10-22",
		"Kid",
		"Credit",
		"Elica milk",
		43.8
	],
	[
		"2026-10-22",
		"Food",
		"Credit",
		"Dinner at Sakura",
		16.5
	],
	[
		"2026-10-22",
		"Transportation",
		"Debit",
		"Gasoline Zoomer",
		3.6
	],
	[
		"2026-10-22",
		"Food",
		"Debit",
		"Coffee",
		1.65
	],
	[
		"2026-10-21",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		2.5
	],
	[
		"2026-10-21",
		"Food",
		"Debit",
		"Lunch",
		2
	],
	[
		"2026-10-20",
		"Food",
		"Debit",
		"Dinner Malatang",
		5
	],
	[
		"2026-10-20",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		2.5
	],
	[
		"2026-10-19",
		"Food",
		"Credit",
		"Dinner at Aeon",
		13.2
	],
	[
		"2026-10-19",
		"Food",
		"Debit",
		"AEON Grocery + Bread",
		6
	],
	[
		"2026-10-19",
		"Food",
		"Debit",
		"Breakfast",
		2.5
	],
	[
		"2026-10-19",
		"Food",
		"Debit",
		"Breakfast + Coffee (2)",
		2.5
	],
	[
		"2026-10-19",
		"Food",
		"Debit",
		"Coffee",
		1.65
	],
	[
		"2026-10-18",
		"Prius 2012",
		"Debit",
		"Bi LED XT12+1 80w/90w installation",
		150
	],
	[
		"2026-10-18",
		"Transportation",
		"Credit",
		"Prius Gasoline 10L",
		13.1
	],
	[
		"2026-10-18",
		"Food",
		"Debit",
		"Lunch Pasta Corner",
		12
	],
	[
		"2026-10-18",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		5
	],
	[
		"2026-10-17",
		"Food",
		"Debit",
		"Coffee",
		1.65
	],
	[
		"2026-10-16",
		"Transportation",
		"Debit",
		"FTR gasoline",
		3.46
	],
	[
		"2026-10-16",
		"Food",
		"Debit",
		"Coffee",
		1.65
	],
	[
		"2026-10-16",
		"Food",
		"Debit",
		"Dinner",
		1.5
	],
	[
		"2026-10-15",
		"Transportation",
		"Credit",
		"Prius Gasoline 10L",
		13.1
	],
	[
		"2026-10-14",
		"Utilities",
		"Debit",
		"Cat food 2kg + cream",
		11
	],
	[
		"2026-10-14",
		"Food",
		"Debit",
		"coffee + breakfast",
		2.5
	],
	[
		"2026-10-13",
		"Utilities",
		"Debit",
		"car wash",
		6
	],
	[
		"2026-10-13",
		"Food",
		"Debit",
		"coffee",
		1.65
	],
	[
		"2026-10-13",
		"Food",
		"Debit",
		"Lunch",
		1
	],
	[
		"2026-10-12",
		"Food",
		"Debit",
		"Breakfast at brown",
		15
	],
	[
		"2026-10-11",
		"Transportation",
		"Credit",
		"Prius gasoline 20L",
		25.4
	],
	[
		"2026-10-10",
		"Transportation",
		"Credit",
		"Prius Gasoline 20L",
		24.26
	],
	[
		"2026-10-10",
		"Food",
		"Debit",
		"Coffee",
		2.15
	],
	[
		"2026-10-10",
		"Food",
		"Debit",
		"Breakfast",
		.75
	],
	[
		"2026-10-09",
		"Food",
		"Credit",
		"Dinner at aeon",
		23.46
	],
	[
		"2026-10-09",
		"Food",
		"Debit",
		"Lunch",
		3.75
	],
	[
		"2026-10-09",
		"Food",
		"Debit",
		"Coffee",
		1.65
	],
	[
		"2026-10-08",
		"Food",
		"Debit",
		"coffee",
		1.65
	],
	[
		"2026-10-07",
		"Food",
		"Debit",
		"Lunch",
		3.75
	],
	[
		"2026-10-07",
		"Food",
		"Debit",
		"Coffee",
		1.65
	],
	[
		"2026-10-06",
		"Utilities",
		"Debit",
		"EDC",
		3.79
	],
	[
		"2026-10-06",
		"Transportation",
		"Debit",
		"FTR gasoline 2L",
		2.63
	],
	[
		"2026-10-06",
		"Utilities",
		"Debit",
		"Waste Managment",
		2.63
	],
	[
		"2026-10-06",
		"Food",
		"Debit",
		"Coffee",
		1.65
	],
	[
		"2026-10-05",
		"Food",
		"Debit",
		"Lunch",
		2
	],
	[
		"2026-10-05",
		"Food",
		"Debit",
		"Coffee",
		1.65
	],
	[
		"2026-10-04",
		"Personal Spending",
		"Credit",
		"361 shoes",
		14.12
	],
	[
		"2026-10-04",
		"Transportation",
		"Credit",
		"Prius Gasoline 10L",
		12.7
	],
	[
		"2026-10-02",
		"Food",
		"Debit",
		"Coffee",
		1.6
	],
	[
		"2026-10-01",
		"Transportation",
		"Debit",
		"Zoomer Gasoline",
		3.73
	],
	[
		"2026-10-01",
		"Food",
		"Debit",
		"Coffee",
		1.65
	],
	[
		"2026-10-01",
		"Food",
		"Debit",
		"Lunch",
		1.5
	],
	[
		"2026-09-30",
		"Food",
		"Debit",
		"Lunch",
		2.5
	],
	[
		"2026-09-30",
		"Food",
		"Debit",
		"coffee",
		1.65
	],
	[
		"2026-09-29",
		"Food",
		"Credit",
		"dinner at genki",
		10
	],
	[
		"2026-09-29",
		"Food",
		"Credit",
		"aeon grocery",
		3
	],
	[
		"2026-09-29",
		"Food",
		"Debit",
		"Lunch",
		2
	],
	[
		"2026-09-29",
		"Food",
		"Debit",
		"Coffee",
		1.65
	],
	[
		"2026-09-28",
		"Food",
		"Debit",
		"Breakfast + Lunch",
		3.75
	],
	[
		"2026-09-28",
		"Food",
		"Debit",
		"Dinner",
		3
	],
	[
		"2026-09-28",
		"Food",
		"Debit",
		"Coffee",
		1.65
	],
	[
		"2026-09-27",
		"Personal Spending",
		"Debit",
		"ប្រហុក ១kg",
		7.5
	],
	[
		"2026-09-27",
		"Food",
		"Debit",
		"Breakfast",
		2.5
	],
	[
		"2026-09-27",
		"Food",
		"Debit",
		"Lunch",
		2.5
	],
	[
		"2026-09-27",
		"Food",
		"Debit",
		"Rice 2kg",
		2.5
	],
	[
		"2026-09-27",
		"Food",
		"Debit",
		"dinner",
		2.5
	],
	[
		"2026-09-27",
		"Food",
		"Debit",
		"Coffee",
		1
	],
	[
		"2026-09-27",
		"Utilities",
		"Debit",
		"Plastic Bag (20L) 0.5kg",
		1
	],
	[
		"2026-09-26",
		"Food",
		"Debit",
		"Dinner Pizza + Spaghetti",
		10
	],
	[
		"2026-09-26",
		"Transportation",
		"Debit",
		"FTR engine oil 1L",
		7.5
	],
	[
		"2026-09-26",
		"Food",
		"Debit",
		"Lunch",
		4
	],
	[
		"2026-09-26",
		"Food",
		"Debit",
		"Breakfast",
		2.5
	],
	[
		"2026-09-26",
		"Food",
		"Debit",
		"Coffee",
		1
	],
	[
		"2026-09-22",
		"Food",
		"Debit",
		"Breakfast + Lunch",
		4
	],
	[
		"2026-09-22",
		"Food",
		"Debit",
		"Coffee",
		1.65
	],
	[
		"2026-09-21",
		"Personal Spending",
		"Debit",
		"Grocery DYI",
		5.7
	],
	[
		"2026-09-21",
		"Food",
		"Debit",
		"coffee",
		1.65
	],
	[
		"2026-09-20",
		"Utilities",
		"Debit",
		"Zoomers maintained",
		19
	],
	[
		"2026-09-20",
		"Transportation",
		"Credit",
		"Gasoline Prius 10L",
		11.8
	],
	[
		"2026-09-20",
		"Food",
		"Credit",
		"Brown Breakfast",
		8.7
	],
	[
		"2026-09-20",
		"Food",
		"Debit",
		"Lunch",
		5
	],
	[
		"2026-09-19",
		"Kid",
		"Credit",
		"Elica milk + food",
		62.9
	],
	[
		"2026-09-19",
		"Personal Spending",
		"Debit",
		"Mao’s son 1 month birthday",
		50
	],
	[
		"2026-09-19",
		"Transportation",
		"Credit",
		"Prius Gasoline 10L",
		11.8
	],
	[
		"2026-09-18",
		"Food",
		"Debit",
		"Coffee",
		1.65
	],
	[
		"2026-09-17",
		"Food",
		"Credit",
		"Grocery at Bayon",
		19.75
	],
	[
		"2026-09-17",
		"Food",
		"Debit",
		"coffee",
		1.65
	],
	[
		"2026-09-16",
		"Food",
		"Credit",
		"grocery and dinner at aeon 3",
		20
	],
	[
		"2026-09-16",
		"Transportation",
		"Debit",
		"FTR Gasoline",
		3.66
	],
	[
		"2026-09-16",
		"Food",
		"Debit",
		"coffee",
		1.65
	],
	[
		"2026-09-15",
		"Food",
		"Debit",
		"Dinner pizza + spaghetti",
		10
	],
	[
		"2026-09-15",
		"Food",
		"Debit",
		"Coffee",
		1.65
	],
	[
		"2026-09-14",
		"Food",
		"Debit",
		"seafood buffet x2 $13.5",
		27
	],
	[
		"2026-09-14",
		"Utilities",
		"Debit",
		"AC Cleaning Service",
		20
	],
	[
		"2026-09-14",
		"Food",
		"Debit",
		"coffee",
		3.3
	],
	[
		"2026-09-13",
		"Food",
		"Debit",
		"Bird nest",
		5
	],
	[
		"2026-09-13",
		"Utilities",
		"Debit",
		"HairCut",
		4
	],
	[
		"2026-09-13",
		"Food",
		"Debit",
		"Mixed Papaya",
		3.5
	],
	[
		"2026-09-13",
		"Food",
		"Debit",
		"Coffee",
		1
	],
	[
		"2026-09-12",
		"Personal Spending",
		"Debit",
		"Cigarettes 20pcs",
		16.3
	],
	[
		"2026-09-12",
		"Food",
		"Debit",
		"Dinner",
		8.8
	],
	[
		"2026-09-12",
		"Utilities",
		"Debit",
		"light bulb and socket",
		5.5
	],
	[
		"2026-09-12",
		"Food",
		"Debit",
		"Pet food",
		5
	],
	[
		"2026-09-12",
		"Food",
		"Debit",
		"Coffee",
		1.65
	],
	[
		"2026-09-11",
		"Utilities",
		"Debit",
		"fruit offering",
		7.5
	],
	[
		"2026-09-11",
		"Transportation",
		"Debit",
		"Zoomer Gasoline",
		3
	],
	[
		"2026-09-11",
		"Food",
		"Debit",
		"coffee",
		1.65
	],
	[
		"2026-09-10",
		"Food",
		"Debit",
		"Breakfast",
		1.25
	],
	[
		"2026-09-10",
		"Food",
		"Debit",
		"coffee",
		1
	],
	[
		"2026-09-10",
		"Utilities",
		"Debit",
		"PPSWA",
		.6
	],
	[
		"2026-09-09",
		"Food",
		"Debit",
		"Dinner Domino + Brown Bread",
		7.5
	],
	[
		"2026-09-09",
		"Utilities",
		"Debit",
		"EDC",
		3.56
	],
	[
		"2026-09-09",
		"Utilities",
		"Debit",
		"Waste management",
		2.56
	],
	[
		"2026-09-09",
		"Transportation",
		"Debit",
		"FTR gasoline",
		2.2
	],
	[
		"2026-09-09",
		"Food",
		"Debit",
		"Grocery at SuperDuper",
		2
	],
	[
		"2026-09-09",
		"Food",
		"Debit",
		"Coffee",
		1.65
	],
	[
		"2026-09-08",
		"Food",
		"Debit",
		"Dinner at aeon 1",
		3.55
	],
	[
		"2026-09-07",
		"Food",
		"Debit",
		"coffee",
		1.65
	],
	[
		"2026-09-06",
		"Food",
		"Credit",
		"Lunch Seorae",
		16
	],
	[
		"2026-09-06",
		"Transportation",
		"Credit",
		"Gasoline Prius 10L",
		10.9
	],
	[
		"2026-09-06",
		"Food",
		"Debit",
		"Grocery at Bayon",
		8.5
	],
	[
		"2026-09-05",
		"Food",
		"Debit",
		"Lobster 1kg at takeo",
		27
	],
	[
		"2026-09-05",
		"Transportation",
		"Credit",
		"Gasoline Prius 10L",
		10.9
	],
	[
		"2026-09-04",
		"Food",
		"Debit",
		"coffee",
		1.65
	],
	[
		"2026-09-03",
		"Food",
		"Debit",
		"Lunch",
		4
	],
	[
		"2026-09-03",
		"Transportation",
		"Debit",
		"Gasoline FTR",
		2.82
	],
	[
		"2026-09-03",
		"Food",
		"Debit",
		"coffee",
		1.65
	],
	[
		"2026-09-02",
		"Utilities",
		"Debit",
		"Pet Food",
		5.5
	],
	[
		"2026-09-02",
		"Food",
		"Debit",
		"Aeon grocery",
		3.7
	],
	[
		"2026-09-02",
		"Food",
		"Debit",
		"Coffee",
		1.65
	],
	[
		"2026-09-01",
		"Utilities",
		"Debit",
		"Pet Food",
		6
	],
	[
		"2026-09-01",
		"Food",
		"Debit",
		"lunch",
		1.75
	],
	[
		"2026-09-01",
		"Food",
		"Debit",
		"coffee",
		1.65
	],
	[
		"2026-08-31",
		"Food",
		"Debit",
		"coffee",
		1.65
	],
	[
		"2026-08-30",
		"Food",
		"Debit",
		"Lunch",
		25
	],
	[
		"2026-08-30",
		"Transportation",
		"Credit",
		"Gasoline Prius",
		10.9
	],
	[
		"2026-08-30",
		"Transportation",
		"Credit",
		"Prius Gasoline",
		10.9
	],
	[
		"2026-08-30",
		"Food",
		"Debit",
		"breakfast x 2",
		4
	],
	[
		"2026-08-30",
		"Food",
		"Debit",
		"Coffee",
		1
	],
	[
		"2026-08-29",
		"Food",
		"Credit",
		"dinner ramen",
		11.86
	],
	[
		"2026-08-28",
		"Food",
		"Debit",
		"ជ្រូកខ្វៃ 0.7kg",
		8.65
	],
	[
		"2026-08-28",
		"Food",
		"Debit",
		"coffee",
		1.65
	],
	[
		"2026-08-27",
		"Utilities",
		"Debit",
		"Topup Metfone",
		4
	],
	[
		"2026-08-27",
		"Food",
		"Debit",
		"coffee",
		1.65
	],
	[
		"2026-08-26",
		"Transportation",
		"Credit",
		"Gasoline Prius",
		10.9
	],
	[
		"2026-08-26",
		"Food",
		"Debit",
		"coffee",
		1.65
	],
	[
		"2026-08-25",
		"Food",
		"Debit",
		"dinner at theSides",
		13.75
	],
	[
		"2026-08-25",
		"Transportation",
		"Debit",
		"Gasoline Zoomer",
		3.25
	],
	[
		"2026-08-25",
		"Food",
		"Debit",
		"Coffee",
		1.65
	],
	[
		"2026-08-24",
		"Food",
		"Debit",
		"Grocery at Bayon",
		16.85
	],
	[
		"2026-08-24",
		"Food",
		"Debit",
		"lunch",
		6.5
	],
	[
		"2026-08-24",
		"Food",
		"Debit",
		"coffee",
		1.65
	],
	[
		"2026-08-23",
		"Personal Spending",
		"Debit",
		"Adidas alpha bounce 2nd hand",
		36
	],
	[
		"2026-08-22",
		"Food",
		"Debit",
		"Soup maras",
		20
	],
	[
		"2026-08-22",
		"Food",
		"Debit",
		"Paris baguette",
		3
	],
	[
		"2026-08-21",
		"Utilities",
		"Debit",
		"Fruit for Offering",
		8
	],
	[
		"2026-08-21",
		"Transportation",
		"Debit",
		"FTR Gasoline",
		3.05
	],
	[
		"2026-08-21",
		"Food",
		"Debit",
		"coffee",
		1.65
	],
	[
		"2026-08-20",
		"Personal Spending",
		"Debit",
		"Rith’s Son",
		50
	],
	[
		"2026-08-20",
		"Food",
		"Debit",
		"Breakfast Kuytiv",
		2.75
	],
	[
		"2026-08-20",
		"Food",
		"Debit",
		"Coffee",
		1.65
	],
	[
		"2026-08-19",
		"Food",
		"Credit",
		"grocery at bayon",
		16.5
	],
	[
		"2026-08-19",
		"Food",
		"Debit",
		"Chicken rice",
		5
	],
	[
		"2026-08-19",
		"Food",
		"Debit",
		"Beef",
		2.5
	],
	[
		"2026-08-19",
		"Food",
		"Debit",
		"coffee",
		1.65
	],
	[
		"2026-08-18",
		"Food",
		"Debit",
		"coffee",
		1.65
	],
	[
		"2026-08-17",
		"Food",
		"Credit",
		"Dinner at aeon",
		9.1
	],
	[
		"2026-08-17",
		"Food",
		"Credit",
		"Grocery at aeon",
		4.5
	],
	[
		"2026-08-17",
		"Utilities",
		"Debit",
		"Cat Food 1kg",
		3
	],
	[
		"2026-08-17",
		"Food",
		"Debit",
		"Breakfast",
		2.25
	],
	[
		"2026-08-17",
		"Personal Spending",
		"Debit",
		"crayon IBC for elica",
		1.1
	],
	[
		"2026-08-17",
		"Food",
		"Debit",
		"Coffee",
		1
	],
	[
		"2026-08-16",
		"Personal Spending",
		"Credit",
		"Clothes Padini Elica x4",
		21.5
	],
	[
		"2026-08-16",
		"Food",
		"Debit",
		"Brown Coffee",
		12.4
	],
	[
		"2026-08-15",
		"Food",
		"Credit",
		"Breakfast at Brown",
		15.5
	],
	[
		"2026-08-14",
		"Food",
		"Debit",
		"Coffee",
		1.65
	],
	[
		"2026-08-13",
		"Transportation",
		"Debit",
		"Car Wash",
		3.75
	],
	[
		"2026-08-13",
		"Transportation",
		"Debit",
		"FTR Gasoline",
		2.8
	],
	[
		"2026-08-13",
		"Food",
		"Debit",
		"Coffee",
		1.65
	],
	[
		"2026-08-13",
		"Food",
		"Debit",
		"Breakfast",
		1.5
	],
	[
		"2026-08-12",
		"Transportation",
		"Credit",
		"Prius Gasoline 19L",
		20
	],
	[
		"2026-08-12",
		"Food",
		"Credit",
		"Grocery at Aeon 3",
		5.75
	],
	[
		"2026-08-12",
		"Food",
		"Debit",
		"coffee",
		1.65
	],
	[
		"2026-08-11",
		"Utilities",
		"Debit",
		"WC light replacement",
		3.6
	],
	[
		"2026-08-11",
		"Food",
		"Debit",
		"Coffee",
		1.65
	],
	[
		"2026-08-11",
		"Utilities",
		"Debit",
		"Top-up 017",
		1
	],
	[
		"2026-08-10",
		"Food",
		"Debit",
		"Lunch",
		2
	],
	[
		"2026-08-10",
		"Food",
		"Debit",
		"Coffee",
		1.65
	],
	[
		"2026-08-09",
		"Food",
		"Credit",
		"Breakfast at Brown",
		14.55
	],
	[
		"2026-08-09",
		"Utilities",
		"Debit",
		"Hair Cut",
		4
	],
	[
		"2026-08-09",
		"Transportation",
		"Debit",
		"Gasoline Zoomer",
		3.24
	],
	[
		"2026-08-09",
		"Food",
		"Debit",
		"Snack សូយប្រៃ",
		1.25
	],
	[
		"2026-08-08",
		"Kid",
		"Credit",
		"Elica milk + diaper",
		49
	],
	[
		"2026-08-08",
		"Food",
		"Debit",
		"Hokke Dinner Norea",
		15.96
	],
	[
		"2026-08-08",
		"Food",
		"Debit",
		"Coffee & Breakfast",
		10
	],
	[
		"2026-08-05",
		"Food",
		"Credit",
		"Aeon Grocery",
		13.63
	],
	[
		"2026-08-05",
		"Utilities",
		"Debit",
		"EDC",
		3.45
	],
	[
		"2026-08-05",
		"Transportation",
		"Debit",
		"FTR Gasoline",
		2.67
	],
	[
		"2026-08-05",
		"Utilities",
		"Debit",
		"Waste Management",
		2.65
	],
	[
		"2026-08-05",
		"Food",
		"Debit",
		"coffee",
		1.65
	],
	[
		"2026-08-04",
		"Food",
		"Debit",
		"coffee",
		1.65
	],
	[
		"2026-08-04",
		"Food",
		"Debit",
		"lunch",
		1.5
	],
	[
		"2026-08-03",
		"Food",
		"Debit",
		"Dinner Dimini Pizza",
		5.5
	],
	[
		"2026-08-03",
		"Food",
		"Debit",
		"coffee",
		1.65
	],
	[
		"2026-08-03",
		"Food",
		"Debit",
		"breakfast",
		1.25
	],
	[
		"2026-08-02",
		"Kid",
		"Debit",
		"Elica Milk",
		38
	],
	[
		"2026-08-02",
		"Food",
		"Debit",
		"googi at norea",
		9.5
	],
	[
		"2026-08-02",
		"Food",
		"Debit",
		"Coffee + Breakfast",
		6.5
	],
	[
		"2026-08-01",
		"Food",
		"Debit",
		"Dinner pasta corner",
		8
	],
	[
		"2026-08-01",
		"Food",
		"Debit",
		"Coffee breakfast",
		2
	],
	[
		"2026-08-01",
		"Food",
		"Debit",
		"Lunch",
		2
	],
	[
		"2026-07-31",
		"Kid",
		"Debit",
		"Elica Sticker $5 + dlivery $.165",
		6.65
	],
	[
		"2026-07-31",
		"Food",
		"Debit",
		"Aeon grocery",
		4.7
	],
	[
		"2026-07-31",
		"Food",
		"Debit",
		"coffee",
		1.65
	],
	[
		"2026-07-30",
		"Food",
		"Debit",
		"coffee + nompao",
		2.25
	],
	[
		"2026-07-29",
		"Transportation",
		"Debit",
		"FTR Gasoline",
		2.81
	],
	[
		"2026-07-29",
		"Food",
		"Debit",
		"coffee",
		1.65
	],
	[
		"2026-07-28",
		"Food",
		"Debit",
		"coffee",
		1.65
	],
	[
		"2026-07-27",
		"Food",
		"Credit",
		"Grocery at Bayon",
		11.7
	],
	[
		"2026-07-27",
		"Food",
		"Debit",
		"Coffee",
		1.65
	],
	[
		"2026-07-26",
		"Food",
		"Debit",
		"Charlies Burger",
		4.5
	],
	[
		"2026-07-26",
		"Food",
		"Debit",
		"Coffee",
		2
	],
	[
		"2026-07-25",
		"Food",
		"Debit",
		"Coffee",
		1
	],
	[
		"2026-07-24",
		"Food",
		"Credit",
		"Soerae at Aeon",
		15
	],
	[
		"2026-07-23",
		"Food",
		"Debit",
		"coffee",
		1.65
	],
	[
		"2026-07-22",
		"Food",
		"Debit",
		"Coffee",
		1.65
	],
	[
		"2026-07-21",
		"Kid",
		"Credit",
		"Aptamilk 1pcs, a2 12pcs",
		76.3
	],
	[
		"2026-07-21",
		"Transportation",
		"Credit",
		"Prius Gasline",
		21
	],
	[
		"2026-07-21",
		"Food",
		"Debit",
		"Smile Mart",
		5
	],
	[
		"2026-07-21",
		"Transportation",
		"Debit",
		"FTR Gasoline",
		3
	],
	[
		"2026-07-21",
		"Food",
		"Debit",
		"Dinner at Marugame",
		2.6
	],
	[
		"2026-07-21",
		"Food",
		"Debit",
		"Coffee",
		1.65
	],
	[
		"2026-07-20",
		"Personal Spending",
		"Debit",
		"Shipping Taobao",
		4
	],
	[
		"2026-07-20",
		"Food",
		"Debit",
		"coffee",
		1.65
	],
	[
		"2026-07-19",
		"Food",
		"Credit",
		"Ramen at Aeon",
		17.6
	],
	[
		"2026-07-18",
		"Food",
		"Debit",
		"Dinner at ViewPark",
		20
	],
	[
		"2026-07-18",
		"Food",
		"Debit",
		"Burger King",
		4.74
	],
	[
		"2026-07-18",
		"Food",
		"Debit",
		"Coffee",
		1
	],
	[
		"2026-07-17",
		"Personal Spending",
		"Credit",
		"Lyly’s running shoes",
		14.5
	],
	[
		"2026-07-17",
		"Kid",
		"Credit",
		"ElicaToys",
		7.86
	],
	[
		"2026-07-17",
		"Food",
		"Credit",
		"Dinner at RingerHut",
		5.7
	],
	[
		"2026-07-17",
		"Food",
		"Debit",
		"Coffee",
		1.65
	],
	[
		"2026-07-16",
		"Food",
		"Debit",
		"Coffee",
		1.65
	],
	[
		"2026-07-15",
		"Food",
		"Credit",
		"Dinner at uratei",
		16.75
	],
	[
		"2026-07-15",
		"Food",
		"Debit",
		"Coffee + Chakwai",
		2
	],
	[
		"2026-07-14",
		"Utilities",
		"Debit",
		"Fruit Offering",
		5
	],
	[
		"2026-07-14",
		"Personal Spending",
		"Debit",
		"Taobao Shpping 1.99kg",
		4
	],
	[
		"2026-07-14",
		"Transportation",
		"Debit",
		"FTR Gasoline",
		2.85
	],
	[
		"2026-07-14",
		"Utilities",
		"Debit",
		"Public Service Renew ID KH",
		2.5
	],
	[
		"2026-07-14",
		"Food",
		"Debit",
		"Lunch",
		1.5
	],
	[
		"2026-07-14",
		"Utilities",
		"Debit",
		"PPWSA",
		1
	],
	[
		"2026-07-13",
		"Food",
		"Debit",
		"Coffee",
		1.68
	],
	[
		"2026-07-12",
		"Food",
		"Debit",
		"Domino Pizza",
		5.5
	],
	[
		"2026-07-12",
		"Kid",
		"Debit",
		"Eka Shampoo",
		4
	],
	[
		"2026-07-12",
		"Food",
		"Debit",
		"Lunch at ChipMong",
		3
	],
	[
		"2026-07-12",
		"Food",
		"Debit",
		"Coffee x 2pcs",
		1.84
	],
	[
		"2026-07-11",
		"Food",
		"Debit",
		"Grocery Aeon",
		4.65
	],
	[
		"2026-07-11",
		"Food",
		"Debit",
		"BreadTalk x 2",
		3.12
	],
	[
		"2026-07-11",
		"Food",
		"Debit",
		"Sandwich",
		1.28
	],
	[
		"2026-07-11",
		"Food",
		"Debit",
		"Coffee",
		1
	],
	[
		"2026-07-10",
		"Personal Spending",
		"Credit",
		"Taobao item 300 yuan",
		45
	],
	[
		"2026-07-10",
		"Food",
		"Debit",
		"Breakfast",
		2.5
	],
	[
		"2026-07-10",
		"Food",
		"Debit",
		"Coffee",
		1
	],
	[
		"2026-07-09",
		"Food",
		"Debit",
		"Grilled Beef",
		5
	],
	[
		"2026-07-09",
		"Food",
		"Debit",
		"Coffee l",
		1.65
	],
	[
		"2026-07-08",
		"Food",
		"Debit",
		"Cake",
		2.75
	],
	[
		"2026-07-08",
		"Food",
		"Debit",
		"Coffee",
		1.65
	],
	[
		"2026-07-07",
		"Food",
		"Debit",
		"Dinner Mu-In",
		7.3
	],
	[
		"2026-07-07",
		"Food",
		"Debit",
		"Coffee",
		1.42
	],
	[
		"2026-07-06",
		"Kid",
		"Credit",
		"Elica Milk",
		52.5
	],
	[
		"2026-07-06",
		"Food",
		"Credit",
		"Aeon Grocery",
		8.57
	],
	[
		"2026-07-06",
		"Transportation",
		"Debit",
		"FTR Gasoline 2.88L",
		2.88
	],
	[
		"2026-07-06",
		"Food",
		"Debit",
		"Coffee",
		1.65
	],
	[
		"2026-07-05",
		"Food",
		"Credit",
		"Dinner Marugame",
		13.7
	],
	[
		"2026-07-04",
		"Food",
		"Debit",
		"Breakfast + lunch",
		12.5
	],
	[
		"2026-07-04",
		"Utilities",
		"Debit",
		"Cat Food",
		11.5
	],
	[
		"2026-07-04",
		"Food",
		"Credit",
		"Ringerhut x 2 aeon3",
		10.41
	],
	[
		"2026-07-04",
		"Utilities",
		"Debit",
		"Hair Cut",
		4
	],
	[
		"2026-07-04",
		"Utilities",
		"Debit",
		"EDC",
		4
	],
	[
		"2026-07-04",
		"Utilities",
		"Debit",
		"Waste Management",
		2.65
	],
	[
		"2026-07-03",
		"Food",
		"Debit",
		"Coffee + Breakfast",
		2
	],
	[
		"2026-07-02",
		"Food",
		"Debit",
		"Coffee",
		1.65
	],
	[
		"2026-07-01",
		"Food",
		"Debit",
		"Emart24",
		4
	],
	[
		"2026-07-01",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		2.5
	],
	[
		"2026-06-30",
		"Food",
		"Debit",
		"breakfast + coffee",
		3.5
	],
	[
		"2026-06-30",
		"Food",
		"Debit",
		"Lunch",
		1.5
	],
	[
		"2026-06-29",
		"Food",
		"Debit",
		"Dinner Pasta Corner",
		11.25
	],
	[
		"2026-06-29",
		"Food",
		"Debit",
		"Beef grilled",
		4
	],
	[
		"2026-06-29",
		"Food",
		"Debit",
		"Lunch",
		2
	],
	[
		"2026-06-29",
		"Transportation",
		"Debit",
		"Tuktuk from CNX to PsarTmey",
		1.25
	],
	[
		"2026-06-29",
		"Food",
		"Debit",
		"Coffee + Breakfast",
		1
	],
	[
		"2026-06-28",
		"Transportation",
		"Credit",
		"Gasoline Prius 25L",
		27
	],
	[
		"2026-06-28",
		"Food",
		"Debit",
		"Marugame Udon x3",
		10
	],
	[
		"2026-06-27",
		"Food",
		"Debit",
		"Durian",
		15
	],
	[
		"2026-06-26",
		"Transportation",
		"Debit",
		"Gasoline Zoomer",
		2
	],
	[
		"2026-06-26",
		"Food",
		"Debit",
		"Toi Latte",
		.65
	],
	[
		"2026-06-25",
		"Food",
		"Credit",
		"Grocery Aeon",
		19
	],
	[
		"2026-06-25",
		"Personal Spending",
		"Debit",
		"Company Party",
		10
	],
	[
		"2026-06-25",
		"Transportation",
		"Debit",
		"Gasoline FTR 2L",
		2.16
	],
	[
		"2026-06-25",
		"Food",
		"Debit",
		"Toi Latte",
		.65
	],
	[
		"2026-06-23",
		"Food",
		"Debit",
		"Lunch",
		2
	],
	[
		"2026-06-23",
		"Food",
		"Debit",
		"Toi Latte",
		.65
	],
	[
		"2026-06-22",
		"Food",
		"Debit",
		"Dinner x 2",
		4
	],
	[
		"2026-06-21",
		"Food",
		"Credit",
		"genki sushi",
		10
	],
	[
		"2026-06-19",
		"Food",
		"Debit",
		"Burger + wrap",
		8
	],
	[
		"2026-06-19",
		"Food",
		"Debit",
		"Lunch",
		3
	],
	[
		"2026-06-19",
		"Food",
		"Debit",
		"Coffee",
		1.65
	],
	[
		"2026-06-18",
		"Food",
		"Debit",
		"Breakfast x 2",
		5
	],
	[
		"2026-06-18",
		"Food",
		"Debit",
		"Coffee",
		1
	],
	[
		"2026-06-17",
		"Food",
		"Debit",
		"Beef grill",
		4.25
	],
	[
		"2026-06-17",
		"Food",
		"Debit",
		"Coffee",
		1.65
	],
	[
		"2026-06-16",
		"Food",
		"Debit",
		"Coffee",
		1.65
	],
	[
		"2026-06-15",
		"Kid",
		"Credit",
		"Elica milk",
		77.76
	],
	[
		"2026-06-15",
		"Food",
		"Debit",
		"Durain 2.5kg",
		18.25
	],
	[
		"2026-06-15",
		"Food",
		"Debit",
		"Coffee",
		1
	],
	[
		"2026-06-14",
		"Food",
		"Debit",
		"Lunch Ed’s Streak",
		12.3
	],
	[
		"2026-06-14",
		"Food",
		"Debit",
		"Pizza x 2 set",
		10.65
	],
	[
		"2026-06-14",
		"Transportation",
		"Debit",
		"Car wash",
		3.75
	],
	[
		"2026-06-14",
		"Food",
		"Debit",
		"Coffee x 2 pcs",
		2
	],
	[
		"2026-06-14",
		"Food",
		"Debit",
		"Twin Passion",
		1.75
	],
	[
		"2026-06-13",
		"Food",
		"Credit",
		"Dinner Buffet Ichiban 14.5$",
		31.9
	],
	[
		"2026-06-13",
		"Personal Spending",
		"Credit",
		"MR DIY shelf + flash 32GB",
		8.4
	],
	[
		"2026-06-12",
		"Personal Spending",
		"Debit",
		"Taobao Shipping Cost 5kg",
		11.57
	],
	[
		"2026-06-12",
		"Food",
		"Debit",
		"Pizza",
		6
	],
	[
		"2026-06-12",
		"Food",
		"Debit",
		"beef dinner",
		5
	],
	[
		"2026-06-12",
		"Food",
		"Debit",
		"Coffee",
		1.65
	],
	[
		"2026-06-11",
		"Food",
		"Credit",
		"Grocery at AEON 3",
		7.45
	],
	[
		"2026-06-11",
		"Utilities",
		"Debit",
		"Cat Food + Cream",
		4.5
	],
	[
		"2026-06-11",
		"Transportation",
		"Debit",
		"Gasoline Zoomers",
		3.25
	],
	[
		"2026-06-11",
		"Food",
		"Debit",
		"Coffee",
		1.65
	],
	[
		"2026-06-11",
		"Utilities",
		"Debit",
		"Metfone 1.5$ 7Day",
		1.5
	],
	[
		"2026-06-10",
		"Personal Spending",
		"Credit",
		"Earphone + Elica Toy",
		20.66
	],
	[
		"2026-06-10",
		"Food",
		"Debit",
		"Coffee",
		1.42
	],
	[
		"2026-06-09",
		"Kid",
		"Credit",
		"Elica Milk & Food",
		44.5
	],
	[
		"2026-06-09",
		"Utilities",
		"Debit",
		"EDC",
		5
	],
	[
		"2026-06-09",
		"Food",
		"Credit",
		"Grocery at AEON",
		5
	],
	[
		"2026-06-09",
		"Utilities",
		"Debit",
		"EWP - Waste Management",
		2.5
	],
	[
		"2026-06-09",
		"Food",
		"Debit",
		"Coffee",
		1.65
	],
	[
		"2026-06-08",
		"Personal Spending",
		"Credit",
		"Taobao Items",
		70
	],
	[
		"2026-06-08",
		"Food",
		"Debit",
		"Coffee",
		1.45
	],
	[
		"2026-06-07",
		"Transportation",
		"Credit",
		"Prius Gasoline 28L",
		34
	],
	[
		"2026-06-07",
		"Food",
		"Debit",
		"Pizza x Spagetti",
		8.4
	],
	[
		"2026-06-07",
		"Personal Spending",
		"Credit",
		"Frying pan 20cm",
		4.95
	],
	[
		"2026-06-07",
		"Food",
		"Debit",
		"Dinner + ice cream",
		3
	],
	[
		"2026-06-06",
		"Prius 2012",
		"Debit",
		"Brake Fluid 1L + Labour 15$",
		20.5
	],
	[
		"2026-06-06",
		"Food",
		"Debit",
		"Lunch at Noroland",
		6
	],
	[
		"2026-06-06",
		"Food",
		"Debit",
		"Breakfast",
		5
	],
	[
		"2026-06-06",
		"Food",
		"Debit",
		"Coffee",
		1
	],
	[
		"2026-06-05",
		"Utilities",
		"Debit",
		"Cat Food",
		3.88
	],
	[
		"2026-06-05",
		"Food",
		"Debit",
		"Dinner",
		3.5
	],
	[
		"2026-06-05",
		"Food",
		"Debit",
		"Lunch",
		1.75
	],
	[
		"2026-06-05",
		"Food",
		"Debit",
		"Coffee",
		1.65
	],
	[
		"2026-06-04",
		"Food",
		"Credit",
		"Grocery at Aeon",
		9.72
	],
	[
		"2026-06-04",
		"Transportation",
		"Debit",
		"Zoomer Gasoline 3L",
		3.62
	],
	[
		"2026-06-04",
		"Food",
		"Debit",
		"Coffee",
		1.65
	],
	[
		"2026-06-04",
		"Food",
		"Debit",
		"Lunch",
		1.5
	],
	[
		"2026-06-03",
		"Personal Spending",
		"Credit",
		"Clothes",
		15.42
	],
	[
		"2026-06-03",
		"Food",
		"Debit",
		"Coffee",
		1.75
	],
	[
		"2026-06-02",
		"Food",
		"Credit",
		"Grocery at Aeon",
		12.24
	],
	[
		"2026-06-02",
		"Food",
		"Debit",
		"Coffee",
		1.75
	],
	[
		"2026-06-01",
		"Utilities",
		"Debit",
		"AC Cleaning Serivce",
		25
	],
	[
		"2026-06-01",
		"Food",
		"Debit",
		"Lucnh Newyork Streak",
		6
	],
	[
		"2026-06-01",
		"Food",
		"Debit",
		"Coffee + Breakfast",
		2.5
	],
	[
		"2026-05-31",
		"Utilities",
		"Debit",
		"Zoomer Tire Replacement",
		22
	],
	[
		"2026-05-31",
		"Food",
		"Debit",
		"Dinner at Aeon",
		11
	],
	[
		"2026-05-31",
		"Food",
		"Credit",
		"Grocery at Aeon",
		6.6
	],
	[
		"2026-05-31",
		"Utilities",
		"Debit",
		"Hair Cut",
		5
	],
	[
		"2026-05-31",
		"Food",
		"Debit",
		"Coffee",
		1
	],
	[
		"2026-05-30",
		"Kid",
		"Credit",
		"Elia milk",
		47.7
	],
	[
		"2026-05-30",
		"Food",
		"Debit",
		"Fruit Durain 2Kg",
		12.89
	],
	[
		"2026-05-29",
		"Food",
		"Debit",
		"Lunch",
		1.75
	],
	[
		"2026-05-29",
		"Food",
		"Debit",
		"Coffee",
		1.5
	],
	[
		"2026-05-28",
		"Food",
		"Debit",
		"Buying Durain 1.7kg",
		11
	],
	[
		"2026-05-28",
		"Food",
		"Debit",
		"Lunch",
		1.75
	],
	[
		"2026-05-28",
		"Food",
		"Debit",
		"Coffee",
		1.5
	],
	[
		"2026-05-27",
		"Food",
		"Credit",
		"Grocery at AEON",
		9.18
	],
	[
		"2026-05-27",
		"Food",
		"Debit",
		"Lunch",
		1.75
	],
	[
		"2026-05-27",
		"Food",
		"Debit",
		"Coffee",
		1.5
	],
	[
		"2026-05-26",
		"Personal Spending",
		"Credit",
		"Elica Clothes and other",
		32.24
	],
	[
		"2026-05-26",
		"Food",
		"Credit",
		"Aeon Grocery",
		9.5
	],
	[
		"2026-05-26",
		"Food",
		"Debit",
		"Lunch",
		1.75
	],
	[
		"2026-05-26",
		"Food",
		"Debit",
		"Coffee",
		1.5
	],
	[
		"2026-05-25",
		"Food",
		"Debit",
		"Coffee",
		1.5
	],
	[
		"2026-05-24",
		"Transportation",
		"Credit",
		"Prius Gasoline 29L",
		38
	],
	[
		"2026-05-24",
		"Food",
		"Debit",
		"Lunch at Tmor rong",
		20
	],
	[
		"2026-05-24",
		"Food",
		"Debit",
		"Dinner Pizza",
		10
	],
	[
		"2026-05-23",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		15
	],
	[
		"2026-05-23",
		"Food",
		"Debit",
		"Beef Soup",
		7.5
	],
	[
		"2026-05-22",
		"Food",
		"Debit",
		"Lunch",
		1.75
	],
	[
		"2026-05-22",
		"Food",
		"Debit",
		"Coffee",
		1.5
	],
	[
		"2026-05-21",
		"Food",
		"Debit",
		"Dinner Spegatti",
		10
	],
	[
		"2026-05-21",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		2.5
	],
	[
		"2026-05-20",
		"Food",
		"Debit",
		"Dinner pizza",
		5
	],
	[
		"2026-05-20",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		3
	],
	[
		"2026-05-20",
		"Food",
		"Debit",
		"Lunch",
		1.75
	],
	[
		"2026-05-19",
		"Kid",
		"Credit",
		"Elica Milk",
		44.4
	],
	[
		"2026-05-19",
		"Food",
		"Debit",
		"Lunch",
		1.75
	],
	[
		"2026-05-19",
		"Food",
		"Debit",
		"Coffee",
		1.5
	],
	[
		"2026-05-18",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		3
	],
	[
		"2026-05-18",
		"Utilities",
		"Debit",
		"PPSWA - May",
		2.5
	],
	[
		"2026-05-18",
		"Food",
		"Debit",
		"Grocery at Bayon Market",
		1.85
	],
	[
		"2026-05-18",
		"Food",
		"Debit",
		"Lunch",
		1.75
	],
	[
		"2026-05-17",
		"Transportation",
		"Credit",
		"Prius Gasoline 23L",
		30
	],
	[
		"2026-05-14",
		"Transportation",
		"Credit",
		"Prius Gasoline 23L",
		30
	],
	[
		"2026-05-13",
		"Prius 2012",
		"Debit",
		"EGRR Cleaning CA Garage",
		45
	],
	[
		"2026-05-13",
		"Food",
		"Credit",
		"Lunch at MoMo",
		19.8
	],
	[
		"2026-05-13",
		"Personal Spending",
		"Debit",
		"Renew ID Public service fee",
		10
	],
	[
		"2026-05-13",
		"Food",
		"Debit",
		"Breakfast x 2",
		5.65
	],
	[
		"2026-05-12",
		"Prius 2012",
		"Credit",
		"OBD scanner icar pro 2s",
		20
	],
	[
		"2026-05-12",
		"Personal Spending",
		"Credit",
		"Watch batter and opener",
		2
	],
	[
		"2026-05-12",
		"Food",
		"Debit",
		"Coffee",
		1.5
	],
	[
		"2026-05-11",
		"Kid",
		"Credit",
		"Elica Milk",
		50.95
	],
	[
		"2026-05-11",
		"Food",
		"Debit",
		"Breafkast + Coffee",
		2.25
	],
	[
		"2026-05-10",
		"Food",
		"Credit",
		"Lunch at aeon",
		10.5
	],
	[
		"2026-05-10",
		"Food",
		"Debit",
		"Dinner burger x 2",
		7.5
	],
	[
		"2026-05-10",
		"Food",
		"Debit",
		"Breakfast",
		2.5
	],
	[
		"2026-05-09",
		"Food",
		"Credit",
		"Grocery at Aeon",
		9.5
	],
	[
		"2026-05-09",
		"Utilities",
		"Debit",
		"ផ្លែឈើសែនសីល",
		9
	],
	[
		"2026-05-09",
		"Food",
		"Debit",
		"Breakfast + Coffee c 2",
		8.5
	],
	[
		"2026-05-09",
		"Utilities",
		"Debit",
		"Pet Food 1KG",
		3
	],
	[
		"2026-05-09",
		"Food",
		"Debit",
		"Lunch",
		2
	],
	[
		"2026-05-08",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		3
	],
	[
		"2026-05-08",
		"Transportation",
		"Debit",
		"Gasoline FTR",
		3
	],
	[
		"2026-05-07",
		"Utilities",
		"Debit",
		"EDC ChbarAmpov",
		3.6
	],
	[
		"2026-05-07",
		"Utilities",
		"Debit",
		"Waste Management",
		2.63
	],
	[
		"2026-05-07",
		"Food",
		"Debit",
		"Coffee",
		1.5
	],
	[
		"2026-05-06",
		"Food",
		"Credit",
		"Grocery at Aeon 3",
		7.6
	],
	[
		"2026-05-06",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		3
	],
	[
		"2026-05-05",
		"Transportation",
		"Credit",
		"Gasoline Prius 23L",
		30
	],
	[
		"2026-05-05",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		7.65
	],
	[
		"2026-05-05",
		"Food",
		"Credit",
		"Grocery at Aeon",
		6.14
	],
	[
		"2026-05-04",
		"Personal Spending",
		"Debit",
		"Shipping cost for camping cart 13kg",
		18.76
	],
	[
		"2026-05-04",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		3
	],
	[
		"2026-05-04",
		"Transportation",
		"Debit",
		"Gasoline FTR 1.5L",
		2
	],
	[
		"2026-05-03",
		"Transportation",
		"Credit",
		"Prius Gasoline 24L",
		30
	],
	[
		"2026-05-03",
		"Food",
		"Debit",
		"Crab 1.5kg",
		25
	],
	[
		"2026-05-02",
		"Prius 2012",
		"Debit",
		"TCL 0w20 4L + filter",
		36
	],
	[
		"2026-05-02",
		"Food",
		"Credit",
		"Dinner at MoMo",
		14.08
	],
	[
		"2026-05-02",
		"Food",
		"Debit",
		"Lunch",
		10
	],
	[
		"2026-05-02",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		9
	],
	[
		"2026-05-02",
		"Prius 2012",
		"Debit",
		"Engine oil replacement labour",
		7.5
	],
	[
		"2026-05-02",
		"Prius 2012",
		"Debit",
		"Prius Wiper Shampoo",
		2
	],
	[
		"2026-05-01",
		"Transportation",
		"Credit",
		"Gasoline Prius 16L",
		20
	],
	[
		"2026-04-30",
		"Personal Spending",
		"Credit",
		"Camping Cart",
		48.66
	],
	[
		"2026-04-30",
		"Food",
		"Credit",
		"Dinner at MoMo",
		18.48
	],
	[
		"2026-04-30",
		"Food",
		"Debit",
		"breakfast + coffee",
		3
	],
	[
		"2026-04-27",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		3
	],
	[
		"2026-04-25",
		"Transportation",
		"Credit",
		"Gasoline Prius 24L",
		30
	],
	[
		"2026-04-25",
		"Food",
		"Debit",
		"Coffee x 2",
		2.5
	],
	[
		"2026-04-24",
		"Food",
		"Debit",
		"Dinner Soup Wukong",
		13.84
	],
	[
		"2026-04-24",
		"Food",
		"Debit",
		"Breafast + Coffee",
		3
	],
	[
		"2026-04-24",
		"Food",
		"Debit",
		"Lunch",
		1.75
	],
	[
		"2026-04-23",
		"Food",
		"Debit",
		"Dinner Pizza Domino",
		7.69
	],
	[
		"2026-04-23",
		"Kid",
		"Debit",
		"Elica Toys",
		7
	],
	[
		"2026-04-23",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		2.5
	],
	[
		"2026-04-22",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		2.5
	],
	[
		"2026-04-21",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		2.5
	],
	[
		"2026-04-20",
		"Food",
		"Credit",
		"Dinner at MoMo",
		14.08
	],
	[
		"2026-04-19",
		"Transportation",
		"Credit",
		"Gasoline Prius 16L",
		20
	],
	[
		"2026-04-17",
		"Transportation",
		"Credit",
		"Prius Gasoline 23L",
		30
	],
	[
		"2026-04-17",
		"Transportation",
		"Credit",
		"Prius Gasoline 14L",
		20
	],
	[
		"2026-04-17",
		"Transportation",
		"Debit",
		"Koh Srac tuktuk",
		10
	],
	[
		"2026-04-17",
		"Transportation",
		"Debit",
		"Local boat round trip transportation",
		10
	],
	[
		"2026-04-16",
		"Kid",
		"Credit",
		"Elica milk",
		78
	],
	[
		"2026-04-15",
		"Transportation",
		"Credit",
		"Gasoline Prius 19.5L",
		30
	],
	[
		"2026-04-15",
		"Personal Spending",
		"Debit",
		"Toaboa Shipping Cost  12$ + 4$",
		16
	],
	[
		"2026-04-15",
		"Food",
		"Debit",
		"Breakfast + Coffee Brown",
		12.5
	],
	[
		"2026-04-13",
		"Food",
		"Credit",
		"dinner soere",
		21.9
	],
	[
		"2026-04-12",
		"Transportation",
		"Credit",
		"Gasoline Prius 23L",
		30
	],
	[
		"2026-04-10",
		"Personal Spending",
		"Credit",
		"Taobao cloth & toys",
		143.03
	],
	[
		"2026-04-10",
		"Utilities",
		"Debit",
		"Fix FTR Front Brake Disc + rear brake pads $6",
		36
	],
	[
		"2026-04-10",
		"Transportation",
		"Credit",
		"Gasoline Prius 23L",
		30
	],
	[
		"2026-04-10",
		"Utilities",
		"Debit",
		"Pet Food",
		7.28
	],
	[
		"2026-04-10",
		"Utilities",
		"Debit",
		"Hair Cut",
		5
	],
	[
		"2026-04-10",
		"Utilities",
		"Debit",
		"Metfone 071",
		4
	],
	[
		"2026-04-10",
		"Food",
		"Debit",
		"Beef Grill",
		3
	],
	[
		"2026-04-10",
		"Food",
		"Debit",
		"Breakfast",
		2.5
	],
	[
		"2026-04-10",
		"Food",
		"Debit",
		"Coffee",
		1
	],
	[
		"2026-04-09",
		"Utilities",
		"Debit",
		"Fix FTR front brake",
		6.5
	],
	[
		"2026-04-09",
		"Prius 2012",
		"Credit",
		"Mr. DIY Carplay Cable",
		4.3
	],
	[
		"2026-04-09",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		2.5
	],
	[
		"2026-04-09",
		"Food",
		"Debit",
		"Dinner",
		2.5
	],
	[
		"2026-04-09",
		"Food",
		"Debit",
		"Lunch",
		2
	],
	[
		"2026-04-08",
		"Food",
		"Credit",
		"Dinner JP Soup",
		17.81
	],
	[
		"2026-04-08",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		2.5
	],
	[
		"2026-04-07",
		"Food",
		"Debit",
		"Lunch Newyork Streak Buns",
		6
	],
	[
		"2026-04-07",
		"Food",
		"Debit",
		"Breafast + Coffee",
		2.5
	],
	[
		"2026-04-06",
		"Transportation",
		"Credit",
		"Gasoline 21L",
		30
	],
	[
		"2026-04-05",
		"Prius 2012",
		"Debit",
		"Windows Polish water drop stain cleaning",
		25
	],
	[
		"2026-04-05",
		"Food",
		"Debit",
		"Lunch at Chreav Waterfall",
		16.5
	],
	[
		"2026-04-04",
		"Kid",
		"Credit",
		"Elica Vaccine",
		107
	],
	[
		"2026-04-04",
		"Prius 2012",
		"Debit",
		"ទុយូទឹកបាញ់ចង្កៀង + ពលកម្ម $20",
		50
	],
	[
		"2026-04-04",
		"Prius 2012",
		"Debit",
		"ដូរ rear brake pad",
		35
	],
	[
		"2026-04-04",
		"Prius 2012",
		"Debit",
		"Water Stain Cleaning Kit",
		15
	],
	[
		"2026-04-03",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		2
	],
	[
		"2026-04-02",
		"Prius 2012",
		"Debit",
		"UV Prius",
		65
	],
	[
		"2026-04-02",
		"Transportation",
		"Credit",
		"Gasoline 14.5L",
		20
	],
	[
		"2026-04-02",
		"Food",
		"Debit",
		"Dinner",
		8.5
	],
	[
		"2026-04-02",
		"Utilities",
		"Debit",
		"EDC",
		5
	],
	[
		"2026-04-02",
		"Utilities",
		"Debit",
		"Waste Management",
		2.63
	],
	[
		"2026-04-01",
		"Food",
		"Credit",
		"Grocery",
		13
	],
	[
		"2026-03-29",
		"Transportation",
		"Credit",
		"Prius gasoline 24L",
		30
	],
	[
		"2026-03-28",
		"Prius 2012",
		"Debit",
		"Deep clean interior & engine bay",
		50
	],
	[
		"2026-03-28",
		"Prius 2012",
		"Debit",
		"Polish",
		30
	],
	[
		"2026-03-28",
		"Personal Spending",
		"Debit",
		"External HDD 500GB",
		25
	],
	[
		"2026-03-19",
		"Prius 2012",
		"Debit",
		"ផ្លាកលេខវែង + ឆៀកឡាន",
		205
	],
	[
		"2026-03-19",
		"Prius 2012",
		"Debit",
		"Balancing ធ្លឹងកង់",
		20
	],
	[
		"2026-03-19",
		"Food",
		"Credit",
		"Lunch",
		15.9
	],
	[
		"2026-03-18",
		"Prius 2012",
		"Debit",
		"Car Mechanic service + AC Gas fill ($25)",
		75
	],
	[
		"2026-03-18",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		2.5
	],
	[
		"2026-03-16",
		"Prius 2012",
		"Debit",
		"AC filter",
		4
	],
	[
		"2026-03-15",
		"Prius 2012",
		"Debit",
		"Coolant 4L x 2",
		32
	],
	[
		"2026-03-15",
		"Prius 2012",
		"Debit",
		"ជាងភ្លើង",
		25
	],
	[
		"2026-03-15",
		"Food",
		"Debit",
		"Dinner - Genski",
		13
	],
	[
		"2026-03-15",
		"Transportation",
		"Debit",
		"Zoomers Engine Oil",
		12
	],
	[
		"2026-03-15",
		"Prius 2012",
		"Debit",
		"ជ័រទប់ម៉ាស៊ីនជិតកង់មុខ x 2",
		10
	],
	[
		"2026-03-15",
		"Transportation",
		"Debit",
		"Zoomers Air Engine filter",
		8
	],
	[
		"2026-03-15",
		"Food",
		"Debit",
		"Breakfast x 2",
		5
	],
	[
		"2026-03-15",
		"Transportation",
		"Debit",
		"Zoomer Gasoline",
		3.8
	],
	[
		"2026-03-15",
		"Food",
		"Debit",
		"Coffee",
		3
	],
	[
		"2026-03-15",
		"Prius 2012",
		"Debit",
		"windshield washing detergent",
		2
	],
	[
		"2026-03-14",
		"Food",
		"Debit",
		"Dinner - Homy Yummy",
		18
	],
	[
		"2026-03-14",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		6
	],
	[
		"2026-03-14",
		"Utilities",
		"Debit",
		"PPSWA Water Supply",
		1.25
	],
	[
		"2026-03-13",
		"Prius 2012",
		"Debit",
		"ជាងថ្នាំ",
		330
	],
	[
		"2026-03-13",
		"Prius 2012",
		"Debit",
		"ជាងតោន",
		200
	],
	[
		"2026-03-12",
		"Prius 2012",
		"Debit",
		"ដែកធ្នឹមមុខសរ + ដែកអុយ, ប្រឡាំងដាស់ម៉ាសុីន + កាង , សារ៉ែន, ជ័រទប់ខ្យល់សងខាង, ជ័រធ្នឹមមុខ",
		90
	],
	[
		"2026-03-12",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		2
	],
	[
		"2026-03-11",
		"Prius 2012",
		"Credit",
		"Fog Headlight H11 LED, Car Cusion, Key Cover, Dash Cover",
		103
	],
	[
		"2026-03-11",
		"Transportation",
		"Debit",
		"Zoomers Gasoline",
		3.4
	],
	[
		"2026-03-11",
		"Food",
		"Debit",
		"Breakfast",
		2.5
	],
	[
		"2026-03-11",
		"Food",
		"Debit",
		"Dinner x 2",
		2.5
	],
	[
		"2026-03-11",
		"Food",
		"Debit",
		"Coffee",
		1.5
	],
	[
		"2026-03-10",
		"Food",
		"Debit",
		"Dinner",
		12.5
	],
	[
		"2026-03-10",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		2.5
	],
	[
		"2026-03-09",
		"Prius 2012",
		"Debit",
		"Prius 2012 - Left Headlight + Front Bumper Set + Logo ក្បាលគោ",
		600
	],
	[
		"2026-03-09",
		"Prius 2012",
		"Debit",
		"Prius 2012 Spare Parts - Front Collosion",
		275
	],
	[
		"2026-03-08",
		"Prius 2012",
		"Debit",
		"Prius 2012 Five Trim Advance Techonology - Front Collosion US Import",
		17200
	],
	[
		"2026-03-08",
		"Prius 2012",
		"Debit",
		"Prius - Pre-Inspection Fee",
		40
	],
	[
		"2026-03-08",
		"Prius 2012",
		"Debit",
		"Towing Fee from Psar Lan to Garage",
		20
	],
	[
		"2026-03-07",
		"Food",
		"Credit",
		"Lunc x 2",
		17.75
	],
	[
		"2026-03-07",
		"Food",
		"Debit",
		"Breakfast",
		12.5
	],
	[
		"2026-03-07",
		"Food",
		"Debit",
		"Elica Milk",
		11.5
	],
	[
		"2026-03-07",
		"Food",
		"Debit",
		"Dinner",
		11
	],
	[
		"2026-03-07",
		"Utilities",
		"Debit",
		"EDC",
		5.4
	],
	[
		"2026-03-07",
		"Utilities",
		"Debit",
		"Waste Management",
		2.63
	],
	[
		"2026-03-07",
		"Food",
		"Debit",
		"Coffee x 2",
		2
	],
	[
		"2026-03-06",
		"Prius 2012",
		"Credit",
		"Spark Plug, TPE Car Mats",
		80
	],
	[
		"2026-02-27",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		2.5
	],
	[
		"2026-02-26",
		"Food",
		"Debit",
		"Dinner",
		10
	],
	[
		"2026-02-26",
		"Food",
		"Debit",
		"Lunch",
		1.5
	],
	[
		"2026-02-26",
		"Food",
		"Debit",
		"Breakfast",
		1.25
	],
	[
		"2026-02-26",
		"Food",
		"Debit",
		"Coffee",
		1
	],
	[
		"2026-02-25",
		"Food",
		"Debit",
		"Dinner",
		6.5
	],
	[
		"2026-02-25",
		"Food",
		"Debit",
		"Coffee Afternoon",
		5.25
	],
	[
		"2026-02-25",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		2.5
	],
	[
		"2026-02-25",
		"Food",
		"Debit",
		"Lunch",
		1.75
	],
	[
		"2026-02-24",
		"Transportation",
		"Debit",
		"Gasoline - Prius",
		5
	],
	[
		"2026-02-24",
		"Food",
		"Debit",
		"Breakfast",
		1
	],
	[
		"2026-02-23",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		2.5
	],
	[
		"2026-02-22",
		"Food",
		"Debit",
		"Lunch + Dinner",
		3
	],
	[
		"2026-02-22",
		"Food",
		"Debit",
		"Breakfast",
		2.5
	],
	[
		"2026-02-22",
		"Food",
		"Debit",
		"Coffee",
		1.5
	],
	[
		"2026-02-21",
		"Food",
		"Debit",
		"Dinner Ramen TTP",
		10
	],
	[
		"2026-02-21",
		"Transportation",
		"Debit",
		"Gasoline FTR",
		2.66
	],
	[
		"2026-02-20",
		"Food",
		"Debit",
		"Breakfast",
		.5
	],
	[
		"2026-02-19",
		"Food",
		"Credit",
		"Dinner Buffeet",
		22.49
	],
	[
		"2026-02-19",
		"Transportation",
		"Credit",
		"Gasoline - Prius",
		10
	],
	[
		"2026-02-19",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		2.25
	],
	[
		"2026-02-17",
		"Kid",
		"Debit",
		"CNY Ang Pao",
		100
	],
	[
		"2026-02-17",
		"Food",
		"Credit",
		"Breakfast + Coffee",
		17.5
	],
	[
		"2026-02-17",
		"Transportation",
		"Credit",
		"Gasoline - Prius",
		13
	],
	[
		"2026-02-16",
		"Food",
		"Credit",
		"Grocery",
		17.5
	],
	[
		"2026-02-15",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		9.75
	],
	[
		"2026-02-14",
		"Food",
		"Credit",
		"dinner pizza company",
		23.2
	],
	[
		"2026-02-14",
		"Food",
		"Debit",
		"brwakfast",
		5
	],
	[
		"2026-02-14",
		"Food",
		"Debit",
		"Coffee",
		2.43
	],
	[
		"2026-02-13",
		"Utilities",
		"Debit",
		"Cellcard Time to rise",
		1
	],
	[
		"2026-02-12",
		"Kid",
		"Debit",
		"Elica Car Toy",
		5
	],
	[
		"2026-02-12",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		2.5
	],
	[
		"2026-02-12",
		"Food",
		"Debit",
		"Lunch Kabab",
		2.5
	],
	[
		"2026-02-12",
		"Kid",
		"Debit",
		"Elica toy",
		1.2
	],
	[
		"2026-02-11",
		"Utilities",
		"Debit",
		"Internet connection",
		100
	],
	[
		"2026-02-11",
		"Transportation",
		"Credit",
		"Gasoline - Prius",
		10
	],
	[
		"2026-02-11",
		"Transportation",
		"Debit",
		"Gasoline - FTR",
		3.69
	],
	[
		"2026-02-11",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		2.25
	],
	[
		"2026-02-09",
		"Food",
		"Credit",
		"Dinner",
		21.12
	],
	[
		"2026-02-09",
		"Food",
		"Debit",
		"Coffee",
		1.34
	],
	[
		"2026-02-08",
		"Kid",
		"Debit",
		"Kids Milk",
		50
	],
	[
		"2026-02-08",
		"Food",
		"Debit",
		"Lunch",
		12.4
	],
	[
		"2026-02-08",
		"Personal Spending",
		"Debit",
		"Mr. DIY",
		6.8
	],
	[
		"2026-02-08",
		"Utilities",
		"Debit",
		"Metfone 6$",
		6
	],
	[
		"2026-02-07",
		"Food",
		"Credit",
		"Dinner - Soerae",
		15
	],
	[
		"2026-02-07",
		"Transportation",
		"Credit",
		"Gasoline - Prius",
		11
	],
	[
		"2026-02-07",
		"Food",
		"Debit",
		"Pet Food",
		4.45
	],
	[
		"2026-02-07",
		"Food",
		"Debit",
		"Coffee Bean Embassy",
		3.5
	],
	[
		"2026-02-07",
		"Food",
		"Debit",
		"Lunch - Pho",
		2.5
	],
	[
		"2026-02-06",
		"Food",
		"Debit",
		"Dinner",
		10.38
	],
	[
		"2026-02-06",
		"Utilities",
		"Debit",
		"EDC",
		9.7
	],
	[
		"2026-02-06",
		"Utilities",
		"Debit",
		"Waste Management",
		2.63
	],
	[
		"2026-02-06",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		2.25
	],
	[
		"2026-02-05",
		"Food",
		"Debit",
		"Grocery",
		10.75
	],
	[
		"2026-02-05",
		"Food",
		"Debit",
		"Lunch",
		2.5
	],
	[
		"2026-02-05",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		2.25
	],
	[
		"2026-02-04",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		2.25
	],
	[
		"2026-02-03",
		"Kid",
		"Debit",
		"Kid Diaper",
		20
	],
	[
		"2026-02-03",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		2.25
	],
	[
		"2026-02-03",
		"Transportation",
		"Debit",
		"Gasoline Zoomers",
		2
	],
	[
		"2026-02-02",
		"Transportation",
		"Debit",
		"New Plate Service",
		190
	],
	[
		"2026-02-02",
		"Food",
		"Debit",
		"Lunch",
		15
	],
	[
		"2026-02-02",
		"Food",
		"Debit",
		"Fruit Offering",
		10
	],
	[
		"2026-02-02",
		"Food",
		"Debit",
		"Dinner",
		4.5
	],
	[
		"2026-02-01",
		"Transportation",
		"Debit",
		"Gasoline Prius",
		12
	],
	[
		"2026-02-01",
		"Food",
		"Debit",
		"Grocery",
		10
	],
	[
		"2026-02-01",
		"Kid",
		"Debit",
		"Shoes Elica 2 pairs",
		8
	],
	[
		"2026-02-01",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		7
	],
	[
		"2026-01-31",
		"Food",
		"Debit",
		"Coffee",
		1.5
	],
	[
		"2026-01-30",
		"Kid",
		"Debit",
		"Kid Medical",
		23.3
	],
	[
		"2026-01-30",
		"Food",
		"Debit",
		"Dinner",
		5
	],
	[
		"2026-01-30",
		"Food",
		"Debit",
		"Coffee",
		4.86
	],
	[
		"2026-01-29",
		"Kid",
		"Credit",
		"Kid Medical",
		26.6
	],
	[
		"2026-01-29",
		"Food",
		"Debit",
		"Dinner",
		14
	],
	[
		"2026-01-27",
		"Food",
		"Debit",
		"Breakfast",
		2.75
	],
	[
		"2026-01-26",
		"Food",
		"Debit",
		"Dinner",
		6.5
	],
	[
		"2026-01-26",
		"Transportation",
		"Debit",
		"Gasoline FTR",
		3.69
	],
	[
		"2026-01-26",
		"Utilities",
		"Debit",
		"Fruit offering",
		3
	],
	[
		"2026-01-26",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		2.5
	],
	[
		"2026-01-26",
		"Food",
		"Debit",
		"Lunch",
		1.25
	],
	[
		"2026-01-25",
		"Utilities",
		"Debit",
		"Teeth Cleanup",
		15
	],
	[
		"2026-01-25",
		"Food",
		"Debit",
		"Dinner Tepoyaki",
		12
	],
	[
		"2026-01-25",
		"Utilities",
		"Debit",
		"Laundry + Dry",
		5
	],
	[
		"2026-01-25",
		"Personal Spending",
		"Debit",
		"Shocks",
		3.75
	],
	[
		"2026-01-25",
		"Utilities",
		"Debit",
		"Hair Cut",
		2.25
	],
	[
		"2026-01-25",
		"Food",
		"Debit",
		"coffee",
		1.25
	],
	[
		"2026-01-25",
		"Food",
		"Debit",
		"Coffee",
		1
	],
	[
		"2026-01-24",
		"Transportation",
		"Debit",
		"Gasoline - Prius",
		14
	],
	[
		"2026-01-24",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		10.33
	],
	[
		"2026-01-24",
		"Food",
		"Credit",
		"Dinner - smash burger",
		10
	],
	[
		"2026-01-24",
		"Transportation",
		"Debit",
		"Taxi to Airport",
		7.47
	],
	[
		"2026-01-24",
		"Transportation",
		"Debit",
		"TIA Parking",
		2.5
	],
	[
		"2026-01-24",
		"Food",
		"Debit",
		"Lunch",
		2.25
	],
	[
		"2026-01-23",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		2.5
	],
	[
		"2026-01-22",
		"Food",
		"Credit",
		"Dinner - Ramen Set",
		10
	],
	[
		"2026-01-22",
		"Food",
		"Debit",
		"Lunch",
		1.5
	],
	[
		"2026-01-21",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		3.5
	],
	[
		"2026-01-20",
		"Kid",
		"Credit",
		"Kid Checkup",
		26.6
	],
	[
		"2026-01-20",
		"Food",
		"Debit",
		"Dessert ចាប់លៀង",
		3.5
	],
	[
		"2026-01-20",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		2.5
	],
	[
		"2026-01-19",
		"Transportation",
		"Debit",
		"Gasoline - Highlander",
		10
	],
	[
		"2026-01-19",
		"Transportation",
		"Debit",
		"Gasoline - FTR",
		2.57
	],
	[
		"2026-01-19",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		2.5
	],
	[
		"2026-01-15",
		"Utilities",
		"Debit",
		"PPSWA",
		1.25
	],
	[
		"2026-01-09",
		"Utilities",
		"Debit",
		"Metfone 60GB",
		6
	],
	[
		"2026-01-09",
		"Food",
		"Debit",
		"Lunch",
		3.75
	],
	[
		"2026-01-09",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		2.5
	],
	[
		"2026-01-08",
		"Food",
		"Debit",
		"Dessert - Ice Cream",
		2.5
	],
	[
		"2026-01-08",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		2.5
	],
	[
		"2026-01-07",
		"Food",
		"Debit",
		"Dinner - Delivery",
		10
	],
	[
		"2026-01-07",
		"Utilities",
		"Debit",
		"EDC",
		4
	],
	[
		"2026-01-07",
		"Utilities",
		"Debit",
		"Waste Management",
		3
	],
	[
		"2026-01-01",
		"Saving & Investing",
		"Debit",
		"24k gold - 300L",
		1586
	],
	[
		"2026-01-01",
		"Food",
		"Debit",
		"Dinner",
		8.5
	],
	[
		"2026-01-01",
		"Food",
		"Debit",
		"Breakfast",
		2.5
	],
	[
		"2026-01-01",
		"Food",
		"Debit",
		"Coffee",
		2.15
	],
	[
		"2025-12-31",
		"Kid",
		"Debit",
		"Grocery for kids",
		30
	],
	[
		"2025-12-31",
		"Transportation",
		"Debit",
		"Gasoline _ Highlander",
		10
	],
	[
		"2025-12-31",
		"Transportation",
		"Debit",
		"tuktuk to chamkar doung",
		10
	],
	[
		"2025-12-30",
		"Food",
		"Debit",
		"Dinner",
		18.75
	],
	[
		"2025-12-29",
		"Personal Spending",
		"Credit",
		"skybar",
		21
	],
	[
		"2025-12-27",
		"Personal Spending",
		"Debit",
		"Wedding OCIC",
		100
	],
	[
		"2025-12-27",
		"Personal Spending",
		"Debit",
		"Lobster 2kg",
		75
	],
	[
		"2025-12-27",
		"Transportation",
		"Credit",
		"Gasoline Prius",
		15
	],
	[
		"2025-12-27",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		10
	],
	[
		"2025-12-25",
		"Utilities",
		"Credit",
		"Prius Engine Oil 4L total",
		58
	],
	[
		"2025-12-25",
		"Food",
		"Debit",
		"Commission > Inner",
		50
	],
	[
		"2025-12-25",
		"Personal Spending",
		"Debit",
		"Commission > APLE",
		50
	],
	[
		"2025-12-25",
		"Personal Spending",
		"Debit",
		"Gift Christmas lyly",
		50
	],
	[
		"2025-12-25",
		"Personal Spending",
		"Debit",
		"Gift Christmas BioDia",
		25
	],
	[
		"2025-12-25",
		"Personal Spending",
		"Debit",
		"Gift Christmas - Max",
		25
	],
	[
		"2025-12-25",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		2.5
	],
	[
		"2025-12-25",
		"Transportation",
		"Debit",
		"Gasoline Zoomer",
		2
	],
	[
		"2025-12-25",
		"Food",
		"Debit",
		"Lunch",
		1.5
	],
	[
		"2025-12-24",
		"Food",
		"Debit",
		"Dinner - grilled chicken",
		7.5
	],
	[
		"2025-12-22",
		"Food",
		"Debit",
		"Lunch",
		6
	],
	[
		"2025-12-22",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		2.25
	],
	[
		"2025-12-21",
		"Personal Spending",
		"Debit",
		"Statues + ring",
		25
	],
	[
		"2025-12-21",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		4
	],
	[
		"2025-12-21",
		"Utilities",
		"Debit",
		"Fix Car",
		2.5
	],
	[
		"2025-12-20",
		"Food",
		"Debit",
		"Dinner",
		13
	],
	[
		"2025-12-20",
		"Food",
		"Debit",
		"Water x Cola",
		12
	],
	[
		"2025-12-20",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		2.5
	],
	[
		"2025-12-20",
		"Food",
		"Debit",
		"Lunch + Coffee",
		2.5
	],
	[
		"2025-12-19",
		"Personal Spending",
		"Debit",
		"Statue",
		30
	],
	[
		"2025-12-19",
		"Transportation",
		"Credit",
		"Gasoline Prius",
		27
	],
	[
		"2025-12-19",
		"Food",
		"Debit",
		"Dinner Burger x 2",
		6
	],
	[
		"2025-12-18",
		"Food",
		"Debit",
		"Pet Food Supply",
		11.5
	],
	[
		"2025-12-18",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		2.5
	],
	[
		"2025-12-18",
		"Food",
		"Debit",
		"Lunch",
		2.5
	],
	[
		"2025-12-18",
		"Utilities",
		"Debit",
		"Hair cut",
		2.25
	],
	[
		"2025-12-18",
		"Transportation",
		"Debit",
		"FTR Gasoline",
		2
	],
	[
		"2025-12-17",
		"Utilities",
		"Debit",
		"Car Paint",
		40
	],
	[
		"2025-12-16",
		"Food",
		"Debit",
		"Lunch",
		3
	],
	[
		"2025-12-16",
		"Food",
		"Debit",
		"Breakfast",
		2.25
	],
	[
		"2025-12-15",
		"Food",
		"Debit",
		"Dinner",
		6.75
	],
	[
		"2025-12-15",
		"Food",
		"Debit",
		"Lunch",
		4
	],
	[
		"2025-12-15",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		2.5
	],
	[
		"2025-12-14",
		"Personal Spending",
		"Debit",
		"Small Statue x 4",
		42
	],
	[
		"2025-12-14",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		5
	],
	[
		"2025-12-12",
		"Personal Spending",
		"Debit",
		"Buddha statue",
		50
	],
	[
		"2025-12-12",
		"Utilities",
		"Debit",
		"Fix car roof",
		30
	],
	[
		"2025-12-12",
		"Food",
		"Debit",
		"Milk Tea",
		4.3
	],
	[
		"2025-12-12",
		"Food",
		"Debit",
		"Breakfast",
		3
	],
	[
		"2025-12-11",
		"Food",
		"Debit",
		"Dinner",
		24.75
	],
	[
		"2025-12-11",
		"Food",
		"Debit",
		"Lunch",
		3.63
	],
	[
		"2025-12-11",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		2.5
	],
	[
		"2025-12-10",
		"Utilities",
		"Debit",
		"EDC",
		13
	],
	[
		"2025-12-10",
		"Food",
		"Debit",
		"Lunch - Bonchon",
		7.5
	],
	[
		"2025-12-10",
		"Food",
		"Debit",
		"Dinner",
		6.75
	],
	[
		"2025-12-10",
		"Utilities",
		"Debit",
		"097 Mobile",
		6
	],
	[
		"2025-12-10",
		"Utilities",
		"Debit",
		"Waste Management Fee",
		2.63
	],
	[
		"2025-12-09",
		"Food",
		"Debit",
		"Dinner",
		10.5
	],
	[
		"2025-12-07",
		"Transportation",
		"Credit",
		"Gasoline Prius",
		22
	],
	[
		"2025-12-06",
		"Utilities",
		"Debit",
		"070 Mobile",
		1
	],
	[
		"2025-12-01",
		"Utilities",
		"Debit",
		"Freepik Premium Subscription",
		102.5
	],
	[
		"2025-12-01",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		2.5
	],
	[
		"2025-11-25",
		"Food",
		"Debit",
		"Lunch",
		6
	],
	[
		"2025-11-25",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		2
	],
	[
		"2025-11-24",
		"Food",
		"Debit",
		"Dinner",
		7.5
	],
	[
		"2025-11-24",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		2.5
	],
	[
		"2025-11-23",
		"Food",
		"Debit",
		"Lunch",
		10
	],
	[
		"2025-11-22",
		"Transportation",
		"Debit",
		"Gasoline - Zoomer",
		1
	],
	[
		"2025-11-21",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		2.25
	],
	[
		"2025-11-21",
		"Food",
		"Debit",
		"Lunch",
		2
	],
	[
		"2025-11-20",
		"Food",
		"Debit",
		"Dinner",
		10
	],
	[
		"2025-11-20",
		"Food",
		"Debit",
		"Lunch",
		3
	],
	[
		"2025-11-20",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		3
	],
	[
		"2025-11-19",
		"Food",
		"Debit",
		"Lunch",
		5.5
	],
	[
		"2025-11-19",
		"Food",
		"Debit",
		"Dinner",
		3.5
	],
	[
		"2025-11-19",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		2.5
	],
	[
		"2025-11-18",
		"Kid",
		"Debit",
		"NPH - Room",
		50
	],
	[
		"2025-11-18",
		"Transportation",
		"Credit",
		"Gasoline - Prius",
		24
	],
	[
		"2025-11-18",
		"Food",
		"Debit",
		"Dinner",
		2.5
	],
	[
		"2025-11-18",
		"Food",
		"Debit",
		"Breakfast",
		2.5
	],
	[
		"2025-11-18",
		"Food",
		"Debit",
		"Lunch",
		1.5
	],
	[
		"2025-11-17",
		"Kid",
		"Debit",
		"NPH - Room",
		50
	],
	[
		"2025-11-17",
		"Food",
		"Debit",
		"Dinner",
		10.5
	],
	[
		"2025-11-16",
		"Food",
		"Debit",
		"Dinner - Grilled Beef",
		3.5
	],
	[
		"2025-11-16",
		"Food",
		"Debit",
		"Breakfast",
		1.25
	],
	[
		"2025-11-16",
		"Food",
		"Debit",
		"Lunch",
		1.25
	],
	[
		"2025-11-16",
		"Food",
		"Debit",
		"Coffee",
		1
	],
	[
		"2025-11-14",
		"Food",
		"Credit",
		"Dinner",
		30.5
	],
	[
		"2025-11-14",
		"Food",
		"Debit",
		"Breakfast",
		2.75
	],
	[
		"2025-11-14",
		"Food",
		"Debit",
		"Lunch",
		1.5
	],
	[
		"2025-11-13",
		"Food",
		"Debit",
		"Dinner eat out",
		20.25
	],
	[
		"2025-11-13",
		"Food",
		"Debit",
		"Lunch",
		1.75
	],
	[
		"2025-11-13",
		"Food",
		"Debit",
		"Breakfast - Nom Pao",
		1
	],
	[
		"2025-11-12",
		"Food",
		"Credit",
		"Dinner - Kongfu",
		13.5
	],
	[
		"2025-11-12",
		"Personal Spending",
		"Credit",
		"Shoes",
		6.5
	],
	[
		"2025-11-12",
		"Food",
		"Debit",
		"Rice 5Kg",
		5.25
	],
	[
		"2025-11-12",
		"Food",
		"Debit",
		"Egg + Grocery",
		5
	],
	[
		"2025-11-12",
		"Utilities",
		"Debit",
		"Battery Car",
		2.5
	],
	[
		"2025-11-12",
		"Food",
		"Debit",
		"Coffee - Cyclo",
		1.88
	],
	[
		"2025-11-12",
		"Food",
		"Debit",
		"Lunch",
		1.25
	],
	[
		"2025-11-12",
		"Food",
		"Debit",
		"Breakfast - Baysrob",
		1.25
	],
	[
		"2025-11-11",
		"Food",
		"Debit",
		"Breakfast",
		.5
	],
	[
		"2025-11-10",
		"Utilities",
		"Debit",
		"EDC",
		8.5
	],
	[
		"2025-11-10",
		"Food",
		"Credit",
		"Lunch",
		4.8
	],
	[
		"2025-11-10",
		"Food",
		"Debit",
		"Dinner",
		3.5
	],
	[
		"2025-11-10",
		"Utilities",
		"Debit",
		"Waste Management Fee",
		2.75
	],
	[
		"2025-11-10",
		"Food",
		"Debit",
		"Breakfast",
		2.5
	],
	[
		"2025-11-10",
		"Transportation",
		"Debit",
		"Gasoline FTR",
		2.4
	],
	[
		"2025-11-09",
		"Food",
		"Debit",
		"Lunch",
		15.5
	],
	[
		"2025-11-09",
		"Transportation",
		"Credit",
		"Gasoline",
		12
	],
	[
		"2025-11-09",
		"Food",
		"Credit",
		"Dinner",
		8.8
	],
	[
		"2025-11-09",
		"Food",
		"Debit",
		"Breakfast",
		7.8
	],
	[
		"2025-11-09",
		"Food",
		"Debit",
		"Coffee",
		3.3
	],
	[
		"2025-11-08",
		"Utilities",
		"Debit",
		"Hair Cut",
		2.25
	],
	[
		"2025-11-08",
		"Food",
		"Debit",
		"Coffee",
		1.5
	],
	[
		"2025-11-08",
		"Food",
		"Debit",
		"Breakfast",
		1
	],
	[
		"2025-11-07",
		"Food",
		"Debit",
		"Dinner",
		4.5
	],
	[
		"2025-11-07",
		"Food",
		"Debit",
		"Lunch",
		1.25
	],
	[
		"2025-11-07",
		"Food",
		"Debit",
		"Breafast - Nom Pao",
		1
	],
	[
		"2025-11-06",
		"Food",
		"Credit",
		"Dinner Aeon 3",
		12.5
	],
	[
		"2025-11-06",
		"Food",
		"Debit",
		"Coffee",
		1.5
	],
	[
		"2025-11-06",
		"Food",
		"Debit",
		"Breakfast",
		1.25
	],
	[
		"2025-11-05",
		"Food",
		"Credit",
		"Dinner Khalendale",
		24
	],
	[
		"2025-11-05",
		"Food",
		"Debit",
		"Coffee",
		1.88
	],
	[
		"2025-11-05",
		"Food",
		"Debit",
		"Breakfast",
		1.25
	],
	[
		"2025-11-04",
		"Food",
		"Debit",
		"Coffee",
		2.15
	],
	[
		"2025-11-04",
		"Food",
		"Debit",
		"Breakfat",
		1.25
	],
	[
		"2025-11-03",
		"Food",
		"Debit",
		"Breakfast",
		.5
	],
	[
		"2025-11-02",
		"Food",
		"Debit",
		"Coffee",
		2.15
	],
	[
		"2025-11-02",
		"Food",
		"Debit",
		"Lunch",
		1.5
	],
	[
		"2025-11-01",
		"Transportation",
		"Credit",
		"Gasoline Prius",
		24
	],
	[
		"2025-11-01",
		"Food",
		"Debit",
		"Dinner",
		14.5
	],
	[
		"2025-10-31",
		"Food",
		"Debit",
		"Lunch",
		1.5
	],
	[
		"2025-10-31",
		"Food",
		"Debit",
		"Nom Pao",
		1
	],
	[
		"2025-10-30",
		"Food",
		"Debit",
		"Grocery Yopin mall",
		8.8
	],
	[
		"2025-10-30",
		"Food",
		"Debit",
		"Lunch",
		3.25
	],
	[
		"2025-10-30",
		"Food",
		"Debit",
		"Breakfast + coffee",
		2.5
	],
	[
		"2025-10-29",
		"Utilities",
		"Debit",
		"Fruit Offering",
		10
	],
	[
		"2025-10-29",
		"Food",
		"Debit",
		"Lunch x 2",
		6
	],
	[
		"2025-10-28",
		"Food",
		"Credit",
		"Dinner Peperlunch",
		6.21
	],
	[
		"2025-10-28",
		"Food",
		"Debit",
		"Lunch",
		1.25
	],
	[
		"2025-10-28",
		"Food",
		"Debit",
		"Breakfast",
		.75
	],
	[
		"2025-10-27",
		"Kid",
		"Debit",
		"Child Support",
		200
	],
	[
		"2025-10-27",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		2.5
	],
	[
		"2025-10-27",
		"Transportation",
		"Debit",
		"Gasoline FTR",
		2
	],
	[
		"2025-10-26",
		"Food",
		"Credit",
		"Genki",
		11.6
	],
	[
		"2025-10-26",
		"Food",
		"Debit",
		"Dinner",
		5
	],
	[
		"2025-10-26",
		"Food",
		"Debit",
		"Breakfast",
		1.5
	],
	[
		"2025-10-25",
		"Food",
		"Debit",
		"Dinner Borbor Sor",
		1.75
	],
	[
		"2025-10-25",
		"Food",
		"Debit",
		"Breakfast",
		1.25
	],
	[
		"2025-10-23",
		"Food",
		"Credit",
		"Dinner",
		8.9
	],
	[
		"2025-10-23",
		"Food",
		"Debit",
		"Lunch",
		2.5
	],
	[
		"2025-10-23",
		"Food",
		"Debit",
		"Breakfast",
		2.25
	],
	[
		"2025-10-23",
		"Food",
		"Debit",
		"Grocery",
		2
	],
	[
		"2025-10-22",
		"Utilities",
		"Debit",
		"Cat food",
		7.25
	],
	[
		"2025-10-22",
		"Transportation",
		"Debit",
		"gasoline FTR",
		2.43
	],
	[
		"2025-10-22",
		"Food",
		"Debit",
		"Nom Pang",
		1.5
	],
	[
		"2025-10-22",
		"Food",
		"Debit",
		"Breakfast",
		.5
	],
	[
		"2025-10-21",
		"Food",
		"Debit",
		"Dinner Domino Pizza",
		5.5
	],
	[
		"2025-10-21",
		"Food",
		"Debit",
		"Coffee",
		1.35
	],
	[
		"2025-10-21",
		"Food",
		"Debit",
		"Breakfast",
		.75
	],
	[
		"2025-10-20",
		"Utilities",
		"Debit",
		"FTR Battery",
		22
	],
	[
		"2025-10-20",
		"Food",
		"Debit",
		"Lunch - Grab",
		5.25
	],
	[
		"2025-10-20",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		2.25
	],
	[
		"2025-10-18",
		"Food",
		"Credit",
		"Dinner - Yuzu Suki",
		22.5
	],
	[
		"2025-10-18",
		"Food",
		"Credit",
		"Bay mon dot",
		6
	],
	[
		"2025-10-18",
		"Food",
		"Debit",
		"nom pao coffee",
		2.25
	],
	[
		"2025-10-17",
		"Food",
		"Credit",
		"Dinner soerae",
		20
	],
	[
		"2025-10-17",
		"Food",
		"Debit",
		"Breakfast  + Coffee",
		3
	],
	[
		"2025-10-16",
		"Food",
		"Credit",
		"Lunch",
		5.68
	],
	[
		"2025-10-16",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		2.25
	],
	[
		"2025-10-15",
		"Transportation",
		"Credit",
		"Gasoline Prius",
		22
	],
	[
		"2025-10-15",
		"Transportation",
		"Credit",
		"Express Way Fee",
		14
	],
	[
		"2025-10-15",
		"Food",
		"Debit",
		"Breakfast + coffee",
		7
	],
	[
		"2025-10-14",
		"Transportation",
		"Credit",
		"Gasoline Prius",
		24
	],
	[
		"2025-10-14",
		"Food",
		"Debit",
		"Dinner",
		11.71
	],
	[
		"2025-10-14",
		"Food",
		"Debit",
		"Breakfast x 2",
		7.5
	],
	[
		"2025-10-14",
		"Food",
		"Debit",
		"Lunch Bay srob",
		3.5
	],
	[
		"2025-10-14",
		"Food",
		"Debit",
		"Coffee",
		2.15
	],
	[
		"2025-10-12",
		"Food",
		"Credit",
		"Grocery aeon",
		11.9
	],
	[
		"2025-10-12",
		"Food",
		"Credit",
		"Dinner",
		10.9
	],
	[
		"2025-10-12",
		"Food",
		"Debit",
		"Lunch",
		4
	],
	[
		"2025-10-12",
		"Food",
		"Debit",
		"Coffee",
		2.15
	],
	[
		"2025-10-12",
		"Food",
		"Debit",
		"Breakfast",
		1.25
	],
	[
		"2025-10-11",
		"Food",
		"Debit",
		"Breakfast",
		15.09
	],
	[
		"2025-10-11",
		"Food",
		"Debit",
		"Beef grill",
		3.25
	],
	[
		"2025-10-11",
		"Utilities",
		"Debit",
		"Fix FTR moto",
		2.5
	],
	[
		"2025-10-11",
		"Food",
		"Debit",
		"Coffee",
		1.5
	],
	[
		"2025-10-10",
		"Utilities",
		"Debit",
		"Top-Up-097",
		6
	],
	[
		"2025-10-10",
		"Food",
		"Credit",
		"Lunch - Bay Mon Dot",
		5.68
	],
	[
		"2025-10-10",
		"Food",
		"Credit",
		"Coffee 13May",
		1.35
	],
	[
		"2025-10-10",
		"Utilities",
		"Debit",
		"Top-Up-017",
		1
	],
	[
		"2025-10-10",
		"Utilities",
		"Debit",
		"Top-Up-070",
		1
	],
	[
		"2025-10-10",
		"Food",
		"Debit",
		"Nom Pao",
		.75
	],
	[
		"2025-10-09",
		"Food",
		"Credit",
		"Dinner - Pepper Lunch x 2",
		18.01
	],
	[
		"2025-10-09",
		"Utilities",
		"Debit",
		"EDC",
		5.62
	],
	[
		"2025-10-09",
		"Food",
		"Debit",
		"Cake",
		3.5
	],
	[
		"2025-10-09",
		"Utilities",
		"Debit",
		"Waste Management",
		2.63
	],
	[
		"2025-10-09",
		"Food",
		"Credit",
		"Coffee 13may",
		1.35
	],
	[
		"2025-10-09",
		"Food",
		"Debit",
		"Nom Pao",
		.75
	],
	[
		"2025-10-08",
		"Food",
		"Credit",
		"Coffee 13 May",
		1.35
	],
	[
		"2025-10-08",
		"Food",
		"Debit",
		"Nom Pao",
		.5
	],
	[
		"2025-10-07",
		"Food",
		"Credit",
		"Bay Mon Dot",
		4.68
	],
	[
		"2025-10-07",
		"Food",
		"Debit",
		"Nom Pao",
		.75
	],
	[
		"2025-10-06",
		"Food",
		"Credit",
		"Lunch - Bay Mon Dot",
		4.68
	],
	[
		"2025-10-06",
		"Food",
		"Debit",
		"Nom Pao",
		.75
	],
	[
		"2025-10-05",
		"Personal Spending",
		"Debit",
		"Offering Fruit",
		12.5
	],
	[
		"2025-10-05",
		"Personal Spending",
		"Credit",
		"Grocery DIY",
		5.7
	],
	[
		"2025-10-05",
		"Food",
		"Debit",
		"Breakfast x 2",
		3
	],
	[
		"2025-10-04",
		"Utilities",
		"Credit",
		"Engine Oil 5W-30 4L + Filter",
		57.7
	],
	[
		"2025-10-04",
		"Personal Spending",
		"Credit",
		"Mid autumn offering",
		25
	],
	[
		"2025-10-04",
		"Food",
		"Credit",
		"Dinner",
		25
	],
	[
		"2025-10-04",
		"Utilities",
		"Credit",
		"A/C Filter",
		6
	],
	[
		"2025-10-04",
		"Food",
		"Debit",
		"Breakfast",
		2.5
	],
	[
		"2025-10-03",
		"Food",
		"Debit",
		"Lunch",
		3
	],
	[
		"2025-10-03",
		"Food",
		"Debit",
		"Nom Pao",
		.75
	],
	[
		"2025-10-02",
		"Kid",
		"Debit",
		"family support",
		100
	],
	[
		"2025-10-02",
		"Food",
		"Credit",
		"Dinner Buffee",
		18.59
	],
	[
		"2025-10-02",
		"Food",
		"Debit",
		"Lunch",
		3
	],
	[
		"2025-10-02",
		"Food",
		"Debit",
		"Nom Pao + Coffee",
		2.25
	],
	[
		"2025-10-01",
		"Transportation",
		"Credit",
		"Gasoline - Prius",
		28
	],
	[
		"2025-10-01",
		"Food",
		"Debit",
		"Lunch",
		3
	],
	[
		"2025-10-01",
		"Food",
		"Debit",
		"Dinnerinner",
		2
	],
	[
		"2025-10-01",
		"Food",
		"Debit",
		"Nom Pao",
		.75
	],
	[
		"2025-09-30",
		"Food",
		"Debit",
		"Nom Pao + Coffee",
		2.25
	],
	[
		"2025-09-30",
		"Food",
		"Debit",
		"Lunch - Baysrob",
		1.5
	],
	[
		"2025-09-29",
		"Personal Spending",
		"Debit",
		"សាច់គោងៀត",
		4.25
	],
	[
		"2025-09-29",
		"Food",
		"Debit",
		"Dinner - Chipmong",
		3.75
	],
	[
		"2025-09-29",
		"Food",
		"Debit",
		"Nom Pao + Coffee",
		2.25
	],
	[
		"2025-09-29",
		"Food",
		"Debit",
		"lunch",
		1.5
	],
	[
		"2025-09-29",
		"Personal Spending",
		"Debit",
		"Grocery - Chipmong",
		1.3
	],
	[
		"2025-09-28",
		"Kid",
		"Debit",
		"Formula Milk + Diapers + Grocery",
		68.45
	],
	[
		"2025-09-28",
		"Food",
		"Credit",
		"Aeon - Grocery",
		10
	],
	[
		"2025-09-28",
		"Transportation",
		"Debit",
		"Car wash",
		3.75
	],
	[
		"2025-09-28",
		"Food",
		"Debit",
		"Coffee",
		2.15
	],
	[
		"2025-09-28",
		"Food",
		"Debit",
		"Breakfast",
		1.25
	],
	[
		"2025-09-27",
		"Food",
		"Debit",
		"Lunch",
		7.04
	],
	[
		"2025-09-27",
		"Food",
		"Debit",
		"Breakfast",
		1
	],
	[
		"2025-09-26",
		"Kid",
		"Debit",
		"Kid playground",
		3
	],
	[
		"2025-09-26",
		"Food",
		"Debit",
		"Breakfast",
		.75
	],
	[
		"2025-09-24",
		"Transportation",
		"Credit",
		"Gasoline - SR",
		18
	],
	[
		"2025-09-24",
		"Food",
		"Debit",
		"Lunch - SR",
		11.87
	],
	[
		"2025-09-24",
		"Personal Spending",
		"Debit",
		"Banteay Srei Sourvenir",
		10
	],
	[
		"2025-09-24",
		"Food",
		"Debit",
		"Coffee - SR",
		1.68
	],
	[
		"2025-09-23",
		"Food",
		"Debit",
		"Coffee",
		4.3
	],
	[
		"2025-09-22",
		"Transportation",
		"Credit",
		"Gasoline - Bokor",
		18
	],
	[
		"2025-09-22",
		"Food",
		"Debit",
		"Breakfast - Kampot",
		16.25
	],
	[
		"2025-09-22",
		"Personal Spending",
		"Credit",
		"knife + zip tie",
		9
	],
	[
		"2025-09-21",
		"Food",
		"Debit",
		"Dinner - Kampot",
		17
	],
	[
		"2025-09-21",
		"Transportation",
		"Debit",
		"Gasoline - Skun",
		10
	],
	[
		"2025-09-20",
		"Utilities",
		"Debit",
		"Bi LED Headlight 12+2",
		150
	],
	[
		"2025-09-20",
		"Food",
		"Credit",
		"Aeon Grocery",
		16
	],
	[
		"2025-09-20",
		"Utilities",
		"Debit",
		"Car RED LED headlight",
		15
	],
	[
		"2025-09-20",
		"Utilities",
		"Debit",
		"Car AUX replacement",
		10
	],
	[
		"2025-09-20",
		"Food",
		"Debit",
		"Breakfast",
		8
	],
	[
		"2025-09-19",
		"Utilities",
		"Debit",
		"ជ័រស្លាប 4 គ្រាប់ - Rubber Bushing Suspension",
		50
	],
	[
		"2025-09-19",
		"Utilities",
		"Debit",
		"Engine Oil - 1L",
		12
	],
	[
		"2025-09-19",
		"Utilities",
		"Debit",
		"ក្រឡឹងតាំងបួរ",
		10
	],
	[
		"2025-09-19",
		"Food",
		"Debit",
		"lunch",
		2
	],
	[
		"2025-09-19",
		"Food",
		"Debit",
		"breakfast",
		.75
	],
	[
		"2025-09-18",
		"Food",
		"Debit",
		"Lunch - Steakhouse",
		6
	],
	[
		"2025-09-18",
		"Food",
		"Debit",
		"Beakfast - នំប៉ាវ",
		.75
	],
	[
		"2025-09-17",
		"Utilities",
		"Debit",
		"Gear Oil Replacement",
		26
	],
	[
		"2025-09-17",
		"Other",
		"Debit",
		"Dinner - មីទាញ x 2",
		8
	],
	[
		"2025-09-17",
		"Food",
		"Debit",
		"breakfast",
		.75
	],
	[
		"2025-09-16",
		"Personal Spending",
		"Debit",
		"Used pc case- SAMA SV-02",
		30
	],
	[
		"2025-09-16",
		"Transportation",
		"Credit",
		"Gasoline - Prius",
		28
	],
	[
		"2025-09-16",
		"Food",
		"Debit",
		"breakfast x 2",
		4.5
	],
	[
		"2025-09-16",
		"Food",
		"Debit",
		"lunch",
		1.5
	],
	[
		"2025-09-16",
		"Utilities",
		"Debit",
		"Water Bill",
		.75
	],
	[
		"2025-09-15",
		"Utilities",
		"Debit",
		"Front Wheel Bearing",
		110
	],
	[
		"2025-09-15",
		"Utilities",
		"Debit",
		"Back Brake - Replacement",
		40
	],
	[
		"2025-09-15",
		"Food",
		"Debit",
		"dinner",
		2.5
	],
	[
		"2025-09-15",
		"Transportation",
		"Debit",
		"TukTuk",
		2
	],
	[
		"2025-09-15",
		"Food",
		"Debit",
		"Lunch",
		1.5
	],
	[
		"2025-09-15",
		"Food",
		"Debit",
		"breakfast",
		.75
	],
	[
		"2025-09-14",
		"Food",
		"Credit",
		"makro - grocery",
		27
	],
	[
		"2025-09-14",
		"Food",
		"Debit",
		"breakfast - kuytiv",
		8.25
	],
	[
		"2025-09-14",
		"Utilities",
		"Debit",
		"Hair Cut",
		2.25
	],
	[
		"2025-09-13",
		"Food",
		"Debit",
		"dinner - aeon",
		15
	],
	[
		"2025-09-12",
		"Personal Spending",
		"Debit",
		"Cutting Board ជ្រុញឈើមៃសាក់",
		10
	],
	[
		"2025-09-12",
		"Personal Spending",
		"Debit",
		"Rosemary Plant",
		5
	],
	[
		"2025-09-12",
		"Food",
		"Debit",
		"Lunch",
		3
	],
	[
		"2025-09-12",
		"Food",
		"Debit",
		"Breakfast",
		.5
	],
	[
		"2025-09-11",
		"Utilities",
		"Debit",
		"Dentist",
		20
	],
	[
		"2025-09-11",
		"Food",
		"Debit",
		"Dinner Curry",
		3
	],
	[
		"2025-09-11",
		"Food",
		"Debit",
		"Dessert",
		3
	],
	[
		"2025-09-11",
		"Food",
		"Debit",
		"Coconut",
		1.25
	],
	[
		"2025-09-11",
		"Food",
		"Debit",
		"Breakfast - នំប៉ោង",
		.75
	],
	[
		"2025-09-10",
		"Food",
		"Debit",
		"Raw Beef 0.6kg",
		6
	],
	[
		"2025-09-10",
		"Utilities",
		"Debit",
		"Metfone 60BG/Month",
		6
	],
	[
		"2025-09-10",
		"Food",
		"Debit",
		"Dinner - beef stew",
		4
	],
	[
		"2025-09-10",
		"Transportation",
		"Debit",
		"Gasoline - Zoomer",
		1
	],
	[
		"2025-09-09",
		"Food",
		"Credit",
		"Dinner - Kalendale",
		13.2
	],
	[
		"2025-09-09",
		"Food",
		"Debit",
		"Breakfast - Nom ប៉ោង",
		.75
	],
	[
		"2025-09-08",
		"Food",
		"Debit",
		"Dinner - Chicken",
		7.5
	],
	[
		"2025-09-08",
		"Food",
		"Debit",
		"Lunch",
		1.5
	],
	[
		"2025-09-08",
		"Transportation",
		"Debit",
		"Gasoline - Zoomer",
		1
	],
	[
		"2025-09-08",
		"Food",
		"Debit",
		"Breakfast",
		.75
	],
	[
		"2025-09-07",
		"Food",
		"Debit",
		"Dinner - Texas",
		4
	],
	[
		"2025-09-06",
		"Personal Spending",
		"Debit",
		"សែនក្បាលទឹក",
		30
	],
	[
		"2025-09-06",
		"Food",
		"Debit",
		"Coffee Plus",
		2.15
	],
	[
		"2025-09-06",
		"Food",
		"Debit",
		"Breakfast - Baysrob",
		1.25
	],
	[
		"2025-09-05",
		"Food",
		"Debit",
		"Dinner - KFC",
		8.8
	],
	[
		"2025-09-05",
		"Food",
		"Debit",
		"Breakfast - Nom ប៉ោង",
		.75
	],
	[
		"2025-09-04",
		"Food",
		"Credit",
		"Dinner - Buffeet 1+1",
		22.99
	],
	[
		"2025-09-04",
		"Utilities",
		"Debit",
		"EDC",
		5
	],
	[
		"2025-09-04",
		"Utilities",
		"Debit",
		"Waste Management Fee",
		2.63
	],
	[
		"2025-09-04",
		"Food",
		"Debit",
		"Breakfasat + Coffee",
		2.25
	],
	[
		"2025-09-03",
		"Food",
		"Debit",
		"Shopping Local Market",
		10
	],
	[
		"2025-09-03",
		"Food",
		"Debit",
		"Dinner -  KFC",
		10
	],
	[
		"2025-09-03",
		"Transportation",
		"Debit",
		"Gasoline - Zoomer",
		2
	],
	[
		"2025-09-02",
		"Food",
		"Debit",
		"Lunch - Grab",
		6
	],
	[
		"2025-09-02",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		2.25
	],
	[
		"2025-09-01",
		"Food",
		"Debit",
		"Lunch",
		1.5
	],
	[
		"2025-09-01",
		"Food",
		"Debit",
		"Coffee",
		1.5
	],
	[
		"2025-09-01",
		"Food",
		"Debit",
		"Breakfast - Nom Pao",
		.75
	],
	[
		"2025-08-31",
		"Food",
		"Debit",
		"Grocery - Aeon",
		50
	],
	[
		"2025-08-31",
		"Food",
		"Debit",
		"Aeon - Genki",
		12
	],
	[
		"2025-08-30",
		"Food",
		"Debit",
		"Aeon - Chicken Rice",
		11
	],
	[
		"2025-08-30",
		"Food",
		"Debit",
		"Grocery - Local Market",
		5
	],
	[
		"2025-08-30",
		"Food",
		"Debit",
		"Breakfast - Nom Pao",
		.75
	],
	[
		"2025-08-30",
		"Food",
		"Debit",
		"Breakfast - Nom Pao",
		.75
	],
	[
		"2025-08-29",
		"Utilities",
		"Debit",
		"ABA Card Annual Fee",
		5
	],
	[
		"2025-08-29",
		"Personal Spending",
		"Debit",
		"CNX Staff Party",
		5
	],
	[
		"2025-08-29",
		"Food",
		"Debit",
		"Lunch",
		1.5
	],
	[
		"2025-08-29",
		"Food",
		"Debit",
		"Breakfast - Nom Pao",
		.75
	],
	[
		"2025-08-28",
		"Food",
		"Debit",
		"Lunch - Newyork Steak",
		6
	],
	[
		"2025-08-28",
		"Food",
		"Debit",
		"Breakfast - Nom Pao",
		.75
	],
	[
		"2025-08-27",
		"Food",
		"Debit",
		"Breakfast - Baysrob",
		2.25
	],
	[
		"2025-08-27",
		"Transportation",
		"Debit",
		"Gasoline - Zoomer",
		1
	],
	[
		"2025-08-26",
		"Food",
		"Debit",
		"Lunch",
		2.5
	],
	[
		"2025-08-26",
		"Food",
		"Debit",
		"Breakfast - Nompao",
		.75
	],
	[
		"2025-08-25",
		"Food",
		"Debit",
		"Lunch - Office Bay",
		1.5
	],
	[
		"2025-08-25",
		"Food",
		"Debit",
		"Breakfast - baysrob",
		1.25
	],
	[
		"2025-08-24",
		"Food",
		"Debit",
		"Dinner - Seafood Takeaway",
		12.5
	],
	[
		"2025-08-24",
		"Food",
		"Debit",
		"Chipmong Shopping + Grocery",
		8
	],
	[
		"2025-08-22",
		"Personal Spending",
		"Debit",
		"Pet food",
		7.52
	],
	[
		"2025-08-22",
		"Personal Spending",
		"Debit",
		"Aeon shopping",
		5
	],
	[
		"2025-08-22",
		"Food",
		"Debit",
		"Dinner - Baycha",
		2.5
	],
	[
		"2025-08-22",
		"Food",
		"Debit",
		"Breakfast - Baysrob",
		1.25
	],
	[
		"2025-08-21",
		"Kid",
		"Debit",
		"Elica Cloth",
		15
	],
	[
		"2025-08-21",
		"Food",
		"Debit",
		"Lunch - NewYork Steak",
		6
	],
	[
		"2025-08-21",
		"Food",
		"Debit",
		"dinner aeon",
		5.14
	],
	[
		"2025-08-21",
		"Food",
		"Debit",
		"Beakfast - Sandwich Rath",
		.75
	],
	[
		"2025-08-20",
		"Food",
		"Debit",
		"Dinner - Nom Pang Sac + Soup",
		3.25
	],
	[
		"2025-08-20",
		"Personal Spending",
		"Debit",
		"client meeting - starbucks",
		3.15
	],
	[
		"2025-08-20",
		"Food",
		"Debit",
		"Breakfast - baaysrob",
		2.25
	],
	[
		"2025-08-20",
		"Transportation",
		"Debit",
		"Gasolin - zoomer",
		1.9
	],
	[
		"2025-08-20",
		"Food",
		"Debit",
		"Lunch - Porridge",
		1.5
	],
	[
		"2025-08-19",
		"Food",
		"Debit",
		"Grocery - Aeon",
		5.9
	],
	[
		"2025-08-19",
		"Food",
		"Debit",
		"Dinner - Kuytiv",
		3.25
	],
	[
		"2025-08-18",
		"Food",
		"Debit",
		"Lunch - grab",
		4.5
	],
	[
		"2025-08-18",
		"Medical & Healthcare",
		"Debit",
		"Medicine",
		3.5
	],
	[
		"2025-08-18",
		"Food",
		"Debit",
		"Breakfast - sandwich",
		1
	],
	[
		"2025-08-17",
		"Food",
		"Credit",
		"Dinner Aeon gyukaku",
		23
	],
	[
		"2025-08-17",
		"Transportation",
		"Credit",
		"Gasoline Prius",
		15
	],
	[
		"2025-08-17",
		"Food",
		"Credit",
		"Breakfast - brown",
		12.4
	],
	[
		"2025-08-17",
		"Food",
		"Debit",
		"Grocery Korean Mart",
		8.4
	],
	[
		"2025-08-16",
		"Food",
		"Debit",
		"breakfast - nom pa0",
		.75
	],
	[
		"2025-08-15",
		"Food",
		"Debit",
		"lunch - new york steak",
		6.1
	],
	[
		"2025-08-15",
		"Personal Spending",
		"Debit",
		"groccery at bayond",
		4.25
	],
	[
		"2025-08-15",
		"Food",
		"Debit",
		"breakfast - nom pao",
		.75
	],
	[
		"2025-08-14",
		"Food",
		"Credit",
		"dinner- pizza",
		13.9
	],
	[
		"2025-08-14",
		"Food",
		"Debit",
		"breakfast - kuytiv",
		2.5
	],
	[
		"2025-08-13",
		"Food",
		"Debit",
		"lunch",
		1.5
	],
	[
		"2025-08-13",
		"Food",
		"Debit",
		"Breakfast - Nom Pao",
		.75
	],
	[
		"2025-08-12",
		"Food",
		"Debit",
		"Breakfast + Lunch",
		3
	],
	[
		"2025-08-11",
		"Medical & Healthcare",
		"Debit",
		"Dentist",
		50
	],
	[
		"2025-08-11",
		"Utilities",
		"Debit",
		"Metfone 60BG/Month",
		6
	],
	[
		"2025-08-11",
		"Food",
		"Debit",
		"Lunch",
		5.8
	],
	[
		"2025-08-11",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		2.5
	],
	[
		"2025-08-10",
		"Personal Spending",
		"Debit",
		"តិយទានចូលព្រះវស្សា",
		50
	],
	[
		"2025-08-10",
		"Food",
		"Debit",
		"Lunch at Preyveng",
		16.5
	],
	[
		"2025-08-10",
		"Transportation",
		"Credit",
		"Gasoline Prius",
		16
	],
	[
		"2025-08-10",
		"Food",
		"Credit",
		"Dinner - Paperlunch",
		13.9
	],
	[
		"2025-08-10",
		"Food",
		"Debit",
		"711 - Coffee",
		6.85
	],
	[
		"2025-08-09",
		"Medical & Healthcare",
		"Debit",
		"HairCut",
		2.25
	],
	[
		"2025-08-07",
		"Food",
		"Debit",
		"Breakfast - sandwich",
		1
	],
	[
		"2025-08-05",
		"Food",
		"Debit",
		"Breakfast - Nom Pao",
		.65
	],
	[
		"2025-08-04",
		"Food",
		"Debit",
		"Breakfast - sandwich",
		1
	],
	[
		"2025-08-03",
		"Transportation",
		"Credit",
		"Gasoline Prius",
		11
	],
	[
		"2025-08-03",
		"Utilities",
		"Debit",
		"EDC",
		5.5
	],
	[
		"2025-08-03",
		"Utilities",
		"Debit",
		"Waste management",
		2.5
	],
	[
		"2025-08-03",
		"Food",
		"Debit",
		"Nom Pang",
		1.5
	],
	[
		"2025-08-03",
		"Utilities",
		"Debit",
		"Phone Topup 017",
		1
	],
	[
		"2025-08-03",
		"Utilities",
		"Debit",
		"Phone Top up 070",
		1
	],
	[
		"2025-08-02",
		"Food",
		"Debit",
		"Dinner little sheep",
		39
	],
	[
		"2025-08-02",
		"Food",
		"Debit",
		"breakfast sandwich",
		.75
	],
	[
		"2025-08-01",
		"Transportation",
		"Credit",
		"Express Way Fee",
		28
	],
	[
		"2025-08-01",
		"Transportation",
		"Credit",
		"Gasoline Prius",
		20
	],
	[
		"2025-08-01",
		"Transportation",
		"Credit",
		"Gasoline Prius",
		17
	],
	[
		"2025-08-01",
		"Transportation",
		"Debit",
		"5W-30 - 1L",
		12
	],
	[
		"2025-08-01",
		"Food",
		"Debit",
		"Lucnh",
		4.75
	],
	[
		"2025-08-01",
		"Food",
		"Debit",
		"Breakfast - Crossiont",
		1.45
	],
	[
		"2025-07-31",
		"Kid",
		"Credit",
		"Elica Blood Test for Allergy",
		125.88
	],
	[
		"2025-07-31",
		"Food",
		"Debit",
		"Dinner - Steakhouse",
		8.5
	],
	[
		"2025-07-31",
		"Food",
		"Debit",
		"Breakfast - Nom Pao",
		.75
	],
	[
		"2025-07-30",
		"Food",
		"Debit",
		"Lunch - Streakhouse",
		6
	],
	[
		"2025-07-30",
		"Food",
		"Debit",
		"Breakfast - Sandwich",
		1
	],
	[
		"2025-07-29",
		"Food",
		"Debit",
		"Lunch - Steakhouse",
		4.85
	],
	[
		"2025-07-29",
		"Kid",
		"Debit",
		"Grocceries - Mr DIY",
		4
	],
	[
		"2025-07-29",
		"Food",
		"Debit",
		"Breakfast - Chocholate Danish",
		1.45
	],
	[
		"2025-07-28",
		"Food",
		"Debit",
		"breakfast - sandwich",
		1
	],
	[
		"2025-07-27",
		"Kid",
		"Debit",
		"Kid milk - wokado",
		38.4
	],
	[
		"2025-07-27",
		"Medical & Healthcare",
		"Debit",
		"General Medicine",
		20.15
	],
	[
		"2025-07-27",
		"Kid",
		"Debit",
		"Elica eye doctor consultant",
		20
	],
	[
		"2025-07-27",
		"Transportation",
		"Credit",
		"gasoline Prius",
		10
	],
	[
		"2025-07-27",
		"Food",
		"Debit",
		"Grocery aeon 1",
		8.5
	],
	[
		"2025-07-27",
		"Food",
		"Debit",
		"Dinner",
		7.5
	],
	[
		"2025-07-27",
		"Food",
		"Debit",
		"Coffee",
		4.86
	],
	[
		"2025-07-27",
		"Food",
		"Debit",
		"Breakfast",
		2
	],
	[
		"2025-07-24",
		"Food",
		"Debit",
		"Breakfast - Sandwich",
		1
	],
	[
		"2025-07-23",
		"Food",
		"Debit",
		"Grocceries at Bayond",
		8.5
	],
	[
		"2025-07-23",
		"Food",
		"Debit",
		"Breakfast - Sandwich",
		1
	],
	[
		"2025-07-22",
		"Food",
		"Debit",
		"Dinner - SanSan",
		10.5
	],
	[
		"2025-07-22",
		"Food",
		"Debit",
		"Breakfast",
		2
	],
	[
		"2025-07-21",
		"Food",
		"Credit",
		"Dinner - Seorae AEON PP",
		18.9
	],
	[
		"2025-07-21",
		"Kid",
		"Credit",
		"Elica Shoes",
		4.9
	],
	[
		"2025-07-21",
		"Food",
		"Debit",
		"Breakfast + Lunch",
		3
	],
	[
		"2025-07-20",
		"Transportation",
		"Credit",
		"Gasoline - Prius",
		31
	],
	[
		"2025-07-20",
		"Food",
		"Debit",
		"Dinner - Viewpark",
		17.25
	],
	[
		"2025-07-20",
		"Medical & Healthcare",
		"Debit",
		"H. Plyori Kit / Pylobact",
		14.5
	],
	[
		"2025-07-20",
		"Kid",
		"Debit",
		"PPWSA",
		.75
	],
	[
		"2025-07-19",
		"Food",
		"Debit",
		"Chipmong 271 mall",
		8
	],
	[
		"2025-07-18",
		"Medical & Healthcare",
		"Debit",
		"Blood Test x 2",
		52
	],
	[
		"2025-07-17",
		"Food",
		"Debit",
		"Breakfast - Sandwich",
		1
	],
	[
		"2025-07-16",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		3
	],
	[
		"2025-07-16",
		"Food",
		"Debit",
		"Fresh Fruit Mix Snack",
		1.25
	],
	[
		"2025-07-15",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		5
	],
	[
		"2025-07-15",
		"Food",
		"Debit",
		"Dinner x 2",
		3.5
	],
	[
		"2025-07-15",
		"Utilities",
		"Debit",
		"Electronic Components",
		1.5
	],
	[
		"2025-07-14",
		"Utilities",
		"Debit",
		"LED Light 20W 60cm",
		10
	],
	[
		"2025-07-14",
		"Food",
		"Debit",
		"Dinner - Nom Pang",
		3
	],
	[
		"2025-07-14",
		"Food",
		"Debit",
		"Lunch",
		1.5
	],
	[
		"2025-07-14",
		"Food",
		"Debit",
		"Breakfast Sandwich + Egg",
		1.25
	],
	[
		"2025-07-13",
		"Utilities",
		"Debit",
		"LED Light 60W 120cm",
		25
	],
	[
		"2025-07-13",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		5
	],
	[
		"2025-07-13",
		"Food",
		"Debit",
		"dinner - micha",
		3.5
	],
	[
		"2025-07-12",
		"Food",
		"Debit",
		"Dinner - Pizza pepperoni",
		9
	],
	[
		"2025-07-12",
		"Utilities",
		"Debit",
		"Metfone internet $6",
		6
	],
	[
		"2025-07-10",
		"Utilities",
		"Debit",
		"General offering",
		7.5
	],
	[
		"2025-07-10",
		"Utilities",
		"Debit",
		"Prius Key Battery",
		5
	],
	[
		"2025-07-10",
		"Food",
		"Debit",
		"Dinner - Micha",
		3.5
	],
	[
		"2025-07-10",
		"Food",
		"Debit",
		"Breakfast - Baysrob",
		1.25
	],
	[
		"2025-07-09",
		"Kid",
		"Debit",
		"Playground Entrance Fee",
		4.5
	],
	[
		"2025-07-09",
		"Food",
		"Debit",
		"Dinner - Kuytiv",
		2
	],
	[
		"2025-07-09",
		"Food",
		"Debit",
		"Breakfast Boiled Egg",
		.5
	],
	[
		"2025-07-08",
		"Food",
		"Credit",
		"Dinner - Momo Paradise",
		21
	],
	[
		"2025-07-08",
		"Food",
		"Debit",
		"Lunch - Bargel",
		2
	],
	[
		"2025-07-08",
		"Food",
		"Debit",
		"Breakfast",
		1.25
	],
	[
		"2025-07-07",
		"Medical & Healthcare",
		"Debit",
		"Soar Throat Medicine",
		5
	],
	[
		"2025-07-07",
		"Food",
		"Debit",
		"Breakfast - Nom Pao",
		.75
	],
	[
		"2025-07-06",
		"Food",
		"Credit",
		"Dinner - Genski",
		14.74
	],
	[
		"2025-07-06",
		"Transportation",
		"Credit",
		"Gasoline - Prius",
		10
	],
	[
		"2025-07-06",
		"Food",
		"Debit",
		"Breakfast + Coffee x 2",
		9
	],
	[
		"2025-07-06",
		"Personal Spending",
		"Credit",
		"Massage Equipement",
		9
	],
	[
		"2025-07-06",
		"Kid",
		"Credit",
		"Corner Safety Equipement",
		4.9
	],
	[
		"2025-07-06",
		"Utilities",
		"Debit",
		"EDC",
		4.5
	],
	[
		"2025-07-06",
		"Utilities",
		"Debit",
		"Waste Management",
		2.5
	],
	[
		"2025-07-06",
		"Utilities",
		"Debit",
		"Hair Cut",
		2.25
	],
	[
		"2025-07-05",
		"Personal Spending",
		"Credit",
		"Aeon Dinner + Grocceries",
		20
	],
	[
		"2025-07-04",
		"Food",
		"Debit",
		"Breakfast - Nom Pao + Coffee",
		2.25
	],
	[
		"2025-07-04",
		"Food",
		"Debit",
		"Lunch 6000",
		1.5
	],
	[
		"2025-07-03",
		"Utilities",
		"Debit",
		"Dentist",
		50
	],
	[
		"2025-07-03",
		"Food",
		"Credit",
		"Dinner - Pizza",
		16.5
	],
	[
		"2025-07-03",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		4
	],
	[
		"2025-07-02",
		"Food",
		"Debit",
		"Breakfast - Kuytiv",
		2.5
	],
	[
		"2025-07-02",
		"Personal Spending",
		"Debit",
		"Earphone",
		2.2
	],
	[
		"2025-07-01",
		"Personal Spending",
		"Debit",
		"Cake - Cambodiana",
		3.3
	],
	[
		"2025-07-01",
		"Food",
		"Debit",
		"Breakfast - Sandwich",
		1.25
	],
	[
		"2025-06-30",
		"Kid",
		"Debit",
		"Lazada Shipping Fee for Elica Milk",
		12
	],
	[
		"2025-06-30",
		"Utilities",
		"Debit",
		"Data - Metfone",
		4
	],
	[
		"2025-06-30",
		"Food",
		"Debit",
		"Dinner - Lotcha",
		4
	],
	[
		"2025-06-30",
		"Transportation",
		"Debit",
		"Gasoline - Zoomer",
		2
	],
	[
		"2025-06-30",
		"Food",
		"Debit",
		"Breakfast - Baysrob",
		1.25
	],
	[
		"2025-06-29",
		"Kid",
		"Debit",
		"Cat - Food",
		9.2
	],
	[
		"2025-06-29",
		"Food",
		"Debit",
		"Breakfast - kuytiv",
		2.5
	],
	[
		"2025-06-29",
		"Food",
		"Debit",
		"Coffee tube",
		2.43
	],
	[
		"2025-06-28",
		"Food",
		"Debit",
		"Dinner",
		25
	],
	[
		"2025-06-28",
		"Utilities",
		"Debit",
		"Engine Oil - Zoomer",
		5.5
	],
	[
		"2025-06-28",
		"Food",
		"Debit",
		"Breakfast",
		1.25
	],
	[
		"2025-06-27",
		"Food",
		"Debit",
		"Dinner - Beef skewer",
		2
	],
	[
		"2025-06-26",
		"Food",
		"Debit",
		"Dinner - Sushi",
		10
	],
	[
		"2025-06-26",
		"Transportation",
		"Credit",
		"Gasoline Prius",
		9
	],
	[
		"2025-06-26",
		"Food",
		"Debit",
		"Coffee plus",
		2.15
	],
	[
		"2025-06-26",
		"Transportation",
		"Debit",
		"Gasoline Zoomers",
		2
	],
	[
		"2025-06-26",
		"Food",
		"Debit",
		"Breakfast - Baysrob",
		1.25
	],
	[
		"2025-06-26",
		"Utilities",
		"Debit",
		"Data - Cellcard",
		1
	],
	[
		"2025-06-24",
		"Food",
		"Debit",
		"Dinner - Pizza Company",
		22.29
	],
	[
		"2025-06-24",
		"Personal Spending",
		"Credit",
		"Lazada - Ear Phone",
		7.5
	],
	[
		"2025-06-24",
		"Food",
		"Debit",
		"Breakfast - Sandwich",
		1
	],
	[
		"2025-06-23",
		"Food",
		"Debit",
		"Durain 2.3kg",
		14
	],
	[
		"2025-06-23",
		"Food",
		"Debit",
		"Breakfast - Nom Pao",
		1
	],
	[
		"2025-06-22",
		"Transportation",
		"Debit",
		"Gasoline - FTR",
		2
	],
	[
		"2025-06-21",
		"Food",
		"Credit",
		"Aeon 2 - Groccery",
		24
	],
	[
		"2025-06-21",
		"Personal Spending",
		"Credit",
		"Lazada - Labubu V3",
		12
	],
	[
		"2025-06-21",
		"Food",
		"Debit",
		"Diner -  Porridge",
		12
	],
	[
		"2025-06-21",
		"Food",
		"Debit",
		"Aeon 2 - Eating",
		9
	],
	[
		"2025-06-21",
		"Food",
		"Debit",
		"Breakfast - Nom Pao + Coffee",
		2.25
	],
	[
		"2025-06-19",
		"Food",
		"Debit",
		"Breakfast - Nom Pao + Coffee",
		2.25
	],
	[
		"2025-06-18",
		"Personal Spending",
		"Debit",
		"Shopping & Eating at ChipMong Norolance",
		21
	],
	[
		"2025-06-17",
		"Food",
		"Debit",
		"Breakfast - Baysrob",
		1.25
	],
	[
		"2025-06-16",
		"Food",
		"Debit",
		"Nom Pao & Coffee",
		2.25
	],
	[
		"2025-06-16",
		"Transportation",
		"Debit",
		"FTR Gasoline 2L",
		2
	],
	[
		"2025-06-16",
		"Food",
		"Debit",
		"lunch mahob kamong",
		1.5
	],
	[
		"2025-06-15",
		"Personal Spending",
		"Debit",
		"Doll machine",
		32.5
	],
	[
		"2025-06-15",
		"Personal Spending",
		"Debit",
		"Thailand Shipping Fee 4.2KG",
		8.4
	],
	[
		"2025-06-15",
		"Personal Spending",
		"Debit",
		"Mosquitoes shocking",
		8
	],
	[
		"2025-06-15",
		"Food",
		"Debit",
		"Balute x 5",
		2.5
	],
	[
		"2025-06-14",
		"Personal Spending",
		"Debit",
		"Fruit - Durain, Strawberry, Ogrance + Birdness",
		27.5
	],
	[
		"2025-06-14",
		"Personal Spending",
		"Debit",
		"K Ground - Sunglass , Grocceries",
		16
	],
	[
		"2025-06-14",
		"Transportation",
		"Credit",
		"Caltex  12L",
		12
	],
	[
		"2025-06-14",
		"Food",
		"Debit",
		"New York streak beef bread",
		8
	],
	[
		"2025-06-14",
		"Food",
		"Debit",
		"Cockle + Beef",
		5
	],
	[
		"2025-06-13",
		"Food",
		"Debit",
		"Chinese food",
		12.5
	],
	[
		"2025-06-13",
		"Kid",
		"Debit",
		"Elica health checkup @domrey hoSpital",
		8
	],
	[
		"2025-06-13",
		"Food",
		"Debit",
		"Nom Pao + Coffee",
		2.25
	],
	[
		"2025-06-13",
		"Food",
		"Debit",
		"pepperoni bagel",
		2
	],
	[
		"2025-06-12",
		"Kid",
		"Credit",
		"Elica formula milk stage 2 - 3x3",
		200
	],
	[
		"2025-06-12",
		"Transportation",
		"Credit",
		"Caltex BKK",
		16
	],
	[
		"2025-06-12",
		"Food",
		"Debit",
		"Pizza beef luc lac",
		15.99
	],
	[
		"2025-06-12",
		"Transportation",
		"Credit",
		"Total Psar Tmey",
		10
	],
	[
		"2025-06-12",
		"Food",
		"Debit",
		"Nom Pao + Coffee",
		2.25
	],
	[
		"2025-06-12",
		"Food",
		"Debit",
		"Banh Songh + Corn",
		2
	],
	[
		"2025-06-07",
		"Utilities",
		"Debit",
		"Hair Cut",
		2.25
	],
	[
		"2025-06-01",
		"Food",
		"Credit",
		"Brown Coffee Breakfast Aeon 3",
		16.3
	],
	[
		"2025-05-26",
		"Kid",
		"Credit",
		"Elica formula milk stage 2 - 1x5",
		100
	],
	[
		"2025-05-24",
		"Transportation",
		"Credit",
		"Caltex B",
		10
	],
	[
		"2025-05-23",
		"Personal Spending",
		"Credit",
		"Lazada - DJI mini 3 $330 + memory 64GB $10",
		340
	],
	[
		"2025-05-01",
		"Personal Spending",
		"Credit",
		"Camera Bag $30, Vacum clean $27, air blower $4",
		61
	],
	[
		"2025-04-06",
		"Transportation",
		"Debit",
		"ប្តូរកង់ក្រោយ x2",
		86
	],
	[
		"2025-04-06",
		"Transportation",
		"Debit",
		"បាញ់ថ្នាំឡាន",
		65
	],
	[
		"2025-04-06",
		"Transportation",
		"Debit",
		"Car Fix - ខ្វែងចង្កូត -លាងប្រាំងក្រោយ -ប្តូរកៅស៊ូកាឡេ",
		50
	],
	[
		"2025-04-06",
		"Transportation",
		"Debit",
		"Car Oil Replacement (300mile)",
		40
	],
	[
		"2025-04-06",
		"Transportation",
		"Debit",
		"ចាក់សាំង 10L",
		10
	],
	[
		"2025-03-12",
		"Food",
		"Debit",
		"Coffee",
		2.44
	],
	[
		"2025-03-12",
		"Food",
		"Debit",
		"Lunch",
		1.5
	],
	[
		"2025-03-12",
		"Food",
		"Debit",
		"Breakfast",
		1.25
	],
	[
		"2025-03-11",
		"Food",
		"Debit",
		"Bread + Coffee",
		3.4
	],
	[
		"2025-03-10",
		"Utilities",
		"Debit",
		"EDC",
		42
	],
	[
		"2025-03-10",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		3.4
	],
	[
		"2025-03-10",
		"Utilities",
		"Debit",
		"Waste Management",
		2.5
	],
	[
		"2025-03-10",
		"Food",
		"Debit",
		"Lunch",
		1.5
	],
	[
		"2025-03-07",
		"Food",
		"Debit",
		"Coffee + Breakfast",
		3.4
	],
	[
		"2025-03-06",
		"Food",
		"Debit",
		"Dinner",
		11.2
	],
	[
		"2025-03-06",
		"Food",
		"Debit",
		"Coffee",
		2.4
	],
	[
		"2025-03-06",
		"Transportation",
		"Debit",
		"Gasoline",
		1
	],
	[
		"2025-03-05",
		"Food",
		"Debit",
		"Lunch",
		4.95
	],
	[
		"2025-03-05",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		3
	],
	[
		"2025-03-05",
		"Utilities",
		"Debit",
		"Top-Up 017",
		1
	],
	[
		"2025-03-05",
		"Utilities",
		"Debit",
		"Top-Up 070",
		1
	],
	[
		"2025-03-03",
		"Transportation",
		"Debit",
		"Gasolone",
		10
	],
	[
		"2025-03-03",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		5.65
	],
	[
		"2025-02-18",
		"Food",
		"Debit",
		"Bread + Coffee",
		3.16
	],
	[
		"2025-02-17",
		"Food",
		"Credit",
		"Dinner Steak",
		5.6
	],
	[
		"2025-02-17",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		4.4
	],
	[
		"2025-02-17",
		"Food",
		"Debit",
		"Lunch",
		2
	],
	[
		"2025-02-16",
		"Kid",
		"Credit",
		"Baby Diaper x 2 case",
		44.5
	],
	[
		"2025-02-15",
		"Food",
		"Debit",
		"Makro Grocceries",
		24.57
	],
	[
		"2025-02-15",
		"Transportation",
		"Debit",
		"Prius Gasolin",
		10
	],
	[
		"2025-02-15",
		"Food",
		"Debit",
		"Coffee",
		2.15
	],
	[
		"2025-02-14",
		"Food",
		"Debit",
		"Breakfast + Cofee",
		3.19
	],
	[
		"2025-02-14",
		"Food",
		"Debit",
		"7/11",
		3.1
	],
	[
		"2025-02-13",
		"Kid",
		"Debit",
		"Elica Vaccine",
		100
	],
	[
		"2025-02-13",
		"Food",
		"Debit",
		"Genki Sushi Dinner",
		11.66
	],
	[
		"2025-02-13",
		"Food",
		"Debit",
		"7/11",
		5.16
	],
	[
		"2025-02-13",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		4
	],
	[
		"2025-02-12",
		"Food",
		"Debit",
		"Dinner",
		4.2
	],
	[
		"2025-02-12",
		"Food",
		"Debit",
		"Lunch",
		4
	],
	[
		"2025-02-12",
		"Food",
		"Debit",
		"Bread + Coffee",
		3.4
	],
	[
		"2025-02-11",
		"Food",
		"Debit",
		"Bread Talk",
		9.2
	],
	[
		"2025-02-11",
		"Kid",
		"Debit",
		"Elica Shoes",
		5.4
	],
	[
		"2025-02-11",
		"Food",
		"Debit",
		"Bread + Breakfast",
		3.16
	],
	[
		"2025-02-10",
		"Kid",
		"Credit",
		"Enfarlac Stage 2 x 5 pcs",
		95
	],
	[
		"2025-02-10",
		"Personal Spending",
		"Credit",
		"Home Improvement Tools",
		90
	],
	[
		"2025-02-10",
		"Food",
		"Credit",
		"Dinner x 2",
		8
	],
	[
		"2025-02-10",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		3.16
	],
	[
		"2025-02-09",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		10.9
	],
	[
		"2025-02-09",
		"Kid",
		"Debit",
		"Baby Food",
		7.5
	],
	[
		"2025-02-09",
		"Food",
		"Debit",
		"Banh Houy x 2",
		7.5
	],
	[
		"2025-02-07",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		3
	],
	[
		"2025-02-07",
		"Transportation",
		"Debit",
		"FTR Gasoline",
		2
	],
	[
		"2025-02-06",
		"Food",
		"Credit",
		"Paperlunch x 2",
		22.75
	],
	[
		"2025-02-06",
		"Food",
		"Debit",
		"Breakfast Sandwich",
		.75
	],
	[
		"2025-02-05",
		"Food",
		"Debit",
		"Breakfast",
		2.25
	],
	[
		"2025-02-04",
		"Food",
		"Debit",
		"Lunch",
		4.35
	],
	[
		"2025-02-04",
		"Food",
		"Debit",
		"Dinner",
		4
	],
	[
		"2025-02-04",
		"Food",
		"Debit",
		"Coffee + Breakfast",
		2.88
	],
	[
		"2025-02-04",
		"Transportation",
		"Debit",
		"FTR Gasoline",
		2
	],
	[
		"2025-02-03",
		"Food",
		"Debit",
		"Breakfast",
		2.25
	],
	[
		"2025-02-03",
		"Food",
		"Debit",
		"Lunch",
		1.5
	],
	[
		"2025-02-03",
		"Food",
		"Debit",
		"Dinner",
		1.5
	],
	[
		"2025-02-02",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		11.5
	],
	[
		"2025-02-02",
		"Food",
		"Debit",
		"Lunch",
		6.88
	],
	[
		"2025-02-02",
		"Transportation",
		"Debit",
		"FTR Gasoline",
		2
	],
	[
		"2025-01-31",
		"Food",
		"Debit",
		"Dinner x 6",
		83.88
	],
	[
		"2025-01-31",
		"Food",
		"Debit",
		"Breakfast x 6",
		35
	],
	[
		"2025-01-30",
		"Food",
		"Debit",
		"Lunch",
		20
	],
	[
		"2025-01-28",
		"Food",
		"Debit",
		"Brown Breakfast",
		15.9
	],
	[
		"2025-01-28",
		"Transportation",
		"Debit",
		"Prius Gasoline",
		10
	],
	[
		"2025-01-27",
		"Food",
		"Debit",
		"Dinner x 4",
		26
	],
	[
		"2025-01-27",
		"Utilities",
		"Debit",
		"Internet Metfone Wifi",
		15
	],
	[
		"2025-01-27",
		"Food",
		"Debit",
		"AEON Grocceries",
		14.25
	],
	[
		"2025-01-27",
		"Food",
		"Debit",
		"Lunch",
		6.88
	],
	[
		"2025-01-27",
		"Utilities",
		"Debit",
		"Metfone Mobile",
		4
	],
	[
		"2025-01-27",
		"Food",
		"Debit",
		"Coffee + Breakast",
		3.96
	],
	[
		"2025-01-26",
		"Food",
		"Debit",
		"Lunch Kampot",
		33.87
	],
	[
		"2025-01-26",
		"Food",
		"Debit",
		"Kampot Restuarant",
		33.87
	],
	[
		"2025-01-26",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		29.45
	],
	[
		"2025-01-26",
		"Personal Spending",
		"Debit",
		"361 Shoes",
		18.89
	],
	[
		"2025-01-26",
		"Food",
		"Debit",
		"Dinner x 4",
		17.93
	],
	[
		"2025-01-25",
		"Personal Spending",
		"Debit",
		"Bangkok Shalon",
		80
	],
	[
		"2025-01-25",
		"Food",
		"Credit",
		"Lunch x 4",
		9.7
	],
	[
		"2025-01-25",
		"Food",
		"Debit",
		"Dinner x 4",
		7
	],
	[
		"2025-01-25",
		"Food",
		"Debit",
		"Breakfast",
		.75
	],
	[
		"2025-01-24",
		"Food",
		"Credit",
		"Dinner",
		4.68
	],
	[
		"2025-01-24",
		"Food",
		"Debit",
		"Coffee and Breakfast",
		3
	],
	[
		"2025-01-24",
		"Food",
		"Debit",
		"Snack",
		2
	],
	[
		"2025-01-23",
		"Personal Spending",
		"Debit",
		"Birdnest",
		90
	],
	[
		"2025-01-23",
		"Food",
		"Debit",
		"Lunch",
		6.8
	],
	[
		"2025-01-23",
		"Food",
		"Credit",
		"Dinner",
		5.35
	],
	[
		"2025-01-22",
		"Kid",
		"Credit",
		"Enfarlac Stage 2 x 5 pcs",
		95
	],
	[
		"2025-01-22",
		"Food",
		"Debit",
		"Breakfast",
		2.25
	],
	[
		"2025-01-22",
		"Transportation",
		"Debit",
		"Zoomer Gasoline",
		2
	],
	[
		"2025-01-21",
		"Food",
		"Debit",
		"Dinner x 2 Set",
		12
	],
	[
		"2025-01-21",
		"Food",
		"Debit",
		"Breakfast",
		2
	],
	[
		"2025-01-21",
		"Food",
		"Debit",
		"Coffee",
		1.75
	],
	[
		"2025-01-20",
		"Medical & Healthcare",
		"Debit",
		"Dentist Appointment",
		50
	],
	[
		"2025-01-20",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		2.25
	],
	[
		"2025-01-20",
		"Food",
		"Debit",
		"Lunch",
		1.5
	],
	[
		"2025-01-18",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		3.75
	],
	[
		"2025-01-17",
		"Food",
		"Debit",
		"Dinner x 2 set",
		9.1
	],
	[
		"2025-01-17",
		"Transportation",
		"Debit",
		"Zoomer Gasoline",
		2
	],
	[
		"2025-01-11",
		"Kid",
		"Debit",
		"Nation Pediatric Hospital",
		150
	],
	[
		"2025-01-02",
		"Food",
		"Debit",
		"Breakfast",
		2
	],
	[
		"2024-12-27",
		"Food",
		"Debit",
		"Breakfast",
		1
	],
	[
		"2024-12-26",
		"Food",
		"Debit",
		"Dinner Pizza + Burger",
		15
	],
	[
		"2024-12-26",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		4.25
	],
	[
		"2024-12-26",
		"Food",
		"Debit",
		"Cake",
		3.3
	],
	[
		"2024-12-26",
		"Transportation",
		"Debit",
		"Zoomer Gasoline",
		2
	],
	[
		"2024-12-25",
		"Food",
		"Debit",
		"Dinner Chirstmas Wagyu Beef",
		16.28
	],
	[
		"2024-12-25",
		"Food",
		"Debit",
		"Breakfast",
		2.25
	],
	[
		"2024-12-24",
		"Utilities",
		"Debit",
		"Fix Moto",
		2
	],
	[
		"2024-12-24",
		"Food",
		"Debit",
		"Breakfast Instant Noodle",
		.75
	],
	[
		"2024-12-23",
		"Food",
		"Debit",
		"NomPang Dinner + Milk",
		3
	],
	[
		"2024-12-23",
		"Food",
		"Debit",
		"Breakfast",
		2.25
	],
	[
		"2024-12-23",
		"Food",
		"Debit",
		"Milk +Snack",
		1.75
	],
	[
		"2024-12-22",
		"Kid",
		"Debit",
		"Goat Formula Milk",
		40
	],
	[
		"2024-12-22",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		5
	],
	[
		"2024-12-22",
		"Transportation",
		"Debit",
		"Zoomer Gasoline",
		2.37
	],
	[
		"2024-12-19",
		"Food",
		"Credit",
		"Dinner x 6 Sakura Buffeet",
		50
	],
	[
		"2024-12-19",
		"Food",
		"Credit",
		"AEON Grocery Shopping",
		25
	],
	[
		"2024-12-19",
		"Food",
		"Debit",
		"Lunch",
		2.25
	],
	[
		"2024-12-19",
		"Transportation",
		"Debit",
		"Gasoline Zoomer",
		2
	],
	[
		"2024-12-17",
		"Food",
		"Debit",
		"Breakfast + Milk",
		3
	],
	[
		"2024-12-16",
		"Food",
		"Debit",
		"Dinner Delivery",
		6.75
	],
	[
		"2024-12-16",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		2.25
	],
	[
		"2024-12-16",
		"Transportation",
		"Debit",
		"Gasoline Zoomer",
		2
	],
	[
		"2024-12-15",
		"Kid",
		"Debit",
		"Goat Formular Milk",
		43.5
	],
	[
		"2024-12-14",
		"Food",
		"Debit",
		"Milk + Breakfast",
		1.5
	],
	[
		"2024-12-13",
		"Food",
		"Debit",
		"Pizza Dinner",
		12.4
	],
	[
		"2024-12-13",
		"Food",
		"Debit",
		"Baysrob Breakfast + Milk",
		3
	],
	[
		"2024-12-12",
		"Food",
		"Debit",
		"Dinner at Sovanna",
		16
	],
	[
		"2024-12-12",
		"Food",
		"Debit",
		"Lunch",
		2
	],
	[
		"2024-12-12",
		"Transportation",
		"Debit",
		"Document Delivery",
		1.5
	],
	[
		"2024-12-12",
		"Food",
		"Debit",
		"Instant Noodle Breakfast",
		.75
	],
	[
		"2024-12-11",
		"Food",
		"Debit",
		"AEON Grocceries",
		13.49
	],
	[
		"2024-12-11",
		"Food",
		"Debit",
		"Turky Sandwich",
		1
	],
	[
		"2024-12-10",
		"Food",
		"Debit",
		"Dinner",
		3
	],
	[
		"2024-12-10",
		"Food",
		"Debit",
		"BaySrob Breakfast",
		2.25
	],
	[
		"2024-12-10",
		"Food",
		"Debit",
		"Lunch",
		1.5
	],
	[
		"2024-12-07",
		"Kid",
		"Debit",
		"Formula Milk Buub 800g + Kid Food",
		43.5
	],
	[
		"2024-12-06",
		"Food",
		"Debit",
		"Chicken Rice Lunch",
		7.31
	],
	[
		"2024-12-05",
		"Food",
		"Debit",
		"Sandwhich",
		.75
	],
	[
		"2024-10-07",
		"Food",
		"Debit",
		"Lunch",
		5.9
	],
	[
		"2024-10-07",
		"Food",
		"Debit",
		"Coffee + Breakfast",
		3
	],
	[
		"2024-09-05",
		"Food",
		"Debit",
		"Lunch",
		5.75
	],
	[
		"2024-09-05",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		3
	],
	[
		"2024-09-04",
		"Food",
		"Debit",
		"Lunch",
		5.9
	],
	[
		"2024-09-04",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		3
	],
	[
		"2024-09-03",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		2.5
	],
	[
		"2024-09-03",
		"Food",
		"Debit",
		"Afternoon Drink",
		1.5
	],
	[
		"2024-09-02",
		"Food",
		"Debit",
		"Dinner",
		7
	],
	[
		"2024-09-02",
		"Food",
		"Debit",
		"Lunch",
		4.88
	],
	[
		"2024-09-02",
		"Transportation",
		"Debit",
		"Gasoline FTR",
		2
	],
	[
		"2024-09-02",
		"Food",
		"Debit",
		"Coffee",
		1.5
	],
	[
		"2024-09-01",
		"Kid",
		"Debit",
		"Baby Diaper",
		11.8
	],
	[
		"2024-09-01",
		"Food",
		"Debit",
		"Dinner x 4",
		11.5
	],
	[
		"2024-09-01",
		"Food",
		"Debit",
		"Fruit",
		5.5
	],
	[
		"2024-09-01",
		"Food",
		"Debit",
		"Breakfast + coffee",
		2.5
	],
	[
		"2024-09-01",
		"Food",
		"Debit",
		"Soybean juice",
		1
	],
	[
		"2024-08-30",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		2.15
	],
	[
		"2024-08-29",
		"Food",
		"Debit",
		"Dinner Seore",
		20.2
	],
	[
		"2024-08-29",
		"Kid",
		"Debit",
		"Elica Porridge",
		12.8
	],
	[
		"2024-08-29",
		"Food",
		"Debit",
		"Breakfast + Cofee",
		3.75
	],
	[
		"2024-08-29",
		"Transportation",
		"Debit",
		"Tuktuk TSK to Psar Tmey",
		1.75
	],
	[
		"2024-08-29",
		"Personal Spending",
		"Debit",
		"Additional Drink",
		1.5
	],
	[
		"2024-08-28",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		3.25
	],
	[
		"2024-08-28",
		"Transportation",
		"Debit",
		"Tuktuk Psar Tmey to TSK",
		1.75
	],
	[
		"2024-08-28",
		"Personal Spending",
		"Debit",
		"Additional Drink",
		1.5
	],
	[
		"2024-08-27",
		"Food",
		"Debit",
		"Dinner x 2",
		9.75
	],
	[
		"2024-08-27",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		2.75
	],
	[
		"2024-08-27",
		"Food",
		"Debit",
		"Dinner x 1",
		1.5
	],
	[
		"2024-08-26",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		3
	],
	[
		"2024-08-26",
		"Transportation",
		"Debit",
		"Gasoline Zoomer",
		2
	],
	[
		"2024-08-26",
		"Food",
		"Debit",
		"Additional Coffee",
		1.75
	],
	[
		"2024-08-25",
		"Transportation",
		"Debit",
		"Gasoline Pruise",
		10
	],
	[
		"2024-08-25",
		"Kid",
		"Debit",
		"Thai Shipping",
		7.6
	],
	[
		"2024-08-24",
		"Food",
		"Debit",
		"Dinner x 4",
		22.88
	],
	[
		"2024-08-24",
		"Food",
		"Debit",
		"Brealfast + Coffee",
		2
	],
	[
		"2024-08-23",
		"Kid",
		"Debit",
		"Baby Diaper x 3",
		36.6
	],
	[
		"2024-08-22",
		"Transportation",
		"Debit",
		"Engine Oil Replacement Zoomer",
		12.5
	],
	[
		"2024-08-22",
		"Food",
		"Debit",
		"Dinner",
		4.18
	],
	[
		"2024-08-22",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		3.75
	],
	[
		"2024-08-22",
		"Transportation",
		"Debit",
		"Gasoline Zoomer",
		2.62
	],
	[
		"2024-08-20",
		"Kid",
		"Credit",
		"Baby Milk Formula Stage I & II",
		120
	],
	[
		"2024-08-20",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		3
	],
	[
		"2024-08-19",
		"Personal Spending",
		"Debit",
		"Grocceries",
		35.45
	],
	[
		"2024-08-17",
		"Personal Spending",
		"Credit",
		"Dinner x 4",
		31
	],
	[
		"2024-08-17",
		"Personal Spending",
		"Credit",
		"Grocceries",
		31
	],
	[
		"2024-08-15",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		3
	],
	[
		"2024-08-14",
		"Food",
		"Debit",
		"Lunch",
		5.75
	],
	[
		"2024-08-14",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		3
	],
	[
		"2024-08-13",
		"Food",
		"Debit",
		"Dinner x 2",
		11
	],
	[
		"2024-08-13",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		2.5
	],
	[
		"2024-08-13",
		"Transportation",
		"Debit",
		"Gasoline Zoomer",
		2
	],
	[
		"2024-08-12",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		2.5
	],
	[
		"2024-08-11",
		"Food",
		"Credit",
		"Dinner x 4",
		33.7
	],
	[
		"2024-08-11",
		"Transportation",
		"Debit",
		"Gasoline Zoomer",
		2
	],
	[
		"2024-08-10",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		4
	],
	[
		"2024-08-09",
		"Personal Spending",
		"Debit",
		"Dinner",
		17.6
	],
	[
		"2024-08-09",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		4
	],
	[
		"2024-08-09",
		"Food",
		"Debit",
		"Additional Coffee",
		1.5
	],
	[
		"2024-08-08",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		3
	],
	[
		"2024-08-07",
		"Personal Spending",
		"Debit",
		"Razor Blade",
		3.16
	],
	[
		"2024-08-07",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		3
	],
	[
		"2024-08-07",
		"Food",
		"Debit",
		"Aftrnoon Coffee",
		1.5
	],
	[
		"2024-08-06",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		3
	],
	[
		"2024-08-06",
		"Transportation",
		"Debit",
		"Gasoline Zoomer",
		2
	],
	[
		"2024-08-03",
		"Personal Spending",
		"Debit",
		"Dentist Checkup",
		50
	],
	[
		"2024-08-03",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		8.5
	],
	[
		"2024-08-02",
		"Medical & Healthcare",
		"Debit",
		"Medicine",
		22.5
	],
	[
		"2024-08-02",
		"Personal Spending",
		"Debit",
		"Grocceries 7/11",
		9
	],
	[
		"2024-08-02",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		3
	],
	[
		"2024-08-02",
		"Transportation",
		"Debit",
		"Gasoline Zoomer",
		2
	],
	[
		"2024-08-01",
		"Food",
		"Debit",
		"Dinner x 4",
		24
	],
	[
		"2024-08-01",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		3
	],
	[
		"2024-07-30",
		"Transportation",
		"Debit",
		"Gasoline Zoomer",
		3.03
	],
	[
		"2024-07-30",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		2.5
	],
	[
		"2024-07-29",
		"Food",
		"Debit",
		"Breakfast + Coffee x 2",
		6
	],
	[
		"2024-07-28",
		"Food",
		"Debit",
		"Grocceries at emart24",
		5
	],
	[
		"2024-07-28",
		"Food",
		"Debit",
		"Coffee x 2",
		4.3
	],
	[
		"2024-07-27",
		"Food",
		"Debit",
		"Lunch",
		5.75
	],
	[
		"2024-07-27",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		3
	],
	[
		"2024-07-27",
		"Transportation",
		"Debit",
		"Gasoline Zoomer",
		2
	],
	[
		"2024-07-25",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		3
	],
	[
		"2024-07-23",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		3
	],
	[
		"2024-07-23",
		"Transportation",
		"Debit",
		"TukTuk TSK to Psar Tmey",
		1.75
	],
	[
		"2024-07-22",
		"Food",
		"Debit",
		"Family Breakfast x 3",
		20
	],
	[
		"2024-07-22",
		"Food",
		"Debit",
		"Breakfast x 2",
		9.25
	],
	[
		"2024-07-22",
		"Food",
		"Debit",
		"Dinner GeGe Kitchen",
		7.01
	],
	[
		"2024-07-22",
		"Food",
		"Debit",
		"Breakfast + Cofee",
		3
	],
	[
		"2024-07-22",
		"Personal Spending",
		"Debit",
		"Meeting Drink",
		1.75
	],
	[
		"2024-07-21",
		"Personal Spending",
		"Credit",
		"Dinner on  the table",
		22.49
	],
	[
		"2024-07-21",
		"Food",
		"Debit",
		"Lunch + Coffee",
		6.6
	],
	[
		"2024-07-20",
		"Food",
		"Credit",
		"Lunch at Brown",
		6.49
	],
	[
		"2024-07-19",
		"Food",
		"Debit",
		"Coffee + Breakfast",
		3
	],
	[
		"2024-07-18",
		"Food",
		"Debit",
		"Dinner Pizza Domino",
		11.6
	],
	[
		"2024-07-18",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		2
	],
	[
		"2024-07-18",
		"Transportation",
		"Debit",
		"Gasoline Zoomer",
		2
	],
	[
		"2024-07-17",
		"Food",
		"Debit",
		"Fixing FTR Moto",
		7.5
	],
	[
		"2024-07-17",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		3
	],
	[
		"2024-07-17",
		"Personal Spending",
		"Debit",
		"Additional Coffee",
		1.5
	],
	[
		"2024-07-17",
		"Personal Spending",
		"Debit",
		"TukTuk Psar Tmey to CNX",
		1.25
	],
	[
		"2024-07-16",
		"Food",
		"Debit",
		"Grocceries",
		4
	],
	[
		"2024-07-16",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		3
	],
	[
		"2024-07-16",
		"Transportation",
		"Debit",
		"ISI invoice Delivery",
		3
	],
	[
		"2024-07-16",
		"Transportation",
		"Debit",
		"Tuktuk TSK to PsarTmey",
		2
	],
	[
		"2024-07-16",
		"Transportation",
		"Debit",
		"Tuktuk CNX to Psar Tmey",
		1.75
	],
	[
		"2024-07-15",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		3.75
	],
	[
		"2024-07-14",
		"Personal Spending",
		"Debit",
		"Dinner SOERAE",
		23.8
	],
	[
		"2024-07-14",
		"Personal Spending",
		"Debit",
		"Car Gasoline",
		10
	],
	[
		"2024-07-14",
		"Personal Spending",
		"Debit",
		"FTR Gasoline",
		3.16
	],
	[
		"2024-07-13",
		"Food",
		"Debit",
		"Coffee + Breakfast",
		3
	],
	[
		"2024-07-12",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		2.75
	],
	[
		"2024-07-12",
		"Food",
		"Debit",
		"Dinner",
		2.5
	],
	[
		"2024-07-12",
		"Personal Spending",
		"Debit",
		"Additional Coffee",
		1.5
	],
	[
		"2024-07-11",
		"Food",
		"Debit",
		"Lunch",
		5.75
	],
	[
		"2024-07-11",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		3
	],
	[
		"2024-07-10",
		"Transportation",
		"Debit",
		"FTR Gasoline",
		3.32
	],
	[
		"2024-07-10",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		3
	],
	[
		"2024-07-10",
		"Personal Spending",
		"Debit",
		"Passion Soda",
		1.5
	],
	[
		"2024-07-09",
		"Food",
		"Debit",
		"Dinner",
		4.5
	],
	[
		"2024-07-09",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		3
	],
	[
		"2024-07-09",
		"Food",
		"Debit",
		"Dinner",
		2.5
	],
	[
		"2024-07-09",
		"Transportation",
		"Debit",
		"Tuktuk Psar Tmey to TSK",
		2
	],
	[
		"2024-07-09",
		"Personal Spending",
		"Debit",
		"Additional Coffee",
		1.5
	],
	[
		"2024-07-08",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		3
	],
	[
		"2024-07-08",
		"Food",
		"Debit",
		"Lunch",
		1.5
	],
	[
		"2024-07-07",
		"Kid",
		"Credit",
		"Elica Shampoo + Liquid\xA0Detergent",
		20.5
	],
	[
		"2024-07-07",
		"Personal Spending",
		"Debit",
		"Home Accessories",
		18.15
	],
	[
		"2024-07-07",
		"Kid",
		"Credit",
		"Elica Medicine Fee",
		15.95
	],
	[
		"2024-07-07",
		"Kid",
		"Debit",
		"Thailand Shipping Cost",
		15.8
	],
	[
		"2024-07-07",
		"Transportation",
		"Debit",
		"Car Gasoline",
		10
	],
	[
		"2024-07-07",
		"Personal Spending",
		"Debit",
		"DQ ice cream",
		5
	],
	[
		"2024-07-07",
		"Transportation",
		"Debit",
		"Tuktuk Chbar Ampov to TSK",
		3.5
	],
	[
		"2024-07-07",
		"Food",
		"Debit",
		"Lunch",
		2
	],
	[
		"2024-07-06",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		3
	],
	[
		"2024-07-06",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		3
	],
	[
		"2024-07-06",
		"Transportation",
		"Debit",
		"TukTuk TSK to Psar Tmey",
		1.75
	],
	[
		"2024-07-05",
		"Utilities",
		"Debit",
		"EDC Chbar Ampov",
		56.8
	],
	[
		"2024-07-05",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		3
	],
	[
		"2024-07-05",
		"Food",
		"Debit",
		"Passion Soda",
		1.5
	],
	[
		"2024-07-04",
		"Personal Spending",
		"Debit",
		"Thai Shipping Fee",
		15
	],
	[
		"2024-07-03",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		3
	],
	[
		"2024-07-03",
		"Transportation",
		"Debit",
		"TukTuk TSK to Psar Tmey",
		1.75
	],
	[
		"2024-07-02",
		"Kid",
		"Credit",
		"Formular Milk x2 Case",
		230
	],
	[
		"2024-07-02",
		"Personal Spending",
		"Credit",
		"Yahee Cream",
		20
	],
	[
		"2024-07-02",
		"Utilities",
		"Debit",
		"Internet Metfone",
		15
	],
	[
		"2024-07-02",
		"Food",
		"Debit",
		"Coffee + Breakfast",
		5.75
	],
	[
		"2024-07-02",
		"Transportation",
		"Debit",
		"Tuktuk TSK to Psar Tmey",
		1.75
	],
	[
		"2024-07-01",
		"Personal Spending",
		"Debit",
		"Dentist Checkup",
		50
	],
	[
		"2024-07-01",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		3
	],
	[
		"2024-07-01",
		"Transportation",
		"Debit",
		"Tuktuk Psar Tmey to TSK",
		1.75
	],
	[
		"2024-07-01",
		"Food",
		"Debit",
		"Lunch",
		1.5
	],
	[
		"2024-06-30",
		"Personal Spending",
		"Debit",
		"SHK Trip",
		36
	],
	[
		"2024-06-30",
		"Food",
		"Debit",
		"Coffee x 2",
		4.3
	],
	[
		"2024-06-29",
		"Food",
		"Debit",
		"AEON Grocceries",
		10
	],
	[
		"2024-06-29",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		3
	],
	[
		"2024-06-28",
		"Food",
		"Debit",
		"Dinner SOERAE Eden",
		24.5
	],
	[
		"2024-06-28",
		"Transportation",
		"Debit",
		"FTR Gasoline",
		5.1
	],
	[
		"2024-06-28",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		3
	],
	[
		"2024-06-28",
		"Transportation",
		"Debit",
		"Zoomers Gasoline",
		2
	],
	[
		"2024-06-27",
		"Saving & Investing",
		"Debit",
		"istand x 4 + sticker",
		96.77
	],
	[
		"2024-06-27",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		3
	],
	[
		"2024-06-26",
		"Personal Spending",
		"Debit",
		"Screen Prining Class 6-7 July",
		99
	],
	[
		"2024-06-26",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		3
	],
	[
		"2024-06-25",
		"Food",
		"Debit",
		"Congee Dinner",
		6.65
	],
	[
		"2024-06-25",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		3
	],
	[
		"2024-06-25",
		"Transportation",
		"Debit",
		"Gasoline",
		2
	],
	[
		"2024-06-25",
		"Food",
		"Debit",
		"Buger Lunch",
		1.5
	],
	[
		"2024-06-24",
		"Food",
		"Debit",
		"Dinner",
		3.5
	],
	[
		"2024-06-24",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		3
	],
	[
		"2024-06-24",
		"Transportation",
		"Debit",
		"Tuktuk from TSK to CNX",
		3
	],
	[
		"2024-06-24",
		"Transportation",
		"Debit",
		"Transportation Koh Pich to Charampov",
		2.5
	],
	[
		"2024-06-23",
		"Food",
		"Debit",
		"Family Dinner x 4",
		22
	],
	[
		"2024-06-23",
		"Food",
		"Debit",
		"Grocceries",
		15
	],
	[
		"2024-06-23",
		"Kid",
		"Debit",
		"Item Delivery from Thailand",
		15
	],
	[
		"2024-06-23",
		"Food",
		"Debit",
		"Breakfast x 2",
		10
	],
	[
		"2024-06-23",
		"Food",
		"Debit",
		"Coffee x 2",
		4.3
	],
	[
		"2024-06-22",
		"Kid",
		"Debit",
		"Baby Diaper & Acessories",
		55
	],
	[
		"2024-06-22",
		"Food",
		"Debit",
		"Family Dinner x 2",
		32
	],
	[
		"2024-06-22",
		"Food",
		"Debit",
		"Family Dinner x 4",
		25
	],
	[
		"2024-06-22",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		3
	],
	[
		"2024-06-21",
		"Food",
		"Debit",
		"Breakfast + Coffee",
		2.75
	],
	[
		"2024-06-21",
		"Food",
		"Debit",
		"Brown Coffee - Client Meeting",
		2.65
	],
	[
		"2024-06-21",
		"Food",
		"Debit",
		"Lunch",
		2.5
	],
	[
		"2024-06-20",
		"Kid",
		"Credit",
		"Toddler Chair, Baby Food Making, and other accessories",
		75
	],
	[
		"2024-06-20",
		"Food",
		"Debit",
		"Burger Dinner",
		7
	],
	[
		"2024-06-20",
		"Food",
		"Debit",
		"Habbit Burger Dinner",
		7
	],
	[
		"2024-06-20",
		"Food",
		"Debit",
		"Breakfast",
		2.25
	],
	[
		"2024-06-20",
		"Food",
		"Debit",
		"Coffee",
		2.15
	],
	[
		"2024-06-20",
		"Transportation",
		"Debit",
		"Gasoline",
		2
	],
	[
		"2024-06-19",
		"Food",
		"Debit",
		"Pizza for Dinner",
		11.6
	],
	[
		"2024-06-19",
		"Food",
		"Debit",
		"Breakfast",
		1.5
	],
	[
		"2024-06-19",
		"Food",
		"Debit",
		"Coffee",
		1.5
	]
];
function buildPersonalExpenses() {
	return PERSONAL_TUPLES.map(([date, category, vendor, description, amount], i) => ({
		id: `e-ps-${String(i + 1).padStart(4, "0")}`,
		date,
		projectId: "",
		category,
		vendor,
		description,
		amount,
		currency: "USD",
		receipt: "",
		account: "Personal"
	}));
}
//#endregion
//#region src/lib/rothvan-seed.ts
var rothvanClients = [
	{
		id: "cl-rvd-49",
		code: "RVD-49",
		name: "APLE Cambodia — Piseth Nhem",
		type: "NGO",
		industry: "ngo",
		contact: "Piseth Nhem",
		email: "",
		telegram: "",
		phone: "+855 92 998 774",
		source: "Returning client",
		status: "Active",
		notes: "Origin: Cambodia · B2B Account: APLE Cambodia",
		position: "Content Analyst",
		address: "Fortune Tower C7, Olympic",
		website: "https://aplecambodia.org/en/",
		preferredContact: "Phone"
	},
	{
		id: "cl-rvd-50",
		code: "RVD-50",
		name: "doughtelier donut",
		type: "SME",
		industry: "F&B",
		contact: "Ly Andy",
		email: "",
		telegram: "@itsandyly",
		phone: "",
		source: "Returning client",
		status: "Active",
		notes: "Origin: Khmer-New Zealand",
		position: "Business Owner",
		address: "Nelson, New Zealand",
		preferredContact: "Telegram"
	},
	{
		id: "cl-rvd-51",
		code: "RVD-51",
		name: "ISI Group — Sovann Chrinn",
		type: "Enterprise",
		industry: "",
		contact: "Sovann Chrinn",
		email: "",
		telegram: "@ChrinSovann",
		phone: "+855 61 880 888",
		source: "Referral",
		status: "Active",
		notes: "Origin: Khmer",
		position: "Head",
		address: "K-Mall, Veng Sreng",
		preferredContact: "Telegram"
	},
	{
		id: "cl-rvd-53",
		code: "RVD-53",
		name: "WeLoy",
		type: "SME",
		industry: "",
		contact: "Lisa Juliette",
		email: "",
		telegram: "@LisaVill",
		phone: "",
		source: "Referral",
		status: "Active",
		notes: "Origin: French",
		position: "CEO",
		address: "Aquation Park, Koh Pich",
		website: "weloy.asia",
		preferredContact: "Telegram"
	},
	{
		id: "cl-rvd-54",
		code: "RVD-54",
		name: "Kim Hour",
		type: "SME",
		industry: "",
		contact: "Te Kimsreng",
		email: "",
		telegram: "@Kim_3008",
		phone: "",
		source: "Referral",
		status: "Active",
		notes: "Origin: Khmer",
		position: "Business Owner",
		preferredContact: "Telegram"
	},
	{
		id: "cl-rvd-55",
		code: "RVD-55",
		name: "APLE Cambodia — PHAY SOPHEAK",
		type: "NGO",
		industry: "NGO",
		contact: "PHAY SOPHEAK",
		email: "",
		telegram: "",
		phone: "+855 92 469 970",
		source: "Returning client",
		status: "Active",
		notes: "Origin: Khmer · B2B Account: APLE Cambodia",
		position: "CJD TEAM LEADER",
		address: "Fortune Tower C7, Olympic",
		website: "https://aplecambodia.org/en/",
		preferredContact: "Phone"
	},
	{
		id: "cl-rvd-56",
		code: "RVD-56",
		name: "Techflow",
		type: "Enterprise",
		industry: "audit firm",
		contact: "Maximilien Grolier",
		email: "",
		telegram: "@maxgrolier",
		phone: "+855 96 312 5447",
		source: "Returning client",
		status: "Active",
		notes: "Origin: French",
		position: "Founder & CEO",
		address: "Aquation Park, Koh Pich",
		website: "https://www.techflow-agency.com/",
		preferredContact: "Telegram"
	},
	{
		id: "cl-rvd-57",
		code: "RVD-57",
		name: "Namas.K",
		type: "SME",
		industry: "veterinary-clinic",
		contact: "Te Linna",
		email: "",
		telegram: "",
		phone: "+855 78 63 63 92",
		source: "Returning client",
		status: "Active",
		notes: "Origin: Khmer",
		position: "Business Owner",
		preferredContact: "Phone"
	},
	{
		id: "cl-rvd-58",
		code: "RVD-58",
		name: "BSG Vet",
		type: "SME",
		industry: "",
		contact: "Aw",
		email: "",
		telegram: "@hooaww868",
		phone: "",
		source: "Referral",
		status: "Lead",
		notes: "Origin: Khmer",
		position: "Business Owner",
		preferredContact: "Telegram"
	},
	{
		id: "cl-rvd-59",
		code: "RVD-59",
		name: "OCS.MKT",
		type: "Owner-operated",
		industry: "",
		contact: "OCS.MKT",
		email: "",
		telegram: "",
		phone: "+855 95 209 111",
		source: "Referral",
		status: "Lead",
		notes: "Origin: Khmer",
		position: "MKT",
		preferredContact: "Phone"
	},
	{
		id: "cl-rvd-60",
		code: "RVD-60",
		name: "Seng Heng",
		type: "Owner-operated",
		industry: "",
		contact: "Seng Heng",
		email: "",
		telegram: "@HongSengheng",
		phone: "+855 16 266 333",
		source: "Referral",
		status: "Lead",
		notes: "Origin: Khmer",
		position: "Business Owner",
		preferredContact: "Telegram"
	},
	{
		id: "cl-rvd-61",
		code: "RVD-61",
		name: "Greeneco — Sunglim C",
		type: "SME",
		industry: "",
		contact: "Sunglim C",
		email: "",
		telegram: "@sunglim",
		phone: "",
		source: "Returning client",
		status: "Active",
		notes: "Origin: Khmer",
		position: "Business Owner",
		preferredContact: "Telegram"
	},
	{
		id: "cl-rvd-62",
		code: "RVD-62",
		name: "Ke Eak Chiv",
		type: "Owner-operated",
		industry: "",
		contact: "Ke Eak Chiv",
		email: "",
		telegram: "@Chivkeeak",
		phone: "+855 11 222 001",
		source: "Referral",
		status: "Active",
		notes: "Origin: Khmer",
		position: "Business Owner",
		preferredContact: "Telegram"
	},
	{
		id: "cl-rvd-63",
		code: "RVD-63",
		name: "Coral Dental Clinic",
		type: "SME",
		industry: "",
		contact: "Te Sokchan",
		email: "",
		telegram: "@tesokchan",
		phone: "+855 98 882 434",
		source: "Referral",
		status: "Active",
		notes: "Origin: Khmer",
		position: "Business Owner",
		preferredContact: "Telegram"
	},
	{
		id: "cl-rvd-64",
		code: "RVD-64",
		name: "Rosa",
		type: "Owner-operated",
		industry: "",
		contact: "Rosa",
		email: "",
		telegram: "@rosanhimkhemara",
		phone: "+65 8106 2608",
		source: "Referral",
		status: "Lead",
		notes: "Origin: Khmer",
		position: "Business Owner",
		preferredContact: "Telegram"
	},
	{
		id: "cl-rvd-65",
		code: "RVD-65",
		name: "Eliza Boutique — VouchNai",
		type: "SME",
		industry: "",
		contact: "VouchNai",
		email: "",
		telegram: "",
		phone: "+855 66 522 811",
		source: "Referral",
		status: "Lead",
		notes: "Origin: Khmer",
		position: "Business Owner",
		preferredContact: "Phone"
	},
	{
		id: "cl-rvd-66",
		code: "RVD-66",
		name: "Eliza Boutique — Sothy",
		type: "SME",
		industry: "",
		contact: "Sothy",
		email: "",
		telegram: "",
		phone: "+855 77 211 119",
		source: "Referral",
		status: "Lead",
		notes: "Origin: Khmer",
		position: "Business Owner",
		preferredContact: "Phone"
	},
	{
		id: "cl-rvd-68",
		code: "RVD-68",
		name: "Greeneco — Chen",
		type: "SME",
		industry: "",
		contact: "Chen",
		email: "",
		telegram: "",
		phone: "",
		source: "Returning client",
		status: "Active",
		notes: ""
	},
	{
		id: "cl-rvd-67",
		code: "RVD-67",
		name: "Redland Bakehouse",
		type: "SME",
		industry: "",
		contact: "Seethuong Saise",
		email: "",
		telegram: "",
		phone: "+61 488 884 999",
		source: "Returning client",
		status: "Active",
		notes: "Origin: Australia",
		position: "Business Owner",
		preferredContact: "Phone"
	},
	{
		id: "cl-rvd-71",
		code: "RVD-71",
		name: "Infinite Sport Club",
		type: "SME",
		industry: "",
		contact: "Dara Nek",
		email: "",
		telegram: "",
		phone: "",
		source: "Referral",
		status: "Active",
		notes: "Origin: Cambodia",
		position: "Business Owner"
	},
	{
		id: "cl-rvd-70",
		code: "RVD-70",
		name: "Beoung Snor Food Village",
		type: "SME",
		industry: "",
		contact: "Vannet Voeun",
		email: "",
		telegram: "",
		phone: "+855 85 979 687",
		source: "Returning client",
		status: "Active",
		notes: "Origin: Cambodia",
		address: "National Road 1",
		preferredContact: "Phone"
	},
	{
		id: "cl-rvd-69",
		code: "RVD-69",
		name: "APLE Cambodia — Him Sophorn",
		type: "NGO",
		industry: "NGO",
		contact: "Him Sophorn",
		email: "",
		telegram: "@Him_Sophorn",
		phone: "+855 92 972 210",
		source: "Returning client",
		status: "Active",
		notes: "Origin: Cambodia · B2B Account: APLE Cambodia",
		position: "Victim Support Team Leader",
		address: "Fortune Tower C7, Olympic",
		website: "https://aplecambodia.org/en/",
		preferredContact: "Telegram"
	},
	{
		id: "cl-rvd-52",
		code: "RVD-52",
		name: "ISI Group — San Sameydy",
		type: "Enterprise",
		industry: "",
		contact: "San Sameydy",
		email: "",
		telegram: "@sameydysan",
		phone: "+855 96 433 2222",
		source: "Referral",
		status: "Lead",
		notes: "Origin: Cambodia",
		address: "K-Mall, Veng Sreng",
		preferredContact: "Telegram"
	},
	{
		id: "cl-rvd-72",
		code: "RVD-72",
		name: "RothVan",
		type: "Owner-operated",
		industry: "",
		contact: "RothVan",
		email: "",
		telegram: "",
		phone: "",
		source: "Returning client",
		status: "Active",
		notes: "Origin: Cambodia"
	},
	{
		id: "cl-rvd-73",
		code: "RVD-73",
		name: "KromChan",
		type: "Owner-operated",
		industry: "",
		contact: "KromChan",
		email: "",
		telegram: "",
		phone: "",
		source: "Referral",
		status: "Lead",
		notes: ""
	},
	{
		id: "cl-rvd-74",
		code: "RVD-74",
		name: "APLE Cambodia — Ny Potthearen",
		type: "NGO",
		industry: "NGO",
		contact: "Ny Potthearen",
		email: "",
		telegram: "",
		phone: "",
		source: "Referral",
		status: "Lead",
		notes: "B2B Account: APLE Cambodia",
		position: "Finance Officer",
		website: "https://aplecambodia.org/en/"
	},
	{
		id: "cl-rvd-76",
		code: "RVD-76",
		name: "APLE Cambodia — Vannak Neng",
		type: "NGO",
		industry: "NGO",
		contact: "Vannak Neng",
		email: "",
		telegram: "",
		phone: "+855 99 615 990",
		source: "Referral",
		status: "Active",
		notes: "Origin: Cambodia · B2B Account: APLE Cambodia",
		position: "Program Coordinator",
		address: "Fortune Tower C7, Olympic",
		website: "https://aplecambodia.org/en/",
		preferredContact: "Phone"
	},
	{
		id: "cl-rvd-78",
		code: "RVD-78",
		name: "TIA Engineering Service Company — Khoun Channy",
		type: "SME",
		industry: "",
		contact: "Khoun Channy",
		email: "",
		telegram: "",
		phone: "",
		source: "Referral",
		status: "Lead",
		notes: "Origin: Cambodia",
		position: "HR"
	},
	{
		id: "cl-rvd-79",
		code: "RVD-79",
		name: "The Mall Company",
		type: "Enterprise",
		industry: "",
		contact: "Simon",
		email: "",
		telegram: "",
		phone: "",
		source: "Returning client",
		status: "Active",
		notes: "",
		position: "Business Owner"
	},
	{
		id: "cl-rvd-80",
		code: "RVD-80",
		name: "GoldWOK",
		type: "SME",
		industry: "",
		contact: "So RattannacSattya",
		email: "",
		telegram: "",
		phone: "",
		source: "Referral",
		status: "Active",
		notes: "",
		position: "Business Owner"
	},
	{
		id: "cl-rvd-81",
		code: "RVD-81",
		name: "TIA Engineering Service Company — Derwin Sandal",
		type: "SME",
		industry: "aviation-mro",
		contact: "Derwin Sandal",
		email: "",
		telegram: "",
		phone: "",
		source: "Returning client",
		status: "Active",
		notes: "",
		position: "General Manager"
	},
	{
		id: "cl-rvd-82",
		code: "RVD-82",
		name: "The RedHouse",
		type: "SME",
		industry: "restaurants-&-cafes",
		contact: "Mana Koi",
		email: "",
		telegram: "",
		phone: "",
		source: "Referral",
		status: "Active",
		notes: "",
		position: "Business Owner"
	},
	{
		id: "cl-rvd-83",
		code: "RVD-83",
		name: "OCIC",
		type: "Enterprise",
		industry: "tourism",
		contact: "Kuy Kymeng",
		email: "",
		telegram: "",
		phone: "+855 12 958 448",
		source: "Returning client",
		status: "Active",
		notes: "Origin: Cambodia",
		position: "Business Owner",
		address: "Siemreap, Cambodia",
		preferredContact: "Phone"
	},
	{
		id: "cl-rvd-84",
		code: "RVD-84",
		name: "Z Elica Neou",
		type: "Owner-operated",
		industry: "",
		contact: "Z Elica Neou",
		email: "",
		telegram: "",
		phone: "",
		source: "Referral",
		status: "Lead",
		notes: "",
		position: "design manager",
		website: "rothvan.framer"
	},
	{
		id: "cl-rvd-85",
		code: "RVD-85",
		name: "PQ",
		type: "Owner-operated",
		industry: "",
		contact: "PQ",
		email: "",
		telegram: "",
		phone: "",
		source: "Returning client",
		status: "Active",
		notes: ""
	},
	{
		id: "cl-rvd-86",
		code: "RVD-86",
		name: "IRD",
		type: "SME",
		industry: "Agriculture",
		contact: "Kakada OEUM (អឿម កក្កដា)",
		email: "kakadaoeum9797@gmail.com",
		telegram: "@Kakada_Oeum",
		phone: "+855 78 420 528",
		source: "Referral",
		status: "Active",
		notes: "Origin: French · B2B Account: IRD",
		position: "Founder, Ph.D",
		address: "Phnom Penh",
		preferredContact: "Telegram"
	}
];
var rothvanServices = [
	{
		id: "srv-1",
		code: "BD-01",
		pillar: "Branding Design",
		name: "Logo Branding I",
		unit: "Fixed fee",
		rate: 100,
		scope: "2 Unique Logo Concepts\nResearch & Concept Development\nLogo Refinement & Selection\nFinal logo in AI, EPS, PDF, PNG, JPG\nBlack/white & color versions\nBasic Brand GuideStyle\nVisual Mockups",
		timeline: "5 Days",
		overage: 10
	},
	{
		id: "srv-2",
		code: "CA-01",
		pillar: "Creative Assets",
		name: "Promo Post / Cover",
		unit: "Fixed fee",
		rate: 25,
		scope: "Square / Landscape Layout Design\nPromo theme + CTA\nWeb-friendly JPEG/PNG\nEditable source file (AI/PSD)",
		timeline: "2 Days",
		overage: 10
	},
	{
		id: "srv-3",
		code: "WA-01",
		pillar: "Web & App Design",
		name: "Homepage",
		unit: "Fixed fee",
		rate: 300,
		scope: "UI/UX layout\nNavigation Section\nHero Section, features, contact\nFooter section\nDesktop & mobile mockup\nRealtime Prototpye\nFigma or XD file\nJPG/PNG preview\nDesign assets (icons/images)\nVisual Mockups",
		timeline: "15 Days",
		overage: 25
	},
	{
		id: "srv-4",
		code: "BD-02",
		pillar: "Branding Design",
		name: "Brand GuideStyle I",
		unit: "Fixed fee",
		rate: 25,
		scope: "Logo usage rules\nBrand color palette\nTypography usage\nBasic layout examples\n1 Page PDF guide\nEditable source file (AI/PSD)\nVisual Mockups (if needed)",
		timeline: "3 Days",
		overage: 10
	},
	{
		id: "srv-5",
		code: "MC-01",
		pillar: "Marketing Collateral",
		name: "Business Card",
		unit: "Fixed fee",
		rate: 25,
		scope: "2 Concept Design layout\nLogo & contact info integration\nPrint-ready AI file (CMYK)\nEditable source file (AI/PSD)\nVisual Mockups",
		timeline: "2 Days",
		overage: 10
	},
	{
		id: "srv-6",
		code: "SD-01",
		pillar: "Spatial Design",
		name: "Billboard / Banner / Hoarding",
		unit: "Fixed fee",
		rate: 150,
		scope: "Print-size setup (no larger than 300cm x 500cm)\nBranding integration\nCMYK setup\nPrint-ready scaling\nPrint-ready AI file (CMYK)\nWeb-friendly JPEG/PNG\nEditable source file (AI/PSD)\nVisual Mockups",
		timeline: "3 Days",
		overage: 25
	},
	{
		id: "srv-7",
		code: "MC-02",
		pillar: "Marketing Collateral",
		name: "Brochure / Documents / Anual Report",
		unit: "Fixed fee",
		rate: 150,
		scope: "Custom layout design (bi-fold, tri-fold, or multi-page)\nTypography & grid systems\nInfographic and data visualization\nVisual and brand alignment\nPrint & digital version formatting\nPrint-ready AI file (CMYK)\nWeb-friendly JPEG/PNG\nEditable source file (AI/PSD)\nVisual Mockups",
		timeline: "3 Days",
		overage: 25
	},
	{
		id: "srv-8",
		code: "MC-03",
		pillar: "Marketing Collateral",
		name: "Backdrop",
		unit: "Fixed fee",
		rate: 150,
		scope: "Custom size design  (no larger than 300cm x 500cm)\nTheme-based layout\nSponsor/logo integration\nPrint-ready AI file (CMYK)\nWeb-friendly JPEG/PNG\nVisual Mockups",
		timeline: "3 Days",
		overage: 25
	},
	{
		id: "srv-9",
		code: "MC-04",
		pillar: "Marketing Collateral",
		name: "Photo Booth",
		unit: "Fixed fee",
		rate: 120,
		scope: "Creative theme illustration\nText placement\nCustom cut line if needed\nPrint-ready AI file (CMYK)\nWeb-friendly JPEG/PNG\nVisual Mockups",
		timeline: "3 Days",
		overage: 10
	},
	{
		id: "srv-10",
		code: "SD-02",
		pillar: "Spatial Design",
		name: "Logo LED",
		unit: "Fixed fee",
		rate: 120,
		scope: "Vector outline & layout\nMaterial & lighting mock suggestion\nPrint-ready AI file (CMYK)\nWeb-friendly JPEG/PNG\nVisual Mockups",
		timeline: "2 Days",
		overage: 10
	},
	{
		id: "srv-11",
		code: "MC-05",
		pillar: "Marketing Collateral",
		name: "Eco Bag / Tote Bag",
		unit: "Fixed fee",
		rate: 60,
		scope: "Front/back layout\nBrand + illustration design\nVisual and brand alignment\nPrint & digital version formatting\nPrint-ready AI file (CMYK)\nWeb-friendly JPEG/PNG\nEditable source file (AI/PSD)\nVisual Mockups",
		timeline: "2 Days",
		overage: 10
	},
	{
		id: "srv-12",
		code: "SD-03",
		pillar: "Spatial Design",
		name: "Parking Signage",
		unit: "Fixed fee",
		rate: 80,
		scope: "Custom size design  (no larger than 60cm x 240cm)\nIcon & symbol design\nConsistent signage system\nReadability optimization\nArrow, icon & color coding\nLayout based on sign specs\nPrint-ready AI file (CMYK)\nWeb-friendly JPEG/PNG\nVisual Mockups",
		timeline: "3 Days",
		overage: 10
	},
	{
		id: "srv-13",
		code: "SD-04",
		pillar: "Spatial Design",
		name: "Wayfinding / General Signage",
		unit: "Fixed fee",
		rate: 80,
		scope: "Custom size design  (no larger than 30cm x 120cm)\nIcon & symbol design\nConsistent signage system\nReadability optimization\nArrow, icon & color coding\nLayout based on sign specs\nPrint-ready AI file (CMYK)\nWeb-friendly JPEG/PNG\nVisual Mockups",
		timeline: "3 Days",
		overage: 10
	},
	{
		id: "srv-14",
		code: "SD-05",
		pillar: "Spatial Design",
		name: "Building Directory Board",
		unit: "Fixed fee",
		rate: 150,
		scope: "Floor layout or listing design\nReadability optimization\nCustom size design  (no larger than 300cm x 500cm)\nLayout based on sign specs\nPrint-ready AI file (CMYK)\nWeb-friendly JPEG/PNG\nVisual Mockups",
		timeline: "3 Days",
		overage: 25
	},
	{
		id: "srv-15",
		code: "SD-06",
		pillar: "Spatial Design",
		name: "Arc / Entrance",
		unit: "Fixed fee",
		rate: 250,
		scope: "Custom size design  (no larger than 300cm x 500cm)\n3D-style or illustrated arc\nStructural cut-line reference\nPrint-ready AI file (CMYK)\nWeb-friendly JPEG/PNG\nVisual Mockups",
		timeline: "5 Days",
		overage: 25
	},
	{
		id: "srv-16",
		code: "SD-07",
		pillar: "Spatial Design",
		name: "Pylon / Totem",
		unit: "Fixed fee",
		rate: 200,
		scope: "Custom size design  (no larger than W300cm x H1200cm x D60cm)\nLogo Lightbox Layout Design\nReadability optimization\nLayout based on sign specs\nPrint-ready AI file (CMYK)\nWeb-friendly JPEG/PNG\nVisual Mockups",
		timeline: "5 Days",
		overage: 25
	},
	{
		id: "srv-17",
		code: "MC-06",
		pillar: "Marketing Collateral",
		name: "Die-Cut Foam Board / Props",
		unit: "Fixed fee",
		rate: 50,
		scope: "Custom size design  (no larger than 100cm x 100cm)\nReadability optimization\nLayout based on sign specs\nPrint-ready AI file (CMYK)\nWeb-friendly JPEG/PNG\nVisual Mockups",
		timeline: "2 Days",
		overage: 10
	},
	{
		id: "srv-18",
		code: "MC-07",
		pillar: "Marketing Collateral",
		name: "Business Letterhead",
		unit: "Fixed fee",
		rate: 25,
		scope: "Layout design\nIncorporate logo, address, contacts\nPrint & digital format\nPrint-ready AI file (CMYK)\nEditable source file (AI/PSD)\nWeb-friendly JPEG/PNG\nVisual Mockups",
		timeline: "2 Days",
		overage: 10
	},
	{
		id: "srv-19",
		code: "MC-08",
		pillar: "Marketing Collateral",
		name: "Business Folder",
		unit: "Fixed fee",
		rate: 45,
		scope: "Outer & inner design layout\nLogo, branding elements\nBusiness card slot mockup (if needed)\nPrint-ready AI file (CMYK)\nEditable source file (AI/PSD)\nWeb-friendly JPEG/PNG\nVisual Mockups",
		timeline: "3 Days",
		overage: 10
	},
	{
		id: "srv-20",
		code: "MC-09",
		pillar: "Marketing Collateral",
		name: "Pitch Decks / Company Profile",
		unit: "Fixed fee",
		rate: 300,
		scope: "Max. 12 slides/pages\nBranding integration\nIcon/graphic design\nContent formatting\nPDF format\nWeb-friendly JPEG/PNG\nEditable PowerPoint or Google Slides file\nEditable source file (AI/PSD)\nVisual Mockups",
		timeline: "10 Days",
		overage: 25
	},
	{
		id: "srv-21",
		code: "PP-01",
		pillar: "Product Packaging",
		name: "Packaging",
		unit: "Fixed fee",
		rate: 150,
		scope: "Custom size design  (no larger than W100cm x H100cm x D100cm)\nBox/bag/label layout\nDie-line template use\nTypography & style guide\nPrint-ready AI file (CMYK)\nWeb-friendly JPEG/PNG\nVisual Mockups",
		timeline: "5 Days",
		overage: 25
	},
	{
		id: "srv-22",
		code: "MC-10",
		pillar: "Marketing Collateral",
		name: "Polo Shirt",
		unit: "Fixed fee",
		rate: 35,
		scope: "Front/back layout\nBrand + illustration design\nVisual and brand alignment\nPrint & digital version formatting\nPrint-ready AI file (CMYK)\nWeb-friendly JPEG/PNG\nEditable source file (AI/PSD)\nVisual Mockups",
		timeline: "3 Days",
		overage: 10
	},
	{
		id: "srv-23",
		code: "MC-11",
		pillar: "Marketing Collateral",
		name: "Promo Flyer A5",
		unit: "Fixed fee",
		rate: 20,
		scope: "A5 layout design\nTypography & image integration\nPromo message layout\nPrint-ready AI file (CMYK)\nEditable source file (AI/PSD)\nWeb-friendly JPEG/PNG\nVisual Mockups",
		timeline: "3 Days",
		overage: 10
	},
	{
		id: "srv-24",
		code: "CA-02",
		pillar: "Creative Assets",
		name: "Grand / Soft Opening Post",
		unit: "Fixed fee",
		rate: 100,
		scope: "Static Design (Instagram/FB).\nCaption writing support (optional).\nWeb-friendly JPEG/PNG\nEditable source file (AI/PSD)",
		timeline: "2 Days",
		overage: 10
	},
	{
		id: "srv-25",
		code: "CA-03",
		pillar: "Creative Assets",
		name: "Digital Invitation",
		unit: "Fixed fee",
		rate: 35,
		scope: "Single-page design with Location QR link\nMobile-optimized layout\nWeb-friendly JPEG/PNG\nEditable source file (AI/PSD)",
		timeline: "2 Days",
		overage: 10
	},
	{
		id: "srv-26",
		code: "MC-12",
		pillar: "Marketing Collateral",
		name: "Rolling-Up Stand Design",
		unit: "Fixed fee",
		rate: 65,
		scope: "X-Stand/I-Stand layout\nKey brand elements\nHigh-resolution setup for large print\nPrint-ready AI file (CMYK)\nWeb-friendly JPEG/PNG\nVisual Mockups",
		timeline: "3 Days",
		overage: 10
	},
	{
		id: "srv-27",
		code: "BD-03",
		pillar: "Branding Design",
		name: "Brand GuideStyle II",
		unit: "Fixed fee",
		rate: 250,
		scope: "Logo usage rules\nBrand color palette\nTypography usage\nBasic layout examples\nBrand voice & messaging\nImagery direction\nLayout & collateral application\nSocial & digital branding rules\n15–20 page PDF guide\nSource files\nLogo + branding applications (mockups)\nGrid & spacing rules\nVisual Mockups (if needed)",
		timeline: "3 Days",
		overage: 25
	},
	{
		id: "srv-28",
		code: "BD-04",
		pillar: "Branding Design",
		name: "Logo Rebranding",
		unit: "Fixed fee",
		rate: 50,
		scope: "2 Unique Logo Concepts\nResearch & Concept Development\nLogo Refinement & Selection\nFinal logo in AI, EPS, PDF, PNG, JPG\nBlack/white & color versions\nBasic Brand GuideStyle\nVisual Mockups",
		timeline: "3 Days",
		overage: 10
	}
];
var rothvanProjects = [
	{
		id: "pj-1",
		code: "RVD-101",
		clientId: "cl-rvd-61",
		serviceId: "srv-21",
		name: "Greeneco - Packaging",
		status: "Closed",
		start: "2022-12-11",
		due: "2022-12-11",
		delivered: "2022-12-11",
		quote: 260
	},
	{
		id: "pj-2",
		code: "RVD-102",
		clientId: "cl-rvd-49",
		serviceId: "srv-9",
		name: "APLE SID 2023",
		status: "Closed",
		start: "2023-02-06",
		due: "2023-02-06",
		delivered: "2023-02-06",
		quote: 635
	},
	{
		id: "pj-3",
		code: "RVD-103",
		clientId: "cl-rvd-63",
		serviceId: "srv-1",
		name: "Coral Dental Clinic",
		status: "Closed",
		start: "2023-02-08",
		due: "2023-02-08",
		delivered: "2023-02-08",
		quote: 170
	},
	{
		id: "pj-4",
		code: "RVD-104",
		clientId: "cl-rvd-72",
		serviceId: "srv-22",
		name: "Bayond Over Size Shirt",
		status: "Closed",
		start: "2023-02-11",
		due: "2023-02-11",
		delivered: "2023-02-11",
		quote: 35
	},
	{
		id: "pj-5",
		code: "RVD-105",
		clientId: "cl-rvd-50",
		serviceId: "srv-1",
		name: "94 Bakery - Full",
		status: "Closed",
		start: "2023-03-12",
		due: "2023-03-12",
		delivered: "2023-03-12",
		quote: 60
	},
	{
		id: "pj-6",
		code: "RVD-106",
		clientId: "cl-rvd-50",
		serviceId: "srv-1",
		name: "T Lab - Full",
		status: "Closed",
		start: "2023-03-12",
		due: "2023-03-12",
		delivered: "2023-03-12",
		quote: 60
	},
	{
		id: "pj-7",
		code: "RVD-107",
		clientId: "cl-rvd-49",
		serviceId: "srv-7",
		name: "APLE Annual Report",
		status: "Closed",
		start: "2023-03-20",
		due: "2023-03-20",
		delivered: "2023-03-20",
		quote: 420
	},
	{
		id: "pj-8",
		code: "RVD-108",
		clientId: "cl-rvd-50",
		serviceId: "srv-1",
		name: "AJ BakeHouse Logo - Full",
		status: "Closed",
		start: "2023-04-15",
		due: "2023-04-15",
		delivered: "2023-04-15",
		quote: 60
	},
	{
		id: "pj-9",
		code: "RVD-109",
		clientId: "cl-rvd-50",
		serviceId: "srv-1",
		name: "TOS Nham Logo - Full",
		status: "Closed",
		start: "2023-04-21",
		due: "2023-04-21",
		delivered: "2023-04-21",
		quote: 100
	},
	{
		id: "pj-10",
		code: "RVD-110",
		clientId: "cl-rvd-50",
		serviceId: "srv-1",
		name: "10/10 Donut Logo",
		status: "Closed",
		start: "2023-05-14",
		due: "2023-05-14",
		delivered: "2023-05-14",
		quote: 60
	},
	{
		id: "pj-11",
		code: "RVD-111",
		clientId: "cl-rvd-61",
		serviceId: "srv-21",
		name: "Greeneco Revise V3 - Full",
		status: "Closed",
		start: "2023-05-19",
		due: "2023-05-19",
		delivered: "2023-05-19",
		quote: 15
	},
	{
		id: "pj-12",
		code: "RVD-112",
		clientId: "cl-rvd-49",
		serviceId: "srv-7",
		name: "APLE Certificate - Full",
		status: "Closed",
		start: "2023-06-09",
		due: "2023-06-09",
		delivered: "2023-06-09",
		quote: 17.5
	},
	{
		id: "pj-13",
		code: "RVD-113",
		clientId: "cl-rvd-62",
		serviceId: "srv-1",
		name: "Le Gift",
		status: "Closed",
		start: "2023-06-14",
		due: "2023-06-14",
		delivered: "2023-06-14",
		quote: 80
	},
	{
		id: "pj-14",
		code: "RVD-114",
		clientId: "cl-rvd-49",
		serviceId: "srv-2",
		name: "Pisey Chat Bot",
		status: "Closed",
		start: "2023-08-07",
		due: "2023-08-07",
		delivered: "2023-08-07",
		quote: 577.5
	},
	{
		id: "pj-15",
		code: "RVD-115",
		clientId: "cl-rvd-50",
		serviceId: "srv-1",
		name: "Andy’s Pie Co - Full",
		status: "Closed",
		start: "2023-08-15",
		due: "2023-08-15",
		delivered: "2023-08-15",
		quote: 80
	},
	{
		id: "pj-16",
		code: "RVD-116",
		clientId: "cl-rvd-79",
		serviceId: "srv-7",
		name: "PPM Service Brochure",
		status: "Closed",
		start: "2023-08-21",
		due: "2023-08-21",
		delivered: "2023-08-21",
		quote: 400
	},
	{
		id: "pj-17",
		code: "RVD-117",
		clientId: "cl-rvd-50",
		serviceId: "srv-1",
		name: "AJ Logo - Full",
		status: "Closed",
		start: "2023-08-22",
		due: "2023-08-22",
		delivered: "2023-08-22",
		quote: 80
	},
	{
		id: "pj-18",
		code: "RVD-118",
		clientId: "cl-rvd-60",
		serviceId: "srv-3",
		name: "SabongMK UX UI  mobile app 30%",
		status: "Lost",
		start: "2023-09-01",
		due: "2023-09-01",
		delivered: "",
		quote: 300
	},
	{
		id: "pj-19",
		code: "RVD-119",
		clientId: "cl-rvd-79",
		serviceId: "srv-7",
		name: "Property Flyer Template Realeste.com.kh",
		status: "Closed",
		start: "2023-09-07",
		due: "2023-09-07",
		delivered: "2023-09-07",
		quote: 100
	},
	{
		id: "pj-20",
		code: "RVD-120",
		clientId: "cl-rvd-79",
		serviceId: "srv-7",
		name: "In Focus Research 50%",
		status: "Lost",
		start: "2023-09-07",
		due: "2023-09-07",
		delivered: "",
		quote: 130
	},
	{
		id: "pj-21",
		code: "RVD-121",
		clientId: "cl-rvd-55",
		serviceId: "srv-7",
		name: "APLE TNA",
		status: "Closed",
		start: "2023-09-11",
		due: "2023-09-11",
		delivered: "2023-09-11",
		quote: 432
	},
	{
		id: "pj-22",
		code: "RVD-122",
		clientId: "cl-rvd-79",
		serviceId: "srv-7",
		name: "Time Square 302 - Sale Brochure",
		status: "Closed",
		start: "2023-09-25",
		due: "2023-09-25",
		delivered: "2023-09-25",
		quote: 350
	},
	{
		id: "pj-23",
		code: "RVD-123",
		clientId: "cl-rvd-67",
		serviceId: "srv-6",
		name: "Redlands Bakehouse Menu Design",
		status: "Closed",
		start: "2023-09-28",
		due: "2023-09-28",
		delivered: "2023-09-28",
		quote: 160
	},
	{
		id: "pj-24",
		code: "RVD-124",
		clientId: "cl-rvd-67",
		serviceId: "srv-6",
		name: "Redlands Bakehouse Menu Design Extra Fee",
		status: "Closed",
		start: "2023-10-07",
		due: "2023-10-07",
		delivered: "2023-10-07",
		quote: 20
	},
	{
		id: "pj-25",
		code: "RVD-125",
		clientId: "cl-rvd-49",
		serviceId: "srv-7",
		name: "APLE Hotline Leaflet",
		status: "Closed",
		start: "2023-10-09",
		due: "2023-10-09",
		delivered: "2023-10-09",
		quote: 70
	},
	{
		id: "pj-26",
		code: "RVD-126",
		clientId: "cl-rvd-50",
		serviceId: "srv-1",
		name: "Doh Baby Donut Logo",
		status: "Closed",
		start: "2023-10-10",
		due: "2023-10-10",
		delivered: "2023-10-10",
		quote: 80
	},
	{
		id: "pj-27",
		code: "RVD-127",
		clientId: "cl-rvd-55",
		serviceId: "srv-7",
		name: "APLE OCSEA Training Manual",
		status: "Closed",
		start: "2023-10-12",
		due: "2023-10-12",
		delivered: "2023-10-12",
		quote: 696
	},
	{
		id: "pj-28",
		code: "RVD-128",
		clientId: "cl-rvd-50",
		serviceId: "srv-1",
		name: "Doh Baby Donut Logo Extra Fee",
		status: "Closed",
		start: "2023-10-14",
		due: "2023-10-14",
		delivered: "2023-10-14",
		quote: 30
	},
	{
		id: "pj-29",
		code: "RVD-129",
		clientId: "cl-rvd-68",
		serviceId: "srv-21",
		name: "Chilli Chilli Packaging",
		status: "Closed",
		start: "2023-10-19",
		due: "2023-10-19",
		delivered: "2023-10-19",
		quote: 130
	},
	{
		id: "pj-30",
		code: "RVD-130",
		clientId: "cl-rvd-55",
		serviceId: "srv-7",
		name: "APLE OCSEA Handout",
		status: "Closed",
		start: "2023-10-23",
		due: "2023-10-23",
		delivered: "2023-10-23",
		quote: 450
	},
	{
		id: "pj-31",
		code: "RVD-131",
		clientId: "cl-rvd-79",
		serviceId: "srv-6",
		name: "A-Frame Signboards",
		status: "Closed",
		start: "2023-10-25",
		due: "2023-10-25",
		delivered: "2023-10-25",
		quote: 200
	},
	{
		id: "pj-32",
		code: "RVD-132",
		clientId: "cl-rvd-68",
		serviceId: "srv-21",
		name: "Chilli Chilli Packaging Extra",
		status: "Closed",
		start: "2023-10-27",
		due: "2023-10-27",
		delivered: "2023-10-27",
		quote: 15
	},
	{
		id: "pj-33",
		code: "RVD-133",
		clientId: "cl-rvd-49",
		serviceId: "srv-2",
		name: "Training Certificate",
		status: "Closed",
		start: "2023-12-10",
		due: "2023-12-10",
		delivered: "2023-12-10",
		quote: 20
	},
	{
		id: "pj-34",
		code: "RVD-134",
		clientId: "cl-rvd-50",
		serviceId: "srv-1",
		name: "JE Beauty Studio",
		status: "Closed",
		start: "2023-12-10",
		due: "2023-12-10",
		delivered: "2023-12-10",
		quote: 30
	},
	{
		id: "pj-35",
		code: "RVD-135",
		clientId: "cl-rvd-55",
		serviceId: "srv-7",
		name: "APLE OCSEA KH",
		status: "Closed",
		start: "2023-12-19",
		due: "2023-12-19",
		delivered: "2023-12-19",
		quote: 499.2
	},
	{
		id: "pj-36",
		code: "RVD-136",
		clientId: "cl-rvd-49",
		serviceId: "srv-7",
		name: "Hotline Leaflet & Sticker",
		status: "Closed",
		start: "2023-12-26",
		due: "2023-12-26",
		delivered: "2023-12-26",
		quote: 100
	},
	{
		id: "pj-37",
		code: "RVD-137",
		clientId: "cl-rvd-50",
		serviceId: "srv-1",
		name: "Banh Mi by Doh Baby",
		status: "Closed",
		start: "2024-03-03",
		due: "2024-03-03",
		delivered: "2024-03-03",
		quote: 80
	},
	{
		id: "pj-38",
		code: "RVD-138",
		clientId: "cl-rvd-55",
		serviceId: "srv-7",
		name: "OCSEA English Amendend",
		status: "Closed",
		start: "2024-03-04",
		due: "2024-03-04",
		delivered: "2024-03-04",
		quote: 240.9
	},
	{
		id: "pj-39",
		code: "RVD-139",
		clientId: "cl-rvd-50",
		serviceId: "srv-1",
		name: "Doh Baby Re-Design",
		status: "Closed",
		start: "2024-03-09",
		due: "2024-03-09",
		delivered: "2024-03-09",
		quote: 50
	},
	{
		id: "pj-40",
		code: "RVD-140",
		clientId: "cl-rvd-50",
		serviceId: "srv-1",
		name: "Ly Hospitality Group",
		status: "Closed",
		start: "2024-03-09",
		due: "2024-03-09",
		delivered: "2024-03-09",
		quote: 100
	},
	{
		id: "pj-41",
		code: "RVD-141",
		clientId: "cl-rvd-50",
		serviceId: "srv-1",
		name: "LXE Investment",
		status: "Closed",
		start: "2024-04-18",
		due: "2024-04-18",
		delivered: "2024-04-18",
		quote: 70
	},
	{
		id: "pj-42",
		code: "RVD-142",
		clientId: "cl-rvd-50",
		serviceId: "srv-5",
		name: "KNY 24 Poster",
		status: "Closed",
		start: "2024-04-18",
		due: "2024-04-18",
		delivered: "2024-04-18",
		quote: 25
	},
	{
		id: "pj-43",
		code: "RVD-143",
		clientId: "cl-rvd-56",
		serviceId: "srv-2",
		name: "Confluence Stamp & Postal Card",
		status: "Closed",
		start: "2024-05-09",
		due: "2024-05-09",
		delivered: "2024-05-09",
		quote: 100
	},
	{
		id: "pj-44",
		code: "RVD-144",
		clientId: "cl-rvd-50",
		serviceId: "srv-1",
		name: "Hostme",
		status: "Closed",
		start: "2024-05-10",
		due: "2024-05-10",
		delivered: "2024-05-10",
		quote: 70
	},
	{
		id: "pj-45",
		code: "RVD-145",
		clientId: "cl-rvd-50",
		serviceId: "srv-1",
		name: "Doh Baby Expresso Bar (Revise Logo)",
		status: "Closed",
		start: "2024-05-12",
		due: "2024-05-12",
		delivered: "2024-05-12",
		quote: 35
	},
	{
		id: "pj-46",
		code: "RVD-146",
		clientId: "cl-rvd-57",
		serviceId: "srv-1",
		name: "BSG Vet",
		status: "Closed",
		start: "2024-05-18",
		due: "2024-05-18",
		delivered: "2024-05-18",
		quote: 250
	},
	{
		id: "pj-47",
		code: "RVD-147",
		clientId: "cl-rvd-49",
		serviceId: "srv-2",
		name: "Carosel Poster & Split Leaflet",
		status: "Closed",
		start: "2024-05-25",
		due: "2024-05-25",
		delivered: "2024-05-25",
		quote: 60
	},
	{
		id: "pj-48",
		code: "RVD-148",
		clientId: "cl-rvd-51",
		serviceId: "srv-6",
		name: "ISI National Road 2 Hoarding, Billboard, & Totem",
		status: "Closed",
		start: "2024-05-28",
		due: "2024-05-28",
		delivered: "2024-05-28",
		quote: 400
	},
	{
		id: "pj-49",
		code: "RVD-149",
		clientId: "cl-rvd-53",
		serviceId: "srv-1",
		name: "WeLoy Logo Branding & HomePage Website",
		status: "Closed",
		start: "2024-05-29",
		due: "2024-05-29",
		delivered: "2024-05-29",
		quote: 350
	},
	{
		id: "pj-50",
		code: "RVD-150",
		clientId: "cl-rvd-54",
		serviceId: "srv-1",
		name: "Kim Hour",
		status: "Closed",
		start: "2024-05-29",
		due: "2024-05-29",
		delivered: "2024-05-29",
		quote: 250
	},
	{
		id: "pj-51",
		code: "RVD-151",
		clientId: "cl-rvd-49",
		serviceId: "srv-3",
		name: "Website Police Hotline",
		status: "Closed",
		start: "2024-06-21",
		due: "2024-06-21",
		delivered: "2024-06-21",
		quote: 50
	},
	{
		id: "pj-52",
		code: "RVD-152",
		clientId: "cl-rvd-56",
		serviceId: "srv-1",
		name: "Tandem Partner Logo",
		status: "Lost",
		start: "2024-07-26",
		due: "2024-07-26",
		delivered: "",
		quote: 200
	},
	{
		id: "pj-53",
		code: "RVD-153",
		clientId: "cl-rvd-55",
		serviceId: "srv-7",
		name: "APLE OCEA KH Amendment",
		status: "Closed",
		start: "2024-08-08",
		due: "2024-08-08",
		delivered: "2024-08-08",
		quote: 176
	},
	{
		id: "pj-54",
		code: "RVD-154",
		clientId: "cl-rvd-70",
		serviceId: "srv-6",
		name: "BSFV Tenant Logo 1x1m",
		status: "Closed",
		start: "2024-08-16",
		due: "2024-08-16",
		delivered: "2024-08-16",
		quote: 50
	},
	{
		id: "pj-55",
		code: "RVD-155",
		clientId: "cl-rvd-69",
		serviceId: "srv-7",
		name: "APLE Info Kit",
		status: "Closed",
		start: "2024-08-26",
		due: "2024-08-26",
		delivered: "2024-08-26",
		quote: 35
	},
	{
		id: "pj-56",
		code: "RVD-156",
		clientId: "cl-rvd-70",
		serviceId: "srv-6",
		name: "BSFV Logo + Billboard",
		status: "Closed",
		start: "2024-09-27",
		due: "2024-09-27",
		delivered: "2024-09-27",
		quote: 30
	},
	{
		id: "pj-57",
		code: "RVD-157",
		clientId: "cl-rvd-49",
		serviceId: "srv-2",
		name: "UNICEF Online Campaign",
		status: "Closed",
		start: "2024-09-29",
		due: "2024-09-29",
		delivered: "2024-09-29",
		quote: 120
	},
	{
		id: "pj-58",
		code: "RVD-158",
		clientId: "cl-rvd-56",
		serviceId: "srv-1",
		name: "Teize Fevier",
		status: "Closed",
		start: "2024-10-03",
		due: "2024-10-03",
		delivered: "2024-10-03",
		quote: 100
	},
	{
		id: "pj-59",
		code: "RVD-159",
		clientId: "cl-rvd-72",
		serviceId: "srv-1",
		name: "Chez Dodin",
		status: "Lost",
		start: "2024-10-07",
		due: "2024-10-07",
		delivered: "",
		quote: 130
	},
	{
		id: "pj-60",
		code: "RVD-160",
		clientId: "cl-rvd-56",
		serviceId: "srv-26",
		name: "Rolling-Up Stand & JFlag",
		status: "Closed",
		start: "2024-10-09",
		due: "2024-10-09",
		delivered: "2024-10-09",
		quote: 130
	},
	{
		id: "pj-61",
		code: "RVD-161",
		clientId: "cl-rvd-56",
		serviceId: "srv-20",
		name: "Sakam Presentation Slides",
		status: "Delivered",
		start: "2024-10-16",
		due: "2024-10-16",
		delivered: "2024-10-16",
		quote: 300
	},
	{
		id: "pj-62",
		code: "RVD-162",
		clientId: "cl-rvd-78",
		serviceId: "srv-1",
		name: "TIA Engineering Service ( TES)",
		status: "Lost",
		start: "2024-10-26",
		due: "2024-10-26",
		delivered: "",
		quote: 350
	},
	{
		id: "pj-63",
		code: "RVD-163",
		clientId: "cl-rvd-56",
		serviceId: "srv-1",
		name: "Concorde Logo",
		status: "Closed",
		start: "2024-10-26",
		due: "2024-10-26",
		delivered: "2024-10-26",
		quote: 100
	},
	{
		id: "pj-64",
		code: "RVD-164",
		clientId: "cl-rvd-49",
		serviceId: "srv-2",
		name: "UNICEF Online Campaign Extra",
		status: "Closed",
		start: "2024-10-28",
		due: "2024-10-28",
		delivered: "2024-10-28",
		quote: 20
	},
	{
		id: "pj-65",
		code: "RVD-165",
		clientId: "cl-rvd-56",
		serviceId: "srv-2",
		name: "Part- Time #1",
		status: "Closed",
		start: "2024-10-28",
		due: "2024-11-25",
		delivered: "2024-11-25",
		quote: 300
	},
	{
		id: "pj-66",
		code: "RVD-166",
		clientId: "cl-rvd-74",
		serviceId: "srv-7",
		name: "CSAM Prevention Guide",
		status: "Lost",
		start: "2024-11-26",
		due: "2024-11-26",
		delivered: "",
		quote: 0
	},
	{
		id: "pj-67",
		code: "RVD-167",
		clientId: "cl-rvd-76",
		serviceId: "srv-2",
		name: "Social Media Poster x 8",
		status: "Closed",
		start: "2024-12-10",
		due: "2024-12-12",
		delivered: "2024-12-12",
		quote: 140
	},
	{
		id: "pj-68",
		code: "RVD-168",
		clientId: "cl-rvd-49",
		serviceId: "srv-2",
		name: "Child Friendly Practise + Online Awareness Campaign + Leaflet",
		status: "Delivered",
		start: "2024-12-12",
		due: "2024-12-12",
		delivered: "2024-12-12",
		quote: 350
	},
	{
		id: "pj-69",
		code: "RVD-169",
		clientId: "cl-rvd-80",
		serviceId: "srv-21",
		name: "GOLDWOK Oyster Sauce Packaging",
		status: "Closed",
		start: "2024-12-30",
		due: "2025-01-21",
		delivered: "2025-01-21",
		quote: 350
	},
	{
		id: "pj-70",
		code: "RVD-170",
		clientId: "cl-rvd-50",
		serviceId: "srv-1",
		name: "dough Logo Branding Design",
		status: "Closed",
		start: "2025-01-16",
		due: "2025-01-16",
		delivered: "2025-01-16",
		quote: 90
	},
	{
		id: "pj-71",
		code: "RVD-171",
		clientId: "cl-rvd-50",
		serviceId: "srv-1",
		name: "Banh & Mi Logo Branding Design",
		status: "Closed",
		start: "2025-01-17",
		due: "2025-01-17",
		delivered: "2025-01-17",
		quote: 90
	},
	{
		id: "pj-72",
		code: "RVD-172",
		clientId: "cl-rvd-50",
		serviceId: "srv-21",
		name: "dough paper wrap pattern",
		status: "Closed",
		start: "2025-02-07",
		due: "2025-02-07",
		delivered: "2025-02-07",
		quote: 25
	},
	{
		id: "pj-73",
		code: "RVD-173",
		clientId: "cl-rvd-50",
		serviceId: "srv-21",
		name: "dough mascot + box packaging",
		status: "Closed",
		start: "2025-02-07",
		due: "2025-02-07",
		delivered: "2025-02-07",
		quote: 100
	},
	{
		id: "pj-74",
		code: "RVD-174",
		clientId: "cl-rvd-57",
		serviceId: "srv-1",
		name: "Namas.K Coffee",
		status: "Closed",
		start: "2025-03-05",
		due: "2025-03-05",
		delivered: "2025-03-05",
		quote: 100
	},
	{
		id: "pj-75",
		code: "RVD-175",
		clientId: "cl-rvd-69",
		serviceId: "srv-7",
		name: "APLE Information Kit",
		status: "Closed",
		start: "2025-03-05",
		due: "2025-03-05",
		delivered: "2025-03-05",
		quote: 96
	},
	{
		id: "pj-76",
		code: "RVD-176",
		clientId: "cl-rvd-50",
		serviceId: "srv-21",
		name: "Doughtelier Packaging",
		status: "Closed",
		start: "2025-03-15",
		due: "2025-03-15",
		delivered: "2025-03-15",
		quote: 150
	},
	{
		id: "pj-77",
		code: "RVD-177",
		clientId: "cl-rvd-81",
		serviceId: "srv-1",
		name: "TIA Engineering Service Company",
		status: "Closed",
		start: "2025-03-20",
		due: "2025-03-20",
		delivered: "2025-03-20",
		quote: 350
	},
	{
		id: "pj-78",
		code: "RVD-178",
		clientId: "cl-rvd-82",
		serviceId: "srv-1",
		name: "The RED HOUSE - Koh Rong Island",
		status: "Closed",
		start: "2025-03-21",
		due: "2025-03-21",
		delivered: "2025-03-21",
		quote: 100
	},
	{
		id: "pj-79",
		code: "RVD-179",
		clientId: "cl-rvd-81",
		serviceId: "srv-5",
		name: "TES Staff ID & Business Card",
		status: "Closed",
		start: "2025-05-08",
		due: "2025-05-08",
		delivered: "2025-05-08",
		quote: 80
	},
	{
		id: "pj-80",
		code: "RVD-180",
		clientId: "cl-rvd-57",
		serviceId: "srv-1",
		name: "NK Life Tech",
		status: "Closed",
		start: "2025-05-23",
		due: "2025-05-23",
		delivered: "2025-05-23",
		quote: 100
	},
	{
		id: "pj-81",
		code: "RVD-181",
		clientId: "cl-rvd-71",
		serviceId: "srv-1",
		name: "Infinite Sport Club & Pi 3.14",
		status: "Delivered",
		start: "2025-05-26",
		due: "2025-05-26",
		delivered: "2025-05-26",
		quote: 650
	},
	{
		id: "pj-82",
		code: "RVD-182",
		clientId: "cl-rvd-83",
		serviceId: "srv-1",
		name: "Tonle Sab Musuem Logo, A5 E-Flyer, Ticker, Banner",
		status: "Closed",
		start: "2025-06-10",
		due: "2025-06-10",
		delivered: "2025-06-10",
		quote: 60
	},
	{
		id: "pj-83",
		code: "RVD-183",
		clientId: "cl-rvd-56",
		serviceId: "srv-2",
		name: "Exelmans Poster 25 Banner Design / Export to Figma",
		status: "Closed",
		start: "2025-06-17",
		due: "2025-06-17",
		delivered: "2025-06-17",
		quote: 100
	},
	{
		id: "pj-84",
		code: "RVD-184",
		clientId: "cl-rvd-49",
		serviceId: "srv-2",
		name: "aple child safety educators poster x 6 pcs",
		status: "Closed",
		start: "2025-06-25",
		due: "2025-07-10",
		delivered: "2025-07-10",
		quote: 90
	},
	{
		id: "pj-85",
		code: "RVD-185",
		clientId: "cl-rvd-83",
		serviceId: "srv-23",
		name: "Tonle Sap Museum - Entrance Fees + Direction (200m away)",
		status: "Closed",
		start: "2025-07-10",
		due: "2025-07-15",
		delivered: "2025-07-15",
		quote: 20
	},
	{
		id: "pj-86",
		code: "RVD-186",
		clientId: "cl-rvd-83",
		serviceId: "srv-28",
		name: "Saam Paan Villa Re-Branding",
		status: "Closed",
		start: "2025-07-16",
		due: "2025-07-22",
		delivered: "2025-07-22",
		quote: 20
	},
	{
		id: "pj-87",
		code: "RVD-187",
		clientId: "cl-rvd-83",
		serviceId: "srv-23",
		name: "Saam Paan Villa E-Flyer A5",
		status: "Closed",
		start: "2025-07-23",
		due: "2025-07-29",
		delivered: "2025-07-29",
		quote: 20
	},
	{
		id: "pj-88",
		code: "RVD-188",
		clientId: "cl-rvd-49",
		serviceId: "srv-26",
		name: "aple-istand-&-props-design",
		status: "Closed",
		start: "2025-07-29",
		due: "2025-07-31",
		delivered: "2025-07-31",
		quote: 65
	},
	{
		id: "pj-89",
		code: "RVD-189",
		clientId: "cl-rvd-50",
		serviceId: "srv-28",
		name: "Pie-Time Rebranding",
		status: "Closed",
		start: "2025-08-11",
		due: "2025-08-12",
		delivered: "2025-08-12",
		quote: 50
	},
	{
		id: "pj-90",
		code: "RVD-190",
		clientId: "cl-rvd-50",
		serviceId: "srv-21",
		name: "Pie-Time-Vehicle-livery-design",
		status: "Quoted",
		start: "2025-08-16",
		due: "2025-08-16",
		delivered: "",
		quote: 50
	},
	{
		id: "pj-91",
		code: "RVD-191",
		clientId: "cl-rvd-85",
		serviceId: "srv-21",
		name: "C.Lovee-You-Drinking-Water-Cardboard-Packaging",
		status: "Closed",
		start: "2025-08-18",
		due: "2025-08-21",
		delivered: "2025-08-21",
		quote: 50
	},
	{
		id: "pj-92",
		code: "RVD-192",
		clientId: "cl-rvd-50",
		serviceId: "srv-21",
		name: "Pie-Time-Flat-Paper-Bag-212x180mm-Packaging Design-both-side",
		status: "Closed",
		start: "2025-08-21",
		due: "2025-08-30",
		delivered: "2025-08-30",
		quote: 50
	},
	{
		id: "pj-93",
		code: "RVD-193",
		clientId: "cl-rvd-83",
		serviceId: "srv-6",
		name: "Tonle-Sap-Museum-Banner-240cm(W)",
		status: "Closed",
		start: "2025-08-21",
		due: "2025-08-22",
		delivered: "2025-08-22",
		quote: 15
	},
	{
		id: "pj-94",
		code: "RVD-194",
		clientId: "cl-rvd-85",
		serviceId: "srv-21",
		name: "C.Love-You-Drinking-Water-Label-Bottle-Plastic-330ml",
		status: "Closed",
		start: "2025-08-22",
		due: "2025-08-26",
		delivered: "2025-08-26",
		quote: 100
	},
	{
		id: "pj-95",
		code: "RVD-195",
		clientId: "cl-rvd-50",
		serviceId: "srv-21",
		name: "doughtelier donut box - redesign",
		status: "Closed",
		start: "2025-09-04",
		due: "2025-09-08",
		delivered: "2025-09-08",
		quote: 150
	},
	{
		id: "pj-96",
		code: "RVD-196",
		clientId: "cl-rvd-50",
		serviceId: "srv-2",
		name: "doughtelier donut + handing grabing donut",
		status: "Closed",
		start: "2025-09-04",
		due: "2025-09-11",
		delivered: "2025-09-11",
		quote: 25
	},
	{
		id: "pj-97",
		code: "RVD-197",
		clientId: "cl-rvd-50",
		serviceId: "srv-4",
		name: "doughelier brand guideline",
		status: "Closed",
		start: "2025-09-11",
		due: "2025-09-12",
		delivered: "2025-09-12",
		quote: 25
	},
	{
		id: "pj-98",
		code: "RVD-198",
		clientId: "cl-rvd-50",
		serviceId: "srv-1",
		name: "cookie-boys. logo + brand guideline",
		status: "Closed",
		start: "2025-09-15",
		due: "2025-09-17",
		delivered: "2025-09-17",
		quote: 100
	},
	{
		id: "pj-99",
		code: "RVD-199",
		clientId: "cl-rvd-57",
		serviceId: "srv-1",
		name: "quick-LPG-logo branding",
		status: "Closed",
		start: "2025-09-26",
		due: "2025-10-03",
		delivered: "2025-10-03",
		quote: 100
	},
	{
		id: "pj-100",
		code: "RVD-200",
		clientId: "cl-rvd-83",
		serviceId: "srv-5",
		name: "personal-business-card",
		status: "Delivered",
		start: "2025-10-01",
		due: "2025-10-04",
		delivered: "2025-10-04",
		quote: 10
	},
	{
		id: "pj-101",
		code: "RVD-201",
		clientId: "cl-rvd-86",
		serviceId: "srv-1",
		name: "BioDia Branding Design + pwerpoint Template + 2 Product Packaging",
		status: "In production",
		start: "2025-10-17",
		due: "2025-11-21",
		delivered: "",
		quote: 1e3
	},
	{
		id: "pj-102",
		code: "RVD-202",
		clientId: "cl-rvd-50",
		serviceId: "srv-24",
		name: "doughtelier-post-soft-opening + serving product + halloween",
		status: "In production",
		start: "2025-10-25",
		due: "2025-10-30",
		delivered: "",
		quote: 100
	},
	{
		id: "pj-103",
		code: "RVD-203",
		clientId: "cl-rvd-50",
		serviceId: "srv-1",
		name: "Elite_Mart",
		status: "Quoted",
		start: "2026-02-05",
		due: "2026-02-10",
		delivered: "",
		quote: 100
	},
	{
		id: "pj-104",
		code: "RVD-204",
		clientId: "cl-rvd-49",
		serviceId: "srv-17",
		name: "APLE_SID2026 Photo Props",
		status: "Quoted",
		start: "2026-02-06",
		due: "2026-02-07",
		delivered: "",
		quote: 50
	},
	{
		id: "pj-105",
		code: "RVD-205",
		clientId: "cl-rvd-68",
		serviceId: "srv-21",
		name: "Khmer Rice Cake Flour - 2 SKU",
		status: "Quoted",
		start: "2026-02-07",
		due: "2026-03-05",
		delivered: "",
		quote: 400
	}
];
var rothvanInvoices = [
	{
		id: "inv-1",
		no: "RVIN-22121101",
		kind: "Invoice",
		clientId: "cl-rvd-61",
		projectId: "pj-1",
		issue: "2022-12-11",
		due: "2022-12-11",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-1-1",
			serviceId: "srv-21",
			description: "Greeneco - Packaging",
			scope: "Custom size design  (no larger than W100cm x H100cm x D100cm)\nBox/bag/label layout\nDie-line template use\nTypography & style guide\nPrint-ready AI file (CMYK)\nWeb-friendly JPEG/PNG\nVisual Mockups",
			timeline: "5 Days",
			qty: 1,
			price: 260
		}],
		images: []
	},
	{
		id: "inv-2",
		no: "RVIN-23020601",
		kind: "Invoice",
		clientId: "cl-rvd-49",
		projectId: "pj-2",
		issue: "2023-02-06",
		due: "2023-02-06",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [
			{
				id: "it-2-1",
				serviceId: "srv-9",
				description: "APLE SID 2023 — Photo Booth",
				scope: "Creative theme illustration\nText placement\nCustom cut line if needed\nPrint-ready AI file (CMYK)\nWeb-friendly JPEG/PNG\nVisual Mockups",
				timeline: "3 Days",
				qty: 1,
				price: 137.3
			},
			{
				id: "it-2-2",
				serviceId: "srv-8",
				description: "Backdrop",
				scope: "Custom size design  (no larger than 300cm x 500cm)\nTheme-based layout\nSponsor/logo integration\nPrint-ready AI file (CMYK)\nWeb-friendly JPEG/PNG\nVisual Mockups",
				timeline: "3 Days",
				qty: 1,
				price: 171.62
			},
			{
				id: "it-2-3",
				serviceId: "srv-17",
				description: "Die-Cut Foam Board / Props",
				scope: "Custom size design  (no larger than 100cm x 100cm)\nReadability optimization\nLayout based on sign specs\nPrint-ready AI file (CMYK)\nWeb-friendly JPEG/PNG\nVisual Mockups",
				timeline: "2 Days",
				qty: 1,
				price: 57.21
			},
			{
				id: "it-2-4",
				serviceId: "srv-11",
				description: "Eco Bag / Tote Bag",
				scope: "Front/back layout\nBrand + illustration design\nVisual and brand alignment\nPrint & digital version formatting\nPrint-ready AI file (CMYK)\nWeb-friendly JPEG/PNG\nEditable source file (AI/PSD)\nVisual Mockups",
				timeline: "2 Days",
				qty: 1,
				price: 68.65
			},
			{
				id: "it-2-5",
				serviceId: "srv-2",
				description: "Promo Post / Cover",
				scope: "Square / Landscape Layout Design\nPromo theme + CTA\nWeb-friendly JPEG/PNG\nEditable source file (AI/PSD)",
				timeline: "2 Days",
				qty: 1,
				price: 28.6
			},
			{
				id: "it-2-6",
				serviceId: "srv-6",
				description: "Billboard / Banner / Hoarding",
				scope: "Print-size setup (no larger than 300cm x 500cm)\nBranding integration\nCMYK setup\nPrint-ready scaling\nPrint-ready AI file (CMYK)\nWeb-friendly JPEG/PNG\nEditable source file (AI/PSD)\nVisual Mockups",
				timeline: "3 Days",
				qty: 1,
				price: 171.62
			}
		],
		images: []
	},
	{
		id: "inv-3",
		no: "RVIN-23020801",
		kind: "Invoice",
		clientId: "cl-rvd-63",
		projectId: "pj-3",
		issue: "2023-02-08",
		due: "2023-02-08",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-3-1",
			serviceId: "srv-1",
			description: "Coral Dental Clinic",
			scope: "2 Unique Logo Concepts\nResearch & Concept Development\nLogo Refinement & Selection\nFinal logo in AI, EPS, PDF, PNG, JPG\nBlack/white & color versions\nBasic Brand GuideStyle\nVisual Mockups",
			timeline: "5 Days",
			qty: 1,
			price: 170
		}],
		images: []
	},
	{
		id: "inv-4",
		no: "RVIN-23021101",
		kind: "Invoice",
		clientId: "cl-rvd-72",
		projectId: "pj-4",
		issue: "2023-02-11",
		due: "2023-02-11",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-4-1",
			serviceId: "srv-22",
			description: "Bayond Over Size Shirt",
			scope: "Front/back layout\nBrand + illustration design\nVisual and brand alignment\nPrint & digital version formatting\nPrint-ready AI file (CMYK)\nWeb-friendly JPEG/PNG\nEditable source file (AI/PSD)\nVisual Mockups",
			timeline: "3 Days",
			qty: 1,
			price: 35
		}],
		images: []
	},
	{
		id: "inv-5",
		no: "RVIN-23031201",
		kind: "Invoice",
		clientId: "cl-rvd-50",
		projectId: "pj-5",
		issue: "2023-03-12",
		due: "2023-03-12",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-5-1",
			serviceId: "srv-1",
			description: "94 Bakery - Full",
			scope: "2 Unique Logo Concepts\nResearch & Concept Development\nLogo Refinement & Selection\nFinal logo in AI, EPS, PDF, PNG, JPG\nBlack/white & color versions\nBasic Brand GuideStyle\nVisual Mockups",
			timeline: "5 Days",
			qty: 1,
			price: 60
		}],
		images: []
	},
	{
		id: "inv-6",
		no: "RVIN-23031202",
		kind: "Invoice",
		clientId: "cl-rvd-50",
		projectId: "pj-6",
		issue: "2023-03-12",
		due: "2023-03-12",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-6-1",
			serviceId: "srv-1",
			description: "T Lab - Full",
			scope: "2 Unique Logo Concepts\nResearch & Concept Development\nLogo Refinement & Selection\nFinal logo in AI, EPS, PDF, PNG, JPG\nBlack/white & color versions\nBasic Brand GuideStyle\nVisual Mockups",
			timeline: "5 Days",
			qty: 1,
			price: 60
		}],
		images: []
	},
	{
		id: "inv-7",
		no: "RVIN-23032001",
		kind: "Invoice",
		clientId: "cl-rvd-49",
		projectId: "pj-7",
		issue: "2023-03-20",
		due: "2023-03-20",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-7-1",
			serviceId: "srv-7",
			description: "APLE Annual Report",
			scope: "Custom layout design (bi-fold, tri-fold, or multi-page)\nTypography & grid systems\nInfographic and data visualization\nVisual and brand alignment\nPrint & digital version formatting\nPrint-ready AI file (CMYK)\nWeb-friendly JPEG/PNG\nEditable source file (AI/PSD)\nVisual Mockups",
			timeline: "3 Days",
			qty: 1,
			price: 420
		}],
		images: []
	},
	{
		id: "inv-8",
		no: "RVIN-23041501",
		kind: "Invoice",
		clientId: "cl-rvd-50",
		projectId: "pj-8",
		issue: "2023-04-15",
		due: "2023-04-15",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-8-1",
			serviceId: "srv-1",
			description: "AJ BakeHouse Logo - Full",
			scope: "2 Unique Logo Concepts\nResearch & Concept Development\nLogo Refinement & Selection\nFinal logo in AI, EPS, PDF, PNG, JPG\nBlack/white & color versions\nBasic Brand GuideStyle\nVisual Mockups",
			timeline: "5 Days",
			qty: 1,
			price: 60
		}],
		images: []
	},
	{
		id: "inv-9",
		no: "RVIN-23042101",
		kind: "Invoice",
		clientId: "cl-rvd-50",
		projectId: "pj-9",
		issue: "2023-04-21",
		due: "2023-04-21",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-9-1",
			serviceId: "srv-1",
			description: "TOS Nham Logo - Full",
			scope: "2 Unique Logo Concepts\nResearch & Concept Development\nLogo Refinement & Selection\nFinal logo in AI, EPS, PDF, PNG, JPG\nBlack/white & color versions\nBasic Brand GuideStyle\nVisual Mockups",
			timeline: "5 Days",
			qty: 1,
			price: 100
		}],
		images: []
	},
	{
		id: "inv-10",
		no: "RVIN-23051401",
		kind: "Invoice",
		clientId: "cl-rvd-50",
		projectId: "pj-10",
		issue: "2023-05-14",
		due: "2023-05-14",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-10-1",
			serviceId: "srv-1",
			description: "10/10 Donut Logo",
			scope: "2 Unique Logo Concepts\nResearch & Concept Development\nLogo Refinement & Selection\nFinal logo in AI, EPS, PDF, PNG, JPG\nBlack/white & color versions\nBasic Brand GuideStyle\nVisual Mockups",
			timeline: "5 Days",
			qty: 1,
			price: 60
		}],
		images: []
	},
	{
		id: "inv-11",
		no: "RVIN-23051901",
		kind: "Invoice",
		clientId: "cl-rvd-61",
		projectId: "pj-11",
		issue: "2023-05-19",
		due: "2023-05-19",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-11-1",
			serviceId: "srv-21",
			description: "Greeneco Revise V3 - Full",
			scope: "Custom size design  (no larger than W100cm x H100cm x D100cm)\nBox/bag/label layout\nDie-line template use\nTypography & style guide\nPrint-ready AI file (CMYK)\nWeb-friendly JPEG/PNG\nVisual Mockups",
			timeline: "5 Days",
			qty: 1,
			price: 15
		}],
		images: []
	},
	{
		id: "inv-12",
		no: "RVIN-23060901",
		kind: "Invoice",
		clientId: "cl-rvd-49",
		projectId: "pj-12",
		issue: "2023-06-09",
		due: "2023-06-09",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-12-1",
			serviceId: "srv-7",
			description: "APLE Certificate - Full",
			scope: "Custom layout design (bi-fold, tri-fold, or multi-page)\nTypography & grid systems\nInfographic and data visualization\nVisual and brand alignment\nPrint & digital version formatting\nPrint-ready AI file (CMYK)\nWeb-friendly JPEG/PNG\nEditable source file (AI/PSD)\nVisual Mockups",
			timeline: "3 Days",
			qty: 1,
			price: 17.5
		}],
		images: []
	},
	{
		id: "inv-13",
		no: "RVIN-23061401",
		kind: "Invoice",
		clientId: "cl-rvd-62",
		projectId: "pj-13",
		issue: "2023-06-14",
		due: "2023-06-14",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-13-1",
			serviceId: "srv-1",
			description: "Le Gift",
			scope: "2 Unique Logo Concepts\nResearch & Concept Development\nLogo Refinement & Selection\nFinal logo in AI, EPS, PDF, PNG, JPG\nBlack/white & color versions\nBasic Brand GuideStyle\nVisual Mockups",
			timeline: "5 Days",
			qty: 1,
			price: 80
		}],
		images: []
	},
	{
		id: "inv-14",
		no: "RVIN-23080701",
		kind: "Invoice",
		clientId: "cl-rvd-49",
		projectId: "pj-14",
		issue: "2023-08-07",
		due: "2023-08-07",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-14-1",
			serviceId: "srv-2",
			description: "Pisey Chat Bot",
			scope: "Square / Landscape Layout Design\nPromo theme + CTA\nWeb-friendly JPEG/PNG\nEditable source file (AI/PSD)",
			timeline: "2 Days",
			qty: 1,
			price: 577.5
		}],
		images: []
	},
	{
		id: "inv-15",
		no: "RVIN-23081501",
		kind: "Invoice",
		clientId: "cl-rvd-50",
		projectId: "pj-15",
		issue: "2023-08-15",
		due: "2023-08-15",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-15-1",
			serviceId: "srv-1",
			description: "Andy’s Pie Co - Full",
			scope: "2 Unique Logo Concepts\nResearch & Concept Development\nLogo Refinement & Selection\nFinal logo in AI, EPS, PDF, PNG, JPG\nBlack/white & color versions\nBasic Brand GuideStyle\nVisual Mockups",
			timeline: "5 Days",
			qty: 1,
			price: 80
		}],
		images: []
	},
	{
		id: "inv-16",
		no: "RVIN-23082101",
		kind: "Invoice",
		clientId: "cl-rvd-79",
		projectId: "pj-16",
		issue: "2023-08-21",
		due: "2023-08-21",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-16-1",
			serviceId: "srv-7",
			description: "PPM Service Brochure",
			scope: "Custom layout design (bi-fold, tri-fold, or multi-page)\nTypography & grid systems\nInfographic and data visualization\nVisual and brand alignment\nPrint & digital version formatting\nPrint-ready AI file (CMYK)\nWeb-friendly JPEG/PNG\nEditable source file (AI/PSD)\nVisual Mockups",
			timeline: "3 Days",
			qty: 1,
			price: 400
		}],
		images: []
	},
	{
		id: "inv-17",
		no: "RVIN-23082201",
		kind: "Invoice",
		clientId: "cl-rvd-50",
		projectId: "pj-17",
		issue: "2023-08-22",
		due: "2023-08-22",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-17-1",
			serviceId: "srv-1",
			description: "AJ Logo - Full",
			scope: "2 Unique Logo Concepts\nResearch & Concept Development\nLogo Refinement & Selection\nFinal logo in AI, EPS, PDF, PNG, JPG\nBlack/white & color versions\nBasic Brand GuideStyle\nVisual Mockups",
			timeline: "5 Days",
			qty: 1,
			price: 80
		}],
		images: []
	},
	{
		id: "inv-18",
		no: "RVIN-23090101",
		kind: "Invoice",
		clientId: "cl-rvd-60",
		projectId: "pj-18",
		issue: "2023-09-01",
		due: "2023-09-01",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: false,
		includeTerms: false,
		includeRates: false,
		notes: "Retained partial deposit on cancelled project.",
		items: [{
			id: "it-18-1",
			serviceId: "srv-3",
			description: "SabongMK UX UI  mobile app 30% (deposit retained)",
			scope: "",
			timeline: "15 Days",
			qty: 1,
			price: 90
		}],
		images: []
	},
	{
		id: "inv-19",
		no: "RVIN-23090701",
		kind: "Invoice",
		clientId: "cl-rvd-79",
		projectId: "pj-19",
		issue: "2023-09-07",
		due: "2023-09-07",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-19-1",
			serviceId: "srv-7",
			description: "Property Flyer Template Realeste.com.kh",
			scope: "Custom layout design (bi-fold, tri-fold, or multi-page)\nTypography & grid systems\nInfographic and data visualization\nVisual and brand alignment\nPrint & digital version formatting\nPrint-ready AI file (CMYK)\nWeb-friendly JPEG/PNG\nEditable source file (AI/PSD)\nVisual Mockups",
			timeline: "3 Days",
			qty: 1,
			price: 100
		}],
		images: []
	},
	{
		id: "inv-20",
		no: "RVIN-23090702",
		kind: "Invoice",
		clientId: "cl-rvd-79",
		projectId: "pj-20",
		issue: "2023-09-07",
		due: "2023-09-07",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: false,
		includeTerms: false,
		includeRates: false,
		notes: "Retained partial deposit on cancelled project.",
		items: [{
			id: "it-20-1",
			serviceId: "srv-7",
			description: "In Focus Research 50% (deposit retained)",
			scope: "",
			timeline: "3 Days",
			qty: 1,
			price: 130
		}],
		images: []
	},
	{
		id: "inv-21",
		no: "RVIN-23091101",
		kind: "Invoice",
		clientId: "cl-rvd-55",
		projectId: "pj-21",
		issue: "2023-09-11",
		due: "2023-09-11",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-21-1",
			serviceId: "srv-7",
			description: "APLE TNA",
			scope: "Custom layout design (bi-fold, tri-fold, or multi-page)\nTypography & grid systems\nInfographic and data visualization\nVisual and brand alignment\nPrint & digital version formatting\nPrint-ready AI file (CMYK)\nWeb-friendly JPEG/PNG\nEditable source file (AI/PSD)\nVisual Mockups",
			timeline: "3 Days",
			qty: 1,
			price: 432
		}],
		images: []
	},
	{
		id: "inv-22",
		no: "RVIN-23092501",
		kind: "Invoice",
		clientId: "cl-rvd-79",
		projectId: "pj-22",
		issue: "2023-09-25",
		due: "2023-09-25",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-22-1",
			serviceId: "srv-7",
			description: "Time Square 302 - Sale Brochure",
			scope: "Custom layout design (bi-fold, tri-fold, or multi-page)\nTypography & grid systems\nInfographic and data visualization\nVisual and brand alignment\nPrint & digital version formatting\nPrint-ready AI file (CMYK)\nWeb-friendly JPEG/PNG\nEditable source file (AI/PSD)\nVisual Mockups",
			timeline: "3 Days",
			qty: 1,
			price: 350
		}],
		images: []
	},
	{
		id: "inv-23",
		no: "RVIN-23092801",
		kind: "Invoice",
		clientId: "cl-rvd-67",
		projectId: "pj-23",
		issue: "2023-09-28",
		due: "2023-09-28",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-23-1",
			serviceId: "srv-6",
			description: "Redlands Bakehouse Menu Design",
			scope: "Print-size setup (no larger than 300cm x 500cm)\nBranding integration\nCMYK setup\nPrint-ready scaling\nPrint-ready AI file (CMYK)\nWeb-friendly JPEG/PNG\nEditable source file (AI/PSD)\nVisual Mockups",
			timeline: "3 Days",
			qty: 1,
			price: 160
		}],
		images: []
	},
	{
		id: "inv-24",
		no: "RVIN-23100701",
		kind: "Invoice",
		clientId: "cl-rvd-67",
		projectId: "pj-24",
		issue: "2023-10-07",
		due: "2023-10-07",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-24-1",
			serviceId: "srv-6",
			description: "Redlands Bakehouse Menu Design Extra Fee",
			scope: "Print-size setup (no larger than 300cm x 500cm)\nBranding integration\nCMYK setup\nPrint-ready scaling\nPrint-ready AI file (CMYK)\nWeb-friendly JPEG/PNG\nEditable source file (AI/PSD)\nVisual Mockups",
			timeline: "3 Days",
			qty: 1,
			price: 20
		}],
		images: []
	},
	{
		id: "inv-25",
		no: "RVIN-23100901",
		kind: "Invoice",
		clientId: "cl-rvd-49",
		projectId: "pj-25",
		issue: "2023-10-09",
		due: "2023-10-09",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-25-1",
			serviceId: "srv-7",
			description: "APLE Hotline Leaflet",
			scope: "Custom layout design (bi-fold, tri-fold, or multi-page)\nTypography & grid systems\nInfographic and data visualization\nVisual and brand alignment\nPrint & digital version formatting\nPrint-ready AI file (CMYK)\nWeb-friendly JPEG/PNG\nEditable source file (AI/PSD)\nVisual Mockups",
			timeline: "3 Days",
			qty: 1,
			price: 70
		}],
		images: []
	},
	{
		id: "inv-26",
		no: "RVIN-23101001",
		kind: "Invoice",
		clientId: "cl-rvd-50",
		projectId: "pj-26",
		issue: "2023-10-10",
		due: "2023-10-10",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-26-1",
			serviceId: "srv-1",
			description: "Doh Baby Donut Logo",
			scope: "2 Unique Logo Concepts\nResearch & Concept Development\nLogo Refinement & Selection\nFinal logo in AI, EPS, PDF, PNG, JPG\nBlack/white & color versions\nBasic Brand GuideStyle\nVisual Mockups",
			timeline: "5 Days",
			qty: 1,
			price: 80
		}],
		images: []
	},
	{
		id: "inv-27",
		no: "RVIN-23101201",
		kind: "Invoice",
		clientId: "cl-rvd-55",
		projectId: "pj-27",
		issue: "2023-10-12",
		due: "2023-10-12",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-27-1",
			serviceId: "srv-7",
			description: "APLE OCSEA Training Manual",
			scope: "Custom layout design (bi-fold, tri-fold, or multi-page)\nTypography & grid systems\nInfographic and data visualization\nVisual and brand alignment\nPrint & digital version formatting\nPrint-ready AI file (CMYK)\nWeb-friendly JPEG/PNG\nEditable source file (AI/PSD)\nVisual Mockups",
			timeline: "3 Days",
			qty: 1,
			price: 696
		}],
		images: []
	},
	{
		id: "inv-28",
		no: "RVIN-23101401",
		kind: "Invoice",
		clientId: "cl-rvd-50",
		projectId: "pj-28",
		issue: "2023-10-14",
		due: "2023-10-14",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-28-1",
			serviceId: "srv-1",
			description: "Doh Baby Donut Logo Extra Fee",
			scope: "2 Unique Logo Concepts\nResearch & Concept Development\nLogo Refinement & Selection\nFinal logo in AI, EPS, PDF, PNG, JPG\nBlack/white & color versions\nBasic Brand GuideStyle\nVisual Mockups",
			timeline: "5 Days",
			qty: 1,
			price: 30
		}],
		images: []
	},
	{
		id: "inv-29",
		no: "RVIN-23101901",
		kind: "Invoice",
		clientId: "cl-rvd-68",
		projectId: "pj-29",
		issue: "2023-10-19",
		due: "2023-10-19",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-29-1",
			serviceId: "srv-21",
			description: "Chilli Chilli Packaging",
			scope: "Custom size design  (no larger than W100cm x H100cm x D100cm)\nBox/bag/label layout\nDie-line template use\nTypography & style guide\nPrint-ready AI file (CMYK)\nWeb-friendly JPEG/PNG\nVisual Mockups",
			timeline: "5 Days",
			qty: 1,
			price: 130
		}],
		images: []
	},
	{
		id: "inv-30",
		no: "RVIN-23102301",
		kind: "Invoice",
		clientId: "cl-rvd-55",
		projectId: "pj-30",
		issue: "2023-10-23",
		due: "2023-10-23",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-30-1",
			serviceId: "srv-7",
			description: "APLE OCSEA Handout",
			scope: "Custom layout design (bi-fold, tri-fold, or multi-page)\nTypography & grid systems\nInfographic and data visualization\nVisual and brand alignment\nPrint & digital version formatting\nPrint-ready AI file (CMYK)\nWeb-friendly JPEG/PNG\nEditable source file (AI/PSD)\nVisual Mockups",
			timeline: "3 Days",
			qty: 1,
			price: 450
		}],
		images: []
	},
	{
		id: "inv-31",
		no: "RVIN-23102501",
		kind: "Invoice",
		clientId: "cl-rvd-79",
		projectId: "pj-31",
		issue: "2023-10-25",
		due: "2023-10-25",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-31-1",
			serviceId: "srv-6",
			description: "A-Frame Signboards",
			scope: "Print-size setup (no larger than 300cm x 500cm)\nBranding integration\nCMYK setup\nPrint-ready scaling\nPrint-ready AI file (CMYK)\nWeb-friendly JPEG/PNG\nEditable source file (AI/PSD)\nVisual Mockups",
			timeline: "3 Days",
			qty: 1,
			price: 200
		}],
		images: []
	},
	{
		id: "inv-32",
		no: "RVIN-23102701",
		kind: "Invoice",
		clientId: "cl-rvd-68",
		projectId: "pj-32",
		issue: "2023-10-27",
		due: "2023-10-27",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-32-1",
			serviceId: "srv-21",
			description: "Chilli Chilli Packaging Extra",
			scope: "Custom size design  (no larger than W100cm x H100cm x D100cm)\nBox/bag/label layout\nDie-line template use\nTypography & style guide\nPrint-ready AI file (CMYK)\nWeb-friendly JPEG/PNG\nVisual Mockups",
			timeline: "5 Days",
			qty: 1,
			price: 15
		}],
		images: []
	},
	{
		id: "inv-33",
		no: "RVIN-23121001",
		kind: "Invoice",
		clientId: "cl-rvd-49",
		projectId: "pj-33",
		issue: "2023-12-10",
		due: "2023-12-10",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-33-1",
			serviceId: "srv-2",
			description: "Training Certificate",
			scope: "Square / Landscape Layout Design\nPromo theme + CTA\nWeb-friendly JPEG/PNG\nEditable source file (AI/PSD)",
			timeline: "2 Days",
			qty: 1,
			price: 20
		}],
		images: []
	},
	{
		id: "inv-34",
		no: "RVIN-23121002",
		kind: "Invoice",
		clientId: "cl-rvd-50",
		projectId: "pj-34",
		issue: "2023-12-10",
		due: "2023-12-10",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-34-1",
			serviceId: "srv-1",
			description: "JE Beauty Studio",
			scope: "2 Unique Logo Concepts\nResearch & Concept Development\nLogo Refinement & Selection\nFinal logo in AI, EPS, PDF, PNG, JPG\nBlack/white & color versions\nBasic Brand GuideStyle\nVisual Mockups",
			timeline: "5 Days",
			qty: 1,
			price: 30
		}],
		images: []
	},
	{
		id: "inv-35",
		no: "RVIN-23121901",
		kind: "Invoice",
		clientId: "cl-rvd-55",
		projectId: "pj-35",
		issue: "2023-12-19",
		due: "2023-12-19",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-35-1",
			serviceId: "srv-7",
			description: "APLE OCSEA KH",
			scope: "Custom layout design (bi-fold, tri-fold, or multi-page)\nTypography & grid systems\nInfographic and data visualization\nVisual and brand alignment\nPrint & digital version formatting\nPrint-ready AI file (CMYK)\nWeb-friendly JPEG/PNG\nEditable source file (AI/PSD)\nVisual Mockups",
			timeline: "3 Days",
			qty: 1,
			price: 499.2
		}],
		images: []
	},
	{
		id: "inv-36",
		no: "RVIN-23122601",
		kind: "Invoice",
		clientId: "cl-rvd-49",
		projectId: "pj-36",
		issue: "2023-12-26",
		due: "2023-12-26",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-36-1",
			serviceId: "srv-7",
			description: "Hotline Leaflet & Sticker",
			scope: "Custom layout design (bi-fold, tri-fold, or multi-page)\nTypography & grid systems\nInfographic and data visualization\nVisual and brand alignment\nPrint & digital version formatting\nPrint-ready AI file (CMYK)\nWeb-friendly JPEG/PNG\nEditable source file (AI/PSD)\nVisual Mockups",
			timeline: "3 Days",
			qty: 1,
			price: 100
		}],
		images: []
	},
	{
		id: "inv-37",
		no: "RVIN-24030301",
		kind: "Invoice",
		clientId: "cl-rvd-50",
		projectId: "pj-37",
		issue: "2024-03-03",
		due: "2024-03-03",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-37-1",
			serviceId: "srv-1",
			description: "Banh Mi by Doh Baby",
			scope: "2 Unique Logo Concepts\nResearch & Concept Development\nLogo Refinement & Selection\nFinal logo in AI, EPS, PDF, PNG, JPG\nBlack/white & color versions\nBasic Brand GuideStyle\nVisual Mockups",
			timeline: "5 Days",
			qty: 1,
			price: 80
		}],
		images: []
	},
	{
		id: "inv-38",
		no: "RVIN-24030401",
		kind: "Invoice",
		clientId: "cl-rvd-55",
		projectId: "pj-38",
		issue: "2024-03-04",
		due: "2024-03-04",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-38-1",
			serviceId: "srv-7",
			description: "OCSEA English Amendend",
			scope: "Custom layout design (bi-fold, tri-fold, or multi-page)\nTypography & grid systems\nInfographic and data visualization\nVisual and brand alignment\nPrint & digital version formatting\nPrint-ready AI file (CMYK)\nWeb-friendly JPEG/PNG\nEditable source file (AI/PSD)\nVisual Mockups",
			timeline: "3 Days",
			qty: 1,
			price: 240.9
		}],
		images: []
	},
	{
		id: "inv-39",
		no: "RVIN-24030901",
		kind: "Invoice",
		clientId: "cl-rvd-50",
		projectId: "pj-39",
		issue: "2024-03-09",
		due: "2024-03-09",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-39-1",
			serviceId: "srv-1",
			description: "Doh Baby Re-Design",
			scope: "2 Unique Logo Concepts\nResearch & Concept Development\nLogo Refinement & Selection\nFinal logo in AI, EPS, PDF, PNG, JPG\nBlack/white & color versions\nBasic Brand GuideStyle\nVisual Mockups",
			timeline: "5 Days",
			qty: 1,
			price: 50
		}],
		images: []
	},
	{
		id: "inv-40",
		no: "RVIN-24030902",
		kind: "Invoice",
		clientId: "cl-rvd-50",
		projectId: "pj-40",
		issue: "2024-03-09",
		due: "2024-03-09",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-40-1",
			serviceId: "srv-1",
			description: "Ly Hospitality Group",
			scope: "2 Unique Logo Concepts\nResearch & Concept Development\nLogo Refinement & Selection\nFinal logo in AI, EPS, PDF, PNG, JPG\nBlack/white & color versions\nBasic Brand GuideStyle\nVisual Mockups",
			timeline: "5 Days",
			qty: 1,
			price: 100
		}],
		images: []
	},
	{
		id: "inv-41",
		no: "RVIN-24041801",
		kind: "Invoice",
		clientId: "cl-rvd-50",
		projectId: "pj-41",
		issue: "2024-04-18",
		due: "2024-04-18",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-41-1",
			serviceId: "srv-1",
			description: "LXE Investment",
			scope: "2 Unique Logo Concepts\nResearch & Concept Development\nLogo Refinement & Selection\nFinal logo in AI, EPS, PDF, PNG, JPG\nBlack/white & color versions\nBasic Brand GuideStyle\nVisual Mockups",
			timeline: "5 Days",
			qty: 1,
			price: 70
		}],
		images: []
	},
	{
		id: "inv-42",
		no: "RVIN-24041802",
		kind: "Invoice",
		clientId: "cl-rvd-50",
		projectId: "pj-42",
		issue: "2024-04-18",
		due: "2024-04-18",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-42-1",
			serviceId: "srv-5",
			description: "KNY 24 Poster",
			scope: "2 Concept Design layout\nLogo & contact info integration\nPrint-ready AI file (CMYK)\nEditable source file (AI/PSD)\nVisual Mockups",
			timeline: "2 Days",
			qty: 1,
			price: 25
		}],
		images: []
	},
	{
		id: "inv-43",
		no: "RVIN-24050901",
		kind: "Invoice",
		clientId: "cl-rvd-56",
		projectId: "pj-43",
		issue: "2024-05-09",
		due: "2024-05-09",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-43-1",
			serviceId: "srv-2",
			description: "Confluence Stamp & Postal Card",
			scope: "Square / Landscape Layout Design\nPromo theme + CTA\nWeb-friendly JPEG/PNG\nEditable source file (AI/PSD)",
			timeline: "2 Days",
			qty: 1,
			price: 100
		}],
		images: []
	},
	{
		id: "inv-44",
		no: "RVIN-24051001",
		kind: "Invoice",
		clientId: "cl-rvd-50",
		projectId: "pj-44",
		issue: "2024-05-10",
		due: "2024-05-10",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-44-1",
			serviceId: "srv-1",
			description: "Hostme",
			scope: "2 Unique Logo Concepts\nResearch & Concept Development\nLogo Refinement & Selection\nFinal logo in AI, EPS, PDF, PNG, JPG\nBlack/white & color versions\nBasic Brand GuideStyle\nVisual Mockups",
			timeline: "5 Days",
			qty: 1,
			price: 70
		}],
		images: []
	},
	{
		id: "inv-45",
		no: "RVIN-24051201",
		kind: "Invoice",
		clientId: "cl-rvd-50",
		projectId: "pj-45",
		issue: "2024-05-12",
		due: "2024-05-12",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-45-1",
			serviceId: "srv-1",
			description: "Doh Baby Expresso Bar (Revise Logo)",
			scope: "2 Unique Logo Concepts\nResearch & Concept Development\nLogo Refinement & Selection\nFinal logo in AI, EPS, PDF, PNG, JPG\nBlack/white & color versions\nBasic Brand GuideStyle\nVisual Mockups",
			timeline: "5 Days",
			qty: 1,
			price: 35
		}],
		images: []
	},
	{
		id: "inv-46",
		no: "RVIN-24051801",
		kind: "Invoice",
		clientId: "cl-rvd-57",
		projectId: "pj-46",
		issue: "2024-05-18",
		due: "2024-05-18",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-46-1",
			serviceId: "srv-1",
			description: "BSG Vet",
			scope: "2 Unique Logo Concepts\nResearch & Concept Development\nLogo Refinement & Selection\nFinal logo in AI, EPS, PDF, PNG, JPG\nBlack/white & color versions\nBasic Brand GuideStyle\nVisual Mockups",
			timeline: "5 Days",
			qty: 1,
			price: 250
		}],
		images: []
	},
	{
		id: "inv-47",
		no: "RVIN-24052501",
		kind: "Invoice",
		clientId: "cl-rvd-49",
		projectId: "pj-47",
		issue: "2024-05-25",
		due: "2024-05-25",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-47-1",
			serviceId: "srv-2",
			description: "Carosel Poster & Split Leaflet",
			scope: "Square / Landscape Layout Design\nPromo theme + CTA\nWeb-friendly JPEG/PNG\nEditable source file (AI/PSD)",
			timeline: "2 Days",
			qty: 1,
			price: 60
		}],
		images: []
	},
	{
		id: "inv-48",
		no: "RVIN-24052801",
		kind: "Invoice",
		clientId: "cl-rvd-51",
		projectId: "pj-48",
		issue: "2024-05-28",
		due: "2024-05-28",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-48-1",
			serviceId: "srv-6",
			description: "ISI National Road 2 Hoarding, Billboard, & Totem — Billboard / Banner / Hoarding",
			scope: "Print-size setup (no larger than 300cm x 500cm)\nBranding integration\nCMYK setup\nPrint-ready scaling\nPrint-ready AI file (CMYK)\nWeb-friendly JPEG/PNG\nEditable source file (AI/PSD)\nVisual Mockups",
			timeline: "3 Days",
			qty: 1,
			price: 171.43
		}, {
			id: "it-48-2",
			serviceId: "srv-16",
			description: "Pylon / Totem",
			scope: "Custom size design  (no larger than W300cm x H1200cm x D60cm)\nLogo Lightbox Layout Design\nReadability optimization\nLayout based on sign specs\nPrint-ready AI file (CMYK)\nWeb-friendly JPEG/PNG\nVisual Mockups",
			timeline: "5 Days",
			qty: 1,
			price: 228.57
		}],
		images: []
	},
	{
		id: "inv-49",
		no: "RVIN-24052901",
		kind: "Invoice",
		clientId: "cl-rvd-53",
		projectId: "pj-49",
		issue: "2024-05-29",
		due: "2024-05-29",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-49-1",
			serviceId: "srv-1",
			description: "WeLoy Logo Branding & HomePage Website — Logo Branding I",
			scope: "2 Unique Logo Concepts\nResearch & Concept Development\nLogo Refinement & Selection\nFinal logo in AI, EPS, PDF, PNG, JPG\nBlack/white & color versions\nBasic Brand GuideStyle\nVisual Mockups",
			timeline: "5 Days",
			qty: 1,
			price: 87.5
		}, {
			id: "it-49-2",
			serviceId: "srv-3",
			description: "Homepage",
			scope: "UI/UX layout\nNavigation Section\nHero Section, features, contact\nFooter section\nDesktop & mobile mockup\nRealtime Prototpye\nFigma or XD file\nJPG/PNG preview\nDesign assets (icons/images)\nVisual Mockups",
			timeline: "15 Days",
			qty: 1,
			price: 262.5
		}],
		images: []
	},
	{
		id: "inv-50",
		no: "RVIN-24052902",
		kind: "Invoice",
		clientId: "cl-rvd-54",
		projectId: "pj-50",
		issue: "2024-05-29",
		due: "2024-05-29",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-50-1",
			serviceId: "srv-1",
			description: "Kim Hour",
			scope: "2 Unique Logo Concepts\nResearch & Concept Development\nLogo Refinement & Selection\nFinal logo in AI, EPS, PDF, PNG, JPG\nBlack/white & color versions\nBasic Brand GuideStyle\nVisual Mockups",
			timeline: "5 Days",
			qty: 1,
			price: 250
		}],
		images: []
	},
	{
		id: "inv-51",
		no: "RVIN-24062101",
		kind: "Invoice",
		clientId: "cl-rvd-49",
		projectId: "pj-51",
		issue: "2024-06-21",
		due: "2024-06-21",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-51-1",
			serviceId: "srv-3",
			description: "Website Police Hotline",
			scope: "UI/UX layout\nNavigation Section\nHero Section, features, contact\nFooter section\nDesktop & mobile mockup\nRealtime Prototpye\nFigma or XD file\nJPG/PNG preview\nDesign assets (icons/images)\nVisual Mockups",
			timeline: "15 Days",
			qty: 1,
			price: 50
		}],
		images: []
	},
	{
		id: "inv-52",
		no: "RVIN-24072601",
		kind: "Invoice",
		clientId: "cl-rvd-56",
		projectId: "pj-52",
		issue: "2024-07-26",
		due: "2024-07-26",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: false,
		includeTerms: false,
		includeRates: false,
		notes: "Retained partial deposit on cancelled project.",
		items: [{
			id: "it-52-1",
			serviceId: "srv-1",
			description: "Tandem Partner Logo (deposit retained)",
			scope: "",
			timeline: "5 Days",
			qty: 1,
			price: 100
		}],
		images: []
	},
	{
		id: "inv-53",
		no: "RVIN-24080801",
		kind: "Invoice",
		clientId: "cl-rvd-55",
		projectId: "pj-53",
		issue: "2024-08-08",
		due: "2024-08-08",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-53-1",
			serviceId: "srv-7",
			description: "APLE OCEA KH Amendment",
			scope: "Custom layout design (bi-fold, tri-fold, or multi-page)\nTypography & grid systems\nInfographic and data visualization\nVisual and brand alignment\nPrint & digital version formatting\nPrint-ready AI file (CMYK)\nWeb-friendly JPEG/PNG\nEditable source file (AI/PSD)\nVisual Mockups",
			timeline: "3 Days",
			qty: 1,
			price: 176
		}],
		images: []
	},
	{
		id: "inv-54",
		no: "RVIN-24081601",
		kind: "Invoice",
		clientId: "cl-rvd-70",
		projectId: "pj-54",
		issue: "2024-08-16",
		due: "2024-08-16",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-54-1",
			serviceId: "srv-6",
			description: "BSFV Tenant Logo 1x1m",
			scope: "Print-size setup (no larger than 300cm x 500cm)\nBranding integration\nCMYK setup\nPrint-ready scaling\nPrint-ready AI file (CMYK)\nWeb-friendly JPEG/PNG\nEditable source file (AI/PSD)\nVisual Mockups",
			timeline: "3 Days",
			qty: 1,
			price: 50
		}],
		images: []
	},
	{
		id: "inv-55",
		no: "RVIN-24082601",
		kind: "Invoice",
		clientId: "cl-rvd-69",
		projectId: "pj-55",
		issue: "2024-08-26",
		due: "2024-08-26",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-55-1",
			serviceId: "srv-7",
			description: "APLE Info Kit",
			scope: "Custom layout design (bi-fold, tri-fold, or multi-page)\nTypography & grid systems\nInfographic and data visualization\nVisual and brand alignment\nPrint & digital version formatting\nPrint-ready AI file (CMYK)\nWeb-friendly JPEG/PNG\nEditable source file (AI/PSD)\nVisual Mockups",
			timeline: "3 Days",
			qty: 1,
			price: 35
		}],
		images: []
	},
	{
		id: "inv-56",
		no: "RVIN-24092701",
		kind: "Invoice",
		clientId: "cl-rvd-70",
		projectId: "pj-56",
		issue: "2024-09-27",
		due: "2024-09-27",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-56-1",
			serviceId: "srv-6",
			description: "BSFV Logo + Billboard",
			scope: "Print-size setup (no larger than 300cm x 500cm)\nBranding integration\nCMYK setup\nPrint-ready scaling\nPrint-ready AI file (CMYK)\nWeb-friendly JPEG/PNG\nEditable source file (AI/PSD)\nVisual Mockups",
			timeline: "3 Days",
			qty: 1,
			price: 30
		}],
		images: []
	},
	{
		id: "inv-57",
		no: "RVIN-24092901",
		kind: "Invoice",
		clientId: "cl-rvd-49",
		projectId: "pj-57",
		issue: "2024-09-29",
		due: "2024-09-29",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-57-1",
			serviceId: "srv-2",
			description: "UNICEF Online Campaign",
			scope: "Square / Landscape Layout Design\nPromo theme + CTA\nWeb-friendly JPEG/PNG\nEditable source file (AI/PSD)",
			timeline: "2 Days",
			qty: 1,
			price: 120
		}],
		images: []
	},
	{
		id: "inv-58",
		no: "RVIN-24100301",
		kind: "Invoice",
		clientId: "cl-rvd-56",
		projectId: "pj-58",
		issue: "2024-10-03",
		due: "2024-10-03",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-58-1",
			serviceId: "srv-1",
			description: "Teize Fevier",
			scope: "2 Unique Logo Concepts\nResearch & Concept Development\nLogo Refinement & Selection\nFinal logo in AI, EPS, PDF, PNG, JPG\nBlack/white & color versions\nBasic Brand GuideStyle\nVisual Mockups",
			timeline: "5 Days",
			qty: 1,
			price: 100
		}],
		images: []
	},
	{
		id: "inv-59",
		no: "RVIN-24100701",
		kind: "Invoice",
		clientId: "cl-rvd-72",
		projectId: "pj-59",
		issue: "2024-10-07",
		due: "2024-10-07",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: false,
		includeTerms: false,
		includeRates: false,
		notes: "Retained partial deposit on cancelled project.",
		items: [{
			id: "it-59-1",
			serviceId: "srv-1",
			description: "Chez Dodin (deposit retained)",
			scope: "",
			timeline: "5 Days",
			qty: 1,
			price: 65
		}],
		images: []
	},
	{
		id: "inv-60",
		no: "RVIN-24100901",
		kind: "Invoice",
		clientId: "cl-rvd-56",
		projectId: "pj-60",
		issue: "2024-10-09",
		due: "2024-10-09",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-60-1",
			serviceId: "srv-26",
			description: "Rolling-Up Stand & JFlag",
			scope: "X-Stand/I-Stand layout\nKey brand elements\nHigh-resolution setup for large print\nPrint-ready AI file (CMYK)\nWeb-friendly JPEG/PNG\nVisual Mockups",
			timeline: "3 Days",
			qty: 1,
			price: 130
		}],
		images: []
	},
	{
		id: "inv-61",
		no: "RVIN-24101601",
		kind: "Invoice",
		clientId: "cl-rvd-56",
		projectId: "pj-61",
		issue: "2024-10-16",
		due: "2024-10-16",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-61-1",
			serviceId: "srv-20",
			description: "Sakam Presentation Slides",
			scope: "Max. 12 slides/pages\nBranding integration\nIcon/graphic design\nContent formatting\nPDF format\nWeb-friendly JPEG/PNG\nEditable PowerPoint or Google Slides file\nEditable source file (AI/PSD)\nVisual Mockups",
			timeline: "10 Days",
			qty: 1,
			price: 300
		}],
		images: []
	},
	{
		id: "inv-63",
		no: "RVIN-24102601",
		kind: "Invoice",
		clientId: "cl-rvd-56",
		projectId: "pj-63",
		issue: "2024-10-26",
		due: "2024-10-26",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-63-1",
			serviceId: "srv-1",
			description: "Concorde Logo",
			scope: "2 Unique Logo Concepts\nResearch & Concept Development\nLogo Refinement & Selection\nFinal logo in AI, EPS, PDF, PNG, JPG\nBlack/white & color versions\nBasic Brand GuideStyle\nVisual Mockups",
			timeline: "5 Days",
			qty: 1,
			price: 100
		}],
		images: []
	},
	{
		id: "inv-64",
		no: "RVIN-24102801",
		kind: "Invoice",
		clientId: "cl-rvd-49",
		projectId: "pj-64",
		issue: "2024-10-28",
		due: "2024-10-28",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-64-1",
			serviceId: "srv-2",
			description: "UNICEF Online Campaign Extra",
			scope: "Square / Landscape Layout Design\nPromo theme + CTA\nWeb-friendly JPEG/PNG\nEditable source file (AI/PSD)",
			timeline: "2 Days",
			qty: 1,
			price: 20
		}],
		images: []
	},
	{
		id: "inv-65",
		no: "RVIN-24102802",
		kind: "Invoice",
		clientId: "cl-rvd-56",
		projectId: "pj-65",
		issue: "2024-10-28",
		due: "2024-11-25",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-65-1",
			serviceId: "srv-2",
			description: "Part- Time #1",
			scope: "Square / Landscape Layout Design\nPromo theme + CTA\nWeb-friendly JPEG/PNG\nEditable source file (AI/PSD)",
			timeline: "2 Days",
			qty: 1,
			price: 300
		}],
		images: []
	},
	{
		id: "inv-67",
		no: "RVIN-24121001",
		kind: "Invoice",
		clientId: "cl-rvd-76",
		projectId: "pj-67",
		issue: "2024-12-10",
		due: "2024-12-12",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-67-1",
			serviceId: "srv-2",
			description: "Social Media Poster x 8",
			scope: "Square / Landscape Layout Design\nPromo theme + CTA\nWeb-friendly JPEG/PNG\nEditable source file (AI/PSD)",
			timeline: "2 Days",
			qty: 1,
			price: 140
		}],
		images: []
	},
	{
		id: "inv-68",
		no: "RVIN-24121201",
		kind: "Invoice",
		clientId: "cl-rvd-49",
		projectId: "pj-68",
		issue: "2024-12-12",
		due: "2024-12-12",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-68-1",
			serviceId: "srv-2",
			description: "Child Friendly Practise + Online Awareness Campaign + Leaflet — Promo Post / Cover",
			scope: "Square / Landscape Layout Design\nPromo theme + CTA\nWeb-friendly JPEG/PNG\nEditable source file (AI/PSD)",
			timeline: "2 Days",
			qty: 1,
			price: 50
		}, {
			id: "it-68-2",
			serviceId: "srv-7",
			description: "Brochure / Documents / Anual Report",
			scope: "Custom layout design (bi-fold, tri-fold, or multi-page)\nTypography & grid systems\nInfographic and data visualization\nVisual and brand alignment\nPrint & digital version formatting\nPrint-ready AI file (CMYK)\nWeb-friendly JPEG/PNG\nEditable source file (AI/PSD)\nVisual Mockups",
			timeline: "3 Days",
			qty: 1,
			price: 300
		}],
		images: []
	},
	{
		id: "inv-69",
		no: "RVIN-24123001",
		kind: "Invoice",
		clientId: "cl-rvd-80",
		projectId: "pj-69",
		issue: "2024-12-30",
		due: "2025-01-21",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-69-1",
			serviceId: "srv-21",
			description: "GOLDWOK Oyster Sauce Packaging — Packaging",
			scope: "Custom size design  (no larger than W100cm x H100cm x D100cm)\nBox/bag/label layout\nDie-line template use\nTypography & style guide\nPrint-ready AI file (CMYK)\nWeb-friendly JPEG/PNG\nVisual Mockups",
			timeline: "5 Days",
			qty: 1,
			price: 283.78
		}, {
			id: "it-69-2",
			serviceId: "srv-22",
			description: "Polo Shirt",
			scope: "Front/back layout\nBrand + illustration design\nVisual and brand alignment\nPrint & digital version formatting\nPrint-ready AI file (CMYK)\nWeb-friendly JPEG/PNG\nEditable source file (AI/PSD)\nVisual Mockups",
			timeline: "3 Days",
			qty: 1,
			price: 66.22
		}],
		images: []
	},
	{
		id: "inv-70",
		no: "RVIN-25011601",
		kind: "Invoice",
		clientId: "cl-rvd-50",
		projectId: "pj-70",
		issue: "2025-01-16",
		due: "2025-01-16",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-70-1",
			serviceId: "srv-1",
			description: "dough Logo Branding Design",
			scope: "2 Unique Logo Concepts\nResearch & Concept Development\nLogo Refinement & Selection\nFinal logo in AI, EPS, PDF, PNG, JPG\nBlack/white & color versions\nBasic Brand GuideStyle\nVisual Mockups",
			timeline: "5 Days",
			qty: 1,
			price: 90
		}],
		images: []
	},
	{
		id: "inv-71",
		no: "RVIN-25011701",
		kind: "Invoice",
		clientId: "cl-rvd-50",
		projectId: "pj-71",
		issue: "2025-01-17",
		due: "2025-01-17",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "Bánh & Mì is a celebration of Vietnamese street culture and culinary simplicity. With premium ingredients and fast, friendly service, it brings a fresh Saigon flavor to the heart of New Zealand.",
		items: [{
			id: "it-71-1",
			serviceId: "srv-1",
			description: "Banh & Mi Logo Branding Design",
			scope: "2 Unique Logo Concepts\nResearch & Concept Development\nLogo Refinement & Selection\nFinal logo in AI, EPS, PDF, PNG, JPG\nBlack/white & color versions\nBasic Brand GuideStyle\nVisual Mockups",
			timeline: "5 Days",
			qty: 1,
			price: 90
		}],
		images: []
	},
	{
		id: "inv-72",
		no: "RVIN-25020701",
		kind: "Invoice",
		clientId: "cl-rvd-50",
		projectId: "pj-72",
		issue: "2025-02-07",
		due: "2025-02-07",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-72-1",
			serviceId: "srv-21",
			description: "dough paper wrap pattern",
			scope: "Custom size design  (no larger than W100cm x H100cm x D100cm)\nBox/bag/label layout\nDie-line template use\nTypography & style guide\nPrint-ready AI file (CMYK)\nWeb-friendly JPEG/PNG\nVisual Mockups",
			timeline: "5 Days",
			qty: 1,
			price: 25
		}],
		images: []
	},
	{
		id: "inv-73",
		no: "RVIN-25020702",
		kind: "Invoice",
		clientId: "cl-rvd-50",
		projectId: "pj-73",
		issue: "2025-02-07",
		due: "2025-02-07",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-73-1",
			serviceId: "srv-21",
			description: "dough mascot + box packaging",
			scope: "Custom size design  (no larger than W100cm x H100cm x D100cm)\nBox/bag/label layout\nDie-line template use\nTypography & style guide\nPrint-ready AI file (CMYK)\nWeb-friendly JPEG/PNG\nVisual Mockups",
			timeline: "5 Days",
			qty: 1,
			price: 100
		}],
		images: []
	},
	{
		id: "inv-74",
		no: "RVIN-25030501",
		kind: "Invoice",
		clientId: "cl-rvd-57",
		projectId: "pj-74",
		issue: "2025-03-05",
		due: "2025-03-05",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-74-1",
			serviceId: "srv-1",
			description: "Namas.K Coffee",
			scope: "2 Unique Logo Concepts\nResearch & Concept Development\nLogo Refinement & Selection\nFinal logo in AI, EPS, PDF, PNG, JPG\nBlack/white & color versions\nBasic Brand GuideStyle\nVisual Mockups",
			timeline: "5 Days",
			qty: 1,
			price: 100
		}],
		images: []
	},
	{
		id: "inv-75",
		no: "RVIN-25030502",
		kind: "Invoice",
		clientId: "cl-rvd-69",
		projectId: "pj-75",
		issue: "2025-03-05",
		due: "2025-03-05",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-75-1",
			serviceId: "srv-7",
			description: "APLE Information Kit",
			scope: "Custom layout design (bi-fold, tri-fold, or multi-page)\nTypography & grid systems\nInfographic and data visualization\nVisual and brand alignment\nPrint & digital version formatting\nPrint-ready AI file (CMYK)\nWeb-friendly JPEG/PNG\nEditable source file (AI/PSD)\nVisual Mockups",
			timeline: "3 Days",
			qty: 1,
			price: 96
		}],
		images: []
	},
	{
		id: "inv-76",
		no: "RVIN-25031501",
		kind: "Invoice",
		clientId: "cl-rvd-50",
		projectId: "pj-76",
		issue: "2025-03-15",
		due: "2025-03-15",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-76-1",
			serviceId: "srv-21",
			description: "Doughtelier Packaging",
			scope: "Custom size design  (no larger than W100cm x H100cm x D100cm)\nBox/bag/label layout\nDie-line template use\nTypography & style guide\nPrint-ready AI file (CMYK)\nWeb-friendly JPEG/PNG\nVisual Mockups",
			timeline: "5 Days",
			qty: 1,
			price: 150
		}],
		images: []
	},
	{
		id: "inv-77",
		no: "RVIN-25032001",
		kind: "Invoice",
		clientId: "cl-rvd-81",
		projectId: "pj-77",
		issue: "2025-03-20",
		due: "2025-03-20",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-77-1",
			serviceId: "srv-1",
			description: "TIA Engineering Service Company",
			scope: "2 Unique Logo Concepts\nResearch & Concept Development\nLogo Refinement & Selection\nFinal logo in AI, EPS, PDF, PNG, JPG\nBlack/white & color versions\nBasic Brand GuideStyle\nVisual Mockups",
			timeline: "5 Days",
			qty: 1,
			price: 350
		}],
		images: []
	},
	{
		id: "inv-78",
		no: "RVIN-25032101",
		kind: "Invoice",
		clientId: "cl-rvd-82",
		projectId: "pj-78",
		issue: "2025-03-21",
		due: "2025-03-21",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-78-1",
			serviceId: "srv-1",
			description: "The RED HOUSE - Koh Rong Island",
			scope: "2 Unique Logo Concepts\nResearch & Concept Development\nLogo Refinement & Selection\nFinal logo in AI, EPS, PDF, PNG, JPG\nBlack/white & color versions\nBasic Brand GuideStyle\nVisual Mockups",
			timeline: "5 Days",
			qty: 1,
			price: 100
		}],
		images: []
	},
	{
		id: "inv-79",
		no: "RVIN-25050801",
		kind: "Invoice",
		clientId: "cl-rvd-81",
		projectId: "pj-79",
		issue: "2025-05-08",
		due: "2025-05-08",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "— Hun Sreymao, HR & Admin Manager @TIA Engineering Services Company Limited",
		items: [{
			id: "it-79-1",
			serviceId: "srv-5",
			description: "TES Staff ID & Business Card",
			scope: "2 Concept Design layout\nLogo & contact info integration\nPrint-ready AI file (CMYK)\nEditable source file (AI/PSD)\nVisual Mockups",
			timeline: "2 Days",
			qty: 1,
			price: 80
		}],
		images: []
	},
	{
		id: "inv-80",
		no: "RVIN-25052301",
		kind: "Invoice",
		clientId: "cl-rvd-57",
		projectId: "pj-80",
		issue: "2025-05-23",
		due: "2025-05-23",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-80-1",
			serviceId: "srv-1",
			description: "NK Life Tech",
			scope: "2 Unique Logo Concepts\nResearch & Concept Development\nLogo Refinement & Selection\nFinal logo in AI, EPS, PDF, PNG, JPG\nBlack/white & color versions\nBasic Brand GuideStyle\nVisual Mockups",
			timeline: "5 Days",
			qty: 1,
			price: 100
		}],
		images: []
	},
	{
		id: "inv-81",
		no: "RVIN-25052601",
		kind: "Invoice",
		clientId: "cl-rvd-71",
		projectId: "pj-81",
		issue: "2025-05-26",
		due: "2025-05-26",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-81-1",
			serviceId: "srv-1",
			description: "Infinite Sport Club & Pi 3.14",
			scope: "2 Unique Logo Concepts\nResearch & Concept Development\nLogo Refinement & Selection\nFinal logo in AI, EPS, PDF, PNG, JPG\nBlack/white & color versions\nBasic Brand GuideStyle\nVisual Mockups",
			timeline: "5 Days",
			qty: 1,
			price: 650
		}],
		images: []
	},
	{
		id: "inv-82",
		no: "RVIN-25061001",
		kind: "Invoice",
		clientId: "cl-rvd-83",
		projectId: "pj-82",
		issue: "2025-06-10",
		due: "2025-06-10",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-82-1",
			serviceId: "srv-1",
			description: "Tonle Sab Musuem Logo, A5 E-Flyer, Ticker, Banner",
			scope: "2 Unique Logo Concepts\nResearch & Concept Development\nLogo Refinement & Selection\nFinal logo in AI, EPS, PDF, PNG, JPG\nBlack/white & color versions\nBasic Brand GuideStyle\nVisual Mockups",
			timeline: "5 Days",
			qty: 1,
			price: 60
		}],
		images: []
	},
	{
		id: "inv-83",
		no: "RVIN-25061701",
		kind: "Invoice",
		clientId: "cl-rvd-56",
		projectId: "pj-83",
		issue: "2025-06-17",
		due: "2025-06-17",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-83-1",
			serviceId: "srv-2",
			description: "Exelmans Poster 25 Banner Design / Export to Figma",
			scope: "Square / Landscape Layout Design\nPromo theme + CTA\nWeb-friendly JPEG/PNG\nEditable source file (AI/PSD)",
			timeline: "2 Days",
			qty: 1,
			price: 100
		}],
		images: []
	},
	{
		id: "inv-84",
		no: "RVIN-25062501",
		kind: "Invoice",
		clientId: "cl-rvd-49",
		projectId: "pj-84",
		issue: "2025-06-25",
		due: "2025-07-10",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-84-1",
			serviceId: "srv-2",
			description: "aple child safety educators poster x 6 pcs",
			scope: "Square / Landscape Layout Design\nPromo theme + CTA\nWeb-friendly JPEG/PNG\nEditable source file (AI/PSD)",
			timeline: "2 Days",
			qty: 1,
			price: 90
		}],
		images: []
	},
	{
		id: "inv-85",
		no: "RVIN-25071001",
		kind: "Invoice",
		clientId: "cl-rvd-83",
		projectId: "pj-85",
		issue: "2025-07-10",
		due: "2025-07-15",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-85-1",
			serviceId: "srv-23",
			description: "Tonle Sap Museum - Entrance Fees + Direction (200m away)",
			scope: "A5 layout design\nTypography & image integration\nPromo message layout\nPrint-ready AI file (CMYK)\nEditable source file (AI/PSD)\nWeb-friendly JPEG/PNG\nVisual Mockups",
			timeline: "3 Days",
			qty: 1,
			price: 20
		}],
		images: []
	},
	{
		id: "inv-86",
		no: "RVIN-25071601",
		kind: "Invoice",
		clientId: "cl-rvd-83",
		projectId: "pj-86",
		issue: "2025-07-16",
		due: "2025-07-22",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-86-1",
			serviceId: "srv-28",
			description: "Saam Paan Villa Re-Branding",
			scope: "2 Unique Logo Concepts\nResearch & Concept Development\nLogo Refinement & Selection\nFinal logo in AI, EPS, PDF, PNG, JPG\nBlack/white & color versions\nBasic Brand GuideStyle\nVisual Mockups",
			timeline: "3 Days",
			qty: 1,
			price: 20
		}],
		images: []
	},
	{
		id: "inv-87",
		no: "RVIN-25072301",
		kind: "Invoice",
		clientId: "cl-rvd-83",
		projectId: "pj-87",
		issue: "2025-07-23",
		due: "2025-07-29",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-87-1",
			serviceId: "srv-23",
			description: "Saam Paan Villa E-Flyer A5",
			scope: "A5 layout design\nTypography & image integration\nPromo message layout\nPrint-ready AI file (CMYK)\nEditable source file (AI/PSD)\nWeb-friendly JPEG/PNG\nVisual Mockups",
			timeline: "3 Days",
			qty: 1,
			price: 20
		}],
		images: []
	},
	{
		id: "inv-88",
		no: "RVIN-25072901",
		kind: "Invoice",
		clientId: "cl-rvd-49",
		projectId: "pj-88",
		issue: "2025-07-29",
		due: "2025-07-31",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-88-1",
			serviceId: "srv-26",
			description: "aple-istand-&-props-design",
			scope: "X-Stand/I-Stand layout\nKey brand elements\nHigh-resolution setup for large print\nPrint-ready AI file (CMYK)\nWeb-friendly JPEG/PNG\nVisual Mockups",
			timeline: "3 Days",
			qty: 1,
			price: 65
		}],
		images: []
	},
	{
		id: "inv-89",
		no: "RVIN-25081101",
		kind: "Invoice",
		clientId: "cl-rvd-50",
		projectId: "pj-89",
		issue: "2025-08-11",
		due: "2025-08-12",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-89-1",
			serviceId: "srv-28",
			description: "Pie-Time Rebranding",
			scope: "2 Unique Logo Concepts\nResearch & Concept Development\nLogo Refinement & Selection\nFinal logo in AI, EPS, PDF, PNG, JPG\nBlack/white & color versions\nBasic Brand GuideStyle\nVisual Mockups",
			timeline: "3 Days",
			qty: 1,
			price: 50
		}],
		images: []
	},
	{
		id: "doc-90",
		no: "RVQT-25081601",
		kind: "Quotation",
		clientId: "cl-rvd-50",
		projectId: "pj-90",
		issue: "2025-08-16",
		due: "2025-08-16",
		currency: "USD",
		discount: 0,
		sent: true,
		response: "Pending",
		followUp: "2025-08-16",
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-90-1",
			serviceId: "srv-21",
			description: "Pie-Time-Vehicle-livery-design",
			scope: "Custom size design  (no larger than W100cm x H100cm x D100cm)\nBox/bag/label layout\nDie-line template use\nTypography & style guide\nPrint-ready AI file (CMYK)\nWeb-friendly JPEG/PNG\nVisual Mockups",
			timeline: "5 Days",
			qty: 1,
			price: 50
		}],
		images: []
	},
	{
		id: "inv-91",
		no: "RVIN-25081801",
		kind: "Invoice",
		clientId: "cl-rvd-85",
		projectId: "pj-91",
		issue: "2025-08-18",
		due: "2025-08-21",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-91-1",
			serviceId: "srv-21",
			description: "C.Lovee-You-Drinking-Water-Cardboard-Packaging",
			scope: "Custom size design  (no larger than W100cm x H100cm x D100cm)\nBox/bag/label layout\nDie-line template use\nTypography & style guide\nPrint-ready AI file (CMYK)\nWeb-friendly JPEG/PNG\nVisual Mockups",
			timeline: "5 Days",
			qty: 1,
			price: 50
		}],
		images: []
	},
	{
		id: "inv-92",
		no: "RVIN-25082101",
		kind: "Invoice",
		clientId: "cl-rvd-50",
		projectId: "pj-92",
		issue: "2025-08-21",
		due: "2025-08-30",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-92-1",
			serviceId: "srv-21",
			description: "Pie-Time-Flat-Paper-Bag-212x180mm-Packaging Design-both-side",
			scope: "Custom size design  (no larger than W100cm x H100cm x D100cm)\nBox/bag/label layout\nDie-line template use\nTypography & style guide\nPrint-ready AI file (CMYK)\nWeb-friendly JPEG/PNG\nVisual Mockups",
			timeline: "5 Days",
			qty: 1,
			price: 50
		}],
		images: []
	},
	{
		id: "inv-93",
		no: "RVIN-25082102",
		kind: "Invoice",
		clientId: "cl-rvd-83",
		projectId: "pj-93",
		issue: "2025-08-21",
		due: "2025-08-22",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-93-1",
			serviceId: "srv-6",
			description: "Tonle-Sap-Museum-Banner-240cm(W)",
			scope: "Print-size setup (no larger than 300cm x 500cm)\nBranding integration\nCMYK setup\nPrint-ready scaling\nPrint-ready AI file (CMYK)\nWeb-friendly JPEG/PNG\nEditable source file (AI/PSD)\nVisual Mockups",
			timeline: "3 Days",
			qty: 1,
			price: 15
		}],
		images: []
	},
	{
		id: "inv-94",
		no: "RVIN-25082201",
		kind: "Invoice",
		clientId: "cl-rvd-85",
		projectId: "pj-94",
		issue: "2025-08-22",
		due: "2025-08-26",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-94-1",
			serviceId: "srv-21",
			description: "C.Love-You-Drinking-Water-Label-Bottle-Plastic-330ml",
			scope: "Custom size design  (no larger than W100cm x H100cm x D100cm)\nBox/bag/label layout\nDie-line template use\nTypography & style guide\nPrint-ready AI file (CMYK)\nWeb-friendly JPEG/PNG\nVisual Mockups",
			timeline: "5 Days",
			qty: 1,
			price: 100
		}],
		images: []
	},
	{
		id: "inv-95",
		no: "RVIN-25090401",
		kind: "Invoice",
		clientId: "cl-rvd-50",
		projectId: "pj-95",
		issue: "2025-09-04",
		due: "2025-09-08",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-95-1",
			serviceId: "srv-21",
			description: "doughtelier donut box - redesign",
			scope: "Custom size design  (no larger than W100cm x H100cm x D100cm)\nBox/bag/label layout\nDie-line template use\nTypography & style guide\nPrint-ready AI file (CMYK)\nWeb-friendly JPEG/PNG\nVisual Mockups",
			timeline: "5 Days",
			qty: 1,
			price: 150
		}],
		images: []
	},
	{
		id: "inv-96",
		no: "RVIN-25090402",
		kind: "Invoice",
		clientId: "cl-rvd-50",
		projectId: "pj-96",
		issue: "2025-09-04",
		due: "2025-09-11",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-96-1",
			serviceId: "srv-2",
			description: "doughtelier donut + handing grabing donut",
			scope: "Square / Landscape Layout Design\nPromo theme + CTA\nWeb-friendly JPEG/PNG\nEditable source file (AI/PSD)",
			timeline: "2 Days",
			qty: 1,
			price: 25
		}],
		images: []
	},
	{
		id: "inv-97",
		no: "RVIN-25091101",
		kind: "Invoice",
		clientId: "cl-rvd-50",
		projectId: "pj-97",
		issue: "2025-09-11",
		due: "2025-09-12",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-97-1",
			serviceId: "srv-4",
			description: "doughelier brand guideline",
			scope: "Logo usage rules\nBrand color palette\nTypography usage\nBasic layout examples\n1 Page PDF guide\nEditable source file (AI/PSD)\nVisual Mockups (if needed)",
			timeline: "3 Days",
			qty: 1,
			price: 25
		}],
		images: []
	},
	{
		id: "inv-98",
		no: "RVIN-25091501",
		kind: "Invoice",
		clientId: "cl-rvd-50",
		projectId: "pj-98",
		issue: "2025-09-15",
		due: "2025-09-17",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-98-1",
			serviceId: "srv-1",
			description: "cookie-boys. logo + brand guideline",
			scope: "2 Unique Logo Concepts\nResearch & Concept Development\nLogo Refinement & Selection\nFinal logo in AI, EPS, PDF, PNG, JPG\nBlack/white & color versions\nBasic Brand GuideStyle\nVisual Mockups",
			timeline: "5 Days",
			qty: 1,
			price: 100
		}],
		images: []
	},
	{
		id: "inv-99",
		no: "RVIN-25092601",
		kind: "Invoice",
		clientId: "cl-rvd-57",
		projectId: "pj-99",
		issue: "2025-09-26",
		due: "2025-10-03",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-99-1",
			serviceId: "srv-1",
			description: "quick-LPG-logo branding",
			scope: "2 Unique Logo Concepts\nResearch & Concept Development\nLogo Refinement & Selection\nFinal logo in AI, EPS, PDF, PNG, JPG\nBlack/white & color versions\nBasic Brand GuideStyle\nVisual Mockups",
			timeline: "5 Days",
			qty: 1,
			price: 100
		}],
		images: []
	},
	{
		id: "inv-100",
		no: "RVIN-25100101",
		kind: "Invoice",
		clientId: "cl-rvd-83",
		projectId: "pj-100",
		issue: "2025-10-01",
		due: "2025-10-04",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-100-1",
			serviceId: "srv-5",
			description: "personal-business-card",
			scope: "2 Concept Design layout\nLogo & contact info integration\nPrint-ready AI file (CMYK)\nEditable source file (AI/PSD)\nVisual Mockups",
			timeline: "2 Days",
			qty: 1,
			price: 10
		}],
		images: []
	},
	{
		id: "inv-101",
		no: "RVIN-25101701",
		kind: "Invoice",
		clientId: "cl-rvd-86",
		projectId: "pj-101",
		issue: "2025-10-17",
		due: "2025-11-21",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-101-1",
			serviceId: "srv-1",
			description: "BioDia Branding Design + pwerpoint Template + 2 Product Packaging",
			scope: "2 Unique Logo Concepts\nResearch & Concept Development\nLogo Refinement & Selection\nFinal logo in AI, EPS, PDF, PNG, JPG\nBlack/white & color versions\nBasic Brand GuideStyle\nVisual Mockups",
			timeline: "5 Days",
			qty: 1,
			price: 1e3
		}],
		images: []
	},
	{
		id: "inv-102",
		no: "RVIN-25102501",
		kind: "Invoice",
		clientId: "cl-rvd-50",
		projectId: "pj-102",
		issue: "2025-10-25",
		due: "2025-10-30",
		currency: "USD",
		discount: 0,
		sent: true,
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-102-1",
			serviceId: "srv-24",
			description: "doughtelier-post-soft-opening + serving product + halloween",
			scope: "Static Design (Instagram/FB).\nCaption writing support (optional).\nWeb-friendly JPEG/PNG\nEditable source file (AI/PSD)",
			timeline: "2 Days",
			qty: 1,
			price: 100
		}],
		images: []
	},
	{
		id: "doc-103",
		no: "RVQT-26020501",
		kind: "Quotation",
		clientId: "cl-rvd-50",
		projectId: "pj-103",
		issue: "2026-02-05",
		due: "2026-02-10",
		currency: "USD",
		discount: 0,
		sent: true,
		response: "Pending",
		followUp: "2026-02-05",
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-103-1",
			serviceId: "srv-1",
			description: "Elite_Mart",
			scope: "2 Unique Logo Concepts\nResearch & Concept Development\nLogo Refinement & Selection\nFinal logo in AI, EPS, PDF, PNG, JPG\nBlack/white & color versions\nBasic Brand GuideStyle\nVisual Mockups",
			timeline: "5 Days",
			qty: 1,
			price: 100
		}],
		images: []
	},
	{
		id: "doc-104",
		no: "RVQT-26020601",
		kind: "Quotation",
		clientId: "cl-rvd-49",
		projectId: "pj-104",
		issue: "2026-02-06",
		due: "2026-02-07",
		currency: "USD",
		discount: 0,
		sent: true,
		response: "Pending",
		followUp: "2026-02-06",
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-104-1",
			serviceId: "srv-17",
			description: "APLE_SID2026 Photo Props",
			scope: "Custom size design  (no larger than 100cm x 100cm)\nReadability optimization\nLayout based on sign specs\nPrint-ready AI file (CMYK)\nWeb-friendly JPEG/PNG\nVisual Mockups",
			timeline: "2 Days",
			qty: 1,
			price: 50
		}],
		images: []
	},
	{
		id: "doc-105",
		no: "RVQT-26020701",
		kind: "Quotation",
		clientId: "cl-rvd-68",
		projectId: "pj-105",
		issue: "2026-02-07",
		due: "2026-03-05",
		currency: "USD",
		discount: 0,
		sent: true,
		response: "Pending",
		followUp: "2026-02-07",
		showSchedule: true,
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [{
			id: "it-105-1",
			serviceId: "srv-21",
			description: "Khmer Rice Cake Flour - 2 SKU",
			scope: "Custom size design  (no larger than W100cm x H100cm x D100cm)\nBox/bag/label layout\nDie-line template use\nTypography & style guide\nPrint-ready AI file (CMYK)\nWeb-friendly JPEG/PNG\nVisual Mockups",
			timeline: "5 Days",
			qty: 1,
			price: 400
		}],
		images: []
	}
];
var rothvanPayments = [
	{
		id: "pay-1",
		invoiceId: "inv-1",
		date: "2022-12-11",
		amount: 260,
		currency: "USD",
		method: "Bank transfer",
		reference: "Full payment"
	},
	{
		id: "pay-2",
		invoiceId: "inv-2",
		date: "2023-02-06",
		amount: 635,
		currency: "USD",
		method: "Bank transfer",
		reference: "Full payment"
	},
	{
		id: "pay-3",
		invoiceId: "inv-3",
		date: "2023-02-08",
		amount: 170,
		currency: "USD",
		method: "Bank transfer",
		reference: "Full payment"
	},
	{
		id: "pay-4",
		invoiceId: "inv-4",
		date: "2023-02-11",
		amount: 35,
		currency: "USD",
		method: "KHQR",
		reference: "Full payment"
	},
	{
		id: "pay-5",
		invoiceId: "inv-5",
		date: "2023-03-12",
		amount: 60,
		currency: "USD",
		method: "KHQR",
		reference: "Full payment"
	},
	{
		id: "pay-6",
		invoiceId: "inv-6",
		date: "2023-03-12",
		amount: 60,
		currency: "USD",
		method: "KHQR",
		reference: "Full payment"
	},
	{
		id: "pay-7",
		invoiceId: "inv-7",
		date: "2023-03-20",
		amount: 420,
		currency: "USD",
		method: "Bank transfer",
		reference: "Full payment"
	},
	{
		id: "pay-8",
		invoiceId: "inv-8",
		date: "2023-04-15",
		amount: 60,
		currency: "USD",
		method: "KHQR",
		reference: "Full payment"
	},
	{
		id: "pay-9",
		invoiceId: "inv-9",
		date: "2023-04-21",
		amount: 100,
		currency: "USD",
		method: "KHQR",
		reference: "Full payment"
	},
	{
		id: "pay-10",
		invoiceId: "inv-10",
		date: "2023-05-14",
		amount: 60,
		currency: "USD",
		method: "KHQR",
		reference: "Full payment"
	},
	{
		id: "pay-11",
		invoiceId: "inv-11",
		date: "2023-05-19",
		amount: 15,
		currency: "USD",
		method: "KHQR",
		reference: "Full payment"
	},
	{
		id: "pay-12",
		invoiceId: "inv-12",
		date: "2023-06-09",
		amount: 17.5,
		currency: "USD",
		method: "KHQR",
		reference: "Full payment"
	},
	{
		id: "pay-13",
		invoiceId: "inv-13",
		date: "2023-06-14",
		amount: 80,
		currency: "USD",
		method: "KHQR",
		reference: "Full payment"
	},
	{
		id: "pay-14",
		invoiceId: "inv-14",
		date: "2023-08-07",
		amount: 577.5,
		currency: "USD",
		method: "Bank transfer",
		reference: "Full payment"
	},
	{
		id: "pay-15",
		invoiceId: "inv-15",
		date: "2023-08-15",
		amount: 80,
		currency: "USD",
		method: "KHQR",
		reference: "Full payment"
	},
	{
		id: "pay-16",
		invoiceId: "inv-16",
		date: "2023-08-21",
		amount: 400,
		currency: "USD",
		method: "Bank transfer",
		reference: "Full payment"
	},
	{
		id: "pay-17",
		invoiceId: "inv-17",
		date: "2023-08-22",
		amount: 80,
		currency: "USD",
		method: "KHQR",
		reference: "Full payment"
	},
	{
		id: "pay-18",
		invoiceId: "inv-18",
		date: "2023-09-01",
		amount: 90,
		currency: "USD",
		method: "Bank transfer",
		reference: "Deposit"
	},
	{
		id: "pay-19",
		invoiceId: "inv-19",
		date: "2023-09-07",
		amount: 100,
		currency: "USD",
		method: "KHQR",
		reference: "Full payment"
	},
	{
		id: "pay-20",
		invoiceId: "inv-20",
		date: "2023-09-07",
		amount: 130,
		currency: "USD",
		method: "Bank transfer",
		reference: "Deposit"
	},
	{
		id: "pay-21",
		invoiceId: "inv-21",
		date: "2023-09-11",
		amount: 432,
		currency: "USD",
		method: "Bank transfer",
		reference: "Full payment"
	},
	{
		id: "pay-22",
		invoiceId: "inv-22",
		date: "2023-09-25",
		amount: 350,
		currency: "USD",
		method: "Bank transfer",
		reference: "Full payment"
	},
	{
		id: "pay-23",
		invoiceId: "inv-23",
		date: "2023-09-28",
		amount: 160,
		currency: "USD",
		method: "Bank transfer",
		reference: "Full payment"
	},
	{
		id: "pay-24",
		invoiceId: "inv-24",
		date: "2023-10-07",
		amount: 20,
		currency: "USD",
		method: "KHQR",
		reference: "Full payment"
	},
	{
		id: "pay-25",
		invoiceId: "inv-25",
		date: "2023-10-09",
		amount: 70,
		currency: "USD",
		method: "KHQR",
		reference: "Full payment"
	},
	{
		id: "pay-26",
		invoiceId: "inv-26",
		date: "2023-10-10",
		amount: 80,
		currency: "USD",
		method: "KHQR",
		reference: "Full payment"
	},
	{
		id: "pay-27",
		invoiceId: "inv-27",
		date: "2023-10-12",
		amount: 696,
		currency: "USD",
		method: "Bank transfer",
		reference: "Full payment"
	},
	{
		id: "pay-28",
		invoiceId: "inv-28",
		date: "2023-10-14",
		amount: 30,
		currency: "USD",
		method: "KHQR",
		reference: "Full payment"
	},
	{
		id: "pay-29",
		invoiceId: "inv-29",
		date: "2023-10-19",
		amount: 130,
		currency: "USD",
		method: "KHQR",
		reference: "Full payment"
	},
	{
		id: "pay-30",
		invoiceId: "inv-30",
		date: "2023-10-23",
		amount: 450,
		currency: "USD",
		method: "Bank transfer",
		reference: "Full payment"
	},
	{
		id: "pay-31",
		invoiceId: "inv-31",
		date: "2023-10-25",
		amount: 200,
		currency: "USD",
		method: "Bank transfer",
		reference: "Full payment"
	},
	{
		id: "pay-32",
		invoiceId: "inv-32",
		date: "2023-10-27",
		amount: 15,
		currency: "USD",
		method: "KHQR",
		reference: "Full payment"
	},
	{
		id: "pay-33",
		invoiceId: "inv-33",
		date: "2023-12-10",
		amount: 20,
		currency: "USD",
		method: "KHQR",
		reference: "Full payment"
	},
	{
		id: "pay-34",
		invoiceId: "inv-34",
		date: "2023-12-10",
		amount: 30,
		currency: "USD",
		method: "KHQR",
		reference: "Full payment"
	},
	{
		id: "pay-35",
		invoiceId: "inv-35",
		date: "2023-12-19",
		amount: 499.2,
		currency: "USD",
		method: "Bank transfer",
		reference: "Full payment"
	},
	{
		id: "pay-36",
		invoiceId: "inv-36",
		date: "2023-12-26",
		amount: 100,
		currency: "USD",
		method: "KHQR",
		reference: "Full payment"
	},
	{
		id: "pay-37",
		invoiceId: "inv-37",
		date: "2024-03-03",
		amount: 80,
		currency: "USD",
		method: "KHQR",
		reference: "Full payment"
	},
	{
		id: "pay-38",
		invoiceId: "inv-38",
		date: "2024-03-04",
		amount: 240.9,
		currency: "USD",
		method: "Bank transfer",
		reference: "Full payment"
	},
	{
		id: "pay-39",
		invoiceId: "inv-39",
		date: "2024-03-09",
		amount: 50,
		currency: "USD",
		method: "KHQR",
		reference: "Full payment"
	},
	{
		id: "pay-40",
		invoiceId: "inv-40",
		date: "2024-03-09",
		amount: 100,
		currency: "USD",
		method: "KHQR",
		reference: "Full payment"
	},
	{
		id: "pay-41",
		invoiceId: "inv-41",
		date: "2024-04-18",
		amount: 70,
		currency: "USD",
		method: "KHQR",
		reference: "Full payment"
	},
	{
		id: "pay-42",
		invoiceId: "inv-42",
		date: "2024-04-18",
		amount: 25,
		currency: "USD",
		method: "KHQR",
		reference: "Full payment"
	},
	{
		id: "pay-43",
		invoiceId: "inv-43",
		date: "2024-05-09",
		amount: 100,
		currency: "USD",
		method: "KHQR",
		reference: "Full payment"
	},
	{
		id: "pay-44",
		invoiceId: "inv-44",
		date: "2024-05-10",
		amount: 70,
		currency: "USD",
		method: "KHQR",
		reference: "Full payment"
	},
	{
		id: "pay-45",
		invoiceId: "inv-45",
		date: "2024-05-12",
		amount: 35,
		currency: "USD",
		method: "KHQR",
		reference: "Full payment"
	},
	{
		id: "pay-46",
		invoiceId: "inv-46",
		date: "2024-05-18",
		amount: 250,
		currency: "USD",
		method: "Bank transfer",
		reference: "Full payment"
	},
	{
		id: "pay-47",
		invoiceId: "inv-47",
		date: "2024-05-25",
		amount: 60,
		currency: "USD",
		method: "KHQR",
		reference: "Full payment"
	},
	{
		id: "pay-48",
		invoiceId: "inv-48",
		date: "2024-05-28",
		amount: 400,
		currency: "USD",
		method: "Bank transfer",
		reference: "Full payment"
	},
	{
		id: "pay-49",
		invoiceId: "inv-49",
		date: "2024-12-02",
		amount: 350,
		currency: "USD",
		method: "Bank transfer",
		reference: "Full payment"
	},
	{
		id: "pay-50",
		invoiceId: "inv-50",
		date: "2024-05-29",
		amount: 250,
		currency: "USD",
		method: "Bank transfer",
		reference: "Full payment"
	},
	{
		id: "pay-51",
		invoiceId: "inv-51",
		date: "2024-06-21",
		amount: 50,
		currency: "USD",
		method: "KHQR",
		reference: "Full payment"
	},
	{
		id: "pay-52",
		invoiceId: "inv-52",
		date: "2024-07-26",
		amount: 100,
		currency: "USD",
		method: "Bank transfer",
		reference: "Deposit"
	},
	{
		id: "pay-53",
		invoiceId: "inv-53",
		date: "2024-08-08",
		amount: 176,
		currency: "USD",
		method: "Bank transfer",
		reference: "Full payment"
	},
	{
		id: "pay-54",
		invoiceId: "inv-54",
		date: "2024-08-16",
		amount: 50,
		currency: "USD",
		method: "KHQR",
		reference: "Full payment"
	},
	{
		id: "pay-55",
		invoiceId: "inv-55",
		date: "2024-08-26",
		amount: 35,
		currency: "USD",
		method: "KHQR",
		reference: "Full payment"
	},
	{
		id: "pay-56",
		invoiceId: "inv-56",
		date: "2024-09-27",
		amount: 30,
		currency: "USD",
		method: "KHQR",
		reference: "Full payment"
	},
	{
		id: "pay-57",
		invoiceId: "inv-57",
		date: "2024-09-29",
		amount: 120,
		currency: "USD",
		method: "KHQR",
		reference: "Full payment"
	},
	{
		id: "pay-58",
		invoiceId: "inv-58",
		date: "2024-10-03",
		amount: 100,
		currency: "USD",
		method: "KHQR",
		reference: "Full payment"
	},
	{
		id: "pay-59",
		invoiceId: "inv-59",
		date: "2024-10-07",
		amount: 65,
		currency: "USD",
		method: "Bank transfer",
		reference: "Deposit"
	},
	{
		id: "pay-60",
		invoiceId: "inv-60",
		date: "2024-10-09",
		amount: 130,
		currency: "USD",
		method: "KHQR",
		reference: "Full payment"
	},
	{
		id: "pay-61",
		invoiceId: "inv-61",
		date: "2024-10-16",
		amount: 150,
		currency: "USD",
		method: "Bank transfer",
		reference: "Deposit"
	},
	{
		id: "pay-63",
		invoiceId: "inv-63",
		date: "2024-10-26",
		amount: 100,
		currency: "USD",
		method: "KHQR",
		reference: "Full payment"
	},
	{
		id: "pay-64",
		invoiceId: "inv-64",
		date: "2024-10-28",
		amount: 20,
		currency: "USD",
		method: "KHQR",
		reference: "Full payment"
	},
	{
		id: "pay-65",
		invoiceId: "inv-65",
		date: "2024-12-03",
		amount: 300,
		currency: "USD",
		method: "Bank transfer",
		reference: "Full payment"
	},
	{
		id: "pay-67",
		invoiceId: "inv-67",
		date: "2024-12-10",
		amount: 140,
		currency: "USD",
		method: "KHQR",
		reference: "Full payment"
	},
	{
		id: "pay-69",
		invoiceId: "inv-69",
		date: "2025-01-21",
		amount: 350,
		currency: "USD",
		method: "Bank transfer",
		reference: "Full payment"
	},
	{
		id: "pay-70",
		invoiceId: "inv-70",
		date: "2025-01-22",
		amount: 90,
		currency: "USD",
		method: "KHQR",
		reference: "Full payment"
	},
	{
		id: "pay-71",
		invoiceId: "inv-71",
		date: "2025-01-22",
		amount: 90,
		currency: "USD",
		method: "KHQR",
		reference: "Full payment"
	},
	{
		id: "pay-72",
		invoiceId: "inv-72",
		date: "2025-03-09",
		amount: 25,
		currency: "USD",
		method: "KHQR",
		reference: "Full payment"
	},
	{
		id: "pay-73",
		invoiceId: "inv-73",
		date: "2025-03-16",
		amount: 100,
		currency: "USD",
		method: "KHQR",
		reference: "Full payment"
	},
	{
		id: "pay-74",
		invoiceId: "inv-74",
		date: "2025-03-16",
		amount: 100,
		currency: "USD",
		method: "KHQR",
		reference: "Full payment"
	},
	{
		id: "pay-75",
		invoiceId: "inv-75",
		date: "2025-03-21",
		amount: 96,
		currency: "USD",
		method: "KHQR",
		reference: "Full payment"
	},
	{
		id: "pay-76",
		invoiceId: "inv-76",
		date: "2025-03-16",
		amount: 150,
		currency: "USD",
		method: "Bank transfer",
		reference: "Full payment"
	},
	{
		id: "pay-77",
		invoiceId: "inv-77",
		date: "2025-03-21",
		amount: 350,
		currency: "USD",
		method: "Bank transfer",
		reference: "Full payment"
	},
	{
		id: "pay-78",
		invoiceId: "inv-78",
		date: "2025-03-21",
		amount: 100,
		currency: "USD",
		method: "KHQR",
		reference: "Full payment"
	},
	{
		id: "pay-79",
		invoiceId: "inv-79",
		date: "2025-05-26",
		amount: 80,
		currency: "USD",
		method: "KHQR",
		reference: "Full payment"
	},
	{
		id: "pay-80",
		invoiceId: "inv-80",
		date: "2025-05-28",
		amount: 100,
		currency: "USD",
		method: "KHQR",
		reference: "Full payment"
	},
	{
		id: "pay-81",
		invoiceId: "inv-81",
		date: "2025-05-26",
		amount: 350,
		currency: "USD",
		method: "Bank transfer",
		reference: "Deposit"
	},
	{
		id: "pay-82",
		invoiceId: "inv-82",
		date: "2025-06-12",
		amount: 60,
		currency: "USD",
		method: "KHQR",
		reference: "Full payment"
	},
	{
		id: "pay-83",
		invoiceId: "inv-83",
		date: "2025-06-17",
		amount: 100,
		currency: "USD",
		method: "KHQR",
		reference: "Full payment"
	},
	{
		id: "pay-84",
		invoiceId: "inv-84",
		date: "2025-06-27",
		amount: 90,
		currency: "USD",
		method: "KHQR",
		reference: "Full payment"
	},
	{
		id: "pay-85",
		invoiceId: "inv-85",
		date: "2025-07-08",
		amount: 20,
		currency: "USD",
		method: "KHQR",
		reference: "Full payment"
	},
	{
		id: "pay-86",
		invoiceId: "inv-86",
		date: "2025-07-08",
		amount: 20,
		currency: "USD",
		method: "KHQR",
		reference: "Full payment"
	},
	{
		id: "pay-87",
		invoiceId: "inv-87",
		date: "2025-07-08",
		amount: 20,
		currency: "USD",
		method: "KHQR",
		reference: "Full payment"
	},
	{
		id: "pay-88",
		invoiceId: "inv-88",
		date: "2025-07-31",
		amount: 65,
		currency: "USD",
		method: "KHQR",
		reference: "Full payment"
	},
	{
		id: "pay-89",
		invoiceId: "inv-89",
		date: "2025-08-12",
		amount: 50,
		currency: "USD",
		method: "KHQR",
		reference: "Full payment"
	},
	{
		id: "pay-91",
		invoiceId: "inv-91",
		date: "2025-08-21",
		amount: 50,
		currency: "USD",
		method: "KHQR",
		reference: "Full payment"
	},
	{
		id: "pay-92",
		invoiceId: "inv-92",
		date: "2025-08-30",
		amount: 50,
		currency: "USD",
		method: "KHQR",
		reference: "Full payment"
	},
	{
		id: "pay-93",
		invoiceId: "inv-93",
		date: "2025-08-22",
		amount: 15,
		currency: "USD",
		method: "KHQR",
		reference: "Full payment"
	},
	{
		id: "pay-94",
		invoiceId: "inv-94",
		date: "2025-08-26",
		amount: 100,
		currency: "USD",
		method: "KHQR",
		reference: "Full payment"
	},
	{
		id: "pay-95",
		invoiceId: "inv-95",
		date: "2025-09-08",
		amount: 150,
		currency: "USD",
		method: "Bank transfer",
		reference: "Full payment"
	},
	{
		id: "pay-96",
		invoiceId: "inv-96",
		date: "2025-09-11",
		amount: 25,
		currency: "USD",
		method: "KHQR",
		reference: "Full payment"
	},
	{
		id: "pay-97",
		invoiceId: "inv-97",
		date: "2025-09-12",
		amount: 25,
		currency: "USD",
		method: "KHQR",
		reference: "Full payment"
	},
	{
		id: "pay-98",
		invoiceId: "inv-98",
		date: "2025-09-17",
		amount: 100,
		currency: "USD",
		method: "KHQR",
		reference: "Full payment"
	},
	{
		id: "pay-99",
		invoiceId: "inv-99",
		date: "2025-10-03",
		amount: 100,
		currency: "USD",
		method: "KHQR",
		reference: "Full payment"
	},
	{
		id: "pay-101",
		invoiceId: "inv-101",
		date: "2025-11-21",
		amount: 500,
		currency: "USD",
		method: "Bank transfer",
		reference: "Deposit"
	}
];
function buildSampleExpenses(m) {
	return [...[
		{
			id: "e-st-01",
			date: m(0, 3),
			projectId: "",
			category: "Software and subscriptions",
			vendor: "Adobe",
			description: "Creative Cloud All Apps",
			amount: 59.99,
			currency: "USD",
			receipt: "",
			account: "Studio"
		},
		{
			id: "e-st-02",
			date: m(0, 6),
			projectId: "",
			category: "Software and subscriptions",
			vendor: "Figma",
			description: "Figma Professional seat",
			amount: 15,
			currency: "USD",
			receipt: "",
			account: "Studio"
		},
		{
			id: "e-st-03",
			date: m(0, 10),
			projectId: "",
			category: "Office and utilities",
			vendor: "Sinet / Ezecom",
			description: "Studio fibre internet",
			amount: 28,
			currency: "USD",
			receipt: "",
			account: "Studio"
		},
		{
			id: "e-st-04",
			date: m(1, 3),
			projectId: "",
			category: "Software and subscriptions",
			vendor: "Adobe",
			description: "Creative Cloud All Apps",
			amount: 59.99,
			currency: "USD",
			receipt: "",
			account: "Studio"
		},
		{
			id: "e-st-05",
			date: m(1, 14),
			projectId: "pj-103",
			category: "Printing and production",
			vendor: "Phnom Penh Print Lab",
			description: "BioDia packaging mockups & proofs",
			amount: 38,
			currency: "USD",
			receipt: "",
			account: "Studio"
		},
		{
			id: "e-st-06",
			date: m(1, 18),
			projectId: "",
			category: "Office and utilities",
			vendor: "Sinet / Ezecom",
			description: "Studio fibre internet",
			amount: 28,
			currency: "USD",
			receipt: "",
			account: "Studio"
		},
		{
			id: "e-st-07",
			date: m(2, 3),
			projectId: "",
			category: "Software and subscriptions",
			vendor: "Adobe",
			description: "Creative Cloud All Apps",
			amount: 59.99,
			currency: "USD",
			receipt: "",
			account: "Studio"
		},
		{
			id: "e-st-08",
			date: m(2, 11),
			projectId: "",
			category: "Fonts and licenses",
			vendor: "Pangram Pangram",
			description: "Commercial display typeface license",
			amount: 45,
			currency: "USD",
			receipt: "",
			account: "Studio"
		},
		{
			id: "e-st-09",
			date: m(2, 20),
			projectId: "",
			category: "Office and utilities",
			vendor: "EDC & Water",
			description: "Studio power & utilities",
			amount: 42,
			currency: "USD",
			receipt: "",
			account: "Studio"
		},
		{
			id: "e-st-10",
			date: m(3, 3),
			projectId: "",
			category: "Software and subscriptions",
			vendor: "Adobe",
			description: "Creative Cloud & Figma",
			amount: 74.99,
			currency: "USD",
			receipt: "",
			account: "Studio"
		},
		{
			id: "e-st-11",
			date: m(3, 16),
			projectId: "",
			category: "Marketing",
			vendor: "Framer",
			description: "rothvan.framer.ai portfolio hosting",
			amount: 20,
			currency: "USD",
			receipt: "",
			account: "Studio"
		},
		{
			id: "e-st-12",
			date: m(4, 3),
			projectId: "",
			category: "Software and subscriptions",
			vendor: "Adobe",
			description: "Creative Cloud & workspace tools",
			amount: 74.99,
			currency: "USD",
			receipt: "",
			account: "Studio"
		},
		{
			id: "e-st-13",
			date: m(4, 21),
			projectId: "",
			category: "Equipment",
			vendor: "Anker / Phnom Penh Tech",
			description: "USB-C hub & calibration accessories",
			amount: 68,
			currency: "USD",
			receipt: "",
			account: "Studio"
		},
		{
			id: "e-st-14",
			date: m(5, 3),
			projectId: "",
			category: "Software and subscriptions",
			vendor: "Adobe",
			description: "Creative Cloud & Figma",
			amount: 74.99,
			currency: "USD",
			receipt: "",
			account: "Studio"
		},
		{
			id: "e-st-15",
			date: m(5, 19),
			projectId: "",
			category: "Office and utilities",
			vendor: "Sinet / Ezecom",
			description: "Studio fibre internet",
			amount: 28,
			currency: "USD",
			receipt: "",
			account: "Studio"
		},
		{
			id: "e-st-16",
			date: m(7, 5),
			projectId: "",
			category: "Software and subscriptions",
			vendor: "Adobe + Figma",
			description: "Design suite subscription",
			amount: 74.99,
			currency: "USD",
			receipt: "",
			account: "Studio"
		},
		{
			id: "e-st-17",
			date: m(9, 8),
			projectId: "",
			category: "Freelancers",
			vendor: "Khmer 3D Motion",
			description: "Packaging mockup render support",
			amount: 110,
			currency: "USD",
			receipt: "",
			account: "Studio"
		},
		{
			id: "e-st-18",
			date: m(11, 5),
			projectId: "",
			category: "Software and subscriptions",
			vendor: "Adobe + Framer",
			description: "Design tools & portfolio annual add-on",
			amount: 95,
			currency: "USD",
			receipt: "",
			account: "Studio"
		},
		{
			id: "e-st-h1",
			date: "2024-05-12",
			projectId: "",
			category: "Software and subscriptions",
			vendor: "Adobe",
			description: "Creative Cloud annual tools",
			amount: 180,
			currency: "USD",
			receipt: "",
			account: "Studio"
		},
		{
			id: "e-st-h2",
			date: "2024-10-18",
			projectId: "",
			category: "Fonts and licenses",
			vendor: "Khmer Type Foundry",
			description: "Display & print font pack",
			amount: 85,
			currency: "USD",
			receipt: "",
			account: "Studio"
		},
		{
			id: "e-st-h3",
			date: "2025-03-14",
			projectId: "",
			category: "Printing and production",
			vendor: "Phnom Penh Print Lab",
			description: "Packaging & color proofing runs",
			amount: 140,
			currency: "USD",
			receipt: "",
			account: "Studio"
		},
		{
			id: "e-st-h4",
			date: "2025-08-22",
			projectId: "",
			category: "Equipment",
			vendor: "Apple Phnom Penh",
			description: "External SSD & display stand",
			amount: 210,
			currency: "USD",
			receipt: "",
			account: "Studio"
		},
		{
			id: "e-st-h5",
			date: "2025-10-15",
			projectId: "",
			category: "Software and subscriptions",
			vendor: "Adobe + Figma",
			description: "Studio design subscriptions",
			amount: 150,
			currency: "USD",
			receipt: "",
			account: "Studio"
		}
	], ...buildPersonalExpenses()];
}
var rothvanGoals = [
	{
		id: "g-st-1",
		name: "Annual Studio Cash Target",
		kind: "cash",
		target: 15e3,
		current: 0,
		account: "Studio"
	},
	{
		id: "g-st-2",
		name: "Active B2B & Brand Clients",
		kind: "clients",
		target: 40,
		current: 0,
		account: "Studio"
	},
	{
		id: "g-st-3",
		name: "Studio Upgrade & Camera Fund",
		kind: "manual",
		target: 2500,
		current: 950,
		account: "Studio"
	},
	{
		id: "g-ps-1",
		name: "Personal Emergency Reserve",
		kind: "manual",
		target: 6e3,
		current: 2400,
		account: "Personal"
	},
	{
		id: "g-ps-2",
		name: "Family & Travel Savings",
		kind: "manual",
		target: 2e3,
		current: 750,
		account: "Personal"
	}
];
//#endregion
//#region src/lib/store.ts
var PROJECT_STATUSES = [
	"Inquiry",
	"Quoted",
	"In production",
	"Delivered",
	"Closed",
	"On hold",
	"Lost"
];
var CLIENT_TYPES = [
	"Owner-operated",
	"Enterprise",
	"Startup",
	"SME",
	"NGO"
];
var CLIENT_STATUSES = [
	"Lead",
	"Active",
	"Past",
	"Dormant"
];
var CLIENT_SOURCES = [
	"Referral",
	"Social media",
	"Website",
	"Returning client",
	"Other"
];
var PILLARS = [
	"Branding Design",
	"Creative Assets",
	"Web & App Design",
	"Marketing Collateral",
	"Spatial Design",
	"Product Packaging"
];
var PRICING_UNITS = [
	"Fixed fee",
	"Per item",
	"Per hour",
	"Per sqm"
];
var PAY_METHODS = [
	"Bank transfer",
	"KHQR",
	"Wing",
	"Cash",
	"Other"
];
var EXPENSE_CATEGORIES = [
	"Software and subscriptions",
	"Fonts and licenses",
	"Printing and production",
	"Fabrication and vendors",
	"Freelancers",
	"Transport",
	"Marketing",
	"Equipment",
	"Office and utilities",
	"Other"
];
var PERSONAL_CATEGORIES = [
	"Food",
	"Transportation",
	"Kid",
	"Personal Spending",
	"Utilities",
	"Medical & Healthcare",
	"Saving & Investing",
	"Prius 2012",
	"Other"
];
var DEFAULT_PERSONAL_LIMITS = {
	Food: 250,
	Transportation: 120,
	Kid: 150,
	"Personal Spending": 200,
	Utilities: 80,
	"Medical & Healthcare": 100,
	"Saving & Investing": 300,
	"Prius 2012": 200,
	Other: 50
};
var DEFAULT_STUDIO_LIMITS = {
	"Software and subscriptions": 100,
	"Fonts and licenses": 80,
	"Printing and production": 150,
	"Fabrication and vendors": 250,
	Freelancers: 200,
	Transport: 60,
	Marketing: 80,
	Equipment: 200,
	"Office and utilities": 100,
	Other: 100
};
var DOCUMENT_TYPES = [
	"Invoice",
	"Quotation",
	"Agreement",
	"Delivery note"
];
var uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
var today = () => (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
var addDays = (d, n) => {
	const x = /* @__PURE__ */ new Date(d + "T00:00:00Z");
	x.setUTCDate(x.getUTCDate() + n);
	return x.toISOString().slice(0, 10);
};
var defaultSettings = {
	businessName: "RothVan Design",
	logo: "",
	phones: "",
	email: "rothvandesign@gmail.com",
	website: "rothvan.framer.ai",
	address: "Kampuchea Krom Blvd (St. 128), Khan 7 Makara, Phnom Penh",
	abaName: "Vannaroth Neou",
	abaNumber: "",
	khqr: "",
	signature: "",
	signatoryName: "Neou Vannaroth",
	signatoryTitle: "Design Manager, RothVan Design",
	dueDays: 28,
	khrRate: 4100,
	ownerName: "Roth",
	designTerms: [
		{
			label: "Project Scope",
			text: "All design work will be based on the scope agreed upon in the quotation or proposal. Any additional work beyond the original scope may incur extra charges and timeline adjustments."
		},
		{
			label: "Client Responsibilities",
			text: "The client agrees to provide clear feedback, timely approvals, and all required content. Delays in communication may result in an extended timeline."
		},
		{
			label: "Cancellation & Refunds",
			text: "Any cancellation of a job after signing of this quotation, the client agrees to compensate 50% of the total price quoted."
		},
		{
			label: "Liability",
			text: "RothVan Design is not liable for printing, third-party issues, or any damages arising from the use of the final design beyond its intended scope."
		}
	],
	paymentTerms: [
		"Payment 50% before starting design.",
		"Payment 50% after the final product is received.",
		"No refund if the client cancels."
	],
	extraRates: [
		{
			label: "Additional Design Revision",
			detail: "After included revision rounds are used",
			price: "$25.00 / round"
		},
		{
			label: "Urgent / Rush Project Fee",
			detail: "24 to 48 hour turnaround requests",
			price: "+30% of total cost"
		},
		{
			label: "Additional Concept Design",
			detail: "Beyond original concept options provided",
			price: "$50.00 / concept"
		},
		{
			label: "File Format Conversion / Resizing",
			detail: "Custom dimensions or print-ready",
			price: "$10.00 / file set"
		}
	],
	thankYou: "Thank you for choosing RothVan Design. We're proud to support your brand with design excellence."
};
function seed() {
	const m = (n, day = 10) => {
		const now = /* @__PURE__ */ new Date();
		return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - n, day)).toISOString().slice(0, 10);
	};
	return {
		clients: rothvanClients.map((c) => ({ ...c })),
		services: rothvanServices.map((s) => ({ ...s })),
		projects: rothvanProjects.map((p) => ({ ...p })),
		invoices: rothvanInvoices.map((i) => ({
			...i,
			items: i.items.map((it) => ({ ...it })),
			images: i.images.map((im) => ({ ...im }))
		})),
		payments: rothvanPayments.map((p) => ({ ...p })),
		expenses: buildSampleExpenses(m),
		goals: rothvanGoals.map((g) => ({ ...g })),
		settings: { ...defaultSettings },
		categoryLimits: {}
	};
}
var KEY = "rothvan-studio-v3";
var PREV_KEY = "rothvan-studio-v2";
var LEGACY_KEY = "rothvan-studio-v1";
var state = seed();
var loaded = false;
var listeners = /* @__PURE__ */ new Set();
function load() {
	if (loaded || typeof window === "undefined") return;
	loaded = true;
	try {
		const raw = localStorage.getItem(KEY);
		if (raw) {
			const p = JSON.parse(raw);
			state = {
				...seed(),
				...p,
				settings: {
					...defaultSettings,
					...p.settings
				},
				categoryLimits: { ...p.categoryLimits ?? {} }
			};
			return;
		}
		const prevRaw = localStorage.getItem(PREV_KEY) ?? localStorage.getItem(LEGACY_KEY);
		if (prevRaw) {
			const lp = JSON.parse(prevRaw);
			if (lp?.settings) state = {
				...seed(),
				settings: {
					...defaultSettings,
					...lp.settings
				}
			};
		}
	} catch {}
}
function getDB() {
	load();
	return state;
}
function setDB(fn) {
	load();
	state = fn(state);
	try {
		localStorage.setItem(KEY, JSON.stringify(state));
	} catch {
		alert("Storage is full. Remove some images to keep saving.");
	}
	listeners.forEach((l) => l());
}
function resetDB() {
	setDB(() => seed());
}
function useDB(sel) {
	return (0, import_react.useSyncExternalStore)((l) => {
		listeners.add(l);
		return () => listeners.delete(l);
	}, () => sel(getDB()), () => sel(state));
}
function nextInvoiceNo(issue, existing, kind = "Invoice") {
	const prefix = {
		Invoice: "RVIN-",
		Quotation: "RVQT-",
		Agreement: "RVAG-",
		"Delivery note": "RVDN-"
	}[kind] + issue.slice(2).replace(/-/g, "");
	const n = Math.max(0, ...existing.filter((i) => i.no.startsWith(prefix)).map((i) => Number(i.no.slice(prefix.length)) || 0)) + 1;
	return prefix + String(n).padStart(2, "0");
}
function invoiceTotals(inv) {
	const subtotal = inv.items.reduce((s, it) => s + Math.max(0, Number(it.qty) || 0) * Math.max(0, Number(it.price) || 0), 0);
	const discountAmt = subtotal * (Math.min(100, Math.max(0, Number(inv.discount) || 0)) / 100);
	return {
		subtotal,
		discountAmt,
		total: subtotal - discountAmt
	};
}
var toUSD = (amount, cur, rate) => cur === "KHR" ? amount / (rate || 4100) : amount;
function invoicePaid(inv, payments, rate) {
	return payments.filter((p) => p.invoiceId === inv.id).reduce((s, p) => s + (p.currency === inv.currency ? p.amount : inv.currency === "USD" ? toUSD(p.amount, p.currency, rate) : p.amount * rate), 0);
}
var documentKind = (inv) => inv.kind ?? "Invoice";
var isInvoice = (inv) => documentKind(inv) === "Invoice";
function needsFollowUp(inv, now = today()) {
	return documentKind(inv) === "Quotation" && inv.sent && (!inv.response || inv.response === "Pending") && Boolean(inv.followUp && inv.followUp <= now);
}
function convertDocument(source, kind, existing, issue = today(), dueDays = 28) {
	return {
		...source,
		id: uid(),
		kind,
		sourceId: source.id,
		no: nextInvoiceNo(issue, existing, kind),
		issue,
		due: addDays(issue, dueDays),
		sent: false,
		response: "Pending",
		followUp: "",
		followUps: [],
		confirmedBy: "",
		confirmedOn: "",
		clientSignature: "",
		items: source.items.map((it) => ({
			...it,
			id: uid()
		})),
		showSchedule: kind !== "Delivery note" && source.showSchedule
	};
}
function invoiceStatus(inv, paid, now = today()) {
	if (!isInvoice(inv)) {
		if (inv.response === "Declined") return "Declined";
		if (inv.response === "Accepted") return documentKind(inv) === "Agreement" ? "Signed" : documentKind(inv) === "Delivery note" ? "Received" : "Accepted";
		if (!inv.sent) return "Draft";
		if (documentKind(inv) === "Quotation" && inv.due && inv.due < now) return "Expired";
		return "Sent";
	}
	const { total } = invoiceTotals(inv);
	if (total > 0 && paid >= total - .005) return "Paid";
	if (!inv.sent && paid <= 0) return "Draft";
	if (inv.due && inv.due < now) return "Overdue";
	if (paid > 0) return "Partial";
	return "Sent";
}
function invoiceView(inv, db) {
	const t = invoiceTotals(inv);
	const paid = isInvoice(inv) ? invoicePaid(inv, db.payments, db.settings.khrRate) : 0;
	const status = invoiceStatus(inv, paid);
	const r = db.settings.khrRate;
	return {
		...t,
		paid,
		balance: isInvoice(inv) ? Math.max(0, t.total - paid) : 0,
		status,
		totalUSD: isInvoice(inv) ? toUSD(t.total, inv.currency, r) : 0,
		balanceUSD: isInvoice(inv) ? toUSD(Math.max(0, t.total - paid), inv.currency, r) : 0
	};
}
var expenseAccount = (expense) => expense.account ?? "Studio";
var goalAccount = (goal) => goal.account ?? "Studio";
var expenseCategoriesFor = (account) => account === "Personal" ? PERSONAL_CATEGORIES : EXPENSE_CATEGORIES;
function cashReceived(db, period) {
	const ids = new Set(db.invoices.filter(isInvoice).map((i) => i.id));
	return db.payments.filter((p) => ids.has(p.invoiceId) && p.date.startsWith(period)).reduce((s, p) => s + toUSD(p.amount, p.currency, db.settings.khrRate), 0);
}
function expenseTotal(db, account, period) {
	return db.expenses.filter((e) => expenseAccount(e) === account && e.date.startsWith(period)).reduce((s, e) => s + toUSD(e.amount, e.currency, db.settings.khrRate), 0);
}
function categoryTotals(db, account, period) {
	const map = /* @__PURE__ */ new Map();
	for (const e of db.expenses) {
		if (expenseAccount(e) !== account || period && !e.date.startsWith(period)) continue;
		const prev = map.get(e.category) ?? {
			category: e.category || "Other",
			totalUSD: 0,
			count: 0
		};
		prev.totalUSD += toUSD(e.amount, e.currency, db.settings.khrRate);
		prev.count += 1;
		map.set(e.category, prev);
	}
	return Array.from(map.values()).sort((a, b) => b.totalUSD - a.totalUSD);
}
function categoryLimit(db, account, category) {
	const key = `${account}:${category}`;
	const custom = db.categoryLimits?.[key];
	if (typeof custom === "number" && Number.isFinite(custom) && custom >= 0) return custom;
	return (account === "Personal" ? DEFAULT_PERSONAL_LIMITS : DEFAULT_STUDIO_LIMITS)[category] ?? 100;
}
function setCategoryLimit(account, category, limit) {
	const clean = Math.max(0, Math.round(limit * 100) / 100);
	setDB((d) => ({
		...d,
		categoryLimits: {
			...d.categoryLimits ?? {},
			[`${account}:${category}`]: clean
		}
	}));
}
function previousMonth(ym) {
	const [y, m] = ym.split("-").map(Number);
	if (!y || !m) return ym;
	return new Date(Date.UTC(y, m - 2, 1)).toISOString().slice(0, 7);
}
function trailingMonths(n) {
	const out = [];
	const now = /* @__PURE__ */ new Date();
	const baseY = now.getUTCFullYear();
	const baseM = now.getUTCMonth();
	for (let i = n - 1; i >= 0; i--) {
		const d = new Date(Date.UTC(baseY, baseM - i, 1));
		out.push(d.toISOString().slice(0, 7));
	}
	return out;
}
function cashFlowSeries(db, range) {
	const r = db.settings.khrRate;
	const invIds = new Set(db.invoices.filter(isInvoice).map((i) => i.id));
	let months;
	if (range === "all") {
		const first = [...db.payments.filter((p) => invIds.has(p.invoiceId)).map((p) => p.date), ...db.expenses.map((e) => e.date)].filter((d) => /^\d{4}-\d{2}/.test(d)).sort()[0]?.slice(0, 7) ?? today().slice(0, 7);
		const last = today().slice(0, 7);
		const [fy, fm] = first.split("-").map(Number);
		const [ly, lm] = last.split("-").map(Number);
		months = [];
		if (fy && fm && ly && lm) {
			let y = fy;
			let m = fm;
			while (y < ly || y === ly && m <= lm) {
				months.push(`${y}-${String(m).padStart(2, "0")}`);
				m += 1;
				if (m > 12) {
					m = 1;
					y += 1;
				}
			}
		}
	} else months = trailingMonths(range === "6m" ? 6 : 12);
	const showYear = range === "all";
	return months.map((m) => {
		const inn = db.payments.filter((p) => invIds.has(p.invoiceId) && p.date.startsWith(m)).reduce((s, p) => s + toUSD(p.amount, p.currency, r), 0);
		const out = db.expenses.filter((e) => expenseAccount(e) === "Studio" && e.date.startsWith(m)).reduce((s, e) => s + toUSD(e.amount, e.currency, r), 0);
		const personalOut = db.expenses.filter((e) => expenseAccount(e) === "Personal" && e.date.startsWith(m)).reduce((s, e) => s + toUSD(e.amount, e.currency, r), 0);
		return {
			m,
			label: (/* @__PURE__ */ new Date(m + "-01T00:00:00Z")).toLocaleDateString("en-US", {
				month: "short",
				...showYear ? { year: "2-digit" } : {},
				timeZone: "UTC"
			}),
			inn,
			out,
			personalOut,
			net: inn - out,
			combinedNet: inn - out - personalOut
		};
	});
}
function serviceItem(service, currency, rate) {
	return {
		id: uid(),
		serviceId: service.id,
		description: service.name,
		scope: service.scope,
		timeline: service.timeline,
		qty: 1,
		price: currency === "KHR" ? service.rate * rate : service.rate
	};
}
function parseTimelineDays(timeline, fallback = 14) {
	const m = timeline.match(/(\d+)\s*(?:-\s*(\d+))?\s*(day|week|month)/i);
	if (!m) return fallback;
	const n = Number(m[2] ?? m[1]) || fallback;
	const unit = (m[3] ?? "day").toLowerCase();
	return unit.startsWith("month") ? n * 30 : unit.startsWith("week") ? n * 7 : n;
}
function estimateDue(inv, start) {
	const days = inv.items.reduce((mx, it) => Math.max(mx, it.timeline ? parseTimelineDays(it.timeline, 0) : 0), 0);
	if (days > 0) return addDays(start, days);
	return inv.due && inv.due >= start ? inv.due : addDays(start, 14);
}
/** Save a document and its milestone together; drafts do not start production. */
function saveDocument(db, document) {
	const inv = { ...document };
	let projects = [...db.projects];
	const existingProject = projects.find((p) => p.id === inv.projectId);
	if (existingProject && existingProject.clientId !== inv.clientId) throw new Error("Choose a project belonging to this client.");
	if (!existingProject && inv.projectId) inv.projectId = "";
	const kind = documentKind(inv);
	const totalUSD = toUSD(invoiceTotals(inv).total, inv.currency, db.settings.khrRate);
	const itemServiceId = inv.items.find((i) => i.serviceId)?.serviceId ?? "";
	if (!inv.projectId && (inv.sent || inv.response === "Accepted")) {
		const code = "RVD-" + (Math.max(100, ...projects.map((p) => Number(p.code.replace("RVD-", "")) || 0)) + 1);
		const project = {
			id: uid(),
			code,
			clientId: inv.clientId,
			serviceId: itemServiceId,
			name: inv.items[0]?.description || "Design project",
			status: "Inquiry",
			start: "",
			due: "",
			delivered: "",
			quote: totalUSD
		};
		projects.push(project);
		inv.projectId = project.id;
	}
	projects = projects.map((p) => {
		if (p.id !== inv.projectId) return p;
		const synced = {
			...p,
			serviceId: p.serviceId || itemServiceId,
			quote: totalUSD > 0 && (kind === "Quotation" || kind === "Invoice" || !p.quote) && !["Delivered", "Closed"].includes(p.status) ? totalUSD : p.quote
		};
		if (kind === "Quotation" && (inv.sent || inv.response === "Accepted") && synced.status === "Inquiry") return {
			...synced,
			status: "Quoted",
			quote: totalUSD || synced.quote
		};
		if (kind === "Agreement" && inv.response === "Accepted" || kind === "Invoice" && inv.sent) {
			if (["Inquiry", "Quoted"].includes(synced.status)) {
				const start = synced.start || inv.confirmedOn || inv.issue;
				return {
					...synced,
					status: "In production",
					start,
					due: synced.due || estimateDue(inv, start)
				};
			}
		}
		if (kind === "Delivery note" && (inv.sent || inv.response === "Accepted")) {
			const delivered = inv.confirmedOn || inv.due || inv.issue;
			return {
				...synced,
				status: "Delivered",
				start: synced.start || inv.issue,
				due: synced.due || delivered,
				delivered
			};
		}
		return synced;
	});
	const invoices = db.invoices.some((i) => i.id === inv.id) ? db.invoices.map((i) => i.id === inv.id ? inv : i) : [...db.invoices, inv];
	const clients = inv.response === "Accepted" || kind === "Invoice" && inv.sent ? db.clients.map((c) => c.id === inv.clientId && c.status === "Lead" ? {
		...c,
		status: "Active"
	} : c) : db.clients;
	return reconcileProjects({
		...db,
		invoices,
		projects,
		clients
	});
}
function reconcileProjects(db) {
	return {
		...db,
		projects: db.projects.map((p) => {
			const bills = db.invoices.filter((i) => isInvoice(i) && i.projectId === p.id);
			const paid = bills.length > 0 && bills.every((i) => invoiceTotals(i).total > 0 && invoiceView(i, db).balance <= .005);
			if (p.status === "Delivered" && paid) return {
				...p,
				status: "Closed"
			};
			if (p.status === "Closed" && p.delivered && !paid) return {
				...p,
				status: "Delivered"
			};
			if (["Inquiry", "Quoted"].includes(p.status) && bills.some((i) => invoiceView(i, db).paid > 0)) {
				const start = p.start || today();
				return {
					...p,
					status: "In production",
					start,
					due: p.due || addDays(start, 14)
				};
			}
			return p;
		})
	};
}
function recordPayment(db, payment) {
	const inv = db.invoices.find((i) => i.id === payment.invoiceId);
	if (!inv || !isInvoice(inv)) throw new Error("Payments must belong to an invoice.");
	const amount = payment.currency === inv.currency ? payment.amount : inv.currency === "USD" ? toUSD(payment.amount, payment.currency, db.settings.khrRate) : payment.amount * db.settings.khrRate;
	if (!(amount > 0) || !Number.isFinite(amount) || amount > invoiceView(inv, db).balance + .005) throw new Error("Enter a payment within the outstanding balance.");
	const invoices = db.invoices.map((i) => i.id === inv.id && !i.sent ? {
		...i,
		sent: true
	} : i);
	const clients = db.clients.map((c) => c.id === inv.clientId && c.status === "Lead" ? {
		...c,
		status: "Active"
	} : c);
	return reconcileProjects({
		...db,
		invoices,
		clients,
		payments: [...db.payments, payment]
	});
}
function deletePayment(db, paymentId) {
	return reconcileProjects({
		...db,
		payments: db.payments.filter((x) => x.id !== paymentId)
	});
}
function updateProject(db, project) {
	if (project.start && project.due && project.due < project.start) throw new Error("End date must not be before the start date.");
	const start = project.start || (project.status === "In production" ? today() : "");
	const next = {
		...project,
		start,
		due: project.due || (start && project.status === "In production" ? addDays(start, 14) : ""),
		delivered: project.delivered || (["Delivered", "Closed"].includes(project.status) ? today() : "")
	};
	return reconcileProjects({
		...db,
		projects: db.projects.some((p) => p.id === next.id) ? db.projects.map((p) => p.id === next.id ? next : p) : [...db.projects, next]
	});
}
function money(n, cur = "USD", signed = false) {
	const sign = signed ? n > 0 ? "+" : n < 0 ? "−" : "" : n < 0 ? "−" : "";
	const a = Math.abs(n);
	if (cur === "KHR") return `${sign}៛${Math.round(a).toLocaleString("en-US")}`;
	return `${sign}$${a.toLocaleString("en-US", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	})}`;
}
var longDate = (d) => d ? (/* @__PURE__ */ new Date(d + "T00:00:00")).toLocaleDateString("en-US", {
	month: "long",
	day: "numeric",
	year: "numeric"
}) : "—";
var shortDate = (d) => d ? (/* @__PURE__ */ new Date(d + "T00:00:00")).toLocaleDateString("en-US", {
	month: "short",
	day: "numeric"
}) : "—";
async function fileToDataUrl(file, max = 1200) {
	const url = URL.createObjectURL(file);
	const img = await new Promise((res, rej) => {
		const i = new Image();
		i.onload = () => res(i);
		i.onerror = rej;
		i.src = url;
	});
	const scale = Math.min(1, max / Math.max(img.width, img.height));
	const c = document.createElement("canvas");
	c.width = Math.round(img.width * scale);
	c.height = Math.round(img.height * scale);
	const ctx = c.getContext("2d");
	if (!ctx) {
		URL.revokeObjectURL(url);
		throw new Error("Image processing is unavailable.");
	}
	ctx.drawImage(img, 0, 0, c.width, c.height);
	URL.revokeObjectURL(url);
	return c.toDataURL(file.type === "image/png" ? "image/png" : "image/jpeg", .82);
}
//#endregion
//#region node_modules/clsx/dist/clsx.mjs
function r(e) {
	var t, f, n = "";
	if ("string" == typeof e || "number" == typeof e) n += e;
	else if ("object" == typeof e) if (Array.isArray(e)) {
		var o = e.length;
		for (t = 0; t < o; t++) e[t] && (f = r(e[t])) && (n && (n += " "), n += f);
	} else for (f in e) e[f] && (n && (n += " "), n += f);
	return n;
}
function clsx() {
	for (var e, t, f = 0, n = "", o = arguments.length; f < o; f++) (e = arguments[f]) && (t = r(e)) && (n && (n += " "), n += t);
	return n;
}
//#endregion
//#region node_modules/tailwind-merge/dist/bundle-mjs.mjs
/**
* Concatenates two arrays faster than the array spread operator.
*/
var concatArrays = (array1, array2) => {
	const combinedArray = new Array(array1.length + array2.length);
	for (let i = 0; i < array1.length; i++) combinedArray[i] = array1[i];
	for (let i = 0; i < array2.length; i++) combinedArray[array1.length + i] = array2[i];
	return combinedArray;
};
var createClassValidatorObject = (classGroupId, validator) => ({
	classGroupId,
	validator
});
var createClassPartObject = (nextPart = /* @__PURE__ */ new Map(), validators = null, classGroupId) => ({
	nextPart,
	validators,
	classGroupId
});
var CLASS_PART_SEPARATOR = "-";
var EMPTY_CONFLICTS = [];
var ARBITRARY_PROPERTY_PREFIX = "arbitrary..";
var createClassGroupUtils = (config) => {
	const classMap = createClassMap(config);
	const { conflictingClassGroups, conflictingClassGroupModifiers } = config;
	const getClassGroupId = (className) => {
		if (className.startsWith("[") && className.endsWith("]")) return getGroupIdForArbitraryProperty(className);
		const classParts = className.split(CLASS_PART_SEPARATOR);
		return getGroupRecursive(classParts, classParts[0] === "" && classParts.length > 1 ? 1 : 0, classMap);
	};
	const getConflictingClassGroupIds = (classGroupId, hasPostfixModifier) => {
		if (hasPostfixModifier) {
			const modifierConflicts = conflictingClassGroupModifiers[classGroupId];
			const baseConflicts = conflictingClassGroups[classGroupId];
			if (modifierConflicts) {
				if (baseConflicts) return concatArrays(baseConflicts, modifierConflicts);
				return modifierConflicts;
			}
			return baseConflicts || EMPTY_CONFLICTS;
		}
		return conflictingClassGroups[classGroupId] || EMPTY_CONFLICTS;
	};
	return {
		getClassGroupId,
		getConflictingClassGroupIds
	};
};
var getGroupRecursive = (classParts, startIndex, classPartObject) => {
	if (classParts.length - startIndex === 0) return classPartObject.classGroupId;
	const currentClassPart = classParts[startIndex];
	const nextClassPartObject = classPartObject.nextPart.get(currentClassPart);
	if (nextClassPartObject) {
		const result = getGroupRecursive(classParts, startIndex + 1, nextClassPartObject);
		if (result) return result;
	}
	const validators = classPartObject.validators;
	if (validators === null) return;
	const classRest = startIndex === 0 ? classParts.join(CLASS_PART_SEPARATOR) : classParts.slice(startIndex).join(CLASS_PART_SEPARATOR);
	const validatorsLength = validators.length;
	for (let i = 0; i < validatorsLength; i++) {
		const validatorObj = validators[i];
		if (validatorObj.validator(classRest)) return validatorObj.classGroupId;
	}
};
/**
* Get the class group ID for an arbitrary property.
*
* @param className - The class name to get the group ID for. Is expected to be string starting with `[` and ending with `]`.
*/
var getGroupIdForArbitraryProperty = (className) => className.slice(1, -1).indexOf(":") === -1 ? void 0 : (() => {
	const content = className.slice(1, -1);
	const colonIndex = content.indexOf(":");
	const property = content.slice(0, colonIndex);
	return property ? ARBITRARY_PROPERTY_PREFIX + property : void 0;
})();
/**
* Exported for testing only
*/
var createClassMap = (config) => {
	const { theme, classGroups } = config;
	return processClassGroups(classGroups, theme);
};
var processClassGroups = (classGroups, theme) => {
	const classMap = createClassPartObject();
	for (const classGroupId in classGroups) {
		const group = classGroups[classGroupId];
		processClassesRecursively(group, classMap, classGroupId, theme);
	}
	return classMap;
};
var processClassesRecursively = (classGroup, classPartObject, classGroupId, theme) => {
	const len = classGroup.length;
	for (let i = 0; i < len; i++) {
		const classDefinition = classGroup[i];
		processClassDefinition(classDefinition, classPartObject, classGroupId, theme);
	}
};
var processClassDefinition = (classDefinition, classPartObject, classGroupId, theme) => {
	if (typeof classDefinition === "string") {
		processStringDefinition(classDefinition, classPartObject, classGroupId);
		return;
	}
	if (typeof classDefinition === "function") {
		processFunctionDefinition(classDefinition, classPartObject, classGroupId, theme);
		return;
	}
	processObjectDefinition(classDefinition, classPartObject, classGroupId, theme);
};
var processStringDefinition = (classDefinition, classPartObject, classGroupId) => {
	const classPartObjectToEdit = classDefinition === "" ? classPartObject : getPart(classPartObject, classDefinition);
	classPartObjectToEdit.classGroupId = classGroupId;
};
var processFunctionDefinition = (classDefinition, classPartObject, classGroupId, theme) => {
	if (isThemeGetter(classDefinition)) {
		processClassesRecursively(classDefinition(theme), classPartObject, classGroupId, theme);
		return;
	}
	if (classPartObject.validators === null) classPartObject.validators = [];
	classPartObject.validators.push(createClassValidatorObject(classGroupId, classDefinition));
};
var processObjectDefinition = (classDefinition, classPartObject, classGroupId, theme) => {
	const entries = Object.entries(classDefinition);
	const len = entries.length;
	for (let i = 0; i < len; i++) {
		const [key, value] = entries[i];
		processClassesRecursively(value, getPart(classPartObject, key), classGroupId, theme);
	}
};
var getPart = (classPartObject, path) => {
	let current = classPartObject;
	const parts = path.split(CLASS_PART_SEPARATOR);
	const len = parts.length;
	for (let i = 0; i < len; i++) {
		const part = parts[i];
		let next = current.nextPart.get(part);
		if (!next) {
			next = createClassPartObject();
			current.nextPart.set(part, next);
		}
		current = next;
	}
	return current;
};
var isThemeGetter = (func) => "isThemeGetter" in func && func.isThemeGetter === true;
var createLruCache = (maxCacheSize) => {
	if (maxCacheSize < 1) return {
		get: () => void 0,
		set: () => {}
	};
	let cacheSize = 0;
	let cache = Object.create(null);
	let previousCache = Object.create(null);
	const update = (key, value) => {
		cache[key] = value;
		cacheSize++;
		if (cacheSize > maxCacheSize) {
			cacheSize = 0;
			previousCache = cache;
			cache = Object.create(null);
		}
	};
	return {
		get(key) {
			let value = cache[key];
			if (value !== void 0) return value;
			if ((value = previousCache[key]) !== void 0) {
				update(key, value);
				return value;
			}
		},
		set(key, value) {
			if (key in cache) cache[key] = value;
			else update(key, value);
		}
	};
};
var IMPORTANT_MODIFIER = "!";
var MODIFIER_SEPARATOR = ":";
var EMPTY_MODIFIERS = [];
var createResultObject = (modifiers, hasImportantModifier, baseClassName, maybePostfixModifierPosition, isExternal) => ({
	modifiers,
	hasImportantModifier,
	baseClassName,
	maybePostfixModifierPosition,
	isExternal
});
var createParseClassName = (config) => {
	const { prefix, experimentalParseClassName } = config;
	/**
	* Parse class name into parts.
	*
	* Inspired by `splitAtTopLevelOnly` used in Tailwind CSS
	* @see https://github.com/tailwindlabs/tailwindcss/blob/v3.2.2/src/util/splitAtTopLevelOnly.js
	*/
	let parseClassName = (className) => {
		const modifiers = [];
		let bracketDepth = 0;
		let parenDepth = 0;
		let modifierStart = 0;
		let postfixModifierPosition;
		const len = className.length;
		for (let index = 0; index < len; index++) {
			const currentCharacter = className[index];
			if (bracketDepth === 0 && parenDepth === 0) {
				if (currentCharacter === MODIFIER_SEPARATOR) {
					modifiers.push(className.slice(modifierStart, index));
					modifierStart = index + 1;
					continue;
				}
				if (currentCharacter === "/") {
					postfixModifierPosition = index;
					continue;
				}
			}
			if (currentCharacter === "[") bracketDepth++;
			else if (currentCharacter === "]") bracketDepth--;
			else if (currentCharacter === "(") parenDepth++;
			else if (currentCharacter === ")") parenDepth--;
		}
		const baseClassNameWithImportantModifier = modifiers.length === 0 ? className : className.slice(modifierStart);
		let baseClassName = baseClassNameWithImportantModifier;
		let hasImportantModifier = false;
		if (baseClassNameWithImportantModifier.endsWith(IMPORTANT_MODIFIER)) {
			baseClassName = baseClassNameWithImportantModifier.slice(0, -1);
			hasImportantModifier = true;
		} else if (baseClassNameWithImportantModifier.startsWith(IMPORTANT_MODIFIER)) {
			baseClassName = baseClassNameWithImportantModifier.slice(1);
			hasImportantModifier = true;
		}
		const maybePostfixModifierPosition = postfixModifierPosition && postfixModifierPosition > modifierStart ? postfixModifierPosition - modifierStart : void 0;
		return createResultObject(modifiers, hasImportantModifier, baseClassName, maybePostfixModifierPosition);
	};
	if (prefix) {
		const fullPrefix = prefix + MODIFIER_SEPARATOR;
		const parseClassNameOriginal = parseClassName;
		parseClassName = (className) => className.startsWith(fullPrefix) ? parseClassNameOriginal(className.slice(fullPrefix.length)) : createResultObject(EMPTY_MODIFIERS, false, className, void 0, true);
	}
	if (experimentalParseClassName) {
		const parseClassNameOriginal = parseClassName;
		parseClassName = (className) => experimentalParseClassName({
			className,
			parseClassName: parseClassNameOriginal
		});
	}
	return parseClassName;
};
/**
* Sorts modifiers according to following schema:
* - Predefined modifiers are sorted alphabetically
* - When an arbitrary variant appears, it must be preserved which modifiers are before and after it
*/
var createSortModifiers = (config) => {
	const modifierWeights = /* @__PURE__ */ new Map();
	config.orderSensitiveModifiers.forEach((mod, index) => {
		modifierWeights.set(mod, 1e6 + index);
	});
	return (modifiers) => {
		const result = [];
		let currentSegment = [];
		for (let i = 0; i < modifiers.length; i++) {
			const modifier = modifiers[i];
			const isArbitrary = modifier[0] === "[";
			const isOrderSensitive = modifierWeights.has(modifier);
			if (isArbitrary || isOrderSensitive) {
				if (currentSegment.length > 0) {
					currentSegment.sort();
					result.push(...currentSegment);
					currentSegment = [];
				}
				result.push(modifier);
			} else currentSegment.push(modifier);
		}
		if (currentSegment.length > 0) {
			currentSegment.sort();
			result.push(...currentSegment);
		}
		return result;
	};
};
var createConfigUtils = (config) => ({
	cache: createLruCache(config.cacheSize),
	parseClassName: createParseClassName(config),
	sortModifiers: createSortModifiers(config),
	postfixLookupClassGroupIds: createPostfixLookupClassGroupIds(config),
	...createClassGroupUtils(config)
});
var createPostfixLookupClassGroupIds = (config) => {
	const lookup = Object.create(null);
	const classGroupIds = config.postfixLookupClassGroups;
	if (classGroupIds) for (let i = 0; i < classGroupIds.length; i++) lookup[classGroupIds[i]] = true;
	return lookup;
};
var SPLIT_CLASSES_REGEX = /\s+/;
var mergeClassList = (classList, configUtils) => {
	const { parseClassName, getClassGroupId, getConflictingClassGroupIds, sortModifiers, postfixLookupClassGroupIds } = configUtils;
	/**
	* Set of classGroupIds in following format:
	* `{importantModifier}{variantModifiers}{classGroupId}`
	* @example 'float'
	* @example 'hover:focus:bg-color'
	* @example 'md:!pr'
	*/
	const classGroupsInConflict = [];
	const classNames = classList.trim().split(SPLIT_CLASSES_REGEX);
	let result = "";
	for (let index = classNames.length - 1; index >= 0; index -= 1) {
		const originalClassName = classNames[index];
		const { isExternal, modifiers, hasImportantModifier, baseClassName, maybePostfixModifierPosition } = parseClassName(originalClassName);
		if (isExternal) {
			result = originalClassName + (result.length > 0 ? " " + result : result);
			continue;
		}
		let hasPostfixModifier = !!maybePostfixModifierPosition;
		let classGroupId;
		if (hasPostfixModifier) {
			classGroupId = getClassGroupId(baseClassName.substring(0, maybePostfixModifierPosition));
			const classGroupIdWithPostfix = classGroupId && postfixLookupClassGroupIds[classGroupId] ? getClassGroupId(baseClassName) : void 0;
			if (classGroupIdWithPostfix && classGroupIdWithPostfix !== classGroupId) {
				classGroupId = classGroupIdWithPostfix;
				hasPostfixModifier = false;
			}
		} else classGroupId = getClassGroupId(baseClassName);
		if (!classGroupId) {
			if (!hasPostfixModifier) {
				result = originalClassName + (result.length > 0 ? " " + result : result);
				continue;
			}
			classGroupId = getClassGroupId(baseClassName);
			if (!classGroupId) {
				result = originalClassName + (result.length > 0 ? " " + result : result);
				continue;
			}
			hasPostfixModifier = false;
		}
		const variantModifier = modifiers.length === 0 ? "" : modifiers.length === 1 ? modifiers[0] : sortModifiers(modifiers).join(":");
		const modifierId = hasImportantModifier ? variantModifier + IMPORTANT_MODIFIER : variantModifier;
		const classId = modifierId + classGroupId;
		if (classGroupsInConflict.indexOf(classId) > -1) continue;
		classGroupsInConflict.push(classId);
		const conflictGroups = getConflictingClassGroupIds(classGroupId, hasPostfixModifier);
		for (let i = 0; i < conflictGroups.length; ++i) {
			const group = conflictGroups[i];
			classGroupsInConflict.push(modifierId + group);
		}
		result = originalClassName + (result.length > 0 ? " " + result : result);
	}
	return result;
};
/**
* The code in this file is copied from https://github.com/lukeed/clsx and modified to suit the needs of tailwind-merge better.
*
* Specifically:
* - Runtime code from https://github.com/lukeed/clsx/blob/v1.2.1/src/index.js
* - TypeScript types from https://github.com/lukeed/clsx/blob/v1.2.1/clsx.d.ts
*
* Original code has MIT license: Copyright (c) Luke Edwards <luke.edwards05@gmail.com> (lukeed.com)
*/
var twJoin = (...classLists) => {
	let index = 0;
	let argument;
	let resolvedValue;
	let string = "";
	while (index < classLists.length) if (argument = classLists[index++]) {
		if (resolvedValue = toValue(argument)) {
			string && (string += " ");
			string += resolvedValue;
		}
	}
	return string;
};
var toValue = (mix) => {
	if (typeof mix === "string") return mix;
	let resolvedValue;
	let string = "";
	for (let k = 0; k < mix.length; k++) if (mix[k]) {
		if (resolvedValue = toValue(mix[k])) {
			string && (string += " ");
			string += resolvedValue;
		}
	}
	return string;
};
var createTailwindMerge = (createConfigFirst, ...createConfigRest) => {
	let configUtils;
	let cacheGet;
	let cacheSet;
	let functionToCall;
	const initTailwindMerge = (classList) => {
		configUtils = createConfigUtils(createConfigRest.reduce((previousConfig, createConfigCurrent) => createConfigCurrent(previousConfig), createConfigFirst()));
		cacheGet = configUtils.cache.get;
		cacheSet = configUtils.cache.set;
		functionToCall = tailwindMerge;
		return tailwindMerge(classList);
	};
	const tailwindMerge = (classList) => {
		const cachedResult = cacheGet(classList);
		if (cachedResult) return cachedResult;
		const result = mergeClassList(classList, configUtils);
		cacheSet(classList, result);
		return result;
	};
	functionToCall = initTailwindMerge;
	return (...args) => functionToCall(twJoin(...args));
};
var fallbackThemeArr = [];
var fromTheme = (key) => {
	const themeGetter = (theme) => theme[key] || fallbackThemeArr;
	themeGetter.isThemeGetter = true;
	themeGetter.themeKey = key;
	return themeGetter;
};
var arbitraryValueRegex = /^\[(?:(\w[\w-]*):)?(.+)\]$/i;
var arbitraryVariableRegex = /^\((?:(\w[\w-]*):)?(.+)\)$/i;
var fractionRegex = /^\d+(?:\.\d+)?\/\d+(?:\.\d+)?$/;
var tshirtUnitRegex = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/;
var lengthUnitRegex = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/;
var colorFunctionRegex = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix|color|light-dark)\(.+\)$/;
var shadowRegex = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/;
var imageRegex = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/;
var isFraction = (value) => fractionRegex.test(value);
var isNumber = (value) => !!value && !Number.isNaN(Number(value));
var isInteger = (value) => !!value && Number.isInteger(Number(value));
var isPercent = (value) => value.endsWith("%") && isNumber(value.slice(0, -1));
var isTshirtSize = (value) => tshirtUnitRegex.test(value);
var isAny = () => true;
var isLengthOnly = (value) => lengthUnitRegex.test(value) && !colorFunctionRegex.test(value);
var isNever = () => false;
var isShadow = (value) => shadowRegex.test(value);
var isImage = (value) => imageRegex.test(value);
var isAnyNonArbitrary = (value) => !isArbitraryValue(value) && !isArbitraryVariable(value);
var isNamedContainerQuery = (value) => value.startsWith("@container") && (value[10] === "/" && value[11] !== void 0 || value[11] === "s" && value[16] !== void 0 && value.startsWith("-size/", 10) || value[11] === "n" && value[18] !== void 0 && value.startsWith("-normal/", 10));
var isArbitrarySize = (value) => getIsArbitraryValue(value, isLabelSize, isNever);
var isArbitraryValue = (value) => arbitraryValueRegex.test(value);
var isArbitraryLength = (value) => getIsArbitraryValue(value, isLabelLength, isLengthOnly);
var isArbitraryNumber = (value) => getIsArbitraryValue(value, isLabelNumber, isNumber);
var isArbitraryWeight = (value) => getIsArbitraryValue(value, isLabelWeight, isAny);
var isArbitraryFamilyName = (value) => getIsArbitraryValue(value, isLabelFamilyName, isNever);
var isArbitraryPosition = (value) => getIsArbitraryValue(value, isLabelPosition, isNever);
var isArbitraryImage = (value) => getIsArbitraryValue(value, isLabelImage, isImage);
var isArbitraryShadow = (value) => getIsArbitraryValue(value, isLabelShadow, isShadow);
var isArbitraryVariable = (value) => arbitraryVariableRegex.test(value);
var isArbitraryVariableLength = (value) => getIsArbitraryVariable(value, isLabelLength);
var isArbitraryVariableFamilyName = (value) => getIsArbitraryVariable(value, isLabelFamilyName);
var isArbitraryVariablePosition = (value) => getIsArbitraryVariable(value, isLabelPosition);
var isArbitraryVariableSize = (value) => getIsArbitraryVariable(value, isLabelSize);
var isArbitraryVariableImage = (value) => getIsArbitraryVariable(value, isLabelImage);
var isArbitraryVariableShadow = (value) => getIsArbitraryVariable(value, isLabelShadow, true);
var isArbitraryVariableWeight = (value) => getIsArbitraryVariable(value, isLabelWeight, true);
var getIsArbitraryValue = (value, testLabel, testValue) => {
	const result = arbitraryValueRegex.exec(value);
	if (result) {
		if (result[1]) return testLabel(result[1]);
		return testValue(result[2]);
	}
	return false;
};
var getIsArbitraryVariable = (value, testLabel, shouldMatchNoLabel = false) => {
	const result = arbitraryVariableRegex.exec(value);
	if (result) {
		if (result[1]) return testLabel(result[1]);
		return shouldMatchNoLabel;
	}
	return false;
};
var isLabelPosition = (label) => label === "position" || label === "percentage";
var isLabelImage = (label) => label === "image" || label === "url";
var isLabelSize = (label) => label === "length" || label === "size" || label === "bg-size";
var isLabelLength = (label) => label === "length";
var isLabelNumber = (label) => label === "number";
var isLabelFamilyName = (label) => label === "family-name";
var isLabelWeight = (label) => label === "number" || label === "weight";
var isLabelShadow = (label) => label === "shadow";
var getDefaultConfig = () => {
	/**
	* Theme getters for theme variable namespaces
	* @see https://tailwindcss.com/docs/theme#theme-variable-namespaces
	*/
	const themeColor = fromTheme("color");
	const themeFont = fromTheme("font");
	const themeText = fromTheme("text");
	const themeFontWeight = fromTheme("font-weight");
	const themeTracking = fromTheme("tracking");
	const themeLeading = fromTheme("leading");
	const themeBreakpoint = fromTheme("breakpoint");
	const themeContainer = fromTheme("container");
	const themeSpacing = fromTheme("spacing");
	const themeRadius = fromTheme("radius");
	const themeShadow = fromTheme("shadow");
	const themeInsetShadow = fromTheme("inset-shadow");
	const themeTextShadow = fromTheme("text-shadow");
	const themeDropShadow = fromTheme("drop-shadow");
	const themeBlur = fromTheme("blur");
	const themePerspective = fromTheme("perspective");
	const themeAspect = fromTheme("aspect");
	const themeEase = fromTheme("ease");
	const themeAnimate = fromTheme("animate");
	/**
	* Helpers to avoid repeating the same scales
	*
	* We use functions that create a new array every time they're called instead of static arrays.
	* This ensures that users who modify any scale by mutating the array (e.g. with `array.push(element)`) don't accidentally mutate arrays in other parts of the config.
	*/
	const scaleBreak = () => [
		"auto",
		"avoid",
		"all",
		"avoid-page",
		"page",
		"left",
		"right",
		"column"
	];
	const scalePosition = () => [
		"center",
		"top",
		"bottom",
		"left",
		"right",
		"top-left",
		"left-top",
		"top-right",
		"right-top",
		"bottom-right",
		"right-bottom",
		"bottom-left",
		"left-bottom"
	];
	const scalePositionWithArbitrary = () => [
		...scalePosition(),
		isArbitraryVariable,
		isArbitraryValue
	];
	const scaleOverflow = () => [
		"auto",
		"hidden",
		"clip",
		"visible",
		"scroll"
	];
	const scaleOverscroll = () => [
		"auto",
		"contain",
		"none"
	];
	const scaleUnambiguousSpacing = () => [
		isArbitraryVariable,
		isArbitraryValue,
		themeSpacing
	];
	const scaleInset = () => [
		isFraction,
		"full",
		"auto",
		...scaleUnambiguousSpacing()
	];
	const scaleGridTemplateColsRows = () => [
		isInteger,
		"none",
		"subgrid",
		isArbitraryVariable,
		isArbitraryValue
	];
	const scaleGridColRowStartAndEnd = () => [
		"auto",
		{ span: [
			"full",
			isInteger,
			isArbitraryVariable,
			isArbitraryValue
		] },
		isInteger,
		isArbitraryVariable,
		isArbitraryValue
	];
	const scaleGridColRowStartOrEnd = () => [
		isInteger,
		"auto",
		isArbitraryVariable,
		isArbitraryValue
	];
	const scaleGridAutoColsRows = () => [
		"auto",
		"min",
		"max",
		"fr",
		isArbitraryVariable,
		isArbitraryValue
	];
	const scaleAlignPrimaryAxis = () => [
		"start",
		"end",
		"center",
		"between",
		"around",
		"evenly",
		"stretch",
		"baseline",
		"center-safe",
		"end-safe"
	];
	const scaleAlignSecondaryAxis = () => [
		"start",
		"end",
		"center",
		"stretch",
		"center-safe",
		"end-safe"
	];
	const scaleMargin = () => ["auto", ...scaleUnambiguousSpacing()];
	const scaleSizing = () => [
		isFraction,
		"auto",
		"full",
		"dvw",
		"dvh",
		"lvw",
		"lvh",
		"svw",
		"svh",
		"min",
		"max",
		"fit",
		...scaleUnambiguousSpacing()
	];
	const scaleSizingInline = () => [
		themeContainer,
		isFraction,
		"screen",
		"full",
		"dvw",
		"lvw",
		"svw",
		"min",
		"max",
		"fit",
		...scaleUnambiguousSpacing()
	];
	const scaleSizingBlock = () => [
		isFraction,
		"screen",
		"full",
		"lh",
		"dvh",
		"lvh",
		"svh",
		"min",
		"max",
		"fit",
		...scaleUnambiguousSpacing()
	];
	const scaleColor = () => [
		themeColor,
		isArbitraryVariable,
		isArbitraryValue
	];
	const scaleBgPosition = () => [
		...scalePosition(),
		isArbitraryVariablePosition,
		isArbitraryPosition,
		{ position: [isArbitraryVariable, isArbitraryValue] }
	];
	const scaleBgRepeat = () => ["no-repeat", { repeat: [
		"",
		"x",
		"y",
		"space",
		"round"
	] }];
	const scaleBgSize = () => [
		"auto",
		"cover",
		"contain",
		isArbitraryVariableSize,
		isArbitrarySize,
		{ size: [isArbitraryVariable, isArbitraryValue] }
	];
	const scaleGradientStopPosition = () => [
		isPercent,
		isArbitraryVariableLength,
		isArbitraryLength
	];
	const scaleRadius = () => [
		"",
		"none",
		"full",
		themeRadius,
		isArbitraryVariable,
		isArbitraryValue
	];
	const scaleBorderWidth = () => [
		"",
		isNumber,
		isArbitraryVariableLength,
		isArbitraryLength
	];
	const scaleLineStyle = () => [
		"solid",
		"dashed",
		"dotted",
		"double"
	];
	const scaleBlendMode = () => [
		"normal",
		"multiply",
		"screen",
		"overlay",
		"darken",
		"lighten",
		"color-dodge",
		"color-burn",
		"hard-light",
		"soft-light",
		"difference",
		"exclusion",
		"hue",
		"saturation",
		"color",
		"luminosity"
	];
	const scaleMaskImagePosition = () => [
		isNumber,
		isPercent,
		isArbitraryVariablePosition,
		isArbitraryPosition
	];
	const scaleBlur = () => [
		"",
		"none",
		themeBlur,
		isArbitraryVariable,
		isArbitraryValue
	];
	const scaleRotate = () => [
		"none",
		isNumber,
		isArbitraryVariable,
		isArbitraryValue
	];
	const scaleScale = () => [
		"none",
		isNumber,
		isArbitraryVariable,
		isArbitraryValue
	];
	const scaleSkew = () => [
		isNumber,
		isArbitraryVariable,
		isArbitraryValue
	];
	const scaleTranslate = () => [
		isFraction,
		"full",
		...scaleUnambiguousSpacing()
	];
	return {
		cacheSize: 500,
		theme: {
			animate: [
				"spin",
				"ping",
				"pulse",
				"bounce"
			],
			aspect: ["video"],
			blur: [isTshirtSize],
			breakpoint: [isTshirtSize],
			color: [isAny],
			container: [isTshirtSize],
			"drop-shadow": [isTshirtSize],
			ease: [
				"in",
				"out",
				"in-out"
			],
			font: [isAnyNonArbitrary],
			"font-weight": [
				"thin",
				"extralight",
				"light",
				"normal",
				"medium",
				"semibold",
				"bold",
				"extrabold",
				"black"
			],
			"inset-shadow": [isTshirtSize],
			leading: [
				"none",
				"tight",
				"snug",
				"normal",
				"relaxed",
				"loose"
			],
			perspective: [
				"dramatic",
				"near",
				"normal",
				"midrange",
				"distant",
				"none"
			],
			radius: [isTshirtSize],
			shadow: [isTshirtSize],
			spacing: ["px", isNumber],
			text: [isTshirtSize],
			"text-shadow": [isTshirtSize],
			tracking: [
				"tighter",
				"tight",
				"normal",
				"wide",
				"wider",
				"widest"
			]
		},
		classGroups: {
			/**
			* Aspect Ratio
			* @see https://tailwindcss.com/docs/aspect-ratio
			*/
			aspect: [{ aspect: [
				"auto",
				"square",
				isFraction,
				isArbitraryValue,
				isArbitraryVariable,
				themeAspect
			] }],
			/**
			* Container
			* @see https://tailwindcss.com/docs/container
			* @deprecated since Tailwind CSS v4.0.0
			*/
			container: ["container"],
			/**
			* Container Type
			* @see https://tailwindcss.com/docs/responsive-design#container-queries
			*/
			"container-type": [{ "@container": [
				"",
				"normal",
				"size",
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Container Name
			* @see https://tailwindcss.com/docs/responsive-design#named-containers
			*/
			"container-named": [isNamedContainerQuery],
			/**
			* Columns
			* @see https://tailwindcss.com/docs/columns
			*/
			columns: [{ columns: [
				isNumber,
				"auto",
				isArbitraryValue,
				isArbitraryVariable,
				themeContainer
			] }],
			/**
			* Break After
			* @see https://tailwindcss.com/docs/break-after
			*/
			"break-after": [{ "break-after": scaleBreak() }],
			/**
			* Break Before
			* @see https://tailwindcss.com/docs/break-before
			*/
			"break-before": [{ "break-before": scaleBreak() }],
			/**
			* Break Inside
			* @see https://tailwindcss.com/docs/break-inside
			*/
			"break-inside": [{ "break-inside": [
				"auto",
				"avoid",
				"avoid-page",
				"avoid-column"
			] }],
			/**
			* Box Decoration Break
			* @see https://tailwindcss.com/docs/box-decoration-break
			*/
			"box-decoration": [{ "box-decoration": ["slice", "clone"] }],
			/**
			* Box Sizing
			* @see https://tailwindcss.com/docs/box-sizing
			*/
			box: [{ box: ["border", "content"] }],
			/**
			* Display
			* @see https://tailwindcss.com/docs/display
			*/
			display: [
				"block",
				"inline-block",
				"inline",
				"flex",
				"inline-flex",
				"table",
				"inline-table",
				"table-caption",
				"table-cell",
				"table-column",
				"table-column-group",
				"table-footer-group",
				"table-header-group",
				"table-row-group",
				"table-row",
				"flow-root",
				"grid",
				"inline-grid",
				"contents",
				"list-item",
				"hidden"
			],
			/**
			* Screen Reader Only
			* @see https://tailwindcss.com/docs/display#screen-reader-only
			*/
			sr: ["sr-only", "not-sr-only"],
			/**
			* Floats
			* @see https://tailwindcss.com/docs/float
			*/
			float: [{ float: [
				"right",
				"left",
				"none",
				"start",
				"end"
			] }],
			/**
			* Clear
			* @see https://tailwindcss.com/docs/clear
			*/
			clear: [{ clear: [
				"left",
				"right",
				"both",
				"none",
				"start",
				"end"
			] }],
			/**
			* Isolation
			* @see https://tailwindcss.com/docs/isolation
			*/
			isolation: ["isolate", "isolation-auto"],
			/**
			* Object Fit
			* @see https://tailwindcss.com/docs/object-fit
			*/
			"object-fit": [{ object: [
				"contain",
				"cover",
				"fill",
				"none",
				"scale-down"
			] }],
			/**
			* Object Position
			* @see https://tailwindcss.com/docs/object-position
			*/
			"object-position": [{ object: scalePositionWithArbitrary() }],
			/**
			* Overflow
			* @see https://tailwindcss.com/docs/overflow
			*/
			overflow: [{ overflow: scaleOverflow() }],
			/**
			* Overflow X
			* @see https://tailwindcss.com/docs/overflow
			*/
			"overflow-x": [{ "overflow-x": scaleOverflow() }],
			/**
			* Overflow Y
			* @see https://tailwindcss.com/docs/overflow
			*/
			"overflow-y": [{ "overflow-y": scaleOverflow() }],
			/**
			* Overscroll Behavior
			* @see https://tailwindcss.com/docs/overscroll-behavior
			*/
			overscroll: [{ overscroll: scaleOverscroll() }],
			/**
			* Overscroll Behavior X
			* @see https://tailwindcss.com/docs/overscroll-behavior
			*/
			"overscroll-x": [{ "overscroll-x": scaleOverscroll() }],
			/**
			* Overscroll Behavior Y
			* @see https://tailwindcss.com/docs/overscroll-behavior
			*/
			"overscroll-y": [{ "overscroll-y": scaleOverscroll() }],
			/**
			* Position
			* @see https://tailwindcss.com/docs/position
			*/
			position: [
				"static",
				"fixed",
				"absolute",
				"relative",
				"sticky"
			],
			/**
			* Inset
			* @see https://tailwindcss.com/docs/top-right-bottom-left
			*/
			inset: [{ inset: scaleInset() }],
			/**
			* Inset Inline
			* @see https://tailwindcss.com/docs/top-right-bottom-left
			*/
			"inset-x": [{ "inset-x": scaleInset() }],
			/**
			* Inset Block
			* @see https://tailwindcss.com/docs/top-right-bottom-left
			*/
			"inset-y": [{ "inset-y": scaleInset() }],
			/**
			* Inset Inline Start
			* @see https://tailwindcss.com/docs/top-right-bottom-left
			* @todo class group will be renamed to `inset-s` in next major release
			*/
			start: [{
				"inset-s": scaleInset(),
				/**
				* @deprecated since Tailwind CSS v4.2.0 in favor of `inset-s-*` utilities.
				* @see https://github.com/tailwindlabs/tailwindcss/pull/19613
				*/
				start: scaleInset()
			}],
			/**
			* Inset Inline End
			* @see https://tailwindcss.com/docs/top-right-bottom-left
			* @todo class group will be renamed to `inset-e` in next major release
			*/
			end: [{
				"inset-e": scaleInset(),
				/**
				* @deprecated since Tailwind CSS v4.2.0 in favor of `inset-e-*` utilities.
				* @see https://github.com/tailwindlabs/tailwindcss/pull/19613
				*/
				end: scaleInset()
			}],
			/**
			* Inset Block Start
			* @see https://tailwindcss.com/docs/top-right-bottom-left
			*/
			"inset-bs": [{ "inset-bs": scaleInset() }],
			/**
			* Inset Block End
			* @see https://tailwindcss.com/docs/top-right-bottom-left
			*/
			"inset-be": [{ "inset-be": scaleInset() }],
			/**
			* Top
			* @see https://tailwindcss.com/docs/top-right-bottom-left
			*/
			top: [{ top: scaleInset() }],
			/**
			* Right
			* @see https://tailwindcss.com/docs/top-right-bottom-left
			*/
			right: [{ right: scaleInset() }],
			/**
			* Bottom
			* @see https://tailwindcss.com/docs/top-right-bottom-left
			*/
			bottom: [{ bottom: scaleInset() }],
			/**
			* Left
			* @see https://tailwindcss.com/docs/top-right-bottom-left
			*/
			left: [{ left: scaleInset() }],
			/**
			* Visibility
			* @see https://tailwindcss.com/docs/visibility
			*/
			visibility: [
				"visible",
				"invisible",
				"collapse"
			],
			/**
			* Z-Index
			* @see https://tailwindcss.com/docs/z-index
			*/
			z: [{ z: [
				isInteger,
				"auto",
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Flex Basis
			* @see https://tailwindcss.com/docs/flex-basis
			*/
			basis: [{ basis: [
				isFraction,
				"full",
				"auto",
				themeContainer,
				...scaleUnambiguousSpacing()
			] }],
			/**
			* Flex Direction
			* @see https://tailwindcss.com/docs/flex-direction
			*/
			"flex-direction": [{ flex: [
				"row",
				"row-reverse",
				"col",
				"col-reverse"
			] }],
			/**
			* Flex Wrap
			* @see https://tailwindcss.com/docs/flex-wrap
			*/
			"flex-wrap": [{ flex: [
				"nowrap",
				"wrap",
				"wrap-reverse"
			] }],
			/**
			* Flex
			* @see https://tailwindcss.com/docs/flex
			*/
			flex: [{ flex: [
				isNumber,
				isFraction,
				"auto",
				"initial",
				"none",
				isArbitraryValue
			] }],
			/**
			* Flex Grow
			* @see https://tailwindcss.com/docs/flex-grow
			*/
			grow: [{ grow: [
				"",
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Flex Shrink
			* @see https://tailwindcss.com/docs/flex-shrink
			*/
			shrink: [{ shrink: [
				"",
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Order
			* @see https://tailwindcss.com/docs/order
			*/
			order: [{ order: [
				isInteger,
				"first",
				"last",
				"none",
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Grid Template Columns
			* @see https://tailwindcss.com/docs/grid-template-columns
			*/
			"grid-cols": [{ "grid-cols": scaleGridTemplateColsRows() }],
			/**
			* Grid Column Start / End
			* @see https://tailwindcss.com/docs/grid-column
			*/
			"col-start-end": [{ col: scaleGridColRowStartAndEnd() }],
			/**
			* Grid Column Start
			* @see https://tailwindcss.com/docs/grid-column
			*/
			"col-start": [{ "col-start": scaleGridColRowStartOrEnd() }],
			/**
			* Grid Column End
			* @see https://tailwindcss.com/docs/grid-column
			*/
			"col-end": [{ "col-end": scaleGridColRowStartOrEnd() }],
			/**
			* Grid Template Rows
			* @see https://tailwindcss.com/docs/grid-template-rows
			*/
			"grid-rows": [{ "grid-rows": scaleGridTemplateColsRows() }],
			/**
			* Grid Row Start / End
			* @see https://tailwindcss.com/docs/grid-row
			*/
			"row-start-end": [{ row: scaleGridColRowStartAndEnd() }],
			/**
			* Grid Row Start
			* @see https://tailwindcss.com/docs/grid-row
			*/
			"row-start": [{ "row-start": scaleGridColRowStartOrEnd() }],
			/**
			* Grid Row End
			* @see https://tailwindcss.com/docs/grid-row
			*/
			"row-end": [{ "row-end": scaleGridColRowStartOrEnd() }],
			/**
			* Grid Auto Flow
			* @see https://tailwindcss.com/docs/grid-auto-flow
			*/
			"grid-flow": [{ "grid-flow": [
				"row",
				"col",
				"dense",
				"row-dense",
				"col-dense"
			] }],
			/**
			* Grid Auto Columns
			* @see https://tailwindcss.com/docs/grid-auto-columns
			*/
			"auto-cols": [{ "auto-cols": scaleGridAutoColsRows() }],
			/**
			* Grid Auto Rows
			* @see https://tailwindcss.com/docs/grid-auto-rows
			*/
			"auto-rows": [{ "auto-rows": scaleGridAutoColsRows() }],
			/**
			* Gap
			* @see https://tailwindcss.com/docs/gap
			*/
			gap: [{ gap: scaleUnambiguousSpacing() }],
			/**
			* Gap X
			* @see https://tailwindcss.com/docs/gap
			*/
			"gap-x": [{ "gap-x": scaleUnambiguousSpacing() }],
			/**
			* Gap Y
			* @see https://tailwindcss.com/docs/gap
			*/
			"gap-y": [{ "gap-y": scaleUnambiguousSpacing() }],
			/**
			* Justify Content
			* @see https://tailwindcss.com/docs/justify-content
			*/
			"justify-content": [{ justify: [...scaleAlignPrimaryAxis(), "normal"] }],
			/**
			* Justify Items
			* @see https://tailwindcss.com/docs/justify-items
			*/
			"justify-items": [{ "justify-items": [...scaleAlignSecondaryAxis(), "normal"] }],
			/**
			* Justify Self
			* @see https://tailwindcss.com/docs/justify-self
			*/
			"justify-self": [{ "justify-self": ["auto", ...scaleAlignSecondaryAxis()] }],
			/**
			* Align Content
			* @see https://tailwindcss.com/docs/align-content
			*/
			"align-content": [{ content: ["normal", ...scaleAlignPrimaryAxis()] }],
			/**
			* Align Items
			* @see https://tailwindcss.com/docs/align-items
			*/
			"align-items": [{ items: [...scaleAlignSecondaryAxis(), { baseline: ["", "last"] }] }],
			/**
			* Align Self
			* @see https://tailwindcss.com/docs/align-self
			*/
			"align-self": [{ self: [
				"auto",
				...scaleAlignSecondaryAxis(),
				{ baseline: ["", "last"] }
			] }],
			/**
			* Place Content
			* @see https://tailwindcss.com/docs/place-content
			*/
			"place-content": [{ "place-content": scaleAlignPrimaryAxis() }],
			/**
			* Place Items
			* @see https://tailwindcss.com/docs/place-items
			*/
			"place-items": [{ "place-items": [...scaleAlignSecondaryAxis(), "baseline"] }],
			/**
			* Place Self
			* @see https://tailwindcss.com/docs/place-self
			*/
			"place-self": [{ "place-self": ["auto", ...scaleAlignSecondaryAxis()] }],
			/**
			* Padding
			* @see https://tailwindcss.com/docs/padding
			*/
			p: [{ p: scaleUnambiguousSpacing() }],
			/**
			* Padding Inline
			* @see https://tailwindcss.com/docs/padding
			*/
			px: [{ px: scaleUnambiguousSpacing() }],
			/**
			* Padding Block
			* @see https://tailwindcss.com/docs/padding
			*/
			py: [{ py: scaleUnambiguousSpacing() }],
			/**
			* Padding Inline Start
			* @see https://tailwindcss.com/docs/padding
			*/
			ps: [{ ps: scaleUnambiguousSpacing() }],
			/**
			* Padding Inline End
			* @see https://tailwindcss.com/docs/padding
			*/
			pe: [{ pe: scaleUnambiguousSpacing() }],
			/**
			* Padding Block Start
			* @see https://tailwindcss.com/docs/padding
			*/
			pbs: [{ pbs: scaleUnambiguousSpacing() }],
			/**
			* Padding Block End
			* @see https://tailwindcss.com/docs/padding
			*/
			pbe: [{ pbe: scaleUnambiguousSpacing() }],
			/**
			* Padding Top
			* @see https://tailwindcss.com/docs/padding
			*/
			pt: [{ pt: scaleUnambiguousSpacing() }],
			/**
			* Padding Right
			* @see https://tailwindcss.com/docs/padding
			*/
			pr: [{ pr: scaleUnambiguousSpacing() }],
			/**
			* Padding Bottom
			* @see https://tailwindcss.com/docs/padding
			*/
			pb: [{ pb: scaleUnambiguousSpacing() }],
			/**
			* Padding Left
			* @see https://tailwindcss.com/docs/padding
			*/
			pl: [{ pl: scaleUnambiguousSpacing() }],
			/**
			* Margin
			* @see https://tailwindcss.com/docs/margin
			*/
			m: [{ m: scaleMargin() }],
			/**
			* Margin Inline
			* @see https://tailwindcss.com/docs/margin
			*/
			mx: [{ mx: scaleMargin() }],
			/**
			* Margin Block
			* @see https://tailwindcss.com/docs/margin
			*/
			my: [{ my: scaleMargin() }],
			/**
			* Margin Inline Start
			* @see https://tailwindcss.com/docs/margin
			*/
			ms: [{ ms: scaleMargin() }],
			/**
			* Margin Inline End
			* @see https://tailwindcss.com/docs/margin
			*/
			me: [{ me: scaleMargin() }],
			/**
			* Margin Block Start
			* @see https://tailwindcss.com/docs/margin
			*/
			mbs: [{ mbs: scaleMargin() }],
			/**
			* Margin Block End
			* @see https://tailwindcss.com/docs/margin
			*/
			mbe: [{ mbe: scaleMargin() }],
			/**
			* Margin Top
			* @see https://tailwindcss.com/docs/margin
			*/
			mt: [{ mt: scaleMargin() }],
			/**
			* Margin Right
			* @see https://tailwindcss.com/docs/margin
			*/
			mr: [{ mr: scaleMargin() }],
			/**
			* Margin Bottom
			* @see https://tailwindcss.com/docs/margin
			*/
			mb: [{ mb: scaleMargin() }],
			/**
			* Margin Left
			* @see https://tailwindcss.com/docs/margin
			*/
			ml: [{ ml: scaleMargin() }],
			/**
			* Space Between X
			* @see https://tailwindcss.com/docs/margin#adding-space-between-children
			*/
			"space-x": [{ "space-x": scaleUnambiguousSpacing() }],
			/**
			* Space Between X Reverse
			* @see https://tailwindcss.com/docs/margin#adding-space-between-children
			*/
			"space-x-reverse": ["space-x-reverse"],
			/**
			* Space Between Y
			* @see https://tailwindcss.com/docs/margin#adding-space-between-children
			*/
			"space-y": [{ "space-y": scaleUnambiguousSpacing() }],
			/**
			* Space Between Y Reverse
			* @see https://tailwindcss.com/docs/margin#adding-space-between-children
			*/
			"space-y-reverse": ["space-y-reverse"],
			/**
			* Size
			* @see https://tailwindcss.com/docs/width#setting-both-width-and-height
			*/
			size: [{ size: scaleSizing() }],
			/**
			* Inline Size
			* @see https://tailwindcss.com/docs/inline-size
			*/
			"inline-size": [{ inline: ["auto", ...scaleSizingInline()] }],
			/**
			* Min-Inline Size
			* @see https://tailwindcss.com/docs/min-inline-size
			*/
			"min-inline-size": [{ "min-inline": ["auto", ...scaleSizingInline()] }],
			/**
			* Max-Inline Size
			* @see https://tailwindcss.com/docs/max-inline-size
			*/
			"max-inline-size": [{ "max-inline": ["none", ...scaleSizingInline()] }],
			/**
			* Block Size
			* @see https://tailwindcss.com/docs/block-size
			*/
			"block-size": [{ block: ["auto", ...scaleSizingBlock()] }],
			/**
			* Min-Block Size
			* @see https://tailwindcss.com/docs/min-block-size
			*/
			"min-block-size": [{ "min-block": ["auto", ...scaleSizingBlock()] }],
			/**
			* Max-Block Size
			* @see https://tailwindcss.com/docs/max-block-size
			*/
			"max-block-size": [{ "max-block": ["none", ...scaleSizingBlock()] }],
			/**
			* Width
			* @see https://tailwindcss.com/docs/width
			*/
			w: [{ w: [
				themeContainer,
				"screen",
				...scaleSizing()
			] }],
			/**
			* Min-Width
			* @see https://tailwindcss.com/docs/min-width
			*/
			"min-w": [{ "min-w": [
				themeContainer,
				"screen",
				"none",
				...scaleSizing()
			] }],
			/**
			* Max-Width
			* @see https://tailwindcss.com/docs/max-width
			*/
			"max-w": [{ "max-w": [
				themeContainer,
				"screen",
				"none",
				"prose",
				{ screen: [themeBreakpoint] },
				...scaleSizing()
			] }],
			/**
			* Height
			* @see https://tailwindcss.com/docs/height
			*/
			h: [{ h: [
				"screen",
				"lh",
				...scaleSizing()
			] }],
			/**
			* Min-Height
			* @see https://tailwindcss.com/docs/min-height
			*/
			"min-h": [{ "min-h": [
				"screen",
				"lh",
				"none",
				...scaleSizing()
			] }],
			/**
			* Max-Height
			* @see https://tailwindcss.com/docs/max-height
			*/
			"max-h": [{ "max-h": [
				"screen",
				"lh",
				"none",
				...scaleSizing()
			] }],
			/**
			* Font Size
			* @see https://tailwindcss.com/docs/font-size
			*/
			"font-size": [{ text: [
				"base",
				themeText,
				isArbitraryVariableLength,
				isArbitraryLength
			] }],
			/**
			* Font Smoothing
			* @see https://tailwindcss.com/docs/font-smoothing
			*/
			"font-smoothing": ["antialiased", "subpixel-antialiased"],
			/**
			* Font Style
			* @see https://tailwindcss.com/docs/font-style
			*/
			"font-style": ["italic", "not-italic"],
			/**
			* Font Weight
			* @see https://tailwindcss.com/docs/font-weight
			*/
			"font-weight": [{ font: [
				themeFontWeight,
				isArbitraryVariableWeight,
				isArbitraryWeight
			] }],
			/**
			* Font Stretch
			* @see https://tailwindcss.com/docs/font-stretch
			*/
			"font-stretch": [{ "font-stretch": [
				"ultra-condensed",
				"extra-condensed",
				"condensed",
				"semi-condensed",
				"normal",
				"semi-expanded",
				"expanded",
				"extra-expanded",
				"ultra-expanded",
				isPercent,
				isArbitraryValue
			] }],
			/**
			* Font Family
			* @see https://tailwindcss.com/docs/font-family
			*/
			"font-family": [{ font: [
				isArbitraryVariableFamilyName,
				isArbitraryFamilyName,
				themeFont
			] }],
			/**
			* Font Feature Settings
			* @see https://tailwindcss.com/docs/font-feature-settings
			*/
			"font-features": [{ "font-features": [isArbitraryValue] }],
			/**
			* Font Variant Numeric
			* @see https://tailwindcss.com/docs/font-variant-numeric
			*/
			"fvn-normal": ["normal-nums"],
			/**
			* Font Variant Numeric
			* @see https://tailwindcss.com/docs/font-variant-numeric
			*/
			"fvn-ordinal": ["ordinal"],
			/**
			* Font Variant Numeric
			* @see https://tailwindcss.com/docs/font-variant-numeric
			*/
			"fvn-slashed-zero": ["slashed-zero"],
			/**
			* Font Variant Numeric
			* @see https://tailwindcss.com/docs/font-variant-numeric
			*/
			"fvn-figure": ["lining-nums", "oldstyle-nums"],
			/**
			* Font Variant Numeric
			* @see https://tailwindcss.com/docs/font-variant-numeric
			*/
			"fvn-spacing": ["proportional-nums", "tabular-nums"],
			/**
			* Font Variant Numeric
			* @see https://tailwindcss.com/docs/font-variant-numeric
			*/
			"fvn-fraction": ["diagonal-fractions", "stacked-fractions"],
			/**
			* Letter Spacing
			* @see https://tailwindcss.com/docs/letter-spacing
			*/
			tracking: [{ tracking: [
				themeTracking,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Line Clamp
			* @see https://tailwindcss.com/docs/line-clamp
			*/
			"line-clamp": [{ "line-clamp": [
				isNumber,
				"none",
				isArbitraryVariable,
				isArbitraryNumber
			] }],
			/**
			* Line Height
			* @see https://tailwindcss.com/docs/line-height
			*/
			leading: [{ leading: [
				"none",
				themeLeading,
				...scaleUnambiguousSpacing()
			] }],
			/**
			* List Style Image
			* @see https://tailwindcss.com/docs/list-style-image
			*/
			"list-image": [{ "list-image": [
				"none",
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* List Style Position
			* @see https://tailwindcss.com/docs/list-style-position
			*/
			"list-style-position": [{ list: ["inside", "outside"] }],
			/**
			* List Style Type
			* @see https://tailwindcss.com/docs/list-style-type
			*/
			"list-style-type": [{ list: [
				"disc",
				"decimal",
				"none",
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Text Alignment
			* @see https://tailwindcss.com/docs/text-align
			*/
			"text-alignment": [{ text: [
				"left",
				"center",
				"right",
				"justify",
				"start",
				"end"
			] }],
			/**
			* Placeholder Color
			* @deprecated since Tailwind CSS v3.0.0
			* @see https://v3.tailwindcss.com/docs/placeholder-color
			*/
			"placeholder-color": [{ placeholder: scaleColor() }],
			/**
			* Text Color
			* @see https://tailwindcss.com/docs/text-color
			*/
			"text-color": [{ text: scaleColor() }],
			/**
			* Text Decoration
			* @see https://tailwindcss.com/docs/text-decoration
			*/
			"text-decoration": [
				"underline",
				"overline",
				"line-through",
				"no-underline"
			],
			/**
			* Text Decoration Style
			* @see https://tailwindcss.com/docs/text-decoration-style
			*/
			"text-decoration-style": [{ decoration: [...scaleLineStyle(), "wavy"] }],
			/**
			* Text Decoration Thickness
			* @see https://tailwindcss.com/docs/text-decoration-thickness
			*/
			"text-decoration-thickness": [{ decoration: [
				isNumber,
				"from-font",
				"auto",
				isArbitraryVariable,
				isArbitraryLength
			] }],
			/**
			* Text Decoration Color
			* @see https://tailwindcss.com/docs/text-decoration-color
			*/
			"text-decoration-color": [{ decoration: scaleColor() }],
			/**
			* Text Underline Offset
			* @see https://tailwindcss.com/docs/text-underline-offset
			*/
			"underline-offset": [{ "underline-offset": [
				isNumber,
				"auto",
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Text Transform
			* @see https://tailwindcss.com/docs/text-transform
			*/
			"text-transform": [
				"uppercase",
				"lowercase",
				"capitalize",
				"normal-case"
			],
			/**
			* Text Overflow
			* @see https://tailwindcss.com/docs/text-overflow
			*/
			"text-overflow": [
				"truncate",
				"text-ellipsis",
				"text-clip"
			],
			/**
			* Text Wrap
			* @see https://tailwindcss.com/docs/text-wrap
			*/
			"text-wrap": [{ text: [
				"wrap",
				"nowrap",
				"balance",
				"pretty"
			] }],
			/**
			* Text Indent
			* @see https://tailwindcss.com/docs/text-indent
			*/
			indent: [{ indent: scaleUnambiguousSpacing() }],
			/**
			* Tab Size
			* @see https://tailwindcss.com/docs/tab-size
			*/
			"tab-size": [{ tab: [
				isInteger,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Vertical Alignment
			* @see https://tailwindcss.com/docs/vertical-align
			*/
			"vertical-align": [{ align: [
				"baseline",
				"top",
				"middle",
				"bottom",
				"text-top",
				"text-bottom",
				"sub",
				"super",
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Whitespace
			* @see https://tailwindcss.com/docs/whitespace
			*/
			whitespace: [{ whitespace: [
				"normal",
				"nowrap",
				"pre",
				"pre-line",
				"pre-wrap",
				"break-spaces"
			] }],
			/**
			* Word Break
			* @see https://tailwindcss.com/docs/word-break
			*/
			break: [{ break: [
				"normal",
				"words",
				"all",
				"keep"
			] }],
			/**
			* Overflow Wrap
			* @see https://tailwindcss.com/docs/overflow-wrap
			*/
			wrap: [{ wrap: [
				"break-word",
				"anywhere",
				"normal"
			] }],
			/**
			* Hyphens
			* @see https://tailwindcss.com/docs/hyphens
			*/
			hyphens: [{ hyphens: [
				"none",
				"manual",
				"auto"
			] }],
			/**
			* Content
			* @see https://tailwindcss.com/docs/content
			*/
			content: [{ content: [
				"none",
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Background Attachment
			* @see https://tailwindcss.com/docs/background-attachment
			*/
			"bg-attachment": [{ bg: [
				"fixed",
				"local",
				"scroll"
			] }],
			/**
			* Background Clip
			* @see https://tailwindcss.com/docs/background-clip
			*/
			"bg-clip": [{ "bg-clip": [
				"border",
				"padding",
				"content",
				"text"
			] }],
			/**
			* Background Origin
			* @see https://tailwindcss.com/docs/background-origin
			*/
			"bg-origin": [{ "bg-origin": [
				"border",
				"padding",
				"content"
			] }],
			/**
			* Background Position
			* @see https://tailwindcss.com/docs/background-position
			*/
			"bg-position": [{ bg: scaleBgPosition() }],
			/**
			* Background Repeat
			* @see https://tailwindcss.com/docs/background-repeat
			*/
			"bg-repeat": [{ bg: scaleBgRepeat() }],
			/**
			* Background Size
			* @see https://tailwindcss.com/docs/background-size
			*/
			"bg-size": [{ bg: scaleBgSize() }],
			/**
			* Background Image
			* @see https://tailwindcss.com/docs/background-image
			*/
			"bg-image": [{ bg: [
				"none",
				{
					linear: [
						{ to: [
							"t",
							"tr",
							"r",
							"br",
							"b",
							"bl",
							"l",
							"tl"
						] },
						isInteger,
						isArbitraryVariable,
						isArbitraryValue
					],
					radial: [
						"",
						isArbitraryVariable,
						isArbitraryValue
					],
					conic: [
						"",
						isInteger,
						isArbitraryVariable,
						isArbitraryValue
					]
				},
				isArbitraryVariableImage,
				isArbitraryImage
			] }],
			/**
			* Background Color
			* @see https://tailwindcss.com/docs/background-color
			*/
			"bg-color": [{ bg: scaleColor() }],
			/**
			* Gradient Color Stops From Position
			* @see https://tailwindcss.com/docs/gradient-color-stops
			*/
			"gradient-from-pos": [{ from: scaleGradientStopPosition() }],
			/**
			* Gradient Color Stops Via Position
			* @see https://tailwindcss.com/docs/gradient-color-stops
			*/
			"gradient-via-pos": [{ via: scaleGradientStopPosition() }],
			/**
			* Gradient Color Stops To Position
			* @see https://tailwindcss.com/docs/gradient-color-stops
			*/
			"gradient-to-pos": [{ to: scaleGradientStopPosition() }],
			/**
			* Gradient Color Stops From
			* @see https://tailwindcss.com/docs/gradient-color-stops
			*/
			"gradient-from": [{ from: scaleColor() }],
			/**
			* Gradient Color Stops Via
			* @see https://tailwindcss.com/docs/gradient-color-stops
			*/
			"gradient-via": [{ via: scaleColor() }],
			/**
			* Gradient Color Stops To
			* @see https://tailwindcss.com/docs/gradient-color-stops
			*/
			"gradient-to": [{ to: scaleColor() }],
			/**
			* Border Radius
			* @see https://tailwindcss.com/docs/border-radius
			*/
			rounded: [{ rounded: scaleRadius() }],
			/**
			* Border Radius Start
			* @see https://tailwindcss.com/docs/border-radius
			*/
			"rounded-s": [{ "rounded-s": scaleRadius() }],
			/**
			* Border Radius End
			* @see https://tailwindcss.com/docs/border-radius
			*/
			"rounded-e": [{ "rounded-e": scaleRadius() }],
			/**
			* Border Radius Top
			* @see https://tailwindcss.com/docs/border-radius
			*/
			"rounded-t": [{ "rounded-t": scaleRadius() }],
			/**
			* Border Radius Right
			* @see https://tailwindcss.com/docs/border-radius
			*/
			"rounded-r": [{ "rounded-r": scaleRadius() }],
			/**
			* Border Radius Bottom
			* @see https://tailwindcss.com/docs/border-radius
			*/
			"rounded-b": [{ "rounded-b": scaleRadius() }],
			/**
			* Border Radius Left
			* @see https://tailwindcss.com/docs/border-radius
			*/
			"rounded-l": [{ "rounded-l": scaleRadius() }],
			/**
			* Border Radius Start Start
			* @see https://tailwindcss.com/docs/border-radius
			*/
			"rounded-ss": [{ "rounded-ss": scaleRadius() }],
			/**
			* Border Radius Start End
			* @see https://tailwindcss.com/docs/border-radius
			*/
			"rounded-se": [{ "rounded-se": scaleRadius() }],
			/**
			* Border Radius End End
			* @see https://tailwindcss.com/docs/border-radius
			*/
			"rounded-ee": [{ "rounded-ee": scaleRadius() }],
			/**
			* Border Radius End Start
			* @see https://tailwindcss.com/docs/border-radius
			*/
			"rounded-es": [{ "rounded-es": scaleRadius() }],
			/**
			* Border Radius Top Left
			* @see https://tailwindcss.com/docs/border-radius
			*/
			"rounded-tl": [{ "rounded-tl": scaleRadius() }],
			/**
			* Border Radius Top Right
			* @see https://tailwindcss.com/docs/border-radius
			*/
			"rounded-tr": [{ "rounded-tr": scaleRadius() }],
			/**
			* Border Radius Bottom Right
			* @see https://tailwindcss.com/docs/border-radius
			*/
			"rounded-br": [{ "rounded-br": scaleRadius() }],
			/**
			* Border Radius Bottom Left
			* @see https://tailwindcss.com/docs/border-radius
			*/
			"rounded-bl": [{ "rounded-bl": scaleRadius() }],
			/**
			* Border Width
			* @see https://tailwindcss.com/docs/border-width
			*/
			"border-w": [{ border: scaleBorderWidth() }],
			/**
			* Border Width Inline
			* @see https://tailwindcss.com/docs/border-width
			*/
			"border-w-x": [{ "border-x": scaleBorderWidth() }],
			/**
			* Border Width Block
			* @see https://tailwindcss.com/docs/border-width
			*/
			"border-w-y": [{ "border-y": scaleBorderWidth() }],
			/**
			* Border Width Inline Start
			* @see https://tailwindcss.com/docs/border-width
			*/
			"border-w-s": [{ "border-s": scaleBorderWidth() }],
			/**
			* Border Width Inline End
			* @see https://tailwindcss.com/docs/border-width
			*/
			"border-w-e": [{ "border-e": scaleBorderWidth() }],
			/**
			* Border Width Block Start
			* @see https://tailwindcss.com/docs/border-width
			*/
			"border-w-bs": [{ "border-bs": scaleBorderWidth() }],
			/**
			* Border Width Block End
			* @see https://tailwindcss.com/docs/border-width
			*/
			"border-w-be": [{ "border-be": scaleBorderWidth() }],
			/**
			* Border Width Top
			* @see https://tailwindcss.com/docs/border-width
			*/
			"border-w-t": [{ "border-t": scaleBorderWidth() }],
			/**
			* Border Width Right
			* @see https://tailwindcss.com/docs/border-width
			*/
			"border-w-r": [{ "border-r": scaleBorderWidth() }],
			/**
			* Border Width Bottom
			* @see https://tailwindcss.com/docs/border-width
			*/
			"border-w-b": [{ "border-b": scaleBorderWidth() }],
			/**
			* Border Width Left
			* @see https://tailwindcss.com/docs/border-width
			*/
			"border-w-l": [{ "border-l": scaleBorderWidth() }],
			/**
			* Divide Width X
			* @see https://tailwindcss.com/docs/border-width#between-children
			*/
			"divide-x": [{ "divide-x": scaleBorderWidth() }],
			/**
			* Divide Width X Reverse
			* @see https://tailwindcss.com/docs/border-width#between-children
			*/
			"divide-x-reverse": ["divide-x-reverse"],
			/**
			* Divide Width Y
			* @see https://tailwindcss.com/docs/border-width#between-children
			*/
			"divide-y": [{ "divide-y": scaleBorderWidth() }],
			/**
			* Divide Width Y Reverse
			* @see https://tailwindcss.com/docs/border-width#between-children
			*/
			"divide-y-reverse": ["divide-y-reverse"],
			/**
			* Border Style
			* @see https://tailwindcss.com/docs/border-style
			*/
			"border-style": [{ border: [
				...scaleLineStyle(),
				"hidden",
				"none"
			] }],
			/**
			* Divide Style
			* @see https://tailwindcss.com/docs/border-style#setting-the-divider-style
			*/
			"divide-style": [{ divide: [
				...scaleLineStyle(),
				"hidden",
				"none"
			] }],
			/**
			* Border Color
			* @see https://tailwindcss.com/docs/border-color
			*/
			"border-color": [{ border: scaleColor() }],
			/**
			* Border Color Inline
			* @see https://tailwindcss.com/docs/border-color
			*/
			"border-color-x": [{ "border-x": scaleColor() }],
			/**
			* Border Color Block
			* @see https://tailwindcss.com/docs/border-color
			*/
			"border-color-y": [{ "border-y": scaleColor() }],
			/**
			* Border Color Inline Start
			* @see https://tailwindcss.com/docs/border-color
			*/
			"border-color-s": [{ "border-s": scaleColor() }],
			/**
			* Border Color Inline End
			* @see https://tailwindcss.com/docs/border-color
			*/
			"border-color-e": [{ "border-e": scaleColor() }],
			/**
			* Border Color Block Start
			* @see https://tailwindcss.com/docs/border-color
			*/
			"border-color-bs": [{ "border-bs": scaleColor() }],
			/**
			* Border Color Block End
			* @see https://tailwindcss.com/docs/border-color
			*/
			"border-color-be": [{ "border-be": scaleColor() }],
			/**
			* Border Color Top
			* @see https://tailwindcss.com/docs/border-color
			*/
			"border-color-t": [{ "border-t": scaleColor() }],
			/**
			* Border Color Right
			* @see https://tailwindcss.com/docs/border-color
			*/
			"border-color-r": [{ "border-r": scaleColor() }],
			/**
			* Border Color Bottom
			* @see https://tailwindcss.com/docs/border-color
			*/
			"border-color-b": [{ "border-b": scaleColor() }],
			/**
			* Border Color Left
			* @see https://tailwindcss.com/docs/border-color
			*/
			"border-color-l": [{ "border-l": scaleColor() }],
			/**
			* Divide Color
			* @see https://tailwindcss.com/docs/divide-color
			*/
			"divide-color": [{ divide: scaleColor() }],
			/**
			* Outline Style
			* @see https://tailwindcss.com/docs/outline-style
			*/
			"outline-style": [{ outline: [
				...scaleLineStyle(),
				"none",
				"hidden"
			] }],
			/**
			* Outline Offset
			* @see https://tailwindcss.com/docs/outline-offset
			*/
			"outline-offset": [{ "outline-offset": [
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Outline Width
			* @see https://tailwindcss.com/docs/outline-width
			*/
			"outline-w": [{ outline: [
				"",
				isNumber,
				isArbitraryVariableLength,
				isArbitraryLength
			] }],
			/**
			* Outline Color
			* @see https://tailwindcss.com/docs/outline-color
			*/
			"outline-color": [{ outline: scaleColor() }],
			/**
			* Box Shadow
			* @see https://tailwindcss.com/docs/box-shadow
			*/
			shadow: [{ shadow: [
				"",
				"inner",
				"none",
				themeShadow,
				isArbitraryVariableShadow,
				isArbitraryShadow
			] }],
			/**
			* Box Shadow Color
			* @see https://tailwindcss.com/docs/box-shadow#setting-the-shadow-color
			*/
			"shadow-color": [{ shadow: scaleColor() }],
			/**
			* Inset Box Shadow
			* @see https://tailwindcss.com/docs/box-shadow#adding-an-inset-shadow
			*/
			"inset-shadow": [{ "inset-shadow": [
				"none",
				themeInsetShadow,
				isArbitraryVariableShadow,
				isArbitraryShadow
			] }],
			/**
			* Inset Box Shadow Color
			* @see https://tailwindcss.com/docs/box-shadow#setting-the-inset-shadow-color
			*/
			"inset-shadow-color": [{ "inset-shadow": scaleColor() }],
			/**
			* Ring Width
			* @see https://tailwindcss.com/docs/box-shadow#adding-a-ring
			*/
			"ring-w": [{ ring: scaleBorderWidth() }],
			/**
			* Ring Width Inset
			* @see https://v3.tailwindcss.com/docs/ring-width#inset-rings
			* @deprecated since Tailwind CSS v4.0.0
			* @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0/packages/tailwindcss/src/utilities.ts#L4158
			*/
			"ring-w-inset": ["ring-inset"],
			/**
			* Ring Color
			* @see https://tailwindcss.com/docs/box-shadow#setting-the-ring-color
			*/
			"ring-color": [{ ring: scaleColor() }],
			/**
			* Ring Offset Width
			* @see https://v3.tailwindcss.com/docs/ring-offset-width
			* @deprecated since Tailwind CSS v4.0.0
			* @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0/packages/tailwindcss/src/utilities.ts#L4158
			*/
			"ring-offset-w": [{ "ring-offset": [isNumber, isArbitraryLength] }],
			/**
			* Ring Offset Color
			* @see https://v3.tailwindcss.com/docs/ring-offset-color
			* @deprecated since Tailwind CSS v4.0.0
			* @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0/packages/tailwindcss/src/utilities.ts#L4158
			*/
			"ring-offset-color": [{ "ring-offset": scaleColor() }],
			/**
			* Inset Ring Width
			* @see https://tailwindcss.com/docs/box-shadow#adding-an-inset-ring
			*/
			"inset-ring-w": [{ "inset-ring": scaleBorderWidth() }],
			/**
			* Inset Ring Color
			* @see https://tailwindcss.com/docs/box-shadow#setting-the-inset-ring-color
			*/
			"inset-ring-color": [{ "inset-ring": scaleColor() }],
			/**
			* Text Shadow
			* @see https://tailwindcss.com/docs/text-shadow
			*/
			"text-shadow": [{ "text-shadow": [
				"none",
				themeTextShadow,
				isArbitraryVariableShadow,
				isArbitraryShadow
			] }],
			/**
			* Text Shadow Color
			* @see https://tailwindcss.com/docs/text-shadow#setting-the-shadow-color
			*/
			"text-shadow-color": [{ "text-shadow": scaleColor() }],
			/**
			* Opacity
			* @see https://tailwindcss.com/docs/opacity
			*/
			opacity: [{ opacity: [
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Mix Blend Mode
			* @see https://tailwindcss.com/docs/mix-blend-mode
			*/
			"mix-blend": [{ "mix-blend": [
				...scaleBlendMode(),
				"plus-darker",
				"plus-lighter"
			] }],
			/**
			* Background Blend Mode
			* @see https://tailwindcss.com/docs/background-blend-mode
			*/
			"bg-blend": [{ "bg-blend": scaleBlendMode() }],
			/**
			* Mask Clip
			* @see https://tailwindcss.com/docs/mask-clip
			*/
			"mask-clip": [{ "mask-clip": [
				"border",
				"padding",
				"content",
				"fill",
				"stroke",
				"view"
			] }, "mask-no-clip"],
			/**
			* Mask Composite
			* @see https://tailwindcss.com/docs/mask-composite
			*/
			"mask-composite": [{ mask: [
				"add",
				"subtract",
				"intersect",
				"exclude"
			] }],
			/**
			* Mask Image
			* @see https://tailwindcss.com/docs/mask-image
			*/
			"mask-image-linear-pos": [{ "mask-linear": [isNumber] }],
			"mask-image-linear-from-pos": [{ "mask-linear-from": scaleMaskImagePosition() }],
			"mask-image-linear-to-pos": [{ "mask-linear-to": scaleMaskImagePosition() }],
			"mask-image-linear-from-color": [{ "mask-linear-from": scaleColor() }],
			"mask-image-linear-to-color": [{ "mask-linear-to": scaleColor() }],
			"mask-image-t-from-pos": [{ "mask-t-from": scaleMaskImagePosition() }],
			"mask-image-t-to-pos": [{ "mask-t-to": scaleMaskImagePosition() }],
			"mask-image-t-from-color": [{ "mask-t-from": scaleColor() }],
			"mask-image-t-to-color": [{ "mask-t-to": scaleColor() }],
			"mask-image-r-from-pos": [{ "mask-r-from": scaleMaskImagePosition() }],
			"mask-image-r-to-pos": [{ "mask-r-to": scaleMaskImagePosition() }],
			"mask-image-r-from-color": [{ "mask-r-from": scaleColor() }],
			"mask-image-r-to-color": [{ "mask-r-to": scaleColor() }],
			"mask-image-b-from-pos": [{ "mask-b-from": scaleMaskImagePosition() }],
			"mask-image-b-to-pos": [{ "mask-b-to": scaleMaskImagePosition() }],
			"mask-image-b-from-color": [{ "mask-b-from": scaleColor() }],
			"mask-image-b-to-color": [{ "mask-b-to": scaleColor() }],
			"mask-image-l-from-pos": [{ "mask-l-from": scaleMaskImagePosition() }],
			"mask-image-l-to-pos": [{ "mask-l-to": scaleMaskImagePosition() }],
			"mask-image-l-from-color": [{ "mask-l-from": scaleColor() }],
			"mask-image-l-to-color": [{ "mask-l-to": scaleColor() }],
			"mask-image-x-from-pos": [{ "mask-x-from": scaleMaskImagePosition() }],
			"mask-image-x-to-pos": [{ "mask-x-to": scaleMaskImagePosition() }],
			"mask-image-x-from-color": [{ "mask-x-from": scaleColor() }],
			"mask-image-x-to-color": [{ "mask-x-to": scaleColor() }],
			"mask-image-y-from-pos": [{ "mask-y-from": scaleMaskImagePosition() }],
			"mask-image-y-to-pos": [{ "mask-y-to": scaleMaskImagePosition() }],
			"mask-image-y-from-color": [{ "mask-y-from": scaleColor() }],
			"mask-image-y-to-color": [{ "mask-y-to": scaleColor() }],
			"mask-image-radial": [{ "mask-radial": [isArbitraryVariable, isArbitraryValue] }],
			"mask-image-radial-from-pos": [{ "mask-radial-from": scaleMaskImagePosition() }],
			"mask-image-radial-to-pos": [{ "mask-radial-to": scaleMaskImagePosition() }],
			"mask-image-radial-from-color": [{ "mask-radial-from": scaleColor() }],
			"mask-image-radial-to-color": [{ "mask-radial-to": scaleColor() }],
			"mask-image-radial-shape": [{ "mask-radial": ["circle", "ellipse"] }],
			"mask-image-radial-size": [{ "mask-radial": [{
				closest: ["side", "corner"],
				farthest: ["side", "corner"]
			}] }],
			"mask-image-radial-pos": [{ "mask-radial-at": scalePosition() }],
			"mask-image-conic-pos": [{ "mask-conic": [isNumber] }],
			"mask-image-conic-from-pos": [{ "mask-conic-from": scaleMaskImagePosition() }],
			"mask-image-conic-to-pos": [{ "mask-conic-to": scaleMaskImagePosition() }],
			"mask-image-conic-from-color": [{ "mask-conic-from": scaleColor() }],
			"mask-image-conic-to-color": [{ "mask-conic-to": scaleColor() }],
			/**
			* Mask Mode
			* @see https://tailwindcss.com/docs/mask-mode
			*/
			"mask-mode": [{ mask: [
				"alpha",
				"luminance",
				"match"
			] }],
			/**
			* Mask Origin
			* @see https://tailwindcss.com/docs/mask-origin
			*/
			"mask-origin": [{ "mask-origin": [
				"border",
				"padding",
				"content",
				"fill",
				"stroke",
				"view"
			] }],
			/**
			* Mask Position
			* @see https://tailwindcss.com/docs/mask-position
			*/
			"mask-position": [{ mask: scaleBgPosition() }],
			/**
			* Mask Repeat
			* @see https://tailwindcss.com/docs/mask-repeat
			*/
			"mask-repeat": [{ mask: scaleBgRepeat() }],
			/**
			* Mask Size
			* @see https://tailwindcss.com/docs/mask-size
			*/
			"mask-size": [{ mask: scaleBgSize() }],
			/**
			* Mask Type
			* @see https://tailwindcss.com/docs/mask-type
			*/
			"mask-type": [{ "mask-type": ["alpha", "luminance"] }],
			/**
			* Mask Image
			* @see https://tailwindcss.com/docs/mask-image
			*/
			"mask-image": [{ mask: [
				"none",
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Filter
			* @see https://tailwindcss.com/docs/filter
			*/
			filter: [{ filter: [
				"",
				"none",
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Blur
			* @see https://tailwindcss.com/docs/blur
			*/
			blur: [{ blur: scaleBlur() }],
			/**
			* Brightness
			* @see https://tailwindcss.com/docs/brightness
			*/
			brightness: [{ brightness: [
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Contrast
			* @see https://tailwindcss.com/docs/contrast
			*/
			contrast: [{ contrast: [
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Drop Shadow
			* @see https://tailwindcss.com/docs/drop-shadow
			*/
			"drop-shadow": [{ "drop-shadow": [
				"",
				"none",
				themeDropShadow,
				isArbitraryVariableShadow,
				isArbitraryShadow
			] }],
			/**
			* Drop Shadow Color
			* @see https://tailwindcss.com/docs/filter-drop-shadow#setting-the-shadow-color
			*/
			"drop-shadow-color": [{ "drop-shadow": scaleColor() }],
			/**
			* Grayscale
			* @see https://tailwindcss.com/docs/grayscale
			*/
			grayscale: [{ grayscale: [
				"",
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Hue Rotate
			* @see https://tailwindcss.com/docs/hue-rotate
			*/
			"hue-rotate": [{ "hue-rotate": [
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Invert
			* @see https://tailwindcss.com/docs/invert
			*/
			invert: [{ invert: [
				"",
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Saturate
			* @see https://tailwindcss.com/docs/saturate
			*/
			saturate: [{ saturate: [
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Sepia
			* @see https://tailwindcss.com/docs/sepia
			*/
			sepia: [{ sepia: [
				"",
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Backdrop Filter
			* @see https://tailwindcss.com/docs/backdrop-filter
			*/
			"backdrop-filter": [{ "backdrop-filter": [
				"",
				"none",
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Backdrop Blur
			* @see https://tailwindcss.com/docs/backdrop-blur
			*/
			"backdrop-blur": [{ "backdrop-blur": scaleBlur() }],
			/**
			* Backdrop Brightness
			* @see https://tailwindcss.com/docs/backdrop-brightness
			*/
			"backdrop-brightness": [{ "backdrop-brightness": [
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Backdrop Contrast
			* @see https://tailwindcss.com/docs/backdrop-contrast
			*/
			"backdrop-contrast": [{ "backdrop-contrast": [
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Backdrop Grayscale
			* @see https://tailwindcss.com/docs/backdrop-grayscale
			*/
			"backdrop-grayscale": [{ "backdrop-grayscale": [
				"",
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Backdrop Hue Rotate
			* @see https://tailwindcss.com/docs/backdrop-hue-rotate
			*/
			"backdrop-hue-rotate": [{ "backdrop-hue-rotate": [
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Backdrop Invert
			* @see https://tailwindcss.com/docs/backdrop-invert
			*/
			"backdrop-invert": [{ "backdrop-invert": [
				"",
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Backdrop Opacity
			* @see https://tailwindcss.com/docs/backdrop-opacity
			*/
			"backdrop-opacity": [{ "backdrop-opacity": [
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Backdrop Saturate
			* @see https://tailwindcss.com/docs/backdrop-saturate
			*/
			"backdrop-saturate": [{ "backdrop-saturate": [
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Backdrop Sepia
			* @see https://tailwindcss.com/docs/backdrop-sepia
			*/
			"backdrop-sepia": [{ "backdrop-sepia": [
				"",
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Border Collapse
			* @see https://tailwindcss.com/docs/border-collapse
			*/
			"border-collapse": [{ border: ["collapse", "separate"] }],
			/**
			* Border Spacing
			* @see https://tailwindcss.com/docs/border-spacing
			*/
			"border-spacing": [{ "border-spacing": scaleUnambiguousSpacing() }],
			/**
			* Border Spacing X
			* @see https://tailwindcss.com/docs/border-spacing
			*/
			"border-spacing-x": [{ "border-spacing-x": scaleUnambiguousSpacing() }],
			/**
			* Border Spacing Y
			* @see https://tailwindcss.com/docs/border-spacing
			*/
			"border-spacing-y": [{ "border-spacing-y": scaleUnambiguousSpacing() }],
			/**
			* Table Layout
			* @see https://tailwindcss.com/docs/table-layout
			*/
			"table-layout": [{ table: ["auto", "fixed"] }],
			/**
			* Caption Side
			* @see https://tailwindcss.com/docs/caption-side
			*/
			caption: [{ caption: ["top", "bottom"] }],
			/**
			* Transition Property
			* @see https://tailwindcss.com/docs/transition-property
			*/
			transition: [{ transition: [
				"",
				"all",
				"colors",
				"opacity",
				"shadow",
				"transform",
				"none",
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Transition Behavior
			* @see https://tailwindcss.com/docs/transition-behavior
			*/
			"transition-behavior": [{ transition: ["normal", "discrete"] }],
			/**
			* Transition Duration
			* @see https://tailwindcss.com/docs/transition-duration
			*/
			duration: [{ duration: [
				isNumber,
				"initial",
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Transition Timing Function
			* @see https://tailwindcss.com/docs/transition-timing-function
			*/
			ease: [{ ease: [
				"linear",
				"initial",
				themeEase,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Transition Delay
			* @see https://tailwindcss.com/docs/transition-delay
			*/
			delay: [{ delay: [
				isNumber,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Animation
			* @see https://tailwindcss.com/docs/animation
			*/
			animate: [{ animate: [
				"none",
				themeAnimate,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Backface Visibility
			* @see https://tailwindcss.com/docs/backface-visibility
			*/
			backface: [{ backface: ["hidden", "visible"] }],
			/**
			* Perspective
			* @see https://tailwindcss.com/docs/perspective
			*/
			perspective: [{ perspective: [
				themePerspective,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Perspective Origin
			* @see https://tailwindcss.com/docs/perspective-origin
			*/
			"perspective-origin": [{ "perspective-origin": scalePositionWithArbitrary() }],
			/**
			* Rotate
			* @see https://tailwindcss.com/docs/rotate
			*/
			rotate: [{ rotate: scaleRotate() }],
			/**
			* Rotate X
			* @see https://tailwindcss.com/docs/rotate
			*/
			"rotate-x": [{ "rotate-x": scaleRotate() }],
			/**
			* Rotate Y
			* @see https://tailwindcss.com/docs/rotate
			*/
			"rotate-y": [{ "rotate-y": scaleRotate() }],
			/**
			* Rotate Z
			* @see https://tailwindcss.com/docs/rotate
			*/
			"rotate-z": [{ "rotate-z": scaleRotate() }],
			/**
			* Scale
			* @see https://tailwindcss.com/docs/scale
			*/
			scale: [{ scale: scaleScale() }],
			/**
			* Scale X
			* @see https://tailwindcss.com/docs/scale
			*/
			"scale-x": [{ "scale-x": scaleScale() }],
			/**
			* Scale Y
			* @see https://tailwindcss.com/docs/scale
			*/
			"scale-y": [{ "scale-y": scaleScale() }],
			/**
			* Scale Z
			* @see https://tailwindcss.com/docs/scale
			*/
			"scale-z": [{ "scale-z": scaleScale() }],
			/**
			* Scale 3D
			* @see https://tailwindcss.com/docs/scale
			*/
			"scale-3d": ["scale-3d"],
			/**
			* Skew
			* @see https://tailwindcss.com/docs/skew
			*/
			skew: [{ skew: scaleSkew() }],
			/**
			* Skew X
			* @see https://tailwindcss.com/docs/skew
			*/
			"skew-x": [{ "skew-x": scaleSkew() }],
			/**
			* Skew Y
			* @see https://tailwindcss.com/docs/skew
			*/
			"skew-y": [{ "skew-y": scaleSkew() }],
			/**
			* Transform
			* @see https://tailwindcss.com/docs/transform
			*/
			transform: [{ transform: [
				isArbitraryVariable,
				isArbitraryValue,
				"",
				"none",
				"gpu",
				"cpu"
			] }],
			/**
			* Transform Origin
			* @see https://tailwindcss.com/docs/transform-origin
			*/
			"transform-origin": [{ origin: scalePositionWithArbitrary() }],
			/**
			* Transform Style
			* @see https://tailwindcss.com/docs/transform-style
			*/
			"transform-style": [{ transform: ["3d", "flat"] }],
			/**
			* Translate
			* @see https://tailwindcss.com/docs/translate
			*/
			translate: [{ translate: scaleTranslate() }],
			/**
			* Translate X
			* @see https://tailwindcss.com/docs/translate
			*/
			"translate-x": [{ "translate-x": scaleTranslate() }],
			/**
			* Translate Y
			* @see https://tailwindcss.com/docs/translate
			*/
			"translate-y": [{ "translate-y": scaleTranslate() }],
			/**
			* Translate Z
			* @see https://tailwindcss.com/docs/translate
			*/
			"translate-z": [{ "translate-z": scaleTranslate() }],
			/**
			* Translate None
			* @see https://tailwindcss.com/docs/translate
			*/
			"translate-none": ["translate-none"],
			/**
			* Zoom
			* @see https://tailwindcss.com/docs/zoom
			*/
			zoom: [{ zoom: [
				isInteger,
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Accent Color
			* @see https://tailwindcss.com/docs/accent-color
			*/
			accent: [{ accent: scaleColor() }],
			/**
			* Appearance
			* @see https://tailwindcss.com/docs/appearance
			*/
			appearance: [{ appearance: ["none", "auto"] }],
			/**
			* Caret Color
			* @see https://tailwindcss.com/docs/just-in-time-mode#caret-color-utilities
			*/
			"caret-color": [{ caret: scaleColor() }],
			/**
			* Color Scheme
			* @see https://tailwindcss.com/docs/color-scheme
			*/
			"color-scheme": [{ scheme: [
				"normal",
				"dark",
				"light",
				"light-dark",
				"only-dark",
				"only-light"
			] }],
			/**
			* Cursor
			* @see https://tailwindcss.com/docs/cursor
			*/
			cursor: [{ cursor: [
				"auto",
				"default",
				"pointer",
				"wait",
				"text",
				"move",
				"help",
				"not-allowed",
				"none",
				"context-menu",
				"progress",
				"cell",
				"crosshair",
				"vertical-text",
				"alias",
				"copy",
				"no-drop",
				"grab",
				"grabbing",
				"all-scroll",
				"col-resize",
				"row-resize",
				"n-resize",
				"e-resize",
				"s-resize",
				"w-resize",
				"ne-resize",
				"nw-resize",
				"se-resize",
				"sw-resize",
				"ew-resize",
				"ns-resize",
				"nesw-resize",
				"nwse-resize",
				"zoom-in",
				"zoom-out",
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Field Sizing
			* @see https://tailwindcss.com/docs/field-sizing
			*/
			"field-sizing": [{ "field-sizing": ["fixed", "content"] }],
			/**
			* Pointer Events
			* @see https://tailwindcss.com/docs/pointer-events
			*/
			"pointer-events": [{ "pointer-events": ["auto", "none"] }],
			/**
			* Resize
			* @see https://tailwindcss.com/docs/resize
			*/
			resize: [{ resize: [
				"none",
				"",
				"y",
				"x"
			] }],
			/**
			* Scroll Behavior
			* @see https://tailwindcss.com/docs/scroll-behavior
			*/
			"scroll-behavior": [{ scroll: ["auto", "smooth"] }],
			/**
			* Scrollbar Thumb Color
			* @see https://tailwindcss.com/docs/scrollbar-color
			*/
			"scrollbar-thumb-color": [{ "scrollbar-thumb": scaleColor() }],
			/**
			* Scrollbar Track Color
			* @see https://tailwindcss.com/docs/scrollbar-color
			*/
			"scrollbar-track-color": [{ "scrollbar-track": scaleColor() }],
			/**
			* Scrollbar Gutter
			* @see https://tailwindcss.com/docs/scrollbar-gutter
			*/
			"scrollbar-gutter": [{ "scrollbar-gutter": [
				"auto",
				"stable",
				"both"
			] }],
			/**
			* Scrollbar Width
			* @see https://tailwindcss.com/docs/scrollbar-width
			*/
			"scrollbar-w": [{ scrollbar: [
				"auto",
				"thin",
				"none"
			] }],
			/**
			* Scroll Margin
			* @see https://tailwindcss.com/docs/scroll-margin
			*/
			"scroll-m": [{ "scroll-m": scaleUnambiguousSpacing() }],
			/**
			* Scroll Margin Inline
			* @see https://tailwindcss.com/docs/scroll-margin
			*/
			"scroll-mx": [{ "scroll-mx": scaleUnambiguousSpacing() }],
			/**
			* Scroll Margin Block
			* @see https://tailwindcss.com/docs/scroll-margin
			*/
			"scroll-my": [{ "scroll-my": scaleUnambiguousSpacing() }],
			/**
			* Scroll Margin Inline Start
			* @see https://tailwindcss.com/docs/scroll-margin
			*/
			"scroll-ms": [{ "scroll-ms": scaleUnambiguousSpacing() }],
			/**
			* Scroll Margin Inline End
			* @see https://tailwindcss.com/docs/scroll-margin
			*/
			"scroll-me": [{ "scroll-me": scaleUnambiguousSpacing() }],
			/**
			* Scroll Margin Block Start
			* @see https://tailwindcss.com/docs/scroll-margin
			*/
			"scroll-mbs": [{ "scroll-mbs": scaleUnambiguousSpacing() }],
			/**
			* Scroll Margin Block End
			* @see https://tailwindcss.com/docs/scroll-margin
			*/
			"scroll-mbe": [{ "scroll-mbe": scaleUnambiguousSpacing() }],
			/**
			* Scroll Margin Top
			* @see https://tailwindcss.com/docs/scroll-margin
			*/
			"scroll-mt": [{ "scroll-mt": scaleUnambiguousSpacing() }],
			/**
			* Scroll Margin Right
			* @see https://tailwindcss.com/docs/scroll-margin
			*/
			"scroll-mr": [{ "scroll-mr": scaleUnambiguousSpacing() }],
			/**
			* Scroll Margin Bottom
			* @see https://tailwindcss.com/docs/scroll-margin
			*/
			"scroll-mb": [{ "scroll-mb": scaleUnambiguousSpacing() }],
			/**
			* Scroll Margin Left
			* @see https://tailwindcss.com/docs/scroll-margin
			*/
			"scroll-ml": [{ "scroll-ml": scaleUnambiguousSpacing() }],
			/**
			* Scroll Padding
			* @see https://tailwindcss.com/docs/scroll-padding
			*/
			"scroll-p": [{ "scroll-p": scaleUnambiguousSpacing() }],
			/**
			* Scroll Padding Inline
			* @see https://tailwindcss.com/docs/scroll-padding
			*/
			"scroll-px": [{ "scroll-px": scaleUnambiguousSpacing() }],
			/**
			* Scroll Padding Block
			* @see https://tailwindcss.com/docs/scroll-padding
			*/
			"scroll-py": [{ "scroll-py": scaleUnambiguousSpacing() }],
			/**
			* Scroll Padding Inline Start
			* @see https://tailwindcss.com/docs/scroll-padding
			*/
			"scroll-ps": [{ "scroll-ps": scaleUnambiguousSpacing() }],
			/**
			* Scroll Padding Inline End
			* @see https://tailwindcss.com/docs/scroll-padding
			*/
			"scroll-pe": [{ "scroll-pe": scaleUnambiguousSpacing() }],
			/**
			* Scroll Padding Block Start
			* @see https://tailwindcss.com/docs/scroll-padding
			*/
			"scroll-pbs": [{ "scroll-pbs": scaleUnambiguousSpacing() }],
			/**
			* Scroll Padding Block End
			* @see https://tailwindcss.com/docs/scroll-padding
			*/
			"scroll-pbe": [{ "scroll-pbe": scaleUnambiguousSpacing() }],
			/**
			* Scroll Padding Top
			* @see https://tailwindcss.com/docs/scroll-padding
			*/
			"scroll-pt": [{ "scroll-pt": scaleUnambiguousSpacing() }],
			/**
			* Scroll Padding Right
			* @see https://tailwindcss.com/docs/scroll-padding
			*/
			"scroll-pr": [{ "scroll-pr": scaleUnambiguousSpacing() }],
			/**
			* Scroll Padding Bottom
			* @see https://tailwindcss.com/docs/scroll-padding
			*/
			"scroll-pb": [{ "scroll-pb": scaleUnambiguousSpacing() }],
			/**
			* Scroll Padding Left
			* @see https://tailwindcss.com/docs/scroll-padding
			*/
			"scroll-pl": [{ "scroll-pl": scaleUnambiguousSpacing() }],
			/**
			* Scroll Snap Align
			* @see https://tailwindcss.com/docs/scroll-snap-align
			*/
			"snap-align": [{ snap: [
				"start",
				"end",
				"center",
				"align-none"
			] }],
			/**
			* Scroll Snap Stop
			* @see https://tailwindcss.com/docs/scroll-snap-stop
			*/
			"snap-stop": [{ snap: ["normal", "always"] }],
			/**
			* Scroll Snap Type
			* @see https://tailwindcss.com/docs/scroll-snap-type
			*/
			"snap-type": [{ snap: [
				"none",
				"x",
				"y",
				"both"
			] }],
			/**
			* Scroll Snap Type Strictness
			* @see https://tailwindcss.com/docs/scroll-snap-type
			*/
			"snap-strictness": [{ snap: ["mandatory", "proximity"] }],
			/**
			* Touch Action
			* @see https://tailwindcss.com/docs/touch-action
			*/
			touch: [{ touch: [
				"auto",
				"none",
				"manipulation"
			] }],
			/**
			* Touch Action X
			* @see https://tailwindcss.com/docs/touch-action
			*/
			"touch-x": [{ "touch-pan": [
				"x",
				"left",
				"right"
			] }],
			/**
			* Touch Action Y
			* @see https://tailwindcss.com/docs/touch-action
			*/
			"touch-y": [{ "touch-pan": [
				"y",
				"up",
				"down"
			] }],
			/**
			* Touch Action Pinch Zoom
			* @see https://tailwindcss.com/docs/touch-action
			*/
			"touch-pz": ["touch-pinch-zoom"],
			/**
			* User Select
			* @see https://tailwindcss.com/docs/user-select
			*/
			select: [{ select: [
				"none",
				"text",
				"all",
				"auto"
			] }],
			/**
			* Will Change
			* @see https://tailwindcss.com/docs/will-change
			*/
			"will-change": [{ "will-change": [
				"auto",
				"scroll",
				"contents",
				"transform",
				isArbitraryVariable,
				isArbitraryValue
			] }],
			/**
			* Fill
			* @see https://tailwindcss.com/docs/fill
			*/
			fill: [{ fill: ["none", ...scaleColor()] }],
			/**
			* Stroke Width
			* @see https://tailwindcss.com/docs/stroke-width
			*/
			"stroke-w": [{ stroke: [
				isNumber,
				isArbitraryVariableLength,
				isArbitraryLength,
				isArbitraryNumber
			] }],
			/**
			* Stroke
			* @see https://tailwindcss.com/docs/stroke
			*/
			stroke: [{ stroke: ["none", ...scaleColor()] }],
			/**
			* Forced Color Adjust
			* @see https://tailwindcss.com/docs/forced-color-adjust
			*/
			"forced-color-adjust": [{ "forced-color-adjust": ["auto", "none"] }]
		},
		conflictingClassGroups: {
			"container-named": ["container-type"],
			overflow: ["overflow-x", "overflow-y"],
			overscroll: ["overscroll-x", "overscroll-y"],
			inset: [
				"inset-x",
				"inset-y",
				"inset-bs",
				"inset-be",
				"start",
				"end",
				"top",
				"right",
				"bottom",
				"left"
			],
			"inset-x": [
				"start",
				"end",
				"right",
				"left"
			],
			"inset-y": [
				"inset-bs",
				"inset-be",
				"top",
				"bottom"
			],
			flex: [
				"basis",
				"grow",
				"shrink"
			],
			gap: ["gap-x", "gap-y"],
			p: [
				"px",
				"py",
				"ps",
				"pe",
				"pbs",
				"pbe",
				"pt",
				"pr",
				"pb",
				"pl"
			],
			px: [
				"ps",
				"pe",
				"pr",
				"pl"
			],
			py: [
				"pbs",
				"pbe",
				"pt",
				"pb"
			],
			m: [
				"mx",
				"my",
				"ms",
				"me",
				"mbs",
				"mbe",
				"mt",
				"mr",
				"mb",
				"ml"
			],
			mx: [
				"ms",
				"me",
				"mr",
				"ml"
			],
			my: [
				"mbs",
				"mbe",
				"mt",
				"mb"
			],
			size: ["w", "h"],
			"font-size": ["leading"],
			"fvn-normal": [
				"fvn-ordinal",
				"fvn-slashed-zero",
				"fvn-figure",
				"fvn-spacing",
				"fvn-fraction"
			],
			"fvn-ordinal": ["fvn-normal"],
			"fvn-slashed-zero": ["fvn-normal"],
			"fvn-figure": ["fvn-normal"],
			"fvn-spacing": ["fvn-normal"],
			"fvn-fraction": ["fvn-normal"],
			"line-clamp": ["display", "overflow"],
			rounded: [
				"rounded-s",
				"rounded-e",
				"rounded-t",
				"rounded-r",
				"rounded-b",
				"rounded-l",
				"rounded-ss",
				"rounded-se",
				"rounded-ee",
				"rounded-es",
				"rounded-tl",
				"rounded-tr",
				"rounded-br",
				"rounded-bl"
			],
			"rounded-s": ["rounded-ss", "rounded-es"],
			"rounded-e": ["rounded-se", "rounded-ee"],
			"rounded-t": ["rounded-tl", "rounded-tr"],
			"rounded-r": ["rounded-tr", "rounded-br"],
			"rounded-b": ["rounded-br", "rounded-bl"],
			"rounded-l": ["rounded-tl", "rounded-bl"],
			"border-spacing": ["border-spacing-x", "border-spacing-y"],
			"border-w": [
				"border-w-x",
				"border-w-y",
				"border-w-s",
				"border-w-e",
				"border-w-bs",
				"border-w-be",
				"border-w-t",
				"border-w-r",
				"border-w-b",
				"border-w-l"
			],
			"border-w-x": [
				"border-w-s",
				"border-w-e",
				"border-w-r",
				"border-w-l"
			],
			"border-w-y": [
				"border-w-bs",
				"border-w-be",
				"border-w-t",
				"border-w-b"
			],
			"border-color": [
				"border-color-x",
				"border-color-y",
				"border-color-s",
				"border-color-e",
				"border-color-bs",
				"border-color-be",
				"border-color-t",
				"border-color-r",
				"border-color-b",
				"border-color-l"
			],
			"border-color-x": [
				"border-color-s",
				"border-color-e",
				"border-color-r",
				"border-color-l"
			],
			"border-color-y": [
				"border-color-bs",
				"border-color-be",
				"border-color-t",
				"border-color-b"
			],
			translate: [
				"translate-x",
				"translate-y",
				"translate-none"
			],
			"translate-none": [
				"translate",
				"translate-x",
				"translate-y",
				"translate-z"
			],
			"scroll-m": [
				"scroll-mx",
				"scroll-my",
				"scroll-ms",
				"scroll-me",
				"scroll-mbs",
				"scroll-mbe",
				"scroll-mt",
				"scroll-mr",
				"scroll-mb",
				"scroll-ml"
			],
			"scroll-mx": [
				"scroll-ms",
				"scroll-me",
				"scroll-mr",
				"scroll-ml"
			],
			"scroll-my": [
				"scroll-mbs",
				"scroll-mbe",
				"scroll-mt",
				"scroll-mb"
			],
			"scroll-p": [
				"scroll-px",
				"scroll-py",
				"scroll-ps",
				"scroll-pe",
				"scroll-pbs",
				"scroll-pbe",
				"scroll-pt",
				"scroll-pr",
				"scroll-pb",
				"scroll-pl"
			],
			"scroll-px": [
				"scroll-ps",
				"scroll-pe",
				"scroll-pr",
				"scroll-pl"
			],
			"scroll-py": [
				"scroll-pbs",
				"scroll-pbe",
				"scroll-pt",
				"scroll-pb"
			],
			touch: [
				"touch-x",
				"touch-y",
				"touch-pz"
			],
			"touch-x": ["touch"],
			"touch-y": ["touch"],
			"touch-pz": ["touch"]
		},
		conflictingClassGroupModifiers: { "font-size": ["leading"] },
		postfixLookupClassGroups: ["container-type"],
		orderSensitiveModifiers: [
			"*",
			"**",
			"after",
			"backdrop",
			"before",
			"details-content",
			"file",
			"first-letter",
			"first-line",
			"marker",
			"placeholder",
			"selection"
		]
	};
};
var twMerge = /*#__PURE__*/ createTailwindMerge(getDefaultConfig);
//#endregion
//#region src/lib/utils.ts
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
//#endregion
export { __commonJSMin as $, longDate as A, serviceItem as B, expenseTotal as C, invoiceTotals as D, goalAccount as E, previousMonth as F, today as G, setDB as H, reconcileProjects as I, useDB as J, uid as K, recordPayment as L, needsFollowUp as M, nextInvoiceNo as N, invoiceView as O, parseTimelineDays as P, require_react as Q, resetDB as R, expenseCategoriesFor as S, getDB as T, shortDate as U, setCategoryLimit as V, toUSD as W, require_jsx_runtime as X, createLucideIcon as Y, require_react_dom as Z, categoryTotals as _, CLIENT_TYPES as a, documentKind as b, PAY_METHODS as c, PRICING_UNITS as d, __exportAll as et, PROJECT_STATUSES as f, categoryLimit as g, cashReceived as h, CLIENT_STATUSES as i, money as j, isInvoice as k, PERSONAL_CATEGORIES as l, cashFlowSeries as m, clsx as n, DOCUMENT_TYPES as o, addDays as p, updateProject as q, CLIENT_SOURCES as r, EXPENSE_CATEGORIES as s, cn as t, __toESM as tt, PILLARS as u, convertDocument as v, fileToDataUrl as w, expenseAccount as x, deletePayment as y, saveDocument as z };
