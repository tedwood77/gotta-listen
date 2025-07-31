import { requireAuth } from "@/lib/auth"
import { Navigation } from "@/components/navigation"
import { CreatePostForm } from "@/components/create-post-form"
import { createServerClient } from "@/lib/supabase"

interface CreatePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function CreatePage({ searchParams }: CreatePageProps) {
  const user = await requireAuth()
  const params = await searchParams
  const supabase = createServerClient()

  // Get genres
  const { data: genres } = await supabase.from("genres").select("*").order("name")

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={user} />
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6 music-gradient-text">Share a Song Worth Hearing</h1>
          <CreatePostForm user={user} spotifyData={params} genres={genres || []} />
        </div>
      </div>
    </div>
  )
}
