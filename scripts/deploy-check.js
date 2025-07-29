#!/usr/bin/env node

require("dotenv").config()

console.log("🚀 Checking deployment readiness...\n")

const checks = [
  {
    name: "Environment Variables",
    check: () => {
      const databaseType = process.env.DATABASE_TYPE || "postgresql"
      const required = databaseType === "mysql" ? ["MYSQL_URL", "JWT_SECRET"] : ["DATABASE_URL", "JWT_SECRET"]
      const missing = required.filter((env) => !process.env[env])
      return {
        passed: missing.length === 0,
        message: missing.length > 0 ? `Missing: ${missing.join(", ")}` : "All required variables present",
      }
    },
  },
  {
    name: "Database Connection",
    check: async () => {
      try {
        const databaseType = process.env.DATABASE_TYPE || "postgresql"

        if (databaseType === "mysql") {
          const mysql = require("mysql2/promise")
          const client = await mysql.createConnection({
            uri: process.env.DATABASE_URL || process.env.MYSQL_URL,
            ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
          })
          await client.execute("SELECT 1")
          await client.end()
        } else {
          const { Client } = require("pg")
          const client = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
          })
          await client.connect()
          await client.query("SELECT 1")
          await client.end()
        }

        return { passed: true, message: "Database connection successful" }
      } catch (error) {
        return { passed: false, message: `Database connection failed: ${error.message}` }
      }
    },
  },
  {
    name: "Database Schema",
    check: async () => {
      try {
        const databaseType = process.env.DATABASE_TYPE || "postgresql"

        if (databaseType === "mysql") {
          const mysql = require("mysql2/promise")
          const client = await mysql.createConnection({
            uri: process.env.DATABASE_URL || process.env.MYSQL_URL,
            ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
          })

          const [rows] = await client.execute(`
            SELECT table_name FROM information_schema.tables 
            WHERE table_schema = DATABASE() 
            AND table_name IN ('users', 'posts', 'likes', 'friendships', 'comments', 'sessions')
          `)

          await client.end()

          const expectedTables = ["users", "posts", "likes", "friendships", "comments", "sessions"]
          const foundTables = rows.map((row) => row.table_name)
          const missingTables = expectedTables.filter((table) => !foundTables.includes(table))

          return {
            passed: missingTables.length === 0,
            message:
              missingTables.length > 0 ? `Missing tables: ${missingTables.join(", ")}` : "All required tables present",
          }
        } else {
          const { Client } = require("pg")
          const client = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
          })
          await client.connect()

          const { rows } = await client.query(`
            SELECT table_name FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('users', 'posts', 'likes', 'friendships', 'comments', 'sessions')
          `)

          await client.end()

          const expectedTables = ["users", "posts", "likes", "friendships", "comments", "sessions"]
          const foundTables = rows.map((row) => row.table_name)
          const missingTables = expectedTables.filter((table) => !foundTables.includes(table))

          return {
            passed: missingTables.length === 0,
            message:
              missingTables.length > 0 ? `Missing tables: ${missingTables.join(", ")}` : "All required tables present",
          }
        }
      } catch (error) {
        return { passed: false, message: `Schema check failed: ${error.message}` }
      }
    },
  },
  {
    name: "Authentication Setup",
    check: () => {
      const jwtSecret = process.env.JWT_SECRET
      if (!jwtSecret || jwtSecret.length < 32) {
        return {
          passed: false,
          message: "JWT_SECRET must be at least 32 characters long for security",
        }
      }
      return { passed: true, message: "Authentication properly configured" }
    },
  },
  {
    name: "Build Process",
    check: () => {
      try {
        const { execSync } = require("child_process")
        execSync("npm run build", { stdio: "pipe" })
        return { passed: true, message: "Build successful" }
      } catch (error) {
        return { passed: false, message: `Build failed: ${error.message}` }
      }
    },
  },
]

async function runChecks() {
  let allPassed = true

  for (const check of checks) {
    process.stdout.write(`Checking ${check.name}... `)

    try {
      const result = await check.check()
      if (result.passed) {
        console.log(`✅ ${result.message}`)
      } else {
        console.log(`❌ ${result.message}`)
        allPassed = false
      }
    } catch (error) {
      console.log(`❌ ${error.message}`)
      allPassed = false
    }
  }

  console.log("\n" + "=".repeat(50))

  if (allPassed) {
    console.log("🎉 All checks passed! Ready for deployment.")
    console.log("\nDeployment commands:")
    console.log("  Vercel: vercel --prod")
    console.log("  Netlify: netlify deploy --prod")
    console.log("  Railway: railway up")
    console.log("  Heroku: git push heroku main")
  } else {
    console.log("❌ Some checks failed. Please fix the issues above before deploying.")
    process.exit(1)
  }
}

runChecks().catch((error) => {
  console.error("Check process failed:", error)
  process.exit(1)
})
