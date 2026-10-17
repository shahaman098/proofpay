"use client";

import { useCallback, useRef, useState } from "react";
import type { RunEvent } from "@/lib/events";

type LogLine = { level: string; message: string };
type Step = "idle" | "bounty" | "sandbox" | "blocked" | "agent" | "pass" | "paid" | "failed";

const STEPS: { id: Step; label: string }[] = [
  { id: "bounty", label: "1. Hold bounty" },
  { id: "sandbox", label: "2. Boot sandbox" },
  { id: "blocked", label: "3. Block exfil" },
  { id: "agent", label: "4. Agent write/fix" },
  { id: "pass", label: "5. Tests pass" },
  { id: "paid", label: "6. Capture pay" },
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
    if (level === "pass") return "text-emerald-400";
    if (level === "blocked") return "text-amber-400 font-semibold";
    if (level === "fail") return "text-red-400";
    if (level === "error") return "text-red-300";
    return "text-gray-300";
  }

  function stepState(id: Step) {
    const order = STEPS.map((s) => s.id);
    const cur = order.indexOf(step === "failed" ? "agent" : step);
    const mine = order.indexOf(id);
    if (step === "failed" && id === "paid") return "text-gray-600";
    if (step === "paid" && mine <= order.indexOf("paid")) return "text-emerald-400";
    if (mine < cur) return "text-emerald-400";
    if (mine === cur) return "text-[var(--accent)] font-semibold";
    return "text-gray-600";
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
    <main className="mx-auto max-w-7xl p-6">
      <header className="mb-6 border-b border-gray-800 pb-6">
        <p className="text-sm text-[var(--accent)]">CreateOS × Stripe Projects · CreateOS-2026</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-white">ProofPay</h1>
        <p className="mt-2 max-w-2xl text-gray-400">
          Hold a Stripe bounty. Run the agent&apos;s code in a CreateOS microVM with egress locked. Capture
          payment only when tests pass.
        </p>
        <p className="mt-3 max-w-2xl border-l-2 border-[var(--accent)] pl-3 text-sm text-gray-300">
          The sandbox is not a side feature — it is the payment condition.
        </p>
        <ol className="mt-4 flex flex-wrap gap-3 text-xs">
          {STEPS.map((s) => (
            <li key={s.id} className={stepState(s.id)}>
              {s.label}
            </li>
          ))}
        </ol>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-gray-800 bg-[var(--panel)] p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-white">Bounty & settlement</h2>
              <p className="mt-2 text-sm text-gray-400">
                Task: Stripe webhook signature verification — only inside an isolated CreateOS microVM.
              </p>
            </div>
            <span
              className={`shrink-0 rounded px-2 py-1 font-mono text-xs font-semibold tracking-wide ${
                settlementLabel === "CAPTURED"
                  ? "bg-emerald-500/15 text-emerald-400"
                  : settlementLabel === "HELD"
                    ? "bg-amber-500/15 text-amber-300"
                    : settlementLabel === "CANCELLED"
                      ? "bg-red-500/15 text-red-400"
                      : "bg-gray-800 text-gray-500"
              }`}
            >
              {settlementLabel}
            </span>
          </div>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">PaymentIntent</dt>
              <dd className="truncate font-mono text-xs text-gray-200">{paymentIntentId ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Stripe status</dt>
              <dd className="font-mono text-gray-200">{stripeStatus}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Sandbox</dt>
              <dd className="truncate font-mono text-xs text-gray-200">{sandboxId ?? "—"}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-gray-500">Execution receipt (HMAC)</dt>
              <dd className="break-all rounded bg-black/40 p-2 font-mono text-xs text-emerald-400/90">
                {receipt ?? "— issued only after sandbox tests pass —"}
              </dd>
            </div>
          </dl>
          {dashboardUrl && (
            <a
              href={dashboardUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-block text-sm text-[var(--accent)] hover:underline"
            >
              Open in Stripe Dashboard →
            </a>
          )}
          <button
            type="button"
            disabled={running}
            onClick={startBounty}
            className="mt-6 w-full rounded-lg bg-[var(--accent)] px-4 py-3 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {running ? "Agent running…" : "Post bounty & run agent"}
          </button>
          {done !== null && (
            <p
              className={`mt-3 text-center text-sm font-medium ${done ? "text-emerald-400" : "text-red-400"}`}
            >
              {done
                ? "Settled: receipt verified → Stripe capture."
                : "Not settled: tests failed → bounty cancelled."}
            </p>
          )}
          <p className="mt-4 text-xs text-gray-500">
            Repo:{" "}
            <a className="text-[var(--accent)] hover:underline" href="https://github.com/shahaman098/proofpay">
              github.com/shahaman098/proofpay
            </a>
          </p>
        </section>

        <section className="flex flex-col rounded-xl border border-gray-800 bg-black/40 p-5">
          <h2 className="text-lg font-semibold text-white">Sandbox log</h2>
          <p className="text-xs text-gray-500">Watch for BLOCKED → FAIL → PASS → capture</p>
          <pre
            className="mt-3 flex-1 overflow-y-auto rounded-lg bg-gray-950 p-4 font-mono text-xs leading-relaxed"
            style={{ maxHeight: "28rem" }}
          >
            {logs.length === 0 && <span className="text-gray-600">Waiting for run…</span>}
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
    </main>
  );
}
