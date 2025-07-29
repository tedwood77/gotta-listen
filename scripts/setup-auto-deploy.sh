#!/bin/bash

# Setup script for automatic deployment system
# Run this once on your server to set up auto-deployment

set -e

echo "🔧 Setting up automatic deployment system..."

# Configuration
APP_DIR="/var/www/gotta-listen"
WEBHOOK_PORT="9000"
WEBHOOK_SECRET=""
GITHUB_REPO=""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Function to generate random secret
generate_secret() {
    openssl rand -hex 32
}

# Function to get user input
get_input() {
    local prompt="$1"
    local var_name="$2"
    local default="$3"
    
    if [ -n "$default" ]; then
        read -p "$prompt [$default]: " input
        if [ -z "$input" ]; then
            input="$default"
        fi
    else
        read -p "$prompt: " input
    fi
    
    eval "$var_name='$input'"
}

# Collect configuration
log_step "Collecting configuration..."

get_input "Enter your GitHub repository URL (https://github.com/username/repo.git)" GITHUB_REPO
get_input "Enter webhook port" WEBHOOK_PORT "9000"

# Generate webhook secret
WEBHOOK_SECRET=$(generate_secret)
log_info "Generated webhook secret: $WEBHOOK_SECRET"

# Create environment file for webhook
log_step "Creating webhook environment file..."

cat > "$APP_DIR/.env.webhook" << EOF
# Webhook Configuration
WEBHOOK_PORT=$WEBHOOK_PORT
WEBHOOK_SECRET=$WEBHOOK_SECRET
NODE_ENV=production
EOF

log_info "Webhook environment file created at $APP_DIR/.env.webhook"

# Make scripts executable
log_step "Making scripts executable..."
chmod +x "$APP_DIR/scripts/auto-deploy.sh"
chmod +x "$APP_DIR/scripts/webhook-server.js"
chmod +x "$APP_DIR/scripts/setup-auto-deploy.sh"

# Create log directory
log_step "Creating log directory..."
sudo mkdir -p /var/log
sudo touch /var/log/gotta-listen-deploy.log
sudo chown $USER:$USER /var/log/gotta-listen-deploy.log

# Create backup directory
log_step "Creating backup directory..."
sudo mkdir -p /var/backups/gotta-listen
sudo chown $USER:$USER /var/backups/gotta-listen

# Setup PM2 for webhook server
log_step "Setting up PM2 for webhook server..."
cd "$APP_DIR"

# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'gotta-listen',
      script: 'npm',
      args: 'start',
      cwd: '$APP_DIR',
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'gotta-listen-webhook',
      script: 'scripts/webhook-server.js',
      cwd: '$APP_DIR',
      env_file: '.env.webhook',
      env: {
        NODE_ENV: 'production'
      },
      error_file: '/var/log/gotta-listen-webhook-error.log',
      out_file: '/var/log/gotta-listen-webhook-out.log',
      log_file: '/var/log/gotta-listen-webhook.log'
    }
  ]
}
EOF

# Start webhook server with PM2
pm2 start ecosystem.config.js
pm2 save

log_info "PM2 processes started and saved"

# Setup firewall rule for webhook port
log_step "Setting up firewall rule..."
if command -v ufw >/dev/null 2>&1; then
    sudo ufw allow $WEBHOOK_PORT/tcp
    log_info "UFW rule added for port $WEBHOOK_PORT"
elif command -v firewall-cmd >/dev/null 2>&1; then
    sudo firewall-cmd --permanent --add-port=$WEBHOOK_PORT/tcp
    sudo firewall-cmd --reload
    log_info "Firewalld rule added for port $WEBHOOK_PORT"
else
    log_warn "No firewall detected. Make sure port $WEBHOOK_PORT is open"
fi

# Setup Nginx proxy for webhook (optional)
log_step "Setting up Nginx proxy for webhook..."

if command -v nginx >/dev/null 2>&1; then
    # Get server IP/domain
    get_input "Enter your server domain/IP for webhook endpoint" SERVER_DOMAIN "$(curl -s ifconfig.me)"
    
    # Create Nginx config for webhook
    sudo tee /etc/nginx/sites-available/gotta-listen-webhook << EOF
server {
    listen 80;
    server_name webhook.$SERVER_DOMAIN;

    location / {
        proxy_pass http://localhost:$WEBHOOK_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Security headers
        proxy_set_header X-Hub-Signature-256 \$http_x_hub_signature_256;
        proxy_set_header X-GitHub-Event \$http_x_github_event;
    }
}
EOF

    # Enable the site
    sudo ln -sf /etc/nginx/sites-available/gotta-listen-webhook /etc/nginx/sites-enabled/
    sudo nginx -t && sudo systemctl reload nginx
    
    WEBHOOK_URL="http://webhook.$SERVER_DOMAIN/webhook"
    log_info "Nginx proxy configured for webhook"
else
    WEBHOOK_URL="http://$(curl -s ifconfig.me):$WEBHOOK_PORT/webhook"
    log_warn "Nginx not found. Using direct port access"
fi

# Create deployment test script
log_step "Creating deployment test script..."

cat > "$APP_DIR/scripts/test-deploy.sh" << 'EOF'
#!/bin/bash

echo "🧪 Testing deployment system..."

# Test webhook server health
echo "Testing webhook server health..."
if curl -f -s http://localhost:9000/health > /dev/null; then
    echo "✅ Webhook server is healthy"
else
    echo "❌ Webhook server is not responding"
    exit 1
fi

# Test deployment script
echo "Testing deployment script..."
if bash /var/www/gotta-listen/scripts/auto-deploy.sh; then
    echo "✅ Deployment script works"
else
    echo "❌ Deployment script failed"
    exit 1
fi

echo "🎉 All tests passed!"
EOF

chmod +x "$APP_DIR/scripts/test-deploy.sh"

# Display final instructions
log_step "Setup complete! Here's what you need to do next:"

echo ""
echo "📋 GITHUB WEBHOOK SETUP:"
echo "1. Go to your GitHub repository: $GITHUB_REPO"
echo "2. Go to Settings > Webhooks > Add webhook"
echo "3. Set Payload URL: $WEBHOOK_URL"
echo "4. Set Content type: application/json"
echo "5. Set Secret: $WEBHOOK_SECRET"
echo "6. Select events: Just the push event"
echo "7. Make sure 'Active' is checked"
echo ""

echo "🔧 TESTING:"
echo "Run: bash $APP_DIR/scripts/test-deploy.sh"
echo ""

echo "📊 MONITORING:"
echo "Webhook logs: pm2 logs gotta-listen-webhook"
echo "App logs: pm2 logs gotta-listen"
echo "Deploy logs: tail -f /var/log/gotta-listen-deploy.log"
echo ""

echo "🚀 USAGE:"
echo "Now when you push to the main branch, your server will automatically:"
echo "1. Pull the latest changes"
echo "2. Install/update dependencies"
echo "3. Run database migrations"
echo "4. Build the application"
echo "5. Restart the app with PM2"
echo "6. Verify the deployment"
echo ""

log_info "🎉 Automatic deployment system is ready!"
log_warn "Don't forget to add the webhook to your GitHub repository!"
