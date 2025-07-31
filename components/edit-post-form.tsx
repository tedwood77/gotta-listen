"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updatePost } from "@/app/actions/posts"
import { FormError } from "@/components/form-error"
import { FormSuccess } from "@/components/form-success"
import { Music, Edit } from "lucide-react"
import { useState, useTransition } from "react"

interface EditPostFormProps {
  user: {
    id: string
    username: string
  }
  post: any
  genres: any[]
}

export function EditPostForm({ user, post, genres }: EditPostFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = async (formData: FormData) => {
    setError(null)
    setSuccess(null)
    startTransition(async () => {
      const result = await updatePost(formData)
      if (result?.error) {
        setError(result.error)
      } else if (result?.success) {
        setSuccess(result.message || "Post updated successfully!")
      }
    })
  }

  return (
    <Card className="music-card shadow-2xl">
      <CardHeader>
        <CardTitle className="flex items-center music-gradient-text">
          <Edit className="w-6 h-6 mr-2" />
          Edit Your Post
        </CardTitle>
      </CardHeader>
      <CardContent>
        <FormError error={error} />
        <FormSuccess message={success} />

        <form action={handleSubmit} className="space-y-6">
          <input type="hidden" name="postId" value={post.id} />
          <input type="hidden" name="userId" value={user.id} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-purple-800 dark:text-purple-200">
                Song Title *
              </Label>
              <Input
                id="title"
                name="title"
                required
                disabled={isPending}
                defaultValue={post.title}
                maxLength={200}
                className="bg-white/50 dark:bg-gray-800/50 border-purple-200 dark:border-purple-800 focus:border-purple-400 dark:focus:border-purple-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="artist" className="text-purple-800 dark:text-purple-200">
                Artist *
              </Label>
              <Input
                id="artist"
                name="artist"
                required
                disabled={isPending}
                defaultValue={post.artist}
                maxLength={200}
                className="bg-white/50 dark:bg-gray-800/50 border-purple-200 dark:border-purple-800 focus:border-purple-400 dark:focus:border-purple-600"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="genre" className="text-purple-800 dark:text-purple-200">
              Genre *
            </Label>
            <Select name="genreId" required defaultValue={post.genre_id?.toString()} disabled={isPending}>
              <SelectTrigger className="bg-white/50 dark:bg-gray-800/50 border-purple-200 dark:border-purple-800 focus:border-purple-400 dark:focus:border-purple-600">
                <SelectValue placeholder="Select a genre" />
              </SelectTrigger>
              <SelectContent>
                {genres?.map((genre) => (
                  <SelectItem key={genre.id} value={genre.id.toString()}>
                    <div className="flex items-center space-x-2">
                      <Music className="w-4 h-4 text-purple-500" />
                      <span>{genre.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="spotifyUrl" className="text-purple-800 dark:text-purple-200">
              Spotify URL (optional)
            </Label>
            <Input
              id="spotifyUrl"
              name="spotifyUrl"
              placeholder="https://open.spotify.com/track/..."
              disabled={isPending}
              defaultValue={post.spotify_url || ""}
              className="bg-white/50 dark:bg-gray-800/50 border-purple-200 dark:border-purple-800 focus:border-purple-400 dark:focus:border-purple-600"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="explanation" className="text-purple-800 dark:text-purple-200">
              Why is this song worth listening to? *
            </Label>
            <Textarea
              id="explanation"
              name="explanation"
              rows={4}
              placeholder="Share what makes this song special..."
              required
              disabled={isPending}
              defaultValue={post.explanation}
              minLength={10}
              className="bg-white/50 dark:bg-gray-800/50 border-purple-200 dark:border-purple-800 focus:border-purple-400 dark:focus:border-purple-600"
            />
            <p className="text-xs text-muted-foreground">At least 10 characters required</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags" className="text-purple-800 dark:text-purple-200">
              Tags (comma-separated)
            </Label>
            <Input
              id="tags"
              name="tags"
              placeholder="indie, chill, summer, vocals"
              disabled={isPending}
              defaultValue={post.tags?.join(", ") || ""}
              className="bg-white/50 dark:bg-gray-800/50 border-purple-200 dark:border-purple-800 focus:border-purple-400 dark:focus:border-purple-600"
            />
          </div>

          <div className="flex space-x-4">
            <Button type="submit" className="flex-1 music-button" disabled={isPending}>
              <Edit className="w-4 h-4 mr-2" />
              {isPending ? "Updating..." : "Update Post"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={() => window.history.back()}
              disabled={isPending}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
