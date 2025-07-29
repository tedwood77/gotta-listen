"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Heart,
  MessageCircle,
  Share,
  MapPin,
  Music,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Flag,
  Copy,
} from "lucide-react"
import Link from "next/link"
import MusicEmbed from "./music-embed"
import CommentsSection from "./comments-section"
import ShareDialog from "./share-dialog"
import { likePost, unlikePost, deletePost } from "@/app/actions/posts"

interface PostCardProps {
  post: any
  currentUser: any
  showComments?: boolean
}

export default function PostCard({ post, currentUser, showComments = false }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(post.likes?.[0]?.count || 0)
  const [showCommentsSection, setShowCommentsSection] = useState(showComments)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const isOwnPost = currentUser?.id === post.user_id

  const handleLike = async () => {
    try {
      if (isLiked) {
        await unlikePost(post.id, currentUser.id)
        setLikeCount(likeCount - 1)
      } else {
        await likePost(post.id, currentUser.id)
        setLikeCount(likeCount + 1)
      }
      setIsLiked(!isLiked)
    } catch (error) {
      console.error("Error toggling like:", error)
    }
  }

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      await deletePost(post.id)
      window.location.reload()
    } catch (error) {
      console.error("Error deleting post:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`)
  }

  const handleAddToPlaylist = () => {
    // TODO: Implement add to playlist functionality
    console.log("Add to playlist")
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Link href={`/profile/${post.users.username}`} className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={post.users.avatar_url || "/placeholder.svg"} />
              <AvatarFallback>{post.users.display_name?.charAt(0) || post.users.username?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{post.users.display_name}</p>
              <p className="text-sm text-gray-500">@{post.users.username}</p>
              {(post.users.city || post.users.state_region || post.users.country) && (
                <div className="flex items-center text-xs text-gray-400 mt-1">
                  <MapPin className="w-3 h-3 mr-1" />
                  {[post.users.city, post.users.state_region, post.users.country].filter(Boolean).join(", ")}
                </div>
              )}
            </div>
          </Link>
          <div className="flex items-center space-x-2">
            <div className="text-sm text-gray-500">
              {new Date(post.created_at).toLocaleDateString()}
              {post.edited_at && <span className="text-xs text-gray-400 ml-2">(edited)</span>}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleCopyLink}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsShareDialogOpen(true)}>
                  <Share className="w-4 h-4 mr-2" />
                  Share Post
                </DropdownMenuItem>
                {isOwnPost ? (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={`/post/${post.id}/edit`}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Post
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setIsDeleteDialogOpen(true)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Post
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600 focus:text-red-600">
                      <Flag className="w-4 h-4 mr-2" />
                      Report Post
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Song Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <Music className="w-5 h-5 text-purple-600" />
              <div>
                <h3 className="font-semibold text-lg">{post.title}</h3>
                <p className="text-gray-600">by {post.artist}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleAddToPlaylist}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center space-x-2 mb-3">
            <Badge variant="secondary">{post.genre}</Badge>
            {post.tags?.map((tag: string) => (
              <Badge key={tag} variant="outline">
                #{tag}
              </Badge>
            ))}
          </div>

          {/* Music Platform Embed */}
          {post.spotify_url && <MusicEmbed url={post.spotify_url} title={post.title} artist={post.artist} />}
        </div>

        {/* Explanation */}
        <div>
          <h4 className="font-medium mb-2">Why you gotta listen:</h4>
          <p className="text-gray-700 leading-relaxed">{post.explanation}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={handleLike} className={isLiked ? "text-red-500" : ""}>
              <Heart className={`w-4 h-4 mr-2 ${isLiked ? "fill-current" : ""}`} />
              {likeCount}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowCommentsSection(!showCommentsSection)}>
              <MessageCircle className="w-4 h-4 mr-2" />
              Comment
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsShareDialogOpen(true)}>
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Comments Section - Only show if enabled and currentUser exists */}
        {showCommentsSection && currentUser && <CommentsSection postId={post.id} currentUser={currentUser} />}
      </CardContent>

      {/* Share Dialog */}
      <ShareDialog
        post={post}
        isOpen={isShareDialogOpen}
        onClose={() => setIsShareDialogOpen(false)}
        currentUser={currentUser}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be undone and will remove the post from all
              playlists and delete all comments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isLoading} className="bg-red-600 hover:bg-red-700">
              {isLoading ? "Deleting..." : "Delete Post"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
