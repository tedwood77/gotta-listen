# 🚀 Simple Server Setup with Vercel Database

This guide shows you how to deploy Gotta Listen to your server using **Vercel's free PostgreSQL database** instead of setting up MySQL locally.

## 📋 Prerequisites

- **Your server** (Ubuntu/CentOS with SSH access)
- **GitHub repository** with your code
- **Vercel account** (free) for database

---

## 🗄️ Step 1: Setup Vercel Database (Free)

### Create Vercel Account & Database
1. **Go to [vercel.com](https://vercel.com)** and sign up (free)
2. **Create new project** → Import from GitHub
3. **Go to Storage tab** → Create Database → PostgreSQL
4. **Copy connection details** (we'll use these later)

### Get Database URLs
After creating the database, you'll get these URLs:
\`\`\`env
POSTGRES_URL="postgres://username:password@host:5432/database"
POSTGRES_PRISMA_URL="postgres://username:password@host:5432/database?pgbouncer=true&connect_timeout=15"
POSTGRES_URL_NON_POOLING="postgres://username:password@host:5432/database"
\`\`\`

---

## 🖥️ Step 2: Prepare Your Server

### Update System
\`\`\`bash
# Connect to your server via SSH
ssh your-username@your-server-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y curl git nginx ufw
\`\`\`

### Install Node.js
\`\`\`bash
# Install Node.js 20 (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
\`\`\`

### Install PM2 (Process Manager)
\`\`\`bash
# Install PM2 globally
sudo npm install -g pm2

# Verify installation
pm2 --version
\`\`\`

### Create Application User
\`\`\`bash
# Create user for the app
sudo useradd -m -s /bin/bash gotta-listen
sudo usermod -aG sudo gotta-listen

# Switch to app user
sudo su - gotta-listen
\`\`\`

---

## 📁 Step 3: Deploy Application Code

### Clone Repository
\`\`\`bash
# Create app directory
sudo mkdir -p /var/www/gotta-listen
sudo chown gotta-listen:gotta-listen /var/www/gotta-listen

# Clone your repository
cd /var/www/gotta-listen
git clone https://github.com/yourusername/gotta-listen.git .

# Make scripts executable
chmod +x scripts/*.sh
\`\`\`

### Install Dependencies
\`\`\`bash
# Install Node.js dependencies
npm install

# Build the application
npm run build
\`\`\`

### Configure Environment
\`\`\`bash
# Copy environment template
cp .env.example .env

# Edit environment file
nano .env
\`\`\`

**Add your database URLs from Vercel:**
\`\`\`env
# Database (from Vercel)
DATABASE_TYPE="postgresql"
POSTGRES_URL="your-vercel-postgres-url"
POSTGRES_PRISMA_URL="your-vercel-postgres-prisma-url"
POSTGRES_URL_NON_POOLING="your-vercel-postgres-non-pooling-url"

# Authentication
JWT_SECRET="your-super-long-secret-key-at-least-32-characters-long"

# Application
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"

# Webhook for auto-deploy
WEBHOOK_SECRET="your-webhook-secret"
WEBHOOK_PORT="9000"
\`\`\`

### Setup Database Schema
\`\`\`bash
# Run database setup (connects to Vercel PostgreSQL)
npm run setup
\`\`\`

---

## 🌐 Step 4: Configure Nginx

### Create Nginx Configuration
\`\`\`bash
sudo nano /etc/nginx/sites-available/gotta-listen
\`\`\`

**Add this configuration:**
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Main application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Webhook endpoint
    location /webhook {
        proxy_pass http://localhost:9000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
