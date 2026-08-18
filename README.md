# 🏥 Sankara Eye Hospital — Project Patient Experience (PPE)
### Operations & Bottleneck Resolution Management Platform

![Sankara Eye Hospital](pxapp/public/sankara-logo.png)

A comprehensive operations management and patient experience tracking platform for **Sankara Eye Care Institutions (Sri Kanchi Kamakoti Medical Trust)** spanning across 14 hospital units nationwide.

---

## 🌟 Key Capabilities

- **14 Hospital Units Executive Network Dashboard**: Real-time cross-unit benchmarking, resolution rates, and live operational KPIs.
- **Role-Based Governance**:
  - 👑 **Super Admin**: Full master read, write, delete, photo approvals, and staff directory user management (CRUD).
  - 👁️ **Super Admin (View Only)**: Executive read-only inspection mode.
  - 📊 **Central Operations Team**: Cross-hospital compliance, category heatmaps, and audit feed.
  - 🏥 **Unit Head**: Dedicated hospital unit bottleneck registry with photo evidence tracking.
- **3-Stage Workflow Progression**:
  1. `Acknowledge` (30%)
  2. `In progress` (70%)
  3. `Completed` (100%)
- **Before & After Clinical Photo Evidence**: High-resolution image compression with Lightbox preview.
- **PostgreSQL 14+ Database Engine**: Enterprise data storage with JSONB evidence store and audit logs.
- **PM2 Daemon Ready**: Enterprise process management with auto-restart, cluster mode, and zero-downtime reloads.

---

## 🐳 1-Command Docker Deployment (Recommended)

To run the full stack (Node.js Application + PostgreSQL Database) in Docker on internal IP **`http://192.168.1.244:8500`**:

```bash
# 1. Clone or pull the repository
git clone <YOUR_REPO_URL>
cd operationsapp

# 2. Launch all services with Docker Compose
docker compose up -d --build
```

- **Application URL**: `http://192.168.1.244:8500` (or `http://localhost:8500`)
- **Health Check API**: `http://192.168.1.244:8500/api/health`
- **View Container Logs**: `docker compose logs -f`
- **Stop Containers**: `docker compose down`

---

## 🚀 Local Development (Without Docker)

```bash
# 1. Install dependencies
npm install
cd pxapp && npm install && cd ..

# 2. Configure environment
cp .env.example .env

# 3. Autobuild & seed PostgreSQL
npm run db:init

# 4. Start local development server
npm run dev
```

Visit: `http://localhost:3000`

---

## 🚢 Production Deployment Guide

For step-by-step production deployment instructions with Docker, PM2, PostgreSQL setup, and Nginx reverse proxy configuration, please refer to:
👉 **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)**

---

## 📜 Administrative Credentials

- **Super Admin**: `prabhanjan@sankaraeye.com` / EMP ID: `010177` / Password: `Sankara@123`
- **Super Admin (View Only)**: `auditor@sankaraeye.com` / EMP ID: `010045` / Password: `Sankara@123`
- **Operations Team**: `ops@sankara.org` / EMP ID: `010002` / Password: `Sankara@123`
- **Panvel Unit Head**: `panvel.head@sankara.org` / EMP ID: `010003` / Password: `Sankara@123`

---

*All rights reserved to Sankara Eye Foundation India • Sri Kanchi Kamakoti Medical Trust*
