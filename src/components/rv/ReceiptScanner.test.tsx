import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ReceiptScannerDrawer } from "./ReceiptScanner";
import { getDB, resetDB, setDB } from "@/lib/store";

const mockScanLocally = vi.fn();

vi.mock("@/lib/local-receipt-ai", async () => {
  const actual = await vi.importActual<typeof import("@/lib/local-receipt-ai")>(
    "@/lib/local-receipt-ai",
  );
  return {
    ...actual,
    warmUpReceiptOcr: vi.fn(),
    prepareReceiptUploadPayload: vi.fn(async () => ({
      imageBase64: "AAAA",
      mimeType: "image/png",
      previewDataUrl: "data:image/png;base64,AAAA",
      thumbDataUrl: "data:image/png;base64,AAAA",
    })),
    scanReceiptLocally: (...args: unknown[]) => mockScanLocally(...args),
  };
});

function uploadMockReceiptFile() {
  const inputs = document.querySelectorAll('input[type="file"]');
  const uploadInput = inputs[1] as HTMLInputElement;
  const file = new File(["fake-img"], "receipt.png", { type: "image/png" });
  fireEvent.change(uploadInput, { target: { files: [file] } });
}

describe("ReceiptScannerDrawer Phase 1 confirmation & routing workflows", () => {
  beforeEach(() => {
    resetDB();
    vi.clearAllMocks();
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(JSON.stringify({ error: "offline" }), { status: 503 }),
      ),
    );
  });

  it("never auto-saves a scanned receipt until the user explicitly clicks Confirm & Save", async () => {
    mockScanLocally.mockResolvedValue({
      rawText: "Brown Coffee\nTotal: $4.50",
      previewDataUrl: "data:image/png;base64,AAAA",
      thumbDataUrl: "data:image/png;base64,AAAA",
      detectedAngleDeg: 0,
      engineLang: "eng",
      passes: 1,
      ocrConfidence: 91,
      result: {
        txType: "expense",
        account: "Personal",
        amount: 4.5,
        currency: "USD",
        date: "2026-11-22",
        merchantOrPayer: "Brown Coffee",
        description: "Iced Latte",
        method: "Debit",
        category: "Food",
        reference: "POS-11",
        confidence: "high",
        notes: "",
        engine: "local-ocr",
      },
    });

    const beforeCount = getDB().expenses.length;
    render(
      <ReceiptScannerDrawer
        open
        defaultAccount="Personal"
        onClose={() => {}}
      />,
    );

    uploadMockReceiptFile();

    const confirmBtn = await screen.findByRole("button", {
      name: /Confirm & Save/i,
    });
    expect(confirmBtn).toBeEnabled();
    // Critical guarantee: database has NOT changed prior to explicit confirmation
    expect(getDB().expenses.length).toBe(beforeCount);

    fireEvent.click(confirmBtn);
    await waitFor(() => {
      expect(getDB().expenses.length).toBe(beforeCount + 1);
    });
    const newest = getDB().expenses[getDB().expenses.length - 1]!;
    expect(newest.account).toBe("Personal");
    expect(newest.amount).toBe(4.5);
  });

  it("blocks saving when amount is ambiguous until verified or corrected by the user", async () => {
    mockScanLocally.mockResolvedValue({
      rawText: "Total: $12.",
      previewDataUrl: "data:image/png;base64,AAAA",
      thumbDataUrl: "data:image/png;base64,AAAA",
      detectedAngleDeg: 0,
      engineLang: "eng",
      passes: 1,
      ocrConfidence: 55,
      result: {
        txType: "expense",
        account: "Studio",
        amount: 12,
        currency: "USD",
        date: "2026-11-22",
        merchantOrPayer: "Adobe",
        description: "Partial digits detected",
        method: "Debit",
        category: "Software and subscriptions",
        reference: "",
        confidence: "low",
        notes: "",
        ambiguous: true,
        ambiguityReason: "Total digits look cut off.",
        engine: "local-ocr",
      },
    });

    const beforeCount = getDB().expenses.length;
    render(
      <ReceiptScannerDrawer open defaultAccount="Studio" onClose={() => {}} />,
    );

    uploadMockReceiptFile();

    const confirmBtn = await screen.findByRole("button", {
      name: /Confirm & Save/i,
    });
    expect(confirmBtn).toBeDisabled();
    expect(
      screen.getByText(/Manual verification required/i),
    ).toBeInTheDocument();

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);
    expect(confirmBtn).toBeEnabled();

    fireEvent.click(confirmBtn);
    await waitFor(() => {
      expect(getDB().expenses.length).toBe(beforeCount + 1);
    });
    expect(getDB().expenses[getDB().expenses.length - 1]!.account).toBe(
      "Studio",
    );
  });

  it("routes Studio incoming payments to Unmatched Studio Income or Matched Invoice, never Personal Income", async () => {
    const dbNow = getDB();
    setDB(() => ({
      ...dbNow,
      personalIncome: [],
      studioIncome: [],
      invoices: [
        {
          id: "inv-match-1",
          no: "RVIN-MATCH-01",
          clientId: dbNow.clients[0]?.id ?? "c1",
          projectId: "",
          issue: "2026-11-01",
          due: "2026-11-30",
          currency: "USD",
          exchangeRate: 4100,
          discount: 0,
          sent: true,
          showSchedule: false,
          includeTerms: false,
          includeRates: false,
          notes: "",
          items: [
            {
              id: "item-1",
              description: "Design",
              scope: "",
              timeline: "",
              qty: 1,
              price: 500,
            },
          ],
          images: [],
          kind: "Invoice",
        },
      ],
    }));

    mockScanLocally.mockResolvedValue({
      rawText: "Transfer Received +$300.00",
      previewDataUrl: "data:image/png;base64,AAAA",
      thumbDataUrl: "data:image/png;base64,AAAA",
      detectedAngleDeg: 0,
      engineLang: "eng",
      passes: 1,
      ocrConfidence: 92,
      result: {
        txType: "income",
        account: "Studio",
        amount: 300,
        currency: "USD",
        date: "2026-11-22",
        merchantOrPayer: "Connexion Client",
        description: "Design deposit",
        method: "Debit",
        category: "Client Payment",
        reference: "ABA-555",
        confidence: "high",
        notes: "",
        engine: "gemini",
      },
    });

    const paymentsBefore = getDB().payments.length;
    render(
      <ReceiptScannerDrawer open defaultAccount="Studio" onClose={() => {}} />,
    );

    uploadMockReceiptFile();

    const unmatchedBtn = await screen.findByRole("button", {
      name: /Unmatched Studio Income/i,
    });
    fireEvent.click(unmatchedBtn);

    const confirmBtn = screen.getByRole("button", { name: /Confirm & Save/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(getDB().studioIncome ?? []).toHaveLength(1);
    });
    expect(getDB().personalIncome ?? []).toHaveLength(0);
    expect(getDB().payments.length).toBe(paymentsBefore);
  });
});
