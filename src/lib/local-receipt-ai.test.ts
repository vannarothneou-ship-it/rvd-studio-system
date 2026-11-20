import { describe, expect, it } from "vitest";
import {
  learnReceiptRule,
  matchLearnedRule,
  normalizeKhmerDigits,
  parseReceiptText,
} from "./local-receipt-ai";

describe("parseReceiptText (local AI OCR receipt parser)", () => {
  it("normalizes Khmer digits ០-៩ to ASCII digits", () => {
    expect(normalizeKhmerDigits("២៤,៥០០ ៛ · ១៨/១១/២០២៦")).toBe(
      "24,500 ៛ · 18/11/2026",
    );
  });

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

  it("parses Khmer script receipt with Khmer numerals, merchant, date, and KHR total", () => {
    const sample = `
      ហាងកាហ្វេ រ៉ូតវ៉ាន់
      ថ្ងៃទី ១៨ ខែ វិច្ឆិកា ឆ្នាំ ២០២៦
      កាហ្វេទឹកកក ១
      ប្រាក់សរុប: ២៤,៥០០ រៀល
    `;
    const res = parseReceiptText(sample, "2026-11-19");
    expect(res.txType).toBe("expense");
    expect(res.amount).toBe(24500);
    expect(res.currency).toBe("KHR");
    expect(res.date).toBe("2026-11-18");
    expect(res.category).toBe("Food");
    expect(res.merchantOrPayer).toContain("ហាងកាហ្វេ");
  });

  it("parses Khmer gas station handwritten slip under Prius 2012", () => {
    const sample = `
      ចាក់សាំង
      19/11/26
      Total $18.5
    `;
    const res = parseReceiptText(sample, "2026-11-01");
    expect(res.txType).toBe("expense");
    expect(res.amount).toBe(18.5);
    expect(res.currency).toBe("USD");
    expect(res.date).toBe("2026-11-19");
    expect(res.category).toBe("Prius 2012");
  });

  it("parses messy handwritten shorthand notes without dollar sign", () => {
    const sample = `
      Coffee & lunch
      Total 14.5
      18/11/26
    `;
    const res = parseReceiptText(sample, "2026-11-19");
    expect(res.amount).toBe(14.5);
    expect(res.currency).toBe("USD");
    expect(res.date).toBe("2026-11-18");
    expect(res.category).toBe("Food");
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

  it("parses ACLEDA WUCV inward remittance slip cleanly as income (IMG_2065)", () => {
    const sample = `
      Transaction Detail
      WUCV
      Deposited amount : 300.90 USD
      Receive amount : 300.90 USD
      Sent amount : 460.00 CAD
      MTCN : 6814030769
      From country : Canada
      Receiver : Neou Vannaroth
      USD 017493196
      Sender : VANNARY NEOU
      Purpose : Family Expense
      Occupation/Position: Office Professional
      The sender is my : Family
      Date : Nov 18, 2026 09:15 PM
      Completed : Ref. F3227083693
      Call center (24/7)
      023 994 444 | 015 999 233 ACLEDA BANK
    `;
    const res = parseReceiptText(sample, "2026-11-19", {
      ownerNames: ["Roth", "Neou Vannaroth", "Vannaroth Neou"],
    });
    expect(res.txType).toBe("income");
    expect(res.amount).toBe(300.9);
    expect(res.currency).toBe("USD");
    expect(res.date).toBe("2026-11-18");
    expect(res.merchantOrPayer).toBe("Vannary Neou");
    expect(res.description).toContain("Family Expense");
    expect(res.category).toBe("Gift & Refund");
    expect(res.reference).toBe("F3227083693");
    expect(res.confidence).toBe("high");
  });

  it("recovers from colon-as-1 OCR corruption and logo glyph noise on ACLEDA slip (IMG_2077)", () => {
    const corrupted = `
      ម Transaction Detail
      WUCV
      Deposited amount 1300.90 USD
      Receive amount : 300.90 USD
      Sent amount : 460.00 CAD
      MTCN : 6814030769
      From country : Canada
      Receiver : Neou Vannaroth
      USD 017493196
      Sender : VANNARY NEOU
      Purpose : Family Expense
      The sender is my : Family
      Date : Nov 18, 2026 09:15 PM
      Completed : Ref. F3227083693
    `;
    const res = parseReceiptText(corrupted, "2026-11-19", {
      ownerNames: ["Neou Vannaroth"],
    });
    expect(res.txType).toBe("income");
    expect(res.amount).toBe(300.9);
    expect(res.currency).toBe("USD");
    expect(res.merchantOrPayer).toBe("Vannary Neou");
    expect(res.category).toBe("Gift & Refund");
    expect(res.merchantOrPayer).not.toContain("Transaction Detail");
  });

  it("recovers 300.90 when both primary colon lines lost colons into leading 1", () => {
    const doubleCorrupted = `
      ម Transaction Detail
      Deposited amount 1300.90 USD
      Receive amount 1300.90 USD
      Sent amount : 460.00 CAD
      MTCN : 6814030769
      From country : Canada
      Receiver : Neou Vannaroth
      USD 017493196
      Sender : VANNARY NEOU
      Purpose : Family Expense
      Date : Nov 18, 2026 09:15 PM
      Completed : Ref. F3227083693
    `;
    const res = parseReceiptText(doubleCorrupted, "2026-11-19", {
      ownerNames: ["Neou Vannaroth"],
    });
    expect(res.txType).toBe("income");
    expect(res.amount).toBe(300.9);
    expect(res.currency).toBe("USD");
    expect(res.merchantOrPayer).toBe("Vannary Neou");
  });

  it("recovers 7.00 when a lost colon turned into a leading 1 (1 7.00 -> 17.00)", () => {
    const shortCorrupted = `
      Transaction Detail
      Deposited amount 17.00 USD
      Receive amount 17.00 USD
      Sent amount : 40.00 CAD
      MTCN : 6814030769
      From country : Canada
      Receiver : Neou Vannaroth
      Sender : VANNARY NEOU
      Date : Nov 18, 2026 09:15 PM
    `;
    const res = parseReceiptText(shortCorrupted, "2026-11-19", {
      ownerNames: ["Neou Vannaroth"],
    });
    expect(res.amount).toBe(7);
  });

  it("keeps a genuine 12.50 total on a normal slip", () => {
    const res = parseReceiptText(
      "ABA BANK\nPAYMENT SUCCESSFUL\n-$12.50\nDate: 18 Nov 2026\nTo: Brown Coffee",
      "2026-11-19",
    );
    expect(res.amount).toBe(12.5);
  });

  it("ignores bank account numbers like USD 00412345 and treats owner-as-sender as expense", () => {
    const outgoing = `
      ACLEDA mobile
      Transfer Completed
      Sender : Neou Vannaroth
      USD 00412345
      Receiver : Brown Coffee
      Amount : 4.50 USD
      Date : Nov 19, 2026
    `;
    const res = parseReceiptText(outgoing, "2026-11-19", {
      ownerNames: ["Neou Vannaroth"],
    });
    expect(res.txType).toBe("expense");
    expect(res.amount).toBe(4.5);
    expect(res.currency).toBe("USD");
    expect(res.merchantOrPayer).toBe("Brown Coffee");
    expect(res.category).toBe("Food");
  });

  it("parses exact raw Tesseract eng+khm OCR output from IMG_2065_21fd0218.jpeg accurately", () => {
    const exactRawOcr = `ស   Transaction Detail
wucv
Deposited amount : 300.90 USD
Receive amount     1300.90 USD
Sent amount         1460.00 CAD
MTCN                 16814030769
From country        : Canada
Receiver              :Neou Vannaroth
USD 017493196
Sender                 : VANNARY NEOU
Purpose              : Family Expense
Occupation/Position: Office Professional
The sender is my  : Family
Date                 :Nov 18, 2026 09:15 PM
Completed           : Ref. F3227083693
Call center (24/7)
ol  SJ023994 444 | 015 999 233   អេសុលដា ស`;

    const res = parseReceiptText(exactRawOcr, "2026-11-19", {
      ownerNames: ["Roth", "Neou Vannaroth", "Vannaroth Neou"],
    });
    expect(res.txType).toBe("income");
    expect(res.amount).toBe(300.9);
    expect(res.currency).toBe("USD");
    expect(res.date).toBe("2026-11-18");
    expect(res.merchantOrPayer).toBe("Vannary Neou");
    expect(res.description).toBe("Family Expense · Canada");
    expect(res.category).toBe("Gift & Refund");
    expect(res.reference).toBe("F3227083693");
    expect(res.confidence).toBe("high");
  });

  it("cross-verifies USD against equivalent KHR total using khrRate", () => {
    const dual = `
      Lucky Supermarket
      Grand Total USD 18.75
      Equivalent KHR 76,875
      Nov 12, 2026
    `;
    const res = parseReceiptText(dual, "2026-11-19", { khrRate: 4100 });
    expect(res.amount).toBe(18.75);
    expect(res.currency).toBe("USD");
    expect(res.mathVerified).toBe(true);
    expect(res.confidence).toBe("high");
  });

  it("cross-verifies receipt total against itemized qty x unit lines", () => {
    const itemized = `
      Tube Coffee BKK1
      2 x 3.50 = 7.00
      1 x 4.00 = 4.00
      Total Paid $11.00
      2026-11-19
    `;
    const res = parseReceiptText(itemized, "2026-11-19");
    expect(res.amount).toBe(11);
    expect(res.currency).toBe("USD");
    expect(res.mathVerified).toBe(true);
    expect(res.confidence).toBe("high");
  });

  it("learns merchant category/method rules and applies them on subsequent scans", () => {
    let rules = learnReceiptRule([], {
      merchantOrPayer: "Circle K Toul Tom Poung",
      txType: "expense",
      category: "Utilities",
      method: "Credit",
    });
    rules = learnReceiptRule(rules, {
      merchantOrPayer: "Circle K Toul Tom Poung",
      txType: "expense",
      category: "Utilities",
      method: "Credit",
    });
    expect(rules).toHaveLength(1);
    expect(rules[0]!.hits).toBe(2);

    const matched = matchLearnedRule(
      "Circle K Toul Tom Poung",
      "circle k toul tom poung",
      rules,
    );
    expect(matched?.category).toBe("Utilities");

    const slip = `
      ABA PAY
      To: Circle K Toul Tom Poung
      Total: $6.50
      2026-11-19
    `;
    const parsed = parseReceiptText(slip, "2026-11-19", {
      learnedRules: rules,
    });
    expect(parsed.category).toBe("Utilities");
    expect(parsed.method).toBe("Credit");
    expect(parsed.matchedRule).toBe("Circle K Toul Tom Poung");
    expect(parsed.confidence).toBe("high");
  });
});
