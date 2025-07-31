"use server"

import { createServerClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export async function updateProfile(formData: FormData) {
  const userId = formData.get("userId") as string
  const fullName = formData.get("fullName") as string
  const bio = formData.get("bio") as string
  const country = formData.get("country") as string
  const state = formData.get("state") as string
  const city = formData.get("city") as string

  if (!fullName || fullName.trim().length < 1) {
    return { error: "Full name is required" }
  }

  if (fullName.length > 100) {
    return { error: "Full name must be less than 100 characters" }
  }

  if (bio && bio.length > 500) {
    return { error: "Bio must be less than 500 characters" }
  }

  const supabase = createServerClient()

  try {
    const { error } = await supabase
      .from("users")
      .update({
        full_name: fullName.trim(),
        bio: bio?.trim() || null,
        country: country?.trim() || null,
        state: state?.trim() || null,
        city: city?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (error) {
      console.error("Error updating profile:", error)
      return { error: "Failed to update profile. Please try again." }
    }

    revalidatePath("/settings")
    return { success: true, message: "Profile updated successfully!" }
  } catch (error) {
    console.error("Error updating profile:", error)
    return { error: "Something went wrong. Please try again." }
  }
}

export async function updatePrivacySettings(formData: FormData) {
  const userId = formData.get("userId") as string
  const profileVisibility = formData.get("profileVisibility") as string
  const friendsListVisibility = formData.get("friendsListVisibility") as string
  const likedSongsVisibility = formData.get("likedSongsVisibility") as string
  const showLocation = formData.get("showLocation") === "on"
  const allowFriendRequests = formData.get("allowFriendRequests") === "on"
  const showActivityStatus = formData.get("showActivityStatus") === "on"

  const supabase = createServerClient()

  try {
    const { error } = await supabase
      .from("users")
      .update({
        profile_visibility: profileVisibility,
        friends_list_visibility: friendsListVisibility,
        liked_songs_visibility: likedSongsVisibility,
        show_location: showLocation,
        allow_friend_requests: allowFriendRequests,
        show_activity_status: showActivityStatus,
      })
      .eq("id", userId)

    if (error) {
      console.error("Error updating privacy settings:", error)
      return { error: "Failed to update privacy settings. Please try again." }
    }

    revalidatePath("/settings")
    return { success: true, message: "Privacy settings updated successfully!" }
  } catch (error) {
    console.error("Error updating privacy settings:", error)
    return { error: "Something went wrong. Please try again." }
  }
}

export async function updateNotificationSettings(formData: FormData) {
  const userId = formData.get("userId") as string
  const emailNotifications = formData.get("emailNotifications") === "on"
  const friendRequestNotifications = formData.get("friendRequestNotifications") === "on"
  const commentNotifications = formData.get("commentNotifications") === "on"
  const likeNotifications = formData.get("likeNotifications") === "on"
  const weeklyDigest = formData.get("weeklyDigest") === "on"

  const supabase = createServerClient()

  try {
    const { error } = await supabase
      .from("users")
      .update({
        email_notifications: emailNotifications,
        friend_request_notifications: friendRequestNotifications,
        comment_notifications: commentNotifications,
        like_notifications: likeNotifications,
        weekly_digest: weeklyDigest,
      })
      .eq("id", userId)

    if (error) {
      console.error("Error updating notification settings:", error)
      return { error: "Failed to update notification settings. Please try again." }
    }

    revalidatePath("/settings")
    return { success: true, message: "Notification settings updated successfully!" }
  } catch (error) {
    console.error("Error updating notification settings:", error)
    return { error: "Something went wrong. Please try again." }
  }
}

export async function updateAppearanceSettings(formData: FormData) {
  const userId = formData.get("userId") as string
  const theme = formData.get("theme") as string
  const compactMode = formData.get("compactMode") === "on"
  const autoPlayMusic = formData.get("autoPlayMusic") === "on"

  const supabase = createServerClient()

  try {
    const { error } = await supabase
      .from("users")
      .update({
        theme,
        compact_mode: compactMode,
        auto_play_music: autoPlayMusic,
      })
      .eq("id", userId)

    if (error) {
      console.error("Error updating appearance settings:", error)
      return { error: "Failed to update appearance settings. Please try again." }
    }

    revalidatePath("/settings")
    return { success: true, message: "Appearance settings updated successfully!" }
  } catch (error) {
    console.error("Error updating appearance settings:", error)
    return { error: "Something went wrong. Please try again." }
  }
}
