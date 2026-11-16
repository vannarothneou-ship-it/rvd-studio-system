import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
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
import {
  CalendarDays,
  Columns3,
  FileText,
  GripVertical,
  List,
  Plus,
} from "lucide-react";
import { Btn, Empty, Glass, PageHeader, Pill, Stat } from "@/components/rv/ui";
import { EditModal, nextCode, type Field } from "@/components/rv/Crud";
import {
  DOCUMENT_TYPES,
  PROJECT_STATUSES,
  addDays,
  documentKind,
  invoiceView,
  isInvoice,
  money,
  parseTimelineDays,
  setDB,
  shortDate,
  toUSD,
  today,
  uid,
  updateProject,
  useDB,
  type Project,
} from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects · RothVan Studio" },
      {
        name: "description",
        content:
          "Track RothVan Design projects across board, calendar timeline, and list views.",
      },
      { property: "og:title", content: "Projects · RothVan Studio" },
      {
        property: "og:description",
        content:
          "Track RothVan Design projects across board, calendar timeline, and list views.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

type ViewMode = "board" | "calendar" | "list";

const statusColors: Record<
  string,
  { bg: string; border: string; text: string }
> = {
  Inquiry: {
    bg: "oklch(0.45 0.04 250 / 85%)",
    border: "oklch(0.6 0.05 250)",
    text: "#ffffff",
  },
  Quoted: {
    bg: "oklch(0.68 0.12 80)",
    border: "oklch(0.83 0.13 82)",
    text: "#18181b",
  },
  "In production": {
    bg: "oklch(0.83 0.13 82)",
    border: "oklch(0.9 0.12 82)",
    text: "#18181b",
  },
  Delivered: {
    bg: "oklch(0.68 0.13 155)",
    border: "oklch(0.78 0.13 155)",
    text: "#09150f",
  },
  Closed: {
    bg: "oklch(0.55 0.1 155)",
    border: "oklch(0.72 0.12 155)",
    text: "#ffffff",
  },
  "On hold": {
    bg: "oklch(0.45 0.02 60)",
    border: "oklch(0.6 0.02 60)",
    text: "#ffffff",
  },
  Lost: {
    bg: "oklch(0.6 0.15 22)",
    border: "oklch(0.7 0.14 22)",
    text: "#ffffff",
  },
};

function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function Page() {
  const db = useDB((d) => d);
  const nav = useNavigate();
  const [view, setView] = useState<ViewMode>("board");
  const [f, setF] = useState("All");
  const [showArchivedCols, setShowArchivedCols] = useState(false);
  const [edit, setEdit] = useState<Project | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 180, tolerance: 8 },
    }),
  );

  const fields: Field<Project>[] = [
    { k: "name", label: "Project name", wide: true },
    {
      k: "clientId",
      label: "Client",
      type: "select",
      options: db.clients.map((c) => ({ value: c.id, label: c.name })),
    },
    {
      k: "serviceId",
      label: "Service",
      type: "select",
      options: db.services.map((s) => ({
        value: s.id,
        label: `${s.code} · ${s.name}`,
      })),
    },
    {
      k: "status",
      label: "Status",
      type: "select",
      options: [...PROJECT_STATUSES],
    },
    { k: "quote", label: "Quote (USD)", type: "number" },
    { k: "start", label: "Start", type: "date" },
    { k: "due", label: "Due", type: "date" },
    { k: "delivered", label: "Delivered", type: "date" },
  ];

  const t = today();
  const rows = db.projects.filter((p) => f === "All" || p.status === f);
  const cost = (p: Project) =>
    db.expenses
      .filter((e) => e.projectId === p.id)
      .reduce(
        (a, e) => a + toUSD(e.amount, e.currency, db.settings.khrRate),
        0,
      );
  const projectBilling = (p: Project) => {
    const docs = db.invoices.filter((i) => i.projectId === p.id);
    const bills = docs.filter(isInvoice).map((i) => invoiceView(i, db));
    const billed = bills.reduce((a, x) => a + x.totalUSD, 0);
    const paid = bills.reduce(
      (a, x) => a + toUSD(x.paid, "USD", db.settings.khrRate),
      0,
    );
    return { docs, billed, paid };
  };

  const blank = (overrides: Partial<Project> = {}): Project => ({
    id: uid(),
    code: nextCode(
      "RVD-",
      db.projects.map((p) => p.code),
      101,
      3,
    ),
    clientId: "",
    serviceId: "",
    name: "",
    status: "Inquiry",
    start: "",
    due: "",
    delivered: "",
    quote: 0,
    ...overrides,
  });

  const save = (v: Project) => {
    const s = db.services.find((x) => x.id === v.serviceId);
    const next = { ...v };
    if (!next.quote && s) next.quote = s.rate;
    if (next.status === "Delivered" && !next.delivered) next.delivered = t;
    if (next.status === "In production" && !next.start) next.start = t;
    if (next.start && next.due && next.due < next.start) {
      toast.error("Due date cannot be before start date.");
      return;
    }
    try {
      setDB((d) => updateProject(d, next));
      toast.success("Project saved");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Unable to save project",
      );
    }
  };

  const handleBoardDragStart = (event: DragStartEvent) => {
    setActiveDragId(String(event.active.id));
  };

  const handleBoardDragEnd = (event: DragEndEvent) => {
    setActiveDragId(null);
    const { active, over } = event;
    if (!over) return;
    const projectId = String(active.id);
    const nextStatus = String(over.id);
    const proj = db.projects.find((p) => p.id === projectId);
    if (!proj || proj.status === nextStatus) return;
    try {
      setDB((d) => updateProject(d, { ...proj, status: nextStatus }));
      toast.success(`${proj.name || proj.code} → ${nextStatus}`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Unable to move project",
      );
    }
  };

  const boardColumns = showArchivedCols
    ? [...PROJECT_STATUSES]
    : [...PROJECT_STATUSES.slice(0, 5)];
  const activeDragged = activeDragId
    ? db.projects.find((p) => p.id === activeDragId)
    : undefined;

  const calendarEvents = useMemo(() => {
    return db.projects
      .filter((p) => Boolean(p.start || p.due))
      .map((p) => {
        const start = p.start || p.due;
        const inclusiveEnd = p.due && p.due >= start ? p.due : start;
        const colors = statusColors[p.status] ?? statusColors["Inquiry"]!;
        const clientName = db.clients.find((c) => c.id === p.clientId)?.name;
        return {
          id: p.id,
          title: `${p.name || p.code}${clientName ? ` · ${clientName}` : ""}`,
          start,
          // FullCalendar end date is exclusive in dayGridMonth
          end: addDays(inclusiveEnd, 1),
          allDay: true,
          backgroundColor: colors.bg,
          borderColor: colors.border,
          textColor: colors.text,
          extendedProps: { project: p },
        };
      });
  }, [db.projects, db.clients]);

  const unscheduledProjects = db.projects.filter(
    (p) => !p.start && !p.due && !["Closed", "Lost"].includes(p.status),
  );

  const onCalendarDateClick = (arg: DateClickArg) => {
    setEdit(
      blank({
        start: arg.dateStr,
        due: addDays(arg.dateStr, 6),
        status: "In production",
      }),
    );
  };

  const onCalendarSelect = (arg: DateSelectArg) => {
    const start = toIsoDate(arg.start);
    const inclusiveEnd = addDays(toIsoDate(arg.end), -1);
    setEdit(
      blank({
        start,
        due: inclusiveEnd >= start ? inclusiveEnd : start,
        status: "In production",
      }),
    );
  };

  const onCalendarEventClick = (arg: EventClickArg) => {
    const p = db.projects.find((x) => x.id === arg.event.id);
    if (p) setEdit(p);
  };

  const onCalendarEventDrop = (arg: EventDropArg) => {
    const p = db.projects.find((x) => x.id === arg.event.id);
    if (!p || !arg.event.start) return;
    const start = toIsoDate(arg.event.start);
    const due = arg.event.end ? addDays(toIsoDate(arg.event.end), -1) : start;
    try {
      setDB((d) =>
        updateProject(d, { ...p, start, due: due >= start ? due : start }),
      );
      toast.success(`Rescheduled ${p.name || p.code}`);
    } catch (err) {
      arg.revert();
      toast.error(err instanceof Error ? err.message : "Unable to reschedule");
    }
  };

  const onCalendarEventResize = (arg: EventResizeDoneArg) => {
    const p = db.projects.find((x) => x.id === arg.event.id);
    if (!p || !arg.event.start) return;
    const start = toIsoDate(arg.event.start);
    const due = arg.event.end ? addDays(toIsoDate(arg.event.end), -1) : start;
    try {
      setDB((d) =>
        updateProject(d, { ...p, start, due: due >= start ? due : start }),
      );
      toast.success(
        `Timeline updated (${shortDate(start)} – ${shortDate(due)})`,
      );
    } catch (err) {
      arg.revert();
      toast.error(
        err instanceof Error ? err.message : "Unable to resize timeline",
      );
    }
  };

  const live = db.projects.filter((p) => p.status === "In production");

  return (
    <>
      <PageHeader
        title="Projects"
        owner={db.settings.ownerName}
        action={
          <Btn variant="gold" onClick={() => setEdit(blank())}>
            <Plus className="h-4 w-4" />
            New project
          </Btn>
        }
      />
      <div className="mb-4 grid grid-cols-3 gap-4">
        <Glass>
          <Stat label="In production" value={String(live.length)} />
        </Glass>
        <Glass delay={60}>
          <Stat
            label="Pipeline"
            value={money(
              db.projects
                .filter((p) => ["Inquiry", "Quoted"].includes(p.status))
                .reduce((a, p) => a + p.quote, 0),
            )}
          />
        </Glass>
        <Glass delay={120}>
          <Stat
            label="Late"
            tone="neg"
            value={String(live.filter((p) => p.due && p.due < t).length)}
          />
        </Glass>
      </div>

      {/* View Switcher */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-full border border-border bg-muted p-1 text-xs">
          {(
            [
              { id: "board", label: "Board", icon: Columns3 },
              { id: "calendar", label: "Calendar", icon: CalendarDays },
              { id: "list", label: "List", icon: List },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-medium transition-colors",
                view === item.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <item.icon className="h-3.5 w-3.5" />
              {item.label}
            </button>
          ))}
        </div>
        {view === "board" && (
          <button
            onClick={() => setShowArchivedCols((s) => !s)}
            className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            {showArchivedCols ? "Hide On hold & Lost" : "Show On hold & Lost"}
          </button>
        )}
      </div>

      {view === "board" && (
        <DndContext
          sensors={sensors}
          onDragStart={handleBoardDragStart}
          onDragEnd={handleBoardDragEnd}
        >
          <div className="flex gap-3 overflow-x-auto pb-3 lg:grid lg:grid-cols-5 lg:overflow-visible">
            {boardColumns.map((status) => {
              const colProjects = db.projects.filter(
                (p) => p.status === status,
              );
              return (
                <BoardColumn
                  key={status}
                  status={status}
                  count={colProjects.length}
                  onAdd={() => setEdit(blank({ status }))}
                >
                  {colProjects.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-border/70 py-6 text-center text-xs text-muted-foreground">
                      Drop project here
                    </p>
                  ) : (
                    colProjects.map((p) => {
                      const billing = projectBilling(p);
                      const late =
                        p.status === "In production" &&
                        Boolean(p.due && p.due < t);
                      return (
                        <BoardCard
                          key={p.id}
                          project={p}
                          clientName={
                            db.clients.find((c) => c.id === p.clientId)?.name ??
                            "No client"
                          }
                          docsCount={billing.docs.length}
                          paidUSD={billing.paid}
                          late={late}
                          onOpen={() => setEdit(p)}
                        />
                      );
                    })
                  )}
                </BoardColumn>
              );
            })}
          </div>
          <DragOverlay>
            {activeDragged ? (
              <div className="glass-strong w-64 rounded-2xl border border-primary/60 p-3.5 shadow-2xl">
                <p className="font-mono text-[0.68rem] text-muted-foreground">
                  {activeDragged.code}
                </p>
                <p className="truncate font-medium">
                  {activeDragged.name || "Untitled"}
                </p>
                <p className="mt-1 font-mono text-xs text-primary">
                  {money(activeDragged.quote)}
                </p>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {view === "calendar" && (
        <div className="space-y-4">
          <Glass delay={120}>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>
                Click or drag across days to add a project · Drag bars to
                reschedule · Drag bar edge to extend timeline
              </span>
              <div className="flex flex-wrap gap-2">
                {(
                  ["Quoted", "In production", "Delivered", "Closed"] as const
                ).map((st) => (
                  <span key={st} className="inline-flex items-center gap-1.5">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: statusColors[st]?.bg }}
                    />
                    {st}
                  </span>
                ))}
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
                dayMaxEvents={3}
                events={calendarEvents}
                dateClick={onCalendarDateClick}
                select={onCalendarSelect}
                eventClick={onCalendarEventClick}
                eventDrop={onCalendarEventDrop}
                eventResize={onCalendarEventResize}
              />
            </div>
          </Glass>

          {unscheduledProjects.length > 0 && (
            <Glass delay={160}>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-display text-base font-bold">
                  Unscheduled projects ({unscheduledProjects.length})
                </h2>
                <span className="text-xs text-muted-foreground">
                  Schedule onto calendar
                </span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {unscheduledProjects.map((p) => {
                  const clientName =
                    db.clients.find((c) => c.id === p.clientId)?.name ??
                    "No client";
                  return (
                    <div
                      key={p.id}
                      className="flex items-center justify-between gap-2 rounded-2xl border border-border bg-muted/60 p-3"
                    >
                      <button
                        onClick={() => setEdit(p)}
                        className="min-w-0 flex-1 text-left"
                      >
                        <p className="truncate text-sm font-medium">
                          {p.name || p.code}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {clientName} · {p.status}
                        </p>
                      </button>
                      <Btn
                        className="shrink-0 px-3 py-1 text-xs"
                        onClick={() => {
                          const svc = db.services.find(
                            (s) => s.id === p.serviceId,
                          );
                          const days = svc?.timeline
                            ? parseTimelineDays(svc.timeline, 7)
                            : 7;
                          try {
                            setDB((d) =>
                              updateProject(d, {
                                ...p,
                                start: t,
                                due: addDays(t, days),
                              }),
                            );
                            toast.success(
                              `Scheduled ${p.name || p.code} starting today`,
                            );
                          } catch (err) {
                            toast.error(
                              err instanceof Error
                                ? err.message
                                : "Unable to schedule",
                            );
                          }
                        }}
                      >
                        Schedule
                      </Btn>
                    </div>
                  );
                })}
              </div>
            </Glass>
          )}
        </div>
      )}

      {view === "list" && (
        <Glass delay={180}>
          <div className="mb-4 flex flex-wrap gap-1.5">
            {["All", ...PROJECT_STATUSES].map((x) => (
              <button
                key={x}
                onClick={() => setF(x)}
                className={cn(
                  "rounded-full border border-border px-3 py-1 text-xs",
                  f === x
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent",
                )}
              >
                {x}
                {x !== "All" &&
                  ` ${db.projects.filter((p) => p.status === x).length}`}
              </button>
            ))}
          </div>
          {rows.length === 0 ? (
            <Empty>No projects here.</Empty>
          ) : (
            <ul className="divide-y divide-border">
              {rows.map((p, k) => {
                const c = cost(p);
                const billing = projectBilling(p);
                const late =
                  p.status === "In production" && Boolean(p.due && p.due < t);
                return (
                  <li
                    key={p.id}
                    className="rise"
                    style={{ animationDelay: `${k * 30}ms` }}
                  >
                    <button
                      onClick={() => setEdit(p)}
                      className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl px-2 py-3 text-left hover:bg-muted"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium">
                          {p.name || "Untitled"}{" "}
                          <span className="font-mono text-xs text-muted-foreground">
                            {p.code}
                          </span>
                        </p>
                        <p
                          className={cn(
                            "truncate text-xs text-muted-foreground",
                            late && "text-destructive",
                          )}
                        >
                          {db.clients.find((x) => x.id === p.clientId)?.name ??
                            "No client"}{" "}
                          · {p.start ? `${shortDate(p.start)} → ` : ""}due{" "}
                          {shortDate(p.due)}
                          {late && " · late"}
                          {billing.docs.length > 0 &&
                            ` · ${billing.docs.length} docs`}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-mono text-sm">{money(p.quote)}</p>
                          {billing.paid > 0 && (
                            <p className="text-xs text-positive">
                              {money(billing.paid)} paid
                            </p>
                          )}
                          {c > 0 && (
                            <p className="text-xs text-muted-foreground">
                              margin {money(p.quote - c)}
                            </p>
                          )}
                        </div>
                        <Pill s={p.status} />
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Glass>
      )}

      <EditModal
        item={edit}
        fields={fields}
        title={edit?.code ?? "Project"}
        onClose={() => setEdit(null)}
        onSave={save}
        onFieldChange={(next, key) => {
          if (key === "serviceId") {
            const svc = db.services.find((s) => s.id === next.serviceId);
            if (svc) {
              const start = next.start || today();
              const days = parseTimelineDays(svc.timeline, 7);
              return {
                ...next,
                name: next.name || svc.name,
                quote: next.quote || svc.rate,
                due: next.due || addDays(start, days),
              };
            }
          }
          return next;
        }}
        footerExtra={(proj) => {
          const isExisting = db.projects.some((p) => p.id === proj.id);
          const linkedDocs = isExisting
            ? db.invoices.filter((i) => i.projectId === proj.id)
            : [];
          return (
            <div className="rounded-2xl border border-border bg-muted/60 p-3 text-xs">
              <div className="mb-2 flex items-center justify-between">
                <span className="label-mono">Connected documents</span>
                {linkedDocs.length > 0 && (
                  <span className="text-muted-foreground">
                    {linkedDocs.length} linked
                  </span>
                )}
              </div>
              {linkedDocs.length > 0 && (
                <div className="mb-2.5 flex flex-wrap gap-1.5">
                  {linkedDocs.map((d) => (
                    <Link
                      key={d.id}
                      to="/invoices/$id"
                      params={{ id: d.id }}
                      onClick={() => setEdit(null)}
                      className="inline-flex items-center gap-1 rounded-full border border-border bg-background/60 px-2.5 py-1 font-mono hover:border-primary"
                    >
                      <FileText className="h-3 w-3 text-primary" />
                      {documentKind(d)} · {d.no}
                    </Link>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap gap-1.5">
                {DOCUMENT_TYPES.map((docKind) => (
                  <Btn
                    key={docKind}
                    type="button"
                    className="px-2.5 py-1 text-xs"
                    onClick={() => {
                      const savedProj = { ...proj };
                      if (!savedProj.name.trim())
                        savedProj.name =
                          db.services.find((s) => s.id === savedProj.serviceId)
                            ?.name || "Design project";
                      setDB((d) => updateProject(d, savedProj));
                      setEdit(null);
                      nav({
                        to: "/invoices/$id",
                        params: { id: "new" },
                        search: {
                          kind: docKind,
                          project: savedProj.id,
                          ...(savedProj.clientId
                            ? { client: savedProj.clientId }
                            : {}),
                          ...(savedProj.serviceId
                            ? { service: savedProj.serviceId }
                            : {}),
                        },
                      });
                    }}
                  >
                    + {docKind}
                  </Btn>
                ))}
              </div>
            </div>
          );
        }}
        onDelete={
          db.projects.some((p) => p.id === edit?.id)
            ? (v) =>
                setDB((d) => ({
                  ...d,
                  projects: d.projects.filter((p) => p.id !== v.id),
                  invoices: d.invoices.map((i) =>
                    i.projectId === v.id ? { ...i, projectId: "" } : i,
                  ),
                }))
            : undefined
        }
      />
    </>
  );
}

function BoardColumn({
  status,
  count,
  onAdd,
  children,
}: {
  status: string;
  count: number;
  onAdd: () => void;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "glass flex min-h-72 min-w-[260px] flex-col rounded-3xl p-3.5 transition-colors lg:min-w-0",
        isOver && "border-primary bg-primary/10",
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Pill s={status} />
          <span className="font-mono text-xs text-muted-foreground">
            {count}
          </span>
        </div>
        <button
          onClick={onAdd}
          className="rounded-full p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
          aria-label={`Add project in ${status}`}
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="flex flex-1 flex-col gap-2.5">{children}</div>
    </div>
  );
}

function BoardCard({
  project,
  clientName,
  docsCount,
  paidUSD,
  late,
  onOpen,
}: {
  project: Project;
  clientName: string;
  docsCount: number;
  paidUSD: number;
  late: boolean;
  onOpen: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: project.id });
  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      className={cn(
        "group cursor-grab touch-none rounded-2xl border border-border bg-muted/60 p-3 text-left transition-all hover:border-primary/50 hover:bg-muted active:cursor-grabbing",
        isDragging && "opacity-40",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[0.66rem] text-muted-foreground">
            {project.code}
          </p>
          <p className="mt-0.5 truncate text-sm font-semibold">
            {project.name || "Untitled"}
          </p>
          <p className="truncate text-xs text-muted-foreground">{clientName}</p>
        </div>
        <span className="rounded-lg p-1 text-muted-foreground group-hover:text-foreground">
          <GripVertical className="h-4 w-4" />
        </span>
      </div>
      <div className="mt-2.5 flex w-full items-center justify-between border-t border-border/60 pt-2 text-xs">
        <span
          className={cn(
            "text-muted-foreground",
            late && "font-medium text-destructive",
          )}
        >
          {project.due
            ? `Due ${shortDate(project.due)}${late ? " · late" : ""}`
            : "No dates"}
        </span>
        <span className="font-mono font-medium">
          {money(project.quote)}
          {paidUSD > 0 ? (
            <span className="ml-1 text-positive">({money(paidUSD)})</span>
          ) : null}
        </span>
      </div>
      {docsCount > 0 && (
        <p className="mt-1 font-mono text-[0.65rem] text-muted-foreground">
          {docsCount} linked doc{docsCount > 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
