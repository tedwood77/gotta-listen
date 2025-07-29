#!/usr/bin/env node

const fs = require("fs")
const path = require("path")

require("dotenv").config()

async function setupDatabase() {
  console.log("🗄️  Setting up database...")

  const databaseType = process.env.DATABASE_TYPE || "postgresql"
  const databaseUrl = process.env.DATABASE_URL || process.env.MYSQL_URL

  if (!databaseUrl) {
    throw new Error("DATABASE_URL or MYSQL_URL environment variable is required")
  }

  let client

  if (databaseType === "mysql") {
    const mysql = require("mysql2/promise")
    client = await mysql.createConnection({
      uri: databaseUrl,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    })
    console.log("✅ Connected to MySQL database")
  } else {
    const { Client } = require("pg")
    client = new Client({
      connectionString: databaseUrl,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    })
    await client.connect()
    console.log("✅ Connected to PostgreSQL database")
  }

  try {
    // Check if database is already set up
    let tableExists
    if (databaseType === "mysql") {
      const [rows] = await client.execute(`
        SELECT COUNT(*) as count FROM information_schema.tables 
        WHERE table_schema = DATABASE() AND table_name = 'users'
      `)
      tableExists = rows[0].count > 0
    } else {
      const { rows } = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'users'
        );
      `)
      tableExists = rows[0].exists
    }

    if (tableExists) {
      console.log("✅ Database already set up, checking for updates...")
      await runMigrations(client, databaseType)
    } else {
      console.log("🔧 Setting up database schema...")
      await runInitialSetup(client, databaseType)
      await runMigrations(client, databaseType)
      console.log("✅ Database schema created")
    }
  } catch (error) {
    console.error("❌ Database setup failed:", error.message)
    throw error
  } finally {
    if (databaseType === "mysql") {
      await client.end()
    } else {
      await client.end()
    }
  }
}

async function runInitialSetup(client, databaseType) {
  const schemaFile = databaseType === "mysql" ? "001-initial-schema-mysql.sql" : "001-initial-schema.sql"
  const schemaPath = path.join(__dirname, "..", "scripts", schemaFile)
  const schema = fs.readFileSync(schemaPath, "utf8")

  if (databaseType === "mysql") {
    // Split MySQL statements and execute them one by one
    const statements = schema
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0)

    for (const statement of statements) {
      await client.execute(statement)
    }
  } else {
    await client.query(schema)
  }

  console.log("✅ Initial schema applied")
}

async function runMigrations(client, databaseType) {
  // Create migrations table if it doesn't exist
  if (databaseType === "mysql") {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
  } else {
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `)
  }

  // Get list of migration files
  const migrationsDir = path.join(__dirname, "..", "scripts")
  const migrationFiles = fs
    .readdirSync(migrationsDir)
    .filter((file) => {
      if (databaseType === "mysql") {
        return file.endsWith("-mysql.sql") && file !== "001-initial-schema-mysql.sql"
      } else {
        return file.endsWith(".sql") && !file.includes("mysql") && file !== "001-initial-schema.sql"
      }
    })
    .sort()

  for (const file of migrationFiles) {
    // Check if migration has already been applied
    let rows
    if (databaseType === "mysql") {
      ;[rows] = await client.execute("SELECT id FROM migrations WHERE filename = ?", [file])
    } else {
      const result = await client.query("SELECT id FROM migrations WHERE filename = $1", [file])
      rows = result.rows
    }

    if (rows.length === 0) {
      console.log(`🔄 Applying migration: ${file}`)
      const migrationPath = path.join(migrationsDir, file)
      const migration = fs.readFileSync(migrationPath, "utf8")

      try {
        if (databaseType === "mysql") {
          await client.beginTransaction()
          const statements = migration
            .split(";")
            .map((stmt) => stmt.trim())
            .filter((stmt) => stmt.length > 0)

          for (const statement of statements) {
            await client.execute(statement)
          }
          await client.execute("INSERT INTO migrations (filename) VALUES (?)", [file])
          await client.commit()
        } else {
          await client.query("BEGIN")
          await client.query(migration)
          await client.query("INSERT INTO migrations (filename) VALUES ($1)", [file])
          await client.query("COMMIT")
        }
        console.log(`✅ Applied migration: ${file}`)
      } catch (error) {
        if (databaseType === "mysql") {
          await client.rollback()
        } else {
          await client.query("ROLLBACK")
        }
        throw new Error(`Failed to apply migration ${file}: ${error.message}`)
      }
    }
  }
}

if (require.main === module) {
  setupDatabase().catch((error) => {
    console.error("Database setup failed:", error)
    process.exit(1)
  })
}

module.exports = { setupDatabase }
