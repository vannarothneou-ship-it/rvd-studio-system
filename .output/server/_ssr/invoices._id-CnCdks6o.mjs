import "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { i as DOCUMENT_TYPES } from "./utils-h_AG6A2X.mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { _ as lazyRouteComponent, v as createFileRoute } from "../_libs/@tanstack/react-router+[...].mjs";
require_react();
require_jsx_runtime();
var $$splitComponentImporter = () => import("./invoices._id-D4cO6wF9.mjs");
var Route = createFileRoute("/invoices/$id")({
	validateSearch: (s) => ({
		...typeof s["client"] === "string" ? { client: s["client"] } : {},
		...typeof s["project"] === "string" ? { project: s["project"] } : {},
		...typeof s["service"] === "string" ? { service: s["service"] } : {},
		...DOCUMENT_TYPES.includes(s["kind"]) ? { kind: s["kind"] } : {}
	}),
	head: () => ({ meta: [
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		},
		{ title: "Document editor · RothVan Studio" },
		{
			name: "description",
			content: "Edit quotations, agreements, invoices, and delivery notes with a live A4 preview."
		},
		{
			property: "og:title",
			content: "Document editor · RothVan Studio"
		},
		{
			property: "og:description",
			content: "Edit quotations, agreements, invoices, and delivery notes with a live A4 preview."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
