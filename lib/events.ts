export type RunEvent =
  | { type: "log"; level: "info" | "warn" | "error" | "pass" | "blocked" | "fail"; message: string }
  | { type: "attempt"; n: number; max: number }
  | { type: "sandbox"; sandboxId: string }
  | { type: "receipt"; token: string; payload: Record<string, unknown> }
  | { type: "stripe"; status: string; paymentIntentId: string; dashboardUrl?: string }
  | { type: "done"; success: boolean };

export function formatSse(event: RunEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}
