# ProofPay submission checklist

**Deadline:** 5:30 PM PT · Hackathon code: **`CreateOS-2026`**  
**Operator finish guide:** [FINISH_NOW.md](./FINISH_NOW.md)

## Links

| Artifact | URL |
|----------|-----|
| Live app | https://createos-stripe-agents.vercel.app |
| Public repo | https://github.com/shahaman098/proofpay |
| Sample captured PI | https://dashboard.stripe.com/test/payments/pi_3URfYLAPGo7pmIXl2f9ZDBx4 |
| Health | https://createos-stripe-agents.vercel.app/api/health |
| Evidence | [EVIDENCE.md](./EVIDENCE.md) |
| Leaderboard | https://projects.dev/leaderboard |

## Checklist

- [x] Public GitHub + README
- [x] Deployed URL (full bounty works on prod)
- [x] CreateOS Sandbox + Stripe manual capture demo path
- [ ] Stripe Projects claim → `stripe projects share`
- [ ] Demo video 2–3 min (on camera)
- [ ] X/LinkedIn post tagging CreateOS
- [ ] Leaderboard submit + Discord form with **`CreateOS-2026`**

## Social draft (X)

```
Built ProofPay for the @createosai × @stripe hackathon: an agent writes webhook verification code, runs it in a locked-down CreateOS microVM, and we only capture the Stripe bounty when sandbox tests pass.

Live: https://createos-stripe-agents.vercel.app
Repo: https://github.com/shahaman098/proofpay

#CreateOS #StripeProjects CreateOS-2026
```

## Demo video script (≈2:30)

| Time | Beat |
|------|------|
| 0:00 | On camera: ProofPay pitch |
| 0:25 | Live site → Post bounty → `requires_capture` |
| 0:45 | Log: **BLOCKED** exfil |
| 1:00 | Attempt 1 **FAIL** → retry **PASS** |
| 1:45 | Receipt + Stripe `succeeded` |
| 2:10 | Call out CreateOS egress + Stripe hold/capture |
| 2:25 | Repo + code `CreateOS-2026` |

## Pre-record token refresh

```bash
createos login   # if needed
npm run sync-createos-token && vercel --prod --yes
```
