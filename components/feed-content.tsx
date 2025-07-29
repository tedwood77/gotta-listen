"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useRouter } from "next/navigation"
import PostCard from "./post-card"
import GoogleAdSpace from "./google-ad-space"
import AdPolicyBanner from "./ad-policy-banner"
import { countries } from "@/lib/locations"

interface FeedContentProps {
  posts: any[]
  currentUser: any
}

const genres = [
  "All",
  "Rock",
  "Pop",
  "Hip Hop",
  "Electronic",
  "Jazz",
  "Classical",
  "Country",
  "R&B",
  "Indie",
  "Alternative",
  "Folk",
  "Reggae",
  "Blues",
  "Metal",
]

export default function FeedContent({ posts, currentUser }: FeedContentProps) {
  const router = useRouter()
  const [selectedGenre, setSelectedGenre] = useState("All")
  const [selectedLocation, setSelectedLocation] = useState("All")
  const [showFriendsOnly, setShowFriendsOnly] = useState(false)

  const handleFilterChange = (type: string, value: string) => {
    const params = new URLSearchParams()

    if (type === "genre" && value !== "All") {
      params.set("genre", value)
    }

    if (type === "location" && value !== "All") {
      const [country, state, city] = value.split("|")
      if (country) params.set("country", country)
      if (state) params.set("state", state)
      if (city) params.set("city", city)
    }

    if (type === "friends") {
      params.set("friends", "true")
    }

    router.push(`/feed?${params.toString()}`)
  }

  // Insert Google Ads at strategic positions
  const postsWithAds = []

  // Top leaderboard ad (728x90)
  postsWithAds.push(<GoogleAdSpace key="ad-top" adSlot="1234567890" position="feed-top" adFormat="horizontal" />)

  // Add posts with ads interspersed
  posts.forEach((post, index) => {
    postsWithAds.push(<PostCard key={post.id} post={post} currentUser={currentUser} />)

    // Medium rectangle ad after 3rd post (336x280)
    if (index === 2) {
      postsWithAds.push(
        <GoogleAdSpace key="ad-middle" adSlot="2345678901" position="feed-middle" adFormat="rectangle" />,
      )
    }

    // Bottom leaderboard ad after 7th post (728x90)
    if (index === 6) {
      postsWithAds.push(
        <GoogleAdSpace key="ad-bottom" adSlot="3456789012" position="feed-bottom" adFormat="horizontal" />,
      )
    }

    // Additional medium rectangle ads every 8 posts
    if (index > 6 && (index - 6) % 8 === 0) {
      postsWithAds.push(
        <GoogleAdSpace key={`ad-recurring-${index}`} adSlot="4567890123" position="feed-middle" adFormat="rectangle" />,
      )
    }
  })

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        {/* Mobile banner ad (320x50) */}
        <GoogleAdSpace adSlot="5678901234" position="mobile-banner" adFormat="horizontal" />

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <div className="w-64 space-y-6">
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Filters</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Genre</label>
                  <Select onValueChange={(value) => handleFilterChange("genre", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Genres" />
                    </SelectTrigger>
                    <SelectContent>
                      {genres.map((genre) => (
                        <SelectItem key={genre} value={genre}>
                          {genre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Location</label>
                  <Select onValueChange={(value) => handleFilterChange("location", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Locations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Locations</SelectItem>
                      {countries.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  variant={showFriendsOnly ? "default" : "outline"}
                  className="w-full"
                  onClick={() => {
                    setShowFriendsOnly(!showFriendsOnly)
                    if (!showFriendsOnly) {
                      handleFilterChange("friends", "true")
                    } else {
                      router.push("/feed")
                    }
                  }}
                >
                  Friends Only
                </Button>
              </CardContent>
            </Card>

            {/* Sidebar medium rectangle ad (300x250) */}
            <GoogleAdSpace adSlot="6789012345" position="sidebar" adFormat="rectangle" />
          </div>

          {/* Main Feed */}
          <div className="flex-1 space-y-6">
            {posts.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-gray-500 mb-4">No posts found with current filters</p>
                  <Link href="/post/new">
                    <Button>Share Your First Song</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              postsWithAds
            )}
          </div>
        </div>
      </div>

      {/* Ad Policy Banner */}
      <AdPolicyBanner />
    </>
  )
}
