export const musicPlatforms = {
  spotify: {
    name: "Spotify",
    color: "#1DB954",
    icon: "🎵",
    urlPattern: /^https:\/\/open\.spotify\.com\/(track|album|playlist|artist)\/([a-zA-Z0-9]+)/,
    embedPattern: (id: string, type: string) => {
      if (type === "track") return `https://open.spotify.com/embed/track/${id}?utm_source=generator`
      if (type === "album") return `https://open.spotify.com/embed/album/${id}?utm_source=generator`
      if (type === "playlist") return `https://open.spotify.com/embed/playlist/${id}?utm_source=generator`
      return null
    },
  },
  apple_music: {
    name: "Apple Music",
    color: "#FA243C",
    icon: "🍎",
    urlPattern: /^https:\/\/music\.apple\.com\/([a-z]{2})\/(song|album|playlist)\/([^/]+)\/([0-9]+)/,
    embedPattern: (id: string, country = "us") => `https://embed.music.apple.com/${country}/album/${id}`,
  },
  youtube_music: {
    name: "YouTube Music",
    color: "#FF0000",
    icon: "📺",
    urlPattern: /^https:\/\/music\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
    embedPattern: (id: string) => `https://www.youtube.com/embed/${id}`,
  },
  soundcloud: {
    name: "SoundCloud",
    color: "#FF5500",
    icon: "☁️",
    urlPattern: /^https:\/\/soundcloud\.com\/([^/]+)\/([^/]+)/,
    embedPattern: (url: string) =>
      `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true`,
  },
  bandcamp: {
    name: "Bandcamp",
    color: "#629AA0",
    icon: "🎪",
    urlPattern: /^https:\/\/([^.]+)\.bandcamp\.com\/(track|album)\/([^/]+)/,
    embedPattern: (url: string, type: string) => {
      const match = url.match(/https:\/\/([^.]+)\.bandcamp\.com\/(track|album)\/([^/]+)/)
      if (match) {
        const [, artist, itemType, slug] = match
        return `https://bandcamp.com/EmbeddedPlayer/${itemType}=${slug}/size=large/bgcol=ffffff/linkcol=0687f5/tracklist=false/artwork=small/transparent=true/`
      }
      return null
    },
  },
  tidal: {
    name: "Tidal",
    color: "#000000",
    icon: "🌊",
    urlPattern: /^https:\/\/tidal\.com\/(browse\/)?(track|album|playlist)\/([0-9]+)/,
    embedPattern: (id: string, type: string) => `https://embed.tidal.com/${type}s/${id}`,
  },
}

export function detectMusicPlatform(url: string) {
  for (const [platform, config] of Object.entries(musicPlatforms)) {
    if (config.urlPattern.test(url)) {
      return { platform, config }
    }
  }
  return null
}

export function extractMusicId(url: string, platform: string) {
  const config = musicPlatforms[platform as keyof typeof musicPlatforms]
  if (!config) return null

  const match = url.match(config.urlPattern)
  if (!match) return null

  switch (platform) {
    case "spotify":
      return { id: match[2], type: match[1] }
    case "apple_music":
      return { id: match[4], country: match[1], type: match[2] }
    case "youtube_music":
      return { id: match[1], type: "video" }
    case "soundcloud":
      return { url, type: "track" }
    case "bandcamp":
      return { artist: match[1], type: match[2], slug: match[3] }
    case "tidal":
      return { id: match[3], type: match[2] }
    default:
      return null
  }
}
