import { requireAuth } from "@/lib/auth"
import { Navigation } from "@/components/navigation"
import { FeedContent } from "@/components/feed-content"
import { createServerClient } from "@/lib/supabase"

export default async function FeedPage() {
  const user = await requireAuth()
  const supabase = createServerClient()

  // Get initial posts
  const { data: posts } = await supabase
    .from("posts")
    .select(`
      *,
      users (username, full_name, avatar_url, country, state, city),
      genres (name),
      likes (id, user_id),
      comments (id, content, users (username, full_name))
    `)
    .order("created_at", { ascending: false })
    .limit(20)

  // Get genres for filtering
  const { data: genres } = await supabase.from("genres").select("*").order("name")

  // Check if user has Spotify connected
  const { data: userData } = await supabase.from("users").select("spotify_access_token").eq("id", user.id).single()
  const isSpotifyConnected = !!userData?.spotify_access_token

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={user} />
      <FeedContent
        user={user}
        initialPosts={posts || []}
        genres={genres || []}
        isSpotifyConnected={isSpotifyConnected}
      />
    </div>
  )
}
