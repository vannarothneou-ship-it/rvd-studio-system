import { beforeEach, describe, expect, it } from "vitest";
import {
  handleScanReceiptRequest,
  hasValidImageMagicBytes,
  resetScanRateLimiterForTests,
} from "./receipt-scanner";

const VALID_PNG_BASE64 = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49,
  0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06,
  0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4,
]).toString("base64");

function buildScanRequest(
  body: unknown,
  headers: Record<string, string> = {},
  method = "POST",
): Request {
  return new Request("http://localhost:3000/api/scan-receipt", {
    method,
    headers: {
      "content-type": "application/json",
      origin: "http://localhost:3000",
      ...headers,
    },
    ...(method === "POST" ? { body: JSON.stringify(body) } : {}),
  });
}

describe("handleScanReceiptRequest security & validation", () => {
  beforeEach(() => {
    resetScanRateLimiterForTests();
  });

  it("rejects non-POST methods with 405", async () => {
    const res = await handleScanReceiptRequest(buildScanRequest({}, {}, "GET"));
    expect(res.status).toBe(405);
  });

  it("rejects disallowed cross-origin requests with 403 and allows configured APP_URL", async () => {
    const blocked = await handleScanReceiptRequest(
      buildScanRequest(
        { imageBase64: VALID_PNG_BASE64, mimeType: "image/png" },
        { origin: "https://evil.example.com" },
      ),
    );
    expect(blocked.status).toBe(403);

    const allowedByAppUrl = await handleScanReceiptRequest(
      buildScanRequest(
        { imageBase64: VALID_PNG_BASE64, mimeType: "image/png" },
        { origin: "https://studio-app.example.run.app" },
      ),
      { APP_URL: "https://studio-app.example.run.app", GEMINI_API_KEY: "" },
    );
    expect(allowedByAppUrl.status).toBe(503);
  });

  it("enforces SCAN_API_TOKEN when configured on the server", async () => {
    const res = await handleScanReceiptRequest(
      buildScanRequest({
        imageBase64: VALID_PNG_BASE64,
        mimeType: "image/png",
      }),
      { SCAN_API_TOKEN: "secret-token-123" },
    );
    expect(res.status).toBe(401);
  });

  it("rejects non-JSON content types with 415", async () => {
    const req = new Request("http://localhost:3000/api/scan-receipt", {
      method: "POST",
      headers: {
        "content-type": "text/plain",
        origin: "http://localhost:3000",
      },
      body: "hello",
    });
    const res = await handleScanReceiptRequest(req);
    expect(res.status).toBe(415);
  });

  it("validates image magic bytes and rejects spoofed image payloads with 400", async () => {
    const fakePayload = Buffer.from(
      "<html>not-a-real-png-file-content-here</html>",
    ).toString("base64");
    expect(hasValidImageMagicBytes(VALID_PNG_BASE64, "image/png")).toBe(true);
    expect(hasValidImageMagicBytes(fakePayload, "image/png")).toBe(false);

    const res = await handleScanReceiptRequest(
      buildScanRequest({ imageBase64: fakePayload, mimeType: "image/png" }),
    );
    expect(res.status).toBe(400);
  });

  it("rate limits excessive requests from the same client IP with 429 and Retry-After", async () => {
    for (let i = 0; i < 15; i++) {
      const okAttempt = await handleScanReceiptRequest(
        buildScanRequest(
          { imageBase64: VALID_PNG_BASE64, mimeType: "image/png" },
          { "x-forwarded-for": "198.51.100.42" },
        ),
        { GEMINI_API_KEY: "" },
      );
      expect(okAttempt.status).toBe(503);
    }

    const blocked = await handleScanReceiptRequest(
      buildScanRequest(
        { imageBase64: VALID_PNG_BASE64, mimeType: "image/png" },
        { "x-forwarded-for": "198.51.100.42" },
      ),
      { GEMINI_API_KEY: "" },
    );
    expect(blocked.status).toBe(429);
    expect(Number(blocked.headers.get("retry-after"))).toBeGreaterThan(0);
  });

  it("returns sanitized 503 error without leaking env key names when Gemini key is absent", async () => {
    const res = await handleScanReceiptRequest(
      buildScanRequest({
        imageBase64: VALID_PNG_BASE64,
        mimeType: "image/png",
      }),
      { GEMINI_API_KEY: "" },
    );
    expect(res.status).toBe(503);
    const data = (await res.json()) as { error?: string };
    expect(data.error).toBeTruthy();
    expect(data.error).not.toMatch(
      /GEMINI_API_KEY|GOOGLE_GENERATIVE_AI_API_KEY/i,
    );
  });
});
