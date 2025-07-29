#!/usr/bin/env node

const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")

console.log("🎵 Setting up Gotta Listen...\n")

// Check if .env file exists
if (!fs.existsSync(".env")) {
  console.log("📝 Creating .env file from .env.example...")
  fs.copyFileSync(".env.example", ".env")
  console.log("✅ .env file created! Please update it with your configuration.\n")

  console.log("🔧 Required environment variables:")
  console.log("- DATABASE_URL: Your PostgreSQL connection string")
  console.log("- SUPABASE_URL & SUPABASE_ANON_KEY: If using Supabase")
  console.log("- GOOGLE_ADSENSE_CLIENT_ID: For ads (optional)\n")

  console.log('⚠️  Please update your .env file and run "npm run setup" again.')
  process.exit(0)
}

// Load environment variables
require("dotenv").config()

// Check required environment variables
const requiredEnvVars = ["DATABASE_URL"]
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar])

if (missingEnvVars.length > 0) {
  console.error("❌ Missing required environment variables:")
  missingEnvVars.forEach((envVar) => console.error(`   - ${envVar}`))
  console.error("\nPlease update your .env file and try again.")
  process.exit(1)
}

console.log("✅ Environment variables configured")

// Install dependencies if needed
if (!fs.existsSync("node_modules")) {
  console.log("📦 Installing dependencies...")
  execSync("npm install", { stdio: "inherit" })
  console.log("✅ Dependencies installed")
}

// Setup database
console.log("🗄️  Setting up database...")
try {
  execSync("npm run db:setup", { stdio: "inherit" })
  console.log("✅ Database setup complete")
} catch (error) {
  console.error("❌ Database setup failed:", error.message)
  process.exit(1)
}

console.log("\n🎉 Setup complete! You can now run:")
console.log("   npm run dev     - Start development server")
console.log("   npm run build   - Build for production")
console.log("   npm start       - Start production server")
