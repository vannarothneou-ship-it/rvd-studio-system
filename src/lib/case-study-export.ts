import { loadMediaBlob } from "@/lib/media-store";
import type {
  CaseStudyAspect,
  CaseStudyDoc,
  CaseStudyTheme,
  DesignMedia,
} from "@/lib/store";

interface ThemePalette {
  bg: string;
  bgSoft: string;
  card: string;
  ink: string;
  muted: string;
  accent: string;
  border: string;
}

const THEMES: Record<CaseStudyTheme, ThemePalette> = {
  obsidian: {
    bg: "#161618",
    bgSoft: "#1f1f23",
    card: "#232328",
    ink: "#f4efe6",
    muted: "#a9a398",
    accent: "#e2b857",
    border: "rgba(255,255,255,0.12)",
  },
  paper: {
    bg: "#f7f5f0",
    bgSoft: "#eeebe3",
    card: "#ffffff",
    ink: "#1c1c1e",
    muted: "#64615a",
    accent: "#b57c16",
    border: "rgba(28,28,30,0.12)",
  },
  slate: {
    bg: "#101620",
    bgSoft: "#172030",
    card: "#1b2638",
    ink: "#edf2fa",
    muted: "#95a5bd",
    accent: "#59c19c",
    border: "rgba(255,255,255,0.12)",
  },
};

function aspectWidthHeight(aspect: CaseStudyAspect): {
  width: number;
  minHeight: number;
  pageHeight: number;
} {
  if (aspect === "social-4x5") {
    return { width: 1080, minHeight: 1350, pageHeight: 1350 };
  }
  if (aspect === "square-1x1") {
    return { width: 1080, minHeight: 1080, pageHeight: 1080 };
  }
  if (aspect === "slide-16x9") {
    return { width: 1600, minHeight: 900, pageHeight: 900 };
  }
  return { width: 1240, minHeight: 1754, pageHeight: 1754 };
}

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const rawParagraphs = text.split(/\r?\n/);
  const lines: string[] = [];
  for (const para of rawParagraphs) {
    const trimmed = para.trim();
    if (!trimmed) {
      lines.push("");
      continue;
    }
    const words = trimmed.split(/\s+/);
    let current = "";
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (ctx.measureText(candidate).width <= maxWidth) {
        current = candidate;
      } else {
        if (current) lines.push(current);
        current = word;
      }
    }
    if (current) lines.push(current);
  }
  return lines;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.lineTo(x + w - rad, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rad);
  ctx.lineTo(x + w, y + h - rad);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
  ctx.lineTo(x + rad, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rad);
  ctx.lineTo(x, y + rad);
  ctx.quadraticCurveTo(x, y, x + rad, y);
  ctx.closePath();
}

async function resolveImageElement(
  media: DesignMedia | undefined,
): Promise<HTMLImageElement | null> {
  if (!media || media.kind !== "image") return null;
  let src: string | null = await loadMediaBlob(media.id);
  if (!src) src = media.dataUrl ?? null;
  if (!src) return null;

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function drawImageContained(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  boxW: number,
  boxH: number,
) {
  const scale = Math.min(boxW / img.width, boxH / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  const dx = x + (boxW - dw) / 2;
  const dy = y + (boxH - dh) / 2;
  ctx.drawImage(img, dx, dy, dw, dh);
}

/**
 * Pure TypeScript PDF 1.4 generator packing JPEG page images with exact xref offsets.
 * Zero external dependencies and safely testable in Node.
 */
export function buildPdfFromJpegs(
  pages: { jpegBytes: Uint8Array; width: number; height: number }[],
): Uint8Array {
  const enc = new TextEncoder();
  const chunks: Uint8Array[] = [];
  let offset = 0;

  const pushStr = (s: string) => {
    const b = enc.encode(s);
    chunks.push(b);
    offset += b.length;
  };
  const pushBytes = (b: Uint8Array) => {
    chunks.push(b);
    offset += b.length;
  };

  pushStr("%PDF-1.4\n%\xFF\xFF\xFF\xFF\n");

  const offsets: number[] = [0]; // obj 0 free
  const totalPages = Math.max(1, pages.length);

  // Reserve obj 1 = Catalog, obj 2 = Pages
  // Each page uses 3 objects: Page (3 + i*3), Contents (4 + i*3), Image XObject (5 + i*3)
  const pageObjNums: number[] = [];
  for (let i = 0; i < totalPages; i++) {
    pageObjNums.push(3 + i * 3);
  }

  offsets[1] = offset;
  pushStr("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");

  offsets[2] = offset;
  pushStr(
    `2 0 obj\n<< /Type /Pages /Kids [${pageObjNums.map((n) => `${n} 0 R`).join(" ")}] /Count ${totalPages} >>\nendobj\n`,
  );

  for (let i = 0; i < pages.length; i++) {
    const pg = pages[i]!;
    const pageObj = 3 + i * 3;
    const contentObj = 4 + i * 3;
    const imgObj = 5 + i * 3;

    // A4-friendly point width (595.28pt) scaled cleanly to preserve aspect ratio
    const ptW = 595.28;
    const ptH =
      Math.round(((ptW * pg.height) / Math.max(1, pg.width)) * 100) / 100;
    const streamStr = `q\n${ptW} 0 0 ${ptH} 0 0 cm\n/Im0 Do\nQ\n`;

    offsets[pageObj] = offset;
    pushStr(
      `${pageObj} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${ptW} ${ptH}] /Resources << /XObject << /Im0 ${imgObj} 0 R >> >> /Contents ${contentObj} 0 R >>\nendobj\n`,
    );

    offsets[contentObj] = offset;
    pushStr(
      `${contentObj} 0 obj\n<< /Length ${streamStr.length} >>\nstream\n${streamStr}endstream\nendobj\n`,
    );

    offsets[imgObj] = offset;
    pushStr(
      `${imgObj} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${pg.width} /Height ${pg.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${pg.jpegBytes.length} >>\nstream\n`,
    );
    pushBytes(pg.jpegBytes);
    pushStr("\nendstream\nendobj\n");
  }

  const xrefOffset = offset;
  const count = offsets.length;
  pushStr(`xref\n0 ${count}\n0000000000 65535 f \n`);
  for (let i = 1; i < count; i++) {
    const pos = String(offsets[i] ?? 0).padStart(10, "0");
    pushStr(`${pos} 00000 n \n`);
  }
  pushStr(
    `trailer\n<< /Size ${count} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`,
  );

  const out = new Uint8Array(offset);
  let cursor = 0;
  for (const c of chunks) {
    out.set(c, cursor);
    cursor += c.length;
  }
  return out;
}

function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const idx = dataUrl.indexOf(",");
  const base64 = idx >= 0 ? dataUrl.slice(idx + 1) : dataUrl;
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    bytes[i] = bin.charCodeAt(i);
  }
  return bytes;
}

export async function renderCaseStudyMasterCanvas(
  doc: CaseStudyDoc,
  mediaList: DesignMedia[],
  ownerName: string,
): Promise<HTMLCanvasElement> {
  const palette = THEMES[doc.theme] ?? THEMES.obsidian;
  const dims = aspectWidthHeight(doc.aspect);
  const W = dims.width;
  const padX = Math.round(W * 0.068);
  const innerW = W - padX * 2;
  const mediaMap = new Map(mediaList.map((m) => [m.id, m]));

  // Preload all needed images
  const imageCache = new Map<string, HTMLImageElement | null>();
  for (const b of doc.blocks) {
    for (const mid of b.mediaIds ?? []) {
      if (!imageCache.has(mid)) {
        imageCache.set(mid, await resolveImageElement(mediaMap.get(mid)));
      }
    }
  }

  // First pass on offscreen canvas to measure exact height
  const probe = document.createElement("canvas");
  probe.width = W;
  probe.height = 400;
  const pCtx = probe.getContext("2d")!;

  let y = 72;
  // Top monogram eyebrow
  y += 38;

  for (const block of doc.blocks) {
    if (block.type === "header") {
      pCtx.font = "700 44px Georgia, Merriweather, serif";
      const hLines = wrapLines(
        pCtx,
        block.title || doc.title || "Case Study",
        innerW,
      );
      y += hLines.length * 54;
      if (block.text) {
        pCtx.font = "500 20px 'Plus Jakarta Sans', Inter, sans-serif";
        const sLines = wrapLines(pCtx, block.text, innerW);
        y += 10 + sLines.length * 28;
      }
      y += 28;
    } else if (block.type === "subheader") {
      pCtx.font = "700 28px Georgia, Merriweather, serif";
      const lines = wrapLines(pCtx, block.title || "Section", innerW);
      y += 12 + lines.length * 36;
      if (block.text) y += 26;
      y += 14;
    } else if (block.type === "paragraph") {
      pCtx.font = "400 20px 'Plus Jakarta Sans', Inter, sans-serif";
      const lines = wrapLines(pCtx, block.text || "", innerW);
      y += Math.max(1, lines.length) * 32 + 22;
    } else if (block.type === "divider") {
      y += 34;
    } else if (block.type === "metrics") {
      y += 116;
    } else if (block.type === "quote") {
      pCtx.font = "italic 22px Georgia, Merriweather, serif";
      const lines = wrapLines(pCtx, block.text || "", innerW - 56);
      y += 44 + lines.length * 32 + 28;
    } else if (block.type === "image") {
      const mid = block.mediaIds?.[0];
      const img = mid ? imageCache.get(mid) : null;
      const boxH = img
        ? Math.min(
            680,
            Math.max(
              280,
              Math.round((innerW * img.height) / Math.max(1, img.width)),
            ),
          )
        : 220;
      y += boxH + (block.caption ? 34 : 16) + 20;
    } else if (block.type === "gallery") {
      const ids = (block.mediaIds ?? []).slice(0, 2);
      const colW = (innerW - 22) / 2;
      let maxImgH = 260;
      for (const id of ids) {
        const img = imageCache.get(id);
        if (img) {
          const h = Math.min(
            440,
            Math.max(
              220,
              Math.round((colW * img.height) / Math.max(1, img.width)),
            ),
          );
          if (h > maxImgH) maxImgH = h;
        }
      }
      y += maxImgH + (block.caption ? 34 : 16) + 20;
    }
  }

  y += 88; // footer space
  const totalH = Math.max(dims.minHeight, y);

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = totalH;
  const ctx = canvas.getContext("2d")!;

  // Background
  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, W, totalH);

  // Subtle top glow bar
  const grad = ctx.createLinearGradient(0, 0, W, 0);
  grad.addColorStop(0, palette.accent);
  grad.addColorStop(1, "transparent");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, 6);

  // Header eyebrow bar
  let cy = 62;
  ctx.font = "700 13px 'Plus Jakarta Sans', Inter, sans-serif";
  ctx.fillStyle = palette.accent;
  ctx.fillText(
    `${doc.projectGroup || "ROTHVAN DESIGN"} · CASE STUDY`.toUpperCase(),
    padX,
    cy,
  );
  ctx.textAlign = "right";
  ctx.fillStyle = palette.muted;
  ctx.fillText(
    (doc.designType || "DESIGN PORTFOLIO").toUpperCase(),
    W - padX,
    cy,
  );
  ctx.textAlign = "left";
  cy += 42;

  for (const block of doc.blocks) {
    if (block.type === "header") {
      const center = block.align === "center";
      ctx.textAlign = center ? "center" : "left";
      const tx = center ? W / 2 : padX;
      ctx.font = "700 44px Georgia, Merriweather, serif";
      ctx.fillStyle = palette.ink;
      const hLines = wrapLines(
        ctx,
        block.title || doc.title || "Case Study",
        innerW,
      );
      for (const line of hLines) {
        ctx.fillText(line, tx, cy);
        cy += 54;
      }
      if (block.text) {
        cy += 4;
        ctx.font = "500 20px 'Plus Jakarta Sans', Inter, sans-serif";
        ctx.fillStyle = palette.muted;
        const sLines = wrapLines(ctx, block.text, innerW);
        for (const line of sLines) {
          ctx.fillText(line, tx, cy);
          cy += 28;
        }
      }
      ctx.textAlign = "left";
      cy += 24;
    } else if (block.type === "subheader") {
      cy += 8;
      if (block.text) {
        ctx.font = "700 12px 'Plus Jakarta Sans', Inter, sans-serif";
        ctx.fillStyle = palette.accent;
        ctx.fillText(block.text.toUpperCase(), padX, cy);
        cy += 24;
      }
      ctx.font = "700 28px Georgia, Merriweather, serif";
      ctx.fillStyle = palette.ink;
      const lines = wrapLines(ctx, block.title || "Section", innerW);
      for (const line of lines) {
        ctx.fillText(line, padX, cy);
        cy += 36;
      }
      cy += 12;
    } else if (block.type === "paragraph") {
      ctx.font = "400 20px 'Plus Jakarta Sans', Inter, sans-serif";
      ctx.fillStyle = palette.ink;
      const lines = wrapLines(ctx, block.text || "", innerW);
      for (const line of lines) {
        ctx.fillText(line, padX, cy);
        cy += 32;
      }
      cy += 20;
    } else if (block.type === "divider") {
      ctx.strokeStyle = palette.border;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(padX, cy + 12);
      ctx.lineTo(W - padX, cy + 12);
      ctx.stroke();
      cy += 34;
    } else if (block.type === "metrics") {
      const stats = (block.stats ?? []).slice(0, 4);
      const count = Math.max(1, stats.length);
      const gap = 16;
      const boxW = (innerW - gap * (count - 1)) / count;
      const boxH = 92;
      stats.forEach((st, idx) => {
        const bx = padX + idx * (boxW + gap);
        drawRoundedRect(ctx, bx, cy, boxW, boxH, 16);
        ctx.fillStyle = palette.card;
        ctx.fill();
        ctx.strokeStyle = palette.border;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.font = "700 11px 'Plus Jakarta Sans', Inter, sans-serif";
        ctx.fillStyle = palette.muted;
        ctx.fillText(st.label.toUpperCase(), bx + 16, cy + 30);

        ctx.font = "700 20px 'Plus Jakarta Sans', Inter, sans-serif";
        ctx.fillStyle = idx === 0 ? palette.accent : palette.ink;
        const val =
          st.value.length > 20 ? `${st.value.slice(0, 18)}…` : st.value;
        ctx.fillText(val, bx + 16, cy + 64);
      });
      cy += boxH + 24;
    } else if (block.type === "quote") {
      ctx.font = "italic 22px Georgia, Merriweather, serif";
      const lines = wrapLines(ctx, block.text || "", innerW - 56);
      const boxH = 42 + lines.length * 32;
      drawRoundedRect(ctx, padX, cy, innerW, boxH, 18);
      ctx.fillStyle = palette.bgSoft;
      ctx.fill();
      ctx.fillStyle = palette.accent;
      ctx.fillRect(padX, cy + 14, 5, boxH - 28);

      let qy = cy + 32;
      if (block.title) {
        ctx.font = "700 12px 'Plus Jakarta Sans', Inter, sans-serif";
        ctx.fillStyle = palette.accent;
        ctx.fillText(block.title.toUpperCase(), padX + 26, qy);
        qy += 26;
      }
      ctx.font = "italic 20px Georgia, Merriweather, serif";
      ctx.fillStyle = palette.ink;
      for (const line of lines) {
        ctx.fillText(line, padX + 26, qy);
        qy += 30;
      }
      cy += boxH + 22;
    } else if (block.type === "image") {
      const mid = block.mediaIds?.[0];
      const img = mid ? imageCache.get(mid) : null;
      const boxH = img
        ? Math.min(
            680,
            Math.max(
              280,
              Math.round((innerW * img.height) / Math.max(1, img.width)),
            ),
          )
        : 220;
      drawRoundedRect(ctx, padX, cy, innerW, boxH, 20);
      ctx.fillStyle = palette.bgSoft;
      ctx.fill();
      ctx.strokeStyle = palette.border;
      ctx.lineWidth = 1;
      ctx.stroke();

      if (img) {
        ctx.save();
        drawRoundedRect(ctx, padX + 12, cy + 12, innerW - 24, boxH - 24, 14);
        ctx.clip();
        drawImageContained(
          ctx,
          img,
          padX + 12,
          cy + 12,
          innerW - 24,
          boxH - 24,
        );
        ctx.restore();
      } else {
        ctx.font = "500 16px 'Plus Jakarta Sans', Inter, sans-serif";
        ctx.fillStyle = palette.muted;
        ctx.textAlign = "center";
        ctx.fillText("Visual mockup slot", W / 2, cy + boxH / 2);
        ctx.textAlign = "left";
      }
      cy += boxH + 14;
      if (block.caption) {
        ctx.font = "500 14px 'Plus Jakarta Sans', Inter, sans-serif";
        ctx.fillStyle = palette.muted;
        ctx.fillText(block.caption, padX, cy + 12);
        cy += 26;
      }
      cy += 16;
    } else if (block.type === "gallery") {
      const ids = (block.mediaIds ?? []).slice(0, 2);
      const gap = 22;
      const colW = (innerW - gap) / 2;
      let maxImgH = 260;
      for (const id of ids) {
        const img = imageCache.get(id);
        if (img) {
          const h = Math.min(
            440,
            Math.max(
              220,
              Math.round((colW * img.height) / Math.max(1, img.width)),
            ),
          );
          if (h > maxImgH) maxImgH = h;
        }
      }
      for (let i = 0; i < 2; i++) {
        const gx = padX + i * (colW + gap);
        drawRoundedRect(ctx, gx, cy, colW, maxImgH, 18);
        ctx.fillStyle = palette.bgSoft;
        ctx.fill();
        ctx.strokeStyle = palette.border;
        ctx.lineWidth = 1;
        ctx.stroke();
        const mid = ids[i];
        const img = mid ? imageCache.get(mid) : null;
        if (img) {
          ctx.save();
          drawRoundedRect(ctx, gx + 10, cy + 10, colW - 20, maxImgH - 20, 12);
          ctx.clip();
          drawImageContained(
            ctx,
            img,
            gx + 10,
            cy + 10,
            colW - 20,
            maxImgH - 20,
          );
          ctx.restore();
        } else {
          ctx.font = "500 14px 'Plus Jakarta Sans', Inter, sans-serif";
          ctx.fillStyle = palette.muted;
          ctx.textAlign = "center";
          ctx.fillText(`Image ${i + 1}`, gx + colW / 2, cy + maxImgH / 2);
          ctx.textAlign = "left";
        }
      }
      cy += maxImgH + 14;
      if (block.caption) {
        ctx.font = "500 14px 'Plus Jakarta Sans', Inter, sans-serif";
        ctx.fillStyle = palette.muted;
        ctx.fillText(block.caption, padX, cy + 12);
        cy += 26;
      }
      cy += 16;
    }
  }

  // Footer
  const fy = totalH - 42;
  ctx.strokeStyle = palette.border;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padX, fy - 24);
  ctx.lineTo(W - padX, fy - 24);
  ctx.stroke();

  ctx.font = "600 13px 'Plus Jakarta Sans', Inter, sans-serif";
  ctx.fillStyle = palette.muted;
  ctx.fillText(`Prepared by ${ownerName || "RothVan Design"}`, padX, fy);
  ctx.textAlign = "right";
  ctx.fillStyle = palette.accent;
  ctx.fillText(doc.projectGroup || "RothVan Studio", W - padX, fy);
  ctx.textAlign = "left";

  return canvas;
}

export async function downloadCaseStudy(
  doc: CaseStudyDoc,
  mediaList: DesignMedia[],
  ownerName: string,
  format: "png" | "jpeg" | "pdf",
): Promise<void> {
  const master = await renderCaseStudyMasterCanvas(doc, mediaList, ownerName);
  const slug =
    (doc.title || "case-study")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "case-study";

  const triggerHref = (href: string, filename: string, revoke = false) => {
    const a = document.createElement("a");
    a.href = href;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    if (revoke) {
      setTimeout(() => URL.revokeObjectURL(href), 1500);
    }
  };

  if (format === "png") {
    triggerHref(master.toDataURL("image/png"), `${slug}-case-study.png`);
    return;
  }

  if (format === "jpeg") {
    triggerHref(master.toDataURL("image/jpeg", 0.92), `${slug}-case-study.jpg`);
    return;
  }

  // Slice master canvas vertically into clean A4-proportioned pages for PDF
  const pageH = Math.round(master.width * 1.414);
  const pages: { jpegBytes: Uint8Array; width: number; height: number }[] = [];
  for (let sy = 0; sy < master.height; sy += pageH) {
    const sliceH = Math.min(pageH, master.height - sy);
    const pageCanvas = document.createElement("canvas");
    pageCanvas.width = master.width;
    pageCanvas.height = sliceH;
    const pCtx = pageCanvas.getContext("2d")!;
    pCtx.drawImage(
      master,
      0,
      sy,
      master.width,
      sliceH,
      0,
      0,
      master.width,
      sliceH,
    );
    const jpgDataUrl = pageCanvas.toDataURL("image/jpeg", 0.92);
    pages.push({
      jpegBytes: dataUrlToUint8Array(jpgDataUrl),
      width: pageCanvas.width,
      height: pageCanvas.height,
    });
  }

  const pdfBytes = buildPdfFromJpegs(pages);
  const safeBytes = new Uint8Array(pdfBytes.byteLength);
  safeBytes.set(pdfBytes);
  const blob = new Blob([safeBytes.buffer], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  triggerHref(url, `${slug}-case-study.pdf`, true);
}
