import { cookies } from "next/headers"
import { createServerClient } from "./supabase"
import { redirect } from "next/navigation"

export async function getUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")

  if (!token) {
    return null
  }

  const supabase = createServerClient()
  const { data: user } = await supabase.from("users").select("*").eq("id", token.value).single()

  if (user?.is_banned && user.banned_until && new Date(user.banned_until) > new Date()) {
    // User is banned and ban is still active
    clearAuthCookie() // Clear cookie to force re-login
    redirect("/login?error=banned")
  }

  return user
}

export async function requireAuth() {
  const user = await getUser()
  if (!user) {
    redirect("/login")
  }
  return user
}

export async function requireAdminAuth() {
  const user = await getUser()
  if (!user || !user.is_admin) {
    redirect("/feed") // Redirect non-admins away from admin page
  }
  return user
}

export async function setAuthCookie(userId: string) {
  const cookieStore = await cookies()
  cookieStore.set("auth-token", userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  })
}

export async function clearAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete("auth-token")
}
