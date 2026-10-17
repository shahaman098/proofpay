"use client";

import { useCallback, useRef, useState } from "react";
import type { RunEvent } from "@/lib/events";

type LogLine = { level: string; message: string };
type Step = "idle" | "bounty" | "sandbox" | "blocked" | "agent" | "pass" | "paid" | "failed";

const STEPS: { id: Step; label: string }[] = [
  { id: "bounty", label: "Hold bounty" },
  { id: "sandbox", label: "Boot sandbox" },
  { id: "blocked", label: "Block exfil" },
  { id: "agent", label: "Agent write/fix" },
  { id: "pass", label: "Tests pass" },
  { id: "paid", label: "Capture pay" },
];

export default function Home() {
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [dashboardUrl, setDashboardUrl] = useState<string | null>(null);
  const [stripeStatus, setStripeStatus] = useState<string>("idle");
  const [sandboxId, setSandboxId] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState<boolean | null>(null);
  const [step, setStep] = useState<Step>("idle");
  const logEnd = useRef<HTMLDivElement>(null);

  const pushLog = useCallback((level: string, message: string) => {
    setLogs((prev) => [...prev, { level, message }]);
    setTimeout(() => logEnd.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }, []);

  const handleEvent = useCallback(
    (event: RunEvent) => {
      switch (event.type) {
        case "log":
          pushLog(event.level, event.message);
          if (event.level === "blocked") setStep("blocked");
          if (event.level === "fail") setStep("agent");
          if (event.level === "pass") setStep("pass");
          break;
        case "sandbox":
          setSandboxId(event.sandboxId);
          setStep("sandbox");
          break;
        case "stripe":
          setStripeStatus(event.status);
          if (event.dashboardUrl) setDashboardUrl(event.dashboardUrl);
          if (event.status === "requires_capture") setStep("bounty");
          if (event.status === "succeeded") setStep("paid");
          break;
        case "receipt":
          setReceipt(event.token);
          break;
        case "done":
          setDone(event.success);
          setRunning(false);
          if (!event.success) setStep("failed");
          break;
        case "attempt":
          setStep("agent");
          pushLog("info", `—— Attempt ${event.n}/${event.max} ——`);
          break;
        default:
          break;
      }
    },
    [pushLog],
  );

  async function startBounty() {
    setLogs([]);
    setDone(null);
    setReceipt(null);
    setSandboxId(null);
    setStep("bounty");
    setRunning(true);
    try {
      const res = await fetch("/api/bounty", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "bounty failed");
      setPaymentIntentId(data.paymentIntentId);
      setDashboardUrl(data.dashboardUrl);
      setStripeStatus(data.status);
      pushLog(
        "info",
        `Bounty authorised: ${data.paymentIntentId} ($${(data.amountCents / 100).toFixed(2)} held)`,
      );

      const runRes = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentIntentId: data.paymentIntentId,
          dashboardUrl: data.dashboardUrl,
        }),
      });
      if (!runRes.ok || !runRes.body) throw new Error("run failed");

      const reader = runRes.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done: streamDone, value } = await reader.read();
        if (streamDone) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";
        for (const part of parts) {
          const line = part.split("\n").find((l) => l.startsWith("data: "));
          if (!line) continue;
          try {
            handleEvent(JSON.parse(line.slice(6)) as RunEvent);
          } catch {
            /* ignore */
          }
        }
      }
    } catch (err) {
      pushLog("error", err instanceof Error ? err.message : String(err));
      setRunning(false);
      setStep("failed");
    }
  }

  function levelClass(level: string) {
    if (level === "pass") return "text-[#7dcea0]";
    if (level === "blocked") return "text-[var(--ember)] font-semibold";
    if (level === "fail") return "text-[#ff8a80]";
    if (level === "error") return "text-[#ff8a80]";
    return "text-[#c5ddd6]";
  }

  function stepClass(id: Step) {
    const order = STEPS.map((s) => s.id);
    const cur = order.indexOf(step === "failed" ? "agent" : step);
    const mine = order.indexOf(id);
    if (step === "paid" && mine <= order.indexOf("paid")) return "step-pill done";
    if (mine < cur) return "step-pill done";
    if (mine === cur) return "step-pill active";
    return "step-pill";
  }

  const settlementLabel =
    done === true
      ? "CAPTURED"
      : done === false
        ? "CANCELLED"
        : stripeStatus === "requires_capture"
          ? "HELD"
          : stripeStatus === "succeeded"
            ? "CAPTURED"
            : "IDLE";

  return (
    <main className="relative min-h-screen overflow-x-hidden px-4 pb-16 pt-6 sm:px-8">
      {/* soft paper grain */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative mx-auto max-w-6xl">
        <nav className="nav-pill rise mx-auto flex max-w-3xl items-center justify-between gap-4 px-5 py-3">
          <span className="font-display text-2xl tracking-tight text-[var(--ink)]">ProofPay</span>
          <div className="flex items-center gap-4 text-sm font-medium text-[var(--ink-soft)]">
            <a
              className="rounded-full border-2 border-transparent px-2 py-1 hover:border-[var(--ink)]"
              href="https://github.com/shahaman098/proofpay"
              target="_blank"
              rel="noreferrer"
            >
              Repo
            </a>
            <a
              className="rounded-full border-2 border-transparent px-2 py-1 hover:border-[var(--ink)]"
              href="/demo/proofpay-submission-demo.mp4"
              target="_blank"
              rel="noreferrer"
            >
              Demo
            </a>
            <span className="hidden rounded-full bg-[var(--forest)] px-3 py-1 text-xs font-semibold text-[var(--cream)] sm:inline">
              CreateOS-2026
            </span>
          </div>
        </nav>

        <header className="rise rise-delay-1 mx-auto mt-14 max-w-3xl text-center">
          <p className="text-sm font-medium tracking-wide text-[var(--fog)]">
            CreateOS × Stripe Projects
          </p>
          <h1 className="font-display mt-3 text-[clamp(3.25rem,9vw,5.75rem)] leading-[0.92] tracking-[-0.04em] text-[var(--ink)]">
            Pay when the
            <br />
            <span className="text-[var(--fog)]">sandbox proves it</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-[var(--ink-soft)]">
            Hold a Stripe bounty. Run the agent inside an egress-locked CreateOS microVM. Capture only
            when tests pass.
          </p>
          <p className="mx-auto mt-4 max-w-lg text-base font-medium text-[var(--forest)]">
            The sandbox is not a side feature — it is the payment condition.
          </p>
        </header>

        <ol className="rise rise-delay-2 mx-auto mt-10 flex max-w-4xl flex-wrap items-center justify-center gap-2">
          {STEPS.map((s, i) => (
            <li key={s.id} className="flex items-center gap-2">
              <span className={stepClass(s.id)}>
                {i + 1}. {s.label}
              </span>
            </li>
          ))}
        </ol>

        <div className="rise rise-delay-3 mt-12 grid gap-6 lg:grid-cols-2">
          <section className="chamber bg-[var(--cream)] p-7 sm:p-8">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-3xl tracking-tight text-[var(--ink)]">
                  Bounty & settlement
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[var(--ink-soft)]">
                  Task: Stripe webhook signature verification — only inside an isolated CreateOS
                  microVM.
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full border-2 border-[var(--ink)] px-3 py-1 font-mono text-xs font-bold tracking-wide ${
                  settlementLabel === "CAPTURED"
                    ? "bg-[var(--forest)] text-[var(--cream)]"
                    : settlementLabel === "HELD"
                      ? "bg-[var(--ember)] text-[var(--ink)]"
                      : settlementLabel === "CANCELLED"
                        ? "bg-[#ffd6d6] text-[var(--fail)]"
                        : "bg-transparent text-[var(--fog)]"
                }`}
              >
                {settlementLabel}
              </span>
            </div>

            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between gap-4 border-b border-[var(--ink)]/15 pb-2">
                <dt className="text-[var(--fog)]">PaymentIntent</dt>
                <dd className="truncate font-mono text-xs text-[var(--ink)]">
                  {paymentIntentId ?? "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-[var(--ink)]/15 pb-2">
                <dt className="text-[var(--fog)]">Stripe status</dt>
                <dd className="font-mono text-[var(--ink)]">{stripeStatus}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-[var(--ink)]/15 pb-2">
                <dt className="text-[var(--fog)]">Sandbox</dt>
                <dd className="truncate font-mono text-xs text-[var(--ink)]">{sandboxId ?? "—"}</dd>
              </div>
              <div className="flex flex-col gap-2 pt-1">
                <dt className="text-[var(--fog)]">Execution receipt (HMAC)</dt>
                <dd className="break-all rounded-[16px] border-2 border-[var(--ink)] bg-[var(--lilac)]/40 p-3 font-mono text-xs text-[var(--forest)]">
                  {receipt ?? "— issued only after sandbox tests pass —"}
                </dd>
              </div>
            </dl>

            {dashboardUrl && (
              <a
                href={dashboardUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-block text-sm font-semibold text-[var(--forest)] underline decoration-2 underline-offset-4"
              >
                Open in Stripe Dashboard →
              </a>
            )}

            <button
              type="button"
              disabled={running}
              onClick={startBounty}
              className="btn-primary mt-7 w-full px-4 text-base"
            >
              {running ? "Agent running…" : "Post bounty & run agent"}
            </button>

            {done !== null && (
              <p
                className={`mt-4 text-center text-sm font-semibold ${
                  done ? "text-[var(--forest)]" : "text-[var(--fail)]"
                }`}
              >
                {done
                  ? "Settled: receipt verified → Stripe capture."
                  : "Not settled: tests failed → bounty cancelled."}
              </p>
            )}
          </section>

          <section className="chamber-dark flex flex-col p-7 sm:p-8">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-display text-3xl tracking-tight text-[var(--cream)]">Sandbox log</h2>
              <span className="rounded-full bg-[var(--ember)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--ink)]">
                live
              </span>
            </div>
            <p className="mt-1 text-xs text-[var(--cream)]/70">
              Watch for BLOCKED → FAIL → PASS → capture
            </p>
            <pre
              className="log-panel mt-4 flex-1 overflow-y-auto p-4 font-mono text-xs leading-relaxed"
              style={{ maxHeight: "28rem", minHeight: "16rem" }}
            >
              {logs.length === 0 && (
                <span className="text-[#6a9088]">Waiting for run…</span>
              )}
              {logs.map((line, i) => (
                <div key={i} className={levelClass(line.level)}>
                  {line.level !== "info" ? `[${line.level.toUpperCase()}] ` : ""}
                  {line.message}
                </div>
              ))}
              <div ref={logEnd} />
            </pre>
          </section>
        </div>

        <footer className="chamber-dark mx-auto mt-10 max-w-3xl px-6 py-5 text-center">
          <p className="font-display text-2xl text-[var(--cream)]">
            Egress-locked microVM = payment condition
          </p>
          <p className="mt-2 text-sm text-[var(--cream)]/75">
            Repo{" "}
            <a
              className="font-semibold text-[var(--lilac)] underline decoration-2 underline-offset-4"
              href="https://github.com/shahaman098/proofpay"
            >
              github.com/shahaman098/proofpay
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}
