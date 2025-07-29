"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Reply, MoreHorizontal, Trash2, Edit, Flag } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { createComment, deleteComment, getComments } from "@/app/actions/comments"
import GoogleAdSpace from "./google-ad-space"

interface CommentsSectionProps {
  postId: string
  currentUser: any
}

interface Comment {
  id: string
  content: string
  created_at: string
  updated_at: string
  user_id: string
  parent_id: string | null
  users: {
    id: string
    username: string
    display_name: string
    avatar_url: string | null
  }
  replies?: Comment[]
}

export default function CommentsSection({ postId, currentUser }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingComments, setIsLoadingComments] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadComments()
  }, [postId])

  const loadComments = async () => {
    try {
      setError(null)
      const commentsData = await getComments(postId)
      setComments(commentsData)
    } catch (error) {
      console.error("Error loading comments:", error)
      setError("Failed to load comments. Please try again.")
      setComments([])
    } finally {
      setIsLoadingComments(false)
    }
  }

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return

    setIsLoading(true)
    try {
      await createComment(postId, currentUser.id, newComment, null)
      setNewComment("")
      await loadComments()
    } catch (error) {
      console.error("Error creating comment:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitReply = async (parentId: string) => {
    if (!replyContent.trim()) return

    setIsLoading(true)
    try {
      await createComment(postId, currentUser.id, replyContent, parentId)
      setReplyContent("")
      setReplyingTo(null)
      await loadComments()
    } catch (error) {
      console.error("Error creating reply:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(commentId)
      await loadComments()
    } catch (error) {
      console.error("Error deleting comment:", error)
    }
  }

  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} className={`${isReply ? "ml-8 mt-3" : "mb-4"}`}>
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Link href={`/profile/${comment.users.username}`}>
              <Avatar className="w-8 h-8">
                <AvatarImage src={comment.users.avatar_url || "/placeholder.svg"} />
                <AvatarFallback>
                  {comment.users.display_name?.charAt(0) || comment.users.username?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <Link href={`/profile/${comment.users.username}`}>
                    <span className="font-semibold text-sm hover:text-purple-600">{comment.users.display_name}</span>
                  </Link>
                  <span className="text-xs text-gray-500 ml-2">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {comment.user_id === currentUser.id ? (
                      <>
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <DropdownMenuItem className="text-red-600 focus:text-red-600">
                        <Flag className="w-4 h-4 mr-2" />
                        Report
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <p className="text-sm text-gray-700 mb-2">{comment.content}</p>
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" className="text-xs">
                  <Heart className="w-3 h-3 mr-1" />
                  Like
                </Button>
                {!isReply && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                  >
                    <Reply className="w-3 h-3 mr-1" />
                    Reply
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Reply Form */}
          {replyingTo === comment.id && (
            <div className="mt-3 ml-11">
              <Textarea
                placeholder="Write a reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="mb-2"
                rows={2}
              />
              <div className="flex space-x-2">
                <Button size="sm" onClick={() => handleSubmitReply(comment.id)} disabled={isLoading}>
                  {isLoading ? "Replying..." : "Reply"}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setReplyingTo(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Render replies */}
      {comment.replies && comment.replies.map((reply) => renderComment(reply, true))}
    </div>
  )

  if (isLoadingComments) {
    return (
      <div className="border-t pt-4">
        <p className="text-sm text-gray-500">Loading comments...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="border-t pt-4">
        <div className="text-center py-4">
          <p className="text-sm text-red-500 mb-2">{error}</p>
          <Button variant="outline" size="sm" onClick={loadComments}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="border-t pt-4 space-y-4">
      {/* New Comment Form */}
      <div className="flex space-x-3">
        <Avatar className="w-8 h-8">
          <AvatarImage src={currentUser?.avatar_url || "/placeholder.svg"} />
          <AvatarFallback>{currentUser?.display_name?.charAt(0) || currentUser?.username?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <Textarea
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="mb-2"
            rows={2}
          />
          <Button onClick={handleSubmitComment} disabled={isLoading || !newComment.trim()}>
            {isLoading ? "Posting..." : "Post Comment"}
          </Button>
        </div>
      </div>

      {/* Comments Ad - Show after 3 comments */}
      {comments.length > 3 && (
        <GoogleAdSpace adSlot="0123456789" position="comments" adFormat="horizontal" className="my-4" />
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment, index) => (
            <div key={comment.id}>
              {renderComment(comment)}
              {/* Add ad after every 8 comments */}
              {(index + 1) % 8 === 0 && index < comments.length - 1 && (
                <GoogleAdSpace adSlot="1234567890" position="comments" adFormat="horizontal" className="my-4" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
