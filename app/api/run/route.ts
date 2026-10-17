import { formatSse } from "@/lib/events";
import { runProofPayBounty } from "@/lib/runner";
import { getPaymentIntent } from "@/lib/stripe";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: Request) {
  const body = (await req.json()) as { paymentIntentId?: string; dashboardUrl?: string };
  if (!body.paymentIntentId) {
    return new Response(JSON.stringify({ error: "paymentIntentId required" }), { status: 400 });
  }

  let dashboardUrl = body.dashboardUrl;
  if (!dashboardUrl) {
    try {
      const pi = await getPaymentIntent(body.paymentIntentId);
      dashboardUrl = `https://dashboard.stripe.com/test/payments/${pi.id}`;
    } catch {
      dashboardUrl = undefined;
    }
  }

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const send = (event: Parameters<typeof formatSse>[0]) => {
        controller.enqueue(encoder.encode(formatSse(event)));
      };
      try {
        await runProofPayBounty({
          paymentIntentId: body.paymentIntentId!,
          dashboardUrl,
          onEvent: send,
          streamTests: true,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        send({ type: "log", level: "error", message });
        send({ type: "done", success: false });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
