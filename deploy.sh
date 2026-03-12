#!/bin/bash

cd /var/www/brhomes/apps/web

echo "Pulling latest code..."
git pull origin main

echo "Installing dependencies..."
npm install

echo "Building Next.js..."
npm run build

echo "Restarting server..."
pkill -f next

npm run start -- --hostname 127.0.0.1 --port 3001 &
