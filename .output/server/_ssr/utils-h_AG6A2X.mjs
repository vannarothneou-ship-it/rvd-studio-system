import { i as __toESM } from "../_runtime.mjs";
import { i as require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/utils-h_AG6A2X.js
var import_react = /* @__PURE__ */ __toESM(require_react());
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
	"Marketing Collateral",
	"Spatial Design"
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
	"Food and groceries",
	"Housing",
	"Utilities",
	"Transport",
	"Health",
	"Family",
	"Entertainment",
	"Education",
	"Shopping",
	"Other"
];
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
	const t = today();
	const m = (n, day = 10) => {
		const d = /* @__PURE__ */ new Date();
		d.setMonth(d.getMonth() - n, day);
		return d.toISOString().slice(0, 10);
	};
	const clients = [
		{
			id: "c1",
			code: "CL-01",
			name: "Doughtelier",
			type: "Owner-operated",
			industry: "Bakery",
			contact: "Ly Andy",
			email: "",
			telegram: "@lyandy",
			phone: "",
			source: "Referral",
			status: "Active",
			notes: ""
		},
		{
			id: "c2",
			code: "CL-02",
			name: "Elite Mart",
			type: "SME",
			industry: "Retail",
			contact: "Sok Dara",
			email: "dara@elitemart.com",
			telegram: "",
			phone: "",
			source: "Social media",
			status: "Active",
			notes: ""
		},
		{
			id: "c3",
			code: "CL-03",
			name: "Mekong Habitat",
			type: "NGO",
			industry: "Housing",
			contact: "Chan Sreymom",
			email: "hello@mekonghabitat.org",
			telegram: "",
			phone: "",
			source: "Website",
			status: "Lead",
			notes: ""
		}
	];
	const services = [{
		id: "s1",
		code: "BD-01",
		pillar: "Branding Design",
		name: "Logo and brand identity",
		unit: "Fixed fee",
		rate: 100,
		scope: "2 x Unique Logo Concepts\nFinal logo in AI, EPS, PDF, PNG, JPG\nBasic Brand GuideStyle\nVisual Mockups",
		timeline: "5 - 7 Days",
		overage: 25
	}, {
		id: "s2",
		code: "MC-01",
		pillar: "Marketing Collateral",
		name: "Social media post set",
		unit: "Per item",
		rate: 15,
		scope: "1 x Post design\n2 revision rounds\nExport for Facebook and Instagram",
		timeline: "2 - 3 Days",
		overage: 10
	}];
	return {
		clients,
		services,
		projects: [
			{
				id: "p1",
				code: "RVD-101",
				clientId: "c1",
				serviceId: "s1",
				name: "Elite Mart logo",
				status: "Delivered",
				start: "2026-02-07",
				due: "2026-02-14",
				delivered: "2026-02-14",
				quote: 100
			},
			{
				id: "p2",
				code: "RVD-102",
				clientId: "c2",
				serviceId: "s2",
				name: "Opening campaign posts",
				status: "In production",
				start: m(1),
				due: addDays(t, 6),
				delivered: "",
				quote: 180
			},
			{
				id: "p3",
				code: "RVD-103",
				clientId: "c3",
				serviceId: "s1",
				name: "Habitat rebrand",
				status: "Quoted",
				start: "",
				due: addDays(t, 30),
				delivered: "",
				quote: 650
			},
			{
				id: "p4",
				code: "RVD-104",
				clientId: "c2",
				serviceId: "s2",
				name: "Menu board refresh",
				status: "Inquiry",
				start: "",
				due: "",
				delivered: "",
				quote: 120
			}
		],
		invoices: [{
			id: "i1",
			no: "RVIN-26020701",
			clientId: "c1",
			projectId: "p1",
			issue: "2026-02-07",
			due: "2026-03-07",
			currency: "USD",
			discount: 0,
			sent: true,
			showSchedule: true,
			includeTerms: true,
			includeRates: true,
			notes: "",
			items: [{
				id: "it1",
				description: "Design Logo Branding for \"Elite Mart\"",
				scope: services[0]?.scope ?? "",
				timeline: "5 - 7 Days",
				qty: 1,
				price: 100
			}],
			images: []
		}, {
			id: "i2",
			no: "RVIN-" + m(1, 3).slice(2).replace(/-/g, "") + "01",
			clientId: "c2",
			projectId: "p2",
			issue: m(1, 3),
			due: addDays(m(1, 3), 28),
			currency: "USD",
			discount: 0,
			sent: true,
			showSchedule: true,
			includeTerms: true,
			includeRates: true,
			notes: "",
			items: [{
				id: "it2",
				description: "Opening campaign social posts",
				scope: services[1]?.scope ?? "",
				timeline: "2 - 3 Days",
				qty: 12,
				price: 15
			}],
			images: []
		}],
		payments: [
			{
				id: "pay1",
				invoiceId: "i1",
				date: "2026-02-08",
				amount: 50,
				currency: "USD",
				method: "KHQR",
				reference: "Deposit"
			},
			{
				id: "pay2",
				invoiceId: "i1",
				date: "2026-02-15",
				amount: 50,
				currency: "USD",
				method: "KHQR",
				reference: "Balance"
			},
			{
				id: "pay3",
				invoiceId: "i2",
				date: m(1, 5),
				amount: 90,
				currency: "USD",
				method: "Bank transfer",
				reference: "Deposit 50%"
			}
		],
		expenses: [
			{
				id: "e1",
				date: m(0, 2),
				projectId: "",
				category: "Software and subscriptions",
				vendor: "Adobe",
				description: "Creative Cloud",
				amount: 59.99,
				currency: "USD",
				receipt: "",
				account: "Studio"
			},
			{
				id: "e2",
				date: m(1, 12),
				projectId: "p2",
				category: "Fonts and licenses",
				vendor: "Type foundry",
				description: "Display typeface",
				amount: 45,
				currency: "USD",
				receipt: "",
				account: "Studio"
			},
			{
				id: "e3",
				date: m(2, 20),
				projectId: "",
				category: "Office and utilities",
				vendor: "Internet",
				description: "Monthly fibre",
				amount: 25,
				currency: "USD",
				receipt: "",
				account: "Studio"
			},
			{
				id: "e4",
				date: m(0, 4),
				projectId: "",
				category: "Housing",
				vendor: "Apartment",
				description: "Monthly rent",
				amount: 280,
				currency: "USD",
				receipt: "",
				account: "Personal"
			},
			{
				id: "e5",
				date: m(0, 6),
				projectId: "",
				category: "Food and groceries",
				vendor: "Local market & cafe",
				description: "Weekly groceries & coffee",
				amount: 64.5,
				currency: "USD",
				receipt: "",
				account: "Personal"
			},
			{
				id: "e6",
				date: m(0, 9),
				projectId: "",
				category: "Transport",
				vendor: "PassApp",
				description: "City rides & fuel",
				amount: 24,
				currency: "USD",
				receipt: "",
				account: "Personal"
			}
		],
		goals: [
			{
				id: "g1",
				name: "Cash received this year",
				kind: "cash",
				target: 12e3,
				current: 0,
				account: "Studio"
			},
			{
				id: "g2",
				name: "New clients this year",
				kind: "clients",
				target: 10,
				current: 0,
				account: "Studio"
			},
			{
				id: "g3",
				name: "Equipment fund",
				kind: "manual",
				target: 1500,
				current: 400,
				account: "Studio"
			},
			{
				id: "g4",
				name: "Personal emergency savings",
				kind: "manual",
				target: 5e3,
				current: 1200,
				account: "Personal"
			}
		],
		settings: defaultSettings
	};
}
var KEY = "rothvan-studio-v1";
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
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
//#endregion
export { nextInvoiceNo as A, today as B, goalAccount as C, longDate as D, isInvoice as E, saveDocument as F, updateProject as H, serviceItem as I, setDB as L, reconcileProjects as M, recordPayment as N, money as O, resetDB as P, shortDate as R, getDB as S, invoiceView as T, useDB as U, uid as V, documentKind as _, EXPENSE_CATEGORIES as a, expenseTotal as b, PILLARS as c, addDays as d, cashReceived as f, deletePayment as g, convertDocument as h, DOCUMENT_TYPES as i, parseTimelineDays as j, needsFollowUp as k, PRICING_UNITS as l, cn as m, CLIENT_STATUSES as n, PAY_METHODS as o, categoryTotals as p, CLIENT_TYPES as r, PERSONAL_CATEGORIES as s, CLIENT_SOURCES as t, PROJECT_STATUSES as u, expenseAccount as v, invoiceTotals as w, fileToDataUrl as x, expenseCategoriesFor as y, toUSD as z };
