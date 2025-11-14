# GlitchTip Crash Reporting Infrastructure

Self-hosted crash reporting system for Lokus using GlitchTip (open-source Sentry alternative).

## Overview

This infrastructure deploys GlitchTip locally on a 24/7 PC with optional Cloudflare Tunnel for secure remote access.

**Total Cost**: $0/month (self-hosted)

## Prerequisites

- Docker and Docker Compose installed
- 24/7 PC with:
  - 2GB+ RAM
  - 10GB+ free storage
  - Stable internet connection
- (Optional) Cloudflare account for tunnel access

## Quick Start

### 1. Configure Environment

```bash
cd infrastructure
cp .env.example .env
nano .env  # Edit with your values
```

**Required environment variables:**
- `POSTGRES_PASSWORD` - Strong database password
- `SECRET_KEY` - Random 50-character string

Generate SECRET_KEY:
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(50))"
```

### 2. Start Services

```bash
# Start GlitchTip (local access only)
docker-compose up -d

# Or with Cloudflare Tunnel (remote access)
docker-compose --profile cloudflare up -d
```

### 3. Create Admin User

```bash
docker-compose exec glitchtip ./manage.py createsuperuser
```

### 4. Access Dashboard

- Local: http://localhost:8000
- Remote: https://crash.lokusmd.com (if using Cloudflare Tunnel)

### 5. Create Project

1. Log in to GlitchTip dashboard
2. Create new organization: "Lokus"
3. Create new project: "Lokus App"
4. Copy the DSN from Project Settings

### 6. Configure Lokus

Add DSN to Lokus environment files:

**.env.production:**
```bash
VITE_SENTRY_DSN=https://YOUR_KEY@crash.lokusmd.com/api/YOUR_PROJECT_ID/store/
TAURI_SENTRY_DSN=https://YOUR_KEY@crash.lokusmd.com/api/YOUR_PROJECT_ID/store/
VITE_SENTRY_ENVIRONMENT=production
VITE_ENABLE_CRASH_REPORTS=true
```

## Cloudflare Tunnel Setup

For secure remote access without port forwarding:

### 1. Install cloudflared

```bash
# macOS
brew install cloudflared

# Linux
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /usr/local/bin/cloudflared
chmod +x /usr/local/bin/cloudflared
```

### 2. Authenticate

```bash
cloudflared tunnel login
```

### 3. Create Tunnel

```bash
cloudflared tunnel create lokus-crash
```

This generates a tunnel credentials file.

### 4. Configure DNS

```bash
cloudflared tunnel route dns lokus-crash crash.lokusmd.com
```

### 5. Get Tunnel Token

```bash
cloudflared tunnel token lokus-crash
```

Add token to `.env`:
```bash
TUNNEL_TOKEN=your_tunnel_token_here
```

### 6. Start with Tunnel

```bash
docker-compose --profile cloudflare up -d
```

## Backup & Restore

### Automated Backups

Create backup script:

```bash
chmod +x backup.sh
./backup.sh
```

Schedule with cron:
```bash
crontab -e
# Add: 0 2 * * * /path/to/infrastructure/backup.sh
```

### Manual Backup

```bash
# Backup database
docker-compose exec postgres pg_dump -U glitchtip glitchtip > backup_$(date +%Y%m%d).sql

# Backup uploads
docker cp glitchtip-web:/app/uploads ./uploads_backup
```

### Restore

```bash
# Restore database
docker-compose exec -T postgres psql -U glitchtip glitchtip < backup_20250114.sql

# Restore uploads
docker cp ./uploads_backup glitchtip-web:/app/uploads
```

## Monitoring

### Check Service Status

```bash
docker-compose ps
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f glitchtip
docker-compose logs -f postgres
docker-compose logs -f worker
```

### Health Checks

```bash
# GlitchTip health
curl http://localhost:8000/_health/

# PostgreSQL
docker-compose exec postgres pg_isready -U glitchtip

# Redis
docker-compose exec redis redis-cli ping
```

## Maintenance

### Update GlitchTip

```bash
docker-compose pull
docker-compose up -d
```

### Clean Up Old Data

GlitchTip automatically removes events older than 90 days by default.

To customize retention:
```bash
docker-compose exec glitchtip ./manage.py shell
>>> from glitchtip.settings import GLITCHTIP_MAX_EVENT_LIFE_DAYS
>>> # Configure in environment variables
```

### Database Optimization

```bash
# Vacuum database
docker-compose exec postgres psql -U glitchtip -d glitchtip -c "VACUUM ANALYZE;"
```

## Security

### Best Practices

1. **Strong Passwords**: Use strong, unique passwords for all accounts
2. **Firewall**: If not using Cloudflare Tunnel, configure firewall rules
3. **Updates**: Keep Docker images updated
4. **Backups**: Regular automated backups to external storage
5. **HTTPS**: Use Cloudflare Tunnel or reverse proxy with SSL
6. **User Registration**: Keep ENABLE_OPEN_USER_REGISTRATION=False

### Change Passwords

```bash
# Admin user password
docker-compose exec glitchtip ./manage.py changepassword admin

# Database password
# 1. Update .env
# 2. docker-compose down
# 3. docker-compose up -d
```

## Troubleshooting

### GlitchTip won't start

```bash
# Check logs
docker-compose logs glitchtip

# Common issues:
# - DATABASE_URL incorrect
# - SECRET_KEY not set
# - Port 8000 already in use
```

### Database connection errors

```bash
# Check PostgreSQL
docker-compose logs postgres
docker-compose exec postgres pg_isready -U glitchtip

# Reset database (WARNING: deletes all data)
docker-compose down -v
docker-compose up -d
```

### Cloudflare Tunnel not connecting

```bash
# Check tunnel status
docker-compose logs cloudflared

# Verify token is correct
echo $TUNNEL_TOKEN

# Test without Docker
cloudflared tunnel run --token $TUNNEL_TOKEN lokus-crash
```

### Disk space issues

```bash
# Check Docker disk usage
docker system df

# Clean up unused data
docker system prune -a

# Check volume sizes
docker volume ls -q | xargs docker volume inspect | grep Mountpoint
```

## Performance Tuning

### For High Traffic

Edit `docker-compose.yml`:

```yaml
glitchtip:
  deploy:
    replicas: 2  # Multiple web servers
  environment:
    CELERY_WORKER_AUTOSCALE: "10,3"  # More workers
```

### PostgreSQL Tuning

Create `postgresql.conf` and mount as volume:

```
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
```

## Uninstall

```bash
# Stop and remove containers
docker-compose down

# Remove all data (WARNING: irreversible)
docker-compose down -v
docker volume rm infrastructure_postgres-data infrastructure_redis-data infrastructure_glitchtip-uploads
```

## Support

- **GlitchTip Docs**: https://glitchtip.com/documentation
- **Lokus GitHub**: https://github.com/lokus-ai/lokus
- **Issues**: https://github.com/lokus-ai/lokus/issues

## Architecture Diagram

```
Internet
    │
    ├─► Cloudflare (SSL, DDoS protection)
    │       │
    │       ▼
    │   Cloudflare Tunnel (encrypted)
    │       │
    └───────▼
    GlitchTip Web (Port 8000)
            │
            ├─► PostgreSQL (Database)
            ├─► Redis (Cache)
            └─► GlitchTip Worker (Background tasks)
```

## Cost Breakdown

| Component | Cost |
|-----------|------|
| GlitchTip hosting | $0 (self-hosted) |
| Domain | $0 (subdomain) |
| Cloudflare Tunnel | $0 (free tier) |
| SSL | $0 (Cloudflare) |
| Storage | $0 (local disk) |
| **Total** | **$0/month** |

## Next Steps

1. ✅ Deploy infrastructure
2. ✅ Create admin user
3. ✅ Configure DSN in Lokus
4. Test error reporting
5. Set up automated backups
6. Monitor for issues
7. Scale as needed
