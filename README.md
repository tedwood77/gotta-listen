# 🎵 Gotta Listen

A music-focused social media platform where users share songs worth listening to.

## 🚀 Quick Setup

### 1. Clone and Install
\`\`\`bash
git clone <repository-url>
cd gotta-listen
npm install
\`\`\`

### 2. Configure Environment
\`\`\`bash
npm run setup
\`\`\`
This will create a `.env` file. Update it with your database credentials.

### 3. Setup Database
The setup script automatically creates and migrates your database:
\`\`\`bash
npm run db:setup
\`\`\`

### 4. Start Development
\`\`\`bash
npm run dev
\`\`\`

## 🗄️ Database Support

### PostgreSQL (Default)
\`\`\`env
DATABASE_TYPE="postgresql"
DATABASE_URL="postgresql://username:password@localhost:5432/gotta_listen"
JWT_SECRET="your-super-secret-jwt-key-here-make-it-long-and-random"
\`\`\`

### MySQL
\`\`\`env
DATABASE_TYPE="mysql"
MYSQL_URL="mysql://username:password@localhost:3306/gotta_listen"
JWT_SECRET="your-super-secret-jwt-key-here-make-it-long-and-random"
\`\`\`

### Supabase
\`\`\`env
DATABASE_TYPE="postgresql"
SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
JWT_SECRET="your-super-secret-jwt-key-here-make-it-long-and-random"
\`\`\`

## 🔐 Persistent Authentication

The app now remembers your login status with:
- **Secure JWT tokens** stored in HTTP-only cookies
- **7-day session duration** (configurable)
- **Automatic session cleanup** of expired sessions
- **Cross-device login persistence**
- **Secure password hashing** with bcrypt

## 🚀 Deployment

### Pre-deployment Check
\`\`\`bash
npm run deploy:check
\`\`\`

### Deploy to Vercel
\`\`\`bash
vercel --prod
\`\`\`

### Deploy to Railway
\`\`\`bash
railway up
\`\`\`

### Deploy to Heroku
\`\`\`bash
git push heroku main
\`\`\`

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run setup` - Initial project setup
- `npm run db:setup` - Setup/migrate database
- `npm run deploy:check` - Check deployment readiness

## 🌟 Features

- **Persistent Login**: Stay logged in across browser sessions
- **Multi-Database Support**: PostgreSQL, MySQL, or Supabase
- **Music Sharing**: Support for all major music platforms
- **Social Features**: Friends, comments, likes, and sharing
- **Privacy Controls**: Comprehensive privacy settings
- **Responsive Design**: Works on desktop and mobile
- **Ad Integration**: Google AdSense ready
- **Secure Authentication**: JWT tokens with HTTP-only cookies

## 🔒 Environment Variables

### Required
- `DATABASE_URL` or `MYSQL_URL` - Database connection string
- `DATABASE_TYPE` - "postgresql" or "mysql"
- `JWT_SECRET` - Secret key for JWT tokens (min 32 characters)

### Optional
- `GOOGLE_ADSENSE_CLIENT_ID` - For advertisements
- `SUPABASE_*` - If using Supabase

## 🆘 Troubleshooting

### Authentication Issues
1. Ensure `JWT_SECRET` is set and at least 32 characters long
2. Check that cookies are enabled in your browser
3. Verify database has `sessions` table

### Database Connection Issues
1. Verify your database URL is correct
2. Ensure your database server is running
3. Check firewall settings for remote databases
4. Confirm `DATABASE_TYPE` matches your database

### MySQL Specific
1. Ensure MySQL server is running
2. Check that the database exists
3. Verify user has proper permissions
4. Test connection with MySQL client

## 🎯 Quick Deploy Checklist

- [ ] Clone repository
- [ ] Run `npm run setup`
- [ ] Update `.env` with your database URL and JWT_SECRET
- [ ] Set `DATABASE_TYPE` to "mysql" or "postgresql"
- [ ] Run `npm run deploy:check`
- [ ] Deploy to your platform of choice

## 🔄 Session Management

- **Sessions last 7 days** by default
- **Automatic cleanup** removes expired sessions
- **Secure cookies** prevent XSS attacks
- **Cross-device sync** - login on one device, stay logged in on others
- **Manual logout** clears session immediately

That's it! Your Gotta Listen instance will now remember users across sessions! 🎉
