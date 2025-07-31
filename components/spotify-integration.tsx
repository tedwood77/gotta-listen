"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Music, ExternalLink, Plus, RefreshCw } from "lucide-react"
import { getSpotifyAuthUrl } from "@/lib/spotify"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

interface SpotifyIntegrationProps {
  isConnected: boolean
}

export function SpotifyIntegration({ isConnected }: SpotifyIntegrationProps) {
  const [currentTrack, setCurrentTrack] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (isConnected) {
      fetchCurrentTrack()
      const interval = setInterval(fetchCurrentTrack, 30000) // Check every 30 seconds
      return () => clearInterval(interval)
    }
  }, [isConnected])

  const fetchCurrentTrack = async () => {
    try {
      const response = await fetch("/api/spotify/current-track")
      if (response.ok) {
        const data = await response.json()
        setCurrentTrack(data)
      } else if (response.status === 401) {
        toast({
          title: "Spotify Connection Lost",
          description: "Please reconnect your Spotify account.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to fetch current track:", error)
    }
  }

  const handleConnect = () => {
    setLoading(true)
    window.location.href = getSpotifyAuthUrl()
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchCurrentTrack()
    setRefreshing(false)
    toast({
      title: "Refreshed!",
      description: "Current track updated.",
    })
  }

  if (!isConnected) {
    return (
      <Card className="music-card shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center music-gradient-text">
            <Music className="w-5 h-5 mr-2" />
            Connect Spotify
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Connect your Spotify account to quickly share what you're currently listening to!
          </p>
          <Button onClick={handleConnect} disabled={loading} className="music-button w-full">
            <ExternalLink className="w-4 h-4 mr-2" />
            {loading ? "Connecting..." : "Connect Spotify"}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="music-card shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between music-gradient-text">
          <div className="flex items-center">
            <Music className="w-5 h-5 mr-2" />
            Now Playing
          </div>
          <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={refreshing} className="h-8 w-8 p-0">
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {currentTrack && currentTrack.item ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              {currentTrack.item.album?.images?.[0] && (
                <img
                  src={currentTrack.item.album.images[0].url || "/placeholder.svg"}
                  alt={currentTrack.item.album.name}
                  className="w-12 h-12 rounded-lg shadow-md"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{currentTrack.item.name}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {currentTrack.item.artists?.map((artist: any) => artist.name).join(", ")}
                </p>
              </div>
            </div>

            {currentTrack.is_playing && (
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                Playing
              </Badge>
            )}

            <Link
              href={`/create?spotify=${encodeURIComponent(currentTrack.item.external_urls.spotify)}&title=${encodeURIComponent(currentTrack.item.name)}&artist=${encodeURIComponent(currentTrack.item.artists?.[0]?.name || "")}`}
            >
              <Button size="sm" className="music-button w-full">
                <Plus className="w-4 h-4 mr-2" />
                Share This Song
              </Button>
            </Link>
          </div>
        ) : (
          <div className="text-center py-4">
            <Music className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No track currently playing</p>
            <p className="text-xs text-muted-foreground mt-1">Start playing music on Spotify to see it here</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
