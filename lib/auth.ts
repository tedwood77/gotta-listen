import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"
import { dbQuery } from "./database"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
const SESSION_DURATION = 365 * 24 * 60 * 60 * 1000 // 1 year in milliseconds
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60 // 1 year in seconds

export interface User {
  id: string
  email: string
  username: string
  display_name: string
  bio?: string
  avatar_url?: string
  country?: string
  state_region?: string
  city?: string
  favorite_genres?: string[]
  privacy_settings?: any
  created_at: string
  updated_at: string
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "365d" }) // 1 year
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string }
  } catch {
    return null
  }
}

export async function createSession(userId: string): Promise<string> {
  const sessionToken = generateToken(userId)
  const expiresAt = new Date(Date.now() + SESSION_DURATION)

  const databaseType = process.env.DATABASE_TYPE || "postgresql"

  try {
    if (databaseType === "mysql") {
      // First, delete any existing sessions for this user to prevent duplicates
      await dbQuery("DELETE FROM sessions WHERE user_id = ?", [userId])

      // Insert new session
      await dbQuery("INSERT INTO sessions (user_id, session_token, expires_at) VALUES (?, ?, ?)", [
        userId,
        sessionToken,
        expiresAt,
      ])
    } else {
      await dbQuery(
        "INSERT INTO sessions (user_id, session_token, expires_at) VALUES ($1, $2, $3) ON CONFLICT (session_token) DO UPDATE SET expires_at = EXCLUDED.expires_at",
        [userId, sessionToken, expiresAt],
      )
    }
  } catch (error) {
    console.error("Error creating session:", error)
    throw error
  }

  return sessionToken
}

export async function getSessionUser(sessionToken: string): Promise<User | null> {
  try {
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

    const userId = sessionResult.rows[0].user_id

    let userResult
    if (databaseType === "mysql") {
      userResult = await dbQuery("SELECT * FROM users WHERE id = ?", [userId])
    } else {
      userResult = await dbQuery("SELECT * FROM users WHERE id = $1", [userId])
    }

    if (!userResult.rows || userResult.rows.length === 0) {
      return null
    }

    const user = userResult.rows[0]

    // Parse JSON fields for MySQL
    if (databaseType === "mysql") {
      if (user.favorite_genres && typeof user.favorite_genres === "string") {
        user.favorite_genres = JSON.parse(user.favorite_genres)
      }
      if (user.privacy_settings && typeof user.privacy_settings === "string") {
        user.privacy_settings = JSON.parse(user.privacy_settings)
      }
    }

    return user
  } catch (error) {
    console.error("Error getting session user:", error)
    return null
  }
}

export async function deleteSession(sessionToken: string): Promise<void> {
  try {
    const databaseType = process.env.DATABASE_TYPE || "postgresql"

    if (databaseType === "mysql") {
      await dbQuery("DELETE FROM sessions WHERE session_token = ?", [sessionToken])
    } else {
      await dbQuery("DELETE FROM sessions WHERE session_token = $1", [sessionToken])
    }
  } catch (error) {
    console.error("Error deleting session:", error)
  }
}

export async function deleteAllUserSessions(userId: string): Promise<void> {
  try {
    const databaseType = process.env.DATABASE_TYPE || "postgresql"

    if (databaseType === "mysql") {
      await dbQuery("DELETE FROM sessions WHERE user_id = ?", [userId])
    } else {
      await dbQuery("DELETE FROM sessions WHERE user_id = $1", [userId])
    }
  } catch (error) {
    console.error("Error deleting user sessions:", error)
  }
}

export async function getUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("gotta_listen_session")?.value

    if (!sessionToken) {
      return null
    }

    return await getSessionUser(sessionToken)
  } catch (error) {
    console.error("Error getting user:", error)
    return null
  }
}

export async function getUserProfile(userId: string): Promise<User | null> {
  try {
    const databaseType = process.env.DATABASE_TYPE || "postgresql"

    let result
    if (databaseType === "mysql") {
      result = await dbQuery("SELECT * FROM users WHERE id = ?", [userId])
    } else {
      result = await dbQuery("SELECT * FROM users WHERE id = $1", [userId])
    }

    if (!result.rows || result.rows.length === 0) {
      return null
    }

    const user = result.rows[0]

    // Parse JSON fields for MySQL
    if (databaseType === "mysql") {
      if (user.favorite_genres && typeof user.favorite_genres === "string") {
        user.favorite_genres = JSON.parse(user.favorite_genres)
      }
      if (user.privacy_settings && typeof user.privacy_settings === "string") {
        user.privacy_settings = JSON.parse(user.privacy_settings)
      }
    }

    return user
  } catch (error) {
    console.error("Error getting user profile:", error)
    return null
  }
}

// Clean up expired sessions (run periodically)
export async function cleanupExpiredSessions(): Promise<void> {
  try {
    const databaseType = process.env.DATABASE_TYPE || "postgresql"

    if (databaseType === "mysql") {
      await dbQuery("DELETE FROM sessions WHERE expires_at < NOW()")
    } else {
      await dbQuery("DELETE FROM sessions WHERE expires_at < NOW()")
    }
  } catch (error) {
    console.error("Error cleaning up expired sessions:", error)
  }
}

// Extend session expiration when user is active
export async function extendSession(sessionToken: string): Promise<void> {
  try {
    const databaseType = process.env.DATABASE_TYPE || "postgresql"
    const newExpiresAt = new Date(Date.now() + SESSION_DURATION)

    if (databaseType === "mysql") {
      await dbQuery("UPDATE sessions SET expires_at = ? WHERE session_token = ?", [newExpiresAt, sessionToken])
    } else {
      await dbQuery("UPDATE sessions SET expires_at = $1 WHERE session_token = $2", [newExpiresAt, sessionToken])
    }
  } catch (error) {
    console.error("Error extending session:", error)
  }
}
