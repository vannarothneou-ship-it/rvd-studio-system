import { useEffect, useMemo, useRef, useState } from "react";
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
  ArrowRight,
  Bell,
  Briefcase,
  Cake,
  CalendarDays,
  CalendarPlus,
  Car,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Columns3,
  Eye,
  EyeOff,
  Flag,
  Layers3,
  Moon,
  Pencil,
  Plus,
  Receipt,
  Repeat,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import {
  Btn,
  F,
  Glass,
  Pill,
  Sel,
  SlideDrawer,
  SlidingTabs,
} from "@/components/rv/ui";
import { nextCode, upsert } from "@/components/rv/Crud";
import {
  DesignMediaUploader,
  MediaLightboxViewer,
} from "@/components/rv/DesignMediaTools";
import {
  workProjectAccent,
  workProjectMeta,
  workTaskProjectName,
} from "@/components/rv/workProjectColors";
import {
  buildSpecialDaysForYears,
  type CalendarSpecialDay,
} from "@/lib/kh-holidays";
import {
  formatOdoKm,
  getDueReminders,
  getRemindersForYear,
} from "@/lib/reminders";
import {
  DEFAULT_WORK_PROJECTS,
  DESIGN_TYPES,
  PROJECT_STATUSES,
  WORK_PIPELINE_STAGES,
  addDays,
  nextWorkStage,
  normalizeWorkStage,
  setDB,
  shortDate,
  today,
  uid,
  updateProject,
  type CalendarReminder,
  type DB,
  type DesignMedia,
  type Project,
  type ReminderCategory,
  type ShowcaseWorkItem,
  type WorkTask,
} from "@/lib/store";
import { cn } from "@/lib/utils";

type CalendarSourceScope = "all" | "work" | "studio" | "reminders";
type ScheduleViewMode = "calendar" | "board";
type CreateKind = "work" | "studio" | "reminder";

export interface HolidayToggleState {
  khHolidays: boolean;
  thngaiSel: boolean;
  popular: boolean;
  reminders: boolean;
}

const HOLIDAY_TOGGLE_STORAGE_KEY = "rv-cal-holidays-v1";

function loadHolidayToggles(): HolidayToggleState {
  if (typeof window === "undefined") {
    return {
      khHolidays: true,
      thngaiSel: true,
      popular: false,
      reminders: true,
    };
  }
  try {
    const raw = window.localStorage.getItem(HOLIDAY_TOGGLE_STORAGE_KEY);
    if (!raw) {
      return {
        khHolidays: true,
        thngaiSel: true,
        popular: false,
        reminders: true,
      };
    }
    const parsed = JSON.parse(raw) as Partial<HolidayToggleState>;
    return {
      khHolidays: parsed.khHolidays ?? true,
      thngaiSel: parsed.thngaiSel ?? true,
      popular: parsed.popular ?? false,
      reminders: parsed.reminders ?? true,
    };
  } catch {
    return {
      khHolidays: true,
      thngaiSel: true,
      popular: false,
      reminders: true,
    };
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

const REMINDER_CATEGORIES: {
  id: ReminderCategory;
  label: string;
  icon: typeof Bell;
}[] = [
  { id: "car-odo", label: "Car ODO", icon: Car },
  { id: "birthday", label: "Birthday", icon: Cake },
  { id: "special", label: "Special Day", icon: Sparkles },
  { id: "bill", label: "Bill", icon: Receipt },
  { id: "general", label: "Reminder", icon: Bell },
];

function reminderCategoryIcon(category: ReminderCategory) {
  return REMINDER_CATEGORIES.find((c) => c.id === category)?.icon ?? Bell;
}

const NOTIFY_DAY_OPTIONS = [0, 1, 3, 7, 14] as const;

export function DashboardCalendarCard({
  db,
  className,
}: {
  db: DB;
  className?: string;
}) {
  const todayStr = today();
  const isDesktopMd = useIsDesktopMd();
  const [sourceScope, setSourceScope] = useState<CalendarSourceScope>("all");
  const [viewMode, setViewMode] = useState<ScheduleViewMode>("calendar");
  const [calendarCollapsed, setCalendarCollapsed] = useState(false);
  const [holidayToggles, setHolidayToggles] = useState<HolidayToggleState>({
    khHolidays: true,
    thngaiSel: true,
    popular: false,
    reminders: true,
  });
  const [visibleYear, setVisibleYear] = useState<number>(() =>
    Number(todayStr.slice(0, 4)),
  );
  const [mobileMonth, setMobileMonth] = useState<string>(() =>
    todayStr.slice(0, 7),
  );
  const [selectedMobileDate, setSelectedMobileDate] =
    useState<string>(todayStr);
  const [selectedSpecial, setSelectedSpecial] =
    useState<CalendarSpecialDay | null>(null);

  // Create / Edit drawer state
  const [createOpen, setCreateOpen] = useState(false);
  const [createKind, setCreateKind] = useState<CreateKind>("work");
  const [workDraft, setWorkDraft] = useState<WorkTask | null>(null);
  const [projectDraft, setProjectDraft] = useState<Project | null>(null);
  const [reminderDraft, setReminderDraft] = useState<CalendarReminder | null>(
    null,
  );

  // Project / Group management state inside drawer
  const [managingGroups, setManagingGroups] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [renamingGroup, setRenamingGroup] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  // Media preview modal inside calendar
  const [mediaPreview, setMediaPreview] = useState<{
    item: ShowcaseWorkItem;
    mediaId: string;
  } | null>(null);

  const alertedToastIdsRef = useRef<Set<string>>(new Set());

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

  const configuredGroups = useMemo(
    () =>
      db.settings.workProjects?.length
        ? db.settings.workProjects
        : [...DEFAULT_WORK_PROJECTS],
    [db.settings.workProjects],
  );

  const projectNames = useMemo(() => {
    const extra = (db.workTasks ?? [])
      .map((t) => (t.projectName || t.company || "").trim())
      .filter(Boolean);
    return Array.from(new Set([...configuredGroups, ...extra]));
  }, [configuredGroups, db.workTasks]);

  const specialDays = useMemo(
    () =>
      buildSpecialDaysForYears(
        [visibleYear - 1, visibleYear, visibleYear + 1],
        {
          khHolidays: holidayToggles.khHolidays,
          thngaiSel: holidayToggles.thngaiSel,
          popular: holidayToggles.popular,
        },
      ),
    [
      visibleYear,
      holidayToggles.khHolidays,
      holidayToggles.thngaiSel,
      holidayToggles.popular,
    ],
  );

  const specialDayMap = useMemo(() => {
    const map = new Map<string, CalendarSpecialDay>();
    for (const s of specialDays) map.set(s.id, s);
    return map;
  }, [specialDays]);

  const remindersList = useMemo(() => db.reminders ?? [], [db.reminders]);

  const dueAlerts = useMemo(
    () => getDueReminders(remindersList, todayStr),
    [remindersList, todayStr],
  );

  // Fire single-session popup toast for prior-day / today reminders
  useEffect(() => {
    if (dueAlerts.length === 0) return;
    const unseen = dueAlerts.filter(
      (a) =>
        !alertedToastIdsRef.current.has(`${a.reminder.id}:${a.occurrenceDate}`),
    );
    if (unseen.length === 0) return;
    const top = unseen[0]!;
    alertedToastIdsRef.current.add(`${top.reminder.id}:${top.occurrenceDate}`);
    const timing =
      top.daysUntil === 0
        ? "Today"
        : top.daysUntil === 1
          ? "Tomorrow"
          : `In ${top.daysUntil} days`;
    const odoStr =
      top.reminder.category === "car-odo" && top.reminder.odoKm
        ? ` · ${formatOdoKm(top.reminder.odoKm)}`
        : "";
    toast.info(`Reminder: ${top.reminder.title || "Upcoming event"}`, {
      description: `${timing} (${shortDate(top.occurrenceDate)})${odoStr}${
        unseen.length > 1 ? ` · +${unseen.length - 1} more alert(s)` : ""
      }`,
      duration: 6000,
    });
  }, [dueAlerts]);

  const reminderOccurrences = useMemo(() => {
    if (!holidayToggles.reminders && sourceScope !== "reminders") return [];
    const years = [visibleYear - 1, visibleYear, visibleYear + 1];
    return years.flatMap((y) => getRemindersForYear(remindersList, y));
  }, [remindersList, visibleYear, holidayToggles.reminders, sourceScope]);

  const events = useMemo<EventInput[]>(() => {
    const out: EventInput[] = [];

    if (sourceScope === "all" || sourceScope === "work") {
      for (const t of db.workTasks ?? []) {
        const start = t.startDate || t.dueDate || t.completedDate;
        if (!start) continue;
        const rawEnd =
          t.dueDate && t.dueDate >= start
            ? t.dueDate
            : t.completedDate && t.completedDate >= start
              ? t.completedDate
              : start;
        const proj = workTaskProjectName(t);
        const meta = workProjectMeta(proj);
        const accent = meta.accent;
        const prefix = proj ? `[${meta.shortCode}] ` : "";
        const done = normalizeWorkStage(t.status) === "Completed";
        const doneMark = done ? "✓ " : "";

        out.push({
          id: `wt:${t.id}`,
          title: `${doneMark}${prefix}${t.title || t.code}`,
          start,
          end: addDays(rawEnd, 1),
          allDay: true,
          backgroundColor: accent.calBg,
          borderColor: accent.calBorder,
          textColor: accent.calText,
          classNames: done ? ["opacity-75"] : [],
        });
      }
    }

    if (sourceScope === "all" || sourceScope === "studio") {
      for (const p of db.projects) {
        const start = p.start || p.due || p.delivered;
        if (!start) continue;
        const rawEnd =
          p.due && p.due >= start
            ? p.due
            : p.delivered && p.delivered >= start
              ? p.delivered
              : start;
        const client = db.clients.find((c) => c.id === p.clientId);
        const clientShort = client?.name ? client.name.split(" ")[0] : "Studio";
        const done = p.status === "Delivered" || p.status === "Closed";

        out.push({
          id: `prj:${p.id}`,
          title: `${done ? "✓ " : ""}[${clientShort}] ${p.name}`,
          start,
          end: addDays(rawEnd, 1),
          allDay: true,
          backgroundColor: done
            ? "oklch(0.68 0.13 155 / 38%)"
            : "color-mix(in oklch, var(--primary) 38%, transparent)",
          borderColor: done
            ? "oklch(0.68 0.13 155 / 78%)"
            : "color-mix(in oklch, var(--primary) 78%, transparent)",
          textColor: "var(--foreground)",
          classNames: ["fc-event-studio"],
        });
      }
    }

    if (sourceScope === "all" || sourceScope === "reminders") {
      for (const occ of reminderOccurrences) {
        const rm = occ.reminder;
        const odo =
          rm.category === "car-odo" && rm.odoKm
            ? ` · ${formatOdoKm(rm.odoKm)}`
            : "";
        const prefix =
          rm.category === "car-odo"
            ? "ODO "
            : rm.category === "birthday"
              ? "BDay "
              : "";
        out.push({
          id: `rm:${rm.id}:${occ.date}`,
          title: `${prefix}${rm.title}${odo}`,
          start: occ.date,
          allDay: true,
          editable: !rm.repeatYearly,
          startEditable: !rm.repeatYearly,
          durationEditable: false,
          classNames: ["fc-event-special", "fc-event-reminder"],
        });
      }
    }

    if (sourceScope !== "reminders") {
      for (const sp of specialDays) {
        const cls =
          sp.kind === "kh-public"
            ? "fc-event-kh"
            : sp.kind === "sel"
              ? "fc-event-sel"
              : "fc-event-pop";
        out.push({
          id: `sp:${sp.id}`,
          title: sp.title,
          start: sp.date,
          allDay: true,
          editable: false,
          startEditable: false,
          durationEditable: false,
          classNames: ["fc-event-special", cls],
        });
      }
    }

    return out;
  }, [
    db.workTasks,
    db.projects,
    db.clients,
    sourceScope,
    specialDays,
    reminderOccurrences,
  ]);

  const counts = useMemo(() => {
    const workCount = (db.workTasks ?? []).filter(
      (t) => t.status !== "Completed",
    ).length;
    const studioCount = db.projects.filter(
      (p) =>
        p.status === "Inquiry" ||
        p.status === "Quoted" ||
        p.status === "In production",
    ).length;
    const remCount = remindersList.length;
    return {
      all: workCount + studioCount + remCount,
      work: workCount,
      studio: studioCount,
      reminders: remCount,
    };
  }, [db.workTasks, db.projects, remindersList.length]);

  const upcomingSpecials = useMemo(() => {
    return specialDays.filter((s) => s.date >= todayStr).slice(0, 3);
  }, [specialDays, todayStr]);

  const makeBlankWorkTask = (startDate: string, dueDate: string): WorkTask => ({
    id: uid(),
    code: nextCode(
      "WRK-",
      (db.workTasks ?? []).map((t) => t.code),
      1,
    ),
    title: "",
    status: "Design",
    designType: DESIGN_TYPES[0],
    artworkCount: 1,
    projectName: projectNames[0] ?? "DBG",
    company: projectNames[0] ?? "DBG",
    startDate,
    dueDate,
    completedDate: "",
    conceptOnly: false,
    notes: "",
    media: [],
  });

  const makeBlankProject = (start: string, due: string): Project => ({
    id: uid(),
    code: nextCode(
      "PRJ-",
      db.projects.map((p) => p.code),
      1,
    ),
    clientId: db.clients[0]?.id ?? "",
    serviceId: db.services[0]?.id ?? "",
    name: "",
    status: "In production",
    start,
    due,
    delivered: "",
    quote: db.services[0]?.rate ?? 0,
    artworkCount: 1,
    media: [],
  });

  const makeBlankReminder = (date: string): CalendarReminder => ({
    id: uid(),
    title: "",
    date,
    category: "car-odo",
    notifyDaysBefore: 3,
    repeatYearly: false,
    notes: "",
    media: [],
  });

  const openCreateOnRange = (
    startDate: string,
    dueDate: string,
    defaultKind?: CreateKind,
  ) => {
    const end = dueDate >= startDate ? dueDate : startDate;
    const inferred: CreateKind =
      defaultKind ??
      (sourceScope === "studio"
        ? "studio"
        : sourceScope === "reminders"
          ? "reminder"
          : "work");
    setCreateKind(inferred);
    setWorkDraft(makeBlankWorkTask(startDate, end));
    setProjectDraft(makeBlankProject(startDate, end));
    setReminderDraft(makeBlankReminder(startDate));
    setManagingGroups(false);
    setCreateOpen(true);
  };

  const openEditWorkTask = (task: WorkTask) => {
    setCreateOpen(false);
    setProjectDraft(null);
    setReminderDraft(null);
    setManagingGroups(false);
    setWorkDraft({ ...task, media: task.media ?? [] });
  };

  const openEditProject = (proj: Project) => {
    setCreateOpen(false);
    setWorkDraft(null);
    setReminderDraft(null);
    setManagingGroups(false);
    setProjectDraft({ ...proj, media: proj.media ?? [] });
  };

  const openEditReminder = (rm: CalendarReminder) => {
    setCreateOpen(false);
    setWorkDraft(null);
    setProjectDraft(null);
    setManagingGroups(false);
    setReminderDraft({ ...rm, media: rm.media ?? [] });
  };

  const handleDatesSet = (arg: DatesSetArg) => {
    const midMs = (arg.start.getTime() + arg.end.getTime()) / 2;
    const mid = new Date(midMs);
    const y = mid.getFullYear();
    if (y !== visibleYear) setVisibleYear(y);
  };

  const handleDateClick = (arg: DateClickArg) => {
    openCreateOnRange(arg.dateStr, arg.dateStr);
  };

  const handleSelect = (arg: DateSelectArg) => {
    const start = toIsoDate(arg.start);
    const inclusiveEnd = addDays(toIsoDate(arg.end), -1);
    openCreateOnRange(start, inclusiveEnd >= start ? inclusiveEnd : start);
  };

  const handleEventClick = (arg: EventClickArg) => {
    const id = arg.event.id;
    if (id.startsWith("sp:")) {
      const sp = specialDayMap.get(id.slice(3));
      if (sp) {
        setSelectedSpecial(sp);
        toast.message(sp.khTitle ? `${sp.khTitle} · ${sp.title}` : sp.title, {
          description: `${shortDate(sp.date)}${sp.detail ? ` — ${sp.detail}` : ""}`,
        });
      }
      return;
    }
    if (id.startsWith("wt:")) {
      const task = (db.workTasks ?? []).find((t) => t.id === id.slice(3));
      if (task) openEditWorkTask(task);
      return;
    }
    if (id.startsWith("prj:")) {
      const proj = db.projects.find((p) => p.id === id.slice(4));
      if (proj) openEditProject(proj);
      return;
    }
    if (id.startsWith("rm:")) {
      const rmId = id.slice(3).split(":")[0];
      const rm = remindersList.find((r) => r.id === rmId);
      if (rm) openEditReminder(rm);
    }
  };

  const handleEventDrop = (arg: EventDropArg) => {
    const id = arg.event.id;
    if (id.startsWith("sp:") || !arg.event.start) {
      arg.revert();
      return;
    }
    const start = toIsoDate(arg.event.start);
    const rawDue = arg.event.end
      ? addDays(toIsoDate(arg.event.end), -1)
      : start;
    const due = rawDue >= start ? rawDue : start;

    if (id.startsWith("wt:")) {
      const task = (db.workTasks ?? []).find((t) => t.id === id.slice(3));
      if (!task) {
        arg.revert();
        return;
      }
      setDB((d) => ({
        ...d,
        workTasks: upsert(d.workTasks ?? [], {
          ...task,
          startDate: start,
          dueDate: due,
          completedDate: task.status === "Completed" ? due : task.completedDate,
        }),
      }));
      toast.success(
        `Moved "${task.title || task.code}" to ${shortDate(start)}.`,
      );
      return;
    }

    if (id.startsWith("prj:")) {
      const proj = db.projects.find((p) => p.id === id.slice(4));
      if (!proj) {
        arg.revert();
        return;
      }
      setDB((d) => updateProject(d, { ...proj, start, due }));
      toast.success(`Moved "${proj.name}" to ${shortDate(start)}.`);
      return;
    }

    if (id.startsWith("rm:")) {
      const rmId = id.slice(3).split(":")[0];
      const rm = remindersList.find((r) => r.id === rmId);
      if (!rm || rm.repeatYearly) {
        arg.revert();
        return;
      }
      setDB((d) => ({
        ...d,
        reminders: upsert(d.reminders ?? [], {
          ...rm,
          date: start,
          dismissedForDate: "",
        }),
      }));
      toast.success(`Moved "${rm.title}" to ${shortDate(start)}.`);
    }
  };

  const handleEventResize = (arg: EventResizeDoneArg) => {
    const id = arg.event.id;
    if (id.startsWith("sp:") || id.startsWith("rm:") || !arg.event.start) {
      arg.revert();
      return;
    }
    const start = toIsoDate(arg.event.start);
    const rawDue = arg.event.end
      ? addDays(toIsoDate(arg.event.end), -1)
      : start;
    const due = rawDue >= start ? rawDue : start;

    if (id.startsWith("wt:")) {
      const task = (db.workTasks ?? []).find((t) => t.id === id.slice(3));
      if (!task) {
        arg.revert();
        return;
      }
      setDB((d) => ({
        ...d,
        workTasks: upsert(d.workTasks ?? [], {
          ...task,
          startDate: start,
          dueDate: due,
        }),
      }));
      toast.success(`Updated dates for "${task.title || task.code}".`);
      return;
    }

    if (id.startsWith("prj:")) {
      const proj = db.projects.find((p) => p.id === id.slice(4));
      if (!proj) {
        arg.revert();
        return;
      }
      setDB((d) => updateProject(d, { ...proj, start, due }));
      toast.success(`Updated dates for "${proj.name}".`);
    }
  };

  // One-tap status toggles & pipeline advance (fewer clicks!)
  const quickToggleWorkDone = (task: WorkTask) => {
    const nextDone = normalizeWorkStage(task.status) !== "Completed";
    const updated: WorkTask = {
      ...task,
      status: nextDone ? "Completed" : "Design",
      completedDate: nextDone ? todayStr : "",
    };
    setDB((d) => ({
      ...d,
      workTasks: upsert(d.workTasks ?? [], updated),
    }));
    toast.success(
      nextDone
        ? `Marked "${task.title || task.code}" Completed`
        : `Reopened "${task.title || task.code}"`,
    );
  };

  const quickAdvanceWorkStage = (task: WorkTask) => {
    const nextStage = nextWorkStage(task);
    const updated: WorkTask = {
      ...task,
      status: nextStage,
      completedDate:
        nextStage === "Completed"
          ? task.completedDate || todayStr
          : task.completedDate,
    };
    setDB((d) => ({
      ...d,
      workTasks: upsert(d.workTasks ?? [], updated),
    }));
    toast.success(`"${task.title || task.code}" → ${nextStage}`);
  };

  const quickToggleProjectDone = (proj: Project) => {
    const isDone = proj.status === "Delivered" || proj.status === "Closed";
    const nextStatus = isDone ? "In production" : "Delivered";
    setDB((d) =>
      updateProject(d, {
        ...proj,
        status: nextStatus,
        delivered: isDone ? proj.delivered : proj.delivered || todayStr,
      }),
    );
    toast.success(
      isDone ? `Reopened "${proj.name}"` : `Marked "${proj.name}" Delivered`,
    );
  };

  const dismissReminderAlert = (
    rm: CalendarReminder,
    occurrenceDate: string,
  ) => {
    setDB((d) => ({
      ...d,
      reminders: upsert(d.reminders ?? [], {
        ...rm,
        dismissedForDate: occurrenceDate,
      }),
    }));
    toast.message(
      `Dismissed "${rm.title}" alert for ${shortDate(occurrenceDate)}.`,
    );
  };

  // Project / Group management helpers
  const addWorkGroup = () => {
    const clean = newGroupName.trim();
    if (!clean) return;
    if (projectNames.some((g) => g.toLowerCase() === clean.toLowerCase())) {
      toast.error("Project group already exists.");
      return;
    }
    setDB((d) => ({
      ...d,
      settings: {
        ...d.settings,
        workProjects: Array.from(new Set([...configuredGroups, clean])),
      },
    }));
    if (workDraft) {
      setWorkDraft({ ...workDraft, projectName: clean, company: clean });
    }
    setNewGroupName("");
    toast.success(`Added group "${clean}".`);
  };

  const commitRenameGroup = (oldName: string) => {
    const nextName = renameValue.trim();
    setRenamingGroup(null);
    if (!nextName || nextName === oldName) return;
    setDB((d) => {
      const base = d.settings.workProjects?.length
        ? d.settings.workProjects
        : [...DEFAULT_WORK_PROJECTS];
      const nextGroups = Array.from(
        new Set(base.map((g) => (g === oldName ? nextName : g))),
      );
      if (!nextGroups.includes(nextName)) nextGroups.push(nextName);
      return {
        ...d,
        settings: { ...d.settings, workProjects: nextGroups },
        workTasks: (d.workTasks ?? []).map((t) =>
          (t.projectName || t.company) === oldName
            ? { ...t, projectName: nextName, company: nextName }
            : t,
        ),
      };
    });
    if (workDraft && (workDraft.projectName || workDraft.company) === oldName) {
      setWorkDraft({ ...workDraft, projectName: nextName, company: nextName });
    }
    toast.success(`Renamed "${oldName}" to "${nextName}".`);
  };

  const deleteWorkGroup = (name: string) => {
    setDB((d) => {
      const base = d.settings.workProjects?.length
        ? d.settings.workProjects
        : [...DEFAULT_WORK_PROJECTS];
      const nextGroups = base.filter((g) => g !== name);
      return {
        ...d,
        settings: {
          ...d.settings,
          workProjects: nextGroups.length ? nextGroups : ["General"],
        },
      };
    });
    toast.message(`Removed group "${name}".`);
  };

  // Mobile calendar day cells + agenda data
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

  const mobileDayMarkers = useMemo(() => {
    const map = new Map<
      string,
      {
        work: number;
        studio: number;
        reminder: number;
        kh: boolean;
        sel: boolean;
        pop: boolean;
      }
    >();
    const touch = (date: string) => {
      let cur = map.get(date);
      if (!cur) {
        cur = {
          work: 0,
          studio: 0,
          reminder: 0,
          kh: false,
          sel: false,
          pop: false,
        };
        map.set(date, cur);
      }
      return cur;
    };

    for (const cellDate of mobileMonthCells) {
      if (sourceScope === "all" || sourceScope === "work") {
        for (const t of db.workTasks ?? []) {
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
      if (sourceScope === "all" || sourceScope === "studio") {
        for (const p of db.projects) {
          const s = p.start || p.due || p.delivered;
          const e =
            p.due && s && p.due >= s
              ? p.due
              : p.delivered && s && p.delivered >= s
                ? p.delivered
                : s;
          if (s && e && cellDate >= s && cellDate <= e) {
            touch(cellDate).studio += 1;
          }
        }
      }
    }

    if (sourceScope === "all" || sourceScope === "reminders") {
      for (const occ of reminderOccurrences) {
        touch(occ.date).reminder += 1;
      }
    }

    if (sourceScope !== "reminders") {
      for (const sp of specialDays) {
        const cur = touch(sp.date);
        if (sp.kind === "kh-public") cur.kh = true;
        else if (sp.kind === "sel") cur.sel = true;
        else cur.pop = true;
      }
    }

    return map;
  }, [
    mobileMonthCells,
    db.workTasks,
    db.projects,
    sourceScope,
    reminderOccurrences,
    specialDays,
  ]);

  const selectedAgenda = useMemo(() => {
    const d = selectedMobileDate;
    const work =
      sourceScope === "all" || sourceScope === "work"
        ? (db.workTasks ?? []).filter((t) => {
            const s = t.startDate || t.dueDate || t.completedDate;
            const e =
              t.dueDate && s && t.dueDate >= s
                ? t.dueDate
                : t.completedDate && s && t.completedDate >= s
                  ? t.completedDate
                  : s;
            return Boolean(s && e && d >= s && d <= e);
          })
        : [];
    const studio =
      sourceScope === "all" || sourceScope === "studio"
        ? db.projects.filter((p) => {
            const s = p.start || p.due || p.delivered;
            const e =
              p.due && s && p.due >= s
                ? p.due
                : p.delivered && s && p.delivered >= s
                  ? p.delivered
                  : s;
            return Boolean(s && e && d >= s && d <= e);
          })
        : [];
    const reminders =
      sourceScope === "all" || sourceScope === "reminders"
        ? reminderOccurrences.filter((o) => o.date === d).map((o) => o.reminder)
        : [];
    const specials =
      sourceScope !== "reminders"
        ? specialDays.filter((sp) => sp.date === d)
        : [];
    return { work, studio, reminders, specials };
  }, [
    selectedMobileDate,
    sourceScope,
    db.workTasks,
    db.projects,
    reminderOccurrences,
    specialDays,
  ]);

  const clientOpts = useMemo(
    () => db.clients.map((c) => ({ value: c.id, label: c.name })),
    [db.clients],
  );
  const serviceOpts = useMemo(
    () => db.services.map((s) => ({ value: s.id, label: s.name })),
    [db.services],
  );

  const isEditingWork = !createOpen && Boolean(workDraft);
  const isEditingProject = !createOpen && Boolean(projectDraft);
  const isEditingReminder = !createOpen && Boolean(reminderDraft);
  const drawerOpen =
    createOpen || isEditingWork || isEditingProject || isEditingReminder;

  const closeDrawer = () => {
    setCreateOpen(false);
    setWorkDraft(null);
    setProjectDraft(null);
    setReminderDraft(null);
    setManagingGroups(false);
    setRenamingGroup(null);
  };

  const drawerTitle = createOpen
    ? "Add to Calendar"
    : isEditingWork
      ? "Edit Work Task"
      : isEditingProject
        ? "Edit Studio Project"
        : "Edit Reminder";

  const drawerSubtitle = createOpen
    ? "Task, studio project, car ODO, or birthday reminder"
    : isEditingWork
      ? (workDraft?.code ?? "Work Task")
      : isEditingProject
        ? (projectDraft?.code ?? "Studio Project")
        : reminderDraft?.category === "car-odo"
          ? "Car ODO Maintenance"
          : "Calendar Reminder";

  const previewMediaFile = (mediaList: DesignMedia[], item: DesignMedia) => {
    setMediaPreview({
      item: {
        id: "cal-preview",
        code: drawerSubtitle,
        title: drawerTitle,
        subtitle: "",
        projectGroup: "",
        source: isEditingProject ? "studio" : "work",
        designType: "Attachment",
        artworkCount: mediaList.length,
        status: "Current",
        completed: false,
        featured: false,
        date: todayStr,
        notes: "",
        media: mediaList,
      },
      mediaId: item.id,
    });
  };

  return (
    <Glass className={cn("overflow-hidden", className)}>
      {/* Top Toolbar: Title, Source Tabs, View Switcher, Eye Toggle, Quick Add */}
      <div className="mb-3 flex flex-col gap-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-border bg-secondary text-primary">
              <CalendarDays className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <h2 className="truncate font-display text-base font-bold leading-tight sm:text-lg">
                Schedule
              </h2>
              <p className="truncate text-[0.7rem] text-muted-foreground">
                Work · Projects · Reminders
              </p>
            </div>
          </div>

          <div className="flex max-w-full flex-wrap items-center justify-end gap-1.5 sm:gap-2">
            <SlidingTabs
              size="xs"
              layoutGroup="dash-cal-scope"
              className="no-scrollbar max-w-full overflow-x-auto"
              value={sourceScope}
              onChange={setSourceScope}
              options={[
                { id: "all", label: "All", badge: counts.all },
                {
                  id: "work",
                  label: "Work",
                  icon: Layers3,
                  badge: counts.work,
                },
                {
                  id: "studio",
                  label: "Studio",
                  icon: Briefcase,
                  badge: counts.studio,
                },
                {
                  id: "reminders",
                  label: "Alerts",
                  icon: Bell,
                  badge: counts.reminders,
                },
              ]}
            />
            <SlidingTabs
              iconOnly
              size="xs"
              layoutGroup="dash-cal-view-mode"
              value={viewMode}
              onChange={(next) => {
                setViewMode(next);
                if (calendarCollapsed) setCalendarCollapsed(false);
              }}
              options={[
                { id: "calendar", label: "Calendar", icon: CalendarDays },
                { id: "board", label: "Board", icon: Columns3 },
              ]}
            />
            <button
              type="button"
              onClick={() => setCalendarCollapsed((v) => !v)}
              aria-label={
                calendarCollapsed ? "Show schedule view" : "Hide schedule view"
              }
              title={
                calendarCollapsed ? "Show schedule view" : "Hide schedule view"
              }
              className="inline-flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-lg border border-border bg-secondary text-muted-foreground transition-colors hover:border-primary/45 hover:text-foreground"
            >
              {calendarCollapsed ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </button>
            <Btn
              type="button"
              variant="gold"
              onClick={() =>
                openCreateOnRange(
                  selectedMobileDate || todayStr,
                  selectedMobileDate || todayStr,
                )
              }
              className="min-h-[34px] shrink-0 px-3 py-1 text-xs sm:min-h-[34px]"
            >
              <CalendarPlus className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden sm:inline">Add</span>
            </Btn>
          </div>
        </div>

        {/* Toggle Chips for KH Holidays, ថ្ងៃសីល, Popular, Reminders + Upcoming Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/55 pt-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => toggleHolidayKind("khHolidays")}
              aria-pressed={holidayToggles.khHolidays}
              title="Cambodia Public Holidays"
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
              title="Khmer Buddhist Offering Days (ថ្ងៃសីល)"
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
              title="International & Seasonal Popular Days"
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

            <button
              type="button"
              onClick={() => toggleHolidayKind("reminders")}
              aria-pressed={holidayToggles.reminders}
              title="Car ODO, Birthday & Special Day Reminders"
              className={cn(
                "inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[0.7rem] font-semibold transition-all active:scale-95",
                holidayToggles.reminders
                  ? "border-positive/50 bg-positive/20 text-positive"
                  : "border-border bg-secondary text-muted-foreground hover:text-foreground",
              )}
            >
              <Bell className="h-3 w-3 shrink-0" />
              <span>Reminders</span>
            </button>
          </div>

          {upcomingSpecials.length > 0 && (
            <div className="no-scrollbar flex max-w-full items-center gap-1.5 overflow-x-auto">
              {upcomingSpecials.map((sp) => (
                <button
                  key={sp.id}
                  type="button"
                  onClick={() => setSelectedSpecial(sp)}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border bg-secondary px-2.5 py-1 text-[0.68rem] text-muted-foreground transition-colors hover:border-primary/45 hover:text-foreground"
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      sp.kind === "kh-public"
                        ? "bg-rose-400"
                        : sp.kind === "sel"
                          ? "bg-primary"
                          : "bg-sky-400",
                    )}
                  />
                  <span className="font-num font-medium text-foreground/90">
                    {shortDate(sp.date)}
                  </span>
                  <span className="max-w-[130px] truncate">{sp.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pre-Event Popup Alert Banner (Car ODO, Kid Birthdays, Special Days) */}
      {dueAlerts.length > 0 && (
        <div className="mb-3 space-y-2">
          {dueAlerts.map((alert) => {
            const Icon = reminderCategoryIcon(alert.reminder.category);
            const timingLabel =
              alert.daysUntil === 0
                ? "Today"
                : alert.daysUntil === 1
                  ? "Tomorrow"
                  : `In ${alert.daysUntil} days`;
            const odoLabel =
              alert.reminder.category === "car-odo"
                ? formatOdoKm(alert.reminder.odoKm)
                : "";
            return (
              <div
                key={`${alert.reminder.id}:${alert.occurrenceDate}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-emerald-500/45 bg-emerald-500/12 px-3 py-2 text-xs"
              >
                <div className="flex min-w-0 flex-1 items-center gap-2.5">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-emerald-500/40 bg-emerald-500/20 text-emerald-300 light:text-emerald-800">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="truncate font-semibold text-foreground">
                        {alert.reminder.title || "Reminder"}
                      </span>
                      <span className="font-num rounded-full bg-emerald-500/25 px-2 py-0.5 text-[0.65rem] font-bold text-emerald-200 light:text-emerald-900">
                        {timingLabel}
                      </span>
                      {odoLabel && (
                        <span className="font-num rounded-full border border-primary/40 bg-primary/15 px-2 py-0.5 text-[0.65rem] font-semibold text-primary">
                          ODO {odoLabel}
                        </span>
                      )}
                    </div>
                    <p className="truncate text-[0.7rem] text-muted-foreground">
                      {shortDate(alert.occurrenceDate)}
                      {alert.reminder.notes ? ` · ${alert.reminder.notes}` : ""}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => openEditReminder(alert.reminder)}
                    className="rounded-full border border-border bg-card/80 px-2.5 py-1 text-[0.68rem] font-semibold text-foreground transition-colors hover:border-primary/60"
                  >
                    {alert.reminder.category === "car-odo"
                      ? "Update ODO"
                      : "Edit"}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      dismissReminderAlert(alert.reminder, alert.occurrenceDate)
                    }
                    aria-label={`Dismiss ${alert.reminder.title}`}
                    className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Special Day Banner */}
      {selectedSpecial && (
        <div className="mb-3 flex items-center justify-between gap-2 rounded-2xl border border-primary/35 bg-primary/10 px-3 py-2 text-xs">
          <div className="min-w-0">
            <p className="truncate font-semibold text-foreground">
              {selectedSpecial.khTitle
                ? `${selectedSpecial.khTitle} · ${selectedSpecial.title}`
                : selectedSpecial.title}
            </p>
            <p className="truncate text-[0.72rem] text-muted-foreground">
              <span className="font-num font-medium text-primary">
                {shortDate(selectedSpecial.date)}
              </span>
              {selectedSpecial.detail ? ` — ${selectedSpecial.detail}` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSelectedSpecial(null)}
            aria-label="Dismiss holiday notice"
            className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {calendarCollapsed ? (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/35 px-3 py-2.5 text-xs text-muted-foreground">
          <span>
            Schedule view is hidden ({counts.work} work · {counts.studio} studio
            · {counts.reminders} alerts)
          </span>
          <button
            type="button"
            onClick={() => setCalendarCollapsed(false)}
            className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
          >
            <Eye className="h-3.5 w-3.5" />
            Show
          </button>
        </div>
      ) : viewMode === "board" ? (
        <div className="space-y-4">
          {(sourceScope === "all" || sourceScope === "work") && (
            <div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-muted-foreground">
                  Work pipeline ({(db.workTasks ?? []).length})
                </p>
                <button
                  type="button"
                  onClick={() => openCreateOnRange(todayStr, todayStr, "work")}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  <Plus className="h-3 w-3" /> Add task
                </button>
              </div>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {WORK_PIPELINE_STAGES.map((stage) => {
                  const stageTasks = (db.workTasks ?? []).filter(
                    (t) => normalizeWorkStage(t.status) === stage,
                  );
                  return (
                    <div
                      key={stage}
                      className="flex min-h-[150px] flex-col rounded-xl border border-border bg-muted/30 p-2.5"
                    >
                      <div className="mb-2 flex items-center justify-between gap-1.5 border-b border-border/60 pb-1.5">
                        <span className="truncate text-xs font-semibold text-foreground">
                          {stage}
                        </span>
                        <span className="font-num rounded-md bg-secondary px-1.5 py-0.5 text-[0.65rem] text-muted-foreground">
                          {stageTasks.length}
                        </span>
                      </div>
                      <div className="flex flex-1 flex-col gap-1.5">
                        {stageTasks.length === 0 ? (
                          <p className="py-4 text-center text-[0.68rem] text-muted-foreground/75">
                            Empty
                          </p>
                        ) : (
                          stageTasks.map((task) => {
                            const proj = workTaskProjectName(task);
                            const meta = workProjectMeta(proj);
                            const ProjIcon = meta.icon;
                            const isDone = stage === "Completed";
                            const nextStage = nextWorkStage(task);
                            return (
                              <div
                                key={task.id}
                                className="rounded-lg border border-border bg-card p-2 transition-colors hover:border-primary/45"
                              >
                                <button
                                  type="button"
                                  onClick={() => openEditWorkTask(task)}
                                  className="w-full text-left"
                                >
                                  <div className="flex items-center gap-1.5 text-[0.65rem] text-muted-foreground">
                                    <ProjIcon
                                      className="h-3 w-3 shrink-0"
                                      style={{ color: meta.accent.dot }}
                                    />
                                    <span className="font-num font-semibold text-foreground/85">
                                      {meta.shortCode}
                                    </span>
                                    {task.conceptOnly && (
                                      <span className="rounded bg-primary/15 px-1 text-[0.6rem] text-primary">
                                        Concept
                                      </span>
                                    )}
                                  </div>
                                  <p className="mt-0.5 line-clamp-2 text-xs font-semibold text-foreground">
                                    {task.title || task.code}
                                  </p>
                                </button>
                                <div className="mt-1.5 flex items-center justify-between gap-1 border-t border-border/50 pt-1.5">
                                  <span className="font-num text-[0.64rem] text-muted-foreground">
                                    {task.dueDate
                                      ? shortDate(task.dueDate)
                                      : "No date"}
                                  </span>
                                  {!isDone ? (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        quickAdvanceWorkStage(task)
                                      }
                                      title={`Advance to ${nextStage}`}
                                      className="inline-flex items-center gap-0.5 rounded-md border border-primary/35 bg-primary/12 px-1.5 py-0.5 text-[0.64rem] font-semibold text-primary hover:bg-primary hover:text-primary-foreground"
                                    >
                                      <span>{nextStage}</span>
                                      <ArrowRight className="h-2.5 w-2.5" />
                                    </button>
                                  ) : (
                                    <span className="inline-flex items-center gap-0.5 text-[0.64rem] font-medium text-positive">
                                      <CheckCircle2 className="h-3 w-3" />
                                      Done
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {(sourceScope === "all" || sourceScope === "studio") && (
            <div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-muted-foreground">
                  Studio projects ({db.projects.length})
                </p>
                <button
                  type="button"
                  onClick={() =>
                    openCreateOnRange(todayStr, todayStr, "studio")
                  }
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  <Plus className="h-3 w-3" /> Add project
                </button>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {db.projects.slice(0, 8).map((proj) => {
                  const done =
                    proj.status === "Delivered" || proj.status === "Closed";
                  const clientName =
                    db.clients.find((c) => c.id === proj.clientId)?.name ??
                    "Studio";
                  return (
                    <div
                      key={proj.id}
                      className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card p-2.5"
                    >
                      <button
                        type="button"
                        onClick={() => openEditProject(proj)}
                        className="min-w-0 flex-1 text-left"
                      >
                        <p className="truncate text-xs font-semibold text-foreground">
                          {proj.name || proj.code}
                        </p>
                        <p className="truncate text-[0.68rem] text-muted-foreground">
                          {clientName} ·{" "}
                          {proj.due ? shortDate(proj.due) : "No due date"}
                        </p>
                      </button>
                      <button
                        type="button"
                        onClick={() => quickToggleProjectDone(proj)}
                        className="shrink-0"
                        title={done ? "Reopen project" : "Mark Delivered"}
                      >
                        <Pill s={proj.status} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {(sourceScope === "all" || sourceScope === "reminders") &&
            remindersList.length > 0 && (
              <div>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Reminders &amp; alerts ({remindersList.length})
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      openCreateOnRange(todayStr, todayStr, "reminder")
                    }
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    <Plus className="h-3 w-3" /> Add reminder
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {remindersList.map((rm) => {
                    const Icon = reminderCategoryIcon(rm.category);
                    const odoText =
                      rm.category === "car-odo" ? formatOdoKm(rm.odoKm) : "";
                    return (
                      <button
                        key={rm.id}
                        type="button"
                        onClick={() => openEditReminder(rm)}
                        className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card p-2.5 text-left transition-colors hover:border-primary/45"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <Icon className="h-4 w-4 shrink-0 text-positive" />
                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-foreground">
                              {rm.title}
                            </p>
                            <p className="font-num truncate text-[0.68rem] text-muted-foreground">
                              {shortDate(rm.date)}
                              {odoText ? ` · ODO ${odoText}` : ""}
                            </p>
                          </div>
                        </div>
                        <span className="font-num shrink-0 text-[0.66rem] text-muted-foreground">
                          {rm.notifyDaysBefore === 0
                            ? "Same day"
                            : `${rm.notifyDaysBefore}d prior`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
        </div>
      ) : !isDesktopMd ? (
        /* Mobile Responsive Touch Calendar + Selected Day Agenda (< 768px) */
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

          <div className="overflow-hidden rounded-xl border border-border bg-muted/20">
            <div className="grid grid-cols-7 border-b border-border bg-muted/35 py-2 text-center text-[0.64rem] font-semibold uppercase tracking-wider text-muted-foreground">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((wd) => (
                <span key={wd}>{wd}</span>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {mobileMonthCells.map((cellDate) => {
                const inMonth = cellDate.startsWith(mobileMonth);
                const isToday = cellDate === todayStr;
                const isSelected = cellDate === selectedMobileDate;
                const marks = mobileDayMarkers.get(cellDate);
                return (
                  <button
                    key={cellDate}
                    type="button"
                    onClick={() => setSelectedMobileDate(cellDate)}
                    className={cn(
                      "relative flex min-h-[46px] flex-col items-center justify-between border-b border-r border-border/45 px-1 py-1.5 transition-colors",
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
                      {marks && marks.studio > 0 && (
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                      )}
                      {marks && marks.reminder > 0 && (
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
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

          {/* Selected Day Mobile Agenda */}
          <div className="rounded-xl border border-border bg-muted/25 p-3">
            <div className="mb-2.5 flex items-center justify-between gap-2">
              <div>
                <p className="font-num text-xs font-bold text-foreground">
                  {shortDate(selectedMobileDate)}
                  {selectedMobileDate === todayStr ? " · Today" : ""}
                </p>
                <p className="text-[0.68rem] text-muted-foreground">
                  {selectedAgenda.work.length +
                    selectedAgenda.studio.length +
                    selectedAgenda.reminders.length +
                    selectedAgenda.specials.length}{" "}
                  item(s) on this date
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    openCreateOnRange(
                      selectedMobileDate,
                      selectedMobileDate,
                      "reminder",
                    )
                  }
                  className="inline-flex min-h-[34px] items-center gap-1 rounded-lg border border-positive/40 bg-positive/15 px-2.5 text-[0.7rem] font-semibold text-positive"
                >
                  <Bell className="h-3 w-3" />
                  <span>+ Alert</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    openCreateOnRange(selectedMobileDate, selectedMobileDate)
                  }
                  className="inline-flex min-h-[34px] items-center gap-1 rounded-lg bg-primary px-3 text-[0.7rem] font-semibold text-primary-foreground"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {selectedAgenda.specials.length === 0 &&
            selectedAgenda.reminders.length === 0 &&
            selectedAgenda.work.length === 0 &&
            selectedAgenda.studio.length === 0 ? (
              <p className="py-3 text-center text-xs text-muted-foreground">
                Free day — tap + Add or + Alert to schedule.
              </p>
            ) : (
              <div className="space-y-1.5">
                {selectedAgenda.specials.map((sp) => (
                  <div
                    key={sp.id}
                    className={cn(
                      "flex items-center justify-between gap-2 rounded-lg border px-2.5 py-2 text-xs",
                      sp.kind === "kh-public"
                        ? "border-rose-500/45 bg-rose-500/15 text-rose-100 light:text-rose-900"
                        : sp.kind === "sel"
                          ? "border-primary/45 bg-primary/15 text-foreground"
                          : "border-sky-500/45 bg-sky-500/15 text-sky-100 light:text-sky-900",
                    )}
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold">
                        {sp.khTitle ? `${sp.khTitle} · ${sp.title}` : sp.title}
                      </p>
                      {sp.detail && (
                        <p className="truncate text-[0.68rem] opacity-80">
                          {sp.detail}
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                {selectedAgenda.reminders.map((rm) => {
                  const Icon = reminderCategoryIcon(rm.category);
                  const odoText =
                    rm.category === "car-odo" ? formatOdoKm(rm.odoKm) : "";
                  return (
                    <button
                      key={rm.id}
                      type="button"
                      onClick={() => openEditReminder(rm)}
                      className="flex w-full items-center justify-between gap-2 rounded-lg border border-positive/40 bg-positive/12 px-2.5 py-2 text-left text-xs text-foreground"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <Icon className="h-3.5 w-3.5 shrink-0 text-positive" />
                        <div className="min-w-0">
                          <p className="truncate font-semibold">{rm.title}</p>
                          {rm.notes && (
                            <p className="truncate text-[0.68rem] opacity-80">
                              {rm.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      {odoText && (
                        <span className="font-num shrink-0 rounded-md bg-positive/20 px-2 py-0.5 text-[0.65rem] font-bold text-positive">
                          {odoText}
                        </span>
                      )}
                    </button>
                  );
                })}

                {selectedAgenda.work.map((task) => {
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
                        onClick={() => quickToggleWorkDone(task)}
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
                        onClick={() => openEditWorkTask(task)}
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

                {selectedAgenda.studio.map((proj) => {
                  const done =
                    proj.status === "Delivered" || proj.status === "Closed";
                  return (
                    <div
                      key={proj.id}
                      className="flex items-center gap-2 rounded-lg border border-primary/35 bg-primary/10 px-2.5 py-2 text-xs"
                    >
                      <button
                        type="button"
                        onClick={() => quickToggleProjectDone(proj)}
                        aria-label={
                          done ? `Reopen ${proj.name}` : `Complete ${proj.name}`
                        }
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg hover:bg-accent"
                      >
                        {done ? (
                          <CheckCircle2 className="h-4 w-4 text-positive" />
                        ) : (
                          <Circle className="h-4 w-4 text-primary" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditProject(proj)}
                        className="min-w-0 flex-1 text-left"
                      >
                        <p
                          className={cn(
                            "truncate font-semibold text-foreground",
                            done && "line-through opacity-65",
                          )}
                        >
                          {proj.name}
                        </p>
                        <p className="truncate text-[0.68rem] text-muted-foreground">
                          Studio · {proj.status}
                        </p>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Desktop Interactive FullCalendar (>= 768px) */
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
            dayMaxEvents={3}
            events={events}
            datesSet={handleDatesSet}
            dateClick={handleDateClick}
            select={handleSelect}
            eventClick={handleEventClick}
            eventDrop={handleEventDrop}
            eventResize={handleEventResize}
          />
        </div>
      )}

      {/* Create / Edit Work Task, Studio Project, or Reminder Drawer */}
      <SlideDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        title={drawerTitle}
        subtitle={drawerSubtitle}
        widthClass="max-w-lg"
      >
        {createOpen && (
          <div className="mb-4">
            <SlidingTabs
              size="xs"
              layoutGroup="cal-create-kind"
              className="no-scrollbar max-w-full overflow-x-auto"
              value={createKind}
              onChange={setCreateKind}
              options={[
                { id: "work", label: "Work Task", icon: Layers3 },
                { id: "studio", label: "Project", icon: Briefcase },
                { id: "reminder", label: "Reminder", icon: Bell },
              ]}
            />
          </div>
        )}

        {/* WORK TASK FORM */}
        {(isEditingWork || (createOpen && createKind === "work")) &&
          workDraft && (
            <form
              className="grid grid-cols-2 gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (!workDraft.title.trim()) {
                  toast.error("Enter a task title.");
                  return;
                }
                const proj =
                  (workDraft.projectName || workDraft.company).trim() ||
                  "General";
                const stage = normalizeWorkStage(workDraft.status);
                const cleaned: WorkTask = {
                  ...workDraft,
                  status: stage,
                  projectName: proj,
                  company: proj,
                  artworkCount: Math.max(
                    1,
                    Number(workDraft.artworkCount) || 1,
                  ),
                  completedDate:
                    stage === "Completed"
                      ? workDraft.completedDate ||
                        workDraft.dueDate ||
                        workDraft.startDate ||
                        todayStr
                      : workDraft.completedDate,
                };
                setDB((d) => ({
                  ...d,
                  workTasks: upsert(d.workTasks ?? [], cleaned),
                }));
                toast.success(`Saved "${cleaned.title}" to calendar.`);
                closeDrawer();
              }}
            >
              {/* 1-tap pipeline stage + concept-only toggle */}
              <div className="col-span-2 space-y-2 rounded-xl border border-border bg-muted/35 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="label-mono">Pipeline stage (1-tap)</span>
                  <button
                    type="button"
                    onClick={() =>
                      setWorkDraft({
                        ...workDraft,
                        conceptOnly: !workDraft.conceptOnly,
                      })
                    }
                    className={cn(
                      "inline-flex min-h-[30px] items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[0.7rem] font-semibold transition-colors",
                      workDraft.conceptOnly
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-border bg-secondary text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Check
                      className={cn(
                        "h-3 w-3",
                        workDraft.conceptOnly ? "opacity-100" : "opacity-35",
                      )}
                    />
                    <span>Concept only (skip production)</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {WORK_PIPELINE_STAGES.map((st) => {
                    const active = normalizeWorkStage(workDraft.status) === st;
                    const skipped =
                      Boolean(workDraft.conceptOnly) && st === "Production";
                    return (
                      <button
                        key={st}
                        type="button"
                        disabled={skipped}
                        onClick={() =>
                          setWorkDraft({
                            ...workDraft,
                            status: st,
                            completedDate:
                              st === "Completed"
                                ? workDraft.completedDate || todayStr
                                : workDraft.completedDate,
                          })
                        }
                        className={cn(
                          "inline-flex min-h-[34px] items-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold transition-all active:scale-95",
                          active
                            ? st === "Completed"
                              ? "border-positive/60 bg-positive/20 text-positive"
                              : "border-primary bg-primary text-primary-foreground"
                            : skipped
                              ? "cursor-not-allowed border-border/50 bg-muted/30 text-muted-foreground/45 line-through"
                              : "border-border bg-secondary text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {st === "Completed" && (
                          <Check className="h-3.5 w-3.5" />
                        )}
                        <span>{st}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <F label="Task title" className="col-span-2">
                <input
                  className="field"
                  placeholder="e.g. Connexion Promo Banner"
                  value={workDraft.title}
                  onChange={(e) =>
                    setWorkDraft({ ...workDraft, title: e.target.value })
                  }
                  required
                />
              </F>

              {/* Project / Group with inline Add / Rename / Delete Editor */}
              <div className="col-span-2 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="label-mono">Project / Group</span>
                  <button
                    type="button"
                    onClick={() => {
                      setManagingGroups((v) => !v);
                      setRenamingGroup(null);
                    }}
                    className="inline-flex items-center gap-1 rounded-md border border-border bg-secondary px-2.5 py-0.5 text-[0.68rem] font-medium text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  >
                    {managingGroups ? (
                      <>
                        <Check className="h-3 w-3 text-positive" />
                        <span>Done</span>
                      </>
                    ) : (
                      <>
                        <Pencil className="h-3 w-3" />
                        <span>Edit groups</span>
                      </>
                    )}
                  </button>
                </div>

                {!managingGroups ? (
                  <>
                    <div className="flex flex-wrap gap-1.5">
                      {projectNames.map((name) => {
                        const active =
                          (workDraft.projectName || workDraft.company) === name;
                        const meta = workProjectMeta(name);
                        const ProjIcon = meta.icon;
                        return (
                          <button
                            key={name}
                            type="button"
                            onClick={() =>
                              setWorkDraft({
                                ...workDraft,
                                projectName: name,
                                company: name,
                              })
                            }
                            className={cn(
                              "inline-flex min-h-[34px] items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors",
                              active
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-secondary text-muted-foreground hover:text-foreground",
                            )}
                          >
                            <ProjIcon className="h-3.5 w-3.5 shrink-0" />
                            <span>{name}</span>
                          </button>
                        );
                      })}
                    </div>
                    <input
                      className="field text-xs"
                      placeholder="Or type custom project name…"
                      value={workDraft.projectName ?? ""}
                      onChange={(e) =>
                        setWorkDraft({
                          ...workDraft,
                          projectName: e.target.value,
                          company: e.target.value,
                        })
                      }
                    />
                  </>
                ) : (
                  <div className="space-y-2 rounded-2xl border border-border bg-muted/30 p-3">
                    <div className="flex gap-1.5">
                      <input
                        className="field py-1.5 text-xs"
                        placeholder="New project group (e.g. Personal, Client X)…"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addWorkGroup();
                          }
                        }}
                      />
                      <Btn
                        type="button"
                        variant="gold"
                        onClick={addWorkGroup}
                        className="shrink-0 px-3 py-1 text-xs"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add
                      </Btn>
                    </div>
                    <div className="space-y-1">
                      {configuredGroups.map((grp) => (
                        <div
                          key={grp}
                          className="flex items-center justify-between gap-2 rounded-xl border border-border/60 bg-card/60 px-2.5 py-1.5 text-xs"
                        >
                          {renamingGroup === grp ? (
                            <div className="flex flex-1 items-center gap-1.5">
                              <input
                                className="field py-1 text-xs"
                                value={renameValue}
                                onChange={(e) => setRenameValue(e.target.value)}
                                autoFocus
                              />
                              <button
                                type="button"
                                onClick={() => commitRenameGroup(grp)}
                                className="rounded-lg bg-primary px-2 py-1 text-[0.7rem] font-semibold text-primary-foreground"
                              >
                                Save
                              </button>
                            </div>
                          ) : (
                            <>
                              <span className="truncate font-medium text-foreground">
                                {grp}
                              </span>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  aria-label={`Rename ${grp}`}
                                  onClick={() => {
                                    setRenamingGroup(grp);
                                    setRenameValue(grp);
                                  }}
                                  className="rounded-lg p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                                >
                                  <Pencil className="h-3 w-3" />
                                </button>
                                <button
                                  type="button"
                                  aria-label={`Delete ${grp}`}
                                  onClick={() => deleteWorkGroup(grp)}
                                  className="rounded-lg p-1 text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <F label="Design discipline" className="col-span-2 sm:col-span-1">
                <Sel
                  value={workDraft.designType}
                  onChange={(v) =>
                    setWorkDraft({ ...workDraft, designType: v })
                  }
                  options={[...DESIGN_TYPES]}
                />
              </F>

              <F label="Artworks" className="col-span-2 sm:col-span-1">
                <input
                  type="number"
                  min={1}
                  className="field font-num"
                  value={workDraft.artworkCount}
                  onChange={(e) =>
                    setWorkDraft({
                      ...workDraft,
                      artworkCount: Math.max(1, Number(e.target.value) || 1),
                    })
                  }
                />
              </F>

              <F label="Start date" className="col-span-1">
                <input
                  type="date"
                  className="field font-num"
                  value={workDraft.startDate ?? ""}
                  onChange={(e) =>
                    setWorkDraft({
                      ...workDraft,
                      startDate: e.target.value,
                      dueDate:
                        workDraft.dueDate && workDraft.dueDate < e.target.value
                          ? e.target.value
                          : workDraft.dueDate,
                    })
                  }
                />
              </F>

              <F label="Due date" className="col-span-1">
                <input
                  type="date"
                  className="field font-num"
                  value={workDraft.dueDate}
                  onChange={(e) =>
                    setWorkDraft({ ...workDraft, dueDate: e.target.value })
                  }
                />
              </F>

              <F label="Notes & brief" className="col-span-2">
                <textarea
                  rows={2}
                  className="field"
                  placeholder="Optional brief or deliverable details…"
                  value={workDraft.notes}
                  onChange={(e) =>
                    setWorkDraft({ ...workDraft, notes: e.target.value })
                  }
                />
              </F>

              <div className="col-span-2">
                <p className="label-mono mb-1.5">
                  Brief files (Image / PDF / AI / CAD or Ctrl+V)
                </p>
                <DesignMediaUploader
                  compact
                  media={workDraft.media ?? []}
                  onChange={(media) => setWorkDraft({ ...workDraft, media })}
                  onPreview={(m) => previewMediaFile(workDraft.media ?? [], m)}
                />
              </div>

              <div className="col-span-2 mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-border/70 pt-3">
                <div className="flex items-center gap-1.5">
                  {isEditingWork && (
                    <Btn
                      type="button"
                      variant="danger"
                      onClick={() => {
                        setDB((d) => ({
                          ...d,
                          workTasks: (d.workTasks ?? []).filter(
                            (x) => x.id !== workDraft.id,
                          ),
                        }));
                        toast.message("Work task deleted.");
                        closeDrawer();
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </Btn>
                  )}
                  {isEditingWork && workDraft.status !== "Completed" && (
                    <Btn
                      type="button"
                      onClick={() => {
                        quickToggleWorkDone(workDraft);
                        closeDrawer();
                      }}
                      className="border-positive/40 bg-positive/15 text-positive hover:bg-positive/25"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Mark Done
                    </Btn>
                  )}
                </div>
                <div className="flex gap-2">
                  <Btn type="button" onClick={closeDrawer}>
                    Cancel
                  </Btn>
                  <Btn type="submit" variant="gold">
                    Save task
                  </Btn>
                </div>
              </div>
            </form>
          )}

        {/* STUDIO PROJECT FORM */}
        {(isEditingProject || (createOpen && createKind === "studio")) &&
          projectDraft && (
            <form
              className="grid grid-cols-2 gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (!projectDraft.name.trim()) {
                  toast.error("Enter a project name.");
                  return;
                }
                if (
                  projectDraft.start &&
                  projectDraft.due &&
                  projectDraft.due < projectDraft.start
                ) {
                  toast.error("Due date cannot be before start date.");
                  return;
                }
                setDB((d) =>
                  updateProject(d, {
                    ...projectDraft,
                    quote: Number(projectDraft.quote) || 0,
                  }),
                );
                toast.success(`Saved project "${projectDraft.name}".`);
                closeDrawer();
              }}
            >
              <div className="col-span-2">
                <p className="label-mono mb-1.5">Quick status (1-tap)</p>
                <div className="flex flex-wrap gap-1.5">
                  {["In production", "Delivered", "Closed", "Quoted"].map(
                    (st) => {
                      const active = projectDraft.status === st;
                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() =>
                            setProjectDraft({
                              ...projectDraft,
                              status: st,
                              delivered:
                                st === "Delivered" || st === "Closed"
                                  ? projectDraft.delivered || todayStr
                                  : projectDraft.delivered,
                            })
                          }
                          className={cn(
                            "inline-flex min-h-[34px] items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-all active:scale-95",
                            active
                              ? st === "Delivered" || st === "Closed"
                                ? "border-positive/60 bg-positive/20 text-positive"
                                : "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-secondary text-muted-foreground hover:text-foreground",
                          )}
                        >
                          {(st === "Delivered" || st === "Closed") && (
                            <Check className="h-3.5 w-3.5" />
                          )}
                          <span>{st}</span>
                        </button>
                      );
                    },
                  )}
                </div>
              </div>

              <F label="Project name" className="col-span-2">
                <input
                  className="field"
                  placeholder="e.g. Brand Identity System"
                  value={projectDraft.name}
                  onChange={(e) =>
                    setProjectDraft({ ...projectDraft, name: e.target.value })
                  }
                  required
                />
              </F>

              <F label="Client" className="col-span-2 sm:col-span-1">
                <Sel
                  value={projectDraft.clientId}
                  onChange={(v) =>
                    setProjectDraft({ ...projectDraft, clientId: v })
                  }
                  options={clientOpts}
                  placeholder="Select client…"
                />
              </F>

              <F label="Service" className="col-span-2 sm:col-span-1">
                <Sel
                  value={projectDraft.serviceId}
                  onChange={(v) => {
                    const svc = db.services.find((s) => s.id === v);
                    setProjectDraft({
                      ...projectDraft,
                      serviceId: v,
                      quote:
                        projectDraft.quote > 0
                          ? projectDraft.quote
                          : (svc?.rate ?? 0),
                    });
                  }}
                  options={serviceOpts}
                  placeholder="Select service…"
                />
              </F>

              <F label="All statuses" className="col-span-1">
                <Sel
                  value={projectDraft.status}
                  onChange={(v) =>
                    setProjectDraft({ ...projectDraft, status: v })
                  }
                  options={[...PROJECT_STATUSES]}
                />
              </F>

              <F label="Quote (USD)" className="col-span-1">
                <input
                  type="number"
                  min={0}
                  step="any"
                  className="field font-num"
                  value={projectDraft.quote}
                  onChange={(e) =>
                    setProjectDraft({
                      ...projectDraft,
                      quote: Number(e.target.value) || 0,
                    })
                  }
                />
              </F>

              <F label="Start date" className="col-span-1">
                <input
                  type="date"
                  className="field font-num"
                  value={projectDraft.start}
                  onChange={(e) =>
                    setProjectDraft({
                      ...projectDraft,
                      start: e.target.value,
                      due:
                        projectDraft.due && projectDraft.due < e.target.value
                          ? e.target.value
                          : projectDraft.due,
                    })
                  }
                />
              </F>

              <F label="Due date" className="col-span-1">
                <input
                  type="date"
                  className="field font-num"
                  value={projectDraft.due}
                  onChange={(e) =>
                    setProjectDraft({ ...projectDraft, due: e.target.value })
                  }
                />
              </F>

              <div className="col-span-2">
                <p className="label-mono mb-1.5">
                  Brief image / PDF attachments
                </p>
                <DesignMediaUploader
                  compact
                  media={projectDraft.media ?? []}
                  onChange={(media) =>
                    setProjectDraft({ ...projectDraft, media })
                  }
                  onPreview={(m) =>
                    previewMediaFile(projectDraft.media ?? [], m)
                  }
                />
              </div>

              <div className="col-span-2 mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-border/70 pt-3">
                <div className="flex items-center gap-1.5">
                  {isEditingProject && (
                    <Btn
                      type="button"
                      variant="danger"
                      onClick={() => {
                        setDB((d) => ({
                          ...d,
                          projects: d.projects.filter(
                            (x) => x.id !== projectDraft.id,
                          ),
                        }));
                        toast.message("Studio project removed.");
                        closeDrawer();
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </Btn>
                  )}
                  {isEditingProject &&
                    projectDraft.status !== "Delivered" &&
                    projectDraft.status !== "Closed" && (
                      <Btn
                        type="button"
                        onClick={() => {
                          quickToggleProjectDone(projectDraft);
                          closeDrawer();
                        }}
                        className="border-positive/40 bg-positive/15 text-positive hover:bg-positive/25"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Delivered
                      </Btn>
                    )}
                </div>
                <div className="flex gap-2">
                  <Btn type="button" onClick={closeDrawer}>
                    Cancel
                  </Btn>
                  <Btn type="submit" variant="gold">
                    Save project
                  </Btn>
                </div>
              </div>
            </form>
          )}

        {/* REMINDER / CAR ODO / BIRTHDAY FORM */}
        {(isEditingReminder || (createOpen && createKind === "reminder")) &&
          reminderDraft && (
            <form
              className="grid grid-cols-2 gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (!reminderDraft.title.trim()) {
                  toast.error("Enter a reminder title.");
                  return;
                }
                const cleaned: CalendarReminder = {
                  ...reminderDraft,
                  title: reminderDraft.title.trim(),
                  dismissedForDate: "",
                  ...(reminderDraft.category === "car-odo" &&
                  reminderDraft.odoKm
                    ? { odoKm: Math.max(0, Number(reminderDraft.odoKm) || 0) }
                    : {}),
                };
                if (cleaned.category !== "car-odo") {
                  delete cleaned.odoKm;
                }
                setDB((d) => ({
                  ...d,
                  reminders: upsert(d.reminders ?? [], cleaned),
                }));
                toast.success(
                  `Saved reminder "${cleaned.title}" (${shortDate(cleaned.date)}).`,
                );
                closeDrawer();
              }}
            >
              <div className="col-span-2">
                <p className="label-mono mb-1.5">Reminder category</p>
                <div className="flex flex-wrap gap-1.5">
                  {REMINDER_CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const active = reminderDraft.category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() =>
                          setReminderDraft({
                            ...reminderDraft,
                            category: cat.id,
                            repeatYearly:
                              cat.id === "birthday"
                                ? true
                                : Boolean(reminderDraft.repeatYearly),
                          })
                        }
                        className={cn(
                          "inline-flex min-h-[34px] items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-all active:scale-95",
                          active
                            ? "border-positive/60 bg-positive/20 text-positive"
                            : "border-border bg-secondary text-muted-foreground hover:text-foreground",
                        )}
                      >
                        <Icon className="h-3.5 w-3.5 shrink-0" />
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <F label="Title" className="col-span-2">
                <input
                  className="field"
                  placeholder={
                    reminderDraft.category === "car-odo"
                      ? "e.g. Prius 2012 Engine Oil & Filter"
                      : reminderDraft.category === "birthday"
                        ? "e.g. Kid's Birthday"
                        : "e.g. Road Tax / Insurance Renewal"
                  }
                  value={reminderDraft.title}
                  onChange={(e) =>
                    setReminderDraft({
                      ...reminderDraft,
                      title: e.target.value,
                    })
                  }
                  required
                />
              </F>

              <F label="Event date" className="col-span-1">
                <input
                  type="date"
                  className="field font-num"
                  value={reminderDraft.date}
                  onChange={(e) =>
                    setReminderDraft({ ...reminderDraft, date: e.target.value })
                  }
                  required
                />
              </F>

              {reminderDraft.category === "car-odo" ? (
                <F label="Car ODO (km)" className="col-span-1">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={0}
                      step={100}
                      className="field font-num"
                      placeholder="142500"
                      value={reminderDraft.odoKm ?? ""}
                      onChange={(e) => {
                        const raw = e.target.value;
                        if (!raw) {
                          const { odoKm: _drop, ...rest } = reminderDraft;
                          setReminderDraft(rest);
                        } else {
                          setReminderDraft({
                            ...reminderDraft,
                            odoKm: Number(raw),
                          });
                        }
                      }}
                    />
                    <button
                      type="button"
                      title="Add 5,000 km for next service"
                      onClick={() =>
                        setReminderDraft({
                          ...reminderDraft,
                          odoKm: (reminderDraft.odoKm ?? 0) + 5000,
                        })
                      }
                      className="font-num shrink-0 rounded-lg border border-border bg-secondary px-2 py-2 text-[0.7rem] font-semibold text-primary hover:border-primary/50"
                    >
                      +5k
                    </button>
                  </div>
                </F>
              ) : (
                <div className="col-span-1 flex items-end pb-1">
                  <button
                    type="button"
                    onClick={() =>
                      setReminderDraft({
                        ...reminderDraft,
                        repeatYearly: !reminderDraft.repeatYearly,
                      })
                    }
                    className={cn(
                      "inline-flex min-h-[38px] w-full items-center justify-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-colors",
                      reminderDraft.repeatYearly
                        ? "border-primary/60 bg-primary/15 text-primary"
                        : "border-border bg-secondary text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Repeat className="h-3.5 w-3.5" />
                    <span>
                      {reminderDraft.repeatYearly
                        ? "Repeats yearly"
                        : "One-time"}
                    </span>
                  </button>
                </div>
              )}

              <div className="col-span-2">
                <p className="label-mono mb-1.5">Popup alert before event</p>
                <div className="flex flex-wrap gap-1.5">
                  {NOTIFY_DAY_OPTIONS.map((days) => {
                    const active = reminderDraft.notifyDaysBefore === days;
                    return (
                      <button
                        key={days}
                        type="button"
                        onClick={() =>
                          setReminderDraft({
                            ...reminderDraft,
                            notifyDaysBefore: days,
                          })
                        }
                        className={cn(
                          "font-num min-h-[32px] rounded-lg border px-3 text-xs font-semibold transition-colors",
                          active
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-secondary text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {days === 0 ? "Same day" : `${days}d before`}
                      </button>
                    );
                  })}
                </div>
              </div>

              <F label="Notes & maintenance log" className="col-span-2">
                <textarea
                  rows={2}
                  className="field"
                  placeholder="Service garage, oil grade, gift idea, or renewal ref…"
                  value={reminderDraft.notes}
                  onChange={(e) =>
                    setReminderDraft({
                      ...reminderDraft,
                      notes: e.target.value,
                    })
                  }
                />
              </F>

              <div className="col-span-2">
                <p className="label-mono mb-1.5">Attach photo or PDF</p>
                <DesignMediaUploader
                  compact
                  media={reminderDraft.media ?? []}
                  onChange={(media) =>
                    setReminderDraft({ ...reminderDraft, media })
                  }
                  onPreview={(m) =>
                    previewMediaFile(reminderDraft.media ?? [], m)
                  }
                />
              </div>

              <div className="col-span-2 mt-2 flex items-center justify-between gap-2 border-t border-border/70 pt-3">
                {isEditingReminder ? (
                  <Btn
                    type="button"
                    variant="danger"
                    onClick={() => {
                      setDB((d) => ({
                        ...d,
                        reminders: (d.reminders ?? []).filter(
                          (x) => x.id !== reminderDraft.id,
                        ),
                      }));
                      toast.message("Reminder deleted.");
                      closeDrawer();
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </Btn>
                ) : (
                  <span />
                )}
                <div className="flex gap-2">
                  <Btn type="button" onClick={closeDrawer}>
                    Cancel
                  </Btn>
                  <Btn type="submit" variant="gold">
                    Save reminder
                  </Btn>
                </div>
              </div>
            </form>
          )}
      </SlideDrawer>

      <MediaLightboxViewer
        item={mediaPreview?.item ?? null}
        initialMediaId={mediaPreview?.mediaId}
        onClose={() => setMediaPreview(null)}
      />
    </Glass>
  );
}
