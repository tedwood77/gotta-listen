"use server"

import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { createServerClient } from "@/lib/supabase"

export async function updateProfile(formData: FormData) {
  const userId = formData.get("userId") as string
  const username = formData.get("username") as string
  const displayName = formData.get("displayName") as string
  const email = formData.get("email") as string
  const bio = formData.get("bio") as string
  const country = formData.get("country") as string
  const state = formData.get("state") as string
  const city = formData.get("city") as string
  const customCity = formData.get("customCity") as string
  const favoriteGenres = JSON.parse(formData.get("favoriteGenres") as string)

  const supabase = createServerClient()

  const { error } = await supabase
    .from("users")
    .update({
      username,
      display_name: displayName,
      email,
      bio: bio || null,
      country: country || null,
      state_region: state || null,
      city: city || customCity || null,
      favorite_genres: favoriteGenres,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)

  if (error) {
    if (error.message.includes("duplicate key")) {
      return {
        error: "Username is already taken. Please choose a different username.",
      }
    }
    return {
      error: "Failed to update profile. Please try again.",
    }
  }

  redirect("/settings?updated=profile")
}

export async function updatePrivacySettings(userId: string, privacySettings: any) {
  const supabase = createServerClient()

  const { error } = await supabase
    .from("users")
    .update({
      privacy_settings: privacySettings,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)

  if (error) {
    return {
      error: "Failed to update privacy settings. Please try again.",
    }
  }

  return { success: true }
}

export async function deleteAccount(userId: string) {
  const supabase = createServerClient()

  // Delete user account (cascade will handle related data)
  const { error } = await supabase.from("users").delete().eq("id", userId)

  if (error) {
    return {
      error: "Failed to delete account. Please try again or contact support.",
    }
  }

  // Clear session
  const cookieStore = await cookies()
  cookieStore.delete("session")

  redirect("/")
}

export async function blockUser(blockerId: string, blockedId: string) {
  const supabase = createServerClient()

  const { error } = await supabase.from("user_blocks").insert({
    blocker_id: blockerId,
    blocked_id: blockedId,
  })

  if (error) {
    return {
      error: "Failed to block user. Please try again.",
    }
  }

  return { success: true }
}

export async function unblockUser(blockerId: string, blockedId: string) {
  const supabase = createServerClient()

  const { error } = await supabase.from("user_blocks").delete().eq("blocker_id", blockerId).eq("blocked_id", blockedId)

  if (error) {
    return {
      error: "Failed to unblock user. Please try again.",
    }
  }

  return { success: true }
}
