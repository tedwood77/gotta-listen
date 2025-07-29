import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { dbQuery } from "./database"

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key"
const SESSION_DURATION = Number.parseInt(process.env.SESSION_DURATION || "604800") // 7 days default

export async function hashPassword(password: string): Promise<string> {
  const rounds = Number.parseInt(process.env.BCRYPT_ROUNDS || "12")
  return await bcrypt.hash(password, rounds)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

export async function createSession(userId: number): Promise<string> {
  const sessionToken = jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: `${SESSION_DURATION}s`,
  })

  const expiresAt = new Date(Date.now() + SESSION_DURATION * 1000)
  const databaseType = process.env.DATABASE_TYPE || "postgresql"

  try {
    if (databaseType === "mysql") {
      await dbQuery("INSERT INTO sessions (user_id, session_token, expires_at) VALUES (?, ?, ?)", [
        userId,
        sessionToken,
        expiresAt,
      ])
    } else {
      await dbQuery("INSERT INTO sessions (user_id, session_token, expires_at) VALUES ($1, $2, $3)", [
        userId,
        sessionToken,
        expiresAt,
      ])
    }
  } catch (error) {
    console.error("Error creating session:", error)
    throw new Error("Failed to create session")
  }

  return sessionToken
}

export async function verifySession(sessionToken: string): Promise<{ userId: number } | null> {
  try {
    // Verify JWT token
    const decoded = jwt.verify(sessionToken, JWT_SECRET) as { userId: number }

    // Check if session exists in database and is not expired
    const databaseType = process.env.DATABASE_TYPE || "postgresql"
    let sessionResult

    if (databaseType === "mysql") {
      sessionResult = await dbQuery("SELECT user_id FROM sessions WHERE session_token = ? AND expires_at > NOW()", [
        sessionToken,
      ])
    } else {
      sessionResult = await dbQuery("SELECT user_id FROM sessions WHERE session_token = $1 AND expires_at > NOW()", [
        sessionToken,
      ])
    }

    if (!sessionResult.rows || sessionResult.rows.length === 0) {
      return null
    }

    return { userId: decoded.userId }
  } catch (error) {
    console.error("Session verification error:", error)
    return null
  }
}

export async function deleteSession(sessionToken: string): Promise<void> {
  const databaseType = process.env.DATABASE_TYPE || "postgresql"

  try {
    if (databaseType === "mysql") {
      await dbQuery("DELETE FROM sessions WHERE session_token = ?", [sessionToken])
    } else {
      await dbQuery("DELETE FROM sessions WHERE session_token = $1", [sessionToken])
    }
  } catch (error) {
    console.error("Error deleting session:", error)
  }
}

export async function deleteAllUserSessions(userId: number): Promise<void> {
  const databaseType = process.env.DATABASE_TYPE || "postgresql"

  try {
    if (databaseType === "mysql") {
      await dbQuery("DELETE FROM sessions WHERE user_id = ?", [userId])
    } else {
      await dbQuery("DELETE FROM sessions WHERE user_id = $1", [userId])
    }
  } catch (error) {
    console.error("Error deleting user sessions:", error)
  }
}

export async function extendSession(sessionToken: string): Promise<void> {
  const newExpiresAt = new Date(Date.now() + SESSION_DURATION * 1000)
  const databaseType = process.env.DATABASE_TYPE || "postgresql"

  try {
    if (databaseType === "mysql") {
      await dbQuery("UPDATE sessions SET expires_at = ? WHERE session_token = ?", [newExpiresAt, sessionToken])
    } else {
      await dbQuery("UPDATE sessions SET expires_at = $1 WHERE session_token = $2", [newExpiresAt, sessionToken])
    }
  } catch (error) {
    console.error("Error extending session:", error)
  }
}

export async function cleanupExpiredSessions(): Promise<void> {
  const databaseType = process.env.DATABASE_TYPE || "postgresql"

  try {
    if (databaseType === "mysql") {
      await dbQuery("DELETE FROM sessions WHERE expires_at < NOW()")
    } else {
      await dbQuery("DELETE FROM sessions WHERE expires_at < NOW()")
    }
  } catch (error) {
    console.error("Error cleaning up expired sessions:", error)
  }
}

export async function getCurrentUser(sessionToken: string | undefined) {
  if (!sessionToken) {
    return null
  }

  const session = await verifySession(sessionToken)
  if (!session) {
    return null
  }

  const databaseType = process.env.DATABASE_TYPE || "postgresql"
  let userResult

  try {
    if (databaseType === "mysql") {
      userResult = await dbQuery(
        "SELECT id, email, username, display_name, bio, country, state_region, city, favorite_genres, privacy_settings, created_at FROM users WHERE id = ?",
        [session.userId],
      )
    } else {
      userResult = await dbQuery(
        "SELECT id, email, username, display_name, bio, country, state_region, city, favorite_genres, privacy_settings, created_at FROM users WHERE id = $1",
        [session.userId],
      )
    }

    if (!userResult.rows || userResult.rows.length === 0) {
      return null
    }

    const user = userResult.rows[0]

    // Parse JSON fields for PostgreSQL, MySQL returns them as strings
    if (typeof user.favorite_genres === "string") {
      try {
        user.favorite_genres = JSON.parse(user.favorite_genres)
      } catch (e) {
        user.favorite_genres = []
      }
    }

    if (typeof user.privacy_settings === "string") {
      try {
        user.privacy_settings = JSON.parse(user.privacy_settings)
      } catch (e) {
        user.privacy_settings = {}
      }
    }

    return user
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}
