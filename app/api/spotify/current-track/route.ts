import { type NextRequest, NextResponse } from "next/server"
import { getCurrentlyPlaying, refreshSpotifyToken } from "@/lib/spotify"
import { createServerClient } from "@/lib/supabase"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const authToken = cookieStore.get("auth-token")

    if (!authToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const supabase = createServerClient()
    const { data: user } = await supabase
      .from("users")
      .select("spotify_access_token, spotify_refresh_token, spotify_token_expires_at")
      .eq("id", authToken.value)
      .single()

    if (!user?.spotify_access_token) {
      return NextResponse.json({ error: "Spotify not connected" }, { status: 400 })
    }

    // Check if token is expired
    const now = new Date()
    const expiresAt = new Date(user.spotify_token_expires_at)

    let accessToken = user.spotify_access_token

    if (now >= expiresAt && user.spotify_refresh_token) {
      // Refresh token
      const tokens = await refreshSpotifyToken(user.spotify_refresh_token)
      if (tokens.access_token) {
        accessToken = tokens.access_token
        await supabase
          .from("users")
          .update({
            spotify_access_token: tokens.access_token,
            spotify_token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
          })
          .eq("id", authToken.value)
      }
    }

    const currentTrack = await getCurrentlyPlaying(accessToken)
    return NextResponse.json(currentTrack)
  } catch (error) {
    console.error("Current track error:", error)
    return NextResponse.json({ error: "Failed to get current track" }, { status: 500 })
  }
}
