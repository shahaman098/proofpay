# ProofPay live run evidence

**Recorded:** 2026-10-17T20:06:05Z (UTC)  
**Command:** `npm run run-bounty` in `/Users/efi/Hackathons/createos-stripe-agents`

| Field | Value |
|-------|--------|
| PaymentIntent | `pi_3URdriAPGo7pmIXl3byaGf8X` |
| Initial status | `requires_capture` |
| Final status | `succeeded` (captured after sandbox pass) |
| Dashboard | https://dashboard.stripe.com/test/payments/pi_3URdriAPGo7pmIXl3byaGf8X |
| Sandbox | `sb-01m559vvxnv1nsewjcmmyt0k6c` |
| Egress probe | **BLOCKED** (exit 2, `EXFIL_BLOCKED fetch failed`) |
| Attempt 1 | **FAIL** (timestamp tolerance omitted) |
| Attempt 2 | **PASS** (full verify + receipt) |
| Receipt token (prefix) | `7774f088d81baadbac58de1fd54ff9b435c93d096db1264cf83e1c6de3e8349e…` |

## Stack used

- CreateOS Sandbox via CLI OAuth (`createos login`) + SDK `X-Access-Token` / `api.sb.createos.sh`
- Stripe test sandbox account `acct_1URX7lAPGo7pmIXl` (manual-capture PaymentIntent)
- Staged agent codegen (OpenRouter key not set; fail-then-fix still demonstrated)

## Production verification (same session)

| Field | Value |
|-------|--------|
| Endpoint | `POST https://createos-stripe-agents.vercel.app/api/run` |
| PaymentIntent | `pi_3URdt1APGo7pmIXl0dcTomyz` → `succeeded` |
| Sandbox | `sb-01m55ar25ngy6kgb0q32pwwabg` |
| Result | BLOCKED → FAIL → PASS → capture |

## Still open

- Stripe Projects `init` → `ACCOUNT_NOT_ELIGIBLE` until account claim / Projects enablement
- Demo video / social / leaderboard / Discord form (operator)
