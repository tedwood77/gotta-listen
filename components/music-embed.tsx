"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"
import { detectMusicPlatform, extractMusicId } from "@/lib/music-platforms"

interface MusicEmbedProps {
  url: string
  title: string
  artist: string
}

export default function MusicEmbed({ url, title, artist }: MusicEmbedProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [embedError, setEmbedError] = useState(false)

  if (!url) return null

  const platformInfo = detectMusicPlatform(url)
  if (!platformInfo) return null

  const { platform, config } = platformInfo
  const musicData = extractMusicId(url, platform)

  const getEmbedUrl = () => {
    if (!musicData) return null

    switch (platform) {
      case "spotify":
        return config.embedPattern(musicData.id, musicData.type)
      case "apple_music":
        return config.embedPattern(musicData.id, musicData.country)
      case "youtube_music":
        return config.embedPattern(musicData.id)
      case "soundcloud":
        return config.embedPattern(musicData.url)
      case "bandcamp":
        return config.embedPattern(url, musicData.type)
      case "tidal":
        return config.embedPattern(musicData.id, musicData.type)
      default:
        return null
    }
  }

  const embedUrl = getEmbedUrl()

  const renderEmbed = () => {
    if (embedError || !embedUrl) {
      return (
        <Card className="p-6 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="text-2xl">{config.icon}</div>
            <div>
              <h4 className="font-semibold">{title}</h4>
              <p className="text-sm text-gray-600">by {artist}</p>
            </div>
          </div>
          <Button asChild variant="outline">
            <a href={url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              Listen on {config.name}
            </a>
          </Button>
        </Card>
      )
    }

    switch (platform) {
      case "spotify":
        return (
          <iframe
            src={embedUrl}
            width="100%"
            height="152"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="rounded-lg"
            onError={() => setEmbedError(true)}
          />
        )

      case "apple_music":
        return (
          <iframe
            src={embedUrl}
            width="100%"
            height="150"
            frameBorder="0"
            allow="autoplay *; encrypted-media *; fullscreen *"
            className="rounded-lg"
            onError={() => setEmbedError(true)}
          />
        )

      case "youtube_music":
        return (
          <iframe
            src={embedUrl}
            width="100%"
            height="200"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="rounded-lg"
            onError={() => setEmbedError(true)}
          />
        )

      case "soundcloud":
        return (
          <iframe
            src={embedUrl}
            width="100%"
            height="166"
            frameBorder="0"
            allow="autoplay"
            className="rounded-lg"
            onError={() => setEmbedError(true)}
          />
        )

      case "bandcamp":
        return (
          <iframe
            src={embedUrl}
            width="100%"
            height="120"
            frameBorder="0"
            className="rounded-lg"
            onError={() => setEmbedError(true)}
          />
        )

      case "tidal":
        return (
          <div className="bg-black rounded-lg p-4 text-white text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="text-2xl">{config.icon}</div>
              <div>
                <h4 className="font-semibold">{title}</h4>
                <p className="text-sm text-gray-300">by {artist}</p>
              </div>
            </div>
            <Button asChild variant="secondary">
              <a href={url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Listen on Tidal
              </a>
            </Button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium" style={{ color: config.color }}>
            {config.icon} {config.name}
          </span>
        </div>
        <Button asChild variant="ghost" size="sm">
          <a href={url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4" />
          </a>
        </Button>
      </div>
      {renderEmbed()}
    </div>
  )
}
