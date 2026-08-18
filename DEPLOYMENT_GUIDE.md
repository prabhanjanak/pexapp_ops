# 🏥 Sankara Eye Hospital — Project Patient Experience (PPE)
## Production Deployment & Server Administration Guide

This guide provides step-by-step instructions for the server administrator to deploy, configure, autobuild the database, and run the **Project Patient Experience (PPE)** platform using **Docker Compose** (recommended) or **PM2 + PostgreSQL** (native).

---

## 🐳 0. Docker Deployment (Fastest & Recommended)

Running with Docker encapsulates both the **Node.js Application** and **PostgreSQL 16 Database** with automatic health checks, persistent database volumes, and zero manual dependency installation.

### Step 1: Clone Repository & Navigate to Directory
```bash
git clone <YOUR_REPO_URL>
cd operationsapp
```

### Step 2: Verify `.env` File
The `.env` file is already pre-configured with secure 32-character hexadecimal credentials:
```ini
NODE_ENV=production
PORT=3000
PGHOST=localhost
PGPORT=5432
PGDATABASE=sankara_px
PGUSER=postgres
PGPASSWORD=6db2b2f25ce4d72acede4edc42bc96f9
PGSSL=false
```

### Step 3: Launch Containers
```bash
docker compose up -d --build
```

### Step 4: Verify Deployment
- **Application URL**: `http://192.168.1.244:8500` (or `http://localhost:8500`)
- **API Health Check**: `http://192.168.1.244:8500/api/health`
- **Units List API**: `http://192.168.1.244:8500/api/units`

### Useful Docker Management Commands:
```bash
# Check container status
docker compose ps

# View live container logs
docker compose logs -f

# Restart services
docker compose restart

# Stop services
docker compose down

# Stop services and remove volumes (Caution: Erases database)
# docker compose down -v
```

---

## 📋 1. System Requirements & Prerequisites (Bare Metal / PM2)

Ensure the target server (Ubuntu, Debian, RHEL, CentOS, or macOS) has the following installed:

| Component | Minimum Version | Recommended |
| :--- | :--- | :--- |
| **Node.js** | `v18.18.0+` | `v20.x LTS` or `v22.x LTS` |
| **npm** | `v9.0.0+` | `v10.x` |
| **PostgreSQL** | `v14.0+` | `v15.x` or `v16.x` |
| **PM2 Process Manager** | `v5.3.0+` | Install via `npm install -g pm2` |
| **Nginx** (Optional) | `v1.18+` | For SSL & Reverse Proxy |

To install PM2 globally:
```bash
sudo npm install -g pm2
```

---

## 🚀 2. Quick Deployment (5 Steps)

### Step 1: Extract the Production Zip Archive
```bash
# Extract into your target web directory (e.g. /var/www/pexapp_ops)
mkdir -p /var/www/pexapp_ops
unzip pexapp_ops_production.zip -d /var/www/pexapp_ops
cd /var/www/pexapp_ops
```

---

### Step 2: Configure Environment & Database Credentials (`.env`)

Copy the provided `.env.example` to `.env`:
```bash
cp .env.example .env
cp .env.example pxapp/.env
```

Open `.env` and configure your PostgreSQL database credentials:
```ini
# ==============================================================================
# SANKARA EYE HOSPITAL - PROJECT PATIENT EXPERIENCE (PPE)
# PRODUCTION ENVIRONMENT CONFIGURATION
# ==============================================================================

NODE_ENV=production
PORT=3000

# ==============================================================================
# POSTGRESQL DATABASE CREDENTIALS
# ==============================================================================
# Option 1: Full Connection URI (Recommended for Cloud DBs / Supabase / AWS RDS)
# DATABASE_URL=postgresql://postgres:YourSecurePassword@localhost:5432/sankara_px

# Option 2: Individual Parameters (Standard on Linux Servers)
PGHOST=localhost
PGPORT=5432
PGDATABASE=sankara_px
PGUSER=postgres
PGPASSWORD=YourPostgresPasswordHere

# Set to true if PostgreSQL server requires SSL (e.g. AWS RDS / Managed DB)
PGSSL=false
```

---

### Step 3: Install Node.js Dependencies

Run the dependency installation:
```bash
# Install root & workspace packages
npm install
cd pxapp && npm install && cd ..
```

---

### Step 4: Run Database Autobuild & Migration

Execute the automated database build command:
```bash
npm run db:init
```

> **What this command does automatically:**
> 1. Verifies connection to PostgreSQL.
> 2. Auto-creates database `sankara_px` if not present.
> 3. Creates/migrates required tables (`units`, `users`, `bottlenecks`, `audit_logs`).
> 4. Pre-seeds all **14 Hospital Units** (Coimbatore HQ, Panvel, Shimoga, Bengaluru, etc.).
> 5. Configures primary **Super Admin**, **View-Only Super Admin**, **Operations Team**, and **Unit Head** accounts.

---

### Step 5: Build Production Client Assets

Build the optimized production frontend bundle:
```bash
npm run build
```
*(This generates the production bundle inside `pxapp/dist`)*

---

### Step 6: Launch Application with PM2

Start the production service under PM2 process management:
```bash
npm run pm2:start
```
*(Or directly: `pm2 start ecosystem.config.cjs --env production`)*

To ensure PM2 automatically starts on system reboot:
```bash
pm2 save
pm2 startup
# (Run the generated sudo command outputted by pm2 startup)
```

Verify status:
```bash
pm2 status
curl http://localhost:3000/api/health
```

---

## 🔑 3. Default Administrative & Unit Credentials

All initial accounts are pre-configured with the default master password: **`Sankara@123`**

| Role / Scope | Name / Title | Login Identifier / Email | EMP ID | Default Password | Access Level |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Super Admin** | Prabhanjan | `prabhanjan@sankaraeye.com` | `010177` | `Sankara@123` | **Full Master Access (Read/Write/Delete/User CRUD)** |
| **Super Admin (View Only)** | Dr. S. K. Narayanan | `auditor@sankaraeye.com` | `010045` | `Sankara@123` | **Executive Inspection (View-Only Unit Head Mode)** |
| **Central Operations** | Operations Directorate | `ops@sankara.org` | `010002` | `Sankara@123` | **Network Analytics & Compliance** |
| **Unit Head (Panvel)** | Dr. Neha V. | `panvel.head@sankara.org` | `010003` | `Sankara@123` | **Panvel Hospital Unit Workspace** |
| **Unit Head (Coimbatore)**| Dr. R. Ramakrishnan | `coimbatore.head@sankara.org` | `010004` | `Sankara@123` | **Coimbatore HQ Hospital Workspace** |

*Note: Users can change their password securely via their User Profile in the app header.*

---

## 🌐 4. Nginx Reverse Proxy Configuration (Production & SSL)

Create `/etc/nginx/sites-available/pexapp.conf`:

```nginx
server {
    listen 80;
    server_name pexapp.sankaraeye.com; # Replace with your domain or server IP

    # Set client upload body size to 50MB for clinical before/after photo evidence
    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/pexapp.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🛠️ 5. PM2 Management Commands Reference

| Action | NPM Script | Equivalent PM2 Command |
| :--- | :--- | :--- |
| **Start Service** | `npm run pm2:start` | `pm2 start ecosystem.config.cjs --env production` |
| **Stop Service** | `npm run pm2:stop` | `pm2 stop sankara-pexapp` |
| **Restart Service** | `npm run pm2:restart` | `pm2 restart sankara-pexapp` |
| **Live Logs Stream**| `npm run pm2:logs` | `pm2 logs sankara-pexapp` |
| **Check Health** | `npm run pm2:status` | `pm2 status` |
| **Re-run DB Autobuild**| `npm run db:init` | `cd pxapp && npx tsx server/initDb.ts` |

---

## 🩺 6. Verification & Health Endpoints

- **Frontend Application**: `http://YOUR_SERVER_IP:3000/`
- **System Health Check**: `http://YOUR_SERVER_IP:3000/api/health`
- **Hospital Units API**: `http://YOUR_SERVER_IP:3000/api/units`

---

## 🛡️ 7. Database Backup & Restore

### Backup Database
```bash
pg_dump -U postgres -d sankara_px -F c -b -v -f "/var/backups/sankara_px_$(date +%Y%m%d_%H%M%S).dump"
```

### Restore Database
```bash
pg_restore -U postgres -d sankara_px -v "/var/backups/sankara_px_backup.dump"
```

---

**All rights reserved to Sankara Eye Foundation India • Sri Kanchi Kamakoti Medical Trust**
