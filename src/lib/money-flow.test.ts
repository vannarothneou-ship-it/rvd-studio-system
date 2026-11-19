import { describe, expect, it } from "vitest";
import { buildCategoryTimeline, buildMoneyFlowData } from "./money-flow";
import { getDB, type DB } from "./store";

function makeTestDB(): DB {
  const base = getDB();
  return {
    ...base,
    invoices: [
      {
        id: "inv-1",
        no: "RVIN-26110101",
        clientId: "cl-1",
        projectId: "pr-1",
        issue: "2026-11-01",
        due: "2026-11-15",
        currency: "USD",
        discount: 0,
        sent: true,
        showSchedule: true,
        includeTerms: true,
        includeRates: true,
        notes: "",
        items: [
          {
            id: "it-1",
            description: "Brand Identity",
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
        id: "pay-1",
        invoiceId: "inv-1",
        date: "2026-11-05",
        amount: 1000,
        currency: "USD",
        method: "Bank transfer",
        reference: "ABA-1",
      },
    ],
    personalIncome: [
      {
        id: "inc-1",
        date: "2026-11-03",
        source: "Salary",
        accountMethod: "Debit",
        description: "Monthly pay",
        amount: 500,
        currency: "USD",
      },
    ],
    expenses: [
      {
        id: "e-1",
        date: "2026-11-10",
        projectId: "",
        category: "Food",
        vendor: "Debit",
        description: "Groceries",
        amount: 200,
        currency: "USD",
        receipt: "",
        account: "Personal",
      },
      {
        id: "e-2",
        date: "2026-11-08",
        projectId: "",
        category: "Personal Spending",
        vendor: "Credit",
        description: "Shoes",
        amount: 100,
        currency: "USD",
        receipt: "",
        account: "Personal",
      },
      {
        id: "e-3",
        date: "2026-11-06",
        projectId: "",
        category: "Software and subscriptions",
        vendor: "Credit",
        description: "Adobe CC",
        amount: 150,
        currency: "USD",
        receipt: "",
        account: "Studio",
      },
      {
        id: "e-4",
        date: "2026-10-14",
        projectId: "",
        category: "Food",
        vendor: "Debit",
        description: "Last month market",
        amount: 100,
        currency: "USD",
        receipt: "",
        account: "Personal",
      },
      {
        id: "e-5",
        date: "2026-09-12",
        projectId: "",
        category: "Food",
        vendor: "Debit",
        description: "September dinner",
        amount: 50,
        currency: "USD",
        receipt: "",
        account: "Personal",
      },
    ],
  };
}

describe("buildMoneyFlowData", () => {
  it("combines Client work + Personal income into Needs, Wants, Studio, and Future buckets", () => {
    const db = makeTestDB();
    const flow = buildMoneyFlowData(db, "1m", "all", "2026-11");

    expect(flow.hasIncome).toBe(true);
    expect(flow.totalIncome).toBe(1500);
    expect(flow.totalSpend).toBe(450);
    expect(flow.totalKept).toBe(1050);
    expect(flow.keptPct).toBe(70);

    expect(flow.sources.map((s) => s.label)).toEqual(["Client work", "Salary"]);

    const bucketById = Object.fromEntries(
      flow.buckets.map((b) => [b.id, b.amount]),
    );
    expect(bucketById["needs"]).toBe(200);
    expect(bucketById["wants"]).toBe(100);
    expect(bucketById["studio"]).toBe(150);
    expect(bucketById["future"]).toBe(1050);

    const foodTarget = flow.targets.find((t) => t.category === "Food");
    expect(foodTarget?.amount).toBe(200);
    expect(foodTarget?.prevAmount).toBe(100);
    expect(foodTarget?.deltaPct).toBe(100);
  });

  it("handles Personal scope cleanly even when personal income is zero", () => {
    const base = makeTestDB();
    const db: DB = { ...base, personalIncome: [] };
    const flow = buildMoneyFlowData(db, "1m", "Personal", "2026-11");

    expect(flow.hasIncome).toBe(false);
    expect(flow.totalIncome).toBe(0);
    expect(flow.totalSpend).toBe(300);
    expect(flow.buckets.map((b) => b.id)).toEqual(["needs", "wants"]);
    expect(flow.sourceToBucketLinks).toHaveLength(0);
    expect(flow.bucketToTargetLinks.length).toBeGreaterThanOrEqual(2);
  });
});

describe("buildCategoryTimeline", () => {
  it("tracks category spending across 1m, 3m, and all timelines with real deltas", () => {
    const db = makeTestDB();

    const m1 = buildCategoryTimeline(db, "Personal", "Food", "1m", "2026-11");
    expect(m1.totalUSD).toBe(200);
    expect(m1.prevTotalUSD).toBe(100);
    expect(m1.deltaPct).toBe(100);
    expect(m1.txCount).toBe(1);
    expect(m1.points).toHaveLength(30);

    const m3 = buildCategoryTimeline(db, "Personal", "Food", "3m", "2026-11");
    expect(m3.totalUSD).toBe(350);
    expect(m3.txCount).toBe(3);
    expect(m3.points.map((p) => p.amount)).toEqual([50, 100, 200]);

    const all = buildCategoryTimeline(db, "Personal", "Food", "all", "2026-11");
    expect(all.totalUSD).toBe(350);
    expect(all.prevTotalUSD).toBeNull();
    expect(all.items).toHaveLength(3);
  });
});
