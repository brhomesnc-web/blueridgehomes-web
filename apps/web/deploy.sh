#!/bin/bash
set -e
cd /var/www/brhomes/apps/web
echo "=== Stopping server ==="
sudo systemctl stop brhomes-web
echo "=== Cleaning build ==="
sudo rm -rf .next
echo "=== Building ==="
npm run build
echo "=== Setting up public in standalone ==="
# Copy public/ contents into standalone (use -rT to merge into existing dir, not nest)
cp -rT public .next/standalone/public
# Replace optimized folder with symlink so uploads are instantly visible
sudo rm -rf .next/standalone/public/optimized
ln -s /var/www/brhomes/apps/web/public/optimized .next/standalone/public/optimized
echo "=== Copying static to standalone ==="
cp -r .next/static .next/standalone/.next/static
echo "=== Copying env ==="
cp .env.local .next/standalone/.env.local 2>/dev/null; true
echo "=== Starting server ==="
sudo systemctl start brhomes-web
echo "=== Done ==="
