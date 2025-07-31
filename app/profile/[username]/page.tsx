import { createServerClient } from "@/lib/supabase"
import { requireAuth } from "@/lib/auth"
import { Navigation } from "@/components/navigation"
import { ProfileContent } from "@/components/profile-content"
import { notFound } from "next/navigation"

interface ProfilePageProps {
  params: Promise<{ username: string }>
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params
  const currentUser = await requireAuth()
  const supabase = createServerClient()

  // Get profile user
  const { data: profileUser } = await supabase.from("users").select("*").eq("username", username).single()

  if (!profileUser) {
    notFound()
  }

  const isOwnProfile = currentUser.id === profileUser.id
  const isFriend = await checkFriendship(currentUser.id, profileUser.id, supabase)

  // Get user's posts
  const { data: posts } = await supabase
    .from("posts")
    .select(`
      *,
      users (username, full_name, avatar_url),
      genres (name),
      likes (id),
      comments (id, content, users (username, full_name))
    `)
    .eq("user_id", profileUser.id)
    .order("created_at", { ascending: false })

  // Get friendship status
  const { data: friendship } = await supabase
    .from("friendships")
    .select("*")
    .or(
      `and(requester_id.eq.${currentUser.id},addressee_id.eq.${profileUser.id}),and(requester_id.eq.${profileUser.id},addressee_id.eq.${currentUser.id})`,
    )
    .single()

  // Get user's liked genres
  const { data: likedGenres } = await supabase.from("user_genres").select("genres (name)").eq("user_id", profileUser.id)

  // Get friends count
  const { count: friendsCount } = await supabase
    .from("friendships")
    .select("*", { count: "exact" })
    .or(`requester_id.eq.${profileUser.id},addressee_id.eq.${profileUser.id}`)
    .eq("status", "accepted")

  // Check privacy settings for liked songs
  const canViewLikedSongs =
    isOwnProfile ||
    profileUser.liked_songs_visibility === "public" ||
    (profileUser.liked_songs_visibility === "friends" && isFriend)

  // Check privacy settings for friends list
  const canViewFriends =
    isOwnProfile ||
    profileUser.friends_list_visibility === "public" ||
    (profileUser.friends_list_visibility === "friends" && isFriend)

  // Get liked songs if allowed
  let likedSongs: any[] = []
  if (canViewLikedSongs) {
    const { data } = await supabase
      .from("liked_songs")
      .select(`
        *,
        posts (
          *,
          users (username, full_name, avatar_url),
          genres (name),
          likes (id),
          comments (id, content, users (username, full_name))
        )
      `)
      .eq("user_id", profileUser.id)
      .order("created_at", { ascending: false })

    likedSongs = data || []
  }

  // Get friends if allowed
  let friends: any[] = []
  if (canViewFriends) {
    const { data } = await supabase
      .from("friendships")
      .select(`
        *,
        requester:users!friendships_requester_id_fkey (id, username, full_name, avatar_url),
        addressee:users!friendships_addressee_id_fkey (id, username, full_name, avatar_url)
      `)
      .or(`requester_id.eq.${profileUser.id},addressee_id.eq.${profileUser.id}`)
      .eq("status", "accepted")

    friends = data || []
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={currentUser} />
      <ProfileContent
        profileUser={profileUser}
        currentUser={currentUser}
        posts={posts || []}
        likedSongs={likedSongs}
        friends={friends}
        friendship={friendship}
        likedGenres={likedGenres || []}
        friendsCount={friendsCount || 0}
        canViewFriends={canViewFriends}
        canViewLikedSongs={canViewLikedSongs}
      />
    </div>
  )
}

async function checkFriendship(userId1: string, userId2: string, supabase: any) {
  const { data } = await supabase
    .from("friendships")
    .select("status")
    .or(
      `and(requester_id.eq.${userId1},addressee_id.eq.${userId2}),and(requester_id.eq.${userId2},addressee_id.eq.${userId1})`,
    )
    .eq("status", "accepted")
    .single()

  return !!data
}
