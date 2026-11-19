import { describe, expect, it } from "vitest";
import {
  buildSpecialDaysForYears,
  getCambodiaHolidays,
  getPopularDays,
  getThngaiSelDays,
} from "./kh-holidays";

describe("kh-holidays", () => {
  it("returns Cambodia fixed and movable public holidays for 2026", () => {
    const holidays = getCambodiaHolidays(2026);
    const dates = holidays.map((h) => h.date);
    const titles = holidays.map((h) => h.title);

    expect(dates).toContain("2026-01-01");
    expect(dates).toContain("2026-04-14");
    expect(dates).toContain("2026-04-15");
    expect(dates).toContain("2026-04-16");
    expect(dates).toContain("2026-11-09");
    expect(dates).toContain("2026-10-09"); // Pchum Ben 2026
    expect(dates).toContain("2026-11-23"); // Water Festival 2026
    expect(titles).toContain("Independence Day");
    expect(
      holidays.every((h) => h.kind === "kh-public" && Boolean(h.khTitle)),
    ).toBe(true);
  });

  it("computes Khmer lunar Thngai Sel offering days across all 4 phases", () => {
    const selDays = getThngaiSelDays(2026);
    expect(selDays.length).toBeGreaterThanOrEqual(45);
    expect(selDays.length).toBeLessThanOrEqual(52);

    const titles = new Set(selDays.map((d) => d.title));
    expect(titles.has("ថ្ងៃសីល (ដាច់ខែ)")).toBe(true);
    expect(titles.has("ថ្ងៃសីល (៨ កើត)")).toBe(true);
    expect(titles.has("ថ្ងៃសីល (១៥ កើត)")).toBe(true);
    expect(titles.has("ថ្ងៃសីល (៨ រោច)")).toBe(true);
    expect(
      selDays.every((d) => d.date.startsWith("2026-") && d.kind === "sel"),
    ).toBe(true);
  });

  it("computes popular days and combines toggled categories cleanly", () => {
    const pop = getPopularDays(2026);
    expect(
      pop.some((d) => d.date === "2026-02-14" && d.title === "Valentine's Day"),
    ).toBe(true);
    expect(
      pop.some((d) => d.date === "2026-12-25" && d.title === "Christmas Day"),
    ).toBe(true);

    const none = buildSpecialDaysForYears([2026], {
      khHolidays: false,
      thngaiSel: false,
      popular: false,
    });
    expect(none).toHaveLength(0);

    const onlySel = buildSpecialDaysForYears([2026], {
      khHolidays: false,
      thngaiSel: true,
      popular: false,
    });
    expect(onlySel.every((d) => d.kind === "sel")).toBe(true);
    expect(onlySel.length).toBeGreaterThan(40);
  });
});
