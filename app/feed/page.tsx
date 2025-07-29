import { redirect } from "next/navigation"
import { getUser, getUserProfile } from "@/lib/auth"
import { createServerClient } from "@/lib/supabase"
import FeedContent from "@/components/feed-content"
import Navbar from "@/components/navbar"

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const user = await getUser()

  if (!user) {
    redirect("/")
  }

  const userProfile = await getUserProfile(user.id)
  const params = await searchParams

  const supabase = createServerClient()

  // Build query based on filters
  let query = supabase
    .from("posts")
    .select(`
      *,
      users!posts_user_id_fkey (
        id,
        username,
        display_name,
        avatar_url,
        country,
        state_region,
        city
      ),
      likes (count)
    `)
    .order("created_at", { ascending: false })

  // Apply filters
  if (params.genre) {
    query = query.eq("genre", params.genre)
  }

  if (params.country) {
    query = query.eq("users.country", params.country)
  }

  if (params.state) {
    query = query.eq("users.state_region", params.state)
  }

  if (params.city) {
    query = query.eq("users.city", params.city)
  }

  if (params.friends === "true") {
    // Get user's friends
    const { data: friendships } = await supabase
      .from("friendships")
      .select("requester_id, addressee_id")
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
      .eq("status", "accepted")

    const friendIds = friendships?.map((f) => (f.requester_id === user.id ? f.addressee_id : f.requester_id)) || []

    if (friendIds.length > 0) {
      query = query.in("user_id", friendIds)
    } else {
      // No friends, return empty result
      query = query.eq("user_id", "no-friends")
    }
  }

  const { data: posts } = await query

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={userProfile} />
      <FeedContent posts={posts || []} currentUser={userProfile} />
    </div>
  )
}
