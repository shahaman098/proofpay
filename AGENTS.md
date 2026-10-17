# ProofPay — agent notes

## What this is

Hackathon demo: **pay a software bounty only after CreateOS Sandbox proves the code**.

Mandatory stack for eligibility:

1. **Stripe** — test PaymentIntent with `capture_method: manual` (escrow)
2. **CreateOS Sandbox** — locked egress (`egress: []`), probe + `node --test`
3. **Agent loop** — write `verify.mjs`, run in sandbox, fix until pass (max 4)

## Auth

- Prefer `CREATEOS_SANDBOX_API_KEY` from https://createos.sh/app/profile
- Or OAuth: `createos login` then `./scripts/sync-createos-token.sh` (tokens expire ~1h)
- Stripe: `STRIPE_SECRET_KEY` (test)
- Optional LLM: `OPENROUTER_API_KEY` (else staged fail→fix agent)

## Commands

```bash
npm run run-bounty   # CLI full loop
npm run dev          # UI at :3000
./scripts/sync-createos-token.sh && vercel --prod --yes
```

## Submission

Hackathon code: `CreateOS-2026`  
Leaderboard: https://projects.dev/leaderboard  
Checklist: docs/SUBMISSION.md
