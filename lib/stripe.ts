import Stripe from "stripe";

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key);
}

export function bountyAmountCents(): number {
  const raw = process.env.PROOFPAY_BOUNTY_CENTS ?? "10000";
  return Number.parseInt(raw, 10);
}

export async function createBounty(description: string) {
  const stripe = getStripe();
  const amount = bountyAmountCents();

  const pi = await stripe.paymentIntents.create({
    amount,
    currency: "usd",
    capture_method: "manual",
    description,
    metadata: { product: "proofpay", task: "webhook-verify" },
    payment_method: "pm_card_visa",
    confirm: true,
    automatic_payment_methods: { enabled: true, allow_redirects: "never" },
  });

  const dashboardUrl = `https://dashboard.stripe.com/test/payments/${pi.id}`;
  return { paymentIntent: pi, dashboardUrl };
}

export async function releaseBounty(
  paymentIntentId: string,
  receiptToken: string,
  sandboxId: string,
) {
  const stripe = getStripe();
  return stripe.paymentIntents.capture(paymentIntentId, {
    metadata: {
      proofpay_receipt: receiptToken,
      proofpay_sandbox_id: sandboxId,
      proofpay_status: "released",
    },
  });
}

export async function cancelBounty(paymentIntentId: string, reason: string) {
  const stripe = getStripe();
  await stripe.paymentIntents.update(paymentIntentId, {
    metadata: { proofpay_status: "cancelled", proofpay_reason: reason.slice(0, 500) },
  });
  return stripe.paymentIntents.cancel(paymentIntentId, {
    cancellation_reason: "abandoned",
  });
}

export async function getPaymentIntent(id: string) {
  const stripe = getStripe();
  return stripe.paymentIntents.retrieve(id);
}
