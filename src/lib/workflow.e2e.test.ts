import { describe, expect, it } from "vitest";
import {
  askCentralDB,
  buildQuickWorkTask,
  computeCentralIntelligence,
  getTodayActionQueue,
  parseQuickCommand,
} from "./ai-central-engine";
import {
  convertDocument,
  designOutputSummary,
  getDB,
  nextWorkStage,
  recordPayment,
  saveDocument,
  uid,
  workspaceBalances,
  type Client,
  type DB,
  type Invoice,
} from "./store";

function makeCleanDb(): DB {
  const base = getDB();
  return {
    ...base,
    clients: [],
    projects: [],
    invoices: [],
    payments: [],
    expenses: [],
    personalIncome: [],
    workTasks: [],
    reminders: [],
    goals: [],
    learnedReceiptRules: [
      {
        id: "rule-onnik",
        pattern: "onnik",
        displayPattern: "ONNIK COFFEE",
        txType: "expense",
        category: "Food",
        method: "Debit",
        hits: 4,
        updatedAt: "2026-11-18",
      },
    ],
    categoryLimits: {
      "Personal:Food": 250,
    },
  };
}

describe("natural language quick command & workflow e2e", () => {
  it("parses USD/KHR expenses, income, learned rules, and work tasks", () => {
    const db = makeCleanDb();

    const expUsd = parseQuickCommand(
      "spent $6.50 Onnik coffee",
      db,
      "2026-11-20",
    );
    expect(expUsd?.kind).toBe("expense");
    if (expUsd?.kind === "expense") {
      expect(expUsd.data.account).toBe("Personal");
      expect(expUsd.data.amount).toBe(6.5);
      expect(expUsd.data.currency).toBe("USD");
      expect(expUsd.data.category).toBe("Food");
      expect(expUsd.data.vendor).toBe("Debit");
      expect(expUsd.matchedRule).toBe("ONNIK COFFEE");
    }

    const expKhr = parseQuickCommand(
      "20000r ptt fuel credit",
      db,
      "2026-11-20",
    );
    expect(expKhr?.kind).toBe("expense");
    if (expKhr?.kind === "expense") {
      expect(expKhr.data.amount).toBe(20000);
      expect(expKhr.data.currency).toBe("KHR");
      expect(expKhr.data.category).toBe("Prius 2012");
      expect(expKhr.data.vendor).toBe("Credit");
    }

    const expStudio = parseQuickCommand(
      "studio 45.00 adobe software",
      db,
      "2026-11-20",
    );
    expect(expStudio?.kind).toBe("expense");
    if (expStudio?.kind === "expense") {
      expect(expStudio.data.account).toBe("Studio");
      expect(expStudio.data.category).toBe("Software and subscriptions");
      expect(expStudio.data.amount).toBe(45);
    }

    const inc = parseQuickCommand("+$500 freelance", db, "2026-11-20");
    expect(inc?.kind).toBe("income");
    if (inc?.kind === "income") {
      expect(inc.data.amount).toBe(500);
      expect(inc.data.source).toBe("Freelance");
    }

    const task = parseQuickCommand(
      "task DBG social banner due tomorrow 3 pcs",
      db,
      "2026-11-20",
    );
    expect(task?.kind).toBe("work-task");
    if (task?.kind === "work-task") {
      expect(task.data.projectName).toBe("DBG");
      expect(task.data.designType).toBe("Social & Campaign");
      expect(task.data.artworkCount).toBe(3);
      expect(task.data.dueDate).toBe("2026-11-21");
    }
  });

  it("runs a full real-world day across Personal, Work & Studio Studio Lifecycle", () => {
    let db = makeCleanDb();
    const refDate = "2026-11-20";

    // 1. Morning quick-capture: Personal income + Coffee expense + Studio software expense + Work task
    const incCmd = parseQuickCommand("+$1200 salary", db, refDate);
    expect(incCmd?.kind).toBe("income");
    if (incCmd?.kind === "income") {
      db = {
        ...db,
        personalIncome: [
          {
            id: uid(),
            ...incCmd.data,
          },
        ],
      };
    }

    const coffeeCmd = parseQuickCommand("6500r Onnik coffee", db, refDate);
    expect(coffeeCmd?.kind).toBe("expense");
    if (coffeeCmd?.kind === "expense") {
      db = {
        ...db,
        expenses: [
          ...db.expenses,
          { id: uid(), projectId: "", receipt: "", ...coffeeCmd.data },
        ],
      };
    }

    const taskCmd = parseQuickCommand(
      "task OCIC hero backdrop today 4 pcs",
      db,
      refDate,
    );
    expect(taskCmd?.kind).toBe("work-task");
    if (taskCmd?.kind === "work-task") {
      const task = buildQuickWorkTask(db, taskCmd.data, refDate);
      db = { ...db, workTasks: [task] };
    }

    // Add 3-month baseline for Food ($20/mo) and a spike this month ($100) to test anomaly detection
    db = {
      ...db,
      expenses: [
        ...db.expenses,
        {
          id: uid(),
          date: "2026-09-10",
          projectId: "",
          category: "Food",
          vendor: "Debit",
          description: "Meal",
          amount: 30,
          currency: "USD",
          receipt: "",
          account: "Personal",
        },
        {
          id: uid(),
          date: "2026-10-10",
          projectId: "",
          category: "Food",
          vendor: "Debit",
          description: "Meal",
          amount: 30,
          currency: "USD",
          receipt: "",
          account: "Personal",
        },
        {
          id: uid(),
          date: "2026-11-12",
          projectId: "",
          category: "Food",
          vendor: "Credit",
          description: "Team dinner",
          amount: 95,
          currency: "USD",
          receipt: "",
          account: "Personal",
        },
      ],
    };

    // 2. Studio funnel: Client -> Quotation -> Accepted -> Invoice -> Production -> Partial & Final Payment -> Delivered -> Closed
    const client: Client = {
      id: "cli-mekong",
      code: "RVD-01",
      name: "Mekong Roasters",
      type: "SME",
      industry: "F&B",
      contact: "Dara",
      email: "dara@mekong.kh",
      telegram: "@mekong",
      phone: "012888999",
      source: "Referral",
      status: "Lead",
      notes: "",
    };
    db = { ...db, clients: [client] };

    const quote: Invoice = {
      id: "doc-q1",
      no: "RVQT-26112001",
      kind: "Quotation",
      clientId: client.id,
      projectId: "",
      issue: refDate,
      due: "2026-12-10",
      currency: "USD",
      discount: 0,
      sent: true,
      response: "Accepted",
      followUp: "",
      showSchedule: true,
      includeTerms: true,
      includeRates: true,
      notes: "",
      items: [
        {
          id: "it-1",
          description: "Packaging & Brand System",
          scope: "Logo, bag dieline, menu",
          timeline: "14 days",
          qty: 1,
          price: 1500,
        },
      ],
      images: [],
    };
    db = saveDocument(db, quote);
    expect(db.projects.length).toBe(1);
    const linkedProj = db.projects[0]!;
    expect(linkedProj.status).toBe("Quoted");
    // Unbilled accepted quote should now appear in TodayFocusCard queue & AI intelligence
    let snap = computeCentralIntelligence(db, refDate);
    expect(snap.unbilledQuotedUSD).toBe(1500);
    const queue = getTodayActionQueue(db, refDate);
    expect(queue.some((q) => q.kind === "quote" && q.readyToConvert)).toBe(
      true,
    );
    expect(queue.some((q) => q.kind === "work")).toBe(true);

    // 3. Convert accepted quote to Invoice (1-click in TodayFocus / Invoices)
    const savedQuote = db.invoices.find((d) => d.id === quote.id)!;
    const inv = convertDocument(
      savedQuote,
      "Invoice",
      db.invoices,
      refDate,
      28,
    );
    inv.sent = true;
    inv.due = "2026-11-18"; // Simulate overdue invoice to test alert queue & Quick Pay
    db = saveDocument(db, inv);

    expect(db.projects[0]?.status).toBe("In production");
    expect(db.clients[0]?.status).toBe("Active");

    snap = computeCentralIntelligence(db, refDate);
    expect(snap.overdueInvoiceCount).toBe(1);
    expect(snap.overdueARUSD).toBe(1500);
    expect(snap.unbilledQuotedUSD).toBe(0);
    expect(snap.spendAnomalies.some((a) => a.category === "Food")).toBe(true);

    // 4. Advance Work task through pipeline -> Completed
    let task = db.workTasks[0]!;
    expect(task.status).toBe("Design");
    while (task.status !== "Completed") {
      const next = nextWorkStage(task);
      task = { ...task, status: next };
    }
    db = { ...db, workTasks: [{ ...task, completedDate: refDate }] };
    expect(designOutputSummary(db).workCompleted).toBe(1);

    // 5. Partial + Full payment settlement & Delivery note auto-close
    db = recordPayment(db, {
      id: uid(),
      invoiceId: inv.id,
      date: refDate,
      amount: 750,
      currency: "USD",
      method: "KHQR",
      reference: "Deposit 50%",
    });
    expect(computeCentralIntelligence(db, refDate).overdueARUSD).toBe(750);

    db = recordPayment(db, {
      id: uid(),
      invoiceId: inv.id,
      date: refDate,
      amount: 750,
      currency: "USD",
      method: "Bank transfer",
      reference: "Final 50%",
    });
    const dn = convertDocument(inv, "Delivery note", db.invoices, refDate, 28);
    dn.sent = true;
    dn.response = "Accepted";
    db = saveDocument(db, dn);

    // Project should auto-close once Delivered + Paid in full
    expect(db.projects[0]?.status).toBe("Closed");

    // 6. Verify Central AI, Balances & Client Q&A lookup
    snap = computeCentralIntelligence(db, refDate);
    expect(snap.overdueARUSD).toBe(0);
    expect(snap.openARUSD).toBe(0);
    expect(snap.studioBalanceUSD).toBe(1500);

    const bal = workspaceBalances(db, "2026-11");
    expect(bal.studioBalance).toBe(1500);
    expect(bal.personalBalance).toBeGreaterThan(1000);

    const clientQa = askCentralDB(db, snap, "How much billed Mekong Roasters?");
    expect(clientQa.answer).toContain("Mekong Roasters");
    expect(clientQa.answer).toContain("$1500.00 billed");
    expect(clientQa.answer).toContain("$0.00 outstanding");

    const healthQa = askCentralDB(
      db,
      snap,
      "What is our studio project health?",
    );
    expect(healthQa.answer).toContain("0 delayed");
  });
});
