import { generateVerifyCode } from "./agent";
import { buildReceipt, sha256 } from "./receipt";
import { cancelBounty, releaseBounty } from "./stripe";
import {
  bootSandbox,
  createSandboxClient,
  loadTaskFiles,
  runSupplyChainProbe,
  streamUploadAndTest,
} from "./sandbox";
import type { RunEvent } from "./events";

const MAX_ATTEMPTS = 4;
const TASK_ID = "webhook-verify";

export type RunOptions = {
  paymentIntentId: string;
  dashboardUrl?: string;
  onEvent: (event: RunEvent) => void;
  streamTests?: boolean;
};

export async function runProofPayBounty(options: RunOptions): Promise<boolean> {
  const { paymentIntentId, onEvent, streamTests = true } = options;
  const receiptSecret = process.env.PROOFPAY_RECEIPT_SECRET;
  if (!receiptSecret) throw new Error("PROOFPAY_RECEIPT_SECRET is not set");

  onEvent({
    type: "stripe",
    status: "requires_capture",
    paymentIntentId,
    dashboardUrl: options.dashboardUrl,
  });
  const agentMode = process.env.OPENROUTER_API_KEY?.trim()
    ? "openrouter"
    : "staged-fail-then-fix";
  onEvent({
    type: "log",
    level: "info",
    message: `Agent mode: ${agentMode}`,
  });
  onEvent({ type: "log", level: "info", message: "Booting CreateOS sandbox (egress locked)…" });

  const client = createSandboxClient();
  const { spec, probe, tests } = await loadTaskFiles(TASK_ID);
  const sandbox = await bootSandbox(client);
  const sandboxId = sandbox.id;
  onEvent({ type: "sandbox", sandboxId });

  try {
    onEvent({ type: "log", level: "info", message: "Running supply-chain exfil probe…" });
    const probeResult = await runSupplyChainProbe(sandbox, probe);
    if (probeResult.blocked) {
      onEvent({
        type: "log",
        level: "blocked",
        message: `Egress blocked exfil attempt (exit ${probeResult.exitCode}). ${probeResult.output.trim()}`,
      });
    } else {
      onEvent({
        type: "log",
        level: "warn",
        message: `Probe did not appear blocked (exit ${probeResult.exitCode}). ${probeResult.output.trim()}`,
      });
    }

    let lastCode = "";
    let lastOutput = "";

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      onEvent({ type: "attempt", n: attempt, max: MAX_ATTEMPTS });
      onEvent({ type: "log", level: "info", message: `Agent generating verify.mjs (attempt ${attempt})…` });

      const code = await generateVerifyCode(
        spec,
        attempt,
        attempt > 1 ? lastCode : undefined,
        attempt > 1 ? lastOutput : undefined,
      );
      lastCode = code;

      onEvent({ type: "log", level: "info", message: "Uploading code and running hidden tests in sandbox…" });

      const testResult = streamTests
        ? await streamUploadAndTest(sandbox, code, tests, (stream, data) => {
            onEvent({
              type: "log",
              level: stream === "stderr" ? "info" : "info",
              message: data,
            });
          })
        : await (async () => {
            const { uploadAndTestVerify } = await import("./sandbox");
            return uploadAndTestVerify(sandbox, code, tests);
          })();

      lastOutput = testResult.output;

      if (testResult.exitCode === 0) {
        onEvent({ type: "log", level: "pass", message: "All sandbox tests passed." });
        const payload = {
          sandboxId,
          egressPolicy: "[]",
          codeSha256: sha256(code),
          exitCode: 0,
          testOutputSha256: sha256(testResult.output),
          capturedAt: new Date().toISOString(),
        };
        const token = buildReceipt(payload, receiptSecret);
        onEvent({ type: "receipt", token, payload });

        const captured = await releaseBounty(paymentIntentId, token, sandboxId);
        onEvent({
          type: "stripe",
          status: captured.status,
          paymentIntentId,
          dashboardUrl: options.dashboardUrl,
        });
        onEvent({ type: "done", success: true });
        return true;
      }

      onEvent({
        type: "log",
        level: "fail",
        message: `Tests failed (exit ${testResult.exitCode}). Agent will retry.`,
      });
    }

    await cancelBounty(paymentIntentId, "max_attempts_exceeded");
    onEvent({
      type: "stripe",
      status: "canceled",
      paymentIntentId,
      dashboardUrl: options.dashboardUrl,
    });
    onEvent({ type: "done", success: false });
    return false;
  } finally {
    onEvent({ type: "log", level: "info", message: "Destroying sandbox…" });
    await sandbox.destroy();
  }
}
