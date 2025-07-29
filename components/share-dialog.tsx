"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Copy, ExternalLink, Repeat, MessageSquare, Check } from "lucide-react"
import { sharePost } from "@/app/actions/posts"

interface ShareDialogProps {
  post: any
  isOpen: boolean
  onClose: () => void
  currentUser: any
}

export default function ShareDialog({ post, isOpen, onClose, currentUser }: ShareDialogProps) {
  const [shareComment, setShareComment] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const postUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/post/${post.id}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(postUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy link:", error)
    }
  }

  const handleRepost = async () => {
    setIsLoading(true)
    try {
      await sharePost(post.id, currentUser.id, "repost", null)
      onClose()
    } catch (error) {
      console.error("Error reposting:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuotePost = async () => {
    if (!shareComment.trim()) return

    setIsLoading(true)
    try {
      await sharePost(post.id, currentUser.id, "quote", shareComment)
      onClose()
      setShareComment("")
    } catch (error) {
      console.error("Error quote posting:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExternalShare = (platform: string) => {
    const text = `Check out this song: ${post.title} by ${post.artist} - ${post.explanation.slice(0, 100)}...`
    const url = postUrl

    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      reddit: `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
    }

    window.open(shareUrls[platform as keyof typeof shareUrls], "_blank", "width=600,height=400")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Share Post</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="internal" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="internal">Share on Gotta Listen</TabsTrigger>
            <TabsTrigger value="external">Share Externally</TabsTrigger>
          </TabsList>

          <TabsContent value="internal" className="space-y-4">
            {/* Original Post Preview */}
            <Card className="bg-gray-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-purple-600">
                      {post.users.display_name?.charAt(0) || post.users.username?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{post.users.display_name}</p>
                    <p className="text-xs text-gray-500">@{post.users.username}</p>
                  </div>
                </div>
                <div className="mb-2">
                  <h4 className="font-semibold">{post.title}</h4>
                  <p className="text-sm text-gray-600">by {post.artist}</p>
                </div>
                <p className="text-sm text-gray-700">{post.explanation.slice(0, 150)}...</p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Button onClick={handleRepost} disabled={isLoading} className="flex items-center justify-center">
                <Repeat className="w-4 h-4 mr-2" />
                {isLoading ? "Reposting..." : "Repost"}
              </Button>
              <Button variant="outline" className="flex items-center justify-center bg-transparent">
                <MessageSquare className="w-4 h-4 mr-2" />
                Quote Post
              </Button>
            </div>

            {/* Quote Post Form */}
            <div className="space-y-3">
              <Textarea
                placeholder="Add your thoughts about this song..."
                value={shareComment}
                onChange={(e) => setShareComment(e.target.value)}
                rows={3}
              />
              <Button onClick={handleQuotePost} disabled={isLoading || !shareComment.trim()} className="w-full">
                {isLoading ? "Sharing..." : "Share with Comment"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="external" className="space-y-4">
            {/* Copy Link */}
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={postUrl}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
              />
              <Button onClick={handleCopyLink} variant="outline">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>

            {/* Social Media Platforms */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => handleExternalShare("twitter")}
                className="flex items-center justify-center"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Twitter
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExternalShare("facebook")}
                className="flex items-center justify-center"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Facebook
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExternalShare("linkedin")}
                className="flex items-center justify-center"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                LinkedIn
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExternalShare("reddit")}
                className="flex items-center justify-center"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Reddit
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExternalShare("whatsapp")}
                className="flex items-center justify-center"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExternalShare("telegram")}
                className="flex items-center justify-center"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Telegram
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
