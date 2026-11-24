import {
  addDays,
  cardKind,
  categoryLimit,
  DEFAULT_WORK_PROJECTS,
  DESIGN_TYPES,
  documentKind,
  EXPENSE_CATEGORIES,
  expenseAccount,
  getProjectHealth,
  goalAccount,
  invoiceTotals,
  invoiceView,
  isInvoice,
  needsFollowUp,
  normalizeWorkStage,
  PERSONAL_CATEGORIES,
  PERSONAL_INCOME_SOURCES,
  previousMonth,
  recordToUSD,
  safeKhrRate,
  toUSD,
  today,
  uid,
  type Account,
  type Currency,
  type DB,
  type WorkPipelineStage,
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

export interface SpendAnomalyItem {
  category: string;
  spentUSD: number;
  baseline3moUSD: number;
  multiplier: number;
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
  unbilledQuotedUSD: number;
  pipelineValueUSD: number;
  delayedProjectCount: number;
  atRiskProjectCount: number;
  activeWorkCount: number;
  dueSoonWorkCount: number;
  dueReminderCount: number;
  latestCarOdoKm: number | null;
  learnedRuleCount: number;
  categoryPace: CategoryPaceItem[];
  studioMonthTotalUSD: number;
  studioTopCategories: { category: string; spentUSD: number }[];
  spendAnomalies: SpendAnomalyItem[];
  goalEtas: GoalEtaItem[];
  insights: CentralInsight[];
}

export type TodayActionScope = "Studio" | "Personal" | "Work" | "Life";

export type TodayActionItem =
  | {
      id: string;
      kind: "invoice";
      scope: "Studio";
      urgency: "critical" | "high" | "normal";
      title: string;
      subtitle: string;
      metric: string;
      invoiceId: string;
      balanceNative: number;
      currency: Currency;
      dueDate: string;
    }
  | {
      id: string;
      kind: "quote";
      scope: "Studio";
      urgency: "high" | "normal";
      title: string;
      subtitle: string;
      metric: string;
      invoiceId: string;
      readyToConvert: boolean;
    }
  | {
      id: string;
      kind: "work";
      scope: "Work";
      urgency: "critical" | "high" | "normal";
      title: string;
      subtitle: string;
      metric: string;
      taskId: string;
      stage: WorkPipelineStage;
    }
  | {
      id: string;
      kind: "project";
      scope: "Studio";
      urgency: "critical" | "high";
      title: string;
      subtitle: string;
      metric: string;
      projectId: string;
    }
  | {
      id: string;
      kind: "reminder";
      scope: "Life";
      urgency: "high" | "normal";
      title: string;
      subtitle: string;
      metric: string;
      reminderId: string;
      occurrenceDate: string;
    };

export type ParsedQuickCommand =
  | {
      kind: "expense";
      summary: string;
      matchedRule?: string;
      data: {
        account: Account;
        amount: number;
        currency: Currency;
        category: string;
        vendor: "Debit" | "Credit";
        description: string;
        date: string;
      };
    }
  | {
      kind: "income";
      summary: string;
      data: {
        amount: number;
        currency: Currency;
        source: string;
        accountMethod: "Debit" | "Credit";
        description: string;
        date: string;
      };
    }
  | {
      kind: "work-task";
      summary: string;
      data: {
        title: string;
        projectName: string;
        designType: string;
        artworkCount: number;
        dueDate: string;
        status: WorkPipelineStage;
      };
    };

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
  const rate = safeKhrRate(db.settings.khrRate);
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
    const usd = recordToUSD(p, rate);
    studioInAll += usd;
    const ym = p.date.slice(0, 7);
    if (trailing3Months.has(ym)) trailing3In += usd;
    if (ym === month) thisMonthIn += usd;
  }

  for (const sinc of db.studioIncome ?? []) {
    const usd = recordToUSD(sinc, rate);
    studioInAll += usd;
    const ym = sinc.date.slice(0, 7);
    if (trailing3Months.has(ym)) trailing3In += usd;
    if (ym === month) thisMonthIn += usd;
  }

  for (const inc of db.personalIncome ?? []) {
    const usd = recordToUSD(inc, rate);
    personalInAll += usd;
    const ym = inc.date.slice(0, 7);
    if (trailing3Months.has(ym)) trailing3In += usd;
    if (ym === month) thisMonthIn += usd;
  }

  const personalMonthByCat = new Map<string, number>();
  const personal3MoByCat = new Map<string, number>();
  const studioMonthByCat = new Map<string, number>();
  let studioMonthTotalUSD = 0;

  for (const e of db.expenses) {
    const usd = recordToUSD(e, rate);
    const acc = expenseAccount(e);
    const ym = e.date.slice(0, 7);
    if (acc === "Studio") {
      studioOutAll += usd;
      if (ym === month) {
        studioMonthTotalUSD += usd;
        studioMonthByCat.set(
          e.category,
          (studioMonthByCat.get(e.category) ?? 0) + usd,
        );
      }
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

  const studioTopCategories = Array.from(studioMonthByCat.entries())
    .map(([category, spentUSD]) => ({ category, spentUSD }))
    .sort((a, b) => b.spentUSD - a.spentUSD);

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

  // Open & overdue A/R + unbilled accepted quotes
  const clientMap = new Map(db.clients.map((c) => [c.id, c.name]));
  const convertedSourceIds = new Set(
    db.invoices
      .filter((i) => isInvoice(i) && i.sourceId)
      .map((i) => i.sourceId!),
  );

  let openARUSD = 0;
  let overdueARUSD = 0;
  let overdueInvoiceCount = 0;
  let unbilledQuotedUSD = 0;
  const overdueClientSet = new Set<string>();

  for (const inv of db.invoices) {
    if (isInvoice(inv)) {
      const v = invoiceView(inv, db);
      if (v.status === "Draft" || v.balanceUSD <= 0.01) continue;
      openARUSD += v.balanceUSD;
      if (v.status === "Overdue" || (inv.due && inv.due < refDate)) {
        overdueARUSD += v.balanceUSD;
        overdueInvoiceCount += 1;
        const cName = clientMap.get(inv.clientId);
        if (cName) overdueClientSet.add(cName);
      }
    } else if (
      (documentKind(inv) === "Quotation" ||
        documentKind(inv) === "Agreement") &&
      inv.response === "Accepted" &&
      !convertedSourceIds.has(inv.id)
    ) {
      const hasProjectInvoice =
        Boolean(inv.projectId) &&
        db.invoices.some(
          (other) => isInvoice(other) && other.projectId === inv.projectId,
        );
      if (!hasProjectInvoice) {
        unbilledQuotedUSD += toUSD(
          invoiceTotals(inv).total,
          inv.currency,
          safeKhrRate(inv.exchangeRate ?? rate),
        );
      }
    }
  }

  // Studio project pipeline & deadline health
  let pipelineValueUSD = 0;
  let delayedProjectCount = 0;
  let atRiskProjectCount = 0;
  let delayedFirstTitle = "";

  for (const p of db.projects) {
    if (["Inquiry", "Quoted", "In production"].includes(p.status)) {
      pipelineValueUSD += Math.max(0, Number(p.quote) || 0);
    }
    const h = getProjectHealth(p, refDate);
    if (h.status === "delayed") {
      delayedProjectCount += 1;
      if (!delayedFirstTitle) delayedFirstTitle = p.name || p.code;
    } else if (h.status === "at-risk") {
      atRiskProjectCount += 1;
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

  const spendAnomalies: SpendAnomalyItem[] = categoryPace
    .filter(
      (c) =>
        c.baseline3moUSD >= 5 &&
        c.spentUSD >= 15 &&
        c.spentUSD >= c.baseline3moUSD * 1.45,
    )
    .map((c) => ({
      category: c.category,
      spentUSD: c.spentUSD,
      baseline3moUSD: c.baseline3moUSD,
      multiplier: Math.round((c.spentUSD / c.baseline3moUSD) * 10) / 10,
    }))
    .sort((a, b) => b.multiplier - a.multiplier);

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
    (t) => normalizeWorkStage(t.status) !== "Completed",
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

  if (delayedProjectCount > 0) {
    insights.push({
      id: "delayed-projects",
      severity: "critical",
      area: "Studio",
      title: `${delayedProjectCount} studio project${delayedProjectCount === 1 ? "" : "s"} past deadline`,
      detail: delayedFirstTitle
        ? `Review "${delayedFirstTitle}" and update delivery dates or convert to delivery note.`
        : "Update studio project milestones to restore schedule health.",
      metric: `${delayedProjectCount} delayed`,
      actionLabel: "Projects",
      actionTo: "/projects",
    });
  }

  if (unbilledQuotedUSD > 0) {
    insights.push({
      id: "unbilled-quotes",
      severity: "warn",
      area: "Studio",
      title: "Accepted quotes ready for invoicing",
      detail: `$${Math.round(unbilledQuotedUSD).toLocaleString("en-US")} in accepted quotations or agreements have no active invoice yet.`,
      metric: `$${Math.round(unbilledQuotedUSD).toLocaleString("en-US")}`,
      actionLabel: "Convert",
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
  } else if (spendAnomalies.length > 0) {
    const spike = spendAnomalies[0]!;
    insights.push({
      id: `spike-${spike.category}`,
      severity: "warn",
      area: "Cash",
      title: `${spike.category} is ${spike.multiplier}x above 3-month average`,
      detail: `Spent $${spike.spentUSD.toFixed(0)} this month compared to $${spike.baseline3moUSD.toFixed(0)}/mo typical pace.`,
      metric: `${spike.multiplier}x`,
      actionLabel: "Review",
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
    unbilledQuotedUSD,
    pipelineValueUSD,
    delayedProjectCount,
    atRiskProjectCount,
    activeWorkCount: activeWork.length,
    dueSoonWorkCount: dueSoonWork.length,
    dueReminderCount: dueReminders.length,
    latestCarOdoKm,
    learnedRuleCount: (db.learnedReceiptRules ?? []).length,
    categoryPace,
    studioMonthTotalUSD,
    studioTopCategories,
    spendAnomalies,
    goalEtas,
    insights: insights.slice(0, 6),
  };
}

/**
 * Things 3 / Linear style unified "Today Focus" action queue across Studio, Work & Reminders.
 * Items ordered by action urgency so users can clear their day in 1 click per item.
 */
export function getTodayActionQueue(
  db: DB,
  refDate: string = today(),
): TodayActionItem[] {
  const items: TodayActionItem[] = [];
  const clientMap = new Map(db.clients.map((c) => [c.id, c.name]));
  const convertedSources = new Set(
    db.invoices
      .filter((i) => isInvoice(i) && i.sourceId)
      .map((i) => i.sourceId!),
  );
  const dueSoonThreshold = addDays(refDate, 5);
  const workThreshold = addDays(refDate, 3);

  // 1. Overdue & due-soon Studio invoices
  for (const inv of db.invoices) {
    if (!isInvoice(inv)) continue;
    const v = invoiceView(inv, db);
    if (v.status === "Draft" || v.balance <= 0.01) continue;
    const isOverdue = v.status === "Overdue" || (inv.due && inv.due < refDate);
    const isDueSoon = inv.due && inv.due <= dueSoonThreshold;
    if (!isOverdue && !isDueSoon) continue;
    const clientName = clientMap.get(inv.clientId) ?? "Client";
    items.push({
      id: `act-inv-${inv.id}`,
      kind: "invoice",
      scope: "Studio",
      urgency: isOverdue ? "critical" : "high",
      title: `${inv.no} · ${clientName}`,
      subtitle: isOverdue
        ? `Overdue since ${inv.due}`
        : `Due ${inv.due} · ${v.status}`,
      metric:
        inv.currency === "KHR"
          ? `៛${Math.round(v.balance).toLocaleString("en-US")}`
          : `$${v.balance.toFixed(2)}`,
      invoiceId: inv.id,
      balanceNative: Math.round(v.balance * 100) / 100,
      currency: inv.currency,
      dueDate: inv.due,
    });
  }

  // 2. Quotations / Agreements accepted (ready to invoice) or follow-up due
  for (const doc of db.invoices) {
    const kind = documentKind(doc);
    if (kind === "Invoice" || kind === "Delivery note") continue;
    const clientName = clientMap.get(doc.clientId) ?? "Client";
    const acceptedUnbilled =
      doc.response === "Accepted" &&
      !convertedSources.has(doc.id) &&
      (!doc.projectId ||
        !db.invoices.some(
          (other) => isInvoice(other) && other.projectId === doc.projectId,
        ));
    const followUpDue = needsFollowUp(doc, refDate);
    if (!acceptedUnbilled && !followUpDue) continue;
    const total = invoiceTotals(doc).total;
    items.push({
      id: `act-doc-${doc.id}`,
      kind: "quote",
      scope: "Studio",
      urgency: acceptedUnbilled ? "high" : "normal",
      title: `${doc.no} · ${clientName}`,
      subtitle: acceptedUnbilled
        ? `${kind} accepted · Convert to invoice`
        : `Follow-up due ${doc.followUp}`,
      metric:
        doc.currency === "KHR"
          ? `៛${Math.round(total).toLocaleString("en-US")}`
          : `$${total.toFixed(0)}`,
      invoiceId: doc.id,
      readyToConvert: acceptedUnbilled,
    });
  }

  // 3. Work tasks overdue, due within 3 days, or waiting in Review / Approved
  for (const t of db.workTasks ?? []) {
    const stage = normalizeWorkStage(t.status);
    if (stage === "Completed") continue;
    const isOverdue = Boolean(t.dueDate && t.dueDate < refDate);
    const isDueSoon = Boolean(t.dueDate && t.dueDate <= workThreshold);
    const needsDecision = stage === "Review" || stage === "Approved";
    if (!isOverdue && !isDueSoon && !needsDecision) continue;
    const proj = t.projectName || t.company || "Work";
    items.push({
      id: `act-wrk-${t.id}`,
      kind: "work",
      scope: "Work",
      urgency: isOverdue ? "critical" : isDueSoon ? "high" : "normal",
      title: `${proj} · ${t.title || t.code}`,
      subtitle: isOverdue
        ? `Overdue (${t.dueDate}) · ${stage}`
        : t.dueDate
          ? `Due ${t.dueDate} · ${stage}`
          : `${stage} · ${t.designType}`,
      metric: stage,
      taskId: t.id,
      stage,
    });
  }

  // 4. Delayed studio projects
  for (const p of db.projects) {
    const h = getProjectHealth(p, refDate);
    if (h.status !== "delayed") continue;
    const clientName = clientMap.get(p.clientId) ?? "Studio";
    items.push({
      id: `act-proj-${p.id}`,
      kind: "project",
      scope: "Studio",
      urgency: "critical",
      title: `${p.code} · ${p.name}`,
      subtitle: `${clientName} · ${p.status} (${h.reason})`,
      metric: h.label,
      projectId: p.id,
    });
  }

  // 5. Due calendar & car ODO reminders
  for (const dueRem of getDueReminders(db.reminders ?? [], refDate)) {
    const when =
      dueRem.daysUntil === 0
        ? "Today"
        : dueRem.daysUntil === 1
          ? "Tomorrow"
          : `In ${dueRem.daysUntil}d`;
    items.push({
      id: `act-rem-${dueRem.reminder.id}`,
      kind: "reminder",
      scope: "Life",
      urgency: dueRem.daysUntil <= 1 ? "high" : "normal",
      title: dueRem.reminder.title,
      subtitle:
        dueRem.reminder.odoKm && dueRem.reminder.odoKm > 0
          ? `${dueRem.reminder.odoKm.toLocaleString("en-US")} km · ${dueRem.reminder.notes || when}`
          : dueRem.reminder.notes || `Scheduled ${dueRem.occurrenceDate}`,
      metric: when,
      reminderId: dueRem.reminder.id,
      occurrenceDate: dueRem.occurrenceDate,
    });
  }

  const urgencyRank = { critical: 0, high: 1, normal: 2 } as const;
  return items.sort((a, b) => urgencyRank[a.urgency] - urgencyRank[b.urgency]);
}

function inferCategoryFromText(
  text: string,
  account: Account,
  db: DB,
): { category: string; vendor: "Debit" | "Credit"; matchedRule?: string } {
  const lower = text.toLowerCase();
  const vendor: "Debit" | "Credit" = /\b(?:credit|visa|mastercard)\b/i.test(
    lower,
  )
    ? "Credit"
    : "Debit";

  // 1. Learned rules take highest precedence (unified receipt/command AI)
  for (const rule of db.learnedReceiptRules ?? []) {
    if (rule.pattern && lower.includes(rule.pattern.toLowerCase())) {
      return {
        category: rule.category,
        vendor: /\bcredit\b/i.test(lower) ? "Credit" : rule.method,
        matchedRule: rule.displayPattern,
      };
    }
  }

  const validList =
    account === "Studio" ? EXPENSE_CATEGORIES : PERSONAL_CATEGORIES;

  // 2. Direct category name mention
  for (const cat of validList) {
    if (lower.includes(cat.toLowerCase())) {
      return { category: cat, vendor };
    }
  }

  if (account === "Studio") {
    if (
      /\b(?:adobe|figma|framer|canva|font|domain|hosting|ai|saas)\b/.test(lower)
    )
      return { category: "Software and subscriptions", vendor };
    if (/\b(?:print|banner|vinyl|paper|box|dieline)\b/.test(lower))
      return { category: "Printing and production", vendor };
    if (/\b(?:fabricat|sign|neon|acrylic|booth|led)\b/.test(lower))
      return { category: "Fabrication and vendors", vendor };
    if (/\b(?:freelance|retouch|motion|video|copy)\b/.test(lower))
      return { category: "Freelancers", vendor };
    if (/\b(?:grab|taxi|fuel|delivery|courier|passapp)\b/.test(lower))
      return { category: "Transport", vendor };
    return { category: "Other", vendor };
  }

  // Personal category keyword map
  if (
    /\b(?:coffee|cafe|onnik|brown|tube|starbucks|food|lunch|dinner|breakfast|grocer|supermarket|snack|tea|drink|meal|burger|noodle|rice|aeon|chip mong|lucky)\b/.test(
      lower,
    )
  ) {
    return { category: "Food", vendor };
  }
  if (
    /\b(?:prius|ptt|caltex|tela|total|oil|tire|car|service|wash|parking|fuel|gas)\b/.test(
      lower,
    )
  ) {
    return { category: "Prius 2012", vendor };
  }
  if (/\b(?:grab|passapp|tuktuk|tuk|taxi|bus|train|flight)\b/.test(lower)) {
    return { category: "Transportation", vendor };
  }
  if (/\b(?:kid|baby|school|diaper|milk|toy|tuition)\b/.test(lower)) {
    return { category: "Kid", vendor };
  }
  if (
    /\b(?:edc|electric|water|wifi|internet|smart|cellcard|metfone|bill|rent|utility|utilities)\b/.test(
      lower,
    )
  ) {
    return { category: "Utilities", vendor };
  }
  if (
    /\b(?:hospital|clinic|pharmacy|med|doctor|dental|health|medicine)\b/.test(
      lower,
    )
  ) {
    return { category: "Medical & Healthcare", vendor };
  }
  if (/\b(?:save|saving|invest|stock|gold|deposit)\b/.test(lower)) {
    return { category: "Saving & Investing", vendor };
  }
  return { category: "Personal Spending", vendor };
}

function resolveDateToken(
  text: string,
  refDate: string,
): { date: string; cleaned: string } {
  const isoMatch = text.match(/\b(\d{4}-\d{2}-\d{2})\b/);
  if (isoMatch?.[1]) {
    return {
      date: isoMatch[1],
      cleaned: text.replace(isoMatch[0], " "),
    };
  }
  if (/\b(?:due\s+)?tomorrow\b/i.test(text)) {
    return {
      date: addDays(refDate, 1),
      cleaned: text.replace(/\b(?:due\s+)?tomorrow\b/i, " "),
    };
  }
  if (/\b(?:due\s+)?today\b/i.test(text)) {
    return {
      date: refDate,
      cleaned: text.replace(/\b(?:due\s+)?today\b/i, " "),
    };
  }
  const plusMatch = text.match(/\b(?:due\s+)?\+(\d{1,2})d\b/i);
  if (plusMatch?.[1]) {
    return {
      date: addDays(refDate, Number(plusMatch[1]) || 0),
      cleaned: text.replace(plusMatch[0], " "),
    };
  }
  return { date: refDate, cleaned: text };
}

function titleWords(s: string): string {
  return s
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b([a-z])/g, (ch) => ch.toUpperCase());
}

/**
 * Natural Language Quick-Capture Parser used by the global Spotlight (⌘K) bar.
 * Examples:
 * - "spent $6.50 Onnik coffee"
 * - "20000r ptt fuel credit"
 * - "+$500 freelance"
 * - "task DBG social banner due tomorrow 3 pcs"
 */
export function parseQuickCommand(
  raw: string,
  db: DB,
  refDate: string = today(),
): ParsedQuickCommand | null {
  const trimmed = raw.trim();
  if (!trimmed || trimmed.endsWith("?")) return null;

  // 1. Work task command ("task ...", "wrk ...", "work ...")
  const workLead = trimmed.match(/^(?:task|wrk|work)\s*:?\s+(.+)$/i);
  if (workLead?.[1]) {
    let body = workLead[1].trim();
    const { date: dueDate, cleaned } = resolveDateToken(body, refDate);
    body = cleaned;

    let artworkCount = 1;
    const qtyMatch = body.match(/\b(\d{1,3})\s*(?:pcs?|artworks?|files?|x)\b/i);
    if (qtyMatch?.[1]) {
      artworkCount = Math.max(1, Number(qtyMatch[1]) || 1);
      body = body.replace(qtyMatch[0], " ");
    }

    const workProjects = db.settings.workProjects?.length
      ? db.settings.workProjects
      : [...DEFAULT_WORK_PROJECTS];
    let projectName = workProjects[0] ?? "DBG";
    for (const proj of workProjects) {
      const rx = new RegExp(
        `\\b${proj.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
        "i",
      );
      if (rx.test(body)) {
        projectName = proj;
        body = body.replace(rx, " ");
        break;
      }
    }

    let designType: string = DESIGN_TYPES[0];
    const lowerBody = body.toLowerCase();
    if (/\b(?:social|post|banner|story|ig|fb|ad)\b/.test(lowerBody))
      designType = "Social & Campaign";
    else if (/\b(?:print|flyer|brochure|menu|poster|card)\b/.test(lowerBody))
      designType = "Print & Collateral";
    else if (/\b(?:pack|box|label|dieline)\b/.test(lowerBody))
      designType = "Marketing & Packaging";
    else if (/\b(?:ui|web|app|page|landing)\b/.test(lowerBody))
      designType = "UI & Web";
    else if (/\b(?:3d|booth|sign|backdrop|led)\b/.test(lowerBody))
      designType = "Spatial & Signage";
    else if (/\b(?:deck|slide|ppt|presentation)\b/.test(lowerBody))
      designType = "Presentation & Deck";

    const cleanTitle = body
      .replace(/\b(?:due)\b/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (!cleanTitle) return null;
    const formattedTitle =
      cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);
    const metaLabel = `${projectName} · ${artworkCount} ${artworkCount === 1 ? "pc" : "pcs"} · Due ${dueDate}`;

    return {
      kind: "work-task",
      summary: `Create task: "${formattedTitle}" (${metaLabel})`,
      data: {
        title: formattedTitle,
        projectName,
        designType,
        artworkCount,
        dueDate,
        status: "Design",
      },
    };
  }

  // 2. Monetary quick command (Income or Expense)
  const { date, cleaned: dateCleaned } = resolveDateToken(trimmed, refDate);
  const amountRx =
    /(?:([+-])\s*)?(?:(\$|៛)\s*)?(\d{1,3}(?:,\d{3})+|\d+(?:\.\d{1,2})?)\s*(khr|riel|r\b|usd|\$)?/i;
  const amtMatch = dateCleaned.match(amountRx);
  if (!amtMatch?.[3]) return null;

  const amount = Number(amtMatch[3].replace(/,/g, ""));
  if (!Number.isFinite(amount) || amount <= 0) return null;

  const signToken = amtMatch[1];
  const prefixSym = amtMatch[2] ?? "";
  const suffixSym = (amtMatch[4] ?? "").toLowerCase();
  const isKHR =
    prefixSym === "៛" ||
    suffixSym === "khr" ||
    suffixSym === "riel" ||
    suffixSym === "r";
  const currency: Currency = isKHR ? "KHR" : "USD";

  const isIncome =
    signToken === "+" ||
    /^(?:income|earned|received|salary|bonus|in)\b/i.test(dateCleaned) ||
    /\b(?:income|salary|bonus|refund|dividend)\b/i.test(dateCleaned);

  const rest = dateCleaned
    .replace(amtMatch[0], " ")
    .replace(
      /\b(?:spent|paid|bought|expense|income|earned|received|in|out|studio|credit|debit|visa|mastercard)\b/gi,
      " ",
    )
    .replace(/\s+/g, " ")
    .trim();

  if (isIncome) {
    const lower = dateCleaned.toLowerCase();
    let source: string = PERSONAL_INCOME_SOURCES[0];
    if (/\b(?:freelance|client)\b/.test(lower)) source = "Freelance";
    else if (/\b(?:studio\s*draw|draw)\b/.test(lower)) source = "Studio Draw";
    else if (/\b(?:bonus)\b/.test(lower)) source = "Bonus";
    else if (/\b(?:invest|dividend)\b/.test(lower)) source = "Investment";
    else if (/\b(?:gift|refund)\b/.test(lower)) source = "Gift & Refund";
    else if (/\b(?:other)\b/.test(lower)) source = "Other";

    const method: "Debit" | "Credit" = /\bcredit\b/i.test(lower)
      ? "Credit"
      : "Debit";
    const description = rest ? titleWords(rest) : source;
    const fmt =
      currency === "KHR"
        ? `៛${Math.round(amount).toLocaleString("en-US")}`
        : `$${amount.toFixed(2)}`;
    return {
      kind: "income",
      summary: `Log Income · +${fmt} · ${source} · ${method}`,
      data: {
        amount,
        currency,
        source,
        accountMethod: method,
        description,
        date,
      },
    };
  }

  // Expense quick capture (only trigger if it looks like an expense or has merchant/category text)
  const account: Account = /\bstudio\b/i.test(dateCleaned)
    ? "Studio"
    : "Personal";
  const inferred = inferCategoryFromText(dateCleaned, account, db);
  const description = rest ? titleWords(rest) : inferred.category;
  const fmt =
    currency === "KHR"
      ? `៛${Math.round(amount).toLocaleString("en-US")}`
      : `$${amount.toFixed(2)}`;

  return {
    kind: "expense",
    ...(inferred.matchedRule ? { matchedRule: inferred.matchedRule } : {}),
    summary: `Log ${account} Expense · -${fmt} · ${inferred.category} · ${inferred.vendor}`,
    data: {
      account,
      amount,
      currency,
      category: inferred.category,
      vendor: inferred.vendor,
      description,
      date,
    },
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
  const rate = safeKhrRate(db.settings.khrRate);
  const month = snapshot.month;

  if (!q) {
    return {
      answer:
        "Ask about top spending categories, overdue studio invoices, project health, pipeline value, saving goals, Debit vs Credit cards, work deadlines, or car ODO mileage.",
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

  // 0. Client-specific lookup by name
  const matchedClient = db.clients.find(
    (c) => c.name.trim().length >= 3 && q.includes(c.name.trim().toLowerCase()),
  );
  if (matchedClient) {
    let billedUSD = 0;
    let owedUSD = 0;
    let docCount = 0;
    for (const inv of db.invoices) {
      if (inv.clientId !== matchedClient.id) continue;
      docCount += 1;
      const v = invoiceView(inv, db);
      billedUSD += v.totalUSD;
      if (v.status !== "Draft") owedUSD += v.balanceUSD;
    }
    const clientProjects = db.projects.filter(
      (p) => p.clientId === matchedClient.id,
    ).length;
    return {
      answer: `${matchedClient.name} (${matchedClient.status}) has ${clientProjects} project${clientProjects === 1 ? "" : "s"} and ${docCount} document${docCount === 1 ? "" : "s"}: $${billedUSD.toFixed(2)} billed and $${owedUSD.toFixed(2)} outstanding.`,
      facts: [
        { label: "Billed", value: `$${billedUSD.toFixed(2)}` },
        { label: "Owed", value: `$${owedUSD.toFixed(2)}` },
        { label: "Projects", value: String(clientProjects) },
      ],
      routeHint: { label: "Open Clients", to: "/clients" },
    };
  }

  // 1. Project health / studio pipeline / unbilled accepted quotes
  if (
    /\b(?:health|delayed|at-risk|at risk|pipeline|unbilled|quotes?|quotations?)\b/i.test(
      q,
    )
  ) {
    return {
      answer: `Studio pipeline holds $${Math.round(snapshot.pipelineValueUSD).toLocaleString("en-US")} in active projects (${snapshot.delayedProjectCount} delayed, ${snapshot.atRiskProjectCount} at-risk) and $${Math.round(snapshot.unbilledQuotedUSD).toLocaleString("en-US")} in accepted unbilled quotes.`,
      facts: [
        {
          label: "Pipeline",
          value: `$${Math.round(snapshot.pipelineValueUSD).toLocaleString("en-US")}`,
        },
        {
          label: "Unbilled Quotes",
          value: `$${Math.round(snapshot.unbilledQuotedUSD).toLocaleString("en-US")}`,
        },
        {
          label: "Delayed",
          value: String(snapshot.delayedProjectCount),
        },
      ],
      routeHint: { label: "Studio Projects", to: "/projects" },
    };
  }

  // 2. Overdue A/R / clients owing money
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

  // 3. Car / Prius / ODO / Reminders
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

  // 4. Debit vs Credit card split
  if (/\b(?:cards?|debit|credit|visa|mastercard)\b/i.test(q)) {
    let debit = 0;
    let credit = 0;
    for (const e of db.expenses) {
      if (expenseAccount(e) !== "Personal" || !e.date.startsWith(month))
        continue;
      const usd = recordToUSD(e, rate);
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

  // 5. Saving goals
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

  // 5b. Studio spending / costs breakdown
  if (
    /\b(?:studio\s+(?:spend|spending|cost|costs|expense|expenses)|software|printing|vendors?|freelancers?)\b/i.test(
      q,
    )
  ) {
    const topStudio = snapshot.studioTopCategories.slice(0, 3);
    if (topStudio.length === 0) {
      return {
        answer: `No Studio expenses logged yet for ${month}. Combined Studio liquid balance is $${snapshot.studioBalanceUSD.toFixed(2)}.`,
        facts: [
          {
            label: "Studio Bal",
            value: `$${snapshot.studioBalanceUSD.toFixed(0)}`,
          },
          { label: "Studio Spend", value: "$0.00" },
        ],
        routeHint: { label: "Studio Finance", to: "/finance" },
      };
    }
    return {
      answer: `Studio spending in ${month} totals $${snapshot.studioMonthTotalUSD.toFixed(2)}, led by ${topStudio.map((c) => `${c.category} ($${c.spentUSD.toFixed(2)})`).join(", ")}.`,
      facts: topStudio.map((c) => ({
        label: c.category,
        value: `$${c.spentUSD.toFixed(2)}`,
      })),
      routeHint: { label: "Studio Finance", to: "/finance" },
    };
  }

  // 6. Work tasks, Studio projects & upcoming schedule
  if (
    /\b(?:work|tasks?|projects?|deliverables?|deadlines?|schedule|upcoming|due\s+soon|this\s+week|dbg|ocic|connexion)\b/i.test(
      q,
    )
  ) {
    const activeStudio = db.projects.filter(
      (p) =>
        p.status === "Inquiry" ||
        p.status === "Quoted" ||
        p.status === "In production",
    ).length;
    const dueInvoices = db.invoices.filter((inv) => {
      if (!isInvoice(inv) || !inv.due) return false;
      const v = invoiceView(inv, db);
      return (
        v.status !== "Draft" &&
        v.balance > 0.01 &&
        inv.due <= addDays(snapshot.refDate, 7)
      );
    }).length;
    return {
      answer: `You currently have ${snapshot.activeWorkCount} active work tasks (${snapshot.dueSoonWorkCount} due within 7 days), ${activeStudio} active studio projects, and ${dueInvoices} unpaid invoice${dueInvoices === 1 ? "" : "s"} due or overdue within 7 days.`,
      facts: [
        { label: "Active Work", value: String(snapshot.activeWorkCount) },
        { label: "Work ≤ 7d", value: String(snapshot.dueSoonWorkCount) },
        { label: "Inv Due ≤ 7d", value: String(dueInvoices) },
      ],
      routeHint: { label: "Today & Schedule", to: "/" },
    };
  }

  // 7. Runway / burn / savings rate / studio profit margin
  if (
    /\b(?:runway|burn|net|income|cash|balance|forecast|save rate|studio|margin|profit)\b/i.test(
      q,
    )
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
          label: "Studio Net",
          value: `$${Math.round(snapshot.studioBalanceUSD).toLocaleString("en-US")}`,
        },
        { label: "Savings", value: `${snapshot.savingsRatePct}%` },
      ],
      routeHint: { label: "Combined Flow", to: "/finance?view=combined" },
    };
  }

  // 8. Category spending default (also checks if user named a specific category)
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

/**
 * Helper to create a clean WorkTask object from a parsed command or quick-add bar.
 */
export function buildQuickWorkTask(
  db: DB,
  fields: {
    title: string;
    projectName?: string;
    designType?: string;
    artworkCount?: number;
    dueDate?: string;
    status?: WorkPipelineStage;
  },
  refDate: string = today(),
) {
  const existing = db.workTasks ?? [];
  let maxN = 0;
  for (const t of existing) {
    const n = Number(String(t.code).replace(/\D+/g, "")) || 0;
    if (n > maxN) maxN = n;
  }
  const code = `WRK-${String(maxN + 1).padStart(2, "0")}`;
  const proj =
    fields.projectName?.trim() ||
    db.settings.workProjects?.[0] ||
    DEFAULT_WORK_PROJECTS[0];
  const stage: WorkPipelineStage = fields.status ?? "Design";
  const due = fields.dueDate || refDate;
  return {
    id: uid(),
    code,
    title: fields.title.trim(),
    status: stage,
    designType: fields.designType || DESIGN_TYPES[0],
    artworkCount: Math.max(1, Number(fields.artworkCount) || 1),
    projectName: proj,
    company: proj,
    startDate: refDate,
    dueDate: due,
    completedDate: stage === "Completed" ? refDate : "",
    conceptOnly: false,
    notes: "",
    media: [],
    featured: false,
  };
}
