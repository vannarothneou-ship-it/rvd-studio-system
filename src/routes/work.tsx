import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Briefcase,
  CheckCircle2,
  Circle,
  FileSpreadsheet,
  FileText,
  Filter,
  Image as ImageIcon,
  Layers,
  Paperclip,
  Plus,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import {
  Btn,
  Empty,
  F,
  Glass,
  PageHeader,
  Pill,
  Sel,
  SlideDrawer,
  SlidingTabs,
  Stat,
} from "@/components/rv/ui";
import { nextCode, upsert } from "@/components/rv/Crud";
import {
  DesignMediaUploader,
  MediaCountBadge,
  MediaLightboxViewer,
} from "@/components/rv/DesignMediaTools";
import { WorkspaceBalanceCard } from "@/components/rv/WorkspaceBalanceCard";
import { deleteMediaBlob } from "@/lib/media-store";
import {
  DESIGN_TYPES,
  WORK_STATUSES,
  designOutputSummary,
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
          "Track full-time design tasks, attach PNG/JPEG/PDF mockups, and analyze completed works across Work and Studio.",
      },
      { property: "og:title", content: "Work & Portfolio · RothVan Studio" },
      {
        property: "og:description",
        content:
          "Full-time work tasks, design output analytics, and visual mockup/PDF portfolio.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: WorkPage,
});

type WorkTab = "tasks" | "output";
type OutputSourceFilter = "all" | "work" | "studio";
type OutputStatusFilter = "all" | "completed" | "active";

const TYPE_COLORS = [
  "oklch(0.83 0.13 82)",
  "oklch(0.78 0.13 155)",
  "oklch(0.68 0.12 245)",
  "oklch(0.72 0.15 48)",
  "oklch(0.7 0.14 22)",
  "oklch(0.68 0.12 300)",
  "oklch(0.74 0.08 190)",
  "oklch(0.65 0.03 70)",
];

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
    const designType = normalizeDesignType(cols[1] ?? "");
    const status = normalizeWorkStatus(cols[2] ?? "Completed");
    const parsedCount = Number(cols[3]);
    const artworkCount =
      Number.isFinite(parsedCount) && parsedCount > 0
        ? Math.round(parsedCount)
        : 1;
    const company = cols[4] ?? "";
    const dateVal =
      cols[5] && /^\d{4}-\d{2}-\d{2}$/.test(cols[5])
        ? cols[5]
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
      company,
      dueDate: status === "Completed" ? "" : dateVal,
      completedDate: status === "Completed" ? dateVal || today() : "",
      notes,
      media: [],
    });
  });

  return rows;
}

function WorkPage() {
  const db = useDB((d) => d);
  const workTasks = useMemo(() => db.workTasks ?? [], [db.workTasks]);
  const [tab, setTab] = useState<WorkTab>("tasks");

  // Work tasks filters
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | WorkStatus>("All");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [onlyWithMedia, setOnlyWithMedia] = useState(false);

  // Output & gallery filters
  const [outSource, setOutSource] = useState<OutputSourceFilter>("all");
  const [outStatus, setOutStatus] = useState<OutputStatusFilter>("all");
  const [outType, setOutType] = useState<string>("All");
  const [outMediaOnly, setOutMediaOnly] = useState(false);
  const [outQuery, setOutQuery] = useState("");
  const [chartView, setChartView] = useState<"bar" | "pie">("bar");

  // Drawers & lightbox
  const [editingTask, setEditingTask] = useState<WorkTask | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [lightboxState, setLightboxState] = useState<{
    item: ShowcaseWorkItem;
    mediaId?: string;
  } | null>(null);
  const [studioMediaDraft, setStudioMediaDraft] = useState<{
    projectId: string;
    title: string;
    artworkCount: number;
    media: DesignMedia[];
  } | null>(null);

  const output = useMemo(() => designOutputSummary(db), [db]);

  const filteredTasks = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...workTasks]
      .filter((t) => {
        if (statusFilter !== "All" && t.status !== statusFilter) return false;
        if (typeFilter !== "All" && t.designType !== typeFilter) return false;
        if (onlyWithMedia && (t.media?.length ?? 0) === 0) return false;
        if (q) {
          const hay =
            `${t.code} ${t.title} ${t.company} ${t.designType} ${t.notes}`.toLowerCase();
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
        const da = a.completedDate || a.dueDate || "";
        const dbDate = b.completedDate || b.dueDate || "";
        return dbDate.localeCompare(da);
      });
  }, [workTasks, statusFilter, typeFilter, onlyWithMedia, query]);

  const filteredShowcase = useMemo(() => {
    const q = outQuery.trim().toLowerCase();
    return output.items.filter((it) => {
      if (outSource !== "all" && it.source !== outSource) return false;
      if (outStatus === "completed" && !it.completed) return false;
      if (outStatus === "active" && it.completed) return false;
      if (outType !== "All" && it.designType !== outType) return false;
      if (outMediaOnly && it.media.length === 0) return false;
      if (q) {
        const hay =
          `${it.code} ${it.title} ${it.subtitle} ${it.designType} ${it.notes}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [output.items, outSource, outStatus, outType, outMediaOnly, outQuery]);

  const showcaseCounts = useMemo(() => {
    let completed = 0;
    let active = 0;
    let artworks = 0;
    let workCount = 0;
    let studioCount = 0;
    let files = 0;
    for (const it of filteredShowcase) {
      if (it.completed) completed++;
      else active++;
      artworks += it.artworkCount;
      if (it.source === "work") workCount++;
      else studioCount++;
      files += it.media.length;
    }
    return { completed, active, artworks, workCount, studioCount, files };
  }, [filteredShowcase]);

  const typeChartData = useMemo(() => {
    return output.byType.slice(0, 8).map((row, idx) => ({
      ...row,
      shortName:
        row.designType.length > 18
          ? `${row.designType.slice(0, 16)}…`
          : row.designType,
      color: TYPE_COLORS[idx % TYPE_COLORS.length]!,
    }));
  }, [output.byType]);

  const blankTask = (status: WorkStatus = "Current"): WorkTask => ({
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
    company: "",
    dueDate: status === "Completed" ? "" : today(),
    completedDate: status === "Completed" ? today() : "",
    notes: "",
    media: [],
  });

  const saveTask = (next: WorkTask) => {
    const clean: WorkTask = {
      ...next,
      artworkCount: Math.max(1, Number(next.artworkCount) || 1),
      completedDate:
        next.status === "Completed"
          ? next.completedDate || today()
          : next.completedDate,
    };
    setDB((d) => ({
      ...d,
      workTasks: upsert(d.workTasks ?? [], clean),
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

  return (
    <>
      <PageHeader
        title="Full-Time Work"
        owner={db.settings.ownerName}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Btn
              type="button"
              onClick={() => setImportOpen(true)}
              className="whitespace-nowrap shrink-0"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Import CSV / Bulk
            </Btn>
            <Btn
              type="button"
              variant="gold"
              onClick={() => setEditingTask(blankTask("Current"))}
              className="whitespace-nowrap shrink-0"
            >
              <Plus className="h-4 w-4" />
              Add work task
            </Btn>
          </div>
        }
      />

      <WorkspaceBalanceCard workspace="work" />

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <SlidingTabs
          layoutGroup="work-main-tabs"
          value={tab}
          onChange={setTab}
          options={[
            {
              id: "tasks",
              label: "Work Tasks",
              icon: Briefcase,
              badge: workTasks.length,
            },
            {
              id: "output",
              label: "Design Output & Gallery (Studio + Work)",
              icon: Layers,
              badge: output.completedTotal,
            },
          ]}
        />
        <p className="text-xs text-muted-foreground">
          Upload PNG, JPEG &amp; PDF mockups to showcase every completed design
          across full-time work &amp; studio freelance.
        </p>
      </div>

      {tab === "tasks" ? (
        <div className="space-y-4">
          {/* Tasks KPI Strip */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Glass className="p-4">
              <Stat
                label="Current tasks"
                value={String(
                  workTasks.filter((t) => t.status === "Current").length,
                )}
              />
            </Glass>
            <Glass className="p-4">
              <Stat
                label="In review"
                value={String(
                  workTasks.filter((t) => t.status === "In review").length,
                )}
              />
            </Glass>
            <Glass className="p-4">
              <Stat
                label="Completed tasks"
                tone="pos"
                value={String(
                  workTasks.filter((t) => t.status === "Completed").length,
                )}
              />
            </Glass>
            <Glass className="p-4">
              <Stat
                label="Full-time artworks"
                value={String(
                  workTasks.reduce(
                    (s, t) => s + Math.max(1, Number(t.artworkCount) || 1),
                    0,
                  ),
                )}
              />
            </Glass>
          </div>

          {/* Filter & List Glass */}
          <Glass>
            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  className="field pl-9"
                  placeholder="Search task title, code, company, design type…"
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
                <div className="w-44">
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
                    ? "Add your current and completed full-time design tasks with PNG/JPEG/PDF mockups, or bulk-import from CSV."
                    : "Clear search or switch status filter to see more work tasks."}
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <Btn
                    type="button"
                    variant="gold"
                    onClick={() => setEditingTask(blankTask("Current"))}
                    className="text-xs"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add first work task
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
                {filteredTasks.map((t) => {
                  const thumb = t.media.find(
                    (m) => m.kind === "image" && m.dataUrl,
                  );
                  const hasPdf = t.media.some((m) => m.kind === "pdf");
                  const done = t.status === "Completed";
                  const dateShown = done ? t.completedDate : t.dueDate;
                  return (
                    <li
                      key={t.id}
                      className="flex flex-wrap items-center justify-between gap-3 py-3 transition-colors hover:bg-muted/35 sm:flex-nowrap sm:px-2 sm:rounded-xl"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <button
                          type="button"
                          onClick={() => toggleTaskComplete(t)}
                          title={done ? "Mark as current" : "Mark as completed"}
                          aria-label={
                            done ? "Mark as current" : "Mark as completed"
                          }
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

                        {/* Thumbnail / PDF indicator */}
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
                                  subtitle: t.company || "Full-time design",
                                  designType: t.designType,
                                  status: t.status,
                                  completed: done,
                                  date: dateShown,
                                  artworkCount: t.artworkCount,
                                  media: t.media,
                                  notes: t.notes,
                                },
                              });
                            } else {
                              setEditingTask(t);
                            }
                          }}
                          className="grid h-12 w-14 shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-muted/60 hover:border-primary/60"
                        >
                          {thumb?.dataUrl ? (
                            <img
                              src={thumb.dataUrl}
                              alt={t.title}
                              className="h-full w-full object-cover"
                            />
                          ) : hasPdf ? (
                            <FileText className="h-5 w-5 text-primary" />
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
                            {t.company ? ` · ${t.company}` : ""}
                            {dateShown
                              ? ` · ${done ? "Completed" : "Due"} ${shortDate(dateShown)}`
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
                })}
              </ul>
            )}
          </Glass>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Unified Filter Bar */}
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
                <div className="relative min-w-48 flex-1 sm:flex-none">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    className="field h-9 pl-8 text-xs"
                    placeholder="Search project, client, design type…"
                    value={outQuery}
                    onChange={(e) => setOutQuery(e.target.value)}
                  />
                </div>
                <div className="w-44">
                  <Sel
                    value={outType === "All" ? "" : outType}
                    placeholder="All design types"
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
                  <span>With PNG/JPEG/PDF</span>
                </button>
              </div>
            </div>
          </Glass>

          {/* 1. Numbers Strip */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <Glass className="p-4">
              <Stat
                label="Completed works"
                tone="pos"
                value={String(showcaseCounts.completed)}
              />
            </Glass>
            <Glass className="p-4">
              <Stat
                label="Active / in progress"
                value={String(showcaseCounts.active)}
              />
            </Glass>
            <Glass className="p-4">
              <Stat
                label="Total artworks"
                value={String(showcaseCounts.artworks)}
              />
            </Glass>
            <Glass className="p-4">
              <Stat
                label="Full-time vs Studio"
                value={`${showcaseCounts.workCount} / ${showcaseCounts.studioCount}`}
              />
            </Glass>
            <Glass className="col-span-2 p-4 sm:col-span-1">
              <Stat
                label="Mockups & PDFs"
                value={String(showcaseCounts.files)}
              />
            </Glass>
          </div>

          {/* 2. Charts Row */}
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Design Types Chart */}
            <Glass>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="font-medium">Design types created</h2>
                  <p className="text-xs text-muted-foreground">
                    Projects &amp; artwork count across Full-Time Work + Studio
                  </p>
                </div>
                <SlidingTabs
                  size="xs"
                  layoutGroup="work-type-chart-mode"
                  value={chartView}
                  onChange={setChartView}
                  options={[
                    { id: "bar", label: "Bar" },
                    { id: "pie", label: "Pie" },
                  ]}
                />
              </div>

              {typeChartData.length === 0 ? (
                <Empty>No design items to chart yet.</Empty>
              ) : chartView === "pie" ? (
                <div className="grid items-center gap-4 sm:grid-cols-[200px_minmax(0,1fr)]">
                  <div className="mx-auto h-52 w-52">
                    <ResponsiveContainer width={208} height={208}>
                      <PieChart>
                        <Pie
                          data={typeChartData}
                          dataKey="totalProjects"
                          nameKey="designType"
                          innerRadius={56}
                          outerRadius={86}
                          paddingAngle={3}
                          cornerRadius={5}
                          stroke="none"
                        >
                          {typeChartData.map((row) => (
                            <Cell key={row.designType} fill={row.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          content={({ active, payload }) => {
                            if (!active || !payload?.length) return null;
                            const r = payload[0]?.payload as
                              (typeof typeChartData)[number] | undefined;
                            if (!r) return null;
                            return (
                              <div className="rounded-xl border border-border bg-popover/95 px-3 py-2 text-xs shadow-xl backdrop-blur-md">
                                <p className="font-medium text-foreground">
                                  {r.designType}
                                </p>
                                <p className="font-num mt-0.5 text-primary">
                                  {r.totalProjects} projects · {r.artworkCount}{" "}
                                  artworks
                                </p>
                                <p className="font-num text-[0.68rem] text-muted-foreground">
                                  Work {r.workProjects} · Studio{" "}
                                  {r.studioProjects}
                                </p>
                              </div>
                            );
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <ul className="space-y-1.5">
                    {typeChartData.map((row) => (
                      <li
                        key={row.designType}
                        className="flex items-center justify-between gap-2 text-xs"
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: row.color }}
                          />
                          <span className="truncate font-medium">
                            {row.designType}
                          </span>
                        </span>
                        <span className="font-num shrink-0 text-muted-foreground">
                          {row.totalProjects} ({row.artworkCount} pcs)
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart
                      data={typeChartData}
                      layout="vertical"
                      margin={{ top: 4, right: 16, left: 4, bottom: 4 }}
                    >
                      <CartesianGrid
                        stroke="var(--border)"
                        strokeDasharray="3 6"
                        horizontal={false}
                      />
                      <XAxis
                        type="number"
                        allowDecimals={false}
                        tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="shortName"
                        width={126}
                        tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const r = payload[0]?.payload as
                            (typeof typeChartData)[number] | undefined;
                          if (!r) return null;
                          return (
                            <div className="rounded-xl border border-border bg-popover/95 px-3 py-2 text-xs shadow-xl backdrop-blur-md">
                              <p className="font-medium text-foreground">
                                {r.designType}
                              </p>
                              <p className="font-num mt-0.5 text-primary">
                                Work: {r.workProjects} · Studio:{" "}
                                {r.studioProjects}
                              </p>
                              <p className="font-num text-[0.68rem] text-muted-foreground">
                                {r.completedProjects} completed ·{" "}
                                {r.artworkCount} artworks
                              </p>
                            </div>
                          );
                        }}
                      />
                      <Bar
                        dataKey="studioProjects"
                        name="Freelance Studio"
                        stackId="a"
                        fill="var(--primary)"
                        radius={[0, 0, 0, 0]}
                      />
                      <Bar
                        dataKey="workProjects"
                        name="Full-Time Work"
                        stackId="a"
                        fill="var(--chart-3)"
                        radius={[0, 6, 6, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Glass>

            {/* Monthly Output Trend Chart */}
            <Glass>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="font-medium">
                    Completed works · last 12 months
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Full-Time Work tasks + Studio delivered/closed projects
                  </p>
                </div>
                <div className="flex items-center gap-3 text-[0.72rem] text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    Studio
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: "var(--chart-3)" }}
                    />
                    Work
                  </span>
                </div>
              </div>

              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart
                    data={output.monthlyTrend}
                    margin={{ top: 8, right: 12, left: 0, bottom: 2 }}
                  >
                    <CartesianGrid
                      stroke="var(--border)"
                      strokeDasharray="3 6"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      minTickGap={24}
                    />
                    <YAxis
                      width={34}
                      allowDecimals={false}
                      tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const row = payload[0]?.payload as
                          (typeof output.monthlyTrend)[number] | undefined;
                        if (!row) return null;
                        return (
                          <div className="rounded-xl border border-border bg-popover/95 px-3 py-2 text-xs shadow-xl backdrop-blur-md">
                            <p className="font-medium text-foreground">
                              {row.fullDate}
                            </p>
                            <p className="font-num mt-0.5 text-primary">
                              Completed: {row.total} ({row.artworks} artworks)
                            </p>
                            <p className="font-num text-[0.68rem] text-muted-foreground">
                              Studio {row.studio} · Full-Time Work {row.work}
                            </p>
                          </div>
                        );
                      }}
                    />
                    <Bar
                      dataKey="studio"
                      name="Studio"
                      stackId="out"
                      fill="var(--primary)"
                      radius={[0, 0, 0, 0]}
                    />
                    <Bar
                      dataKey="work"
                      name="Work"
                      stackId="out"
                      fill="var(--chart-3)"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Glass>
          </div>

          {/* 3. Pictures & PDF Mockup Gallery */}
          <Glass>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-display text-lg font-bold">
                  Completed Designs &amp; Mockups ({filteredShowcase.length})
                </h2>
                <p className="text-xs text-muted-foreground">
                  Click any card to view full PNG, JPEG, or PDF previews, or
                  attach design files.
                </p>
              </div>
              <Btn
                type="button"
                onClick={() => setEditingTask(blankTask("Completed"))}
                className="px-3 py-1.5 text-xs"
              >
                <Upload className="h-3.5 w-3.5" />
                Add completed work + mockup
              </Btn>
            </div>

            {filteredShowcase.length === 0 ? (
              <Empty>No design works match this filter.</Empty>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredShowcase.slice(0, 36).map((item) => {
                  const coverImg = item.media.find(
                    (m) => m.kind === "image" && m.dataUrl,
                  );
                  const firstPdf = item.media.find((m) => m.kind === "pdf");
                  return (
                    <article
                      key={`${item.source}-${item.id}`}
                      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-muted/35 transition-all hover:-translate-y-0.5 hover:border-primary/50"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          if (item.media.length > 0) {
                            setLightboxState({ item });
                          } else if (item.source === "work") {
                            const found = workTasks.find(
                              (w) => w.id === item.id,
                            );
                            if (found) setEditingTask(found);
                          } else {
                            const proj = db.projects.find(
                              (p) => p.id === item.id,
                            );
                            if (proj) {
                              setStudioMediaDraft({
                                projectId: proj.id,
                                title: proj.name || proj.code,
                                artworkCount: Math.max(
                                  1,
                                  Number(proj.artworkCount) || 1,
                                ),
                                media: Array.isArray(proj.media)
                                  ? proj.media
                                  : [],
                              });
                            }
                          }
                        }}
                        className="relative aspect-[4/3] w-full overflow-hidden border-b border-border/60 bg-background/50 text-left"
                      >
                        {coverImg?.dataUrl ? (
                          <img
                            src={coverImg.dataUrl}
                            alt={item.title}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : firstPdf ? (
                          <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-center">
                            <span className="grid h-12 w-12 place-items-center rounded-2xl border border-primary/40 bg-primary/15 text-primary">
                              <FileText className="h-6 w-6" />
                            </span>
                            <span className="line-clamp-1 max-w-full px-2 text-xs font-medium text-foreground">
                              {firstPdf.name}
                            </span>
                            <span className="font-num text-[0.66rem] uppercase tracking-wider text-primary">
                              PDF Mockup · Click to view
                            </span>
                          </div>
                        ) : (
                          <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 p-4 text-center">
                            <ImageIcon className="h-6 w-6 text-muted-foreground/50" />
                            <span className="text-xs font-medium text-muted-foreground">
                              No mockup attached
                            </span>
                            <span className="text-[0.68rem] text-primary">
                              Click to upload PNG / JPEG / PDF
                            </span>
                          </div>
                        )}
                      </button>

                      <div className="flex flex-1 flex-col justify-between p-3.5">
                        <div>
                          <div className="font-num flex items-center justify-between gap-2 text-[0.7rem] text-muted-foreground">
                            <span>
                              {item.source === "work"
                                ? "Full-Time Work"
                                : "Freelance Studio"}
                              {" · "}
                              {item.code}
                            </span>
                            <span>
                              {item.artworkCount}{" "}
                              {item.artworkCount === 1 ? "pc" : "pcs"}
                            </span>
                          </div>
                          <h3 className="mt-1 line-clamp-1 font-display text-sm font-bold text-foreground">
                            {item.title}
                          </h3>
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">
                            {item.designType} · {item.subtitle}
                          </p>
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/50 pt-2.5 text-xs">
                          <span className="font-num text-[0.7rem] text-muted-foreground">
                            {item.date ? shortDate(item.date) : item.status}
                          </span>
                          <div className="flex items-center gap-2">
                            <MediaCountBadge media={item.media} />
                            <button
                              type="button"
                              onClick={() => {
                                if (item.source === "work") {
                                  const found = workTasks.find(
                                    (w) => w.id === item.id,
                                  );
                                  if (found) setEditingTask(found);
                                } else {
                                  const proj = db.projects.find(
                                    (p) => p.id === item.id,
                                  );
                                  if (proj) {
                                    setStudioMediaDraft({
                                      projectId: proj.id,
                                      title: proj.name || proj.code,
                                      artworkCount: Math.max(
                                        1,
                                        Number(proj.artworkCount) || 1,
                                      ),
                                      media: Array.isArray(proj.media)
                                        ? proj.media
                                        : [],
                                    });
                                  }
                                }
                              }}
                              className="text-xs font-medium text-primary hover:underline"
                            >
                              {item.media.length > 0 ? "Manage" : "+ Attach"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </Glass>
        </div>
      )}

      {/* Work Task Editor Drawer */}
      <WorkTaskDrawer
        task={editingTask}
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
        onPreviewMedia={(draft, m) =>
          setLightboxState({
            item: {
              id: draft.id,
              source: "work",
              code: draft.code,
              title: draft.title || draft.code,
              subtitle: draft.company || "Full-time design",
              designType: draft.designType,
              status: draft.status,
              completed: draft.status === "Completed",
              date: draft.completedDate || draft.dueDate,
              artworkCount: draft.artworkCount,
              media: draft.media,
              notes: draft.notes,
            },
            mediaId: m.id,
          })
        }
      />

      {/* Quick Studio Project Media Drawer (attach mockups/PDFs right from Gallery) */}
      <SlideDrawer
        open={Boolean(studioMediaDraft)}
        onClose={() => setStudioMediaDraft(null)}
        title={studioMediaDraft?.title ?? "Project mockups"}
        subtitle="Studio project design files"
        side="right"
      >
        {studioMediaDraft && (
          <div className="space-y-4">
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
                  setLightboxState({
                    item: {
                      id: proj.id,
                      source: "studio",
                      code: proj.code,
                      title: studioMediaDraft.title,
                      subtitle:
                        db.clients.find((c) => c.id === proj.clientId)?.name ??
                        "Freelance Studio",
                      designType: "Design",
                      status: proj.status,
                      completed:
                        proj.status === "Delivered" || proj.status === "Closed",
                      date: proj.delivered || proj.due || proj.start,
                      artworkCount: studioMediaDraft.artworkCount,
                      media: studioMediaDraft.media,
                      notes: "",
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
  isExisting,
  onClose,
  onSave,
  onDelete,
  onPreviewMedia,
}: {
  task: WorkTask | null;
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
            className="field"
            placeholder="e.g. Monthly social campaign visuals"
            value={draft.title}
            onChange={(e) => setField("title", e.target.value)}
            required
          />
        </F>

        <F label="Code" className="col-span-2 sm:col-span-1">
          <input
            className="field font-num"
            value={draft.code}
            onChange={(e) => setField("code", e.target.value)}
          />
        </F>

        <F label="Company / Team" className="col-span-2 sm:col-span-1">
          <input
            className="field"
            placeholder="e.g. Marketing Dept"
            value={draft.company}
            onChange={(e) => setField("company", e.target.value)}
          />
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

        <F
          label={
            draft.status === "Completed" ? "Completed date" : "Target due date"
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
          Paste rows from Excel, Google Sheets, or Notion using the columns:{" "}
          <span className="font-medium text-foreground">
            Title, Design Type, Status, Artworks, Company, Date (YYYY-MM-DD)
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
              "Khmer New Year Key Visual, Social & Campaign, Completed, 8, Brand Team, 2026-04-10\nProduct Catalog Layout, Print & Collateral, Current, 24, Print Dept, 2026-11-25"
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
                    {t.code} · {t.title}
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
