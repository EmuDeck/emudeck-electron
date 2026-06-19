#!/usr/bin/env bash
set -euo pipefail

APPDIR=/app/emudeck
install -d "$APPDIR"

cp -a release/app/. "$APPDIR/app/"

cp -a node_modules "$APPDIR/node_modules"

cp -a assets "$APPDIR/assets"
[ -d fallback-backend ] && cp -a fallback-backend "$APPDIR/fallback-backend"

install -d /app/bin
cat > /app/bin/emudeck <<'EOF'
#!/usr/bin/env bash
exec zypak-wrapper /app/emudeck/node_modules/electron/dist/electron /app/emudeck/app "$@"
EOF
chmod +x /app/bin/emudeck
