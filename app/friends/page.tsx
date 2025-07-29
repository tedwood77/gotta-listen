import { redirect } from "next/navigation"
import { getUser, getUserProfile } from "@/lib/auth"
import { createServerClient } from "@/lib/supabase"
import Navbar from "@/components/navbar"
import FriendsContent from "@/components/friends-content"

export default async function FriendsPage() {
  const user = await getUser()

  if (!user) {
    redirect("/")
  }

  const userProfile = await getUserProfile(user.id)
  const supabase = createServerClient()

  // Get friend requests (incoming)
  const { data: incomingRequests } = await supabase
    .from("friendships")
    .select(`
      *,
      users!friendships_requester_id_fkey (
        id,
        username,
        display_name,
        avatar_url,
        country,
        state_region,
        city
      )
    `)
    .eq("addressee_id", user.id)
    .eq("status", "pending")

  // Get sent requests (outgoing)
  const { data: outgoingRequests } = await supabase
    .from("friendships")
    .select(`
      *,
      users!friendships_addressee_id_fkey (
        id,
        username,
        display_name,
        avatar_url,
        country,
        state_region,
        city
      )
    `)
    .eq("requester_id", user.id)
    .eq("status", "pending")

  // Get accepted friends
  const { data: friendships } = await supabase
    .from("friendships")
    .select(`
      *,
      requester:users!friendships_requester_id_fkey (
        id,
        username,
        display_name,
        avatar_url,
        country,
        state_region,
        city,
        privacy_settings
      ),
      addressee:users!friendships_addressee_id_fkey (
        id,
        username,
        display_name,
        avatar_url,
        country,
        state_region,
        city,
        privacy_settings
      )
    `)
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
    .eq("status", "accepted")

  // Transform friends data to get the other user
  const friends = friendships?.map((friendship) => {
    const friend = friendship.requester_id === user.id ? friendship.addressee : friendship.requester
    return {
      ...friendship,
      friend,
    }
  })

  // Get suggested friends (users with mutual friends or similar music taste)
  const { data: suggestedFriends } = await supabase
    .from("users")
    .select("id, username, display_name, avatar_url, country, state_region, city, favorite_genres")
    .neq("id", user.id)
    .limit(10)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={userProfile} />
      <FriendsContent
        currentUser={userProfile}
        incomingRequests={incomingRequests || []}
        outgoingRequests={outgoingRequests || []}
        friends={friends || []}
        suggestedFriends={suggestedFriends || []}
      />
    </div>
  )
}
