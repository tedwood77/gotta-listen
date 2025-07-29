"use server"

import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import {
  hashPassword,
  verifyPassword,
  createSession,
  deleteSession,
  deleteAllUserSessions,
  cleanupExpiredSessions,
  extendSession,
} from "@/lib/auth"
import { dbQuery } from "@/lib/database"

const COOKIE_MAX_AGE = 365 * 24 * 60 * 60 // 1 year in seconds

export async function loginUser(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const rememberMe = formData.get("rememberMe") === "on"

  if (!email || !password) {
    return {
      error: "Please enter both email and password",
    }
  }

  try {
    const databaseType = process.env.DATABASE_TYPE || "postgresql"

    // Find user by email
    let userResult
    if (databaseType === "mysql") {
      userResult = await dbQuery("SELECT * FROM users WHERE email = ?", [email])
    } else {
      userResult = await dbQuery("SELECT * FROM users WHERE email = $1", [email])
    }

    if (!userResult.rows || userResult.rows.length === 0) {
      return {
        error: "Invalid email or password. Please check your credentials and try again.",
      }
    }

    const user = userResult.rows[0]

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash)
    if (!isValidPassword) {
      return {
        error: "Invalid email or password. Please check your credentials and try again.",
      }
    }

    // Create session
    const sessionToken = await createSession(user.id)

    // Set cookie with long expiration
    const cookieStore = await cookies()
    const maxAge = rememberMe ? COOKIE_MAX_AGE : 60 * 60 * 24 * 7 // 1 year if remember me, otherwise 7 days

    cookieStore.set("gotta_listen_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: maxAge,
      path: "/",
    })

    // Also set a non-httpOnly cookie to check login status on client side
    cookieStore.set("gotta_listen_logged_in", "true", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: maxAge,
      path: "/",
    })

    // Clean up old sessions
    await cleanupExpiredSessions()
  } catch (error) {
    console.error("Login error:", error)
    return {
      error: "Unable to sign in. Please try again later.",
    }
  }

  redirect("/feed")
}

export async function registerUser(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const username = formData.get("username") as string
  const displayName = formData.get("displayName") as string
  const bio = formData.get("bio") as string
  const country = formData.get("country") as string
  const state = formData.get("state") as string
  const city = formData.get("city") as string
  const customCity = formData.get("customCity") as string
  const favoriteGenres = formData.get("favoriteGenres") as string

  // Validation
  if (!email || !password || !username || !displayName) {
    return {
      error: "Please fill in all required fields (email, password, username, and display name)",
    }
  }

  if (password.length < 6) {
    return {
      error: "Password must be at least 6 characters long",
    }
  }

  if (username.length < 3) {
    return {
      error: "Username must be at least 3 characters long",
    }
  }

  // Check for valid username format (alphanumeric and underscores only)
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return {
      error: "Username can only contain letters, numbers, and underscores",
    }
  }

  try {
    const databaseType = process.env.DATABASE_TYPE || "postgresql"

    // Check if email or username already exists
    let existingUserResult
    if (databaseType === "mysql") {
      existingUserResult = await dbQuery("SELECT id FROM users WHERE email = ? OR username = ?", [email, username])
    } else {
      existingUserResult = await dbQuery("SELECT id FROM users WHERE email = $1 OR username = $2", [email, username])
    }

    if (existingUserResult.rows && existingUserResult.rows.length > 0) {
      return {
        error: "An account with this email or username already exists.",
      }
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Prepare user data
    const favoriteGenresArray = favoriteGenres ? [favoriteGenres] : []
    const privacySettings = {
      profile_visibility: "public",
      post_visibility: "public",
      location_visibility: "public",
      friend_list_visibility: "friends",
      liked_songs_visibility: "public",
      allow_friend_requests: true,
      show_online_status: true,
      email_notifications: true,
      push_notifications: true,
    }

    // Create user
    let userId
    if (databaseType === "mysql") {
      const result = await dbQuery(
        `INSERT INTO users (email, username, display_name, password_hash, bio, country, state_region, city, favorite_genres, privacy_settings) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          email,
          username,
          displayName,
          passwordHash,
          bio || null,
          country || null,
          state || null,
          city || customCity || null,
          JSON.stringify(favoriteGenresArray),
          JSON.stringify(privacySettings),
        ],
      )
      // Get the inserted user ID
      const userResult = await dbQuery("SELECT id FROM users WHERE email = ?", [email])
      userId = userResult.rows[0].id
    } else {
      const result = await dbQuery(
        `INSERT INTO users (email, username, display_name, password_hash, bio, country, state_region, city, favorite_genres, privacy_settings) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
        [
          email,
          username,
          displayName,
          passwordHash,
          bio || null,
          country || null,
          state || null,
          city || customCity || null,
          favoriteGenresArray,
          privacySettings,
        ],
      )
      userId = result.rows[0].id
    }

    // Create session
    const sessionToken = await createSession(userId)

    // Set long-lasting cookie
    const cookieStore = await cookies()
    cookieStore.set("gotta_listen_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE, // 1 year
      path: "/",
    })

    // Also set a non-httpOnly cookie to check login status on client side
    cookieStore.set("gotta_listen_logged_in", "true", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE, // 1 year
      path: "/",
    })
  } catch (error) {
    console.error("Registration error:", error)
    return {
      error: "Unable to create account. Please try again later.",
    }
  }

  redirect("/feed")
}

export async function logoutUser() {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("gotta_listen_session")?.value

    if (sessionToken) {
      await deleteSession(sessionToken)
    }

    // Delete both cookies
    cookieStore.delete("gotta_listen_session")
    cookieStore.delete("gotta_listen_logged_in")
  } catch (error) {
    console.error("Logout error:", error)
  }

  redirect("/")
}

export async function logoutAllDevices() {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("gotta_listen_session")?.value

    if (sessionToken) {
      // Get user ID from session
      const databaseType = process.env.DATABASE_TYPE || "postgresql"
      let sessionResult

      if (databaseType === "mysql") {
        sessionResult = await dbQuery("SELECT user_id FROM sessions WHERE session_token = ?", [sessionToken])
      } else {
        sessionResult = await dbQuery("SELECT user_id FROM sessions WHERE session_token = $1", [sessionToken])
      }

      if (sessionResult.rows && sessionResult.rows.length > 0) {
        const userId = sessionResult.rows[0].user_id
        await deleteAllUserSessions(userId)
      }
    }

    // Delete cookies
    cookieStore.delete("gotta_listen_session")
    cookieStore.delete("gotta_listen_logged_in")
  } catch (error) {
    console.error("Logout all devices error:", error)
  }

  redirect("/")
}

// Extend session when user is active
export async function refreshSession() {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("gotta_listen_session")?.value

    if (sessionToken) {
      await extendSession(sessionToken)

      // Refresh the cookie expiration
      cookieStore.set("gotta_listen_session", sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: COOKIE_MAX_AGE, // 1 year
        path: "/",
      })

      cookieStore.set("gotta_listen_logged_in", "true", {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: COOKIE_MAX_AGE, // 1 year
        path: "/",
      })
    }
  } catch (error) {
    console.error("Session refresh error:", error)
  }
}
