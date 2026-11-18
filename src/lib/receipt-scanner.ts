import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";

export const SCANNER_MODEL = "gemini-4-hydrogen";

export interface ScannedReceiptResult {
  txType: "expense" | "income";
  account: "Personal" | "Studio";
  amount: number;
  currency: "USD" | "KHR";
  date: string;
  merchantOrPayer: string;
  description: string;
  method:
    | "ABA Bank"
    | "ACLEDA"
    | "Canadia"
    | "KHQR"
    | "Debit"
    | "Credit"
    | "Cash"
    | "Other";
  category: string;
  reference: string;
  confidence: "high" | "medium" | "low";
  notes: string;
}

const EXPENSE_PERSONAL = [
  "Food",
  "Transportation",
  "Kid",
  "Personal Spending",
  "Utilities",
  "Medical & Healthcare",
  "Saving & Investing",
  "Prius 2012",
  "Other",
] as const;

const EXPENSE_STUDIO = [
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
] as const;

const INCOME_SOURCES = [
  "Salary",
  "Studio Draw",
  "Freelance",
  "Bonus",
  "Investment",
  "Gift & Refund",
  "Other",
] as const;

const ALLOWED_METHODS = [
  "ABA Bank",
  "ACLEDA",
  "Canadia",
  "KHQR",
  "Debit",
  "Credit",
  "Cash",
  "Other",
] as const;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    txType: {
      type: Type.STRING,
      description:
        "Transaction direction: 'expense' for money spent/transferred out/paid, 'income' for salary/deposit/transfer received.",
    },
    account: {
      type: Type.STRING,
      description:
        "Workspace: 'Personal' for everyday food/fuel/family/medical/utilities/personal bank transfers, or 'Studio' for graphic design business costs (software, fonts, printing, fabrication, studio equipment, client invoices).",
    },
    amount: {
      type: Type.NUMBER,
      description:
        "Total transaction amount as a positive number (e.g. 12.5 or 20500). Return 0 if unreadable.",
    },
    currency: {
      type: Type.STRING,
      description: "Currency code: 'USD' or 'KHR'.",
    },
    date: {
      type: Type.STRING,
      description:
        "Transaction date in ISO format YYYY-MM-DD. Use the fallback today date provided in the prompt if no date appears on the receipt.",
    },
    merchantOrPayer: {
      type: Type.STRING,
      description:
        "Short vendor, store, recipient, or sender name (e.g. 'Brown Coffee', 'Aeon Mall', 'Adobe', 'ABA Transfer · Piseth').",
    },
    description: {
      type: Type.STRING,
      description:
        "Concise 1-line description of what was bought or transferred (max 60 characters).",
    },
    method: {
      type: Type.STRING,
      description:
        "Payment channel: one of 'ABA Bank', 'ACLEDA', 'Canadia', 'KHQR', 'Debit', 'Credit', 'Cash', 'Other'. Detect Cambodian bank UI branding (ABA Mobile/Pay -> 'ABA Bank', ACLEDA/ToanChet -> 'ACLEDA', Canadia Bank -> 'Canadia', generic Bakong KHQR -> 'KHQR').",
    },
    category: {
      type: Type.STRING,
      description:
        "Best matching category from Personal categories, Studio categories, or Income sources depending on txType and account.",
    },
    reference: {
      type: Type.STRING,
      description:
        "Bank transaction ID, reference code, or receipt number if visible; otherwise empty string.",
    },
    confidence: {
      type: Type.STRING,
      description: "'high', 'medium', or 'low'.",
    },
    notes: {
      type: Type.STRING,
      description:
        "Optional brief context (items summary, bank remark, or KHR/USD note).",
    },
  },
  required: [
    "txType",
    "account",
    "amount",
    "currency",
    "date",
    "merchantOrPayer",
    "description",
    "method",
    "category",
    "reference",
    "confidence",
    "notes",
  ],
};

function sanitizeMethod(raw: string): ScannedReceiptResult["method"] {
  const s = raw.trim().toLowerCase();
  if (s.includes("aba")) return "ABA Bank";
  if (s.includes("acleda") || s.includes("toanchet")) return "ACLEDA";
  if (s.includes("canadia")) return "Canadia";
  if (s.includes("khqr") || s.includes("bakong") || s.includes("qr"))
    return "KHQR";
  if (s.includes("credit")) return "Credit";
  if (s.includes("debit")) return "Debit";
  if (s.includes("cash")) return "Cash";
  const exact = ALLOWED_METHODS.find((m) => m.toLowerCase() === s);
  return exact ?? "Other";
}

function sanitizeCategory(
  txType: "expense" | "income",
  account: "Personal" | "Studio",
  raw: string,
): string {
  const trimmed = raw.trim();
  const list =
    txType === "income"
      ? INCOME_SOURCES
      : account === "Studio"
        ? EXPENSE_STUDIO
        : EXPENSE_PERSONAL;

  const exact = list.find((c) => c.toLowerCase() === trimmed.toLowerCase());
  if (exact) return exact;

  const lower = trimmed.toLowerCase();
  if (txType === "income") {
    if (/salary|payroll|wage/.test(lower)) return "Salary";
    if (/draw|owner|studio/.test(lower)) return "Studio Draw";
    if (/freelance|client|design|invoice/.test(lower)) return "Freelance";
    if (/bonus|reward/.test(lower)) return "Bonus";
    if (/invest|dividend|interest/.test(lower)) return "Investment";
    if (/gift|refund|cashback/.test(lower)) return "Gift & Refund";
    return "Other";
  }

  if (account === "Studio") {
    if (/adobe|figma|framer|software|cloud|sub/.test(lower))
      return "Software and subscriptions";
    if (/font|license|stock|asset/.test(lower)) return "Fonts and licenses";
    if (/print|paper|brochure|card|proof/.test(lower))
      return "Printing and production";
    if (/fabric|sign|booth|vendor|acrylic/.test(lower))
      return "Fabrication and vendors";
    if (/freelance|subcontract/.test(lower)) return "Freelancers";
    if (/grab|passapp|taxi|transport|fuel|gas/.test(lower)) return "Transport";
    if (/ad|boost|meta|facebook|market/.test(lower)) return "Marketing";
    if (/laptop|monitor|tablet|mouse|camera|equip/.test(lower))
      return "Equipment";
    if (/rent|wifi|internet|electric|office|util/.test(lower))
      return "Office and utilities";
    return "Other";
  }

  if (
    /food|coffee|cafe|tea|lunch|dinner|breakfast|grocer|mart|meal/.test(lower)
  )
    return "Food";
  if (/prius|car|oil|mechanic|wash|tire/.test(lower)) return "Prius 2012";
  if (/gas|fuel|grab|passapp|taxi|tuk|transport|parking|toll/.test(lower))
    return "Transportation";
  if (/kid|baby|school|toy|milk|diaper/.test(lower)) return "Kid";
  if (/electric|water|wifi|internet|phone|smart|cellcard|util|edc/.test(lower))
    return "Utilities";
  if (/clinic|hospital|pharmacy|med|doctor|dent|health/.test(lower))
    return "Medical & Healthcare";
  if (/save|invest|deposit|goal/.test(lower)) return "Saving & Investing";
  if (/shop|cloth|mall|personal|aeon|entertainment/.test(lower))
    return "Personal Spending";
  return "Other";
}

function sanitizeDate(raw: string, fallbackIso: string): string {
  const m = raw.trim().match(/\b(20\d{2}-\d{2}-\d{2})\b/);
  if (m) return m[1]!;
  return fallbackIso;
}

export async function scanReceiptWithGemini({
  imageBase64,
  mimeType,
  defaultAccount = "Personal",
  fallbackDate,
}: {
  imageBase64: string;
  mimeType: string;
  defaultAccount?: "Personal" | "Studio";
  fallbackDate?: string | undefined;
}): Promise<ScannedReceiptResult> {
  const apiKey = process.env["GEMINI_API_KEY"];
  if (!apiKey) {
    const err = new Error(
      "Receipt scanner needs a Gemini API key. Check Settings > Secrets.",
    );
    (err as Error & { status?: number }).status = 503;
    throw err;
  }

  const todayIso =
    fallbackDate && /^\d{4}-\d{2}-\d{2}$/.test(fallbackDate)
      ? fallbackDate
      : new Date().toISOString().slice(0, 10);

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });

  const systemInstruction = `You extract structured bookkeeping transactions from Cambodian and international receipts, KHQR payment confirmations, and mobile banking app screenshots (ABA Bank / ABA Pay, ACLEDA ToanChet, Canadia Bank, Wing, Bakong KHQR, Visa/Mastercard alerts, cafe/restaurant/fuel/grocery receipts, and design software/vendor invoices).

Rules:
1. Extract the exact FINAL TOTAL paid or received as numeric \`amount\` and pick \`currency\` ('USD' or 'KHR'). If the receipt shows KHR (e.g. ៛20,500 or 20,500 KHR), return amount 20500 and currency 'KHR'. If both USD and KHR appear on a dual-currency Cambodian receipt, prefer USD as primary amount.
2. Determine \`txType\`: 'income' ONLY if the slip clearly shows money RECEIVED / credited / salary / incoming transfer ("Transfer Received", "You received", "+$..."); otherwise 'expense'.
3. Determine \`account\`: Default to '${defaultAccount}'. Switch to 'Studio' ONLY if clearly graphic design studio business cost (Adobe, Figma, Framer, fonts, print shop, signage/fabrication, client project vendor); switch to 'Personal' for coffee, food, supermarket, Prius/fuel/car wash, baby/kid, pharmacy, home utility bill, or personal shopping.
4. Pick \`category\` strictly from:
   - If expense & Personal: ${EXPENSE_PERSONAL.join(", ")}
   - If expense & Studio: ${EXPENSE_STUDIO.join(", ")}
   - If income: ${INCOME_SOURCES.join(", ")}
5. Detect \`method\` strictly from: ${ALLOWED_METHODS.join(", ")}. Identify ABA Bank (dark navy/cyan ABA Mobile UI), ACLEDA (navy/gold ToanChet), Canadia Bank (red/navy UI), Bakong KHQR (red KHQR header), Credit/Debit card, or paper Cash receipt.
6. Format \`date\` as YYYY-MM-DD. If no complete date is printed, use '${todayIso}'.
7. Keep \`description\` crisp and human-readable (e.g., "Coffee & pastry at Brown", "ABA KHQR to Lucky Market", "Fuel refill at PTT").`;

  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: SCANNER_MODEL,
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: imageBase64,
              },
            },
            {
              text: `Read this receipt, invoice, or bank slip screenshot and return the transaction JSON. Fallback date if missing: ${todayIso}.`,
            },
          ],
        },
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });

      const rawText = (response.text ?? "").trim();
      if (!rawText) {
        throw new Error("The receipt image returned no readable data.");
      }

      const parsed = JSON.parse(rawText) as Record<string, unknown>;
      const txType = parsed["txType"] === "income" ? "income" : "expense";
      const account = parsed["account"] === "Studio" ? "Studio" : "Personal";
      const currency = parsed["currency"] === "KHR" ? "KHR" : "USD";
      const rawAmount = Number(parsed["amount"]);
      const amount =
        Number.isFinite(rawAmount) && rawAmount > 0
          ? currency === "KHR"
            ? Math.round(rawAmount)
            : Math.round(rawAmount * 100) / 100
          : 0;
      const rawConfidence = parsed["confidence"];
      const confidence =
        rawConfidence === "high" ||
        rawConfidence === "medium" ||
        rawConfidence === "low"
          ? rawConfidence
          : amount > 0
            ? "medium"
            : "low";

      return {
        txType,
        account,
        amount,
        currency,
        date: sanitizeDate(String(parsed["date"] ?? ""), todayIso),
        merchantOrPayer:
          String(parsed["merchantOrPayer"] ?? "").trim() || "Scanned Receipt",
        description:
          String(parsed["description"] ?? "").trim() ||
          String(parsed["merchantOrPayer"] ?? "").trim() ||
          "Scanned transaction",
        method: sanitizeMethod(String(parsed["method"] ?? "")),
        category: sanitizeCategory(
          txType,
          account,
          String(parsed["category"] ?? ""),
        ),
        reference: String(parsed["reference"] ?? "").trim(),
        confidence,
        notes: String(parsed["notes"] ?? "").trim(),
      };
    } catch (err) {
      lastError = err;
      const msg = err instanceof Error ? err.message : String(err);
      const isTransient = /503|502|504|unavailable|timeout|econnreset/i.test(
        msg,
      );
      if (attempt === 0 && isTransient) {
        await new Promise((res) => setTimeout(res, 450));
        continue;
      }
      throw err;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Could not scan receipt image.");
}
