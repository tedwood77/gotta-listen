"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Music, Play, Share, MoreHorizontal, Trash2 } from "lucide-react"
import { createPlaylist } from "@/app/actions/playlists"
import AdSpace from "./ad-space"

interface PlaylistsContentProps {
  currentUser: any
  playlists: any[]
}

export default function PlaylistsContent({ currentUser, playlists }: PlaylistsContentProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleCreatePlaylist = async (formData: FormData) => {
    setIsLoading(true)
    try {
      formData.append("userId", currentUser.id)
      await createPlaylist(formData)
      setIsCreateDialogOpen(false)
    } finally {
      setIsLoading(false)
    }
  }

  // Add ads to playlists
  const playlistsWithAds = []
  playlists.forEach((playlist, index) => {
    playlistsWithAds.push(
      <Card key={playlist.id} className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg mb-2">{playlist.name}</CardTitle>
              {playlist.description && <p className="text-sm text-gray-600 mb-3">{playlist.description}</p>}
              <div className="flex items-center space-x-2">
                <Badge variant={playlist.is_public ? "default" : "secondary"}>
                  {playlist.is_public ? "Public" : "Private"}
                </Badge>
                <span className="text-sm text-gray-500">{playlist.playlist_tracks?.length || 0} songs</span>
              </div>
            </div>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {playlist.playlist_tracks && playlist.playlist_tracks.length > 0 ? (
            <div className="space-y-2 mb-4">
              {playlist.playlist_tracks.slice(0, 3).map((track: any) => (
                <div key={track.id} className="flex items-center space-x-3 text-sm">
                  <Music className="w-4 h-4 text-gray-400" />
                  <div className="flex-1 truncate">
                    <span className="font-medium">{track.posts.title}</span>
                    <span className="text-gray-500 ml-2">by {track.posts.artist}</span>
                  </div>
                </div>
              ))}
              {playlist.playlist_tracks.length > 3 && (
                <p className="text-sm text-gray-500">+{playlist.playlist_tracks.length - 3} more songs</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500 mb-4">No songs added yet</p>
          )}

          <div className="flex space-x-2">
            <Button size="sm" className="flex-1">
              <Play className="w-4 h-4 mr-2" />
              Play
            </Button>
            <Button variant="outline" size="sm">
              <Share className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>,
    )

    // Add ad after every 4 playlists
    if ((index + 1) % 4 === 0) {
      playlistsWithAds.push(<AdSpace key={`playlist-ad-${index}`} position="feed-middle" />)
    }
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Top Ad */}
        <AdSpace position="feed-top" />

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">My Playlists</h1>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Playlist
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Playlist</DialogTitle>
              </DialogHeader>
              <form action={handleCreatePlaylist} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Playlist Name</Label>
                  <Input id="name" name="name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea id="description" name="description" rows={3} />
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="isPublic" name="isPublic" defaultChecked />
                  <Label htmlFor="isPublic">Make playlist public</Label>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Playlist"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {playlists.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Music className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">You haven't created any playlists yet</p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Playlist
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{playlistsWithAds}</div>
        )}
      </div>
    </div>
  )
}
