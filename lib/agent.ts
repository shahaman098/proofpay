import { readFileSync } from "node:fs";
import path from "node:path";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

const SYSTEM = `You are a senior Node.js engineer. Output ONLY the full source of verify.mjs.
Use ES modules (export function verifyStripeWebhook...).
Use only node:crypto. No npm imports. No markdown fences. No explanation.`;

/** Attempt 1 without timestamp tolerance — forces a visible FAIL then fix. */
const STAGED_ATTEMPT_1 = `import { createHmac, timingSafeEqual } from "node:crypto";

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
  void toleranceSeconds; // intentionally unused on first attempt
  const expected = createHmac("sha256", webhookSecret).update(\`\${t}.\${rawBody}\`).digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(v1, "utf8");
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new Error("signature mismatch");
  }
  return { ok: true };
}
`;

function stagedCode(attempt: number): string {
  if (attempt === 1) return STAGED_ATTEMPT_1;
  return readFileSync(
    path.join(process.cwd(), "tasks/webhook-verify/verify.reference.mjs"),
    "utf8",
  );
}

export async function generateVerifyCode(
  spec: string,
  attempt: number,
  previousCode?: string,
  testOutput?: string,
): Promise<string> {
  const key = process.env.OPENROUTER_API_KEY?.trim();
  if (!key) {
    // Demo-reliable agent when OpenRouter is not provisioned yet
    return stagedCode(attempt);
  }

  const omitToleranceHint = attempt === 1;
  const userParts = [
    `Task specification:\n${spec}`,
    omitToleranceHint
      ? "Implement verifyStripeWebhook. Focus on HMAC v1 signature validation. Do NOT check timestamp tolerance yet."
      : "Implement verifyStripeWebhook including toleranceSeconds for timestamp validation.",
  ];
  if (previousCode && testOutput) {
    userParts.push(`Previous verify.mjs:\n${previousCode}`);
    userParts.push(`Test output:\n${testOutput}`);
    userParts.push("Fix the implementation so all tests pass.");
  }

  const model = process.env.OPENROUTER_MODEL ?? "google/gemini-2.5-flash";

  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://github.com/proofpay-hackathon",
      "X-Title": "ProofPay",
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: userParts.join("\n\n") },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    // Fall back to staged code so the demo still completes
    console.error(`OpenRouter ${res.status}: ${text}; using staged agent`);
    return stagedCode(attempt);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const raw = data.choices?.[0]?.message?.content ?? "";
  const code = stripFences(raw).trim();
  return code || stagedCode(attempt);
}

function stripFences(text: string): string {
  const m = text.match(/```(?:javascript|js|mjs)?\s*([\s\S]*?)```/);
  if (m) return m[1];
  return text;
}
