#!/usr/bin/env bash
# Demo readiness: refresh CreateOS token, destroy orphan sandboxes, smoke auth.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Sync CreateOS OAuth → .env (+ Vercel if available)"
bash "$ROOT/scripts/sync-createos-token.sh"

TOKEN="$(python3 -c "import json; print(json.load(open('${HOME}/.createos/.oauth'))['access_token'])")"
BASE="${CREATEOS_SANDBOX_BASE_URL:-https://api.sb.createos.sh}"

echo "==> Destroy running sandboxes (free concurrent quota 1/1)"
python3 - "$TOKEN" "$BASE" <<'PY'
import json, sys, urllib.request
token, base = sys.argv[1], sys.argv[2]
req = urllib.request.Request(f"{base}/v1/sandboxes", headers={"X-Access-Token": token})
with urllib.request.urlopen(req, timeout=30) as r:
    payload = json.load(r)
items = payload.get("data", {})
if isinstance(items, dict):
    items = items.get("data") or items.get("items") or []
running = [s for s in items if isinstance(s, dict) and s.get("status") == "running"]
print(f"running: {len(running)}")
for s in running:
    sid = s["id"]
    dreq = urllib.request.Request(
        f"{base}/v1/sandboxes/{sid}",
        method="DELETE",
        headers={"X-Access-Token": token},
    )
    try:
        with urllib.request.urlopen(dreq, timeout=30) as r:
            print(f"destroyed {sid} → {r.status}")
    except Exception as e:
        print(f"destroy {sid} failed: {e}")
PY

echo "==> Smoke CreateOS list"
python3 - "$TOKEN" "$BASE" <<'PY'
import json, sys, urllib.request
token, base = sys.argv[1], sys.argv[2]
req = urllib.request.Request(f"{base}/v1/sandboxes?limit=1", headers={"X-Access-Token": token})
with urllib.request.urlopen(req, timeout=30) as r:
    print("createos_auth", r.status, "ok")
PY

if command -v curl >/dev/null && [[ "${SKIP_PROD_HEALTH:-}" != "1" ]]; then
  echo "==> Prod /api/health"
  curl -sS "https://createos-stripe-agents.vercel.app/api/health" || true
  echo
fi

echo "Preflight complete. For a cold prod token: vercel --prod --yes after sync."
