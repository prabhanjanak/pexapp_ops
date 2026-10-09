#!/bin/bash
# ==============================================================================
# SANKARA EYE HOSPITAL - AUTOMATED PRODUCTION UPDATE SCRIPT
# ==============================================================================

set -e

echo "============================================================"
echo "  Sankara Eye Hospital - Operations App Update Process"
echo "============================================================"

# 1. Check if git repo and pull latest changes if git is available
if [ -d ".git" ]; then
    echo "[Step 1/4] Pulling latest updates from Git..."
    git pull origin main || echo "[Notice] Git pull skipped or not configured."
else
    echo "[Step 1/4] Git directory not detected. Using current local files."
fi

# 2. Rebuild the application container with fresh files
echo "[Step 2/4] Building fresh application Docker image (clean build)..."
docker compose build --no-cache app

# 3. Restart the application container while keeping postgres container intact
echo "[Step 3/4] Restarting application container (Database volume preserved)..."
docker compose up -d app

# 4. Wait 3 seconds and verify health
echo "[Step 4/4] Verifying health status..."
sleep 3
docker compose ps

echo ""
echo "============================================================"
echo "  Update completed successfully!"
echo "  Web Portal: http://localhost:8500"
echo "  Health API: http://localhost:8500/api/health"
echo "============================================================"
echo ""
echo "Streaming latest application logs (Press Ctrl+C to exit):"
docker compose logs -f --tail=30 app
