import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowUpDown,
  Box,
  ChevronDown,
  ChevronUp,
  Compass,
  FileSpreadsheet,
  Filter,
  Globe,
  Layers,
  LayoutGrid,
  Megaphone,
  MonitorSmartphone,
  Package,
  Palette,
  PenTool,
  Plus,
  Search,
  Sparkles,
  Tag,
  Trash2,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  Btn,
  Empty,
  F,
  Glass,
  PageHeader,
  Sel,
  SlideDrawer,
  SlidingTabs,
  Stat,
} from "@/components/rv/ui";
import { nextCode, upsert } from "@/components/rv/Crud";
import {
  EditLayoutButton,
  EditableBentoGrid,
  type BentoWidgetDef,
} from "@/components/rv/BentoGrid";
import {
  PILLARS,
  PRICING_UNITS,
  compactMoney,
  effectiveServiceTags,
  serviceDeleteBlocker,
  money,
  setDB,
  uid,
  useDB,
  type Service,
} from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services · RothVan Studio" },
      {
        name: "description",
        content:
          "Manage design packages, rates, scope and timelines for RothVan Studio.",
      },
      { property: "og:title", content: "Services · RothVan Studio" },
      {
        property: "og:description",
        content: "Design packages, pricing and deliverables in one catalogue.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Services,
});

type SortBy = "code" | "rateAsc" | "rateDesc" | "name";
type DrawerGroupMode = "tag" | "pillar" | "flat";

const PILLAR_ICON: Record<string, LucideIcon> = {
  "Branding Design": PenTool,
  "Creative & Digital": Sparkles,
  "Marketing & Packaging": Megaphone,
  "Spatial Design": Compass,
};

function pillarIcon(pillar: string): LucideIcon {
  return PILLAR_ICON[pillar] ?? Tag;
}

function serviceIcon(s: Service): LucideIcon {
  const txt = `${s.name} ${s.scope}`.toLowerCase();
  if (/logo|brand|identity|guideline|monogram/.test(txt)) return PenTool;
  if (/web|landing|framer|website|site|domain/.test(txt)) return Globe;
  if (/app|ui|ux|mobile|screen|dashboard/.test(txt)) return MonitorSmartphone;
  if (/pack|box|label|bottle|pouch|dieline/.test(txt)) return Package;
  if (/booth|interior|spatial|signage|store|exhibit|3d/.test(txt))
    return Compass;
  if (/brochure|flyer|poster|menu|catalog|banner|print|deck/.test(txt))
    return FileSpreadsheet;
  if (/social|campaign|ad|marketing|carousel/.test(txt)) return Megaphone;
  if (/color|palette|typography|moodboard|illustration/.test(txt))
    return Palette;
  if (/system|asset|template|icon/.test(txt)) return Layers;
  if (/mockup|3d|render/.test(txt)) return Box;
  return pillarIcon(s.pillar);
}

function Services() {
  const db = useDB((d) => d);
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [pillar, setPillar] = useState("All");
  const [activeTag, setActiveTag] = useState("All");
  const [sortBy, setSortBy] = useState<SortBy>("code");
  const [groupByPillar, setGroupByPillar] = useState(true);
  const [editingLayout, setEditingLayout] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const allTagCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of db.services) {
      for (const t of effectiveServiceTags(s)) {
        counts.set(t, (counts.get(t) ?? 0) + 1);
      }
    }
    return Array.from(counts.entries()).sort(
      (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
    );
  }, [db.services]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    const list = db.services.filter((s) => {
      const sTags = effectiveServiceTags(s);
      return (
        (pillar === "All" || s.pillar === pillar) &&
        (activeTag === "All" || sTags.includes(activeTag)) &&
        `${s.code} ${s.name} ${s.pillar} ${s.scope} ${sTags.join(" ")}`
          .toLowerCase()
          .includes(query)
      );
    });
    return [...list].sort((a, b) => {
      if (sortBy === "rateAsc") return a.rate - b.rate;
      if (sortBy === "rateDesc") return b.rate - a.rate;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return a.code.localeCompare(b.code);
    });
  }, [db.services, pillar, activeTag, q, sortBy]);

  const grouped = useMemo(() => {
    const map = new Map<string, Service[]>();
    for (const s of filtered) {
      const key = s.pillar || "Other";
      const arr = map.get(key) ?? [];
      arr.push(s);
      map.set(key, arr);
    }
    return Array.from(map.entries());
  }, [filtered]);

  const avgRate =
    db.services.length > 0
      ? db.services.reduce((a, s) => a + s.rate, 0) / db.services.length
      : 0;

  const openEditor = useCallback((s: Service) => {
    setSelectedService({
      ...s,
      tags: effectiveServiceTags(s),
    });
  }, []);

  const renderCard = useCallback(
    (s: Service) => {
      const Icon = serviceIcon(s);
      const active = selectedService?.id === s.id;
      const tags = effectiveServiceTags(s);
      return (
        <div
          key={s.id}
          role="button"
          tabIndex={0}
          onClick={() => openEditor(s)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              openEditor(s);
            }
          }}
          className={cn(
            "glass rise group flex cursor-pointer flex-col p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/60",
            active && "border-primary ring-2 ring-primary/35",
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-border bg-muted text-primary transition-colors group-hover:border-primary/50 group-hover:bg-primary/15">
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="label-mono truncate">{s.code}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {s.pillar}
                </p>
              </div>
            </div>
            <span className="shrink-0 text-xs font-medium text-muted-foreground transition-colors group-hover:text-primary">
              Edit →
            </span>
          </div>

          <h2 className="mt-3 font-display text-lg font-bold leading-snug">
            {s.name || "Untitled service"}
          </h2>

          <p className="font-num mt-2 text-xl font-semibold text-primary">
            {money(s.rate)}{" "}
            <span className="text-xs font-normal text-muted-foreground">
              {s.unit}
            </span>
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            {s.timeline || "Timeline not set"}
            {s.overage > 0 ? ` · +${money(s.overage)} / rev` : ""}
          </p>

          {tags.length > 0 && (
            <p className="mt-2 truncate text-[0.72rem] text-muted-foreground/85">
              {tags.join(" · ")}
            </p>
          )}

          <ul className="my-3.5 flex-1 space-y-1 text-xs text-muted-foreground">
            {s.scope
              .split("\n")
              .filter(Boolean)
              .slice(0, 4)
              .map((l, i) => (
                <li key={i} className="truncate">
                  · {l}
                </li>
              ))}
          </ul>

          <div className="flex items-center justify-between gap-2 border-t border-border/60 pt-3">
            <span className="text-[0.7rem] text-muted-foreground">
              Click card to edit
            </span>
            <Link
              to="/invoices/$id"
              params={{ id: "new" }}
              search={{ service: s.id, kind: "Quotation" }}
              onClick={(e) => e.stopPropagation()}
              className="btn-gold min-h-[34px] shrink-0 whitespace-nowrap px-3 py-1 text-xs"
            >
              + Quote
            </Link>
          </div>
        </div>
      );
    },
    [selectedService?.id, openEditor],
  );

  const bentoWidgets = useMemo<BentoWidgetDef[]>(
    () => [
      {
        id: "servicesCount",
        title: "Services count",
        defaultSpan: 4,
        render: () => (
          <Glass className="h-full">
            <Stat label="Catalogue" value={`${db.services.length} services`} />
          </Glass>
        ),
      },
      {
        id: "servicesPillars",
        title: "Pillars",
        defaultSpan: 4,
        render: () => (
          <Glass delay={60} className="h-full">
            <Stat label="Design pillars" value={String(PILLARS.length)} />
          </Glass>
        ),
      },
      {
        id: "servicesAvgRate",
        title: "Average package rate",
        defaultSpan: 4,
        render: () => (
          <Glass delay={120} className="h-full">
            <Stat
              label="Avg package"
              value={compactMoney(avgRate)}
              fullValue={money(avgRate)}
            />
          </Glass>
        ),
      },
      {
        id: "servicesBrowser",
        title: "Service catalogue",
        defaultSpan: 12,
        render: () => (
          <div>
            <Glass className="mb-4 p-4 sm:p-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    className="field pl-9"
                    placeholder="Search service name, code, tag, deliverables..."
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-1.5">
                    <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                    <SlidingTabs
                      layoutGroup="services-sort-tabs"
                      tone="invert"
                      size="xs"
                      value={sortBy}
                      onChange={setSortBy}
                      options={[
                        { id: "code", label: "Code" },
                        { id: "rateAsc", label: "Price ↑" },
                        { id: "rateDesc", label: "Price ↓" },
                        { id: "name", label: "A–Z" },
                      ]}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setGroupByPillar((g) => !g)}
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                      groupByPillar
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-border text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <LayoutGrid className="h-3.5 w-3.5" />
                    {groupByPillar ? "Grouped by pillar" : "Flat grid"}
                  </button>
                </div>
              </div>

              <div className="no-scrollbar mt-3 flex flex-nowrap items-center gap-1.5 overflow-x-auto border-t border-border/60 pt-3 pb-1 sm:flex-wrap sm:pb-0">
                <button
                  type="button"
                  onClick={() => setPillar("All")}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    pillar === "All"
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border bg-muted/40 text-muted-foreground hover:border-primary/40 hover:text-foreground",
                  )}
                >
                  All ({db.services.length})
                </button>
                {PILLARS.map((p) => {
                  const PIcon = pillarIcon(p);
                  const count = db.services.filter(
                    (s) => s.pillar === p,
                  ).length;
                  const selected = pillar === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPillar(selected ? "All" : p)}
                      className={cn(
                        "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                        selected
                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                          : "border-border bg-muted/40 text-muted-foreground hover:border-primary/40 hover:text-foreground",
                      )}
                    >
                      <PIcon className="h-3.5 w-3.5" />
                      <span>{p}</span>
                      <span className="font-num text-[0.66rem] opacity-75">
                        {count}
                      </span>
                    </button>
                  );
                })}
                {activeTag !== "All" && (
                  <button
                    type="button"
                    onClick={() => setActiveTag("All")}
                    className="ml-auto inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border border-primary/50 bg-primary/15 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/25"
                  >
                    <Tag className="h-3 w-3" />
                    Tag: {activeTag}
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </Glass>

            {filtered.length === 0 ? (
              <Glass>
                <Empty>No matching services.</Empty>
              </Glass>
            ) : groupByPillar && pillar === "All" && activeTag === "All" ? (
              <div className="space-y-6">
                {grouped.map(([pillarName, items]) => {
                  const PIcon = pillarIcon(pillarName);
                  return (
                    <section key={pillarName}>
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="grid h-7 w-7 place-items-center rounded-xl border border-border bg-muted text-primary">
                            <PIcon className="h-3.5 w-3.5" />
                          </span>
                          <h3 className="font-display text-base font-bold">
                            {pillarName}
                          </h3>
                          <span className="font-num text-xs text-muted-foreground">
                            · {items.length}
                          </span>
                        </div>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {items.map(renderCard)}
                      </div>
                    </section>
                  );
                })}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map(renderCard)}
              </div>
            )}
          </div>
        ),
      },
    ],
    [
      db.services,
      avgRate,
      q,
      sortBy,
      groupByPillar,
      pillar,
      activeTag,
      filtered,
      grouped,
      renderCard,
    ],
  );

  return (
    <>
      <PageHeader
        title="Services"
        owner={db.settings.ownerName}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <EditLayoutButton
              editing={editingLayout}
              onToggle={() => setEditingLayout((e) => !e)}
            />
            <Btn
              variant="gold"
              onClick={() =>
                openEditor({
                  id: uid(),
                  code: nextCode(
                    "SV-",
                    db.services.map((s) => s.code),
                  ),
                  pillar: pillar === "All" ? (PILLARS[0] ?? "") : pillar,
                  name: "",
                  unit: "Fixed fee",
                  rate: 0,
                  scope: "",
                  timeline: "",
                  overage: 0,
                  tags: pillar === "All" ? [] : [pillar],
                })
              }
            >
              <Plus className="h-4 w-4" />
              New service
            </Btn>
          </div>
        }
      />

      <EditableBentoGrid
        pageKey="services"
        widgets={bentoWidgets}
        editing={editingLayout}
        onDoneEditing={() => setEditingLayout(false)}
      />

      <ServiceSideDrawer
        service={selectedService}
        services={db.services}
        allTagCounts={allTagCounts}
        gridTag={activeTag}
        onApplyGridTag={(t) => setActiveTag(t)}
        onSwitchService={(s) => openEditor(s)}
        onClose={() => setSelectedService(null)}
        onSave={(v) => {
          setDB((d) => ({ ...d, services: upsert(d.services, v) }));
          setSelectedService(null);
        }}
        onQuote={(v) => {
          setDB((d) => ({ ...d, services: upsert(d.services, v) }));
          setSelectedService(null);
          nav({
            to: "/invoices/$id",
            params: { id: "new" },
            search: { service: v.id, kind: "Quotation" },
          });
        }}
        onDelete={(v) => {
          const blocker = serviceDeleteBlocker(db, v.id);
          if (blocker) return blocker;
          setDB((d) => ({
            ...d,
            services: d.services.filter((s) => s.id !== v.id),
          }));
          setSelectedService(null);
          return null;
        }}
      />
    </>
  );
}

function ServiceSideDrawer({
  service,
  services,
  allTagCounts,
  gridTag,
  onApplyGridTag,
  onSwitchService,
  onClose,
  onSave,
  onQuote,
  onDelete,
}: {
  service: Service | null;
  services: Service[];
  allTagCounts: [string, number][];
  gridTag: string;
  onApplyGridTag: (tag: string) => void;
  onSwitchService: (s: Service) => void;
  onClose: () => void;
  onSave: (v: Service) => void;
  onQuote: (v: Service) => void;
  onDelete: (v: Service) => string | null;
}) {
  const [draft, setDraft] = useState<Service | null>(service);
  const [browserOpen, setBrowserOpen] = useState(false);
  const [panelQuery, setPanelQuery] = useState("");
  const [panelTag, setPanelTag] = useState("All");
  const [groupMode, setGroupMode] = useState<DrawerGroupMode>("pillar");
  const [newTagText, setNewTagText] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    setDraft(service);
    setConfirmDelete(false);
    setDeleteError(null);
    setNewTagText("");
  }, [service]);

  const drawerServices = useMemo(() => {
    const query = panelQuery.trim().toLowerCase();
    return services.filter((s) => {
      const sTags = effectiveServiceTags(s);
      if (panelTag !== "All" && !sTags.includes(panelTag)) return false;
      if (!query) return true;
      return `${s.code} ${s.name} ${s.pillar} ${sTags.join(" ")}`
        .toLowerCase()
        .includes(query);
    });
  }, [services, panelTag, panelQuery]);

  const groupedDrawer = useMemo(() => {
    if (groupMode === "flat") {
      return [["Matching services", drawerServices] as [string, Service[]]];
    }
    const map = new Map<string, Service[]>();
    for (const s of drawerServices) {
      if (groupMode === "pillar") {
        const key = s.pillar || "Other";
        const arr = map.get(key) ?? [];
        arr.push(s);
        map.set(key, arr);
      } else {
        const tags = effectiveServiceTags(s);
        const targetTags =
          panelTag !== "All"
            ? tags.filter((t) => t === panelTag)
            : tags.slice(0, 2);
        for (const t of targetTags.length ? targetTags : ["Untagged"]) {
          const arr = map.get(t) ?? [];
          arr.push(s);
          map.set(t, arr);
        }
      }
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [drawerServices, groupMode, panelTag]);

  if (!service || !draft) return null;

  const isExisting = services.some((s) => s.id === draft.id);
  const draftTags = draft.tags ?? effectiveServiceTags(draft);
  const Icon = serviceIcon(draft);

  const setField = <K extends keyof Service>(key: K, value: Service[K]) => {
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const addTagToDraft = (raw: string) => {
    const clean = raw.trim();
    if (!clean) return;
    if (!draftTags.includes(clean)) {
      setField("tags", [...draftTags, clean]);
    }
    setNewTagText("");
  };

  const removeTagFromDraft = (tag: string) => {
    setField(
      "tags",
      draftTags.filter((t) => t !== tag),
    );
  };

  return (
    <SlideDrawer
      open
      side="right"
      widthClass="max-w-xl"
      title={draft.name || draft.code || "New service"}
      subtitle={`${draft.code} · ${draft.pillar || "Studio Service"}`}
      onClose={onClose}
    >
      <div className="space-y-5">
        {/* Optional Switcher & Filter Browser (collapsed by default so editing stays front-and-center) */}
        <section className="rounded-2xl border border-border bg-muted/35 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setBrowserOpen((b) => !b)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground"
            >
              <Filter className="h-3.5 w-3.5 text-primary" />
              <span>Switch / filter service</span>
              <span className="font-num text-[0.68rem] text-muted-foreground">
                ({drawerServices.length})
              </span>
              {browserOpen ? (
                <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </button>

            <SlidingTabs
              layoutGroup="services-drawer-group"
              size="xs"
              value={groupMode}
              onChange={(next) => {
                setGroupMode(next);
                setBrowserOpen(true);
              }}
              options={[
                { id: "pillar", label: "By pillar" },
                { id: "tag", label: "By tag" },
                { id: "flat", label: "List" },
              ]}
            />
          </div>

          {browserOpen && (
            <div className="mt-3 space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    className="field h-8 pl-8 text-xs"
                    placeholder="Quick search or jump to service..."
                    value={panelQuery}
                    onChange={(e) => setPanelQuery(e.target.value)}
                  />
                </div>
                {panelTag !== gridTag && (
                  <button
                    type="button"
                    onClick={() => onApplyGridTag(panelTag)}
                    className="shrink-0 whitespace-nowrap rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1 text-[0.68rem] font-medium text-primary hover:bg-primary/20"
                  >
                    Sync grid filter
                  </button>
                )}
              </div>

              {/* Tag filter chips directly inside panel */}
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setPanelTag("All")}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-1 text-[0.68rem] font-medium transition-colors",
                    panelTag === "All"
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background/60 text-muted-foreground hover:text-foreground",
                  )}
                >
                  All ({services.length})
                </button>
                {allTagCounts.map(([tag, count]) => {
                  const selected = panelTag === tag;
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setPanelTag(selected ? "All" : tag)}
                      className={cn(
                        "inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-1 text-[0.68rem] font-medium transition-colors",
                        selected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background/60 text-muted-foreground hover:border-primary/40 hover:text-foreground",
                      )}
                    >
                      <Tag className="h-2.5 w-2.5" />
                      <span>{tag}</span>
                      <span className="font-num text-[0.62rem] opacity-75">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Grouped clickable switcher list */}
              <div className="max-h-48 space-y-2.5 overflow-y-auto pr-1">
                {drawerServices.length === 0 ? (
                  <p className="py-3 text-center text-xs text-muted-foreground">
                    No services match this tag filter.
                  </p>
                ) : (
                  groupedDrawer.map(([groupLabel, items]) => (
                    <div key={groupLabel}>
                      <p className="mb-1 flex items-center justify-between text-[0.68rem] font-semibold uppercase tracking-wider text-muted-foreground">
                        <span>{groupLabel}</span>
                        <span className="font-num">{items.length}</span>
                      </p>
                      <div className="space-y-1">
                        {items.map((item) => {
                          const ItemIcon = serviceIcon(item);
                          const current = item.id === draft.id;
                          return (
                            <button
                              key={`${groupLabel}-${item.id}`}
                              type="button"
                              onClick={() => onSwitchService(item)}
                              className={cn(
                                "flex w-full items-center justify-between gap-2 rounded-xl border px-2.5 py-1.5 text-left text-xs transition-colors",
                                current
                                  ? "border-primary bg-primary/15 text-foreground"
                                  : "border-border/70 bg-background/50 text-muted-foreground hover:border-primary/40 hover:text-foreground",
                              )}
                            >
                              <span className="flex min-w-0 items-center gap-2">
                                <ItemIcon className="h-3.5 w-3.5 shrink-0 text-primary" />
                                <span className="font-num text-[0.68rem] text-muted-foreground">
                                  {item.code}
                                </span>
                                <span className="truncate font-medium text-foreground">
                                  {item.name}
                                </span>
                              </span>
                              <span className="font-num shrink-0 text-xs font-semibold text-primary">
                                {money(item.rate)}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </section>

        {/* Active Service Summary Header */}
        <div className="flex items-center justify-between gap-3 border-b border-border/70 pb-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-primary/40 bg-primary/15 text-primary">
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">
                Editing service details
              </p>
              <p className="truncate font-display text-base font-bold">
                {draft.name || "Untitled service"}
              </p>
            </div>
          </div>
          <p className="font-num shrink-0 text-lg font-bold text-primary">
            {money(draft.rate)}
          </p>
        </div>

        {/* Service Details Form */}
        <form
          className="grid grid-cols-2 gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            onSave({ ...draft, tags: draftTags });
          }}
        >
          <F label="Service name" className="col-span-2">
            <input
              className="field"
              value={draft.name}
              onChange={(e) => setField("name", e.target.value)}
              required
            />
          </F>

          <F label="Code" className="col-span-2 sm:col-span-1">
            <input
              className="field"
              value={draft.code}
              onChange={(e) => setField("code", e.target.value)}
            />
          </F>

          <F label="Pillar (4 main services)" className="col-span-2">
            <div className="grid grid-cols-2 gap-1.5">
              {PILLARS.map((p) => {
                const PIcon = pillarIcon(p);
                const selected = draft.pillar === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setField("pillar", p)}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs font-medium transition-colors",
                      selected
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "border-border bg-muted/45 text-muted-foreground hover:border-primary/45 hover:text-foreground",
                    )}
                  >
                    <PIcon
                      className={cn(
                        "h-3.5 w-3.5 shrink-0",
                        selected ? "text-primary-foreground" : "text-primary",
                      )}
                    />
                    <span className="truncate">{p}</span>
                  </button>
                );
              })}
            </div>
          </F>

          <F label="Pricing unit" className="col-span-2 sm:col-span-1">
            <Sel
              value={draft.unit}
              onChange={(v) => setField("unit", v)}
              options={PRICING_UNITS}
              placeholder="Choose unit…"
            />
          </F>

          <F label="Rate (USD)" className="col-span-2 sm:col-span-1">
            <input
              className="field tabular-nums"
              type="number"
              step="any"
              value={draft.rate}
              onChange={(e) => setField("rate", Number(e.target.value))}
            />
          </F>

          <F label="Extra revision (USD)" className="col-span-2 sm:col-span-1">
            <input
              className="field tabular-nums"
              type="number"
              step="any"
              value={draft.overage}
              onChange={(e) => setField("overage", Number(e.target.value))}
            />
          </F>

          <F label="Timeline" className="col-span-2 sm:col-span-1">
            <input
              className="field"
              placeholder="e.g. 5 Days"
              value={draft.timeline}
              onChange={(e) => setField("timeline", e.target.value)}
            />
          </F>

          {/* Editable Service Tags */}
          <div className="col-span-2 space-y-2 rounded-2xl border border-border/70 bg-muted/25 p-3">
            <span className="label-mono block">Tags</span>
            <div className="flex flex-wrap gap-1.5">
              {draftTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => removeTagFromDraft(tag)}
                  title={`Remove tag ${tag}`}
                  className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border border-primary/40 bg-primary/15 px-2.5 py-0.5 text-xs font-medium text-primary hover:bg-destructive/15 hover:text-destructive"
                >
                  <Tag className="h-2.5 w-2.5" />
                  <span>{tag}</span>
                  <X className="h-3 w-3" />
                </button>
              ))}
              {draftTags.length === 0 && (
                <span className="text-xs text-muted-foreground">
                  No tags yet — add one below
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <input
                className="field h-8 flex-1 text-xs"
                placeholder="Add custom tag (e.g. Retainer, Print-ready)..."
                value={newTagText}
                onChange={(e) => setNewTagText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTagToDraft(newTagText);
                  }
                }}
              />
              <Btn
                type="button"
                className="h-8 shrink-0 px-3 py-1 text-xs"
                onClick={() => addTagToDraft(newTagText)}
              >
                <Plus className="h-3.5 w-3.5" />
                Add tag
              </Btn>
            </div>
          </div>

          <F label="Included deliverables" className="col-span-2">
            <textarea
              className="field min-h-28"
              value={draft.scope}
              onChange={(e) => setField("scope", e.target.value)}
            />
          </F>

          {isExisting && (
            <div className="col-span-2 flex items-center justify-between rounded-2xl border border-border/70 bg-muted/30 p-3 text-xs">
              <span className="text-muted-foreground">
                Create a client quotation with this service prefilled
              </span>
              <Btn
                type="button"
                className="shrink-0 whitespace-nowrap px-3 py-1 text-xs"
                onClick={() => onQuote({ ...draft, tags: draftTags })}
              >
                Quote →
              </Btn>
            </div>
          )}

          {deleteError && (
            <p className="col-span-2 rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {deleteError}
            </p>
          )}

          <div className="col-span-2 mt-1 flex flex-wrap items-center justify-between gap-2 border-t border-border/70 pt-3">
            {isExisting ? (
              confirmDelete ? (
                <div className="flex items-center gap-2">
                  <Btn
                    type="button"
                    variant="danger"
                    className="px-3 py-1.5 text-xs"
                    onClick={() => {
                      const err = onDelete(draft);
                      if (err) {
                        setDeleteError(err);
                        setConfirmDelete(false);
                      }
                    }}
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
                Save changes
              </Btn>
            </div>
          </div>
        </form>
      </div>
    </SlideDrawer>
  );
}
