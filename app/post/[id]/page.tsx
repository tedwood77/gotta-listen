import { redirect, notFound } from "next/navigation"
import { getUser, getUserProfile } from "@/lib/auth"
import { createServerClient } from "@/lib/supabase"
import Navbar from "@/components/navbar"
import PostCard from "@/components/post-card"

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await getUser()
  const { id } = await params

  if (!user) {
    redirect("/")
  }

  const userProfile = await getUserProfile(user.id)
  const supabase = createServerClient()

  // Get the post with user info
  const { data: post, error } = await supabase
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
    .eq("id", id)
    .single()

  if (error || !post) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={userProfile} />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <PostCard post={post} currentUser={userProfile} showComments={true} />
        </div>
      </div>
    </div>
  )
}
