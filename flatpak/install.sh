#!/usr/bin/env bash
set -euo pipefail

APPDIR=/app/emudeck
install -d "$APPDIR"

# Same layout as electron-builder: renamed binary (app.isPackaged), resources/app and resources/assets
cp -a node_modules/electron/dist/. "$APPDIR/"
rm -rf node_modules/electron/dist
mv "$APPDIR/electron" "$APPDIR/emudeck"
rm -f "$APPDIR/resources/default_app.asar"

cp -a release/app/. "$APPDIR/resources/app/"

cp -a node_modules "$APPDIR/node_modules"

install -d "$APPDIR/resources/assets"
cp -a assets/. "$APPDIR/resources/assets/"
cp -a src/assets/. "$APPDIR/resources/assets/"
[ -d fallback-backend ] && cp -a fallback-backend "$APPDIR/fallback-backend"

install -d /app/bin
cat > /app/bin/emudeck <<'EOF'
#!/usr/bin/env bash
exec zypak-wrapper /app/emudeck/emudeck "$@"
EOF
chmod +x /app/bin/emudeck

cat > /app/bin/host-bash <<'EOF'
#!/bin/sh
exec flatpak-spawn --host bash "$@"
EOF
chmod +x /app/bin/host-bash
