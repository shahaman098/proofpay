# SUBMIT NOW — ~60 minutes left (deadline 5:30 PM PT)

Do these in order. Do not polish code first.

## 0) Claim Stripe sandbox (5 min) — BLOCKS leaderboard

Stripe Projects needs a **live-mode** account. A claimable sandbox is ready:

**Claim URL (open now):**  
https://dashboard.stripe.com/onboard_sandbox/YWNjdF8xVVJkY0dERXlRWTJCMU50LDE3OTI4ODQ0MTAv100RZrj09BO  

Account: `acct_1URdcGDEyQY2B1Nt` · expires 2026-10-24

1. Sign in with Google (`amanshah0844@gmail.com`) or **Create account**.
2. Finish claim / attach to a live Stripe account.
3. In Terminal:

```bash
export PATH="/opt/homebrew/Cellar/stripe/1.54.0/bin:$PATH"
cd "/Users/efi/Hackathons/createos-stripe-agents"
stripe login
stripe projects init --yes --mode manual
stripe projects add createos
stripe projects share
```

Copy the share link. Say **projects claimed** in chat so the agent can finish wiring.

## 1) Demo video (15 min)

**Screen B-roll already recorded locally:**  
`docs/demo-assets/proofpay-submission-demo.mp4 (~2:04 cut) — still add on-camera face time` (open it, verify BLOCKED→PASS→capture).  
You still must film **yourself on camera** for the first ~20–30s, then cut to this or re-record the live site with camera PiP.



1. Refresh token:

```bash
cd "/Users/efi/Hackathons/createos-stripe-agents"
npm run preflight
npm run sync-createos-token && vercel --prod --yes
curl -sS https://createos-stripe-agents.vercel.app/api/health   # ok:true
```

2. Record 2–3 min **on camera** at https://createos-stripe-agents.vercel.app  
   Beats: pitch → Post bounty → BLOCKED → FAIL → PASS → capture →  
   *“The sandbox is the payment condition.”* → repo + `CreateOS-2026`
3. Upload YouTube/Loom (unlisted OK). Paste URL into chat / SUBMISSION.md.

## 2) Social post (3 min) — copy/paste

```
Built ProofPay for the @createosai × @stripe hackathon: an agent writes webhook verification code, runs it in a locked-down CreateOS microVM, and we only capture the Stripe bounty when sandbox tests pass.

The sandbox is the payment condition.

Live: https://createos-stripe-agents.vercel.app
Repo: https://github.com/shahaman098/proofpay
Video: <PASTE>

#CreateOS #StripeProjects CreateOS-2026
```

Post on X and/or LinkedIn (tag CreateOS).

## 3) Leaderboard (5 min)

1. https://projects.dev/leaderboard → **Submit Your Project**
2. Paste: share link · repo · live URL · video
3. Hackathon code (exact): `CreateOS-2026`

## 4) Discord form (5 min)

Event Discord: https://discord.gg/nodeops


Submit the same four links + code in the event Discord form.

---

## Already done (do not redo)

| Item | URL |
|------|-----|
| Live | https://createos-stripe-agents.vercel.app |
| Repo | https://github.com/shahaman098/proofpay |
| Health | https://createos-stripe-agents.vercel.app/api/health |
| Evidence PI | https://dashboard.stripe.com/test/payments/pi_3URfYLAPGo7pmIXl2f9ZDBx4 |

## Discord / form answer bank

- **Project name:** ProofPay  
- **One-liner:** Hold a Stripe bounty; capture only when CreateOS sandbox tests pass.  
- **Differentiator:** Egress-locked microVM is the payment condition.  
- **Stack:** CreateOS Sandbox + Stripe manual-capture PaymentIntent + Next.js/Vercel  
- **Hackathon code:** CreateOS-2026  
