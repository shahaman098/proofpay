import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Demo readiness probe — no secrets returned.
 * createos: ok | unauthorized | missing | error
 * stripe: configured | missing
 */
export async function GET() {
  const stripeKey = process.env.STRIPE_SECRET_KEY ?? "";
  // sk_ / rk_ standard secrets; rkcs_ = Stripe restricted keys from Projects/sandboxes
  const hasStripe = /^(sk_|rk_|rkcs_)/.test(stripeKey);
  const accessToken = process.env.CREATEOS_SANDBOX_ACCESS_TOKEN;
  const apiKey = process.env.CREATEOS_SANDBOX_API_KEY;
  const baseUrl = process.env.CREATEOS_SANDBOX_BASE_URL ?? "https://api.sb.createos.sh";

  let createos: "ok" | "unauthorized" | "missing" | "error" = "missing";
  let createosDetail: string | undefined;

  if (accessToken || apiKey) {
    try {
      const headers: Record<string, string> = { Accept: "application/json" };
      if (apiKey) headers["X-Api-Key"] = apiKey;
      else if (accessToken) headers["X-Access-Token"] = accessToken;

      const res = await fetch(`${baseUrl}/v1/sandboxes?limit=1`, {
        headers,
        cache: "no-store",
      });
      if (res.status === 401 || res.status === 403) {
        createos = "unauthorized";
        createosDetail = `HTTP ${res.status}`;
      } else if (res.ok) {
        createos = "ok";
      } else {
        createos = "error";
        createosDetail = `HTTP ${res.status}`;
      }
    } catch (err) {
      createos = "error";
      createosDetail = err instanceof Error ? err.message : String(err);
    }
  }

  const ready = createos === "ok" && hasStripe;
  return NextResponse.json(
    {
      ok: ready,
      createos,
      createosDetail,
      stripe: hasStripe ? "configured" : "missing",
      authMode: apiKey ? "api_key" : accessToken ? "access_token" : "none",
      checkedAt: new Date().toISOString(),
    },
    { status: ready ? 200 : 503 },
  );
}
