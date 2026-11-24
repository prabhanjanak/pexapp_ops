# Sankara Eye Foundation - Production Deployment Guide
**Target Server:** On-Premise Production Server (`192.168.1.244`)  
**Target Environment:** Patient Experience (PPE) & 5S Audit Operations Portal  
**Target Git Branch:** `main`  
**Master Credential Manager Passcode:** `Sankara_Admin@2026`  

---

## ⚠️ Critical Data Safety Notice
* **NO DATABASE DATA WILL BE ERASED OR RESET.**
* Existing PostgreSQL database (`sankara_px`), all historical bottleneck records, photo URLs, and 5S audit logs remain completely untouched and preserved.

---

## What Has Been Updated in This Release
1. **Universal Photo Upload Pipeline Across All Units (HEIC, HEIF, JPG, JPEG, PNG, WEBP):**
   * Installed `heic2any` dynamic client processor and universal `imageUtils.ts`.
   * Automatically decodes and converts iPhone/iOS `.heic` and `.heif` camera captures (even 48MP/108MP mobile camera shots) into high-fidelity compressed progressive JPEGs (<120KB).
   * Fixed PostgreSQL `invalid input syntax for type json` HTTP 500 error by ensuring all `JSONB` photo payloads (`before_photos`, `after_photos`) are strictly parsed and serialized.
   * Full multi-photo upload integrated across Bottlenecks (Add & Edit), Photo Upload Cell, and 5S Audit Checkpoints.
2. **Institutional Redesign of Portal Login Page:**
   * Features high-resolution Sankara Eye Foundation Logo and Golden Emblem.
   * Prominently highlights *Sri Kanchi Kamakoti Medical Trust (Est. 1977)* and the 14 Hospital Units Pan-India Network.
   * Includes one-click Quick Role Demonstration Assistant (Super Admin, President, Unit Head - Coimbatore, Unit Head - Jaipur, Operations Team, 5S Auditor).
   * Enterprise-grade 256-bit SSL encryption indicator and clean hospital aesthetics.
3. **Network WAN Timeouts Extended Across India:**
   * PostgreSQL database pool timeout raised from 4s to 30s (`query_timeout: 30000ms`, `connectionTimeoutMillis: 15000ms`, pool size increased to 30).
   * Node.js / Express HTTP server request timeout raised to 120s (`requestTimeout: 120000ms`).
   * Frontend HTTP request timeout raised to 60s with automatic single-retry for remote units (Jaipur, Coimbatore, Shimoga, etc.).
4. **Fixed Jaipur Unit Head Update Issue:**
   * Backend `PUT /bottlenecks/:id` now automatically inserts/upserts client or offline-created bottlenecks into PostgreSQL, preventing 404 "Bottleneck not found" errors.
5. **Fixed Coimbatore & Remote Units Loading Glitch:**
   * Resolved `Cannot read properties of undefined (reading 'toLowerCase')` crash when filtering bottlenecks with unassigned departments.
   * Added resilient `localStorage` caching so during hospital WAN latency spikes, bottlenecks load instantly without showing a blank list.
6. **President View Customization:**
   * Hidden tabs: *Audit Logs*, *DB Health*, and *Unit Scopes & Settings*.
   * *Categories & Department* tab is retained in **View-Only Mode** with a multi-unit dropdown filter.
7. **Super Admin Credential Manager:**
   * Secure UI under Super Admin settings protected with passcode `Sankara_Admin@2026` to configure SMTP, Zoho Mail, and database credentials without modifying environment files manually.

---

## Step-by-Step Deployment Instructions

### Step 1: Login to the Server
SSH into the production server (`192.168.1.244`):
```bash
ssh <username>@192.168.1.244
```

---

### Step 2: Navigate to Project Directory & Pull Latest Code
```bash
cd /path/to/operationsapp
git pull origin main
```
*Verify that the latest commit includes `f148b98` (or newer).*

---

### Step 3: Install Dependencies & Build Frontend
```bash
cd pxapp
npm install
npm run build
```

---

### Step 4: Restart the Application Process
If using **PM2**:
```bash
pm2 restart operationsapp || pm2 restart pxapp || pm2 restart all
```

If running directly via systemd or npm:
```bash
sudo systemctl restart operationsapp || sudo systemctl restart pxapp
```

---

### Step 5: Update Nginx Reverse Proxy Configuration (Crucial for Timeouts)
Open your active Nginx site configuration file (typically `/etc/nginx/sites-available/default` or `/etc/nginx/conf.d/operationsapp.conf`):
```bash
sudo nano /etc/nginx/sites-available/default
```

Inside the `server { ... }` or `location / { ... }` block that proxies to port `3000`, add or update the following timeout and payload size directives:

```nginx
server {
    ...

    # Allow high-res photo uploads without 413 Payload Too Large error
    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;

        # Extended waiting and response times across India (120 seconds)
        proxy_connect_timeout 120s;
        proxy_send_timeout    120s;
        proxy_read_timeout    120s;
        send_timeout          120s;
    }
}
```

Test and reload Nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

### Step 6: Post-Deployment Verification
Verify server health endpoint locally on the server:
```bash
curl -s http://localhost:3000/api/health
```
**Expected Output:**
```json
{"status":"healthy","database":"PostgreSQL Synced","timestamp":"..."}
```

Verify the 14 units endpoint:
```bash
curl -s http://localhost:3000/api/units | grep -o '"name":' | wc -l
```
*(Should return `14` units).*

---

## Rollback Plan (If Needed)
In the unlikely event of any issue, rollback to the previous commit without touching database tables:
```bash
git checkout 571a49d
cd pxapp
npm run build
pm2 restart all
```
