export interface WorkProjectAccent {
  dot: string;
  calBg: string;
  calBorder: string;
  calText: string;
}

const PRESET_ACCENTS: Record<string, WorkProjectAccent> = {
  dbg: {
    dot: "oklch(0.83 0.14 82)",
    calBg: "oklch(0.83 0.14 82 / 22%)",
    calBorder: "oklch(0.83 0.14 82 / 55%)",
    calText: "oklch(0.96 0.03 82)",
  },
  connexion: {
    dot: "oklch(0.7 0.14 240)",
    calBg: "oklch(0.68 0.14 240 / 24%)",
    calBorder: "oklch(0.68 0.14 240 / 55%)",
    calText: "oklch(0.95 0.03 240)",
  },
  ocic: {
    dot: "oklch(0.76 0.14 155)",
    calBg: "oklch(0.76 0.14 155 / 22%)",
    calBorder: "oklch(0.76 0.14 155 / 55%)",
    calText: "oklch(0.95 0.03 155)",
  },
};

const PALETTE: WorkProjectAccent[] = [
  {
    dot: "oklch(0.72 0.14 300)",
    calBg: "oklch(0.72 0.14 300 / 22%)",
    calBorder: "oklch(0.72 0.14 300 / 55%)",
    calText: "oklch(0.95 0.03 300)",
  },
  {
    dot: "oklch(0.74 0.14 45)",
    calBg: "oklch(0.74 0.14 45 / 22%)",
    calBorder: "oklch(0.74 0.14 45 / 55%)",
    calText: "oklch(0.95 0.03 45)",
  },
  {
    dot: "oklch(0.72 0.12 195)",
    calBg: "oklch(0.72 0.12 195 / 22%)",
    calBorder: "oklch(0.72 0.12 195 / 55%)",
    calText: "oklch(0.95 0.03 195)",
  },
  {
    dot: "oklch(0.72 0.14 15)",
    calBg: "oklch(0.72 0.14 15 / 22%)",
    calBorder: "oklch(0.72 0.14 15 / 55%)",
    calText: "oklch(0.95 0.03 15)",
  },
];

const FALLBACK_ACCENT: WorkProjectAccent = {
  dot: "oklch(0.68 0.02 70)",
  calBg: "oklch(0.68 0.02 70 / 20%)",
  calBorder: "oklch(0.68 0.02 70 / 45%)",
  calText: "oklch(0.94 0.01 70)",
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
