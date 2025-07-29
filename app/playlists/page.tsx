import { redirect } from "next/navigation"
import { getUser, getUserProfile } from "@/lib/auth"
import { createServerClient } from "@/lib/supabase"
import Navbar from "@/components/navbar"
import PlaylistsContent from "@/components/playlists-content"

export default async function PlaylistsPage() {
  const user = await getUser()

  if (!user) {
    redirect("/")
  }

  const userProfile = await getUserProfile(user.id)
  const supabase = createServerClient()

  // Get user's playlists
  const { data: playlists } = await supabase
    .from("playlists")
    .select(`
      *,
      playlist_tracks (
        id,
        posts (
          id,
          title,
          artist,
          genre,
          spotify_url
        )
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={userProfile} />
      <PlaylistsContent currentUser={userProfile} playlists={playlists || []} />
    </div>
  )
}
