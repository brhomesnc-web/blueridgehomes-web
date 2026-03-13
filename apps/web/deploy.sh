#!/bin/bash
set -e
cd /var/www/brhomes/apps/web

echo "=== Stopping server ==="
sudo systemctl stop brhomes-web

echo "=== Cleaning build ==="
sudo rm -rf .next

echo "=== Building ==="
npm run build

echo "=== Copying public to standalone ==="
rm -rf .next/standalone/public 2>/dev/null || true
cp -r public .next/standalone/public

echo "=== Copying static to standalone ==="
cp -r .next/static .next/standalone/.next/static

echo "=== Starting server ==="
sudo systemctl start brhomes-web

echo "=== Done ==="
