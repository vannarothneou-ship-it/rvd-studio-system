import {
  addDays,
  cardKind,
  categoryLimit,
  expenseAccount,
  goalAccount,
  invoiceView,
  isInvoice,
  previousMonth,
  toUSD,
  today,
  type DB,
} from "@/lib/store";
import { getDueReminders } from "@/lib/reminders";

export type InsightSeverity = "critical" | "warn" | "good" | "info";

export interface CentralInsight {
  id: string;
  severity: InsightSeverity;
  area: "Cash" | "Studio" | "Work" | "Goals" | "Car & Life";
  title: string;
  detail: string;
  metric?: string;
  actionLabel?: string;
  actionTo?: string;
}

export interface CategoryPaceItem {
  category: string;
  spentUSD: number;
  limitUSD: number;
  pct: number;
  baseline3moUSD: number;
  projectedMonthEndUSD: number;
  status: "over" | "watch" | "ok";
}

export interface GoalEtaItem {
  id: string;
  name: string;
  account: "Studio" | "Personal";
  current: number;
  target: number;
  pct: number;
  cadence: "daily" | "monthly" | "yearly";
  contributionAmount: number;
  monthlyRateUSD: number;
  etaMonths: number | null;
  etaDate: string | null;
}

export interface ForecastPoint {
  dayOffset: number;
  label: string;
  date: string;
  baselineUSD: number;
  scenarioUSD: number;
}

export interface CentralIntelligenceSnapshot {
  refDate: string;
  month: string;
  netWorthLiquidUSD: number;
  studioBalanceUSD: number;
  personalBalanceUSD: number;
  monthlyIncomeAvgUSD: number;
  monthlyBurnUSD: number;
  monthlyNetUSD: number;
  savingsRatePct: number;
  runwayMonths: number | null;
  openARUSD: number;
  overdueARUSD: number;
  overdueInvoiceCount: number;
  overdueClientNames: string[];
  activeWorkCount: number;
  dueSoonWorkCount: number;
  dueReminderCount: number;
  latestCarOdoKm: number | null;
  learnedRuleCount: number;
  categoryPace: CategoryPaceItem[];
  goalEtas: GoalEtaItem[];
  insights: CentralInsight[];
}

function addMonthsIso(isoDate: string, months: number): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const dt = new Date(
    Date.UTC(y || 2026, (m || 1) - 1 + Math.round(months), d || 1),
  );
  return dt.toISOString().slice(0, 10);
}

function cadenceToMonthlyUSD(
  cadence: "daily" | "monthly" | "yearly" | undefined,
  amount: number | undefined,
): number {
  const amt = Math.max(0, Number(amount) || 0);
  if (amt <= 0) return 0;
  if (cadence === "daily") return amt * 30.4375;
  if (cadence === "yearly") return amt / 12;
  return amt;
}

export function computeCentralIntelligence(
  db: DB,
  refDate: string = today(),
): CentralIntelligenceSnapshot {
  const rate = db.settings.khrRate || 4100;
  const month = refDate.slice(0, 7);
  const m1 = previousMonth(month);
  const m2 = previousMonth(m1);
  const m3 = previousMonth(m2);
  const trailing3Months = new Set([m1, m2, m3]);

  let studioInAll = 0;
  let studioOutAll = 0;
  let personalInAll = 0;
  let personalOutAll = 0;

  let trailing3In = 0;
  let trailing3Burn = 0;
  let thisMonthIn = 0;
  let thisMonthBurn = 0;

  const invIds = new Set(db.invoices.filter(isInvoice).map((i) => i.id));
  for (const p of db.payments) {
    if (!invIds.has(p.invoiceId)) continue;
    const usd = toUSD(p.amount, p.currency, rate);
    studioInAll += usd;
    const ym = p.date.slice(0, 7);
    if (trailing3Months.has(ym)) trailing3In += usd;
    if (ym === month) thisMonthIn += usd;
  }

  for (const inc of db.personalIncome ?? []) {
    const usd = toUSD(inc.amount, inc.currency, rate);
    personalInAll += usd;
    const ym = inc.date.slice(0, 7);
    if (trailing3Months.has(ym)) trailing3In += usd;
    if (ym === month) thisMonthIn += usd;
  }

  const personalMonthByCat = new Map<string, number>();
  const personal3MoByCat = new Map<string, number>();

  for (const e of db.expenses) {
    const usd = toUSD(e.amount, e.currency, rate);
    const acc = expenseAccount(e);
    const ym = e.date.slice(0, 7);
    if (acc === "Studio") {
      studioOutAll += usd;
    } else {
      personalOutAll += usd;
      if (ym === month) {
        personalMonthByCat.set(
          e.category,
          (personalMonthByCat.get(e.category) ?? 0) + usd,
        );
      }
      if (trailing3Months.has(ym)) {
        personal3MoByCat.set(
          e.category,
          (personal3MoByCat.get(e.category) ?? 0) + usd,
        );
      }
    }
    if (trailing3Months.has(ym)) trailing3Burn += usd;
    if (ym === month) thisMonthBurn += usd;
  }

  const studioBalanceUSD = studioInAll - studioOutAll;
  const personalBalanceUSD = personalInAll - personalOutAll;
  const netWorthLiquidUSD = studioBalanceUSD + personalBalanceUSD;

  // Use trailing 3-month average when available; fall back to current month if ledger is brand new
  const monthlyIncomeAvgUSD = trailing3In > 0 ? trailing3In / 3 : thisMonthIn;
  const monthlyBurnUSD = trailing3Burn > 0 ? trailing3Burn / 3 : thisMonthBurn;
  const monthlyNetUSD = monthlyIncomeAvgUSD - monthlyBurnUSD;
  const savingsRatePct =
    monthlyIncomeAvgUSD > 0
      ? Math.round((monthlyNetUSD / monthlyIncomeAvgUSD) * 100)
      : 0;

  const runwayMonths =
    monthlyNetUSD < -1 && netWorthLiquidUSD > 0
      ? Math.round((netWorthLiquidUSD / Math.abs(monthlyNetUSD)) * 10) / 10
      : monthlyBurnUSD > 1 && netWorthLiquidUSD > 0
        ? Math.round((netWorthLiquidUSD / monthlyBurnUSD) * 10) / 10
        : null;

  // Open & overdue A/R
  const clientMap = new Map(db.clients.map((c) => [c.id, c.name]));
  let openARUSD = 0;
  let overdueARUSD = 0;
  let overdueInvoiceCount = 0;
  const overdueClientSet = new Set<string>();

  for (const inv of db.invoices) {
    if (!isInvoice(inv)) continue;
    const v = invoiceView(inv, db);
    if (v.status === "Draft" || v.balanceUSD <= 0.01) continue;
    openARUSD += v.balanceUSD;
    if (v.status === "Overdue" || (inv.due && inv.due < refDate)) {
      overdueARUSD += v.balanceUSD;
      overdueInvoiceCount += 1;
      const cName = clientMap.get(inv.clientId);
      if (cName) overdueClientSet.add(cName);
    }
  }

  // Category burn pace for the current month
  const [yNum, mNum] = month.split("-").map(Number);
  const daysInMonth =
    yNum && mNum ? new Date(Date.UTC(yNum, mNum, 0)).getUTCDate() : 30;
  const currentDay = refDate.startsWith(month)
    ? Math.max(1, Number(refDate.slice(8, 10)) || 1)
    : daysInMonth;
  const monthProgress = Math.max(0.15, currentDay / daysInMonth);

  const allCats = new Set<string>([
    ...personalMonthByCat.keys(),
    ...personal3MoByCat.keys(),
  ]);
  const categoryPace: CategoryPaceItem[] = Array.from(allCats)
    .map((cat) => {
      const spentUSD = personalMonthByCat.get(cat) ?? 0;
      const limitUSD = categoryLimit(db, "Personal", cat);
      const baseline3moUSD = (personal3MoByCat.get(cat) ?? 0) / 3;
      const pct = limitUSD > 0 ? Math.round((spentUSD / limitUSD) * 100) : 0;
      const projectedMonthEndUSD =
        currentDay >= daysInMonth ? spentUSD : spentUSD / monthProgress;
      const status: CategoryPaceItem["status"] =
        limitUSD > 0 && spentUSD > limitUSD
          ? "over"
          : limitUSD > 0 &&
              (pct >= 80 ||
                (projectedMonthEndUSD > limitUSD * 1.1 && spentUSD > 0))
            ? "watch"
            : "ok";
      return {
        category: cat,
        spentUSD,
        limitUSD,
        pct,
        baseline3moUSD,
        projectedMonthEndUSD,
        status,
      };
    })
    .filter((c) => c.spentUSD > 0 || c.baseline3moUSD > 0)
    .sort((a, b) => b.pct - a.pct || b.spentUSD - a.spentUSD);

  // Saving goal ETAs
  const goalEtas: GoalEtaItem[] = db.goals.map((g) => {
    const account = goalAccount(g);
    const current = g.current;
    const target = Math.max(1, g.target);
    const pct = Math.min(100, Math.round((current / target) * 100));
    const cadence = g.cadence ?? "monthly";
    const contributionAmount = Math.max(0, Number(g.contributionAmount) || 0);
    const monthlyRateUSD = cadenceToMonthlyUSD(cadence, contributionAmount);
    const remaining = Math.max(0, target - current);
    const etaMonths =
      remaining <= 0
        ? 0
        : monthlyRateUSD > 0
          ? Math.ceil((remaining / monthlyRateUSD) * 10) / 10
          : null;
    const etaDate =
      etaMonths === null
        ? null
        : etaMonths === 0
          ? refDate
          : addMonthsIso(refDate, etaMonths);
    return {
      id: g.id,
      name: g.name,
      account,
      current,
      target,
      pct,
      cadence,
      contributionAmount,
      monthlyRateUSD,
      etaMonths,
      etaDate,
    };
  });

  // Work & Reminders
  const weekAhead = addDays(refDate, 7);
  const activeWork = (db.workTasks ?? []).filter(
    (t) => t.status !== "Completed",
  );
  const dueSoonWork = activeWork.filter(
    (t) => t.dueDate && t.dueDate <= weekAhead,
  );
  const dueReminders = getDueReminders(db.reminders ?? [], refDate);
  const odoReminders = (db.reminders ?? [])
    .filter((rm) => rm.category === "car-odo" && (rm.odoKm ?? 0) > 0)
    .sort((a, b) => b.date.localeCompare(a.date));
  const latestCarOdoKm = odoReminders[0]?.odoKm ?? null;

  // Build prioritized cross-DB insights
  const insights: CentralInsight[] = [];

  if (overdueARUSD > 0) {
    const names = Array.from(overdueClientSet).slice(0, 2).join(", ");
    insights.push({
      id: "overdue-ar",
      severity: "critical",
      area: "Studio",
      title: `${overdueInvoiceCount} overdue invoice${overdueInvoiceCount === 1 ? "" : "s"} awaiting collection`,
      detail: names
        ? `Follow up with ${names} to recover $${Math.round(overdueARUSD).toLocaleString("en-US")} into Studio liquidity.`
        : `$${Math.round(overdueARUSD).toLocaleString("en-US")} past due across studio invoices.`,
      metric: `$${Math.round(overdueARUSD).toLocaleString("en-US")}`,
      actionLabel: "Invoices",
      actionTo: "/invoices",
    });
  }

  const overCats = categoryPace.filter((c) => c.status === "over");
  if (overCats.length > 0) {
    const top = overCats[0]!;
    insights.push({
      id: `over-${top.category}`,
      severity: "warn",
      area: "Cash",
      title: `${top.category} exceeded its monthly limit`,
      detail: `Spent $${top.spentUSD.toFixed(2)} of $${top.limitUSD.toFixed(0)} budget (${top.pct}%).`,
      metric: `${top.pct}%`,
      actionLabel: "Inspect",
      actionTo: "/personal",
    });
  } else {
    const watchCats = categoryPace.filter((c) => c.status === "watch");
    if (watchCats.length > 0) {
      const top = watchCats[0]!;
      insights.push({
        id: `watch-${top.category}`,
        severity: "warn",
        area: "Cash",
        title: `${top.category} pacing above monthly target`,
        detail: `At $${top.spentUSD.toFixed(0)} so far, projected month-end is ~$${Math.round(top.projectedMonthEndUSD)}.`,
        metric: `${top.pct}%`,
        actionLabel: "Review",
        actionTo: "/personal",
      });
    }
  }

  if (dueReminders.length > 0) {
    const first = dueReminders[0]!;
    const when =
      first.daysUntil === 0
        ? "Today"
        : first.daysUntil === 1
          ? "Tomorrow"
          : `In ${first.daysUntil}d`;
    insights.push({
      id: `rem-${first.reminder.id}`,
      severity: first.daysUntil <= 1 ? "warn" : "info",
      area: "Car & Life",
      title: `${first.reminder.title} (${when})`,
      detail:
        first.reminder.odoKm && first.reminder.odoKm > 0
          ? `Logged at ${Math.round(first.reminder.odoKm).toLocaleString("en-US")} km · ${first.reminder.notes || "Scheduled checkup"}`
          : first.reminder.notes || `Scheduled for ${first.occurrenceDate}`,
      metric: when,
      actionLabel: "Calendar",
      actionTo: "/work",
    });
  }

  if (dueSoonWork.length > 0) {
    insights.push({
      id: "work-due-soon",
      severity: "info",
      area: "Work",
      title: `${dueSoonWork.length} work deliverable${dueSoonWork.length === 1 ? "" : "s"} due within 7 days`,
      detail: `Next up: ${dueSoonWork[0]!.projectName || dueSoonWork[0]!.company || "Work"} — ${dueSoonWork[0]!.title}.`,
      metric: `${dueSoonWork.length} due`,
      actionLabel: "Work",
      actionTo: "/work",
    });
  }

  if (monthlyIncomeAvgUSD > 0) {
    insights.push({
      id: "cash-velocity",
      severity:
        savingsRatePct >= 20 ? "good" : savingsRatePct < 0 ? "warn" : "info",
      area: "Cash",
      title:
        savingsRatePct >= 0
          ? `Saving ${savingsRatePct}% of combined cash inflow`
          : `Monthly outflow exceeds inflow by $${Math.round(Math.abs(monthlyNetUSD))}`,
      detail: `3-mo avg inflow $${Math.round(monthlyIncomeAvgUSD).toLocaleString("en-US")}/mo vs burn $${Math.round(monthlyBurnUSD).toLocaleString("en-US")}/mo.`,
      metric: `${savingsRatePct}%`,
      actionLabel: "Combined",
      actionTo: "/finance?view=combined",
    });
  }

  const closestGoal = goalEtas
    .filter((g) => g.current < g.target && g.etaMonths !== null)
    .sort((a, b) => (a.etaMonths ?? 999) - (b.etaMonths ?? 999))[0];
  if (closestGoal) {
    insights.push({
      id: `goal-${closestGoal.id}`,
      severity: "good",
      area: "Goals",
      title: `${closestGoal.name} on track in ~${closestGoal.etaMonths} mo`,
      detail: `${closestGoal.pct}% funded ($${Math.round(closestGoal.current).toLocaleString("en-US")} / $${Math.round(closestGoal.target).toLocaleString("en-US")}) at $${Math.round(closestGoal.monthlyRateUSD)}/mo.`,
      metric: `${closestGoal.pct}%`,
      actionLabel: "Goals",
      actionTo: closestGoal.account === "Studio" ? "/finance" : "/personal",
    });
  }

  return {
    refDate,
    month,
    netWorthLiquidUSD,
    studioBalanceUSD,
    personalBalanceUSD,
    monthlyIncomeAvgUSD,
    monthlyBurnUSD,
    monthlyNetUSD,
    savingsRatePct,
    runwayMonths,
    openARUSD,
    overdueARUSD,
    overdueInvoiceCount,
    overdueClientNames: Array.from(overdueClientSet),
    activeWorkCount: activeWork.length,
    dueSoonWorkCount: dueSoonWork.length,
    dueReminderCount: dueReminders.length,
    latestCarOdoKm,
    learnedRuleCount: (db.learnedReceiptRules ?? []).length,
    categoryPace,
    goalEtas,
    insights: insights.slice(0, 6),
  };
}

export function simulateCashScenario(
  snapshot: CentralIntelligenceSnapshot,
  opts: {
    horizonDays: 30 | 60 | 90;
    monthlySaveBoostUSD: number;
    collectOverduePct: number;
  },
  refDate: string = today(),
): {
  points: ForecastPoint[];
  endBaselineUSD: number;
  endScenarioUSD: number;
  deltaUSD: number;
  goalEtas: GoalEtaItem[];
} {
  const start = snapshot.netWorthLiquidUSD;
  const dailyNet = snapshot.monthlyNetUSD / 30.4375;
  const dailyBoost = Math.max(0, opts.monthlySaveBoostUSD) / 30.4375;
  const collectedBonus =
    snapshot.overdueARUSD *
    (Math.min(100, Math.max(0, opts.collectOverduePct)) / 100);

  const steps = opts.horizonDays === 30 ? 6 : opts.horizonDays === 60 ? 8 : 9;
  const stepDays = opts.horizonDays / steps;
  const points: ForecastPoint[] = [];

  for (let i = 0; i <= steps; i++) {
    const dayOffset = Math.round(i * stepDays);
    const date = addDays(refDate, dayOffset);
    const baselineUSD = start + dailyNet * dayOffset;
    const arFactor = dayOffset >= 10 ? 1 : dayOffset / 10;
    const scenarioUSD =
      start + (dailyNet + dailyBoost) * dayOffset + collectedBonus * arFactor;
    points.push({
      dayOffset,
      label: dayOffset === 0 ? "Now" : `+${dayOffset}d`,
      date,
      baselineUSD: Math.round(baselineUSD * 100) / 100,
      scenarioUSD: Math.round(scenarioUSD * 100) / 100,
    });
  }

  const endBaselineUSD = points[points.length - 1]?.baselineUSD ?? start;
  const endScenarioUSD = points[points.length - 1]?.scenarioUSD ?? start;

  const extraPerGoal =
    snapshot.goalEtas.length > 0
      ? opts.monthlySaveBoostUSD / Math.max(1, snapshot.goalEtas.length)
      : 0;

  const goalEtas = snapshot.goalEtas.map((g) => {
    const newRate = g.monthlyRateUSD + extraPerGoal;
    const remaining = Math.max(0, g.target - g.current);
    const etaMonths =
      remaining <= 0
        ? 0
        : newRate > 0
          ? Math.ceil((remaining / newRate) * 10) / 10
          : null;
    const etaDate =
      etaMonths === null
        ? null
        : etaMonths === 0
          ? refDate
          : addMonthsIso(refDate, etaMonths);
    return {
      ...g,
      monthlyRateUSD: Math.round(newRate * 100) / 100,
      etaMonths,
      etaDate,
    };
  });

  return {
    points,
    endBaselineUSD,
    endScenarioUSD,
    deltaUSD: endScenarioUSD - endBaselineUSD,
    goalEtas,
  };
}

export function askCentralDB(
  db: DB,
  snapshot: CentralIntelligenceSnapshot,
  question: string,
): {
  answer: string;
  facts: { label: string; value: string }[];
  routeHint?: { label: string; to: string };
} {
  const q = question.trim().toLowerCase();
  const rate = db.settings.khrRate || 4100;
  const month = snapshot.month;

  if (!q) {
    return {
      answer:
        "Ask about top spending categories, overdue studio invoices, runway, saving goals, Debit vs Credit cards, work deadlines, or car ODO mileage.",
      facts: [
        {
          label: "Liquid Net",
          value: `$${Math.round(snapshot.netWorthLiquidUSD).toLocaleString("en-US")}`,
        },
        {
          label: "Monthly Burn",
          value: `$${Math.round(snapshot.monthlyBurnUSD).toLocaleString("en-US")}`,
        },
      ],
    };
  }

  // 1. Overdue A/R / clients owing money
  if (
    /\b(?:overdue|unpaid|owe|owes|a\/r|receivable|invoices?|clients?)\b/i.test(
      q,
    )
  ) {
    const names = snapshot.overdueClientNames.slice(0, 4).join(", ");
    return {
      answer:
        snapshot.overdueARUSD > 0
          ? `You have ${snapshot.overdueInvoiceCount} overdue invoice${snapshot.overdueInvoiceCount === 1 ? "" : "s"} totaling $${snapshot.overdueARUSD.toFixed(2)} (out of $${snapshot.openARUSD.toFixed(2)} open A/R).${names ? ` Clients: ${names}.` : ""}`
          : `All sent invoices are current. Total open A/R is $${snapshot.openARUSD.toFixed(2)}.`,
      facts: [
        { label: "Overdue A/R", value: `$${snapshot.overdueARUSD.toFixed(2)}` },
        { label: "Open A/R", value: `$${snapshot.openARUSD.toFixed(2)}` },
        { label: "Overdue Count", value: String(snapshot.overdueInvoiceCount) },
      ],
      routeHint: { label: "Open Invoices", to: "/invoices" },
    };
  }

  // 2. Car / Prius / ODO / Reminders
  if (
    /\b(?:odo|mileage|prius|cars?|oil|maintenance|reminders?|birthday)\b/i.test(
      q,
    )
  ) {
    const due = getDueReminders(db.reminders ?? [], snapshot.refDate);
    const nextRem = due[0];
    return {
      answer: snapshot.latestCarOdoKm
        ? `Latest logged car ODO is ${Math.round(snapshot.latestCarOdoKm).toLocaleString("en-US")} km.${nextRem ? ` Next reminder: "${nextRem.reminder.title}" in ${nextRem.daysUntil} day(s).` : " No urgent reminders due right now."}`
        : nextRem
          ? `Next due reminder is "${nextRem.reminder.title}" on ${nextRem.occurrenceDate} (${nextRem.daysUntil} day(s) away).`
          : "No car ODO mileage or upcoming reminders are due in the alert window.",
      facts: [
        {
          label: "Latest ODO",
          value: snapshot.latestCarOdoKm
            ? `${Math.round(snapshot.latestCarOdoKm).toLocaleString("en-US")} km`
            : "—",
        },
        { label: "Due Alerts", value: String(due.length) },
        {
          label: "Total Reminders",
          value: String((db.reminders ?? []).length),
        },
      ],
      routeHint: { label: "Open Calendar", to: "/work" },
    };
  }

  // 3. Debit vs Credit card split
  if (/\b(?:cards?|debit|credit|visa|mastercard)\b/i.test(q)) {
    let debit = 0;
    let credit = 0;
    for (const e of db.expenses) {
      if (expenseAccount(e) !== "Personal" || !e.date.startsWith(month))
        continue;
      const usd = toUSD(e.amount, e.currency, rate);
      const kind = cardKind(e.vendor);
      if (kind === "Credit") credit += usd;
      else debit += usd;
    }
    const total = debit + credit;
    const creditPct = total > 0 ? Math.round((credit / total) * 100) : 0;
    return {
      answer: `This month (${month}), personal spending was $${debit.toFixed(2)} on Debit and $${credit.toFixed(2)} on Credit (${creditPct}% credit ratio).`,
      facts: [
        { label: "Debit (Mo)", value: `$${debit.toFixed(2)}` },
        { label: "Credit (Mo)", value: `$${credit.toFixed(2)}` },
        { label: "Credit Share", value: `${creditPct}%` },
      ],
      routeHint: { label: "Personal Cards", to: "/personal" },
    };
  }

  // 4. Saving goals
  if (/\b(?:goals?|save|saving|savings|target|eta)\b/i.test(q)) {
    const active = snapshot.goalEtas.slice(0, 3);
    if (active.length === 0) {
      return {
        answer: "No saving goals are configured yet.",
        facts: [],
        routeHint: { label: "Add Goal", to: "/personal" },
      };
    }
    const top = active[0]!;
    return {
      answer: `You have ${snapshot.goalEtas.length} goal${snapshot.goalEtas.length === 1 ? "" : "s"}. "${top.name}" is ${top.pct}% funded ($${top.current.toFixed(0)} / $${top.target.toFixed(0)})${top.etaMonths !== null ? `, finishing in ~${top.etaMonths} mo` : ""}.`,
      facts: active.map((g) => ({
        label: g.name,
        value:
          g.etaMonths === 0
            ? "100% funded"
            : g.etaMonths !== null
              ? `${g.pct}% · ~${g.etaMonths}m`
              : `${g.pct}%`,
      })),
      routeHint: { label: "Saving Goals", to: "/personal" },
    };
  }

  // 5. Work tasks & Studio projects
  if (
    /\b(?:work|tasks?|projects?|deliverables?|deadlines?|schedule|dbg|ocic|connexion)\b/i.test(
      q,
    )
  ) {
    const activeStudio = db.projects.filter(
      (p) =>
        p.status === "Inquiry" ||
        p.status === "Quoted" ||
        p.status === "In production",
    ).length;
    return {
      answer: `You currently have ${snapshot.activeWorkCount} active work tasks (${snapshot.dueSoonWorkCount} due within 7 days) and ${activeStudio} active studio client projects.`,
      facts: [
        { label: "Active Work", value: String(snapshot.activeWorkCount) },
        { label: "Due ≤ 7d", value: String(snapshot.dueSoonWorkCount) },
        { label: "Studio Active", value: String(activeStudio) },
      ],
      routeHint: { label: "Work & Calendar", to: "/work" },
    };
  }

  // 6. Runway / burn / savings rate
  if (
    /\b(?:runway|burn|net|income|cash|balance|forecast|save rate)\b/i.test(q)
  ) {
    return {
      answer: `Combined liquid balance is $${snapshot.netWorthLiquidUSD.toFixed(2)} (Studio $${snapshot.studioBalanceUSD.toFixed(0)} + Personal $${snapshot.personalBalanceUSD.toFixed(0)}). 3-month average inflow is $${snapshot.monthlyIncomeAvgUSD.toFixed(0)}/mo vs burn of $${snapshot.monthlyBurnUSD.toFixed(0)}/mo (${snapshot.savingsRatePct}% savings rate).`,
      facts: [
        {
          label: "Runway",
          value:
            snapshot.runwayMonths !== null
              ? `${snapshot.runwayMonths} mo`
              : "Self-sustaining",
        },
        {
          label: "Burn / mo",
          value: `$${Math.round(snapshot.monthlyBurnUSD).toLocaleString("en-US")}`,
        },
        { label: "Savings", value: `${snapshot.savingsRatePct}%` },
      ],
      routeHint: { label: "Combined Flow", to: "/finance?view=combined" },
    };
  }

  // 7. Category spending default (also checks if user named a specific category)
  const matchedCat = snapshot.categoryPace.find((c) =>
    q.includes(c.category.toLowerCase()),
  );
  if (matchedCat) {
    return {
      answer: `${matchedCat.category} spending this month (${month}) is $${matchedCat.spentUSD.toFixed(2)} of your $${matchedCat.limitUSD.toFixed(0)} limit (${matchedCat.pct}%). 3-month average is $${matchedCat.baseline3moUSD.toFixed(2)}/mo.`,
      facts: [
        { label: "Spent (Mo)", value: `$${matchedCat.spentUSD.toFixed(2)}` },
        { label: "Limit", value: `$${matchedCat.limitUSD.toFixed(0)}` },
        {
          label: "3-mo Avg",
          value: `$${matchedCat.baseline3moUSD.toFixed(2)}`,
        },
      ],
      routeHint: { label: "Personal Budget", to: "/personal" },
    };
  }

  const topCats = [...snapshot.categoryPace]
    .sort((a, b) => b.spentUSD - a.spentUSD)
    .slice(0, 3);
  if (topCats.length > 0) {
    return {
      answer: `Top spending this month (${month}): ${topCats.map((c) => `${c.category} ($${c.spentUSD.toFixed(2)})`).join(", ")}.`,
      facts: topCats.map((c) => ({
        label: c.category,
        value: `$${c.spentUSD.toFixed(2)} (${c.pct}%)`,
      })),
      routeHint: { label: "Personal Budget", to: "/personal" },
    };
  }

  return {
    answer: `Combined balance stands at $${snapshot.netWorthLiquidUSD.toFixed(2)} with ${snapshot.learnedRuleCount} learned receipt rules and ${snapshot.activeWorkCount} active work tasks.`,
    facts: [
      {
        label: "Liquid Net",
        value: `$${Math.round(snapshot.netWorthLiquidUSD).toLocaleString("en-US")}`,
      },
      { label: "Open A/R", value: `$${Math.round(snapshot.openARUSD)}` },
      { label: "AI Rules", value: String(snapshot.learnedRuleCount) },
    ],
  };
}
