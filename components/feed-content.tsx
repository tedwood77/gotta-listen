"use client"

import { useState, useEffect } from "react"
import { PostCard } from "./post-card"
import { FeedFilters } from "./feed-filters"
import { AdSenseAd } from "./adsense-ad"
import { SpotifyIntegration } from "./spotify-integration"
import { getSupabaseClient } from "@/lib/supabase"

interface FeedContentProps {
  user: {
    id: string
    username: string
    full_name: string
    country?: string
    state?: string
    city?: string
  }
  initialPosts: any[]
  genres: any[]
  isSpotifyConnected: boolean
}

export function FeedContent({ user, initialPosts, genres, isSpotifyConnected }: FeedContentProps) {
  const [posts, setPosts] = useState(initialPosts)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    feedType: "global",
    location: "all",
    genres: [] as string[],
  })

  const supabase = getSupabaseClient()

  useEffect(() => {
    fetchFilteredPosts()
  }, [filters])

  const fetchFilteredPosts = async () => {
    setLoading(true)
    try {
      let query = supabase.from("posts").select(`
          *,
          users (username, full_name, avatar_url, country, state, city),
          genres (name),
          likes (id, user_id),
          comments (id, content, users (username, full_name))
        `)

      // Apply feed type filter
      if (filters.feedType === "friends") {
        // Get user's friends first
        const { data: friendships } = await supabase
          .from("friendships")
          .select("requester_id, addressee_id")
          .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
          .eq("status", "accepted")

        const friendIds = friendships?.map((f) => (f.requester_id === user.id ? f.addressee_id : f.requester_id)) || []

        if (friendIds.length > 0) {
          query = query.in("user_id", [...friendIds, user.id])
        } else {
          query = query.eq("user_id", user.id)
        }
      }

      // Apply location filter
      if (filters.location !== "all" && user.country) {
        if (filters.location === "country") {
          query = query.eq("users.country", user.country)
        } else if (filters.location === "state" && user.state) {
          query = query.eq("users.state", user.state)
        } else if (filters.location === "city" && user.city) {
          query = query.eq("users.city", user.city)
        }
      }

      // Apply genre filter
      if (filters.genres.length > 0) {
        query = query.in(
          "genre_id",
          filters.genres.map((id) => Number.parseInt(id)),
        )
      }

      const { data: filteredPosts } = await query.order("created_at", { ascending: false }).limit(20)

      setPosts(filteredPosts || [])
    } catch (error) {
      console.error("Error fetching filtered posts:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <SpotifyIntegration isConnected={isSpotifyConnected} />
          <FeedFilters genres={genres} onFilterChange={setFilters} />

          {/* Stylish Sidebar Ad - Only on desktop */}
          <div className="hidden lg:block">
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 p-1">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-xl"></div>
              <div className="relative bg-white/80 dark:bg-gray-900/80 rounded-lg p-2">
                <AdSenseAd
                  adSlot="2345678901"
                  adFormat="auto"
                  style={{ display: "block", width: "280px", minHeight: "250px" }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading posts...</p>
            </div>
          )}

          {!loading &&
            posts.map((post, index) => (
              <div key={post.id}>
                <PostCard post={post} currentUser={user} />

                {/* Stylish In-Feed Ad - Every 6 posts (less frequent) */}
                {(index + 1) % 6 === 0 && (
                  <div className="my-8">
                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 p-4">
                      <div className="absolute top-2 left-2 text-xs text-purple-600 dark:text-purple-400 font-medium">
                        Sponsored
                      </div>
                      <div className="mt-4">
                        <AdSenseAd
                          adSlot="3456789012"
                          adFormat="auto"
                          style={{ display: "block", minHeight: "200px", width: "100%" }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

          {!loading && posts.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎵</div>
              <h3 className="text-lg font-semibold mb-2">No posts found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or check back later!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
