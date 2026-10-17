# Finish ProofPay — do these in order (≈30–45 min)

Product is live and proven. Remaining items need **you** (browser/login/camera).

## Already done (do not redo)

| Item | Proof |
|------|--------|
| Live app | https://createos-stripe-agents.vercel.app |
| Public repo | https://github.com/shahaman098/proofpay |
| Local e2e | BLOCKED → FAIL → PASS → capture |
| Production e2e | `pi_3URdt1APGo7pmIXl0dcTomyz` succeeded |
| CreateOS login | `createos whoami` → free-plan |
| Vercel env | Stripe + CreateOS access token + receipt secret |

## Critical before demos (token expires ~1h)

CreateOS OAuth tokens expire. Before recording or judging:

```bash
createos login   # if whoami fails
cd ~/Hackathons/createos-stripe-agents
npm run sync-createos-token
vercel --prod --yes
```

Better: open https://createos.sh/app → Profile → create a long-lived **Sandbox API key**, put it in `.env` as `CREATEOS_SANDBOX_API_KEY`, add to Vercel, redeploy.

## 1. Claim Stripe sandbox → enable Projects (required for leaderboard share)

1. Open (expires):  
   https://dashboard.stripe.com/onboard_sandbox/YWNjdF8xVVJYN2xBUEdvN3BtSVhsLDE3OTI4NzIxNzEv10089YV1q3u  
2. Sign in with Google (`amanshah0844@gmail.com` prefilled on claim login).
3. Finish claim / attach to a real Stripe account.
4. Then:

```bash
stripe plugin upgrade projects
cd ~/Hackathons/createos-stripe-agents
stripe projects init --yes
stripe projects add createos/project
stripe projects add openrouter/api   # optional LLM key into .env
stripe projects env --pull
stripe whoami
stripe projects share
```

5. Submit share link at https://projects.dev/leaderboard with code **`CreateOS-2026`**.

## 2. Record demo video (2–3 min, you on camera)

Script: [SUBMISSION.md](./SUBMISSION.md). Use the live site; show BLOCKED → FAIL → PASS → Stripe Dashboard capture.

## 3. Build-in-public post

Use the draft in SUBMISSION.md. Tag `@createosai` (X) or CreateOS (LinkedIn).

## 4. Discord form

Paste when organizers drop the link in `#announcements` (before 5:30 PM PT).

## Optional polish

```bash
# Real LLM instead of staged agent
# Add OPENROUTER_API_KEY to .env + Vercel, redeploy
```
