import { describe, expect, it } from "vitest";
import {
  daysUntilIso,
  formatOdoKm,
  getDueReminders,
  getRemindersForYear,
  nextOccurrenceDate,
} from "./reminders";
import type { CalendarReminder } from "./store";

describe("calendar reminders & ODO alerts", () => {
  const birthday: CalendarReminder = {
    id: "r1",
    title: "Kid Birthday",
    date: "2020-11-22",
    category: "birthday",
    notifyDaysBefore: 5,
    repeatYearly: true,
    notes: "Cake & gift",
  };

  const carService: CalendarReminder = {
    id: "r2",
    title: "Prius 2012 Oil Change",
    date: "2026-11-20",
    category: "car-odo",
    odoKm: 142500,
    notifyDaysBefore: 3,
    repeatYearly: false,
    notes: "0W-20 synthetic",
  };

  it("computes next occurrence for yearly recurring birthdays and leap days", () => {
    expect(nextOccurrenceDate(birthday, "2026-11-19")).toBe("2026-11-22");
    expect(nextOccurrenceDate(birthday, "2026-11-25")).toBe("2027-11-22");

    const leapBday: CalendarReminder = {
      ...birthday,
      date: "2024-02-29",
    };
    expect(nextOccurrenceDate(leapBday, "2026-02-01")).toBe("2026-02-28");
  });

  it("triggers prior-day alerts within notifyDaysBefore and skips dismissed occurrences", () => {
    const due = getDueReminders([birthday, carService], "2026-11-19");
    expect(due).toHaveLength(2);
    expect(due[0]!.reminder.id).toBe("r2");
    expect(due[0]!.daysUntil).toBe(1);
    expect(due[1]!.reminder.id).toBe("r1");
    expect(due[1]!.daysUntil).toBe(3);

    const dismissed: CalendarReminder = {
      ...carService,
      dismissedForDate: "2026-11-20",
    };
    const afterDismiss = getDueReminders([birthday, dismissed], "2026-11-19");
    expect(afterDismiss).toHaveLength(1);
    expect(afterDismiss[0]!.reminder.id).toBe("r1");
  });

  it("projects yearly reminders across years and formats ODO readings", () => {
    expect(daysUntilIso("2026-11-22", "2026-11-19")).toBe(3);
    expect(formatOdoKm(142500)).toBe("142,500 km");
    const y2027 = getRemindersForYear([birthday, carService], 2027);
    expect(y2027).toHaveLength(1);
    expect(y2027[0]!.date).toBe("2027-11-22");
  });
});
