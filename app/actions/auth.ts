"use server"

import { createServerClient } from "@/lib/supabase"
import { redirect } from "next/navigation"
import { setAuthCookie, clearAuthCookie } from "@/lib/auth"
import bcrypt from "bcryptjs"
import { headers } from "next/headers"

export async function registerUser(formData: FormData) {
  const email = formData.get("email") as string
  const username = formData.get("username") as string
  const fullName = formData.get("fullName") as string
  const password = formData.get("password") as string
  const country = formData.get("country") as string
  const state = formData.get("state") as string
  const city = formData.get("city") as string

  if (!email || !username || !fullName || !password) {
    return { error: "All required fields must be filled out" }
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters long" }
  }

  if (!email.includes("@")) {
    return { error: "Please enter a valid email address" }
  }

  if (username.length < 3) {
    return { error: "Username must be at least 3 characters long" }
  }

  const supabase = createServerClient()

  try {
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id, email, username")
      .or(`email.eq.${email},username.eq.${username}`)
      .single()

    if (existingUser) {
      if (existingUser.email === email) {
        return { error: "An account with this email already exists" }
      }
      if (existingUser.username === username) {
        return { error: "This username is already taken" }
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const { data: user, error } = await supabase
      .from("users")
      .insert({
        email,
        username,
        full_name: fullName,
        password_hash: hashedPassword,
        country: country || null,
        state: state || null,
        city: city || null,
      })
      .select()
      .single()

    if (error) {
      console.error("Registration error:", error)
      return { error: "Failed to create account. Please try again." }
    }

    // Set persistent auth cookie
    await setAuthCookie(user.id)

    redirect("/feed")
  } catch (error) {
    console.error("Registration error:", error)
    return { error: "Something went wrong. Please try again." }
  }
}

export async function loginUser(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Please enter both email and password" }
  }

  if (!email.includes("@")) {
    return { error: "Please enter a valid email address" }
  }

  const supabase = createServerClient()

  try {
    const { data: user } = await supabase
      .from("users")
      .select("id, email, password_hash, is_banned, banned_until")
      .eq("email", email)
      .single()

    if (!user) {
      return { error: "Invalid email or password" }
    }

    // Check if user is banned
    if (user.is_banned && user.banned_until && new Date(user.banned_until) > new Date()) {
      return { error: `You are banned until ${new Date(user.banned_until).toLocaleString()}.` }
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash)

    if (!isValidPassword) {
      return { error: "Invalid email or password" }
    }

    // Get client IP address
    const xForwardedFor = headers().get("x-forwarded-for")
    const ip = xForwardedFor ? xForwardedFor.split(",")[0].trim() : null

    // Update last login IP
    if (ip) {
      await supabase.from("users").update({ last_login_ip: ip }).eq("id", user.id)
    }

    // Set persistent auth cookie
    await setAuthCookie(user.id)

    redirect("/feed")
  } catch (error) {
    console.error("Login error:", error)
    return { error: "Something went wrong. Please try again." }
  }
}

export async function logoutUser() {
  await clearAuthCookie()
  redirect("/login")
}

export async function sendPasswordResetEmail(formData: FormData) {
  const email = formData.get("email") as string

  if (!email || !email.includes("@")) {
    return { error: "Please enter a valid email address." }
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  if (!baseUrl) {
    console.error("NEXT_PUBLIC_BASE_URL environment variable is not set.")
    return { error: "Server configuration error: Base URL for password reset is missing. Please contact support." }
  }

  const supabase = createServerClient()

  try {
    // Supabase handles sending the reset email.
    // The redirectTo URL is where the user will land after clicking the link in the email.
    // This URL will contain the access_token and type=recovery in its query parameters.
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${baseUrl}/reset-password`,
    })

    if (error) {
      console.error("Error sending password reset email:", error)
      return { error: "Failed to send reset email. Please try again." }
    }

    return { success: true, message: "Password reset link sent to your email!" }
  } catch (error) {
    console.error("Error sending password reset email:", error)
    return { error: "Something went wrong. Please try again." }
  }
}

export async function resetPassword(formData: FormData) {
  const newPassword = formData.get("newPassword") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (!newPassword || !confirmPassword) {
    return { error: "Please enter and confirm your new password." }
  }

  if (newPassword.length < 6) {
    return { error: "Password must be at least 6 characters long." }
  }

  if (newPassword !== confirmPassword) {
    return { error: "Passwords do not match." }
  }

  const supabase = createServerClient()

  try {
    // This function updates the user's password for the currently authenticated session.
    // The session is established when the user clicks the magic link from the email.
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      console.error("Error resetting password:", error)
      return { error: `Failed to reset password: ${error.message}` }
    }

    return { success: true, message: "Your password has been reset successfully!" }
  } catch (error) {
    console.error("Error resetting password:", error)
    return { error: "Something went wrong. Please try again." }
  }
}
