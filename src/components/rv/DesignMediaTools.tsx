import { Portal } from "@/components/rv/ui";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  ClipboardPaste,
  Download,
  ExternalLink,
  FileCode2,
  FileText,
  Image as ImageIcon,
  Loader2,
  Paperclip,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import {
  deleteMediaBlob,
  formatBytes,
  loadMediaBlob,
  processDesignMediaFile,
} from "@/lib/media-store";
import type { DesignMedia, ShowcaseWorkItem } from "@/lib/store";
import { cn } from "@/lib/utils";

function fileExtBadge(name: string, kind: DesignMedia["kind"]): string {
  const ext = name.split(".").pop()?.toUpperCase();
  if (ext && ext.length <= 4) return ext;
  return kind === "pdf" ? "PDF" : kind === "design" ? "CAD" : "IMG";
}

export function DesignMediaUploader({
  media,
  onChange,
  onPreview,
  compact = false,
}: {
  media: DesignMedia[];
  onChange: (next: DesignMedia[]) => void;
  onPreview?: (mediaItem: DesignMedia) => void;
  compact?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const mediaRef = useRef(media);
  mediaRef.current = media;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const [dragging, setDragging] = useState(false);
  const [busyCount, setBusyCount] = useState(0);

  const handleFiles = useCallback(async (files: FileList | File[] | null) => {
    if (!files || files.length === 0) return;
    const list = Array.from(files);
    setBusyCount((c) => c + list.length);
    const added: DesignMedia[] = [];
    for (const file of list) {
      try {
        const processed = await processDesignMediaFile(file);
        added.push(processed);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : `Could not attach ${file.name}`,
        );
      }
    }
    setBusyCount((c) => Math.max(0, c - list.length));
    if (added.length > 0) {
      onChangeRef.current([...mediaRef.current, ...added]);
      toast.success(
        added.length === 1
          ? `Attached ${added[0]!.name}`
          : `Attached ${added.length} files`,
      );
    }
  }, []);

  const extractClipboardFiles = useCallback(
    (data: DataTransfer | null): File[] => {
      if (!data) return [];
      const collected: File[] = [];
      for (const item of Array.from(data.items ?? [])) {
        if (item.kind === "file") {
          const f = item.getAsFile();
          if (f) {
            if (!f.name || f.name === "image.png") {
              const stamp = new Date()
                .toISOString()
                .replace(/[:.]/g, "-")
                .slice(0, 19);
              collected.push(
                new File([f], `pasted-${stamp}.png`, {
                  type: f.type || "image/png",
                }),
              );
            } else {
              collected.push(f);
            }
          }
        }
      }
      if (collected.length === 0 && data.files?.length) {
        collected.push(...Array.from(data.files));
      }
      return collected;
    },
    [],
  );

  useEffect(() => {
    const onWindowPaste = (e: ClipboardEvent) => {
      const files = extractClipboardFiles(e.clipboardData);
      if (files.length === 0) return;
      e.preventDefault();
      void handleFiles(files);
    };
    window.addEventListener("paste", onWindowPaste);
    return () => window.removeEventListener("paste", onWindowPaste);
  }, [extractClipboardFiles, handleFiles]);

  const removeMedia = async (item: DesignMedia) => {
    onChange(media.filter((m) => m.id !== item.id));
    await deleteMediaBlob(item.id);
  };

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.webp,.gif,.svg,.pdf,.ai,.cad,.dwg,.dxf,.eps,image/*,application/pdf"
        multiple
        hidden
        onChange={(e) => {
          void handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void handleFiles(e.dataTransfer.files);
        }}
        onPaste={(e) => {
          const files = extractClipboardFiles(e.clipboardData);
          if (files.length > 0) {
            e.preventDefault();
            e.stopPropagation();
            void handleFiles(files);
          }
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed text-center transition-colors",
          compact ? "px-3 py-3" : "px-4 py-4",
          dragging
            ? "border-primary bg-primary/12 text-foreground"
            : "border-border bg-muted/40 text-muted-foreground hover:border-primary/60 hover:bg-muted/70 hover:text-foreground",
        )}
      >
        <div className="flex items-center gap-2 text-xs font-medium text-foreground">
          {busyCount > 0 ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span>Saving {busyCount} file(s)…</span>
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 text-primary" />
              <span>Upload files or press Ctrl+V / Cmd+V</span>
            </>
          )}
        </div>
        <p className="inline-flex flex-wrap items-center justify-center gap-1.5 text-[0.7rem] text-muted-foreground">
          <ClipboardPaste className="h-3 w-3 text-primary" />
          <span>PNG, JPG, WEBP, SVG, PDF, AI, CAD, DWG, DXF, EPS (15 MB)</span>
        </p>
      </div>

      {media.length > 0 && (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {media.map((m) => (
            <div
              key={m.id}
              className="group relative overflow-hidden rounded-xl border border-border bg-muted/45 transition-colors hover:border-primary/50"
            >
              <button
                type="button"
                onClick={() => onPreview?.(m)}
                className="block w-full text-left"
              >
                {m.kind === "image" && m.dataUrl ? (
                  <div className="aspect-[4/3] w-full overflow-hidden bg-background/70">
                    <img
                      src={m.dataUrl}
                      alt={m.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-1.5 bg-background/60 p-3 text-center">
                    <span className="grid h-10 w-10 place-items-center rounded-lg border border-primary/30 bg-primary/12 text-primary">
                      {m.kind === "pdf" ? (
                        <FileText className="h-5 w-5" />
                      ) : m.kind === "design" ? (
                        <FileCode2 className="h-5 w-5" />
                      ) : (
                        <ImageIcon className="h-5 w-5" />
                      )}
                    </span>
                    <span className="font-num text-[0.66rem] font-semibold uppercase tracking-wider text-primary">
                      {fileExtBadge(m.name, m.kind)}
                    </span>
                  </div>
                )}
                <div className="px-2.5 py-2">
                  <p className="truncate text-[0.72rem] font-medium text-foreground">
                    {m.name}
                  </p>
                  <p className="font-num text-[0.65rem] text-muted-foreground">
                    {fileExtBadge(m.name, m.kind)}
                    {m.size ? ` · ${formatBytes(m.size)}` : ""}
                  </p>
                </div>
              </button>

              <button
                type="button"
                aria-label={`Remove ${m.name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  void removeMedia(m);
                }}
                className="absolute right-1.5 top-1.5 rounded-lg border border-border bg-card/90 p-1.5 text-muted-foreground transition-colors hover:border-destructive/60 hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function MediaLightboxViewer({
  item,
  initialMediaId,
  onClose,
}: {
  item: ShowcaseWorkItem | null;
  initialMediaId?: string | undefined;
  onClose: () => void;
}) {
  const mediaList = useMemo(() => item?.media ?? [], [item]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!item) return;
    if (initialMediaId) {
      const idx = item.media.findIndex((m) => m.id === initialMediaId);
      setActiveIndex(idx >= 0 ? idx : 0);
    } else {
      setActiveIndex(0);
    }
  }, [item, initialMediaId]);

  const activeMedia = mediaList[activeIndex];

  useEffect(() => {
    if (!activeMedia) {
      setResolvedUrl(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setResolvedUrl(activeMedia.dataUrl ?? null);
    void loadMediaBlob(activeMedia.id).then((blobUrl) => {
      if (cancelled) return;
      if (blobUrl) setResolvedUrl(blobUrl);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [activeMedia]);

  useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && mediaList.length > 1) {
        setActiveIndex((i) => (i + 1) % mediaList.length);
      }
      if (e.key === "ArrowLeft" && mediaList.length > 1) {
        setActiveIndex((i) => (i - 1 + mediaList.length) % mediaList.length);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [item, mediaList.length, onClose]);

  if (!item) return null;

  const overlay = (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3.5">
          <div className="min-w-0 flex-1">
            <p className="font-num flex items-center gap-2 text-xs text-muted-foreground">
              <span>{item.code}</span>
              <span aria-hidden="true">·</span>
              <span>{item.source === "work" ? "Work" : "Studio"}</span>
              <span aria-hidden="true">·</span>
              <span>{item.designType}</span>
              <span aria-hidden="true">·</span>
              <span>
                {item.artworkCount}{" "}
                {item.artworkCount === 1 ? "artwork" : "artworks"}
              </span>
            </p>
            <h2 className="truncate font-display text-lg font-bold text-foreground sm:text-xl">
              {item.title}
            </h2>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {resolvedUrl && activeMedia && (
              <a
                href={resolvedUrl}
                download={activeMedia.name}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download</span>
              </a>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close preview"
              className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="relative flex min-h-[340px] flex-1 items-center justify-center overflow-auto bg-background/80 p-4">
          {!activeMedia ? (
            <div className="max-w-md space-y-2 text-center">
              <Paperclip className="mx-auto h-8 w-8 text-muted-foreground/60" />
              <p className="text-sm font-medium text-foreground">
                No files attached yet
              </p>
              <p className="text-xs text-muted-foreground">
                Open this {item.source === "work" ? "work task" : "project"} to
                upload or paste images, PDFs, or AI/CAD files.
              </p>
            </div>
          ) : loading && !resolvedUrl ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span>Loading file…</span>
            </div>
          ) : activeMedia.kind === "pdf" ? (
            resolvedUrl ? (
              <div className="flex h-[65vh] w-full flex-col gap-2">
                <iframe
                  src={resolvedUrl}
                  title={activeMedia.name}
                  className="h-full w-full flex-1 rounded-xl border border-border bg-white"
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="truncate">{activeMedia.name}</span>
                  <a
                    href={resolvedUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    <span>Open PDF in tab</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-center">
                <FileText className="mx-auto h-10 w-10 text-primary" />
                <p className="text-sm font-medium">{activeMedia.name}</p>
                <p className="text-xs text-muted-foreground">
                  PDF preview unavailable in this session.
                </p>
              </div>
            )
          ) : activeMedia.kind === "design" ? (
            <div className="max-w-md space-y-3 rounded-xl border border-border bg-card p-6 text-center">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl border border-primary/35 bg-primary/15 text-primary">
                <FileCode2 className="h-6 w-6" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {activeMedia.name}
                </p>
                <p className="mt-0.5 font-num text-xs text-muted-foreground">
                  {fileExtBadge(activeMedia.name, activeMedia.kind)} source file
                  {activeMedia.size
                    ? ` · ${formatBytes(activeMedia.size)}`
                    : ""}
                </p>
              </div>
              {resolvedUrl && (
                <a
                  href={resolvedUrl}
                  download={activeMedia.name}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download source file</span>
                </a>
              )}
            </div>
          ) : resolvedUrl ? (
            <img
              src={resolvedUrl}
              alt={activeMedia.name}
              className="max-h-[68vh] w-auto max-w-full rounded-xl object-contain"
            />
          ) : (
            <p className="text-xs text-muted-foreground">
              Image preview unavailable.
            </p>
          )}

          {mediaList.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous file"
                onClick={() =>
                  setActiveIndex(
                    (i) => (i - 1 + mediaList.length) % mediaList.length,
                  )
                }
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-lg border border-border bg-card/90 p-2 text-foreground hover:border-primary"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Next file"
                onClick={() =>
                  setActiveIndex((i) => (i + 1) % mediaList.length)
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg border border-border bg-card/90 p-2 text-foreground hover:border-primary"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}
        </div>

        {mediaList.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto border-t border-border bg-muted/40 px-5 py-2.5">
            {mediaList.map((m, idx) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs transition-colors",
                  idx === activeIndex
                    ? "border-primary bg-primary/15 text-foreground"
                    : "border-border bg-background/50 text-muted-foreground hover:text-foreground",
                )}
              >
                {m.kind === "image" && m.dataUrl ? (
                  <img
                    src={m.dataUrl}
                    alt={m.name}
                    className="h-6 w-6 rounded object-cover"
                  />
                ) : m.kind === "design" ? (
                  <FileCode2 className="h-4 w-4 text-primary" />
                ) : (
                  <FileText className="h-4 w-4 text-primary" />
                )}
                <span className="max-w-32 truncate">{m.name}</span>
              </button>
            ))}
          </div>
        )}

        {item.notes && (
          <div className="border-t border-border/70 px-5 py-3 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Notes: </span>
            {item.notes}
          </div>
        )}
      </div>
    </div>
  );
  return <Portal>{overlay}</Portal>;
}

export function MediaCountBadge({
  media,
}: {
  media?: DesignMedia[] | undefined;
}) {
  const count = media?.length ?? 0;
  if (count === 0) return null;
  const pdfCount = media!.filter((m) => m.kind === "pdf").length;
  const designCount = media!.filter((m) => m.kind === "design").length;
  const imgCount = count - pdfCount - designCount;
  const parts: string[] = [];
  if (imgCount > 0) parts.push(`${imgCount} img`);
  if (pdfCount > 0) parts.push(`${pdfCount} pdf`);
  if (designCount > 0) parts.push(`${designCount} file`);
  return (
    <span className="font-num inline-flex items-center gap-1 text-[0.7rem] text-muted-foreground">
      <Paperclip className="h-3 w-3 text-primary" />
      <span>{parts.join(" · ")}</span>
    </span>
  );
}
