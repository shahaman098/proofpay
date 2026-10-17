# Finish now (human-only leftovers)

## Already shipped (agent)

| Item | Status | URL / proof |
|------|--------|-------------|
| Public GitHub | done | https://github.com/shahaman098/proofpay |
| Release | done | https://github.com/shahaman098/proofpay/releases/tag/v0.1.0 |
| Live demo | done | https://createos-stripe-agents.vercel.app |
| Prod bounty API | done | `POST /api/bounty` → `requires_capture` |
| LICENSE + README | done | MIT, live URLs in README |

## You must do (cannot automate)

1. **Stripe Projects claim** — open https://dashboard.stripe.com/login → Google (`amanshah0844@gmail.com`) → then https://projects.stripe.com/new → claim sandbox → in repo run:
   ```bash
   stripe login
   stripe projects init --yes
   stripe projects add createos
   stripe projects share
   ```
   Leaderboard code: `CreateOS-2026`

2. **Demo video** — record UI fail→fix→capture (60–120s), upload YouTube/Loom; paste URL into `docs/SUBMISSION.md`.

3. **Social post** — X/LinkedIn with repo + live + video; tag CreateOS/Stripe.

4. **Discord form** — submit per hackathon Discord instructions with repo, live URL, video, Projects share link.

## Agent follow-up after you claim Projects

Say “projects claimed” — agent will pull env, sync CreateOS token, redeploy, cancel orphan PIs, fill SUBMISSION placeholders.
