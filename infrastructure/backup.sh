#!/bin/bash

# GlitchTip Backup Script
# Backs up PostgreSQL database and uploads directory
# Usage: ./backup.sh

set -e  # Exit on error

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-30}
CONTAINER_NAME="glitchtip-postgres"
DB_USER="${POSTGRES_USER:-glitchtip}"
DB_NAME="${POSTGRES_DB:-glitchtip}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo -e "${GREEN}Starting GlitchTip backup...${NC}"

# Check if Docker container is running
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo -e "${RED}Error: PostgreSQL container is not running${NC}"
    exit 1
fi

# Backup database
echo "Backing up PostgreSQL database..."
BACKUP_FILE="$BACKUP_DIR/glitchtip_db_${TIMESTAMP}.sql.gz"

if docker exec "$CONTAINER_NAME" pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "$BACKUP_FILE"; then
    echo -e "${GREEN}Database backup completed: $BACKUP_FILE${NC}"
    DB_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "Backup size: $DB_SIZE"
else
    echo -e "${RED}Database backup failed${NC}"
    exit 1
fi

# Backup uploads directory
echo "Backing up uploads directory..."
UPLOADS_BACKUP="$BACKUP_DIR/glitchtip_uploads_${TIMESTAMP}.tar.gz"

if docker run --rm --volumes-from glitchtip-web -v "$(pwd)/$BACKUP_DIR:/backup" alpine tar czf "/backup/glitchtip_uploads_${TIMESTAMP}.tar.gz" -C /app uploads 2>/dev/null; then
    echo -e "${GREEN}Uploads backup completed: $UPLOADS_BACKUP${NC}"
    UPLOADS_SIZE=$(du -h "$UPLOADS_BACKUP" | cut -f1)
    echo "Backup size: $UPLOADS_SIZE"
else
    echo -e "${YELLOW}Warning: Uploads backup failed (may be empty)${NC}"
fi

# Clean up old backups
echo "Cleaning up old backups (older than $RETENTION_DAYS days)..."
find "$BACKUP_DIR" -name "glitchtip_*.sql.gz" -mtime +"$RETENTION_DAYS" -delete
find "$BACKUP_DIR" -name "glitchtip_*.tar.gz" -mtime +"$RETENTION_DAYS" -delete

REMAINING_BACKUPS=$(ls -1 "$BACKUP_DIR"/*.gz 2>/dev/null | wc -l)
echo "Remaining backups: $REMAINING_BACKUPS"

# Create backup manifest
MANIFEST_FILE="$BACKUP_DIR/backup_${TIMESTAMP}.manifest"
cat > "$MANIFEST_FILE" << EOF
GlitchTip Backup Manifest
========================
Timestamp: $(date)
Database Backup: $BACKUP_FILE
Uploads Backup: $UPLOADS_BACKUP
Database Size: $DB_SIZE
Retention Policy: $RETENTION_DAYS days
EOF

echo -e "${GREEN}Backup manifest created: $MANIFEST_FILE${NC}"

# Optional: Upload to cloud storage (uncomment and configure)
# echo "Uploading to cloud storage..."
# rclone copy "$BACKUP_FILE" remote:glitchtip-backups/
# rclone copy "$UPLOADS_BACKUP" remote:glitchtip-backups/

echo -e "${GREEN}Backup completed successfully!${NC}"
echo "Total backups in $BACKUP_DIR: $REMAINING_BACKUPS"
