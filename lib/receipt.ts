import { createHash, createHmac } from "node:crypto";

export type ReceiptPayload = {
  sandboxId: string;
  egressPolicy: string;
  codeSha256: string;
  exitCode: number;
  testOutputSha256: string;
  capturedAt: string;
};

export function sha256(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

export function buildReceipt(payload: ReceiptPayload, secret: string): string {
  const canonical = JSON.stringify(payload);
  const digest = sha256(canonical);
  const sig = createHmac("sha256", secret).update(digest).digest("hex");
  return `${digest}.${sig}`;
}

export function verifyReceipt(token: string, payload: ReceiptPayload, secret: string): boolean {
  const expected = buildReceipt(payload, secret);
  return token === expected;
}
