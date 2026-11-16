import { $ as require_jsx_runtime, Z as useDB, it as __toESM, tt as require_react } from "./utils-9Cr7dFIe.js";
import { t as Link } from "./link-CVJvSglN.js";
import { t as Btn } from "./ui-o3DjUYrq.js";
import { t as Route } from "./index-C5inAkJE.js";
import { t as InvoiceDoc } from "./InvoiceDoc-c4AZ-qv3.js";
//#region src/routes/print.$id.tsx?tsr-split=component
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function PrintPage() {
	const { id } = Route.useParams();
	const db = useDB((d) => d);
	const inv = db.invoices.find((i) => i.id === id);
	(0, import_react.useEffect)(() => {
		if (inv) {
			document.title = inv.no;
			const t = setTimeout(() => window.print(), 700);
			return () => clearTimeout(t);
		}
	}, [inv]);
	if (!inv) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "p-10",
		children: "Invoice not found."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col items-center gap-6 py-6 print:block print:p-0",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "no-print flex gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/invoices/$id",
				params: { id },
				className: "rounded-full border border-border px-4 py-2 text-sm",
				children: "← Back"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
				variant: "gold",
				onClick: () => window.print(),
				children: "Print / Save PDF"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex flex-col gap-6 [&_.paper]:shadow-2xl print:gap-0",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InvoiceDoc, {
				inv,
				db
			})
		})]
	});
}
//#endregion
export { PrintPage as component };
