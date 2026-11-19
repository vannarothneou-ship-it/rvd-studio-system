import type { ScannedReceiptResult } from "@/lib/receipt-scanner";

export type ReceiptScanMode = "auto" | "khm+eng" | "handwriting";

export interface ReceiptParseContext {
  ownerNames?: string[];
}

const KHMER_DIGITS: Record<string, string> = {
  "០": "0",
  "១": "1",
  "២": "2",
  "៣": "3",
  "៤": "4",
  "៥": "5",
  "៦": "6",
  "៧": "7",
  "៨": "8",
  "៩": "9",
};

const KHMER_MONTHS: Record<string, string> = {
  មករា: "01",
  កុម្ភៈ: "02",
  មីនា: "03",
  មេសា: "04",
  ឧសភា: "05",
  មិថុនា: "06",
  កក្កដា: "07",
  សីហា: "08",
  កញ្ញា: "09",
  តុលា: "10",
  វិច្ឆិកា: "11",
  ធ្នូ: "12",
};

const MONTHS: Record<string, string> = {
  jan: "01",
  january: "01",
  feb: "02",
  february: "02",
  mar: "03",
  march: "03",
  apr: "04",
  april: "04",
  may: "05",
  jun: "06",
  june: "06",
  jul: "07",
  july: "07",
  aug: "08",
  august: "08",
  sep: "09",
  sept: "09",
  september: "09",
  oct: "10",
  october: "10",
  nov: "11",
  november: "11",
  dec: "12",
  december: "12",
};

const BANK_GENERIC_HEADERS = [
  "aba bank",
  "aba mobile",
  "aba pay",
  "acleda",
  "acleda bank",
  "acleda mobile",
  "canadia",
  "canadia bank",
  "wing bank",
  "khqr",
  "bakong",
  "wucv",
  "western union",
  "moneygram",
  "transaction detail",
  "transaction details",
  "transaction receipt",
  "payment successful",
  "transfer successful",
  "transfer completed",
  "completed",
  "successful",
  "call center",
  "receipt",
  "e-receipt",
  "welcome",
  "thank you",
  "វិក្កយបត្រ",
  "បង្កាន់ដៃ",
  "សូមអរគុណ",
  "ការទូទាត់ជោគជ័យ",
  "ព័ត៌មានលម្អិត",
  "អេស៊ីលីដា",
];

const FOREIGN_CURRENCY_REGEX =
  /\b(?:CAD|THB|EUR|GBP|SGD|AUD|JPY|CNY|RMB|VND|MYR|KRW|LAK)\b/i;

export function normalizeKhmerDigits(input: string): string {
  return input
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/[០-៩]/g, (ch) => KHMER_DIGITS[ch] ?? ch)
    .replace(/។/g, ".")
    .replace(/[៖：]/g, ":");
}

function stripLogoGlyphNoise(line: string): string {
  // OCR often reads bank emblem/logo beside English titles like "Transaction Detail" as a stray Khmer or Latin char ("ម Transaction Detail")
  return line
    .replace(
      /^[^\w\u1780-\u17FF]{0,3}[\u1780-\u17FF]{1,2}\s+(?=[A-Za-z]{3,})/,
      "",
    )
    .replace(/^[^A-Za-z0-9\u1780-\u17FF$៛+-]+\s*/, "")
    .trim();
}

function smartTitleCase(name: string): string {
  const clean = name.replace(/\s+/g, " ").trim();
  if (!clean) return clean;
  // Only reformat if all uppercase Latin (e.g., "VANNARY NEOU" -> "Vannary Neou")
  if (/^[A-Z0-9\s.'-]+$/.test(clean) && /[A-Z]{2,}/.test(clean)) {
    return clean.toLowerCase().replace(/\b([a-z])/g, (ch) => ch.toUpperCase());
  }
  return clean;
}

function isGenericHeaderLine(line: string): boolean {
  const stripped = stripLogoGlyphNoise(line).toLowerCase();
  if (!stripped) return true;
  if (
    BANK_GENERIC_HEADERS.some(
      (h) =>
        stripped === h ||
        stripped.startsWith(`${h} `) ||
        stripped.endsWith(` ${h}`),
    )
  ) {
    return true;
  }
  if (/^call\s*center/i.test(stripped)) return true;
  if (/^(?:0\d{1,2}[\s-]?\d{3}[\s-]?\d{3,4}(?:\s*\|\s*)?)+$/.test(stripped)) {
    return true;
  }
  return false;
}

interface StructuredSlipFields {
  depositedAmountLine?: string;
  receiveAmountLine?: string;
  sentAmountLine?: string;
  receiver?: string;
  sender?: string;
  purpose?: string;
  relationship?: string;
  fromCountry?: string;
  reference?: string;
  hasColonFormat: boolean;
  isRemittanceSlip: boolean;
}

function extractStructuredFields(normalized: string): StructuredSlipFields {
  const lines = normalized
    .split(/\r?\n/)
    .map((l) => stripLogoGlyphNoise(l.replace(/\s+/g, " ").trim()))
    .filter(Boolean);

  const fields: StructuredSlipFields = {
    hasColonFormat: false,
    isRemittanceSlip:
      /\b(?:wucv|western\s*union|moneygram|mtcn|from\s*country|sent\s*amount|receive\s*amount|deposited\s*amount|remittance)\b/i.test(
        normalized,
      ),
  };

  let colonCount = 0;

  for (const line of lines) {
    if (line.includes(":")) colonCount++;

    const kv = line.match(/^([A-Za-z\u1780-\u17FF/\s().-]{2,36}?)\s*:\s*(.+)$/);
    if (!kv) {
      if (/^deposited\s+amount\b/i.test(line))
        fields.depositedAmountLine = line;
      else if (/^receiv(?:e|ed)\s+amount\b/i.test(line))
        fields.receiveAmountLine = line;
      else if (/^sent\s+amount\b/i.test(line)) fields.sentAmountLine = line;
      continue;
    }

    const rawKey = kv[1]!.trim().toLowerCase();
    const val = kv[2]!.trim();
    if (!val) continue;

    if (/deposited\s*amount|deposit\s*amount/.test(rawKey)) {
      fields.depositedAmountLine = line;
    } else if (/receiv(?:e|ed)\s*amount/.test(rawKey)) {
      fields.receiveAmountLine = line;
    } else if (/sent\s*amount/.test(rawKey)) {
      fields.sentAmountLine = line;
    } else if (
      /^(?:receiver|recipient|beneficiary|paid\s*to|to|អ្នកទទួល)$/.test(rawKey)
    ) {
      if (!fields.receiver) fields.receiver = val;
    } else if (/^(?:sender|remitter|payer|sent\s*by|អ្នកផ្ញើ)$/.test(rawKey)) {
      if (!fields.sender) fields.sender = val;
    } else if (/^from$/.test(rawKey) && !/country|date|bank/.test(rawKey)) {
      if (!fields.sender) fields.sender = val;
    } else if (/^from\s*country$/.test(rawKey)) {
      fields.fromCountry = val;
    } else if (
      /^(?:purpose|reason|remark|note|memo|description|គោលបំណង)$/.test(rawKey)
    ) {
      if (!fields.purpose) fields.purpose = val;
    } else if (/sender\s*is\s*my|relationship/.test(rawKey)) {
      fields.relationship = val;
    } else if (/^(?:completed|ref|reference|trx\.?\s*id|trace)$/.test(rawKey)) {
      const refM = val.match(/(?:ref\.?\s*[:#-]?\s*)?([A-Z0-9-]{5,24})/i);
      if (refM?.[1]) {
        fields.reference = refM[1].trim();
      }
    } else if (rawKey === "mtcn" && !fields.reference) {
      const mtcnM = val.match(/([A-Z0-9-]{5,24})/i);
      if (mtcnM?.[1]) fields.reference = mtcnM[1].trim();
    }
  }

  fields.hasColonFormat = colonCount >= 3;
  return fields;
}

function ownerMatchesParty(
  partyName: string | undefined,
  ownerNames: string[] | undefined,
): boolean {
  if (!partyName || !ownerNames?.length) return false;
  const partyTokens = partyName
    .toLowerCase()
    .split(/[^a-z\u1780-\u17FF]+/)
    .filter((t) => t.length >= 3);
  if (partyTokens.length === 0) return false;

  for (const rawOwner of ownerNames) {
    const ownerClean = rawOwner.trim().toLowerCase();
    if (!ownerClean || ownerClean.length < 3) continue;
    const ownerTokens = ownerClean
      .split(/[^a-z\u1780-\u17FF]+/)
      .filter((t) => t.length >= 3);
    if (ownerTokens.length === 0) continue;

    const overlap = ownerTokens.filter((ot) => partyTokens.includes(ot));
    if (
      overlap.length >= 2 ||
      (ownerTokens.length === 1 &&
        ownerTokens[0]!.length >= 4 &&
        overlap.length === 1)
    ) {
      return true;
    }
  }
  return false;
}

function extractDateFromText(raw: string, fallbackDate: string): string {
  const norm = normalizeKhmerDigits(raw);

  // YYYY-MM-DD or YYYY/MM/DD
  const iso = norm.match(
    /\b(20\d{2})[-/.](0?[1-9]|1[0-2])[-/.](0?[1-9]|[12]\d|3[01])\b/,
  );
  if (iso) {
    return `${iso[1]}-${iso[2]!.padStart(2, "0")}-${iso[3]!.padStart(2, "0")}`;
  }

  // DD/MM/YYYY or DD-MM-YYYY
  const dmy = norm.match(
    /\b(0?[1-9]|[12]\d|3[01])[-/.](0?[1-9]|1[0-2])[-/.](20\d{2})\b/,
  );
  if (dmy) {
    return `${dmy[3]}-${dmy[2]!.padStart(2, "0")}-${dmy[1]!.padStart(2, "0")}`;
  }

  // DD/MM/YY (very common on handwritten Khmer & POS receipts)
  const dmy2 = norm.match(
    /\b(0?[1-9]|[12]\d|3[01])[-/.](0?[1-9]|1[0-2])[-/.](\d{2})\b/,
  );
  if (dmy2) {
    return `20${dmy2[3]}-${dmy2[2]!.padStart(2, "0")}-${dmy2[1]!.padStart(2, "0")}`;
  }

  // Khmer month format: e.g. "18 វិច្ឆិកា 2026" or "ថ្ងៃទី 18 ខែ វិច្ឆិកា ឆ្នាំ 2026"
  for (const [khMon, mm] of Object.entries(KHMER_MONTHS)) {
    const khRe = new RegExp(
      `(?:ថ្ងៃទី\\s*)?(0?[1-9]|[12]\\d|3[01])\\s*(?:ខែ\\s*)?${khMon}\\s*(?:ឆ្នាំ\\s*)?(20\\d{2})`,
    );
    const km = norm.match(khRe);
    if (km) {
      return `${km[2]}-${mm}-${km[1]!.padStart(2, "0")}`;
    }
  }

  // DD MMM YYYY (e.g., 18 Nov 2026)
  const dMonY = norm.match(
    /\b(0?[1-9]|[12]\d|3[01])\s+([A-Za-z]{3,9})[,\s]+(20\d{2})\b/i,
  );
  if (dMonY) {
    const m = MONTHS[dMonY[2]!.toLowerCase()];
    if (m) return `${dMonY[3]}-${m}-${dMonY[1]!.padStart(2, "0")}`;
  }

  // MMM DD, YYYY (e.g., Nov 18, 2026)
  const monDY = norm.match(
    /\b([A-Za-z]{3,9})\s+(0?[1-9]|[12]\d|3[01])[,\s]+(20\d{2})\b/i,
  );
  if (monDY) {
    const m = MONTHS[monDY[1]!.toLowerCase()];
    if (m) return `${monDY[3]}-${m}-${monDY[2]!.padStart(2, "0")}`;
  }

  return fallbackDate;
}

function parseNumberStr(raw: string): number {
  const norm = normalizeKhmerDigits(raw);
  const cleaned = norm.replace(/,/g, "").replace(/\s+/g, "").trim();
  const n = Number(cleaned);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function looksLikeAccountOrIdToken(rawToken: string): boolean {
  const compact = rawToken.replace(/[,\s]/g, "");
  // Bank account numbers often start with 0 without decimal: e.g. "USD 017493196" or "USD 00412345"
  if (/^0\d{3,}$/.test(compact)) return true;
  // Unformatted 7+ digit IDs without commas or decimals (e.g. MTCN 6814030769)
  if (
    !rawToken.includes(".") &&
    !rawToken.includes(",") &&
    compact.length >= 7
  ) {
    return true;
  }
  return false;
}

interface AmountCandidate {
  amount: number;
  currency: "USD" | "KHR";
  score: number;
  sourceRaw: string;
  line: string;
  isColonArtifactVariant?: boolean;
  isSuspiciousLeadingOne?: boolean;
}

function extractAmountAndCurrency(
  raw: string,
  fields: StructuredSlipFields,
): {
  amount: number;
  currency: "USD" | "KHR";
  ambiguous: boolean;
} {
  const norm = normalizeKhmerDigits(raw);
  const lines = norm
    .split(/\r?\n/)
    .map((l) => stripLogoGlyphNoise(l.trim()))
    .filter(Boolean);

  const candidates: AmountCandidate[] = [];

  for (const line of lines) {
    const lower = line.toLowerCase();

    // Skip lines that are clearly account IDs, phone numbers, MTCN, references, or timestamps
    const isIdOrMetaLine =
      /\b(tel|phone|call\s*center|acc(?:ount)?|card\s*no|mtcn|trx|ref|trace|id|time|date|occupation|from\s*country)\b|លេខទូរស័ព្ទ|ទូរស័ព្ទ/.test(
        lower,
      ) &&
      !/total|ttl|amount|amt|paid|sum|deposited|receiv|sent\s*amount|សរុប|ថ្លៃ/.test(
        lower,
      );
    if (isIdOrMetaLine) continue;

    // Skip account-number lines immediately under Receiver (e.g., "USD 017493196")
    if (/^(?:USD|KHR)\s+0\d{5,}$/i.test(line)) continue;

    // Skip foreign remittance sent amounts (e.g. "Sent amount : 460.00 CAD")
    const isSentLine = /\bsent\s*amount\b/i.test(lower);
    if (FOREIGN_CURRENCY_REGEX.test(line)) {
      continue;
    }

    const isPrimaryBankAmount =
      /\b(?:deposited\s*amount|receiv(?:e|ed)\s*amount)\b/i.test(lower);
    const isGrandTotal =
      /grand\s*total|total\s*paid|total\s*amount|net\s*amount|សរុបរួម|ប្រាក់សរុប|ថ្លៃសរុប|សរុបទាំងអស់/.test(
        lower,
      );
    const isTotalLine =
      isPrimaryBankAmount ||
      /\btotal\b|\bttl\b|\bamount\b|\bamt\b|\bpaid\b|\bpayment\b|\btransfer\b|\bsum\b|សរុប|ទឹកប្រាក់|តម្លៃ|បង់ប្រាក់|ទទួលប្រាក់|ថ្លៃ/.test(
        lower,
      );

    const lineBoost = isPrimaryBankAmount
      ? 58
      : isGrandTotal
        ? 50
        : isSentLine
          ? -25
          : isTotalLine
            ? 32
            : /subtotal|balance|fee|ប្រាក់អាប់/.test(lower)
              ? 4
              : 12;

    // Detect whether a label-to-value colon was lost on a colon-formatted slip (common OCR ":" -> "1" failure)
    const missingColonOnColonSlip =
      fields.hasColonFormat && isPrimaryBankAmount && !line.includes(":");

    let matchedCurrencyOnLine = false;

    // 1. Explicit USD patterns: $12.50, $18.5, -$14.50, USD 12.50, 12.50 USD, US$ 12.50
    const usdRegex =
      /(?:[-+]?\s*(?:US\$|\$|USD|ដុល្លារ)\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?))|(?:([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)\s*(?:USD\b|\$|ដុល្លារ))/gi;
    for (const m of line.matchAll(usdRegex)) {
      const token = (m[1] || m[2] || "").trim();
      if (!token || looksLikeAccountOrIdToken(token)) continue;
      const val = parseNumberStr(token);
      if (val > 0 && val < 500_000) {
        matchedCurrencyOnLine = true;
        const rounded = Math.round(val * 100) / 100;
        const baseScore = lineBoost + 36 + (m[0].includes(".") ? 10 : 0);

        // Guard: If OCR merged ":" into a leading "1" (e.g. ": 300.90" -> "1300.90" with no comma),
        // add a recovered candidate "300.90" and down-rank the suspicious uncomma'd 4-digit value when colon was lost
        const suspiciousLeadingOne =
          !token.includes(",") &&
          /^1\d{3}(?:\.\d{1,2})?$/.test(token) &&
          (missingColonOnColonSlip || isPrimaryBankAmount || isTotalLine);

        candidates.push({
          amount: rounded,
          currency: "USD",
          score:
            missingColonOnColonSlip && suspiciousLeadingOne
              ? baseScore - 20
              : baseScore,
          sourceRaw: token,
          line,
          isSuspiciousLeadingOne: suspiciousLeadingOne,
        });

        if (suspiciousLeadingOne) {
          const stripped = parseNumberStr(token.slice(1));
          if (stripped > 0) {
            candidates.push({
              amount: Math.round(stripped * 100) / 100,
              currency: "USD",
              score: missingColonOnColonSlip ? baseScore + 6 : baseScore - 14,
              sourceRaw: token.slice(1),
              line,
              isColonArtifactVariant: true,
            });
          }
        }
      }
    }

    // 2. Explicit KHR patterns: 20,500 KHR, KHR 20,500, ៛20,500, 24,500 រៀល, 15000r
    const khrRegex =
      /(?:(?:KHR|៛)\s*([0-9]{1,3}(?:[,\s][0-9]{3})+|[0-9]{3,9}))|(?:([0-9]{1,3}(?:[,\s][0-9]{3})+|[0-9]{3,9})\s*(?:KHR|Riels?|រៀល|រៀស|៛|r\b))/gi;
    for (const m of line.matchAll(khrRegex)) {
      const token = (m[1] || m[2] || "").trim();
      if (!token || looksLikeAccountOrIdToken(token)) continue;
      const val = parseNumberStr(token);
      if (val >= 100 && val < 500_000_000) {
        matchedCurrencyOnLine = true;
        candidates.push({
          amount: Math.round(val),
          currency: "KHR",
          score: lineBoost + 28,
          sourceRaw: token,
          line,
        });
      }
    }

    // 3. Decimal currency-like fallback on total/amount lines without explicit currency symbol (e.g. "Total 14.5")
    if (isTotalLine && !isSentLine && !matchedCurrencyOnLine) {
      const decRegex = /\b([0-9]{1,5}\.[0-9]{1,2})\b/g;
      for (const m of line.matchAll(decRegex)) {
        const token = m[1] || "";
        const val = parseNumberStr(token);
        if (val > 0 && val < 100_000) {
          candidates.push({
            amount: Math.round(val * 100) / 100,
            currency: "USD",
            score: lineBoost + 22,
            sourceRaw: token,
            line,
          });
        }
      }

      // Handwritten Khmer large integer on total line without currency symbol (e.g. "សរុប 24000")
      const largeIntRegex = /\b([0-9]{1,3}(?:,[0-9]{3})+|[0-9]{4,7})\b/g;
      for (const m of line.matchAll(largeIntRegex)) {
        const rawNum = m[1] || "";
        if (rawNum.includes(".") || looksLikeAccountOrIdToken(rawNum)) continue;
        const val = parseNumberStr(rawNum);
        if (val >= 500 && val % 100 === 0 && val < 50_000_000) {
          candidates.push({
            amount: Math.round(val),
            currency: "KHR",
            score: lineBoost + 18,
            sourceRaw: rawNum,
            line,
          });
        }
      }
    }
  }

  if (candidates.length === 0) {
    // Broad fallback: any decimal amount in non-foreign text (e.g. 5.50 or 18.5)
    const filteredText = lines
      .filter((l) => !FOREIGN_CURRENCY_REGEX.test(l))
      .join("\n");
    const decMatches = Array.from(
      filteredText.matchAll(/\b([0-9]{1,4}\.[0-9]{1,2})\b/g),
    )
      .map((m) => parseNumberStr(m[1] || ""))
      .filter((n) => n > 0 && n < 50_000);
    if (decMatches.length > 0) {
      return {
        amount: Math.round(Math.max(...decMatches) * 100) / 100,
        currency: "USD",
        ambiguous: decMatches.length > 1,
      };
    }

    // Broad KHR integer fallback (e.g. handwritten "15000")
    const khrMatches = Array.from(filteredText.matchAll(/\b([0-9]{4,7})\b/g))
      .filter((m) => !looksLikeAccountOrIdToken(m[1] || ""))
      .map((m) => parseNumberStr(m[1] || ""))
      .filter((n) => n >= 500 && n % 100 === 0 && n < 10_000_000);
    if (khrMatches.length > 0) {
      return {
        amount: Math.max(...khrMatches),
        currency: "KHR",
        ambiguous: khrMatches.length > 1,
      };
    }

    return { amount: 0, currency: "USD", ambiguous: false };
  }

  // Consensus aggregation: exact amounts appearing across multiple lines (e.g. Deposited amount + Receive amount)
  // gain strong confidence, and recovered colon variants reinforce clean exact matches!
  const aggregateByValue = (currency: "USD" | "KHR") => {
    const map = new Map<
      number,
      {
        amount: number;
        bestScore: number;
        totalScore: number;
        directHits: number;
        cleanDirectHits: number;
        totalHits: number;
      }
    >();

    for (const c of candidates) {
      if (c.currency !== currency) continue;
      const cur = map.get(c.amount) ?? {
        amount: c.amount,
        bestScore: -Infinity,
        totalScore: 0,
        directHits: 0,
        cleanDirectHits: 0,
        totalHits: 0,
      };
      cur.bestScore = Math.max(cur.bestScore, c.score);
      cur.totalScore += Math.max(0, c.score);
      if (!c.isColonArtifactVariant) {
        cur.directHits += 1;
        if (!c.isSuspiciousLeadingOne) cur.cleanDirectHits += 1;
      }
      cur.totalHits += 1;
      map.set(c.amount, cur);
    }

    return Array.from(map.values())
      .map((item) => {
        const consensusBonus =
          (item.cleanDirectHits >= 2 ? 38 : 0) +
          (item.totalHits >= 2 && item.cleanDirectHits >= 1 ? 26 : 0) +
          (item.totalHits >= 2 &&
          item.cleanDirectHits === 0 &&
          item.directHits === 0
            ? 18
            : 0);
        return {
          ...item,
          finalScore: item.bestScore + consensusBonus,
        };
      })
      .sort(
        (a, b) =>
          b.finalScore - a.finalScore ||
          b.directHits - a.directHits ||
          b.amount - a.amount,
      );
  };

  const usdRanked = aggregateByValue("USD");
  const khrRanked = aggregateByValue("KHR");
  const bestUsd = usdRanked[0];
  const bestKhr = khrRanked[0];

  if (bestUsd && (!bestKhr || bestUsd.finalScore >= bestKhr.finalScore - 5)) {
    const runnerUp = usdRanked[1];
    const ambiguous = Boolean(
      runnerUp &&
      runnerUp.directHits > 0 &&
      Math.abs(bestUsd.finalScore - runnerUp.finalScore) < 12,
    );
    return { amount: bestUsd.amount, currency: "USD", ambiguous };
  }
  if (bestKhr) {
    return { amount: bestKhr.amount, currency: "KHR", ambiguous: false };
  }
  return { amount: 0, currency: "USD", ambiguous: false };
}

function detectCategory(
  txType: "expense" | "income",
  text: string,
  fields: StructuredSlipFields,
): string {
  // Exclude purpose label noise when checking if income vs expense, but DO use purpose for category!
  const lower = text.toLowerCase();
  const purposeLower =
    `${fields.purpose ?? ""} ${fields.relationship ?? ""}`.toLowerCase();

  if (txType === "income") {
    if (/salary|payroll|wage|monthly\s*pay|ប្រាក់ខែ|ប្រាក់បៀវត្ស/.test(lower)) {
      return "Salary";
    }
    if (/studio\s*draw|owner\s*draw/.test(lower)) return "Studio Draw";
    if (/freelance|client|invoice|design|retainer|រចនា/.test(lower)) {
      return "Freelance";
    }
    if (/bonus|incentive|reward|ប្រាក់រង្វាន់/.test(lower)) return "Bonus";
    if (/invest|dividend|interest|ការប្រាក់/.test(lower)) return "Investment";
    if (
      /family|relative|friend|gift|refund|cashback|remittance|អំណោយ|សងប្រាក់|គ្រួសារ/.test(
        `${lower} ${purposeLower}`,
      )
    ) {
      return "Gift & Refund";
    }
    return "Other";
  }

  if (
    /ptt|tela|totalenergies|sokimex|caltex|fuel|gasoline|petrol|diesel|prius|car\s*wash|garage|tire|engine\s*oil|សាំង|ប្រេង|ចាក់សាំង|លាងឡាន|ជួសជុលឡាន|កង់ឡាន/.test(
      lower,
    )
  ) {
    return "Prius 2012";
  }
  if (
    /brown|tube\s*coffee|starbucks|amazon|koi|gong\s*cha|coffee|cafe|tea|pizza|burger|kfc|lucky|makro|chip\s*mong|smile|restaurant|bakery|food|noodle|rice|nham24|foodpanda|wownow|kitchen|bistro|mart|lunch|dinner|breakfast|drink|latte|កាហ្វេ|បាយ|ម្ហូប|គុយទាវ|មី|នំ|ភេសជ្ជៈ|អាហារ|ផ្សារ|ហាង/.test(
      lower,
    )
  ) {
    return "Food";
  }
  if (
    /grab|passapp|tada|taxi|tuk|bus|toll|parking|expressway|highway|transport|តាក់ស៊ី|កង់បី|រ៉ឺម៉ក|ផ្លូវល្បឿនលឿន|ចំណត/.test(
      lower,
    )
  ) {
    return "Transportation";
  }
  if (
    /edc|ppwsa|electricity|water\s*supply|wifi|internet|smart|cellcard|metfone|ezecom|sinet|mekongnet|top\s*up|utility|utilities|ភ្លើង|អគ្គិសនី|ទឹកស្អាត|អ៊ីនធឺណិត|កាតទូរស័ព្ទ/.test(
      lower,
    )
  ) {
    return "Utilities";
  }
  if (
    /pharmacy|clinic|hospital|calmette|ucare|dental|doctor|medicine|medical|health|ពេទ្យ|ថ្នាំ|មន្ទីរពេទ្យ|ឱសថ/.test(
      lower,
    )
  ) {
    return "Medical & Healthcare";
  }
  if (
    /school|tuition|baby|milk|diaper|kid|toy|pediatric|កូន|សាលា|ទឹកដោះគោ|ខោទឹកនោម/.test(
      lower,
    )
  ) {
    return "Kid";
  }
  // Avoid matching generic banking word "Deposited amount" on transfer slips as Saving & Investing
  if (
    /\b(?:saving|savings|invest|investment|fixed\s*deposit|term\s*deposit|goal)\b|សន្សំ|វិនិយោគ/.test(
      lower,
    )
  ) {
    return "Saving & Investing";
  }
  if (
    /aeon|mall|zara|uniqlo|cloth|shoes|cinema|legend|salon|gym|សម្លៀកបំពាក់|ស្បែកជើង|កាត់សក់|កុន/.test(
      lower,
    )
  ) {
    return "Personal Spending";
  }
  return "Other";
}

function hasReadableLetters(s: string): boolean {
  return /[A-Za-z\u1780-\u17D3]/.test(s);
}

function extractMerchantOrPayer(
  raw: string,
  txType: "expense" | "income",
  fields: StructuredSlipFields,
  ownerNames: string[] | undefined,
): string {
  // 1. Structured accountant counterparty priority:
  //    - Income: Sender / Remitter / From (not From country)
  //    - Expense: Receiver / Merchant / Paid to (provided it's not the user's own name)
  if (txType === "income") {
    if (fields.sender && !ownerMatchesParty(fields.sender, ownerNames)) {
      return smartTitleCase(fields.sender).slice(0, 48);
    }
  } else {
    if (fields.receiver && !ownerMatchesParty(fields.receiver, ownerNames)) {
      return smartTitleCase(fields.receiver).slice(0, 48);
    }
  }

  const lines = raw
    .split(/\r?\n/)
    .map((l) => stripLogoGlyphNoise(l.replace(/\s+/g, " ").trim()))
    .filter((l) => l.length >= 2);

  // 2. Check explicit English or Khmer merchant/payer label lines
  for (const line of lines) {
    const m = line.match(
      /^(?:to|merchant|recipient|paid\s*to|vendor|beneficiary|sender|from|store|ជូនចំពោះ|អ្នកទទួល|អ្នកផ្ញើ|ហាង|ពី|ឈ្មោះ|ហាងកាហ្វេ)\s*[:៖-]\s*(.+)$/i,
    );
    if (m && m[1]) {
      if (/^from\s*country\b/i.test(line)) continue;
      const cleaned = m[1].trim();
      if (
        cleaned.length >= 2 &&
        !/^[\d\s\-*.]+$/.test(cleaned) &&
        !ownerMatchesParty(cleaned, ownerNames)
      ) {
        return smartTitleCase(cleaned).slice(0, 48);
      }
    }
  }

  // 3. Pick the first clean descriptive line (supports English + Khmer script)
  for (const line of lines.slice(0, 12)) {
    if (isGenericHeaderLine(line)) continue;
    if (/^[-+$៛\d.,\s:/០-៩|]+$/.test(line)) continue;
    if (/^\d{2,}/.test(line) && !hasReadableLetters(line)) continue;
    if (/^(?:USD|KHR)\s+\d{5,}$/i.test(line)) continue;
    if (line.length >= 2 && hasReadableLetters(line)) {
      return smartTitleCase(line).slice(0, 48);
    }
  }

  return "Scanned Slip";
}

function extractReference(raw: string, fields: StructuredSlipFields): string {
  if (fields.reference) return fields.reference;
  const norm = normalizeKhmerDigits(raw);
  const m = norm.match(
    /(?:trx\.?\s*id|ref(?:erence)?\.?\s*(?:no|#)?|trace(?:\s*no)?|receipt\s*(?:no|#)|mtcn|លេខយោង)\s*[:.#-]?\s*([A-Z0-9-]{4,24})/i,
  );
  return m?.[1]?.trim() ?? "";
}

export function parseReceiptText(
  ocrText: string,
  fallbackDate: string,
  context?: ReceiptParseContext,
): ScannedReceiptResult {
  const cleaned = ocrText.trim();
  const normalized = normalizeKhmerDigits(cleaned);
  const fields = extractStructuredFields(normalized);
  const ownerNames = context?.ownerNames;

  // Strip Purpose/Note/Remark text before checking expense vs income direction
  // so "Purpose : Family Expense" never overrides an inbound remittance/deposit!
  const directionText = normalized
    .split(/\r?\n/)
    .filter(
      (line) =>
        !/^\s*(?:purpose|reason|remark|note|memo|occupation)\s*[:៖-]/i.test(
          line,
        ),
    )
    .join("\n")
    .toLowerCase();

  const receiverIsOwner = ownerMatchesParty(fields.receiver, ownerNames);
  const senderIsOwner = ownerMatchesParty(fields.sender, ownerNames);

  const hasStrongIncomeSignal =
    /transfer\s*received|you\s*received|received\s*amount|receive\s*amount|deposited\s*amount|cash\s*in|credited|incoming\s*transfer|salary\s*credited|\+\s*\$|ទទួលប្រាក់|ផ្ទេរចូល|ប្រាក់ខែ|ដាក់ប្រាក់ចូល/.test(
      directionText,
    ) ||
    (receiverIsOwner && !senderIsOwner);

  const txType: "expense" | "income" = hasStrongIncomeSignal
    ? "income"
    : "expense";

  const method: "Debit" | "Credit" =
    /credit\s*card|visa\s*credit|mastercard\s*credit|credit\s*limit|credit\s*acc|កាតឥណទាន/.test(
      normalized.toLowerCase(),
    )
      ? "Credit"
      : "Debit";

  const { amount, currency, ambiguous } = extractAmountAndCurrency(
    normalized,
    fields,
  );
  const date = extractDateFromText(normalized, fallbackDate);
  const merchantOrPayer = extractMerchantOrPayer(
    cleaned,
    txType,
    fields,
    ownerNames,
  );
  const category = detectCategory(txType, normalized, fields);
  const reference = extractReference(normalized, fields);

  let description = "";
  if (fields.purpose && merchantOrPayer !== "Scanned Slip") {
    const suffix = fields.fromCountry ? ` · ${fields.fromCountry}` : "";
    description = `${fields.purpose}${suffix}`.slice(0, 60);
  } else if (fields.purpose) {
    description = fields.purpose.slice(0, 60);
  } else if (merchantOrPayer !== "Scanned Slip") {
    description = merchantOrPayer;
  } else if (category !== "Other") {
    description = `${category} ${txType}`;
  } else {
    description = "Receipt scan";
  }

  const confidence: ScannedReceiptResult["confidence"] =
    amount > 0 && merchantOrPayer !== "Scanned Slip" && !ambiguous
      ? "high"
      : amount > 0
        ? "medium"
        : "low";

  return {
    txType,
    account: "Personal",
    amount,
    currency,
    date,
    merchantOrPayer,
    description,
    method,
    category,
    reference,
    confidence,
    notes: cleaned ? "Scanned locally on device (no API)" : "",
  };
}

/**
 * Classifies whether an image is a crisp digital app screenshot (e.g. ACLEDA/ABA/Wing)
 * vs an angled/shadowed paper camera photo so screenshots avoid destructive binarization.
 */
function classifyImageProfile(
  luma: Uint8ClampedArray,
  w: number,
  h: number,
): { isDigitalScreenshot: boolean; isDarkTheme: boolean } {
  const stepX = Math.max(1, Math.floor(w / 60));
  const stepY = Math.max(1, Math.floor(h / 60));
  let count = 0;
  let sum = 0;
  let nearWhite = 0;
  let nearBlack = 0;

  for (let y = 0; y < h; y += stepY) {
    for (let x = 0; x < w; x += stepX) {
      const v = luma[y * w + x]!;
      sum += v;
      if (v >= 234) nearWhite++;
      else if (v <= 38) nearBlack++;
      count++;
    }
  }

  const avg = sum / Math.max(1, count);
  const isDarkTheme = avg < 115;
  const dominantBgRatio =
    (isDarkTheme ? nearBlack : nearWhite) / Math.max(1, count);

  return {
    isDigitalScreenshot: dominantBgRatio >= 0.56,
    isDarkTheme,
  };
}

/**
 * Estimates skew angle (-22° to +22°) using horizontal projection profile variance
 * on a fast downsampled grayscale buffer. Dark ink on light background scores highest
 * variance when text lines sit perfectly horizontal.
 */
export function estimateSkewAngleDeg(
  luma: Uint8ClampedArray,
  width: number,
  height: number,
): number {
  const targetW = Math.min(200, width);
  const scale = targetW / Math.max(1, width);
  const w = Math.max(16, Math.round(width * scale));
  const h = Math.max(16, Math.round(height * scale));
  const small = new Float32Array(w * h);

  for (let y = 0; y < h; y++) {
    const sy = Math.min(height - 1, Math.floor(y / scale));
    for (let x = 0; x < w; x++) {
      const sx = Math.min(width - 1, Math.floor(x / scale));
      small[y * w + x] = Math.max(0, 255 - luma[sy * width + sx]!);
    }
  }

  const cx = w / 2;
  const cy = h / 2;

  const scoreAngle = (deg: number) => {
    const rad = (deg * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const rows = new Float64Array(h);

    for (let y = 2; y < h - 2; y += 2) {
      const dy = y - cy;
      for (let x = 2; x < w - 2; x += 2) {
        const dx = x - cx;
        const rx = Math.round(cx + dx * cos - dy * sin);
        const ry = Math.round(cy + dx * sin + dy * cos);
        if (rx >= 0 && rx < w && ry >= 0 && ry < h) {
          rows[ry] = (rows[ry] ?? 0) + small[y * w + x]!;
        }
      }
    }

    let mean = 0;
    let active = 0;
    for (let i = 0; i < h; i++) {
      if (rows[i]! > 0) {
        mean += rows[i]!;
        active++;
      }
    }
    if (active < 4) return 0;
    mean /= active;
    let variance = 0;
    for (let i = 0; i < h; i++) {
      if (rows[i]! > 0) {
        const d = rows[i]! - mean;
        variance += d * d;
      }
    }
    return variance / active;
  };

  let bestAngle = 0;
  let bestScore = -1;
  for (let a = -22; a <= 22; a += 2) {
    const s = scoreAngle(a);
    if (s > bestScore) {
      bestScore = s;
      bestAngle = a;
    }
  }

  const refineStart = Math.max(-24, bestAngle - 2);
  const refineEnd = Math.min(24, bestAngle + 2);
  for (let a = refineStart; a <= refineEnd; a += 0.5) {
    const s = scoreAngle(a);
    if (s > bestScore) {
      bestScore = s;
      bestAngle = a;
    }
  }

  const zeroScore = scoreAngle(0);
  if (Math.abs(bestAngle) < 1.2 || bestScore < zeroScore * 1.05) {
    return 0;
  }
  return bestAngle;
}

/**
 * Clean grayscale contrast curve for crisp digital screenshots (preserves colons, decimals & anti-aliased glyphs).
 */
function applyCleanScreenshotContrast(
  luma: Uint8ClampedArray,
): Uint8ClampedArray {
  const out = new Uint8ClampedArray(luma.length);
  for (let i = 0; i < luma.length; i++) {
    const v = luma[i]!;
    if (v >= 232) out[i] = 255;
    else if (v <= 24) out[i] = 0;
    else
      out[i] = Math.max(0, Math.min(255, Math.round(((v - 24) / 208) * 255)));
  }
  return out;
}

/**
 * Adaptive local-mean contrast & binarization via O(W*H) integral image.
 * Clears shadows on angled slips and sharpens faint pen handwriting.
 */
function applyAdaptiveEnhancement(
  luma: Uint8ClampedArray,
  w: number,
  h: number,
  mode: ReceiptScanMode,
): Uint8ClampedArray {
  const out = new Uint8ClampedArray(w * h);

  // 3x3 unsharp mask first to crispen handwriting & Khmer diacritics
  const sharp = new Uint8ClampedArray(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      if (x === 0 || y === 0 || x === w - 1 || y === h - 1) {
        sharp[idx] = luma[idx]!;
      } else {
        const val =
          5 * luma[idx]! -
          luma[idx - 1]! -
          luma[idx + 1]! -
          luma[idx - w]! -
          luma[idx + w]!;
        sharp[idx] = Math.max(0, Math.min(255, val));
      }
    }
  }

  // Build 1-based summed area table (integral image)
  const stride = w + 1;
  const sat = new Float64Array(stride * (h + 1));
  for (let y = 1; y <= h; y++) {
    let rowSum = 0;
    for (let x = 1; x <= w; x++) {
      rowSum += sharp[(y - 1) * w + (x - 1)]!;
      sat[y * stride + x] = sat[(y - 1) * stride + x]! + rowSum;
    }
  }

  const radius = Math.max(8, Math.round(Math.min(w, h) / 28));
  const bias = mode === "handwriting" ? 0.87 : 0.85;

  for (let y = 0; y < h; y++) {
    const y0 = Math.max(0, y - radius);
    const y1 = Math.min(h - 1, y + radius);
    for (let x = 0; x < w; x++) {
      const x0 = Math.max(0, x - radius);
      const x1 = Math.min(w - 1, x + radius);
      const area = (x1 - x0 + 1) * (y1 - y0 + 1);
      const sum =
        sat[(y1 + 1) * stride + (x1 + 1)]! -
        sat[y0 * stride + (x1 + 1)]! -
        sat[(y1 + 1) * stride + x0]! +
        sat[y0 * stride + x0]!;
      const localMean = sum / Math.max(1, area);
      const px = sharp[y * w + x]!;

      if (mode === "handwriting") {
        out[y * w + x] = px < localMean * bias ? 12 : 255;
      } else {
        const diff = px - localMean * 0.92;
        if (px < localMean * bias) {
          out[y * w + x] = Math.max(0, Math.round(px * 0.35));
        } else {
          out[y * w + x] = Math.min(
            255,
            Math.round(210 + Math.max(0, diff) * 0.6),
          );
        }
      }
    }
  }

  return out;
}

async function preprocessImageForOcr(
  file: File,
  options?: { rotationDeg?: number; mode?: ReceiptScanMode },
): Promise<{
  ocrBlob: Blob | File;
  previewDataUrl: string;
  thumbDataUrl: string;
  detectedAngleDeg: number;
}> {
  const rotationDeg = (((options?.rotationDeg ?? 0) % 360) + 360) % 360;
  const mode: ReceiptScanMode = options?.mode ?? "auto";
  const objectUrl = URL.createObjectURL(file);

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Could not decode image."));
      el.src = objectUrl;
    });

    const swapped = rotationDeg === 90 || rotationDeg === 270;
    const baseW = swapped ? img.height : img.width;
    const baseH = swapped ? img.width : img.height;
    const maxDim = Math.max(baseW, baseH, 1);
    const scale =
      maxDim < 1050 ? Math.min(2.1, 1450 / maxDim) : Math.min(1, 1600 / maxDim);
    const w = Math.max(1, Math.round(baseW * scale));
    const h = Math.max(1, Math.round(baseH * scale));

    const drawRotated = (
      targetCtx: CanvasRenderingContext2D,
      tw: number,
      th: number,
      extraAngleDeg = 0,
    ) => {
      targetCtx.fillStyle = "#ffffff";
      targetCtx.fillRect(0, 0, tw, th);
      targetCtx.save();
      targetCtx.translate(tw / 2, th / 2);
      targetCtx.rotate(((rotationDeg + extraAngleDeg) * Math.PI) / 180);
      const dw = swapped ? th : tw;
      const dh = swapped ? tw : th;
      targetCtx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
      targetCtx.restore();
    };

    const previewCanvas = document.createElement("canvas");
    const pScale = Math.min(1, 1000 / maxDim);
    previewCanvas.width = Math.max(1, Math.round(baseW * pScale));
    previewCanvas.height = Math.max(1, Math.round(baseH * pScale));
    const pCtx = previewCanvas.getContext("2d");
    if (pCtx) drawRotated(pCtx, previewCanvas.width, previewCanvas.height);
    const previewDataUrl = previewCanvas.toDataURL("image/jpeg", 0.82);

    const tCanvas = document.createElement("canvas");
    const tScale = Math.min(1, 320 / maxDim);
    tCanvas.width = Math.max(1, Math.round(baseW * tScale));
    tCanvas.height = Math.max(1, Math.round(baseH * tScale));
    const tCtx = tCanvas.getContext("2d");
    if (tCtx) drawRotated(tCtx, tCanvas.width, tCanvas.height);
    const thumbDataUrl = tCanvas.toDataURL("image/jpeg", 0.7);

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas image processing unavailable.");
    drawRotated(ctx, w, h);

    let imageData = ctx.getImageData(0, 0, w, h);
    let data = imageData.data;
    const totalPixels = w * h;
    let luma = new Uint8ClampedArray(totalPixels);
    for (let i = 0, p = 0; i < data.length; i += 4, p++) {
      luma[p] = Math.round(
        0.299 * data[i]! + 0.587 * data[i + 1]! + 0.114 * data[i + 2]!,
      );
    }

    const { isDigitalScreenshot, isDarkTheme } = classifyImageProfile(
      luma,
      w,
      h,
    );
    if (isDarkTheme) {
      for (let p = 0; p < luma.length; p++) {
        luma[p] = 255 - luma[p]!;
      }
    }

    let detectedAngleDeg = 0;
    let enhanced: Uint8ClampedArray;

    if (isDigitalScreenshot && mode !== "handwriting") {
      // Crisp digital screenshots (bank apps / e-slips) keep clean anti-aliased edges and colons
      enhanced = applyCleanScreenshotContrast(luma);
    } else {
      detectedAngleDeg = estimateSkewAngleDeg(luma, w, h);
      if (detectedAngleDeg !== 0) {
        drawRotated(ctx, w, h, -detectedAngleDeg);
        imageData = ctx.getImageData(0, 0, w, h);
        data = imageData.data;
        luma = new Uint8ClampedArray(totalPixels);
        for (let i = 0, p = 0; i < data.length; i += 4, p++) {
          let g = Math.round(
            0.299 * data[i]! + 0.587 * data[i + 1]! + 0.114 * data[i + 2]!,
          );
          if (isDarkTheme) g = 255 - g;
          luma[p] = g;
        }
      }
      enhanced = applyAdaptiveEnhancement(luma, w, h, mode);
    }

    for (let i = 0, p = 0; i < data.length; i += 4, p++) {
      const v = enhanced[p]!;
      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
      data[i + 3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);

    const ocrBlob = await new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => resolve(b ?? file), "image/png"),
    );

    return { ocrBlob, previewDataUrl, thumbDataUrl, detectedAngleDeg };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

const workerCache = new Map<string, Promise<import("tesseract.js").Worker>>();

async function getOcrWorker(langKey: "eng+khm" | "eng"): Promise<{
  worker: import("tesseract.js").Worker;
  actualLang: "eng+khm" | "eng";
}> {
  const loadFor = (langs: string) => {
    let p = workerCache.get(langs);
    if (!p) {
      p = (async () => {
        const { createWorker } = await import("tesseract.js");
        return createWorker(langs);
      })();
      workerCache.set(langs, p);
    }
    return p;
  };

  if (langKey === "eng+khm") {
    try {
      const worker = await loadFor("eng+khm");
      return { worker, actualLang: "eng+khm" };
    } catch {
      workerCache.delete("eng+khm");
    }
  }

  try {
    const worker = await loadFor("eng");
    return { worker, actualLang: "eng" };
  } catch (err) {
    workerCache.delete("eng");
    throw err;
  }
}

export function warmUpReceiptOcr(): void {
  if (typeof window === "undefined") return;
  void getOcrWorker("eng+khm").catch(() => {
    /* ignore background warm-up errors */
  });
}

export async function scanReceiptLocally(
  file: File,
  fallbackDate: string,
  onProgress?: (pct: number, status: string) => void,
  options?: {
    rotationDeg?: number;
    mode?: ReceiptScanMode;
    context?: ReceiptParseContext;
  },
): Promise<{
  result: ScannedReceiptResult;
  previewDataUrl: string;
  thumbDataUrl: string;
  rawText: string;
  detectedAngleDeg: number;
  engineLang: "eng+khm" | "eng";
}> {
  const mode: ReceiptScanMode = options?.mode ?? "auto";
  onProgress?.(14, "Preparing & enhancing slip…");
  const { ocrBlob, previewDataUrl, thumbDataUrl, detectedAngleDeg } =
    await preprocessImageForOcr(file, options);

  onProgress?.(
    36,
    mode === "khm+eng" || mode === "auto"
      ? "Loading Khmer + English AI…"
      : "Loading handwriting AI…",
  );
  const { worker, actualLang } = await getOcrWorker("eng+khm");

  const { PSM } = await import("tesseract.js");
  await worker.setParameters({
    tessedit_pageseg_mode:
      mode === "handwriting" ? PSM.SPARSE_TEXT : PSM.SINGLE_BLOCK,
    preserve_interword_spaces: "1",
    user_defined_dpi: "300",
  });

  onProgress?.(68, "Reading text, handwriting & amounts…");
  const firstPass = await worker.recognize(ocrBlob);
  let rawText = firstPass.data.text ?? "";

  if (rawText.trim().length < 14 && mode !== "handwriting") {
    onProgress?.(82, "Retrying sparse / angled layout…");
    await worker.setParameters({
      tessedit_pageseg_mode: PSM.SPARSE_TEXT,
      preserve_interword_spaces: "1",
      user_defined_dpi: "300",
    });
    const retryPass = await worker.recognize(ocrBlob);
    if ((retryPass.data.text ?? "").trim().length > rawText.trim().length) {
      rawText = retryPass.data.text ?? rawText;
    }
  }

  onProgress?.(94, "Categorizing & checking accounting rules…");
  const result = parseReceiptText(rawText, fallbackDate, options?.context);

  onProgress?.(100, "Done");
  return {
    result,
    previewDataUrl,
    thumbDataUrl,
    rawText,
    detectedAngleDeg,
    engineLang: actualLang,
  };
}
