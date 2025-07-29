"use server"

import { createServerClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export async function getComments(postId: string) {
  const supabase = createServerClient()

  const { data: comments, error } = await supabase
    .from("comments")
    .select(`
      *,
      users!comments_user_id_fkey (
        id,
        username,
        display_name,
        avatar_url
      )
    `)
    .eq("post_id", postId)
    .is("parent_id", null)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Error fetching comments:", error)
    throw new Error(error.message)
  }

  // Get replies for each comment
  const commentsWithReplies = await Promise.all(
    (comments || []).map(async (comment) => {
      const { data: replies, error: repliesError } = await supabase
        .from("comments")
        .select(`
          *,
          users!comments_user_id_fkey (
            id,
            username,
            display_name,
            avatar_url
          )
        `)
        .eq("parent_id", comment.id)
        .order("created_at", { ascending: true })

      if (repliesError) {
        console.error("Error fetching replies:", repliesError)
        return {
          ...comment,
          replies: [],
        }
      }

      return {
        ...comment,
        replies: replies || [],
      }
    }),
  )

  return commentsWithReplies
}

export async function createComment(postId: string, userId: string, content: string, parentId?: string | null) {
  const supabase = createServerClient()

  const { error } = await supabase.from("comments").insert({
    post_id: postId,
    user_id: userId,
    content,
    parent_id: parentId,
  })

  if (error) {
    throw new Error(error.message)
  }

  // Create notification for post owner
  const { data: post } = await supabase.from("posts").select("user_id").eq("id", postId).single()

  if (post && post.user_id !== userId) {
    await supabase.from("notifications").insert({
      user_id: post.user_id,
      type: "post_comment",
      title: "New Comment",
      message: parentId ? "Someone replied to a comment on your post" : "Someone commented on your post",
      data: { post_id: postId, commenter_id: userId, parent_id: parentId },
    })
  }

  // If it's a reply, notify the parent comment author
  if (parentId) {
    const { data: parentComment } = await supabase.from("comments").select("user_id").eq("id", parentId).single()

    if (parentComment && parentComment.user_id !== userId) {
      await supabase.from("notifications").insert({
        user_id: parentComment.user_id,
        type: "comment_reply",
        title: "New Reply",
        message: "Someone replied to your comment",
        data: { post_id: postId, replier_id: userId, parent_comment_id: parentId },
      })
    }
  }

  revalidatePath(`/post/${postId}`)
}

export async function deleteComment(commentId: string) {
  const supabase = createServerClient()

  const { error } = await supabase.from("comments").delete().eq("id", commentId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/feed")
}

export async function updateComment(commentId: string, content: string) {
  const supabase = createServerClient()

  const { error } = await supabase
    .from("comments")
    .update({
      content,
      updated_at: new Date().toISOString(),
    })
    .eq("id", commentId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/feed")
}
