\# Blue Ridge Homes — Operations Guide (OPS.md)



This document contains operational information required to run, deploy, and maintain the Blue Ridge Homes website.



This file should be referenced in \*\*every development session or AI handoff\*\*.



---



\# Project Repository



GitHub:



https://github.com/brhomesnc-web/blueridgehomes-web



Local development root:



C:\\BlueRidgeHomes



Next.js application root:



C:\\BlueRidgeHomes\\apps\\web



Server application root:



/var/www/brhomes/apps/web



---



\# Server Information



Server IP:



168.231.71.124



User:



brian



SSH login:



ssh brian@168.231.71.124



---



\# Server Directory Structure



Primary project:



/var/www/brhomes/apps/web



This is the \*\*Next.js application directory\*\*.



Important rule:



Never run commands outside this directory when working on Blue Ridge Homes.



PerfectBike and other apps exist on the same server.



---



\# Running Server



The site runs using:



Next.js production server



Port:



3001



Bind address:



127.0.0.1



Start command:



npm run start -- --hostname 127.0.0.1 --port 3001



---



\# Deploy Script



Location:



/var/www/brhomes/deploy.sh



Purpose:



Pull latest code and rebuild site.



Script:



\#!/bin/bash



cd /var/www/brhomes/apps/web



echo "Pulling latest code..."

git pull origin main



echo "Installing dependencies..."

npm install



echo "Building Next.js..."

npm run build



echo "Restarting server..."

pkill -f next



npm run start -- --hostname 127.0.0.1 --port 3001 \&



---



\# Deploy Procedure



SSH to server:



ssh brian@168.231.71.124



Run deploy script:



/var/www/brhomes/deploy.sh



---



\# Local Development



Local Next.js root:



C:\\BlueRidgeHomes\\apps\\web



Install dependencies:



npm install



Run dev server:



npm run dev



Open:



http://localhost:3000



---



\# Viewing the Server Build



Because nginx is not yet pointed at the new site, we view it via SSH tunnel.



Command:



ssh -L 3001:127.0.0.1:3001 brian@168.231.71.124



Then open:



http://localhost:3001



---



\# Git Workflow



Commit changes:



git add .

git commit -m "message"

git push



Then deploy on server.



---



\# Nginx Status



Current production domain:



brhomesnc.com



The new Next.js site is \*\*NOT yet connected to nginx\*\*.



The site is currently accessed only through:



localhost tunnel → port 3001.



We will not change nginx until the new site is ready.



---



\# Technology Stack



Framework:



Next.js 16 (App Router)



Language:



TypeScript



Styling:



TailwindCSS



Image optimization:



ImageMagick → WebP pipeline



Optimized images:



/public/optimized/



Original imported images:



/public/imported/



---



\# Important Project Rules



1\. Never modify nginx until the site is ready.

2\. Never kill processes related to PerfectBike.

3\. Always operate inside /var/www/brhomes.

4\. Always rebuild after page changes before testing server view.

5\. Keep OPS.md updated when infrastructure changes.



---



