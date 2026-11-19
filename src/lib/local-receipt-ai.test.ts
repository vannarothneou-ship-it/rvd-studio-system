import { describe, expect, it } from "vitest";
import { parseReceiptText } from "./local-receipt-ai";

describe("parseReceiptText (local AI OCR receipt parser)", () => {
  it("parses an ABA USD transfer slip with merchant and reference", () => {
    const sample = `
      ABA BANK
      PAYMENT SUCCESSFUL
      -$14.50
      Date: 18 Nov 2026
      To: Brown Coffee Tuol Kork
      Trx. ID: ABA9928174
      Account: Debit Card
    `;
    const res = parseReceiptText(sample, "2026-11-19");
    expect(res.txType).toBe("expense");
    expect(res.amount).toBe(14.5);
    expect(res.currency).toBe("USD");
    expect(res.date).toBe("2026-11-18");
    expect(res.merchantOrPayer).toContain("Brown Coffee");
    expect(res.category).toBe("Food");
    expect(res.method).toBe("Debit");
    expect(res.reference).toBe("ABA9928174");
    expect(res.confidence).toBe("high");
  });

  it("parses an ACLEDA / KHR receipt without USD", () => {
    const sample = `
      ACLEDA Bank Plc.
      Transfer Completed
      Amount: 42,000 KHR
      15/11/2026
      Merchant: Grab Ride Phnom Penh
      Ref: ACL44012
    `;
    const res = parseReceiptText(sample, "2026-11-19");
    expect(res.txType).toBe("expense");
    expect(res.amount).toBe(42000);
    expect(res.currency).toBe("KHR");
    expect(res.date).toBe("2026-11-15");
    expect(res.category).toBe("Transportation");
    expect(res.reference).toBe("ACL44012");
  });

  it("classifies PTT Fuel / Prius maintenance under Prius 2012", () => {
    const sample = `
      PTT STATION PHNOM PENH
      Fuel Gasoline 95
      Total Paid: $28.00
      Visa Credit Card **** 4821
      2026-11-10
    `;
    const res = parseReceiptText(sample, "2026-11-19");
    expect(res.txType).toBe("expense");
    expect(res.amount).toBe(28);
    expect(res.currency).toBe("USD");
    expect(res.method).toBe("Credit");
    expect(res.category).toBe("Prius 2012");
    expect(res.date).toBe("2026-11-10");
  });

  it("prefers USD on dual-currency Cambodian supermarket slips", () => {
    const sample = `
      Lucky Supermarket
      Grand Total USD 18.75
      KHR 76,875
      Nov 12, 2026
    `;
    const res = parseReceiptText(sample, "2026-11-19");
    expect(res.amount).toBe(18.75);
    expect(res.currency).toBe("USD");
    expect(res.date).toBe("2026-11-12");
    expect(res.category).toBe("Food");
  });

  it("detects incoming transfers as personal income", () => {
    const sample = `
      Transfer Received
      +$450.00
      From: Client Design Retainer
      2026-11-05
    `;
    const res = parseReceiptText(sample, "2026-11-19");
    expect(res.txType).toBe("income");
    expect(res.amount).toBe(450);
    expect(res.currency).toBe("USD");
    expect(res.category).toBe("Freelance");
    expect(res.date).toBe("2026-11-05");
  });

  it("classifies utility bills like EDC electricity", () => {
    const sample = `
      EDC Electricity Bill
      Paid: $36.40
      2026-11-08
    `;
    const res = parseReceiptText(sample, "2026-11-19");
    expect(res.txType).toBe("expense");
    expect(res.amount).toBe(36.4);
    expect(res.category).toBe("Utilities");
  });
});
