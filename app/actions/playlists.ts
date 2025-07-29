"use server"

import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase"

export async function createPlaylist(formData: FormData) {
  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const isPublic = formData.get("isPublic") === "on"
  const userId = formData.get("userId") as string

  const supabase = createServerClient()

  const { error } = await supabase.from("playlists").insert({
    user_id: userId,
    name,
    description: description || null,
    is_public: isPublic,
  })

  if (error) {
    throw new Error(error.message)
  }

  redirect("/playlists")
}

export async function addToPlaylist(playlistId: string, postId: string) {
  const supabase = createServerClient()

  // Get the current max position
  const { data: tracks } = await supabase
    .from("playlist_tracks")
    .select("position")
    .eq("playlist_id", playlistId)
    .order("position", { ascending: false })
    .limit(1)

  const nextPosition = tracks && tracks.length > 0 ? tracks[0].position + 1 : 1

  const { error } = await supabase.from("playlist_tracks").insert({
    playlist_id: playlistId,
    post_id: postId,
    position: nextPosition,
  })

  if (error) {
    throw new Error(error.message)
  }
}

export async function removeFromPlaylist(playlistId: string, postId: string) {
  const supabase = createServerClient()

  const { error } = await supabase.from("playlist_tracks").delete().eq("playlist_id", playlistId).eq("post_id", postId)

  if (error) {
    throw new Error(error.message)
  }
}
