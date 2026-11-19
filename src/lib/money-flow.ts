import {
  addDays,
  categoryLimit,
  expenseAccount,
  isInvoice,
  previousMonth,
  shortDate,
  toUSD,
  today,
  type Account,
  type DB,
  type Expense,
} from "@/lib/store";

export type MoneyFlowRange = "1w" | "1m" | "3m" | "12m";
export type MoneyFlowAccountScope = "all" | "Personal" | "Studio";
export type CategoryTimelineRange = "1w" | "1m" | "3m" | "6m" | "12m" | "all";
export type BucketId = "needs" | "wants" | "studio" | "future";

export interface MoneyFlowSource {
  id: string;
  label: string;
  amount: number;
  count: number;
  color: string;
}

export interface MoneyFlowBucket {
  id: BucketId;
  label: string;
  amount: number;
  pct: number;
  color: string;
}

export interface MoneyFlowTarget {
  id: string;
  bucketId: BucketId;
  label: string;
  amount: number;
  prevAmount: number;
  deltaPct: number | null;
  account: Account | null;
  category: string | null;
  isSurplus?: boolean;
  color: string;
}

export interface MoneyFlowLink {
  id: string;
  fromId: string;
  toId: string;
  amount: number;
  color: string;
  bucketId: BucketId;
}

export interface MoneyFlowCategoryChange {
  key: string;
  account: Account;
  category: string;
  amount: number;
  prevAmount: number;
  deltaPct: number | null;
  color: string;
}

export interface MoneyFlowData {
  range: MoneyFlowRange;
  scopeLabel: string;
  accountScope: MoneyFlowAccountScope;
  totalIncome: number;
  totalSpend: number;
  totalKept: number;
  keptPct: number;
  totalFlowBase: number;
  hasIncome: boolean;
  sources: MoneyFlowSource[];
  buckets: MoneyFlowBucket[];
  targets: MoneyFlowTarget[];
  sourceToBucketLinks: MoneyFlowLink[];
  bucketToTargetLinks: MoneyFlowLink[];
  topCategories: MoneyFlowCategoryChange[];
}

export interface CategoryTimelinePoint {
  key: string;
  label: string;
  fullDate: string;
  amount: number;
  count: number;
}

export interface CategoryTimelineResult {
  range: CategoryTimelineRange;
  scopeLabel: string;
  prevLabel: string;
  totalUSD: number;
  prevTotalUSD: number | null;
  deltaPct: number | null;
  txCount: number;
  avgPerTx: number;
  monthlyLimit: number;
  scaledLimit: number;
  items: Expense[];
  points: CategoryTimelinePoint[];
}

export const BUCKET_META: Record<
  BucketId,
  { label: string; color: string; stroke: string }
> = {
  needs: {
    label: "Needs",
    color: "oklch(0.75 0.13 155)",
    stroke: "oklch(0.68 0.14 155)",
  },
  wants: {
    label: "Wants",
    color: "oklch(0.7 0.14 22)",
    stroke: "oklch(0.64 0.15 22)",
  },
  studio: {
    label: "Studio",
    color: "oklch(0.83 0.13 82)",
    stroke: "oklch(0.75 0.14 82)",
  },
  future: {
    label: "Future",
    color: "oklch(0.68 0.12 245)",
    stroke: "oklch(0.61 0.13 245)",
  },
};

const SOURCE_COLORS = [
  "oklch(0.83 0.13 82)",
  "oklch(0.75 0.13 155)",
  "oklch(0.68 0.12 245)",
  "oklch(0.74 0.14 48)",
  "oklch(0.68 0.12 300)",
];

const NEEDS_CATEGORIES = new Set([
  "Food",
  "Food and groceries",
  "Utilities",
  "Transportation",
  "Transport",
  "Prius 2012",
  "Medical & Healthcare",
  "Health",
  "Kid",
  "Family",
]);

const FUTURE_CATEGORIES = new Set(["Saving & Investing"]);

export function classifyExpenseBucket(
  account: Account,
  category: string,
): BucketId {
  if (account === "Studio") return "studio";
  if (FUTURE_CATEGORIES.has(category)) return "future";
  if (NEEDS_CATEGORIES.has(category)) return "needs";
  return "wants";
}

function getTrailingMonths(count: number, anchorMonth: string): string[] {
  const ref = /^\d{4}-\d{2}$/.test(anchorMonth)
    ? anchorMonth
    : today().slice(0, 7);
  const [y, m] = ref.split("-").map(Number);
  const baseY = y || new Date().getUTCFullYear();
  const baseM = (m || new Date().getUTCMonth() + 1) - 1;
  const out: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(baseY, baseM - i, 1));
    out.push(d.toISOString().slice(0, 7));
  }
  return out;
}

function getTrailingDays(endDay: string, count: number): string[] {
  const out: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    out.push(addDays(endDay, -i));
  }
  return out;
}

function resolveFlowAnchorDay(db: DB, ym: string): string {
  const nowDay = today();
  if (nowDay.startsWith(ym)) return nowDay;
  let latest = "";
  for (const e of db.expenses) {
    if (e.date.startsWith(ym) && e.date > latest) latest = e.date;
  }
  for (const inc of db.personalIncome ?? []) {
    if (inc.date.startsWith(ym) && inc.date > latest) latest = inc.date;
  }
  for (const p of db.payments) {
    if (p.date.startsWith(ym) && p.date > latest) latest = p.date;
  }
  if (latest) return latest;
  const [y, m] = ym.split("-").map(Number);
  const lastDay = y && m ? new Date(Date.UTC(y, m, 0)).getUTCDate() : 28;
  return `${ym}-${String(lastDay).padStart(2, "0")}`;
}

function deltaPercent(cur: number, prev: number): number | null {
  if (prev <= 0.005) return null;
  return Math.round(((cur - prev) / prev) * 100);
}

export function buildMoneyFlowData(
  db: DB,
  range: MoneyFlowRange,
  accountScope: MoneyFlowAccountScope = "all",
  anchorMonth = today().slice(0, 7),
): MoneyFlowData {
  const ym = /^\d{4}-\d{2}$/.test(anchorMonth)
    ? anchorMonth
    : today().slice(0, 7);
  const r = db.settings.khrRate || 4100;
  const anchorDay = resolveFlowAnchorDay(db, ym);

  let inCurrent: (date: string) => boolean;
  let inPrevious: (date: string) => boolean;
  let scopeLabel: string;

  if (range === "1w") {
    const curDays = new Set(getTrailingDays(anchorDay, 7));
    const prevEnd = addDays(anchorDay, -7);
    const prevDays = new Set(getTrailingDays(prevEnd, 7));
    inCurrent = (d) => curDays.has(d);
    inPrevious = (d) => prevDays.has(d);
    scopeLabel = `7 days to ${shortDate(anchorDay)}`;
  } else {
    const monthsCount = range === "1m" ? 1 : range === "3m" ? 3 : 12;
    const curMonths = getTrailingMonths(monthsCount, ym);
    const curSet = new Set(curMonths);
    const prevAnchor = previousMonth(curMonths[0] ?? ym);
    const prevSet = new Set(getTrailingMonths(monthsCount, prevAnchor));
    inCurrent = (d) => curSet.has(d.slice(0, 7));
    inPrevious = (d) => prevSet.has(d.slice(0, 7));
    scopeLabel =
      range === "1m"
        ? new Date(ym + "-01T00:00:00Z").toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
            timeZone: "UTC",
          })
        : range === "3m"
          ? "Last 3 months"
          : "Last 12 months";
  }

  // 1. Income Sources
  const sourceMap = new Map<string, { amount: number; count: number }>();
  const addSource = (label: string, usd: number) => {
    if (usd <= 0) return;
    const prev = sourceMap.get(label) ?? { amount: 0, count: 0 };
    prev.amount += usd;
    prev.count += 1;
    sourceMap.set(label, prev);
  };

  if (accountScope === "all" || accountScope === "Studio") {
    const invIds = new Set(
      db.invoices.filter((i) => isInvoice(i)).map((i) => i.id),
    );
    for (const p of db.payments) {
      if (!invIds.has(p.invoiceId) || !inCurrent(p.date)) continue;
      addSource("Client work", toUSD(p.amount, p.currency, r));
    }
  }

  if (accountScope === "all" || accountScope === "Personal") {
    for (const inc of db.personalIncome ?? []) {
      if (!inCurrent(inc.date)) continue;
      addSource(
        inc.source || "Personal income",
        toUSD(inc.amount, inc.currency, r),
      );
    }
  }

  const rawSources = Array.from(sourceMap.entries())
    .map(([label, v]) => ({ label, amount: v.amount, count: v.count }))
    .sort((a, b) => b.amount - a.amount);

  const sources: MoneyFlowSource[] = [];
  if (rawSources.length <= 4) {
    rawSources.forEach((s, i) =>
      sources.push({
        id: `src-${i}`,
        label: s.label,
        amount: s.amount,
        count: s.count,
        color: SOURCE_COLORS[i % SOURCE_COLORS.length]!,
      }),
    );
  } else {
    rawSources.slice(0, 3).forEach((s, i) =>
      sources.push({
        id: `src-${i}`,
        label: s.label,
        amount: s.amount,
        count: s.count,
        color: SOURCE_COLORS[i % SOURCE_COLORS.length]!,
      }),
    );
    const tail = rawSources.slice(3);
    sources.push({
      id: "src-other",
      label: "Other income",
      amount: tail.reduce((s, x) => s + x.amount, 0),
      count: tail.reduce((s, x) => s + x.count, 0),
      color: SOURCE_COLORS[3]!,
    });
  }

  const totalIncome = sources.reduce((s, x) => s + x.amount, 0);

  // 2. Expenses by (account + category) for current and previous periods
  interface CatAgg {
    key: string;
    account: Account;
    category: string;
    bucketId: BucketId;
    amount: number;
    prevAmount: number;
  }
  const catMap = new Map<string, CatAgg>();
  const ensureCat = (account: Account, category: string) => {
    const cleanCat = category || "Other";
    const key = `${account}:${cleanCat}`;
    let entry = catMap.get(key);
    if (!entry) {
      entry = {
        key,
        account,
        category: cleanCat,
        bucketId: classifyExpenseBucket(account, cleanCat),
        amount: 0,
        prevAmount: 0,
      };
      catMap.set(key, entry);
    }
    return entry;
  };

  for (const e of db.expenses) {
    const acc = expenseAccount(e);
    if (accountScope !== "all" && acc !== accountScope) continue;
    const usd = toUSD(e.amount, e.currency, r);
    if (usd <= 0) continue;
    if (inCurrent(e.date)) {
      ensureCat(acc, e.category).amount += usd;
    } else if (inPrevious(e.date)) {
      ensureCat(acc, e.category).prevAmount += usd;
    }
  }

  const activeCats = Array.from(catMap.values())
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  const totalSpend = activeCats.reduce((s, c) => s + c.amount, 0);
  const totalKept = Math.max(0, totalIncome - totalSpend);
  const keptPct =
    totalIncome > 0 ? Math.round((totalKept / totalIncome) * 100) : 0;

  // 3. Build Buckets in clean order: Needs, Wants, Studio, Future
  const bucketTotals: Record<BucketId, number> = {
    needs: 0,
    wants: 0,
    studio: 0,
    future: totalKept,
  };
  for (const c of activeCats) {
    bucketTotals[c.bucketId] += c.amount;
  }

  const totalFlowBase = Math.max(totalIncome, totalSpend);
  const bucketOrder: BucketId[] = ["needs", "wants", "studio", "future"];
  const buckets: MoneyFlowBucket[] = bucketOrder
    .filter((id) => bucketTotals[id] > 0.005)
    .map((id) => ({
      id,
      label: BUCKET_META[id].label,
      amount: bucketTotals[id],
      pct:
        totalFlowBase > 0
          ? Math.round((bucketTotals[id] / totalFlowBase) * 100)
          : 0,
      color: BUCKET_META[id].color,
    }));

  // Adjust rounding so displayed % of populated buckets feels coherent
  if (buckets.length > 0 && totalFlowBase > 0) {
    const sumPct = buckets.reduce((s, b) => s + b.pct, 0);
    if (sumPct !== 100) {
      const largest = buckets.reduce((a, b) => (b.amount > a.amount ? b : a));
      largest.pct = Math.max(0, largest.pct + (100 - sumPct));
    }
  }

  // 4. Build Targets grouped under each bucket (folding small tails to keep Sankey crisp)
  const targets: MoneyFlowTarget[] = [];
  for (const b of buckets) {
    const bucketCats = activeCats
      .filter((c) => c.bucketId === b.id)
      .sort((a, b2) => b2.amount - a.amount);

    if (b.id === "studio") {
      // Show top 2 Studio categories + fold remaining into "Studio costs" if > 3
      const maxRows = 3;
      if (bucketCats.length <= maxRows) {
        for (const c of bucketCats) {
          targets.push({
            id: `tgt-${c.key}`,
            bucketId: b.id,
            label: c.category,
            amount: c.amount,
            prevAmount: c.prevAmount,
            deltaPct: deltaPercent(c.amount, c.prevAmount),
            account: c.account,
            category: c.category,
            color: BUCKET_META[b.id].color,
          });
        }
      } else {
        const head = bucketCats.slice(0, 2);
        const tail = bucketCats.slice(2);
        for (const c of head) {
          targets.push({
            id: `tgt-${c.key}`,
            bucketId: b.id,
            label: c.category,
            amount: c.amount,
            prevAmount: c.prevAmount,
            deltaPct: deltaPercent(c.amount, c.prevAmount),
            account: c.account,
            category: c.category,
            color: BUCKET_META[b.id].color,
          });
        }
        const tailAmt = tail.reduce((s, x) => s + x.amount, 0);
        const tailPrev = tail.reduce((s, x) => s + x.prevAmount, 0);
        targets.push({
          id: "tgt-studio-other",
          bucketId: b.id,
          label: "Other studio costs",
          amount: tailAmt,
          prevAmount: tailPrev,
          deltaPct: deltaPercent(tailAmt, tailPrev),
          account: tail[0]?.account ?? "Studio",
          category: tail[0]?.category ?? null,
          color: BUCKET_META[b.id].color,
        });
      }
      continue;
    }

    const maxCats = b.id === "needs" ? 4 : 3;
    const head = bucketCats.slice(0, maxCats);
    const tail = bucketCats.slice(maxCats);
    for (const c of head) {
      targets.push({
        id: `tgt-${c.key}`,
        bucketId: b.id,
        label: c.category,
        amount: c.amount,
        prevAmount: c.prevAmount,
        deltaPct: deltaPercent(c.amount, c.prevAmount),
        account: c.account,
        category: c.category,
        color: BUCKET_META[b.id].color,
      });
    }
    if (tail.length > 0) {
      const tailAmt = tail.reduce((s, x) => s + x.amount, 0);
      const tailPrev = tail.reduce((s, x) => s + x.prevAmount, 0);
      targets.push({
        id: `tgt-${b.id}-other`,
        bucketId: b.id,
        label: `Other ${b.label.toLowerCase()}`,
        amount: tailAmt,
        prevAmount: tailPrev,
        deltaPct: deltaPercent(tailAmt, tailPrev),
        account: tail[0]?.account ?? null,
        category: tail[0]?.category ?? null,
        color: BUCKET_META[b.id].color,
      });
    }

    if (b.id === "future" && totalKept > 0.005) {
      targets.push({
        id: "tgt-future-kept",
        bucketId: "future",
        label: "Left in balance",
        amount: totalKept,
        prevAmount: 0,
        deltaPct: null,
        account: null,
        category: null,
        isSurplus: true,
        color: BUCKET_META.future.color,
      });
    }
  }

  // 5. Build Links
  const hasIncome = sources.length > 0 && totalIncome > 0;
  const sourceToBucketLinks: MoneyFlowLink[] = [];
  if (hasIncome && buckets.length > 0) {
    const bucketSum = buckets.reduce((s, b) => s + b.amount, 0) || 1;
    for (const src of sources) {
      for (const b of buckets) {
        const share = (src.amount / totalIncome) * (b.amount / bucketSum);
        const linkAmount = Math.min(totalIncome, bucketSum) * share;
        if (linkAmount <= 0.005) continue;
        sourceToBucketLinks.push({
          id: `${src.id}__${b.id}`,
          fromId: src.id,
          toId: b.id,
          amount: linkAmount,
          color: src.color,
          bucketId: b.id,
        });
      }
    }
  }

  const bucketToTargetLinks: MoneyFlowLink[] = targets.map((t) => ({
    id: `${t.bucketId}__${t.id}`,
    fromId: t.bucketId,
    toId: t.id,
    amount: t.amount,
    color: BUCKET_META[t.bucketId].color,
    bucketId: t.bucketId,
  }));

  // 6. Top Spending Categories with delta %
  const topCategories: MoneyFlowCategoryChange[] = activeCats
    .slice(0, 5)
    .map((c) => ({
      key: c.key,
      account: c.account,
      category: c.category,
      amount: c.amount,
      prevAmount: c.prevAmount,
      deltaPct: deltaPercent(c.amount, c.prevAmount),
      color: BUCKET_META[c.bucketId].color,
    }));

  return {
    range,
    scopeLabel,
    accountScope,
    totalIncome,
    totalSpend,
    totalKept,
    keptPct,
    totalFlowBase,
    hasIncome,
    sources,
    buckets,
    targets,
    sourceToBucketLinks,
    bucketToTargetLinks,
    topCategories,
  };
}

export function buildCategoryTimeline(
  db: DB,
  account: Account,
  category: string,
  range: CategoryTimelineRange,
  anchorMonth = today().slice(0, 7),
): CategoryTimelineResult {
  const r = db.settings.khrRate || 4100;
  const ym = /^\d{4}-\d{2}$/.test(anchorMonth)
    ? anchorMonth
    : today().slice(0, 7);
  const anchorDay = resolveFlowAnchorDay(db, ym);
  const monthlyLimit = categoryLimit(db, account, category);

  const allCategoryExpenses = db.expenses
    .filter((e) => expenseAccount(e) === account && e.category === category)
    .sort((a, b) => b.date.localeCompare(a.date));

  if (range === "1w") {
    const curDays = getTrailingDays(anchorDay, 7);
    const curSet = new Set(curDays);
    const prevEnd = addDays(anchorDay, -7);
    const prevSet = new Set(getTrailingDays(prevEnd, 7));

    const items = allCategoryExpenses.filter((e) => curSet.has(e.date));
    const totalUSD = items.reduce(
      (s, e) => s + toUSD(e.amount, e.currency, r),
      0,
    );
    const prevTotalUSD = allCategoryExpenses
      .filter((e) => prevSet.has(e.date))
      .reduce((s, e) => s + toUSD(e.amount, e.currency, r), 0);

    const byDay = new Map<string, { amount: number; count: number }>();
    for (const e of items) {
      const prev = byDay.get(e.date) ?? { amount: 0, count: 0 };
      prev.amount += toUSD(e.amount, e.currency, r);
      prev.count += 1;
      byDay.set(e.date, prev);
    }

    const points: CategoryTimelinePoint[] = curDays.map((iso) => {
      const dt = new Date(iso + "T00:00:00Z");
      const agg = byDay.get(iso);
      return {
        key: iso,
        label: dt.toLocaleDateString("en-US", {
          weekday: "short",
          timeZone: "UTC",
        }),
        fullDate: dt.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          timeZone: "UTC",
        }),
        amount: agg?.amount ?? 0,
        count: agg?.count ?? 0,
      };
    });

    return {
      range,
      scopeLabel: `7 days to ${shortDate(anchorDay)}`,
      prevLabel: "Prior 7d",
      totalUSD,
      prevTotalUSD,
      deltaPct: deltaPercent(totalUSD, prevTotalUSD),
      txCount: items.length,
      avgPerTx: items.length > 0 ? totalUSD / items.length : 0,
      monthlyLimit,
      scaledLimit: monthlyLimit * (7 / 30),
      items,
      points,
    };
  }

  if (range === "1m") {
    const prevYm = previousMonth(ym);
    const items = allCategoryExpenses.filter((e) => e.date.startsWith(ym));
    const totalUSD = items.reduce(
      (s, e) => s + toUSD(e.amount, e.currency, r),
      0,
    );
    const prevTotalUSD = allCategoryExpenses
      .filter((e) => e.date.startsWith(prevYm))
      .reduce((s, e) => s + toUSD(e.amount, e.currency, r), 0);

    const [y, m] = ym.split("-").map(Number);
    const daysInMonth = y && m ? new Date(Date.UTC(y, m, 0)).getUTCDate() : 30;
    const byDay = new Map<string, { amount: number; count: number }>();
    for (const e of items) {
      const prev = byDay.get(e.date) ?? { amount: 0, count: 0 };
      prev.amount += toUSD(e.amount, e.currency, r);
      prev.count += 1;
      byDay.set(e.date, prev);
    }

    const points: CategoryTimelinePoint[] = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const iso = `${ym}-${String(day).padStart(2, "0")}`;
      const dt = new Date(iso + "T00:00:00Z");
      const agg = byDay.get(iso);
      points.push({
        key: iso,
        label: String(day),
        fullDate: dt.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          timeZone: "UTC",
        }),
        amount: agg?.amount ?? 0,
        count: agg?.count ?? 0,
      });
    }

    const monthLabel = new Date(ym + "-01T00:00:00Z").toLocaleDateString(
      "en-US",
      { month: "long", year: "numeric", timeZone: "UTC" },
    );
    const shortPrev = new Date(prevYm + "-01T00:00:00Z").toLocaleDateString(
      "en-US",
      { month: "short", timeZone: "UTC" },
    );

    return {
      range,
      scopeLabel: monthLabel,
      prevLabel: `Spent in ${shortPrev}`,
      totalUSD,
      prevTotalUSD,
      deltaPct: deltaPercent(totalUSD, prevTotalUSD),
      txCount: items.length,
      avgPerTx: items.length > 0 ? totalUSD / items.length : 0,
      monthlyLimit,
      scaledLimit: monthlyLimit,
      items,
      points,
    };
  }

  if (range === "all") {
    let minYm = ym;
    for (const e of allCategoryExpenses) {
      const eYm = e.date.slice(0, 7);
      if (/^\d{4}-\d{2}$/.test(eYm) && eYm < minYm) minYm = eYm;
    }
    const [sy, sm] = minYm.split("-").map(Number);
    const [ey, em] = ym.split("-").map(Number);
    const spanMonths =
      sy && sm && ey && em
        ? Math.max(6, Math.min(36, (ey - sy) * 12 + (em - sm) + 1))
        : 12;
    const months = getTrailingMonths(spanMonths, ym);
    const byMonth = new Map<string, { amount: number; count: number }>();
    for (const e of allCategoryExpenses) {
      const m = e.date.slice(0, 7);
      const prev = byMonth.get(m) ?? { amount: 0, count: 0 };
      prev.amount += toUSD(e.amount, e.currency, r);
      prev.count += 1;
      byMonth.set(m, prev);
    }
    const totalUSD = allCategoryExpenses.reduce(
      (s, e) => s + toUSD(e.amount, e.currency, r),
      0,
    );
    const points: CategoryTimelinePoint[] = months.map((m) => {
      const dt = new Date(m + "-01T00:00:00Z");
      const agg = byMonth.get(m);
      return {
        key: m,
        label: dt.toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
          timeZone: "UTC",
        }),
        fullDate: dt.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
          timeZone: "UTC",
        }),
        amount: agg?.amount ?? 0,
        count: agg?.count ?? 0,
      };
    });

    return {
      range,
      scopeLabel: "All time",
      prevLabel: "",
      totalUSD,
      prevTotalUSD: null,
      deltaPct: null,
      txCount: allCategoryExpenses.length,
      avgPerTx:
        allCategoryExpenses.length > 0
          ? totalUSD / allCategoryExpenses.length
          : 0,
      monthlyLimit,
      scaledLimit: monthlyLimit * months.length,
      items: allCategoryExpenses,
      points,
    };
  }

  const monthsCount = range === "3m" ? 3 : range === "6m" ? 6 : 12;
  const curMonths = getTrailingMonths(monthsCount, ym);
  const curSet = new Set(curMonths);
  const prevAnchor = previousMonth(curMonths[0] ?? ym);
  const prevSet = new Set(getTrailingMonths(monthsCount, prevAnchor));

  const items = allCategoryExpenses.filter((e) =>
    curSet.has(e.date.slice(0, 7)),
  );
  const totalUSD = items.reduce(
    (s, e) => s + toUSD(e.amount, e.currency, r),
    0,
  );
  const prevTotalUSD = allCategoryExpenses
    .filter((e) => prevSet.has(e.date.slice(0, 7)))
    .reduce((s, e) => s + toUSD(e.amount, e.currency, r), 0);

  const byMonth = new Map<string, { amount: number; count: number }>();
  for (const e of items) {
    const m = e.date.slice(0, 7);
    const prev = byMonth.get(m) ?? { amount: 0, count: 0 };
    prev.amount += toUSD(e.amount, e.currency, r);
    prev.count += 1;
    byMonth.set(m, prev);
  }

  const points: CategoryTimelinePoint[] = curMonths.map((m) => {
    const dt = new Date(m + "-01T00:00:00Z");
    const agg = byMonth.get(m);
    return {
      key: m,
      label: dt.toLocaleDateString("en-US", {
        month: "short",
        timeZone: "UTC",
      }),
      fullDate: dt.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }),
      amount: agg?.amount ?? 0,
      count: agg?.count ?? 0,
    };
  });

  return {
    range,
    scopeLabel:
      range === "3m"
        ? "Last 3 months"
        : range === "6m"
          ? "Last 6 months"
          : "Last 12 months",
    prevLabel: `Prior ${monthsCount}m`,
    totalUSD,
    prevTotalUSD,
    deltaPct: deltaPercent(totalUSD, prevTotalUSD),
    txCount: items.length,
    avgPerTx: items.length > 0 ? totalUSD / items.length : 0,
    monthlyLimit,
    scaledLimit: monthlyLimit * monthsCount,
    items,
    points,
  };
}
