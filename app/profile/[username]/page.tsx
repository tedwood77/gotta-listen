import { notFound, redirect } from "next/navigation"
import { getUser } from "@/lib/auth"
import { createServerClient } from "@/lib/supabase"
import Navbar from "@/components/navbar"
import ProfileContent from "@/components/profile-content"

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const currentUser = await getUser()
  const { username } = await params

  if (!currentUser) {
    redirect("/")
  }

  const supabase = createServerClient()

  // Get profile user
  const { data: profileUser } = await supabase.from("users").select("*").eq("username", username).single()

  if (!profileUser) {
    notFound()
  }

  // Get current user profile
  const { data: currentUserProfile } = await supabase.from("users").select("*").eq("id", currentUser.id).single()

  // Get user's posts
  const { data: posts } = await supabase
    .from("posts")
    .select(`
      *,
      users!posts_user_id_fkey (
        id,
        username,
        display_name,
        avatar_url
      ),
      likes (count)
    `)
    .eq("user_id", profileUser.id)
    .order("created_at", { ascending: false })

  // Get user's liked posts
  const { data: likedPosts } = await supabase
    .from("likes")
    .select(`
      posts (
        *,
        users!posts_user_id_fkey (
          id,
          username,
          display_name,
          avatar_url
        ),
        likes (count)
      )
    `)
    .eq("user_id", profileUser.id)

  // Check friendship status
  const { data: friendship } = await supabase
    .from("friendships")
    .select("*")
    .or(
      `and(requester_id.eq.${currentUser.id},addressee_id.eq.${profileUser.id}),and(requester_id.eq.${profileUser.id},addressee_id.eq.${currentUser.id})`,
    )
    .single()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={currentUserProfile} />
      <ProfileContent
        profileUser={profileUser}
        currentUser={currentUserProfile}
        posts={posts || []}
        likedPosts={likedPosts?.map((l) => l.posts).filter(Boolean) || []}
        friendship={friendship}
      />
    </div>
  )
}
