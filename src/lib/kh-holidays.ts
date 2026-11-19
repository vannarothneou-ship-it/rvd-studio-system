export type HolidayKind = "kh-public" | "sel" | "popular";

export interface CalendarSpecialDay {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  khTitle?: string;
  kind: HolidayKind;
  detail?: string;
}

const SYNODIC_MONTH_DAYS = 29.53058867;
// Reference astronomically known New Moon: 2000-01-06 18:14 UTC
const REF_NEW_MOON_MS = Date.UTC(2000, 0, 6, 18, 14, 0);
const PHNOM_PENH_OFFSET_MS = 7 * 3600 * 1000;

function msToPhnomPenhIso(ms: number): string {
  const local = new Date(ms + PHNOM_PENH_OFFSET_MS);
  const y = local.getUTCFullYear();
  const m = String(local.getUTCMonth() + 1).padStart(2, "0");
  const d = String(local.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Computes Khmer Buddhist offering days (ថ្ងៃសីល / Thngai Sel):
 * - ៨ កើត (8th Waxing / First Quarter)
 * - ១៥ កើត (15th Waxing / Full Moon)
 * - ៨ រោច (8th Waning / Last Quarter)
 * - ដាច់ខែ (New Moon)
 */
export function getThngaiSelDays(year: number): CalendarSpecialDay[] {
  const startMs = Date.UTC(year, 0, 1) - 10 * 86400 * 1000;
  const endMs = Date.UTC(year, 11, 31) + 10 * 86400 * 1000;
  const cycleMs = SYNODIC_MONTH_DAYS * 86400 * 1000;

  const firstK = Math.floor((startMs - REF_NEW_MOON_MS) / cycleMs) - 1;
  const lastK = Math.ceil((endMs - REF_NEW_MOON_MS) / cycleMs) + 1;

  const phases: {
    frac: number;
    khTitle: string;
    enTitle: string;
    detail: string;
  }[] = [
    {
      frac: 0,
      khTitle: "ថ្ងៃសីល (ដាច់ខែ)",
      enTitle: "Thngai Sel · New Moon",
      detail: "Khmer Buddhist Uposatha & offering day (New Moon)",
    },
    {
      frac: 0.25,
      khTitle: "ថ្ងៃសីល (៨ កើត)",
      enTitle: "Thngai Sel · 8th Waxing",
      detail: "Khmer Buddhist Uposatha & offering day (8th Waxing)",
    },
    {
      frac: 0.5,
      khTitle: "ថ្ងៃសីល (១៥ កើត)",
      enTitle: "Thngai Sel · Full Moon",
      detail: "Khmer Buddhist Uposatha & offering day (Full Moon / ពេញបូណ៌មី)",
    },
    {
      frac: 0.75,
      khTitle: "ថ្ងៃសីល (៨ រោច)",
      enTitle: "Thngai Sel · 8th Waning",
      detail: "Khmer Buddhist Uposatha & offering day (8th Waning)",
    },
  ];

  const out: CalendarSpecialDay[] = [];
  const seenDates = new Set<string>();

  for (let k = firstK; k <= lastK; k++) {
    for (const ph of phases) {
      const tMs = REF_NEW_MOON_MS + (k + ph.frac) * cycleMs;
      const iso = msToPhnomPenhIso(tMs);
      if (!iso.startsWith(`${year}-`) || seenDates.has(iso)) continue;
      seenDates.add(iso);
      out.push({
        id: `sel-${iso}`,
        date: iso,
        title: ph.khTitle,
        khTitle: ph.khTitle,
        kind: "sel",
        detail: `${ph.enTitle} — ${ph.detail}`,
      });
    }
  }

  return out.sort((a, b) => a.date.localeCompare(b.date));
}

function nthWeekdayOfMonth(
  year: number,
  month1: number,
  weekday: number,
  nth: number,
): string {
  const first = new Date(Date.UTC(year, month1 - 1, 1));
  const diff = (weekday - first.getUTCDay() + 7) % 7;
  const day = 1 + diff + (nth - 1) * 7;
  return `${year}-${String(month1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function fullMoonInMonth(year: number, month1: number): string | null {
  const cycleMs = SYNODIC_MONTH_DAYS * 86400 * 1000;
  const targetStart = Date.UTC(year, month1 - 1, 1);
  const k0 = Math.floor((targetStart - REF_NEW_MOON_MS) / cycleMs) - 1;
  for (let k = k0; k <= k0 + 3; k++) {
    const fm = REF_NEW_MOON_MS + (k + 0.5) * cycleMs;
    const iso = msToPhnomPenhIso(fm);
    if (iso.startsWith(`${year}-${String(month1).padStart(2, "0")}`)) {
      return iso;
    }
  }
  return null;
}

function addIsoDays(iso: string, delta: number): string {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

const MOVABLE_KH_HOLIDAYS: Record<
  number,
  { date: string; title: string; khTitle: string }[]
> = {
  2025: [
    { date: "2025-05-11", title: "Visak Bochea", khTitle: "ពិធីបុណ្យវិសាខបូជា" },
    {
      date: "2025-05-15",
      title: "Royal Plowing Ceremony",
      khTitle: "ព្រះរាជពិធីច្រត់ព្រះនង្គ័ល",
    },
    { date: "2025-09-21", title: "Pchum Ben Day 1", khTitle: "បុណ្យភ្ជុំបិណ្ឌ" },
    { date: "2025-09-22", title: "Pchum Ben Day 2", khTitle: "បុណ្យភ្ជុំបិណ្ឌ" },
    { date: "2025-09-23", title: "Pchum Ben Day 3", khTitle: "បុណ្យភ្ជុំបិណ្ឌ" },
    {
      date: "2025-11-04",
      title: "Water Festival Day 1",
      khTitle: "ព្រះរាជពិធីបុណ្យអុំទូក",
    },
    {
      date: "2025-11-05",
      title: "Water Festival Day 2",
      khTitle: "ព្រះរាជពិធីបុណ្យអុំទូក",
    },
    {
      date: "2025-11-06",
      title: "Water Festival Day 3",
      khTitle: "ព្រះរាជពិធីបុណ្យអុំទូក",
    },
  ],
  2026: [
    { date: "2026-05-01", title: "Visak Bochea", khTitle: "ពិធីបុណ្យវិសាខបូជា" },
    {
      date: "2026-05-05",
      title: "Royal Plowing Ceremony",
      khTitle: "ព្រះរាជពិធីច្រត់ព្រះនង្គ័ល",
    },
    { date: "2026-10-09", title: "Pchum Ben Day 1", khTitle: "បុណ្យភ្ជុំបិណ្ឌ" },
    { date: "2026-10-10", title: "Pchum Ben Day 2", khTitle: "បុណ្យភ្ជុំបិណ្ឌ" },
    { date: "2026-10-11", title: "Pchum Ben Day 3", khTitle: "បុណ្យភ្ជុំបិណ្ឌ" },
    {
      date: "2026-11-23",
      title: "Water Festival Day 1",
      khTitle: "ព្រះរាជពិធីបុណ្យអុំទូក",
    },
    {
      date: "2026-11-24",
      title: "Water Festival Day 2",
      khTitle: "ព្រះរាជពិធីបុណ្យអុំទូក",
    },
    {
      date: "2026-11-25",
      title: "Water Festival Day 3",
      khTitle: "ព្រះរាជពិធីបុណ្យអុំទូក",
    },
  ],
  2027: [
    { date: "2027-05-20", title: "Visak Bochea", khTitle: "ពិធីបុណ្យវិសាខបូជា" },
    {
      date: "2027-05-24",
      title: "Royal Plowing Ceremony",
      khTitle: "ព្រះរាជពិធីច្រត់ព្រះនង្គ័ល",
    },
    { date: "2027-09-29", title: "Pchum Ben Day 1", khTitle: "បុណ្យភ្ជុំបិណ្ឌ" },
    { date: "2027-09-30", title: "Pchum Ben Day 2", khTitle: "បុណ្យភ្ជុំបិណ្ឌ" },
    { date: "2027-10-01", title: "Pchum Ben Day 3", khTitle: "បុណ្យភ្ជុំបិណ្ឌ" },
    {
      date: "2027-11-13",
      title: "Water Festival Day 1",
      khTitle: "ព្រះរាជពិធីបុណ្យអុំទូក",
    },
    {
      date: "2027-11-14",
      title: "Water Festival Day 2",
      khTitle: "ព្រះរាជពិធីបុណ្យអុំទូក",
    },
    {
      date: "2027-11-15",
      title: "Water Festival Day 3",
      khTitle: "ព្រះរាជពិធីបុណ្យអុំទូក",
    },
  ],
};

export function getCambodiaHolidays(year: number): CalendarSpecialDay[] {
  const fixed: { mmdd: string; title: string; khTitle: string }[] = [
    { mmdd: "01-01", title: "International New Year", khTitle: "ទិវាចូលឆ្នាំសកល" },
    {
      mmdd: "01-07",
      title: "Victory Over Genocide Day",
      khTitle: "ទិវាជ័យជម្នះ ៧ មករា",
    },
    {
      mmdd: "03-08",
      title: "International Women's Day",
      khTitle: "ទិវាអន្តរជាតិនារី",
    },
    {
      mmdd: "04-14",
      title: "Khmer New Year Day 1",
      khTitle: "បុណ្យចូលឆ្នាំថ្មីប្រពៃណីជាតិ",
    },
    {
      mmdd: "04-15",
      title: "Khmer New Year Day 2",
      khTitle: "បុណ្យចូលឆ្នាំថ្មីប្រពៃណីជាតិ",
    },
    {
      mmdd: "04-16",
      title: "Khmer New Year Day 3",
      khTitle: "បុណ្យចូលឆ្នាំថ្មីប្រពៃណីជាតិ",
    },
    {
      mmdd: "05-01",
      title: "International Labor Day",
      khTitle: "ទិវាពលកម្មអន្តរជាតិ",
    },
    {
      mmdd: "05-14",
      title: "King Sihamoni's Birthday",
      khTitle: "ព្រះរាជពិធីបុណ្យចម្រើនព្រះជន្ម",
    },
    {
      mmdd: "06-18",
      title: "Queen Mother's Birthday",
      khTitle: "ព្រះជន្មព្រះមហាក្សត្រី",
    },
    { mmdd: "09-24", title: "Constitution Day", khTitle: "ទិវារដ្ឋធម្មនុញ្ញ" },
    {
      mmdd: "10-15",
      title: "King Father Commemoration",
      khTitle: "ទិវាគោរពព្រះវិញ្ញាណក្ខន្ធ",
    },
    {
      mmdd: "10-29",
      title: "Coronation Day",
      khTitle: "ព្រះរាជពិធីគ្រងព្រះបរមរាជសម្បត្តិ",
    },
    { mmdd: "11-09", title: "Independence Day", khTitle: "ទិវាបុណ្យឯករាជ្យជាតិ" },
    {
      mmdd: "12-29",
      title: "Peace Day in Cambodia",
      khTitle: "ទិវាសន្តិភាពនៅកម្ពុជា",
    },
  ];

  const out: CalendarSpecialDay[] = fixed.map((h) => ({
    id: `kh-${year}-${h.mmdd}-${h.title.slice(0, 6)}`,
    date: `${year}-${h.mmdd}`,
    title: h.title,
    khTitle: h.khTitle,
    kind: "kh-public",
    detail: `${h.khTitle} · ${h.title}`,
  }));

  const movable = MOVABLE_KH_HOLIDAYS[year];
  if (movable) {
    for (const m of movable) {
      out.push({
        id: `kh-mov-${m.date}-${m.title.slice(0, 8)}`,
        date: m.date,
        title: m.title,
        khTitle: m.khTitle,
        kind: "kh-public",
        detail: `${m.khTitle} · ${m.title}`,
      });
    }
  } else {
    // Lunar approximation fallback for future years
    const visak = fullMoonInMonth(year, 5);
    if (visak) {
      out.push({
        id: `kh-visak-${visak}`,
        date: visak,
        title: "Visak Bochea",
        khTitle: "ពិធីបុណ្យវិសាខបូជា",
        kind: "kh-public",
      });
      out.push({
        id: `kh-plow-${visak}`,
        date: addIsoDays(visak, 4),
        title: "Royal Plowing Ceremony",
        khTitle: "ព្រះរាជពិធីច្រត់ព្រះនង្គ័ល",
        kind: "kh-public",
      });
    }
    const wf = fullMoonInMonth(year, 11);
    if (wf) {
      [-1, 0, 1].forEach((offset, idx) => {
        out.push({
          id: `kh-wf-${year}-${idx}`,
          date: addIsoDays(wf, offset),
          title: `Water Festival Day ${idx + 1}`,
          khTitle: "ព្រះរាជពិធីបុណ្យអុំទូក",
          kind: "kh-public",
        });
      });
    }
  }

  return out.sort((a, b) => a.date.localeCompare(b.date));
}

export function getPopularDays(year: number): CalendarSpecialDay[] {
  const days: { date: string; title: string; detail: string }[] = [
    {
      date: `${year}-02-14`,
      title: "Valentine's Day",
      detail: "Popular celebration & campaign day",
    },
    {
      date: nthWeekdayOfMonth(year, 5, 0, 2),
      title: "Mother's Day",
      detail: "2nd Sunday of May",
    },
    {
      date: `${year}-06-01`,
      title: "Children's Day",
      detail: "International Children's Day",
    },
    {
      date: nthWeekdayOfMonth(year, 6, 0, 3),
      title: "Father's Day",
      detail: "3rd Sunday of June",
    },
    {
      date: `${year}-10-31`,
      title: "Halloween",
      detail: "Popular seasonal event",
    },
    {
      date: addIsoDays(nthWeekdayOfMonth(year, 11, 4, 4), 1),
      title: "Black Friday",
      detail: "Major retail & promo campaign day",
    },
    {
      date: `${year}-12-25`,
      title: "Christmas Day",
      detail: "Popular global holiday",
    },
    {
      date: `${year}-12-31`,
      title: "New Year's Eve",
      detail: "Year-end celebration",
    },
  ];

  return days.map((d, idx) => ({
    id: `pop-${d.date}-${idx}`,
    date: d.date,
    title: d.title,
    kind: "popular",
    detail: d.detail,
  }));
}

export function buildSpecialDaysForYears(
  years: number[],
  toggles: { khHolidays: boolean; thngaiSel: boolean; popular: boolean },
): CalendarSpecialDay[] {
  const all: CalendarSpecialDay[] = [];
  for (const y of years) {
    if (toggles.khHolidays) all.push(...getCambodiaHolidays(y));
    if (toggles.thngaiSel) all.push(...getThngaiSelDays(y));
    if (toggles.popular) all.push(...getPopularDays(y));
  }
  return all;
}
