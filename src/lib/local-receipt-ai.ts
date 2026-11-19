import type { ScannedReceiptResult } from "@/lib/receipt-scanner";

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
];

function extractDateFromText(raw: string, fallbackDate: string): string {
  // YYYY-MM-DD or YYYY/MM/DD
  const iso = raw.match(
    /\b(20\d{2})[-/.](0?[1-9]|1[0-2])[-/.](0?[1-9]|[12]\d|3[01])\b/,
  );
  if (iso) {
    return `${iso[1]}-${iso[2]!.padStart(2, "0")}-${iso[3]!.padStart(2, "0")}`;
  }

  // DD/MM/YYYY or DD-MM-YYYY
  const dmy = raw.match(
    /\b(0?[1-9]|[12]\d|3[01])[-/.](0?[1-9]|1[0-2])[-/.](20\d{2})\b/,
  );
  if (dmy) {
    return `${dmy[3]}-${dmy[2]!.padStart(2, "0")}-${dmy[1]!.padStart(2, "0")}`;
  }

  // DD MMM YYYY (e.g., 18 Nov 2026)
  const dMonY = raw.match(
    /\b(0?[1-9]|[12]\d|3[01])\s+([A-Za-z]{3,9})[,\s]+(20\d{2})\b/i,
  );
  if (dMonY) {
    const m = MONTHS[dMonY[2]!.toLowerCase()];
    if (m) return `${dMonY[3]}-${m}-${dMonY[1]!.padStart(2, "0")}`;
  }

  // MMM DD, YYYY (e.g., Nov 18, 2026)
  const monDY = raw.match(
    /\b([A-Za-z]{3,9})\s+(0?[1-9]|[12]\d|3[01])[,\s]+(20\d{2})\b/i,
  );
  if (monDY) {
    const m = MONTHS[monDY[1]!.toLowerCase()];
    if (m) return `${monDY[3]}-${m}-${monDY[2]!.padStart(2, "0")}`;
  }

  return fallbackDate;
}

function parseNumberStr(raw: string): number {
  const cleaned = raw.replace(/,/g, "").replace(/\s+/g, "").trim();
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
  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const candidates: AmountCandidate[] = [];

  for (const line of lines) {
    const lower = line.toLowerCase();
    // Skip lines that are clearly phone numbers, card masks, account numbers, timestamps, or ref IDs
    if (
      /\b(tel|phone|acc|account|card\s*no|trx|ref|trace|id|time|date)\b/.test(
        lower,
      ) &&
      !/total|amount|paid|usd|khr|\$|៛/.test(lower)
    ) {
      continue;
    }

    const lineBoost =
      /grand\s*total|total\s*paid|total\s*amount|net\s*amount/.test(lower)
        ? 45
        : /\btotal\b|\bamount\b|\bpaid\b|\bpayment\b|\btransfer\b/.test(lower)
          ? 30
          : /subtotal|balance|fee/.test(lower)
            ? 5
            : 12;

    // 1. Explicit USD patterns: $12.50, USD 12.50, 12.50 USD, US$ 12.50, -$8.00, +$120
    const usdRegex =
      /(?:[-+]?\s*(?:US\$|\$|USD)\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?))|(?:([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)\s*USD\b)/gi;
    for (const m of line.matchAll(usdRegex)) {
      const val = parseNumberStr(m[1] || m[2] || "");
      if (val > 0 && val < 500_000) {
        candidates.push({
          amount: Math.round(val * 100) / 100,
          currency: "USD",
          score: lineBoost + 35 + (m[0].includes(".") ? 10 : 0),
        });
      }
    }

    // 2. Explicit KHR patterns: 20,500 KHR, KHR 20,500, ៛20,500, 20,500 R
    const khrRegex =
      /(?:(?:KHR|៛)\s*([0-9]{1,3}(?:,[0-9]{3})+|[0-9]{3,9}))|(?:([0-9]{1,3}(?:,[0-9]{3})+|[0-9]{3,9})\s*(?:KHR|Riels?|R\b|៛))/gi;
    for (const m of line.matchAll(khrRegex)) {
      const val = parseNumberStr(m[1] || m[2] || "");
      if (val >= 100 && val < 500_000_000) {
        candidates.push({
          amount: Math.round(val),
          currency: "KHR",
          score: lineBoost + 24,
        });
      }
    }

    // 3. Decimal currency-like fallback on total/amount lines (e.g. "Total 14.50")
    if (/total|amount|paid|price|sum/i.test(lower)) {
      const decRegex = /\b([0-9]{1,5}\.[0-9]{2})\b/g;
      for (const m of line.matchAll(decRegex)) {
        const val = parseNumberStr(m[1] || "");
        if (val > 0 && val < 100_000) {
          candidates.push({
            amount: val,
            currency: "USD",
            score: lineBoost + 20,
          });
        }
      }
    }
  }

  if (candidates.length === 0) {
    // Broad fallback: any decimal amount in text (e.g. 5.50)
    const decMatches = Array.from(raw.matchAll(/\b([0-9]{1,4}\.[0-9]{2})\b/g))
      .map((m) => parseNumberStr(m[1] || ""))
      .filter((n) => n > 0 && n < 50_000);
    if (decMatches.length > 0) {
      return {
        amount: Math.max(...decMatches),
        currency: "USD",
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
    if (/salary|payroll|wage|monthly\s*pay/.test(lower)) return "Salary";
    if (/studio|draw/.test(lower)) return "Studio Draw";
    if (/freelance|client|invoice|design/.test(lower)) return "Freelance";
    if (/bonus|incentive|reward/.test(lower)) return "Bonus";
    if (/invest|dividend|interest/.test(lower)) return "Investment";
    if (/gift|refund|cashback/.test(lower)) return "Gift & Refund";
    return "Other";
  }

  if (
    /ptt|tela|totalenergies|sokimex|caltex|fuel|gasoline|petrol|diesel|prius|car\s*wash|garage|tire|engine\s*oil/.test(
      lower,
    )
  ) {
    return "Prius 2012";
  }
  if (
    /brown|tube\s*coffee|starbucks|amazon|koi|gong\s*cha|coffee|cafe|tea|pizza|burger|kfc|lucky|makro|chip\s*mong|smile|restaurant|bakery|food|noodle|rice|nham24|foodpanda|wownow|kitchen|bistro|mart/.test(
      lower,
    )
  ) {
    return "Food";
  }
  if (
    /grab|passapp|tada|taxi|tuk|bus|toll|parking|expressway|highway|transport/.test(
      lower,
    )
  ) {
    return "Transportation";
  }
  if (
    /edc|ppwsa|electricity|water\s*supply|wifi|internet|smart|cellcard|metfone|ezecom|sinet|mekongnet|top\s*up|utility|utilities/.test(
      lower,
    )
  ) {
    return "Utilities";
  }
  if (
    /pharmacy|clinic|hospital|calmette|ucare|dental|doctor|medicine|medical|health/.test(
      lower,
    )
  ) {
    return "Medical & Healthcare";
  }
  if (/school|tuition|baby|milk|diaper|kid|toy|pediatric/.test(lower)) {
    return "Kid";
  }
  if (/saving|deposit|invest|goal/.test(lower)) {
    return "Saving & Investing";
  }
  if (/aeon|mall|zara|uniqlo|cloth|shoes|cinema|legend|salon|gym/.test(lower)) {
    return "Personal Spending";
  }
  return "Other";
}

function extractMerchant(raw: string): string {
  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter((l) => l.length >= 2);

  // 1. Check explicit label lines first: "To:", "Merchant:", "Recipient:", "Paid to:"
  for (const line of lines) {
    const m = line.match(
      /^(?:to|merchant|recipient|paid\s*to|vendor|beneficiary|from|store)\s*[:-]\s*(.+)$/i,
    );
    if (m && m[1]) {
      const cleaned = m[1].trim();
      if (cleaned.length >= 2 && !/^\d[\d\s\-*]+$/.test(cleaned)) {
        return cleaned.slice(0, 48);
      }
    }
  }

  // 2. Otherwise pick the first clean descriptive line that isn't a bank header or numeric line
  for (const line of lines.slice(0, 8)) {
    const lower = line.toLowerCase();
    if (BANK_GENERIC_HEADERS.some((h) => lower === h || lower.startsWith(h))) {
      continue;
    }
    if (/^[-+$៛\d.,\s:/]+$/.test(line)) continue;
    if (/^\d{2,}/.test(line) && !/[a-z]{3,}/i.test(line)) continue;
    if (line.length >= 3 && /[a-z]/i.test(line)) {
      return line.slice(0, 48);
    }
  }

  return "Scanned Slip";
}

function extractReference(raw: string): string {
  const m = raw.match(
    /(?:trx\.?\s*id|ref(?:erence)?\.?\s*(?:no|#)?|trace(?:\s*no)?|receipt\s*(?:no|#))\s*[:#-]?\s*([A-Z0-9-]{4,24})/i,
  );
  return m?.[1]?.trim() ?? "";
}

export function parseReceiptText(
  ocrText: string,
  fallbackDate: string,
): ScannedReceiptResult {
  const cleaned = ocrText.trim();
  const lower = cleaned.toLowerCase();

  const txType: "expense" | "income" =
    /transfer\s*received|you\s*received|credited|incoming\s*transfer|salary\s*credited|\+\s*\$/.test(
      lower,
    )
      ? "income"
      : "expense";

  const method: "Debit" | "Credit" =
    /credit\s*card|visa\s*credit|mastercard\s*credit|credit\s*limit|credit\s*acc/.test(
      lower,
    )
      ? "Credit"
      : "Debit";

  const { amount, currency } = extractAmountAndCurrency(cleaned);
  const date = extractDateFromText(cleaned, fallbackDate);
  const merchantOrPayer = extractMerchant(cleaned);
  const category = detectCategory(txType, cleaned);
  const reference = extractReference(cleaned);

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
 * Prepares a high-contrast OCR-friendly canvas image:
 * - Scales up small images / caps huge images to ~1500px
 * - Detects dark-mode banking screenshots (white text on dark background) and inverts them
 * - Enhances contrast for crisp digit & merchant recognition
 */
async function preprocessImageForOcr(file: File): Promise<{
  ocrBlob: Blob | File;
  previewDataUrl: string;
  thumbDataUrl: string;
}> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Could not decode image."));
      el.src = objectUrl;
    });

    const maxDim = Math.max(img.width, img.height, 1);
    const scale =
      maxDim < 900 ? Math.min(2, 1200 / maxDim) : Math.min(1, 1600 / maxDim);
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas image processing unavailable.");
    ctx.drawImage(img, 0, 0, w, h);

    // Preview & thumb from original orientation/colors
    const previewCanvas = document.createElement("canvas");
    const pScale = Math.min(1, 1100 / maxDim);
    previewCanvas.width = Math.max(1, Math.round(img.width * pScale));
    previewCanvas.height = Math.max(1, Math.round(img.height * pScale));
    previewCanvas
      .getContext("2d")
      ?.drawImage(img, 0, 0, previewCanvas.width, previewCanvas.height);
    const previewDataUrl = previewCanvas.toDataURL("image/jpeg", 0.84);

    const tCanvas = document.createElement("canvas");
    const tScale = Math.min(1, 360 / maxDim);
    tCanvas.width = Math.max(1, Math.round(img.width * tScale));
    tCanvas.height = Math.max(1, Math.round(img.height * tScale));
    tCanvas
      .getContext("2d")
      ?.drawImage(img, 0, 0, tCanvas.width, tCanvas.height);
    const thumbDataUrl = tCanvas.toDataURL("image/jpeg", 0.72);

    // Grayscale + automatic dark-mode inversion + contrast boost on OCR canvas
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;
    let lumaSum = 0;
    const totalPixels = w * h;
    for (let i = 0; i < data.length; i += 4) {
      const gray =
        0.299 * data[i]! + 0.587 * data[i + 1]! + 0.114 * data[i + 2]!;
      lumaSum += gray;
    }
    const isDarkTheme = lumaSum / Math.max(1, totalPixels) < 115;

    for (let i = 0; i < data.length; i += 4) {
      let gray = 0.299 * data[i]! + 0.587 * data[i + 1]! + 0.114 * data[i + 2]!;
      if (isDarkTheme) gray = 255 - gray;
      // Gentle contrast stretch centered at 128
      const stretched = Math.max(0, Math.min(255, (gray - 128) * 1.45 + 128));
      data[i] = stretched;
      data[i + 1] = stretched;
      data[i + 2] = stretched;
    }
    ctx.putImageData(imageData, 0, 0);

    const ocrBlob = await new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => resolve(b ?? file), "image/png"),
    );

    return { ocrBlob, previewDataUrl, thumbDataUrl };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

let cachedWorkerPromise: Promise<import("tesseract.js").Worker> | null = null;

async function getOcrWorker() {
  if (!cachedWorkerPromise) {
    cachedWorkerPromise = (async () => {
      const { createWorker } = await import("tesseract.js");
      return createWorker("eng");
    })();
  }
  try {
    return await cachedWorkerPromise;
  } catch (err) {
    cachedWorkerPromise = null;
    throw err;
  }
}

export async function scanReceiptLocally(
  file: File,
  fallbackDate: string,
  onProgress?: (pct: number, status: string) => void,
): Promise<{
  result: ScannedReceiptResult;
  previewDataUrl: string;
  thumbDataUrl: string;
  rawText: string;
}> {
  onProgress?.(12, "Enhancing slip contrast…");
  const { ocrBlob, previewDataUrl, thumbDataUrl } =
    await preprocessImageForOcr(file);

  onProgress?.(35, "Loading local AI text engine…");
  const worker = await getOcrWorker();

  onProgress?.(68, "Reading amount, card & merchant…");
  const recognition = await worker.recognize(ocrBlob);
  const rawText = recognition.data.text ?? "";

  onProgress?.(94, "Categorizing transaction…");
  const result = parseReceiptText(rawText, fallbackDate);

  onProgress?.(100, "Done");
  return { result, previewDataUrl, thumbDataUrl, rawText };
}
