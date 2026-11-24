import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type {
  DateClickArg,
  EventResizeDoneArg,
} from "@fullcalendar/interaction";
import type {
  DateSelectArg,
  DatesSetArg,
  EventClickArg,
  EventDropArg,
  EventInput,
} from "@fullcalendar/core";
import {
  LazyFullCalendar,
  useIsDesktopMd,
} from "@/components/rv/LazyFullCalendar";
import {
  CalendarPlus,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Flag,
  Moon,
  Plus,
  Sparkles,
} from "lucide-react";
import { Btn, Glass } from "@/components/rv/ui";
import { upsert } from "@/components/rv/Crud";
import {
  workProjectMeta,
  workTaskProjectName,
} from "@/components/rv/workProjectColors";
import {
  buildSpecialDaysForYears,
  type CalendarSpecialDay,
} from "@/lib/kh-holidays";
import {
  addDays,
  normalizeWorkStage,
  setDB,
  shortDate,
  today,
  type WorkTask,
} from "@/lib/store";
import { cn } from "@/lib/utils";

interface HolidayToggleState {
  khHolidays: boolean;
  thngaiSel: boolean;
  popular: boolean;
}

const HOLIDAY_TOGGLE_STORAGE_KEY = "rv-cal-holidays-v1";

function loadHolidayToggles(): HolidayToggleState {
  if (typeof window === "undefined") {
    return { khHolidays: true, thngaiSel: true, popular: false };
  }
  try {
    const raw = window.localStorage.getItem(HOLIDAY_TOGGLE_STORAGE_KEY);
    if (!raw) return { khHolidays: true, thngaiSel: true, popular: false };
    const parsed = JSON.parse(raw) as Partial<HolidayToggleState>;
    return {
      khHolidays: parsed.khHolidays ?? true,
      thngaiSel: parsed.thngaiSel ?? true,
      popular: parsed.popular ?? false,
    };
  } catch {
    return { khHolidays: true, thngaiSel: true, popular: false };
  }
}

function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function buildMonthGrid(monthIso: string): string[] {
  const [yStr, mStr] = monthIso.split("-");
  const y = Number(yStr) || Number(today().slice(0, 4));
  const m = (Number(mStr) || 1) - 1;
  const first = new Date(Date.UTC(y, m, 1));
  const startDow = first.getUTCDay();
  const gridStart = new Date(Date.UTC(y, m, 1 - startDow));
  const cells: string[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart.getTime() + i * 86400000);
    const yy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(d.getUTCDate()).padStart(2, "0");
    cells.push(`${yy}-${mm}-${dd}`);
  }
  return cells;
}

function shiftMonth(monthIso: string, delta: number): string {
  const [yStr, mStr] = monthIso.split("-");
  const y = Number(yStr) || Number(today().slice(0, 4));
  const m = (Number(mStr) || 1) - 1;
  const d = new Date(Date.UTC(y, m + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function WorkTasksCalendar({
  tasks,
  projectNames,
  activeProject,
  onCreateOnRange,
  onSelectTask,
  onRescheduleTask,
}: {
  tasks: WorkTask[];
  projectNames: string[];
  activeProject: string;
  onCreateOnRange: (startDate: string, dueDate: string) => void;
  onSelectTask: (task: WorkTask) => void;
  onRescheduleTask: (
    task: WorkTask,
    startDate: string,
    dueDate: string,
  ) => void;
}) {
  const todayStr = today();
  const isDesktopMd = useIsDesktopMd();
  const [holidayToggles, setHolidayToggles] = useState<HolidayToggleState>({
    khHolidays: true,
    thngaiSel: true,
    popular: false,
  });
  const [visibleYear, setVisibleYear] = useState<number>(() =>
    Number(todayStr.slice(0, 4)),
  );
  const [mobileMonth, setMobileMonth] = useState<string>(() =>
    todayStr.slice(0, 7),
  );
  const [selectedMobileDate, setSelectedMobileDate] =
    useState<string>(todayStr);

  useEffect(() => {
    setHolidayToggles(loadHolidayToggles());
  }, []);

  const toggleHolidayKind = (key: keyof HolidayToggleState) => {
    setHolidayToggles((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        window.localStorage.setItem(
          HOLIDAY_TOGGLE_STORAGE_KEY,
          JSON.stringify(next),
        );
      } catch {
        // Ignore storage quota errors
      }
      return next;
    });
  };

  const specialDays = useMemo(
    () =>
      buildSpecialDaysForYears(
        [visibleYear - 1, visibleYear, visibleYear + 1],
        holidayToggles,
      ),
    [visibleYear, holidayToggles],
  );

  const specialDayMap = useMemo(() => {
    const map = new Map<string, CalendarSpecialDay>();
    for (const s of specialDays) map.set(s.id, s);
    return map;
  }, [specialDays]);

  const scheduledEvents = useMemo<EventInput[]>(() => {
    const taskEvents: EventInput[] = tasks
      .filter((t) => Boolean(t.startDate || t.dueDate || t.completedDate))
      .map((t) => {
        const proj = workTaskProjectName(t);
        const start = t.startDate || t.dueDate || t.completedDate;
        const rawEnd =
          t.dueDate && t.dueDate >= start
            ? t.dueDate
            : t.completedDate && t.completedDate >= start
              ? t.completedDate
              : start;
        const meta = workProjectMeta(proj);
        const accent = meta.accent;
        const prefix = proj ? `[${meta.shortCode}] ` : "";
        const done = normalizeWorkStage(t.status) === "Completed";
        const doneMark = done ? "✓ " : "";

        return {
          id: t.id,
          title: `${doneMark}${prefix}${t.title || t.code}`,
          start,
          end: addDays(rawEnd, 1),
          allDay: true,
          backgroundColor: accent.calBg,
          borderColor: accent.calBorder,
          textColor: accent.calText,
          classNames: done ? ["opacity-75"] : [],
        };
      });

    const specialEvents: EventInput[] = specialDays.map((sp) => ({
      id: `sp:${sp.id}`,
      title: sp.title,
      start: sp.date,
      allDay: true,
      editable: false,
      startEditable: false,
      durationEditable: false,
      classNames: [
        "fc-event-special",
        sp.kind === "kh-public"
          ? "fc-event-kh"
          : sp.kind === "sel"
            ? "fc-event-sel"
            : "fc-event-pop",
      ],
    }));

    return [...taskEvents, ...specialEvents];
  }, [tasks, specialDays]);

  const unscheduledTasks = useMemo(
    () => tasks.filter((t) => !t.startDate && !t.dueDate && !t.completedDate),
    [tasks],
  );

  const legendProjects = useMemo(() => {
    const names = new Set<string>(projectNames);
    for (const t of tasks) {
      const p = workTaskProjectName(t);
      if (p) names.add(p);
    }
    return Array.from(names);
  }, [projectNames, tasks]);

  const handleDatesSet = (arg: DatesSetArg) => {
    const midMs = (arg.start.getTime() + arg.end.getTime()) / 2;
    const y = new Date(midMs).getFullYear();
    if (y !== visibleYear) setVisibleYear(y);
  };

  const onDateClick = (arg: DateClickArg) => {
    onCreateOnRange(arg.dateStr, arg.dateStr);
  };

  const onSelect = (arg: DateSelectArg) => {
    const start = toIsoDate(arg.start);
    const inclusiveEnd = addDays(toIsoDate(arg.end), -1);
    onCreateOnRange(start, inclusiveEnd >= start ? inclusiveEnd : start);
  };

  const onEventClick = (arg: EventClickArg) => {
    if (arg.event.id.startsWith("sp:")) {
      const sp = specialDayMap.get(arg.event.id.slice(3));
      if (sp) {
        toast.message(sp.khTitle ? `${sp.khTitle} · ${sp.title}` : sp.title, {
          description: `${shortDate(sp.date)}${sp.detail ? ` — ${sp.detail}` : ""}`,
        });
      }
      return;
    }
    const found = tasks.find((t) => t.id === arg.event.id);
    if (found) onSelectTask(found);
  };

  const onEventDrop = (arg: EventDropArg) => {
    if (arg.event.id.startsWith("sp:")) {
      arg.revert();
      return;
    }
    const found = tasks.find((t) => t.id === arg.event.id);
    if (!found || !arg.event.start) return;
    const start = toIsoDate(arg.event.start);
    const due = arg.event.end ? addDays(toIsoDate(arg.event.end), -1) : start;
    onRescheduleTask(found, start, due >= start ? due : start);
  };

  const onEventResize = (arg: EventResizeDoneArg) => {
    if (arg.event.id.startsWith("sp:")) {
      arg.revert();
      return;
    }
    const found = tasks.find((t) => t.id === arg.event.id);
    if (!found || !arg.event.start) return;
    const start = toIsoDate(arg.event.start);
    const due = arg.event.end ? addDays(toIsoDate(arg.event.end), -1) : start;
    onRescheduleTask(found, start, due >= start ? due : start);
  };

  const toggleWorkDone = (task: WorkTask) => {
    const nextDone = normalizeWorkStage(task.status) !== "Completed";
    setDB((d) => ({
      ...d,
      workTasks: upsert(d.workTasks ?? [], {
        ...task,
        status: nextDone ? "Completed" : "Design",
        completedDate: nextDone ? todayStr : "",
      }),
    }));
    toast.success(
      nextDone
        ? `Marked "${task.title || task.code}" Completed`
        : `Reopened "${task.title || task.code}"`,
    );
  };

  const mobileMonthCells = useMemo(
    () => buildMonthGrid(mobileMonth),
    [mobileMonth],
  );

  const mobileMonthLabel = useMemo(() => {
    const [yStr, mStr] = mobileMonth.split("-");
    const y = Number(yStr) || Number(todayStr.slice(0, 4));
    const m = (Number(mStr) || 1) - 1;
    return new Date(Date.UTC(y, m, 1)).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });
  }, [mobileMonth, todayStr]);

  const mobileMarkers = useMemo(() => {
    const map = new Map<
      string,
      { work: number; kh: boolean; sel: boolean; pop: boolean }
    >();
    const touch = (date: string) => {
      let cur = map.get(date);
      if (!cur) {
        cur = { work: 0, kh: false, sel: false, pop: false };
        map.set(date, cur);
      }
      return cur;
    };

    for (const cellDate of mobileMonthCells) {
      for (const t of tasks) {
        const s = t.startDate || t.dueDate || t.completedDate;
        const e =
          t.dueDate && s && t.dueDate >= s
            ? t.dueDate
            : t.completedDate && s && t.completedDate >= s
              ? t.completedDate
              : s;
        if (s && e && cellDate >= s && cellDate <= e) {
          touch(cellDate).work += 1;
        }
      }
    }

    for (const sp of specialDays) {
      const cur = touch(sp.date);
      if (sp.kind === "kh-public") cur.kh = true;
      else if (sp.kind === "sel") cur.sel = true;
      else cur.pop = true;
    }
    return map;
  }, [mobileMonthCells, tasks, specialDays]);

  const mobileSelectedDayTasks = useMemo(
    () =>
      tasks.filter((t) => {
        const s = t.startDate || t.dueDate || t.completedDate;
        const e =
          t.dueDate && s && t.dueDate >= s
            ? t.dueDate
            : t.completedDate && s && t.completedDate >= s
              ? t.completedDate
              : s;
        return Boolean(
          s && e && selectedMobileDate >= s && selectedMobileDate <= e,
        );
      }),
    [tasks, selectedMobileDate],
  );

  const mobileSelectedSpecials = useMemo(
    () => specialDays.filter((sp) => sp.date === selectedMobileDate),
    [specialDays, selectedMobileDate],
  );

  return (
    <div className="space-y-4">
      <Glass>
        <div className="mb-3 flex flex-col gap-2 text-xs text-muted-foreground">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span>
              Tap any date to add
              {activeProject !== "All" ? ` to ${activeProject}` : ""} · Drag to
              reschedule
            </span>
            <div className="flex flex-wrap items-center gap-2.5">
              {legendProjects.map((name) => {
                const meta = workProjectMeta(name);
                const ProjIcon = meta.icon;
                return (
                  <span
                    key={name}
                    className="inline-flex items-center gap-1.5 font-medium text-foreground/90"
                  >
                    <ProjIcon
                      className="h-3.5 w-3.5 shrink-0"
                      style={{ color: meta.accent.dot }}
                    />
                    {meta.shortCode}
                  </span>
                );
              })}
              <Btn
                type="button"
                variant="gold"
                onClick={() =>
                  onCreateOnRange(
                    selectedMobileDate || todayStr,
                    selectedMobileDate || todayStr,
                  )
                }
                className="min-h-[34px] px-3 py-1 text-xs"
              >
                <CalendarPlus className="h-3.5 w-3.5" />
                Add today
              </Btn>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => toggleHolidayKind("khHolidays")}
              aria-pressed={holidayToggles.khHolidays}
              className={cn(
                "inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[0.7rem] font-semibold transition-all active:scale-95",
                holidayToggles.khHolidays
                  ? "border-rose-500/50 bg-rose-500/20 text-rose-200 light:text-rose-800"
                  : "border-border bg-secondary text-muted-foreground hover:text-foreground",
              )}
            >
              <Flag className="h-3 w-3 shrink-0" />
              <span>KH Holidays</span>
            </button>
            <button
              type="button"
              onClick={() => toggleHolidayKind("thngaiSel")}
              aria-pressed={holidayToggles.thngaiSel}
              className={cn(
                "inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[0.7rem] font-semibold transition-all active:scale-95",
                holidayToggles.thngaiSel
                  ? "border-primary/50 bg-primary/20 text-primary"
                  : "border-border bg-secondary text-muted-foreground hover:text-foreground",
              )}
            >
              <Moon className="h-3 w-3 shrink-0" />
              <span>ថ្ងៃសីល</span>
            </button>
            <button
              type="button"
              onClick={() => toggleHolidayKind("popular")}
              aria-pressed={holidayToggles.popular}
              className={cn(
                "inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[0.7rem] font-semibold transition-all active:scale-95",
                holidayToggles.popular
                  ? "border-sky-500/50 bg-sky-500/20 text-sky-200 light:text-sky-800"
                  : "border-border bg-secondary text-muted-foreground hover:text-foreground",
              )}
            >
              <Sparkles className="h-3 w-3 shrink-0" />
              <span>Popular</span>
            </button>
          </div>
        </div>

        {/* Mobile Touch Calendar (< 768px) */}
        {!isDesktopMd && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  aria-label="Previous month"
                  onClick={() => {
                    const next = shiftMonth(mobileMonth, -1);
                    setMobileMonth(next);
                    setVisibleYear(Number(next.slice(0, 4)));
                  }}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-secondary text-foreground active:scale-95"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Next month"
                  onClick={() => {
                    const next = shiftMonth(mobileMonth, 1);
                    setMobileMonth(next);
                    setVisibleYear(Number(next.slice(0, 4)));
                  }}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-secondary text-foreground active:scale-95"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMonth(todayStr.slice(0, 7));
                    setVisibleYear(Number(todayStr.slice(0, 4)));
                    setSelectedMobileDate(todayStr);
                  }}
                  className="min-h-[36px] rounded-lg border border-border bg-secondary px-3 text-xs font-semibold text-foreground active:scale-95"
                >
                  Today
                </button>
              </div>
              <p className="font-display text-sm font-bold text-foreground">
                {mobileMonthLabel}
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border/80 bg-muted/20">
              <div className="grid grid-cols-7 border-b border-border/70 bg-muted/35 py-2 text-center text-[0.64rem] font-semibold uppercase tracking-wider text-muted-foreground">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((wd) => (
                  <span key={wd}>{wd}</span>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {mobileMonthCells.map((cellDate) => {
                  const inMonth = cellDate.startsWith(mobileMonth);
                  const isToday = cellDate === todayStr;
                  const isSelected = cellDate === selectedMobileDate;
                  const marks = mobileMarkers.get(cellDate);
                  return (
                    <button
                      key={cellDate}
                      type="button"
                      onClick={() => setSelectedMobileDate(cellDate)}
                      className={cn(
                        "flex min-h-[46px] flex-col items-center justify-between border-b border-r border-border/45 px-1 py-1.5 transition-colors",
                        !inMonth && "opacity-40",
                        isSelected
                          ? "bg-primary/20 ring-1 ring-inset ring-primary"
                          : isToday
                            ? "bg-accent/70"
                            : "hover:bg-muted/50",
                      )}
                    >
                      <span
                        className={cn(
                          "font-num text-xs font-semibold leading-none",
                          isToday ? "text-primary" : "text-foreground",
                        )}
                      >
                        {Number(cellDate.slice(8, 10))}
                      </span>
                      <span className="flex flex-wrap items-center justify-center gap-0.5">
                        {marks && marks.work > 0 && (
                          <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                        )}
                        {marks && marks.kh && (
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                        )}
                        {marks && marks.sel && (
                          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        )}
                        {marks && marks.pop && (
                          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-border/75 bg-muted/25 p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="font-num text-xs font-bold text-foreground">
                  {shortDate(selectedMobileDate)}
                  {selectedMobileDate === todayStr ? " · Today" : ""}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    onCreateOnRange(selectedMobileDate, selectedMobileDate)
                  }
                  className="inline-flex min-h-[34px] items-center gap-1 rounded-lg bg-primary px-3 text-[0.7rem] font-semibold text-primary-foreground"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add task</span>
                </button>
              </div>

              {mobileSelectedSpecials.length === 0 &&
              mobileSelectedDayTasks.length === 0 ? (
                <p className="py-3 text-center text-xs text-muted-foreground">
                  No work tasks scheduled for this date.
                </p>
              ) : (
                <div className="space-y-1.5">
                  {mobileSelectedSpecials.map((sp) => (
                    <div
                      key={sp.id}
                      className={cn(
                        "rounded-xl border px-2.5 py-2 text-xs font-semibold",
                        sp.kind === "kh-public"
                          ? "border-rose-500/45 bg-rose-500/15 text-rose-100 light:text-rose-900"
                          : sp.kind === "sel"
                            ? "border-primary/45 bg-primary/15 text-amber-100 light:text-amber-900"
                            : "border-sky-500/45 bg-sky-500/15 text-sky-100 light:text-sky-900",
                      )}
                    >
                      {sp.khTitle ? `${sp.khTitle} · ${sp.title}` : sp.title}
                    </div>
                  ))}

                  {mobileSelectedDayTasks.map((task) => {
                    const stage = normalizeWorkStage(task.status);
                    const done = stage === "Completed";
                    const proj = workTaskProjectName(task);
                    const meta = workProjectMeta(proj);
                    const ProjIcon = meta.icon;
                    return (
                      <div
                        key={task.id}
                        className="flex items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-2 text-xs"
                      >
                        <button
                          type="button"
                          onClick={() => toggleWorkDone(task)}
                          aria-label={
                            done
                              ? `Reopen ${task.title || task.code}`
                              : `Complete ${task.title || task.code}`
                          }
                          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg hover:bg-accent"
                        >
                          {done ? (
                            <CheckCircle2 className="h-4 w-4 text-positive" />
                          ) : (
                            <Circle className="h-4 w-4 text-muted-foreground" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => onSelectTask(task)}
                          className="min-w-0 flex-1 text-left"
                        >
                          <p
                            className={cn(
                              "truncate font-semibold text-foreground",
                              done && "line-through opacity-65",
                            )}
                          >
                            {task.title || task.code}
                          </p>
                          <p className="flex items-center gap-1.5 truncate text-[0.68rem] text-muted-foreground">
                            <ProjIcon
                              className="h-3 w-3 shrink-0"
                              style={{ color: meta.accent.dot }}
                            />
                            <span>
                              {proj ? `${meta.shortCode} · ` : ""}
                              {stage}
                            </span>
                          </p>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Desktop FullCalendar (>= 768px) */}
        {isDesktopMd && (
          <div className="project-calendar">
            <LazyFullCalendar
              initialView="dayGridMonth"
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "",
              }}
              height="auto"
              editable
              selectable
              selectMirror
              eventStartEditable
              eventDurationEditable
              dayMaxEvents={4}
              events={scheduledEvents}
              datesSet={handleDatesSet}
              dateClick={onDateClick}
              select={onSelect}
              eventClick={onEventClick}
              eventDrop={onEventDrop}
              eventResize={onEventResize}
            />
          </div>
        )}
      </Glass>

      {unscheduledTasks.length > 0 && (
        <Glass>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-display text-base font-bold">
                Unscheduled tasks ({unscheduledTasks.length})
              </h3>
              <p className="text-xs text-muted-foreground">
                Assign a calendar date in one click or open to set multi-day
                dates.
              </p>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {unscheduledTasks.map((task) => {
              const proj = workTaskProjectName(task);
              const meta = workProjectMeta(proj);
              const ProjIcon = meta.icon;
              return (
                <div
                  key={task.id}
                  className="flex items-center justify-between gap-2 rounded-xl border border-border bg-muted/50 px-3 py-2.5"
                >
                  <button
                    type="button"
                    onClick={() => onSelectTask(task)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className="flex items-center gap-1.5 truncate text-sm font-medium">
                      <ProjIcon
                        className="h-3.5 w-3.5 shrink-0"
                        style={{ color: meta.accent.dot }}
                      />
                      <span className="truncate">
                        {task.title || task.code}
                      </span>
                    </p>
                    <p className="font-num mt-0.5 truncate text-xs text-muted-foreground">
                      {proj ? `${meta.shortCode} · ` : ""}
                      {task.designType} · {normalizeWorkStage(task.status)}
                    </p>
                  </button>
                  <Btn
                    type="button"
                    className="shrink-0 px-2.5 py-1 text-xs"
                    onClick={() => onRescheduleTask(task, todayStr, todayStr)}
                  >
                    <CheckCircle2 className="h-3 w-3 text-primary" />
                    Today ({shortDate(todayStr)})
                  </Btn>
                </div>
              );
            })}
          </div>
        </Glass>
      )}
    </div>
  );
}
