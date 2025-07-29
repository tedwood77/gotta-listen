# 🚀 Server Deployment Guide

Simple guide to deploy Gotta Listen to your server with your own database.

## 📋 Prerequisites

- **Your server** (Ubuntu/CentOS with SSH access)
- **Your database** (MySQL or PostgreSQL)
- **Domain name** (optional, can use IP address)

---

## 🖥️ Step 1: Prepare Your Server

### Connect and Update
\`\`\`bash
# Connect to your server
ssh your-username@your-server-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y curl git nginx
\`\`\`

### Install Node.js
\`\`\`bash
# Install Node.js 20 (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x
\`\`\`

### Install PM2 (Process Manager)
\`\`\`bash
# Install PM2 globally
sudo npm install -g pm2

# Verify installation
pm2 --version
\`\`\`

---

## 🗄️ Step 2: Setup Your Database

### For MySQL:
\`\`\`bash
# Install MySQL
sudo apt install -y mysql-server

# Secure installation
sudo mysql_secure_installation

# Create database and user
sudo mysql -u root -p
\`\`\`

\`\`\`sql
-- In MySQL prompt:
CREATE DATABASE gotta_listen;
CREATE USER 'gotta_listen_user'@'localhost' IDENTIFIED BY 'your_strong_password';
GRANT ALL PRIVILEGES ON gotta_listen.* TO 'gotta_listen_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
\`\`\`

### For PostgreSQL:
\`\`\`bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
\`\`\`

\`\`\`sql
-- In PostgreSQL prompt:
CREATE DATABASE gotta_listen;
CREATE USER gotta_listen_user WITH PASSWORD 'your_strong_password';
GRANT ALL PRIVILEGES ON DATABASE gotta_listen TO gotta_listen_user;
\q
\`\`\`

---

## 📁 Step 3: Deploy Application

### Create Application Directory
\`\`\`bash
# Create app directory
sudo mkdir -p /var/www/gotta-listen
sudo chown $USER:$USER /var/www/gotta-listen

# Navigate to directory
cd /var/www/gotta-listen
\`\`\`

### Upload Your Files
Choose one method:

**Method A: Git Clone (if you have a repository)**
\`\`\`bash
git clone https://github.com/yourusername/gotta-listen.git .
\`\`\`

**Method B: SCP Upload (from your local machine)**
\`\`\`bash
# From your local machine:
scp -r /path/to/your/gotta-listen/* your-username@your-server-ip:/var/www/gotta-listen/
\`\`\`

**Method C: Manual Upload via FTP/SFTP**
- Use FileZilla, WinSCP, or similar
- Upload all files to `/var/www/gotta-listen/`

### Install Dependencies
\`\`\`bash
# Make sure you're in the app directory
cd /var/www/gotta-listen

# Install Node.js dependencies
npm install

# Build the application
npm run build
\`\`\`

---

## ⚙️ Step 4: Configure Application

### Setup Environment Variables
\`\`\`bash
# Copy environment template
cp .env.example .env

# Edit environment file
nano .env
\`\`\`

**Configure your .env file:**

For MySQL:
\`\`\`env
DATABASE_TYPE="mysql"
MYSQL_URL="mysql://gotta_listen_user:your_strong_password@localhost:3306/gotta_listen"
MYSQL_HOST="localhost"
MYSQL_USER="gotta_listen_user"
MYSQL_PASSWORD="your_strong_password"
MYSQL_DATABASE="gotta_listen"

JWT_SECRET="your-super-long-secret-key-at-least-32-characters-long"
NEXTAUTH_SECRET="another-long-secret-key"
NEXTAUTH_URL="https://yourdomain.com"
NODE_ENV="production"
\`\`\`

For PostgreSQL:
\`\`\`env
DATABASE_TYPE="postgresql"
POSTGRES_URL="postgresql://gotta_listen_user:your_strong_password@localhost:5432/gotta_listen"
POSTGRES_HOST="localhost"
POSTGRES_USER="gotta_listen_user" 
POSTGRES_PASSWORD="your_strong_password"
POSTGRES_DATABASE="gotta_listen"

JWT_SECRET="your-super-long-secret-key-at-least-32-characters-long"
NEXTAUTH_SECRET="another-long-secret-key"
NEXTAUTH_URL="https://yourdomain.com"
NODE_ENV="production"
\`\`\`

### Initialize Database
\`\`\`bash
# Run database setup
npm run setup
\`\`\`

---

## 🌐 Step 5: Configure Nginx

### Create Nginx Configuration
\`\`\`bash
sudo nano /etc/nginx/sites-available/gotta-listen
\`\`\`

**Add this configuration:**
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;  # Change to your domain or IP

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
        
        # Security headers for AdSense
        proxy_set_header X-Content-Type-Options nosniff;
        proxy_set_header X-Frame-Options SAMEORIGIN;
        proxy_set_header X-XSS-Protection "1; mode=block";
    }
    
    # Static files optimization
    location /_next/static {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
