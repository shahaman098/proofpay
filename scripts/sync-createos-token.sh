#!/usr/bin/env bash
# Refresh CREATEOS_SANDBOX_ACCESS_TOKEN from `createos login` into .env + Vercel.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OAUTH="${HOME}/.createos/.oauth"
if [[ ! -f "$OAUTH" ]]; then
  echo "Run: createos login" >&2
  exit 1
fi
TOKEN="$(python3 -c "import json; print(json.load(open('${OAUTH}'))['access_token'])")"
python3 - "$ROOT" "$TOKEN" <<'PY'
from pathlib import Path
import sys
root, token = Path(sys.argv[1]), sys.argv[2]
p = root / ".env"
lines = p.read_text().splitlines() if p.exists() else []
out, found = [], False
for line in lines:
    if line.startswith("CREATEOS_SANDBOX_ACCESS_TOKEN="):
        out.append(f"CREATEOS_SANDBOX_ACCESS_TOKEN={token}")
        found = True
    else:
        out.append(line)
if not found:
    out.append(f"CREATEOS_SANDBOX_ACCESS_TOKEN={token}")
p.write_text("\n".join(out) + "\n")
print("Updated .env")
PY
if command -v vercel >/dev/null; then
  printf '%s' "$TOKEN" | vercel env add CREATEOS_SANDBOX_ACCESS_TOKEN production --force >/dev/null
  printf '%s' "$TOKEN" | vercel env add CREATEOS_SANDBOX_ACCESS_TOKEN preview --force >/dev/null
  echo "Updated Vercel env. Redeploy with: vercel --prod --yes"
fi
