"use server"

import { createServerClient } from "@/lib/supabase"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function createPost(formData: FormData) {
  const userId = formData.get("userId") as string
  const title = formData.get("title") as string
  const artist = formData.get("artist") as string
  const genreId = Number.parseInt(formData.get("genreId") as string)
  const spotifyUrl = formData.get("spotifyUrl") as string
  const explanation = formData.get("explanation") as string
  const tagsString = formData.get("tags") as string

  if (!title || !artist || !explanation) {
    return { error: "Please fill in all required fields" }
  }

  if (title.length < 1 || title.length > 200) {
    return { error: "Song title must be between 1 and 200 characters" }
  }

  if (artist.length < 1 || artist.length > 200) {
    return { error: "Artist name must be between 1 and 200 characters" }
  }

  if (explanation.length < 10) {
    return { error: "Please provide a more detailed explanation (at least 10 characters)" }
  }

  if (spotifyUrl && !spotifyUrl.includes("spotify.com")) {
    return { error: "Please enter a valid Spotify URL" }
  }

  const tags = tagsString
    ? tagsString
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    : []

  const supabase = createServerClient()

  try {
    const { error } = await supabase.from("posts").insert({
      user_id: userId,
      title,
      artist,
      genre_id: genreId,
      spotify_url: spotifyUrl || null,
      explanation,
      tags,
    })

    if (error) {
      console.error("Error creating post:", error)
      return { error: "Failed to create post. Please try again." }
    }

    redirect("/feed")
  } catch (error) {
    console.error("Error creating post:", error)
    return { error: "Something went wrong. Please try again." }
  }
}

export async function updatePost(formData: FormData) {
  const postId = formData.get("postId") as string
  const userId = formData.get("userId") as string
  const title = formData.get("title") as string
  const artist = formData.get("artist") as string
  const genreId = Number.parseInt(formData.get("genreId") as string)
  const spotifyUrl = formData.get("spotifyUrl") as string
  const explanation = formData.get("explanation") as string
  const tagsString = formData.get("tags") as string

  if (!title || !artist || !explanation) {
    return { error: "Please fill in all required fields" }
  }

  if (title.length < 1 || title.length > 200) {
    return { error: "Song title must be between 1 and 200 characters" }
  }

  if (artist.length < 1 || artist.length > 200) {
    return { error: "Artist name must be between 1 and 200 characters" }
  }

  if (explanation.length < 10) {
    return { error: "Please provide a more detailed explanation (at least 10 characters)" }
  }

  if (spotifyUrl && !spotifyUrl.includes("spotify.com")) {
    return { error: "Please enter a valid Spotify URL" }
  }

  const tags = tagsString
    ? tagsString
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    : []

  const supabase = createServerClient()

  try {
    // Verify ownership
    const { data: post } = await supabase.from("posts").select("user_id").eq("id", postId).single()

    if (!post || post.user_id !== userId) {
      return { error: "You don't have permission to edit this post" }
    }

    const { error: updateError } = await supabase
      .from("posts")
      .update({
        title,
        artist,
        genre_id: genreId,
        spotify_url: spotifyUrl || null,
        explanation,
        tags,
        updated_at: new Date().toISOString(),
      })
      .eq("id", postId)

    if (updateError) {
      console.error("Error updating post:", updateError)
      return { error: "Failed to update post. Please try again." }
    }

    revalidatePath("/feed")
    return { success: true, message: "Post updated successfully!" }
  } catch (error) {
    console.error("Error updating post:", error)
    return { error: "Something went wrong. Please try again." }
  }
}

export async function deletePost(postId: string, userId: string) {
  const supabase = createServerClient()

  try {
    // Verify ownership
    const { data: post } = await supabase.from("posts").select("user_id").eq("id", postId).single()

    if (!post || post.user_id !== userId) {
      return { error: "You don't have permission to delete this post" }
    }

    const { error: deleteError } = await supabase.from("posts").delete().eq("id", postId)

    if (deleteError) {
      console.error("Error deleting post:", deleteError)
      return { error: "Failed to delete post. Please try again." }
    }

    revalidatePath("/feed")
    return { success: true, message: "Post deleted successfully!" }
  } catch (error) {
    console.error("Error deleting post:", error)
    return { error: "Something went wrong. Please try again." }
  }
}

export async function toggleLike(postId: string, userId: string) {
  const supabase = createServerClient()

  try {
    // Check if already liked
    const { data: existingLike } = await supabase
      .from("likes")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", userId)
      .single()

    if (existingLike) {
      // Unlike
      await supabase.from("likes").delete().eq("id", existingLike.id)
      // Remove from liked songs
      await supabase.from("liked_songs").delete().eq("post_id", postId).eq("user_id", userId)
    } else {
      // Like
      await supabase.from("likes").insert({
        post_id: postId,
        user_id: userId,
      })
      // Add to liked songs
      await supabase.from("liked_songs").insert({
        post_id: postId,
        user_id: userId,
      })
    }

    return { success: true }
  } catch (error) {
    console.error("Error toggling like:", error)
    return { error: "Failed to update like. Please try again." }
  }
}

export async function addComment(formData: FormData) {
  const postId = formData.get("postId") as string
  const userId = formData.get("userId") as string
  const content = formData.get("content") as string

  if (!content || !content.trim()) {
    return { error: "Comment cannot be empty" }
  }

  if (content.trim().length > 500) {
    return { error: "Comment is too long (maximum 500 characters)" }
  }

  const supabase = createServerClient()

  try {
    const { error } = await supabase.from("comments").insert({
      post_id: postId,
      user_id: userId,
      content: content.trim(),
    })

    if (error) {
      console.error("Error adding comment:", error)
      return { error: "Failed to add comment. Please try again." }
    }

    return { success: true, message: "Comment added successfully!" }
  } catch (error) {
    console.error("Error adding comment:", error)
    return { error: "Something went wrong. Please try again." }
  }
}
