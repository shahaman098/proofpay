import { createHmac, timingSafeEqual } from "node:crypto";

export function verifyStripeWebhook(rawBody, signatureHeader, webhookSecret, toleranceSeconds = 300) {
  if (!signatureHeader || typeof signatureHeader !== "string") {
    throw new Error("malformed Stripe-Signature header");
  }
  const parts = signatureHeader.split(",").map((p) => p.trim());
  let t;
  let v1;
  for (const part of parts) {
    const [k, v] = part.split("=");
    if (k === "t") t = v;
    if (k === "v1") v1 = v;
  }
  if (!t || !v1) throw new Error("malformed Stripe-Signature header");
  const ts = Number.parseInt(t, 10);
  if (!Number.isFinite(ts)) throw new Error("malformed timestamp in header");
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - ts) > toleranceSeconds) {
    throw new Error("timestamp outside tolerance");
  }
  const expected = createHmac("sha256", webhookSecret).update(`${t}.${rawBody}`).digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(v1, "utf8");
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new Error("signature mismatch");
  }
  return { ok: true };
}
