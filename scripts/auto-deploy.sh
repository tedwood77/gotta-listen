#!/bin/bash

# Auto-deployment script for Gotta Listen
# This script pulls latest changes and redeploys the application

set -e  # Exit on any error

# Configuration
APP_DIR="/var/www/gotta-listen"
BACKUP_DIR="/var/backups/gotta-listen"
LOG_FILE="/var/log/gotta-listen-deploy.log"
BRANCH="main"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] SUCCESS:${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a "$LOG_FILE"
}

# Create backup
create_backup() {
    log "Creating backup..."
    
    # Create backup directory with timestamp
    BACKUP_PATH="$BACKUP_DIR/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_PATH"
    
    # Backup current application (excluding node_modules and .git)
    tar -czf "$BACKUP_PATH/app.tar.gz" -C "$APP_DIR" . \
        --exclude=node_modules \
        --exclude=.git \
        --exclude=.next \
        --exclude=*.log
    
    # Keep only last 5 backups
    cd "$BACKUP_DIR"
    ls -t | tail -n +6 | xargs -r rm -rf
    
    success "Backup created at $BACKUP_PATH"
}

# Pull latest changes
pull_changes() {
    log "Pulling latest changes from $BRANCH branch..."
    
    cd "$APP_DIR"
    
    # Stash any local changes
    git stash push -m "Auto-stash before deployment $(date)"
    
    # Pull latest changes
    git fetch origin
    git reset --hard origin/$BRANCH
    
    success "Successfully pulled latest changes"
}

# Install/update dependencies
update_dependencies() {
    log "Checking for dependency updates..."
    
    cd "$APP_DIR"
    
    # Check if package.json changed
    if git diff HEAD~1 HEAD --name-only | grep -q "package.json\|package-lock.json"; then
        log "Package files changed, updating dependencies..."
        npm ci --production
        success "Dependencies updated"
    else
        log "No dependency changes detected"
    fi
}

# Build application
build_application() {
    log "Building application..."
    
    cd "$APP_DIR"
    
    # Build the Next.js application
    npm run build
    
    success "Application built successfully"
}

# Run database migrations (if any)
run_migrations() {
    log "Checking for database migrations..."
    
    cd "$APP_DIR"
    
    # Check if there are new SQL files
    if git diff HEAD~1 HEAD --name-only | grep -q "scripts/.*\.sql"; then
        log "New database migrations detected, running setup..."
        npm run setup
        success "Database migrations completed"
    else
        log "No new database migrations"
    fi
}

# Restart application
restart_application() {
    log "Restarting application..."
    
    # Restart the main application
    pm2 restart gotta-listen
    
    # Wait for application to start
    sleep 5
    
    # Check if application is running
    if pm2 list | grep -q "gotta-listen.*online"; then
        success "Application restarted successfully"
    else
        error "Application failed to start"
        return 1
    fi
}

# Health check
health_check() {
    log "Performing health check..."
    
    # Wait a bit for the application to fully start
    sleep 10
    
    # Check if the application responds
    if curl -f -s http://localhost:3000/api/health > /dev/null; then
        success "Health check passed"
        return 0
    else
        error "Health check failed"
        return 1
    fi
}

# Rollback function
rollback() {
    error "Deployment failed, initiating rollback..."
    
    # Get the latest backup
    LATEST_BACKUP=$(ls -t "$BACKUP_DIR" | head -n 1)
    
    if [ -n "$LATEST_BACKUP" ]; then
        log "Rolling back to backup: $LATEST_BACKUP"
        
        cd "$APP_DIR"
        
        # Extract backup
        tar -xzf "$BACKUP_DIR/$LATEST_BACKUP/app.tar.gz" -C .
        
        # Restart application
        pm2 restart gotta-listen
        
        warning "Rollback completed"
    else
        error "No backup found for rollback"
    fi
}

# Main deployment function
deploy() {
    log "Starting deployment process..."
    
    # Create backup before deployment
    create_backup
    
    # Pull latest changes
    if ! pull_changes; then
        error "Failed to pull changes"
        exit 1
    fi
    
    # Update dependencies if needed
    if ! update_dependencies; then
        error "Failed to update dependencies"
        rollback
        exit 1
    fi
    
    # Build application
    if ! build_application; then
        error "Failed to build application"
        rollback
        exit 1
    fi
    
    # Run database migrations if needed
    if ! run_migrations; then
        error "Failed to run database migrations"
        rollback
        exit 1
    fi
    
    # Restart application
    if ! restart_application; then
        error "Failed to restart application"
        rollback
        exit 1
    fi
    
    # Perform health check
    if ! health_check; then
        error "Health check failed"
        rollback
        exit 1
    fi
    
    success "Deployment completed successfully!"
    
    # Send notification (if configured)
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data '{"text":"🚀 Gotta Listen deployed successfully!"}' \
            "$SLACK_WEBHOOK_URL"
    fi
}

# Check if running as the correct user
if [ "$USER" != "gotta-listen" ] && [ "$USER" != "root" ]; then
    error "This script should be run as the gotta-listen user or root"
    exit 1
fi

# Create necessary directories
mkdir -p "$BACKUP_DIR"
mkdir -p "$(dirname "$LOG_FILE")"

# Ensure log file exists and is writable
touch "$LOG_FILE"
chmod 664 "$LOG_FILE"

# Run deployment
deploy

log "Deployment script completed"
