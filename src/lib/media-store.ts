import { uid, type DesignMedia } from "@/lib/store";

const IDB_NAME = "rv-design-media-v1";
const STORE_NAME = "blobs";

function openMediaDB(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === "undefined") return Promise.resolve(null);
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open(IDB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function saveMediaBlob(
  id: string,
  dataUrl: string,
): Promise<void> {
  const db = await openMediaDB();
  if (!db) return;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).put(dataUrl, id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

export async function loadMediaBlob(id: string): Promise<string | null> {
  const db = await openMediaDB();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, "readonly");
      const req = tx.objectStore(STORE_NAME).get(id);
      req.onsuccess = () =>
        resolve(typeof req.result === "string" ? req.result : null);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function exportMediaBlobs(
  ids: string[],
): Promise<Record<string, string>> {
  const uniqueIds = Array.from(new Set(ids.filter(Boolean)));
  const db = await openMediaDB();
  if (!db || uniqueIds.length === 0) return {};
  try {
    const entries = await Promise.all(
      uniqueIds.map(
        (id) =>
          new Promise<[string, string] | null>((resolve) => {
            try {
              const request = db
                .transaction(STORE_NAME, "readonly")
                .objectStore(STORE_NAME)
                .get(id);
              request.onsuccess = () =>
                resolve(
                  typeof request.result === "string"
                    ? [id, request.result]
                    : null,
                );
              request.onerror = () => resolve(null);
            } catch {
              resolve(null);
            }
          }),
      ),
    );
    return Object.fromEntries(entries.filter((entry) => entry !== null));
  } finally {
    db.close();
  }
}

export async function restoreMediaBlobs(
  blobs: Record<string, unknown>,
): Promise<number> {
  const entries = Object.entries(blobs).filter(
    (entry): entry is [string, string] =>
      typeof entry[0] === "string" &&
      typeof entry[1] === "string" &&
      entry[1].startsWith("data:"),
  );
  if (entries.length === 0) return 0;
  const db = await openMediaDB();
  if (!db) return 0;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      entries.forEach(([id, dataUrl]) => store.put(dataUrl, id));
      tx.oncomplete = () => {
        db.close();
        resolve(entries.length);
      };
      tx.onerror = () => {
        db.close();
        resolve(0);
      };
      tx.onabort = () => {
        db.close();
        resolve(0);
      };
    } catch {
      db.close();
      resolve(0);
    }
  });
}

export async function deleteMediaBlob(id: string): Promise<void> {
  const db = await openMediaDB();
  if (!db) return;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

async function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Could not read file."));
    };
    reader.onerror = () => reject(new Error("Could not read file."));
    reader.readAsDataURL(file);
  });
}

async function compressImage(
  file: File,
  maxDim: number,
  quality: number,
): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = () => rej(new Error("Invalid image file."));
      i.src = url;
    });
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height, 1));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(img.width * scale));
    canvas.height = Math.max(1, Math.round(img.height * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context unavailable.");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const outType = file.type === "image/png" ? "image/png" : "image/jpeg";
    return canvas.toDataURL(outType, quality);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "";
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
}

export async function processDesignMediaFile(file: File): Promise<DesignMedia> {
  const name = file.name || "design-file";
  const lower = name.toLowerCase();
  const isPdf = file.type === "application/pdf" || lower.endsWith(".pdf");
  const isImage =
    file.type.startsWith("image/") || /\.(png|jpe?g|webp|gif|svg)$/.test(lower);

  if (!isPdf && !isImage) {
    throw new Error(
      `Unsupported file "${name}". Upload PNG, JPEG, WEBP, or PDF files.`,
    );
  }

  if (file.size > 15 * 1024 * 1024) {
    throw new Error(`"${name}" exceeds the 15 MB limit.`);
  }

  const id = `med-${uid()}`;
  const createdAt = new Date().toISOString();

  if (isPdf) {
    const pdfDataUrl = await readFileAsDataUrl(file);
    await saveMediaBlob(id, pdfDataUrl);
    return {
      id,
      name,
      mimeType: "application/pdf",
      kind: "pdf",
      size: file.size,
      // Keep small PDFs inline as fallback; large PDFs live in IndexedDB so localStorage never overflows.
      ...(file.size <= 160 * 1024 ? { dataUrl: pdfDataUrl } : {}),
      createdAt,
    };
  }

  const fullImg = await compressImage(file, 1400, 0.85);
  await saveMediaBlob(id, fullImg);
  // Compact thumbnail stays inside DB JSON for instant grid rendering even offline/without async lookup.
  const thumb = await compressImage(file, 420, 0.72);

  return {
    id,
    name,
    mimeType: file.type || "image/jpeg",
    kind: "image",
    size: file.size,
    dataUrl: thumb,
    createdAt,
  };
}
