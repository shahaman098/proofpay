import { NextResponse } from "next/server";
import { bountyAmountCents, createBounty } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST() {
  try {
    const { paymentIntent, dashboardUrl } = await createBounty(
      "ProofPay: webhook signature verification",
    );
    return NextResponse.json({
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
      amountCents: bountyAmountCents(),
      dashboardUrl,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
