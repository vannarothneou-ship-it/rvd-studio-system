import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  closestCenter,
  pointerWithin,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  ArrowDown,
  ArrowUp,
  Check,
  Columns2,
  Eye,
  EyeOff,
  GripVertical,
  LayoutGrid,
  Plus,
  RotateCcw,
  Sparkles,
  Wand2,
} from "lucide-react";
import { motion } from "motion/react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { useHoldTip } from "@/components/rv/ui";
import { autoArrange, recordChoice, type LearnedSpans } from "@/lib/bento-ai";
import { cn } from "@/lib/utils";

export type BentoSpan = 4 | 5 | 6 | 7 | 8 | 12;

export interface LayoutItemConfig {
  id: string;
  span: BentoSpan;
  hidden?: boolean;
}

export interface BentoWidgetDef {
  id: string;
  title: string;
  defaultSpan: BentoSpan;
  render: () => ReactNode;
}

export interface CustomDashboardTab {
  id: string;
  label: string;
  widgetIds: string[];
}

export interface PackedBentoEntry {
  config: LayoutItemConfig;
  effectiveSpan: number;
  mdSpan: 1 | 2;
}

const LAYOUT_STORAGE_KEY = "rv-bento-layouts-v1";
const TABS_STORAGE_KEY = "rv-custom-tabs-v1";
const AUTOFILL_STORAGE_KEY = "rv-bento-autofill-v1";
const LEARNED_STORAGE_KEY = "rv-bento-learned-v1";

function readLearned(): LearnedSpans {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(
      window.localStorage.getItem(LEARNED_STORAGE_KEY) ?? "{}",
    ) as LearnedSpans;
  } catch {
    return {};
  }
}

function writeLearned(v: LearnedSpans) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LEARNED_STORAGE_KEY, JSON.stringify(v));
  } catch {
    /* storage full / private mode */
  }
}

const SPAN_CLASS: Record<number, string> = {
  4: "lg:col-span-4",
  5: "lg:col-span-5",
  6: "lg:col-span-6",
  7: "lg:col-span-7",
  8: "lg:col-span-8",
  9: "lg:col-span-9",
  10: "lg:col-span-10",
  11: "lg:col-span-11",
  12: "lg:col-span-12",
};

const SPAN_CHOICES: { span: BentoSpan; label: string }[] = [
  { span: 4, label: "1/3" },
  { span: 6, label: "1/2" },
  { span: 8, label: "2/3" },
  { span: 12, label: "Full" },
];

/**
 * First-fit dense Bento packing into 12-column rows.
 * - Smaller cards later in the order flow up to fill earlier row gaps.
 * - When `autoFill` is true, any remaining columns in a row are filled
 *   automatically (preferring trailing items first so the earlier resized
 *   card keeps its chosen width while adjacent cards absorb the gap).
 */
export function packBentoItems(
  items: LayoutItemConfig[],
  autoFill = true,
): PackedBentoEntry[] {
  const rows: { used: number; entries: PackedBentoEntry[] }[] = [];

  for (const item of items) {
    const span = Math.max(4, Math.min(12, item.span));
    const targetRow = rows.find((r) => r.used + span <= 12);
    if (targetRow) {
      targetRow.entries.push({
        config: item,
        effectiveSpan: span,
        mdSpan: span >= 8 ? 2 : 1,
      });
      targetRow.used += span;
    } else {
      rows.push({
        used: span,
        entries: [
          {
            config: item,
            effectiveSpan: span,
            mdSpan: span >= 8 ? 2 : 1,
          },
        ],
      });
    }
  }

  if (autoFill) {
    for (const row of rows) {
      let gap = 12 - row.used;
      if (gap <= 0 || row.entries.length === 0) continue;
      if (row.entries.length === 1) {
        row.entries[0]!.effectiveSpan = 12;
        row.entries[0]!.mdSpan = 2;
        row.used = 12;
        continue;
      }
      for (let i = row.entries.length - 1; i >= 0 && gap > 0; i--) {
        const entry = row.entries[i]!;
        const room = 12 - entry.effectiveSpan;
        if (room <= 0) continue;
        const add = Math.min(gap, room);
        entry.effectiveSpan += add;
        gap -= add;
      }
      row.used = 12 - gap;
    }
  }

  const packed = rows.flatMap((r) => r.entries);
  let mdCol = 0;
  for (let i = 0; i < packed.length; i++) {
    const entry = packed[i]!;
    const next = packed[i + 1];
    if (entry.effectiveSpan >= 8) {
      entry.mdSpan = 2;
      mdCol = 0;
    } else if (mdCol === 0 && (!next || next.effectiveSpan >= 8)) {
      entry.mdSpan = 2;
      mdCol = 0;
    } else {
      entry.mdSpan = 1;
      mdCol = mdCol === 0 ? 1 : 0;
    }
  }

  return packed;
}

/**
 * Step-reorder a widget up (-1) or down (+1) among non-hidden items.
 */
export function moveBentoItem(
  items: LayoutItemConfig[],
  id: string,
  delta: -1 | 1,
): LayoutItemConfig[] {
  const idx = items.findIndex((x) => x.id === id);
  if (idx < 0) return items;
  let targetIdx = idx + delta;
  while (
    targetIdx >= 0 &&
    targetIdx < items.length &&
    items[targetIdx]?.hidden
  ) {
    targetIdx += delta;
  }
  if (targetIdx < 0 || targetIdx >= items.length) return items;
  const copy = [...items];
  const current = copy[idx]!;
  copy[idx] = copy[targetIdx]!;
  copy[targetIdx] = current;
  return copy;
}

function readLayouts(): Record<string, LayoutItemConfig[]> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(LAYOUT_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, LayoutItemConfig[]>) : {};
  } catch {
    return {};
  }
}

function writeLayouts(all: Record<string, LayoutItemConfig[]>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(all));
  } catch {
    /* ignore storage quota errors */
  }
}

function readAutoFillMap(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(AUTOFILL_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

function writeAutoFillMap(all: Record<string, boolean>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(AUTOFILL_STORAGE_KEY, JSON.stringify(all));
  } catch {
    /* ignore storage quota errors */
  }
}

function mergeWithDefaults(
  saved: LayoutItemConfig[] | undefined,
  defaults: LayoutItemConfig[],
): LayoutItemConfig[] {
  if (!saved || saved.length === 0) return defaults.map((d) => ({ ...d }));
  const defMap = new Map(defaults.map((d) => [d.id, d]));
  const result: LayoutItemConfig[] = [];
  const seen = new Set<string>();
  for (const item of saved) {
    if (defMap.has(item.id)) {
      result.push({ ...defMap.get(item.id)!, ...item });
      seen.add(item.id);
    }
  }
  for (const def of defaults) {
    if (!seen.has(def.id)) {
      result.push({ ...def });
    }
  }
  return result;
}

export function usePageLayout(pageKey: string, defaults: LayoutItemConfig[]) {
  const defaultSig = defaults.map((d) => `${d.id}:${d.span}`).join(",");
  const [items, setItems] = useState<LayoutItemConfig[]>(() =>
    mergeWithDefaults(readLayouts()[pageKey], defaults),
  );
  const [autoFill, setAutoFillState] = useState<boolean>(
    () => readAutoFillMap()[pageKey] ?? true,
  );

  useEffect(() => {
    setItems(mergeWithDefaults(readLayouts()[pageKey], defaults));
    setAutoFillState(readAutoFillMap()[pageKey] ?? true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageKey, defaultSig]);

  const itemsRef = useRef(items);
  itemsRef.current = items;

  const commit = useCallback(
    (updater: (prev: LayoutItemConfig[]) => LayoutItemConfig[]) => {
      setItems((prev) => {
        const next = updater(prev);
        itemsRef.current = next;
        const all = readLayouts();
        all[pageKey] = next;
        writeLayouts(all);
        return next;
      });
    },
    [pageKey],
  );

  const setSpan = useCallback(
    (id: string, span: BentoSpan) => {
      writeLearned(recordChoice(readLearned(), id, span));
      commit((prev) => prev.map((x) => (x.id === id ? { ...x, span } : x)));
    },
    [commit],
  );

  /** Smart layout: re-split visible cards into gap-free rows. Returns fit %. */
  const smartLayout = useCallback(
    (titles: Map<string, string>) => {
      const visible = itemsRef.current.filter((x) => !x.hidden);
      const result = autoArrange(
        visible.map((x) => ({
          id: x.id,
          title: titles.get(x.id) ?? x.id,
          span: x.span,
        })),
        readLearned(),
      );
      const map = new Map(result.spans.map((r) => [r.id, r.span]));
      commit((prev) =>
        prev.map((x) => (map.has(x.id) ? { ...x, span: map.get(x.id)! } : x)),
      );
      return result.fit;
    },
    [commit],
  );

  const toggleHide = useCallback(
    (id: string) => {
      commit((prev) =>
        prev.map((x) => (x.id === id ? { ...x, hidden: !x.hidden } : x)),
      );
    },
    [commit],
  );

  const showWidget = useCallback(
    (id: string) => {
      commit((prev) => {
        if (prev.some((x) => x.id === id)) {
          return prev.map((x) => (x.id === id ? { ...x, hidden: false } : x));
        }
        const def = defaults.find((d) => d.id === id);
        return [...prev, { id, span: def?.span ?? 6, hidden: false }];
      });
    },
    [commit, defaults],
  );

  const reorder = useCallback(
    (activeId: string, overId: string) => {
      if (activeId === overId) return;
      commit((prev) => {
        const fromIdx = prev.findIndex((x) => x.id === activeId);
        const toIdx = prev.findIndex((x) => x.id === overId);
        if (fromIdx < 0 || toIdx < 0) return prev;
        const copy = [...prev];
        const [moved] = copy.splice(fromIdx, 1);
        if (!moved) return prev;
        copy.splice(toIdx, 0, moved);
        return copy;
      });
    },
    [commit],
  );

  const moveItem = useCallback(
    (id: string, delta: -1 | 1) => {
      commit((prev) => moveBentoItem(prev, id, delta));
    },
    [commit],
  );

  const setAutoFill = useCallback(
    (next: boolean) => {
      setAutoFillState(next);
      const map = readAutoFillMap();
      map[pageKey] = next;
      writeAutoFillMap(map);
    },
    [pageKey],
  );

  const pairWithNext = useCallback(
    (id: string) => {
      commit((prev) => {
        const idx = prev.findIndex((x) => x.id === id);
        if (idx < 0) return prev;
        let partnerIdx = -1;
        for (let i = idx + 1; i < prev.length; i++) {
          if (!prev[i]?.hidden) {
            partnerIdx = i;
            break;
          }
        }
        if (partnerIdx < 0) {
          for (let i = idx - 1; i >= 0; i--) {
            if (!prev[i]?.hidden) {
              partnerIdx = i;
              break;
            }
          }
        }
        if (partnerIdx < 0) return prev;
        return prev.map((x, i) =>
          i === idx || i === partnerIdx ? { ...x, span: 6 } : x,
        );
      });
    },
    [commit],
  );

  const resetLayout = useCallback(() => {
    const fresh = defaults.map((d) => ({ ...d }));
    setItems(fresh);
    setAutoFillState(true);
    const all = readLayouts();
    delete all[pageKey];
    writeLayouts(all);
    const af = readAutoFillMap();
    delete af[pageKey];
    writeAutoFillMap(af);
  }, [pageKey, defaults]);

  return {
    items,
    autoFill,
    setAutoFill,
    setSpan,
    smartLayout,
    pairWithNext,
    toggleHide,
    showWidget,
    reorder,
    moveItem,
    resetLayout,
  };
}

export function useDashboardTabs() {
  const [tabs, setTabs] = useState<CustomDashboardTab[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(TABS_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as CustomDashboardTab[]) : [];
    } catch {
      return [];
    }
  });

  const persist = (next: CustomDashboardTab[]) => {
    setTabs(next);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(TABS_STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
    }
  };

  const addTab = (label: string, widgetIds: string[]) => {
    const clean = label.trim() || `Board ${tabs.length + 1}`;
    const id =
      "tab-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    const nextTab: CustomDashboardTab = {
      id,
      label: clean,
      widgetIds:
        widgetIds.length > 0 ? widgetIds : ["netProfit", "personalExpenses"],
    };
    persist([...tabs, nextTab]);
    return nextTab;
  };

  const removeTab = (id: string) => {
    persist(tabs.filter((t) => t.id !== id));
    if (typeof window !== "undefined") {
      const all = readLayouts();
      delete all[`overview:${id}`];
      writeLayouts(all);
    }
  };

  const updateTabWidgets = (id: string, widgetIds: string[]) => {
    persist(tabs.map((t) => (t.id === id ? { ...t, widgetIds } : t)));
  };

  return { tabs, addTab, removeTab, updateTabWidgets };
}

export function EditLayoutButton({
  editing,
  onToggle,
}: {
  editing: boolean;
  onToggle: () => void;
}) {
  const { handlers, bubble } = useHoldTip(
    editing ? "Finish rearranging cards" : "Rearrange & resize bento cards",
  );
  return (
    <>
      <button
        type="button"
        onClick={onToggle}
        {...handlers}
        aria-pressed={editing}
        className={cn(
          "ios-tap inline-flex min-h-[38px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors",
          editing
            ? "border-primary bg-primary text-primary-foreground shadow-sm"
            : "border-border bg-secondary/75 text-muted-foreground hover:border-primary/50 hover:text-foreground",
        )}
      >
        {editing ? (
          <>
            <Check className="h-3.5 w-3.5" />
            <span className="sm:hidden">Done</span>
            <span className="hidden sm:inline">Done editing</span>
          </>
        ) : (
          <>
            <LayoutGrid className="h-3.5 w-3.5" />
            <span className="sm:hidden">Edit</span>
            <span className="hidden sm:inline">Edit layout</span>
          </>
        )}
      </button>
      {bubble}
    </>
  );
}

export function EditableBentoGrid({
  pageKey,
  widgets,
  editing: controlledEditing,
  onToggleEditing,
  onDoneEditing,
  showToolbarToggle = true,
  className,
}: {
  pageKey: string;
  widgets: BentoWidgetDef[];
  editing?: boolean | undefined;
  onToggleEditing?: (() => void) | undefined;
  onDoneEditing?: (() => void) | undefined;
  showToolbarToggle?: boolean | undefined;
  className?: string | undefined;
}) {
  const [internalEditing, setInternalEditing] = useState(false);
  const editing = controlledEditing ?? internalEditing;
  const toggleEdit = onToggleEditing ?? (() => setInternalEditing((v) => !v));
  const doneEdit =
    onDoneEditing ?? onToggleEditing ?? (() => setInternalEditing(false));
  const { handlers: arrangeTipHandlers, bubble: arrangeTipBubble } = useHoldTip(
    "Rearrange & resize bento cards",
  );

  const defaults = useMemo<LayoutItemConfig[]>(
    () => widgets.map((w) => ({ id: w.id, span: w.defaultSpan })),
    [widgets],
  );
  const {
    items,
    autoFill,
    setAutoFill,
    setSpan,
    smartLayout,
    pairWithNext,
    toggleHide,
    showWidget,
    reorder,
    moveItem,
    resetLayout,
  } = usePageLayout(pageKey, defaults);

  const gridRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [resizingState, setResizingState] = useState<{
    id: string;
    span: BentoSpan;
  } | null>(null);
  const lastSwapRef = useRef<{ time: number; targetId: string }>({
    time: 0,
    targetId: "",
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 140, tolerance: 8 },
    }),
  );

  const widgetMap = useMemo(
    () => new Map(widgets.map((w) => [w.id, w])),
    [widgets],
  );

  const visibleItems = useMemo(
    () => items.filter((it) => !it.hidden && widgetMap.has(it.id)),
    [items, widgetMap],
  );
  const hiddenItems = useMemo(
    () => items.filter((it) => it.hidden && widgetMap.has(it.id)),
    [items, widgetMap],
  );

  const handleDragStart = (event: DragStartEvent) => {
    const id = String(event.active.id);
    setActiveId(id);
    setOverId(id);
    lastSwapRef.current = { time: Date.now(), targetId: id };
  };

  const handleDragOver = (event: DragOverEvent) => {
    if (!event.over || !activeId) return;
    const nextOver = String(event.over.id);
    if (nextOver === activeId) return;
    const now = Date.now();
    if (
      nextOver !== lastSwapRef.current.targetId &&
      now - lastSwapRef.current.time < 180
    ) {
      return;
    }
    if (nextOver === overId) return;
    lastSwapRef.current = { time: now, targetId: nextOver };
    setOverId(nextOver);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const src = String(event.active.id);
    const eventOver = event.over ? String(event.over.id) : null;
    const dst = eventOver && eventOver !== src ? eventOver : overId;
    setActiveId(null);
    setOverId(null);
    if (dst && src !== dst) {
      reorder(src, dst);
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setOverId(null);
  };

  // Compute live packed Bento order BEFORE pointer release so user sees exact final fill & row placement
  const packedEntries = useMemo(() => {
    let working = resizingState
      ? visibleItems.map((x) =>
          x.id === resizingState.id ? { ...x, span: resizingState.span } : x,
        )
      : visibleItems;
    if (activeId && overId && activeId !== overId) {
      const fromIdx = working.findIndex((x) => x.id === activeId);
      const toIdx = working.findIndex((x) => x.id === overId);
      if (fromIdx >= 0 && toIdx >= 0) {
        working = [...working];
        const [moved] = working.splice(fromIdx, 1);
        if (moved) {
          working.splice(toIdx, 0, moved);
        }
      }
    }
    return packBentoItems(working, autoFill);
  }, [visibleItems, activeId, overId, autoFill, resizingState]);

  const activeWidget = activeId ? widgetMap.get(activeId) : undefined;
  const activePacked = activeId
    ? packedEntries.find((e) => e.config.id === activeId)
    : undefined;

  return (
    <div className={className}>
      {!editing && showToolbarToggle && (
        <div className="mb-2.5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={toggleEdit}
            aria-label="Rearrange bento cards"
            {...arrangeTipHandlers}
            className="ios-tap inline-flex min-h-[36px] shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-border bg-card px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/45 hover:text-foreground"
          >
            <LayoutGrid className="h-3.5 w-3.5 text-primary" />
            <span>Arrange</span>
          </button>
          {arrangeTipBubble}
        </div>
      )}

      {editing && (
        <div
          data-no-swipe
          className="mb-4 flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-primary/40 bg-card px-3.5 py-3 rise sm:gap-3 sm:px-4"
        >
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 font-semibold text-primary">
              <LayoutGrid className="h-3.5 w-3.5" />
              Layout editor
            </span>
            <span className="text-muted-foreground sm:hidden">
              Drag handle or tap ↑/↓ to reorder
            </span>
            <span className="hidden text-muted-foreground sm:inline">
              Drag handle or tap ↑/↓ to reorder · Resize width · Pair ½+½
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {hiddenItems.map((h) => {
              const def = widgetMap.get(h.id);
              if (!def) return null;
              return (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => showWidget(h.id)}
                  className="inline-flex min-h-[34px] shrink-0 items-center gap-1 whitespace-nowrap rounded-lg border border-primary/40 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/20"
                >
                  <Plus className="h-3 w-3" />
                  <Eye className="h-3 w-3" />
                  {def.title}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => {
                const fit = smartLayout(
                  new Map(widgets.map((w) => [w.id, w.title])),
                );
                toast.success(`Smart layout applied · ${fit}% fit`, {
                  description: "No empty gaps. Resize a card to teach it.",
                });
              }}
              className="inline-flex min-h-[34px] shrink-0 items-center gap-1 whitespace-nowrap rounded-lg border border-primary bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground"
              title="Arrange every card into gap-free rows, using your past resizes"
            >
              <Wand2 className="h-3 w-3" />
              Smart layout
            </button>
            <button
              type="button"
              onClick={() => setAutoFill(!autoFill)}
              className={cn(
                "inline-flex min-h-[34px] shrink-0 items-center gap-1 whitespace-nowrap rounded-lg border px-3 py-1 text-xs font-medium transition-colors",
                autoFill
                  ? "border-primary/50 bg-primary/15 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
              title="Automatically expand rows and pack smaller cards to eliminate empty bento gaps"
            >
              <Sparkles className="h-3 w-3" />
              Auto-fill: {autoFill ? "On" : "Off"}
            </button>
            <button
              type="button"
              onClick={resetLayout}
              className="inline-flex min-h-[34px] shrink-0 items-center gap-1 whitespace-nowrap rounded-lg border border-border px-3 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
            <button
              type="button"
              onClick={doneEdit}
              className="inline-flex min-h-[34px] shrink-0 items-center gap-1 whitespace-nowrap rounded-lg bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground"
            >
              <Check className="h-3 w-3" />
              Done
            </button>
          </div>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={
          ((args) => {
            const hit = pointerWithin(args);
            return hit.length > 0 ? hit : closestCenter(args);
          }) as CollisionDetection
        }
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div
          ref={gridRef}
          className="grid grid-cols-1 items-stretch gap-4 [grid-auto-flow:dense] md:grid-cols-2 lg:grid-cols-12"
        >
          {packedEntries.map((entry, idx) => {
            const def = widgetMap.get(entry.config.id);
            if (!def) return null;
            const isPreviewSlot = activeId === entry.config.id;
            return (
              <BentoSlot
                key={entry.config.id}
                config={entry.config}
                effectiveSpan={entry.effectiveSpan}
                mdSpan={entry.mdSpan}
                title={def.title}
                editing={editing}
                isDragging={Boolean(activeId)}
                isPreviewSlot={isPreviewSlot}
                isResizing={resizingState?.id === entry.config.id}
                canPair={visibleItems.length > 1 && entry.effectiveSpan >= 8}
                canMoveUp={idx > 0}
                canMoveDown={idx < packedEntries.length - 1}
                gridRef={gridRef}
                onSpan={(span) => setSpan(entry.config.id, span)}
                onResizePreview={(span) =>
                  setResizingState({ id: entry.config.id, span })
                }
                onResizeCommit={(span) => {
                  setResizingState(null);
                  setSpan(entry.config.id, span);
                }}
                onPair={() => pairWithNext(entry.config.id)}
                onMoveUp={() => moveItem(entry.config.id, -1)}
                onMoveDown={() => moveItem(entry.config.id, 1)}
                onHide={() => toggleHide(entry.config.id)}
              >
                {def.render()}
              </BentoSlot>
            );
          })}
        </div>

        <DragOverlay dropAnimation={null}>
          {activeWidget && activePacked ? (
            <div className="glass-strong pointer-events-none w-72 rounded-3xl border-2 border-primary p-4 shadow-2xl">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 font-display text-sm font-bold text-primary">
                  <GripVertical className="h-4 w-4" />
                  {activeWidget.title}
                </span>
                <span className="font-num rounded-md bg-primary/15 px-2 py-0.5 text-[0.65rem] text-primary">
                  {activePacked.effectiveSpan}/12
                </span>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Live bento preview shown in grid — release to place
              </p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

function snapSpanFromCols(cols: number): BentoSpan {
  if (cols <= 4.8) return 4;
  if (cols <= 7.1) return 6;
  if (cols <= 9.8) return 8;
  return 12;
}

function spanLabel(span: number): string {
  if (span <= 4) return "1/3";
  if (span <= 6) return "1/2";
  if (span <= 8) return "2/3";
  return "Full";
}

function BentoSlot({
  config,
  effectiveSpan,
  mdSpan,
  title,
  editing,
  isDragging,
  isPreviewSlot,
  isResizing,
  canPair,
  canMoveUp,
  canMoveDown,
  gridRef,
  onSpan,
  onResizePreview,
  onResizeCommit,
  onPair,
  onMoveUp,
  onMoveDown,
  onHide,
  children,
}: {
  config: LayoutItemConfig;
  effectiveSpan: number;
  mdSpan: 1 | 2;
  title: string;
  editing: boolean;
  isDragging: boolean;
  isPreviewSlot: boolean;
  isResizing: boolean;
  canPair: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  gridRef: React.RefObject<HTMLDivElement | null>;
  onSpan: (s: BentoSpan) => void;
  onResizePreview: (s: BentoSpan) => void;
  onResizeCommit: (s: BentoSpan) => void;
  onPair: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onHide: () => void;
  children: ReactNode;
}) {
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: config.id,
    disabled: !editing,
  });
  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    setActivatorNodeRef,
  } = useDraggable({
    id: config.id,
    disabled: !editing,
  });

  const slotRef = useRef<HTMLDivElement | null>(null);
  const setRefs = (el: HTMLDivElement | null) => {
    slotRef.current = el;
    setDropRef(el);
    setDragRef(el);
  };

  const startEdgeResize = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    const gridEl = gridRef.current;
    const cardEl = slotRef.current;
    if (!gridEl || !cardEl) return;
    const gridRect = gridEl.getBoundingClientRect();
    const startX = e.clientX;
    const startWidth = cardEl.getBoundingClientRect().width;
    const colWidth = Math.max(40, gridRect.width / 12);
    let latestSpan: BentoSpan = config.span;

    const onMove = (mv: PointerEvent) => {
      const targetWidth = Math.max(
        colWidth * 3.5,
        startWidth + (mv.clientX - startX),
      );
      const approxCols = targetWidth / colWidth;
      const snapped = snapSpanFromCols(approxCols);
      if (snapped !== latestSpan) {
        latestSpan = snapped;
        onResizePreview(snapped);
      }
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      onResizeCommit(latestSpan);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  };

  const autoExpanded = effectiveSpan !== config.span;

  return (
    <motion.div
      ref={setRefs}
      layout={isDragging ? false : "position"}
      transition={{ type: "spring", stiffness: 460, damping: 36 }}
      className={cn(
        "group/bento col-span-1 flex h-full min-w-0 flex-col transition-[opacity,border-color] duration-200",
        mdSpan === 2 && "md:col-span-2",
        SPAN_CLASS[effectiveSpan] ?? SPAN_CLASS[config.span],
        editing &&
          !isPreviewSlot &&
          "relative rounded-3xl border border-dashed border-primary/45 p-1.5",
        editing &&
          isOver &&
          !isPreviewSlot &&
          "border-primary ring-2 ring-primary/60",
        isResizing && "border-primary ring-2 ring-primary/80",
        isPreviewSlot &&
          "relative min-h-40 rounded-3xl border-2 border-dashed border-primary bg-primary/10 p-2 ring-2 ring-primary/30",
      )}
    >
      {isPreviewSlot ? (
        <div className="relative flex h-full min-h-36 flex-1 flex-col items-center justify-center overflow-hidden rounded-2xl p-4 text-center">
          <div className="pointer-events-none absolute inset-0 opacity-20">
            {children}
          </div>
          <div className="relative z-10 flex flex-col items-center rounded-xl border border-primary/50 bg-background/90 px-4 py-3 shadow-lg">
            <span className="font-num rounded-md bg-primary/20 px-3 py-1 text-xs font-semibold text-primary">
              Drop preview · {title}
            </span>
            <span className="mt-1.5 text-xs tabular-nums text-muted-foreground">
              Release to place here ({effectiveSpan}/12 cols)
            </span>
          </div>
        </div>
      ) : (
        <>
          {editing && (
            <div
              data-no-swipe
              className="mb-2 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-background/95 px-2.5 py-1.5 sm:px-3"
            >
              <div className="inline-flex min-w-0 flex-1 items-center gap-1.5 text-xs font-medium text-foreground">
                <button
                  ref={setActivatorNodeRef}
                  type="button"
                  {...listeners}
                  {...attributes}
                  aria-label={`Drag to reorder ${title}`}
                  title="Hold and drag to reorder card"
                  className="grid h-8 w-8 shrink-0 cursor-grab touch-none select-none place-items-center rounded-lg bg-primary/10 text-primary transition-colors hover:bg-primary/20 active:cursor-grabbing"
                >
                  <GripVertical className="h-4 w-4" />
                </button>
                <span className="truncate">{title}</span>
                {autoExpanded && (
                  <span className="font-num hidden shrink-0 rounded-md bg-primary/15 px-1.5 py-0.5 text-[0.6rem] text-primary md:inline-flex">
                    fill {effectiveSpan}/12
                  </span>
                )}
              </div>
              <div
                className="flex shrink-0 flex-wrap items-center gap-1"
                onPointerDown={(e) => e.stopPropagation()}
              >
                <div className="mr-0.5 flex items-center gap-0.5 rounded-lg border border-border/80 bg-muted/60 p-0.5">
                  <button
                    type="button"
                    disabled={!canMoveUp}
                    onClick={onMoveUp}
                    aria-label={`Move ${title} up`}
                    title="Move card earlier"
                    className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground disabled:opacity-30"
                  >
                    <ArrowUp className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    disabled={!canMoveDown}
                    onClick={onMoveDown}
                    aria-label={`Move ${title} down`}
                    title="Move card later"
                    className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground disabled:opacity-30"
                  >
                    <ArrowDown className="h-3 w-3" />
                  </button>
                </div>
                {canPair && (
                  <button
                    type="button"
                    onClick={onPair}
                    title="Combine 2 cards side by side (½ + ½)"
                    className="font-num mr-0.5 hidden min-h-[30px] shrink-0 items-center gap-1 whitespace-nowrap rounded-lg border border-primary/40 bg-primary/10 px-2 py-0.5 text-[0.65rem] font-medium text-primary hover:bg-primary/20 md:inline-flex"
                  >
                    <Columns2 className="h-3 w-3" />
                    Pair ½+½
                  </button>
                )}
                <div className="hidden items-center gap-1 md:flex">
                  {SPAN_CHOICES.map((c) => {
                    const active =
                      config.span === c.span ||
                      (c.span === 6 &&
                        (config.span === 5 || config.span === 7));
                    return (
                      <button
                        key={c.span}
                        type="button"
                        onClick={() => onSpan(c.span)}
                        title={`Resize target to ${c.label}`}
                        className={cn(
                          "font-num min-h-[30px] shrink-0 whitespace-nowrap rounded-lg px-2 py-0.5 text-[0.65rem] transition-colors",
                          active
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-accent hover:text-foreground",
                        )}
                      >
                        {c.label}
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={onHide}
                  aria-label={`Hide ${title}`}
                  title={`Hide ${title}`}
                  className="ml-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
                >
                  <EyeOff className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
          <div
            className={cn(
              "flex flex-1 flex-col",
              editing && "pointer-events-none opacity-90",
            )}
          >
            {children}
          </div>
          {editing && (
            <>
              <button
                type="button"
                onPointerDown={startEdgeResize}
                aria-label={`Drag edge to resize ${title}`}
                title="Drag right edge to resize bento card"
                className="group/edge absolute inset-y-4 -right-1.5 z-20 hidden w-4 cursor-ew-resize items-center justify-center rounded-full lg:flex"
              >
                <span className="h-12 w-1.5 rounded-full bg-primary/45 transition-all group-hover/edge:h-16 group-hover/edge:bg-primary" />
              </button>
              {isResizing && (
                <div className="font-num pointer-events-none absolute right-4 top-12 z-30 rounded-lg border border-primary bg-background/95 px-2.5 py-1 text-[0.7rem] font-semibold text-primary shadow-xl">
                  Width: {spanLabel(effectiveSpan)} ({effectiveSpan}/12)
                </div>
              )}
            </>
          )}
        </>
      )}
    </motion.div>
  );
}
