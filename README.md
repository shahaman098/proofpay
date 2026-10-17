# ProofPay

**Payment settles only when an egress-locked CreateOS microVM proves the agent’s code works.**

That is the product: Stripe holds the bounty; CreateOS is the condition of capture. No green tests in the sandbox → no money.

| Live | Repo | Code |
|------|------|------|
| [createos-stripe-agents.vercel.app](https://createos-stripe-agents.vercel.app) | [github.com/shahaman098/proofpay](https://github.com/shahaman098/proofpay) | `CreateOS-2026` |

CreateOS × Stripe Projects · Oct 17, 2026 · [Evidence](docs/EVIDENCE.md) · [Submission](docs/SUBMISSION.md)

## Why judges care (30 seconds)

1. **Hold** — Stripe test PaymentIntent, `capture_method: manual` ($100 held).
2. **Isolate** — Agent code runs only in a CreateOS Firecracker microVM with `egress: []`.
3. **Prove trust** — Supply-chain probe tries to exfiltrate → **BLOCKED**.
4. **Agent loop** — Writes `verify.mjs` (webhook signature verification); hidden tests FAIL then PASS.
5. **Settle** — HMAC execution receipt + `paymentIntents.capture`. Fail → cancel.

> Differentiator judges can quote: *“The sandbox is not a side feature — it is the payment condition.”*

## Demo flow

```
Post bounty → Boot sandbox → BLOCKED exfil → Agent FAIL → Agent PASS → Capture
```

Watch it live: open the app → **Post bounty & run agent**. Log should show `BLOCKED` → `FAIL` → `PASS` → Stripe `succeeded`.

Sample captured PI: [`pi_3URfYLAPGo7pmIXl2f9ZDBx4`](https://dashboard.stripe.com/test/payments/pi_3URfYLAPGo7pmIXl2f9ZDBx4)

## Stack

- [CreateOS Sandbox](https://createos.sh/docs/Sandbox) — `@nodeops-createos/sandbox` (`api.sb.createos.sh`, OAuth via `createos login`)
- Stripe test PaymentIntents (manual capture)
- OpenRouter when `OPENROUTER_API_KEY` is set; otherwise staged fail→fix agent (still writes + retries in the sandbox)
- Next.js 15 on Vercel

## Setup

```bash
cp .env.example .env
createos login          # or set CREATEOS_SANDBOX_API_KEY
# Stripe test secret + PROOFPAY_RECEIPT_SECRET (openssl rand -hex 32)
npm install
npm run preflight       # sync CreateOS token, clear orphan sandboxes, smoke auth
npm run dev             # http://localhost:3000
npm run run-bounty      # full CLI loop
```

### Before a live demo / recording

```bash
npm run preflight
npm run sync-createos-token && vercel --prod --yes
curl -sS https://createos-stripe-agents.vercel.app/api/health
```

`GET /api/health` must report `createos: ok` (not `unauthorized`). OAuth tokens expire — preflight refreshes them into `.env` + Vercel.

### Stripe Projects

```bash
stripe plugin install projects
# Claim sandbox eligibility in the Stripe dashboard / projects.dev if needed
stripe switch context <acct> --live   # Projects requires live-mode context
stripe projects init --yes
stripe projects add createos
stripe projects share                 # leaderboard code CreateOS-2026
```

## License

MIT
