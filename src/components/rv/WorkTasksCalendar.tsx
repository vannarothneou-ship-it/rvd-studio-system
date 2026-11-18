import { useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, {
  type DateClickArg,
  type EventResizeDoneArg,
} from "@fullcalendar/interaction";
import type {
  DateSelectArg,
  EventClickArg,
  EventDropArg,
} from "@fullcalendar/core";
import { CalendarPlus, CheckCircle2 } from "lucide-react";
import { Btn, Glass } from "@/components/rv/ui";
import {
  workProjectAccent,
  workTaskProjectName,
} from "@/components/rv/workProjectColors";
import { addDays, shortDate, today, type WorkTask } from "@/lib/store";

function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
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

  const scheduledEvents = useMemo(() => {
    return tasks
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
        const accent = workProjectAccent(proj);
        const prefix = proj ? `[${proj}] ` : "";
        const doneMark = t.status === "Completed" ? "✓ " : "";

        return {
          id: t.id,
          title: `${doneMark}${prefix}${t.title || t.code}`,
          start,
          end: addDays(rawEnd, 1),
          allDay: true,
          backgroundColor: accent.calBg,
          borderColor: accent.calBorder,
          textColor: accent.calText,
          classNames: t.status === "Completed" ? ["opacity-75"] : [],
        };
      });
  }, [tasks]);

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

  const onDateClick = (arg: DateClickArg) => {
    onCreateOnRange(arg.dateStr, arg.dateStr);
  };

  const onSelect = (arg: DateSelectArg) => {
    const start = toIsoDate(arg.start);
    const inclusiveEnd = addDays(toIsoDate(arg.end), -1);
    onCreateOnRange(start, inclusiveEnd >= start ? inclusiveEnd : start);
  };

  const onEventClick = (arg: EventClickArg) => {
    const found = tasks.find((t) => t.id === arg.event.id);
    if (found) onSelectTask(found);
  };

  const onEventDrop = (arg: EventDropArg) => {
    const found = tasks.find((t) => t.id === arg.event.id);
    if (!found || !arg.event.start) return;
    const start = toIsoDate(arg.event.start);
    const due = arg.event.end ? addDays(toIsoDate(arg.event.end), -1) : start;
    onRescheduleTask(found, start, due >= start ? due : start);
  };

  const onEventResize = (arg: EventResizeDoneArg) => {
    const found = tasks.find((t) => t.id === arg.event.id);
    if (!found || !arg.event.start) return;
    const start = toIsoDate(arg.event.start);
    const due = arg.event.end ? addDays(toIsoDate(arg.event.end), -1) : start;
    onRescheduleTask(found, start, due >= start ? due : start);
  };

  return (
    <div className="space-y-4">
      <Glass>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <div className="flex flex-wrap items-center gap-2">
            <span>
              Click any date or drag across days to add a task
              {activeProject !== "All" ? ` to ${activeProject}` : ""} · Drag
              events to reschedule
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {legendProjects.map((name) => {
              const accent = workProjectAccent(name);
              return (
                <span
                  key={name}
                  className="inline-flex items-center gap-1.5 font-medium text-foreground/90"
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: accent.dot }}
                  />
                  {name}
                </span>
              );
            })}
            <Btn
              type="button"
              variant="gold"
              onClick={() => onCreateOnRange(todayStr, todayStr)}
              className="px-3 py-1 text-xs"
            >
              <CalendarPlus className="h-3.5 w-3.5" />
              Add on today
            </Btn>
          </div>
        </div>

        <div className="project-calendar">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
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
            dateClick={onDateClick}
            select={onSelect}
            eventClick={onEventClick}
            eventDrop={onEventDrop}
            eventResize={onEventResize}
          />
        </div>
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
              const accent = workProjectAccent(proj);
              return (
                <div
                  key={task.id}
                  className="flex items-center justify-between gap-2 rounded-2xl border border-border bg-muted/50 px-3 py-2.5"
                >
                  <button
                    type="button"
                    onClick={() => onSelectTask(task)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className="flex items-center gap-1.5 truncate text-sm font-medium">
                      {proj && (
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: accent.dot }}
                        />
                      )}
                      <span className="truncate">
                        {task.title || task.code}
                      </span>
                    </p>
                    <p className="font-num mt-0.5 truncate text-xs text-muted-foreground">
                      {proj ? `${proj} · ` : ""}
                      {task.designType} · {task.status}
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
