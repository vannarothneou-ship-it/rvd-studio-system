import { at as __toESM, nt as require_react } from "./utils-B6FVwprB.js";
import { A as replaceEqualDeep, n as useSelector, r as useRouter } from "./link-CC49BNe4.js";
//#region node_modules/@tanstack/router-core/dist/esm/invariant.js
function invariant() {
	throw new Error("Invariant failed");
}
//#endregion
//#region node_modules/@tanstack/router-core/dist/esm/root.js
/** Stable identifier used for the root route in a route tree. */
var rootRouteId = "__root__";
//#endregion
//#region node_modules/@tanstack/react-router/dist/esm/matchContext.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var matchContext = import_react.createContext(void 0);
var dummyMatchContext = import_react.createContext(void 0);
//#endregion
//#region node_modules/@tanstack/react-router/dist/esm/useMatch.js
var dummyMatch = {};
function useStructuralSharing(opts, router) {
	const previousResult = import_react.useRef();
	return (slice) => {
		const selected = opts?.select ? opts.select(slice) : slice;
		if (opts?.structuralSharing ?? router.options.defaultStructuralSharing) return previousResult.current = replaceEqualDeep(previousResult.current, selected);
		return selected;
	};
}
/**
* Read and select the nearest or targeted route match.
* @link https://tanstack.com/router/latest/docs/framework/react/api/router/useMatchHook
*/
function useMatch(opts) {
	const router = useRouter();
	const nearestRouteId = import_react.useContext(opts.from ? dummyMatchContext : matchContext);
	const routeId = opts.from ?? nearestRouteId;
	const matchStore = router.stores.getMatchStore(routeId);
	const selector = useStructuralSharing(opts, router);
	const matchSelection = useSelector(matchStore, (match) => match ? selector(match) : dummyMatch);
	if (matchSelection !== dummyMatch) return matchSelection;
	if (opts.shouldThrow ?? true) invariant();
}
//#endregion
export { invariant as a, rootRouteId as i, useStructuralSharing as n, matchContext as r, useMatch as t };
