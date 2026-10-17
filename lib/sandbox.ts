import { CreateosSandboxClient } from "@nodeops-createos/sandbox";
import { existsSync, readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { homedir } from "node:os";

export type SandboxHandle = Awaited<ReturnType<CreateosSandboxClient["createSandbox"]>>;

function loadCreateosAccessToken(): string | undefined {
  if (process.env.CREATEOS_SANDBOX_ACCESS_TOKEN) {
    return process.env.CREATEOS_SANDBOX_ACCESS_TOKEN;
  }
  const oauthPath = path.join(homedir(), ".createos", ".oauth");
  if (!existsSync(oauthPath)) return undefined;
  try {
    const data = JSON.parse(readFileSync(oauthPath, "utf8")) as { access_token?: string };
    return data.access_token;
  } catch {
    return undefined;
  }
}

export function createSandboxClient(): CreateosSandboxClient {
  const baseUrl =
    process.env.CREATEOS_SANDBOX_BASE_URL ?? "https://api.sb.createos.sh";
  const apiKey = process.env.CREATEOS_SANDBOX_API_KEY;
  const accessToken = loadCreateosAccessToken();

  if (apiKey) {
    return new CreateosSandboxClient({ baseUrl, apiKey });
  }
  if (accessToken) {
    // CLI auth uses X-Access-Token (OAuth), not X-Api-Key
    return new CreateosSandboxClient({
      baseUrl,
      authHeaders: { "X-Access-Token": accessToken },
    });
  }
  throw new Error(
    "Set CREATEOS_SANDBOX_API_KEY or CREATEOS_SANDBOX_ACCESS_TOKEN (or run createos login)",
  );
}

export async function bootSandbox(client: CreateosSandboxClient): Promise<SandboxHandle> {
  return client.createSandbox({
    shape: "s-1vcpu-1gb",
    rootfs: "devbox:1",
    egress: [],
  });
}

export async function runSupplyChainProbe(
  sandbox: SandboxHandle,
  probeSource: string,
): Promise<{ blocked: boolean; output: string; exitCode: number }> {
  await sandbox.files.upload("/tmp/probe.mjs", probeSource);
  const { result } = await sandbox.runCommand("node", ["/tmp/probe.mjs"], {
    timeoutMs: 30_000,
  });
  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;
  const exitCode = result.exit_code ?? 1;
  const blocked = exitCode !== 0 || /EXFIL_BLOCKED/i.test(output);
  return { blocked, output, exitCode };
}

export async function uploadAndTestVerify(
  sandbox: SandboxHandle,
  verifyCode: string,
  testSource: string,
): Promise<{ exitCode: number; output: string }> {
  await sandbox.files.upload("/tmp/verify.mjs", verifyCode);
  await sandbox.files.upload("/tmp/verify.test.mjs", testSource);
  const { result } = await sandbox.runCommand(
    "node",
    ["--test", "/tmp/verify.test.mjs"],
    { timeoutMs: 120_000 },
  );
  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;
  return { exitCode: result.exit_code ?? 1, output };
}

export async function streamUploadAndTest(
  sandbox: SandboxHandle,
  verifyCode: string,
  testSource: string,
  onChunk: (stream: "stdout" | "stderr", data: string) => void,
): Promise<{ exitCode: number; output: string }> {
  await sandbox.files.upload("/tmp/verify.mjs", verifyCode);
  await sandbox.files.upload("/tmp/verify.test.mjs", testSource);
  let output = "";
  let exitCode = 1;
  for await (const event of sandbox.streamCommand("node", ["--test", "/tmp/verify.test.mjs"])) {
    if (event.type === "stdout") {
      output += event.data;
      onChunk("stdout", event.data);
    } else if (event.type === "stderr") {
      output += event.data;
      onChunk("stderr", event.data);
    } else if (event.type === "exit") {
      exitCode = event.exitCode;
    } else if (event.type === "error") {
      output += `\n${event.message}\n`;
      onChunk("stderr", `${event.message}\n`);
    }
  }
  return { exitCode, output };
}

export async function loadTaskFiles(taskId: string) {
  const root = path.join(process.cwd(), "tasks", taskId);
  const [spec, probe, tests] = await Promise.all([
    readFile(path.join(root, "spec.md"), "utf8"),
    readFile(path.join(root, "probe.mjs"), "utf8"),
    readFile(path.join(root, "verify.test.mjs"), "utf8"),
  ]);
  return { spec, probe, tests };
}
