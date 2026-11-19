import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Briefcase,
  CalendarDays,
  CheckCircle2,
  Circle,
  FileSpreadsheet,
  FileText,
  Filter,
  FolderKanban,
  Image as ImageIcon,
  Layers,
  List,
  Paperclip,
  Plus,
  Search,
  Sparkles,
  Star,
  Trash2,
  Upload,
} from "lucide-react";
import {
  Btn,
  F,
  Glass,
  PageHeader,
  Pill,
  Sel,
  SlideDrawer,
  SlidingTabs,
  Stat,
} from "@/components/rv/ui";
import { CaseStudyBuilder } from "@/components/rv/CaseStudyBuilder";
import { nextCode, upsert } from "@/components/rv/Crud";
import {
  DesignMediaUploader,
  MediaCountBadge,
  MediaLightboxViewer,
} from "@/components/rv/DesignMediaTools";
import {
  PortfolioGallerySection,
  PortfolioSummaryView,
} from "@/components/rv/PortfolioShowcase";
import { WorkTasksCalendar } from "@/components/rv/WorkTasksCalendar";
import {
  workProjectAccent,
  workTaskProjectName,
} from "@/components/rv/workProjectColors";
import { WorkspaceBalanceCard } from "@/components/rv/WorkspaceBalanceCard";
import { deleteMediaBlob, processDesignMediaFile } from "@/lib/media-store";
import {
  DEFAULT_WORK_PROJECTS,
  DESIGN_TYPES,
  WORK_STATUSES,
  autoBuildCaseStudy,
  caseStudyKey,
  designOutputSummary,
  saveCaseStudy,
  setDB,
  shortDate,
  today,
  uid,
  useDB,
  type DesignMedia,
  type ShowcaseWorkItem,
  type WorkStatus,
  type WorkTask,
} from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/work")({
  head: () => ({
    meta: [
      { title: "Work & Portfolio · RothVan Studio" },
      {
        name: "description",
        content:
          "Track full-time design tasks by project (DBG, Connexion, OCIC) in list & calendar views, manage Portfolio Summary, and showcase PNG/JPEG/PDF mockups.",
      },
      { property: "og:title", content: "Work & Portfolio · RothVan Studio" },
      {
        property: "og:description",
        content:
          "Full-time work calendar, project-grouped tasks, Portfolio Summary, and visual mockup gallery.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: WorkPage,
});

type WorkTab = "tasks" | "summary" | "gallery";
type TasksViewMode = "list" | "projects" | "calendar";
type OutputSourceFilter = "all" | "work" | "studio";
type OutputStatusFilter = "all" | "completed" | "active";

function normalizeWorkStatus(raw: string): WorkStatus {
  const s = raw.trim().toLowerCase();
  if (/done|complete|finished|closed|shipped|delivered/.test(s))
    return "Completed";
  if (/review|qa|check|feedback|pending/.test(s)) return "In review";
  if (/backlog|hold|later|planned|todo/.test(s)) return "Backlog";
  return "Current";
}

function normalizeDesignType(raw: string): string {
  const s = raw.trim().toLowerCase();
  if (!s) return DESIGN_TYPES[0];
  const exact = DESIGN_TYPES.find((t) => t.toLowerCase() === s);
  if (exact) return exact;
  if (/brand|logo|identity/.test(s)) return "Branding & Identity";
  if (/social|campaign|post|ad/.test(s)) return "Social & Campaign";
  if (/pack|box|label|dieline/.test(s)) return "Marketing & Packaging";
  if (/print|flyer|brochure|card|poster|menu/.test(s))
    return "Print & Collateral";
  if (/ui|ux|web|app|landing|figma/.test(s)) return "UI & Web";
  if (/spatial|sign|booth|3d|led/.test(s)) return "Spatial & Signage";
  if (/deck|slide|pitch|presentation/.test(s)) return "Presentation & Deck";
  if (/digital|creative|banner/.test(s)) return "Creative & Digital";
  return "Other";
}

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]!;
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if ((ch === "," || ch === "\t") && !inQuotes) {
      out.push(cur.trim());
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur.trim());
  return out;
}

function parseBulkWorkText(raw: string, existingCodes: string[]): WorkTask[] {
  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return [];

  const rows: WorkTask[] = [];
  const usedCodes = [...existingCodes];

  lines.forEach((line, idx) => {
    const cols = parseCsvLine(line);
    if (cols.length === 0 || !cols[0]) return;
    if (
      idx === 0 &&
      /^(title|task|name|project)$/i.test(cols[0]) &&
      cols.length > 1
    ) {
      return;
    }

    const title = cols[0];
    const col1 = cols[1] ?? "";
    const looksLikeType = DESIGN_TYPES.some(
      (dt) => dt.toLowerCase() === col1.toLowerCase(),
    );

    const designType = looksLikeType
      ? normalizeDesignType(col1)
      : normalizeDesignType(cols[2] ?? "");
    const status = looksLikeType
      ? normalizeWorkStatus(cols[2] ?? "Completed")
      : normalizeWorkStatus(cols[3] ?? "Completed");
    const countCol = looksLikeType ? cols[3] : cols[4];
    const parsedCount = Number(countCol);
    const artworkCount =
      Number.isFinite(parsedCount) && parsedCount > 0
        ? Math.round(parsedCount)
        : 1;
    const projectName = looksLikeType ? (cols[4] ?? "") : col1;
    const dateCol = looksLikeType ? cols[5] : cols[5];
    const dateVal =
      dateCol && /^\d{4}-\d{2}-\d{2}$/.test(dateCol)
        ? dateCol
        : status === "Completed"
          ? today()
          : "";
    const notes = cols[6] ?? "";
    const code = nextCode("WRK-", usedCodes, 1, 2);
    usedCodes.push(code);

    rows.push({
      id: uid(),
      code,
      title,
      status,
      designType,
      artworkCount,
      projectName,
      company: projectName,
      startDate: status === "Completed" ? "" : dateVal,
      dueDate: status === "Completed" ? "" : dateVal,
      completedDate: status === "Completed" ? dateVal || today() : "",
      notes,
      media: [],
      featured: false,
    });
  });

  return rows;
}

function WorkPage() {
  const db = useDB((d) => d);
  const workTasks = useMemo(() => db.workTasks ?? [], [db.workTasks]);
  const [tab, setTab] = useState<WorkTab>("tasks");
  const [tasksView, setTasksView] = useState<TasksViewMode>("list");

  // Saved + active work projects (DBG, Connexion, OCIC, etc.)
  const projectNames = useMemo(() => {
    const saved =
      Array.isArray(db.settings.workProjects) &&
      db.settings.workProjects.length > 0
        ? db.settings.workProjects
        : [...DEFAULT_WORK_PROJECTS];
    const seen = new Map<string, string>();
    for (const p of saved) {
      const clean = p.trim();
      if (clean) seen.set(clean.toLowerCase(), clean);
    }
    for (const t of workTasks) {
      const p = workTaskProjectName(t);
      if (p && !seen.has(p.toLowerCase())) {
        seen.set(p.toLowerCase(), p);
      }
    }
    return Array.from(seen.values());
  }, [db.settings.workProjects, workTasks]);

  const [newProjectInputOpen, setNewProjectInputOpen] = useState(false);
  const [newProjectDraft, setNewProjectDraft] = useState("");

  // Work tasks filters
  const [query, setQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<"All" | WorkStatus>("All");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [onlyWithMedia, setOnlyWithMedia] = useState(false);

  // Gallery filters
  const [outSource, setOutSource] = useState<OutputSourceFilter>("all");
  const [outStatus, setOutStatus] = useState<OutputStatusFilter>("all");
  const [outProjectFilter, setOutProjectFilter] = useState<string>("All");
  const [outType, setOutType] = useState<string>("All");
  const [outMediaOnly, setOutMediaOnly] = useState(false);
  const [outQuery, setOutQuery] = useState("");

  // Drawers, case study studio & lightbox
  const [editingTask, setEditingTask] = useState<WorkTask | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [caseStudyItem, setCaseStudyItem] = useState<ShowcaseWorkItem | null>(
    null,
  );
  const caseStudyFilesInputRef = useRef<HTMLInputElement>(null);
  const [lightboxState, setLightboxState] = useState<{
    item: ShowcaseWorkItem;
    mediaId?: string;
  } | null>(null);
  const [studioMediaDraft, setStudioMediaDraft] = useState<{
    projectId: string;
    title: string;
    artworkCount: number;
    featured: boolean;
    media: DesignMedia[];
  } | null>(null);

  const output = useMemo(() => designOutputSummary(db), [db]);

  const filteredTasks = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...workTasks]
      .filter((t) => {
        const proj = workTaskProjectName(t);
        if (
          projectFilter !== "All" &&
          proj.toLowerCase() !== projectFilter.toLowerCase()
        ) {
          return false;
        }
        if (statusFilter !== "All" && t.status !== statusFilter) return false;
        if (typeFilter !== "All" && t.designType !== typeFilter) return false;
        if (onlyWithMedia && (t.media?.length ?? 0) === 0) return false;
        if (q) {
          const hay =
            `${t.code} ${t.title} ${proj} ${t.company} ${t.designType} ${t.notes}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const order: Record<WorkStatus, number> = {
          Current: 0,
          "In review": 1,
          Backlog: 2,
          Completed: 3,
        };
        if (order[a.status] !== order[b.status]) {
          return order[a.status] - order[b.status];
        }
        const da = a.completedDate || a.dueDate || a.startDate || "";
        const dbDate = b.completedDate || b.dueDate || b.startDate || "";
        return dbDate.localeCompare(da);
      });
  }, [
    workTasks,
    projectFilter,
    statusFilter,
    typeFilter,
    onlyWithMedia,
    query,
  ]);

  const tasksGroupedByProject = useMemo(() => {
    const groups = new Map<string, WorkTask[]>();
    for (const p of projectNames) {
      groups.set(p, []);
    }
    for (const t of filteredTasks) {
      const p = workTaskProjectName(t) || "Unassigned";
      const list = groups.get(p) ?? [];
      list.push(t);
      groups.set(p, list);
    }
    return Array.from(groups.entries()).filter(([name, items]) => {
      if (projectFilter !== "All") {
        return name.toLowerCase() === projectFilter.toLowerCase();
      }
      if (name === "Unassigned") return items.length > 0;
      return true;
    });
  }, [filteredTasks, projectNames, projectFilter]);

  const filteredShowcase = useMemo(() => {
    const q = outQuery.trim().toLowerCase();
    return output.items.filter((it) => {
      if (outSource !== "all" && it.source !== outSource) return false;
      if (outStatus === "completed" && !it.completed) return false;
      if (outStatus === "active" && it.completed) return false;
      if (
        outProjectFilter !== "All" &&
        it.projectGroup.toLowerCase() !== outProjectFilter.toLowerCase()
      ) {
        return false;
      }
      if (outType !== "All" && it.designType !== outType) return false;
      if (outMediaOnly && it.media.length === 0) return false;
      if (q) {
        const hay =
          `${it.code} ${it.title} ${it.subtitle} ${it.projectGroup} ${it.designType} ${it.notes}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [
    output.items,
    outSource,
    outStatus,
    outProjectFilter,
    outType,
    outMediaOnly,
    outQuery,
  ]);

  const addWorkProjectName = (rawName: string) => {
    const clean = rawName.trim();
    if (!clean) return;
    if (projectNames.some((p) => p.toLowerCase() === clean.toLowerCase())) {
      toast.info(`${clean} is already in your projects list`);
      setNewProjectInputOpen(false);
      setNewProjectDraft("");
      return;
    }
    setDB((d) => ({
      ...d,
      settings: {
        ...d.settings,
        workProjects: [...projectNames, clean],
      },
    }));
    setProjectFilter(clean);
    setNewProjectDraft("");
    setNewProjectInputOpen(false);
    toast.success(`Added project "${clean}"`);
  };

  const blankTask = (overrides: Partial<WorkTask> = {}): WorkTask => {
    const status = overrides.status ?? "Current";
    const defaultProj =
      overrides.projectName ??
      (projectFilter !== "All" ? projectFilter : (projectNames[0] ?? "DBG"));
    const start =
      overrides.startDate ?? (status === "Completed" ? "" : today());
    const due = overrides.dueDate ?? (status === "Completed" ? "" : start);
    return {
      id: uid(),
      code: nextCode(
        "WRK-",
        workTasks.map((t) => t.code),
        1,
        2,
      ),
      title: "",
      status,
      designType: DESIGN_TYPES[0],
      artworkCount: 1,
      projectName: defaultProj,
      company: defaultProj,
      startDate: start,
      dueDate: due,
      completedDate:
        overrides.completedDate ?? (status === "Completed" ? today() : ""),
      notes: "",
      media: [],
      featured: false,
      ...overrides,
    };
  };

  const saveTask = (next: WorkTask) => {
    const proj = workTaskProjectName(next);
    const clean: WorkTask = {
      ...next,
      projectName: proj,
      company: proj,
      artworkCount: Math.max(1, Number(next.artworkCount) || 1),
      completedDate:
        next.status === "Completed"
          ? next.completedDate || today()
          : next.completedDate,
    };
    const shouldPersistProj =
      proj && !projectNames.some((p) => p.toLowerCase() === proj.toLowerCase());
    setDB((d) => ({
      ...d,
      workTasks: upsert(d.workTasks ?? [], clean),
      ...(shouldPersistProj
        ? {
            settings: {
              ...d.settings,
              workProjects: [...projectNames, proj],
            },
          }
        : {}),
    }));
    toast.success(`Saved ${clean.title || clean.code}`);
  };

  const toggleTaskComplete = (task: WorkTask) => {
    const nextStatus: WorkStatus =
      task.status === "Completed" ? "Current" : "Completed";
    saveTask({
      ...task,
      status: nextStatus,
      completedDate: nextStatus === "Completed" ? today() : "",
    });
  };

  const deleteTask = async (task: WorkTask) => {
    for (const m of task.media ?? []) {
      await deleteMediaBlob(m.id);
    }
    setDB((d) => ({
      ...d,
      workTasks: (d.workTasks ?? []).filter((x) => x.id !== task.id),
    }));
    toast.success(`Removed ${task.title || task.code}`);
  };

  const openItemPreviewOrAttach = (item: ShowcaseWorkItem) => {
    if (item.media.length > 0) {
      setLightboxState({ item });
      return;
    }
    openItemManage(item);
  };

  const openItemManage = (item: ShowcaseWorkItem) => {
    if (item.source === "work") {
      const found = workTasks.find((w) => w.id === item.id);
      if (found) setEditingTask(found);
    } else {
      const proj = db.projects.find((p) => p.id === item.id);
      if (proj) {
        setStudioMediaDraft({
          projectId: proj.id,
          title: proj.name || proj.code,
          artworkCount: Math.max(1, Number(proj.artworkCount) || 1),
          featured: Boolean(proj.featured),
          media: Array.isArray(proj.media) ? proj.media : [],
        });
      }
    }
  };

  const toggleItemFeatured = (item: ShowcaseWorkItem) => {
    if (item.source === "work") {
      setDB((d) => ({
        ...d,
        workTasks: (d.workTasks ?? []).map((t) =>
          t.id === item.id ? { ...t, featured: !t.featured } : t,
        ),
      }));
    } else {
      setDB((d) => ({
        ...d,
        projects: d.projects.map((p) =>
          p.id === item.id ? { ...p, featured: !p.featured } : p,
        ),
      }));
    }
    toast.success(
      item.featured
        ? `Removed ${item.title} from Portfolio Highlights`
        : `Featured ${item.title} in Portfolio Summary`,
    );
  };

  const handleAutoCaseStudyFromFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    try {
      const processed = await Promise.all(
        Array.from(files).map((file) => processDesignMediaFile(file)),
      );
      if (processed.length === 0) return;
      const firstBase = processed[0]!.name
        .replace(/\.[^.]+$/, "")
        .replace(/[-_]+/g, " ")
        .trim();
      const proj =
        projectFilter !== "All" ? projectFilter : (projectNames[0] ?? "DBG");
      const title = firstBase || `${proj} Case Study`;
      const imgCount = processed.filter((m) => m.kind === "image").length;
      const createdTask: WorkTask = blankTask({
        status: "Completed",
        title,
        projectName: proj,
        company: proj,
        artworkCount: Math.max(1, imgCount || processed.length),
        completedDate: today(),
        featured: true,
        media: processed,
        notes: `Case study generated from ${processed.length} uploaded asset${processed.length === 1 ? "" : "s"}.`,
      });
      const showcase: ShowcaseWorkItem = {
        id: createdTask.id,
        source: "work",
        code: createdTask.code,
        title: createdTask.title,
        subtitle: proj,
        projectGroup: proj,
        designType: createdTask.designType,
        status: createdTask.status,
        completed: true,
        date: createdTask.completedDate,
        artworkCount: createdTask.artworkCount,
        media: createdTask.media,
        notes: createdTask.notes,
        featured: true,
      };
      const builtDoc = autoBuildCaseStudy(showcase);
      setDB((d) =>
        saveCaseStudy(
          {
            ...d,
            workTasks: upsert(d.workTasks ?? [], createdTask),
          },
          builtDoc,
        ),
      );
      setTab("gallery");
      setCaseStudyItem(showcase);
      toast.success(
        `Built "${title}" case study from ${processed.length} file${processed.length === 1 ? "" : "s"}`,
      );
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Could not process uploaded design files",
      );
    }
  };

  const renderTaskRow = (t: WorkTask) => {
    const thumb = t.media.find((m) => m.kind === "image" && m.dataUrl);
    const hasPdf = t.media.some((m) => m.kind === "pdf");
    const done = t.status === "Completed";
    const dateShown = (done ? t.completedDate : t.dueDate || t.startDate) ?? "";
    const proj = workTaskProjectName(t);
    const accent = workProjectAccent(proj);

    return (
      <li
        key={t.id}
        className="flex flex-wrap items-center justify-between gap-3 py-3 transition-colors hover:bg-muted/35 sm:flex-nowrap sm:rounded-xl sm:px-2"
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button
            type="button"
            onClick={() => toggleTaskComplete(t)}
            title={done ? "Mark as current" : "Mark as completed"}
            aria-label={done ? "Mark as current" : "Mark as completed"}
            className={cn(
              "shrink-0 rounded-full p-1 transition-colors",
              done
                ? "text-positive hover:text-positive/80"
                : "text-muted-foreground hover:text-primary",
            )}
          >
            {done ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <Circle className="h-5 w-5" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              if (t.media.length > 0) {
                setLightboxState({
                  item: {
                    id: t.id,
                    source: "work",
                    code: t.code,
                    title: t.title,
                    subtitle: proj || "Full-time design",
                    projectGroup: proj || "General",
                    designType: t.designType,
                    status: t.status,
                    completed: done,
                    date: dateShown,
                    artworkCount: t.artworkCount,
                    media: t.media,
                    notes: t.notes,
                    featured: Boolean(t.featured),
                  },
                });
              } else {
                setEditingTask(t);
              }
            }}
            className="grid h-11 w-13 shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-muted/60 hover:border-primary/60"
          >
            {thumb?.dataUrl ? (
              <img
                src={thumb.dataUrl}
                alt={t.title}
                className="h-full w-full object-cover"
              />
            ) : hasPdf ? (
              <FileText className="h-4 w-4 text-primary" />
            ) : (
              <ImageIcon className="h-4 w-4 text-muted-foreground/60" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setEditingTask(t)}
            className="min-w-0 flex-1 text-left"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-num text-xs text-muted-foreground">
                {t.code}
              </span>
              {proj && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground/90">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: accent.dot }}
                  />
                  {proj}
                </span>
              )}
              <span
                className={cn(
                  "truncate text-sm font-semibold",
                  done && "text-foreground/90",
                )}
              >
                {t.title || "Untitled task"}
              </span>
            </div>
            <p className="font-num mt-0.5 truncate text-xs text-muted-foreground">
              {t.designType}
              {t.startDate && t.dueDate && t.startDate !== t.dueDate
                ? ` · ${shortDate(t.startDate)} → ${shortDate(t.dueDate)}`
                : dateShown
                  ? ` · ${done ? "Done" : "Due"} ${shortDate(dateShown)}`
                  : ""}
            </p>
          </button>
        </div>

        <div className="flex shrink-0 items-center gap-2.5 pl-9 sm:pl-0">
          <MediaCountBadge media={t.media} />
          <span className="font-num text-xs font-medium text-muted-foreground">
            {t.artworkCount} {t.artworkCount === 1 ? "pc" : "pcs"}
          </span>
          <Pill s={t.status} />
          <Btn
            type="button"
            onClick={() => setEditingTask(t)}
            className="px-3 py-1 text-xs"
          >
            Edit
          </Btn>
        </div>
      </li>
    );
  };

  return (
    <>
      <PageHeader
        title="Full-Time Work & Portfolio"
        owner={db.settings.ownerName}
        action={
          <div className="no-print grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center">
            <Btn
              type="button"
              onClick={() => caseStudyFilesInputRef.current?.click()}
              className="w-full justify-center whitespace-nowrap px-3 text-xs sm:w-auto sm:shrink-0 sm:px-4 sm:text-sm"
            >
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-primary" />
              Case Study
            </Btn>
            <Btn
              type="button"
              onClick={() => setImportOpen(true)}
              className="w-full justify-center whitespace-nowrap px-3 text-xs sm:w-auto sm:shrink-0 sm:px-4 sm:text-sm"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 shrink-0" />
              Import CSV
            </Btn>
            <Btn
              type="button"
              variant="gold"
              onClick={() => setEditingTask(blankTask({ status: "Current" }))}
              className="col-span-2 w-full justify-center whitespace-nowrap sm:col-span-1 sm:w-auto sm:shrink-0"
            >
              <Plus className="h-4 w-4 shrink-0" />
              Add work task
            </Btn>
          </div>
        }
      />

      <div className="no-print">
        <WorkspaceBalanceCard workspace="work" />
      </div>

      <div className="no-print mb-5 flex flex-wrap items-center justify-between gap-3">
        <SlidingTabs
          stretch
          className="w-full sm:w-auto"
          layoutGroup="work-main-tabs"
          value={tab}
          onChange={setTab}
          options={[
            {
              id: "tasks",
              label: "Tasks",
              icon: Briefcase,
              badge: workTasks.length,
            },
            {
              id: "summary",
              label: "Portfolio",
              icon: Sparkles,
              badge: output.completedTotal,
            },
            {
              id: "gallery",
              label: "Gallery",
              icon: Layers,
              badge: output.mediaCount,
            },
          ]}
        />
        <p className="hidden text-xs text-muted-foreground sm:block">
          Organize daily tasks by project (DBG, Connexion, OCIC) in List or
          Calendar view, and curate your Portfolio Summary.
        </p>
      </div>

      {tab === "tasks" && (
        <div className="space-y-4">
          {/* Tasks KPI Strip */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Glass className="p-4">
              <Stat
                label="Current tasks"
                value={String(
                  filteredTasks.filter((t) => t.status === "Current").length,
                )}
              />
            </Glass>
            <Glass className="p-4">
              <Stat
                label="In review"
                value={String(
                  filteredTasks.filter((t) => t.status === "In review").length,
                )}
              />
            </Glass>
            <Glass className="p-4">
              <Stat
                label="Completed tasks"
                tone="pos"
                value={String(
                  filteredTasks.filter((t) => t.status === "Completed").length,
                )}
              />
            </Glass>
            <Glass className="p-4">
              <Stat
                label="Work artworks"
                value={String(
                  filteredTasks.reduce(
                    (s, t) => s + Math.max(1, Number(t.artworkCount) || 1),
                    0,
                  ),
                )}
              />
            </Glass>
          </div>

          {/* Project Selector Strip + View Mode Bar */}
          <Glass className="p-4 sm:p-5">
            <div className="flex flex-col gap-3">
              {/* Project switcher row (All, DBG, Connexion, OCIC, + New project) */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="mr-1 text-xs font-medium text-muted-foreground">
                    Projects:
                  </span>
                  <button
                    type="button"
                    onClick={() => setProjectFilter("All")}
                    className={cn(
                      "font-num inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                      projectFilter === "All"
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-muted/45 text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <span>All ({workTasks.length})</span>
                  </button>

                  {projectNames.map((proj) => {
                    const count = workTasks.filter(
                      (t) =>
                        workTaskProjectName(t).toLowerCase() ===
                        proj.toLowerCase(),
                    ).length;
                    const active =
                      projectFilter.toLowerCase() === proj.toLowerCase();
                    const accent = workProjectAccent(proj);
                    return (
                      <button
                        key={proj}
                        type="button"
                        onClick={() => setProjectFilter(active ? "All" : proj)}
                        className={cn(
                          "font-num inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                          active
                            ? "border-primary bg-primary/15 text-foreground"
                            : "border-border bg-muted/35 text-muted-foreground hover:border-primary/40 hover:text-foreground",
                        )}
                      >
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: accent.dot }}
                        />
                        <span>{proj}</span>
                        <span className="opacity-70">{count}</span>
                      </button>
                    );
                  })}

                  {newProjectInputOpen ? (
                    <form
                      className="inline-flex items-center gap-1.5"
                      onSubmit={(e) => {
                        e.preventDefault();
                        addWorkProjectName(newProjectDraft);
                      }}
                    >
                      <input
                        autoFocus
                        value={newProjectDraft}
                        onChange={(e) => setNewProjectDraft(e.target.value)}
                        placeholder="Project name…"
                        className="field h-7 w-32 px-2.5 py-1 text-xs"
                      />
                      <Btn
                        type="submit"
                        variant="gold"
                        className="h-7 px-2.5 py-0 text-xs"
                      >
                        Add
                      </Btn>
                      <Btn
                        type="button"
                        onClick={() => {
                          setNewProjectInputOpen(false);
                          setNewProjectDraft("");
                        }}
                        className="h-7 px-2.5 py-0 text-xs"
                      >
                        Cancel
                      </Btn>
                    </form>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setNewProjectInputOpen(true)}
                      className="inline-flex items-center gap-1 rounded-full border border-dashed border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                      <Plus className="h-3 w-3" />
                      <span>New project</span>
                    </button>
                  )}
                </div>

                <SlidingTabs
                  size="xs"
                  layoutGroup="work-tasks-view-mode"
                  value={tasksView}
                  onChange={setTasksView}
                  options={[
                    { id: "list", label: "List", icon: List },
                    { id: "projects", label: "By Project", icon: FolderKanban },
                    { id: "calendar", label: "Calendar", icon: CalendarDays },
                  ]}
                />
              </div>

              {/* Search & Secondary Filters */}
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    className="field pl-9"
                    placeholder="Search task title, DBG / Connexion / OCIC, code, design type…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <SlidingTabs
                    size="xs"
                    layoutGroup="work-status-filter"
                    value={statusFilter}
                    onChange={setStatusFilter}
                    options={[
                      { id: "All", label: "All" },
                      ...WORK_STATUSES.map((s) => ({ id: s, label: s })),
                    ]}
                  />
                  <div className="w-full sm:w-44">
                    <Sel
                      value={typeFilter === "All" ? "" : typeFilter}
                      placeholder="All design types"
                      onChange={(v) => setTypeFilter(v || "All")}
                      options={[...DESIGN_TYPES]}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setOnlyWithMedia((v) => !v)}
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                      onlyWithMedia
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-border text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Paperclip className="h-3.5 w-3.5" />
                    <span>Has files</span>
                  </button>
                </div>
              </div>
            </div>
          </Glass>

          {tasksView === "calendar" ? (
            <WorkTasksCalendar
              tasks={filteredTasks}
              projectNames={projectNames}
              activeProject={projectFilter}
              onCreateOnRange={(startDate, dueDate) =>
                setEditingTask(
                  blankTask({
                    status: "Current",
                    startDate,
                    dueDate,
                    projectName:
                      projectFilter !== "All"
                        ? projectFilter
                        : (projectNames[0] ?? "DBG"),
                  }),
                )
              }
              onSelectTask={(task) => setEditingTask(task)}
              onRescheduleTask={(task, startDate, dueDate) => {
                saveTask({
                  ...task,
                  startDate,
                  dueDate,
                });
              }}
            />
          ) : tasksView === "projects" ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {tasksGroupedByProject.map(([projName, groupTasks]) => {
                const accent = workProjectAccent(projName);
                const doneCount = groupTasks.filter(
                  (t) => t.status === "Completed",
                ).length;
                const artworks = groupTasks.reduce(
                  (s, t) => s + Math.max(1, Number(t.artworkCount) || 1),
                  0,
                );
                const pct =
                  groupTasks.length > 0
                    ? Math.round((doneCount / groupTasks.length) * 100)
                    : 0;
                return (
                  <Glass key={projName} className="flex flex-col">
                    <div className="mb-3 flex items-center justify-between gap-2 border-b border-border/60 pb-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: accent.dot }}
                          />
                          <h3 className="truncate font-display text-lg font-bold">
                            {projName}
                          </h3>
                        </div>
                        <p className="font-num mt-0.5 text-xs text-muted-foreground">
                          {doneCount}/{groupTasks.length} completed ({pct}%) ·{" "}
                          {artworks} artworks
                        </p>
                      </div>
                      <Btn
                        type="button"
                        onClick={() =>
                          setEditingTask(
                            blankTask({
                              projectName:
                                projName === "Unassigned" ? "" : projName,
                              status: "Current",
                            }),
                          )
                        }
                        className="px-3 py-1 text-xs"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add task
                      </Btn>
                    </div>

                    {groupTasks.length === 0 ? (
                      <div className="py-6 text-center text-xs text-muted-foreground">
                        No tasks in {projName} yet. Click{" "}
                        <button
                          type="button"
                          onClick={() =>
                            setEditingTask(
                              blankTask({
                                projectName:
                                  projName === "Unassigned" ? "" : projName,
                              }),
                            )
                          }
                          className="font-medium text-primary hover:underline"
                        >
                          Add task
                        </button>{" "}
                        to start.
                      </div>
                    ) : (
                      <ul className="divide-y divide-border/70">
                        {groupTasks.map((t) => renderTaskRow(t))}
                      </ul>
                    )}
                  </Glass>
                );
              })}
            </div>
          ) : (
            <Glass>
              {filteredTasks.length === 0 ? (
                <div className="py-10 text-center">
                  <Briefcase className="mx-auto mb-2 h-8 w-8 text-muted-foreground/60" />
                  <p className="text-sm font-medium text-foreground">
                    {workTasks.length === 0
                      ? "No full-time work tasks recorded yet"
                      : "No tasks match your filters"}
                  </p>
                  <p className="mx-auto mt-1 max-w-md text-xs text-muted-foreground">
                    {workTasks.length === 0
                      ? "Add tasks under projects like DBG, Connexion, or OCIC, switch to Calendar view to click-and-schedule, or bulk-import CSV."
                      : "Clear search or switch project/status filters to see more tasks."}
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <Btn
                      type="button"
                      variant="gold"
                      onClick={() =>
                        setEditingTask(blankTask({ status: "Current" }))
                      }
                      className="text-xs"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add work task
                    </Btn>
                    <Btn
                      type="button"
                      onClick={() => setTasksView("calendar")}
                      className="text-xs"
                    >
                      <CalendarDays className="h-3.5 w-3.5" />
                      Open Calendar view
                    </Btn>
                    <Btn
                      type="button"
                      onClick={() => setImportOpen(true)}
                      className="text-xs"
                    >
                      <FileSpreadsheet className="h-3.5 w-3.5" />
                      Bulk CSV import
                    </Btn>
                  </div>
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {filteredTasks.map((t) => renderTaskRow(t))}
                </ul>
              )}
            </Glass>
          )}
        </div>
      )}

      {tab === "summary" && (
        <PortfolioSummaryView
          headline={
            db.settings.portfolioHeadline || "Visual & Brand Design Portfolio"
          }
          bio={
            db.settings.portfolioBio ||
            "Selected commercial branding, packaging, campaign visuals, and spatial design delivered across full-time teams and independent studio engagements."
          }
          ownerName={db.settings.ownerName}
          items={output.items}
          byType={output.byType}
          byProjectGroup={output.byProjectGroup}
          monthlyTrend={output.monthlyTrend}
          totalArtworks={output.totalArtworks}
          completedTotal={output.completedTotal}
          activeTotal={output.activeTotal}
          mediaCount={output.mediaCount}
          workCompleted={output.workCompleted}
          studioCompleted={output.studioCompleted}
          onSaveBio={(portfolioHeadline, portfolioBio) => {
            setDB((d) => ({
              ...d,
              settings: {
                ...d.settings,
                portfolioHeadline,
                portfolioBio,
              },
            }));
            toast.success("Updated Portfolio Summary intro");
          }}
          onOpenPreviewOrAttach={openItemPreviewOrAttach}
          onManage={openItemManage}
          onToggleFeatured={toggleItemFeatured}
          onJumpToGalleryProject={(grp) => {
            setOutProjectFilter(grp);
            setTab("gallery");
          }}
          onJumpToWorkProject={(grp) => {
            setProjectFilter(grp);
            setTab("tasks");
          }}
          onOpenCaseStudy={(it) => setCaseStudyItem(it)}
          onCreateCaseStudyFromFiles={() =>
            caseStudyFilesInputRef.current?.click()
          }
        />
      )}

      {tab === "gallery" && (
        <div className="space-y-4">
          {/* Gallery Filter Bar */}
          <Glass className="p-4 sm:p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <SlidingTabs
                  size="xs"
                  layoutGroup="out-source-filter"
                  value={outSource}
                  onChange={setOutSource}
                  options={[
                    { id: "all", label: "All (Studio + Work)" },
                    { id: "work", label: "Full-Time Work" },
                    { id: "studio", label: "Freelance Studio" },
                  ]}
                />
                <SlidingTabs
                  size="xs"
                  tone="invert"
                  layoutGroup="out-status-filter"
                  value={outStatus}
                  onChange={setOutStatus}
                  options={[
                    { id: "all", label: "All statuses" },
                    { id: "completed", label: "Completed" },
                    { id: "active", label: "Active" },
                  ]}
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-full min-w-0 sm:w-52 sm:flex-none">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    className="field h-9 pl-8 text-xs"
                    placeholder="Search project, client, type…"
                    value={outQuery}
                    onChange={(e) => setOutQuery(e.target.value)}
                  />
                </div>
                <div className="min-w-0 flex-1 sm:w-40 sm:flex-none">
                  <Sel
                    value={outProjectFilter === "All" ? "" : outProjectFilter}
                    placeholder="All brands/projects"
                    onChange={(v) => setOutProjectFilter(v || "All")}
                    options={output.byProjectGroup.map((g) => g.projectGroup)}
                  />
                </div>
                <div className="min-w-0 flex-1 sm:w-40 sm:flex-none">
                  <Sel
                    value={outType === "All" ? "" : outType}
                    placeholder="All disciplines"
                    onChange={(v) => setOutType(v || "All")}
                    options={[...DESIGN_TYPES]}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setOutMediaOnly((v) => !v)}
                  className={cn(
                    "inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl border px-3 text-xs font-medium transition-colors",
                    outMediaOnly
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Filter className="h-3.5 w-3.5" />
                  <span>Illustrated only</span>
                </button>
              </div>
            </div>
          </Glass>

          <PortfolioGallerySection
            items={filteredShowcase}
            onOpenPreviewOrAttach={openItemPreviewOrAttach}
            onManage={openItemManage}
            onToggleFeatured={toggleItemFeatured}
            onAddNewCompleted={() =>
              setEditingTask(blankTask({ status: "Completed" }))
            }
            onOpenCaseStudy={(it) => setCaseStudyItem(it)}
            onCreateCaseStudyFromFiles={() =>
              caseStudyFilesInputRef.current?.click()
            }
            onDropFilesForCaseStudy={(files) =>
              void handleAutoCaseStudyFromFiles(files)
            }
          />
        </div>
      )}

      {/* Work Task Editor Drawer */}
      <WorkTaskDrawer
        task={editingTask}
        projectNames={projectNames}
        isExisting={Boolean(
          editingTask && workTasks.some((t) => t.id === editingTask.id),
        )}
        onClose={() => setEditingTask(null)}
        onSave={(next) => {
          saveTask(next);
          setEditingTask(null);
        }}
        onDelete={async (t) => {
          await deleteTask(t);
          setEditingTask(null);
        }}
        onPreviewMedia={(draft, m) => {
          const proj = workTaskProjectName(draft);
          setLightboxState({
            item: {
              id: draft.id,
              source: "work",
              code: draft.code,
              title: draft.title || draft.code,
              subtitle: proj || "Full-time design",
              projectGroup: proj || "General",
              designType: draft.designType,
              status: draft.status,
              completed: draft.status === "Completed",
              date:
                draft.completedDate || draft.dueDate || draft.startDate || "",
              artworkCount: draft.artworkCount,
              media: draft.media,
              notes: draft.notes,
              featured: Boolean(draft.featured),
            },
            mediaId: m.id,
          });
        }}
      />

      {/* Quick Studio Project Media Drawer */}
      <SlideDrawer
        open={Boolean(studioMediaDraft)}
        onClose={() => setStudioMediaDraft(null)}
        title={studioMediaDraft?.title ?? "Project mockups"}
        subtitle="Studio project design files"
        side="right"
      >
        {studioMediaDraft && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-muted/40 px-3.5 py-2.5">
              <div>
                <p className="text-xs font-semibold text-foreground">
                  Highlight in Portfolio Summary
                </p>
                <p className="text-[0.7rem] text-muted-foreground">
                  Pin this project in your Selected Portfolio Highlights.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setStudioMediaDraft((prev) =>
                    prev ? { ...prev, featured: !prev.featured } : prev,
                  )
                }
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  studioMediaDraft.featured
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background/50 text-muted-foreground hover:text-foreground",
                )}
              >
                <Star
                  className="h-3.5 w-3.5"
                  fill={studioMediaDraft.featured ? "currentColor" : "none"}
                />
                <span>
                  {studioMediaDraft.featured ? "Featured" : "Feature"}
                </span>
              </button>
            </div>

            <F label="Artwork pieces created">
              <input
                type="number"
                min={1}
                className="field font-num"
                value={studioMediaDraft.artworkCount}
                onChange={(e) =>
                  setStudioMediaDraft((prev) =>
                    prev
                      ? {
                          ...prev,
                          artworkCount: Math.max(
                            1,
                            Number(e.target.value) || 1,
                          ),
                        }
                      : prev,
                  )
                }
              />
            </F>
            <F label="Mockups & final design PDFs">
              <DesignMediaUploader
                media={studioMediaDraft.media}
                onChange={(media) =>
                  setStudioMediaDraft((prev) =>
                    prev ? { ...prev, media } : prev,
                  )
                }
                onPreview={(m) => {
                  const proj = db.projects.find(
                    (p) => p.id === studioMediaDraft.projectId,
                  );
                  if (!proj) return;
                  const clientName =
                    db.clients.find((c) => c.id === proj.clientId)?.name ??
                    "Freelance Studio";
                  setLightboxState({
                    item: {
                      id: proj.id,
                      source: "studio",
                      code: proj.code,
                      title: studioMediaDraft.title,
                      subtitle: clientName,
                      projectGroup: clientName,
                      designType: "Design",
                      status: proj.status,
                      completed:
                        proj.status === "Delivered" || proj.status === "Closed",
                      date: proj.delivered || proj.due || proj.start || "",
                      artworkCount: studioMediaDraft.artworkCount,
                      media: studioMediaDraft.media,
                      notes: "",
                      featured: studioMediaDraft.featured,
                    },
                    mediaId: m.id,
                  });
                }}
              />
            </F>
            <div className="flex justify-end gap-2 border-t border-border/70 pt-3">
              <Btn type="button" onClick={() => setStudioMediaDraft(null)}>
                Cancel
              </Btn>
              <Btn
                type="button"
                variant="gold"
                onClick={() => {
                  setDB((d) => ({
                    ...d,
                    projects: d.projects.map((p) =>
                      p.id === studioMediaDraft.projectId
                        ? {
                            ...p,
                            artworkCount: studioMediaDraft.artworkCount,
                            featured: studioMediaDraft.featured,
                            media: studioMediaDraft.media,
                          }
                        : p,
                    ),
                  }));
                  toast.success("Updated project mockups");
                  setStudioMediaDraft(null);
                }}
              >
                Save files
              </Btn>
            </div>
          </div>
        )}
      </SlideDrawer>

      {/* Bulk CSV / Paste Importer Drawer */}
      <BulkImportDrawer
        open={importOpen}
        existingCodes={workTasks.map((t) => t.code)}
        onClose={() => setImportOpen(false)}
        onImport={(tasks) => {
          setDB((d) => ({
            ...d,
            workTasks: [...(d.workTasks ?? []), ...tasks],
          }));
          toast.success(`Imported ${tasks.length} work tasks`);
          setImportOpen(false);
        }}
      />

      {/* Hidden Multi-File Picker for Instant Auto Case Study */}
      <input
        ref={caseStudyFilesInputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.webp,.gif,.svg,.pdf,image/*,application/pdf"
        multiple
        className="hidden"
        onChange={(e) => {
          void handleAutoCaseStudyFromFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {/* Interactive Case Study Studio Drawer */}
      <CaseStudyBuilder
        item={caseStudyItem}
        existingDoc={
          caseStudyItem
            ? db.caseStudies?.[
                caseStudyKey(caseStudyItem.source, caseStudyItem.id)
              ]
            : undefined
        }
        ownerName={db.settings.ownerName}
        onClose={() => setCaseStudyItem(null)}
        onSave={(doc, updatedMedia) => {
          setDB((d) => {
            const next = saveCaseStudy(d, doc);
            if (caseStudyItem?.source === "work") {
              return {
                ...next,
                workTasks: (next.workTasks ?? []).map((t) =>
                  t.id === caseStudyItem.id ? { ...t, media: updatedMedia } : t,
                ),
              };
            }
            if (caseStudyItem?.source === "studio") {
              return {
                ...next,
                projects: next.projects.map((p) =>
                  p.id === caseStudyItem.id ? { ...p, media: updatedMedia } : p,
                ),
              };
            }
            return next;
          });
          setCaseStudyItem((prev) =>
            prev ? { ...prev, media: updatedMedia } : prev,
          );
        }}
      />

      {/* Lightbox Viewer */}
      <MediaLightboxViewer
        item={lightboxState?.item ?? null}
        initialMediaId={lightboxState?.mediaId}
        onClose={() => setLightboxState(null)}
      />
    </>
  );
}

function WorkTaskDrawer({
  task,
  projectNames,
  isExisting,
  onClose,
  onSave,
  onDelete,
  onPreviewMedia,
}: {
  task: WorkTask | null;
  projectNames: string[];
  isExisting: boolean;
  onClose: () => void;
  onSave: (v: WorkTask) => void;
  onDelete: (v: WorkTask) => Promise<void>;
  onPreviewMedia: (draft: WorkTask, m: DesignMedia) => void;
}) {
  const [draft, setDraft] = useState<WorkTask | null>(task);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setDraft(task);
    setConfirmDelete(false);
  }, [task]);

  if (!task || !draft) return null;

  const setField = <K extends keyof WorkTask>(key: K, val: WorkTask[K]) => {
    setDraft((prev) => (prev ? { ...prev, [key]: val } : prev));
  };

  const activeProj = workTaskProjectName(draft);

  return (
    <SlideDrawer
      open
      side="right"
      widthClass="max-w-xl"
      title={draft.title || draft.code || "Work task"}
      subtitle={`${draft.code} · Full-Time Work`}
      onClose={onClose}
    >
      <form
        className="grid grid-cols-2 gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!draft.title.trim()) {
            toast.error("Enter a task title.");
            return;
          }
          onSave(draft);
        }}
      >
        <F label="Task title" className="col-span-2">
          <input
            autoFocus
            className="field"
            placeholder="e.g. Monthly social campaign visuals"
            value={draft.title}
            onChange={(e) => setField("title", e.target.value)}
            required
          />
        </F>

        {/* Quick Project Picker (DBG, Connexion, OCIC, etc.) */}
        <F
          label="Project / Brand (e.g. DBG, Connexion, OCIC)"
          className="col-span-2"
        >
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1.5">
              {projectNames.map((proj) => {
                const selected =
                  activeProj.toLowerCase() === proj.toLowerCase();
                const accent = workProjectAccent(proj);
                return (
                  <button
                    key={proj}
                    type="button"
                    onClick={() =>
                      setDraft((prev) =>
                        prev
                          ? { ...prev, projectName: proj, company: proj }
                          : prev,
                      )
                    }
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors",
                      selected
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "border-border bg-muted/45 text-muted-foreground hover:border-primary/45 hover:text-foreground",
                    )}
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{
                        backgroundColor: selected ? "currentColor" : accent.dot,
                      }}
                    />
                    <span>{proj}</span>
                  </button>
                );
              })}
            </div>
            <input
              className="field text-xs"
              placeholder="Or type a custom project / department name…"
              value={activeProj}
              onChange={(e) => {
                const v = e.target.value;
                setDraft((prev) =>
                  prev ? { ...prev, projectName: v, company: v } : prev,
                );
              }}
            />
          </div>
        </F>

        <F label="Status" className="col-span-2">
          <div className="grid grid-cols-2 gap-1.5 sm:flex sm:flex-wrap">
            {WORK_STATUSES.map((st) => {
              const active = draft.status === st;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() =>
                    setDraft((prev) =>
                      prev
                        ? {
                            ...prev,
                            status: st,
                            completedDate:
                              st === "Completed"
                                ? prev.completedDate || today()
                                : prev.completedDate,
                          }
                        : prev,
                    )
                  }
                  className={cn(
                    "rounded-xl border px-3 py-2 text-xs font-medium transition-colors",
                    active
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border bg-muted/45 text-muted-foreground hover:border-primary/45 hover:text-foreground",
                  )}
                >
                  {st}
                </button>
              );
            })}
          </div>
        </F>

        <F label="Design type" className="col-span-2">
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
            {DESIGN_TYPES.map((dt) => {
              const active = draft.designType === dt;
              return (
                <button
                  key={dt}
                  type="button"
                  onClick={() => setField("designType", dt)}
                  className={cn(
                    "truncate rounded-xl border px-2.5 py-2 text-left text-xs font-medium transition-colors",
                    active
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border bg-muted/45 text-muted-foreground hover:border-primary/45 hover:text-foreground",
                  )}
                >
                  {dt}
                </button>
              );
            })}
          </div>
        </F>

        <F label="Start date (calendar)" className="col-span-2 sm:col-span-1">
          <input
            type="date"
            className="field font-num"
            value={draft.startDate ?? ""}
            onChange={(e) => setField("startDate", e.target.value)}
          />
        </F>

        <F
          label={
            draft.status === "Completed"
              ? "Completed date"
              : "Due / end date (calendar)"
          }
          className="col-span-2 sm:col-span-1"
        >
          <input
            type="date"
            className="field font-num"
            value={
              draft.status === "Completed" ? draft.completedDate : draft.dueDate
            }
            onChange={(e) =>
              setField(
                draft.status === "Completed" ? "completedDate" : "dueDate",
                e.target.value,
              )
            }
          />
        </F>

        <F label="Artworks designed (pcs)" className="col-span-2 sm:col-span-1">
          <input
            type="number"
            min={1}
            className="field font-num"
            value={draft.artworkCount}
            onChange={(e) =>
              setField("artworkCount", Math.max(1, Number(e.target.value) || 1))
            }
          />
        </F>

        <F label="Task code" className="col-span-2 sm:col-span-1">
          <input
            className="field font-num"
            value={draft.code}
            onChange={(e) => setField("code", e.target.value)}
          />
        </F>

        <div className="col-span-2 flex items-center justify-between gap-3 rounded-2xl border border-border bg-muted/35 px-3.5 py-2.5">
          <div>
            <p className="text-xs font-semibold text-foreground">
              Feature in Portfolio Summary
            </p>
            <p className="text-[0.7rem] text-muted-foreground">
              Show this work in Selected Portfolio Highlights.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setField("featured", !draft.featured)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              draft.featured
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background/50 text-muted-foreground hover:text-foreground",
            )}
          >
            <Star
              className="h-3.5 w-3.5"
              fill={draft.featured ? "currentColor" : "none"}
            />
            <span>{draft.featured ? "Featured" : "Feature"}</span>
          </button>
        </div>

        <F label="Notes & deliverables" className="col-span-2">
          <textarea
            className="field min-h-20"
            placeholder="Summary of formats, dimensions, campaign brief…"
            value={draft.notes}
            onChange={(e) => setField("notes", e.target.value)}
          />
        </F>

        <div className="col-span-2 space-y-1.5">
          <span className="label-mono">Design mockups &amp; PDFs</span>
          <DesignMediaUploader
            media={draft.media}
            onChange={(media) => setField("media", media)}
            onPreview={(m) => onPreviewMedia(draft, m)}
          />
        </div>

        <div className="col-span-2 mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-border/70 pt-3">
          {isExisting ? (
            confirmDelete ? (
              <div className="flex items-center gap-2">
                <Btn
                  type="button"
                  variant="danger"
                  className="px-3 py-1.5 text-xs"
                  onClick={() => void onDelete(draft)}
                >
                  Confirm delete
                </Btn>
                <Btn
                  type="button"
                  className="px-3 py-1.5 text-xs"
                  onClick={() => setConfirmDelete(false)}
                >
                  Keep
                </Btn>
              </div>
            ) : (
              <Btn
                type="button"
                variant="danger"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Btn>
            )
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Btn type="button" onClick={onClose}>
              Cancel
            </Btn>
            <Btn type="submit" variant="gold">
              Save task
            </Btn>
          </div>
        </div>
      </form>
    </SlideDrawer>
  );
}

function BulkImportDrawer({
  open,
  existingCodes,
  onClose,
  onImport,
}: {
  open: boolean;
  existingCodes: string[];
  onClose: () => void;
  onImport: (tasks: WorkTask[]) => void;
}) {
  const [text, setText] = useState("");
  const parsed = useMemo(
    () => parseBulkWorkText(text, existingCodes),
    [text, existingCodes],
  );

  return (
    <SlideDrawer
      open={open}
      onClose={onClose}
      title="Import work tasks"
      subtitle="CSV upload or paste task rows"
      widthClass="max-w-xl"
    >
      <div className="space-y-4">
        <p className="text-xs leading-relaxed text-muted-foreground">
          Paste rows from Excel, Google Sheets, or Notion using columns:{" "}
          <span className="font-medium text-foreground">
            Title, Project (DBG / Connexion / OCIC), Design Type, Status,
            Artworks, Date (YYYY-MM-DD)
          </span>
          . Only Title is required.
        </p>

        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-secondary px-4 py-2 text-xs font-medium hover:bg-accent">
          <Upload className="h-3.5 w-3.5" />
          <span>Choose .csv file</span>
          <input
            type="file"
            accept=".csv,.txt,text/csv,text/plain"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setText(await file.text());
              e.target.value = "";
            }}
          />
        </label>

        <F label="Paste CSV / lines">
          <textarea
            className="field font-num min-h-40 text-xs"
            placeholder={
              "Key Visual Banner Set, DBG, Social & Campaign, Completed, 8, 2026-11-05\nRetail Launch Brochure, Connexion, Print & Collateral, Current, 12, 2026-11-20"
            }
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </F>

        {parsed.length > 0 && (
          <div className="rounded-2xl border border-border bg-muted/35 p-3">
            <p className="font-num mb-2 text-xs font-semibold text-foreground">
              Preview ({parsed.length} tasks ready to import)
            </p>
            <ul className="max-h-44 space-y-1.5 overflow-y-auto text-xs">
              {parsed.slice(0, 12).map((t) => (
                <li
                  key={t.id}
                  className="flex items-center justify-between gap-2 rounded-xl border border-border/60 bg-background/50 px-2.5 py-1.5"
                >
                  <span className="truncate font-medium">
                    {t.code} · {t.projectName ? `${t.projectName} · ` : ""}
                    {t.title}
                  </span>
                  <span className="font-num shrink-0 text-muted-foreground">
                    {t.designType} · {t.artworkCount} pcs · {t.status}
                  </span>
                </li>
              ))}
              {parsed.length > 12 && (
                <li className="text-center text-[0.7rem] text-muted-foreground">
                  +{parsed.length - 12} more tasks
                </li>
              )}
            </ul>
          </div>
        )}

        <div className="flex justify-end gap-2 border-t border-border/70 pt-3">
          <Btn type="button" onClick={onClose}>
            Cancel
          </Btn>
          <Btn
            type="button"
            variant="gold"
            disabled={parsed.length === 0}
            onClick={() => {
              onImport(parsed);
              setText("");
            }}
          >
            Import {parsed.length} {parsed.length === 1 ? "task" : "tasks"}
          </Btn>
        </div>
      </div>
    </SlideDrawer>
  );
}
