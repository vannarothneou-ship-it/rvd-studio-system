import { describe, expect, it } from "vitest";
import {
  extractExchangeRates,
  extractKhrFigures,
  isNoisyOcrText,
  khrCrossCheck,
  looksLikeOcrNoise,
  normalizeKhmerDigits,
  parseReceiptText,
  pickLargeAmountHints,
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

  describe("POS screen photo (BizAdvisor supermarket screen, total $39.10 = 160,300 KHR)", () => {
    // Real OCR output captured from the photo: main pass is garbage, assist passes find the number.
    const mainPass = `
      ខ្ន Fe ស '– Hel =v ន Fa 2 វិ គុ a
      pe 2 | មែ. : 5 : EN = pit
      ឆ aes cam 160,300 (@ oo
    `;
    const hints = {
      largeAmounts: [{ amount: 39.1, height: 116, conf: 96 }],
      focusText: "JUHI\n(39.10\n1160,300",
      extraText: "BizAdvisor\n0.60\n1.50\n31.50\n99.10\n0.00",
    };

    it("finds nothing without assist hints (old behaviour)", () => {
      const res = parseReceiptText(mainPass, "2026-11-20");
      expect(res.amount).not.toBe(39.1);
    });

    it("reads $39.10 from the tallest number and confirms it with the KHR total", () => {
      const res = parseReceiptText(mainPass, "2026-11-20", { hints });
      expect(res.amount).toBe(39.1);
      expect(res.currency).toBe("USD");
      expect(res.txType).toBe("expense");
    });

    it("does not use garbled OCR as the merchant name", () => {
      const res = parseReceiptText(mainPass, "2026-11-20", { hints });
      expect(res.merchantOrPayer).toBe("Scanned Slip");
    });
  });

  it("pickLargeAmountHints keeps only the clearly tallest amount token", () => {
    const hints = pickLargeAmountHints([
      { text: "0.60", conf: 90, height: 36 },
      { text: "1.50", conf: 90, height: 38 },
      { text: "99.10", conf: 78, height: 38 },
      { text: "8993007007238", conf: 95, height: 38 },
      { text: "39.10", conf: 24, height: 116 },
    ]);
    expect(hints).toHaveLength(1);
    expect(hints[0]?.amount).toBe(39.1);
  });

  it("extracts KHR totals including a riel sign misread as a leading 1", () => {
    expect(extractKhrFigures("1160,300")).toEqual(
      expect.arrayContaining([160300]),
    );
    expect(extractExchangeRates("1$ = 4,100.00")).toEqual([4100]);
  });

  it("khrCrossCheck confirms 39.10 and rejects the misread 99.10", () => {
    expect(khrCrossCheck(39.1, [160300], [4100])).toBe(true);
    expect(khrCrossCheck(99.1, [160300], [4100])).toBe(false);
    expect(khrCrossCheck(39.1, [160300], [])).toBe(true);
  });

  it("looksLikeOcrNoise flags garbage but not real merchant lines", () => {
    expect(looksLikeOcrNoise("ខ្ន Fe ស '– Hel =v ន Fa 2 វិ គុ a")).toBe(true);
    expect(looksLikeOcrNoise("Brown Coffee Tuol Kork")).toBe(false);
    expect(looksLikeOcrNoise("KFC")).toBe(false);
  });

  describe("real main-pass OCR of the BizAdvisor POS photo", () => {
    const realMainPass = `ម                        កី . : យយ

-        -es dS |                        --

រ           +  3                           i   ន រ   ក
d         |                          —
SSE 5                 ER                                    a

/
ក យយ រុក ទស
Rg | === _ ២ ចំនួន aly uml សុប             4
= r=            = =—   =  =    4
និ | 0009007007395 0! —      ន
an   កកិត កករ រ   0.50
អាហារ |      = =                     យ
ញា កិក |!

ក | 0418783510240 = កត និក —   — od
| ទ្ងីក|ដោះ|គោរឃ្សាំ Aptamil 1D (3) 800g រ ប        |
ន wwe = ស oon 0 oo (SN
យេ 7 us          Spay
ម៉ែ woe. 1 0 ០0 UN =   = FE ក្ក

alll  |22|ឲ.ថងប្រ wm Re a

Jie |                          -          |
   fgasamaiy    6 សរុបក៊ុងព្រាយ
gl wn 40
i                         a
rts            umsaly(%)       0.00                            a
២:               1   =                                                  3
ely                glin(e) 000                             0,3
7 ប គ
:  |             DOWER BY BIZADVISOR mmm
EE ស យ     =
ន
`;

    it("is flagged as noisy text so the extra passes run", () => {
      expect(isNoisyOcrText(realMainPass)).toBe(true);
      expect(
        isNoisyOcrText(
          "ABA BANK\nPAYMENT SUCCESSFUL\n-$14.50\nDate: 18 Nov 2026\nTo: Brown Coffee",
        ),
      ).toBe(false);
    });

    it("with assist hints: $39.10, kid category, no junk merchant", () => {
      const res = parseReceiptText(realMainPass, "2026-11-20", {
        hints: {
          largeAmounts: [{ amount: 39.1, height: 116, conf: 96 }],
          focusText: "aujugHmw\n(39.10\n$160,300\n",
        },
      });
      expect(res.amount).toBe(39.1);
      expect(res.currency).toBe("USD");
      expect(res.category).toBe("Kid");
      expect(res.merchantOrPayer).toBe("Scanned Slip");
    });
  });

  it("does not guess a merchant from garbled browser OCR of the POS photo", () => {
    const browserRaw = `a    ន oo mld lg TREES
a wm? ® wm PE iE NINE
aera.  sia       ន ន រី la
ម និ
នន    ic    sar    2         Fl ន i Chad (og
ថ្ងៃ ន ហា
កាយ ន i ់
ស nlp ee រ
ស = me -- = = SHR រ:
= me 4
mee et ed
Tes Ea ui ppramitWIOA000F8  — 0 រ     ន:
aes Err ns gee. ទពីធី  យា
ន a E    >
= lee = = E———7 joo Ee   SEE
Ee 7 ae = hgh |
ne ss faa
EEE   ក -  =="    Ea Pig
am) wy %៕ § 3910 Lae
Fa ន ថទ ai Eo
TET] eh I EEE
BE mee WS emma
RR x  ie ន LET eae Ee 2
Ea re EET SE a TEE nt
ម ae Crh
ae ab ហោ bw GE
`;
    const res = parseReceiptText(browserRaw, "2026-11-20", {
      hints: {
        largeAmounts: [{ amount: 39.1, height: 116, conf: 96 }],
        focusText: "(39.10\n$160,300",
      },
    });
    expect(res.amount).toBe(39.1);
    expect(res.merchantOrPayer).toBe("Scanned Slip");
  });
});
