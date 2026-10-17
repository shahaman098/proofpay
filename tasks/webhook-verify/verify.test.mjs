import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { verifyStripeWebhook } from "./verify.mjs";

const secret = "whsec_test_secret_for_proofpay";
const body = JSON.stringify({ id: "evt_test", type: "payment_intent.succeeded" });

function sign(payload, whsec, t) {
  const signed = createHmac("sha256", whsec).update(`${t}.${payload}`).digest("hex");
  return `t=${t},v1=${signed}`;
}

const now = Math.floor(Date.now() / 1000);

// valid
{
  const header = sign(body, secret, now);
  assert.deepEqual(verifyStripeWebhook(body, header, secret, 300), { ok: true });
}

// tampered body
{
  const header = sign(body, secret, now);
  assert.throws(
    () => verifyStripeWebhook(body + " ", header, secret, 300),
    /signature/i,
  );
}

// expired timestamp
{
  const old = now - 400;
  const header = sign(body, secret, old);
  assert.throws(() => verifyStripeWebhook(body, header, secret, 300), /timestamp|tolerance|old/i);
}

// malformed header
{
  assert.throws(() => verifyStripeWebhook(body, "not-a-stripe-header", secret, 300), /malformed|header/i);
}

console.log("verify.test.mjs: all tests passed");
