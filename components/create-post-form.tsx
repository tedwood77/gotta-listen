"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createPost } from "@/app/actions/posts"
import { FormError } from "@/components/form-error"
import { Music, Sparkles } from "lucide-react"
import { useState, useTransition } from "react"

interface CreatePostFormProps {
  user: {
    id: string
    username: string
  }
  spotifyData?: { [key: string]: string | string[] | undefined }
  genres: any[]
}

export function CreatePostForm({ user, spotifyData, genres }: CreatePostFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const spotifyUrl = (spotifyData?.spotify as string) || ""
  const defaultTitle = (spotifyData?.title as string) || ""
  const defaultArtist = (spotifyData?.artist as string) || ""

  const handleSubmit = async (formData: FormData) => {
    setError(null)
    startTransition(async () => {
      const result = await createPost(formData)
      if (result?.error) {
        setError(result.error)
      }
    })
  }

  return (
    <Card className="music-card shadow-2xl">
      <CardHeader>
        <CardTitle className="flex items-center music-gradient-text">
          <Sparkles className="w-6 h-6 mr-2" />
          Share Your Musical Discovery
        </CardTitle>
      </CardHeader>
      <CardContent>
        <FormError error={error} />

        <form action={handleSubmit} className="space-y-6">
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
                defaultValue={defaultTitle}
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
                defaultValue={defaultArtist}
                maxLength={200}
                className="bg-white/50 dark:bg-gray-800/50 border-purple-200 dark:border-purple-800 focus:border-purple-400 dark:focus:border-purple-600"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="genre" className="text-purple-800 dark:text-purple-200">
              Genre *
            </Label>
            <Select name="genreId" required disabled={isPending}>
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
              defaultValue={spotifyUrl}
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
              className="bg-white/50 dark:bg-gray-800/50 border-purple-200 dark:border-purple-800 focus:border-purple-400 dark:focus:border-purple-600"
            />
          </div>

          <Button type="submit" className="w-full music-button" disabled={isPending}>
            <Music className="w-4 h-4 mr-2" />
            {isPending ? "Sharing Song..." : "Share Song"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
