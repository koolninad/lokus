# GlitchTip Deployment Guide - macOS

Complete step-by-step guide to deploy GlitchTip crash reporting infrastructure on macOS.

## Prerequisites

- Mac with macOS 10.15+ (Intel or Apple Silicon)
- Admin access
- Stable internet connection
- At least 8GB RAM, 20GB free storage

---

## Part 1: Initial Mac Setup (One-Time)

### Step 1: Install Homebrew

```bash
# Install Homebrew (package manager)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Follow the on-screen instructions to add Homebrew to PATH
# For Apple Silicon, you may need to run:
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zshrc
eval "$(/opt/homebrew/bin/brew shellenv)"

# Verify installation
brew --version
```

### Step 2: Install Docker Desktop

```bash
# Install Docker Desktop for Mac
brew install --cask docker

# Or download manually from: https://www.docker.com/products/docker-desktop

# Open Docker Desktop
open -a Docker

# Wait for Docker to start (you'll see the whale icon in menu bar)
# First launch may take 2-3 minutes

# Verify Docker is running
docker --version
docker-compose --version
```

**Configure Docker Desktop:**
1. Open Docker Desktop preferences (whale icon → Preferences)
2. Go to Resources → Advanced
3. Set Memory to at least 4GB (8GB recommended)
4. Set CPUs to at least 2
5. Click "Apply & Restart"

### Step 3: Install Git and Cloudflared

```bash
# Git (if not already installed)
brew install git

# Cloudflared (for Cloudflare Tunnel)
brew install cloudflared

# Verify installations
git --version
cloudflared --version
```

### Step 4: Configure Mac for 24/7 Operation

```bash
# Prevent Mac from sleeping
sudo pmset -a disablesleep 1

# Turn off display after 10 minutes (save power)
sudo pmset -a displaysleep 10

# Prevent disk sleep
sudo pmset -a disksleep 0

# Restart automatically after power failure
sudo pmset -a autorestart 1

# Wake on network access
sudo pmset -a womp 1

# Verify settings
pmset -g
```

**Additional Settings (via System Preferences):**
1. **Energy Saver** → Uncheck "Put hard disks to sleep when possible"
2. **Software Update** → Uncheck "Automatically keep my Mac up to date"
3. **Notifications** → Disable non-critical notifications
4. **Screen Saver** → Set to "Never"

### Step 5: Create Project Directory

```bash
# Create a dedicated directory for server projects
mkdir -p ~/server-projects
cd ~/server-projects

# Clone Lokus repository
git clone https://github.com/lokus-ai/lokus.git
cd lokus/infrastructure

# Or if you already have it locally, just navigate:
cd ~/Programming/Lokud\ Dir/Lokus-Main/infrastructure
```

---

## Part 2: Configure GlitchTip

### Step 6: Create Environment File

```bash
# Copy example environment file
cp .env.example .env

# Open in your preferred editor
nano .env
# Or: open -e .env  (TextEdit)
# Or: code .env     (VS Code)
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
# Option 1: Using Python
python3 -c "import secrets; print(secrets.token_urlsafe(50))"

# Option 2: Using OpenSSL
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

**Save and close the file** (Ctrl+X, then Y, then Enter for nano)

---

## Part 3: Start GlitchTip (Local Access)

### Step 7: Start Docker Containers

```bash
# Make sure you're in the infrastructure directory
cd ~/Programming/Lokud\ Dir/Lokus-Main/infrastructure
# Or: cd ~/server-projects/lokus/infrastructure

# Start GlitchTip (without Cloudflare Tunnel for now)
docker-compose up -d

# This will:
# - Download Docker images (~500MB, takes 2-5 minutes first time)
# - Create containers for PostgreSQL, Redis, GlitchTip
# - Start all services

# Watch the logs to see when it's ready
docker-compose logs -f

# When you see:
# "glitchtip-web    | Booting worker with pid: XX"
# "glitchtip-web    | Listening at: http://0.0.0.0:8000"
# Press Ctrl+C to stop following logs (containers keep running)
```

### Step 8: Verify Services Are Running

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

### Step 9: Create Admin User

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

### Step 10: Access GlitchTip Dashboard

```bash
# Open GlitchTip in your browser
open http://localhost:8000

# Or manually navigate to: http://localhost:8000
```

**In the browser:**
1. Click "Log In"
2. Enter the email and password you just created
3. You should see the GlitchTip dashboard!

---

## Part 4: Set Up Cloudflare Tunnel (Optional but Recommended)

**Why?** This allows you to access GlitchTip remotely at `crash.lokusmd.com` without opening ports or configuring router.

### Step 11: Login to Cloudflare

```bash
# Authenticate with Cloudflare
cloudflared tunnel login

# This opens a browser window
# Select your domain (lokusmd.com)
# Authorize cloudflared

# You'll see: "You have successfully logged in."
```

### Step 12: Create Tunnel

```bash
# Create a new tunnel named "lokus-crash"
cloudflared tunnel create lokus-crash

# Output will show:
# Created tunnel lokus-crash with id XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
# Credentials file written to: /Users/[you]/.cloudflared/XXXX.json

# Save the tunnel ID (you'll need it)
```

### Step 13: Configure DNS

```bash
# Route crash.lokusmd.com to your tunnel
cloudflared tunnel route dns lokus-crash crash.lokusmd.com

# Output:
# Successfully created route for crash.lokusmd.com

# Verify DNS propagation (may take 1-2 minutes)
nslookup crash.lokusmd.com
```

### Step 14: Get Tunnel Token

```bash
# Get the tunnel token
cloudflared tunnel token lokus-crash

# This prints a long token like:
# eyJhIjoiNzk4M2U2ZjM4ZGY0NGI3OGE5YjkyNjY4M2VlYjE1MzAiLCJ0IjoiMz...

# Copy this entire token
```

### Step 15: Add Token to Environment

```bash
# Open .env file
nano .env

# Find the TUNNEL_TOKEN line and paste your token:
TUNNEL_TOKEN=eyJhIjoiNzk4M2U2ZjM4ZGY0NGI3OGE5YjkyNjY4M2VlYjE1MzAiLCJ0IjoiMz...

# Save and close
```

### Step 16: Restart with Cloudflare Tunnel

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

### Step 17: Test Remote Access

```bash
# Test from your Mac
curl https://crash.lokusmd.com/_health/

# Should return: {"healthy": true}

# Open in browser
open https://crash.lokusmd.com

# You should see the GlitchTip login page!
```

---

## Part 5: Configure Lokus App

### Step 18: Create GlitchTip Project

**In GlitchTip Dashboard (http://localhost:8000 or https://crash.lokusmd.com):**

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

### Step 19: Add DSN to Lokus App

```bash
# Navigate to Lokus project
cd ~/Programming/Lokud\ Dir/Lokus-Main

# Edit production environment file
nano .env.production

# Add these lines (use the DSN you copied):
VITE_SENTRY_DSN=https://XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX@crash.lokusmd.com/1
TAURI_SENTRY_DSN=https://XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX@crash.lokusmd.com/1
VITE_SENTRY_ENVIRONMENT=production
VITE_ENABLE_CRASH_REPORTS=true

# Save and close
```

### Step 20: Test Crash Reporting

```bash
# Build Lokus in production mode
npm run tauri build

# Run the built app and trigger a test error
# The error should appear in GlitchTip dashboard within 30 seconds
```

---

## Part 6: Maintenance & Monitoring

### Daily Operations

**Start GlitchTip:**
```bash
cd ~/Programming/Lokud\ Dir/Lokus-Main/infrastructure
docker-compose --profile cloudflare up -d
```

**Stop GlitchTip:**
```bash
cd ~/Programming/Lokud\ Dir/Lokus-Main/infrastructure
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
# Run the backup script
cd ~/Programming/Lokud\ Dir/Lokus-Main/infrastructure
./backup.sh

# Backups are saved in: ./backups/
# Files: glitchtip_db_YYYYMMDD_HHMMSS.sql.gz

# Set up automatic daily backups with cron:
crontab -e

# Add this line (runs daily at 2 AM):
0 2 * * * cd ~/Programming/Lokud\ Dir/Lokus-Main/infrastructure && ./backup.sh
```

### Update GlitchTip

```bash
# Pull latest images
docker-compose pull

# Restart with new images
docker-compose --profile cloudflare up -d

# Check logs for any issues
docker-compose logs -f
```

### Monitor Resources

```bash
# Install monitoring tools
brew install htop glances

# View system resources
htop  # Press q to quit

# View detailed stats
glances  # Press q to quit

# View Docker stats
docker stats
```

---

## Part 7: Troubleshooting

### GlitchTip won't start

```bash
# Check logs for errors
docker-compose logs glitchtip

# Common issues:
# 1. Port 8000 already in use
lsof -i :8000
# Kill the process or change port in docker-compose.yml

# 2. Database connection failed
docker-compose logs postgres
# Check POSTGRES_PASSWORD in .env matches DATABASE_URL

# 3. Out of disk space
df -h
# Clean up Docker: docker system prune -a
```

### Can't access http://localhost:8000

```bash
# Check if container is running
docker-compose ps

# Check if port is listening
lsof -i :8000

# Try restarting
docker-compose restart glitchtip

# Check firewall
# System Preferences → Security & Privacy → Firewall
# Make sure Docker is allowed
```

### Cloudflare Tunnel not working

```bash
# Check cloudflared container
docker-compose logs cloudflared

# Verify tunnel exists
cloudflared tunnel list

# Test tunnel connectivity
cloudflared tunnel info lokus-crash

# Restart tunnel
docker-compose restart cloudflared

# Verify DNS
nslookup crash.lokusmd.com
# Should point to Cloudflare IP
```

### Forgot admin password

```bash
# Reset password via Django command
docker-compose exec glitchtip ./manage.py changepassword admin@lokus.local

# Or create a new superuser
docker-compose exec glitchtip ./manage.py createsuperuser
```

### High memory usage

```bash
# Check which container is using memory
docker stats

# Restart specific container
docker-compose restart glitchtip

# Adjust memory limits in docker-compose.yml:
# Add under glitchtip service:
#   deploy:
#     resources:
#       limits:
#         memory: 1G
```

---

## Part 8: Production Checklist

Before going live, verify:

- [ ] GlitchTip accessible at https://crash.lokusmd.com
- [ ] Health check passes: `curl https://crash.lokusmd.com/_health/`
- [ ] Admin account created and can log in
- [ ] Organization and project created
- [ ] DSN copied and added to Lokus `.env.production`
- [ ] Backup script tested and scheduled (cron)
- [ ] Mac configured to stay awake 24/7
- [ ] Docker set to start on login (Docker Desktop → Preferences → General → "Start Docker Desktop when you log in")
- [ ] Tested crash reporting from Lokus app
- [ ] Errors appear in GlitchTip dashboard

---

## Quick Reference Commands

```bash
# Start everything
cd ~/Programming/Lokud\ Dir/Lokus-Main/infrastructure
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

# Access shell in container
docker-compose exec glitchtip bash

# Check health
curl http://localhost:8000/_health/
```

---

## Cost Breakdown

| Item | Cost |
|------|------|
| Mac power (24/7) | ~$100/year |
| Domain (lokusmd.com) | ~$10/year |
| Cloudflare | $0 (free) |
| Docker/GlitchTip | $0 (free) |
| **Total** | **~$110/year** |

Compare to Sentry SaaS: $312/year (26/month × 12)
**Savings: $200/year!**

---

## Next Steps

1. ✅ Complete this guide
2. Test crash reporting with Lokus app
3. Set up monitoring and alerts
4. Configure backups to external storage (optional)
5. Document your specific configuration for future reference

**Need help?** Check `infrastructure/README.md` or create an issue on GitHub.
