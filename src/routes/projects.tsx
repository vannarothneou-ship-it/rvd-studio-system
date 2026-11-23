import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
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
import type {
  DateClickArg,
  EventResizeDoneArg,
} from "@fullcalendar/interaction";
import type {
  DateSelectArg,
  EventClickArg,
  EventDropArg,
} from "@fullcalendar/core";
import {
  LazyFullCalendar,
  useIsDesktopMd,
} from "@/components/rv/LazyFullCalendar";
import { SwipeRow } from "@/components/rv/SwipeRow";
import {
  ArrowRight,
  CalendarDays,
  CalendarRange,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Columns3,
  Eye,
  EyeOff,
  FileText,
  Flag,
  GripVertical,
  List,
  Palette,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import {
  Btn,
  Empty,
  Glass,
  PageHeader,
  Pill,
  SlidingTabs,
  Stat,
} from "@/components/rv/ui";
import { EditModal, nextCode, type Field } from "@/components/rv/Crud";
import {
  EditLayoutButton,
  EditableBentoGrid,
  type BentoWidgetDef,
} from "@/components/rv/BentoGrid";
import {
  DesignMediaUploader,
  MediaCountBadge,
  MediaLightboxViewer,
} from "@/components/rv/DesignMediaTools";
import {
  DOCUMENT_TYPES,
  PROJECT_STATUSES,
  addDays,
  compactMoney,
  documentKind,
  getProjectHealth,
  projectDeleteBlocker,
  inferStudioDesignType,
  invoiceView,
  isInvoice,
  money,
  parseTimelineDays,
  recordToUSD,
  safeKhrRate,
  setDB,
  shortDate,
  today,
  uid,
  updateProject,
  useDB,
  type Project,
  type ProjectHealth,
  type ProjectHealthStatus,
  type ShowcaseWorkItem,
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

type ViewMode = "board" | "timeline" | "calendar" | "list";
const BOARD_COL_LIMIT = 5;
const LIST_LIMIT = 12;
const BOARD_CONFIG_STORAGE_KEY = "rv-project-boards-v1";

interface BoardColorPreset {
  id: string;
  label: string;
  dot: string;
  headerBg: string;
  headerBorder: string;
  pillText: string;
  colBorder: string;
  calBg: string;
  calBorder: string;
  calText: string;
}

const BOARD_COLORS: readonly BoardColorPreset[] = [
  {
    id: "gold",
    label: "Gold",
    dot: "#e6b85c",
    headerBg: "rgba(230, 184, 92, 0.16)",
    headerBorder: "rgba(230, 184, 92, 0.45)",
    pillText: "#f3cf80",
    colBorder: "rgba(230, 184, 92, 0.35)",
    calBg: "var(--primary)",
    calBorder: "oklch(0.9 0.12 82)",
    calText: "#18181b",
  },
  {
    id: "amber",
    label: "Amber",
    dot: "#d99a4e",
    headerBg: "rgba(217, 154, 78, 0.16)",
    headerBorder: "rgba(217, 154, 78, 0.42)",
    pillText: "#eab875",
    colBorder: "rgba(217, 154, 78, 0.32)",
    calBg: "oklch(0.68 0.12 80)",
    calBorder: "var(--primary)",
    calText: "#18181b",
  },
  {
    id: "emerald",
    label: "Emerald",
    dot: "#4ea87f",
    headerBg: "rgba(78, 168, 127, 0.16)",
    headerBorder: "rgba(78, 168, 127, 0.42)",
    pillText: "#72cfa3",
    colBorder: "rgba(78, 168, 127, 0.32)",
    calBg: "oklch(0.68 0.13 155)",
    calBorder: "oklch(0.78 0.13 155)",
    calText: "#09150f",
  },
  {
    id: "sky",
    label: "Slate Blue",
    dot: "#6d98c9",
    headerBg: "rgba(109, 152, 201, 0.16)",
    headerBorder: "rgba(109, 152, 201, 0.42)",
    pillText: "#97bce4",
    colBorder: "rgba(109, 152, 201, 0.32)",
    calBg: "oklch(0.56 0.09 245)",
    calBorder: "oklch(0.7 0.1 245)",
    calText: "#ffffff",
  },
  {
    id: "violet",
    label: "Violet",
    dot: "#9b87d4",
    headerBg: "rgba(155, 135, 212, 0.16)",
    headerBorder: "rgba(155, 135, 212, 0.42)",
    pillText: "#bfb0ec",
    colBorder: "rgba(155, 135, 212, 0.32)",
    calBg: "oklch(0.56 0.12 290)",
    calBorder: "oklch(0.7 0.12 290)",
    calText: "#ffffff",
  },
  {
    id: "rose",
    label: "Rose",
    dot: "#cf7068",
    headerBg: "rgba(207, 112, 104, 0.16)",
    headerBorder: "rgba(207, 112, 104, 0.42)",
    pillText: "#ea968f",
    colBorder: "rgba(207, 112, 104, 0.32)",
    calBg: "oklch(0.6 0.15 22)",
    calBorder: "oklch(0.7 0.14 22)",
    calText: "#ffffff",
  },
  {
    id: "neutral",
    label: "Obsidian",
    dot: "#969087",
    headerBg: "rgba(150, 144, 135, 0.14)",
    headerBorder: "rgba(150, 144, 135, 0.35)",
    pillText: "#c2bdb4",
    colBorder: "rgba(150, 144, 135, 0.28)",
    calBg: "oklch(0.55 0.04 155)",
    calBorder: "oklch(0.68 0.06 155)",
    calText: "#ffffff",
  },
] as const;

interface BoardConfig {
  title: string;
  colorId: string;
  visible: boolean;
}

const DEFAULT_BOARD_CONFIGS: Record<string, BoardConfig> = {
  Inquiry: { title: "Inquiry", colorId: "sky", visible: true },
  Quoted: { title: "Quoted", colorId: "amber", visible: true },
  "In production": { title: "In production", colorId: "gold", visible: true },
  Delivered: { title: "Delivered", colorId: "emerald", visible: true },
  Closed: { title: "Closed", colorId: "neutral", visible: true },
  "On hold": { title: "On hold", colorId: "violet", visible: false },
  Lost: { title: "Lost", colorId: "rose", visible: false },
};

function boardColorFor(colorId: string): BoardColorPreset {
  return BOARD_COLORS.find((c) => c.id === colorId) ?? BOARD_COLORS[0]!;
}

function loadBoardConfigs(): Record<string, BoardConfig> {
  const base: Record<string, BoardConfig> = {};
  for (const status of PROJECT_STATUSES) {
    base[status] = {
      ...(DEFAULT_BOARD_CONFIGS[status] ?? {
        title: status,
        colorId: "neutral",
        visible: true,
      }),
    };
  }
  if (typeof window === "undefined") return base;
  try {
    const raw = window.localStorage.getItem(BOARD_CONFIG_STORAGE_KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw) as Record<string, Partial<BoardConfig>>;
    for (const status of PROJECT_STATUSES) {
      const saved = parsed?.[status];
      if (!saved) continue;
      base[status] = {
        title:
          typeof saved.title === "string" && saved.title.trim()
            ? saved.title
            : base[status]!.title,
        colorId:
          typeof saved.colorId === "string" &&
          BOARD_COLORS.some((c) => c.id === saved.colorId)
            ? saved.colorId
            : base[status]!.colorId,
        visible:
          typeof saved.visible === "boolean"
            ? saved.visible
            : base[status]!.visible,
      };
    }
  } catch {
    // ignore storage errors
  }
  return base;
}

function saveBoardConfigs(configs: Record<string, BoardConfig>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      BOARD_CONFIG_STORAGE_KEY,
      JSON.stringify(configs),
    );
  } catch {
    // ignore storage errors
  }
}

function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function nextProjectStage(status: string): string | null {
  switch (status) {
    case "Inquiry":
      return "Quoted";
    case "Quoted":
      return "In production";
    case "In production":
      return "Delivered";
    case "Delivered":
      return "Closed";
    default:
      return null;
  }
}

function Page() {
  const db = useDB((d) => d);
  const nav = useNavigate();
  const isDesktopMd = useIsDesktopMd();
  const [view, setView] = useState<ViewMode>("board");
  const [f, setF] = useState("All");
  const [query, setQuery] = useState("");
  const [healthFilter, setHealthFilter] = useState<"all" | ProjectHealthStatus>(
    "all",
  );
  const [boardConfigs, setBoardConfigs] =
    useState<Record<string, BoardConfig>>(loadBoardConfigs);
  const [boardsPanelOpen, setBoardsPanelOpen] = useState(false);
  const [editingBoardCol, setEditingBoardCol] = useState<string | null>(null);
  const [expandedCols, setExpandedCols] = useState<Record<string, boolean>>({});
  const [showAllList, setShowAllList] = useState(false);
  const [editingLayout, setEditingLayout] = useState(false);
  const [edit, setEdit] = useState<Project | null>(null);
  const [previewLightbox, setPreviewLightbox] = useState<{
    item: ShowcaseWorkItem;
    mediaId?: string;
  } | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const updateBoardConfig = (status: string, patch: Partial<BoardConfig>) => {
    setBoardConfigs((prev) => {
      const current = prev[status] ?? {
        title: status,
        colorId: "neutral",
        visible: true,
      };
      const next = {
        ...prev,
        [status]: { ...current, ...patch },
      };
      saveBoardConfigs(next);
      return next;
    });
  };

  const setAllBoardsVisibility = (visibleOnlyActive: boolean) => {
    setBoardConfigs((prev) => {
      const next: Record<string, BoardConfig> = { ...prev };
      for (const status of PROJECT_STATUSES) {
        const cur = next[status] ?? DEFAULT_BOARD_CONFIGS[status]!;
        next[status] = {
          ...cur,
          visible: visibleOnlyActive
            ? !["On hold", "Lost"].includes(status)
            : true,
        };
      }
      saveBoardConfigs(next);
      return next;
    });
  };

  const resetBoardConfigs = () => {
    const fresh: Record<string, BoardConfig> = {};
    for (const status of PROJECT_STATUSES) {
      fresh[status] = { ...DEFAULT_BOARD_CONFIGS[status]! };
    }
    setBoardConfigs(fresh);
    saveBoardConfigs(fresh);
    setEditingBoardCol(null);
  };

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
      label: "Status (tap to set)",
      type: "chips",
      options: PROJECT_STATUSES.map((st) => {
        const cfg = boardConfigs[st];
        const col = boardColorFor(cfg?.colorId ?? "neutral");
        return {
          value: st,
          label: cfg?.title || st,
          dot: col.dot,
        };
      }),
    },
    { k: "quote", label: "Quote (USD)", type: "number" },
    { k: "artworkCount", label: "Artwork pieces (pcs)", type: "number" },
    { k: "start", label: "Start", type: "date" },
    { k: "due", label: "Due", type: "date" },
    { k: "delivered", label: "Delivered", type: "date" },
  ];

  const t = today();
  const projectHealthMap = useMemo(() => {
    const map = new Map<string, ProjectHealth>();
    for (const p of db.projects) {
      map.set(p.id, getProjectHealth(p, t));
    }
    return map;
  }, [db.projects, t]);

  const healthCounts = useMemo(() => {
    let healthy = 0;
    let atRisk = 0;
    let delayed = 0;
    for (const h of projectHealthMap.values()) {
      if (h.status === "healthy") healthy += 1;
      else if (h.status === "at-risk") atRisk += 1;
      else delayed += 1;
    }
    return {
      all: db.projects.length,
      healthy,
      "at-risk": atRisk,
      delayed,
    };
  }, [projectHealthMap, db.projects.length]);

  const qLower = query.trim().toLowerCase();

  const matchesSearch = useCallback(
    (p: Project) => {
      if (!qLower) return true;
      const clientName =
        db.clients.find((c) => c.id === p.clientId)?.name ?? "";
      return `${p.code} ${p.name} ${p.status} ${clientName}`
        .toLowerCase()
        .includes(qLower);
    },
    [qLower, db.clients],
  );

  const rows = useMemo(
    () =>
      db.projects.filter((p) => {
        if (f !== "All" && p.status !== f) return false;
        if (healthFilter !== "all") {
          const h = projectHealthMap.get(p.id);
          if (h?.status !== healthFilter) return false;
        }
        if (!matchesSearch(p)) return false;
        return true;
      }),
    [db.projects, f, healthFilter, projectHealthMap, matchesSearch],
  );
  const visibleListRows = showAllList ? rows : rows.slice(0, LIST_LIMIT);

  const cost = useCallback(
    (p: Project) =>
      db.expenses
        .filter((e) => e.projectId === p.id)
        .reduce(
          (a, e) => a + recordToUSD(e, safeKhrRate(db.settings.khrRate)),
          0,
        ),
    [db.expenses, db.settings.khrRate],
  );

  const projectBilling = useCallback(
    (p: Project) => {
      const docs = db.invoices.filter((i) => i.projectId === p.id);
      const bills = docs.filter(isInvoice).map((i) => invoiceView(i, db));
      const billed = bills.reduce((a, x) => a + x.totalUSD, 0);
      const paid = bills.reduce((a, x) => a + x.paidUSD, 0);
      return { docs, billed, paid };
    },
    [db],
  );

  const blank = useCallback(
    (overrides: Partial<Project> = {}): Project => ({
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
      artworkCount: 1,
      media: [],
      ...overrides,
    }),
    [db.projects],
  );

  const advanceProjectStage = useCallback(
    (p: Project) => {
      const nextStatus = nextProjectStage(p.status);
      if (!nextStatus) return;
      const updated: Project = {
        ...p,
        status: nextStatus,
        ...(nextStatus === "In production" && !p.start ? { start: t } : {}),
        ...(nextStatus === "Delivered" && !p.delivered ? { delivered: t } : {}),
      };
      try {
        setDB((d) => updateProject(d, updated));
        const label = boardConfigs[nextStatus]?.title || nextStatus;
        toast.success(`${p.name || p.code} → ${label}`, {
          action: {
            label: "Undo",
            onClick: () => setDB((d) => updateProject(d, p)),
          },
        });
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Unable to update project",
        );
      }
    },
    [t, boardConfigs],
  );

  const deleteProjectFromList = useCallback(
    (p: Project) => {
      const blocker = projectDeleteBlocker(db, p.id);
      if (blocker) {
        toast.error(blocker);
        return;
      }
      setDB((d) => ({
        ...d,
        projects: d.projects.filter((x) => x.id !== p.id),
      }));
      toast(`Deleted ${p.name || p.code}`, {
        action: {
          label: "Undo",
          onClick: () => setDB((d) => ({ ...d, projects: [p, ...d.projects] })),
        },
      });
    },
    [db],
  );

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

  const handleBoardDragStart = useCallback((event: DragStartEvent) => {
    setActiveDragId(String(event.active.id));
  }, []);

  const handleBoardDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveDragId(null);
      const { active, over } = event;
      if (!over) return;
      const projectId = String(active.id);
      const nextStatus = String(over.id);
      const proj = db.projects.find((p) => p.id === projectId);
      if (!proj || proj.status === nextStatus) return;
      try {
        setDB((d) => updateProject(d, { ...proj, status: nextStatus }));
        const nextLabel = boardConfigs[nextStatus]?.title || nextStatus;
        toast.success(`${proj.name || proj.code} → ${nextLabel}`);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Unable to move project",
        );
      }
    },
    [db.projects, boardConfigs],
  );

  const boardColumns = PROJECT_STATUSES.filter(
    (status) => boardConfigs[status]?.visible ?? true,
  );
  const activeDragged = activeDragId
    ? db.projects.find((p) => p.id === activeDragId)
    : undefined;

  const calendarEvents = useMemo(() => {
    return db.projects
      .filter((p) => Boolean(p.start || p.due))
      .map((p) => {
        const start = p.start || p.due;
        const inclusiveEnd = p.due && p.due >= start ? p.due : start;
        const cfg = boardConfigs[p.status];
        const color = boardColorFor(cfg?.colorId ?? "sky");
        const clientName = db.clients.find((c) => c.id === p.clientId)?.name;
        return {
          id: p.id,
          title: `${p.name || p.code}${clientName ? ` · ${clientName}` : ""}`,
          start,
          end: addDays(inclusiveEnd, 1),
          allDay: true,
          backgroundColor: color.calBg,
          borderColor: color.calBorder,
          textColor: color.calText,
          extendedProps: { project: p },
        };
      });
  }, [db.projects, db.clients, boardConfigs]);

  const unscheduledProjects = useMemo(
    () =>
      db.projects.filter(
        (p) => !p.start && !p.due && !["Closed", "Lost"].includes(p.status),
      ),
    [db.projects],
  );

  const scheduledMobileProjects = useMemo(
    () =>
      db.projects
        .filter((p) => Boolean(p.start || p.due))
        .sort((a, b) => (a.due || a.start).localeCompare(b.due || b.start)),
    [db.projects],
  );

  const onCalendarDateClick = useCallback(
    (arg: DateClickArg) => {
      setEdit(
        blank({
          start: arg.dateStr,
          due: addDays(arg.dateStr, 6),
          status: "In production",
        }),
      );
    },
    [blank],
  );

  const onCalendarSelect = useCallback(
    (arg: DateSelectArg) => {
      const start = toIsoDate(arg.start);
      const inclusiveEnd = addDays(toIsoDate(arg.end), -1);
      setEdit(
        blank({
          start,
          due: inclusiveEnd >= start ? inclusiveEnd : start,
          status: "In production",
        }),
      );
    },
    [blank],
  );

  const onCalendarEventClick = useCallback(
    (arg: EventClickArg) => {
      const p = db.projects.find((x) => x.id === arg.event.id);
      if (p) setEdit(p);
    },
    [db.projects],
  );

  const onCalendarEventDrop = useCallback(
    (arg: EventDropArg) => {
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
        toast.error(
          err instanceof Error ? err.message : "Unable to reschedule",
        );
      }
    },
    [db.projects],
  );

  const onCalendarEventResize = useCallback(
    (arg: EventResizeDoneArg) => {
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
    },
    [db.projects],
  );

  const live = db.projects.filter((p) => p.status === "In production");
  const pipelineTotal = db.projects
    .filter((p) => ["Inquiry", "Quoted"].includes(p.status))
    .reduce((a, p) => a + p.quote, 0);

  const widgets = useMemo<BentoWidgetDef[]>(
    () => [
      {
        id: "projInProd",
        title: "In production",
        defaultSpan: 4,
        render: () => (
          <Glass className="h-full">
            <Stat label="In production" value={String(live.length)} />
          </Glass>
        ),
      },
      {
        id: "projPipeline",
        title: "Pipeline",
        defaultSpan: 4,
        render: () => (
          <Glass delay={60} className="h-full">
            <Stat
              label="Pipeline"
              value={compactMoney(pipelineTotal)}
              fullValue={money(pipelineTotal)}
            />
          </Glass>
        ),
      },
      {
        id: "projLate",
        title: "Late",
        defaultSpan: 4,
        render: () => (
          <Glass delay={120} className="h-full">
            <Stat
              label="Late"
              tone="neg"
              value={String(live.filter((p) => p.due && p.due < t).length)}
            />
          </Glass>
        ),
      },
      {
        id: "projWorkspace",
        title: "Projects board & calendar",
        defaultSpan: 12,
        render: () => (
          <div>
            {/* View Switcher, Search, Health Filter & Board Visibility/Customization */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <SlidingTabs
                  layoutGroup="projects-view-tabs"
                  value={view}
                  onChange={setView}
                  options={[
                    { id: "board", label: "Board", icon: Columns3 },
                    { id: "timeline", label: "Timeline", icon: CalendarRange },
                    { id: "calendar", label: "Calendar", icon: CalendarDays },
                    { id: "list", label: "List", icon: List },
                  ]}
                />
                {(view === "board" || view === "list") && (
                  <div className="relative min-w-[180px] flex-1 sm:flex-none">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="search"
                      value={query}
                      onChange={(e) => {
                        setQuery(e.target.value);
                        setShowAllList(false);
                      }}
                      placeholder="Filter project or client…"
                      aria-label="Filter projects or clients"
                      className="field h-8 w-full py-1 pl-8 text-xs sm:w-48"
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-end gap-1.5">
                {(view === "board" || view === "list") && (
                  <div className="flex flex-wrap items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setHealthFilter("all");
                        setShowAllList(false);
                      }}
                      className={cn(
                        "font-num inline-flex min-h-[32px] items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                        healthFilter === "all"
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-secondary text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <span>All</span>
                      <span>{healthCounts.all}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setHealthFilter(
                          healthFilter === "healthy" ? "all" : "healthy",
                        );
                        setShowAllList(false);
                      }}
                      className={cn(
                        "font-num inline-flex min-h-[32px] items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                        healthFilter === "healthy"
                          ? "border-positive/55 bg-positive/20 text-positive"
                          : "border-border bg-secondary text-muted-foreground hover:border-positive/40 hover:text-positive",
                      )}
                    >
                      <span className="h-2 w-2 rounded-full bg-positive" />
                      <span>Healthy</span>
                      <span>{healthCounts.healthy}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setHealthFilter(
                          healthFilter === "at-risk" ? "all" : "at-risk",
                        );
                        setShowAllList(false);
                      }}
                      className={cn(
                        "font-num inline-flex min-h-[32px] items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                        healthFilter === "at-risk"
                          ? "border-warning/55 bg-warning/20 text-warning"
                          : "border-border bg-secondary text-muted-foreground hover:border-warning/40 hover:text-warning",
                      )}
                    >
                      <span className="h-2 w-2 rounded-full bg-warning" />
                      <span>At risk</span>
                      <span>{healthCounts["at-risk"]}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setHealthFilter(
                          healthFilter === "delayed" ? "all" : "delayed",
                        );
                        setShowAllList(false);
                      }}
                      className={cn(
                        "font-num inline-flex min-h-[32px] items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                        healthFilter === "delayed"
                          ? "border-destructive/55 bg-destructive/20 text-destructive"
                          : "border-border bg-secondary text-muted-foreground hover:border-destructive/40 hover:text-destructive",
                      )}
                    >
                      <span className="h-2 w-2 rounded-full bg-destructive" />
                      <span>Delayed</span>
                      <span>{healthCounts.delayed}</span>
                    </button>
                  </div>
                )}

                {view === "board" && (
                  <button
                    type="button"
                    onClick={() => setBoardsPanelOpen((s) => !s)}
                    className={cn(
                      "inline-flex min-h-[32px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-1 text-xs font-medium transition-colors",
                      boardsPanelOpen
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-border bg-secondary text-muted-foreground hover:bg-accent hover:text-foreground",
                    )}
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    <span>
                      Boards ({boardColumns.length}/{PROJECT_STATUSES.length})
                    </span>
                  </button>
                )}
              </div>
            </div>

            {view === "board" && boardsPanelOpen && (
              <Glass className="mb-4 p-4 sm:p-5">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="font-display text-sm font-bold">
                      Customize boards
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Show or hide any board, rename column titles, and pick a
                      color accent.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setAllBoardsVisibility(false)}
                      className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
                    >
                      Show all
                    </button>
                    <button
                      type="button"
                      onClick={() => setAllBoardsVisibility(true)}
                      className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
                    >
                      Active (5)
                    </button>
                    <button
                      type="button"
                      onClick={resetBoardConfigs}
                      className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Reset
                    </button>
                    <Btn
                      type="button"
                      variant="gold"
                      className="px-3 py-1 text-xs"
                      onClick={() => setBoardsPanelOpen(false)}
                    >
                      Done
                    </Btn>
                  </div>
                </div>

                <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {PROJECT_STATUSES.map((status) => {
                    const cfg = boardConfigs[status] ?? {
                      title: status,
                      colorId: "neutral",
                      visible: true,
                    };
                    const color = boardColorFor(cfg.colorId);
                    const count = db.projects.filter(
                      (p) => p.status === status,
                    ).length;

                    return (
                      <div
                        key={status}
                        className={cn(
                          "rounded-2xl border p-3 transition-colors",
                          cfg.visible
                            ? "border-border bg-muted/50"
                            : "border-border/50 bg-muted/20 opacity-75",
                        )}
                      >
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <div className="flex min-w-0 items-center gap-2">
                            <span
                              className="h-2.5 w-2.5 shrink-0 rounded-full"
                              style={{ background: color.dot }}
                            />
                            <span className="font-num truncate text-[0.68rem] uppercase tracking-wider text-muted-foreground">
                              {status} · {count}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              updateBoardConfig(status, {
                                visible: !cfg.visible,
                              })
                            }
                            aria-label={`${cfg.visible ? "Hide" : "Show"} ${cfg.title} board`}
                            className={cn(
                              "inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[0.68rem] font-medium transition-colors",
                              cfg.visible
                                ? "border-primary/40 bg-primary/15 text-primary"
                                : "border-border bg-background/60 text-muted-foreground hover:text-foreground",
                            )}
                          >
                            {cfg.visible ? (
                              <>
                                <Eye className="h-3 w-3" />
                                Shown
                              </>
                            ) : (
                              <>
                                <EyeOff className="h-3 w-3" />
                                Hidden
                              </>
                            )}
                          </button>
                        </div>

                        <input
                          className="field h-8 text-xs font-medium"
                          value={cfg.title}
                          placeholder={status}
                          aria-label={`Title for ${status} board`}
                          onChange={(e) =>
                            updateBoardConfig(status, { title: e.target.value })
                          }
                          onBlur={(e) => {
                            if (!e.target.value.trim()) {
                              updateBoardConfig(status, { title: status });
                            }
                          }}
                        />

                        <div className="mt-2.5 flex items-center gap-1.5">
                          {BOARD_COLORS.map((preset) => {
                            const selected = cfg.colorId === preset.id;
                            return (
                              <button
                                key={preset.id}
                                type="button"
                                title={preset.label}
                                aria-label={`Set ${cfg.title} color to ${preset.label}`}
                                onClick={() =>
                                  updateBoardConfig(status, {
                                    colorId: preset.id,
                                  })
                                }
                                className={cn(
                                  "h-5 w-5 rounded-full border transition-transform hover:scale-110",
                                  selected
                                    ? "scale-110 ring-2 ring-foreground/80 ring-offset-2 ring-offset-background"
                                    : "border-white/15 opacity-80 hover:opacity-100",
                                )}
                                style={{ background: preset.dot }}
                              />
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Glass>
            )}

            {view === "board" && (
              <DndContext
                sensors={sensors}
                onDragStart={handleBoardDragStart}
                onDragEnd={handleBoardDragEnd}
              >
                {boardColumns.length === 0 ? (
                  <Glass>
                    <div className="flex flex-col items-center gap-3 py-8 text-center">
                      <p className="text-sm text-muted-foreground">
                        All boards are currently hidden.
                      </p>
                      <Btn
                        type="button"
                        variant="gold"
                        onClick={() => setAllBoardsVisibility(false)}
                      >
                        <Eye className="h-4 w-4" />
                        Show all boards
                      </Btn>
                    </div>
                  </Glass>
                ) : (
                  <div
                    className={cn(
                      boardColumns.length <= 5
                        ? boardColumns.length <= 3
                          ? "grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-[repeat(var(--cols),minmax(0,1fr))]"
                          : "grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[repeat(var(--cols),minmax(0,1fr))]"
                        : "flex gap-3.5 overflow-x-auto pb-3",
                    )}
                    style={
                      boardColumns.length <= 5
                        ? ({
                            "--cols": String(boardColumns.length),
                          } as CSSProperties)
                        : undefined
                    }
                  >
                    {boardColumns.map((status) => {
                      const colProjects = db.projects.filter((p) => {
                        if (p.status !== status) return false;
                        if (healthFilter !== "all") {
                          if (
                            projectHealthMap.get(p.id)?.status !== healthFilter
                          ) {
                            return false;
                          }
                        }
                        if (!matchesSearch(p)) return false;
                        return true;
                      });
                      const isColExpanded = Boolean(expandedCols[status]);
                      const visibleColProjects = isColExpanded
                        ? colProjects
                        : colProjects.slice(0, BOARD_COL_LIMIT);
                      const colHasMore = colProjects.length > BOARD_COL_LIMIT;
                      const cfg = boardConfigs[status] ?? {
                        title: status,
                        colorId: "neutral",
                        visible: true,
                      };
                      const color = boardColorFor(cfg.colorId);

                      return (
                        <BoardColumn
                          key={status}
                          status={status}
                          title={cfg.title}
                          color={color}
                          count={colProjects.length}
                          fitGrid={boardColumns.length <= 5}
                          isEditingMeta={editingBoardCol === status}
                          onToggleEditMeta={() =>
                            setEditingBoardCol((cur) =>
                              cur === status ? null : status,
                            )
                          }
                          onChangeTitle={(title) =>
                            updateBoardConfig(status, { title })
                          }
                          onChangeColor={(colorId) =>
                            updateBoardConfig(status, { colorId })
                          }
                          onHide={() => {
                            if (editingBoardCol === status) {
                              setEditingBoardCol(null);
                            }
                            updateBoardConfig(status, { visible: false });
                          }}
                          onAdd={() => setEdit(blank({ status }))}
                        >
                          {colProjects.length === 0 ? (
                            <p className="rounded-lg border border-dashed border-border/70 py-6 text-center text-xs text-muted-foreground">
                              Drop project here
                            </p>
                          ) : (
                            <>
                              {visibleColProjects.map((p) => {
                                const billing = projectBilling(p);
                                const health =
                                  projectHealthMap.get(p.id) ??
                                  getProjectHealth(p, t);
                                return (
                                  <BoardCard
                                    key={p.id}
                                    project={p}
                                    clientName={
                                      db.clients.find(
                                        (c) => c.id === p.clientId,
                                      )?.name ?? "No client"
                                    }
                                    docsCount={billing.docs.length}
                                    paidUSD={billing.paid}
                                    health={health}
                                    onOpen={() => setEdit(p)}
                                    onAdvanceStage={() =>
                                      advanceProjectStage(p)
                                    }
                                  />
                                );
                              })}
                              {colHasMore && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedCols((prev) => ({
                                      ...prev,
                                      [status]: !isColExpanded,
                                    }))
                                  }
                                  className="mt-1 inline-flex w-full items-center justify-center gap-1 rounded-xl border border-border/80 bg-background/40 px-2.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                                >
                                  {isColExpanded ? (
                                    <>
                                      <ChevronUp className="h-3.5 w-3.5" />
                                      Hide (
                                      {colProjects.length - BOARD_COL_LIMIT})
                                    </>
                                  ) : (
                                    <>
                                      <ChevronDown className="h-3.5 w-3.5" />
                                      Show all ({colProjects.length})
                                    </>
                                  )}
                                </button>
                              )}
                            </>
                          )}
                        </BoardColumn>
                      );
                    })}
                  </div>
                )}
                <DragOverlay>
                  {activeDragged ? (
                    <div className="glass-strong w-72 rounded-2xl border border-primary/60 p-3.5 shadow-2xl">
                      <p className="font-num text-[0.68rem] text-muted-foreground">
                        {activeDragged.code}
                      </p>
                      <p className="mt-0.5 break-words font-medium">
                        {activeDragged.name || "Untitled"}
                      </p>
                      <p className="font-num mt-1 text-xs text-primary">
                        {money(activeDragged.quote)}
                      </p>
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            )}

            {view === "timeline" && (
              <ProjectTimelineView
                projects={db.projects}
                clients={db.clients}
                services={db.services}
                boardConfigs={boardConfigs}
                todayStr={t}
                getBilling={projectBilling}
                onSelectProject={(p) => setEdit(p)}
                onAdjustDates={(p, start, due) => {
                  try {
                    setDB((d) => updateProject(d, { ...p, start, due }));
                    toast.success(
                      `Updated ${p.name || p.code} (${shortDate(start)} – ${shortDate(due)})`,
                    );
                  } catch (err) {
                    toast.error(
                      err instanceof Error
                        ? err.message
                        : "Unable to update timeline",
                    );
                  }
                }}
              />
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
                        [
                          "Quoted",
                          "In production",
                          "Delivered",
                          "Closed",
                        ] as const
                      ).map((st) => {
                        const cfg = boardConfigs[st];
                        const color = boardColorFor(cfg?.colorId ?? "sky");
                        return (
                          <span
                            key={st}
                            className="inline-flex items-center gap-1.5"
                          >
                            <span
                              className="h-2.5 w-2.5 rounded-full"
                              style={{ background: color.calBg }}
                            />
                            {cfg?.title || st}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  {!isDesktopMd ? (
                    scheduledMobileProjects.length === 0 ? (
                      <Empty>No scheduled project dates yet.</Empty>
                    ) : (
                      <ul className="divide-y divide-border/70">
                        {scheduledMobileProjects.map((p) => {
                          const clientName =
                            db.clients.find((c) => c.id === p.clientId)?.name ??
                            "No client";
                          const health =
                            projectHealthMap.get(p.id) ??
                            getProjectHealth(p, t);
                          return (
                            <li
                              key={p.id}
                              className="flex items-center justify-between gap-3 py-2.5"
                            >
                              <button
                                type="button"
                                onClick={() => setEdit(p)}
                                className="min-w-0 flex-1 text-left"
                              >
                                <div className="flex items-center gap-1.5">
                                  <span className="font-num text-[0.68rem] text-muted-foreground">
                                    {p.code}
                                  </span>
                                  <span className="truncate text-sm font-semibold text-foreground">
                                    {p.name || "Untitled"}
                                  </span>
                                </div>
                                <p className="font-num mt-0.5 truncate text-xs text-muted-foreground">
                                  {clientName} ·{" "}
                                  {p.start ? `${shortDate(p.start)} → ` : ""}
                                  {p.due ? shortDate(p.due) : "No due date"}
                                </p>
                              </button>
                              <div className="flex shrink-0 items-center gap-1.5">
                                <Pill s={health.label} />
                                {nextProjectStage(p.status) && (
                                  <button
                                    type="button"
                                    onClick={() => advanceProjectStage(p)}
                                    className="inline-flex min-h-[30px] items-center rounded-md border border-primary/35 bg-primary/12 px-2 text-[0.68rem] font-semibold text-primary"
                                  >
                                    →
                                  </button>
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )
                  ) : (
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
                        events={calendarEvents}
                        dateClick={onCalendarDateClick}
                        select={onCalendarSelect}
                        eventClick={onCalendarEventClick}
                        eventDrop={onCalendarEventDrop}
                        eventResize={onCalendarEventResize}
                      />
                    </div>
                  )}
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
                      onClick={() => {
                        setF(x);
                        setShowAllList(false);
                      }}
                      className={cn(
                        "rounded-lg border border-border px-3 py-1 text-xs font-medium transition-colors",
                        f === x
                          ? "border-primary bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground hover:bg-accent hover:text-foreground",
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
                  <>
                    <ul className="divide-y divide-border">
                      {visibleListRows.map((p, k) => {
                        const c = cost(p);
                        const billing = projectBilling(p);
                        const health =
                          projectHealthMap.get(p.id) ?? getProjectHealth(p, t);
                        const nextStage = nextProjectStage(p.status);
                        return (
                          <li
                            key={p.id}
                            className="rise"
                            style={{
                              animationDelay: `${Math.min(k, 12) * 25}ms`,
                            }}
                          >
                            <SwipeRow
                              onEdit={() => setEdit(p)}
                              onDelete={() => deleteProjectFromList(p)}
                            >
                              <div className="flex items-center justify-between gap-2 rounded-lg px-2 py-2.5 hover:bg-muted">
                                <button
                                  type="button"
                                  onClick={() => setEdit(p)}
                                  className="min-w-0 flex-1 text-left"
                                >
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="truncate font-medium">
                                      {p.name || "Untitled"}{" "}
                                      <span className="font-num text-xs text-muted-foreground">
                                        {p.code}
                                      </span>
                                    </p>
                                    <Pill s={health.label} />
                                  </div>
                                  <p
                                    className={cn(
                                      "mt-0.5 truncate text-xs text-muted-foreground",
                                      health.status === "delayed" &&
                                        "text-destructive",
                                      health.status === "at-risk" &&
                                        "text-warning",
                                    )}
                                  >
                                    {db.clients.find((x) => x.id === p.clientId)
                                      ?.name ?? "No client"}{" "}
                                    ·{" "}
                                    {p.start ? `${shortDate(p.start)} → ` : ""}
                                    due {shortDate(p.due)} · {health.reason}
                                    {billing.docs.length > 0 &&
                                      ` · ${billing.docs.length} docs`}
                                  </p>
                                  {(p.media?.length ?? 0) > 0 && (
                                    <div className="mt-1">
                                      <MediaCountBadge media={p.media} />
                                    </div>
                                  )}
                                </button>
                                <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                                  <div className="text-right">
                                    <p className="font-num text-sm">
                                      {money(p.quote)}
                                    </p>
                                    {billing.paid > 0 && (
                                      <p className="text-xs text-positive tabular-nums">
                                        {money(billing.paid)} paid
                                      </p>
                                    )}
                                    {c > 0 && (
                                      <p className="text-xs text-muted-foreground tabular-nums">
                                        margin {money(p.quote - c)}
                                      </p>
                                    )}
                                  </div>
                                  <Pill s={p.status} />
                                  {nextStage && (
                                    <button
                                      type="button"
                                      onClick={() => advanceProjectStage(p)}
                                      title={`Move to ${nextStage}`}
                                      className="hidden min-h-[30px] items-center gap-1 rounded-md border border-primary/35 bg-primary/12 px-2 text-[0.68rem] font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground sm:inline-flex"
                                    >
                                      <ArrowRight className="h-3 w-3" />
                                      <span>{nextStage}</span>
                                    </button>
                                  )}
                                  <Link
                                    to="/invoices/$id"
                                    params={{ id: "new" }}
                                    search={{
                                      project: p.id,
                                      kind: "Invoice",
                                      ...(p.clientId
                                        ? { client: p.clientId }
                                        : {}),
                                      ...(p.serviceId
                                        ? { service: p.serviceId }
                                        : {}),
                                    }}
                                    className="hidden min-h-[30px] items-center rounded-md border border-border bg-secondary px-2 text-[0.68rem] font-medium text-foreground transition-colors hover:border-primary/45 hover:text-primary md:inline-flex"
                                  >
                                    + Inv
                                  </Link>
                                </div>
                              </div>
                            </SwipeRow>
                          </li>
                        );
                      })}
                    </ul>
                    {rows.length > LIST_LIMIT && (
                      <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/70 pt-3 text-xs text-muted-foreground">
                        <span>
                          Showing {visibleListRows.length} of {rows.length}{" "}
                          projects
                        </span>
                        <Btn
                          type="button"
                          onClick={() => setShowAllList((s) => !s)}
                          className="px-3.5 py-1.5 text-xs"
                        >
                          {showAllList ? (
                            <>
                              <ChevronUp className="h-3.5 w-3.5" />
                              Hide ({rows.length - LIST_LIMIT})
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-3.5 w-3.5" />
                              Show all ({rows.length})
                            </>
                          )}
                        </Btn>
                      </div>
                    )}
                  </>
                )}
              </Glass>
            )}
          </div>
        ),
      },
    ],
    [
      live,
      pipelineTotal,
      t,
      view,
      boardConfigs,
      boardsPanelOpen,
      editingBoardCol,
      sensors,
      boardColumns,
      db,
      expandedCols,
      activeDragged,
      calendarEvents,
      unscheduledProjects,
      f,
      healthFilter,
      healthCounts,
      projectHealthMap,
      rows,
      visibleListRows,
      showAllList,
      isDesktopMd,
      query,
      matchesSearch,
      scheduledMobileProjects,
      cost,
      projectBilling,
      blank,
      advanceProjectStage,
      deleteProjectFromList,
      handleBoardDragStart,
      handleBoardDragEnd,
      onCalendarDateClick,
      onCalendarSelect,
      onCalendarEventClick,
      onCalendarEventDrop,
      onCalendarEventResize,
    ],
  );

  return (
    <>
      <PageHeader
        title="Projects"
        owner={db.settings.ownerName}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <EditLayoutButton
              editing={editingLayout}
              onToggle={() => setEditingLayout((e) => !e)}
            />
            <Btn variant="gold" onClick={() => setEdit(blank())}>
              <Plus className="h-4 w-4" />
              New project
            </Btn>
          </div>
        }
      />

      <EditableBentoGrid
        pageKey="projects"
        widgets={widgets}
        editing={editingLayout}
        onToggleEditing={() => setEditingLayout((e) => !e)}
        onDoneEditing={() => setEditingLayout(false)}
      />

      <EditModal
        presentation="drawer"
        side="right"
        item={edit}
        fields={fields}
        subtitle={edit?.status || "Project"}
        title={edit?.name || edit?.code || "Project"}
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
        footerExtra={(proj, patchProj) => {
          const isExisting = db.projects.some((p) => p.id === proj.id);
          const linkedDocs = isExisting
            ? db.invoices.filter((i) => i.projectId === proj.id)
            : [];
          const svc = db.services.find((s) => s.id === proj.serviceId);
          const client = db.clients.find((c) => c.id === proj.clientId);
          return (
            <div className="space-y-3">
              <div className="rounded-2xl border border-border bg-muted/40 p-3">
                <span className="label-mono mb-2 block">
                  Design mockups &amp; PDFs
                </span>
                <DesignMediaUploader
                  compact
                  media={proj.media ?? []}
                  onChange={(media) => patchProj({ media })}
                  onPreview={(m) =>
                    setPreviewLightbox({
                      mediaId: m.id,
                      item: {
                        id: proj.id,
                        source: "studio",
                        code: proj.code,
                        title: proj.name || proj.code || "Project",
                        subtitle: client?.name || "Freelance Studio",
                        projectGroup: client?.name || "Freelance Studio",
                        designType: inferStudioDesignType(proj, svc),
                        status: proj.status,
                        completed:
                          proj.status === "Delivered" ||
                          proj.status === "Closed",
                        date: proj.delivered || proj.due || proj.start || "",
                        artworkCount: Math.max(
                          1,
                          Number(proj.artworkCount) || 1,
                        ),
                        media: proj.media ?? [],
                        notes: "",
                        featured: Boolean(proj.featured),
                      },
                    })
                  }
                />
              </div>

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
                        className="font-num inline-flex items-center gap-1 rounded-full border border-border bg-background/60 px-2.5 py-1 hover:border-primary"
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
                            db.services.find(
                              (s) => s.id === savedProj.serviceId,
                            )?.name || "Design project";
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
            </div>
          );
        }}
        onDelete={
          db.projects.some((p) => p.id === edit?.id)
            ? (v) => {
                const blocker = projectDeleteBlocker(db, v.id);
                if (blocker) {
                  toast.error(blocker);
                  return false;
                }
                setDB((d) => ({
                  ...d,
                  projects: d.projects.filter((p) => p.id !== v.id),
                }));
                toast.success("Project deleted");
                return true;
              }
            : undefined
        }
      />

      <MediaLightboxViewer
        item={previewLightbox?.item ?? null}
        initialMediaId={previewLightbox?.mediaId}
        onClose={() => setPreviewLightbox(null)}
      />
    </>
  );
}

function BoardColumn({
  status,
  title,
  color,
  count,
  fitGrid = false,
  isEditingMeta,
  onToggleEditMeta,
  onChangeTitle,
  onChangeColor,
  onHide,
  onAdd,
  children,
}: {
  status: string;
  title: string;
  color: BoardColorPreset;
  count: number;
  fitGrid?: boolean;
  isEditingMeta: boolean;
  onToggleEditMeta: () => void;
  onChangeTitle: (nextTitle: string) => void;
  onChangeColor: (nextColorId: string) => void;
  onHide: () => void;
  onAdd: () => void;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <div
      ref={setNodeRef}
      style={{
        borderColor: isOver ? color.dot : color.colBorder,
      }}
      className={cn(
        "glass flex min-h-72 flex-col rounded-xl p-3.5 transition-colors",
        fitGrid ? "w-full min-w-0" : "w-[275px] min-w-[275px] shrink-0",
        isOver && "bg-primary/10",
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="inline-flex max-w-[175px] items-center gap-1.5 rounded-md border px-2.5 py-0.5 text-[0.7rem] font-semibold uppercase tracking-wider"
            style={{
              backgroundColor: color.headerBg,
              borderColor: color.headerBorder,
              color: color.pillText,
            }}
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: color.dot }}
            />
            <span className="truncate">{title || status}</span>
          </span>
          <span className="font-num text-xs text-muted-foreground">
            {count}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            onClick={onToggleEditMeta}
            className={cn(
              "rounded-md p-1.5 transition-colors",
              isEditingMeta
                ? "bg-primary/20 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
            title="Edit board title & color"
            aria-label={`Edit ${title || status} board`}
          >
            <Palette className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onHide}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
            title="Hide this board"
            aria-label={`Hide ${title || status} board`}
          >
            <EyeOff className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onAdd}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
            title={`Add project in ${title || status}`}
            aria-label={`Add project in ${title || status}`}
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {isEditingMeta && (
        <div className="mb-3 space-y-2 rounded-xl border border-border bg-background/70 p-2.5 text-xs">
          <input
            className="field h-8 text-xs font-medium"
            value={title}
            placeholder={status}
            aria-label={`Rename ${status} board`}
            onChange={(e) => onChangeTitle(e.target.value)}
            onBlur={(e) => {
              if (!e.target.value.trim()) onChangeTitle(status);
            }}
          />
          <div className="flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5">
              {BOARD_COLORS.map((preset) => {
                const selected = color.id === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    title={preset.label}
                    aria-label={`Color ${preset.label}`}
                    onClick={() => onChangeColor(preset.id)}
                    className={cn(
                      "h-4 w-4 rounded-full border transition-transform hover:scale-110",
                      selected
                        ? "scale-110 ring-2 ring-foreground/80 ring-offset-1 ring-offset-background"
                        : "border-white/15 opacity-80 hover:opacity-100",
                    )}
                    style={{ backgroundColor: preset.dot }}
                  />
                );
              })}
            </div>
            <button
              type="button"
              onClick={onToggleEditMeta}
              className="rounded-md px-2 py-0.5 text-[0.68rem] font-medium text-primary hover:bg-primary/15"
            >
              Done
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col gap-2.5">{children}</div>
    </div>
  );
}

function BoardCard({
  project,
  clientName,
  docsCount,
  paidUSD,
  health,
  onOpen,
  onAdvanceStage,
}: {
  project: Project;
  clientName: string;
  docsCount: number;
  paidUSD: number;
  health: ProjectHealth;
  onOpen: () => void;
  onAdvanceStage: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: project.id });
  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined;
  const nextStage = nextProjectStage(project.status);
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
        "group cursor-grab touch-none rounded-xl border border-border bg-muted/60 p-3 text-left transition-all hover:border-primary/50 hover:bg-muted active:cursor-grabbing",
        isDragging && "opacity-40",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-num text-[0.68rem] text-muted-foreground">
              {project.code}
            </span>
            <Pill s={health.label} />
          </div>
          <p className="mt-1 break-words text-sm font-semibold leading-snug">
            {project.name || "Untitled"}
          </p>
          <p className="mt-0.5 break-words text-xs leading-relaxed text-muted-foreground">
            {clientName}
          </p>
        </div>
        <span className="shrink-0 rounded-lg p-1 text-muted-foreground group-hover:text-foreground">
          <GripVertical className="h-4 w-4" />
        </span>
      </div>
      <div className="mt-2.5 flex w-full flex-wrap items-center justify-between gap-x-2 gap-y-1 border-t border-border/60 pt-2 text-xs">
        <span
          className={cn(
            "font-num text-muted-foreground",
            health.status === "delayed" && "font-medium text-destructive",
            health.status === "at-risk" && "font-medium text-warning",
          )}
        >
          {project.due
            ? `Due ${shortDate(project.due)} · ${health.reason}`
            : health.reason}
        </span>
        <span className="font-num font-medium">
          {compactMoney(project.quote)}
          {paidUSD > 0 ? (
            <span className="ml-1 text-positive">
              ({compactMoney(paidUSD)})
            </span>
          ) : null}
        </span>
      </div>
      {(docsCount > 0 || (project.media?.length ?? 0) > 0) && (
        <div className="mt-1 flex flex-wrap items-center gap-2">
          {docsCount > 0 && (
            <span className="font-num text-[0.65rem] text-muted-foreground">
              {docsCount} linked doc{docsCount > 1 ? "s" : ""}
            </span>
          )}
          <MediaCountBadge media={project.media} />
        </div>
      )}
      <div
        className="mt-2 flex items-center justify-between gap-1.5 border-t border-border/50 pt-2"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {nextStage ? (
          <button
            type="button"
            onClick={onAdvanceStage}
            className="inline-flex min-h-[28px] items-center gap-1 rounded-md border border-primary/35 bg-primary/12 px-2 text-[0.68rem] font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            <ArrowRight className="h-3 w-3 shrink-0" />
            <span>{nextStage}</span>
          </button>
        ) : (
          <span className="text-[0.65rem] text-muted-foreground">
            {project.status}
          </span>
        )}
        <Link
          to="/invoices/$id"
          params={{ id: "new" }}
          search={{
            project: project.id,
            kind: project.status === "Inquiry" ? "Quotation" : "Invoice",
            ...(project.clientId ? { client: project.clientId } : {}),
            ...(project.serviceId ? { service: project.serviceId } : {}),
          }}
          className="inline-flex min-h-[28px] items-center rounded-md border border-border bg-secondary px-2 text-[0.68rem] font-medium text-foreground transition-colors hover:border-primary/45 hover:text-primary"
        >
          {project.status === "Inquiry" ? "+ Quote" : "+ Invoice"}
        </Link>
      </div>
    </div>
  );
}

/* ---------- Visual Horizontal Timeline (Gantt) View ---------- */

const DAY_MS = 86_400_000;

function parseUtcDay(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return NaN;
  return Date.UTC(y, m - 1, d);
}

function ProjectTimelineView({
  projects,
  clients,
  services,
  boardConfigs,
  todayStr,
  getBilling,
  onSelectProject,
  onAdjustDates,
}: {
  projects: Project[];
  clients: { id: string; name: string }[];
  services: { id: string; timeline: string }[];
  boardConfigs: Record<string, BoardConfig>;
  todayStr: string;
  getBilling: (p: Project) => { billed: number; paid: number };
  onSelectProject: (p: Project) => void;
  onAdjustDates: (p: Project, start: string, due: string) => void;
}) {
  const [zoom, setZoom] = useState<"month" | "quarter">("month");
  const [statusFilter, setStatusFilter] = useState<string>("active");
  const [anchorStart, setAnchorStart] = useState<string>(() =>
    addDays(todayStr, -10),
  );
  const trackScrollRef = useRef<HTMLDivElement>(null);

  const spanDays = zoom === "month" ? 30 : 90;
  const windowEnd = addDays(anchorStart, spanDays - 1);
  const winStartMs = parseUtcDay(anchorStart);
  const totalMs = spanDays * DAY_MS;

  const tickDates = useMemo(() => {
    const step = zoom === "month" ? 3 : 7;
    const list: { iso: string; label: string; pct: number }[] = [];
    for (let i = 0; i < spanDays; i += step) {
      const iso = addDays(anchorStart, i);
      const dt = new Date(iso + "T00:00:00Z");
      list.push({
        iso,
        label: dt.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          timeZone: "UTC",
        }),
        pct: (i / spanDays) * 100,
      });
    }
    return list;
  }, [anchorStart, spanDays, zoom]);

  const todayMs = parseUtcDay(todayStr);
  const todayPct = ((todayMs - winStartMs) / totalMs) * 100;
  const showTodayLine = todayPct >= 0 && todayPct <= 100;

  const filteredScheduled = useMemo(() => {
    return projects
      .filter((p) => {
        if (!p.start && !p.due) return false;
        if (statusFilter === "active") {
          return !["Closed", "Lost"].includes(p.status);
        }
        if (statusFilter !== "all") return p.status === statusFilter;
        return true;
      })
      .sort((a, b) => (a.start || a.due).localeCompare(b.start || b.due));
  }, [projects, statusFilter]);

  const unscheduled = useMemo(
    () =>
      projects.filter(
        (p) => !p.start && !p.due && !["Closed", "Lost"].includes(p.status),
      ),
    [projects],
  );

  const windowLabel = `${shortDate(anchorStart)} – ${shortDate(windowEnd)}`;

  return (
    <div className="space-y-4">
      <Glass delay={80}>
        {/* Timeline Controls */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1 rounded-full border border-border bg-muted p-1">
              <button
                type="button"
                onClick={() =>
                  setAnchorStart(
                    addDays(anchorStart, zoom === "month" ? -14 : -30),
                  )
                }
                aria-label="Previous period"
                className="rounded-full p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setAnchorStart(addDays(todayStr, -10))}
                className="rounded-full px-2.5 py-1 text-xs font-medium text-foreground hover:bg-accent"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() =>
                  setAnchorStart(
                    addDays(anchorStart, zoom === "month" ? 14 : 30),
                  )
                }
                aria-label="Next period"
                className="rounded-full p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <span className="font-num text-xs text-muted-foreground">
              {windowLabel}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <SlidingTabs
              size="xs"
              layoutGroup="proj-tl-scope"
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { id: "active", label: "Active" },
                { id: "In production", label: "Production" },
                { id: "Delivered", label: "Delivered" },
                { id: "all", label: "All" },
              ]}
            />
            <SlidingTabs
              size="xs"
              tone="invert"
              layoutGroup="proj-tl-zoom"
              value={zoom}
              onChange={setZoom}
              options={[
                { id: "month", label: "30 days" },
                { id: "quarter", label: "90 days" },
              ]}
            />
          </div>
        </div>

        {/* Status & Milestone Legend */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-[0.72rem] text-muted-foreground">
          <div className="flex flex-wrap items-center gap-3">
            {PROJECT_STATUSES.slice(0, 5).map((st) => {
              const cfg = boardConfigs[st];
              const color = boardColorFor(cfg?.colorId ?? "sky");
              return (
                <span key={st} className="inline-flex items-center gap-1.5">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: color.dot }}
                  />
                  {cfg?.title || st}
                </span>
              );
            })}
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <Flag className="h-3 w-3 text-primary" /> Due milestone
            </span>
            <span className="inline-flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-positive" /> Delivered
            </span>
          </div>
        </div>

        {filteredScheduled.length === 0 ? (
          <Empty>
            No scheduled projects in this filter. Schedule projects below or
            switch to All.
          </Empty>
        ) : (
          <div
            ref={trackScrollRef}
            className="overflow-x-auto rounded-2xl border border-border/70 bg-muted/20"
          >
            <div className="min-w-[820px]">
              {/* Header Dates Row */}
              <div className="grid grid-cols-[235px_minmax(0,1fr)] border-b border-border bg-muted/45">
                <div className="px-3.5 py-2.5 text-[0.68rem] font-semibold uppercase tracking-wider text-muted-foreground">
                  Project & deadline ({filteredScheduled.length})
                </div>
                <div className="relative h-9 border-l border-border">
                  {tickDates.map((tk) => (
                    <span
                      key={tk.iso}
                      style={{ left: `${tk.pct}%` }}
                      className="font-num absolute top-1/2 -translate-y-1/2 border-l border-border/60 pl-1.5 text-[0.66rem] text-muted-foreground"
                    >
                      {tk.label}
                    </span>
                  ))}
                  {showTodayLine && (
                    <span
                      style={{ left: `${todayPct}%` }}
                      className="font-num absolute top-1 z-10 -translate-x-1/2 rounded-full bg-primary px-1.5 py-0.5 text-[0.58rem] font-bold text-primary-foreground"
                    >
                      Today
                    </span>
                  )}
                </div>
              </div>

              {/* Project Rows */}
              <div className="divide-y divide-border/60">
                {filteredScheduled.map((p) => {
                  const startIso = p.start || p.due;
                  const dueIso = p.due && p.due >= startIso ? p.due : startIso;
                  const sMs = parseUtcDay(startIso);
                  const eMs = parseUtcDay(dueIso) + DAY_MS;

                  const rawLeft = ((sMs - winStartMs) / totalMs) * 100;
                  const rawRight = ((eMs - winStartMs) / totalMs) * 100;
                  const inWindow = rawRight > 0 && rawLeft < 100;
                  const clampedLeft = Math.max(0, rawLeft);
                  const clampedRight = Math.min(100, rawRight);
                  const widthPct = Math.max(2.5, clampedRight - clampedLeft);

                  const cfg = boardConfigs[p.status];
                  const color = boardColorFor(cfg?.colorId ?? "sky");
                  const clientName =
                    clients.find((c) => c.id === p.clientId)?.name ??
                    "No client";
                  const billing = getBilling(p);
                  const late =
                    p.status === "In production" &&
                    Boolean(p.due && p.due < todayStr);

                  const progressPct =
                    p.status === "Closed"
                      ? 100
                      : p.status === "Delivered"
                        ? 92
                        : p.status === "In production"
                          ? billing.billed > 0 && billing.paid > 0
                            ? Math.min(
                                88,
                                Math.max(
                                  35,
                                  Math.round(
                                    (billing.paid / billing.billed) * 100,
                                  ),
                                ),
                              )
                            : 55
                          : p.status === "Quoted"
                            ? 28
                            : 15;

                  return (
                    <div
                      key={p.id}
                      className="grid grid-cols-[235px_minmax(0,1fr)] items-center transition-colors hover:bg-muted/35"
                    >
                      {/* Sticky Left Summary */}
                      <div className="flex items-center justify-between gap-2 px-3 py-2.5">
                        <button
                          type="button"
                          onClick={() => onSelectProject(p)}
                          className="min-w-0 flex-1 text-left"
                        >
                          <div className="flex items-center gap-1.5">
                            <span
                              className="h-2 w-2 shrink-0 rounded-full"
                              style={{ background: color.dot }}
                            />
                            <span className="truncate text-xs font-semibold text-foreground hover:text-primary">
                              {p.name || p.code}
                            </span>
                          </div>
                          <p className="mt-0.5 truncate text-[0.68rem] text-muted-foreground">
                            {clientName} · {shortDate(startIso)} →{" "}
                            {shortDate(dueIso)}
                          </p>
                        </button>
                        <div className="flex shrink-0 items-center gap-0.5">
                          <button
                            type="button"
                            title="Shorten due date by 3 days"
                            onClick={() =>
                              onAdjustDates(
                                p,
                                startIso,
                                addDays(dueIso, -3) >= startIso
                                  ? addDays(dueIso, -3)
                                  : startIso,
                              )
                            }
                            className="font-num rounded-md border border-border/70 px-1.5 py-0.5 text-[0.62rem] text-muted-foreground hover:border-primary/50 hover:text-foreground"
                          >
                            -3d
                          </button>
                          <button
                            type="button"
                            title="Extend due date by 3 days"
                            onClick={() =>
                              onAdjustDates(p, startIso, addDays(dueIso, 3))
                            }
                            className="font-num rounded-md border border-border/70 px-1.5 py-0.5 text-[0.62rem] text-muted-foreground hover:border-primary/50 hover:text-foreground"
                          >
                            +3d
                          </button>
                        </div>
                      </div>

                      {/* Horizontal Gantt Bar Track */}
                      <div className="relative h-12 border-l border-border/70">
                        {tickDates.map((tk) => (
                          <div
                            key={tk.iso}
                            style={{ left: `${tk.pct}%` }}
                            className="pointer-events-none absolute inset-y-0 border-l border-border/35"
                          />
                        ))}
                        {showTodayLine && (
                          <div
                            style={{ left: `${todayPct}%` }}
                            className="pointer-events-none absolute inset-y-0 z-10 w-px bg-primary/70"
                          />
                        )}

                        {inWindow ? (
                          <button
                            type="button"
                            onClick={() => onSelectProject(p)}
                            style={{
                              left: `${clampedLeft}%`,
                              width: `${widthPct}%`,
                              backgroundColor: color.headerBg,
                              borderColor: late
                                ? "var(--destructive)"
                                : color.headerBorder,
                            }}
                            title={`${p.code} ${p.name} · ${p.status} (${shortDate(startIso)} – ${shortDate(dueIso)}) · ${compactMoney(p.quote)}`}
                            className="group absolute top-1/2 z-20 flex h-7 -translate-y-1/2 items-center overflow-hidden rounded-full border px-2.5 text-left shadow-sm transition-transform hover:scale-[1.015]"
                          >
                            {/* Progress Fill */}
                            <span
                              style={{
                                width: `${progressPct}%`,
                                backgroundColor: color.dot,
                              }}
                              className="pointer-events-none absolute inset-y-0 left-0 opacity-30 transition-all"
                            />
                            <span className="relative z-10 flex w-full items-center justify-between gap-2 text-[0.7rem] font-medium">
                              <span
                                className="truncate font-semibold"
                                style={{ color: color.pillText }}
                              >
                                {p.code} · {p.name}
                              </span>
                              <span className="font-num flex shrink-0 items-center gap-1 text-[0.64rem] text-foreground/85">
                                {p.delivered ? (
                                  <CheckCircle2 className="h-3 w-3 text-positive" />
                                ) : (
                                  <Flag
                                    className={cn(
                                      "h-3 w-3",
                                      late
                                        ? "text-destructive"
                                        : "text-primary",
                                    )}
                                  />
                                )}
                                <span>{compactMoney(p.quote)}</span>
                              </span>
                            </span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              setAnchorStart(addDays(startIso, -4))
                            }
                            className="font-num absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-border/70 bg-muted/60 px-2.5 py-0.5 text-[0.65rem] text-muted-foreground hover:border-primary/50 hover:text-foreground"
                          >
                            {rawRight <= 0 ? "← " : ""}
                            {shortDate(startIso)} – {shortDate(dueIso)}
                            {rawLeft >= 100 ? " →" : ""}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </Glass>

      {unscheduled.length > 0 && (
        <Glass delay={120}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-sm font-bold">
              Unscheduled projects ({unscheduled.length})
            </h2>
            <span className="text-xs text-muted-foreground">
              Click Schedule to place on the timeline starting today
            </span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {unscheduled.map((p) => {
              const clientName =
                clients.find((c) => c.id === p.clientId)?.name ?? "No client";
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-2 rounded-2xl border border-border bg-muted/50 p-2.5"
                >
                  <button
                    type="button"
                    onClick={() => onSelectProject(p)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className="truncate text-xs font-semibold">
                      {p.name || p.code}
                    </p>
                    <p className="truncate text-[0.68rem] text-muted-foreground">
                      {clientName} · {p.status}
                    </p>
                  </button>
                  <Btn
                    type="button"
                    className="shrink-0 px-2.5 py-1 text-xs"
                    onClick={() => {
                      const svc = services.find((s) => s.id === p.serviceId);
                      const days = svc?.timeline
                        ? parseTimelineDays(svc.timeline, 7)
                        : 7;
                      onAdjustDates(p, todayStr, addDays(todayStr, days));
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
  );
}
