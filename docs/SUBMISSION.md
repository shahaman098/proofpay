# ProofPay submission checklist

**Deadline:** 5:30 PM PT · Hackathon code: `CreateOS-2026`

## Required artifacts

- [ ] **Demo video (2–3 min)** — you on camera; problem; live agent write + sandbox run; Stripe Projects + CreateOS called out
- [ ] **Public GitHub** — this repo; README; no `.env` committed
- [ ] **Build in public** — X tag `@createosai` or LinkedIn tag CreateOS; link in Discord form
- [ ] **Stripe Projects leaderboard** — https://projects.dev/leaderboard
- [ ] **Discord form** — link from `#announcements` before deadline

## Stripe CLI

```bash
stripe whoami
stripe projects share
```

Paste share link, repo URL, deployed URL, and **`CreateOS-2026`**.

## Demo video script (≈2:30)

| Time | Beat |
|------|------|
| 0:00 | You on camera: “Clients won’t pay AI contractors without proof. ProofPay captures Stripe bounties only after CreateOS proves tests pass.” |
| 0:25 | Show UI → **Post bounty** → PaymentIntent `requires_capture` in Stripe Dashboard |
| 0:45 | Sandbox log: **BLOCKED** exfil probe (egress empty) |
| 1:00 | Agent attempt 1 fails (timestamp tolerance) → retry → **pass** |
| 1:45 | Execution receipt on screen → capture → status `succeeded` |
| 2:10 | Mention `stripe projects init`, `createos/project`, EU sandbox API |
| 2:25 | Repo + leaderboard |

## Social post draft (X)

```
Built ProofPay for the @createosai × @stripe hackathon: an agent writes webhook verification code, runs it in a locked-down CreateOS microVM, and we only capture the Stripe bounty when sandbox tests pass.

Stripe Projects + egress proof + manual capture.

Demo: [VIDEO]
Repo: [GITHUB]
#CreateOS #StripeProjects
```

## Environment for recording

```bash
cp .env.example .env
# fill keys
npm run dev
```

Fallback: `npm run run-bounty` in terminal if Vercel timeout is an issue; still submit deployed URL for static UI.
