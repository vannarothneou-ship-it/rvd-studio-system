import { useMemo, useState } from "react";
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
  ArrowUpRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Copy,
  Download,
  FileText,
  Grid2x2,
  LayoutGrid,
  ListChecks,
  Paperclip,
  Pencil,
  Printer,
  Sparkles,
  Star,
  Upload,
} from "lucide-react";
import { Btn, Empty, Glass, SlidingTabs, Stat } from "@/components/rv/ui";
import { workProjectAccent } from "@/components/rv/workProjectColors";
import { shortDate, today, type ShowcaseWorkItem } from "@/lib/store";
import { cn } from "@/lib/utils";

const TYPE_COLORS = [
  "var(--primary)",
  "oklch(0.78 0.13 155)",
  "oklch(0.68 0.12 245)",
  "oklch(0.72 0.15 48)",
  "oklch(0.7 0.14 22)",
  "oklch(0.68 0.12 300)",
  "oklch(0.74 0.08 190)",
  "oklch(0.65 0.03 70)",
];

function monogramFor(name: string): string {
  const words = name
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return "RV";
  if (words.length === 1) return words[0]!.slice(0, 3).toUpperCase();
  return (words[0]![0]! + words[1]![0]!).toUpperCase();
}

export function PortfolioGalleryCard({
  item,
  density = "editorial",
  onOpenPreviewOrAttach,
  onManage,
  onToggleFeatured,
  onOpenCaseStudy,
}: {
  item: ShowcaseWorkItem;
  density?: "editorial" | "sheet";
  onOpenPreviewOrAttach: (item: ShowcaseWorkItem) => void;
  onManage: (item: ShowcaseWorkItem) => void;
  onToggleFeatured: (item: ShowcaseWorkItem) => void;
  onOpenCaseStudy?: ((item: ShowcaseWorkItem) => void) | undefined;
}) {
  const [slideIdx, setSlideIdx] = useState(0);
  const accent = workProjectAccent(item.projectGroup);
  const hasMedia = item.media.length > 0;
  const slideCount = item.media.length;
  const safeIdx =
    slideCount > 0 ? ((slideIdx % slideCount) + slideCount) % slideCount : 0;
  const activeMedia = slideCount > 0 ? item.media[safeIdx] : undefined;

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card/65 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/45",
      )}
    >
      {/* Visual Stage */}
      <div className="relative">
        <button
          type="button"
          onClick={() => onOpenPreviewOrAttach(item)}
          className={cn(
            "relative block w-full overflow-hidden border-b border-border/60 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            density === "editorial" ? "aspect-[16/10]" : "aspect-[4/3]",
          )}
        >
          {activeMedia?.kind === "image" && activeMedia.dataUrl ? (
            <div className="relative flex h-full w-full items-center justify-center bg-muted/70 p-3 light:bg-[#efece6]">
              <img
                src={activeMedia.dataUrl}
                alt={`${item.title} · ${activeMedia.name}`}
                referrerPolicy="no-referrer"
                className="max-h-full max-w-full rounded-lg object-contain transition-transform duration-300 ease-out group-hover:scale-[1.03]"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/55 via-black/15 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
              <span className="pointer-events-none absolute bottom-2.5 right-3 inline-flex items-center gap-1 text-[0.72rem] font-medium text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                Inspect
                <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </div>
          ) : activeMedia?.kind === "pdf" ? (
            <div className="relative flex h-full w-full flex-col justify-between bg-gradient-to-br from-muted/80 via-background to-muted/40 p-4">
              <div className="flex items-center justify-between text-[0.68rem] text-muted-foreground">
                <span className="font-num font-semibold tracking-wide text-primary">
                  PDF FOLIO
                </span>
                <span className="font-num">{item.code}</span>
              </div>
              <div className="my-auto flex items-center gap-3 py-2">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-primary/35 bg-primary/10 text-primary">
                  <FileText className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-foreground">
                    {activeMedia.name}
                  </p>
                  <p className="text-[0.7rem] text-muted-foreground">
                    Click to open specification
                  </p>
                </div>
              </div>
              <div className="h-px w-full bg-border/60" />
            </div>
          ) : activeMedia ? (
            <div className="relative flex h-full w-full flex-col justify-between bg-gradient-to-br from-muted/75 via-background to-muted/40 p-4">
              <div className="flex items-center justify-between text-[0.68rem] text-muted-foreground">
                <span className="font-num font-semibold tracking-wide text-primary">
                  HI-RES FILE
                </span>
                <span className="font-num">{item.code}</span>
              </div>
              <div className="my-auto flex items-center gap-3 py-2">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-primary/35 bg-primary/10 text-primary">
                  <Paperclip className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-foreground">
                    {activeMedia.name}
                  </p>
                  <p className="text-[0.7rem] text-muted-foreground">
                    Click to inspect full image
                  </p>
                </div>
              </div>
              <div className="h-px w-full bg-border/60" />
            </div>
          ) : (
            <div className="relative flex h-full w-full flex-col justify-between bg-gradient-to-br from-muted/65 via-background/85 to-muted/30 p-4">
              <div className="flex items-center justify-between">
                <span className="font-num text-[0.7rem] font-medium text-muted-foreground">
                  {item.code}
                </span>
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: accent.dot }}
                />
              </div>
              <div className="my-auto flex items-baseline justify-between gap-3">
                <span className="font-display text-2xl font-bold tracking-tight text-foreground/85">
                  {monogramFor(item.projectGroup || item.title)}
                </span>
                <span className="text-[0.72rem] text-muted-foreground group-hover:text-primary">
                  Attach mockup
                </span>
              </div>
              <div className="flex items-center justify-between text-[0.68rem] text-muted-foreground">
                <span className="truncate">{item.designType}</span>
                <span>{item.status}</span>
              </div>
            </div>
          )}
        </button>

        {/* Multi-Image Carousel Controls + Slide Counter */}
        {slideCount > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSlideIdx((i) => i - 1);
              }}
              aria-label="Previous mockup"
              className="absolute left-2 top-1/2 z-10 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg border border-white/20 bg-black/65 text-white opacity-90 transition-all hover:bg-black/85 sm:opacity-0 sm:group-hover:opacity-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSlideIdx((i) => i + 1);
              }}
              aria-label="Next mockup"
              className="absolute right-2 top-1/2 z-10 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg border border-white/20 bg-black/65 text-white opacity-90 transition-all hover:bg-black/85 sm:opacity-0 sm:group-hover:opacity-100"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <span className="font-num pointer-events-none absolute left-2.5 top-2.5 z-10 rounded-md border border-white/15 bg-black/65 px-2 py-0.5 text-[0.65rem] font-semibold text-white">
              {safeIdx + 1} / {slideCount}
            </span>
          </>
        )}

        {/* Star / Feature quick toggle */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFeatured(item);
          }}
          title={
            item.featured
              ? "Remove from Portfolio Highlights"
              : "Feature in Portfolio Summary"
          }
          aria-label={
            item.featured
              ? "Remove from Portfolio Highlights"
              : "Feature in Portfolio Summary"
          }
          className={cn(
            "absolute right-2.5 top-2.5 z-10 grid h-8 w-8 place-items-center rounded-lg border transition-all",
            item.featured
              ? "border-primary/60 bg-primary text-primary-foreground shadow-sm"
              : "border-white/15 bg-black/55 text-white/80 opacity-0 hover:text-white group-hover:opacity-100",
          )}
        >
          <Star
            className="h-3.5 w-3.5"
            fill={item.featured ? "currentColor" : "none"}
          />
        </button>
      </div>

      {/* Editorial Body — zero-pill metadata with typographic separators */}
      <div className="flex flex-1 flex-col justify-between gap-3 p-4">
        <div className="min-w-0">
          <div className="flex items-center justify-between gap-2 text-[0.72rem] text-muted-foreground">
            <span className="flex min-w-0 items-center gap-1.5 truncate">
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full"
                style={{ backgroundColor: accent.dot }}
              />
              <span className="truncate font-medium text-foreground/85">
                {item.projectGroup}
              </span>
              <span aria-hidden="true">·</span>
              <span className="truncate">{item.designType}</span>
            </span>
            <span className="font-num shrink-0">
              {item.artworkCount} {item.artworkCount === 1 ? "pc" : "pcs"}
            </span>
          </div>

          <h3 className="mt-1.5 line-clamp-1 font-display text-[1rem] font-bold tracking-tight text-foreground">
            {item.title}
          </h3>

          {item.notes ? (
            <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
              {item.notes}
            </p>
          ) : (
            <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
              {item.source === "work" ? "Full-Time Work" : "Freelance Studio"} ·{" "}
              {item.code}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border/60 pt-2.5 text-xs">
          <span className="font-num truncate text-[0.72rem] text-muted-foreground">
            {item.date ? shortDate(item.date) : item.status}
            {hasMedia
              ? ` · ${item.media.length} ${item.media.length === 1 ? "file" : "files"}`
              : ""}
          </span>

          <div className="flex shrink-0 items-center gap-2.5">
            {onOpenCaseStudy && (
              <button
                type="button"
                onClick={() => onOpenCaseStudy(item)}
                className="inline-flex items-center gap-1 text-xs font-medium text-primary/90 transition-colors hover:text-primary hover:underline"
              >
                <Sparkles className="h-3 w-3" />
                <span>Case Study</span>
              </button>
            )}
            {hasMedia && (
              <button
                type="button"
                onClick={() => onOpenPreviewOrAttach(item)}
                className="text-xs font-medium text-foreground/80 transition-colors hover:text-primary"
              >
                Preview
              </button>
            )}
            <button
              type="button"
              onClick={() => onManage(item)}
              className="text-xs font-medium text-primary hover:underline"
            >
              {hasMedia ? "Edit" : "Attach"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export function PortfolioGallerySection({
  items,
  onOpenPreviewOrAttach,
  onManage,
  onToggleFeatured,
  onAddNewCompleted,
  onOpenCaseStudy,
  onCreateCaseStudyFromFiles,
  onDropFilesForCaseStudy,
}: {
  items: ShowcaseWorkItem[];
  onOpenPreviewOrAttach: (item: ShowcaseWorkItem) => void;
  onManage: (item: ShowcaseWorkItem) => void;
  onToggleFeatured: (item: ShowcaseWorkItem) => void;
  onAddNewCompleted: () => void;
  onOpenCaseStudy?: ((item: ShowcaseWorkItem) => void) | undefined;
  onCreateCaseStudyFromFiles?: (() => void) | undefined;
  onDropFilesForCaseStudy?: ((files: FileList) => void) | undefined;
}) {
  const [layoutMode, setLayoutMode] = useState<"editorial" | "sheet" | "table">(
    "editorial",
  );
  const [includeTextOnlyInGrid, setIncludeTextOnlyInGrid] = useState(false);
  const [archiveExpanded, setArchiveExpanded] = useState(false);
  const [showLimit, setShowLimit] = useState(18);
  const [droppingCaseFiles, setDroppingCaseFiles] = useState(false);

  const visualItems = useMemo(
    () => items.filter((it) => it.media.length > 0),
    [items],
  );
  const archiveItems = useMemo(
    () => items.filter((it) => it.media.length === 0),
    [items],
  );

  const gridItems = includeTextOnlyInGrid
    ? items
    : visualItems.length > 0
      ? visualItems
      : items;

  const visibleGrid = gridItems.slice(0, showLimit);
  const visibleArchive = archiveExpanded
    ? archiveItems
    : archiveItems.slice(0, 8);

  return (
    <div className="space-y-5">
      <Glass>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-bold">
              {layoutMode === "table"
                ? `Portfolio Index (${items.length})`
                : visualItems.length > 0 && !includeTextOnlyInGrid
                  ? `Visual Portfolio (${visualItems.length})`
                  : `Design Works (${gridItems.length})`}
            </h2>
            <p className="text-xs text-muted-foreground">
              Click any piece to inspect full-resolution PNG, JPEG, or PDF
              mockups, or star favorites for your Portfolio Summary.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {layoutMode !== "table" &&
              visualItems.length > 0 &&
              archiveItems.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIncludeTextOnlyInGrid((v) => !v)}
                  className={cn(
                    "inline-flex min-h-[34px] items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                    includeTextOnlyInGrid
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-border bg-secondary text-muted-foreground hover:text-foreground",
                  )}
                >
                  <span>
                    {includeTextOnlyInGrid
                      ? `Showing all (${items.length})`
                      : `+${archiveItems.length} text-only`}
                  </span>
                </button>
              )}

            <SlidingTabs
              size="xs"
              layoutGroup="portfolio-gallery-mode"
              value={layoutMode}
              onChange={setLayoutMode}
              options={[
                { id: "editorial", label: "Editorial", icon: LayoutGrid },
                { id: "sheet", label: "Contact Sheet", icon: Grid2x2 },
                { id: "table", label: "Index Table", icon: ListChecks },
              ]}
            />

            {onCreateCaseStudyFromFiles && (
              <Btn
                type="button"
                onClick={onCreateCaseStudyFromFiles}
                className="px-3.5 py-1.5 text-xs"
              >
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Auto Case Study
              </Btn>
            )}

            <Btn
              type="button"
              variant="gold"
              onClick={onAddNewCompleted}
              className="px-3.5 py-1.5 text-xs"
            >
              <Upload className="h-3.5 w-3.5" />
              Add work &amp; mockup
            </Btn>
          </div>
        </div>

        {(onDropFilesForCaseStudy || onCreateCaseStudyFromFiles) && (
          <div
            role="button"
            tabIndex={0}
            onClick={() => onCreateCaseStudyFromFiles?.()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onCreateCaseStudyFromFiles?.();
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDroppingCaseFiles(true);
            }}
            onDragLeave={() => setDroppingCaseFiles(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDroppingCaseFiles(false);
              if (e.dataTransfer.files?.length && onDropFilesForCaseStudy) {
                onDropFilesForCaseStudy(e.dataTransfer.files);
              }
            }}
            className={cn(
              "mb-4 flex cursor-pointer flex-col items-center justify-between gap-3 rounded-2xl border border-dashed px-4 py-3.5 text-center transition-colors sm:flex-row sm:text-left",
              droppingCaseFiles
                ? "border-primary bg-primary/15 text-foreground"
                : "border-primary/35 bg-primary/6 text-muted-foreground hover:border-primary/65 hover:bg-primary/10 hover:text-foreground",
            )}
          >
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-primary/40 bg-primary/15 text-primary">
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-semibold text-foreground">
                  Drag &amp; Drop Portfolio Builder — PNG, JPEG, or PDF
                </p>
                <p className="text-[0.7rem] text-muted-foreground">
                  Drop mockups here to auto-generate an editable Case Study
                  template and export a client PDF.
                </p>
              </div>
            </div>
            <span className="shrink-0 rounded-lg border border-primary/40 bg-card px-3 py-1 text-[0.7rem] font-semibold text-primary">
              Drop or Browse Files
            </span>
          </div>
        )}

        {items.length === 0 ? (
          <Empty>No design works match this filter.</Empty>
        ) : layoutMode === "table" ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-xs">
              <thead>
                <tr className="border-b border-border text-[0.68rem] uppercase tracking-wider text-muted-foreground">
                  <th className="py-2.5 pr-3 font-semibold">Work / Title</th>
                  <th className="px-3 py-2.5 font-semibold">
                    Project / Client
                  </th>
                  <th className="px-3 py-2.5 font-semibold">Discipline</th>
                  <th className="px-3 py-2.5 text-right font-semibold">
                    Artworks
                  </th>
                  <th className="px-3 py-2.5 font-semibold">Date</th>
                  <th className="px-3 py-2.5 font-semibold">Files</th>
                  <th className="py-2.5 pl-3 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {items.slice(0, showLimit + 18).map((it) => {
                  const accent = workProjectAccent(it.projectGroup);
                  return (
                    <tr
                      key={`${it.source}-${it.id}`}
                      className="transition-colors hover:bg-muted/35"
                    >
                      <td className="py-2.5 pr-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onToggleFeatured(it)}
                            className={cn(
                              "shrink-0 transition-colors",
                              it.featured
                                ? "text-primary"
                                : "text-muted-foreground/45 hover:text-primary",
                            )}
                            title="Toggle Featured"
                          >
                            <Star
                              className="h-3.5 w-3.5"
                              fill={it.featured ? "currentColor" : "none"}
                            />
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenPreviewOrAttach(it)}
                            className="min-w-0 text-left hover:text-primary"
                          >
                            <span className="block truncate font-semibold text-foreground">
                              {it.title}
                            </span>
                            <span className="font-num text-[0.68rem] text-muted-foreground">
                              {it.code} ·{" "}
                              {it.source === "work" ? "Work" : "Studio"}
                            </span>
                          </button>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="inline-flex items-center gap-1.5 text-foreground/90">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: accent.dot }}
                          />
                          <span className="truncate max-w-40">
                            {it.projectGroup}
                          </span>
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-muted-foreground">
                        {it.designType}
                      </td>
                      <td className="font-num px-3 py-2.5 text-right font-medium">
                        {it.artworkCount}
                      </td>
                      <td className="font-num px-3 py-2.5 text-muted-foreground">
                        {it.date ? shortDate(it.date) : it.status}
                      </td>
                      <td className="px-3 py-2.5">
                        {it.media.length > 0 ? (
                          <button
                            type="button"
                            onClick={() => onOpenPreviewOrAttach(it)}
                            className="font-num inline-flex items-center gap-1 font-medium text-primary hover:underline"
                          >
                            <Paperclip className="h-3 w-3" />
                            <span>{it.media.length}</span>
                          </button>
                        ) : (
                          <span className="text-muted-foreground/60">—</span>
                        )}
                      </td>
                      <td className="py-2.5 pl-3 text-right">
                        <div className="inline-flex items-center gap-3">
                          {onOpenCaseStudy && (
                            <button
                              type="button"
                              onClick={() => onOpenCaseStudy(it)}
                              className="font-medium text-foreground/85 hover:text-primary hover:underline"
                            >
                              Case Study
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onManage(it)}
                            className="font-medium text-primary hover:underline"
                          >
                            {it.media.length > 0 ? "Manage" : "Attach"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <>
            <div
              className={cn(
                "grid gap-4",
                layoutMode === "editorial"
                  ? "sm:grid-cols-2 lg:grid-cols-3"
                  : "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
              )}
            >
              {visibleGrid.map((item) => (
                <PortfolioGalleryCard
                  key={`${item.source}-${item.id}`}
                  item={item}
                  density={layoutMode}
                  onOpenPreviewOrAttach={onOpenPreviewOrAttach}
                  onManage={onManage}
                  onToggleFeatured={onToggleFeatured}
                  onOpenCaseStudy={onOpenCaseStudy}
                />
              ))}
            </div>

            {gridItems.length > showLimit && (
              <div className="mt-4 flex justify-center border-t border-border/60 pt-4">
                <Btn
                  type="button"
                  onClick={() => setShowLimit((n) => n + 18)}
                  className="px-4 py-1.5 text-xs"
                >
                  Load more ({gridItems.length - showLimit} remaining)
                </Btn>
              </div>
            )}
          </>
        )}
      </Glass>

      {/* Clean Compact Archive Index for items awaiting PNG/JPEG/PDF upload */}
      {layoutMode !== "table" &&
        !includeTextOnlyInGrid &&
        visualItems.length > 0 &&
        archiveItems.length > 0 && (
          <Glass>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-display text-base font-bold">
                  Archive Index — Needs Mockup ({archiveItems.length})
                </h3>
                <p className="text-xs text-muted-foreground">
                  Completed &amp; active works kept clean in a compact index
                  until you attach a PNG, JPEG, or PDF.
                </p>
              </div>
              {archiveItems.length > 8 && (
                <Btn
                  type="button"
                  onClick={() => setArchiveExpanded((e) => !e)}
                  className="px-3 py-1 text-xs"
                >
                  {archiveExpanded ? (
                    <>
                      <ChevronUp className="h-3.5 w-3.5" />
                      Show less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3.5 w-3.5" />
                      Show all ({archiveItems.length})
                    </>
                  )}
                </Btn>
              )}
            </div>

            <ul className="divide-y divide-border/70">
              {visibleArchive.map((it) => {
                const accent = workProjectAccent(it.projectGroup);
                return (
                  <li
                    key={`${it.source}-${it.id}`}
                    className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-xs sm:flex-nowrap"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-2.5">
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: accent.dot }}
                      />
                      <span className="font-num shrink-0 text-muted-foreground">
                        {it.code}
                      </span>
                      <span className="truncate font-medium text-foreground">
                        {it.title}
                      </span>
                      <span className="hidden truncate text-muted-foreground md:inline">
                        · {it.projectGroup} · {it.designType}
                      </span>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                      <span className="font-num text-muted-foreground">
                        {it.artworkCount} {it.artworkCount === 1 ? "pc" : "pcs"}
                      </span>
                      <span className="font-num hidden text-muted-foreground sm:inline">
                        {it.date ? shortDate(it.date) : it.status}
                      </span>
                      <button
                        type="button"
                        onClick={() => onManage(it)}
                        className="font-medium text-primary hover:underline"
                      >
                        Attach file
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Glass>
        )}
    </div>
  );
}

export function PortfolioSummaryView({
  headline,
  bio,
  ownerName,
  items,
  byType,
  byProjectGroup,
  monthlyTrend,
  totalArtworks,
  completedTotal,
  activeTotal,
  mediaCount,
  workCompleted,
  studioCompleted,
  onSaveBio,
  onOpenPreviewOrAttach,
  onManage,
  onToggleFeatured,
  onJumpToGalleryProject,
  onJumpToWorkProject,
  onOpenCaseStudy,
  onCreateCaseStudyFromFiles,
}: {
  headline: string;
  bio: string;
  ownerName: string;
  items: ShowcaseWorkItem[];
  byType: {
    designType: string;
    workProjects: number;
    studioProjects: number;
    totalProjects: number;
    completedProjects: number;
    artworkCount: number;
  }[];
  byProjectGroup: {
    projectGroup: string;
    workProjects: number;
    studioProjects: number;
    totalProjects: number;
    completedProjects: number;
    artworkCount: number;
    mediaCount: number;
    latestDate: string;
  }[];
  monthlyTrend: {
    m: string;
    label: string;
    fullDate: string;
    work: number;
    studio: number;
    total: number;
    artworks: number;
  }[];
  totalArtworks: number;
  completedTotal: number;
  activeTotal: number;
  mediaCount: number;
  workCompleted: number;
  studioCompleted: number;
  onSaveBio: (headline: string, bio: string) => void;
  onOpenPreviewOrAttach: (item: ShowcaseWorkItem) => void;
  onManage: (item: ShowcaseWorkItem) => void;
  onToggleFeatured: (item: ShowcaseWorkItem) => void;
  onJumpToGalleryProject: (projectGroup: string) => void;
  onJumpToWorkProject: (projectGroup: string) => void;
  onOpenCaseStudy?: ((item: ShowcaseWorkItem) => void) | undefined;
  onCreateCaseStudyFromFiles?: (() => void) | undefined;
}) {
  const [editingBio, setEditingBio] = useState(false);
  const [draftHeadline, setDraftHeadline] = useState(headline);
  const [draftBio, setDraftBio] = useState(bio);
  const [chartView, setChartView] = useState<"bar" | "pie">("bar");

  const featuredItems = useMemo(() => {
    const starred = items.filter((i) => i.featured);
    if (starred.length > 0) return starred;
    return items.filter((i) => i.media.length > 0).slice(0, 6);
  }, [items]);

  const usingAutoHighlights = useMemo(
    () => !items.some((i) => i.featured),
    [items],
  );

  const typeChartData = useMemo(
    () =>
      byType.slice(0, 8).map((row, idx) => ({
        ...row,
        shortName:
          row.designType.length > 18
            ? `${row.designType.slice(0, 16)}…`
            : row.designType,
        color: TYPE_COLORS[idx % TYPE_COLORS.length]!,
      })),
    [byType],
  );

  const completionPct =
    items.length > 0 ? Math.round((completedTotal / items.length) * 100) : 0;

  const handleCopyMarkdown = async () => {
    const lines: string[] = [
      `# ${headline || "Design Portfolio Summary"}`,
      `Designer: ${ownerName}`,
      "",
      bio,
      "",
      "## Key Output Numbers",
      `- Completed works: ${completedTotal} (${workCompleted} full-time · ${studioCompleted} freelance studio)`,
      `- Active in pipeline: ${activeTotal}`,
      `- Total artworks delivered: ${totalArtworks} pcs`,
      `- Visual mockups & PDFs attached: ${mediaCount}`,
      `- Brands & Project Groups served: ${byProjectGroup.length}`,
      "",
      "## Design Disciplines",
      ...byType.map(
        (t) =>
          `- **${t.designType}**: ${t.completedProjects}/${t.totalProjects} completed (${t.artworkCount} artworks)`,
      ),
      "",
      "## Top Projects & Brands",
      ...byProjectGroup
        .slice(0, 10)
        .map(
          (g) =>
            `- **${g.projectGroup}**: ${g.completedProjects}/${g.totalProjects} works (${g.artworkCount} artworks · ${g.mediaCount} files)`,
        ),
      "",
      "## Selected Highlights",
      ...featuredItems
        .slice(0, 8)
        .map(
          (it) =>
            `- ${it.code} **${it.title}** (${it.projectGroup} · ${it.designType} · ${it.artworkCount} pcs)`,
        ),
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      toast.success("Copied Markdown Portfolio Summary to clipboard");
    } catch {
      toast.error("Clipboard access unavailable");
    }
  };

  const handleExportCsv = () => {
    const esc = (v: string | number | boolean) => {
      const s = String(v ?? "");
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const header = [
      "Code",
      "Title",
      "Source",
      "Project / Client",
      "Design Type",
      "Status",
      "Artworks",
      "Date",
      "Media Files",
      "Featured",
      "Notes",
    ];
    const rows = items.map((it) =>
      [
        it.code,
        it.title,
        it.source === "work" ? "Full-Time Work" : "Freelance Studio",
        it.projectGroup,
        it.designType,
        it.status,
        it.artworkCount,
        it.date,
        it.media.length,
        it.featured ? "Yes" : "No",
        it.notes,
      ]
        .map(esc)
        .join(","),
    );
    const csv = [header.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rothvan-portfolio-summary-${today()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded Portfolio CSV index");
  };

  return (
    <div className="space-y-5">
      {/* Executive Portfolio Monograph Header */}
      <Glass>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-primary">
              Portfolio Summary · {ownerName}
            </p>
            {editingBio ? (
              <form
                className="mt-2 space-y-2.5"
                onSubmit={(e) => {
                  e.preventDefault();
                  onSaveBio(
                    draftHeadline.trim() || "Visual & Brand Design Portfolio",
                    draftBio.trim(),
                  );
                  setEditingBio(false);
                }}
              >
                <input
                  className="field font-display text-lg font-bold"
                  value={draftHeadline}
                  onChange={(e) => setDraftHeadline(e.target.value)}
                  placeholder="Portfolio headline"
                />
                <textarea
                  className="field min-h-20 text-xs"
                  value={draftBio}
                  onChange={(e) => setDraftBio(e.target.value)}
                  placeholder="Short executive bio or focus summary…"
                />
                <div className="flex gap-2">
                  <Btn
                    type="submit"
                    variant="gold"
                    className="px-3.5 py-1.5 text-xs"
                  >
                    Save bio
                  </Btn>
                  <Btn
                    type="button"
                    onClick={() => setEditingBio(false)}
                    className="px-3.5 py-1.5 text-xs"
                  >
                    Cancel
                  </Btn>
                </div>
              </form>
            ) : (
              <>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
                    {headline}
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      setDraftHeadline(headline);
                      setDraftBio(bio);
                      setEditingBio(true);
                    }}
                    className="no-print inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
                  >
                    <Pencil className="h-3 w-3" />
                    <span>Edit</span>
                  </button>
                </div>
                <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  {bio}
                </p>
              </>
            )}
          </div>

          <div className="no-print flex flex-wrap shrink-0 items-center gap-2">
            {onCreateCaseStudyFromFiles && (
              <Btn
                type="button"
                onClick={onCreateCaseStudyFromFiles}
                className="px-3.5 py-1.5 text-xs"
              >
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Auto Case Study
              </Btn>
            )}
            <Btn
              type="button"
              onClick={() => void handleCopyMarkdown()}
              className="px-3.5 py-1.5 text-xs"
            >
              <Copy className="h-3.5 w-3.5" />
              Copy Brief
            </Btn>
            <Btn
              type="button"
              onClick={handleExportCsv}
              className="px-3.5 py-1.5 text-xs"
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </Btn>
            <Btn
              type="button"
              variant="gold"
              onClick={() => window.print()}
              className="px-3.5 py-1.5 text-xs"
            >
              <Printer className="h-3.5 w-3.5" />
              Print Sheet
            </Btn>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4 border-t border-border/70 pt-4 sm:grid-cols-3 lg:grid-cols-5">
          <Stat
            label="Completed works"
            tone="pos"
            value={String(completedTotal)}
          />
          <Stat label="Total artworks" value={`${totalArtworks} pcs`} />
          <Stat
            label="Brands & Projects"
            value={String(byProjectGroup.length)}
          />
          <Stat label="Completion rate" value={`${completionPct}%`} />
          <Stat label="Mockups & PDFs" value={String(mediaCount)} />
        </div>
      </Glass>

      {/* Selected Highlights */}
      <Glass>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-display text-lg font-bold">
              {usingAutoHighlights
                ? "Top Illustrated Works"
                : `Selected Portfolio Highlights (${featuredItems.length})`}
            </h3>
            <p className="text-xs text-muted-foreground">
              {usingAutoHighlights
                ? "Star any work in the gallery or table below to hand-pick your flagship portfolio highlights."
                : "Your curated showcase pieces across full-time work and studio clients."}
            </p>
          </div>
          <span className="font-num text-xs text-muted-foreground">
            {workCompleted} full-time · {studioCompleted} freelance completed
          </span>
        </div>

        {featuredItems.length === 0 ? (
          <Empty>
            Attach PNG, JPEG, or PDF mockups or star your favorite works to
            curate highlights.
          </Empty>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredItems.slice(0, 6).map((item) => (
              <PortfolioGalleryCard
                key={`hl-${item.source}-${item.id}`}
                item={item}
                density="editorial"
                onOpenPreviewOrAttach={onOpenPreviewOrAttach}
                onManage={onManage}
                onToggleFeatured={onToggleFeatured}
                onOpenCaseStudy={onOpenCaseStudy}
              />
            ))}
          </div>
        )}
      </Glass>

      {/* Project & Client Portfolio Breakdown (DBG, Connexion, OCIC, Studio Clients) */}
      <Glass>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-display text-lg font-bold">
              Projects &amp; Brands Summary ({byProjectGroup.length})
            </h3>
            <p className="text-xs text-muted-foreground">
              Consolidated artwork output across Full-Time Projects (e.g. DBG,
              Connexion, OCIC) and Freelance Clients.
            </p>
          </div>
        </div>

        {byProjectGroup.length === 0 ? (
          <Empty>No project activity recorded yet.</Empty>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {byProjectGroup.slice(0, 12).map((grp) => {
              const accent = workProjectAccent(grp.projectGroup);
              const pct =
                grp.totalProjects > 0
                  ? Math.round(
                      (grp.completedProjects / grp.totalProjects) * 100,
                    )
                  : 0;
              return (
                <div
                  key={grp.projectGroup}
                  className="flex flex-col justify-between rounded-2xl border border-border/80 bg-muted/25 p-4 transition-colors hover:border-primary/40"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex min-w-0 items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: accent.dot }}
                        />
                        <span className="truncate font-display text-base font-bold text-foreground">
                          {grp.projectGroup}
                        </span>
                      </span>
                      <span className="font-num shrink-0 text-xs font-semibold text-primary">
                        {grp.artworkCount} pcs
                      </span>
                    </div>

                    <p className="font-num mt-1.5 text-xs text-muted-foreground">
                      {grp.completedProjects}/{grp.totalProjects} works done (
                      {pct}%) · {grp.mediaCount}{" "}
                      {grp.mediaCount === 1 ? "file" : "files"}
                    </p>

                    <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-border/60">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.max(4, pct)}%`,
                          backgroundColor: accent.dot,
                        }}
                      />
                    </div>
                  </div>

                  <div className="no-print mt-3 flex items-center justify-between gap-2 border-t border-border/50 pt-2.5 text-xs">
                    <span className="font-num text-[0.7rem] text-muted-foreground">
                      {grp.workProjects > 0 && grp.studioProjects > 0
                        ? `Work ${grp.workProjects} · Studio ${grp.studioProjects}`
                        : grp.workProjects > 0
                          ? `Full-Time Work (${grp.workProjects})`
                          : `Freelance Studio (${grp.studioProjects})`}
                    </span>
                    <div className="flex items-center gap-3">
                      {grp.workProjects > 0 && (
                        <button
                          type="button"
                          onClick={() => onJumpToWorkProject(grp.projectGroup)}
                          className="font-medium text-muted-foreground hover:text-foreground"
                        >
                          Tasks
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onJumpToGalleryProject(grp.projectGroup)}
                        className="font-medium text-primary hover:underline"
                      >
                        Gallery →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Glass>

      {/* Disciplines & Velocity Analytics */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Glass>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-medium">Design disciplines mix</h3>
              <p className="text-xs text-muted-foreground">
                Projects &amp; artwork output across Full-Time Work + Studio
              </p>
            </div>
            <SlidingTabs
              size="xs"
              layoutGroup="portfolio-type-chart-mode"
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
                              Work {r.workProjects} · Studio {r.studioProjects}
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
                            Work: {r.workProjects} · Studio: {r.studioProjects}
                          </p>
                          <p className="font-num text-[0.68rem] text-muted-foreground">
                            {r.completedProjects} completed · {r.artworkCount}{" "}
                            artworks
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

        <Glass>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-medium">Completed works · last 12 months</h3>
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
                data={monthlyTrend}
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
                      (typeof monthlyTrend)[number] | undefined;
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
    </div>
  );
}
