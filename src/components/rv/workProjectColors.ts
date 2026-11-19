export interface WorkProjectAccent {
  dot: string;
  calBg: string;
  calBorder: string;
  calText: string;
}

const PRESET_ACCENTS: Record<string, WorkProjectAccent> = {
  dbg: {
    dot: "oklch(0.83 0.14 82)",
    calBg: "oklch(0.83 0.14 82 / 24%)",
    calBorder: "oklch(0.83 0.14 82 / 58%)",
    calText: "var(--foreground)",
  },
  connexion: {
    dot: "oklch(0.7 0.14 240)",
    calBg: "oklch(0.68 0.14 240 / 26%)",
    calBorder: "oklch(0.68 0.14 240 / 58%)",
    calText: "var(--foreground)",
  },
  ocic: {
    dot: "oklch(0.76 0.14 155)",
    calBg: "oklch(0.76 0.14 155 / 24%)",
    calBorder: "oklch(0.76 0.14 155 / 58%)",
    calText: "var(--foreground)",
  },
};

const PALETTE: WorkProjectAccent[] = [
  {
    dot: "oklch(0.72 0.14 300)",
    calBg: "oklch(0.72 0.14 300 / 24%)",
    calBorder: "oklch(0.72 0.14 300 / 58%)",
    calText: "var(--foreground)",
  },
  {
    dot: "oklch(0.74 0.14 45)",
    calBg: "oklch(0.74 0.14 45 / 24%)",
    calBorder: "oklch(0.74 0.14 45 / 58%)",
    calText: "var(--foreground)",
  },
  {
    dot: "oklch(0.72 0.12 195)",
    calBg: "oklch(0.72 0.12 195 / 24%)",
    calBorder: "oklch(0.72 0.12 195 / 58%)",
    calText: "var(--foreground)",
  },
  {
    dot: "oklch(0.72 0.14 15)",
    calBg: "oklch(0.72 0.14 15 / 24%)",
    calBorder: "oklch(0.72 0.14 15 / 58%)",
    calText: "var(--foreground)",
  },
];

const FALLBACK_ACCENT: WorkProjectAccent = {
  dot: "oklch(0.68 0.02 70)",
  calBg: "oklch(0.68 0.02 70 / 22%)",
  calBorder: "oklch(0.68 0.02 70 / 48%)",
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
