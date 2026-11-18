import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  AlignCenter,
  AlignLeft,
  ArrowDown,
  ArrowUp,
  Copy,
  Download,
  FileText,
  GripVertical,
  Heading1,
  Heading2,
  Image as ImageIcon,
  LayoutGrid,
  Loader2,
  Minus,
  Quote,
  Sparkles,
  Trash2,
  Type,
  X,
} from "lucide-react";
import { Btn, F, SlidingTabs } from "@/components/rv/ui";
import { DesignMediaUploader } from "@/components/rv/DesignMediaTools";
import { downloadCaseStudy } from "@/lib/case-study-export";
import { loadMediaBlob } from "@/lib/media-store";
import {
  autoBuildCaseStudy,
  uid,
  type CaseStudyAspect,
  type CaseStudyBlock,
  type CaseStudyBlockType,
  type CaseStudyDoc,
  type CaseStudyTheme,
  type DesignMedia,
  type ShowcaseWorkItem,
} from "@/lib/store";
import { cn } from "@/lib/utils";

const BLOCK_ADDS: {
  type: CaseStudyBlockType;
  label: string;
  icon: typeof Heading1;
}[] = [
  { type: "header", label: "Header", icon: Heading1 },
  { type: "subheader", label: "Subheader", icon: Heading2 },
  { type: "paragraph", label: "Paragraph", icon: Type },
  { type: "metrics", label: "Stats", icon: Sparkles },
  { type: "image", label: "Image", icon: ImageIcon },
  { type: "gallery", label: "2-Up", icon: LayoutGrid },
  { type: "quote", label: "Note", icon: Quote },
  { type: "divider", label: "Divider", icon: Minus },
];

export function reorderCaseStudyBlocks(
  blocks: CaseStudyBlock[],
  fromIndex: number,
  toIndex: number,
): CaseStudyBlock[] {
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= blocks.length ||
    toIndex >= blocks.length ||
    fromIndex === toIndex
  ) {
    return blocks;
  }
  const copy = [...blocks];
  const [moved] = copy.splice(fromIndex, 1);
  if (!moved) return blocks;
  copy.splice(toIndex, 0, moved);
  return copy;
}

export function insertCaseStudyBlockAt(
  blocks: CaseStudyBlock[],
  block: CaseStudyBlock,
  index: number,
): CaseStudyBlock[] {
  const safeIndex = Math.max(0, Math.min(blocks.length, index));
  const copy = [...blocks];
  copy.splice(safeIndex, 0, block);
  return copy;
}

type DragPayload =
  | { kind: "block"; blockId: string; index: number; type: CaseStudyBlockType }
  | { kind: "palette"; blockType: CaseStudyBlockType; label: string }
  | { kind: "asset"; mediaId: string; name: string };

function DraggablePaletteChip({
  type,
  label,
  icon: Icon,
  onClick,
}: {
  type: CaseStudyBlockType;
  label: string;
  icon: typeof Heading1;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${type}`,
    data: { kind: "palette", blockType: type, label } satisfies DragPayload,
  });

  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={onClick}
      {...listeners}
      {...attributes}
      title={`Click to add or drag ${label} into canvas`}
      className={cn(
        "inline-flex cursor-grab items-center gap-1 rounded-xl border border-border bg-secondary/75 px-2.5 py-1.5 text-[0.72rem] font-medium text-foreground transition-colors hover:border-primary/50 hover:bg-accent active:cursor-grabbing",
        isDragging && "opacity-45",
      )}
    >
      <Icon className="h-3.5 w-3.5 text-primary" />
      <span>{label}</span>
    </button>
  );
}

function DraggableAssetChip({
  blockId,
  media,
  resolvedUrl,
  selected,
  onClick,
}: {
  blockId: string;
  media: DesignMedia;
  resolvedUrl?: string | undefined;
  selected: boolean;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `asset-chip-${blockId}-${media.id}`,
    data: {
      kind: "asset",
      mediaId: media.id,
      name: media.name,
    } satisfies DragPayload,
  });

  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={onClick}
      {...listeners}
      {...attributes}
      title="Click to toggle or drag onto an Image / 2-Up slot"
      className={cn(
        "flex cursor-grab items-center gap-1.5 rounded-xl border p-1 pr-2 text-[0.7rem] transition-colors active:cursor-grabbing",
        selected
          ? "border-primary bg-primary/15 text-foreground"
          : "border-border bg-muted/40 text-muted-foreground hover:text-foreground",
        isDragging && "opacity-50",
      )}
    >
      {(resolvedUrl || media.dataUrl) && (
        <img
          src={resolvedUrl || media.dataUrl}
          alt={media.name}
          className="h-6 w-6 rounded object-cover"
        />
      )}
      <span className="max-w-28 truncate">{media.name}</span>
    </button>
  );
}

function SortableBlockCard({
  block,
  index,
  selected,
  isOverTarget,
  isAssetDrag,
  children,
  onSelect,
  onMoveUp,
  onMoveDown,
  onRemove,
  canMoveUp,
  canMoveDown,
}: {
  block: CaseStudyBlock;
  index: number;
  selected: boolean;
  isOverTarget: boolean;
  isAssetDrag: boolean;
  children: ReactNode;
  onSelect: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `block-${block.id}`,
    data: {
      kind: "block",
      blockId: block.id,
      index,
      type: block.type,
    } satisfies DragPayload,
  });

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `slot-${block.id}`,
    data: {
      kind: "block-slot",
      blockId: block.id,
      blockType: block.type,
      index,
    },
  });

  const acceptsAsset = block.type === "image" || block.type === "gallery";
  const showLine = (isOver || isOverTarget) && !(isAssetDrag && acceptsAsset);
  const showAssetRing = isAssetDrag && (isOver || isOverTarget) && acceptsAsset;

  return (
    <div
      ref={setDropRef}
      id={`cs-editor-block-${block.id}`}
      onClick={onSelect}
      style={{
        transform: transform ? CSS.Translate.toString(transform) : undefined,
      }}
      className={cn(
        "relative rounded-2xl border bg-card/70 p-3 transition-all",
        selected
          ? "border-primary/70 ring-1 ring-primary/30"
          : "border-border/80",
        isDragging && "z-10 opacity-40 shadow-lg",
        showAssetRing && "border-primary bg-primary/10 ring-2 ring-primary/45",
      )}
    >
      {showLine && (
        <div className="pointer-events-none absolute -top-1.5 inset-x-3 h-1 rounded-full bg-primary shadow-[0_0_10px_var(--primary)]" />
      )}

      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            ref={setDragRef}
            type="button"
            {...listeners}
            {...attributes}
            aria-label={`Drag to reorder block ${index + 1}`}
            title="Drag to reorder"
            className="grid h-7 w-7 cursor-grab touch-none place-items-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground active:cursor-grabbing"
          >
            <GripVertical className="h-3.5 w-3.5" />
          </button>
          <span className="font-num text-[0.68rem] font-semibold uppercase tracking-wider text-primary">
            {index + 1}. {block.type}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp();
            }}
            disabled={!canMoveUp}
            aria-label="Move block up"
            className="grid h-7 w-7 place-items-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-30"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown();
            }}
            disabled={!canMoveDown}
            aria-label="Move block down"
            className="grid h-7 w-7 place-items-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-30"
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            aria-label="Delete block"
            className="grid h-7 w-7 place-items-center rounded-lg text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {children}
    </div>
  );
}

function CanvasTailDropzone({ active }: { active: boolean }) {
  const { setNodeRef, isOver } = useDroppable({
    id: "slot-tail",
    data: { kind: "tail" },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex items-center justify-center rounded-2xl border border-dashed py-3 text-xs transition-colors",
        isOver
          ? "border-primary bg-primary/15 text-primary"
          : active
            ? "border-primary/45 bg-muted/35 text-muted-foreground"
            : "border-border/60 bg-muted/20 text-muted-foreground/75",
      )}
    >
      Drop a block here to append at end
    </div>
  );
}

export function CaseStudyBuilder({
  item,
  existingDoc,
  ownerName,
  onClose,
  onSave,
}: {
  item: ShowcaseWorkItem | null;
  existingDoc?: CaseStudyDoc | undefined;
  ownerName: string;
  onClose: () => void;
  onSave: (doc: CaseStudyDoc, updatedMedia: DesignMedia[]) => void;
}) {
  const [doc, setDoc] = useState<CaseStudyDoc | null>(null);
  const [media, setMedia] = useState<DesignMedia[]>([]);
  const [resolvedUrls, setResolvedUrls] = useState<Record<string, string>>({});
  const [mobilePane, setMobilePane] = useState<"edit" | "preview">("edit");
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [activeDrag, setActiveDrag] = useState<DragPayload | null>(null);
  const [overSlotId, setOverSlotId] = useState<string | null>(null);
  const [exporting, setExporting] = useState<"png" | "jpeg" | "pdf" | null>(
    null,
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 160, tolerance: 8 },
    }),
  );

  useEffect(() => {
    if (!item) {
      setDoc(null);
      setMedia([]);
      setSelectedBlockId(null);
      return;
    }
    const baseMedia = [...item.media];
    setMedia(baseMedia);
    const nextDoc = existingDoc ? { ...existingDoc } : autoBuildCaseStudy(item);
    setDoc(nextDoc);
    setSelectedBlockId(nextDoc.blocks[0]?.id ?? null);
  }, [item, existingDoc]);

  useEffect(() => {
    if (media.length === 0) return;
    let cancelled = false;
    const seedMap: Record<string, string> = {};
    for (const m of media) {
      if (m.dataUrl) seedMap[m.id] = m.dataUrl;
    }
    setResolvedUrls((prev) => ({ ...seedMap, ...prev }));

    void Promise.all(
      media.map(async (m) => {
        const blob = await loadMediaBlob(m.id);
        return [m.id, blob || m.dataUrl || ""] as const;
      }),
    ).then((pairs) => {
      if (cancelled) return;
      const next: Record<string, string> = {};
      for (const [id, url] of pairs) {
        if (url) next[id] = url;
      }
      setResolvedUrls(next);
    });
    return () => {
      cancelled = true;
    };
  }, [media]);

  useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [item, onClose]);

  if (!item || !doc) return null;

  const buildNewBlock = (type: CaseStudyBlockType): CaseStudyBlock => {
    const imgs = media.filter((m) => m.kind === "image");
    if (type === "header") {
      return {
        id: uid(),
        type,
        title: "Headline",
        text: doc.subtitle,
        align: "left",
      };
    }
    if (type === "subheader") {
      return {
        id: uid(),
        type,
        title: "Key Visuals & Execution",
        text: "Section",
      };
    }
    if (type === "paragraph") {
      return {
        id: uid(),
        type,
        text: "Describe the creative objective, typographic system, and rollout deliverables.",
      };
    }
    if (type === "divider") {
      return { id: uid(), type };
    }
    if (type === "metrics") {
      return {
        id: uid(),
        type,
        stats: [
          { label: "Client", value: doc.projectGroup || "RothVan" },
          { label: "Discipline", value: doc.designType },
          { label: "Assets", value: `${item.artworkCount} pcs` },
        ],
      };
    }
    if (type === "quote") {
      return {
        id: uid(),
        type,
        title: "Design Note",
        text: "Delivered print-ready & social formats ready for launch.",
      };
    }
    if (type === "image") {
      return {
        id: uid(),
        type,
        mediaIds: imgs[0] ? [imgs[0].id] : [],
        caption: imgs[0]?.name.replace(/\.[^.]+$/, "") ?? "Mockup preview",
      };
    }
    return {
      id: uid(),
      type: "gallery",
      mediaIds: imgs.slice(0, 2).map((m) => m.id),
      caption: "Campaign Mockups",
    };
  };

  const updateBlock = (blockId: string, patch: Partial<CaseStudyBlock>) => {
    setDoc((prev) =>
      prev
        ? {
            ...prev,
            blocks: prev.blocks.map((b) =>
              b.id === blockId ? { ...b, ...patch } : b,
            ),
          }
        : prev,
    );
  };

  const moveBlock = (idx: number, dir: -1 | 1) => {
    setDoc((prev) =>
      prev
        ? {
            ...prev,
            blocks: reorderCaseStudyBlocks(prev.blocks, idx, idx + dir),
          }
        : prev,
    );
  };

  const removeBlock = (blockId: string) => {
    setDoc((prev) =>
      prev
        ? { ...prev, blocks: prev.blocks.filter((b) => b.id !== blockId) }
        : prev,
    );
  };

  const addBlock = (type: CaseStudyBlockType, atIndex?: number) => {
    const fresh = buildNewBlock(type);
    setDoc((prev) =>
      prev
        ? {
            ...prev,
            blocks:
              atIndex === undefined
                ? [...prev.blocks, fresh]
                : insertCaseStudyBlockAt(prev.blocks, fresh, atIndex),
          }
        : prev,
    );
    setSelectedBlockId(fresh.id);
  };

  const handleMediaChange = (nextMedia: DesignMedia[]) => {
    const prevIds = new Set(media.map((m) => m.id));
    const newlyAdded = nextMedia.filter((m) => !prevIds.has(m.id));
    setMedia(nextMedia);

    if (newlyAdded.length > 0) {
      const addedImgs = newlyAdded.filter((m) => m.kind === "image");
      const addedPdfs = newlyAdded.filter((m) => m.kind === "pdf");
      const generated: CaseStudyBlock[] = [];

      for (let i = 0; i < addedImgs.length; i += 2) {
        const pair = addedImgs.slice(i, i + 2);
        if (pair.length === 1) {
          generated.push({
            id: uid(),
            type: "image",
            mediaIds: [pair[0]!.id],
            caption: pair[0]!.name.replace(/\.[^.]+$/, ""),
          });
        } else {
          generated.push({
            id: uid(),
            type: "gallery",
            mediaIds: pair.map((m) => m.id),
            caption: pair
              .map((m) => m.name.replace(/\.[^.]+$/, ""))
              .join(" · "),
          });
        }
      }
      if (addedPdfs.length > 0) {
        generated.push({
          id: uid(),
          type: "quote",
          title: "Client PDF Specification",
          text: `Attached deliverables: ${addedPdfs.map((p) => p.name).join(", ")}`,
        });
      }

      if (generated.length > 0) {
        setDoc((prev) =>
          prev ? { ...prev, blocks: [...prev.blocks, ...generated] } : prev,
        );
        setSelectedBlockId(generated[0]!.id);
        toast.success(
          `Auto-added ${generated.length} showcase block${generated.length === 1 ? "" : "s"} from uploaded files`,
        );
      }
    }
  };

  const handleAutoArrange = () => {
    const rebuilt = autoBuildCaseStudy({ ...item, media }, doc);
    setDoc(rebuilt);
    setSelectedBlockId(rebuilt.blocks[0]?.id ?? null);
    toast.success("Re-generated Case Study template from uploaded files");
  };

  const handleDragStart = (event: DragStartEvent) => {
    const payload = event.active.data.current as DragPayload | undefined;
    if (payload) setActiveDrag(payload);
  };

  const handleDragOver = (event: DragOverEvent) => {
    setOverSlotId(event.over ? String(event.over.id) : null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const payload = event.active.data.current as DragPayload | undefined;
    const overData = event.over?.data.current as
      | {
          kind?: string;
          index?: number;
          blockId?: string;
          blockType?: CaseStudyBlockType;
        }
      | undefined;

    setActiveDrag(null);
    setOverSlotId(null);

    if (!payload || !overData) return;

    if (payload.kind === "block") {
      const targetIdx =
        overData.kind === "tail"
          ? doc.blocks.length - 1
          : typeof overData.index === "number"
            ? overData.index
            : -1;
      if (targetIdx >= 0 && targetIdx !== payload.index) {
        setDoc((prev) =>
          prev
            ? {
                ...prev,
                blocks: reorderCaseStudyBlocks(
                  prev.blocks,
                  payload.index,
                  targetIdx,
                ),
              }
            : prev,
        );
        setSelectedBlockId(payload.blockId);
      }
      return;
    }

    if (payload.kind === "palette") {
      const insertIdx =
        overData.kind === "block-slot" && typeof overData.index === "number"
          ? overData.index
          : doc.blocks.length;
      addBlock(payload.blockType, insertIdx);
      toast.success(`Inserted ${payload.label} block`);
      return;
    }

    if (
      payload.kind === "asset" &&
      overData.kind === "block-slot" &&
      overData.blockId
    ) {
      const target = doc.blocks.find((b) => b.id === overData.blockId);
      if (!target) return;
      if (target.type === "image") {
        updateBlock(target.id, {
          mediaIds: [payload.mediaId],
          caption: payload.name.replace(/\.[^.]+$/, ""),
        });
        toast.success(`Placed ${payload.name} in Image block`);
      } else if (target.type === "gallery") {
        const cur = target.mediaIds ?? [];
        const next = cur.includes(payload.mediaId)
          ? cur
          : [...cur, payload.mediaId].slice(-2);
        updateBlock(target.id, { mediaIds: next });
        toast.success(`Added ${payload.name} to 2-Up Gallery`);
      }
    }
  };

  const handleDownload = async (format: "png" | "jpeg" | "pdf") => {
    setExporting(format);
    try {
      await downloadCaseStudy(doc, media, ownerName, format);
      toast.success(`Exported ${format.toUpperCase()} Case Study`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : `Could not export ${format}`,
      );
    } finally {
      setExporting(null);
    }
  };

  const handleCopyCaption = async () => {
    const paragraphs = doc.blocks
      .filter((b) => b.type === "paragraph" && b.text)
      .map((b) => b.text)
      .join("\n\n");
    const caption = `${doc.title}\n${doc.subtitle}\n\n${paragraphs}\n\n#${doc.projectGroup.replace(/\s+/g, "")} #RothVanDesign #DesignPortfolio`;
    try {
      await navigator.clipboard.writeText(caption);
      toast.success("Copied social post caption");
    } catch {
      toast.error("Clipboard unavailable");
    }
  };

  const focusBlockInEditor = (blockId: string) => {
    setSelectedBlockId(blockId);
    setMobilePane("edit");
    setTimeout(() => {
      document
        .getElementById(`cs-editor-block-${blockId}`)
        ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 30);
  };

  const imageFiles = media.filter((m) => m.kind === "image");

  const themeClass =
    doc.theme === "paper"
      ? "bg-[#f7f5f0] text-[#1c1c1e] border-[#dcd6ca]"
      : doc.theme === "slate"
        ? "bg-[#101620] text-[#edf2fa] border-[#26344a]"
        : "bg-[#161618] text-[#f4efe6] border-white/10";

  const accentText =
    doc.theme === "paper"
      ? "text-[#b57c16]"
      : doc.theme === "slate"
        ? "text-[#59c19c]"
        : "text-[#e2b857]";

  const mutedText =
    doc.theme === "paper"
      ? "text-[#64615a]"
      : doc.theme === "slate"
        ? "text-[#95a5bd]"
        : "text-[#a9a398]";

  const cardSurface =
    doc.theme === "paper"
      ? "bg-white border-black/10"
      : doc.theme === "slate"
        ? "bg-[#1b2638] border-white/10"
        : "bg-[#232328] border-white/10";

  return (
    <div
      className="fixed inset-0 z-[115] flex items-center justify-center bg-black/75 p-2 backdrop-blur-md sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-label="Case Study Studio"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-strong flex h-[94dvh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-border shadow-2xl"
      >
        {/* Studio Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <p className="font-num text-[0.7rem] font-semibold uppercase tracking-wider text-primary">
              Drag &amp; Drop Case Study Builder · {doc.projectGroup}
            </p>
            <h2 className="truncate font-display text-base font-bold sm:text-lg">
              {doc.title || item.title}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <div className="lg:hidden">
              <SlidingTabs
                size="xs"
                layoutGroup="cs-mobile-pane"
                value={mobilePane}
                onChange={setMobilePane}
                options={[
                  { id: "edit", label: "Builder" },
                  { id: "preview", label: "Preview" },
                ]}
              />
            </div>

            <Btn
              type="button"
              onClick={() => void handleCopyCaption()}
              className="hidden min-h-[34px] px-3 py-1 text-xs sm:inline-flex"
            >
              <Copy className="h-3.5 w-3.5" />
              Caption
            </Btn>
            <Btn
              type="button"
              onClick={() => void handleDownload("png")}
              disabled={exporting !== null}
              className="min-h-[34px] px-2.5 py-1 text-xs"
            >
              {exporting === "png" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}
              PNG
            </Btn>
            <Btn
              type="button"
              onClick={() => void handleDownload("jpeg")}
              disabled={exporting !== null}
              className="min-h-[34px] px-2.5 py-1 text-xs"
            >
              {exporting === "jpeg" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}
              JPEG
            </Btn>
            <Btn
              type="button"
              variant="gold"
              onClick={() => void handleDownload("pdf")}
              disabled={exporting !== null}
              className="min-h-[34px] px-3 py-1 text-xs"
            >
              {exporting === "pdf" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <FileText className="h-3.5 w-3.5" />
              )}
              Export PDF
            </Btn>
            <Btn
              type="button"
              onClick={() => {
                onSave(doc, media);
                toast.success("Saved Case Study");
                onClose();
              }}
              className="min-h-[34px] px-3.5 py-1 text-xs"
            >
              Save
            </Btn>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Case Study Studio"
              className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Split Drag-and-Drop Builder + Live Presentation Preview */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={() => {
            setActiveDrag(null);
            setOverSlotId(null);
          }}
        >
          <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-12">
            {/* Left Pane: Settings + File Dropzone + Drag Palette + Sortable Stack */}
            <div
              className={cn(
                "min-h-0 overflow-y-auto border-border/80 p-4 lg:col-span-5 lg:border-r",
                mobilePane === "preview" ? "hidden lg:block" : "block",
              )}
            >
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2.5">
                  <F label="Case Study Title" className="col-span-2">
                    <input
                      className="field text-xs font-semibold"
                      value={doc.title}
                      onChange={(e) =>
                        setDoc({ ...doc, title: e.target.value })
                      }
                    />
                  </F>
                  <F label="Subtitle / Client & Scope" className="col-span-2">
                    <input
                      className="field text-xs"
                      value={doc.subtitle}
                      onChange={(e) =>
                        setDoc({ ...doc, subtitle: e.target.value })
                      }
                    />
                  </F>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border/70 bg-muted/35 p-3">
                  <div className="space-y-1.5">
                    <span className="label-mono block">Theme</span>
                    <div className="flex flex-wrap gap-1.5">
                      {(
                        [
                          ["obsidian", "Obsidian Gold"],
                          ["paper", "Editorial Paper"],
                          ["slate", "Minimal Slate"],
                        ] as [CaseStudyTheme, string][]
                      ).map(([id, lbl]) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setDoc({ ...doc, theme: id })}
                          className={cn(
                            "rounded-full border px-2.5 py-1 text-[0.7rem] font-medium transition-colors",
                            doc.theme === id
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border text-muted-foreground hover:text-foreground",
                          )}
                        >
                          {lbl}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="label-mono block">Export Ratio</span>
                    <div className="flex flex-wrap gap-1.5">
                      {(
                        [
                          ["sheet", "A4 Sheet"],
                          ["social-4x5", "Social 4:5"],
                          ["square-1x1", "1:1"],
                          ["slide-16x9", "16:9"],
                        ] as [CaseStudyAspect, string][]
                      ).map(([id, lbl]) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setDoc({ ...doc, aspect: id })}
                          className={cn(
                            "font-num rounded-full border px-2.5 py-1 text-[0.7rem] font-medium transition-colors",
                            doc.aspect === id
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border text-muted-foreground hover:text-foreground",
                          )}
                        >
                          {lbl}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Dropzone / Auto Template Builder */}
                <div className="space-y-2 rounded-2xl border border-border/70 bg-muted/25 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="label-mono">
                      Uploaded Mockups &amp; PDFs ({media.length})
                    </span>
                    <button
                      type="button"
                      onClick={handleAutoArrange}
                      className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/12 px-2.5 py-1 text-[0.7rem] font-semibold text-primary hover:bg-primary hover:text-primary-foreground"
                    >
                      <Sparkles className="h-3 w-3" />
                      Auto-Build Template
                    </button>
                  </div>
                  <DesignMediaUploader
                    compact
                    media={media}
                    onChange={handleMediaChange}
                  />
                </div>

                {/* Draggable Block Palette */}
                <div>
                  <p className="label-mono mb-2">
                    Drag onto canvas or click to add block
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {BLOCK_ADDS.map((b) => (
                      <DraggablePaletteChip
                        key={b.type}
                        type={b.type}
                        label={b.label}
                        icon={b.icon}
                        onClick={() => addBlock(b.type)}
                      />
                    ))}
                  </div>
                </div>

                {/* Sortable / Editable Block Stack */}
                <div className="space-y-2.5">
                  {doc.blocks.map((block, idx) => (
                    <SortableBlockCard
                      key={block.id}
                      block={block}
                      index={idx}
                      selected={selectedBlockId === block.id}
                      isOverTarget={overSlotId === `slot-${block.id}`}
                      isAssetDrag={activeDrag?.kind === "asset"}
                      onSelect={() => setSelectedBlockId(block.id)}
                      onMoveUp={() => moveBlock(idx, -1)}
                      onMoveDown={() => moveBlock(idx, 1)}
                      onRemove={() => removeBlock(block.id)}
                      canMoveUp={idx > 0}
                      canMoveDown={idx < doc.blocks.length - 1}
                    >
                      {(block.type === "header" ||
                        block.type === "subheader") && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5">
                            <input
                              className="field flex-1 text-xs font-semibold"
                              placeholder={
                                block.type === "header"
                                  ? "Header title"
                                  : "Subheader"
                              }
                              value={block.title ?? ""}
                              onChange={(e) =>
                                updateBlock(block.id, { title: e.target.value })
                              }
                            />
                            {block.type === "header" && (
                              <div className="flex shrink-0 items-center rounded-xl border border-border bg-muted/40 p-0.5">
                                <button
                                  type="button"
                                  aria-label="Align header left"
                                  onClick={() =>
                                    updateBlock(block.id, { align: "left" })
                                  }
                                  className={cn(
                                    "grid h-7 w-7 place-items-center rounded-lg",
                                    (block.align ?? "left") === "left"
                                      ? "bg-primary text-primary-foreground"
                                      : "text-muted-foreground hover:text-foreground",
                                  )}
                                >
                                  <AlignLeft className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  aria-label="Align header center"
                                  onClick={() =>
                                    updateBlock(block.id, { align: "center" })
                                  }
                                  className={cn(
                                    "grid h-7 w-7 place-items-center rounded-lg",
                                    block.align === "center"
                                      ? "bg-primary text-primary-foreground"
                                      : "text-muted-foreground hover:text-foreground",
                                  )}
                                >
                                  <AlignCenter className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                          <input
                            className="field text-xs"
                            placeholder={
                              block.type === "header"
                                ? "Subheadline / scope"
                                : "Eyebrow label (optional)"
                            }
                            value={block.text ?? ""}
                            onChange={(e) =>
                              updateBlock(block.id, { text: e.target.value })
                            }
                          />
                        </div>
                      )}

                      {block.type === "paragraph" && (
                        <textarea
                          className="field min-h-20 text-xs"
                          value={block.text ?? ""}
                          onChange={(e) =>
                            updateBlock(block.id, { text: e.target.value })
                          }
                        />
                      )}

                      {block.type === "quote" && (
                        <div className="space-y-2">
                          <input
                            className="field text-xs font-semibold"
                            placeholder="Callout label"
                            value={block.title ?? ""}
                            onChange={(e) =>
                              updateBlock(block.id, { title: e.target.value })
                            }
                          />
                          <textarea
                            className="field min-h-16 text-xs"
                            value={block.text ?? ""}
                            onChange={(e) =>
                              updateBlock(block.id, { text: e.target.value })
                            }
                          />
                        </div>
                      )}

                      {block.type === "metrics" && (
                        <div className="grid grid-cols-2 gap-2">
                          {(block.stats ?? []).map((st, sIdx) => (
                            <div key={sIdx} className="space-y-1">
                              <input
                                className="field h-7 text-[0.68rem] uppercase text-muted-foreground"
                                value={st.label}
                                onChange={(e) => {
                                  const next = [...(block.stats ?? [])];
                                  next[sIdx] = { ...st, label: e.target.value };
                                  updateBlock(block.id, { stats: next });
                                }}
                              />
                              <input
                                className="field h-8 text-xs font-semibold"
                                value={st.value}
                                onChange={(e) => {
                                  const next = [...(block.stats ?? [])];
                                  next[sIdx] = { ...st, value: e.target.value };
                                  updateBlock(block.id, { stats: next });
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {(block.type === "image" || block.type === "gallery") && (
                        <div className="space-y-2">
                          {imageFiles.length === 0 ? (
                            <p className="text-[0.72rem] text-muted-foreground">
                              Drop PNG or JPEG images above to assign mockups.
                            </p>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {imageFiles.map((img) => (
                                <DraggableAssetChip
                                  key={`${block.id}-${img.id}`}
                                  blockId={block.id}
                                  media={img}
                                  resolvedUrl={resolvedUrls[img.id]}
                                  selected={(block.mediaIds ?? []).includes(
                                    img.id,
                                  )}
                                  onClick={() => {
                                    if (block.type === "image") {
                                      updateBlock(block.id, {
                                        mediaIds: [img.id],
                                      });
                                    } else {
                                      const cur = block.mediaIds ?? [];
                                      const next = cur.includes(img.id)
                                        ? cur.filter((x) => x !== img.id)
                                        : [...cur, img.id].slice(-2);
                                      updateBlock(block.id, { mediaIds: next });
                                    }
                                  }}
                                />
                              ))}
                            </div>
                          )}
                          <input
                            className="field text-xs"
                            placeholder="Image caption"
                            value={block.caption ?? ""}
                            onChange={(e) =>
                              updateBlock(block.id, { caption: e.target.value })
                            }
                          />
                        </div>
                      )}

                      {block.type === "divider" && (
                        <div className="flex items-center gap-2 py-1">
                          <div className="h-px flex-1 bg-border" />
                          <span className="font-num text-[0.62rem] uppercase tracking-widest text-muted-foreground">
                            Section Break
                          </span>
                          <div className="h-px flex-1 bg-border" />
                        </div>
                      )}
                    </SortableBlockCard>
                  ))}

                  <CanvasTailDropzone
                    active={
                      activeDrag?.kind === "palette" ||
                      activeDrag?.kind === "block"
                    }
                  />
                </div>
              </div>
            </div>

            {/* Right Pane: Interactive Live Sheet Presentation Preview */}
            <div
              className={cn(
                "min-h-0 overflow-y-auto bg-background/60 p-4 sm:p-6 lg:col-span-7",
                mobilePane === "edit" ? "hidden lg:block" : "block",
              )}
            >
              <div
                className={cn(
                  "mx-auto overflow-hidden rounded-3xl border p-6 shadow-2xl transition-colors sm:p-10",
                  doc.aspect === "square-1x1"
                    ? "max-w-xl"
                    : doc.aspect === "social-4x5"
                      ? "max-w-lg"
                      : "max-w-3xl",
                  themeClass,
                )}
              >
                <div
                  className={cn(
                    "font-num mb-6 flex items-center justify-between text-[0.68rem] font-bold uppercase tracking-widest",
                    mutedText,
                  )}
                >
                  <span className={accentText}>
                    {doc.projectGroup} · CASE STUDY
                  </span>
                  <span>{doc.designType}</span>
                </div>

                <div className="space-y-5">
                  {doc.blocks.map((block) => {
                    const isSelected = selectedBlockId === block.id;
                    const wrap = (content: ReactNode) => (
                      <div
                        key={block.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => focusBlockInEditor(block.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            focusBlockInEditor(block.id);
                          }
                        }}
                        title="Click to edit this block"
                        className={cn(
                          "cursor-pointer rounded-2xl transition-all",
                          isSelected
                            ? "ring-2 ring-primary/55 ring-offset-4 ring-offset-transparent"
                            : "hover:ring-1 hover:ring-current/25 hover:ring-offset-4 hover:ring-offset-transparent",
                        )}
                      >
                        {content}
                      </div>
                    );

                    if (block.type === "header") {
                      return wrap(
                        <div
                          className={
                            block.align === "center" ? "text-center" : ""
                          }
                        >
                          <h3 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                            {block.title || doc.title}
                          </h3>
                          {block.text && (
                            <p className={cn("mt-1.5 text-sm", mutedText)}>
                              {block.text}
                            </p>
                          )}
                        </div>,
                      );
                    }
                    if (block.type === "subheader") {
                      return wrap(
                        <div className="pt-2">
                          {block.text && (
                            <p
                              className={cn(
                                "font-num text-[0.68rem] font-bold uppercase tracking-widest",
                                accentText,
                              )}
                            >
                              {block.text}
                            </p>
                          )}
                          <h4 className="mt-0.5 font-display text-xl font-bold">
                            {block.title}
                          </h4>
                        </div>,
                      );
                    }
                    if (block.type === "paragraph") {
                      return wrap(
                        <p className="whitespace-pre-line text-sm leading-relaxed opacity-90">
                          {block.text}
                        </p>,
                      );
                    }
                    if (block.type === "divider") {
                      return wrap(
                        <div className="py-1">
                          <hr className="border-t border-current/20" />
                        </div>,
                      );
                    }
                    if (block.type === "metrics") {
                      return wrap(
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                          {(block.stats ?? []).map((st, sIdx) => (
                            <div
                              key={sIdx}
                              className={cn(
                                "rounded-2xl border p-3",
                                cardSurface,
                              )}
                            >
                              <p
                                className={cn(
                                  "font-num text-[0.62rem] font-semibold uppercase tracking-wider",
                                  mutedText,
                                )}
                              >
                                {st.label}
                              </p>
                              <p
                                className={cn(
                                  "font-num mt-1 truncate text-sm font-bold",
                                  sIdx === 0 && accentText,
                                )}
                              >
                                {st.value}
                              </p>
                            </div>
                          ))}
                        </div>,
                      );
                    }
                    if (block.type === "quote") {
                      return wrap(
                        <div
                          className={cn(
                            "rounded-2xl border-l-4 border border-current/15 p-4",
                            cardSurface,
                          )}
                          style={{
                            borderLeftColor:
                              doc.theme === "paper"
                                ? "#b57c16"
                                : doc.theme === "slate"
                                  ? "#59c19c"
                                  : "#e2b857",
                          }}
                        >
                          {block.title && (
                            <p
                              className={cn(
                                "font-num mb-1 text-[0.68rem] font-bold uppercase tracking-wider",
                                accentText,
                              )}
                            >
                              {block.title}
                            </p>
                          )}
                          <p className="font-display text-sm italic leading-relaxed opacity-90">
                            {block.text}
                          </p>
                        </div>,
                      );
                    }
                    if (block.type === "image") {
                      const mid = block.mediaIds?.[0];
                      const url = mid ? resolvedUrls[mid] : undefined;
                      return wrap(
                        <figure className="space-y-1.5">
                          <div
                            className={cn(
                              "flex aspect-[16/10] w-full items-center justify-center overflow-hidden rounded-2xl border p-3",
                              cardSurface,
                            )}
                          >
                            {url ? (
                              <img
                                src={url}
                                alt={block.caption || doc.title}
                                className="max-h-full max-w-full rounded-xl object-contain"
                              />
                            ) : (
                              <span className={cn("text-xs", mutedText)}>
                                Drop or select an image asset
                              </span>
                            )}
                          </div>
                          {block.caption && (
                            <figcaption className={cn("text-xs", mutedText)}>
                              {block.caption}
                            </figcaption>
                          )}
                        </figure>,
                      );
                    }
                    if (block.type === "gallery") {
                      const ids = (block.mediaIds ?? []).slice(0, 2);
                      return wrap(
                        <figure className="space-y-1.5">
                          <div className="grid grid-cols-2 gap-3">
                            {[0, 1].map((slot) => {
                              const mid = ids[slot];
                              const url = mid ? resolvedUrls[mid] : undefined;
                              return (
                                <div
                                  key={slot}
                                  className={cn(
                                    "flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl border p-2.5",
                                    cardSurface,
                                  )}
                                >
                                  {url ? (
                                    <img
                                      src={url}
                                      alt={
                                        block.caption || `Visual ${slot + 1}`
                                      }
                                      className="max-h-full max-w-full rounded-lg object-contain"
                                    />
                                  ) : (
                                    <span className={cn("text-xs", mutedText)}>
                                      Slot {slot + 1}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          {block.caption && (
                            <figcaption className={cn("text-xs", mutedText)}>
                              {block.caption}
                            </figcaption>
                          )}
                        </figure>,
                      );
                    }
                    return null;
                  })}
                </div>

                <div
                  className={cn(
                    "mt-8 flex items-center justify-between border-t border-current/15 pt-4 text-xs",
                    mutedText,
                  )}
                >
                  <span>Prepared by {ownerName}</span>
                  <span className={cn("font-semibold", accentText)}>
                    {doc.projectGroup}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <DragOverlay>
            {activeDrag ? (
              <div className="rounded-xl border border-primary bg-background/95 px-3 py-1.5 text-xs font-semibold text-foreground shadow-2xl backdrop-blur-md">
                {activeDrag.kind === "block"
                  ? `Moving ${activeDrag.type.toUpperCase()} block`
                  : activeDrag.kind === "palette"
                    ? `Insert ${activeDrag.label}`
                    : `Place ${activeDrag.name}`}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
