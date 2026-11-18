import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { scanReceiptWithGemini } from "./lib/receipt-scanner";

type ServerEntry = {
  fetch: (
    request: Request,
    env: unknown,
    ctx: unknown,
  ) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

const ALLOWED_IMAGE_MIMES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function resolveUpstreamStatus(err: unknown): number {
  if (
    typeof err === "object" &&
    err !== null &&
    "status" in err &&
    typeof (err as { status?: unknown }).status === "number"
  ) {
    return (err as { status: number }).status;
  }
  const msg = err instanceof Error ? err.message : String(err);
  if (/API_KEY_INVALID|invalid api key/i.test(msg)) return 400;
  if (/PERMISSION_DENIED|403/i.test(msg)) return 403;
  if (/RESOURCE_EXHAUSTED|429/i.test(msg)) return 429;
  if (/NOT_FOUND|404/i.test(msg)) return 502;
  return 500;
}

async function handleScanReceiptApi(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonResponse({ error: "Invalid JSON request body." }, 400);
  }

  const rawBase64 =
    typeof payload["imageBase64"] === "string"
      ? payload["imageBase64"].trim()
      : "";
  const mimeType =
    typeof payload["mimeType"] === "string"
      ? payload["mimeType"].trim().toLowerCase()
      : "image/jpeg";
  const defaultAccount =
    payload["defaultAccount"] === "Studio" ? "Studio" : "Personal";
  const fallbackDate =
    typeof payload["fallbackDate"] === "string"
      ? payload["fallbackDate"]
      : undefined;

  const cleanBase64 = rawBase64.replace(/^data:[^;]+;base64,/i, "");
  if (!cleanBase64 || cleanBase64.length < 32) {
    return jsonResponse(
      { error: "Please upload or capture a clear receipt image." },
      400,
    );
  }
  if (cleanBase64.length > 12_000_000) {
    return jsonResponse(
      { error: "Image is too large. Please upload an image under 8 MB." },
      413,
    );
  }
  if (!ALLOWED_IMAGE_MIMES.has(mimeType)) {
    return jsonResponse(
      { error: "Unsupported image format. Use PNG, JPEG, or WebP." },
      400,
    );
  }

  try {
    const result = await scanReceiptWithGemini({
      imageBase64: cleanBase64,
      mimeType: mimeType === "image/jpg" ? "image/jpeg" : mimeType,
      defaultAccount,
      fallbackDate,
    });
    return jsonResponse({ ok: true, result }, 200);
  } catch (err) {
    console.error("Receipt scan error:", err);
    const status = resolveUpstreamStatus(err);
    const message =
      err instanceof Error && err.message
        ? err.message
        : "Failed to read receipt image.";
    return jsonResponse({ error: message }, status);
  }
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(
  response: Response,
): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(
    consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`),
  );
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as {
      unhandled?: unknown;
      message?: unknown;
    };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

// Hosting compresses every response at the edge. Never compress a body (gzip, brotli,
// CompressionStream) or set content-encoding here or in a server route: the body gets encoded
// twice and renders garbled.
export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);
      if (url.pathname === "/api/scan-receipt") {
        return await handleScanReceiptApi(request);
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
