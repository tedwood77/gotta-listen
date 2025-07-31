"use server"

import { createServerClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import { requireAdminAuth } from "@/lib/auth"
import bcrypt from "bcryptjs"

export async function getAllUsersAdmin() {
  await requireAdminAuth() // Ensure only admins can call this

  const supabase = createServerClient()
  const { data: users, error } = await supabase
    .from("users")
    .select(`
      id,
      email,
      username,
      full_name,
      bio,
      avatar_url,
      country,
      state,
      city,
      created_at,
      updated_at,
      is_admin,
      is_banned,
      banned_until,
      last_login_ip,
      profile_visibility,
      show_location,
      allow_friend_requests,
      show_activity_status,
      email_notifications,
      friend_request_notifications,
      comment_notifications,
      like_notifications,
      weekly_digest,
      theme,
      compact_mode,
      auto_play_music,
      friends_list_visibility,
      liked_songs_visibility
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching users for admin:", error)
    return { error: "Failed to fetch users" }
  }

  return { data: users }
}

export async function updateUserByAdmin(formData: FormData) {
  await requireAdminAuth() // Ensure only admins can call this

  const userId = formData.get("userId") as string
  const fullName = formData.get("fullName") as string
  const username = formData.get("username") as string
  const email = formData.get("email") as string
  const bio = formData.get("bio") as string
  const country = formData.get("country") as string
  const state = formData.get("state") as string
  const city = formData.get("city") as string
  const isAdmin = formData.get("isAdmin") === "on"
  const newPassword = formData.get("newPassword") as string

  const supabase = createServerClient()

  try {
    const updates: Record<string, any> = {
      full_name: fullName,
      username: username,
      email: email,
      bio: bio || null,
      country: country || null,
      state: state || null,
      city: city || null,
      is_admin: isAdmin,
      updated_at: new Date().toISOString(),
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        return { error: "New password must be at least 6 characters long" }
      }
      updates.password_hash = await bcrypt.hash(newPassword, 12)
    }

    const { error } = await supabase.from("users").update(updates).eq("id", userId)

    if (error) {
      console.error("Error updating user by admin:", error)
      return { error: `Failed to update user: ${error.message}` }
    }

    revalidatePath("/admin")
    revalidatePath(`/profile/${username}`) // Revalidate user's profile if username changed
    return { success: true, message: "User updated successfully!" }
  } catch (error: any) {
    console.error("Error updating user by admin:", error)
    return { error: `Something went wrong: ${error.message || "Unknown error"}` }
  }
}

export async function deleteUserByAdmin(userId: string) {
  await requireAdminAuth() // Ensure only admins can call this

  const supabase = createServerClient()

  try {
    const { error } = await supabase.from("users").delete().eq("id", userId)

    if (error) {
      console.error("Error deleting user by admin:", error)
      return { error: `Failed to delete user: ${error.message}` }
    }

    revalidatePath("/admin")
    return { success: true, message: "User deleted successfully!" }
  } catch (error: any) {
    console.error("Error deleting user by admin:", error)
    return { error: `Something went wrong: ${error.message || "Unknown error"}` }
  }
}

export async function banUser(userId: string, durationDays: number, ipBan: boolean) {
  await requireAdminAuth() // Ensure only admins can call this

  const supabase = createServerClient()
  let bannedUntil: Date | null = null
  if (durationDays > 0) {
    bannedUntil = new Date()
    bannedUntil.setDate(bannedUntil.getDate() + durationDays)
  }

  try {
    const updates: Record<string, any> = {
      is_banned: true,
      banned_until: bannedUntil?.toISOString() || null,
    }

    if (ipBan) {
      const { data: user, error: fetchError } = await supabase
        .from("users")
        .select("last_login_ip")
        .eq("id", userId)
        .single()
      if (fetchError || !user?.last_login_ip) {
        console.warn(`Could not retrieve last_login_ip for user ${userId}. IP ban might not be effective.`)
      } else {
        updates.banned_ip = user.last_login_ip
      }
    } else {
      updates.banned_ip = null // Clear IP if not an IP ban
    }

    const { error } = await supabase.from("users").update(updates).eq("id", userId)

    if (error) {
      console.error("Error banning user:", error)
      return { error: `Failed to ban user: ${error.message}` }
    }

    revalidatePath("/admin")
    return { success: true, message: "User banned successfully!" }
  } catch (error: any) {
    console.error("Error banning user:", error)
    return { error: `Something went wrong: ${error.message || "Unknown error"}` }
  }
}

export async function unbanUser(userId: string) {
  await requireAdminAuth() // Ensure only admins can call this

  const supabase = createServerClient()

  try {
    const { error } = await supabase
      .from("users")
      .update({
        is_banned: false,
        banned_until: null,
        banned_ip: null,
      })
      .eq("id", userId)

    if (error) {
      console.error("Error unbanning user:", error)
      return { error: `Failed to unban user: ${error.message}` }
    }

    revalidatePath("/admin")
    return { success: true, message: "User unbanned successfully!" }
  } catch (error: any) {
    console.error("Error unbanning user:", error)
    return { error: `Something went wrong: ${error.message || "Unknown error"}` }
  }
}
