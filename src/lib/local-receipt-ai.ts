import type { ScannedReceiptResult } from "@/lib/receipt-scanner";

export type ReceiptScanMode = "auto" | "khm+eng" | "handwriting";

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
  "acleda",
  "acleda bank",
  "canadia",
  "canadia bank",
  "wing bank",
  "khqr",
  "bakong",
  "transaction receipt",
  "payment successful",
  "transfer successful",
  "transfer completed",
  "successful",
  "receipt",
  "e-receipt",
  "welcome",
  "thank you",
  "វិក្កយបត្រ",
  "បង្កាន់ដៃ",
  "សូមអរគុណ",
  "ការទូទាត់ជោគជ័យ",
];

export function normalizeKhmerDigits(input: string): string {
  return input
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/[០-៩]/g, (ch) => KHMER_DIGITS[ch] ?? ch)
    .replace(/។/g, ".")
    .replace(/៖/g, ":");
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

interface AmountCandidate {
  amount: number;
  currency: "USD" | "KHR";
  score: number;
}

function extractAmountAndCurrency(raw: string): {
  amount: number;
  currency: "USD" | "KHR";
} {
  const norm = normalizeKhmerDigits(raw);
  const lines = norm
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const candidates: AmountCandidate[] = [];

  for (const line of lines) {
    const lower = line.toLowerCase();
    // Skip lines that are clearly phone numbers, card masks, account numbers, timestamps, or ref IDs
    if (
      /\b(tel|phone|acc|account|card\s*no|trx|ref|trace|id|time|date)\b|លេខទូរស័ព្ទ|ទូរស័ព្ទ/.test(
        lower,
      ) &&
      !/total|ttl|amount|amt|paid|sum|usd|khr|\$|៛|សរុប|ថ្លៃ|រៀល|ដុល្លារ/.test(
        lower,
      )
    ) {
      continue;
    }

    const isGrandTotal =
      /grand\s*total|total\s*paid|total\s*amount|net\s*amount|សរុបរួម|ប្រាក់សរុប|ថ្លៃសរុប|សរុបទាំងអស់/.test(
        lower,
      );
    const isTotalLine =
      /\btotal\b|\bttl\b|\bamount\b|\bamt\b|\bpaid\b|\bpayment\b|\btransfer\b|\bsum\b|សរុប|ទឹកប្រាក់|តម្លៃ|បង់ប្រាក់|ទទួលប្រាក់|ថ្លៃ/.test(
        lower,
      );

    const lineBoost = isGrandTotal
      ? 48
      : isTotalLine
        ? 32
        : /subtotal|balance|fee|ប្រាក់អាប់/.test(lower)
          ? 5
          : 12;

    // 1. Explicit USD patterns: $12.50, $18.5, $12, 12.50$, USD 12.50, 12.50 USD, US$ 12.50
    const usdRegex =
      /(?:[-+]?\s*(?:US\$|\$|USD|ដុល្លារ)\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?))|(?:([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)\s*(?:USD\b|\$|ដុល្លារ))/gi;
    for (const m of line.matchAll(usdRegex)) {
      const val = parseNumberStr(m[1] || m[2] || "");
      if (val > 0 && val < 500_000) {
        candidates.push({
          amount: Math.round(val * 100) / 100,
          currency: "USD",
          score: lineBoost + 36 + (m[0].includes(".") ? 10 : 0),
        });
      }
    }

    // 2. Explicit KHR patterns: 20,500 KHR, KHR 20,500, ៛20,500, 24,500 រៀល, 15000r, 20 000 ៛
    const khrRegex =
      /(?:(?:KHR|៛)\s*([0-9]{1,3}(?:[,\s][0-9]{3})+|[0-9]{3,9}))|(?:([0-9]{1,3}(?:[,\s][0-9]{3})+|[0-9]{3,9})\s*(?:KHR|Riels?|រៀល|រៀស|៛|r\b))/gi;
    for (const m of line.matchAll(khrRegex)) {
      const val = parseNumberStr(m[1] || m[2] || "");
      if (val >= 100 && val < 500_000_000) {
        candidates.push({
          amount: Math.round(val),
          currency: "KHR",
          score: lineBoost + 28,
        });
      }
    }

    // 3. Decimal currency-like fallback on total/amount or handwritten short lines (e.g. "Total 14.5", "Coffee 2.50")
    if (isTotalLine) {
      const decRegex = /\b([0-9]{1,5}\.[0-9]{1,2})\b/g;
      for (const m of line.matchAll(decRegex)) {
        const val = parseNumberStr(m[1] || "");
        if (val > 0 && val < 100_000) {
          candidates.push({
            amount: Math.round(val * 100) / 100,
            currency: "USD",
            score: lineBoost + 22,
          });
        }
      }

      // Handwritten Khmer large integer on total line without currency symbol (e.g. "សរុប 24000")
      const largeIntRegex = /\b([0-9]{1,3}(?:,[0-9]{3})+|[0-9]{4,7})\b/g;
      for (const m of line.matchAll(largeIntRegex)) {
        const rawNum = m[1] || "";
        if (rawNum.includes(".")) continue;
        const val = parseNumberStr(rawNum);
        if (val >= 500 && val % 100 === 0 && val < 50_000_000) {
          candidates.push({
            amount: Math.round(val),
            currency: "KHR",
            score: lineBoost + 18,
          });
        }
      }
    }
  }

  if (candidates.length === 0) {
    // Broad fallback: any decimal amount in text (e.g. 5.50 or 18.5)
    const decMatches = Array.from(
      norm.matchAll(/\b([0-9]{1,4}\.[0-9]{1,2})\b/g),
    )
      .map((m) => parseNumberStr(m[1] || ""))
      .filter((n) => n > 0 && n < 50_000);
    if (decMatches.length > 0) {
      return {
        amount: Math.round(Math.max(...decMatches) * 100) / 100,
        currency: "USD",
      };
    }

    // Broad KHR integer fallback (e.g. handwritten "15000")
    const khrMatches = Array.from(norm.matchAll(/\b([0-9]{4,7})\b/g))
      .map((m) => parseNumberStr(m[1] || ""))
      .filter((n) => n >= 500 && n % 100 === 0 && n < 10_000_000);
    if (khrMatches.length > 0) {
      return {
        amount: Math.max(...khrMatches),
        currency: "KHR",
      };
    }

    return { amount: 0, currency: "USD" };
  }

  // Prefer USD if both USD and KHR exist on dual-currency Cambodian receipt with reasonable score
  const bestUsd = candidates
    .filter((c) => c.currency === "USD")
    .sort((a, b) => b.score - a.score || b.amount - a.amount)[0];
  const bestKhr = candidates
    .filter((c) => c.currency === "KHR")
    .sort((a, b) => b.score - a.score || b.amount - a.amount)[0];

  if (bestUsd && (!bestKhr || bestUsd.score >= bestKhr.score - 5)) {
    return { amount: bestUsd.amount, currency: "USD" };
  }
  if (bestKhr) {
    return { amount: bestKhr.amount, currency: "KHR" };
  }
  return { amount: 0, currency: "USD" };
}

function detectCategory(txType: "expense" | "income", text: string): string {
  const lower = text.toLowerCase();

  if (txType === "income") {
    if (/salary|payroll|wage|monthly\s*pay|ប្រាក់ខែ|ប្រាក់បៀវត្ស/.test(lower))
      return "Salary";
    if (/studio|draw/.test(lower)) return "Studio Draw";
    if (/freelance|client|invoice|design|រចនា/.test(lower)) return "Freelance";
    if (/bonus|incentive|reward|ប្រាក់រង្វាន់/.test(lower)) return "Bonus";
    if (/invest|dividend|interest|ការប្រាក់/.test(lower)) return "Investment";
    if (/gift|refund|cashback|អំណោយ|សងប្រាក់/.test(lower)) return "Gift & Refund";
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
  if (/saving|deposit|invest|goal|សន្សំ|វិនិយោគ/.test(lower)) {
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

function extractMerchant(raw: string): string {
  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter((l) => l.length >= 2);

  // 1. Check explicit English or Khmer label lines
  for (const line of lines) {
    const m = line.match(
      /^(?:to|merchant|recipient|paid\s*to|vendor|beneficiary|from|store|ជូនចំពោះ|អ្នកទទួល|ហាង|ពី|ឈ្មោះ|ហាងកាហ្វេ)\s*[:៖-]\s*(.+)$/i,
    );
    if (m && m[1]) {
      const cleaned = m[1].trim();
      if (cleaned.length >= 2 && !/^[\d\s\-*.]+$/.test(cleaned)) {
        return cleaned.slice(0, 48);
      }
    }
  }

  // 2. Pick the first clean descriptive line (supports English + Khmer script)
  for (const line of lines.slice(0, 10)) {
    const lower = line.toLowerCase();
    if (BANK_GENERIC_HEADERS.some((h) => lower === h || lower.startsWith(h))) {
      continue;
    }
    if (/^[-+$៛\d.,\s:/០-៩]+$/.test(line)) continue;
    if (/^\d{2,}/.test(line) && !hasReadableLetters(line)) continue;
    if (line.length >= 2 && hasReadableLetters(line)) {
      return line.slice(0, 48);
    }
  }

  return "Scanned Slip";
}

function extractReference(raw: string): string {
  const norm = normalizeKhmerDigits(raw);
  const m = norm.match(
    /(?:trx\.?\s*id|ref(?:erence)?\.?\s*(?:no|#)?|trace(?:\s*no)?|receipt\s*(?:no|#)|លេខយោង)\s*[:#-]?\s*([A-Z0-9-]{4,24})/i,
  );
  return m?.[1]?.trim() ?? "";
}

export function parseReceiptText(
  ocrText: string,
  fallbackDate: string,
): ScannedReceiptResult {
  const cleaned = ocrText.trim();
  const normalized = normalizeKhmerDigits(cleaned);
  const lower = normalized.toLowerCase();

  const txType: "expense" | "income" =
    /transfer\s*received|you\s*received|credited|incoming\s*transfer|salary\s*credited|\+\s*\$|ទទួលប្រាក់|ផ្ទេរចូល|ប្រាក់ខែ/.test(
      lower,
    )
      ? "income"
      : "expense";

  const method: "Debit" | "Credit" =
    /credit\s*card|visa\s*credit|mastercard\s*credit|credit\s*limit|credit\s*acc|កាតឥណទាន/.test(
      lower,
    )
      ? "Credit"
      : "Debit";

  const { amount, currency } = extractAmountAndCurrency(normalized);
  const date = extractDateFromText(normalized, fallbackDate);
  const merchantOrPayer = extractMerchant(cleaned);
  const category = detectCategory(txType, cleaned);
  const reference = extractReference(normalized);

  const description =
    merchantOrPayer !== "Scanned Slip"
      ? merchantOrPayer
      : category !== "Other"
        ? `${category} ${txType}`
        : "Receipt scan";

  const confidence: ScannedReceiptResult["confidence"] =
    amount > 0 && merchantOrPayer !== "Scanned Slip"
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
 * Estimates skew angle (-22° to +22°) using horizontal projection profile variance
 * on a fast downsampled grayscale buffer. Dark ink on light background scores highest
 * variance when text lines sit perfectly horizontal.
 */
export function estimateSkewAngleDeg(
  luma: Uint8ClampedArray,
  width: number,
  height: number,
): number {
  const targetW = Math.min(220, width);
  const scale = targetW / Math.max(1, width);
  const w = Math.max(16, Math.round(width * scale));
  const h = Math.max(16, Math.round(height * scale));
  const small = new Float32Array(w * h);

  for (let y = 0; y < h; y++) {
    const sy = Math.min(height - 1, Math.floor(y / scale));
    for (let x = 0; x < w; x++) {
      const sx = Math.min(width - 1, Math.floor(x / scale));
      // Invert so text ink has higher energy
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

  // Fine pass around best coarse angle
  const refineStart = Math.max(-24, bestAngle - 2);
  const refineEnd = Math.min(24, bestAngle + 2);
  for (let a = refineStart; a <= refineEnd; a += 0.5) {
    const s = scoreAngle(a);
    if (s > bestScore) {
      bestScore = s;
      bestAngle = a;
    }
  }

  // Only deskew if clear improvement over 0 deg
  const zeroScore = scoreAngle(0);
  if (Math.abs(bestAngle) < 1.2 || bestScore < zeroScore * 1.05) {
    return 0;
  }
  return bestAngle;
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
        // High-contrast ink separation for pen/pencil handwriting on textured paper
        out[y * w + x] = px < localMean * bias ? 12 : 255;
      } else {
        // Soft adaptive thresholding preserves subtle Khmer vowels & diacritics
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

/**
 * Prepares a rotated, auto-deskewed, adaptive-enhanced OCR canvas:
 * - Supports manual 90° step rotation for sideways camera shots
 * - Scales small slips up for fine Khmer sub-consonant & handwriting accuracy
 * - Auto-inverts dark-mode bank slips
 * - Auto-deskews angled receipts up to ±24°
 * - Runs integral-image shadow removal + contrast sharpening
 */
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
      maxDim < 1100 ? Math.min(2.2, 1500 / maxDim) : Math.min(1, 1800 / maxDim);
    const w = Math.max(1, Math.round(baseW * scale));
    const h = Math.max(1, Math.round(baseH * scale));

    // Helper to draw rotated source image into any canvas size
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

    // Preview & thumb respecting manual rotation
    const previewCanvas = document.createElement("canvas");
    const pScale = Math.min(1, 1100 / maxDim);
    previewCanvas.width = Math.max(1, Math.round(baseW * pScale));
    previewCanvas.height = Math.max(1, Math.round(baseH * pScale));
    const pCtx = previewCanvas.getContext("2d");
    if (pCtx) drawRotated(pCtx, previewCanvas.width, previewCanvas.height);
    const previewDataUrl = previewCanvas.toDataURL("image/jpeg", 0.84);

    const tCanvas = document.createElement("canvas");
    const tScale = Math.min(1, 360 / maxDim);
    tCanvas.width = Math.max(1, Math.round(baseW * tScale));
    tCanvas.height = Math.max(1, Math.round(baseH * tScale));
    const tCtx = tCanvas.getContext("2d");
    if (tCtx) drawRotated(tCtx, tCanvas.width, tCanvas.height);
    const thumbDataUrl = tCanvas.toDataURL("image/jpeg", 0.72);

    // Stage 1: Render base rotated OCR canvas & compute luma
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
    let lumaSum = 0;
    for (let i = 0, p = 0; i < data.length; i += 4, p++) {
      const g = Math.round(
        0.299 * data[i]! + 0.587 * data[i + 1]! + 0.114 * data[i + 2]!,
      );
      luma[p] = g;
      lumaSum += g;
    }
    const isDarkTheme = lumaSum / Math.max(1, totalPixels) < 115;
    if (isDarkTheme) {
      for (let p = 0; p < luma.length; p++) {
        luma[p] = 255 - luma[p]!;
      }
    }

    // Stage 2: Projection-profile skew detection & correction for angled photos
    const detectedAngleDeg = estimateSkewAngleDeg(luma, w, h);
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

    // Stage 3: Adaptive local thresholding & unsharp enhancement
    const enhanced = applyAdaptiveEnhancement(luma, w, h, mode);
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
      // Graceful offline fallback to English if Khmer traineddata cannot load
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

export async function scanReceiptLocally(
  file: File,
  fallbackDate: string,
  onProgress?: (pct: number, status: string) => void,
  options?: { rotationDeg?: number; mode?: ReceiptScanMode },
): Promise<{
  result: ScannedReceiptResult;
  previewDataUrl: string;
  thumbDataUrl: string;
  rawText: string;
  detectedAngleDeg: number;
  engineLang: "eng+khm" | "eng";
}> {
  const mode: ReceiptScanMode = options?.mode ?? "auto";
  onProgress?.(14, "Deskewing & sharpening slip…");
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
  });

  onProgress?.(68, "Reading text, handwriting & amounts…");
  const firstPass = await worker.recognize(ocrBlob);
  let rawText = firstPass.data.text ?? "";

  // If sparse/handwritten slip produced very little text in block mode, retry with SPARSE_TEXT
  if (rawText.trim().length < 14 && mode !== "handwriting") {
    onProgress?.(82, "Retrying sparse / angled layout…");
    await worker.setParameters({
      tessedit_pageseg_mode: PSM.SPARSE_TEXT,
    });
    const retryPass = await worker.recognize(ocrBlob);
    if ((retryPass.data.text ?? "").trim().length > rawText.trim().length) {
      rawText = retryPass.data.text ?? rawText;
    }
  }

  onProgress?.(94, "Categorizing & parsing digits…");
  const result = parseReceiptText(rawText, fallbackDate);

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
