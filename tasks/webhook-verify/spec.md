# Bounty: Stripe webhook signature verification

Implement a Node.js module `verify.mjs` that validates Stripe webhook signatures.

## Export

```js
export function verifyStripeWebhook(rawBody, signatureHeader, webhookSecret, toleranceSeconds = 300)
```

- `rawBody`: string (exact raw request body)
- `signatureHeader`: value of the `Stripe-Signature` header
- `webhookSecret`: whsec_... secret
- `toleranceSeconds`: max age of the `t` timestamp (default 300)

## Returns

`{ ok: true }` when the signature is valid and the timestamp is within tolerance.

## Throws

`Error` with a clear message when:
- header is missing or malformed
- timestamp is too old or in the future
- signature does not match

Use only Node.js built-in `node:crypto`. No npm dependencies.

## Stripe signature format

Header contains comma-separated parts like `t=1492774577,v1=5257a869e7ecebeda32affa62cdca3fa51af31328d0b63cc73f14b9e87743ece`.
Compute HMAC-SHA256 of `${t}.${rawBody}` with the webhook secret and compare to `v1`.
