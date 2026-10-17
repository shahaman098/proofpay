#!/usr/bin/env npx tsx
import { loadDotenv } from "../lib/env";
import { formatSse, type RunEvent } from "../lib/events";
import { runProofPayBounty } from "../lib/runner";
import { bountyAmountCents, createBounty } from "../lib/stripe";

loadDotenv();

async function main() {
  const existingPi = process.env.PROOFPAY_PAYMENT_INTENT_ID;
  let paymentIntentId = existingPi;
  let dashboardUrl: string | undefined;

  if (!paymentIntentId) {
    console.log("Creating Stripe bounty (manual capture)…");
    const { paymentIntent, dashboardUrl: url } = await createBounty(
      "ProofPay: webhook signature verification",
    );
    paymentIntentId = paymentIntent.id;
    dashboardUrl = url;
    console.log(`PaymentIntent ${paymentIntentId} (${paymentIntent.status})`);
    console.log(`Dashboard: ${dashboardUrl}`);
    console.log(`Amount: $${(bountyAmountCents() / 100).toFixed(2)} USD (test mode)`);
  }

  const ok = await runProofPayBounty({
    paymentIntentId: paymentIntentId!,
    dashboardUrl,
    onEvent: (event: RunEvent) => {
      process.stdout.write(formatSse(event));
      if (event.type === "log" && event.level !== "info") {
        console.error(`[${event.level}] ${event.message}`);
      }
    },
    streamTests: false,
  });

  process.exit(ok ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
