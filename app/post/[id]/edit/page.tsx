import { redirect, notFound } from "next/navigation"
import { getUser, getUserProfile } from "@/lib/auth"
import { createServerClient } from "@/lib/supabase"
import Navbar from "@/components/navbar"
import EditPostForm from "@/components/edit-post-form"

export default async function EditPostPage({
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

  // Get the post
  const { data: post, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id) // Ensure user owns the post
    .single()

  if (error || !post) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={userProfile} />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Edit Post</h1>
          <EditPostForm post={post} userId={user.id} />
        </div>
      </div>
    </div>
  )
}
