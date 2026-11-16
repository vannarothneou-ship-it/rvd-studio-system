import { useSyncExternalStore } from "react";

export const PROJECT_STATUSES = [
  "Inquiry",
  "Quoted",
  "In production",
  "Delivered",
  "Closed",
  "On hold",
  "Lost",
] as const;
export const CLIENT_TYPES = [
  "Owner-operated",
  "Enterprise",
  "Startup",
  "SME",
  "NGO",
];
export const CLIENT_STATUSES = ["Lead", "Active", "Past", "Dormant"];
export const CLIENT_SOURCES = [
  "Referral",
  "Social media",
  "Website",
  "Returning client",
  "Other",
];
import {
  buildSampleExpenses,
  rothvanClients,
  rothvanGoals,
  rothvanInvoices,
  rothvanPayments,
  rothvanProjects,
  rothvanServices,
} from "./rothvan-seed";

export const PILLARS = [
  "Branding Design",
  "Creative & Digital",
  "Marketing & Packaging",
  "Spatial Design",
];

export function normalizeServicePillar(pillar: string): string {
  if (pillar === "Creative Assets" || pillar === "Web & App Design") {
    return "Creative & Digital";
  }
  if (pillar === "Marketing Collateral" || pillar === "Product Packaging") {
    return "Marketing & Packaging";
  }
  return pillar;
}

export const PRICING_UNITS = ["Fixed fee", "Per item", "Per hour", "Per sqm"];
export const PAY_METHODS = ["Bank transfer", "KHQR", "Wing", "Cash", "Other"];
export const CARD_METHODS = [
  "Debit",
  "Credit",
  "KHQR",
  "Cash",
  "Other",
] as const;
export const EXPENSE_CATEGORIES = [
  "Software and subscriptions",
  "Fonts and licenses",
  "Printing and production",
  "Fabrication and vendors",
  "Freelancers",
  "Transport",
  "Marketing",
  "Equipment",
  "Office and utilities",
  "Other",
];
export const PERSONAL_CATEGORIES = [
  "Food",
  "Transportation",
  "Kid",
  "Personal Spending",
  "Utilities",
  "Medical & Healthcare",
  "Saving & Investing",
  "Prius 2012",
  "Other",
];
export type Account = "Studio" | "Personal";

export const DEFAULT_PERSONAL_LIMITS: Record<string, number> = {
  Food: 250,
  Transportation: 120,
  Kid: 150,
  "Personal Spending": 200,
  Utilities: 80,
  "Medical & Healthcare": 100,
  "Saving & Investing": 300,
  "Prius 2012": 200,
  Other: 50,
};

export const DEFAULT_STUDIO_LIMITS: Record<string, number> = {
  "Software and subscriptions": 100,
  "Fonts and licenses": 80,
  "Printing and production": 150,
  "Fabrication and vendors": 250,
  Freelancers: 200,
  Transport: 60,
  Marketing: 80,
  Equipment: 200,
  "Office and utilities": 100,
  Other: 100,
};

export type Currency = "USD" | "KHR";
export interface Client {
  id: string;
  code: string;
  name: string;
  type: string;
  industry: string;
  contact: string;
  email: string;
  telegram: string;
  phone: string;
  source: string;
  status: string;
  notes: string;
  avatar?: string;
  position?: string;
  address?: string;
  website?: string;
  taxId?: string;
  preferredContact?: string;
}
export interface Service {
  id: string;
  code: string;
  pillar: string;
  name: string;
  unit: string;
  rate: number;
  scope: string;
  timeline: string;
  overage: number;
  tags?: string[];
}
export interface Project {
  id: string;
  code: string;
  clientId: string;
  serviceId: string;
  name: string;
  status: string;
  start: string;
  due: string;
  delivered: string;
  quote: number;
}
export interface Item {
  id: string;
  description: string;
  scope: string;
  timeline: string;
  qty: number;
  price: number;
  serviceId?: string;
}
export interface Img {
  id: string;
  src: string;
  caption: string;
}
export const DOCUMENT_TYPES = [
  "Invoice",
  "Quotation",
  "Agreement",
  "Delivery note",
] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];
export interface Invoice {
  id: string;
  no: string;
  clientId: string;
  projectId: string;
  issue: string;
  due: string;
  currency: Currency;
  discount: number;
  sent: boolean;
  showSchedule: boolean;
  includeTerms: boolean;
  includeRates: boolean;
  notes: string;
  items: Item[];
  images: Img[];
  kind?: DocumentType;
  sourceId?: string;
  response?: "Pending" | "Accepted" | "Declined";
  followUp?: string;
  followUps?: { date: string; note: string }[];
  agreementText?: string;
  confirmedBy?: string;
  confirmedOn?: string;
  clientSignature?: string;
  deliveryMethod?: string;
  deliveryLink?: string;
}
export interface Payment {
  id: string;
  invoiceId: string;
  date: string;
  amount: number;
  currency: Currency;
  method: string;
  reference: string;
}
export interface Expense {
  id: string;
  date: string;
  projectId: string;
  category: string;
  vendor: string;
  description: string;
  amount: number;
  currency: Currency;
  receipt: string;
  account?: Account;
}
export interface Goal {
  id: string;
  name: string;
  kind: "cash" | "clients" | "manual";
  target: number;
  current: number;
  account?: Account;
}
export interface Settings {
  businessName: string;
  logo: string;
  phones: string;
  email: string;
  website: string;
  address: string;
  abaName: string;
  abaNumber: string;
  khqr: string;
  signature: string;
  signatoryName: string;
  signatoryTitle: string;
  dueDays: number;
  khrRate: number;
  designTerms: { label: string; text: string }[];
  paymentTerms: string[];
  extraRates: { label: string; detail: string; price: string }[];
  thankYou: string;
  ownerName: string;
}
export interface DB {
  clients: Client[];
  services: Service[];
  projects: Project[];
  invoices: Invoice[];
  payments: Payment[];
  expenses: Expense[];
  goals: Goal[];
  settings: Settings;
  categoryLimits?: Record<string, number>;
}

export const uid = () =>
  Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
export const today = () => new Date().toISOString().slice(0, 10);
export const addDays = (d: string, n: number) => {
  const x = new Date(d + "T00:00:00Z");
  x.setUTCDate(x.getUTCDate() + n);
  return x.toISOString().slice(0, 10);
};

const defaultSettings: Settings = {
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
      text: "All design work will be based on the scope agreed upon in the quotation or proposal. Any additional work beyond the original scope may incur extra charges and timeline adjustments.",
    },
    {
      label: "Client Responsibilities",
      text: "The client agrees to provide clear feedback, timely approvals, and all required content. Delays in communication may result in an extended timeline.",
    },
    {
      label: "Cancellation & Refunds",
      text: "Any cancellation of a job after signing of this quotation, the client agrees to compensate 50% of the total price quoted.",
    },
    {
      label: "Liability",
      text: "RothVan Design is not liable for printing, third-party issues, or any damages arising from the use of the final design beyond its intended scope.",
    },
  ],
  paymentTerms: [
    "Payment 50% before starting design.",
    "Payment 50% after the final product is received.",
    "No refund if the client cancels.",
  ],
  extraRates: [
    {
      label: "Additional Design Revision",
      detail: "After included revision rounds are used",
      price: "$25.00 / round",
    },
    {
      label: "Urgent / Rush Project Fee",
      detail: "24 to 48 hour turnaround requests",
      price: "+30% of total cost",
    },
    {
      label: "Additional Concept Design",
      detail: "Beyond original concept options provided",
      price: "$50.00 / concept",
    },
    {
      label: "File Format Conversion / Resizing",
      detail: "Custom dimensions or print-ready",
      price: "$10.00 / file set",
    },
  ],
  thankYou:
    "Thank you for choosing RothVan Design. We're proud to support your brand with design excellence.",
};

function seed(): DB {
  const m = (n: number, day = 10) => {
    const now = new Date();
    const d = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - n, day),
    );
    return d.toISOString().slice(0, 10);
  };
  return {
    clients: rothvanClients.map((c) => ({ ...c })),
    services: rothvanServices.map((s) => ({ ...s })),
    projects: rothvanProjects.map((p) => ({ ...p })),
    invoices: rothvanInvoices.map((i) => ({
      ...i,
      items: i.items.map((it) => ({ ...it })),
      images: i.images.map((im) => ({ ...im })),
    })),
    payments: rothvanPayments.map((p) => ({ ...p })),
    expenses: buildSampleExpenses(m),
    goals: rothvanGoals.map((g) => ({ ...g })),
    settings: { ...defaultSettings },
    categoryLimits: {},
  };
}

const KEY = "rothvan-studio-v3";
const PREV_KEY = "rothvan-studio-v2";
const LEGACY_KEY = "rothvan-studio-v1";
let state: DB = seed();
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const p = JSON.parse(raw);
      const seeded = seed();
      const rawServices = Array.isArray(p.services)
        ? (p.services as Service[])
        : seeded.services;
      state = {
        ...seeded,
        ...p,
        services: rawServices.map((s) => ({
          ...s,
          pillar: normalizeServicePillar(s.pillar),
        })),
        settings: { ...defaultSettings, ...p.settings },
        categoryLimits: { ...(p.categoryLimits ?? {}) },
      };
      return;
    }
    const prevRaw =
      localStorage.getItem(PREV_KEY) ?? localStorage.getItem(LEGACY_KEY);
    if (prevRaw) {
      const lp = JSON.parse(prevRaw);
      if (lp?.settings) {
        state = {
          ...seed(),
          settings: { ...defaultSettings, ...lp.settings },
        };
      }
    }
  } catch {
    /* ignore */
  }
}
export function getDB() {
  load();
  return state;
}
export function setDB(fn: (d: DB) => DB) {
  load();
  state = fn(state);
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    alert("Storage is full. Remove some images to keep saving.");
  }
  listeners.forEach((l) => l());
}
export function resetDB() {
  setDB(() => seed());
}
export function useDB<T>(sel: (d: DB) => T): T {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => sel(getDB()),
    () => sel(state),
  );
}

/* ---------- Rules ---------- */
export function nextInvoiceNo(
  issue: string,
  existing: { no: string }[],
  kind: DocumentType = "Invoice",
) {
  const prefix =
    {
      Invoice: "RVIN-",
      Quotation: "RVQT-",
      Agreement: "RVAG-",
      "Delivery note": "RVDN-",
    }[kind] + issue.slice(2).replace(/-/g, "");
  const n =
    Math.max(
      0,
      ...existing
        .filter((i) => i.no.startsWith(prefix))
        .map((i) => Number(i.no.slice(prefix.length)) || 0),
    ) + 1;
  return prefix + String(n).padStart(2, "0");
}
export function invoiceTotals(inv: Pick<Invoice, "items" | "discount">) {
  const subtotal = inv.items.reduce(
    (s, it) =>
      s + Math.max(0, Number(it.qty) || 0) * Math.max(0, Number(it.price) || 0),
    0,
  );
  const pct = Math.min(100, Math.max(0, Number(inv.discount) || 0));
  const discountAmt = subtotal * (pct / 100);
  return { subtotal, discountAmt, total: subtotal - discountAmt };
}
export const toUSD = (amount: number, cur: Currency, rate: number) =>
  cur === "KHR" ? amount / (rate || 4100) : amount;
export function invoicePaid(inv: Invoice, payments: Payment[], rate: number) {
  return payments
    .filter((p) => p.invoiceId === inv.id)
    .reduce(
      (s, p) =>
        s +
        (p.currency === inv.currency
          ? p.amount
          : inv.currency === "USD"
            ? toUSD(p.amount, p.currency, rate)
            : p.amount * rate),
      0,
    );
}
export const documentKind = (inv: Invoice): DocumentType =>
  inv.kind ?? "Invoice";
export const isInvoice = (inv: Invoice) => documentKind(inv) === "Invoice";
export function needsFollowUp(inv: Invoice, now = today()) {
  return (
    documentKind(inv) === "Quotation" &&
    inv.sent &&
    (!inv.response || inv.response === "Pending") &&
    Boolean(inv.followUp && inv.followUp <= now)
  );
}
export function convertDocument(
  source: Invoice,
  kind: DocumentType,
  existing: Invoice[],
  issue = today(),
  dueDays = 28,
): Invoice {
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
    items: source.items.map((it) => ({ ...it, id: uid() })),
    showSchedule: kind !== "Delivery note" && source.showSchedule,
  };
}
export type InvStatus =
  | "Draft"
  | "Sent"
  | "Partial"
  | "Paid"
  | "Overdue"
  | "Accepted"
  | "Declined"
  | "Expired"
  | "Signed"
  | "Received";
export function invoiceStatus(
  inv: Invoice,
  paid: number,
  now = today(),
): InvStatus {
  if (!isInvoice(inv)) {
    if (inv.response === "Declined") return "Declined";
    if (inv.response === "Accepted")
      return documentKind(inv) === "Agreement"
        ? "Signed"
        : documentKind(inv) === "Delivery note"
          ? "Received"
          : "Accepted";
    if (!inv.sent) return "Draft";
    if (documentKind(inv) === "Quotation" && inv.due && inv.due < now)
      return "Expired";
    return "Sent";
  }
  const { total } = invoiceTotals(inv);
  if (total > 0 && paid >= total - 0.005) return "Paid";
  if (!inv.sent && paid <= 0) return "Draft";
  if (inv.due && inv.due < now) return "Overdue";
  if (paid > 0) return "Partial";
  return "Sent";
}
export function invoiceView(inv: Invoice, db: DB) {
  const t = invoiceTotals(inv);
  const paid = isInvoice(inv)
    ? invoicePaid(inv, db.payments, db.settings.khrRate)
    : 0;
  const status = invoiceStatus(inv, paid);
  const r = db.settings.khrRate;
  return {
    ...t,
    paid,
    balance: isInvoice(inv) ? Math.max(0, t.total - paid) : 0,
    status,
    totalUSD: isInvoice(inv) ? toUSD(t.total, inv.currency, r) : 0,
    balanceUSD: isInvoice(inv)
      ? toUSD(Math.max(0, t.total - paid), inv.currency, r)
      : 0,
  };
}

export const expenseAccount = (expense: Expense): Account =>
  expense.account ?? "Studio";
export const goalAccount = (goal: Goal): Account => goal.account ?? "Studio";
export const expenseCategoriesFor = (account: Account) =>
  account === "Personal" ? PERSONAL_CATEGORIES : EXPENSE_CATEGORIES;
export function cashReceived(db: DB, period: string) {
  const ids = new Set(db.invoices.filter(isInvoice).map((i) => i.id));
  return db.payments
    .filter((p) => ids.has(p.invoiceId) && p.date.startsWith(period))
    .reduce((s, p) => s + toUSD(p.amount, p.currency, db.settings.khrRate), 0);
}
export function expenseTotal(db: DB, account: Account, period: string) {
  return db.expenses
    .filter((e) => expenseAccount(e) === account && e.date.startsWith(period))
    .reduce((s, e) => s + toUSD(e.amount, e.currency, db.settings.khrRate), 0);
}
export function categoryTotals(db: DB, account: Account, period: string) {
  const map = new Map<
    string,
    { category: string; totalUSD: number; count: number }
  >();
  for (const e of db.expenses) {
    if (expenseAccount(e) !== account || (period && !e.date.startsWith(period)))
      continue;
    const prev = map.get(e.category) ?? {
      category: e.category || "Other",
      totalUSD: 0,
      count: 0,
    };
    prev.totalUSD += toUSD(e.amount, e.currency, db.settings.khrRate);
    prev.count += 1;
    map.set(e.category, prev);
  }
  return Array.from(map.values()).sort((a, b) => b.totalUSD - a.totalUSD);
}
export function categoryLimit(db: DB, account: Account, category: string) {
  const key = `${account}:${category}`;
  const custom = db.categoryLimits?.[key];
  if (typeof custom === "number" && Number.isFinite(custom) && custom >= 0) {
    return custom;
  }
  const defaults =
    account === "Personal" ? DEFAULT_PERSONAL_LIMITS : DEFAULT_STUDIO_LIMITS;
  return defaults[category] ?? 100;
}
export function setCategoryLimit(
  account: Account,
  category: string,
  limit: number,
) {
  const clean = Math.max(0, Math.round(limit * 100) / 100);
  setDB((d) => ({
    ...d,
    categoryLimits: {
      ...(d.categoryLimits ?? {}),
      [`${account}:${category}`]: clean,
    },
  }));
}
export function previousMonth(ym: string) {
  const [y, m] = ym.split("-").map(Number);
  if (!y || !m) return ym;
  const d = new Date(Date.UTC(y, m - 2, 1));
  return d.toISOString().slice(0, 7);
}
export type CashRange = "1m" | "6m" | "12m" | "all";
export type PersonalRange = "1m" | "6m" | "12m";
export interface CashFlowPoint {
  m: string;
  label: string;
  fullDate: string;
  inn: number;
  out: number;
  personalOut: number;
  net: number;
  combinedNet: number;
  inCount: number;
  outCount: number;
}
function trailingMonths(n: number, anchorMonth?: string) {
  const out: string[] = [];
  const ref =
    anchorMonth && /^\d{4}-\d{2}$/.test(anchorMonth)
      ? anchorMonth
      : today().slice(0, 7);
  const [y, m] = ref.split("-").map(Number);
  const baseY = y || new Date().getUTCFullYear();
  const baseM = (m || new Date().getUTCMonth() + 1) - 1;
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(baseY, baseM - i, 1));
    out.push(d.toISOString().slice(0, 7));
  }
  return out;
}

export interface PersonalSeriesPoint {
  key: string;
  label: string;
  fullDate: string;
  personalOut: number;
  studioOut: number;
  count: number;
}

export function personalSeries(
  db: DB,
  range: PersonalRange,
  anchorMonth = today().slice(0, 7),
): PersonalSeriesPoint[] {
  const r = db.settings.khrRate;
  if (range === "1m") {
    const ym = /^\d{4}-\d{2}$/.test(anchorMonth)
      ? anchorMonth
      : today().slice(0, 7);
    const [y, m] = ym.split("-").map(Number);
    const daysInMonth = y && m ? new Date(Date.UTC(y, m, 0)).getUTCDate() : 30;
    const pts: PersonalSeriesPoint[] = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const iso = `${ym}-${String(day).padStart(2, "0")}`;
      const dt = new Date(iso + "T00:00:00Z");
      const personalItems = db.expenses.filter(
        (e) => expenseAccount(e) === "Personal" && e.date === iso,
      );
      const personalOut = personalItems.reduce(
        (s, e) => s + toUSD(e.amount, e.currency, r),
        0,
      );
      const studioOut = db.expenses
        .filter((e) => expenseAccount(e) === "Studio" && e.date === iso)
        .reduce((s, e) => s + toUSD(e.amount, e.currency, r), 0);
      pts.push({
        key: iso,
        label: dt.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          timeZone: "UTC",
        }),
        fullDate: dt.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
          timeZone: "UTC",
        }),
        personalOut,
        studioOut,
        count: personalItems.length,
      });
    }
    return pts;
  }
  const months = trailingMonths(range === "6m" ? 6 : 12, anchorMonth);
  return months.map((m) => {
    const personalItems = db.expenses.filter(
      (e) => expenseAccount(e) === "Personal" && e.date.startsWith(m),
    );
    const personalOut = personalItems.reduce(
      (s, e) => s + toUSD(e.amount, e.currency, r),
      0,
    );
    const studioOut = db.expenses
      .filter((e) => expenseAccount(e) === "Studio" && e.date.startsWith(m))
      .reduce((s, e) => s + toUSD(e.amount, e.currency, r), 0);
    const dt = new Date(m + "-01T00:00:00Z");
    return {
      key: m,
      label: dt.toLocaleDateString("en-US", {
        month: "short",
        timeZone: "UTC",
      }),
      fullDate: dt.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }),
      personalOut,
      studioOut,
      count: personalItems.length,
    };
  });
}

export function personalCategoryTotals(
  db: DB,
  range: PersonalRange,
  anchorMonth = today().slice(0, 7),
) {
  const monthsCount = range === "1m" ? 1 : range === "6m" ? 6 : 12;
  const monthSet = new Set(trailingMonths(monthsCount, anchorMonth));
  const map = new Map<
    string,
    { category: string; totalUSD: number; count: number }
  >();
  for (const e of db.expenses) {
    if (expenseAccount(e) !== "Personal") continue;
    const ym = e.date.slice(0, 7);
    if (!monthSet.has(ym)) continue;
    const prev = map.get(e.category) ?? {
      category: e.category || "Other",
      totalUSD: 0,
      count: 0,
    };
    prev.totalUSD += toUSD(e.amount, e.currency, db.settings.khrRate);
    prev.count += 1;
    map.set(e.category, prev);
  }
  const monthLabel = new Date(anchorMonth + "-01T00:00:00Z").toLocaleDateString(
    "en-US",
    { month: "long", year: "numeric", timeZone: "UTC" },
  );
  const scopeLabel =
    range === "1m"
      ? monthLabel
      : range === "6m"
        ? "last 6 months"
        : "last 12 months";
  return {
    items: Array.from(map.values()).sort((a, b) => b.totalUSD - a.totalUSD),
    monthsCount,
    scopeLabel,
    monthSet,
  };
}

export interface CardSpendPoint {
  key: string;
  label: string;
  fullDate: string;
  debit: number;
  credit: number;
  other: number;
  total: number;
  debitCount: number;
  creditCount: number;
  count: number;
}

export function cardKind(vendor: string): "Debit" | "Credit" | "Other" {
  const v = vendor.trim().toLowerCase();
  if (v.includes("debit")) return "Debit";
  if (v.includes("credit")) return "Credit";
  return "Other";
}

export function cardSpendSeries(
  db: DB,
  range: PersonalRange,
  anchorMonth = today().slice(0, 7),
) {
  const r = db.settings.khrRate;
  const personalExpenses = db.expenses.filter(
    (e) => expenseAccount(e) === "Personal",
  );
  let points: CardSpendPoint[];

  if (range === "1m") {
    const ym = /^\d{4}-\d{2}$/.test(anchorMonth)
      ? anchorMonth
      : today().slice(0, 7);
    const [y, m] = ym.split("-").map(Number);
    const daysInMonth = y && m ? new Date(Date.UTC(y, m, 0)).getUTCDate() : 30;
    points = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const iso = `${ym}-${String(day).padStart(2, "0")}`;
      const dt = new Date(iso + "T00:00:00Z");
      const dayItems = personalExpenses.filter((e) => e.date === iso);
      let debit = 0;
      let credit = 0;
      let other = 0;
      let debitCount = 0;
      let creditCount = 0;
      for (const e of dayItems) {
        const usd = toUSD(e.amount, e.currency, r);
        const kind = cardKind(e.vendor);
        if (kind === "Debit") {
          debit += usd;
          debitCount += 1;
        } else if (kind === "Credit") {
          credit += usd;
          creditCount += 1;
        } else {
          other += usd;
        }
      }
      points.push({
        key: iso,
        label: dt.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          timeZone: "UTC",
        }),
        fullDate: dt.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
          timeZone: "UTC",
        }),
        debit,
        credit,
        other,
        total: debit + credit + other,
        debitCount,
        creditCount,
        count: dayItems.length,
      });
    }
  } else {
    const months = trailingMonths(range === "6m" ? 6 : 12, anchorMonth);
    points = months.map((m) => {
      const mItems = personalExpenses.filter((e) => e.date.startsWith(m));
      let debit = 0;
      let credit = 0;
      let other = 0;
      let debitCount = 0;
      let creditCount = 0;
      for (const e of mItems) {
        const usd = toUSD(e.amount, e.currency, r);
        const kind = cardKind(e.vendor);
        if (kind === "Debit") {
          debit += usd;
          debitCount += 1;
        } else if (kind === "Credit") {
          credit += usd;
          creditCount += 1;
        } else {
          other += usd;
        }
      }
      const dt = new Date(m + "-01T00:00:00Z");
      return {
        key: m,
        label: dt.toLocaleDateString("en-US", {
          month: "short",
          timeZone: "UTC",
        }),
        fullDate: dt.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
          timeZone: "UTC",
        }),
        debit,
        credit,
        other,
        total: debit + credit + other,
        debitCount,
        creditCount,
        count: mItems.length,
      };
    });
  }

  const debitUSD = points.reduce((s, x) => s + x.debit, 0);
  const creditUSD = points.reduce((s, x) => s + x.credit, 0);
  const otherUSD = points.reduce((s, x) => s + x.other, 0);
  const debitCount = points.reduce((s, x) => s + x.debitCount, 0);
  const creditCount = points.reduce((s, x) => s + x.creditCount, 0);
  const monthLabel = new Date(anchorMonth + "-01T00:00:00Z").toLocaleDateString(
    "en-US",
    { month: "long", year: "numeric", timeZone: "UTC" },
  );
  const scopeLabel =
    range === "1m"
      ? `${monthLabel} (daily)`
      : range === "6m"
        ? "last 6 months"
        : "last 12 months";

  return {
    points,
    debitUSD,
    creditUSD,
    otherUSD,
    totalUSD: debitUSD + creditUSD + otherUSD,
    debitCount,
    creditCount,
    scopeLabel,
  };
}

export function revenueByPillar(db: DB) {
  const map = new Map<
    string,
    { label: string; totalUSD: number; count: number }
  >();
  const svcMap = new Map(db.services.map((s) => [s.id, s]));
  const projMap = new Map(db.projects.map((p) => [p.id, p]));
  for (const inv of db.invoices) {
    if (!isInvoice(inv)) continue;
    const v = invoiceView(inv, db);
    if (v.status === "Draft" || v.totalUSD <= 0) continue;
    const proj = projMap.get(inv.projectId);
    const firstSvcId =
      inv.items.find((it) => it.serviceId)?.serviceId ?? proj?.serviceId;
    const pillar =
      (firstSvcId ? svcMap.get(firstSvcId)?.pillar : undefined) ||
      "Custom / Other";
    const cur = map.get(pillar) ?? { label: pillar, totalUSD: 0, count: 0 };
    cur.totalUSD += v.totalUSD;
    cur.count += 1;
    map.set(pillar, cur);
  }
  return Array.from(map.values()).sort((a, b) => b.totalUSD - a.totalUSD);
}

export function cashFlowSeries(db: DB, range: CashRange): CashFlowPoint[] {
  const r = db.settings.khrRate;
  const invIds = new Set(db.invoices.filter(isInvoice).map((i) => i.id));
  let months: string[];
  if (range === "all") {
    const allDates = [
      ...db.payments.filter((p) => invIds.has(p.invoiceId)).map((p) => p.date),
      ...db.expenses.map((e) => e.date),
    ]
      .filter((d) => /^\d{4}-\d{2}/.test(d))
      .sort();
    const first = allDates[0]?.slice(0, 7) ?? today().slice(0, 7);
    const last = today().slice(0, 7);
    const [fy, fm] = first.split("-").map(Number);
    const [ly, lm] = last.split("-").map(Number);
    months = [];
    if (fy && fm && ly && lm) {
      let y = fy;
      let m = fm;
      while (y < ly || (y === ly && m <= lm)) {
        months.push(`${y}-${String(m).padStart(2, "0")}`);
        m += 1;
        if (m > 12) {
          m = 1;
          y += 1;
        }
      }
    }
  } else {
    months = trailingMonths(range === "1m" ? 1 : range === "6m" ? 6 : 12);
  }
  const showYear = range === "all";
  return months.map((m) => {
    const payList = db.payments.filter(
      (p) => invIds.has(p.invoiceId) && p.date.startsWith(m),
    );
    const studioExpList = db.expenses.filter(
      (e) => expenseAccount(e) === "Studio" && e.date.startsWith(m),
    );
    const personalExpList = db.expenses.filter(
      (e) => expenseAccount(e) === "Personal" && e.date.startsWith(m),
    );
    const inn = payList.reduce((s, p) => s + toUSD(p.amount, p.currency, r), 0);
    const out = studioExpList.reduce(
      (s, e) => s + toUSD(e.amount, e.currency, r),
      0,
    );
    const personalOut = personalExpList.reduce(
      (s, e) => s + toUSD(e.amount, e.currency, r),
      0,
    );
    const dt = new Date(m + "-01T00:00:00Z");
    const label = dt.toLocaleDateString("en-US", {
      month: "short",
      ...(showYear ? { year: "2-digit" } : {}),
      timeZone: "UTC",
    });
    const fullDate = dt.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });
    return {
      m,
      label,
      fullDate,
      inn,
      out,
      personalOut,
      net: inn - out,
      combinedNet: inn - out - personalOut,
      inCount: payList.length,
      outCount: studioExpList.length + personalExpList.length,
    };
  });
}
export function serviceItem(
  service: Service,
  currency: Currency,
  rate: number,
): Item {
  return {
    id: uid(),
    serviceId: service.id,
    description: service.name,
    scope: service.scope,
    timeline: service.timeline,
    qty: 1,
    price: currency === "KHR" ? service.rate * rate : service.rate,
  };
}
export function effectiveServiceTags(service: Service): string[] {
  if (service.tags && service.tags.length > 0) {
    return Array.from(
      new Set(service.tags.map((t) => t.trim()).filter(Boolean)),
    );
  }
  const tags: string[] = [];
  const txt = `${service.name} ${service.scope}`.toLowerCase();
  if (/\blogo\b|monogram|rebrand/.test(txt)) tags.push("Logo");
  if (/brand|identity|guidestyle|guideline/.test(txt)) tags.push("Brand Guide");
  if (/web|homepage|landing|ui\/ux|figma/.test(txt)) tags.push("Web & UI");
  if (/pack|box|label|dieline|eco bag|tote/.test(txt)) tags.push("Packaging");
  if (/social|promo|post|invitation/.test(txt)) tags.push("Social & Digital");
  if (/3d|led|signage|booth|backdrop|pylon|totem|arc|wayfinding/.test(txt))
    tags.push("Signage & 3D");
  if (tags.length === 0) {
    tags.push(normalizeServicePillar(service.pillar) || "Print & Collateral");
  }
  return Array.from(new Set(tags)).slice(0, 2);
}
export function parseTimelineDays(timeline: string, fallback = 14): number {
  const m = timeline.match(/(\d+)\s*(?:-\s*(\d+))?\s*(day|week|month)/i);
  if (!m) return fallback;
  const n = Number(m[2] ?? m[1]) || fallback;
  const unit = (m[3] ?? "day").toLowerCase();
  return unit.startsWith("month")
    ? n * 30
    : unit.startsWith("week")
      ? n * 7
      : n;
}
function estimateDue(inv: Invoice, start: string): string {
  const days = inv.items.reduce(
    (mx, it) =>
      Math.max(mx, it.timeline ? parseTimelineDays(it.timeline, 0) : 0),
    0,
  );
  if (days > 0) return addDays(start, days);
  return inv.due && inv.due >= start ? inv.due : addDays(start, 14);
}
/** Save a document and its milestone together; drafts do not start production. */
export function saveDocument(db: DB, document: Invoice): DB {
  const inv = { ...document };
  let projects = [...db.projects];
  const existingProject = projects.find((p) => p.id === inv.projectId);
  if (existingProject && existingProject.clientId !== inv.clientId)
    throw new Error("Choose a project belonging to this client.");
  if (!existingProject && inv.projectId) inv.projectId = "";
  const kind = documentKind(inv);
  const totalUSD = toUSD(
    invoiceTotals(inv).total,
    inv.currency,
    db.settings.khrRate,
  );
  const itemServiceId = inv.items.find((i) => i.serviceId)?.serviceId ?? "";
  if (!inv.projectId && (inv.sent || inv.response === "Accepted")) {
    const code =
      "RVD-" +
      (Math.max(
        100,
        ...projects.map((p) => Number(p.code.replace("RVD-", "")) || 0),
      ) +
        1);
    const project: Project = {
      id: uid(),
      code,
      clientId: inv.clientId,
      serviceId: itemServiceId,
      name: inv.items[0]?.description || "Design project",
      status: "Inquiry",
      start: "",
      due: "",
      delivered: "",
      quote: totalUSD,
    };
    projects.push(project);
    inv.projectId = project.id;
  }
  projects = projects.map((p) => {
    if (p.id !== inv.projectId) return p;
    const synced = {
      ...p,
      serviceId: p.serviceId || itemServiceId,
      quote:
        totalUSD > 0 &&
        (kind === "Quotation" || kind === "Invoice" || !p.quote) &&
        !["Delivered", "Closed"].includes(p.status)
          ? totalUSD
          : p.quote,
    };
    if (
      kind === "Quotation" &&
      (inv.sent || inv.response === "Accepted") &&
      synced.status === "Inquiry"
    ) {
      return { ...synced, status: "Quoted", quote: totalUSD || synced.quote };
    }
    if (
      (kind === "Agreement" && inv.response === "Accepted") ||
      (kind === "Invoice" && inv.sent)
    ) {
      if (["Inquiry", "Quoted"].includes(synced.status)) {
        const start = synced.start || inv.confirmedOn || inv.issue;
        return {
          ...synced,
          status: "In production",
          start,
          due: synced.due || estimateDue(inv, start),
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
        delivered,
      };
    }
    return synced;
  });
  const invoices = db.invoices.some((i) => i.id === inv.id)
    ? db.invoices.map((i) => (i.id === inv.id ? inv : i))
    : [...db.invoices, inv];
  const won = inv.response === "Accepted" || (kind === "Invoice" && inv.sent);
  const clients = won
    ? db.clients.map((c) =>
        c.id === inv.clientId && c.status === "Lead"
          ? { ...c, status: "Active" }
          : c,
      )
    : db.clients;
  return reconcileProjects({ ...db, invoices, projects, clients });
}
export function reconcileProjects(db: DB): DB {
  return {
    ...db,
    projects: db.projects.map((p) => {
      const bills = db.invoices.filter(
        (i) => isInvoice(i) && i.projectId === p.id,
      );
      const paid =
        bills.length > 0 &&
        bills.every(
          (i) =>
            invoiceTotals(i).total > 0 && invoiceView(i, db).balance <= 0.005,
        );
      if (p.status === "Delivered" && paid) return { ...p, status: "Closed" };
      if (p.status === "Closed" && p.delivered && !paid)
        return { ...p, status: "Delivered" };
      if (
        ["Inquiry", "Quoted"].includes(p.status) &&
        bills.some((i) => invoiceView(i, db).paid > 0)
      ) {
        const start = p.start || today();
        return {
          ...p,
          status: "In production",
          start,
          due: p.due || addDays(start, 14),
        };
      }
      return p;
    }),
  };
}
export function recordPayment(db: DB, payment: Payment): DB {
  const inv = db.invoices.find((i) => i.id === payment.invoiceId);
  if (!inv || !isInvoice(inv))
    throw new Error("Payments must belong to an invoice.");
  const amount =
    payment.currency === inv.currency
      ? payment.amount
      : inv.currency === "USD"
        ? toUSD(payment.amount, payment.currency, db.settings.khrRate)
        : payment.amount * db.settings.khrRate;
  if (
    !(amount > 0) ||
    !Number.isFinite(amount) ||
    amount > invoiceView(inv, db).balance + 0.005
  )
    throw new Error("Enter a payment within the outstanding balance.");
  const invoices = db.invoices.map((i) =>
    i.id === inv.id && !i.sent ? { ...i, sent: true } : i,
  );
  const clients = db.clients.map((c) =>
    c.id === inv.clientId && c.status === "Lead"
      ? { ...c, status: "Active" }
      : c,
  );
  return reconcileProjects({
    ...db,
    invoices,
    clients,
    payments: [...db.payments, payment],
  });
}
export function deletePayment(db: DB, paymentId: string): DB {
  return reconcileProjects({
    ...db,
    payments: db.payments.filter((x) => x.id !== paymentId),
  });
}
export function updateProject(db: DB, project: Project): DB {
  if (project.start && project.due && project.due < project.start)
    throw new Error("End date must not be before the start date.");
  const start =
    project.start || (project.status === "In production" ? today() : "");
  const next = {
    ...project,
    start,
    due:
      project.due ||
      (start && project.status === "In production" ? addDays(start, 14) : ""),
    delivered:
      project.delivered ||
      (["Delivered", "Closed"].includes(project.status) ? today() : ""),
  };
  return reconcileProjects({
    ...db,
    projects: db.projects.some((p) => p.id === next.id)
      ? db.projects.map((p) => (p.id === next.id ? next : p))
      : [...db.projects, next],
  });
}

/* ---------- Format ---------- */
export function money(n: number, cur: Currency = "USD", signed = false) {
  const sign = signed ? (n > 0 ? "+" : n < 0 ? "−" : "") : n < 0 ? "−" : "";
  const a = Math.abs(n);
  if (cur === "KHR") return `${sign}៛${Math.round(a).toLocaleString("en-US")}`;
  return `${sign}$${a.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
export function compactMoney(n: number, cur: Currency = "USD", signed = false) {
  const sign = signed ? (n > 0 ? "+" : n < 0 ? "−" : "") : n < 0 ? "−" : "";
  const a = Math.abs(n);
  const sym = cur === "KHR" ? "៛" : "$";
  const fmtUnit = (val: number, suffix: string) => {
    const rounded = Math.round(val * 10) / 10;
    const str = Number.isInteger(rounded)
      ? String(rounded)
      : rounded.toFixed(1).replace(/\.0$/, "");
    return `${sign}${sym}${str}${suffix}`;
  };
  if (a >= 1_000_000) return fmtUnit(a / 1_000_000, "M");
  if (a >= 1_000) return fmtUnit(a / 1_000, "k");
  if (cur === "KHR") return `${sign}៛${Math.round(a)}`;
  const small = Math.round(a * 100) / 100;
  return `${sign}$${Number.isInteger(small) ? String(small) : small.toFixed(2).replace(/0$/, "")}`;
}
export const longDate = (d: string) =>
  d
    ? new Date(d + "T00:00:00").toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "—";
export const shortDate = (d: string) =>
  d
    ? new Date(d + "T00:00:00").toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : "—";

export async function fileToDataUrl(file: File, max = 1200): Promise<string> {
  const url = URL.createObjectURL(file);
  const img = await new Promise<HTMLImageElement>((res, rej) => {
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
  return c.toDataURL(
    file.type === "image/png" ? "image/png" : "image/jpeg",
    0.82,
  );
}
