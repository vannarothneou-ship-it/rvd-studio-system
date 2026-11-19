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
  method: "Debit" | "Credit";
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

const ALLOWED_METHODS = ["Debit", "Credit"] as const;

const ALLOWED_IMAGE_MIMES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

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
        "Workspace: 'Personal' for everyday food/fuel/family/medical/utilities/personal transfers, or 'Studio' for graphic design business costs (software, fonts, printing, fabrication, studio equipment, client invoices).",
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
        "Short vendor, store, recipient, or sender name (e.g. 'Brown Coffee', 'Aeon Mall', 'Adobe').",
    },
    description: {
      type: Type.STRING,
      description:
        "Concise 1-line description of what was bought or transferred (max 60 characters).",
    },
    method: {
      type: Type.STRING,
      description:
        "Card / account type: strictly 'Debit' or 'Credit'. Use 'Credit' only if receipt/alert clearly indicates a credit card (Credit / Visa Credit / Mastercard Credit); use 'Debit' for debit cards, bank transfers, KHQR, or receipts without credit card branding.",
    },
    category: {
      type: Type.STRING,
      description:
        "Best matching category from Personal categories, Studio categories, or Income sources depending on txType and account.",
    },
    reference: {
      type: Type.STRING,
      description:
        "Transaction ID, reference code, or receipt number if visible; otherwise empty string.",
    },
    confidence: {
      type: Type.STRING,
      description: "'high', 'medium', or 'low'.",
    },
    notes: {
      type: Type.STRING,
      description:
        "Optional brief context (items summary, remark, or KHR/USD note).",
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
  if (s.includes("credit")) return "Credit";
  const exact = ALLOWED_METHODS.find((m) => m.toLowerCase() === s);
  return exact ?? "Debit";
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
  apiKeyOverride,
}: {
  imageBase64: string;
  mimeType: string;
  defaultAccount?: "Personal" | "Studio";
  fallbackDate?: string | undefined;
  apiKeyOverride?: string | undefined;
}): Promise<ScannedReceiptResult> {
  const apiKey = (
    apiKeyOverride ||
    process.env["GEMINI_API_KEY"] ||
    process.env["GOOGLE_GENERATIVE_AI_API_KEY"] ||
    ""
  ).trim();

  if (!apiKey) {
    const err = new Error(
      "Gemini API key not configured on server. Add GEMINI_API_KEY in Vercel Environment Variables (or AI Studio Settings > Secrets) and redeploy.",
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

  const systemInstruction = `You extract structured bookkeeping transactions from receipts, transfer slips, payment confirmations, and banking screenshots (Visa/Mastercard alerts, cafe/restaurant/fuel/grocery receipts, utilities, and personal transfers).

Rules:
1. Extract the exact FINAL TOTAL paid or received as numeric \`amount\` and pick \`currency\` ('USD' or 'KHR'). If the receipt shows KHR (e.g. ៛20,500 or 20,500 KHR), return amount 20500 and currency 'KHR'. If both USD and KHR appear on a dual-currency Cambodian receipt, prefer USD as primary amount.
2. Determine \`txType\`: 'income' ONLY if the slip clearly shows money RECEIVED / credited / salary / incoming transfer ("Transfer Received", "You received", "+$..."); otherwise 'expense'.
3. Set \`account\` strictly to 'Personal'.
4. Pick \`category\` strictly from:
   - If expense: ${EXPENSE_PERSONAL.join(", ")}
   - If income: ${INCOME_SOURCES.join(", ")}
5. Detect \`method\` strictly as 'Debit' or 'Credit'. Pick 'Credit' only when a credit card is indicated; otherwise pick 'Debit'.
6. Format \`date\` as YYYY-MM-DD. If no complete date is printed, use '${todayIso}'.
7. Keep \`description\` crisp and human-readable (e.g., "Coffee & pastry at Brown", "Groceries at Lucky Market", "Fuel refill at PTT").`;

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
              text: `Read this receipt or payment slip and return the transaction JSON. Fallback date if missing: ${todayIso}.`,
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
      const account: "Personal" | "Studio" =
        defaultAccount === "Studio" ? "Studio" : "Personal";
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

function jsonReply(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function resolveUpstreamStatus(err: unknown): number {
  if (
    typeof err === "object" &&
    err !== null &&
    "status" in err &&
    typeof (err as { status?: unknown }).status === "number"
  ) {
    return (err as { status: number }).status;
  }
  const msg = err instanceof Error ? err.message : String(err);
  if (/API_KEY_INVALID|invalid api key/i.test(msg)) return 400;
  if (/PERMISSION_DENIED|403/i.test(msg)) return 403;
  if (/RESOURCE_EXHAUSTED|429/i.test(msg)) return 429;
  if (/NOT_FOUND|404/i.test(msg)) return 502;
  return 500;
}

export async function handleScanReceiptRequest(
  request: Request,
  env?: unknown,
): Promise<Response> {
  if (request.method !== "POST") {
    return jsonReply({ error: "Method not allowed." }, 405);
  }

  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonReply({ error: "Invalid JSON request body." }, 400);
  }

  const rawBase64 =
    typeof payload["imageBase64"] === "string"
      ? payload["imageBase64"].trim()
      : "";
  const mimeType =
    typeof payload["mimeType"] === "string"
      ? payload["mimeType"].trim().toLowerCase()
      : "image/jpeg";
  const defaultAccount =
    payload["defaultAccount"] === "Studio" ? "Studio" : "Personal";
  const fallbackDate =
    typeof payload["fallbackDate"] === "string"
      ? payload["fallbackDate"]
      : undefined;

  const cleanBase64 = rawBase64.replace(/^data:[^;]+;base64,/i, "");
  if (!cleanBase64 || cleanBase64.length < 32) {
    return jsonReply(
      { error: "Please upload or capture a clear receipt image." },
      400,
    );
  }
  if (cleanBase64.length > 12_000_000) {
    return jsonReply(
      { error: "Image is too large. Please upload an image under 8 MB." },
      413,
    );
  }
  if (!ALLOWED_IMAGE_MIMES.has(mimeType)) {
    return jsonReply(
      { error: "Unsupported image format. Use PNG, JPEG, or WebP." },
      400,
    );
  }

  const envObj =
    typeof env === "object" && env !== null
      ? (env as Record<string, unknown>)
      : undefined;
  const envApiKey =
    typeof envObj?.["GEMINI_API_KEY"] === "string"
      ? envObj["GEMINI_API_KEY"]
      : typeof envObj?.["GOOGLE_GENERATIVE_AI_API_KEY"] === "string"
        ? envObj["GOOGLE_GENERATIVE_AI_API_KEY"]
        : undefined;

  try {
    const result = await scanReceiptWithGemini({
      imageBase64: cleanBase64,
      mimeType: mimeType === "image/jpg" ? "image/jpeg" : mimeType,
      defaultAccount,
      fallbackDate,
      apiKeyOverride: envApiKey,
    });
    return jsonReply({ ok: true, result }, 200);
  } catch (err) {
    console.error("Receipt scan error:", err);
    const status = resolveUpstreamStatus(err);
    const message =
      err instanceof Error && err.message
        ? err.message
        : "Failed to read receipt image.";
    return jsonReply({ error: message }, status);
  }
}
