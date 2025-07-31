"use server"

import { createServerClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export async function sendFriendRequest(addresseeId: string, requesterId: string) {
  const supabase = createServerClient()

  // Check if friendship already exists
  const { data: existing } = await supabase
    .from("friendships")
    .select("*")
    .or(
      `and(requester_id.eq.${requesterId},addressee_id.eq.${addresseeId}),and(requester_id.eq.${addresseeId},addressee_id.eq.${requesterId})`,
    )
    .single()

  if (existing) {
    return { error: "Friend request already exists or you're already friends" }
  }

  const { error } = await supabase.from("friendships").insert({
    requester_id: requesterId,
    addressee_id: addresseeId,
    status: "pending",
  })

  if (error) {
    return { error: "Failed to send friend request" }
  }

  revalidatePath("/friends")
  return { success: true }
}

export async function respondToFriendRequest(friendshipId: string, status: "accepted" | "declined") {
  const supabase = createServerClient()

  const { error } = await supabase.from("friendships").update({ status }).eq("id", friendshipId)

  if (error) {
    return { error: "Failed to respond to friend request" }
  }

  revalidatePath("/friends")
  return { success: true }
}

export async function removeFriend(friendshipId: string) {
  const supabase = createServerClient()

  const { error } = await supabase.from("friendships").delete().eq("id", friendshipId)

  if (error) {
    return { error: "Failed to remove friend" }
  }

  revalidatePath("/friends")
  return { success: true }
}
