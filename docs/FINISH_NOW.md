# Finish now (win the hackathon)

## Already shipped

| Item | Status | Proof |
|------|--------|-------|
| Public GitHub | done | https://github.com/shahaman098/proofpay |
| Release | done | https://github.com/shahaman098/proofpay/releases/tag/v0.1.0 |
| Live demo | done | https://createos-stripe-agents.vercel.app |
| Prod bounty path | done | BLOCKED → FAIL → PASS → capture |
| Health + preflight | done | `GET /api/health` · `npm run preflight` |
| Pitch | done | README + UI: sandbox = payment condition |

## Before you record / submit (2 min)

```bash
cd /Users/efi/Hackathons/createos-stripe-agents
npm run preflight
npm run sync-createos-token && vercel --prod --yes
curl -sS https://createos-stripe-agents.vercel.app/api/health   # must be createos: ok
```

## You must do (blocks submission)

### 1. Stripe Projects (mandatory)

**Open this claim URL first:**
https://dashboard.stripe.com/onboard_sandbox/YWNjdF8xVVJkY0dERXlRWTJCMU50LDE3OTI4ODQ0MTAv100RZrj09BO

(`acct_1URdcGDEyQY2B1Nt` — then `stripe login` + `projects init/add/share`)

CLI signed into `acct_1Tw3ZQGBTcMRYMsX` (Boto AI) but **has no live-mode access**. Projects needs live context.

1. Open https://projects.stripe.com/new (or https://projects.dev/hackathon-participants) while logged into a Stripe account that can claim the hackathon sandbox.
2. Complete claim / eligibility.
3. Then:

```bash
export PATH="/opt/homebrew/Cellar/stripe/1.54.0/bin:$PATH"
stripe switch context <your_acct> --live
stripe projects init --yes
stripe projects add createos
stripe projects share
```

Leaderboard code: **`CreateOS-2026`** → https://projects.dev/leaderboard

### 2. Demo video (2–3 min, on camera)

Script in [SUBMISSION.md](./SUBMISSION.md). Beat list: pitch → hold → BLOCKED → FAIL → PASS → capture → quote differentiator → repo + code.

### 3. Social

Draft in SUBMISSION.md — post on X/LinkedIn tagging CreateOS.

### 4. Discord form

Submit live URL, repo, video, Projects share link, code `CreateOS-2026`.

## After Projects claimed

Say **projects claimed** — agent will pull env, re-verify share, fill remaining SUBMISSION checkboxes.
