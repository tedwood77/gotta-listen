import { requireAuth } from "@/lib/auth"
import { Navigation } from "@/components/navigation"
import { EditPostForm } from "@/components/edit-post-form"
import { createServerClient } from "@/lib/supabase"
import { notFound, redirect } from "next/navigation"

interface EditPostPageProps {
  params: Promise<{ id: string }>
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params
  const user = await requireAuth()
  const supabase = createServerClient()

  // Get the post and verify ownership
  const { data: post } = await supabase
    .from("posts")
    .select(`
      *,
      genres (id, name)
    `)
    .eq("id", id)
    .single()

  if (!post) {
    notFound()
  }

  if (post.user_id !== user.id) {
    redirect("/feed")
  }

  // Get all genres
  const { data: genres } = await supabase.from("genres").select("*").order("name")

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={user} />
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6 music-gradient-text">Edit Your Post</h1>
          <EditPostForm user={user} post={post} genres={genres || []} />
        </div>
      </div>
    </div>
  )
}
