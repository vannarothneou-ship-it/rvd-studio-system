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
  subtotal?: number;
  tax?: number;
  change?: number;
  depositedAmount?: number;
  receivedAmount?: number;
  ambiguous?: boolean;
  ambiguityReason?: string;
  engine?: "gemini" | "local-ocr";
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

const STUDIO_INCOME_SOURCES = [
  "Client Payment",
  "Retainer",
  "Deposit",
  "Design Fee",
  "Refund",
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
        "Transaction direction: 'expense' for money spent/transferred out/paid, 'income' for salary/deposit/client payment/transfer received.",
    },
    account: {
      type: Type.STRING,
      description:
        "Workspace: 'Personal' for everyday food/fuel/family/medical/utilities/personal transfers, or 'Studio' for graphic design business expenses or studio/client incoming payments.",
    },
    amount: {
      type: Type.NUMBER,
      description:
        "Confirmed FINAL TOTAL transaction amount paid or received as a positive number (e.g. 12.5 or 20500). Never return subtotal, tax, or change when a final grand total exists. Return 0 if unreadable or cut off.",
    },
    currency: {
      type: Type.STRING,
      description: "Currency code: 'USD' or 'KHR'.",
    },
    subtotal: {
      type: Type.NUMBER,
      description: "Printed subtotal before tax/discounts if shown, else 0.",
    },
    tax: {
      type: Type.NUMBER,
      description: "Printed VAT/tax amount if shown separately, else 0.",
    },
    change: {
      type: Type.NUMBER,
      description: "Cash change returned to customer if printed, else 0.",
    },
    depositedAmount: {
      type: Type.NUMBER,
      description:
        "Printed Deposited Amount on bank/remittance slips if shown, else 0.",
    },
    receivedAmount: {
      type: Type.NUMBER,
      description:
        "Printed Receive/Received Amount on bank/remittance slips if shown, else 0.",
    },
    ambiguous: {
      type: Type.BOOLEAN,
      description:
        "True if the final total is cut off, partially cropped, blurry, has missing digits, or shows irreconcilable competing totals.",
    },
    ambiguityReason: {
      type: Type.STRING,
      description:
        "Short explanation when ambiguous is true (e.g. 'Total digits partially cropped' or 'Multiple totals shown'). Empty string otherwise.",
    },
    date: {
      type: Type.STRING,
      description:
        "Transaction date in ISO format YYYY-MM-DD. Use the fallback today date provided in the prompt if no date appears on the receipt.",
    },
    merchantOrPayer: {
      type: Type.STRING,
      description:
        "Short vendor, store, recipient, or sender/client name (e.g. 'Brown Coffee', 'Adobe', 'ACLEDA Client').",
    },
    description: {
      type: Type.STRING,
      description:
        "Concise 1-line description of what was bought or transferred (max 60 characters).",
    },
    method: {
      type: Type.STRING,
      description:
        "Card / account type: strictly 'Debit' or 'Credit'. Use 'Credit' only if receipt/alert clearly indicates a credit card; use 'Debit' for debit cards, bank transfers, KHQR, or cash receipts.",
    },
    category: {
      type: Type.STRING,
      description:
        "Best matching category from Personal expense categories, Studio expense categories, Personal income sources, or Studio income sources depending on txType and account.",
    },
    reference: {
      type: Type.STRING,
      description:
        "Transaction ID, reference code, invoice reference, or receipt number if visible; otherwise empty string.",
    },
    confidence: {
      type: Type.STRING,
      description: "'high', 'medium', or 'low'. Use 'low' if ambiguous.",
    },
    notes: {
      type: Type.STRING,
      description:
        "Optional brief context (items summary, Khmer note, or dual-currency note).",
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
      ? account === "Studio"
        ? STUDIO_INCOME_SOURCES
        : INCOME_SOURCES
      : account === "Studio"
        ? EXPENSE_STUDIO
        : EXPENSE_PERSONAL;

  const exact = list.find((c) => c.toLowerCase() === trimmed.toLowerCase());
  if (exact) return exact;

  const lower = trimmed.toLowerCase();
  if (txType === "income") {
    if (account === "Studio") {
      if (/retainer|monthly/.test(lower)) return "Retainer";
      if (/deposit|advance/.test(lower)) return "Deposit";
      if (/refund|cashback/.test(lower)) return "Refund";
      if (/fee|design|creative/.test(lower)) return "Design Fee";
      if (/client|invoice|payment|transfer|other/.test(lower))
        return "Client Payment";
      return "Client Payment";
    }
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

function sanitizeOptionalPositive(
  val: unknown,
  currency: "USD" | "KHR",
): number | undefined {
  const n = Number(val);
  if (!Number.isFinite(n) || n <= 0) return undefined;
  return currency === "KHR" ? Math.round(n) : Math.round(n * 100) / 100;
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
    const err = new Error("Gemini receipt service is not configured.");
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

  const systemInstruction = `You extract structured bookkeeping transactions from Cambodian and international receipts, POS slips, handwritten notes, bank transfer screenshots (ABA, ACLEDA, Wing, Bakong KHQR), and studio vendor/client slips in Khmer and English.

Rules:
1. Extract the confirmed FINAL TOTAL paid or received as numeric \`amount\` and pick \`currency\` ('USD' or 'KHR'). If dual-currency USD and KHR both appear, prefer USD as primary \`amount\`. Do NOT treat exchange rate lines (e.g. "1 USD = 4,060 KHR"), account numbers, or partial/cut-off digits as the total.
2. Explicitly separate \`subtotal\`, \`tax\`, \`change\`, \`depositedAmount\`, and \`receivedAmount\` into their own fields when printed. Never mistake Cash Change, VAT, or Subtotal for the final total paid unless no grand total line exists.
3. If the total amount is blurry, partially cropped (e.g. "$12."), or shows conflicting totals that do not reconcile, set \`ambiguous\`=true, \`confidence\`='low', explain in \`ambiguityReason\`, and do NOT guess cropped digits.
4. Determine \`txType\`: 'income' ONLY if the slip clearly shows money RECEIVED / credited / incoming transfer ("Transfer Received", "You received", "Deposited amount", "Receive amount", "+$..."); otherwise 'expense'.
5. Workspace \`account\`: Default workspace is '${defaultAccount}'. Keep '${defaultAccount}' unless the slip unmistakably belongs to the other workspace:
   - 'Studio' for graphic design software/subscriptions (Adobe, Figma, Framer), fonts/licenses, commercial printing, signage/acrylic fabrication, studio equipment/freelancers, or studio client invoice/retainer payments.
   - 'Personal' for groceries, coffee/dining, personal fuel/car maintenance, medical, kids, home utilities, or family remittances.
   Never reclassify an incoming Studio client payment as Personal income.
6. Pick \`category\` strictly from:
   - If account='Personal' and txType='expense': ${EXPENSE_PERSONAL.join(", ")}
   - If account='Studio' and txType='expense': ${EXPENSE_STUDIO.join(", ")}
   - If account='Personal' and txType='income': ${INCOME_SOURCES.join(", ")}
   - If account='Studio' and txType='income': ${STUDIO_INCOME_SOURCES.join(", ")}
7. Detect \`method\` strictly as 'Debit' or 'Credit'. Pick 'Credit' only when a credit card is clearly indicated; otherwise pick 'Debit'.
8. Format \`date\` as YYYY-MM-DD. If no complete date is printed, use '${todayIso}'.
9. Keep \`description\` crisp and human-readable (max 60 chars).`;

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
              text: `Read this receipt or payment slip and return the transaction JSON. Active workspace: ${defaultAccount}. Fallback date if missing: ${todayIso}.`,
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
      const parsedAcc = parsed["account"];
      const account: "Personal" | "Studio" =
        parsedAcc === "Studio" || parsedAcc === "Personal"
          ? parsedAcc
          : defaultAccount === "Studio"
            ? "Studio"
            : "Personal";
      const currency: "USD" | "KHR" =
        parsed["currency"] === "KHR" ? "KHR" : "USD";
      const rawAmount = Number(parsed["amount"]);
      const amount =
        Number.isFinite(rawAmount) && rawAmount > 0
          ? currency === "KHR"
            ? Math.round(rawAmount)
            : Math.round(rawAmount * 100) / 100
          : 0;
      const ambiguous = parsed["ambiguous"] === true || amount <= 0;
      const ambiguityReason = String(parsed["ambiguityReason"] ?? "").trim();
      const rawConfidence = parsed["confidence"];
      let confidence: ScannedReceiptResult["confidence"] =
        rawConfidence === "high" ||
        rawConfidence === "medium" ||
        rawConfidence === "low"
          ? rawConfidence
          : amount > 0
            ? "medium"
            : "low";
      if (ambiguous && confidence === "high") {
        confidence = "medium";
      }
      if (amount <= 0) {
        confidence = "low";
      }

      const subtotal = sanitizeOptionalPositive(parsed["subtotal"], currency);
      const tax = sanitizeOptionalPositive(parsed["tax"], currency);
      const change = sanitizeOptionalPositive(parsed["change"], currency);
      const depositedAmount = sanitizeOptionalPositive(
        parsed["depositedAmount"],
        currency,
      );
      const receivedAmount = sanitizeOptionalPositive(
        parsed["receivedAmount"],
        currency,
      );

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
        ...(subtotal !== undefined ? { subtotal } : {}),
        ...(tax !== undefined ? { tax } : {}),
        ...(change !== undefined ? { change } : {}),
        ...(depositedAmount !== undefined ? { depositedAmount } : {}),
        ...(receivedAmount !== undefined ? { receivedAmount } : {}),
        ...(ambiguous ? { ambiguous: true } : {}),
        ...(ambiguityReason ? { ambiguityReason } : {}),
        engine: "gemini",
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

function jsonReply(
  body: unknown,
  status = 200,
  extraHeaders?: Record<string, string>,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...extraHeaders,
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

function safePublicScanError(status: number, err: unknown): string {
  if (status === 503) {
    return "Gemini receipt vision is not configured on the server; using on-device OCR.";
  }
  if (status === 429) {
    return "Receipt vision service is busy right now. Try again shortly or use on-device OCR.";
  }
  if (status === 400 || status === 403 || status === 502) {
    return "Receipt vision could not process this image cleanly.";
  }
  const msg = err instanceof Error ? err.message : "";
  if (
    msg &&
    !/key|token|secret|env|api_key|quota|stack|internal/i.test(msg) &&
    msg.length <= 140
  ) {
    return msg;
  }
  return "Failed to read receipt image with cloud vision.";
}

const RATE_WINDOW_SHORT_MS = 60_000;
const RATE_MAX_SHORT = 15;
const RATE_WINDOW_LONG_MS = 3_600_000;
const RATE_MAX_LONG = 100;
const ipHitsMap = new Map<string, number[]>();

export function resetScanRateLimiterForTests(): void {
  ipHitsMap.clear();
}

function checkRateLimit(clientKey: string, now = Date.now()): number | null {
  const prev = (ipHitsMap.get(clientKey) ?? []).filter(
    (t) => now - t < RATE_WINDOW_LONG_MS,
  );
  const recentShort = prev.filter((t) => now - t < RATE_WINDOW_SHORT_MS);
  if (recentShort.length >= RATE_MAX_SHORT) {
    const oldest = recentShort[0] ?? now;
    return Math.max(
      1,
      Math.ceil((RATE_WINDOW_SHORT_MS - (now - oldest)) / 1000),
    );
  }
  if (prev.length >= RATE_MAX_LONG) {
    const oldest = prev[0] ?? now;
    return Math.max(
      1,
      Math.ceil((RATE_WINDOW_LONG_MS - (now - oldest)) / 1000),
    );
  }
  prev.push(now);
  ipHitsMap.set(clientKey, prev);
  if (ipHitsMap.size > 500) {
    const firstKey = ipHitsMap.keys().next().value;
    if (firstKey) ipHitsMap.delete(firstKey);
  }
  return null;
}

function isAllowedOriginHeader(request: Request): boolean {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const candidate = origin || referer;
  if (!candidate) return true;
  try {
    const parsed = new URL(candidate);
    const host = parsed.hostname.toLowerCase();
    if (host === "localhost" || host === "127.0.0.1") return true;
    if (host.endsWith(".vercel.app") || host.endsWith(".aistudio.google.com")) {
      return true;
    }
    const reqHost = (request.headers.get("host") || "")
      .split(":")[0]
      ?.toLowerCase();
    if (reqHost && host === reqHost) return true;
    try {
      const reqUrlHost = new URL(request.url).hostname.toLowerCase();
      if (reqUrlHost && host === reqUrlHost) return true;
    } catch {
      /* ignore relative request.url */
    }
    return false;
  } catch {
    return false;
  }
}

function decodeBase64Prefix(cleanBase64: string): Uint8Array | null {
  try {
    const snippet = cleanBase64.slice(0, 48).replace(/[^A-Za-z0-9+/=]/g, "");
    if (snippet.length < 16) return null;
    const padded = snippet.slice(0, Math.floor(snippet.length / 4) * 4);
    if (typeof atob === "function") {
      const bin = atob(padded);
      const out = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
      return out;
    }
    if (typeof Buffer !== "undefined") {
      return new Uint8Array(Buffer.from(padded, "base64"));
    }
    return null;
  } catch {
    return null;
  }
}

export function hasValidImageMagicBytes(
  cleanBase64: string,
  mimeType: string,
): boolean {
  const bytes = decodeBase64Prefix(cleanBase64);
  if (!bytes || bytes.length < 12) return false;
  const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const isPng =
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47;
  const isWebp =
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50;
  const isHeif =
    bytes[4] === 0x66 &&
    bytes[5] === 0x74 &&
    bytes[6] === 0x79 &&
    bytes[7] === 0x70;

  if (mimeType === "image/jpeg" || mimeType === "image/jpg") return isJpeg;
  if (mimeType === "image/png") return isPng;
  if (mimeType === "image/webp") return isWebp;
  if (mimeType === "image/heic" || mimeType === "image/heif") return isHeif;
  return isJpeg || isPng || isWebp || isHeif;
}

export async function handleScanReceiptRequest(
  request: Request,
  env?: unknown,
): Promise<Response> {
  if (request.method !== "POST") {
    return jsonReply({ error: "Method not allowed." }, 405);
  }

  if (!isAllowedOriginHeader(request)) {
    return jsonReply({ error: "Origin not permitted." }, 403);
  }

  const envObj =
    typeof env === "object" && env !== null
      ? (env as Record<string, unknown>)
      : undefined;

  const expectedToken =
    typeof envObj?.["SCAN_API_TOKEN"] === "string"
      ? envObj["SCAN_API_TOKEN"].trim()
      : (process.env["SCAN_API_TOKEN"] ?? "").trim();
  if (expectedToken) {
    const provided =
      request.headers.get("x-scan-token") ||
      request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
      "";
    if (provided.trim() !== expectedToken) {
      return jsonReply({ error: "Unauthorized scan request." }, 401);
    }
  }

  const contentType = (request.headers.get("content-type") ?? "").toLowerCase();
  if (!contentType.includes("application/json")) {
    return jsonReply({ error: "Content-Type must be application/json." }, 415);
  }

  const clientIp =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "local";
  const retryAfterSec = checkRateLimit(clientIp);
  if (retryAfterSec !== null) {
    return jsonReply(
      { error: "Too many receipt scan requests. Please wait a moment." },
      429,
      { "retry-after": String(retryAfterSec) },
    );
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
  if (!hasValidImageMagicBytes(cleanBase64, mimeType)) {
    return jsonReply(
      { error: "Image payload does not match a supported image format." },
      400,
    );
  }

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
    return jsonReply({ error: safePublicScanError(status, err) }, status);
  }
}
