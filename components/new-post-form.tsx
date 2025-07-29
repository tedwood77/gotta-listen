"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Globe, Users, Lock, ExternalLink } from "lucide-react"
import { createPost } from "@/app/actions/posts"
import { musicPlatforms, detectMusicPlatform } from "@/lib/music-platforms"

const genres = [
  "Rock",
  "Pop",
  "Hip Hop",
  "Electronic",
  "Jazz",
  "Classical",
  "Country",
  "R&B",
  "Indie",
  "Alternative",
  "Folk",
  "Reggae",
  "Blues",
  "Metal",
]

interface NewPostFormProps {
  userId: string
}

export default function NewPostForm({ userId }: NewPostFormProps) {
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [musicUrl, setMusicUrl] = useState("")
  const [detectedPlatform, setDetectedPlatform] = useState<any>(null)

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleMusicUrlChange = (url: string) => {
    setMusicUrl(url)
    const platform = detectMusicPlatform(url)
    setDetectedPlatform(platform)
  }

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)

    // Add tags to form data
    formData.append("tags", JSON.stringify(tags))
    formData.append("userId", userId)

    try {
      await createPost(formData)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Share a Song Worth Listening To</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Song Title</Label>
              <Input id="title" name="title" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="artist">Artist</Label>
              <Input id="artist" name="artist" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="genre">Genre</Label>
            <Select name="genre" required>
              <SelectTrigger>
                <SelectValue placeholder="Select a genre" />
              </SelectTrigger>
              <SelectContent>
                {genres.map((genre) => (
                  <SelectItem key={genre} value={genre}>
                    {genre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="visibility">Post Visibility</Label>
            <Select name="visibility" defaultValue="public" required>
              <SelectTrigger>
                <SelectValue placeholder="Select visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Public - Everyone can see
                  </div>
                </SelectItem>
                <SelectItem value="friends">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Friends Only
                  </div>
                </SelectItem>
                <SelectItem value="private">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Private - Only you can see
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="musicUrl">Music Platform URL</Label>
            <Input
              id="musicUrl"
              name="musicUrl"
              value={musicUrl}
              onChange={(e) => handleMusicUrlChange(e.target.value)}
              placeholder="Paste link from Spotify, Apple Music, YouTube Music, SoundCloud, Bandcamp, or Tidal..."
            />
            {detectedPlatform && (
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-green-600">✓ Detected:</span>
                <span style={{ color: detectedPlatform.config.color }}>
                  {detectedPlatform.config.icon} {detectedPlatform.config.name}
                </span>
                <Button asChild variant="ghost" size="sm">
                  <a href={musicUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </Button>
              </div>
            )}
            <div className="text-sm text-gray-500">
              <p className="mb-2">Supported platforms:</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(musicPlatforms).map(([key, platform]) => (
                  <Badge key={key} variant="outline" className="text-xs">
                    {platform.icon} {platform.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex space-x-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addTag()
                  }
                }}
              />
              <Button type="button" onClick={addTag} variant="outline">
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    #{tag}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => removeTag(tag)} />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="explanation">Why should people listen to this?</Label>
            <Textarea
              id="explanation"
              name="explanation"
              rows={6}
              placeholder="Share what makes this song special, the story behind it, or why it resonates with you..."
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Sharing..." : "Share Song"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
