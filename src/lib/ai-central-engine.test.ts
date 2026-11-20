import { describe, expect, it } from "vitest";
import {
  askCentralDB,
  computeCentralIntelligence,
  simulateCashScenario,
} from "./ai-central-engine";
import { getDB, type DB } from "./store";

function makeTestDb(): DB {
  const base = getDB();
  return {
    ...base,
    clients: [
      {
        id: "c1",
        code: "CLI-01",
        name: "Acme Khmer",
        type: "Company",
        industry: "Retail",
        contact: "Sokha",
        email: "acme@example.com",
        telegram: "@acme",
        phone: "012000111",
        source: "Referral",
        status: "Active",
        notes: "",
      },
    ],
    invoices: [
      {
        id: "inv1",
        no: "INV-001",
        kind: "Invoice",
        sent: true,
        showSchedule: false,
        includeTerms: false,
        includeRates: false,
        clientId: "c1",
        projectId: "",
        issue: "2026-10-01",
        due: "2026-10-20",
        currency: "USD",
        discount: 0,
        notes: "",
        items: [{ id: "it1", desc: "Brand system", qty: 1, price: 1000 }],
        images: [],
      },
    ],
    payments: [
      {
        id: "p1",
        invoiceId: "inv1",
        date: "2026-10-15",
        amount: 400,
        currency: "USD",
        method: "Bank transfer",
        reference: "Deposit",
      },
    ],
    personalIncome: [
      {
        id: "inc1",
        date: "2026-10-05",
        source: "Salary",
        accountMethod: "Debit",
        description: "Monthly salary",
        amount: 2400,
        currency: "USD",
      },
    ],
    expenses: [
      {
        id: "e1",
        date: "2026-11-10",
        projectId: "",
        category: "Food",
        vendor: "Debit",
        description: "Groceries",
        amount: 320,
        currency: "USD",
        receipt: "",
        account: "Personal",
      },
      {
        id: "e2",
        date: "2026-11-12",
        projectId: "",
        category: "Prius 2012",
        vendor: "Credit",
        description: "PTT fuel",
        amount: 80,
        currency: "USD",
        receipt: "",
        account: "Personal",
      },
    ],
    categoryLimits: {
      "Personal:Food": 300,
    },
    goals: [
      {
        id: "g1",
        name: "Emergency Cushion",
        kind: "cash",
        account: "Personal",
        target: 2000,
        current: 1000,
        cadence: "monthly",
        contributionAmount: 250,
      },
    ],
    reminders: [
      {
        id: "r1",
        title: "Prius 2012 Oil Change",
        category: "car-odo",
        date: "2026-11-22",
        odoKm: 148500,
        notifyDaysBefore: 5,
        repeat: "none",
        notes: "5W-30 synthetic",
      },
    ],
    learnedReceiptRules: [
      {
        id: "lr1",
        pattern: "brown coffee",
        displayPattern: "Brown Coffee",
        txType: "expense",
        category: "Food",
        method: "Debit",
        hits: 3,
        updatedAt: "2026-11-18",
      },
    ],
  };
}

describe("ai-central-engine", () => {
  it("computes cross-DB liquidity, overdue A/R, category pace, and alerts", () => {
    const db = makeTestDb();
    const snap = computeCentralIntelligence(db, "2026-11-19");

    expect(snap.overdueInvoiceCount).toBe(1);
    expect(snap.overdueARUSD).toBe(600);
    expect(snap.overdueClientNames).toContain("Acme Khmer");
    expect(snap.latestCarOdoKm).toBe(148500);
    expect(snap.dueReminderCount).toBe(1);
    expect(snap.learnedRuleCount).toBe(1);

    const food = snap.categoryPace.find((c) => c.category === "Food");
    expect(food?.status).toBe("over");
    expect(food?.pct).toBe(107);

    expect(snap.goalEtas[0]?.etaMonths).toBe(4);
    expect(snap.insights.some((i) => i.id === "overdue-ar")).toBe(true);
    expect(snap.insights.some((i) => i.id === "over-Food")).toBe(true);
  });

  it("simulates 60-day cash uplift and accelerates goal ETAs", () => {
    const db = makeTestDb();
    const snap = computeCentralIntelligence(db, "2026-11-19");
    const sim = simulateCashScenario(
      snap,
      { horizonDays: 60, monthlySaveBoostUSD: 250, collectOverduePct: 100 },
      "2026-11-19",
    );

    expect(sim.points.length).toBeGreaterThan(2);
    expect(sim.deltaUSD).toBeGreaterThan(1000);
    expect(sim.goalEtas[0]?.etaMonths).toBe(2);
  });

  it("answers natural language queries across A/R, cards, and Prius ODO", () => {
    const db = makeTestDb();
    const snap = computeCentralIntelligence(db, "2026-11-19");

    const ar = askCentralDB(db, snap, "Who has overdue invoices?");
    expect(ar.answer).toContain("$600.00");
    expect(ar.answer).toContain("Acme Khmer");

    const odo = askCentralDB(db, snap, "What is my Prius ODO mileage?");
    expect(odo.answer).toContain("148,500 km");

    const cards = askCentralDB(db, snap, "Debit vs Credit card split");
    expect(cards.answer).toContain("$320.00 on Debit");
    expect(cards.answer).toContain("$80.00 on Credit");
  });
});
