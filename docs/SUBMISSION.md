# ProofPay submission checklist

**Deadline:** 5:30 PM PT · Hackathon code: **`CreateOS-2026`**

## Links (filled)

| Artifact | URL |
|----------|-----|
| Live app | https://createos-stripe-agents.vercel.app |
| Public repo | https://github.com/shahaman098/proofpay |
| Stripe Dashboard (sample captured PI) | https://dashboard.stripe.com/test/payments/pi_3URdt1APGo7pmIXl0dcTomyz |
| Evidence log | [EVIDENCE.md](./EVIDENCE.md) |

## Required artifacts — your clicks

- [ ] **Demo video (2–3 min)** — you on camera; problem; live agent write + sandbox run; Stripe + CreateOS called out
- [ ] **Build in public** — X tag `@createosai` or LinkedIn tag CreateOS; paste URL below
- [ ] **Stripe Projects leaderboard** — https://projects.dev/leaderboard · code **`CreateOS-2026`**
- [ ] **Discord form** — link from `#announcements` before deadline

### Social post draft (X)

```
Built ProofPay for the @createosai × @stripe hackathon: an agent writes webhook verification code, runs it in a locked-down CreateOS microVM, and we only capture the Stripe bounty when sandbox tests pass.

Live: https://createos-stripe-agents.vercel.app
Repo: https://github.com/shahaman098/proofpay

#CreateOS #StripeProjects CreateOS-2026
```

### Stripe Projects share

```bash
# If ACCOUNT_NOT_ELIGIBLE: claim sandbox / enable Projects at https://projects.dev
# Claim URL (CLI sandbox): open from `stripe config --list` → sandbox_claim_url
stripe projects init --yes
stripe projects add createos/project
stripe whoami
stripe projects share
```

Paste share link + repo + live URL + **`CreateOS-2026`** on the leaderboard.

## Demo video script (≈2:30)

| Time | Beat |
|------|------|
| 0:00 | On camera: “Clients won’t pay AI contractors without proof. ProofPay captures Stripe bounties only after CreateOS proves tests pass.” |
| 0:25 | https://createos-stripe-agents.vercel.app → **Post bounty** → PI `requires_capture` |
| 0:45 | Sandbox log: **BLOCKED** exfil probe |
| 1:00 | Attempt 1 fails → retry → **pass** |
| 1:45 | Receipt + Stripe status `succeeded` |
| 2:10 | Mention CreateOS microVM egress + Stripe Projects / test payments |
| 2:25 | Repo + leaderboard code |

## Verified this session

- Local `npm run run-bounty`: BLOCKED → FAIL → PASS → capture (`pi_3URdriAPGo7pmIXl3byaGf8X`)
- Production `/api/bounty` + `/api/run`: same path (`pi_3URdt1APGo7pmIXl0dcTomyz`)
- Public GitHub: https://github.com/shahaman098/proofpay

## Still blocked until you act

1. Enable/claim Stripe Projects for `stripe projects share` (CLI still reports `ACCOUNT_NOT_ELIGIBLE` on unclaimed sandbox account).
2. Record video + post social + submit form/leaderboard.
3. Optional: set `OPENROUTER_API_KEY` for live LLM codegen (demo currently uses staged fail→fix agent).
