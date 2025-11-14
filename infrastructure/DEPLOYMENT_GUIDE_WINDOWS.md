# GlitchTip Deployment Guide - Windows

Complete step-by-step guide to deploy GlitchTip crash reporting infrastructure on Windows PC.

## Prerequisites

- Windows 10/11 (64-bit)
- Admin access
- At least 8GB RAM, 20GB free storage
- Stable internet connection

---

## Part 1: Initial Windows Setup (One-Time)

### Step 1: Install WSL2 (Windows Subsystem for Linux)

**Why?** Docker on Windows works best with WSL2, and it's closer to production Linux environments.

```powershell
# Open PowerShell as Administrator (Right-click Start → Windows PowerShell (Admin))

# Install WSL2
wsl --install

# This installs:
# - WSL2
# - Ubuntu (default Linux distribution)
# - Virtual Machine Platform

# Restart your computer when prompted
```

**After restart:**

```powershell
# Open PowerShell again and check WSL version
wsl --list --verbose

# Should show Ubuntu with VERSION 2
```

### Step 2: Set Up Ubuntu in WSL2

```powershell
# Launch Ubuntu (it will auto-install on first run)
wsl

# Or: Search "Ubuntu" in Start menu and click it
```

**First launch will ask you to:**
1. Enter a username (lowercase, no spaces): `lokus`
2. Enter a password (you'll need this often)
3. Confirm password

```bash
# Update Ubuntu packages
sudo apt update && sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl wget git nano htop
```

### Step 3: Install Docker Desktop

**Download and Install:**
1. Go to: https://www.docker.com/products/docker-desktop
2. Download "Docker Desktop for Windows"
3. Run the installer
4. Check "Use WSL 2 instead of Hyper-V" (should be default)
5. Click "OK" and wait for installation
6. Restart when prompted

**Configure Docker Desktop:**
1. Launch Docker Desktop from Start menu
2. Wait for Docker to start (whale icon appears in system tray)
3. Right-click whale icon → Settings
4. Go to "Resources" → "WSL Integration"
5. Enable "Ubuntu" toggle
6. Click "Apply & Restart"
7. Go to "Resources" → "Advanced"
8. Set Memory to at least 4GB (8GB recommended)
9. Set CPUs to at least 2
10. Click "Apply & Restart"

**Verify Installation:**

```powershell
# In PowerShell or Ubuntu (WSL):
docker --version
docker-compose --version

# Should show versions like:
# Docker version 24.x.x
# Docker Compose version v2.x.x
```

### Step 4: Install Git (if not already installed)

```powershell
# In PowerShell as Administrator:
winget install Git.Git

# Or download from: https://git-scm.com/download/win

# Verify
git --version
```

### Step 5: Install Cloudflared

**Download:**
1. Go to: https://github.com/cloudflare/cloudflared/releases
2. Download `cloudflared-windows-amd64.exe`
3. Rename to `cloudflared.exe`
4. Move to `C:\Windows\System32\` (requires admin)

**Or via PowerShell (Admin):**

```powershell
# Download cloudflared
Invoke-WebRequest -Uri "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe" -OutFile "$env:USERPROFILE\Downloads\cloudflared.exe"

# Move to System32 (so it's in PATH)
Move-Item -Path "$env:USERPROFILE\Downloads\cloudflared.exe" -Destination "C:\Windows\System32\cloudflared.exe" -Force

# Verify
cloudflared --version
```

### Step 6: Configure Windows for 24/7 Operation

**Power Settings:**
1. Open Settings → System → Power & sleep
2. Set "When plugged in, turn off after": Never
3. Set "When plugged in, PC goes to sleep after": Never
4. Click "Additional power settings"
5. Select "High performance" plan
6. Click "Change plan settings"
7. Set "Turn off the display": 10 minutes
8. Set "Put the computer to sleep": Never
9. Click "Change advanced power settings"
10. Expand "Hard disk" → "Turn off hard disk after"
11. Set to "Never" (0)
12. Click "OK"

**Disable Windows Updates Auto-Restart:**
1. Open Settings → Update & Security → Windows Update
2. Click "Advanced options"
3. Under "Pause updates", set pause for 1 week
4. Enable "Show a notification when your PC requires a restart"

**Disable Sleep in Registry (Advanced):**

```powershell
# Run as Administrator
powercfg /change standby-timeout-ac 0
powercfg /change standby-timeout-dc 0
powercfg /change hibernate-timeout-ac 0
powercfg /change hibernate-timeout-dc 0
```

### Step 7: Create Project Directory

**Option A: In Windows (for easier access)**

```powershell
# Create directory in your user folder
mkdir C:\ServerProjects
cd C:\ServerProjects

# Clone Lokus repository
git clone https://github.com/lokus-ai/lokus.git
cd lokus\infrastructure
```

**Option B: In WSL/Ubuntu (recommended for Docker)**

```bash
# In Ubuntu (WSL) terminal
mkdir -p ~/server-projects
cd ~/server-projects

# Clone Lokus repository
git clone https://github.com/lokus-ai/lokus.git
cd lokus/infrastructure
```

**Note:** For this guide, we'll use **Option B (WSL)** as it works better with Docker.

---

## Part 2: Configure GlitchTip

### Step 8: Open Ubuntu Terminal

```powershell
# From PowerShell:
wsl

# Or: Search "Ubuntu" in Start menu
```

### Step 9: Navigate to Infrastructure Folder

```bash
# In Ubuntu terminal:
cd ~/server-projects/lokus/infrastructure

# Or if you cloned in Windows:
cd /mnt/c/ServerProjects/lokus/infrastructure
```

### Step 10: Create Environment File

```bash
# Copy example environment file
cp .env.example .env

# Edit with nano
nano .env
```

**Fill in these required values:**

```bash
# PostgreSQL Configuration
POSTGRES_PASSWORD=your_secure_password_here_min_20_chars

# GlitchTip Secret Key (generate a random 50-character string)
SECRET_KEY=your_random_50_character_secret_key_here

# Domain (if using Cloudflare Tunnel)
GLITCHTIP_DOMAIN=https://crash.lokusmd.com

# Email (for notifications)
DEFAULT_FROM_EMAIL=glitchtip@lokusmd.com
```

**Generate SECRET_KEY:**

```bash
# Using Python (should be pre-installed in Ubuntu)
python3 -c "import secrets; print(secrets.token_urlsafe(50))"

# Or using OpenSSL
openssl rand -base64 50

# Copy the output and paste into .env as SECRET_KEY
```

**Example .env file:**

```bash
POSTGRES_DB=glitchtip
POSTGRES_USER=glitchtip
POSTGRES_PASSWORD=MySecurePassword123456789!
DATABASE_URL=postgres://glitchtip:MySecurePassword123456789!@postgres:5432/glitchtip

SECRET_KEY=xB9mK7nQ2wP4vY8tR6sL3jN1fG5hD0cE9aZ7xW4uT2yV6qM8pL0bN3

EMAIL_URL=consolemail://
GLITCHTIP_DOMAIN=https://crash.lokusmd.com
DEFAULT_FROM_EMAIL=glitchtip@lokusmd.com

ENABLE_OPEN_USER_REGISTRATION=false
ENABLE_ORGANIZATION_CREATION=false

REDIS_URL=redis://redis:6379

# Leave empty for now (will add after Cloudflare setup)
TUNNEL_TOKEN=
```

**Save:** Press Ctrl+X, then Y, then Enter

---

## Part 3: Start GlitchTip (Local Access)

### Step 11: Start Docker Containers

```bash
# Make sure you're in the infrastructure directory
cd ~/server-projects/lokus/infrastructure

# Start GlitchTip (without Cloudflare Tunnel for now)
docker-compose up -d

# This will:
# - Download Docker images (~500MB, takes 5-10 minutes first time)
# - Create containers for PostgreSQL, Redis, GlitchTip
# - Start all services

# Watch the logs to see when it's ready
docker-compose logs -f

# When you see:
# "glitchtip-web    | Booting worker with pid: XX"
# "glitchtip-web    | Listening at: http://0.0.0.0:8000"
# Press Ctrl+C to stop following logs (containers keep running)
```

### Step 12: Verify Services Are Running

```bash
# Check container status (all should show "Up")
docker-compose ps

# Expected output:
# NAME                  STATUS
# glitchtip-postgres    Up (healthy)
# glitchtip-redis       Up (healthy)
# glitchtip-web         Up (healthy)
# glitchtip-worker      Up

# Test GlitchTip web interface
curl http://localhost:8000/_health/

# Should return: {"healthy": true}
```

### Step 13: Create Admin User

```bash
# Run the Django management command to create a superuser
docker-compose exec glitchtip ./manage.py createsuperuser

# You'll be prompted for:
# - Email address: your.email@example.com
# - Password: (enter a secure password)
# - Password (again): (confirm password)

# Example:
# Email address: admin@lokus.local
# Password: ********
# Password (again): ********
# Superuser created successfully.
```

### Step 14: Access GlitchTip Dashboard

**From Windows:**
1. Open your browser (Chrome, Edge, Firefox)
2. Navigate to: `http://localhost:8000`
3. Click "Log In"
4. Enter the email and password you just created
5. You should see the GlitchTip dashboard!

**From Ubuntu terminal:**
```bash
# This should work if you have a browser in WSL
wslview http://localhost:8000

# Or just open in Windows browser: http://localhost:8000
```

---

## Part 4: Set Up Cloudflare Tunnel (Optional but Recommended)

### Step 15: Login to Cloudflare

**In PowerShell (Admin):**

```powershell
# Authenticate with Cloudflare
cloudflared tunnel login

# This opens a browser window
# Select your domain (lokusmd.com)
# Authorize cloudflared

# You'll see: "You have successfully logged in."
# Credentials saved to: C:\Users\[YourName]\.cloudflared\
```

### Step 16: Create Tunnel

```powershell
# Create a new tunnel named "lokus-crash"
cloudflared tunnel create lokus-crash

# Output will show:
# Created tunnel lokus-crash with id XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
# Credentials file written to: C:\Users\[YourName]\.cloudflared\XXXX.json

# Copy the tunnel ID (you'll need it)
```

### Step 17: Configure DNS

```powershell
# Route crash.lokusmd.com to your tunnel
cloudflared tunnel route dns lokus-crash crash.lokusmd.com

# Output:
# Successfully created route for crash.lokusmd.com

# Verify DNS (may take 1-2 minutes)
nslookup crash.lokusmd.com
```

### Step 18: Get Tunnel Token

```powershell
# Get the tunnel token
cloudflared tunnel token lokus-crash

# This prints a long token like:
# eyJhIjoiNzk4M2U2ZjM4ZGY0NGI3OGE5YjkyNjY4M2VlYjE1MzAiLCJ0IjoiMz...

# Copy this entire token
```

### Step 19: Add Token to Environment

**Switch to Ubuntu terminal:**

```bash
# Open .env file
cd ~/server-projects/lokus/infrastructure
nano .env

# Find the TUNNEL_TOKEN line and paste your token:
TUNNEL_TOKEN=eyJhIjoiNzk4M2U2ZjM4ZGY0NGI3OGE5YjkyNjY4M2VlYjE1MzAiLCJ0IjoiMz...

# Save: Ctrl+X, Y, Enter
```

### Step 20: Restart with Cloudflare Tunnel

```bash
# Stop current containers
docker-compose down

# Start with Cloudflare Tunnel profile
docker-compose --profile cloudflare up -d

# Verify all containers are running (including cloudflared)
docker-compose ps

# You should see 5 containers now:
# - glitchtip-postgres
# - glitchtip-redis
# - glitchtip-web
# - glitchtip-worker
# - glitchtip-cloudflared
```

### Step 21: Test Remote Access

**In Windows browser:**
1. Navigate to: `https://crash.lokusmd.com`
2. You should see the GlitchTip login page!

**From Ubuntu terminal:**
```bash
curl https://crash.lokusmd.com/_health/

# Should return: {"healthy": true}
```

---

## Part 5: Configure Lokus App

### Step 22: Create GlitchTip Project

**In Browser (http://localhost:8000 or https://crash.lokusmd.com):**

1. Click "Create Organization"
   - Name: `Lokus`
   - Click "Create"

2. Click "New Project"
   - Name: `Lokus App`
   - Platform: `JavaScript`
   - Click "Create Project"

3. Copy the DSN
   - You'll see: `https://XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX@crash.lokusmd.com/1`
   - **Copy this entire URL** (this is your DSN)

### Step 23: Add DSN to Lokus App

**If Lokus is on Windows:**

```powershell
# Open File Explorer
# Navigate to your Lokus project folder
# Edit .env.production with Notepad or VS Code

# Add these lines (use the DSN you copied):
VITE_SENTRY_DSN=https://XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX@crash.lokusmd.com/1
TAURI_SENTRY_DSN=https://XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX@crash.lokusmd.com/1
VITE_SENTRY_ENVIRONMENT=production
VITE_ENABLE_CRASH_REPORTS=true

# Save the file
```

**If Lokus is in WSL:**

```bash
cd ~/path/to/lokus-main
nano .env.production

# Add the same lines as above
# Save: Ctrl+X, Y, Enter
```

### Step 24: Test Crash Reporting

```powershell
# In your Lokus project directory:
npm run tauri build

# Run the built app and trigger a test error
# The error should appear in GlitchTip dashboard within 30 seconds
```

---

## Part 6: Auto-Start on Boot

### Step 25: Configure Docker Desktop Auto-Start

1. Open Docker Desktop
2. Click Settings (gear icon)
3. Go to "General"
4. Enable "Start Docker Desktop when you log in"
5. Click "Apply & Restart"

### Step 26: Create Startup Script

**Create batch script to auto-start GlitchTip:**

```powershell
# Create a batch file in your user directory
notepad C:\Users\$env:USERNAME\start-glitchtip.bat
```

**Add this content:**

```batch
@echo off
echo Starting GlitchTip...

REM Wait for Docker to be ready
timeout /t 30 /nobreak

REM Start GlitchTip via WSL
wsl -d Ubuntu -e bash -c "cd ~/server-projects/lokus/infrastructure && docker-compose --profile cloudflare up -d"

echo GlitchTip started!
pause
```

**Save and close.**

### Step 27: Add to Windows Startup

1. Press Win+R
2. Type: `shell:startup`
3. Press Enter (opens Startup folder)
4. Right-click → New → Shortcut
5. Browse to: `C:\Users\[YourName]\start-glitchtip.bat`
6. Click "Next"
7. Name it: "GlitchTip Server"
8. Click "Finish"

**Now GlitchTip will auto-start when Windows boots!**

---

## Part 7: Maintenance & Monitoring

### Daily Operations

**Start GlitchTip (if not auto-started):**

```bash
# In Ubuntu terminal:
cd ~/server-projects/lokus/infrastructure
docker-compose --profile cloudflare up -d
```

**Or from PowerShell:**

```powershell
wsl -d Ubuntu -e bash -c "cd ~/server-projects/lokus/infrastructure && docker-compose --profile cloudflare up -d"
```

**Stop GlitchTip:**

```bash
# In Ubuntu terminal:
cd ~/server-projects/lokus/infrastructure
docker-compose down
```

**View Logs:**

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f glitchtip
docker-compose logs -f postgres
docker-compose logs -f cloudflared
```

**Check Status:**

```bash
docker-compose ps
docker stats  # Live resource usage
```

### Backup Database

```bash
# In Ubuntu terminal:
cd ~/server-projects/lokus/infrastructure

# Make backup script executable
chmod +x backup.sh

# Run backup
./backup.sh

# Backups are saved in: ./backups/
# Files: glitchtip_db_YYYYMMDD_HHMMSS.sql.gz
```

**Set up automatic daily backups with Task Scheduler:**

1. Open Task Scheduler (search in Start)
2. Click "Create Basic Task"
3. Name: "GlitchTip Backup"
4. Trigger: Daily, 2:00 AM
5. Action: Start a program
6. Program: `C:\Windows\System32\wsl.exe`
7. Arguments: `-d Ubuntu -e bash -c "cd ~/server-projects/lokus/infrastructure && ./backup.sh"`
8. Click "Finish"

### Update GlitchTip

```bash
# In Ubuntu terminal:
cd ~/server-projects/lokus/infrastructure

# Pull latest images
docker-compose pull

# Restart with new images
docker-compose --profile cloudflare up -d

# Check logs for any issues
docker-compose logs -f
```

### Monitor Resources

**Windows Task Manager:**
1. Press Ctrl+Shift+Esc
2. Go to "Performance" tab
3. Check CPU, Memory, Disk, Network usage

**From Ubuntu terminal:**

```bash
# Install monitoring tools
sudo apt install htop

# View system resources
htop  # Press q to quit

# View Docker stats
docker stats
```

---

## Part 8: Troubleshooting

### Docker won't start

```powershell
# Check if WSL is running
wsl --list --running

# Start WSL if needed
wsl

# Restart Docker Desktop
# Right-click whale icon → Restart Docker Desktop

# Check Windows Services:
# Win+R → services.msc
# Look for "Docker Desktop Service" - should be "Running"
```

### GlitchTip won't start

```bash
# In Ubuntu terminal:
# Check logs for errors
docker-compose logs glitchtip

# Common issues:
# 1. Port 8000 already in use (check Windows)
netstat -ano | findstr :8000

# 2. Database connection failed
docker-compose logs postgres

# 3. Out of disk space
df -h  # Check WSL disk space
```

### Can't access http://localhost:8000

```powershell
# Check Windows Firewall
# Control Panel → System and Security → Windows Defender Firewall
# → Allow an app through firewall
# Make sure "Docker Desktop Backend" is checked for Private and Public

# Test from PowerShell:
curl http://localhost:8000/_health/

# If it works in PowerShell but not browser, try:
# - Disable browser extensions
# - Try different browser
# - Clear browser cache
```

### Cloudflare Tunnel not working

```bash
# Check cloudflared container (in Ubuntu):
docker-compose logs cloudflared

# Verify tunnel in PowerShell:
cloudflared tunnel list

# Test tunnel
cloudflared tunnel info lokus-crash

# Restart tunnel
docker-compose restart cloudflared

# Check DNS
nslookup crash.lokusmd.com
```

### WSL out of disk space

```powershell
# Check WSL disk usage
wsl -d Ubuntu df -h

# Clean up Docker
wsl -d Ubuntu docker system prune -a

# Compact WSL disk (PowerShell as Admin):
wsl --shutdown
Optimize-VHD -Path "$env:LOCALAPPDATA\Packages\CanonicalGroupLimited.Ubuntu_*\LocalState\ext4.vhdx" -Mode Full
```

### Forgot admin password

```bash
# Reset password via Django command (in Ubuntu):
docker-compose exec glitchtip ./manage.py changepassword admin@lokus.local

# Or create a new superuser
docker-compose exec glitchtip ./manage.py createsuperuser
```

---

## Part 9: Production Checklist

Before going live, verify:

- [ ] WSL2 installed and Ubuntu working
- [ ] Docker Desktop installed and running
- [ ] GlitchTip accessible at http://localhost:8000
- [ ] Cloudflare Tunnel working: https://crash.lokusmd.com
- [ ] Health check passes: `curl https://crash.lokusmd.com/_health/`
- [ ] Admin account created and can log in
- [ ] Organization and project created
- [ ] DSN copied and added to Lokus `.env.production`
- [ ] Backup script tested
- [ ] Auto-start configured (startup script in startup folder)
- [ ] Docker Desktop set to start on login
- [ ] Windows configured to never sleep when plugged in
- [ ] Tested crash reporting from Lokus app
- [ ] Errors appear in GlitchTip dashboard

---

## Quick Reference Commands

**From Ubuntu (WSL) terminal:**

```bash
# Start everything
cd ~/server-projects/lokus/infrastructure
docker-compose --profile cloudflare up -d

# Stop everything
docker-compose down

# View logs
docker-compose logs -f

# Restart a service
docker-compose restart glitchtip

# Check status
docker-compose ps

# Run backup
./backup.sh

# Check health
curl http://localhost:8000/_health/
```

**From PowerShell:**

```powershell
# Start GlitchTip
wsl -d Ubuntu -e bash -c "cd ~/server-projects/lokus/infrastructure && docker-compose --profile cloudflare up -d"

# Stop GlitchTip
wsl -d Ubuntu -e bash -c "cd ~/server-projects/lokus/infrastructure && docker-compose down"

# View status
wsl -d Ubuntu -e docker-compose -f ~/server-projects/lokus/infrastructure/docker-compose.yml ps
```

---

## Cost Breakdown

| Item | Cost |
|------|------|
| Windows PC power (24/7) | ~$150/year |
| Domain (lokusmd.com) | ~$10/year |
| Cloudflare | $0 (free) |
| Docker/GlitchTip | $0 (free) |
| **Total** | **~$160/year** |

Compare to Sentry SaaS: $312/year ($26/month × 12)
**Savings: $150/year!**

---

## Alternative: Install Linux Instead (Recommended for Advanced Users)

If you're comfortable with Linux, consider **dual-booting Ubuntu** on your Windows PC for better performance:

**Benefits:**
- True native Linux (no WSL overhead)
- Better performance (~20% faster)
- Lower power consumption (~$30/year savings)
- Simpler setup (no WSL complexity)

**Drawback:**
- Need to reboot to switch between Windows and Linux

**How to:**
1. Download Ubuntu Desktop: https://ubuntu.com/download/desktop
2. Create bootable USB with Rufus: https://rufus.ie
3. Boot from USB and install Ubuntu alongside Windows
4. Follow the "macOS guide" for setup (Linux commands are the same)

---

## Next Steps

1. ✅ Complete this guide
2. Test crash reporting with Lokus app
3. Set up monitoring and alerts
4. Configure backups to external storage (optional)
5. Document your specific configuration

**Need help?** Check `infrastructure/README.md` or create an issue on GitHub.
