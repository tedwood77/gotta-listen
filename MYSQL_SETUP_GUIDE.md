# 🗄️ MySQL Setup Guide for Gotta Listen

This guide will help you set up MySQL on your server and configure Gotta Listen to work with it.

## 📋 Prerequisites

- Server with root/sudo access
- Domain name pointing to your server (optional but recommended)
- Basic command line knowledge

## 🔧 Step 1: Install MySQL Server

### On Ubuntu/Debian:
\`\`\`bash
# Update package list
sudo apt update

# Install MySQL Server
sudo apt install mysql-server -y

# Start MySQL service
sudo systemctl start mysql
sudo systemctl enable mysql

# Check if MySQL is running
sudo systemctl status mysql
\`\`\`

### On CentOS/RHEL/Rocky Linux:
\`\`\`bash
# Install MySQL repository
sudo dnf install mysql-server -y

# Start MySQL service
sudo systemctl start mysqld
sudo systemctl enable mysqld

# Check if MySQL is running
sudo systemctl status mysqld
\`\`\`

## 🔐 Step 2: Secure MySQL Installation

\`\`\`bash
# Run MySQL security script
sudo mysql_secure_installation
\`\`\`

**Follow the prompts:**
- Set root password: **YES** (choose a strong password)
- Remove anonymous users: **YES**
- Disallow root login remotely: **YES** (for security)
- Remove test database: **YES**
- Reload privilege tables: **YES**

## 🗃️ Step 3: Create Database and User

\`\`\`bash
# Login to MySQL as root
sudo mysql -u root -p
\`\`\`

**In MySQL console, run these commands:**
\`\`\`sql
-- Create database
CREATE DATABASE gotta_listen CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user (replace 'your_password' with a strong password)
CREATE USER 'gotta_listen_user'@'localhost' IDENTIFIED BY 'your_strong_password_here';

-- Grant privileges
GRANT ALL PRIVILEGES ON gotta_listen.* TO 'gotta_listen_user'@'localhost';

-- If you need remote access (replace 'your_server_ip' with actual IP)
CREATE USER 'gotta_listen_user'@'%' IDENTIFIED BY 'your_strong_password_here';
GRANT ALL PRIVILEGES ON gotta_listen.* TO 'gotta_listen_user'@'%';

-- Flush privileges
FLUSH PRIVILEGES;

-- Exit MySQL
EXIT;
\`\`\`

## 📁 Step 4: Upload Files to Server

### Using SCP (from your local machine):
\`\`\`bash
# Upload the entire project
scp -r /path/to/gotta-listen user@your-server-ip:/var/www/

# Or using rsync
rsync -avz /path/to/gotta-listen/ user@your-server-ip:/var/www/gotta-listen/
\`\`\`

### Using FTP/SFTP:
1. Use FileZilla, WinSCP, or similar
2. Upload all files to `/var/www/gotta-listen/` (or your preferred directory)

### Using Git (recommended):
\`\`\`bash
# On your server
cd /var/www/
git clone https://github.com/yourusername/gotta-listen.git
cd gotta-listen
\`\`\`

## 🔧 Step 5: Install Node.js and Dependencies

### Install Node.js (using NodeSource):
\`\`\`bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
\`\`\`

### Install Project Dependencies:
\`\`\`bash
cd /var/www/gotta-listen
npm install
\`\`\`

## ⚙️ Step 6: Configure Environment Variables

\`\`\`bash
# Copy environment template
cp .env.example .env

# Edit environment file
nano .env
\`\`\`

**Configure your .env file:**
\`\`\`env
# Database Configuration
DATABASE_TYPE="mysql"
MYSQL_URL="mysql://gotta_listen_user:your_strong_password_here@localhost:3306/gotta_listen"

# Authentication (IMPORTANT: Generate a strong secret)
JWT_SECRET="your-super-secret-jwt-key-here-make-it-at-least-32-characters-long"

# App Configuration
NODE_ENV="production"
NEXTAUTH_URL="https://yourdomain.com"

# Optional: Google AdSense
GOOGLE_ADSENSE_CLIENT_ID="ca-pub-XXXXXXXXXX"
\`\`\`

**⚠️ IMPORTANT: Generate a strong JWT_SECRET:**
\`\`\`bash
# Generate a random 64-character secret
openssl rand -hex 32
\`\`\`

## 🗄️ Step 7: Setup Database Schema

\`\`\`bash
# Run the setup script
npm run setup
\`\`\`

This will:
- Create all necessary tables
- Set up indexes
- Apply migrations
- Verify everything is working

## 🏗️ Step 8: Build the Application

\`\`\`bash
# Build for production
npm run build

# Test the build
npm start
\`\`\`

## 🌐 Step 9: Configure Web Server (Nginx)

### Install Nginx:
\`\`\`bash
sudo apt install nginx -y
\`\`\`

### Create Nginx configuration:
\`\`\`bash
sudo nano /etc/nginx/sites-available/gotta-listen
\`\`\`

**Add this configuration:**
\`\`\`nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

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
}
\`\`\`

### Enable the site:
\`\`\`bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/gotta-listen /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
\`\`\`

## 🔒 Step 10: Setup SSL with Let's Encrypt (Optional but Recommended)

\`\`\`bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
\`\`\`

## 🚀 Step 11: Setup Process Manager (PM2)

\`\`\`bash
# Install PM2 globally
sudo npm install -g pm2

# Start the application with PM2
cd /var/www/gotta-listen
pm2 start npm --name "gotta-listen" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the instructions shown
\`\`\`

## 🔍 Step 12: Verify Everything Works

### Check MySQL Connection:
\`\`\`bash
mysql -u gotta_listen_user -p gotta_listen
SHOW TABLES;
EXIT;
\`\`\`

### Check Application Health:
\`\`\`bash
# Check if app is running
pm2 status

# Check logs
pm2 logs gotta-listen

# Check database health endpoint
curl http://localhost:3000/api/health
\`\`\`

### Test in Browser:
1. Visit `https://yourdomain.com`
2. Try creating an account
3. Test login/logout functionality
4. Verify sessions persist after browser restart

## 🛠️ Troubleshooting

### MySQL Connection Issues:
\`\`\`bash
# Check MySQL status
sudo systemctl status mysql

# Check MySQL error logs
sudo tail -f /var/log/mysql/error.log

# Test connection
mysql -u gotta_listen_user -p -h localhost gotta_listen
\`\`\`

### Application Issues:
\`\`\`bash
# Check PM2 logs
pm2 logs gotta-listen

# Restart application
pm2 restart gotta-listen

# Check environment variables
pm2 env 0
\`\`\`

### Nginx Issues:
\`\`\`bash
# Check Nginx status
sudo systemctl status nginx

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Test Nginx configuration
sudo nginx -t
\`\`\`

## 🔧 MySQL Configuration Optimization

### For better performance, edit MySQL config:
\`\`\`bash
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
\`\`\`

**Add these optimizations:**
\`\`\`ini
[mysqld]
# Connection settings
max_connections = 200
connect_timeout = 60
wait_timeout = 120

# Buffer settings
innodb_buffer_pool_size = 256M
innodb_log_file_size = 64M
innodb_flush_log_at_trx_commit = 2

# Character set
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci

# Enable slow query log
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 2
\`\`\`

**Restart MySQL:**
\`\`\`bash
sudo systemctl restart mysql
\`\`\`

## 📊 Monitoring and Maintenance

### Setup Log Rotation:
\`\`\`bash
# PM2 log rotation
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
\`\`\`

### Regular Maintenance:
\`\`\`bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Node.js dependencies
cd /var/www/gotta-listen
npm update

# Restart application
pm2 restart gotta-listen
\`\`\`

## 🎉 You're Done!

Your Gotta Listen application should now be running with:
- ✅ **Long-lasting sessions** (users stay logged in for up to 1 year)
- ✅ **MySQL database** with optimized configuration
- ✅ **SSL encryption** (if you set up Let's Encrypt)
- ✅ **Process management** with PM2
- ✅ **Reverse proxy** with Nginx
- ✅ **Automatic startup** on server reboot

## 📞 Need Help?

If you encounter issues:
1. Check the troubleshooting section above
2. Run `npm run deploy:check` to verify configuration
3. Check PM2 logs: `pm2 logs gotta-listen`
4. Check MySQL logs: `sudo tail -f /var/log/mysql/error.log`

Your users will now stay logged in across browser sessions and device restarts! 🎵
\`\`\`
