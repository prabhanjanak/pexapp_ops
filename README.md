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

## 🚀 Quick Start for Developers

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

## 🚢 Production Deployment

For step-by-step production deployment instructions with PM2, PostgreSQL setup, and Nginx reverse proxy configuration, please refer to:
👉 **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)**

---

## 📜 Administrative Credentials

- **Super Admin**: `prabhanjan@sankaraeye.com` / EMP ID: `010177` / Password: `Sankara@123`
- **Super Admin (View Only)**: `auditor@sankaraeye.com` / EMP ID: `010045` / Password: `Sankara@123`
- **Operations Team**: `ops@sankara.org` / EMP ID: `010002` / Password: `Sankara@123`
- **Panvel Unit Head**: `panvel.head@sankara.org` / EMP ID: `010003` / Password: `Sankara@123`

---

*All rights reserved to Sankara Eye Foundation India • Sri Kanchi Kamakoti Medical Trust*
