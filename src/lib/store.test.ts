import { describe, expect, it } from "vitest";
import { agreementPages } from "@/components/rv/AgreementDoc";
import { packBentoItems } from "@/components/rv/BentoGrid";
import {
  insertCaseStudyBlockAt,
  reorderCaseStudyBlocks,
} from "@/components/rv/CaseStudyBuilder";
import { buildPdfFromJpegs } from "@/lib/case-study-export";
import {
  PILLARS,
  autoBuildCaseStudy,
  cardSpendSeries,
  caseStudyKey,
  cashFlowSeries,
  cashReceived,
  categoryLimit,
  clientDeleteBlocker,
  categoryTotals,
  combinedCashFlowSeries,
  compactMoney,
  convertDocument,
  deletePayment,
  designOutputSummary,
  effectiveServiceTags,
  expenseAccount,
  expenseCategoriesFor,
  expenseTotal,
  getDB,
  goalAccount,
  invoiceStatus,
  invoiceTotals,
  invoiceView,
  isInvoice,
  needsFollowUp,
  nextInvoiceNo,
  normalizeServicePillar,
  parseTimelineDays,
  periodBreakdownBars,
  projectDeleteBlocker,
  serviceDeleteBlocker,
  personalCategoryTotals,
  personalIncomeSourceTotals,
  personalIncomeTotal,
  personalSeries,
  recordPayment,
  revenueByPillar,
  saveCaseStudy,
  saveDocument,
  serviceItem,
  setCategoryLimit,
  setDB,
  workspaceBalances,
  type Invoice,
} from "./store";

const inv = (p: Partial<Invoice>): Invoice => ({
  id: "x",
  no: "",
  clientId: "",
  projectId: "",
  issue: "2026-02-07",
  due: "2026-03-07",
  currency: "USD",
  discount: 0,
  sent: true,
  showSchedule: true,
  includeTerms: true,
  includeRates: true,
  notes: "",
  items: [
    { id: "a", description: "", scope: "", timeline: "", qty: 1, price: 100 },
  ],
  images: [],
  ...p,
});

describe("relationship-safe deletion", () => {
  it("blocks client deletion while projects or documents still reference it", () => {
    const db = getDB();
    const clientId = "linked-client";
    const withProject = {
      ...db,
      projects: [{ ...db.projects[0]!, clientId }],
    };
    expect(clientDeleteBlocker(withProject, clientId)).toContain("projects");
    const withDocument = {
      ...db,
      invoices: [{ ...db.invoices[0]!, clientId }],
    };
    expect(clientDeleteBlocker(withDocument, clientId)).toContain("documents");
    expect(clientDeleteBlocker(db, "unlinked-client")).toBeNull();
  });

  it("blocks project deletion while documents or expenses reference it", () => {
    const db = getDB();
    const projectId = "linked-project";
    const withDocument = {
      ...db,
      invoices: [{ ...db.invoices[0]!, projectId }],
    };
    expect(projectDeleteBlocker(withDocument, projectId)).toContain(
      "quotations",
    );
    const withExpense = {
      ...db,
      expenses: [{ ...db.expenses[0]!, projectId }],
    };
    expect(projectDeleteBlocker(withExpense, projectId)).toContain("expenses");
    expect(projectDeleteBlocker(db, "unlinked-project")).toBeNull();
  });

  it("blocks service deletion while projects or document line items reference it", () => {
    const db = getDB();
    const serviceId = "linked-service";
    const withProject = {
      ...db,
      projects: [{ ...db.projects[0]!, serviceId }],
    };
    expect(serviceDeleteBlocker(withProject, serviceId)).toContain("project");
    const withDocument = {
      ...db,
      invoices: [
        {
          ...db.invoices[0]!,
          items: [{ ...db.invoices[0]!.items[0]!, serviceId }],
        },
      ],
    };
    expect(serviceDeleteBlocker(withDocument, serviceId)).toContain(
      "commercial document",
    );
    expect(serviceDeleteBlocker(db, "unlinked-service")).toBeNull();
  });
});

describe("invoice rules", () => {
  it("numbers invoices RVIN-YYMMDDNN per issue day", () => {
    expect(nextInvoiceNo("2026-02-07", [])).toBe("RVIN-26020701");
    expect(nextInvoiceNo("2026-02-07", [{ no: "RVIN-26020701" }])).toBe(
      "RVIN-26020702",
    );
  });
  it("applies discount percent to subtotal", () => {
    expect(invoiceTotals(inv({ discount: 10 })).total).toBe(90);
  });
  it("is overdue when unpaid and past due", () => {
    expect(invoiceStatus(inv({}), 0, "2026-03-08")).toBe("Overdue");
  });
  it("is partial then paid from payments", () => {
    expect(invoiceStatus(inv({}), 50, "2026-02-10")).toBe("Partial");
    expect(invoiceStatus(inv({}), 100, "2026-04-10")).toBe("Paid");
  });
  it("stays draft until sent", () => {
    expect(invoiceStatus(inv({ sent: false }), 0, "2026-04-10")).toBe("Draft");
  });
});

describe("commercial document workflow", () => {
  it("keeps a silent client's quotation separate from invoiced revenue", () => {
    const q = inv({
      kind: "Quotation",
      followUp: "2026-11-14",
      response: "Pending",
    });
    expect(isInvoice(q)).toBe(false);
    expect(invoiceView(q, getDB()).totalUSD).toBe(0);
    expect(invoiceView(q, getDB()).balanceUSD).toBe(0);
    expect(needsFollowUp(q, "2026-11-14")).toBe(true);
    expect(needsFollowUp(q, "2026-11-13")).toBe(false);
  });
  it("stops follow-up reminders once a quotation receives a response", () => {
    expect(
      needsFollowUp(
        inv({
          kind: "Quotation",
          followUp: "2026-11-14",
          response: "Accepted",
        }),
        "2026-11-15",
      ),
    ).toBe(false);
    expect(
      needsFollowUp(
        inv({
          kind: "Quotation",
          followUp: "2026-11-14",
          response: "Declined",
        }),
        "2026-11-15",
      ),
    ).toBe(false);
    expect(
      needsFollowUp(
        inv({ kind: "Quotation", followUp: "2026-11-14", sent: false }),
        "2026-11-15",
      ),
    ).toBe(false);
  });
  it("creates a linked invoice without changing the quotation or copying paid status", () => {
    const q = inv({ id: "quote", kind: "Quotation", response: "Accepted" });
    const copy = convertDocument(q, "Invoice", [], "2026-11-14");
    expect(copy.sourceId).toBe("quote");
    expect(copy.kind).toBe("Invoice");
    expect(copy.no).toBe("RVIN-26111401");
    expect(copy.sent).toBe(false);
    expect(invoiceStatus(copy, 0)).toBe("Draft");
    expect(q.response).toBe("Accepted");
    expect(copy.items[0]?.id).not.toBe(q.items[0]?.id);
    expect(invoiceView(copy, getDB()).totalUSD).toBe(100);
  });
  it("does not treat agreements as payment requests", () => {
    const agreement = inv({ kind: "Agreement", response: "Accepted" });
    expect(invoiceStatus(agreement, 0)).toBe("Signed");
    expect(invoiceView(agreement, getDB()).balanceUSD).toBe(0);
  });
  it("does not treat delivery notes as payment requests", () => {
    const delivery = inv({ kind: "Delivery note", response: "Accepted" });
    expect(invoiceStatus(delivery, 0)).toBe("Received");
    expect(invoiceView(delivery, getDB()).totalUSD).toBe(0);
  });
  it("preserves legacy invoices and allocates separate quotation numbers", () => {
    expect(isInvoice(inv({}))).toBe(true);
    expect(nextInvoiceNo("2026-11-14", [], "Quotation")).toBe("RVQT-26111401");
    expect(
      nextInvoiceNo("2026-11-14", [{ no: "RVQT-26111403" }], "Quotation"),
    ).toBe("RVQT-26111404");
  });
});

describe("connected studio lifecycle automation", () => {
  it("automates Lead -> Active, Service -> Quotation -> Agreement -> Invoice -> Delivery -> Paid -> Closed", () => {
    let db = getDB();
    const svc = db.services[0]!;
    const leadClient = db.clients.find((c) => c.status === "Lead")!;

    // 1. Create and send Quotation from a service
    const quote = inv({
      id: "q-flow",
      kind: "Quotation",
      no: "RVQT-26111501",
      clientId: leadClient.id,
      projectId: "",
      issue: "2026-11-15",
      due: "2026-12-13",
      sent: true,
      response: "Pending",
      items: [serviceItem(svc, "USD", db.settings.khrRate)],
    });
    db = saveDocument(db, quote);
    const savedQuote = db.invoices.find((i) => i.id === "q-flow")!;
    expect(savedQuote.projectId).toBeTruthy();
    let proj = db.projects.find((p) => p.id === savedQuote.projectId)!;
    expect(proj.status).toBe("Quoted");
    expect(proj.serviceId).toBe(svc.id);

    // 2. Client accepts quotation -> client becomes Active, convert to Agreement & sign
    const acceptedQuote: Invoice = {
      ...savedQuote,
      response: "Accepted",
      confirmedBy: leadClient.contact,
      confirmedOn: "2026-11-16",
    };
    db = saveDocument(db, acceptedQuote);
    expect(db.clients.find((c) => c.id === leadClient.id)?.status).toBe(
      "Active",
    );

    const agreement = {
      ...convertDocument(acceptedQuote, "Agreement", db.invoices, "2026-11-16"),
      sent: true,
      response: "Accepted" as const,
      confirmedBy: leadClient.contact,
      confirmedOn: "2026-11-16",
    };
    db = saveDocument(db, agreement);
    proj = db.projects.find((p) => p.id === savedQuote.projectId)!;
    expect(proj.status).toBe("In production");
    expect(proj.start).toBe("2026-11-16");
    expect(proj.due).toBe("2026-11-21"); // 5 Days timeline parsed from Logo Branding I!

    // 3. Issue linked Invoice and record partial payment
    const invoice = {
      ...convertDocument(agreement, "Invoice", db.invoices, "2026-11-16"),
      sent: true,
    };
    db = saveDocument(db, invoice);
    const beforeCash = cashReceived(db, "2026-11");
    db = recordPayment(db, {
      id: "p-half",
      invoiceId: invoice.id,
      date: "2026-11-16",
      amount: 50,
      currency: "USD",
      method: "KHQR",
      reference: "Deposit",
    });
    expect(cashReceived(db, "2026-11")).toBeCloseTo(beforeCash + 50, 2);
    expect(invoiceView(invoice, db).status).toBe("Partial");

    // 4. Deliver project via Delivery Note
    const dn = {
      ...convertDocument(invoice, "Delivery note", db.invoices, "2026-11-20"),
      sent: true,
      response: "Accepted" as const,
      confirmedOn: "2026-11-20",
    };
    db = saveDocument(db, dn);
    proj = db.projects.find((p) => p.id === savedQuote.projectId)!;
    expect(proj.status).toBe("Delivered");

    // 5. Final payment closes project and updates finance automatically
    db = recordPayment(db, {
      id: "p-final",
      invoiceId: invoice.id,
      date: "2026-11-21",
      amount: 50,
      currency: "USD",
      method: "KHQR",
      reference: "Balance",
    });
    proj = db.projects.find((p) => p.id === savedQuote.projectId)!;
    expect(proj.status).toBe("Closed");
    expect(cashReceived(db, "2026-11")).toBeCloseTo(beforeCash + 100, 2);

    // 6. Deleting final payment reverts Closed -> Delivered
    db = deletePayment(db, "p-final");
    expect(db.projects.find((p) => p.id === savedQuote.projectId)?.status).toBe(
      "Delivered",
    );
  });

  it("parses service timelines cleanly", () => {
    expect(parseTimelineDays("5 - 7 Days")).toBe(7);
    expect(parseTimelineDays("2 weeks")).toBe(14);
  });
});

describe("agreement pagination and studio/personal finance", () => {
  it("paginates design agreement across 2 to 5 non-empty A4 pages", () => {
    const db = getDB();
    const doc = inv({
      id: "ag-1",
      kind: "Agreement",
      no: "RVAG-26111501",
      clientId: db.clients[0]!.id,
      projectId: db.projects[0]!.id,
      items: db.services
        .slice(0, 3)
        .map((s) => serviceItem(s, "USD", db.settings.khrRate)),
    });
    const pages = agreementPages(doc, db);
    expect(pages.length).toBeGreaterThanOrEqual(2);
    expect(pages.length).toBeLessThanOrEqual(5);
    for (const p of pages) expect(p.length).toBeGreaterThan(0);
  });

  it("separates Studio and Personal expenses, categories, and saving goals", () => {
    const db = getDB();
    const personal = db.expenses.filter(
      (e) => expenseAccount(e) === "Personal",
    );
    expect(personal).toHaveLength(1590);
    expect(expenseTotal(db, "Personal", "2026-11")).toBeCloseTo(770.59, 2);
    expect(expenseTotal(db, "Personal", "2026-10")).toBeCloseTo(870.9, 2);
    expect(categoryTotals(db, "Personal", "2026-11").length).toBe(6);
    expect(db.goals.some((g) => goalAccount(g) === "Personal")).toBe(true);
    expect(expenseCategoriesFor("Personal")).toEqual(
      expect.arrayContaining([
        "Food",
        "Transportation",
        "Kid",
        "Personal Spending",
        "Utilities",
        "Medical & Healthcare",
        "Saving & Investing",
        "Prius 2012",
      ]),
    );
    expect(expenseCategoriesFor("Studio")).toContain(
      "Software and subscriptions",
    );
    expect(categoryLimit(db, "Personal", "Food")).toBe(250);
    setCategoryLimit("Personal", "Food", 320);
    expect(categoryLimit(getDB(), "Personal", "Food")).toBe(320);
  });

  it("formats compact k/M amounts and computes 1m/6m/12m personal series", () => {
    expect(compactMoney(1000)).toBe("$1k");
    expect(compactMoney(1410)).toBe("$1.4k");
    expect(compactMoney(13880.1)).toBe("$13.9k");
    expect(compactMoney(6000)).toBe("$6k");
    expect(compactMoney(870.9)).toBe("$870.90");
    expect(compactMoney(295)).toBe("$295");
    expect(compactMoney(-500)).toBe("−$500");
    expect(compactMoney(1250000)).toBe("$1.3M");

    const db = getDB();
    const s1m = personalSeries(db, "1m", "2026-11");
    expect(s1m).toHaveLength(30);
    expect(s1m.reduce((s, x) => s + x.personalOut, 0)).toBeCloseTo(770.59, 2);
    expect(personalSeries(db, "6m", "2026-11")).toHaveLength(6);
    expect(personalSeries(db, "12m", "2026-11")).toHaveLength(12);
    expect(personalCategoryTotals(db, "6m", "2026-11").monthsCount).toBe(6);
    expect(personalCategoryTotals(db, "12m", "2026-11").monthsCount).toBe(12);
  });

  it("integrates real RothVan CSV data with exact paid and unpaid totals", () => {
    const db = getDB();
    expect(db.clients).toHaveLength(36);
    expect(db.services).toHaveLength(28);
    expect(db.projects).toHaveLength(105);
    expect(PILLARS).toEqual([
      "Branding Design",
      "Creative & Digital",
      "Marketing & Packaging",
      "Spatial Design",
    ]);
    expect(db.services.every((s) => PILLARS.includes(s.pillar))).toBe(true);
    expect(normalizeServicePillar("Creative Assets")).toBe(
      "Creative & Digital",
    );
    expect(normalizeServicePillar("Web & App Design")).toBe(
      "Creative & Digital",
    );
    expect(normalizeServicePillar("Marketing Collateral")).toBe(
      "Marketing & Packaging",
    );
    expect(normalizeServicePillar("Product Packaging")).toBe(
      "Marketing & Packaging",
    );
    const totalPaid = db.payments.reduce((s, p) => s + p.amount, 0);
    expect(totalPaid).toBeCloseTo(13880.1, 2);

    const s6 = cashFlowSeries(db, "6m");
    const s12 = cashFlowSeries(db, "12m");
    const sAll = cashFlowSeries(db, "all");
    expect(s6).toHaveLength(6);
    expect(s12).toHaveLength(12);
    expect(sAll.length).toBeGreaterThan(12);
    expect(sAll.reduce((sum, x) => sum + x.inn, 0)).toBeCloseTo(13880.1, 2);
    expect(s6.every((p) => p.fullDate.length > 0)).toBe(true);
    expect(
      personalSeries(db, "1m", "2026-11").every((p) => p.fullDate.length > 0),
    ).toBe(true);

    const pillars = revenueByPillar(db);
    expect(pillars.length).toBeGreaterThan(0);
    expect(pillars.reduce((sum, p) => sum + p.totalUSD, 0)).toBeGreaterThan(
      13000,
    );
  });
});

describe("bento dense packing and service tags", () => {
  it("dense-packs smaller cards up into gaps and auto-fills leftover row space", () => {
    const packed = packBentoItems(
      [
        { id: "a", span: 12 },
        { id: "b", span: 4 },
        { id: "c", span: 6 },
        { id: "d", span: 8 },
        { id: "e", span: 4 },
      ],
      true,
    );
    // e (4) flows up into row 3 with d (8); b (4) + c (6) expands c -> 8 to eliminate 2-col gap
    expect(packed.map((x) => [x.config.id, x.effectiveSpan])).toEqual([
      ["a", 12],
      ["b", 4],
      ["c", 8],
      ["d", 8],
      ["e", 4],
    ]);

    const strict = packBentoItems(
      [
        { id: "b", span: 4 },
        { id: "c", span: 6 },
      ],
      false,
    );
    expect(strict.map((x) => [x.config.id, x.effectiveSpan])).toEqual([
      ["b", 4],
      ["c", 6],
    ]);
  });

  it("derives clean 1-2 tags per service and respects custom service tags", () => {
    const db = getDB();
    const logoSvc = db.services.find((s) => s.code === "BD-01")!;
    const derived = effectiveServiceTags(logoSvc);
    expect(derived.length).toBeGreaterThanOrEqual(1);
    expect(derived.length).toBeLessThanOrEqual(2);
    expect(derived).toContain("Logo");
    expect(
      effectiveServiceTags({ ...logoSvc, tags: ["Retainer", "VIP"] }),
    ).toEqual(["Retainer", "VIP"]);
  });

  it("aggregates Debit vs Credit card spending daily and monthly", () => {
    const db = getDB();
    const daily = cardSpendSeries(db, "1m", "2026-11");
    expect(daily.points).toHaveLength(30);
    expect(daily.debitUSD + daily.creditUSD + daily.otherUSD).toBeCloseTo(
      daily.totalUSD,
      2,
    );
    expect(daily.totalUSD).toBeCloseTo(770.59, 2);
    expect(daily.debitCount + daily.creditCount).toBeGreaterThan(0);

    const sixMonths = cardSpendSeries(db, "6m", "2026-11");
    expect(sixMonths.points).toHaveLength(6);
    expect(sixMonths.debitUSD).toBeGreaterThan(0);

    const year = cardSpendSeries(db, "12m", "2026-11");
    expect(year.points).toHaveLength(12);
    expect(year.creditUSD).toBeGreaterThan(0);
  });

  it("tracks personal income separately from studio revenue and excludes personal expenses from studio cash flow counts", () => {
    const base = getDB();
    setDB((d) => ({
      ...d,
      personalIncome: [
        {
          id: "inc-1",
          date: "2026-11-10",
          source: "Salary",
          accountMethod: "Debit",
          description: "November draw",
          amount: 1200,
          currency: "USD",
        },
        {
          id: "inc-2",
          date: "2026-10-15",
          source: "Freelance",
          accountMethod: "Credit",
          description: "Side workshop",
          amount: 410000,
          currency: "KHR",
        },
      ],
    }));
    const db = getDB();
    expect(personalIncomeTotal(db, "2026-11")).toBeCloseTo(1200, 2);
    expect(personalIncomeTotal(db, "2026-10")).toBeCloseTo(100, 2);

    const sources6m = personalIncomeSourceTotals(db, "6m", "2026-11");
    expect(sources6m.map((s) => s.source)).toEqual(["Salary", "Freelance"]);

    const p6 = personalSeries(db, "6m", "2026-11");
    expect(p6.every((pt) => pt.studioOut === 0)).toBe(true);
    const novPt = p6.find((pt) => pt.key === "2026-11")!;
    expect(novPt.personalIn).toBeCloseTo(1200, 2);
    expect(novPt.personalOut).toBeCloseTo(770.59, 2);
    expect(novPt.net).toBeCloseTo(1200 - 770.59, 2);

    const studioToday = cashFlowSeries(db, "today", "2026-11");
    expect(studioToday).toHaveLength(4);
    const combinedToday = combinedCashFlowSeries(db, "today", "2026-11");
    expect(combinedToday).toHaveLength(4);

    const studioSeries = cashFlowSeries(db, "6m");
    const novStudio = studioSeries.find((pt) => pt.m === "2026-11")!;
    const novStudioExpenses = db.expenses.filter(
      (e) => expenseAccount(e) === "Studio" && e.date.startsWith("2026-11"),
    );
    expect(novStudio.outCount).toBe(novStudioExpenses.length);

    setDB(() => base);
  });

  it("computes real-time workspaceBalances, combinedCashFlowSeries, and designOutputSummary across Work and Studio", () => {
    const base = getDB();
    setDB((d) => ({
      ...d,
      personalIncome: [
        {
          id: "inc-w1",
          date: "2026-11-05",
          source: "Salary",
          accountMethod: "Debit",
          description: "Full-time salary",
          amount: 1500,
          currency: "USD",
        },
      ],
      workTasks: [
        {
          id: "wt-1",
          code: "WRK-01",
          title: "Campaign Key Visual",
          projectName: "DBG",
          company: "DBG",
          designType: "Social & Campaign",
          status: "Completed",
          artworkCount: 6,
          startDate: "2026-11-05",
          dueDate: "2026-11-10",
          completedDate: "2026-11-09",
          notes: "Approved by brand lead",
          featured: true,
          media: [
            {
              id: "m-1",
              name: "kv-final.png",
              kind: "image",
              mimeType: "image/png",
              size: 1024,
              createdAt: "2026-11-09",
            },
          ],
        },
        {
          id: "wt-2",
          code: "WRK-02",
          title: "Sales Deck Refresh",
          projectName: "Connexion",
          company: "Connexion",
          designType: "Presentation & Deck",
          status: "Current",
          artworkCount: 12,
          startDate: "2026-11-18",
          dueDate: "2026-11-20",
          completedDate: "",
          notes: "",
          featured: false,
          media: [],
        },
      ],
    }));

    const db = getDB();
    const bal = workspaceBalances(db, "2026-11");
    expect(bal.studioInAll).toBeCloseTo(13880.1, 2);
    expect(bal.studioBalance).toBeCloseTo(
      bal.studioInAll - bal.studioOutAll,
      2,
    );
    expect(bal.personalInAll).toBeCloseTo(1500, 2);
    expect(bal.personalBalance).toBeCloseTo(
      bal.personalInAll - bal.personalOutAll,
      2,
    );
    expect(bal.combinedBalance).toBeCloseTo(
      bal.studioBalance + bal.personalBalance,
      2,
    );

    const combined6 = combinedCashFlowSeries(db, "6m");
    expect(combined6).toHaveLength(6);
    const novCombined = combined6.find((x) => x.m === "2026-11")!;
    expect(novCombined.personalIn).toBeCloseTo(1500, 2);
    expect(novCombined.totalIn).toBeCloseTo(
      novCombined.studioIn + novCombined.personalIn,
      2,
    );
    expect(novCombined.totalOut).toBeCloseTo(
      novCombined.studioOut + novCombined.personalOut,
      2,
    );

    const summary = designOutputSummary(db);
    expect(summary.workCompleted).toBe(1);
    expect(summary.workActive).toBe(1);
    expect(summary.studioCompleted).toBeGreaterThan(0);
    expect(summary.completedTotal).toBe(1 + summary.studioCompleted);
    expect(summary.totalArtworks).toBeGreaterThanOrEqual(18);
    expect(summary.mediaCount).toBe(1);
    expect(summary.featuredCount).toBe(1);
    expect(
      summary.byType.some((t) => t.designType === "Social & Campaign"),
    ).toBe(true);
    expect(
      summary.byProjectGroup.some(
        (g) => g.projectGroup === "DBG" && g.artworkCount === 6,
      ),
    ).toBe(true);
    expect(
      summary.byProjectGroup.some(
        (g) => g.projectGroup === "Connexion" && g.artworkCount === 12,
      ),
    ).toBe(true);

    setDB(() => base);
  });

  it("supports today and week personal ranges, period breakdown bars, case study generation, and PDF byte output", () => {
    const db = getDB();

    const todaySeries = personalSeries(db, "today", "2026-11");
    expect(todaySeries).toHaveLength(4);
    expect(todaySeries.map((p) => p.label)).toEqual([
      "Morning",
      "Midday",
      "Afternoon",
      "Evening",
    ]);

    const weekSeries = personalSeries(db, "week", "2026-11");
    expect(weekSeries).toHaveLength(7);

    const catToday = personalCategoryTotals(db, "today", "2026-11");
    expect(catToday.dateSet?.size).toBe(1);
    const catWeek = personalCategoryTotals(db, "week", "2026-11");
    expect(catWeek.dateSet?.size).toBe(7);

    const cardToday = cardSpendSeries(db, "today", "2026-11");
    expect(cardToday.points).toHaveLength(4);
    const cardWeek = cardSpendSeries(db, "week", "2026-11");
    expect(cardWeek.points).toHaveLength(7);

    const byCat = periodBreakdownBars(
      db,
      "Personal",
      "1m",
      "2026-11",
      "category",
      "spending",
    );
    expect(byCat.length).toBeGreaterThan(0);
    expect(byCat[0]!.primary).toBeGreaterThan(0);

    const byMethod = periodBreakdownBars(
      db,
      "Personal",
      "1m",
      "2026-11",
      "method",
      "spending",
    );
    expect(byMethod.length).toBeGreaterThan(0);

    const sampleWork: Parameters<typeof autoBuildCaseStudy>[0] = {
      id: "work-cs-1",
      source: "work",
      code: "WRK-99",
      title: "OCIC Wayfinding System",
      subtitle: "OCIC",
      projectGroup: "OCIC",
      designType: "Spatial & Signage",
      status: "Completed",
      completed: true,
      date: "2026-11-18",
      artworkCount: 4,
      media: [
        {
          id: "img-a",
          name: "pylon-hero.png",
          kind: "image",
          mimeType: "image/png",
          size: 2048,
          createdAt: "2026-11-18",
        },
        {
          id: "img-b",
          name: "signage-detail.jpg",
          kind: "image",
          mimeType: "image/jpeg",
          size: 2048,
          createdAt: "2026-11-18",
        },
        {
          id: "pdf-c",
          name: "spec-sheet.pdf",
          kind: "pdf",
          mimeType: "application/pdf",
          size: 4096,
          createdAt: "2026-11-18",
        },
      ],
      notes: "Outdoor directional signage and podium monoliths.",
      featured: true,
    };

    const doc = autoBuildCaseStudy(sampleWork);
    expect(doc.id).toBe(caseStudyKey("work", "work-cs-1"));
    expect(doc.blocks.some((b) => b.type === "gallery")).toBe(true);
    expect(doc.blocks.some((b) => b.type === "quote")).toBe(true);

    const updatedDb = saveCaseStudy(db, doc);
    expect(updatedDb.caseStudies?.[doc.id]?.title).toBe(
      "OCIC Wayfinding System",
    );

    const fakeJpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xd9]);
    const pdfBytes = buildPdfFromJpegs([
      { jpegBytes: fakeJpeg, width: 1080, height: 1350 },
    ]);
    const header = new TextDecoder().decode(pdfBytes.slice(0, 8));
    const tail = new TextDecoder().decode(pdfBytes.slice(-8));
    expect(header.startsWith("%PDF-1.4")).toBe(true);
    expect(tail).toContain("%%EOF");

    // Drag-and-drop case study block reordering & insertion helpers
    const b1 = doc.blocks[0]!;
    const b2 = doc.blocks[1]!;
    const reordered = reorderCaseStudyBlocks(doc.blocks, 0, 1);
    expect(reordered[0]!.id).toBe(b2.id);
    expect(reordered[1]!.id).toBe(b1.id);
    expect(reorderCaseStudyBlocks(doc.blocks, -1, 1)).toEqual(doc.blocks);
    expect(reorderCaseStudyBlocks(doc.blocks, 0, 99)).toEqual(doc.blocks);

    const inserted = insertCaseStudyBlockAt(
      doc.blocks,
      { id: "div-new", type: "divider" },
      1,
    );
    expect(inserted[1]!.id).toBe("div-new");
    expect(inserted.length).toBe(doc.blocks.length + 1);

    const clampedTail = insertCaseStudyBlockAt(
      doc.blocks,
      { id: "div-end", type: "divider" },
      999,
    );
    expect(clampedTail[clampedTail.length - 1]!.id).toBe("div-end");
  });
});
