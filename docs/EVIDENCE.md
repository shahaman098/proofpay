# ProofPay live run evidence

## Latest local capture (token refresh session)

**Recorded:** 2026-10-17T21:54:11Z (UTC)  
**Command:** `npm run run-bounty`

| Field | Value |
|-------|--------|
| PaymentIntent | `pi_3URfYLAPGo7pmIXl2f9ZDBx4` |
| Initial status | `requires_capture` |
| Final status | `succeeded` (captured after sandbox pass) |
| Dashboard | https://dashboard.stripe.com/test/payments/pi_3URfYLAPGo7pmIXl2f9ZDBx4 |
| Sandbox | `sb-01m55xcasvkv46r5q8ez08vdkq` |
| Egress probe | **BLOCKED** (exit 2, `EXFIL_BLOCKED fetch failed`) |
| Attempt 1 | **FAIL** (timestamp tolerance omitted) |
| Attempt 2 | **PASS** (full verify + receipt) |
| Receipt prefix | `196e094549a192c200a9d39b2de98c9f…` |

## Production verification (same session)

| Field | Value |
|-------|--------|
| Endpoint | `POST https://createos-stripe-agents.vercel.app/api/run` |
| PaymentIntent | `pi_3URfYaAPGo7pmIXl0jQMMJ3Y` |
| Sandbox | `sb-01m55vaa7t6mwnz0xe0gar8nbe` |
| Result | BLOCKED → FAIL → PASS → receipt → capture path |
| Health | `GET /api/health` → `createos: ok` after token sync |

## Stack used

- CreateOS Sandbox via CLI OAuth (`createos login`) + SDK `X-Access-Token` / `api.sb.createos.sh`
- Stripe test keys (manual-capture PaymentIntent)
- Staged agent codegen when OpenRouter unset (fail-then-fix still demonstrated in sandbox)

## Demo ops

```bash
npm run preflight
npm run sync-createos-token && vercel --prod --yes
curl -sS https://createos-stripe-agents.vercel.app/api/health
```

## Still open (operator)

- Stripe Projects claim → live-mode context → `stripe projects share`
- Demo video / social / leaderboard / Discord form with `CreateOS-2026`
