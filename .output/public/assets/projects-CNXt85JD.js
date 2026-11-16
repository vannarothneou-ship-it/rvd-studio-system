import { B as toUSD, D as isInvoice, E as invoiceView, G as createLucideIcon, H as uid, J as require_react, K as require_jsx_runtime, M as parseTimelineDays, R as setDB, U as updateProject, V as today, W as useDB, Z as __toESM, f as PROJECT_STATUSES, k as money, o as DOCUMENT_TYPES, p as addDays$1, q as require_react_dom, t as cn, v as documentKind, z as shortDate } from "./utils-Cz-OEK7u.js";
import { t as Link } from "./link-C-cvVHqO.js";
import { t as useNavigate } from "./useNavigate-Crg0b49_.js";
import { i as Glass, l as Stat, n as Empty, o as PageHeader, s as Pill, t as Btn } from "./ui-Cikv6Nuk.js";
import { t as Plus } from "./plus-CPmKyuxY.js";
import { a as toast, i as FileText } from "./index-BidqNL8F.js";
import { n as nextCode, t as EditModal } from "./Crud-Cf0OYseA.js";
/**
* @license lucide-react v0.575.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var CalendarDays = createLucideIcon("calendar-days", [
	["path", {
		d: "M8 2v4",
		key: "1cmpym"
	}],
	["path", {
		d: "M16 2v4",
		key: "4m81vk"
	}],
	["rect", {
		width: "18",
		height: "18",
		x: "3",
		y: "4",
		rx: "2",
		key: "1hopcy"
	}],
	["path", {
		d: "M3 10h18",
		key: "8toen8"
	}],
	["path", {
		d: "M8 14h.01",
		key: "6423bh"
	}],
	["path", {
		d: "M12 14h.01",
		key: "1etili"
	}],
	["path", {
		d: "M16 14h.01",
		key: "1gbofw"
	}],
	["path", {
		d: "M8 18h.01",
		key: "lrp35t"
	}],
	["path", {
		d: "M12 18h.01",
		key: "mhygvu"
	}],
	["path", {
		d: "M16 18h.01",
		key: "kzsmim"
	}]
]);
/**
* @license lucide-react v0.575.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Columns3 = createLucideIcon("columns-3", [
	["rect", {
		width: "18",
		height: "18",
		x: "3",
		y: "3",
		rx: "2",
		key: "afitv7"
	}],
	["path", {
		d: "M9 3v18",
		key: "fh3hqa"
	}],
	["path", {
		d: "M15 3v18",
		key: "14nvp0"
	}]
]);
/**
* @license lucide-react v0.575.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var GripVertical = createLucideIcon("grip-vertical", [
	["circle", {
		cx: "9",
		cy: "12",
		r: "1",
		key: "1vctgf"
	}],
	["circle", {
		cx: "9",
		cy: "5",
		r: "1",
		key: "hp0tcf"
	}],
	["circle", {
		cx: "9",
		cy: "19",
		r: "1",
		key: "fkjjf6"
	}],
	["circle", {
		cx: "15",
		cy: "12",
		r: "1",
		key: "1tmaij"
	}],
	["circle", {
		cx: "15",
		cy: "5",
		r: "1",
		key: "19l28e"
	}],
	["circle", {
		cx: "15",
		cy: "19",
		r: "1",
		key: "f4zoj3"
	}]
]);
/**
* @license lucide-react v0.575.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var List = createLucideIcon("list", [
	["path", {
		d: "M3 5h.01",
		key: "18ugdj"
	}],
	["path", {
		d: "M3 12h.01",
		key: "nlz23k"
	}],
	["path", {
		d: "M3 19h.01",
		key: "noohij"
	}],
	["path", {
		d: "M8 5h13",
		key: "1pao27"
	}],
	["path", {
		d: "M8 12h13",
		key: "1za7za"
	}],
	["path", {
		d: "M8 19h13",
		key: "m83p4d"
	}]
]);
//#endregion
//#region node_modules/@dnd-kit/utilities/dist/utilities.esm.js
var import_react_dom = /* @__PURE__ */ __toESM(require_react_dom());
var import_react = /* @__PURE__ */ __toESM(require_react());
var canUseDOM = typeof window !== "undefined" && typeof window.document !== "undefined" && typeof window.document.createElement !== "undefined";
function isWindow(element) {
	const elementString = Object.prototype.toString.call(element);
	return elementString === "[object Window]" || elementString === "[object global]";
}
function isNode(node) {
	return "nodeType" in node;
}
function getWindow(target) {
	var _target$ownerDocument, _target$ownerDocument2;
	if (!target) return window;
	if (isWindow(target)) return target;
	if (!isNode(target)) return window;
	return (_target$ownerDocument = (_target$ownerDocument2 = target.ownerDocument) == null ? void 0 : _target$ownerDocument2.defaultView) != null ? _target$ownerDocument : window;
}
function isDocument(node) {
	const { Document } = getWindow(node);
	return node instanceof Document;
}
function isHTMLElement(node) {
	if (isWindow(node)) return false;
	return node instanceof getWindow(node).HTMLElement;
}
function isSVGElement(node) {
	return node instanceof getWindow(node).SVGElement;
}
function getOwnerDocument(target) {
	if (!target) return document;
	if (isWindow(target)) return target.document;
	if (!isNode(target)) return document;
	if (isDocument(target)) return target;
	if (isHTMLElement(target) || isSVGElement(target)) return target.ownerDocument;
	return document;
}
/**
* A hook that resolves to useEffect on the server and useLayoutEffect on the client
* @param callback {function} Callback function that is invoked when the dependencies of the hook change
*/
var useIsomorphicLayoutEffect = canUseDOM ? import_react.useLayoutEffect : import_react.useEffect;
function useEvent(handler) {
	const handlerRef = (0, import_react.useRef)(handler);
	useIsomorphicLayoutEffect(() => {
		handlerRef.current = handler;
	});
	return (0, import_react.useCallback)(function() {
		for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) args[_key] = arguments[_key];
		return handlerRef.current == null ? void 0 : handlerRef.current(...args);
	}, []);
}
function useInterval() {
	const intervalRef = (0, import_react.useRef)(null);
	return [(0, import_react.useCallback)((listener, duration) => {
		intervalRef.current = setInterval(listener, duration);
	}, []), (0, import_react.useCallback)(() => {
		if (intervalRef.current !== null) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		}
	}, [])];
}
function useLatestValue(value, dependencies) {
	if (dependencies === void 0) dependencies = [value];
	const valueRef = (0, import_react.useRef)(value);
	useIsomorphicLayoutEffect(() => {
		if (valueRef.current !== value) valueRef.current = value;
	}, dependencies);
	return valueRef;
}
function useLazyMemo(callback, dependencies) {
	const valueRef = (0, import_react.useRef)();
	return (0, import_react.useMemo)(() => {
		const newValue = callback(valueRef.current);
		valueRef.current = newValue;
		return newValue;
	}, [...dependencies]);
}
function useNodeRef(onChange) {
	const onChangeHandler = useEvent(onChange);
	const node = (0, import_react.useRef)(null);
	return [node, (0, import_react.useCallback)((element) => {
		if (element !== node.current) onChangeHandler?.(element, node.current);
		node.current = element;
	}, [])];
}
function usePrevious(value) {
	const ref = (0, import_react.useRef)();
	(0, import_react.useEffect)(() => {
		ref.current = value;
	}, [value]);
	return ref.current;
}
var ids = {};
function useUniqueId(prefix, value) {
	return (0, import_react.useMemo)(() => {
		if (value) return value;
		const id = ids[prefix] == null ? 0 : ids[prefix] + 1;
		ids[prefix] = id;
		return prefix + "-" + id;
	}, [prefix, value]);
}
function createAdjustmentFn(modifier) {
	return function(object) {
		for (var _len = arguments.length, adjustments = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) adjustments[_key - 1] = arguments[_key];
		return adjustments.reduce((accumulator, adjustment) => {
			const entries = Object.entries(adjustment);
			for (const [key, valueAdjustment] of entries) {
				const value = accumulator[key];
				if (value != null) accumulator[key] = value + modifier * valueAdjustment;
			}
			return accumulator;
		}, { ...object });
	};
}
var add = /*#__PURE__*/ createAdjustmentFn(1);
var subtract = /*#__PURE__*/ createAdjustmentFn(-1);
function hasViewportRelativeCoordinates(event) {
	return "clientX" in event && "clientY" in event;
}
function isKeyboardEvent(event) {
	if (!event) return false;
	const { KeyboardEvent } = getWindow(event.target);
	return KeyboardEvent && event instanceof KeyboardEvent;
}
function isTouchEvent(event) {
	if (!event) return false;
	const { TouchEvent } = getWindow(event.target);
	return TouchEvent && event instanceof TouchEvent;
}
/**
* Returns the normalized x and y coordinates for mouse and touch events.
*/
function getEventCoordinates(event) {
	if (isTouchEvent(event)) {
		if (event.touches && event.touches.length) {
			const { clientX: x, clientY: y } = event.touches[0];
			return {
				x,
				y
			};
		} else if (event.changedTouches && event.changedTouches.length) {
			const { clientX: x, clientY: y } = event.changedTouches[0];
			return {
				x,
				y
			};
		}
	}
	if (hasViewportRelativeCoordinates(event)) return {
		x: event.clientX,
		y: event.clientY
	};
	return null;
}
var CSS = /*#__PURE__*/ Object.freeze({
	Translate: { toString(transform) {
		if (!transform) return;
		const { x, y } = transform;
		return "translate3d(" + (x ? Math.round(x) : 0) + "px, " + (y ? Math.round(y) : 0) + "px, 0)";
	} },
	Scale: { toString(transform) {
		if (!transform) return;
		const { scaleX, scaleY } = transform;
		return "scaleX(" + scaleX + ") scaleY(" + scaleY + ")";
	} },
	Transform: { toString(transform) {
		if (!transform) return;
		return [CSS.Translate.toString(transform), CSS.Scale.toString(transform)].join(" ");
	} },
	Transition: { toString(_ref) {
		let { property, duration, easing } = _ref;
		return property + " " + duration + "ms " + easing;
	} }
});
var SELECTOR = "a,frame,iframe,input:not([type=hidden]):not(:disabled),select:not(:disabled),textarea:not(:disabled),button:not(:disabled),*[tabindex]";
function findFirstFocusableNode(element) {
	if (element.matches(SELECTOR)) return element;
	return element.querySelector(SELECTOR);
}
//#endregion
//#region node_modules/@dnd-kit/accessibility/dist/accessibility.esm.js
var hiddenStyles = { display: "none" };
function HiddenText(_ref) {
	let { id, value } = _ref;
	return import_react.createElement("div", {
		id,
		style: hiddenStyles
	}, value);
}
function LiveRegion(_ref) {
	let { id, announcement, ariaLiveType = "assertive" } = _ref;
	return import_react.createElement("div", {
		id,
		style: {
			position: "fixed",
			top: 0,
			left: 0,
			width: 1,
			height: 1,
			margin: -1,
			border: 0,
			padding: 0,
			overflow: "hidden",
			clip: "rect(0 0 0 0)",
			clipPath: "inset(100%)",
			whiteSpace: "nowrap"
		},
		role: "status",
		"aria-live": ariaLiveType,
		"aria-atomic": true
	}, announcement);
}
function useAnnouncement() {
	const [announcement, setAnnouncement] = (0, import_react.useState)("");
	return {
		announce: (0, import_react.useCallback)((value) => {
			if (value != null) setAnnouncement(value);
		}, []),
		announcement
	};
}
//#endregion
//#region node_modules/@dnd-kit/core/dist/core.esm.js
var DndMonitorContext = /*#__PURE__*/ (0, import_react.createContext)(null);
function useDndMonitor(listener) {
	const registerListener = (0, import_react.useContext)(DndMonitorContext);
	(0, import_react.useEffect)(() => {
		if (!registerListener) throw new Error("useDndMonitor must be used within a children of <DndContext>");
		return registerListener(listener);
	}, [listener, registerListener]);
}
function useDndMonitorProvider() {
	const [listeners] = (0, import_react.useState)(() => /* @__PURE__ */ new Set());
	const registerListener = (0, import_react.useCallback)((listener) => {
		listeners.add(listener);
		return () => listeners.delete(listener);
	}, [listeners]);
	return [(0, import_react.useCallback)((_ref) => {
		let { type, event } = _ref;
		listeners.forEach((listener) => {
			var _listener$type;
			return (_listener$type = listener[type]) == null ? void 0 : _listener$type.call(listener, event);
		});
	}, [listeners]), registerListener];
}
var defaultScreenReaderInstructions = { draggable: "\n    To pick up a draggable item, press the space bar.\n    While dragging, use the arrow keys to move the item.\n    Press space again to drop the item in its new position, or press escape to cancel.\n  " };
var defaultAnnouncements = {
	onDragStart(_ref) {
		let { active } = _ref;
		return "Picked up draggable item " + active.id + ".";
	},
	onDragOver(_ref2) {
		let { active, over } = _ref2;
		if (over) return "Draggable item " + active.id + " was moved over droppable area " + over.id + ".";
		return "Draggable item " + active.id + " is no longer over a droppable area.";
	},
	onDragEnd(_ref3) {
		let { active, over } = _ref3;
		if (over) return "Draggable item " + active.id + " was dropped over droppable area " + over.id;
		return "Draggable item " + active.id + " was dropped.";
	},
	onDragCancel(_ref4) {
		let { active } = _ref4;
		return "Dragging was cancelled. Draggable item " + active.id + " was dropped.";
	}
};
function Accessibility(_ref) {
	let { announcements = defaultAnnouncements, container, hiddenTextDescribedById, screenReaderInstructions = defaultScreenReaderInstructions } = _ref;
	const { announce, announcement } = useAnnouncement();
	const liveRegionId = useUniqueId("DndLiveRegion");
	const [mounted, setMounted] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setMounted(true);
	}, []);
	useDndMonitor((0, import_react.useMemo)(() => ({
		onDragStart(_ref2) {
			let { active } = _ref2;
			announce(announcements.onDragStart({ active }));
		},
		onDragMove(_ref3) {
			let { active, over } = _ref3;
			if (announcements.onDragMove) announce(announcements.onDragMove({
				active,
				over
			}));
		},
		onDragOver(_ref4) {
			let { active, over } = _ref4;
			announce(announcements.onDragOver({
				active,
				over
			}));
		},
		onDragEnd(_ref5) {
			let { active, over } = _ref5;
			announce(announcements.onDragEnd({
				active,
				over
			}));
		},
		onDragCancel(_ref6) {
			let { active, over } = _ref6;
			announce(announcements.onDragCancel({
				active,
				over
			}));
		}
	}), [announce, announcements]));
	if (!mounted) return null;
	const markup = import_react.createElement(import_react.Fragment, null, import_react.createElement(HiddenText, {
		id: hiddenTextDescribedById,
		value: screenReaderInstructions.draggable
	}), import_react.createElement(LiveRegion, {
		id: liveRegionId,
		announcement
	}));
	return container ? (0, import_react_dom.createPortal)(markup, container) : markup;
}
var Action;
(function(Action) {
	Action["DragStart"] = "dragStart";
	Action["DragMove"] = "dragMove";
	Action["DragEnd"] = "dragEnd";
	Action["DragCancel"] = "dragCancel";
	Action["DragOver"] = "dragOver";
	Action["RegisterDroppable"] = "registerDroppable";
	Action["SetDroppableDisabled"] = "setDroppableDisabled";
	Action["UnregisterDroppable"] = "unregisterDroppable";
})(Action || (Action = {}));
function noop() {}
function useSensor(sensor, options) {
	return (0, import_react.useMemo)(() => ({
		sensor,
		options: options != null ? options : {}
	}), [sensor, options]);
}
function useSensors() {
	for (var _len = arguments.length, sensors = new Array(_len), _key = 0; _key < _len; _key++) sensors[_key] = arguments[_key];
	return (0, import_react.useMemo)(() => [...sensors].filter((sensor) => sensor != null), [...sensors]);
}
var defaultCoordinates = /*#__PURE__*/ Object.freeze({
	x: 0,
	y: 0
});
function getRelativeTransformOrigin(event, rect) {
	const eventCoordinates = getEventCoordinates(event);
	if (!eventCoordinates) return "0 0";
	const transformOrigin = {
		x: (eventCoordinates.x - rect.left) / rect.width * 100,
		y: (eventCoordinates.y - rect.top) / rect.height * 100
	};
	return transformOrigin.x + "% " + transformOrigin.y + "%";
}
/**
* Sort collisions from greatest to smallest value
*/
function sortCollisionsDesc(_ref3, _ref4) {
	let { data: { value: a } } = _ref3;
	let { data: { value: b } } = _ref4;
	return b - a;
}
function getFirstCollision(collisions, property) {
	if (!collisions || collisions.length === 0) return null;
	const [firstCollision] = collisions;
	return property ? firstCollision[property] : firstCollision;
}
/**
* Returns the intersecting rectangle area between two rectangles
*/
function getIntersectionRatio(entry, target) {
	const top = Math.max(target.top, entry.top);
	const left = Math.max(target.left, entry.left);
	const right = Math.min(target.left + target.width, entry.left + entry.width);
	const bottom = Math.min(target.top + target.height, entry.top + entry.height);
	const width = right - left;
	const height = bottom - top;
	if (left < right && top < bottom) {
		const targetArea = target.width * target.height;
		const entryArea = entry.width * entry.height;
		const intersectionArea = width * height;
		const intersectionRatio = intersectionArea / (targetArea + entryArea - intersectionArea);
		return Number(intersectionRatio.toFixed(4));
	}
	return 0;
}
/**
* Returns the rectangles that has the greatest intersection area with a given
* rectangle in an array of rectangles.
*/
var rectIntersection = (_ref) => {
	let { collisionRect, droppableRects, droppableContainers } = _ref;
	const collisions = [];
	for (const droppableContainer of droppableContainers) {
		const { id } = droppableContainer;
		const rect = droppableRects.get(id);
		if (rect) {
			const intersectionRatio = getIntersectionRatio(rect, collisionRect);
			if (intersectionRatio > 0) collisions.push({
				id,
				data: {
					droppableContainer,
					value: intersectionRatio
				}
			});
		}
	}
	return collisions.sort(sortCollisionsDesc);
};
function adjustScale(transform, rect1, rect2) {
	return {
		...transform,
		scaleX: rect1 && rect2 ? rect1.width / rect2.width : 1,
		scaleY: rect1 && rect2 ? rect1.height / rect2.height : 1
	};
}
function getRectDelta(rect1, rect2) {
	return rect1 && rect2 ? {
		x: rect1.left - rect2.left,
		y: rect1.top - rect2.top
	} : defaultCoordinates;
}
function createRectAdjustmentFn(modifier) {
	return function adjustClientRect(rect) {
		for (var _len = arguments.length, adjustments = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) adjustments[_key - 1] = arguments[_key];
		return adjustments.reduce((acc, adjustment) => ({
			...acc,
			top: acc.top + modifier * adjustment.y,
			bottom: acc.bottom + modifier * adjustment.y,
			left: acc.left + modifier * adjustment.x,
			right: acc.right + modifier * adjustment.x
		}), { ...rect });
	};
}
var getAdjustedRect = /*#__PURE__*/ createRectAdjustmentFn(1);
function parseTransform(transform) {
	if (transform.startsWith("matrix3d(")) {
		const transformArray = transform.slice(9, -1).split(/, /);
		return {
			x: +transformArray[12],
			y: +transformArray[13],
			scaleX: +transformArray[0],
			scaleY: +transformArray[5]
		};
	} else if (transform.startsWith("matrix(")) {
		const transformArray = transform.slice(7, -1).split(/, /);
		return {
			x: +transformArray[4],
			y: +transformArray[5],
			scaleX: +transformArray[0],
			scaleY: +transformArray[3]
		};
	}
	return null;
}
function inverseTransform(rect, transform, transformOrigin) {
	const parsedTransform = parseTransform(transform);
	if (!parsedTransform) return rect;
	const { scaleX, scaleY, x: translateX, y: translateY } = parsedTransform;
	const x = rect.left - translateX - (1 - scaleX) * parseFloat(transformOrigin);
	const y = rect.top - translateY - (1 - scaleY) * parseFloat(transformOrigin.slice(transformOrigin.indexOf(" ") + 1));
	const w = scaleX ? rect.width / scaleX : rect.width;
	const h = scaleY ? rect.height / scaleY : rect.height;
	return {
		width: w,
		height: h,
		top: y,
		right: x + w,
		bottom: y + h,
		left: x
	};
}
var defaultOptions = { ignoreTransform: false };
/**
* Returns the bounding client rect of an element relative to the viewport.
*/
function getClientRect(element, options) {
	if (options === void 0) options = defaultOptions;
	let rect = element.getBoundingClientRect();
	if (options.ignoreTransform) {
		const { transform, transformOrigin } = getWindow(element).getComputedStyle(element);
		if (transform) rect = inverseTransform(rect, transform, transformOrigin);
	}
	const { top, left, width, height, bottom, right } = rect;
	return {
		top,
		left,
		width,
		height,
		bottom,
		right
	};
}
/**
* Returns the bounding client rect of an element relative to the viewport.
*
* @remarks
* The ClientRect returned by this method does not take into account transforms
* applied to the element it measures.
*
*/
function getTransformAgnosticClientRect(element) {
	return getClientRect(element, { ignoreTransform: true });
}
function getWindowClientRect(element) {
	const width = element.innerWidth;
	const height = element.innerHeight;
	return {
		top: 0,
		left: 0,
		right: width,
		bottom: height,
		width,
		height
	};
}
function isFixed(node, computedStyle) {
	if (computedStyle === void 0) computedStyle = getWindow(node).getComputedStyle(node);
	return computedStyle.position === "fixed";
}
function isScrollable(element, computedStyle) {
	if (computedStyle === void 0) computedStyle = getWindow(element).getComputedStyle(element);
	const overflowRegex = /(auto|scroll|overlay)/;
	return [
		"overflow",
		"overflowX",
		"overflowY"
	].some((property) => {
		const value = computedStyle[property];
		return typeof value === "string" ? overflowRegex.test(value) : false;
	});
}
function getScrollableAncestors(element, limit) {
	const scrollParents = [];
	function findScrollableAncestors(node) {
		if (limit != null && scrollParents.length >= limit) return scrollParents;
		if (!node) return scrollParents;
		if (isDocument(node) && node.scrollingElement != null && !scrollParents.includes(node.scrollingElement)) {
			scrollParents.push(node.scrollingElement);
			return scrollParents;
		}
		if (!isHTMLElement(node) || isSVGElement(node)) return scrollParents;
		if (scrollParents.includes(node)) return scrollParents;
		const computedStyle = getWindow(element).getComputedStyle(node);
		if (node !== element) {
			if (isScrollable(node, computedStyle)) scrollParents.push(node);
		}
		if (isFixed(node, computedStyle)) return scrollParents;
		return findScrollableAncestors(node.parentNode);
	}
	if (!element) return scrollParents;
	return findScrollableAncestors(element);
}
function getFirstScrollableAncestor(node) {
	const [firstScrollableAncestor] = getScrollableAncestors(node, 1);
	return firstScrollableAncestor != null ? firstScrollableAncestor : null;
}
function getScrollableElement(element) {
	if (!canUseDOM || !element) return null;
	if (isWindow(element)) return element;
	if (!isNode(element)) return null;
	if (isDocument(element) || element === getOwnerDocument(element).scrollingElement) return window;
	if (isHTMLElement(element)) return element;
	return null;
}
function getScrollXCoordinate(element) {
	if (isWindow(element)) return element.scrollX;
	return element.scrollLeft;
}
function getScrollYCoordinate(element) {
	if (isWindow(element)) return element.scrollY;
	return element.scrollTop;
}
function getScrollCoordinates(element) {
	return {
		x: getScrollXCoordinate(element),
		y: getScrollYCoordinate(element)
	};
}
var Direction;
(function(Direction) {
	Direction[Direction["Forward"] = 1] = "Forward";
	Direction[Direction["Backward"] = -1] = "Backward";
})(Direction || (Direction = {}));
function isDocumentScrollingElement(element) {
	if (!canUseDOM || !element) return false;
	return element === document.scrollingElement;
}
function getScrollPosition(scrollingContainer) {
	const minScroll = {
		x: 0,
		y: 0
	};
	const dimensions = isDocumentScrollingElement(scrollingContainer) ? {
		height: window.innerHeight,
		width: window.innerWidth
	} : {
		height: scrollingContainer.clientHeight,
		width: scrollingContainer.clientWidth
	};
	const maxScroll = {
		x: scrollingContainer.scrollWidth - dimensions.width,
		y: scrollingContainer.scrollHeight - dimensions.height
	};
	return {
		isTop: scrollingContainer.scrollTop <= minScroll.y,
		isLeft: scrollingContainer.scrollLeft <= minScroll.x,
		isBottom: scrollingContainer.scrollTop >= maxScroll.y,
		isRight: scrollingContainer.scrollLeft >= maxScroll.x,
		maxScroll,
		minScroll
	};
}
var defaultThreshold = {
	x: .2,
	y: .2
};
function getScrollDirectionAndSpeed(scrollContainer, scrollContainerRect, _ref, acceleration, thresholdPercentage) {
	let { top, left, right, bottom } = _ref;
	if (acceleration === void 0) acceleration = 10;
	if (thresholdPercentage === void 0) thresholdPercentage = defaultThreshold;
	const { isTop, isBottom, isLeft, isRight } = getScrollPosition(scrollContainer);
	const direction = {
		x: 0,
		y: 0
	};
	const speed = {
		x: 0,
		y: 0
	};
	const threshold = {
		height: scrollContainerRect.height * thresholdPercentage.y,
		width: scrollContainerRect.width * thresholdPercentage.x
	};
	if (!isTop && top <= scrollContainerRect.top + threshold.height) {
		direction.y = Direction.Backward;
		speed.y = acceleration * Math.abs((scrollContainerRect.top + threshold.height - top) / threshold.height);
	} else if (!isBottom && bottom >= scrollContainerRect.bottom - threshold.height) {
		direction.y = Direction.Forward;
		speed.y = acceleration * Math.abs((scrollContainerRect.bottom - threshold.height - bottom) / threshold.height);
	}
	if (!isRight && right >= scrollContainerRect.right - threshold.width) {
		direction.x = Direction.Forward;
		speed.x = acceleration * Math.abs((scrollContainerRect.right - threshold.width - right) / threshold.width);
	} else if (!isLeft && left <= scrollContainerRect.left + threshold.width) {
		direction.x = Direction.Backward;
		speed.x = acceleration * Math.abs((scrollContainerRect.left + threshold.width - left) / threshold.width);
	}
	return {
		direction,
		speed
	};
}
function getScrollElementRect(element) {
	if (element === document.scrollingElement) {
		const { innerWidth, innerHeight } = window;
		return {
			top: 0,
			left: 0,
			right: innerWidth,
			bottom: innerHeight,
			width: innerWidth,
			height: innerHeight
		};
	}
	const { top, left, right, bottom } = element.getBoundingClientRect();
	return {
		top,
		left,
		right,
		bottom,
		width: element.clientWidth,
		height: element.clientHeight
	};
}
function getScrollOffsets(scrollableAncestors) {
	return scrollableAncestors.reduce((acc, node) => {
		return add(acc, getScrollCoordinates(node));
	}, defaultCoordinates);
}
function getScrollXOffset(scrollableAncestors) {
	return scrollableAncestors.reduce((acc, node) => {
		return acc + getScrollXCoordinate(node);
	}, 0);
}
function getScrollYOffset(scrollableAncestors) {
	return scrollableAncestors.reduce((acc, node) => {
		return acc + getScrollYCoordinate(node);
	}, 0);
}
function scrollIntoViewIfNeeded(element, measure) {
	if (measure === void 0) measure = getClientRect;
	if (!element) return;
	const { top, left, bottom, right } = measure(element);
	if (!getFirstScrollableAncestor(element)) return;
	if (bottom <= 0 || right <= 0 || top >= window.innerHeight || left >= window.innerWidth) element.scrollIntoView({
		block: "center",
		inline: "center"
	});
}
var properties = [[
	"x",
	["left", "right"],
	getScrollXOffset
], [
	"y",
	["top", "bottom"],
	getScrollYOffset
]];
var Rect = class {
	constructor(rect, element) {
		this.rect = void 0;
		this.width = void 0;
		this.height = void 0;
		this.top = void 0;
		this.bottom = void 0;
		this.right = void 0;
		this.left = void 0;
		const scrollableAncestors = getScrollableAncestors(element);
		const scrollOffsets = getScrollOffsets(scrollableAncestors);
		this.rect = { ...rect };
		this.width = rect.width;
		this.height = rect.height;
		for (const [axis, keys, getScrollOffset] of properties) for (const key of keys) Object.defineProperty(this, key, {
			get: () => {
				const currentOffsets = getScrollOffset(scrollableAncestors);
				const scrollOffsetsDeltla = scrollOffsets[axis] - currentOffsets;
				return this.rect[key] + scrollOffsetsDeltla;
			},
			enumerable: true
		});
		Object.defineProperty(this, "rect", { enumerable: false });
	}
};
var Listeners = class {
	constructor(target) {
		this.target = void 0;
		this.listeners = [];
		this.removeAll = () => {
			this.listeners.forEach((listener) => {
				var _this$target;
				return (_this$target = this.target) == null ? void 0 : _this$target.removeEventListener(...listener);
			});
		};
		this.target = target;
	}
	add(eventName, handler, options) {
		var _this$target2;
		(_this$target2 = this.target) == null || _this$target2.addEventListener(eventName, handler, options);
		this.listeners.push([
			eventName,
			handler,
			options
		]);
	}
};
function getEventListenerTarget(target) {
	const { EventTarget } = getWindow(target);
	return target instanceof EventTarget ? target : getOwnerDocument(target);
}
function hasExceededDistance(delta, measurement) {
	const dx = Math.abs(delta.x);
	const dy = Math.abs(delta.y);
	if (typeof measurement === "number") return Math.sqrt(dx ** 2 + dy ** 2) > measurement;
	if ("x" in measurement && "y" in measurement) return dx > measurement.x && dy > measurement.y;
	if ("x" in measurement) return dx > measurement.x;
	if ("y" in measurement) return dy > measurement.y;
	return false;
}
var EventName;
(function(EventName) {
	EventName["Click"] = "click";
	EventName["DragStart"] = "dragstart";
	EventName["Keydown"] = "keydown";
	EventName["ContextMenu"] = "contextmenu";
	EventName["Resize"] = "resize";
	EventName["SelectionChange"] = "selectionchange";
	EventName["VisibilityChange"] = "visibilitychange";
})(EventName || (EventName = {}));
function preventDefault$1(event) {
	event.preventDefault();
}
function stopPropagation(event) {
	event.stopPropagation();
}
var KeyboardCode;
(function(KeyboardCode) {
	KeyboardCode["Space"] = "Space";
	KeyboardCode["Down"] = "ArrowDown";
	KeyboardCode["Right"] = "ArrowRight";
	KeyboardCode["Left"] = "ArrowLeft";
	KeyboardCode["Up"] = "ArrowUp";
	KeyboardCode["Esc"] = "Escape";
	KeyboardCode["Enter"] = "Enter";
	KeyboardCode["Tab"] = "Tab";
})(KeyboardCode || (KeyboardCode = {}));
var defaultKeyboardCodes = {
	start: [KeyboardCode.Space, KeyboardCode.Enter],
	cancel: [KeyboardCode.Esc],
	end: [
		KeyboardCode.Space,
		KeyboardCode.Enter,
		KeyboardCode.Tab
	]
};
var defaultKeyboardCoordinateGetter = (event, _ref) => {
	let { currentCoordinates } = _ref;
	switch (event.code) {
		case KeyboardCode.Right: return {
			...currentCoordinates,
			x: currentCoordinates.x + 25
		};
		case KeyboardCode.Left: return {
			...currentCoordinates,
			x: currentCoordinates.x - 25
		};
		case KeyboardCode.Down: return {
			...currentCoordinates,
			y: currentCoordinates.y + 25
		};
		case KeyboardCode.Up: return {
			...currentCoordinates,
			y: currentCoordinates.y - 25
		};
	}
};
var KeyboardSensor = class {
	constructor(props) {
		this.props = void 0;
		this.autoScrollEnabled = false;
		this.referenceCoordinates = void 0;
		this.listeners = void 0;
		this.windowListeners = void 0;
		this.props = props;
		const { event: { target } } = props;
		this.props = props;
		this.listeners = new Listeners(getOwnerDocument(target));
		this.windowListeners = new Listeners(getWindow(target));
		this.handleKeyDown = this.handleKeyDown.bind(this);
		this.handleCancel = this.handleCancel.bind(this);
		this.attach();
	}
	attach() {
		this.handleStart();
		this.windowListeners.add(EventName.Resize, this.handleCancel);
		this.windowListeners.add(EventName.VisibilityChange, this.handleCancel);
		setTimeout(() => this.listeners.add(EventName.Keydown, this.handleKeyDown));
	}
	handleStart() {
		const { activeNode, onStart } = this.props;
		const node = activeNode.node.current;
		if (node) scrollIntoViewIfNeeded(node);
		onStart(defaultCoordinates);
	}
	handleKeyDown(event) {
		if (isKeyboardEvent(event)) {
			const { active, context, options } = this.props;
			const { keyboardCodes = defaultKeyboardCodes, coordinateGetter = defaultKeyboardCoordinateGetter, scrollBehavior = "smooth" } = options;
			const { code } = event;
			if (keyboardCodes.end.includes(code)) {
				this.handleEnd(event);
				return;
			}
			if (keyboardCodes.cancel.includes(code)) {
				this.handleCancel(event);
				return;
			}
			const { collisionRect } = context.current;
			const currentCoordinates = collisionRect ? {
				x: collisionRect.left,
				y: collisionRect.top
			} : defaultCoordinates;
			if (!this.referenceCoordinates) this.referenceCoordinates = currentCoordinates;
			const newCoordinates = coordinateGetter(event, {
				active,
				context: context.current,
				currentCoordinates
			});
			if (newCoordinates) {
				const coordinatesDelta = subtract(newCoordinates, currentCoordinates);
				const scrollDelta = {
					x: 0,
					y: 0
				};
				const { scrollableAncestors } = context.current;
				for (const scrollContainer of scrollableAncestors) {
					const direction = event.code;
					const { isTop, isRight, isLeft, isBottom, maxScroll, minScroll } = getScrollPosition(scrollContainer);
					const scrollElementRect = getScrollElementRect(scrollContainer);
					const clampedCoordinates = {
						x: Math.min(direction === KeyboardCode.Right ? scrollElementRect.right - scrollElementRect.width / 2 : scrollElementRect.right, Math.max(direction === KeyboardCode.Right ? scrollElementRect.left : scrollElementRect.left + scrollElementRect.width / 2, newCoordinates.x)),
						y: Math.min(direction === KeyboardCode.Down ? scrollElementRect.bottom - scrollElementRect.height / 2 : scrollElementRect.bottom, Math.max(direction === KeyboardCode.Down ? scrollElementRect.top : scrollElementRect.top + scrollElementRect.height / 2, newCoordinates.y))
					};
					const canScrollX = direction === KeyboardCode.Right && !isRight || direction === KeyboardCode.Left && !isLeft;
					const canScrollY = direction === KeyboardCode.Down && !isBottom || direction === KeyboardCode.Up && !isTop;
					if (canScrollX && clampedCoordinates.x !== newCoordinates.x) {
						const newScrollCoordinates = scrollContainer.scrollLeft + coordinatesDelta.x;
						const canScrollToNewCoordinates = direction === KeyboardCode.Right && newScrollCoordinates <= maxScroll.x || direction === KeyboardCode.Left && newScrollCoordinates >= minScroll.x;
						if (canScrollToNewCoordinates && !coordinatesDelta.y) {
							scrollContainer.scrollTo({
								left: newScrollCoordinates,
								behavior: scrollBehavior
							});
							return;
						}
						if (canScrollToNewCoordinates) scrollDelta.x = scrollContainer.scrollLeft - newScrollCoordinates;
						else scrollDelta.x = direction === KeyboardCode.Right ? scrollContainer.scrollLeft - maxScroll.x : scrollContainer.scrollLeft - minScroll.x;
						if (scrollDelta.x) scrollContainer.scrollBy({
							left: -scrollDelta.x,
							behavior: scrollBehavior
						});
						break;
					} else if (canScrollY && clampedCoordinates.y !== newCoordinates.y) {
						const newScrollCoordinates = scrollContainer.scrollTop + coordinatesDelta.y;
						const canScrollToNewCoordinates = direction === KeyboardCode.Down && newScrollCoordinates <= maxScroll.y || direction === KeyboardCode.Up && newScrollCoordinates >= minScroll.y;
						if (canScrollToNewCoordinates && !coordinatesDelta.x) {
							scrollContainer.scrollTo({
								top: newScrollCoordinates,
								behavior: scrollBehavior
							});
							return;
						}
						if (canScrollToNewCoordinates) scrollDelta.y = scrollContainer.scrollTop - newScrollCoordinates;
						else scrollDelta.y = direction === KeyboardCode.Down ? scrollContainer.scrollTop - maxScroll.y : scrollContainer.scrollTop - minScroll.y;
						if (scrollDelta.y) scrollContainer.scrollBy({
							top: -scrollDelta.y,
							behavior: scrollBehavior
						});
						break;
					}
				}
				this.handleMove(event, add(subtract(newCoordinates, this.referenceCoordinates), scrollDelta));
			}
		}
	}
	handleMove(event, coordinates) {
		const { onMove } = this.props;
		event.preventDefault();
		onMove(coordinates);
	}
	handleEnd(event) {
		const { onEnd } = this.props;
		event.preventDefault();
		this.detach();
		onEnd();
	}
	handleCancel(event) {
		const { onCancel } = this.props;
		event.preventDefault();
		this.detach();
		onCancel();
	}
	detach() {
		this.listeners.removeAll();
		this.windowListeners.removeAll();
	}
};
KeyboardSensor.activators = [{
	eventName: "onKeyDown",
	handler: (event, _ref, _ref2) => {
		let { keyboardCodes = defaultKeyboardCodes, onActivation } = _ref;
		let { active } = _ref2;
		const { code } = event.nativeEvent;
		if (keyboardCodes.start.includes(code)) {
			const activator = active.activatorNode.current;
			if (activator && event.target !== activator) return false;
			event.preventDefault();
			onActivation?.({ event: event.nativeEvent });
			return true;
		}
		return false;
	}
}];
function isDistanceConstraint(constraint) {
	return Boolean(constraint && "distance" in constraint);
}
function isDelayConstraint(constraint) {
	return Boolean(constraint && "delay" in constraint);
}
var AbstractPointerSensor = class {
	constructor(props, events, listenerTarget) {
		var _getEventCoordinates;
		if (listenerTarget === void 0) listenerTarget = getEventListenerTarget(props.event.target);
		this.props = void 0;
		this.events = void 0;
		this.autoScrollEnabled = true;
		this.document = void 0;
		this.activated = false;
		this.initialCoordinates = void 0;
		this.timeoutId = null;
		this.listeners = void 0;
		this.documentListeners = void 0;
		this.windowListeners = void 0;
		this.props = props;
		this.events = events;
		const { event } = props;
		const { target } = event;
		this.props = props;
		this.events = events;
		this.document = getOwnerDocument(target);
		this.documentListeners = new Listeners(this.document);
		this.listeners = new Listeners(listenerTarget);
		this.windowListeners = new Listeners(getWindow(target));
		this.initialCoordinates = (_getEventCoordinates = getEventCoordinates(event)) != null ? _getEventCoordinates : defaultCoordinates;
		this.handleStart = this.handleStart.bind(this);
		this.handleMove = this.handleMove.bind(this);
		this.handleEnd = this.handleEnd.bind(this);
		this.handleCancel = this.handleCancel.bind(this);
		this.handleKeydown = this.handleKeydown.bind(this);
		this.removeTextSelection = this.removeTextSelection.bind(this);
		this.attach();
	}
	attach() {
		const { events, props: { options: { activationConstraint, bypassActivationConstraint } } } = this;
		this.listeners.add(events.move.name, this.handleMove, { passive: false });
		this.listeners.add(events.end.name, this.handleEnd);
		if (events.cancel) this.listeners.add(events.cancel.name, this.handleCancel);
		this.windowListeners.add(EventName.Resize, this.handleCancel);
		this.windowListeners.add(EventName.DragStart, preventDefault$1);
		this.windowListeners.add(EventName.VisibilityChange, this.handleCancel);
		this.windowListeners.add(EventName.ContextMenu, preventDefault$1);
		this.documentListeners.add(EventName.Keydown, this.handleKeydown);
		if (activationConstraint) {
			if (bypassActivationConstraint != null && bypassActivationConstraint({
				event: this.props.event,
				activeNode: this.props.activeNode,
				options: this.props.options
			})) return this.handleStart();
			if (isDelayConstraint(activationConstraint)) {
				this.timeoutId = setTimeout(this.handleStart, activationConstraint.delay);
				this.handlePending(activationConstraint);
				return;
			}
			if (isDistanceConstraint(activationConstraint)) {
				this.handlePending(activationConstraint);
				return;
			}
		}
		this.handleStart();
	}
	detach() {
		this.listeners.removeAll();
		this.windowListeners.removeAll();
		setTimeout(this.documentListeners.removeAll, 50);
		if (this.timeoutId !== null) {
			clearTimeout(this.timeoutId);
			this.timeoutId = null;
		}
	}
	handlePending(constraint, offset) {
		const { active, onPending } = this.props;
		onPending(active, constraint, this.initialCoordinates, offset);
	}
	handleStart() {
		const { initialCoordinates } = this;
		const { onStart } = this.props;
		if (initialCoordinates) {
			this.activated = true;
			this.documentListeners.add(EventName.Click, stopPropagation, { capture: true });
			this.removeTextSelection();
			this.documentListeners.add(EventName.SelectionChange, this.removeTextSelection);
			onStart(initialCoordinates);
		}
	}
	handleMove(event) {
		var _getEventCoordinates2;
		const { activated, initialCoordinates, props } = this;
		const { onMove, options: { activationConstraint } } = props;
		if (!initialCoordinates) return;
		const coordinates = (_getEventCoordinates2 = getEventCoordinates(event)) != null ? _getEventCoordinates2 : defaultCoordinates;
		const delta = subtract(initialCoordinates, coordinates);
		if (!activated && activationConstraint) {
			if (isDistanceConstraint(activationConstraint)) {
				if (activationConstraint.tolerance != null && hasExceededDistance(delta, activationConstraint.tolerance)) return this.handleCancel();
				if (hasExceededDistance(delta, activationConstraint.distance)) return this.handleStart();
			}
			if (isDelayConstraint(activationConstraint)) {
				if (hasExceededDistance(delta, activationConstraint.tolerance)) return this.handleCancel();
			}
			this.handlePending(activationConstraint, delta);
			return;
		}
		if (event.cancelable) event.preventDefault();
		onMove(coordinates);
	}
	handleEnd() {
		const { onAbort, onEnd } = this.props;
		this.detach();
		if (!this.activated) onAbort(this.props.active);
		onEnd();
	}
	handleCancel() {
		const { onAbort, onCancel } = this.props;
		this.detach();
		if (!this.activated) onAbort(this.props.active);
		onCancel();
	}
	handleKeydown(event) {
		if (event.code === KeyboardCode.Esc) this.handleCancel();
	}
	removeTextSelection() {
		var _this$document$getSel;
		(_this$document$getSel = this.document.getSelection()) == null || _this$document$getSel.removeAllRanges();
	}
};
var events = {
	cancel: { name: "pointercancel" },
	move: { name: "pointermove" },
	end: { name: "pointerup" }
};
var PointerSensor = class extends AbstractPointerSensor {
	constructor(props) {
		const { event } = props;
		const listenerTarget = getOwnerDocument(event.target);
		super(props, events, listenerTarget);
	}
};
PointerSensor.activators = [{
	eventName: "onPointerDown",
	handler: (_ref, _ref2) => {
		let { nativeEvent: event } = _ref;
		let { onActivation } = _ref2;
		if (!event.isPrimary || event.button !== 0) return false;
		onActivation?.({ event });
		return true;
	}
}];
var events$1 = {
	move: { name: "mousemove" },
	end: { name: "mouseup" }
};
var MouseButton;
(function(MouseButton) {
	MouseButton[MouseButton["RightClick"] = 2] = "RightClick";
})(MouseButton || (MouseButton = {}));
var MouseSensor = class extends AbstractPointerSensor {
	constructor(props) {
		super(props, events$1, getOwnerDocument(props.event.target));
	}
};
MouseSensor.activators = [{
	eventName: "onMouseDown",
	handler: (_ref, _ref2) => {
		let { nativeEvent: event } = _ref;
		let { onActivation } = _ref2;
		if (event.button === MouseButton.RightClick) return false;
		onActivation?.({ event });
		return true;
	}
}];
var events$2 = {
	cancel: { name: "touchcancel" },
	move: { name: "touchmove" },
	end: { name: "touchend" }
};
var TouchSensor = class extends AbstractPointerSensor {
	constructor(props) {
		super(props, events$2);
	}
	static setup() {
		window.addEventListener(events$2.move.name, noop, {
			capture: false,
			passive: false
		});
		return function teardown() {
			window.removeEventListener(events$2.move.name, noop);
		};
		function noop() {}
	}
};
TouchSensor.activators = [{
	eventName: "onTouchStart",
	handler: (_ref, _ref2) => {
		let { nativeEvent: event } = _ref;
		let { onActivation } = _ref2;
		const { touches } = event;
		if (touches.length > 1) return false;
		onActivation?.({ event });
		return true;
	}
}];
var AutoScrollActivator;
(function(AutoScrollActivator) {
	AutoScrollActivator[AutoScrollActivator["Pointer"] = 0] = "Pointer";
	AutoScrollActivator[AutoScrollActivator["DraggableRect"] = 1] = "DraggableRect";
})(AutoScrollActivator || (AutoScrollActivator = {}));
var TraversalOrder;
(function(TraversalOrder) {
	TraversalOrder[TraversalOrder["TreeOrder"] = 0] = "TreeOrder";
	TraversalOrder[TraversalOrder["ReversedTreeOrder"] = 1] = "ReversedTreeOrder";
})(TraversalOrder || (TraversalOrder = {}));
function useAutoScroller(_ref) {
	let { acceleration, activator = AutoScrollActivator.Pointer, canScroll, draggingRect, enabled, interval = 5, order = TraversalOrder.TreeOrder, pointerCoordinates, scrollableAncestors, scrollableAncestorRects, delta, threshold } = _ref;
	const scrollIntent = useScrollIntent({
		delta,
		disabled: !enabled
	});
	const [setAutoScrollInterval, clearAutoScrollInterval] = useInterval();
	const scrollSpeed = (0, import_react.useRef)({
		x: 0,
		y: 0
	});
	const scrollDirection = (0, import_react.useRef)({
		x: 0,
		y: 0
	});
	const rect = (0, import_react.useMemo)(() => {
		switch (activator) {
			case AutoScrollActivator.Pointer: return pointerCoordinates ? {
				top: pointerCoordinates.y,
				bottom: pointerCoordinates.y,
				left: pointerCoordinates.x,
				right: pointerCoordinates.x
			} : null;
			case AutoScrollActivator.DraggableRect: return draggingRect;
		}
	}, [
		activator,
		draggingRect,
		pointerCoordinates
	]);
	const scrollContainerRef = (0, import_react.useRef)(null);
	const autoScroll = (0, import_react.useCallback)(() => {
		const scrollContainer = scrollContainerRef.current;
		if (!scrollContainer) return;
		const scrollLeft = scrollSpeed.current.x * scrollDirection.current.x;
		const scrollTop = scrollSpeed.current.y * scrollDirection.current.y;
		scrollContainer.scrollBy(scrollLeft, scrollTop);
	}, []);
	const sortedScrollableAncestors = (0, import_react.useMemo)(() => order === TraversalOrder.TreeOrder ? [...scrollableAncestors].reverse() : scrollableAncestors, [order, scrollableAncestors]);
	(0, import_react.useEffect)(() => {
		if (!enabled || !scrollableAncestors.length || !rect) {
			clearAutoScrollInterval();
			return;
		}
		for (const scrollContainer of sortedScrollableAncestors) {
			if ((canScroll == null ? void 0 : canScroll(scrollContainer)) === false) continue;
			const index = scrollableAncestors.indexOf(scrollContainer);
			const scrollContainerRect = scrollableAncestorRects[index];
			if (!scrollContainerRect) continue;
			const { direction, speed } = getScrollDirectionAndSpeed(scrollContainer, scrollContainerRect, rect, acceleration, threshold);
			for (const axis of ["x", "y"]) if (!scrollIntent[axis][direction[axis]]) {
				speed[axis] = 0;
				direction[axis] = 0;
			}
			if (speed.x > 0 || speed.y > 0) {
				clearAutoScrollInterval();
				scrollContainerRef.current = scrollContainer;
				setAutoScrollInterval(autoScroll, interval);
				scrollSpeed.current = speed;
				scrollDirection.current = direction;
				return;
			}
		}
		scrollSpeed.current = {
			x: 0,
			y: 0
		};
		scrollDirection.current = {
			x: 0,
			y: 0
		};
		clearAutoScrollInterval();
	}, [
		acceleration,
		autoScroll,
		canScroll,
		clearAutoScrollInterval,
		enabled,
		interval,
		JSON.stringify(rect),
		JSON.stringify(scrollIntent),
		setAutoScrollInterval,
		scrollableAncestors,
		sortedScrollableAncestors,
		scrollableAncestorRects,
		JSON.stringify(threshold)
	]);
}
var defaultScrollIntent = {
	x: {
		[Direction.Backward]: false,
		[Direction.Forward]: false
	},
	y: {
		[Direction.Backward]: false,
		[Direction.Forward]: false
	}
};
function useScrollIntent(_ref2) {
	let { delta, disabled } = _ref2;
	const previousDelta = usePrevious(delta);
	return useLazyMemo((previousIntent) => {
		if (disabled || !previousDelta || !previousIntent) return defaultScrollIntent;
		const direction = {
			x: Math.sign(delta.x - previousDelta.x),
			y: Math.sign(delta.y - previousDelta.y)
		};
		return {
			x: {
				[Direction.Backward]: previousIntent.x[Direction.Backward] || direction.x === -1,
				[Direction.Forward]: previousIntent.x[Direction.Forward] || direction.x === 1
			},
			y: {
				[Direction.Backward]: previousIntent.y[Direction.Backward] || direction.y === -1,
				[Direction.Forward]: previousIntent.y[Direction.Forward] || direction.y === 1
			}
		};
	}, [
		disabled,
		delta,
		previousDelta
	]);
}
function useCachedNode(draggableNodes, id) {
	const draggableNode = id != null ? draggableNodes.get(id) : void 0;
	const node = draggableNode ? draggableNode.node.current : null;
	return useLazyMemo((cachedNode) => {
		var _ref;
		if (id == null) return null;
		return (_ref = node != null ? node : cachedNode) != null ? _ref : null;
	}, [node, id]);
}
function useCombineActivators(sensors, getSyntheticHandler) {
	return (0, import_react.useMemo)(() => sensors.reduce((accumulator, sensor) => {
		const { sensor: Sensor } = sensor;
		const sensorActivators = Sensor.activators.map((activator) => ({
			eventName: activator.eventName,
			handler: getSyntheticHandler(activator.handler, sensor)
		}));
		return [...accumulator, ...sensorActivators];
	}, []), [sensors, getSyntheticHandler]);
}
var MeasuringStrategy;
(function(MeasuringStrategy) {
	MeasuringStrategy[MeasuringStrategy["Always"] = 0] = "Always";
	MeasuringStrategy[MeasuringStrategy["BeforeDragging"] = 1] = "BeforeDragging";
	MeasuringStrategy[MeasuringStrategy["WhileDragging"] = 2] = "WhileDragging";
})(MeasuringStrategy || (MeasuringStrategy = {}));
var MeasuringFrequency;
(function(MeasuringFrequency) {
	MeasuringFrequency["Optimized"] = "optimized";
})(MeasuringFrequency || (MeasuringFrequency = {}));
var defaultValue = /*#__PURE__*/ new Map();
function useDroppableMeasuring(containers, _ref) {
	let { dragging, dependencies, config } = _ref;
	const [queue, setQueue] = (0, import_react.useState)(null);
	const { frequency, measure, strategy } = config;
	const containersRef = (0, import_react.useRef)(containers);
	const disabled = isDisabled();
	const disabledRef = useLatestValue(disabled);
	const measureDroppableContainers = (0, import_react.useCallback)(function(ids) {
		if (ids === void 0) ids = [];
		if (disabledRef.current) return;
		setQueue((value) => {
			if (value === null) return ids;
			return value.concat(ids.filter((id) => !value.includes(id)));
		});
	}, [disabledRef]);
	const timeoutId = (0, import_react.useRef)(null);
	const droppableRects = useLazyMemo((previousValue) => {
		if (disabled && !dragging) return defaultValue;
		if (!previousValue || previousValue === defaultValue || containersRef.current !== containers || queue != null) {
			const map = /* @__PURE__ */ new Map();
			for (let container of containers) {
				if (!container) continue;
				if (queue && queue.length > 0 && !queue.includes(container.id) && container.rect.current) {
					map.set(container.id, container.rect.current);
					continue;
				}
				const node = container.node.current;
				const rect = node ? new Rect(measure(node), node) : null;
				container.rect.current = rect;
				if (rect) map.set(container.id, rect);
			}
			return map;
		}
		return previousValue;
	}, [
		containers,
		queue,
		dragging,
		disabled,
		measure
	]);
	(0, import_react.useEffect)(() => {
		containersRef.current = containers;
	}, [containers]);
	(0, import_react.useEffect)(() => {
		if (disabled) return;
		measureDroppableContainers();
	}, [dragging, disabled]);
	(0, import_react.useEffect)(() => {
		if (queue && queue.length > 0) setQueue(null);
	}, [JSON.stringify(queue)]);
	(0, import_react.useEffect)(() => {
		if (disabled || typeof frequency !== "number" || timeoutId.current !== null) return;
		timeoutId.current = setTimeout(() => {
			measureDroppableContainers();
			timeoutId.current = null;
		}, frequency);
	}, [
		frequency,
		disabled,
		measureDroppableContainers,
		...dependencies
	]);
	return {
		droppableRects,
		measureDroppableContainers,
		measuringScheduled: queue != null
	};
	function isDisabled() {
		switch (strategy) {
			case MeasuringStrategy.Always: return false;
			case MeasuringStrategy.BeforeDragging: return dragging;
			default: return !dragging;
		}
	}
}
function useInitialValue(value, computeFn) {
	return useLazyMemo((previousValue) => {
		if (!value) return null;
		if (previousValue) return previousValue;
		return typeof computeFn === "function" ? computeFn(value) : value;
	}, [computeFn, value]);
}
function useInitialRect(node, measure) {
	return useInitialValue(node, measure);
}
/**
* Returns a new MutationObserver instance.
* If `MutationObserver` is undefined in the execution environment, returns `undefined`.
*/
function useMutationObserver(_ref) {
	let { callback, disabled } = _ref;
	const handleMutations = useEvent(callback);
	const mutationObserver = (0, import_react.useMemo)(() => {
		if (disabled || typeof window === "undefined" || typeof window.MutationObserver === "undefined") return;
		const { MutationObserver } = window;
		return new MutationObserver(handleMutations);
	}, [handleMutations, disabled]);
	(0, import_react.useEffect)(() => {
		return () => mutationObserver == null ? void 0 : mutationObserver.disconnect();
	}, [mutationObserver]);
	return mutationObserver;
}
/**
* Returns a new ResizeObserver instance bound to the `onResize` callback.
* If `ResizeObserver` is undefined in the execution environment, returns `undefined`.
*/
function useResizeObserver(_ref) {
	let { callback, disabled } = _ref;
	const handleResize = useEvent(callback);
	const resizeObserver = (0, import_react.useMemo)(() => {
		if (disabled || typeof window === "undefined" || typeof window.ResizeObserver === "undefined") return;
		const { ResizeObserver } = window;
		return new ResizeObserver(handleResize);
	}, [disabled]);
	(0, import_react.useEffect)(() => {
		return () => resizeObserver == null ? void 0 : resizeObserver.disconnect();
	}, [resizeObserver]);
	return resizeObserver;
}
function defaultMeasure(element) {
	return new Rect(getClientRect(element), element);
}
function useRect(element, measure, fallbackRect) {
	if (measure === void 0) measure = defaultMeasure;
	const [rect, setRect] = (0, import_react.useState)(null);
	function measureRect() {
		setRect((currentRect) => {
			if (!element) return null;
			if (element.isConnected === false) {
				var _ref;
				return (_ref = currentRect != null ? currentRect : fallbackRect) != null ? _ref : null;
			}
			const newRect = measure(element);
			if (JSON.stringify(currentRect) === JSON.stringify(newRect)) return currentRect;
			return newRect;
		});
	}
	const mutationObserver = useMutationObserver({ callback(records) {
		if (!element) return;
		for (const record of records) {
			const { type, target } = record;
			if (type === "childList" && target instanceof HTMLElement && target.contains(element)) {
				measureRect();
				break;
			}
		}
	} });
	const resizeObserver = useResizeObserver({ callback: measureRect });
	useIsomorphicLayoutEffect(() => {
		measureRect();
		if (element) {
			resizeObserver?.observe(element);
			mutationObserver?.observe(document.body, {
				childList: true,
				subtree: true
			});
		} else {
			resizeObserver?.disconnect();
			mutationObserver?.disconnect();
		}
	}, [element]);
	return rect;
}
function useRectDelta(rect) {
	return getRectDelta(rect, useInitialValue(rect));
}
var defaultValue$1 = [];
function useScrollableAncestors(node) {
	const previousNode = (0, import_react.useRef)(node);
	const ancestors = useLazyMemo((previousValue) => {
		if (!node) return defaultValue$1;
		if (previousValue && previousValue !== defaultValue$1 && node && previousNode.current && node.parentNode === previousNode.current.parentNode) return previousValue;
		return getScrollableAncestors(node);
	}, [node]);
	(0, import_react.useEffect)(() => {
		previousNode.current = node;
	}, [node]);
	return ancestors;
}
function useScrollOffsets(elements) {
	const [scrollCoordinates, setScrollCoordinates] = (0, import_react.useState)(null);
	const prevElements = (0, import_react.useRef)(elements);
	const handleScroll = (0, import_react.useCallback)((event) => {
		const scrollingElement = getScrollableElement(event.target);
		if (!scrollingElement) return;
		setScrollCoordinates((scrollCoordinates) => {
			if (!scrollCoordinates) return null;
			scrollCoordinates.set(scrollingElement, getScrollCoordinates(scrollingElement));
			return new Map(scrollCoordinates);
		});
	}, []);
	(0, import_react.useEffect)(() => {
		const previousElements = prevElements.current;
		if (elements !== previousElements) {
			cleanup(previousElements);
			const entries = elements.map((element) => {
				const scrollableElement = getScrollableElement(element);
				if (scrollableElement) {
					scrollableElement.addEventListener("scroll", handleScroll, { passive: true });
					return [scrollableElement, getScrollCoordinates(scrollableElement)];
				}
				return null;
			}).filter((entry) => entry != null);
			setScrollCoordinates(entries.length ? new Map(entries) : null);
			prevElements.current = elements;
		}
		return () => {
			cleanup(elements);
			cleanup(previousElements);
		};
		function cleanup(elements) {
			elements.forEach((element) => {
				getScrollableElement(element)?.removeEventListener("scroll", handleScroll);
			});
		}
	}, [handleScroll, elements]);
	return (0, import_react.useMemo)(() => {
		if (elements.length) return scrollCoordinates ? Array.from(scrollCoordinates.values()).reduce((acc, coordinates) => add(acc, coordinates), defaultCoordinates) : getScrollOffsets(elements);
		return defaultCoordinates;
	}, [elements, scrollCoordinates]);
}
function useScrollOffsetsDelta(scrollOffsets, dependencies) {
	if (dependencies === void 0) dependencies = [];
	const initialScrollOffsets = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		initialScrollOffsets.current = null;
	}, dependencies);
	(0, import_react.useEffect)(() => {
		const hasScrollOffsets = scrollOffsets !== defaultCoordinates;
		if (hasScrollOffsets && !initialScrollOffsets.current) initialScrollOffsets.current = scrollOffsets;
		if (!hasScrollOffsets && initialScrollOffsets.current) initialScrollOffsets.current = null;
	}, [scrollOffsets]);
	return initialScrollOffsets.current ? subtract(scrollOffsets, initialScrollOffsets.current) : defaultCoordinates;
}
function useSensorSetup(sensors) {
	(0, import_react.useEffect)(() => {
		if (!canUseDOM) return;
		const teardownFns = sensors.map((_ref) => {
			let { sensor } = _ref;
			return sensor.setup == null ? void 0 : sensor.setup();
		});
		return () => {
			for (const teardown of teardownFns) teardown?.();
		};
	}, sensors.map((_ref2) => {
		let { sensor } = _ref2;
		return sensor;
	}));
}
function useSyntheticListeners(listeners, id) {
	return (0, import_react.useMemo)(() => {
		return listeners.reduce((acc, _ref) => {
			let { eventName, handler } = _ref;
			acc[eventName] = (event) => {
				handler(event, id);
			};
			return acc;
		}, {});
	}, [listeners, id]);
}
function useWindowRect(element) {
	return (0, import_react.useMemo)(() => element ? getWindowClientRect(element) : null, [element]);
}
var defaultValue$2 = [];
function useRects(elements, measure) {
	if (measure === void 0) measure = getClientRect;
	const [firstElement] = elements;
	const windowRect = useWindowRect(firstElement ? getWindow(firstElement) : null);
	const [rects, setRects] = (0, import_react.useState)(defaultValue$2);
	function measureRects() {
		setRects(() => {
			if (!elements.length) return defaultValue$2;
			return elements.map((element) => isDocumentScrollingElement(element) ? windowRect : new Rect(measure(element), element));
		});
	}
	const resizeObserver = useResizeObserver({ callback: measureRects });
	useIsomorphicLayoutEffect(() => {
		resizeObserver?.disconnect();
		measureRects();
		elements.forEach((element) => resizeObserver == null ? void 0 : resizeObserver.observe(element));
	}, [elements]);
	return rects;
}
function getMeasurableNode(node) {
	if (!node) return null;
	if (node.children.length > 1) return node;
	const firstChild = node.children[0];
	return isHTMLElement(firstChild) ? firstChild : node;
}
function useDragOverlayMeasuring(_ref) {
	let { measure } = _ref;
	const [rect, setRect] = (0, import_react.useState)(null);
	const resizeObserver = useResizeObserver({ callback: (0, import_react.useCallback)((entries) => {
		for (const { target } of entries) if (isHTMLElement(target)) {
			setRect((rect) => {
				const newRect = measure(target);
				return rect ? {
					...rect,
					width: newRect.width,
					height: newRect.height
				} : newRect;
			});
			break;
		}
	}, [measure]) });
	const [nodeRef, setRef] = useNodeRef((0, import_react.useCallback)((element) => {
		const node = getMeasurableNode(element);
		resizeObserver?.disconnect();
		if (node) resizeObserver?.observe(node);
		setRect(node ? measure(node) : null);
	}, [measure, resizeObserver]));
	return (0, import_react.useMemo)(() => ({
		nodeRef,
		rect,
		setRef
	}), [
		rect,
		nodeRef,
		setRef
	]);
}
var defaultSensors = [{
	sensor: PointerSensor,
	options: {}
}, {
	sensor: KeyboardSensor,
	options: {}
}];
var defaultData = { current: {} };
var defaultMeasuringConfiguration = {
	draggable: { measure: getTransformAgnosticClientRect },
	droppable: {
		measure: getTransformAgnosticClientRect,
		strategy: MeasuringStrategy.WhileDragging,
		frequency: MeasuringFrequency.Optimized
	},
	dragOverlay: { measure: getClientRect }
};
var DroppableContainersMap = class extends Map {
	get(id) {
		var _super$get;
		return id != null ? (_super$get = super.get(id)) != null ? _super$get : void 0 : void 0;
	}
	toArray() {
		return Array.from(this.values());
	}
	getEnabled() {
		return this.toArray().filter((_ref) => {
			let { disabled } = _ref;
			return !disabled;
		});
	}
	getNodeFor(id) {
		var _this$get$node$curren, _this$get;
		return (_this$get$node$curren = (_this$get = this.get(id)) == null ? void 0 : _this$get.node.current) != null ? _this$get$node$curren : void 0;
	}
};
var defaultPublicContext = {
	activatorEvent: null,
	active: null,
	activeNode: null,
	activeNodeRect: null,
	collisions: null,
	containerNodeRect: null,
	draggableNodes: /*#__PURE__*/ new Map(),
	droppableRects: /*#__PURE__*/ new Map(),
	droppableContainers: /*#__PURE__*/ new DroppableContainersMap(),
	over: null,
	dragOverlay: {
		nodeRef: { current: null },
		rect: null,
		setRef: noop
	},
	scrollableAncestors: [],
	scrollableAncestorRects: [],
	measuringConfiguration: defaultMeasuringConfiguration,
	measureDroppableContainers: noop,
	windowRect: null,
	measuringScheduled: false
};
var defaultInternalContext = {
	activatorEvent: null,
	activators: [],
	active: null,
	activeNodeRect: null,
	ariaDescribedById: { draggable: "" },
	dispatch: noop,
	draggableNodes: /*#__PURE__*/ new Map(),
	over: null,
	measureDroppableContainers: noop
};
var InternalContext = /*#__PURE__*/ (0, import_react.createContext)(defaultInternalContext);
var PublicContext = /*#__PURE__*/ (0, import_react.createContext)(defaultPublicContext);
function getInitialState() {
	return {
		draggable: {
			active: null,
			initialCoordinates: {
				x: 0,
				y: 0
			},
			nodes: /* @__PURE__ */ new Map(),
			translate: {
				x: 0,
				y: 0
			}
		},
		droppable: { containers: new DroppableContainersMap() }
	};
}
function reducer(state, action) {
	switch (action.type) {
		case Action.DragStart: return {
			...state,
			draggable: {
				...state.draggable,
				initialCoordinates: action.initialCoordinates,
				active: action.active
			}
		};
		case Action.DragMove:
			if (state.draggable.active == null) return state;
			return {
				...state,
				draggable: {
					...state.draggable,
					translate: {
						x: action.coordinates.x - state.draggable.initialCoordinates.x,
						y: action.coordinates.y - state.draggable.initialCoordinates.y
					}
				}
			};
		case Action.DragEnd:
		case Action.DragCancel: return {
			...state,
			draggable: {
				...state.draggable,
				active: null,
				initialCoordinates: {
					x: 0,
					y: 0
				},
				translate: {
					x: 0,
					y: 0
				}
			}
		};
		case Action.RegisterDroppable: {
			const { element } = action;
			const { id } = element;
			const containers = new DroppableContainersMap(state.droppable.containers);
			containers.set(id, element);
			return {
				...state,
				droppable: {
					...state.droppable,
					containers
				}
			};
		}
		case Action.SetDroppableDisabled: {
			const { id, key, disabled } = action;
			const element = state.droppable.containers.get(id);
			if (!element || key !== element.key) return state;
			const containers = new DroppableContainersMap(state.droppable.containers);
			containers.set(id, {
				...element,
				disabled
			});
			return {
				...state,
				droppable: {
					...state.droppable,
					containers
				}
			};
		}
		case Action.UnregisterDroppable: {
			const { id, key } = action;
			const element = state.droppable.containers.get(id);
			if (!element || key !== element.key) return state;
			const containers = new DroppableContainersMap(state.droppable.containers);
			containers.delete(id);
			return {
				...state,
				droppable: {
					...state.droppable,
					containers
				}
			};
		}
		default: return state;
	}
}
function RestoreFocus(_ref) {
	let { disabled } = _ref;
	const { active, activatorEvent, draggableNodes } = (0, import_react.useContext)(InternalContext);
	const previousActivatorEvent = usePrevious(activatorEvent);
	const previousActiveId = usePrevious(active == null ? void 0 : active.id);
	(0, import_react.useEffect)(() => {
		if (disabled) return;
		if (!activatorEvent && previousActivatorEvent && previousActiveId != null) {
			if (!isKeyboardEvent(previousActivatorEvent)) return;
			if (document.activeElement === previousActivatorEvent.target) return;
			const draggableNode = draggableNodes.get(previousActiveId);
			if (!draggableNode) return;
			const { activatorNode, node } = draggableNode;
			if (!activatorNode.current && !node.current) return;
			requestAnimationFrame(() => {
				for (const element of [activatorNode.current, node.current]) {
					if (!element) continue;
					const focusableNode = findFirstFocusableNode(element);
					if (focusableNode) {
						focusableNode.focus();
						break;
					}
				}
			});
		}
	}, [
		activatorEvent,
		disabled,
		draggableNodes,
		previousActiveId,
		previousActivatorEvent
	]);
	return null;
}
function applyModifiers(modifiers, _ref) {
	let { transform, ...args } = _ref;
	return modifiers != null && modifiers.length ? modifiers.reduce((accumulator, modifier) => {
		return modifier({
			transform: accumulator,
			...args
		});
	}, transform) : transform;
}
function useMeasuringConfiguration(config) {
	return (0, import_react.useMemo)(() => ({
		draggable: {
			...defaultMeasuringConfiguration.draggable,
			...config == null ? void 0 : config.draggable
		},
		droppable: {
			...defaultMeasuringConfiguration.droppable,
			...config == null ? void 0 : config.droppable
		},
		dragOverlay: {
			...defaultMeasuringConfiguration.dragOverlay,
			...config == null ? void 0 : config.dragOverlay
		}
	}), [
		config == null ? void 0 : config.draggable,
		config == null ? void 0 : config.droppable,
		config == null ? void 0 : config.dragOverlay
	]);
}
function useLayoutShiftScrollCompensation(_ref) {
	let { activeNode, measure, initialRect, config = true } = _ref;
	const initialized = (0, import_react.useRef)(false);
	const { x, y } = typeof config === "boolean" ? {
		x: config,
		y: config
	} : config;
	useIsomorphicLayoutEffect(() => {
		if (!x && !y || !activeNode) {
			initialized.current = false;
			return;
		}
		if (initialized.current || !initialRect) return;
		const node = activeNode == null ? void 0 : activeNode.node.current;
		if (!node || node.isConnected === false) return;
		const rectDelta = getRectDelta(measure(node), initialRect);
		if (!x) rectDelta.x = 0;
		if (!y) rectDelta.y = 0;
		initialized.current = true;
		if (Math.abs(rectDelta.x) > 0 || Math.abs(rectDelta.y) > 0) {
			const firstScrollableAncestor = getFirstScrollableAncestor(node);
			if (firstScrollableAncestor) firstScrollableAncestor.scrollBy({
				top: rectDelta.y,
				left: rectDelta.x
			});
		}
	}, [
		activeNode,
		x,
		y,
		initialRect,
		measure
	]);
}
var ActiveDraggableContext = /*#__PURE__*/ (0, import_react.createContext)({
	...defaultCoordinates,
	scaleX: 1,
	scaleY: 1
});
var Status;
(function(Status) {
	Status[Status["Uninitialized"] = 0] = "Uninitialized";
	Status[Status["Initializing"] = 1] = "Initializing";
	Status[Status["Initialized"] = 2] = "Initialized";
})(Status || (Status = {}));
var DndContext = /*#__PURE__*/ (0, import_react.memo)(function DndContext(_ref) {
	var _sensorContext$curren, _dragOverlay$nodeRef$, _dragOverlay$rect, _over$rect;
	let { id, accessibility, autoScroll = true, children, sensors = defaultSensors, collisionDetection = rectIntersection, measuring, modifiers, ...props } = _ref;
	const [state, dispatch] = (0, import_react.useReducer)(reducer, void 0, getInitialState);
	const [dispatchMonitorEvent, registerMonitorListener] = useDndMonitorProvider();
	const [status, setStatus] = (0, import_react.useState)(Status.Uninitialized);
	const isInitialized = status === Status.Initialized;
	const { draggable: { active: activeId, nodes: draggableNodes, translate }, droppable: { containers: droppableContainers } } = state;
	const node = activeId != null ? draggableNodes.get(activeId) : null;
	const activeRects = (0, import_react.useRef)({
		initial: null,
		translated: null
	});
	const active = (0, import_react.useMemo)(() => {
		var _node$data;
		return activeId != null ? {
			id: activeId,
			data: (_node$data = node == null ? void 0 : node.data) != null ? _node$data : defaultData,
			rect: activeRects
		} : null;
	}, [activeId, node]);
	const activeRef = (0, import_react.useRef)(null);
	const [activeSensor, setActiveSensor] = (0, import_react.useState)(null);
	const [activatorEvent, setActivatorEvent] = (0, import_react.useState)(null);
	const latestProps = useLatestValue(props, Object.values(props));
	const draggableDescribedById = useUniqueId("DndDescribedBy", id);
	const enabledDroppableContainers = (0, import_react.useMemo)(() => droppableContainers.getEnabled(), [droppableContainers]);
	const measuringConfiguration = useMeasuringConfiguration(measuring);
	const { droppableRects, measureDroppableContainers, measuringScheduled } = useDroppableMeasuring(enabledDroppableContainers, {
		dragging: isInitialized,
		dependencies: [translate.x, translate.y],
		config: measuringConfiguration.droppable
	});
	const activeNode = useCachedNode(draggableNodes, activeId);
	const activationCoordinates = (0, import_react.useMemo)(() => activatorEvent ? getEventCoordinates(activatorEvent) : null, [activatorEvent]);
	const autoScrollOptions = getAutoScrollerOptions();
	const initialActiveNodeRect = useInitialRect(activeNode, measuringConfiguration.draggable.measure);
	useLayoutShiftScrollCompensation({
		activeNode: activeId != null ? draggableNodes.get(activeId) : null,
		config: autoScrollOptions.layoutShiftCompensation,
		initialRect: initialActiveNodeRect,
		measure: measuringConfiguration.draggable.measure
	});
	const activeNodeRect = useRect(activeNode, measuringConfiguration.draggable.measure, initialActiveNodeRect);
	const containerNodeRect = useRect(activeNode ? activeNode.parentElement : null);
	const sensorContext = (0, import_react.useRef)({
		activatorEvent: null,
		active: null,
		activeNode,
		collisionRect: null,
		collisions: null,
		droppableRects,
		draggableNodes,
		draggingNode: null,
		draggingNodeRect: null,
		droppableContainers,
		over: null,
		scrollableAncestors: [],
		scrollAdjustedTranslate: null
	});
	const overNode = droppableContainers.getNodeFor((_sensorContext$curren = sensorContext.current.over) == null ? void 0 : _sensorContext$curren.id);
	const dragOverlay = useDragOverlayMeasuring({ measure: measuringConfiguration.dragOverlay.measure });
	const draggingNode = (_dragOverlay$nodeRef$ = dragOverlay.nodeRef.current) != null ? _dragOverlay$nodeRef$ : activeNode;
	const draggingNodeRect = isInitialized ? (_dragOverlay$rect = dragOverlay.rect) != null ? _dragOverlay$rect : activeNodeRect : null;
	const usesDragOverlay = Boolean(dragOverlay.nodeRef.current && dragOverlay.rect);
	const nodeRectDelta = useRectDelta(usesDragOverlay ? null : activeNodeRect);
	const windowRect = useWindowRect(draggingNode ? getWindow(draggingNode) : null);
	const scrollableAncestors = useScrollableAncestors(isInitialized ? overNode != null ? overNode : activeNode : null);
	const scrollableAncestorRects = useRects(scrollableAncestors);
	const modifiedTranslate = applyModifiers(modifiers, {
		transform: {
			x: translate.x - nodeRectDelta.x,
			y: translate.y - nodeRectDelta.y,
			scaleX: 1,
			scaleY: 1
		},
		activatorEvent,
		active,
		activeNodeRect,
		containerNodeRect,
		draggingNodeRect,
		over: sensorContext.current.over,
		overlayNodeRect: dragOverlay.rect,
		scrollableAncestors,
		scrollableAncestorRects,
		windowRect
	});
	const pointerCoordinates = activationCoordinates ? add(activationCoordinates, translate) : null;
	const scrollOffsets = useScrollOffsets(scrollableAncestors);
	const scrollAdjustment = useScrollOffsetsDelta(scrollOffsets);
	const activeNodeScrollDelta = useScrollOffsetsDelta(scrollOffsets, [activeNodeRect]);
	const scrollAdjustedTranslate = add(modifiedTranslate, scrollAdjustment);
	const collisionRect = draggingNodeRect ? getAdjustedRect(draggingNodeRect, modifiedTranslate) : null;
	const collisions = active && collisionRect ? collisionDetection({
		active,
		collisionRect,
		droppableRects,
		droppableContainers: enabledDroppableContainers,
		pointerCoordinates
	}) : null;
	const overId = getFirstCollision(collisions, "id");
	const [over, setOver] = (0, import_react.useState)(null);
	const transform = adjustScale(usesDragOverlay ? modifiedTranslate : add(modifiedTranslate, activeNodeScrollDelta), (_over$rect = over == null ? void 0 : over.rect) != null ? _over$rect : null, activeNodeRect);
	const activeSensorRef = (0, import_react.useRef)(null);
	const instantiateSensor = (0, import_react.useCallback)((event, _ref2) => {
		let { sensor: Sensor, options } = _ref2;
		if (activeRef.current == null) return;
		const activeNode = draggableNodes.get(activeRef.current);
		if (!activeNode) return;
		const activatorEvent = event.nativeEvent;
		const sensorInstance = new Sensor({
			active: activeRef.current,
			activeNode,
			event: activatorEvent,
			options,
			context: sensorContext,
			onAbort(id) {
				if (!draggableNodes.get(id)) return;
				const { onDragAbort } = latestProps.current;
				const event = { id };
				onDragAbort?.(event);
				dispatchMonitorEvent({
					type: "onDragAbort",
					event
				});
			},
			onPending(id, constraint, initialCoordinates, offset) {
				if (!draggableNodes.get(id)) return;
				const { onDragPending } = latestProps.current;
				const event = {
					id,
					constraint,
					initialCoordinates,
					offset
				};
				onDragPending?.(event);
				dispatchMonitorEvent({
					type: "onDragPending",
					event
				});
			},
			onStart(initialCoordinates) {
				const id = activeRef.current;
				if (id == null) return;
				const draggableNode = draggableNodes.get(id);
				if (!draggableNode) return;
				const { onDragStart } = latestProps.current;
				const event = {
					activatorEvent,
					active: {
						id,
						data: draggableNode.data,
						rect: activeRects
					}
				};
				(0, import_react_dom.unstable_batchedUpdates)(() => {
					onDragStart?.(event);
					setStatus(Status.Initializing);
					dispatch({
						type: Action.DragStart,
						initialCoordinates,
						active: id
					});
					dispatchMonitorEvent({
						type: "onDragStart",
						event
					});
					setActiveSensor(activeSensorRef.current);
					setActivatorEvent(activatorEvent);
				});
			},
			onMove(coordinates) {
				dispatch({
					type: Action.DragMove,
					coordinates
				});
			},
			onEnd: createHandler(Action.DragEnd),
			onCancel: createHandler(Action.DragCancel)
		});
		activeSensorRef.current = sensorInstance;
		function createHandler(type) {
			return async function handler() {
				const { active, collisions, over, scrollAdjustedTranslate } = sensorContext.current;
				let event = null;
				if (active && scrollAdjustedTranslate) {
					const { cancelDrop } = latestProps.current;
					event = {
						activatorEvent,
						active,
						collisions,
						delta: scrollAdjustedTranslate,
						over
					};
					if (type === Action.DragEnd && typeof cancelDrop === "function") {
						if (await Promise.resolve(cancelDrop(event))) type = Action.DragCancel;
					}
				}
				activeRef.current = null;
				(0, import_react_dom.unstable_batchedUpdates)(() => {
					dispatch({ type });
					setStatus(Status.Uninitialized);
					setOver(null);
					setActiveSensor(null);
					setActivatorEvent(null);
					activeSensorRef.current = null;
					const eventName = type === Action.DragEnd ? "onDragEnd" : "onDragCancel";
					if (event) {
						const handler = latestProps.current[eventName];
						handler?.(event);
						dispatchMonitorEvent({
							type: eventName,
							event
						});
					}
				});
			};
		}
	}, [draggableNodes]);
	const activators = useCombineActivators(sensors, (0, import_react.useCallback)((handler, sensor) => {
		return (event, active) => {
			const nativeEvent = event.nativeEvent;
			const activeDraggableNode = draggableNodes.get(active);
			if (activeRef.current !== null || !activeDraggableNode || nativeEvent.dndKit || nativeEvent.defaultPrevented) return;
			const activationContext = { active: activeDraggableNode };
			if (handler(event, sensor.options, activationContext) === true) {
				nativeEvent.dndKit = { capturedBy: sensor.sensor };
				activeRef.current = active;
				instantiateSensor(event, sensor);
			}
		};
	}, [draggableNodes, instantiateSensor]));
	useSensorSetup(sensors);
	useIsomorphicLayoutEffect(() => {
		if (activeNodeRect && status === Status.Initializing) setStatus(Status.Initialized);
	}, [activeNodeRect, status]);
	(0, import_react.useEffect)(() => {
		const { onDragMove } = latestProps.current;
		const { active, activatorEvent, collisions, over } = sensorContext.current;
		if (!active || !activatorEvent) return;
		const event = {
			active,
			activatorEvent,
			collisions,
			delta: {
				x: scrollAdjustedTranslate.x,
				y: scrollAdjustedTranslate.y
			},
			over
		};
		(0, import_react_dom.unstable_batchedUpdates)(() => {
			onDragMove?.(event);
			dispatchMonitorEvent({
				type: "onDragMove",
				event
			});
		});
	}, [scrollAdjustedTranslate.x, scrollAdjustedTranslate.y]);
	(0, import_react.useEffect)(() => {
		const { active, activatorEvent, collisions, droppableContainers, scrollAdjustedTranslate } = sensorContext.current;
		if (!active || activeRef.current == null || !activatorEvent || !scrollAdjustedTranslate) return;
		const { onDragOver } = latestProps.current;
		const overContainer = droppableContainers.get(overId);
		const over = overContainer && overContainer.rect.current ? {
			id: overContainer.id,
			rect: overContainer.rect.current,
			data: overContainer.data,
			disabled: overContainer.disabled
		} : null;
		const event = {
			active,
			activatorEvent,
			collisions,
			delta: {
				x: scrollAdjustedTranslate.x,
				y: scrollAdjustedTranslate.y
			},
			over
		};
		(0, import_react_dom.unstable_batchedUpdates)(() => {
			setOver(over);
			onDragOver?.(event);
			dispatchMonitorEvent({
				type: "onDragOver",
				event
			});
		});
	}, [overId]);
	useIsomorphicLayoutEffect(() => {
		sensorContext.current = {
			activatorEvent,
			active,
			activeNode,
			collisionRect,
			collisions,
			droppableRects,
			draggableNodes,
			draggingNode,
			draggingNodeRect,
			droppableContainers,
			over,
			scrollableAncestors,
			scrollAdjustedTranslate
		};
		activeRects.current = {
			initial: draggingNodeRect,
			translated: collisionRect
		};
	}, [
		active,
		activeNode,
		collisions,
		collisionRect,
		draggableNodes,
		draggingNode,
		draggingNodeRect,
		droppableRects,
		droppableContainers,
		over,
		scrollableAncestors,
		scrollAdjustedTranslate
	]);
	useAutoScroller({
		...autoScrollOptions,
		delta: translate,
		draggingRect: collisionRect,
		pointerCoordinates,
		scrollableAncestors,
		scrollableAncestorRects
	});
	const publicContext = (0, import_react.useMemo)(() => {
		return {
			active,
			activeNode,
			activeNodeRect,
			activatorEvent,
			collisions,
			containerNodeRect,
			dragOverlay,
			draggableNodes,
			droppableContainers,
			droppableRects,
			over,
			measureDroppableContainers,
			scrollableAncestors,
			scrollableAncestorRects,
			measuringConfiguration,
			measuringScheduled,
			windowRect
		};
	}, [
		active,
		activeNode,
		activeNodeRect,
		activatorEvent,
		collisions,
		containerNodeRect,
		dragOverlay,
		draggableNodes,
		droppableContainers,
		droppableRects,
		over,
		measureDroppableContainers,
		scrollableAncestors,
		scrollableAncestorRects,
		measuringConfiguration,
		measuringScheduled,
		windowRect
	]);
	const internalContext = (0, import_react.useMemo)(() => {
		return {
			activatorEvent,
			activators,
			active,
			activeNodeRect,
			ariaDescribedById: { draggable: draggableDescribedById },
			dispatch,
			draggableNodes,
			over,
			measureDroppableContainers
		};
	}, [
		activatorEvent,
		activators,
		active,
		activeNodeRect,
		dispatch,
		draggableDescribedById,
		draggableNodes,
		over,
		measureDroppableContainers
	]);
	return import_react.createElement(DndMonitorContext.Provider, { value: registerMonitorListener }, import_react.createElement(InternalContext.Provider, { value: internalContext }, import_react.createElement(PublicContext.Provider, { value: publicContext }, import_react.createElement(ActiveDraggableContext.Provider, { value: transform }, children)), import_react.createElement(RestoreFocus, { disabled: (accessibility == null ? void 0 : accessibility.restoreFocus) === false })), import_react.createElement(Accessibility, {
		...accessibility,
		hiddenTextDescribedById: draggableDescribedById
	}));
	function getAutoScrollerOptions() {
		const activeSensorDisablesAutoscroll = (activeSensor == null ? void 0 : activeSensor.autoScrollEnabled) === false;
		const autoScrollGloballyDisabled = typeof autoScroll === "object" ? autoScroll.enabled === false : autoScroll === false;
		const enabled = isInitialized && !activeSensorDisablesAutoscroll && !autoScrollGloballyDisabled;
		if (typeof autoScroll === "object") return {
			...autoScroll,
			enabled
		};
		return { enabled };
	}
});
var NullContext = /*#__PURE__*/ (0, import_react.createContext)(null);
var defaultRole = "button";
var ID_PREFIX = "Draggable";
function useDraggable(_ref) {
	let { id, data, disabled = false, attributes } = _ref;
	const key = useUniqueId(ID_PREFIX);
	const { activators, activatorEvent, active, activeNodeRect, ariaDescribedById, draggableNodes, over } = (0, import_react.useContext)(InternalContext);
	const { role = defaultRole, roleDescription = "draggable", tabIndex = 0 } = attributes != null ? attributes : {};
	const isDragging = (active == null ? void 0 : active.id) === id;
	const transform = (0, import_react.useContext)(isDragging ? ActiveDraggableContext : NullContext);
	const [node, setNodeRef] = useNodeRef();
	const [activatorNode, setActivatorNodeRef] = useNodeRef();
	const listeners = useSyntheticListeners(activators, id);
	const dataRef = useLatestValue(data);
	useIsomorphicLayoutEffect(() => {
		draggableNodes.set(id, {
			id,
			key,
			node,
			activatorNode,
			data: dataRef
		});
		return () => {
			const node = draggableNodes.get(id);
			if (node && node.key === key) draggableNodes.delete(id);
		};
	}, [draggableNodes, id]);
	return {
		active,
		activatorEvent,
		activeNodeRect,
		attributes: (0, import_react.useMemo)(() => ({
			role,
			tabIndex,
			"aria-disabled": disabled,
			"aria-pressed": isDragging && role === defaultRole ? true : void 0,
			"aria-roledescription": roleDescription,
			"aria-describedby": ariaDescribedById.draggable
		}), [
			disabled,
			role,
			tabIndex,
			isDragging,
			roleDescription,
			ariaDescribedById.draggable
		]),
		isDragging,
		listeners: disabled ? void 0 : listeners,
		node,
		over,
		setNodeRef,
		setActivatorNodeRef,
		transform
	};
}
function useDndContext() {
	return (0, import_react.useContext)(PublicContext);
}
var ID_PREFIX$1 = "Droppable";
var defaultResizeObserverConfig = { timeout: 25 };
function useDroppable(_ref) {
	let { data, disabled = false, id, resizeObserverConfig } = _ref;
	const key = useUniqueId(ID_PREFIX$1);
	const { active, dispatch, over, measureDroppableContainers } = (0, import_react.useContext)(InternalContext);
	const previous = (0, import_react.useRef)({ disabled });
	const resizeObserverConnected = (0, import_react.useRef)(false);
	const rect = (0, import_react.useRef)(null);
	const callbackId = (0, import_react.useRef)(null);
	const { disabled: resizeObserverDisabled, updateMeasurementsFor, timeout: resizeObserverTimeout } = {
		...defaultResizeObserverConfig,
		...resizeObserverConfig
	};
	const ids = useLatestValue(updateMeasurementsFor != null ? updateMeasurementsFor : id);
	const resizeObserver = useResizeObserver({
		callback: (0, import_react.useCallback)(() => {
			if (!resizeObserverConnected.current) {
				resizeObserverConnected.current = true;
				return;
			}
			if (callbackId.current != null) clearTimeout(callbackId.current);
			callbackId.current = setTimeout(() => {
				measureDroppableContainers(Array.isArray(ids.current) ? ids.current : [ids.current]);
				callbackId.current = null;
			}, resizeObserverTimeout);
		}, [resizeObserverTimeout]),
		disabled: resizeObserverDisabled || !active
	});
	const [nodeRef, setNodeRef] = useNodeRef((0, import_react.useCallback)((newElement, previousElement) => {
		if (!resizeObserver) return;
		if (previousElement) {
			resizeObserver.unobserve(previousElement);
			resizeObserverConnected.current = false;
		}
		if (newElement) resizeObserver.observe(newElement);
	}, [resizeObserver]));
	const dataRef = useLatestValue(data);
	(0, import_react.useEffect)(() => {
		if (!resizeObserver || !nodeRef.current) return;
		resizeObserver.disconnect();
		resizeObserverConnected.current = false;
		resizeObserver.observe(nodeRef.current);
	}, [nodeRef, resizeObserver]);
	(0, import_react.useEffect)(() => {
		dispatch({
			type: Action.RegisterDroppable,
			element: {
				id,
				key,
				disabled,
				node: nodeRef,
				rect,
				data: dataRef
			}
		});
		return () => dispatch({
			type: Action.UnregisterDroppable,
			key,
			id
		});
	}, [id]);
	(0, import_react.useEffect)(() => {
		if (disabled !== previous.current.disabled) {
			dispatch({
				type: Action.SetDroppableDisabled,
				id,
				key,
				disabled
			});
			previous.current.disabled = disabled;
		}
	}, [
		id,
		key,
		disabled,
		dispatch
	]);
	return {
		active,
		rect,
		isOver: (over == null ? void 0 : over.id) === id,
		node: nodeRef,
		over,
		setNodeRef
	};
}
function AnimationManager(_ref) {
	let { animation, children } = _ref;
	const [clonedChildren, setClonedChildren] = (0, import_react.useState)(null);
	const [element, setElement] = (0, import_react.useState)(null);
	const previousChildren = usePrevious(children);
	if (!children && !clonedChildren && previousChildren) setClonedChildren(previousChildren);
	useIsomorphicLayoutEffect(() => {
		if (!element) return;
		const key = clonedChildren == null ? void 0 : clonedChildren.key;
		const id = clonedChildren == null ? void 0 : clonedChildren.props.id;
		if (key == null || id == null) {
			setClonedChildren(null);
			return;
		}
		Promise.resolve(animation(id, element)).then(() => {
			setClonedChildren(null);
		});
	}, [
		animation,
		clonedChildren,
		element
	]);
	return import_react.createElement(import_react.Fragment, null, children, clonedChildren ? (0, import_react.cloneElement)(clonedChildren, { ref: setElement }) : null);
}
var defaultTransform = {
	x: 0,
	y: 0,
	scaleX: 1,
	scaleY: 1
};
function NullifiedContextProvider(_ref) {
	let { children } = _ref;
	return import_react.createElement(InternalContext.Provider, { value: defaultInternalContext }, import_react.createElement(ActiveDraggableContext.Provider, { value: defaultTransform }, children));
}
var baseStyles = {
	position: "fixed",
	touchAction: "none"
};
var defaultTransition = (activatorEvent) => {
	return isKeyboardEvent(activatorEvent) ? "transform 250ms ease" : void 0;
};
var PositionedOverlay = /*#__PURE__*/ (0, import_react.forwardRef)((_ref, ref) => {
	let { as, activatorEvent, adjustScale, children, className, rect, style, transform, transition = defaultTransition } = _ref;
	if (!rect) return null;
	const scaleAdjustedTransform = adjustScale ? transform : {
		...transform,
		scaleX: 1,
		scaleY: 1
	};
	const styles = {
		...baseStyles,
		width: rect.width,
		height: rect.height,
		top: rect.top,
		left: rect.left,
		transform: CSS.Transform.toString(scaleAdjustedTransform),
		transformOrigin: adjustScale && activatorEvent ? getRelativeTransformOrigin(activatorEvent, rect) : void 0,
		transition: typeof transition === "function" ? transition(activatorEvent) : transition,
		...style
	};
	return import_react.createElement(as, {
		className,
		style: styles,
		ref
	}, children);
});
var defaultDropAnimationSideEffects = (options) => (_ref) => {
	let { active, dragOverlay } = _ref;
	const originalStyles = {};
	const { styles, className } = options;
	if (styles != null && styles.active) for (const [key, value] of Object.entries(styles.active)) {
		if (value === void 0) continue;
		originalStyles[key] = active.node.style.getPropertyValue(key);
		active.node.style.setProperty(key, value);
	}
	if (styles != null && styles.dragOverlay) for (const [key, value] of Object.entries(styles.dragOverlay)) {
		if (value === void 0) continue;
		dragOverlay.node.style.setProperty(key, value);
	}
	if (className != null && className.active) active.node.classList.add(className.active);
	if (className != null && className.dragOverlay) dragOverlay.node.classList.add(className.dragOverlay);
	return function cleanup() {
		for (const [key, value] of Object.entries(originalStyles)) active.node.style.setProperty(key, value);
		if (className != null && className.active) active.node.classList.remove(className.active);
	};
};
var defaultKeyframeResolver = (_ref2) => {
	let { transform: { initial, final } } = _ref2;
	return [{ transform: CSS.Transform.toString(initial) }, { transform: CSS.Transform.toString(final) }];
};
var defaultDropAnimationConfiguration = {
	duration: 250,
	easing: "ease",
	keyframes: defaultKeyframeResolver,
	sideEffects: /*#__PURE__*/ defaultDropAnimationSideEffects({ styles: { active: { opacity: "0" } } })
};
function useDropAnimation(_ref3) {
	let { config, draggableNodes, droppableContainers, measuringConfiguration } = _ref3;
	return useEvent((id, node) => {
		if (config === null) return;
		const activeDraggable = draggableNodes.get(id);
		if (!activeDraggable) return;
		const activeNode = activeDraggable.node.current;
		if (!activeNode) return;
		const measurableNode = getMeasurableNode(node);
		if (!measurableNode) return;
		const { transform } = getWindow(node).getComputedStyle(node);
		const parsedTransform = parseTransform(transform);
		if (!parsedTransform) return;
		const animation = typeof config === "function" ? config : createDefaultDropAnimation(config);
		scrollIntoViewIfNeeded(activeNode, measuringConfiguration.draggable.measure);
		return animation({
			active: {
				id,
				data: activeDraggable.data,
				node: activeNode,
				rect: measuringConfiguration.draggable.measure(activeNode)
			},
			draggableNodes,
			dragOverlay: {
				node,
				rect: measuringConfiguration.dragOverlay.measure(measurableNode)
			},
			droppableContainers,
			measuringConfiguration,
			transform: parsedTransform
		});
	});
}
function createDefaultDropAnimation(options) {
	const { duration, easing, sideEffects, keyframes } = {
		...defaultDropAnimationConfiguration,
		...options
	};
	return (_ref4) => {
		let { active, dragOverlay, transform, ...rest } = _ref4;
		if (!duration) return;
		const delta = {
			x: dragOverlay.rect.left - active.rect.left,
			y: dragOverlay.rect.top - active.rect.top
		};
		const scale = {
			scaleX: transform.scaleX !== 1 ? active.rect.width * transform.scaleX / dragOverlay.rect.width : 1,
			scaleY: transform.scaleY !== 1 ? active.rect.height * transform.scaleY / dragOverlay.rect.height : 1
		};
		const finalTransform = {
			x: transform.x - delta.x,
			y: transform.y - delta.y,
			...scale
		};
		const animationKeyframes = keyframes({
			...rest,
			active,
			dragOverlay,
			transform: {
				initial: transform,
				final: finalTransform
			}
		});
		const [firstKeyframe] = animationKeyframes;
		const lastKeyframe = animationKeyframes[animationKeyframes.length - 1];
		if (JSON.stringify(firstKeyframe) === JSON.stringify(lastKeyframe)) return;
		const cleanup = sideEffects == null ? void 0 : sideEffects({
			active,
			dragOverlay,
			...rest
		});
		const animation = dragOverlay.node.animate(animationKeyframes, {
			duration,
			easing,
			fill: "forwards"
		});
		return new Promise((resolve) => {
			animation.onfinish = () => {
				cleanup?.();
				resolve();
			};
		});
	};
}
var key = 0;
function useKey(id) {
	return (0, import_react.useMemo)(() => {
		if (id == null) return;
		key++;
		return key;
	}, [id]);
}
var DragOverlay = /*#__PURE__*/ import_react.memo((_ref) => {
	let { adjustScale = false, children, dropAnimation: dropAnimationConfig, style, transition, modifiers, wrapperElement = "div", className, zIndex = 999 } = _ref;
	const { activatorEvent, active, activeNodeRect, containerNodeRect, draggableNodes, droppableContainers, dragOverlay, over, measuringConfiguration, scrollableAncestors, scrollableAncestorRects, windowRect } = useDndContext();
	const transform = (0, import_react.useContext)(ActiveDraggableContext);
	const key = useKey(active == null ? void 0 : active.id);
	const modifiedTransform = applyModifiers(modifiers, {
		activatorEvent,
		active,
		activeNodeRect,
		containerNodeRect,
		draggingNodeRect: dragOverlay.rect,
		over,
		overlayNodeRect: dragOverlay.rect,
		scrollableAncestors,
		scrollableAncestorRects,
		transform,
		windowRect
	});
	const initialRect = useInitialValue(activeNodeRect);
	const dropAnimation = useDropAnimation({
		config: dropAnimationConfig,
		draggableNodes,
		droppableContainers,
		measuringConfiguration
	});
	const ref = initialRect ? dragOverlay.setRef : void 0;
	return import_react.createElement(NullifiedContextProvider, null, import_react.createElement(AnimationManager, { animation: dropAnimation }, active && key ? import_react.createElement(PositionedOverlay, {
		key,
		id: active.id,
		ref,
		as: wrapperElement,
		activatorEvent,
		adjustScale,
		className,
		transition,
		rect: initialRect,
		style: {
			zIndex,
			...style
		},
		transform: modifiedTransform
	}, children) : null));
});
//#endregion
//#region node_modules/preact/dist/preact.module.js
var n;
var l$1;
var u$1;
var i$1;
var t$1;
var r$1;
var o;
var f$1;
var e$1;
var c$1 = {};
var s = [];
var a$1 = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;
function h(n, l) {
	for (var u in l) n[u] = l[u];
	return n;
}
function v$1(n) {
	var l = n.parentNode;
	l && l.removeChild(n);
}
function y(l, u, i) {
	var t, r, o, f = {};
	for (o in u) "key" == o ? t = u[o] : "ref" == o ? r = u[o] : f[o] = u[o];
	if (arguments.length > 2 && (f.children = arguments.length > 3 ? n.call(arguments, 2) : i), "function" == typeof l && null != l.defaultProps) for (o in l.defaultProps) void 0 === f[o] && (f[o] = l.defaultProps[o]);
	return p(l, f, t, r, null);
}
function p(n, i, t, r, o) {
	var f = {
		type: n,
		props: i,
		key: t,
		ref: r,
		__k: null,
		__: null,
		__b: 0,
		__e: null,
		__d: void 0,
		__c: null,
		__h: null,
		constructor: void 0,
		__v: null == o ? ++u$1 : o
	};
	return null == o && null != l$1.vnode && l$1.vnode(f), f;
}
function d() {
	return { current: null };
}
function _(n) {
	return n.children;
}
function k$1(n, l, u, i, t) {
	var r;
	for (r in u) "children" === r || "key" === r || r in l || g$2(n, r, null, u[r], i);
	for (r in l) t && "function" != typeof l[r] || "children" === r || "key" === r || "value" === r || "checked" === r || u[r] === l[r] || g$2(n, r, l[r], u[r], i);
}
function b$1(n, l, u) {
	"-" === l[0] ? n.setProperty(l, null == u ? "" : u) : n[l] = null == u ? "" : "number" != typeof u || a$1.test(l) ? u : u + "px";
}
function g$2(n, l, u, i, t) {
	var r;
	n: if ("style" === l) if ("string" == typeof u) n.style.cssText = u;
	else {
		if ("string" == typeof i && (n.style.cssText = i = ""), i) for (l in i) u && l in u || b$1(n.style, l, "");
		if (u) for (l in u) i && u[l] === i[l] || b$1(n.style, l, u[l]);
	}
	else if ("o" === l[0] && "n" === l[1]) r = l !== (l = l.replace(/Capture$/, "")), l = l.toLowerCase() in n ? l.toLowerCase().slice(2) : l.slice(2), n.l || (n.l = {}), n.l[l + r] = u, u ? i || n.addEventListener(l, r ? w$2 : m$1, r) : n.removeEventListener(l, r ? w$2 : m$1, r);
	else if ("dangerouslySetInnerHTML" !== l) {
		if (t) l = l.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
		else if ("width" !== l && "height" !== l && "href" !== l && "list" !== l && "form" !== l && "tabIndex" !== l && "download" !== l && l in n) try {
			n[l] = null == u ? "" : u;
			break n;
		} catch (n) {}
		"function" == typeof u || (null == u || !1 === u && -1 == l.indexOf("-") ? n.removeAttribute(l) : n.setAttribute(l, u));
	}
}
function m$1(n) {
	t$1 = !0;
	try {
		return this.l[n.type + !1](l$1.event ? l$1.event(n) : n);
	} finally {
		t$1 = !1;
	}
}
function w$2(n) {
	t$1 = !0;
	try {
		return this.l[n.type + !0](l$1.event ? l$1.event(n) : n);
	} finally {
		t$1 = !1;
	}
}
function x$1(n, l) {
	this.props = n, this.context = l;
}
function A(n, l) {
	if (null == l) return n.__ ? A(n.__, n.__.__k.indexOf(n) + 1) : null;
	for (var u; l < n.__k.length; l++) if (null != (u = n.__k[l]) && null != u.__e) return u.__e;
	return "function" == typeof n.type ? A(n) : null;
}
function P$1(n) {
	var l, u;
	if (null != (n = n.__) && null != n.__c) {
		for (n.__e = n.__c.base = null, l = 0; l < n.__k.length; l++) if (null != (u = n.__k[l]) && null != u.__e) {
			n.__e = n.__c.base = u.__e;
			break;
		}
		return P$1(n);
	}
}
function C$1(n) {
	t$1 ? setTimeout(n) : f$1(n);
}
function T$1(n) {
	(!n.__d && (n.__d = !0) && r$1.push(n) && !$$1.__r++ || o !== l$1.debounceRendering) && ((o = l$1.debounceRendering) || C$1)($$1);
}
function $$1() {
	var n, l, u, i, t, o, f, e;
	for (r$1.sort(function(n, l) {
		return n.__v.__b - l.__v.__b;
	}); n = r$1.shift();) n.__d && (l = r$1.length, i = void 0, t = void 0, f = (o = (u = n).__v).__e, (e = u.__P) && (i = [], (t = h({}, o)).__v = o.__v + 1, M(e, o, t, u.__n, void 0 !== e.ownerSVGElement, null != o.__h ? [f] : null, i, null == f ? A(o) : f, o.__h), N$1(i, o), o.__e != f && P$1(o)), r$1.length > l && r$1.sort(function(n, l) {
		return n.__v.__b - l.__v.__b;
	}));
	$$1.__r = 0;
}
function H$1(n, l, u, i, t, r, o, f, e, a) {
	var h, v, y, d, k, b, g, m = i && i.__k || s, w = m.length;
	for (u.__k = [], h = 0; h < l.length; h++) if (null != (d = u.__k[h] = null == (d = l[h]) || "boolean" == typeof d ? null : "string" == typeof d || "number" == typeof d || "bigint" == typeof d ? p(null, d, null, null, d) : Array.isArray(d) ? p(_, { children: d }, null, null, null) : d.__b > 0 ? p(d.type, d.props, d.key, d.ref ? d.ref : null, d.__v) : d)) {
		if (d.__ = u, d.__b = u.__b + 1, null === (y = m[h]) || y && d.key == y.key && d.type === y.type) m[h] = void 0;
		else for (v = 0; v < w; v++) {
			if ((y = m[v]) && d.key == y.key && d.type === y.type) {
				m[v] = void 0;
				break;
			}
			y = null;
		}
		M(n, d, y = y || c$1, t, r, o, f, e, a), k = d.__e, (v = d.ref) && y.ref != v && (g || (g = []), y.ref && g.push(y.ref, null, d), g.push(v, d.__c || k, d)), null != k ? (b ??= k, "function" == typeof d.type && d.__k === y.__k ? d.__d = e = I$1(d, e, n) : e = z$1(n, d, y, m, k, e), "function" == typeof u.type && (u.__d = e)) : e && y.__e == e && e.parentNode != n && (e = A(y));
	}
	for (u.__e = b, h = w; h--;) null != m[h] && ("function" == typeof u.type && null != m[h].__e && m[h].__e == u.__d && (u.__d = L$1(i).nextSibling), q(m[h], m[h]));
	if (g) for (h = 0; h < g.length; h++) S(g[h], g[++h], g[++h]);
}
function I$1(n, l, u) {
	for (var i, t = n.__k, r = 0; t && r < t.length; r++) (i = t[r]) && (i.__ = n, l = "function" == typeof i.type ? I$1(i, l, u) : z$1(u, i, i, t, i.__e, l));
	return l;
}
function j$2(n, l) {
	return l = l || [], null == n || "boolean" == typeof n || (Array.isArray(n) ? n.some(function(n) {
		j$2(n, l);
	}) : l.push(n)), l;
}
function z$1(n, l, u, i, t, r) {
	var o, f, e;
	if (void 0 !== l.__d) o = l.__d, l.__d = void 0;
	else if (null == u || t != r || null == t.parentNode) n: if (null == r || r.parentNode !== n) n.appendChild(t), o = null;
	else {
		for (f = r, e = 0; (f = f.nextSibling) && e < i.length; e += 1) if (f == t) break n;
		n.insertBefore(t, r), o = r;
	}
	return void 0 !== o ? o : t.nextSibling;
}
function L$1(n) {
	var l, u, i;
	if (null == n.type || "string" == typeof n.type) return n.__e;
	if (n.__k) {
		for (l = n.__k.length - 1; l >= 0; l--) if ((u = n.__k[l]) && (i = L$1(u))) return i;
	}
	return null;
}
function M(n, u, i, t, r, o, f, e, c) {
	var s, a, v, y, p, d, k, b, g, m, w, A, P, C, T, $ = u.type;
	if (void 0 !== u.constructor) return null;
	null != i.__h && (c = i.__h, e = u.__e = i.__e, u.__h = null, o = [e]), (s = l$1.__b) && s(u);
	try {
		n: if ("function" == typeof $) {
			if (b = u.props, g = (s = $.contextType) && t[s.__c], m = s ? g ? g.props.value : s.__ : t, i.__c ? k = (a = u.__c = i.__c).__ = a.__E : ("prototype" in $ && $.prototype.render ? u.__c = a = new $(b, m) : (u.__c = a = new x$1(b, m), a.constructor = $, a.render = B$1), g && g.sub(a), a.props = b, a.state || (a.state = {}), a.context = m, a.__n = t, v = a.__d = !0, a.__h = [], a._sb = []), a.__s ?? (a.__s = a.state), null != $.getDerivedStateFromProps && (a.__s == a.state && (a.__s = h({}, a.__s)), h(a.__s, $.getDerivedStateFromProps(b, a.__s))), y = a.props, p = a.state, a.__v = u, v) null == $.getDerivedStateFromProps && null != a.componentWillMount && a.componentWillMount(), null != a.componentDidMount && a.__h.push(a.componentDidMount);
			else {
				if (null == $.getDerivedStateFromProps && b !== y && null != a.componentWillReceiveProps && a.componentWillReceiveProps(b, m), !a.__e && null != a.shouldComponentUpdate && !1 === a.shouldComponentUpdate(b, a.__s, m) || u.__v === i.__v) {
					for (u.__v !== i.__v && (a.props = b, a.state = a.__s, a.__d = !1), u.__e = i.__e, u.__k = i.__k, u.__k.forEach(function(n) {
						n && (n.__ = u);
					}), w = 0; w < a._sb.length; w++) a.__h.push(a._sb[w]);
					a._sb = [], a.__h.length && f.push(a);
					break n;
				}
				null != a.componentWillUpdate && a.componentWillUpdate(b, a.__s, m), null != a.componentDidUpdate && a.__h.push(function() {
					a.componentDidUpdate(y, p, d);
				});
			}
			if (a.context = m, a.props = b, a.__P = n, A = l$1.__r, P = 0, "prototype" in $ && $.prototype.render) {
				for (a.state = a.__s, a.__d = !1, A && A(u), s = a.render(a.props, a.state, a.context), C = 0; C < a._sb.length; C++) a.__h.push(a._sb[C]);
				a._sb = [];
			} else do
				a.__d = !1, A && A(u), s = a.render(a.props, a.state, a.context), a.state = a.__s;
			while (a.__d && ++P < 25);
			a.state = a.__s, null != a.getChildContext && (t = h(h({}, t), a.getChildContext())), v || null == a.getSnapshotBeforeUpdate || (d = a.getSnapshotBeforeUpdate(y, p)), T = null != s && s.type === _ && null == s.key ? s.props.children : s, H$1(n, Array.isArray(T) ? T : [T], u, i, t, r, o, f, e, c), a.base = u.__e, u.__h = null, a.__h.length && f.push(a), k && (a.__E = a.__ = null), a.__e = !1;
		} else null == o && u.__v === i.__v ? (u.__k = i.__k, u.__e = i.__e) : u.__e = O(i.__e, u, i, t, r, o, f, c);
		(s = l$1.diffed) && s(u);
	} catch (n) {
		u.__v = null, (c || null != o) && (u.__e = e, u.__h = !!c, o[o.indexOf(e)] = null), l$1.__e(n, u, i);
	}
}
function N$1(n, u) {
	l$1.__c && l$1.__c(u, n), n.some(function(u) {
		try {
			n = u.__h, u.__h = [], n.some(function(n) {
				n.call(u);
			});
		} catch (n) {
			l$1.__e(n, u.__v);
		}
	});
}
function O(l, u, i, t, r, o, f, e) {
	var s, a, h, y = i.props, p = u.props, d = u.type, _ = 0;
	if ("svg" === d && (r = !0), null != o) {
		for (; _ < o.length; _++) if ((s = o[_]) && "setAttribute" in s == !!d && (d ? s.localName === d : 3 === s.nodeType)) {
			l = s, o[_] = null;
			break;
		}
	}
	if (null == l) {
		if (null === d) return document.createTextNode(p);
		l = r ? document.createElementNS("http://www.w3.org/2000/svg", d) : document.createElement(d, p.is && p), o = null, e = !1;
	}
	if (null === d) y === p || e && l.data === p || (l.data = p);
	else {
		if (o = o && n.call(l.childNodes), a = (y = i.props || c$1).dangerouslySetInnerHTML, h = p.dangerouslySetInnerHTML, !e) {
			if (null != o) for (y = {}, _ = 0; _ < l.attributes.length; _++) y[l.attributes[_].name] = l.attributes[_].value;
			(h || a) && (h && (a && h.__html == a.__html || h.__html === l.innerHTML) || (l.innerHTML = h && h.__html || ""));
		}
		if (k$1(l, p, y, r, e), h) u.__k = [];
		else if (_ = u.props.children, H$1(l, Array.isArray(_) ? _ : [_], u, i, t, r && "foreignObject" !== d, o, f, o ? o[0] : i.__k && A(i, 0), e), null != o) for (_ = o.length; _--;) null != o[_] && v$1(o[_]);
		e || ("value" in p && void 0 !== (_ = p.value) && (_ !== l.value || "progress" === d && !_ || "option" === d && _ !== y.value) && g$2(l, "value", _, y.value, !1), "checked" in p && void 0 !== (_ = p.checked) && _ !== l.checked && g$2(l, "checked", _, y.checked, !1));
	}
	return l;
}
function S(n, u, i) {
	try {
		"function" == typeof n ? n(u) : n.current = u;
	} catch (n) {
		l$1.__e(n, i);
	}
}
function q(n, u, i) {
	var t, r;
	if (l$1.unmount && l$1.unmount(n), (t = n.ref) && (t.current && t.current !== n.__e || S(t, null, u)), null != (t = n.__c)) {
		if (t.componentWillUnmount) try {
			t.componentWillUnmount();
		} catch (n) {
			l$1.__e(n, u);
		}
		t.base = t.__P = null, n.__c = void 0;
	}
	if (t = n.__k) for (r = 0; r < t.length; r++) t[r] && q(t[r], u, i || "function" != typeof n.type);
	i || null == n.__e || v$1(n.__e), n.__ = n.__e = n.__d = void 0;
}
function B$1(n, l, u) {
	return this.constructor(n, u);
}
function D$1(u, i, t) {
	var r, o, f;
	l$1.__ && l$1.__(u, i), o = (r = "function" == typeof t) ? null : t && t.__k || i.__k, f = [], M(i, u = (!r && t || i).__k = y(_, null, [u]), o || c$1, c$1, void 0 !== i.ownerSVGElement, !r && t ? [t] : o ? null : i.firstChild ? n.call(i.childNodes) : null, f, !r && t ? t : o ? o.__e : i.firstChild, r), N$1(f, u);
}
function G$1(n, l) {
	var u = {
		__c: l = "__cC" + e$1++,
		__: n,
		Consumer: function(n, l) {
			return n.children(l);
		},
		Provider: function(n) {
			var u, i;
			return this.getChildContext || (u = [], (i = {})[l] = this, this.getChildContext = function() {
				return i;
			}, this.shouldComponentUpdate = function(n) {
				this.props.value !== n.value && u.some(function(n) {
					n.__e = !0, T$1(n);
				});
			}, this.sub = function(n) {
				u.push(n);
				var l = n.componentWillUnmount;
				n.componentWillUnmount = function() {
					u.splice(u.indexOf(n), 1), l && l.call(n);
				};
			}), n.children;
		}
	};
	return u.Provider.__ = u.Consumer.contextType = u;
}
n = s.slice, l$1 = { __e: function(n, l, u, i) {
	for (var t, r, o; l = l.__;) if ((t = l.__c) && !t.__) try {
		if ((r = t.constructor) && null != r.getDerivedStateFromError && (t.setState(r.getDerivedStateFromError(n)), o = t.__d), null != t.componentDidCatch && (t.componentDidCatch(n, i || {}), o = t.__d), o) return t.__E = t;
	} catch (l) {
		n = l;
	}
	throw n;
} }, u$1 = 0, i$1 = function(n) {
	return null != n && void 0 === n.constructor;
}, t$1 = !1, x$1.prototype.setState = function(n, l) {
	var u = null != this.__s && this.__s !== this.state ? this.__s : this.__s = h({}, this.state);
	"function" == typeof n && (n = n(h({}, u), this.props)), n && h(u, n), null != n && this.__v && (l && this._sb.push(l), T$1(this));
}, x$1.prototype.forceUpdate = function(n) {
	this.__v && (this.__e = !0, n && this.__h.push(n), T$1(this));
}, x$1.prototype.render = _, r$1 = [], f$1 = "function" == typeof Promise ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, $$1.__r = 0, e$1 = 0;
var r;
var u;
var i;
var f = [];
var c = [];
var e = l$1.__b;
var a = l$1.__r;
var v = l$1.diffed;
var l = l$1.__c;
var m = l$1.unmount;
function b() {
	for (var t; t = f.shift();) if (t.__P && t.__H) try {
		t.__H.__h.forEach(k), t.__H.__h.forEach(w$1), t.__H.__h = [];
	} catch (r) {
		t.__H.__h = [], l$1.__e(r, t.__v);
	}
}
l$1.__b = function(n) {
	r = null, e && e(n);
}, l$1.__r = function(n) {
	a && a(n);
	var i = (r = n.__c).__H;
	i && (u === r ? (i.__h = [], r.__h = [], i.__.forEach(function(n) {
		n.__N && (n.__ = n.__N), n.__V = c, n.__N = n.i = void 0;
	})) : (i.__h.forEach(k), i.__h.forEach(w$1), i.__h = [])), u = r;
}, l$1.diffed = function(t) {
	v && v(t);
	var o = t.__c;
	o && o.__H && (o.__H.__h.length && (1 !== f.push(o) && i === l$1.requestAnimationFrame || ((i = l$1.requestAnimationFrame) || j$1)(b)), o.__H.__.forEach(function(n) {
		n.i && (n.__H = n.i), n.__V !== c && (n.__ = n.__V), n.i = void 0, n.__V = c;
	})), u = r = null;
}, l$1.__c = function(t, r) {
	r.some(function(t) {
		try {
			t.__h.forEach(k), t.__h = t.__h.filter(function(n) {
				return !n.__ || w$1(n);
			});
		} catch (u) {
			r.some(function(n) {
				n.__h && (n.__h = []);
			}), r = [], l$1.__e(u, t.__v);
		}
	}), l && l(t, r);
}, l$1.unmount = function(t) {
	m && m(t);
	var r, u = t.__c;
	u && u.__H && (u.__H.__.forEach(function(n) {
		try {
			k(n);
		} catch (n) {
			r = n;
		}
	}), u.__H = void 0, r && l$1.__e(r, u.__v));
};
var g$1 = "function" == typeof requestAnimationFrame;
function j$1(n) {
	var t, r = function() {
		clearTimeout(u), g$1 && cancelAnimationFrame(t), setTimeout(n);
	}, u = setTimeout(r, 100);
	g$1 && (t = requestAnimationFrame(r));
}
function k(n) {
	var t = r, u = n.__c;
	"function" == typeof u && (n.__c = void 0, u()), r = t;
}
function w$1(n) {
	var t = r;
	n.__c = n.__(), r = t;
}
//#endregion
//#region node_modules/preact/compat/dist/compat.module.js
function g(n, t) {
	for (var e in t) n[e] = t[e];
	return n;
}
function C(n, t) {
	for (var e in n) if ("__source" !== e && !(e in t)) return !0;
	for (var r in t) if ("__source" !== r && n[r] !== t[r]) return !0;
	return !1;
}
function w(n) {
	this.props = n;
}
(w.prototype = new x$1()).isPureReactComponent = !0, w.prototype.shouldComponentUpdate = function(n, t) {
	return C(this.props, n) || C(this.state, t);
};
var x = l$1.__b;
l$1.__b = function(n) {
	n.type && n.type.__f && n.ref && (n.props.ref = n.ref, n.ref = null), x && x(n);
};
"undefined" != typeof Symbol && Symbol.for;
var T = l$1.__e;
l$1.__e = function(n, t, e, r) {
	if (n.then) {
		for (var u, o = t; o = o.__;) if ((u = o.__c) && u.__c) return t.__e ?? (t.__e = e.__e, t.__k = e.__k), u.__c(n, t);
	}
	T(n, t, e, r);
};
var I = l$1.unmount;
function L(n, t, e) {
	return n && (n.__c && n.__c.__H && (n.__c.__H.__.forEach(function(n) {
		"function" == typeof n.__c && n.__c();
	}), n.__c.__H = null), null != (n = g({}, n)).__c && (n.__c.__P === e && (n.__c.__P = t), n.__c = null), n.__k = n.__k && n.__k.map(function(n) {
		return L(n, t, e);
	})), n;
}
function U(n, t, e) {
	return n && (n.__v = null, n.__k = n.__k && n.__k.map(function(n) {
		return U(n, t, e);
	}), n.__c && n.__c.__P === t && (n.__e && e.insertBefore(n.__e, n.__d), n.__c.__e = !0, n.__c.__P = e)), n;
}
function D() {
	this.__u = 0, this.t = null, this.__b = null;
}
function F(n) {
	var t = n.__.__c;
	return t && t.__a && t.__a(n);
}
function V() {
	this.u = null, this.o = null;
}
l$1.unmount = function(n) {
	var t = n.__c;
	t && t.__R && t.__R(), t && !0 === n.__h && (n.type = null), I && I(n);
}, (D.prototype = new x$1()).__c = function(n, t) {
	var e = t.__c, r = this;
	r.t ??= [], r.t.push(e);
	var u = F(r.__v), o = !1, i = function() {
		o || (o = !0, e.__R = null, u ? u(l) : l());
	};
	e.__R = i;
	var l = function() {
		if (!--r.__u) {
			if (r.state.__a) {
				var n = r.state.__a;
				r.__v.__k[0] = U(n, n.__c.__P, n.__c.__O);
			}
			var t;
			for (r.setState({ __a: r.__b = null }); t = r.t.pop();) t.forceUpdate();
		}
	}, c = !0 === t.__h;
	r.__u++ || c || r.setState({ __a: r.__b = r.__v.__k[0] }), n.then(i, i);
}, D.prototype.componentWillUnmount = function() {
	this.t = [];
}, D.prototype.render = function(n, e) {
	if (this.__b) {
		if (this.__v.__k) {
			var r = document.createElement("div"), o = this.__v.__k[0].__c;
			this.__v.__k[0] = L(this.__b, r, o.__O = o.__P);
		}
		this.__b = null;
	}
	var i = e.__a && y(_, null, n.fallback);
	return i && (i.__h = null), [y(_, null, e.__a ? null : n.children), i];
};
var W = function(n, t, e) {
	if (++e[1] === e[0] && n.o.delete(t), n.props.revealOrder && ("t" !== n.props.revealOrder[0] || !n.o.size)) for (e = n.u; e;) {
		for (; e.length > 3;) e.pop()();
		if (e[1] < e[0]) break;
		n.u = e = e[2];
	}
};
function P(n) {
	return this.getChildContext = function() {
		return n.context;
	}, n.children;
}
function $(n) {
	var e = this, r = n.i;
	e.componentWillUnmount = function() {
		D$1(null, e.l), e.l = null, e.i = null;
	}, e.i && e.i !== r && e.componentWillUnmount(), n.__v ? (e.l || (e.i = r, e.l = {
		nodeType: 1,
		parentNode: r,
		childNodes: [],
		appendChild: function(n) {
			this.childNodes.push(n), e.i.appendChild(n);
		},
		insertBefore: function(n, t) {
			this.childNodes.push(n), e.i.appendChild(n);
		},
		removeChild: function(n) {
			this.childNodes.splice(this.childNodes.indexOf(n) >>> 1, 1), e.i.removeChild(n);
		}
	}), D$1(y(P, { context: e.context }, n.__v), e.l)) : e.l && e.componentWillUnmount();
}
function j(n, e) {
	var r = y($, {
		__v: n,
		i: e
	});
	return r.containerInfo = e, r;
}
(V.prototype = new x$1()).__a = function(n) {
	var t = this, e = F(t.__v), r = t.o.get(n);
	return r[0]++, function(u) {
		var o = function() {
			t.props.revealOrder ? (r.push(u), W(t, n, r)) : u();
		};
		e ? e(o) : o();
	};
}, V.prototype.render = function(n) {
	this.u = null, this.o = /* @__PURE__ */ new Map();
	var t = j$2(n.children);
	n.revealOrder && "b" === n.revealOrder[0] && t.reverse();
	for (var e = t.length; e--;) this.o.set(t[e], this.u = [
		1,
		0,
		this.u
	]);
	return n.children;
}, V.prototype.componentDidUpdate = V.prototype.componentDidMount = function() {
	var n = this;
	this.o.forEach(function(t, e) {
		W(n, e, t);
	});
};
var z = "undefined" != typeof Symbol && Symbol.for && Symbol.for("react.element") || 60103;
var B = /^(?:accent|alignment|arabic|baseline|cap|clip(?!PathU)|color|dominant|fill|flood|font|glyph(?!R)|horiz|image|letter|lighting|marker(?!H|W|U)|overline|paint|pointer|shape|stop|strikethrough|stroke|text(?!L)|transform|underline|unicode|units|v|vector|vert|word|writing|x(?!C))[A-Z]/;
var H = "undefined" != typeof document;
var Z = function(n) {
	return ("undefined" != typeof Symbol && "symbol" == typeof Symbol() ? /fil|che|rad/i : /fil|che|ra/i).test(n);
};
x$1.prototype.isReactComponent = {}, [
	"componentWillMount",
	"componentWillReceiveProps",
	"componentWillUpdate"
].forEach(function(t) {
	Object.defineProperty(x$1.prototype, t, {
		configurable: !0,
		get: function() {
			return this["UNSAFE_" + t];
		},
		set: function(n) {
			Object.defineProperty(this, t, {
				configurable: !0,
				writable: !0,
				value: n
			});
		}
	});
});
var G = l$1.event;
function J() {}
function K() {
	return this.cancelBubble;
}
function Q() {
	return this.defaultPrevented;
}
l$1.event = function(n) {
	return G && (n = G(n)), n.persist = J, n.isPropagationStopped = K, n.isDefaultPrevented = Q, n.nativeEvent = n;
};
var nn = {
	configurable: !0,
	get: function() {
		return this.class;
	}
};
var tn = l$1.vnode;
l$1.vnode = function(n) {
	var t = n.type, e = n.props, u = e;
	if ("string" == typeof t) {
		var o = -1 === t.indexOf("-");
		for (var i in u = {}, e) {
			var l = e[i];
			H && "children" === i && "noscript" === t || "value" === i && "defaultValue" in e && null == l || ("defaultValue" === i && "value" in e && null == e.value ? i = "value" : "download" === i && !0 === l ? l = "" : /ondoubleclick/i.test(i) ? i = "ondblclick" : /^onchange(textarea|input)/i.test(i + t) && !Z(e.type) ? i = "oninput" : /^onfocus$/i.test(i) ? i = "onfocusin" : /^onblur$/i.test(i) ? i = "onfocusout" : /^on(Ani|Tra|Tou|BeforeInp|Compo)/.test(i) ? i = i.toLowerCase() : o && B.test(i) ? i = i.replace(/[A-Z0-9]/g, "-$&").toLowerCase() : null === l && (l = void 0), /^oninput$/i.test(i) && (i = i.toLowerCase(), u[i] && (i = "oninputCapture")), u[i] = l);
		}
		"select" == t && u.multiple && Array.isArray(u.value) && (u.value = j$2(e.children).forEach(function(n) {
			n.props.selected = -1 != u.value.indexOf(n.props.value);
		})), "select" == t && null != u.defaultValue && (u.value = j$2(e.children).forEach(function(n) {
			n.props.selected = u.multiple ? -1 != u.defaultValue.indexOf(n.props.value) : u.defaultValue == n.props.value;
		})), n.props = u, e.class != e.className && (nn.enumerable = "className" in e, null != e.className && (u.class = e.className), Object.defineProperty(u, "className", nn));
	}
	n.$$typeof = z, tn && tn(n);
};
var en = l$1.__r;
l$1.__r = function(n) {
	en && en(n), n.__c;
};
//#endregion
//#region node_modules/@fullcalendar/core/internal-common.js
var warnedMessages = /* @__PURE__ */ new Set();
function warnOnce(message) {
	if (!warnedMessages.has(message)) {
		warnedMessages.add(message);
		console.warn(message + " Consider upgrading to FullCalendar v7: https://fullcalendar.io/docs/upgrading-from-v6");
	}
}
var MAJOR_VERSION_ERROR = "This plugin is from FullCalendar v6, but your calendar is v7 (the current version). Fix: import plugins from your v7 package, e.g. import dayGridPlugin from '@fullcalendar/react/daygrid', then uninstall @fullcalendar/core, @fullcalendar/daygrid and the other v6 packages. Don't downgrade to v6.";
var styleTexts = [];
var styleEls = /* @__PURE__ */ new Map();
function injectStyles(styleText) {
	styleTexts.push(styleText);
	styleEls.forEach((styleEl) => {
		appendStylesTo(styleEl, styleText);
	});
}
function ensureElHasStyles(el) {
	if (el.isConnected && el.getRootNode) registerStylesRoot(el.getRootNode());
}
function registerStylesRoot(rootNode) {
	let styleEl = styleEls.get(rootNode);
	if (!styleEl || !styleEl.isConnected) {
		styleEl = rootNode.querySelector("style[data-fullcalendar]");
		if (!styleEl) {
			const isDocument = rootNode.nodeType === 9;
			const ownerDocument = isDocument ? rootNode : rootNode.ownerDocument;
			styleEl = ownerDocument.createElement("style");
			styleEl.setAttribute("data-fullcalendar", "");
			const nonce = getNonceValue();
			if (nonce) styleEl.nonce = nonce;
			const parentEl = isDocument ? ownerDocument.head : rootNode;
			const insertBefore = isDocument ? parentEl.querySelector("script,link[rel=stylesheet],link[as=style],style") : parentEl.firstChild;
			parentEl.insertBefore(styleEl, insertBefore);
		}
		styleEls.set(rootNode, styleEl);
		hydrateStylesRoot(styleEl);
	}
}
function hydrateStylesRoot(styleEl) {
	for (const styleText of styleTexts) appendStylesTo(styleEl, styleText);
}
function appendStylesTo(styleEl, styleText) {
	const { sheet } = styleEl;
	if (!sheet) {
		warnOnce("FullCalendar could not inject its styles, possibly because of a Content Security Policy. v7 distributes plain CSS files instead of injecting styles.");
		return;
	}
	const ruleCnt = sheet.cssRules.length;
	styleText.split("}").forEach((styleStr, i) => {
		styleStr = styleStr.trim();
		if (styleStr) sheet.insertRule(styleStr + "}", ruleCnt + i);
	});
}
var queriedNonceValue;
function getNonceValue() {
	if (queriedNonceValue === void 0) queriedNonceValue = queryNonceValue();
	return queriedNonceValue;
}
function queryNonceValue() {
	try {
		const metaWithNonce = document.querySelector("meta[name=\"csp-nonce\"]");
		if (metaWithNonce && metaWithNonce.hasAttribute("content")) return metaWithNonce.getAttribute("content");
		const elWithNonce = document.querySelector("script[nonce]");
		if (elWithNonce) return elWithNonce.nonce || "";
	} catch (err) {}
	return "";
}
if (typeof document !== "undefined") registerStylesRoot(document);
injectStyles(":root{--fc-small-font-size:.85em;--fc-page-bg-color:#fff;--fc-neutral-bg-color:hsla(0,0%,82%,.3);--fc-neutral-text-color:grey;--fc-border-color:#ddd;--fc-button-text-color:#fff;--fc-button-bg-color:#2c3e50;--fc-button-border-color:#2c3e50;--fc-button-hover-bg-color:#1e2b37;--fc-button-hover-border-color:#1a252f;--fc-button-active-bg-color:#1a252f;--fc-button-active-border-color:#151e27;--fc-event-bg-color:#3788d8;--fc-event-border-color:#3788d8;--fc-event-text-color:#fff;--fc-event-selected-overlay-color:rgba(0,0,0,.25);--fc-more-link-bg-color:#d0d0d0;--fc-more-link-text-color:inherit;--fc-event-resizer-thickness:8px;--fc-event-resizer-dot-total-width:8px;--fc-event-resizer-dot-border-width:1px;--fc-non-business-color:hsla(0,0%,84%,.3);--fc-bg-event-color:#8fdf82;--fc-bg-event-opacity:0.3;--fc-highlight-color:rgba(188,232,241,.3);--fc-today-bg-color:rgba(255,220,40,.15);--fc-now-indicator-color:red}.fc-not-allowed,.fc-not-allowed .fc-event{cursor:not-allowed}.fc{display:flex;flex-direction:column;font-size:1em}.fc,.fc *,.fc :after,.fc :before{box-sizing:border-box}.fc table{border-collapse:collapse;border-spacing:0;font-size:1em}.fc th{text-align:center}.fc td,.fc th{padding:0;vertical-align:top}.fc a[data-navlink]{cursor:pointer}.fc a[data-navlink]:hover{text-decoration:underline}.fc-direction-ltr{direction:ltr;text-align:left}.fc-direction-rtl{direction:rtl;text-align:right}.fc-theme-standard td,.fc-theme-standard th{border:1px solid var(--fc-border-color)}.fc-liquid-hack td,.fc-liquid-hack th{position:relative}@font-face{font-family:fcicons;font-style:normal;font-weight:400;src:url(\"data:application/x-font-ttf;charset=utf-8;base64,AAEAAAALAIAAAwAwT1MvMg8SBfAAAAC8AAAAYGNtYXAXVtKNAAABHAAAAFRnYXNwAAAAEAAAAXAAAAAIZ2x5ZgYydxIAAAF4AAAFNGhlYWQUJ7cIAAAGrAAAADZoaGVhB20DzAAABuQAAAAkaG10eCIABhQAAAcIAAAALGxvY2ED4AU6AAAHNAAAABhtYXhwAA8AjAAAB0wAAAAgbmFtZXsr690AAAdsAAABhnBvc3QAAwAAAAAI9AAAACAAAwPAAZAABQAAApkCzAAAAI8CmQLMAAAB6wAzAQkAAAAAAAAAAAAAAAAAAAABEAAAAAAAAAAAAAAAAAAAAABAAADpBgPA/8AAQAPAAEAAAAABAAAAAAAAAAAAAAAgAAAAAAADAAAAAwAAABwAAQADAAAAHAADAAEAAAAcAAQAOAAAAAoACAACAAIAAQAg6Qb//f//AAAAAAAg6QD//f//AAH/4xcEAAMAAQAAAAAAAAAAAAAAAQAB//8ADwABAAAAAAAAAAAAAgAANzkBAAAAAAEAAAAAAAAAAAACAAA3OQEAAAAAAQAAAAAAAAAAAAIAADc5AQAAAAABAWIAjQKeAskAEwAAJSc3NjQnJiIHAQYUFwEWMjc2NCcCnuLiDQ0MJAz/AA0NAQAMJAwNDcni4gwjDQwM/wANIwz/AA0NDCMNAAAAAQFiAI0CngLJABMAACUBNjQnASYiBwYUHwEHBhQXFjI3AZ4BAA0N/wAMJAwNDeLiDQ0MJAyNAQAMIw0BAAwMDSMM4uINIwwNDQAAAAIA4gC3Ax4CngATACcAACUnNzY0JyYiDwEGFB8BFjI3NjQnISc3NjQnJiIPAQYUHwEWMjc2NCcB87e3DQ0MIw3VDQ3VDSMMDQ0BK7e3DQ0MJAzVDQ3VDCQMDQ3zuLcMJAwNDdUNIwzWDAwNIwy4twwkDA0N1Q0jDNYMDA0jDAAAAgDiALcDHgKeABMAJwAAJTc2NC8BJiIHBhQfAQcGFBcWMjchNzY0LwEmIgcGFB8BBwYUFxYyNwJJ1Q0N1Q0jDA0Nt7cNDQwjDf7V1Q0N1QwkDA0Nt7cNDQwkDLfWDCMN1Q0NDCQMt7gMIw0MDNYMIw3VDQ0MJAy3uAwjDQwMAAADAFUAAAOrA1UAMwBoAHcAABMiBgcOAQcOAQcOARURFBYXHgEXHgEXHgEzITI2Nz4BNz4BNz4BNRE0JicuAScuAScuASMFITIWFx4BFx4BFx4BFREUBgcOAQcOAQcOASMhIiYnLgEnLgEnLgE1ETQ2Nz4BNz4BNz4BMxMhMjY1NCYjISIGFRQWM9UNGAwLFQkJDgUFBQUFBQ4JCRULDBgNAlYNGAwLFQkJDgUFBQUFBQ4JCRULDBgN/aoCVgQIBAQHAwMFAQIBAQIBBQMDBwQECAT9qgQIBAQHAwMFAQIBAQIBBQMDBwQECASAAVYRGRkR/qoRGRkRA1UFBAUOCQkVDAsZDf2rDRkLDBUJCA4FBQUFBQUOCQgVDAsZDQJVDRkLDBUJCQ4FBAVVAgECBQMCBwQECAX9qwQJAwQHAwMFAQICAgIBBQMDBwQDCQQCVQUIBAQHAgMFAgEC/oAZEhEZGRESGQAAAAADAFUAAAOrA1UAMwBoAIkAABMiBgcOAQcOAQcOARURFBYXHgEXHgEXHgEzITI2Nz4BNz4BNz4BNRE0JicuAScuAScuASMFITIWFx4BFx4BFx4BFREUBgcOAQcOAQcOASMhIiYnLgEnLgEnLgE1ETQ2Nz4BNz4BNz4BMxMzFRQWMzI2PQEzMjY1NCYrATU0JiMiBh0BIyIGFRQWM9UNGAwLFQkJDgUFBQUFBQ4JCRULDBgNAlYNGAwLFQkJDgUFBQUFBQ4JCRULDBgN/aoCVgQIBAQHAwMFAQIBAQIBBQMDBwQECAT9qgQIBAQHAwMFAQIBAQIBBQMDBwQECASAgBkSEhmAERkZEYAZEhIZgBEZGREDVQUEBQ4JCRUMCxkN/asNGQsMFQkIDgUFBQUFBQ4JCBUMCxkNAlUNGQsMFQkJDgUEBVUCAQIFAwIHBAQIBf2rBAkDBAcDAwUBAgICAgEFAwMHBAMJBAJVBQgEBAcCAwUCAQL+gIASGRkSgBkSERmAEhkZEoAZERIZAAABAOIAjQMeAskAIAAAExcHBhQXFjI/ARcWMjc2NC8BNzY0JyYiDwEnJiIHBhQX4uLiDQ0MJAzi4gwkDA0N4uINDQwkDOLiDCQMDQ0CjeLiDSMMDQ3h4Q0NDCMN4uIMIw0MDOLiDAwNIwwAAAABAAAAAQAAa5n0y18PPPUACwQAAAAAANivOVsAAAAA2K85WwAAAAADqwNVAAAACAACAAAAAAAAAAEAAAPA/8AAAAQAAAAAAAOrAAEAAAAAAAAAAAAAAAAAAAALBAAAAAAAAAAAAAAAAgAAAAQAAWIEAAFiBAAA4gQAAOIEAABVBAAAVQQAAOIAAAAAAAoAFAAeAEQAagCqAOoBngJkApoAAQAAAAsAigADAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAA4ArgABAAAAAAABAAcAAAABAAAAAAACAAcAYAABAAAAAAADAAcANgABAAAAAAAEAAcAdQABAAAAAAAFAAsAFQABAAAAAAAGAAcASwABAAAAAAAKABoAigADAAEECQABAA4ABwADAAEECQACAA4AZwADAAEECQADAA4APQADAAEECQAEAA4AfAADAAEECQAFABYAIAADAAEECQAGAA4AUgADAAEECQAKADQApGZjaWNvbnMAZgBjAGkAYwBvAG4Ac1ZlcnNpb24gMS4wAFYAZQByAHMAaQBvAG4AIAAxAC4AMGZjaWNvbnMAZgBjAGkAYwBvAG4Ac2ZjaWNvbnMAZgBjAGkAYwBvAG4Ac1JlZ3VsYXIAUgBlAGcAdQBsAGEAcmZjaWNvbnMAZgBjAGkAYwBvAG4Ac0ZvbnQgZ2VuZXJhdGVkIGJ5IEljb01vb24uAEYAbwBuAHQAIABnAGUAbgBlAHIAYQB0AGUAZAAgAGIAeQAgAEkAYwBvAE0AbwBvAG4ALgAAAAMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=\") format(\"truetype\")}.fc-icon{speak:none;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;display:inline-block;font-family:fcicons!important;font-style:normal;font-variant:normal;font-weight:400;height:1em;line-height:1;text-align:center;text-transform:none;-webkit-user-select:none;-moz-user-select:none;user-select:none;width:1em}.fc-icon-chevron-left:before{content:\"\\e900\"}.fc-icon-chevron-right:before{content:\"\\e901\"}.fc-icon-chevrons-left:before{content:\"\\e902\"}.fc-icon-chevrons-right:before{content:\"\\e903\"}.fc-icon-minus-square:before{content:\"\\e904\"}.fc-icon-plus-square:before{content:\"\\e905\"}.fc-icon-x:before{content:\"\\e906\"}.fc .fc-button{border-radius:0;font-family:inherit;font-size:inherit;line-height:inherit;margin:0;overflow:visible;text-transform:none}.fc .fc-button:focus{outline:1px dotted;outline:5px auto -webkit-focus-ring-color}.fc .fc-button{-webkit-appearance:button}.fc .fc-button:not(:disabled){cursor:pointer}.fc .fc-button{background-color:transparent;border:1px solid transparent;border-radius:.25em;display:inline-block;font-size:1em;font-weight:400;line-height:1.5;padding:.4em .65em;text-align:center;-webkit-user-select:none;-moz-user-select:none;user-select:none;vertical-align:middle}.fc .fc-button:hover{text-decoration:none}.fc .fc-button:focus{box-shadow:0 0 0 .2rem rgba(44,62,80,.25);outline:0}.fc .fc-button:disabled{opacity:.65}.fc .fc-button-primary{background-color:var(--fc-button-bg-color);border-color:var(--fc-button-border-color);color:var(--fc-button-text-color)}.fc .fc-button-primary:hover{background-color:var(--fc-button-hover-bg-color);border-color:var(--fc-button-hover-border-color);color:var(--fc-button-text-color)}.fc .fc-button-primary:disabled{background-color:var(--fc-button-bg-color);border-color:var(--fc-button-border-color);color:var(--fc-button-text-color)}.fc .fc-button-primary:focus{box-shadow:0 0 0 .2rem rgba(76,91,106,.5)}.fc .fc-button-primary:not(:disabled).fc-button-active,.fc .fc-button-primary:not(:disabled):active{background-color:var(--fc-button-active-bg-color);border-color:var(--fc-button-active-border-color);color:var(--fc-button-text-color)}.fc .fc-button-primary:not(:disabled).fc-button-active:focus,.fc .fc-button-primary:not(:disabled):active:focus{box-shadow:0 0 0 .2rem rgba(76,91,106,.5)}.fc .fc-button .fc-icon{font-size:1.5em;vertical-align:middle}.fc .fc-button-group{display:inline-flex;position:relative;vertical-align:middle}.fc .fc-button-group>.fc-button{flex:1 1 auto;position:relative}.fc .fc-button-group>.fc-button.fc-button-active,.fc .fc-button-group>.fc-button:active,.fc .fc-button-group>.fc-button:focus,.fc .fc-button-group>.fc-button:hover{z-index:1}.fc-direction-ltr .fc-button-group>.fc-button:not(:first-child){border-bottom-left-radius:0;border-top-left-radius:0;margin-left:-1px}.fc-direction-ltr .fc-button-group>.fc-button:not(:last-child){border-bottom-right-radius:0;border-top-right-radius:0}.fc-direction-rtl .fc-button-group>.fc-button:not(:first-child){border-bottom-right-radius:0;border-top-right-radius:0;margin-right:-1px}.fc-direction-rtl .fc-button-group>.fc-button:not(:last-child){border-bottom-left-radius:0;border-top-left-radius:0}.fc .fc-toolbar{align-items:center;display:flex;justify-content:space-between}.fc .fc-toolbar.fc-header-toolbar{margin-bottom:1.5em}.fc .fc-toolbar.fc-footer-toolbar{margin-top:1.5em}.fc .fc-toolbar-title{font-size:1.75em;margin:0}.fc-direction-ltr .fc-toolbar>*>:not(:first-child){margin-left:.75em}.fc-direction-rtl .fc-toolbar>*>:not(:first-child){margin-right:.75em}.fc-direction-rtl .fc-toolbar-ltr{flex-direction:row-reverse}.fc .fc-scroller{-webkit-overflow-scrolling:touch;position:relative}.fc .fc-scroller-liquid{height:100%}.fc .fc-scroller-liquid-absolute{bottom:0;left:0;position:absolute;right:0;top:0}.fc .fc-scroller-harness{direction:ltr;overflow:hidden;position:relative}.fc .fc-scroller-harness-liquid{height:100%}.fc-direction-rtl .fc-scroller-harness>.fc-scroller{direction:rtl}.fc-theme-standard .fc-scrollgrid{border:1px solid var(--fc-border-color)}.fc .fc-scrollgrid,.fc .fc-scrollgrid table{table-layout:fixed;width:100%}.fc .fc-scrollgrid table{border-left-style:hidden;border-right-style:hidden;border-top-style:hidden}.fc .fc-scrollgrid{border-bottom-width:0;border-collapse:separate;border-right-width:0}.fc .fc-scrollgrid-liquid{height:100%}.fc .fc-scrollgrid-section,.fc .fc-scrollgrid-section table,.fc .fc-scrollgrid-section>td{height:1px}.fc .fc-scrollgrid-section-liquid>td{height:100%}.fc .fc-scrollgrid-section>*{border-left-width:0;border-top-width:0}.fc .fc-scrollgrid-section-footer>*,.fc .fc-scrollgrid-section-header>*{border-bottom-width:0}.fc .fc-scrollgrid-section-body table,.fc .fc-scrollgrid-section-footer table{border-bottom-style:hidden}.fc .fc-scrollgrid-section-sticky>*{background:var(--fc-page-bg-color);position:sticky;z-index:3}.fc .fc-scrollgrid-section-header.fc-scrollgrid-section-sticky>*{top:0}.fc .fc-scrollgrid-section-footer.fc-scrollgrid-section-sticky>*{bottom:0}.fc .fc-scrollgrid-sticky-shim{height:1px;margin-bottom:-1px}.fc-sticky{position:sticky}.fc .fc-view-harness{flex-grow:1;position:relative}.fc .fc-view-harness-active>.fc-view{bottom:0;left:0;position:absolute;right:0;top:0}.fc .fc-col-header-cell-cushion{display:inline-block;padding:2px 4px}.fc .fc-bg-event,.fc .fc-highlight,.fc .fc-non-business{bottom:0;left:0;position:absolute;right:0;top:0}.fc .fc-non-business{background:var(--fc-non-business-color)}.fc .fc-bg-event{background:var(--fc-bg-event-color);opacity:var(--fc-bg-event-opacity)}.fc .fc-bg-event .fc-event-title{font-size:var(--fc-small-font-size);font-style:italic;margin:.5em}.fc .fc-highlight{background:var(--fc-highlight-color)}.fc .fc-cell-shaded,.fc .fc-day-disabled{background:var(--fc-neutral-bg-color)}a.fc-event,a.fc-event:hover{text-decoration:none}.fc-event.fc-event-draggable,.fc-event[href]{cursor:pointer}.fc-event .fc-event-main{position:relative;z-index:2}.fc-event-dragging:not(.fc-event-selected){opacity:.75}.fc-event-dragging.fc-event-selected{box-shadow:0 2px 7px rgba(0,0,0,.3)}.fc-event .fc-event-resizer{display:none;position:absolute;z-index:4}.fc-event-selected .fc-event-resizer,.fc-event:hover .fc-event-resizer{display:block}.fc-event-selected .fc-event-resizer{background:var(--fc-page-bg-color);border-color:inherit;border-radius:calc(var(--fc-event-resizer-dot-total-width)/2);border-style:solid;border-width:var(--fc-event-resizer-dot-border-width);height:var(--fc-event-resizer-dot-total-width);width:var(--fc-event-resizer-dot-total-width)}.fc-event-selected .fc-event-resizer:before{bottom:-20px;content:\"\";left:-20px;position:absolute;right:-20px;top:-20px}.fc-event-selected,.fc-event:focus{box-shadow:0 2px 5px rgba(0,0,0,.2)}.fc-event-selected:before,.fc-event:focus:before{bottom:0;content:\"\";left:0;position:absolute;right:0;top:0;z-index:3}.fc-event-selected:after,.fc-event:focus:after{background:var(--fc-event-selected-overlay-color);bottom:-1px;content:\"\";left:-1px;position:absolute;right:-1px;top:-1px;z-index:1}.fc-h-event{background-color:var(--fc-event-bg-color);border:1px solid var(--fc-event-border-color);display:block}.fc-h-event .fc-event-main{color:var(--fc-event-text-color)}.fc-h-event .fc-event-main-frame{display:flex}.fc-h-event .fc-event-time{flex-shrink:0;max-width:100%;overflow:hidden}.fc-h-event .fc-event-title-container{flex-grow:1;flex-shrink:1;min-width:0}.fc-h-event .fc-event-title{display:inline-block;left:0;max-width:100%;overflow:hidden;right:0;vertical-align:top}.fc-h-event.fc-event-selected:before{bottom:-10px;top:-10px}.fc-direction-ltr .fc-daygrid-block-event:not(.fc-event-start),.fc-direction-rtl .fc-daygrid-block-event:not(.fc-event-end){border-bottom-left-radius:0;border-left-width:0;border-top-left-radius:0}.fc-direction-ltr .fc-daygrid-block-event:not(.fc-event-end),.fc-direction-rtl .fc-daygrid-block-event:not(.fc-event-start){border-bottom-right-radius:0;border-right-width:0;border-top-right-radius:0}.fc-h-event:not(.fc-event-selected) .fc-event-resizer{bottom:0;top:0;width:var(--fc-event-resizer-thickness)}.fc-direction-ltr .fc-h-event:not(.fc-event-selected) .fc-event-resizer-start,.fc-direction-rtl .fc-h-event:not(.fc-event-selected) .fc-event-resizer-end{cursor:w-resize;left:calc(var(--fc-event-resizer-thickness)*-.5)}.fc-direction-ltr .fc-h-event:not(.fc-event-selected) .fc-event-resizer-end,.fc-direction-rtl .fc-h-event:not(.fc-event-selected) .fc-event-resizer-start{cursor:e-resize;right:calc(var(--fc-event-resizer-thickness)*-.5)}.fc-h-event.fc-event-selected .fc-event-resizer{margin-top:calc(var(--fc-event-resizer-dot-total-width)*-.5);top:50%}.fc-direction-ltr .fc-h-event.fc-event-selected .fc-event-resizer-start,.fc-direction-rtl .fc-h-event.fc-event-selected .fc-event-resizer-end{left:calc(var(--fc-event-resizer-dot-total-width)*-.5)}.fc-direction-ltr .fc-h-event.fc-event-selected .fc-event-resizer-end,.fc-direction-rtl .fc-h-event.fc-event-selected .fc-event-resizer-start{right:calc(var(--fc-event-resizer-dot-total-width)*-.5)}.fc .fc-popover{box-shadow:0 2px 6px rgba(0,0,0,.15);position:absolute;z-index:9999}.fc .fc-popover-header{align-items:center;display:flex;flex-direction:row;justify-content:space-between;padding:3px 4px}.fc .fc-popover-title{margin:0 2px}.fc .fc-popover-close{cursor:pointer;font-size:1.1em;opacity:.65}.fc-theme-standard .fc-popover{background:var(--fc-page-bg-color);border:1px solid var(--fc-border-color)}.fc-theme-standard .fc-popover-header{background:var(--fc-neutral-bg-color)}");
var DelayedRunner = class {
	constructor(drainedOption) {
		this.drainedOption = drainedOption;
		this.isRunning = false;
		this.isDirty = false;
		this.pauseDepths = {};
		this.timeoutId = 0;
	}
	request(delay) {
		this.isDirty = true;
		if (!this.isPaused()) {
			this.clearTimeout();
			if (delay == null) this.tryDrain();
			else this.timeoutId = setTimeout(this.tryDrain.bind(this), delay);
		}
	}
	pause(scope = "") {
		let { pauseDepths } = this;
		pauseDepths[scope] = (pauseDepths[scope] || 0) + 1;
		this.clearTimeout();
	}
	resume(scope = "", force) {
		let { pauseDepths } = this;
		if (scope in pauseDepths) {
			if (force) delete pauseDepths[scope];
			else {
				pauseDepths[scope] -= 1;
				if (pauseDepths[scope] <= 0) delete pauseDepths[scope];
			}
			this.tryDrain();
		}
	}
	isPaused() {
		return Object.keys(this.pauseDepths).length;
	}
	tryDrain() {
		if (!this.isRunning && !this.isPaused()) {
			this.isRunning = true;
			while (this.isDirty) {
				this.isDirty = false;
				this.drained();
			}
			this.isRunning = false;
		}
	}
	clear() {
		this.clearTimeout();
		this.isDirty = false;
		this.pauseDepths = {};
	}
	clearTimeout() {
		if (this.timeoutId) {
			clearTimeout(this.timeoutId);
			this.timeoutId = 0;
		}
	}
	drained() {
		if (this.drainedOption) this.drainedOption();
	}
};
function removeElement(el) {
	if (el.parentNode) el.parentNode.removeChild(el);
}
function elementClosest(el, selector) {
	if (el.closest) return el.closest(selector);
	if (!document.documentElement.contains(el)) return null;
	do {
		if (elementMatches(el, selector)) return el;
		el = el.parentElement || el.parentNode;
	} while (el !== null && el.nodeType === 1);
	return null;
}
function elementMatches(el, selector) {
	return (el.matches || el.matchesSelector || el.msMatchesSelector).call(el, selector);
}
function findElements(container, selector) {
	let containers = container instanceof HTMLElement ? [container] : container;
	let allMatches = [];
	for (let i = 0; i < containers.length; i += 1) {
		let matches = containers[i].querySelectorAll(selector);
		for (let j = 0; j < matches.length; j += 1) allMatches.push(matches[j]);
	}
	return allMatches;
}
var PIXEL_PROP_RE = /(top|left|right|bottom|width|height)$/i;
function applyStyle(el, props) {
	for (let propName in props) applyStyleProp(el, propName, props[propName]);
}
function applyStyleProp(el, name, val) {
	if (val == null) el.style[name] = "";
	else if (typeof val === "number" && PIXEL_PROP_RE.test(name)) el.style[name] = `${val}px`;
	else el.style[name] = val;
}
function getEventTargetViaRoot(ev) {
	var _a, _b;
	return (_b = (_a = ev.composedPath) === null || _a === void 0 ? void 0 : _a.call(ev)[0]) !== null && _b !== void 0 ? _b : ev.target;
}
var guid$1 = 0;
function getUniqueDomId() {
	guid$1 += 1;
	return "fc-dom-" + guid$1;
}
function preventDefault(ev) {
	ev.preventDefault();
}
function buildDelegationHandler(selector, handler) {
	return (ev) => {
		let matchedChild = elementClosest(ev.target, selector);
		if (matchedChild) handler.call(matchedChild, ev, matchedChild);
	};
}
function listenBySelector(container, eventType, selector, handler) {
	let attachedHandler = buildDelegationHandler(selector, handler);
	container.addEventListener(eventType, attachedHandler);
	return () => {
		container.removeEventListener(eventType, attachedHandler);
	};
}
function listenToHoverBySelector(container, selector, onMouseEnter, onMouseLeave) {
	let currentMatchedChild;
	return listenBySelector(container, "mouseover", selector, (mouseOverEv, matchedChild) => {
		if (matchedChild !== currentMatchedChild) {
			currentMatchedChild = matchedChild;
			onMouseEnter(mouseOverEv, matchedChild);
			let realOnMouseLeave = (mouseLeaveEv) => {
				currentMatchedChild = null;
				onMouseLeave(mouseLeaveEv, matchedChild);
				matchedChild.removeEventListener("mouseleave", realOnMouseLeave);
			};
			matchedChild.addEventListener("mouseleave", realOnMouseLeave);
		}
	});
}
var transitionEventNames = [
	"webkitTransitionEnd",
	"otransitionend",
	"oTransitionEnd",
	"msTransitionEnd",
	"transitionend"
];
function whenTransitionDone(el, callback) {
	let realCallback = (ev) => {
		callback(ev);
		transitionEventNames.forEach((eventName) => {
			el.removeEventListener(eventName, realCallback);
		});
	};
	transitionEventNames.forEach((eventName) => {
		el.addEventListener(eventName, realCallback);
	});
}
function createAriaClickAttrs(handler) {
	return Object.assign({ onClick: handler }, createAriaKeyboardAttrs(handler));
}
function createAriaKeyboardAttrs(handler) {
	return {
		tabIndex: 0,
		onKeyDown(ev) {
			if (ev.key === "Enter" || ev.key === " ") {
				handler(ev);
				ev.preventDefault();
			}
		}
	};
}
var guidNumber = 0;
function guid() {
	guidNumber += 1;
	return String(guidNumber);
}
function disableCursor() {
	document.body.classList.add("fc-not-allowed");
}
function enableCursor() {
	document.body.classList.remove("fc-not-allowed");
}
function preventSelection(el) {
	el.style.userSelect = "none";
	el.style.webkitUserSelect = "none";
	el.addEventListener("selectstart", preventDefault);
}
function allowSelection(el) {
	el.style.userSelect = "";
	el.style.webkitUserSelect = "";
	el.removeEventListener("selectstart", preventDefault);
}
function preventContextMenu(el) {
	el.addEventListener("contextmenu", preventDefault);
}
function allowContextMenu(el) {
	el.removeEventListener("contextmenu", preventDefault);
}
function parseFieldSpecs(input) {
	let specs = [];
	let tokens = [];
	let i;
	let token;
	if (typeof input === "string") tokens = input.split(/\s*,\s*/);
	else if (typeof input === "function") tokens = [input];
	else if (Array.isArray(input)) tokens = input;
	for (i = 0; i < tokens.length; i += 1) {
		token = tokens[i];
		if (typeof token === "string") specs.push(token.charAt(0) === "-" ? {
			field: token.substring(1),
			order: -1
		} : {
			field: token,
			order: 1
		});
		else if (typeof token === "function") specs.push({ func: token });
	}
	return specs;
}
function compareByFieldSpecs(obj0, obj1, fieldSpecs) {
	let i;
	let cmp;
	for (i = 0; i < fieldSpecs.length; i += 1) {
		cmp = compareByFieldSpec(obj0, obj1, fieldSpecs[i]);
		if (cmp) return cmp;
	}
	return 0;
}
function compareByFieldSpec(obj0, obj1, fieldSpec) {
	if (fieldSpec.func) return fieldSpec.func(obj0, obj1);
	return flexibleCompare(obj0[fieldSpec.field], obj1[fieldSpec.field]) * (fieldSpec.order || 1);
}
function flexibleCompare(a, b) {
	if (!a && !b) return 0;
	if (b == null) return -1;
	if (a == null) return 1;
	if (typeof a === "string" || typeof b === "string") return String(a).localeCompare(String(b));
	return a - b;
}
function padStart(val, len) {
	let s = String(val);
	return "000".substr(0, len - s.length) + s;
}
function formatWithOrdinals(formatter, args, fallbackText) {
	if (typeof formatter === "function") return formatter(...args);
	if (typeof formatter === "string") return args.reduce((str, arg, index) => str.replace("$" + index, arg || ""), formatter);
	return fallbackText;
}
function compareNumbers(a, b) {
	return a - b;
}
function isInt(n) {
	return n % 1 === 0;
}
function computeSmallestCellWidth(cellEl) {
	let allWidthEl = cellEl.querySelector(".fc-scrollgrid-shrink-frame");
	let contentWidthEl = cellEl.querySelector(".fc-scrollgrid-shrink-cushion");
	if (!allWidthEl) throw new Error("needs fc-scrollgrid-shrink-frame className");
	if (!contentWidthEl) throw new Error("needs fc-scrollgrid-shrink-cushion className");
	return cellEl.getBoundingClientRect().width - allWidthEl.getBoundingClientRect().width + contentWidthEl.getBoundingClientRect().width;
}
var PARSE_RE = /^(-?)(?:(\d+)\.)?(\d+):(\d\d)(?::(\d\d)(?:\.(\d\d\d))?)?/;
function createDuration(input, unit) {
	if (typeof input === "string") return parseString(input);
	if (typeof input === "object" && input) return parseObject(input);
	if (typeof input === "number") return parseObject({ [unit || "milliseconds"]: input });
	return null;
}
function parseString(s) {
	let m = PARSE_RE.exec(s);
	if (m) {
		let sign = m[1] ? -1 : 1;
		return {
			years: 0,
			months: 0,
			days: sign * (m[2] ? parseInt(m[2], 10) : 0),
			milliseconds: sign * ((m[3] ? parseInt(m[3], 10) : 0) * 60 * 60 * 1e3 + (m[4] ? parseInt(m[4], 10) : 0) * 60 * 1e3 + (m[5] ? parseInt(m[5], 10) : 0) * 1e3 + (m[6] ? parseInt(m[6], 10) : 0))
		};
	}
	return null;
}
function parseObject(obj) {
	let duration = {
		years: obj.years || obj.year || 0,
		months: obj.months || obj.month || 0,
		days: obj.days || obj.day || 0,
		milliseconds: (obj.hours || obj.hour || 0) * 60 * 60 * 1e3 + (obj.minutes || obj.minute || 0) * 60 * 1e3 + (obj.seconds || obj.second || 0) * 1e3 + (obj.milliseconds || obj.millisecond || obj.ms || 0)
	};
	let weeks = obj.weeks || obj.week;
	if (weeks) {
		duration.days += weeks * 7;
		duration.specifiedWeeks = true;
	}
	return duration;
}
function durationsEqual(d0, d1) {
	return d0.years === d1.years && d0.months === d1.months && d0.days === d1.days && d0.milliseconds === d1.milliseconds;
}
function subtractDurations(d1, d0) {
	return {
		years: d1.years - d0.years,
		months: d1.months - d0.months,
		days: d1.days - d0.days,
		milliseconds: d1.milliseconds - d0.milliseconds
	};
}
function asRoughYears(dur) {
	return asRoughDays(dur) / 365;
}
function asRoughMonths(dur) {
	return asRoughDays(dur) / 30;
}
function asRoughDays(dur) {
	return asRoughMs(dur) / 864e5;
}
function asRoughMs(dur) {
	return dur.years * 31536e6 + dur.months * 2592e6 + dur.days * 864e5 + dur.milliseconds;
}
function greatestDurationDenominator(dur) {
	let ms = dur.milliseconds;
	if (ms) {
		if (ms % 1e3 !== 0) return {
			unit: "millisecond",
			value: ms
		};
		if (ms % 6e4 !== 0) return {
			unit: "second",
			value: ms / 1e3
		};
		if (ms % 36e5 !== 0) return {
			unit: "minute",
			value: ms / 6e4
		};
		if (ms) return {
			unit: "hour",
			value: ms / 36e5
		};
	}
	if (dur.days) {
		if (dur.specifiedWeeks && dur.days % 7 === 0) return {
			unit: "week",
			value: dur.days / 7
		};
		return {
			unit: "day",
			value: dur.days
		};
	}
	if (dur.months) return {
		unit: "month",
		value: dur.months
	};
	if (dur.years) return {
		unit: "year",
		value: dur.years
	};
	return {
		unit: "millisecond",
		value: 0
	};
}
function isArraysEqual(a0, a1, equalityFunc) {
	if (a0 === a1) return true;
	let len = a0.length;
	let i;
	if (len !== a1.length) return false;
	for (i = 0; i < len; i += 1) if (!(equalityFunc ? equalityFunc(a0[i], a1[i]) : a0[i] === a1[i])) return false;
	return true;
}
var DAY_IDS = [
	"sun",
	"mon",
	"tue",
	"wed",
	"thu",
	"fri",
	"sat"
];
function addWeeks(m, n) {
	let a = dateToUtcArray(m);
	a[2] += n * 7;
	return arrayToUtcDate(a);
}
function addDays(m, n) {
	let a = dateToUtcArray(m);
	a[2] += n;
	return arrayToUtcDate(a);
}
function addMs(m, n) {
	let a = dateToUtcArray(m);
	a[6] += n;
	return arrayToUtcDate(a);
}
function diffWeeks(m0, m1) {
	return diffDays(m0, m1) / 7;
}
function diffDays(m0, m1) {
	return (m1.valueOf() - m0.valueOf()) / 864e5;
}
function diffHours(m0, m1) {
	return (m1.valueOf() - m0.valueOf()) / 36e5;
}
function diffMinutes(m0, m1) {
	return (m1.valueOf() - m0.valueOf()) / 6e4;
}
function diffSeconds(m0, m1) {
	return (m1.valueOf() - m0.valueOf()) / 1e3;
}
function diffDayAndTime(m0, m1) {
	let m0day = startOfDay(m0);
	let m1day = startOfDay(m1);
	return {
		years: 0,
		months: 0,
		days: Math.round(diffDays(m0day, m1day)),
		milliseconds: m1.valueOf() - m1day.valueOf() - (m0.valueOf() - m0day.valueOf())
	};
}
function diffWholeWeeks(m0, m1) {
	let d = diffWholeDays(m0, m1);
	if (d !== null && d % 7 === 0) return d / 7;
	return null;
}
function diffWholeDays(m0, m1) {
	if (timeAsMs(m0) === timeAsMs(m1)) return Math.round(diffDays(m0, m1));
	return null;
}
function startOfDay(m) {
	return arrayToUtcDate([
		m.getUTCFullYear(),
		m.getUTCMonth(),
		m.getUTCDate()
	]);
}
function startOfHour(m) {
	return arrayToUtcDate([
		m.getUTCFullYear(),
		m.getUTCMonth(),
		m.getUTCDate(),
		m.getUTCHours()
	]);
}
function startOfMinute(m) {
	return arrayToUtcDate([
		m.getUTCFullYear(),
		m.getUTCMonth(),
		m.getUTCDate(),
		m.getUTCHours(),
		m.getUTCMinutes()
	]);
}
function startOfSecond(m) {
	return arrayToUtcDate([
		m.getUTCFullYear(),
		m.getUTCMonth(),
		m.getUTCDate(),
		m.getUTCHours(),
		m.getUTCMinutes(),
		m.getUTCSeconds()
	]);
}
function weekOfYear(marker, dow, doy) {
	let y = marker.getUTCFullYear();
	let w = weekOfGivenYear(marker, y, dow, doy);
	if (w < 1) return weekOfGivenYear(marker, y - 1, dow, doy);
	let nextW = weekOfGivenYear(marker, y + 1, dow, doy);
	if (nextW >= 1) return Math.min(w, nextW);
	return w;
}
function weekOfGivenYear(marker, year, dow, doy) {
	let firstWeekStart = arrayToUtcDate([
		year,
		0,
		1 + firstWeekOffset(year, dow, doy)
	]);
	let dayStart = startOfDay(marker);
	let days = Math.round(diffDays(firstWeekStart, dayStart));
	return Math.floor(days / 7) + 1;
}
function firstWeekOffset(year, dow, doy) {
	let fwd = 7 + dow - doy;
	return -((7 + arrayToUtcDate([
		year,
		0,
		fwd
	]).getUTCDay() - dow) % 7) + fwd - 1;
}
function dateToLocalArray(date) {
	return [
		date.getFullYear(),
		date.getMonth(),
		date.getDate(),
		date.getHours(),
		date.getMinutes(),
		date.getSeconds(),
		date.getMilliseconds()
	];
}
function arrayToLocalDate(a) {
	return new Date(a[0], a[1] || 0, a[2] == null ? 1 : a[2], a[3] || 0, a[4] || 0, a[5] || 0);
}
function dateToUtcArray(date) {
	return [
		date.getUTCFullYear(),
		date.getUTCMonth(),
		date.getUTCDate(),
		date.getUTCHours(),
		date.getUTCMinutes(),
		date.getUTCSeconds(),
		date.getUTCMilliseconds()
	];
}
function arrayToUtcDate(a) {
	if (a.length === 1) a = a.concat([0]);
	return new Date(Date.UTC(...a));
}
function isValidDate(m) {
	return !isNaN(m.valueOf());
}
function timeAsMs(m) {
	return m.getUTCHours() * 1e3 * 60 * 60 + m.getUTCMinutes() * 1e3 * 60 + m.getUTCSeconds() * 1e3 + m.getUTCMilliseconds();
}
function buildIsoString(marker, timeZoneOffset, stripZeroTime = false) {
	let s = marker.toISOString();
	s = s.replace(".000", "");
	if (stripZeroTime) s = s.replace("T00:00:00Z", "");
	if (s.length > 10) {
		if (timeZoneOffset == null) s = s.replace("Z", "");
		else if (timeZoneOffset !== 0) s = s.replace("Z", formatTimeZoneOffset(timeZoneOffset, true));
	}
	return s;
}
function formatDayString(marker) {
	return marker.toISOString().replace(/T.*$/, "");
}
function formatIsoMonthStr(marker) {
	return marker.toISOString().match(/^\d{4}-\d{2}/)[0];
}
function formatTimeZoneOffset(minutes, doIso = false) {
	let sign = minutes < 0 ? "-" : "+";
	let abs = Math.abs(minutes);
	let hours = Math.floor(abs / 60);
	let mins = Math.round(abs % 60);
	if (doIso) return `${sign + padStart(hours, 2)}:${padStart(mins, 2)}`;
	return `GMT${sign}${hours}${mins ? `:${padStart(mins, 2)}` : ""}`;
}
function memoize(workerFunc, resEquality, teardownFunc) {
	let currentArgs;
	let currentRes;
	return function(...newArgs) {
		if (!currentArgs) currentRes = workerFunc.apply(this, newArgs);
		else if (!isArraysEqual(currentArgs, newArgs)) {
			if (teardownFunc) teardownFunc(currentRes);
			let res = workerFunc.apply(this, newArgs);
			if (!resEquality || !resEquality(res, currentRes)) currentRes = res;
		}
		currentArgs = newArgs;
		return currentRes;
	};
}
function memoizeObjArg(workerFunc, resEquality, teardownFunc) {
	let currentArg;
	let currentRes;
	return (newArg) => {
		if (!currentArg) currentRes = workerFunc.call(this, newArg);
		else if (!isPropsEqual(currentArg, newArg)) {
			if (teardownFunc) teardownFunc(currentRes);
			let res = workerFunc.call(this, newArg);
			if (!resEquality || !resEquality(res, currentRes)) currentRes = res;
		}
		currentArg = newArg;
		return currentRes;
	};
}
var EXTENDED_SETTINGS_AND_SEVERITIES = {
	week: 3,
	separator: 9,
	omitZeroMinute: 9,
	meridiem: 9,
	omitCommas: 9
};
var STANDARD_DATE_PROP_SEVERITIES = {
	timeZoneName: 7,
	era: 6,
	year: 5,
	month: 4,
	day: 2,
	weekday: 2,
	hour: 1,
	minute: 1,
	second: 1
};
var MERIDIEM_RE = /\s*([ap])\.?m\.?/i;
var COMMA_RE = /,/g;
var MULTI_SPACE_RE = /\s+/g;
var LTR_RE = /\u200e/g;
var UTC_RE = /UTC|GMT/;
var NativeFormatter = class {
	constructor(formatSettings) {
		let standardDateProps = {};
		let extendedSettings = {};
		let smallestUnitNum = 9;
		for (let name in formatSettings) if (name in EXTENDED_SETTINGS_AND_SEVERITIES) {
			extendedSettings[name] = formatSettings[name];
			if (EXTENDED_SETTINGS_AND_SEVERITIES[name] < 9) smallestUnitNum = Math.min(EXTENDED_SETTINGS_AND_SEVERITIES[name], smallestUnitNum);
		} else {
			standardDateProps[name] = formatSettings[name];
			if (name in STANDARD_DATE_PROP_SEVERITIES) smallestUnitNum = Math.min(STANDARD_DATE_PROP_SEVERITIES[name], smallestUnitNum);
		}
		this.standardDateProps = standardDateProps;
		this.extendedSettings = extendedSettings;
		this.smallestUnitNum = smallestUnitNum;
		this.buildFormattingFunc = memoize(buildFormattingFunc);
	}
	format(date, context) {
		return this.buildFormattingFunc(this.standardDateProps, this.extendedSettings, context)(date);
	}
	formatRange(start, end, context, betterDefaultSeparator) {
		let { standardDateProps, extendedSettings } = this;
		let diffSeverity = computeMarkerDiffSeverity(start.marker, end.marker, context.calendarSystem);
		if (!diffSeverity) return this.format(start, context);
		let biggestUnitForPartial = diffSeverity;
		if (biggestUnitForPartial > 1 && (standardDateProps.year === "numeric" || standardDateProps.year === "2-digit") && (standardDateProps.month === "numeric" || standardDateProps.month === "2-digit") && (standardDateProps.day === "numeric" || standardDateProps.day === "2-digit")) biggestUnitForPartial = 1;
		let full0 = this.format(start, context);
		let full1 = this.format(end, context);
		if (full0 === full1) return full0;
		let partialFormattingFunc = buildFormattingFunc(computePartialFormattingOptions(standardDateProps, biggestUnitForPartial), extendedSettings, context);
		let partial0 = partialFormattingFunc(start);
		let partial1 = partialFormattingFunc(end);
		let insertion = findCommonInsertion(full0, partial0, full1, partial1);
		let separator = extendedSettings.separator || betterDefaultSeparator || context.defaultSeparator || "";
		if (insertion) return insertion.before + partial0 + separator + partial1 + insertion.after;
		return full0 + separator + full1;
	}
	getSmallestUnit() {
		switch (this.smallestUnitNum) {
			case 7:
			case 6:
			case 5: return "year";
			case 4: return "month";
			case 3: return "week";
			case 2: return "day";
			default: return "time";
		}
	}
};
function buildFormattingFunc(standardDateProps, extendedSettings, context) {
	let standardDatePropCnt = Object.keys(standardDateProps).length;
	if (standardDatePropCnt === 1 && standardDateProps.timeZoneName === "short") return (date) => formatTimeZoneOffset(date.timeZoneOffset);
	if (standardDatePropCnt === 0 && extendedSettings.week) return (date) => formatWeekNumber(context.computeWeekNumber(date.marker), context.weekText, context.weekTextLong, context.locale, extendedSettings.week);
	return buildNativeFormattingFunc(standardDateProps, extendedSettings, context);
}
function buildNativeFormattingFunc(standardDateProps, extendedSettings, context) {
	standardDateProps = Object.assign({}, standardDateProps);
	extendedSettings = Object.assign({}, extendedSettings);
	sanitizeSettings(standardDateProps, extendedSettings);
	standardDateProps.timeZone = "UTC";
	let normalFormat = new Intl.DateTimeFormat(context.locale.codes, standardDateProps);
	let zeroFormat;
	if (extendedSettings.omitZeroMinute) {
		let zeroProps = Object.assign({}, standardDateProps);
		delete zeroProps.minute;
		zeroFormat = new Intl.DateTimeFormat(context.locale.codes, zeroProps);
	}
	return (date) => {
		let { marker } = date;
		let format;
		if (zeroFormat && !marker.getUTCMinutes()) format = zeroFormat;
		else format = normalFormat;
		return postProcess(format.format(marker), date, standardDateProps, extendedSettings, context);
	};
}
function sanitizeSettings(standardDateProps, extendedSettings) {
	if (standardDateProps.timeZoneName) {
		if (!standardDateProps.hour) standardDateProps.hour = "2-digit";
		if (!standardDateProps.minute) standardDateProps.minute = "2-digit";
	}
	if (standardDateProps.timeZoneName === "long") standardDateProps.timeZoneName = "short";
	if (extendedSettings.omitZeroMinute && (standardDateProps.second || standardDateProps.millisecond)) delete extendedSettings.omitZeroMinute;
}
function postProcess(s, date, standardDateProps, extendedSettings, context) {
	s = s.replace(LTR_RE, "");
	if (standardDateProps.timeZoneName === "short") s = injectTzoStr(s, context.timeZone === "UTC" || date.timeZoneOffset == null ? "UTC" : formatTimeZoneOffset(date.timeZoneOffset));
	if (extendedSettings.omitCommas) s = s.replace(COMMA_RE, "").trim();
	if (extendedSettings.omitZeroMinute) s = s.replace(":00", "");
	if (extendedSettings.meridiem === false) s = s.replace(MERIDIEM_RE, "").trim();
	else if (extendedSettings.meridiem === "narrow") s = s.replace(MERIDIEM_RE, (m0, m1) => m1.toLocaleLowerCase());
	else if (extendedSettings.meridiem === "short") s = s.replace(MERIDIEM_RE, (m0, m1) => `${m1.toLocaleLowerCase()}m`);
	else if (extendedSettings.meridiem === "lowercase") s = s.replace(MERIDIEM_RE, (m0) => m0.toLocaleLowerCase());
	s = s.replace(MULTI_SPACE_RE, " ");
	s = s.trim();
	return s;
}
function injectTzoStr(s, tzoStr) {
	let replaced = false;
	s = s.replace(UTC_RE, () => {
		replaced = true;
		return tzoStr;
	});
	if (!replaced) s += ` ${tzoStr}`;
	return s;
}
function formatWeekNumber(num, weekText, weekTextLong, locale, display) {
	let parts = [];
	if (display === "long") parts.push(weekTextLong);
	else if (display === "short" || display === "narrow") parts.push(weekText);
	if (display === "long" || display === "short") parts.push(" ");
	parts.push(locale.simpleNumberFormat.format(num));
	if (locale.options.direction === "rtl") parts.reverse();
	return parts.join("");
}
function computeMarkerDiffSeverity(d0, d1, ca) {
	if (ca.getMarkerYear(d0) !== ca.getMarkerYear(d1)) return 5;
	if (ca.getMarkerMonth(d0) !== ca.getMarkerMonth(d1)) return 4;
	if (ca.getMarkerDay(d0) !== ca.getMarkerDay(d1)) return 2;
	if (timeAsMs(d0) !== timeAsMs(d1)) return 1;
	return 0;
}
function computePartialFormattingOptions(options, biggestUnit) {
	let partialOptions = {};
	for (let name in options) if (!(name in STANDARD_DATE_PROP_SEVERITIES) || STANDARD_DATE_PROP_SEVERITIES[name] <= biggestUnit) partialOptions[name] = options[name];
	return partialOptions;
}
function findCommonInsertion(full0, partial0, full1, partial1) {
	let i0 = 0;
	while (i0 < full0.length) {
		let found0 = full0.indexOf(partial0, i0);
		if (found0 === -1) break;
		let before0 = full0.substr(0, found0);
		i0 = found0 + partial0.length;
		let after0 = full0.substr(i0);
		let i1 = 0;
		while (i1 < full1.length) {
			let found1 = full1.indexOf(partial1, i1);
			if (found1 === -1) break;
			let before1 = full1.substr(0, found1);
			i1 = found1 + partial1.length;
			let after1 = full1.substr(i1);
			if (before0 === before1 && after0 === after1) return {
				before: before0,
				after: after0
			};
		}
	}
	return null;
}
function expandZonedMarker(dateInfo, calendarSystem) {
	let a = calendarSystem.markerToArray(dateInfo.marker);
	return {
		marker: dateInfo.marker,
		timeZoneOffset: dateInfo.timeZoneOffset,
		array: a,
		year: a[0],
		month: a[1],
		day: a[2],
		hour: a[3],
		minute: a[4],
		second: a[5],
		millisecond: a[6]
	};
}
function createVerboseFormattingArg(start, end, context, betterDefaultSeparator) {
	let startInfo = expandZonedMarker(start, context.calendarSystem);
	return {
		date: startInfo,
		start: startInfo,
		end: end ? expandZonedMarker(end, context.calendarSystem) : null,
		timeZone: context.timeZone,
		localeCodes: context.locale.codes,
		defaultSeparator: betterDefaultSeparator || context.defaultSeparator
	};
}
var CmdFormatter = class {
	constructor(cmdStr) {
		this.cmdStr = cmdStr;
	}
	format(date, context, betterDefaultSeparator) {
		return context.cmdFormatter(this.cmdStr, createVerboseFormattingArg(date, null, context, betterDefaultSeparator));
	}
	formatRange(start, end, context, betterDefaultSeparator) {
		return context.cmdFormatter(this.cmdStr, createVerboseFormattingArg(start, end, context, betterDefaultSeparator));
	}
};
var FuncFormatter = class {
	constructor(func) {
		this.func = func;
	}
	format(date, context, betterDefaultSeparator) {
		return this.func(createVerboseFormattingArg(date, null, context, betterDefaultSeparator));
	}
	formatRange(start, end, context, betterDefaultSeparator) {
		return this.func(createVerboseFormattingArg(start, end, context, betterDefaultSeparator));
	}
};
function createFormatter(input) {
	if (typeof input === "object" && input) return new NativeFormatter(input);
	if (typeof input === "string") return new CmdFormatter(input);
	if (typeof input === "function") return new FuncFormatter(input);
	return null;
}
var BASE_OPTION_REFINERS = {
	navLinkDayClick: identity,
	navLinkWeekClick: identity,
	duration: createDuration,
	bootstrapFontAwesome: identity,
	buttonIcons: identity,
	customButtons: identity,
	defaultAllDayEventDuration: createDuration,
	defaultTimedEventDuration: createDuration,
	nextDayThreshold: createDuration,
	scrollTime: createDuration,
	scrollTimeReset: Boolean,
	slotMinTime: createDuration,
	slotMaxTime: createDuration,
	dayPopoverFormat: createFormatter,
	slotDuration: createDuration,
	snapDuration: createDuration,
	headerToolbar: identity,
	footerToolbar: identity,
	defaultRangeSeparator: String,
	titleRangeSeparator: String,
	forceEventDuration: Boolean,
	dayHeaders: Boolean,
	dayHeaderFormat: createFormatter,
	dayHeaderClassNames: identity,
	dayHeaderContent: identity,
	dayHeaderDidMount: identity,
	dayHeaderWillUnmount: identity,
	dayCellClassNames: identity,
	dayCellContent: identity,
	dayCellDidMount: identity,
	dayCellWillUnmount: identity,
	initialView: String,
	aspectRatio: Number,
	weekends: Boolean,
	weekNumberCalculation: identity,
	weekNumbers: Boolean,
	weekNumberClassNames: identity,
	weekNumberContent: identity,
	weekNumberDidMount: identity,
	weekNumberWillUnmount: identity,
	editable: Boolean,
	viewClassNames: identity,
	viewDidMount: identity,
	viewWillUnmount: identity,
	nowIndicator: Boolean,
	nowIndicatorSnap: identity,
	nowIndicatorClassNames: identity,
	nowIndicatorContent: identity,
	nowIndicatorDidMount: identity,
	nowIndicatorWillUnmount: identity,
	showNonCurrentDates: Boolean,
	lazyFetching: Boolean,
	startParam: String,
	endParam: String,
	timeZoneParam: String,
	timeZone: String,
	locales: identity,
	locale: identity,
	themeSystem: String,
	dragRevertDuration: Number,
	dragScroll: Boolean,
	allDayMaintainDuration: Boolean,
	unselectAuto: Boolean,
	dropAccept: identity,
	eventOrder: parseFieldSpecs,
	eventOrderStrict: Boolean,
	handleWindowResize: Boolean,
	windowResizeDelay: Number,
	longPressDelay: Number,
	eventDragMinDistance: Number,
	expandRows: Boolean,
	height: identity,
	contentHeight: identity,
	direction: String,
	weekNumberFormat: createFormatter,
	eventResizableFromStart: Boolean,
	displayEventTime: Boolean,
	displayEventEnd: Boolean,
	weekText: String,
	weekTextLong: String,
	progressiveEventRendering: Boolean,
	businessHours: identity,
	initialDate: identity,
	now: identity,
	eventDataTransform: identity,
	stickyHeaderDates: identity,
	stickyFooterScrollbar: identity,
	viewHeight: identity,
	defaultAllDay: Boolean,
	eventSourceFailure: identity,
	eventSourceSuccess: identity,
	eventDisplay: String,
	eventStartEditable: Boolean,
	eventDurationEditable: Boolean,
	eventOverlap: identity,
	eventConstraint: identity,
	eventAllow: identity,
	eventBackgroundColor: String,
	eventBorderColor: String,
	eventTextColor: String,
	eventColor: String,
	eventClassNames: identity,
	eventContent: identity,
	eventDidMount: identity,
	eventWillUnmount: identity,
	selectConstraint: identity,
	selectOverlap: identity,
	selectAllow: identity,
	droppable: Boolean,
	unselectCancel: String,
	slotLabelFormat: identity,
	slotLaneClassNames: identity,
	slotLaneContent: identity,
	slotLaneDidMount: identity,
	slotLaneWillUnmount: identity,
	slotLabelClassNames: identity,
	slotLabelContent: identity,
	slotLabelDidMount: identity,
	slotLabelWillUnmount: identity,
	dayMaxEvents: identity,
	dayMaxEventRows: identity,
	dayMinWidth: Number,
	slotLabelInterval: createDuration,
	allDayText: String,
	allDayClassNames: identity,
	allDayContent: identity,
	allDayDidMount: identity,
	allDayWillUnmount: identity,
	slotMinWidth: Number,
	navLinks: Boolean,
	eventTimeFormat: createFormatter,
	rerenderDelay: Number,
	moreLinkText: identity,
	moreLinkHint: identity,
	selectMinDistance: Number,
	selectable: Boolean,
	selectLongPressDelay: Number,
	eventLongPressDelay: Number,
	selectMirror: Boolean,
	eventMaxStack: Number,
	eventMinHeight: Number,
	eventMinWidth: Number,
	eventShortHeight: Number,
	slotEventOverlap: Boolean,
	plugins: identity,
	firstDay: Number,
	dayCount: Number,
	dateAlignment: String,
	dateIncrement: createDuration,
	hiddenDays: identity,
	fixedWeekCount: Boolean,
	validRange: identity,
	visibleRange: identity,
	titleFormat: identity,
	eventInteractive: Boolean,
	noEventsText: String,
	viewHint: identity,
	navLinkHint: identity,
	closeHint: String,
	timeHint: String,
	eventHint: String,
	moreLinkClick: identity,
	moreLinkClassNames: identity,
	moreLinkContent: identity,
	moreLinkDidMount: identity,
	moreLinkWillUnmount: identity,
	monthStartFormat: createFormatter,
	handleCustomRendering: identity,
	customRenderingMetaMap: identity,
	customRenderingReplaces: Boolean
};
var BASE_OPTION_DEFAULTS = {
	eventDisplay: "auto",
	defaultRangeSeparator: " - ",
	titleRangeSeparator: " – ",
	defaultTimedEventDuration: "01:00:00",
	defaultAllDayEventDuration: { day: 1 },
	forceEventDuration: false,
	nextDayThreshold: "00:00:00",
	dayHeaders: true,
	initialView: "",
	aspectRatio: 1.35,
	headerToolbar: {
		start: "title",
		center: "",
		end: "today prev,next"
	},
	weekends: true,
	weekNumbers: false,
	weekNumberCalculation: "local",
	editable: false,
	nowIndicator: false,
	scrollTime: "06:00:00",
	scrollTimeReset: true,
	slotMinTime: "00:00:00",
	slotMaxTime: "24:00:00",
	showNonCurrentDates: true,
	lazyFetching: true,
	startParam: "start",
	endParam: "end",
	timeZoneParam: "timeZone",
	timeZone: "local",
	locales: [],
	locale: "",
	themeSystem: "standard",
	dragRevertDuration: 500,
	dragScroll: true,
	allDayMaintainDuration: false,
	unselectAuto: true,
	dropAccept: "*",
	eventOrder: "start,-duration,allDay,title",
	dayPopoverFormat: {
		month: "long",
		day: "numeric",
		year: "numeric"
	},
	handleWindowResize: true,
	windowResizeDelay: 100,
	longPressDelay: 1e3,
	eventDragMinDistance: 5,
	expandRows: false,
	navLinks: false,
	selectable: false,
	eventMinHeight: 15,
	eventMinWidth: 30,
	eventShortHeight: 30,
	monthStartFormat: {
		month: "long",
		day: "numeric"
	},
	nowIndicatorSnap: "auto"
};
var CALENDAR_LISTENER_REFINERS = {
	datesSet: identity,
	eventsSet: identity,
	eventAdd: identity,
	eventChange: identity,
	eventRemove: identity,
	windowResize: identity,
	eventClick: identity,
	eventMouseEnter: identity,
	eventMouseLeave: identity,
	select: identity,
	unselect: identity,
	loading: identity,
	_unmount: identity,
	_beforeprint: identity,
	_afterprint: identity,
	_noEventDrop: identity,
	_noEventResize: identity,
	_resize: identity,
	_scrollRequest: identity
};
var CALENDAR_OPTION_REFINERS = {
	buttonText: identity,
	buttonHints: identity,
	views: identity,
	plugins: identity,
	initialEvents: identity,
	events: identity,
	eventSources: identity
};
var COMPLEX_OPTION_COMPARATORS = {
	headerToolbar: isMaybeObjectsEqual,
	footerToolbar: isMaybeObjectsEqual,
	buttonText: isMaybeObjectsEqual,
	buttonHints: isMaybeObjectsEqual,
	buttonIcons: isMaybeObjectsEqual,
	dateIncrement: isMaybeObjectsEqual,
	plugins: isMaybeArraysEqual,
	events: isMaybeArraysEqual,
	eventSources: isMaybeArraysEqual,
	["resources"]: isMaybeArraysEqual,
	validRange: isMaybeDateRangeInputsEqual,
	visibleRange: isMaybeDateRangeInputsEqual,
	hiddenDays: isMaybeArraysEqual
};
function isMaybeObjectsEqual(a, b) {
	if (typeof a === "object" && typeof b === "object" && a && b) return isPropsEqual(a, b);
	return a === b;
}
function isMaybeArraysEqual(a, b) {
	if (Array.isArray(a) && Array.isArray(b)) return isArraysEqual(a, b);
	return a === b;
}
function isMaybeDateRangeInputsEqual(a, b) {
	if (typeof a === "object" && typeof b === "object" && a && b) return isPropsEqual(a, b, isDateInputsEqual);
	return a === b;
}
function isDateInputsEqual(a, b) {
	if (a instanceof Date && b instanceof Date) return a.valueOf() === b.valueOf();
	if (Array.isArray(a) && Array.isArray(b)) return isArraysEqual(a, b);
	return a === b;
}
var VIEW_OPTION_REFINERS = {
	type: String,
	component: identity,
	buttonText: String,
	buttonTextKey: String,
	dateProfileGeneratorClass: identity,
	usesMinMaxTime: Boolean,
	classNames: identity,
	content: identity,
	didMount: identity,
	willUnmount: identity
};
function mergeRawOptions(optionSets) {
	return mergeProps(optionSets, COMPLEX_OPTION_COMPARATORS);
}
function refineProps(input, refiners) {
	let refined = {};
	let extra = {};
	for (let propName in refiners) if (propName in input) refined[propName] = refiners[propName](input[propName]);
	for (let propName in input) if (!(propName in refiners)) extra[propName] = input[propName];
	return {
		refined,
		extra
	};
}
function identity(raw) {
	return raw;
}
var { hasOwnProperty } = Object.prototype;
function mergeProps(propObjs, complexPropsMap) {
	let dest = {};
	if (complexPropsMap) {
		for (let name in complexPropsMap) if (complexPropsMap[name] === isMaybeObjectsEqual) {
			let complexObjs = [];
			for (let i = propObjs.length - 1; i >= 0; i -= 1) {
				let val = propObjs[i][name];
				if (typeof val === "object" && val) complexObjs.unshift(val);
				else if (val !== void 0) {
					dest[name] = val;
					break;
				}
			}
			if (complexObjs.length) dest[name] = mergeProps(complexObjs);
		}
	}
	for (let i = propObjs.length - 1; i >= 0; i -= 1) {
		let props = propObjs[i];
		for (let name in props) if (!(name in dest)) dest[name] = props[name];
	}
	return dest;
}
function filterHash(hash, func) {
	let filtered = {};
	for (let key in hash) if (func(hash[key], key)) filtered[key] = hash[key];
	return filtered;
}
function mapHash(hash, func) {
	let newHash = {};
	for (let key in hash) newHash[key] = func(hash[key], key);
	return newHash;
}
function arrayToHash(a) {
	let hash = {};
	for (let item of a) hash[item] = true;
	return hash;
}
function hashValuesToArray(obj) {
	let a = [];
	for (let key in obj) a.push(obj[key]);
	return a;
}
function isPropsEqual(obj0, obj1, valuesEqual) {
	if (obj0 === obj1) return true;
	for (let key in obj0) if (hasOwnProperty.call(obj0, key)) {
		if (!(key in obj1)) return false;
	}
	for (let key in obj1) if (hasOwnProperty.call(obj1, key)) {
		if (!(valuesEqual ? valuesEqual(obj0[key], obj1[key]) : obj0[key] === obj1[key])) return false;
	}
	return true;
}
var HANDLER_RE = /^on[A-Z]/;
function isNonHandlerPropsEqual(obj0, obj1) {
	const keys = getUnequalProps(obj0, obj1);
	for (let key of keys) if (!HANDLER_RE.test(key)) return false;
	return true;
}
function getUnequalProps(obj0, obj1) {
	let keys = [];
	for (let key in obj0) if (hasOwnProperty.call(obj0, key)) {
		if (!(key in obj1)) keys.push(key);
	}
	for (let key in obj1) if (hasOwnProperty.call(obj1, key)) {
		if (obj0[key] !== obj1[key]) keys.push(key);
	}
	return keys;
}
function compareObjs(oldProps, newProps, equalityFuncs = {}) {
	if (oldProps === newProps) return true;
	for (let key in newProps) if (key in oldProps && isObjValsEqual(oldProps[key], newProps[key], equalityFuncs[key]));
	else return false;
	for (let key in oldProps) if (!(key in newProps)) return false;
	return true;
}
function isObjValsEqual(val0, val1, comparator) {
	if (val0 === val1 || comparator === true) return true;
	if (comparator) return comparator(val0, val1);
	return false;
}
function collectFromHash(hash, startIndex = 0, endIndex, step = 1) {
	let res = [];
	if (endIndex == null) endIndex = Object.keys(hash).length;
	for (let i = startIndex; i < endIndex; i += step) {
		let val = hash[i];
		if (val !== void 0) res.push(val);
	}
	return res;
}
var calendarSystemClassMap = {};
function registerCalendarSystem(name, theClass) {
	calendarSystemClassMap[name] = theClass;
}
function createCalendarSystem(name) {
	return new calendarSystemClassMap[name]();
}
var GregorianCalendarSystem = class {
	getMarkerYear(d) {
		return d.getUTCFullYear();
	}
	getMarkerMonth(d) {
		return d.getUTCMonth();
	}
	getMarkerDay(d) {
		return d.getUTCDate();
	}
	arrayToMarker(arr) {
		return arrayToUtcDate(arr);
	}
	markerToArray(marker) {
		return dateToUtcArray(marker);
	}
};
registerCalendarSystem("gregory", GregorianCalendarSystem);
var ISO_RE = /^\s*(\d{4})(-?(\d{2})(-?(\d{2})([T ](\d{2}):?(\d{2})(:?(\d{2})(\.(\d+))?)?(Z|(([-+])(\d{2})(:?(\d{2}))?))?)?)?)?$/;
function parse(str) {
	let m = ISO_RE.exec(str);
	if (m) {
		let marker = new Date(Date.UTC(Number(m[1]), m[3] ? Number(m[3]) - 1 : 0, Number(m[5] || 1), Number(m[7] || 0), Number(m[8] || 0), Number(m[10] || 0), m[12] ? Number(`0.${m[12]}`) * 1e3 : 0));
		if (isValidDate(marker)) {
			let timeZoneOffset = null;
			if (m[13]) timeZoneOffset = (m[15] === "-" ? -1 : 1) * (Number(m[16] || 0) * 60 + Number(m[18] || 0));
			return {
				marker,
				isTimeUnspecified: !m[6],
				timeZoneOffset
			};
		}
	}
	return null;
}
var DateEnv = class {
	constructor(settings) {
		let timeZone = this.timeZone = settings.timeZone;
		let isNamedTimeZone = timeZone !== "local" && timeZone !== "UTC";
		if (settings.namedTimeZoneImpl && isNamedTimeZone) this.namedTimeZoneImpl = new settings.namedTimeZoneImpl(timeZone);
		this.canComputeOffset = Boolean(!isNamedTimeZone || this.namedTimeZoneImpl);
		this.calendarSystem = createCalendarSystem(settings.calendarSystem);
		this.locale = settings.locale;
		this.weekDow = settings.locale.week.dow;
		this.weekDoy = settings.locale.week.doy;
		if (settings.weekNumberCalculation === "ISO") {
			this.weekDow = 1;
			this.weekDoy = 4;
		}
		if (typeof settings.firstDay === "number") this.weekDow = settings.firstDay;
		if (typeof settings.weekNumberCalculation === "function") this.weekNumberFunc = settings.weekNumberCalculation;
		this.weekText = settings.weekText != null ? settings.weekText : settings.locale.options.weekText;
		this.weekTextLong = (settings.weekTextLong != null ? settings.weekTextLong : settings.locale.options.weekTextLong) || this.weekText;
		this.cmdFormatter = settings.cmdFormatter;
		this.defaultSeparator = settings.defaultSeparator;
	}
	createMarker(input) {
		let meta = this.createMarkerMeta(input);
		if (meta === null) return null;
		return meta.marker;
	}
	createNowMarker() {
		if (this.canComputeOffset) return this.timestampToMarker((/* @__PURE__ */ new Date()).valueOf());
		return arrayToUtcDate(dateToLocalArray(/* @__PURE__ */ new Date()));
	}
	createMarkerMeta(input) {
		if (typeof input === "string") return this.parse(input);
		let marker = null;
		if (typeof input === "number") marker = this.timestampToMarker(input);
		else if (input instanceof Date) {
			input = input.valueOf();
			if (!isNaN(input)) marker = this.timestampToMarker(input);
		} else if (Array.isArray(input)) marker = arrayToUtcDate(input);
		if (marker === null || !isValidDate(marker)) return null;
		return {
			marker,
			isTimeUnspecified: false,
			forcedTzo: null
		};
	}
	parse(s) {
		let parts = parse(s);
		if (parts === null) return null;
		let { marker } = parts;
		let forcedTzo = null;
		if (parts.timeZoneOffset !== null) if (this.canComputeOffset) marker = this.timestampToMarker(marker.valueOf() - parts.timeZoneOffset * 60 * 1e3);
		else forcedTzo = parts.timeZoneOffset;
		return {
			marker,
			isTimeUnspecified: parts.isTimeUnspecified,
			forcedTzo
		};
	}
	getYear(marker) {
		return this.calendarSystem.getMarkerYear(marker);
	}
	getMonth(marker) {
		return this.calendarSystem.getMarkerMonth(marker);
	}
	getDay(marker) {
		return this.calendarSystem.getMarkerDay(marker);
	}
	add(marker, dur) {
		let a = this.calendarSystem.markerToArray(marker);
		a[0] += dur.years;
		a[1] += dur.months;
		a[2] += dur.days;
		a[6] += dur.milliseconds;
		return this.calendarSystem.arrayToMarker(a);
	}
	subtract(marker, dur) {
		let a = this.calendarSystem.markerToArray(marker);
		a[0] -= dur.years;
		a[1] -= dur.months;
		a[2] -= dur.days;
		a[6] -= dur.milliseconds;
		return this.calendarSystem.arrayToMarker(a);
	}
	addYears(marker, n) {
		let a = this.calendarSystem.markerToArray(marker);
		a[0] += n;
		return this.calendarSystem.arrayToMarker(a);
	}
	addMonths(marker, n) {
		let a = this.calendarSystem.markerToArray(marker);
		a[1] += n;
		return this.calendarSystem.arrayToMarker(a);
	}
	diffWholeYears(m0, m1) {
		let { calendarSystem } = this;
		if (timeAsMs(m0) === timeAsMs(m1) && calendarSystem.getMarkerDay(m0) === calendarSystem.getMarkerDay(m1) && calendarSystem.getMarkerMonth(m0) === calendarSystem.getMarkerMonth(m1)) return calendarSystem.getMarkerYear(m1) - calendarSystem.getMarkerYear(m0);
		return null;
	}
	diffWholeMonths(m0, m1) {
		let { calendarSystem } = this;
		if (timeAsMs(m0) === timeAsMs(m1) && calendarSystem.getMarkerDay(m0) === calendarSystem.getMarkerDay(m1)) return calendarSystem.getMarkerMonth(m1) - calendarSystem.getMarkerMonth(m0) + (calendarSystem.getMarkerYear(m1) - calendarSystem.getMarkerYear(m0)) * 12;
		return null;
	}
	greatestWholeUnit(m0, m1) {
		let n = this.diffWholeYears(m0, m1);
		if (n !== null) return {
			unit: "year",
			value: n
		};
		n = this.diffWholeMonths(m0, m1);
		if (n !== null) return {
			unit: "month",
			value: n
		};
		n = diffWholeWeeks(m0, m1);
		if (n !== null) return {
			unit: "week",
			value: n
		};
		n = diffWholeDays(m0, m1);
		if (n !== null) return {
			unit: "day",
			value: n
		};
		n = diffHours(m0, m1);
		if (isInt(n)) return {
			unit: "hour",
			value: n
		};
		n = diffMinutes(m0, m1);
		if (isInt(n)) return {
			unit: "minute",
			value: n
		};
		n = diffSeconds(m0, m1);
		if (isInt(n)) return {
			unit: "second",
			value: n
		};
		return {
			unit: "millisecond",
			value: m1.valueOf() - m0.valueOf()
		};
	}
	countDurationsBetween(m0, m1, d) {
		let diff;
		if (d.years) {
			diff = this.diffWholeYears(m0, m1);
			if (diff !== null) return diff / asRoughYears(d);
		}
		if (d.months) {
			diff = this.diffWholeMonths(m0, m1);
			if (diff !== null) return diff / asRoughMonths(d);
		}
		if (d.days) {
			diff = diffWholeDays(m0, m1);
			if (diff !== null) return diff / asRoughDays(d);
		}
		return (m1.valueOf() - m0.valueOf()) / asRoughMs(d);
	}
	startOf(m, unit) {
		if (unit === "year") return this.startOfYear(m);
		if (unit === "month") return this.startOfMonth(m);
		if (unit === "week") return this.startOfWeek(m);
		if (unit === "day") return startOfDay(m);
		if (unit === "hour") return startOfHour(m);
		if (unit === "minute") return startOfMinute(m);
		if (unit === "second") return startOfSecond(m);
		return null;
	}
	startOfYear(m) {
		return this.calendarSystem.arrayToMarker([this.calendarSystem.getMarkerYear(m)]);
	}
	startOfMonth(m) {
		return this.calendarSystem.arrayToMarker([this.calendarSystem.getMarkerYear(m), this.calendarSystem.getMarkerMonth(m)]);
	}
	startOfWeek(m) {
		return this.calendarSystem.arrayToMarker([
			this.calendarSystem.getMarkerYear(m),
			this.calendarSystem.getMarkerMonth(m),
			m.getUTCDate() - (m.getUTCDay() - this.weekDow + 7) % 7
		]);
	}
	computeWeekNumber(marker) {
		if (this.weekNumberFunc) return this.weekNumberFunc(this.toDate(marker));
		return weekOfYear(marker, this.weekDow, this.weekDoy);
	}
	format(marker, formatter, dateOptions = {}) {
		return formatter.format({
			marker,
			timeZoneOffset: dateOptions.forcedTzo != null ? dateOptions.forcedTzo : this.offsetForMarker(marker)
		}, this);
	}
	formatRange(start, end, formatter, dateOptions = {}) {
		if (dateOptions.isEndExclusive) end = addMs(end, -1);
		return formatter.formatRange({
			marker: start,
			timeZoneOffset: dateOptions.forcedStartTzo != null ? dateOptions.forcedStartTzo : this.offsetForMarker(start)
		}, {
			marker: end,
			timeZoneOffset: dateOptions.forcedEndTzo != null ? dateOptions.forcedEndTzo : this.offsetForMarker(end)
		}, this, dateOptions.defaultSeparator);
	}
	formatIso(marker, extraOptions = {}) {
		let timeZoneOffset = null;
		if (!extraOptions.omitTimeZoneOffset) if (extraOptions.forcedTzo != null) timeZoneOffset = extraOptions.forcedTzo;
		else timeZoneOffset = this.offsetForMarker(marker);
		return buildIsoString(marker, timeZoneOffset, extraOptions.omitTime);
	}
	timestampToMarker(ms) {
		if (this.timeZone === "local") return arrayToUtcDate(dateToLocalArray(new Date(ms)));
		if (this.timeZone === "UTC" || !this.namedTimeZoneImpl) return new Date(ms);
		return arrayToUtcDate(this.namedTimeZoneImpl.timestampToArray(ms));
	}
	offsetForMarker(m) {
		if (this.timeZone === "local") return -arrayToLocalDate(dateToUtcArray(m)).getTimezoneOffset();
		if (this.timeZone === "UTC") return 0;
		if (this.namedTimeZoneImpl) return this.namedTimeZoneImpl.offsetForArray(dateToUtcArray(m));
		return null;
	}
	toDate(m, forcedTzo) {
		if (this.timeZone === "local") return arrayToLocalDate(dateToUtcArray(m));
		if (this.timeZone === "UTC") return new Date(m.valueOf());
		if (!this.namedTimeZoneImpl) return new Date(m.valueOf() - (forcedTzo || 0));
		return /* @__PURE__ */ new Date(m.valueOf() - this.namedTimeZoneImpl.offsetForArray(dateToUtcArray(m)) * 1e3 * 60);
	}
};
var Theme = class {
	constructor(calendarOptions) {
		if (this.iconOverrideOption) this.setIconOverride(calendarOptions[this.iconOverrideOption]);
	}
	setIconOverride(iconOverrideHash) {
		let iconClassesCopy;
		let buttonName;
		if (typeof iconOverrideHash === "object" && iconOverrideHash) {
			iconClassesCopy = Object.assign({}, this.iconClasses);
			for (buttonName in iconOverrideHash) iconClassesCopy[buttonName] = this.applyIconOverridePrefix(iconOverrideHash[buttonName]);
			this.iconClasses = iconClassesCopy;
		} else if (iconOverrideHash === false) this.iconClasses = {};
	}
	applyIconOverridePrefix(className) {
		let prefix = this.iconOverridePrefix;
		if (prefix && className.indexOf(prefix) !== 0) className = prefix + className;
		return className;
	}
	getClass(key) {
		return this.classes[key] || "";
	}
	getIconClass(buttonName, isRtl) {
		let className;
		if (isRtl && this.rtlIconClasses) className = this.rtlIconClasses[buttonName] || this.iconClasses[buttonName];
		else className = this.iconClasses[buttonName];
		if (className) return `${this.baseIconClass} ${className}`;
		return "";
	}
	getCustomButtonIconClass(customButtonProps) {
		let className;
		if (this.iconOverrideCustomButtonOption) {
			className = customButtonProps[this.iconOverrideCustomButtonOption];
			if (className) return `${this.baseIconClass} ${this.applyIconOverridePrefix(className)}`;
		}
		return "";
	}
};
Theme.prototype.classes = {};
Theme.prototype.iconClasses = {};
Theme.prototype.baseIconClass = "";
Theme.prototype.iconOverridePrefix = "";
function flushSync$1(runBeforeFlush) {
	runBeforeFlush();
	let oldDebounceRendering = l$1.debounceRendering;
	let callbackQ = [];
	function execCallbackSync(callback) {
		callbackQ.push(callback);
	}
	l$1.debounceRendering = execCallbackSync;
	D$1(y(FakeComponent, {}), document.createElement("div"));
	while (callbackQ.length) callbackQ.shift()();
	l$1.debounceRendering = oldDebounceRendering;
}
var FakeComponent = class extends x$1 {
	render() {
		return y("div", {});
	}
	componentDidMount() {
		this.setState({});
	}
};
function createContext(defaultValue) {
	let ContextType = G$1(defaultValue);
	let origProvider = ContextType.Provider;
	ContextType.Provider = function() {
		let isNew = !this.getChildContext;
		let children = origProvider.apply(this, arguments);
		if (isNew) {
			let subs = [];
			this.shouldComponentUpdate = (_props) => {
				if (this.props.value !== _props.value) subs.forEach((c) => {
					c.context = _props.value;
					c.forceUpdate();
				});
			};
			this.sub = (c) => {
				subs.push(c);
				let old = c.componentWillUnmount;
				c.componentWillUnmount = () => {
					subs.splice(subs.indexOf(c), 1);
					old && old.call(c);
				};
			};
		}
		return children;
	};
	return ContextType;
}
var ScrollResponder = class {
	constructor(execFunc, emitter, scrollTime, scrollTimeReset) {
		this.execFunc = execFunc;
		this.emitter = emitter;
		this.scrollTime = scrollTime;
		this.scrollTimeReset = scrollTimeReset;
		this.handleScrollRequest = (request) => {
			this.queuedRequest = Object.assign({}, this.queuedRequest || {}, request);
			this.drain();
		};
		emitter.on("_scrollRequest", this.handleScrollRequest);
		this.fireInitialScroll();
	}
	detach() {
		this.emitter.off("_scrollRequest", this.handleScrollRequest);
	}
	update(isDatesNew) {
		if (isDatesNew && this.scrollTimeReset) this.fireInitialScroll();
		else this.drain();
	}
	fireInitialScroll() {
		this.handleScrollRequest({ time: this.scrollTime });
	}
	drain() {
		if (this.queuedRequest && this.execFunc(this.queuedRequest)) this.queuedRequest = null;
	}
};
var ViewContextType = createContext({});
function buildViewContext(viewSpec, viewApi, viewOptions, dateProfileGenerator, dateEnv, nowManager, theme, pluginHooks, dispatch, getCurrentData, emitter, calendarApi, registerInteractiveComponent, unregisterInteractiveComponent) {
	return {
		dateEnv,
		nowManager,
		options: viewOptions,
		pluginHooks,
		emitter,
		dispatch,
		getCurrentData,
		calendarApi,
		viewSpec,
		viewApi,
		dateProfileGenerator,
		theme,
		isRtl: viewOptions.direction === "rtl",
		addResizeHandler(handler) {
			emitter.on("_resize", handler);
		},
		removeResizeHandler(handler) {
			emitter.off("_resize", handler);
		},
		createScrollResponder(execFunc) {
			return new ScrollResponder(execFunc, emitter, createDuration(viewOptions.scrollTime), viewOptions.scrollTimeReset);
		},
		registerInteractiveComponent,
		unregisterInteractiveComponent
	};
}
var PureComponent$1 = class extends x$1 {
	shouldComponentUpdate(nextProps, nextState) {
		return !compareObjs(this.props, nextProps, this.propEquality) || !compareObjs(this.state, nextState, this.stateEquality);
	}
	safeSetState(newState) {
		if (!compareObjs(this.state, Object.assign(Object.assign({}, this.state), newState), this.stateEquality)) this.setState(newState);
	}
};
PureComponent$1.addPropsEquality = addPropsEquality;
PureComponent$1.addStateEquality = addStateEquality;
PureComponent$1.contextType = ViewContextType;
PureComponent$1.prototype.propEquality = {};
PureComponent$1.prototype.stateEquality = {};
var BaseComponent = class extends PureComponent$1 {};
BaseComponent.contextType = ViewContextType;
function addPropsEquality(propEquality) {
	let hash = Object.create(this.prototype.propEquality);
	Object.assign(hash, propEquality);
	this.prototype.propEquality = hash;
}
function addStateEquality(stateEquality) {
	let hash = Object.create(this.prototype.stateEquality);
	Object.assign(hash, stateEquality);
	this.prototype.stateEquality = hash;
}
function setRef(ref, current) {
	if (typeof ref === "function") ref(current);
	else if (ref) ref.current = current;
}
var ContentInjector = class extends BaseComponent {
	constructor() {
		super(...arguments);
		this.id = guid();
		this.queuedDomNodes = [];
		this.currentDomNodes = [];
		this.handleEl = (el) => {
			const { options } = this.context;
			const { generatorName } = this.props;
			if (!options.customRenderingReplaces || !hasCustomRenderingHandler(generatorName, options)) this.updateElRef(el);
		};
		this.updateElRef = (el) => {
			if (this.props.elRef) setRef(this.props.elRef, el);
		};
	}
	render() {
		const { props, context } = this;
		const { options } = context;
		const { customGenerator, defaultGenerator, renderProps } = props;
		const attrs = buildElAttrs(props, [], this.handleEl);
		let useDefault = false;
		let innerContent;
		let queuedDomNodes = [];
		let currentGeneratorMeta;
		if (customGenerator != null) {
			const customGeneratorRes = typeof customGenerator === "function" ? customGenerator(renderProps, y) : customGenerator;
			if (customGeneratorRes === true) useDefault = true;
			else {
				const isObject = customGeneratorRes && typeof customGeneratorRes === "object";
				if (isObject && "html" in customGeneratorRes) attrs.dangerouslySetInnerHTML = { __html: customGeneratorRes.html };
				else if (isObject && "domNodes" in customGeneratorRes) queuedDomNodes = Array.prototype.slice.call(customGeneratorRes.domNodes);
				else if (isObject ? i$1(customGeneratorRes) : typeof customGeneratorRes !== "function") innerContent = customGeneratorRes;
				else currentGeneratorMeta = customGeneratorRes;
			}
		} else useDefault = !hasCustomRenderingHandler(props.generatorName, options);
		if (useDefault && defaultGenerator) innerContent = defaultGenerator(renderProps);
		this.queuedDomNodes = queuedDomNodes;
		this.currentGeneratorMeta = currentGeneratorMeta;
		return y(props.elTag, attrs, innerContent);
	}
	componentDidMount() {
		this.applyQueueudDomNodes();
		this.triggerCustomRendering(true);
	}
	componentDidUpdate() {
		this.applyQueueudDomNodes();
		this.triggerCustomRendering(true);
	}
	componentWillUnmount() {
		this.triggerCustomRendering(false);
	}
	triggerCustomRendering(isActive) {
		var _a;
		const { props, context } = this;
		const { handleCustomRendering, customRenderingMetaMap } = context.options;
		if (handleCustomRendering) {
			const generatorMeta = (_a = this.currentGeneratorMeta) !== null && _a !== void 0 ? _a : customRenderingMetaMap === null || customRenderingMetaMap === void 0 ? void 0 : customRenderingMetaMap[props.generatorName];
			if (generatorMeta) handleCustomRendering(Object.assign(Object.assign({
				id: this.id,
				isActive,
				containerEl: this.base,
				reportNewContainerEl: this.updateElRef,
				generatorMeta
			}, props), { elClasses: (props.elClasses || []).filter(isTruthy) }));
		}
	}
	applyQueueudDomNodes() {
		const { queuedDomNodes, currentDomNodes } = this;
		const el = this.base;
		if (!isArraysEqual(queuedDomNodes, currentDomNodes)) {
			currentDomNodes.forEach(removeElement);
			for (let newNode of queuedDomNodes) el.appendChild(newNode);
			this.currentDomNodes = queuedDomNodes;
		}
	}
};
ContentInjector.addPropsEquality({
	elClasses: isArraysEqual,
	elStyle: isPropsEqual,
	elAttrs: isNonHandlerPropsEqual,
	renderProps: isPropsEqual
});
function hasCustomRenderingHandler(generatorName, options) {
	var _a;
	return Boolean(options.handleCustomRendering && generatorName && ((_a = options.customRenderingMetaMap) === null || _a === void 0 ? void 0 : _a[generatorName]));
}
function buildElAttrs(props, extraClassNames, elRef) {
	const attrs = Object.assign(Object.assign({}, props.elAttrs), { ref: elRef });
	if (props.elClasses || extraClassNames) attrs.className = (props.elClasses || []).concat(extraClassNames || []).concat(attrs.className || []).filter(Boolean).join(" ");
	if (props.elStyle) attrs.style = props.elStyle;
	return attrs;
}
function isTruthy(val) {
	return Boolean(val);
}
var RenderId = createContext(0);
var ContentContainer = class extends x$1 {
	constructor() {
		super(...arguments);
		this.InnerContent = InnerContentInjector.bind(void 0, this);
		this.handleEl = (el) => {
			this.el = el;
			if (this.props.elRef) {
				setRef(this.props.elRef, el);
				if (el && this.didMountMisfire) this.componentDidMount();
			}
		};
	}
	render() {
		const { props } = this;
		const generatedClassNames = generateClassNames(props.classNameGenerator, props.renderProps);
		if (props.children) {
			const elAttrs = buildElAttrs(props, generatedClassNames, this.handleEl);
			const children = props.children(this.InnerContent, props.renderProps, elAttrs);
			if (props.elTag) return y(props.elTag, elAttrs, children);
			else return children;
		} else return y(ContentInjector, Object.assign(Object.assign({}, props), {
			elRef: this.handleEl,
			elTag: props.elTag || "div",
			elClasses: (props.elClasses || []).concat(generatedClassNames),
			renderId: this.context
		}));
	}
	componentDidMount() {
		var _a, _b;
		if (this.el) (_b = (_a = this.props).didMount) === null || _b === void 0 || _b.call(_a, Object.assign(Object.assign({}, this.props.renderProps), { el: this.el }));
		else this.didMountMisfire = true;
	}
	componentWillUnmount() {
		var _a, _b;
		(_b = (_a = this.props).willUnmount) === null || _b === void 0 || _b.call(_a, Object.assign(Object.assign({}, this.props.renderProps), { el: this.el }));
	}
};
ContentContainer.contextType = RenderId;
function InnerContentInjector(containerComponent, props) {
	const parentProps = containerComponent.props;
	return y(ContentInjector, Object.assign({
		renderProps: parentProps.renderProps,
		generatorName: parentProps.generatorName,
		customGenerator: parentProps.customGenerator,
		defaultGenerator: parentProps.defaultGenerator,
		renderId: containerComponent.context
	}, props));
}
function generateClassNames(classNameGenerator, renderProps) {
	const classNames = typeof classNameGenerator === "function" ? classNameGenerator(renderProps) : classNameGenerator || [];
	return typeof classNames === "string" ? [classNames] : classNames;
}
var ViewContainer = class extends BaseComponent {
	render() {
		let { props, context } = this;
		let { options } = context;
		let renderProps = { view: context.viewApi };
		return y(ContentContainer, {
			elRef: props.elRef,
			elTag: props.elTag || "div",
			elAttrs: props.elAttrs,
			elClasses: [...buildViewClassNames(props.viewSpec), ...props.elClasses || []],
			elStyle: props.elStyle,
			renderProps,
			classNameGenerator: options.viewClassNames,
			generatorName: void 0,
			didMount: options.viewDidMount,
			willUnmount: options.viewWillUnmount
		}, () => props.children);
	}
};
function buildViewClassNames(viewSpec) {
	return [`fc-${viewSpec.type}-view`, "fc-view"];
}
function parseRange(input, dateEnv) {
	let start = null;
	let end = null;
	if (input.start) start = dateEnv.createMarker(input.start);
	if (input.end) end = dateEnv.createMarker(input.end);
	if (!start && !end) return null;
	if (start && end && end < start) return null;
	return {
		start,
		end
	};
}
function invertRanges(ranges, constraintRange) {
	let invertedRanges = [];
	let { start } = constraintRange;
	let i;
	let dateRange;
	ranges.sort(compareRanges);
	for (i = 0; i < ranges.length; i += 1) {
		dateRange = ranges[i];
		if (dateRange.start > start) invertedRanges.push({
			start,
			end: dateRange.start
		});
		if (dateRange.end > start) start = dateRange.end;
	}
	if (start < constraintRange.end) invertedRanges.push({
		start,
		end: constraintRange.end
	});
	return invertedRanges;
}
function compareRanges(range0, range1) {
	return range0.start.valueOf() - range1.start.valueOf();
}
function intersectRanges(range0, range1) {
	let { start, end } = range0;
	let newRange = null;
	if (range1.start !== null) if (start === null) start = range1.start;
	else start = new Date(Math.max(start.valueOf(), range1.start.valueOf()));
	if (range1.end != null) if (end === null) end = range1.end;
	else end = new Date(Math.min(end.valueOf(), range1.end.valueOf()));
	if (start === null || end === null || start < end) newRange = {
		start,
		end
	};
	return newRange;
}
function rangesEqual(range0, range1) {
	return (range0.start === null ? null : range0.start.valueOf()) === (range1.start === null ? null : range1.start.valueOf()) && (range0.end === null ? null : range0.end.valueOf()) === (range1.end === null ? null : range1.end.valueOf());
}
function rangesIntersect(range0, range1) {
	return (range0.end === null || range1.start === null || range0.end > range1.start) && (range0.start === null || range1.end === null || range0.start < range1.end);
}
function rangeContainsRange(outerRange, innerRange) {
	return (outerRange.start === null || innerRange.start !== null && innerRange.start >= outerRange.start) && (outerRange.end === null || innerRange.end !== null && innerRange.end <= outerRange.end);
}
function rangeContainsMarker(range, date) {
	return (range.start === null || date >= range.start) && (range.end === null || date < range.end);
}
function constrainMarkerToRange(date, range) {
	if (range.start != null && date < range.start) return range.start;
	if (range.end != null && date >= range.end) return /* @__PURE__ */ new Date(range.end.valueOf() - 1);
	return date;
}
function computeAlignedDayRange(timedRange) {
	let dayCnt = Math.floor(diffDays(timedRange.start, timedRange.end)) || 1;
	let start = startOfDay(timedRange.start);
	return {
		start,
		end: addDays(start, dayCnt)
	};
}
function computeVisibleDayRange(timedRange, nextDayThreshold = createDuration(0)) {
	let startDay = null;
	let endDay = null;
	if (timedRange.end) {
		endDay = startOfDay(timedRange.end);
		let endTimeMS = timedRange.end.valueOf() - endDay.valueOf();
		if (endTimeMS && endTimeMS >= asRoughMs(nextDayThreshold)) endDay = addDays(endDay, 1);
	}
	if (timedRange.start) {
		startDay = startOfDay(timedRange.start);
		if (endDay && endDay <= startDay) endDay = addDays(startDay, 1);
	}
	return {
		start: startDay,
		end: endDay
	};
}
function diffDates(date0, date1, dateEnv, largeUnit) {
	if (largeUnit === "year") return createDuration(dateEnv.diffWholeYears(date0, date1), "year");
	if (largeUnit === "month") return createDuration(dateEnv.diffWholeMonths(date0, date1), "month");
	return diffDayAndTime(date0, date1);
}
var DateProfileGenerator = class {
	constructor(props) {
		this.props = props;
		this.initHiddenDays();
	}
	buildPrev(currentDateProfile, currentDate, forceToValid) {
		let { dateEnv } = this.props;
		let prevDate = dateEnv.subtract(dateEnv.startOf(currentDate, currentDateProfile.currentRangeUnit), currentDateProfile.dateIncrement);
		return this.build(prevDate, -1, forceToValid);
	}
	buildNext(currentDateProfile, currentDate, forceToValid) {
		let { dateEnv } = this.props;
		let nextDate = dateEnv.add(dateEnv.startOf(currentDate, currentDateProfile.currentRangeUnit), currentDateProfile.dateIncrement);
		return this.build(nextDate, 1, forceToValid);
	}
	build(currentDate, direction, forceToValid = true) {
		let { props } = this;
		let validRange;
		let currentInfo;
		let isRangeAllDay;
		let renderRange;
		let activeRange;
		let isValid;
		validRange = this.buildValidRange();
		validRange = this.trimHiddenDays(validRange);
		if (forceToValid) currentDate = constrainMarkerToRange(currentDate, validRange);
		currentInfo = this.buildCurrentRangeInfo(currentDate, direction);
		isRangeAllDay = /^(year|month|week|day)$/.test(currentInfo.unit);
		renderRange = this.buildRenderRange(this.trimHiddenDays(currentInfo.range), currentInfo.unit, isRangeAllDay);
		renderRange = this.trimHiddenDays(renderRange);
		activeRange = renderRange;
		if (!props.showNonCurrentDates) activeRange = intersectRanges(activeRange, currentInfo.range);
		activeRange = this.adjustActiveRange(activeRange);
		activeRange = intersectRanges(activeRange, validRange);
		isValid = rangesIntersect(currentInfo.range, validRange);
		if (!rangeContainsMarker(renderRange, currentDate)) currentDate = renderRange.start;
		return {
			currentDate,
			validRange,
			currentRange: currentInfo.range,
			currentRangeUnit: currentInfo.unit,
			isRangeAllDay,
			activeRange,
			renderRange,
			slotMinTime: props.slotMinTime,
			slotMaxTime: props.slotMaxTime,
			isValid,
			dateIncrement: this.buildDateIncrement(currentInfo.duration)
		};
	}
	buildValidRange() {
		let input = this.props.validRangeInput;
		let simpleInput = typeof input === "function" ? input.call(this.props.calendarApi, this.props.dateEnv.toDate(this.props.nowManager.getDateMarker())) : input;
		return this.refineRange(simpleInput) || {
			start: null,
			end: null
		};
	}
	buildCurrentRangeInfo(date, direction) {
		let { props } = this;
		let duration = null;
		let unit = null;
		let range = null;
		let dayCount;
		if (props.duration) {
			duration = props.duration;
			unit = props.durationUnit;
			range = this.buildRangeFromDuration(date, direction, duration, unit);
		} else if (dayCount = this.props.dayCount) {
			unit = "day";
			range = this.buildRangeFromDayCount(date, direction, dayCount);
		} else if (range = this.buildCustomVisibleRange(date)) unit = props.dateEnv.greatestWholeUnit(range.start, range.end).unit;
		else {
			duration = this.getFallbackDuration();
			unit = greatestDurationDenominator(duration).unit;
			range = this.buildRangeFromDuration(date, direction, duration, unit);
		}
		return {
			duration,
			unit,
			range
		};
	}
	getFallbackDuration() {
		return createDuration({ day: 1 });
	}
	adjustActiveRange(range) {
		let { dateEnv, usesMinMaxTime, slotMinTime, slotMaxTime } = this.props;
		let { start, end } = range;
		if (usesMinMaxTime) {
			if (asRoughDays(slotMinTime) < 0) {
				start = startOfDay(start);
				start = dateEnv.add(start, slotMinTime);
			}
			if (asRoughDays(slotMaxTime) > 1) {
				end = startOfDay(end);
				end = addDays(end, -1);
				end = dateEnv.add(end, slotMaxTime);
			}
		}
		return {
			start,
			end
		};
	}
	buildRangeFromDuration(date, direction, duration, unit) {
		let { dateEnv, dateAlignment } = this.props;
		let start;
		let end;
		let res;
		if (!dateAlignment) {
			let { dateIncrement } = this.props;
			if (dateIncrement) if (asRoughMs(dateIncrement) < asRoughMs(duration)) dateAlignment = greatestDurationDenominator(dateIncrement).unit;
			else dateAlignment = unit;
			else dateAlignment = unit;
		}
		if (asRoughDays(duration) <= 1) {
			if (this.isHiddenDay(start)) {
				start = this.skipHiddenDays(start, direction);
				start = startOfDay(start);
			}
		}
		function computeRes() {
			start = dateEnv.startOf(date, dateAlignment);
			end = dateEnv.add(start, duration);
			res = {
				start,
				end
			};
		}
		computeRes();
		if (!this.trimHiddenDays(res)) {
			date = this.skipHiddenDays(date, direction);
			computeRes();
		}
		return res;
	}
	buildRangeFromDayCount(date, direction, dayCount) {
		let { dateEnv, dateAlignment } = this.props;
		let runningCount = 0;
		let start = date;
		let end;
		if (dateAlignment) start = dateEnv.startOf(start, dateAlignment);
		start = startOfDay(start);
		start = this.skipHiddenDays(start, direction);
		end = start;
		do {
			end = addDays(end, 1);
			if (!this.isHiddenDay(end)) runningCount += 1;
		} while (runningCount < dayCount);
		return {
			start,
			end
		};
	}
	buildCustomVisibleRange(date) {
		let { props } = this;
		let input = props.visibleRangeInput;
		let simpleInput = typeof input === "function" ? input.call(props.calendarApi, props.dateEnv.toDate(date)) : input;
		let range = this.refineRange(simpleInput);
		if (range && (range.start == null || range.end == null)) return null;
		return range;
	}
	buildRenderRange(currentRange, currentRangeUnit, isRangeAllDay) {
		return currentRange;
	}
	buildDateIncrement(fallback) {
		let { dateIncrement } = this.props;
		let customAlignment;
		if (dateIncrement) return dateIncrement;
		if (customAlignment = this.props.dateAlignment) return createDuration(1, customAlignment);
		if (fallback) return fallback;
		return createDuration({ days: 1 });
	}
	refineRange(rangeInput) {
		if (rangeInput) {
			let range = parseRange(rangeInput, this.props.dateEnv);
			if (range) range = computeVisibleDayRange(range);
			return range;
		}
		return null;
	}
	initHiddenDays() {
		let hiddenDays = this.props.hiddenDays || [];
		let isHiddenDayHash = [];
		let dayCnt = 0;
		let i;
		if (this.props.weekends === false) hiddenDays = hiddenDays.concat([0, 6]);
		for (i = 0; i < 7; i += 1) if (!(isHiddenDayHash[i] = hiddenDays.indexOf(i) !== -1)) dayCnt += 1;
		if (!dayCnt) throw new Error("invalid hiddenDays");
		this.isHiddenDayHash = isHiddenDayHash;
	}
	trimHiddenDays(range) {
		let { start, end } = range;
		if (start) start = this.skipHiddenDays(start);
		if (end) end = this.skipHiddenDays(end, -1, true);
		if (start == null || end == null || start < end) return {
			start,
			end
		};
		return null;
	}
	isHiddenDay(day) {
		if (day instanceof Date) day = day.getUTCDay();
		return this.isHiddenDayHash[day];
	}
	skipHiddenDays(date, inc = 1, isExclusive = false) {
		while (this.isHiddenDayHash[(date.getUTCDay() + (isExclusive ? inc : 0) + 7) % 7]) date = addDays(date, inc);
		return date;
	}
};
function createEventInstance(defId, range, forcedStartTzo, forcedEndTzo) {
	return {
		instanceId: guid(),
		defId,
		range,
		forcedStartTzo: forcedStartTzo == null ? null : forcedStartTzo,
		forcedEndTzo: forcedEndTzo == null ? null : forcedEndTzo
	};
}
function parseRecurring(refined, defaultAllDay, dateEnv, recurringTypes) {
	for (let i = 0; i < recurringTypes.length; i += 1) {
		let parsed = recurringTypes[i].parse(refined, dateEnv);
		if (parsed) {
			let { allDay } = refined;
			if (allDay == null) {
				allDay = defaultAllDay;
				if (allDay == null) {
					allDay = parsed.allDayGuess;
					if (allDay == null) allDay = false;
				}
			}
			return {
				allDay,
				duration: parsed.duration,
				typeData: parsed.typeData,
				typeId: i
			};
		}
	}
	return null;
}
function expandRecurring(eventStore, framingRange, context) {
	let { dateEnv, pluginHooks, options } = context;
	let { defs, instances } = eventStore;
	instances = filterHash(instances, (instance) => !defs[instance.defId].recurringDef);
	for (let defId in defs) {
		let def = defs[defId];
		if (def.recurringDef) {
			let { duration } = def.recurringDef;
			if (!duration) duration = def.allDay ? options.defaultAllDayEventDuration : options.defaultTimedEventDuration;
			let starts = expandRecurringRanges(def, duration, framingRange, dateEnv, pluginHooks.recurringTypes);
			for (let start of starts) {
				let instance = createEventInstance(defId, {
					start,
					end: dateEnv.add(start, duration)
				});
				instances[instance.instanceId] = instance;
			}
		}
	}
	return {
		defs,
		instances
	};
}
function expandRecurringRanges(eventDef, duration, framingRange, dateEnv, recurringTypes) {
	let markers = recurringTypes[eventDef.recurringDef.typeId].expand(eventDef.recurringDef.typeData, {
		start: dateEnv.subtract(framingRange.start, duration),
		end: framingRange.end
	}, dateEnv);
	if (eventDef.allDay) markers = markers.map(startOfDay);
	return markers;
}
var EVENT_NON_DATE_REFINERS = {
	id: String,
	groupId: String,
	title: String,
	url: String,
	interactive: Boolean
};
var EVENT_DATE_REFINERS = {
	start: identity,
	end: identity,
	date: identity,
	allDay: Boolean
};
var EVENT_REFINERS = Object.assign(Object.assign(Object.assign({}, EVENT_NON_DATE_REFINERS), EVENT_DATE_REFINERS), { extendedProps: identity });
function parseEvent(raw, eventSource, context, allowOpenRange, refiners = buildEventRefiners(context), defIdMap, instanceIdMap) {
	let { refined, extra } = refineEventDef(raw, context, refiners);
	let defaultAllDay = computeIsDefaultAllDay(eventSource, context);
	let recurringRes = parseRecurring(refined, defaultAllDay, context.dateEnv, context.pluginHooks.recurringTypes);
	if (recurringRes) {
		let def = parseEventDef(refined, extra, eventSource ? eventSource.sourceId : "", recurringRes.allDay, Boolean(recurringRes.duration), context, defIdMap);
		def.recurringDef = {
			typeId: recurringRes.typeId,
			typeData: recurringRes.typeData,
			duration: recurringRes.duration
		};
		return {
			def,
			instance: null
		};
	}
	let singleRes = parseSingle(refined, defaultAllDay, context, allowOpenRange);
	if (singleRes) {
		let def = parseEventDef(refined, extra, eventSource ? eventSource.sourceId : "", singleRes.allDay, singleRes.hasEnd, context, defIdMap);
		let instance = createEventInstance(def.defId, singleRes.range, singleRes.forcedStartTzo, singleRes.forcedEndTzo);
		if (instanceIdMap && def.publicId && instanceIdMap[def.publicId]) instance.instanceId = instanceIdMap[def.publicId];
		return {
			def,
			instance
		};
	}
	return null;
}
function refineEventDef(raw, context, refiners = buildEventRefiners(context)) {
	return refineProps(raw, refiners);
}
function buildEventRefiners(context) {
	return Object.assign(Object.assign(Object.assign({}, EVENT_UI_REFINERS), EVENT_REFINERS), context.pluginHooks.eventRefiners);
}
function parseEventDef(refined, extra, sourceId, allDay, hasEnd, context, defIdMap) {
	let def = {
		title: refined.title || "",
		groupId: refined.groupId || "",
		publicId: refined.id || "",
		url: refined.url || "",
		recurringDef: null,
		defId: (defIdMap && refined.id ? defIdMap[refined.id] : "") || guid(),
		sourceId,
		allDay,
		hasEnd,
		interactive: refined.interactive,
		ui: createEventUi(refined, context),
		extendedProps: Object.assign(Object.assign({}, refined.extendedProps || {}), extra)
	};
	for (let memberAdder of context.pluginHooks.eventDefMemberAdders) Object.assign(def, memberAdder(refined));
	Object.freeze(def.ui.classNames);
	Object.freeze(def.extendedProps);
	return def;
}
function parseSingle(refined, defaultAllDay, context, allowOpenRange) {
	let { allDay } = refined;
	let startMeta;
	let startMarker = null;
	let hasEnd = false;
	let endMeta;
	let endMarker = null;
	let startInput = refined.start != null ? refined.start : refined.date;
	startMeta = context.dateEnv.createMarkerMeta(startInput);
	if (startMeta) startMarker = startMeta.marker;
	else if (!allowOpenRange) return null;
	if (refined.end != null) endMeta = context.dateEnv.createMarkerMeta(refined.end);
	if (allDay == null) if (defaultAllDay != null) allDay = defaultAllDay;
	else allDay = (!startMeta || startMeta.isTimeUnspecified) && (!endMeta || endMeta.isTimeUnspecified);
	if (allDay && startMarker) startMarker = startOfDay(startMarker);
	if (endMeta) {
		endMarker = endMeta.marker;
		if (allDay) endMarker = startOfDay(endMarker);
		if (startMarker && endMarker <= startMarker) endMarker = null;
	}
	if (endMarker) hasEnd = true;
	else if (!allowOpenRange) {
		hasEnd = context.options.forceEventDuration || false;
		endMarker = context.dateEnv.add(startMarker, allDay ? context.options.defaultAllDayEventDuration : context.options.defaultTimedEventDuration);
	}
	return {
		allDay,
		hasEnd,
		range: {
			start: startMarker,
			end: endMarker
		},
		forcedStartTzo: startMeta ? startMeta.forcedTzo : null,
		forcedEndTzo: endMeta ? endMeta.forcedTzo : null
	};
}
function computeIsDefaultAllDay(eventSource, context) {
	let res = null;
	if (eventSource) res = eventSource.defaultAllDay;
	if (res == null) res = context.options.defaultAllDay;
	return res;
}
function parseEvents(rawEvents, eventSource, context, allowOpenRange, defIdMap, instanceIdMap) {
	let eventStore = createEmptyEventStore();
	let eventRefiners = buildEventRefiners(context);
	for (let rawEvent of rawEvents) {
		let tuple = parseEvent(rawEvent, eventSource, context, allowOpenRange, eventRefiners, defIdMap, instanceIdMap);
		if (tuple) eventTupleToStore(tuple, eventStore);
	}
	return eventStore;
}
function eventTupleToStore(tuple, eventStore = createEmptyEventStore()) {
	eventStore.defs[tuple.def.defId] = tuple.def;
	if (tuple.instance) eventStore.instances[tuple.instance.instanceId] = tuple.instance;
	return eventStore;
}
function getRelevantEvents(eventStore, instanceId) {
	let instance = eventStore.instances[instanceId];
	if (instance) {
		let def = eventStore.defs[instance.defId];
		let newStore = filterEventStoreDefs(eventStore, (lookDef) => isEventDefsGrouped(def, lookDef));
		newStore.defs[def.defId] = def;
		newStore.instances[instance.instanceId] = instance;
		return newStore;
	}
	return createEmptyEventStore();
}
function isEventDefsGrouped(def0, def1) {
	return Boolean(def0.groupId && def0.groupId === def1.groupId);
}
function createEmptyEventStore() {
	return {
		defs: {},
		instances: {}
	};
}
function mergeEventStores(store0, store1) {
	return {
		defs: Object.assign(Object.assign({}, store0.defs), store1.defs),
		instances: Object.assign(Object.assign({}, store0.instances), store1.instances)
	};
}
function filterEventStoreDefs(eventStore, filterFunc) {
	let defs = filterHash(eventStore.defs, filterFunc);
	return {
		defs,
		instances: filterHash(eventStore.instances, (instance) => defs[instance.defId])
	};
}
function excludeSubEventStore(master, sub) {
	let { defs, instances } = master;
	let filteredDefs = {};
	let filteredInstances = {};
	for (let defId in defs) if (!sub.defs[defId]) filteredDefs[defId] = defs[defId];
	for (let instanceId in instances) if (!sub.instances[instanceId] && filteredDefs[instances[instanceId].defId]) filteredInstances[instanceId] = instances[instanceId];
	return {
		defs: filteredDefs,
		instances: filteredInstances
	};
}
function normalizeConstraint(input, context) {
	if (Array.isArray(input)) return parseEvents(input, null, context, true);
	if (typeof input === "object" && input) return parseEvents([input], null, context, true);
	if (input != null) return String(input);
	return null;
}
function parseClassNames(raw) {
	if (Array.isArray(raw)) return raw;
	if (typeof raw === "string") return raw.split(/\s+/);
	return [];
}
var EVENT_UI_REFINERS = {
	display: String,
	editable: Boolean,
	startEditable: Boolean,
	durationEditable: Boolean,
	constraint: identity,
	overlap: identity,
	allow: identity,
	className: parseClassNames,
	classNames: parseClassNames,
	color: String,
	backgroundColor: String,
	borderColor: String,
	textColor: String
};
var EMPTY_EVENT_UI = {
	display: null,
	startEditable: null,
	durationEditable: null,
	constraints: [],
	overlap: null,
	allows: [],
	backgroundColor: "",
	borderColor: "",
	textColor: "",
	classNames: []
};
function createEventUi(refined, context) {
	let constraint = normalizeConstraint(refined.constraint, context);
	return {
		display: refined.display || null,
		startEditable: refined.startEditable != null ? refined.startEditable : refined.editable,
		durationEditable: refined.durationEditable != null ? refined.durationEditable : refined.editable,
		constraints: constraint != null ? [constraint] : [],
		overlap: refined.overlap != null ? refined.overlap : null,
		allows: refined.allow != null ? [refined.allow] : [],
		backgroundColor: refined.backgroundColor || refined.color || "",
		borderColor: refined.borderColor || refined.color || "",
		textColor: refined.textColor || "",
		classNames: (refined.className || []).concat(refined.classNames || [])
	};
}
function combineEventUis(uis) {
	return uis.reduce(combineTwoEventUis, EMPTY_EVENT_UI);
}
function combineTwoEventUis(item0, item1) {
	return {
		display: item1.display != null ? item1.display : item0.display,
		startEditable: item1.startEditable != null ? item1.startEditable : item0.startEditable,
		durationEditable: item1.durationEditable != null ? item1.durationEditable : item0.durationEditable,
		constraints: item0.constraints.concat(item1.constraints),
		overlap: typeof item1.overlap === "boolean" ? item1.overlap : item0.overlap,
		allows: item0.allows.concat(item1.allows),
		backgroundColor: item1.backgroundColor || item0.backgroundColor,
		borderColor: item1.borderColor || item0.borderColor,
		textColor: item1.textColor || item0.textColor,
		classNames: item0.classNames.concat(item1.classNames)
	};
}
var EVENT_SOURCE_REFINERS = {
	id: String,
	defaultAllDay: Boolean,
	url: String,
	format: String,
	events: identity,
	eventDataTransform: identity,
	success: identity,
	failure: identity
};
function parseEventSource(raw, context, refiners = buildEventSourceRefiners(context)) {
	let rawObj;
	if (typeof raw === "string") rawObj = { url: raw };
	else if (typeof raw === "function" || Array.isArray(raw)) rawObj = { events: raw };
	else if (typeof raw === "object" && raw) rawObj = raw;
	if (rawObj) {
		let { refined, extra } = refineProps(rawObj, refiners);
		let metaRes = buildEventSourceMeta(refined, context);
		if (metaRes) return {
			_raw: raw,
			isFetching: false,
			latestFetchId: "",
			fetchRange: null,
			defaultAllDay: refined.defaultAllDay,
			eventDataTransform: refined.eventDataTransform,
			success: refined.success,
			failure: refined.failure,
			publicId: refined.id || "",
			sourceId: guid(),
			sourceDefId: metaRes.sourceDefId,
			meta: metaRes.meta,
			ui: createEventUi(refined, context),
			extendedProps: extra
		};
	}
	return null;
}
function buildEventSourceRefiners(context) {
	return Object.assign(Object.assign(Object.assign({}, EVENT_UI_REFINERS), EVENT_SOURCE_REFINERS), context.pluginHooks.eventSourceRefiners);
}
function buildEventSourceMeta(raw, context) {
	let defs = context.pluginHooks.eventSourceDefs;
	for (let i = defs.length - 1; i >= 0; i -= 1) {
		let meta = defs[i].parseMeta(raw);
		if (meta) return {
			sourceDefId: i,
			meta
		};
	}
	return null;
}
function reduceEventStore(eventStore, action, eventSources, dateProfile, context) {
	switch (action.type) {
		case "RECEIVE_EVENTS": return receiveRawEvents(eventStore, eventSources[action.sourceId], action.fetchId, action.fetchRange, action.rawEvents, context);
		case "RESET_RAW_EVENTS": return resetRawEvents(eventStore, eventSources[action.sourceId], action.rawEvents, dateProfile.activeRange, context);
		case "ADD_EVENTS": return addEvent(eventStore, action.eventStore, dateProfile ? dateProfile.activeRange : null, context);
		case "RESET_EVENTS": return action.eventStore;
		case "MERGE_EVENTS": return mergeEventStores(eventStore, action.eventStore);
		case "PREV":
		case "NEXT":
		case "CHANGE_DATE":
		case "CHANGE_VIEW_TYPE":
			if (dateProfile) return expandRecurring(eventStore, dateProfile.activeRange, context);
			return eventStore;
		case "REMOVE_EVENTS": return excludeSubEventStore(eventStore, action.eventStore);
		case "REMOVE_EVENT_SOURCE": return excludeEventsBySourceId(eventStore, action.sourceId);
		case "REMOVE_ALL_EVENT_SOURCES": return filterEventStoreDefs(eventStore, (eventDef) => !eventDef.sourceId);
		case "REMOVE_ALL_EVENTS": return createEmptyEventStore();
		default: return eventStore;
	}
}
function receiveRawEvents(eventStore, eventSource, fetchId, fetchRange, rawEvents, context) {
	if (eventSource && fetchId === eventSource.latestFetchId) {
		let subset = parseEvents(transformRawEvents(rawEvents, eventSource, context), eventSource, context);
		if (fetchRange) subset = expandRecurring(subset, fetchRange, context);
		return mergeEventStores(excludeEventsBySourceId(eventStore, eventSource.sourceId), subset);
	}
	return eventStore;
}
function resetRawEvents(existingEventStore, eventSource, rawEvents, activeRange, context) {
	const { defIdMap, instanceIdMap } = buildPublicIdMaps(existingEventStore);
	return expandRecurring(parseEvents(transformRawEvents(rawEvents, eventSource, context), eventSource, context, false, defIdMap, instanceIdMap), activeRange, context);
}
function transformRawEvents(rawEvents, eventSource, context) {
	let calEachTransform = context.options.eventDataTransform;
	let sourceEachTransform = eventSource ? eventSource.eventDataTransform : null;
	if (sourceEachTransform) rawEvents = transformEachRawEvent(rawEvents, sourceEachTransform);
	if (calEachTransform) rawEvents = transformEachRawEvent(rawEvents, calEachTransform);
	return rawEvents;
}
function transformEachRawEvent(rawEvents, func) {
	let refinedEvents;
	if (!func) refinedEvents = rawEvents;
	else {
		refinedEvents = [];
		for (let rawEvent of rawEvents) {
			let refinedEvent = func(rawEvent);
			if (refinedEvent) refinedEvents.push(refinedEvent);
			else if (refinedEvent == null) refinedEvents.push(rawEvent);
		}
	}
	return refinedEvents;
}
function addEvent(eventStore, subset, expandRange, context) {
	if (expandRange) subset = expandRecurring(subset, expandRange, context);
	return mergeEventStores(eventStore, subset);
}
function rezoneEventStoreDates(eventStore, oldDateEnv, newDateEnv) {
	let { defs } = eventStore;
	return {
		defs,
		instances: mapHash(eventStore.instances, (instance) => {
			if (defs[instance.defId].allDay) return instance;
			return Object.assign(Object.assign({}, instance), {
				range: {
					start: newDateEnv.createMarker(oldDateEnv.toDate(instance.range.start, instance.forcedStartTzo)),
					end: newDateEnv.createMarker(oldDateEnv.toDate(instance.range.end, instance.forcedEndTzo))
				},
				forcedStartTzo: newDateEnv.canComputeOffset ? null : instance.forcedStartTzo,
				forcedEndTzo: newDateEnv.canComputeOffset ? null : instance.forcedEndTzo
			});
		})
	};
}
function excludeEventsBySourceId(eventStore, sourceId) {
	return filterEventStoreDefs(eventStore, (eventDef) => eventDef.sourceId !== sourceId);
}
function excludeInstances(eventStore, removals) {
	return {
		defs: eventStore.defs,
		instances: filterHash(eventStore.instances, (instance) => !removals[instance.instanceId])
	};
}
function buildPublicIdMaps(eventStore) {
	const { defs, instances } = eventStore;
	const defIdMap = {};
	const instanceIdMap = {};
	for (let defId in defs) {
		const { publicId } = defs[defId];
		if (publicId) defIdMap[publicId] = defId;
	}
	for (let instanceId in instances) {
		const { publicId } = defs[instances[instanceId].defId];
		if (publicId) instanceIdMap[publicId] = instanceId;
	}
	return {
		defIdMap,
		instanceIdMap
	};
}
var Emitter = class {
	constructor() {
		this.handlers = {};
		this.thisContext = null;
	}
	setThisContext(thisContext) {
		this.thisContext = thisContext;
	}
	setOptions(options) {
		this.options = options;
	}
	on(type, handler) {
		addToHash(this.handlers, type, handler);
	}
	off(type, handler) {
		removeFromHash(this.handlers, type, handler);
	}
	trigger(type, ...args) {
		let attachedHandlers = this.handlers[type] || [];
		let optionHandler = this.options && this.options[type];
		let handlers = [].concat(optionHandler || [], attachedHandlers);
		for (let handler of handlers) handler.apply(this.thisContext, args);
	}
	hasHandlers(type) {
		return Boolean(this.handlers[type] && this.handlers[type].length || this.options && this.options[type]);
	}
};
function addToHash(hash, type, handler) {
	(hash[type] || (hash[type] = [])).push(handler);
}
function removeFromHash(hash, type, handler) {
	if (handler) {
		if (hash[type]) hash[type] = hash[type].filter((func) => func !== handler);
	} else delete hash[type];
}
var DEF_DEFAULTS = {
	startTime: "09:00",
	endTime: "17:00",
	daysOfWeek: [
		1,
		2,
		3,
		4,
		5
	],
	display: "inverse-background",
	classNames: "fc-non-business",
	groupId: "_businessHours"
};
function parseBusinessHours(input, context) {
	return parseEvents(refineInputs(input), null, context);
}
function refineInputs(input) {
	let rawDefs;
	if (input === true) rawDefs = [{}];
	else if (Array.isArray(input)) rawDefs = input.filter((rawDef) => rawDef.daysOfWeek);
	else if (typeof input === "object" && input) rawDefs = [input];
	else rawDefs = [];
	rawDefs = rawDefs.map((rawDef) => Object.assign(Object.assign({}, DEF_DEFAULTS), rawDef));
	return rawDefs;
}
function triggerDateSelect(selection, pev, context) {
	context.emitter.trigger("select", Object.assign(Object.assign({}, buildDateSpanApiWithContext(selection, context)), {
		jsEvent: pev ? pev.origEvent : null,
		view: context.viewApi || context.calendarApi.view
	}));
}
function triggerDateUnselect(pev, context) {
	context.emitter.trigger("unselect", {
		jsEvent: pev ? pev.origEvent : null,
		view: context.viewApi || context.calendarApi.view
	});
}
function buildDateSpanApiWithContext(dateSpan, context) {
	let props = {};
	for (let transform of context.pluginHooks.dateSpanTransforms) Object.assign(props, transform(dateSpan, context));
	Object.assign(props, buildDateSpanApi(dateSpan, context.dateEnv));
	return props;
}
function getDefaultEventEnd(allDay, marker, context) {
	let { dateEnv, options } = context;
	let end = marker;
	if (allDay) {
		end = startOfDay(end);
		end = dateEnv.add(end, options.defaultAllDayEventDuration);
	} else end = dateEnv.add(end, options.defaultTimedEventDuration);
	return end;
}
function applyMutationToEventStore(eventStore, eventConfigBase, mutation, context) {
	let eventConfigs = compileEventUis(eventStore.defs, eventConfigBase);
	let dest = createEmptyEventStore();
	for (let defId in eventStore.defs) {
		let def = eventStore.defs[defId];
		dest.defs[defId] = applyMutationToEventDef(def, eventConfigs[defId], mutation, context);
	}
	for (let instanceId in eventStore.instances) {
		let instance = eventStore.instances[instanceId];
		let def = dest.defs[instance.defId];
		dest.instances[instanceId] = applyMutationToEventInstance(instance, def, eventConfigs[instance.defId], mutation, context);
	}
	return dest;
}
function applyMutationToEventDef(eventDef, eventConfig, mutation, context) {
	let standardProps = mutation.standardProps || {};
	if (standardProps.hasEnd == null && eventConfig.durationEditable && (mutation.startDelta || mutation.endDelta)) standardProps.hasEnd = true;
	let copy = Object.assign(Object.assign(Object.assign({}, eventDef), standardProps), { ui: Object.assign(Object.assign({}, eventDef.ui), standardProps.ui) });
	if (mutation.extendedProps) copy.extendedProps = Object.assign(Object.assign({}, copy.extendedProps), mutation.extendedProps);
	for (let applier of context.pluginHooks.eventDefMutationAppliers) applier(copy, mutation, context);
	if (!copy.hasEnd && context.options.forceEventDuration) copy.hasEnd = true;
	return copy;
}
function applyMutationToEventInstance(eventInstance, eventDef, eventConfig, mutation, context) {
	let { dateEnv } = context;
	let forceAllDay = mutation.standardProps && mutation.standardProps.allDay === true;
	let clearEnd = mutation.standardProps && mutation.standardProps.hasEnd === false;
	let copy = Object.assign({}, eventInstance);
	if (forceAllDay) copy.range = computeAlignedDayRange(copy.range);
	if (mutation.datesDelta && eventConfig.startEditable) copy.range = {
		start: dateEnv.add(copy.range.start, mutation.datesDelta),
		end: dateEnv.add(copy.range.end, mutation.datesDelta)
	};
	if (mutation.startDelta && eventConfig.durationEditable) copy.range = {
		start: dateEnv.add(copy.range.start, mutation.startDelta),
		end: copy.range.end
	};
	if (mutation.endDelta && eventConfig.durationEditable) copy.range = {
		start: copy.range.start,
		end: dateEnv.add(copy.range.end, mutation.endDelta)
	};
	if (clearEnd) copy.range = {
		start: copy.range.start,
		end: getDefaultEventEnd(eventDef.allDay, copy.range.start, context)
	};
	if (eventDef.allDay) copy.range = {
		start: startOfDay(copy.range.start),
		end: startOfDay(copy.range.end)
	};
	if (copy.range.end < copy.range.start) copy.range.end = getDefaultEventEnd(eventDef.allDay, copy.range.start, context);
	return copy;
}
var EventSourceImpl = class {
	constructor(context, internalEventSource) {
		this.context = context;
		this.internalEventSource = internalEventSource;
	}
	remove() {
		this.context.dispatch({
			type: "REMOVE_EVENT_SOURCE",
			sourceId: this.internalEventSource.sourceId
		});
	}
	refetch() {
		this.context.dispatch({
			type: "FETCH_EVENT_SOURCES",
			sourceIds: [this.internalEventSource.sourceId],
			isRefetch: true
		});
	}
	get id() {
		return this.internalEventSource.publicId;
	}
	get url() {
		return this.internalEventSource.meta.url;
	}
	get format() {
		return this.internalEventSource.meta.format;
	}
};
var EventImpl = class EventImpl {
	constructor(context, def, instance) {
		this._context = context;
		this._def = def;
		this._instance = instance || null;
	}
	setProp(name, val) {
		if (name in EVENT_DATE_REFINERS) console.warn("Could not set date-related prop 'name'. Use one of the date-related methods instead.");
		else if (name === "id") {
			val = EVENT_NON_DATE_REFINERS[name](val);
			this.mutate({ standardProps: { publicId: val } });
		} else if (name in EVENT_NON_DATE_REFINERS) {
			val = EVENT_NON_DATE_REFINERS[name](val);
			this.mutate({ standardProps: { [name]: val } });
		} else if (name in EVENT_UI_REFINERS) {
			let ui = EVENT_UI_REFINERS[name](val);
			if (name === "color") ui = {
				backgroundColor: val,
				borderColor: val
			};
			else if (name === "editable") ui = {
				startEditable: val,
				durationEditable: val
			};
			else ui = { [name]: val };
			this.mutate({ standardProps: { ui } });
		} else console.warn(`Could not set prop '${name}'. Use setExtendedProp instead.`);
	}
	setExtendedProp(name, val) {
		this.mutate({ extendedProps: { [name]: val } });
	}
	setStart(startInput, options = {}) {
		let { dateEnv } = this._context;
		let start = dateEnv.createMarker(startInput);
		if (start && this._instance) {
			let instanceRange = this._instance.range;
			let startDelta = diffDates(instanceRange.start, start, dateEnv, options.granularity);
			if (options.maintainDuration) this.mutate({ datesDelta: startDelta });
			else this.mutate({ startDelta });
		}
	}
	setEnd(endInput, options = {}) {
		let { dateEnv } = this._context;
		let end;
		if (endInput != null) {
			end = dateEnv.createMarker(endInput);
			if (!end) return;
		}
		if (this._instance) if (end) {
			let endDelta = diffDates(this._instance.range.end, end, dateEnv, options.granularity);
			this.mutate({ endDelta });
		} else this.mutate({ standardProps: { hasEnd: false } });
	}
	setDates(startInput, endInput, options = {}) {
		let { dateEnv } = this._context;
		let standardProps = { allDay: options.allDay };
		let start = dateEnv.createMarker(startInput);
		let end;
		if (!start) return;
		if (endInput != null) {
			end = dateEnv.createMarker(endInput);
			if (!end) return;
		}
		if (this._instance) {
			let instanceRange = this._instance.range;
			if (options.allDay === true) instanceRange = computeAlignedDayRange(instanceRange);
			let startDelta = diffDates(instanceRange.start, start, dateEnv, options.granularity);
			if (end) {
				let endDelta = diffDates(instanceRange.end, end, dateEnv, options.granularity);
				if (durationsEqual(startDelta, endDelta)) this.mutate({
					datesDelta: startDelta,
					standardProps
				});
				else this.mutate({
					startDelta,
					endDelta,
					standardProps
				});
			} else {
				standardProps.hasEnd = false;
				this.mutate({
					datesDelta: startDelta,
					standardProps
				});
			}
		}
	}
	moveStart(deltaInput) {
		let delta = createDuration(deltaInput);
		if (delta) this.mutate({ startDelta: delta });
	}
	moveEnd(deltaInput) {
		let delta = createDuration(deltaInput);
		if (delta) this.mutate({ endDelta: delta });
	}
	moveDates(deltaInput) {
		let delta = createDuration(deltaInput);
		if (delta) this.mutate({ datesDelta: delta });
	}
	setAllDay(allDay, options = {}) {
		let standardProps = { allDay };
		let { maintainDuration } = options;
		if (maintainDuration == null) maintainDuration = this._context.options.allDayMaintainDuration;
		if (this._def.allDay !== allDay) standardProps.hasEnd = maintainDuration;
		this.mutate({ standardProps });
	}
	formatRange(formatInput) {
		let { dateEnv } = this._context;
		let instance = this._instance;
		let formatter = createFormatter(formatInput);
		if (this._def.hasEnd) return dateEnv.formatRange(instance.range.start, instance.range.end, formatter, {
			forcedStartTzo: instance.forcedStartTzo,
			forcedEndTzo: instance.forcedEndTzo
		});
		return dateEnv.format(instance.range.start, formatter, { forcedTzo: instance.forcedStartTzo });
	}
	mutate(mutation) {
		let instance = this._instance;
		if (instance) {
			let def = this._def;
			let context = this._context;
			let { eventStore } = context.getCurrentData();
			let relevantEvents = getRelevantEvents(eventStore, instance.instanceId);
			relevantEvents = applyMutationToEventStore(relevantEvents, { "": {
				display: "",
				startEditable: true,
				durationEditable: true,
				constraints: [],
				overlap: null,
				allows: [],
				backgroundColor: "",
				borderColor: "",
				textColor: "",
				classNames: []
			} }, mutation, context);
			let oldEvent = new EventImpl(context, def, instance);
			this._def = relevantEvents.defs[def.defId];
			this._instance = relevantEvents.instances[instance.instanceId];
			context.dispatch({
				type: "MERGE_EVENTS",
				eventStore: relevantEvents
			});
			context.emitter.trigger("eventChange", {
				oldEvent,
				event: this,
				relatedEvents: buildEventApis(relevantEvents, context, instance),
				revert() {
					context.dispatch({
						type: "RESET_EVENTS",
						eventStore
					});
				}
			});
		}
	}
	remove() {
		let context = this._context;
		let asStore = eventApiToStore(this);
		context.dispatch({
			type: "REMOVE_EVENTS",
			eventStore: asStore
		});
		context.emitter.trigger("eventRemove", {
			event: this,
			relatedEvents: [],
			revert() {
				context.dispatch({
					type: "MERGE_EVENTS",
					eventStore: asStore
				});
			}
		});
	}
	get source() {
		let { sourceId } = this._def;
		if (sourceId) return new EventSourceImpl(this._context, this._context.getCurrentData().eventSources[sourceId]);
		return null;
	}
	get start() {
		return this._instance ? this._context.dateEnv.toDate(this._instance.range.start) : null;
	}
	get end() {
		return this._instance && this._def.hasEnd ? this._context.dateEnv.toDate(this._instance.range.end) : null;
	}
	get startStr() {
		let instance = this._instance;
		if (instance) return this._context.dateEnv.formatIso(instance.range.start, {
			omitTime: this._def.allDay,
			forcedTzo: instance.forcedStartTzo
		});
		return "";
	}
	get endStr() {
		let instance = this._instance;
		if (instance && this._def.hasEnd) return this._context.dateEnv.formatIso(instance.range.end, {
			omitTime: this._def.allDay,
			forcedTzo: instance.forcedEndTzo
		});
		return "";
	}
	get id() {
		return this._def.publicId;
	}
	get groupId() {
		return this._def.groupId;
	}
	get allDay() {
		return this._def.allDay;
	}
	get title() {
		return this._def.title;
	}
	get url() {
		return this._def.url;
	}
	get display() {
		return this._def.ui.display || "auto";
	}
	get startEditable() {
		return this._def.ui.startEditable;
	}
	get durationEditable() {
		return this._def.ui.durationEditable;
	}
	get constraint() {
		return this._def.ui.constraints[0] || null;
	}
	get overlap() {
		return this._def.ui.overlap;
	}
	get allow() {
		return this._def.ui.allows[0] || null;
	}
	get backgroundColor() {
		return this._def.ui.backgroundColor;
	}
	get borderColor() {
		return this._def.ui.borderColor;
	}
	get textColor() {
		return this._def.ui.textColor;
	}
	get classNames() {
		return this._def.ui.classNames;
	}
	get extendedProps() {
		return this._def.extendedProps;
	}
	toPlainObject(settings = {}) {
		let def = this._def;
		let { ui } = def;
		let { startStr, endStr } = this;
		let res = { allDay: def.allDay };
		if (def.title) res.title = def.title;
		if (startStr) res.start = startStr;
		if (endStr) res.end = endStr;
		if (def.publicId) res.id = def.publicId;
		if (def.groupId) res.groupId = def.groupId;
		if (def.url) res.url = def.url;
		if (ui.display && ui.display !== "auto") res.display = ui.display;
		if (settings.collapseColor && ui.backgroundColor && ui.backgroundColor === ui.borderColor) res.color = ui.backgroundColor;
		else {
			if (ui.backgroundColor) res.backgroundColor = ui.backgroundColor;
			if (ui.borderColor) res.borderColor = ui.borderColor;
		}
		if (ui.textColor) res.textColor = ui.textColor;
		if (ui.classNames.length) res.classNames = ui.classNames;
		if (Object.keys(def.extendedProps).length) if (settings.collapseExtendedProps) Object.assign(res, def.extendedProps);
		else res.extendedProps = def.extendedProps;
		return res;
	}
	toJSON() {
		return this.toPlainObject();
	}
};
function eventApiToStore(eventApi) {
	let def = eventApi._def;
	let instance = eventApi._instance;
	return {
		defs: { [def.defId]: def },
		instances: instance ? { [instance.instanceId]: instance } : {}
	};
}
function buildEventApis(eventStore, context, excludeInstance) {
	let { defs, instances } = eventStore;
	let eventApis = [];
	let excludeInstanceId = excludeInstance ? excludeInstance.instanceId : "";
	for (let id in instances) {
		let instance = instances[id];
		let def = defs[instance.defId];
		if (instance.instanceId !== excludeInstanceId) eventApis.push(new EventImpl(context, def, instance));
	}
	return eventApis;
}
function sliceEventStore(eventStore, eventUiBases, framingRange, nextDayThreshold) {
	let inverseBgByGroupId = {};
	let inverseBgByDefId = {};
	let defByGroupId = {};
	let bgRanges = [];
	let fgRanges = [];
	let eventUis = compileEventUis(eventStore.defs, eventUiBases);
	for (let defId in eventStore.defs) {
		let def = eventStore.defs[defId];
		if (eventUis[def.defId].display === "inverse-background") if (def.groupId) {
			inverseBgByGroupId[def.groupId] = [];
			if (!defByGroupId[def.groupId]) defByGroupId[def.groupId] = def;
		} else inverseBgByDefId[defId] = [];
	}
	for (let instanceId in eventStore.instances) {
		let instance = eventStore.instances[instanceId];
		let def = eventStore.defs[instance.defId];
		let ui = eventUis[def.defId];
		let origRange = instance.range;
		let normalRange = !def.allDay && nextDayThreshold ? computeVisibleDayRange(origRange, nextDayThreshold) : origRange;
		let slicedRange = intersectRanges(normalRange, framingRange);
		if (slicedRange) {
			if (ui.display === "inverse-background") if (def.groupId) inverseBgByGroupId[def.groupId].push(slicedRange);
			else inverseBgByDefId[instance.defId].push(slicedRange);
			else if (ui.display !== "none") (ui.display === "background" ? bgRanges : fgRanges).push({
				def,
				ui,
				instance,
				range: slicedRange,
				isStart: normalRange.start && normalRange.start.valueOf() === slicedRange.start.valueOf(),
				isEnd: normalRange.end && normalRange.end.valueOf() === slicedRange.end.valueOf()
			});
		}
	}
	for (let groupId in inverseBgByGroupId) {
		let ranges = inverseBgByGroupId[groupId];
		let invertedRanges = invertRanges(ranges, framingRange);
		for (let invertedRange of invertedRanges) {
			let def = defByGroupId[groupId];
			let ui = eventUis[def.defId];
			bgRanges.push({
				def,
				ui,
				instance: null,
				range: invertedRange,
				isStart: false,
				isEnd: false
			});
		}
	}
	for (let defId in inverseBgByDefId) {
		let ranges = inverseBgByDefId[defId];
		let invertedRanges = invertRanges(ranges, framingRange);
		for (let invertedRange of invertedRanges) bgRanges.push({
			def: eventStore.defs[defId],
			ui: eventUis[defId],
			instance: null,
			range: invertedRange,
			isStart: false,
			isEnd: false
		});
	}
	return {
		bg: bgRanges,
		fg: fgRanges
	};
}
function setElSeg(el, seg) {
	el.fcSeg = seg;
}
function getElSeg(el) {
	return el.fcSeg || el.parentNode.fcSeg || null;
}
function compileEventUis(eventDefs, eventUiBases) {
	return mapHash(eventDefs, (eventDef) => compileEventUi(eventDef, eventUiBases));
}
function compileEventUi(eventDef, eventUiBases) {
	let uis = [];
	if (eventUiBases[""]) uis.push(eventUiBases[""]);
	if (eventUiBases[eventDef.defId]) uis.push(eventUiBases[eventDef.defId]);
	uis.push(eventDef.ui);
	return combineEventUis(uis);
}
function sortEventSegs(segs, eventOrderSpecs) {
	let objs = segs.map(buildSegCompareObj);
	objs.sort((obj0, obj1) => compareByFieldSpecs(obj0, obj1, eventOrderSpecs));
	return objs.map((c) => c._seg);
}
function buildSegCompareObj(seg) {
	let { eventRange } = seg;
	let eventDef = eventRange.def;
	let range = eventRange.instance ? eventRange.instance.range : eventRange.range;
	let start = range.start ? range.start.valueOf() : 0;
	let end = range.end ? range.end.valueOf() : 0;
	return Object.assign(Object.assign(Object.assign({}, eventDef.extendedProps), eventDef), {
		id: eventDef.publicId,
		start,
		end,
		duration: end - start,
		allDay: Number(eventDef.allDay),
		_seg: seg
	});
}
function computeSegDraggable(seg, context) {
	let { pluginHooks } = context;
	let transformers = pluginHooks.isDraggableTransformers;
	let { def, ui } = seg.eventRange;
	let val = ui.startEditable;
	for (let transformer of transformers) val = transformer(val, def, ui, context);
	return val;
}
function computeSegStartResizable(seg, context) {
	return seg.isStart && seg.eventRange.ui.durationEditable && context.options.eventResizableFromStart;
}
function computeSegEndResizable(seg, context) {
	return seg.isEnd && seg.eventRange.ui.durationEditable;
}
function buildSegTimeText(seg, timeFormat, context, defaultDisplayEventTime, defaultDisplayEventEnd, startOverride, endOverride) {
	let { dateEnv, options } = context;
	let { displayEventTime, displayEventEnd } = options;
	let eventDef = seg.eventRange.def;
	let eventInstance = seg.eventRange.instance;
	if (displayEventTime == null) displayEventTime = defaultDisplayEventTime !== false;
	if (displayEventEnd == null) displayEventEnd = defaultDisplayEventEnd !== false;
	let wholeEventStart = eventInstance.range.start;
	let wholeEventEnd = eventInstance.range.end;
	let segStart = startOverride || seg.start || seg.eventRange.range.start;
	let segEnd = endOverride || seg.end || seg.eventRange.range.end;
	let isStartDay = startOfDay(wholeEventStart).valueOf() === startOfDay(segStart).valueOf();
	let isEndDay = startOfDay(addMs(wholeEventEnd, -1)).valueOf() === startOfDay(addMs(segEnd, -1)).valueOf();
	if (displayEventTime && !eventDef.allDay && (isStartDay || isEndDay)) {
		segStart = isStartDay ? wholeEventStart : segStart;
		segEnd = isEndDay ? wholeEventEnd : segEnd;
		if (displayEventEnd && eventDef.hasEnd) return dateEnv.formatRange(segStart, segEnd, timeFormat, {
			forcedStartTzo: startOverride ? null : eventInstance.forcedStartTzo,
			forcedEndTzo: endOverride ? null : eventInstance.forcedEndTzo
		});
		return dateEnv.format(segStart, timeFormat, { forcedTzo: startOverride ? null : eventInstance.forcedStartTzo });
	}
	return "";
}
function getSegMeta(seg, todayRange, nowDate) {
	let segRange = seg.eventRange.range;
	return {
		isPast: segRange.end <= (nowDate || todayRange.start),
		isFuture: segRange.start >= (nowDate || todayRange.end),
		isToday: todayRange && rangeContainsMarker(todayRange, segRange.start)
	};
}
function getEventClassNames(props) {
	let classNames = ["fc-event"];
	if (props.isMirror) classNames.push("fc-event-mirror");
	if (props.isDraggable) classNames.push("fc-event-draggable");
	if (props.isStartResizable || props.isEndResizable) classNames.push("fc-event-resizable");
	if (props.isDragging) classNames.push("fc-event-dragging");
	if (props.isResizing) classNames.push("fc-event-resizing");
	if (props.isSelected) classNames.push("fc-event-selected");
	if (props.isStart) classNames.push("fc-event-start");
	if (props.isEnd) classNames.push("fc-event-end");
	if (props.isPast) classNames.push("fc-event-past");
	if (props.isToday) classNames.push("fc-event-today");
	if (props.isFuture) classNames.push("fc-event-future");
	return classNames;
}
function buildEventRangeKey(eventRange) {
	return eventRange.instance ? eventRange.instance.instanceId : `${eventRange.def.defId}:${eventRange.range.start.toISOString()}`;
}
function getSegAnchorAttrs(seg, context) {
	let { def, instance } = seg.eventRange;
	let { url } = def;
	if (url) return { href: url };
	let { emitter, options } = context;
	let { eventInteractive } = options;
	if (eventInteractive == null) {
		eventInteractive = def.interactive;
		if (eventInteractive == null) eventInteractive = Boolean(emitter.hasHandlers("eventClick"));
	}
	if (eventInteractive) return createAriaKeyboardAttrs((ev) => {
		emitter.trigger("eventClick", {
			el: ev.target,
			event: new EventImpl(context, def, instance),
			jsEvent: ev,
			view: context.viewApi
		});
	});
	return {};
}
var STANDARD_PROPS = {
	start: identity,
	end: identity,
	allDay: Boolean
};
function parseDateSpan(raw, dateEnv, defaultDuration) {
	let span = parseOpenDateSpan(raw, dateEnv);
	let { range } = span;
	if (!range.start) return null;
	if (!range.end) {
		if (defaultDuration == null) return null;
		range.end = dateEnv.add(range.start, defaultDuration);
	}
	return span;
}
function parseOpenDateSpan(raw, dateEnv) {
	let { refined: standardProps, extra } = refineProps(raw, STANDARD_PROPS);
	let startMeta = standardProps.start ? dateEnv.createMarkerMeta(standardProps.start) : null;
	let endMeta = standardProps.end ? dateEnv.createMarkerMeta(standardProps.end) : null;
	let { allDay } = standardProps;
	if (allDay == null) allDay = startMeta && startMeta.isTimeUnspecified && (!endMeta || endMeta.isTimeUnspecified);
	return Object.assign({
		range: {
			start: startMeta ? startMeta.marker : null,
			end: endMeta ? endMeta.marker : null
		},
		allDay
	}, extra);
}
function isDateSpansEqual(span0, span1) {
	return rangesEqual(span0.range, span1.range) && span0.allDay === span1.allDay && isSpanPropsEqual(span0, span1);
}
function isSpanPropsEqual(span0, span1) {
	for (let propName in span1) if (propName !== "range" && propName !== "allDay") {
		if (span0[propName] !== span1[propName]) return false;
	}
	for (let propName in span0) if (!(propName in span1)) return false;
	return true;
}
function buildDateSpanApi(span, dateEnv) {
	return Object.assign(Object.assign({}, buildRangeApi(span.range, dateEnv, span.allDay)), { allDay: span.allDay });
}
function buildRangeApiWithTimeZone(range, dateEnv, omitTime) {
	return Object.assign(Object.assign({}, buildRangeApi(range, dateEnv, omitTime)), { timeZone: dateEnv.timeZone });
}
function buildRangeApi(range, dateEnv, omitTime) {
	return {
		start: dateEnv.toDate(range.start),
		end: dateEnv.toDate(range.end),
		startStr: dateEnv.formatIso(range.start, { omitTime }),
		endStr: dateEnv.formatIso(range.end, { omitTime })
	};
}
function fabricateEventRange(dateSpan, eventUiBases, context) {
	let res = refineEventDef({ editable: false }, context);
	let def = parseEventDef(res.refined, res.extra, "", dateSpan.allDay, true, context);
	return {
		def,
		ui: compileEventUi(def, eventUiBases),
		instance: createEventInstance(def.defId, dateSpan.range),
		range: dateSpan.range,
		isStart: true,
		isEnd: true
	};
}
function unpromisify(func, normalizedSuccessCallback, normalizedFailureCallback) {
	let isResolved = false;
	let wrappedSuccess = function(res) {
		if (!isResolved) {
			isResolved = true;
			normalizedSuccessCallback(res);
		}
	};
	let wrappedFailure = function(error) {
		if (!isResolved) {
			isResolved = true;
			normalizedFailureCallback(error);
		}
	};
	let res = func(wrappedSuccess, wrappedFailure);
	if (res && typeof res.then === "function") res.then(wrappedSuccess, wrappedFailure);
}
var JsonRequestError = class extends Error {
	constructor(message, response) {
		super(message);
		this.response = response;
	}
};
function requestJson(method, url, params) {
	method = method.toUpperCase();
	const fetchOptions = { method };
	if (method === "GET") url += (url.indexOf("?") === -1 ? "?" : "&") + new URLSearchParams(params);
	else {
		fetchOptions.body = new URLSearchParams(params);
		fetchOptions.headers = { "Content-Type": "application/x-www-form-urlencoded" };
	}
	return fetch(url, fetchOptions).then((fetchRes) => {
		if (fetchRes.ok) return fetchRes.json().then((parsedResponse) => {
			return [parsedResponse, fetchRes];
		}, () => {
			throw new JsonRequestError("Failure parsing JSON", fetchRes);
		});
		else throw new JsonRequestError("Request failed", fetchRes);
	});
}
var canVGrowWithinCell;
function getCanVGrowWithinCell() {
	if (canVGrowWithinCell == null) canVGrowWithinCell = computeCanVGrowWithinCell();
	return canVGrowWithinCell;
}
function computeCanVGrowWithinCell() {
	if (typeof document === "undefined") return true;
	let el = document.createElement("div");
	el.style.position = "absolute";
	el.style.top = "0px";
	el.style.left = "0px";
	el.innerHTML = "<table><tr><td><div></div></td></tr></table>";
	el.querySelector("table").style.height = "100px";
	el.querySelector("div").style.height = "100%";
	document.body.appendChild(el);
	let possible = el.querySelector("div").offsetHeight > 0;
	document.body.removeChild(el);
	return possible;
}
var CalendarRoot = class extends BaseComponent {
	constructor() {
		super(...arguments);
		this.state = { forPrint: false };
		this.handleBeforePrint = () => {
			flushSync$1(() => {
				this.setState({ forPrint: true });
			});
		};
		this.handleAfterPrint = () => {
			flushSync$1(() => {
				this.setState({ forPrint: false });
			});
		};
	}
	render() {
		let { props } = this;
		let { options } = props;
		let { forPrint } = this.state;
		let isHeightAuto = forPrint || options.height === "auto" || options.contentHeight === "auto";
		let height = !isHeightAuto && options.height != null ? options.height : "";
		let classNames = [
			"fc",
			forPrint ? "fc-media-print" : "fc-media-screen",
			`fc-direction-${options.direction}`,
			props.theme.getClass("root")
		];
		if (!getCanVGrowWithinCell()) classNames.push("fc-liquid-hack");
		return props.children(classNames, height, isHeightAuto, forPrint);
	}
	componentDidMount() {
		let { emitter } = this.props;
		emitter.on("_beforeprint", this.handleBeforePrint);
		emitter.on("_afterprint", this.handleAfterPrint);
	}
	componentWillUnmount() {
		let { emitter } = this.props;
		emitter.off("_beforeprint", this.handleBeforePrint);
		emitter.off("_afterprint", this.handleAfterPrint);
	}
};
var Interaction = class {
	constructor(settings) {
		this.component = settings.component;
		this.isHitComboAllowed = settings.isHitComboAllowed || null;
	}
	destroy() {}
};
function parseInteractionSettings(component, input) {
	return {
		component,
		el: input.el,
		useEventCenter: input.useEventCenter != null ? input.useEventCenter : true,
		isHitComboAllowed: input.isHitComboAllowed || null
	};
}
function interactionSettingsToStore(settings) {
	return { [settings.component.uid]: settings };
}
var interactionSettingsStore = {};
var NowTimer = class extends x$1 {
	constructor(props, context) {
		super(props, context);
		this.handleRefresh = () => {
			let timing = this.computeTiming();
			if (timing.state.nowDate.valueOf() !== this.state.nowDate.valueOf()) this.setState(timing.state);
			this.clearTimeout();
			this.setTimeout(timing.waitMs);
		};
		this.handleVisibilityChange = () => {
			if (!document.hidden) this.handleRefresh();
		};
		this.state = this.computeTiming().state;
	}
	render() {
		let { props, state } = this;
		return props.children(state.nowDate, state.todayRange);
	}
	componentDidMount() {
		this.setTimeout();
		this.context.nowManager.addResetListener(this.handleRefresh);
		document.addEventListener("visibilitychange", this.handleVisibilityChange);
	}
	componentDidUpdate(prevProps) {
		if (prevProps.unit !== this.props.unit) {
			this.clearTimeout();
			this.setTimeout();
		}
	}
	componentWillUnmount() {
		this.clearTimeout();
		this.context.nowManager.removeResetListener(this.handleRefresh);
		document.removeEventListener("visibilitychange", this.handleVisibilityChange);
	}
	computeTiming() {
		let { props, context } = this;
		let unroundedNow = context.nowManager.getDateMarker();
		let { nowIndicatorSnap } = context.options;
		if (nowIndicatorSnap === "auto") nowIndicatorSnap = /year|month|week|day/.test(props.unit) || (props.unitValue || 1) === 1;
		let nowDate;
		let waitMs;
		if (nowIndicatorSnap) {
			nowDate = context.dateEnv.startOf(unroundedNow, props.unit);
			waitMs = context.dateEnv.add(nowDate, createDuration(1, props.unit)).valueOf() - unroundedNow.valueOf();
		} else {
			nowDate = unroundedNow;
			waitMs = 6e4;
		}
		waitMs = Math.min(864e5, waitMs);
		return {
			state: {
				nowDate,
				todayRange: buildDayRange(nowDate)
			},
			waitMs
		};
	}
	setTimeout(waitMs = this.computeTiming().waitMs) {
		this.timeoutId = setTimeout(() => {
			const timing = this.computeTiming();
			this.setState(timing.state, () => {
				this.setTimeout(timing.waitMs);
			});
		}, waitMs);
	}
	clearTimeout() {
		if (this.timeoutId) clearTimeout(this.timeoutId);
	}
};
NowTimer.contextType = ViewContextType;
function buildDayRange(date) {
	let start = startOfDay(date);
	return {
		start,
		end: addDays(start, 1)
	};
}
var CalendarImpl = class {
	getCurrentData() {
		return this.currentDataManager.getCurrentData();
	}
	dispatch(action) {
		this.currentDataManager.dispatch(action);
	}
	get view() {
		return this.getCurrentData().viewApi;
	}
	batchRendering(callback) {
		callback();
	}
	updateSize() {
		this.trigger("_resize", true);
	}
	setOption(name, val) {
		this.dispatch({
			type: "SET_OPTION",
			optionName: name,
			rawOptionValue: val
		});
	}
	getOption(name) {
		return this.currentDataManager.currentCalendarOptionsInput[name];
	}
	getAvailableLocaleCodes() {
		return Object.keys(this.getCurrentData().availableRawLocales);
	}
	on(handlerName, handler) {
		let { currentDataManager } = this;
		if (currentDataManager.currentCalendarOptionsRefiners[handlerName]) currentDataManager.emitter.on(handlerName, handler);
		else console.warn(`Unknown listener name '${handlerName}'`);
	}
	off(handlerName, handler) {
		this.currentDataManager.emitter.off(handlerName, handler);
	}
	trigger(handlerName, ...args) {
		this.currentDataManager.emitter.trigger(handlerName, ...args);
	}
	changeView(viewType, dateOrRange) {
		this.batchRendering(() => {
			this.unselect();
			if (dateOrRange) if (dateOrRange.start && dateOrRange.end) {
				this.dispatch({
					type: "CHANGE_VIEW_TYPE",
					viewType
				});
				this.dispatch({
					type: "SET_OPTION",
					optionName: "visibleRange",
					rawOptionValue: dateOrRange
				});
			} else {
				let { dateEnv } = this.getCurrentData();
				this.dispatch({
					type: "CHANGE_VIEW_TYPE",
					viewType,
					dateMarker: dateEnv.createMarker(dateOrRange)
				});
			}
			else this.dispatch({
				type: "CHANGE_VIEW_TYPE",
				viewType
			});
		});
	}
	zoomTo(dateMarker, viewType) {
		let state = this.getCurrentData();
		let spec;
		viewType = viewType || "day";
		spec = state.viewSpecs[viewType] || this.getUnitViewSpec(viewType);
		this.unselect();
		if (spec) this.dispatch({
			type: "CHANGE_VIEW_TYPE",
			viewType: spec.type,
			dateMarker
		});
		else this.dispatch({
			type: "CHANGE_DATE",
			dateMarker
		});
	}
	getUnitViewSpec(unit) {
		let { viewSpecs, toolbarConfig } = this.getCurrentData();
		let viewTypes = [].concat(toolbarConfig.header ? toolbarConfig.header.viewsWithButtons : [], toolbarConfig.footer ? toolbarConfig.footer.viewsWithButtons : []);
		let i;
		let spec;
		for (let viewType in viewSpecs) viewTypes.push(viewType);
		for (i = 0; i < viewTypes.length; i += 1) {
			spec = viewSpecs[viewTypes[i]];
			if (spec) {
				if (spec.singleUnit === unit) return spec;
			}
		}
		return null;
	}
	prev() {
		this.unselect();
		this.dispatch({ type: "PREV" });
	}
	next() {
		this.unselect();
		this.dispatch({ type: "NEXT" });
	}
	prevYear() {
		let state = this.getCurrentData();
		this.unselect();
		this.dispatch({
			type: "CHANGE_DATE",
			dateMarker: state.dateEnv.addYears(state.currentDate, -1)
		});
	}
	nextYear() {
		let state = this.getCurrentData();
		this.unselect();
		this.dispatch({
			type: "CHANGE_DATE",
			dateMarker: state.dateEnv.addYears(state.currentDate, 1)
		});
	}
	today() {
		let state = this.getCurrentData();
		this.unselect();
		this.dispatch({
			type: "CHANGE_DATE",
			dateMarker: state.nowManager.getDateMarker()
		});
	}
	gotoDate(zonedDateInput) {
		let state = this.getCurrentData();
		this.unselect();
		this.dispatch({
			type: "CHANGE_DATE",
			dateMarker: state.dateEnv.createMarker(zonedDateInput)
		});
	}
	incrementDate(deltaInput) {
		let state = this.getCurrentData();
		let delta = createDuration(deltaInput);
		if (delta) {
			this.unselect();
			this.dispatch({
				type: "CHANGE_DATE",
				dateMarker: state.dateEnv.add(state.currentDate, delta)
			});
		}
	}
	getDate() {
		let state = this.getCurrentData();
		return state.dateEnv.toDate(state.currentDate);
	}
	formatDate(d, formatter) {
		let { dateEnv } = this.getCurrentData();
		return dateEnv.format(dateEnv.createMarker(d), createFormatter(formatter));
	}
	formatRange(d0, d1, settings) {
		let { dateEnv } = this.getCurrentData();
		return dateEnv.formatRange(dateEnv.createMarker(d0), dateEnv.createMarker(d1), createFormatter(settings), settings);
	}
	formatIso(d, omitTime) {
		let { dateEnv } = this.getCurrentData();
		return dateEnv.formatIso(dateEnv.createMarker(d), { omitTime });
	}
	select(dateOrObj, endDate) {
		let selectionInput;
		if (endDate == null) if (dateOrObj.start != null) selectionInput = dateOrObj;
		else selectionInput = {
			start: dateOrObj,
			end: null
		};
		else selectionInput = {
			start: dateOrObj,
			end: endDate
		};
		let state = this.getCurrentData();
		let selection = parseDateSpan(selectionInput, state.dateEnv, createDuration({ days: 1 }));
		if (selection) {
			this.dispatch({
				type: "SELECT_DATES",
				selection
			});
			triggerDateSelect(selection, null, state);
		}
	}
	unselect(pev) {
		let state = this.getCurrentData();
		if (state.dateSelection) {
			this.dispatch({ type: "UNSELECT_DATES" });
			triggerDateUnselect(pev, state);
		}
	}
	addEvent(eventInput, sourceInput) {
		if (eventInput instanceof EventImpl) {
			let def = eventInput._def;
			let instance = eventInput._instance;
			if (!this.getCurrentData().eventStore.defs[def.defId]) {
				this.dispatch({
					type: "ADD_EVENTS",
					eventStore: eventTupleToStore({
						def,
						instance
					})
				});
				this.triggerEventAdd(eventInput);
			}
			return eventInput;
		}
		let state = this.getCurrentData();
		let eventSource;
		if (sourceInput instanceof EventSourceImpl) eventSource = sourceInput.internalEventSource;
		else if (typeof sourceInput === "boolean") {
			if (sourceInput) [eventSource] = hashValuesToArray(state.eventSources);
		} else if (sourceInput != null) {
			let sourceApi = this.getEventSourceById(sourceInput);
			if (!sourceApi) {
				console.warn(`Could not find an event source with ID "${sourceInput}"`);
				return null;
			}
			eventSource = sourceApi.internalEventSource;
		}
		let tuple = parseEvent(eventInput, eventSource, state, false);
		if (tuple) {
			let newEventApi = new EventImpl(state, tuple.def, tuple.def.recurringDef ? null : tuple.instance);
			this.dispatch({
				type: "ADD_EVENTS",
				eventStore: eventTupleToStore(tuple)
			});
			this.triggerEventAdd(newEventApi);
			return newEventApi;
		}
		return null;
	}
	triggerEventAdd(eventApi) {
		let { emitter } = this.getCurrentData();
		emitter.trigger("eventAdd", {
			event: eventApi,
			relatedEvents: [],
			revert: () => {
				this.dispatch({
					type: "REMOVE_EVENTS",
					eventStore: eventApiToStore(eventApi)
				});
			}
		});
	}
	getEventById(id) {
		let state = this.getCurrentData();
		let { defs, instances } = state.eventStore;
		id = String(id);
		for (let defId in defs) {
			let def = defs[defId];
			if (def.publicId === id) {
				if (def.recurringDef) return new EventImpl(state, def, null);
				for (let instanceId in instances) {
					let instance = instances[instanceId];
					if (instance.defId === def.defId) return new EventImpl(state, def, instance);
				}
			}
		}
		return null;
	}
	getEvents() {
		let currentData = this.getCurrentData();
		return buildEventApis(currentData.eventStore, currentData);
	}
	removeAllEvents() {
		this.dispatch({ type: "REMOVE_ALL_EVENTS" });
	}
	getEventSources() {
		let state = this.getCurrentData();
		let sourceHash = state.eventSources;
		let sourceApis = [];
		for (let internalId in sourceHash) sourceApis.push(new EventSourceImpl(state, sourceHash[internalId]));
		return sourceApis;
	}
	getEventSourceById(id) {
		let state = this.getCurrentData();
		let sourceHash = state.eventSources;
		id = String(id);
		for (let sourceId in sourceHash) if (sourceHash[sourceId].publicId === id) return new EventSourceImpl(state, sourceHash[sourceId]);
		return null;
	}
	addEventSource(sourceInput) {
		let state = this.getCurrentData();
		if (sourceInput instanceof EventSourceImpl) {
			if (!state.eventSources[sourceInput.internalEventSource.sourceId]) this.dispatch({
				type: "ADD_EVENT_SOURCES",
				sources: [sourceInput.internalEventSource]
			});
			return sourceInput;
		}
		let eventSource = parseEventSource(sourceInput, state);
		if (eventSource) {
			this.dispatch({
				type: "ADD_EVENT_SOURCES",
				sources: [eventSource]
			});
			return new EventSourceImpl(state, eventSource);
		}
		return null;
	}
	removeAllEventSources() {
		this.dispatch({ type: "REMOVE_ALL_EVENT_SOURCES" });
	}
	refetchEvents() {
		this.dispatch({
			type: "FETCH_EVENT_SOURCES",
			isRefetch: true
		});
	}
	scrollToTime(timeInput) {
		let time = createDuration(timeInput);
		if (time) this.trigger("_scrollRequest", { time });
	}
};
function pointInsideRect(point, rect) {
	return point.left >= rect.left && point.left < rect.right && point.top >= rect.top && point.top < rect.bottom;
}
function intersectRects(rect1, rect2) {
	let res = {
		left: Math.max(rect1.left, rect2.left),
		right: Math.min(rect1.right, rect2.right),
		top: Math.max(rect1.top, rect2.top),
		bottom: Math.min(rect1.bottom, rect2.bottom)
	};
	if (res.left < res.right && res.top < res.bottom) return res;
	return false;
}
function constrainPoint(point, rect) {
	return {
		left: Math.min(Math.max(point.left, rect.left), rect.right),
		top: Math.min(Math.max(point.top, rect.top), rect.bottom)
	};
}
function getRectCenter(rect) {
	return {
		left: (rect.left + rect.right) / 2,
		top: (rect.top + rect.bottom) / 2
	};
}
function diffPoints(point1, point2) {
	return {
		left: point1.left - point2.left,
		top: point1.top - point2.top
	};
}
function getDateMeta(date, todayRange, nowDate, dateProfile) {
	return {
		dow: date.getUTCDay(),
		isDisabled: Boolean(dateProfile && (!dateProfile.activeRange || !rangeContainsMarker(dateProfile.activeRange, date))),
		isOther: Boolean(dateProfile && !rangeContainsMarker(dateProfile.currentRange, date)),
		isToday: Boolean(todayRange && rangeContainsMarker(todayRange, date)),
		isPast: Boolean(nowDate ? date < nowDate : todayRange ? date < todayRange.start : false),
		isFuture: Boolean(nowDate ? date > nowDate : todayRange ? date >= todayRange.end : false)
	};
}
function getDayClassNames(meta, theme) {
	let classNames = ["fc-day", `fc-day-${DAY_IDS[meta.dow]}`];
	if (meta.isDisabled) classNames.push("fc-day-disabled");
	else {
		if (meta.isToday) {
			classNames.push("fc-day-today");
			classNames.push(theme.getClass("today"));
		}
		if (meta.isPast) classNames.push("fc-day-past");
		if (meta.isFuture) classNames.push("fc-day-future");
		if (meta.isOther) classNames.push("fc-day-other");
	}
	return classNames;
}
var DAY_FORMAT = createFormatter({
	year: "numeric",
	month: "long",
	day: "numeric"
});
var WEEK_FORMAT = createFormatter({ week: "long" });
function buildNavLinkAttrs(context, dateMarker, viewType = "day", isTabbable = true) {
	const { dateEnv, options, calendarApi } = context;
	let dateStr = dateEnv.format(dateMarker, viewType === "week" ? WEEK_FORMAT : DAY_FORMAT);
	if (options.navLinks) {
		let zonedDate = dateEnv.toDate(dateMarker);
		const handleInteraction = (ev) => {
			let customAction = viewType === "day" ? options.navLinkDayClick : viewType === "week" ? options.navLinkWeekClick : null;
			if (typeof customAction === "function") customAction.call(calendarApi, dateEnv.toDate(dateMarker), ev);
			else {
				if (typeof customAction === "string") viewType = customAction;
				calendarApi.zoomTo(dateMarker, viewType);
			}
		};
		return Object.assign({
			title: formatWithOrdinals(options.navLinkHint, [dateStr, zonedDate], dateStr),
			"data-navlink": ""
		}, isTabbable ? createAriaClickAttrs(handleInteraction) : { onClick: handleInteraction });
	}
	return { "aria-label": dateStr };
}
var _isRtlScrollbarOnLeft = null;
function getIsRtlScrollbarOnLeft() {
	if (_isRtlScrollbarOnLeft === null) _isRtlScrollbarOnLeft = computeIsRtlScrollbarOnLeft();
	return _isRtlScrollbarOnLeft;
}
function computeIsRtlScrollbarOnLeft() {
	let outerEl = document.createElement("div");
	applyStyle(outerEl, {
		position: "absolute",
		top: -1e3,
		left: 0,
		border: 0,
		padding: 0,
		overflow: "scroll",
		direction: "rtl"
	});
	outerEl.innerHTML = "<div></div>";
	document.body.appendChild(outerEl);
	let res = outerEl.firstChild.getBoundingClientRect().left > outerEl.getBoundingClientRect().left;
	removeElement(outerEl);
	return res;
}
var _scrollbarWidths;
function getScrollbarWidths() {
	if (!_scrollbarWidths) _scrollbarWidths = computeScrollbarWidths();
	return _scrollbarWidths;
}
function computeScrollbarWidths() {
	let el = document.createElement("div");
	el.style.overflow = "scroll";
	el.style.position = "absolute";
	el.style.top = "-9999px";
	el.style.left = "-9999px";
	document.body.appendChild(el);
	let res = computeScrollbarWidthsForEl(el);
	document.body.removeChild(el);
	return res;
}
function computeScrollbarWidthsForEl(el) {
	return {
		x: el.offsetHeight - el.clientHeight,
		y: el.offsetWidth - el.clientWidth
	};
}
function computeEdges(el, getPadding = false) {
	let computedStyle = window.getComputedStyle(el);
	let borderLeft = parseInt(computedStyle.borderLeftWidth, 10) || 0;
	let borderRight = parseInt(computedStyle.borderRightWidth, 10) || 0;
	let borderTop = parseInt(computedStyle.borderTopWidth, 10) || 0;
	let borderBottom = parseInt(computedStyle.borderBottomWidth, 10) || 0;
	let badScrollbarWidths = computeScrollbarWidthsForEl(el);
	let scrollbarLeftRight = badScrollbarWidths.y - borderLeft - borderRight;
	let res = {
		borderLeft,
		borderRight,
		borderTop,
		borderBottom,
		scrollbarBottom: badScrollbarWidths.x - borderTop - borderBottom,
		scrollbarLeft: 0,
		scrollbarRight: 0
	};
	if (getIsRtlScrollbarOnLeft() && computedStyle.direction === "rtl") res.scrollbarLeft = scrollbarLeftRight;
	else res.scrollbarRight = scrollbarLeftRight;
	if (getPadding) {
		res.paddingLeft = parseInt(computedStyle.paddingLeft, 10) || 0;
		res.paddingRight = parseInt(computedStyle.paddingRight, 10) || 0;
		res.paddingTop = parseInt(computedStyle.paddingTop, 10) || 0;
		res.paddingBottom = parseInt(computedStyle.paddingBottom, 10) || 0;
	}
	return res;
}
function computeInnerRect(el, goWithinPadding = false, doFromWindowViewport) {
	let outerRect = doFromWindowViewport ? el.getBoundingClientRect() : computeRect(el);
	let edges = computeEdges(el, goWithinPadding);
	let res = {
		left: outerRect.left + edges.borderLeft + edges.scrollbarLeft,
		right: outerRect.right - edges.borderRight - edges.scrollbarRight,
		top: outerRect.top + edges.borderTop,
		bottom: outerRect.bottom - edges.borderBottom - edges.scrollbarBottom
	};
	if (goWithinPadding) {
		res.left += edges.paddingLeft;
		res.right -= edges.paddingRight;
		res.top += edges.paddingTop;
		res.bottom -= edges.paddingBottom;
	}
	return res;
}
function computeRect(el) {
	let rect = el.getBoundingClientRect();
	return {
		left: rect.left + window.scrollX,
		top: rect.top + window.scrollY,
		right: rect.right + window.scrollX,
		bottom: rect.bottom + window.scrollY
	};
}
function computeClippedClientRect(el) {
	let clippingParents = getClippingParents(el);
	let rect = el.getBoundingClientRect();
	for (let clippingParent of clippingParents) {
		let intersection = intersectRects(rect, clippingParent.getBoundingClientRect());
		if (intersection) rect = intersection;
		else return null;
	}
	return rect;
}
function getClippingParents(el) {
	let parents = [];
	while (el instanceof HTMLElement) {
		let computedStyle = window.getComputedStyle(el);
		if (computedStyle.position === "fixed") break;
		if (/(auto|scroll)/.test(computedStyle.overflow + computedStyle.overflowY + computedStyle.overflowX)) parents.push(el);
		el = el.parentNode;
	}
	return parents;
}
var PositionCache = class {
	constructor(originEl, els, isHorizontal, isVertical) {
		this.els = els;
		let originClientRect = this.originClientRect = originEl.getBoundingClientRect();
		if (isHorizontal) this.buildElHorizontals(originClientRect.left);
		if (isVertical) this.buildElVerticals(originClientRect.top);
	}
	buildElHorizontals(originClientLeft) {
		let lefts = [];
		let rights = [];
		for (let el of this.els) {
			let rect = el.getBoundingClientRect();
			lefts.push(rect.left - originClientLeft);
			rights.push(rect.right - originClientLeft);
		}
		this.lefts = lefts;
		this.rights = rights;
	}
	buildElVerticals(originClientTop) {
		let tops = [];
		let bottoms = [];
		for (let el of this.els) {
			let rect = el.getBoundingClientRect();
			tops.push(rect.top - originClientTop);
			bottoms.push(rect.bottom - originClientTop);
		}
		this.tops = tops;
		this.bottoms = bottoms;
	}
	leftToIndex(leftPosition) {
		let { lefts, rights } = this;
		let len = lefts.length;
		let i;
		for (i = 0; i < len; i += 1) if (leftPosition >= lefts[i] && leftPosition < rights[i]) return i;
	}
	topToIndex(topPosition) {
		let { tops, bottoms } = this;
		let len = tops.length;
		let i;
		for (i = 0; i < len; i += 1) if (topPosition >= tops[i] && topPosition < bottoms[i]) return i;
	}
	getWidth(leftIndex) {
		return this.rights[leftIndex] - this.lefts[leftIndex];
	}
	getHeight(topIndex) {
		return this.bottoms[topIndex] - this.tops[topIndex];
	}
	similarTo(otherCache) {
		return similarNumArrays(this.tops || [], otherCache.tops || []) && similarNumArrays(this.bottoms || [], otherCache.bottoms || []) && similarNumArrays(this.lefts || [], otherCache.lefts || []) && similarNumArrays(this.rights || [], otherCache.rights || []);
	}
};
function similarNumArrays(a, b) {
	const len = a.length;
	if (len !== b.length) return false;
	for (let i = 0; i < len; i++) if (Math.round(a[i]) !== Math.round(b[i])) return false;
	return true;
}
var ScrollController = class {
	getMaxScrollTop() {
		return this.getScrollHeight() - this.getClientHeight();
	}
	getMaxScrollLeft() {
		return this.getScrollWidth() - this.getClientWidth();
	}
	canScrollVertically() {
		return this.getMaxScrollTop() > 0;
	}
	canScrollHorizontally() {
		return this.getMaxScrollLeft() > 0;
	}
	canScrollUp() {
		return this.getScrollTop() > 0;
	}
	canScrollDown() {
		return this.getScrollTop() < this.getMaxScrollTop();
	}
	canScrollLeft() {
		return this.getScrollLeft() > 0;
	}
	canScrollRight() {
		return this.getScrollLeft() < this.getMaxScrollLeft();
	}
};
var ElementScrollController = class extends ScrollController {
	constructor(el) {
		super();
		this.el = el;
	}
	getScrollTop() {
		return this.el.scrollTop;
	}
	getScrollLeft() {
		return this.el.scrollLeft;
	}
	setScrollTop(top) {
		this.el.scrollTop = top;
	}
	setScrollLeft(left) {
		this.el.scrollLeft = left;
	}
	getScrollWidth() {
		return this.el.scrollWidth;
	}
	getScrollHeight() {
		return this.el.scrollHeight;
	}
	getClientHeight() {
		return this.el.clientHeight;
	}
	getClientWidth() {
		return this.el.clientWidth;
	}
};
var WindowScrollController = class extends ScrollController {
	getScrollTop() {
		return window.scrollY;
	}
	getScrollLeft() {
		return window.scrollX;
	}
	setScrollTop(n) {
		window.scroll(window.scrollX, n);
	}
	setScrollLeft(n) {
		window.scroll(n, window.scrollY);
	}
	getScrollWidth() {
		return document.documentElement.scrollWidth;
	}
	getScrollHeight() {
		return document.documentElement.scrollHeight;
	}
	getClientHeight() {
		return document.documentElement.clientHeight;
	}
	getClientWidth() {
		return document.documentElement.clientWidth;
	}
};
var DateComponent = class extends BaseComponent {
	constructor() {
		super(...arguments);
		this.uid = guid();
	}
	prepareHits() {}
	queryHit(positionLeft, positionTop, elWidth, elHeight) {
		return null;
	}
	isValidSegDownEl(el) {
		return !this.props.eventDrag && !this.props.eventResize && !elementClosest(el, ".fc-event-mirror");
	}
	isValidDateDownEl(el) {
		return !elementClosest(el, ".fc-event:not(.fc-bg-event)") && !elementClosest(el, ".fc-more-link") && !elementClosest(el, "a[data-navlink]") && !elementClosest(el, ".fc-popover");
	}
};
var SegHierarchy = class {
	constructor(getEntryThickness = (entry) => {
		return entry.thickness || 1;
	}) {
		this.getEntryThickness = getEntryThickness;
		this.strictOrder = false;
		this.allowReslicing = false;
		this.maxCoord = -1;
		this.maxStackCnt = -1;
		this.levelCoords = [];
		this.entriesByLevel = [];
		this.stackCnts = {};
	}
	addSegs(inputs) {
		let hiddenEntries = [];
		for (let input of inputs) this.insertEntry(input, hiddenEntries);
		return hiddenEntries;
	}
	insertEntry(entry, hiddenEntries) {
		let insertion = this.findInsertion(entry);
		if (this.isInsertionValid(insertion, entry)) this.insertEntryAt(entry, insertion);
		else this.handleInvalidInsertion(insertion, entry, hiddenEntries);
	}
	isInsertionValid(insertion, entry) {
		return (this.maxCoord === -1 || insertion.levelCoord + this.getEntryThickness(entry) <= this.maxCoord) && (this.maxStackCnt === -1 || insertion.stackCnt < this.maxStackCnt);
	}
	handleInvalidInsertion(insertion, entry, hiddenEntries) {
		if (this.allowReslicing && insertion.touchingEntry) {
			const hiddenEntry = Object.assign(Object.assign({}, entry), { span: intersectSpans(entry.span, insertion.touchingEntry.span) });
			hiddenEntries.push(hiddenEntry);
			this.splitEntry(entry, insertion.touchingEntry, hiddenEntries);
		} else hiddenEntries.push(entry);
	}
	splitEntry(entry, barrier, hiddenEntries) {
		let entrySpan = entry.span;
		let barrierSpan = barrier.span;
		if (entrySpan.start < barrierSpan.start) this.insertEntry({
			index: entry.index,
			thickness: entry.thickness,
			span: {
				start: entrySpan.start,
				end: barrierSpan.start
			}
		}, hiddenEntries);
		if (entrySpan.end > barrierSpan.end) this.insertEntry({
			index: entry.index,
			thickness: entry.thickness,
			span: {
				start: barrierSpan.end,
				end: entrySpan.end
			}
		}, hiddenEntries);
	}
	insertEntryAt(entry, insertion) {
		let { entriesByLevel, levelCoords } = this;
		if (insertion.lateral === -1) {
			insertAt(levelCoords, insertion.level, insertion.levelCoord);
			insertAt(entriesByLevel, insertion.level, [entry]);
		} else insertAt(entriesByLevel[insertion.level], insertion.lateral, entry);
		this.stackCnts[buildEntryKey(entry)] = insertion.stackCnt;
	}
	findInsertion(newEntry) {
		let { levelCoords, entriesByLevel, strictOrder, stackCnts } = this;
		let levelCnt = levelCoords.length;
		let candidateCoord = 0;
		let touchingLevel = -1;
		let touchingLateral = -1;
		let touchingEntry = null;
		let stackCnt = 0;
		for (let trackingLevel = 0; trackingLevel < levelCnt; trackingLevel += 1) {
			const trackingCoord = levelCoords[trackingLevel];
			if (!strictOrder && trackingCoord >= candidateCoord + this.getEntryThickness(newEntry)) break;
			let trackingEntries = entriesByLevel[trackingLevel];
			let trackingEntry;
			let searchRes = binarySearch(trackingEntries, newEntry.span.start, getEntrySpanEnd);
			let lateralIndex = searchRes[0] + searchRes[1];
			while ((trackingEntry = trackingEntries[lateralIndex]) && trackingEntry.span.start < newEntry.span.end) {
				let trackingEntryBottom = trackingCoord + this.getEntryThickness(trackingEntry);
				if (trackingEntryBottom > candidateCoord) {
					candidateCoord = trackingEntryBottom;
					touchingEntry = trackingEntry;
					touchingLevel = trackingLevel;
					touchingLateral = lateralIndex;
				}
				if (trackingEntryBottom === candidateCoord) stackCnt = Math.max(stackCnt, stackCnts[buildEntryKey(trackingEntry)] + 1);
				lateralIndex += 1;
			}
		}
		let destLevel = 0;
		if (touchingEntry) {
			destLevel = touchingLevel + 1;
			while (destLevel < levelCnt && levelCoords[destLevel] < candidateCoord) destLevel += 1;
		}
		let destLateral = -1;
		if (destLevel < levelCnt && levelCoords[destLevel] === candidateCoord) destLateral = binarySearch(entriesByLevel[destLevel], newEntry.span.end, getEntrySpanEnd)[0];
		return {
			touchingLevel,
			touchingLateral,
			touchingEntry,
			stackCnt,
			levelCoord: candidateCoord,
			level: destLevel,
			lateral: destLateral
		};
	}
	toRects() {
		let { entriesByLevel, levelCoords } = this;
		let levelCnt = entriesByLevel.length;
		let rects = [];
		for (let level = 0; level < levelCnt; level += 1) {
			let entries = entriesByLevel[level];
			let levelCoord = levelCoords[level];
			for (let entry of entries) rects.push(Object.assign(Object.assign({}, entry), {
				thickness: this.getEntryThickness(entry),
				levelCoord
			}));
		}
		return rects;
	}
};
function getEntrySpanEnd(entry) {
	return entry.span.end;
}
function buildEntryKey(entry) {
	return entry.index + ":" + entry.span.start;
}
function intersectSpans(span0, span1) {
	let start = Math.max(span0.start, span1.start);
	let end = Math.min(span0.end, span1.end);
	if (start < end) return {
		start,
		end
	};
	return null;
}
function insertAt(arr, index, item) {
	arr.splice(index, 0, item);
}
function binarySearch(a, searchVal, getItemVal) {
	let startIndex = 0;
	let endIndex = a.length;
	if (!endIndex || searchVal < getItemVal(a[startIndex])) return [0, 0];
	if (searchVal > getItemVal(a[endIndex - 1])) return [endIndex, 0];
	while (startIndex < endIndex) {
		let middleIndex = Math.floor(startIndex + (endIndex - startIndex) / 2);
		let middleVal = getItemVal(a[middleIndex]);
		if (searchVal < middleVal) endIndex = middleIndex;
		else if (searchVal > middleVal) startIndex = middleIndex + 1;
		else return [middleIndex, 1];
	}
	return [startIndex, 0];
}
var ElementDragging = class {
	constructor(el, selector) {
		this.emitter = new Emitter();
	}
	destroy() {}
	setMirrorIsVisible(bool) {}
	setMirrorNeedsRevert(bool) {}
	setAutoScrollEnabled(bool) {}
};
var config = {};
function computeFallbackHeaderFormat(datesRepDistinctDays, dayCnt) {
	if (!datesRepDistinctDays || dayCnt > 10) return createFormatter({ weekday: "short" });
	if (dayCnt > 1) return createFormatter({
		weekday: "short",
		month: "numeric",
		day: "numeric",
		omitCommas: true
	});
	return createFormatter({ weekday: "long" });
}
var CLASS_NAME = "fc-col-header-cell";
function renderInner$1(renderProps) {
	return renderProps.text;
}
var TableDateCell = class extends BaseComponent {
	render() {
		let { dateEnv, options, theme, viewApi } = this.context;
		let { props } = this;
		let { date, dateProfile } = props;
		let dayMeta = getDateMeta(date, props.todayRange, null, dateProfile);
		let classNames = [CLASS_NAME].concat(getDayClassNames(dayMeta, theme));
		let text = dateEnv.format(date, props.dayHeaderFormat);
		let navLinkAttrs = !dayMeta.isDisabled && props.colCnt > 1 ? buildNavLinkAttrs(this.context, date) : {};
		let publicDate = dateEnv.toDate(date);
		if (dateEnv.namedTimeZoneImpl) publicDate = addMs(publicDate, 36e5);
		let renderProps = Object.assign(Object.assign(Object.assign({
			date: publicDate,
			view: viewApi
		}, props.extraRenderProps), { text }), dayMeta);
		return y(ContentContainer, {
			elTag: "th",
			elClasses: classNames,
			elAttrs: Object.assign({
				role: "columnheader",
				colSpan: props.colSpan,
				"data-date": !dayMeta.isDisabled ? formatDayString(date) : void 0
			}, props.extraDataAttrs),
			renderProps,
			generatorName: "dayHeaderContent",
			customGenerator: options.dayHeaderContent,
			defaultGenerator: renderInner$1,
			classNameGenerator: options.dayHeaderClassNames,
			didMount: options.dayHeaderDidMount,
			willUnmount: options.dayHeaderWillUnmount
		}, (InnerContainer) => y("div", { className: "fc-scrollgrid-sync-inner" }, !dayMeta.isDisabled && y(InnerContainer, {
			elTag: "a",
			elAttrs: navLinkAttrs,
			elClasses: ["fc-col-header-cell-cushion", props.isSticky && "fc-sticky"]
		})));
	}
};
var WEEKDAY_FORMAT = createFormatter({ weekday: "long" });
var TableDowCell = class extends BaseComponent {
	render() {
		let { props } = this;
		let { dateEnv, theme, viewApi, options } = this.context;
		let date = addDays(/* @__PURE__ */ new Date(2592e5), props.dow);
		let dateMeta = {
			dow: props.dow,
			isDisabled: false,
			isFuture: false,
			isPast: false,
			isToday: false,
			isOther: false
		};
		let text = dateEnv.format(date, props.dayHeaderFormat);
		let renderProps = Object.assign(Object.assign(Object.assign(Object.assign({ date }, dateMeta), { view: viewApi }), props.extraRenderProps), { text });
		return y(ContentContainer, {
			elTag: "th",
			elClasses: [
				CLASS_NAME,
				...getDayClassNames(dateMeta, theme),
				...props.extraClassNames || []
			],
			elAttrs: Object.assign({
				role: "columnheader",
				colSpan: props.colSpan
			}, props.extraDataAttrs),
			renderProps,
			generatorName: "dayHeaderContent",
			customGenerator: options.dayHeaderContent,
			defaultGenerator: renderInner$1,
			classNameGenerator: options.dayHeaderClassNames,
			didMount: options.dayHeaderDidMount,
			willUnmount: options.dayHeaderWillUnmount
		}, (InnerContent) => y("div", { className: "fc-scrollgrid-sync-inner" }, y(InnerContent, {
			elTag: "a",
			elClasses: ["fc-col-header-cell-cushion", props.isSticky && "fc-sticky"],
			elAttrs: { "aria-label": dateEnv.format(date, WEEKDAY_FORMAT) }
		})));
	}
};
var DayHeader = class extends BaseComponent {
	constructor() {
		super(...arguments);
		this.createDayHeaderFormatter = memoize(createDayHeaderFormatter);
	}
	render() {
		let { context } = this;
		let { dates, dateProfile, datesRepDistinctDays, renderIntro } = this.props;
		let dayHeaderFormat = this.createDayHeaderFormatter(context.options.dayHeaderFormat, datesRepDistinctDays, dates.length);
		return y(NowTimer, { unit: "day" }, (nowDate, todayRange) => y("tr", { role: "row" }, renderIntro && renderIntro("day"), dates.map((date) => datesRepDistinctDays ? y(TableDateCell, {
			key: date.toISOString(),
			date,
			dateProfile,
			todayRange,
			colCnt: dates.length,
			dayHeaderFormat
		}) : y(TableDowCell, {
			key: date.getUTCDay(),
			dow: date.getUTCDay(),
			dayHeaderFormat
		}))));
	}
};
function createDayHeaderFormatter(explicitFormat, datesRepDistinctDays, dateCnt) {
	return explicitFormat || computeFallbackHeaderFormat(datesRepDistinctDays, dateCnt);
}
var DaySeriesModel = class {
	constructor(range, dateProfileGenerator) {
		let date = range.start;
		let { end } = range;
		let indices = [];
		let dates = [];
		let dayIndex = -1;
		while (date < end) {
			if (dateProfileGenerator.isHiddenDay(date)) indices.push(dayIndex + .5);
			else {
				dayIndex += 1;
				indices.push(dayIndex);
				dates.push(date);
			}
			date = addDays(date, 1);
		}
		this.dates = dates;
		this.indices = indices;
		this.cnt = dates.length;
	}
	sliceRange(range) {
		let firstIndex = this.getDateDayIndex(range.start);
		let lastIndex = this.getDateDayIndex(addDays(range.end, -1));
		let clippedFirstIndex = Math.max(0, firstIndex);
		let clippedLastIndex = Math.min(this.cnt - 1, lastIndex);
		clippedFirstIndex = Math.ceil(clippedFirstIndex);
		clippedLastIndex = Math.floor(clippedLastIndex);
		if (clippedFirstIndex <= clippedLastIndex) return {
			firstIndex: clippedFirstIndex,
			lastIndex: clippedLastIndex,
			isStart: firstIndex === clippedFirstIndex,
			isEnd: lastIndex === clippedLastIndex
		};
		return null;
	}
	getDateDayIndex(date) {
		let { indices } = this;
		let dayOffset = Math.floor(diffDays(this.dates[0], date));
		if (dayOffset < 0) return indices[0] - 1;
		if (dayOffset >= indices.length) return indices[indices.length - 1] + 1;
		return indices[dayOffset];
	}
};
var DayTableModel = class {
	constructor(daySeries, breakOnWeeks) {
		let { dates } = daySeries;
		let daysPerRow;
		let firstDay;
		let rowCnt;
		if (breakOnWeeks) {
			firstDay = dates[0].getUTCDay();
			for (daysPerRow = 1; daysPerRow < dates.length; daysPerRow += 1) if (dates[daysPerRow].getUTCDay() === firstDay) break;
			rowCnt = Math.ceil(dates.length / daysPerRow);
		} else {
			rowCnt = 1;
			daysPerRow = dates.length;
		}
		this.rowCnt = rowCnt;
		this.colCnt = daysPerRow;
		this.daySeries = daySeries;
		this.cells = this.buildCells();
		this.headerDates = this.buildHeaderDates();
	}
	buildCells() {
		let rows = [];
		for (let row = 0; row < this.rowCnt; row += 1) {
			let cells = [];
			for (let col = 0; col < this.colCnt; col += 1) cells.push(this.buildCell(row, col));
			rows.push(cells);
		}
		return rows;
	}
	buildCell(row, col) {
		let date = this.daySeries.dates[row * this.colCnt + col];
		return {
			key: date.toISOString(),
			date
		};
	}
	buildHeaderDates() {
		let dates = [];
		for (let col = 0; col < this.colCnt; col += 1) dates.push(this.cells[0][col].date);
		return dates;
	}
	sliceRange(range) {
		let { colCnt } = this;
		let seriesSeg = this.daySeries.sliceRange(range);
		let segs = [];
		if (seriesSeg) {
			let { firstIndex, lastIndex } = seriesSeg;
			let index = firstIndex;
			while (index <= lastIndex) {
				let row = Math.floor(index / colCnt);
				let nextIndex = Math.min((row + 1) * colCnt, lastIndex + 1);
				segs.push({
					row,
					firstCol: index % colCnt,
					lastCol: (nextIndex - 1) % colCnt,
					isStart: seriesSeg.isStart && index === firstIndex,
					isEnd: seriesSeg.isEnd && nextIndex - 1 === lastIndex
				});
				index = nextIndex;
			}
		}
		return segs;
	}
};
var Slicer = class {
	constructor() {
		this.sliceBusinessHours = memoize(this._sliceBusinessHours);
		this.sliceDateSelection = memoize(this._sliceDateSpan);
		this.sliceEventStore = memoize(this._sliceEventStore);
		this.sliceEventDrag = memoize(this._sliceInteraction);
		this.sliceEventResize = memoize(this._sliceInteraction);
		this.forceDayIfListItem = false;
	}
	sliceProps(props, dateProfile, nextDayThreshold, context, ...extraArgs) {
		let { eventUiBases } = props;
		let eventSegs = this.sliceEventStore(props.eventStore, eventUiBases, dateProfile, nextDayThreshold, ...extraArgs);
		return {
			dateSelectionSegs: this.sliceDateSelection(props.dateSelection, dateProfile, nextDayThreshold, eventUiBases, context, ...extraArgs),
			businessHourSegs: this.sliceBusinessHours(props.businessHours, dateProfile, nextDayThreshold, context, ...extraArgs),
			fgEventSegs: eventSegs.fg,
			bgEventSegs: eventSegs.bg,
			eventDrag: this.sliceEventDrag(props.eventDrag, eventUiBases, dateProfile, nextDayThreshold, ...extraArgs),
			eventResize: this.sliceEventResize(props.eventResize, eventUiBases, dateProfile, nextDayThreshold, ...extraArgs),
			eventSelection: props.eventSelection
		};
	}
	sliceNowDate(date, dateProfile, nextDayThreshold, context, ...extraArgs) {
		return this._sliceDateSpan({
			range: {
				start: date,
				end: addMs(date, 1)
			},
			allDay: false
		}, dateProfile, nextDayThreshold, {}, context, ...extraArgs);
	}
	_sliceBusinessHours(businessHours, dateProfile, nextDayThreshold, context, ...extraArgs) {
		if (!businessHours) return [];
		return this._sliceEventStore(expandRecurring(businessHours, computeActiveRange(dateProfile, Boolean(nextDayThreshold)), context), {}, dateProfile, nextDayThreshold, ...extraArgs).bg;
	}
	_sliceEventStore(eventStore, eventUiBases, dateProfile, nextDayThreshold, ...extraArgs) {
		if (eventStore) {
			let rangeRes = sliceEventStore(eventStore, eventUiBases, computeActiveRange(dateProfile, Boolean(nextDayThreshold)), nextDayThreshold);
			return {
				bg: this.sliceEventRanges(rangeRes.bg, extraArgs),
				fg: this.sliceEventRanges(rangeRes.fg, extraArgs)
			};
		}
		return {
			bg: [],
			fg: []
		};
	}
	_sliceInteraction(interaction, eventUiBases, dateProfile, nextDayThreshold, ...extraArgs) {
		if (!interaction) return null;
		let rangeRes = sliceEventStore(interaction.mutatedEvents, eventUiBases, computeActiveRange(dateProfile, Boolean(nextDayThreshold)), nextDayThreshold);
		return {
			segs: this.sliceEventRanges(rangeRes.fg, extraArgs),
			affectedInstances: interaction.affectedEvents.instances,
			isEvent: interaction.isEvent
		};
	}
	_sliceDateSpan(dateSpan, dateProfile, nextDayThreshold, eventUiBases, context, ...extraArgs) {
		if (!dateSpan) return [];
		let activeRange = computeActiveRange(dateProfile, Boolean(nextDayThreshold));
		let activeDateSpanRange = intersectRanges(dateSpan.range, activeRange);
		if (activeDateSpanRange) {
			dateSpan = Object.assign(Object.assign({}, dateSpan), { range: activeDateSpanRange });
			let eventRange = fabricateEventRange(dateSpan, eventUiBases, context);
			let segs = this.sliceRange(dateSpan.range, ...extraArgs);
			for (let seg of segs) seg.eventRange = eventRange;
			return segs;
		}
		return [];
	}
	sliceEventRanges(eventRanges, extraArgs) {
		let segs = [];
		for (let eventRange of eventRanges) segs.push(...this.sliceEventRange(eventRange, extraArgs));
		return segs;
	}
	sliceEventRange(eventRange, extraArgs) {
		let dateRange = eventRange.range;
		if (this.forceDayIfListItem && eventRange.ui.display === "list-item") dateRange = {
			start: dateRange.start,
			end: addDays(dateRange.start, 1)
		};
		let segs = this.sliceRange(dateRange, ...extraArgs);
		for (let seg of segs) {
			seg.eventRange = eventRange;
			seg.isStart = eventRange.isStart && seg.isStart;
			seg.isEnd = eventRange.isEnd && seg.isEnd;
		}
		return segs;
	}
};
function computeActiveRange(dateProfile, isComponentAllDay) {
	let range = dateProfile.activeRange;
	if (isComponentAllDay) return range;
	return {
		start: addMs(range.start, dateProfile.slotMinTime.milliseconds),
		end: addMs(range.end, dateProfile.slotMaxTime.milliseconds - 864e5)
	};
}
function isInteractionValid(interaction, dateProfile, context) {
	let { instances } = interaction.mutatedEvents;
	for (let instanceId in instances) if (!rangeContainsRange(dateProfile.validRange, instances[instanceId].range)) return false;
	return isNewPropsValid({ eventDrag: interaction }, context);
}
function isDateSelectionValid(dateSelection, dateProfile, context) {
	if (!rangeContainsRange(dateProfile.validRange, dateSelection.range)) return false;
	return isNewPropsValid({ dateSelection }, context);
}
function isNewPropsValid(newProps, context) {
	let calendarState = context.getCurrentData();
	let props = Object.assign({
		businessHours: calendarState.businessHours,
		dateSelection: "",
		eventStore: calendarState.eventStore,
		eventUiBases: calendarState.eventUiBases,
		eventSelection: "",
		eventDrag: null,
		eventResize: null
	}, newProps);
	return (context.pluginHooks.isPropsValid || isPropsValid)(props, context);
}
function isPropsValid(state, context, dateSpanMeta = {}, filterConfig) {
	if (state.eventDrag && !isInteractionPropsValid(state, context, dateSpanMeta, filterConfig)) return false;
	if (state.dateSelection && !isDateSelectionPropsValid(state, context, dateSpanMeta, filterConfig)) return false;
	return true;
}
function isInteractionPropsValid(state, context, dateSpanMeta, filterConfig) {
	let currentState = context.getCurrentData();
	let interaction = state.eventDrag;
	let subjectEventStore = interaction.mutatedEvents;
	let subjectDefs = subjectEventStore.defs;
	let subjectInstances = subjectEventStore.instances;
	let subjectConfigs = compileEventUis(subjectDefs, interaction.isEvent ? state.eventUiBases : { "": currentState.selectionConfig });
	if (filterConfig) subjectConfigs = mapHash(subjectConfigs, filterConfig);
	let otherEventStore = excludeInstances(state.eventStore, interaction.affectedEvents.instances);
	let otherDefs = otherEventStore.defs;
	let otherInstances = otherEventStore.instances;
	let otherConfigs = compileEventUis(otherDefs, state.eventUiBases);
	for (let subjectInstanceId in subjectInstances) {
		let subjectInstance = subjectInstances[subjectInstanceId];
		let subjectRange = subjectInstance.range;
		let subjectConfig = subjectConfigs[subjectInstance.defId];
		let subjectDef = subjectDefs[subjectInstance.defId];
		if (!allConstraintsPass(subjectConfig.constraints, subjectRange, otherEventStore, state.businessHours, context)) return false;
		let { eventOverlap } = context.options;
		let eventOverlapFunc = typeof eventOverlap === "function" ? eventOverlap : null;
		for (let otherInstanceId in otherInstances) {
			let otherInstance = otherInstances[otherInstanceId];
			if (rangesIntersect(subjectRange, otherInstance.range)) {
				if (otherConfigs[otherInstance.defId].overlap === false && interaction.isEvent) return false;
				if (subjectConfig.overlap === false) return false;
				if (eventOverlapFunc && !eventOverlapFunc(new EventImpl(context, otherDefs[otherInstance.defId], otherInstance), new EventImpl(context, subjectDef, subjectInstance))) return false;
			}
		}
		let calendarEventStore = currentState.eventStore;
		for (let subjectAllow of subjectConfig.allows) {
			let subjectDateSpan = Object.assign(Object.assign({}, dateSpanMeta), {
				range: subjectInstance.range,
				allDay: subjectDef.allDay
			});
			let origDef = calendarEventStore.defs[subjectDef.defId];
			let origInstance = calendarEventStore.instances[subjectInstanceId];
			let eventApi;
			if (origDef) eventApi = new EventImpl(context, origDef, origInstance);
			else eventApi = new EventImpl(context, subjectDef);
			if (!subjectAllow(buildDateSpanApiWithContext(subjectDateSpan, context), eventApi)) return false;
		}
	}
	return true;
}
function isDateSelectionPropsValid(state, context, dateSpanMeta, filterConfig) {
	let relevantEventStore = state.eventStore;
	let relevantDefs = relevantEventStore.defs;
	let relevantInstances = relevantEventStore.instances;
	let selection = state.dateSelection;
	let selectionRange = selection.range;
	let { selectionConfig } = context.getCurrentData();
	if (filterConfig) selectionConfig = filterConfig(selectionConfig);
	if (!allConstraintsPass(selectionConfig.constraints, selectionRange, relevantEventStore, state.businessHours, context)) return false;
	let { selectOverlap } = context.options;
	let selectOverlapFunc = typeof selectOverlap === "function" ? selectOverlap : null;
	for (let relevantInstanceId in relevantInstances) {
		let relevantInstance = relevantInstances[relevantInstanceId];
		if (rangesIntersect(selectionRange, relevantInstance.range)) {
			if (selectionConfig.overlap === false) return false;
			if (selectOverlapFunc && !selectOverlapFunc(new EventImpl(context, relevantDefs[relevantInstance.defId], relevantInstance), null)) return false;
		}
	}
	for (let selectionAllow of selectionConfig.allows) if (!selectionAllow(buildDateSpanApiWithContext(Object.assign(Object.assign({}, dateSpanMeta), selection), context), null)) return false;
	return true;
}
function allConstraintsPass(constraints, subjectRange, otherEventStore, businessHoursUnexpanded, context) {
	for (let constraint of constraints) if (!anyRangesContainRange(constraintToRanges(constraint, subjectRange, otherEventStore, businessHoursUnexpanded, context), subjectRange)) return false;
	return true;
}
function constraintToRanges(constraint, subjectRange, otherEventStore, businessHoursUnexpanded, context) {
	if (constraint === "businessHours") return eventStoreToRanges(expandRecurring(businessHoursUnexpanded, subjectRange, context));
	if (typeof constraint === "string") return eventStoreToRanges(filterEventStoreDefs(otherEventStore, (eventDef) => eventDef.groupId === constraint));
	if (typeof constraint === "object" && constraint) return eventStoreToRanges(expandRecurring(constraint, subjectRange, context));
	return [];
}
function eventStoreToRanges(eventStore) {
	let { instances } = eventStore;
	let ranges = [];
	for (let instanceId in instances) ranges.push(instances[instanceId].range);
	return ranges;
}
function anyRangesContainRange(outerRanges, innerRange) {
	for (let outerRange of outerRanges) if (rangeContainsRange(outerRange, innerRange)) return true;
	return false;
}
var VISIBLE_HIDDEN_RE = /^(visible|hidden)$/;
var Scroller = class extends BaseComponent {
	constructor() {
		super(...arguments);
		this.handleEl = (el) => {
			this.el = el;
			setRef(this.props.elRef, el);
		};
	}
	render() {
		let { props } = this;
		let { liquid, liquidIsAbsolute } = props;
		let isAbsolute = liquid && liquidIsAbsolute;
		let className = ["fc-scroller"];
		if (liquid) if (liquidIsAbsolute) className.push("fc-scroller-liquid-absolute");
		else className.push("fc-scroller-liquid");
		return y("div", {
			ref: this.handleEl,
			className: className.join(" "),
			style: {
				overflowX: props.overflowX,
				overflowY: props.overflowY,
				left: isAbsolute && -(props.overcomeLeft || 0) || "",
				right: isAbsolute && -(props.overcomeRight || 0) || "",
				bottom: isAbsolute && -(props.overcomeBottom || 0) || "",
				marginLeft: !isAbsolute && -(props.overcomeLeft || 0) || "",
				marginRight: !isAbsolute && -(props.overcomeRight || 0) || "",
				marginBottom: !isAbsolute && -(props.overcomeBottom || 0) || "",
				maxHeight: props.maxHeight || ""
			}
		}, props.children);
	}
	needsXScrolling() {
		if (VISIBLE_HIDDEN_RE.test(this.props.overflowX)) return false;
		let { el } = this;
		let realClientWidth = this.el.getBoundingClientRect().width - this.getYScrollbarWidth();
		let { children } = el;
		for (let i = 0; i < children.length; i += 1) if (children[i].getBoundingClientRect().width > realClientWidth) return true;
		return false;
	}
	needsYScrolling() {
		if (VISIBLE_HIDDEN_RE.test(this.props.overflowY)) return false;
		let { el } = this;
		let realClientHeight = this.el.getBoundingClientRect().height - this.getXScrollbarWidth();
		let { children } = el;
		for (let i = 0; i < children.length; i += 1) if (children[i].getBoundingClientRect().height > realClientHeight) return true;
		return false;
	}
	getXScrollbarWidth() {
		if (VISIBLE_HIDDEN_RE.test(this.props.overflowX)) return 0;
		return this.el.offsetHeight - this.el.clientHeight;
	}
	getYScrollbarWidth() {
		if (VISIBLE_HIDDEN_RE.test(this.props.overflowY)) return 0;
		return this.el.offsetWidth - this.el.clientWidth;
	}
};
var RefMap = class {
	constructor(masterCallback) {
		this.masterCallback = masterCallback;
		this.currentMap = {};
		this.depths = {};
		this.callbackMap = {};
		this.handleValue = (val, key) => {
			let { depths, currentMap } = this;
			let removed = false;
			let added = false;
			if (val !== null) {
				removed = key in currentMap;
				currentMap[key] = val;
				depths[key] = (depths[key] || 0) + 1;
				added = true;
			} else {
				depths[key] -= 1;
				if (!depths[key]) {
					delete currentMap[key];
					delete this.callbackMap[key];
					removed = true;
				}
			}
			if (this.masterCallback) {
				if (removed) this.masterCallback(null, String(key));
				if (added) this.masterCallback(val, String(key));
			}
		};
	}
	createRef(key) {
		let refCallback = this.callbackMap[key];
		if (!refCallback) refCallback = this.callbackMap[key] = (val) => {
			this.handleValue(val, String(key));
		};
		return refCallback;
	}
	collect(startIndex, endIndex, step) {
		return collectFromHash(this.currentMap, startIndex, endIndex, step);
	}
	getAll() {
		return hashValuesToArray(this.currentMap);
	}
};
function computeShrinkWidth(chunkEls) {
	let shrinkCells = findElements(chunkEls, ".fc-scrollgrid-shrink");
	let largestWidth = 0;
	for (let shrinkCell of shrinkCells) largestWidth = Math.max(largestWidth, computeSmallestCellWidth(shrinkCell));
	return Math.ceil(largestWidth);
}
function getSectionHasLiquidHeight(props, sectionConfig) {
	return props.liquid && sectionConfig.liquid;
}
function getAllowYScrolling(props, sectionConfig) {
	return sectionConfig.maxHeight != null || getSectionHasLiquidHeight(props, sectionConfig);
}
function renderChunkContent(sectionConfig, chunkConfig, arg, isHeader) {
	let { expandRows } = arg;
	return typeof chunkConfig.content === "function" ? chunkConfig.content(arg) : y("table", {
		role: "presentation",
		className: [chunkConfig.tableClassName, sectionConfig.syncRowHeights ? "fc-scrollgrid-sync-table" : ""].join(" "),
		style: {
			minWidth: arg.tableMinWidth,
			width: arg.clientWidth,
			height: expandRows ? arg.clientHeight : ""
		}
	}, arg.tableColGroupNode, y(isHeader ? "thead" : "tbody", { role: "presentation" }, typeof chunkConfig.rowContent === "function" ? chunkConfig.rowContent(arg) : chunkConfig.rowContent));
}
function isColPropsEqual(cols0, cols1) {
	return isArraysEqual(cols0, cols1, isPropsEqual);
}
function renderMicroColGroup(cols, shrinkWidth) {
	let colNodes = [];
	for (let colProps of cols) {
		let span = colProps.span || 1;
		for (let i = 0; i < span; i += 1) colNodes.push(y("col", { style: {
			width: colProps.width === "shrink" ? sanitizeShrinkWidth(shrinkWidth) : colProps.width || "",
			minWidth: colProps.minWidth || ""
		} }));
	}
	return y("colgroup", {}, ...colNodes);
}
function sanitizeShrinkWidth(shrinkWidth) {
	return shrinkWidth == null ? 4 : shrinkWidth;
}
function hasShrinkWidth(cols) {
	for (let col of cols) if (col.width === "shrink") return true;
	return false;
}
function getScrollGridClassNames(liquid, context) {
	let classNames = ["fc-scrollgrid", context.theme.getClass("table")];
	if (liquid) classNames.push("fc-scrollgrid-liquid");
	return classNames;
}
function getSectionClassNames(sectionConfig, wholeTableVGrow) {
	let classNames = [
		"fc-scrollgrid-section",
		`fc-scrollgrid-section-${sectionConfig.type}`,
		sectionConfig.className
	];
	if (wholeTableVGrow && sectionConfig.liquid && sectionConfig.maxHeight == null) classNames.push("fc-scrollgrid-section-liquid");
	if (sectionConfig.isSticky) classNames.push("fc-scrollgrid-section-sticky");
	return classNames;
}
function renderScrollShim(arg) {
	return y("div", {
		className: "fc-scrollgrid-sticky-shim",
		style: {
			width: arg.clientWidth,
			minWidth: arg.tableMinWidth
		}
	});
}
function getStickyHeaderDates(options) {
	let { stickyHeaderDates } = options;
	if (stickyHeaderDates == null || stickyHeaderDates === "auto") stickyHeaderDates = options.height === "auto" || options.viewHeight === "auto";
	return stickyHeaderDates;
}
function getStickyFooterScrollbar(options) {
	let { stickyFooterScrollbar } = options;
	if (stickyFooterScrollbar == null || stickyFooterScrollbar === "auto") stickyFooterScrollbar = options.height === "auto" || options.viewHeight === "auto";
	return stickyFooterScrollbar;
}
var SimpleScrollGrid = class extends BaseComponent {
	constructor() {
		super(...arguments);
		this.processCols = memoize((a) => a, isColPropsEqual);
		this.renderMicroColGroup = memoize(renderMicroColGroup);
		this.scrollerRefs = new RefMap();
		this.scrollerElRefs = new RefMap(this._handleScrollerEl.bind(this));
		this.state = {
			shrinkWidth: null,
			forceYScrollbars: false,
			scrollerClientWidths: {},
			scrollerClientHeights: {}
		};
		this.handleSizing = () => {
			this.safeSetState(Object.assign({ shrinkWidth: this.computeShrinkWidth() }, this.computeScrollerDims()));
		};
	}
	render() {
		let { props, state, context } = this;
		let sectionConfigs = props.sections || [];
		let cols = this.processCols(props.cols);
		let microColGroupNode = this.renderMicroColGroup(cols, state.shrinkWidth);
		let classNames = getScrollGridClassNames(props.liquid, context);
		if (props.collapsibleWidth) classNames.push("fc-scrollgrid-collapsible");
		let configCnt = sectionConfigs.length;
		let configI = 0;
		let currentConfig;
		let headSectionNodes = [];
		let bodySectionNodes = [];
		let footSectionNodes = [];
		while (configI < configCnt && (currentConfig = sectionConfigs[configI]).type === "header") {
			headSectionNodes.push(this.renderSection(currentConfig, microColGroupNode, true));
			configI += 1;
		}
		while (configI < configCnt && (currentConfig = sectionConfigs[configI]).type === "body") {
			bodySectionNodes.push(this.renderSection(currentConfig, microColGroupNode, false));
			configI += 1;
		}
		while (configI < configCnt && (currentConfig = sectionConfigs[configI]).type === "footer") {
			footSectionNodes.push(this.renderSection(currentConfig, microColGroupNode, true));
			configI += 1;
		}
		let isBuggy = !getCanVGrowWithinCell();
		const roleAttrs = { role: "rowgroup" };
		return y("table", {
			role: "grid",
			className: classNames.join(" "),
			style: { height: props.height }
		}, Boolean(!isBuggy && headSectionNodes.length) && y("thead", roleAttrs, ...headSectionNodes), Boolean(!isBuggy && bodySectionNodes.length) && y("tbody", roleAttrs, ...bodySectionNodes), Boolean(!isBuggy && footSectionNodes.length) && y("tfoot", roleAttrs, ...footSectionNodes), isBuggy && y("tbody", roleAttrs, ...headSectionNodes, ...bodySectionNodes, ...footSectionNodes));
	}
	renderSection(sectionConfig, microColGroupNode, isHeader) {
		if ("outerContent" in sectionConfig) return y(_, { key: sectionConfig.key }, sectionConfig.outerContent);
		return y("tr", {
			key: sectionConfig.key,
			role: "presentation",
			className: getSectionClassNames(sectionConfig, this.props.liquid).join(" ")
		}, this.renderChunkTd(sectionConfig, microColGroupNode, sectionConfig.chunk, isHeader));
	}
	renderChunkTd(sectionConfig, microColGroupNode, chunkConfig, isHeader) {
		if ("outerContent" in chunkConfig) return chunkConfig.outerContent;
		let { props } = this;
		let { forceYScrollbars, scrollerClientWidths, scrollerClientHeights } = this.state;
		let needsYScrolling = getAllowYScrolling(props, sectionConfig);
		let isLiquid = getSectionHasLiquidHeight(props, sectionConfig);
		let overflowY = !props.liquid ? "visible" : forceYScrollbars ? "scroll" : !needsYScrolling ? "hidden" : "auto";
		let sectionKey = sectionConfig.key;
		let content = renderChunkContent(sectionConfig, chunkConfig, {
			tableColGroupNode: microColGroupNode,
			tableMinWidth: "",
			clientWidth: !props.collapsibleWidth && scrollerClientWidths[sectionKey] !== void 0 ? scrollerClientWidths[sectionKey] : null,
			clientHeight: scrollerClientHeights[sectionKey] !== void 0 ? scrollerClientHeights[sectionKey] : null,
			expandRows: sectionConfig.expandRows,
			syncRowHeights: false,
			rowSyncHeights: [],
			reportRowHeightChange: () => {}
		}, isHeader);
		return y(isHeader ? "th" : "td", {
			ref: chunkConfig.elRef,
			role: "presentation"
		}, y("div", { className: `fc-scroller-harness${isLiquid ? " fc-scroller-harness-liquid" : ""}` }, y(Scroller, {
			ref: this.scrollerRefs.createRef(sectionKey),
			elRef: this.scrollerElRefs.createRef(sectionKey),
			overflowY,
			overflowX: !props.liquid ? "visible" : "hidden",
			maxHeight: sectionConfig.maxHeight,
			liquid: isLiquid,
			liquidIsAbsolute: true
		}, content)));
	}
	_handleScrollerEl(scrollerEl, key) {
		let section = getSectionByKey(this.props.sections, key);
		if (section) setRef(section.chunk.scrollerElRef, scrollerEl);
	}
	componentDidMount() {
		this.handleSizing();
		this.context.addResizeHandler(this.handleSizing);
	}
	componentDidUpdate() {
		this.handleSizing();
	}
	componentWillUnmount() {
		this.context.removeResizeHandler(this.handleSizing);
	}
	computeShrinkWidth() {
		return hasShrinkWidth(this.props.cols) ? computeShrinkWidth(this.scrollerElRefs.getAll()) : 0;
	}
	computeScrollerDims() {
		let scrollbarWidth = getScrollbarWidths();
		let { scrollerRefs, scrollerElRefs } = this;
		let forceYScrollbars = false;
		let scrollerClientWidths = {};
		let scrollerClientHeights = {};
		for (let sectionKey in scrollerRefs.currentMap) {
			let scroller = scrollerRefs.currentMap[sectionKey];
			if (scroller && scroller.needsYScrolling()) {
				forceYScrollbars = true;
				break;
			}
		}
		for (let section of this.props.sections) {
			let sectionKey = section.key;
			let scrollerEl = scrollerElRefs.currentMap[sectionKey];
			if (scrollerEl) {
				let harnessEl = scrollerEl.parentNode;
				scrollerClientWidths[sectionKey] = Math.floor(harnessEl.getBoundingClientRect().width - (forceYScrollbars ? scrollbarWidth.y : 0));
				scrollerClientHeights[sectionKey] = Math.floor(harnessEl.getBoundingClientRect().height);
			}
		}
		return {
			forceYScrollbars,
			scrollerClientWidths,
			scrollerClientHeights
		};
	}
};
SimpleScrollGrid.addStateEquality({
	scrollerClientWidths: isPropsEqual,
	scrollerClientHeights: isPropsEqual
});
function getSectionByKey(sections, key) {
	for (let section of sections) if (section.key === key) return section;
	return null;
}
var EventContainer = class extends BaseComponent {
	constructor() {
		super(...arguments);
		this.buildPublicEvent = memoize((context, eventDef, eventInstance) => new EventImpl(context, eventDef, eventInstance));
		this.handleEl = (el) => {
			this.el = el;
			setRef(this.props.elRef, el);
			if (el) setElSeg(el, this.props.seg);
		};
	}
	render() {
		const { props, context } = this;
		const { options } = context;
		const { seg } = props;
		const { eventRange } = seg;
		const { ui } = eventRange;
		const renderProps = {
			event: this.buildPublicEvent(context, eventRange.def, eventRange.instance),
			view: context.viewApi,
			timeText: props.timeText,
			textColor: ui.textColor,
			backgroundColor: ui.backgroundColor,
			borderColor: ui.borderColor,
			isDraggable: !props.disableDragging && computeSegDraggable(seg, context),
			isStartResizable: !props.disableResizing && computeSegStartResizable(seg, context),
			isEndResizable: !props.disableResizing && computeSegEndResizable(seg),
			isMirror: Boolean(props.isDragging || props.isResizing || props.isDateSelecting),
			isStart: Boolean(seg.isStart),
			isEnd: Boolean(seg.isEnd),
			isPast: Boolean(props.isPast),
			isFuture: Boolean(props.isFuture),
			isToday: Boolean(props.isToday),
			isSelected: Boolean(props.isSelected),
			isDragging: Boolean(props.isDragging),
			isResizing: Boolean(props.isResizing)
		};
		return y(ContentContainer, {
			elRef: this.handleEl,
			elTag: props.elTag,
			elAttrs: props.elAttrs,
			elClasses: [
				...getEventClassNames(renderProps),
				...seg.eventRange.ui.classNames,
				...props.elClasses || []
			],
			elStyle: props.elStyle,
			renderProps,
			generatorName: "eventContent",
			customGenerator: options.eventContent,
			defaultGenerator: props.defaultGenerator,
			classNameGenerator: options.eventClassNames,
			didMount: options.eventDidMount,
			willUnmount: options.eventWillUnmount
		}, props.children);
	}
	componentDidUpdate(prevProps) {
		if (this.el && this.props.seg !== prevProps.seg) setElSeg(this.el, this.props.seg);
	}
};
var StandardEvent = class extends BaseComponent {
	render() {
		let { props, context } = this;
		let { options } = context;
		let { seg } = props;
		let { ui } = seg.eventRange;
		let timeText = buildSegTimeText(seg, options.eventTimeFormat || props.defaultTimeFormat, context, props.defaultDisplayEventTime, props.defaultDisplayEventEnd);
		return y(EventContainer, Object.assign({}, props, {
			elTag: "a",
			elStyle: {
				borderColor: ui.borderColor,
				backgroundColor: ui.backgroundColor
			},
			elAttrs: getSegAnchorAttrs(seg, context),
			defaultGenerator: renderInnerContent$1,
			timeText
		}), (InnerContent, eventContentArg) => y(_, null, y(InnerContent, {
			elTag: "div",
			elClasses: ["fc-event-main"],
			elStyle: { color: eventContentArg.textColor }
		}), Boolean(eventContentArg.isStartResizable) && y("div", { className: "fc-event-resizer fc-event-resizer-start" }), Boolean(eventContentArg.isEndResizable) && y("div", { className: "fc-event-resizer fc-event-resizer-end" })));
	}
};
StandardEvent.addPropsEquality({ seg: isPropsEqual });
function renderInnerContent$1(innerProps) {
	return y("div", { className: "fc-event-main-frame" }, innerProps.timeText && y("div", { className: "fc-event-time" }, innerProps.timeText), y("div", { className: "fc-event-title-container" }, y("div", { className: "fc-event-title fc-sticky" }, innerProps.event.title || y(_, null, "\xA0"))));
}
var DAY_NUM_FORMAT = createFormatter({ day: "numeric" });
var DayCellContainer = class extends BaseComponent {
	constructor() {
		super(...arguments);
		this.refineRenderProps = memoizeObjArg(refineRenderProps);
	}
	render() {
		let { props, context } = this;
		let { options } = context;
		let renderProps = this.refineRenderProps({
			date: props.date,
			dateProfile: props.dateProfile,
			todayRange: props.todayRange,
			isMonthStart: props.isMonthStart || false,
			showDayNumber: props.showDayNumber,
			extraRenderProps: props.extraRenderProps,
			viewApi: context.viewApi,
			dateEnv: context.dateEnv,
			monthStartFormat: options.monthStartFormat
		});
		return y(ContentContainer, {
			elRef: props.elRef,
			elTag: props.elTag,
			elAttrs: Object.assign(Object.assign({}, props.elAttrs), renderProps.isDisabled ? {} : { "data-date": formatDayString(props.date) }),
			elClasses: [...getDayClassNames(renderProps, context.theme), ...props.elClasses || []],
			elStyle: props.elStyle,
			renderProps,
			generatorName: "dayCellContent",
			customGenerator: options.dayCellContent,
			defaultGenerator: props.defaultGenerator,
			classNameGenerator: renderProps.isDisabled ? void 0 : options.dayCellClassNames,
			didMount: options.dayCellDidMount,
			willUnmount: options.dayCellWillUnmount
		}, props.children);
	}
};
function hasCustomDayCellContent(options) {
	return Boolean(options.dayCellContent || hasCustomRenderingHandler("dayCellContent", options));
}
function refineRenderProps(raw) {
	let { date, dateEnv, dateProfile, isMonthStart } = raw;
	let dayMeta = getDateMeta(date, raw.todayRange, null, dateProfile);
	let dayNumberText = raw.showDayNumber ? dateEnv.format(date, isMonthStart ? raw.monthStartFormat : DAY_NUM_FORMAT) : "";
	return Object.assign(Object.assign(Object.assign({
		date: dateEnv.toDate(date),
		view: raw.viewApi
	}, dayMeta), {
		isMonthStart,
		dayNumberText
	}), raw.extraRenderProps);
}
var BgEvent = class extends BaseComponent {
	render() {
		let { props } = this;
		let { seg } = props;
		return y(EventContainer, {
			elTag: "div",
			elClasses: ["fc-bg-event"],
			elStyle: { backgroundColor: seg.eventRange.ui.backgroundColor },
			defaultGenerator: renderInnerContent$2,
			seg,
			timeText: "",
			isDragging: false,
			isResizing: false,
			isDateSelecting: false,
			isSelected: false,
			isPast: props.isPast,
			isFuture: props.isFuture,
			isToday: props.isToday,
			disableDragging: true,
			disableResizing: true
		});
	}
};
function renderInnerContent$2(props) {
	let { title } = props.event;
	return title && y("div", { className: "fc-event-title" }, props.event.title);
}
function renderFill(fillType) {
	return y("div", { className: `fc-${fillType}` });
}
var WeekNumberContainer = (props) => y(ViewContextType.Consumer, null, (context) => {
	let { dateEnv, options } = context;
	let { date } = props;
	let format = options.weekNumberFormat || props.defaultFormat;
	let renderProps = {
		num: dateEnv.computeWeekNumber(date),
		text: dateEnv.format(date, format),
		date
	};
	return y(ContentContainer, {
		elRef: props.elRef,
		elTag: props.elTag,
		elAttrs: props.elAttrs,
		elClasses: props.elClasses,
		elStyle: props.elStyle,
		renderProps,
		generatorName: "weekNumberContent",
		customGenerator: options.weekNumberContent,
		defaultGenerator: renderInner,
		classNameGenerator: options.weekNumberClassNames,
		didMount: options.weekNumberDidMount,
		willUnmount: options.weekNumberWillUnmount
	}, props.children);
});
function renderInner(innerProps) {
	return innerProps.text;
}
var PADDING_FROM_VIEWPORT = 10;
var Popover = class extends BaseComponent {
	constructor() {
		super(...arguments);
		this.state = { titleId: getUniqueDomId() };
		this.handleRootEl = (el) => {
			this.rootEl = el;
			if (this.props.elRef) setRef(this.props.elRef, el);
		};
		this.handleDocumentMouseDown = (ev) => {
			const target = getEventTargetViaRoot(ev);
			if (!this.rootEl.contains(target)) this.handleCloseClick();
		};
		this.handleDocumentKeyDown = (ev) => {
			if (ev.key === "Escape") this.handleCloseClick();
		};
		this.handleCloseClick = () => {
			let { onClose } = this.props;
			if (onClose) onClose();
		};
	}
	render() {
		let { theme, options } = this.context;
		let { props, state } = this;
		let classNames = ["fc-popover", theme.getClass("popover")].concat(props.extraClassNames || []);
		return j(y("div", Object.assign({}, props.extraAttrs, {
			id: props.id,
			className: classNames.join(" "),
			"aria-labelledby": state.titleId,
			ref: this.handleRootEl
		}), y("div", { className: "fc-popover-header " + theme.getClass("popoverHeader") }, y("span", {
			className: "fc-popover-title",
			id: state.titleId
		}, props.title), y("span", {
			className: "fc-popover-close " + theme.getIconClass("close"),
			title: options.closeHint,
			onClick: this.handleCloseClick
		})), y("div", { className: "fc-popover-body " + theme.getClass("popoverContent") }, props.children)), props.parentEl);
	}
	componentDidMount() {
		document.addEventListener("mousedown", this.handleDocumentMouseDown);
		document.addEventListener("keydown", this.handleDocumentKeyDown);
		this.updateSize();
	}
	componentWillUnmount() {
		document.removeEventListener("mousedown", this.handleDocumentMouseDown);
		document.removeEventListener("keydown", this.handleDocumentKeyDown);
	}
	updateSize() {
		let { isRtl } = this.context;
		let { alignmentEl, alignGridTop } = this.props;
		let { rootEl } = this;
		let alignmentRect = computeClippedClientRect(alignmentEl);
		if (alignmentRect) {
			let popoverDims = rootEl.getBoundingClientRect();
			let popoverTop = alignGridTop ? elementClosest(alignmentEl, ".fc-scrollgrid").getBoundingClientRect().top : alignmentRect.top;
			let popoverLeft = isRtl ? alignmentRect.right - popoverDims.width : alignmentRect.left;
			popoverTop = Math.max(popoverTop, PADDING_FROM_VIEWPORT);
			popoverLeft = Math.min(popoverLeft, document.documentElement.clientWidth - PADDING_FROM_VIEWPORT - popoverDims.width);
			popoverLeft = Math.max(popoverLeft, PADDING_FROM_VIEWPORT);
			let origin = rootEl.offsetParent.getBoundingClientRect();
			applyStyle(rootEl, {
				top: popoverTop - origin.top,
				left: popoverLeft - origin.left
			});
		}
	}
};
var MorePopover = class extends DateComponent {
	constructor() {
		super(...arguments);
		this.handleRootEl = (rootEl) => {
			this.rootEl = rootEl;
			if (rootEl) this.context.registerInteractiveComponent(this, {
				el: rootEl,
				useEventCenter: false
			});
			else this.context.unregisterInteractiveComponent(this);
		};
	}
	render() {
		let { options, dateEnv } = this.context;
		let { props } = this;
		let { startDate, todayRange, dateProfile } = props;
		let title = dateEnv.format(startDate, options.dayPopoverFormat);
		return y(DayCellContainer, {
			elRef: this.handleRootEl,
			date: startDate,
			dateProfile,
			todayRange
		}, (InnerContent, renderProps, elAttrs) => y(Popover, {
			elRef: elAttrs.ref,
			id: props.id,
			title,
			extraClassNames: ["fc-more-popover"].concat(elAttrs.className || []),
			extraAttrs: elAttrs,
			parentEl: props.parentEl,
			alignmentEl: props.alignmentEl,
			alignGridTop: props.alignGridTop,
			onClose: props.onClose
		}, hasCustomDayCellContent(options) && y(InnerContent, {
			elTag: "div",
			elClasses: ["fc-more-popover-misc"]
		}), props.children));
	}
	queryHit(positionLeft, positionTop, elWidth, elHeight) {
		let { rootEl, props } = this;
		if (positionLeft >= 0 && positionLeft < elWidth && positionTop >= 0 && positionTop < elHeight) return {
			dateProfile: props.dateProfile,
			dateSpan: Object.assign({
				allDay: !props.forceTimed,
				range: {
					start: props.startDate,
					end: props.endDate
				}
			}, props.extraDateSpan),
			dayEl: rootEl,
			rect: {
				left: 0,
				top: 0,
				right: elWidth,
				bottom: elHeight
			},
			layer: 1
		};
		return null;
	}
};
var MoreLinkContainer = class extends BaseComponent {
	constructor() {
		super(...arguments);
		this.state = {
			isPopoverOpen: false,
			popoverId: getUniqueDomId()
		};
		this.handleLinkEl = (linkEl) => {
			this.linkEl = linkEl;
			if (this.props.elRef) setRef(this.props.elRef, linkEl);
		};
		this.handleClick = (ev) => {
			let { props, context } = this;
			let { moreLinkClick } = context.options;
			let date = computeRange(props).start;
			function buildPublicSeg(seg) {
				let { def, instance, range } = seg.eventRange;
				return {
					event: new EventImpl(context, def, instance),
					start: context.dateEnv.toDate(range.start),
					end: context.dateEnv.toDate(range.end),
					isStart: seg.isStart,
					isEnd: seg.isEnd
				};
			}
			if (typeof moreLinkClick === "function") moreLinkClick = moreLinkClick({
				date,
				allDay: Boolean(props.allDayDate),
				allSegs: props.allSegs.map(buildPublicSeg),
				hiddenSegs: props.hiddenSegs.map(buildPublicSeg),
				jsEvent: ev,
				view: context.viewApi
			});
			if (!moreLinkClick || moreLinkClick === "popover") this.setState({ isPopoverOpen: true });
			else if (typeof moreLinkClick === "string") context.calendarApi.zoomTo(date, moreLinkClick);
		};
		this.handlePopoverClose = () => {
			this.setState({ isPopoverOpen: false });
		};
	}
	render() {
		let { props, state } = this;
		return y(ViewContextType.Consumer, null, (context) => {
			let { viewApi, options, calendarApi } = context;
			let { moreLinkText } = options;
			let { moreCnt } = props;
			let range = computeRange(props);
			let text = typeof moreLinkText === "function" ? moreLinkText.call(calendarApi, moreCnt) : `+${moreCnt} ${moreLinkText}`;
			let hint = formatWithOrdinals(options.moreLinkHint, [moreCnt], text);
			let renderProps = {
				num: moreCnt,
				shortText: `+${moreCnt}`,
				text,
				view: viewApi
			};
			return y(_, null, Boolean(props.moreCnt) && y(ContentContainer, {
				elTag: props.elTag || "a",
				elRef: this.handleLinkEl,
				elClasses: [...props.elClasses || [], "fc-more-link"],
				elStyle: props.elStyle,
				elAttrs: Object.assign(Object.assign(Object.assign({}, props.elAttrs), createAriaClickAttrs(this.handleClick)), {
					title: hint,
					"aria-expanded": state.isPopoverOpen,
					"aria-controls": state.isPopoverOpen ? state.popoverId : ""
				}),
				renderProps,
				generatorName: "moreLinkContent",
				customGenerator: options.moreLinkContent,
				defaultGenerator: props.defaultGenerator || renderMoreLinkInner,
				classNameGenerator: options.moreLinkClassNames,
				didMount: options.moreLinkDidMount,
				willUnmount: options.moreLinkWillUnmount
			}, props.children), state.isPopoverOpen && y(MorePopover, {
				id: state.popoverId,
				startDate: range.start,
				endDate: range.end,
				dateProfile: props.dateProfile,
				todayRange: props.todayRange,
				extraDateSpan: props.extraDateSpan,
				parentEl: this.parentEl,
				alignmentEl: props.alignmentElRef ? props.alignmentElRef.current : this.linkEl,
				alignGridTop: props.alignGridTop,
				forceTimed: props.forceTimed,
				onClose: this.handlePopoverClose
			}, props.popoverContent()));
		});
	}
	componentDidMount() {
		this.updateParentEl();
	}
	componentDidUpdate() {
		this.updateParentEl();
	}
	updateParentEl() {
		if (this.linkEl) this.parentEl = elementClosest(this.linkEl, ".fc-view-harness");
	}
};
function renderMoreLinkInner(props) {
	return props.text;
}
function computeRange(props) {
	if (props.allDayDate) return {
		start: props.allDayDate,
		end: addDays(props.allDayDate, 1)
	};
	let { hiddenSegs } = props;
	return {
		start: computeEarliestSegStart(hiddenSegs),
		end: computeLatestSegEnd(hiddenSegs)
	};
}
function computeEarliestSegStart(segs) {
	return segs.reduce(pickEarliestStart).eventRange.range.start;
}
function pickEarliestStart(seg0, seg1) {
	return seg0.eventRange.range.start < seg1.eventRange.range.start ? seg0 : seg1;
}
function computeLatestSegEnd(segs) {
	return segs.reduce(pickLatestEnd).eventRange.range.end;
}
function pickLatestEnd(seg0, seg1) {
	return seg0.eventRange.range.end > seg1.eventRange.range.end ? seg0 : seg1;
}
var Store = class {
	constructor() {
		this.handlers = [];
	}
	set(value) {
		this.currentValue = value;
		for (let handler of this.handlers) handler(value);
	}
	subscribe(handler) {
		this.handlers.push(handler);
		if (this.currentValue !== void 0) handler(this.currentValue);
	}
};
var CustomRenderingStore = class extends Store {
	constructor() {
		super(...arguments);
		this.map = /* @__PURE__ */ new Map();
	}
	handle(customRendering) {
		const { map } = this;
		let updated = false;
		if (customRendering.isActive) {
			map.set(customRendering.id, customRendering);
			updated = true;
		} else if (map.has(customRendering.id)) {
			map.delete(customRendering.id);
			updated = true;
		}
		if (updated) this.set(map);
	}
};
//#endregion
//#region node_modules/@fullcalendar/core/index.js
var globalLocales = [];
var MINIMAL_RAW_EN_LOCALE = {
	code: "en",
	week: {
		dow: 0,
		doy: 4
	},
	direction: "ltr",
	buttonText: {
		prev: "prev",
		next: "next",
		prevYear: "prev year",
		nextYear: "next year",
		year: "year",
		today: "today",
		month: "month",
		week: "week",
		day: "day",
		list: "list"
	},
	weekText: "W",
	weekTextLong: "Week",
	closeHint: "Close",
	timeHint: "Time",
	eventHint: "Event",
	allDayText: "all-day",
	moreLinkText: "more",
	noEventsText: "No events to display"
};
var RAW_EN_LOCALE = Object.assign(Object.assign({}, MINIMAL_RAW_EN_LOCALE), {
	buttonHints: {
		prev: "Previous $0",
		next: "Next $0",
		today(buttonText, unit) {
			return unit === "day" ? "Today" : `This ${buttonText}`;
		}
	},
	viewHint: "$0 view",
	navLinkHint: "Go to $0",
	moreLinkHint(eventCnt) {
		return `Show ${eventCnt} more event${eventCnt === 1 ? "" : "s"}`;
	}
});
function organizeRawLocales(explicitRawLocales) {
	let defaultCode = explicitRawLocales.length > 0 ? explicitRawLocales[0].code : "en";
	let allRawLocales = globalLocales.concat(explicitRawLocales);
	let rawLocaleMap = { en: RAW_EN_LOCALE };
	for (let rawLocale of allRawLocales) rawLocaleMap[rawLocale.code] = rawLocale;
	return {
		map: rawLocaleMap,
		defaultCode
	};
}
function buildLocale(inputSingular, available) {
	if (typeof inputSingular === "object" && !Array.isArray(inputSingular)) return parseLocale(inputSingular.code, [inputSingular.code], inputSingular);
	return queryLocale(inputSingular, available);
}
function queryLocale(codeArg, available) {
	let codes = [].concat(codeArg || []);
	return parseLocale(codeArg, codes, queryRawLocale(codes, available) || RAW_EN_LOCALE);
}
function queryRawLocale(codes, available) {
	for (let i = 0; i < codes.length; i += 1) {
		let parts = codes[i].toLocaleLowerCase().split("-");
		for (let j = parts.length; j > 0; j -= 1) {
			let simpleId = parts.slice(0, j).join("-");
			if (available[simpleId]) return available[simpleId];
		}
	}
	return null;
}
function parseLocale(codeArg, codes, raw) {
	let merged = mergeProps([MINIMAL_RAW_EN_LOCALE, raw], ["buttonText"]);
	delete merged.code;
	let { week } = merged;
	delete merged.week;
	return {
		codeArg,
		codes,
		week,
		simpleNumberFormat: new Intl.NumberFormat(codeArg),
		options: merged
	};
}
function createPlugin(input) {
	return {
		majorVersionError: MAJOR_VERSION_ERROR,
		id: guid(),
		name: input.name,
		premiumReleaseDate: input.premiumReleaseDate ? new Date(input.premiumReleaseDate) : void 0,
		deps: input.deps || [],
		reducers: input.reducers || [],
		isLoadingFuncs: input.isLoadingFuncs || [],
		contextInit: [].concat(input.contextInit || []),
		eventRefiners: input.eventRefiners || {},
		eventDefMemberAdders: input.eventDefMemberAdders || [],
		eventSourceRefiners: input.eventSourceRefiners || {},
		isDraggableTransformers: input.isDraggableTransformers || [],
		eventDragMutationMassagers: input.eventDragMutationMassagers || [],
		eventDefMutationAppliers: input.eventDefMutationAppliers || [],
		dateSelectionTransformers: input.dateSelectionTransformers || [],
		datePointTransforms: input.datePointTransforms || [],
		dateSpanTransforms: input.dateSpanTransforms || [],
		views: input.views || {},
		viewPropsTransformers: input.viewPropsTransformers || [],
		isPropsValid: input.isPropsValid || null,
		externalDefTransforms: input.externalDefTransforms || [],
		viewContainerAppends: input.viewContainerAppends || [],
		eventDropTransformers: input.eventDropTransformers || [],
		componentInteractions: input.componentInteractions || [],
		calendarInteractions: input.calendarInteractions || [],
		themeClasses: input.themeClasses || {},
		eventSourceDefs: input.eventSourceDefs || [],
		cmdFormatter: input.cmdFormatter,
		recurringTypes: input.recurringTypes || [],
		namedTimeZonedImpl: input.namedTimeZonedImpl,
		initialView: input.initialView || "",
		elementDraggingImpl: input.elementDraggingImpl,
		optionChangeHandlers: input.optionChangeHandlers || {},
		scrollGridImpl: input.scrollGridImpl || null,
		listenerRefiners: input.listenerRefiners || {},
		optionRefiners: input.optionRefiners || {},
		propSetHandlers: input.propSetHandlers || {}
	};
}
function buildPluginHooks(pluginDefs, globalDefs) {
	let currentPluginIds = {};
	let hooks = {
		premiumReleaseDate: void 0,
		reducers: [],
		isLoadingFuncs: [],
		contextInit: [],
		eventRefiners: {},
		eventDefMemberAdders: [],
		eventSourceRefiners: {},
		isDraggableTransformers: [],
		eventDragMutationMassagers: [],
		eventDefMutationAppliers: [],
		dateSelectionTransformers: [],
		datePointTransforms: [],
		dateSpanTransforms: [],
		views: {},
		viewPropsTransformers: [],
		isPropsValid: null,
		externalDefTransforms: [],
		viewContainerAppends: [],
		eventDropTransformers: [],
		componentInteractions: [],
		calendarInteractions: [],
		themeClasses: {},
		eventSourceDefs: [],
		cmdFormatter: null,
		recurringTypes: [],
		namedTimeZonedImpl: null,
		initialView: "",
		elementDraggingImpl: null,
		optionChangeHandlers: {},
		scrollGridImpl: null,
		listenerRefiners: {},
		optionRefiners: {},
		propSetHandlers: {}
	};
	function addDefs(defs) {
		for (let def of defs) {
			const pluginName = def.name;
			const currentId = currentPluginIds[pluginName];
			if (currentId === void 0) {
				currentPluginIds[pluginName] = def.id;
				addDefs(def.deps);
				hooks = combineHooks(hooks, def);
			} else if (currentId !== def.id) console.warn(`Duplicate plugin '${pluginName}'`);
		}
	}
	if (pluginDefs) addDefs(pluginDefs);
	addDefs(globalDefs);
	return hooks;
}
function buildBuildPluginHooks() {
	let currentOverrideDefs = [];
	let currentGlobalDefs = [];
	let currentHooks;
	return (overrideDefs, globalDefs) => {
		if (!currentHooks || !isArraysEqual(overrideDefs, currentOverrideDefs) || !isArraysEqual(globalDefs, currentGlobalDefs)) currentHooks = buildPluginHooks(overrideDefs, globalDefs);
		currentOverrideDefs = overrideDefs;
		currentGlobalDefs = globalDefs;
		return currentHooks;
	};
}
function combineHooks(hooks0, hooks1) {
	return {
		premiumReleaseDate: compareOptionalDates(hooks0.premiumReleaseDate, hooks1.premiumReleaseDate),
		reducers: hooks0.reducers.concat(hooks1.reducers),
		isLoadingFuncs: hooks0.isLoadingFuncs.concat(hooks1.isLoadingFuncs),
		contextInit: hooks0.contextInit.concat(hooks1.contextInit),
		eventRefiners: Object.assign(Object.assign({}, hooks0.eventRefiners), hooks1.eventRefiners),
		eventDefMemberAdders: hooks0.eventDefMemberAdders.concat(hooks1.eventDefMemberAdders),
		eventSourceRefiners: Object.assign(Object.assign({}, hooks0.eventSourceRefiners), hooks1.eventSourceRefiners),
		isDraggableTransformers: hooks0.isDraggableTransformers.concat(hooks1.isDraggableTransformers),
		eventDragMutationMassagers: hooks0.eventDragMutationMassagers.concat(hooks1.eventDragMutationMassagers),
		eventDefMutationAppliers: hooks0.eventDefMutationAppliers.concat(hooks1.eventDefMutationAppliers),
		dateSelectionTransformers: hooks0.dateSelectionTransformers.concat(hooks1.dateSelectionTransformers),
		datePointTransforms: hooks0.datePointTransforms.concat(hooks1.datePointTransforms),
		dateSpanTransforms: hooks0.dateSpanTransforms.concat(hooks1.dateSpanTransforms),
		views: Object.assign(Object.assign({}, hooks0.views), hooks1.views),
		viewPropsTransformers: hooks0.viewPropsTransformers.concat(hooks1.viewPropsTransformers),
		isPropsValid: hooks1.isPropsValid || hooks0.isPropsValid,
		externalDefTransforms: hooks0.externalDefTransforms.concat(hooks1.externalDefTransforms),
		viewContainerAppends: hooks0.viewContainerAppends.concat(hooks1.viewContainerAppends),
		eventDropTransformers: hooks0.eventDropTransformers.concat(hooks1.eventDropTransformers),
		calendarInteractions: hooks0.calendarInteractions.concat(hooks1.calendarInteractions),
		componentInteractions: hooks0.componentInteractions.concat(hooks1.componentInteractions),
		themeClasses: Object.assign(Object.assign({}, hooks0.themeClasses), hooks1.themeClasses),
		eventSourceDefs: hooks0.eventSourceDefs.concat(hooks1.eventSourceDefs),
		cmdFormatter: hooks1.cmdFormatter || hooks0.cmdFormatter,
		recurringTypes: hooks0.recurringTypes.concat(hooks1.recurringTypes),
		namedTimeZonedImpl: hooks1.namedTimeZonedImpl || hooks0.namedTimeZonedImpl,
		initialView: hooks0.initialView || hooks1.initialView,
		elementDraggingImpl: hooks0.elementDraggingImpl || hooks1.elementDraggingImpl,
		optionChangeHandlers: Object.assign(Object.assign({}, hooks0.optionChangeHandlers), hooks1.optionChangeHandlers),
		scrollGridImpl: hooks1.scrollGridImpl || hooks0.scrollGridImpl,
		listenerRefiners: Object.assign(Object.assign({}, hooks0.listenerRefiners), hooks1.listenerRefiners),
		optionRefiners: Object.assign(Object.assign({}, hooks0.optionRefiners), hooks1.optionRefiners),
		propSetHandlers: Object.assign(Object.assign({}, hooks0.propSetHandlers), hooks1.propSetHandlers)
	};
}
function compareOptionalDates(date0, date1) {
	if (date0 === void 0) return date1;
	if (date1 === void 0) return date0;
	return new Date(Math.max(date0.valueOf(), date1.valueOf()));
}
var StandardTheme = class extends Theme {};
StandardTheme.prototype.classes = {
	root: "fc-theme-standard",
	tableCellShaded: "fc-cell-shaded",
	buttonGroup: "fc-button-group",
	button: "fc-button fc-button-primary",
	buttonActive: "fc-button-active"
};
StandardTheme.prototype.baseIconClass = "fc-icon";
StandardTheme.prototype.iconClasses = {
	close: "fc-icon-x",
	prev: "fc-icon-chevron-left",
	next: "fc-icon-chevron-right",
	prevYear: "fc-icon-chevrons-left",
	nextYear: "fc-icon-chevrons-right"
};
StandardTheme.prototype.rtlIconClasses = {
	prev: "fc-icon-chevron-right",
	next: "fc-icon-chevron-left",
	prevYear: "fc-icon-chevrons-right",
	nextYear: "fc-icon-chevrons-left"
};
StandardTheme.prototype.iconOverrideOption = "buttonIcons";
StandardTheme.prototype.iconOverrideCustomButtonOption = "icon";
StandardTheme.prototype.iconOverridePrefix = "fc-icon-";
function compileViewDefs(defaultConfigs, overrideConfigs) {
	let hash = {};
	let viewType;
	for (viewType in defaultConfigs) ensureViewDef(viewType, hash, defaultConfigs, overrideConfigs);
	for (viewType in overrideConfigs) ensureViewDef(viewType, hash, defaultConfigs, overrideConfigs);
	return hash;
}
function ensureViewDef(viewType, hash, defaultConfigs, overrideConfigs) {
	if (hash[viewType]) return hash[viewType];
	let viewDef = buildViewDef(viewType, hash, defaultConfigs, overrideConfigs);
	if (viewDef) hash[viewType] = viewDef;
	return viewDef;
}
function buildViewDef(viewType, hash, defaultConfigs, overrideConfigs) {
	let defaultConfig = defaultConfigs[viewType];
	let overrideConfig = overrideConfigs[viewType];
	let queryProp = (name) => defaultConfig && defaultConfig[name] !== null ? defaultConfig[name] : overrideConfig && overrideConfig[name] !== null ? overrideConfig[name] : null;
	let theComponent = queryProp("component");
	let superType = queryProp("superType");
	let superDef = null;
	if (superType) {
		if (superType === viewType) throw new Error("Can't have a custom view type that references itself");
		superDef = ensureViewDef(superType, hash, defaultConfigs, overrideConfigs);
	}
	if (!theComponent && superDef) theComponent = superDef.component;
	if (!theComponent) return null;
	return {
		type: viewType,
		component: theComponent,
		defaults: Object.assign(Object.assign({}, superDef ? superDef.defaults : {}), defaultConfig ? defaultConfig.rawOptions : {}),
		overrides: Object.assign(Object.assign({}, superDef ? superDef.overrides : {}), overrideConfig ? overrideConfig.rawOptions : {})
	};
}
function parseViewConfigs(inputs) {
	return mapHash(inputs, parseViewConfig);
}
function parseViewConfig(input) {
	let rawOptions = typeof input === "function" ? { component: input } : input;
	let { component } = rawOptions;
	if (rawOptions.content) component = createViewHookComponent(rawOptions);
	else if (component && !(component.prototype instanceof BaseComponent)) component = createViewHookComponent(Object.assign(Object.assign({}, rawOptions), { content: component }));
	return {
		superType: rawOptions.type,
		component,
		rawOptions
	};
}
function createViewHookComponent(options) {
	return (viewProps) => y(ViewContextType.Consumer, null, (context) => y(ContentContainer, {
		elTag: "div",
		elClasses: buildViewClassNames(context.viewSpec),
		renderProps: Object.assign(Object.assign({}, viewProps), { nextDayThreshold: context.options.nextDayThreshold }),
		generatorName: void 0,
		customGenerator: options.content,
		classNameGenerator: options.classNames,
		didMount: options.didMount,
		willUnmount: options.willUnmount
	}));
}
function buildViewSpecs(defaultInputs, optionOverrides, dynamicOptionOverrides, localeDefaults) {
	let defaultConfigs = parseViewConfigs(defaultInputs);
	let overrideConfigs = parseViewConfigs(optionOverrides.views);
	return mapHash(compileViewDefs(defaultConfigs, overrideConfigs), (viewDef) => buildViewSpec(viewDef, overrideConfigs, optionOverrides, dynamicOptionOverrides, localeDefaults));
}
function buildViewSpec(viewDef, overrideConfigs, optionOverrides, dynamicOptionOverrides, localeDefaults) {
	let durationInput = viewDef.overrides.duration || viewDef.defaults.duration || dynamicOptionOverrides.duration || optionOverrides.duration;
	let duration = null;
	let durationUnit = "";
	let singleUnit = "";
	let singleUnitOverrides = {};
	if (durationInput) {
		duration = createDurationCached(durationInput);
		if (duration) {
			let denom = greatestDurationDenominator(duration);
			durationUnit = denom.unit;
			if (denom.value === 1) {
				singleUnit = durationUnit;
				singleUnitOverrides = overrideConfigs[durationUnit] ? overrideConfigs[durationUnit].rawOptions : {};
			}
		}
	}
	let queryButtonText = (optionsSubset) => {
		let buttonTextMap = optionsSubset.buttonText || {};
		let buttonTextKey = viewDef.defaults.buttonTextKey;
		if (buttonTextKey != null && buttonTextMap[buttonTextKey] != null) return buttonTextMap[buttonTextKey];
		if (buttonTextMap[viewDef.type] != null) return buttonTextMap[viewDef.type];
		if (buttonTextMap[singleUnit] != null) return buttonTextMap[singleUnit];
		return null;
	};
	let queryButtonTitle = (optionsSubset) => {
		let buttonHints = optionsSubset.buttonHints || {};
		let buttonKey = viewDef.defaults.buttonTextKey;
		if (buttonKey != null && buttonHints[buttonKey] != null) return buttonHints[buttonKey];
		if (buttonHints[viewDef.type] != null) return buttonHints[viewDef.type];
		if (buttonHints[singleUnit] != null) return buttonHints[singleUnit];
		return null;
	};
	return {
		type: viewDef.type,
		component: viewDef.component,
		duration,
		durationUnit,
		singleUnit,
		optionDefaults: viewDef.defaults,
		optionOverrides: Object.assign(Object.assign({}, singleUnitOverrides), viewDef.overrides),
		buttonTextOverride: queryButtonText(dynamicOptionOverrides) || queryButtonText(optionOverrides) || viewDef.overrides.buttonText,
		buttonTextDefault: queryButtonText(localeDefaults) || viewDef.defaults.buttonText || queryButtonText(BASE_OPTION_DEFAULTS) || viewDef.type,
		buttonTitleOverride: queryButtonTitle(dynamicOptionOverrides) || queryButtonTitle(optionOverrides) || viewDef.overrides.buttonHint,
		buttonTitleDefault: queryButtonTitle(localeDefaults) || viewDef.defaults.buttonHint || queryButtonTitle(BASE_OPTION_DEFAULTS)
	};
}
var durationInputMap = {};
function createDurationCached(durationInput) {
	let json = JSON.stringify(durationInput);
	let res = durationInputMap[json];
	if (res === void 0) {
		res = createDuration(durationInput);
		durationInputMap[json] = res;
	}
	return res;
}
function reduceViewType(viewType, action) {
	switch (action.type) {
		case "CHANGE_VIEW_TYPE": viewType = action.viewType;
	}
	return viewType;
}
function reduceCurrentDate(currentDate, action) {
	switch (action.type) {
		case "CHANGE_DATE": return action.dateMarker;
		default: return currentDate;
	}
}
function getInitialDate(options, dateEnv, nowManager) {
	let initialDateInput = options.initialDate;
	if (initialDateInput != null) return dateEnv.createMarker(initialDateInput);
	return nowManager.getDateMarker();
}
function reduceDynamicOptionOverrides(dynamicOptionOverrides, action) {
	switch (action.type) {
		case "SET_OPTION": return Object.assign(Object.assign({}, dynamicOptionOverrides), { [action.optionName]: action.rawOptionValue });
		default: return dynamicOptionOverrides;
	}
}
function reduceDateProfile(currentDateProfile, action, currentDate, dateProfileGenerator) {
	let dp;
	switch (action.type) {
		case "CHANGE_VIEW_TYPE": return dateProfileGenerator.build(action.dateMarker || currentDate);
		case "CHANGE_DATE": return dateProfileGenerator.build(action.dateMarker);
		case "PREV":
			dp = dateProfileGenerator.buildPrev(currentDateProfile, currentDate);
			if (dp.isValid) return dp;
			break;
		case "NEXT":
			dp = dateProfileGenerator.buildNext(currentDateProfile, currentDate);
			if (dp.isValid) return dp;
	}
	return currentDateProfile;
}
function initEventSources(calendarOptions, dateProfile, context) {
	let activeRange = dateProfile ? dateProfile.activeRange : null;
	return addSources({}, parseInitialSources(calendarOptions, context), activeRange, context);
}
function reduceEventSources(eventSources, action, dateProfile, context) {
	let activeRange = dateProfile ? dateProfile.activeRange : null;
	switch (action.type) {
		case "ADD_EVENT_SOURCES": return addSources(eventSources, action.sources, activeRange, context);
		case "REMOVE_EVENT_SOURCE": return removeSource(eventSources, action.sourceId);
		case "PREV":
		case "NEXT":
		case "CHANGE_DATE":
		case "CHANGE_VIEW_TYPE":
			if (dateProfile) return fetchDirtySources(eventSources, activeRange, context);
			return eventSources;
		case "FETCH_EVENT_SOURCES": return fetchSourcesByIds(eventSources, action.sourceIds ? arrayToHash(action.sourceIds) : excludeStaticSources(eventSources, context), activeRange, action.isRefetch || false, context);
		case "RECEIVE_EVENTS":
		case "RECEIVE_EVENT_ERROR": return receiveResponse(eventSources, action.sourceId, action.fetchId, action.fetchRange);
		case "REMOVE_ALL_EVENT_SOURCES": return {};
		default: return eventSources;
	}
}
function reduceEventSourcesNewTimeZone(eventSources, dateProfile, context) {
	let activeRange = dateProfile ? dateProfile.activeRange : null;
	return fetchSourcesByIds(eventSources, excludeStaticSources(eventSources, context), activeRange, true, context);
}
function computeEventSourcesLoading(eventSources) {
	for (let sourceId in eventSources) if (eventSources[sourceId].isFetching) return true;
	return false;
}
function addSources(eventSourceHash, sources, fetchRange, context) {
	let hash = {};
	for (let source of sources) hash[source.sourceId] = source;
	if (fetchRange) hash = fetchDirtySources(hash, fetchRange, context);
	return Object.assign(Object.assign({}, eventSourceHash), hash);
}
function removeSource(eventSourceHash, sourceId) {
	return filterHash(eventSourceHash, (eventSource) => eventSource.sourceId !== sourceId);
}
function fetchDirtySources(sourceHash, fetchRange, context) {
	return fetchSourcesByIds(sourceHash, filterHash(sourceHash, (eventSource) => isSourceDirty(eventSource, fetchRange, context)), fetchRange, false, context);
}
function isSourceDirty(eventSource, fetchRange, context) {
	if (!doesSourceNeedRange(eventSource, context)) return !eventSource.latestFetchId;
	return !context.options.lazyFetching || !eventSource.fetchRange || eventSource.isFetching || fetchRange.start < eventSource.fetchRange.start || fetchRange.end > eventSource.fetchRange.end;
}
function fetchSourcesByIds(prevSources, sourceIdHash, fetchRange, isRefetch, context) {
	let nextSources = {};
	for (let sourceId in prevSources) {
		let source = prevSources[sourceId];
		if (sourceIdHash[sourceId]) nextSources[sourceId] = fetchSource(source, fetchRange, isRefetch, context);
		else nextSources[sourceId] = source;
	}
	return nextSources;
}
function fetchSource(eventSource, fetchRange, isRefetch, context) {
	let { options, calendarApi } = context;
	let sourceDef = context.pluginHooks.eventSourceDefs[eventSource.sourceDefId];
	let fetchId = guid();
	sourceDef.fetch({
		eventSource,
		range: fetchRange,
		isRefetch,
		context
	}, (res) => {
		let { rawEvents } = res;
		if (options.eventSourceSuccess) rawEvents = options.eventSourceSuccess.call(calendarApi, rawEvents, res.response) || rawEvents;
		if (eventSource.success) rawEvents = eventSource.success.call(calendarApi, rawEvents, res.response) || rawEvents;
		context.dispatch({
			type: "RECEIVE_EVENTS",
			sourceId: eventSource.sourceId,
			fetchId,
			fetchRange,
			rawEvents
		});
	}, (error) => {
		let errorHandled = false;
		if (options.eventSourceFailure) {
			options.eventSourceFailure.call(calendarApi, error);
			errorHandled = true;
		}
		if (eventSource.failure) {
			eventSource.failure(error);
			errorHandled = true;
		}
		if (!errorHandled) console.warn(error.message, error);
		context.dispatch({
			type: "RECEIVE_EVENT_ERROR",
			sourceId: eventSource.sourceId,
			fetchId,
			fetchRange,
			error
		});
	});
	return Object.assign(Object.assign({}, eventSource), {
		isFetching: true,
		latestFetchId: fetchId
	});
}
function receiveResponse(sourceHash, sourceId, fetchId, fetchRange) {
	let eventSource = sourceHash[sourceId];
	if (eventSource && fetchId === eventSource.latestFetchId) return Object.assign(Object.assign({}, sourceHash), { [sourceId]: Object.assign(Object.assign({}, eventSource), {
		isFetching: false,
		fetchRange
	}) });
	return sourceHash;
}
function excludeStaticSources(eventSources, context) {
	return filterHash(eventSources, (eventSource) => doesSourceNeedRange(eventSource, context));
}
function parseInitialSources(rawOptions, context) {
	let refiners = buildEventSourceRefiners(context);
	let rawSources = [].concat(rawOptions.eventSources || []);
	let sources = [];
	if (rawOptions.initialEvents) rawSources.unshift(rawOptions.initialEvents);
	if (rawOptions.events) rawSources.unshift(rawOptions.events);
	for (let rawSource of rawSources) {
		let source = parseEventSource(rawSource, context, refiners);
		if (source) sources.push(source);
	}
	return sources;
}
function doesSourceNeedRange(eventSource, context) {
	return !context.pluginHooks.eventSourceDefs[eventSource.sourceDefId].ignoreRange;
}
function reduceDateSelection(currentSelection, action) {
	switch (action.type) {
		case "UNSELECT_DATES": return null;
		case "SELECT_DATES": return action.selection;
		default: return currentSelection;
	}
}
function reduceSelectedEvent(currentInstanceId, action) {
	switch (action.type) {
		case "UNSELECT_EVENT": return "";
		case "SELECT_EVENT": return action.eventInstanceId;
		default: return currentInstanceId;
	}
}
function reduceEventDrag(currentDrag, action) {
	let newDrag;
	switch (action.type) {
		case "UNSET_EVENT_DRAG": return null;
		case "SET_EVENT_DRAG":
			newDrag = action.state;
			return {
				affectedEvents: newDrag.affectedEvents,
				mutatedEvents: newDrag.mutatedEvents,
				isEvent: newDrag.isEvent
			};
		default: return currentDrag;
	}
}
function reduceEventResize(currentResize, action) {
	let newResize;
	switch (action.type) {
		case "UNSET_EVENT_RESIZE": return null;
		case "SET_EVENT_RESIZE":
			newResize = action.state;
			return {
				affectedEvents: newResize.affectedEvents,
				mutatedEvents: newResize.mutatedEvents,
				isEvent: newResize.isEvent
			};
		default: return currentResize;
	}
}
function parseToolbars(calendarOptions, calendarOptionOverrides, theme, viewSpecs, calendarApi) {
	return {
		header: calendarOptions.headerToolbar ? parseToolbar(calendarOptions.headerToolbar, calendarOptions, calendarOptionOverrides, theme, viewSpecs, calendarApi) : null,
		footer: calendarOptions.footerToolbar ? parseToolbar(calendarOptions.footerToolbar, calendarOptions, calendarOptionOverrides, theme, viewSpecs, calendarApi) : null
	};
}
function parseToolbar(sectionStrHash, calendarOptions, calendarOptionOverrides, theme, viewSpecs, calendarApi) {
	let sectionWidgets = {};
	let viewsWithButtons = [];
	let hasTitle = false;
	for (let sectionName in sectionStrHash) {
		let sectionStr = sectionStrHash[sectionName];
		let sectionRes = parseSection(sectionStr, calendarOptions, calendarOptionOverrides, theme, viewSpecs, calendarApi);
		sectionWidgets[sectionName] = sectionRes.widgets;
		viewsWithButtons.push(...sectionRes.viewsWithButtons);
		hasTitle = hasTitle || sectionRes.hasTitle;
	}
	return {
		sectionWidgets,
		viewsWithButtons,
		hasTitle
	};
}
function parseSection(sectionStr, calendarOptions, calendarOptionOverrides, theme, viewSpecs, calendarApi) {
	let isRtl = calendarOptions.direction === "rtl";
	let calendarCustomButtons = calendarOptions.customButtons || {};
	let calendarButtonTextOverrides = calendarOptionOverrides.buttonText || {};
	let calendarButtonText = calendarOptions.buttonText || {};
	let calendarButtonHintOverrides = calendarOptionOverrides.buttonHints || {};
	let calendarButtonHints = calendarOptions.buttonHints || {};
	let sectionSubstrs = sectionStr ? sectionStr.split(" ") : [];
	let viewsWithButtons = [];
	let hasTitle = false;
	return {
		widgets: sectionSubstrs.map((buttonGroupStr) => buttonGroupStr.split(",").map((buttonName) => {
			if (buttonName === "title") {
				hasTitle = true;
				return { buttonName };
			}
			let customButtonProps;
			let viewSpec;
			let buttonClick;
			let buttonIcon;
			let buttonText;
			let buttonHint;
			if (customButtonProps = calendarCustomButtons[buttonName]) {
				buttonClick = (ev) => {
					if (customButtonProps.click) customButtonProps.click.call(ev.target, ev, ev.target);
				};
				let customText = sanitizeButtonText(customButtonProps.text, buttonName);
				(buttonIcon = theme.getCustomButtonIconClass(customButtonProps)) || (buttonIcon = theme.getIconClass(buttonName, isRtl)) || (buttonText = customText);
				buttonHint = customButtonProps.hint || customText;
			} else if (viewSpec = viewSpecs[buttonName]) {
				viewsWithButtons.push(buttonName);
				buttonClick = () => {
					calendarApi.changeView(buttonName);
				};
				(buttonText = viewSpec.buttonTextOverride) || (buttonIcon = theme.getIconClass(buttonName, isRtl)) || (buttonText = viewSpec.buttonTextDefault);
				let textFallback = viewSpec.buttonTextOverride || viewSpec.buttonTextDefault;
				buttonHint = formatWithOrdinals(viewSpec.buttonTitleOverride || viewSpec.buttonTitleDefault || calendarOptions.viewHint, [textFallback, buttonName], textFallback);
			} else if (calendarApi[buttonName]) {
				buttonClick = () => {
					calendarApi[buttonName]();
				};
				(buttonText = calendarButtonTextOverrides[buttonName]) || (buttonIcon = theme.getIconClass(buttonName, isRtl)) || (buttonText = calendarButtonText[buttonName]);
				if (buttonName === "prevYear" || buttonName === "nextYear") {
					let prevOrNext = buttonName === "prevYear" ? "prev" : "next";
					buttonHint = formatWithOrdinals(calendarButtonHintOverrides[prevOrNext] || calendarButtonHints[prevOrNext], [calendarButtonText.year || "year", "year"], calendarButtonText[buttonName]);
				} else buttonHint = (navUnit) => formatWithOrdinals(calendarButtonHintOverrides[buttonName] || calendarButtonHints[buttonName], [calendarButtonText[navUnit] || navUnit, navUnit], calendarButtonText[buttonName]);
			}
			buttonText = sanitizeButtonText(buttonText, buttonName);
			return {
				buttonName,
				buttonClick,
				buttonIcon,
				buttonText,
				buttonHint
			};
		})),
		viewsWithButtons,
		hasTitle
	};
}
function sanitizeButtonText(buttonText, buttonName) {
	if (buttonText == null || typeof buttonText === "string") return buttonText;
	if (typeof buttonText === "number") return String(buttonText);
	warnOnce(`Button text must be a string (button '${buttonName}'). For custom button content, v7 supports the \`iconContent\` setting.`);
	return buttonName;
}
var ViewImpl = class {
	constructor(type, getCurrentData, dateEnv) {
		this.type = type;
		this.getCurrentData = getCurrentData;
		this.dateEnv = dateEnv;
	}
	get calendar() {
		return this.getCurrentData().calendarApi;
	}
	get title() {
		return this.getCurrentData().viewTitle;
	}
	get activeStart() {
		return this.dateEnv.toDate(this.getCurrentData().dateProfile.activeRange.start);
	}
	get activeEnd() {
		return this.dateEnv.toDate(this.getCurrentData().dateProfile.activeRange.end);
	}
	get currentStart() {
		return this.dateEnv.toDate(this.getCurrentData().dateProfile.currentRange.start);
	}
	get currentEnd() {
		return this.dateEnv.toDate(this.getCurrentData().dateProfile.currentRange.end);
	}
	getOption(name) {
		return this.getCurrentData().options[name];
	}
};
var arrayEventSourcePlugin = createPlugin({
	name: "array-event-source",
	eventSourceDefs: [{
		ignoreRange: true,
		parseMeta(refined) {
			if (Array.isArray(refined.events)) return refined.events;
			return null;
		},
		fetch(arg, successCallback) {
			successCallback({ rawEvents: arg.eventSource.meta });
		}
	}]
});
var funcEventSourcePlugin = createPlugin({
	name: "func-event-source",
	eventSourceDefs: [{
		parseMeta(refined) {
			if (typeof refined.events === "function") return refined.events;
			return null;
		},
		fetch(arg, successCallback, errorCallback) {
			const { dateEnv } = arg.context;
			const func = arg.eventSource.meta;
			unpromisify(func.bind(null, buildRangeApiWithTimeZone(arg.range, dateEnv)), (rawEvents) => successCallback({ rawEvents }), errorCallback);
		}
	}]
});
var jsonFeedEventSourcePlugin = createPlugin({
	name: "json-event-source",
	eventSourceRefiners: {
		method: String,
		extraParams: identity,
		startParam: String,
		endParam: String,
		timeZoneParam: String
	},
	eventSourceDefs: [{
		parseMeta(refined) {
			if (refined.url && (refined.format === "json" || !refined.format)) return {
				url: refined.url,
				format: "json",
				method: (refined.method || "GET").toUpperCase(),
				extraParams: refined.extraParams,
				startParam: refined.startParam,
				endParam: refined.endParam,
				timeZoneParam: refined.timeZoneParam
			};
			return null;
		},
		fetch(arg, successCallback, errorCallback) {
			const { meta } = arg.eventSource;
			const requestParams = buildRequestParams(meta, arg.range, arg.context);
			requestJson(meta.method, meta.url, requestParams).then(([rawEvents, response]) => {
				successCallback({
					rawEvents,
					response
				});
			}, errorCallback);
		}
	}]
});
function buildRequestParams(meta, range, context) {
	let { dateEnv, options } = context;
	let startParam;
	let endParam;
	let timeZoneParam;
	let customRequestParams;
	let params = {};
	startParam = meta.startParam;
	if (startParam == null) startParam = options.startParam;
	endParam = meta.endParam;
	if (endParam == null) endParam = options.endParam;
	timeZoneParam = meta.timeZoneParam;
	if (timeZoneParam == null) timeZoneParam = options.timeZoneParam;
	if (typeof meta.extraParams === "function") customRequestParams = meta.extraParams();
	else customRequestParams = meta.extraParams || {};
	Object.assign(params, customRequestParams);
	params[startParam] = dateEnv.formatIso(range.start);
	params[endParam] = dateEnv.formatIso(range.end);
	if (dateEnv.timeZone !== "local") params[timeZoneParam] = dateEnv.timeZone;
	return params;
}
var simpleRecurringEventsPlugin = createPlugin({
	name: "simple-recurring-event",
	recurringTypes: [{
		parse(refined, dateEnv) {
			if (refined.daysOfWeek || refined.startTime || refined.endTime || refined.startRecur || refined.endRecur) {
				let recurringData = {
					daysOfWeek: refined.daysOfWeek || null,
					startTime: refined.startTime || null,
					endTime: refined.endTime || null,
					startRecur: refined.startRecur ? dateEnv.createMarker(refined.startRecur) : null,
					endRecur: refined.endRecur ? dateEnv.createMarker(refined.endRecur) : null,
					dateEnv
				};
				let duration;
				if (refined.duration) duration = refined.duration;
				if (!duration && refined.startTime && refined.endTime) duration = subtractDurations(refined.endTime, refined.startTime);
				return {
					allDayGuess: Boolean(!refined.startTime && !refined.endTime),
					duration,
					typeData: recurringData
				};
			}
			return null;
		},
		expand(typeData, framingRange, dateEnv) {
			let clippedFramingRange = intersectRanges(framingRange, {
				start: typeData.startRecur,
				end: typeData.endRecur
			});
			if (clippedFramingRange) return expandRanges(typeData.daysOfWeek, typeData.startTime, typeData.dateEnv, dateEnv, clippedFramingRange);
			return [];
		}
	}],
	eventRefiners: {
		daysOfWeek: identity,
		startTime: createDuration,
		endTime: createDuration,
		duration: createDuration,
		startRecur: identity,
		endRecur: identity
	}
});
function expandRanges(daysOfWeek, startTime, eventDateEnv, calendarDateEnv, framingRange) {
	let dowHash = daysOfWeek ? arrayToHash(daysOfWeek) : null;
	let dayMarker = startOfDay(framingRange.start);
	let endMarker = framingRange.end;
	let instanceStarts = [];
	if (startTime) {
		if (startTime.milliseconds < 0) endMarker = addDays(endMarker, 1);
		else if (startTime.milliseconds >= 864e5) dayMarker = addDays(dayMarker, -1);
	}
	while (dayMarker < endMarker) {
		let instanceStart;
		if (!dowHash || dowHash[dayMarker.getUTCDay()]) {
			if (startTime) instanceStart = calendarDateEnv.add(dayMarker, startTime);
			else instanceStart = dayMarker;
			instanceStarts.push(calendarDateEnv.createMarker(eventDateEnv.toDate(instanceStart)));
		}
		dayMarker = addDays(dayMarker, 1);
	}
	return instanceStarts;
}
var changeHandlerPlugin = createPlugin({
	name: "change-handler",
	optionChangeHandlers: {
		events(events, context) {
			handleEventSources([events], context);
		},
		eventSources: handleEventSources
	}
});
function handleEventSources(inputs, context) {
	let unfoundSources = hashValuesToArray(context.getCurrentData().eventSources);
	if (unfoundSources.length === 1 && inputs.length === 1 && Array.isArray(unfoundSources[0]._raw) && Array.isArray(inputs[0])) {
		context.dispatch({
			type: "RESET_RAW_EVENTS",
			sourceId: unfoundSources[0].sourceId,
			rawEvents: inputs[0]
		});
		return;
	}
	let newInputs = [];
	for (let input of inputs) {
		let inputFound = false;
		for (let i = 0; i < unfoundSources.length; i += 1) if (unfoundSources[i]._raw === input) {
			unfoundSources.splice(i, 1);
			inputFound = true;
			break;
		}
		if (!inputFound) newInputs.push(input);
	}
	for (let unfoundSource of unfoundSources) context.dispatch({
		type: "REMOVE_EVENT_SOURCE",
		sourceId: unfoundSource.sourceId
	});
	for (let newInput of newInputs) context.calendarApi.addEventSource(newInput);
}
function handleDateProfile(dateProfile, context) {
	context.emitter.trigger("datesSet", Object.assign(Object.assign({}, buildRangeApiWithTimeZone(dateProfile.activeRange, context.dateEnv)), { view: context.viewApi }));
}
function handleEventStore(eventStore, context) {
	let { emitter } = context;
	if (emitter.hasHandlers("eventsSet")) emitter.trigger("eventsSet", buildEventApis(eventStore, context));
}
var globalPlugins = [
	arrayEventSourcePlugin,
	funcEventSourcePlugin,
	jsonFeedEventSourcePlugin,
	simpleRecurringEventsPlugin,
	changeHandlerPlugin,
	createPlugin({
		name: "misc",
		isLoadingFuncs: [(state) => computeEventSourcesLoading(state.eventSources)],
		propSetHandlers: {
			dateProfile: handleDateProfile,
			eventStore: handleEventStore
		}
	})
];
var TaskRunner = class {
	constructor(runTaskOption, drainedOption) {
		this.runTaskOption = runTaskOption;
		this.drainedOption = drainedOption;
		this.queue = [];
		this.delayedRunner = new DelayedRunner(this.drain.bind(this));
	}
	request(task, delay) {
		this.queue.push(task);
		this.delayedRunner.request(delay);
	}
	pause(scope) {
		this.delayedRunner.pause(scope);
	}
	resume(scope, force) {
		this.delayedRunner.resume(scope, force);
	}
	drain() {
		let { queue } = this;
		while (queue.length) {
			let completedTasks = [];
			let task;
			while (task = queue.shift()) {
				this.runTask(task);
				completedTasks.push(task);
			}
			this.drained(completedTasks);
		}
	}
	runTask(task) {
		if (this.runTaskOption) this.runTaskOption(task);
	}
	drained(completedTasks) {
		if (this.drainedOption) this.drainedOption(completedTasks);
	}
};
function buildTitle(dateProfile, viewOptions, dateEnv) {
	let range;
	if (/^(year|month)$/.test(dateProfile.currentRangeUnit)) range = dateProfile.currentRange;
	else range = dateProfile.activeRange;
	return dateEnv.formatRange(range.start, range.end, createFormatter(viewOptions.titleFormat || buildTitleFormat(dateProfile)), {
		isEndExclusive: dateProfile.isRangeAllDay,
		defaultSeparator: viewOptions.titleRangeSeparator
	});
}
function buildTitleFormat(dateProfile) {
	let { currentRangeUnit } = dateProfile;
	if (currentRangeUnit === "year") return { year: "numeric" };
	if (currentRangeUnit === "month") return {
		year: "numeric",
		month: "long"
	};
	let days = diffWholeDays(dateProfile.currentRange.start, dateProfile.currentRange.end);
	if (days !== null && days > 1) return {
		year: "numeric",
		month: "short",
		day: "numeric"
	};
	return {
		year: "numeric",
		month: "long",
		day: "numeric"
	};
}
var CalendarNowManager = class {
	constructor() {
		this.resetListeners = /* @__PURE__ */ new Set();
	}
	handleInput(dateEnv, nowInput) {
		const oldDateEnv = this.dateEnv;
		if (dateEnv !== oldDateEnv) {
			if (typeof nowInput === "function") this.nowFn = nowInput;
			else if (!oldDateEnv) {
				this.nowAnchorDate = dateEnv.toDate(nowInput ? dateEnv.createMarker(nowInput) : dateEnv.createNowMarker());
				this.nowAnchorQueried = Date.now();
			}
			this.dateEnv = dateEnv;
			if (oldDateEnv) for (const resetListener of this.resetListeners.values()) resetListener();
		}
	}
	getDateMarker() {
		return this.nowAnchorDate ? this.dateEnv.timestampToMarker(this.nowAnchorDate.valueOf() + (Date.now() - this.nowAnchorQueried)) : this.dateEnv.createMarker(this.nowFn());
	}
	addResetListener(handler) {
		this.resetListeners.add(handler);
	}
	removeResetListener(handler) {
		this.resetListeners.delete(handler);
	}
};
var CalendarDataManager = class {
	constructor(props) {
		this.computeCurrentViewData = memoize(this._computeCurrentViewData);
		this.organizeRawLocales = memoize(organizeRawLocales);
		this.buildLocale = memoize(buildLocale);
		this.buildPluginHooks = buildBuildPluginHooks();
		this.buildDateEnv = memoize(buildDateEnv$1);
		this.buildTheme = memoize(buildTheme);
		this.parseToolbars = memoize(parseToolbars);
		this.buildViewSpecs = memoize(buildViewSpecs);
		this.buildDateProfileGenerator = memoizeObjArg(buildDateProfileGenerator);
		this.buildViewApi = memoize(buildViewApi);
		this.buildViewUiProps = memoizeObjArg(buildViewUiProps);
		this.buildEventUiBySource = memoize(buildEventUiBySource, isPropsEqual);
		this.buildEventUiBases = memoize(buildEventUiBases);
		this.parseContextBusinessHours = memoizeObjArg(parseContextBusinessHours);
		this.buildTitle = memoize(buildTitle);
		this.nowManager = new CalendarNowManager();
		this.emitter = new Emitter();
		this.actionRunner = new TaskRunner(this._handleAction.bind(this), this.updateData.bind(this));
		this.currentCalendarOptionsInput = {};
		this.currentCalendarOptionsRefined = {};
		this.currentViewOptionsInput = {};
		this.currentViewOptionsRefined = {};
		this.currentCalendarOptionsRefiners = {};
		this.optionsForRefining = [];
		this.optionsForHandling = [];
		this.getCurrentData = () => this.data;
		this.dispatch = (action) => {
			this.actionRunner.request(action);
		};
		this.props = props;
		this.actionRunner.pause();
		this.nowManager = new CalendarNowManager();
		let dynamicOptionOverrides = {};
		let optionsData = this.computeOptionsData(props.optionOverrides, dynamicOptionOverrides, props.calendarApi);
		let currentViewType = optionsData.calendarOptions.initialView || optionsData.pluginHooks.initialView;
		let currentViewData = this.computeCurrentViewData(currentViewType, optionsData, props.optionOverrides, dynamicOptionOverrides);
		props.calendarApi.currentDataManager = this;
		this.emitter.setThisContext(props.calendarApi);
		this.emitter.setOptions(currentViewData.options);
		let calendarContext = {
			nowManager: this.nowManager,
			dateEnv: optionsData.dateEnv,
			options: optionsData.calendarOptions,
			pluginHooks: optionsData.pluginHooks,
			calendarApi: props.calendarApi,
			dispatch: this.dispatch,
			emitter: this.emitter,
			getCurrentData: this.getCurrentData
		};
		let currentDate = getInitialDate(optionsData.calendarOptions, optionsData.dateEnv, this.nowManager);
		let dateProfile = currentViewData.dateProfileGenerator.build(currentDate);
		if (!rangeContainsMarker(dateProfile.activeRange, currentDate)) currentDate = dateProfile.currentRange.start;
		for (let callback of optionsData.pluginHooks.contextInit) callback(calendarContext);
		let eventSources = initEventSources(optionsData.calendarOptions, dateProfile, calendarContext);
		let initialState = {
			dynamicOptionOverrides,
			currentViewType,
			currentDate,
			dateProfile,
			businessHours: this.parseContextBusinessHours(calendarContext),
			eventSources,
			eventUiBases: {},
			eventStore: createEmptyEventStore(),
			renderableEventStore: createEmptyEventStore(),
			dateSelection: null,
			eventSelection: "",
			eventDrag: null,
			eventResize: null,
			selectionConfig: this.buildViewUiProps(calendarContext).selectionConfig
		};
		let contextAndState = Object.assign(Object.assign({}, calendarContext), initialState);
		for (let reducer of optionsData.pluginHooks.reducers) Object.assign(initialState, reducer(null, null, contextAndState));
		if (computeIsLoading(initialState, calendarContext)) this.emitter.trigger("loading", true);
		this.state = initialState;
		this.updateData();
		this.actionRunner.resume();
	}
	resetOptions(optionOverrides, changedOptionNames) {
		let { props } = this;
		if (changedOptionNames === void 0) props.optionOverrides = optionOverrides;
		else {
			props.optionOverrides = Object.assign(Object.assign({}, props.optionOverrides || {}), optionOverrides);
			this.optionsForRefining.push(...changedOptionNames);
		}
		if (changedOptionNames === void 0 || changedOptionNames.length) this.actionRunner.request({ type: "NOTHING" });
	}
	_handleAction(action) {
		let { props, state, emitter } = this;
		let dynamicOptionOverrides = reduceDynamicOptionOverrides(state.dynamicOptionOverrides, action);
		let optionsData = this.computeOptionsData(props.optionOverrides, dynamicOptionOverrides, props.calendarApi);
		let currentViewType = reduceViewType(state.currentViewType, action);
		let currentViewData = this.computeCurrentViewData(currentViewType, optionsData, props.optionOverrides, dynamicOptionOverrides);
		props.calendarApi.currentDataManager = this;
		emitter.setThisContext(props.calendarApi);
		emitter.setOptions(currentViewData.options);
		let calendarContext = {
			nowManager: this.nowManager,
			dateEnv: optionsData.dateEnv,
			options: optionsData.calendarOptions,
			pluginHooks: optionsData.pluginHooks,
			calendarApi: props.calendarApi,
			dispatch: this.dispatch,
			emitter,
			getCurrentData: this.getCurrentData
		};
		let { currentDate, dateProfile } = state;
		if (this.data && this.data.dateProfileGenerator !== currentViewData.dateProfileGenerator) dateProfile = currentViewData.dateProfileGenerator.build(currentDate);
		currentDate = reduceCurrentDate(currentDate, action);
		dateProfile = reduceDateProfile(dateProfile, action, currentDate, currentViewData.dateProfileGenerator);
		if (action.type === "PREV" || action.type === "NEXT" || !rangeContainsMarker(dateProfile.currentRange, currentDate)) currentDate = dateProfile.currentRange.start;
		let eventSources = reduceEventSources(state.eventSources, action, dateProfile, calendarContext);
		let eventStore = reduceEventStore(state.eventStore, action, eventSources, dateProfile, calendarContext);
		let renderableEventStore = computeEventSourcesLoading(eventSources) && !currentViewData.options.progressiveEventRendering ? state.renderableEventStore || eventStore : eventStore;
		let { eventUiSingleBase, selectionConfig } = this.buildViewUiProps(calendarContext);
		let eventUiBySource = this.buildEventUiBySource(eventSources);
		let eventUiBases = this.buildEventUiBases(renderableEventStore.defs, eventUiSingleBase, eventUiBySource);
		let newState = {
			dynamicOptionOverrides,
			currentViewType,
			currentDate,
			dateProfile,
			eventSources,
			eventStore,
			renderableEventStore,
			selectionConfig,
			eventUiBases,
			businessHours: this.parseContextBusinessHours(calendarContext),
			dateSelection: reduceDateSelection(state.dateSelection, action),
			eventSelection: reduceSelectedEvent(state.eventSelection, action),
			eventDrag: reduceEventDrag(state.eventDrag, action),
			eventResize: reduceEventResize(state.eventResize, action)
		};
		let contextAndState = Object.assign(Object.assign({}, calendarContext), newState);
		for (let reducer of optionsData.pluginHooks.reducers) Object.assign(newState, reducer(state, action, contextAndState));
		let wasLoading = computeIsLoading(state, calendarContext);
		let isLoading = computeIsLoading(newState, calendarContext);
		if (!wasLoading && isLoading) emitter.trigger("loading", true);
		else if (wasLoading && !isLoading) emitter.trigger("loading", false);
		this.state = newState;
		if (props.onAction) props.onAction(action);
	}
	updateData() {
		let { props, state } = this;
		let oldData = this.data;
		let optionsData = this.computeOptionsData(props.optionOverrides, state.dynamicOptionOverrides, props.calendarApi);
		let currentViewData = this.computeCurrentViewData(state.currentViewType, optionsData, props.optionOverrides, state.dynamicOptionOverrides);
		let data = this.data = Object.assign(Object.assign(Object.assign({
			nowManager: this.nowManager,
			viewTitle: this.buildTitle(state.dateProfile, currentViewData.options, optionsData.dateEnv),
			calendarApi: props.calendarApi,
			dispatch: this.dispatch,
			emitter: this.emitter,
			getCurrentData: this.getCurrentData
		}, optionsData), currentViewData), state);
		let changeHandlers = optionsData.pluginHooks.optionChangeHandlers;
		let oldCalendarOptions = oldData && oldData.calendarOptions;
		let newCalendarOptions = optionsData.calendarOptions;
		if (oldCalendarOptions && oldCalendarOptions !== newCalendarOptions) {
			if (oldCalendarOptions.timeZone !== newCalendarOptions.timeZone) {
				state.eventSources = data.eventSources = reduceEventSourcesNewTimeZone(data.eventSources, state.dateProfile, data);
				state.eventStore = data.eventStore = rezoneEventStoreDates(data.eventStore, oldData.dateEnv, data.dateEnv);
				state.renderableEventStore = data.renderableEventStore = rezoneEventStoreDates(data.renderableEventStore, oldData.dateEnv, data.dateEnv);
			}
			for (let optionName in changeHandlers) if (this.optionsForHandling.indexOf(optionName) !== -1 || oldCalendarOptions[optionName] !== newCalendarOptions[optionName]) changeHandlers[optionName](newCalendarOptions[optionName], data);
		}
		this.optionsForHandling = [];
		if (props.onData) props.onData(data);
	}
	computeOptionsData(optionOverrides, dynamicOptionOverrides, calendarApi) {
		if (!this.optionsForRefining.length && optionOverrides === this.stableOptionOverrides && dynamicOptionOverrides === this.stableDynamicOptionOverrides) return this.stableCalendarOptionsData;
		let { refinedOptions, pluginHooks, localeDefaults, availableLocaleData, extra } = this.processRawCalendarOptions(optionOverrides, dynamicOptionOverrides);
		warnUnknownOptions(extra);
		let dateEnv = this.buildDateEnv(refinedOptions.timeZone, refinedOptions.locale, refinedOptions.weekNumberCalculation, refinedOptions.firstDay, refinedOptions.weekText, pluginHooks, availableLocaleData, refinedOptions.defaultRangeSeparator);
		let viewSpecs = this.buildViewSpecs(pluginHooks.views, this.stableOptionOverrides, this.stableDynamicOptionOverrides, localeDefaults);
		let theme = this.buildTheme(refinedOptions, pluginHooks);
		let toolbarConfig = this.parseToolbars(refinedOptions, this.stableOptionOverrides, theme, viewSpecs, calendarApi);
		return this.stableCalendarOptionsData = {
			calendarOptions: refinedOptions,
			pluginHooks,
			dateEnv,
			viewSpecs,
			theme,
			toolbarConfig,
			localeDefaults,
			availableRawLocales: availableLocaleData.map
		};
	}
	processRawCalendarOptions(optionOverrides, dynamicOptionOverrides) {
		let { locales, locale } = mergeRawOptions([
			BASE_OPTION_DEFAULTS,
			optionOverrides,
			dynamicOptionOverrides
		]);
		let availableLocaleData = this.organizeRawLocales(locales);
		let availableRawLocales = availableLocaleData.map;
		let localeDefaults = this.buildLocale(locale || availableLocaleData.defaultCode, availableRawLocales).options;
		let pluginHooks = this.buildPluginHooks(optionOverrides.plugins || [], globalPlugins);
		let refiners = this.currentCalendarOptionsRefiners = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, BASE_OPTION_REFINERS), CALENDAR_LISTENER_REFINERS), CALENDAR_OPTION_REFINERS), pluginHooks.listenerRefiners), pluginHooks.optionRefiners);
		let extra = {};
		let raw = mergeRawOptions([
			BASE_OPTION_DEFAULTS,
			localeDefaults,
			optionOverrides,
			dynamicOptionOverrides
		]);
		let refined = {};
		let currentRaw = this.currentCalendarOptionsInput;
		let currentRefined = this.currentCalendarOptionsRefined;
		let anyChanges = false;
		for (let optionName in raw) if (this.optionsForRefining.indexOf(optionName) === -1 && (raw[optionName] === currentRaw[optionName] || COMPLEX_OPTION_COMPARATORS[optionName] && optionName in currentRaw && COMPLEX_OPTION_COMPARATORS[optionName](currentRaw[optionName], raw[optionName]))) refined[optionName] = currentRefined[optionName];
		else if (refiners[optionName]) {
			refined[optionName] = refiners[optionName](raw[optionName]);
			anyChanges = true;
		} else extra[optionName] = currentRaw[optionName];
		if (anyChanges) {
			this.currentCalendarOptionsInput = raw;
			this.currentCalendarOptionsRefined = refined;
			this.stableOptionOverrides = optionOverrides;
			this.stableDynamicOptionOverrides = dynamicOptionOverrides;
		}
		this.optionsForHandling.push(...this.optionsForRefining);
		this.optionsForRefining = [];
		return {
			rawOptions: this.currentCalendarOptionsInput,
			refinedOptions: this.currentCalendarOptionsRefined,
			pluginHooks,
			availableLocaleData,
			localeDefaults,
			extra
		};
	}
	_computeCurrentViewData(viewType, optionsData, optionOverrides, dynamicOptionOverrides) {
		let viewSpec = optionsData.viewSpecs[viewType];
		if (!viewSpec) throw new Error(`viewType "${viewType}" is not available. Please make sure you've loaded all neccessary plugins`);
		let { refinedOptions, extra } = this.processRawViewOptions(viewSpec, optionsData.pluginHooks, optionsData.localeDefaults, optionOverrides, dynamicOptionOverrides);
		warnUnknownOptions(extra);
		this.nowManager.handleInput(optionsData.dateEnv, refinedOptions.now);
		return {
			viewSpec,
			options: refinedOptions,
			dateProfileGenerator: this.buildDateProfileGenerator({
				dateProfileGeneratorClass: viewSpec.optionDefaults.dateProfileGeneratorClass,
				nowManager: this.nowManager,
				duration: viewSpec.duration,
				durationUnit: viewSpec.durationUnit,
				usesMinMaxTime: viewSpec.optionDefaults.usesMinMaxTime,
				dateEnv: optionsData.dateEnv,
				calendarApi: this.props.calendarApi,
				slotMinTime: refinedOptions.slotMinTime,
				slotMaxTime: refinedOptions.slotMaxTime,
				showNonCurrentDates: refinedOptions.showNonCurrentDates,
				dayCount: refinedOptions.dayCount,
				dateAlignment: refinedOptions.dateAlignment,
				dateIncrement: refinedOptions.dateIncrement,
				hiddenDays: refinedOptions.hiddenDays,
				weekends: refinedOptions.weekends,
				validRangeInput: refinedOptions.validRange,
				visibleRangeInput: refinedOptions.visibleRange,
				fixedWeekCount: refinedOptions.fixedWeekCount
			}),
			viewApi: this.buildViewApi(viewType, this.getCurrentData, optionsData.dateEnv)
		};
	}
	processRawViewOptions(viewSpec, pluginHooks, localeDefaults, optionOverrides, dynamicOptionOverrides) {
		let raw = mergeRawOptions([
			BASE_OPTION_DEFAULTS,
			viewSpec.optionDefaults,
			localeDefaults,
			optionOverrides,
			viewSpec.optionOverrides,
			dynamicOptionOverrides
		]);
		let refiners = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, BASE_OPTION_REFINERS), CALENDAR_LISTENER_REFINERS), CALENDAR_OPTION_REFINERS), VIEW_OPTION_REFINERS), pluginHooks.listenerRefiners), pluginHooks.optionRefiners);
		let refined = {};
		let currentRaw = this.currentViewOptionsInput;
		let currentRefined = this.currentViewOptionsRefined;
		let anyChanges = false;
		let extra = {};
		for (let optionName in raw) if (raw[optionName] === currentRaw[optionName] || COMPLEX_OPTION_COMPARATORS[optionName] && COMPLEX_OPTION_COMPARATORS[optionName](raw[optionName], currentRaw[optionName])) refined[optionName] = currentRefined[optionName];
		else {
			if (raw[optionName] === this.currentCalendarOptionsInput[optionName] || COMPLEX_OPTION_COMPARATORS[optionName] && COMPLEX_OPTION_COMPARATORS[optionName](raw[optionName], this.currentCalendarOptionsInput[optionName])) {
				if (optionName in this.currentCalendarOptionsRefined) refined[optionName] = this.currentCalendarOptionsRefined[optionName];
			} else if (refiners[optionName]) refined[optionName] = refiners[optionName](raw[optionName]);
			else extra[optionName] = raw[optionName];
			anyChanges = true;
		}
		if (anyChanges) {
			this.currentViewOptionsInput = raw;
			this.currentViewOptionsRefined = refined;
		}
		return {
			rawOptions: this.currentViewOptionsInput,
			refinedOptions: this.currentViewOptionsRefined,
			extra
		};
	}
};
function buildDateEnv$1(timeZone, explicitLocale, weekNumberCalculation, firstDay, weekText, pluginHooks, availableLocaleData, defaultSeparator) {
	let locale = buildLocale(explicitLocale || availableLocaleData.defaultCode, availableLocaleData.map);
	return new DateEnv({
		calendarSystem: "gregory",
		timeZone,
		namedTimeZoneImpl: pluginHooks.namedTimeZonedImpl,
		locale,
		weekNumberCalculation,
		firstDay,
		weekText,
		cmdFormatter: pluginHooks.cmdFormatter,
		defaultSeparator
	});
}
function buildTheme(options, pluginHooks) {
	return new (pluginHooks.themeClasses[options.themeSystem] || StandardTheme)(options);
}
function buildDateProfileGenerator(props) {
	return new (props.dateProfileGeneratorClass || DateProfileGenerator)(props);
}
function buildViewApi(type, getCurrentData, dateEnv) {
	return new ViewImpl(type, getCurrentData, dateEnv);
}
function buildEventUiBySource(eventSources) {
	return mapHash(eventSources, (eventSource) => eventSource.ui);
}
function buildEventUiBases(eventDefs, eventUiSingleBase, eventUiBySource) {
	let eventUiBases = { "": eventUiSingleBase };
	for (let defId in eventDefs) {
		let def = eventDefs[defId];
		if (def.sourceId && eventUiBySource[def.sourceId]) eventUiBases[defId] = eventUiBySource[def.sourceId];
	}
	return eventUiBases;
}
function buildViewUiProps(calendarContext) {
	let { options } = calendarContext;
	return {
		eventUiSingleBase: createEventUi({
			display: options.eventDisplay,
			editable: options.editable,
			startEditable: options.eventStartEditable,
			durationEditable: options.eventDurationEditable,
			constraint: options.eventConstraint,
			overlap: typeof options.eventOverlap === "boolean" ? options.eventOverlap : void 0,
			allow: options.eventAllow,
			backgroundColor: options.eventBackgroundColor,
			borderColor: options.eventBorderColor,
			textColor: options.eventTextColor,
			color: options.eventColor
		}, calendarContext),
		selectionConfig: createEventUi({
			constraint: options.selectConstraint,
			overlap: typeof options.selectOverlap === "boolean" ? options.selectOverlap : void 0,
			allow: options.selectAllow
		}, calendarContext)
	};
}
function computeIsLoading(state, context) {
	for (let isLoadingFunc of context.pluginHooks.isLoadingFuncs) if (isLoadingFunc(state)) return true;
	return false;
}
function parseContextBusinessHours(calendarContext) {
	return parseBusinessHours(calendarContext.options.businessHours, calendarContext);
}
function warnUnknownOptions(options, viewName) {
	for (let optionName in options) console.warn(`Unknown option '${optionName}'` + (viewName ? ` for view '${viewName}'` : ""));
}
var ToolbarSection = class extends BaseComponent {
	render() {
		return y("div", { className: "fc-toolbar-chunk" }, ...this.props.widgetGroups.map((widgetGroup) => this.renderWidgetGroup(widgetGroup)));
	}
	renderWidgetGroup(widgetGroup) {
		let { props } = this;
		let { theme } = this.context;
		let children = [];
		let isOnlyButtons = true;
		for (let widget of widgetGroup) {
			let { buttonName, buttonClick, buttonText, buttonIcon, buttonHint } = widget;
			if (buttonName === "title") {
				isOnlyButtons = false;
				children.push(y("h2", {
					className: "fc-toolbar-title",
					id: props.titleId
				}, props.title));
			} else {
				let isPressed = buttonName === props.activeButton;
				let isDisabled = !props.isTodayEnabled && buttonName === "today" || !props.isPrevEnabled && buttonName === "prev" || !props.isNextEnabled && buttonName === "next";
				let buttonClasses = [`fc-${buttonName}-button`, theme.getClass("button")];
				if (isPressed) buttonClasses.push(theme.getClass("buttonActive"));
				children.push(y("button", {
					type: "button",
					title: typeof buttonHint === "function" ? buttonHint(props.navUnit) : buttonHint,
					disabled: isDisabled,
					"aria-pressed": isPressed,
					className: buttonClasses.join(" "),
					onClick: buttonClick
				}, buttonText || (buttonIcon ? y("span", {
					className: buttonIcon,
					role: "img"
				}) : "")));
			}
		}
		if (children.length > 1) return y("div", { className: isOnlyButtons && theme.getClass("buttonGroup") || "" }, ...children);
		return children[0];
	}
};
var Toolbar = class extends BaseComponent {
	render() {
		let { model, extraClassName } = this.props;
		let forceLtr = false;
		let startContent;
		let endContent;
		let sectionWidgets = model.sectionWidgets;
		let centerContent = sectionWidgets.center;
		if (sectionWidgets.left) {
			forceLtr = true;
			startContent = sectionWidgets.left;
		} else startContent = sectionWidgets.start;
		if (sectionWidgets.right) {
			forceLtr = true;
			endContent = sectionWidgets.right;
		} else endContent = sectionWidgets.end;
		return y("div", { className: [
			extraClassName || "",
			"fc-toolbar",
			forceLtr ? "fc-toolbar-ltr" : ""
		].join(" ") }, this.renderSection("start", startContent || []), this.renderSection("center", centerContent || []), this.renderSection("end", endContent || []));
	}
	renderSection(key, widgetGroups) {
		let { props } = this;
		return y(ToolbarSection, {
			key,
			widgetGroups,
			title: props.title,
			navUnit: props.navUnit,
			activeButton: props.activeButton,
			isTodayEnabled: props.isTodayEnabled,
			isPrevEnabled: props.isPrevEnabled,
			isNextEnabled: props.isNextEnabled,
			titleId: props.titleId
		});
	}
};
var ViewHarness = class extends BaseComponent {
	constructor() {
		super(...arguments);
		this.state = { availableWidth: null };
		this.handleEl = (el) => {
			this.el = el;
			setRef(this.props.elRef, el);
			this.updateAvailableWidth();
		};
		this.handleResize = () => {
			this.updateAvailableWidth();
		};
	}
	render() {
		let { props, state } = this;
		let { aspectRatio } = props;
		let classNames = ["fc-view-harness", aspectRatio || props.liquid || props.height ? "fc-view-harness-active" : "fc-view-harness-passive"];
		let height = "";
		let paddingBottom = "";
		if (aspectRatio) if (state.availableWidth !== null) height = state.availableWidth / aspectRatio;
		else paddingBottom = `${1 / aspectRatio * 100}%`;
		else height = props.height || "";
		return y("div", {
			"aria-labelledby": props.labeledById,
			ref: this.handleEl,
			className: classNames.join(" "),
			style: {
				height,
				paddingBottom
			}
		}, props.children);
	}
	componentDidMount() {
		this.context.addResizeHandler(this.handleResize);
	}
	componentWillUnmount() {
		this.context.removeResizeHandler(this.handleResize);
	}
	updateAvailableWidth() {
		if (this.el && this.props.aspectRatio) this.setState({ availableWidth: this.el.offsetWidth });
	}
};
var EventClicking = class extends Interaction {
	constructor(settings) {
		super(settings);
		this.handleSegClick = (ev, segEl) => {
			let { component } = this;
			let { context } = component;
			let seg = getElSeg(segEl);
			if (seg && component.isValidSegDownEl(ev.target)) {
				let hasUrlContainer = elementClosest(ev.target, ".fc-event-forced-url");
				let url = "";
				if (hasUrlContainer) {
					let anchorEl = hasUrlContainer.querySelector("a[href]");
					url = anchorEl ? anchorEl.href : seg.eventRange.def.url;
				}
				context.emitter.trigger("eventClick", {
					el: segEl,
					event: new EventImpl(component.context, seg.eventRange.def, seg.eventRange.instance),
					jsEvent: ev,
					view: context.viewApi
				});
				if (url && !ev.defaultPrevented) window.location.href = url;
			}
		};
		this.destroy = listenBySelector(settings.el, "click", ".fc-event", this.handleSegClick);
	}
};
var EventHovering = class extends Interaction {
	constructor(settings) {
		super(settings);
		this.handleEventElRemove = (el) => {
			if (el === this.currentSegEl) this.handleSegLeave(null, this.currentSegEl);
		};
		this.handleSegEnter = (ev, segEl) => {
			if (getElSeg(segEl)) {
				this.currentSegEl = segEl;
				this.triggerEvent("eventMouseEnter", ev, segEl);
			}
		};
		this.handleSegLeave = (ev, segEl) => {
			if (this.currentSegEl) {
				this.currentSegEl = null;
				this.triggerEvent("eventMouseLeave", ev, segEl);
			}
		};
		this.removeHoverListeners = listenToHoverBySelector(settings.el, ".fc-event", this.handleSegEnter, this.handleSegLeave);
	}
	destroy() {
		this.removeHoverListeners();
	}
	triggerEvent(publicEvName, ev, segEl) {
		let { component } = this;
		let { context } = component;
		let seg = getElSeg(segEl);
		if (!ev || component.isValidSegDownEl(ev.target)) context.emitter.trigger(publicEvName, {
			el: segEl,
			event: new EventImpl(context, seg.eventRange.def, seg.eventRange.instance),
			jsEvent: ev,
			view: context.viewApi
		});
	}
};
var CalendarContent = class extends PureComponent$1 {
	constructor() {
		super(...arguments);
		this.buildViewContext = memoize(buildViewContext);
		this.buildViewPropTransformers = memoize(buildViewPropTransformers);
		this.buildToolbarProps = memoize(buildToolbarProps);
		this.headerRef = d();
		this.footerRef = d();
		this.interactionsStore = {};
		this.state = { viewLabelId: getUniqueDomId() };
		this.registerInteractiveComponent = (component, settingsInput) => {
			let settings = parseInteractionSettings(component, settingsInput);
			let interactions = [EventClicking, EventHovering].concat(this.props.pluginHooks.componentInteractions).map((TheInteractionClass) => new TheInteractionClass(settings));
			this.interactionsStore[component.uid] = interactions;
			interactionSettingsStore[component.uid] = settings;
		};
		this.unregisterInteractiveComponent = (component) => {
			let listeners = this.interactionsStore[component.uid];
			if (listeners) {
				for (let listener of listeners) listener.destroy();
				delete this.interactionsStore[component.uid];
			}
			delete interactionSettingsStore[component.uid];
		};
		this.resizeRunner = new DelayedRunner(() => {
			this.props.emitter.trigger("_resize", true);
			this.props.emitter.trigger("windowResize", { view: this.props.viewApi });
		});
		this.handleWindowResize = (ev) => {
			let { options } = this.props;
			if (options.handleWindowResize && ev.target === window) this.resizeRunner.request(options.windowResizeDelay);
		};
	}
	render() {
		let { props } = this;
		let { toolbarConfig, options } = props;
		let viewVGrow = false;
		let viewHeight = "";
		let viewAspectRatio;
		if (props.isHeightAuto || props.forPrint) viewHeight = "";
		else if (options.height != null) viewVGrow = true;
		else if (options.contentHeight != null) viewHeight = options.contentHeight;
		else viewAspectRatio = Math.max(options.aspectRatio, .5);
		let viewContext = this.buildViewContext(props.viewSpec, props.viewApi, props.options, props.dateProfileGenerator, props.dateEnv, props.nowManager, props.theme, props.pluginHooks, props.dispatch, props.getCurrentData, props.emitter, props.calendarApi, this.registerInteractiveComponent, this.unregisterInteractiveComponent);
		let viewLabelId = toolbarConfig.header && toolbarConfig.header.hasTitle ? this.state.viewLabelId : void 0;
		return y(ViewContextType.Provider, { value: viewContext }, y(NowTimer, { unit: "day" }, (nowDate) => {
			let toolbarProps = this.buildToolbarProps(props.viewSpec, props.dateProfile, props.dateProfileGenerator, props.currentDate, nowDate, props.viewTitle);
			return y(_, null, toolbarConfig.header && y(Toolbar, Object.assign({
				ref: this.headerRef,
				extraClassName: "fc-header-toolbar",
				model: toolbarConfig.header,
				titleId: viewLabelId
			}, toolbarProps)), y(ViewHarness, {
				liquid: viewVGrow,
				height: viewHeight,
				aspectRatio: viewAspectRatio,
				labeledById: viewLabelId
			}, this.renderView(props), this.buildAppendContent()), toolbarConfig.footer && y(Toolbar, Object.assign({
				ref: this.footerRef,
				extraClassName: "fc-footer-toolbar",
				model: toolbarConfig.footer,
				titleId: ""
			}, toolbarProps)));
		}));
	}
	componentDidMount() {
		let { props } = this;
		this.calendarInteractions = props.pluginHooks.calendarInteractions.map((CalendarInteractionClass) => new CalendarInteractionClass(props));
		window.addEventListener("resize", this.handleWindowResize);
		let { propSetHandlers } = props.pluginHooks;
		for (let propName in propSetHandlers) propSetHandlers[propName](props[propName], props);
	}
	componentDidUpdate(prevProps) {
		let { props } = this;
		let { propSetHandlers } = props.pluginHooks;
		for (let propName in propSetHandlers) if (props[propName] !== prevProps[propName]) propSetHandlers[propName](props[propName], props);
	}
	componentWillUnmount() {
		window.removeEventListener("resize", this.handleWindowResize);
		this.resizeRunner.clear();
		for (let interaction of this.calendarInteractions) interaction.destroy();
		this.props.emitter.trigger("_unmount");
	}
	buildAppendContent() {
		let { props } = this;
		return y(_, {}, ...props.pluginHooks.viewContainerAppends.map((buildAppendContent) => buildAppendContent(props)));
	}
	renderView(props) {
		let { pluginHooks } = props;
		let { viewSpec } = props;
		let viewProps = {
			dateProfile: props.dateProfile,
			businessHours: props.businessHours,
			eventStore: props.renderableEventStore,
			eventUiBases: props.eventUiBases,
			dateSelection: props.dateSelection,
			eventSelection: props.eventSelection,
			eventDrag: props.eventDrag,
			eventResize: props.eventResize,
			isHeightAuto: props.isHeightAuto,
			forPrint: props.forPrint
		};
		let transformers = this.buildViewPropTransformers(pluginHooks.viewPropsTransformers);
		for (let transformer of transformers) Object.assign(viewProps, transformer.transform(viewProps, props));
		let ViewComponent = viewSpec.component;
		return y(ViewComponent, Object.assign({}, viewProps));
	}
};
function buildToolbarProps(viewSpec, dateProfile, dateProfileGenerator, currentDate, now, title) {
	let todayInfo = dateProfileGenerator.build(now, void 0, false);
	let prevInfo = dateProfileGenerator.buildPrev(dateProfile, currentDate, false);
	let nextInfo = dateProfileGenerator.buildNext(dateProfile, currentDate, false);
	return {
		title,
		activeButton: viewSpec.type,
		navUnit: viewSpec.singleUnit,
		isTodayEnabled: todayInfo.isValid && !rangeContainsMarker(dateProfile.currentRange, now),
		isPrevEnabled: prevInfo.isValid,
		isNextEnabled: nextInfo.isValid
	};
}
function buildViewPropTransformers(theClasses) {
	return theClasses.map((TheClass) => new TheClass());
}
var Calendar = class extends CalendarImpl {
	constructor(el, optionOverrides = {}) {
		super();
		this.isRendering = false;
		this.isRendered = false;
		this.currentClassNames = [];
		this.customContentRenderId = 0;
		this.handleAction = (action) => {
			switch (action.type) {
				case "SET_EVENT_DRAG":
				case "SET_EVENT_RESIZE": this.renderRunner.tryDrain();
			}
		};
		this.handleData = (data) => {
			this.currentData = data;
			this.renderRunner.request(data.calendarOptions.rerenderDelay);
		};
		this.handleRenderRequest = () => {
			if (this.isRendering) {
				this.isRendered = true;
				let { currentData } = this;
				flushSync$1(() => {
					D$1(y(CalendarRoot, {
						options: currentData.calendarOptions,
						theme: currentData.theme,
						emitter: currentData.emitter
					}, (classNames, height, isHeightAuto, forPrint) => {
						this.setClassNames(classNames);
						this.setHeight(height);
						return y(RenderId.Provider, { value: this.customContentRenderId }, y(CalendarContent, Object.assign({
							isHeightAuto,
							forPrint
						}, currentData)));
					}), this.el);
				});
			} else if (this.isRendered) {
				this.isRendered = false;
				D$1(null, this.el);
				this.setClassNames([]);
				this.setHeight("");
			}
		};
		ensureElHasStyles(el);
		this.el = el;
		this.renderRunner = new DelayedRunner(this.handleRenderRequest);
		new CalendarDataManager({
			optionOverrides,
			calendarApi: this,
			onAction: this.handleAction,
			onData: this.handleData
		});
	}
	render() {
		let wasRendering = this.isRendering;
		if (!wasRendering) this.isRendering = true;
		else this.customContentRenderId += 1;
		this.renderRunner.request();
		if (wasRendering) this.updateSize();
	}
	destroy() {
		if (this.isRendering) {
			this.isRendering = false;
			this.renderRunner.request();
		}
	}
	updateSize() {
		flushSync$1(() => {
			super.updateSize();
		});
	}
	batchRendering(func) {
		this.renderRunner.pause("batchRendering");
		func();
		this.renderRunner.resume("batchRendering");
	}
	pauseRendering() {
		this.renderRunner.pause("pauseRendering");
	}
	resumeRendering() {
		this.renderRunner.resume("pauseRendering", true);
	}
	resetOptions(optionOverrides, changedOptionNames) {
		this.currentDataManager.resetOptions(optionOverrides, changedOptionNames);
	}
	setClassNames(classNames) {
		if (!isArraysEqual(classNames, this.currentClassNames)) {
			let { classList } = this.el;
			for (let className of this.currentClassNames) classList.remove(className);
			for (let className of classNames) classList.add(className);
			this.currentClassNames = classNames;
		}
	}
	setHeight(height) {
		applyStyleProp(this.el, "height", height);
	}
};
//#endregion
//#region node_modules/@fullcalendar/react/dist/index.js
var syncRenderingByDefault = parseInt(String("19.3.1").split(".")[0]) < 18;
var FullCalendar = class extends import_react.Component {
	constructor() {
		super(...arguments);
		this.elRef = (0, import_react.createRef)();
		this.isUpdating = false;
		this.isUnmounting = false;
		this.state = { customRenderingMap: /* @__PURE__ */ new Map() };
		this.requestResize = () => {
			if (!this.isUnmounting) {
				this.cancelResize();
				this.resizeId = requestAnimationFrame(() => {
					this.doResize();
				});
			}
		};
	}
	render() {
		const customRenderingNodes = [];
		for (const customRendering of this.state.customRenderingMap.values()) customRenderingNodes.push(import_react.createElement(CustomRenderingComponent, {
			key: customRendering.id,
			customRendering
		}));
		return import_react.createElement("div", { ref: this.elRef }, customRenderingNodes);
	}
	componentDidMount() {
		this.isUnmounting = false;
		const customRenderingStore = new CustomRenderingStore();
		this.handleCustomRendering = customRenderingStore.handle.bind(customRenderingStore);
		this.calendar = new Calendar(this.elRef.current, Object.assign(Object.assign({}, this.props), { handleCustomRendering: this.handleCustomRendering }));
		this.calendar.render();
		this.calendar.on("_beforeprint", () => {
			(0, import_react_dom.flushSync)(() => {});
		});
		let lastRequestTimestamp;
		customRenderingStore.subscribe((customRenderingMap) => {
			const requestTimestamp = Date.now();
			const isMounting = !lastRequestTimestamp;
			(syncRenderingByDefault || isMounting || this.isUpdating || this.isUnmounting || requestTimestamp - lastRequestTimestamp < 100 ? runNow : import_react_dom.flushSync)(() => {
				this.setState({ customRenderingMap }, () => {
					lastRequestTimestamp = requestTimestamp;
					if (isMounting) this.doResize();
					else this.requestResize();
				});
			});
		});
	}
	componentDidUpdate() {
		this.isUpdating = true;
		this.calendar.resetOptions(Object.assign(Object.assign({}, this.props), { handleCustomRendering: this.handleCustomRendering }));
		this.isUpdating = false;
	}
	componentWillUnmount() {
		this.isUnmounting = true;
		this.cancelResize();
		this.calendar.destroy();
	}
	doResize() {
		this.calendar.updateSize();
	}
	cancelResize() {
		if (this.resizeId !== void 0) {
			cancelAnimationFrame(this.resizeId);
			this.resizeId = void 0;
		}
	}
	getApi() {
		return this.calendar;
	}
};
FullCalendar.act = runNow;
var CustomRenderingComponent = class extends import_react.PureComponent {
	render() {
		const { customRendering } = this.props;
		const { generatorMeta } = customRendering;
		const vnode = typeof generatorMeta === "function" ? generatorMeta(customRendering.renderProps) : generatorMeta;
		return (0, import_react_dom.createPortal)(vnode, customRendering.containerEl);
	}
};
function runNow(f) {
	f();
}
//#endregion
//#region node_modules/@fullcalendar/daygrid/internal.js
var TableView = class extends DateComponent {
	constructor() {
		super(...arguments);
		this.headerElRef = d();
	}
	renderSimpleLayout(headerRowContent, bodyContent) {
		let { props, context } = this;
		let sections = [];
		let stickyHeaderDates = getStickyHeaderDates(context.options);
		if (headerRowContent) sections.push({
			type: "header",
			key: "header",
			isSticky: stickyHeaderDates,
			chunk: {
				elRef: this.headerElRef,
				tableClassName: "fc-col-header",
				rowContent: headerRowContent
			}
		});
		sections.push({
			type: "body",
			key: "body",
			liquid: true,
			chunk: { content: bodyContent }
		});
		return y(ViewContainer, {
			elClasses: ["fc-daygrid"],
			viewSpec: context.viewSpec
		}, y(SimpleScrollGrid, {
			liquid: !props.isHeightAuto && !props.forPrint,
			collapsibleWidth: props.forPrint,
			cols: [],
			sections
		}));
	}
	renderHScrollLayout(headerRowContent, bodyContent, colCnt, dayMinWidth) {
		let ScrollGrid = this.context.pluginHooks.scrollGridImpl;
		if (!ScrollGrid) throw new Error("No ScrollGrid implementation");
		let { props, context } = this;
		let stickyHeaderDates = !props.forPrint && getStickyHeaderDates(context.options);
		let stickyFooterScrollbar = !props.forPrint && getStickyFooterScrollbar(context.options);
		let sections = [];
		if (headerRowContent) sections.push({
			type: "header",
			key: "header",
			isSticky: stickyHeaderDates,
			chunks: [{
				key: "main",
				elRef: this.headerElRef,
				tableClassName: "fc-col-header",
				rowContent: headerRowContent
			}]
		});
		sections.push({
			type: "body",
			key: "body",
			liquid: true,
			chunks: [{
				key: "main",
				content: bodyContent
			}]
		});
		if (stickyFooterScrollbar) sections.push({
			type: "footer",
			key: "footer",
			isSticky: true,
			chunks: [{
				key: "main",
				content: renderScrollShim
			}]
		});
		return y(ViewContainer, {
			elClasses: ["fc-daygrid"],
			viewSpec: context.viewSpec
		}, y(ScrollGrid, {
			liquid: !props.isHeightAuto && !props.forPrint,
			forPrint: props.forPrint,
			collapsibleWidth: props.forPrint,
			colGroups: [{ cols: [{
				span: colCnt,
				minWidth: dayMinWidth
			}] }],
			sections
		}));
	}
};
function splitSegsByRow(segs, rowCnt) {
	let byRow = [];
	for (let i = 0; i < rowCnt; i += 1) byRow[i] = [];
	for (let seg of segs) byRow[seg.row].push(seg);
	return byRow;
}
function splitSegsByFirstCol(segs, colCnt) {
	let byCol = [];
	for (let i = 0; i < colCnt; i += 1) byCol[i] = [];
	for (let seg of segs) byCol[seg.firstCol].push(seg);
	return byCol;
}
function splitInteractionByRow(ui, rowCnt) {
	let byRow = [];
	if (!ui) for (let i = 0; i < rowCnt; i += 1) byRow[i] = null;
	else {
		for (let i = 0; i < rowCnt; i += 1) byRow[i] = {
			affectedInstances: ui.affectedInstances,
			isEvent: ui.isEvent,
			segs: []
		};
		for (let seg of ui.segs) byRow[seg.row].segs.push(seg);
	}
	return byRow;
}
var DEFAULT_TABLE_EVENT_TIME_FORMAT = createFormatter({
	hour: "numeric",
	minute: "2-digit",
	omitZeroMinute: true,
	meridiem: "narrow"
});
function hasListItemDisplay(seg) {
	let { display } = seg.eventRange.ui;
	return display === "list-item" || display === "auto" && !seg.eventRange.def.allDay && seg.firstCol === seg.lastCol && seg.isStart && seg.isEnd;
}
var TableBlockEvent = class extends BaseComponent {
	render() {
		let { props } = this;
		return y(StandardEvent, Object.assign({}, props, {
			elClasses: [
				"fc-daygrid-event",
				"fc-daygrid-block-event",
				"fc-h-event"
			],
			defaultTimeFormat: DEFAULT_TABLE_EVENT_TIME_FORMAT,
			defaultDisplayEventEnd: props.defaultDisplayEventEnd,
			disableResizing: !props.seg.eventRange.def.allDay
		}));
	}
};
var TableListItemEvent = class extends BaseComponent {
	render() {
		let { props, context } = this;
		let { options } = context;
		let { seg } = props;
		let timeText = buildSegTimeText(seg, options.eventTimeFormat || DEFAULT_TABLE_EVENT_TIME_FORMAT, context, true, props.defaultDisplayEventEnd);
		return y(EventContainer, Object.assign({}, props, {
			elTag: "a",
			elClasses: ["fc-daygrid-event", "fc-daygrid-dot-event"],
			elAttrs: getSegAnchorAttrs(props.seg, context),
			defaultGenerator: renderInnerContent,
			timeText,
			isResizing: false,
			isDateSelecting: false
		}));
	}
};
function renderInnerContent(renderProps) {
	return y(_, null, y("div", {
		className: "fc-daygrid-event-dot",
		style: { borderColor: renderProps.borderColor || renderProps.backgroundColor }
	}), renderProps.timeText && y("div", { className: "fc-event-time" }, renderProps.timeText), y("div", { className: "fc-event-title" }, renderProps.event.title || y(_, null, "\xA0")));
}
var TableCellMoreLink = class extends BaseComponent {
	constructor() {
		super(...arguments);
		this.compileSegs = memoize(compileSegs);
	}
	render() {
		let { props } = this;
		let { allSegs, invisibleSegs } = this.compileSegs(props.singlePlacements);
		return y(MoreLinkContainer, {
			elClasses: ["fc-daygrid-more-link"],
			dateProfile: props.dateProfile,
			todayRange: props.todayRange,
			allDayDate: props.allDayDate,
			moreCnt: props.moreCnt,
			allSegs,
			hiddenSegs: invisibleSegs,
			alignmentElRef: props.alignmentElRef,
			alignGridTop: props.alignGridTop,
			extraDateSpan: props.extraDateSpan,
			popoverContent: () => {
				let isForcedInvisible = (props.eventDrag ? props.eventDrag.affectedInstances : null) || (props.eventResize ? props.eventResize.affectedInstances : null) || {};
				return y(_, null, allSegs.map((seg) => {
					let instanceId = seg.eventRange.instance.instanceId;
					return y("div", {
						className: "fc-daygrid-event-harness",
						key: instanceId,
						style: { visibility: isForcedInvisible[instanceId] ? "hidden" : "" }
					}, hasListItemDisplay(seg) ? y(TableListItemEvent, Object.assign({
						seg,
						isDragging: false,
						isSelected: instanceId === props.eventSelection,
						defaultDisplayEventEnd: false
					}, getSegMeta(seg, props.todayRange))) : y(TableBlockEvent, Object.assign({
						seg,
						isDragging: false,
						isResizing: false,
						isDateSelecting: false,
						isSelected: instanceId === props.eventSelection,
						defaultDisplayEventEnd: false
					}, getSegMeta(seg, props.todayRange))));
				}));
			}
		});
	}
};
function compileSegs(singlePlacements) {
	let allSegs = [];
	let invisibleSegs = [];
	for (let placement of singlePlacements) {
		allSegs.push(placement.seg);
		if (!placement.isVisible) invisibleSegs.push(placement.seg);
	}
	return {
		allSegs,
		invisibleSegs
	};
}
var DEFAULT_WEEK_NUM_FORMAT = createFormatter({ week: "narrow" });
var TableCell = class extends DateComponent {
	constructor() {
		super(...arguments);
		this.rootElRef = d();
		this.state = { dayNumberId: getUniqueDomId() };
		this.handleRootEl = (el) => {
			setRef(this.rootElRef, el);
			setRef(this.props.elRef, el);
		};
	}
	render() {
		let { context, props, state, rootElRef } = this;
		let { options, dateEnv } = context;
		let { date, dateProfile } = props;
		const isMonthStart = props.showDayNumber && shouldDisplayMonthStart(date, dateProfile.currentRange, dateEnv);
		return y(DayCellContainer, {
			elTag: "td",
			elRef: this.handleRootEl,
			elClasses: ["fc-daygrid-day", ...props.extraClassNames || []],
			elAttrs: Object.assign(Object.assign(Object.assign({}, props.extraDataAttrs), props.showDayNumber ? { "aria-labelledby": state.dayNumberId } : {}), { role: "gridcell" }),
			defaultGenerator: renderTopInner,
			date,
			dateProfile,
			todayRange: props.todayRange,
			showDayNumber: props.showDayNumber,
			isMonthStart,
			extraRenderProps: props.extraRenderProps
		}, (InnerContent, renderProps) => y("div", {
			ref: props.innerElRef,
			className: "fc-daygrid-day-frame fc-scrollgrid-sync-inner",
			style: { minHeight: props.minHeight }
		}, props.showWeekNumber && y(WeekNumberContainer, {
			elTag: "a",
			elClasses: ["fc-daygrid-week-number"],
			elAttrs: buildNavLinkAttrs(context, date, "week"),
			date,
			defaultFormat: DEFAULT_WEEK_NUM_FORMAT
		}), !renderProps.isDisabled && (props.showDayNumber || hasCustomDayCellContent(options) || props.forceDayTop) ? y("div", { className: "fc-daygrid-day-top" }, y(InnerContent, {
			elTag: "a",
			elClasses: ["fc-daygrid-day-number", isMonthStart && "fc-daygrid-month-start"],
			elAttrs: Object.assign(Object.assign({}, buildNavLinkAttrs(context, date)), { id: state.dayNumberId })
		})) : props.showDayNumber ? y("div", {
			className: "fc-daygrid-day-top",
			style: { visibility: "hidden" }
		}, y("a", { className: "fc-daygrid-day-number" }, "\xA0")) : void 0, y("div", {
			className: "fc-daygrid-day-events",
			ref: props.fgContentElRef
		}, props.fgContent, y("div", {
			className: "fc-daygrid-day-bottom",
			style: { marginTop: props.moreMarginTop }
		}, y(TableCellMoreLink, {
			allDayDate: date,
			singlePlacements: props.singlePlacements,
			moreCnt: props.moreCnt,
			alignmentElRef: rootElRef,
			alignGridTop: !props.showDayNumber,
			extraDateSpan: props.extraDateSpan,
			dateProfile: props.dateProfile,
			eventSelection: props.eventSelection,
			eventDrag: props.eventDrag,
			eventResize: props.eventResize,
			todayRange: props.todayRange
		}))), y("div", { className: "fc-daygrid-day-bg" }, props.bgContent)));
	}
};
function renderTopInner(props) {
	return props.dayNumberText || y(_, null, "\xA0");
}
function shouldDisplayMonthStart(date, currentRange, dateEnv) {
	const { start: currentStart, end: currentEnd } = currentRange;
	const currentEndIncl = addMs(currentEnd, -1);
	const currentFirstYear = dateEnv.getYear(currentStart);
	const currentFirstMonth = dateEnv.getMonth(currentStart);
	const currentLastYear = dateEnv.getYear(currentEndIncl);
	const currentLastMonth = dateEnv.getMonth(currentEndIncl);
	return !(currentFirstYear === currentLastYear && currentFirstMonth === currentLastMonth) && Boolean(date.valueOf() === currentStart.valueOf() || dateEnv.getDay(date) === 1 && date.valueOf() < currentEnd.valueOf());
}
function generateSegKey(seg) {
	return seg.eventRange.instance.instanceId + ":" + seg.firstCol;
}
function generateSegUid(seg) {
	return generateSegKey(seg) + ":" + seg.lastCol;
}
function computeFgSegPlacement(segs, dayMaxEvents, dayMaxEventRows, strictOrder, segHeights, maxContentHeight, cells) {
	let hierarchy = new DayGridSegHierarchy((segEntry) => {
		return segHeights[segs[segEntry.index].eventRange.instance.instanceId + ":" + segEntry.span.start + ":" + (segEntry.span.end - 1)] || 1;
	});
	hierarchy.allowReslicing = true;
	hierarchy.strictOrder = strictOrder;
	if (dayMaxEvents === true || dayMaxEventRows === true) {
		hierarchy.maxCoord = maxContentHeight;
		hierarchy.hiddenConsumes = true;
	} else if (typeof dayMaxEvents === "number") hierarchy.maxStackCnt = dayMaxEvents;
	else if (typeof dayMaxEventRows === "number") {
		hierarchy.maxStackCnt = dayMaxEventRows;
		hierarchy.hiddenConsumes = true;
	}
	let segInputs = [];
	let unknownHeightSegs = [];
	for (let i = 0; i < segs.length; i += 1) {
		let seg = segs[i];
		if (segHeights[generateSegUid(seg)] != null) segInputs.push({
			index: i,
			span: {
				start: seg.firstCol,
				end: seg.lastCol + 1
			}
		});
		else unknownHeightSegs.push(seg);
	}
	let hiddenEntries = hierarchy.addSegs(segInputs);
	let { singleColPlacements, multiColPlacements, leftoverMargins } = placeRects(hierarchy.toRects(), segs, cells);
	let moreCnts = [];
	let moreMarginTops = [];
	for (let seg of unknownHeightSegs) {
		multiColPlacements[seg.firstCol].push({
			seg,
			isVisible: false,
			isAbsolute: true,
			absoluteTop: 0,
			marginTop: 0
		});
		for (let col = seg.firstCol; col <= seg.lastCol; col += 1) singleColPlacements[col].push({
			seg: resliceSeg(seg, col, col + 1, cells),
			isVisible: false,
			isAbsolute: false,
			absoluteTop: 0,
			marginTop: 0
		});
	}
	for (let col = 0; col < cells.length; col += 1) moreCnts.push(0);
	for (let hiddenEntry of hiddenEntries) {
		let seg = segs[hiddenEntry.index];
		let hiddenSpan = hiddenEntry.span;
		multiColPlacements[hiddenSpan.start].push({
			seg: resliceSeg(seg, hiddenSpan.start, hiddenSpan.end, cells),
			isVisible: false,
			isAbsolute: true,
			absoluteTop: 0,
			marginTop: 0
		});
		for (let col = hiddenSpan.start; col < hiddenSpan.end; col += 1) {
			moreCnts[col] += 1;
			singleColPlacements[col].push({
				seg: resliceSeg(seg, col, col + 1, cells),
				isVisible: false,
				isAbsolute: false,
				absoluteTop: 0,
				marginTop: 0
			});
		}
	}
	for (let col = 0; col < cells.length; col += 1) moreMarginTops.push(leftoverMargins[col]);
	return {
		singleColPlacements,
		multiColPlacements,
		moreCnts,
		moreMarginTops
	};
}
function placeRects(allRects, segs, cells) {
	let rectsByEachCol = groupRectsByEachCol(allRects, cells.length);
	let singleColPlacements = [];
	let multiColPlacements = [];
	let leftoverMargins = [];
	for (let col = 0; col < cells.length; col += 1) {
		let rects = rectsByEachCol[col];
		let singlePlacements = [];
		let currentHeight = 0;
		let currentMarginTop = 0;
		for (let rect of rects) {
			let seg = segs[rect.index];
			singlePlacements.push({
				seg: resliceSeg(seg, col, col + 1, cells),
				isVisible: true,
				isAbsolute: false,
				absoluteTop: rect.levelCoord,
				marginTop: rect.levelCoord - currentHeight
			});
			currentHeight = rect.levelCoord + rect.thickness;
		}
		let multiPlacements = [];
		currentHeight = 0;
		currentMarginTop = 0;
		for (let rect of rects) {
			let seg = segs[rect.index];
			let isAbsolute = rect.span.end - rect.span.start > 1;
			let isFirstCol = rect.span.start === col;
			currentMarginTop += rect.levelCoord - currentHeight;
			currentHeight = rect.levelCoord + rect.thickness;
			if (isAbsolute) {
				currentMarginTop += rect.thickness;
				if (isFirstCol) multiPlacements.push({
					seg: resliceSeg(seg, rect.span.start, rect.span.end, cells),
					isVisible: true,
					isAbsolute: true,
					absoluteTop: rect.levelCoord,
					marginTop: 0
				});
			} else if (isFirstCol) {
				multiPlacements.push({
					seg: resliceSeg(seg, rect.span.start, rect.span.end, cells),
					isVisible: true,
					isAbsolute: false,
					absoluteTop: rect.levelCoord,
					marginTop: currentMarginTop
				});
				currentMarginTop = 0;
			}
		}
		singleColPlacements.push(singlePlacements);
		multiColPlacements.push(multiPlacements);
		leftoverMargins.push(currentMarginTop);
	}
	return {
		singleColPlacements,
		multiColPlacements,
		leftoverMargins
	};
}
function groupRectsByEachCol(rects, colCnt) {
	let rectsByEachCol = [];
	for (let col = 0; col < colCnt; col += 1) rectsByEachCol.push([]);
	for (let rect of rects) for (let col = rect.span.start; col < rect.span.end; col += 1) rectsByEachCol[col].push(rect);
	return rectsByEachCol;
}
function resliceSeg(seg, spanStart, spanEnd, cells) {
	if (seg.firstCol === spanStart && seg.lastCol === spanEnd - 1) return seg;
	let eventRange = seg.eventRange;
	let origRange = eventRange.range;
	let slicedRange = intersectRanges(origRange, {
		start: cells[spanStart].date,
		end: addDays(cells[spanEnd - 1].date, 1)
	});
	return Object.assign(Object.assign({}, seg), {
		firstCol: spanStart,
		lastCol: spanEnd - 1,
		eventRange: {
			def: eventRange.def,
			ui: Object.assign(Object.assign({}, eventRange.ui), { durationEditable: false }),
			instance: eventRange.instance,
			range: slicedRange
		},
		isStart: seg.isStart && slicedRange.start.valueOf() === origRange.start.valueOf(),
		isEnd: seg.isEnd && slicedRange.end.valueOf() === origRange.end.valueOf()
	});
}
var DayGridSegHierarchy = class extends SegHierarchy {
	constructor() {
		super(...arguments);
		this.hiddenConsumes = false;
		this.forceHidden = {};
	}
	addSegs(segInputs) {
		const hiddenSegs = super.addSegs(segInputs);
		const { entriesByLevel } = this;
		const excludeHidden = (entry) => !this.forceHidden[buildEntryKey(entry)];
		for (let level = 0; level < entriesByLevel.length; level += 1) entriesByLevel[level] = entriesByLevel[level].filter(excludeHidden);
		return hiddenSegs;
	}
	handleInvalidInsertion(insertion, entry, hiddenEntries) {
		const { entriesByLevel, forceHidden } = this;
		const { touchingEntry, touchingLevel, touchingLateral } = insertion;
		if (this.hiddenConsumes && touchingEntry) {
			const touchingEntryId = buildEntryKey(touchingEntry);
			if (!forceHidden[touchingEntryId]) if (this.allowReslicing) {
				const hiddenEntry = Object.assign(Object.assign({}, touchingEntry), { span: intersectSpans(touchingEntry.span, entry.span) });
				const hiddenEntryId = buildEntryKey(hiddenEntry);
				forceHidden[hiddenEntryId] = true;
				entriesByLevel[touchingLevel][touchingLateral] = hiddenEntry;
				hiddenEntries.push(hiddenEntry);
				this.splitEntry(touchingEntry, entry, hiddenEntries);
			} else {
				forceHidden[touchingEntryId] = true;
				hiddenEntries.push(touchingEntry);
			}
		}
		super.handleInvalidInsertion(insertion, entry, hiddenEntries);
	}
};
var TableRow = class extends DateComponent {
	constructor() {
		super(...arguments);
		this.cellElRefs = new RefMap();
		this.frameElRefs = new RefMap();
		this.fgElRefs = new RefMap();
		this.segHarnessRefs = new RefMap();
		this.rootElRef = d();
		this.state = {
			framePositions: null,
			maxContentHeight: null,
			segHeights: {}
		};
		this.handleResize = (isForced) => {
			if (isForced) this.updateSizing(true);
		};
	}
	render() {
		let { props, state, context } = this;
		let { options } = context;
		let colCnt = props.cells.length;
		let businessHoursByCol = splitSegsByFirstCol(props.businessHourSegs, colCnt);
		let bgEventSegsByCol = splitSegsByFirstCol(props.bgEventSegs, colCnt);
		let highlightSegsByCol = splitSegsByFirstCol(this.getHighlightSegs(), colCnt);
		let mirrorSegsByCol = splitSegsByFirstCol(this.getMirrorSegs(), colCnt);
		let { singleColPlacements, multiColPlacements, moreCnts, moreMarginTops } = computeFgSegPlacement(sortEventSegs(props.fgEventSegs, options.eventOrder), props.dayMaxEvents, props.dayMaxEventRows, options.eventOrderStrict, state.segHeights, state.maxContentHeight, props.cells);
		let isForcedInvisible = props.eventDrag && props.eventDrag.affectedInstances || props.eventResize && props.eventResize.affectedInstances || {};
		return y("tr", {
			ref: this.rootElRef,
			role: "row"
		}, props.renderIntro && props.renderIntro(), props.cells.map((cell, col) => {
			let normalFgNodes = this.renderFgSegs(col, props.forPrint ? singleColPlacements[col] : multiColPlacements[col], props.todayRange, isForcedInvisible);
			let mirrorFgNodes = this.renderFgSegs(col, buildMirrorPlacements(mirrorSegsByCol[col], multiColPlacements), props.todayRange, {}, Boolean(props.eventDrag), Boolean(props.eventResize), false);
			return y(TableCell, {
				key: cell.key,
				elRef: this.cellElRefs.createRef(cell.key),
				innerElRef: this.frameElRefs.createRef(cell.key),
				dateProfile: props.dateProfile,
				date: cell.date,
				showDayNumber: props.showDayNumbers,
				showWeekNumber: props.showWeekNumbers && col === 0,
				forceDayTop: props.showWeekNumbers,
				todayRange: props.todayRange,
				eventSelection: props.eventSelection,
				eventDrag: props.eventDrag,
				eventResize: props.eventResize,
				extraRenderProps: cell.extraRenderProps,
				extraDataAttrs: cell.extraDataAttrs,
				extraClassNames: cell.extraClassNames,
				extraDateSpan: cell.extraDateSpan,
				moreCnt: moreCnts[col],
				moreMarginTop: moreMarginTops[col],
				singlePlacements: singleColPlacements[col],
				fgContentElRef: this.fgElRefs.createRef(cell.key),
				fgContent: y(_, null, y(_, null, normalFgNodes), y(_, null, mirrorFgNodes)),
				bgContent: y(_, null, this.renderFillSegs(highlightSegsByCol[col], "highlight"), this.renderFillSegs(businessHoursByCol[col], "non-business"), this.renderFillSegs(bgEventSegsByCol[col], "bg-event")),
				minHeight: props.cellMinHeight
			});
		}));
	}
	componentDidMount() {
		this.updateSizing(true);
		this.context.addResizeHandler(this.handleResize);
	}
	componentDidUpdate(prevProps, prevState) {
		let currentProps = this.props;
		this.updateSizing(!isPropsEqual(prevProps, currentProps));
	}
	componentWillUnmount() {
		this.context.removeResizeHandler(this.handleResize);
	}
	getHighlightSegs() {
		let { props } = this;
		if (props.eventDrag && props.eventDrag.segs.length) return props.eventDrag.segs;
		if (props.eventResize && props.eventResize.segs.length) return props.eventResize.segs;
		return props.dateSelectionSegs;
	}
	getMirrorSegs() {
		let { props } = this;
		if (props.eventResize && props.eventResize.segs.length) return props.eventResize.segs;
		return [];
	}
	renderFgSegs(col, segPlacements, todayRange, isForcedInvisible, isDragging, isResizing, isDateSelecting) {
		let { context } = this;
		let { eventSelection } = this.props;
		let { framePositions } = this.state;
		let defaultDisplayEventEnd = this.props.cells.length === 1;
		let isMirror = isDragging || isResizing || isDateSelecting;
		let nodes = [];
		if (framePositions) for (let placement of segPlacements) {
			let { seg } = placement;
			let { instanceId } = seg.eventRange.instance;
			let isVisible = placement.isVisible && !isForcedInvisible[instanceId];
			let isAbsolute = placement.isAbsolute;
			let left = "";
			let right = "";
			if (isAbsolute) if (context.isRtl) {
				right = 0;
				left = framePositions.lefts[seg.lastCol] - framePositions.lefts[seg.firstCol];
			} else {
				left = 0;
				right = framePositions.rights[seg.firstCol] - framePositions.rights[seg.lastCol];
			}
			nodes.push(y("div", {
				className: "fc-daygrid-event-harness" + (isAbsolute ? " fc-daygrid-event-harness-abs" : ""),
				key: generateSegKey(seg),
				ref: isMirror ? null : this.segHarnessRefs.createRef(generateSegUid(seg)),
				style: {
					visibility: isVisible ? "" : "hidden",
					marginTop: isAbsolute ? "" : placement.marginTop,
					top: isAbsolute ? placement.absoluteTop : "",
					left,
					right
				}
			}, hasListItemDisplay(seg) ? y(TableListItemEvent, Object.assign({
				seg,
				isDragging,
				isSelected: instanceId === eventSelection,
				defaultDisplayEventEnd
			}, getSegMeta(seg, todayRange))) : y(TableBlockEvent, Object.assign({
				seg,
				isDragging,
				isResizing,
				isDateSelecting,
				isSelected: instanceId === eventSelection,
				defaultDisplayEventEnd
			}, getSegMeta(seg, todayRange)))));
		}
		return nodes;
	}
	renderFillSegs(segs, fillType) {
		let { isRtl } = this.context;
		let { todayRange } = this.props;
		let { framePositions } = this.state;
		let nodes = [];
		if (framePositions) for (let seg of segs) {
			let leftRightCss = isRtl ? {
				right: 0,
				left: framePositions.lefts[seg.lastCol] - framePositions.lefts[seg.firstCol]
			} : {
				left: 0,
				right: framePositions.rights[seg.firstCol] - framePositions.rights[seg.lastCol]
			};
			nodes.push(y("div", {
				key: buildEventRangeKey(seg.eventRange),
				className: "fc-daygrid-bg-harness",
				style: leftRightCss
			}, fillType === "bg-event" ? y(BgEvent, Object.assign({ seg }, getSegMeta(seg, todayRange))) : renderFill(fillType)));
		}
		return y(_, {}, ...nodes);
	}
	updateSizing(isExternalSizingChange) {
		let { props, state, frameElRefs } = this;
		if (!props.forPrint && props.clientWidth !== null) {
			if (isExternalSizingChange) {
				let frameEls = props.cells.map((cell) => frameElRefs.currentMap[cell.key]);
				if (frameEls.length) {
					let originEl = this.rootElRef.current;
					let newPositionCache = new PositionCache(originEl, frameEls, true, false);
					if (!state.framePositions || !state.framePositions.similarTo(newPositionCache)) this.setState({ framePositions: new PositionCache(originEl, frameEls, true, false) });
				}
			}
			const oldSegHeights = this.state.segHeights;
			const newSegHeights = this.querySegHeights();
			const limitByContentHeight = props.dayMaxEvents === true || props.dayMaxEventRows === true;
			this.safeSetState({
				segHeights: Object.assign(Object.assign({}, oldSegHeights), newSegHeights),
				maxContentHeight: limitByContentHeight ? this.computeMaxContentHeight() : null
			});
		}
	}
	querySegHeights() {
		let segElMap = this.segHarnessRefs.currentMap;
		let segHeights = {};
		for (let segUid in segElMap) {
			let height = Math.round(segElMap[segUid].getBoundingClientRect().height);
			segHeights[segUid] = Math.max(segHeights[segUid] || 0, height);
		}
		return segHeights;
	}
	computeMaxContentHeight() {
		let firstKey = this.props.cells[0].key;
		let cellEl = this.cellElRefs.currentMap[firstKey];
		let fcContainerEl = this.fgElRefs.currentMap[firstKey];
		return cellEl.getBoundingClientRect().bottom - fcContainerEl.getBoundingClientRect().top;
	}
	getCellEls() {
		let elMap = this.cellElRefs.currentMap;
		return this.props.cells.map((cell) => elMap[cell.key]);
	}
};
TableRow.addStateEquality({ segHeights: isPropsEqual });
function buildMirrorPlacements(mirrorSegs, colPlacements) {
	if (!mirrorSegs.length) return [];
	let topsByInstanceId = buildAbsoluteTopHash(colPlacements);
	return mirrorSegs.map((seg) => ({
		seg,
		isVisible: true,
		isAbsolute: true,
		absoluteTop: topsByInstanceId[seg.eventRange.instance.instanceId],
		marginTop: 0
	}));
}
function buildAbsoluteTopHash(colPlacements) {
	let topsByInstanceId = {};
	for (let placements of colPlacements) for (let placement of placements) topsByInstanceId[placement.seg.eventRange.instance.instanceId] = placement.absoluteTop;
	return topsByInstanceId;
}
var TableRows = class extends DateComponent {
	constructor() {
		super(...arguments);
		this.splitBusinessHourSegs = memoize(splitSegsByRow);
		this.splitBgEventSegs = memoize(splitAllDaySegsByRow);
		this.splitFgEventSegs = memoize(splitSegsByRow);
		this.splitDateSelectionSegs = memoize(splitSegsByRow);
		this.splitEventDrag = memoize(splitInteractionByRow);
		this.splitEventResize = memoize(splitInteractionByRow);
		this.rowRefs = new RefMap();
	}
	render() {
		let { props, context } = this;
		let rowCnt = props.cells.length;
		let businessHourSegsByRow = this.splitBusinessHourSegs(props.businessHourSegs, rowCnt);
		let bgEventSegsByRow = this.splitBgEventSegs(props.bgEventSegs, rowCnt);
		let fgEventSegsByRow = this.splitFgEventSegs(props.fgEventSegs, rowCnt);
		let dateSelectionSegsByRow = this.splitDateSelectionSegs(props.dateSelectionSegs, rowCnt);
		let eventDragByRow = this.splitEventDrag(props.eventDrag, rowCnt);
		let eventResizeByRow = this.splitEventResize(props.eventResize, rowCnt);
		let cellMinHeight = rowCnt >= 7 && props.clientWidth ? props.clientWidth / context.options.aspectRatio / 6 : null;
		return y(NowTimer, { unit: "day" }, (nowDate, todayRange) => y(_, null, props.cells.map((cells, row) => y(TableRow, {
			ref: this.rowRefs.createRef(row),
			key: cells.length ? cells[0].date.toISOString() : row,
			showDayNumbers: rowCnt > 1,
			showWeekNumbers: props.showWeekNumbers,
			todayRange,
			dateProfile: props.dateProfile,
			cells,
			renderIntro: props.renderRowIntro,
			businessHourSegs: businessHourSegsByRow[row],
			eventSelection: props.eventSelection,
			bgEventSegs: bgEventSegsByRow[row],
			fgEventSegs: fgEventSegsByRow[row],
			dateSelectionSegs: dateSelectionSegsByRow[row],
			eventDrag: eventDragByRow[row],
			eventResize: eventResizeByRow[row],
			dayMaxEvents: props.dayMaxEvents,
			dayMaxEventRows: props.dayMaxEventRows,
			clientWidth: props.clientWidth,
			clientHeight: props.clientHeight,
			cellMinHeight,
			forPrint: props.forPrint
		}))));
	}
	componentDidMount() {
		this.registerInteractiveComponent();
	}
	componentDidUpdate() {
		this.registerInteractiveComponent();
	}
	registerInteractiveComponent() {
		if (!this.rootEl) {
			const firstCellEl = this.rowRefs.currentMap[0].getCellEls()[0];
			const rootEl = firstCellEl ? firstCellEl.closest(".fc-daygrid-body") : null;
			if (rootEl) {
				this.rootEl = rootEl;
				this.context.registerInteractiveComponent(this, {
					el: rootEl,
					isHitComboAllowed: this.props.isHitComboAllowed
				});
			}
		}
	}
	componentWillUnmount() {
		if (this.rootEl) {
			this.context.unregisterInteractiveComponent(this);
			this.rootEl = null;
		}
	}
	prepareHits() {
		this.rowPositions = new PositionCache(this.rootEl, this.rowRefs.collect().map((rowObj) => rowObj.getCellEls()[0]), false, true);
		this.colPositions = new PositionCache(this.rootEl, this.rowRefs.currentMap[0].getCellEls(), true, false);
	}
	queryHit(positionLeft, positionTop) {
		let { colPositions, rowPositions } = this;
		let col = colPositions.leftToIndex(positionLeft);
		let row = rowPositions.topToIndex(positionTop);
		if (row != null && col != null) {
			let cell = this.props.cells[row][col];
			return {
				dateProfile: this.props.dateProfile,
				dateSpan: Object.assign({
					range: this.getCellRange(row, col),
					allDay: true
				}, cell.extraDateSpan),
				dayEl: this.getCellEl(row, col),
				rect: {
					left: colPositions.lefts[col],
					right: colPositions.rights[col],
					top: rowPositions.tops[row],
					bottom: rowPositions.bottoms[row]
				},
				layer: 0
			};
		}
		return null;
	}
	getCellEl(row, col) {
		return this.rowRefs.currentMap[row].getCellEls()[col];
	}
	getCellRange(row, col) {
		let start = this.props.cells[row][col].date;
		return {
			start,
			end: addDays(start, 1)
		};
	}
};
function splitAllDaySegsByRow(segs, rowCnt) {
	return splitSegsByRow(segs.filter(isSegAllDay), rowCnt);
}
function isSegAllDay(seg) {
	return seg.eventRange.def.allDay;
}
var Table = class extends DateComponent {
	constructor() {
		super(...arguments);
		this.elRef = d();
		this.needsScrollReset = false;
	}
	render() {
		let { props } = this;
		let { dayMaxEventRows, dayMaxEvents, expandRows } = props;
		let limitViaBalanced = dayMaxEvents === true || dayMaxEventRows === true;
		if (limitViaBalanced && !expandRows) {
			limitViaBalanced = false;
			dayMaxEventRows = null;
			dayMaxEvents = null;
		}
		let classNames = [
			"fc-daygrid-body",
			limitViaBalanced ? "fc-daygrid-body-balanced" : "fc-daygrid-body-unbalanced",
			expandRows ? "" : "fc-daygrid-body-natural"
		];
		return y("div", {
			ref: this.elRef,
			className: classNames.join(" "),
			style: {
				width: props.clientWidth,
				minWidth: props.tableMinWidth
			}
		}, y("table", {
			role: "presentation",
			className: "fc-scrollgrid-sync-table",
			style: {
				width: props.clientWidth,
				minWidth: props.tableMinWidth,
				height: expandRows ? props.clientHeight : ""
			}
		}, props.colGroupNode, y("tbody", { role: "presentation" }, y(TableRows, {
			dateProfile: props.dateProfile,
			cells: props.cells,
			renderRowIntro: props.renderRowIntro,
			showWeekNumbers: props.showWeekNumbers,
			clientWidth: props.clientWidth,
			clientHeight: props.clientHeight,
			businessHourSegs: props.businessHourSegs,
			bgEventSegs: props.bgEventSegs,
			fgEventSegs: props.fgEventSegs,
			dateSelectionSegs: props.dateSelectionSegs,
			eventSelection: props.eventSelection,
			eventDrag: props.eventDrag,
			eventResize: props.eventResize,
			dayMaxEvents,
			dayMaxEventRows,
			forPrint: props.forPrint,
			isHitComboAllowed: props.isHitComboAllowed
		}))));
	}
	componentDidMount() {
		this.requestScrollReset();
	}
	componentDidUpdate(prevProps) {
		if (prevProps.dateProfile !== this.props.dateProfile) this.requestScrollReset();
		else this.flushScrollReset();
	}
	requestScrollReset() {
		this.needsScrollReset = true;
		this.flushScrollReset();
	}
	flushScrollReset() {
		if (this.needsScrollReset && this.props.clientWidth) {
			const subjectEl = getScrollSubjectEl(this.elRef.current, this.props.dateProfile);
			if (subjectEl) {
				const originEl = subjectEl.closest(".fc-daygrid-body");
				const scrollEl = originEl.closest(".fc-scroller");
				const scrollTop = subjectEl.getBoundingClientRect().top - originEl.getBoundingClientRect().top;
				scrollEl.scrollTop = scrollTop ? scrollTop + 1 : 0;
			}
			this.needsScrollReset = false;
		}
	}
};
function getScrollSubjectEl(containerEl, dateProfile) {
	let el;
	if (dateProfile.currentRangeUnit.match(/year|month/)) el = containerEl.querySelector(`[data-date="${formatIsoMonthStr(dateProfile.currentDate)}-01"]`);
	if (!el) el = containerEl.querySelector(`[data-date="${formatDayString(dateProfile.currentDate)}"]`);
	return el;
}
var DayTableSlicer = class extends Slicer {
	constructor() {
		super(...arguments);
		this.forceDayIfListItem = true;
	}
	sliceRange(dateRange, dayTableModel) {
		return dayTableModel.sliceRange(dateRange);
	}
};
var DayTable = class extends DateComponent {
	constructor() {
		super(...arguments);
		this.slicer = new DayTableSlicer();
		this.tableRef = d();
	}
	render() {
		let { props, context } = this;
		return y(Table, Object.assign({ ref: this.tableRef }, this.slicer.sliceProps(props, props.dateProfile, props.nextDayThreshold, context, props.dayTableModel), {
			dateProfile: props.dateProfile,
			cells: props.dayTableModel.cells,
			colGroupNode: props.colGroupNode,
			tableMinWidth: props.tableMinWidth,
			renderRowIntro: props.renderRowIntro,
			dayMaxEvents: props.dayMaxEvents,
			dayMaxEventRows: props.dayMaxEventRows,
			showWeekNumbers: props.showWeekNumbers,
			expandRows: props.expandRows,
			headerAlignElRef: props.headerAlignElRef,
			clientWidth: props.clientWidth,
			clientHeight: props.clientHeight,
			forPrint: props.forPrint
		}));
	}
};
var DayTableView = class extends TableView {
	constructor() {
		super(...arguments);
		this.buildDayTableModel = memoize(buildDayTableModel);
		this.headerRef = d();
		this.tableRef = d();
	}
	render() {
		let { options, dateProfileGenerator } = this.context;
		let { props } = this;
		let dayTableModel = this.buildDayTableModel(props.dateProfile, dateProfileGenerator);
		let headerContent = options.dayHeaders && y(DayHeader, {
			ref: this.headerRef,
			dateProfile: props.dateProfile,
			dates: dayTableModel.headerDates,
			datesRepDistinctDays: dayTableModel.rowCnt === 1
		});
		let bodyContent = (contentArg) => y(DayTable, {
			ref: this.tableRef,
			dateProfile: props.dateProfile,
			dayTableModel,
			businessHours: props.businessHours,
			dateSelection: props.dateSelection,
			eventStore: props.eventStore,
			eventUiBases: props.eventUiBases,
			eventSelection: props.eventSelection,
			eventDrag: props.eventDrag,
			eventResize: props.eventResize,
			nextDayThreshold: options.nextDayThreshold,
			colGroupNode: contentArg.tableColGroupNode,
			tableMinWidth: contentArg.tableMinWidth,
			dayMaxEvents: options.dayMaxEvents,
			dayMaxEventRows: options.dayMaxEventRows,
			showWeekNumbers: options.weekNumbers,
			expandRows: !props.isHeightAuto,
			headerAlignElRef: this.headerElRef,
			clientWidth: contentArg.clientWidth,
			clientHeight: contentArg.clientHeight,
			forPrint: props.forPrint
		});
		return options.dayMinWidth ? this.renderHScrollLayout(headerContent, bodyContent, dayTableModel.colCnt, options.dayMinWidth) : this.renderSimpleLayout(headerContent, bodyContent);
	}
};
function buildDayTableModel(dateProfile, dateProfileGenerator) {
	return new DayTableModel(new DaySeriesModel(dateProfile.renderRange, dateProfileGenerator), /year|month|week/.test(dateProfile.currentRangeUnit));
}
var TableDateProfileGenerator = class extends DateProfileGenerator {
	buildRenderRange(currentRange, currentRangeUnit, isRangeAllDay) {
		let renderRange = super.buildRenderRange(currentRange, currentRangeUnit, isRangeAllDay);
		let { props } = this;
		return buildDayTableRenderRange({
			currentRange: renderRange,
			snapToWeek: /^(year|month)$/.test(currentRangeUnit),
			fixedWeekCount: props.fixedWeekCount,
			dateEnv: props.dateEnv
		});
	}
};
function buildDayTableRenderRange(props) {
	let { dateEnv, currentRange } = props;
	let { start, end } = currentRange;
	let endOfWeek;
	if (props.snapToWeek) {
		start = dateEnv.startOfWeek(start);
		endOfWeek = dateEnv.startOfWeek(end);
		if (endOfWeek.valueOf() !== end.valueOf()) end = addWeeks(endOfWeek, 1);
	}
	if (props.fixedWeekCount) {
		let lastMonthRenderStart = dateEnv.startOfWeek(dateEnv.startOfMonth(addDays(currentRange.end, -1)));
		let rowCnt = Math.ceil(diffWeeks(lastMonthRenderStart, end));
		end = addWeeks(end, 6 - rowCnt);
	}
	return {
		start,
		end
	};
}
injectStyles(":root{--fc-daygrid-event-dot-width:8px}.fc-daygrid-day-events:after,.fc-daygrid-day-events:before,.fc-daygrid-day-frame:after,.fc-daygrid-day-frame:before,.fc-daygrid-event-harness:after,.fc-daygrid-event-harness:before{clear:both;content:\"\";display:table}.fc .fc-daygrid-body{position:relative;z-index:1}.fc .fc-daygrid-day.fc-day-today{background-color:var(--fc-today-bg-color)}.fc .fc-daygrid-day-frame{min-height:100%;position:relative}.fc .fc-daygrid-day-top{display:flex;flex-direction:row-reverse}.fc .fc-day-other .fc-daygrid-day-top{opacity:.3}.fc .fc-daygrid-day-number{padding:4px;position:relative;z-index:4}.fc .fc-daygrid-month-start{font-size:1.1em;font-weight:700}.fc .fc-daygrid-day-events{margin-top:1px}.fc .fc-daygrid-body-balanced .fc-daygrid-day-events{left:0;position:absolute;right:0}.fc .fc-daygrid-body-unbalanced .fc-daygrid-day-events{min-height:2em;position:relative}.fc .fc-daygrid-body-natural .fc-daygrid-day-events{margin-bottom:1em}.fc .fc-daygrid-event-harness{position:relative}.fc .fc-daygrid-event-harness-abs{left:0;position:absolute;right:0;top:0}.fc .fc-daygrid-bg-harness{bottom:0;position:absolute;top:0}.fc .fc-daygrid-day-bg .fc-non-business{z-index:1}.fc .fc-daygrid-day-bg .fc-bg-event{z-index:2}.fc .fc-daygrid-day-bg .fc-highlight{z-index:3}.fc .fc-daygrid-event{margin-top:1px;z-index:6}.fc .fc-daygrid-event.fc-event-mirror{z-index:7}.fc .fc-daygrid-day-bottom{font-size:.85em;margin:0 2px}.fc .fc-daygrid-day-bottom:after,.fc .fc-daygrid-day-bottom:before{clear:both;content:\"\";display:table}.fc .fc-daygrid-more-link{border-radius:3px;cursor:pointer;line-height:1;margin-top:1px;max-width:100%;overflow:hidden;padding:2px;position:relative;white-space:nowrap;z-index:4}.fc .fc-daygrid-more-link:hover{background-color:rgba(0,0,0,.1)}.fc .fc-daygrid-week-number{background-color:var(--fc-neutral-bg-color);color:var(--fc-neutral-text-color);min-width:1.5em;padding:2px;position:absolute;text-align:center;top:0;z-index:5}.fc .fc-more-popover .fc-popover-body{min-width:220px;padding:10px}.fc-direction-ltr .fc-daygrid-event.fc-event-start,.fc-direction-rtl .fc-daygrid-event.fc-event-end{margin-left:2px}.fc-direction-ltr .fc-daygrid-event.fc-event-end,.fc-direction-rtl .fc-daygrid-event.fc-event-start{margin-right:2px}.fc-direction-ltr .fc-daygrid-more-link{float:left}.fc-direction-ltr .fc-daygrid-week-number{border-radius:0 0 3px 0;left:0}.fc-direction-rtl .fc-daygrid-more-link{float:right}.fc-direction-rtl .fc-daygrid-week-number{border-radius:0 0 0 3px;right:0}.fc-liquid-hack .fc-daygrid-day-frame{position:static}.fc-daygrid-event{border-radius:3px;font-size:var(--fc-small-font-size);position:relative;white-space:nowrap}.fc-daygrid-block-event .fc-event-time{font-weight:700}.fc-daygrid-block-event .fc-event-time,.fc-daygrid-block-event .fc-event-title{padding:1px}.fc-daygrid-dot-event{align-items:center;display:flex;padding:2px 0}.fc-daygrid-dot-event .fc-event-title{flex-grow:1;flex-shrink:1;font-weight:700;min-width:0;overflow:hidden}.fc-daygrid-dot-event.fc-event-mirror,.fc-daygrid-dot-event:hover{background:rgba(0,0,0,.1)}.fc-daygrid-dot-event.fc-event-selected:before{bottom:-10px;top:-10px}.fc-daygrid-event-dot{border:calc(var(--fc-daygrid-event-dot-width)/2) solid var(--fc-event-border-color);border-radius:calc(var(--fc-daygrid-event-dot-width)/2);box-sizing:content-box;height:0;margin:0 4px;width:0}.fc-direction-ltr .fc-daygrid-event .fc-event-time{margin-right:3px}.fc-direction-rtl .fc-daygrid-event .fc-event-time{margin-left:3px}");
//#endregion
//#region node_modules/@fullcalendar/daygrid/index.js
var index$1 = createPlugin({
	name: "@fullcalendar/daygrid",
	initialView: "dayGridMonth",
	views: {
		dayGrid: {
			component: DayTableView,
			dateProfileGeneratorClass: TableDateProfileGenerator
		},
		dayGridDay: {
			type: "dayGrid",
			duration: { days: 1 }
		},
		dayGridWeek: {
			type: "dayGrid",
			duration: { weeks: 1 }
		},
		dayGridMonth: {
			type: "dayGrid",
			duration: { months: 1 },
			fixedWeekCount: true
		},
		dayGridYear: {
			type: "dayGrid",
			duration: { years: 1 }
		}
	}
});
//#endregion
//#region node_modules/@fullcalendar/interaction/index.js
config.touchMouseIgnoreWait = 500;
var ignoreMouseDepth = 0;
var listenerCnt = 0;
var isWindowTouchMoveCancelled = false;
var PointerDragging = class {
	constructor(containerEl) {
		this.subjectEl = null;
		this.selector = "";
		this.handleSelector = "";
		this.shouldIgnoreMove = false;
		this.shouldWatchScroll = true;
		this.isDragging = false;
		this.isTouchDragging = false;
		this.wasTouchScroll = false;
		this.handleMouseDown = (ev) => {
			if (!this.shouldIgnoreMouse() && isPrimaryMouseButton(ev) && this.tryStart(ev)) {
				let pev = this.createEventFromMouse(ev, true);
				this.emitter.trigger("pointerdown", pev);
				this.initScrollWatch(pev);
				if (!this.shouldIgnoreMove) document.addEventListener("mousemove", this.handleMouseMove);
				document.addEventListener("mouseup", this.handleMouseUp);
			}
		};
		this.handleMouseMove = (ev) => {
			let pev = this.createEventFromMouse(ev);
			this.recordCoords(pev);
			this.emitter.trigger("pointermove", pev);
		};
		this.handleMouseUp = (ev) => {
			document.removeEventListener("mousemove", this.handleMouseMove);
			document.removeEventListener("mouseup", this.handleMouseUp);
			this.emitter.trigger("pointerup", this.createEventFromMouse(ev));
			this.cleanup();
		};
		this.handleTouchStart = (ev) => {
			if (this.tryStart(ev)) {
				this.isTouchDragging = true;
				let pev = this.createEventFromTouch(ev, true);
				this.emitter.trigger("pointerdown", pev);
				this.initScrollWatch(pev);
				let targetEl = ev.target;
				if (!this.shouldIgnoreMove) targetEl.addEventListener("touchmove", this.handleTouchMove);
				targetEl.addEventListener("touchend", this.handleTouchEnd);
				targetEl.addEventListener("touchcancel", this.handleTouchEnd);
				window.addEventListener("scroll", this.handleTouchScroll, true);
			}
		};
		this.handleTouchMove = (ev) => {
			let pev = this.createEventFromTouch(ev);
			this.recordCoords(pev);
			this.emitter.trigger("pointermove", pev);
		};
		this.handleTouchEnd = (ev) => {
			if (this.isDragging) {
				let targetEl = ev.target;
				targetEl.removeEventListener("touchmove", this.handleTouchMove);
				targetEl.removeEventListener("touchend", this.handleTouchEnd);
				targetEl.removeEventListener("touchcancel", this.handleTouchEnd);
				window.removeEventListener("scroll", this.handleTouchScroll, true);
				this.emitter.trigger("pointerup", this.createEventFromTouch(ev));
				this.cleanup();
				this.isTouchDragging = false;
				startIgnoringMouse();
			}
		};
		this.handleTouchScroll = () => {
			this.wasTouchScroll = true;
		};
		this.handleScroll = (ev) => {
			if (!this.shouldIgnoreMove) {
				let pageX = window.scrollX - this.prevScrollX + this.prevPageX;
				let pageY = window.scrollY - this.prevScrollY + this.prevPageY;
				this.emitter.trigger("pointermove", {
					origEvent: ev,
					isTouch: this.isTouchDragging,
					subjectEl: this.subjectEl,
					pageX,
					pageY,
					deltaX: pageX - this.origPageX,
					deltaY: pageY - this.origPageY
				});
			}
		};
		this.containerEl = containerEl;
		this.emitter = new Emitter();
		containerEl.addEventListener("mousedown", this.handleMouseDown);
		containerEl.addEventListener("touchstart", this.handleTouchStart, { passive: true });
		listenerCreated();
	}
	destroy() {
		this.containerEl.removeEventListener("mousedown", this.handleMouseDown);
		this.containerEl.removeEventListener("touchstart", this.handleTouchStart, { passive: true });
		listenerDestroyed();
	}
	tryStart(ev) {
		let subjectEl = this.querySubjectEl(ev);
		let downEl = ev.target;
		if (subjectEl && (!this.handleSelector || elementClosest(downEl, this.handleSelector))) {
			this.subjectEl = subjectEl;
			this.isDragging = true;
			this.wasTouchScroll = false;
			return true;
		}
		return false;
	}
	cleanup() {
		isWindowTouchMoveCancelled = false;
		this.isDragging = false;
		this.subjectEl = null;
		this.destroyScrollWatch();
	}
	querySubjectEl(ev) {
		if (this.selector) return elementClosest(ev.target, this.selector);
		return this.containerEl;
	}
	shouldIgnoreMouse() {
		return ignoreMouseDepth || this.isTouchDragging;
	}
	cancelTouchScroll() {
		if (this.isDragging) isWindowTouchMoveCancelled = true;
	}
	initScrollWatch(ev) {
		if (this.shouldWatchScroll) {
			this.recordCoords(ev);
			window.addEventListener("scroll", this.handleScroll, true);
		}
	}
	recordCoords(ev) {
		if (this.shouldWatchScroll) {
			this.prevPageX = ev.pageX;
			this.prevPageY = ev.pageY;
			this.prevScrollX = window.scrollX;
			this.prevScrollY = window.scrollY;
		}
	}
	destroyScrollWatch() {
		if (this.shouldWatchScroll) window.removeEventListener("scroll", this.handleScroll, true);
	}
	createEventFromMouse(ev, isFirst) {
		let deltaX = 0;
		let deltaY = 0;
		if (isFirst) {
			this.origPageX = ev.pageX;
			this.origPageY = ev.pageY;
		} else {
			deltaX = ev.pageX - this.origPageX;
			deltaY = ev.pageY - this.origPageY;
		}
		return {
			origEvent: ev,
			isTouch: false,
			subjectEl: this.subjectEl,
			pageX: ev.pageX,
			pageY: ev.pageY,
			deltaX,
			deltaY
		};
	}
	createEventFromTouch(ev, isFirst) {
		let touches = ev.touches;
		let pageX;
		let pageY;
		let deltaX = 0;
		let deltaY = 0;
		if (touches && touches.length) {
			pageX = touches[0].pageX;
			pageY = touches[0].pageY;
		} else {
			pageX = ev.pageX;
			pageY = ev.pageY;
		}
		if (isFirst) {
			this.origPageX = pageX;
			this.origPageY = pageY;
		} else {
			deltaX = pageX - this.origPageX;
			deltaY = pageY - this.origPageY;
		}
		return {
			origEvent: ev,
			isTouch: true,
			subjectEl: this.subjectEl,
			pageX,
			pageY,
			deltaX,
			deltaY
		};
	}
};
function isPrimaryMouseButton(ev) {
	return ev.button === 0 && !ev.ctrlKey;
}
function startIgnoringMouse() {
	ignoreMouseDepth += 1;
	setTimeout(() => {
		ignoreMouseDepth -= 1;
	}, config.touchMouseIgnoreWait);
}
function listenerCreated() {
	listenerCnt += 1;
	if (listenerCnt === 1) window.addEventListener("touchmove", onWindowTouchMove, { passive: false });
}
function listenerDestroyed() {
	listenerCnt -= 1;
	if (!listenerCnt) window.removeEventListener("touchmove", onWindowTouchMove, { passive: false });
}
function onWindowTouchMove(ev) {
	if (isWindowTouchMoveCancelled) ev.preventDefault();
}
var ElementMirror = class {
	constructor() {
		this.isVisible = false;
		this.sourceEl = null;
		this.mirrorEl = null;
		this.sourceElRect = null;
		this.parentNode = document.body;
		this.zIndex = 9999;
		this.revertDuration = 0;
	}
	start(sourceEl, pageX, pageY) {
		this.sourceEl = sourceEl;
		this.sourceElRect = this.sourceEl.getBoundingClientRect();
		this.origScreenX = pageX - window.scrollX;
		this.origScreenY = pageY - window.scrollY;
		this.deltaX = 0;
		this.deltaY = 0;
		this.updateElPosition();
	}
	handleMove(pageX, pageY) {
		this.deltaX = pageX - window.scrollX - this.origScreenX;
		this.deltaY = pageY - window.scrollY - this.origScreenY;
		this.updateElPosition();
	}
	setIsVisible(bool) {
		if (bool) {
			if (!this.isVisible) {
				if (this.mirrorEl) this.mirrorEl.style.display = "";
				this.isVisible = bool;
				this.updateElPosition();
			}
		} else if (this.isVisible) {
			if (this.mirrorEl) this.mirrorEl.style.display = "none";
			this.isVisible = bool;
		}
	}
	stop(needsRevertAnimation, callback) {
		let done = () => {
			this.cleanup();
			callback();
		};
		if (needsRevertAnimation && this.mirrorEl && this.isVisible && this.revertDuration && (this.deltaX || this.deltaY)) this.doRevertAnimation(done, this.revertDuration);
		else setTimeout(done, 0);
	}
	doRevertAnimation(callback, revertDuration) {
		let mirrorEl = this.mirrorEl;
		let finalSourceElRect = this.sourceEl.getBoundingClientRect();
		mirrorEl.style.transition = "top " + revertDuration + "ms,left " + revertDuration + "ms";
		applyStyle(mirrorEl, {
			left: finalSourceElRect.left,
			top: finalSourceElRect.top
		});
		whenTransitionDone(mirrorEl, () => {
			mirrorEl.style.transition = "";
			callback();
		});
	}
	cleanup() {
		if (this.mirrorEl) {
			removeElement(this.mirrorEl);
			this.mirrorEl = null;
		}
		this.sourceEl = null;
	}
	updateElPosition() {
		if (this.sourceEl && this.isVisible) applyStyle(this.getMirrorEl(), {
			left: this.sourceElRect.left + this.deltaX,
			top: this.sourceElRect.top + this.deltaY
		});
	}
	getMirrorEl() {
		let sourceElRect = this.sourceElRect;
		let mirrorEl = this.mirrorEl;
		if (!mirrorEl) {
			mirrorEl = this.mirrorEl = this.sourceEl.cloneNode(true);
			mirrorEl.style.userSelect = "none";
			mirrorEl.style.webkitUserSelect = "none";
			mirrorEl.style.pointerEvents = "none";
			mirrorEl.classList.add("fc-event-dragging");
			applyStyle(mirrorEl, {
				position: "fixed",
				zIndex: this.zIndex,
				visibility: "",
				boxSizing: "border-box",
				width: sourceElRect.right - sourceElRect.left,
				height: sourceElRect.bottom - sourceElRect.top,
				right: "auto",
				bottom: "auto",
				margin: 0
			});
			this.parentNode.appendChild(mirrorEl);
		}
		return mirrorEl;
	}
};
var ScrollGeomCache = class extends ScrollController {
	constructor(scrollController, doesListening) {
		super();
		this.handleScroll = () => {
			this.scrollTop = this.scrollController.getScrollTop();
			this.scrollLeft = this.scrollController.getScrollLeft();
			this.handleScrollChange();
		};
		this.scrollController = scrollController;
		this.doesListening = doesListening;
		this.scrollTop = this.origScrollTop = scrollController.getScrollTop();
		this.scrollLeft = this.origScrollLeft = scrollController.getScrollLeft();
		this.scrollWidth = scrollController.getScrollWidth();
		this.scrollHeight = scrollController.getScrollHeight();
		this.clientWidth = scrollController.getClientWidth();
		this.clientHeight = scrollController.getClientHeight();
		this.clientRect = this.computeClientRect();
		if (this.doesListening) this.getEventTarget().addEventListener("scroll", this.handleScroll);
	}
	destroy() {
		if (this.doesListening) this.getEventTarget().removeEventListener("scroll", this.handleScroll);
	}
	getScrollTop() {
		return this.scrollTop;
	}
	getScrollLeft() {
		return this.scrollLeft;
	}
	setScrollTop(top) {
		this.scrollController.setScrollTop(top);
		if (!this.doesListening) {
			this.scrollTop = Math.max(Math.min(top, this.getMaxScrollTop()), 0);
			this.handleScrollChange();
		}
	}
	setScrollLeft(top) {
		this.scrollController.setScrollLeft(top);
		if (!this.doesListening) {
			this.scrollLeft = Math.max(Math.min(top, this.getMaxScrollLeft()), 0);
			this.handleScrollChange();
		}
	}
	getClientWidth() {
		return this.clientWidth;
	}
	getClientHeight() {
		return this.clientHeight;
	}
	getScrollWidth() {
		return this.scrollWidth;
	}
	getScrollHeight() {
		return this.scrollHeight;
	}
	handleScrollChange() {}
};
var ElementScrollGeomCache = class extends ScrollGeomCache {
	constructor(el, doesListening) {
		super(new ElementScrollController(el), doesListening);
	}
	getEventTarget() {
		return this.scrollController.el;
	}
	computeClientRect() {
		return computeInnerRect(this.scrollController.el);
	}
};
var WindowScrollGeomCache = class extends ScrollGeomCache {
	constructor(doesListening) {
		super(new WindowScrollController(), doesListening);
	}
	getEventTarget() {
		return window;
	}
	computeClientRect() {
		return {
			left: this.scrollLeft,
			right: this.scrollLeft + this.clientWidth,
			top: this.scrollTop,
			bottom: this.scrollTop + this.clientHeight
		};
	}
	handleScrollChange() {
		this.clientRect = this.computeClientRect();
	}
};
var getTime = typeof performance === "function" ? performance.now : Date.now;
var AutoScroller = class {
	constructor() {
		this.isEnabled = true;
		this.scrollQuery = [window, ".fc-scroller"];
		this.edgeThreshold = 50;
		this.maxVelocity = 300;
		this.pointerScreenX = null;
		this.pointerScreenY = null;
		this.isAnimating = false;
		this.scrollCaches = null;
		this.everMovedUp = false;
		this.everMovedDown = false;
		this.everMovedLeft = false;
		this.everMovedRight = false;
		this.animate = () => {
			if (this.isAnimating) {
				let edge = this.computeBestEdge(this.pointerScreenX + window.scrollX, this.pointerScreenY + window.scrollY);
				if (edge) {
					let now = getTime();
					this.handleSide(edge, (now - this.msSinceRequest) / 1e3);
					this.requestAnimation(now);
				} else this.isAnimating = false;
			}
		};
	}
	start(pageX, pageY, scrollStartEl) {
		if (this.isEnabled) {
			this.scrollCaches = this.buildCaches(scrollStartEl);
			this.pointerScreenX = null;
			this.pointerScreenY = null;
			this.everMovedUp = false;
			this.everMovedDown = false;
			this.everMovedLeft = false;
			this.everMovedRight = false;
			this.handleMove(pageX, pageY);
		}
	}
	handleMove(pageX, pageY) {
		if (this.isEnabled) {
			let pointerScreenX = pageX - window.scrollX;
			let pointerScreenY = pageY - window.scrollY;
			let yDelta = this.pointerScreenY === null ? 0 : pointerScreenY - this.pointerScreenY;
			let xDelta = this.pointerScreenX === null ? 0 : pointerScreenX - this.pointerScreenX;
			if (yDelta < 0) this.everMovedUp = true;
			else if (yDelta > 0) this.everMovedDown = true;
			if (xDelta < 0) this.everMovedLeft = true;
			else if (xDelta > 0) this.everMovedRight = true;
			this.pointerScreenX = pointerScreenX;
			this.pointerScreenY = pointerScreenY;
			if (!this.isAnimating) {
				this.isAnimating = true;
				this.requestAnimation(getTime());
			}
		}
	}
	stop() {
		if (this.isEnabled) {
			this.isAnimating = false;
			for (let scrollCache of this.scrollCaches) scrollCache.destroy();
			this.scrollCaches = null;
		}
	}
	requestAnimation(now) {
		this.msSinceRequest = now;
		requestAnimationFrame(this.animate);
	}
	handleSide(edge, seconds) {
		let { scrollCache } = edge;
		let { edgeThreshold } = this;
		let invDistance = edgeThreshold - edge.distance;
		let velocity = invDistance * invDistance / (edgeThreshold * edgeThreshold) * this.maxVelocity * seconds;
		let sign = 1;
		switch (edge.name) {
			case "left": sign = -1;
			case "right":
				scrollCache.setScrollLeft(scrollCache.getScrollLeft() + velocity * sign);
				break;
			case "top": sign = -1;
			case "bottom": scrollCache.setScrollTop(scrollCache.getScrollTop() + velocity * sign);
		}
	}
	computeBestEdge(left, top) {
		let { edgeThreshold } = this;
		let bestSide = null;
		let scrollCaches = this.scrollCaches || [];
		for (let scrollCache of scrollCaches) {
			let rect = scrollCache.clientRect;
			let leftDist = left - rect.left;
			let rightDist = rect.right - left;
			let topDist = top - rect.top;
			let bottomDist = rect.bottom - top;
			if (leftDist >= 0 && rightDist >= 0 && topDist >= 0 && bottomDist >= 0) {
				if (topDist <= edgeThreshold && this.everMovedUp && scrollCache.canScrollUp() && (!bestSide || bestSide.distance > topDist)) bestSide = {
					scrollCache,
					name: "top",
					distance: topDist
				};
				if (bottomDist <= edgeThreshold && this.everMovedDown && scrollCache.canScrollDown() && (!bestSide || bestSide.distance > bottomDist)) bestSide = {
					scrollCache,
					name: "bottom",
					distance: bottomDist
				};
				if (leftDist <= edgeThreshold && this.everMovedLeft && scrollCache.canScrollLeft() && (!bestSide || bestSide.distance > leftDist)) bestSide = {
					scrollCache,
					name: "left",
					distance: leftDist
				};
				if (rightDist <= edgeThreshold && this.everMovedRight && scrollCache.canScrollRight() && (!bestSide || bestSide.distance > rightDist)) bestSide = {
					scrollCache,
					name: "right",
					distance: rightDist
				};
			}
		}
		return bestSide;
	}
	buildCaches(scrollStartEl) {
		return this.queryScrollEls(scrollStartEl).map((el) => {
			if (el === window) return new WindowScrollGeomCache(false);
			return new ElementScrollGeomCache(el, false);
		});
	}
	queryScrollEls(scrollStartEl) {
		let els = [];
		for (let query of this.scrollQuery) if (typeof query === "object") els.push(query);
		else els.push(...Array.prototype.slice.call(scrollStartEl.getRootNode().querySelectorAll(query)));
		return els;
	}
};
var FeaturefulElementDragging = class extends ElementDragging {
	constructor(containerEl, selector) {
		super(containerEl);
		this.containerEl = containerEl;
		this.delay = null;
		this.minDistance = 0;
		this.touchScrollAllowed = true;
		this.mirrorNeedsRevert = false;
		this.isInteracting = false;
		this.isDragging = false;
		this.isDelayEnded = false;
		this.isDistanceSurpassed = false;
		this.delayTimeoutId = null;
		this.onPointerDown = (ev) => {
			if (!this.isDragging) {
				this.isInteracting = true;
				this.isDelayEnded = false;
				this.isDistanceSurpassed = false;
				preventSelection(document.body);
				preventContextMenu(document.body);
				if (!ev.isTouch) ev.origEvent.preventDefault();
				this.emitter.trigger("pointerdown", ev);
				if (this.isInteracting && !this.pointer.shouldIgnoreMove) {
					this.mirror.setIsVisible(false);
					this.mirror.start(ev.subjectEl, ev.pageX, ev.pageY);
					this.startDelay(ev);
					if (!this.minDistance) this.handleDistanceSurpassed(ev);
				}
			}
		};
		this.onPointerMove = (ev) => {
			if (this.isInteracting) {
				this.emitter.trigger("pointermove", ev);
				if (!this.isDistanceSurpassed) {
					let minDistance = this.minDistance;
					let distanceSq;
					let { deltaX, deltaY } = ev;
					distanceSq = deltaX * deltaX + deltaY * deltaY;
					if (distanceSq >= minDistance * minDistance) this.handleDistanceSurpassed(ev);
				}
				if (this.isDragging) {
					if (ev.origEvent.type !== "scroll") {
						this.mirror.handleMove(ev.pageX, ev.pageY);
						this.autoScroller.handleMove(ev.pageX, ev.pageY);
					}
					this.emitter.trigger("dragmove", ev);
				}
			}
		};
		this.onPointerUp = (ev) => {
			if (this.isInteracting) {
				this.isInteracting = false;
				allowSelection(document.body);
				allowContextMenu(document.body);
				this.emitter.trigger("pointerup", ev);
				if (this.isDragging) {
					this.autoScroller.stop();
					this.tryStopDrag(ev);
				}
				if (this.delayTimeoutId) {
					clearTimeout(this.delayTimeoutId);
					this.delayTimeoutId = null;
				}
			}
		};
		let pointer = this.pointer = new PointerDragging(containerEl);
		pointer.emitter.on("pointerdown", this.onPointerDown);
		pointer.emitter.on("pointermove", this.onPointerMove);
		pointer.emitter.on("pointerup", this.onPointerUp);
		if (selector) pointer.selector = selector;
		this.mirror = new ElementMirror();
		this.autoScroller = new AutoScroller();
	}
	destroy() {
		this.pointer.destroy();
		this.onPointerUp({});
	}
	startDelay(ev) {
		if (typeof this.delay === "number") this.delayTimeoutId = setTimeout(() => {
			this.delayTimeoutId = null;
			this.handleDelayEnd(ev);
		}, this.delay);
		else this.handleDelayEnd(ev);
	}
	handleDelayEnd(ev) {
		this.isDelayEnded = true;
		this.tryStartDrag(ev);
	}
	handleDistanceSurpassed(ev) {
		this.isDistanceSurpassed = true;
		this.tryStartDrag(ev);
	}
	tryStartDrag(ev) {
		if (this.isDelayEnded && this.isDistanceSurpassed) {
			if (!this.pointer.wasTouchScroll || this.touchScrollAllowed) {
				this.isDragging = true;
				this.mirrorNeedsRevert = false;
				this.autoScroller.start(ev.pageX, ev.pageY, this.containerEl);
				this.emitter.trigger("dragstart", ev);
				if (this.touchScrollAllowed === false) this.pointer.cancelTouchScroll();
			}
		}
	}
	tryStopDrag(ev) {
		this.mirror.stop(this.mirrorNeedsRevert, this.stopDrag.bind(this, ev));
	}
	stopDrag(ev) {
		this.isDragging = false;
		this.emitter.trigger("dragend", ev);
	}
	setIgnoreMove(bool) {
		this.pointer.shouldIgnoreMove = bool;
	}
	setMirrorIsVisible(bool) {
		this.mirror.setIsVisible(bool);
	}
	setMirrorNeedsRevert(bool) {
		this.mirrorNeedsRevert = bool;
	}
	setAutoScrollEnabled(bool) {
		this.autoScroller.isEnabled = bool;
	}
};
var OffsetTracker = class {
	constructor(el) {
		this.el = el;
		this.origRect = computeRect(el);
		this.scrollCaches = getClippingParents(el).map((scrollEl) => new ElementScrollGeomCache(scrollEl, true));
	}
	destroy() {
		for (let scrollCache of this.scrollCaches) scrollCache.destroy();
	}
	computeLeft() {
		let left = this.origRect.left;
		for (let scrollCache of this.scrollCaches) left += scrollCache.origScrollLeft - scrollCache.getScrollLeft();
		return left;
	}
	computeTop() {
		let top = this.origRect.top;
		for (let scrollCache of this.scrollCaches) top += scrollCache.origScrollTop - scrollCache.getScrollTop();
		return top;
	}
	isWithinClipping(pageX, pageY) {
		let point = {
			left: pageX,
			top: pageY
		};
		for (let scrollCache of this.scrollCaches) if (!isIgnoredClipping(scrollCache.getEventTarget()) && !pointInsideRect(point, scrollCache.clientRect)) return false;
		return true;
	}
};
function isIgnoredClipping(node) {
	let tagName = node.tagName;
	return tagName === "HTML" || tagName === "BODY";
}
var HitDragging = class {
	constructor(dragging, droppableStore) {
		this.useSubjectCenter = false;
		this.requireInitial = true;
		this.disablePointCheck = false;
		this.initialHit = null;
		this.movingHit = null;
		this.finalHit = null;
		this.handlePointerDown = (ev) => {
			let { dragging } = this;
			this.initialHit = null;
			this.movingHit = null;
			this.finalHit = null;
			this.prepareHits();
			this.processFirstCoord(ev);
			if (this.initialHit || !this.requireInitial) {
				dragging.setIgnoreMove(false);
				this.emitter.trigger("pointerdown", ev);
			} else dragging.setIgnoreMove(true);
		};
		this.handleDragStart = (ev) => {
			this.emitter.trigger("dragstart", ev);
			this.handleMove(ev, true);
		};
		this.handleDragMove = (ev) => {
			this.emitter.trigger("dragmove", ev);
			this.handleMove(ev);
		};
		this.handlePointerUp = (ev) => {
			this.releaseHits();
			this.emitter.trigger("pointerup", ev);
		};
		this.handleDragEnd = (ev) => {
			if (this.movingHit) this.emitter.trigger("hitupdate", null, true, ev);
			this.finalHit = this.movingHit;
			this.movingHit = null;
			this.emitter.trigger("dragend", ev);
		};
		this.droppableStore = droppableStore;
		dragging.emitter.on("pointerdown", this.handlePointerDown);
		dragging.emitter.on("dragstart", this.handleDragStart);
		dragging.emitter.on("dragmove", this.handleDragMove);
		dragging.emitter.on("pointerup", this.handlePointerUp);
		dragging.emitter.on("dragend", this.handleDragEnd);
		this.dragging = dragging;
		this.emitter = new Emitter();
	}
	processFirstCoord(ev) {
		let origPoint = {
			left: ev.pageX,
			top: ev.pageY
		};
		let adjustedPoint = origPoint;
		let subjectEl = ev.subjectEl;
		let subjectRect;
		if (subjectEl instanceof HTMLElement) {
			subjectRect = computeRect(subjectEl);
			adjustedPoint = constrainPoint(adjustedPoint, subjectRect);
		}
		let initialHit = this.initialHit = this.queryHitForOffset(adjustedPoint.left, adjustedPoint.top);
		if (initialHit) {
			if (this.useSubjectCenter && subjectRect) {
				let slicedSubjectRect = intersectRects(subjectRect, initialHit.rect);
				if (slicedSubjectRect) adjustedPoint = getRectCenter(slicedSubjectRect);
			}
			this.coordAdjust = diffPoints(adjustedPoint, origPoint);
		} else this.coordAdjust = {
			left: 0,
			top: 0
		};
	}
	handleMove(ev, forceHandle) {
		let hit = this.queryHitForOffset(ev.pageX + this.coordAdjust.left, ev.pageY + this.coordAdjust.top);
		if (forceHandle || !isHitsEqual(this.movingHit, hit)) {
			this.movingHit = hit;
			this.emitter.trigger("hitupdate", hit, false, ev);
		}
	}
	prepareHits() {
		this.offsetTrackers = mapHash(this.droppableStore, (interactionSettings) => {
			interactionSettings.component.prepareHits();
			return new OffsetTracker(interactionSettings.el);
		});
	}
	releaseHits() {
		let { offsetTrackers } = this;
		for (let id in offsetTrackers) offsetTrackers[id].destroy();
		this.offsetTrackers = {};
	}
	queryHitForOffset(offsetLeft, offsetTop) {
		let { droppableStore, offsetTrackers } = this;
		let bestHit = null;
		for (let id in droppableStore) {
			let component = droppableStore[id].component;
			let offsetTracker = offsetTrackers[id];
			if (offsetTracker && offsetTracker.isWithinClipping(offsetLeft, offsetTop)) {
				let originLeft = offsetTracker.computeLeft();
				let originTop = offsetTracker.computeTop();
				let positionLeft = offsetLeft - originLeft;
				let positionTop = offsetTop - originTop;
				let { origRect } = offsetTracker;
				let width = origRect.right - origRect.left;
				let height = origRect.bottom - origRect.top;
				if (positionLeft >= 0 && positionLeft < width && positionTop >= 0 && positionTop < height) {
					let hit = component.queryHit(positionLeft, positionTop, width, height);
					if (hit && rangeContainsRange(hit.dateProfile.activeRange, hit.dateSpan.range) && (this.disablePointCheck || offsetTracker.el.contains(offsetTracker.el.getRootNode().elementFromPoint(positionLeft + originLeft - window.scrollX, positionTop + originTop - window.scrollY))) && (!bestHit || hit.layer > bestHit.layer)) {
						hit.componentId = id;
						hit.context = component.context;
						hit.rect.left += originLeft;
						hit.rect.right += originLeft;
						hit.rect.top += originTop;
						hit.rect.bottom += originTop;
						bestHit = hit;
					}
				}
			}
		}
		return bestHit;
	}
};
function isHitsEqual(hit0, hit1) {
	if (!hit0 && !hit1) return true;
	if (Boolean(hit0) !== Boolean(hit1)) return false;
	return isDateSpansEqual(hit0.dateSpan, hit1.dateSpan);
}
function buildDatePointApiWithContext(dateSpan, context) {
	let props = {};
	for (let transform of context.pluginHooks.datePointTransforms) Object.assign(props, transform(dateSpan, context));
	Object.assign(props, buildDatePointApi(dateSpan, context.dateEnv));
	return props;
}
function buildDatePointApi(span, dateEnv) {
	return {
		date: dateEnv.toDate(span.range.start),
		dateStr: dateEnv.formatIso(span.range.start, { omitTime: span.allDay }),
		allDay: span.allDay
	};
}
var DateClicking = class extends Interaction {
	constructor(settings) {
		super(settings);
		this.handlePointerDown = (pev) => {
			let { dragging } = this;
			let downEl = pev.origEvent.target;
			dragging.setIgnoreMove(!this.component.isValidDateDownEl(downEl));
		};
		this.handleDragEnd = (ev) => {
			let { component } = this;
			let { pointer } = this.dragging;
			if (!pointer.wasTouchScroll) {
				let { initialHit, finalHit } = this.hitDragging;
				if (initialHit && finalHit && isHitsEqual(initialHit, finalHit)) {
					let { context } = component;
					let arg = Object.assign(Object.assign({}, buildDatePointApiWithContext(initialHit.dateSpan, context)), {
						dayEl: initialHit.dayEl,
						jsEvent: ev.origEvent,
						view: context.viewApi || context.calendarApi.view
					});
					context.emitter.trigger("dateClick", arg);
				}
			}
		};
		this.dragging = new FeaturefulElementDragging(settings.el);
		this.dragging.autoScroller.isEnabled = false;
		let hitDragging = this.hitDragging = new HitDragging(this.dragging, interactionSettingsToStore(settings));
		hitDragging.emitter.on("pointerdown", this.handlePointerDown);
		hitDragging.emitter.on("dragend", this.handleDragEnd);
	}
	destroy() {
		this.dragging.destroy();
	}
};
var DateSelecting = class extends Interaction {
	constructor(settings) {
		super(settings);
		this.dragSelection = null;
		this.handlePointerDown = (ev) => {
			let { component, dragging } = this;
			let { options } = component.context;
			let canSelect = options.selectable && component.isValidDateDownEl(ev.origEvent.target);
			dragging.setIgnoreMove(!canSelect);
			dragging.delay = ev.isTouch ? getComponentTouchDelay$1(component) : null;
		};
		this.handleDragStart = (ev) => {
			this.component.context.calendarApi.unselect(ev);
		};
		this.handleHitUpdate = (hit, isFinal) => {
			let { context } = this.component;
			let dragSelection = null;
			let isInvalid = false;
			if (hit) {
				let initialHit = this.hitDragging.initialHit;
				if (!(hit.componentId === initialHit.componentId && this.isHitComboAllowed && !this.isHitComboAllowed(initialHit, hit))) dragSelection = joinHitsIntoSelection(initialHit, hit, context.pluginHooks.dateSelectionTransformers);
				if (!dragSelection || !isDateSelectionValid(dragSelection, hit.dateProfile, context)) {
					isInvalid = true;
					dragSelection = null;
				}
			}
			if (dragSelection) context.dispatch({
				type: "SELECT_DATES",
				selection: dragSelection
			});
			else if (!isFinal) context.dispatch({ type: "UNSELECT_DATES" });
			if (!isInvalid) enableCursor();
			else disableCursor();
			if (!isFinal) this.dragSelection = dragSelection;
		};
		this.handlePointerUp = (pev) => {
			if (this.dragSelection) {
				triggerDateSelect(this.dragSelection, pev, this.component.context);
				this.dragSelection = null;
			}
		};
		let { component } = settings;
		let { options } = component.context;
		let dragging = this.dragging = new FeaturefulElementDragging(settings.el);
		dragging.touchScrollAllowed = false;
		dragging.minDistance = options.selectMinDistance || 0;
		dragging.autoScroller.isEnabled = options.dragScroll;
		let hitDragging = this.hitDragging = new HitDragging(this.dragging, interactionSettingsToStore(settings));
		hitDragging.emitter.on("pointerdown", this.handlePointerDown);
		hitDragging.emitter.on("dragstart", this.handleDragStart);
		hitDragging.emitter.on("hitupdate", this.handleHitUpdate);
		hitDragging.emitter.on("pointerup", this.handlePointerUp);
	}
	destroy() {
		this.dragging.destroy();
	}
};
function getComponentTouchDelay$1(component) {
	let { options } = component.context;
	let delay = options.selectLongPressDelay;
	if (delay == null) delay = options.longPressDelay;
	return delay;
}
function joinHitsIntoSelection(hit0, hit1, dateSelectionTransformers) {
	let dateSpan0 = hit0.dateSpan;
	let dateSpan1 = hit1.dateSpan;
	let ms = [
		dateSpan0.range.start,
		dateSpan0.range.end,
		dateSpan1.range.start,
		dateSpan1.range.end
	];
	ms.sort(compareNumbers);
	let props = {};
	for (let transformer of dateSelectionTransformers) {
		let res = transformer(hit0, hit1);
		if (res === false) return null;
		if (res) Object.assign(props, res);
	}
	props.range = {
		start: ms[0],
		end: ms[3]
	};
	props.allDay = dateSpan0.allDay;
	return props;
}
var EventDragging = class EventDragging extends Interaction {
	constructor(settings) {
		super(settings);
		this.subjectEl = null;
		this.subjectSeg = null;
		this.isDragging = false;
		this.eventRange = null;
		this.relevantEvents = null;
		this.receivingContext = null;
		this.validMutation = null;
		this.mutatedRelevantEvents = null;
		this.handlePointerDown = (ev) => {
			let origTarget = ev.origEvent.target;
			let { component, dragging } = this;
			let { mirror } = dragging;
			let { options } = component.context;
			let initialContext = component.context;
			this.subjectEl = ev.subjectEl;
			let subjectSeg = this.subjectSeg = getElSeg(ev.subjectEl);
			let eventInstanceId = (this.eventRange = subjectSeg.eventRange).instance.instanceId;
			this.relevantEvents = getRelevantEvents(initialContext.getCurrentData().eventStore, eventInstanceId);
			dragging.minDistance = ev.isTouch ? 0 : options.eventDragMinDistance;
			dragging.delay = ev.isTouch && eventInstanceId !== component.props.eventSelection ? getComponentTouchDelay(component) : null;
			if (options.fixedMirrorParent) mirror.parentNode = options.fixedMirrorParent;
			else mirror.parentNode = elementClosest(origTarget, ".fc");
			mirror.revertDuration = options.dragRevertDuration;
			let isValid = component.isValidSegDownEl(origTarget) && !elementClosest(origTarget, ".fc-event-resizer");
			dragging.setIgnoreMove(!isValid);
			this.isDragging = isValid && ev.subjectEl.classList.contains("fc-event-draggable");
		};
		this.handleDragStart = (ev) => {
			let initialContext = this.component.context;
			let eventRange = this.eventRange;
			let eventInstanceId = eventRange.instance.instanceId;
			if (ev.isTouch) {
				if (eventInstanceId !== this.component.props.eventSelection) initialContext.dispatch({
					type: "SELECT_EVENT",
					eventInstanceId
				});
			} else initialContext.dispatch({ type: "UNSELECT_EVENT" });
			if (this.isDragging) {
				initialContext.calendarApi.unselect(ev);
				initialContext.emitter.trigger("eventDragStart", {
					el: this.subjectEl,
					event: new EventImpl(initialContext, eventRange.def, eventRange.instance),
					jsEvent: ev.origEvent,
					view: initialContext.viewApi
				});
			}
		};
		this.handleHitUpdate = (hit, isFinal) => {
			if (!this.isDragging) return;
			let relevantEvents = this.relevantEvents;
			let initialHit = this.hitDragging.initialHit;
			let initialContext = this.component.context;
			let receivingContext = null;
			let mutation = null;
			let mutatedRelevantEvents = null;
			let isInvalid = false;
			let interaction = {
				affectedEvents: relevantEvents,
				mutatedEvents: createEmptyEventStore(),
				isEvent: true
			};
			if (hit) {
				receivingContext = hit.context;
				let receivingOptions = receivingContext.options;
				if (initialContext === receivingContext || receivingOptions.editable && receivingOptions.droppable) {
					mutation = computeEventMutation(initialHit, hit, this.eventRange.instance.range.start, receivingContext.getCurrentData().pluginHooks.eventDragMutationMassagers);
					if (mutation) {
						mutatedRelevantEvents = applyMutationToEventStore(relevantEvents, receivingContext.getCurrentData().eventUiBases, mutation, receivingContext);
						interaction.mutatedEvents = mutatedRelevantEvents;
						if (!isInteractionValid(interaction, hit.dateProfile, receivingContext)) {
							isInvalid = true;
							mutation = null;
							mutatedRelevantEvents = null;
							interaction.mutatedEvents = createEmptyEventStore();
						}
					}
				} else receivingContext = null;
			}
			this.displayDrag(receivingContext, interaction);
			if (!isInvalid) enableCursor();
			else disableCursor();
			if (!isFinal) {
				if (initialContext === receivingContext && isHitsEqual(initialHit, hit)) mutation = null;
				this.dragging.setMirrorNeedsRevert(!mutation);
				this.dragging.setMirrorIsVisible(!hit || !this.subjectEl.getRootNode().querySelector(".fc-event-mirror"));
				this.receivingContext = receivingContext;
				this.validMutation = mutation;
				this.mutatedRelevantEvents = mutatedRelevantEvents;
			}
		};
		this.handlePointerUp = () => {
			if (!this.isDragging) this.cleanup();
		};
		this.handleDragEnd = (ev) => {
			if (this.isDragging) {
				let initialContext = this.component.context;
				let initialView = initialContext.viewApi;
				let { receivingContext, validMutation } = this;
				let eventDef = this.eventRange.def;
				let eventInstance = this.eventRange.instance;
				let eventApi = new EventImpl(initialContext, eventDef, eventInstance);
				let relevantEvents = this.relevantEvents;
				let mutatedRelevantEvents = this.mutatedRelevantEvents;
				let { finalHit } = this.hitDragging;
				this.clearDrag();
				initialContext.emitter.trigger("eventDragStop", {
					el: this.subjectEl,
					event: eventApi,
					jsEvent: ev.origEvent,
					view: initialView
				});
				if (validMutation) {
					if (receivingContext === initialContext) {
						let updatedEventApi = new EventImpl(initialContext, mutatedRelevantEvents.defs[eventDef.defId], eventInstance ? mutatedRelevantEvents.instances[eventInstance.instanceId] : null);
						initialContext.dispatch({
							type: "MERGE_EVENTS",
							eventStore: mutatedRelevantEvents
						});
						let eventChangeArg = {
							oldEvent: eventApi,
							event: updatedEventApi,
							relatedEvents: buildEventApis(mutatedRelevantEvents, initialContext, eventInstance),
							revert() {
								initialContext.dispatch({
									type: "MERGE_EVENTS",
									eventStore: relevantEvents
								});
							}
						};
						let transformed = {};
						for (let transformer of initialContext.getCurrentData().pluginHooks.eventDropTransformers) Object.assign(transformed, transformer(validMutation, initialContext, eventDef));
						initialContext.emitter.trigger("eventDrop", Object.assign(Object.assign(Object.assign({}, eventChangeArg), transformed), {
							el: ev.subjectEl,
							delta: validMutation.datesDelta,
							jsEvent: ev.origEvent,
							view: initialView
						}));
						initialContext.emitter.trigger("eventChange", eventChangeArg);
					} else if (receivingContext) {
						let eventRemoveArg = {
							event: eventApi,
							relatedEvents: buildEventApis(relevantEvents, initialContext, eventInstance),
							revert() {
								initialContext.dispatch({
									type: "MERGE_EVENTS",
									eventStore: relevantEvents
								});
							}
						};
						initialContext.emitter.trigger("eventLeave", Object.assign(Object.assign({}, eventRemoveArg), {
							draggedEl: ev.subjectEl,
							view: initialView
						}));
						initialContext.dispatch({
							type: "REMOVE_EVENTS",
							eventStore: relevantEvents
						});
						initialContext.emitter.trigger("eventRemove", eventRemoveArg);
						let addedEventDef = mutatedRelevantEvents.defs[eventDef.defId];
						let addedEventInstance = mutatedRelevantEvents.instances[eventInstance.instanceId];
						let addedEventApi = new EventImpl(receivingContext, addedEventDef, addedEventInstance);
						receivingContext.dispatch({
							type: "MERGE_EVENTS",
							eventStore: mutatedRelevantEvents
						});
						let eventAddArg = {
							event: addedEventApi,
							relatedEvents: buildEventApis(mutatedRelevantEvents, receivingContext, addedEventInstance),
							revert() {
								receivingContext.dispatch({
									type: "REMOVE_EVENTS",
									eventStore: mutatedRelevantEvents
								});
							}
						};
						receivingContext.emitter.trigger("eventAdd", eventAddArg);
						if (ev.isTouch) receivingContext.dispatch({
							type: "SELECT_EVENT",
							eventInstanceId: eventInstance.instanceId
						});
						receivingContext.emitter.trigger("drop", Object.assign(Object.assign({}, buildDatePointApiWithContext(finalHit.dateSpan, receivingContext)), {
							draggedEl: ev.subjectEl,
							jsEvent: ev.origEvent,
							view: finalHit.context.viewApi
						}));
						receivingContext.emitter.trigger("eventReceive", Object.assign(Object.assign({}, eventAddArg), {
							draggedEl: ev.subjectEl,
							view: finalHit.context.viewApi
						}));
					}
				} else initialContext.emitter.trigger("_noEventDrop");
			}
			this.cleanup();
		};
		let { component } = this;
		let { options } = component.context;
		let dragging = this.dragging = new FeaturefulElementDragging(settings.el);
		dragging.pointer.selector = EventDragging.SELECTOR;
		dragging.touchScrollAllowed = false;
		dragging.autoScroller.isEnabled = options.dragScroll;
		let hitDragging = this.hitDragging = new HitDragging(this.dragging, interactionSettingsStore);
		hitDragging.useSubjectCenter = settings.useEventCenter;
		hitDragging.emitter.on("pointerdown", this.handlePointerDown);
		hitDragging.emitter.on("dragstart", this.handleDragStart);
		hitDragging.emitter.on("hitupdate", this.handleHitUpdate);
		hitDragging.emitter.on("pointerup", this.handlePointerUp);
		hitDragging.emitter.on("dragend", this.handleDragEnd);
	}
	destroy() {
		this.dragging.destroy();
	}
	displayDrag(nextContext, state) {
		let initialContext = this.component.context;
		let prevContext = this.receivingContext;
		if (prevContext && prevContext !== nextContext) if (prevContext === initialContext) prevContext.dispatch({
			type: "SET_EVENT_DRAG",
			state: {
				affectedEvents: state.affectedEvents,
				mutatedEvents: createEmptyEventStore(),
				isEvent: true
			}
		});
		else prevContext.dispatch({ type: "UNSET_EVENT_DRAG" });
		if (nextContext) nextContext.dispatch({
			type: "SET_EVENT_DRAG",
			state
		});
	}
	clearDrag() {
		let initialCalendar = this.component.context;
		let { receivingContext } = this;
		if (receivingContext) receivingContext.dispatch({ type: "UNSET_EVENT_DRAG" });
		if (initialCalendar !== receivingContext) initialCalendar.dispatch({ type: "UNSET_EVENT_DRAG" });
	}
	cleanup() {
		this.subjectSeg = null;
		this.isDragging = false;
		this.eventRange = null;
		this.relevantEvents = null;
		this.receivingContext = null;
		this.validMutation = null;
		this.mutatedRelevantEvents = null;
	}
};
EventDragging.SELECTOR = ".fc-event-draggable, .fc-event-resizable";
function computeEventMutation(hit0, hit1, eventInstanceStart, massagers) {
	let dateSpan0 = hit0.dateSpan;
	let dateSpan1 = hit1.dateSpan;
	let date0 = dateSpan0.range.start;
	let date1 = dateSpan1.range.start;
	let standardProps = {};
	if (dateSpan0.allDay !== dateSpan1.allDay) {
		standardProps.allDay = dateSpan1.allDay;
		standardProps.hasEnd = hit1.context.options.allDayMaintainDuration;
		if (dateSpan1.allDay) date0 = startOfDay(eventInstanceStart);
		else date0 = eventInstanceStart;
	}
	let delta = diffDates(date0, date1, hit0.context.dateEnv, hit0.componentId === hit1.componentId ? hit0.largeUnit : null);
	if (delta.milliseconds) standardProps.allDay = false;
	let mutation = {
		datesDelta: delta,
		standardProps
	};
	for (let massager of massagers) massager(mutation, hit0, hit1);
	return mutation;
}
function getComponentTouchDelay(component) {
	let { options } = component.context;
	let delay = options.eventLongPressDelay;
	if (delay == null) delay = options.longPressDelay;
	return delay;
}
var EventResizing = class extends Interaction {
	constructor(settings) {
		super(settings);
		this.draggingSegEl = null;
		this.draggingSeg = null;
		this.eventRange = null;
		this.relevantEvents = null;
		this.validMutation = null;
		this.mutatedRelevantEvents = null;
		this.handlePointerDown = (ev) => {
			let { component } = this;
			let seg = getElSeg(this.querySegEl(ev));
			let eventRange = this.eventRange = seg.eventRange;
			this.dragging.minDistance = component.context.options.eventDragMinDistance;
			this.dragging.setIgnoreMove(!this.component.isValidSegDownEl(ev.origEvent.target) || ev.isTouch && this.component.props.eventSelection !== eventRange.instance.instanceId);
		};
		this.handleDragStart = (ev) => {
			let { context } = this.component;
			let eventRange = this.eventRange;
			this.relevantEvents = getRelevantEvents(context.getCurrentData().eventStore, this.eventRange.instance.instanceId);
			let segEl = this.querySegEl(ev);
			this.draggingSegEl = segEl;
			this.draggingSeg = getElSeg(segEl);
			context.calendarApi.unselect();
			context.emitter.trigger("eventResizeStart", {
				el: segEl,
				event: new EventImpl(context, eventRange.def, eventRange.instance),
				jsEvent: ev.origEvent,
				view: context.viewApi
			});
		};
		this.handleHitUpdate = (hit, isFinal, ev) => {
			let { context } = this.component;
			let relevantEvents = this.relevantEvents;
			let initialHit = this.hitDragging.initialHit;
			let eventInstance = this.eventRange.instance;
			let mutation = null;
			let mutatedRelevantEvents = null;
			let isInvalid = false;
			let interaction = {
				affectedEvents: relevantEvents,
				mutatedEvents: createEmptyEventStore(),
				isEvent: true
			};
			if (hit) {
				if (!(hit.componentId === initialHit.componentId && this.isHitComboAllowed && !this.isHitComboAllowed(initialHit, hit))) mutation = computeMutation(initialHit, hit, ev.subjectEl.classList.contains("fc-event-resizer-start"), eventInstance.range);
			}
			if (mutation) {
				mutatedRelevantEvents = applyMutationToEventStore(relevantEvents, context.getCurrentData().eventUiBases, mutation, context);
				interaction.mutatedEvents = mutatedRelevantEvents;
				if (!isInteractionValid(interaction, hit.dateProfile, context)) {
					isInvalid = true;
					mutation = null;
					mutatedRelevantEvents = null;
					interaction.mutatedEvents = null;
				}
			}
			if (mutatedRelevantEvents) context.dispatch({
				type: "SET_EVENT_RESIZE",
				state: interaction
			});
			else context.dispatch({ type: "UNSET_EVENT_RESIZE" });
			if (!isInvalid) enableCursor();
			else disableCursor();
			if (!isFinal) {
				if (mutation && isHitsEqual(initialHit, hit)) mutation = null;
				this.validMutation = mutation;
				this.mutatedRelevantEvents = mutatedRelevantEvents;
			}
		};
		this.handleDragEnd = (ev) => {
			let { context } = this.component;
			let eventDef = this.eventRange.def;
			let eventInstance = this.eventRange.instance;
			let eventApi = new EventImpl(context, eventDef, eventInstance);
			let relevantEvents = this.relevantEvents;
			let mutatedRelevantEvents = this.mutatedRelevantEvents;
			context.emitter.trigger("eventResizeStop", {
				el: this.draggingSegEl,
				event: eventApi,
				jsEvent: ev.origEvent,
				view: context.viewApi
			});
			if (this.validMutation) {
				let updatedEventApi = new EventImpl(context, mutatedRelevantEvents.defs[eventDef.defId], eventInstance ? mutatedRelevantEvents.instances[eventInstance.instanceId] : null);
				context.dispatch({
					type: "MERGE_EVENTS",
					eventStore: mutatedRelevantEvents
				});
				let eventChangeArg = {
					oldEvent: eventApi,
					event: updatedEventApi,
					relatedEvents: buildEventApis(mutatedRelevantEvents, context, eventInstance),
					revert() {
						context.dispatch({
							type: "MERGE_EVENTS",
							eventStore: relevantEvents
						});
					}
				};
				context.emitter.trigger("eventResize", Object.assign(Object.assign({}, eventChangeArg), {
					el: this.draggingSegEl,
					startDelta: this.validMutation.startDelta || createDuration(0),
					endDelta: this.validMutation.endDelta || createDuration(0),
					jsEvent: ev.origEvent,
					view: context.viewApi
				}));
				context.emitter.trigger("eventChange", eventChangeArg);
			} else context.emitter.trigger("_noEventResize");
			this.draggingSeg = null;
			this.relevantEvents = null;
			this.validMutation = null;
		};
		let { component } = settings;
		let dragging = this.dragging = new FeaturefulElementDragging(settings.el);
		dragging.pointer.selector = ".fc-event-resizer";
		dragging.touchScrollAllowed = false;
		dragging.autoScroller.isEnabled = component.context.options.dragScroll;
		let hitDragging = this.hitDragging = new HitDragging(this.dragging, interactionSettingsToStore(settings));
		hitDragging.emitter.on("pointerdown", this.handlePointerDown);
		hitDragging.emitter.on("dragstart", this.handleDragStart);
		hitDragging.emitter.on("hitupdate", this.handleHitUpdate);
		hitDragging.emitter.on("dragend", this.handleDragEnd);
	}
	destroy() {
		this.dragging.destroy();
	}
	querySegEl(ev) {
		return elementClosest(ev.subjectEl, ".fc-event");
	}
};
function computeMutation(hit0, hit1, isFromStart, instanceRange) {
	let dateEnv = hit0.context.dateEnv;
	let date0 = hit0.dateSpan.range.start;
	let date1 = hit1.dateSpan.range.start;
	let delta = diffDates(date0, date1, dateEnv, hit0.largeUnit);
	if (isFromStart) {
		if (dateEnv.add(instanceRange.start, delta) < instanceRange.end) return { startDelta: delta };
	} else if (dateEnv.add(instanceRange.end, delta) > instanceRange.start) return { endDelta: delta };
	return null;
}
var UnselectAuto = class {
	constructor(context) {
		this.context = context;
		this.isRecentPointerDateSelect = false;
		this.matchesCancel = false;
		this.matchesEvent = false;
		this.onSelect = (selectInfo) => {
			if (selectInfo.jsEvent) this.isRecentPointerDateSelect = true;
		};
		this.onDocumentPointerDown = (pev) => {
			let unselectCancel = this.context.options.unselectCancel;
			let downEl = getEventTargetViaRoot(pev.origEvent);
			this.matchesCancel = !!elementClosest(downEl, unselectCancel);
			this.matchesEvent = !!elementClosest(downEl, EventDragging.SELECTOR);
		};
		this.onDocumentPointerUp = (pev) => {
			let { context } = this;
			let { documentPointer } = this;
			let calendarState = context.getCurrentData();
			if (!documentPointer.wasTouchScroll) {
				if (calendarState.dateSelection && !this.isRecentPointerDateSelect) {
					let unselectAuto = context.options.unselectAuto;
					if (unselectAuto && (!unselectAuto || !this.matchesCancel)) context.calendarApi.unselect(pev);
				}
				if (calendarState.eventSelection && !this.matchesEvent) context.dispatch({ type: "UNSELECT_EVENT" });
			}
			this.isRecentPointerDateSelect = false;
		};
		let documentPointer = this.documentPointer = new PointerDragging(document);
		documentPointer.shouldIgnoreMove = true;
		documentPointer.shouldWatchScroll = false;
		documentPointer.emitter.on("pointerdown", this.onDocumentPointerDown);
		documentPointer.emitter.on("pointerup", this.onDocumentPointerUp);
		context.emitter.on("select", this.onSelect);
	}
	destroy() {
		this.context.emitter.off("select", this.onSelect);
		this.documentPointer.destroy();
	}
};
var OPTION_REFINERS = { fixedMirrorParent: identity };
var LISTENER_REFINERS = {
	dateClick: identity,
	eventDragStart: identity,
	eventDragStop: identity,
	eventDrop: identity,
	eventResizeStart: identity,
	eventResizeStop: identity,
	eventResize: identity,
	drop: identity,
	eventReceive: identity,
	eventLeave: identity
};
config.dataAttrPrefix = "";
var index = createPlugin({
	name: "@fullcalendar/interaction",
	componentInteractions: [
		DateClicking,
		DateSelecting,
		EventDragging,
		EventResizing
	],
	calendarInteractions: [UnselectAuto],
	elementDraggingImpl: FeaturefulElementDragging,
	optionRefiners: OPTION_REFINERS,
	listenerRefiners: LISTENER_REFINERS
});
//#endregion
//#region src/routes/projects.tsx?tsr-split=component
var import_jsx_runtime = require_jsx_runtime();
var statusColors = {
	Inquiry: {
		bg: "oklch(0.45 0.04 250 / 85%)",
		border: "oklch(0.6 0.05 250)",
		text: "#ffffff"
	},
	Quoted: {
		bg: "oklch(0.68 0.12 80)",
		border: "oklch(0.83 0.13 82)",
		text: "#18181b"
	},
	"In production": {
		bg: "oklch(0.83 0.13 82)",
		border: "oklch(0.9 0.12 82)",
		text: "#18181b"
	},
	Delivered: {
		bg: "oklch(0.68 0.13 155)",
		border: "oklch(0.78 0.13 155)",
		text: "#09150f"
	},
	Closed: {
		bg: "oklch(0.55 0.1 155)",
		border: "oklch(0.72 0.12 155)",
		text: "#ffffff"
	},
	"On hold": {
		bg: "oklch(0.45 0.02 60)",
		border: "oklch(0.6 0.02 60)",
		text: "#ffffff"
	},
	Lost: {
		bg: "oklch(0.6 0.15 22)",
		border: "oklch(0.7 0.14 22)",
		text: "#ffffff"
	}
};
function toIsoDate(d) {
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function Page() {
	const db = useDB((d) => d);
	const nav = useNavigate();
	const [view, setView] = (0, import_react.useState)("board");
	const [f, setF] = (0, import_react.useState)("All");
	const [showArchivedCols, setShowArchivedCols] = (0, import_react.useState)(false);
	const [edit, setEdit] = (0, import_react.useState)(null);
	const [activeDragId, setActiveDragId] = (0, import_react.useState)(null);
	const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(TouchSensor, { activationConstraint: {
		delay: 180,
		tolerance: 8
	} }));
	const fields = [
		{
			k: "name",
			label: "Project name",
			wide: true
		},
		{
			k: "clientId",
			label: "Client",
			type: "select",
			options: db.clients.map((c) => ({
				value: c.id,
				label: c.name
			}))
		},
		{
			k: "serviceId",
			label: "Service",
			type: "select",
			options: db.services.map((s) => ({
				value: s.id,
				label: `${s.code} · ${s.name}`
			}))
		},
		{
			k: "status",
			label: "Status",
			type: "select",
			options: [...PROJECT_STATUSES]
		},
		{
			k: "quote",
			label: "Quote (USD)",
			type: "number"
		},
		{
			k: "start",
			label: "Start",
			type: "date"
		},
		{
			k: "due",
			label: "Due",
			type: "date"
		},
		{
			k: "delivered",
			label: "Delivered",
			type: "date"
		}
	];
	const t = today();
	const rows = db.projects.filter((p) => f === "All" || p.status === f);
	const cost = (p) => db.expenses.filter((e) => e.projectId === p.id).reduce((a, e) => a + toUSD(e.amount, e.currency, db.settings.khrRate), 0);
	const projectBilling = (p) => {
		const docs = db.invoices.filter((i) => i.projectId === p.id);
		const bills = docs.filter(isInvoice).map((i) => invoiceView(i, db));
		return {
			docs,
			billed: bills.reduce((a, x) => a + x.totalUSD, 0),
			paid: bills.reduce((a, x) => a + toUSD(x.paid, "USD", db.settings.khrRate), 0)
		};
	};
	const blank = (overrides = {}) => ({
		id: uid(),
		code: nextCode("RVD-", db.projects.map((p) => p.code), 101, 3),
		clientId: "",
		serviceId: "",
		name: "",
		status: "Inquiry",
		start: "",
		due: "",
		delivered: "",
		quote: 0,
		...overrides
	});
	const save = (v) => {
		const s = db.services.find((x) => x.id === v.serviceId);
		let next = { ...v };
		if (!next.quote && s) next.quote = s.rate;
		if (next.status === "Delivered" && !next.delivered) next.delivered = t;
		if (next.status === "In production" && !next.start) next.start = t;
		if (next.start && next.due && next.due < next.start) {
			toast.error("Due date cannot be before start date.");
			return;
		}
		try {
			setDB((d) => updateProject(d, next));
			toast.success("Project saved");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Unable to save project");
		}
	};
	const handleBoardDragStart = (event) => {
		setActiveDragId(String(event.active.id));
	};
	const handleBoardDragEnd = (event) => {
		setActiveDragId(null);
		const { active, over } = event;
		if (!over) return;
		const projectId = String(active.id);
		const nextStatus = String(over.id);
		const proj = db.projects.find((p) => p.id === projectId);
		if (!proj || proj.status === nextStatus) return;
		try {
			setDB((d) => updateProject(d, {
				...proj,
				status: nextStatus
			}));
			toast.success(`${proj.name || proj.code} → ${nextStatus}`);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Unable to move project");
		}
	};
	const boardColumns = showArchivedCols ? [...PROJECT_STATUSES] : [...PROJECT_STATUSES.slice(0, 5)];
	const activeDragged = activeDragId ? db.projects.find((p) => p.id === activeDragId) : void 0;
	const calendarEvents = (0, import_react.useMemo)(() => {
		return db.projects.filter((p) => Boolean(p.start || p.due)).map((p) => {
			const start = p.start || p.due;
			const inclusiveEnd = p.due && p.due >= start ? p.due : start;
			const colors = statusColors[p.status] ?? statusColors["Inquiry"];
			const clientName = db.clients.find((c) => c.id === p.clientId)?.name;
			return {
				id: p.id,
				title: `${p.name || p.code}${clientName ? ` · ${clientName}` : ""}`,
				start,
				end: addDays$1(inclusiveEnd, 1),
				allDay: true,
				backgroundColor: colors.bg,
				borderColor: colors.border,
				textColor: colors.text,
				extendedProps: { project: p }
			};
		});
	}, [db.projects, db.clients]);
	const unscheduledProjects = db.projects.filter((p) => !p.start && !p.due && !["Closed", "Lost"].includes(p.status));
	const onCalendarDateClick = (arg) => {
		setEdit(blank({
			start: arg.dateStr,
			due: addDays$1(arg.dateStr, 6),
			status: "In production"
		}));
	};
	const onCalendarSelect = (arg) => {
		const start = toIsoDate(arg.start);
		const inclusiveEnd = addDays$1(toIsoDate(arg.end), -1);
		setEdit(blank({
			start,
			due: inclusiveEnd >= start ? inclusiveEnd : start,
			status: "In production"
		}));
	};
	const onCalendarEventClick = (arg) => {
		const p = db.projects.find((x) => x.id === arg.event.id);
		if (p) setEdit(p);
	};
	const onCalendarEventDrop = (arg) => {
		const p = db.projects.find((x) => x.id === arg.event.id);
		if (!p || !arg.event.start) return;
		const start = toIsoDate(arg.event.start);
		const due = arg.event.end ? addDays$1(toIsoDate(arg.event.end), -1) : start;
		try {
			setDB((d) => updateProject(d, {
				...p,
				start,
				due: due >= start ? due : start
			}));
			toast.success(`Rescheduled ${p.name || p.code}`);
		} catch (err) {
			arg.revert();
			toast.error(err instanceof Error ? err.message : "Unable to reschedule");
		}
	};
	const onCalendarEventResize = (arg) => {
		const p = db.projects.find((x) => x.id === arg.event.id);
		if (!p || !arg.event.start) return;
		const start = toIsoDate(arg.event.start);
		const due = arg.event.end ? addDays$1(toIsoDate(arg.event.end), -1) : start;
		try {
			setDB((d) => updateProject(d, {
				...p,
				start,
				due: due >= start ? due : start
			}));
			toast.success(`Timeline updated (${shortDate(start)} – ${shortDate(due)})`);
		} catch (err) {
			arg.revert();
			toast.error(err instanceof Error ? err.message : "Unable to resize timeline");
		}
	};
	const live = db.projects.filter((p) => p.status === "In production");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Projects",
			owner: db.settings.ownerName,
			action: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Btn, {
				variant: "gold",
				onClick: () => setEdit(blank()),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), "New project"]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-4 grid grid-cols-3 gap-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Glass, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "In production",
					value: String(live.length)
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Glass, {
					delay: 60,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Pipeline",
						value: money(db.projects.filter((p) => ["Inquiry", "Quoted"].includes(p.status)).reduce((a, p) => a + p.quote, 0))
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Glass, {
					delay: 120,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Late",
						tone: "neg",
						value: String(live.filter((p) => p.due && p.due < t).length)
					})
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-4 flex flex-wrap items-center justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "inline-flex rounded-full border border-border bg-muted p-1 text-xs",
				children: [
					{
						id: "board",
						label: "Board",
						icon: Columns3
					},
					{
						id: "calendar",
						label: "Calendar",
						icon: CalendarDays
					},
					{
						id: "list",
						label: "List",
						icon: List
					}
				].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => setView(item.id),
					className: cn("inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-medium transition-colors", view === item.id ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, { className: "h-3.5 w-3.5" }), item.label]
				}, item.id))
			}), view === "board" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: () => setShowArchivedCols((s) => !s),
				className: "rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground",
				children: showArchivedCols ? "Hide On hold & Lost" : "Show On hold & Lost"
			})]
		}),
		view === "board" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DndContext, {
			sensors,
			onDragStart: handleBoardDragStart,
			onDragEnd: handleBoardDragEnd,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-3 overflow-x-auto pb-3 lg:grid lg:grid-cols-5 lg:overflow-visible",
				children: boardColumns.map((status) => {
					const colProjects = db.projects.filter((p) => p.status === status);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BoardColumn, {
						status,
						count: colProjects.length,
						onAdd: () => setEdit(blank({ status })),
						children: colProjects.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "rounded-xl border border-dashed border-border/70 py-6 text-center text-xs text-muted-foreground",
							children: "Drop project here"
						}) : colProjects.map((p) => {
							const billing = projectBilling(p);
							const late = p.status === "In production" && Boolean(p.due && p.due < t);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BoardCard, {
								project: p,
								clientName: db.clients.find((c) => c.id === p.clientId)?.name ?? "No client",
								docsCount: billing.docs.length,
								paidUSD: billing.paid,
								late,
								onOpen: () => setEdit(p)
							}, p.id);
						})
					}, status);
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DragOverlay, { children: activeDragged ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "glass-strong w-64 rounded-2xl border border-primary/60 p-3.5 shadow-2xl",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-[0.68rem] text-muted-foreground",
						children: activeDragged.code
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate font-medium",
						children: activeDragged.name || "Untitled"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 font-mono text-xs text-primary",
						children: money(activeDragged.quote)
					})
				]
			}) : null })]
		}),
		view === "calendar" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Glass, {
				delay: 120,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Click or drag across days to add a project · Drag bars to reschedule · Drag bar edge to extend timeline" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: [
							"Quoted",
							"In production",
							"Delivered",
							"Closed"
						].map((st) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "h-2.5 w-2.5 rounded-full",
								style: { background: statusColors[st]?.bg }
							}), st]
						}, st))
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "project-calendar",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FullCalendar, {
						plugins: [index$1, index],
						initialView: "dayGridMonth",
						headerToolbar: {
							left: "prev,next today",
							center: "title",
							right: ""
						},
						height: "auto",
						editable: true,
						selectable: true,
						selectMirror: true,
						eventStartEditable: true,
						eventDurationEditable: true,
						dayMaxEvents: 3,
						events: calendarEvents,
						dateClick: onCalendarDateClick,
						select: onCalendarSelect,
						eventClick: onCalendarEventClick,
						eventDrop: onCalendarEventDrop,
						eventResize: onCalendarEventResize
					})
				})]
			}), unscheduledProjects.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Glass, {
				delay: 160,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3 flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "font-display text-base font-bold",
						children: [
							"Unscheduled projects (",
							unscheduledProjects.length,
							")"
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-muted-foreground",
						children: "Schedule onto calendar"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-2 sm:grid-cols-2 lg:grid-cols-3",
					children: unscheduledProjects.map((p) => {
						const clientName = db.clients.find((c) => c.id === p.clientId)?.name ?? "No client";
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-2 rounded-2xl border border-border bg-muted/60 p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => setEdit(p),
								className: "min-w-0 flex-1 text-left",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate text-sm font-medium",
									children: p.name || p.code
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "truncate text-xs text-muted-foreground",
									children: [
										clientName,
										" · ",
										p.status
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
								className: "shrink-0 px-3 py-1 text-xs",
								onClick: () => {
									const svc = db.services.find((s) => s.id === p.serviceId);
									const days = svc?.timeline ? parseTimelineDays(svc.timeline, 7) : 7;
									try {
										setDB((d) => updateProject(d, {
											...p,
											start: t,
											due: addDays$1(t, days)
										}));
										toast.success(`Scheduled ${p.name || p.code} starting today`);
									} catch (err) {
										toast.error(err instanceof Error ? err.message : "Unable to schedule");
									}
								},
								children: "Schedule"
							})]
						}, p.id);
					})
				})]
			})]
		}),
		view === "list" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Glass, {
			delay: 180,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-4 flex flex-wrap gap-1.5",
				children: ["All", ...PROJECT_STATUSES].map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => setF(x),
					className: cn("rounded-full border border-border px-3 py-1 text-xs", f === x ? "bg-primary text-primary-foreground" : "hover:bg-accent"),
					children: [x, x !== "All" && ` ${db.projects.filter((p) => p.status === x).length}`]
				}, x))
			}), rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, { children: "No projects here." }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "divide-y divide-border",
				children: rows.map((p, k) => {
					const c = cost(p);
					const billing = projectBilling(p);
					const late = p.status === "In production" && Boolean(p.due && p.due < t);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "rise",
						style: { animationDelay: `${k * 30}ms` },
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => setEdit(p),
							className: "grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl px-2 py-3 text-left hover:bg-muted",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "truncate font-medium",
									children: [
										p.name || "Untitled",
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-mono text-xs text-muted-foreground",
											children: p.code
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: cn("truncate text-xs text-muted-foreground", late && "text-destructive"),
									children: [
										db.clients.find((x) => x.id === p.clientId)?.name ?? "No client",
										" ",
										"· ",
										p.start ? `${shortDate(p.start)} → ` : "",
										"due",
										" ",
										shortDate(p.due),
										late && " · late",
										billing.docs.length > 0 && ` · ${billing.docs.length} docs`
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-right",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-mono text-sm",
											children: money(p.quote)
										}),
										billing.paid > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-xs text-positive",
											children: [money(billing.paid), " paid"]
										}),
										c > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-xs text-muted-foreground",
											children: ["margin ", money(p.quote - c)]
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, { s: p.status })]
							})]
						})
					}, p.id);
				})
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditModal, {
			item: edit,
			fields,
			title: edit?.code ?? "Project",
			onClose: () => setEdit(null),
			onSave: save,
			onFieldChange: (next, key) => {
				if (key === "serviceId") {
					const svc = db.services.find((s) => s.id === next.serviceId);
					if (svc) {
						const start = next.start || today();
						const days = parseTimelineDays(svc.timeline, 7);
						return {
							...next,
							name: next.name || svc.name,
							quote: next.quote || svc.rate,
							due: next.due || addDays$1(start, days)
						};
					}
				}
				return next;
			},
			footerExtra: (proj) => {
				const linkedDocs = db.projects.some((p) => p.id === proj.id) ? db.invoices.filter((i) => i.projectId === proj.id) : [];
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-border bg-muted/60 p-3 text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-2 flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "label-mono",
								children: "Connected documents"
							}), linkedDocs.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-muted-foreground",
								children: [linkedDocs.length, " linked"]
							})]
						}),
						linkedDocs.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mb-2.5 flex flex-wrap gap-1.5",
							children: linkedDocs.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/invoices/$id",
								params: { id: d.id },
								onClick: () => setEdit(null),
								className: "inline-flex items-center gap-1 rounded-full border border-border bg-background/60 px-2.5 py-1 font-mono hover:border-primary",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-3 w-3 text-primary" }),
									documentKind(d),
									" · ",
									d.no
								]
							}, d.id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-1.5",
							children: DOCUMENT_TYPES.map((docKind) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Btn, {
								type: "button",
								className: "px-2.5 py-1 text-xs",
								onClick: () => {
									const savedProj = { ...proj };
									if (!savedProj.name.trim()) savedProj.name = db.services.find((s) => s.id === savedProj.serviceId)?.name || "Design project";
									setDB((d) => updateProject(d, savedProj));
									setEdit(null);
									nav({
										to: "/invoices/$id",
										params: { id: "new" },
										search: {
											kind: docKind,
											project: savedProj.id,
											...savedProj.clientId ? { client: savedProj.clientId } : {},
											...savedProj.serviceId ? { service: savedProj.serviceId } : {}
										}
									});
								},
								children: ["+ ", docKind]
							}, docKind))
						})
					]
				});
			},
			onDelete: db.projects.some((p) => p.id === edit?.id) ? (v) => setDB((d) => ({
				...d,
				projects: d.projects.filter((p) => p.id !== v.id),
				invoices: d.invoices.map((i) => i.projectId === v.id ? {
					...i,
					projectId: ""
				} : i)
			})) : void 0
		})
	] });
}
function BoardColumn({ status, count, onAdd, children }) {
	const { setNodeRef, isOver } = useDroppable({ id: status });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: setNodeRef,
		className: cn("glass flex min-h-72 min-w-[260px] flex-col rounded-3xl p-3.5 transition-colors lg:min-w-0", isOver && "border-primary bg-primary/10"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-3 flex items-center justify-between gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, { s: status }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-mono text-xs text-muted-foreground",
					children: count
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: onAdd,
				className: "rounded-full p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground",
				"aria-label": `Add project in ${status}`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" })
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex flex-1 flex-col gap-2.5",
			children
		})]
	});
}
function BoardCard({ project, clientName, docsCount, paidUSD, late, onOpen }) {
	const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: project.id });
	const style = transform ? { transform: CSS.Translate.toString(transform) } : void 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: setNodeRef,
		style,
		...listeners,
		...attributes,
		onClick: onOpen,
		role: "button",
		tabIndex: 0,
		onKeyDown: (e) => {
			if (e.key === "Enter" || e.key === " ") {
				e.preventDefault();
				onOpen();
			}
		},
		className: cn("group cursor-grab touch-none rounded-2xl border border-border bg-muted/60 p-3 text-left transition-all hover:border-primary/50 hover:bg-muted active:cursor-grabbing", isDragging && "opacity-40"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-[0.66rem] text-muted-foreground",
							children: project.code
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-0.5 truncate text-sm font-semibold",
							children: project.name || "Untitled"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-xs text-muted-foreground",
							children: clientName
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "rounded-lg p-1 text-muted-foreground group-hover:text-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GripVertical, { className: "h-4 w-4" })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2.5 flex w-full items-center justify-between border-t border-border/60 pt-2 text-xs",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("text-muted-foreground", late && "font-medium text-destructive"),
					children: project.due ? `Due ${shortDate(project.due)}${late ? " · late" : ""}` : "No dates"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "font-mono font-medium",
					children: [money(project.quote), paidUSD > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "ml-1 text-positive",
						children: [
							"(",
							money(paidUSD),
							")"
						]
					}) : null]
				})]
			}),
			docsCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 font-mono text-[0.65rem] text-muted-foreground",
				children: [
					docsCount,
					" linked doc",
					docsCount > 1 ? "s" : ""
				]
			})
		]
	});
}
//#endregion
export { Page as component };
