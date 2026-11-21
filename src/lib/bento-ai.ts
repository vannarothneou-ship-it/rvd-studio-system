/**
 * Smart bento auto-layout ("Smart layout").
 *
 * This is a local, deterministic optimiser (no network, no LLM) that:
 *  1. Guesses how wide each card wants to be (keywords in its id/title,
 *     then the card's default, then what the user actually chose before).
 *  2. Splits the ordered cards into 12-column rows with dynamic programming,
 *     picking widths so every row sums to exactly 12 (zero empty gaps) while
 *     staying as close as possible to each card's preferred width.
 *
 * "Refine" = learning: every time the user resizes a card by hand we record
 * the choice, and later runs weight those choices above the keyword guess.
 */

export type AutoSpan = 4 | 6 | 8 | 12;

export interface AutoItem {
  id: string;
  title: string;
  span: number;
}

export type LearnedSpans = Record<string, Partial<Record<AutoSpan, number>>>;

const ALLOWED: AutoSpan[] = [4, 6, 8, 12];

/** Row templates that sum to 12, from the allowed widths. */
const ROW_TEMPLATES: AutoSpan[][] = [[12], [6, 6], [4, 8], [8, 4], [4, 4, 4]];

const WIDE =
  /(calendar|timeline|ledger|table|schedule|board|flow|sankey|portfolio|gantt|pipeline|invoice list|transactions)/i;
const MEDIUM =
  /(chart|trend|breakdown|budget|goal|projects?|tasks?|clients?|services?|expenses?|income|summary|activity)/i;
const NARROW =
  /(stat|kpi|total|balance|metric|count|quick|reminder|upcoming|alert|health|score|rate)/i;

/** Preferred span from the card's name alone. */
export function guessSpan(item: AutoItem): AutoSpan {
  const text = `${item.id} ${item.title}`;
  if (WIDE.test(text)) return 12;
  if (NARROW.test(text)) return 4;
  if (MEDIUM.test(text)) return 6;
  return snap(item.span);
}

export function snap(span: number): AutoSpan {
  let best: AutoSpan = 6;
  let d = Infinity;
  for (const a of ALLOWED) {
    const diff = Math.abs(a - span);
    if (diff < d) {
      d = diff;
      best = a;
    }
  }
  return best;
}

/** Most frequently chosen span for this card, if the user ever chose one. */
export function learnedSpan(
  id: string,
  learned: LearnedSpans,
): AutoSpan | null {
  const counts = learned[id];
  if (!counts) return null;
  let best: AutoSpan | null = null;
  let n = 0;
  for (const a of ALLOWED) {
    const c = counts[a] ?? 0;
    if (c > n) {
      n = c;
      best = a;
    }
  }
  return best;
}

export function recordChoice(
  learned: LearnedSpans,
  id: string,
  span: number,
): LearnedSpans {
  const s = snap(span);
  const cur = learned[id] ?? {};
  return { ...learned, [id]: { ...cur, [s]: (cur[s] ?? 0) + 1 } };
}

export interface AutoResult {
  /** New span for each card id (same order as input). */
  spans: { id: string; span: AutoSpan }[];
  rows: number;
  /** 0–100: how closely widths match each card's preference. */
  fit: number;
}

export function autoArrange(
  items: AutoItem[],
  learned: LearnedSpans = {},
): AutoResult {
  const n = items.length;
  if (n === 0) return { spans: [], rows: 0, fit: 100 };

  const pref = items.map((it) => learnedSpan(it.id, learned) ?? guessSpan(it));

  // best[i] = cheapest layout of the first i cards.
  const best: number[] = Array(n + 1).fill(Infinity);
  const choice: { from: number; tpl: AutoSpan[] }[] = Array(n + 1);
  best[0] = 0;

  for (let i = 1; i <= n; i++) {
    for (const tpl of ROW_TEMPLATES) {
      const from = i - tpl.length;
      if (from < 0 || best[from] === Infinity) continue;
      let cost = 0;
      for (let k = 0; k < tpl.length; k++) {
        cost += Math.abs(tpl[k]! - pref[from + k]!);
      }
      // tiny bias against rows of 1 narrow widget stretched to full width
      const total = best[from]! + cost + 0.01;
      if (total < best[i]!) {
        best[i] = total;
        choice[i] = { from, tpl };
      }
    }
  }

  const spans: { id: string; span: AutoSpan }[] = [];
  let rows = 0;
  let i = n;
  const out: AutoSpan[] = Array(n);
  while (i > 0) {
    const c = choice[i]!;
    c.tpl.forEach((s, k) => {
      out[c.from + k] = s;
    });
    rows++;
    i = c.from;
  }
  let off = 0;
  for (let k = 0; k < n; k++) {
    spans.push({ id: items[k]!.id, span: out[k]! });
    off += Math.abs(out[k]! - pref[k]!);
  }
  const fit = Math.max(0, Math.round(100 - (off / (n * 8)) * 100));
  return { spans, rows, fit };
}
