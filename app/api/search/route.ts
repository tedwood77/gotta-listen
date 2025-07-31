import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")
  const type = searchParams.get("type") || "all"

  if (!query) {
    return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
  }

  const supabase = createServerClient()

  try {
    const results: any = {}

    if (type === "all" || type === "posts") {
      const { data: posts } = await supabase
        .from("posts")
        .select(`
          *,
          users (username, full_name, avatar_url),
          genres (name)
        `)
        .or(`title.ilike.%${query}%,artist.ilike.%${query}%,explanation.ilike.%${query}%`)
        .order("created_at", { ascending: false })
        .limit(10)

      results.posts = posts
    }

    if (type === "all" || type === "users") {
      const { data: users } = await supabase
        .from("users")
        .select("id, username, full_name, avatar_url")
        .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
        .limit(10)

      results.users = users
    }

    if (type === "all" || type === "genres") {
      const { data: genres } = await supabase.from("genres").select("*").ilike("name", `%${query}%`).limit(10)

      results.genres = genres
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json({ error: "Search failed" }, { status: 500 })
  }
}
