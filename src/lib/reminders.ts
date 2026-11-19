import { today, type CalendarReminder } from "@/lib/store";

export interface DueReminderAlert {
  reminder: CalendarReminder;
  occurrenceDate: string;
  daysUntil: number;
}

function clampMonthDayForYear(year: number, mmdd: string): string {
  const [mmStr, ddStr] = mmdd.split("-");
  const mm = Number(mmStr) || 1;
  let dd = Number(ddStr) || 1;
  if (mm === 2 && dd === 29) {
    const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    if (!isLeap) dd = 28;
  }
  return `${year}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
}

export function daysUntilIso(
  targetIso: string,
  refIso: string = today(),
): number {
  const t = Date.parse(targetIso + "T00:00:00Z");
  const r = Date.parse(refIso + "T00:00:00Z");
  if (!Number.isFinite(t) || !Number.isFinite(r)) return 9999;
  return Math.round((t - r) / 86400000);
}

export function nextOccurrenceDate(
  reminder: CalendarReminder,
  refIso: string = today(),
): string {
  if (!reminder.repeatYearly) return reminder.date;
  const mmdd = reminder.date.slice(5, 10);
  if (!/^\d{2}-\d{2}$/.test(mmdd)) return reminder.date;
  const refYear = Number(refIso.slice(0, 4)) || new Date().getFullYear();
  const candidate = clampMonthDayForYear(refYear, mmdd);
  if (candidate >= refIso) return candidate;
  return clampMonthDayForYear(refYear + 1, mmdd);
}

export function getRemindersForYear(
  reminders: CalendarReminder[],
  year: number,
): { reminder: CalendarReminder; date: string }[] {
  const prefix = `${year}-`;
  const out: { reminder: CalendarReminder; date: string }[] = [];
  for (const rm of reminders) {
    if (!rm.date) continue;
    if (rm.repeatYearly) {
      const mmdd = rm.date.slice(5, 10);
      if (/^\d{2}-\d{2}$/.test(mmdd)) {
        out.push({ reminder: rm, date: clampMonthDayForYear(year, mmdd) });
        continue;
      }
    }
    if (rm.date.startsWith(prefix)) {
      out.push({ reminder: rm, date: rm.date });
    }
  }
  return out;
}

export function getDueReminders(
  reminders: CalendarReminder[],
  refIso: string = today(),
): DueReminderAlert[] {
  const out: DueReminderAlert[] = [];
  for (const rm of reminders) {
    if (!rm.date) continue;
    const occ = nextOccurrenceDate(rm, refIso);
    if (rm.dismissedForDate === occ) continue;
    const days = daysUntilIso(occ, refIso);
    const windowDays = Math.max(0, Number(rm.notifyDaysBefore) || 0);
    if (days >= 0 && days <= windowDays) {
      out.push({ reminder: rm, occurrenceDate: occ, daysUntil: days });
    }
  }
  return out.sort((a, b) => a.daysUntil - b.daysUntil);
}

export function formatOdoKm(odoKm?: number): string {
  if (odoKm === undefined || !Number.isFinite(odoKm) || odoKm <= 0) return "";
  return `${Math.round(odoKm).toLocaleString("en-US")} km`;
}
