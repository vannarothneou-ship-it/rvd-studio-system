import { describe, expect, it } from "vitest";
import {
  askCentralDB,
  computeCentralIntelligence,
  parseQuickCommand,
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
        items: [
          {
            id: "it1",
            description: "Brand system",
            scope: "",
            timeline: "",
            qty: 1,
            price: 1000,
          },
        ],
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
      {
        id: "e3",
        date: "2026-11-14",
        projectId: "",
        category: "Software and subscriptions",
        vendor: "Debit",
        description: "Adobe CC",
        amount: 35,
        currency: "USD",
        receipt: "",
        account: "Studio",
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
        repeatYearly: false,
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

    expect(snap.studioMonthTotalUSD).toBe(35);
    expect(snap.studioTopCategories[0]?.category).toBe(
      "Software and subscriptions",
    );

    const studioSpend = askCentralDB(db, snap, "What is my studio spending?");
    expect(studioSpend.answer).toContain("$35.00");
    expect(studioSpend.answer).toContain("Software and subscriptions");

    const schedule = askCentralDB(db, snap, "What is upcoming this week?");
    expect(schedule.answer).toContain("1 unpaid invoice");
  });

  it("parses quick commands for Studio expenses, KHR expenses, income, and work tasks", () => {
    const db = makeTestDb();

    const studioCmd = parseQuickCommand(
      "spent $29 studio figma",
      db,
      "2026-11-19",
    );
    expect(studioCmd?.kind).toBe("expense");
    if (studioCmd?.kind === "expense") {
      expect(studioCmd.data.account).toBe("Studio");
      expect(studioCmd.data.amount).toBe(29);
      expect(studioCmd.data.category).toBe("Software and subscriptions");
    }

    const khrCmd = parseQuickCommand("20000r ptt fuel", db, "2026-11-19");
    expect(khrCmd?.kind).toBe("expense");
    if (khrCmd?.kind === "expense") {
      expect(khrCmd.data.currency).toBe("KHR");
      expect(khrCmd.data.amount).toBe(20000);
      expect(khrCmd.data.category).toBe("Prius 2012");
    }

    const incCmd = parseQuickCommand("+$500 freelance", db, "2026-11-19");
    expect(incCmd?.kind).toBe("income");
    if (incCmd?.kind === "income") {
      expect(incCmd.data.amount).toBe(500);
      expect(incCmd.data.source).toBe("Freelance");
    }

    const taskCmd = parseQuickCommand(
      "task DBG banner tomorrow 3 pcs",
      db,
      "2026-11-19",
    );
    expect(taskCmd?.kind).toBe("work-task");
    if (taskCmd?.kind === "work-task") {
      expect(taskCmd.data.projectName).toBe("DBG");
      expect(taskCmd.data.artworkCount).toBe(3);
      expect(taskCmd.data.dueDate).toBe("2026-11-20");
    }
  });
});
