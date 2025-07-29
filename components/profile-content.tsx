"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Music, Users, Heart } from "lucide-react"
import PostCard from "./post-card"
import GoogleAdSpace from "./google-ad-space"

interface ProfileContentProps {
  profileUser: any
  currentUser: any
  posts: any[]
  likedPosts: any[]
  friendship: any
}

export default function ProfileContent({
  profileUser,
  currentUser,
  posts,
  likedPosts,
  friendship,
}: ProfileContentProps) {
  const [friendshipStatus, setFriendshipStatus] = useState(friendship?.status || null)
  const isOwnProfile = currentUser.id === profileUser.id

  const handleFriendAction = async () => {
    // TODO: Implement friend request functionality
    console.log("Friend action")
  }

  const getFriendButtonText = () => {
    if (isOwnProfile) return null
    if (!friendshipStatus) return "Add Friend"
    if (friendshipStatus === "pending") return "Request Sent"
    if (friendshipStatus === "accepted") return "Friends"
    return "Add Friend"
  }

  // Add Google Ads to posts
  const postsWithAds = []
  posts.forEach((post, index) => {
    postsWithAds.push(<PostCard key={post.id} post={post} currentUser={currentUser} />)

    // Add ad after every 5 posts
    if ((index + 1) % 5 === 0) {
      postsWithAds.push(
        <GoogleAdSpace key={`profile-ad-${index}`} adSlot="7890123456" position="feed-middle" adFormat="rectangle" />,
      )
    }
  })

  const likedPostsWithAds = []
  likedPosts.forEach((post, index) => {
    likedPostsWithAds.push(<PostCard key={post.id} post={post} currentUser={currentUser} />)

    // Add ad after every 5 posts
    if ((index + 1) % 5 === 0) {
      likedPostsWithAds.push(
        <GoogleAdSpace key={`liked-ad-${index}`} adSlot="8901234567" position="feed-middle" adFormat="rectangle" />,
      )
    }
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Top Leaderboard Ad */}
        <GoogleAdSpace adSlot="9012345678" position="profile-top" adFormat="horizontal" />

        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={profileUser.avatar_url || "/placeholder.svg"} />
                <AvatarFallback className="text-2xl">
                  {profileUser.display_name?.charAt(0) || profileUser.username?.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold">{profileUser.display_name}</h1>
                    <p className="text-gray-600">@{profileUser.username}</p>
                  </div>

                  {!isOwnProfile && <Button onClick={handleFriendAction}>{getFriendButtonText()}</Button>}
                </div>

                {profileUser.bio && <p className="text-gray-700 mb-4">{profileUser.bio}</p>}

                <div className="flex items-center space-x-6 text-sm text-gray-500 mb-4">
                  {(profileUser.city || profileUser.state_region || profileUser.country) && (
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {[profileUser.city, profileUser.state_region, profileUser.country].filter(Boolean).join(", ")}
                    </div>
                  )}
                  <div className="flex items-center">
                    <Music className="w-4 h-4 mr-1" />
                    {posts.length} posts
                  </div>
                  <div className="flex items-center">
                    <Heart className="w-4 h-4 mr-1" />
                    {likedPosts.length} likes
                  </div>
                </div>

                {profileUser.favorite_genres && profileUser.favorite_genres.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Favorite Genres:</p>
                    <div className="flex flex-wrap gap-2">
                      {profileUser.favorite_genres.map((genre: string) => (
                        <Badge key={genre} variant="secondary">
                          {genre}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Tabs */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="posts">Posts ({posts.length})</TabsTrigger>
            <TabsTrigger value="liked">Liked ({likedPosts.length})</TabsTrigger>
            <TabsTrigger value="friends">Friends</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-6 mt-6">
            {posts.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Music className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">{isOwnProfile ? "You haven't shared any songs yet" : "No posts yet"}</p>
                </CardContent>
              </Card>
            ) : (
              postsWithAds
            )}
          </TabsContent>

          <TabsContent value="liked" className="space-y-6 mt-6">
            {likedPosts.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {isOwnProfile ? "You haven't liked any songs yet" : "No liked songs yet"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              likedPostsWithAds
            )}
          </TabsContent>

          <TabsContent value="friends" className="mt-6">
            <Card>
              <CardContent className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Friends feature coming soon!</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
