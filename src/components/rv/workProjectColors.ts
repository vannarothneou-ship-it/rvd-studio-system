import {
  Building2,
  FolderKanban,
  Landmark,
  Layers3,
  Package,
  type LucideIcon,
} from "lucide-react";

export interface WorkProjectAccent {
  dot: string;
  calBg: string;
  calBorder: string;
  calText: string;
}

export interface WorkProjectMeta {
  icon: LucideIcon;
  shortCode: string;
  accent: WorkProjectAccent;
}

const PRESET_ACCENTS: Record<string, WorkProjectAccent> = {
  dbg: {
    dot: "oklch(0.65 0.16 268)",
    calBg: "oklch(0.57 0.17 268 / 28%)",
    calBorder: "oklch(0.66 0.16 268 / 72%)",
    calText: "var(--foreground)",
  },
  connexion: {
    dot: "oklch(0.7 0.14 230)",
    calBg: "oklch(0.68 0.14 230 / 28%)",
    calBorder: "oklch(0.7 0.14 230 / 72%)",
    calText: "var(--foreground)",
  },
  ocic: {
    dot: "oklch(0.68 0.16 146)",
    calBg: "oklch(0.65 0.16 146 / 28%)",
    calBorder: "oklch(0.68 0.16 146 / 72%)",
    calText: "var(--foreground)",
  },
  sdbpp: {
    dot: "oklch(0.75 0.16 62)",
    calBg: "oklch(0.75 0.16 62 / 26%)",
    calBorder: "oklch(0.75 0.16 62 / 72%)",
    calText: "var(--foreground)",
  },
};

const PALETTE: WorkProjectAccent[] = [
  {
    dot: "oklch(0.7 0.14 295)",
    calBg: "oklch(0.7 0.14 295 / 26%)",
    calBorder: "oklch(0.7 0.14 295 / 68%)",
    calText: "var(--foreground)",
  },
  {
    dot: "oklch(0.75 0.16 62)",
    calBg: "oklch(0.75 0.16 62 / 26%)",
    calBorder: "oklch(0.75 0.16 62 / 68%)",
    calText: "var(--foreground)",
  },
  {
    dot: "oklch(0.7 0.12 195)",
    calBg: "oklch(0.7 0.12 195 / 26%)",
    calBorder: "oklch(0.7 0.12 195 / 68%)",
    calText: "var(--foreground)",
  },
  {
    dot: "oklch(0.68 0.17 22)",
    calBg: "oklch(0.68 0.17 22 / 26%)",
    calBorder: "oklch(0.68 0.17 22 / 68%)",
    calText: "var(--foreground)",
  },
];

const FALLBACK_ACCENT: WorkProjectAccent = {
  dot: "oklch(0.62 0.015 264)",
  calBg: "oklch(0.62 0.015 264 / 20%)",
  calBorder: "oklch(0.62 0.015 264 / 48%)",
  calText: "var(--foreground)",
};

export function workTaskProjectName(task: {
  projectName?: string | undefined;
  company?: string | undefined;
}): string {
  return (task.projectName || task.company || "").trim();
}

export function workProjectAccent(projectName: string): WorkProjectAccent {
  const key = projectName.trim().toLowerCase();
  if (!key) return FALLBACK_ACCENT;
  if (PRESET_ACCENTS[key]) return PRESET_ACCENTS[key]!;
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length]!;
}

export function workProjectMeta(projectName: string): WorkProjectMeta {
  const raw = projectName.trim();
  const key = raw.toLowerCase();
  const accent = workProjectAccent(raw);
  if (key === "dbg") {
    return { icon: Layers3, shortCode: "DBG", accent };
  }
  if (key === "connexion") {
    return { icon: Building2, shortCode: "CNX", accent };
  }
  if (key === "ocic") {
    return { icon: Landmark, shortCode: "OCIC", accent };
  }
  if (key === "sdbpp") {
    return { icon: Package, shortCode: "SDBPP", accent };
  }
  const shortCode = raw
    ? raw.length <= 5
      ? raw.toUpperCase()
      : raw.slice(0, 4).toUpperCase()
    : "WRK";
  return { icon: FolderKanban, shortCode, accent };
}
