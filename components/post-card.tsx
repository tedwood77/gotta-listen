"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Heart, MessageCircle, Share2, Send, Music2, MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { useState, useTransition } from "react"
import { toggleLike, addComment, deletePost } from "@/app/actions/posts"
import { useToast } from "@/hooks/use-toast"

interface PostCardProps {
  post: any
  currentUser: {
    id: string
    username: string
  }
}

export function PostCard({ post, currentUser }: PostCardProps) {
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [isLiked, setIsLiked] = useState(post.likes?.some((like: any) => like.user_id === currentUser.id))
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const isOwner = post.user_id === currentUser.id

  const handleLike = () => {
    startTransition(async () => {
      const result = await toggleLike(post.id, currentUser.id)
      if (result.success) {
        setIsLiked(!isLiked)
        setLikeCount(isLiked ? likeCount - 1 : likeCount + 1)
      }
    })
  }

  const handleComment = async (formData: FormData) => {
    const result = await addComment(formData)
    if (result.success) {
      setNewComment("")
      toast({
        title: "Comment added!",
        description: "Your comment has been posted.",
      })
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this post?")) {
      const result = await deletePost(post.id, currentUser.id)
      if (result.success) {
        toast({
          title: "Post deleted!",
          description: "Your post has been removed.",
        })
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      }
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${post.title} by ${post.artist}`,
        text: post.explanation,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Link copied!",
        description: "Post link copied to clipboard.",
      })
    }
  }

  const extractSpotifyId = (url: string) => {
    const match = url.match(/track\/([a-zA-Z0-9]+)/)
    return match ? match[1] : null
  }

  const spotifyId = post.spotify_url ? extractSpotifyId(post.spotify_url) : null

  return (
    <Card className="w-full music-card shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] border-0">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12 ring-2 ring-purple-200 dark:ring-purple-800">
              <AvatarImage src={post.users?.avatar_url || "/placeholder.svg"} />
              <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-400 text-white">
                {post.users?.full_name
                  ?.split(" ")
                  .map((n: string) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <Link
                href={`/profile/${post.users?.username}`}
                className="font-semibold hover:underline music-gradient-text"
              >
                {post.users?.full_name}
              </Link>
              <p className="text-sm text-muted-foreground">
                @{post.users?.username} • {formatDistanceToNow(new Date(post.created_at))} ago
                {post.updated_at !== post.created_at && " • edited"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge
              variant="secondary"
              className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-700"
            >
              <Music2 className="w-3 h-3 mr-1" />
              {post.genres?.name}
            </Badge>
            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/edit-post/${post.id}`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 p-4 rounded-lg border border-purple-100 dark:border-purple-800">
          <h3 className="text-lg font-semibold music-gradient-text">{post.title}</h3>
          <p className="text-muted-foreground">by {post.artist}</p>
        </div>

        {spotifyId && (
          <div className="w-full rounded-lg overflow-hidden shadow-lg ring-1 ring-purple-200 dark:ring-purple-800">
            <iframe
              src={`https://open.spotify.com/embed/track/${spotifyId}?utm_source=generator&theme=0`}
              width="100%"
              height="152"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              className="rounded-lg"
            />
          </div>
        )}

        <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg border border-purple-100 dark:border-purple-800">
          <p className="text-sm leading-relaxed">{post.explanation}</p>
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag: string, index: number) => (
              <Badge
                key={index}
                variant="outline"
                className="text-xs bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300"
              >
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-purple-100 dark:border-purple-800">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className={`transition-all duration-300 ${isLiked ? "text-red-500 bg-red-50 dark:bg-red-950/50" : "hover:bg-purple-50 dark:hover:bg-purple-950/50"}`}
              onClick={handleLike}
              disabled={isPending}
            >
              <Heart
                className={`w-4 h-4 mr-1 transition-all duration-300 ${isLiked ? "fill-current scale-110" : ""}`}
              />
              {likeCount}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="hover:bg-purple-50 dark:hover:bg-purple-950/50"
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              {post.comments?.length || 0}
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="hover:bg-purple-50 dark:hover:bg-purple-950/50"
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>

        {showComments && (
          <div className="space-y-4 pt-4 border-t border-purple-100 dark:border-purple-800">
            {post.comments?.map((comment: any) => (
              <div key={comment.id} className="flex space-x-3 bg-purple-50/50 dark:bg-purple-950/20 p-3 rounded-lg">
                <Avatar className="h-8 w-8 ring-1 ring-purple-200 dark:ring-purple-800">
                  <AvatarImage src={comment.users?.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-300 to-pink-300 text-white text-xs">
                    {comment.users?.full_name
                      ?.split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium music-gradient-text">{comment.users?.full_name}</p>
                  <p className="text-sm text-muted-foreground">{comment.content}</p>
                </div>
              </div>
            ))}

            <form action={handleComment} className="flex space-x-2">
              <input type="hidden" name="postId" value={post.id} />
              <input type="hidden" name="userId" value={currentUser.id} />
              <Input
                name="content"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 bg-white/50 dark:bg-gray-800/50 border-purple-200 dark:border-purple-800 focus:border-purple-400 dark:focus:border-purple-600"
              />
              <Button type="submit" size="sm" disabled={!newComment.trim()} className="music-button">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
