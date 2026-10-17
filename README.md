# ProofPay

**Pay the agent only when the sandbox proves the code works.**

CreateOS × Stripe Projects hackathon (Oct 17, 2026). A client posts a software bounty; funds are held on a Stripe **test-mode** PaymentIntent with manual capture. An agent writes `verify.mjs` for Stripe webhook signature validation. Code runs only inside a **CreateOS** microVM with **egress locked** (`egress: []`). A supply-chain probe must fail to exfiltrate. When hidden tests pass, ProofPay issues an HMAC execution receipt and **captures** the bounty.

## Live demo

| | |
|--|--|
| **App** | https://createos-stripe-agents.vercel.app |
| **Hackathon code** | `CreateOS-2026` |
| **Evidence** | [docs/EVIDENCE.md](docs/EVIDENCE.md) |

## Stack

- [CreateOS Sandbox](https://createos.sh/docs/Sandbox) — `@nodeops-createos/sandbox` (`api.sb.createos.sh`, OAuth via `createos login` or API key)
- Stripe test PaymentIntents (`capture_method: manual`)
- OpenRouter when `OPENROUTER_API_KEY` is set; otherwise a staged fail→fix agent (still writes + retries in the sandbox)
- Next.js 15 on Vercel

## Demo flow

1. **Post bounty** — manual-capture PaymentIntent (`pm_card_visa`).
2. **Sandbox** — CreateOS VM with empty egress allowlist.
3. **Probe** — `probe.mjs` tries to POST secrets to `attacker.example` → **BLOCKED**.
4. **Agent** — writes `verify.mjs`; hidden tests run; retries up to 4× (attempt 1 omits timestamp tolerance).
5. **Settle** — on pass, HMAC receipt + `paymentIntents.capture`; on fail, cancel.

## Setup

```bash
cp .env.example .env
# createos login   # writes ~/.createos/.oauth (or set CREATEOS_SANDBOX_API_KEY)
# Stripe test key + PROOFPAY_RECEIPT_SECRET (openssl rand -hex 32)
npm install
npm run dev          # http://localhost:3000
npm run run-bounty   # CLI full loop
```

### Stripe Projects

If your account is eligible:

```bash
stripe projects init --yes
stripe projects add createos/project
stripe projects add openrouter/api
stripe projects env --pull
```

Unclaimed CLI sandboxes may return `ACCOUNT_NOT_ELIGIBLE` until you claim at the Stripe dashboard / [projects.dev](https://projects.dev).

## Submission

See [docs/SUBMISSION.md](docs/SUBMISSION.md) — leaderboard code **`CreateOS-2026`**.

## License

MIT
