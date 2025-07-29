"use server"

import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export async function createPost(formData: FormData) {
  const title = formData.get("title") as string
  const artist = formData.get("artist") as string
  const genre = formData.get("genre") as string
  const musicUrl = formData.get("musicUrl") as string
  const explanation = formData.get("explanation") as string
  const tags = JSON.parse(formData.get("tags") as string)
  const userId = formData.get("userId") as string
  const visibility = formData.get("visibility") as string

  const supabase = createServerClient()

  const { error } = await supabase.from("posts").insert({
    user_id: userId,
    title,
    artist,
    genre,
    spotify_url: musicUrl || null,
    explanation,
    tags,
    visibility: visibility || "public",
  })

  if (error) {
    throw new Error(error.message)
  }

  redirect("/feed")
}

export async function updatePost(formData: FormData) {
  const postId = formData.get("postId") as string
  const userId = formData.get("userId") as string
  const title = formData.get("title") as string
  const artist = formData.get("artist") as string
  const genre = formData.get("genre") as string
  const musicUrl = formData.get("musicUrl") as string
  const explanation = formData.get("explanation") as string
  const tags = JSON.parse(formData.get("tags") as string)
  const visibility = formData.get("visibility") as string
  const editReason = formData.get("editReason") as string

  const supabase = createServerClient()

  // Get the current post for edit history
  const { data: currentPost } = await supabase.from("posts").select("*").eq("id", postId).single()

  if (currentPost) {
    // Save edit history
    await supabase.from("post_edit_history").insert({
      post_id: postId,
      user_id: userId,
      old_content: {
        title: currentPost.title,
        artist: currentPost.artist,
        genre: currentPost.genre,
        spotify_url: currentPost.spotify_url,
        explanation: currentPost.explanation,
        tags: currentPost.tags,
        visibility: currentPost.visibility,
      },
      edit_reason: editReason || null,
    })
  }

  // Update the post
  const { error } = await supabase
    .from("posts")
    .update({
      title,
      artist,
      genre,
      spotify_url: musicUrl || null,
      explanation,
      tags,
      visibility,
      edited_at: new Date().toISOString(),
      edit_count: (currentPost?.edit_count || 0) + 1,
    })
    .eq("id", postId)
    .eq("user_id", userId)

  if (error) {
    throw new Error(error.message)
  }

  redirect(`/post/${postId}`)
}

export async function deletePost(postId: string) {
  const supabase = createServerClient()

  const { error } = await supabase.from("posts").delete().eq("id", postId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/feed")
}

export async function likePost(postId: string, userId: string) {
  const supabase = createServerClient()

  const { error } = await supabase.from("likes").insert({
    post_id: postId,
    user_id: userId,
  })

  if (error) {
    throw new Error(error.message)
  }

  // Create notification for post owner
  const { data: post } = await supabase.from("posts").select("user_id").eq("id", postId).single()

  if (post && post.user_id !== userId) {
    await supabase.from("notifications").insert({
      user_id: post.user_id,
      type: "post_like",
      title: "New Like",
      message: "Someone liked your post",
      data: { post_id: postId, liker_id: userId },
    })
  }
}

export async function unlikePost(postId: string, userId: string) {
  const supabase = createServerClient()

  const { error } = await supabase.from("likes").delete().eq("post_id", postId).eq("user_id", userId)

  if (error) {
    throw new Error(error.message)
  }
}

export async function sharePost(postId: string, userId: string, shareType: string, comment?: string) {
  const supabase = createServerClient()

  const { error } = await supabase.from("post_shares").insert({
    post_id: postId,
    user_id: userId,
    share_type: shareType,
    comment: comment || null,
  })

  if (error) {
    throw new Error(error.message)
  }

  // Create notification for post owner
  const { data: post } = await supabase.from("posts").select("user_id").eq("id", postId).single()

  if (post && post.user_id !== userId) {
    await supabase.from("notifications").insert({
      user_id: post.user_id,
      type: "post_share",
      title: "Post Shared",
      message: shareType === "repost" ? "Someone reposted your post" : "Someone shared your post with a comment",
      data: { post_id: postId, sharer_id: userId, share_type: shareType },
    })
  }

  revalidatePath("/feed")
}
