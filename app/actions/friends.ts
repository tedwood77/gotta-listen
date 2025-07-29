"use server"

import { createServerClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export async function sendFriendRequest(requesterId: string, addresseeId: string) {
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
    throw new Error("Friendship already exists")
  }

  // Create friend request
  const { error } = await supabase.from("friendships").insert({
    requester_id: requesterId,
    addressee_id: addresseeId,
    status: "pending",
  })

  if (error) {
    throw new Error(error.message)
  }

  // Create notification
  await supabase.from("notifications").insert({
    user_id: addresseeId,
    type: "friend_request",
    title: "New Friend Request",
    message: "Someone sent you a friend request",
    data: { requester_id: requesterId },
  })

  revalidatePath("/friends")
}

export async function acceptFriendRequest(friendshipId: string) {
  const supabase = createServerClient()

  const { data: friendship, error: fetchError } = await supabase
    .from("friendships")
    .select("*")
    .eq("id", friendshipId)
    .single()

  if (fetchError || !friendship) {
    throw new Error("Friend request not found")
  }

  const { error } = await supabase
    .from("friendships")
    .update({
      status: "accepted",
      updated_at: new Date().toISOString(),
    })
    .eq("id", friendshipId)

  if (error) {
    throw new Error(error.message)
  }

  // Create notification for requester
  await supabase.from("notifications").insert({
    user_id: friendship.requester_id,
    type: "friend_accepted",
    title: "Friend Request Accepted",
    message: "Your friend request was accepted",
    data: { addressee_id: friendship.addressee_id },
  })

  revalidatePath("/friends")
}

export async function declineFriendRequest(friendshipId: string) {
  const supabase = createServerClient()

  const { error } = await supabase.from("friendships").delete().eq("id", friendshipId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/friends")
}

export async function removeFriend(friendshipId: string) {
  const supabase = createServerClient()

  const { error } = await supabase.from("friendships").delete().eq("id", friendshipId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/friends")
}
