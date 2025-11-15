# GlitchTip Setup Guide - For Running with Claude Code

**Purpose:** This guide is designed to be run by Claude Code on a fresh Windows PC to automatically set up GlitchTip crash reporting infrastructure.

**What this does:**
- Installs WSL2 and Ubuntu
- Installs Docker Desktop
- Clones Lokus repository (crash reporting branch)
- Configures and starts GlitchTip
- Creates admin account

**Prerequisites:**
- Windows 10/11 (64-bit)
- Admin access
- Internet connection
- At least 8GB RAM, 20GB free storage

---

## Instructions for Claude Code

**Branch to Clone:** `feature/crash-reporting-glitchtip`

**Repository:** `https://github.com/lokus-ai/lokus.git`

---

## Part 1: WSL2 and Ubuntu Installation

### Step 1: Install WSL2

```powershell
# Run in PowerShell as Administrator
wsl --install

# This installs:
# - WSL2
# - Ubuntu (default distribution)
# - Virtual Machine Platform

# Note: This requires a restart
# After restart, continue to Step 2
```

**After the system restarts, WSL2 and Ubuntu will be available.**

---

## Part 2: Ubuntu Initial Setup

### Step 2: First Launch of Ubuntu

When Ubuntu launches for the first time, it will ask for a username and password.

**Username:** `lokus` (or any lowercase name without spaces)
**Password:** Choose a secure password (remember this!)

### Step 3: Update Ubuntu and Install Tools

```bash
# Run in Ubuntu terminal
sudo apt update && sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl wget git nano htop python3 python3-pip
```

---

## Part 3: Docker Installation

### Step 4: Install Docker Desktop

**Option A: Download and Install Manually**

1. Download from: https://www.docker.com/products/docker-desktop
2. Run installer
3. Select "Use WSL 2 instead of Hyper-V"
4. Install and restart

**Option B: Install via Command (if winget available)**

```powershell
# Run in PowerShell as Administrator
winget install Docker.DockerDesktop
```

### Step 5: Configure Docker for WSL

After Docker Desktop is installed and running:

```powershell
# Verify Docker is installed
docker --version
docker-compose --version
```

**In Docker Desktop GUI:**
1. Settings → Resources → WSL Integration
2. Enable Ubuntu toggle
3. Apply & Restart

---

## Part 4: Clone Lokus Repository

### Step 6: Clone the Repository

```bash
# Run in Ubuntu terminal

# Create project directory
mkdir -p ~/server-projects
cd ~/server-projects

# Clone Lokus repository
git clone https://github.com/lokus-ai/lokus.git

# Switch to the crash reporting feature branch
cd lokus
git checkout feature/crash-reporting-glitchtip

# Navigate to infrastructure directory
cd infrastructure

# Verify you're in the right place
pwd
# Should output: /home/lokus/server-projects/lokus/infrastructure

# List files to confirm
ls -la
# You should see:
# - docker-compose.yml
# - .env.example
# - backup.sh
# - DEPLOYMENT_GUIDE_MAC.md
# - DEPLOYMENT_GUIDE_WINDOWS.md
# - README.md
```

---

## Part 5: Configure GlitchTip

### Step 7: Create Environment File

```bash
# Copy example environment file
cp .env.example .env

# Generate a secure password for PostgreSQL
POSTGRES_PASS=$(openssl rand -base64 32)

# Generate a secure secret key for GlitchTip
SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(50))")

# Update .env file with generated values
sed -i "s/POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=${POSTGRES_PASS}/" .env
sed -i "s/SECRET_KEY=.*/SECRET_KEY=${SECRET_KEY}/" .env
sed -i "s|DATABASE_URL=.*|DATABASE_URL=postgres://glitchtip:${POSTGRES_PASS}@postgres:5432/glitchtip|" .env

# Verify configuration
echo "PostgreSQL Password: ${POSTGRES_PASS}"
echo "Secret Key: ${SECRET_KEY}"
echo ""
echo "Configuration saved to .env"

# Display current configuration (without sensitive values)
grep -E "^(GLITCHTIP_DOMAIN|DEFAULT_FROM_EMAIL|ENABLE_)" .env
```

**Important:** Save the PostgreSQL password and Secret Key somewhere safe!

### Step 8: Review Configuration

```bash
# Open .env file to review (optional)
nano .env

# Press Ctrl+X to exit without changes
```

**Key settings in .env:**
- `POSTGRES_PASSWORD` - Database password (auto-generated)
- `SECRET_KEY` - Django secret key (auto-generated)
- `GLITCHTIP_DOMAIN` - Set to https://crash.lokusmd.com
- `ENABLE_OPEN_USER_REGISTRATION=false` - Only admin can create users
- `TUNNEL_TOKEN` - Leave empty for now (add later for Cloudflare Tunnel)

---

## Part 6: Start GlitchTip

### Step 9: Launch Docker Containers

```bash
# Make sure you're in the infrastructure directory
cd ~/server-projects/lokus/infrastructure

# Start GlitchTip containers
docker-compose up -d

# This will:
# 1. Download Docker images (~500MB)
# 2. Create containers for PostgreSQL, Redis, GlitchTip web, and worker
# 3. Start all services

# Wait for services to be ready (takes ~2 minutes)
echo "Waiting for GlitchTip to start..."
sleep 120

# Check container status
docker-compose ps

# All containers should show "Up" or "Up (healthy)"
```

### Step 10: Verify Services

```bash
# Check if GlitchTip is responding
curl http://localhost:8000/_health/

# Expected output: {"healthy": true}

# If you get an error, wait another 30 seconds and try again:
sleep 30
curl http://localhost:8000/_health/
```

### Step 11: View Logs (Optional)

```bash
# View logs from all services
docker-compose logs --tail=50

# View logs from specific service
docker-compose logs --tail=20 glitchtip

# Follow logs in real-time (Ctrl+C to stop)
docker-compose logs -f
```

---

## Part 7: Create Admin User

### Step 12: Create Superuser

```bash
# Create admin account
docker-compose exec glitchtip ./manage.py createsuperuser

# You'll be prompted for:
# Email address: admin@lokus.local (or your preferred email)
# Password: (choose a secure password)
# Password (again): (confirm password)

# Expected output: "Superuser created successfully."
```

**Save these credentials!** You'll need them to log into GlitchTip.

---

## Part 8: Access GlitchTip Dashboard

### Step 13: Open in Browser

**From Windows:**

Open a web browser and navigate to: `http://localhost:8000`

**Login:**
- Email: The email you entered in Step 12
- Password: The password you entered in Step 12

**You should see the GlitchTip dashboard!**

---

## Part 9: Create GlitchTip Project for Lokus

### Step 14: Set Up Organization and Project

**In the GlitchTip web interface:**

1. Click **"Create Organization"**
   - Name: `Lokus`
   - Click **"Create"**

2. Click **"New Project"**
   - Name: `Lokus App`
   - Platform: `JavaScript`
   - Click **"Create Project"**

3. **Copy the DSN**
   - You'll see a DSN that looks like:
   - `https://XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX@localhost:8000/1`
   - Or if using Cloudflare Tunnel:
   - `https://XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX@crash.lokusmd.com/1`
   - **Copy this entire URL** - this is your Data Source Name (DSN)

### Step 15: Save DSN for Later

```bash
# Save DSN to a file for reference
echo "VITE_SENTRY_DSN=YOUR_DSN_HERE" > ~/glitchtip-dsn.txt
echo "TAURI_SENTRY_DSN=YOUR_DSN_HERE" >> ~/glitchtip-dsn.txt

# Replace YOUR_DSN_HERE with the actual DSN you copied

# Example:
# echo "VITE_SENTRY_DSN=https://abc123...@localhost:8000/1" > ~/glitchtip-dsn.txt
# echo "TAURI_SENTRY_DSN=https://abc123...@localhost:8000/1" >> ~/glitchtip-dsn.txt

# View saved DSN
cat ~/glitchtip-dsn.txt
```

---

## Part 10: Verification Checklist

### Step 16: Verify Everything is Working

Run these commands to verify the setup:

```bash
# 1. Check Docker containers are running
echo "=== Docker Container Status ==="
docker-compose ps
echo ""

# 2. Check health endpoint
echo "=== Health Check ==="
curl http://localhost:8000/_health/
echo ""

# 3. Check disk space
echo "=== Disk Space ==="
df -h | grep -E "(Filesystem|/dev/sda|overlay)"
echo ""

# 4. Check memory usage
echo "=== Memory Usage ==="
docker stats --no-stream
echo ""

# 5. Verify configuration
echo "=== Configuration ==="
echo "Infrastructure directory: $(pwd)"
echo "Branch: $(git branch --show-current)"
echo "Latest commit: $(git log -1 --oneline)"
echo ""

# 6. Check if admin user exists
echo "=== Admin User Check ==="
docker-compose exec glitchtip ./manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); print(f'Admin users: {User.objects.filter(is_superuser=True).count()}')"
```

**Expected results:**
- ✅ All containers show "Up" or "Up (healthy)"
- ✅ Health check returns `{"healthy": true}`
- ✅ At least 10GB free disk space
- ✅ Memory usage under 80%
- ✅ Currently on `feature/crash-reporting-glitchtip` branch
- ✅ At least 1 admin user exists

---

## Part 11: Next Steps (Optional)

### Step 17: Set Up Cloudflare Tunnel (For Remote Access)

**To access GlitchTip from anywhere (not just localhost):**

Follow the detailed instructions in `DEPLOYMENT_GUIDE_WINDOWS.md` Part 4.

**Summary:**
1. Install cloudflared
2. Login to Cloudflare: `cloudflared tunnel login`
3. Create tunnel: `cloudflared tunnel create lokus-crash`
4. Route DNS: `cloudflared tunnel route dns lokus-crash crash.lokusmd.com`
5. Get token: `cloudflared tunnel token lokus-crash`
6. Add token to `.env` file
7. Restart with tunnel: `docker-compose --profile cloudflare up -d`

### Step 18: Set Up Auto-Start on Boot

To make GlitchTip start automatically when Windows boots:

Follow instructions in `DEPLOYMENT_GUIDE_WINDOWS.md` Part 6.

### Step 19: Set Up Automated Backups

```bash
# Make backup script executable
chmod +x backup.sh

# Test backup
./backup.sh

# Backups are saved in: ./backups/
ls -lh backups/
```

To automate daily backups, follow `DEPLOYMENT_GUIDE_WINDOWS.md` Part 7.

---

## Part 12: Configure Lokus App (On Development Machine)

### Step 20: Add DSN to Lokus App

**On the machine where you develop Lokus:**

```bash
# Navigate to Lokus project
cd /path/to/Lokus-Main

# Edit production environment file
nano .env.production

# Add these lines (use the DSN you copied earlier):
VITE_SENTRY_DSN=https://XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX@crash.lokusmd.com/1
TAURI_SENTRY_DSN=https://XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX@crash.lokusmd.com/1
VITE_SENTRY_ENVIRONMENT=production
VITE_ENABLE_CRASH_REPORTS=true

# Save: Ctrl+X, Y, Enter
```

### Step 21: Test Crash Reporting

```bash
# Build Lokus in production mode
npm run tauri build

# Run the built app
# Trigger a test error (or wait for real crashes)
# Check GlitchTip dashboard - error should appear within 30 seconds
```

---

## Quick Reference Commands

### Daily Operations

**Start GlitchTip:**
```bash
cd ~/server-projects/lokus/infrastructure
docker-compose up -d
```

**Stop GlitchTip:**
```bash
cd ~/server-projects/lokus/infrastructure
docker-compose down
```

**Check Status:**
```bash
docker-compose ps
docker-compose logs --tail=50
```

**Restart Services:**
```bash
docker-compose restart
```

**Run Backup:**
```bash
cd ~/server-projects/lokus/infrastructure
./backup.sh
```

**View Disk Usage:**
```bash
df -h
docker system df
```

**Clean Up Docker (if low on space):**
```bash
docker system prune -a
# WARNING: This removes all unused images and containers
```

---

## Troubleshooting

### GlitchTip Won't Start

```bash
# Check logs for errors
docker-compose logs glitchtip

# Common issues:
# 1. Database not ready - wait 30 seconds and restart
docker-compose restart glitchtip

# 2. Port 8000 in use - check what's using it
sudo netstat -tulpn | grep 8000

# 3. Out of disk space - check and clean up
df -h
docker system prune
```

### Can't Access localhost:8000

```bash
# Check if container is running
docker-compose ps | grep glitchtip

# Check if port is listening
curl http://localhost:8000/_health/

# Try restarting
docker-compose restart glitchtip

# Check Windows firewall
# From PowerShell: Get-NetFirewallRule | Where-Object {$_.DisplayName -like "*Docker*"}
```

### Forgot Admin Password

```bash
# Reset password
docker-compose exec glitchtip ./manage.py changepassword admin@lokus.local

# Or create new superuser
docker-compose exec glitchtip ./manage.py createsuperuser
```

### Database Issues

```bash
# Check PostgreSQL logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres

# Wait for it to be healthy
sleep 30
docker-compose ps
```

### Docker Desktop Not Starting

**From PowerShell as Admin:**

```powershell
# Check WSL status
wsl --list --verbose

# Restart WSL
wsl --shutdown
wsl

# Restart Docker Desktop
# Right-click whale icon → Restart Docker Desktop
```

---

## Important File Locations

**Infrastructure Directory:**
```
~/server-projects/lokus/infrastructure/
```

**Configuration File:**
```
~/server-projects/lokus/infrastructure/.env
```

**Backups:**
```
~/server-projects/lokus/infrastructure/backups/
```

**Docker Volumes:**
```
# View volumes
docker volume ls | grep glitchtip

# Inspect volume
docker volume inspect infrastructure_postgres-data
```

**Logs:**
```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs glitchtip
docker-compose logs postgres
docker-compose logs redis
```

---

## Success Indicators

**✅ Setup is complete when:**

1. All 4 containers are running:
   ```bash
   docker-compose ps
   # glitchtip-postgres    Up (healthy)
   # glitchtip-redis       Up (healthy)
   # glitchtip-web         Up (healthy)
   # glitchtip-worker      Up
   ```

2. Health check passes:
   ```bash
   curl http://localhost:8000/_health/
   # {"healthy": true}
   ```

3. Can log into dashboard at `http://localhost:8000`

4. Organization "Lokus" and Project "Lokus App" created

5. DSN copied and ready to add to Lokus app

---

## Summary

**What was installed:**
- ✅ WSL2 and Ubuntu
- ✅ Docker Desktop
- ✅ GlitchTip (web, worker, PostgreSQL, Redis)

**What was configured:**
- ✅ Lokus repository cloned (feature/crash-reporting-glitchtip branch)
- ✅ Environment variables (.env)
- ✅ Admin user account
- ✅ Organization and project

**What's running:**
- ✅ GlitchTip at http://localhost:8000
- ✅ PostgreSQL database
- ✅ Redis cache
- ✅ Background worker for processing

**Next steps:**
- 🔲 Set up Cloudflare Tunnel (optional, for remote access)
- 🔲 Configure auto-start (optional, for 24/7 operation)
- 🔲 Add DSN to Lokus app
- 🔲 Test crash reporting

---

## Support

**For detailed guides, see:**
- `DEPLOYMENT_GUIDE_WINDOWS.md` - Complete Windows deployment guide
- `DEPLOYMENT_GUIDE_MAC.md` - Complete macOS deployment guide
- `README.md` - Technical documentation

**For issues:**
- Check logs: `docker-compose logs -f`
- Restart services: `docker-compose restart`
- GitHub issues: https://github.com/lokus-ai/lokus/issues

---

## Cost & Performance

**Resources used:**
- Disk: ~2-3GB (Docker images + data)
- Memory: ~1-2GB (all containers)
- CPU: ~5-10% idle, ~20-30% under load

**Power consumption:**
- Windows PC: ~100-150W
- Annual cost: ~$130-180 (if running 24/7)

**Compare to Sentry SaaS:**
- Sentry: $26/month = $312/year
- Self-hosted: ~$150/year electricity
- **Savings: ~$160/year**

---

**✨ Setup Complete! GlitchTip is ready to receive crash reports from Lokus!**
