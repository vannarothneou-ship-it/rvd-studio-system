import { i as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { A as nextInvoiceNo, B as today, E as isInvoice, F as saveDocument, I as serviceItem, L as setDB, M as reconcileProjects, N as recordPayment, O as money, R as shortDate, S as getDB, T as invoiceView, U as useDB, V as uid, _ as documentKind, d as addDays, g as deletePayment, h as convertDocument, i as DOCUMENT_TYPES, m as cn, o as PAY_METHODS, x as fileToDataUrl } from "./utils-h_AG6A2X.mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { S as Copy, _ as ImagePlus, a as Trash2, d as Plus, i as Upload, j as ArrowDown, k as ArrowUp, n as Wallet, w as CircleCheck, x as Download } from "../_libs/lucide-react.mjs";
import { a as Modal, c as Sel, i as Glass, r as F, s as Pill, t as Btn } from "./ui-Bv-9ubk3.mjs";
import { b as Link, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Route } from "./invoices._id-CnCdks6o.mjs";
import { t as InvoiceDoc } from "./InvoiceDoc-D0MJYA2I.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/invoices._id-D4cO6wF9.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var blankItem = () => ({
	id: uid(),
	description: "",
	scope: "",
	timeline: "",
	qty: 1,
	price: 0
});
function makeNew(search) {
	const db = getDB();
	const issue = today();
	const proj = db.projects.find((p) => p.id === search.project);
	const svc = db.services.find((s) => s.id === (search.service ?? proj?.serviceId));
	const item = svc ? {
		...serviceItem(svc, "USD", db.settings.khrRate),
		price: proj?.quote || svc.rate
	} : blankItem();
	return {
		id: uid(),
		kind: search.kind ?? "Invoice",
		no: nextInvoiceNo(issue, db.invoices, search.kind),
		clientId: search.client ?? proj?.clientId ?? "",
		projectId: proj?.id ?? "",
		issue,
		due: addDays(issue, db.settings.dueDays),
		currency: "USD",
		discount: 0,
		sent: false,
		showSchedule: search.kind !== "Delivery note",
		includeTerms: true,
		includeRates: true,
		notes: "",
		items: [item],
		images: [],
		response: "Pending"
	};
}
function Editor() {
	const { id } = Route.useParams();
	const search = Route.useSearch();
	const nav = useNavigate();
	const db = useDB((d) => d);
	const stored = db.invoices.find((i) => i.id === id);
	const [draft, setDraft] = (0, import_react.useState)(() => stored ?? makeNew(search));
	(0, import_react.useEffect)(() => {
		if (stored) setDraft(stored);
	}, [stored]);
	const [tab, setTab] = (0, import_react.useState)("form");
	const [payOpen, setPayOpen] = (0, import_react.useState)(false);
	const [newClient, setNewClient] = (0, import_react.useState)(false);
	const [followNote, setFollowNote] = (0, import_react.useState)("");
	const kind = documentKind(draft);
	(0, import_react.useEffect)(() => {
		if (id === "new") setDraft(makeNew(search));
		else if (stored) setDraft(stored);
	}, [
		id,
		search.kind,
		search.client,
		search.project,
		search.service
	]);
	const isNew = !stored;
	const v = invoiceView(draft, db);
	const up = (p) => setDraft((d) => ({
		...d,
		...p
	}));
	const upItem = (iid, p) => setDraft((d) => ({
		...d,
		items: d.items.map((x) => x.id === iid ? {
			...x,
			...p
		} : x)
	}));
	const save = (extra = {}) => {
		const inv = {
			...draft,
			...extra
		};
		if (!inv.clientId || !inv.items.some((it) => it.description.trim())) {
			toast.error("Choose a client and add an item description.");
			return;
		}
		try {
			setDB((d) => saveDocument(d, inv));
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Unable to save");
			return;
		}
		const saved = getDB().invoices.find((i) => i.id === inv.id) ?? inv;
		setDraft(saved);
		if (isNew) nav({
			to: "/invoices/$id",
			params: { id: inv.id },
			replace: true
		});
		return saved;
	};
	const acceptAndConvert = (nextKind) => {
		const patch = kind === "Invoice" ? { sent: true } : {
			sent: true,
			response: "Accepted",
			confirmedOn: draft.confirmedOn || today(),
			confirmedBy: draft.confirmedBy || client?.contact || client?.name || ""
		};
		const source = save(patch);
		if (!source) return;
		const copy = convertDocument(source, nextKind, getDB().invoices, today(), db.settings.dueDays);
		setDB((d) => saveDocument(d, copy));
		toast.success(`Created ${nextKind.toLowerCase()} ${copy.no}`);
		nav({
			to: "/invoices/$id",
			params: { id: copy.id }
		});
	};
	const client = db.clients.find((c) => c.id === draft.clientId);
	const project = db.projects.find((p) => p.id === draft.projectId);
	const relatedDocs = project ? db.invoices.filter((i) => i.projectId === project.id) : db.invoices.filter((i) => i.sourceId === draft.id || i.id === draft.sourceId);
	const pays = db.payments.filter((p) => p.invoiceId === draft.id);
	const fileRef = (0, import_react.useRef)(null);
	const sigRef = (0, import_react.useRef)(null);
	const addImages = async (files) => {
		if (!files) return;
		const room = 6 - draft.images.length;
		const list = Array.from(files).filter((f) => f.type.startsWith("image/")).slice(0, room);
		const imgs = await Promise.all(list.map(async (f) => ({
			id: uid(),
			src: await fileToDataUrl(f, 1e3),
			caption: ""
		})));
		up({ images: [...draft.images, ...imgs] });
		if (files.length > room) toast("Up to 6 photos per invoice.");
	};
	const move = (arr, i, d) => {
		const a = [...arr];
		const j = i + d;
		const first = a[i];
		const second = a[j];
		if (first === void 0 || second === void 0) return a;
		a[i] = second;
		a[j] = first;
		return a;
	};
	const telegram = () => {
		const msg = kind === "Quotation" && draft.sent ? `Hello ${client?.contact || client?.name || ""}, following up on quotation ${draft.no} for ${project?.name || draft.items[0]?.description || "your project"}. Would you like to proceed, adjust the scope, or pause for now? The quotation is valid until ${shortDate(draft.due)}.` : `Hello ${client?.contact || client?.name || ""}, here is your ${kind.toLowerCase()} ${draft.no} for ${project?.name || draft.items[0]?.description || "your project"}.${kind !== "Delivery note" ? ` Total ${money(v.total, draft.currency)}.` : ""}`;
		navigator.clipboard.writeText(msg).then(() => toast.success("Telegram message copied"));
	};
	const duplicate = () => {
		const issue = today();
		const copy = convertDocument(draft, kind, getDB().invoices, issue, db.settings.dueDays);
		setDB((d) => ({
			...d,
			invoices: [...d.invoices, copy]
		}));
		toast.success("Duplicated as " + copy.no);
		nav({
			to: "/invoices/$id",
			params: { id: copy.id }
		});
	};
	const del = () => {
		if (!confirm("Delete this document and its payments?")) return;
		setDB((d) => reconcileProjects({
			...d,
			invoices: d.invoices.filter((i) => i.id !== draft.id),
			payments: d.payments.filter((p) => p.invoiceId !== draft.id)
		}));
		nav({ to: "/invoices" });
	};
	const form = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Glass, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(F, {
						label: "Document type",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sel, {
							value: kind,
							onChange: (x) => {
								const k = x;
								if (!isNew) return;
								up({
									kind: k,
									no: nextInvoiceNo(draft.issue, db.invoices, k),
									showSchedule: k !== "Delivery note"
								});
							},
							options: isNew ? [...DOCUMENT_TYPES] : [kind]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(F, {
						label: "Document no.",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "field font-mono",
							value: draft.no,
							onChange: (e) => up({ no: e.target.value })
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(F, {
						label: "Currency",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sel, {
							value: draft.currency,
							onChange: (x) => {
								const currency = x;
								if (currency === draft.currency) return;
								up({
									currency,
									items: draft.items.map((it) => ({
										...it,
										price: currency === "KHR" ? it.price * db.settings.khrRate : it.price / db.settings.khrRate
									}))
								});
							},
							options: ["USD", "KHR"]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(F, {
						label: "Client",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex min-w-0 gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "min-w-0 flex-1",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sel, {
									value: draft.clientId,
									onChange: (x) => {
										const currentProj = db.projects.find((p) => p.id === draft.projectId);
										up({
											clientId: x,
											...currentProj && currentProj.clientId !== x ? { projectId: "" } : {}
										});
									},
									placeholder: "Choose client",
									options: db.clients.map((c) => ({
										value: c.id,
										label: c.name
									}))
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setNewClient(true),
								className: "shrink-0 rounded-xl border border-border px-3 hover:bg-accent",
								"aria-label": "Add client",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" })
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(F, {
						label: "Project (auto-created on send if blank)",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sel, {
							value: draft.projectId,
							onChange: (x) => {
								const p = db.projects.find((proj) => proj.id === x);
								const s = db.services.find((svc) => svc.id === p?.serviceId);
								up({
									projectId: x,
									...p ? { clientId: p.clientId } : {},
									...s && !draft.items.some((i) => i.description.trim()) ? { items: [{
										...serviceItem(s, draft.currency, db.settings.khrRate),
										price: p?.quote ? draft.currency === "KHR" ? p.quote * db.settings.khrRate : p.quote : serviceItem(s, draft.currency, db.settings.khrRate).price
									}] } : {}
								});
							},
							placeholder: "None (auto-create on send)",
							options: db.projects.filter((p) => !draft.clientId || p.clientId === draft.clientId).map((p) => ({
								value: p.id,
								label: `${p.code} · ${p.name}`
							}))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(F, {
						label: "Issue date",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "date",
							className: "field",
							value: draft.issue,
							onChange: (e) => {
								const issue = e.target.value;
								up({
									issue,
									due: addDays(issue, db.settings.dueDays),
									...isNew ? { no: nextInvoiceNo(issue, db.invoices, kind) } : {}
								});
							}
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(F, {
						label: kind === "Quotation" ? "Valid until" : kind === "Delivery note" ? "Delivery date" : "Due date",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "date",
							className: "field",
							value: draft.due,
							onChange: (e) => up({ due: e.target.value })
						})
					})
				]
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Glass, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "mb-3 font-medium",
					children: kind === "Quotation" ? "Response, follow-up & client signature" : kind === "Agreement" ? "Agreement & signatures" : kind === "Delivery note" ? "Delivery & receipt signatures" : "Client signature & confirmation"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3 sm:grid-cols-2",
					children: [
						!isInvoice(draft) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(F, {
							label: "Client response",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sel, {
								value: draft.response ?? "Pending",
								onChange: (x) => up({ response: x }),
								options: [
									{
										value: "Pending",
										label: "Awaiting response"
									},
									{
										value: "Accepted",
										label: kind === "Agreement" ? "Signed (recorded)" : kind === "Delivery note" ? "Received" : "Accepted"
									},
									{
										value: "Declined",
										label: "Declined"
									}
								]
							})
						}),
						kind === "Quotation" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(F, {
							label: "Next follow-up",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "date",
								className: "field",
								value: draft.followUp ?? "",
								onChange: (e) => up({ followUp: e.target.value })
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(F, {
							label: kind === "Delivery note" ? "Received by (client signatory)" : "Client signatory",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: "field",
								placeholder: client?.contact || client?.name || "Authorized representative",
								value: draft.confirmedBy ?? "",
								onChange: (e) => up({ confirmedBy: e.target.value })
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(F, {
							label: kind === "Delivery note" ? "Received on" : "Signed / confirmed on",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "date",
								className: "field",
								value: draft.confirmedOn ?? "",
								onChange: (e) => up({ confirmedOn: e.target.value })
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(F, {
							label: "Client signature image (optional)",
							className: "sm:col-span-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "grid h-14 w-32 shrink-0 place-items-center overflow-hidden rounded-xl border border-dashed border-border bg-muted",
										children: draft.clientSignature ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
											src: draft.clientSignature,
											alt: "Client signature",
											className: "h-full w-full object-contain"
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "h-4 w-4 text-muted-foreground" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										ref: sigRef,
										type: "file",
										accept: "image/*",
										hidden: true,
										onChange: async (e) => {
											const f = e.target.files?.[0];
											if (f) {
												up({ clientSignature: await fileToDataUrl(f, 500) });
												e.target.value = "";
											}
										}
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
										type: "button",
										onClick: () => sigRef.current?.click(),
										className: "text-xs",
										children: "Upload signature"
									}),
									draft.clientSignature && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
										type: "button",
										variant: "danger",
										onClick: () => up({ clientSignature: "" }),
										className: "text-xs",
										children: "Remove"
									})
								]
							})
						}),
						kind === "Agreement" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(F, {
							label: "Additional agreement clauses",
							className: "sm:col-span-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								className: "field min-h-32",
								value: draft.agreementText ?? "",
								onChange: (e) => up({ agreementText: e.target.value })
							})
						}),
						kind === "Delivery note" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(F, {
							label: "Delivery method",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sel, {
								value: draft.deliveryMethod ?? "Email",
								onChange: (x) => up({ deliveryMethod: x }),
								options: [
									"Email",
									"Telegram",
									"Cloud drive",
									"Physical handover",
									"Other"
								]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(F, {
							label: "File link / handover reference",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: "field",
								value: draft.deliveryLink ?? "",
								onChange: (e) => up({ deliveryLink: e.target.value })
							})
						})] })
					]
				}),
				kind === "Quotation" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(F, {
							label: "Follow-up note",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: "field",
								value: followNote,
								onChange: (e) => setFollowNote(e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
							disabled: !followNote.trim(),
							onClick: () => {
								if (save({ followUps: [...draft.followUps ?? [], {
									date: today(),
									note: followNote.trim()
								}] })) {
									setFollowNote("");
									toast.success("Follow-up recorded");
								}
							},
							children: "Log follow-up"
						}),
						draft.followUps?.map((f, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "break-words text-sm text-muted-foreground",
							children: [
								shortDate(f.date),
								" · ",
								f.note
							]
						}, i))
					]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Glass, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-medium",
					children: "Line items"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "min-w-0 flex-1 sm:w-56 sm:flex-none",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sel, {
							value: "",
							placeholder: "+ From services",
							onChange: (sid) => {
								const s = db.services.find((x) => x.id === sid);
								if (s) up({ items: [...draft.items.filter((x) => x.description || x.price), serviceItem(s, draft.currency, db.settings.khrRate)] });
							},
							options: db.services.map((s) => ({
								value: s.id,
								label: `${s.code} · ${s.name}`
							}))
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Btn, {
						onClick: () => up({ items: [...draft.items, blankItem()] }),
						className: "py-2 text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3 w-3" }), "Custom"]
					})]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-3",
				children: draft.items.map((it, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-2xl border border-border bg-muted p-3 animate-in fade-in slide-in-from-top-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-2 flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "label-mono",
							children: ["Item ", i + 1]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => up({ items: move(draft.items, i, -1) }),
									className: "rounded-lg p-1.5 hover:bg-accent",
									"aria-label": "Move up",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUp, { className: "h-3.5 w-3.5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => up({ items: move(draft.items, i, 1) }),
									className: "rounded-lg p-1.5 hover:bg-accent",
									"aria-label": "Move down",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDown, { className: "h-3.5 w-3.5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => up({ items: draft.items.filter((x) => x.id !== it.id) }),
									className: "rounded-lg p-1.5 text-destructive hover:bg-destructive/10",
									"aria-label": "Remove",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
								})
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: "field font-medium",
								placeholder: "Description",
								value: it.description,
								onChange: (e) => upItem(it.id, { description: e.target.value })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								className: "field min-h-20",
								placeholder: "Scope of work, one per line",
								value: it.scope,
								onChange: (e) => upItem(it.id, { scope: e.target.value })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-3 gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										className: "field",
										placeholder: "Timeline",
										value: it.timeline,
										onChange: (e) => upItem(it.id, { timeline: e.target.value })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										className: "field",
										type: "number",
										min: 0,
										placeholder: "Qty",
										value: it.qty,
										onChange: (e) => upItem(it.id, { qty: Number(e.target.value) })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										className: "field",
										type: "number",
										min: 0,
										step: "0.01",
										placeholder: "Price",
										value: it.price,
										onChange: (e) => upItem(it.id, { price: Number(e.target.value) })
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-right font-mono text-sm",
								children: money(it.qty * it.price, draft.currency)
							})
						]
					})]
				}, it.id))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Glass, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-3 flex items-center justify-between",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
						className: "font-medium",
						children: [
							"Reference photos",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs text-muted-foreground",
								children: [
									"(",
									draft.images.length,
									"/6)"
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Btn, {
						onClick: () => fileRef.current?.click(),
						disabled: draft.images.length >= 6,
						className: "py-1.5 text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImagePlus, { className: "h-3.5 w-3.5" }), "Add"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						ref: fileRef,
						type: "file",
						accept: "image/*",
						multiple: true,
						hidden: true,
						onChange: (e) => {
							addImages(e.target.files);
							e.target.value = "";
						}
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				onDragOver: (e) => e.preventDefault(),
				onDrop: (e) => {
					e.preventDefault();
					addImages(e.dataTransfer.files);
				},
				className: "grid min-h-24 grid-cols-3 gap-2 rounded-2xl border border-dashed border-border p-2 sm:grid-cols-6",
				children: [draft.images.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "col-span-full self-center text-center text-xs text-muted-foreground",
					children: "Drop images here"
				}), draft.images.map((im, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "group relative",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: im.src,
							alt: "",
							className: "h-20 w-full rounded-xl object-cover"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "absolute inset-x-1 top-1 flex justify-between opacity-0 transition-opacity group-hover:opacity-100",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => up({ images: move(draft.images, i, -1) }),
								className: "rounded-md bg-background/80 p-1",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUp, { className: "h-3 w-3 -rotate-90" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => up({ images: draft.images.filter((x) => x.id !== im.id) }),
								className: "rounded-md bg-background/80 p-1 text-destructive",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3 w-3" })
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "mt-1 w-full bg-transparent text-[0.65rem] outline-none",
							placeholder: "Caption",
							value: im.caption,
							onChange: (e) => up({ images: draft.images.map((x) => x.id === im.id ? {
								...x,
								caption: e.target.value
							} : x) })
						})
					]
				}, im.id))]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Glass, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3 sm:grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(F, {
						label: "Discount (%)",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "field",
							type: "number",
							min: 0,
							max: 100,
							value: draft.discount,
							onChange: (e) => up({ discount: Number(e.target.value) })
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(F, {
						label: "Notes",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "field",
							value: draft.notes,
							onChange: (e) => up({ notes: e.target.value })
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 space-y-1 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted-foreground",
								children: "Subtotal"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono",
								children: money(v.subtotal, draft.currency)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted-foreground",
								children: "Discount"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "font-mono",
								children: ["−", money(v.discountAmt, draft.currency)]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-end justify-between border-t border-border pt-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Grand total" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-display text-2xl font-black",
								children: money(v.total, draft.currency)
							})]
						}),
						draft.currency === "KHR" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-right text-xs text-muted-foreground",
							children: [
								"Rate 1 USD = ",
								db.settings.khrRate,
								" KHR"
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 grid gap-2",
					children: [
						["showSchedule", "Show 50% deposit and 50% balance amounts"],
						["includeTerms", "Include Design Terms"],
						["includeRates", "Include Extra Service Rates"]
					].map(([k, l]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex cursor-pointer items-center gap-3 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							className: "h-4 w-4 accent-[var(--primary)]",
							checked: draft[k],
							onChange: (e) => up({ [k]: e.target.checked })
						}), l]
					}, k))
				})
			] }),
			!isNew && isInvoice(draft) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Glass, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-2 flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-medium",
					children: "Payments"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "font-mono text-sm",
					children: [
						money(v.paid, draft.currency),
						" paid ·",
						" ",
						money(v.balance, draft.currency),
						" left"
					]
				})]
			}), pays.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "No payments yet."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "divide-y divide-border text-sm",
				children: pays.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center justify-between py-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						shortDate(p.date),
						" · ",
						p.method,
						" ",
						p.reference && `· ${p.reference}`
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-mono text-positive",
							children: ["+", money(p.amount, p.currency)]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setDB((d) => deletePayment(d, p.id)),
							className: "text-muted-foreground hover:text-destructive",
							"aria-label": "Delete payment",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
						})]
					})]
				}, p.id))
			})] })
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rise mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/invoices",
					className: "text-sm text-muted-foreground hover:text-foreground",
					children: "← Documents"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "truncate font-display text-2xl font-bold sm:text-3xl",
					children: draft.no
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, { s: isNew ? "Draft" : v.status })]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Glass, {
			className: "mb-4 p-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2 text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "label-mono",
							children: "Connected workflow"
						}),
						project ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/projects",
							className: "inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-1 hover:bg-accent",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono text-foreground",
									children: project.code
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: project.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, { s: project.status })
							]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted-foreground",
							children: "Sending or accepting auto-creates & updates a linked project"
						}),
						relatedDocs.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-1.5",
							children: relatedDocs.filter((d) => d.id !== draft.id).map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/invoices/$id",
								params: { id: d.id },
								className: "rounded-full border border-border px-2.5 py-0.5 font-mono text-[0.7rem] text-muted-foreground hover:border-primary hover:text-foreground",
								children: [
									documentKind(d),
									": ",
									d.no
								]
							}, d.id))
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [
						kind === "Quotation" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Btn, {
							variant: "gold",
							onClick: () => acceptAndConvert("Agreement"),
							className: "text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-3.5 w-3.5" }), "Win client: Agreement"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
							onClick: () => acceptAndConvert("Invoice"),
							className: "text-xs",
							children: "Accept & Issue Invoice"
						})] }),
						kind === "Agreement" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Btn, {
							variant: "gold",
							onClick: () => acceptAndConvert("Invoice"),
							className: "text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-3.5 w-3.5" }), "Signed & Issue Invoice"]
						}),
						kind === "Invoice" && !isNew && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
							onClick: () => acceptAndConvert("Delivery note"),
							className: "text-xs",
							children: "Issue Delivery Note"
						}),
						kind === "Delivery note" && draft.response !== "Accepted" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Btn, {
							variant: "gold",
							onClick: () => {
								if (save({
									sent: true,
									response: "Accepted",
									confirmedOn: draft.confirmedOn || today()
								})) toast.success("Marked delivered & project updated");
							},
							className: "text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-3.5 w-3.5" }), "Mark Delivered & Received"]
						})
					]
				})]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "no-print sticky top-2 z-30 mb-4 flex flex-wrap items-center gap-2 sm:top-24",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
					variant: "gold",
					onClick: () => {
						if (save()) toast.success("Saved");
					},
					children: "Save"
				}),
				!draft.sent && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
					onClick: () => {
						if (save({
							sent: true,
							...kind === "Quotation" && !draft.followUp ? { followUp: addDays(today(), 3) } : {}
						})) toast.success("Marked as sent");
					},
					children: "Mark as sent"
				}),
				!isNew && isInvoice(draft) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Btn, {
					onClick: () => setPayOpen(true),
					disabled: v.balance <= .005,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "h-4 w-4" }), v.balance <= .005 ? "Paid in full" : "Record payment"]
				}),
				!isNew && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/print/$id",
					params: { id: draft.id },
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Btn, {
						onClick: () => save(),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-4 w-4" }), "PDF"]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Btn, {
					onClick: telegram,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "h-4 w-4" }), "Telegram"]
				}),
				!isNew && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
					onClick: duplicate,
					children: "Duplicate"
				}),
				!isNew && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "w-full sm:w-52",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sel, {
						value: "",
						placeholder: "Create linked document…",
						options: DOCUMENT_TYPES.filter((k) => k !== kind).map((k) => ({
							value: k,
							label: k
						})),
						onChange: (k) => {
							if (!k) return;
							if (kind === "Quotation" && draft.response !== "Accepted" && k === "Invoice") {
								toast.error("Accept quotation first (or click 'Accept & Issue Invoice' above).");
								return;
							}
							const source = save();
							if (!source) return;
							const copy = convertDocument(source, k, getDB().invoices, today(), db.settings.dueDays);
							setDB((d) => ({
								...d,
								invoices: [...d.invoices, copy]
							}));
							nav({
								to: "/invoices/$id",
								params: { id: copy.id }
							});
						}
					})
				}),
				!isNew && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
					variant: "danger",
					onClick: del,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
				})
			]
		}),
		draft.sourceId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
			to: "/invoices/$id",
			params: { id: draft.sourceId },
			className: "mb-4 block text-sm text-primary",
			children: [
				"Source:",
				" ",
				db.invoices.find((i) => i.id === draft.sourceId)?.no ?? "Original document",
				" ",
				"→"
			]
		}),
		kind === "Agreement" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mb-4 text-sm text-muted-foreground",
			children: "Design Services Agreement uses your studio terms & client details across 2–5 A4 pages. Have local counsel review before signing."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-4 flex rounded-full border border-border bg-muted p-1 text-sm lg:hidden",
			children: ["form", "preview"].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: () => setTab(t),
				className: cn("flex-1 rounded-full py-1.5 capitalize", tab === t && "bg-primary text-primary-foreground"),
				children: t
			}, t))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn(tab === "preview" && "hidden lg:block"),
				children: form
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn("lg:sticky lg:top-28 lg:self-start", tab === "form" && "hidden lg:block"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Preview, { inv: draft })
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaymentModal, {
			open: payOpen,
			onClose: () => setPayOpen(false),
			inv: draft,
			balance: v.balance,
			onSave: () => {
				if (!draft.sent) save({ sent: true });
			}
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuickClient, {
			open: newClient,
			onClose: () => setNewClient(false),
			onCreated: (cid) => up({
				clientId: cid,
				projectId: ""
			})
		})
	] });
}
function Preview({ inv }) {
	const db = useDB((d) => d);
	const ref = (0, import_react.useRef)(null);
	const [scale, setScale] = (0, import_react.useState)(.5);
	const [height, setHeight] = (0, import_react.useState)(2246);
	const pagesRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const el = ref.current;
		if (!el) return;
		const ro = new ResizeObserver(() => {
			setScale(el.clientWidth / 794);
			if (pagesRef.current) setHeight(pagesRef.current.scrollHeight);
		});
		ro.observe(el);
		if (pagesRef.current) ro.observe(pagesRef.current);
		return () => ro.disconnect();
	}, []);
	const doc = (0, import_react.useMemo)(() => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InvoiceDoc, {
		inv,
		db
	}), [inv, db]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref,
		className: "max-h-[80vh] overflow-y-auto overflow-x-hidden rounded-2xl",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			style: { height: height * scale },
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				ref: pagesRef,
				style: {
					transform: `scale(${scale})`,
					transformOrigin: "top left",
					width: 794
				},
				className: "[&_.paper]:mb-4 [&_.paper]:rounded-sm [&_.paper]:shadow-2xl",
				children: doc
			})
		})
	});
}
function PaymentModal({ open, onClose, inv, balance, onSave }) {
	const [f, setF] = (0, import_react.useState)({
		date: today(),
		amount: 0,
		method: "KHQR",
		reference: ""
	});
	(0, import_react.useEffect)(() => {
		if (open) setF({
			date: today(),
			amount: Math.round(balance * 100) / 100,
			method: "KHQR",
			reference: ""
		});
	}, [open, balance]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Modal, {
		open,
		onClose,
		title: "Record payment",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(F, {
						label: "Date",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "date",
							className: "field",
							value: f.date,
							onChange: (e) => setF({
								...f,
								date: e.target.value
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(F, {
						label: `Amount (${inv.currency})`,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "number",
							step: "0.01",
							className: "field",
							value: f.amount,
							onChange: (e) => setF({
								...f,
								amount: Number(e.target.value)
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(F, {
						label: "Method",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sel, {
							value: f.method,
							onChange: (m) => setF({
								...f,
								method: m
							}),
							options: PAY_METHODS
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(F, {
						label: "Reference",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "field",
							value: f.reference,
							onChange: (e) => setF({
								...f,
								reference: e.target.value
							}),
							placeholder: "Deposit, balance…"
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
					onClick: () => setF({
						...f,
						amount: Math.round(balance / 2 * 100) / 100
					}),
					className: "text-xs",
					children: "50% of balance"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
					onClick: () => setF({
						...f,
						amount: balance
					}),
					className: "text-xs",
					children: "Full balance"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
				variant: "gold",
				className: "mt-5 w-full",
				disabled: !(f.amount > 0) || f.amount > balance + .005,
				onClick: () => {
					try {
						onSave();
						setDB((d) => recordPayment(d, {
							id: uid(),
							invoiceId: inv.id,
							currency: inv.currency,
							...f
						}));
						toast.success("Payment recorded & finance updated");
						onClose();
					} catch (e) {
						toast.error(e instanceof Error ? e.message : "Unable to record payment");
					}
				},
				children: "Save payment"
			})
		]
	});
}
function QuickClient({ open, onClose, onCreated }) {
	const [n, setN] = (0, import_react.useState)({
		name: "",
		contact: "",
		telegram: ""
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Modal, {
		open,
		onClose,
		title: "New client",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(F, {
					label: "Name",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "field",
						value: n.name,
						onChange: (e) => setN({
							...n,
							name: e.target.value
						})
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(F, {
					label: "Contact person",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "field",
						value: n.contact,
						onChange: (e) => setN({
							...n,
							contact: e.target.value
						})
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(F, {
					label: "Email / Telegram",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "field",
						value: n.telegram,
						onChange: (e) => setN({
							...n,
							telegram: e.target.value
						})
					})
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Btn, {
			variant: "gold",
			className: "mt-5 w-full",
			disabled: !n.name.trim(),
			onClick: () => {
				const id = uid();
				const count = getDB().clients.length + 1;
				setDB((d) => ({
					...d,
					clients: [...d.clients, {
						id,
						code: `CL-${String(count).padStart(2, "0")}`,
						name: n.name.trim(),
						contact: n.contact,
						email: n.telegram.includes("@") && n.telegram.includes(".") ? n.telegram : "",
						telegram: n.telegram.includes(".") ? "" : n.telegram,
						type: "SME",
						industry: "",
						phone: "",
						source: "Other",
						status: "Active",
						notes: ""
					}]
				}));
				onCreated(id);
				setN({
					name: "",
					contact: "",
					telegram: ""
				});
				onClose();
			},
			children: "Add client"
		})]
	});
}
//#endregion
export { QuickClient, Editor as component };
