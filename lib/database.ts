let client: any = null

export async function getDbClient() {
  if (!client) {
    const databaseType = process.env.DATABASE_TYPE || "postgresql"

    if (databaseType === "mysql") {
      const mysql = require("mysql2/promise")
      client = await mysql.createConnection({
        uri: process.env.DATABASE_URL || process.env.MYSQL_URL,
        ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
      })
    } else {
      const { Client } = require("pg")
      client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
      })
      await client.connect()
    }
  }
  return client
}

export async function closeDbConnection() {
  if (client) {
    await client.end()
    client = null
  }
}

// Database query helper that works with both MySQL and PostgreSQL
export async function dbQuery(query: string, params: any[] = []) {
  const client = await getDbClient()
  const databaseType = process.env.DATABASE_TYPE || "postgresql"

  if (databaseType === "mysql") {
    const [rows] = await client.execute(query, params)
    return { rows }
  } else {
    return await client.query(query, params)
  }
}

// Health check function
export async function checkDatabaseHealth() {
  try {
    const client = await getDbClient()
    const databaseType = process.env.DATABASE_TYPE || "postgresql"

    if (databaseType === "mysql") {
      await client.execute("SELECT 1")
    } else {
      await client.query("SELECT 1")
    }

    return { healthy: true, message: "Database connection successful" }
  } catch (error) {
    return {
      healthy: false,
      message: `Database connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}
