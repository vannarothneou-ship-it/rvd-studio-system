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
export const CARD_METHODS = ["Debit", "Credit"] as const;
export const PERSONAL_INCOME_SOURCES = [
  "Salary",
  "Studio Draw",
  "Freelance",
  "Bonus",
  "Investment",
  "Gift & Refund",
  "Other",
] as const;
export const PERSONAL_INCOME_METHODS = ["Debit", "Credit"] as const;
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
export const DESIGN_TYPES = [
  "Branding & Identity",
  "Creative & Digital",
  "Social & Campaign",
  "Marketing & Packaging",
  "Print & Collateral",
  "UI & Web",
  "Spatial & Signage",
  "Presentation & Deck",
  "Other",
] as const;

export const WORK_STATUSES = [
  "Current",
  "In review",
  "Completed",
  "Backlog",
] as const;
export type WorkStatus = (typeof WORK_STATUSES)[number];

export interface DesignMedia {
  id: string;
  name: string;
  mimeType: string;
  kind: "image" | "pdf";
  size: number;
  dataUrl?: string;
  createdAt: string;
}

export const DEFAULT_WORK_PROJECTS = ["DBG", "Connexion", "OCIC"] as const;

export interface WorkTask {
  id: string;
  code: string;
  title: string;
  status: WorkStatus;
  designType: string;
  artworkCount: number;
  projectName?: string;
  company: string;
  startDate?: string;
  dueDate: string;
  completedDate: string;
  notes: string;
  media: DesignMedia[];
  featured?: boolean;
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
  artworkCount?: number;
  media?: DesignMedia[];
  featured?: boolean;
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
export interface PersonalIncome {
  id: string;
  date: string;
  source: string;
  accountMethod: string;
  description: string;
  amount: number;
  currency: Currency;
}
export type GoalCadence = "daily" | "monthly" | "yearly";
export interface GoalContribution {
  id: string;
  date: string;
  amount: number;
  cadence?: GoalCadence;
  note?: string;
}
export interface Goal {
  id: string;
  name: string;
  kind: "cash" | "clients" | "manual";
  target: number;
  current: number;
  account?: Account;
  cadence?: GoalCadence;
  contributionAmount?: number;
  targetDate?: string;
  contributions?: GoalContribution[];
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
  workProjects?: string[];
  portfolioHeadline?: string;
  portfolioBio?: string;
}
export type CaseStudyTheme = "obsidian" | "paper" | "slate";
export type CaseStudyAspect =
  "sheet" | "social-4x5" | "square-1x1" | "slide-16x9";
export type CaseStudyBlockType =
  | "header"
  | "subheader"
  | "paragraph"
  | "divider"
  | "image"
  | "gallery"
  | "metrics"
  | "quote";

export interface CaseStudyBlock {
  id: string;
  type: CaseStudyBlockType;
  title?: string;
  text?: string;
  caption?: string;
  mediaIds?: string[];
  stats?: { label: string; value: string }[];
  align?: "left" | "center";
}

export interface CaseStudyDoc {
  id: string;
  itemId: string;
  source: "work" | "studio";
  title: string;
  subtitle: string;
  projectGroup: string;
  designType: string;
  theme: CaseStudyTheme;
  aspect: CaseStudyAspect;
  blocks: CaseStudyBlock[];
  updatedAt: string;
}

export type ReminderCategory =
  "car-odo" | "birthday" | "special" | "bill" | "general";

export interface CalendarReminder {
  id: string;
  title: string;
  date: string;
  category: ReminderCategory;
  odoKm?: number;
  notifyDaysBefore: number;
  repeatYearly?: boolean;
  notes: string;
  media?: DesignMedia[];
  dismissedForDate?: string;
}

export interface DB {
  clients: Client[];
  services: Service[];
  projects: Project[];
  invoices: Invoice[];
  payments: Payment[];
  expenses: Expense[];
  personalIncome: PersonalIncome[];
  workTasks: WorkTask[];
  reminders?: CalendarReminder[];
  goals: Goal[];
  settings: Settings;
  categoryLimits?: Record<string, number>;
  caseStudies?: Record<string, CaseStudyDoc>;
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
  workProjects: [...DEFAULT_WORK_PROJECTS],
  portfolioHeadline: "Visual & Brand Design Portfolio",
  portfolioBio:
    "Selected commercial branding, packaging, campaign visuals, and spatial design delivered across full-time teams and independent studio engagements.",
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
    personalIncome: [],
    workTasks: [],
    reminders: [],
    goals: rothvanGoals.map((g) => ({ ...g })),
    settings: { ...defaultSettings },
    categoryLimits: {},
    caseStudies: {},
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
        personalIncome: Array.isArray(p.personalIncome)
          ? (p.personalIncome as PersonalIncome[])
          : [],
        workTasks: Array.isArray(p.workTasks)
          ? (p.workTasks as WorkTask[]).map((t) => ({
              ...t,
              projectName: t.projectName ?? t.company ?? "",
              startDate: t.startDate ?? "",
              featured: Boolean(t.featured),
              media: Array.isArray(t.media) ? t.media : [],
              artworkCount: Math.max(1, Number(t.artworkCount) || 1),
            }))
          : [],
        reminders: Array.isArray(p.reminders)
          ? (p.reminders as CalendarReminder[]).map((rm) => ({
              ...rm,
              notifyDaysBefore: Math.max(0, Number(rm.notifyDaysBefore) || 0),
              media: Array.isArray(rm.media) ? rm.media : [],
            }))
          : [],
        services: rawServices.map((s) => ({
          ...s,
          pillar: normalizeServicePillar(s.pillar),
        })),
        settings: {
          ...defaultSettings,
          ...p.settings,
          workProjects:
            Array.isArray(p.settings?.workProjects) &&
            p.settings.workProjects.length > 0
              ? (p.settings.workProjects as string[])
              : [...DEFAULT_WORK_PROJECTS],
        },
        categoryLimits: { ...(p.categoryLimits ?? {}) },
        caseStudies:
          p.caseStudies && typeof p.caseStudies === "object"
            ? (p.caseStudies as Record<string, CaseStudyDoc>)
            : {},
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
    console.warn("Local storage capacity reached.");
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
interface LedgerIndex {
  invIds: Set<string>;
  paymentsByInvoice: Map<string, Payment[]>;
  invoicePaymentsAll: Payment[];
  invoicePaymentsByMonth: Map<string, Payment[]>;
  invoicePaymentsByDay: Map<string, Payment[]>;
  studioExpensesAll: Expense[];
  personalExpensesAll: Expense[];
  studioExpensesByMonth: Map<string, Expense[]>;
  personalExpensesByMonth: Map<string, Expense[]>;
  studioExpensesByDay: Map<string, Expense[]>;
  personalExpensesByDay: Map<string, Expense[]>;
  incomeByMonth: Map<string, PersonalIncome[]>;
  incomeByDay: Map<string, PersonalIncome[]>;
  latestDateByMonth: Map<string, string>;
  earliestYM: string;
}

const ledgerIndexCache = new WeakMap<DB, LedgerIndex>();

function pushMap<K, V>(map: Map<K, V[]>, key: K, val: V) {
  let list = map.get(key);
  if (!list) {
    list = [];
    map.set(key, list);
  }
  list.push(val);
}

function noteLatest(latestDateByMonth: Map<string, string>, date: string) {
  if (date.length < 7) return;
  const ym = date.slice(0, 7);
  const prev = latestDateByMonth.get(ym);
  if (!prev || date > prev) latestDateByMonth.set(ym, date);
}

function getLedgerIndex(db: DB): LedgerIndex {
  const cached = ledgerIndexCache.get(db);
  if (cached) return cached;

  const invIds = new Set<string>();
  for (const inv of db.invoices) {
    if (isInvoice(inv)) invIds.add(inv.id);
  }

  const paymentsByInvoice = new Map<string, Payment[]>();
  const invoicePaymentsAll: Payment[] = [];
  const invoicePaymentsByMonth = new Map<string, Payment[]>();
  const invoicePaymentsByDay = new Map<string, Payment[]>();
  const latestDateByMonth = new Map<string, string>();
  let earliestYM = today().slice(0, 7);

  for (const p of db.payments) {
    pushMap(paymentsByInvoice, p.invoiceId, p);
    if (p.date.length >= 7) {
      noteLatest(latestDateByMonth, p.date);
    }
    if (invIds.has(p.invoiceId)) {
      invoicePaymentsAll.push(p);
      if (/^\d{4}-\d{2}/.test(p.date)) {
        const ym = p.date.slice(0, 7);
        if (ym < earliestYM) earliestYM = ym;
        pushMap(invoicePaymentsByMonth, ym, p);
        pushMap(invoicePaymentsByDay, p.date, p);
      }
    }
  }

  const studioExpensesAll: Expense[] = [];
  const personalExpensesAll: Expense[] = [];
  const studioExpensesByMonth = new Map<string, Expense[]>();
  const personalExpensesByMonth = new Map<string, Expense[]>();
  const studioExpensesByDay = new Map<string, Expense[]>();
  const personalExpensesByDay = new Map<string, Expense[]>();

  for (const e of db.expenses) {
    const isStudio = (e.account ?? "Studio") === "Studio";
    if (isStudio) studioExpensesAll.push(e);
    else personalExpensesAll.push(e);

    if (/^\d{4}-\d{2}/.test(e.date)) {
      const ym = e.date.slice(0, 7);
      if (ym < earliestYM) earliestYM = ym;
      noteLatest(latestDateByMonth, e.date);
      if (isStudio) {
        pushMap(studioExpensesByMonth, ym, e);
        pushMap(studioExpensesByDay, e.date, e);
      } else {
        pushMap(personalExpensesByMonth, ym, e);
        pushMap(personalExpensesByDay, e.date, e);
      }
    }
  }

  const incomeByMonth = new Map<string, PersonalIncome[]>();
  const incomeByDay = new Map<string, PersonalIncome[]>();
  for (const inc of db.personalIncome ?? []) {
    if (/^\d{4}-\d{2}/.test(inc.date)) {
      const ym = inc.date.slice(0, 7);
      if (ym < earliestYM) earliestYM = ym;
      noteLatest(latestDateByMonth, inc.date);
      pushMap(incomeByMonth, ym, inc);
      pushMap(incomeByDay, inc.date, inc);
    }
  }

  const idx: LedgerIndex = {
    invIds,
    paymentsByInvoice,
    invoicePaymentsAll,
    invoicePaymentsByMonth,
    invoicePaymentsByDay,
    studioExpensesAll,
    personalExpensesAll,
    studioExpensesByMonth,
    personalExpensesByMonth,
    studioExpensesByDay,
    personalExpensesByDay,
    incomeByMonth,
    incomeByDay,
    latestDateByMonth,
    earliestYM,
  };
  ledgerIndexCache.set(db, idx);
  return idx;
}

export function invoicePaid(inv: Invoice, payments: Payment[], rate: number) {
  let sum = 0;
  for (const p of payments) {
    if (p.invoiceId !== inv.id) continue;
    sum +=
      p.currency === inv.currency
        ? p.amount
        : inv.currency === "USD"
          ? toUSD(p.amount, p.currency, rate)
          : p.amount * rate;
  }
  return sum;
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
  const idx = getLedgerIndex(db);
  const invPayments = idx.paymentsByInvoice.get(inv.id) ?? [];
  const paid = isInvoice(inv)
    ? invoicePaid(inv, invPayments, db.settings.khrRate)
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
  const idx = getLedgerIndex(db);
  const r = db.settings.khrRate;
  const source =
    period.length === 7
      ? (idx.invoicePaymentsByMonth.get(period) ?? [])
      : idx.invoicePaymentsAll;
  let sum = 0;
  for (const p of source) {
    if (period && period.length !== 7 && !p.date.startsWith(period)) continue;
    sum += toUSD(p.amount, p.currency, r);
  }
  return sum;
}
export function expenseTotal(db: DB, account: Account, period: string) {
  const idx = getLedgerIndex(db);
  const r = db.settings.khrRate;
  const source =
    period.length === 7
      ? ((account === "Studio"
          ? idx.studioExpensesByMonth.get(period)
          : idx.personalExpensesByMonth.get(period)) ?? [])
      : account === "Studio"
        ? idx.studioExpensesAll
        : idx.personalExpensesAll;
  let sum = 0;
  for (const e of source) {
    if (period && period.length !== 7 && !e.date.startsWith(period)) continue;
    sum += toUSD(e.amount, e.currency, r);
  }
  return sum;
}
export function categoryTotals(db: DB, account: Account, period: string) {
  const idx = getLedgerIndex(db);
  const r = db.settings.khrRate;
  const source =
    period.length === 7
      ? ((account === "Studio"
          ? idx.studioExpensesByMonth.get(period)
          : idx.personalExpensesByMonth.get(period)) ?? [])
      : account === "Studio"
        ? idx.studioExpensesAll
        : idx.personalExpensesAll;
  const map = new Map<
    string,
    { category: string; totalUSD: number; count: number }
  >();
  for (const e of source) {
    if (period && period.length !== 7 && !e.date.startsWith(period)) continue;
    const prev = map.get(e.category) ?? {
      category: e.category || "Other",
      totalUSD: 0,
      count: 0,
    };
    prev.totalUSD += toUSD(e.amount, e.currency, r);
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
export type CashRange = "today" | "week" | "1m" | "6m" | "12m" | "all";
export type PersonalRange = "today" | "week" | "1m" | "6m" | "12m";
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

function resolveAnchorDay(db: DB, anchorMonth: string): string {
  const ym = /^\d{4}-\d{2}$/.test(anchorMonth)
    ? anchorMonth
    : today().slice(0, 7);
  const nowDay = today();
  if (nowDay.startsWith(ym)) return nowDay;
  const latest = getLedgerIndex(db).latestDateByMonth.get(ym);
  if (latest) return latest;
  const [y, m] = ym.split("-").map(Number);
  const lastDay = y && m ? new Date(Date.UTC(y, m, 0)).getUTCDate() : 28;
  return `${ym}-${String(lastDay).padStart(2, "0")}`;
}

function trailingDays(endDay: string, count: number): string[] {
  const out: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    out.push(addDays(endDay, -i));
  }
  return out;
}

export interface PersonalSeriesPoint {
  key: string;
  label: string;
  fullDate: string;
  personalIn: number;
  personalOut: number;
  studioOut: number;
  net: number;
  inCount: number;
  count: number;
}

export function personalIncomeTotal(db: DB, period: string) {
  return (db.personalIncome ?? [])
    .filter((i) => !period || i.date.startsWith(period))
    .reduce((s, i) => s + toUSD(i.amount, i.currency, db.settings.khrRate), 0);
}

function personalDateMatch(
  date: string,
  range: PersonalRange,
  anchorMonth: string,
  anchorDay: string,
  weekSet: Set<string>,
  monthSet: Set<string>,
): boolean {
  if (range === "today") return date === anchorDay;
  if (range === "week") return weekSet.has(date);
  return monthSet.has(date.slice(0, 7));
}

export function personalIncomeSourceTotals(
  db: DB,
  range: PersonalRange,
  anchorMonth = today().slice(0, 7),
) {
  const anchorDay = resolveAnchorDay(db, anchorMonth);
  const weekSet = new Set(trailingDays(anchorDay, 7));
  const monthsCount =
    range === "today" || range === "week" || range === "1m"
      ? 1
      : range === "6m"
        ? 6
        : 12;
  const monthSet = new Set(trailingMonths(monthsCount, anchorMonth));
  const map = new Map<
    string,
    { source: string; totalUSD: number; count: number }
  >();
  for (const inc of db.personalIncome ?? []) {
    if (
      !personalDateMatch(
        inc.date,
        range,
        anchorMonth,
        anchorDay,
        weekSet,
        monthSet,
      )
    )
      continue;
    const key = inc.source || "Other";
    const prev = map.get(key) ?? { source: key, totalUSD: 0, count: 0 };
    prev.totalUSD += toUSD(inc.amount, inc.currency, db.settings.khrRate);
    prev.count += 1;
    map.set(key, prev);
  }
  return Array.from(map.values()).sort((a, b) => b.totalUSD - a.totalUSD);
}

export function personalSeries(
  db: DB,
  range: PersonalRange,
  anchorMonth = today().slice(0, 7),
): PersonalSeriesPoint[] {
  const idx = getLedgerIndex(db);
  const r = db.settings.khrRate;
  const ym = /^\d{4}-\d{2}$/.test(anchorMonth)
    ? anchorMonth
    : today().slice(0, 7);
  const anchorDay = resolveAnchorDay(db, ym);

  if (range === "today") {
    const dayExpenses = idx.personalExpensesByDay.get(anchorDay) ?? [];
    const dayIncomes = idx.incomeByDay.get(anchorDay) ?? [];
    const slots = [
      { key: `${anchorDay}-01`, label: "Morning", out: 0, inn: 0, c: 0, ic: 0 },
      { key: `${anchorDay}-02`, label: "Midday", out: 0, inn: 0, c: 0, ic: 0 },
      {
        key: `${anchorDay}-03`,
        label: "Afternoon",
        out: 0,
        inn: 0,
        c: 0,
        ic: 0,
      },
      { key: `${anchorDay}-04`, label: "Evening", out: 0, inn: 0, c: 0, ic: 0 },
    ];
    dayExpenses.forEach((e, i) => {
      const slot = slots[i % slots.length]!;
      slot.out += toUSD(e.amount, e.currency, r);
      slot.c += 1;
    });
    dayIncomes.forEach((inc, i) => {
      const slot = slots[i % slots.length]!;
      slot.inn += toUSD(inc.amount, inc.currency, r);
      slot.ic += 1;
    });
    const fullDay = new Date(anchorDay + "T00:00:00Z").toLocaleDateString(
      "en-US",
      {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      },
    );
    return slots.map((s) => ({
      key: s.key,
      label: s.label,
      fullDate: `${fullDay} · ${s.label}`,
      personalIn: s.inn,
      personalOut: s.out,
      studioOut: 0,
      net: s.inn - s.out,
      inCount: s.ic,
      count: s.c,
    }));
  }

  if (range === "week") {
    const days = trailingDays(anchorDay, 7);
    return days.map((iso) => {
      const dt = new Date(iso + "T00:00:00Z");
      const dayExps = idx.personalExpensesByDay.get(iso) ?? [];
      const dayIncs = idx.incomeByDay.get(iso) ?? [];
      let personalOut = 0;
      for (const e of dayExps) personalOut += toUSD(e.amount, e.currency, r);
      let personalIn = 0;
      for (const inc of dayIncs)
        personalIn += toUSD(inc.amount, inc.currency, r);
      return {
        key: iso,
        label: dt.toLocaleDateString("en-US", {
          weekday: "short",
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
        personalIn,
        personalOut,
        studioOut: 0,
        net: personalIn - personalOut,
        inCount: dayIncs.length,
        count: dayExps.length,
      };
    });
  }

  if (range === "1m") {
    const [y, m] = ym.split("-").map(Number);
    const daysInMonth = y && m ? new Date(Date.UTC(y, m, 0)).getUTCDate() : 30;
    const outByDay = new Map<string, { usd: number; count: number }>();
    const inByDay = new Map<string, { usd: number; count: number }>();

    for (const e of idx.personalExpensesByMonth.get(ym) ?? []) {
      const prev = outByDay.get(e.date) ?? { usd: 0, count: 0 };
      prev.usd += toUSD(e.amount, e.currency, r);
      prev.count += 1;
      outByDay.set(e.date, prev);
    }
    for (const inc of idx.incomeByMonth.get(ym) ?? []) {
      const prev = inByDay.get(inc.date) ?? { usd: 0, count: 0 };
      prev.usd += toUSD(inc.amount, inc.currency, r);
      prev.count += 1;
      inByDay.set(inc.date, prev);
    }

    const pts: PersonalSeriesPoint[] = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const iso = `${ym}-${String(day).padStart(2, "0")}`;
      const dt = new Date(iso + "T00:00:00Z");
      const outAgg = outByDay.get(iso);
      const inAgg = inByDay.get(iso);
      const personalOut = outAgg?.usd ?? 0;
      const personalIn = inAgg?.usd ?? 0;
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
        personalIn,
        personalOut,
        studioOut: 0,
        net: personalIn - personalOut,
        inCount: inAgg?.count ?? 0,
        count: outAgg?.count ?? 0,
      });
    }
    return pts;
  }

  const months = trailingMonths(range === "6m" ? 6 : 12, ym);
  const outByMonth = new Map<string, { usd: number; count: number }>();
  const inByMonth = new Map<string, { usd: number; count: number }>();

  for (const m of months) {
    const exps = idx.personalExpensesByMonth.get(m);
    if (exps && exps.length > 0) {
      let usd = 0;
      for (const e of exps) usd += toUSD(e.amount, e.currency, r);
      outByMonth.set(m, { usd, count: exps.length });
    }
    const incs = idx.incomeByMonth.get(m);
    if (incs && incs.length > 0) {
      let usd = 0;
      for (const inc of incs) usd += toUSD(inc.amount, inc.currency, r);
      inByMonth.set(m, { usd, count: incs.length });
    }
  }

  return months.map((m) => {
    const outAgg = outByMonth.get(m);
    const inAgg = inByMonth.get(m);
    const personalOut = outAgg?.usd ?? 0;
    const personalIn = inAgg?.usd ?? 0;
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
      personalIn,
      personalOut,
      studioOut: 0,
      net: personalIn - personalOut,
      inCount: inAgg?.count ?? 0,
      count: outAgg?.count ?? 0,
    };
  });
}

export function personalCategoryTotals(
  db: DB,
  range: PersonalRange,
  anchorMonth = today().slice(0, 7),
) {
  const idx = getLedgerIndex(db);
  const ym = /^\d{4}-\d{2}$/.test(anchorMonth)
    ? anchorMonth
    : today().slice(0, 7);
  const anchorDay = resolveAnchorDay(db, ym);
  const weekDays = trailingDays(anchorDay, 7);
  const weekSet = new Set(weekDays);
  const monthsCount =
    range === "today" || range === "week" || range === "1m"
      ? 1
      : range === "6m"
        ? 6
        : 12;
  const monthList = trailingMonths(monthsCount, ym);
  const monthSet = new Set(monthList);
  const dateSet =
    range === "today"
      ? new Set([anchorDay])
      : range === "week"
        ? weekSet
        : null;
  const map = new Map<
    string,
    { category: string; totalUSD: number; count: number }
  >();
  const r = db.settings.khrRate;
  const addExp = (e: Expense) => {
    const prev = map.get(e.category) ?? {
      category: e.category || "Other",
      totalUSD: 0,
      count: 0,
    };
    prev.totalUSD += toUSD(e.amount, e.currency, r);
    prev.count += 1;
    map.set(e.category, prev);
  };
  if (range === "today") {
    for (const e of idx.personalExpensesByDay.get(anchorDay) ?? []) addExp(e);
  } else if (range === "week") {
    for (const d of weekDays) {
      for (const e of idx.personalExpensesByDay.get(d) ?? []) addExp(e);
    }
  } else {
    for (const m of monthList) {
      for (const e of idx.personalExpensesByMonth.get(m) ?? []) addExp(e);
    }
  }
  const monthLabel = new Date(ym + "-01T00:00:00Z").toLocaleDateString(
    "en-US",
    { month: "long", year: "numeric", timeZone: "UTC" },
  );
  const dayLabel = shortDate(anchorDay);
  const scopeLabel =
    range === "today"
      ? dayLabel
      : range === "week"
        ? `7 days to ${dayLabel}`
        : range === "1m"
          ? monthLabel
          : range === "6m"
            ? "last 6 months"
            : "last 12 months";
  return {
    items: Array.from(map.values()).sort((a, b) => b.totalUSD - a.totalUSD),
    monthsCount,
    scopeLabel,
    monthSet,
    dateSet,
    anchorDay,
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
  const idx = getLedgerIndex(db);
  const r = db.settings.khrRate;
  let points: CardSpendPoint[];
  const ym = /^\d{4}-\d{2}$/.test(anchorMonth)
    ? anchorMonth
    : today().slice(0, 7);
  const anchorDay = resolveAnchorDay(db, ym);

  type Bucket = {
    debit: number;
    credit: number;
    other: number;
    debitCount: number;
    creditCount: number;
    count: number;
  };
  const emptyBucket = (): Bucket => ({
    debit: 0,
    credit: 0,
    other: 0,
    debitCount: 0,
    creditCount: 0,
    count: 0,
  });

  if (range === "today") {
    const slotDefs = [
      { key: `${anchorDay}-01`, label: "Morning", ...emptyBucket() },
      { key: `${anchorDay}-02`, label: "Midday", ...emptyBucket() },
      { key: `${anchorDay}-03`, label: "Afternoon", ...emptyBucket() },
      { key: `${anchorDay}-04`, label: "Evening", ...emptyBucket() },
    ];
    const dayExps = idx.personalExpensesByDay.get(anchorDay) ?? [];
    dayExps.forEach((e, i) => {
      const b = slotDefs[i % slotDefs.length]!;
      const usd = toUSD(e.amount, e.currency, r);
      const kind = cardKind(e.vendor);
      if (kind === "Debit") {
        b.debit += usd;
        b.debitCount += 1;
      } else if (kind === "Credit") {
        b.credit += usd;
        b.creditCount += 1;
      } else {
        b.other += usd;
      }
      b.count += 1;
    });
    const fullDay = new Date(anchorDay + "T00:00:00Z").toLocaleDateString(
      "en-US",
      {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      },
    );
    points = slotDefs.map((b) => ({
      key: b.key,
      label: b.label,
      fullDate: `${fullDay} · ${b.label}`,
      debit: b.debit,
      credit: b.credit,
      other: b.other,
      total: b.debit + b.credit + b.other,
      debitCount: b.debitCount,
      creditCount: b.creditCount,
      count: b.count,
    }));
  } else if (range === "week") {
    const days = trailingDays(anchorDay, 7);
    const byDay = new Map<string, Bucket>();
    for (const iso of days) {
      const exps = idx.personalExpensesByDay.get(iso);
      if (!exps || exps.length === 0) continue;
      const b = emptyBucket();
      for (const e of exps) {
        const usd = toUSD(e.amount, e.currency, r);
        const kind = cardKind(e.vendor);
        if (kind === "Debit") {
          b.debit += usd;
          b.debitCount += 1;
        } else if (kind === "Credit") {
          b.credit += usd;
          b.creditCount += 1;
        } else {
          b.other += usd;
        }
        b.count += 1;
      }
      byDay.set(iso, b);
    }
    points = days.map((iso) => {
      const dt = new Date(iso + "T00:00:00Z");
      const b = byDay.get(iso);
      const debit = b?.debit ?? 0;
      const credit = b?.credit ?? 0;
      const other = b?.other ?? 0;
      return {
        key: iso,
        label: dt.toLocaleDateString("en-US", {
          weekday: "short",
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
        debitCount: b?.debitCount ?? 0,
        creditCount: b?.creditCount ?? 0,
        count: b?.count ?? 0,
      };
    });
  } else if (range === "1m") {
    const [y, m] = ym.split("-").map(Number);
    const daysInMonth = y && m ? new Date(Date.UTC(y, m, 0)).getUTCDate() : 30;
    const byDay = new Map<string, Bucket>();

    for (const e of idx.personalExpensesByMonth.get(ym) ?? []) {
      const b = byDay.get(e.date) ?? emptyBucket();
      const usd = toUSD(e.amount, e.currency, r);
      const kind = cardKind(e.vendor);
      if (kind === "Debit") {
        b.debit += usd;
        b.debitCount += 1;
      } else if (kind === "Credit") {
        b.credit += usd;
        b.creditCount += 1;
      } else {
        b.other += usd;
      }
      b.count += 1;
      byDay.set(e.date, b);
    }

    points = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const iso = `${ym}-${String(day).padStart(2, "0")}`;
      const dt = new Date(iso + "T00:00:00Z");
      const b = byDay.get(iso);
      const debit = b?.debit ?? 0;
      const credit = b?.credit ?? 0;
      const other = b?.other ?? 0;
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
        debitCount: b?.debitCount ?? 0,
        creditCount: b?.creditCount ?? 0,
        count: b?.count ?? 0,
      });
    }
  } else {
    const months = trailingMonths(range === "6m" ? 6 : 12, ym);
    const byMonth = new Map<string, Bucket>();

    for (const m of months) {
      const exps = idx.personalExpensesByMonth.get(m);
      if (!exps || exps.length === 0) continue;
      const b = emptyBucket();
      for (const e of exps) {
        const usd = toUSD(e.amount, e.currency, r);
        const kind = cardKind(e.vendor);
        if (kind === "Debit") {
          b.debit += usd;
          b.debitCount += 1;
        } else if (kind === "Credit") {
          b.credit += usd;
          b.creditCount += 1;
        } else {
          b.other += usd;
        }
        b.count += 1;
      }
      byMonth.set(m, b);
    }

    points = months.map((m) => {
      const b = byMonth.get(m);
      const debit = b?.debit ?? 0;
      const credit = b?.credit ?? 0;
      const other = b?.other ?? 0;
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
        debitCount: b?.debitCount ?? 0,
        creditCount: b?.creditCount ?? 0,
        count: b?.count ?? 0,
      };
    });
  }

  const debitUSD = points.reduce((s, x) => s + x.debit, 0);
  const creditUSD = points.reduce((s, x) => s + x.credit, 0);
  const otherUSD = points.reduce((s, x) => s + x.other, 0);
  const debitCount = points.reduce((s, x) => s + x.debitCount, 0);
  const creditCount = points.reduce((s, x) => s + x.creditCount, 0);
  const monthLabel = new Date(ym + "-01T00:00:00Z").toLocaleDateString(
    "en-US",
    { month: "long", year: "numeric", timeZone: "UTC" },
  );
  const scopeLabel =
    range === "today"
      ? `Today (${shortDate(anchorDay)})`
      : range === "week"
        ? `7 days to ${shortDate(anchorDay)}`
        : range === "1m"
          ? monthLabel
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

export interface PeriodBreakdownPoint {
  label: string;
  fullDate: string;
  primary: number;
  secondary: number;
  net: number;
  count: number;
}

export function periodBreakdownBars(
  db: DB,
  scope: "Personal" | "Studio" | "Combined",
  range: PersonalRange | CashRange,
  anchorMonth = today().slice(0, 7),
  groupBy: "category" | "method" = "category",
  direction: "spending" | "income" = "spending",
): PeriodBreakdownPoint[] {
  const r = db.settings.khrRate;
  const ym = /^\d{4}-\d{2}$/.test(anchorMonth)
    ? anchorMonth
    : today().slice(0, 7);
  const anchorDay = resolveAnchorDay(db, ym);
  const weekSet = new Set(trailingDays(anchorDay, 7));
  const monthCount =
    range === "all" ? 120 : range === "12m" ? 12 : range === "6m" ? 6 : 1;
  const monthSet =
    range === "all" ? null : new Set(trailingMonths(monthCount, ym));

  const matchesDate = (date: string) => {
    if (!date) return false;
    if (range === "today") return date === anchorDay;
    if (range === "week") return weekSet.has(date);
    if (!monthSet) return true;
    return monthSet.has(date.slice(0, 7));
  };

  const buckets = new Map<
    string,
    { inUsd: number; outUsd: number; count: number }
  >();
  const add = (key: string, kind: "in" | "out", usd: number) => {
    const clean = key.trim() || "Other";
    const b = buckets.get(clean) ?? { inUsd: 0, outUsd: 0, count: 0 };
    if (kind === "in") b.inUsd += usd;
    else b.outUsd += usd;
    b.count += 1;
    buckets.set(clean, b);
  };

  if (direction === "spending") {
    for (const e of db.expenses) {
      const acc = expenseAccount(e);
      if (scope !== "Combined" && acc !== scope) continue;
      if (!matchesDate(e.date)) continue;
      const usd = toUSD(e.amount, e.currency, r);
      const key =
        groupBy === "method" ? e.vendor || "Other" : e.category || "Other";
      add(key, "out", usd);
    }
  }

  if (direction === "income" || groupBy === "method") {
    if (scope !== "Studio") {
      for (const inc of db.personalIncome ?? []) {
        if (!matchesDate(inc.date)) continue;
        const usd = toUSD(inc.amount, inc.currency, r);
        const key =
          groupBy === "method"
            ? inc.accountMethod || "Bank"
            : inc.source || "Other";
        add(key, "in", usd);
      }
    }
    if (scope !== "Personal") {
      const invIds = new Set(db.invoices.filter(isInvoice).map((i) => i.id));
      for (const p of db.payments) {
        if (!invIds.has(p.invoiceId) || !matchesDate(p.date)) continue;
        const usd = toUSD(p.amount, p.currency, r);
        const key =
          groupBy === "method" ? p.method || "Bank" : "Client invoices";
        add(key, "in", usd);
      }
    }
  }

  return Array.from(buckets.entries())
    .map(([label, b]) => {
      const primary = direction === "income" ? b.inUsd : b.outUsd;
      const secondary = direction === "income" ? b.outUsd : b.inUsd;
      return {
        label: label.length > 14 ? `${label.slice(0, 12)}…` : label,
        fullDate: label,
        primary: Math.round(primary * 100) / 100,
        secondary: Math.round(secondary * 100) / 100,
        net: Math.round((b.inUsd - b.outUsd) * 100) / 100,
        count: b.count,
      };
    })
    .sort(
      (a, b) =>
        Math.max(b.primary, b.secondary) - Math.max(a.primary, a.secondary),
    )
    .slice(0, 8);
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

export function cashFlowSeries(
  db: DB,
  range: CashRange,
  anchorMonth = today().slice(0, 7),
): CashFlowPoint[] {
  const idx = getLedgerIndex(db);
  const r = db.settings.khrRate;

  if (range === "today") {
    const anchorDay = resolveAnchorDay(db, anchorMonth);
    const pays = idx.invoicePaymentsByDay.get(anchorDay) ?? [];
    const studioExps = idx.studioExpensesByDay.get(anchorDay) ?? [];
    const personalExps = idx.personalExpensesByDay.get(anchorDay) ?? [];
    const slots = [
      {
        key: `${anchorDay}-01`,
        label: "Morning",
        inn: 0,
        out: 0,
        personalOut: 0,
        inCount: 0,
        outCount: 0,
      },
      {
        key: `${anchorDay}-02`,
        label: "Midday",
        inn: 0,
        out: 0,
        personalOut: 0,
        inCount: 0,
        outCount: 0,
      },
      {
        key: `${anchorDay}-03`,
        label: "Afternoon",
        inn: 0,
        out: 0,
        personalOut: 0,
        inCount: 0,
        outCount: 0,
      },
      {
        key: `${anchorDay}-04`,
        label: "Evening",
        inn: 0,
        out: 0,
        personalOut: 0,
        inCount: 0,
        outCount: 0,
      },
    ];
    pays.forEach((p, i) => {
      const s = slots[i % slots.length]!;
      s.inn += toUSD(p.amount, p.currency, r);
      s.inCount += 1;
    });
    studioExps.forEach((e, i) => {
      const s = slots[i % slots.length]!;
      s.out += toUSD(e.amount, e.currency, r);
      s.outCount += 1;
    });
    personalExps.forEach((e, i) => {
      const s = slots[i % slots.length]!;
      s.personalOut += toUSD(e.amount, e.currency, r);
    });
    const fullDay = new Date(anchorDay + "T00:00:00Z").toLocaleDateString(
      "en-US",
      {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      },
    );
    return slots.map((s) => ({
      m: s.key,
      label: s.label,
      fullDate: `${fullDay} · ${s.label}`,
      inn: s.inn,
      out: s.out,
      personalOut: s.personalOut,
      net: s.inn - s.out,
      combinedNet: s.inn - s.out - s.personalOut,
      inCount: s.inCount,
      outCount: s.outCount,
    }));
  }

  if (range === "week") {
    const anchorDay = resolveAnchorDay(db, anchorMonth);
    const days = trailingDays(anchorDay, 7);
    return days.map((iso) => {
      const pays = idx.invoicePaymentsByDay.get(iso) ?? [];
      const studioExps = idx.studioExpensesByDay.get(iso) ?? [];
      const personalExps = idx.personalExpensesByDay.get(iso) ?? [];
      let inn = 0;
      for (const p of pays) inn += toUSD(p.amount, p.currency, r);
      let out = 0;
      for (const e of studioExps) out += toUSD(e.amount, e.currency, r);
      let personalOut = 0;
      for (const e of personalExps)
        personalOut += toUSD(e.amount, e.currency, r);
      const dt = new Date(iso + "T00:00:00Z");
      return {
        m: iso,
        label: dt.toLocaleDateString("en-US", {
          weekday: "short",
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
        inn,
        out,
        personalOut,
        net: inn - out,
        combinedNet: inn - out - personalOut,
        inCount: pays.length,
        outCount: studioExps.length,
      };
    });
  }

  let earliest = anchorMonth || today().slice(0, 7);
  if (idx.earliestYM < earliest) earliest = idx.earliestYM;

  let months: string[];
  if (range === "all") {
    const last = today().slice(0, 7);
    const [fy, fm] = earliest.split("-").map(Number);
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
    months = trailingMonths(
      range === "1m" ? 1 : range === "6m" ? 6 : 12,
      anchorMonth,
    );
  }
  const showYear = range === "all";
  return months.map((m) => {
    const pays = idx.invoicePaymentsByMonth.get(m) ?? [];
    const studioExps = idx.studioExpensesByMonth.get(m) ?? [];
    const personalExps = idx.personalExpensesByMonth.get(m) ?? [];
    let inn = 0;
    for (const p of pays) inn += toUSD(p.amount, p.currency, r);
    let out = 0;
    for (const e of studioExps) out += toUSD(e.amount, e.currency, r);
    let personalOut = 0;
    for (const e of personalExps) personalOut += toUSD(e.amount, e.currency, r);
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
      inCount: pays.length,
      outCount: studioExps.length,
    };
  });
}

export interface CombinedCashPoint {
  m: string;
  label: string;
  fullDate: string;
  studioIn: number;
  personalIn: number;
  totalIn: number;
  studioOut: number;
  personalOut: number;
  totalOut: number;
  studioNet: number;
  personalNet: number;
  combinedNet: number;
  count: number;
}

export function combinedCashFlowSeries(
  db: DB,
  range: CashRange,
  anchorMonth = today().slice(0, 7),
): CombinedCashPoint[] {
  const idx = getLedgerIndex(db);
  const r = db.settings.khrRate;

  if (range === "today") {
    const anchorDay = resolveAnchorDay(db, anchorMonth);
    const sPays = idx.invoicePaymentsByDay.get(anchorDay) ?? [];
    const pIncs = idx.incomeByDay.get(anchorDay) ?? [];
    const sExps = idx.studioExpensesByDay.get(anchorDay) ?? [];
    const pExps = idx.personalExpensesByDay.get(anchorDay) ?? [];
    const slots = [
      {
        key: `${anchorDay}-01`,
        label: "Morning",
        studioIn: 0,
        personalIn: 0,
        studioOut: 0,
        personalOut: 0,
        count: 0,
      },
      {
        key: `${anchorDay}-02`,
        label: "Midday",
        studioIn: 0,
        personalIn: 0,
        studioOut: 0,
        personalOut: 0,
        count: 0,
      },
      {
        key: `${anchorDay}-03`,
        label: "Afternoon",
        studioIn: 0,
        personalIn: 0,
        studioOut: 0,
        personalOut: 0,
        count: 0,
      },
      {
        key: `${anchorDay}-04`,
        label: "Evening",
        studioIn: 0,
        personalIn: 0,
        studioOut: 0,
        personalOut: 0,
        count: 0,
      },
    ];
    sPays.forEach((p, i) => {
      const s = slots[i % slots.length]!;
      s.studioIn += toUSD(p.amount, p.currency, r);
      s.count += 1;
    });
    pIncs.forEach((inc, i) => {
      const s = slots[i % slots.length]!;
      s.personalIn += toUSD(inc.amount, inc.currency, r);
      s.count += 1;
    });
    sExps.forEach((e, i) => {
      const s = slots[i % slots.length]!;
      s.studioOut += toUSD(e.amount, e.currency, r);
      s.count += 1;
    });
    pExps.forEach((e, i) => {
      const s = slots[i % slots.length]!;
      s.personalOut += toUSD(e.amount, e.currency, r);
      s.count += 1;
    });
    const fullDay = new Date(anchorDay + "T00:00:00Z").toLocaleDateString(
      "en-US",
      {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      },
    );
    return slots.map((s) => {
      const totalIn = s.studioIn + s.personalIn;
      const totalOut = s.studioOut + s.personalOut;
      return {
        m: s.key,
        label: s.label,
        fullDate: `${fullDay} · ${s.label}`,
        studioIn: s.studioIn,
        personalIn: s.personalIn,
        totalIn,
        studioOut: s.studioOut,
        personalOut: s.personalOut,
        totalOut,
        studioNet: s.studioIn - s.studioOut,
        personalNet: s.personalIn - s.personalOut,
        combinedNet: totalIn - totalOut,
        count: s.count,
      };
    });
  }

  if (range === "week") {
    const anchorDay = resolveAnchorDay(db, anchorMonth);
    const days = trailingDays(anchorDay, 7);
    return days.map((iso) => {
      const sPays = idx.invoicePaymentsByDay.get(iso) ?? [];
      const pIncs = idx.incomeByDay.get(iso) ?? [];
      const sExps = idx.studioExpensesByDay.get(iso) ?? [];
      const pExps = idx.personalExpensesByDay.get(iso) ?? [];
      let studioIn = 0;
      for (const p of sPays) studioIn += toUSD(p.amount, p.currency, r);
      let personalIn = 0;
      for (const inc of pIncs) personalIn += toUSD(inc.amount, inc.currency, r);
      let studioOut = 0;
      for (const e of sExps) studioOut += toUSD(e.amount, e.currency, r);
      let personalOut = 0;
      for (const e of pExps) personalOut += toUSD(e.amount, e.currency, r);
      const totalIn = studioIn + personalIn;
      const totalOut = studioOut + personalOut;
      const dt = new Date(iso + "T00:00:00Z");
      return {
        m: iso,
        label: dt.toLocaleDateString("en-US", {
          weekday: "short",
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
        studioIn,
        personalIn,
        totalIn,
        studioOut,
        personalOut,
        totalOut,
        studioNet: studioIn - studioOut,
        personalNet: personalIn - personalOut,
        combinedNet: totalIn - totalOut,
        count: sPays.length + pIncs.length + sExps.length + pExps.length,
      };
    });
  }

  let earliest = anchorMonth || today().slice(0, 7);
  if (idx.earliestYM < earliest) earliest = idx.earliestYM;

  let months: string[];
  if (range === "all") {
    const last = today().slice(0, 7);
    const [fy, fm] = earliest.split("-").map(Number);
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
    months = trailingMonths(
      range === "1m" ? 1 : range === "6m" ? 6 : 12,
      anchorMonth,
    );
  }

  const showYear = range === "all";
  return months.map((m) => {
    const sPays = idx.invoicePaymentsByMonth.get(m) ?? [];
    const pIncs = idx.incomeByMonth.get(m) ?? [];
    const sExps = idx.studioExpensesByMonth.get(m) ?? [];
    const pExps = idx.personalExpensesByMonth.get(m) ?? [];
    let studioIn = 0;
    for (const p of sPays) studioIn += toUSD(p.amount, p.currency, r);
    let personalIn = 0;
    for (const inc of pIncs) personalIn += toUSD(inc.amount, inc.currency, r);
    let studioOut = 0;
    for (const e of sExps) studioOut += toUSD(e.amount, e.currency, r);
    let personalOut = 0;
    for (const e of pExps) personalOut += toUSD(e.amount, e.currency, r);
    const totalIn = studioIn + personalIn;
    const totalOut = studioOut + personalOut;
    const dt = new Date(m + "-01T00:00:00Z");
    return {
      m,
      label: dt.toLocaleDateString("en-US", {
        month: "short",
        ...(showYear ? { year: "2-digit" } : {}),
        timeZone: "UTC",
      }),
      fullDate: dt.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }),
      studioIn,
      personalIn,
      totalIn,
      studioOut,
      personalOut,
      totalOut,
      studioNet: studioIn - studioOut,
      personalNet: personalIn - personalOut,
      combinedNet: totalIn - totalOut,
      count: sPays.length + pIncs.length + sExps.length + pExps.length,
    };
  });
}

export function workspaceBalances(db: DB, period = today().slice(0, 7)) {
  const idx = getLedgerIndex(db);
  const r = db.settings.khrRate;
  let studioInAll = 0;
  let studioInMonth = 0;
  for (const p of idx.invoicePaymentsAll) {
    const usd = toUSD(p.amount, p.currency, r);
    studioInAll += usd;
    if (period && p.date.startsWith(period)) studioInMonth += usd;
  }

  let personalInAll = 0;
  let personalInMonth = 0;
  for (const inc of db.personalIncome ?? []) {
    const usd = toUSD(inc.amount, inc.currency, r);
    personalInAll += usd;
    if (period && inc.date.startsWith(period)) personalInMonth += usd;
  }

  let studioOutAll = 0;
  let studioOutMonth = 0;
  for (const e of idx.studioExpensesAll) {
    const usd = toUSD(e.amount, e.currency, r);
    studioOutAll += usd;
    if (period && e.date.startsWith(period)) studioOutMonth += usd;
  }

  let personalOutAll = 0;
  let personalOutMonth = 0;
  for (const e of idx.personalExpensesAll) {
    const usd = toUSD(e.amount, e.currency, r);
    personalOutAll += usd;
    if (period && e.date.startsWith(period)) personalOutMonth += usd;
  }

  let openAR = 0;
  for (const inv of db.invoices) {
    if (!isInvoice(inv)) continue;
    const v = invoiceView(inv, db);
    if (v.status !== "Draft") openAR += v.balanceUSD;
  }

  let personalGoalsSaved = 0;
  for (const g of db.goals) {
    if (goalAccount(g) === "Personal") personalGoalsSaved += g.current;
  }

  const studioBalance = studioInAll - studioOutAll;
  const personalBalance = personalInAll - personalOutAll;

  return {
    studioBalance,
    studioInAll,
    studioOutAll,
    studioInMonth,
    studioOutMonth,
    studioMonthNet: studioInMonth - studioOutMonth,
    openAR,
    personalBalance,
    personalInAll,
    personalOutAll,
    personalInMonth,
    personalOutMonth,
    personalMonthNet: personalInMonth - personalOutMonth,
    personalGoalsSaved,
    combinedInAll: studioInAll + personalInAll,
    combinedOutAll: studioOutAll + personalOutAll,
    combinedBalance: studioBalance + personalBalance,
    combinedMonthNet:
      studioInMonth + personalInMonth - (studioOutMonth + personalOutMonth),
  };
}

export function inferStudioDesignType(
  project: Project,
  service?: Service,
): string {
  const txt =
    `${project.name} ${service?.name ?? ""} ${(service?.tags ?? []).join(" ")}`.toLowerCase();
  const pillar = normalizeServicePillar(service?.pillar ?? "");
  if (/\bui\b|ux|web|landing|homepage|app|figma/.test(txt)) {
    return "UI & Web";
  }
  if (/deck|presentation|pitch|slide|profile/.test(txt)) {
    return "Presentation & Deck";
  }
  if (/social|campaign|post|poster|banner|promo|ad\b/.test(txt)) {
    return "Social & Campaign";
  }
  if (
    /print|brochure|flyer|folder|letterhead|card|catalog|leaflet|menu/.test(txt)
  ) {
    return "Print & Collateral";
  }
  if (/pack|box|label|bottle|pouch|dieline|bag/.test(txt)) {
    return "Marketing & Packaging";
  }
  if (pillar === "Branding Design") return "Branding & Identity";
  if (pillar === "Spatial Design") return "Spatial & Signage";
  if (pillar === "Marketing & Packaging") return "Marketing & Packaging";
  if (pillar === "Creative & Digital") return "Creative & Digital";
  return "Other";
}

export interface ShowcaseWorkItem {
  id: string;
  source: "work" | "studio";
  code: string;
  title: string;
  subtitle: string;
  projectGroup: string;
  designType: string;
  status: string;
  completed: boolean;
  date: string;
  artworkCount: number;
  media: DesignMedia[];
  notes: string;
  featured: boolean;
}

export function designOutputSummary(db: DB) {
  const svcMap = new Map(db.services.map((s) => [s.id, s]));
  const clientMap = new Map(db.clients.map((c) => [c.id, c]));
  const items: ShowcaseWorkItem[] = [];

  for (const t of db.workTasks ?? []) {
    const projectGroup = (t.projectName || t.company || "General").trim();
    items.push({
      id: t.id,
      source: "work",
      code: t.code,
      title: t.title || "Untitled task",
      subtitle:
        t.projectName && t.company && t.projectName !== t.company
          ? `${t.projectName} · ${t.company}`
          : projectGroup,
      projectGroup,
      designType: t.designType || "Other",
      status: t.status,
      completed: t.status === "Completed",
      date: t.completedDate || t.dueDate || t.startDate || "",
      artworkCount: Math.max(1, Number(t.artworkCount) || 1),
      media: Array.isArray(t.media) ? t.media : [],
      notes: t.notes || "",
      featured: Boolean(t.featured),
    });
  }

  for (const p of db.projects) {
    if (p.status === "Lost") continue;
    const svc = p.serviceId ? svcMap.get(p.serviceId) : undefined;
    const client = p.clientId ? clientMap.get(p.clientId) : undefined;
    const completed = p.status === "Delivered" || p.status === "Closed";
    const clientLabel = client?.name || "Freelance Studio";
    items.push({
      id: p.id,
      source: "studio",
      code: p.code,
      title: p.name || p.code,
      subtitle: clientLabel,
      projectGroup: clientLabel,
      designType: inferStudioDesignType(p, svc),
      status: p.status,
      completed,
      date: p.delivered || p.due || p.start || "",
      artworkCount: Math.max(1, Number(p.artworkCount) || 1),
      media: Array.isArray(p.media) ? p.media : [],
      notes: svc?.name ?? "",
      featured: Boolean(p.featured),
    });
  }

  const byTypeMap = new Map<
    string,
    {
      designType: string;
      workProjects: number;
      studioProjects: number;
      totalProjects: number;
      completedProjects: number;
      artworkCount: number;
    }
  >();

  const byProjectMap = new Map<
    string,
    {
      projectGroup: string;
      workProjects: number;
      studioProjects: number;
      totalProjects: number;
      completedProjects: number;
      artworkCount: number;
      mediaCount: number;
      latestDate: string;
    }
  >();

  let completedTotal = 0;
  let activeTotal = 0;
  let totalArtworks = 0;
  let mediaCount = 0;
  let workCompleted = 0;
  let workActive = 0;
  let studioCompleted = 0;
  let studioActive = 0;
  let featuredCount = 0;

  for (const it of items) {
    totalArtworks += it.artworkCount;
    mediaCount += it.media.length;
    if (it.featured) featuredCount += 1;
    if (it.completed) {
      completedTotal += 1;
      if (it.source === "work") workCompleted += 1;
      else studioCompleted += 1;
    } else if (it.status !== "Backlog" && it.status !== "On hold") {
      activeTotal += 1;
      if (it.source === "work") workActive += 1;
      else studioActive += 1;
    }

    const row = byTypeMap.get(it.designType) ?? {
      designType: it.designType,
      workProjects: 0,
      studioProjects: 0,
      totalProjects: 0,
      completedProjects: 0,
      artworkCount: 0,
    };
    if (it.source === "work") row.workProjects += 1;
    else row.studioProjects += 1;
    row.totalProjects += 1;
    if (it.completed) row.completedProjects += 1;
    row.artworkCount += it.artworkCount;
    byTypeMap.set(it.designType, row);

    const groupRow = byProjectMap.get(it.projectGroup) ?? {
      projectGroup: it.projectGroup,
      workProjects: 0,
      studioProjects: 0,
      totalProjects: 0,
      completedProjects: 0,
      artworkCount: 0,
      mediaCount: 0,
      latestDate: "",
    };
    if (it.source === "work") groupRow.workProjects += 1;
    else groupRow.studioProjects += 1;
    groupRow.totalProjects += 1;
    if (it.completed) groupRow.completedProjects += 1;
    groupRow.artworkCount += it.artworkCount;
    groupRow.mediaCount += it.media.length;
    if (it.date && it.date > groupRow.latestDate) {
      groupRow.latestDate = it.date;
    }
    byProjectMap.set(it.projectGroup, groupRow);
  }

  const months = trailingMonths(12);
  const monthMap = new Map<
    string,
    { work: number; studio: number; artworks: number }
  >();
  for (const m of months) {
    monthMap.set(m, { work: 0, studio: 0, artworks: 0 });
  }
  for (const it of items) {
    if (!it.completed || !it.date) continue;
    const ym = it.date.slice(0, 7);
    const bucket = monthMap.get(ym);
    if (!bucket) continue;
    if (it.source === "work") bucket.work += 1;
    else bucket.studio += 1;
    bucket.artworks += it.artworkCount;
  }

  const monthlyTrend = months.map((m) => {
    const b = monthMap.get(m)!;
    const dt = new Date(m + "-01T00:00:00Z");
    return {
      m,
      label: dt.toLocaleDateString("en-US", {
        month: "short",
        timeZone: "UTC",
      }),
      fullDate: dt.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }),
      work: b.work,
      studio: b.studio,
      total: b.work + b.studio,
      artworks: b.artworks,
    };
  });

  const byType = Array.from(byTypeMap.values()).sort(
    (a, b) =>
      b.totalProjects - a.totalProjects || b.artworkCount - a.artworkCount,
  );

  const byProjectGroup = Array.from(byProjectMap.values()).sort(
    (a, b) =>
      b.artworkCount - a.artworkCount || b.totalProjects - a.totalProjects,
  );

  const sortedItems = [...items].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    const hasMediaA = a.media.length > 0 ? 1 : 0;
    const hasMediaB = b.media.length > 0 ? 1 : 0;
    if (hasMediaA !== hasMediaB) return hasMediaB - hasMediaA;
    return (b.date || "").localeCompare(a.date || "");
  });

  return {
    items: sortedItems,
    completedTotal,
    activeTotal,
    totalProjects: items.length,
    totalArtworks,
    mediaCount,
    featuredCount,
    workCompleted,
    workActive,
    studioCompleted,
    studioActive,
    byType,
    byProjectGroup,
    monthlyTrend,
  };
}

export function caseStudyKey(source: "work" | "studio", itemId: string) {
  return `${source}:${itemId}`;
}

export function autoBuildCaseStudy(
  item: ShowcaseWorkItem,
  existing?: CaseStudyDoc,
): CaseStudyDoc {
  const id = caseStudyKey(item.source, item.id);
  const imgs = item.media.filter((m) => m.kind === "image");
  const pdfs = item.media.filter((m) => m.kind === "pdf");
  const blocks: CaseStudyBlock[] = [
    {
      id: uid(),
      type: "header",
      title: item.title || "Design Case Study",
      text: `${item.projectGroup} · ${item.designType}`,
      align: "left",
    },
    {
      id: uid(),
      type: "metrics",
      stats: [
        { label: "Client / Brand", value: item.projectGroup || "RothVan" },
        { label: "Discipline", value: item.designType },
        {
          label: "Deliverables",
          value: `${item.artworkCount} ${item.artworkCount === 1 ? "piece" : "pieces"}`,
        },
        {
          label: "Status",
          value: item.date ? shortDate(item.date) : item.status,
        },
      ],
    },
    {
      id: uid(),
      type: "subheader",
      title: "Project Brief & Creative Direction",
      text: "Overview & Visual Execution",
    },
    {
      id: uid(),
      type: "paragraph",
      text:
        item.notes.trim() ||
        `Crafted for ${item.projectGroup} under ${item.designType}, delivering ${item.artworkCount} production-ready ${item.artworkCount === 1 ? "asset" : "assets"} aligned with brand consistency and campaign impact.`,
    },
    { id: uid(), type: "divider" },
  ];

  if (imgs.length === 1) {
    blocks.push({
      id: uid(),
      type: "image",
      mediaIds: [imgs[0]!.id],
      caption: imgs[0]!.name.replace(/\.[^.]+$/, ""),
    });
  } else if (imgs.length === 2) {
    blocks.push({
      id: uid(),
      type: "gallery",
      mediaIds: imgs.map((m) => m.id),
      caption: "Visual Showcase",
    });
  } else if (imgs.length > 2) {
    blocks.push({
      id: uid(),
      type: "image",
      mediaIds: [imgs[0]!.id],
      caption: `Hero Visual — ${imgs[0]!.name.replace(/\.[^.]+$/, "")}`,
    });
    for (let i = 1; i < imgs.length; i += 2) {
      const pair = imgs.slice(i, i + 2);
      blocks.push({
        id: uid(),
        type: pair.length > 1 ? "gallery" : "image",
        mediaIds: pair.map((m) => m.id),
        caption: pair.map((m) => m.name.replace(/\.[^.]+$/, "")).join(" · "),
      });
    }
  }

  if (pdfs.length > 0) {
    blocks.push({
      id: uid(),
      type: "quote",
      title: "Attached Documentation",
      text: `${pdfs.length} print/presentation PDF ${pdfs.length === 1 ? "document" : "documents"} included: ${pdfs.map((p) => p.name).join(", ")}`,
    });
  }

  return {
    id,
    itemId: item.id,
    source: item.source,
    title: existing?.title || item.title || "Design Case Study",
    subtitle: existing?.subtitle || `${item.projectGroup} · ${item.designType}`,
    projectGroup: item.projectGroup,
    designType: item.designType,
    theme: existing?.theme ?? "obsidian",
    aspect: existing?.aspect ?? "sheet",
    blocks,
    updatedAt: new Date().toISOString(),
  };
}

export function saveCaseStudy(db: DB, doc: CaseStudyDoc): DB {
  return {
    ...db,
    caseStudies: {
      ...(db.caseStudies ?? {}),
      [doc.id]: { ...doc, updatedAt: new Date().toISOString() },
    },
  };
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
  return `${sign}$${Number.isInteger(small) ? String(small) : small.toFixed(2)}`;
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
