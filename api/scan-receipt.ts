import { handleScanReceiptRequest } from "../src/lib/receipt-scanner";

export const config = {
  maxDuration: 30,
};

export async function POST(request: Request): Promise<Response> {
  return handleScanReceiptRequest(request, process.env);
}
